/* ══════════════════════════════════════════════════
   FinCalc Pro — Blog Module
   Renders the Blog page with articles, filters,
   category tags, and article modal viewer.
   ══════════════════════════════════════════════════ */

/* ─ Default articles (hardcoded) ── */
const BLOG_ARTICLES_DEFAULT = [
  {
    id: 1, category: "Home Loan", icon: "🏠", readTime: "5 min",
    date: "Aug 20, 2026",
    title: "Home Loan EMI vs Rent: Which Is Smarter in 2026?",
    excerpt: "Should you buy or rent in today's interest rate environment? We crunch the numbers on EMI affordability, opportunity cost, and property appreciation to help you decide.",
    content: `<h2>The Buy vs. Rent Debate in 2026</h2>
<p>With home loan rates hovering between 8.5–9.5% p.a. and property prices surging 10–15% in metros, the classic buy vs. rent question is more relevant than ever.</p>
<h3>The EMI Perspective</h3>
<p>On a ₹50L loan at 9% p.a. for 20 years, the EMI is approximately ₹44,986 per month. A comparable rental in the same locality might be ₹20,000–₹25,000/month. However, this simple comparison ignores the equity you build through EMI payments.</p>
<h3>The Opportunity Cost</h3>
<p>The ₹10L down payment, if invested in equity mutual funds at 12% CAGR for 20 years, could grow to ₹96.5L. This opportunity cost must be factored into your decision.</p>
<h3>The Right Answer</h3>
<p>If you plan to stay in the same city for 7+ years, owning a home is generally better. For shorter horizons or if you're in a high-cost metro, renting and investing the difference can be more financially optimal.</p>
<p>Use our <a href="#" onclick="openCalc('home-loan');return false;">Home Loan EMI Calculator</a> to plan your purchase today.</p>`
  },
  {
    id: 2, category: "Investment", icon: "📈", readTime: "4 min",
    date: "Aug 18, 2026",
    title: "SIP Step-Up Strategy: How ₹5,000/Month Can Become ₹2 Crore",
    excerpt: "The annual step-up SIP strategy is one of the most powerful wealth-building techniques. Learn how increasing your SIP by just 10% each year can exponentially grow your corpus.",
    content: `<h2>The Magic of Step-Up SIP</h2>
<p>Most people start a SIP and forget to increase it as their income grows. This is a costly mistake.</p>
<h3>Regular SIP vs Step-Up SIP</h3>
<p>Starting ₹5,000/month at 12% CAGR for 25 years: Regular SIP gives ₹94.9L. A 10% annual step-up SIP with the same starting amount gives ₹2.02 Crore — over 2x the corpus!</p>
<h3>How Step-Up Works</h3>
<p>Year 1: ₹5,000/month → Year 2: ₹5,500/month → Year 3: ₹6,050/month... and so on.</p>
<h3>Practical Implementation</h3>
<p>Most mutual fund apps allow you to set up annual step-up automatically. Schedule the increase in April when salaries typically rise.</p>
<p>Use our <a href="#" onclick="openCalc('sip');return false;">SIP Calculator</a> to plan your investment strategy.</p>`
  },
  {
    id: 3, category: "Gold", icon: "🥇", readTime: "3 min",
    date: "Aug 15, 2026",
    title: "Gold Loan vs Personal Loan: Which Should You Choose?",
    excerpt: "Gold loans offer lower interest rates and faster processing, while personal loans give you unsecured access to funds. Here's how to decide based on your situation.",
    content: `<h2>Gold Loan vs Personal Loan: A Comparison</h2>
<p>When you need urgent funds, two popular options are gold loans and personal loans.</p>
<h3>Interest Rate Comparison</h3>
<p>Gold loans from banks: 8.5–18% p.a. | Personal loans: 10.5–24% p.a. from banks.</p>
<h3>Processing Time</h3>
<p>Gold loan: Within 30 minutes to a few hours. Personal loan: 1–7 working days.</p>
<h3>Verdict</h3>
<p>Choose gold loan if you have gold to pledge and need funds urgently. Choose personal loan if you don't want to pledge assets.</p>
<p>Calculate your gold loan amount with our <a href="#" onclick="openCalc('gold-loan');return false;">Gold Loan Calculator</a>.</p>`
  },
  {
    id: 4, category: "Tax", icon: "📋", readTime: "6 min",
    date: "Aug 12, 2026",
    title: "Complete Guide to Home Loan Tax Benefits Under Section 24 & 80C",
    excerpt: "Home loan borrowers can save significant tax under Section 24(b) for interest deduction and Section 80C for principal deduction. Here's everything you need to know.",
    content: `<h2>Home Loan Tax Benefits: Maximize Your Savings</h2>
<p>A home loan offers dual tax benefits that can save you ₹1.5–2L+ in taxes each year.</p>
<h3>Section 24(b): Interest Deduction</h3>
<p>You can deduct up to ₹2L of home loan interest per year on a self-occupied property.</p>
<h3>Section 80C: Principal Deduction</h3>
<p>Home loan principal repayment qualifies for 80C deduction within the ₹1.5L limit.</p>
<h3>Section 80EEA: Additional Deduction</h3>
<p>First-time buyers for property up to ₹45L can claim additional ₹1.5L under Section 80EEA.</p>
<h3>Tax Saving Example</h3>
<p>In the 30% tax bracket, saving ₹2L on 24(b) + ₹1.5L on 80C saves approximately ₹1.05L annually.</p>`
  },
  {
    id: 5, category: "Mutual Funds", icon: "📊", readTime: "4 min",
    date: "Aug 10, 2026",
    title: "FD vs Debt Mutual Fund: Where to Park Your Emergency Fund?",
    excerpt: "Fixed Deposits are safe but tax-inefficient. Debt mutual funds offer better post-tax returns with similar safety. Here's a detailed comparison for your short-term money.",
    content: `<h2>FD vs Debt Mutual Fund: The Smart Choice for Savings</h2>
<p>For your emergency fund and short-term savings, FD and debt mutual funds differ significantly in taxation and flexibility.</p>
<h3>Returns Comparison</h3>
<p>Bank FD: 6.5–8% p.a. | Liquid/Ultra-short debt funds: 6.5–7.5% p.a.</p>
<h3>Taxation Difference</h3>
<p>FD interest is fully taxable at your slab. Debt funds held 3+ years get indexation benefit.</p>
<h3>Recommendation</h3>
<p>Keep 2 months' expenses in liquid fund, 2 months in FD. This maximizes post-tax returns while maintaining liquidity.</p>
<p>Calculate your FD returns using our <a href="#" onclick="openCalc('fd');return false;">FD Calculator</a>.</p>`
  },
  {
    id: 6, category: "Retirement", icon: "👴", readTime: "7 min",
    date: "Aug 5, 2026",
    title: "How Much Should You Save for Retirement? The 25x Rule Explained",
    excerpt: "The 25x rule (also called the 4% withdrawal rule) is the most widely-used formula for calculating retirement corpus. Here's how to apply it to Indian conditions.",
    content: `<h2>The 25x Rule: Your Retirement Number</h2>
<p>The 25x rule states you need 25 times your annual retirement expenses as your corpus. This allows 4% annual withdrawal which sustains the portfolio indefinitely.</p>
<h3>Applying to India</h3>
<p>Monthly expense at retirement: ₹80,000 → Annual: ₹9.6L → Required corpus: ₹9.6L × 25 = ₹2.4Cr.</p>
<h3>The Real Challenge: Inflation</h3>
<p>If you retire in 25 years, today's ₹80,000/month expense will be ₹3.4L/month at 6% inflation. Corpus target becomes ₹12.24 Crore!</p>
<h3>How to Build This Corpus</h3>
<p>Starting at 30, investing ₹25,000/month in equity funds at 12% CAGR for 30 years grows to ₹8.7Cr.</p>
<p>Use our <a href="#" onclick="openCalc('retirement');return false;">Retirement Planner</a> to calculate your exact corpus need.</p>`
  }
];

let currentBlogFilter = 'All';
/* ─ Active article list — rebuilt fresh every renderBlog() call ── */
let _activeBlogArticles = [];

function _buildArticleList() {
  const list = [...BLOG_ARTICLES_DEFAULT];
  try {
    const adminArticles = JSON.parse(localStorage.getItem('fincalc_blog') || '[]');
    // Prepend admin articles (newest first)
    adminArticles.forEach((a, i) => {
      list.unshift({
        ...a,
        id: 'admin_' + i,           // unique string ID — always quoted in onclick
        icon: a.icon || '📰',
        readTime: a.readTime || '3 min',
      });
    });
  } catch(e) {}
  return list;
}

function renderBlog() {
  _activeBlogArticles = _buildArticleList();
  const categories = ['All', ...new Set(_activeBlogArticles.map(a => a.category))];

  document.getElementById('appMain').innerHTML = `
    <div class="blog-page">
      <!-- Header -->
      <div class="calc-banner" style="background:linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%);margin-bottom:28px">
        <div class="calc-banner-left">
          <h1>📰 FinCalc Pro Blog</h1>
          <p>Expert insights on personal finance, investment, and smart money management</p>
        </div>
        <button class="calc-banner-back" onclick="goBack()">← Back</button>
      </div>

      <!-- Category Filters -->
      <div class="blog-filters" id="blogFilters">
        ${categories.map(c => `
          <button class="blog-filter-btn${c === currentBlogFilter ? ' active' : ''}"
            onclick="filterBlog('${c}')">${c}</button>
        `).join('')}
      </div>

      <!-- Articles Grid -->
      <div class="blog-grid" id="blogGrid">
        ${renderBlogCards()}
      </div>
    </div>

    <!-- Article Modal -->
    <div class="blog-modal-overlay" id="blogModal" onclick="if(event.target===this)closeBlogModal()">
      <div class="blog-modal-box">
        <button class="blog-modal-close" onclick="closeBlogModal()">✕</button>
        <div class="blog-modal-body" id="blogModalBody"></div>
      </div>
    </div>
  `;
}

function renderBlogCards() {
  const filtered = currentBlogFilter === 'All'
    ? _activeBlogArticles
    : _activeBlogArticles.filter(a => a.category === currentBlogFilter);

  if (filtered.length === 0) {
    return `<div class="blog-empty">No articles in this category yet.</div>`;
  }

  return filtered.map(a => `
    <div class="blog-card" onclick="openBlogArticle('${a.id}')">
      <div class="blog-card-header">
        <span class="blog-cat-badge">${a.category}</span>
        <span class="blog-read-time">⏱ ${a.readTime} read</span>
      </div>
      <div class="blog-card-icon">${a.icon || '📰'}</div>
      <h3 class="blog-card-title">${a.title}</h3>
      <p class="blog-card-excerpt">${a.excerpt}</p>
      <div class="blog-card-footer">
        <span class="blog-date">📅 ${a.date}</span>
        <span class="blog-read-link">Read More →</span>
      </div>
    </div>
  `).join('');
}

function filterBlog(category) {
  currentBlogFilter = category;
  document.querySelectorAll('.blog-filter-btn').forEach(b => {
    b.classList.toggle('active', b.textContent === category);
  });
  const grid = document.getElementById('blogGrid');
  if (grid) grid.innerHTML = renderBlogCards();
}

function openBlogArticle(id) {
  // IDs can be numeric (1–6) or string ('admin_0', 'admin_1' etc.)
  // Use loose equality (==) so "1" == 1 works for defaults
  const article = _activeBlogArticles.find(a => String(a.id) === String(id));
  if (!article) return;

  const modal = document.getElementById('blogModal');
  const body  = document.getElementById('blogModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="blog-modal-header">
      <span class="blog-cat-badge">${article.category}</span>
      <span class="blog-read-time">⏱ ${article.readTime} read · ${article.date}</span>
    </div>
    <h1 class="blog-modal-title">${article.title}</h1>
    <div class="blog-modal-content">${article.content || '<p>' + article.excerpt + '</p>'}</div>
  `;
  modal.classList.add('open');
}

function closeBlogModal() {
  document.getElementById('blogModal')?.classList.remove('open');
}

