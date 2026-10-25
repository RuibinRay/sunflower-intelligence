// finance-accounting-economics.ex.js — F00 · Finance, accounting and economics: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = Number.isInteger(c) ? c.toLocaleString('en-US') : c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};

export const widgets = {
  'three-lenses': {
    type: 'formula',
    title: 'Three measures of one business: accounting profit, cash flow and economic profit',
    intro: 'A simple one-owner business: all sales are in cash, bills are paid as they arrive and no stock is held, so the only gap between profit and cash is depreciation. The opportunity costs are what the owner gives up: the salary she could earn elsewhere and the return her invested money could earn.',
    inputs: [
      { id: 'revenue', label: 'Revenue for the year', min: 0, max: 200000, step: 1000, value: 84000, fmt: 'money' },
      { id: 'cash', label: 'Expenses paid in cash', min: 0, max: 200000, step: 1000, value: 63000, fmt: 'money' },
      { id: 'dep', label: 'Depreciation (a non-cash expense)', min: 0, max: 20000, step: 500, value: 3000, fmt: 'money' },
      { id: 'salary', label: 'Salary the owner gives up', min: 0, max: 100000, step: 1000, value: 52000, fmt: 'money' },
      { id: 'capital', label: 'Owner’s money invested in the business', min: 0, max: 100000, step: 1000, value: 24000, fmt: 'money' },
      { id: 'rate', label: 'Return that money could earn elsewhere', min: 0, max: 10, step: 0.1, value: 1.5, fmt: 'pct' },
    ],
    compute: (v) => {
      const profit = v.revenue - v.cash - v.dep;
      const ocf = v.revenue - v.cash;
      const forgone = v.capital * v.rate / 100;
      const opp = v.salary + forgone;
      const econ = profit - opp;
      let note;
      if (profit < 0) {
        note = `The business makes an accounting loss of ${money(-profit)}. ${ocf > 0 ? `Even so, it brings in ${money(ocf)} of cash, because depreciation reduces profit without using cash this year; the cash for the equipment left when it was bought.` : 'Its day-to-day activities also use more cash than they bring in.'} Economic profit is lower still, at ${money(econ)}, once the owner’s opportunity costs are counted.`;
      } else if (econ < 0) {
        note = `The accounts show a profit of ${money(profit)} and the business brings in ${money(ocf)} of cash, yet the economic profit is ${money(econ)}: the owner gives up ${money(opp)} a year to run it. By the accounting rules it is profitable; as a use of her time and money it is not.`;
      } else {
        note = `Accounting profit of ${money(profit)} more than covers the owner’s opportunity costs of ${money(opp)}, so the economic profit is ${money(econ)}: running the business beats her next best alternative, on these figures.`;
      }
      return {
        headline: { label: 'Economic profit', value: money(econ) },
        rows: [
          ['Accounting profit (revenue − cash expenses − depreciation)', money(profit)],
          ['Operating cash flow (revenue − cash expenses)', money(ocf)],
          ['Return the invested money could earn elsewhere', money(forgone)],
          ['Opportunity costs not in the accounts (salary + forgone return)', money(opp)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Measure', values: ['Accounting profit', 'Operating cash flow', 'Economic profit'] },
          series: [{ name: 'Dollars per year', values: [profit, ocf, Math.round(econ * 100) / 100] }],
          y: { label: 'Dollars per year' },
        },
      };
    },
  },
};

const FIELDS = ['Accounting', 'Microeconomics', 'Macroeconomics', 'Finance'];

export const guided = [
  {
    id: 'f00-fae-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Match each question to the field it mainly belongs to.',
    items: [
      'How much revenue did a clothing brand report for last year?',
      'Will a rise in the central bank’s interest rate slow spending across the economy?',
      'If a café opens next door, how many customers will Lantern lose?',
      'Should a hotel borrow to build a spa, given what the spa is expected to earn and how uncertain that is?',
      'Is unemployment in the region rising or falling?',
      'Should the cost of an espresso machine be recorded as an asset or an expense?',
    ],
    categories: FIELDS,
    answer: [0, 2, 1, 3, 2, 0],
    hints: [
      'Ask whether the question is about what happened (and how to record it), how one market behaves, how the whole economy behaves, or what to do next with money.',
      'A rival opening next door affects one market: micro. Interest rates and unemployment across a region or country are macro.',
    ],
    feedback: {
      1: 'Spending across a whole economy, and the central bank’s rate, are macroeconomic matters.',
      2: 'Competition between businesses in one local market is a microeconomic question about demand.',
      3: 'Deciding whether to borrow and invest, weighing expected cash and risk, is a finance decision.',
      5: 'How to record a cost is a question of accounting rules.',
    },
    solution: 'Last year’s revenue: accounting. Central bank rate and spending: macroeconomics. Rival café: microeconomics. Borrowing for a spa: finance. Regional unemployment: macroeconomics. Recording the machine: accounting.',
  },
  {
    id: 'f00-fae-g2', type: 'steps', kind: 'numerical',
    prompt: 'Pier Street Tacos, a fictional food truck, had revenue of $120,000 last year and expenses of $95,000, including $5,000 of depreciation on the truck. All sales were in cash and every bill was paid as it arrived. Its owner gave up a $45,000 job to run it, and the $30,000 she put into the business could have earned 2% a year in a savings account. Work out the three measures.',
    solution: 'Accounting profit: 120,000 − 95,000 = $25,000. Operating cash flow: 25,000 + 5,000 depreciation = $30,000 (or 120,000 − 90,000 of cash expenses). Opportunity costs: 45,000 + 30,000 × 0.02 = 45,000 + 600 = $45,600. Economic profit: 25,000 − 45,600 = −$20,600. The truck is profitable in its accounts but earns the owner less than her old job.',
    steps: [
      { id: 'f00-fae-g2-s1', type: 'num',
        prompt: 'What is the accounting profit?',
        answer: 25000, check: () => 120000 - 95000, unit: '$', places: 0, tol: 0.5,
        hints: ['Accounting profit = revenue − expenses, with every recorded expense included.'],
        wrong: [{ value: 30000, say: 'That leaves out depreciation. It is a recorded expense, so it reduces accounting profit.' }] },
      { id: 'f00-fae-g2-s2', type: 'num',
        prompt: 'What is the operating cash flow?',
        answer: 30000, check: () => (120000 - 95000) + 5000, unit: '$', places: 0, tol: 0.5,
        hints: ['Which expense used no cash last year?', 'Add the $5,000 of depreciation back to the accounting profit.'],
        wrong: [
          { value: 25000, say: 'That is the accounting profit. Depreciation reduced it without any cash leaving last year: add it back.' },
          { value: 20000, say: 'You subtracted depreciation twice. Depreciation is already inside the $95,000; to get cash, add it back to profit.' },
        ] },
      { id: 'f00-fae-g2-s3', type: 'num',
        prompt: 'What is the economic profit? (Enter a negative number for an economic loss.)',
        answer: -20600, check: () => (120000 - 95000) - (45000 + 30000 * 0.02), unit: '$', places: 0, tol: 0.5,
        hints: ['Opportunity costs are the salary given up plus what the $30,000 could have earned.', '30,000 × 0.02 = 600; subtract 45,000 and 600 from the accounting profit.'],
        wrong: [
          { value: -20000, say: 'You left out the return the $30,000 could have earned elsewhere: 30,000 × 2% = $600.' },
          { value: -15600, say: 'Economic profit starts from accounting profit ($25,000), not from cash flow.' },
          { value: 20600, say: 'Check the sign: the opportunity costs ($45,600) are larger than the profit ($25,000), so the result is negative.' },
        ] },
    ],
  },
  {
    id: 'f00-fae-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Is each report financial accounting or managerial accounting?',
    items: [
      'Lantern’s annual financial statements, sent to Coastline Bank',
      'A weekly report of the profit on each catering event, for Ana',
      'A hotel’s budget for next year, by department',
      'A listed company’s annual report to its shareholders, prepared under IFRS',
      'An airline’s report of fuel cost per seat on each route, for its route planners',
    ],
    categories: ['Financial accounting', 'Managerial accounting'],
    answer: [0, 1, 1, 0, 1],
    hints: [
      'Who reads it: outsiders such as banks and shareholders, or managers inside the business?',
      'Reports for outsiders follow US GAAP or IFRS; internal reports follow no imposed rules and can look ahead.',
    ],
    feedback: {
      1: 'The report is for the owner-manager to run the business, in whatever form helps: managerial accounting.',
      2: 'A budget looks ahead and is for managers: managerial accounting. This is one reason “accounting only looks back” is too simple.',
      4: 'Route planners are insiders, and cost per seat by route is an internal measure: managerial accounting.',
    },
    solution: 'Statements for the bank and the annual report for shareholders are financial accounting (for outsiders, under GAAP or IFRS). The event-profit report, the budget and the route cost report are managerial accounting (for insiders, no imposed rules).',
  },
  {
    id: 'f00-fae-g4', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery owner borrowed heavily at a variable interest rate to open a second shop, because her accounts showed a strong profit for the last three years. A year later the central bank raised interest rates sharply, her loan payments jumped and the shop struggled to pay them. Which perspective did her decision most clearly leave out?',
    options: [
      'Macroeconomics: she made no allowance for interest rates rising, though her loan rate moved with them.',
      'Accounting: she should have checked her last three years of profits more carefully before borrowing.',
      'Microeconomics: she did not study how her customers choose between her loaves and a rival bakery’s.',
      'None: interest rate changes cannot be anticipated at all, so no forecast could have prepared her for them.',
    ],
    answer: 0,
    hints: [
      'Her records were sound. What changed was an economy-wide condition.',
      'Which field studies interest rates and central bank policy?',
    ],
    feedback: {
      1: 'Her past profits were not the problem; they were real. The decision was about the future, and a condition outside the business changed.',
      2: 'Micro demand matters to any shop, but the trouble here came from interest rates, a macro condition.',
      3: 'Nobody can predict rates exactly, but a forecast can assume higher rates and test whether the business still copes. Ignoring the possibility is the mistake.',
    },
    solution: 'The accounts were a fair record of the past, but the decision depended on the future cost of borrowing, which is driven by macroeconomic conditions and central bank policy. A finance analysis would have asked: can the new shop still pay its loan if rates rise by a few points? Macroeconomics supplies that assumption; finance tests the decision against it.',
  },
];

export const independent = [
  {
    id: 'f00-fae-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best describes how finance and accounting differ?',
    options: [
      'Accounting aims at a faithful record of what happened; finance aims at good decisions about the future, using that record as one input.',
      'Accounting deals with the day-to-day records of businesses; finance deals only with stock markets and the prices of the shares traded on them.',
      'Accounting uses numbers and rules; finance uses only judgement and experience, without calculations.',
      'Finance follows reporting standards such as US GAAP or IFRS; accounting has no fixed rules and relies on each firm’s own choices.',
    ],
    answer: 0,
    feedback: {
      1: 'Finance covers businesses, households and governments, not only stock markets. Corporate finance is mainly about decisions inside businesses.',
      2: 'Both are numerical. Finance uses forecasts, present values and probabilities alongside judgement.',
      3: 'It is the other way round: financial accounting follows GAAP or IFRS. Finance decisions follow no reporting standard.',
    },
    solution: 'The two differ in purpose. Accounting produces a reliable record of past events under agreed rules; finance uses that record, with forecasts and economic assumptions, to decide how to raise, allocate and manage money.',
  },
  {
    id: 'f00-fae-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional printing firm reports net income of $42,000 for the year, after $8,000 of depreciation on its presses. Assuming customers paid in cash, bills were paid as they arose and no stock was held, what was its operating cash flow?',
    answer: 50000, check: () => 42000 + 8000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 34000, say: 'You subtracted depreciation again. It has already been deducted to reach net income; because it used no cash, add it back.' },
      { value: 42000, say: 'That is net income. Depreciation reduced it without any cash leaving this year.' },
    ],
    solution: 'Depreciation is a non-cash expense, so operating cash flow = 42,000 + 8,000 = $50,000.',
  },
  {
    id: 'f00-fae-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional bookshop earns an accounting profit of $70,000. Its owner could earn $60,000 a year as a manager elsewhere, and the $50,000 she has invested in the shop could earn 4% a year in a safe deposit. What is the bookshop’s economic profit?',
    answer: 8000, check: () => 70000 - (60000 + 50000 * 0.04), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 10000, say: 'You counted the forgone salary but not the forgone return on the $50,000: 4% of it is $2,000.' },
      { value: 68000, say: 'You subtracted only the forgone return. The $60,000 salary she gives up is also an opportunity cost.' },
    ],
    solution: 'Opportunity costs: 60,000 + 50,000 × 0.04 = 60,000 + 2,000 = $62,000. Economic profit: 70,000 − 62,000 = $8,000. The shop beats her next best alternative, but by much less than the accounts suggest.',
  },
  {
    id: 'f00-fae-i4', type: 'multi', kind: 'applied',
    prompt: 'Which of these are macroeconomic conditions that Ana should make an assumption about in Lantern’s forecast? Select all that apply.',
    options: [
      'The general rate of inflation',
      'The level of interest rates set or influenced by the central bank',
      'Whether one particular office manager likes her coffee',
      'Unemployment in the region',
      'The price a rival caterer charges for an event',
      'Whether the economy grows or falls into recession',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'One customer’s taste is a matter for Ana’s own market research: micro, not macro.',
      4: 'A rival’s price is a feature of Lantern’s own market: microeconomics.',
    },
    solution: 'Inflation, interest rates, regional unemployment and the growth of the economy are economy-wide conditions: macroeconomics. One customer’s preferences and a rival’s prices are features of Lantern’s particular market: microeconomics. Both matter to the forecast.',
  },
  {
    id: 'f00-fae-i5', type: 'mc', kind: 'conceptual',
    prompt: 'In the United States, which statement about professional roles is accurate?',
    options: [
      'Independent auditors of financial statements filed with the SEC must be licensed CPAs, and state boards of accountancy license CPAs.',
      'Financial analysts must hold a CPA licence from a state board of accountancy before they are allowed to value a company or its shares.',
      'Economists at the central bank set the accounting rules that companies follow when they prepare their financial statements.',
      'A company’s CFO is responsible only for preparing its tax returns; investment and financing decisions belong to the board.',
    ],
    answer: 0,
    feedback: {
      1: 'A CPA licence is not required to work as a financial analyst. Some analysts need securities licences from FINRA, and many take optional certifications.',
      2: 'Accounting rules are set by standard setters (the FASB for US GAAP, the IASB for IFRS), not by economists.',
      3: 'The CFO leads the whole finance function: investment, financing and working capital decisions, and financial reporting.',
    },
    solution: 'The CPA licence is granted by each state’s board of accountancy, and the independent auditors whose reports accompany financial statements filed with the SEC must hold it. Financial analysts, economists and CFOs do different jobs, as described in the lesson.',
  },
  {
    id: 'f00-fae-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional university café could be refitted for $80,000 today. The refit is expected to add $50,000 of cash a year for two years, compared with leaving the café as it is. At a discount rate of 10% a year, what is the present value of the extra cash? Give the answer to the nearest cent.',
    answer: 86776.86, check: () => 50000 / 1.1 + 50000 / 1.1 ** 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 100000, say: 'That adds the two years’ cash without discounting. Cash in one and two years is worth less today: divide by 1.10 and by 1.10².' },
      { value: 82644.63, say: 'You discounted both years by 1.10². The first year’s cash is only one year away: divide it by 1.10.' },
      { value: 6776.86, say: 'That is the value added after subtracting the $80,000 cost. The question asks for the present value of the extra cash alone.' },
    ],
    solution: 'Year 1: 50,000 ÷ 1.10 = $45,454.55. Year 2: 50,000 ÷ 1.21 = $41,322.31. Total: $86,776.86, which is $6,776.86 more than the $80,000 cost, so on these estimates the refit adds value.',
  },
];

export const check = [
  {
    id: 'f00-fae-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A financial analyst reads a company’s financial statements for last year. What does she mainly use them for?',
    options: [
      'As the starting point for forecasting the company’s future cash flows, adjusting the figures where needed',
      'To check that the company followed US GAAP in preparing them, which is the analyst’s main job',
      'As an exact prediction of next year’s results, since a company’s results tend to repeat from one year to the next',
      'She does not use them: finance looks only forward, so past figures are irrelevant to her work',
    ],
    answer: 0,
    feedback: {
      1: 'Checking compliance with the accounting rules is the auditor’s job. The analyst uses the statements to look ahead.',
      2: 'Last year is evidence about next year, not a prediction of it. Conditions change, and the analyst adjusts for that.',
      3: 'Finance looks forward, but its forecasts start from the record of what has happened.',
    },
    solution: 'Finance uses accounting records as the base for forecasts, converts profit to cash, adds opportunity costs that the accounts omit, and adjusts for changes it expects.',
  },
  {
    id: 'f00-fae-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hair salon earns an accounting profit of $38,000. Its owner gave up a $41,000 salary to run it, and the $20,000 she invested could have earned 2.5% a year. What is the salon’s economic profit? (Enter a negative number for an economic loss.)',
    answer: -3500, check: () => 38000 - (41000 + 20000 * 0.025), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -3000, say: 'You left out the forgone return on the $20,000: 2.5% of it is $500.' },
      { value: 3500, say: 'Check the sign: opportunity costs of $41,500 exceed the $38,000 profit.' },
      { value: 38000, say: 'That is the accounting profit. Economic profit subtracts the opportunity costs the accounts leave out.' },
    ],
    solution: 'Opportunity costs: 41,000 + 20,000 × 0.025 = 41,000 + 500 = $41,500. Economic profit: 38,000 − 41,500 = −$3,500.',
  },
  {
    id: 'f00-fae-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each topic as microeconomics or macroeconomics.',
    items: [
      'How a rise in the price of milk changes the number of lattes customers buy',
      'The national inflation rate',
      'How a hotel sets its room rates against nearby competitors',
      'The central bank’s decision on interest rates',
      'The growth of total output in the economy',
    ],
    categories: ['Microeconomics', 'Macroeconomics'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      1: 'Inflation is a rise in prices across the whole economy: macro.',
      2: 'One hotel’s pricing against its rivals is a decision in a particular market: micro.',
      3: 'Central bank policy affects the whole economy: macro.',
    },
    solution: 'Micro: lattes and milk prices, hotel room rates. Macro: inflation, central bank interest rates, total output.',
  },
  {
    id: 'f00-fae-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional van-hire firm shows net income of $15,000, after $20,000 of depreciation on its vans. Its customers pay on the day and it pays its bills as they arrive. The owner says, “We only made $15,000, so we only generated $15,000 of cash.” What should a finance analyst reply?',
    options: [
      'Operating cash flow was about $35,000, because depreciation is an expense that used no cash this year.',
      'Operating cash flow was about −$5,000, because depreciation must be paid in cash on top of the other expenses.',
      'The owner is right: profit and cash are always equal for a firm whose customers pay on the day.',
      'Cash flow cannot be estimated without knowing the vans’ market value.',
    ],
    answer: 0,
    feedback: {
      1: 'Depreciation spreads the cost of vans bought earlier; no cash is paid for depreciation itself. Subtracting it again is the mistake.',
      2: 'They differ whenever there are non-cash expenses or timing differences, as here.',
      3: 'Market value matters for some decisions, but this cash flow follows from profit plus depreciation.',
    },
    solution: 'With no timing differences, operating cash flow = net income + depreciation = 15,000 + 20,000 = $35,000. The cash for the vans left when they were bought; depreciation only spreads that cost across the years they are used.',
  },
  {
    id: 'f00-fae-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional cleaning company had revenue of $150,000, expenses paid in cash of $110,000 and depreciation of $12,000. All sales were in cash. What was its operating cash flow?',
    answer: 40000, check: () => 150000 - 110000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 28000, say: 'That is accounting profit: it subtracts depreciation, which used no cash. Cash flow is revenue minus the expenses paid in cash.' },
      { value: 52000, say: 'You added depreciation to revenue minus cash expenses. Depreciation was never subtracted there, so there is nothing to add back.' },
    ],
    solution: 'Operating cash flow = revenue − cash expenses = 150,000 − 110,000 = $40,000. (Accounting profit is 40,000 − 12,000 = $28,000; adding the depreciation back gives the same $40,000.)',
  },
  {
    id: 'f00-fae-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Why is “accounting looks back, finance looks forward” only an approximation?',
    options: [
      'Managerial accounting prepares budgets and forecasts, and financial accounting relies on estimates about the future, while finance studies the past as evidence.',
      'Because accounting and finance are really the same discipline, with the same purpose and different job titles.',
      'Because finance is not allowed to use past data, so it relies on forecasts that accountants prepare.',
      'Because financial statements report only on the future, so accounting looks further ahead than finance.',
    ],
    answer: 0,
    feedback: {
      1: 'They are distinct: their purposes differ (a reliable record versus a good decision), even though each uses both past and future.',
      2: 'Finance relies heavily on past data: past cash flows and returns are the evidence for its forecasts.',
      3: 'Financial statements report past periods and the position at a date, though they use estimates.',
    },
    solution: 'Each field touches both past and future. Accounting budgets and estimates; finance studies history. The lasting difference is purpose: accounting aims at a faithful record, finance at a good decision about the future.',
  },
];
