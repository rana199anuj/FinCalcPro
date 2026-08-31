/* ══════════════════════════════════════════════════
   FinCalc Pro — Router & App State
   Handles navigation between views (SPA routing)
   with full browser/phone back button & hash history.
   ══════════════════════════════════════════════════ */

/* ─ App State ──────────────────────────────────────── */
let currentView = "home";
let marketData  = null;

/* ─ Router ─────────────────────────────────────────── */
function navigate(view, push = true) {
  if (!view) view = "home";
  currentView = view;

  // Sync browser URL hash & history stack
  if (push && window.location.hash !== `#${view}`) {
    if (view === "home") {
      history.pushState({ view: "home" }, "", "#home");
    } else {
      history.pushState({ view }, "", `#${view}`);
    }
  }

  const main = document.getElementById("appMain");
  if (main) {
    main.innerHTML = "";
    main.classList.remove("fade-in");
    void main.offsetWidth; // reflow to re-trigger animation
    main.classList.add("fade-in");
  }

  // Update active state on desktop navbar
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));

  switch (view) {
    case "home":
    case "":
      document.getElementById("tab-home")?.classList.add("active");
      renderHome();
      break;
    case "gold-rates":
      document.getElementById("tab-gold")?.classList.add("active");
      renderGoldRates();
      break;
    case "market":
      document.getElementById("tab-market")?.classList.add("active");
      renderMarket();
      break;
    case "blog":
      document.getElementById("tab-blog")?.classList.add("active");
      if (typeof renderBlog === 'function') renderBlog();
      break;
    case "about":
      document.getElementById("tab-about")?.classList.add("active");
      if (typeof renderAbout === 'function') renderAbout();
      break;
    case "privacy":
      if (typeof renderPrivacy === 'function') renderPrivacy();
      break;
    case "disclaimer":
      if (typeof renderDisclaimer === 'function') renderDisclaimer();
      break;
    default:
      renderCalc(view);
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() { 
  navigate("home"); 
}

function goBack() {
  if (window.history.length > 1 && window.location.hash && window.location.hash !== "" && window.location.hash !== "#home") {
    window.history.back();
  } else {
    navigate("home");
  }
}

function openCalc(id) { 
  navigate(id); 
}

function closeMobile() {
  document.getElementById("mobileDrawer")?.classList.remove("open");
  document.getElementById("drawerOverlay")?.classList.remove("open");
}

/* ─ Browser & Phone Back/Forward Button Listeners ── */
window.addEventListener("popstate", (e) => {
  const hashView = window.location.hash.replace("#", "");
  const view = (e.state && e.state.view) || hashView || "home";
  navigate(view, false);
});

window.addEventListener("hashchange", () => {
  const view = window.location.hash.replace("#", "") || "home";
  if (view !== currentView) {
    navigate(view, false);
  }
});
