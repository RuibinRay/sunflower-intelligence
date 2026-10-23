// assess-m4.js — F02 module 4 test: Putting the statements together (linking-the-statements, gaap-and-ifrs).
// New questions on this module’s own skills (roll-forwards, locating a failed link, the tax echo of a change, restating
// between frameworks, IAS 7 as amended by IFRS 18), not copies of lesson or Module 1–3 exercises. Every business here
// is fictional and appears nowhere else in the course. No hints; solutions show in review. Standards facts agree with
// gaap-and-ifrs.js (checked 2026-10-23).

export const items = [
  // ---------------------------------------------------------------- linking-the-statements
  {
    id: 'f02-m4-1', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'Pinfold Joinery Inc., a fictional company, owed income tax of $4,200 at the start of the year (last year’s balance, settled in April). Its income tax expense for the year was $18,600, and income taxes payable at the end of the year were $5,100. How much income tax did it pay in cash during the year?',
    answer: 17700, check: () => 4200 + 18600 - 5100, unit: '$', places: 0,
    wrong: [
      { value: 13500, say: 'Start from the opening balance: the $4,200 owed at the start of the year was paid this year too.' },
      { value: 18600, say: 'That is the expense. Roll the payable forward: opening + expense − paid = closing.' },
      { value: 19500, say: 'Income taxes payable rose by $900, so less was paid than was charged: subtract the increase, don’t add it.' },
    ],
    solution: 'Roll forward Income Taxes Payable: opening 4,200 + expense 18,600 − paid = closing 5,100, so paid = 4,200 + 18,600 − 5,100 = $17,700. The preparer ties this to the income taxes paid shown with the statement of cash flows; a difference means the tax entry or a payment is misposted.',
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
    prompt: 'Ashwick Ceramics Inc., a fictional US maker of tableware, writes its inventory down by $10,000 at its year end. Its income tax is 21% of income before tax, and its estimated tax payments for the year were fixed in advance, so any change in the year’s tax is still owed at the year end. By how much does the write-down change its total liabilities? Enter a decrease as a negative number.',
    answer: -2100, check: () => -0.21 * 10000, unit: '$', places: 0,
    wrong: [
      { value: 0, say: 'The write-down lowers the year’s tax by 21% × 10,000. Because that tax is still owed, it is income taxes payable that falls.' },
      { value: -10000, say: 'That is the fall in inventory, an asset. The liability that changes is income taxes payable.' },
      { value: -7900, say: 'That is the change in net income, and so in equity. Liabilities change by the tax effect alone.' },
      { value: 2100, say: 'Lower tax means less owed: liabilities fall.' },
    ],
    solution: 'Income before tax −10,000; income tax −2,100; net income −7,900. Inventory (assets) −10,000 = income taxes payable (liabilities) −2,100 + retained earnings (equity) −7,900. Cash is unchanged this year: the tax saving reaches cash when the tax is settled.',
  },
  {
    id: 'f02-m4-4', lesson: 'linking-the-statements', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'Quenby Florals Inc., a fictional florist, owed $600 of interest at the start of the year and paid it on 5 January; the bookkeeper debited that payment to Interest Expense. The lender’s statement shows interest of $2,400 for the year, of which $1,800 was paid during the year and $600 is owed at 31 December, and the year-end accrual was recorded correctly. The ledger shows Interest Expense of $3,000 and Interest Payable of $1,200. Record the correcting entry on 31 December.',
    accounts: ['Interest Payable', 'Interest Expense', 'Cash', 'Notes Payable', 'Accounts Payable', 'Interest Revenue', 'Retained Earnings', 'Prepaid Insurance'],
    lines: [{ acct: 'Interest Payable', dr: 600 }, { acct: 'Interest Expense', cr: 600 }],
    solution: 'The interest roll-forward finds it: opening 600 + expense 2,400 − paid (600 + 1,800) = closing 600, but the ledger shows a payable of 1,200 and an expense of 3,000. The January payment settled last year’s liability, so it should have reduced Interest Payable, not added to this year’s expense. Debit Interest Payable 600; credit Interest Expense 600. Net income rises by $600 before tax; cash and the statement of cash flows are unaffected, because the payment itself was recorded correctly.',
  },
  {
    id: 'f02-m4-5', lesson: 'linking-the-statements', type: 'mc', kind: 'applied',
    prompt: 'Holmwood Kennels Inc., a fictional company, prepares its statement of cash flows by the indirect method. The draft ends at $31,200, but the balance sheet, taken from the ledger, shows cash of $36,000. The investing and financing sections have been checked and are right. Which line of the draft operating section below is most likely wrong?',
    data: { table: {
      head: ['Line in the draft', '$'],
      rows: [['Net income', '61,400'], ['Depreciation', '5,600'], ['Increase in accounts receivable', '(1,800)'], ['Decrease in inventory', '3,100'], ['Increase in accounts payable', '(2,400)'], ['Net cash from operating activities', '65,900']],
    } },
    options: [
      'Increase in accounts payable, shown as (2,400)',
      'Increase in accounts receivable, shown as (1,800)',
      'Decrease in inventory, shown as 3,100',
      'Depreciation, shown as 5,600',
    ],
    answer: 0,
    feedback: {
      1: 'An increase in receivables is rightly subtracted, and a sign error there would make a gap of 3,600, not 4,800.',
      2: 'A decrease in inventory is rightly added; a sign error there would make a gap of 6,200.',
      3: 'Depreciation is rightly added back; leaving it out or reversing it would make a gap of 5,600 or 11,200.',
    },
    solution: 'The draft is 36,000 − 31,200 = 4,800 short, exactly twice 2,400: a sign error on the accounts payable line. An increase in accounts payable means cash not yet paid out, so it is added. Corrected operating cash flow: 61,400 + 5,600 − 1,800 + 3,100 + 2,400 = 70,700, and the statement then ends at $36,000.',
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
    prompt: 'Nettlefold Books Ltd, a fictional bookseller, wrote a stock of textbooks down last year from their cost of $48,000 to their net realisable value of $31,000. This year it sells half of them for $24,000, net of selling costs; the other half, still unsold at the year end, now have a net realisable value of $26,000. By how much is this year’s profit before tax higher under IFRS than it would be under US GAAP?',
    answer: 8500, check: () => Math.min(26000, 48000 / 2) - 31000 / 2, unit: '$', places: 0,
    wrong: [
      { value: 17000, say: 'Only the write-down on the half still held can be reversed; the half sold has gone, at the same profit under both frameworks.' },
      { value: 10500, say: 'The reversal is capped at cost, $24,000 for the half still held, not at the new net realisable value of $26,000.' },
      { value: 0, say: 'The profit on the half sold is the same under both, but IAS 2 also reverses the write-down on the half still held; US GAAP doesn’t.' },
    ],
    solution: 'Half sold: carrying amount 31,000 ÷ 2 = 15,500 under both frameworks, so the profit on sale, 24,000 − 15,500 = 8,500, is the same. Half held: cost 24,000, carrying 15,500, NRV 26,000. IFRS measures it at min(24,000, 26,000) = 24,000 and reverses 24,000 − 15,500 = $8,500; US GAAP keeps 15,500. IFRS profit before tax is $8,500 higher.',
  },
  {
    id: 'f02-m4-8', lesson: 'gaap-and-ifrs', type: 'num', kind: 'applied',
    prompt: 'Seacombe Foods Inc., a fictional food producer with no specified main business activity, reports under US GAAP. Its investing section shows purchases of equipment of $350,000 and $40,000 of proceeds from selling a delivery truck. Its operating section includes interest paid of $64,000, interest received of $9,000 and dividends received of $5,000; dividends paid of $120,000 are in financing. Under IAS 7 as amended by IFRS 18, what would its net cash from investing activities be? Enter an outflow as a negative number.',
    answer: -296000, check: () => -350000 + 40000 + 9000 + 5000, unit: '$', places: 0,
    wrong: [
      { value: -310000, say: 'That is the US GAAP figure. Interest and dividends received move into investing.' },
      { value: -324000, say: 'Interest and dividends received are inflows: moving them into investing makes it less negative.' },
      { value: -360000, say: 'Interest paid moves to financing, not investing.' },
      { value: -176000, say: 'Dividends paid stay in financing under both frameworks.' },
    ],
    solution: 'US GAAP investing: −350,000 + 40,000 = −310,000. Under IAS 7 as amended by IFRS 18, interest received (9,000) and dividends received (5,000) move from operating to investing: −310,000 + 9,000 + 5,000 = −$296,000. Interest paid moves to financing, and dividends paid stay there.',
  },
  {
    id: 'f02-m4-9', lesson: 'gaap-and-ifrs', type: 'mc', kind: 'conceptual',
    prompt: 'Quorndon Retail Inc., a fictional US public business entity, has a financial year ending on 30 June. ASU 2024-03 applies to annual reporting periods beginning after 15 December 2026. In which annual statements must Quorndon first provide the new expense disaggregation note (ignoring early adoption)?',
    options: [
      'The year ending 30 June 2027',
      'The year ending 30 June 2028',
      'The year ending 31 December 2027',
      'The year ending 30 June 2026',
    ],
    answer: 1,
    feedback: {
      0: 'That year began on 1 July 2026, before 15 December 2026, so it is too early.',
      2: 'Quorndon’s year ends on 30 June; the first annual period beginning after 15 December 2026 is 1 July 2027 to 30 June 2028.',
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
      2: 'IFRS 18 requires operating profit and profit before financing and income taxes, not EBITDA. A company may still present operating profit before depreciation, amortisation and IAS 36 impairments; IFRS 18 lists it among the subtotals that are not management-defined performance measures, so it needs no MPM note. An “adjusted EBITDA” that leaves out other items would be one.',
      5: 'Expenses may be presented by nature, by function or by a mix; a company that uses function discloses specified expenses by nature in a note.',
    },
    solution: 'Required: operating profit; profit before financing and income taxes; income and expenses on borrowings in the financing category; and a single note explaining and reconciling any management-defined performance measures. EBITDA is not a required subtotal (operating profit before depreciation, amortisation and IAS 36 impairments may be shown and is not treated as a management-defined performance measure), and expenses need not be presented by nature on the face.',
  },
  {
    id: 'f02-m4-11', lesson: 'gaap-and-ifrs', type: 'num', kind: 'numerical',
    prompt: 'Brackenfield Medical Ltd, a fictional device maker, spends $240,000 on research and $500,000 on development during the year. All six IAS 38 criteria are met partway through, after which $350,000 of the development spending is incurred. All of the development spending falls before 1 July; the device is available for use on 1 July and is amortised straight-line over five years from that date, with no residual value. By how much is its profit before tax for the year higher under IFRS than it would be under US GAAP?',
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
