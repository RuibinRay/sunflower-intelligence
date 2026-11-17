// working-capital-and-capex.ex.js — F07 · Working capital and capital spending: widgets, practice and the knowledge
// check (answer keys live here). Figures from case.js (OPENING, WC, MODEL); every num item's `check` recomputes.
import { OPENING as O, WC, MODEL as M } from './case.js?v=35';

const F = M.F, R = M.rows;
const COLS = ['D', 'E', 'F', 'G', 'H'];
const MON = '$#,##0', P = '0.0%';
const invoiced = F.catering.map((c, t) => c + F.training[t] + F.kitchen[t]);
const nwc = (x) => x.receivables + x.contractAsset + x.inventory + x.prepaid - x.payables - x.wagesPayable - x.unearned - x.taxPayable;

/** The working capital schedule: assumptions in B4:B11, flows in rows 14–19, balances in rows 21–30. */
export function wcCells({ omit = [] } = {}) {
  const c = {
    A1: 'Lantern Coffee Co.: working capital schedule ($, 31 December)', A3: 'Assumptions (Ana’s, from the 2027 accounts)',
    A4: 'Days: invoiced customers', B4: WC.dso, A5: 'Days: Cold Brew grocers', B5: WC.coldBrewDays, A6: 'Days of inventory', B6: WC.dio,
    A7: 'Days of payables', B7: WC.dpo, A8: 'Days of wages owed', B8: WC.wageDays, A9: 'Unearned revenue, share of revenue', B9: WC.unearnedShare,
    A10: 'Taxes payable, share of tax expense', B10: WC.taxPayableShare, A11: 'Supplies and prepaid (held flat)', B11: WC.prepaid,
    A13: 'Flows for the year (from the model)', C13: '2027A',
    A14: 'Invoiced revenue (catering, training, second kitchen)', C14: 154360, A15: 'Cold Brew revenue', C15: 0, A16: 'Cost of goods sold', C16: 163125,
    A17: 'Wages', C17: 161400, A18: 'Total revenue', C18: 577860, A19: 'Tax expense', C19: 7477,
    A20: 'Balances', A21: 'Receivables (net)', C21: O.receivables, A22: 'Contract asset', C22: O.contractAsset, A23: 'Inventory', C23: O.inventory,
    A24: 'Supplies and prepaid', C24: O.prepaid, A25: 'Payables', C25: O.payables, A26: 'Wages payable', C26: O.wagesPayable,
    A27: 'Unearned revenue', C27: O.unearned, A28: 'Income taxes payable', C28: O.taxPayable,
    A29: 'Operating working capital', C29: '=C21+C22+C23+C24-C25-C26-C27-C28', A30: 'Change (increase uses cash)',
  };
  const f = {
    21: (k) => `=${k}14*$B$4/365+${k}15*$B$5/365`, 22: () => 0, 23: (k) => `=${k}16*$B$6/365`, 24: () => '=$B$11',
    25: (k) => `=${k}16*$B$7/365`, 26: (k) => `=${k}17*$B$8/365`, 27: (k) => `=${k}18*$B$9`, 28: (k) => `=${k}19*$B$10`,
    29: (k) => `=${k}21+${k}22+${k}23+${k}24-${k}25-${k}26-${k}27-${k}28`, 30: (k, t) => `=${k}29-${t ? COLS[t - 1] : 'C'}29`,
  };
  COLS.forEach((k, t) => {
    Object.assign(c, { [`${k}13`]: `${2028 + t}E`, [`${k}14`]: invoiced[t], [`${k}15`]: F.coldBrew[t], [`${k}16`]: F.costOfGoods[t], [`${k}17`]: F.wages[t], [`${k}18`]: F.revenue[t], [`${k}19`]: R[t].tax });
    for (const [r, fn] of Object.entries(f)) if (!omit.includes(+r)) c[`${k}${r}`] = fn(k, t);
  });
  return c;
}
const FORMATS = { B9: P, B10: P, B11: MON, ...Object.fromEntries(['C', ...COLS].flatMap((k) => [14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((r) => [`${k}${r}`, MON]))) };
const WIDTHS = { A: 42, B: 9, C: 11, D: 11, E: 11, F: 11, G: 11, H: 11 };
const FIXED = ['C14', 'C17', 'C18', 'C19', 'C21', 'C22', 'C23', 'C25', 'C26', 'C27', 'C28', 'B11', 'D19', 'E19', 'F19', 'G19', 'H19', 'C16'];

export const widgets = {
  'wc-sheet': {
    type: 'sheet', title: 'Lantern’s working capital schedule (fictional case; days are Ana’s assumptions)',
    sheet: { cells: wcCells() }, view: 'A1:H30', maxHeight: '32rem', widths: WIDTHS, formats: FORMATS, editable: 'B4:B11', mark: ['D29:H30'],
    tools: ['formulas', 'reset'],
    note: 'The flows in rows 14–19 come from the model; change the days and shares in B4:B11. Row 30 is the cash effect: positive means cash is tied up.',
  },
};

export const guided = [
  {
    id: 'f07-wc-g1', type: 'formula', kind: 'applied',
    prompt: 'Receivables are invoiced revenue (row 14) at the days in B4, plus Cold Brew revenue (row 15) at the days in B5, each over 365. In D21, write the 2028 receivables so that the formula fills right to H21.',
    sheet: { cells: wcCells({ omit: [21, 29, 30] }), fixed: FIXED }, cell: 'D21', fill: 'D21:H21', view: 'A1:H21', widths: WIDTHS, formats: FORMATS,
    answer: '=D14*$B$4/365+D15*$B$5/365',
    alt: ['=(D14*$B$4+D15*$B$5)/365', '=D14/365*$B$4+D15/365*$B$5', '=$B$4*D14/365+$B$5*D15/365'],
    wrong: [
      { formula: '=D18*$B$4/365', say: 'That measures receivables against total revenue, but café and online sales are paid at once. Use invoiced revenue (row 14), and Cold Brew separately at its own days.' },
      { formula: '=D14*$B$4/365', say: 'That leaves out Cold Brew: grocers pay in 60 days (B5) on row 15.' },
      { formula: '=D14*B4/365+D15*B5/365', say: 'Filled right, B4 and B5 move to C4, D4 …, which are empty. Anchor the assumptions: $B$4 and $B$5.' },
    ],
    hints: ['Balance = flow × days ÷ 365, for each kind of customer.', 'Invoiced customers: D14 × $B$4 ÷ 365; grocers: D15 × $B$5 ÷ 365; add them.'],
    solution: `<x>=D14*$B$4/365+D15*$B$5/365</x>: ${Math.round(invoiced[0]).toLocaleString('en-US')} × 25 ÷ 365 + ${Math.round(F.coldBrew[0]).toLocaleString('en-US')} × 60 ÷ 365 = ${Math.round(R[0].receivables).toLocaleString('en-US')} for 2028.`,
  },
  {
    id: 'f07-wc-g2', type: 'num', kind: 'numerical',
    prompt: `Lantern’s cost of goods sold is forecast at $${Math.round(F.costOfGoods[1]).toLocaleString('en-US')} for 2029. At 21 days of inventory, what is inventory at 31 December 2029?`,
    answer: Math.round(R[1].inventory), check: () => F.costOfGoods[1] * 21 / 365, unit: '$', places: 0, tol: 1,
    wrong: [{ value: F.revenue[1] * 21 / 365, say: 'Inventory is measured against cost of goods, not revenue: stock is carried at cost.' }],
    hints: ['Balance = cost of goods × days ÷ 365.'],
    solution: `${Math.round(F.costOfGoods[1]).toLocaleString('en-US')} × 21 ÷ 365 = ${Math.round(R[1].inventory).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-wc-g3', type: 'steps', kind: 'numerical',
    prompt: 'A shop’s working capital at the end of last year: receivables $40,000, inventory $25,000, payables $18,000. This year: receivables $52,000, inventory $27,000, payables $24,000.',
    steps: [
      { id: 'f07-wc-g3a', type: 'num', kind: 'numerical', prompt: 'Operating working capital last year ($).', answer: 47000, check: () => 40000 + 25000 - 18000, unit: '$', places: 0, tol: 1, hints: ['Assets minus liabilities.'] },
      { id: 'f07-wc-g3b', type: 'num', kind: 'numerical', prompt: 'Operating working capital this year ($).', answer: 55000, check: () => 52000 + 27000 - 24000, unit: '$', places: 0, tol: 1, hints: ['Same again with this year’s balances.'] },
      { id: 'f07-wc-g3c', type: 'num', kind: 'numerical', prompt: 'Cash effect of the change: enter cash used as a negative number ($).', answer: -8000, check: () => -((52000 + 27000 - 24000) - (40000 + 25000 - 18000)), unit: '$', places: 0, tol: 1,
        hints: ['Working capital rose: is that cash in or out?'], wrong: [{ value: 8000, say: 'Working capital rose by $8,000, so $8,000 of cash went into it: a use of cash, negative.' }] },
    ],
    solution: 'Last year 40,000 + 25,000 − 18,000 = 47,000; this year 52,000 + 27,000 − 24,000 = 55,000. Working capital rose 8,000, using 8,000 of cash: the extra receivables and stock outweigh the extra credit from suppliers.',
  },
  {
    id: 'f07-wc-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s cafés and online shop are paid by card on the day. What should the model measure its receivables days against?',
    options: ['Invoiced revenue only, with Cold Brew at its own days', 'Total revenue, including cafés and online sales paid by card', 'Cost of goods sold, because it is the cost of what was sold', 'Cash collected during the year from all customers combined'],
    answer: 0,
    feedback: { 1: 'Card sales create no receivables; including them dilutes the days and misforecasts the balance when the mix shifts.', 2: 'Cost of goods drives inventory and payables, not what customers owe.', 3: 'Receivables come from sales not yet collected; collections are the other side of the same flow.' },
    hints: ['Which sales leave a customer owing Lantern money at the year end?'],
    solution: 'Only invoiced sales leave receivables. Measure days against them, and give Cold Brew its own 60 days.',
  },
];

export const independent = [
  {
    id: 'f07-wc-i1', type: 'formula', kind: 'applied',
    prompt: 'Payables are cost of goods (row 16) at the days in B7, over 365. In D25, write the 2028 payables so that it fills right to H25.',
    sheet: { cells: wcCells({ omit: [25, 29, 30] }), fixed: FIXED }, cell: 'D25', fill: 'D25:H25', view: 'A1:H25', widths: WIDTHS, formats: FORMATS,
    answer: '=D16*$B$7/365',
    alt: ['=$B$7*D16/365', '=D16/365*$B$7'],
    wrong: [{ formula: '=D18*$B$7/365', say: 'Suppliers are paid for goods, at cost: measure payables against cost of goods (row 16), not revenue.' }, { formula: '=D16*B7/365', say: 'Anchor the days: $B$7, or the formula loses them when filled right.' }],
    solution: `<x>=D16*$B$7/365</x>: ${Math.round(F.costOfGoods[0]).toLocaleString('en-US')} × 21 ÷ 365 = ${Math.round(R[0].payables).toLocaleString('en-US')} for 2028.`,
  },
  {
    id: 'f07-wc-i2', type: 'num', kind: 'numerical',
    prompt: 'An oven costing $24,000 with a five-year life and no residual value comes into use on 1 September. Using straight-line depreciation by month, what is its depreciation in its first calendar year?',
    answer: 1600, check: () => 24000 / 60 * 4, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 4800, say: 'That is a full year. From 1 September only four months fall in the year.' }, { value: 2000, say: 'September to December is four months, not five.' }],
    solution: '24,000 ÷ 60 months = 400 a month; September to December = 4 months; 1,600 dollars.',
  },
  {
    id: 'f07-wc-i3', type: 'num', kind: 'numerical',
    prompt: `Lantern’s net property and equipment is $${Math.round(R[0].ppeNet).toLocaleString('en-US')} at the end of 2028. In 2029 it spends $25,000 and depreciation is $${Math.round(M.dep[1]).toLocaleString('en-US')}. What is net property and equipment at the end of 2029?`,
    answer: Math.round(R[1].ppeNet), check: () => R[0].ppeNet + 25000 - M.dep[1], unit: '$', places: 0, tol: 1,
    solution: `${Math.round(R[0].ppeNet).toLocaleString('en-US')} + 25,000 − ${Math.round(M.dep[1]).toLocaleString('en-US')} = ${Math.round(R[1].ppeNet).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-wc-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Which of these belong in the operating working capital schedule?',
    items: ['Receivables', 'The line of credit', 'Inventory', 'Current portion of the term loan', 'Unearned revenue', 'Cash'],
    categories: ['Operating working capital', 'Financing (debt schedule or cash)'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: { 1: 'The line of credit is borrowing: it belongs in the debt schedule.', 3: 'Debt due within a year is still debt: financing.', 5: 'Cash is the result the model works out, not part of operating working capital.' },
    solution: 'Receivables, inventory and unearned revenue arise from operations. Cash, the line of credit and debt due within a year are financing.',
  },
  {
    id: 'f07-wc-i5', type: 'mc', kind: 'applied',
    prompt: 'A model forecasts capital spending of $5,000 a year for five years against depreciation of $40,000 a year, with steady margins. What should a reviewer conclude?',
    options: ['Replacements are probably missing; the assets are running down', 'Nothing: capital spending and depreciation are unrelated to each other', 'The business is unusually efficient, so its margins should rise over time', 'Depreciation must be overstated and should be cut to $5,000 a year'],
    answer: 0,
    feedback: { 1: 'Over time, capex roughly replaces what depreciation uses up; a large, lasting gap needs a reason.', 2: 'Spending little on assets usually means they wear out, not that the business is efficient.', 3: 'Depreciation follows the assets already owned; it cannot be cut to match a low budget.' },
    solution: 'Capex far below depreciation for years means assets wear out unreplaced. Either the plan needs replacements, or the margins will not last.',
  },
];

export const check = [
  {
    id: 'f07-wc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why can a profitable, fast-growing business run short of cash?',
    options: ['Growth ties up cash in receivables and inventory before customers pay', 'Profit is calculated after tax but cash is counted before tax is paid', 'Depreciation is a cash payment that profit leaves out of its calculation', 'Growing businesses always pay their suppliers in advance, never on credit'],
    answer: 0,
    feedback: { 1: 'Tax timing matters a little, but it is not why growth eats cash.', 2: 'Depreciation is not a cash payment; it is added back to profit to get cash flow.', 3: 'Most buy on credit; payables help, but usually less than receivables and stock grow.' },
    solution: 'Sales grow, so receivables and stock grow with them; that cash is paid out before it comes back.',
  },
  {
    id: 'f07-wc-k2', type: 'num', kind: 'numerical',
    prompt: 'A catering business invoices $438,000 a year and its customers take 30 days to pay. What receivables should the model forecast at the year end?',
    answer: 36000, check: () => 438000 * 30 / 365, unit: '$', places: 0, tol: 1,
    solution: '438,000 × 30 ÷ 365 = 36,000 dollars.',
  },
  {
    id: 'f07-wc-k3', type: 'num', kind: 'numerical',
    prompt: 'The second kitchen’s equipment cost $60,000 and is depreciated straight line over seven years from April 2028. What is its depreciation in 2029, a full year?',
    answer: 8571.43, check: () => 60000 / 7, unit: '$', places: 2, tol: 0.5,
    solution: '60,000 ÷ 7 = 8,571.43 dollars a year (60,000 ÷ 84 months × 12).',
  },
  {
    id: 'f07-wc-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s working capital falls by $15,219 in 2028, releasing cash, because the law firm pays a $30,840 contract asset. How should Coastline read it?',
    options: ['As real cash that will not recur in later years', 'As proof that Lantern now collects from its customers faster than before', 'As an error, because working capital always rises when sales grow', 'As a reason to forecast the same release of cash in every later year'],
    answer: 0,
    feedback: { 1: 'Receivables days are unchanged at 25; the release comes from one balance being collected.', 2: 'It can fall when a large balance is collected, as here.', 3: 'The contract asset is gone after 2028; there is nothing to release again.' },
    solution: 'The cash is real but will not recur. A lender looks at what operations generate in a normal year.',
  },
  {
    id: 'f07-wc-k5', type: 'num', kind: 'numerical',
    prompt: 'Net property and equipment is $95,400 at the start of the year. The business spends $105,000 and depreciation is $35,979. What is net property and equipment at the end of the year?',
    answer: 164421, check: () => 95400 + 105000 - 35979, unit: '$', places: 0, tol: 1,
    solution: '95,400 + 105,000 − 35,979 = 164,421 dollars.',
  },
  {
    id: 'f07-wc-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the rule.',
    text: 'An increase in receivables [[0]] cash; an increase in payables [[1]] cash; in the cash flow statement the change in operating working capital is [[2]] profit.',
    blanks: [{ options: ['uses', 'provides'], answer: 0 }, { options: ['uses', 'provides'], answer: 1 }, { options: ['subtracted from', 'added to'], answer: 0 }],
    solution: 'More receivables use cash; more payables provide it; a rise in working capital is subtracted from profit.',
  },
];
