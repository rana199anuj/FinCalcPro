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
      { id:"principal", label:"Loan Amount",         type:"range", min:100000,  max:10000000, step:50000, default:3000000, fmt:v=>fmtC(v) },
      { id:"rate",      label:"Annual Interest Rate", type:"range", min:1,       max:20,       step:0.1,   default:8.5,     fmt:v=>v+"%" },
      { id:"tenure",    label:"Loan Tenure (Years)",  type:"range", min:1,       max:30,       step:1,     default:20,      fmt:v=>v+" Yrs" }
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
    desc: "Find the maximum loan you can get based on your income.",
    fields: [
      { id:"income",      label:"Monthly Net Income",       type:"range", min:20000, max:500000, step:5000, default:75000, fmt:v=>fmtC(v) },
      { id:"obligations", label:"Existing EMI Obligations", type:"range", min:0,     max:100000, step:1000, default:5000,  fmt:v=>fmtC(v) },
      { id:"rate",        label:"Expected Interest Rate",   type:"range", min:1,     max:20,     step:0.1,  default:8.5,   fmt:v=>v+"%" },
      { id:"tenure",      label:"Loan Tenure (Years)",      type:"range", min:5,     max:30,     step:1,    default:20,    fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const availEMI = f.income * 0.5 - f.obligations;
      if (availEMI <= 0) return { eligible: 0, availEMI: 0, income: f.income, obligations: f.obligations };
      const r = f.rate / 12 / 100, n = f.tenure * 12;
      const eligible = availEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n));
      return { eligible, availEMI, income: f.income, obligations: f.obligations };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">📋 Eligibility Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Maximum Eligible Loan</div>
              <div class="summary-hero-value">${fmtC(Math.max(0, res.eligible))}</div>
              <div class="summary-hero-sub">${res.eligible > 0 ? inLakhsCr(res.eligible) : "Reduce your existing obligations"}</div>
            </div>
            <div class="summary-breakdown">
              ${row("Monthly Income",           fmtC(res.income))}
              ${row("Existing EMIs",            fmtC(res.obligations), "red")}
              ${row("EMI Available (50% FOIR)", fmtC(Math.max(0, res.availEMI)), "green")}
              ${row("FOIR Used",                ((res.obligations/res.income)*100).toFixed(1)+"%")}
            </div>
          </div>
        </div>`;
    }
  },

  /* ── AFFORDABILITY ── */
  "home-affordability": {
    icon: "💰", name: "Home Affordability Calculator",
    desc: "Find the maximum home price you can afford.",
    fields: [
      { id:"income",      label:"Monthly Income",         type:"range", min:20000,  max:500000,  step:5000,  default:80000,   fmt:v=>fmtC(v) },
      { id:"downPayment", label:"Down Payment Available", type:"range", min:100000, max:5000000, step:50000, default:1000000, fmt:v=>fmtC(v) },
      { id:"rate",        label:"Interest Rate (p.a.)",   type:"range", min:1,      max:20,      step:0.1,   default:8.5,     fmt:v=>v+"%" },
      { id:"tenure",      label:"Loan Tenure (Years)",    type:"range", min:5,      max:30,      step:1,     default:20,      fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const maxEMI = f.income * 0.4;
      const r = f.rate / 12 / 100, n = f.tenure * 12;
      const maxLoan = maxEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n));
      return { affordable: maxLoan + f.downPayment, maxLoan, dp: f.downPayment, maxEMI };
    },
    render(res, el) {
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
              ${row("Down Payment %",    ((res.dp/res.affordable)*100).toFixed(1)+"%")}
            </div>
          </div>
        </div>`;
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
      { id:"propertyValue", label:"Property Value", type:"range", min:500000, max:50000000, step:100000, default:5000000,  fmt:v=>fmtC(v) },
      { id:"loanAmount",    label:"Loan Amount",    type:"range", min:100000, max:10000000, step:50000,  default:3500000, fmt:v=>fmtC(v) }
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
      { id:"amount", label:"Loan Amount",    type:"range", min:100000, max:10000000, step:50000, default:3000000, fmt:v=>fmtC(v) },
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
    desc: "Calculate loan amount and EMI against your property.",
    fields: [
      { id:"propertyValue", label:"Property Market Value", type:"range", min:500000, max:50000000, step:100000, default:8000000, fmt:v=>fmtC(v) },
      { id:"ltv",           label:"LTV Ratio",             type:"range", min:50, max:75, step:5,   default:60,   fmt:v=>v+"%" },
      { id:"rate",          label:"Interest Rate (p.a.)",  type:"range", min:1,  max:20, step:0.1, default:10.5, fmt:v=>v+"%" },
      { id:"tenure",        label:"Tenure (Years)",        type:"range", min:1,  max:15, step:1,   default:10,   fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const loan   = f.propertyValue * f.ltv / 100;
      const months = Math.round((f.tenureMonths || f.tenure * 12));
      return emiCalc(loan, f.rate, months, f.processingFeePct, f.prepayment);
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
  },

  /* ── CAR LOAN ── */
  "car-loan": {
    icon: "🚗", name: "Car Loan EMI Calculator",
    desc: "Calculate monthly EMI for your car purchase loan.",
    fields: [
      { id:"principal", label:"Loan Amount",         type:"range", min:100000, max:5000000, step:25000, default:800000, fmt:v=>fmtC(v) },
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
    desc: "Calculate monthly EMI for bike or scooter loans.",
    fields: [
      { id:"principal", label:"Loan Amount",         type:"range", min:20000,  max:500000, step:5000, default:100000, fmt:v=>fmtC(v) },
      { id:"rate",      label:"Interest Rate (p.a.)", type:"range", min:1, max:24, step:0.1, default:10.5, fmt:v=>v+"%" },
      { id:"tenure",    label:"Tenure (Years)",       type:"range", min:1, max:5,  step:1,   default:3,    fmt:v=>v+" Yrs" }
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

  /* ── GOLD LOAN ── */
  "gold-loan": {
    icon: "💎", name: "Gold Loan Calculator",
    desc: "Calculate loan amount against your gold jewellery.",
    fields: [
      { id:"weight", label:"Gold Weight (grams)", type:"range", min:5,  max:1000, step:5,   default:50, fmt:v=>v+"g" },
      { id:"purity", label:"Gold Purity (Karat)",  type:"range", min:18, max:24,   step:2,   default:22, fmt:v=>v+"K" },
      { id:"rate",   label:"Interest Rate (p.a.)", type:"range", min:7,  max:30,   step:0.5, default:14, fmt:v=>v+"%" },
      { id:"tenure", label:"Tenure (Months)",      type:"range", min:1,  max:36,   step:1,   default:12, fmt:v=>v+" Mo" }
    ],
    calc(f) {
      const ratePerGram = marketData?.gold?.g24 || 9420;
      const pureMult    = { 18: 0.75, 20: 0.833, 22: 0.917, 24: 1 }[f.purity] || 0.917;
      const goldValue   = f.weight * ratePerGram * pureMult;
      const loanAmount  = goldValue * 0.75;
      const res         = emiCalc(loanAmount, f.rate, f.tenure, f.processingFeePct, f.prepayment);
      res.goldValue     = goldValue;
      res.ratePerGram   = ratePerGram;
      return res;
    },
    render(res, el, cfg, fields) { emiHTML(res, el, cfg, fields); }
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
