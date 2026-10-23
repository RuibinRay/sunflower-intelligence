// assess-m4.js — F02 module 4 test: Putting the statements together (linking-the-statements, gaap-and-ifrs).
// New questions, not copies of lesson exercises: every business here is fictional and appears nowhere else in the course.
// No hints; solutions show in review. Standards facts agree with gaap-and-ifrs.js (checked 2026-10-23).

export const items = [
  // ---------------------------------------------------------------- linking-the-statements
  {
    id: 'f02-m4-1', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'Galloway Outfitters Inc., a fictional retailer, had retained earnings of $120,000 at the start of the year and $151,000 at the end; its net income for the year was $47,000. Dividends payable rose from $4,000 to $6,500 during the year. How much cash did Galloway pay in dividends during the year?',
    answer: 13500, check: () => (120000 + 47000 - 151000) - (6500 - 4000), unit: '$', places: 0,
    wrong: [
      { value: 16000, say: 'That is the dividends declared. $2,500 of them were added to dividends payable rather than paid.' },
      { value: 18500, say: 'An increase in dividends payable means less was paid than declared: subtract the $2,500, don’t add it.' },
      { value: 31000, say: 'That is the change in retained earnings. Use the retained earnings link to find dividends declared first.' },
    ],
    solution: 'Dividends declared = opening RE + net income − closing RE = 120,000 + 47,000 − 151,000 = 16,000. Dividends payable rose by 6,500 − 4,000 = 2,500, so cash paid = 16,000 − 2,500 = $13,500, the financing outflow.',
  },
  {
    id: 'f02-m4-2', lesson: 'linking-the-statements', type: 'classify', kind: 'conceptual',
    prompt: 'Glenmore Clinics Inc., a fictional healthcare company, has these events this year. What does each do to this year’s net income and cash?',
    items: [
      'Depreciation on its scanning equipment',
      'Repaying $50,000 of a bank loan’s principal',
      'Paying, in January, wages that were accrued at the previous year end',
      'An employer group paying in advance for next year’s health screenings',
      'Paying this month’s rent on a clinic',
      'Estimating bad debt expense on patient receivables',
      'Paying the interest on its bank loan as it falls due',
    ],
    categories: ['Lowers net income; no cash effect this year', 'Lowers cash; no effect on net income this year', 'Lowers both net income and cash', 'Raises cash; no effect on net income this year'],
    answer: [0, 1, 1, 3, 2, 0, 2],
    feedback: {
      1: 'Principal is not an expense: repaying it lowers cash (a financing outflow) and the liability, not net income.',
      2: 'The wages were last year’s expense. Paying them settles Wages Payable and lowers cash now.',
      3: 'Cash arrives now, but it is unearned revenue until the screenings are performed.',
      5: 'The estimate creates an expense and an allowance; no cash moves.',
    },
    solution: 'No cash, lower income: depreciation and bad debt expense. Lower cash, no income effect: repaying principal and paying last year’s accrued wages. Both: rent and interest paid as they fall due. Cash in, no income yet: the advance payment for screenings.',
  },
  {
    id: 'f02-m4-3', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'Kiln Ceramics Inc., a fictional US maker of tableware, writes its inventory down by $10,000 at its year end. Its income tax is 21% of income before tax, and the year’s tax is settled in cash within the year. By how much does the write-down change the year’s cash from operating activities?',
    answer: 2100, check: () => -(1 - 0.21) * 10000 + 10000, unit: '$', places: 0,
    wrong: [
      { value: -7900, say: 'That is the change in net income. The write-down lowered inventory without using cash, so the indirect method recovers the $10,000 through the change in inventory.' },
      { value: 10000, say: 'A write-down brings in no cash. Only the tax it saves, 21% of $10,000, is cash.' },
      { value: 0, say: 'Here the tax is settled within the year, so the lower tax is a real cash saving this year.' },
    ],
    solution: 'Net income −10,000 × (1 − 0.21) = −7,900; inventory is 10,000 lower than it would have been, so the change in inventory adds back 10,000; operating cash flow −7,900 + 10,000 = +$2,100, the tax saved.',
  },
  {
    id: 'f02-m4-4', lesson: 'linking-the-statements', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-09-01',
    prompt: 'On 1 September Kiln Ceramics buys a new kiln for $40,000, paying $15,000 in cash and signing a two-year note payable to the supplier for the rest. Record the purchase. (The solution explains how it appears in the statement of cash flows.)',
    accounts: ['Equipment', 'Cash', 'Notes Payable', 'Accounts Payable', 'Current Portion of Long-Term Debt', 'Depreciation Expense', 'Interest Expense', 'Accumulated Depreciation—Equipment'],
    lines: [{ acct: 'Equipment', dr: 40000 }, { acct: 'Cash', cr: 15000 }, { acct: 'Notes Payable', cr: 25000 }],
    solution: 'Debit Equipment 40,000; credit Cash 15,000 and Notes Payable 25,000. In the statement of cash flows only the $15,000 paid is an investing outflow. The $25,000 financed by the note moved no cash, so it is disclosed as a noncash investing and financing activity; the repayments will be financing outflows when they are made.',
  },
  {
    id: 'f02-m4-5', lesson: 'linking-the-statements', type: 'mc', kind: 'applied',
    prompt: 'Rowanfield Foods Inc., a fictional wholesaler, reports net income of $2.4 million and cash from operating activities of $0.9 million. Depreciation was $0.2 million, receivables rose by $1.1 million and inventory rose by $0.6 million; no other operating balances changed. Which reading do the linked statements best support?',
    options: [
      'Growth in receivables and inventory absorbed the cash its profit produced; check whether customers are paying more slowly.',
      'Net income must be overstated by $1.5 million, because a profitable company’s operating cash flow should equal its profit.',
      'Depreciation of $0.2 million should have been deducted again in the statement of cash flows, so operating cash flow is overstated.',
      'The gap shows that Rowanfield paid its suppliers far too quickly this year and should slow down its payments to them.',
    ],
    answer: 0,
    feedback: {
      1: 'Net income and operating cash flow measure different things; a gap is not evidence of an error.',
      2: 'Depreciation is added back because it used no cash. Deducting it again would understate operating cash flow.',
      3: 'Payables didn’t change, so supplier payments don’t explain the gap; receivables and inventory do.',
    },
    solution: '2.4 + 0.2 − 1.1 − 0.6 = 0.9: the whole gap is cash tied up in receivables and inventory. Profit is being earned, but it is sitting with customers and on shelves. The next questions are whether customers are paying more slowly and whether inventory is building up unsold, which F03’s ratios measure.',
  },

  // ---------------------------------------------------------------- gaap-and-ifrs
  {
    id: 'f02-m4-6', lesson: 'gaap-and-ifrs', type: 'multi', kind: 'conceptual',
    prompt: 'Granite Robotics Inc., a fictional US manufacturer with no specified main business activity, is converting from US GAAP to IFRS for its 2027 statements. Which of its current policies must change? Select all that apply.',
    options: [
      'Costing its spare-parts inventory by LIFO',
      'Expensing development costs that meet all six IAS 38 criteria',
      'Costing its finished goods and raw materials by FIFO',
      'Not reversing inventory write-downs when values recover',
      'Carrying its factory and machinery at cost less accumulated depreciation',
      'Classifying interest paid as an operating cash flow',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'FIFO is permitted by IAS 2 as well as by US GAAP.',
      4: 'IAS 16 offers the cost model as well as the revaluation model, so Granite may keep carrying its factory and machinery at cost.',
    },
    solution: 'Must change: LIFO (not permitted by IAS 2); expensing qualifying development costs (IAS 38 requires them to be capitalised); not reversing recovered write-downs (IAS 2 requires the reversal, up to cost); and interest paid as operating (IAS 7 as amended by IFRS 18 makes it financing from 2027). FIFO and the cost model are allowed under both.',
  },
  {
    id: 'f02-m4-7', lesson: 'gaap-and-ifrs', type: 'num', kind: 'numerical',
    prompt: 'Nettlefold Books Ltd, a fictional bookseller reporting under IFRS, wrote a stock of textbooks down last year from their cost of $48,000 to their net realisable value of $31,000. This year a new course adopts the textbook, and the books, still unsold, now have a net realisable value of $52,000. At what amount does Nettlefold carry them at the end of this year?',
    answer: 48000, check: () => Math.min(52000, 48000), unit: '$', places: 0,
    wrong: [
      { value: 52000, say: 'Inventory is carried at the lower of cost and net realisable value, so it can’t rise above its $48,000 cost.' },
      { value: 31000, say: 'That is the US GAAP answer. Under IAS 2 the write-down is reversed when net realisable value recovers.' },
      { value: 17000, say: 'That is the amount reversed. The question asks for the carrying amount after the reversal.' },
    ],
    solution: 'IAS 2 measures the books at min(cost 48,000, NRV 52,000) = $48,000, reversing the whole $17,000 write-down (48,000 − 31,000) and no more. Under US GAAP they would stay at $31,000.',
  },
  {
    id: 'f02-m4-8', lesson: 'gaap-and-ifrs', type: 'num', kind: 'applied',
    prompt: 'Seacombe Foods Inc., a fictional food producer with no specified main business activity, reports under US GAAP. Its cash from operating activities of $820,000 includes interest paid of $64,000, interest received of $9,000 and dividends received of $5,000; dividends paid of $120,000 are in financing. If it applied IAS 7 as amended by IFRS 18, what would its cash from operating activities be?',
    answer: 870000, check: () => 820000 + 64000 - 9000 - 5000, unit: '$', places: 0,
    wrong: [
      { value: 940000, say: 'Dividends paid are already a financing outflow under US GAAP, so they don’t move.' },
      { value: 884000, say: 'Interest and dividends received also leave operating: they move to investing.' },
      { value: 898000, say: 'Interest and dividends received were inflows in operating; moving them out lowers operating cash flow.' },
    ],
    solution: 'Interest paid moves to financing (+64,000 to operating); interest received and dividends received move to investing (−9,000 and −5,000). 820,000 + 64,000 − 9,000 − 5,000 = $870,000. Dividends paid stay in financing. Total cash is unchanged.',
  },
  {
    id: 'f02-m4-9', lesson: 'gaap-and-ifrs', type: 'mc', kind: 'conceptual',
    prompt: 'Hollybank Retail Inc., a fictional US public business entity, has a financial year ending on 30 June. ASU 2024-03 applies to annual reporting periods beginning after 15 December 2026. In which annual statements must Hollybank first provide the new expense disaggregation note (ignoring early adoption)?',
    options: [
      'The year ending 30 June 2027',
      'The year ending 30 June 2028',
      'The year ending 31 December 2027',
      'The year ending 30 June 2026',
    ],
    answer: 1,
    feedback: {
      0: 'That year began on 1 July 2026, before 15 December 2026, so it is too early.',
      2: 'Hollybank’s year ends on 30 June; the first annual period beginning after 15 December 2026 is 1 July 2027 to 30 June 2028.',
      3: 'That year began on 1 July 2025, well before the effective date.',
    },
    solution: 'The first annual period beginning after 15 December 2026 is the one that begins on 1 July 2027 and ends on 30 June 2028. ASU 2025-01 confirmed that every public business entity first applies the requirements in an annual period; interim reporting follows for interim periods within annual periods beginning after 15 December 2027.',
  },
  {
    id: 'f02-m4-10', lesson: 'gaap-and-ifrs', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these does IFRS 18 require of a company with no specified main business activity? Select all that apply.',
    options: [
      'An operating profit subtotal in the statement of profit or loss',
      'A subtotal of profit before financing and income taxes',
      'EBITDA presented as a required subtotal on the face of the statement',
      'Interest expense on bank loans shown in the financing category',
      'A note reconciling any management-defined performance measures',
      'All operating expenses presented by nature on the face of the statement',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'IFRS 18 requires operating profit and profit before financing and income taxes; EBITDA is not a required subtotal (a company that uses it publicly explains it as a management-defined performance measure).',
      5: 'Expenses may be presented by nature, by function or by a mix; a company that uses function discloses specified expenses by nature in a note.',
    },
    solution: 'Required: operating profit; profit before financing and income taxes; income and expenses on borrowings in the financing category; and a single note explaining and reconciling management-defined performance measures. EBITDA is not a required subtotal, and expenses need not be presented by nature on the face.',
  },
  {
    id: 'f02-m4-11', lesson: 'gaap-and-ifrs', type: 'num', kind: 'numerical',
    prompt: 'Brackenfield Medical Ltd, a fictional device maker, spends $240,000 on research and $500,000 on development during the year. All six IAS 38 criteria are met partway through, after which $350,000 of the development spending is incurred. The device is available for use on 1 July and is amortised straight-line over five years from that date, with no residual value. By how much is its profit before tax for the year higher under IFRS than it would be under US GAAP?',
    answer: 315000, check: () => 350000 - 350000 / 5 * 6 / 12, unit: '$', places: 0,
    wrong: [
      { value: 350000, say: 'The asset is available for use from 1 July, so six months of amortisation (35,000) are charged this year under IFRS.' },
      { value: 280000, say: 'Amortisation starts on 1 July: charge half a year (35,000), not a full year (70,000).' },
      { value: 500000, say: 'Development spending before the criteria were met is expensed under IFRS too; only the $350,000 is capitalised.' },
    ],
    solution: 'US GAAP expense: 240,000 + 500,000 = 740,000. IFRS expense: research 240,000 + development before the criteria 150,000 + amortisation 350,000 ÷ 5 × 6/12 = 35,000, so 425,000. Difference: 740,000 − 425,000 = $315,000 (= capitalised 350,000 − amortisation 35,000).',
  },
  {
    id: 'f02-m4-12', lesson: 'gaap-and-ifrs', type: 'mc', kind: 'applied',
    prompt: 'Two fictional hotel groups own identical buildings bought at the same cost. One reports under US GAAP. The other reports under IFRS, uses the revaluation model and this year revalued its buildings upward by $40 million. Compared with the US GAAP group, what does the IFRS group report?',
    options: [
      'Higher assets and equity now, and higher depreciation, so lower profit, in later years',
      'A $40 million gain in this year’s profit, with no change in later years’ depreciation',
      'The same assets and equity, because a revaluation is disclosed only in the notes',
      'Lower total assets, because fair value replaces cost and accumulated depreciation is removed',
    ],
    answer: 0,
    feedback: {
      1: 'A revaluation increase goes to other comprehensive income and the revaluation surplus in equity, not to profit, and the higher carrying amount raises later depreciation.',
      2: 'The revalued amount is recognised on the balance sheet: assets rise by $40 million and equity by the surplus.',
      3: 'An upward revaluation raises the carrying amount, so total assets rise.',
    },
    solution: 'Under IAS 16 the buildings are carried at fair value: assets rise by $40 million and the surplus goes to other comprehensive income and equity. Depreciation is then based on the higher carrying amount, so later profit is lower. Ratios built on assets or equity will differ between the two groups even though the buildings are identical.',
  },
];
