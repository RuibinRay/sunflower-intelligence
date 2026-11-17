// revenue-and-cost-forecasts.ex.js — F07 · Revenue and cost forecasts: widgets, practice and the knowledge check
// (answer keys live here). The sheet rebuilds case.js's FORECAST with formulas (tests/f07.test.mjs checks they agree).
// Every num item's `check` recomputes its answer.
import { HISTORY, ASSUME as A, FORECAST as F } from './case.js?v=37';

const H7 = HISTORY[2027];
const COLS = ['D', 'E', 'F', 'G', 'H'];
const M = '$#,##0', P = '0.0%';
const prev = (t) => (t ? COLS[t - 1] : 'C');

/** The forecast to EBITDA as a worksheet: inputs in rows 3–11 and B13:B25, years in row 26, the model in rows 28–45. */
export function forecastCells({ upTo = 45, omit = [] } = {}) {
  const c = {
    A1: 'Lantern Coffee Co.: forecast to EBITDA ($, years ending 31 December)', A2: 'Inputs: by year (Ana’s estimates; kitchen and Cold Brew from F05)',
    A3: 'Café sales growth', A4: 'Online sales growth', A5: 'Catering growth', A6: 'Training workshops', A7: 'Training fee per participant',
    A8: 'Second kitchen revenue, calendarised', A9: 'Cold Brew cans', A10: 'Cold Brew promotion, listing, brand manager, launch', A11: 'Second kitchen fixed costs and rent, calendarised',
    A12: 'Inputs: shares and amounts',
    A13: 'Café cost of goods, share of café sales', B13: A.cafes.cogsShare,
    A14: 'Online cost of goods, share of online sales', B14: A.online.cogsShare,
    A15: 'Cost of services, share of catering and training', B15: A.servicesCostShare,
    A16: 'Second kitchen variable costs, share of its sales', B16: A.kitchen.variableShare,
    A17: 'Cold Brew net price per can', B17: A.coldBrew.netPrice,
    A18: 'Cold Brew cost per can', B18: A.coldBrew.costPerCan,
    A19: 'Fixed wages 2027, 12-month basis', B19: A.fixedWages2027,
    A20: 'Pay rise a year', B20: A.wageInflation,
    A21: 'Event wages, share of catering', B21: A.catering.eventWagesShare,
    A22: 'Café leases and first kitchen rent', B22: A.occupancy.cafeLeases + A.occupancy.kitchenRent,
    A23: 'Advertising, share of revenue', B23: A.advertisingShare,
    A24: 'Other operating costs, share of revenue', B24: A.otherShare,
    A25: 'Training participants per workshop', B25: A.training.participants,
    A26: 'Year', C26: 2027, A27: 'Line', C27: '2027A',
  };
  COLS.forEach((k, t) => {
    Object.assign(c, {
      [`${k}3`]: A.cafes.growth[t], [`${k}4`]: A.online.growth[t], [`${k}5`]: A.catering.growth[t], [`${k}6`]: A.training.workshops[t], [`${k}7`]: A.training.price[t],
      [`${k}8`]: F.kitchen[t], [`${k}9`]: A.coldBrew.cans[t], [`${k}10`]: F.coldBrewFixed[t], [`${k}11`]: F.kitchenFixed[t] + F.kitchenRent[t],
      [`${k}26`]: 2028 + t, [`${k}27`]: `${2028 + t}E`,
    });
  });
  const rows = {
    28: ['Cafés (12-month basis in 2027)', A.cafes.annualised2027, (k, t) => `=${prev(t)}28*(1+${k}$3)`],
    29: ['Online shop', H7.online, (k, t) => `=${prev(t)}29*(1+${k}$4)`],
    30: ['Catering', H7.catering, (k, t) => `=${prev(t)}30*(1+${k}$5)`],
    31: ['Training', H7.training, (k) => `=${k}$6*$B$25*${k}$7`],
    32: ['Second kitchen', null, (k) => `=${k}$8`],
    33: ['Cold Brew', null, (k) => `=${k}$9*$B$17`],
    34: ['Revenue', null, (k) => `=SUM(${k}28:${k}33)`],
    35: ['Cost of goods sold', null, (k) => `=${k}28*$B$13+${k}29*$B$14+${k}$9*$B$18`],
    36: ['Cost of services', null, (k) => `=(${k}30+${k}31)*$B$15+${k}32*$B$16`],
    37: ['Gross profit', null, (k) => `=${k}34-${k}35-${k}36`],
    38: ['Wages', null, (k) => `=$B$19*(1+$B$20)^(${k}$26-$C$26)+${k}30*$B$21`],
    39: ['Café leases and first kitchen rent', null, () => '=$B$22'],
    40: ['Second kitchen fixed costs and rent', null, (k) => `=${k}$11`],
    41: ['Cold Brew promotion and fixed costs', null, (k) => `=${k}$10`],
    42: ['Advertising', null, (k) => `=${k}34*$B$23`],
    43: ['Other operating costs', null, (k) => `=${k}34*$B$24`],
    44: ['EBITDA', null, (k) => `=${k}37-SUM(${k}38:${k}43)`],
    45: ['EBITDA margin', null, (k) => `=${k}44/${k}34`],
  };
  for (const [r, [label, hist, f]] of Object.entries(rows)) {
    if (+r > upTo) continue;
    c[`A${r}`] = label;
    if (hist != null) c[`C${r}`] = hist;
    if (!omit.includes(+r)) COLS.forEach((k, t) => { c[`${k}${r}`] = f(k, t); });
  }
  return c;
}
const FORMATS = {
  ...Object.fromEntries(COLS.flatMap((k) => [[`${k}3`, P], [`${k}4`, P], [`${k}5`, P], [`${k}7`, '$#,##0'], [`${k}8`, M], [`${k}9`, '#,##0'], [`${k}10`, M], [`${k}11`, M], [`${k}26`, '0'], [`${k}45`, P],
    ...[28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].map((r) => [`${k}${r}`, M])])),
  C26: '0', C28: M, C29: M, C30: M, C31: M,
  B13: P, B14: P, B15: P, B16: P, B17: '$0.0000', B18: '$0.00', B19: M, B20: P, B21: P, B22: M, B23: P, B24: P,
};
const WIDTHS = { A: 40, B: 10, C: 11, D: 11, E: 11, F: 11, G: 11, H: 11 };
const FIXED = ['B19', 'B22', 'E9', 'F9', 'D10', 'E10', 'F10', 'G10', 'H10', 'D11', 'E11', 'F11', 'G11', 'H11', 'C26', 'D26', 'E26', 'F26', 'G26', 'H26'];

export const widgets = {
  'rc-model': {
    type: 'sheet', title: 'Lantern’s forecast to EBITDA (fictional case; assumptions are Ana’s and F05’s)',
    sheet: { cells: forecastCells() }, view: 'A1:H45', maxHeight: '34rem', widths: WIDTHS, formats: FORMATS, editable: true, mark: ['D44:H45'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Inputs are rows 3–11 and B13:B25; rows 28–45 are formulas. Halve the online growth rates and see how much of the 2032 margin depends on them. Set D9 to 20,000 cans and D10 unchanged: Cold Brew’s launch year gets worse, because its fixed costs do not shrink with its sales.',
  },
};

const fixedW = (t) => A.fixedWages2027 * (1 + A.wageInflation) ** (t + 1);

export const guided = [
  {
    id: 'f07-rc-g1', type: 'formula', kind: 'applied',
    prompt: 'Training revenue is workshops × participants per workshop × fee. The workshops for each year are in row 6, the fee in row 7, and the participants per workshop (12, the same every year) in B25. In D31, write the 2028 formula so that it is right when filled right to H31.',
    sheet: { cells: forecastCells({ upTo: 31, omit: [31] }), fixed: FIXED }, cell: 'D31', fill: 'D31:H31', view: 'A1:H31', widths: WIDTHS, formats: FORMATS,
    answer: '=D$6*$B$25*D$7',
    alt: ['=D6*$B$25*D7', '=D$6*D$7*$B$25', '=$B$25*D$6*D$7', '=D6*D7*$B$25', '=D$7*D$6*$B$25'],
    wrong: [
      { formula: '=D$6*B25*D$7', say: 'B25 is relative: filled right it becomes C25, D25 … which are empty. Every year uses the same 12 participants: $B$25.' },
      { formula: '=D$6*12*D$7', say: 'The 12 participants are typed in. Refer to B25, so a change in class size reaches every year.' },
      { formula: '=C31*(1+D$4)', say: 'That grows last year’s training by the online growth rate. Training is forecast as price × volume from its own rows.' },
    ],
    hints: ['Which references move with the year, and which stay put?', 'Workshops (row 6) and fee (row 7) move with the year; the 12 in B25 does not: =D$6*$B$25*D$7.'],
    solution: '<x>=D$6*$B$25*D$7</x>: 30 × 12 × 130 = 46,800 in 2028; filled right, 36 × 12 × 150 = 64,800 in 2032.',
  },
  {
    id: 'f07-rc-g2', type: 'steps', kind: 'numerical',
    prompt: 'The second kitchen’s project years run April to March from 1 April 2028. F05 forecast its revenue as $150,000 in project year 1, $185,000 in year 2 and $205,000 in year 3. Calendarise it.',
    steps: [
      { id: 'f07-rc-g2a', type: 'num', kind: 'numerical', prompt: 'How many months of project year 1 fall in calendar 2028?', answer: 9, check: () => 13 - 4, unit: 'months', places: 0, tol: 0, hints: ['April to December.'] },
      { id: 'f07-rc-g2b', type: 'num', kind: 'numerical', prompt: 'Kitchen revenue in calendar 2029 ($).', answer: 176250, check: () => 150000 * 3 / 12 + 185000 * 9 / 12, unit: '$', places: 0, tol: 1,
        hints: ['January–March 2029 belong to project year 1; April–December to project year 2.'], wrong: [{ value: 185000, say: 'That is project year 2 entire. Calendar 2029 starts with three months of project year 1.' }] },
      { id: 'f07-rc-g2c', type: 'num', kind: 'numerical', prompt: 'Kitchen revenue in calendar 2030 ($).', answer: 200000, check: () => 185000 * 3 / 12 + 205000 * 9 / 12, unit: '$', places: 0, tol: 1, hints: ['3 months of year 2 and 9 of year 3.'] },
    ],
    solution: '2028: 9 months of year 1. 2029: 3/12 × 150,000 + 9/12 × 185,000 = 37,500 + 138,750 = 176,250. 2030: 3/12 × 185,000 + 9/12 × 205,000 = 46,250 + 153,750 = 200,000.',
  },
  {
    id: 'f07-rc-g3', type: 'num', kind: 'numerical',
    prompt: 'In 2028 Lantern expects to sell 30,000 cans of Cold Brew at a net price of $2.1638 a can. Each can costs $0.74. Promotion is $30,000, the grocers’ listing fee $2,000, the brand manager $24,000 and the launch $6,000. What is Cold Brew’s contribution in 2028?',
    answer: -19286, check: () => 30000 * 2.1638 - 30000 * 0.74 - 30000 - 2000 - 24000 - 6000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 30000 * (2.1638 - 0.74), say: 'That is the gross profit on the cans. Contribution also takes off Cold Brew’s own fixed costs: promotion, listing, brand manager and launch.' }, { value: 19286, say: 'The size is right but the sign is not: the costs exceed the revenue.' }],
    hints: ['Revenue − cost of goods − its own fixed costs.', '64,914 − 22,200 − 62,000.'],
    solution: '30,000 × 2.1638 = 64,914; less 30,000 × 0.74 = 22,200; less 30,000 + 2,000 + 24,000 + 6,000 = 62,000: a contribution of −19,286 dollars in the launch year.',
  },
  {
    id: 'f07-rc-g4', type: 'classify', kind: 'conceptual',
    prompt: 'How should each of Lantern’s costs be forecast?',
    items: ['Café coffee, milk and food', 'Café lease payments', 'Ana’s salary', 'Card and platform fees', 'Rent and a supervisor for a third kitchen, needed once catering outgrows two', 'Cold Brew cans from the co-packer'],
    categories: ['Variable: a share of its revenue line', 'Fixed: an amount, rising with inflation or by contract', 'Step: a new block of fixed cost at a capacity limit', 'Percent of total revenue (small, mixed)'],
    answer: [0, 1, 1, 3, 2, 0],
    feedback: { 3: 'Fees move with sales in many small ways; a share of total revenue is a fair shortcut.', 4: 'Nothing changes until the second kitchen is full; then a whole new block of cost arrives.' },
    hints: ['Does the cost move with a particular revenue line, stay the same, or jump when a limit is reached?'],
    solution: 'Goods and cans are variable; leases and salaries are fixed; a new kitchen is a step cost; card fees are a small mixed cost forecast as a share of revenue.',
  },
];

export const independent = [
  {
    id: 'f07-rc-i1', type: 'formula', kind: 'applied',
    prompt: 'Cost of services is 39.6% (B15) of catering and training revenue (rows 30 and 31), plus the second kitchen’s variable costs at 42% (B16) of its sales (row 32). In D36, write the 2028 formula so that it fills right to H36.',
    sheet: { cells: forecastCells({ upTo: 36, omit: [36] }), fixed: FIXED }, cell: 'D36', fill: 'D36:H36', view: 'A1:H36', widths: WIDTHS, formats: FORMATS,
    answer: '=(D30+D31)*$B$15+D32*$B$16',
    alt: ['=D30*$B$15+D31*$B$15+D32*$B$16', '=$B$15*(D30+D31)+$B$16*D32', '=SUM(D30:D31)*$B$15+D32*$B$16'],
    wrong: [
      { formula: '=(D30+D31)*$B$15', say: 'That leaves out the kitchen’s variable costs (D32 × $B$16).' },
      { formula: '=(D30+D31+D32)*$B$15', say: 'The kitchen has its own variable share (42%), not catering’s 39.6%.' },
      { formula: '=(D30+D31)*B15+D32*B16', say: 'B15 and B16 must be anchored: filled right they would move to C15, D15 …' },
    ],
    solution: `<x>=(D30+D31)*$B$15+D32*$B$16</x>: (${Math.round(F.catering[0]).toLocaleString('en-US')} + ${F.training[0].toLocaleString('en-US')}) × 0.396 + ${F.kitchen[0].toLocaleString('en-US')} × 0.42 = ${Math.round(F.costOfServices[0]).toLocaleString('en-US')} in 2028.`,
  },
  {
    id: 'f07-rc-i2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s fixed wages were $179,800 in 2027 on a twelve-month basis. With pay rises of 3% a year, what are they in 2030?',
    answer: Math.round(fixedW(2) * 100) / 100, check: () => 179800 * 1.03 ** 3, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 179800 * 1.09, say: 'Adding 3% three times ignores compounding: each rise applies to the year before’s wages.' }, { value: 179800 * 1.03 ** 2, say: 'That is 2029: 2030 is three years after 2027.' }],
    solution: '179,800 × 1.03³ = 196,472 dollars.',
  },
  {
    id: 'f07-rc-i3', type: 'num', kind: 'numerical',
    prompt: 'Using Ana’s plan of 36 workshops of 12 participants at $150, what is training revenue in 2032?',
    answer: 64800, check: () => 36 * 12 * 150, unit: '$', places: 0, tol: 1,
    solution: '36 × 12 × 150 = 64,800 dollars.',
  },
  {
    id: 'f07-rc-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A model forecasts every operating cost, including rent and salaries, as a fixed percentage of revenue. What does that do to the forecast?',
    options: [
      'Margins stay flat whatever revenue does, hiding the operating leverage of fixed costs.',
      'Costs grow faster than revenue every year, so the margin shrinks steadily over the forecast.',
      'Nothing changes: a share of revenue and a fixed amount give the same answer every year.',
      'The model becomes circular, because the costs and the revenue then depend on each other.',
    ],
    answer: 0,
    feedback: { 1: 'Costs grow exactly as fast as revenue under percent-of-sales.', 2: 'They agree only in the base year.', 3: 'Percent-of-sales costs depend only on revenue; there is no loop.' },
    solution: 'Fixed costs do not scale with sales. Treating them as a share of revenue removes operating leverage from the model: margins look stable when they would really swing.',
  },
  {
    id: 'f07-rc-i5', type: 'num', kind: 'numerical',
    prompt: 'The model forecasts 2032 EBITDA of $153,477 on revenue of $1,178,447. What is the EBITDA margin, as a percentage?',
    answer: 13.02, check: () => F.ebitda[4] / F.revenue[4] * 100, unit: '%', places: 2, tol: 0.02,
    solution: '153,477 ÷ 1,178,447 = 13.02%, against 12.73% normalised in 2027.',
  },
];

export const check = [
  {
    id: 'f07-rc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does Ana forecast training revenue as workshops × participants × fee rather than as a growth rate on 2027?',
    options: [
      'She sets workshops and fees, so each can be tested: clearer than one rate.',
      'Because a growth rate for any revenue line cannot exceed 25% in a lender’s model.',
      'Because training revenue is not recorded separately in Lantern’s accounts for 2027.',
      'Because price times volume always gives a lower, and therefore more prudent, forecast.',
    ],
    answer: 0,
    feedback: { 1: 'Any rate is possible; the issue is whether it can be explained.', 2: 'Training revenue is in the accounts: $36,000 in 2027.', 3: 'It gives whatever the plan implies, higher or lower.' },
    solution: 'Separating volume and price shows what the forecast depends on (six more workshops, a $5 higher fee), which a lender can judge.',
  },
  {
    id: 'f07-rc-k2', type: 'num', kind: 'numerical',
    prompt: 'A project year runs April to March. A café chain opens a shop on 1 April with revenue of $400,000 in its first project year and $460,000 in its second. What is the shop’s revenue in its second calendar year?',
    answer: 445000, check: () => 400000 * 3 / 12 + 460000 * 9 / 12, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 460000, say: 'The second calendar year starts with three months of the first project year.' }],
    solution: '3/12 × 400,000 + 9/12 × 460,000 = 100,000 + 345,000 = 445,000 dollars.',
  },
  {
    id: 'f07-rc-k3', type: 'num', kind: 'numerical',
    prompt: 'In 2029 Lantern expects to sell 45,000 cans of Cold Brew at $2.1638 a can. What is Cold Brew revenue?',
    answer: 97371, check: () => 45000 * 2.1638, unit: '$', places: 0, tol: 1,
    solution: '45,000 × 2.1638 = 97,371 dollars.',
  },
  {
    id: 'f07-rc-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s forecast EBITDA margin falls from 12.7% (2027, normalised) to 2.7% in 2028, then rises to 13.0% by 2032. What is the best explanation to give Coastline?',
    options: [
      'A planned dip: Cold Brew’s launch loses money and fixed costs rise, then both new lines add margin.',
      'Revenue falls in 2028 because the cafés lose customers to the new Cold Brew cans in shops.',
      'Cost of goods rises sharply as a share of revenue in 2028 as ingredient prices go up.',
      'The model has an error in its 2028 column that should be found and fixed before sending.',
    ],
    answer: 0,
    feedback: { 1: 'Revenue rises 48% in 2028.', 2: 'Gross margin barely moves: 61.4% in 2028 against 61.2% in 2027.', 3: 'The dip has a clear cause in the assumptions; it is not an error.' },
    solution: 'Show the contributions: Cold Brew −$19,286 in 2028, the kitchen +$12,750, higher fixed wages and full-year leases; then the recovery as both new activities grow.',
  },
  {
    id: 'f07-rc-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Match each line to the forecasting method Lantern’s model uses for it.',
    items: ['Café sales', 'Training', 'Second kitchen revenue', 'Cold Brew revenue'],
    categories: ['Growth on a 12-month base', 'Price × volume (workshops)', 'Project forecast, calendarised', 'Cans × net price'],
    answer: [0, 1, 2, 3],
    solution: 'Cafés grow from their annualised base; training is workshops × participants × fee; the kitchen is F05’s project forecast calendarised; Cold Brew is cans × net price.',
  },
  {
    id: 'f07-rc-k6', type: 'mc', kind: 'applied',
    prompt: 'Suppose Ana’s first kitchen had been nearly full in 2027, and her forecast grows catering 5% a year for five years. What should a reviewer ask?',
    options: [
      'Whether it outgrows the kitchens, and where the step in costs is.',
      'Whether 5% is a round enough number to present to a credit committee without explanation.',
      'Whether catering should be forecast as a share of total revenue instead of on its own.',
      'Nothing: 5% is modest.',
    ],
    answer: 0,
    feedback: { 1: 'Precision is not the issue; capacity is.', 2: 'That would tie catering to the cafés and online shop, which have nothing to do with it.', 3: 'Modest growth can still exceed capacity.' },
    solution: 'Growth beyond capacity needs a step in costs. The reviewer checks that the second kitchen covers the catering growth assumed, or that the model adds the next step.',
  },
];
