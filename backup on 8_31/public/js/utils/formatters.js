/* ══════════════════════════════════════════════════
   FinCalc Pro — Formatters & Math Utilities
   Pure helper functions — no DOM dependencies.
   ══════════════════════════════════════════════════ */

/* ─ Number Formatters ────────────────────────────── */
function fmt(n, d = 0) {
  if (!isFinite(n) || isNaN(n)) return '0';
  return Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: d,
    minimumFractionDigits: d
  });
}

function fmtC(n)     {
  if (!isFinite(n) || isNaN(n)) return '₹0';
  return "₹" + fmt(n);
}
function fmtCd(n, d) {
  if (!isFinite(n) || isNaN(n)) return '₹0';
  return "₹" + fmt(n, d);
}

function inLakhsCr(n) {
  if (!isFinite(n) || isNaN(n) || n < 0) return '₹0';
  if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + " L";
  return fmt(n);
}

/* ─ EMI Formula ──────────────────────────────────── */
function calcEMI(principal, annualRate, months) {
  if (!principal || principal <= 0 || !months || months <= 0) return 0;
  if (!annualRate || annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  return isFinite(emi) ? emi : 0;
}
