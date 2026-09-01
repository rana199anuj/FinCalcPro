/* ── FinCalc Pro — WebSocket & Client-Side Live Market Engine ── */
(function () {
  let ws = null;
  let fallbackInterval = null;
  let retryCount = 0;
  const MAX_RETRY = 2;

  // ─── Base Market State (aligned with server.py) ───
  const base = {
    nifty:     { value: 24080.40, open: 24180.00, high: 24250.55, low: 23984.60, prev: 24347.60 },
    sensex:    { value: 76957.27, open: 79800.00, high: 80100.00, low: 79100.00, prev: 79468.01 },
    bankNifty: { value: 51650.80, open: 51800.00, high: 52100.00, low: 51420.00, prev: 51880.00 },
    niftyIT:   { value: 39456.50, open: 39600.00, high: 39820.00, low: 39100.00, prev: 39650.00 },
    gold24k:   { value: 15692.0,  prev: 15839.0 },
    gold22k:   { value: 14385.0,  prev: 14520.0 },
    gold20k:   { value: 13077.0,  prev: 13200.0 },
    gold18k:   { value: 11773.0,  prev: 11883.0 },
    silver:    { value: 105.50,   prev: 104.80 },
    platinum:  { value: 2950.0,   prev: 2930.0 }
  };

  const hist = { nifty: [], sensex: [], bankNifty: [], niftyIT: [], gold: [] };
  Object.keys(hist).forEach(k => {
    const src = k === 'gold' ? base.gold24k : base[k];
    for (let i = 0; i < 30; i++) hist[k].push(src.value);
  });

  function isStockMarketOpen() {
    // NSE/BSE: Mon-Fri, 09:15–15:30 IST
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const mins = ist.getHours() * 60 + ist.getMinutes();
    return mins >= 555 && mins <= 930;
  }

  function isGoldMarketOpen() {
    // MCX: Mon-Fri, 09:00–23:30 IST
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const mins = ist.getHours() * 60 + ist.getMinutes();
    return mins >= 540 && mins <= 1410;
  }

  function rw(v, vol = 0.0004) {
    return +(v + v * vol * (Math.random() - 0.5) * 2).toFixed(2);
  }

  function snapIdx(key, vol, isOpen) {
    if (isOpen) {
      base[key].value = rw(base[key].value, vol);
      if (base[key].value > base[key].high) base[key].high = base[key].value;
      if (base[key].value < base[key].low)  base[key].low  = base[key].value;
    }
    hist[key].push(base[key].value);
    if (hist[key].length > 30) hist[key].shift();

    return {
      value: base[key].value,
      change: +(base[key].value - base[key].prev).toFixed(2),
      changePct: +((base[key].value - base[key].prev) / base[key].prev * 100).toFixed(2),
      open: base[key].open, high: base[key].high, low: base[key].low, prev: base[key].prev
    };
  }

  function buildPayload() {
    const stockOpen = isStockMarketOpen();
    const goldOpen  = isGoldMarketOpen();

    if (goldOpen) {
      base.gold24k.value = rw(base.gold24k.value, 0.0002);
      base.gold22k.value = +(base.gold24k.value * 0.9167).toFixed(0);
      base.gold20k.value = +(base.gold24k.value * 0.8333).toFixed(0);
      base.gold18k.value = +(base.gold24k.value * 0.75).toFixed(0);
      base.silver.value  = rw(base.silver.value, 0.0008);
      base.platinum.value= rw(base.platinum.value, 0.0004);
    }
    hist.gold.push(base.gold24k.value);
    if (hist.gold.length > 30) hist.gold.shift();

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const tsStr = ist.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    return {
      type: 'market',
      ts: tsStr,
      marketOpen: stockOpen,
      indices: {
        nifty:     { label:'Nifty 50',   exchange:'NSE', color:'blue',   ...snapIdx('nifty',     0.0005, stockOpen), spark:[...hist.nifty] },
        sensex:    { label:'Sensex',     exchange:'BSE', color:'orange', ...snapIdx('sensex',    0.0005, stockOpen), spark:[...hist.sensex] },
        bankNifty: { label:'Bank Nifty', exchange:'NSE', color:'purple', ...snapIdx('bankNifty', 0.0006, stockOpen), spark:[...hist.bankNifty] },
        niftyIT:   { label:'Nifty IT',   exchange:'NSE', color:'teal',   ...snapIdx('niftyIT',   0.0007, stockOpen), spark:[...hist.niftyIT] }
      },
      gold: {
        g24: base.gold24k.value, g22: base.gold22k.value, g20: base.gold20k.value, g18: base.gold18k.value,
        g24_10: base.gold24k.value * 10, g22_10: base.gold22k.value * 10,
        ch24:  +(base.gold24k.value - base.gold24k.prev).toFixed(0),
        chp24: +((base.gold24k.value - base.gold24k.prev) / base.gold24k.prev * 100).toFixed(2),
        silver: base.silver.value, platinum: base.platinum.value,
        chSilver:  +(base.silver.value - base.silver.prev).toFixed(2),
        chpSilver: +((base.silver.value - base.silver.prev) / base.silver.prev * 100).toFixed(2),
        chPlat:    +(base.platinum.value - base.platinum.prev).toFixed(2),
        chpPlat:   +((base.platinum.value - base.platinum.prev) / base.platinum.prev * 100).toFixed(2),
        spark: [...hist.gold]
      }
    };
  }

  function startClientEngine() {
    if (fallbackInterval) return;
    document.dispatchEvent(new CustomEvent('ws:open'));
    document.dispatchEvent(new CustomEvent('ws:market', { detail: buildPayload() }));
    fallbackInterval = setInterval(() => {
      document.dispatchEvent(new CustomEvent('ws:market', { detail: buildPayload() }));
    }, 3000);
  }

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/ws`;

    try {
      ws = new WebSocket(url);
    } catch (e) {
      startClientEngine();
      return;
    }

    ws.addEventListener('open', () => {
      retryCount = 0;
      if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; }
      document.dispatchEvent(new CustomEvent('ws:open'));
    });

    ws.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        document.dispatchEvent(new CustomEvent('ws:market', { detail: data }));
      } catch (_) {}
    });

    ws.addEventListener('close', () => {
      if (retryCount < MAX_RETRY) {
        retryCount++;
        setTimeout(connect, 1500);
      } else {
        // Fallback to client-side market engine when deployed statically on Vercel/Netlify/Hostinger
        startClientEngine();
      }
    });

    ws.addEventListener('error', () => {
      ws.close();
    });
  }

  window.addEventListener('load', () => setTimeout(connect, 150));
})();
