// linking-the-statements.ex.js — F02 · Linking the statements: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern’s figures are built from case.js; every `check` recomputes.
import { CHART, FACTS as F, YEAR, ADJUSTMENTS, LEDGER, DERIVED as D } from './case.js';

const bal = (n) => LEDGER[n]?.balance || 0;
const tx = (id) => [...YEAR, ...ADJUSTMENTS].find((e) => e.id === id);
const amt = (id) => tx(id).lines.reduce((s, l) => s + (l.dr || 0), 0);
/** 12,000 (no dollar sign); used to build prompts from the case so they always agree with it. */
const n = (x) => Math.abs(x).toFixed(Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** $1,234 with a real minus sign for negatives. */
const money = (x) => `${x < -1e-9 ? '−' : ''}$${n(Math.round(x * 100) / 100)}`;
const signed = (x) => (x > 1e-9 ? `+${money(x)}` : money(x));
const r2 = (x) => Math.round(x * 100) / 100 + 0;

const opAssets = D.receivablesNet + D.inventoryEnd + bal('Supplies') + bal('Prepaid Insurance');
const opLiabs = bal('Accounts Payable') + bal('Wages Payable') + bal('Interest Payable') + bal('Unearned Revenue') + bal('Income Taxes Payable');

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
    intro: 'A change in depreciation, taxed at the rate you choose. The last slider sets how much of the year’s tax is paid before the year end; Lantern’s accountant left part of 2026’s tax unpaid.',
    inputs: [
      { id: 'dep', label: 'Change in depreciation expense', min: -3000, max: 5000, step: 100, value: 1000, fmt: 'money' },
      { id: 'rate', label: 'Tax rate on income before tax', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
      { id: 'paid', label: 'Share of the year’s tax paid before the year end', min: 0, max: 100, step: 10, value: 100, fmt: 'pct' },
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
        : `Net income changes by ${signed(dNI)}: the ${d > 0 ? 'extra' : 'smaller'} expense less the ${v.rate}% tax on it. Operating cash flow changes by ${signed(dCFO)}, which is only the tax ${d > 0 ? 'saved' : 'added'} that is paid within the year${p < 1 && t > 0 ? `; the other ${signed(dPayable)} sits in income taxes payable until the tax is paid` : ''}. Depreciation itself moves no cash. Assets change by ${signed(dAssets)} and liabilities plus equity by ${signed(dLE)}, so the balance sheet still balances.`;
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
    prompt: 'Which statements does each of Lantern’s 2026 entries change? (An entry that changes the income statement also changes equity, through net income.)',
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
    categories: ['Income statement and balance sheet, no cash flow', 'Balance sheet and statement of cash flows only', 'Income statement, balance sheet and statement of cash flows', 'Balance sheet only'],
    answer: [0, 1, 2, 3, 1, 0, 2, 3],
    hints: [
      'Ask two questions of each entry: does it touch a revenue or expense account, and does it touch Cash?',
      'Deposits received are cash but not yet revenue; buying on account changes an asset and a liability but moves no cash.',
    ],
    feedback: {
      1: 'Buying equipment is an investing outflow and a new asset; the expense arrives later, as depreciation.',
      3: 'A reclassification moves an amount from one liability line to another. Total liabilities, net income and cash are unchanged.',
      4: 'The deposits are unearned revenue, a liability, until the events are catered; the cash is an operating inflow now.',
      5: 'The write-down raises cost of goods sold and lowers inventory. No cash moves.',
      7: 'Supplies (an asset) and accounts payable (a liability) both rise. The expense comes when the supplies are used, the cash flow when the vendor is paid.',
    },
    solution: 'Income statement and balance sheet only: depreciation (e3) and the write-down (e7). Balance sheet and statement of cash flows: the equipment bought for cash (y3, investing) and the deposits (y6, operating). All three: fees paid (y14) and tax paid (y28), both expenses settled in cash. Balance sheet only: the reclassification (e8) and supplies bought on account (y18).',
  },
  {
    id: 'f02-lnk-g2', type: 'steps', kind: 'numerical',
    prompt: 'Ravelin Physio Inc., a fictional clinic, finds that it should have recorded $4,000 more depreciation on its treatment equipment this year. Its income tax is 25% of income before tax, and all of the year’s tax is paid in cash before the year end.',
    solution: 'Net income: −4,000 × (1 − 0.25) = −3,000. Operating cash flow (indirect method): −3,000 + 4,000 = +1,000, the tax saved. Assets: cash +1,000 and equipment (net) −4,000, a total of −3,000, which equals liabilities 0 plus equity (retained earnings) −3,000.',
    steps: [
      { id: 'f02-lnk-g2-s1', type: 'num', prompt: 'By how much does net income change? Enter a decrease as a negative number.',
        answer: -3000, check: () => -(1 - 0.25) * 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Depreciation is deducted before tax, so it lowers the tax too.', 'Net income falls by the expense less the tax saved: 4,000 × (1 − 0.25).'],
        wrong: [
          { value: -4000, say: 'Lower income before tax also means lower income tax, by 25% × 4,000 = 1,000, so net income falls by 3,000.' },
          { value: 3000, say: 'More expense means less net income: the change is negative.' },
          { value: -1000, say: 'That is the change in income tax. Net income falls by the expense less that saving.' },
        ] },
      { id: 'f02-lnk-g2-s2', type: 'num', prompt: 'By how much does cash from operating activities change?',
        answer: 1000, check: () => -(1 - 0.25) * 4000 + 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Indirect method: start from the change in net income and add back the change in depreciation.', '−3,000 + 4,000.'],
        wrong: [
          { value: 4000, say: 'Depreciation isn’t a source of cash; only the tax saved, 25% × 4,000, is.' },
          { value: -3000, say: 'Add back the extra depreciation: it reduced net income without using cash.' },
          { value: 0, say: 'Here the tax saving is real cash, because all of the year’s tax is paid within the year: 1,000 less tax paid.' },
        ] },
      { id: 'f02-lnk-g2-s3', type: 'num', prompt: 'By how much do total assets change? Enter a decrease as a negative number.',
        answer: -3000, check: () => 0.25 * 4000 - 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Two assets change: cash and the equipment’s book value.', 'Cash +1,000; equipment (net) −4,000.'],
        wrong: [
          { value: -4000, say: 'Cash rises by the 1,000 of tax saved, which offsets part of the 4,000 fall in book value.' },
          { value: 1000, say: 'That is only the change in cash. The equipment’s book value falls by 4,000.' },
        ] },
    ],
  },
  {
    id: 'f02-lnk-g3', type: 'steps', kind: 'numerical',
    prompt: 'Pennant Climbing Gym Inc., a fictional company, began the year with retained earnings of $64,000, cash of $18,200 and no dividends payable. Its net income for the year was $38,500. It declared dividends of $12,000, of which $3,000 was still unpaid at the year end. Operating activities provided $46,300 and investing activities used $31,000; it borrowed $10,000 and repaid $6,000 of an older loan.',
    solution: 'Retained earnings: 64,000 + 38,500 − 12,000 = $90,500 (declared dividends). Financing: 10,000 − 6,000 − 9,000 = −$5,000 (only the 9,000 paid). Ending cash: 18,200 + 46,300 − 31,000 − 5,000 = $28,500. The $3,000 unpaid dividend is a current liability.',
    steps: [
      { id: 'f02-lnk-g3-s1', type: 'num', prompt: 'What are retained earnings at the year end?',
        answer: 90500, check: () => 64000 + 38500 - 12000, unit: '$', places: 0, tol: 0.5,
        hints: ['Ending = opening + net income − dividends.', 'Which dividends reduce retained earnings: those declared or those paid?'],
        wrong: [
          { value: 93500, say: 'Retained earnings fall by the dividends declared, $12,000, whether or not they have been paid.' },
          { value: 102500, say: 'Subtract the dividends: they distribute profit to the owners.' },
        ] },
      { id: 'f02-lnk-g3-s2', type: 'num', prompt: 'What is net cash from financing activities? Enter an outflow as a negative number.',
        answer: -5000, check: () => 10000 - 6000 - (12000 - 3000), unit: '$', places: 0, tol: 0.5,
        hints: ['Financing: borrowing in, repayments out, dividends paid out.', 'Only the dividends actually paid, 12,000 − 3,000, used cash.'],
        wrong: [
          { value: -8000, say: 'Only the $9,000 paid is a cash outflow; the unpaid $3,000 is a liability.' },
          { value: 4000, say: 'The dividends paid are a financing outflow too.' },
        ] },
      { id: 'f02-lnk-g3-s3', type: 'num', prompt: 'What is cash at the year end?',
        answer: 28500, check: () => 18200 + 46300 - 31000 - 5000, unit: '$', places: 0, tol: 0.5,
        hints: ['Ending cash = opening cash + operating + investing + financing.', '18,200 + 46,300 − 31,000 − 5,000.'],
        wrong: [
          { value: 25500, say: 'That uses the dividends declared. Only the 9,000 paid reduced cash.' },
          { value: 10300, say: 'That is the change in cash. Add it to the opening balance of 18,200.' },
        ] },
    ],
  },
  {
    id: 'f02-lnk-g4', type: 'fill', kind: 'applied',
    prompt: 'Complete the explanation of the gap between Lantern’s 2026 profit and its operating cash flow.',
    text: `Lantern’s cash from operations (${money(D.cfo)}) was [[0]] than its net income (${money(D.netIncome)}). Depreciation of ${money(D.depreciation)} is added back because it [[1]]. The ${money(opAssets)} increase in receivables, inventory, supplies and prepaid insurance [[2]] the gap, and the ${money(opLiabs)} increase in operating liabilities [[3]] it. Early in 2027 most of those liabilities will be paid or worked off, so the gap is likely to [[4]].`,
    blanks: [
      { options: ['lower', 'higher'], answer: 1 },
      { options: ['brought cash into the business', 'reduced net income without using cash in 2026', 'was paid to the tax authorities'], answer: 1 },
      { options: ['reduced', 'widened'], answer: 0 },
      { options: ['reduced', 'widened'], answer: 1 },
      { options: ['grow every year', 'stay exactly the same', 'narrow or reverse'], answer: 2 },
    ],
    hints: [
      'Indirect method: net income + depreciation − increases in operating assets + increases in operating liabilities.',
      'An increase in an operating asset ties up cash; an increase in an operating liability means cash not yet paid out, or received early.',
    ],
    solution: `Cash from operations was higher: ${money(D.netIncome)} + ${money(D.depreciation)} − ${money(opAssets)} + ${money(opLiabs)} = ${money(D.cfo)}. Depreciation is added back because it reduced net income without using cash in 2026. Growth in operating assets reduced the gap; growth in operating liabilities widened it. When those liabilities are paid or worked off in 2027, the gap will narrow or reverse.`,
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
    solution: 'ΔCash = ΔLiabilities + ΔEquity − ΔNoncash assets = 14,000 + 22,500 − 29,800 = +$6,700.',
  },
  {
    id: 'f02-lnk-i2', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'Maplewood Florists Inc., a fictional company, declared a $6,500 dividend on 20 December, payable on 15 January. The bookkeeper recorded it on 20 December as a debit to Dividends and a credit to Cash, so the cash balance is $6,500 too low and the statement of cash flows shows a dividend that hasn’t been paid. Record the correcting entry on 31 December.',
    accounts: ['Cash', 'Dividends', 'Dividends Payable', 'Retained Earnings', 'Accounts Payable', 'Notes Payable', 'Common Stock', 'Interest Payable'],
    lines: [{ acct: 'Cash', dr: 6500 }, { acct: 'Dividends Payable', cr: 6500 }],
    solution: 'The debit to Dividends was right: declaring the dividend reduces retained earnings. The credit should have gone to Dividends Payable, because no cash left. Correct it by reversing the credit to Cash and recording the liability: debit Cash 6,500; credit Dividends Payable 6,500. The financing outflow disappears from this year’s statement of cash flows; the payment on 15 January will be next year’s. Note that the cash link could not catch this error, because the balance sheet and the statement of cash flows used the same wrong ledger balance; a bank reconciliation would.',
  },
  {
    id: 'f02-lnk-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For a business using the indirect method, does each item make cash from operations higher than net income, lower than net income, or not affect the gap between them?',
    items: ['Depreciation expense', 'An increase in accounts receivable', 'An increase in unearned revenue', 'An increase in inventory', 'Dividends paid to the owners', 'A delivery van bought for cash', 'An increase in wages payable', 'An increase in prepaid insurance'],
    categories: ['Makes cash from operations higher than net income', 'Makes cash from operations lower than net income', 'No effect on the gap (not an operating item)'],
    answer: [0, 1, 0, 1, 2, 2, 0, 1],
    feedback: {
      0: 'Depreciation reduced net income without using cash, so operating cash flow is higher than net income by that amount.',
      2: 'Customers paid before the service was delivered: cash came in that isn’t yet revenue.',
      4: 'Dividends paid are a financing outflow. They affect neither net income nor operating cash flow.',
      5: 'Buying a long-term asset is an investing outflow. It affects neither net income nor operating cash flow now; its depreciation comes later.',
      7: 'Paying for insurance in advance uses cash before the expense is recognised.',
    },
    solution: 'Higher: depreciation, more unearned revenue, more wages payable (cash kept or received early). Lower: more receivables, inventory and prepaid insurance (cash tied up). No effect: dividends paid (financing) and the van (investing).',
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
    solution: `The gap of ${money(D.cfo - D.netIncome)} is depreciation (${money(D.depreciation)}) less ${money(opAssets)} tied up in operating assets plus ${money(opLiabs)} of operating liabilities. Those liabilities (payables, wages, interest, tax and unearned revenue) are settled or worked off in 2027, so a normal year will show a smaller gap.`,
  },
  {
    id: 'f02-lnk-i5', type: 'num', kind: 'numerical',
    prompt: `Lantern’s 2026 wages were $${n(F.wages.events)} for event baristas and $${n(F.wages.shopAndOffice)} for shop and office staff. Wages payable were $0 on 1 March and $${n(bal('Wages Payable'))} on 31 December. How much cash did Lantern pay to employees in 2026?`,
    answer: 41500, check: () => F.wages.events + F.wages.shopAndOffice - (bal('Wages Payable') - 0), unit: '$', places: 0,
    wrong: [
      { value: F.wages.events + F.wages.shopAndOffice, say: 'That is the wages earned. Part of it, still owed at the year end, wasn’t paid in 2026.' },
      { value: F.wages.events + F.wages.shopAndOffice + bal('Wages Payable'), say: 'An increase in wages payable means less cash paid than earned: subtract it.' },
      { value: F.wages.shopAndOffice - bal('Wages Payable'), say: 'Event baristas are employees too; their wages are in cost of services, but the cash was paid to employees.' },
    ],
    solution: `Roll forward Wages Payable: opening 0 + wages earned ${n(F.wages.events + F.wages.shopAndOffice)} − cash paid = closing ${n(bal('Wages Payable'))}, so cash paid = ${n(F.wages.events + F.wages.shopAndOffice)} − ${n(bal('Wages Payable'))} = $41,500, the “Cash paid to employees” line of the direct-method statement.`,
  },
  {
    id: 'f02-lnk-i6', type: 'short', kind: 'applied',
    prompt: 'Write a short note (four to six sentences) for Ana explaining why Lantern’s 2026 cash from operations is larger than its net income, and what that means for 2027. Use at least three figures from the statements.',
    rubric: [
      'States both figures (net income $27,387; cash from operations $39,940) and the gap of $12,553.',
      'Explains that depreciation ($4,800) is added back because it used no cash, not because it produced cash.',
      'Explains that $13,536 of cash is tied up in receivables, inventory, supplies and prepaid insurance.',
      'Explains that $21,289 of operating liabilities (payables, wages, interest, tax, unearned revenue) increased cash in 2026 and will reverse in 2027.',
      'Concludes that 2026’s operating cash flow overstates a normal year, without calling either figure wrong.',
    ],
    model: 'Lantern earned net income of $27,387 in 2026, but its operations generated $39,940 of cash, $12,553 more. Part of the difference is depreciation of $4,800, which reduced profit without using any cash this year. Lantern also tied up $13,536 in receivables, inventory, supplies and prepaid insurance, which lowered its cash. The larger effect runs the other way: at the year end it still owed $21,289 to suppliers, staff, lenders and the tax authorities, or for services customers had paid for in advance. Those amounts will be paid or worked off early in 2027, so next year’s operating cash flow is likely to be closer to, or below, net income; the 2026 figure flatters a normal year.',
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
    prompt: 'Lantern’s opening balances on 1 March 2026 were all zero. Using its balance sheet at 31 December 2026, by how much did its operating liabilities (accounts payable, wages payable, interest payable, unearned revenue and income taxes payable) increase during the period?',
    answer: 21289, check: () => opLiabs, unit: '$', places: 0,
    wrong: [
      { value: D.currentLiabilities, say: 'That includes the $5,000 current portion of the van note, which is a financing item, not an operating liability.' },
      { value: D.totalLiabilities, say: 'That is total liabilities, including both notes payable, which are financing.' },
      { value: opLiabs - bal('Unearned Revenue'), say: 'Unearned revenue is an operating liability too: customers’ prepayments are operating cash inflows.' },
    ],
    solution: `Accounts payable ${n(bal('Accounts Payable'))} + wages payable ${n(bal('Wages Payable'))} + interest payable ${n(bal('Interest Payable'))} + unearned revenue ${n(bal('Unearned Revenue'))} + income taxes payable ${n(bal('Income Taxes Payable'))} = $21,289. Opening balances were zero, so the closing balances are the increases.`,
  },
  {
    id: 'f02-lnk-k3', type: 'num', kind: 'applied',
    prompt: `Suppose Lantern’s accountant had found $600 more of Holiday Blend to write down at 31 December, in addition to the $${n(amt('e7'))}. Tax is 25% of income before tax, and entry e9 sets Income Taxes Payable at the year’s tax less the $${n(F.tax.estimatedPaid)} already paid. By how much would Lantern’s 2026 cash from operating activities change? Enter 0 if it would not change.`,
    answer: 0, check: () => -(1 - F.tax.rate) * 600 + 600 - F.tax.rate * 600, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 150, say: 'The tax saving is real, but Lantern’s 2026 tax is partly unpaid at the year end. The saving lowers income taxes payable and reaches cash only when the tax is paid in 2027.' },
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
    solution: 'The expense is on the income statement, so net income and retained earnings fell. The liability, Interest Payable, is on the balance sheet. The indirect method adds the increase in interest payable to net income, because the expense was deducted without any cash being paid.',
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
      1: `Cash is necessary but not sufficient: ${money(D.currentLiabilities - bal('Unearned Revenue'))} of current liabilities need cash within the year, and the dividend would exceed retained earnings.`,
      2: `Profit of the year isn’t the limit: retained earnings, after the ${money(D.dividends)} already paid in 2026, are ${money(D.retainedEarnings)}.`,
      3: 'Dividends are a distribution of profit, never an expense; they reduce retained earnings in the statement of changes in equity.',
    },
    solution: `A $25,000 dividend exceeds retained earnings of ${money(D.retainedEarnings)}, so it would pay out more than Lantern has earned and kept. And of the ${money(D.cashEnd)} in the bank, ${money(D.currentLiabilities - bal('Unearned Revenue'))} is needed for current liabilities within the year.`,
  },
  {
    id: 'f02-lnk-k6', type: 'num', kind: 'numerical',
    prompt: 'Northbank Dental Inc., a fictional practice, finds $3,000 of wages earned by staff in the last week of the year that hadn’t been recorded; they will be paid in January. Tax is 25% of income before tax, and the year’s tax is settled in cash within the year, so recording the wages lowers the tax paid. By how much does recording the accrual change cash from operating activities for the year?',
    answer: 750, check: () => -(1 - 0.25) * 3000 + 3000, unit: '$', places: 0,
    wrong: [
      { value: -2250, say: 'That is the change in net income. The wages are unpaid, so the indirect method adds back the increase in wages payable.' },
      { value: -3000, say: 'The wages are paid in January, not this year, so they don’t reduce this year’s cash.' },
      { value: 0, say: 'The wages don’t move cash this year, but the tax they save does: 25% × 3,000 less tax paid.' },
    ],
    solution: 'Net income −3,000 × 0.75 = −2,250; increase in wages payable +3,000; operating cash flow −2,250 + 3,000 = +750, which is the tax saved in cash.',
  },
];
