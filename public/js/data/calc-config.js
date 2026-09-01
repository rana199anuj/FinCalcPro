/* ══════════════════════════════════════════════════
   FinCalc Pro — Calculator Configuration & Registry
   Manages the master list of calculators, ordering,
   custom labels/descriptions, visibility (hide/show),
   and user-created custom calculators.
   ══════════════════════════════════════════════════ */

const DEFAULT_CALCULATORS = [
  // ── Loan Calculators ──
  {
    id: "home-loan",
    icon: "🏠",
    name: "Home Loan EMI Calculator",
    label: "Home Loan",
    desc: "Calculate your monthly EMI, total interest and payment schedule.",
    category: "loans",
    hidden: false,
    order: 1,
    custom: false
  },
  {
    id: "home-eligibility",
    icon: "✅",
    name: "Home Loan Eligibility Calculator",
    label: "Eligibility",
    desc: "Find the maximum loan amount you qualify for based on income and FOIR.",
    category: "loans",
    hidden: false,
    order: 2,
    custom: false
  },
  {
    id: "home-affordability",
    icon: "💰",
    name: "Home Affordability Calculator",
    label: "Affordability",
    desc: "Estimate how much home price you can afford based on savings & EMI capacity.",
    category: "loans",
    hidden: false,
    order: 3,
    custom: false
  },
  {
    id: "home-balance-transfer",
    icon: "🔄",
    name: "Home Loan Balance Transfer Calculator",
    label: "Balance Transfer",
    desc: "Calculate how much interest you can save by switching your loan to a lower rate.",
    category: "loans",
    hidden: false,
    order: 4,
    custom: false
  },
  {
    id: "loan-to-value",
    icon: "📐",
    name: "Loan-to-Value (LTV) Calculator",
    label: "LTV",
    desc: "Check your LTV ratio and required down payment against RBI guidelines.",
    category: "loans",
    hidden: false,
    order: 5,
    custom: false
  },
  {
    id: "compare-bank",
    icon: "🏦",
    name: "Compare Bank Home Loans",
    label: "Compare Banks",
    desc: "Compare interest rates, monthly EMIs and total payable across top Indian banks.",
    category: "loans",
    hidden: false,
    order: 6,
    custom: false
  },
  {
    id: "loan-against-property",
    icon: "🏗️",
    name: "Loan Against Property (LAP) Calculator",
    label: "Loan vs Property",
    desc: "Calculate EMI and eligible loan amount against residential/commercial property.",
    category: "loans",
    hidden: false,
    order: 7,
    custom: false
  },
  {
    id: "car-loan",
    icon: "🚗",
    name: "Car Loan EMI Calculator",
    label: "Car Loan",
    desc: "Calculate monthly EMI, down payment impact, and total interest for new/used cars.",
    category: "loans",
    hidden: false,
    order: 8,
    custom: false
  },
  {
    id: "two-wheeler",
    icon: "🏍️",
    name: "Two-Wheeler Loan EMI Calculator",
    label: "Two-Wheeler",
    desc: "Calculate bike/scooter loan EMI with zero down payment simulation.",
    category: "loans",
    hidden: false,
    order: 9,
    custom: false
  },
  {
    id: "education-loan",
    icon: "🎓",
    name: "Education Loan EMI Calculator",
    label: "Education",
    desc: "Includes course duration moratorium period and tax benefits under Sec 80E.",
    category: "loans",
    hidden: false,
    order: 10,
    custom: false
  },
  {
    id: "gold-loan",
    icon: "💎",
    name: "Gold Loan EMI Calculator",
    label: "Gold Loan",
    desc: "Calculate eligible loan against gold ornaments with BOB style per-gram valuation.",
    category: "loans",
    hidden: false,
    order: 11,
    custom: false
  },
  {
    id: "credit-card",
    icon: "💳",
    name: "Credit Card Payoff Calculator",
    label: "Credit Card",
    desc: "See how long it takes to clear your card balance with minimum vs fixed payments.",
    category: "loans",
    hidden: false,
    order: 12,
    custom: false
  },
  {
    id: "consumer-durable",
    icon: "📱",
    name: "Consumer Durable / No-Cost EMI Calculator",
    label: "Consumer Durable",
    desc: "Discover the hidden interest and processing fees inside 'No-Cost EMI' offers.",
    category: "loans",
    hidden: false,
    order: 13,
    custom: false
  },

  // ── Investment Calculators ──
  {
    id: "sip",
    icon: "📈",
    name: "SIP Calculator (Systematic Investment Plan)",
    label: "SIP",
    desc: "Calculate future returns on your monthly mutual fund investments with compounding.",
    category: "investments",
    hidden: false,
    order: 14,
    custom: false
  },
  {
    id: "gold-sip",
    icon: "🥇",
    name: "Gold SIP Calculator",
    label: "Gold SIP",
    desc: "Calculate wealth accumulation in digital / sovereign gold with live rates.",
    category: "investments",
    hidden: false,
    order: 15,
    custom: false
  },
  {
    id: "lumpsum",
    icon: "💵",
    name: "Lumpsum Investment Calculator",
    label: "Lumpsum",
    desc: "Calculate maturity value of one-time mutual fund or equity investments.",
    category: "investments",
    hidden: false,
    order: 16,
    custom: false
  },
  {
    id: "lumpsum-sip",
    icon: "🎯",
    name: "Lumpsum + SIP Combo Calculator",
    label: "Lumpsum+SIP",
    desc: "Calculate compound growth for an initial lump sum followed by regular monthly SIP.",
    category: "investments",
    hidden: false,
    order: 17,
    custom: false
  },
  {
    id: "sip-delay",
    icon: "⏱️",
    name: "SIP Delay Cost Calculator",
    label: "SIP Delay",
    desc: "See how much compounding wealth you lose by delaying your SIP by a few months/years.",
    category: "investments",
    hidden: false,
    order: 18,
    custom: false
  },
  {
    id: "target-value",
    icon: "🏆",
    name: "Target SIP Amount Calculator",
    label: "Target SIP",
    desc: "Determine how much monthly SIP you need to reach a specific financial target.",
    category: "investments",
    hidden: false,
    order: 19,
    custom: false
  },
  {
    id: "cagr",
    icon: "📊",
    name: "CAGR Calculator (Compound Annual Growth)",
    label: "CAGR",
    desc: "Compute the true compounded annual growth rate of any investment over time.",
    category: "investments",
    hidden: false,
    order: 20,
    custom: false
  },
  {
    id: "fd",
    icon: "🏛️",
    name: "Fixed Deposit (FD) Calculator",
    label: "FD",
    desc: "Calculate maturity amount and quarterly compounded interest for bank fixed deposits.",
    category: "investments",
    hidden: false,
    order: 21,
    custom: false
  },
  {
    id: "rd",
    icon: "📅",
    name: "Recurring Deposit (RD) Calculator",
    label: "RD",
    desc: "Calculate maturity return for monthly recurring deposits with quarterly compounding.",
    category: "investments",
    hidden: false,
    order: 22,
    custom: false
  },
  {
    id: "ppf",
    icon: "🔐",
    name: "Public Provident Fund (PPF) Calculator",
    label: "PPF",
    desc: "15-year government guaranteed tax-free return calculation with annual extension.",
    category: "investments",
    hidden: false,
    order: 23,
    custom: false
  },
  {
    id: "retirement",
    icon: "👴",
    name: "Retirement Corpus Planner",
    label: "Retirement",
    desc: "Calculate required retirement fund considering current age, retirement age and inflation.",
    category: "investments",
    hidden: false,
    order: 24,
    custom: false
  },
  {
    id: "inflation",
    icon: "📉",
    name: "Inflation Impact Calculator",
    label: "Inflation",
    desc: "See how inflation erodes the purchasing power of your money over years.",
    category: "investments",
    hidden: false,
    order: 25,
    custom: false
  },
  {
    id: "gratuity",
    icon: "🎁",
    name: "Gratuity Calculator (Payment of Gratuity Act)",
    label: "Gratuity",
    desc: "Calculate tax-exempt employee gratuity based on 15/26 formula and service tenure.",
    category: "investments",
    hidden: false,
    order: 26,
    custom: false
  }
];

const CALC_STORAGE_KEY = 'fincalc_calculators_config';

/**
 * Get the full master list of all calculators (ordered).
 * Returns saved list from localStorage, or factory defaults if none stored.
 */
function getCalculatorsConfig() {
  try {
    const raw = localStorage.getItem(CALC_STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CALCULATORS));

    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) {
      return JSON.parse(JSON.stringify(DEFAULT_CALCULATORS));
    }

    // Return stored list sorted by order
    const list = [...stored];
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  } catch (e) {
    console.error('[CalcConfig] Error reading config:', e);
    return JSON.parse(JSON.stringify(DEFAULT_CALCULATORS));
  }
}

/**
 * Save calculators list to localStorage
 */
function saveCalculatorsConfig(list) {
  try {
    // Normalize order index
    const normalized = list.map((c, i) => ({
      ...c,
      order: i + 1
    }));
    localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (e) {
    console.error('[CalcConfig] Error saving config:', e);
    return false;
  }
}

/**
 * Reset calculators configuration to original factory defaults
 */
function resetCalculatorsConfig() {
  try {
    localStorage.removeItem(CALC_STORAGE_KEY);
    return JSON.parse(JSON.stringify(DEFAULT_CALCULATORS));
  } catch (e) {
    return DEFAULT_CALCULATORS;
  }
}

/**
 * Get only visible (non-hidden) calculators in order, optionally filtered by category
 */
function getVisibleCalculators(category) {
  const all = getCalculatorsConfig();
  let visible = all.filter(c => !c.hidden);
  if (category) {
    visible = visible.filter(c => c.category === category);
  }
  return visible;
}

/**
 * Find calculator metadata by ID
 */
function getCalculatorMeta(id) {
  const all = getCalculatorsConfig();
  return all.find(c => c.id === id) || DEFAULT_CALCULATORS.find(c => c.id === id) || null;
}

/**
 * Build dynamic CALC_TABS array for the slider bar
 */
function getActiveCalcTabs() {
  const visible = getVisibleCalculators();
  return visible.map(c => ({
    id: c.id,
    icon: c.icon || "🧮",
    label: c.label || c.name
  }));
}

// Export for module/global environments
if (typeof window !== 'undefined') {
  window.DEFAULT_CALCULATORS = DEFAULT_CALCULATORS;
  window.getCalculatorsConfig = getCalculatorsConfig;
  window.saveCalculatorsConfig = saveCalculatorsConfig;
  window.resetCalculatorsConfig = resetCalculatorsConfig;
  window.getVisibleCalculators = getVisibleCalculators;
  window.getCalculatorMeta = getCalculatorMeta;
  window.getActiveCalcTabs = getActiveCalcTabs;
}
