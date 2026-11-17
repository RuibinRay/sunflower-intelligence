// modelling-principles.ex.js — F07 · Modelling principles: widgets, practice and the knowledge check (answer keys live
// here). Lantern's figures come from case.js (HISTORY, ASSUME); every num item's `check` recomputes its answer.
import { HISTORY, ASSUME } from './case.js?v=37';

const H = HISTORY[2027];
const G = ASSUME.online.growth, CG = ASSUME.cafes.growth;
const COLS = ['D', 'E', 'F', 'G', 'H'], YRS = ['2028E', '2029E', '2030E', '2031E', '2032E'];
const M = '$#,##0', P = '0.0%';

/** The extract of Lantern's model: inputs in rows 3–5, the timeline in row 7, forecasts in rows 8–10. */
export function modelCells({ online = true, cafes = true, total = true } = {}) {
  const c = {
    A1: 'Lantern Coffee Co.: model extract ($, years ending 31 December)', A2: 'Inputs (Ana’s estimates)',
    A3: 'Online sales growth', A4: 'Café sales 2027, 12-month basis', B4: ASSUME.cafes.annualised2027, A5: 'Café sales growth',
    A7: 'Line', C7: '2027A',
  };
  COLS.forEach((k, t) => { c[`${k}3`] = G[t]; c[`${k}5`] = CG[t]; c[`${k}7`] = YRS[t]; });
  if (cafes) { c.A8 = 'Café sales, 12-month basis'; c.C8 = '=B4'; COLS.forEach((k, t) => { c[`${k}8`] = `=${t ? COLS[t - 1] : 'C'}8*(1+${k}$5)`; }); }
  c.A9 = 'Online sales'; c.C9 = H.online;
  if (online) COLS.forEach((k, t) => { c[`${k}9`] = `=${t ? COLS[t - 1] : 'C'}9*(1+${k}$3)`; });
  if (total && cafes && online) { c.A10 = 'Café and online sales'; ['C', ...COLS].forEach((k) => { c[`${k}10`] = `=${k}8+${k}9`; }); }
  return c;
}
const FORMATS = { B4: M, C8: M, C9: M, C10: M, ...Object.fromEntries(COLS.flatMap((k) => [[`${k}3`, P], [`${k}5`, P], [`${k}8`, M], [`${k}9`, M], [`${k}10`, M], [`${k}12`, M]])) };
const WIDTHS = { A: 34, B: 11, C: 11, D: 11, E: 11, F: 11, G: 11, H: 11 };

const onlineYear = (t) => G.slice(0, t + 1).reduce((v, g) => v * (1 + g), H.online);

export const widgets = {
  'mp-model': {
    type: 'sheet', title: 'Lantern’s model: an extract (figures from the case; growth rates are Ana’s estimates)',
    sheet: { cells: modelCells() }, view: 'A1:H10', widths: WIDTHS, formats: FORMATS, editable: true, mark: ['D10:H10'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Shaded rows 3–5 are the inputs. Change E3 (2029’s online growth) and see 2029 onwards move while 2028 stays put. Show formulas: every forecast cell in a row has the same structure. Type 236000 in B4 (the ten-month figure) and watch every café year fall; Reset puts it back.',
  },
};

export const guided = [
  {
    id: 'f07-mp-g1', type: 'formula', kind: 'applied',
    prompt: 'Online sales were $187,500 in 2027 (C9). Ana’s growth assumptions for 2028–2032 are in D3:H3. In D9, write the 2028 forecast so that, filled right to H9, each year grows the year before by its own growth rate.',
    sheet: { cells: modelCells({ online: false, total: false }) }, cell: 'D9', fill: 'D9:H9', view: 'A1:H9', widths: WIDTHS, formats: FORMATS,
    answer: '=C9*(1+D$3)',
    alt: ['=C9*(1+D3)', '=C9+C9*D$3', '=C9+C9*D3', '=C9*(D$3+1)', '=(1+D$3)*C9'],
    wrong: [
      { formula: '=C9*1.12', say: 'Right for 2028, but the 12% is typed into the formula. Filled right, every year grows at 12% whatever row 3 says. Refer to the input: D$3.' },
      { formula: '=C9*(1+$D$3)', say: '$D$3 never moves, so filled right every year uses 2028’s 12%. The growth rate should move with the year: D$3 (or D3).' },
      { formula: '=$C$9*(1+D$3)', say: '$C$9 keeps growing 2027’s figure, so 2029 is 2027 × 1.10 instead of 2028 × 1.10. Last year must move with the formula: C9.' },
    ],
    hints: ['Last year’s sales are in the column to the left; this year’s growth rate is in row 3 of this column.', 'Last year × (1 + this year’s rate): =C9*(1+D$3). The $ before 3 keeps the row fixed if the formula is ever filled down.'],
    solution: `<x>=C9*(1+D$3)</x> gives ${H.online.toLocaleString('en-US')} × 1.12 = ${onlineYear(0).toLocaleString('en-US')} for 2028. Filled right, C9 becomes D9, E9 … (last year) and D$3 becomes E$3, F$3 … (this year’s rate), so 2029 is ${onlineYear(0).toLocaleString('en-US')} × 1.10 = ${onlineYear(1).toLocaleString('en-US')}.`,
  },
  {
    id: 'f07-mp-g2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s two cafés opened on 1 March 2027 and sold $236,000 in the ten months to 31 December. What would they sell in a full year at the same rate, the base Ana grows from?',
    answer: 283200, check: () => 236000 * 12 / 10, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 236000, say: 'That is ten months of sales. Growing it as if it were a year understates every forecast year.' },
      { value: 236000 * 10 / 12, say: 'That multiplies by 10 ÷ 12, shrinking the figure. Ten months is less than a year, so the full year is larger: × 12 ÷ 10.' },
      { value: 236000 * 1.04, say: 'That grows the ten-month figure by 2028’s 4%. Annualise first (× 12 ÷ 10), then grow.' },
    ],
    hints: ['$236,000 covers ten months. What is one month?', '236,000 ÷ 10 = 23,600 a month; × 12 for a year.'],
    solution: '236,000 × 12 ÷ 10 = 283,200 dollars a year. It assumes the missing January and February would have looked like the average of the ten months traded; a café with strong seasons would need a closer look.',
  },
  {
    id: 'f07-mp-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Sort each cell of Lantern’s model into input, calculation or output.',
    items: ['Online sales growth for 2029 (Ana’s estimate)', 'The 2027 actual cost of goods sold, from the F03 accounts', 'Online sales for 2030', 'The current ratio at 31 December 2029, on the summary for Coastline', 'Coastline’s interest rate on the term loan, from the term sheet', 'Interest on the term loan for 2029'],
    categories: ['Input', 'Calculation', 'Output'],
    answer: [0, 0, 1, 2, 0, 1],
    feedback: { 1: 'Historical figures are typed in (or linked from the accounts), not calculated by the model, so they are inputs.', 3: 'The covenant test is what Coastline reads: an output. It is calculated, but it belongs on the summary the decision-maker sees.', 5: 'Interest is worked out from the balance and the rate, so it is a calculation. The rate itself is the input.' },
    hints: ['Was the value typed in, worked out by a formula, or shown to the person deciding?', 'History and assumptions are both typed in. Results someone acts on are outputs.'],
    solution: 'Inputs: the growth rate, the 2027 actual and the loan’s rate (all typed in, each with its source). Calculations: 2030 online sales and 2029 interest. Output: the 2029 current ratio, the figure Coastline’s covenant is about.',
  },
  {
    id: 'f07-mp-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Coastline’s credit officer changes the 2029 online growth input from 10% to 5%, and the 2029 online sales figure does not change. Which explanation is most likely?',
    options: [
      'The 2029 cell is hard-coded: a typed number, or the rate typed into its formula.',
      'The spreadsheet has to be saved and reopened before any formula picks up a changed input.',
      'Growth rates only affect the years after the one they are entered for, so 2029 should not move.',
      'The input cell is formatted as a percentage, and formulas cannot read values formatted that way.',
    ],
    answer: 0,
    feedback: { 1: 'Spreadsheets recalculate when an input changes; saving makes no difference.', 2: 'The 2029 rate is exactly what drives 2029 (2028 × (1 + rate)). It should change.', 3: 'A percentage format only changes how 0.05 is displayed; formulas read the value.' },
    hints: ['What would the 2029 cell have to contain for the input to have no effect?'],
    solution: 'If the cell were <x>=D9*(1+E$3)</x> it would move. It does not, so it is hard-coded: a typed 231,000, or <x>=D9*1.10</x>. Find it with Show Formulas, where it looks different from its neighbours.',
  },
];

export const independent = [
  {
    id: 'f07-mp-i1', type: 'formula', kind: 'applied',
    prompt: 'Online cost of goods is 48% of online sales in every year (B12, Ana’s estimate from the 2027 accounts). In D12, write the 2028 cost of goods so that it is right when filled right to H12.',
    sheet: { cells: { ...modelCells({ total: false }), A11: 'Online cost of goods, share of online sales', B11: '', A12: 'Online cost of goods', B12: ASSUME.online.cogsShare } }, cell: 'D12', fill: 'D12:H12', view: 'A1:H12', widths: WIDTHS, formats: { ...FORMATS, B12: P },
    answer: '=D9*$B$12',
    alt: ['=$B$12*D9', '=D9*$B12'],
    wrong: [
      { formula: '=D9*B12', say: 'B12 is relative, so filled right it becomes C12, D12 … and the share is lost after 2028. Every year shares the one input: anchor it, $B$12.' },
      { formula: '=D9*0.48', say: 'The 48% is typed in. If Ana changes B12, this row will not follow. Refer to $B$12.' },
      { formula: '=C9*$B$12', say: 'That is last year’s sales. Cost of goods belongs to the sales of the same year: D9.' },
    ],
    solution: `<x>=D9*$B$12</x>: ${onlineYear(0).toLocaleString('en-US')} × 0.48 = ${(onlineYear(0) * 0.48).toLocaleString('en-US')} for 2028. D9 moves with the year; the one share that every year uses is absolute.`,
  },
  {
    id: 'f07-mp-i2', type: 'num', kind: 'numerical',
    prompt: 'Suppose the second kitchen opened on 1 October 2028 instead of 1 April. Its first full year would still bring in $150,000 of revenue. How much of that falls in calendar 2028, if revenue runs evenly through the months open?',
    answer: 37500, check: () => 150000 * 3 / 12, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 112500, say: 'That is the April opening: nine months. From 1 October only October, November and December fall in 2028.' },
      { value: 150000, say: 'That is a full year; the kitchen trades only part of 2028.' },
      { value: 150000 * 9 / 12 - 150000 * 3 / 12, say: 'Count the months the kitchen is open in 2028 (3) and take that share of the annual amount.' },
    ],
    solution: 'Months open in 2028: October, November, December = 3. 150,000 × 3 ÷ 12 = 37,500 dollars. In the model this is just the months-open row changing from 9 to 3; every kitchen line follows.',
  },
  {
    id: 'f07-mp-i3', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of planning and building Coastline’s model in a sensible order.',
    items: ['Write down the decision the model serves (can Lantern pay the loan and meet its covenant?)', 'List the outputs that answer it (cash, loan balance, current ratio each year)', 'Work out the calculations those outputs need, and the inputs those need', 'Lay out the timeline and the inputs block, then build the calculations', 'Add check rows and test the model by changing inputs'],
    solution: 'Plan backwards from the decision to the inputs; build forwards from the inputs to the outputs; then check. Checks come last only in time: they are part of the design.',
  },
  {
    id: 'f07-mp-i4', type: 'mc', kind: 'applied',
    prompt: 'Reviewing a model, you find a blue number in the middle of a row of black forecast figures. Following the usual colour convention, what does it tell you?',
    options: ['A value was typed into a forecast row: a likely hard-coded number to investigate.', 'The cell links to another sheet or file, the colour normally reserved for links.', 'The figure is an actual result from the accounts, so it is more reliable than its neighbours.', 'Nothing in particular: text colour is decoration chosen by whoever built the model.'],
    answer: 0,
    feedback: { 1: 'Links to other sheets or files are usually green, not blue.', 2: 'Actual results belong in the history columns, not in the middle of the forecast years.', 3: 'The colour convention exists precisely so that typed values stand out.' },
    solution: 'Blue means typed in. In a forecast row, where every cell should be the same formula, a typed value is almost always an error, or a patch someone forgot to explain.',
  },
  {
    id: 'f07-mp-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these formulas, found in a forecast row, contain a hard-coded assumption? Select all that apply.',
    options: ['<x>=D9*1.05</x>', '<x>=D9*(1+E$3)</x>', '<x>=D9*12/10</x>, with a label saying the ten months are annualised', '<x>=D9+4000</x>', '<x>=SUM(D8:D9)</x>'],
    answer: [0, 3],
    feedback: { 2: 'The 12 and the 10 are facts about calendars and the history, explained by the label, not assumptions anyone will change. Even so, many modellers put the months in an input cell too.', 4: 'A total of rows above contains no assumption.' },
    solution: 'The 1.05 (5% growth) and the 4,000 (an addition from somewhere) are assumptions hidden in formulas: each should be an input cell. Referring to E$3 is the right way.',
  },
];

export const check = [
  {
    id: 'f07-mp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why do modellers keep every assumption in its own input cell, apart from the calculations?',
    options: [
      'One change reaches every formula, and all the assumptions can be judged in one place.',
      'Because spreadsheets recalculate faster when every input sits on the left of the sheet.',
      'Because auditors require the inputs to be printed on a separate page from the results.',
      'So that the calculations are locked and nobody can change a formula by mistake.',
    ],
    answer: 0,
    feedback: { 1: 'Speed has nothing to do with it; the reason is control and transparency.', 2: 'Some reviewers expect it, but the reason they do is the one in the right answer.', 3: 'Calculations can still be changed; the point is that assumptions are visible and changed in one place.' },
    solution: 'One input in one place means a change is made once and reaches everything; a block of labelled inputs lets a lender judge the assumptions without reading every formula.',
  },
  {
    id: 'f07-mp-k2', type: 'num', kind: 'numerical',
    prompt: 'Online sales were $187,500 in 2027. With growth of 12% in 2028, 10% in 2029 and 8% in 2030, what are the forecast online sales for 2030?',
    answer: Math.round(onlineYear(2)), check: () => onlineYear(2), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 187500 * 1.30, say: 'Adding the rates (12 + 10 + 8 = 30%) ignores compounding: each year grows the year before, including its growth.' },
      { value: 187500 * 1.08, say: 'That applies only 2030’s rate to 2027’s figure. Grow year by year.' },
      { value: 187500 * 1.10 ** 3, say: 'That uses 10% for all three years. Each year has its own rate.' },
    ],
    solution: `187,500 × 1.12 × 1.10 × 1.08 = ${Math.round(onlineYear(2)).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-mp-k3', type: 'num', kind: 'numerical',
    prompt: 'A template grows Lantern’s 2027 café sales ($236,000, ten months) by 4% to forecast 2028, instead of growing the 12-month figure. By how many dollars does it understate 2028 café sales?',
    answer: 49088, check: () => (236000 * 12 / 10 - 236000) * 1.04, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 47200, say: 'That is the gap in the base (283,200 − 236,000). Both figures are then grown by 4%, so the gap grows too.' },
      { value: 245440, say: 'That is the template’s 2028 figure, not the size of its error.' },
    ],
    solution: '283,200 × 1.04 − 236,000 × 1.04 = 294,528 − 245,440 = 49,088 dollars, and the gap keeps growing in every later year.',
  },
  {
    id: 'f07-mp-k4', type: 'mc', kind: 'applied',
    prompt: 'Coastline will want to see what happens if the second kitchen opens three months late. Which design lets Ana answer in one change?',
    options: [
      'A months-open row (9 in 2028, then 12) multiplied into every kitchen line.',
      'Typing the kitchen’s 2028 revenue and costs again for each opening date Coastline asks about.',
      'A second copy of the model',
      'A note on the summary page warning Coastline that the kitchen might open late.',
    ],
    answer: 0,
    feedback: { 1: 'Retyping figures is slow, and the changes will be missed somewhere: exactly what a model is meant to avoid.', 2: 'Two copies drift apart as soon as one is edited. One model with an input for the opening is safer.', 3: 'A note informs but does not show the effect on cash or the covenant.' },
    solution: 'With a months-open row, a late opening is one input: 9 becomes 6 in 2028, and every kitchen line, cash and the current ratio update.',
  },
  {
    id: 'f07-mp-k5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the convention most modellers follow.',
    text: 'Inputs are shown in [[0]] text, formulas in [[1]] text, and formulas that link to another sheet in [[2]] text.',
    blanks: [{ options: ['blue', 'black', 'green', 'red'], answer: 0 }, { options: ['blue', 'black', 'green', 'red'], answer: 1 }, { options: ['blue', 'black', 'green', 'red'], answer: 2 }],
    solution: 'Blue for typed inputs, black for formulas, green for links: a reader sees at once what was typed and what was calculated.',
  },
  {
    id: 'f07-mp-k6', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s café cost of goods is 31% of café sales in every year, held in B13. Which formula in D14 (for 2028) is right when filled right to 2032, with café sales in row 8?',
    options: ['<x>=D8*$B$13</x>', '<x>=D8*B13</x>', '<x>=$D$8*$B$13</x>', '<x>=D8*0.31</x>'],
    answer: 0,
    feedback: { 1: 'B13 is relative and moves to C13, D13 … when filled right, where there is no share.', 2: '$D$8 stays on 2028’s sales, so every year shows 2028’s cost of goods.', 3: 'Correct numbers today, but the 31% is hidden in the formula.' },
    solution: 'Sales move with the year (D8, relative); the one share all years use stays put ($B$13, absolute).',
  },
];
