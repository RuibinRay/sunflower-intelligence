// partial-correlation.ex.js — B05 · Partial correlation: widgets, practice and the knowledge check (answer keys live
// here). The cafés’ log comes from case.js (Harbourside’s 31 August days and Millbrook’s 31 May days for the
// worksheets); Riverside Library, Corner Stores, Hilltop Physio and the other businesses named are fictional. Formula
// items are marked by their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { CLEAN_ROWS, column } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean } from '../../../core/stats.js?v=20';
import { tSf } from '../../../core/inference.js?v=20';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- residual plot (612 days)
const S = column('peak_staff_hours'), W = column('peak_wait_min'), T = column('transactions'), CAFE = column('cafe');
const resid = (y, x) => { const mx = mean(x), my = mean(y); let a = 0, b = 0; x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; }); const sl = a / b; return y.map((v, i) => v - (my + sl * (x[i] - mx))); };
const ES = resid(S, T), EW = resid(W, T);
const labels = column('date').map((d, i) => `${Number(d.slice(8, 10))} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(d.slice(5, 7)) - 1]}, ${CAFE[i]}`);

// ---------------------------------------------------------------- worksheets: one café, one month
const slice = (cafe, mo) => CLEAN_ROWS.map((r, i) => i).filter((i) => CAFE[i] === cafe && column('date')[i].slice(5, 7) === mo);
const AUG = slice('Harbourside', '08'), MAY = slice('Millbrook', '05');
const g = (idx, a) => idx.map((i) => a[i]);
const dayL = (idx, m) => idx.map((i) => `${Number(column('date')[i].slice(8, 10))} ${m}`);
const sheetOf = (idx, m) => ({ A1: 'Day', B1: 'Peak barista hours', C1: 'Peak wait (min)', D1: 'Transactions', ...col('A', 2, dayL(idx, m)), ...col('B', 2, g(idx, S)), ...col('C', 2, g(idx, W)), ...col('D', 2, g(idx, T)) });
const A = { s: g(AUG, S), w: g(AUG, W), t: g(AUG, T) };
A.rsw = C.pearson(A.s, A.w).r; A.rst = C.pearson(A.s, A.t).r; A.rwt = C.pearson(A.w, A.t).r; A.p = C.partial(A.s, A.w, [A.t]);
const Mm = { s: g(MAY, S), w: g(MAY, W), t: g(MAY, T) };
Mm.rsw = C.pearson(Mm.s, Mm.w).r; Mm.p = C.partial(Mm.s, Mm.w, [Mm.t]);
const augCells = { ...sheetOf(AUG, 'Aug'), F1: 'r(hours, wait)', G1: '=CORREL(B2:B32,C2:C32)', F2: 'r(hours, transactions)', G2: '=CORREL(B2:B32,D2:D32)', F3: 'r(wait, transactions)', G3: '=CORREL(C2:C32,D2:D32)' };
const augP = A.p, augT = augP.r * Math.sqrt(28 / (1 - augP.r ** 2));

// ---------------------------------------------------------------- fictional r’s
const RL = { xy: 0.45, xz: 0.80, yz: 0.70 };           // Riverside Library: staff, queue, visitors
const CS = { xy: 0.52, xz: 0.90, yz: 0.62 };           // Corner Stores: staff, shrinkage, floor area
const HP = { xy: 0.30, xz: 0.20, yz: -0.50 };          // Hilltop Physio: sessions, recovery, initial severity
const pf = (o) => C.partialFromR(o.xy, o.xz, o.yz);

export const widgets = {
  'part-resid': {
    type: 'scatter',
    title: 'Holding transactions fixed: residuals of peak barista hours and of the peak wait (612 café-days)',
    x: { name: 'Barista hours above (+) or below (−) the usual for the day’s transactions', values: ES, unit: 'h' },
    y: { name: 'Peak wait above (+) or below (−) the usual for the day’s transactions', values: EW, unit: 'min' },
    group: { name: 'Café', values: CAFE }, labels,
    show: ['pearson', 'spearman', 'p'], toggles: ['group', 'line'], defaults: { group: false, line: false },
    note: 'Pearson’s r of the residuals is the partial correlation, −0.725. Points to the right had more barista hours than usual for their trade; points below had shorter waits than usual. The cloud slopes down in both cafés.',
  },
  'part-raw': {
    type: 'scatter',
    title: 'Before holding transactions fixed: peak barista hours against the peak wait',
    x: { name: 'Peak barista hours (7–11 a.m.)', values: S, unit: 'h' },
    y: { name: 'Peak wait', values: W, unit: 'min' },
    group: { name: 'Café', values: CAFE }, labels,
    show: ['pearson', 'spearman', 'p'], toggles: ['group', 'line'], defaults: { group: false, line: false },
    note: 'r = +0.53: heavily rostered days were busy days, and busy days had longer waits. Barista hours come in half-hour steps, so points line up in columns.',
  },
  'part-formula': {
    type: 'formula',
    title: 'The first-order partial correlation',
    intro: 'Set the three simple correlations. S is peak barista hours, W the peak wait and T transactions; the defaults are Ana’s.',
    inputs: [
      { id: 'xy', label: 'r(S, W)', min: -0.95, max: 0.95, step: 0.001, value: 0.535, fmt: 'num' },
      { id: 'xz', label: 'r(S, T)', min: -0.95, max: 0.95, step: 0.001, value: 0.926, fmt: 'num' },
      { id: 'yz', label: 'r(W, T)', min: -0.95, max: 0.95, step: 0.001, value: 0.767, fmt: 'num' },
    ],
    compute: (v) => {
      const s = Math.sqrt((1 - v.xz ** 2) * (1 - v.yz ** 2));
      const lo = v.xz * v.yz - s, hi = v.xz * v.yz + s;
      const rows = [['Product r(S, T) × r(W, T)', neg(v.xz * v.yz, 3)], ['Numerator r(S, W) − product', neg(v.xy - v.xz * v.yz, 3)], ['Denominator √((1 − r(S, T)²)(1 − r(W, T)²))', fx(s, 3)]];
      if (v.xy < lo - 1e-9 || v.xy > hi + 1e-9) {
        return { headline: { label: 'Partial correlation r(S, W · T)', value: 'not possible' }, rows, note: `These three correlations can’t all come from the same data: with r(S, T) and r(W, T) as set, r(S, W) must lie between ${neg(lo)} and ${neg(hi)}.`, error: 'The three correlations are inconsistent.' };
      }
      const p = (v.xy - v.xz * v.yz) / s;
      return {
        headline: { label: 'Partial correlation r(S, W · T)', value: neg(p, 3) },
        rows,
        note: Math.sign(p) !== Math.sign(v.xy) && Math.abs(p) > 0.05
          ? 'The sign has flipped: the simple correlation is smaller than the product of the two links with T, so once T is held fixed the remaining link points the other way.'
          : Math.abs(p) < Math.abs(v.xy) ? 'Holding T fixed weakens the link: part of the simple correlation came from both variables’ links with T.' : 'Holding T fixed strengthens the link: T was masking part of it.',
      };
    },
  },
};

export const guided = [
  {
    id: 'b05-part-g1', type: 'steps', kind: 'numerical',
    prompt: 'The worksheet holds Harbourside’s 31 days in August 2027. G1:G3 already hold the three simple correlations among peak barista hours, the peak wait and transactions.',
    solution: `The simple correlation is ${neg(A.rsw, 3)}; holding transactions fixed, (${neg(A.rsw, 3)} − ${fx(A.rst, 3)} × ${fx(A.rwt, 3)}) ÷ √((1 − ${fx(A.rst, 3)}²)(1 − ${fx(A.rwt, 3)}²)) = ${neg(augP.r, 3)}. In August, on days with the same trade, more barista hours went with shorter waits, as over the whole year.`,
    steps: [
      {
        id: 'b05-part-g1-s1', type: 'formula',
        prompt: 'In G4, calculate the partial correlation of peak barista hours and the peak wait holding transactions fixed, from the three correlations in G1:G3.',
        sheet: { cells: { ...augCells, F4: 'Partial r(hours, wait · transactions)' } },
        cell: 'G4', answer: '=(G1-G2*G3)/SQRT((1-G2^2)*(1-G3^2))',
        alt: ['=(G1-G2*G3)/(SQRT(1-G2^2)*SQRT(1-G3^2))', '=(G1-G3*G2)/SQRT((1-G3^2)*(1-G2^2))'],
        view: 'A1:G32', maxHeight: '20rem',
        formats: { G1: '0.000', G2: '0.000', G3: '0.000', G4: '0.000' }, widths: { A: 8, B: 17, C: 14, D: 12, F: 32 },
        wrong: [
          { formula: '=(G1-G2*G3)/((1-G2^2)*(1-G3^2))', say: 'The denominator is the square root of (1 − r(hours, transactions)²)(1 − r(wait, transactions)²). Without SQRT the result is far too large.' },
          { formula: '=G1-G2*G3', say: 'That is only the numerator. Divide by √((1 − G2²)(1 − G3²)) to put the result on the −1 to 1 scale.' },
          { formula: '=(G1-G2*G3)/SQRT((1-G1^2)*(1-G2^2))', say: 'The denominator uses the two correlations with the control, transactions: G2 and G3, not G1.' },
        ],
        hints: ['Numerator: r(hours, wait) − r(hours, transactions) × r(wait, transactions).', '<x>=(G1-G2*G3)/SQRT((1-G2^2)*(1-G3^2))</x>'],
      },
      {
        id: 'b05-part-g1-s2', type: 'mc',
        prompt: `In August the simple correlation is ${neg(A.rsw, 2)} and the partial correlation ${neg(augP.r, 2)}. What does the change of sign tell Ana?`,
        options: [
          'At a given level of trade, more barista hours went with shorter waits; busy days had both.',
          'The simple correlation was calculated wrongly, because a correlation can’t change its sign when a variable is added.',
          'More baristas cause longer waits on quiet days and shorter waits on busy days, so the two effects partly cancel.',
          'August had too few days to say anything, so both correlations should be ignored until more data are collected.',
        ],
        answer: 0,
        hints: ['What does each correlation compare: all days, or days with the same number of transactions?'],
        feedback: {
          1: 'Both are correct; they answer different questions. A partial correlation can have the opposite sign whenever the simple correlation is smaller than r(hours, T) × r(wait, T).',
          2: 'Neither correlation separates quiet and busy days; that needs bands. And neither shows cause.',
          3: `With 31 days the partial correlation, ${neg(augP.r, 2)}, has p ${augP.p < 0.001 ? 'below 0.001' : `= ${fx(augP.p, 3)}`}: August alone gives clear evidence.`,
        },
      },
    ],
  },
  {
    id: 'b05-part-g2', type: 'num', kind: 'numerical',
    prompt: 'Riverside Library (fictional) finds that the number of staff on the desk and the length of the queue correlate at 0.45 over 60 days. Staff correlate with the number of visitors at 0.80, and the queue with visitors at 0.70. Calculate the partial correlation of staff and queue length holding visitors fixed. Give three decimal places.',
    answer: Math.round(pf(RL) * 1000) / 1000, check: () => (0.45 - 0.8 * 0.7) / Math.sqrt((1 - 0.64) * (1 - 0.49)), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: Math.round((0.45 - 0.56) * 1000) / 1000, say: 'That is the numerator alone. Divide by √((1 − 0.80²)(1 − 0.70²)) = √(0.36 × 0.51).' },
      { value: Math.round(((0.45 - 0.56) / ((1 - 0.64) * (1 - 0.49))) * 1000) / 1000, say: 'You divided by the product without taking its square root.' },
    ],
    hints: ['Numerator: 0.45 − 0.80 × 0.70.', 'Denominator: √((1 − 0.64)(1 − 0.49)) = √(0.36 × 0.51).'],
    solution: `(0.45 − 0.56) ÷ √(0.36 × 0.51) = −0.11 ÷ ${fx(Math.sqrt(0.36 * 0.51), 4)} ≈ ${neg(pf(RL), 3)}. On days with the same number of visitors, more desk staff went with slightly shorter queues; the +0.45 came from busy days having both.`,
  },
  {
    id: 'b05-part-g3', type: 'formula', kind: 'applied',
    prompt: 'Back to Harbourside’s August. In E2, calculate day 1’s residual of peak barista hours after the least-squares line on transactions: its barista hours minus INTERCEPT + SLOPE × its transactions, using the whole month’s columns. Make it fill down to E32 and right to F32, so that column F holds the peak wait’s residuals.',
    sheet: { cells: { ...sheetOf(AUG, 'Aug'), E1: 'Hours residual', F1: 'Wait residual' } },
    cell: 'E2', fill: 'E2:F32', answer: '=B2-(INTERCEPT(B$2:B$32,$D$2:$D$32)+SLOPE(B$2:B$32,$D$2:$D$32)*$D2)',
    alt: ['=B2-INTERCEPT(B$2:B$32,$D$2:$D$32)-SLOPE(B$2:B$32,$D$2:$D$32)*$D2', '=B2-(SLOPE(B$2:B$32,$D$2:$D$32)*$D2+INTERCEPT(B$2:B$32,$D$2:$D$32))', '=B2-FORECAST.LINEAR($D2,B$2:B$32,$D$2:$D$32)', '=B2-FORECAST($D2,B$2:B$32,$D$2:$D$32)', '=B2-TREND(B$2:B$32,$D$2:$D$32,$D2)'],
    view: 'A1:F32', maxHeight: '20rem',
    formats: { E: '0.00', F: '0.00' }, widths: { A: 8, B: 17, C: 14, D: 12, E: 14, F: 13 },
    wrong: [
      { formula: '=B2-(INTERCEPT($B$2:$B$32,$D$2:$D$32)+SLOPE($B$2:$B$32,$D$2:$D$32)*$D2)', say: 'With $B fixed, column F subtracts the line for barista hours from the waits. Fix only the rows (B$2:B$32) so the range moves to column C as you fill right.' },
      { formula: '=B2-(INTERCEPT(B2:B32,D2:D32)+SLOPE(B2:B32,D2:D32)*D2)', say: 'Without dollar signs the ranges shrink as you fill down and move as you fill right. Fix the rows of the data ranges and the column of transactions.' },
      { formula: '=(INTERCEPT(B$2:B$32,$D$2:$D$32)+SLOPE(B$2:B$32,$D$2:$D$32)*$D2)-B2', say: 'That is the line minus the value, the opposite sign. A residual is the actual value minus the fitted one, so that days rostered more heavily than usual are positive.' },
    ],
    hints: ['The fitted value is INTERCEPT(y range, transactions) + SLOPE(y range, transactions) × the day’s transactions.', 'Lock the rows of the y range (B$2:B$32), all of the transactions range ($D$2:$D$32) and the column of the day’s transactions ($D2).'],
    solution: `<x>=B2-(INTERCEPT(B$2:B$32,$D$2:$D$32)+SLOPE(B$2:B$32,$D$2:$D$32)*$D2)</x>. Filled across, column F holds the waits’ residuals. <x>=CORREL(E2:E32,F2:F32)</x> then gives ${neg(augP.r, 3)}, exactly the partial correlation from the formula: correlating residuals is what holding transactions fixed means.`,
  },
  {
    id: 'b05-part-g4', type: 'classify', kind: 'conceptual',
    prompt: 'For each question, say what the third variable is: a confounder, a mediator or a collider.',
    items: [
      'Ice-cream sales and sunburn cases, with the day’s sunshine as the third variable.',
      'A sales-training course and sales, with the salesperson’s product knowledge (which the course raises) as the third variable.',
      'Two unrelated talents, singing and acting, among students admitted to a drama school that admits anyone strong in either.',
      'A loyalty discount and repeat visits, with the price paid per visit (which the discount lowers) as the third variable.',
    ],
    categories: ['Confounder', 'Mediator', 'Collider'],
    answer: [0, 1, 2, 1],
    hints: ['Draw arrows. Does the third variable affect both, sit between them, or is it affected by both?', 'Admission depends on both talents: it is their common effect.'],
    feedback: {
      1: 'The course raises knowledge and knowledge raises sales: knowledge sits on the path.',
      2: 'Admission is caused by both talents. Among those admitted, someone weak at one must be strong at the other, so a negative link appears.',
      3: 'The discount works partly by lowering the price paid; holding the price fixed would remove that route.',
    },
    solution: 'Sunshine drives both ice-cream sales and sunburn: a confounder, to hold fixed. Product knowledge and the price paid lie on the path from the course or the discount to the outcome: mediators, not to hold fixed when you want the whole effect. Admission is a common effect of two talents: a collider, and looking only at admitted students is holding it fixed.',
  },
];

export const independent = [
  {
    id: 'b05-part-i1', type: 'formula', kind: 'numerical',
    prompt: 'G4 holds August’s partial correlation of peak barista hours and the peak wait holding transactions fixed, and G5 holds n. In G6, calculate the two-sided p-value of the test that the partial correlation is zero.',
    sheet: { cells: { ...augCells, F4: 'Partial r', G4: '=(G1-G2*G3)/SQRT((1-G2^2)*(1-G3^2))', F5: 'n', G5: '=COUNT(B2:B32)', F6: 'p-value (two-sided)' } },
    cell: 'G6', answer: '=T.DIST.2T(ABS(G4)*SQRT((G5-3)/(1-G4^2)),G5-3)',
    alt: ['=T.DIST.2T(ABS(G4)*SQRT(G5-3)/SQRT(1-G4^2),G5-3)', '=2*T.DIST.RT(ABS(G4)*SQRT((G5-3)/(1-G4^2)),G5-3)', '=T.DIST.2T(ABS(G4*SQRT((G5-2-1)/(1-G4^2))),G5-2-1)'],
    view: 'A1:G32', maxHeight: '20rem',
    formats: { G1: '0.000', G2: '0.000', G3: '0.000', G4: '0.000', G6: '0.000000' }, widths: { A: 8, B: 17, C: 14, D: 12, F: 22 },
    wrong: [
      { formula: '=T.DIST.2T(ABS(G4)*SQRT((G5-2)/(1-G4^2)),G5-2)', say: 'With one variable held fixed the test has n − 2 − 1 = n − 3 degrees of freedom, not n − 2.' },
      { formula: '=T.DIST.2T(ABS(G4)*SQRT((G5-3)/(1-G4^2)),G5-1)', say: 'The degrees of freedom are n − 2 − k = n − 3, both inside the square root and in T.DIST.2T.' },
      { formula: '=T.DIST.RT(ABS(G4)*SQRT((G5-3)/(1-G4^2)),G5-3)', say: 'That is one tail. The test is two-sided: T.DIST.2T, or twice the right tail.' },
    ],
    solution: `t = r√((n − 3) ÷ (1 − r²)) = ${neg(augP.r, 3)} × √(28 ÷ (1 − ${fx(augP.r, 3)}²)) ≈ ${neg(augT, 2)} on 28 df; <x>=T.DIST.2T(ABS(G4)*SQRT((G5-3)/(1-G4^2)),G5-3)</x> gives ${augP.p < 0.000001 ? 'less than 0.000001' : fx(augP.p, 6)}. Even one month gives strong evidence of the negative link at a given level of trade.`,
  },
  {
    id: 'b05-part-i2', type: 'num', kind: 'numerical',
    prompt: 'Corner Stores (fictional) finds that the number of staff and the annual value of stock lost to theft and damage (shrinkage) correlate at 0.52 across 40 stores. Staff correlate with floor area at 0.90 and shrinkage with floor area at 0.62. Calculate the partial correlation of staff and shrinkage holding floor area fixed. Give three decimal places.',
    answer: Math.round(pf(CS) * 1000) / 1000, check: () => (0.52 - 0.9 * 0.62) / Math.sqrt((1 - 0.81) * (1 - 0.62 ** 2)), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: Math.round((0.52 - 0.558) * 1000) / 1000, say: 'That is the numerator. Divide by √((1 − 0.90²)(1 − 0.62²)).' },
      { value: Math.round(((0.52 - 0.558) / ((1 - 0.81) * (1 - 0.3844))) * 1000) / 1000, say: 'You divided by the product without taking its square root.' },
    ],
    solution: `(0.52 − 0.90 × 0.62) ÷ √((1 − 0.81)(1 − 0.3844)) = −0.038 ÷ ${fx(Math.sqrt(0.19 * 0.6156), 4)} ≈ ${neg(pf(CS), 3)}. Holding floor area fixed, staffing and shrinkage are almost unrelated: bigger stores have more of both.`,
  },
  {
    id: 'b05-part-i3', type: 'mc', kind: 'applied',
    prompt: 'A chain of gyms finds that members who attend more personal-training sessions lose more weight (r = 0.35). An analyst holds fixed the number of calories each member burns per week, which the sessions raise, and the partial correlation falls to 0.05. She reports that personal training doesn’t help. What is wrong with her analysis?',
    options: [
      'Calories burned lie on the path from sessions to weight loss, so holding them fixed removes the effect she wants.',
      'She should have used Spearman’s ρ, because weight loss is measured in kilograms rather than in ranks.',
      'A partial correlation of 0.05 is significant with enough members, so she should report it as a real effect.',
      'She should have held fixed the weight lost, because it is the outcome and so must always be controlled for.',
    ],
    answer: 0,
    feedback: {
      1: 'Spearman versus Pearson is about the shape of the link, not about which variable to hold fixed.',
      2: 'Significance is not the problem: the choice of control is. Holding a mediator fixed answers a different question.',
      3: 'The outcome can’t be held fixed in its own correlation. The issue is holding a mediator fixed.',
    },
    solution: 'Sessions raise the calories burned, and burning calories causes weight loss: calories are a mediator. Holding them fixed asks whether sessions help apart from burning calories, which is not the question. The simple correlation, or a partial correlation holding fixed confounders such as starting weight, is the one to report.',
  },
  {
    id: 'b05-part-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Among restaurants listed in a city guide, which lists a restaurant if its food or its location is outstanding, food quality and location quality correlate negatively. Across all restaurants in the city they are unrelated. What explains the negative link in the guide?',
    options: [
      'Being listed is a common effect of food and location, so selecting on it creates a link.',
      'Restaurants in good locations spend less effort on their food, because they get customers anyway.',
      'The guide’s critics mark down the food of well-placed restaurants because they expect more of them.',
      'The guide lists too few restaurants for a correlation to be meaningful, so it is due to chance.',
    ],
    answer: 0,
    feedback: {
      1: 'That would produce a negative link across all restaurants too, but there they are unrelated.',
      2: 'Possible in principle, but nothing in the setup suggests it, and selection alone produces the pattern.',
      3: 'The link follows from how the list is chosen, whatever its size.',
    },
    solution: 'Listing is a collider: it depends on both food and location. A listed restaurant with an ordinary location must have outstanding food, and one with ordinary food must have an outstanding location, so among listed restaurants the two are negatively correlated. Selecting on a collider is the same as holding it fixed.',
  },
  {
    id: 'b05-part-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about partial correlation that are true.',
    options: [
      'With one variable held fixed, correlating residuals and using the first-order formula give the same value.',
      'A partial correlation can have the opposite sign from the simple correlation.',
      'Each variable held fixed reduces the test’s degrees of freedom by one.',
      'Holding a variable fixed removes every way in which it is related to x and y, including curves.',
      'A partial correlation near zero shows that x has no effect on y.',
      'Holding fixed every variable available is always the safest choice.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Only the straight-line part of the control’s links is removed. Curves, such as waits rising steeply on busy days, remain.',
      4: 'Holding a mediator fixed can bring the partial correlation near zero even when x affects y through that mediator.',
      5: 'Holding a mediator or a collider fixed misleads. Choose controls from what you know about the process.',
    },
    solution: 'True: the two methods agree; the sign can flip (barista hours and waits, +0.53 to −0.72); df = n − 2 − k. False: only straight-line control; a near-zero partial can come from holding a mediator fixed; more controls can create or hide links.',
  },
  {
    id: 'b05-part-i6', type: 'num', kind: 'numerical',
    prompt: 'An analyst finds a partial correlation of −0.40 between two variables holding three others fixed, over 25 rows. Calculate the t statistic for the test that the partial correlation is zero. Give two decimal places.',
    answer: Math.round(-0.4 * Math.sqrt(20 / 0.84) * 100) / 100, check: () => -0.4 * Math.sqrt((25 - 2 - 3) / (1 - 0.16)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: Math.round(-0.4 * Math.sqrt(23 / 0.84) * 100) / 100, say: 'That uses n − 2 = 23 degrees of freedom. With three variables held fixed, df = 25 − 2 − 3 = 20.' },
      { value: Math.round(-0.4 * Math.sqrt(22 / 0.84) * 100) / 100, say: 'That uses n − 3, right for one control. Here three variables are held fixed: n − 2 − 3 = 20.' },
    ],
    solution: `df = 25 − 2 − 3 = 20, so t = −0.40 × √(20 ÷ (1 − 0.16)) = −0.40 × ${fx(Math.sqrt(20 / 0.84), 3)} ≈ ${neg(-0.4 * Math.sqrt(20 / 0.84))}. The two-sided p-value, <x>=T.DIST.2T(1.95,20)</x>, is about ${fx(2 * tSf(0.4 * Math.sqrt(20 / 0.84), 20), 3)}: not quite significant at 5%.`,
  },
];

export const check = [
  {
    id: 'b05-part-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a partial correlation of x and y holding z fixed measure?',
    options: [
      'How x and y go together once the straight-line part of each one’s link with z is taken out.',
      'How much of the correlation between x and y is caused by z, on a scale from 0 to 1.',
      'The correlation of x and y on the rows where z happens to take its most common value.',
      'The correlation of x with z, multiplied by the correlation of y with z, as a share of r_xy.',
    ],
    answer: 0,
    feedback: {
      1: 'It is a correlation between −1 and 1, not a share, and it says nothing about causes.',
      2: 'That is a crude stratified comparison on one slice of the data. A partial correlation uses all rows, through residuals.',
      3: 'r_xz × r_yz is the part subtracted in the numerator, not the result.',
    },
    solution: 'It is the correlation of the residuals of x and of y after each is fitted on z by least squares: the link at given values of z, as far as a straight line captures z’s influence.',
  },
  {
    id: 'b05-part-k2', type: 'num', kind: 'numerical',
    prompt: 'Hilltop Physio (fictional) finds that the number of sessions a patient attends and their improvement score correlate at 0.30. Sessions correlate with the patient’s initial severity at 0.20 and improvement with initial severity at −0.50. Calculate the partial correlation of sessions and improvement holding initial severity fixed. Give three decimal places.',
    answer: Math.round(pf(HP) * 1000) / 1000, check: () => (0.3 - 0.2 * -0.5) / Math.sqrt((1 - 0.04) * (1 - 0.25)), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: Math.round(((0.3 - 0.1) / Math.sqrt(0.96 * 0.75)) * 1000) / 1000, say: 'Watch the sign: 0.20 × (−0.50) = −0.10, and subtracting it adds 0.10 to the numerator.' },
      { value: 0.4, say: 'That is the numerator, 0.30 + 0.10. Divide by √((1 − 0.04)(1 − 0.25)).' },
    ],
    solution: `(0.30 − 0.20 × (−0.50)) ÷ √(0.96 × 0.75) = 0.40 ÷ ${fx(Math.sqrt(0.72), 4)} ≈ ${fx(pf(HP), 3)}. Holding severity fixed strengthens the link: severe cases attend a little more but improve less, which hid part of the sessions’ association with improvement.`,
  },
  {
    id: 'b05-part-k3', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Millbrook’s 31 days in May 2027. In G1, calculate the partial correlation of peak barista hours (B) and the peak wait (C) holding transactions (D) fixed, in a single formula using CORREL.',
    sheet: { cells: { ...sheetOf(MAY, 'May'), F1: 'Partial r(hours, wait · transactions)' } },
    cell: 'G1', answer: '=(CORREL(B2:B32,C2:C32)-CORREL(B2:B32,D2:D32)*CORREL(C2:C32,D2:D32))/SQRT((1-CORREL(B2:B32,D2:D32)^2)*(1-CORREL(C2:C32,D2:D32)^2))',
    alt: ['=(CORREL(B2:B32,C2:C32)-CORREL(B2:B32,D2:D32)*CORREL(C2:C32,D2:D32))/(SQRT(1-CORREL(B2:B32,D2:D32)^2)*SQRT(1-CORREL(C2:C32,D2:D32)^2))', '=(PEARSON(B2:B32,C2:C32)-PEARSON(B2:B32,D2:D32)*PEARSON(C2:C32,D2:D32))/SQRT((1-PEARSON(B2:B32,D2:D32)^2)*(1-PEARSON(C2:C32,D2:D32)^2))'],
    require: [],
    view: 'A1:G32', maxHeight: '20rem',
    formats: { G1: '0.000' }, widths: { A: 8, B: 17, C: 14, D: 12, F: 32 },
    wrong: [
      { formula: '=CORREL(B2:B32,C2:C32)', say: 'That is the simple correlation, with nothing held fixed. Subtract the part due to transactions and rescale.' },
      { formula: '=(CORREL(B2:B32,C2:C32)-CORREL(B2:B32,D2:D32)*CORREL(C2:C32,D2:D32))/((1-CORREL(B2:B32,D2:D32)^2)*(1-CORREL(C2:C32,D2:D32)^2))', say: 'The denominator needs a square root: √((1 − r_xz²)(1 − r_yz²)).' },
    ],
    solution: `The simple correlation in May is ${neg(Mm.rsw, 3)}; the partial correlation, ${neg(Mm.p.r, 3)}. At Millbrook too, on days with the same trade, more barista hours went with much shorter waits.`,
  },
  {
    id: 'b05-part-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to know whether warm weather goes with higher sales at Harbourside. The simple correlation is 0.40; holding footfall fixed it is −0.19. Warm days bring more people to the waterfront. Which number answers her question, and why?',
    options: [
      'The 0.40, because footfall is how warm weather reaches the till, and holding it fixed removes that route.',
      'The −0.19, because holding a third variable fixed always gives the more accurate correlation.',
      'Neither, because the two correlations have opposite signs and so cancel each other out.',
      'The −0.19, because footfall is a confounder that makes both the temperature readings and the sales figures rise together.',
    ],
    answer: 0,
    feedback: {
      1: 'Holding a variable fixed changes the question; it isn’t automatically more accurate. Here it removes the main route of the link.',
      2: 'They answer different questions, so they don’t cancel. The total link is 0.40.',
      3: 'Footfall doesn’t raise the temperature: the weather comes first. It is a mediator, not a confounder.',
    },
    solution: 'Warm weather → more footfall → more sales: footfall is a mediator. The question “do warm days go with higher sales?” is about the whole link, 0.40. The partial correlation, −0.19, asks whether warm days sell more at a given footfall, which is a different and narrower question.',
  },
  {
    id: 'b05-part-k5', type: 'classify', kind: 'applied',
    prompt: 'Ana is studying whether peak barista hours go with shorter waits. For each variable, say whether she should hold it fixed.',
    items: [
      'The day’s transactions, which drive both the roster and the queue.',
      'The peak load, transactions per barista hour, which baristas lower.',
      'Whether the day was a festival day, which brings both extra staff and a crowd.',
      'Whether a customer complained about the wait, which long waits and short staffing both make likelier.',
    ],
    categories: ['Hold it fixed', 'Don’t hold it fixed'],
    answer: [0, 1, 0, 1],
    feedback: {
      1: 'The load is how baristas shorten waits (a mediator). Holding it fixed makes baristas look useless.',
      2: 'A festival drives both the roster and the crowd: a confounder.',
      3: 'Complaints are caused by long waits and short staffing: a collider. Looking only at days with (or without) complaints would create a link.',
    },
    solution: 'Hold confounders fixed: transactions and festival days, which drive both barista hours and waits. Don’t hold fixed the peak load, a mediator through which baristas act, or complaints, a common effect (collider) of waits and staffing.',
  },
  {
    id: 'b05-part-k6', type: 'num', kind: 'numerical',
    prompt: 'Over 30 days, a partial correlation holding two variables fixed is 0.45. How many degrees of freedom does its t test have?',
    answer: 26, check: () => 30 - 2 - 2, unit: 'df', places: 0, tol: 0,
    wrong: [
      { value: 28, say: 'n − 2 is right for a simple correlation. Each variable held fixed removes one more: 30 − 2 − 2.' },
      { value: 27, say: 'That allows for one control. Two variables are held fixed: 30 − 2 − 2 = 26.' },
    ],
    solution: `df = n − 2 − k = 30 − 2 − 2 = 26. Then t = 0.45 × √(26 ÷ (1 − 0.2025)) ≈ ${fx(0.45 * Math.sqrt(26 / 0.7975))}, and the two-sided p-value is about ${fx(2 * tSf(0.45 * Math.sqrt(26 / 0.7975), 26), 3)}.`,
  },
];
