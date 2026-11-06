// prediction-and-intervals.ex.js — B06 · Prediction and intervals: widgets, practice and the knowledge check (answer
// keys live here). Café data come from case.js (the corrected log): Harbourside's weekend days from 1 July (the lesson's
// fit), its Sundays and its Saturdays from July (festival days left out), and its weekdays 4 October – 12 November.
// Windle Hotel, Brambleby Bakery, Corrieside Car Wash, Inchmore Ferries, Brackwater Energy and every other business
// named are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute their
// answers in `check`.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const label = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${MON[Number(r[at('date')].slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slice = (cafe, from, to, days) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to && (!days || days.includes(r[at('weekday')])) && !r[at('festival')]);
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);
const dataCells = (rows) => ({
  A1: 'Day', B1: 'High (°F)', C1: 'Transactions',
  ...col('A', 2, rows.map(label)), ...col('B', 2, rows.map((r) => r[at('high_f')])), ...col('C', 2, rows.map((r) => r[at('transactions')])),
});
const fitOf = (rows) => R.fit(rows.map((r) => r[at('transactions')]), { High: rows.map((r) => r[at('high_f')]) });

// ---------------------------------------------------------------- the lesson's 49 weekend days
const WK = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-07-01' && !r[at('festival')]);
const wx = WK.map((r) => r[at('high_f')]), wy = WK.map((r) => r[at('transactions')]);
const FW = fitOf(WK);
const sdx = Math.sqrt(wx.reduce((s, v) => s + (v - mean(wx)) ** 2, 0) / (wx.length - 1));
const predSheet = {
  cells: {
    ...dataCells(WK),
    F1: 'Forecast high (°F)', G1: 80,
    F2: 'Confidence level', G2: 0.95,
    F3: 'ŷ (FORECAST.LINEAR)', G3: '=FORECAST.LINEAR(G1,C2:C50,B2:B50)',
    F4: 'n', G4: '=COUNT(B2:B50)',
    F5: 's (STEYX)', G5: '=STEYX(C2:C50,B2:B50)',
    F6: 'Sxx (DEVSQ)', G6: '=DEVSQ(B2:B50)',
    F7: '(x₀ − x̄)² ÷ Sxx', G7: '=(G1-AVERAGE(B2:B50))^2/G6',
    F8: 't*', G8: '=T.INV.2T(1-G2,G4-2)',
    F9: 'Mean: lower', G9: '=G3-G8*G5*SQRT(1/G4+G7)',
    F10: 'Mean: upper', G10: '=G3+G8*G5*SQRT(1/G4+G7)',
    F11: 'One day: lower', G11: '=G3-G8*G5*SQRT(1+1/G4+G7)',
    F12: 'One day: upper', G12: '=G3+G8*G5*SQRT(1+1/G4+G7)',
    F13: 'Barista hours at the upper end', G13: '=0.55*G12/7',
  },
};

// ---------------------------------------------------------------- guided 1: Harbourside Sundays from July
const SU = slice('Harbourside', '2027-07-01', '2027-12-31', ['Sun']);
const FSU = fitOf(SU), suN = SU.length, suLast = suN + 1;
const suX = SU.map((r) => r[at('high_f')]);
const suCells = { ...dataCells(SU), E1: 'Forecast high (°F)', F1: 75, E2: 'ŷ', E3: 'Half-width, one Sunday' };
const FC_SU = `=FORECAST.LINEAR(F1,C2:C${suLast},B2:B${suLast})`;
const PIH_SU = `=T.INV.2T(0.05,COUNT(B2:B${suLast})-2)*STEYX(C2:C${suLast},B2:B${suLast})*SQRT(1+1/COUNT(B2:B${suLast})+(F1-AVERAGE(B2:B${suLast}))^2/DEVSQ(B2:B${suLast}))`;
const p75 = FSU.predict([75]);

// ---------------------------------------------------------------- independent 1: Harbourside Saturdays from July
const SA = slice('Harbourside', '2027-07-01', '2027-12-31', ['Sat']);
const FSA = fitOf(SA), saLast = SA.length + 1;
const saSheet = { cells: { ...dataCells(SA), E1: 'Forecast high (°F)', F1: 70, E2: 'Confidence level', F2: 0.95, E3: 'Half-width, mean' }, vary: { F1: [55, 85], F2: [0.9, 0.99] } };
const p70 = FSA.predict([70]);

// ---------------------------------------------------------------- check 3: Harbourside weekdays, 4 October – 12 November
const OC = slice('Harbourside', '2027-10-04', '2027-11-12', WD);
const FOC = fitOf(OC), ocLast = OC.length + 1;
const ocSheet = { cells: { ...dataCells(OC), E1: 'Forecast high (°F)', F1: 58, E2: 'Upper end, 95% prediction interval' }, vary: { F1: [48, 66] } };
const PIU_OC = `=FORECAST.LINEAR(F1,C2:C${ocLast},B2:B${ocLast})+T.INV.2T(0.05,COUNT(B2:B${ocLast})-2)*STEYX(C2:C${ocLast},B2:B${ocLast})*SQRT(1+1/COUNT(B2:B${ocLast})+(F1-AVERAGE(B2:B${ocLast}))^2/DEVSQ(B2:B${ocLast}))`;
const p58 = FOC.predict([58]);

// ---------------------------------------------------------------- small inputs
const HOTEL = { s: 18, n: 36 };
const BAKE = { b0: 180, b1: 14.2, s: 21, n: 26, xbar: 2.5, sxx: 26.2, x0: 4 };
const bakeHat = BAKE.b0 + BAKE.b1 * BAKE.x0, bakeSE = BAKE.s * Math.sqrt(1 + 1 / BAKE.n + (BAKE.x0 - BAKE.xbar) ** 2 / BAKE.sxx);
const WASH = { yhat: 340, sePred: 38, n: 40, per: 25 };
const washUp = WASH.yhat + R.tQuantile(0.9, WASH.n - 2) * WASH.sePred;

export const widgets = {
  'pred-weekends': {
    type: 'regression',
    title: 'Predicting weekend transactions from the high: Harbourside, 1 July – 31 December 2027 (49 days)',
    y: { name: 'Transactions', values: wy },
    xs: [{ name: 'High (°F)', values: wx }],
    picked: [0],
    options: ['predict'],
    predictAt: [80],
    note: `At 80°F: ŷ = ${FW.predict([80]).yhat.toFixed(1)}, interval for the mean ${FW.predict([80]).ciLow.toFixed(1)} to ${FW.predict([80]).ciHigh.toFixed(1)}, prediction interval ${FW.predict([80]).piLow.toFixed(1)} to ${FW.predict([80]).piHigh.toFixed(1)}. The data run from ${Math.min(...wx)}°F to ${Math.max(...wx)}°F, and cover weekends after the café’s build-up only: a prediction outside either is extrapolation, whatever the boxes show.`,
  },
  'pred-bands': {
    type: 'formula',
    title: 'Half-widths of the two intervals across the range of highs',
    intro: 'The residual standard error, mean high and spread of highs are the 49 weekend days’; n and the confidence level are yours.',
    inputs: [
      { id: 'x0', label: 'New high x₀', min: 30, max: 100, step: 1, value: 80, fmt: 'int', unit: '°F' },
      { id: 'n', label: 'Days in the sample', min: 10, max: 500, step: 1, value: 49, fmt: 'int' },
      { id: 'conf', label: 'Confidence level', min: 80, max: 99, step: 1, value: 95, fmt: 'pct' },
    ],
    compute: (v) => {
      const s = FW.sigma, xb = mean(wx), Sxx = (v.n - 1) * sdx ** 2, t = tq(v.n - 2, v.conf / 100);
      const hm = (x) => t * s * Math.sqrt(1 / v.n + (x - xb) ** 2 / Sxx), hp = (x) => t * s * Math.sqrt(1 + 1 / v.n + (x - xb) ** 2 / Sxx);
      const yhat = FW.beta[0] + FW.beta[1] * v.x0, xs = [35, 45, 55, 65, 75, 85, 95];
      const outside = v.x0 < Math.min(...wx) || v.x0 > Math.max(...wx);
      return {
        headline: { label: `ŷ at ${v.x0}°F`, value: `${yhat.toFixed(1)} transactions` },
        rows: [
          [`${v.conf}% interval for the mean`, `${(yhat - hm(v.x0)).toFixed(1)} to ${(yhat + hm(v.x0)).toFixed(1)} (± ${hm(v.x0).toFixed(1)})`],
          [`${v.conf}% prediction interval`, `${(yhat - hp(v.x0)).toFixed(1)} to ${(yhat + hp(v.x0)).toFixed(1)} (± ${hp(v.x0).toFixed(1)})`],
          ['Floor of the prediction interval, ± t* × s', `± ${(t * s).toFixed(1)}`],
        ],
        note: outside
          ? `${v.x0}°F is outside the data (${Math.min(...wx)}–${Math.max(...wx)}°F). The formula still gives intervals, but they assume the line continues where nothing has been observed.`
          : `The prediction interval is ${(hp(v.x0) / hm(v.x0)).toFixed(1)} times as wide as the interval for the mean here. More days shrink the mean’s interval; the prediction interval stays above ± ${(t * s).toFixed(1)}.`,
        chart: { kind: 'line', x: { label: 'High (°F)', values: xs }, series: [
          { name: 'Mean', values: xs.map((x) => Number(hm(x).toFixed(2))) },
          { name: 'Prediction interval', values: xs.map((x) => Number(hp(x).toFixed(2))) },
        ], y: { label: 'Transactions either side of ŷ' } },
      };
    },
  },
  'pred-sheet': {
    type: 'sheet',
    title: 'Prediction intervals in Excel: an 80-degree weekend day at Harbourside',
    sheet: predSheet,
    view: 'A1:G50',
    maxHeight: '22rem',
    editable: ['G1', 'G2', 'C2:C50'],
    formats: { G2: '0%', G3: '0.0', G5: '0.00', G6: '#,##0', G7: '0.0000', G8: '0.000', G9: '0.0', G10: '0.0', G11: '0.0', G12: '0.0', G13: '0.0' },
    widths: { A: 11, F: 26 },
    tools: ['formulas', 'reset'],
    note: 'G9:G10 differ from G11:G12 only by the 1+ under the square root. Put the forecast in G1 to 64.3, the mean high, to see both intervals at their narrowest; put it at 100 and note that nothing warns you the data stop at 94.',
  },
};

export const guided = [
  {
    id: 'b06-pred-g1', type: 'steps', kind: 'numerical',
    prompt: `Harbourside’s Sundays from 1 July to 31 December 2027 (${suN} days, festival day left out): the day’s high in B2:B${suLast} and transactions in C2:C${suLast}. Sunday’s forecast high is in F1. Predict Sunday’s transactions and give the 95% prediction interval.`,
    solution: `ŷ = FORECAST.LINEAR(75, …) = ${p75.yhat.toFixed(1)} transactions; s = ${FSU.sigma.toFixed(2)} on ${FSU.df} df, t* = ${tq(FSU.df).toFixed(3)}, so the half-width is ${(p75.piHigh - p75.yhat).toFixed(1)} and the prediction interval runs from ${p75.piLow.toFixed(1)} to ${p75.piHigh.toFixed(1)}. That is the interval for one Sunday; the interval for the average 75°F Sunday is far narrower, ${p75.ciLow.toFixed(1)} to ${p75.ciHigh.toFixed(1)}.`,
    steps: [
      {
        id: 'b06-pred-g1-s1', type: 'formula',
        prompt: 'In F2, predict transactions at the high in F1.',
        sheet: { cells: suCells, vary: { F1: [60, 85] } },
        cell: 'F2', answer: FC_SU,
        alt: [`=TREND(C2:C${suLast},B2:B${suLast},F1)`, `=INTERCEPT(C2:C${suLast},B2:B${suLast})+SLOPE(C2:C${suLast},B2:B${suLast})*F1`],
        view: `A1:F${suLast}`, maxHeight: '20rem', widths: { A: 11, E: 22 }, formats: { F2: '0.0' },
        wrong: [
          { formula: `=FORECAST.LINEAR(F1,B2:B${suLast},C2:C${suLast})`, say: 'FORECAST.LINEAR takes known_y’s (transactions, C) before known_x’s (highs, B). Swapped, it predicts a high from a number of transactions.' },
          { formula: `=SLOPE(C2:C${suLast},B2:B${suLast})*F1`, say: 'Add the intercept: ŷ = b₀ + b₁x₀.' },
        ],
        hints: ['FORECAST.LINEAR(x, known_y’s, known_x’s): the new x comes first.', `<x>=FORECAST.LINEAR(F1,C2:C${suLast},B2:B${suLast})</x>`],
      },
      {
        id: 'b06-pred-g1-s2', type: 'formula',
        prompt: 'In F3, calculate the half-width of the 95% prediction interval for one Sunday at the high in F1.',
        sheet: { cells: { ...suCells, F2: FC_SU }, vary: { F1: [60, 85] } },
        cell: 'F3', answer: PIH_SU,
        alt: [`=T.INV.2T(0.05,COUNT(B2:B${suLast})-2)*SQRT(STEYX(C2:C${suLast},B2:B${suLast})^2*(1+1/COUNT(B2:B${suLast})+(F1-AVERAGE(B2:B${suLast}))^2/DEVSQ(B2:B${suLast})))`],
        require: ['STEYX', 'DEVSQ'],
        view: `A1:F${suLast}`, maxHeight: '20rem', widths: { A: 11, E: 22 }, formats: { F2: '0.0', F3: '0.0' },
        wrong: [
          { formula: `=T.INV.2T(0.05,COUNT(B2:B${suLast})-2)*STEYX(C2:C${suLast},B2:B${suLast})*SQRT(1/COUNT(B2:B${suLast})+(F1-AVERAGE(B2:B${suLast}))^2/DEVSQ(B2:B${suLast}))`, say: 'That is the half-width for the mean response. One Sunday adds its own error: put 1+ under the square root.' },
          { formula: `=T.INV.2T(0.05,COUNT(B2:B${suLast})-2)*STEYX(C2:C${suLast},B2:B${suLast})`, say: 'That is the floor, ± t* × s. The exact interval also allows for the uncertainty in the line: √(1 + 1/n + (x₀ − x̄)²/Sxx).' },
          { formula: `=1.96*STEYX(C2:C${suLast},B2:B${suLast})*SQRT(1+1/COUNT(B2:B${suLast})+(F1-AVERAGE(B2:B${suLast}))^2/DEVSQ(B2:B${suLast}))`, say: `With ${suN} days and s estimated, use the t multiplier on n − 2 df: T.INV.2T(0.05,COUNT(B2:B${suLast})-2).` },
        ],
        hints: ['t* × s × √(1 + 1/n + (x₀ − x̄)²/Sxx), with s = STEYX and Sxx = DEVSQ of the highs.', 'T.INV.2T(0.05, n − 2) gives t*; AVERAGE(B2:B…) gives x̄.'],
      },
      {
        id: 'b06-pred-g1-s3', type: 'mc',
        prompt: 'The manager asks: “If I roster for the top of this interval, what am I covering?” Which answer is right?',
        options: [
          'About 97.5% of Sundays like this one, if the model holds: the interval leaves 2.5% in each tail.',
          'The average Sunday at this temperature, to within 95% confidence, which is exactly what a roster needs to cover.',
          'Every possible Sunday at this temperature, because the interval contains all the data.',
          'Exactly 95% of next year’s Sundays, whatever the weather and whatever happens on the harbour.',
        ],
        answer: 0,
        hints: ['A two-sided 95% interval puts 2.5% above its top.'],
        feedback: {
          1: 'The average is the confidence interval for the mean response; a roster is for one day, which is the prediction interval’s job.',
          2: 'A 95% interval aims to miss about 5% of single days, split between the two tails; it is not a range of all possibilities.',
          3: 'The promise only holds under the model’s conditions and for days like those it was fitted to, not whatever happens.',
        },
      },
    ],
  },
  {
    id: 'b06-pred-g2', type: 'num', kind: 'numerical',
    prompt: `Windle Hotel (fictional) regresses evening room-service orders on rooms occupied, over ${HOTEL.n} nights: s = ${HOTEL.s} orders. What is the half-width of the 95% confidence interval for the mean response at the mean occupancy? Give two decimal places.`,
    answer: rnd(tq(HOTEL.n - 2) * HOTEL.s / Math.sqrt(HOTEL.n), 2), check: () => R.tQuantile(0.975, 34) * 18 / 6, unit: 'orders', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(tq(HOTEL.n - 2) * HOTEL.s * Math.sqrt(1 + 1 / HOTEL.n), 2), say: 'That is the prediction interval for one night. The mean response has no 1+ under the root.' },
      { value: rnd(1.96 * HOTEL.s / Math.sqrt(HOTEL.n), 2), say: 'Use the t multiplier on n − 2 = 34 df, T.INV.2T(0.05,34) = 2.032, not 1.96.' },
      { value: rnd(HOTEL.s / Math.sqrt(HOTEL.n), 2), say: 'That is the standard error; multiply by t* for the half-width.' },
    ],
    hints: ['At x₀ = x̄ the distance term is 0, so SE_mean = s ÷ √n.', 'Half-width = T.INV.2T(0.05, 34) × 18 ÷ 6.'],
    solution: `At the mean occupancy (x₀ − x̄)² = 0, so SE_mean = 18 ÷ √36 = 3 orders and the half-width is ${tq(34).toFixed(3)} × 3 = ${(tq(34) * 3).toFixed(2)} orders. A single night’s prediction interval at the same occupancy would be ±${(tq(34) * 18 * Math.sqrt(1 + 1 / 36)).toFixed(1)}, six times as wide.`,
  },
  {
    id: 'b06-pred-g3', type: 'num', kind: 'numerical',
    prompt: `Brambleby Bakery (fictional) regresses weekly sourdough loaves on local events that week: ŷ = ${BAKE.b0} + ${BAKE.b1}x over ${BAKE.n} weeks, s = ${BAKE.s} loaves, x̄ = ${BAKE.xbar} events, Sxx = ${BAKE.sxx}. Next week has ${BAKE.x0} events. Calculate the upper end of the 95% prediction interval for next week’s loaves, to one decimal place.`,
    answer: rnd(bakeHat + tq(BAKE.n - 2) * bakeSE, 1), check: () => (180 + 14.2 * 4) + R.tQuantile(0.975, 24) * 21 * Math.sqrt(1 + 1 / 26 + 2.25 / 26.2), unit: 'loaves', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(bakeHat + tq(BAKE.n - 2) * BAKE.s * Math.sqrt(1 / BAKE.n + 2.25 / BAKE.sxx), 1), say: 'That is the upper end for the mean of all 4-event weeks. For one week, put 1+ under the square root.' },
      { value: rnd(bakeHat + 1.96 * bakeSE, 1), say: 'Use t* on n − 2 = 24 df (2.064), not 1.96.' },
      { value: rnd(bakeHat + tq(BAKE.n - 2) * BAKE.s, 1), say: 'Close, but that leaves out 1/n and the distance term; with 26 weeks they add a few loaves.' },
    ],
    hints: ['ŷ₀ = 180 + 14.2 × 4; the distance term is (4 − 2.5)² ÷ 26.2.', 'Upper end = ŷ₀ + T.INV.2T(0.05,24) × 21 × √(1 + 1/26 + 0.0859).'],
    solution: `ŷ₀ = 180 + 14.2 × 4 = ${bakeHat.toFixed(1)} loaves. SE_pred = 21 × √(1 + 0.0385 + 0.0859) = ${bakeSE.toFixed(2)}. Upper end = ${bakeHat.toFixed(1)} + ${tq(24).toFixed(3)} × ${bakeSE.toFixed(2)} = ${(bakeHat + tq(24) * bakeSE).toFixed(1)} loaves. Baking about ${Math.ceil(bakeHat + tq(24) * bakeSE)} would sell out only in an unusually busy week, if the model holds.`,
  },
  {
    id: 'b06-pred-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the confidence interval for the mean response wider at 94°F than at 64°F, the mean high?',
    options: [
      'Errors in the slope swing the line about the point of means, so its height is least certain far from x̄.',
      'Days at 94°F have larger residuals, and the formula measures that directly from the hot days in the sample.',
      'There are fewer days near 94°F, and the formula counts the days near each x to set the width there.',
      'The t multiplier grows with x₀, because extreme values of x use fewer degrees of freedom than central ones.',
    ],
    answer: 0,
    hints: ['Look at the term that depends on x₀: (x₀ − x̄)²/Sxx.', 'The line always passes through (x̄, ȳ).'],
    feedback: {
      1: 'The formula uses one s for every x; it doesn’t measure spread at each x. (If spread does grow with x, that is a failed condition, not what the formula captures.)',
      2: 'The formula doesn’t count nearby days; the width depends on the distance from x̄ through (x₀ − x̄)²/Sxx.',
      3: 'The degrees of freedom are n − 2 at every x₀; t* is the same across the range.',
    },
    solution: 'The term (x₀ − x̄)²/Sxx is 0 at x̄ and grows with the square of the distance. The least-squares line passes through (x̄, ȳ); uncertainty in the slope tilts it about that point, so its height is pinned most firmly in the middle and least at the ends. The same s and t* apply everywhere.',
  },
];

export const independent = [
  {
    id: 'b06-pred-i1', type: 'formula', kind: 'numerical',
    prompt: `Harbourside’s Saturdays from 1 July to 31 December 2027 (festival days left out): highs in B2:B${saLast}, transactions in C2:C${saLast}. F1 holds a high and F2 a confidence level. In F3, calculate the half-width of the confidence interval for the mean response at F1.`,
    sheet: saSheet,
    cell: 'F3', answer: `=T.INV.2T(1-F2,COUNT(B2:B${saLast})-2)*STEYX(C2:C${saLast},B2:B${saLast})*SQRT(1/COUNT(B2:B${saLast})+(F1-AVERAGE(B2:B${saLast}))^2/DEVSQ(B2:B${saLast}))`,
    require: ['T.INV.2T', 'STEYX'],
    view: `A1:F${saLast}`, maxHeight: '20rem', widths: { A: 11, E: 20 }, formats: { F2: '0%', F3: '0.00' },
    wrong: [
      { formula: `=T.INV.2T(1-F2,COUNT(B2:B${saLast})-2)*STEYX(C2:C${saLast},B2:B${saLast})*SQRT(1+1/COUNT(B2:B${saLast})+(F1-AVERAGE(B2:B${saLast}))^2/DEVSQ(B2:B${saLast}))`, say: 'The 1+ belongs to the prediction interval for one Saturday. The mean response leaves it out.' },
      { formula: `=T.INV.2T(F2,COUNT(B2:B${saLast})-2)*STEYX(C2:C${saLast},B2:B${saLast})*SQRT(1/COUNT(B2:B${saLast})+(F1-AVERAGE(B2:B${saLast}))^2/DEVSQ(B2:B${saLast}))`, say: 'T.INV.2T takes the two-tailed probability, 1 − F2, not the confidence level.' },
      { formula: `=T.INV.2T(1-F2,COUNT(B2:B${saLast})-2)*STEYX(C2:C${saLast},B2:B${saLast})/SQRT(COUNT(B2:B${saLast}))`, say: 'That is the half-width at x̄ only. Away from the mean high, add (x₀ − x̄)²/Sxx under the square root.' },
    ],
    solution: `t* × s × √(1/n + (x₀ − x̄)²/Sxx). At 70°F and 95%: ŷ = ${p70.yhat.toFixed(1)} and the half-width is ${(p70.ciHigh - p70.yhat).toFixed(2)}, so the average 70°F Saturday is estimated at ${p70.ciLow.toFixed(1)} to ${p70.ciHigh.toFixed(1)} transactions. A single 70°F Saturday’s prediction interval is ±${(p70.piHigh - p70.yhat).toFixed(1)}.`,
  },
  {
    id: 'b06-pred-i2', type: 'num', kind: 'applied',
    prompt: `Corrieside Car Wash (fictional) predicts ${WASH.yhat} washes for Saturday, with SE_pred = ${WASH.sePred} washes from a regression on ${WASH.n} days. Each attendant handles ${WASH.per} washes a day. The owner wants enough attendants that demand exceeds capacity on only about 1 Saturday in 10. How many attendants should she roster?`,
    answer: Math.ceil(washUp / WASH.per), check: () => Math.ceil((340 + R.tQuantile(0.9, 38) * 38) / 25), unit: 'attendants', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(WASH.yhat / WASH.per), say: 'That covers the predicted washes only, so demand would exceed capacity on about half of Saturdays.' },
      { value: Math.ceil((WASH.yhat + tq(WASH.n - 2) * WASH.sePred) / WASH.per), say: 'That uses the top of a two-sided 95% interval (exceeded about 1 time in 40). One Saturday in 10 needs the one-sided bound T.INV(0.9, 38).' },
      { value: Math.floor(washUp / WASH.per), say: 'Round up: a fraction of an attendant short still leaves washes undone.' },
    ],
    solution: `One-sided 90% upper bound: 340 + T.INV(0.9, 38) × 38 = 340 + ${R.tQuantile(0.9, 38).toFixed(3)} × 38 = ${washUp.toFixed(1)} washes; ÷ 25 = ${(washUp / 25).toFixed(2)}, so ${Math.ceil(washUp / 25)} attendants. Fourteen would cover the prediction itself and fall short on about half of such Saturdays.`,
  },
  {
    id: 'b06-pred-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Ana’s weekend model was fitted to Harbourside’s Saturdays and Sundays from 1 July to 31 December 2027, festival days left out, with highs from 33°F to 94°F. For each prediction, decide whether it is inside what the model covers or an extrapolation.',
    items: [
      'A Saturday in October 2028 with a forecast high of 72°F.',
      'A Wednesday in October 2028 with a forecast high of 72°F.',
      'A Sunday in August with a forecast high of 98°F.',
      'A Saturday in December with a forecast high of 40°F.',
      'A Saturday of the harbour festival with a forecast high of 85°F.',
      'Millbrook on a Sunday in September with a forecast high of 70°F.',
    ],
    categories: ['Inside the model’s scope', 'Extrapolation'],
    answer: [0, 1, 1, 0, 1, 1],
    feedback: {
      1: 'The model is for weekends; weekdays at Harbourside have a different base level.',
      2: '98°F is above the warmest day in the data, 94°F.',
      4: 'Festival days were left out; they bring far more people than the weather explains.',
      5: 'The model is Harbourside’s; Millbrook’s trade responds to the weather quite differently.',
    },
    solution: 'A prediction is inside the model’s scope only when x₀ lies within the observed highs and the day is like the days fitted: a Harbourside weekend, not a festival, after the café’s build-up. Weekdays, Millbrook, festivals and 98°F are all extrapolations, even though the formula would give an interval for each. A day in 2028 is in principle outside the period too; Ana should check her 2028 weekends against the line as they come in.',
  },
  {
    id: 'b06-pred-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana keeps adding weekend days to her model for three more years, and the relationship and the day-to-day scatter stay the same. What happens to the two 95% intervals at 80°F?',
    options: [
      'The mean’s interval shrinks towards zero width; the prediction interval only towards about ±1.96 × s.',
      'Both intervals shrink towards zero width, because three more years of data make every prediction almost exact.',
      'The prediction interval shrinks towards zero width; the interval for the mean stays about the same width.',
      'Neither changes, because the width of an interval depends only on s, and the scatter stays the same.',
    ],
    answer: 0,
    feedback: {
      1: 'The new day’s own error, the 1 under the square root, doesn’t shrink with more data.',
      2: 'It is the other way round: the mean’s interval shrinks, the single day’s can’t go below about ±t × s.',
      3: 'The 1/n and (x₀ − x̄)²/Sxx terms shrink as n and Sxx grow, so the interval for the mean narrows.',
    },
    solution: 'As n grows, 1/n and (x₀ − x̄)²/Sxx shrink, and t* approaches 1.96. SE_mean → 0, so the interval for the mean narrows towards nothing; SE_pred → s, so the prediction interval settles at about ±1.96 × 15 transactions. Only a model with smaller residuals would narrow it further.',
  },
  {
    id: 'b06-pred-i5', type: 'num', kind: 'numerical',
    prompt: 'For a simple regression on 49 rows, how many times wider is the 95% prediction interval than the 95% confidence interval for the mean, at x₀ = x̄? Give two decimal places.',
    answer: rnd(Math.sqrt(1 + 1 / 49) / Math.sqrt(1 / 49), 2), check: () => Math.sqrt(50), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(Math.sqrt(49), 2), say: 'Close: the prediction interval’s root is √(1 + 1/49), not √1. The ratio is √(1 + 1/49) ÷ √(1/49) = √50.' },
      { value: 50, say: 'Compare the square roots, not what’s under them: √50.' },
    ],
    solution: 'At x̄ the distance term is 0. The ratio of the half-widths is s√(1 + 1/49) ÷ s√(1/49) = √(49 + 1) = √50 = 7.07: the same t* and s cancel. With more rows the ratio grows: one day’s scatter stays the same while the mean becomes better known.',
  },
  {
    id: 'b06-pred-i6', type: 'mc', kind: 'applied',
    prompt: 'Brackwater Energy (fictional) predicts a household’s winter electricity use from floor area. Its residuals fan out: small homes vary little around the line, large homes a lot. It quotes the same ±420 kWh 95% prediction interval for every home. For which homes is the quoted interval most misleading?',
    options: [
      'Large homes: their scatter is wider than the average s, so the interval is too narrow where misses are biggest.',
      'Small homes: the interval is too wide for them, which means they are the ones most likely to fall outside it.',
      'Homes near the average floor area, because that is where the interval for the mean is narrowest and least reliable.',
      'None: a 95% prediction interval contains 95% of homes by construction, whatever the pattern of residuals.',
    ],
    answer: 0,
    feedback: {
      1: 'Too wide for small homes means they almost always fall inside it, so they rarely miss; the interval wastes margin there instead.',
      2: 'Near x̄ the interval is narrowest because the line is best known there; that is a strength, not a defect.',
      3: 'The 95% is an average over all x under equal spread; with a funnel, coverage is above 95% for small homes and below it for large ones.',
    },
    solution: 'The prediction interval uses one s for every x. With a funnel, s is an average of small and large scatter, so the interval is too wide for small homes (they nearly always fall inside) and too narrow for large ones (they miss more than 5% of the time). The remedy is a model whose errors have equal spread, often after a log transformation (transformations-and-influence), or intervals that allow for the spread at each x.',
  },
];

export const check = [
  {
    id: 'b06-pred-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which question does a confidence interval for the mean response answer?',
    options: [
      'What is the average of y over all cases with this value of x?',
      'Where will the next single case with this value of x fall?',
      'Is the slope of the population line significantly different from zero?',
      'How much of the variation in y around its mean does the line account for?',
    ],
    answer: 0,
    feedback: {
      1: 'One new case is the prediction interval’s question; it adds the case’s own error.',
      2: 'That is the t test of the slope (or its confidence interval).',
      3: 'That is R², which no interval answers.',
    },
    solution: 'The confidence interval for the mean response estimates the height of the population line at x₀: the average of y over all cases with that x. The prediction interval answers the single-case question, and the slope’s test and R² answer the other two.',
  },
  {
    id: 'b06-pred-k2', type: 'num', kind: 'numerical',
    prompt: 'Inchmore Ferries (fictional) fits daily foot passengers on the day’s high: ŷ = −120 + 9.5x, from days with highs between 48°F and 86°F. Predict foot passengers for a day with a high of 72°F.',
    answer: -120 + 9.5 * 72, check: () => 9.5 * 72 - 120, unit: 'passengers', places: 0, tol: 0.5,
    wrong: [
      { value: 9.5 * 72, say: 'Add the intercept, −120: ŷ = b₀ + b₁x₀.' },
      { value: -120 * 72 + 9.5, say: 'The slope multiplies x; the intercept is added once.' },
    ],
    solution: 'ŷ = −120 + 9.5 × 72 = 564 passengers. 72°F is inside the observed 48–86°F, so the prediction is an interpolation; the intercept, −120 passengers at 0°F, is meaningless on its own and only anchors the line.',
  },
  {
    id: 'b06-pred-k3', type: 'formula', kind: 'numerical',
    prompt: `Harbourside’s weekdays, 4 October – 12 November 2027: highs in B2:B${ocLast}, transactions in C2:C${ocLast}. F1 holds a forecast high. In F2, calculate in one formula the upper end of the 95% prediction interval for that day’s transactions.`,
    sheet: ocSheet,
    cell: 'F2', answer: PIU_OC,
    alt: [`=TREND(C2:C${ocLast},B2:B${ocLast},F1)+T.INV.2T(0.05,COUNT(B2:B${ocLast})-2)*STEYX(C2:C${ocLast},B2:B${ocLast})*SQRT(1+1/COUNT(B2:B${ocLast})+(F1-AVERAGE(B2:B${ocLast}))^2/DEVSQ(B2:B${ocLast}))`],
    require: ['STEYX'],
    view: `A1:F${ocLast}`, maxHeight: '20rem', widths: { A: 11, E: 30 }, formats: { F2: '0.0' },
    wrong: [
      { formula: `=FORECAST.LINEAR(F1,C2:C${ocLast},B2:B${ocLast})+T.INV.2T(0.05,COUNT(B2:B${ocLast})-2)*STEYX(C2:C${ocLast},B2:B${ocLast})*SQRT(1/COUNT(B2:B${ocLast})+(F1-AVERAGE(B2:B${ocLast}))^2/DEVSQ(B2:B${ocLast}))`, say: 'That is the upper end for the mean of all such days. One day needs 1+ under the square root.' },
      { formula: `=FORECAST.LINEAR(F1,C2:C${ocLast},B2:B${ocLast})+T.INV(0.95,COUNT(B2:B${ocLast})-2)*STEYX(C2:C${ocLast},B2:B${ocLast})*SQRT(1+1/COUNT(B2:B${ocLast})+(F1-AVERAGE(B2:B${ocLast}))^2/DEVSQ(B2:B${ocLast}))`, say: 'T.INV(0.95, …) is a one-sided 95% bound. The top of a two-sided 95% interval uses T.INV.2T(0.05, …).' },
      { formula: `=FORECAST.LINEAR(F1,C2:C${ocLast},B2:B${ocLast})+T.INV.2T(0.05,COUNT(B2:B${ocLast})-2)*STEYX(C2:C${ocLast},B2:B${ocLast})*SQRT(1+1/COUNT(B2:B${ocLast})+(F1-AVERAGE(B2:B${ocLast}))^2/VAR.S(B2:B${ocLast}))`, say: 'Divide by Sxx, the sum of squared deviations (DEVSQ), not the variance.' },
    ],
    solution: `ŷ + t* × s × √(1 + 1/n + (x₀ − x̄)²/Sxx). At 58°F: ŷ = ${p58.yhat.toFixed(1)}, s = ${FOC.sigma.toFixed(2)}, and the upper end is ${p58.piHigh.toFixed(1)} transactions. In this window the slope is small and not significant (p = ${FOC.coefs[1].p.toFixed(2)}): the prediction interval is mostly the day-to-day scatter, which is what an autumn weekday roster has to cover.`,
  },
  {
    id: 'b06-pred-k4', type: 'mc', kind: 'applied',
    prompt: 'Millbrook’s manager wants to use Ana’s Harbourside weekend model to roster Millbrook’s Saturday, which is forecast at 75°F, “because 75°F is well inside the model’s range”. What should Ana tell her?',
    options: [
      'Being inside the range of x isn’t enough: the model was fitted to Harbourside’s weekends, not Millbrook’s.',
      'The prediction is fine, because 75°F is close to the middle of the data, where both intervals are at their narrowest.',
      'Use it, but widen the prediction interval by 1.96 standard errors to allow for the difference between the cafés.',
      'Use the confidence interval for the mean instead, because Millbrook’s Saturdays are an average of many customers.',
    ],
    answer: 0,
    feedback: {
      1: 'The interval formulas measure uncertainty within Harbourside’s weekends. They can’t see that Millbrook is a different café.',
      2: 'No fixed widening allows for applying a model to a different population; the bias is unknown, not a known amount of noise.',
      3: 'A roster is for one day, which needs the prediction interval; and the interval would still be Harbourside’s.',
    },
    solution: 'Extrapolation is about conditions as well as x. Millbrook is an office-district café whose weekends are quiet and whose trade barely responds to temperature; a model of Harbourside’s weekends tells it nothing reliable. Millbrook needs its own model from its own weekends.',
  },
  {
    id: 'b06-pred-k5', type: 'num', kind: 'numerical',
    prompt: 'A regression fitted to 10,000 rows has s = 20. At x₀ = x̄, what is the half-width of the 95% prediction interval for one new case? Use t* = 1.960 and give one decimal place.',
    answer: rnd(1.96 * 20 * Math.sqrt(1 + 1 / 10000), 1), check: () => 1.96 * 20 * Math.sqrt(1.0001), unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(1.96 * 20 / 100, 2), say: 'That is the confidence interval for the mean, s ÷ √n. One new case keeps its own error: √(1 + 1/n).' },
      { value: 20, say: 'That is s itself; multiply by t* = 1.96 for a 95% half-width.' },
    ],
    solution: 'SE_pred = 20 × √(1 + 1/10,000) ≈ 20.001, so the half-width is 1.96 × 20.001 = 39.2. The interval for the mean at the same x is only ±0.39: ten thousand rows pin the line down, but not the next case.',
  },
  {
    id: 'b06-pred-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true of a 95% prediction interval from a simple regression.',
    options: [
      'It relies on the errors being roughly normal, even in a large sample.',
      'It becomes as narrow as you like if you collect enough rows.',
      'It is too narrow at large x if the residuals fan out as x grows.',
      'It allows for the uncertainty in the estimated line as well as the new case’s own error.',
      'It protects against extrapolation, because it widens away from x̄.',
    ],
    answer: [0, 2, 3],
    feedback: {
      1: 'The 1 under the root never shrinks; the floor is about ±t × s.',
      4: 'The widening allows for uncertainty in the slope within the model; it says nothing about whether the line holds outside the data.',
    },
    solution: 'True: normality matters for one case at any n; a fan of residuals makes the constant-width interval too narrow at the wide end; the formula combines the line’s uncertainty (1/n + (x₀ − x̄)²/Sxx) with the new error (the 1). False: the interval has a floor of about ±t × s, and its widening away from x̄ is not protection against extrapolation.',
  },
];
