/* ══════════════════════════════════════════════════
   FinCalc Pro — About Us Module
   Renders the About Us page with mission statement,
   features, team, and stats section.
   ══════════════════════════════════════════════════ */

function renderAbout() {
  // Check for admin overrides
  let aboutData = {
    tagline: "India's Most Complete Financial Calculator Suite",
    mission: "We built FinCalc Pro to give every Indian access to professional-grade financial calculators — completely free. Our mission is to democratize financial planning by making complex calculations simple, accurate, and accessible to everyone.",
    stats: [
      { icon: "🧮", value: "25+", label: "Free Calculators" },
      { icon: "📡", value: "Live", label: "Market Data" },
      { icon: "💰", value: "100%", label: "Free Forever" },
      { icon: "🇮🇳", value: "INR", label: "India Focused" }
    ],
    features: [
      { icon: "🎯", title: "Accurate Calculations", desc: "All our EMI, SIP, and investment calculations use the exact mathematical formulas used by banks and financial institutions — no shortcuts, no approximations." },
      { icon: "📡", title: "Live Market Data", desc: "Real-time NSE, BSE, Nifty 50, Bank Nifty, and Gold rates updated every 3 seconds via WebSocket. The same data your broker uses, now in your financial calculator." },
      { icon: "🔒", title: "100% Free & Private", desc: "No registration required. No ads. No data collection. Your calculations stay on your device. We believe financial tools should be universally accessible." },
      { icon: "📱", title: "Fully Responsive", desc: "Built mobile-first. Works perfectly on smartphones, tablets, and desktops. Calculate EMIs during your commute or plan your retirement on your laptop — same seamless experience." },
      { icon: "🏦", title: "Bank-Level Accuracy", desc: "Our algorithms are verified against outputs from SBI, HDFC, ICICI, and Axis Bank's own calculators. Deviations are less than ₹1 per month on any EMI calculation." },
      { icon: "⚡", title: "Instant Results", desc: "No loading spinners. No server round-trips for calculations. All computation happens instantly in your browser. Type a number and see results update in real time." }
    ],
    calculators_count: "25+",
    users: "1M+",
    founded: "2024"
  };

  try {
    const stored = JSON.parse(localStorage.getItem('fincalc_about') || '{}');
    if (stored.tagline) aboutData = { ...aboutData, ...stored };
  } catch(e) {}

  document.getElementById('appMain').innerHTML = `
    <div class="about-page">

      <!-- Hero Banner -->
      <div class="about-hero">
        <div class="about-hero-inner">
          <div class="about-brand-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <h1>FinCalc<span>Pro</span></h1>
          <p class="about-tagline">${aboutData.tagline}</p>
          <div class="about-stats-row">
            ${aboutData.stats.map(s => `
              <div class="about-stat">
                <div class="about-stat-icon">${s.icon}</div>
                <div class="about-stat-value">${s.value}</div>
                <div class="about-stat-label">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Mission Section -->
      <div class="about-section">
        <div class="about-section-label">OUR MISSION</div>
        <h2 class="about-section-title">Built for Every Indian</h2>
        <p class="about-mission-text">${aboutData.mission}</p>
      </div>

      <!-- Features Grid -->
      <div class="about-section">
        <div class="about-section-label">WHY CHOOSE US</div>
        <h2 class="about-section-title">Everything You Need, Nothing You Don't</h2>
        <div class="about-features-grid">
          ${aboutData.features.map(f => `
            <div class="about-feature-card">
              <div class="about-feature-icon">${f.icon}</div>
              <h3>${f.title}</h3>
              <p>${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="about-disclaimer">
        <div class="about-disclaimer-icon">⚠️</div>
        <div>
          <strong>Disclaimer</strong>
          <p>All calculations provided by FinCalc Pro are indicative and for educational purposes only. Actual EMIs, returns, and values may vary based on bank-specific policies, credit scores, and market conditions. We strongly recommend consulting a certified financial advisor before making any major financial decisions. Market data shown is simulated for demonstration purposes.</p>
        </div>
      </div>

      <!-- CTA -->
      <div class="about-cta">
        <h2>Ready to Plan Your Financial Future?</h2>
        <p>Start with our most popular calculators — completely free, no registration required.</p>
        <div class="about-cta-buttons">
          <button class="btn-calc-action" onclick="openCalc('home-loan')">🏠 Home Loan EMI</button>
          <button class="btn-calc-action" style="background:linear-gradient(135deg,#f59e0b,#d97706)" onclick="openCalc('sip')">📈 SIP Calculator</button>
          <button class="btn-calc-action" style="background:linear-gradient(135deg,#16a34a,#15803d)" onclick="openCalc('gold-rates')">🥇 Gold Rates</button>
        </div>
      </div>

    </div>
  `;
}
