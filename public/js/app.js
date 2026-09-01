/* ══════════════════════════════════════════════════
   FinCalc Pro — App Entry Point
   Merges all CALCS definitions and boots the SPA.
   ══════════════════════════════════════════════════ */

/* ─ Merge all calculator definitions ────────────── */
const CALCS = { ...CALCS_LOANS, ...CALCS_INVESTMENTS };

/* ─ Mobile nav wiring ────────────────────────────── */
document.getElementById("hamburger")?.addEventListener("click", () => {
  document.getElementById("mobileDrawer")?.classList.add("open");
  document.getElementById("drawerOverlay")?.classList.add("open");
});

document.getElementById("drawerClose")?.addEventListener("click", closeMobile);
document.getElementById("drawerOverlay")?.addEventListener("click", closeMobile);

/* ─ Sync dynamic navigation links ─────────────────── */
function syncAppNavMenus() {
  if (typeof getVisibleCalculators !== 'function') return;
  const loans = getVisibleCalculators('loans');
  const investments = getVisibleCalculators('investments');

  // Sync Desktop EMI Dropdown
  const emiDropdown = document.querySelector('#tab-emi + .dropdown-panel');
  if (emiDropdown && loans.length > 0) {
    const half = Math.ceil(loans.length / 2);
    const col1 = loans.slice(0, half);
    const col2 = loans.slice(half);
    emiDropdown.innerHTML = `
      <div class="dp-col">
        <span class="dp-heading">🏠 Loan Calculators</span>
        ${col1.map(c => `<a href="#" onclick="openCalc('${c.id}');return false;">${c.label || c.name}</a>`).join('')}
      </div>
      <div class="dp-col">
        <span class="dp-heading">🚗 Additional Loans</span>
        ${col2.map(c => `<a href="#" onclick="openCalc('${c.id}');return false;">${c.label || c.name}</a>`).join('')}
      </div>`;
  }

  // Sync Desktop Investment Dropdown
  const invDropdown = document.querySelector('#tab-investment + .dropdown-panel');
  if (invDropdown && investments.length > 0) {
    const half = Math.ceil(investments.length / 2);
    const col1 = investments.slice(0, half);
    const col2 = investments.slice(half);
    invDropdown.innerHTML = `
      <div class="dp-col">
        <span class="dp-heading">📈 Wealth & Mutual Funds</span>
        ${col1.map(c => `<a href="#" onclick="openCalc('${c.id}');return false;">${c.label || c.name}</a>`).join('')}
      </div>
      <div class="dp-col">
        <span class="dp-heading">💰 Savings & Planning</span>
        ${col2.map(c => `<a href="#" onclick="openCalc('${c.id}');return false;">${c.label || c.name}</a>`).join('')}
      </div>`;
  }

  // Sync Mobile Drawer
  const mobileNav = document.querySelector('.mobile-nav-links');
  if (mobileNav) {
    mobileNav.innerHTML = `
      <a href="#" onclick="showHome();closeMobile();return false;">🏠 Home</a>
      <details><summary>EMI Loans</summary>
        ${loans.map(c => `<a href="#" onclick="openCalc('${c.id}');closeMobile();return false;">${c.icon || '🏠'} ${c.label || c.name}</a>`).join('')}
      </details>
      <details><summary>Investment</summary>
        ${investments.map(c => `<a href="#" onclick="openCalc('${c.id}');closeMobile();return false;">${c.icon || '📈'} ${c.label || c.name}</a>`).join('')}
      </details>
      <a href="#" onclick="openCalc('gold-rates');closeMobile();return false;">💎 Gold Rates</a>
      <a href="#" onclick="openCalc('market');closeMobile();return false;">📊 Market</a>
      <a href="#" onclick="navigate('blog');closeMobile();return false;">📰 Blog</a>
      <a href="#" onclick="navigate('about');closeMobile();return false;">ℹ️ About</a>`;
  }
}

/* ─ Boot ─────────────────────────────────────────── */
syncAppNavMenus();
const initialView = window.location.hash.replace("#", "") || "home";
navigate(initialView, false);
