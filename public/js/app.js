/* ══════════════════════════════════════════════════
   FINCALC PRO — Main Application
   ══════════════════════════════════════════════════ */

/* ─ Formatters ────────────────────────────────────── */
const fmt  = (n, d = 0) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d });
const fmtC = (n)        => '₹' + fmt(n);
const fmtCd = (n, d)   => '₹' + fmt(n, d);

function inLakhsCr(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return (n / 1e5).toFixed(2) + ' L';
  return fmt(n);
}

/* ─ EMI Formula ────────────────────────────────────── */
function calcEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

/* ─ App State ──────────────────────────────────────── */
let currentView = 'home';
let marketData  = null;

/* ─ Router ─────────────────────────────────────────── */
function navigate(view) {
  currentView = view;
  const main = document.getElementById('appMain');
  main.innerHTML = '';
  main.classList.remove('fade-in');
  void main.offsetWidth; // reflow
  main.classList.add('fade-in');

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  switch (view) {
    case 'home':       document.getElementById('tab-home')?.classList.add('active');   renderHome();       break;
    case 'gold-rates': document.getElementById('tab-gold')?.classList.add('active');   renderGoldRates();  break;
    case 'market':     document.getElementById('tab-market')?.classList.add('active'); renderMarket();     break;
    default:           renderCalc(view); break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome()       { navigate('home'); }
function openCalc(id)     { navigate(id); }
function closeMobile() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.getElementById('drawerOverlay')?.classList.remove('open');
}

/* ─ WebSocket Events ───────────────────────────────── */
document.addEventListener('ws:market', (e) => {
  marketData = e.detail;
  updateNavBadge(marketData);
  if (currentView === 'home')           updateHomeTicker(marketData);
  else if (currentView === 'gold-rates') updateGoldRates(marketData);
  else if (currentView === 'market')     updateMarketPage(marketData);
  else if (currentView === 'gold-loan')  updateGoldLoanPanel(marketData);
});

document.addEventListener('ws:open',  () => { const d = document.getElementById('navLiveDot'); if (d) d.style.background = '#22c55e'; });
document.addEventListener('ws:close', () => { const d = document.getElementById('navLiveDot'); if (d) d.style.background = '#ef4444'; });

function updateNavBadge(d) {
  if (!d?.indices) return;
  const ni = d.indices.nifty, se = d.indices.sensex, go = d.gold;
  const set = (id, txt, col) => { const el = document.getElementById(id); if (el) { el.textContent = txt; el.style.color = col; } };
  set('navNifty',  `NSE ${fmt(ni.value, 2)}`,    ni.change >= 0 ? '#22c55e' : '#ef4444');
  set('navSensex', `BSE ${fmt(se.value, 2)}`,    se.change >= 0 ? '#22c55e' : '#ef4444');
  set('navGold',   `Gold ₹${fmt(go.g24)}/g`, go.ch24 >= 0 ? '#22c55e' : '#ef4444');
}

/* ══════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════ */
function renderHome() {
  document.getElementById('appMain').innerHTML = `
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

    <!-- Market Ticker: Stocks -->
    <div class="market-ticker market-ticker--stocks" id="homeTicker">
      ${['nifty','sensex','bankNifty','niftyIT'].map(k => `
        <div class="ticker-card" onclick="openCalc('market')">
          <div class="ticker-label" id="tc-exch-${k}">NSE</div>
          <div class="ticker-name" id="tc-name-${k}">Loading…</div>
          <div class="ticker-val"  id="tc-val-${k}">—</div>
          <div class="ticker-change" id="tc-chg-${k}">—</div>
          <div class="ticker-spark">
            <canvas data-spark="${k}" style="width:100%;height:40px"></canvas>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Market Ticker: Precious Metals -->
    <div class="market-ticker market-ticker--metals" id="homeMetalTicker">
      <div class="ticker-card ticker-card--gold24" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · GOLD</div>
        <div class="ticker-name">Gold 24K (99.9%)</div>
        <div class="ticker-val" id="tc-val-gold24">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-gold24">—</div>
        <div class="ticker-spark">
          <canvas data-spark-metal="gold24" style="width:100%;height:40px"></canvas>
        </div>
      </div>
      <div class="ticker-card ticker-card--gold22" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · GOLD</div>
        <div class="ticker-name">Gold 22K (91.7%)</div>
        <div class="ticker-val" id="tc-val-gold22">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-gold22">—</div>
        <div class="ticker-spark">
          <canvas data-spark-metal="gold22" style="width:100%;height:40px"></canvas>
        </div>
      </div>
      <div class="ticker-card ticker-card--silver" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · SILVER</div>
        <div class="ticker-name">Silver 999 Pure</div>
        <div class="ticker-val" id="tc-val-silver">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-silver">—</div>
        <div class="ticker-spark">
          <canvas data-spark-metal="silver" style="width:100%;height:40px"></canvas>
        </div>
      </div>
      <div class="ticker-card ticker-card--platinum" onclick="openCalc('gold-rates')">
        <div class="ticker-label metal-label">MCX · PLATINUM</div>
        <div class="ticker-name">Platinum 950</div>
        <div class="ticker-val" id="tc-val-platinum">—</div>
        <div class="ticker-unit">per gram</div>
        <div class="ticker-change" id="tc-chg-platinum">—</div>
        <div class="ticker-spark">
          <canvas data-spark-metal="platinum" style="width:100%;height:40px"></canvas>
        </div>
      </div>
    </div>

    <!-- EMI Section -->
    <div class="section-title">
      <h2>🏠 EMI &amp; Loan Calculators</h2>
      <p>Calculate monthly EMI for home, car, education, and more</p>
    </div>
    <div class="calc-grid">
      ${cc('home-loan','🏠','Home Loan EMI','Monthly EMI & total interest')}
      ${cc('home-eligibility','✅','Loan Eligibility','Max loan based on income')}
      ${cc('home-affordability','💰','Affordability','How much home can you afford?')}
      ${cc('home-balance-transfer','🔄','Balance Transfer','Save by switching lender')}
      ${cc('loan-to-value','📐','LTV Calculator','Loan-to-Value ratio')}
      ${cc('compare-bank','🏦','Compare Banks','Side-by-side EMI comparison')}
      ${cc('loan-against-property','🏗️','Loan vs Property','Loan against your asset')}
      ${cc('car-loan','🚗','Car Loan','Car loan EMI calculator')}
      ${cc('two-wheeler','🏍️','Two-Wheeler','Bike/scooter EMI')}
      ${cc('education-loan','🎓','Education Loan','With moratorium period')}
      ${cc('gold-loan','💎','Gold Loan','Loan against jewellery')}
      ${cc('credit-card','💳','Credit Card','Payoff planner')}
    </div>

    <!-- Investment Section -->
    <div class="section-title">
      <h2>📈 Investment Calculators</h2>
      <p>Plan your wealth with SIP, FD, PPF, retirement and more</p>
    </div>
    <div class="calc-grid">
      ${cc('sip','📈','SIP Calculator','Systematic Investment Plan')}
      ${cc('lumpsum','💵','Lumpsum','One-time investment returns')}
      ${cc('lumpsum-sip','🎯','Lumpsum + SIP','Combined investment')}
      ${cc('sip-delay','⏱️','SIP Delay Cost','Cost of procrastination')}
      ${cc('target-value','🏆','Target SIP','SIP to reach your goal')}
      ${cc('cagr','📊','CAGR Calculator','Compound Annual Growth Rate')}
      ${cc('fd','🏛️','FD Calculator','Fixed deposit maturity')}
      ${cc('rd','📅','RD Calculator','Recurring deposit')}
      ${cc('ppf','🔐','PPF Calculator','Public Provident Fund')}
      ${cc('retirement','👴','Retirement Planner','Your future corpus')}
      ${cc('inflation','📉','Inflation Impact','Future purchasing power')}
      ${cc('gratuity','🎁','Gratuity','Employee gratuity amount')}
    </div>

    <!-- Live Data -->
    <div class="section-title">
      <h2>📡 Live Market Data</h2>
      <p>Real-time NSE/BSE &amp; gold prices updated every 3 seconds</p>
    </div>
    <div class="calc-grid" style="padding-bottom:80px">
      ${cc('gold-rates','🥇','Gold Rates Today','24K, 22K, 20K, 18K live rates')}
      ${cc('market','📊','Market Dashboard','NSE/BSE live overview')}
    </div>
  `;

  if (marketData) updateHomeTicker(marketData);
}

function cc(id, icon, name, desc) {
  return `<a class="calc-card" href="#" onclick="openCalc('${id}');return false;">
    <div class="calc-card-icon">${icon}</div>
    <div class="calc-card-name">${name}</div>
    <div class="calc-card-desc">${desc}</div>
  </a>`;
}

function updateHomeTicker(d) {
  if (!d?.indices) return;
  Object.entries(d.indices).forEach(([k, idx]) => {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s(`tc-name-${k}`, idx.label);
    s(`tc-exch-${k}`, idx.exchange);
    s(`tc-val-${k}`,  fmt(idx.value, 2));
    const up = idx.change >= 0;
    const chEl = document.getElementById(`tc-chg-${k}`);
    if (chEl) {
      chEl.textContent = `${up ? '▲' : '▼'} ${Math.abs(idx.change).toFixed(2)} (${Math.abs(idx.changePct).toFixed(2)}%)`;
      chEl.className   = 'ticker-change ' + (up ? 'up' : 'down');
    }
    const canvas = document.querySelector(`[data-spark="${k}"]`);
    if (canvas && idx.spark) FinCharts.drawSparkline(canvas, idx.spark, FinCharts.colorFor(idx.color));
  });

  // ── Precious Metal Ticker Cards ──────────────────────────
  if (!d?.gold) return;
  const g = d.gold;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  // Gold 24K
  s('tc-val-gold24', '₹' + fmt(g.g24));
  (() => {
    const el = document.getElementById('tc-chg-gold24');
    if (el) {
      const up = g.ch24 >= 0;
      el.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(g.ch24)} (${up ? '+' : ''}${g.chp24}%)`;
      el.className   = 'ticker-change ' + (up ? 'up' : 'down');
    }
  })();

  // Gold 22K
  s('tc-val-gold22', '₹' + fmt(g.g22));
  (() => {
    const el = document.getElementById('tc-chg-gold22');
    if (el) {
      // 22K tracks 24K change proportionally
      const ch22 = +(g.g22 * g.chp24 / 100).toFixed(0);
      const up = g.chp24 >= 0;
      el.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(ch22)} (${up ? '+' : ''}${Math.abs(g.chp24).toFixed(2)}%)`;
      el.className   = 'ticker-change ' + (up ? 'up' : 'down');
    }
  })();

  // Silver
  s('tc-val-silver', '₹' + fmt(g.silver, 2));
  (() => {
    const el = document.getElementById('tc-chg-silver');
    if (el && g.chSilver !== undefined) {
      const up = g.chSilver >= 0;
      el.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(g.chSilver).toFixed(2)} (${up ? '+' : ''}${Math.abs(g.chpSilver).toFixed(2)}%)`;
      el.className   = 'ticker-change ' + (up ? 'up' : 'down');
    }
  })();

  // Platinum
  s('tc-val-platinum', '₹' + fmt(g.platinum));
  (() => {
    const el = document.getElementById('tc-chg-platinum');
    if (el && g.chPlat !== undefined) {
      const up = g.chPlat >= 0;
      el.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(g.chPlat).toFixed(2)} (${up ? '+' : ''}${Math.abs(g.chpPlat).toFixed(2)}%)`;
      el.className   = 'ticker-change ' + (up ? 'up' : 'down');
    }
  })();

  // Sparklines for metals (reuse gold spark history)
  const goldCanvas24  = document.querySelector('[data-spark-metal="gold24"]');
  const goldCanvas22  = document.querySelector('[data-spark-metal="gold22"]');
  const silverCanvas  = document.querySelector('[data-spark-metal="silver"]');
  const platinumCanvas= document.querySelector('[data-spark-metal="platinum"]');
  if (g.spark) {
    if (goldCanvas24)   FinCharts.drawSparkline(goldCanvas24,   g.spark, '#f59e0b');
    if (goldCanvas22)   FinCharts.drawSparkline(goldCanvas22,   g.spark.map(v => +(v*0.9167).toFixed(0)), '#fbbf24');
    if (silverCanvas)   FinCharts.drawSparkline(silverCanvas,   g.spark.map(() => g.silver + (Math.random()-0.5)*0.5), '#94a3b8');
    if (platinumCanvas) FinCharts.drawSparkline(platinumCanvas, g.spark.map(() => g.platinum + (Math.random()-0.5)*2), '#a78bfa');
  }
}

/* ══════════════════════════════════════════════════
   GOLD RATES PAGE
   ══════════════════════════════════════════════════ */
function renderGoldRates() {
  document.getElementById('appMain').innerHTML = `
    <div class="gold-page">
      <div class="gold-header">
        <h1>💛 Gold Rates Today</h1>
        <div class="gold-timestamp">
          <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse 2s infinite"></span>
          Live · Updated every 3s · <span id="goldTs">—</span>
        </div>
      </div>

      <div class="gold-grid" id="goldGrid">
        ${[['24','24K (99.9%)'],['22','22K (91.7%)'],['20','20K (83.3%)'],['18','18K (75.0%)']].map(([id, label]) => `
          <div class="gold-card">
            <div class="gold-purity">${label.split(' ')[0]}</div>
            <div class="gold-name">Gold ${label}</div>
            <div class="gold-price" id="gp-${id}">—</div>
            <div class="gold-unit">per gram</div>
            <div class="gold-change" id="gc-${id}">—</div>
          </div>
        `).join('')}
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

      <!-- Detailed Table -->
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
  const ts = document.getElementById('goldTs');
  if (ts) ts.textContent = d.ts;

  const pairs = [['24', g.g24], ['22', g.g22], ['20', g.g20], ['18', g.g18]];
  pairs.forEach(([id, val]) => {
    const pEl = document.getElementById(`gp-${id}`);
    if (pEl) pEl.textContent = '₹' + fmt(val);
    const cEl = document.getElementById(`gc-${id}`);
    if (cEl && id === '24') {
      const up = g.ch24 >= 0;
      cEl.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(g.ch24)} (${up ? '+' : ''}${g.chp24}%)`;
      cEl.className   = 'gold-change ' + (up ? 'up' : 'down');
    }
  });

  const sv = document.getElementById('gpSilver');   if (sv) sv.textContent   = '₹' + fmt(g.silver, 2);
  const pt = document.getElementById('gpPlatinum'); if (pt) pt.textContent   = '₹' + fmt(g.platinum);

  const tbody = document.getElementById('goldTableBody');
  if (tbody) {
    const rows = [
      { label: '24K (99.9%)', rate: g.g24 },
      { label: '22K (91.7%)', rate: g.g22 },
      { label: '20K (83.3%)', rate: g.g20 },
      { label: '18K (75.0%)', rate: g.g18 }
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
    `).join('');
  }
}

/* ══════════════════════════════════════════════════
   MARKET PAGE
   ══════════════════════════════════════════════════ */
function renderMarket() {
  document.getElementById('appMain').innerHTML = `
    <div class="market-page">
      <h1>📊 Live Market Dashboard</h1>
      <p style="color:var(--text-secondary);margin-bottom:32px">NSE &amp; BSE live indices · <span id="mktTs">—</span></p>

      <div class="market-grid">
        ${['nifty','sensex','bankNifty','niftyIT'].map(k => `
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
        `).join('')}
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
  s('mktTs', d.ts);

  Object.entries(d.indices).forEach(([k, idx]) => {
    s(`mk-exch-${k}`, idx.exchange);
    s(`mk-name-${k}`, idx.label);
    s(`mk-badge-${k}`, idx.exchange);
    s(`mk-val-${k}`,  fmt(idx.value, 2));
    s(`mk-o-${k}`, fmt(idx.open, 2));
    s(`mk-h-${k}`, fmt(idx.high, 2));
    s(`mk-l-${k}`, fmt(idx.low,  2));
    s(`mk-p-${k}`, fmt(idx.prev, 2));

    const chEl = document.getElementById(`mk-chg-${k}`);
    if (chEl) {
      const up = idx.change >= 0;
      chEl.textContent = `${up ? '▲' : '▼'} ${Math.abs(idx.change).toFixed(2)} (${Math.abs(idx.changePct).toFixed(2)}%)`;
      chEl.className   = 'market-card-change ' + (up ? 'up' : 'down');
    }

    document.querySelectorAll(`[data-spark="${k}"]`).forEach(canvas => {
      if (idx.spark) FinCharts.drawSparkline(canvas, idx.spark, FinCharts.colorFor(idx.color));
    });
  });

  const g = d.gold;
  s('mktG24',      '₹' + fmt(g.g24) + '/g');
  s('mktSilver',   '₹' + fmt(g.silver, 2) + '/g');
  s('mktPlatinum', '₹' + fmt(g.platinum) + '/g');

  const gch = document.getElementById('mktG24ch');
  if (gch) {
    gch.textContent = g.ch24 >= 0 ? `▲ ₹${Math.abs(g.ch24)} (+${g.chp24}%)` : `▼ ₹${Math.abs(g.ch24)} (${g.chp24}%)`;
    gch.className   = 'market-card-change ' + (g.ch24 >= 0 ? 'up' : 'down');
  }
}

/* ══════════════════════════════════════════════════
   CALCULATOR DEFINITIONS
   ══════════════════════════════════════════════════ */
const CALCS = {

  /* ── HOME LOAN EMI ── */
  'home-loan': {
    icon:'🏠', name:'Home Loan EMI Calculator',
    desc:'Calculate your monthly EMI, total interest and payment schedule.',
    fields:[
      { id:'principal', label:'Loan Amount',        type:'range', min:100000,   max:10000000, step:50000, default:3000000, fmt:v=>fmtC(v) },
      { id:'rate',      label:'Annual Interest Rate', type:'range', min:1,        max:20,       step:0.1,  default:8.5,     fmt:v=>v+'%' },
      { id:'tenure',    label:'Loan Tenure (Years)', type:'range', min:1,        max:30,       step:1,    default:20,      fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const months = f.tenure * 12;
      const emi    = calcEMI(f.principal, f.rate, months);
      const total  = emi * months;
      return { emi, total, interest: total - f.principal, principal: f.principal };
    },
    render(res, el) { emiHTML(res, el); }
  },

  /* ── ELIGIBILITY ── */
  'home-eligibility': {
    icon:'✅', name:'Home Loan Eligibility Calculator',
    desc:'Find the maximum loan you can get based on your income.',
    fields:[
      { id:'income',      label:'Monthly Net Income',      type:'range', min:20000,  max:500000, step:5000, default:75000, fmt:v=>fmtC(v) },
      { id:'obligations', label:'Existing EMI Obligations', type:'range', min:0,      max:100000, step:1000, default:5000,  fmt:v=>fmtC(v) },
      { id:'rate',        label:'Expected Interest Rate',  type:'range', min:1,      max:20,     step:0.1,  default:8.5,   fmt:v=>v+'%' },
      { id:'tenure',      label:'Loan Tenure (Years)',     type:'range', min:5,      max:30,     step:1,    default:20,    fmt:v=>v+' Yrs' }
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
        <div class="result-hero">
          <div class="result-hero-label">Maximum Eligible Loan</div>
          <div class="result-hero-value">${fmtC(Math.max(0, res.eligible))}</div>
          <div class="result-hero-sub">${res.eligible > 0 ? inLakhsCr(res.eligible) : 'Reduce your existing obligations'}</div>
        </div>
        <div class="result-breakdown">
          ${row('Monthly Income',         fmtC(res.income))}
          ${row('Existing EMIs',          fmtC(res.obligations), 'red')}
          ${row('EMI Available (50% FOIR)', fmtC(Math.max(0, res.availEMI)), 'green')}
          ${row('FOIR Used',              ((res.obligations/res.income)*100).toFixed(1)+'%')}
        </div>`;
    }
  },

  /* ── AFFORDABILITY ── */
  'home-affordability': {
    icon:'💰', name:'Home Affordability Calculator',
    desc:'Find the maximum home price you can afford.',
    fields:[
      { id:'income',      label:'Monthly Income',        type:'range', min:20000,  max:500000,  step:5000,  default:80000,   fmt:v=>fmtC(v) },
      { id:'downPayment', label:'Down Payment Available', type:'range', min:100000, max:5000000, step:50000, default:1000000, fmt:v=>fmtC(v) },
      { id:'rate',        label:'Interest Rate (p.a.)',  type:'range', min:1,      max:20,      step:0.1,   default:8.5,     fmt:v=>v+'%' },
      { id:'tenure',      label:'Loan Tenure (Years)',   type:'range', min:5,      max:30,      step:1,     default:20,      fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const maxEMI = f.income * 0.4;
      const r = f.rate / 12 / 100, n = f.tenure * 12;
      const maxLoan = maxEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n));
      return { affordable: maxLoan + f.downPayment, maxLoan, dp: f.downPayment, maxEMI };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Affordable Home Price</div>
          <div class="result-hero-value">${fmtC(res.affordable)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.affordable)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Maximum Home Loan', fmtC(res.maxLoan))}
          ${row('Down Payment',      fmtC(res.dp), 'green')}
          ${row('Max Monthly EMI',   fmtC(res.maxEMI))}
          ${row('Down Payment %',    ((res.dp/res.affordable)*100).toFixed(1)+'%')}
        </div>`;
    }
  },

  /* ── BALANCE TRANSFER ── */
  'home-balance-transfer': {
    icon:'🔄', name:'Home Loan Balance Transfer',
    desc:'Calculate savings by switching to a lower interest rate.',
    fields:[
      { id:'outstanding', label:'Outstanding Loan Amount', type:'range', min:100000, max:10000000, step:50000, default:2500000, fmt:v=>fmtC(v) },
      { id:'currentRate', label:'Current Rate (p.a.)',     type:'range', min:1, max:20, step:0.1, default:9.5, fmt:v=>v+'%' },
      { id:'newRate',     label:'New Rate (p.a.)',          type:'range', min:1, max:20, step:0.1, default:8.5, fmt:v=>v+'%' },
      { id:'tenure',      label:'Remaining Tenure (Years)', type:'range', min:1, max:30, step:1,   default:15,  fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const months = f.tenure * 12;
      const oldEMI = calcEMI(f.outstanding, f.currentRate, months);
      const newEMI = calcEMI(f.outstanding, f.newRate,     months);
      return { oldEMI, newEMI, emiSaving: oldEMI - newEMI, totalSaving: (oldEMI - newEMI) * months };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Total Savings</div>
          <div class="result-hero-value" style="color:var(--green)">${fmtC(res.totalSaving)}</div>
          <div class="result-hero-sub">over remaining tenure</div>
        </div>
        <div class="result-breakdown">
          ${row('Current EMI',      fmtC(res.oldEMI), 'red')}
          ${row('New EMI',          fmtC(res.newEMI), 'green')}
          ${row('Monthly Savings',  fmtC(res.emiSaving), 'green')}
          ${row('Total Saved',      fmtC(res.totalSaving), 'green')}
        </div>`;
    }
  },

  /* ── LTV ── */
  'loan-to-value': {
    icon:'📐', name:'Loan to Value (LTV) Calculator',
    desc:'Calculate LTV ratio — key metric banks use for loan approval.',
    fields:[
      { id:'propertyValue', label:'Property Value',  type:'range', min:500000, max:50000000, step:100000, default:5000000,  fmt:v=>fmtC(v) },
      { id:'loanAmount',    label:'Loan Amount',     type:'range', min:100000, max:10000000, step:50000,  default:3500000, fmt:v=>fmtC(v) }
    ],
    calc(f) {
      const ltv = (f.loanAmount / f.propertyValue) * 100;
      return { ltv, dp: f.propertyValue - f.loanAmount, pv: f.propertyValue, la: f.loanAmount };
    },
    render(res, el) {
      const col = res.ltv <= 75 ? 'var(--green)' : res.ltv <= 85 ? 'var(--gold)' : 'var(--red)';
      const tag = res.ltv <= 75 ? '✅ Excellent' : res.ltv <= 80 ? '⚠️ Good' : res.ltv <= 90 ? '🔶 Acceptable' : '❌ Too High';
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">LTV Ratio</div>
          <div class="result-hero-value" style="color:${col}">${res.ltv.toFixed(1)}%</div>
          <div class="result-hero-sub">${tag}</div>
        </div>
        <div class="result-breakdown">
          ${row('Property Value',     fmtC(res.pv))}
          ${row('Loan Amount',        fmtC(res.la))}
          ${row('Down Payment',       fmtC(res.dp), 'green')}
          ${row('Max at 90% LTV',     fmtC(res.pv * 0.9))}
          ${row('Max at 80% LTV',     fmtC(res.pv * 0.8))}
        </div>`;
    }
  },

  /* ── COMPARE BANK ── */
  'compare-bank': {
    icon:'🏦', name:'Compare Bank EMI',
    desc:'Compare EMIs across 4 banks to find the best deal.',
    fields:[
      { id:'amount', label:'Loan Amount',    type:'range', min:100000, max:10000000, step:50000, default:3000000, fmt:v=>fmtC(v) },
      { id:'tenure', label:'Tenure (Years)', type:'range', min:1, max:30, step:1, default:20, fmt:v=>v+' Yrs' },
      { id:'rate1',  label:'Bank A Rate',    type:'range', min:1, max:20, step:0.05, default:8.35, fmt:v=>v+'%' },
      { id:'rate2',  label:'Bank B Rate',    type:'range', min:1, max:20, step:0.05, default:8.5,  fmt:v=>v+'%' },
      { id:'rate3',  label:'Bank C Rate',    type:'range', min:1, max:20, step:0.05, default:8.7,  fmt:v=>v+'%' },
      { id:'rate4',  label:'Bank D Rate',    type:'range', min:1, max:20, step:0.05, default:9.0,  fmt:v=>v+'%' }
    ],
    calc(f) {
      const months = f.tenure * 12;
      const names  = ['SBI','HDFC','ICICI','Axis'];
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
        <div class="result-hero">
          <div class="result-hero-label">Best EMI</div>
          <div class="result-hero-value">${fmtC(minEMI)}</div>
          <div class="result-hero-sub">${res.banks.find(b => b.emi === minEMI).name} · ${res.banks.find(b => b.emi === minEMI).rate}%</div>
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
                  <td style="color:${b.emi === minEMI ? 'var(--green)' : 'var(--red)'}">${b.emi === minEMI ? '🏆 Best' : '+'+fmtC(b.emi - minEMI)+'/mo'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    }
  },

  /* ── LOAN AGAINST PROPERTY ── */
  'loan-against-property': {
    icon:'🏗️', name:'Loan Against Property',
    desc:'Calculate loan amount and EMI against your property.',
    fields:[
      { id:'propertyValue', label:'Property Market Value', type:'range', min:500000, max:50000000, step:100000, default:8000000, fmt:v=>fmtC(v) },
      { id:'ltv',           label:'LTV Ratio',             type:'range', min:50, max:75, step:5,   default:60,   fmt:v=>v+'%' },
      { id:'rate',          label:'Interest Rate (p.a.)',  type:'range', min:1,  max:20, step:0.1, default:10.5, fmt:v=>v+'%' },
      { id:'tenure',        label:'Tenure (Years)',        type:'range', min:1,  max:15, step:1,   default:10,   fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const loan   = f.propertyValue * f.ltv / 100;
      const months = f.tenure * 12;
      const emi    = calcEMI(loan, f.rate, months);
      const total  = emi * months;
      return { loan, emi, total, interest: total - loan, pv: f.propertyValue };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Monthly EMI</div>
          <div class="result-hero-value">${fmtC(res.emi)}</div>
          <div class="result-hero-sub">Loan: ${fmtC(res.loan)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Property Value', fmtC(res.pv))}
          ${row('Loan Amount',    fmtC(res.loan))}
          ${row('Total Interest', fmtC(res.interest), 'red')}
          ${row('Total Payment',  fmtC(res.total))}
        </div>
        <div class="chart-wrap"><canvas id="chartDonut" style="max-width:170px;max-height:170px"></canvas></div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Principal</div>
          <div class="legend-item"><div class="legend-dot" style="background:#ef4444cc"></div>Interest</div>
        </div>`;
      setTimeout(() => FinCharts.createDonut('chartDonut', res.loan, res.interest), 60);
    }
  },

  /* ── CAR LOAN ── */
  'car-loan': {
    icon:'🚗', name:'Car Loan EMI Calculator',
    desc:'Calculate monthly EMI for your car purchase loan.',
    fields:[
      { id:'principal', label:'Loan Amount',       type:'range', min:100000, max:5000000, step:25000, default:800000, fmt:v=>fmtC(v) },
      { id:'rate',      label:'Interest Rate (p.a.)', type:'range', min:1, max:20, step:0.1, default:9.5, fmt:v=>v+'%' },
      { id:'tenure',    label:'Tenure (Years)',      type:'range', min:1, max:7,  step:1,   default:5,   fmt:v=>v+' Yrs' }
    ],
    calc(f) { return emiCalc(f.principal, f.rate, f.tenure * 12); },
    render(res, el) { emiHTML(res, el); }
  },

  /* ── TWO WHEELER ── */
  'two-wheeler': {
    icon:'🏍️', name:'Two-Wheeler Loan Calculator',
    desc:'Calculate monthly EMI for bike or scooter loans.',
    fields:[
      { id:'principal', label:'Loan Amount',         type:'range', min:20000,  max:500000, step:5000, default:100000, fmt:v=>fmtC(v) },
      { id:'rate',      label:'Interest Rate (p.a.)', type:'range', min:1, max:24, step:0.1, default:10.5, fmt:v=>v+'%' },
      { id:'tenure',    label:'Tenure (Years)',       type:'range', min:1, max:5,  step:1,   default:3,    fmt:v=>v+' Yrs' }
    ],
    calc(f) { return emiCalc(f.principal, f.rate, f.tenure * 12); },
    render(res, el) { emiHTML(res, el); }
  },

  /* ── EDUCATION LOAN ── */
  'education-loan': {
    icon:'🎓', name:'Education Loan Calculator',
    desc:'Calculate EMI with moratorium (grace) period.',
    fields:[
      { id:'principal',  label:'Loan Amount',         type:'range', min:100000, max:5000000, step:25000, default:1000000, fmt:v=>fmtC(v) },
      { id:'rate',       label:'Interest Rate (p.a.)', type:'range', min:1, max:20, step:0.1, default:10.5, fmt:v=>v+'%' },
      { id:'moratorium', label:'Moratorium (Months)',  type:'range', min:0, max:60, step:6,   default:12,   fmt:v=>v+' Mo' },
      { id:'tenure',     label:'Repayment Tenure (Years)', type:'range', min:1, max:15, step:1, default:7, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const interestDuring = f.principal * (f.rate / 12 / 100) * f.moratorium;
      const loanAfter      = f.principal + interestDuring;
      const emi            = calcEMI(loanAfter, f.rate, f.tenure * 12);
      const total          = emi * f.tenure * 12;
      return { emi, total, interest: total - f.principal, principal: f.principal, interestDuring };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Monthly EMI (post-moratorium)</div>
          <div class="result-hero-value">${fmtC(res.emi)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Original Loan',              fmtC(res.principal))}
          ${row('Interest During Moratorium', fmtC(res.interestDuring), 'red')}
          ${row('Total Interest',             fmtC(res.interest), 'red')}
          ${row('Total Repayment',            fmtC(res.total))}
        </div>`;
    }
  },

  /* ── GOLD LOAN ── */
  'gold-loan': {
    icon:'💎', name:'Gold Loan Calculator',
    desc:'Calculate loan amount against your gold jewellery.',
    fields:[
      { id:'weight', label:'Gold Weight (grams)', type:'range', min:5,  max:1000, step:5,  default:50, fmt:v=>v+'g' },
      { id:'purity', label:'Gold Purity (Karat)',  type:'range', min:18, max:24,   step:2,  default:22, fmt:v=>v+'K' },
      { id:'rate',   label:'Interest Rate (p.a.)', type:'range', min:7,  max:30,   step:0.5, default:14, fmt:v=>v+'%' },
      { id:'tenure', label:'Tenure (Months)',      type:'range', min:1,  max:36,   step:1,  default:12, fmt:v=>v+' Mo' }
    ],
    calc(f) {
      const ratePerGram   = marketData?.gold?.g24 || 9420;
      const pureMult      = { 18: 0.75, 20: 0.833, 22: 0.917, 24: 1 }[f.purity] || 0.917;
      const goldValue     = f.weight * ratePerGram * pureMult;
      const loanAmount    = goldValue * 0.75;
      const emi           = calcEMI(loanAmount, f.rate, f.tenure);
      const total         = emi * f.tenure;
      return { loanAmount, emi, total, interest: total - loanAmount, goldValue, ratePerGram };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Loan Amount (75% LTV)</div>
          <div class="result-hero-value">${fmtC(res.loanAmount)}</div>
          <div class="result-hero-sub">Gold Value: ${fmtC(res.goldValue)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Gold Rate (24K/g)', '₹'+fmt(res.ratePerGram), 'gold')}
          ${row('Gold Market Value', fmtC(res.goldValue))}
          ${row('Monthly EMI',       fmtC(res.emi))}
          ${row('Total Interest',    fmtC(res.interest), 'red')}
          ${row('Total Payment',     fmtC(res.total))}
        </div>`;
    }
  },

  /* ── CREDIT CARD ── */
  'credit-card': {
    icon:'💳', name:'Credit Card Payoff Planner',
    desc:'See how long it takes to pay off your credit card balance.',
    fields:[
      { id:'outstanding', label:'Outstanding Balance',   type:'range', min:10000, max:1000000, step:5000, default:100000, fmt:v=>fmtC(v) },
      { id:'rate',        label:'Annual Interest Rate',  type:'range', min:12, max:48, step:1, default:36, fmt:v=>v+'%' },
      { id:'payment',     label:'Monthly Payment',       type:'range', min:1000, max:100000, step:500, default:10000, fmt:v=>fmtC(v) }
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
        el.innerHTML = `<div class="result-hero"><div class="result-hero-label">Warning</div>
          <div class="result-hero-value" style="color:var(--red)">Never paid off!</div>
          <div class="result-hero-sub">Monthly payment is less than accrued interest. Increase your payment.</div></div>`;
        return;
      }
      const y = Math.floor(res.months / 12), m = res.months % 12;
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Payoff Time</div>
          <div class="result-hero-value">${y > 0 ? y + 'y ' : ''}${m}m</div>
          <div class="result-hero-sub">${res.months} total months</div>
        </div>
        <div class="result-breakdown">
          ${row('Outstanding',       fmtC(res.outstanding))}
          ${row('Total Interest',    fmtC(res.totalInt), 'red')}
          ${row('Total Amount Paid', fmtC(res.totalPaid))}
          ${row('Interest Ratio',    ((res.totalInt/res.outstanding)*100).toFixed(0)+'%', 'red')}
        </div>`;
    }
  },

  /* ── CONSUMER DURABLE ── */
  'consumer-durable': {
    icon:'📱', name:'Consumer Durable Loan',
    desc:'Calculate EMI for electronics, appliances and gadgets.',
    fields:[
      { id:'principal', label:'Purchase Amount',     type:'range', min:5000,  max:500000, step:5000, default:50000, fmt:v=>fmtC(v) },
      { id:'rate',      label:'Interest Rate (p.a.)', type:'range', min:0, max:24, step:0.5, default:14, fmt:v=>v+'%' },
      { id:'tenure',    label:'Tenure (Months)',      type:'range', min:3, max:24, step:3,   default:12, fmt:v=>v+' Mo' }
    ],
    calc(f) { return emiCalc(f.principal, f.rate, f.tenure); },
    render(res, el) { emiHTML(res, el); }
  },

  /* ── SIP ── */
  'sip': {
    icon:'📈', name:'SIP Calculator',
    desc:'Calculate returns on your Systematic Investment Plan.',
    fields:[
      { id:'monthly', label:'Monthly SIP Amount',       type:'range', min:500,  max:200000, step:500,  default:10000, fmt:v=>fmtC(v) },
      { id:'rate',    label:'Expected Annual Returns',  type:'range', min:1,    max:30,     step:0.5,  default:12,    fmt:v=>v+'%' },
      { id:'years',   label:'Investment Period (Years)', type:'range', min:1,   max:40,     step:1,    default:15,    fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const r = f.rate / 12 / 100, n = f.years * 12;
      const maturity = f.monthly * (Math.pow(1+r,n)-1) / r * (1+r);
      const invested = f.monthly * n;
      return { maturity, invested, gains: maturity - invested, rate: f.rate, years: f.years, monthly: f.monthly };
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
        <div class="result-hero">
          <div class="result-hero-label">Maturity Value</div>
          <div class="result-hero-value">${fmtC(res.maturity)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.maturity)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Total Invested', fmtC(res.invested))}
          ${row('Wealth Gained',  fmtC(res.gains), 'green')}
          ${row('Return %',       ((res.gains/res.invested)*100).toFixed(1)+'%', 'green')}
          ${row('Wealth Ratio',   (res.maturity/res.invested).toFixed(2)+'x', 'green')}
        </div>
        <div class="chart-wrap" style="height:150px;display:block">
          <canvas id="chartGrowth" style="width:100%;height:150px"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#94a3b8"></div>Invested</div>
          <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Value</div>
        </div>`;
      setTimeout(() => FinCharts.createGrowthChart('chartGrowth', labels, inv, val), 60);
    }
  },

  /* ── LUMPSUM ── */
  'lumpsum': {
    icon:'💵', name:'Lumpsum Calculator',
    desc:'Calculate how a one-time investment grows over time.',
    fields:[
      { id:'amount', label:'Investment Amount',       type:'range', min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:'rate',   label:'Expected Annual Returns', type:'range', min:1, max:30, step:0.5, default:12, fmt:v=>v+'%' },
      { id:'years',  label:'Period (Years)',           type:'range', min:1, max:40, step:1,   default:10, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const maturity = f.amount * Math.pow(1 + f.rate/100, f.years);
      return { maturity, invested: f.amount, gains: maturity - f.amount, rate: f.rate, years: f.years };
    },
    render(res, el) {
      const labels = [], inv = [], val = [];
      for (let y = 1; y <= res.years; y++) {
        labels.push(`${y}Y`);
        inv.push(res.invested);
        val.push(res.invested * Math.pow(1 + res.rate/100, y));
      }
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Maturity Value</div>
          <div class="result-hero-value">${fmtC(res.maturity)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.maturity)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Invested Amount', fmtC(res.invested))}
          ${row('Wealth Gained',   fmtC(res.gains), 'green')}
          ${row('CAGR',            res.rate+'%', 'green')}
          ${row('Wealth Ratio',    (res.maturity/res.invested).toFixed(2)+'x', 'green')}
        </div>
        <div class="chart-wrap" style="height:150px;display:block">
          <canvas id="chartGrowth" style="width:100%;height:150px"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#94a3b8"></div>Invested</div>
          <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Value</div>
        </div>`;
      setTimeout(() => FinCharts.createGrowthChart('chartGrowth', labels, inv, val), 60);
    }
  },

  /* ── LUMPSUM + SIP ── */
  'lumpsum-sip': {
    icon:'🎯', name:'Lumpsum + SIP Calculator',
    desc:'Calculate combined returns from lumpsum + regular SIP.',
    fields:[
      { id:'lumpsum', label:'Lumpsum Amount',          type:'range', min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:'monthly', label:'Monthly SIP',              type:'range', min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:'rate',    label:'Expected Annual Returns',  type:'range', min:1,   max:30,      step:0.5, default:12,    fmt:v=>v+'%' },
      { id:'years',   label:'Period (Years)',            type:'range', min:1,   max:40,      step:1,   default:15,    fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const lumpsumVal = f.lumpsum * Math.pow(1 + f.rate/100, f.years);
      const r = f.rate / 12 / 100, n = f.years * 12;
      const sipVal     = f.monthly * (Math.pow(1+r,n)-1)/r*(1+r);
      const total      = lumpsumVal + sipVal;
      const invested   = f.lumpsum + f.monthly * n;
      return { total, invested, gains: total - invested, lumpsumVal, sipVal };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Total Maturity Value</div>
          <div class="result-hero-value">${fmtC(res.total)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.total)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Lumpsum Value', fmtC(res.lumpsumVal))}
          ${row('SIP Value',     fmtC(res.sipVal))}
          ${row('Total Invested', fmtC(res.invested))}
          ${row('Total Gains',   fmtC(res.gains), 'green')}
          ${row('Wealth Ratio',  (res.total/res.invested).toFixed(2)+'x', 'green')}
        </div>`;
    }
  },

  /* ── SIP DELAY ── */
  'sip-delay': {
    icon:'⏱️', name:'SIP Delay Cost Calculator',
    desc:'See the true cost of delaying your investments.',
    fields:[
      { id:'monthly', label:'Monthly SIP',               type:'range', min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:'rate',    label:'Expected Annual Returns',   type:'range', min:1,   max:30,     step:0.5, default:12,    fmt:v=>v+'%' },
      { id:'years',   label:'Total Investment Period',   type:'range', min:5,   max:40,     step:1,   default:20,    fmt:v=>v+' Yrs' },
      { id:'delay',   label:'Delay Period (Years)',      type:'range', min:1,   max:10,     step:1,   default:3,     fmt:v=>v+' Yrs' }
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
        <div class="result-hero">
          <div class="result-hero-label">Cost of ${res.delay}-Year Delay</div>
          <div class="result-hero-value" style="color:var(--red)">${fmtC(cost)}</div>
          <div class="result-hero-sub">Start today — time is your biggest asset</div>
        </div>
        <div class="result-breakdown">
          ${row('If you start TODAY',          fmtC(res.withoutDelay), 'green')}
          ${row(`If delayed ${res.delay} years`, fmtC(res.withDelay), 'red')}
          ${row('Wealth Lost',                 fmtC(cost), 'red')}
          ${row('% Wealth Lost',               ((cost/res.withoutDelay)*100).toFixed(1)+'%', 'red')}
        </div>`;
    }
  },

  /* ── TARGET VALUE ── */
  'target-value': {
    icon:'🏆', name:'Target SIP Calculator',
    desc:'Find the SIP amount needed to reach your financial goal.',
    fields:[
      { id:'target', label:'Target Amount',            type:'range', min:100000, max:100000000, step:100000, default:10000000, fmt:v=>fmtC(v) },
      { id:'rate',   label:'Expected Annual Returns',  type:'range', min:1, max:30, step:0.5, default:12, fmt:v=>v+'%' },
      { id:'years',  label:'Period (Years)',            type:'range', min:1, max:40, step:1,   default:15, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const r = f.rate / 12 / 100, n = f.years * 12;
      const sip = f.target * r / ((Math.pow(1+r,n)-1) * (1+r));
      return { sip, invested: sip * n, gains: f.target - sip * n, target: f.target };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Required Monthly SIP</div>
          <div class="result-hero-value">${fmtC(res.sip)}</div>
          <div class="result-hero-sub">to reach ₹${inLakhsCr(res.target)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Target Amount',    fmtC(res.target), 'gold')}
          ${row('Total Investment', fmtC(res.invested))}
          ${row('Expected Gains',   fmtC(res.gains), 'green')}
          ${row('Gain %',           ((res.gains/res.invested)*100).toFixed(1)+'%', 'green')}
        </div>`;
    }
  },

  /* ── CAGR ── */
  'cagr': {
    icon:'📊', name:'CAGR Calculator',
    desc:'Calculate Compound Annual Growth Rate of any investment.',
    fields:[
      { id:'initial', label:'Initial Investment', type:'range', min:10000,  max:10000000, step:10000, default:100000, fmt:v=>fmtC(v) },
      { id:'final',   label:'Final Value',        type:'range', min:10000,  max:50000000, step:10000, default:350000, fmt:v=>fmtC(v) },
      { id:'years',   label:'Period (Years)',      type:'range', min:1, max:40, step:1, default:10, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const cagr = (Math.pow(f.final / f.initial, 1 / f.years) - 1) * 100;
      return { cagr, gains: f.final - f.initial, initial: f.initial, final: f.final, absReturn: ((f.final - f.initial) / f.initial) * 100 };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">CAGR</div>
          <div class="result-hero-value" style="color:var(--green)">${res.cagr.toFixed(2)}%</div>
          <div class="result-hero-sub">Compound Annual Growth Rate</div>
        </div>
        <div class="result-breakdown">
          ${row('Initial Value',    fmtC(res.initial))}
          ${row('Final Value',      fmtC(res.final))}
          ${row('Total Gains',      fmtC(res.gains), 'green')}
          ${row('Absolute Return',  res.absReturn.toFixed(2)+'%', 'green')}
        </div>`;
    }
  },

  /* ── FD ── */
  'fd': {
    icon:'🏛️', name:'Fixed Deposit Calculator',
    desc:'Calculate maturity amount and interest on your FD.',
    fields:[
      { id:'amount',      label:'Principal Amount',      type:'range', min:10000, max:10000000, step:10000, default:500000, fmt:v=>fmtC(v) },
      { id:'rate',        label:'Interest Rate (p.a.)',  type:'range', min:1, max:15, step:0.1, default:7.1, fmt:v=>v+'%' },
      { id:'years',       label:'Tenure (Years)',        type:'range', min:1, max:10, step:1,   default:3,   fmt:v=>v+' Yrs' },
      { id:'compounding', label:'Compounding (per year)', type:'range', min:1, max:12, step:1,  default:4,
        fmt: v => ({1:'Annual',2:'Half-Yearly',4:'Quarterly',12:'Monthly'})[v] || v+'/yr' }
    ],
    calc(f) {
      const maturity = f.amount * Math.pow(1 + (f.rate/100)/f.compounding, f.compounding * f.years);
      return { maturity, interest: maturity - f.amount, principal: f.amount };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Maturity Amount</div>
          <div class="result-hero-value">${fmtC(res.maturity)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Principal',       fmtC(res.principal))}
          ${row('Interest Earned', fmtC(res.interest), 'green')}
          ${row('Return %',        ((res.interest/res.principal)*100).toFixed(2)+'%', 'green')}
        </div>
        <div class="chart-wrap"><canvas id="chartDonut" style="max-width:170px;max-height:170px"></canvas></div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Principal</div>
          <div class="legend-item"><div class="legend-dot" style="background:#22c55ecc"></div>Interest</div>
        </div>`;
      setTimeout(() => FinCharts.createSavingsDonut('chartDonut', res.principal, res.interest), 60);
    }
  },

  /* ── RD ── */
  'rd': {
    icon:'📅', name:'Recurring Deposit Calculator',
    desc:'Calculate maturity amount for monthly recurring deposits.',
    fields:[
      { id:'monthly', label:'Monthly Deposit',       type:'range', min:500, max:100000, step:500, default:10000, fmt:v=>fmtC(v) },
      { id:'rate',    label:'Interest Rate (p.a.)', type:'range', min:1, max:15, step:0.1, default:7.0, fmt:v=>v+'%' },
      { id:'years',   label:'Tenure (Years)',        type:'range', min:1, max:10, step:1,   default:3,   fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const n = f.years * 12, r = f.rate / 400;
      const maturity = f.monthly * n + f.monthly * n * (n+1) * r / 2;
      return { maturity, invested: f.monthly * n, interest: maturity - f.monthly * n };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Maturity Amount</div>
          <div class="result-hero-value">${fmtC(res.maturity)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Total Deposited', fmtC(res.invested))}
          ${row('Interest Earned', fmtC(res.interest), 'green')}
          ${row('Return %',        ((res.interest/res.invested)*100).toFixed(2)+'%', 'green')}
        </div>`;
    }
  },

  /* ── PPF ── */
  'ppf': {
    icon:'🔐', name:'PPF Calculator',
    desc:'Calculate Public Provident Fund returns (EEE Tax Status).',
    fields:[
      { id:'yearly', label:'Yearly Investment (max ₹1.5L)', type:'range', min:500, max:150000, step:500, default:150000, fmt:v=>fmtC(v) },
      { id:'rate',   label:'PPF Interest Rate',             type:'range', min:6, max:9, step:0.1, default:7.1, fmt:v=>v+'%' },
      { id:'years',  label:'Period (Years, min 15)',         type:'range', min:15, max:50, step:5, default:15,  fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      let bal = 0;
      for (let i = 0; i < f.years; i++) bal = (bal + f.yearly) * (1 + f.rate/100);
      const invested = f.yearly * f.years;
      return { maturity: bal, invested, interest: bal - invested };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Maturity Amount (Tax-Free)</div>
          <div class="result-hero-value">${fmtC(res.maturity)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.maturity)} · EEE Tax Benefit</div>
        </div>
        <div class="result-breakdown">
          ${row('Total Invested',    fmtC(res.invested))}
          ${row('Interest Earned',   fmtC(res.interest), 'green')}
          ${row('Wealth Multiplier', (res.maturity/res.invested).toFixed(2)+'x', 'green')}
        </div>`;
    }
  },

  /* ── RETIREMENT ── */
  'retirement': {
    icon:'👴', name:'Retirement Planner',
    desc:'Calculate the corpus needed to maintain your post-retirement lifestyle.',
    fields:[
      { id:'currentAge',     label:'Current Age',              type:'range', min:20, max:60, step:1,   default:30,    fmt:v=>v+' yrs' },
      { id:'retirementAge',  label:'Retirement Age',           type:'range', min:45, max:70, step:1,   default:60,    fmt:v=>v+' yrs' },
      { id:'monthlyExpenses',label:'Current Monthly Expenses', type:'range', min:20000, max:500000, step:5000, default:60000, fmt:v=>fmtC(v) },
      { id:'inflation',      label:'Expected Inflation',       type:'range', min:1, max:12, step:0.5, default:6,  fmt:v=>v+'%' },
      { id:'returns',        label:'Post-Retirement Returns',  type:'range', min:1, max:12, step:0.5, default:7,  fmt:v=>v+'%' }
    ],
    calc(f) {
      const yearsToRetire = f.retirementAge - f.currentAge;
      const postRetYears  = 85 - f.retirementAge;
      const futureExpense = f.monthlyExpenses * Math.pow(1 + f.inflation/100, yearsToRetire);
      const annualExp     = futureExpense * 12;
      const r = f.returns / 100, inf = f.inflation / 100;
      const corpus = annualExp * (1 - Math.pow((1+inf)/(1+r), postRetYears)) / (r - inf);
      const sipNeeded = corpus * (f.returns/12/100) / (Math.pow(1 + f.returns/12/100, yearsToRetire*12) - 1);
      return { corpus, futureExpense, sipNeeded, yearsToRetire, postRetYears };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Retirement Corpus Needed</div>
          <div class="result-hero-value">${fmtC(res.corpus)}</div>
          <div class="result-hero-sub">${inLakhsCr(res.corpus)}</div>
        </div>
        <div class="result-breakdown">
          ${row('Years to Retire',        res.yearsToRetire+' years')}
          ${row('Post-Retirement Years',   res.postRetYears+' years')}
          ${row('Future Monthly Expense',  fmtC(res.futureExpense))}
          ${row('Monthly SIP Required',    fmtC(res.sipNeeded), 'green')}
        </div>`;
    }
  },

  /* ── INFLATION ── */
  'inflation': {
    icon:'📉', name:'Inflation Calculator',
    desc:'Calculate how inflation erodes your purchasing power.',
    fields:[
      { id:'amount',   label:'Current Amount',       type:'range', min:10000, max:10000000, step:10000, default:1000000, fmt:v=>fmtC(v) },
      { id:'inflation',label:'Annual Inflation Rate', type:'range', min:1, max:20, step:0.5, default:6, fmt:v=>v+'%' },
      { id:'years',    label:'Number of Years',      type:'range', min:1, max:50, step:1,   default:10, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const futureNeeded = f.amount * Math.pow(1 + f.inflation/100, f.years);
      return { futureNeeded, loss: futureNeeded - f.amount, lossPct: ((futureNeeded - f.amount)/f.amount)*100, amount: f.amount };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Future Value Equivalent</div>
          <div class="result-hero-value">${fmtC(res.futureNeeded)}</div>
          <div class="result-hero-sub">= Today's ${fmtC(res.amount)} after inflation</div>
        </div>
        <div class="result-breakdown">
          ${row("Today's Value",     fmtC(res.amount))}
          ${row('Future Equivalent', fmtC(res.futureNeeded))}
          ${row('Value Lost',        fmtC(res.loss), 'red')}
          ${row('Erosion %',         res.lossPct.toFixed(1)+'%', 'red')}
        </div>`;
    }
  },

  /* ── GRATUITY ── */
  'gratuity': {
    icon:'🎁', name:'Gratuity Calculator',
    desc:'Calculate gratuity as per the Payment of Gratuity Act, 1972.',
    fields:[
      { id:'salary', label:'Last Basic Salary (monthly)', type:'range', min:10000, max:500000, step:5000, default:50000, fmt:v=>fmtC(v) },
      { id:'da',     label:'Dearness Allowance (DA)',     type:'range', min:0, max:100000, step:1000, default:0, fmt:v=>fmtC(v) },
      { id:'years',  label:'Years of Service',            type:'range', min:5, max:40, step:1, default:10, fmt:v=>v+' Yrs' }
    ],
    calc(f) {
      const basicDA = f.salary + f.da;
      const gratuity = (basicDA * 15 * f.years) / 26;
      return { gratuity, taxFree: Math.min(gratuity, 2000000), taxable: Math.max(0, gratuity - 2000000), basicDA };
    },
    render(res, el) {
      el.innerHTML = `
        <div class="result-hero">
          <div class="result-hero-label">Gratuity Amount</div>
          <div class="result-hero-value">${fmtC(res.gratuity)}</div>
          <div class="result-hero-sub">As per Payment of Gratuity Act, 1972</div>
        </div>
        <div class="result-breakdown">
          ${row('Basic + DA',    fmtC(res.basicDA)+'/mo')}
          ${row('Tax-Free',      fmtC(res.taxFree), 'green')}
          ${row('Taxable',       fmtC(res.taxable), res.taxable > 0 ? 'red' : '')}
          ${row('Formula',       '(B+DA)×15×Years÷26')}
        </div>`;
    }
  }

}; // end CALCS

/* ── Shared helpers ──────────────────────────────── */
function emiCalc(principal, rate, months) {
  const emi   = calcEMI(principal, rate, months);
  const total = emi * months;
  return { emi, total, interest: total - principal, principal };
}

function emiHTML(res, el) {
  el.innerHTML = `
    <div class="result-hero">
      <div class="result-hero-label">Monthly EMI</div>
      <div class="result-hero-value">${fmtC(res.emi)}</div>
    </div>
    <div class="result-breakdown">
      ${row('Principal Amount', fmtC(res.principal))}
      ${row('Total Interest',   fmtC(res.interest), 'red')}
      ${row('Total Payment',    fmtC(res.total))}
      ${row('Interest Ratio',   ((res.interest/res.principal)*100).toFixed(1)+'%', 'red')}
    </div>
    <div class="chart-wrap"><canvas id="chartDonut" style="max-width:170px;max-height:170px"></canvas></div>
    <div class="chart-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Principal</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444cc"></div>Interest</div>
    </div>`;
  setTimeout(() => FinCharts.createDonut('chartDonut', res.principal, res.interest), 60);
}

function row(label, val, cls = '') {
  return `<div class="result-row">
    <span class="result-row-label">${label}</span>
    <span class="result-row-val${cls ? ' '+cls : ''}">${val}</span>
  </div>`;
}

/* ── Gold Loan Panel Updater ─────────────────────── */
function updateGoldLoanPanel(d) {
  if (!d?.gold) return;
  const g = d.gold;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  s('glpTs', d.ts);
  s('glp-g24', '₹' + fmt(g.g24) + '/g');
  s('glp-g22', '₹' + fmt(g.g22) + '/g');
  s('glp-g20', '₹' + fmt(g.g20) + '/g');
  s('glp-g18', '₹' + fmt(g.g18) + '/g');
  s('glp-silver',   '₹' + fmt(g.silver, 2) + '/g');
  s('glp-platinum', '₹' + fmt(g.platinum) + '/g');

  // 24K change
  const ch24El = document.getElementById('glp-ch24');
  if (ch24El) {
    const up = g.ch24 >= 0;
    ch24El.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(g.ch24)} (${up ? '+' : ''}${g.chp24}%)`;
    ch24El.className = 'glp-rate-change ' + (up ? 'up' : 'down');
  }

  // Derived changes for lower purities (same % as 24K)
  [['glp-ch22', g.g22], ['glp-ch20', g.g20], ['glp-ch18', g.g18]].forEach(([id, rate]) => {
    const el = document.getElementById(id);
    if (el) {
      const ch = +(rate * g.chp24 / 100).toFixed(0);
      const up = g.chp24 >= 0;
      el.textContent = `${up ? '▲' : '▼'} ₹${Math.abs(ch)} (${up ? '+' : ''}${Math.abs(g.chp24).toFixed(2)}%)`;
      el.className = 'glp-rate-change ' + (up ? 'up' : 'down');
    }
  });

  // Sparkline
  const canvas = document.getElementById('glpSparkCanvas');
  if (canvas && g.spark) FinCharts.drawSparkline(canvas, g.spark, '#d97706');

  // Recompute the loan calc with latest gold price
  computeCalc('gold-loan');
}

/* ══════════════════════════════════════════════════
   CALCULATOR RENDERER
   ══════════════════════════════════════════════════ */
function renderCalc(id) {
  const cfg = CALCS[id];
  if (!cfg) { navigate('home'); return; }

  const isGoldLoan = id === 'gold-loan';

  document.getElementById('appMain').innerHTML = `
    <div class="calc-page">
      <div class="calc-header">
        <button class="back-btn" onclick="showHome()">← Back to Home</button>
        <h1>${cfg.icon} ${cfg.name}</h1>
        <p>${cfg.desc}</p>
      </div>
      <div class="calc-body${isGoldLoan ? ' calc-body--gold-loan' : ''}">
        <div class="form-card" id="calcForm">
          ${cfg.fields.map(f => fieldHTML(f)).join('')}
          <button class="btn-primary" id="calcBtn" onclick="computeCalc('${id}')">Calculate</button>
        </div>
        <div class="result-card" id="calcResult">
          <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
            <div style="font-size:3rem;margin-bottom:14px">${cfg.icon}</div>
            <p style="font-size:0.9rem">Adjust the sliders and hit <strong style="color:var(--text-secondary)">Calculate</strong></p>
          </div>
        </div>
        ${isGoldLoan ? `
        <div class="gold-live-panel" id="goldLivePanel">
          <div class="glp-header">
            <span class="glp-title">🥇 Live Gold Rates</span>
            <span class="glp-live"><span class="live-dot" style="width:6px;height:6px;border-radius:50%;background:#16a34a;display:inline-block;animation:pulse 2s infinite"></span> Live</span>
          </div>
          <div class="glp-ts" id="glpTs">—</div>

          <div class="glp-rates">
            <div class="glp-rate-row glp-rate--g24">
              <div class="glp-rate-label">24K <span class="glp-purity">(99.9%)</span></div>
              <div class="glp-rate-val" id="glp-g24">—</div>
              <div class="glp-rate-change" id="glp-ch24">—</div>
            </div>
            <div class="glp-rate-row glp-rate--g22">
              <div class="glp-rate-label">22K <span class="glp-purity">(91.7%)</span></div>
              <div class="glp-rate-val" id="glp-g22">—</div>
              <div class="glp-rate-change" id="glp-ch22">—</div>
            </div>
            <div class="glp-rate-row glp-rate--g20">
              <div class="glp-rate-label">20K <span class="glp-purity">(83.3%)</span></div>
              <div class="glp-rate-val" id="glp-g20">—</div>
              <div class="glp-rate-change" id="glp-ch20">—</div>
            </div>
            <div class="glp-rate-row glp-rate--g18">
              <div class="glp-rate-label">18K <span class="glp-purity">(75.0%)</span></div>
              <div class="glp-rate-val" id="glp-g18">—</div>
              <div class="glp-rate-change" id="glp-ch18">—</div>
            </div>
          </div>

          <div class="glp-divider"></div>

          <div class="glp-section-label">Precious Metals</div>
          <div class="glp-metals">
            <div class="glp-metal-row">
              <span class="glp-metal-name">🥈 Silver (999)</span>
              <span class="glp-metal-val" id="glp-silver">—</span>
            </div>
            <div class="glp-metal-row">
              <span class="glp-metal-name">💜 Platinum (950)</span>
              <span class="glp-metal-val" id="glp-platinum">—</span>
            </div>
          </div>

          <div class="glp-divider"></div>

          <div class="glp-section-label">Price Chart (24K)</div>
          <div style="height:70px;margin-top:4px">
            <canvas id="glpSparkCanvas" style="width:100%;height:70px"></canvas>
          </div>

          <div class="glp-hint">💡 Rates used live in your loan calculation</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  // Wire up sliders
  cfg.fields.forEach(f => {
    const slider  = document.getElementById(`sl-${f.id}`);
    const numInput= document.getElementById(`ni-${f.id}`);
    const valEl   = document.getElementById(`vl-${f.id}`);

    if (!slider || !numInput) return;

    function sync(v) {
      v = Math.min(Math.max(v, f.min), f.max);
      slider.value   = v;
      numInput.value = v;
      if (valEl) valEl.textContent = f.fmt ? f.fmt(v) : v;
      updateFill(slider, f);
    }

    slider.addEventListener('input', () => sync(parseFloat(slider.value)));
    numInput.addEventListener('input', () => sync(parseFloat(numInput.value) || f.default));

    sync(f.default);
  });

  // Auto-compute
  computeCalc(id);

  // Populate gold panel immediately if we have data
  if (isGoldLoan && marketData) updateGoldLoanPanel(marketData);
}

function fieldHTML(f) {
  return `
    <div class="form-group">
      <label>${f.label} <span id="vl-${f.id}">${f.fmt ? f.fmt(f.default) : f.default}</span></label>
      <input type="range" class="range-slider" id="sl-${f.id}"
        min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
      <input type="number" class="form-input" id="ni-${f.id}"
        min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}"
        style="margin-top:8px">
    </div>`;
}

function updateFill(slider, f) {
  const pct = ((slider.value - f.min) / (f.max - f.min)) * 100;
  slider.style.setProperty('--pct', Math.max(0, Math.min(100, pct)) + '%');
}

function computeCalc(id) {
  const cfg = CALCS[id];
  if (!cfg) return;

  const fields = {};
  cfg.fields.forEach(f => {
    const el = document.getElementById(`ni-${f.id}`);
    fields[f.id] = parseFloat(el?.value ?? f.default);
  });

  const res = cfg.calc(fields);
  const el  = document.getElementById('calcResult');
  if (el) cfg.render(res, el);
}

/* ══════════════════════════════════════════════════
   MOBILE NAV
   ══════════════════════════════════════════════════ */
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileDrawer')?.classList.add('open');
  document.getElementById('drawerOverlay')?.classList.add('open');
});

document.getElementById('drawerClose')?.addEventListener('click', closeMobile);
document.getElementById('drawerOverlay')?.addEventListener('click', closeMobile);

/* ══════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════ */
navigate('home');
