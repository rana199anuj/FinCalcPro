/* ══════════════════════════════════════════════════
   FinCalc Pro — Formatters & Math Utilities
   Pure helper functions — no DOM dependencies.
   ══════════════════════════════════════════════════ */

/* ─ Number Formatters ────────────────────────────── */
function fmt(n, d = 0) {
  return Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: d,
    minimumFractionDigits: d
  });
}

function fmtC(n)     { return "₹" + fmt(n); }
function fmtCd(n, d) { return "₹" + fmt(n, d); }

function inLakhsCr(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + " L";
  return fmt(n);
}

/* ─ EMI Formula ──────────────────────────────────── */
function calcEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}
