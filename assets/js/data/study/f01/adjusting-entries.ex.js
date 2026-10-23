// adjusting-entries.ex.js — F01 · Adjusting entries: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

/** $1,234 or $1,234.56 (cents only when needed); a real minus sign for negatives. */
const money = (n) => {
  const v = Math.round(n * 100) / 100;
  const dp = Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2;
  const s = Math.abs(v).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '−$' : '$') + s;
};

const MARCH_ALL = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'];
const ADJ = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

export const widgets = {
  'adj-drill': {
    type: 'journal',
    transactions: ADJ,
    ask: ['accounts', 'direction', 'side', 'amount', 'equation', 'statements'],
  },
  'adj-sl': {
    type: 'formula',
    title: 'Straight-line depreciation and book value',
    intro: 'Cost, residual value and useful life set the yearly charge; the months used in the first financial year show how a part-year changes the schedule.',
    inputs: [
      { id: 'cost', label: 'Cost', min: 1000, max: 100000, step: 500, value: 12000, fmt: 'money' },
      { id: 'residual', label: 'Residual value', min: 0, max: 20000, step: 500, value: 0, fmt: 'money' },
      { id: 'life', label: 'Useful life', min: 1, max: 20, step: 1, value: 5, fmt: 'int', unit: 'years' },
      { id: 'months', label: 'Months used in the first financial year', min: 1, max: 12, step: 1, value: 12, fmt: 'int', unit: 'months' },
    ],
    compute: (v) => {
      if (v.residual >= v.cost) return { error: 'The residual value must be less than the cost; otherwise there is nothing to depreciate.' };
      const base = v.cost - v.residual;
      const perYear = base / v.life;
      const perMonth = perYear / 12;
      const first = Math.min(base, perMonth * v.months);
      const xs = [0];
      const bookValue = [v.cost];
      const accumulated = [0];
      let acc = 0;
      let y = 0;
      while (acc < base - 0.005 && y < 25) {
        y += 1;
        const d = y === 1 ? first : Math.min(perYear, base - acc);
        acc += d;
        xs.push(y);
        bookValue.push(Math.round((v.cost - acc) * 100) / 100);
        accumulated.push(Math.round(acc * 100) / 100);
      }
      const note = v.months === 12
        ? `The ${money(base)} to be depreciated is spread evenly over ${v.life} full year${v.life === 1 ? '' : 's'}: ${money(perYear)} a year, ${money(perMonth)} a month. Book value falls in a straight line from the cost, ${money(v.cost)}, to the residual value, ${money(v.residual)}, while accumulated depreciation rises by the same amounts.`
        : `The asset is used for only ${v.months} month${v.months === 1 ? '' : 's'} of its first financial year, so that year bears ${money(first)}. The remaining ${12 - v.months} month${12 - v.months === 1 ? '' : 's'} of its life fall into a last, partial year, so depreciation runs over ${y} financial years. The total is still ${money(base)}: the convention changes the timing, not the amount.`;
      return {
        headline: { label: 'Depreciation per year', value: money(perYear) },
        rows: [
          ['Depreciable amount (cost − residual value)', money(base)],
          ['Depreciation per month', money(perMonth)],
          [`First financial year (${v.months} month${v.months === 1 ? '' : 's'})`, money(first)],
          ['Book value at the end of the first financial year', money(v.cost - first)],
          ['Financial years with depreciation', String(y)],
          ['Book value when fully depreciated', money(v.residual)],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'End of financial year', values: xs },
          series: [
            { name: 'Book value', values: bookValue },
            { name: 'Accumulated depreciation', values: accumulated },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'adj-interest': {
    type: 'formula',
    title: 'Accrued interest: I = P × r × t',
    intro: 'Each month-end adds one month of interest to Interest Payable; each payment clears it.',
    inputs: [
      { id: 'principal', label: 'Principal', min: 1000, max: 100000, step: 500, value: 10000, fmt: 'money' },
      { id: 'rate', label: 'Annual interest rate', min: 0.5, max: 15, step: 0.25, value: 6, fmt: 'pct' },
      { id: 'every', label: 'Months between interest payments', min: 1, max: 12, step: 1, value: 3, fmt: 'int', unit: 'months' },
    ],
    compute: (v) => {
      const annual = v.principal * v.rate / 100;
      const monthly = annual / 12;
      const payment = monthly * v.every;
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const payable = months.map((k) => Math.round(((k - 1) % v.every + 1) * monthly * 100) / 100);
      return {
        headline: { label: 'Interest to accrue each month', value: money(monthly) },
        rows: [
          ['Interest for a full year (t = 1)', money(annual)],
          [`Interest paid every ${v.every} month${v.every === 1 ? '' : 's'}`, money(payment)],
          ['Interest Payable just before a payment', money(payment)],
          ['Month-end adjusting entry', `Debit Interest Expense ${money(monthly)}; credit Interest Payable ${money(monthly)}`],
        ],
        note: `One month of interest is ${money(v.principal)} × ${v.rate}% × 1/12 = ${money(monthly)}. Interest Payable builds up for ${v.every} month${v.every === 1 ? '' : 's'} to ${money(payment)}; the payment (debit Interest Payable, credit Cash) clears it and is not a new expense.`,
        chart: {
          kind: 'line',
          x: { label: 'Month-end since the loan began', values: months },
          series: [{ name: 'Interest Payable at month-end', values: payable }],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'adj-ledger': {
    type: 'ledger',
    transactions: [...MARCH_ALL, ...ADJ],
    show: ['taccounts', 'trial'],
    mode: 'watch',
  },
};

export const guided = [
  {
    id: 'f01-adj-g1', type: 'steps', kind: 'applied',
    prompt: 'Suppose that Lantern starts April with the $600 of supplies counted on 31 March, buys $2,100 more during April, and counts $750 on hand on 30 April.',
    solution: 'Supplies used = 600 + 2,100 − 750 = $1,950. Adjusting entry on 30 April: debit Supplies Expense 1,950; credit Supplies 1,950. The Supplies account is left at $750, the amount counted.',
    steps: [
      { id: 'f01-adj-g1-s1', type: 'num',
        prompt: 'How much supplies expense belongs to April?',
        answer: 1950, check: () => 600 + 2100 - 750, unit: '$', places: 0, tol: 0.5,
        hints: ['Supplies available in April = what Lantern started with + what it bought.', 'Used = available − what is still on the shelves: 600 + 2,100 − 750.'],
        wrong: [
          { value: 750, say: 'That is what is left on 30 April. It stays in the Supplies asset; the expense is what was used.' },
          { value: 2100, say: 'That is April’s purchases. Lantern also used some of the $600 it started with, and still has $750 on hand.' },
          { value: 1350, say: 'You left out the $600 on hand at the start of April. Supplies available were 600 + 2,100.' },
          { value: 2700, say: 'That is all the supplies available in April. $750 of them are still on hand and are not an expense yet.' },
        ] },
      { id: 'f01-adj-g1-s2', type: 'journal', chart: 'f01', date: '2026-04-30',
        prompt: 'Record the adjusting entry on 30 April.',
        accounts: ['Supplies', 'Supplies Expense', 'Cash', 'Accounts Payable', 'Prepaid Insurance'],
        lines: [{ acct: 'Supplies Expense', dr: 1950 }, { acct: 'Supplies', cr: 1950 }],
        hints: ['An expense increases (debit) and an asset decreases (credit).', 'No cash moves at the month end: the purchases were recorded when they happened.'] },
    ],
  },
  {
    id: 'f01-adj-g2', type: 'steps', kind: 'numerical',
    prompt: 'Suppose that on 1 June 2026 Lantern buys a delivery van for $30,000. It expects to use the van for five years and then sell it for $6,000. It uses the straight-line method with a full month of depreciation in the month of purchase.',
    solution: 'Depreciation per year = (30,000 − 6,000) ÷ 5 = 4,800; per month 400. Each month-end: debit Depreciation Expense 400; credit Accumulated Depreciation—Van 400. June to December is seven months, so accumulated depreciation at 31 December is 2,800 and book value is 30,000 − 2,800 = $27,200.',
    steps: [
      { id: 'f01-adj-g2-s1', type: 'num',
        prompt: 'What is the depreciation for one month?',
        answer: 400, check: () => (30000 - 6000) / 5 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['Start from the depreciable amount: cost − residual value.', '(30,000 − 6,000) ÷ 5 years gives a year; divide by 12 for a month.'],
        wrong: [
          { value: 500, say: 'You divided the full cost by 60 months. The $6,000 Lantern expects to get back is not used up: subtract it first.' },
          { value: 4800, say: 'That is a year’s depreciation. Divide by 12 for one month.' },
          { value: 6000, say: 'That is cost ÷ 5 years, ignoring the residual value, and for a whole year.' },
        ] },
      { id: 'f01-adj-g2-s2', type: 'journal', chart: 'f01', date: '2026-06-30',
        prompt: 'Record the depreciation adjustment on 30 June.',
        accounts: ['Van', 'Accumulated Depreciation—Van', 'Depreciation Expense', 'Cash', 'Accumulated Depreciation—Equipment'],
        lines: [{ acct: 'Depreciation Expense', dr: 400 }, { acct: 'Accumulated Depreciation—Van', cr: 400 }],
        hints: ['The expense goes up: debit. The asset’s cost stays where it is.', 'Credit the contra account that belongs to the van, not to the equipment.'] },
      { id: 'f01-adj-g2-s3', type: 'num',
        prompt: 'What is the van’s book value on 31 December 2026?',
        answer: 27200, check: () => 30000 - 7 * 400, unit: '$', places: 0, tol: 0.5,
        hints: ['Count the months from June to December, including June.', 'Book value = cost − accumulated depreciation = 30,000 − 7 × 400.'],
        wrong: [
          { value: 27600, say: 'That is six months. Lantern takes a full month in the month of purchase, so June counts: seven months.' },
          { value: 25200, say: 'That deducts a whole year of depreciation. The van has been used for seven months of 2026.' },
          { value: 30000, say: 'Book value is cost minus accumulated depreciation; the van has been depreciated for seven months.' },
        ] },
    ],
  },
  {
    id: 'f01-adj-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional clothing brand borrows $24,000 from its bank on 1 October 2026 at 7.5% a year. Six months’ interest and the principal are due on 31 March 2027. The brand’s financial year ends on 31 December.',
    solution: 'Interest for October to December = 24,000 × 0.075 × 3/12 = $450: debit Interest Expense 450, credit Interest Payable 450 on 31 December. The payment on 31 March 2027 covers six months, 24,000 × 0.075 × 6/12 = 900; 450 settles the liability and 450 is 2027’s expense.',
    steps: [
      { id: 'f01-adj-g3-s1', type: 'num',
        prompt: 'How much interest must be accrued on 31 December 2026?',
        answer: 450, check: () => 24000 * 0.075 * 3 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['I = P × r × t, with t in years.', 'October to December is three months: t = 3/12.'],
        wrong: [
          { value: 1800, say: 'That is a full year of interest. The loan has run for three months by 31 December.' },
          { value: 150, say: 'That is one month. October, November and December have all passed.' },
          { value: 900, say: 'That is the six months’ interest paid on 31 March. Only three of those months fall in 2026.' },
        ] },
      { id: 'f01-adj-g3-s2', type: 'journal', chart: 'f01', date: '2026-12-31',
        prompt: 'Record the adjusting entry on 31 December 2026.',
        accounts: ['Interest Expense', 'Interest Payable', 'Notes Payable', 'Cash', 'Interest Revenue'],
        lines: [{ acct: 'Interest Expense', dr: 450 }, { acct: 'Interest Payable', cr: 450 }],
        hints: ['The borrower has incurred an expense and owes it: expense up, liability up.', 'The principal is already in Notes Payable; only the interest is new.'] },
      { id: 'f01-adj-g3-s3', type: 'num',
        prompt: 'On 31 March 2027 the brand pays the six months’ interest. How much of that payment is interest expense of 2027?',
        answer: 450, check: () => 24000 * 0.075 * 6 / 12 - 24000 * 0.075 * 3 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['The payment covers October 2026 to March 2027.', 'The 2026 part was already recorded as an expense and is owed as Interest Payable.'],
        wrong: [{ value: 900, say: 'Half of the $900 is for October to December 2026. It was expensed in 2026; paying it only settles Interest Payable.' }] },
    ],
  },
  {
    id: 'f01-adj-g4', type: 'steps', kind: 'applied',
    prompt: 'Suppose that on 20 April Lantern receives $2,700 for three barista workshops at $900 each, to be held on 29 April, 13 May and 27 May. Lantern records the receipt as Cash and Unearned Revenue.',
    solution: 'One workshop is delivered in April, so $900 is earned: debit Unearned Revenue 900, credit Training Revenue 900 on 30 April. Unearned Revenue for these workshops is left at 2,700 − 900 = $1,800, the two May workshops still owed.',
    steps: [
      { id: 'f01-adj-g4-s1', type: 'num',
        prompt: 'How much training revenue has Lantern earned from this payment by 30 April?',
        answer: 900, check: () => 2700 / 3, unit: '$', places: 0, tol: 0.5,
        hints: ['Revenue is earned when each workshop is held.', 'One of the three workshops took place in April.'],
        wrong: [{ value: 2700, say: 'The cash arrived in April, but two of the workshops are in May. Only the one held on 29 April has been earned.' }] },
      { id: 'f01-adj-g4-s2', type: 'journal', chart: 'f01', date: '2026-04-30',
        prompt: 'Record the adjusting entry on 30 April.',
        accounts: ['Unearned Revenue', 'Training Revenue', 'Catering Revenue', 'Cash', 'Accounts Receivable'],
        lines: [{ acct: 'Unearned Revenue', dr: 900 }, { acct: 'Training Revenue', cr: 900 }],
        hints: ['The liability falls (debit) because one workshop no longer has to be delivered.', 'Workshops earn Training Revenue, not Catering Revenue.'] },
      { id: 'f01-adj-g4-s3', type: 'num',
        prompt: 'What remains in Unearned Revenue for these workshops on 30 April?',
        answer: 1800, check: () => 2700 - 900, unit: '$', places: 0, tol: 0.5,
        hints: ['Received − earned so far.'],
        wrong: [{ value: 900, say: 'That is what was earned. Two workshops, $1,800, are still owed.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'f01-adj-i1', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-12-31',
    prompt: 'A fictional hotel pays its housekeeping staff every two weeks. By 31 December the staff have worked four days since the last payday, at a total of $1,850 a day, and will be paid on 8 January. Record the adjusting entry on 31 December.',
    accounts: ['Wages Expense', 'Wages Payable', 'Cash', 'Accounts Payable', 'Prepaid Rent'],
    lines: [{ acct: 'Wages Expense', dr: 7400 }, { acct: 'Wages Payable', cr: 7400 }],
    solution: 'Wages earned but unpaid = 4 × 1,850 = $7,400: an accrued expense. Debit Wages Expense 7,400; credit Wages Payable 7,400. On 8 January the payment will debit Wages Payable, not Wages Expense.',
  },
  {
    id: 'f01-adj-i2', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-12-31',
    prompt: 'On 1 November a fictional online retailer paid $9,000 for six months’ warehouse rent (November to April) and debited Prepaid Rent. Record the adjusting entry on 31 December, the end of its financial year.',
    accounts: ['Rent Expense', 'Prepaid Rent', 'Cash', 'Accounts Payable', 'Prepaid Insurance'],
    lines: [{ acct: 'Rent Expense', dr: 3000 }, { acct: 'Prepaid Rent', cr: 3000 }],
    solution: 'Rent per month = 9,000 ÷ 6 = 1,500. November and December have passed: 2 × 1,500 = $3,000. Debit Rent Expense 3,000; credit Prepaid Rent 3,000. Prepaid Rent is left at $6,000 for January to April.',
  },
  {
    id: 'f01-adj-i3', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-05-31',
    prompt: 'Suppose that on 1 May Lantern lends $5,000 to one of its suppliers on a six-month note at 6% a year, with principal and interest due on 31 October. Record Lantern’s adjusting entry on 31 May.',
    accounts: ['Interest Receivable', 'Interest Revenue', 'Notes Receivable', 'Cash', 'Interest Expense', 'Interest Payable'],
    lines: [{ acct: 'Interest Receivable', dr: 25 }, { acct: 'Interest Revenue', cr: 25 }],
    solution: 'Lantern is the lender, so it earns interest: I = 5,000 × 0.06 × 1/12 = $25 for May. Accrued revenue: debit Interest Receivable 25; credit Interest Revenue 25. The note itself was recorded on 1 May (debit Notes Receivable, credit Cash) and is not part of the adjustment.',
  },
  {
    id: 'f01-adj-i4', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-30',
    prompt: 'Suppose that on 1 April Lantern pays $1,200 for a three-month advertising package running from April to June and debits Prepaid Advertising. Record the adjusting entry on 30 April.',
    accounts: ['Advertising Expense', 'Prepaid Advertising', 'Cash', 'Accounts Payable', 'Prepaid Rent'],
    lines: [{ acct: 'Advertising Expense', dr: 400 }, { acct: 'Prepaid Advertising', cr: 400 }],
    solution: 'One of three months has been used: 1,200 ÷ 3 = $400. Debit Advertising Expense 400; credit Prepaid Advertising 400, leaving $800 for May and June.',
  },
  {
    id: 'f01-adj-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer buys testing equipment on 1 April for $15,600, with a residual value of $1,200 and a useful life of four years. It uses the straight-line method, takes a full month of depreciation in the month of purchase, and its financial year ends on 31 December. What is depreciation expense for the first financial year?',
    answer: 2700, check: () => (15600 - 1200) / 4 * 9 / 12, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 3600, say: 'That is a full year. The equipment is used for nine months (April to December) in the first financial year.' },
      { value: 2925, say: 'You left the residual value in. Depreciate cost minus residual value: 15,600 − 1,200 = 14,400.' },
      { value: 3900, say: 'That is cost ÷ 4 for a whole year. Subtract the residual value and count nine months.' },
      { value: 2400, say: 'That is eight months. With a full month in the month of purchase, April counts: April to December is nine months.' },
    ],
    solution: 'Per year = (15,600 − 1,200) ÷ 4 = 3,600; per month 300. April to December = 9 months: 9 × 300 = $2,700.',
  },
  {
    id: 'f01-adj-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of adjustment does each situation at the period end need?',
    items: [
      'A year’s insurance was paid in advance; one month has passed.',
      'Electricity used in December will be billed in January.',
      'A deposit was received for an event that has now taken place.',
      'Interest has been earned on a loan to a customer, to be received when the loan is repaid.',
      'A delivery van has been in use all year.',
      'A consulting job was finished on 31 December and will be invoiced in January.',
      'Staff have worked three days since the last payday.',
    ],
    categories: ['Prepaid expense', 'Unearned revenue', 'Accrued revenue', 'Accrued expense', 'Depreciation'],
    answer: [0, 3, 1, 2, 4, 2, 3],
    feedback: {
      1: 'The electricity has been used but not paid or recorded: an expense first, cash later.',
      2: 'Cash came first, as a liability; delivering the event earns it.',
      3: 'The interest is earned as time passes and received later: revenue first.',
      5: 'The work is done, so the revenue is earned, although the invoice goes out next month.',
    },
    solution: 'Insurance: prepaid expense. Electricity and staff wages: accrued expenses. Deposit now earned: unearned revenue. Interest earned and consulting finished but not invoiced: accrued revenue. The van: depreciation.',
  },
];

export const check = [
  {
    id: 'f01-adj-k1', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-30',
    prompt: 'On 30 April Lantern runs a barista workshop for a hotel’s staff for $1,300. It will invoice the hotel on 4 May. Record the adjusting entry on 30 April.',
    accounts: ['Accounts Receivable', 'Training Revenue', 'Catering Revenue', 'Unearned Revenue', 'Cash'],
    lines: [{ acct: 'Accounts Receivable', dr: 1300 }, { acct: 'Training Revenue', cr: 1300 }],
    solution: 'The workshop has been delivered, so April has earned $1,300 and Lantern has a right to be paid: accrued revenue. Debit Accounts Receivable 1,300; credit Training Revenue 1,300. The invoice in May records nothing new.',
  },
  {
    id: 'f01-adj-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel starts the year with $3,400 of cleaning supplies, buys $12,900 during the year and counts $2,800 on hand at the year end. What is supplies expense for the year?',
    answer: 13500, check: () => 3400 + 12900 - 2800, unit: '$', places: 0,
    wrong: [
      { value: 2800, say: 'That is what is left on hand: the new balance of the Supplies asset, not the expense.' },
      { value: 12900, say: 'That is the year’s purchases. Add what was there at the start and subtract what is left.' },
      { value: 10100, say: 'You left out the $3,400 the hotel started with. Supplies available were 3,400 + 12,900.' },
    ],
    solution: 'Supplies used = start + purchases − on hand = 3,400 + 12,900 − 2,800 = $13,500.',
  },
  {
    id: 'f01-adj-k3', type: 'mc', kind: 'conceptual',
    prompt: 'Why does an adjusting entry never include Cash?',
    options: [
      'Cash is recorded whenever it moves; an adjustment records only the recognition half of a deferral or accrual, whose cash half is recorded earlier or later.',
      'Adjusting entries are made after the bank account has been closed for the period.',
      'Cash is a permanent account, and adjusting entries affect only temporary accounts.',
      'Including Cash would make the trial balance fail to balance.',
    ],
    answer: 0,
    feedback: {
      1: 'Bank accounts aren’t closed. The reason is that cash movements are transactions, already recorded when they happen.',
      2: 'Adjustments change a balance sheet (permanent) account as well as an income statement (temporary) one: Prepaid Insurance, Wages Payable, Accumulated Depreciation.',
      3: 'Any entry with equal debits and credits keeps the trial balance in balance, with or without Cash.',
    },
    solution: 'In a deferral the cash moved earlier (the insurance premium, the deposit); in an accrual it will move later (wages paid on 5 April). Those cash movements are recorded as transactions. The adjustment recognises the revenue or expense that belongs to this period, with an asset, contra-asset or liability on the other side.',
  },
  {
    id: 'f01-adj-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern forgets adjustment a3, the $200 of depreciation for March. What is the effect on its March financial statements?',
    options: [
      'Net income and equity overstated by $200; total assets overstated by $200',
      'Net income understated by $200; total assets understated by $200',
      'Net income overstated by $200; liabilities understated by $200',
      'No effect, because depreciation involves no cash',
    ],
    answer: 0,
    feedback: {
      1: 'Leaving out an expense makes profit too high, not too low.',
      2: 'Depreciation is credited to a contra-asset, not a liability: with it missing, the equipment’s book value, and so total assets, is too high.',
      3: 'Depreciation is a real expense of using the machine. Leaving it out misstates profit and assets even though no cash is involved.',
    },
    solution: 'Without a3, expenses are $200 too low, so net income and equity are $200 too high, and accumulated depreciation is $200 too low, so equipment’s book value and total assets are $200 too high. The equation still balances: assets +200 = liabilities 0 + equity +200.',
  },
  {
    id: 'f01-adj-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline borrows $2,400,000 on 1 August at 5% a year, with interest paid each 31 July. Its financial year ends on 31 December. How much interest must it accrue at 31 December?',
    answer: 50000, check: () => 2400000 * 0.05 * 5 / 12, unit: '$', places: 0,
    wrong: [
      { value: 120000, say: 'That is a full year of interest. The loan has been outstanding for five months, August to December.' },
      { value: 10000, say: 'That is one month. Five months have passed since 1 August.' },
      { value: 60000, say: 'That is six months. Count August, September, October, November and December: five.' },
    ],
    solution: 'I = P × r × t = 2,400,000 × 0.05 × 5/12 = $50,000. Debit Interest Expense 50,000; credit Interest Payable 50,000.',
  },
  {
    id: 'f01-adj-k6', type: 'equation', kind: 'conceptual',
    prompt: 'Lantern forgets adjustment a5, the $1,400 of wages earned on 16–31 March and paid on 5 April. Enter how far each total on its 31 March balance sheet would be wrong: a positive number if overstated, a negative number if understated, 0 if unaffected.',
    answer: { assets: 0, liabilities: -1400, equity: 1400 },
    solution: 'Without a5, Wages Payable is missing, so liabilities are understated by $1,400 (−1,400). Wages Expense is $1,400 too low, so net income, and with it equity, is overstated (+1,400). Assets are unaffected. The errors still satisfy the equation: 0 = −1,400 + 1,400.',
  },
];
