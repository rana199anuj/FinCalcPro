/* ══════════════════════════════════════════════════
   FinCalc Pro — Investment Calculator Definitions
   Each entry defines one calculator:
     icon, name, desc, fields[], calc(), render()
   ══════════════════════════════════════════════════ */

const CALCS_INVESTMENTS = {

  /* ── SIP ── */
  "sip": {
    icon: "📈", name: "SIP Calculator",
    desc: "Calculate returns on your Systematic Investment Plan.",
    fields: [
      { id:"monthly", label:"Monthly SIP Amount",        type:"range", min:500, max:200000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:"rate",    label:"Expected Annual Returns",   type:"range", min:1,   max:30,     step:0.5, default:12,    fmt:v=>v+"%" },
      { id:"years",   label:"Investment Period (Years)", type:"range", min:1,   max:40,     step:1,   default:15,    fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const stepUp = (f.stepUpPct || 0) / 100;
      const inflation = (f.inflationRate || 0) / 100;
      const r = f.rate / 12 / 100;
      const totalYears = f.years;
      
      let invested = 0;
      let maturity = 0;
      let currentMonthly = f.monthly;

      if (stepUp > 0) {
        for (let y = 1; y <= totalYears; y++) {
          const remainingYears = totalYears - y;
          const yearFV = currentMonthly * (Math.pow(1+r, 12) - 1) / r * (1+r);
          maturity += yearFV * Math.pow(1 + f.rate/100, remainingYears);
          invested += currentMonthly * 12;
          currentMonthly = currentMonthly * (1 + stepUp);
        }
      } else {
        const n = totalYears * 12;
        maturity = f.monthly * (Math.pow(1+r,n)-1) / r * (1+r);
        invested = f.monthly * n;
      }

      const realPurchasingPower = inflation > 0 ? maturity / Math.pow(1 + inflation, totalYears) : maturity;
      const realGain = realPurchasingPower - invested;

      return {
        maturity, invested, gains: maturity - invested, rate: f.rate, years: f.years, monthly: f.monthly,
        stepUpPct: f.stepUpPct || 0,
        inflationRate: f.inflationRate || 0,
        realPurchasingPower,
        realGain
      };
    },
    render(res, el) {
      const labels = [], inv = [], val = [];
      let curMonthly = res.monthly;
      let runningInv = 0;
      let runningMat = 0;
      const stepUp = (res.stepUpPct || 0) / 100;
      const r = res.rate / 12 / 100;

      for (let y = 1; y <= res.years; y++) {
        labels.push(`${y}Y`);
        if (stepUp > 0) {
          const yearFV = curMonthly * (Math.pow(1+r, 12) - 1) / r * (1+r);
          runningMat = (runningMat * (1 + res.rate/100)) + yearFV;
          runningInv += curMonthly * 12;
          curMonthly = curMonthly * (1 + stepUp);
          inv.push(runningInv);
          val.push(runningMat);
        } else {
          const n = y * 12;
          inv.push(res.monthly * n);
          val.push(res.monthly * (Math.pow(1+r,n)-1)/r*(1+r));
        }
      }
      growthHTML(res, el, labels, inv, val);
    }
  },

  /* ── LUMPSUM ── */
  "lumpsum": {
    icon: "💵", name: "Lumpsum Calculator",
    desc: "Calculate how a one-time investment grows over time.",
    fields: [
      { id:"amount", label:"Investment Amount",       type:"range", min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:"rate",   label:"Expected Annual Returns", type:"range", min:1, max:30, step:0.5, default:12, fmt:v=>v+"%" },
      { id:"years",  label:"Period (Years)",           type:"range", min:1, max:40, step:1,   default:10, fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const maturity = f.amount * Math.pow(1 + f.rate/100, f.years);
      const inflation = (f.inflationRate || 0) / 100;
      const realPurchasingPower = inflation > 0 ? maturity / Math.pow(1 + inflation, f.years) : maturity;
      const realGain = realPurchasingPower - f.amount;
      return {
        maturity, invested: f.amount, gains: maturity - f.amount, rate: f.rate, years: f.years,
        inflationRate: f.inflationRate || 0,
        realPurchasingPower,
        realGain
      };
    },
    render(res, el) {
      const labels = [], inv = [], val = [];
      for (let y = 1; y <= res.years; y++) {
        labels.push(`${y}Y`);
        inv.push(res.invested);
        val.push(res.invested * Math.pow(1 + res.rate/100, y));
      }
      growthHTML(res, el, labels, inv, val);
    }
  },

  /* ── LUMPSUM + SIP ── */
  "lumpsum-sip": {
    icon: "🎯", name: "Lumpsum + SIP Calculator",
    desc: "Calculate combined returns from lumpsum + regular SIP.",
    fields: [
      { id:"lumpsum", label:"Lumpsum Amount",         type:"range", min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:"monthly", label:"Monthly SIP",             type:"range", min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:"rate",    label:"Expected Annual Returns", type:"range", min:1,   max:30,      step:0.5, default:12,    fmt:v=>v+"%" },
      { id:"years",   label:"Period (Years)",           type:"range", min:1,   max:40,      step:1,   default:15,    fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const lumpsumVal = f.lumpsum * Math.pow(1 + f.rate/100, f.years);
      const r = f.rate / 12 / 100, n = f.years * 12;
      const sipVal   = f.monthly * (Math.pow(1+r,n)-1)/r*(1+r);
      const total    = lumpsumVal + sipVal;
      const invested = f.lumpsum + f.monthly * n;
      return { total, invested, gains: total - invested, lumpsumVal, sipVal };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">📋 Investment Summary</div>
          <div class="result-hero">
            <div class="result-hero-label">Total Maturity Value</div>
            <div class="result-hero-value">${fmtC(res.total)}</div>
            <div class="result-hero-sub">${inLakhsCr(res.total)}</div>
          </div>
          <div class="result-breakdown">
            ${row("Lumpsum Value",  fmtC(res.lumpsumVal))}
            ${row("SIP Value",      fmtC(res.sipVal))}
            ${row("Total Invested", fmtC(res.invested))}
            ${row("Total Gains",    fmtC(res.gains), "green")}
            ${row("Wealth Ratio",   (res.total/res.invested).toFixed(2)+"x", "green")}
          </div>
        </div>`;
    }
  },

  /* ── SIP DELAY ── */
  "sip-delay": {
    icon: "⏱️", name: "SIP Delay Cost Calculator",
    desc: "See the true cost of delaying your investments.",
    fields: [
      { id:"monthly", label:"Monthly SIP",             type:"range", min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:"rate",    label:"Expected Annual Returns", type:"range", min:1,   max:30,     step:0.5, default:12,    fmt:v=>v+"%" },
      { id:"years",   label:"Total Investment Period", type:"range", min:5,   max:40,     step:1,   default:20,    fmt:v=>v+" Yrs" },
      { id:"delay",   label:"Delay Period (Years)",    type:"range", min:1,   max:10,     step:1,   default:3,     fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const sipFV = (months) => {
        const r = f.rate / 12 / 100;
        return f.monthly * (Math.pow(1+r,months)-1)/r*(1+r);
      };
      return {
        withoutDelay: sipFV(f.years * 12),
        withDelay:    sipFV((f.years - f.delay) * 12),
        delay: f.delay
      };
    },
    render(res, el) {
      const cost = res.withoutDelay - res.withDelay;
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">⏱️ Delay Analysis</div>
          <div class="result-hero">
            <div class="result-hero-label">Cost of ${res.delay}-Year Delay</div>
            <div class="result-hero-value" style="color:var(--red)">${fmtC(cost)}</div>
            <div class="result-hero-sub">Start today — time is your biggest asset</div>
          </div>
          <div class="result-breakdown">
            ${row("If you start TODAY",            fmtC(res.withoutDelay), "green")}
            ${row(`If delayed ${res.delay} years`, fmtC(res.withDelay), "red")}
            ${row("Wealth Lost",                   fmtC(cost), "red")}
            ${row("% Wealth Lost",                 ((cost/res.withoutDelay)*100).toFixed(1)+"%", "red")}
          </div>
        </div>`;
    }
  },

  /* ── TARGET VALUE ── */
  "target-value": {
    icon: "🏆", name: "Target SIP Calculator",
    desc: "Find the SIP amount needed to reach your financial goal.",
    fields: [
      { id:"target", label:"Target Amount",           type:"range", min:100000, max:100000000, step:100000, default:10000000, fmt:v=>fmtC(v) },
      { id:"rate",   label:"Expected Annual Returns", type:"range", min:1, max:30, step:0.5, default:12, fmt:v=>v+"%" },
      { id:"years",  label:"Period (Years)",           type:"range", min:1, max:40, step:1,   default:15, fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const r = f.rate / 12 / 100, n = f.years * 12;
      const sip = f.target * r / ((Math.pow(1+r,n)-1) * (1+r));
      return { sip, invested: sip * n, gains: f.target - sip * n, target: f.target };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">🏆 Goal Calculator</div>
          <div class="result-hero">
            <div class="result-hero-label">Required Monthly SIP</div>
            <div class="result-hero-value">${fmtC(res.sip)}</div>
            <div class="result-hero-sub">to reach ₹${inLakhsCr(res.target)}</div>
          </div>
          <div class="result-breakdown">
            ${row("Target Amount",    fmtC(res.target), "gold")}
            ${row("Total Investment", fmtC(res.invested))}
            ${row("Expected Gains",   fmtC(res.gains), "green")}
            ${row("Gain %",           ((res.gains/res.invested)*100).toFixed(1)+"%", "green")}
          </div>
        </div>`;
    }
  },

  /* ── CAGR ── */
  "cagr": {
    icon: "📊", name: "CAGR Calculator",
    desc: "Calculate Compound Annual Growth Rate of any investment.",
    fields: [
      { id:"initial", label:"Initial Investment", type:"range", min:10000,  max:10000000, step:10000, default:100000, fmt:v=>fmtC(v) },
      { id:"final",   label:"Final Value",        type:"range", min:10000,  max:50000000, step:10000, default:350000, fmt:v=>fmtC(v) },
      { id:"years",   label:"Period (Years)",      type:"range", min:1, max:40, step:1, default:10, fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const cagr = (Math.pow(f.final / f.initial, 1 / f.years) - 1) * 100;
      return { cagr, gains: f.final - f.initial, initial: f.initial, final: f.final, absReturn: ((f.final - f.initial) / f.initial) * 100 };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">📊 CAGR Analysis</div>
          <div class="result-hero">
            <div class="result-hero-label">CAGR</div>
            <div class="result-hero-value" style="color:var(--green)">${res.cagr.toFixed(2)}%</div>
            <div class="result-hero-sub">Compound Annual Growth Rate</div>
          </div>
          <div class="result-breakdown">
            ${row("Initial Value",   fmtC(res.initial))}
            ${row("Final Value",     fmtC(res.final))}
            ${row("Total Gains",     fmtC(res.gains), "green")}
            ${row("Absolute Return", res.absReturn.toFixed(2)+"%", "green")}
          </div>
        </div>`;
    }
  },

  /* ── FD ── */
  "fd": {
    icon: "🏛️", name: "Fixed Deposit Calculator",
    desc: "Calculate maturity amount and interest on your FD with Simple or Compound interest.",
    fields: [
      { id:"amount",      label:"Principal Amount",        type:"range", min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:"rate",        label:"Interest Rate (p.a.)",    type:"range", min:1, max:15, step:0.1, default:7.1, fmt:v=>v+"%" },
      { id:"years",       label:"Tenure (Years)",          type:"range", min:1, max:10, step:1,   default:3,   fmt:v=>v+" Yrs" },
      { id:"calcType",    label:"Interest Type",           type:"range", min:0, max:1, step:1,   default:1,   fmt:v=>v===0?"Simple Interest":"Compound Interest" },
      { id:"compounding", label:"Compounding (if Compound)",type:"range", min:1, max:12, step:1,   default:4,
        fmt: v => ({1:"Annual",2:"Half-Yearly",4:"Quarterly",12:"Monthly"})[v] || v+"/yr" }
    ],
    calc(f) {
      let maturity;
      if (f.calcType === 0) {
        // Simple Interest = P + (P * R * T / 100)
        maturity = f.amount + (f.amount * f.rate * f.years) / 100;
      } else {
        // Compound Interest
        const freq = f.compounding || 4;
        maturity = f.amount * Math.pow(1 + (f.rate/100)/freq, freq * f.years);
      }
      return { maturity, interest: maturity - f.amount, principal: f.amount, calcType: f.calcType };
    },
    render(res, el) { savingsHTML(res, el, "Principal Amount"); }
  },

  /* ── RD ── */
  "rd": {
    icon: "📅", name: "Recurring Deposit Calculator",
    desc: "Calculate maturity amount for monthly recurring deposits.",
    fields: [
      { id:"monthly",  label:"Monthly Deposit",       type:"range", min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:"rate",     label:"Interest Rate (p.a.)",  type:"range", min:1, max:15, step:0.1, default:7.0, fmt:v=>v+"%" },
      { id:"years",    label:"Tenure (Years)",         type:"range", min:1, max:10, step:1,   default:3,   fmt:v=>v+" Yrs" },
      { id:"calcType", label:"Interest Type",         type:"range", min:0, max:1, step:1,   default:1,   fmt:v=>v===0?"Simple Interest":"Compound Interest" }
    ],
    calc(f) {
      const n = f.years * 12;
      let maturity;
      if (f.calcType === 0) {
        // Simple Interest RD: I = P * N(N+1)/2 * R/1200
        const interest = f.monthly * n * (n + 1) / 2 * (f.rate / 1200);
        maturity = f.monthly * n + interest;
      } else {
        // Quarterly Compound Interest RD
        const r = f.rate / 400;
        maturity = f.monthly * n + f.monthly * n * (n+1) * r / 2;
      }
      return { maturity, invested: f.monthly * n, interest: maturity - f.monthly * n };
    },
    render(res, el) { savingsHTML(res, el, "Total Deposited"); }
  },

  /* ── PPF ── */
  "ppf": {
    icon: "🔐", name: "PPF Calculator",
    desc: "Calculate Public Provident Fund returns (EEE Tax Status).",
    fields: [
      { id:"yearly",   label:"Yearly Investment (max ₹1.5L)", type:"range", min:500, max:150000, step:500, default:150000, fmt:v=>fmtC(v) },
      { id:"rate",     label:"PPF Interest Rate",             type:"range", min:6, max:9, step:0.1, default:7.1, fmt:v=>v+"%" },
      { id:"years",    label:"Period (Years, min 15)",        type:"range", min:15, max:50, step:5, default:15,  fmt:v=>v+" Yrs" },
      { id:"calcType", label:"Interest Type",                 type:"range", min:0, max:1, step:1,   default:1,   fmt:v=>v===0?"Simple Interest":"Compound Interest" }
    ],
    calc(f) {
      const totalInvested = f.yearly * f.years;
      let maturity;
      if (f.calcType === 0) {
        // Simple Interest PPF: sum of simple interest per annual deposit
        let totalInt = 0;
        for (let i = 0; i < f.years; i++) {
          totalInt += (f.yearly * f.rate * (f.years - i)) / 100;
        }
        maturity = totalInvested + totalInt;
      } else {
        let bal = 0;
        for (let i = 0; i < f.years; i++) bal = (bal + f.yearly) * (1 + f.rate/100);
        maturity = bal;
      }
      return { maturity, invested: totalInvested, interest: maturity - totalInvested };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">🔐 PPF Summary</div>
          <div class="result-hero">
            <div class="result-hero-label">Maturity Amount (Tax-Free)</div>
            <div class="result-hero-value">${fmtC(res.maturity)}</div>
            <div class="result-hero-sub">${inLakhsCr(res.maturity)} · EEE Tax Benefit</div>
          </div>
          <div class="result-breakdown">
            ${row("Total Invested",    fmtC(res.invested))}
            ${row("Interest Earned",   fmtC(res.interest), "green")}
            ${row("Wealth Multiplier", (res.maturity/res.invested).toFixed(2)+"x", "green")}
          </div>
        </div>`;
    }
  },

  /* ── RETIREMENT ── */
  "retirement": {
    icon: "👴", name: "Retirement Planner",
    desc: "Calculate the corpus needed to maintain your post-retirement lifestyle.",
    fields: [
      { id:"currentAge",      label:"Current Age",              type:"range", min:20, max:60, step:1,   default:30,    fmt:v=>v+" yrs" },
      { id:"retirementAge",   label:"Retirement Age",           type:"range", min:45, max:70, step:1,   default:60,    fmt:v=>v+" yrs" },
      { id:"monthlyExpenses", label:"Current Monthly Expenses", type:"range", min:20000, max:500000, step:5000, default:60000, fmt:v=>fmtC(v) },
      { id:"inflation",       label:"Expected Inflation",       type:"range", min:1, max:12, step:0.5, default:6,  fmt:v=>v+"%" },
      { id:"returns",         label:"Post-Retirement Returns",  type:"range", min:1, max:12, step:0.5, default:7,  fmt:v=>v+"%" }
    ],
    calc(f) {
      const yearsToRetire = f.retirementAge - f.currentAge;
      const postRetYears  = 85 - f.retirementAge;
      const futureExpense = f.monthlyExpenses * Math.pow(1 + f.inflation/100, yearsToRetire);
      const annualExp     = futureExpense * 12;
      const r   = f.returns / 100, inf = f.inflation / 100;
      const corpus     = annualExp * (1 - Math.pow((1+inf)/(1+r), postRetYears)) / (r - inf);
      const sipNeeded  = corpus * (f.returns/12/100) / (Math.pow(1 + f.returns/12/100, yearsToRetire*12) - 1);
      return { corpus, futureExpense, sipNeeded, yearsToRetire, postRetYears };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">👴 Retirement Plan</div>
          <div class="result-hero">
            <div class="result-hero-label">Retirement Corpus Needed</div>
            <div class="result-hero-value">${fmtC(res.corpus)}</div>
            <div class="result-hero-sub">${inLakhsCr(res.corpus)}</div>
          </div>
          <div class="result-breakdown">
            ${row("Years to Retire",        res.yearsToRetire+" years")}
            ${row("Post-Retirement Years",  res.postRetYears+" years")}
            ${row("Future Monthly Expense", fmtC(res.futureExpense))}
            ${row("Monthly SIP Required",   fmtC(res.sipNeeded), "green")}
          </div>
        </div>`;
    }
  },

  /* ── INFLATION ── */
  "inflation": {
    icon: "📉", name: "Inflation Calculator",
    desc: "Calculate how inflation erodes your purchasing power.",
    fields: [
      { id:"amount",   label:"Current Amount",       type:"range", min:10000, max:10000000, step:10000, default:1000000, fmt:v=>fmtC(v) },
      { id:"inflation",label:"Annual Inflation Rate", type:"range", min:1, max:20, step:0.5, default:6, fmt:v=>v+"%" },
      { id:"years",    label:"Number of Years",       type:"range", min:1, max:50, step:1,   default:10, fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const futureNeeded = f.amount * Math.pow(1 + f.inflation/100, f.years);
      return { futureNeeded, loss: futureNeeded - f.amount, lossPct: ((futureNeeded - f.amount)/f.amount)*100, amount: f.amount };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">📉 Inflation Impact</div>
          <div class="result-hero">
            <div class="result-hero-label">Future Value Equivalent</div>
            <div class="result-hero-value">${fmtC(res.futureNeeded)}</div>
            <div class="result-hero-sub">= Today's ${fmtC(res.amount)} after inflation</div>
          </div>
          <div class="result-breakdown">
            ${row("Today's Value",     fmtC(res.amount))}
            ${row("Future Equivalent", fmtC(res.futureNeeded))}
            ${row("Value Lost",        fmtC(res.loss), "red")}
            ${row("Erosion %",         res.lossPct.toFixed(1)+"%", "red")}
          </div>
        </div>`;
    }
  },

  /* ── GRATUITY ── */
  "gratuity": {
    icon: "🎁", name: "Gratuity Calculator",
    desc: "Calculate gratuity as per the Payment of Gratuity Act, 1972.",
    fields: [
      { id:"salary", label:"Last Basic Salary (monthly)", type:"range", min:10000, max:500000, step:5000, default:50000, fmt:v=>fmtC(v) },
      { id:"da",     label:"Dearness Allowance (DA)",     type:"range", min:0, max:100000, step:1000, default:0, fmt:v=>fmtC(v) },
      { id:"years",  label:"Years of Service",            type:"range", min:5, max:40, step:1, default:10, fmt:v=>v+" Yrs" }
    ],
    calc(f) {
      const basicDA  = f.salary + f.da;
      const gratuity = (basicDA * 15 * f.years) / 26;
      return { gratuity, taxFree: Math.min(gratuity, 2000000), taxable: Math.max(0, gratuity - 2000000), basicDA };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-card">
          <div class="result-card-title">🎁 Gratuity Summary</div>
          <div class="result-hero">
            <div class="result-hero-label">Gratuity Amount</div>
            <div class="result-hero-value">${fmtC(res.gratuity)}</div>
            <div class="result-hero-sub">As per Payment of Gratuity Act, 1972</div>
          </div>
          <div class="result-breakdown">
            ${row("Basic + DA", fmtC(res.basicDA)+"/mo")}
            ${row("Tax-Free",   fmtC(res.taxFree), "green")}
            ${row("Taxable",    fmtC(res.taxable), res.taxable > 0 ? "red" : "")}
            ${row("Formula",    "(B+DA)×15×Years÷26")}
          </div>
        </div>`;
    }
  }

  ,

  /* ── GOLD SIP ── */
  "gold-sip": {
    icon: "🥇", name: "Gold SIP Calculator",
    desc: "Calculate monthly Gold SIP returns and gold accumulated using current live gold rates.",
    fields: [
      { id:"monthly", label:"Monthly Investment",     type:"range", min:500, max:200000, step:500, default:5000,  fmt:v=>fmtC(v) },
      { id:"rate",    label:"Expected Annual Returns", type:"range", min:1,   max:20,     step:0.5, default:11,    fmt:v=>v+"%" },
      { id:"years",   label:"Investment Period (Years)",type:"range", min:1,  max:30,     step:1,   default:10,    fmt:v=>v+" Yrs" },
      { id:"purity",  label:"Gold Purity",             type:"range", min:22,  max:24,     step:2,   default:24,    fmt:v=>v+"K Digital Gold" }
    ],
    calc(f) {
      const liveRate24K = marketData?.gold?.g24 || 15692;
      const pureMult    = { 24: 1, 22: 0.917, 18: 0.75 }[Math.round(f.purity)] || 0.917;
      const goldRate    = liveRate24K * pureMult;
      const r = f.rate / 12 / 100, n = f.years * 12;
      const maturity = f.monthly * (Math.pow(1+r,n)-1) / r * (1+r);
      const invested = f.monthly * n;
      // Gold grams accumulated: each month's investment buys (monthly/goldRate) grams
      const totalGrams = invested / goldRate;
      const gramsAtMaturity = maturity / goldRate;
      return {
        maturity, invested, gains: maturity - invested,
        rate: f.rate, years: f.years, monthly: f.monthly,
        goldRate, liveRate24K,
        totalGrams, gramsAtMaturity,
        sovereignEquiv: (gramsAtMaturity / 8).toFixed(1) // 1 Sovereign = 8 grams
      };
    },
    render(res, el) {
      const labels = [], inv = [], val = [];
      for (let y = 1; y <= res.years; y++) {
        const r = res.rate / 12 / 100, n = y * 12;
        labels.push(`${y}Y`);
        inv.push(res.monthly * n);
        val.push(res.monthly * (Math.pow(1+r,n)-1)/r*(1+r));
      }
      el.innerHTML = `
        <div class="gold-loan-live-banner">
          <span class="gold-live-dot"></span>
          <span>Live Gold Rate (24K): <strong>₹${fmt(res.liveRate24K)}/g</strong></span>
          <span class="gold-live-sep">|</span>
          <span>Rate used: <strong>₹${fmt(res.goldRate)}/g</strong></span>
        </div>
        <div class="results-top-grid">
          <div class="summary-card">
            <div class="summary-card-header">🥇 Gold SIP Summary</div>
            <div class="summary-hero">
              <div class="summary-hero-label">Maturity Value</div>
              <div class="summary-hero-value">${fmtC(res.maturity)}</div>
              <div class="summary-hero-sub">${inLakhsCr(res.maturity)}</div>
            </div>
            <div class="summary-breakdown">
              ${row("Total Invested",        fmtC(res.invested))}
              ${row("Wealth Gained",         fmtC(res.gains), "green")}
              ${row("Return %",              ((res.gains/res.invested)*100).toFixed(1)+"%", "green")}
              ${row("Gold Accumulated",      res.gramsAtMaturity.toFixed(2)+" grams", "gold")}
              ${row("Sovereign Bond Equiv.", res.sovereignEquiv+" Sovereigns (8g each)")}
            </div>
          </div>
          <div class="breakdown-chart-card">
            <div class="chart-card-header">📊 Investment Breakdown</div>
            <div class="donut-wrap">
              <canvas id="chartDonut" style="max-width:180px;max-height:180px"></canvas>
              <div class="donut-center-text">
                <div class="center-label">Maturity</div>
                <div class="center-val">${fmtC(res.maturity)}</div>
              </div>
            </div>
            <div class="chart-custom-legend">
              <div class="custom-legend-item"><span class="legend-square" style="background:#f59e0b"></span><span>Invested: <strong>${fmtC(res.invested)}</strong></span></div>
              <div class="custom-legend-item"><span class="legend-square" style="background:#16a34a"></span><span>Gains: <strong>${fmtC(res.gains)}</strong></span></div>
            </div>
          </div>
        </div>
        <div class="amortization-card">
          <div class="amortization-header"><div class="amortization-title">📈 Wealth Growth Curve</div></div>
          <div class="amortization-canvas-wrap"><canvas id="chartGrowth" style="width:100%;height:220px"></canvas></div>
        </div>
      `;
      setTimeout(() => {
        FinCharts.createSavingsDonut("chartDonut", res.invested, res.gains);
        FinCharts.createGrowthChart("chartGrowth", labels, inv, val);
      }, 60);
    }
  }

}; // end CALCS_INVESTMENTS

