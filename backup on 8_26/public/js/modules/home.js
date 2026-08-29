/* ══════════════════════════════════════════════════
   FinCalc Pro — Home Page
   Renders the hero, market tickers, and calculator grid.
   ══════════════════════════════════════════════════ */

/* ─ Calc Card helper ─────────────────────────────── */
function cc(id, icon, name, desc) {
  return `<a class="calc-card" href="#" onclick="openCalc('${id}');return false;">
    <div class="calc-card-icon">${icon}</div>
    <div class="calc-card-name">${name}</div>
    <div class="calc-card-desc">${desc}</div>
  </a>`;
}

/* ─ Render Home Page ─────────────────────────────── */
function renderHome() {
  document.getElementById("appMain").innerHTML = `
    <section class="hero">
      <div class="hero-tag">📊 Live NSE · BSE · Gold Data</div>
      <h1>India's Most Complete<br><span>Financial Calculator</span></h1>
      <p class="hero-sub">25+ professional calculators for EMI, SIP, FD, PPF, Gold Rates — all in one place, completely free.</p>
      <div class="hero-stats">
        <div class="hero-stat"><strong>25+</strong><span>Calculators</span></div>
        <div class="hero-stat"><strong>Live</strong><span>Market Data</span></div>
        <div class="hero-stat"><strong>100%</strong><span>Free Forever</span></div>
        <div class="hero-stat"><strong>Fast</strong><span>Instant Results</span></div>
      </div>
    </section>

    <!-- Stock Ticker -->
    <div class="market-ticker market-ticker--stocks" id="homeTicker">
      ${["nifty","sensex","bankNifty","niftyIT"].map(k => `
        <div class="ticker-card" onclick="openCalc('market')">
          <div class="ticker-label" id="tc-exch-${k}">NSE</div>
          <div class="ticker-name"  id="tc-name-${k}">Loading…</div>
          <div class="ticker-val"   id="tc-val-${k}">—</div>
          <div class="ticker-change" id="tc-chg-${k}">—</div>
          <div class="ticker-spark">
            <canvas data-spark="${k}" style="width:100%;height:40px"></canvas>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Precious Metals Ticker -->
    <div class="market-ticker market-ticker--metals" id="homeMetalTicker">
      <div class="ticker-card ticker-card--gold24" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · GOLD</div>
        <div class="ticker-name">Gold 24K (99.9%)</div>
        <div class="ticker-val" id="tc-val-gold24">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-gold24">—</div>
        <div class="ticker-spark"><canvas data-spark-metal="gold24" style="width:100%;height:40px"></canvas></div>
      </div>
      <div class="ticker-card ticker-card--gold22" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · GOLD</div>
        <div class="ticker-name">Gold 22K (91.7%)</div>
        <div class="ticker-val" id="tc-val-gold22">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-gold22">—</div>
        <div class="ticker-spark"><canvas data-spark-metal="gold22" style="width:100%;height:40px"></canvas></div>
      </div>
      <div class="ticker-card ticker-card--silver" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · SILVER</div>
        <div class="ticker-name">Silver 999 Pure</div>
        <div class="ticker-val" id="tc-val-silver">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-silver">—</div>
        <div class="ticker-spark"><canvas data-spark-metal="silver" style="width:100%;height:40px"></canvas></div>
      </div>
      <div class="ticker-card ticker-card--platinum" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · PLATINUM</div>
        <div class="ticker-name">Platinum 950</div>
        <div class="ticker-val" id="tc-val-platinum">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-platinum">—</div>
        <div class="ticker-spark"><canvas data-spark-metal="platinum" style="width:100%;height:40px"></canvas></div>
      </div>
    </div>

    <!-- EMI & Loan Calculators -->
    <div class="section-title">
      <h2>🏠 EMI &amp; Loan Calculators</h2>
      <p>Calculate monthly EMI for home, car, education, and more</p>
    </div>
    <div class="calc-grid">
      ${cc("home-loan","🏠","Home Loan EMI","Monthly EMI &amp; total interest")}
      ${cc("home-eligibility","✅","Loan Eligibility","Max loan based on income")}
      ${cc("home-affordability","💰","Affordability","How much home can you afford?")}
      ${cc("home-balance-transfer","🔄","Balance Transfer","Save by switching lender")}
      ${cc("loan-to-value","📐","LTV Calculator","Loan-to-Value ratio")}
      ${cc("compare-bank","🏦","Compare Banks","Side-by-side EMI comparison")}
      ${cc("loan-against-property","🏗️","Loan vs Property","Loan against your asset")}
      ${cc("car-loan","🚗","Car Loan","Car loan EMI calculator")}
      ${cc("two-wheeler","🏍️","Two-Wheeler","Bike/scooter EMI")}
      ${cc("education-loan","🎓","Education Loan","With moratorium period")}
      ${cc("gold-loan","💎","Gold Loan","Loan against jewellery")}
      ${cc("credit-card","💳","Credit Card","Payoff planner")}
    </div>

    <!-- Investment Calculators -->
    <div class="section-title">
      <h2>📈 Investment Calculators</h2>
      <p>Plan your wealth with SIP, FD, PPF, retirement and more</p>
    </div>
    <div class="calc-grid">
      ${cc("sip","📈","SIP Calculator","Systematic Investment Plan")}
      ${cc("lumpsum","💵","Lumpsum","One-time investment returns")}
      ${cc("lumpsum-sip","🎯","Lumpsum + SIP","Combined investment")}
      ${cc("sip-delay","⏱️","SIP Delay Cost","Cost of procrastination")}
      ${cc("target-value","🏆","Target SIP","SIP to reach your goal")}
      ${cc("cagr","📊","CAGR Calculator","Compound Annual Growth Rate")}
      ${cc("fd","🏛️","FD Calculator","Fixed deposit maturity")}
      ${cc("rd","📅","RD Calculator","Recurring deposit")}
      ${cc("ppf","🔐","PPF Calculator","Public Provident Fund")}
      ${cc("retirement","👴","Retirement Planner","Your future corpus")}
      ${cc("inflation","📉","Inflation Impact","Future purchasing power")}
      ${cc("gratuity","🎁","Gratuity","Employee gratuity amount")}
    </div>

    <!-- Live Market Data -->
    <div class="section-title">
      <h2>📡 Live Market Data</h2>
      <p>Real-time NSE/BSE &amp; gold prices updated every 3 seconds</p>
    </div>
    <div class="calc-grid" style="padding-bottom:80px">
      ${cc("gold-rates","🥇","Gold Rates Today","24K, 22K, 20K, 18K live rates")}
      ${cc("market","📊","Market Dashboard","NSE/BSE live overview")}
    </div>
  `;

  if (marketData) updateHomeTicker(marketData);
}

/* ─ Update Home Ticker with live data ───────────────── */
function updateHomeTicker(d) {
  if (!d?.indices) return;

  // ── Stock indices ──
  Object.entries(d.indices).forEach(([k, idx]) => {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s(`tc-name-${k}`, idx.label);
    s(`tc-exch-${k}`, idx.exchange);
    s(`tc-val-${k}`,  fmt(idx.value, 2));

    const up   = idx.change >= 0;
    const chEl = document.getElementById(`tc-chg-${k}`);
    if (chEl) {
      chEl.textContent = `${up ? "▲" : "▼"} ${Math.abs(idx.change).toFixed(2)} (${Math.abs(idx.changePct).toFixed(2)}%)`;
      chEl.className   = "ticker-change " + (up ? "up" : "down");
    }

    const canvas = document.querySelector(`[data-spark="${k}"]`);
    if (canvas && idx.spark) FinCharts.drawSparkline(canvas, idx.spark, FinCharts.colorFor(idx.color));
  });

  if (!d?.gold) return;
  const g = d.gold;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  // ── Gold 24K ──
  s("tc-val-gold24", "₹" + fmt(g.g24));
  (() => {
    const el = document.getElementById("tc-chg-gold24");
    if (el) {
      const up = g.ch24 >= 0;
      el.textContent = `${up ? "▲" : "▼"} ₹${Math.abs(g.ch24)} (${up ? "+" : ""}${g.chp24}%)`;
      el.className   = "ticker-change " + (up ? "up" : "down");
    }
  })();

  // ── Gold 22K ──
  s("tc-val-gold22", "₹" + fmt(g.g22));
  (() => {
    const el = document.getElementById("tc-chg-gold22");
    if (el) {
      const ch22 = +(g.g22 * g.chp24 / 100).toFixed(0);
      const up   = g.chp24 >= 0;
      el.textContent = `${up ? "▲" : "▼"} ₹${Math.abs(ch22)} (${up ? "+" : ""}${Math.abs(g.chp24).toFixed(2)}%)`;
      el.className   = "ticker-change " + (up ? "up" : "down");
    }
  })();

  // ── Silver ──
  s("tc-val-silver", "₹" + fmt(g.silver, 2));
  (() => {
    const el = document.getElementById("tc-chg-silver");
    if (el && g.chSilver !== undefined) {
      const up = g.chSilver >= 0;
      el.textContent = `${up ? "▲" : "▼"} ₹${Math.abs(g.chSilver).toFixed(2)} (${up ? "+" : ""}${Math.abs(g.chpSilver).toFixed(2)}%)`;
      el.className   = "ticker-change " + (up ? "up" : "down");
    }
  })();

  // ── Platinum ──
  s("tc-val-platinum", "₹" + fmt(g.platinum));
  (() => {
    const el = document.getElementById("tc-chg-platinum");
    if (el && g.chPlat !== undefined) {
      const up = g.chPlat >= 0;
      el.textContent = `${up ? "▲" : "▼"} ₹${Math.abs(g.chPlat).toFixed(2)} (${up ? "+" : ""}${Math.abs(g.chpPlat).toFixed(2)}%)`;
      el.className   = "ticker-change " + (up ? "up" : "down");
    }
  })();

  // ── Sparklines for metals ──
  const goldCanvas24   = document.querySelector("[data-spark-metal=\"gold24\"]");
  const goldCanvas22   = document.querySelector("[data-spark-metal=\"gold22\"]");
  const silverCanvas   = document.querySelector("[data-spark-metal=\"silver\"]");
  const platinumCanvas = document.querySelector("[data-spark-metal=\"platinum\"]");
  if (g.spark) {
    if (goldCanvas24)   FinCharts.drawSparkline(goldCanvas24,   g.spark, "#f59e0b");
    if (goldCanvas22)   FinCharts.drawSparkline(goldCanvas22,   g.spark.map(v => +(v * 0.9167).toFixed(0)), "#fbbf24");
    if (silverCanvas)   FinCharts.drawSparkline(silverCanvas,   g.spark.map(() => g.silver + (Math.random() - 0.5) * 0.5), "#94a3b8");
    if (platinumCanvas) FinCharts.drawSparkline(platinumCanvas, g.spark.map(() => g.platinum + (Math.random() - 0.5) * 2), "#a78bfa");
  }
}
