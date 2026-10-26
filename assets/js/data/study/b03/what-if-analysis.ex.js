// what-if-analysis.ex.js — B03 · What-if analysis: widgets, practice and the knowledge check (answer keys live here).
// The costing model is built on QUOTE (case.js). Ana's direct costs (COSTS: barista wage, paid set-up hour, guests per
// barista, coffee per guest, platter cost, van cost) and the December plan (PLAN_CELLS: contributions, hours, limits)
// are fictional and introduced in this lesson; the lesson file imports them for its checks. Not SHOP_MODEL, SHOP_SHEET
// or STOCK_PLAN (the project). Every num item's `check` recomputes its answer.
import { QUOTE } from './case.js?v=18';

/** Ana's 2026 direct-cost estimates for one event day (fictional). */
export const COSTS = { wage: 23, setupHours: 1, guestsPerBarista: 40, cup: 0.8, platterCost: 70, van: 25 };
/** The two events the lesson follows (fictional enquiries). */
export const TEAM_DAY = { guests: 45, hours: 5, pastry: 0 };
export const BREAKFAST = { guests: 120, hours: 3, pastry: 1 };

/** The costing model as sheet cells: the event in B3:B5, the quote sheet in B7:B11, the costs in B13:B18 and the
 *  results in B20:B28 (left out with results: false, for exercises that build them). */
export function costingCells(ev = TEAM_DAY, { results = true } = {}) {
  const c = {
    A1: 'Catering event costing model', A2: 'The event',
    A3: 'Guests', B3: ev.guests, A4: 'Hours of service', B4: ev.hours, A5: 'Pastry platter (1 = yes, 0 = no)', B5: ev.pastry,
    A6: 'Quote sheet (Ana’s prices)',
    A7: 'Setup charge per event day', B7: QUOTE.setup, A8: 'Price per guest', B8: QUOTE.perGuest, A9: 'Charge per hour of service', B9: QUOTE.perHour,
    A10: 'Pastry platter price', B10: QUOTE.platter, A11: 'Minimum invoice', B11: QUOTE.minimum,
    A12: 'Direct costs (Ana’s estimates)',
    A13: 'Barista wage per hour', B13: COSTS.wage, A14: 'Paid set-up hours per barista', B14: COSTS.setupHours, A15: 'Guests per barista', B15: COSTS.guestsPerBarista,
    A16: 'Coffee, milk and cups per guest', B16: COSTS.cup, A17: 'Pastry platter cost', B17: COSTS.platterCost, A18: 'Van cost per event day', B18: COSTS.van,
  };
  if (results) Object.assign(c, {
    A19: 'Results',
    A20: 'Baristas', B20: '=ROUNDUP(B3/B15,0)',
    A21: 'Invoice', B21: '=MAX(B11,B7+B8*B3+B9*B4+B10*B5)',
    A22: 'Barista wages', B22: '=B20*(B4+B14)*B13',
    A23: 'Coffee, milk and cups', B23: '=B3*B16',
    A24: 'Pastry platter', B24: '=B5*B17',
    A25: 'Van', B25: '=B18',
    A26: 'Direct costs', B26: '=SUM(B22:B25)',
    A27: 'Contribution', B27: '=B21-B26',
    A28: 'Contribution margin ratio', B28: '=B27/B21',
  });
  return c;
}
const M = '$#,##0.00';
export const COSTING_FORMATS = { B7: M, B8: M, B9: M, B10: M, B11: M, B13: M, B16: M, B17: M, B18: M, B21: M, B22: M, B23: M, B24: M, B25: M, B26: M, B27: M, B28: '0.0%' };

/** Ana's December plan (fictional): events E in B4, workshops W in C4. Starts from her first guess of 10 and 2. */
export const PLAN_CELLS = {
  A1: 'Ana’s December plan', B3: 'Catering events', C3: 'Workshops',
  A4: 'Number to run', B4: 10, C4: 2,
  A5: 'Contribution each', B5: 350, C5: 950,
  A6: 'Total contribution', B6: '=SUMPRODUCT(B4:C4,B5:C5)',
  A8: 'Resource', B8: 'Per event', C8: 'Per workshop', D8: 'Used', E8: 'Available',
  A9: 'Ana’s hours', B9: 4, C9: 16, D9: '=SUMPRODUCT($B$4:$C$4,B9:C9)', E9: 90,
  A10: 'Van hours', B10: 3, C10: 3, D10: '=SUMPRODUCT($B$4:$C$4,B10:C10)', E10: 45,
  A12: 'Limits', A13: 'Most events (December enquiries)', B13: 15, A14: 'Most workshops (free Saturdays)', B14: 3, A15: 'Events already confirmed', B15: 8,
};
export const PLAN_SOLVER = {
  objective: 'B6', sense: 'max', changing: ['B4:C4'], integer: ['B4:C4'], nonNegative: true,
  constraints: [
    { cell: 'D9', op: '<=', rhs: 'E9', label: 'Ana’s hours' },
    { cell: 'D10', op: '<=', rhs: 'E10', label: 'van hours' },
    { cell: 'B4', op: '<=', rhs: 'B13', label: 'December enquiries' },
    { cell: 'C4', op: '<=', rhs: 'B14', label: 'free Saturdays' },
    { cell: 'B4', op: '>=', rhs: 'B15', label: 'events already confirmed' },
  ],
};
const PLAN_FORMATS = { B5: '$#,##0', C5: '$#,##0', B6: '$#,##0.00' };
const without = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

// the costing model in plain arithmetic, for the num items' checks
const cost = (g, h, p, c = COSTS) => Math.ceil(g / c.guestsPerBarista) * (h + c.setupHours) * c.wage + g * c.cup + p * c.platterCost + c.van;
const invoice = (g, h, p, q = QUOTE) => Math.max(q.minimum, q.setup + q.perGuest * g + q.perHour * h + q.platter * p);
const contribution = (g, h, p) => invoice(g, h, p) - cost(g, h, p);
// the December plan by brute force (E from 0 to 15, W from 0 to 3)
const bestPlan = ({ hours = 90, van = 45, maxE = 15, maxW = 3, minE = 8 } = {}) => {
  let best = null;
  for (let E = 0; E <= maxE; E++) for (let W = 0; W <= maxW; W++) {
    if (4 * E + 16 * W <= hours && 3 * E + 3 * W <= van && E >= minE) { const z = 350 * E + 950 * W; if (!best || z > best.z) best = { E, W, z }; }
  }
  return best;
};

export const widgets = {
  'wi-costing': {
    type: 'sheet', title: 'Catering event costing model (Ana’s costs are fictional)',
    sheet: { cells: costingCells(TEAM_DAY) }, view: 'A1:B28', maxHeight: '30rem', widths: { A: 34, B: 13 },
    formats: COSTING_FORMATS, editable: 'B3:B18', mark: ['B27:B28'],
    tools: ['formulas', 'goalseek', 'datatable', 'reset'],
    goalseek: { target: 'B28', goal: 0.45, changing: 'B8' },
    datatable: { target: 'B27', input: 'B3', values: [40, 60, 80, 100, 120, 140, 160], input2: 'B4', values2: [2, 3, 4, 5, 6], format: M },
    note: 'The sheet starts with the team day: 45 guests, five hours, no pastries. Run Goal Seek as set (B28 to 0.45 by changing B8) and compare its price with the simple example. Make the data table as set: guests down the side, hours across the top (B3 is the Column input cell, B4 the Row input cell). Then change B3:B5 to the breakfast (120, 3, 1), or set the guests to 40 and then 41 and watch the contribution fall.',
  },
  'wi-plan': {
    type: 'sheet', title: 'Ana’s December plan (fictional)',
    sheet: { cells: PLAN_CELLS }, view: 'A1:E15', widths: { A: 32, B: 15, C: 13 }, formats: PLAN_FORMATS, editable: true, mark: ['B4:C4', 'B6'],
    tools: ['formulas', 'solver', 'reset'], solver: PLAN_SOLVER,
    note: 'B4:C4 hold Ana’s first guess (10 events, 2 workshops). Solve with every constraint and read the Answer report under the result: which constraints are binding and how much slack the others have. Then untick the integer constraint and solve again. Untick the van-hours constraint, then Ana’s hours: which plan wins each time? Change E9 to 91 (with integers off) to see a shadow price, or B15 to 16 to make the model infeasible. Untick Ana’s hours, the van and the enquiries together to see an unbounded model.',
  },
};

export const guided = [
  {
    id: 'b03-wi-g1', type: 'formula', kind: 'applied',
    prompt: 'Ana sends one barista for every 40 guests or part of 40; the 40 is in B15. In B20, write the formula for the number of baristas the event in B3 needs.',
    sheet: { cells: costingCells(TEAM_DAY, { results: false }) }, cell: 'B20', view: 'A1:B20', widths: { A: 34, B: 13 }, formats: COSTING_FORMATS,
    answer: '=ROUNDUP(B3/B15,0)',
    alt: ['=CEILING(B3/B15,1)', '=CEILING.MATH(B3/B15)', '=-INT(-B3/B15)'],
    wrong: [
      { formula: '=B3/B15', say: 'That gives 1.125 baristas. People come whole: round the result up with ROUNDUP(…,0).' },
      { formula: '=ROUND(B3/B15,0)', say: 'ROUND goes to the nearest whole number, so 45 guests would get one barista. “Or part of 40” means always rounding up: ROUNDUP.' },
      { formula: '=ROUNDUP(B3/40,0)', say: 'Right for this sheet, but the 40 is typed into the formula. Refer to B15, so that a change to the staffing rule reaches every result.' },
    ],
    hints: ['How many groups of 40 are there in 45 guests, if a part-group counts as a whole group?', 'Divide B3 by B15, then round up to 0 decimal places: ROUNDUP(number, 0).'],
    solution: '<x>=ROUNDUP(B3/B15,0)</x> gives 2 for 45 guests: 45 ÷ 40 = 1.125, rounded up. ROUND would give 1 and leave five guests without a barista; typing 40 instead of B15 would hide the staffing rule from anyone who changes it. <x>=CEILING(B3/B15,1)</x> also works.',
  },
  {
    id: 'b03-wi-g2', type: 'formula', kind: 'applied',
    prompt: 'Ana is quoting two January events (fictional): a 120-guest breakfast with pastries and a 20-guest meeting without. In B12, write the invoice formula for the event in column B, using the quote sheet in B2:B6, so that it gives the right invoice for column C when filled right to C12. The minimum invoice applies when the quote comes to less.',
    sheet: { cells: {
      A1: 'Quote sheet', A2: 'Setup charge per event day', B2: QUOTE.setup, A3: 'Price per guest', B3: QUOTE.perGuest, A4: 'Charge per hour of service', B4: QUOTE.perHour,
      A5: 'Pastry platter price', B5: QUOTE.platter, A6: 'Minimum invoice', B6: QUOTE.minimum,
      B8: 'Breakfast', C8: 'Meeting', A9: 'Guests', B9: 120, C9: 20, A10: 'Hours of service', B10: 3, C10: 2, A11: 'Pastry platter (1 = yes)', B11: 1, C11: 0, A12: 'Invoice',
    } },
    cell: 'B12', fill: 'B12:C12', view: 'A1:C12', widths: { A: 30, B: 12, C: 12 }, formats: { B2: M, B3: M, B4: M, B5: M, B6: M, B12: M, C12: M },
    answer: '=MAX($B$6,$B$2+$B$3*B9+$B$4*B10+$B$5*B11)',
    alt: ['=MAX($B$2+$B$3*B9+$B$4*B10+$B$5*B11,$B$6)', '=MAX($B$6,$B$2+$B$3*B$9+$B$4*B$10+$B$5*B$11)'],
    wrong: [
      { formula: '=$B$2+$B$3*B9+$B$4*B10+$B$5*B11', say: 'Right for the breakfast, but the meeting comes to $250 and Ana never invoices less than $300. Take the larger of the minimum and the quote: MAX.' },
      { formula: '=MAX(B6,B2+B3*B9+B4*B10+B5*B11)', say: 'Filled right, every quote-sheet reference moves to column C, which is empty. Anchor them with $ ($B$2 and so on) and leave the event’s cells relative.' },
      { formula: '=MIN($B$6,$B$2+$B$3*B9+$B$4*B10+$B$5*B11)', say: 'MIN caps every invoice at $300. A minimum invoice is a floor, so take the larger of the two: MAX.' },
    ],
    hints: ['The quote is setup + price per guest × guests + hourly charge × hours + platter price × (1 or 0). Which references must stay on column B when the formula moves to column C?', 'Wrap the quote in MAX with the minimum: =MAX($B$6, $B$2 + $B$3*B9 + …).'],
    solution: '<x>=MAX($B$6,$B$2+$B$3*B9+$B$4*B10+$B$5*B11)</x>. The breakfast comes to 60 + 6.50 × 120 + 30 × 3 + 120 = $1,050; the meeting to 60 + 6.50 × 20 + 30 × 2 = $250, so the $300 minimum applies. The quote-sheet cells are absolute, because both events use them; the event’s cells are relative, so they move to column C.',
  },
  {
    id: 'b03-wi-g3', type: 'steps', kind: 'numerical',
    prompt: 'An enquiry for a one-day conference: 60 guests, six hours of service, no pastries. At the standard price per guest its contribution margin ratio is 37.3%, below Ana’s rule of at least 45% on every job, so she will run Goal Seek on the price per guest. Work out by hand what Goal Seek should return, using her costs: $23 an hour plus one paid set-up hour per barista, one barista per 40 guests, $0.80 a guest for coffee, milk and cups, and $25 for the van.',
    solution: 'Two baristas (60 ÷ 40 = 1.5, rounded up) are paid for 7 hours each: 2 × 7 × 23 = $322; with coffee 60 × 0.80 = $48 and the van $25, the direct costs are $395. A 45% ratio leaves 55% of the invoice for costs, so the invoice must be 395 ÷ 0.55 = $718.18. Take off the setup charge ($60) and the hourly charges (6 × $30 = $180) and divide by the guests: (718.18 − 240) ÷ 60 = $7.97 a guest. Goal Seek (B28 to 0.45 by changing B8) returns 7.9697…',
    steps: [
      { id: 'b03-wi-g3-s1', type: 'num', prompt: 'What are the event’s direct costs?', answer: 395, check: () => cost(60, 6, 0), unit: '$', places: 2, tol: 0.5,
        hints: ['Baristas: 60 ÷ 40 rounded up. Each is paid for the six hours of service and one set-up hour.', 'Wages 2 × (6 + 1) × 23, plus 60 × 0.80, plus 25.'],
        wrong: [{ value: 349, say: 'You left out the paid set-up hour: each barista is paid for 6 + 1 = 7 hours.' }, { value: 234, say: 'That is one barista. 60 guests need two: 60 ÷ 40 = 1.5, rounded up.' }] },
      { id: 'b03-wi-g3-s2', type: 'num', prompt: 'What invoice would give a contribution margin ratio of exactly 45%? Give it to the cent.', answer: 718.18, check: () => cost(60, 6, 0) / (1 - 0.45), unit: '$', places: 2, tol: 0.01,
        hints: ['If contribution is 45% of the invoice, the costs are the other 55%.', 'Invoice = direct costs ÷ (1 − 0.45).'],
        wrong: [{ value: 572.75, say: 'That adds 45% to the costs (a markup). The ratio is measured on the invoice: costs are 55% of it, so divide by 0.55.' }, { value: 877.78, say: 'That divides by 0.45: it would make the costs 45% of the invoice. Divide by 1 − 0.45.' }] },
      { id: 'b03-wi-g3-s3', type: 'num', prompt: 'What price per guest gives that invoice? Give it to the cent.', answer: 7.97, check: () => (cost(60, 6, 0) / 0.55 - QUOTE.setup - 6 * QUOTE.perHour) / 60, unit: '$', places: 2, tol: 0.005,
        hints: ['The invoice is 60 + price × 60 + 30 × 6. Solve for the price.', '(718.18 − 60 − 180) ÷ 60.'],
        wrong: [{ value: 11.97, say: 'That divides the whole invoice by the guests. Take off the setup charge and the hourly charges first: they don’t depend on the price per guest.' }, { value: 10.97, say: 'You took off the setup charge but not the six hours at $30.' }] },
    ],
  },
  {
    id: 'b03-wi-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Ana’s December plan is an optimisation model. Classify each part of it.',
    items: [
      'The number of workshops to run in December',
      'Total contribution from the month’s jobs',
      'Van hours used must not exceed 45',
      'The $950 contribution of one workshop',
      'At least 8 events, because 8 are already confirmed',
      'The number of catering events to accept',
    ],
    categories: ['Decision variable', 'Objective', 'Constraint', 'Fixed input (a coefficient or a limit)'],
    answer: [0, 1, 2, 3, 2, 0],
    feedback: {
      2: 'A limit that every plan must respect is a constraint. The 45 on its own is a fixed input; “used ≤ 45” is the constraint.',
      3: 'Solver doesn’t choose the $950: it is an estimate Ana supplies. It multiplies a decision variable in the objective.',
      4: 'Commitments are constraints too, written with ≥.',
    },
    hints: ['Ask of each one: does Solver choose it, maximise it, respect it, or is it a number Ana supplies?', 'The two numbers of jobs are chosen; the total contribution is maximised; anything with “must not exceed” or “at least” is a constraint.'],
    solution: 'Decision variables: the numbers of events and of workshops (Solver changes B4:C4). Objective: total contribution (B6, to maximise). Constraints: van hours ≤ 45 and events ≥ 8, along with Ana’s hours, the enquiries and the free Saturdays. Fixed inputs: the $950 and $350 contributions and the hours per job, which are the coefficients, and the limits themselves.',
  },
];

export const independent = [
  {
    id: 'b03-wi-i1', type: 'formula', kind: 'applied',
    prompt: 'Ana wants a grid of invoices before pricing a run of three-hour events without pastries: guests down column A, possible prices per guest across row 4. Write one formula in B5 that can be filled across and down to F10. The setup charge, hourly charge and hours are in B1:B3. (Every invoice here is above the minimum, so leave MAX out.)',
    sheet: { cells: {
      A1: 'Setup charge per event day', B1: QUOTE.setup, A2: 'Charge per hour of service', B2: QUOTE.perHour, A3: 'Hours of service', B3: 3,
      A4: 'Guests ↓   price per guest →', B4: 6, C4: 6.5, D4: 7, E4: 7.5, F4: 8,
      A5: 40, A6: 60, A7: 80, A8: 100, A9: 120, A10: 140,
    } },
    cell: 'B5', fill: 'B5:F10', view: 'A1:F10', widths: { A: 26 }, formats: { B1: M, B2: M, B3: 'general', B4: M, C4: M, D4: M, E4: M, F4: M, B: '$#,##0.00', C: '$#,##0.00', D: '$#,##0.00', E: '$#,##0.00', F: '$#,##0.00' },
    answer: '=$B$1+$B$2*$B$3+$A5*B$4',
    alt: ['=$A5*B$4+$B$1+$B$2*$B$3', '=$B$1+$B$3*$B$2+B$4*$A5'],
    wrong: [
      { formula: '=$B$1+$B$2*$B$3+A5*B4', say: 'Filled right, A5 becomes B5 (an invoice, not a guest count); filled down, B4 becomes B5. Fix the column of the guests ($A5) and the row of the prices (B$4).' },
      { formula: '=B1+B2*B3+$A5*B$4', say: 'The guests and prices are right, but the setup charge, hourly charge and hours move as you fill. Make B1, B2 and B3 absolute.' },
      { formula: '=$B$1+$B$2*$B$3+A$5*$B4', say: 'The anchors are the wrong way round: that keeps row 5 of the guests and column B of the prices. The guests run down column A ($A5); the prices run along row 4 (B$4).' },
    ],
    solution: '<x>=$B$1+$B$2*$B$3+$A5*B$4</x>. $A5 keeps column A (the guests) as the formula moves right but lets the row change; B$4 keeps row 4 (the prices) as it moves down. B5 = 60 + 30 × 3 + 40 × 6 = $390; F10 = 60 + 90 + 140 × 8 = $1,270. This is the layout a two-variable data table fills for you when the model is more than one formula.',
  },
  {
    id: 'b03-wi-i2', type: 'formula', kind: 'applied',
    prompt: 'Ana’s plan sheet has her first guess in B4:C4 (10 events, 2 workshops) and each job’s use of her hours and of the van in rows 9 and 10. In D9, write the formula for the hours this plan uses, so that filling it down to D10 gives the van hours used.',
    sheet: { cells: without(PLAN_CELLS, ['D9', 'D10', 'A12', 'A13', 'B13', 'A14', 'B14', 'A15', 'B15']) },
    cell: 'D9', fill: 'D9:D10', view: 'A1:E10', widths: { A: 22, B: 15, C: 13 }, formats: PLAN_FORMATS,
    answer: '=SUMPRODUCT($B$4:$C$4,B9:C9)',
    alt: ['=$B$4*B9+$C$4*C9', '=SUMPRODUCT(B$4:C$4,B9:C9)'],
    wrong: [
      { formula: '=SUMPRODUCT(B4:C4,B9:C9)', say: 'D9 is right, but filled down the plan moves to row 5 (the contributions). Anchor the plan: $B$4:$C$4.' },
      { formula: '=B4*B9+C4*C9', say: 'Right in D9 only: filled down, B4 and C4 become B5 and C5. Anchor the plan’s cells with $.' },
      { formula: '=SUM(B9:C9)', say: 'That adds the hours per event and per workshop, 20, whatever the plan. Multiply each by the number of jobs: SUMPRODUCT.' },
    ],
    solution: '<x>=SUMPRODUCT($B$4:$C$4,B9:C9)</x> multiplies each job count by its hours and adds: 10 × 4 + 2 × 16 = 72 of Ana’s hours, and filled down, 10 × 3 + 2 × 3 = 36 van hours. The plan stays anchored; the resource row moves. Each constraint’s left-hand side in a Solver model is a formula like this, placed next to its limit.',
  },
  {
    id: 'b03-wi-i3', type: 'num', kind: 'numerical',
    prompt: 'Use the costing model (or the two-variable data table in the widget): what contribution does a 100-guest event with four hours of service and no pastries earn at Ana’s standard prices?',
    answer: 380, check: () => contribution(100, 4, 0), unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 495, say: 'That uses two baristas. 100 guests need three: 100 ÷ 40 = 2.5, rounded up.' },
      { value: 830, say: 'That is the invoice. Take off the direct costs: wages, coffee and the van.' },
      { value: 449, say: 'That leaves out the paid set-up hour: each barista is paid for 4 + 1 hours.' },
    ],
    solution: 'Invoice 60 + 6.50 × 100 + 30 × 4 = $830. Three baristas for 5 paid hours: 3 × 5 × 23 = $345; coffee 100 × 0.80 = $80; van $25. Direct costs $450; contribution $380. In the data table it is the 100-guest row, 4-hour column.',
  },
  {
    id: 'b03-wi-i4', type: 'num', kind: 'applied',
    prompt: 'Ana could free up 10 more hours in December, 100 in all. Change E9 in the plan widget and solve again with every constraint, whole numbers included. What is the best total contribution now?',
    answer: 7050, check: () => bestPlan({ hours: 100 }).z, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 7250, say: 'That adds 10 × $50, the shadow price of an hour in the model without integers. The $50 holds for only 6 more hours; after that the Saturday limit binds. Solve the model again.' },
      { value: 6450, say: 'That is the plan with 90 hours. Change E9 to 100 before you solve.' },
    ],
    solution: 'With 100 hours Solver runs 12 events and all 3 workshops: 12 × 350 + 3 × 950 = $7,050. Ana’s hours (12 × 4 + 3 × 16 = 96) are no longer used up; the van (45 of 45) and the Saturdays are binding. Ten more hours are worth $600 here, more than 10 × $50. The shadow price holds for only 6 more hours, so the fractional optimum rises just $300 (to $7,050), while the whole-number plan jumps from $6,450 to $7,050: with whole numbers, value comes in lumps.',
  },
  {
    id: 'b03-wi-i5', type: 'formula', kind: 'applied',
    prompt: 'Goal Seek gives one answer for one event. Ana would rather have a formula that always shows the price per guest needed for the target ratio in B29, so she can see it for any event. In B30, write that formula. (Assume the invoice needed is above the minimum.)',
    sheet: { cells: { ...costingCells(TEAM_DAY), A29: 'Target contribution margin ratio', B29: 0.45, A30: 'Price per guest for the target' } },
    cell: 'B30', view: 'A1:B30', maxHeight: '22rem', widths: { A: 34, B: 13 }, formats: { ...COSTING_FORMATS, B29: '0.0%', B30: M },
    answer: '=(B26/(1-B29)-B7-B9*B4-B10*B5)/B3',
    alt: ['=(B26/(1-B29)-(B7+B9*B4+B10*B5))/B3'],
    wrong: [
      { formula: '=(B26/B29-B7-B9*B4-B10*B5)/B3', say: 'Dividing by 0.45 makes the costs 45% of the invoice. If 45% is contribution, costs are the other 55%: divide by (1 − B29).' },
      { formula: '=(B26*(1+B29)-B7-B9*B4-B10*B5)/B3', say: 'That marks the costs up by 45%, which gives a ratio of 31% on the invoice (0.45 ÷ 1.45). Divide the costs by (1 − B29).' },
      { formula: '=B26/(1-B29)/B3', say: 'That divides the whole invoice by the guests, but part of the invoice is the setup and hourly charges. Take them off first.' },
    ],
    solution: '<x>=(B26/(1-B29)-B7-B9*B4-B10*B5)/B3</x>: the invoice needed is the direct costs ÷ (1 − ratio); take off the parts of the invoice that don’t depend on guests and divide by the guests. For the team day: (337 ÷ 0.55 − 60 − 150 − 0) ÷ 45 = $8.95, the price Goal Seek finds. A formula like this updates itself; Goal Seek’s answer is a typed value that doesn’t.',
  },
  {
    id: 'b03-wi-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps for building Ana’s two-variable data table in Excel (contribution by guests down the side and hours across the top) in order.',
    items: [
      'In the top-left corner of an empty block, enter a formula that refers to the output: =B27.',
      'Type the guest numbers down the column below it and the hours across the row to its right.',
      'Select the whole block, from the corner formula to the last empty result cell.',
      'On the Data tab choose What-If Analysis, then Data Table.',
      'Enter B4 (hours, across the top) as the Row input cell and B3 (guests, down the side) as the Column input cell, then select OK.',
    ],
    solution: 'The corner formula points at the output; the two lists of values go below and to the right of it; the whole block is selected; then Data Table. The top row’s values go into the Row input cell (hours, B4) and the left column’s into the Column input cell (guests, B3): mixing them up puts hours into the guests cell and gives a table of nonsense.',
  },
];

export const check = [
  {
    id: 'b03-wi-k1', type: 'formula', kind: 'applied',
    prompt: 'In B6 of Ana’s plan sheet, write the objective cell’s formula: the total contribution of the plan in B4:C4, using the contributions in B5:C5.',
    sheet: { cells: without(PLAN_CELLS, ['B6']) }, cell: 'B6', view: 'A1:E10', widths: { A: 22, B: 15, C: 13 }, formats: PLAN_FORMATS,
    answer: '=SUMPRODUCT(B4:C4,B5:C5)',
    alt: ['=B4*B5+C4*C5'],
    wrong: [
      { formula: '=SUM(B4:C5)', say: 'That adds the job counts to the contributions. Multiply each count by its contribution, then add.' },
      { formula: '=B4*B5+C4', say: 'The workshops are counted but not multiplied by their $950.' },
      { formula: '=SUMPRODUCT(B4:C5)', say: 'With a single range SUMPRODUCT just adds it up. Give it two ranges: the counts and the contributions.' },
    ],
    solution: '<x>=SUMPRODUCT(B4:C4,B5:C5)</x>: 10 × 350 + 2 × 950 = $5,400 for Ana’s first guess. Solver maximises this cell by changing B4:C4, so it must be a formula of the decision variables.',
  },
  {
    id: 'b03-wi-k2', type: 'mc', kind: 'conceptual',
    prompt: 'For a 20-guest meeting of two hours without pastries, Ana asks Goal Seek to set the invoice (B21) to $250 by changing the price per guest (B8). Goal Seek reports that it couldn’t find a solution. Why?',
    options: [
      'Below $9 a guest the $300 minimum applies, so no price makes the invoice $250.',
      'Goal Seek can only change cells that contain formulas, and B8 holds a typed value.',
      'Goal Seek needs at least two changing cells to solve an equation like this one.',
      'The invoice cell is formatted as currency, which Goal Seek is unable to read.',
    ],
    answer: 0,
    feedback: {
      1: 'It is the other way round: the Set cell must contain a formula and the By changing cell must hold a value. B8 is the right kind of cell.',
      2: 'Goal Seek changes exactly one cell. Solver handles several.',
      3: 'Number formats change how a value is shown, not the value Goal Seek works with.',
    },
    solution: 'The invoice is MAX(300, 60 + 20 × price + 60). At any price up to (300 − 120) ÷ 20 = $9 the quote is at most $300, so the invoice sits at $300; above $9 it rises. No price makes it $250, and near the starting $6.50 the output doesn’t move at all, so Goal Seek has nothing to work with. A model with a floor, a cap or a step can defeat it: check the target is reachable before you trust or blame the tool.',
  },
  {
    id: 'b03-wi-k3', type: 'num', kind: 'numerical',
    prompt: 'From the two-variable data table of contribution (guests down the side, hours across the top, no pastries, standard prices), what does a 140-guest event with five hours of service earn?',
    answer: 431, check: () => contribution(140, 5, 0), unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 569, say: 'That uses three baristas. 140 guests need four: 140 ÷ 40 = 3.5, rounded up.' },
      { value: 523, say: 'That pays each barista for 5 hours. Ana also pays one set-up hour each: 6 hours.' },
      { value: 1120, say: 'That is the invoice, before the direct costs.' },
    ],
    solution: 'Invoice 60 + 6.50 × 140 + 30 × 5 = $1,120. Four baristas × 6 paid hours × $23 = $552; coffee 140 × 0.80 = $112; van $25. Contribution 1,120 − 689 = $431. The same event at two hours earns $617: with four baristas each extra hour costs $92 and brings in $30.',
  },
  {
    id: 'b03-wi-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Ana’s whole-number plan is 13 events and 2 workshops. Select all the statements that are true.',
    options: [
      'The van-hours constraint is binding: the plan uses all 45 hours.',
      'Ana’s hours have 6 hours of slack.',
      'Excel’s Sensitivity Report would give a shadow price for the van hours in this whole-number model.',
      'Rounding Solver’s fractional answer (12.5 events, 2.5 workshops) to the nearest whole numbers would have given this plan.',
      'Without the integer constraint, one more of Ana’s hours would raise the best contribution by $50.',
      'Because the van is binding, Solver shows that Ana should buy a second van.',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'The Sensitivity Report is available only for models without integer constraints: whole-number plans change in lumps, not at a steady price.',
      3: 'Rounding to the nearest gives 13 and 3, which needs 100 of Ana’s 90 hours and 48 van hours: infeasible.',
      5: 'A binding constraint says where more capacity would help, not whether it is worth its cost. A second van is a separate decision with its own costs.',
    },
    solution: 'True: the van is used up (13 × 3 + 2 × 3 = 45); Ana uses 13 × 4 + 2 × 16 = 84 of 90 hours, 6 of slack; and in the model without integers, 91 hours raise the optimum from $6,750 to $6,800. False: no Sensitivity Report with integer constraints; rounding to 13 and 3 breaks two constraints; and Solver optimises the model it is given, it doesn’t weigh the cost of a second van.',
  },
  {
    id: 'b03-wi-k5', type: 'mc', kind: 'applied',
    prompt: 'Suppose 16 December events were already confirmed, so Ana sets B15 to 16 and solves again. What will Solver report?',
    options: [
      'That it could not find a feasible solution: no plan meets every constraint.',
      'That the objective cell’s values do not converge: contribution can grow without limit.',
      'The plan of 16 events and no workshops, which uses exactly the van’s 45 hours.',
      'The plan of 13 events and 2 workshops again, because the confirmed bookings don’t affect the optimum.',
    ],
    answer: 0,
    feedback: {
      1: 'That message means a constraint is missing and the objective can grow forever. Here there are too many constraints, not too few.',
      2: '16 events need 16 × 3 = 48 van hours, more than 45, and there are only 15 enquiries.',
      3: 'The confirmed bookings are a constraint (events ≥ 16), and 13 events breaks it.',
    },
    solution: 'Events ≥ 16 contradicts events ≤ 15 (the enquiries), and 16 events would need 48 van hours against 45. No plan satisfies every constraint, so Solver reports that it could not find a feasible solution. Infeasibility points to a promise that can’t be kept: Ana would have to hire a van or turn work away.',
  },
  {
    id: 'b03-wi-k6', type: 'classify', kind: 'applied',
    prompt: 'Which tool fits each of Ana’s questions best?',
    items: [
      'What price per guest gives the team day a 45% contribution margin ratio?',
      'How does the contribution change across every combination of 40–160 guests and 2–6 hours?',
      'What would the breakfast earn under base, best and worst 2027 costs, with the wage, coffee and van costs changing together?',
      'Which mix of events and workshops earns the most within her hours and the van’s?',
      'What would the contribution be at wages of $22, $23, … $28 an hour?',
    ],
    categories: ['Goal Seek', 'Data table', 'Scenario Manager', 'Solver'],
    answer: [0, 1, 2, 3, 1],
    feedback: {
      2: 'Three inputs change together, which a data table (at most two inputs) can’t do: save each set as a scenario.',
      3: 'Several inputs, an objective to maximise and limits: that is Solver’s job.',
      4: 'One input over a list of values: a one-variable data table.',
    },
    solution: 'Goal Seek finds one input for a target output. Data tables show an output for lists of one or two inputs. Scenario Manager stores sets of several inputs that change together. Solver chooses several inputs to maximise or minimise an output within constraints.',
  },
];
