/* ══════════════════════════════════════════════════
   FinCalc Pro — Loan Calculator Definitions
   Each entry in CALCS_LOANS defines one calculator:
     icon, name, desc, fields[], calc(), render()
   ══════════════════════════════════════════════════ */

const CALCS_LOANS = {

  /* ── HOME LOAN EMI ── */
  "home-loan": {
    icon: "🏠", name: "Home Loan EMI Calculator",
    desc: "Calculate your monthly EMI, total interest and payment schedule.",
    fields: [
      { id:"principal", label:"Loan Amount",         type:"range", min:0,  max:100000000, step:100000, default:3000000, fmt:v=>v===0?"₹0":fmtC(v) },
      { id:"rate",      label:"Annual Interest Rate", type:"range", min:0,  max:20,       step:0.1,   default:8.5,     fmt:v=>v+"%"  },
      { id:"tenure",    label:"Loan Tenure (Years)",  type:"range", min:0,  max:30,       step:1,     default:20,      fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const months = Math.round((f.tenureMonths || f.tenure * 12));
      return emiCalc(f.principal, f.rate, months, f.processingFeePct, f.prepayment);
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  },

  /* ── ELIGIBILITY ── */
  "home-eligibility": {
    icon: "✅", name: "Home Loan Eligibility Calculator",
    desc: "Find the maximum loan amount you qualify for based on income and FOIR.",
    fields: [
      { id:"income",      label:"Monthly Net Income",       type:"range", min:0, max:500000, step:5000, default:75000, fmt:v=>fmtC(v) },
      { id:"obligations", label:"Existing EMI Obligations", type:"range", min:0, max:100000, step:1000, default:5000,  fmt:v=>fmtC(v) },
      { id:"rate",        label:"Expected Interest Rate",   type:"range", min:1, max:20,     step:0.1,  default:8.5,   fmt:v=>v+"%" },
      { id:"tenure",      label:"Loan Tenure (Years)",      type:"range", min:5, max:30,     step:1,    default:20,    fmt:v=>v+" Yrs" },
      { id:"foir",        label:"FOIR — Fixed Obligation to Income Ratio",
        type:"select",
        options:[
          {value:50, label:"50% FOIR"},
          {value:55, label:"55% FOIR"},
          {value:60, label:"60% FOIR"},
          {value:65, label:"65% FOIR"},
          {value:70, label:"70% FOIR (Maximum)"},
        ],
        default:50, fmt:v=>v+"% FOIR" }
    ],
    calc(f) {
      const foirPct = parseFloat(f.foir) || 50;
      const n = Math.round(f.tenureMonths || f.tenure * 12);
      const availEMI = f.income * (foirPct / 100) - f.obligations;
      if (availEMI <= 0) return { eligible: 0, availEMI: 0, income: f.income, obligations: f.obligations, foir: foirPct, rate: f.rate, months: n, estimatedEMI: 0, totalInterest: 0 };
      const r = f.rate / 12 / 100;
      const eligible = availEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n));
      const estimatedEMI = calcEMI(eligible, f.rate, n);
      const totalInterest = Math.max(0, estimatedEMI * n - eligible);
      return { eligible, availEMI, income: f.income, obligations: f.obligations, foir: foirPct, rate: f.rate, months: n, estimatedEMI, totalInterest };
    },
    render(res, el) {
      if (res.eligible <= 0) {
        el.innerHTML = `
          <div class="summary-card" style="padding:28px">
            <div class="summary-hero">
              <div class="summary-hero-label">⚠️ Not Eligible</div>
              <div class="summary-hero-value" style="color:var(--red)">No Loan</div>
              <div class="summary-hero-sub">Existing EMIs exceed the ${res.foir}% FOIR limit at your income. Reduce existing EMIs or select a higher FOIR.</div>
            </div>
          </div>`;
        return;
      }
      const schedule = buildAmortizationSchedule(res.eligible, res.rate || 8.5, res.months || 240);
      window._currentSchedule = schedule;
      const labels = schedule.map(s => `Year ${s.year}`);
      const principalPaidData = schedule.map(s => s.cumPrincipalPaid);
      const balanceData = schedule.map(s => s.closing);
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">✅ Eligibility Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Maximum Eligible Loan</div>
              <div class="summary-hero-value">${fmtC(Math.max(0, res.eligible))}</div>
              <div class="summary-hero-sub">${inLakhsCr(res.eligible)}</div>
            </div>
            <div class="summary-breakdown">
              ${row("Monthly Income",           fmtC(res.income))}
              ${row("Existing EMIs",            fmtC(res.obligations), "red")}
              ${row("FOIR Applied",             res.foir + "%", "green")}
              ${row("Available EMI",            fmtC(Math.max(0, res.availEMI)), "green")}
              ${row("Estimated Monthly EMI",    fmtC(res.estimatedEMI))}
              ${row("Total Interest (est.)",    fmtC(res.totalInterest), "red")}
            </div>
          </div>
          <div class="breakdown-chart-card">
            <div class="chart-card-header">📊 Loan Composition</div>
            <div class="donut-wrap">
              <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
              <div class="donut-center-text">
                <div class="center-label">Total Cost</div>
                <div class="center-val">${fmtC(res.eligible + res.totalInterest)}</div>
              </div>
            </div>
            <div class="chart-custom-legend">
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Principal: <strong>${fmtC(res.eligible)}</strong></span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#ef4444"></span><span>Interest: <strong>${fmtC(res.totalInterest)}</strong></span></div>
            </div>
          </div>
        </div>
        <div class="amortization-card">
          <div class="amortization-header"><div class="amortization-title">📈 Loan Amortization (Estimated)</div></div>
          <div class="amortization-canvas-wrap"><canvas id="chartAmortization" style="width:100%;height:220px"></canvas></div>
          <div class="amortization-footer">
            <div class="chart-custom-legend" style="margin:0">
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Principal Paid</span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Remaining Balance</span></div>
            </div>
            <button class="btn-view-schedule" onclick="openScheduleModal()">📑 View Amortization Schedule</button>
          </div>
        </div>`;
      setTimeout(() => {
        FinCharts.createDonut("chartDonut", res.eligible, res.totalInterest);
        FinCharts.createAmortizationChart("chartAmortization", labels, principalPaidData, balanceData);
      }, 60);
    }
  },

  /* ── AFFORDABILITY ── */
  "home-affordability": {
    icon: "💰", name: "Home Affordability Calculator",
    desc: "Find the maximum home price you can afford.",
    fields: [
      { id:"income",      label:"Monthly Income",         type:"range", min:0,  max:500000,  step:5000,  default:80000,   fmt:v=>fmtC(v) },
      { id:"downPayment", label:"Down Payment Available", type:"range", min:0,  max:5000000, step:50000, default:1000000, fmt:v=>fmtC(v) },
      { id:"rate",        label:"Interest Rate (p.a.)",   type:"range", min:1,  max:20,      step:0.1,   default:8.5,     fmt:v=>v+"%" },
      { id:"tenure",      label:"Loan Tenure (Years)",    type:"range", min:5,  max:30,      step:1,     default:20,      fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const maxEMI = f.income * 0.4;
      const r = f.rate / 12 / 100;
      const n = Math.round(f.tenureMonths || f.tenure * 12);
      const maxLoan = maxEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n));
      const totalInterest = Math.max(0, maxEMI * n - maxLoan);
      return { affordable: maxLoan + f.downPayment, maxLoan, dp: f.downPayment, maxEMI, rate: f.rate, months: n, totalInterest };
    },
    render(res, el) {
      const schedule = buildAmortizationSchedule(res.maxLoan, res.rate || 8.5, res.months || 240);
      window._currentSchedule = schedule;
      const labels = schedule.map(s => `Year ${s.year}`);
      const principalPaidData = schedule.map(s => s.cumPrincipalPaid);
      const balanceData = schedule.map(s => s.closing);
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">💰 Affordability Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Affordable Home Price</div>
              <div class="summary-hero-value">${fmtC(res.affordable)}</div>
              <div class="summary-hero-sub">${inLakhsCr(res.affordable)}</div>
            </div>
            <div class="summary-breakdown">
              ${row("Maximum Home Loan", fmtC(res.maxLoan))}
              ${row("Down Payment",      fmtC(res.dp), "green")}
              ${row("Max Monthly EMI",   fmtC(res.maxEMI))}
              ${row("Total Interest",    fmtC(res.totalInterest), "red")}
              ${row("Down Payment %",    ((res.dp/res.affordable)*100).toFixed(1)+"%")}
            </div>
          </div>
          <div class="breakdown-chart-card">
            <div class="chart-card-header">📊 Cost Breakdown</div>
            <div class="donut-wrap">
              <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
              <div class="donut-center-text">
                <div class="center-label">Home Price</div>
                <div class="center-val">${fmtC(res.affordable)}</div>
              </div>
            </div>
            <div class="chart-custom-legend">
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Loan: <strong>${fmtC(res.maxLoan)}</strong></span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Down Payment: <strong>${fmtC(res.dp)}</strong></span></div>
            </div>
          </div>
        </div>
        <div class="amortization-card">
          <div class="amortization-header"><div class="amortization-title">📈 Loan Amortization</div></div>
          <div class="amortization-canvas-wrap"><canvas id="chartAmortization" style="width:100%;height:220px"></canvas></div>
          <div class="amortization-footer">
            <div class="chart-custom-legend" style="margin:0">
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Principal Paid</span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Remaining Balance</span></div>
            </div>
            <button class="btn-view-schedule" onclick="openScheduleModal()">📑 View Amortization Schedule</button>
          </div>
        </div>`;
      setTimeout(() => {
        FinCharts.createSavingsDonut("chartDonut", res.maxLoan, res.dp);
        FinCharts.createAmortizationChart("chartAmortization", labels, principalPaidData, balanceData);
      }, 60);
    }
  },

  /* ── BALANCE TRANSFER ── */
  "home-balance-transfer": {
    icon: "🔄", name: "Home Loan Balance Transfer",
    desc: "Calculate savings by switching to a lower interest rate.",
    fields: [
      { id:"outstanding", label:"Outstanding Loan Amount",  type:"range", min:100000, max:10000000, step:50000, default:2500000, fmt:v=>fmtC(v) },
      { id:"currentRate", label:"Current Rate (p.a.)",      type:"range", min:1, max:20, step:0.1, default:9.5, fmt:v=>v+"%" },
      { id:"newRate",     label:"New Rate (p.a.)",           type:"range", min:1, max:20, step:0.1, default:8.5, fmt:v=>v+"%" },
      { id:"tenure",      label:"Remaining Tenure (Years)", type:"range", min:1, max:30, step:1,   default:15,  fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const months = f.tenure * 12;
      const oldEMI = calcEMI(f.outstanding, f.currentRate, months);
      const newEMI = calcEMI(f.outstanding, f.newRate,     months);
      return { oldEMI, newEMI, emiSaving: oldEMI - newEMI, totalSaving: (oldEMI - newEMI) * months };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">🔄 Balance Transfer Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Total Savings</div>
              <div class="summary-hero-value" style="color:var(--green)">${fmtC(res.totalSaving)}</div>
              <div class="summary-hero-sub">over remaining tenure</div>
            </div>
            <div class="summary-breakdown">
              ${row("Current EMI",     fmtC(res.oldEMI), "red")}
              ${row("New EMI",         fmtC(res.newEMI), "green")}
              ${row("Monthly Savings", fmtC(res.emiSaving), "green")}
              ${row("Total Saved",     fmtC(res.totalSaving), "green")}
            </div>
          </div>
        </div>`;
    }
  },

  /* ── LTV ── */
  "loan-to-value": {
    icon: "📐", name: "Loan to Value (LTV) Calculator",
    desc: "Calculate LTV ratio — key metric banks use for loan approval.",
    fields: [
      { id:"propertyValue", label:"Property Value", type:"range", min:0, max:200000000, step:500000, default:10000000, fmt:v=>fmtC(v) },
      { id:"loanAmount",    label:"Loan Amount",    type:"range", min:100000, max:10000000, step:50000,  default:4000000, fmt:v=>fmtC(v) }
    ],
    calc(f) {
      const ltv = (f.loanAmount / f.propertyValue) * 100;
      return { ltv, dp: f.propertyValue - f.loanAmount, pv: f.propertyValue, la: f.loanAmount };
    },
    render(res, el) {
      const col = res.ltv <= 75 ? "var(--green)" : res.ltv <= 85 ? "var(--gold)" : "var(--red)";
      const tag = res.ltv <= 75 ? "✅ Excellent" : res.ltv <= 80 ? "⚠️ Good" : res.ltv <= 90 ? "🔶 Acceptable" : "❌ Too High";
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">📐 LTV Analysis</div>
            <div class="summary-hero">
              <div class="summary-hero-label">LTV Ratio</div>
              <div class="summary-hero-value" style="color:${col}">${res.ltv.toFixed(1)}%</div>
              <div class="summary-hero-sub">${tag}</div>
            </div>
            <div class="summary-breakdown">
              ${row("Property Value", fmtC(res.pv))}
              ${row("Loan Amount",    fmtC(res.la))}
              ${row("Down Payment",   fmtC(res.dp), "green")}
              ${row("Max at 90% LTV", fmtC(res.pv * 0.9))}
              ${row("Max at 80% LTV", fmtC(res.pv * 0.8))}
            </div>
          </div>
        </div>`;
    }
  },

  /* ── COMPARE BANK ── */
  "compare-bank": {
    icon: "🏦", name: "Compare Bank EMI",
    desc: "Compare EMIs across 4 banks to find the best deal.",
    fields: [
      { id:"amount", label:"Loan Amount",    type:"range", min:100000, max:100000000, step:100000, default:3000000, fmt:v=>fmtC(v) },
      { id:"tenure", label:"Tenure (Years)", type:"range", min:1, max:30, step:1,    default:20, fmt:v=>v+" Yrs" },
      { id:"rate1",  label:"Bank A Rate",    type:"range", min:1, max:20, step:0.05, default:8.35, fmt:v=>v+"%" },
      { id:"rate2",  label:"Bank B Rate",    type:"range", min:1, max:20, step:0.05, default:8.5,  fmt:v=>v+"%" },
      { id:"rate3",  label:"Bank C Rate",    type:"range", min:1, max:20, step:0.05, default:8.7,  fmt:v=>v+"%" },
      { id:"rate4",  label:"Bank D Rate",    type:"range", min:1, max:20, step:0.05, default:9.0,  fmt:v=>v+"%" }
    ],
    calc(f) {
      const months = f.tenure * 12;
      const names  = ["SBI","HDFC","ICICI","Axis"];
      return {
        banks: [f.rate1, f.rate2, f.rate3, f.rate4].map((r, i) => {
          const emi = calcEMI(f.amount, r, months);
          return { name: names[i], rate: r, emi, interest: emi * months - f.amount };
        })
      };
    },
    render(res, el) {
      const minEMI = Math.min(...res.banks.map(b => b.emi));
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">🏦 Bank Comparison</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Best EMI</div>
              <div class="summary-hero-value">${fmtC(minEMI)}</div>
              <div class="summary-hero-sub">${res.banks.find(b => b.emi === minEMI).name} · ${res.banks.find(b => b.emi === minEMI).rate}%</div>
            </div>
            <div style="overflow:auto;border-radius:var(--radius-md);border:1px solid var(--border)">
              <table class="compare-table">
                <thead><tr><th>Bank</th><th>Rate</th><th>EMI</th><th>Total Interest</th><th>vs Best</th></tr></thead>
                <tbody>
                  ${res.banks.map(b => `
                    <tr>
                      <td>${b.name}</td>
                      <td>${b.rate}%</td>
                      <td style="color:var(--text-primary);font-weight:700">${fmtC(b.emi)}</td>
                      <td style="color:var(--red)">${fmtC(b.interest)}</td>
                      <td style="color:${b.emi === minEMI ? "var(--green)" : "var(--red)"}">${b.emi === minEMI ? "🏆 Best" : "+"+fmtC(b.emi - minEMI)+"/mo"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    }
  },

  /* ── LOAN AGAINST PROPERTY ── */
  "loan-against-property": {
    icon: "🏗️", name: "Loan Against Property",
    desc: "Calculate loan amount and EMI against your property. Default: 80% LTV, 20-year tenure.",
    fields: [
      { id:"propertyValue", label:"Property Market Value", type:"range", min:500000, max:50000000, step:100000, default:8000000, fmt:v=>fmtC(v) },
      { id:"ltv",           label:"LTV Ratio",             type:"range", min:10, max:90, step:5,   default:80,   fmt:v=>v+"%" },
      { id:"rate",          label:"Interest Rate (p.a.)",  type:"range", min:1,  max:20, step:0.1, default:10.5, fmt:v=>v+"%" },
      { id:"tenure",        label:"Tenure (Years)",        type:"range", min:1,  max:30, step:1,   default:20,   fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const loan   = f.propertyValue * f.ltv / 100;
      const months = Math.round((f.tenureMonths || f.tenure * 12));
      const result = emiCalc(loan, f.rate, months, f.processingFeePct, f.prepayment);
      result.loan = loan;
      return result;
    },
    render(res, el, cfg, fields) {
      // For Loan vs Property, show principal and EMI in same column
      const schedule = buildAmortizationSchedule(res.principal || res.loan, fields?.rate || 10.5, res.months || 240);
      const labels = schedule.map(s => `Year ${s.year}`);
      const principalPaidData = schedule.map(s => s.cumPrincipalPaid);
      const balanceData = schedule.map(s => s.closing);

      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">🏗️ Loan Summary</div>
            <div class="summary-breakdown" style="gap:0">
              <div class="lap-dual-col">
                <div class="lap-col-item">
                  <div class="lap-col-label">Principal Amount</div>
                  <div class="lap-col-value">${fmtC(res.principal || res.loan)}</div>
                </div>
                <div class="lap-col-divider"></div>
                <div class="lap-col-item">
                  <div class="lap-col-label">Monthly EMI</div>
                  <div class="lap-col-value accent">${fmtC(res.emi)}</div>
                </div>
              </div>
              ${row("Total Interest", fmtC(res.interest), "red")}
              ${row("Total Amount",   fmtC(res.total),    "green")}
              ${res.processingFee ? row("Processing Fee", fmtC(res.processingFee), "gold") : ""}
              ${row("Interest Ratio", ((res.interest / (res.principal || res.loan)) * 100).toFixed(1) + "%", "red")}
            </div>
          </div>
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
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Principal: <strong>${fmtC(res.principal||res.loan)}</strong></span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#ef4444"></span><span>Interest: <strong>${fmtC(res.interest)}</strong></span></div>
            </div>
          </div>
        </div>
        <div class="amortization-card">
          <div class="amortization-header"><div class="amortization-title">📈 Loan Amortization</div></div>
          <div class="amortization-canvas-wrap"><canvas id="chartAmortization" style="width:100%;height:220px"></canvas></div>
          <div class="amortization-footer">
            <div class="chart-custom-legend" style="margin:0">
              <div class="custom-legend-item"><span class="legend-square" style="background:#2563eb"></span><span>Principal Paid</span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Remaining Balance</span></div>
            </div>
            <button class="btn-view-schedule" onclick="openScheduleModal()">📑 View Amortization Schedule</button>
          </div>
        </div>
      `;
      window._currentSchedule = schedule;
      setTimeout(() => {
        FinCharts.createDonut("chartDonut", res.principal || res.loan, res.interest);
        FinCharts.createAmortizationChart("chartAmortization", labels, principalPaidData, balanceData);
      }, 60);
    }
  },

  /* ── CAR LOAN ── */
  "car-loan": {
    icon: "🚗", name: "Car Loan EMI Calculator",
    desc: "Calculate monthly EMI for your car purchase loan.",
    fields: [
      { id:"principal", label:"Loan Amount",         type:"range", min:0, max:5000000, step:25000, default:800000, fmt:v=>fmtC(v) },
      { id:"rate",      label:"Interest Rate (p.a.)", type:"range", min:1, max:20, step:0.1, default:9.5, fmt:v=>v+"%" },
      { id:"tenure",    label:"Tenure (Years)",       type:"range", min:1, max:7,  step:1,   default:5,   fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const months = Math.round((f.tenureMonths || f.tenure * 12));
      return emiCalc(f.principal, f.rate, months, f.processingFeePct, f.prepayment);
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  },

  /* ── TWO WHEELER ── */
  "two-wheeler": {
    icon: "🏍️", name: "Two-Wheeler Loan Calculator",
    desc: "Calculate monthly EMI for bike or scooter loans. Default tenure: 7 years.",
    fields: [
      { id:"principal", label:"Loan Amount",         type:"range", min:0,  max:500000, step:5000, default:100000, fmt:v=>fmtC(v) },
      { id:"rate",      label:"Interest Rate (p.a.)", type:"range", min:1,  max:24,     step:0.1, default:10.5,   fmt:v=>v+"%" },
      { id:"tenure",    label:"Tenure (Years)",       type:"range", min:0,  max:7,      step:1,   default:7,      fmt:v=>v===0?"0 Yrs":v+" Yrs" }
    ],
    calc(f) {
      const months = Math.round((f.tenureMonths || f.tenure * 12));
      return emiCalc(f.principal, f.rate, months, f.processingFeePct, f.prepayment);
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  },

  /* ── EDUCATION LOAN ── */
  "education-loan": {
    icon: "🎓", name: "Education Loan Calculator",
    desc: "Calculate EMI with moratorium (grace) period.",
    fields: [
      { id:"principal",  label:"Loan Amount",              type:"range", min:100000, max:5000000, step:25000, default:1000000, fmt:v=>fmtC(v) },
      { id:"rate",       label:"Interest Rate (p.a.)",     type:"range", min:1, max:20, step:0.1, default:10.5, fmt:v=>v+"%" },
      { id:"moratorium", label:"Moratorium (Months)",      type:"range", min:0, max:60, step:6,   default:12,   fmt:v=>v+" Mo" },
      { id:"tenure",     label:"Repayment Tenure (Years)", type:"range", min:1, max:15, step:1,   default:7,    fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const interestDuring = f.principal * (f.rate / 12 / 100) * f.moratorium;
      const loanAfter      = f.principal + interestDuring;
      const months         = Math.round((f.tenureMonths || f.tenure * 12));
      const res            = emiCalc(loanAfter, f.rate, months, f.processingFeePct, f.prepayment);
      res.originalPrincipal = f.principal;
      res.interestDuring = interestDuring;
      return res;
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  },

  /* ── GOLD LOAN (Bank of Baroda reference) ── */
  "gold-loan": {
    icon: "💎", name: "Gold Loan Calculator",
    desc: "Calculate loan amount against your gold jewellery. Uses live MCX gold rates. Bank of Baroda reference model.",
    fields: [
      { id:"weight", label:"Gold Weight (grams)",   type:"range", min:0,  max:1000, step:1,   default:50,  fmt:v=>v+"g" },
      { id:"purity", label:"Gold Purity (Karat)",   type:"range", min:18, max:24,   step:2,   default:22,  fmt:v=>v+"K" },
      { id:"ltv",    label:"LTV Ratio",
        type:"select",
        options:[
          {value:65, label:"65% LTV"},
          {value:75, label:"75% LTV — RBI Mandated Max"},
          {value:85, label:"85% LTV — Special Scheme"},
        ],
        default:75, fmt:v=>v+"% LTV" },
      { id:"rate",   label:"Interest Rate (p.a.)",  type:"range", min:7,  max:30,   step:0.5, default:8.8, fmt:v=>v+"%" },
      { id:"tenure", label:"Loan Tenure (Months)",  type:"range", min:1,  max:36,   step:1,   default:12,  fmt:v=>v+" Mo" }
    ],
    calc(f) {
      const liveRate24K = (typeof marketData !== 'undefined' && marketData?.gold?.g24) || 15692;
      const pureMult    = { 18: 0.75, 20: 0.833, 22: 0.917, 24: 1 }[Math.round(f.purity)] || 0.917;
      const ratePerGram = liveRate24K * pureMult;
      const goldValue   = f.weight * ratePerGram;
      const ltvPct      = parseFloat(f.ltv) || 75;
      const loanAmount  = goldValue * ltvPct / 100;
      const res         = emiCalc(loanAmount, f.rate, f.tenure, f.processingFeePct, f.prepayment);
      res.goldValue     = goldValue;
      res.ratePerGram   = ratePerGram;
      res.liveRate24K   = liveRate24K;
      res.loanAmount    = loanAmount;
      res.ltvPct        = ltvPct;
      res.rate          = f.rate;
      return res;
    },
    render(res, el) {
      // Build monthly amortization for gold loan (tenure in months)
      const totalMonths = res.months || 12;
      const r = (res.rate || 8.8) / 12 / 100;
      const principal = res.principal || res.loanAmount;
      const emi = res.emi;
      let balance = principal, cumPrincipal = 0;
      const monthlySchedule = [];
      for (let m = 1; m <= totalMonths; m++) {
        const intPart = balance * r;
        const prinPart = Math.min(balance, Math.max(0, emi - intPart));
        cumPrincipal += prinPart;
        balance = Math.max(0, balance - prinPart);
        monthlySchedule.push({ year: m, opening: balance + prinPart, emiPaid: emi, principalPaid: prinPart, interestPaid: intPart, cumPrincipalPaid: cumPrincipal, closing: balance });
      }
      window._currentSchedule = monthlySchedule;
      const labels = monthlySchedule.map(s => `Mo ${s.year}`);
      const principalPaidData = monthlySchedule.map(s => s.cumPrincipalPaid);
      const balanceData = monthlySchedule.map(s => s.closing);

      el.innerHTML = `
        <div class="gold-loan-live-banner">
          <span class="gold-live-dot"></span>
          <span>Live Gold Rate (24K): <strong>₹${fmt(res.liveRate24K)}/g</strong></span>
          <span class="gold-live-sep">|</span>
          <span>Purity Rate: <strong>₹${fmt(res.ratePerGram)}/g</strong></span>
          <span class="gold-live-sep">|</span>
          <span>LTV: <strong>${res.ltvPct}%</strong></span>
        </div>
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">💎 Gold Loan Summary</div>
            <div class="summary-breakdown" style="gap:0">
              <div class="lap-dual-col">
                <div class="lap-col-item">
                  <div class="lap-col-label">Loan Amount</div>
                  <div class="lap-col-value">${fmtC(principal)}</div>
                </div>
                <div class="lap-col-divider"></div>
                <div class="lap-col-item">
                  <div class="lap-col-label">Monthly EMI</div>
                  <div class="lap-col-value accent">${fmtC(res.emi)}</div>
                </div>
              </div>
              ${row("Gold Market Value",   fmtC(res.goldValue))}
              ${row("LTV ("+res.ltvPct+"% of Gold Value)", fmtC(res.loanAmount))}
              ${row("Total Interest",      fmtC(res.interest), "red")}
              ${row("Total Payment",       fmtC(res.total), "green")}
              ${res.processingFee ? row("Processing Fee", fmtC(res.processingFee), "gold") : ""}
            </div>
          </div>
          <div class="breakdown-chart-card">
            <div class="chart-card-header">📊 Breakdown</div>
            <div class="donut-wrap">
              <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
              <div class="donut-center-text">
                <div class="center-label">Total Pay</div>
                <div class="center-val">${fmtC(res.total)}</div>
              </div>
            </div>
            <div class="chart-custom-legend">
              <div class="custom-legend-item"><span class="legend-square" style="background:#f59e0b"></span><span>Principal: <strong>${fmtC(principal)}</strong></span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#ef4444"></span><span>Interest: <strong>${fmtC(res.interest)}</strong></span></div>
            </div>
          </div>
        </div>
        <div class="amortization-card">
          <div class="amortization-header"><div class="amortization-title">📈 Monthly Repayment Schedule</div></div>
          <div class="amortization-canvas-wrap"><canvas id="chartAmortization" style="width:100%;height:220px"></canvas></div>
          <div class="amortization-footer">
            <div class="chart-custom-legend" style="margin:0">
              <div class="custom-legend-item"><span class="legend-square" style="background:#f59e0b"></span><span>Principal Paid</span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Remaining Balance</span></div>
            </div>
            <button class="btn-view-schedule" onclick="openScheduleModal()">📑 View Repayment Schedule</button>
          </div>
        </div>`;
      setTimeout(() => {
        FinCharts.createDonut("chartDonut", principal, res.interest);
        FinCharts.createAmortizationChart("chartAmortization", labels, principalPaidData, balanceData);
      }, 60);
    }
  },

  /* ── CREDIT CARD ── */
  "credit-card": {
    icon: "💳", name: "Credit Card Payoff Planner",
    desc: "See how long it takes to pay off your credit card balance.",
    fields: [
      { id:"outstanding", label:"Outstanding Balance",  type:"range", min:10000, max:1000000, step:5000, default:100000, fmt:v=>fmtC(v) },
      { id:"rate",        label:"Annual Interest Rate", type:"range", min:12, max:48, step:1, default:36, fmt:v=>v+"%" },
      { id:"payment",     label:"Monthly Payment",      type:"range", min:1000, max:100000, step:500, default:10000, fmt:v=>fmtC(v) }
    ],
    calc(f) {
      const r = f.rate / 12 / 100;
      if (f.payment <= f.outstanding * r) return { payable: false };
      let bal = f.outstanding, months = 0, totalInt = 0;
      while (bal > 0 && months < 600) {
        const intC = bal * r;
        totalInt  += intC;
        bal        = bal + intC - f.payment;
        months++;
      }
      return { months, totalInt, totalPaid: f.outstanding + totalInt, outstanding: f.outstanding, payable: true };
    },
    render(res, el) {
      if (!res.payable) {
        el.innerHTML = `<div class="summary-hero"><div class="summary-hero-label">Warning</div>
          <div class="summary-hero-value" style="color:var(--red)">Never paid off!</div>
          <div class="summary-hero-sub">Monthly payment is less than accrued interest. Increase your payment.</div></div>`;
        return;
      }
      const y = Math.floor(res.months / 12), m = res.months % 12;
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">💳 Payoff Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Payoff Time</div>
              <div class="summary-hero-value">${y > 0 ? y+"y " : ""}${m}m</div>
              <div class="summary-hero-sub">${res.months} total months</div>
            </div>
            <div class="summary-breakdown">
              ${row("Outstanding",       fmtC(res.outstanding))}
              ${row("Total Interest",    fmtC(res.totalInt), "red")}
              ${row("Total Amount Paid", fmtC(res.totalPaid))}
              ${row("Interest Ratio",    ((res.totalInt/res.outstanding)*100).toFixed(0)+"%", "red")}
            </div>
          </div>
        </div>`;
    }
  },

  /* ── CONSUMER DURABLE ── */
  "consumer-durable": {
    icon: "📱", name: "Consumer Durable Loan",
    desc: "Calculate EMI for electronics, appliances and gadgets.",
    fields: [
      { id:"principal", label:"Purchase Amount",     type:"range", min:5000,  max:500000, step:5000, default:50000, fmt:v=>fmtC(v) },
      { id:"rate",      label:"Interest Rate (p.a.)", type:"range", min:0, max:24, step:0.5, default:14, fmt:v=>v+"%" },
      { id:"tenure",    label:"Tenure (Months)",      type:"range", min:3, max:24, step:3,   default:12, fmt:v=>v+" Mo" }
    ],
    calc(f) {
      return emiCalc(f.principal, f.rate, f.tenure, f.processingFeePct, f.prepayment);
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  }

}; // end CALCS_LOANS
