// linking-the-statements.ex.js — F02 · Linking the statements: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern’s figures are built from case.js; every `check` recomputes.
// Error-location and roll-forward items practise this lesson’s own skills; the indirect method’s mechanics are in f02/indirect-method.
import { CHART, FACTS as F, YEAR, ADJUSTMENTS, LEDGER, DERIVED as D } from './case.js?v=22';

const bal = (n) => LEDGER[n]?.balance || 0;
const tx = (id) => [...YEAR, ...ADJUSTMENTS].find((e) => e.id === id);
const amt = (id) => tx(id).lines.reduce((s, l) => s + (l.dr || 0), 0);
/** 12,000 (no dollar sign); used to build prompts from the case so they always agree with it. */
const n = (x) => Math.abs(x).toFixed(Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** $1,234 with a real minus sign for negatives. */
const money = (x) => `${x < -1e-9 ? '−' : ''}$${n(Math.round(x * 100) / 100)}`;
const signed = (x) => (x > 1e-9 ? `+${money(x)}` : money(x));
const r2 = (x) => Math.round(x * 100) / 100 + 0;

const opAssets = D.operatingCurrentAssets;          // 13,536
const opLiabs = D.operatingCurrentLiabilities;      // 21,289

export const widgets = {
  'lnk-annual': {
    type: 'statements',
    chart: CHART,
    transactions: [...YEAR, ...ADJUSTMENTS],
    build: ['income', 'equity', 'balance', 'cash'],
    period: { start: F.period.start, end: F.period.end, phrase: 'For the ten months ended' },
  },
  'lnk-walk': {
    type: 'formula',
    title: 'One change through three statements',
    intro: 'A change in depreciation, taxed at the rate you choose. The last slider sets how much of the resulting change in tax is paid within the year. Lantern: 0%, because its estimated payments were fixed at $6,000, so any change in its 2026 tax would sit in income taxes payable.',
    inputs: [
      { id: 'dep', label: 'Change in depreciation expense', min: -3000, max: 5000, step: 100, value: 1000, fmt: 'money' },
      { id: 'rate', label: 'Tax rate on income before tax', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
      { id: 'paid', label: 'Share of the change in tax paid within the year', min: 0, max: 100, step: 10, value: 100, fmt: 'pct' },
    ],
    compute: (v) => {
      const t = v.rate / 100, p = v.paid / 100, d = v.dep;
      const dTax = -t * d;                       // tax expense
      const dNI = -d - dTax;                     // = −(1 − t) d
      const dPayable = dTax * (1 - p);           // the unpaid part of the tax change stays in Income Taxes Payable
      const dCFO = dNI + d + dPayable;           // indirect method: NI + depreciation + change in taxes payable
      const dPPE = -d;
      const dAssets = dCFO + dPPE;
      const dLE = dPayable + dNI;
      const note = d === 0
        ? 'Move the first slider: with no change in depreciation nothing on any statement moves.'
        : `Net income changes by ${signed(dNI)}: the ${d > 0 ? 'extra' : 'smaller'} expense less the ${v.rate}% tax on it. Operating cash flow changes by ${signed(dCFO)}, which is only the tax ${d > 0 ? 'saved' : 'added'} that is paid within the year${p < 1 && t > 0 ? `; ${p === 0 ? 'all' : 'the rest'} of it, ${signed(dPayable)}, sits in income taxes payable until the tax is paid` : ''}. Depreciation itself moves no cash. Assets change by ${signed(dAssets)} and liabilities plus equity by ${signed(dLE)}, so the balance sheet still balances.`;
      return {
        headline: { label: 'Change in net income', value: signed(dNI) },
        rows: [
          ['Income tax expense', signed(dTax)],
          ['Cash from operating activities', signed(dCFO)],
          ['Property and equipment (net)', signed(dPPE)],
          ['Income taxes payable', signed(dPayable)],
          ['Retained earnings (through net income)', signed(dNI)],
          ['Change in assets', signed(dAssets)],
          ['Change in liabilities + equity', signed(dLE)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Figure', values: ['Net income', 'Operating cash flow', 'Property and equipment (net)', 'Income taxes payable', 'Retained earnings'] },
          series: [{ name: 'Change ($)', values: [dNI, dCFO, dPPE, dPayable, dNI].map(r2) }],
          y: { label: 'Change in dollars' },
        },
      };
    },
  },
  // One entry at a time through all four statements: the drill asks for the accounts, sides and amounts, then which
  // statements change and, when cash moves, the activity (accounting engine: statementsAffected).
  'lnk-trace': {
    type: 'journal',
    chart: CHART,
    transactions: ['y4', 'e5', 'y12', 'y13', 'y20', 'y30', 'e9'].map(tx),
    ask: ['accounts', 'side', 'amount', 'statements'],
  },
};

export const guided = [
  {
    id: 'f02-lnk-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which statements does each of Lantern’s 2026 entries change? An entry that changes the income statement also changes equity, through net income. Count the statement of cash flows only when cash moves: an entry with no cash may appear as offsetting lines in the indirect reconciliation, but it changes no cash total.',
    items: [
      `e3: depreciation on the espresso equipment, $${n(amt('e3'))}`,
      `y3: the espresso equipment, $${n(amt('y3'))} paid in cash`,
      `y14: card and platform fees of $${n(amt('y14'))} paid`,
      `e8: the $${n(amt('e8'))} van instalment due in June 2027 moved to current liabilities`,
      `y6: catering deposits of $${n(amt('y6'))} received`,
      `e7: Holiday Blend written down by $${n(amt('e7'))}`,
      `y28: estimated income tax of $${n(amt('y28'))} paid`,
      `y18: catering supplies of $${n(amt('y18'))} bought on account`,
    ],
    categories: ['Income statement and balance sheet; no cash moves', 'Balance sheet and statement of cash flows only', 'Income statement, balance sheet and statement of cash flows', 'Balance sheet only'],
    answer: [0, 1, 2, 3, 1, 0, 2, 3],
    hints: [
      'Ask two questions of each entry: does it touch a revenue or expense account, and does it touch Cash?',
      'Deposits received are cash but not yet revenue; buying on account changes an asset and a liability but moves no cash.',
    ],
    feedback: {
      1: 'Buying equipment is an investing outflow and a new asset; the expense arrives later, as depreciation.',
      3: 'A reclassification moves an amount from one liability line to another. Total liabilities, net income and cash are unchanged.',
      4: 'The deposits are unearned revenue, a liability, until the events are catered; the cash is an operating inflow now.',
      5: 'The write-down raises cost of goods sold and lowers inventory. No cash moves, so no cash total changes.',
      7: 'Supplies (an asset) and accounts payable (a liability) both rise. The expense comes when the supplies are used, the cash flow when the vendor is paid.',
    },
    solution: 'Income statement and balance sheet, with no cash: depreciation (e3) and the write-down (e7). Balance sheet and statement of cash flows: the equipment bought for cash (y3, investing) and the deposits (y6, operating). All three: fees paid (y14) and tax paid (y28), both expenses settled in cash. Balance sheet only: the reclassification (e8) and supplies bought on account (y18).',
  },
  {
    id: 'f02-lnk-g2', type: 'steps', kind: 'numerical',
    prompt: 'Ravelin Physio Inc., a fictional clinic, is comparing two estimates of the useful life of its treatment equipment. Had this year’s depreciation been $4,000 higher, with income tax at 25% of income before tax and the change in tax paid within the year, how would its statements differ?',
    solution: 'Net income: −4,000 × (1 − 0.25) = −3,000. Operating cash flow (indirect method): −3,000 + 4,000 = +1,000, the tax saved. Assets: cash +1,000 and equipment (net) −4,000, a total of −3,000, which equals liabilities 0 plus equity (retained earnings) −3,000.',
    steps: [
      { id: 'f02-lnk-g2-s1', type: 'num', prompt: 'By how much would net income change? Enter a decrease as a negative number.',
        answer: -3000, check: () => -(1 - 0.25) * 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Depreciation is deducted before tax, so it lowers the tax too.', 'Net income falls by the expense less the tax saved: 4,000 × (1 − 0.25).'],
        wrong: [
          { value: -4000, say: 'Lower income before tax also means lower income tax, by 25% × 4,000 = 1,000, so net income falls by 3,000.' },
          { value: 3000, say: 'More expense means less net income: the change is negative.' },
          { value: -1000, say: 'That is the change in income tax. Net income falls by the expense less that saving.' },
        ] },
      { id: 'f02-lnk-g2-s2', type: 'num', prompt: 'By how much would cash from operating activities change?',
        answer: 1000, check: () => -(1 - 0.25) * 4000 + 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Indirect method: start from the change in net income and add back the change in depreciation.', '−3,000 + 4,000.'],
        wrong: [
          { value: 4000, say: 'Depreciation isn’t a source of cash; only the tax saved, 25% × 4,000, is.' },
          { value: -3000, say: 'Add back the extra depreciation: it reduced net income without using cash.' },
          { value: 0, say: 'Here the tax saving is real cash, because the change in tax is paid within the year: 1,000 less tax paid.' },
        ] },
      { id: 'f02-lnk-g2-s3', type: 'num', prompt: 'By how much would total assets change? Enter a decrease as a negative number.',
        answer: -3000, check: () => 0.25 * 4000 - 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Two assets change: cash and the equipment’s book value.', 'Cash +1,000; equipment (net) −4,000.'],
        wrong: [
          { value: -4000, say: 'Cash rises by the 1,000 of tax saved, which offsets part of the 4,000 fall in book value.' },
          { value: 1000, say: 'That is only the change in cash. The equipment’s book value falls by 4,000.' },
        ] },
    ],
  },
  {
    id: 'f02-lnk-g3', type: 'steps', kind: 'applied',
    prompt: 'Pennant Climbing Gym Inc., a fictional company, began the year with retained earnings of $64,000, cash of $18,200 and no dividends payable. Its net income for the year was $38,500. It declared dividends of $12,000, of which $3,000 was still unpaid at the year end. The balance sheet, taken from the ledger, shows cash of $28,500, but the bookkeeper’s draft statement of cash flows ends at $25,500.',
    solution: 'Retained earnings: 64,000 + 38,500 − 12,000 = $90,500, using the dividends declared. The draft ends 28,500 − 25,500 = $3,000 short. Of the candidate errors, only showing the whole $12,000 as paid (when $9,000 was paid) puts $3,000 too much cash out. The unpaid $3,000 reduces retained earnings now, is a current liability (Dividends Payable) on the balance sheet, is left out of this year’s statement of cash flows, and becomes a financing outflow next year when it is paid.',
    steps: [
      { id: 'f02-lnk-g3-s1', type: 'num', prompt: 'What are retained earnings at the year end?',
        answer: 90500, check: () => 64000 + 38500 - 12000, unit: '$', places: 0, tol: 0.5,
        hints: ['Ending = opening + net income − dividends.', 'Which dividends reduce retained earnings: those declared or those paid?'],
        wrong: [
          { value: 93500, say: 'Retained earnings fall by the dividends declared, $12,000, whether or not they have been paid.' },
          { value: 102500, say: 'Subtract the dividends: they distribute profit to the owners.' },
        ] },
      { id: 'f02-lnk-g3-s2', type: 'mc', prompt: 'The draft ends $3,000 below the balance sheet’s cash. Which single error fits that difference?',
        options: [
          'The whole $12,000 of dividends declared shown as paid in the financing section',
          'An increase of $1,500 in accounts receivable added in the operating section instead of subtracted',
          'An increase of $3,000 in accounts payable subtracted in the operating section instead of added',
          'A $10,000 bank loan received during the year left out of the financing section altogether',
        ],
        answer: 0,
        feedback: {
          1: 'A sign error on $1,500 would make a $3,000 gap, but adding an increase in receivables puts too much cash in: the draft would end above the balance sheet’s cash, not below.',
          2: 'Subtracting a $3,000 increase instead of adding it would leave the draft $6,000 short, twice the item.',
          3: 'Leaving out a $10,000 inflow would leave the draft $10,000 short.',
        },
        hints: ['A draft that ends too low has too little cash coming in or too much going out.', 'Compare the $3,000 with each candidate, and with twice each candidate; then check the direction.'] },
      { id: 'f02-lnk-g3-s3', type: 'fill', prompt: 'Where does the unpaid $3,000 belong in the corrected statements?',
        text: 'In the statement of changes in equity it is [[0]]. On the balance sheet it is [[1]]. In this year’s statement of cash flows it is [[2]]; it becomes a financing outflow [[3]].',
        blanks: [
          { options: ['left out until it is paid', 'deducted from retained earnings with the rest of the dividends declared'], answer: 1 },
          { options: ['a current liability, Dividends Payable', 'a deduction from cash'], answer: 0 },
          { options: ['a financing outflow', 'left out'], answer: 1 },
          { options: ['this year', 'next year, when it is paid', 'never'], answer: 1 },
        ],
        hints: ['Dividends reduce retained earnings when they are declared.', 'Cash moves only when the dividend is paid.'] },
    ],
  },
  {
    id: 'f02-lnk-g4', type: 'fill', kind: 'applied',
    prompt: 'Complete the explanation of where the gap between Lantern’s 2026 profit and its operating cash flow sits.',
    text: `Lantern’s cash from operations (${money(D.cfo)}) was [[0]] than its net income (${money(D.netIncome)}). Depreciation of ${money(D.depreciation)} is added back because it [[1]]. The ${money(opAssets)} of operating current assets on the balance sheet [[2]] the gap, and the ${money(opLiabs)} of operating current liabilities [[3]] it. Early in 2027 most of those liabilities will be paid or worked off, so the gap is likely to [[4]].`,
    blanks: [
      { options: ['lower', 'higher'], answer: 1 },
      { options: ['brought cash into the business', 'reduced net income without using cash in 2026', 'was paid to the tax authorities'], answer: 1 },
      { options: ['reduced', 'widened'], answer: 0 },
      { options: ['reduced', 'widened'], answer: 1 },
      { options: ['grow every year', 'stay exactly the same', 'narrow or reverse'], answer: 2 },
    ],
    hints: [
      'Operating current assets were earned or paid for before the cash came back; operating current liabilities are cash not yet paid out, or received early.',
      'Lantern’s opening balances were all zero, so each closing balance is the year’s change.',
    ],
    solution: `Cash from operations was higher: ${money(D.netIncome)} + ${money(D.depreciation)} − ${money(opAssets)} + ${money(opLiabs)} = ${money(D.cfo)}. Depreciation is added back because it reduced net income without using cash in 2026. The operating current assets reduced the gap; the operating current liabilities widened it. When those liabilities are paid or worked off in 2027, the gap will narrow or reverse.`,
  },
];

export const independent = [
  {
    id: 'f02-lnk-i1', type: 'num', kind: 'numerical',
    prompt: 'Westbury Cleaning Inc., a fictional company, reports these changes over the year: total liabilities rose by $14,000; total equity rose by $22,500 (net income of $30,500 less dividends of $8,000); total noncash assets, net of contra accounts, rose by $29,800. By how much did cash change? Enter a decrease as a negative number.',
    answer: 6700, check: () => 14000 + 22500 - 29800, unit: '$', places: 0,
    wrong: [
      { value: 36500, say: 'That is the rise in liabilities plus equity. Part of the new financing went into noncash assets: subtract their 29,800 increase.' },
      { value: -6700, say: 'Check the sign: liabilities and equity rose by more than noncash assets did, so cash rose.' },
      { value: 14700, say: 'Use the change in total equity (22,500), which already deducts the dividends, not net income alone.' },
    ],
    solution: 'ΔCash = ΔLiabilities + ΔEquity − ΔNoncash assets = 14,000 + 22,500 − 29,800 = +$6,700. A statement of cash flows that doesn’t end $6,700 above its opening cash doesn’t articulate with these balance sheets.',
  },
  {
    id: 'f02-lnk-i2', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'Maplewood Florists Inc., a fictional company, declared a $6,500 dividend on 20 December, payable on 15 January. The bookkeeper recorded it on 20 December as a debit to Dividends and a credit to Cash, so the cash balance is $6,500 below the bank’s and the statement of cash flows shows a dividend that hasn’t been paid. Record the correcting entry on 31 December.',
    accounts: ['Cash', 'Dividends', 'Dividends Payable', 'Retained Earnings', 'Accounts Payable', 'Notes Payable', 'Common Stock', 'Interest Payable'],
    lines: [{ acct: 'Cash', dr: 6500 }, { acct: 'Dividends Payable', cr: 6500 }],
    solution: 'The debit to Dividends was right: declaring the dividend reduces retained earnings. The credit should have gone to Dividends Payable, because no cash left. Correct it by reversing the credit to Cash and recording the liability: debit Cash 6,500; credit Dividends Payable 6,500. The financing outflow disappears from this year’s statement of cash flows; the payment on 15 January will be next year’s. The cash link could not catch this error, because the balance sheet and the statement of cash flows used the same wrong ledger balance; the bank reconciliation did.',
  },
  {
    id: 'f02-lnk-i3', type: 'classify', kind: 'conceptual',
    prompt: 'A company’s balance sheet and statement of changes in equity are drawn from its ledger, and its statement of cash flows is prepared separately. Which articulation check, if any, would catch each error?',
    items: [
      'A dividend declared on 20 December, payable in January, is listed as paid in the draft statement of cash flows; the ledger is correct.',
      'An increase in inventory is added instead of subtracted in the draft statement of cash flows.',
      'Accumulated depreciation is listed among the liabilities instead of being deducted from equipment.',
      'The year-end accrual for unpaid wages was never recorded in the ledger.',
      'Ending retained earnings are copied onto the balance sheet as $45,800 instead of $48,500.',
      'Prepaid insurance of $1,200 is in the ledger but left off the balance sheet.',
      'Rent paid is posted to Utilities Expense instead of Rent Expense.',
    ],
    categories: ['The cash link fails', 'The balance sheet doesn’t balance', 'No articulation check fails'],
    answer: [0, 0, 2, 2, 1, 1, 2],
    feedback: {
      2: 'Assets are overstated by the accumulated depreciation and liabilities by the same amount, so the balance sheet still balances. Only a review of the classification catches it.',
      3: 'Every statement is drawn from the same incomplete ledger, so all of them agree with one another. Missing adjustments are found by review, not by articulation checks.',
      4: 'Equity is $2,700 too low while assets and liabilities are right, so the balance sheet is out by $2,700, a transposition (the difference divides by 9).',
      6: 'Total expenses and net income are unchanged, so no link is affected.',
    },
    solution: 'Cash link: the unpaid dividend shown as paid, and the inventory sign error, both make the statement of cash flows end at a figure different from the ledger’s cash. Balance sheet out of balance: the wrong retained earnings and the missing prepaid insurance. No check fails: the misclassified accumulated depreciation, the missing accrual and the misposted rent, because the statements still agree with one another; review catches these.',
  },
  {
    id: 'f02-lnk-i4', type: 'mc', kind: 'applied',
    prompt: `Coastline Bank’s analyst notes that Lantern’s cash from operations (${money(D.cfo)}) exceeded its net income (${money(D.netIncome)}) in 2026. Which conclusion do the linked statements best support?`,
    options: [
      'Most of the excess came from liabilities that reverse in 2027, so 2026 overstates a normal year’s operating cash flow.',
      `Depreciation of ${money(D.depreciation)} brought cash into the business, so a larger depreciation charge would raise future operating cash flow.`,
      'Lantern collected more from customers than it earned, which shows that its revenue for the year has been understated.',
      `The excess shows that Lantern’s net income is understated by ${money(D.cfo - D.netIncome)} and should be restated.`,
    ],
    answer: 0,
    feedback: {
      1: 'Depreciation is added back because it used no cash; it doesn’t bring cash in. Only its tax effect touches cash.',
      2: 'Collecting cash before earning it is correct accounting: the excess sits in unearned revenue until the service is delivered.',
      3: 'Net income and operating cash flow measure different things; a gap between them is not an error.',
    },
    solution: `The gap of ${money(D.cfo - D.netIncome)} is depreciation (${money(D.depreciation)}) less ${money(opAssets)} of operating current assets plus ${money(opLiabs)} of operating current liabilities. Those liabilities (payables, wages, interest, tax and unearned revenue) are settled or worked off in 2027, so a normal year will show a smaller gap.`,
  },
  {
    id: 'f02-lnk-i5', type: 'num', kind: 'numerical',
    prompt: 'Tolland Signs Inc., a fictional sign maker, owed $900 of interest on its bank loan at the start of the year. Its interest expense for the year was $5,400, and interest payable at the end of the year was $1,250. How much interest did it pay in cash during the year?',
    answer: 5050, check: () => 900 + 5400 - 1250, unit: '$', places: 0,
    wrong: [
      { value: 5400, say: 'That is the expense. Part of it is still owed at the year end, and last year’s $900 was paid this year.' },
      { value: 4150, say: 'Start from the opening balance: the $900 owed at the start of the year was paid this year too.' },
      { value: 5750, say: 'Interest payable rose by $350, so less was paid than was charged: subtract the increase.' },
    ],
    solution: 'Roll forward Interest Payable: opening 900 + expense 5,400 − paid = closing 1,250, so paid = 900 + 5,400 − 1,250 = $5,050. Under US GAAP it is an operating outflow; the preparer ties it to the interest paid disclosed with the statement of cash flows.',
  },
  {
    id: 'f02-lnk-i6', type: 'short', kind: 'applied',
    prompt: 'Write a short note (four to six sentences) for Ana explaining where the gap between Lantern’s 2026 cash from operations and its net income sits, and what that means for 2027. Use at least three figures from the statements.',
    rubric: [
      'States both figures (net income $27,387; cash from operations $39,940) and the gap of $12,553.',
      'Explains that depreciation ($4,800) is the cost of assets already paid for or financed, not a source of cash.',
      'Locates $13,536 in operating current assets (receivables, inventory, supplies and prepaid insurance) on the balance sheet.',
      'Locates $21,289 in operating current liabilities (payables, wages, interest, tax, unearned revenue) and says they reverse in 2027.',
      'Concludes that 2026’s operating cash flow overstates a normal year, without calling either figure wrong.',
    ],
    model: 'Lantern earned net income of $27,387 in 2026, but its operations generated $39,940 of cash, $12,553 more. Part of the difference is depreciation of $4,800, the cost of equipment and a van that were paid for, or financed, when they were bought. Lantern also has $13,536 tied up in receivables, inventory, supplies and prepaid insurance, which lowered its cash. The larger effect runs the other way: at the year end it still owed $21,289 to suppliers, staff, lenders and the tax authorities, or for services customers had paid for in advance. Those amounts will be paid or worked off early in 2027, so next year’s operating cash flow is likely to be closer to, or below, net income; the 2026 figure flatters a normal year.',
  },
];

export const check = [
  {
    id: 'f02-lnk-k1', type: 'mc', kind: 'conceptual',
    prompt: 'The ledger is correct, but when preparing the statement of cash flows the accountant lists a dividend declared on 28 December, payable in January, as a dividend paid. Which check reveals the error?',
    options: [
      'Ending cash on the statement of cash flows against cash on the balance sheet',
      'Net income on the income statement against net income in the statement of changes in equity',
      'Ending retained earnings against opening retained earnings plus net income minus dividends',
      'Operating cash flow by the direct method against operating cash flow by the indirect method',
    ],
    answer: 0,
    feedback: {
      1: 'Dividends never pass through the income statement, so this link is unaffected.',
      2: 'Declared dividends reduce retained earnings whether paid or not, so this link still holds.',
      3: 'Dividends paid are a financing flow; both operating figures are unaffected.',
    },
    solution: 'The statement of cash flows now shows a financing outflow that never happened, so it ends below the balance sheet’s cash (taken from the correct ledger) by the amount of the dividend. The cash link fails; the others hold.',
  },
  {
    id: 'f02-lnk-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s opening balances on 1 March 2026 were all zero. Using its balance sheet at 31 December 2026, how much of the gap between its operating cash flow and its net income sits in operating current liabilities (accounts payable, wages payable, interest payable, unearned revenue and income taxes payable)?',
    answer: 21289, check: () => bal('Accounts Payable') + bal('Wages Payable') + bal('Interest Payable') + bal('Unearned Revenue') + bal('Income Taxes Payable'), unit: '$', places: 0,
    wrong: [
      { value: D.currentLiabilities, say: 'That includes the $5,000 current portion of the van note, which is a financing item, not an operating liability.' },
      { value: D.totalLiabilities, say: 'That is total liabilities, including both notes payable, which are financing.' },
      { value: opLiabs - bal('Unearned Revenue'), say: 'Unearned revenue is an operating liability too: customers’ prepayments are operating cash inflows.' },
    ],
    solution: `Accounts payable ${n(bal('Accounts Payable'))} + wages payable ${n(bal('Wages Payable'))} + interest payable ${n(bal('Interest Payable'))} + unearned revenue ${n(bal('Unearned Revenue'))} + income taxes payable ${n(bal('Income Taxes Payable'))} = $21,289. Opening balances were zero, so the closing balances are the increases, and all of them reverse in 2027.`,
  },
  {
    id: 'f02-lnk-k3', type: 'num', kind: 'applied',
    prompt: `Suppose Lantern’s accountant had found $600 more of Holiday Blend to write down at 31 December, in addition to the $${n(amt('e7'))}. Tax is 25% of income before tax, and entry e9 sets Income Taxes Payable at the year’s tax less the $${n(F.tax.estimatedPaid)} of fixed estimated payments. By how much would Lantern’s 2026 cash from operating activities change? Enter 0 if it would not change.`,
    answer: 0, check: () => -(1 - F.tax.rate) * 600 + 600 - F.tax.rate * 600, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 150, say: 'The tax saving is real, but Lantern’s estimated payments were fixed, so the saving lowers income taxes payable and reaches cash only when the tax is paid in 2027.' },
      { value: 600, say: 'A write-down moves no cash, and adding it back while also using the smaller inventory increase would count it twice.' },
      { value: -450, say: 'That is the change in net income. The smaller increase in inventory (+600) and the smaller increase in income taxes payable (−150) offset it.' },
    ],
    solution: 'Net income −450 (−600 × 0.75); the increase in inventory is 600 smaller (+600); income taxes payable are 150 lower (−150). Operating cash flow: −450 + 600 − 150 = 0. Nothing about the write-down moved cash in 2026.',
  },
  {
    id: 'f02-lnk-k4', type: 'fill', kind: 'conceptual',
    prompt: `Trace Lantern’s year-end interest accrual (e5, $${n(amt('e5'))}) through the statements.`,
    text: 'Interest expense on the [[0]] rose, so net income and retained earnings [[1]]. Interest payable on the [[2]] rose by the same amount. Because no cash moved, the indirect method [[3]] the increase in interest payable to net income.',
    blanks: [
      { options: ['balance sheet', 'income statement', 'statement of cash flows'], answer: 1 },
      { options: ['rose', 'fell', 'did not change'], answer: 1 },
      { options: ['income statement', 'statement of cash flows', 'balance sheet'], answer: 2 },
      { options: ['subtracts', 'adds', 'does not apply'], answer: 1 },
    ],
    solution: 'The expense is on the income statement, so net income and retained earnings fell. The liability, Interest Payable, is on the balance sheet. The indirect method adds the increase in interest payable to net income, because the expense was deducted without any cash being paid; the two lines offset and no cash total changes.',
  },
  {
    id: 'f02-lnk-k5', type: 'mc', kind: 'applied',
    prompt: `Ana says: “Lantern made ${money(D.netIncome)} and has ${money(D.cashEnd)} in the bank, so it can easily pay me a $25,000 dividend.” Which reply uses the linked statements correctly?`,
    options: [
      `Not quite: retained earnings are only ${money(D.retainedEarnings)}, and much of the cash is already owed to others.`,
      `Yes: cash exceeds the dividend by ${money(D.cashEnd - 25000)}, and cash is what a dividend is paid from.`,
      `Yes: net income of ${money(D.netIncome)} is more than $25,000, so this year’s profit covers the whole dividend.`,
      'Yes, provided the dividend is shown as an expense on the 2027 income statement.',
    ],
    answer: 0,
    feedback: {
      1: `Cash is necessary but not sufficient: ${money(D.currentLiabilities - bal('Unearned Revenue'))} of current liabilities need cash within the year, and the dividend would exceed the profit Lantern has kept.`,
      2: `Profit of the year isn’t the measure: retained earnings, after the ${money(D.dividends)} already paid in 2026, are ${money(D.retainedEarnings)}.`,
      3: 'Dividends are a distribution of profit, never an expense; they reduce retained earnings in the statement of changes in equity.',
    },
    solution: `A $25,000 dividend exceeds retained earnings of ${money(D.retainedEarnings)}, so it would pay out more than the profit Lantern has kept. And of the ${money(D.cashEnd)} in the bank, ${money(D.currentLiabilities - bal('Unearned Revenue'))} is needed for current liabilities within the year.`,
  },
  {
    id: 'f02-lnk-k6', type: 'num', kind: 'numerical',
    prompt: 'Northbank Dental Inc., a fictional practice, asks how its year would have looked had its staff earned $3,000 more wages in the last week of the year, unpaid until January. Tax is 25% of income before tax, and the change in tax would have been paid within the year. By how much would cash from operating activities for the year have changed?',
    answer: 750, check: () => -(1 - 0.25) * 3000 + 3000, unit: '$', places: 0,
    wrong: [
      { value: -2250, say: 'That is the change in net income. The wages are unpaid, so the indirect method adds back the increase in wages payable.' },
      { value: -3000, say: 'The wages are paid in January, not this year, so they don’t reduce this year’s cash.' },
      { value: 0, say: 'The wages don’t move cash this year, but the tax they save does: 25% × 3,000 less tax paid within the year.' },
    ],
    solution: 'Net income −3,000 × 0.75 = −2,250; increase in wages payable +3,000; operating cash flow −2,250 + 3,000 = +750, which is the tax saved in cash.',
  },
];
