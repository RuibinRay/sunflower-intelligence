// assess-m1.js — F01 module 1 test: The language of business (what-is-accounting, accounts-and-classifications, accounting-equation).
// No hints. Each item has a full solution, shown when the student reviews the test.

export const items = [
  {
    id: 'f01-m1-1', lesson: 'what-is-accounting', type: 'mc', kind: 'conceptual',
    prompt: 'A coffee roaster’s production manager wants a weekly report of the cost per kilogram roasted, broken down by roasting machine. Which branch of accounting produces this report, and what rules must it follow?',
    options: [
      'Managerial accounting; no externally imposed rules, only what makes the report useful for the decision',
      'Financial accounting; US GAAP, because the report is about costs',
      'Tax accounting; tax law, because costs are deductible',
      'Financial accounting; IFRS, because it concerns production',
    ],
    answer: 0,
    feedback: {
      1: 'Financial accounting produces general-purpose statements for outsiders. An internal cost report by machine is for managers, and GAAP does not govern it.',
      2: 'Tax accounting works out taxable income under tax law; it does not serve weekly production decisions.',
      3: 'IFRS, like US GAAP, governs reports for outside users, not internal management reports.',
    },
    solution: 'The report is for an internal user making an operating decision, so it is managerial accounting. No external rules apply: it can be weekly, cover part of the business and mix money with nonfinancial measures such as kilograms roasted.',
  },
  {
    id: 'f01-m1-2', lesson: 'what-is-accounting', type: 'classify', kind: 'applied',
    prompt: 'Match each practice to the assumption or principle it reflects.',
    items: [
      'A hotel group reports its results for the six months to 30 June.',
      'A battery-storage installer’s owner keeps her family’s rental flat out of the company’s accounts.',
      'A clothing brand’s notes explain that its main factory supplier has stopped trading.',
      'An airline records a new aircraft at the price paid plus the delivery and certification costs needed to fly it.',
      'A university does not put a dollar value on its academic reputation in its balance sheet.',
      'An online retailer that has decided to shut down prepares its statements on a basis other than going concern, and says so.',
    ],
    categories: ['Going concern assumption', 'Historical cost principle', 'Time period assumption', 'Monetary unit assumption', 'Full disclosure principle', 'Economic entity assumption'],
    answer: [2, 5, 4, 1, 3, 0],
    feedback: {
      2: 'The supplier’s failure is not a transaction, but readers need it to understand the risks the brand faces: full disclosure.',
      3: 'Cost includes what it takes to get an asset ready for use, so delivery and certification are part of the aircraft’s historical cost.',
      5: 'Once the retailer intends to close, the going concern assumption no longer holds, and the statements must state the basis used.',
    },
    solution: 'Six-month results: time period assumption. Family flat kept out: economic entity assumption. Supplier failure in the notes: full disclosure principle. Aircraft at price plus costs to get it ready: historical cost principle. Reputation not recorded: monetary unit assumption. Different basis on closure: going concern assumption.',
  },
  {
    id: 'f01-m1-3', lesson: 'what-is-accounting', type: 'num', kind: 'numerical',
    prompt: 'An online retailer reported net income of $820,000 for the year. Its auditor finds that $36,900 of December expenses were recorded in January of the following year instead. What percentage of reported net income does the error represent?',
    answer: 4.5, check: () => (36900 / 820000) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 4.71, say: 'You divided by the corrected net income ($783,100). Materiality is judged against the figure readers were given: the reported $820,000.' },
      { value: 0.045, say: 'That is the ratio as a decimal. Enter it as a percentage: 0.045 is 4.5%.' },
    ],
    solution: '36,900 ÷ 820,000 = 0.045, or 4.5%. That is below a 5% rule of thumb, so on size alone the error might be presumed immaterial. That is only the starting point: if the error let the retailer meet a profit target or a loan condition, or masked a downward trend, it would be material despite its size.',
  },
  {
    id: 'f01-m1-4', lesson: 'accounts-and-classifications', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each item by element.',
    items: [
      'A hotel’s deposits received for weddings next spring',
      'An airline’s fuel burned on last month’s flights',
      'A university’s lecture theatres',
      'A clothing brand’s amounts owed by department stores for goods delivered',
      'The amount shareholders paid a company for its shares',
      'Fees a battery-storage installer has earned for maintenance visits made this month',
    ],
    categories: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    answer: [1, 4, 0, 0, 2, 3],
    feedback: {
      0: 'The hotel has been paid for weddings it has not yet hosted. It owes the service or a refund: a liability (unearned revenue).',
      1: 'Fuel already burned in operating flights is a resource used up in earning revenue: an expense.',
      3: 'Amounts customers owe for goods already delivered are receivables: an asset.',
    },
    solution: 'Wedding deposits: liability. Fuel burned: expense. Lecture theatres: asset. Amounts owed by department stores: asset (receivables). Amount paid for shares: equity (common stock, or share capital). Maintenance fees earned: revenue.',
  },
  {
    id: 'f01-m1-5', lesson: 'accounts-and-classifications', type: 'classify', kind: 'applied',
    prompt: 'A fictional catering company prepares its balance sheet at 31 December 2026. Classify each item.',
    items: [
      'Delivery vans',
      'Insurance paid in advance for the next eight months',
      'A bank-loan instalment due on 31 March 2027',
      'Bank-loan instalments due in 2028 and 2029',
      'Customers’ deposits for events in January',
      'Accumulated depreciation on the vans',
    ],
    categories: ['Current asset', 'Noncurrent asset', 'Current liability', 'Noncurrent liability'],
    answer: [1, 0, 2, 3, 2, 1],
    feedback: {
      2: 'The instalment falls due within twelve months of the balance sheet date, so it is the current portion of the loan.',
      3: 'These instalments fall due more than twelve months after 31 December 2026, so they are noncurrent.',
      5: 'Accumulated depreciation is a contra-asset. It reduces the vans and shares their group: noncurrent assets.',
    },
    solution: 'Vans: noncurrent asset. Eight months of prepaid insurance: current asset. Instalment due 31 March 2027: current liability. Instalments due 2028–2029: noncurrent liability. January event deposits: current liability (unearned revenue). Accumulated depreciation on the vans: a contra-asset within noncurrent assets.',
  },
  {
    id: 'f01-m1-6', lesson: 'accounts-and-classifications', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are permanent accounts, whose balances carry forward into the next period? Select all that apply.',
    options: ['Unearned Revenue', 'Dividends', 'Accumulated Depreciation—Building', 'Supplies Expense', 'Common Stock', 'Catering Revenue'],
    answer: [0, 2, 4],
    feedback: {
      1: 'Dividends collect one period’s distributions and are closed to Retained Earnings: temporary.',
      3: 'Expense accounts measure one period’s performance and start each period at zero: temporary.',
      5: 'Revenue accounts are temporary, closed at the end of every period.',
    },
    solution: 'Balance sheet accounts are permanent: Unearned Revenue (a liability), Accumulated Depreciation—Building (a contra-asset) and Common Stock (equity). Dividends, Supplies Expense and Catering Revenue are temporary accounts, closed to Retained Earnings at the end of each period.',
  },
  {
    id: 'f01-m1-7', lesson: 'accounts-and-classifications', type: 'num', kind: 'numerical',
    prompt: 'At 31 December 2026 a clothing brand owes $150,000 on a bank loan, repayable in five equal instalments of $30,000 on 30 June each year from 2027 to 2031. How much of the loan is a noncurrent liability at 31 December 2026?',
    answer: 120000, check: () => 150000 - 30000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 150000, say: 'The instalment due on 30 June 2027 falls within twelve months, so it is current. Take it out of the noncurrent figure.' },
      { value: 30000, say: 'That is the current portion, due within twelve months. The question asks for the part due later.' },
    ],
    solution: 'Only the 30 June 2027 instalment, $30,000, is due within twelve months, so it is current. The other four instalments are noncurrent: 4 × 30,000 = $120,000 (equivalently, 150,000 − 30,000).',
  },
  {
    id: 'f01-m1-8', lesson: 'accounting-equation', type: 'equation', kind: 'numerical',
    prompt: 'On 5 April Lantern pays its baristas the $1,400 of wages they earned during 16–31 March, which Lantern recorded as a liability at the end of March. Enter the change in each side of the accounting equation for the payment on 5 April (use a minus sign for a decrease and 0 for no change).',
    answer: { assets: -1400, liabilities: -1400, equity: 0 },
    solution: 'Cash (an asset) falls by $1,400 and Wages Payable (a liability) falls by $1,400. Equity does not change on 5 April: the wages expense, which reduced equity, was recorded in March when the baristas did the work. Paying the bill only settles the debt.',
  },
  {
    id: 'f01-m1-9', lesson: 'accounting-equation', type: 'equation', kind: 'applied',
    prompt: 'A clothing brand buys a $20,000 sewing machine, paying $5,000 in cash and signing a note payable for the rest. Enter the change in each side of the accounting equation.',
    answer: { assets: 15000, liabilities: 15000, equity: 0 },
    solution: 'Equipment rises by $20,000 and cash falls by $5,000, so total assets rise by a net $15,000. Notes payable rises by $15,000. Equity is unchanged: the brand has exchanged cash and a promise to pay for a machine, and is neither richer nor poorer. Check: 15,000 = 15,000 + 0.',
  },
  {
    id: 'f01-m1-10', lesson: 'accounting-equation', type: 'num', kind: 'numerical',
    prompt: 'An online retailer began the year with assets of $200,000 and liabilities of $120,000. During the year it issued $10,000 of new common stock and paid dividends of $6,000. At the end of the year its assets were $260,000 and its liabilities $150,000. What was its net income for the year?',
    answer: 26000, check: () => (260000 - 150000) - (200000 - 120000) - 10000 + 6000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 30000, say: 'That is the change in equity. Part of it came from new stock ($10,000), and dividends took $6,000 out: adjust for both.' },
      { value: 60000, say: 'That is the change in assets. Some of the growth was financed by new liabilities and new stock, which are not profit.' },
      { value: 14000, say: 'Dividends reduced equity, so net income must have been larger than the change left after new stock: add the dividends back, don’t subtract them.' },
    ],
    solution: 'Equity at the start = 200,000 − 120,000 = 80,000; at the end = 260,000 − 150,000 = 110,000, an increase of 30,000. That increase = new stock 10,000 + net income − dividends 6,000, so net income = 30,000 − 10,000 + 6,000 = $26,000.',
  },
  {
    id: 'f01-m1-11', lesson: 'accounting-equation', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these transactions changes neither total assets nor total equity?',
    options: [
      'A customer pays an invoice it already owed the business',
      'The business receives a deposit for work it will do next month',
      'The business pays a cash dividend',
      'The business earns revenue and is paid in cash on the spot',
    ],
    answer: 0,
    feedback: {
      1: 'A deposit raises cash (assets) and creates an obligation to do the work (liabilities). Total assets rise.',
      2: 'A dividend sends cash to the owners: assets and equity both fall.',
      3: 'Earning revenue for cash raises both assets and equity.',
    },
    solution: 'Collecting a receivable swaps one asset (the amount owed) for another (cash) of the same amount, so total assets, liabilities and equity are all unchanged. The revenue was recorded when the work was done, not when the cash arrived.',
  },
];
