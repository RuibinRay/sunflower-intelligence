// balance-sheet-and-equity.ex.js — F02 · The balance sheet and equity: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
import { CHART, YEAR, ADJUSTMENTS, DERIVED, FACTS } from './case.js?v=20';

/** $1,234 or $1,234.56 (cents only when needed); a real minus sign for negatives. */
const money = (n) => {
  const v = Math.round(n * 100) / 100;
  const dp = Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2;
  const s = Math.abs(v).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '−$' : '$') + s;
};
const CA0 = DERIVED.currentAssets;                                   // 56,476
const CL0 = DERIVED.currentLiabilities - FACTS.vanNote.instalment;   // 21,289 before e8
const RE0 = DERIVED.retainedEarnings;                                // 22,387

export const widgets = {
  'bse-ratio': {
    type: 'formula',
    title: 'Lantern’s working capital and current ratio at 31 December 2026',
    intro: 'Long-term debt classified as current, an extra dividend paid at once or declared for January, and a minimum current ratio such as a lender might set.',
    inputs: [
      { id: 'reclass', label: 'Long-term debt shown as current', min: 0, max: 15000, step: 1000, value: FACTS.vanNote.instalment, fmt: 'money' },
      { id: 'paid', label: 'Extra dividend paid in cash on 31 December', min: 0, max: 20000, step: 500, value: 0, fmt: 'money' },
      { id: 'declared', label: 'Extra dividend declared, paid in January', min: 0, max: 20000, step: 500, value: 0, fmt: 'money' },
      { id: 'k', label: 'Minimum current ratio', min: 1, max: 3, step: 0.1, value: 1.5, fmt: 'num' },
    ],
    compute: (v) => {
      const ca = CA0 - v.paid;
      const cl = CL0 + v.reclass + v.declared;
      const ratio = ca / cl;
      const room = ca - v.k * cl;
      const re = RE0 - v.paid - v.declared;
      const pass = ratio >= v.k - 1e-9;
      const reNote = re < 0 ? ` The extra dividends exceed retained earnings of ${money(RE0)}: they would hand back part of Ana’s own investment.` : '';
      const note = `${pass ? 'The ratio meets' : 'The ratio breaks'} a minimum of ${v.k.toFixed(1)}. ${v.reclass === FACTS.vanNote.instalment ? 'The $5,000 of debt shown as current is the van instalment due on 1 June 2027 (e8).' : v.reclass === 0 ? 'With no debt shown as current, the van instalment due in June is hidden among noncurrent liabilities: the ratio looks better than it is.' : 'Changing how much debt is current changes no total, only the split, yet it moves the ratio.'} A dividend paid at once reduces current assets; one declared but unpaid adds to current liabilities instead. Both reduce working capital by the same amount, but with a ratio above one the unpaid dividend lowers the ratio more.${reNote}`;
      return {
        headline: { label: 'Current ratio', value: ratio.toFixed(2) },
        rows: [
          ['Current assets', money(ca)],
          ['Current liabilities', money(cl)],
          ['Working capital', money(ca - cl)],
          ['Further cash payment possible before the minimum is reached', room > 0 ? money(room) : 'None: already below the minimum'],
          ['Retained earnings after the extra dividends', money(re)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'At 31 December 2026', values: ['Current assets', 'Current liabilities'] }, series: [{ name: 'Dollars', values: [ca, cl] }], y: { label: 'Dollars' } },
      };
    },
  },
  'bse-build': {
    type: 'statements',
    chart: CHART,
    transactions: [...YEAR, ...ADJUSTMENTS].map((t) => ({ ...t })),
    build: ['equity', 'balance'],
    period: { start: '2026-03-01', end: '2026-12-31', phrase: 'For the ten months ended' },
  },
};

export const guided = [
  {
    id: 'f02-bse-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional whisky distillery’s normal operating cycle, from buying barley to selling matured whisky, is about four years. Classify each item on its balance sheet.',
    items: [
      'Whisky maturing in casks, to be sold in about four years',
      'A bank loan repayable in one sum in five years’ time',
      'Interest accrued on that loan, payable next month',
      'Mortgage instalments due in the next 12 months',
      'Copper stills expected to last 25 years',
      'Deposits from customers for casks to be delivered next spring',
      'Insurance paid in advance for the next nine months',
    ],
    categories: ['Current asset', 'Noncurrent asset', 'Current liability', 'Noncurrent liability'],
    answer: [0, 3, 2, 2, 1, 2, 0],
    hints: ['The horizon is one year or the operating cycle, whichever is longer.', 'Inventory that is part of the operating cycle is current even if it takes years to sell.'],
    feedback: {
      0: 'The whisky is inventory within the distillery’s operating cycle, so it is current although it won’t be sold for years.',
      1: 'The loan is due in five years, beyond both one year and the four-year operating cycle: noncurrent. The interest accrued on it is a separate, current liability.',
    },
    solution: 'Current assets: the maturing whisky (inventory within the operating cycle) and the prepaid insurance. Noncurrent asset: the stills. Current liabilities: the interest due next month, the mortgage instalments due within the year and the customers’ deposits. The loan due in five years is a noncurrent liability.',
  },
  {
    id: 'f02-bse-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional physiotherapy clinic has a $60,000 bank loan, repayable in five instalments of $12,000 each 30 June from 2027. At 31 December 2026 its current assets are $41,400 and its other current liabilities (payables, wages, interest and tax) are $16,500.',
    solution: 'The instalment due on 30 June 2027 is current: $12,000; the other $48,000 is noncurrent. Current liabilities = 16,500 + 12,000 = $28,500. Current ratio = 41,400 ÷ 28,500 ≈ 1.45; working capital = 41,400 − 28,500 = $12,900.',
    steps: [
      { id: 'f02-bse-g2-s1', type: 'num',
        prompt: 'How much of the loan is a current liability at 31 December 2026? Round to the nearest dollar.',
        answer: 12000, check: () => 60000 / 5, unit: '$', places: 0, tol: 0.5,
        hints: ['Which instalments fall due by 31 December 2027?'],
        wrong: [
          { value: 60000, say: 'Only the instalment due within the next year is current. The other four are due in 2028–2031.' },
          { value: 0, say: 'The instalment due on 30 June 2027 is within twelve months of the balance sheet date: it is current.' },
        ] },
      { id: 'f02-bse-g2-s2', type: 'num',
        prompt: 'What are total current liabilities? Round to the nearest dollar.',
        answer: 28500, check: () => 16500 + 60000 / 5, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the current portion to the other current liabilities.'],
        wrong: [
          { value: 16500, say: 'Add the $12,000 current portion of the loan.' },
          { value: 76500, say: 'Only $12,000 of the loan is current; the rest is noncurrent.' },
        ] },
      { id: 'f02-bse-g2-s3', type: 'num',
        prompt: 'What is the current ratio? Round to two decimal places.',
        answer: 1.45, check: () => 41400 / (16500 + 12000), unit: '', places: 2, tol: 0.005,
        hints: ['Current assets ÷ current liabilities.'],
        wrong: [
          { value: 2.51, say: 'That leaves out the current portion of the loan.' },
          { value: 0.69, say: 'That is current liabilities ÷ current assets, upside down.' },
        ] },
      { id: 'f02-bse-g2-s4', type: 'num',
        prompt: 'What is working capital? Round to the nearest dollar.',
        answer: 12900, check: () => 41400 - 28500, unit: '$', places: 0, tol: 0.5,
        hints: ['Current assets − current liabilities.'],
        wrong: [{ value: 24900, say: 'That leaves out the current portion of the loan.' }] },
    ],
  },
  {
    id: 'f02-bse-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional software start-up issues 200,000 shares of common stock with a par value of $0.001 to investors at $2.50 a share, for cash.',
    solution: 'Cash 200,000 × 2.50 = $500,000. Common Stock 200,000 × 0.001 = $200; APIC 500,000 − 200 = $499,800. Debit Cash 500,000; credit Common Stock 200 and Additional Paid-in Capital 499,800.',
    steps: [
      { id: 'f02-bse-g3-s1', type: 'num',
        prompt: 'How much is credited to Common Stock? Round to the nearest dollar.',
        answer: 200, check: () => 200000 * 0.001, unit: '$', places: 0, tol: 0.5,
        hints: ['Common Stock records par value × shares issued.'],
        wrong: [{ value: 500000, say: 'That is the cash received. With a par value, only par × shares goes to Common Stock.' }] },
      { id: 'f02-bse-g3-s2', type: 'num',
        prompt: 'How much is credited to Additional Paid-in Capital? Round to the nearest dollar.',
        answer: 499800, check: () => 200000 * (2.5 - 0.001), unit: '$', places: 0, tol: 0.5,
        hints: ['The excess of the issue price over par, times the shares.'],
        wrong: [{ value: 500000, say: 'Subtract the $200 credited to Common Stock.' }] },
      { id: 'f02-bse-g3-s3', type: 'journal', chart: 'f02', date: '2026-09-01',
        prompt: 'Record the issue.',
        accounts: ['Cash', 'Common Stock', 'Additional Paid-in Capital', 'Retained Earnings', 'Notes Payable', 'Dividends'],
        lines: [{ acct: 'Cash', dr: 500000 }, { acct: 'Common Stock', cr: 200 }, { acct: 'Additional Paid-in Capital', cr: 499800 }],
        hints: ['One debit, two credits.', 'Issuing shares isn’t revenue: no income statement account is involved.'] },
    ],
  },
  {
    id: 'f02-bse-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional cinema chain has 80,000 shares issued, of which 4,000 are held as treasury stock. On 1 December its board declares a dividend of $0.25 a share to shareholders of record on 15 December, payable on 10 January.',
    solution: 'Outstanding shares = 80,000 − 4,000 = 76,000; dividend = 76,000 × 0.25 = $19,000. 1 December: debit Dividends 19,000, credit Dividends Payable 19,000. 15 December: no entry. 10 January: debit Dividends Payable 19,000, credit Cash 19,000.',
    steps: [
      { id: 'f02-bse-g4-s1', type: 'num',
        prompt: 'What is the total dividend? Round to the nearest dollar.',
        answer: 19000, check: () => (80000 - 4000) * 0.25, unit: '$', places: 0, tol: 0.5,
        hints: ['Treasury shares receive no dividends.'],
        wrong: [{ value: 20000, say: 'Treasury shares are not outstanding and receive no dividend: use 76,000 shares.' }] },
      { id: 'f02-bse-g4-s2', type: 'journal', chart: 'f02', date: '2026-12-01',
        prompt: 'Record the declaration on 1 December, using a Dividends account.',
        accounts: ['Dividends', 'Dividends Payable', 'Cash', 'Retained Earnings', 'Common Stock', 'Interest Expense'],
        lines: [{ acct: 'Dividends', dr: 19000 }, { acct: 'Dividends Payable', cr: 19000 }],
        hints: ['Declaring creates the liability; no cash moves yet.'] },
      { id: 'f02-bse-g4-s3', type: 'mc',
        prompt: 'What entry is made on 15 December, the date of record?',
        options: [
          'None: the date only fixes who will be paid',
          'Debit Dividends, credit Dividends Payable',
          'Debit Dividends Payable, credit Cash',
          'Debit Retained Earnings and credit Dividends Payable, because ownership is fixed that day',
        ],
        answer: 0,
        feedback: {
          1: 'That entry was made on the declaration date. Recording it again would double the liability.',
          2: 'Cash leaves on the payment date, 10 January.',
          3: 'The liability already exists from 1 December; the date of record only identifies the shareholders.',
        },
        hints: ['Has anything changed in the company’s assets, liabilities or equity on that day?'] },
      { id: 'f02-bse-g4-s4', type: 'journal', chart: 'f02', date: '2027-01-10',
        prompt: 'Record the payment on 10 January.',
        accounts: ['Dividends', 'Dividends Payable', 'Cash', 'Retained Earnings', 'Common Stock', 'Interest Expense'],
        lines: [{ acct: 'Dividends Payable', dr: 19000 }, { acct: 'Cash', cr: 19000 }],
        hints: ['The payment settles the liability.'] },
    ],
  },
];

export const independent = [
  {
    id: 'f02-bse-i1', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-05-01',
    prompt: 'A fictional cheese-making corporation issues 5,000 shares of no-par common stock, with no stated value, to a new investor for $30,000 in cash. Record the issue.',
    accounts: ['Cash', 'Common Stock', 'Additional Paid-in Capital', 'Retained Earnings', 'Notes Payable', 'Dividends'],
    lines: [{ acct: 'Cash', dr: 30000 }, { acct: 'Common Stock', cr: 30000 }],
    solution: 'With no par and no stated value, the whole amount received goes to Common Stock: debit Cash 30,000, credit Common Stock 30,000. Additional Paid-in Capital is not used.',
  },
  {
    id: 'f02-bse-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional bookshop’s retained earnings were $48,200 on 1 January. During the year it made a net loss of $6,300 and declared dividends of $4,000, of which $3,000 was paid by 31 December. What are retained earnings at 31 December? Round to the nearest dollar.',
    answer: 37900, check: () => 48200 - 6300 - 4000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 38900, say: 'Retained earnings fall when dividends are declared, not when they are paid: subtract all $4,000.' },
      { value: 50500, say: 'A net loss reduces retained earnings; subtract it.' },
    ],
    solution: '48,200 − 6,300 (net loss) − 4,000 (dividends declared) = $37,900. The $1,000 still unpaid is a current liability, Dividends Payable.',
  },
  {
    id: 'f02-bse-i3', type: 'order', kind: 'conceptual',
    prompt: 'Put the sections of a US classified balance sheet in report form in the order they usually appear, from top to bottom.',
    items: [
      'Current assets',
      'Property, plant and equipment, net of accumulated depreciation',
      'Intangible assets',
      'Current liabilities',
      'Noncurrent liabilities',
      'Stockholders’ equity',
    ],
    solution: 'Assets in order of liquidity (current assets, then property, plant and equipment, then intangibles), then liabilities in order of when they fall due (current, then noncurrent), then equity.',
  },
  {
    id: 'f02-bse-i4', type: 'num', kind: 'applied',
    prompt: 'Lantern’s notes: Coastline Bank’s $10,000, due in one sum on 1 March 2028, and the van note, $20,000 repaid in instalments of $5,000 each 1 June from 2027 to 2030. Assume every payment is made on time. What will the noncurrent portion of Lantern’s notes payable be at 31 December 2028? Round to the nearest dollar.',
    answer: 5000, check: () => FACTS.vanNote.principal - 2 * FACTS.vanNote.instalment - FACTS.vanNote.instalment, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 10000, say: 'That is all that remains owed. The instalment due on 1 June 2029 is within twelve months: current.' },
      { value: 15000, say: 'By 31 December 2028 the 2027 and 2028 instalments and Coastline’s note have been paid.' },
      { value: 0, say: 'The instalment due on 1 June 2030 is more than twelve months away: still noncurrent.' },
    ],
    solution: 'By 31 December 2028 Coastline’s note (March 2028) and the van instalments of June 2027 and June 2028 are paid, leaving $10,000. The 1 June 2029 instalment is current; the 1 June 2030 instalment, $5,000, is noncurrent.',
  },
  {
    id: 'f02-bse-i5', type: 'mc', kind: 'conceptual',
    prompt: 'A company with a current ratio of 2.0 declares a cash dividend on 28 December, payable on 10 January. What is the effect on its 31 December balance sheet?',
    options: [
      'Retained earnings, working capital and the current ratio all fall',
      'Retained earnings fall, but working capital and the ratio wait for the payment',
      'Working capital is unchanged, because no cash has left yet',
      'Nothing changes until 10 January, when the cash is paid',
    ],
    answer: 0,
    feedback: {
      1: 'The declaration creates Dividends Payable, a current liability, at once; working capital and the ratio fall on 28 December.',
      2: 'Current liabilities have risen by the dividend, so working capital has fallen even though cash hasn’t.',
      3: 'A dividend becomes a liability, and reduces retained earnings, when it is declared.',
    },
    solution: 'Declaring: debit Dividends (reducing retained earnings), credit Dividends Payable (a current liability). Current assets are unchanged and current liabilities rise, so working capital falls by the dividend and a ratio of 2.0 falls too.',
  },
  {
    id: 'f02-bse-i6', type: 'fill', kind: 'conceptual',
    prompt: 'Translate US terms into the names IFRS reporters (and UK companies) usually use.',
    text: 'The balance sheet is the [[0]]; common stock is [[1]]; additional paid-in capital is [[2]]; accounts receivable are [[3]].',
    blanks: [
      { options: ['statement of profit or loss', 'statement of financial position', 'statement of changes in equity'], answer: 1 },
      { options: ['share capital', 'share premium', 'reserves'], answer: 0 },
      { options: ['share capital', 'retained profits', 'share premium'], answer: 2 },
      { options: ['debentures', 'trade receivables', 'provisions'], answer: 1 },
    ],
    solution: 'Statement of financial position; share capital; share premium; trade receivables.',
  },
];

export const check = [
  {
    id: 'f02-bse-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional event-staffing agency’s balances at 31 December include: Cash $12,000; Accounts Receivable $31,000; Allowance for Doubtful Accounts $1,400; Inventory $9,800; Prepaid Expenses $2,600; Accounts Payable $18,700; Accrued Liabilities $6,300; Income Taxes Payable $2,000; and a loan of $50,000 of which $10,000 is due within the next year. What is working capital? Round to the nearest dollar.',
    answer: 17000, check: () => (12000 + 31000 - 1400 + 9800 + 2600) - (18700 + 6300 + 2000 + 10000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 19800, say: 'The allowance is deducted from receivables, not added.' },
      { value: 27000, say: 'The $10,000 of the loan due within the year is a current liability.' },
      { value: -23000, say: 'Only $10,000 of the loan is current; the other $40,000 is noncurrent.' },
    ],
    solution: 'Current assets = 12,000 + 31,000 − 1,400 + 9,800 + 2,600 = 54,000. Current liabilities = 18,700 + 6,300 + 2,000 + 10,000 = 37,000. Working capital = $17,000.',
  },
  {
    id: 'f02-bse-k2', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-11-20',
    prompt: 'On 20 November a fictional toy maker’s board declares a dividend of $0.15 a share on its 120,000 outstanding shares, payable on 18 December. Record the declaration, using a Dividends account.',
    accounts: ['Dividends', 'Dividends Payable', 'Cash', 'Retained Earnings', 'Common Stock', 'Additional Paid-in Capital'],
    lines: [{ acct: 'Dividends', dr: 18000 }, { acct: 'Dividends Payable', cr: 18000 }],
    solution: '0.15 × 120,000 = $18,000. Debit Dividends 18,000; credit Dividends Payable 18,000. Cash moves on 18 December.',
  },
  {
    id: 'f02-bse-k3', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s $10,000 note to Coastline Bank is repayable in one sum on 1 March 2028. How is it classified on Lantern’s balance sheet at 31 December 2027?',
    options: [
      'Current: it is due within twelve months of that date',
      'Noncurrent: it was a two-year note when Lantern borrowed the money',
      'Noncurrent until the year in which it is paid',
      'Split equally between current and noncurrent',
    ],
    answer: 0,
    feedback: {
      1: 'Classification looks forward from each balance sheet date, not back to the loan’s original term.',
      2: 'At 31 December 2027 the repayment is only two months away: it will be paid from current assets.',
      3: 'The note is repaid in one sum, so all of it falls due within the year.',
    },
    solution: 'At 31 December 2027 the whole $10,000 is due within twelve months, so it is a current liability (a current portion of long-term debt), though it was noncurrent a year earlier.',
  },
  {
    id: 'f02-bse-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Where does each item appear on Lantern’s balance sheet at 31 December 2026?',
    items: [
      'Allowance for Doubtful Accounts',
      'Accumulated Depreciation—Van',
      'Current Portion of Long-Term Debt',
      'Coastline Bank’s note, due 1 March 2028',
      'Interest accrued on the van note',
      'Retained Earnings',
      'Insurance prepaid for January and February 2027',
    ],
    categories: ['Current assets', 'Property and equipment', 'Current liabilities', 'Noncurrent liabilities', 'Equity'],
    answer: [0, 1, 2, 3, 2, 4, 0],
    feedback: {
      0: 'A contra-asset, deducted from accounts receivable within current assets.',
      1: 'A contra-asset, deducted from the van’s cost.',
      4: 'Interest owed at the year end is payable with the June instalment, within the year.',
    },
    solution: 'Current assets: the allowance (as a deduction from receivables) and prepaid insurance. Property and equipment: accumulated depreciation on the van (a deduction). Current liabilities: the current portion of long-term debt and the interest payable. Noncurrent liabilities: Coastline’s note. Equity: retained earnings.',
  },
  {
    id: 'f02-bse-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional pet-supplies distributor has current assets of $180,000 and current liabilities of $90,000. Its loan agreement requires a current ratio of at least 1.6. What is the largest cash dividend it can pay immediately without breaking the requirement? Round to the nearest dollar.',
    answer: 36000, check: () => 180000 - 1.6 * 90000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 90000, say: 'That is working capital. Paying it all would leave a ratio of 1.0.' },
      { value: 22500, say: 'That is the limit for a dividend declared but not yet paid (180,000 ÷ 1.6 − 90,000). Paid at once, it reduces current assets instead.' },
    ],
    solution: 'After paying D: (180,000 − D) ÷ 90,000 ≥ 1.6, so D ≤ 180,000 − 144,000 = $36,000.',
  },
  {
    id: 'f02-bse-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these change a company’s total equity? Select all that apply.',
    options: [
      'Declaring a cash dividend',
      'Paying a dividend declared last month',
      'Issuing shares for cash',
      'Earning net income for the year',
      'Reclassifying the current portion of a loan',
      'Buying back its own shares as treasury stock',
    ],
    answer: [0, 2, 3, 5],
    feedback: {
      1: 'Paying settles Dividends Payable with cash; equity fell when the dividend was declared.',
      4: 'Reclassifying moves an amount between two liability lines; equity is untouched.',
    },
    solution: 'Declaring a dividend and buying treasury stock reduce equity; issuing shares and earning net income increase it. Paying an already declared dividend and reclassifying debt affect only assets and liabilities.',
  },
];
