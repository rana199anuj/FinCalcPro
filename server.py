"""
FinCalc Pro — FastAPI + WebSocket Server (Python)
Replaces server.js (Node.js/Express/ws)

Run:
    pip install -r requirements.txt
    python server.py
"""

import asyncio
import json
import math
import random
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles

# ─── App Setup ────────────────────────────────────────────────────────────────
# Force UTF-8 output on Windows to avoid cp1252 emoji encoding errors
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


PUBLIC_DIR = Path(__file__).parent / "public"

# ─── Market Base Values ────────────────────────────────────────────────────────
base = {
    "nifty":     {"value": 24080.40, "open": 24180.00, "high": 24250.55, "low": 23984.60, "prev": 24347.60},
    "sensex":    {"value": 76957.27, "open": 79800.00, "high": 80100.00, "low": 79100.00, "prev": 79468.01},
    "bankNifty": {"value": 51650.80, "open": 51800.00, "high": 52100.00, "low": 51420.00, "prev": 51880.00},
    "niftyIT":   {"value": 39456.50, "open": 39600.00, "high": 39820.00, "low": 39100.00, "prev": 39650.00},
    "gold24k":   {"value": 15692.0,  "prev": 15839.0},
    "gold22k":   {"value": 14385.0,  "prev": 14520.0},
    "gold20k":   {"value": 13077.0,  "prev": 13200.0},
    "gold18k":   {"value": 11773.0,  "prev": 11883.0},
    "silver":    {"value": 105.50,   "prev": 104.80},
    "platinum":  {"value": 2950.0,   "prev": 2930.0},
}

# Sparkline history — last 30 ticks per index
def _init_hist(key: str) -> list:
    src = base["gold24k"] if key == "gold" else base[key]
    return [
        round(src["value"] + (random.random() - 0.5) * src["value"] * 0.002, 2)
        for _ in range(30)
    ]

hist = {
    "nifty":     _init_hist("nifty"),
    "sensex":    _init_hist("sensex"),
    "bankNifty": _init_hist("bankNifty"),
    "niftyIT":   _init_hist("niftyIT"),
    "gold":      _init_hist("gold"),
}

# Key → hist bucket map
_HIST_MAP = {
    "nifty":     "nifty",
    "sensex":    "sensex",
    "bankNifty": "bankNifty",
    "niftyIT":   "niftyIT",
}

# ─── Connected WebSocket Clients ───────────────────────────────────────────────
clients: set[WebSocket] = set()


# ─── Market Hours Check (IST) ─────────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

def is_market_open() -> bool:
    """NSE/BSE: Mon-Fri, 09:15–15:30 IST only."""
    now = datetime.now(IST)
    if now.weekday() >= 5:          # Saturday=5, Sunday=6
        return False
    market_open  = now.replace(hour=9,  minute=15, second=0, microsecond=0)
    market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return market_open <= now <= market_close


# ─── Random Walk ───────────────────────────────────────────────────────────────
def rw(v: float, vol: float = 0.0004) -> float:
    return round(v + v * vol * (random.random() - 0.5) * 2, 2)


# ─── Snap Index (update price + history) ───────────────────────────────────────
def snap_idx(key: str, vol: float) -> dict:
    # Only apply random walk during market hours
    if is_market_open():
        base[key]["value"] = rw(base[key]["value"], vol)
        if base[key]["value"] > base[key]["high"]:
            base[key]["high"] = base[key]["value"]
        if base[key]["value"] < base[key]["low"]:
            base[key]["low"] = base[key]["value"]

    bucket = _HIST_MAP[key]
    hist[bucket].append(base[key]["value"])
    if len(hist[bucket]) > 30:
        hist[bucket].pop(0)

    return {
        "value":     base[key]["value"],
        "change":    round(base[key]["value"] - base[key]["prev"], 2),
        "changePct": round((base[key]["value"] - base[key]["prev"]) / base[key]["prev"] * 100, 2),
        "open":      base[key]["open"],
        "high":      base[key]["high"],
        "low":       base[key]["low"],
        "prev":      base[key]["prev"],
    }


# ─── Build Market Payload ──────────────────────────────────────────────────────
def build_payload() -> dict:
    now = datetime.now(IST).strftime("%I:%M:%S %p")
    market_open = is_market_open()
    return {
        "type": "market",
        "ts":   now,
        "marketOpen": market_open,
        "indices": {
            "nifty":     {"label": "Nifty 50",   "exchange": "NSE", "color": "blue",   **snap_idx("nifty",     0.0005), "spark": list(hist["nifty"])},
            "sensex":    {"label": "Sensex",      "exchange": "BSE", "color": "orange", **snap_idx("sensex",    0.0005), "spark": list(hist["sensex"])},
            "bankNifty": {"label": "Bank Nifty",  "exchange": "NSE", "color": "purple", **snap_idx("bankNifty", 0.0006), "spark": list(hist["bankNifty"])},
            "niftyIT":   {"label": "Nifty IT",    "exchange": "NSE", "color": "teal",   **snap_idx("niftyIT",   0.0007), "spark": list(hist["niftyIT"])},
        },
        "gold": {
            "g24":    base["gold24k"]["value"],
            "g22":    base["gold22k"]["value"],
            "g20":    base["gold20k"]["value"],
            "g18":    base["gold18k"]["value"],
            "g24_10": base["gold24k"]["value"] * 10,
            "g22_10": base["gold22k"]["value"] * 10,
            "ch24":   round(base["gold24k"]["value"] - base["gold24k"]["prev"], 0),
            "chp24":  round((base["gold24k"]["value"] - base["gold24k"]["prev"]) / base["gold24k"]["prev"] * 100, 2),
            "silver":   base["silver"]["value"],
            "platinum": base["platinum"]["value"],
            # Silver & Platinum changes
            "chSilver":  round(base["silver"]["value"]   - base["silver"]["prev"],   2),
            "chpSilver": round((base["silver"]["value"]  - base["silver"]["prev"])  / base["silver"]["prev"]  * 100, 2),
            "chPlat":    round(base["platinum"]["value"] - base["platinum"]["prev"], 2),
            "chpPlat":   round((base["platinum"]["value"]- base["platinum"]["prev"]) / base["platinum"]["prev"] * 100, 2),
            "spark":  list(hist["gold"]),
        },
    }


# ─── Update Gold Prices (called every 3s) ─────────────────────────────────────
def update_gold():
    # Only apply random walk ticks during market/commodity hours
    # Gold/silver MCX: Mon-Fri 9:00 AM - 11:30 PM IST (extended hours)
    now = datetime.now(IST)
    mcx_open  = now.replace(hour=9,  minute=0,  second=0, microsecond=0)
    mcx_close = now.replace(hour=23, minute=30, second=0, microsecond=0)
    mcx_live  = (now.weekday() < 5) and (mcx_open <= now <= mcx_close)

    if mcx_live:
        base["gold24k"]["value"]  = rw(base["gold24k"]["value"], 0.0002)
        base["gold22k"]["value"]  = round(base["gold24k"]["value"] * 0.9167, 0)
        base["gold20k"]["value"]  = round(base["gold24k"]["value"] * 0.8333, 0)
        base["gold18k"]["value"]  = round(base["gold24k"]["value"] * 0.75,   0)
        base["silver"]["value"]   = rw(base["silver"]["value"],   0.0008)
        base["platinum"]["value"] = rw(base["platinum"]["value"], 0.0004)

    hist["gold"].append(base["gold24k"]["value"])
    if len(hist["gold"]) > 30:
        hist["gold"].pop(0)


# ─── Broadcast to All Clients ──────────────────────────────────────────────────
async def broadcast(payload: dict):
    if not clients:
        return
    message = json.dumps(payload)
    dead = set()
    for ws in list(clients):
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    clients.difference_update(dead)


# ─── Live External Market Data Fetcher (yfinance) ───────────────────────────
def _fetch_external_quotes_sync():
    try:
        import yfinance as yf
        symbols = {
            "nifty": "^NSEI",
            "sensex": "^BSESN",
            "bankNifty": "^NSEBANK",
            "niftyIT": "^CNXIT"
        }
        tickers = yf.Tickers(" ".join(symbols.values()))
        results = {}
        for key, sym in symbols.items():
            try:
                t = tickers.tickers.get(sym)
                if not t: continue
                fi = t.fast_info
                last_price = getattr(fi, "last_price", None)
                prev_close = getattr(fi, "previous_close", None)
                open_val   = getattr(fi, "open", None)
                high_val   = getattr(fi, "day_high", None)
                low_val    = getattr(fi, "day_low", None)
                if last_price and last_price > 0:
                    results[key] = {
                        "value": round(float(last_price), 2),
                        "prev": round(float(prev_close or last_price), 2),
                        "open": round(float(open_val or last_price), 2),
                        "high": round(float(high_val or last_price), 2),
                        "low": round(float(low_val or last_price), 2),
                    }
            except Exception:
                continue
        return results
    except Exception as e:
        print(f"[LIVE] External fetch warning: {e}")
        return {}

async def live_data_sync_loop():
    loop = asyncio.get_running_loop()
    while True:
        try:
            # Run yfinance in threadpool executor so it never blocks the async WebSocket loop
            live_quotes = await loop.run_in_executor(None, _fetch_external_quotes_sync)
            if live_quotes:
                for key, data in live_quotes.items():
                    if key in base:
                        base[key]["value"] = data["value"]
                        base[key]["prev"]  = data["prev"]
                        base[key]["open"]  = data["open"]
                        base[key]["high"]  = max(base[key]["high"], data["high"])
                        base[key]["low"]   = min(base[key]["low"], data["low"])
                print(f"[LIVE DATA] Refreshed from live exchanges: Nifty={base['nifty']['value']} | Sensex={base['sensex']['value']}")
        except Exception as e:
            print(f"[LIVE DATA] Fetch error: {e}")
        # Refresh live external market data every 60 seconds
        await asyncio.sleep(60)

# ─── Background Market Broadcaster (every 3 seconds) ──────────────────────────
async def market_broadcaster():
    while True:
        await asyncio.sleep(3)
        update_gold()
        payload = build_payload()
        await broadcast(payload)


# ─── Startup: launch broadcaster and live sync tasks ──────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    broadcaster_task = asyncio.create_task(market_broadcaster())
    live_sync_task = asyncio.create_task(live_data_sync_loop())
    print("\n[OK]  FinCalc Pro  ->  http://localhost:3000")
    print("[WS]  WebSocket    ->  ws://localhost:3000/ws")
    print("[LIVE] Real live market sync enabled (NSE / BSE via yfinance)")
    print("[>>]  Broadcasting live market data every 3s\n")
    yield
    # Shutdown
    broadcaster_task.cancel()
    live_sync_task.cancel()

app = FastAPI(title="FinCalc Pro", lifespan=lifespan)


# ─── WebSocket Endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print("[WS] Client connected")
    # Send initial payload immediately
    try:
        await websocket.send_text(json.dumps(build_payload()))
        while True:
            # Keep connection alive; client can send pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        print("[WS] Client disconnected")
    except Exception:
        pass
    finally:
        clients.discard(websocket)


# ─── Static Files (serve public/ at root) ─────────────────────────────────────
# Must be mounted AFTER websocket route
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=3000,
        reload=False,
        log_level="warning",
    )
