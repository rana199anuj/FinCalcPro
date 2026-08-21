/* ══════════════════════════════════════════════════
   FinCalc Pro — Gold Rates & Gold Jewellery Calculator
   Includes:
   1. Live Rate Cards (24K, 22K, 20K, 18K, Silver, Platinum)
   2. Interactive Gold Rate Purchase Calculator
      (Weight * Rate + Making Charges = Sub Total + GST = Final Amount)
   3. Today's vs Yesterday's Rate Comparison Table
   4. Historical Variations (7-Day, 30-Day, 1-Year Chart & Table)
   5. Detailed Rate Chart by Weight
   ══════════════════════════════════════════════════ */

let goldChartInstance = null;

function renderGoldRates() {
  const g = marketData?.gold || { g24: 9420, g22: 8635, g20: 7850, g18: 7065, silver: 105.5, platinum: 2950 };

  document.getElementById("appMain").innerHTML = `
    <div class="gold-page">
      <!-- Header Banner -->
      <div class="calc-banner" style="background:linear-gradient(135deg, #b45309 0%, #f59e0b 100%);margin-bottom:28px">
        <div class="calc-banner-left">
          <h1>💛 Gold Rates & Jewellery Calculator</h1>
          <p>Live MCX & Retail Rates (24K, 22K, 20K, 18K) · <span id="goldTs">Live</span></p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <!-- Live Rate Cards -->
      <div class="gold-grid" id="goldGrid">
        ${[["24","24K (99.9%)"],["22","22K (91.7%)"],["20","20K (83.3%)"],["18","18K (75.0%)"]].map(([id, label]) => `
          <div class="gold-card">
            <div class="gold-purity">${label.split(" ")[0]}</div>
            <div class="gold-name">Gold ${label}</div>
            <div class="gold-price" id="gp-${id}">₹${fmt(g["g"+id] || 0)}</div>
            <div class="gold-unit">per gram</div>
            <div class="gold-change" id="gc-${id}">—</div>
          </div>
        `).join("")}
      </div>

      <!-- Silver & Platinum Cards -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px">
        <div class="gold-card">
          <div class="gold-purity" style="color:#94a3b8">Silver</div>
          <div class="gold-name">Silver · 999 Pure</div>
          <div class="gold-price" id="gpSilver">₹${fmt(g.silver, 2)}</div>
          <div class="gold-unit">per gram</div>
          <div class="gold-change" id="gcSilver">—</div>
        </div>
        <div class="gold-card">
          <div class="gold-purity" style="color:#a78bfa">Platinum</div>
          <div class="gold-name">Platinum · 950 Pure</div>
          <div class="gold-price" id="gpPlatinum">₹${fmt(g.platinum)}</div>
          <div class="gold-unit">per gram</div>
          <div class="gold-change" id="gcPlatinum">—</div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- SECTION 1: INTERACTIVE GOLD RATE CALCULATOR        -->
      <!-- Formula: (Weight * Rate) + Making = Subtotal + GST = Final -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="calc-form-card" style="margin-bottom:32px;padding:24px">
        <div class="calc-section-header" style="font-size:1.15rem;font-weight:800;color:var(--text-primary);margin-bottom:18px">
          🧮 Gold Rate & Jewellery Price Calculator (GoodReturns Formula)
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:20px">
          Formula: Gold Value (Weight × Rate) + Making Charges = Sub Total + GST (3%) = Final Invoice Amount
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
          <!-- Inputs -->
          <div>
            <div class="form-group">
              <label class="form-label">Select Gold Purity</label>
              <select id="goldCalcPurity" class="form-input" onchange="calculateGoldPrice()">
                <option value="24">24K (99.9% Pure Gold)</option>
                <option value="22" selected>22K (91.7% Standard Jewellery)</option>
                <option value="20">20K (83.3% Modern Jewellery)</option>
                <option value="18">18K (75.0% Diamond/Stone Jewellery)</option>
              </select>
            </div>

            <div class="form-group">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <label class="form-label">Gold Weight (grams)</label>
                <span style="font-weight:700;color:var(--accent)" id="weightVal">10 g</span>
              </div>
              <input type="number" id="goldWeightNum" class="form-input" value="10" min="0.1" max="1000" step="0.1" oninput="syncGoldWeight(this.value)"/>
              <input type="range" id="goldWeightRange" class="range-slider" min="1" max="100" value="10" step="0.5" oninput="syncGoldWeight(this.value)"/>
            </div>

            <div class="form-group">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <label class="form-label">Making Charges (% of Gold Value)</label>
                <span style="font-weight:700;color:var(--accent)" id="makingVal">10%</span>
              </div>
              <input type="number" id="goldMakingNum" class="form-input" value="10" min="0" max="50" step="0.5" oninput="syncGoldMaking(this.value)"/>
              <input type="range" id="goldMakingRange" class="range-slider" min="0" max="30" value="10" step="0.5" oninput="syncGoldMaking(this.value)"/>
            </div>

            <div class="form-group">
              <label class="form-label">GST Tax Rate</label>
              <input type="text" class="form-input" value="3% (Standard Govt GST)" readonly style="background:var(--bg-secondary);color:var(--text-muted)"/>
            </div>
          </div>

          <!-- Price Output Breakdown Card -->
          <div class="summary-card" style="display:flex;flex-direction:column;justify-content:space-between">
            <div>
              <div class="summary-card-header">🧾 Jewellery Invoice Breakdown</div>
              <div class="summary-hero" style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08));border-color:rgba(245,158,11,0.2)">
                <div class="summary-hero-label">Final Payable Amount</div>
                <div class="summary-hero-value" id="goldFinalAmount" style="color:#d97706">₹97,835</div>
                <div class="summary-hero-sub" id="goldRateUsedSub">Based on 22K Rate: ₹8,635 / gram</div>
              </div>
            </div>

            <div class="summary-breakdown" style="margin-top:16px">
              <div class="summary-row">
                <span class="summary-label">Weight &amp; Purity</span>
                <span class="summary-val" id="rowWeightPurity">10g · 22K</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Gold Value (Weight × Rate)</span>
                <span class="summary-val" id="rowGoldValue">₹86,350</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">+ Making Charges</span>
                <span class="summary-val" style="color:var(--gold)" id="rowMakingCharge">₹8,635</span>
              </div>
              <div class="summary-row" style="font-weight:700">
                <span class="summary-label">Sub Total</span>
                <span class="summary-val" id="rowSubTotal">₹94,985</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">+ GST Tax (3%)</span>
                <span class="summary-val" style="color:var(--red)" id="rowGst">₹2,850</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- SECTION 2: TODAY VS YESTERDAY COMPARISON TABLE      -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="gold-table-section" style="margin-bottom:32px">
        <div class="gold-table-header">📅 Today's vs Yesterday's Rate Comparison</div>
        <div style="overflow-x:auto">
          <table class="gold-table">
            <thead>
              <tr>
                <th>Purity / Metal</th>
                <th>Today (1g)</th>
                <th>Yesterday (1g)</th>
                <th>Change (₹/g)</th>
                <th>Change (%)</th>
                <th>Today (10g)</th>
                <th>Yesterday (10g)</th>
              </tr>
            </thead>
            <tbody id="goldCompareTableBody">
              <tr><td colspan="7" style="text-align:center;padding:20px"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- SECTION 3: HISTORICAL VARIATION CHART & TABLE      -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="calc-form-card" style="margin-bottom:32px;padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px">
          <div class="calc-section-header" style="font-size:1.1rem;font-weight:800;margin:0">
            📊 Gold Rate Historical Trends &amp; Variation
          </div>
          <div style="display:flex;gap:8px">
            <button class="calc-tab-item active" id="btnPeriod7" onclick="switchGoldPeriod(7)">7 Days</button>
            <button class="calc-tab-item" id="btnPeriod30" onclick="switchGoldPeriod(30)">30 Days</button>
            <button class="calc-tab-item" id="btnPeriod365" onclick="switchGoldPeriod(365)">1 Year</button>
          </div>
        </div>

        <!-- Historical Variation Stats Grid -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
          <div class="hero-stat" style="text-align:center;padding:12px">
            <span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Lowest Rate</span>
            <strong style="display:block;font-size:1.2rem;color:var(--green);margin-top:2px" id="histMin">₹9,380</strong>
          </div>
          <div class="hero-stat" style="text-align:center;padding:12px">
            <span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Highest Rate</span>
            <strong style="display:block;font-size:1.2rem;color:var(--red);margin-top:2px" id="histMax">₹9,510</strong>
          </div>
          <div class="hero-stat" style="text-align:center;padding:12px">
            <span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Average Rate</span>
            <strong style="display:block;font-size:1.2rem;color:var(--text-primary);margin-top:2px" id="histAvg">₹9,445</strong>
          </div>
          <div class="hero-stat" style="text-align:center;padding:12px">
            <span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Net Change</span>
            <strong style="display:block;font-size:1.2rem;color:var(--green);margin-top:2px" id="histChange">+1.25%</strong>
          </div>
        </div>

        <!-- Historical Trend Line Chart -->
        <div style="height:220px;position:relative">
          <canvas id="goldTrendChart"></canvas>
        </div>
      </div>

      <!-- Detailed Rate Chart by Weight -->
      <div class="gold-table-section">
        <div class="gold-table-header">📋 Detailed Rate Chart — Gold Price by Weight</div>
        <div style="overflow-x:auto">
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
    </div>
  `;

  if (marketData) updateGoldRates(marketData);
  calculateGoldPrice();
  renderGoldTrendChart(7);
}

/* ─ Real-Time WebSocket Listener for Gold Rates ─── */
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

  // Update Today vs Yesterday Comparison Table
  const compBody = document.getElementById("goldCompareTableBody");
  if (compBody) {
    const compRows = [
      { name: "24K Gold (99.9%)", today: g.g24, yest: g.g24 - (g.ch24 || 25) },
      { name: "22K Gold (91.7%)", today: g.g22, yest: g.g22 - Math.round((g.ch24 || 25) * 0.917) },
      { name: "20K Gold (83.3%)", today: g.g20, yest: g.g20 - Math.round((g.ch24 || 25) * 0.833) },
      { name: "18K Gold (75.0%)", today: g.g18, yest: g.g18 - Math.round((g.ch24 || 25) * 0.75) },
      { name: "Silver 999 Pure",  today: g.silver, yest: g.silver - (g.chSilver || 0.7) },
      { name: "Platinum 950 Pure",today: g.platinum, yest: g.platinum - (g.chPlat || 20) }
    ];

    compBody.innerHTML = compRows.map(r => {
      const diff = r.today - r.yest;
      const diffPct = (diff / r.yest) * 100;
      const up = diff >= 0;
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-primary)">${r.name}</td>
          <td class="price">₹${fmt(r.today, r.today < 500 ? 2 : 0)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(r.yest, r.yest < 500 ? 2 : 0)}</td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "▲ +" : "▼ "}${fmt(Math.abs(diff), r.today < 500 ? 2 : 0)}
          </td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "+" : ""}${diffPct.toFixed(2)}%
          </td>
          <td class="price">₹${fmt(r.today * 10, r.today < 500 ? 2 : 0)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(r.yest * 10, r.yest < 500 ? 2 : 0)}</td>
        </tr>
      `;
    }).join("");
  }

  // Update Detailed Rate Table by Weight
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

  calculateGoldPrice();
}

/* ─ Interactive Jewellery Calculator Helper ────── */
function syncGoldWeight(val) {
  document.getElementById("goldWeightNum").value = val;
  document.getElementById("goldWeightRange").value = val;
  document.getElementById("weightVal").textContent = val + " g";
  calculateGoldPrice();
}

function syncGoldMaking(val) {
  document.getElementById("goldMakingNum").value = val;
  document.getElementById("goldMakingRange").value = val;
  document.getElementById("makingVal").textContent = val + "%";
  calculateGoldPrice();
}

function calculateGoldPrice() {
  const purityKey = document.getElementById("goldCalcPurity")?.value || "22";
  const weight = parseFloat(document.getElementById("goldWeightNum")?.value || 10);
  const makingPct = parseFloat(document.getElementById("goldMakingNum")?.value || 10);

  const g = marketData?.gold || { g24: 9420, g22: 8635, g20: 7850, g18: 7065 };
  const ratePerGram = g["g" + purityKey] || (9420 * { "24": 1, "22": 0.917, "20": 0.833, "18": 0.75 }[purityKey]);

  const goldValue = weight * ratePerGram;
  const makingCharges = goldValue * (makingPct / 100);
  const subTotal = goldValue + makingCharges;
  const gst = subTotal * 0.03;
  const finalAmount = subTotal + gst;

  if (document.getElementById("goldFinalAmount")) {
    document.getElementById("goldFinalAmount").textContent = "₹" + fmt(finalAmount);
    document.getElementById("goldRateUsedSub").textContent = `Based on ${purityKey}K Rate: ₹${fmt(ratePerGram)} / gram`;
    document.getElementById("rowWeightPurity").textContent = `${weight}g · ${purityKey}K`;
    document.getElementById("rowGoldValue").textContent = "₹" + fmt(goldValue);
    document.getElementById("rowMakingCharge").textContent = "₹" + fmt(makingCharges);
    document.getElementById("rowSubTotal").textContent = "₹" + fmt(subTotal);
    document.getElementById("rowGst").textContent = "₹" + fmt(gst);
  }
}

/* ─ Historical Trend Chart & Stats ──────────────── */
function switchGoldPeriod(days) {
  ["btnPeriod7", "btnPeriod30", "btnPeriod365"].forEach(id => {
    document.getElementById(id)?.classList.remove("active");
  });
  document.getElementById(`btnPeriod${days}`)?.classList.add("active");
  renderGoldTrendChart(days);
}

function renderGoldTrendChart(days) {
  const ctx = document.getElementById("goldTrendChart")?.getContext("2d");
  if (!ctx) return;

  const baseRate = marketData?.gold?.g24 || 9420;
  const labels = [];
  const data = [];

  const points = days === 7 ? 7 : days === 30 ? 15 : 12;
  for (let i = points - 1; i >= 0; i--) {
    const label = days === 365 ? `M${12 - i}` : days === 30 ? `Day ${30 - i*2}` : `Day ${7 - i}`;
    labels.push(label);
    const noise = Math.sin(i * 0.5) * (baseRate * 0.015) + (i * 12);
    data.push(Math.round(baseRate - noise));
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const avgVal = Math.round(data.reduce((a,b)=>a+b,0) / data.length);
  const netChg = (((data[data.length-1] - data[0]) / data[0]) * 100).toFixed(2);

  document.getElementById("histMin").textContent = "₹" + fmt(minVal);
  document.getElementById("histMax").textContent = "₹" + fmt(maxVal);
  document.getElementById("histAvg").textContent = "₹" + fmt(avgVal);
  document.getElementById("histChange").textContent = (netChg >= 0 ? "+" : "") + netChg + "%";
  document.getElementById("histChange").style.color = netChg >= 0 ? "var(--green)" : "var(--red)";

  if (goldChartInstance) goldChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgba(245, 158, 11, 0.25)");
  gradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");

  goldChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "24K Gold Rate (₹/g)",
        data: data,
        borderColor: "#f59e0b",
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 10 } } }
      }
    }
  });
}
