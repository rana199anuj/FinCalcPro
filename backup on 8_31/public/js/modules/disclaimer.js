/* ══════════════════════════════════════════════════
   FinCalc Pro — Disclaimer Module
   Financial calculation disclaimer, regulatory disclosures,
   and liability limitations.
   ══════════════════════════════════════════════════ */

function renderDisclaimer() {
  document.getElementById('appMain').innerHTML = `
    <div class="legal-page">

      <!-- Hero Header -->
      <div class="legal-hero" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
        <div class="legal-hero-inner">
          <div class="legal-hero-badge" style="background:rgba(217,119,6,0.15);color:#f59e0b;border-color:rgba(217,119,6,0.3);">⚖️ Legal Disclosures</div>
          <h1>Financial <span>Disclaimer</span></h1>
          <p class="legal-hero-sub">Important disclosures regarding financial calculations, estimates, market data, and advisory limitations.</p>
          <div class="legal-meta-row">
            <span>📅 Last Updated: August 27, 2026</span>
            <span>•</span>
            <span>⚠️ Indicative Estimates Only</span>
            <span>•</span>
            <span>🏛️ Educational Use</span>
          </div>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="legal-container">

        <!-- Critical Notice Alert Box -->
        <div class="legal-alert-box" style="border-left-color:#d97706;background:rgba(217,119,6,0.06);border:1px solid rgba(217,119,6,0.25);">
          <div class="legal-alert-icon">⚠️</div>
          <div class="legal-alert-content">
            <strong style="color:#d97706;">Important Financial Notice:</strong>
            <p>FinCalc Pro is an independent computational utility intended purely for <strong>informational and educational purposes</strong>. We are <strong>NOT a bank, NBFC, lender, or SEBI-registered Investment Advisor (RIA)</strong>. All calculation figures (EMIs, returns, eligibility, maturity amounts) are mathematical estimations and do not constitute a loan offer or financial guarantee.</p>
          </div>
        </div>

        <!-- Section 1 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">01</span>
            <h2>No Financial, Legal, or Investment Advice</h2>
          </div>
          <p>The information and calculation outputs generated on <strong>FinCalc Pro</strong> do not constitute financial, legal, tax, or investment advice. Neither the calculators nor any blog articles or FAQs on this platform should be treated as a recommendation to buy, sell, invest in, or subscribe to any financial security, mutual fund, loan product, or gold asset.</p>
          <p>Financial decisions must always be made after consulting a certified financial planner, chartered accountant, or registered banking representative who can evaluate your unique risk appetite and financial profile.</p>
        </div>

        <!-- Section 2 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">02</span>
            <h2>Accuracy & Limitations of Calculations</h2>
          </div>
          <p>Our calculation engines implement standard banking mathematics (such as reducing-balance EMI formulas and compound growth annuity formulas). However, real-world financial contracts may differ due to:</p>
          <ul class="legal-list">
            <li><strong>Bank Specific Methodologies:</strong> Differences in daily vs. monthly reducing balance calculations, leap-year day count conventions (365 vs. 360 days), and broken-period interest.</li>
            <li><strong>Fees & Levies:</strong> Bank processing fees, GST, documentation charges, stamp duty, property valuation fees, legal inspection fees, and prepayment penalties that vary by lender.</li>
            <li><strong>Floating Interest Rates:</strong> Benchmark-linked lending rates (EBLR/RLLR/MCLR) that fluctuate with RBI Repo Rate revisions throughout the loan tenure.</li>
            <li><strong>Taxes & Cess:</strong> Capital gains taxation (STCG/LTCG), TDS deductions on FD interest, and Section 80C/24(b) limits that vary according to your individual income tax slab and government budgets.</li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">03</span>
            <h2>Market Data & Commodity Prices</h2>
          </div>
          <p>Regarding market tickers and precious metal values shown on the website:</p>
          <ul class="legal-list">
            <li><strong>Simulated Feeds:</strong> Live market index data (Nifty 50, Sensex, Bank Nifty) and gold rates displayed via WebSocket feeds are generated for demonstration, illustrative, and testing purposes.</li>
            <li><strong>Gold & Silver Rates:</strong> The gold prices shown reflect pure bullion spot estimations. Physical retail jewelry prices across Indian cities (Mumbai, Delhi, Chennai, etc.) will differ due to local bullion associations, 3% GST, making charges, and hallmarking fees.</li>
            <li><strong>No Trading Reliance:</strong> You must not use the price feeds on this site for executing live market trades or financial contracts. Always verify real-time quotes on official exchange platforms (NSE, BSE, MCX).</li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">04</span>
            <h2>Loan Approvals & Lender Sanctions</h2>
          </div>
          <p>Any result generated by our <em>Home Loan Eligibility</em>, <em>Affordability</em>, <em>Car Loan</em>, <em>Gold Loan</em>, or <em>Loan Against Property</em> tools is purely indicative:</p>
          <ul class="legal-list">
            <li>FinCalc Pro cannot approve, sanction, or disburse any loan.</li>
            <li>Actual eligibility and sanctioned amounts are determined strictly by individual lending institutions based on comprehensive credit bureau checks (CIBIL/Experian), income verification, employer category, FOIR norms, and legal property title clearance.</li>
          </ul>
        </div>

        <!-- Section 5 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">05</span>
            <h2>Investment Risks & Mutual Funds</h2>
          </div>
          <p><strong>Mutual fund investments and SIPs are subject to market risks.</strong> Please read all scheme-related documents carefully before investing.</p>
          <p>Historical returns (e.g. 12% CAGR assumptions) used in our SIP, Lumpsum, and Retirement calculators are illustrative benchmarks and do not guarantee future performance. Market movements, economic cycles, and inflation can cause capital appreciation or depreciation.</p>
        </div>

        <!-- Section 6 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">06</span>
            <h2>Third-Party Trademarks & Brands</h2>
          </div>
          <p>All product names, logos, trademarks, and registered trademarks of banks and financial institutions (including State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Bank of Baroda, NSE, BSE, MCX) referenced on this site belong to their respective owners.</p>
          <p>Reference to any specific bank or lender does not constitute an endorsement, partnership, sponsorship, or official affiliation by or with FinCalc Pro.</p>
        </div>

        <!-- Section 7 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num" style="background:linear-gradient(135deg,#d97706,#b45309);">07</span>
            <h2>Limitation of Liability</h2>
          </div>
          <p>To the maximum extent permitted by applicable Indian law, FinCalc Pro, its founders, developers, and affiliates shall not be held liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:</p>
          <ul class="legal-list">
            <li>Any errors, omissions, calculation discrepancies, or inaccuracies on the platform.</li>
            <li>Financial, investment, or property decisions made in reliance on calculations or content provided on this website.</li>
            <li>Temporary service interruptions, connectivity outages, or data transmission delays.</li>
          </ul>
        </div>

        <!-- Navigation Buttons -->
        <div class="legal-footer-nav">
          <button class="btn-calc-action" onclick="navigate('home')">← Back to Home</button>
          <button class="btn-calc-action" style="background:linear-gradient(135deg,#6366f1,#4f46e5);" onclick="navigate('privacy')">View Privacy Policy →</button>
        </div>

      </div>
    </div>
  `;
}
