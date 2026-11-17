// video-plan.js — the plan for each finance lesson's video. Every lesson already has a generated video that narrates
// all of it (tools/study/video.mjs). This file plans the authored opening chapter that each one gets next: the
// moment from the lesson that is acted out on screen, and the stage visual (assets/js/study/video.js, VISUALS) it
// needs. A lesson counts as written when its <slug>.video.js exists. tools/study-video-plan.mjs turns this into
// FINANCE_VIDEO_PLAN.md with each video's length and chapters.
//
// Visuals: built = timeline. Planned, in the order they unlock the most lessons: growth (bars compounding or
// shrinking period by period), equation (two pans of the accounting equation kept level), ledger (an entry posting
// to T-accounts), bridge (a waterfall from one total to another), tree (a ratio split into its drivers), curve (a
// line or frontier traced point by point), payoff (option and project payoff lines).
export const VISUAL_KINDS = {
  timeline: 'Amounts on a dated line, moved one period at a time (built).',
  growth: 'Bars that compound or shrink period by period, with the factor on each step.',
  equation: 'Assets on one side, liabilities and equity on the other, kept level as each transaction lands.',
  ledger: 'A journal entry posting to T-accounts, then the balances carried to a trial balance.',
  bridge: 'A waterfall from one total to another (net income to cash, enterprise value to equity).',
  tree: 'A ratio split into its drivers, each branch lighting as it is computed.',
  curve: 'A line, curve or frontier traced point by point (yield curve, efficient frontier, NPV profile).',
  payoff: 'Payoff and profit lines that move as the inputs change.',
};

export const PLAN = {
  f00: {
    'finance-time-and-risk': { moment: 'Ana is offered $1,000 today or $1,000 in a year, then a risky $1,200: time and risk priced side by side.', visual: 'timeline' },
    'finance-accounting-economics': { moment: 'One year of Lantern seen three ways: accounting profit, operating cash flow and economic profit, from the same numbers.', visual: 'bridge' },
    'decision-principles': { moment: 'Six principles as six quick decisions Ana faces in one week, each settled by one rule.', visual: 'timeline' },
    'capital-and-liquidity': { moment: 'Lantern is profitable and nearly runs out of cash: current and quick ratios fall as payables come due.', visual: 'bridge' },
    'value-and-valuation-words': { moment: 'Market capitalisation becomes enterprise value: add debt, subtract cash, and the EV/EBITDA multiple appears.', visual: 'bridge' },
    'interest-and-inflation': { moment: 'Savings growing at 5% while prices grow at 3%: the real return is the gap, computed exactly.', visual: 'growth' },
    'financial-markets': { moment: 'Ana’s savings flow through a bank, a bond and a share into a business: the channels of the financial system.', visual: 'bridge' },
    'market-participants': { moment: 'One share order travels from a broker to an exchange to a market maker and a clearing house.', visual: 'timeline' },
    'governance-and-agency': { moment: 'A manager’s bonus rewards growth while owners want value: the agency cost measured in one project choice.', visual: 'payoff' },
  },
  f01: {
    'what-is-accounting': { moment: 'Ana’s shoebox of receipts becomes a set of records that a bank, an investor and the tax office each read differently.', visual: 'ledger' },
    'accounts-and-classifications': { moment: 'Twelve of Lantern’s items sorted into the five kinds of account, one by one.', visual: 'equation' },
    'accounting-equation': { moment: 'Five transactions land and the equation stays level every time.', visual: 'equation' },
    'debits-and-credits': { moment: 'The same transactions as debits and credits: which side each account grows on, and why.', visual: 'ledger' },
    'journal-entries': { moment: 'A week of Lantern’s transactions written as journal entries, each balanced before the next.', visual: 'ledger' },
    'general-ledger': { moment: 'The journal posts to the ledger: every line lands in its T-account and the balances build up.', visual: 'ledger' },
    'trial-balance': { moment: 'The balances listed, the columns added, and an error that a trial balance cannot catch.', visual: 'ledger' },
    'accrual-vs-cash': { moment: 'A catering job paid next month: cash basis and accrual basis tell two different stories about March.', visual: 'timeline' },
    'adjusting-entries': { moment: 'Month end: prepaid insurance used up, wages owed and revenue earned but not billed, each adjusted.', visual: 'ledger' },
    'financial-statements': { moment: 'The adjusted trial balance splits into the income statement, retained earnings and the balance sheet.', visual: 'bridge' },
    'closing-entries': { moment: 'Revenue and expense accounts emptied into retained earnings, ready for April.', visual: 'ledger' },
    'accounting-cycle': { moment: 'One month at Lantern from first transaction to closed books, the cycle drawn as it turns.', visual: 'timeline' },
  },
  f02: {
    'revenue-recognition': { moment: 'A bundled training contract split into its promises, with revenue recognised as each is delivered.', visual: 'timeline' },
    'inventory-and-cost-of-goods-sold': { moment: 'The same bean purchases costed by FIFO and by weighted average: two gross margins from one warehouse.', visual: 'bridge' },
    'income-statement': { moment: 'Revenue walks down the multi-step income statement to net income, one subtotal at a time.', visual: 'bridge' },
    'receivables-and-payables': { moment: 'An ageing schedule turns overdue invoices into an allowance for bad debts.', visual: 'bridge' },
    'long-lived-assets': { moment: 'An espresso machine depreciated three ways, then sold: the gain or loss on disposal.', visual: 'growth' },
    'balance-sheet-and-equity': { moment: 'Lantern’s classified balance sheet assembled section by section, and equity traced to its sources.', visual: 'equation' },
    'cash-flow-statement': { moment: 'Every cash movement of the year sorted into operating, investing and financing.', visual: 'bridge' },
    'indirect-method': { moment: 'Net income to operating cash flow: each adjustment added or subtracted on screen.', visual: 'bridge' },
    'linking-the-statements': { moment: 'One transaction followed through all three statements at once.', visual: 'bridge' },
    'gaap-and-ifrs': { moment: 'The same lease and the same inventory under US GAAP and IFRS, side by side.', visual: 'bridge' },
  },
  f04: {
    'simple-and-compound-interest': { moment: 'Simple and compound interest race for 30 years: interest on interest opens the gap.', visual: 'growth' },
    'effective-annual-rates': { moment: 'One quoted 12% compounded yearly, monthly and daily: three effective rates.', visual: 'growth' },
    'present-and-future-value': { moment: 'Lantern’s $10,000 repayment moved back to today one quarter at a time.', visual: 'timeline' },
    'discounting-cash-flows': { moment: 'A note’s coupons and principal each discounted to today and stacked into one price.', visual: 'timeline' },
    'annuities': { moment: 'The “0% interest” instalment plan: 24 payments discounted and compared with the cash price.', visual: 'timeline' },
    'perpetuities-and-growth': { moment: 'A payment that never stops still has a finite value: the shrinking discounted bars sum to C/(r − g).', visual: 'growth' },
    'loan-amortisation': { moment: 'Each payment split into interest and principal while the balance falls to zero.', visual: 'growth' },
    'inflation-and-real-returns': { moment: 'Nominal growth and price growth drawn together; the real return is what is left.', visual: 'growth' },
    'mortgages': { moment: 'Two mortgage offers, points paid up front, and the balance after five years.', visual: 'growth' },
  },
  f03: {
    'horizontal-analysis': { moment: 'Two years of statements laid side by side, each line’s change lit by size.', visual: 'bridge' },
    'common-size-statements': { moment: 'Every line divided by revenue: a small shop and a large chain become comparable.', visual: 'bridge' },
    'liquidity': { moment: 'Brightwater’s current, quick and cash ratios computed as the bank would.', visual: 'bridge' },
    'solvency-and-leverage': { moment: 'More debt lifts return on equity until interest cover breaks.', visual: 'curve' },
    'efficiency-and-working-capital': { moment: 'The cash conversion cycle: days of inventory plus days of receivables minus days of payables.', visual: 'timeline' },
    'return-on-assets-and-equity': { moment: 'Two businesses with the same profit and very different returns.', visual: 'tree' },
    'dupont-analysis': { moment: 'Return on equity split into margin, turnover and leverage, branch by branch.', visual: 'tree' },
    'cash-flow-and-earnings-quality': { moment: 'Profit rises while operating cash flow falls: the accruals that explain the gap.', visual: 'bridge' },
    'distress-scores': { moment: 'An Altman Z-score built term by term and placed in its zone.', visual: 'tree' },
    'benchmarking-and-annual-reports': { moment: 'Brightwater’s ratios set against its peers’ range, one ratio at a time.', visual: 'curve' },
  },
  f05: {
    'net-present-value': { moment: 'The cargo bike: savings discounted at 11% and set against the outlay, and the NPV rule decides.', visual: 'timeline' },
    'investment-criteria': { moment: 'The NPV profile crosses zero at the IRR; two projects cross each other at the crossover rate.', visual: 'curve' },
    'project-cash-flows': { moment: 'Incremental cash flows built year by year: tax, depreciation shield, working capital and salvage.', visual: 'bridge' },
    'choosing-between-projects': { moment: 'Two machines with different lives compared by equivalent annual cost.', visual: 'timeline' },
    'project-risk': { moment: 'The second kitchen’s NPV under best, base and worst cases, and its break-even sales.', visual: 'curve' },
    'cost-of-debt-and-equity': { moment: 'A bond’s yield and a share’s required return found from their prices.', visual: 'curve' },
    'weighted-average-cost-of-capital': { moment: 'Equity and debt costs blended by market weights, with the tax saving on interest.', visual: 'bridge' },
    'capital-structure': { moment: 'Leverage moves value: the tax shield gained against the expected cost of distress.', visual: 'curve' },
    'payout-policy': { moment: 'A dividend and a buyback of the same size: what each shareholder ends up with.', visual: 'bridge' },
    'financial-planning': { moment: 'Sales growth that needs external financing: the additional funds needed, computed.', visual: 'bridge' },
  },
  f06: {
    'shares-and-markets': { moment: 'An order book fills: bids, asks and the spread a trader pays.', visual: 'curve' },
    'bond-prices-and-yields': { moment: 'Yields rise and a bond’s price falls along its price–yield curve.', visual: 'curve' },
    'measuring-returns': { moment: 'Arithmetic and geometric averages of the same returns, and why they differ.', visual: 'growth' },
    'measuring-risk': { moment: 'A return distribution drawn from monthly data, with its standard deviation and tails.', visual: 'curve' },
    'diversification': { moment: 'Adding shares one at a time: portfolio risk falls to the market’s floor.', visual: 'curve' },
    'efficient-portfolios': { moment: 'The efficient frontier traced, then the capital market line from the risk-free rate.', visual: 'curve' },
    'capm-and-beta': { moment: 'Beta estimated from returns, then the required return read off the security market line.', visual: 'curve' },
    'funds-and-indexing': { moment: 'An index fund and an active fund compounded for 30 years: the cost of fees.', visual: 'growth' },
    'discounted-cash-flow-valuation': { moment: 'Brightcup’s free cash flows discounted and the terminal value added: a value per share.', visual: 'bridge' },
    'relative-valuation': { moment: 'Peers’ multiples applied to Brightcup, and the range of values they give.', visual: 'curve' },
    'fundamental-analysis': { moment: 'From industry to company to share price: a top-down research path.', visual: 'tree' },
  },
  f07: {
    'modelling-principles': { moment: 'One input changes and every year downstream updates, while a hard-coded cell stays frozen and is caught.', visual: 'timeline' },
    'setting-up-the-history': { moment: 'Reported 2027 EBITDA of $52,587 becomes the normalised $73,587, one labelled adjustment at a time.', visual: 'bridge' },
    'revenue-and-cost-forecasts': { moment: 'Six revenue lines stack into 2028’s total, then the EBITDA bridge shows Cold Brew’s launch dip.', visual: 'bridge' },
    'working-capital-and-capex': { moment: 'Sales grow and cash is tied up in receivables and inventory, day by day.', visual: 'bridge' },
    'debt-schedules': { moment: 'Coastline’s $60,000 loan amortising month by month, with interest and the year-end balance.', visual: 'growth' },
    'linking-the-statements': { moment: 'One forecast year closes: profit flows to equity, cash flow to the balance sheet, and the check reads zero.', visual: 'bridge' },
    'dcf-model': { moment: 'The model’s free cash flows discounted and summed into a value for Hollis Avery’s 30%.', visual: 'timeline' },
    'scenarios-and-sensitivity': { moment: 'The current ratio under base, slow-growth and late-kitchen scenarios against the 1.2 covenant line.', visual: 'curve' },
    'model-review-and-presentation': { moment: 'A reviewer’s checklist run over the model, each check turning from red to zero.', visual: 'tree' },
  },
  f08: {
    'why-firms-hedge': { moment: 'Lantern’s 2029 EBITDA swings with the price of coffee, then flattens at $81,093 once the price is fixed at $37.50.', visual: 'payoff' },
    'forwards-and-futures': { moment: 'A week of coffee settlement prices passes through the margin account, with a $750 call on day 2.', visual: 'timeline' },
    'pricing-by-no-arbitrage': { moment: 'Two routes to €38,000 on 31 March, a forward and a money-market hedge, arrive at the same $1.0905.', visual: 'bridge' },
    'swaps': { moment: 'Brightcup’s floating payments cancel against the swap, leaving a fixed 5.98% whatever the benchmark does.', visual: 'curve' },
  },
};

/** Proposed modules and lessons for the finance courses not yet written, from the benchmark review in FINANCE_PLAN.md. */
export const NEW_COURSES = {
  f07: [
    { title: 'Building a model', lessons: ['Modelling principles: inputs, calculations, outputs', 'Reading a 10-K for the model', 'Error checks and model review'] },
    { title: 'The three statements', lessons: ['Revenue and cost forecasts', 'Working capital and capital spending schedules', 'Debt schedules and interest', 'Linking the three statements'] },
    { title: 'Valuation and decisions', lessons: ['A DCF model from the forecast', 'Scenarios, sensitivity and data tables', 'Dashboards and presenting a model'] },
  ],
  f08: [
    { title: 'Forwards, futures and swaps', lessons: ['Why firms hedge', 'Forwards and futures', 'Pricing by no arbitrage', 'Swaps'] },
    { title: 'Options', lessons: ['Calls, puts, payoffs and profits', 'Put–call parity', 'Binomial pricing', 'Black–Scholes–Merton and the Greeks'] },
    { title: 'Managing risk', lessons: ['Hedging with derivatives', 'Margin, leverage and short selling', 'Value at Risk and stress tests'] },
  ],
  f09: [
    { title: 'Bond pricing', lessons: ['Bond features and covenants', 'Yield measures', 'Spot and forward rates'] },
    { title: 'Interest-rate risk', lessons: ['The yield curve and its theories', 'Duration', 'Convexity and immunisation'] },
    { title: 'Credit', lessons: ['Default, recovery and expected loss', 'Ratings and spreads', 'Securitisation', 'Bond portfolio strategies'] },
  ],
  f10: [
    { title: 'Valuing a business', lessons: ['Choosing a valuation approach', 'Free cash flow to the firm and to equity', 'Terminal value', 'Young, cyclical and distressed companies'] },
    { title: 'Relative and sum-of-the-parts', lessons: ['Choosing and adjusting multiples', 'Sum of the parts'] },
    { title: 'Deals and restructuring', lessons: ['Mergers and acquisitions: synergies and premiums', 'Accretion, dilution and deal structure', 'Leveraged buyouts', 'Distress, bankruptcy and restructuring'] },
  ],
  f11: [
    { title: 'Private markets', lessons: ['What makes an investment alternative', 'Fund structures, fees and carried interest', 'Private equity', 'Venture capital'] },
    { title: 'Measuring private returns', lessons: ['IRR, multiples and public market equivalent', 'Smoothed returns and biases'] },
    { title: 'Other alternatives', lessons: ['Hedge fund strategies', 'Real estate', 'Private credit, commodities and infrastructure', 'Due diligence and allocation'] },
  ],
  f12: [
    { title: 'Costs and decisions', lessons: ['Cost behaviour', 'Cost–volume–profit analysis', 'Relevant costs for decisions'] },
    { title: 'Product costing', lessons: ['Job-order and process costing', 'Activity-based costing'] },
    { title: 'Planning and control', lessons: ['The master budget', 'Flexible budgets and variances', 'Standard costing', 'Responsibility accounting and transfer pricing', 'The balanced scorecard'] },
  ],
  f13: [
    { title: 'Institutions', lessons: ['Banks and bank runs', 'Central banks and monetary policy', 'Insurance', 'Exchanges, brokers and clearing'] },
    { title: 'How markets behave', lessons: ['Market efficiency', 'Behavioural finance', 'Bubbles and crises'] },
    { title: 'Currencies, rules and ethics', lessons: ['Foreign exchange and interest-rate parity', 'Regulation', 'Ethics and professional standards'] },
  ],
};
