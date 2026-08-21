/* ══════════════════════════════════════════════════
   FinCalc Pro — Router & App State
   Handles navigation between views (SPA routing).
   ══════════════════════════════════════════════════ */

/* ─ App State ──────────────────────────────────────── */
let currentView = "home";
let marketData  = null;

/* ─ Router ─────────────────────────────────────────── */
function navigate(view) {
  currentView = view;
  const main = document.getElementById("appMain");
  main.innerHTML = "";
  main.classList.remove("fade-in");
  void main.offsetWidth; // reflow to re-trigger animation
  main.classList.add("fade-in");

  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));

  switch (view) {
    case "home":
      document.getElementById("tab-home")?.classList.add("active");
      document.getElementById("calcTabBar")?.remove();
      renderHome();
      break;
    case "gold-rates":
      document.getElementById("tab-gold")?.classList.add("active");
      document.getElementById("calcTabBar")?.remove();
      renderGoldRates();
      break;
    case "market":
      document.getElementById("tab-market")?.classList.add("active");
      document.getElementById("calcTabBar")?.remove();
      renderMarket();
      break;
    default:
      renderCalc(view);
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome()   { navigate("home"); }
function openCalc(id) { navigate(id); }

function closeMobile() {
  document.getElementById("mobileDrawer")?.classList.remove("open");
  document.getElementById("drawerOverlay")?.classList.remove("open");
}
