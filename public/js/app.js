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
    case 'home':                  document.getElementById('tab-home')?.classList.add('active');   renderHome(); break;
    case 'search-wizard':         document.getElementById('tab-search')?.classList.add('active'); renderSearchWizard(); break;
    case 'compare-lenders':       document.getElementById('tab-emi')?.classList.add('active');    renderCompareLenders(); break;
    case 'home-eligibility':      document.getElementById('tab-emi')?.classList.add('active');    renderHomeEligibility(); break;
    case 'home-loan':             document.getElementById('tab-emi')?.classList.add('active');    renderHomeLoan(); break;
    case 'home-balance-transfer': document.getElementById('tab-emi')?.classList.add('active');    renderBalanceTransfer(); break;
    case 'lender-directory':      document.getElementById('tab-emi')?.classList.add('active');    renderLenderDirectory(); break;
    case 'track-application':     document.getElementById('tab-track')?.classList.add('active'); renderTrackApplication(); break;
    case 'ai-assistant':          document.getElementById('tab-ai')?.classList.add('active');    renderAIAssistant(); break;
    case 'gold-rates':            document.getElementById('tab-gold')?.classList.add('active');   renderGoldRates(); break;
    case 'market':                document.getElementById('tab-market')?.classList.add('active'); renderMarket(); break;
    default:
      if (view.startsWith('lender-')) renderLenderDetail(view.replace('lender-', ''));
      else if (view.startsWith('product-')) renderProductPage(view.replace('product-', ''));
      else if (view.startsWith('city-')) renderLocalSEOPage(view.replace('city-', ''));
      else renderCalc(view);
      break;
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
  if (currentView === 'home')       updateHomeTicker(marketData);
  else if (currentView === 'gold-rates') updateGoldRates(marketData);
  else if (currentView === 'market')     updateMarketPage(marketData);
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
   HOME PAGE — India's Home Loan Discovery Platform
   ══════════════════════════════════════════════════ */
function renderHome() {
  document.getElementById('appMain').innerHTML = `
    <section class="hero">
      <div class="hero-tag">🇮🇳 India's #1 Home Loan Discovery Platform</div>
      <h1>Search, Compare &amp; Apply for<br><span>Home Loans in India</span></h1>
      <p class="hero-sub">Compare interest rates across 15+ Banks &amp; HFCs (SBI, HDFC, ICICI, Axis, Bajaj, LIC HFL). Calculate total loan cost, eligibility, and track your application live.</p>
      
      <!-- Quick Search Widget -->
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:24px;max-width:850px;margin:28px auto 0;box-shadow:var(--shadow-md);text-align:left">
        <div style="font-weight:800;font-size:1.1rem;margin-bottom:16px;color:var(--text-primary);display:flex;align-items:center;gap:8px">
          <span>🔍</span> Quick Loan Matcher
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
          <div>
            <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:6px">Loan Required</label>
            <select class="form-input" id="qsLoanAmount" style="padding:10px;font-weight:700">
              <option value="3000000">₹30 Lakh</option>
              <option value="5000000" selected>₹50 Lakh</option>
              <option value="7500000">₹75 Lakh</option>
              <option value="10000000">₹1 Crore</option>
              <option value="15000000">₹1.5 Crore</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:6px">Monthly Income</label>
            <select class="form-input" id="qsIncome" style="padding:10px;font-weight:700">
              <option value="60000">₹60,000 / mo</option>
              <option value="100000" selected>₹1 Lakh / mo</option>
              <option value="150000">₹1.5 Lakh / mo</option>
              <option value="250000">₹2.5 Lakh / mo</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:6px">Tenure</label>
            <select class="form-input" id="qsTenure" style="padding:10px;font-weight:700">
              <option value="15">15 Years</option>
              <option value="20" selected>20 Years</option>
              <option value="25">25 Years</option>
              <option value="30">30 Years</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end">
            <button onclick="openCalc('search-wizard');return false;" class="btn-primary" style="width:100%;height:44px;font-weight:800;border-radius:10px;margin-top:0">Find Matches →</button>
          </div>
        </div>
      </div>

      <div class="hero-stats" style="margin-top:32px">
        <div class="hero-stat"><strong>15+</strong><span>Banks &amp; HFCs</span></div>
        <div class="hero-stat"><strong>RBI KFS</strong><span>Standardized Costs</span></div>
        <div class="hero-stat"><strong>8.35%</strong><span>Starting Rate</span></div>
        <div class="hero-stat"><strong>Live</strong><span>Status Tracking</span></div>
      </div>
    </section>

    <!-- Verified Live Rate Bar -->
    <div style="max-width:1300px;margin:-10px auto 36px;padding:0 24px">
      <div style="background:#0f172a;color:#fff;border-radius:16px;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;box-shadow:var(--shadow-md)">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="background:#22c55e;width:10px;height:10px;border-radius:50%;display:inline-block;animation:pulse 2s infinite"></span>
          <span style="font-weight:800;font-size:0.9rem">Live Rate Tracker (Aug 2026):</span>
        </div>
        <div style="display:flex;gap:20px;overflow-x:auto;font-size:0.84rem;padding-bottom:4px">
          <div><strong style="color:#60a5fa">Union Bank:</strong> <span style="color:#4ade80;font-weight:800">8.35%</span></div>
          <div><strong style="color:#60a5fa">Bank of Baroda:</strong> <span style="color:#4ade80;font-weight:800">8.40%</span></div>
          <div><strong style="color:#60a5fa">PNB:</strong> <span style="color:#4ade80;font-weight:800">8.45%</span></div>
          <div><strong style="color:#60a5fa">SBI:</strong> <span style="color:#4ade80;font-weight:800">8.50%</span></div>
          <div><strong style="color:#60a5fa">LIC HFL:</strong> <span style="color:#4ade80;font-weight:800">8.50%</span></div>
          <div><strong style="color:#60a5fa">Bajaj Housing:</strong> <span style="color:#4ade80;font-weight:800">8.55%</span></div>
          <div><strong style="color:#60a5fa">HDFC Bank:</strong> <span style="color:#4ade80;font-weight:800">8.60%</span></div>
          <div><strong style="color:#60a5fa">ICICI Bank:</strong> <span style="color:#4ade80;font-weight:800">8.65%</span></div>
        </div>
        <button onclick="openCalc('lender-directory')" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:6px 14px;border-radius:20px;font-size:0.78rem;cursor:pointer;font-weight:700">View All 15+ →</button>
      </div>
    </div>

    <!-- Core Platform Features -->
    <div class="section-title">
      <h2>🏠 Home Loan Discovery Engine</h2>
      <p>Search, compare total loan costs, calculate FOIR eligibility &amp; track applications</p>
    </div>
    <div class="calc-grid">
      ${cc('search-wizard','🔍','7-Step Loan Wizard','Find lenders matching your profile & CIBIL')}
      ${cc('compare-lenders','⚖️','Total Loan Cost Compare','Compare rates, EMI & fees across banks')}
      ${cc('home-eligibility','🧮','Eligibility & FOIR Engine','Check exact borrowing limit based on income')}
      ${cc('home-loan','📊','EMI & Prepayment','Calculate EMI & tenure saved with prepayments')}
      ${cc('home-balance-transfer','🔄','Balance Transfer Savings','Switch lender & save lakhs in interest')}
      ${cc('lender-directory','🏢','Banks & HFCs Directory','View rates, docs & rules for 15+ lenders')}
      ${cc('track-application','📍','Live Status Tracker','Track your application ID stage-by-stage')}
      ${cc('ai-assistant','✨','AI Loan Assistant','Ask any home loan eligibility or doc query')}
    </div>

    <!-- Featured Lenders Preview -->
    <div class="section-title" style="margin-top:40px">
      <h2>🏛️ Top Banks &amp; Housing Finance Companies (HFCs)</h2>
      <p>Verified interest rates, processing fees &amp; documentation rules</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1300px;margin:0 auto 40px;padding:0 24px" id="homeLenderGrid">
      <div class="spinner"></div>
    </div>

    <!-- Local SEO Hubs -->
    <div class="section-title">
      <h2>📍 Property &amp; City Home Loan Hubs</h2>
      <p>Compare home loan options customized for NCR locations &amp; property types</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:1300px;margin:0 auto 40px;padding:0 24px">
      <a href="#" onclick="openCalc('city-noida');return false;" class="calc-card" style="text-align:left;padding:20px">
        <div style="font-size:1.4rem;margin-bottom:8px">🏙️ Noida &amp; Greater Noida</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">Resale, Noida Extension &amp; YEIDA Plot loans</div>
      </a>
      <a href="#" onclick="openCalc('city-gurgaon');return false;" class="calc-card" style="text-align:left;padding:20px">
        <div style="font-size:1.4rem;margin-bottom:8px">🌆 Gurgaon &amp; Delhi NCR</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">Luxury apartments, builder floors &amp; DLF projects</div>
      </a>
      <a href="#" onclick="openCalc('product-purchase');return false;" class="calc-card" style="text-align:left;padding:20px">
        <div style="font-size:1.4rem;margin-bottom:8px">🏡 Home Purchase Loan</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">Ready-to-move &amp; under-construction flats</div>
      </a>
      <a href="#" onclick="openCalc('product-construction');return false;" class="calc-card" style="text-align:left;padding:20px">
        <div style="font-size:1.4rem;margin-bottom:8px">🏗️ Plot + Construction</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">Plot purchase combined with house construction</div>
      </a>
    </div>

    <!-- Other Financial Tools & Market Ticker -->
    <div class="section-title">
      <h2>📈 Financial Calculators &amp; Live Markets</h2>
      <p>Mutual Funds SIP, FD, PPF and live stock market data</p>
    </div>
    <div class="calc-grid" style="padding-bottom:60px">
      ${cc('sip','📈','SIP Calculator','Systematic Investment Plan')}
      ${cc('fd','🏛️','FD Calculator','Fixed deposit maturity')}
      ${cc('ppf','🔐','PPF Calculator','Public Provident Fund')}
      ${cc('gold-rates','🥇','Gold Rates Today','24K, 22K live rates')}
      ${cc('market','📊','Market Dashboard','NSE/BSE live overview')}
    </div>
  `;

  // Fetch top lenders for homepage grid
  fetch('/api/lenders')
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById('homeLenderGrid');
      if (!grid || !data.lenders) return;
      grid.innerHTML = data.lenders.slice(0, 6).map(l => `
        <div class="market-card" style="display:flex;flex-direction:column;justify-space-between">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="background:${l.logoBg};color:#fff;font-weight:800;font-size:0.75rem;padding:4px 10px;border-radius:6px">${l.code}</span>
              <span style="font-size:0.75rem;font-weight:700;color:var(--accent);background:rgba(99,102,241,0.08);padding:3px 8px;border-radius:4px">${l.type}</span>
            </div>
            <h3 style="font-size:1.05rem;font-weight:800;color:var(--text-primary);margin-bottom:4px">${l.name}</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px">${l.tagline}</p>
            
            <div style="background:var(--bg-secondary);padding:12px;border-radius:10px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div>
                <span style="font-size:0.68rem;color:var(--text-muted);display:block;text-transform:uppercase;font-weight:700">Interest Rate</span>
                <strong style="font-size:1.1rem;color:#10b981;font-weight:900">${l.minRate}% - ${l.maxRate}%</strong>
              </div>
              <div>
                <span style="font-size:0.68rem;color:var(--text-muted);display:block;text-transform:uppercase;font-weight:700">Max LTV</span>
                <strong style="font-size:1.1rem;color:var(--text-primary);font-weight:900">${l.maxLTV}%</strong>
              </div>
            </div>

            <div style="font-size:0.76rem;color:var(--text-secondary);margin-bottom:14px">
              <strong>Processing Fee:</strong> ${l.processingFee}
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:auto">
            <button onclick="openCalc('lender-${l.id}');return false;" class="form-input" style="flex:1;text-align:center;font-weight:700;font-size:0.8rem;cursor:pointer">Details</button>
            <button onclick="openApplicationModal('${l.id}');return false;" class="btn-primary" style="flex:1;margin-top:0;font-size:0.8rem;padding:8px">Apply Now</button>
          </div>
        </div>
      `).join('');
    })
    .catch(() => {});
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
   HOME LOAN SEARCH & MATCHING WIZARD (7 STEPS)
   ══════════════════════════════════════════════════ */
let currentWizardStep = 1;
let wizardData = {
  goal: 'Home Purchase',
  income: 120000,
  existingEmi: 0,
  employment: 'Salaried',
  location: 'Noida',
  propertyValue: 6500000,
  loanRequired: 5000000,
  tenure: 20,
  creditScore: 750
};

function renderSearchWizard() {
  currentWizardStep = 1;
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:900px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">🔍 7-Step Smart Home Loan Matching Wizard</h1>
        <p style="color:var(--text-secondary)">Find the exact lenders &amp; HFCs suited for your profile, income, and CIBIL score.</p>
      </div>

      <div class="wizard-card" id="wizardCard">
        <div class="wizard-steps-bar">
          ${[1,2,3,4,5,6,7].map(s => `<div class="wizard-step-dot ${s === 1 ? 'active' : ''}" id="wsDot-${s}">${s}</div>`).join('')}
        </div>

        <div id="wizardStepContent">
          <!-- Step 1 -->
          ${renderWizardStep1()}
        </div>
      </div>

      <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:14px;padding:16px 20px;margin-top:28px;font-size:0.8rem;color:var(--text-secondary);display:flex;align-items:center;gap:12px">
        <span style="font-size:1.4rem">💡</span>
        <div><strong>RBI Transparency Compliant</strong>: All recommendations calculate all-in Total Loan Cost including processing fees, rate type (Floating/Fixed), and tenure limits.</div>
      </div>
    </div>
  `;
}

function renderWizardStep1() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:16px">Step 1: What is your primary loan goal?</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px">
      ${[
        ['Home Purchase','🏡','Buy a ready or under-construction property'],
        ['Plot + Construction','🏗️','Buy land & construct independent house'],
        ['Balance Transfer','🔄','Transfer existing loan to lower rate'],
        ['Home Extension / Renovation','🔨','Extend or renovate existing property'],
        ['Top-Up Loan','💰','Extra funds on existing home loan'],
        ['NRI Home Loan','✈️','Home loan for NRIs / PIOs']
      ].map(([g, icon, desc]) => `
        <div onclick="setWizardVal('goal','${g}');nextWizardStep(2)" 
          style="border:2px solid ${wizardData.goal === g ? 'var(--accent)' : 'var(--border)'};background:${wizardData.goal === g ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)'};border-radius:14px;padding:18px;cursor:pointer;transition:all 0.2s ease">
          <div style="font-size:1.5rem;margin-bottom:6px">${icon}</div>
          <div style="font-weight:800;color:var(--text-primary);margin-bottom:2px">${g}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">${desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWizardStep2() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Step 2: Monthly Income &amp; Existing EMIs</h2>
    <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:24px">This helps evaluate your FOIR (Fixed Obligation to Income Ratio).</p>
    
    <div class="form-group" style="margin-bottom:20px">
      <label style="font-weight:700">Net Monthly Salary / Business Income: <strong id="wzIncVal">₹${fmt(wizardData.income)}</strong></label>
      <input type="range" class="range-slider" min="25000" max="500000" step="5000" value="${wizardData.income}" oninput="wizardData.income=parseInt(this.value);document.getElementById('wzIncVal').textContent='₹'+fmt(this.value)">
    </div>

    <div class="form-group" style="margin-bottom:28px">
      <label style="font-weight:700">Existing Monthly Loan EMIs: <strong id="wzEmiVal">₹${fmt(wizardData.existingEmi)}</strong></label>
      <input type="range" class="range-slider" min="0" max="200000" step="2000" value="${wizardData.existingEmi}" oninput="wizardData.existingEmi=parseInt(this.value);document.getElementById('wzEmiVal').textContent='₹'+fmt(this.value)">
    </div>

    <div style="display:flex;justify-content:space-between">
      <button onclick="prevWizardStep(1)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
      <button onclick="nextWizardStep(3)" class="btn-primary" style="width:auto;padding:10px 32px;margin-top:0">Next: Employment →</button>
    </div>
  `;
}

function renderWizardStep3() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:16px">Step 3: What is your employment type?</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px">
      ${[
        ['Salaried','👔','MNC, Private Ltd, Govt, Public Sector Employee'],
        ['Self-Employed Professional','👨‍⚕️','Doctor, CA, Architect, Lawyer'],
        ['Business Owner','🏢','Proprietorship, Partnership, Private Company'],
        ['NRI / OCI','🌐','Working outside India']
      ].map(([emp, icon, desc]) => `
        <div onclick="wizardData.employment='${emp}';nextWizardStep(4)" 
          style="border:2px solid ${wizardData.employment === emp ? 'var(--accent)' : 'var(--border)'};background:${wizardData.employment === emp ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)'};border-radius:14px;padding:20px;cursor:pointer">
          <div style="font-size:1.5rem;margin-bottom:6px">${icon}</div>
          <div style="font-weight:800;color:var(--text-primary);margin-bottom:2px">${emp}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">${desc}</div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;justify-content:flex-start">
      <button onclick="prevWizardStep(2)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
    </div>
  `;
}

function renderWizardStep4() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:16px">Step 4: Property Location / City</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px">
      ${['Noida','Greater Noida','Ghaziabad','Delhi NCR','Gurgaon','Mumbai','Bengaluru','Pune','Other'].map(loc => `
        <button onclick="wizardData.location='${loc}';nextWizardStep(5)" class="form-input" 
          style="padding:14px;font-weight:800;border-color:${wizardData.location === loc ? 'var(--accent)' : 'var(--border)'};background:${wizardData.location === loc ? 'rgba(99,102,241,0.05)' : '#fff'}">
          📍 ${loc}
        </button>
      `).join('')}
    </div>
    <div style="display:flex;justify-content:flex-start">
      <button onclick="prevWizardStep(3)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
    </div>
  `;
}

function renderWizardStep5() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Step 5: Estimated Property Value</h2>
    <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:24px">Required to evaluate Max LTV (Loan to Value) rules.</p>
    
    <div class="form-group" style="margin-bottom:28px">
      <label style="font-weight:700">Property Market Cost: <strong id="wzPropVal">₹${inLakhsCr(wizardData.propertyValue)}</strong></label>
      <input type="range" class="range-slider" min="1500000" max="30000000" step="500000" value="${wizardData.propertyValue}" oninput="wizardData.propertyValue=parseInt(this.value);document.getElementById('wzPropVal').textContent='₹'+inLakhsCr(this.value)">
    </div>

    <div style="display:flex;justify-content:space-between">
      <button onclick="prevWizardStep(4)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
      <button onclick="nextWizardStep(6)" class="btn-primary" style="width:auto;padding:10px 32px;margin-top:0">Next: Loan Required →</button>
    </div>
  `;
}

function renderWizardStep6() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Step 6: Loan Amount Needed &amp; Tenure</h2>
    
    <div class="form-group" style="margin-bottom:20px">
      <label style="font-weight:700">Loan Amount: <strong id="wzLoanVal">₹${inLakhsCr(wizardData.loanRequired)}</strong></label>
      <input type="range" class="range-slider" min="1000000" max="25000000" step="500000" value="${wizardData.loanRequired}" oninput="wizardData.loanRequired=parseInt(this.value);document.getElementById('wzLoanVal').textContent='₹'+inLakhsCr(this.value)">
    </div>

    <div class="form-group" style="margin-bottom:28px">
      <label style="font-weight:700">Desired Tenure: <strong id="wzTenureVal">${wizardData.tenure} Years</strong></label>
      <input type="range" class="range-slider" min="5" max="30" step="1" value="${wizardData.tenure}" oninput="wizardData.tenure=parseInt(this.value);document.getElementById('wzTenureVal').textContent=this.value+' Years'">
    </div>

    <div style="display:flex;justify-content:space-between">
      <button onclick="prevWizardStep(5)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
      <button onclick="nextWizardStep(7)" class="btn-primary" style="width:auto;padding:10px 32px;margin-top:0">Next: Credit Score →</button>
    </div>
  `;
}

function renderWizardStep7() {
  return `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Step 7: What is your CIBIL / Credit Score range?</h2>
    <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:24px">Higher CIBIL score unlocks lower interest rates (up to 0.50% interest concession).</p>

    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px">
      ${[
        [775,'🌟 Excellent (775+)','Eligible for lowest tier interest rates'],
        [740,'✅ Good (720 - 774)','High approval probability across all lenders'],
        [680,'🟡 Average (680 - 719)','Standard rates; HFCs strongly recommended'],
        [620,'🔴 Fair / Low (< 680)','Affordable HFCs (PNB Housing, Aadhar, Home First)']
      ].map(([sc, label, desc]) => `
        <div onclick="wizardData.creditScore=${sc};submitWizardResults()" 
          style="border:2px solid ${wizardData.creditScore === sc ? 'var(--accent)' : 'var(--border)'};background:${wizardData.creditScore === sc ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)'};border-radius:14px;padding:18px;cursor:pointer">
          <div style="font-weight:800;font-size:1.05rem;color:var(--text-primary);margin-bottom:4px">${label}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">${desc}</div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;justify-content:flex-start">
      <button onclick="prevWizardStep(6)" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">← Back</button>
    </div>
  `;
}

function setWizardVal(k, v) { wizardData[k] = v; }
function nextWizardStep(s) {
  currentWizardStep = s;
  for(let i=1;i<=7;i++) {
    const d = document.getElementById(`wsDot-${i}`);
    if (d) {
      d.className = i === s ? 'wizard-step-dot active' : i < s ? 'wizard-step-dot done' : 'wizard-step-dot';
    }
  }
  const el = document.getElementById('wizardStepContent');
  if (el) {
    if (s === 1) el.innerHTML = renderWizardStep1();
    else if (s === 2) el.innerHTML = renderWizardStep2();
    else if (s === 3) el.innerHTML = renderWizardStep3();
    else if (s === 4) el.innerHTML = renderWizardStep4();
    else if (s === 5) el.innerHTML = renderWizardStep5();
    else if (s === 6) el.innerHTML = renderWizardStep6();
    else if (s === 7) el.innerHTML = renderWizardStep7();
  }
}
function prevWizardStep(s) { nextWizardStep(s); }

function submitWizardResults() {
  const el = document.getElementById('wizardStepContent');
  if (el) el.innerHTML = `<div style="text-align:center;padding:40px"><div class="spinner"></div><p style="margin-top:12px;font-weight:700">Matching your profile with 15+ Banks &amp; HFCs…</p></div>`;

  fetch('/api/loan/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wizardData)
  })
  .then(r => r.json())
  .then(res => {
    if (!res.ok) return;
    renderWizardMatches(res);
  })
  .catch(() => {
    el.innerHTML = `<p style="color:var(--red)">Failed to calculate matches. Please try again.</p>`;
  });
}

function renderWizardMatches(res) {
  const el = document.getElementById('wizardStepContent');
  if (!el) return;
  const s = res.inputSummary;

  el.innerHTML = `
    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:14px;padding:16px 20px;margin-bottom:24px">
      <h3 style="font-size:1.1rem;font-weight:800;color:#059669;margin-bottom:4px">🎯 Top Matches Found for Your Profile</h3>
      <div style="font-size:0.82rem;color:var(--text-secondary)">
        Loan Amount: <strong>₹${inLakhsCr(s.loanRequired)}</strong> | Net Monthly Income: <strong>₹${fmt(s.netIncome)}</strong> | Tenure: <strong>${s.tenure} Yrs</strong> | Est. LTV: <strong>${s.ltvPct}%</strong>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:18px;margin-bottom:28px">
      ${res.matches.map(m => `
        <div style="border:1px solid var(--border);border-radius:16px;padding:22px;background:#fff;box-shadow:var(--shadow-sm);display:grid;grid-template-columns:2fr 1fr 1fr;gap:20px;align-items:center">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <span style="background:${m.lender.logoBg};color:#fff;font-weight:800;font-size:0.75rem;padding:3px 8px;border-radius:4px">${m.lender.code}</span>
              <h3 style="font-size:1.1rem;font-weight:800;color:var(--text-primary);margin:0">${m.lender.name}</h3>
              <span class="match-score-badge ${m.matchScore >= 90 ? 'high' : 'med'}">${m.matchScore}% Match</span>
            </div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px">${m.matchReason}</p>
            <div style="font-size:0.75rem;color:var(--text-secondary)">
              Processing Fee: <strong>${m.lender.processingFee}</strong> | Verified Rate: <strong>${m.lender.minRate}%</strong>
            </div>
          </div>

          <div class="total-cost-badge">
            <div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8">Estimated EMI</div>
            <span>₹${fmt(m.estEmi)}</span>
            <div style="font-size:0.68rem;color:#cbd5e1;margin-top:2px">Total Cost: ₹${inLakhsCr(m.totalCostScore)}</div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <button onclick="openApplicationModal('${m.lender.id}')" class="btn-primary" style="margin:0;font-size:0.85rem;padding:10px">Apply Now</button>
            <button onclick="openCalc('lender-${m.lender.id}')" class="form-input" style="font-weight:700;font-size:0.8rem;text-align:center">View Rates</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center">
      <button onclick="renderSearchWizard()" class="form-input" style="width:auto;padding:10px 24px;font-weight:700">🔄 Restart Wizard</button>
    </div>
  `;
}

/* ══════════════════════════════════════════════════
   LENDER COMPARISON ENGINE (TOTAL LOAN COST SCORE)
   ══════════════════════════════════════════════════ */
function renderCompareLenders() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:1250px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">⚖️ Side-by-Side Home Loan Comparison Engine</h1>
        <p style="color:var(--text-secondary)">Ranks lenders using the <strong>Total Loan Cost Score</strong> (Interest + Processing Fees + Mandatory Charges)</p>
      </div>

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:32px;box-shadow:var(--shadow-sm)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:end">
          <div>
            <label style="font-weight:700;font-size:0.82rem;display:block;margin-bottom:6px">Sample Loan Amount: <strong id="cmpAmtLbl">₹50 Lakh</strong></label>
            <input type="range" class="range-slider" min="1000000" max="20000000" step="500000" value="5000000" oninput="document.getElementById('cmpAmtLbl').textContent='₹'+inLakhsCr(this.value);updateCompareTable(parseInt(this.value),parseInt(document.getElementById('cmpTenure').value))" id="cmpAmt">
          </div>
          <div>
            <label style="font-weight:700;font-size:0.82rem;display:block;margin-bottom:6px">Loan Tenure: <strong id="cmpTenLbl">20 Years</strong></label>
            <input type="range" class="range-slider" min="5" max="30" step="1" value="20" oninput="document.getElementById('cmpTenLbl').textContent=this.value+' Years';updateCompareTable(parseInt(document.getElementById('cmpAmt').value),parseInt(this.value))" id="cmpTenure">
          </div>
          <div>
            <button onclick="updateCompareTable(parseInt(document.getElementById('cmpAmt').value),parseInt(document.getElementById('cmpTenure').value))" class="btn-primary" style="margin:0;height:44px;font-weight:800">Recalculate Scores →</button>
          </div>
        </div>
      </div>

      <div style="overflow-x:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md)" id="cmpTableContainer">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  updateCompareTable(5000000, 20);
}

function updateCompareTable(loanAmt, tenureYrs) {
  fetch('/api/lenders')
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById('cmpTableContainer');
      if (!container || !data.lenders) return;

      const top6 = data.lenders.slice(0, 6);
      container.innerHTML = `
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:200px">Parameter</th>
              ${top6.map(l => `<th style="text-align:center"><span style="background:${l.logoBg};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem">${l.code}</span><br>${l.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Min Rate (Floating)</strong></td>
              ${top6.map(l => `<td style="text-align:center;color:#10b981;font-weight:900;font-size:1rem">${l.minRate}%</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Estimated Monthly EMI</strong></td>
              ${top6.map(l => {
                const emi = calcEMI(loanAmt, l.minRate, tenureYrs * 12);
                return `<td style="text-align:center;font-weight:800;color:var(--text-primary)">₹${fmt(emi)}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td><strong>Processing Fee</strong></td>
              ${top6.map(l => `<td style="text-align:center;font-size:0.78rem">${l.processingFee}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Total Interest Payable</strong></td>
              ${top6.map(l => {
                const emi = calcEMI(loanAmt, l.minRate, tenureYrs * 12);
                const totInt = (emi * tenureYrs * 12) - loanAmt;
                return `<td style="text-align:center;font-weight:700">₹${inLakhsCr(totInt)}</td>`;
              }).join('')}
            </tr>
            <tr style="background:rgba(99,102,241,0.04)">
              <td><strong style="color:var(--accent)">Total Loan Cost Score</strong><br><span style="font-size:0.68rem;color:var(--text-muted)">Interest + Processing Fee</span></td>
              ${top6.map(l => {
                const emi = calcEMI(loanAmt, l.minRate, tenureYrs * 12);
                const totInt = (emi * tenureYrs * 12) - loanAmt;
                const pFee = Math.min(l.maxProcessingFee || 15000, loanAmt * (l.processingFeePct / 100));
                const totalCost = totInt + pFee;
                return `<td style="text-align:center;font-weight:900;font-size:1.05rem;color:var(--accent)">₹${inLakhsCr(totalCost)}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td><strong>Max LTV (Loan-to-Value)</strong></td>
              ${top6.map(l => `<td style="text-align:center;font-weight:700">${l.maxLTV}%</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Prepayment Penalty</strong></td>
              ${top6.map(l => `<td style="text-align:center;font-size:0.75rem">${l.prepaymentFee}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Action</strong></td>
              ${top6.map(l => `<td style="text-align:center"><button onclick="openApplicationModal('${l.id}')" class="btn-primary" style="margin:0;font-size:0.78rem;padding:6px 14px">Apply Now</button></td>`).join('')}
            </tr>
          </tbody>
        </table>
      `;
    })
    .catch(() => {});
}

/* ══════════════════════════════════════════════════
   HOME LOAN ELIGIBILITY & FOIR ENGINE
   ══════════════════════════════════════════════════ */
function renderHomeEligibility() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:1000px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">🧮 Home Loan Eligibility &amp; FOIR Calculator</h1>
        <p style="color:var(--text-secondary)">Calculates maximum borrowing capacity based on Indian underwriting FOIR (Fixed Obligation to Income Ratio) limits.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div class="wizard-card" style="max-width:none">
          <h3 style="font-weight:800;font-size:1.1rem;margin-bottom:20px">Income &amp; Obligations</h3>
          
          <div class="form-group">
            <label style="font-weight:700">Gross Monthly Income: <strong id="elIncLbl">₹1,20,000</strong></label>
            <input type="range" class="range-slider" min="25000" max="500000" step="5000" value="120000" id="elIncome" oninput="document.getElementById('elIncLbl').textContent='₹'+fmt(this.value);calcEligibility()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Co-Applicant Monthly Income: <strong id="elCoIncLbl">₹0</strong></label>
            <input type="range" class="range-slider" min="0" max="300000" step="5000" value="0" id="elCoIncome" oninput="document.getElementById('elCoIncLbl').textContent='₹'+fmt(this.value);calcEligibility()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Existing Monthly EMIs: <strong id="elEmiLbl">₹10,000</strong></label>
            <input type="range" class="range-slider" min="0" max="150000" step="2000" value="10000" id="elExistEmi" oninput="document.getElementById('elEmiLbl').textContent='₹'+fmt(this.value);calcEligibility()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Loan Tenure: <strong id="elTenLbl">20 Years</strong></label>
            <input type="range" class="range-slider" min="5" max="30" step="1" value="20" id="elTenure" oninput="document.getElementById('elTenLbl').textContent=this.value+' Years';calcEligibility()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Interest Rate: <strong id="elRateLbl">8.5%</strong></label>
            <input type="range" class="range-slider" min="8.0" max="12.0" step="0.1" value="8.5" id="elRate" oninput="document.getElementById('elRateLbl').textContent=this.value+'%';calcEligibility()">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px">
          <div style="background:linear-gradient(135deg,#0f172a,#1e1b4b);color:#fff;border-radius:20px;padding:28px;box-shadow:var(--shadow-md);text-align:center">
            <div style="font-size:0.8rem;text-transform:uppercase;color:#94a3b8;font-weight:700">Estimated Max Home Loan Eligibility</div>
            <div style="font-size:2.5rem;font-weight:900;color:#38bdf8;margin:8px 0" id="elResAmount">₹0</div>
            <div style="font-size:0.85rem;color:#cbd5e1">Max Monthly EMI Capacity: <strong id="elResEmi" style="color:#4ade80">₹0</strong></div>
            <div style="margin-top:14px;background:rgba(255,255,255,0.08);padding:8px 14px;border-radius:20px;font-size:0.75rem;display:inline-block">
              FOIR Limit Applied: <strong id="elFoirPct">55%</strong>
            </div>
          </div>

          <div class="wizard-card" style="max-width:none">
            <h4 style="font-weight:800;margin-bottom:12px">Underwriting Breakdown</h4>
            <div style="font-size:0.83rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between"><span>Total Gross Income:</span><strong id="elTotIncome">₹0</strong></div>
              <div style="display:flex;justify-content:space-between"><span>Max Allowed Monthly EMI (FOIR):</span><strong id="elMaxAllowedEmi">₹0</strong></div>
              <div style="display:flex;justify-content:space-between"><span>Net Available Monthly EMI:</span><strong id="elNetAvailableEmi" style="color:#10b981">₹0</strong></div>
            </div>
            
            <button onclick="openApplicationModal()" class="btn-primary" style="margin-top:20px">Check Direct Lender Approvals →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  calcEligibility();
}

function calcEligibility() {
  const inc = parseFloat(document.getElementById('elIncome')?.value || 120000);
  const coInc = parseFloat(document.getElementById('elCoIncome')?.value || 0);
  const existEmi = parseFloat(document.getElementById('elExistEmi')?.value || 10000);
  const tenureYrs = parseFloat(document.getElementById('elTenure')?.value || 20);
  const annualRate = parseFloat(document.getElementById('elRate')?.value || 8.5);

  const totInc = inc + coInc;
  let foir = 0.50;
  if (totInc >= 150000) foir = 0.60;
  else if (totInc >= 80000) foir = 0.55;

  const maxAllowedEmi = totInc * foir;
  const netAvailEmi = Math.max(0, maxAllowedEmi - existEmi);

  // Present Value of Loan given EMI
  const r = annualRate / 12 / 100;
  const n = tenureYrs * 12;
  const maxLoan = r > 0 ? (netAvailEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : netAvailEmi * n;

  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('elResAmount', '₹' + inLakhsCr(Math.round(maxLoan)));
  set('elResEmi', '₹' + fmt(Math.round(netAvailEmi)));
  set('elFoirPct', Math.round(foir * 100) + '%');
  set('elTotIncome', '₹' + fmt(totInc));
  set('elMaxAllowedEmi', '₹' + fmt(Math.round(maxAllowedEmi)));
  set('elNetAvailableEmi', '₹' + fmt(Math.round(netAvailEmi)));
}

/* ══════════════════════════════════════════════════
   ADVANCED EMI & PREPAYMENT SAVINGS CALCULATOR
   ══════════════════════════════════════════════════ */
function renderHomeLoan() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:1100px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">📊 Home Loan EMI &amp; Prepayment Calculator</h1>
        <p style="color:var(--text-secondary)">Calculate monthly EMI, amortization table, and see how annual prepayments save lakhs in interest.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px">
        <div class="wizard-card" style="max-width:none">
          <h3 style="font-weight:800;font-size:1.1rem;margin-bottom:20px">Loan Parameters</h3>
          
          <div class="form-group">
            <label style="font-weight:700">Loan Amount: <strong id="emAmtLbl">₹50 Lakh</strong></label>
            <input type="range" class="range-slider" min="500000" max="25000000" step="250000" value="5000000" id="emAmount" oninput="document.getElementById('emAmtLbl').textContent='₹'+inLakhsCr(this.value);calcEmiAndPrepay()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Interest Rate: <strong id="emRateLbl">8.5%</strong></label>
            <input type="range" class="range-slider" min="7.5" max="14.0" step="0.1" value="8.5" id="emRate" oninput="document.getElementById('emRateLbl').textContent=this.value+'%';calcEmiAndPrepay()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Tenure: <strong id="emTenLbl">20 Years</strong></label>
            <input type="range" class="range-slider" min="5" max="30" step="1" value="20" id="emTenure" oninput="document.getElementById('emTenLbl').textContent=this.value+' Years';calcEmiAndPrepay()">
          </div>

          <div class="form-group" style="background:rgba(99,102,241,0.05);padding:14px;border-radius:12px;border:1px solid rgba(99,102,241,0.15)">
            <label style="font-weight:800;color:var(--accent)">Annual Prepayment Amount: <strong id="emPrepayLbl">₹1,00,000</strong></label>
            <input type="range" class="range-slider" min="0" max="500000" step="10000" value="100000" id="emPrepay" oninput="document.getElementById('emPrepayLbl').textContent='₹'+fmt(this.value);calcEmiAndPrepay()">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px">
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:var(--shadow-sm)">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Monthly EMI</div>
            <div style="font-size:2.2rem;font-weight:900;color:var(--text-primary);margin:4px 0" id="emResEmi">₹0</div>
            <div style="font-size:0.83rem;color:var(--text-secondary);display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)">
              <span>Total Interest (Standard):</span><strong id="emResTotInt">₹0</strong>
            </div>
          </div>

          <div style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:20px;padding:24px;box-shadow:var(--shadow-md)">
            <div style="font-size:0.8rem;text-transform:uppercase;font-weight:700">💡 Prepayment Savings Impact</div>
            <div style="font-size:1.8rem;font-weight:900;margin:6px 0" id="emResSavedInt">₹0 Saved!</div>
            <div style="font-size:0.85rem" id="emResClosesEarly">Loan Closes 0 Years Earlier</div>
          </div>
        </div>
      </div>

      <!-- Amortization Table -->
      <div class="gold-table-section">
        <div class="gold-table-header">📅 Amortization Schedule (Yearly Principal vs Interest Paid)</div>
        <table class="gold-table">
          <thead>
            <tr><th>Year</th><th>Opening Principal</th><th>EMI Paid (Year)</th><th>Interest Paid</th><th>Principal Paid</th><th>Closing Balance</th></tr>
          </thead>
          <tbody id="emAmortTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  calcEmiAndPrepay();
}

function calcEmiAndPrepay() {
  const P = parseFloat(document.getElementById('emAmount')?.value || 5000000);
  const R = parseFloat(document.getElementById('emRate')?.value || 8.5);
  const Y = parseFloat(document.getElementById('emTenure')?.value || 20);
  const prepayAnnual = parseFloat(document.getElementById('emPrepay')?.value || 100000);

  const months = Y * 12;
  const emi = calcEMI(P, R, months);
  const standardTotInterest = (emi * months) - P;

  // Prepayment Simulation
  const r = R / 12 / 100;
  let balance = P;
  let prepayTotInterest = 0;
  let mCount = 0;

  while (balance > 0 && mCount < months) {
    mCount++;
    const interestMonth = balance * r;
    let principalMonth = emi - interestMonth;
    if (principalMonth > balance) principalMonth = balance;

    balance -= principalMonth;
    prepayTotInterest += interestMonth;

    if (mCount % 12 === 0 && balance > 0 && prepayAnnual > 0) {
      const actualPrepay = Math.min(balance, prepayAnnual);
      balance -= actualPrepay;
    }
  }

  const interestSaved = Math.max(0, standardTotInterest - prepayTotInterest);
  const yearsSaved = Math.max(0, Y - (mCount / 12));

  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('emResEmi', '₹' + fmt(Math.round(emi)));
  set('emResTotInt', '₹' + inLakhsCr(Math.round(standardTotInterest)));
  set('emResSavedInt', '₹' + inLakhsCr(Math.round(interestSaved)) + ' Saved!');
  set('emResClosesEarly', `Loan closes ${yearsSaved.toFixed(1)} Years earlier (${mCount} months)`);

  // Render Amortization Table
  const tbody = document.getElementById('emAmortTbody');
  if (tbody) {
    let bal = P;
    let rowsHTML = '';
    for (let yr = 1; yr <= Math.min(Y, 30); yr++) {
      if (bal <= 0) break;
      let yrInt = 0, yrPrinc = 0;
      const openBal = bal;

      for (let m = 1; m <= 12; m++) {
        if (bal <= 0) break;
        const iM = bal * r;
        let pM = emi - iM;
        if (pM > bal) pM = bal;
        bal -= pM;
        yrInt += iM;
        yrPrinc += pM;
      }

      rowsHTML += `
        <tr>
          <td>Year ${yr}</td>
          <td class="price">₹${fmt(Math.round(openBal))}</td>
          <td class="price">₹${fmt(Math.round(yrInt + yrPrinc))}</td>
          <td style="color:#ef4444;font-weight:700">₹${fmt(Math.round(yrInt))}</td>
          <td style="color:#10b981;font-weight:700">₹${fmt(Math.round(yrPrinc))}</td>
          <td class="price">₹${fmt(Math.max(0, Math.round(bal)))}</td>
        </tr>
      `;
    }
    tbody.innerHTML = rowsHTML;
  }
}

/* ══════════════════════════════════════════════════
   HOME LOAN BALANCE TRANSFER (BT) CALCULATOR
   ══════════════════════════════════════════════════ */
function renderBalanceTransfer() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:1000px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">🔄 Home Loan Balance Transfer Calculator</h1>
        <p style="color:var(--text-secondary)">Calculate potential monthly EMI and net interest savings by switching to a lower interest rate lender.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div class="wizard-card" style="max-width:none">
          <h3 style="font-weight:800;font-size:1.1rem;margin-bottom:20px">Current vs New Offer</h3>
          
          <div class="form-group">
            <label style="font-weight:700">Outstanding Loan Balance: <strong id="btAmtLbl">₹40 Lakh</strong></label>
            <input type="range" class="range-slider" min="500000" max="20000000" step="250000" value="4000000" id="btAmount" oninput="document.getElementById('btAmtLbl').textContent='₹'+inLakhsCr(this.value);calcBT()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Current Interest Rate: <strong id="btCurrRateLbl">9.2%</strong></label>
            <input type="range" class="range-slider" min="8.5" max="14.0" step="0.1" value="9.2" id="btCurrRate" oninput="document.getElementById('btCurrRateLbl').textContent=this.value+'%';calcBT()">
          </div>

          <div class="form-group">
            <label style="font-weight:700">Remaining Tenure: <strong id="btTenLbl">15 Years</strong></label>
            <input type="range" class="range-slider" min="3" max="30" step="1" value="15" id="btTenure" oninput="document.getElementById('btTenLbl').textContent=this.value+' Years';calcBT()">
          </div>

          <div class="form-group" style="background:rgba(16,185,129,0.05);padding:14px;border-radius:12px;border:1px solid rgba(16,185,129,0.2)">
            <label style="font-weight:800;color:#059669">New Offer Rate: <strong id="btNewRateLbl">8.4%</strong></label>
            <input type="range" class="range-slider" min="8.0" max="11.0" step="0.1" value="8.4" id="btNewRate" oninput="document.getElementById('btNewRateLbl').textContent=this.value+'%';calcBT()">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px">
          <div style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:20px;padding:28px;box-shadow:var(--shadow-md);text-align:center">
            <div style="font-size:0.8rem;text-transform:uppercase;font-weight:700">Net Estimated Interest Savings</div>
            <div style="font-size:2.4rem;font-weight:900;margin:6px 0" id="btNetSavings">₹0</div>
            <div style="font-size:0.85rem">Monthly EMI Reduced by: <strong id="btEmiSavings" style="color:#fef08a">₹0/mo</strong></div>
          </div>

          <div class="wizard-card" style="max-width:none">
            <h4 style="font-weight:800;margin-bottom:12px">Switching Cost &amp; Net Benefit</h4>
            <div style="font-size:0.83rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between"><span>Current EMI:</span><strong id="btCurrEmi">₹0</strong></div>
              <div style="display:flex;justify-content:space-between"><span>New EMI:</span><strong id="btNewEmi" style="color:#10b981">₹0</strong></div>
              <div style="display:flex;justify-content:space-between"><span>Estimated Transfer Charges (MODT + Fee):</span><strong id="btTransferFee">₹15,000</strong></div>
            </div>
            
            <button onclick="openApplicationModal()" class="btn-primary" style="margin-top:20px">Check Balance Transfer Offers →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  calcBT();
}

function calcBT() {
  const P = parseFloat(document.getElementById('btAmount')?.value || 4000000);
  const currR = parseFloat(document.getElementById('btCurrRate')?.value || 9.2);
  const newR = parseFloat(document.getElementById('btNewRate')?.value || 8.4);
  const Y = parseFloat(document.getElementById('btTenure')?.value || 15);

  const months = Y * 12;
  const currEmi = calcEMI(P, currR, months);
  const newEmi = calcEMI(P, newR, months);

  const currTotInt = (currEmi * months) - P;
  const newTotInt = (newEmi * months) - P;
  const rawInterestSaved = currTotInt - newTotInt;
  const estTransferCost = Math.min(25000, Math.max(10000, P * 0.0035));
  const netSaved = Math.max(0, rawInterestSaved - estTransferCost);
  const emiSaved = Math.max(0, currEmi - newEmi);

  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('btNetSavings', '₹' + inLakhsCr(Math.round(netSaved)));
  set('btEmiSavings', '₹' + fmt(Math.round(emiSaved)) + '/mo');
  set('btCurrEmi', '₹' + fmt(Math.round(currEmi)));
  set('btNewEmi', '₹' + fmt(Math.round(newEmi)));
  set('btTransferFee', '₹' + fmt(Math.round(estTransferCost)));
}

/* ══════════════════════════════════════════════════
   BANKS & HFCS DIRECTORY & DETAILS
   ══════════════════════════════════════════════════ */
function renderLenderDirectory() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:1250px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">🏢 Banks &amp; Housing Finance Companies (HFCs) Directory</h1>
        <p style="color:var(--text-secondary)">Verified rate cards, documentation checklists, and eligibility thresholds across India.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px" id="lenderDirGrid">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  fetch('/api/lenders')
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById('lenderDirGrid');
      if (!grid || !data.lenders) return;
      grid.innerHTML = data.lenders.map(l => `
        <div class="market-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="background:${l.logoBg};color:#fff;font-weight:800;font-size:0.75rem;padding:4px 10px;border-radius:6px">${l.code}</span>
              <span style="font-size:0.75rem;font-weight:700;color:var(--accent);background:rgba(99,102,241,0.08);padding:3px 8px;border-radius:4px">${l.type}</span>
            </div>
            <h3 style="font-size:1.1rem;font-weight:800;color:var(--text-primary);margin-bottom:4px">${l.name}</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px">${l.tagline}</p>

            <div style="background:var(--bg-secondary);padding:12px;border-radius:10px;margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
                <span style="color:var(--text-muted)">Starting Rate:</span>
                <strong style="color:#10b981;font-weight:900">${l.minRate}%</strong>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.85rem">
                <span style="color:var(--text-muted)">Max Tenure:</span>
                <strong style="color:var(--text-primary);font-weight:800">${l.maxTenure} Yrs</strong>
              </div>
            </div>

            <div style="font-size:0.76rem;color:var(--text-secondary);margin-bottom:14px">
              <strong>Docs Needed:</strong> ${l.docsRequired.slice(0, 2).join(', ')}
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:auto">
            <button onclick="openCalc('lender-${l.id}')" class="form-input" style="flex:1;text-align:center;font-weight:700;font-size:0.8rem">Rate Card</button>
            <button onclick="openApplicationModal('${l.id}')" class="btn-primary" style="flex:1;margin:0;font-size:0.8rem;padding:8px">Apply Now</button>
          </div>
        </div>
      `).join('');
    });
}

function renderLenderDetail(lenderId) {
  fetch(`/api/lenders/${lenderId}`)
    .then(r => r.json())
    .then(data => {
      const l = data.lender;
      if (!l) return;

      document.getElementById('appMain').innerHTML = `
        <div style="max-width:1000px;margin:32px auto 80px;padding:0 24px">
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:32px;box-shadow:var(--shadow-md);margin-bottom:28px">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <span style="background:${l.logoBg};color:#fff;font-weight:900;font-size:1.2rem;padding:8px 18px;border-radius:10px">${l.code}</span>
              <div>
                <h1 style="font-size:1.8rem;font-weight:900;margin:0;color:var(--text-primary)">${l.name} Home Loan</h1>
                <p style="color:var(--text-muted);font-size:0.85rem;margin:2px 0 0">${l.tagline}</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;background:var(--bg-secondary);padding:20px;border-radius:14px;margin-bottom:24px">
              <div><span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Interest Rate Range</span><div style="font-size:1.3rem;font-weight:900;color:#10b981">${l.minRate}% - ${l.maxRate}%</div></div>
              <div><span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Rate Type</span><div style="font-size:0.85rem;font-weight:800">${l.rateType}</div></div>
              <div><span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Max Tenure</span><div style="font-size:1.3rem;font-weight:900">${l.maxTenure} Years</div></div>
              <div><span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Max LTV</span><div style="font-size:1.3rem;font-weight:900">${l.maxLTV}%</div></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
              <div>
                <h4 style="font-weight:800;margin-bottom:8px">Key Features &amp; Highlights</h4>
                <ul style="font-size:0.84rem;color:var(--text-secondary);padding-left:18px;line-height:1.6">
                  ${l.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 style="font-weight:800;margin-bottom:8px">Required Documents</h4>
                <ul style="font-size:0.84rem;color:var(--text-secondary);padding-left:18px;line-height:1.6">
                  ${l.docsRequired.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            </div>

            <button onclick="openApplicationModal('${l.id}')" class="btn-primary" style="width:100%;height:48px;font-size:1rem;font-weight:800">Apply for ${l.name} Home Loan →</button>
          </div>
        </div>
      `;
    });
}

/* ══════════════════════════════════════════════════
   SEO PRODUCT & CITY HUB PAGES
   ══════════════════════════════════════════════════ */
function renderProductPage(slug) {
  const titles = {
    purchase: 'Home Purchase Loan',
    construction: 'Plot & House Construction Loan',
    nri: 'NRI Home Loan'
  };
  const title = titles[slug] || 'Home Loan Product';

  document.getElementById('appMain').innerHTML = `
    <div style="max-width:900px;margin:32px auto 80px;padding:0 24px">
      <h1 style="font-size:2rem;font-weight:900;margin-bottom:12px">🏡 ${title}</h1>
      <p style="color:var(--text-secondary);margin-bottom:28px">Complete guidelines, interest rates, eligibility criteria &amp; application process in India.</p>
      <div class="wizard-card" style="max-width:none">
        <h3 style="font-weight:800;margin-bottom:12px">Overview</h3>
        <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
          Compare leading banks offering ${title} options with floating interest rates starting from 8.35%. Includes step-by-step document verification and legal title clearance guidance.
        </p>
        <button onclick="openCalc('search-wizard')" class="btn-primary">Find Matching Lenders →</button>
      </div>
    </div>
  `;
}

function renderLocalSEOPage(slug) {
  const cities = {
    noida: 'Noida & Greater Noida Home Loans',
    gurgaon: 'Gurgaon & Delhi NCR Home Loans'
  };
  const title = cities[slug] || 'NCR Home Loans';

  document.getElementById('appMain').innerHTML = `
    <div style="max-width:900px;margin:32px auto 80px;padding:0 24px">
      <h1 style="font-size:2rem;font-weight:900;margin-bottom:12px">📍 ${title}</h1>
      <p style="color:var(--text-secondary);margin-bottom:28px">Local home loan processing, builder tie-ups &amp; property approval guidelines in NCR.</p>
      <div class="wizard-card" style="max-width:none">
        <h3 style="font-weight:800;margin-bottom:12px">NCR Builder Tie-Ups &amp; Approvals</h3>
        <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
          Explore banks with instant pre-approved projects across Noida Sector 150, Noida Extension, YEIDA authority plots, DLF Phase 5 Gurgaon, and Dwarka Expressway.
        </p>
        <button onclick="openApplicationModal()" class="btn-primary">Check Local Loan Eligibility →</button>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════
   CUSTOMER APPLICATION TRACKING DASHBOARD
   ══════════════════════════════════════════════════ */
function renderTrackApplication() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:800px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">📍 Track Home Loan Application</h1>
        <p style="color:var(--text-secondary)">Enter your Application ID (e.g. <strong>HL-2026-8942</strong>) to view real-time stage progress.</p>
      </div>

      <div class="wizard-card" style="margin-bottom:28px">
        <div style="display:flex;gap:12px">
          <input type="text" class="form-input" id="trackAppId" placeholder="e.g. HL-2026-8942" value="HL-2026-8942" style="font-weight:800;font-size:1.05rem">
          <button onclick="fetchAppStatus()" class="btn-primary" style="margin:0;width:auto;padding:12px 28px;font-weight:800">Track Status</button>
        </div>
      </div>

      <div id="trackResult"></div>
    </div>
  `;

  fetchAppStatus();
}

function fetchAppStatus() {
  const input = document.getElementById('trackAppId');
  const appId = input ? input.value.trim() : 'HL-2026-8942';
  const container = document.getElementById('trackResult');
  if (!container || !appId) return;

  container.innerHTML = `<div class="spinner"></div>`;

  fetch(`/api/lead/track/${appId}`)
    .then(r => r.json())
    .then(data => {
      if (!data.ok) {
        container.innerHTML = `<div class="wizard-card" style="text-align:center;color:var(--red)"><p>⚠️ ${data.error}</p></div>`;
        return;
      }

      const app = data.app;
      const stages = data.stages;

      container.innerHTML = `
        <div class="wizard-card">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:20px">
            <div>
              <span style="font-size:0.75rem;color:var(--text-muted);font-weight:700">APPLICATION ID</span>
              <h3 style="font-size:1.3rem;font-weight:900;color:var(--accent);margin:2px 0 0">${app.id}</h3>
            </div>
            <div style="text-align:right">
              <span style="background:rgba(99,102,241,0.1);color:var(--accent);font-weight:800;font-size:0.8rem;padding:4px 12px;border-radius:20px">${app.lenderName}</span>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Applicant: ${app.name} (${app.city})</div>
            </div>
          </div>

          <div style="background:var(--bg-secondary);padding:14px 18px;border-radius:12px;margin-bottom:24px;font-size:0.85rem">
            <strong>Current Stage:</strong> <span style="color:#10b981;font-weight:800">${app.statusText}</span><br>
            <span style="font-size:0.78rem;color:var(--text-muted)">Latest Remark: ${app.notes}</span>
          </div>

          <h4 style="font-weight:800;margin-bottom:16px">Application Timeline</h4>
          <div class="timeline-tracker">
            ${stages.map(s => `
              <div class="timeline-item ${s.step === app.statusStep ? 'active' : s.step < app.statusStep ? 'done' : ''}">
                <div class="timeline-title">${s.label}</div>
                <div class="timeline-desc">${s.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })
    .catch(() => {
      container.innerHTML = `<div class="wizard-card" style="text-align:center;color:var(--red)"><p>Error loading application status.</p></div>`;
    });
}

/* ══════════════════════════════════════════════════
   AI HOME LOAN ASSISTANT
   ══════════════════════════════════════════════════ */
function renderAIAssistant() {
  document.getElementById('appMain').innerHTML = `
    <div style="max-width:900px;margin:32px auto 80px;padding:0 24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="font-size:2rem;font-weight:900;margin-bottom:8px">✨ AI Home Loan Assistant</h1>
        <p style="color:var(--text-secondary)">Ask questions about Indian home loan eligibility, document checklists, and RBI rules.</p>
      </div>

      <div class="ai-chat-box">
        <div class="ai-chat-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:1.3rem">🤖</span>
            <div>
              <strong style="font-size:0.95rem">FinCalc AI Assistant</strong>
              <div style="font-size:0.72rem;color:#4ade80">● Online | Guidance only (Subject to lender approval)</div>
            </div>
          </div>
        </div>

        <div class="ai-chat-messages" id="aiChatMsgs">
          <div class="ai-msg bot">
            Hello! I am your AI Home Loan Assistant. Ask me anything like:<br>
            • "What documents are required for salaried borrowers?"<br>
            • "How does FOIR affect my loan amount?"<br>
            • "What is the difference between SBI and HDFC home loans?"
          </div>
        </div>

        <div style="padding:16px;background:#fff;border-top:1px solid var(--border)">
          <div style="display:flex;gap:8px;margin-bottom:10px;overflow-x:auto;padding-bottom:4px">
            <button onclick="sendAIPrompt('What docs are needed for salaried?')" class="form-input" style="width:auto;font-size:0.75rem;padding:4px 10px;cursor:pointer">📋 Required Docs</button>
            <button onclick="sendAIPrompt('How is FOIR calculated?')" class="form-input" style="width:auto;font-size:0.75rem;padding:4px 10px;cursor:pointer">🧮 FOIR Formula</button>
            <button onclick="sendAIPrompt('SBI vs HDFC home loan comparison')" class="form-input" style="width:auto;font-size:0.75rem;padding:4px 10px;cursor:pointer">⚖️ SBI vs HDFC</button>
          </div>
          <div style="display:flex;gap:10px">
            <input type="text" class="form-input" id="aiInput" placeholder="Type your home loan question..." onkeypress="if(event.key==='Enter')sendAIMsg()">
            <button onclick="sendAIMsg()" class="btn-primary" style="margin:0;width:auto;padding:10px 20px">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function sendAIPrompt(txt) {
  const input = document.getElementById('aiInput');
  if (input) { input.value = txt; sendAIMsg(); }
}

function sendAIMsg() {
  const input = document.getElementById('aiInput');
  const txt = input ? input.value.trim() : '';
  if (!txt) return;

  const msgs = document.getElementById('aiChatMsgs');
  if (!msgs) return;

  // Append user message
  const uDiv = document.createElement('div');
  uDiv.className = 'ai-msg user';
  uDiv.textContent = txt;
  msgs.appendChild(uDiv);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Simulate bot response
  setTimeout(() => {
    const bDiv = document.createElement('div');
    bDiv.className = 'ai-msg bot';

    const lower = txt.toLowerCase();
    let resp = '';

    if (lower.includes('doc') || lower.includes('document')) {
      resp = `<strong>Standard Document Checklist for Indian Home Loans:</strong><br>
        1. <strong>Identity & Address:</strong> PAN Card, Aadhaar Card, Passport/Voter ID.<br>
        2. <strong>Income Proof (Salaried):</strong> Latest 3 months salary slips, Form 16, 6 months bank statement.<br>
        3. <strong>Income Proof (Self-Employed):</strong> 2 years ITR with P&L computation, CA audited balance sheet, 6 months bank statement.<br>
        4. <strong>Property Docs:</strong> Sale agreement, builder allotment letter, approved building plan, link deeds.`;
    } else if (lower.includes('foir')) {
      resp = `<strong>Fixed Obligation to Income Ratio (FOIR):</strong><br>
        Lenders calculate FOIR = (Total Existing EMIs + Proposed EMI) / Gross Monthly Income.<br>
        • For Income < ₹50k: Max FOIR is ~45-50%.<br>
        • For Income ₹50k-₹1.5L: Max FOIR is ~55%.<br>
        • For Income > ₹1.5L: Max FOIR can reach 60-65%.`;
    } else if (lower.includes('sbi') || lower.includes('hdfc')) {
      resp = `<strong>SBI vs HDFC Home Loan Comparison:</strong><br>
        • <strong>SBI:</strong> Starting at 8.50% (EBLR repo linked). Processing fee capped at ₹10,000+GST. Lower rate for women.<br>
        • <strong>HDFC Bank:</strong> Starting at 8.60%. Faster 48-hr digital sanction & wide builder tie-ups.<br>
        <em>Note: Final interest rate depends on your CIBIL score (750+ yields best discount).</em>`;
    } else {
      resp = `Based on Indian lending practices, your query regarding <strong>"${txt}"</strong> depends on your monthly income, CIBIL score, property type, and lender underwriting.<br><br>
        💡 <strong>Tip:</strong> Try running our <a href="#" onclick="openCalc('search-wizard');return false;">7-Step Loan Matching Wizard</a> to get personalized match scores!`;
    }

    bDiv.innerHTML = resp + `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:6px">Indicative response. Final terms subject to lender underwriting.</div>`;
    msgs.appendChild(bDiv);
    msgs.scrollTop = msgs.scrollHeight;
  }, 400);
}

/* ══════════════════════════════════════════════════
   APPLICATION MODAL
   ══════════════════════════════════════════════════ */
let selectedLenderForModal = 'sbi';

function openApplicationModal(lenderId = 'sbi') {
  selectedLenderForModal = lenderId;
  let modal = document.getElementById('appModalOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'appModalOverlay';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" onclick="closeApplicationModal()">✕</button>
        <h2 style="font-size:1.4rem;font-weight:900;margin-bottom:6px">🚀 Apply for Home Loan</h2>
        <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:20px">Direct application submission with instant status tracking ID.</p>

        <form onsubmit="submitLoanApplication(event)">
          <div class="form-group" style="margin-bottom:12px">
            <label style="font-weight:700;font-size:0.8rem">Full Name *</label>
            <input type="text" class="form-input" id="mdName" required placeholder="e.g. Rahul Sharma" style="padding:10px">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label style="font-weight:700;font-size:0.8rem">Mobile Phone *</label>
            <input type="tel" class="form-input" id="mdPhone" required placeholder="10-digit mobile number" style="padding:10px">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            <div class="form-group">
              <label style="font-weight:700;font-size:0.8rem">City</label>
              <input type="text" class="form-input" id="mdCity" value="Noida" style="padding:10px">
            </div>
            <div class="form-group">
              <label style="font-weight:700;font-size:0.8rem">Loan Amount (₹)</label>
              <input type="number" class="form-input" id="mdLoanAmt" value="5000000" style="padding:10px">
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;height:46px;font-weight:800;margin-top:10px">Submit Loan Application →</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setTimeout(() => modal.classList.add('open'), 10);
}

function closeApplicationModal() {
  const modal = document.getElementById('appModalOverlay');
  if (modal) modal.classList.remove('open');
}

function submitLoanApplication(e) {
  e.preventDefault();
  const name = document.getElementById('mdName').value;
  const phone = document.getElementById('mdPhone').value;
  const city = document.getElementById('mdCity').value;
  const loanAmount = document.getElementById('mdLoanAmt').value;

  fetch('/api/lead/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name, phone, city, loanAmount, lenderId: selectedLenderForModal
    })
  })
  .then(r => r.json())
  .then(res => {
    closeApplicationModal();
    if (res.ok) {
      alert(`🎉 Application Submitted Successfully!\n\nYour Application ID is: ${res.applicationId}\n\nUse this ID to track your status live in the "Track Application" section.`);
      openCalc('track-application');
      const input = document.getElementById('trackAppId');
      if (input) { input.value = res.applicationId; fetchAppStatus(); }
    }
  });
}
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

/* ══════════════════════════════════════════════════
   CALCULATOR RENDERER
   ══════════════════════════════════════════════════ */
function renderCalc(id) {
  const cfg = CALCS[id];
  if (!cfg) { navigate('home'); return; }

  document.getElementById('appMain').innerHTML = `
    <div class="calc-page">
      <div class="calc-header">
        <button class="back-btn" onclick="showHome()">← Back to Home</button>
        <h1>${cfg.icon} ${cfg.name}</h1>
        <p>${cfg.desc}</p>
      </div>
      <div class="calc-body">
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
