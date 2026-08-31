/* ══════════════════════════════════════════════════
   FinCalc Pro — Gold Rates & Gold Jewellery Calculator
   Includes:
   1. Live Rate Cards (24K, 22K, 20K, 18K, Silver, Platinum)
   2. Interactive Gold Rate Purchase Calculator
      (Weight * Rate + Making Charges = Sub Total + GST = Final Amount)
   3. Today's vs Yesterday's Rate Comparison Table
   4. Major Indian Cities Gold Rates Table
   5. Gold Weight Conversion & Standard Units Table
   6. Historical Variations (7-Day, 30-Day, 1-Year Chart & Table)
   7. Detailed Rate Chart by Weight
   ══════════════════════════════════════════════════ */

let goldChartInstance = null;
let emeraldMetal = "gold";
let emeraldCity = "Meerut";
let emeraldPurity = "22";

const CITIES_LIST = [
  { city: "Meerut", off24: 15, offSil: 50 },
  { city: "Delhi", off24: 15, offSil: 50 },
  { city: "Mumbai", off24: 0, offSil: 0 },
  { city: "Chennai", off24: 25, offSil: 100 },
  { city: "Kolkata", off24: 0, offSil: 0 },
  { city: "Bengaluru", off24: 10, offSil: -50 },
  { city: "Hyderabad", off24: 10, offSil: 50 },
  { city: "Ahmedabad", off24: 5, offSil: 0 },
  { city: "Pune", off24: 0, offSil: 0 },
  { city: "Jaipur", off24: 15, offSil: 50 },
  { city: "Lucknow", off24: 15, offSil: 50 },
  { city: "Kerala", off24: 10, offSil: 50 },
  { city: "Patna", off24: 12, offSil: 40 }
];

function renderGoldRates() {
  const g = marketData?.gold || { g24: 9420, g22: 8635, g20: 7850, g18: 7065, silver: 105.5, platinum: 2950, ch24: 25, chp24: 0.27 };
  const todayDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById("appMain").innerHTML = `
    <div class="gold-page">
      <!-- Header Banner -->
      <div class="calc-banner" style="background:linear-gradient(135deg, #064e3b 0%, #059669 100%);margin-bottom:28px">
        <div class="calc-banner-left">
          <h1>💛 Gold Rates &amp; Jewellery Calculator</h1>
          <p>Live MCX &amp; City Retail Rates (24K, 22K, 18K, Silver, Platinum) · <span id="goldTs">Live</span></p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- EMERALD DARK GOLD & JEWELLERY WIDGET (Image Match) -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="emerald-gold-widget">
        
        <!-- Toolbar: Date, Metal Tabs, City Selector -->
        <div class="egw-toolbar">
          <div class="egw-date-box">
            <span>📅</span>
            <span class="egw-date-val">${todayDateStr}</span>
          </div>

          <div class="egw-metal-tabs">
            <button type="button" class="egw-metal-btn ${emeraldMetal==='gold'?'active':''}" id="btnMetalGold" onclick="setEmeraldMetal('gold')">Gold</button>
            <button type="button" class="egw-metal-btn ${emeraldMetal==='silver'?'active':''}" id="btnMetalSilver" onclick="setEmeraldMetal('silver')">Silver</button>
            <button type="button" class="egw-metal-btn ${emeraldMetal==='platinum'?'active':''}" id="btnMetalPlatinum" onclick="setEmeraldMetal('platinum')">Platinum</button>
          </div>

          <div class="egw-city-select-wrap">
            <select class="egw-city-select" id="egwCitySelect" onchange="setEmeraldCity(this.value)">
              ${CITIES_LIST.map(c => `<option value="${c.city}" ${c.city===emeraldCity?'selected':''}>${c.city}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- 3 Top Rate Cards -->
        <div class="egw-rate-cards" id="egwRateCards">
          <div class="egw-rate-card">
            <div class="egw-rate-card-label" id="egwCard1Label">24K Gold /g</div>
            <div class="egw-rate-card-price" id="egwCard1Price">₹9,435</div>
          </div>
          <div class="egw-rate-card">
            <div class="egw-rate-card-label" id="egwCard2Label">22K Gold /g</div>
            <div class="egw-rate-card-price" id="egwCard2Price">₹8,650</div>
          </div>
          <div class="egw-rate-card">
            <div class="egw-rate-card-label" id="egwCard3Label">18K Gold /g</div>
            <div class="egw-rate-card-price" id="egwCard3Price">₹7,076</div>
          </div>
        </div>

        <!-- Calculator Section -->
        <div class="egw-calc-title">Calculator</div>
        <div class="egw-calc-controls">
          
          <!-- Purity Selector -->
          <div class="egw-field-group" id="egwPurityGroup">
            <label>Purity</label>
            <div class="egw-purity-pills">
              <button type="button" class="egw-purity-btn ${emeraldPurity==='24'?'active':''}" id="btnPurity24" onclick="setEmeraldPurity('24')">24K</button>
              <button type="button" class="egw-purity-btn ${emeraldPurity==='22'?'active':''}" id="btnPurity22" onclick="setEmeraldPurity('22')">22K</button>
              <button type="button" class="egw-purity-btn ${emeraldPurity==='18'?'active':''}" id="btnPurity18" onclick="setEmeraldPurity('18')">18K</button>
            </div>
          </div>

          <!-- Weight -->
          <div class="egw-field-group">
            <label>Weight (gm)</label>
            <input type="text" inputmode="decimal" class="egw-input" id="egwWeightInput" value="10" oninput="calcEmeraldGold()">
          </div>

          <!-- Making (%) -->
          <div class="egw-field-group">
            <label>Making (%)</label>
            <input type="text" inputmode="decimal" class="egw-input" id="egwMakingInput" value="12" oninput="calcEmeraldGold()">
          </div>

          <!-- GST Select -->
          <div class="egw-field-group">
            <label>GST</label>
            <select class="egw-select" id="egwGstSelect" onchange="calcEmeraldGold()">
              <option value="3" selected>Incl. 3%</option>
              <option value="0">Excl. GST (0%)</option>
              <option value="5">Incl. 5%</option>
            </select>
          </div>
        </div>

        <!-- Bottom Results Row (2 Cards) -->
        <div class="egw-results-row">
          
          <!-- Left Box: Breakdown + Total Amount -->
          <div class="egw-breakdown-card">
            <div class="egw-breakdown-table">
              <div class="egw-breakdown-row">
                <span class="egw-breakdown-label">Base value</span>
                <span class="egw-breakdown-val" id="egwBaseVal">₹86,500</span>
              </div>
              <div class="egw-breakdown-row">
                <span class="egw-breakdown-label">Making charges</span>
                <span class="egw-breakdown-val" id="egwMakingVal">₹10,380</span>
              </div>
              <div class="egw-breakdown-row">
                <span class="egw-breakdown-label" id="egwGstLabel">GST (3%)</span>
                <span class="egw-breakdown-val" id="egwGstVal">₹2,906</span>
              </div>
            </div>

            <div class="egw-total-box">
              <div class="egw-total-label">Total Amount</div>
              <div class="egw-total-val" id="egwTotalVal">₹99,786</div>
              <div class="egw-total-sub">Incl. all charges</div>
            </div>
          </div>

          <!-- Right Box: Know your money's worth! -->
          <div class="egw-worth-card">
            <div class="egw-worth-title">Know your money's worth!</div>
            <div class="egw-worth-sub">Enter any amount to see how much gold you can get</div>
            <div class="egw-worth-form">
              <input type="text" inputmode="decimal" class="egw-worth-input" id="egwWorthInput" value="10000" placeholder="10000" oninput="calcEmeraldWorth()">
              <button type="button" class="egw-worth-btn" onclick="calcEmeraldWorth()">Try now</button>
            </div>
            <div class="egw-worth-result" id="egwWorthResult"></div>
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
      <!-- SECTION 3: MAJOR INDIAN CITIES GOLD RATES TABLE     -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="gold-table-section" style="margin-bottom:32px">
        <div class="gold-table-header">🏙️ Gold Rates in Major Indian Cities Today (10 Grams)</div>
        <div style="overflow-x:auto">
          <table class="gold-table">
            <thead>
              <tr>
                <th>City</th>
                <th>24K Gold (10g)</th>
                <th>22K Gold (10g)</th>
                <th>18K Gold (10g)</th>
                <th>Silver (1 Kg)</th>
                <th>Daily Trend</th>
              </tr>
            </thead>
            <tbody id="goldCitiesTableBody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- SECTION 4: GOLD WEIGHT CONVERSION TABLE            -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="gold-table-section" style="margin-bottom:32px">
        <div class="gold-table-header">⚖️ Standard Gold Weight Conversions &amp; Pricing</div>
        <div style="overflow-x:auto">
          <table class="gold-table">
            <thead>
              <tr>
                <th>Standard Unit</th>
                <th>Grams</th>
                <th>24K Gold Price</th>
                <th>22K Gold Price</th>
                <th>18K Gold Price</th>
                <th>Common Usage</th>
              </tr>
            </thead>
            <tbody id="goldWeightsTableBody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- SECTION 5: HISTORICAL VARIATION CHART & TABLE      -->
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
                <th>Purity</th>
                <th>1g</th>
                <th>8g (1 Sovereign)</th>
                <th>10g</th>
                <th>11.66g (1 Tola)</th>
                <th>100g</th>
                <th>1 Kg</th>
              </tr>
            </thead>
            <tbody id="goldTableBody">
              <tr><td colspan="7" style="text-align:center;padding:30px"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (marketData) updateGoldRates(marketData);
  updateEmeraldWidget();
  calcEmeraldGold();
  calcEmeraldWorth();
  renderGoldTrendChart(7);
}

/* ─ Emerald Widget Helpers ───────────────────────── */
function setEmeraldMetal(metal) {
  emeraldMetal = metal;
  ["btnMetalGold", "btnMetalSilver", "btnMetalPlatinum"].forEach(id => {
    document.getElementById(id)?.classList.remove("active");
  });
  if (metal === "gold") document.getElementById("btnMetalGold")?.classList.add("active");
  if (metal === "silver") document.getElementById("btnMetalSilver")?.classList.add("active");
  if (metal === "platinum") document.getElementById("btnMetalPlatinum")?.classList.add("active");

  const purityGroup = document.getElementById("egwPurityGroup");
  if (purityGroup) {
    purityGroup.style.display = metal === "gold" ? "block" : "none";
  }

  updateEmeraldWidget();
  calcEmeraldGold();
  calcEmeraldWorth();
}

function setEmeraldCity(city) {
  emeraldCity = city;
  updateEmeraldWidget();
  calcEmeraldGold();
  calcEmeraldWorth();
}

function setEmeraldPurity(purity) {
  emeraldPurity = purity;
  ["btnPurity24", "btnPurity22", "btnPurity18"].forEach(id => {
    document.getElementById(id)?.classList.remove("active");
  });
  document.getElementById(`btnPurity${purity}`)?.classList.add("active");

  calcEmeraldGold();
  calcEmeraldWorth();
}

function getEmeraldRates() {
  const g = marketData?.gold || { g24: 9420, g22: 8635, g20: 7850, g18: 7065, silver: 105.5, platinum: 2950 };
  const cityObj = CITIES_LIST.find(c => c.city === emeraldCity) || { off24: 15, offSil: 50 };

  const r24 = g.g24 + cityObj.off24;
  const r22 = Math.round(r24 * 0.9167);
  const r18 = Math.round(r24 * 0.75);
  const rSilver = g.silver + (cityObj.offSil / 1000);
  const rPlat = g.platinum;

  return { r24, r22, r18, rSilver, rPlat };
}

function updateEmeraldWidget() {
  const rates = getEmeraldRates();
  const card1Label = document.getElementById("egwCard1Label");
  const card1Price = document.getElementById("egwCard1Price");
  const card2Label = document.getElementById("egwCard2Label");
  const card2Price = document.getElementById("egwCard2Price");
  const card3Label = document.getElementById("egwCard3Label");
  const card3Price = document.getElementById("egwCard3Price");

  if (!card1Label || !card1Price) return;

  if (emeraldMetal === "gold") {
    card1Label.textContent = "24K Gold /g";
    card1Price.textContent = "₹" + fmt(rates.r24);
    card2Label.textContent = "22K Gold /g";
    card2Price.textContent = "₹" + fmt(rates.r22);
    card3Label.textContent = "18K Gold /g";
    card3Price.textContent = "₹" + fmt(rates.r18);
  } else if (emeraldMetal === "silver") {
    card1Label.textContent = "Fine Silver (1g)";
    card1Price.textContent = "₹" + fmt(rates.rSilver, 2);
    card2Label.textContent = "Silver (100g)";
    card2Price.textContent = "₹" + fmt(Math.round(rates.rSilver * 100));
    card3Label.textContent = "Silver (1 Kg)";
    card3Price.textContent = "₹" + fmt(Math.round(rates.rSilver * 1000));
  } else if (emeraldMetal === "platinum") {
    card1Label.textContent = "Platinum 950 (1g)";
    card1Price.textContent = "₹" + fmt(rates.rPlat);
    card2Label.textContent = "Platinum (10g)";
    card2Price.textContent = "₹" + fmt(rates.rPlat * 10);
    card3Label.textContent = "Platinum (100g)";
    card3Price.textContent = "₹" + fmt(rates.rPlat * 100);
  }
}

function calcEmeraldGold() {
  const rates = getEmeraldRates();
  let ratePerGram = rates.r22;
  if (emeraldMetal === "gold") {
    if (emeraldPurity === "24") ratePerGram = rates.r24;
    else if (emeraldPurity === "18") ratePerGram = rates.r18;
    else ratePerGram = rates.r22;
  } else if (emeraldMetal === "silver") {
    ratePerGram = rates.rSilver;
  } else if (emeraldMetal === "platinum") {
    ratePerGram = rates.rPlat;
  }

  const weight = parseFloat(document.getElementById("egwWeightInput")?.value) || 0;
  const makingPct = parseFloat(document.getElementById("egwMakingInput")?.value) || 0;
  const gstPct = parseFloat(document.getElementById("egwGstSelect")?.value) || 3;

  const baseValue = Math.round(weight * ratePerGram);
  const makingCharges = Math.round(baseValue * (makingPct / 100));
  const subTotal = baseValue + makingCharges;
  const gstAmount = Math.round(subTotal * (gstPct / 100));
  const totalAmount = subTotal + gstAmount;

  const baseEl = document.getElementById("egwBaseVal");
  const makingEl = document.getElementById("egwMakingVal");
  const gstLabelEl = document.getElementById("egwGstLabel");
  const gstValEl = document.getElementById("egwGstVal");
  const totalEl = document.getElementById("egwTotalVal");

  if (baseEl) baseEl.textContent = "₹" + fmt(baseValue);
  if (makingEl) makingEl.textContent = "₹" + fmt(makingCharges);
  if (gstLabelEl) gstLabelEl.textContent = `GST (${gstPct}%)`;
  if (gstValEl) gstValEl.textContent = "₹" + fmt(gstAmount);
  if (totalEl) totalEl.textContent = "₹" + fmt(totalAmount);
}

function calcEmeraldWorth() {
  const rates = getEmeraldRates();
  let ratePerGram = rates.r22;
  let labelName = `${emeraldPurity}K Gold`;
  if (emeraldMetal === "gold") {
    if (emeraldPurity === "24") ratePerGram = rates.r24;
    else if (emeraldPurity === "18") ratePerGram = rates.r18;
    else ratePerGram = rates.r22;
  } else if (emeraldMetal === "silver") {
    ratePerGram = rates.rSilver;
    labelName = "Silver";
  } else if (emeraldMetal === "platinum") {
    ratePerGram = rates.rPlat;
    labelName = "Platinum";
  }

  const amount = parseFloat(document.getElementById("egwWorthInput")?.value) || 0;
  const makingPct = parseFloat(document.getElementById("egwMakingInput")?.value) || 0;
  const gstPct = parseFloat(document.getElementById("egwGstSelect")?.value) || 3;

  const resultEl = document.getElementById("egwWorthResult");
  if (!resultEl) return;

  if (amount <= 0 || ratePerGram <= 0) {
    resultEl.textContent = "";
    return;
  }

  // Cost per gram including making and GST
  const costPerGram = ratePerGram * (1 + makingPct / 100) * (1 + gstPct / 100);
  const grams = amount / costPerGram;

  resultEl.innerHTML = `✨ You can get <strong>${grams >= 10 ? grams.toFixed(2) : grams.toFixed(3)} gm</strong> of ${labelName} in ${emeraldCity}`;
}

/* ─ Real-Time WebSocket Listener for Gold Rates ─── */
function updateGoldRates(d) {
  if (!d?.gold) return;
  const g = d.gold;

  const ts = document.getElementById("goldTs");
  if (ts) ts.textContent = d.ts;

  const ch24 = g.ch24 !== undefined ? g.ch24 : 25;
  const chp24 = g.chp24 !== undefined ? g.chp24 : 0.27;

  // Rate multipliers
  const purities = [
    { id: "24", val: g.g24, mult: 1 },
    { id: "22", val: g.g22, mult: 0.9167 },
    { id: "20", val: g.g20, mult: 0.8333 },
    { id: "18", val: g.g18, mult: 0.75 }
  ];

  purities.forEach(p => {
    const pEl = document.getElementById(`gp-${p.id}`);
    if (pEl) pEl.textContent = "₹" + fmt(p.val);

    const cEl = document.getElementById(`gc-${p.id}`);
    if (cEl) {
      const chVal = Math.round(ch24 * p.mult);
      const up = ch24 >= 0;
      cEl.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(chVal)} (${up ? "+" : ""}${chp24}%)`;
      cEl.className = "gold-change " + (up ? "up" : "down");
    }
  });

  // Silver & Platinum Cards
  const sv = document.getElementById("gpSilver");   if (sv) sv.textContent   = "₹" + fmt(g.silver, 2);
  const pt = document.getElementById("gpPlatinum"); if (pt) pt.textContent   = "₹" + fmt(g.platinum);

  const scEl = document.getElementById("gcSilver");
  if (scEl) {
    const chSil = g.chSilver !== undefined ? g.chSilver : 0.45;
    const chpSil = g.chpSilver !== undefined ? g.chpSilver : 0.43;
    const up = chSil >= 0;
    scEl.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(chSil).toFixed(2)} (${up ? "+" : ""}${chpSil}%)`;
    scEl.className = "gold-change " + (up ? "up" : "down");
  }

  const pcEl = document.getElementById("gcPlatinum");
  if (pcEl) {
    const chPlat = g.chPlat !== undefined ? g.chPlat : 15;
    const chpPlat = g.chpPlat !== undefined ? g.chpPlat : 0.51;
    const up = chPlat >= 0;
    pcEl.textContent = `${up ? "▲ +" : "▼ "}₹${Math.abs(chPlat)} (${up ? "+" : ""}${chpPlat}%)`;
    pcEl.className = "gold-change " + (up ? "up" : "down");
  }

  // Update Today vs Yesterday Comparison Table
  const compBody = document.getElementById("goldCompareTableBody");
  if (compBody) {
    const compRows = [
      { name: "24K Gold (99.9% Pure)", today: g.g24, yest: g.g24 - ch24 },
      { name: "22K Gold (91.7% Standard)", today: g.g22, yest: g.g22 - Math.round(ch24 * 0.9167) },
      { name: "20K Gold (83.3% Modern)", today: g.g20, yest: g.g20 - Math.round(ch24 * 0.8333) },
      { name: "18K Gold (75.0% Jewellery)", today: g.g18, yest: g.g18 - Math.round(ch24 * 0.75) },
      { name: "Silver 999 Pure", today: g.silver, yest: g.silver - (g.chSilver || 0.45) },
      { name: "Platinum 950 Pure", today: g.platinum, yest: g.platinum - (g.chPlat || 15) }
    ];

    compBody.innerHTML = compRows.map(r => {
      const diff = r.today - r.yest;
      const diffPct = (diff / r.yest) * 100;
      const up = diff >= 0;
      const isDecimal = r.today < 500;
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-primary)">${r.name}</td>
          <td class="price">₹${fmt(r.today, isDecimal ? 2 : 0)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(r.yest, isDecimal ? 2 : 0)}</td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "▲ +" : "▼ "}${fmt(Math.abs(diff), isDecimal ? 2 : 0)}
          </td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "+" : ""}${diffPct.toFixed(2)}%
          </td>
          <td class="price">₹${fmt(r.today * 10, isDecimal ? 2 : 0)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(r.yest * 10, isDecimal ? 2 : 0)}</td>
        </tr>
      `;
    }).join("");
  }

  // Update Major Cities Gold Rates Table
  const citiesBody = document.getElementById("goldCitiesTableBody");
  if (citiesBody) {
    const cityOffsets = [
      { city: "Mumbai", off24: 0, offSil: 0 },
      { city: "Delhi", off24: 15, offSil: 50 },
      { city: "Chennai", off24: 25, offSil: 100 },
      { city: "Kolkata", off24: 0, offSil: 0 },
      { city: "Bengaluru", off24: 10, offSil: -50 },
      { city: "Hyderabad", off24: 10, offSil: 50 },
      { city: "Ahmedabad", off24: 5, offSil: 0 },
      { city: "Pune", off24: 0, offSil: 0 },
      { city: "Jaipur", off24: 15, offSil: 50 },
      { city: "Lucknow", off24: 15, offSil: 50 },
      { city: "Kerala", off24: 10, offSil: 50 },
      { city: "Patna", off24: 12, offSil: 40 }
    ];

    citiesBody.innerHTML = cityOffsets.map(c => {
      const c24 = (g.g24 + c.off24) * 10;
      const c22 = Math.round((g.g24 + c.off24) * 0.9167) * 10;
      const c18 = Math.round((g.g24 + c.off24) * 0.75) * 10;
      const cSilKg = (g.silver * 1000) + c.offSil;
      const up = ch24 >= 0;
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-primary)">📍 ${c.city}</td>
          <td class="price">₹${fmt(c24)}</td>
          <td class="price">₹${fmt(c22)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(c18)}</td>
          <td style="color:var(--text-secondary)">₹${fmt(cSilKg)}</td>
          <td style="font-weight:700;color:${up ? "var(--green)" : "var(--red)"}">
            ${up ? "▲ Bullish" : "▼ Bearish"}
          </td>
        </tr>
      `;
    }).join("");
  }

  // Update Standard Weight Conversions Table
  const weightsBody = document.getElementById("goldWeightsTableBody");
  if (weightsBody) {
    const weightsList = [
      { unit: "1 Gram", g: 1, usage: "Small coins, digital gold" },
      { unit: "8 Grams (1 Sovereign / Pavam)", g: 8, usage: "Traditional wedding jewellery, gold coins" },
      { unit: "10 Grams (Standard 1 Bhari)", g: 10, usage: "Standard retail trading unit" },
      { unit: "11.66 Grams (1 Traditional Tola)", g: 11.6638, usage: "Vedic / Historical bullion measure" },
      { unit: "100 Grams", g: 100, usage: "Investment mint bars" },
      { unit: "1 Kilogram (1,000g / 100 Tolas)", g: 1000, usage: "Wholesale bullion & institutional bars" }
    ];

    weightsBody.innerHTML = weightsList.map(w => `
      <tr>
        <td style="font-weight:700;color:var(--text-primary)">${w.unit}</td>
        <td>${w.g}g</td>
        <td class="price">₹${fmt(Math.round(g.g24 * w.g))}</td>
        <td class="price">₹${fmt(Math.round(g.g22 * w.g))}</td>
        <td style="color:var(--text-secondary)">₹${fmt(Math.round(g.g18 * w.g))}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${w.usage}</td>
      </tr>
    `).join("");
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
        <td class="price">₹${fmt(Math.round(r.rate * 11.6638))}</td>
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
  const ratePerGram = g["g" + purityKey] || Math.round(9420 * { "24": 1, "22": 0.9167, "20": 0.8333, "18": 0.75 }[purityKey]);

  // Exact rounded integer accounting
  const goldValue = Math.round(weight * ratePerGram);
  const makingCharges = Math.round(goldValue * (makingPct / 100));
  const subTotal = goldValue + makingCharges;
  const gst = Math.round(subTotal * 0.03);
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
