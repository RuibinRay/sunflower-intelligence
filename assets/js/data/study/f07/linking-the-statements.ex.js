// linking-the-statements.ex.js — F07 · Linking the statements: widgets, practice and the knowledge check (answer keys
// live here). Figures from case.js (MODEL, OPENING, FINANCE); every num item's `check` recomputes its answer.
import { MODEL as M, OPENING as O, FINANCE as FIN } from './case.js?v=38';

const R0 = M.rows[0], L = M.loans;
const otherCA = R0.currentAssets - R0.cash;                         // receivables, inventory, prepaid at 31 December 2028
const otherCL = R0.currentLiabsCovenant - R0.loc - R0.currentDebt;    // payables, wages, interest owed, unearned, tax
const dueShare = L.term[1].principal / L.term[0].end;                 // share of the term loan's balance repaid in 2029
const f0 = (x) => Math.round(x).toLocaleString('en-US');

/** The 2028 covenant, first-order: extra long-term borrowing, capital spending deferred to 2029, and the minimum cash. */
export function covenant2028({ extra = 0, deferred = 0, minCash = FIN.minCash } = {}) {
  const cashBefore = M.cashBefore[0] + extra + deferred;
  const loc = Math.min(FIN.locLimit, Math.max(0, O.loc + minCash - cashBefore));
  const cash = cashBefore + loc - O.loc;
  const ca = otherCA + cash, cl = otherCL + loc + R0.currentDebt + extra * dueShare;
  return { cash, loc, ca, cl, ratio: ca / cl, gap: Math.max(0, O.loc + minCash - cashBefore - FIN.locLimit) };
}

export const widgets = {
  'ls-covenant': {
    type: 'formula', title: 'Coastline’s covenant at 31 December 2028 (first-order effects)',
    intro: 'The base case is a current ratio of 1.01. Try each lever on its own.',
    inputs: [
      { id: 'minCash', label: 'Minimum cash balance', min: 5000, max: 45000, step: 1000, value: 15000, fmt: 'money' },
      { id: 'extra', label: 'Extra term loan (five years)', min: 0, max: 40000, step: 1000, value: 0, fmt: 'money' },
      { id: 'deferred', label: '2028 capital spending deferred to 2029', min: 0, max: 30000, step: 1000, value: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const c = covenant2028(v);
      return {
        headline: { label: 'Current ratio, 31 December 2028', value: c.ratio.toFixed(2) },
        rows: [['Cash', `$${f0(c.cash)}`], ['Line of credit drawn', `$${f0(c.loc)}`], ['Current assets', `$${f0(c.ca)}`], ['Current liabilities (excluding leases)', `$${f0(c.cl)}`], ['Covenant (at least 1.2)', c.ratio >= 1.2 ? 'Passes' : 'Breached']],
        note: c.gap > 0 ? `The line of credit is at its limit: a funding gap of $${f0(c.gap)}.` : c.ratio >= 1.2 ? 'Long-term money, or cash not spent, raises current assets without adding as much to current liabilities.' : 'Holding more cash financed by the line of credit adds the same amount to both sides, so the ratio barely moves. (Knock-on effects on interest and depreciation are left out here; module 3 runs the full model.)',
      };
    },
  },
};

export const guided = [
  {
    id: 'f07-ls-g1', type: 'num', kind: 'numerical',
    prompt: 'A company’s retained earnings were $80,000 at the start of the year. It made net income of $25,000 and paid dividends of $6,000. What are retained earnings at the year end?',
    answer: 99000, check: () => 80000 + 25000 - 6000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 105000, say: 'Dividends are paid out of retained earnings: subtract them.' }],
    hints: ['Opening + net income − dividends.'],
    solution: '80,000 + 25,000 − 6,000 = 99,000 dollars.',
  },
  {
    id: 'f07-ls-g2', type: 'steps', kind: 'numerical',
    prompt: 'A year’s figures: net income $12,000; depreciation $18,000; receivables up $7,000; inventory up $3,000; payables up $4,000; capital spending $30,000; a new loan of $20,000; repayments of $6,000; dividends $2,000; opening cash $9,000.',
    steps: [
      { id: 'f07-ls-g2a', type: 'num', kind: 'numerical', prompt: 'Operating cash flow ($).', answer: 24000, check: () => 12000 + 18000 - 7000 - 3000 + 4000, unit: '$', places: 0, tol: 1, hints: ['Net income + depreciation − increases in receivables and inventory + increase in payables.'],
        wrong: [{ value: 38000, say: 'Increases in receivables and inventory use cash: subtract them.' }] },
      { id: 'f07-ls-g2b', type: 'num', kind: 'numerical', prompt: 'Financing cash flow ($).', answer: 12000, check: () => 20000 - 6000 - 2000, unit: '$', places: 0, tol: 1, hints: ['New loan − repayments − dividends.'] },
      { id: 'f07-ls-g2c', type: 'num', kind: 'numerical', prompt: 'Closing cash ($).', answer: 15000, check: () => 9000 + 24000 - 30000 + 12000, unit: '$', places: 0, tol: 1, hints: ['Opening + operating − capital spending + financing.'] },
    ],
    solution: 'Operating 12,000 + 18,000 − 7,000 − 3,000 + 4,000 = 24,000; investing −30,000; financing 20,000 − 6,000 − 2,000 = 12,000; closing cash 9,000 + 24,000 − 30,000 + 12,000 = 15,000.',
  },
  {
    id: 'f07-ls-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A model’s balance check shows $8,000 in the first forecast year. The year’s increase in inventory is $4,000. What is the most likely cause?',
    options: ['The inventory change has the wrong sign in cash flow', 'Inventory was left out of the balance sheet altogether', 'Depreciation has been added back twice in the cash flow statement', 'The opening balance sheet is wrong'],
    answer: 0,
    feedback: { 1: 'Leaving out a $4,000 balance would usually show a difference of about that size, not twice it.', 2: 'That would show a difference equal to the year’s depreciation, which is not $4,000 or $8,000 here.', 3: 'Then the check would be wrong in the opening column too.' },
    hints: ['A difference of twice an amount often means that amount went the wrong way.'],
    solution: 'A $4,000 item with the wrong sign moves the check by $8,000: twice the amount. Look first at how the inventory change enters operating cash flow.',
  },
  {
    id: 'f07-ls-g4', type: 'num', kind: 'numerical',
    prompt: `At 31 December 2028 Lantern’s model shows current assets of $${f0(R0.currentAssets)} and current liabilities (excluding leases) of $${f0(R0.currentLiabsCovenant)}. What is the current ratio, to two decimal places?`,
    answer: Math.round(R0.currentRatio * 100) / 100, check: () => R0.currentAssets / R0.currentLiabsCovenant, unit: '×', places: 2, tol: 0.006,
    hints: ['Current assets ÷ current liabilities.'],
    solution: `${f0(R0.currentAssets)} ÷ ${f0(R0.currentLiabsCovenant)} = ${R0.currentRatio.toFixed(2)}, below the covenant’s 1.2.`,
  },
];

export const independent = [
  {
    id: 'f07-ls-i1', type: 'num', kind: 'numerical',
    prompt: 'A company lost $30,000 last year and makes a pre-tax profit of $50,000 this year. The tax rate is 25% and the loss can be carried forward in full. What is this year’s tax?',
    answer: 5000, check: () => 0.25 * Math.max(0, 50000 - 30000), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 12500, say: 'That ignores the loss carried forward: taxable profit is 50,000 − 30,000.' }],
    solution: 'Taxable profit 50,000 − 30,000 = 20,000; tax 25% × 20,000 = 5,000 dollars.',
  },
  {
    id: 'f07-ls-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Where does each item from the schedules go in the linked statements, besides the income statement?',
    items: ['Depreciation for the year', 'Net income', 'Capital spending', 'Next year’s loan principal', 'Hollis’s $75,000 for new shares'],
    categories: ['Added back in operating cash flow; reduces property and equipment', 'Added to retained earnings; starts operating cash flow', 'Investing cash outflow; added to property and equipment', 'Current portion of long-term debt', 'Financing inflow; common stock'],
    answer: [0, 1, 2, 3, 4],
    solution: 'Each schedule item has a place in two or three statements; following them is how a model is checked.',
  },
  {
    id: 'f07-ls-i3', type: 'mc', kind: 'applied',
    prompt: 'To meet a current-ratio covenant of 1.2, a manager proposes drawing an extra $20,000 on the line of credit and holding it as cash at the year end. Current assets are $59,000 and current liabilities $58,000. What happens to the ratio?',
    options: ['It barely moves: both sides rise by $20,000', 'It rises to well above 1.2, because cash is a current asset', 'It falls below 1, because borrowing always weakens a balance sheet', 'It is unchanged, because the line of credit is not a liability'],
    answer: 0,
    feedback: { 1: 'Cash rises, but so does the line of credit, a current liability: (59 + 20) ÷ (58 + 20) = 1.01.', 2: 'The ratio rises slightly toward 1 from above, not below.', 3: 'A drawn line of credit is a current liability.' },
    solution: '(59,000 + 20,000) ÷ (58,000 + 20,000) = 1.01: short-term borrowing cannot repair a current ratio.',
  },
  {
    id: 'f07-ls-i4', type: 'num', kind: 'numerical',
    prompt: 'Opening cash is $15,000. Operating cash flow is $69,000, capital spending $25,000 and financing cash flow −$26,000. What is closing cash?',
    answer: 33000, check: () => 15000 + 69000 - 25000 - 26000, unit: '$', places: 0, tol: 1,
    solution: '15,000 + 69,000 − 25,000 − 26,000 = 33,000 dollars.',
  },
  {
    id: 'f07-ls-i5', type: 'order', kind: 'conceptual',
    prompt: 'Put the model’s calculations for a forecast year in the order they are done.',
    items: ['Revenue, costs and EBITDA', 'Working capital balances and depreciation', 'Interest and repayments on the fixed-term loans', 'Net income, after tax and any loss carried forward', 'Cash before the line of credit', 'The line of credit drawn or repaid, and closing cash', 'The balance sheet and its check'],
    solution: 'Operations, then schedules, then fixed loans, then net income, then cash before the revolver, then the revolver, then the balance sheet. Each step uses only earlier results, which keeps the model free of loops.',
  },
];

export const check = [
  {
    id: 'f07-ls-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is it wrong to make a balance sheet balance by typing an adjustment into one line?',
    options: ['It hides a broken link that will fail again', 'Accounting standards forbid rounding differences on any balance sheet', 'Typed numbers slow the spreadsheet', 'Lenders only accept balance sheets with an odd number of lines'],
    answer: 0,
    feedback: { 1: 'The issue is not rounding: a plug can hide large errors.', 2: 'Speed is not the problem; correctness is.', 3: 'There is no such rule.' },
    solution: 'A plug makes the check zero today and wrong tomorrow. Find the missing or wrong link instead.',
  },
  {
    id: 'f07-ls-k2', type: 'num', kind: 'numerical',
    prompt: 'Net income is −$19,292 (a loss), depreciation $35,979, working capital assets fall $8,589, working capital liabilities rise $6,630 and interest owed falls $453. What is operating cash flow?',
    answer: 31453, check: () => -19292 + 35979 + 8589 + 6630 - 453, unit: '$', places: 0, tol: 1,
    solution: '−19,292 + 35,979 + 8,589 + 6,630 − 453 = 31,453 dollars: Lantern’s 2028.',
  },
  {
    id: 'f07-ls-k3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s 2028 loss is $19,292 and its 2029 pre-tax profit is $37,297. At 25%, what is its 2029 tax?',
    answer: 4501, check: () => 0.25 * (37297 - 19292), unit: '$', places: 0, tol: 1,
    solution: '25% × (37,297 − 19,292) = 25% × 18,005 = 4,501 dollars.',
  },
  {
    id: 'f07-ls-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s current ratio is 1.01 at the end of 2028 against a covenant of 1.2. Which plan would actually fix it?',
    options: ['More long-term borrowing, or deferred 2028 spending', 'Draw more on the line of credit and hold the cash at the year end', 'Pay suppliers more slowly so that payables rise at the year end', 'Report the lease liabilities as current liabilities instead'],
    answer: 0,
    feedback: { 1: 'The line is a current liability: both sides rise together.', 2: 'Payables are current liabilities: the ratio gets worse.', 3: 'Adding lease liabilities would lower the ratio, and the covenant excludes them anyway.' },
    solution: 'Only long-term money or less spending raises current assets more than current liabilities.',
  },
  {
    id: 'f07-ls-k5', type: 'num', kind: 'numerical',
    prompt: 'Current liabilities are $58,382 and the covenant requires a current ratio of at least 1.2. What must current assets be, at least?',
    answer: 70058.4, check: () => 1.2 * 58382, unit: '$', places: 0, tol: 1,
    solution: '1.2 × 58,382 = 70,058 dollars.',
  },
  {
    id: 'f07-ls-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these must hold in a correctly linked three-statement model? Select all that apply.',
    options: ['Closing cash in the cash flow statement equals cash on the balance sheet', 'Retained earnings = last year’s + net income − dividends', 'Total assets = total liabilities + equity in every period', 'Net income equals operating cash flow in every year', 'Capital spending equals depreciation in every year'],
    answer: [0, 1, 2],
    feedback: { 3: 'They differ by depreciation and working capital changes, among others.', 4: 'They differ; comparing them is a useful check, but they need not be equal.' },
    solution: 'The cash link, the retained earnings roll-forward and the balance check are the three tests every linked model must pass.',
  },
];
