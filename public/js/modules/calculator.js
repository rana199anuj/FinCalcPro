/* ══════════════════════════════════════════════════
   FinCalc Pro — Calculator Engine
   Renders any calculator defined in CALCS, handles
   the tab slider bar, 2-column layout, form fields,
   amortization charts, scenario comparison, and modal.
   ══════════════════════════════════════════════════ */

/* ─ All calculator tabs (in order for the top slider bar) */
const CALC_TABS = [
  { id:"home-loan",            icon:"🏠", label:"Home Loan" },
  { id:"car-loan",             icon:"🚗", label:"Car Loan" },
  { id:"education-loan",       icon:"🎓", label:"Education" },
  { id:"two-wheeler",          icon:"🏍️", label:"Two-Wheeler" },
  { id:"credit-card",          icon:"💳", label:"Credit Card" },
  { id:"gold-loan",            icon:"💎", label:"Gold Loan" },
  { id:"consumer-durable",     icon:"📱", label:"Consumer Durable" },
  { id:"home-eligibility",     icon:"✅", label:"Eligibility" },
  { id:"home-affordability",   icon:"💰", label:"Affordability" },
  { id:"home-balance-transfer",icon:"🔄", label:"Balance Transfer" },
  { id:"loan-to-value",        icon:"📐", label:"LTV" },
  { id:"compare-bank",         icon:"🏦", label:"Compare Banks" },
  { id:"loan-against-property",icon:"🏗️", label:"Loan vs Property" },
  { id:"sip",                  icon:"📈", label:"SIP" },
  { id:"lumpsum",              icon:"💵", label:"Lumpsum" },
  { id:"lumpsum-sip",          icon:"🎯", label:"Lumpsum+SIP" },
  { id:"sip-delay",            icon:"⏱️", label:"SIP Delay" },
  { id:"target-value",         icon:"🏆", label:"Target SIP" },
  { id:"cagr",                 icon:"📊", label:"CAGR" },
  { id:"fd",                   icon:"🏛️", label:"FD" },
  { id:"rd",                   icon:"📅", label:"RD" },
  { id:"ppf",                  icon:"🔐", label:"PPF" },
  { id:"retirement",           icon:"👴", label:"Retirement" },
  { id:"inflation",            icon:"📉", label:"Inflation" },
  { id:"gratuity",             icon:"🎁", label:"Gratuity" }
];

/* ─ Current active calculator state ── */
let currentCalcId = "home-loan";
let currentCurrency = "INR";
let currentTenureUnit = "years"; // 'years' or 'months'

/* ─ Helper formatting ── */
function row(label, val, cls = "") {
  return `<div class="summary-row">
    <span class="summary-row-label">${label}</span>
    <span class="summary-row-val${cls ? " " + cls : ""}">${val}</span>
  </div>`;
}

/** Compute EMI result object */
function emiCalc(principal, rate, months, processingFeePct = 0, prepayment = 0) {
  const emi   = calcEMI(principal, rate, months);
  const total = emi * months;
  const processingFee = (principal * processingFeePct) / 100;
  return {
    emi,
    total: total + processingFee,
    interest: total - principal,
    principal,
    processingFee,
    months
  };
}

/**
 * Builds Year-by-Year Amortization Schedule Data
 */
function buildAmortizationSchedule(principal, rate, months) {
  const r = rate / 12 / 100;
  const emi = calcEMI(principal, rate, months);
  let balance = principal;
  let totalPrincipalPaid = 0;
  const yearlyData = [];
  const totalYears = Math.ceil(months / 12);

  for (let y = 1; y <= totalYears; y++) {
    const openingBal = balance;
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let m = 1; m <= 12; m++) {
      const monthIdx = (y - 1) * 12 + m;
      if (monthIdx > months || balance <= 0) break;

      const intPart = balance * r;
      const prinPart = Math.min(balance, emi - intPart);
      yearInterest += intPart;
      yearPrincipal += prinPart;
      balance = Math.max(0, balance - prinPart);
    }

    totalPrincipalPaid += yearPrincipal;
    yearlyData.push({
      year: y,
      opening: openingBal,
      emiPaid: yearPrincipal + yearInterest,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      cumPrincipalPaid: totalPrincipalPaid,
      closing: balance
    });
  }

  return yearlyData;
}

/**
 * Standard EMI Full Layout HTML (Summary Card, Breakdown Chart, Amortization Chart, Comparison Scenarios)
 */
function emiHTML(res, el, cfg = {}, fields = {}) {
  fields = fields || {};
  const principal = res.principal || res.loan || res.loanAmount || 3000000;
  const rate = (fields && fields.rate !== undefined) ? fields.rate : (res.rate || 8.5);
  const months = res.months || (fields && fields.tenure ? fields.tenure * 12 : 240);
  const schedule = buildAmortizationSchedule(principal, rate, months);
  const labels = schedule.map(s => `Year ${s.year}`);
  const principalPaidData = schedule.map(s => s.cumPrincipalPaid);
  const balanceData = schedule.map(s => s.closing);

  // Scenario 1 (Current)
  const sc1Rate = rate;
  const sc1Tenure = Math.round(months / 12) || 5;
  const sc1EMI = res.emi;
  const sc1Interest = res.interest;

  // Scenario 2 (Alternative: rate - 1%, tenure + 2 years)
  const sc2Rate = Math.max(1, +(sc1Rate - 1).toFixed(1));
  const sc2Tenure = sc1Tenure + 2;
  const sc2Res = emiCalc(principal, sc2Rate, sc2Tenure * 12);

  el.innerHTML = `
    <!-- Top Row: Summary Card + Breakdown Chart Card -->
    <div class="results-top-grid">
      <!-- 1. Loan Summary -->
      <div class="summary-card">
        <div class="summary-card-header">📋 Loan Summary</div>
        <div class="summary-hero">
          <div class="summary-hero-label">Monthly EMI</div>
          <div class="summary-hero-value">${fmtC(res.emi)}</div>
          <div class="summary-hero-sub">Payable every month</div>
        </div>
        <div class="summary-breakdown">
          ${row("Principal Amount", fmtC(res.principal))}
          ${row("Total Interest",   fmtC(res.interest), "red")}
          ${row("Total Amount",     fmtC(res.total), "green")}
          ${res.processingFee ? row("Processing Fee", fmtC(res.processingFee), "gold") : ""}
          ${row("Interest Ratio",   ((res.interest / res.principal) * 100).toFixed(1) + "%", "red")}
        </div>
      </div>

      <!-- 2. Breakdown Donut Chart -->
      <div class="breakdown-chart-card">
        <div class="chart-card-header">📊 Breakdown Chart</div>
        <div class="donut-wrap">
          <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
          <div class="donut-center-text">
            <div class="center-label">Total Amount</div>
            <div class="center-val">${fmtC(res.total)}</div>
          </div>
        </div>
        <div class="chart-custom-legend">
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#2563eb"></span>
            <span>Principal: <strong>${fmtC(res.principal)}</strong></span>
          </div>
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#ef4444"></span>
            <span>Interest: <strong>${fmtC(res.interest)}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Row: Loan Amortization Chart -->
    <div class="amortization-card">
      <div class="amortization-header">
        <div class="amortization-title">📈 Loan Amortization</div>
      </div>
      <div class="amortization-canvas-wrap">
        <canvas id="chartAmortization" style="width:100%;height:220px"></canvas>
      </div>
      <div class="amortization-footer">
        <div class="chart-custom-legend" style="margin:0">
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#2563eb"></span>
            <span>Principal Paid</span>
          </div>
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#16a34a"></span>
            <span>Remaining Balance</span>
          </div>
        </div>
        <button class="btn-view-schedule" onclick="openScheduleModal()">📑 View Amortization Schedule</button>
      </div>
    </div>

    <!-- Bottom Row: Compare Loan Options (Scenario 1 vs Scenario 2) -->
    <div class="compare-options-card">
      <div class="compare-options-header">⚖️ Compare Loan Options</div>
      <div class="compare-scenarios-grid">
        <!-- Scenario 1 -->
        <div class="scenario-box">
          <div class="scenario-title">
            <span>Scenario 1</span>
            <span class="scenario-tag">Current</span>
          </div>
          <div class="scenario-inputs">
            <div class="scenario-input-group">
              <label>Amount</label>
              <input type="number" id="sc1Amount" value="${res.principal}" oninput="recalcScenarios()">
            </div>
            <div class="scenario-input-group">
              <label>Rate (%)</label>
              <input type="number" id="sc1Rate" value="${sc1Rate}" step="0.1" oninput="recalcScenarios()">
            </div>
            <div class="scenario-input-group">
              <label>Years</label>
              <input type="number" id="sc1Tenure" value="${sc1Tenure}" oninput="recalcScenarios()">
            </div>
          </div>
          <div class="scenario-results">
            <div class="scenario-res-item">
              <div class="s-label">Monthly EMI</div>
              <div class="s-val" id="sc1ResEMI">${fmtC(sc1EMI)}</div>
            </div>
            <div class="scenario-res-item">
              <div class="s-label">Total Interest</div>
              <div class="s-val" id="sc1ResInt" style="color:#ef4444">${fmtC(sc1Interest)}</div>
            </div>
          </div>
          <button class="btn-apply-scenario" onclick="applyScenario(1)">Apply This Scenario</button>
        </div>

        <!-- Scenario 2 -->
        <div class="scenario-box">
          <div class="scenario-title">
            <span>Scenario 2</span>
            <span class="scenario-tag">Alternative</span>
          </div>
          <div class="scenario-inputs">
            <div class="scenario-input-group">
              <label>Amount</label>
              <input type="number" id="sc2Amount" value="${res.principal}" oninput="recalcScenarios()">
            </div>
            <div class="scenario-input-group">
              <label>Rate (%)</label>
              <input type="number" id="sc2Rate" value="${sc2Rate}" step="0.1" oninput="recalcScenarios()">
            </div>
            <div class="scenario-input-group">
              <label>Years</label>
              <input type="number" id="sc2Tenure" value="${sc2Tenure}" oninput="recalcScenarios()">
            </div>
          </div>
          <div class="scenario-results">
            <div class="scenario-res-item">
              <div class="s-label">Monthly EMI</div>
              <div class="s-val" id="sc2ResEMI">${fmtC(sc2Res.emi)}</div>
            </div>
            <div class="scenario-res-item">
              <div class="s-label">Total Interest</div>
              <div class="s-val" id="sc2ResInt" style="color:#ef4444">${fmtC(sc2Res.interest)}</div>
            </div>
          </div>
          <button class="btn-apply-scenario" onclick="applyScenario(2)">Apply This Scenario</button>
        </div>
      </div>
    </div>
  `;

  // Store schedule globally for modal
  window._currentSchedule = schedule;

  // Initialize charts
  setTimeout(() => {
    FinCharts.createDonut("chartDonut", res.principal, res.interest);
    FinCharts.createAmortizationChart("chartAmortization", labels, principalPaidData, balanceData);
  }, 60);
}

/**
 * Standard Growth Chart result (SIP / Lumpsum).
 */
function growthHTML(res, el, labels, inv, val, mainLabel = "Maturity Value") {
  el.innerHTML = `
    <div class="results-top-grid">
      <div class="summary-card">
        <div class="summary-card-header">📋 Investment Summary</div>
        <div class="summary-hero">
          <div class="summary-hero-label">${mainLabel}</div>
          <div class="summary-hero-value">${fmtC(res.maturity ?? res.total)}</div>
          <div class="summary-hero-sub">${inLakhsCr(res.maturity ?? res.total)}</div>
        </div>
        <div class="summary-breakdown">
          ${row("Total Invested", fmtC(res.invested))}
          ${row("Wealth Gained",  fmtC(res.gains),  "green")}
          ${row("Return %",       ((res.gains / res.invested) * 100).toFixed(1) + "%", "green")}
          ${row("Wealth Ratio",   ((res.maturity ?? res.total) / res.invested).toFixed(2) + "x", "green")}
        </div>
      </div>

      <div class="breakdown-chart-card">
        <div class="chart-card-header">📊 Investment Breakdown</div>
        <div class="donut-wrap">
          <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
          <div class="donut-center-text">
            <div class="center-label">Maturity</div>
            <div class="center-val">${fmtC(res.maturity ?? res.total)}</div>
          </div>
        </div>
        <div class="chart-custom-legend">
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#2563eb"></span>
            <span>Invested: <strong>${fmtC(res.invested)}</strong></span>
          </div>
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#16a34a"></span>
            <span>Gains: <strong>${fmtC(res.gains)}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Growth Curve -->
    <div class="amortization-card">
      <div class="amortization-header">
        <div class="amortization-title">📈 Wealth Growth Curve</div>
      </div>
      <div class="amortization-canvas-wrap">
        <canvas id="chartGrowth" style="width:100%;height:220px"></canvas>
      </div>
    </div>
  `;

  setTimeout(() => {
    FinCharts.createSavingsDonut("chartDonut", res.invested, res.gains);
    FinCharts.createGrowthChart("chartGrowth", labels, inv, val);
  }, 60);
}

/**
 * Standard Savings Donut result (FD / RD).
 */
function savingsHTML(res, el, principalLabel = "Principal") {
  el.innerHTML = `
    <div class="results-top-grid">
      <div class="summary-card">
        <div class="summary-card-header">📋 Savings Summary</div>
        <div class="summary-hero">
          <div class="summary-hero-label">Maturity Amount</div>
          <div class="summary-hero-value">${fmtC(res.maturity)}</div>
          <div class="summary-hero-sub">${inLakhsCr(res.maturity)}</div>
        </div>
        <div class="summary-breakdown">
          ${row(principalLabel,    fmtC(res.principal ?? res.invested))}
          ${row("Interest Earned", fmtC(res.interest), "green")}
          ${row("Return %",        (((res.interest) / (res.principal ?? res.invested)) * 100).toFixed(2) + "%", "green")}
        </div>
      </div>

      <div class="breakdown-chart-card">
        <div class="chart-card-header">📊 Breakdown Chart</div>
        <div class="donut-wrap">
          <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
          <div class="donut-center-text">
            <div class="center-label">Maturity</div>
            <div class="center-val">${fmtC(res.maturity)}</div>
          </div>
        </div>
        <div class="chart-custom-legend">
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#2563eb"></span>
            <span>Principal: <strong>${fmtC(res.principal ?? res.invested)}</strong></span>
          </div>
          <div class="custom-legend-item">
            <span class="legend-square" style="background:#16a34a"></span>
            <span>Interest: <strong>${fmtC(res.interest)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => FinCharts.createSavingsDonut("chartDonut", res.principal ?? res.invested, res.interest), 60);
}

/* ─ Scenario Calculation Helpers ── */
function recalcScenarios() {
  const getNum = id => parseFloat(document.getElementById(id)?.value) || 0;

  // Scenario 1
  const a1 = getNum("sc1Amount"), r1 = getNum("sc1Rate"), t1 = getNum("sc1Tenure");
  const res1 = emiCalc(a1, r1, t1 * 12);
  const emi1 = document.getElementById("sc1ResEMI");
  const int1 = document.getElementById("sc1ResInt");
  if (emi1) emi1.textContent = fmtC(res1.emi);
  if (int1) int1.textContent = fmtC(res1.interest);

  // Scenario 2
  const a2 = getNum("sc2Amount"), r2 = getNum("sc2Rate"), t2 = getNum("sc2Tenure");
  const res2 = emiCalc(a2, r2, t2 * 12);
  const emi2 = document.getElementById("sc2ResEMI");
  const int2 = document.getElementById("sc2ResInt");
  if (emi2) emi2.textContent = fmtC(res2.emi);
  if (int2) int2.textContent = fmtC(res2.interest);
}

function applyScenario(num) {
  const getNum = id => parseFloat(document.getElementById(id)?.value) || 0;
  const a = getNum(`sc${num}Amount`);
  const r = getNum(`sc${num}Rate`);
  const t = getNum(`sc${num}Tenure`);

  // Update main inputs
  const principalInput = document.getElementById("ni-principal") || document.getElementById("ni-amount");
  const rateInput = document.getElementById("ni-rate");
  const tenureInput = document.getElementById("ni-tenure") || document.getElementById("ni-years");

  if (principalInput) {
    principalInput.value = a;
    principalInput.dispatchEvent(new Event("input"));
  }
  if (rateInput) {
    rateInput.value = r;
    rateInput.dispatchEvent(new Event("input"));
  }
  if (tenureInput) {
    tenureInput.value = t;
    tenureInput.dispatchEvent(new Event("input"));
  }

  computeCalc(currentCalcId);
  window.scrollTo({ top: 120, behavior: "smooth" });
}

/* ─ Amortization Schedule Modal ── */
function openScheduleModal() {
  const modal = document.getElementById("scheduleModal");
  if (!modal) return;

  const schedule = window._currentSchedule || [];
  const tbody = document.getElementById("modalTableBody");
  if (tbody) {
    tbody.innerHTML = schedule.map(row => `
      <tr>
        <td><strong>Year ${row.year}</strong></td>
        <td>${fmtC(row.opening)}</td>
        <td>${fmtC(row.emiPaid)}</td>
        <td style="color:#2563eb;font-weight:700">${fmtC(row.principalPaid)}</td>
        <td style="color:#ef4444">${fmtC(row.interestPaid)}</td>
        <td><strong>${fmtC(row.closing)}</strong></td>
      </tr>
    `).join("");
  }

  modal.classList.add("open");
}

function closeScheduleModal() {
  document.getElementById("scheduleModal")?.classList.remove("open");
}

/* ─ Slider fill CSS var ──────────────────────────── */
function updateFill(slider, f) {
  const pct = ((slider.value - f.min) / (f.max - f.min)) * 100;
  slider.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
}

/* ─ Field HTML ───────────────────────────────────── */
function fieldHTML(f) {
  const isTenure = f.id === "tenure" || f.id === "years";

  return `
    <div class="form-group">
      <div class="form-group-header">
        <label>
          <span>${f.label}</span>
        </label>
        <div style="display:flex;align-items:center;gap:6px">
          ${isTenure ? `
          <div class="tenure-toggle-group">
            <button type="button" class="tenure-toggle-btn active" id="btnYears-${f.id}" onclick="setTenureUnit('${f.id}', 'years')">Years</button>
            <button type="button" class="tenure-toggle-btn" id="btnMonths-${f.id}" onclick="setTenureUnit('${f.id}', 'months')">Months</button>
          </div>
          ` : ""}
          <span class="form-val-badge" id="vl-${f.id}">${f.fmt ? f.fmt(f.default) : f.default}</span>
        </div>
      </div>
      <div class="form-input-row">
        <input type="number" class="form-input" id="ni-${f.id}"
          min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
      </div>
      <input type="range" class="range-slider" id="sl-${f.id}"
        min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
    </div>`;
}

function setTenureUnit(fieldId, unit) {
  currentTenureUnit = unit;
  const btnY = document.getElementById(`btnYears-${fieldId}`);
  const btnM = document.getElementById(`btnMonths-${fieldId}`);
  const numInput = document.getElementById(`ni-${fieldId}`);
  const slider = document.getElementById(`sl-${fieldId}`);

  if (unit === "months") {
    btnY?.classList.remove("active");
    btnM?.classList.add("active");
    if (slider) {
      slider.min = 12;
      slider.max = 360;
      slider.step = 6;
      slider.value = (parseFloat(numInput.value) || 20) * 12;
      if (numInput) numInput.value = slider.value;
    }
  } else {
    btnM?.classList.remove("active");
    btnY?.classList.add("active");
    if (slider) {
      slider.min = 1;
      slider.max = 30;
      slider.step = 1;
      slider.value = Math.max(1, Math.round((parseFloat(numInput.value) || 240) / 12));
      if (numInput) numInput.value = slider.value;
    }
  }

  numInput?.dispatchEvent(new Event("input"));
}

/* ─ Render a Calculator Page ─────────────────────── */
function renderCalc(id) {
  currentCalcId = id;
  const cfg = CALCS[id];
  if (!cfg) { navigate("home"); return; }

  const isLoan = id.includes("loan") || id.includes("emi") || id.includes("credit-card") || id.includes("durable") || id.includes("affordability") || id.includes("eligibility") || id.includes("balance");

  // Top Calculator Tab Slider
  const tabBarHTML = `
    <div id="calcTabBar" class="calc-tab-bar">
      <div class="calc-tab-bar-inner">
        <button class="calc-tab-arrow calc-tab-arrow-left" id="tabArrowLeft" title="Scroll left">&#8249;</button>
        <div class="calc-tab-scroll" id="calcTabScroll">
          ${CALC_TABS.map(t => `
            <button class="calc-tab-item${t.id === id ? " active" : ""}"
              onclick="openCalc('${t.id}')">
              <span class="calc-tab-icon">${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join("")}
        </div>
        <button class="calc-tab-arrow calc-tab-arrow-right" id="tabArrowRight" title="Scroll right">&#8250;</button>
      </div>
    </div>`;

  document.getElementById("appMain").innerHTML = tabBarHTML + `
    <div class="calc-page">
      <!-- Calculator Title Header Banner -->
      <div class="calc-banner">
        <div class="calc-banner-left">
          <h1>${cfg.icon} ${cfg.name}</h1>
          <p>${cfg.desc}</p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <!-- Main 2-Column Calculator Layout -->
      <div class="calc-layout">

        <!-- LEFT COLUMN: Input Form -->
        <div class="calc-form-card" id="calcForm">
          <div class="calc-section-header">
            <span>📝 ${isLoan ? "Enter Loan Details" : "Enter Details"}</span>
          </div>

          <!-- Currency Selector -->
          <div class="currency-row">
            <label>Currency</label>
            <select class="currency-select" id="calcCurrencySelect" onchange="changeCurrency(this.value)">
              <option value="INR" selected>Indian Rupee (INR ₹)</option>
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR €)</option>
              <option value="GBP">British Pound (GBP £)</option>
            </select>
          </div>

          <!-- Dynamic Form Fields -->
          ${cfg.fields.map(f => fieldHTML(f)).join("")}

          <!-- Advanced Options (Collapsible) -->
          <div class="advanced-options-card">
            <div class="advanced-options-header" onclick="toggleAdvancedOptions()">
              <span>⚙️ Advanced Options</span>
              <span id="advToggleIcon">▼</span>
            </div>
            <div class="advanced-options-body" id="advOptionsBody" style="display:none">
              <div>
                <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">Processing Fee (%)</label>
                <input type="number" id="advProcessingFee" value="1" step="0.1" min="0" max="5" class="form-input" style="padding:6px 10px" oninput="computeCalc('${id}')">
              </div>
              <div>
                <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">Prepayment (Yearly ₹)</label>
                <input type="number" id="advPrepayment" value="0" step="5000" min="0" class="form-input" style="padding:6px 10px" oninput="computeCalc('${id}')">
              </div>
            </div>
          </div>

          <button class="btn-calc-action" id="calcBtn" onclick="computeCalc('${id}')">Calculate</button>
        </div>

        <!-- RIGHT COLUMN: Output Stream -->
        <div class="calc-results-stream" id="calcResult">
          <!-- Content dynamically rendered by cfg.render() -->
        </div>

      </div>
    </div>

    <!-- Amortization Schedule Modal -->
    <div class="modal-overlay" id="scheduleModal" onclick="if(event.target===this)closeScheduleModal()">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title">📑 Detailed Amortization Schedule</div>
          <button class="modal-close" onclick="closeScheduleModal()">✕</button>
        </div>
        <div class="modal-body">
          <table class="modal-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Opening Balance</th>
                <th>Annual Payment</th>
                <th>Principal Paid</th>
                <th>Interest Paid</th>
                <th>Closing Balance</th>
              </tr>
            </thead>
            <tbody id="modalTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Wire scroll arrows
  const tabScroll = document.getElementById("calcTabScroll");
  document.getElementById("tabArrowLeft") ?.addEventListener("click", () => tabScroll?.scrollBy({ left: -240, behavior: "smooth" }));
  document.getElementById("tabArrowRight")?.addEventListener("click", () => tabScroll?.scrollBy({ left:  240, behavior: "smooth" }));

  // Auto-scroll active tab into view
  const activeTab = tabScroll?.querySelector(".calc-tab-item.active");
  if (activeTab) setTimeout(() => activeTab.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }), 100);

  // Wire up sliders & number inputs
  cfg.fields.forEach(f => {
    const slider   = document.getElementById(`sl-${f.id}`);
    const numInput = document.getElementById(`ni-${f.id}`);
    const valEl    = document.getElementById(`vl-${f.id}`);

    if (!slider || !numInput) return;

    function sync(v) {
      v = Math.min(Math.max(v, f.min), f.max);
      slider.value   = v;
      numInput.value = v;
      if (valEl) valEl.textContent = f.fmt ? f.fmt(v) : v;
      updateFill(slider, f);
    }

    slider.addEventListener("input",   () => sync(parseFloat(slider.value)));
    numInput.addEventListener("input", () => sync(parseFloat(numInput.value) || f.default));

    sync(f.default);
  });

  // Auto-compute on load
  computeCalc(id);
}

function toggleAdvancedOptions() {
  const body = document.getElementById("advOptionsBody");
  const icon = document.getElementById("advToggleIcon");
  if (!body) return;
  const isHidden = body.style.display === "none";
  body.style.display = isHidden ? "flex" : "none";
  if (icon) icon.textContent = isHidden ? "▲" : "▼";
}

function changeCurrency(curr) {
  currentCurrency = curr;
  computeCalc(currentCalcId);
}

/* ─ Compute & Render Calculator Result ──────────── */
function computeCalc(id) {
  const cfg = CALCS[id];
  if (!cfg) return;

  const fields = {};
  cfg.fields.forEach(f => {
    const el = document.getElementById(`ni-${f.id}`);
    fields[f.id] = parseFloat(el?.value ?? f.default);
  });

  // Account for tenure in months if toggled
  if (currentTenureUnit === "months" && fields.tenure) {
    fields.tenureMonths = fields.tenure;
    fields.tenure = fields.tenure / 12;
  }

  // Advanced options
  const feePct = parseFloat(document.getElementById("advProcessingFee")?.value) || 0;
  const prepay = parseFloat(document.getElementById("advPrepayment")?.value) || 0;
  fields.processingFeePct = feePct;
  fields.prepayment = prepay;

  const res = cfg.calc(fields);
  const el  = document.getElementById("calcResult");
  if (el) cfg.render(res, el, cfg, fields);
}
