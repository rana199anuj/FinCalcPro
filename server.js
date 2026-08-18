const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.static(path.join(__dirname, 'public')));

// ─── Market Base Values ───────────────────────────────────────────────────────
const base = {
  nifty:    { value: 24853.15, open: 24780.00, high: 24920.60, low: 24710.30, prev: 24725.75 },
  sensex:   { value: 81463.09, open: 81520.00, high: 81780.00, low: 81200.00, prev: 81506.29 },
  bankNifty:{ value: 53420.80, open: 53300.00, high: 53650.00, low: 53100.00, prev: 53250.00 },
  niftyIT:  { value: 40125.50, open: 40000.00, high: 40300.00, low: 39850.00, prev: 39980.00 },
  gold24k:  { value: 9420,  prev: 9395 },
  gold22k:  { value: 8635,  prev: 8612 },
  gold20k:  { value: 7850,  prev: 7830 },
  gold18k:  { value: 7065,  prev: 7048 },
  silver:   { value: 105.50, prev: 104.80 },
  platinum: { value: 2950,   prev: 2930 }
};

// Sparkline history (last 30 ticks)
const hist = { nifty: [], sensex: [], bankNifty: [], niftyIT: [], gold: [] };
Object.keys(hist).forEach(k => {
  const src = k === 'gold' ? base.gold24k : base[k];
  for (let i = 0; i < 30; i++) hist[k].push(+(src.value + (Math.random() - 0.5) * src.value * 0.002).toFixed(2));
});

function rw(v, vol = 0.0004) { return +(v + v * vol * (Math.random() - 0.5) * 2).toFixed(2); }

function buildPayload() {
  return {
    type: 'market',
    ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    indices: {
      nifty:     { label:'Nifty 50',   exchange:'NSE', color:'blue',   ...snapIdx('nifty',   0.0005), spark:[...hist.nifty]    },
      sensex:    { label:'Sensex',     exchange:'BSE', color:'orange',  ...snapIdx('sensex',  0.0005), spark:[...hist.sensex]   },
      bankNifty: { label:'Bank Nifty', exchange:'NSE', color:'purple', ...snapIdx('bankNifty',0.0006), spark:[...hist.bankNifty]},
      niftyIT:   { label:'Nifty IT',   exchange:'NSE', color:'teal',   ...snapIdx('niftyIT', 0.0007), spark:[...hist.niftyIT]  }
    },
    gold: {
      g24: base.gold24k.value, g22: base.gold22k.value, g20: base.gold20k.value, g18: base.gold18k.value,
      g24_10: base.gold24k.value * 10, g22_10: base.gold22k.value * 10,
      ch24:  +(base.gold24k.value - base.gold24k.prev).toFixed(0),
      chp24: +((base.gold24k.value - base.gold24k.prev) / base.gold24k.prev * 100).toFixed(2),
      silver: base.silver.value, platinum: base.platinum.value,
      spark: [...hist.gold]
    }
  };
}

function snapIdx(key, vol) {
  base[key].value = rw(base[key].value, vol);
  if (base[key].value > base[key].high) base[key].high = base[key].value;
  if (base[key].value < base[key].low)  base[key].low  = base[key].value;
  hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].push(base[key].value);
  if (hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].length > 30)
    hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].shift();
  return {
    value: base[key].value,
    change: +(base[key].value - base[key].prev).toFixed(2),
    changePct: +((base[key].value - base[key].prev) / base[key].prev * 100).toFixed(2),
    open: base[key].open, high: base[key].high, low: base[key].low, prev: base[key].prev
  };
}

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(json); });
}

// Update gold with nifty (linked)
setInterval(() => {
  base.gold24k.value = rw(base.gold24k.value, 0.0002);
  base.gold22k.value = +(base.gold24k.value * 0.9167).toFixed(0);
  base.gold20k.value = +(base.gold24k.value * 0.8333).toFixed(0);
  base.gold18k.value = +(base.gold24k.value * 0.75).toFixed(0);
  base.silver.value  = rw(base.silver.value, 0.0008);
  base.platinum.value= rw(base.platinum.value, 0.0004);
  hist.gold.push(base.gold24k.value);
  if (hist.gold.length > 30) hist.gold.shift();
  broadcast(buildPayload());
}, 3000);

wss.on('connection', ws => {
  console.log('[WS] Client connected');
  ws.send(JSON.stringify(buildPayload()));
  ws.on('close', () => console.log('[WS] Client disconnected'));
  ws.on('error', console.error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅  FinCalc Pro  →  http://localhost:${PORT}`);
  console.log(`📡  WebSocket    →  ws://localhost:${PORT}/ws`);
  console.log(`📊  Broadcasting live market data every 3s\n`);
});
