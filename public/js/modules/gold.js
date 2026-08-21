/* ══════════════════════════════════════════════════
   FinCalc Pro — Gold Rates Page
   Renders the gold rates table and updates live prices.
   ══════════════════════════════════════════════════ */

function renderGoldRates() {
  document.getElementById("appMain").innerHTML = `
    <div class="gold-page">
      <div class="calc-banner" style="background:linear-gradient(135deg, #b45309 0%, #f59e0b 100%);margin-bottom:28px">
        <div class="calc-banner-left">
          <h1>💛 Gold Rates Today</h1>
          <p>Live MCX &amp; Retail Gold Rates in India (24K, 22K, 20K, 18K) · <span id="goldTs">Live</span></p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <div class="gold-grid" id="goldGrid">
        ${[["24","24K (99.9%)"],["22","22K (91.7%)"],["20","20K (83.3%)"],["18","18K (75.0%)"]].map(([id, label]) => `
          <div class="gold-card">
            <div class="gold-purity">${label.split(" ")[0]}</div>
            <div class="gold-name">Gold ${label}</div>
            <div class="gold-price" id="gp-${id}">—</div>
            <div class="gold-unit">per gram</div>
            <div class="gold-change" id="gc-${id}">—</div>
          </div>
        `).join("")}
      </div>

      <!-- Silver & Platinum -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:24px">
        <div class="gold-card">
          <div class="gold-purity" style="color:#94a3b8">Silver</div>
          <div class="gold-name">Silver · 999 Pure</div>
          <div class="gold-price" id="gpSilver">—</div>
          <div class="gold-unit">per gram</div>
          <div class="gold-change" id="gcSilver"></div>
        </div>
        <div class="gold-card">
          <div class="gold-purity" style="color:#a78bfa">Platinum</div>
          <div class="gold-name">Platinum · 950 Pure</div>
          <div class="gold-price" id="gpPlatinum">—</div>
          <div class="gold-unit">per gram</div>
          <div class="gold-change" id="gcPlatinum"></div>
        </div>
      </div>

      <!-- Detailed Rate Table -->
      <div class="gold-table-section">
        <div class="gold-table-header">📋 Detailed Rate Chart — Gold Price by Weight</div>
        <table class="gold-table">
          <thead>
            <tr>
              <th>Purity</th><th>1g</th><th>8g (Tola)</th><th>10g</th><th>100g</th><th>1 Kg</th>
            </tr>
          </thead>
          <tbody id="goldTableBody">
            <tr><td colspan="6" style="text-align:center;padding:30px"><div class="spinner"></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (marketData) updateGoldRates(marketData);
}

function updateGoldRates(d) {
  if (!d?.gold) return;
  const g = d.gold;

  const ts = document.getElementById("goldTs");
  if (ts) ts.textContent = d.ts;

  const pairs = [["24", g.g24], ["22", g.g22], ["20", g.g20], ["18", g.g18]];
  pairs.forEach(([id, val]) => {
    const pEl = document.getElementById(`gp-${id}`);
    if (pEl) pEl.textContent = "₹" + fmt(val);

    const cEl = document.getElementById(`gc-${id}`);
    if (cEl && id === "24") {
      const up = g.ch24 >= 0;
      cEl.textContent = `${up ? "▲" : "▼"} ₹${Math.abs(g.ch24)} (${up ? "+" : ""}${g.chp24}%)`;
      cEl.className   = "gold-change " + (up ? "up" : "down");
    }
  });

  const sv = document.getElementById("gpSilver");   if (sv) sv.textContent   = "₹" + fmt(g.silver, 2);
  const pt = document.getElementById("gpPlatinum"); if (pt) pt.textContent   = "₹" + fmt(g.platinum);

  const tbody = document.getElementById("goldTableBody");
  if (tbody) {
    const rows = [
      { label: "24K (99.9%)", rate: g.g24 },
      { label: "22K (91.7%)", rate: g.g22 },
      { label: "20K (83.3%)", rate: g.g20 },
      { label: "18K (75.0%)", rate: g.g18 }
    ];
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.label}</td>
        <td class="price">₹${fmt(r.rate)}</td>
        <td class="price">₹${fmt(r.rate * 8)}</td>
        <td class="price">₹${fmt(r.rate * 10)}</td>
        <td class="price">₹${fmt(r.rate * 100)}</td>
        <td class="price">₹${fmt(r.rate * 1000)}</td>
      </tr>
    `).join("");
  }
}
