/* ══════════════════════════════════════════════════
   FinCalc Pro — Market Dashboard Page
   Renders and updates the NSE/BSE live market view.
   ══════════════════════════════════════════════════ */

function renderMarket() {
  document.getElementById("appMain").innerHTML = `
    <div class="market-page">
      <h1>📊 Live Market Dashboard</h1>
      <p style="color:var(--text-secondary);margin-bottom:32px">NSE &amp; BSE live indices · <span id="mktTs">—</span></p>

      <div class="market-grid">
        ${["nifty","sensex","bankNifty","niftyIT"].map(k => `
          <div class="market-card">
            <div class="market-card-header">
              <div>
                <div class="market-card-label" id="mk-exch-${k}">—</div>
                <div class="market-card-name"  id="mk-name-${k}">Loading…</div>
              </div>
              <div class="market-card-exch" id="mk-badge-${k}">—</div>
            </div>
            <div class="market-card-value"  id="mk-val-${k}">—</div>
            <div class="market-card-change" id="mk-chg-${k}">—</div>
            <div class="market-ohlc">
              <div class="ohlc-item"><div class="ohlc-label">Open</div><div class="ohlc-val" id="mk-o-${k}">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">High</div><div class="ohlc-val" id="mk-h-${k}" style="color:#22c55e">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">Low</div> <div class="ohlc-val" id="mk-l-${k}" style="color:#ef4444">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">Prev</div><div class="ohlc-val" id="mk-p-${k}">—</div></div>
            </div>
            <div style="margin-top:16px;height:80px">
              <canvas data-spark="${k}" style="width:100%;height:80px"></canvas>
            </div>
          </div>
        `).join("")}
      </div>

      <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:18px">Precious Metals</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Gold 24K</div></div>
            <div class="market-card-exch" style="background:rgba(245,158,11,0.1);color:#f59e0b">MCX</div>
          </div>
          <div class="market-card-value" id="mktG24">—</div>
          <div class="market-card-change" id="mktG24ch">—</div>
        </div>
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Silver</div></div>
            <div class="market-card-exch" style="background:rgba(148,163,184,0.1);color:#94a3b8">MCX</div>
          </div>
          <div class="market-card-value" id="mktSilver">—</div>
        </div>
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Platinum</div></div>
            <div class="market-card-exch" style="background:rgba(167,139,250,0.1);color:#a78bfa">MCX</div>
          </div>
          <div class="market-card-value" id="mktPlatinum">—</div>
        </div>
      </div>
    </div>
  `;

  if (marketData) updateMarketPage(marketData);
}

function updateMarketPage(d) {
  if (!d?.indices) return;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s("mktTs", d.ts);

  Object.entries(d.indices).forEach(([k, idx]) => {
    s(`mk-exch-${k}`,  idx.exchange);
    s(`mk-name-${k}`,  idx.label);
    s(`mk-badge-${k}`, idx.exchange);
    s(`mk-val-${k}`,   fmt(idx.value, 2));
    s(`mk-o-${k}`,     fmt(idx.open, 2));
    s(`mk-h-${k}`,     fmt(idx.high, 2));
    s(`mk-l-${k}`,     fmt(idx.low,  2));
    s(`mk-p-${k}`,     fmt(idx.prev, 2));

    const chEl = document.getElementById(`mk-chg-${k}`);
    if (chEl) {
      const up = idx.change >= 0;
      chEl.textContent = `${up ? "▲" : "▼"} ${Math.abs(idx.change).toFixed(2)} (${Math.abs(idx.changePct).toFixed(2)}%)`;
      chEl.className   = "market-card-change " + (up ? "up" : "down");
    }

    document.querySelectorAll(`[data-spark="${k}"]`).forEach(canvas => {
      if (idx.spark) FinCharts.drawSparkline(canvas, idx.spark, FinCharts.colorFor(idx.color));
    });
  });

  const g = d.gold;
  s("mktG24",      "₹" + fmt(g.g24) + "/g");
  s("mktSilver",   "₹" + fmt(g.silver, 2) + "/g");
  s("mktPlatinum", "₹" + fmt(g.platinum) + "/g");

  const gch = document.getElementById("mktG24ch");
  if (gch) {
    gch.textContent = g.ch24 >= 0 ? `▲ ₹${Math.abs(g.ch24)} (+${g.chp24}%)` : `▼ ₹${Math.abs(g.ch24)} (${g.chp24}%)`;
    gch.className   = "market-card-change " + (g.ch24 >= 0 ? "up" : "down");
  }
}
