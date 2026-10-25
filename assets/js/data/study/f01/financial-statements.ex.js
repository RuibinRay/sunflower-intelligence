// financial-statements.ex.js — F01 · Financial statements from the adjusted trial balance: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'fs-build': {
    type: 'statements',
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
    build: ['income', 'equity', 'balance'],
  },
  'fs-cash': {
    type: 'chart',
    kind: 'bar',
    title: 'Lantern’s net cash flows by activity, March 2026',
    x: { label: 'Activity', values: ['Operating', 'Investing', 'Financing'] },
    series: [{ name: 'Net cash flow ($)', values: [950, -4000, 29700] }],
    y: { label: 'Dollars' },
    note: 'The three add up to the $26,650 increase in cash. Financing (stock issued and the bank loan, less the dividend) provided more than the whole increase. Fictional figures from the Lantern case.',
  },
};

const STATEMENTS = ['Income statement', 'Statement of changes in equity', 'Balance sheet'];
const ACTIVITIES = ['Operating', 'Investing', 'Financing'];

export const guided = [
  {
    id: 'f01-fs-g1', type: 'classify', kind: 'conceptual',
    prompt: 'On which statement is each of these Lantern accounts reported?',
    items: ['Training Revenue', 'Dividends', 'Prepaid Insurance', 'Wages Payable', 'Depreciation Expense', 'Accumulated Depreciation—Equipment', 'Unearned Revenue', 'Supplies Expense'],
    categories: STATEMENTS,
    answer: [0, 1, 2, 2, 0, 2, 2, 0],
    hints: ['Revenues and expenses measure performance for the period.', 'Dividends change equity but are not an expense; assets, contra-assets and liabilities are positions at the period end.'],
    feedback: {
      1: 'Dividends reduce retained earnings in the statement of changes in equity. They are not an expense, so they stay off the income statement.',
      5: 'Accumulated depreciation is a contra-asset, deducted from Equipment on the balance sheet. Depreciation Expense is the income statement account.',
      6: 'Despite its name, Unearned Revenue is a liability: Lantern still owes two events. It goes on the balance sheet.',
    },
    solution: 'Income statement: Training Revenue, Depreciation Expense, Supplies Expense. Statement of changes in equity: Dividends. Balance sheet: Prepaid Insurance, Wages Payable, Accumulated Depreciation—Equipment (as a deduction from Equipment) and Unearned Revenue.',
  },
  {
    id: 'f01-fs-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional yoga studio’s adjusted trial balance at 30 June includes: Class Revenue $12,400; Wages Expense $5,100; Rent Expense $2,000; Depreciation Expense $350; Utilities Expense $400; Insurance Expense $150; Dividends $1,500; Retained Earnings (1 June) $8,200; Common Stock $10,000.',
    solution: 'Expenses = 5,100 + 2,000 + 350 + 400 + 150 = 8,000; net income = 12,400 − 8,000 = $4,400. Ending retained earnings = 8,200 + 4,400 − 1,500 = $11,100. Total equity = 10,000 + 11,100 = $21,100.',
    steps: [
      { id: 'f01-fs-g2-s1', type: 'num', prompt: 'What is net income for June?',
        answer: 4400, check: () => 12400 - (5100 + 2000 + 350 + 400 + 150), unit: '$', places: 0, tol: 0.5,
        hints: ['Add up the five expense accounts.', 'Net income = revenue − expenses; dividends are not an expense.'],
        wrong: [{ value: 2900, say: 'You subtracted the dividends. They belong in the statement of changes in equity, not the income statement.' }] },
      { id: 'f01-fs-g2-s2', type: 'num', prompt: 'What are retained earnings at 30 June?',
        answer: 11100, check: () => 8200 + 4400 - 1500, unit: '$', places: 0, tol: 0.5,
        hints: ['Ending = beginning + net income − dividends.'],
        wrong: [
          { value: 12600, say: 'Net income is added, but dividends are subtracted: 8,200 + 4,400 − 1,500.' },
          { value: 8200, say: 'That is the beginning balance, as the trial balance shows it. The ending balance includes June’s net income and dividends.' },
          { value: 2900, say: 'That is June’s change in retained earnings. Add it to the 8,200 already there.' },
        ] },
      { id: 'f01-fs-g2-s3', type: 'num', prompt: 'What is total equity at 30 June?',
        answer: 21100, check: () => 10000 + 11100, unit: '$', places: 0, tol: 0.5,
        hints: ['Equity = common stock + ending retained earnings.'],
        wrong: [{ value: 18200, say: 'You used the beginning retained earnings. The balance sheet needs the ending figure, 11,100.' }] },
    ],
  },
  {
    id: 'f01-fs-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional bicycle courier company’s adjusted balances at 31 December include: Cash $5,200; Accounts Receivable $2,300; Supplies $450; Prepaid Insurance $1,100; Equipment $24,000; Accumulated Depreciation—Equipment $6,000; Accounts Payable $1,900; Unearned Revenue $800; Notes Payable (due in three years) $10,000.',
    solution: 'Current assets = 5,200 + 2,300 + 450 + 1,100 = $9,050. Equipment, net = 24,000 − 6,000 = $18,000. Total assets = 9,050 + 18,000 = 27,050. Current liabilities = 1,900 + 800 = $2,700; the note is noncurrent.',
    steps: [
      { id: 'f01-fs-g3-s1', type: 'num', prompt: 'What are total current assets?',
        answer: 9050, check: () => 5200 + 2300 + 450 + 1100, unit: '$', places: 0, tol: 0.5,
        hints: ['Current assets are cash and items used up or turned into cash within a year.', 'Equipment is noncurrent; leave it and its accumulated depreciation out.'],
        wrong: [{ value: 27050, say: 'That is total assets. Equipment is a noncurrent asset: it will be used for several years.' }] },
      { id: 'f01-fs-g3-s2', type: 'num', prompt: 'At what amount is equipment shown, net of accumulated depreciation?',
        answer: 18000, check: () => 24000 - 6000, unit: '$', places: 0, tol: 0.5,
        hints: ['Book value = cost − accumulated depreciation.'],
        wrong: [{ value: 30000, say: 'Accumulated depreciation is a contra-asset: subtract it from the cost, don’t add it.' }] },
      { id: 'f01-fs-g3-s3', type: 'num', prompt: 'What are total current liabilities?',
        answer: 2700, check: () => 1900 + 800, unit: '$', places: 0, tol: 0.5,
        hints: ['Which liabilities are due within a year?', 'The note is due in three years.'],
        wrong: [
          { value: 12700, say: 'The note is due in three years, so it is a noncurrent liability.' },
          { value: 1900, say: 'Unearned revenue is a current liability: the company owes the service within the year.' },
        ] },
    ],
  },
  {
    id: 'f01-fs-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Under US GAAP, how is each cash flow classified in the statement of cash flows?',
    items: ['Cash received from customers', 'Interest paid on a bank loan', 'Repayment of a bank loan’s principal', 'Purchase of a delivery van for cash', 'Issue of common stock for cash', 'Dividends paid', 'Wages paid', 'Sale of old equipment for cash'],
    categories: ACTIVITIES,
    answer: [0, 0, 2, 1, 2, 2, 0, 1],
    hints: ['Operating = running the business; investing = long-term assets; financing = owners and lenders.', 'Under US GAAP interest paid is operating, although the loan’s principal is financing.'],
    feedback: {
      1: 'Under US GAAP interest paid is operating. (Under IAS 7 today it may be operating or financing; from 2027 most IFRS reporters must show it as financing.)',
      2: 'Repaying principal returns lenders’ money: financing.',
      5: 'Dividends paid return money to owners: financing under US GAAP.',
      7: 'Selling a long-term asset is an investing inflow, even though it isn’t revenue.',
    },
    solution: 'Operating: customers, interest paid, wages. Investing: the van and the sale of old equipment. Financing: loan principal repaid, stock issued, dividends paid.',
  },
];

export const independent = [
  {
    id: 'f01-fs-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s adjusted trial balance for the year shows: Room Revenue $640,000; Food Revenue $95,000; Wages Expense $310,000; Depreciation Expense $120,000; Utilities Expense $48,000; Supplies Expense $37,000; Interest Expense $22,000; Insurance Expense $18,000; Dividends $30,000. What is net income?',
    answer: 180000, check: () => (640000 + 95000) - (310000 + 120000 + 48000 + 37000 + 22000 + 18000), unit: '$', places: 0,
    wrong: [
      { value: 150000, say: 'You subtracted the dividends. They reduce retained earnings, not net income.' },
      { value: 202000, say: 'Interest expense is an expense of the period and belongs in a single-step income statement with the others.' },
    ],
    solution: 'Revenue = 640,000 + 95,000 = 735,000. Expenses = 310,000 + 120,000 + 48,000 + 37,000 + 22,000 + 18,000 = 555,000. Net income = 735,000 − 555,000 = $180,000.',
  },
  {
    id: 'f01-fs-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand begins the year with retained earnings of $182,000. Its revenue for the year is $640,000, its expenses $571,000, and it declares and pays dividends of $30,000. What are retained earnings at the end of the year?',
    answer: 221000, check: () => 182000 + (640000 - 571000) - 30000, unit: '$', places: 0,
    wrong: [
      { value: 251000, say: 'Dividends reduce retained earnings: subtract the $30,000.' },
      { value: 39000, say: 'That is the year’s increase in retained earnings. Add it to the $182,000 the year began with.' },
    ],
    solution: 'Net income = 640,000 − 571,000 = 69,000. Ending retained earnings = 182,000 + 69,000 − 30,000 = $221,000.',
  },
  {
    id: 'f01-fs-i3', type: 'num', kind: 'numerical',
    prompt: 'From these balances of a fictional online retailer, find total current assets: Cash $14,300; Accounts Receivable $6,200; Supplies $900; Prepaid Rent $3,000; Equipment $40,000; Accumulated Depreciation—Equipment $12,000; Land $25,000; Accounts Payable $7,400.',
    answer: 24400, check: () => 14300 + 6200 + 900 + 3000, unit: '$', places: 0,
    wrong: [
      { value: 77400, say: 'That includes the equipment (net) and land, which are noncurrent assets.' },
      { value: 17000, say: 'You subtracted accounts payable. It is a liability; current assets are added up on their own.' },
      { value: 21400, say: 'Prepaid rent is a current asset: rent paid in advance will be used up within the year.' },
    ],
    solution: 'Current assets: cash 14,300 + receivables 6,200 + supplies 900 + prepaid rent 3,000 = $24,400. Equipment (net 28,000) and land are noncurrent; accounts payable is a liability.',
  },
  {
    id: 'f01-fs-i4', type: 'num', kind: 'applied',
    prompt: 'A fictional catering company’s cash records for April show: cash received from customers $38,500; paid suppliers $14,200; paid employees $11,600; paid rent $3,000; paid interest on a bank loan $400; repaid $2,000 of the loan’s principal; bought an oven for $6,500; paid dividends of $1,000. Using the direct method under US GAAP, what is net cash provided by operating activities?',
    answer: 9300, check: () => 38500 - 14200 - 11600 - 3000 - 400, unit: '$', places: 0,
    wrong: [
      { value: 9700, say: 'Under US GAAP interest paid is an operating outflow. (Only the principal repayment is financing.)' },
      { value: 7300, say: 'Repaying loan principal is a financing activity, not operating.' },
      { value: -200, say: 'The oven is investing and the loan repayment and dividends are financing. Only operating flows belong here.' },
    ],
    solution: 'Operating: 38,500 − 14,200 − 11,600 − 3,000 − 400 = $9,300. The oven (−6,500) is investing; the loan principal (−2,000) and dividends (−1,000) are financing.',
  },
  {
    id: 'f01-fs-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these appear on Lantern’s balance sheet at 31 March 2026? Select all that apply.',
    options: ['Unearned revenue, $1,600', 'Dividends, $300', 'Accumulated depreciation, $200', 'Wages expense, $3,000', 'Retained earnings, $690', 'Net cash provided by financing activities, $29,700', 'Interest payable, $50'],
    answer: [0, 2, 4, 6],
    feedback: {
      1: 'Dividends appear in the statement of changes in equity; their effect reaches the balance sheet through retained earnings.',
      3: 'Wages Expense is an income statement account. The unpaid part appears on the balance sheet as Wages Payable, $1,400.',
      5: 'That is a statement of cash flows subtotal; the balance sheet shows only the resulting cash balance.',
    },
    solution: 'Balance sheet: unearned revenue (a liability), accumulated depreciation (deducted from equipment), retained earnings (ending figure, $690) and interest payable. Dividends go to the statement of changes in equity, wages expense to the income statement and the financing subtotal to the statement of cash flows.',
  },
  {
    id: 'f01-fs-i6', type: 'short', kind: 'applied',
    prompt: 'Write a short note (four to six sentences) to Coastline Bank’s loan officer summarising what Lantern’s March statements show. Use at least one figure from each of the income statement, the balance sheet and the statement of cash flows.',
    rubric: [
      'States that Lantern was profitable, with net income of $990 on revenue of $7,100.',
      'Explains that most of the $26,650 of cash came from financing ($29,700) rather than operations ($950).',
      'Describes the financing structure: liabilities of $21,810 against equity of $20,690.',
      'Mentions a near-term obligation or resource, such as the $8,000 owed for equipment, current assets of $30,700 against current liabilities of $11,810, or $1,600 of events still to deliver.',
      'Distinguishes profit from cash rather than treating them as the same thing, and notes that one month is a short record.',
    ],
    model: 'Lantern earned net income of $990 on revenue of $7,100 in March, its first month, after charging depreciation, interest and all wages earned. Its cash rose to $26,650, but $29,700 of that came from financing (the owner’s $20,000 and your $10,000 loan, less a $300 dividend); operations generated only $950 and $4,000 went on equipment. At 31 March liabilities were $21,810 and equity $20,690, so creditors fund slightly more of the assets than the owner. Current assets of $30,700 cover current liabilities of $11,810, which include $8,000 due to the equipment supplier in early April and $1,600 of events already paid for. The start is encouraging, but one month is too short to judge whether operations will generate the cash to service the loan.',
  },
];

export const check = [
  {
    id: 'f01-fs-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which pair of figures must be equal if Lantern’s statements articulate?',
    options: [
      'Cash at the end of the statement of cash flows and cash on the balance sheet',
      'Net income and the increase in cash',
      'Net income on the income statement and net cash provided by operating activities',
      'Total revenue on the income statement and cash received from customers in the period',
    ],
    answer: 0,
    feedback: {
      1: 'Net income ($990) is an accrual measure; cash rose by $26,650, mostly from financing.',
      2: 'They are reconciled in the indirect method, but they differ whenever there are accruals and deferrals: $990 against $950 for Lantern.',
      3: 'Revenue is earned, not received: $7,100 against $6,900 for Lantern.',
    },
    solution: 'The statement of cash flows explains the change in the Cash account, so its ending cash must equal the balance sheet’s cash ($26,650). The other links are net income into the statement of changes in equity and ending equity into the balance sheet.',
  },
  {
    id: 'f01-fs-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional university bookshop’s adjusted trial balance shows: Sales Revenue $86,000; Interest Revenue $1,000; Wages Expense $31,000; Rent Expense $18,000; Depreciation Expense $4,500; Supplies Expense $2,700; Utilities Expense $3,800; Dividends $5,000; Common Stock $40,000. Ignore the cost of the books sold, which is covered in F02. What is net income?',
    answer: 27000, check: () => (86000 + 1000) - (31000 + 18000 + 4500 + 2700 + 3800), unit: '$', places: 0,
    wrong: [
      { value: 22000, say: 'You subtracted the dividends. They are a distribution to owners, not an expense.' },
      { value: 26000, say: 'Interest revenue is revenue too: include the $1,000.' },
    ],
    solution: 'Revenue = 86,000 + 1,000 = 87,000; expenses = 31,000 + 18,000 + 4,500 + 2,700 + 3,800 = 60,000; net income = $27,000. Dividends and common stock are equity items.',
  },
  {
    id: 'f01-fs-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer’s cash records for the month show: received from customers $52,000 (including $9,000 of deposits for next month’s jobs); paid suppliers $21,000; paid employees $15,500; paid interest $700; bought a van for $28,000; borrowed $20,000 from a bank; paid dividends $3,000. Using the direct method under US GAAP, what is net cash provided by operating activities?',
    answer: 14800, check: () => 52000 - 21000 - 15500 - 700, unit: '$', places: 0,
    wrong: [
      { value: 5800, say: 'Customer deposits are operating receipts even though the revenue isn’t earned yet: the cash came from customers.' },
      { value: 15500, say: 'Under US GAAP interest paid is operating: include the $700 payment.' },
      { value: 3800, say: 'The van is investing, and the loan and dividends are financing. Only operating flows belong in this subtotal.' },
    ],
    solution: 'Operating = 52,000 − 21,000 − 15,500 − 700 = $14,800. The deposits count, because they are cash from customers. The van (−28,000) is investing; the loan (+20,000) and dividends (−3,000) are financing.',
  },
  {
    id: 'f01-fs-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these appear in a statement of changes in equity? Select all that apply.',
    options: ['Net income for the period', 'Dividends', 'Common stock issued during the period', 'Depreciation expense', 'Cash received from customers', 'Beginning and ending retained earnings'],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'Depreciation expense is part of the income statement; it reaches equity only through net income.',
      4: 'Cash receipts belong in the statement of cash flows.',
    },
    solution: 'The statement starts from each component’s beginning balance, adds stock issued and net income, subtracts dividends and ends at the closing balances. Individual expenses and cash flows appear on other statements.',
  },
  {
    id: 'f01-fs-k5', type: 'mc', kind: 'applied',
    prompt: 'Which conclusion about Lantern’s March is best supported by its financial statements?',
    options: [
      'Lantern was profitable, but most of its cash came from the owner and the bank rather than from operations.',
      'Lantern generated $26,650 of cash from its operations in March.',
      'Lantern is financed mainly by its owner: equity is more than twice its liabilities.',
      'Lantern made a loss, because it paid more cash for operating costs than it earned in revenue.',
    ],
    answer: 0,
    feedback: {
      1: '$26,650 is the total increase in cash. Operations provided $950; financing provided $29,700.',
      2: 'Liabilities ($21,810) are slightly larger than equity ($20,690): creditors fund a little more than half the assets.',
      3: 'Net income was $990. Operating payments of $5,950 were below revenue of $7,100, and in any case profit is measured on the accrual basis.',
    },
    solution: 'Net income was $990, so March was profitable. The statement of cash flows shows financing of $29,700 against operating cash flow of $950, so the cash pile reflects money contributed and borrowed, not money earned.',
  },
  {
    id: 'f01-fs-k6', type: 'num', kind: 'applied',
    prompt: 'A fictional café’s statement of cash flows shows net cash provided by operating activities of $3,200, net cash used in investing activities of $15,000 and net cash provided by financing activities of $14,000. Its balance sheet at the end of the year shows cash of $9,500. What was its cash at the start of the year?',
    answer: 7300, check: () => 9500 - (3200 - 15000 + 14000), unit: '$', places: 0,
    wrong: [
      { value: 11700, say: 'Cash rose by 2,200 during the year, so the start was lower than the end: subtract the change.' },
      { value: -22700, say: 'Investing used cash: treat the $15,000 as negative. The net change is 3,200 − 15,000 + 14,000 = 2,200.' },
    ],
    solution: 'Net change = 3,200 − 15,000 + 14,000 = +2,200. Beginning cash = ending cash − change = 9,500 − 2,200 = $7,300.',
  },
];
