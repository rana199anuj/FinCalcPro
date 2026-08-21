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

/* ─ Boot ─────────────────────────────────────────── */
navigate("home");
