/* ══════════════════════════════════════════════════
   FinCalc Pro — WebSocket Event Handlers
   Listens for custom events dispatched by websocket.js
   and routes market data to the correct view updater.
   ══════════════════════════════════════════════════ */

/* ─ Live dot: green = connected, red = disconnected ── */
document.addEventListener("ws:open", () => {
  const d = document.getElementById("navLiveDot");
  if (d) d.style.background = "#22c55e";
});

document.addEventListener("ws:close", () => {
  const d = document.getElementById("navLiveDot");
  if (d) d.style.background = "#ef4444";
});

/* ─ Incoming market data ─────────────────────────── */
document.addEventListener("ws:market", (e) => {
  marketData = e.detail;
  updateNavBadge(marketData);

  if      (currentView === "home")       updateHomeTicker(marketData);
  else if (currentView === "gold-rates") updateGoldRates(marketData);
  else if (currentView === "market")     updateMarketPage(marketData);
  else if (currentView === "gold-loan")  updateGoldLoanPanel(marketData);
});

/* ─ Navbar live badge ────────────────────────────── */
function updateNavBadge(d) {
  if (!d?.indices) return;
  const ni = d.indices.nifty;
  const se = d.indices.sensex;
  const go = d.gold;

  const set = (id, txt, col) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = txt; el.style.color = col; }
  };

  set("navNifty",  `NSE ${fmt(ni.value, 2)}`,    ni.change  >= 0 ? "#22c55e" : "#ef4444");
  set("navSensex", `BSE ${fmt(se.value, 2)}`,    se.change  >= 0 ? "#22c55e" : "#ef4444");
  set("navGold",   `Gold ₹${fmt(go.g24)}/g`,     go.ch24    >= 0 ? "#22c55e" : "#ef4444");
}
