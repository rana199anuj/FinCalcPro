/* ══════════════════════════════════════════════════
   FinCalc Pro — FAQ Data Repository
   Comprehensive FAQs for all calculators.
   Managed from Admin Panel via localStorage.
   ══════════════════════════════════════════════════ */

const CALC_FAQS = {
  "home-loan": [
    { q: "What is an EMI?", a: "EMI (Equated Monthly Instalment) is the fixed monthly amount you pay to repay a loan. It includes both the principal and interest components. The ratio of principal to interest changes each month." },
    { q: "How is Home Loan EMI calculated?", a: "EMI = P × r × (1+r)^n / ((1+r)^n – 1), where P = Principal Loan Amount, r = Monthly Interest Rate (Annual Rate ÷ 12 ÷ 100), and n = Loan Tenure in Months." },
    { q: "What is the Processing Fee?", a: "Processing fee is a one-time charge levied by the bank to process your home loan application. It typically ranges from 0.25% to 1% of the loan amount and is paid upfront." },
    { q: "What does prepayment do to my loan?", a: "Making annual prepayments reduces your outstanding principal, which reduces both the total interest paid and can shorten your loan tenure significantly, saving you lakhs in the long run." },
    { q: "What interest rate should I use?", a: "Use the interest rate offered by your bank. In India, home loan rates currently range from 8.35% to 9.5% p.a. Compare rates from SBI, HDFC, ICICI, and Axis Bank using our Compare Bank EMI tool." }
  ],
  "home-eligibility": [
    { q: "What is FOIR?", a: "FOIR stands for Fixed Obligation to Income Ratio. Banks typically allow up to 40–50% of your monthly income to go towards EMI payments. This is the primary criterion for determining your loan eligibility." },
    { q: "How much home loan am I eligible for?", a: "Your eligibility is based on your net monthly income, existing EMI obligations, credit score, age, and the bank's FOIR norms. Use 50% of income as a safe estimate for EMI capacity." },
    { q: "What income is considered for home loan eligibility?", a: "Banks consider your gross salary, net take-home pay, income tax returns (for self-employed), rental income, and other documented income sources." },
    { q: "How do existing EMIs reduce eligibility?", a: "Any existing loan EMIs (car, personal, education) reduce your available EMI capacity. The formula used is: Available EMI = (50% × Income) – Existing EMIs." },
    { q: "Does a co-applicant increase eligibility?", a: "Yes. Adding a co-applicant (spouse, parent, or sibling) combines both incomes, which significantly increases your home loan eligibility and can help secure a larger loan." }
  ],
  "home-affordability": [
    { q: "How does the affordability calculator work?", a: "It calculates the maximum home you can afford based on your income, down payment, interest rate, and tenure. It uses 40% of monthly income as the maximum safe EMI and adds your available down payment to compute the affordable home price." },
    { q: "What is a down payment?", a: "Down payment is the amount you pay upfront from your own savings. Banks finance only 75–90% of the property value; the remaining 10–25% must come from you." },
    { q: "How much down payment is recommended?", a: "A minimum of 20% down payment is recommended. A higher down payment means a lower loan amount, lower EMI, and less total interest paid over the loan tenure." },
    { q: "What should my EMI-to-income ratio be?", a: "Financial advisors recommend keeping your total EMI outflow below 40% of your gross monthly income to maintain a healthy cash flow for other expenses and savings." },
    { q: "What is a good home price in India?", a: "A safe thumb rule is that the total home price should not exceed 4–5 times your annual gross income. So if your annual income is ₹12L, a home worth ₹48–60L is considered affordable." }
  ],
  "home-balance-transfer": [
    { q: "What is a Home Loan Balance Transfer?", a: "Balance transfer means shifting your existing home loan from one bank to another that offers a lower interest rate. This can reduce your EMI or shorten your tenure, saving significant interest." },
    { q: "When should I consider a balance transfer?", a: "Consider a transfer when the new rate is at least 0.5–1% lower than your current rate, and you have more than 5 years of tenure remaining. The savings must outweigh the transfer costs." },
    { q: "What are the costs involved in balance transfer?", a: "Costs typically include processing fee at the new bank (0.5–1%), pre-payment charges at the existing bank (usually nil for floating rate loans), legal fees, and stamp duty." },
    { q: "How much can I save with balance transfer?", a: "If your outstanding loan is ₹25L at 9.5% with 15 years remaining, switching to 8.5% saves approximately ₹1,500/month and over ₹2.7L in total interest." },
    { q: "Is balance transfer good for short remaining tenure?", a: "No. If you have only 3–4 years of tenure left, most of your EMI is already principal. A balance transfer only benefits if you have a long remaining tenure (5+ years)." }
  ],
  "loan-to-value": [
    { q: "What is Loan to Value (LTV) Ratio?", a: "LTV ratio is the percentage of the property value that a bank will finance as a loan. For example, an LTV of 80% on a ₹50L property means the bank gives ₹40L and you pay ₹10L as down payment." },
    { q: "What LTV do Indian banks offer?", a: "As per RBI guidelines: Up to 80% LTV for loans up to ₹30L, up to 75% for loans between ₹30L–₹75L, and up to 75% for loans above ₹75L." },
    { q: "Why does LTV matter?", a: "A lower LTV reduces the bank's risk, often translating into better interest rates. A higher LTV means you borrow more, which increases your total interest payment." },
    { q: "What is a good LTV ratio?", a: "Below 75% is considered excellent and earns the best rates. Between 76–80% is good and acceptable. Above 85% is considered risky and may attract higher rates or get rejected." },
    { q: "Does LTV affect home loan approval?", a: "Yes. A lower LTV improves your chances of loan approval. Banks are also more flexible on interest rates and other terms when the LTV is below 75%." }
  ],
  "compare-bank": [
    { q: "Why should I compare bank EMIs?", a: "Even a 0.5% difference in interest rate on a ₹30L loan over 20 years can result in ₹1.5–2L difference in total interest paid. Comparing banks helps you find the most cost-effective option." },
    { q: "Which bank has the lowest home loan rate in 2024?", a: "SBI, Canara Bank, and Bank of Baroda typically offer the lowest rates. HDFC, ICICI, and Axis are competitive too. Rates vary by applicant profile and credit score." },
    { q: "What factors beyond rate should I compare?", a: "Compare processing fees, prepayment charges, part-payment flexibility, turnaround time, branch network, and customer service — not just the interest rate." },
    { q: "What is the difference between fixed and floating rates?", a: "Fixed rates remain constant for the loan tenure; floating rates change with market conditions (repo rate). In India, floating rate loans are more common and generally cheaper long-term." },
    { q: "Should I choose the lowest EMI bank?", a: "Not necessarily. Sometimes a slightly higher EMI from a bank with no prepayment charges can save more money in the long run if you plan to make lump-sum prepayments." }
  ],
  "loan-against-property": [
    { q: "What is a Loan Against Property (LAP)?", a: "LAP is a secured loan where you pledge your residential or commercial property as collateral to borrow funds. The loan amount is typically 60–80% of the property's market value." },
    { q: "What is the LTV for Loan Against Property?", a: "Banks typically offer 55–75% LTV for LAP on residential properties and 50–65% on commercial properties. Our calculator uses 80% as per updated RBI guidelines for residential property." },
    { q: "What are the typical interest rates for LAP?", a: "LAP interest rates typically range from 9.5–14% p.a. They are higher than home loan rates but lower than personal loan rates, as the property secures the loan." },
    { q: "How is the loan amount calculated in LAP?", a: "Loan Amount = Property Market Value × LTV Ratio. For example, a ₹80L property with 75% LTV gives a maximum loan of ₹60L." },
    { q: "Can I use a LAP for any purpose?", a: "Yes. LAP can be used for business expansion, education, medical emergencies, debt consolidation, or any personal/professional need without restriction." }
  ],
  "car-loan": [
    { q: "What is the typical Car Loan EMI calculation?", a: "Car Loan EMI = P × r × (1+r)^n / ((1+r)^n – 1), where P is loan amount, r is monthly rate (annual ÷ 12 ÷ 100), and n is tenure in months." },
    { q: "What down payment is required for a car loan?", a: "Most banks finance 80–90% of the on-road car price. You need to arrange 10–20% as down payment. A higher down payment lowers EMI and total interest paid." },
    { q: "What tenure is best for car loans?", a: "5–7 years is the most common tenure. Shorter tenure means higher EMI but less total interest. As cars depreciate quickly, keeping tenure under 5 years is financially advisable." },
    { q: "What is a good interest rate for car loans?", a: "Car loan rates in India range from 8.75–13% p.a. New cars attract lower rates than used cars. Public sector banks generally offer lower rates than NBFCs." },
    { q: "Is there a penalty for early repayment of car loans?", a: "Floating rate car loans have no prepayment charges as per RBI guidelines. Fixed rate loans may have a 2–5% prepayment penalty. Always check before making prepayments." }
  ],
  "two-wheeler": [
    { q: "How is Two-Wheeler Loan EMI calculated?", a: "EMI = P × r × (1+r)^n / ((1+r)^n – 1). For a ₹1L loan at 10.5% p.a. for 7 years, the EMI is approximately ₹1,663 per month." },
    { q: "What is the maximum tenure for a two-wheeler loan?", a: "Most banks offer two-wheeler loans for a maximum tenure of 5–7 years. Longer tenures reduce monthly EMI but increase total interest paid." },
    { q: "What is the maximum loan amount for a two-wheeler?", a: "Banks typically finance up to 90% of the on-road price of the two-wheeler. The maximum loan can go up to ₹5L for premium motorcycles." },
    { q: "What interest rate do two-wheeler loans attract?", a: "Two-wheeler loan interest rates typically range from 9.7% to 24% p.a. Rates depend on the lender, your credit score, vehicle type, and down payment amount." },
    { q: "Can I prepay a two-wheeler loan?", a: "Yes. For floating rate loans, RBI prohibits prepayment penalties. For fixed rate loans, you may be charged 2–5% of the prepaid amount. Always check with your lender." }
  ],
  "education-loan": [
    { q: "What is a moratorium period in an education loan?", a: "The moratorium period is the time between loan disbursement and the start of EMI repayment — typically the course duration plus 6–12 months. Interest may still accrue during this period." },
    { q: "How is interest calculated during the moratorium?", a: "During moratorium, simple interest accumulates on the disbursed amount. This interest is added to the principal (capitalized) when repayment begins, increasing the effective loan amount." },
    { q: "What is the maximum education loan amount?", a: "For studies in India, loans up to ₹4L need no collateral. Up to ₹7.5L requires a guarantor. Above ₹7.5L requires collateral security like property or FD." },
    { q: "Are there tax benefits on education loan interest?", a: "Yes. Under Section 80E of Income Tax Act, you can claim a deduction on the entire interest paid on an education loan for up to 8 years from the year you start repaying." },
    { q: "What is the typical education loan interest rate?", a: "Government bank education loan rates range from 8.5–11% p.a. Private banks and NBFCs may charge 11–15% p.a. Government schemes like Vidya Lakshmi offer subsidized rates." }
  ],
  "gold-loan": [
    { q: "How is the Gold Loan amount calculated?", a: "Gold Loan Amount = Net Weight of Pure Gold × Live Market Rate × LTV (75%). The RBI mandates a maximum LTV of 75% for gold loans from banks. Bank of Baroda follows this standard." },
    { q: "How does gold purity affect the loan amount?", a: "Higher karat gold means more pure gold and higher valuation. 24K (99.9%) gives the maximum loan amount. 22K (91.7%), 20K (83.3%), and 18K (75.0%) give proportionally lower amounts." },
    { q: "What is the current Live Gold Rate used?", a: "Our calculator uses the real-time MCX gold rate fetched via our live data feed. The rate updates every 3 seconds and reflects the current market price per gram for 24K gold." },
    { q: "What is the typical gold loan interest rate?", a: "Gold loan interest rates from banks like Bank of Baroda, SBI, HDFC range from 8.5% to 18% p.a. NBFCs like Manappuram and Muthoot typically charge 12–26% p.a." },
    { q: "What happens if I cannot repay the gold loan?", a: "If you default on repayment, the lender has the right to auction your pledged gold jewellery after giving a notice period. You will receive the excess amount (if any) after recovering the loan dues." }
  ],
  "credit-card": [
    { q: "Why does credit card debt grow so fast?", a: "Credit card interest rates are very high — typically 30–42% p.a. If you pay only the minimum due each month, you will be paying mostly interest and the principal barely reduces." },
    { q: "What is the minimum payment trap?", a: "Banks allow you to pay just 5% of outstanding balance as minimum due. However, interest continues to compound on the remaining 95%, making it extremely expensive over time." },
    { q: "How is credit card interest calculated?", a: "Interest is calculated daily on the outstanding balance using the monthly rate (Annual Rate ÷ 12). This compounds monthly, making the effective annual rate (EAR) even higher than the stated rate." },
    { q: "What is the fastest way to pay off credit card debt?", a: "Pay as much above the minimum payment as possible each month. Consider a balance transfer to a 0% interest card, or take a personal loan at a lower rate to clear the credit card balance." },
    { q: "Does increasing monthly payment significantly help?", a: "Yes, dramatically. On a ₹1L balance at 36% p.a., paying ₹5,000/month clears the debt in 25 months paying ₹24,000 interest. Paying ₹10,000/month clears it in 11 months paying only ₹9,500 interest." }
  ],
  "consumer-durable": [
    { q: "What is a Consumer Durable Loan?", a: "It is a loan to purchase electronics, home appliances, furniture, or gadgets. Banks and finance companies offer these at 0% EMI or low-interest schemes typically for 3–24 months." },
    { q: "Is 0% EMI truly free?", a: "Not always. The product price may be marked up at 0% EMI versus cash purchase. The difference is effectively the interest cost. Compare the cash price vs total EMI amount to know the true cost." },
    { q: "What documentation is required?", a: "Typically: identity proof, address proof, and income proof (3 months' salary slips or bank statement). Some lenders allow pre-approved loans on your credit card for quick processing at the store." },
    { q: "What is the typical loan tenure?", a: "Consumer durable loans are short-term — typically 3 to 24 months. 12 months is the most popular tenure for mid-range products like phones, laptops, and home appliances." },
    { q: "Are there prepayment charges?", a: "Most consumer durable loans from banks have no prepayment charges. NBFCs may charge 2–4% on the outstanding principal. Always check the loan agreement before making early payments." }
  ],
  "sip": [
    { q: "What is a SIP?", a: "SIP (Systematic Investment Plan) is a method of investing a fixed amount in mutual funds at regular intervals (monthly, quarterly). It allows you to invest small amounts consistently and benefit from rupee cost averaging." },
    { q: "How is SIP return calculated?", a: "SIP Maturity = P × ((1+r)^n – 1) / r × (1+r), where P = monthly investment, r = monthly return rate (annual rate ÷ 12 ÷ 100), and n = total months. This is the future value of an annuity due formula." },
    { q: "What is rupee cost averaging?", a: "When you invest a fixed amount monthly, you buy more units when prices are low and fewer when prices are high. Over time, this averages out your purchase cost, reducing the impact of market volatility." },
    { q: "What annual return is realistic for SIP in equity funds?", a: "Historical average returns for large-cap equity mutual funds in India range from 10–14% CAGR over 10+ year periods. However, past returns do not guarantee future performance." },
    { q: "Is SIP better than lumpsum investment?", a: "SIP is better for salaried investors as it requires smaller regular amounts and reduces timing risk. Lumpsum is better if you have a large sum and can invest during market corrections." }
  ],
  "gold-sip": [
    { q: "What is Gold SIP?", a: "Gold SIP is a systematic investment plan where you invest a fixed monthly amount into gold. Each month's investment purchases gold at the prevailing market rate. It combines the discipline of SIP with gold's store of value." },
    { q: "How is Gold SIP calculated?", a: "Total Gold Accumulated = Σ (Monthly Investment ÷ Gold Rate per gram each month). The maturity value is calculated using SIP compound growth formula with the expected gold return rate, while the gram accumulation tracks physical gold quantity." },
    { q: "What return should I expect from Gold SIP?", a: "Gold has historically given 10–12% CAGR over 10+ year periods in India. However, it can be volatile year-to-year. Gold SIP works best as a portfolio diversifier rather than a primary investment." },
    { q: "What is the minimum investment in Gold SIP?", a: "You can start Gold SIP with as little as ₹100–500 per month through digital gold platforms or Sovereign Gold Bond schemes. Our calculator works for any monthly amount." },
    { q: "What is Sovereign Gold Bond (SGB)?", a: "SGB is a government-backed gold investment that gives you 2.5% additional annual interest on top of gold price appreciation. It has a fixed 8-year tenure with a 5-year exit window, making it tax-efficient." }
  ],
  "lumpsum": [
    { q: "What is lumpsum investment?", a: "Lumpsum investment means investing a large, one-time amount in a mutual fund or other investment vehicle, as opposed to SIP (spreading investment over time)." },
    { q: "How is lumpsum return calculated?", a: "Maturity Value = P × (1 + r)^n, where P = initial investment, r = expected annual return rate ÷ 100, and n = number of years. This is the compound interest formula." },
    { q: "When is lumpsum better than SIP?", a: "Lumpsum is better when markets are at a low point (after a correction). If you have a windfall (bonus, inheritance), deploying it at the right time through lumpsum can give higher returns than SIP." },
    { q: "What is the rule of 72?", a: "The Rule of 72 estimates how long it takes to double your money: Doubling Time = 72 ÷ Annual Return%. At 12% returns, your money doubles in 6 years. This helps you quickly assess investment power." },
    { q: "What are the risks of lumpsum investment?", a: "The biggest risk is timing. Investing a lumpsum at a market peak can lead to negative returns for years. This timing risk is avoided by SIP, which spreads investment across different market levels." }
  ],
  "lumpsum-sip": [
    { q: "What is the Lumpsum + SIP strategy?", a: "This strategy combines a one-time lumpsum investment with regular monthly SIP contributions. The lumpsum provides a strong base, while SIP adds discipline and reduces timing risk over time." },
    { q: "Who should use Lumpsum + SIP?", a: "Ideal for someone who receives a bonus or has existing savings (lumpsum) and also has monthly income to invest (SIP). It maximizes both immediate deployment and long-term accumulation." },
    { q: "How is combined maturity calculated?", a: "Total Maturity = Lumpsum Maturity Value + SIP Maturity Value. The lumpsum grows using compound interest formula, and SIP uses the annuity formula. Both use the same expected rate of return." },
    { q: "Can I change SIP amount later?", a: "Yes. Most mutual fund platforms allow you to increase, decrease, or pause SIP amounts at any time. Annual step-up (increasing SIP by 10% each year) significantly boosts your final corpus." },
    { q: "What should be the lumpsum-to-SIP ratio?", a: "There is no fixed rule. A common approach is to deploy 50% of savings as lumpsum when markets are reasonably valued, and invest the remaining 50% via SIP over 12–18 months to average the cost." }
  ],
  "sip-delay": [
    { q: "What is the cost of delaying SIP?", a: "Every year you delay starting a SIP, you lose not just that year's returns but also the compounding effect of those returns over the entire remaining period. This loss grows exponentially with time." },
    { q: "How much does a 5-year delay cost?", a: "On a ₹10,000/month SIP at 12% for 20 years, starting 5 years late can cost you over ₹40–50L in final corpus. Starting early is one of the most powerful financial decisions you can make." },
    { q: "What is the power of compounding?", a: "Compounding means earning returns on your returns. ₹10,000/month for 30 years at 12% gives ₹3.2Cr. The same for 20 years gives only ₹98L. Those extra 10 years added ₹2.2Cr — 5x the invested amount." },
    { q: "At what age should I start SIP?", a: "As early as possible. Starting at 22 vs 30 can make a difference of 2–3x in your final corpus for the same monthly investment. Even ₹1,000/month started at 22 outperforms ₹5,000/month started at 30." },
    { q: "What if I missed years already?", a: "Don't wait longer. Start today with whatever amount you can. Increase SIP amounts as income grows. You cannot recover lost time, but you can maximize returns from now onward." }
  ],
  "target-value": [
    { q: "How do I calculate SIP needed for a target amount?", a: "Required SIP = FV × r / ((1+r)^n – 1) / (1+r), where FV = target amount, r = monthly rate, n = months. This is the present value of annuity due formula rearranged for periodic payment." },
    { q: "What should be my financial goal amount?", a: "Common goals: Child's education in 15 years (₹25–50L), Home down payment in 5 years (₹15–25L), Retirement corpus at 60 (₹2–5Cr), Emergency fund (6 months of expenses)." },
    { q: "How does the expected return affect SIP amount?", a: "Higher expected returns mean lower required SIP for the same goal. At 12%, you need ₹4,348/month for ₹50L in 20 years. At 8%, you'd need ₹8,200/month — almost double the SIP amount." },
    { q: "Should I account for inflation in goal planning?", a: "Yes. If your goal is ₹20L in today's money and the timeline is 15 years at 6% inflation, the actual future cost would be approximately ₹47.9L. Always plan for inflation-adjusted targets." },
    { q: "What is step-up SIP?", a: "Step-up SIP means increasing your monthly SIP by a fixed percentage (usually 10%) each year. This is highly effective as your SIP keeps pace with income growth and significantly boosts the final corpus." }
  ],
  "cagr": [
    { q: "What is CAGR?", a: "CAGR (Compound Annual Growth Rate) is the rate at which an investment grows annually to reach from its initial value to its final value. It is the most accurate measure of investment returns over multiple years." },
    { q: "How is CAGR calculated?", a: "CAGR = (Final Value / Initial Value)^(1/Years) – 1. For example, if ₹1L grew to ₹3.5L in 10 years: CAGR = (3.5/1)^(1/10) – 1 = 13.3%." },
    { q: "Why is CAGR better than simple return percentage?", a: "Simple returns don't account for compounding. CAGR gives you the equivalent steady annual growth that matches the actual result, making it easy to compare different investments over different periods." },
    { q: "What is a good CAGR for equity investments?", a: "For Indian equity markets, 12–15% CAGR over 10+ years is considered good for large-cap funds. Mid-cap and small-cap can give 15–20% CAGR but with higher volatility and risk." },
    { q: "Can CAGR be negative?", a: "Yes. If your final value is less than your initial value, CAGR will be negative. This represents a loss on your investment at a compounded annual rate." }
  ],
  "fd": [
    { q: "What is the difference between Simple and Compound Interest for FD?", a: "Simple Interest is calculated only on the principal. Compound Interest is calculated on principal + accumulated interest, resulting in higher returns. Most bank FDs compound quarterly." },
    { q: "Which bank offers the best FD rates in 2024?", a: "Small Finance Banks (SFB) like AU, ESAF, Suryoday offer 8–9.5% p.a. Senior citizens get 0.5% extra. Compare rates on your bank's website as they change frequently." },
    { q: "Are FD returns taxable?", a: "Yes. FD interest is fully taxable as per your income tax slab. TDS is deducted at 10% (20% without PAN) if interest exceeds ₹40,000 per year (₹50,000 for senior citizens)." },
    { q: "What is a tax-saving FD?", a: "A 5-year FD (lock-in) under Section 80C of Income Tax Act qualifies for deduction up to ₹1.5L per year. The interest earned is still taxable, but the principal deduction reduces your tax liability." },
    { q: "What happens to FD if bank fails?", a: "Deposits are insured up to ₹5L per depositor per bank by DICGC (Deposit Insurance and Credit Guarantee Corporation). Amounts above ₹5L are at risk if a bank collapses." }
  ],
  "rd": [
    { q: "What is a Recurring Deposit (RD)?", a: "RD is a savings scheme where you deposit a fixed amount every month for a pre-agreed tenure. At maturity, you receive the total deposits plus accumulated interest, either simple or compound." },
    { q: "How is RD interest calculated?", a: "For Compound Interest RD: Maturity = P × n + P × n × (n+1) × r / 2, where P = monthly deposit, n = total months, r = quarterly rate. Banks compound quarterly for most RDs." },
    { q: "Is RD better than SIP?", a: "RD gives guaranteed, fixed returns (6–8%) with capital safety. SIP in equity funds gives potentially higher returns (12%+) but with market risk. RD is suitable for short-term goals; SIP for long-term wealth." },
    { q: "What is the minimum RD amount?", a: "Most banks allow RD starting from ₹100–500 per month. Post Office RD has a minimum of ₹100/month with 6.7% interest rate, making it accessible for all income levels." },
    { q: "Can I withdraw RD before maturity?", a: "Premature withdrawal is allowed but attracts a penalty of 0.5–1% on the applicable interest rate. The effective interest rate becomes lower than the contracted rate if broken early." }
  ],
  "ppf": [
    { q: "What is PPF?", a: "Public Provident Fund (PPF) is a government-backed, tax-free savings scheme in India. It has a 15-year lock-in period (extendable in 5-year blocks) and currently earns 7.1% interest p.a., compounded annually." },
    { q: "What are PPF tax benefits?", a: "PPF enjoys EEE (Exempt-Exempt-Exempt) tax status: Investment qualifies for 80C deduction, interest earned is tax-free, and maturity amount is tax-free. This makes it one of India's most tax-efficient instruments." },
    { q: "What is the maximum PPF investment per year?", a: "The maximum annual investment in PPF is ₹1,50,000. Investments must be made in multiples of ₹500. The minimum annual contribution is ₹500 to keep the account active." },
    { q: "When can I take a loan against PPF?", a: "You can take a loan against your PPF balance from the 3rd to the 6th year of the account. The loan amount is up to 25% of the balance at the end of the 2nd preceding year." },
    { q: "Can I extend PPF beyond 15 years?", a: "Yes, PPF can be extended in blocks of 5 years indefinitely. You can extend with or without fresh contributions. Extending allows your corpus to keep growing tax-free, which is a powerful wealth creation strategy." }
  ],
  "retirement": [
    { q: "How much retirement corpus do I need?", a: "A common rule is to have 25–30 times your annual expenses as retirement corpus (the '4% withdrawal rule'). If your annual expenses at retirement are ₹12L, you need ₹3–3.6Cr as corpus." },
    { q: "What is inflation's impact on retirement planning?", a: "At 6% inflation, your monthly expenses double every 12 years. If your current expenses are ₹50,000/month and you retire in 25 years, you'll need ₹2.15L/month just to maintain the same lifestyle." },
    { q: "How should I invest for retirement?", a: "A common strategy: equity-heavy portfolio (80–90%) in the accumulation phase (age 25–50), transitioning to a balanced portfolio (60% equity, 40% debt) as you approach retirement (age 50–60)." },
    { q: "What post-retirement return should I assume?", a: "A conservative 6–7% p.a. return post-retirement from a mix of debt instruments (Senior Savings Scheme, FDs, debt funds) is a safe assumption. This is used in our calculator as the default." },
    { q: "What is the SWP (Systematic Withdrawal Plan) strategy?", a: "Post-retirement, you can invest your corpus in balanced mutual funds and set up monthly SWP to receive regular income. This is more tax-efficient and inflation-beating compared to FD interest." }
  ],
  "inflation": [
    { q: "How does inflation erode purchasing power?", a: "At 6% inflation, ₹10L today will only buy goods worth ₹5.58L in 10 years and ₹3.12L in 20 years. What costs ₹1,000 today will cost ₹1,791 in 10 years." },
    { q: "What is India's average inflation rate?", a: "India's average Consumer Price Index (CPI) inflation has been around 5–7% over the last decade. Food inflation tends to be higher (7–8%), while core inflation (excluding food and fuel) is typically 4–5%." },
    { q: "How should I beat inflation with investments?", a: "Invest in assets that historically outperform inflation: Equity mutual funds (12–15% CAGR), REITs, real estate, and gold (10–12% CAGR). Avoid keeping large amounts in savings accounts (3–4%) or FDs (6–8%)." },
    { q: "What is real return vs nominal return?", a: "Nominal return is the stated rate of return. Real return = Nominal Return – Inflation Rate. If your FD gives 7% and inflation is 6%, your real return is just 1%. Equity at 14% vs 6% inflation gives an 8% real return." },
    { q: "Why is inflation important for retirement planning?", a: "Inflation determines how much corpus you actually need. Ignoring inflation in retirement planning leads to a severe shortage of funds in later years when healthcare and living costs are at their highest." }
  ],
  "gratuity": [
    { q: "What is gratuity?", a: "Gratuity is a statutory benefit paid to employees upon leaving a company after a minimum of 5 years of service. It is governed by the Payment of Gratuity Act, 1972 and is a lump-sum payment." },
    { q: "How is gratuity calculated?", a: "Gratuity = (Basic Salary + DA) × 15 × Years of Service ÷ 26. The 15 represents 15 days wages per year, and 26 represents working days in a month (26 instead of 30)." },
    { q: "What is the maximum gratuity amount?", a: "As of 2018, the maximum tax-free gratuity is ₹20L (₹2 Crore). Amounts above ₹20L are taxable. Government employees receive higher gratuity limits and additional benefits." },
    { q: "Is gratuity taxable?", a: "For employees covered under the Gratuity Act: Up to ₹20L is fully tax-exempt. For employees not covered under the Act: Lower of actual gratuity or ₹10L × 15/26 × years is exempt." },
    { q: "When does gratuity become payable?", a: "Gratuity is payable on resignation, retirement, death, or disablement after 5 years of continuous service. In case of death or disablement, the 5-year minimum does not apply." }
  ],
  "gold-rates": [
    { q: "Why does gold price change every day?", a: "Gold is traded on global commodities exchanges (MCX in India, COMEX globally). Prices are influenced by USD strength, US Federal Reserve interest rate decisions, geopolitical tensions, inflation data, and global demand-supply dynamics." },
    { q: "What is the difference between 22K and 24K gold?", a: "24K gold is 99.9% pure — the highest purity, primarily used for investment coins and bars. 22K is 91.7% pure (alloyed with silver/copper for hardness) and is the most common purity for jewellery in India." },
    { q: "What is MCX gold price vs retail gold price?", a: "MCX price is the wholesale exchange-traded price per 10 grams (without GST). Retail prices include GST (3%), making charges, wastage charges, and the jeweller's margin — typically 5–25% above MCX price." },
    { q: "Is gold a good investment in 2024?", a: "Gold has historically performed well during global uncertainty and inflation. It's best used as a portfolio hedge (5–15% allocation). It does not generate income (no dividends/interest) and returns may lag equity over long periods." },
    { q: "What is Sovereign Gold Bond (SGB) and how does it compare to physical gold?", a: "SGB is issued by RBI and gives 2.5% annual interest + gold price appreciation, with no making charges and capital gains tax exemption at maturity. It's superior to physical gold and digital gold for investment purposes." }
  ],
  "market": [
    { q: "What are Nifty 50 and Sensex?", a: "Nifty 50 is the benchmark index of NSE (National Stock Exchange) tracking India's top 50 companies. Sensex is the benchmark index of BSE (Bombay Stock Exchange) tracking the top 30 companies. Both reflect market health." },
    { q: "What is Bank Nifty?", a: "Bank Nifty is an index of the 12 most liquid and large-capitalized banking stocks listed on NSE. It is more volatile than Nifty 50 and is widely traded in Futures & Options (F&O) markets." },
    { q: "What does a green/red market mean?", a: "Green means the index has gained from the previous close (bullish). Red means it has fallen (bearish). The percentage change shows the magnitude of the day's move." },
    { q: "What does market change percent mean?", a: "The change % is (Current Value – Previous Close) / Previous Close × 100. A +1% change on Nifty means the market gained by 1% from yesterday's closing price." },
    { q: "How often does this market data update?", a: "Our live market data updates every 3 seconds via WebSocket. The sparkline chart shows the last 30 data points, giving you a real-time trend view of each index's recent price movement." }
  ]
};

// Keep a clone of default base FAQs for resets
const DEFAULT_CALC_FAQS = JSON.parse(JSON.stringify(CALC_FAQS));

/* ─ Admin Override: merge with localStorage if admin has customized FAQs ── */
(function mergeFAQsFromAdmin() {
  try {
    const stored = localStorage.getItem('fincalc_faqs');
    if (stored) {
      const adminFaqs = JSON.parse(stored);
      Object.keys(adminFaqs).forEach(key => {
        if (Array.isArray(adminFaqs[key])) {
          CALC_FAQS[key] = adminFaqs[key];
        }
      });
    }
  } catch(e) {}
})();

