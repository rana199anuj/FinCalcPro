/* ══════════════════════════════════════════════════
   FinCalc Pro — Privacy Policy Module
   Comprehensive privacy policy compliant with Indian DPDP Act 2023 & IT Act.
   ══════════════════════════════════════════════════ */

function renderPrivacy() {
  document.getElementById('appMain').innerHTML = `
    <div class="legal-page">

      <!-- Hero Header -->
      <div class="legal-hero">
        <div class="legal-hero-inner">
          <div class="legal-hero-badge">🔒 Legal & Compliance</div>
          <h1>Privacy <span>Policy</span></h1>
          <p class="legal-hero-sub">Your privacy and data security are our highest priority. Learn how FinCalc Pro handles your data.</p>
          <div class="legal-meta-row">
            <span>📅 Last Updated: August 27, 2026</span>
            <span>•</span>
            <span>🛡️ 100% Client-Side Processing</span>
            <span>•</span>
            <span>🇮🇳 DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="legal-container">

        <!-- Quick Summary Card -->
        <div class="legal-alert-box">
          <div class="legal-alert-icon">💡</div>
          <div class="legal-alert-content">
            <strong>Key Summary in Plain English:</strong>
            <p>FinCalc Pro is a 100% free financial calculator tool. We <strong>do not</strong> ask for your name, phone number, PAN, email, or financial account details. All calculations (EMI, SIP, Gold Loan, etc.) are executed <strong>locally inside your browser</strong>. None of your calculation numbers are stored on or transmitted to our servers.</p>
          </div>
        </div>

        <!-- Section 1 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">01</span>
            <h2>Introduction & Scope</h2>
          </div>
          <p>Welcome to <strong>FinCalc Pro</strong> ("we", "our", or "us"). This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you access and use our website and financial calculation utilities.</p>
          <p>By accessing or using FinCalc Pro (hosted at <code>fin-colo-pro-pi.vercel.app</code> and associated domains), you agree to the terms described in this Privacy Policy. If you do not agree, please discontinue using the service.</p>
        </div>

        <!-- Section 2 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">02</span>
            <h2>Information We Do NOT Collect</h2>
          </div>
          <p>Unlike traditional financial platforms, FinCalc Pro is designed with a <strong>privacy-first architecture</strong>. We do NOT collect or store:</p>
          <ul class="legal-list">
            <li><strong>Personally Identifiable Information (PII):</strong> We do not require account registration, login credentials, full names, email addresses, or phone numbers.</li>
            <li><strong>Financial Credentials:</strong> We never ask for bank account details, Aadhaar, PAN numbers, credit card details, or net banking credentials.</li>
            <li><strong>Calculation Inputs:</strong> Your loan amounts, salary inputs, investment targets, and property values remain on your local device. They are never transmitted across the network or stored in our database.</li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">03</span>
            <h2>Information Collected Automatically</h2>
          </div>
          <p>When you visit our website, certain non-personal technical data may be automatically logged for performance and security purposes:</p>
          <ul class="legal-list">
            <li><strong>Device & Browser Data:</strong> Browser type and version, operating system, screen resolution, and preferred language to render calculators correctly.</li>
            <li><strong>Aggregated Anonymous Analytics:</strong> We use privacy-friendly web analytics (such as Vercel Web Analytics) to understand page view counts, device categories, and performance metrics without recording IP addresses or personal tracking cookies.</li>
            <li><strong>Server Diagnostic Logs:</strong> Standard web server logs (status codes, request times) used strictly for detecting system errors, preventing DDoS attacks, and ensuring 99.9% uptime.</li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">04</span>
            <h2>Cookies & Local Browser Storage</h2>
          </div>
          <p>FinCalc Pro uses standard browser <code>localStorage</code> solely to enhance your user experience:</p>
          <ul class="legal-list">
            <li><strong>Custom Preferences & Offline Cache:</strong> Saving user theme preferences or admin-customized FAQ entries locally on your device.</li>
            <li><strong>No Third-Party Advertising Cookies:</strong> We do not serve third-party behavioural ad networks, retargeting pixels, or cross-site tracking beacons.</li>
          </ul>
          <p>You can clear your browser's cookies and local storage at any time via your browser settings without impacting the basic functionality of our calculators.</p>
        </div>

        <!-- Section 5 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">05</span>
            <h2>Data Security & Encryption</h2>
          </div>
          <p>We implement industry-standard security protocols to protect our platform:</p>
          <ul class="legal-list">
            <li><strong>HTTPS / TLS 1.3 Encryption:</strong> All communications between your browser and our CDN are secured using modern SSL/TLS encryption.</li>
            <li><strong>Stateless WebSocket Architecture:</strong> Our real-time market data stream is broadcast-only. Clients receive real-time ticks without transmitting personal identification.</li>
            <li><strong>No Database Selling:</strong> We do not sell, rent, monetize, or trade user data with any third-party marketing companies, NBFCs, or insurance brokers.</li>
          </ul>
        </div>

        <!-- Section 6 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">06</span>
            <h2>Compliance with Indian Regulations</h2>
          </div>
          <p>FinCalc Pro adheres to applicable Indian information technology and digital privacy standards, including:</p>
          <ul class="legal-list">
            <li><strong>Information Technology Act, 2000</strong> and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</li>
            <li><strong>Digital Personal Data Protection (DPDP) Act, 2023:</strong> Principles of purpose limitation, data minimization, and storage limitation.</li>
          </ul>
        </div>

        <!-- Section 7 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">07</span>
            <h2>Children's Privacy</h2>
          </div>
          <p>Our calculation services are intended for general audiences and educational financial planning. We do not knowingly collect or solicit any data from individuals under the age of 18.</p>
        </div>

        <!-- Section 8 -->
        <div class="legal-card">
          <div class="legal-section-header">
            <span class="legal-sec-num">08</span>
            <h2>Policy Updates & Grievance Contact</h2>
          </div>
          <p>We may update this Privacy Policy periodically to reflect new platform features or statutory requirements. Changes will be posted on this page with an updated revision date.</p>
          <div class="legal-contact-box">
            <h4>📬 Privacy & Grievance Contact</h4>
            <p>If you have any questions or feedback regarding this Privacy Policy, you may contact our compliance team:</p>
            <p><strong>Email:</strong> <code>support@fincalcpro.in</code> / <code>privacy@fincalcpro.in</code></p>
            <p><strong>Address:</strong> FinCalc Pro Technologies, Mumbai / New Delhi, India</p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="legal-footer-nav">
          <button class="btn-calc-action" onclick="navigate('home')">← Back to Home</button>
          <button class="btn-calc-action" style="background:linear-gradient(135deg,#0284c7,#0369a1);" onclick="navigate('disclaimer')">View Disclaimer →</button>
        </div>

      </div>
    </div>
  `;
}
