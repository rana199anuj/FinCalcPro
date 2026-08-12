const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Admin Secret ─────────────────────────────────────────────────────────────
const ADMIN_KEY = 'admin123';

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Admin Update Endpoint ────────────────────────────────────────────────────
// POST /api/admin/update
// Body: { indices?: { nifty, sensex, bankNifty, niftyIT }, metals?: { gold24k, gold22k, ... } }
// ─── /admin clean URL redirect ───────────────────────────────────────────────
app.get('/admin', (req, res) => res.redirect('/admin.html'));

app.post('/api/admin/update', requireAdmin, (req, res) => {
  const { indices, metals } = req.body || {};

  // Update market indices
  if (indices && typeof indices === 'object') {
    const idxKeys = ['nifty', 'sensex', 'bankNifty', 'niftyIT'];
    idxKeys.forEach(key => {
      if (indices[key] && base[key]) {
        const u = indices[key];
        if (typeof u.value === 'number') base[key].value = u.value;
        if (typeof u.prev  === 'number') base[key].prev  = u.prev;
        if (typeof u.open  === 'number') base[key].open  = u.open;
        if (typeof u.value === 'number') {
          base[key].high = Math.max(base[key].high, u.value);
          base[key].low  = Math.min(base[key].low,  u.value);
        }
        console.log(`[Admin] Updated ${key}:`, u);
      }
    });
  }

  // Update metals
  if (metals && typeof metals === 'object') {
    const metalMap = {
      gold24k:  'gold24k',
      gold22k:  'gold22k',
      gold20k:  'gold20k',
      gold18k:  'gold18k',
      silver:   'silver',
      platinum: 'platinum'
    };
    Object.entries(metalMap).forEach(([bodyKey, baseKey]) => {
      if (metals[bodyKey] && base[baseKey]) {
        const u = metals[bodyKey];
        if (typeof u.value === 'number') base[baseKey].value = u.value;
        if (typeof u.prev  === 'number') base[baseKey].prev  = u.prev;
        console.log(`[Admin] Updated ${baseKey}:`, u);
      }
    });
  }

  // Immediately broadcast updated values to all WebSocket clients
  broadcast(buildPayload());

  res.json({ ok: true, ts: new Date().toISOString() });
});

// ─── LENDER DATABASE & RATE MANAGEMENT SYSTEM ─────────────────────────────────
const lenders = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    code: 'SBI',
    type: 'Bank',
    category: 'Public Sector Bank',
    tagline: 'India\'s Largest Home Loan Provider',
    minRate: 8.50,
    maxRate: 9.65,
    rateType: 'Floating (Repo Rate Linked - EBLR)',
    maxTenure: 30,
    processingFee: '0.35% (Min ₹2,000, Max ₹10,000 + GST)',
    processingFeePct: 0.35,
    maxProcessingFee: 10000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 25000,
    minCibil: 700,
    rating: 4.8,
    reviewsCount: 14200,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://sbi.co.in/web/interest-rates/home-loans',
    logoBg: '#0083ca',
    highlights: ['Concession for women borrowers', 'Special festive zero processing fee schemes', 'Overdraft facility available (SBI Maxgain)'],
    docsRequired: ['PAN Card & Aadhaar', '3 Months Salary Slip / 2 Yrs ITR', '6 Months Bank Statement', 'Property Agreement / Allotment Letter'],
    pros: ['Lowest floating interest rates', 'High loan eligibility', 'No hidden charges']
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    code: 'HDFC',
    type: 'Bank',
    category: 'Private Sector Bank',
    tagline: 'Instant Sanction & Seamless Digital Journey',
    minRate: 8.60,
    maxRate: 9.75,
    rateType: 'Floating (Repo Rate Linked)',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹15,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 30000,
    minCibil: 720,
    rating: 4.7,
    reviewsCount: 18900,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan',
    logoBg: '#004c8f',
    highlights: ['Digital doorstep service', 'Customized repayment options (Step-Up / Tranche)', 'Quick 48-hr in-principle approval'],
    docsRequired: ['PAN & Aadhaar', '6 Months Bank Statement', 'Form 16 / 2 Yrs ITR', 'Approved Plan & Property Title Docs'],
    pros: ['Fastest sanction speed', 'Wide builder tie-up network', 'Top-up loan availability']
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    code: 'ICICI',
    type: 'Bank',
    category: 'Private Sector Bank',
    tagline: 'Pre-Approved Home Loans & Express Processing',
    minRate: 8.65,
    maxRate: 9.80,
    rateType: 'Floating (I-MCLR / Repo Linked)',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹12,500 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 12500,
    maxLTV: 90,
    prepaymentFee: 'Nil for Individual Borrowers',
    minIncome: 25000,
    minCibil: 700,
    rating: 4.6,
    reviewsCount: 12500,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.icicibank.com/personal-banking/loans/home-loan',
    logoBg: '#f37021',
    highlights: ['Instant pre-approved sanction for salary account holders', 'Flexible EMI options (ExtraPay)', 'Digital loan tracking'],
    docsRequired: ['Identity & Address Proof', '3 Months Payslips', '6 Months Salary Account Statement', 'Property Chain Documents'],
    pros: ['Transparent process', 'Strong digital app tracking', 'Flexible repayment structures']
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    code: 'AXIS',
    type: 'Bank',
    category: 'Private Sector Bank',
    tagline: 'Shubh Aarambh Home Loans with EMI Waivers',
    minRate: 8.70,
    maxRate: 9.85,
    rateType: 'Floating (Repo Rate Linked)',
    maxTenure: 30,
    processingFee: '1.00% (Min ₹10,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 15000,
    maxLTV: 85,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 28000,
    minCibil: 710,
    rating: 4.5,
    reviewsCount: 9800,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.axisbank.com/retail/loans/home-loan',
    logoBg: '#971237',
    highlights: ['12 EMI waivers on timely repayments (Asha Home Loan)', 'Balance Transfer with top-up', 'NRI Home loan specialists'],
    docsRequired: ['PAN Card', 'Address Proof', '6 Months Bank Statement', 'ITR for 2 Years'],
    pros: ['EMI waiver reward scheme', 'Attractive balance transfer rates', 'Doorstep document pickup']
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    code: 'BOB',
    type: 'Bank',
    category: 'Public Sector Bank',
    tagline: 'Baroda Repo Linked Rate (BRLLR) Advantage',
    minRate: 8.40,
    maxRate: 9.50,
    rateType: 'Floating (BRLLR Linked)',
    maxTenure: 30,
    processingFee: 'Nil (Special Promotional Waiver)',
    processingFeePct: 0.0,
    maxProcessingFee: 0,
    maxLTV: 90,
    prepaymentFee: 'Nil',
    minIncome: 20000,
    minCibil: 701,
    rating: 4.7,
    reviewsCount: 8400,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.bankofbaroda.in/personal-banking/loans/home-loan',
    logoBg: '#f26522',
    highlights: ['Zero processing fee promotional offers', 'Concession for CIBIL > 775', 'Overdraft facility (Baroda Home Loan Advantage)'],
    docsRequired: ['KYC Documents', 'Salary Slips / Business Profit Loss Stmt', 'Bank Account Stmt (6 Mos)', 'Property Documents'],
    pros: ['Very competitive starting rates', 'Low processing fees', 'No hidden charges']
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    code: 'PNB',
    type: 'Bank',
    category: 'Public Sector Bank',
    tagline: 'PNB Max-Saver & Affordable Housing Specialist',
    minRate: 8.45,
    maxRate: 9.60,
    rateType: 'Floating (RLLR Linked)',
    maxTenure: 30,
    processingFee: '0.35% (Max ₹15,000 + GST)',
    processingFeePct: 0.35,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil',
    minIncome: 20000,
    minCibil: 700,
    rating: 4.4,
    reviewsCount: 7100,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.pnbindia.in/home-loans.html',
    logoBg: '#a20f35',
    highlights: ['Special concession for women & defense personnel', 'Plot & construction combined loans', 'Low interest rate tiers'],
    docsRequired: ['KYC Proofs', 'Income Tax Returns (2 Yrs)', 'Salary Slip (3 Mos)', 'Property Cost Estimate / Agreement'],
    pros: ['Trusted public sector bank', 'High loan approval limits', 'Low margins']
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    code: 'UNION',
    type: 'Bank',
    category: 'Public Sector Bank',
    tagline: 'Union Awas Home Loan for Every Indian',
    minRate: 8.35,
    maxRate: 9.55,
    rateType: 'Floating (EBLR Linked)',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹15,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil',
    minIncome: 20000,
    minCibil: 700,
    rating: 4.5,
    reviewsCount: 6500,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.unionbankofindia.co.in/english/home-loan.aspx',
    logoBg: '#005494',
    highlights: ['Among the lowest starting rates in India', 'Nil prepayment penalty', 'Fast processing centers'],
    docsRequired: ['PAN & Aadhaar', 'Salary Certificates', '6 Mos Bank Stmt', 'Title Deed & Building Plan'],
    pros: ['Lowest floating rate bracket', 'Transparent terms', 'Great balance transfer offers']
  },
  {
    id: 'lichfl',
    name: 'LIC Housing Finance',
    code: 'LICHFL',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Griha Siddhi & Affordable Housing Solutions',
    minRate: 8.50,
    maxRate: 9.75,
    rateType: 'Floating (LHFR Linked)',
    maxTenure: 30,
    processingFee: '0.35% (Max ₹15,000 + GST)',
    processingFeePct: 0.35,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 20000,
    minCibil: 680,
    rating: 4.6,
    reviewsCount: 15400,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.lichousing.com/home-loans',
    logoBg: '#e31b23',
    highlights: ['Special 6 EMI waiver benefit on Griha Siddhi', 'Flexible underwriting for self-employed', 'Widespread branch network'],
    docsRequired: ['Identity Proof', 'Address Proof', 'Income Docs (Salary Slip/ITR)', 'Property Title Docs'],
    pros: ['Specialist HFC focus', 'Self-employed friendly', 'High sanction approval rate']
  },
  {
    id: 'bajajhf',
    name: 'Bajaj Housing Finance',
    code: 'BAJAJHF',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Digital Home Loans with Top-Up up to ₹1 Crore',
    minRate: 8.55,
    maxRate: 9.90,
    rateType: 'Floating (PLR Linked)',
    maxTenure: 30,
    processingFee: 'Up to 0.50% of Loan Amount',
    processingFeePct: 0.50,
    maxProcessingFee: 20000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 30000,
    minCibil: 720,
    rating: 4.7,
    reviewsCount: 11200,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.bajajhousingfinance.in/home-loan',
    logoBg: '#00529b',
    highlights: ['Fastest digital disbursal process', 'Substantial top-up loan facility', 'Minimal documentation'],
    docsRequired: ['PAN & Aadhaar', '3 Months Salary Slip / ITR', '6 Months Bank Stmt', 'Property Allotment Letter'],
    pros: ['Instant online sanction letter', 'Flexible repayment tenure', 'Hassle-free top-ups']
  },
  {
    id: 'pnbhfl',
    name: 'PNB Housing Finance',
    code: 'PNBHFL',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Roshni Home Loans for Salaried & Self-Employed',
    minRate: 8.75,
    maxRate: 10.50,
    rateType: 'Floating (LHFR Linked)',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹15,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 18000,
    minCibil: 650,
    rating: 4.5,
    reviewsCount: 8900,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.pnbhousing.com/home-loan',
    logoBg: '#ed1c24',
    highlights: ['Roshni scheme for income up to ₹10k–₹30k', 'Construction & Plot loan focus', 'Higher LTV for affordable housing'],
    docsRequired: ['KYC Documents', 'Bank Statements (6 Mos)', 'Income Proof / Cash-flow Assessment', 'Property Specs'],
    pros: ['Excellent for informal income segments', 'Low CIBIL score acceptance', 'Customized loan structure']
  },
  {
    id: 'aadharhf',
    name: 'Aadhar Housing Finance',
    code: 'AADHARHF',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Affordable Housing Loans for Low & Middle Income Group',
    minRate: 9.50,
    maxRate: 11.75,
    rateType: 'Floating (AHFL PLR)',
    maxTenure: 25,
    processingFee: '1.00% to 1.50% + GST',
    processingFeePct: 1.0,
    maxProcessingFee: 25000,
    maxLTV: 80,
    prepaymentFee: 'Nil for Individuals',
    minIncome: 12000,
    minCibil: 600,
    rating: 4.4,
    reviewsCount: 5400,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://aadharhousing.com/home-loans',
    logoBg: '#1e3c72',
    highlights: ['Specially tailored for Tier 2/3/4 cities', 'Accepts cash/informal income proof', 'PMAY subsidy guidance'],
    docsRequired: ['Aadhaar & Voter ID', 'Passbook / Bank Stmt', 'Shop License / Work Proof', 'Gram Panchayat / Municipal Property Docs'],
    pros: ['Welcomes informal income borrowers', 'Simple paperwork', 'Deep regional branch footprint']
  },
  {
    id: 'homefirst',
    name: 'Home First Finance',
    code: 'HOMEFIRST',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Tech-Driven Home Loans with Auto-Prepayment App',
    minRate: 9.25,
    maxRate: 11.50,
    rateType: 'Floating Rate',
    maxTenure: 25,
    processingFee: '1.00% to 1.50% + GST',
    processingFeePct: 1.0,
    maxProcessingFee: 20000,
    maxLTV: 85,
    prepaymentFee: 'Nil (Micro-prepayments via Mobile App)',
    minIncome: 15000,
    minCibil: 620,
    rating: 4.6,
    reviewsCount: 4800,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://homefirstindia.com/home-loan/',
    logoBg: '#00a859',
    highlights: ['Micro prepayment through mobile app without penalty', 'Quick 48-hr loan approval', 'Paperless digital onboarding'],
    docsRequired: ['KYC Documents', 'Bank Passbook (6 Mos)', 'Business / Employment Evidence', 'Property Chain Papers'],
    pros: ['Innovative mobile app prepayment', 'Fast turn-around time', 'Transparent policies']
  },
  {
    id: 'canfin',
    name: 'Can Fin Homes',
    code: 'CANFIN',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Friendship with Trust — Home Loans for 3 Decades',
    minRate: 8.70,
    maxRate: 9.95,
    rateType: 'Floating Rate',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹10,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 10000,
    maxLTV: 85,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 20000,
    minCibil: 690,
    rating: 4.5,
    reviewsCount: 4200,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.canfinhomes.com/home-loans',
    logoBg: '#0072bc',
    highlights: ['Promoted by Canara Bank', 'Composite loans for site purchase and house construction', 'Affordable rates for self-employed'],
    docsRequired: ['KYC Proofs', 'IT Return copies', 'Bank statement (6 mos)', 'Approved construction plan'],
    pros: ['Strong public sector heritage', 'Low processing fee cap', 'Reliable property legal checks']
  },
  {
    id: 'tatacap',
    name: 'Tata Capital Housing',
    code: 'TATACAP',
    type: 'HFC',
    category: 'Housing Finance Company (NHB Registered)',
    tagline: 'Count on Us — Trusted Tata Brand Home Financing',
    minRate: 8.65,
    maxRate: 9.85,
    rateType: 'Floating Rate',
    maxTenure: 30,
    processingFee: '0.50% (Max ₹15,000 + GST)',
    processingFeePct: 0.50,
    maxProcessingFee: 15000,
    maxLTV: 90,
    prepaymentFee: 'Nil for Floating Rate',
    minIncome: 25000,
    minCibil: 700,
    rating: 4.7,
    reviewsCount: 9100,
    verifiedDate: '2026-08-08',
    sourceUrl: 'https://www.tatacapital.com/home-loan.html',
    logoBg: '#005587',
    highlights: ['Tata Group trust and integrity', 'Overdraft home loan options', 'Customized balance transfer rates'],
    docsRequired: ['PAN Card & Aadhaar', '3 Months Salary Slip / 2 Yrs ITR', '6 Months Bank Stmt', 'Property Allotment Stmt'],
    pros: ['Highest customer satisfaction rating', 'Quick online sanction', 'Flexible EMI payment terms']
  }
];

// Rate History Tracking
const rateHistory = [
  { lenderId: 'sbi', date: '2026-08-08', rate: 8.50, prevRate: 8.55, note: 'EBLR reduced by 5 bps' },
  { lenderId: 'hdfc', date: '2026-08-08', rate: 8.60, prevRate: 8.65, note: 'Repo linked rate aligned' },
  { lenderId: 'icici', date: '2026-08-01', rate: 8.65, prevRate: 8.70, note: 'Standard monthly review' },
  { lenderId: 'bob', date: '2026-08-05', rate: 8.40, prevRate: 8.50, note: 'BRLLR promotional discount' },
  { lenderId: 'union', date: '2026-08-04', rate: 8.35, prevRate: 8.40, note: 'Festive concession wave' }
];

// Lead & Loan Applications Store
const loanApplications = [
  {
    id: 'HL-2026-8942',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '9876543210',
    city: 'Noida',
    loanAmount: 5000000,
    tenureYears: 20,
    income: 120000,
    employment: 'Salaried',
    lenderId: 'sbi',
    lenderName: 'State Bank of India',
    statusStep: 3, // 1: Submitted, 2: Docs Pending, 3: Credit Assessment, 4: Legal Verification, 5: Technical Verification, 6: Sanctioned, 7: Disbursed
    statusText: 'Credit Assessment in Progress',
    updatedAt: '2026-08-08T18:30:00Z',
    createdAt: '2026-08-05T10:15:00Z',
    notes: 'Pre-approved income verification done. Property legal check queued.'
  },
  {
    id: 'HL-2026-1050',
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    phone: '9811223344',
    city: 'Gurgaon',
    loanAmount: 7500000,
    tenureYears: 25,
    income: 180000,
    employment: 'Salaried',
    lenderId: 'hdfc',
    lenderName: 'HDFC Bank',
    statusStep: 6,
    statusText: 'Loan Sanctioned (Sanction Letter Issued)',
    updatedAt: '2026-08-07T14:20:00Z',
    createdAt: '2026-08-02T11:00:00Z',
    notes: 'Sanction letter issued for ₹75 Lakh @ 8.60%.'
  }
];

// ─── API ENDPOINTS FOR HOME LOANS ─────────────────────────────────────────────

// GET /api/lenders - Get all lenders with optional filters
app.get('/api/lenders', (req, res) => {
  const { type, minCibil, maxRate } = req.query;
  let list = [...lenders];
  if (type) list = list.filter(l => l.type.toLowerCase() === type.toLowerCase());
  if (minCibil) list = list.filter(l => l.minCibil <= parseInt(minCibil));
  if (maxRate) list = list.filter(l => l.minRate <= parseFloat(maxRate));
  res.json({ ok: true, count: list.length, lenders: list, verifiedDate: '2026-08-08' });
});

// GET /api/lenders/:id - Get detailed lender info
app.get('/api/lenders/:id', (req, res) => {
  const lender = lenders.find(l => l.id.toLowerCase() === req.params.id.toLowerCase());
  if (!lender) return res.status(404).json({ error: 'Lender not found' });
  const history = rateHistory.filter(h => h.lenderId.toLowerCase() === lender.id.toLowerCase());
  res.json({ ok: true, lender, rateHistory: history });
});

// POST /api/loan/search - Smart Questionnaire & Matching Engine
app.post('/api/loan/search', (req, res) => {
  const { goal, monthlyIncome = 100000, existingEmi = 0, employment = 'Salaried', location = 'Noida', propertyValue = 6000000, loanRequired = 4500000, tenure = 20, creditScore = 750 } = req.body;
  
  const netIncome = Math.max(1000, monthlyIncome - existingEmi);
  const ltvPct = propertyValue > 0 ? (loanRequired / propertyValue) * 100 : 75;

  const matches = lenders.map(lender => {
    let matchScore = 80;

    // Credit score match
    if (creditScore >= lender.minCibil + 50) matchScore += 10;
    else if (creditScore < lender.minCibil) matchScore -= 25;

    // Rate competitiveness
    if (lender.minRate <= 8.50) matchScore += 8;
    else if (lender.minRate > 9.00) matchScore -= 5;

    // Income threshold
    if (monthlyIncome >= lender.minIncome * 2) matchScore += 5;
    else if (monthlyIncome < lender.minIncome) matchScore -= 20;

    // LTV threshold
    if (ltvPct > lender.maxLTV) matchScore -= 15;

    // Applicant type preference
    if (employment === 'Self-Employed' && lender.type === 'HFC') matchScore += 7;
    if (employment === 'Salaried' && lender.type === 'Bank') matchScore += 5;

    matchScore = Math.min(99, Math.max(40, matchScore));

    // Calculate sample EMI & Total Loan Cost Score
    const r = lender.minRate / 12 / 100;
    const n = tenure * 12;
    const emi = loanRequired * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalInterest = (emi * n) - loanRequired;
    const pFee = Math.min(lender.maxProcessingFee || 15000, loanRequired * (lender.processingFeePct / 100));
    const totalCost = totalInterest + pFee;

    let matchReason = '';
    if (matchScore >= 90) matchReason = `Top match! Low ${lender.minRate}% starting rate, strong approval odds for your ${creditScore} CIBIL.`;
    else if (matchScore >= 80) matchReason = `High match. Flexible tenure options up to ${lender.maxTenure} yrs and low processing fee.`;
    else matchReason = `Good alternative. Suitable for ${employment} profile with verified doorstep service.`;

    return {
      lender,
      matchScore,
      matchReason,
      estEmi: Math.round(emi),
      estTotalInterest: Math.round(totalInterest),
      processingFeeEst: Math.round(pFee),
      totalCostScore: Math.round(totalCost)
    };
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    ok: true,
    inputSummary: { goal, netIncome, loanRequired, tenure, ltvPct: Math.round(ltvPct), creditScore },
    matches
  });
});

// POST /api/lead/apply - Submit loan application / query
app.post('/api/lead/apply', (req, res) => {
  const { name, email, phone, city, loanAmount, tenureYears, income, employment, lenderId } = req.body;
  if (!name || !phone || !loanAmount) {
    return res.status(400).json({ error: 'Name, phone, and loan amount are required.' });
  }

  const selectedLender = lenders.find(l => l.id === lenderId) || lenders[0];
  const appId = 'HL-2026-' + Math.floor(1000 + Math.random() * 9000);

  const newApp = {
    id: appId,
    name,
    email: email || 'N/A',
    phone,
    city: city || 'Noida',
    loanAmount: parseInt(loanAmount),
    tenureYears: parseInt(tenureYears || 20),
    income: parseInt(income || 100000),
    employment: employment || 'Salaried',
    lenderId: selectedLender.id,
    lenderName: selectedLender.name,
    statusStep: 1,
    statusText: 'Application Submitted & Awaiting Verification Call',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    notes: 'Application received via FinCalc Pro platform.'
  };

  loanApplications.unshift(newApp);

  res.json({
    ok: true,
    applicationId: appId,
    message: 'Application submitted successfully! Save your Application ID to track status live.',
    app: newApp
  });
});

// GET /api/lead/track/:id - Track loan application status
app.get('/api/lead/track/:id', (req, res) => {
  const appItem = loanApplications.find(a => a.id.toUpperCase() === req.params.id.toUpperCase().trim());
  if (!appItem) return res.status(404).json({ error: 'Application ID not found. Please check your ID.' });

  const steps = [
    { step: 1, label: 'Application Submitted', desc: 'Your details were successfully registered in our platform.' },
    { step: 2, label: 'Documents Pending', desc: 'KYC, Income statements, and property documents collection.' },
    { step: 3, label: 'Credit Assessment', desc: 'FOIR verification & underwriter credit risk evaluation.' },
    { step: 4, label: 'Legal Verification', desc: 'Property title search & legal vetting by advocate.' },
    { step: 5, label: 'Technical Verification', desc: 'Physical inspection & valuation of property.' },
    { step: 6, label: 'Loan Sanctioned', desc: 'Sanction letter generated with approved loan amount & interest rate.' },
    { step: 7, label: 'Disbursed', desc: 'Loan agreement signed and funds released to builder/seller.' }
  ];

  res.json({ ok: true, app: appItem, stages: steps });
});

// POST /api/admin/leads/status - Admin update lead status
app.post('/api/admin/leads/status', requireAdmin, (req, res) => {
  const { applicationId, statusStep, notes } = req.body;
  const appItem = loanApplications.find(a => a.id.toUpperCase() === (applicationId || '').toUpperCase().trim());
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  const stepLabels = [
    '',
    'Application Submitted',
    'Documents Pending Verification',
    'Credit Assessment in Progress',
    'Legal Title Search Verification',
    'Technical Valuation in Progress',
    'Loan Sanctioned (Sanction Letter Issued)',
    'Disbursed & Closed'
  ];

  const stepNum = Math.min(7, Math.max(1, parseInt(statusStep)));
  appItem.statusStep = stepNum;
  appItem.statusText = stepLabels[stepNum];
  if (notes) appItem.notes = notes;
  appItem.updatedAt = new Date().toISOString();

  res.json({ ok: true, app: appItem });
});

// POST /api/admin/lenders/update - Admin update lender rate
app.post('/api/admin/lenders/update', requireAdmin, (req, res) => {
  const { lenderId, minRate, maxRate, processingFee, verifiedDate } = req.body;
  const lender = lenders.find(l => l.id === lenderId);
  if (!lender) return res.status(404).json({ error: 'Lender not found' });

  if (typeof minRate === 'number') {
    rateHistory.unshift({ lenderId: lender.id, date: new Date().toISOString().split('T')[0], rate: minRate, prevRate: lender.minRate, note: 'Updated via Admin' });
    lender.minRate = minRate;
  }
  if (typeof maxRate === 'number') lender.maxRate = maxRate;
  if (processingFee) lender.processingFee = processingFee;
  lender.verifiedDate = verifiedDate || new Date().toISOString().split('T')[0];

  res.json({ ok: true, lender });
});

// ─── Market Base Values ───────────────────────────────────────────────────────
const base = {
  nifty:    { value: 24853.15, open: 24780.00, high: 24920.60, low: 24710.30, prev: 24725.75 },
  sensex:   { value: 81463.09, open: 81520.00, high: 81780.00, low: 81200.00, prev: 81506.29 },
  bankNifty:{ value: 53420.80, open: 53300.00, high: 53650.00, low: 53100.00, prev: 53250.00 },
  niftyIT:  { value: 40125.50, open: 40000.00, high: 40300.00, low: 39850.00, prev: 39980.00 },
  gold24k:  { value: 9420,  prev: 9395 },
  gold22k:  { value: 8635,  prev: 8612 },
  gold20k:  { value: 7850,  prev: 7830 },
  gold18k:  { value: 7065,  prev: 7048 },
  silver:   { value: 105.50, prev: 104.80 },
  platinum: { value: 2950,   prev: 2930 }
};

// Sparkline history (last 30 ticks)
const hist = { nifty: [], sensex: [], bankNifty: [], niftyIT: [], gold: [] };
Object.keys(hist).forEach(k => {
  const src = k === 'gold' ? base.gold24k : base[k];
  for (let i = 0; i < 30; i++) hist[k].push(+(src.value + (Math.random() - 0.5) * src.value * 0.002).toFixed(2));
});

function rw(v, vol = 0.0004) { return +(v + v * vol * (Math.random() - 0.5) * 2).toFixed(2); }

function buildPayload() {
  return {
    type: 'market',
    ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    indices: {
      nifty:     { label:'Nifty 50',   exchange:'NSE', color:'blue',   ...snapIdx('nifty',   0.0005), spark:[...hist.nifty]    },
      sensex:    { label:'Sensex',     exchange:'BSE', color:'orange',  ...snapIdx('sensex',  0.0005), spark:[...hist.sensex]   },
      bankNifty: { label:'Bank Nifty', exchange:'NSE', color:'purple', ...snapIdx('bankNifty',0.0006), spark:[...hist.bankNifty]},
      niftyIT:   { label:'Nifty IT',   exchange:'NSE', color:'teal',   ...snapIdx('niftyIT', 0.0007), spark:[...hist.niftyIT]  }
    },
    gold: {
      g24: base.gold24k.value, g22: base.gold22k.value, g20: base.gold20k.value, g18: base.gold18k.value,
      g24_10: base.gold24k.value * 10, g22_10: base.gold22k.value * 10,
      ch24:  +(base.gold24k.value - base.gold24k.prev).toFixed(0),
      chp24: +((base.gold24k.value - base.gold24k.prev) / base.gold24k.prev * 100).toFixed(2),
      silver: base.silver.value, platinum: base.platinum.value,
      spark: [...hist.gold]
    }
  };
}

function snapIdx(key, vol) {
  base[key].value = rw(base[key].value, vol);
  if (base[key].value > base[key].high) base[key].high = base[key].value;
  if (base[key].value < base[key].low)  base[key].low  = base[key].value;
  hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].push(base[key].value);
  if (hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].length > 30)
    hist[key === 'nifty' ? 'nifty' : key === 'sensex' ? 'sensex' : key === 'bankNifty' ? 'bankNifty' : 'niftyIT'].shift();
  return {
    value: base[key].value,
    change: +(base[key].value - base[key].prev).toFixed(2),
    changePct: +((base[key].value - base[key].prev) / base[key].prev * 100).toFixed(2),
    open: base[key].open, high: base[key].high, low: base[key].low, prev: base[key].prev
  };
}

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(json); });
}

// Update gold with nifty (linked)
setInterval(() => {
  base.gold24k.value = rw(base.gold24k.value, 0.0002);
  base.gold22k.value = +(base.gold24k.value * 0.9167).toFixed(0);
  base.gold20k.value = +(base.gold24k.value * 0.8333).toFixed(0);
  base.gold18k.value = +(base.gold24k.value * 0.75).toFixed(0);
  base.silver.value  = rw(base.silver.value, 0.0008);
  base.platinum.value= rw(base.platinum.value, 0.0004);
  hist.gold.push(base.gold24k.value);
  if (hist.gold.length > 30) hist.gold.shift();
  broadcast(buildPayload());
}, 3000);

wss.on('connection', ws => {
  console.log('[WS] Client connected');
  ws.send(JSON.stringify(buildPayload()));
  ws.on('close', () => console.log('[WS] Client disconnected'));
  ws.on('error', console.error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅  FinCalc Pro  →  http://localhost:${PORT}`);
  console.log(`📡  WebSocket    →  ws://localhost:${PORT}/ws`);
  console.log(`📊  Broadcasting live market data every 3s\n`);
});
