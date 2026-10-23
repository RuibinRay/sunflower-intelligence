// catalog.js — the whole curriculum: three schools, 33 courses in a suggested study order, their levels and prerequisites.
// Courses with `modules` are built (lesson files live in assets/js/data/study/<id>/); the rest are planned
// and list the topics they will cover. `status` is the course's state in the completion checklist:
//   planned      outline only; nothing written
//   in-progress  lessons being written or checked
//   reviewed     every lesson and assessment written and independently reviewed, not yet fully tested
//   complete     reviewed, tested (numbers, answer keys, interactions) and live in the course navigation
// `requires` must be finished first; `recommends` helps but isn't needed (each built course teaches what it uses).
// `related` points at what already exists on the site for a planned course: plates (short lessons) and tools.

export const SCHOOLS = [
  {
    id: 'finance', room: 'finance', name: 'Finance & Accounting', short: 'Finance',
    blurb: 'Record transactions, prepare and read financial statements, value money over time, and make investment and financing decisions.',
  },
  {
    id: 'analytics', room: 'analytics', name: 'Business Analytics & Data Science', short: 'Analytics',
    blurb: 'Prepare data you can trust, describe it, test ideas with statistics, and build models that predict and explain.',
  },
  {
    id: 'marketing', room: 'marketing', name: 'Marketing & Business Strategy', short: 'Marketing',
    blurb: 'Understand customers, design the marketing mix, measure what marketing returns, and choose where to compete.',
  },
];

export const LEVELS = { intro: 'Introductory', intermediate: 'Intermediate', advanced: 'Advanced' };

/** Fictional cases that run through several lessons and courses. Every figure in them is invented for teaching. */
export const CASES = {
  lantern: {
    name: 'Lantern Coffee Co.',
    line: 'A fictional coffee business founded by Ana Lim. It starts as a catering and barista-training service, opens an online shop for beans, then launches a canned cold brew.',
  },
  brightwater: { name: 'Brightwater Bike Repair', line: 'A fictional small bicycle repair shop used for the F01 project.' },
  harborview: { name: 'Harborview Hotel', line: 'A fictional 80-room hotel whose booking records need cleaning.' },
  northfield: { name: 'Northfield University', line: 'A fictional university analysing student records.' },
};

const C = (o) => ({ status: 'planned', requires: [], recommends: [], related: [], ...o });

const ALL = [
  // ================================================================ Finance & Accounting
  C({
    id: 'f01', school: 'finance', code: 'F01', level: 'intro', status: 'complete', recommends: ['f00'],
    title: 'Introduction to Financial Accounting',
    blurb: 'How a business records what happens to it: the accounting equation, debits and credits, journals and ledgers, adjustments, and the full accounting cycle.',
    case: 'lantern',
    outcomes: [
      'Analyse a business transaction into its effect on assets, liabilities and equity.',
      'Record transactions as balanced journal entries using the debit and credit rules.',
      'Post entries to the general ledger and prepare a trial balance, and know which errors a trial balance cannot catch.',
      'Explain the difference between accrual and cash accounting and record the adjusting entries for deferrals, accruals and depreciation.',
      'Prepare an income statement, statement of changes in equity and balance sheet from an adjusted trial balance.',
      'Close the books and complete the accounting cycle for a small business.',
    ],
    lab: 'accounting',
    modules: [
      { n: 1, title: 'The language of business', lessons: ['what-is-accounting', 'accounts-and-classifications', 'accounting-equation'] },
      { n: 2, title: 'Double-entry recording', lessons: ['debits-and-credits', 'journal-entries', 'general-ledger', 'trial-balance'] },
      { n: 3, title: 'Accrual accounting and adjustments', lessons: ['accrual-vs-cash', 'adjusting-entries', 'financial-statements'] },
      { n: 4, title: 'Closing the books', lessons: ['closing-entries', 'accounting-cycle'] },
    ],
    project: { title: 'One month at Brightwater Bike Repair', blurb: 'Run a full accounting cycle for a fictional repair shop: journalise a month of transactions, adjust, prepare the statements and close the books.' },
  }),
  C({
    id: 'f02', school: 'finance', code: 'F02', level: 'intro', requires: ['f01'],
    title: 'Financial Statement Preparation',
    blurb: 'Build all four financial statements and see how every transaction flows through them.',
    topics: ['Income statements: gross profit, EBITDA, EBIT and net income', 'Balance sheets', 'Cash flow statements (direct and indirect methods)', 'Statements of changes in equity', 'Revenue recognition basics', 'Cost of goods sold', 'Operating expenses', 'Depreciation and amortisation', 'Inventory accounting', 'Accounts receivable and payable', 'Working capital', 'Retained earnings', 'How the three statements connect', 'US GAAP versus IFRS'],
  }),
  C({
    id: 'f03', school: 'finance', code: 'F03', level: 'intermediate', requires: ['f02'],
    title: 'Financial Statement Analysis',
    blurb: 'Read a company through its statements: trends, common-size statements, ratios, DuPont analysis and distress scores.',
    topics: ['Horizontal analysis and trends', 'Vertical analysis', 'Common-size statements', 'Growth and margin ratios', 'Liquidity ratios: current and quick', 'Solvency and leverage ratios', 'Efficiency ratios: asset and inventory turnover', 'Return on assets and return on equity', 'DuPont analysis', 'Financial health analysis', 'Altman Z-score and its limits', 'Industry benchmarking', 'Reading footnotes and MD&A', 'Cases: growth with cash burn, reinvestment over reported profit, aggressive accounting'],
    related: [{ plate: 'credit' }, { tool: 'finance/risk/#altman', label: 'Altman Z-scores' }],
  }),
  C({
    id: 'f04', school: 'finance', code: 'F04', level: 'intro', status: 'complete', recommends: ['f00'],
    title: 'Mathematics of Finance',
    blurb: 'Interest, present and future value, annuities, loans and inflation, with every formula worked step by step.',
    topics: ['Simple and compound interest', 'Present value and future value', 'Discounting', 'Annuities', 'Perpetuities', 'Loan amortisation', 'Effective annual rates', 'Nominal versus real returns', 'Inflation adjustments', 'Mortgage calculations'],
    case: 'lantern',
    outcomes: [
      'Calculate simple and compound interest, and solve compound-growth problems for the amount, the rate or the time.',
      'Convert between nominal, periodic and effective annual rates for any compounding frequency, including continuous compounding, and use them to compare offers.',
      'Calculate the present and future value of single amounts and of uneven cash-flow streams, the net present value of a decision, and the internal rate of return by trial.',
      'Value annuities, annuities due, growing annuities and perpetuities, and solve for the payment, the number of periods or the rate.',
      'Build a loan amortisation schedule, find the balance outstanding at any date, and compare loans, instalment plans and refinancing.',
      'Distinguish nominal from real amounts and rates, discount consistently, and analyse a fixed-rate mortgage including points and term, and how an adjustable rate resets.',
    ],
    modules: [
      { n: 1, title: 'Interest', lessons: ['simple-and-compound-interest', 'effective-annual-rates'] },
      { n: 2, title: 'Present and future value', lessons: ['present-and-future-value', 'discounting-cash-flows'] },
      { n: 3, title: 'Streams of cash', lessons: ['annuities', 'perpetuities-and-growth', 'loan-amortisation'] },
      { n: 4, title: 'Real versus nominal', lessons: ['inflation-and-real-returns', 'mortgages'] },
    ],
    project: { title: 'Ana’s home plan', blurb: 'Plan how Ana saves a home deposit and which mortgage she takes: a savings schedule, two mortgage offers, points, the balance after five years and what the payments are worth after inflation.' },
    related: [{ plate: 'tvm' }, { tool: 'finance/valuation/#dcf', label: 'Discounted cash flow' }],
  }),
  C({
    id: 'f05', school: 'finance', code: 'F05', level: 'intermediate', requires: ['f04'], recommends: ['f03'],
    title: 'Corporate Finance',
    blurb: 'Which projects to fund, what capital costs, how to finance the business and what to pay shareholders.',
    topics: ['Capital budgeting', 'Net present value', 'Internal rate of return', 'Payback period', 'Profitability index', 'Free cash flow', 'Cost of capital', 'WACC', 'Cost of equity', 'Cost of debt', 'Debt versus equity financing', 'Capital structure and Modigliani–Miller', 'Dividends versus share buybacks', 'Corporate governance and the agency problem', 'Financial planning', 'Cash flow forecasting'],
    related: [{ plate: 'invest' }, { plate: 'wacc' }, { tool: 'finance/investment/', label: 'Investment decisions' }, { tool: 'finance/valuation/', label: 'Valuation' }],
  }),
  C({
    id: 'f06', school: 'finance', code: 'F06', level: 'intermediate', requires: ['f04'], recommends: ['b04'],
    title: 'Investment Analysis',
    blurb: 'Risk and return, diversification, CAPM, bonds and equity valuation.',
    topics: ['Common and preferred stock', 'Bonds: coupon, maturity, yield to maturity, pricing', 'Risk and return', 'Expected returns', 'Volatility and standard deviation', 'Diversification and modern portfolio theory', 'Correlation of assets', 'Portfolio optimisation', 'CAPM', 'Beta', 'Sharpe ratio', 'Funds, ETFs and active versus passive investing', 'Equity valuation: DCF with terminal value', 'Relative valuation: P/E, EV/EBITDA, P/B and PEG', 'Market capitalisation and enterprise value', 'Fundamental analysis'],
    related: [{ plate: 'stocks' }, { plate: 'bonds' }, { tool: 'finance/stocks/', label: 'Stock analysis' }, { tool: 'finance/markets/', label: 'Bonds and options' }],
  }),
  C({
    id: 'f07', school: 'finance', code: 'F07', level: 'advanced', requires: ['f02', 'f05'], recommends: ['b03'],
    title: 'Financial Modelling',
    blurb: 'Build and check three-statement models, forecasts, debt schedules and DCF valuations.',
    topics: ['Spreadsheet modelling principles: inputs, formulas, colour conventions', 'Three-statement models', 'Revenue forecasting', 'Expense forecasting', 'Working capital schedules', 'Debt schedules', 'Scenario modelling', 'Sensitivity analysis', 'DCF valuation models', 'Reading an annual report (Form 10-K)', 'The investment research process: top-down and bottom-up', 'A framework for analysing a company', 'Financial dashboards', 'Model validation and error checking'],
    related: [{ tool: 'finance/valuation/', label: 'Valuation' }],
  }),
  C({
    id: 'f08', school: 'finance', code: 'F08', level: 'advanced', requires: ['f05', 'f06'],
    title: 'Advanced Financial Decision-Making',
    blurb: 'Risk management, derivatives and hedging, mergers, valuation and decisions under uncertainty.',
    topics: ['Risk management', 'Derivatives fundamentals', 'Options: calls, puts, payoffs and profits', 'Futures and forwards', 'Swaps', 'Margin, leverage and short selling', 'Hedging', 'Mergers and acquisitions', 'Business valuation', 'Financial distress and bankruptcy', 'Capital allocation', 'Decision-making under uncertainty'],
    related: [{ plate: 'options' }, { plate: 'mrisk' }, { tool: 'finance/risk/', label: 'Risk management' }],
  }),

  C({
    id: 'f00', school: 'finance', code: 'F00', level: 'intro', status: 'complete',
    title: 'Foundations of Finance',
    blurb: 'What finance is and how it differs from accounting and economics, the principles behind every financial decision, the vocabulary professionals use, and how financial markets and their participants work.',
    topics: ['What finance is: time and risk', 'Personal, corporate and investment finance', 'Finance, accounting and economics', 'Six decision principles: time value, risk and return, cash, incremental cash flows, diversification, no arbitrage', 'Essential vocabulary: capital, liquidity, valuation, market capitalisation, enterprise value, EBITDA, working capital', 'Interest and inflation', 'Types of financial markets: equity, bond, foreign exchange, commodity, derivatives', 'Market participants: investment banks, institutional investors, hedge funds, brokers', 'How markets channel savings into investment'],
    case: 'lantern',
    outcomes: [
      'Explain what finance studies, why time and risk sit at its centre, and how it differs from accounting and economics, and calculate accounting profit, operating cash flow and economic profit.',
      'Apply the core decision principles (time value, risk and return, cash over profit, incremental cash flows, diversification, no arbitrage) to everyday choices.',
      'Use the essential vocabulary of finance correctly (capital, liquidity, solvency, market capitalisation, enterprise value, EBITDA and working capital), and calculate and interpret the ratios built from it: current and quick ratios, debt-to-equity, EV/EBITDA and P/E.',
      'Calculate simple and compound interest, future and present values, effective annual rates for any compounding frequency, inflation from a price index, and exact real returns.',
      'Describe the main financial markets and what each participant does in them.',
      'Explain agency problems between owners, managers and lenders, calculate agency costs and risk shifting in simple cases, and evaluate the tools used to limit them.',
    ],
    modules: [
      { n: 1, title: 'What finance is', lessons: ['finance-time-and-risk', 'finance-accounting-economics', 'decision-principles'] },
      { n: 2, title: 'The language of finance', lessons: ['capital-and-liquidity', 'value-and-valuation-words', 'interest-and-inflation'] },
      { n: 3, title: 'Markets and the people in them', lessons: ['financial-markets', 'market-participants', 'governance-and-agency'] },
    ],
    project: { title: 'Two choices for Ana’s savings', blurb: 'Compare two ways for a small-business owner to use her savings, using time value, risk, liquidity and inflation, and explain the choice in plain language.' },
    related: [{ plate: 'tvm' }],
  }),

  // ================================================================ Business Analytics & Data Science
  C({
    id: 'b01', school: 'analytics', code: 'B01', level: 'intro',
    title: 'Introduction to Business Analytics',
    blurb: 'The four kinds of analytics, turning business questions into measurable ones, and reading data sensibly.',
    topics: ['Descriptive, diagnostic, predictive and prescriptive analytics', 'Data types', 'Business questions and measurable objectives', 'Data collection', 'Data quality', 'KPIs', 'Basic data interpretation', 'Problem-solving frameworks'],
  }),
  C({
    id: 'b02', school: 'analytics', code: 'B02', level: 'intro', status: 'complete', recommends: ['b01'],
    title: 'Data Cleaning and Preparation',
    blurb: 'Turn a messy export into data you can trust: profile it, fix records and formats, handle missing and unusual values, and prepare it for analysis without biasing the result.',
    case: 'lantern',
    outcomes: [
      'Describe a dataset precisely: its unit of observation, variables, types and keys.',
      'Profile a dataset and write validation rules that catch invalid records.',
      'Find and resolve duplicates, wrong data types, inconsistent dates and messy text.',
      'Choose between deleting and imputing missing values, and explain the bias each can cause.',
      'Detect outliers, decide whether they are errors, and treat skewed variables.',
      'Scale, encode and reshape data for analysis without leaking information from test data.',
      'Document every cleaning decision in a reproducible data quality report.',
    ],
    lab: 'cleaning',
    modules: [
      { n: 1, title: 'Understanding your data', lessons: ['datasets-and-variables', 'profiling-and-validation'] },
      { n: 2, title: 'Fixing records and formats', lessons: ['duplicates', 'types-and-formats', 'text-and-categories'] },
      { n: 3, title: 'Missing and unusual values', lessons: ['missing-values', 'outliers', 'skewed-data'] },
      { n: 4, title: 'Preparing data for analysis', lessons: ['scaling', 'encoding-categories', 'transforming-data', 'data-quality-report'] },
    ],
    project: { title: 'Clean Lantern’s order export', blurb: 'Take Lantern Coffee’s raw online-shop export from messy to analysis-ready in the Data Cleaning Lab, meet its validation rules, and write the data quality report.' },
    related: [{ tool: 'analytics/explore/#data', label: 'Data-quality audit' }],
  }),
  C({
    id: 'b03', school: 'analytics', code: 'B03', level: 'intro', recommends: ['b01'],
    title: 'Excel for Business Analytics',
    blurb: 'Formulas, lookups, pivot tables, charts, what-if analysis and dashboards in a spreadsheet.',
    topics: ['Formulas and functions', 'IF, SUMIF, COUNTIF, XLOOKUP', 'Tables', 'Pivot tables', 'Charts', 'Conditional formatting', 'Descriptive statistics', 'Data cleaning workflows', 'What-if analysis', 'Goal Seek and Solver', 'Regression output', 'Dashboards'],
  }),
  C({
    id: 'b04', school: 'analytics', code: 'B04', level: 'intermediate', requires: ['b01'], recommends: ['b02'],
    title: 'Descriptive and Inferential Statistics',
    blurb: 'Summarise data, then reason from samples to populations with confidence intervals and tests.',
    topics: ['Mean, median, mode', 'Variance and standard deviation', 'Quartiles and percentiles', 'Distributions', 'The normal distribution', 'Sampling', 'Central limit theorem', 'Confidence intervals', 'Hypothesis testing', 'P-values', 'Type I and Type II errors', 'Statistical power', 'T-tests, chi-square tests and ANOVA'],
    related: [{ plate: 'describe' }, { tool: 'analytics/explore/#describe', label: 'Describe' }],
  }),
  C({
    id: 'b05', school: 'analytics', code: 'B05', level: 'intermediate', requires: ['b04'],
    title: 'Correlation Analysis',
    blurb: 'Measure how variables move together, test it, and avoid reading causation into it.',
    topics: ['Covariance', 'Pearson correlation', 'Spearman correlation', 'Strength and direction', 'Scatterplots', 'Correlation matrices and heatmaps', 'Outliers', 'Nonlinear relationships', 'Statistical significance', 'Correlation versus causation', 'Spurious correlations'],
    related: [{ tool: 'analytics/explore/#correlate', label: 'Correlate' }],
  }),
  C({
    id: 'b06', school: 'analytics', code: 'B06', level: 'intermediate', requires: ['b05'],
    title: 'Regression Analysis',
    blurb: 'Fit, read and check linear and logistic regressions, and know what they can and can’t tell you.',
    topics: ['Simple and multiple regression', 'Coefficients and intercepts', 'Ordinary least squares', 'Residuals', 'R-squared and adjusted R-squared', 'Significance and confidence intervals', 'Multicollinearity', 'Heteroskedasticity', 'Model assumptions', 'Logistic regression', 'Diagnostics', 'Prediction intervals'],
    related: [{ plate: 'regression' }, { plate: 'classify' }, { tool: 'analytics/explore/#regress', label: 'Regress' }],
  }),
  C({
    id: 'b07', school: 'analytics', code: 'B07', level: 'intro', recommends: ['b01', 'b02'],
    title: 'SQL and Business Databases',
    blurb: 'Relational databases and the queries that answer business questions.',
    topics: ['Relational databases', 'Tables and primary keys', 'Foreign keys', 'Entity relationships', 'One-to-one and one-to-many relationships', 'SELECT, WHERE, GROUP BY, ORDER BY', 'JOINs', 'Aggregate functions', 'Subqueries', 'Common table expressions', 'Data integrity', 'Reporting queries'],
  }),
  C({
    id: 'b08', school: 'analytics', code: 'B08', level: 'advanced', requires: ['b06', 'b02'],
    title: 'Machine Learning for Business',
    blurb: 'Supervised and unsupervised models, honest evaluation, and the limits of prediction.',
    topics: ['Supervised learning', 'Unsupervised learning', 'Training and test sets', 'Cross-validation', 'Data leakage', 'Linear and logistic models', 'Decision trees', 'Random forests', 'Gradient boosting', 'k-means clustering', 'Principal component analysis', 'Feature engineering', 'Model evaluation', 'Overfitting and underfitting', 'Bias and variance', 'Explainability and ethics'],
    related: [{ plate: 'mlsup' }, { plate: 'mlunsup' }, { plate: 'validation' }, { tool: 'analytics/supervised/', label: 'Supervised learning' }, { tool: 'analytics/unsupervised/', label: 'Unsupervised learning' }],
  }),
  C({
    id: 'b09', school: 'analytics', code: 'B09', level: 'advanced', requires: ['b06'],
    title: 'Forecasting and Time Series',
    blurb: 'Trend, seasonality, smoothing and ARIMA, judged by honest out-of-sample error.',
    topics: ['Time-series components', 'Trend and seasonality', 'Moving averages', 'Exponential smoothing', 'Forecast error', 'MAE, MSE, RMSE, MAPE and their limits', 'Regression-based forecasting', 'ARIMA fundamentals', 'Demand forecasting', 'Business forecasting scenarios'],
    related: [{ plate: 'forecast' }, { tool: 'analytics/forecast/', label: 'Forecasting' }],
  }),
  C({
    id: 'b10', school: 'analytics', code: 'B10', level: 'intermediate', requires: ['b01'], recommends: ['b03'],
    title: 'Visualisation and Business Intelligence',
    blurb: 'Choose the right chart, design dashboards people can use, and tell an honest story with data.',
    topics: ['Choosing charts', 'Dashboard design', 'Data storytelling', 'Heatmaps', 'Histograms', 'Scatterplots', 'Line and bar charts', 'KPI scorecards', 'BI tool concepts', 'Visual accessibility', 'Misleading visualisations', 'Interactive reporting'],
  }),
  C({
    id: 'b11', school: 'analytics', code: 'B11', level: 'advanced', requires: ['b04'], recommends: ['b03'],
    title: 'Optimisation and Decision Analytics',
    blurb: 'Linear programming, simulation and decision trees for allocating scarce resources.',
    topics: ['Linear programming', 'Objective functions', 'Constraints', 'Resource allocation', 'Transportation and supply-chain problems', 'Portfolio optimisation', 'Simulation', 'Monte Carlo methods', 'Sensitivity analysis', 'Decision trees'],
  }),
  C({
    id: 'b12', school: 'analytics', code: 'B12', level: 'advanced', requires: ['b04', 'b06'],
    title: 'Experimental Design and Applied Analytics',
    blurb: 'A/B tests and experiments done properly, then an end-to-end analytics project.',
    topics: ['A/B testing', 'Control and treatment groups', 'Randomisation', 'Confounding variables', 'Statistical inference', 'Sample size', 'Interpreting experiments', 'Business decisions from evidence', 'End-to-end analytics projects'],
    related: [{ plate: 'growth' }, { tool: 'marketing/growth/#ab-test', label: 'A/B test and sample size' }],
  }),

  // ================================================================ Marketing & Business Strategy
  C({
    id: 'm01', school: 'marketing', code: 'M01', level: 'intro',
    title: 'Marketing Fundamentals',
    blurb: 'What marketing is, how customers decide, and how companies create value for them.',
    topics: ['What marketing is', 'Customer needs and value', 'Market orientation', 'The marketing process', 'Customer behaviour', 'B2B versus B2C', 'Marketing objectives', 'Competitive advantage'],
  }),
  C({
    id: 'm02', school: 'marketing', code: 'M02', level: 'intro', status: 'complete', recommends: ['m01'],
    title: 'The 4Ps Marketing Mix',
    blurb: 'Design a product, set its price, choose where it is sold and decide how it is promoted, and make the four decisions fit together.',
    case: 'lantern',
    outcomes: [
      'Explain the marketing mix and how each element creates or captures customer value.',
      'Make product decisions across the product levels, product line and life cycle.',
      'Set prices with cost-based, value-based and competition-based methods, and calculate break-even volume.',
      'Use price elasticity to predict how revenue and profit respond to a price change.',
      'Choose distribution channels and intensity, and build a price from factory to shelf.',
      'Plan an integrated promotion mix, set its budget, and measure it with the right metrics.',
      'Combine the four decisions into a consistent plan and defend it with evidence.',
    ],
    lab: 'mix',
    modules: [
      { n: 1, title: 'The mix and the product', lessons: ['marketing-mix', 'product-decisions', 'product-life-cycle'] },
      { n: 2, title: 'Price', lessons: ['pricing-approaches', 'price-response'] },
      { n: 3, title: 'Place', lessons: ['distribution-channels'] },
      { n: 4, title: 'Promotion and the whole mix', lessons: ['promotion-mix', 'measuring-the-mix'] },
    ],
    project: { title: 'Launch plan for Lantern Cold Brew', blurb: 'Use the Marketing Mix Simulator to develop a launch plan for a fictional canned cold brew, test it against the alternatives, and defend it in a written recommendation.' },
    related: [{ plate: 'pricing' }, { tool: 'marketing/pricing/', label: 'Pricing' }],
  }),
  C({
    id: 'm03', school: 'marketing', code: 'M03', level: 'intermediate', requires: ['m02'],
    title: 'The 7Ps of Services Marketing',
    blurb: 'People, process and physical evidence: marketing what can’t be held, stored or inspected first.',
    topics: ['Product, price, place, promotion for services', 'People', 'Process', 'Physical evidence', 'Service quality', 'Customer experience', 'Service recovery', '4Ps and 7Ps compared in retail, hospitality, banking and professional services'],
  }),
  C({
    id: 'm04', school: 'marketing', code: 'M04', level: 'intermediate', requires: ['m01'], recommends: ['b04'],
    title: 'Market Research',
    blurb: 'Primary and secondary research, sampling, market sizing and the biases that mislead.',
    topics: ['Primary research', 'Secondary research', 'Surveys', 'Interviews', 'Focus groups', 'Sampling methods', 'Market sizing', 'TAM, SAM, SOM', 'Competitor research', 'Consumer insights', 'Research bias', 'Interpreting data'],
    related: [{ plate: 'markets' }, { tool: 'marketing/map/', label: 'Market map' }],
  }),
  C({
    id: 'm05', school: 'marketing', code: 'M05', level: 'intermediate', requires: ['m01'], recommends: ['m04'],
    title: 'Market Segmentation and Positioning',
    blurb: 'Segment, target and position: decide who to serve and how to stand out to them.',
    topics: ['Demographic segmentation', 'Geographic segmentation', 'Psychographic segmentation', 'Behavioural segmentation', 'Target market selection', 'The STP framework', 'Buyer personas', 'Perceptual maps', 'Positioning statements', 'Differentiation strategies'],
    related: [{ plate: 'segment' }, { tool: 'marketing/segmentation/', label: 'Market segmentation' }],
  }),
  C({
    id: 'm06', school: 'marketing', code: 'M06', level: 'intermediate', requires: ['m05'], recommends: ['b02'],
    title: 'Customer Analytics and RFM',
    blurb: 'Score customers by recency, frequency and value, and measure lifetime value, retention and churn.',
    topics: ['Recency', 'Frequency', 'Monetary value', 'RFM scoring', 'Customer segmentation', 'Customer lifetime value', 'Customer acquisition cost', 'Retention rates', 'Churn', 'Cohort analysis', 'Loyalty strategies'],
    related: [{ tool: 'marketing/segmentation/#rfm', label: 'RFM customer value' }, { tool: 'marketing/growth/#unit-economics', label: 'Unit economics' }],
  }),
  C({
    id: 'm07', school: 'marketing', code: 'M07', level: 'intermediate', requires: ['m02'],
    title: 'Digital Marketing',
    blurb: 'Search, social, email and content, and the funnels that turn attention into customers.',
    topics: ['SEO', 'SEM', 'Organic and paid search', 'Social media strategy', 'Email marketing', 'Content marketing', 'Conversion funnels', 'Landing page optimisation', 'Customer journeys', 'Engagement metrics', 'Campaign measurement'],
  }),
  C({
    id: 'm08', school: 'marketing', code: 'M08', level: 'advanced', requires: ['m07'], recommends: ['b04'],
    title: 'Marketing Analytics',
    blurb: 'The metrics that show whether marketing pays, and how to measure them without fooling yourself.',
    topics: ['CTR', 'Conversion rate', 'CPA', 'CAC', 'ROAS', 'ROI', 'Customer lifetime value', 'Attribution', 'A/B testing', 'Funnel analysis', 'Acquisition metrics', 'Retention metrics', 'Marketing dashboards'],
    related: [{ plate: 'growth' }, { tool: 'marketing/growth/', label: 'Growth and experiments' }],
  }),
  C({
    id: 'm09', school: 'marketing', code: 'M09', level: 'intermediate', requires: ['m02'],
    title: 'Pricing and Consumer Psychology',
    blurb: 'Elasticity, value-based and dynamic pricing, discounts and what behavioural economics says about price.',
    topics: ['Price elasticity', 'Cost-based pricing', 'Value-based pricing', 'Competitive pricing', 'Psychological pricing', 'Dynamic pricing', 'Discount strategies', 'Behavioural economics', 'Pricing experiments'],
    related: [{ plate: 'pricing' }, { tool: 'marketing/pricing/', label: 'Pricing' }],
  }),
  C({
    id: 'm10', school: 'marketing', code: 'M10', level: 'intermediate', requires: ['m02'],
    title: 'Branding and Product Strategy',
    blurb: 'Brand equity and architecture, product portfolios, new products and growth strategy.',
    topics: ['Brand equity', 'Brand identity', 'Positioning', 'Brand architecture', 'Brand loyalty', 'Product portfolio analysis', 'New product development', 'Product life cycle', 'Ansoff matrix', 'BCG matrix'],
  }),
  C({
    id: 'm11', school: 'marketing', code: 'M11', level: 'advanced', requires: ['m01'], recommends: ['m10'],
    title: 'Competitive and Strategic Analysis',
    blurb: 'SWOT, PESTEL, Five Forces and value propositions, turned into a recommendation.',
    topics: ['SWOT', 'PESTEL', 'Porter’s Five Forces', 'Competitor benchmarking', 'Value proposition', 'Competitive positioning', 'Blue Ocean Strategy', 'Strategic recommendations', 'Go-to-market planning'],
  }),
  C({
    id: 'm12', school: 'marketing', code: 'M12', level: 'advanced', requires: ['m05', 'm08', 'm11'],
    title: 'Integrated Marketing Strategy',
    blurb: 'The capstone: a full marketing plan with budget, forecast and a consulting-style recommendation.',
    topics: ['Marketing plan development', 'Budget allocation', 'Campaign planning', 'Multichannel strategy', 'Marketing forecasting', 'International marketing', 'Performance monitoring', 'Strategic evaluation', 'Final consulting project'],
  }),
];

/**
 * The suggested study order in each school, written for someone starting out: general before specialised,
 * and every course after the courses it requires (tools/study-check.mjs checks this). School pages, the
 * curriculum and the prerequisite maps list courses in this order; the codes are labels, not the order.
 *   Finance:   what finance is → recording (F01) → full statements (F02) → the maths of money over time (F04)
 *              → reading statements (F03) → corporate decisions (F05) → investments (F06) → modelling → advanced.
 *   Analytics: what analytics is → clean data → the spreadsheet → databases → statistics → charts
 *              → correlation → regression → machine learning, forecasting, optimisation → experiments (capstone).
 *   Marketing: fundamentals → the 4Ps → research → segmentation and positioning → brand and product → pricing
 *              → services → digital → customer analytics → strategy → marketing analytics → integrated plan (capstone).
 */
export const ORDER = [
  'f00', 'f01', 'f02', 'f04', 'f03', 'f05', 'f06', 'f07', 'f08',
  'b01', 'b02', 'b03', 'b07', 'b04', 'b10', 'b05', 'b06', 'b08', 'b09', 'b11', 'b12',
  'm01', 'm02', 'm04', 'm05', 'm10', 'm09', 'm03', 'm07', 'm06', 'm11', 'm08', 'm12',
];
export const COURSES = ORDER.map((id) => ALL.find((c) => c.id === id));
if (COURSES.some((c) => !c) || COURSES.length !== ALL.length) throw new Error('catalog: ORDER must list every course exactly once');

export const COURSE = Object.fromEntries(COURSES.map((c) => [c.id, c]));

/**
 * Learning paths: suggested routes through the catalogue for three starting points, in study order. A path may
 * include planned courses; the study home marks the first course in it that is ready as the place to start.
 */
export const PATHS = [
  {
    id: 'beginner', name: 'Beginner', blurb: 'New to business subjects. Learn what finance, analytics and marketing are, then how a business records its money, cleans its data and sells its products, then the first tools of analysis.',
    courses: ['f00', 'f01', 'b01', 'b02', 'm01', 'm02', 'f02', 'f04', 'b03', 'b04', 'm04', 'm05'],
  },
  {
    id: 'intermediate', name: 'Intermediate', blurb: 'You know the basics of accounting, spreadsheets and marketing. Build analysis and decision skills.',
    courses: ['f02', 'f04', 'f03', 'b02', 'b04', 'b05', 'b06', 'm02', 'm04', 'm05', 'm06', 'f05'],
  },
  {
    id: 'advanced', name: 'Advanced', blurb: 'Comfortable with statistics and corporate finance. Go on to investments, modelling, machine learning and strategy.',
    courses: ['f06', 'f07', 'f08', 'b02', 'b08', 'b09', 'b11', 'b12', 'm07', 'm08', 'm11', 'm12'],
  },
];

/** Labs: the interactive workbenches, each tied to a built course. */
export const LABS = [
  { id: 'accounting', course: 'f01', name: 'Accounting Lab', blurb: 'Analyse transactions, post journal entries to T-accounts, and watch the trial balance and statements update.' },
  { id: 'cleaning', course: 'b02', name: 'Data Cleaning Lab', blurb: 'Inspect a messy dataset, choose cleaning steps, and see what each one does to the data and the conclusions.' },
  { id: 'mix', course: 'm02', name: 'Marketing Mix Simulator', blurb: 'Choose a product, price, channels and promotion for a fictional launch and see simulated demand, margin and share.' },
];
