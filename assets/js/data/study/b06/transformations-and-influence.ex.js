// transformations-and-influence.ex.js — B06 · Transformations and influence: widgets, practice and the knowledge check
// (answer keys live here). The café log comes from case.js (Harbourside's dry autumn weekdays and its July days for the
// worksheets); Linden Bike Hire, Quayside Books and the other businesses named are fictional. Formula items are marked
// by their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { CLEAN_ROWS, CAFE_COLUMNS, column, SLIP } from './case.js?v=30';
import * as R from '../../../core/regression.js?v=30';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const at = (n) => CAFE_COLUMNS.indexOf(n);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}`;

// ---------------------------------------------------------------- widgets
const H = { cafe: 'Harbourside' };
const hDay = column('day', H);
const hxs = { 'High (°F)': column('high_f', H), 'Rain (in)': column('rain_in', H), Weekend: column('weekend', H), Festival: column('festival01', H), 'Build-up': column('build_up', H), Day: hDay };
const LOAD = column('peak_load'), WAIT = column('peak_wait_min');
const allLabels = column('date').map((d, i) => `${dayLabel(d)}, ${column('cafe')[i]}`);

// ---------------------------------------------------------------- worksheet 1: Harbourside's dry weekdays, September to mid-November
const AU = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && !['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('rain_in')] === 0 && r[at('date')] >= '2027-09-01' && r[at('date')] <= '2027-11-15');
const nA = AU.length, lastA = nA + 1;
const auHigh = AU.map((r) => r[at('high_f')]), auFoot = AU.map((r) => r[at('footfall')]);
const AUF = R.fit(auFoot.map(Math.log), { High: auHigh });
const auB = AUF.beta[1], auPct = (Math.exp(auB) - 1) * 100;
const auBase = { A1: 'Date', B1: 'High (°F)', C1: 'Footfall', ...col('A', 2, AU.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, auHigh), ...col('C', 2, auFoot) };
const auLogs = col('D', 2, AU.map((_, i) => `=LN(C${i + 2})`));
const auAt = 60, auMedian = Math.exp(AUF.beta[0] + auB * auAt);

// ---------------------------------------------------------------- worksheet 2: Harbourside's July, the wait and the load
const JU = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && r[at('date')].startsWith('2027-07'));
const juLoad = JU.map((r) => Math.round(r[at('transactions')] * 0.55 / r[at('peak_staff_hours')] * 100) / 100), juWait = JU.map((r) => r[at('peak_wait_min')]);
const nJ = JU.length, lastJ = nJ + 1;
const JUF = R.fit(juWait, { Load: juLoad, 'Hinge²': juLoad.map((v) => Math.max(0, v - 7) ** 2) });
const juBase = { A1: 'Date', B1: 'Load', C1: 'Hinge² (load above 7)', D1: 'Peak wait (min)', ...col('A', 2, JU.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, juLoad), ...col('D', 2, juWait) };
const juHinge = col('C', 2, JU.map((_, i) => `=MAX(0,B${i + 2}-7)^2`));

// ---------------------------------------------------------------- fictional numbers
const LB = { b: 0.38 };                                     // Linden Bike Hire: weekend coefficient in a log model
const CK = { r: 2.5, h: 0.30, p: 3 };                       // a store in a fictional chain
const LV = { n: 20, xbar: 12, sxx: 500, x: 30 };            // Quayside Books: 20 weeks of events
const BT = { eta: 5.10, smear: 1.02 };                      // a fictional hotel's log model
const K2 = { r: -3.1, h: 0.12, p: 4 };
const cooksD = ({ r, h, p }) => (r * r / p) * (h / (1 - h));
// classify item: 60 rows, 3 coefficients; Cook's D from leverage and the externally studentized residual
const CL = [[0.04, 4.2], [0.35, 0.3], [0.30, -3.5], [0.03, 0.8]];
const dFromT = (h, t, n = 60, p = 3) => { const r2 = t * t * (n - p) / (n - p - 1 + t * t); return (r2 / p) * (h / (1 - h)); };

export const widgets = {
  'trans-logs': {
    type: 'diagnostics',
    title: 'Harbourside’s footfall in levels or in logs (306 days)',
    y: { name: 'footfall', values: column('footfall', H) },
    xs: hxs, picked: ['High (°F)', 'Rain (in)', 'Weekend', 'Festival', 'Build-up'], choose: true, toggles: ['logY'],
    plots: ['fitted', 'qq', 'scale', 'order'], labels: column('date', H).map(dayLabel),
    note: 'Build-up is the opening build-up: 0 on 1 March, rising evenly to 1 on 29 June, when the café’s first four months ended, then 1. Day is a straight-line count (1 on 1 March), for contrast. Tick one of them, not both.',
  },
  'trans-hinge': {
    type: 'formula',
    title: 'A hinge in the peak wait (612 café-days)',
    intro: 'The model is wait = b₀ + b₁ × load + b₂ × max(0, load − c)ᵠ. Choose the threshold c and the power q (1 for a straight hinge, 2 for a squared one).',
    inputs: [
      { id: 'c', label: 'Threshold c (load)', min: 5, max: 9, step: 0.25, value: 7, fmt: 'num' },
      { id: 'q', label: 'Power q', min: 1, max: 2, step: 1, value: 2, fmt: 'int' },
    ],
    compute: (v) => {
      const hcol = LOAD.map((x) => Math.max(0, x - v.c) ** v.q);
      const f = R.fit(WAIT, { Load: LOAD, Hinge: hcol });
      if (f.error) return { headline: { label: 'R²', value: '–' }, rows: [], note: f.error, error: f.error };
      const at = (x) => f.beta[0] + f.beta[1] * x + f.beta[2] * Math.max(0, x - v.c) ** v.q;
      const grid = Array.from({ length: 27 }, (_, k) => 2 + k * 0.5);
      return {
        headline: { label: 'R²', value: fx(f.r2, 3) },
        rows: [['Residual standard error (min)', fx(f.sigma, 3)], ['AIC', fx(f.aic, 0)], ['b₁, slope below the threshold', neg(f.beta[1], 3)], [`b₂, hinge${v.q === 2 ? '²' : ''} coefficient`, neg(f.beta[2], 3)], ['Predicted wait at a load of 10 (min)', fx(at(10), 1)], ['Predicted wait at a load of 12 (min)', fx(at(12), 1)]],
        note: v.q === 2 && Math.abs(v.c - 7) < 0.3 ? 'This is the shape the fictional waits were built with: flat to 7, then rising with the square of the excess.' : v.q === 1 ? 'A straight hinge adds a single kink: better than a line, but it can’t follow a rise that keeps steepening.' : 'Compare R² and s with the threshold at 7.',
        chart: { kind: 'line', x: { label: 'Load (transactions per barista hour)', values: grid }, series: [{ name: 'Fitted wait', values: grid.map(at) }], y: { label: 'Peak wait (min)' } },
      };
    },
  },
  'trans-slip': {
    type: 'diagnostics',
    title: 'Transactions on footfall, raw log (612 café-days)',
    y: { name: 'Transactions', values: column('transactions') },
    xs: { Footfall: column('footfall', { raw: true }) },
    plots: ['fitted', 'leverage'], labels: allLabels,
    note: `Millbrook’s ${dayLabel(SLIP.date)} footfall is recorded as ${SLIP.recorded.toLocaleString('en-US')}; the door counter says ${SLIP.actual}.`,
  },
  'trans-clean': {
    type: 'diagnostics',
    title: 'Transactions on footfall, corrected log (612 café-days)',
    y: { name: 'Transactions', values: column('transactions') },
    xs: { Footfall: column('footfall') },
    plots: ['fitted', 'leverage'], labels: allLabels,
    note: 'The five days at the right are Harbourside’s festival days.',
  },
};

export const guided = [
  {
    id: 'b06-trans-g1', type: 'steps', kind: 'numerical',
    prompt: `The worksheet holds Harbourside’s ${nA} dry weekdays from 1 September to 15 November 2027: the day’s high and footfall. Ana wants the percentage change in footfall per °F.`,
    solution: `D2: <x>=LN(C2)</x>, filled down. The slope of ln(footfall) on the high is ${fx(auB, 4)}, so <x>=EXP(SLOPE(D2:D${lastA},B2:B${lastA}))-1</x> = ${fx(auPct / 100, 4)}: about ${fx(auPct, 2)}% more people per °F on these days. That is below the year-long model’s 1.1%. With only ${nA} days its 95% interval is wide, ${fx((Math.exp(AUF.coefs[1].low) - 1) * 100, 2)}% to ${fx((Math.exp(AUF.coefs[1].high) - 1) * 100, 2)}%, and a one-predictor model of a few autumn weeks leaves out what else was changing as the weather cooled, so treat it as a rough local figure.`,
    steps: [
      {
        id: 'b06-trans-g1-s1', type: 'formula',
        prompt: 'In D2, calculate the natural log of the first day’s footfall, so that it fills down.',
        sheet: { cells: { ...auBase, D1: 'ln(footfall)' } },
        cell: 'D2', fill: `D2:D${lastA}`, answer: '=LN(C2)', require: ['LN'],
        view: `A1:D${lastA}`, maxHeight: '20rem', formats: { D: '0.000' }, widths: { A: 8, B: 10, C: 10, D: 13 },
        wrong: [{ formula: '=LOG(C2)', say: 'LOG with one argument is the base-10 log. The percentage reading of a slope uses the natural log, LN.' }],
        hints: ['Excel’s natural log is LN.', '<x>=LN(C2)</x>'],
      },
      {
        id: 'b06-trans-g1-s2', type: 'formula',
        prompt: 'Column D now holds ln(footfall). In G2, calculate the exact proportional change in footfall per °F from the slope of ln(footfall) on the high (as a decimal: 0.01 is 1%).',
        sheet: { cells: { ...auBase, D1: 'ln(footfall)', ...auLogs, F2: 'Change per °F' } },
        cell: 'G2', answer: `=EXP(SLOPE(D2:D${lastA},B2:B${lastA}))-1`, alt: [`=EXP(INDEX(LINEST(D2:D${lastA},B2:B${lastA}),1))-1`],
        view: `A1:G${lastA}`, maxHeight: '20rem', formats: { D: '0.000', G: '0.00%' }, widths: { A: 8, B: 10, C: 10, D: 13, F: 15 },
        wrong: [
          { formula: `=SLOPE(D2:D${lastA},B2:B${lastA})`, say: 'That is b, the shortcut. The exact change is e^b − 1; for a slope this small the two are close, but use the exact form.' },
          { formula: `=EXP(SLOPE(C2:C${lastA},B2:B${lastA}))-1`, say: 'Use the slope of ln(footfall) (column D). The slope of footfall itself is in people per °F, not a log change.' },
          { formula: `=EXP(SLOPE(B2:B${lastA},D2:D${lastA}))-1`, say: 'SLOPE takes the y values first: SLOPE(D2:D…, B2:B…).' },
        ],
        hints: ['SLOPE(ln footfall, high) gives b; the proportional change is e^b − 1.', `<x>=EXP(SLOPE(D2:D${lastA},B2:B${lastA}))-1</x>`],
      },
      {
        id: 'b06-trans-g1-s3', type: 'mc',
        prompt: `The result is ${fx(auPct, 2)}% per °F. How should Ana word it?`,
        options: [
          `On dry autumn weekdays, each °F warmer goes with about ${fx(auPct, 1)}% more people through the door.`,
          `Each °F warmer adds about ${fx(auPct, 1)} people through the door.`,
          `Warming the day by 1°F causes footfall to rise by ${fx(auPct, 1)}%, since the slope measures what temperature does to trade.`,
          `About ${fx(auPct, 1)}% of the variation in footfall is explained by the temperature.`,
        ],
        answer: 0,
        hints: ['A slope on ln y is a proportional change, and a slope from observational data is an association.'],
        feedback: {
          1: 'In a model for ln(footfall) the slope is a percentage, not a number of people. The number of people depends on how busy the day is.',
          2: 'The log is observational, so the slope says what goes with warmer days, not what warming does.',
          3: 'That would be R². The slope measures how much footfall changes, not how much variation the model accounts for.',
        },
      },
    ],
  },
  {
    id: 'b06-trans-g2', type: 'num', kind: 'numerical',
    prompt: 'Linden Bike Hire (fictional) models ln(daily hires) on the weather and a weekend dummy. The weekend coefficient is 0.38. By what percentage are weekend hires higher than weekday hires with the same weather? Give one decimal place.',
    answer: Math.round((Math.exp(LB.b) - 1) * 1000) / 10, check: () => (Math.exp(0.38) - 1) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [{ value: 38, say: 'That is the shortcut 100b, which is only close for small coefficients. The exact change is 100(e^0.38 − 1).' }, { value: Math.round(Math.exp(LB.b) * 1000) / 10, say: 'e^0.38 = 1.462 is the ratio of weekend to weekday hires. Subtract 1 for the percentage increase.' }],
    hints: ['A change of b in ln y multiplies y by e^b.', 'e^0.38 − 1 = ?'],
    solution: `e^0.38 = ${fx(Math.exp(0.38), 3)}, so weekend hires are ${fx((Math.exp(0.38) - 1) * 100, 1)}% higher than weekday hires with the same weather. The shortcut, 38%, is ${fx((Math.exp(0.38) - 1) * 100 - 38, 1)} points short.`,
  },
  {
    id: 'b06-trans-g3', type: 'num', kind: 'numerical',
    prompt: 'In a regression with three coefficients (an intercept and two slopes) fitted to the stores of a fictional chain, one store has an internally studentized residual of 2.5 and a leverage of 0.30. Calculate its Cook’s distance. Give three decimal places.',
    answer: Math.round(cooksD(CK) * 1000) / 1000, check: () => (2.5 ** 2 / 3) * (0.3 / 0.7), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round(2.5 ** 2 / 3 * 0.3 * 1000) / 1000, say: 'The leverage enters as h ÷ (1 − h) = 0.30 ÷ 0.70, not as h alone.' }, { value: Math.round(2.5 / 3 * (0.3 / 0.7) * 1000) / 1000, say: 'Square the studentized residual: r² = 6.25.' }],
    hints: ['D = (r² ÷ p) × h ÷ (1 − h), with p = 3.', '(6.25 ÷ 3) × (0.30 ÷ 0.70).'],
    solution: `D = (2.5² ÷ 3) × (0.30 ÷ 0.70) = 2.083 × 0.429 = ${fx(cooksD(CK), 3)}. That is above 0.5 and approaching 1: check this store’s data, and fit the model with and without it to see what changes.`,
  },
  {
    id: 'b06-trans-g4', type: 'mc', kind: 'applied',
    prompt: 'Harbourside’s five festival days are real (the till confirms them) and sit far above a log model of footfall that has no festival term. What should Ana do?',
    options: [
      'Add a festival dummy, so the five days get their own coefficient, and say so in the report.',
      'Delete the five days, since their studentized residuals are above 3.',
      'Keep them in the model as they are, because deleting data is never allowed.',
      'Replace their footfall with the average weekend footfall, so they no longer stand out from the other days.',
    ],
    answer: 0,
    hints: ['They are real and different for a known reason. Can the model say why?'],
    feedback: {
      1: 'A cut-off says where to look, not what to remove. Deleting real days loses what they show, and the report would hide that festivals exist.',
      2: 'Keeping them without a term lets them pull the weekend coefficient up (from 0.469 to 0.521), because all five fell on weekends.',
      3: 'Replacing real values with invented ones is falsifying the data.',
    },
    solution: 'The days are real and their difference has a known cause, so model it: a festival dummy. The other coefficients then come out almost exactly as if the days were left out, but the model still describes them (about 2.4 times an ordinary weekend day).',
  },
];

export const independent = [
  {
    id: 'b06-trans-i1', type: 'formula', kind: 'numerical',
    prompt: `The worksheet holds Harbourside’s ${nJ} days in July 2027: the load (peak transactions per barista hour) in B and the peak wait in D. In C2, calculate the squared hinge at a load of 7, max(0, load − 7)², so that it fills down.`,
    sheet: { cells: { ...juBase } },
    cell: 'C2', fill: `C2:C${lastJ}`, answer: '=MAX(0,B2-7)^2', alt: ['=IF(B2>7,(B2-7)^2,0)', '=(MAX(0,B2-7))^2', '=MAX(0,B2-7)*MAX(0,B2-7)'],
    view: `A1:D${lastJ}`, maxHeight: '20rem', formats: { B: '0.00', C: '0.00' }, widths: { A: 8, B: 8, C: 20, D: 14 },
    wrong: [
      { formula: '=MAX(0,B2-7)', say: 'That is the straight hinge. The squared hinge squares it: MAX(0,B2-7)^2.' },
      { formula: '=(B2-7)^2', say: 'Squaring before taking the maximum makes loads below 7 positive too. The hinge must be zero up to 7.' },
    ],
    solution: '<x>=MAX(0,B2-7)^2</x>: zero on days with a load of 7 or less, and the squared excess above 7 on the others.',
  },
  {
    id: 'b06-trans-i2', type: 'formula', kind: 'numerical',
    prompt: 'Columns B and C hold the load and the squared hinge; D holds the wait. In G2, use LINEST to return the coefficient on the squared hinge in the regression of the wait on both columns.',
    sheet: { cells: { ...juBase, ...juHinge, F2: 'Hinge² coefficient' } },
    cell: 'G2', answer: `=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ}),1)`, alt: [`=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ}),1,1)`, `=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ},TRUE,FALSE),1)`], require: ['LINEST'],
    view: `A1:G${lastJ}`, maxHeight: '20rem', formats: { B: '0.00', C: '0.00', G: '0.000' }, widths: { A: 8, B: 8, C: 20, D: 14, F: 18 },
    wrong: [
      { formula: `=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ}),2)`, say: 'LINEST returns the coefficients in reverse order of the x columns: first the last column’s (C, the hinge²), then B’s, then the intercept. Position 2 is the load’s slope.' },
      { formula: `=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ}),3)`, say: 'Position 3 is the intercept. The hinge² coefficient comes first, because C is the last x column.' },
      { formula: `=SLOPE(D2:D${lastJ},C2:C${lastJ})`, say: 'SLOPE fits the wait on the hinge alone, leaving out the load. With both in the model, the hinge coefficient holds the load fixed: use LINEST.' },
    ],
    solution: `<x>=INDEX(LINEST(D2:D${lastJ},B2:C${lastJ}),1)</x> = ${fx(JUF.beta[2], 3)} minutes per squared transaction above 7. LINEST lists coefficients from the last x column to the first, then the intercept. July alone gives ${fx(JUF.beta[2], 3)}, against 0.226 for the whole year.`,
  },
  {
    id: 'b06-trans-i3', type: 'num', kind: 'numerical',
    prompt: 'Quayside Books (fictional) regresses weekly sales on the number of author events over 20 weeks. The events average 12 a week with Σ(x − x̄)² = 500. One week, a festival week, had 30 events. Calculate that week’s leverage. Give three decimal places.',
    answer: Math.round((1 / LV.n + (LV.x - LV.xbar) ** 2 / LV.sxx) * 1000) / 1000, check: () => 1 / 20 + (30 - 12) ** 2 / 500, places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round((30 - 12) ** 2 / 500 * 1000) / 1000, say: 'Add 1/n = 0.05: every row’s leverage is at least 1/n.' }],
    solution: `h = 1/20 + (30 − 12)² ÷ 500 = 0.05 + 324 ÷ 500 = ${fx(1 / 20 + 324 / 500, 3)}. The flag 2p/n is 4 ÷ 20 = 0.2, so this week has very high leverage: the fitted line passes close to it whatever its sales were. Whether it is influential depends on whether its sales are off the line the other weeks follow.`,
  },
  {
    id: 'b06-trans-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel models ln(nightly revenue). For a given night the model predicts ln(revenue) = 5.10, and the average of e raised to the residuals (the smearing factor) is 1.02. Estimate the mean revenue for nights like this. Give the answer to the nearest dollar.',
    answer: Math.round(Math.exp(BT.eta) * BT.smear), check: () => Math.exp(5.1) * 1.02, unit: '$', places: 0, tol: 0.6,
    wrong: [{ value: Math.round(Math.exp(BT.eta)), say: 'e^5.10 = $164 estimates the median. For the mean, multiply by the smearing factor, 1.02.' }, { value: Math.round(5.1 * 1.02 * 100) / 100, say: 'Back-transform first: the prediction is on the log scale, so take e^5.10 before multiplying.' }],
    solution: `Median: e^5.10 = $${fx(Math.exp(5.1), 2)}. Mean: × 1.02 = $${fx(Math.exp(5.1) * 1.02, 2)}, about $${Math.round(Math.exp(5.1) * 1.02)}. Use the median for “a typical night” and the mean for budgeting a total over many nights.`,
  },
  {
    id: 'b06-trans-i5', type: 'classify', kind: 'conceptual',
    prompt: 'A regression has 3 coefficients and 60 rows (so 2p/n = 0.10). Classify each row by its leverage h, externally studentized residual t and Cook’s distance D.',
    items: CL.map(([h, t]) => `h = ${fx(h)}, t = ${neg(t, 1)}, D = ${fx(dFromT(h, t), 2)}`),
    categories: ['An outlier with little influence', 'High leverage but on the line', 'Influential', 'Unremarkable'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'A large studentized residual with low leverage: far from the line, but it can’t pull the line much (D is well below 0.5).',
      1: 'Far out in x but close to the line: it sits where the others predict, so leaving it out changes little.',
      2: 'High leverage and a large residual together: D above 1. Check it against the source and fit with and without it.',
      3: 'Small on every measure.',
    },
    solution: 'Influence needs both leverage and a large residual. Row 1 is an outlier, row 2 a high-leverage point on the line, row 3 is influential, row 4 is ordinary.',
  },
  {
    id: 'b06-trans-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A quadratic in the load fits the café waits with R² = 0.943, and a squared hinge at 7 with 0.961. Why prefer the hinge, apart from its slightly higher R²?',
    options: [
      'A parabola must turn: it predicts waits rising again as the load falls below about 6.',
      'Quadratic terms can’t be fitted by least squares, so its coefficients are approximate.',
      'A hinge always has a higher R² than a polynomial with the same number of coefficients.',
      'The quadratic has more coefficients, so it is penalised by adjusted R².',
    ],
    answer: 0,
    feedback: {
      1: 'Any model that is linear in its coefficients, as a quadratic is, is fitted exactly by least squares; x² is just another column.',
      2: 'Not always: which fits better depends on the data’s shape.',
      3: 'Both have three coefficients (intercept, load, and load² or the hinge²).',
    },
    solution: 'A polynomial’s shape is global. The parabola has its minimum at a load of 6.0 and so predicts longer waits at low loads (4.0 minutes at a load of 2, against 1.8 on the quietest days). The hinge is flat until 7 and rises only after it, as the waits do.',
  },
];

export const check = [
  {
    id: 'b06-trans-k1', type: 'mc', kind: 'numerical',
    prompt: 'In a model for ln(weekly sales), a promotion dummy has coefficient −0.25. What does it mean, holding the other predictors fixed?',
    options: [
      'Promotion weeks have about 22% lower sales than other weeks.',
      'Promotion weeks have 25% lower sales than other weeks: the coefficient times 100.',
      'Promotion weeks have sales 0.25 lower than other weeks, in the units sales are recorded in.',
      'Promotion weeks have about 28% lower sales than other weeks with the same predictors.',
    ],
    answer: 0,
    feedback: {
      1: '25% is the shortcut 100b, which overstates a fall when b is not small. e^−0.25 − 1 = −0.221.',
      2: 'The coefficient is a change in ln(sales), not in sales. Exponentiate it.',
      3: 'That would come from e^0.25 − 1 = 0.284, the rise from promotion weeks back to other weeks. The fall is e^−0.25 − 1.',
    },
    solution: `e^−0.25 − 1 = ${neg(Math.exp(-0.25) - 1, 3)}: about 22% lower sales in promotion weeks than in otherwise similar weeks. A negative coefficient on a dummy needs care: a promotion that lowers sales may be one run in weeks that were going to be slow.`,
  },
  {
    id: 'b06-trans-k2', type: 'num', kind: 'numerical',
    prompt: 'A regression with 4 coefficients has a row with internally studentized residual −3.1 and leverage 0.12. Calculate its Cook’s distance. Give three decimal places.',
    answer: Math.round(cooksD(K2) * 1000) / 1000, check: () => (3.1 ** 2 / 4) * (0.12 / 0.88), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round(-3.1 / 4 * (0.12 / 0.88) * 1000) / 1000, say: 'Square the studentized residual: (−3.1)² = 9.61, so D is positive.' }],
    solution: `D = (9.61 ÷ 4) × (0.12 ÷ 0.88) = 2.4025 × 0.1364 = ${fx(cooksD(K2), 3)}: a clear outlier, but below 0.5, so not strongly influential. Check its data all the same.`,
  },
  {
    id: 'b06-trans-k3', type: 'formula', kind: 'applied',
    prompt: `Column D holds ln(footfall) for Harbourside’s ${nA} dry autumn weekdays. In G2, predict the median footfall for a dry weekday at the high in G1, from the least-squares line of ln(footfall) on the high.`,
    sheet: { cells: { ...auBase, D1: 'ln(footfall)', ...auLogs, F1: 'High (°F)', G1: auAt, F2: 'Median footfall' }, vary: { G1: [55, 65, 70] } },
    cell: 'G2', answer: `=EXP(INTERCEPT(D2:D${lastA},B2:B${lastA})+SLOPE(D2:D${lastA},B2:B${lastA})*G1)`,
    alt: [`=EXP(TREND(D2:D${lastA},B2:B${lastA},G1))`, `=EXP(FORECAST.LINEAR(G1,D2:D${lastA},B2:B${lastA}))`],
    view: `A1:G${lastA}`, maxHeight: '20rem', formats: { D: '0.000', G2: '0' }, widths: { A: 8, B: 10, C: 10, D: 13, F: 16 },
    wrong: [
      { formula: `=TREND(D2:D${lastA},B2:B${lastA},G1)`, say: 'That is the prediction of ln(footfall). Back-transform it with EXP.' },
      { formula: `=TREND(C2:C${lastA},B2:B${lastA},G1)`, say: 'That fits footfall in levels. The question asks for the log model’s prediction, back-transformed.' },
      { formula: `=LN(TREND(D2:D${lastA},B2:B${lastA},G1))`, say: 'The prediction is already a log; undo it with EXP, not LN.' },
    ],
    solution: `<x>=EXP(TREND(D2:D${lastA},B2:B${lastA},G1))</x>: at ${auAt}°F, about ${fx(auMedian, 0)} people. This is a median; the mean is a little higher (multiply by the average of e^residual).`,
  },
  {
    id: 'b06-trans-k4', type: 'mc', kind: 'applied',
    prompt: 'A colleague reviewing Ana’s raw log wants to remove every café-day whose studentized residual exceeds 3 before fitting transactions on footfall. What is the right response?',
    options: [
      'Check each day against the source: correct errors, model real differences, and report with and without.',
      'Agree: a cut-off of 3 is the standard rule in regression, so applying it to every row is objective and easy to defend.',
      'Refuse to remove anything, and fit the raw log exactly as it was recorded, the 14 September slip included.',
      'Remove them, but use a stricter cut-off of 2, so that no unusual day can distort the fitted line.',
    ],
    answer: 0,
    feedback: {
      1: 'A cut-off is a reason to look, not to delete. It would remove the real festival days along with the error.',
      2: 'Keeping a known error is as wrong as deleting a real day: the slip more than halved the slope.',
      3: 'A lower cut-off removes more real days, and the results then describe a world without busy days.',
    },
    solution: 'Diagnostics find the points that matter; the source decides what they are. Correct the slip (the counter says 256), keep the festival days and model them (a café or festival term), and report what changes.',
  },
  {
    id: 'b06-trans-k5', type: 'multi', kind: 'conceptual',
    prompt: 'A model for ln(footfall) gives a 95% prediction interval of 4.95 to 5.40 for ln(footfall) on some day. Select all that are true.',
    options: [
      'The interval for footfall is e^4.95 to e^5.40, about 141 to 221 people.',
      'The back-transformed interval is not symmetric about the back-transformed prediction.',
      'The back-transformed interval is the prediction ± 0.225 people.',
      'e raised to the midpoint, 5.175, estimates the median footfall, not the mean.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'The ± 0.225 is in log units. Back on the original scale the interval is wider above the prediction than below it.',
    },
    solution: `e^4.95 = ${fx(Math.exp(4.95), 0)} and e^5.40 = ${fx(Math.exp(5.4), 0)}. The midpoint 5.175 gives e^5.175 = ${fx(Math.exp(5.175), 0)}, a median; the interval runs ${fx(Math.exp(5.175) - Math.exp(4.95), 0)} below it and ${fx(Math.exp(5.4) - Math.exp(5.175), 0)} above.`,
  },
];
