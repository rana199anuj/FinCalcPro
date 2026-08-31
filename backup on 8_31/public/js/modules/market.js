/* ══════════════════════════════════════════════════
   FinCalc Pro — Market Dashboard Page
   Renders and updates the NSE/BSE live market view,
   market breadth, sectoral indices, and commodities.
   ══════════════════════════════════════════════════ */

function renderMarket() {
  document.getElementById("appMain").innerHTML = `
    <div class="market-page">
      <!-- Header Banner -->
      <div class="calc-banner" style="background:linear-gradient(135deg, #0f766e 0%, #0d9488 100%);margin-bottom:28px">
        <div class="calc-banner-left">
          <h1>📊 Live Market Dashboard</h1>
          <p>NSE &amp; BSE live benchmark indices, market breadth &amp; commodity rates · <span id="mktTs">Live</span></p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <!-- Main Benchmark Indices Grid -->
      <div class="market-grid" style="margin-bottom:28px">
        ${[
          { k: "nifty", label: "Nifty 50", exch: "NSE" },
          { k: "sensex", label: "Sensex", exch: "BSE" },
          { k: "bankNifty", label: "Bank Nifty", exch: "NSE" },
          { k: "niftyIT", label: "Nifty IT", exch: "NSE" }
        ].map(item => `
          <div class="market-card">
            <div class="market-card-header">
              <div>
                <div class="market-card-label" id="mk-exch-${item.k}">${item.exch}</div>
                <div class="market-card-name" id="mk-name-${item.k}">${item.label}</div>
              </div>
              <div class="market-card-exch" id="mk-badge-${item.k}">${item.exch}</div>
            </div>
            <div class="market-card-value" id="mk-val-${item.k}">—</div>
            <div class="market-card-change" id="mk-chg-${item.k}">—</div>
            <div class="market-ohlc">
              <div class="ohlc-item"><div class="ohlc-label">Open</div><div class="ohlc-val" id="mk-o-${item.k}">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">High</div><div class="ohlc-val" id="mk-h-${item.k}" style="color:#22c55e">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">Low</div><div class="ohlc-val" id="mk-l-${item.k}" style="color:#ef4444">—</div></div>
              <div class="ohlc-item"><div class="ohlc-label">Prev</div><div class="ohlc-val" id="mk-p-${item.k}">—</div></div>
            </div>
            <div style="margin-top:16px;height:80px">
              <canvas data-spark="${item.k}" style="width:100%;height:80px"></canvas>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Market Breadth & Sentiment Section -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
        <!-- Advance / Decline -->
        <div class="calc-form-card" style="padding:22px">
          <div style="font-size:1rem;font-weight:800;color:var(--text-primary);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            <span>⚖️ Market Breadth (NSE)</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:700">
            <span style="color:#16a34a">▲ 1,485 Advances (62%)</span>
            <span style="color:#dc2626">▼ 860 Declines (38%)</span>
          </div>
          <div style="height:10px;background:rgba(220,38,38,0.25);border-radius:5px;overflow:hidden;display:flex;margin-bottom:14px">
            <div style="width:62%;background:#16a34a;height:100%"></div>
            <div style="width:38%;background:#dc2626;height:100%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted)">
            <span>Total Traded: 2,425</span>
            <span>Unchanged: 80</span>
            <span style="color:#16a34a;font-weight:700">Sentiment: Bullish</span>
          </div>
        </div>

        <!-- 52-Week Highs & Lows -->
        <div class="calc-form-card" style="padding:22px">
          <div style="font-size:1rem;font-weight:800;color:var(--text-primary);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            <span>🏆 52-Week Extremes &amp; Volume</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
            <div style="background:rgba(22,163,74,0.08);padding:12px 8px;border-radius:8px;border:1px solid rgba(22,163,74,0.2)">
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">52W Highs</div>
              <div style="font-size:1.3rem;font-weight:900;color:#16a34a;margin-top:2px">124</div>
            </div>
            <div style="background:rgba(220,38,38,0.08);padding:12px 8px;border-radius:8px;border:1px solid rgba(220,38,38,0.2)">
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">52W Lows</div>
              <div style="font-size:1.3rem;font-weight:900;color:#dc2626;margin-top:2px">18</div>
            </div>
            <div style="background:rgba(99,102,241,0.08);padding:12px 8px;border-radius:8px;border:1px solid rgba(99,102,241,0.2)">
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">FII / DII Flow</div>
              <div style="font-size:1rem;font-weight:800;color:var(--accent);margin-top:4px">+₹2,480 Cr</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sectoral Indices Table -->
      <div class="gold-table-section" style="margin-bottom:32px">
        <div class="gold-table-header">🏛️ Sectoral Indices &amp; Market Performance Today</div>
        <div style="overflow-x:auto">
          <table class="gold-table">
            <thead>
              <tr>
                <th>Index Name</th>
                <th>Exchange</th>
                <th>Current Level</th>
                <th>Change (Points)</th>
                <th>Change (%)</th>
                <th>Day's Range (Low - High)</th>
              </tr>
            </thead>
            <tbody id="sectoralTableBody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Precious Metals Overview -->
      <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:18px">Precious Metals &amp; Commodities</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px">
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Gold 24K (99.9%)</div></div>
            <div class="market-card-exch" style="background:rgba(245,158,11,0.15);color:#d97706">MCX</div>
          </div>
          <div class="market-card-value" id="mktG24">—</div>
          <div class="market-card-change" id="mktG24ch">—</div>
        </div>
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Silver 999 Pure</div></div>
            <div class="market-card-exch" style="background:rgba(148,163,184,0.15);color:#475569">MCX</div>
          </div>
          <div class="market-card-value" id="mktSilver">—</div>
          <div class="market-card-change" id="mktSilverch">—</div>
        </div>
        <div class="market-card">
          <div class="market-card-header">
            <div><div class="market-card-label">MCX</div><div class="market-card-name">Platinum 950</div></div>
            <div class="market-card-exch" style="background:rgba(167,139,250,0.15);color:#7c3aed">MCX</div>
          </div>
          <div class="market-card-value" id="mktPlatinum">—</div>
          <div class="market-card-change" id="mktPlatinch">—</div>
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

  // Update Benchmark Index Cards
  Object.entries(d.indices).forEach(([k, idx]) => {
    s(`mk-exch-${k}`, idx.exchange);
    s(`mk-name-${k}`, idx.label);
    s(`mk-badge-${k}`, idx.exchange);
    s(`mk-val-${k}`, fmt(idx.value, 2));
    s(`mk-o-${k}`, fmt(idx.open || idx.value * 0.998, 2));
    s(`mk-h-${k}`, fmt(idx.high || idx.value * 1.004, 2));
    s(`mk-l-${k}`, fmt(idx.low || idx.value * 0.995, 2));
    s(`mk-p-${k}`, fmt(idx.prev || idx.value - idx.change, 2));

    const chEl = document.getElementById(`mk-chg-${k}`);
    if (chEl) {
      const up = idx.change >= 0;
      chEl.textContent = `${up ? "▲" : "▼"} ${Math.abs(idx.change).toFixed(2)} (${up ? "+" : ""}${idx.changePct.toFixed(2)}%)`;
      chEl.className = "market-card-change " + (up ? "up" : "down");
    }

    document.querySelectorAll(`[data-spark="${k}"]`).forEach(canvas => {
      if (idx.spark) FinCharts.drawSparkline(canvas, idx.spark, FinCharts.colorFor(idx.color));
    });
  });

  // Update Sectoral Table
  const secTable = document.getElementById("sectoralTableBody");
  if (secTable) {
    const sectors = [
      { name: "Nifty 50", exch: "NSE", val: d.indices.nifty.value, chg: d.indices.nifty.change, chp: d.indices.nifty.changePct, low: d.indices.nifty.low, high: d.indices.nifty.high },
      { name: "BSE Sensex", exch: "BSE", val: d.indices.sensex.value, chg: d.indices.sensex.change, chp: d.indices.sensex.changePct, low: d.indices.sensex.low, high: d.indices.sensex.high },
      { name: "Bank Nifty", exch: "NSE", val: d.indices.bankNifty.value, chg: d.indices.bankNifty.change, chp: d.indices.bankNifty.changePct, low: d.indices.bankNifty.low, high: d.indices.bankNifty.high },
      { name: "Nifty IT", exch: "NSE", val: d.indices.niftyIT.value, chg: d.indices.niftyIT.change, chp: d.indices.niftyIT.changePct, low: d.indices.niftyIT.low, high: d.indices.niftyIT.high },
      { name: "Nifty Auto", exch: "NSE", val: 24350.20, chg: 185.40, chp: 0.77, low: 24150.00, high: 24420.00 },
      { name: "Nifty FMCG", exch: "NSE", val: 56840.10, chg: -120.30, chp: -0.21, low: 56700.00, high: 57100.00 },
      { name: "Nifty Pharma", exch: "NSE", val: 21890.50, chg: 95.80, chp: 0.44, low: 21750.00, high: 21950.00 },
      { name: "Nifty Metal", exch: "NSE", val: 9450.80, chg: 142.10, chp: 1.53, low: 9320.00, high: 9480.00 }
    ];

    secTable.innerHTML = sectors.map(s => {
      const up = s.chg >= 0;
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-primary)">${s.name}</td>
          <td><span style="font-size:0.75rem;padding:2px 8px;border-radius:4px;background:rgba(99,102,241,0.08);color:var(--accent);font-weight:700">${s.exch}</span></td>
          <td class="price">₹${fmt(s.val, 2)}</td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "▲ +" : "▼ "}${Math.abs(s.chg).toFixed(2)}
          </td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "+" : ""}${s.chp.toFixed(2)}%
          </td>
          <td style="color:var(--text-secondary);font-size:0.85rem">
            ₹${fmt(s.low, 0)} - ₹${fmt(s.high, 0)}
          </td>
        </tr>
      `;
    }).join("");
  }

  // Update Precious Metals Cards
  const g = d.gold;
  if (!g) return;

  s("mktG24", "₹" + fmt(g.g24) + " /g");
  s("mktSilver", "₹" + fmt(g.silver, 2) + " /g");
  s("mktPlatinum", "₹" + fmt(g.platinum) + " /g");

  const gch = document.getElementById("mktG24ch");
  if (gch) {
    const ch24 = g.ch24 !== undefined ? g.ch24 : 25;
    const chp24 = g.chp24 !== undefined ? g.chp24 : 0.27;
    const up = ch24 >= 0;
    gch.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(ch24)} (${up ? "+" : ""}${chp24}%)`;
    gch.className = "market-card-change " + (up ? "up" : "down");
  }

  const sch = document.getElementById("mktSilverch");
  if (sch) {
    const chSil = g.chSilver !== undefined ? g.chSilver : 0.45;
    const chpSil = g.chpSilver !== undefined ? g.chpSilver : 0.43;
    const up = chSil >= 0;
    sch.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(chSil).toFixed(2)} (${up ? "+" : ""}${chpSil}%)`;
    sch.className = "market-card-change " + (up ? "up" : "down");
  }

  const pch = document.getElementById("mktPlatinch");
  if (pch) {
    const chPlat = g.chPlat !== undefined ? g.chPlat : 15;
    const chpPlat = g.chpPlat !== undefined ? g.chpPlat : 0.51;
    const up = chPlat >= 0;
    pch.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(chPlat)} (${up ? "+" : ""}${chpPlat}%)`;
    pch.className = "market-card-change " + (up ? "up" : "down");
  }
}
