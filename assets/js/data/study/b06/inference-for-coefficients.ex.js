// inference-for-coefficients.ex.js — B06 · Inference for coefficients: widgets, practice and the knowledge check (answer
// keys live here). Café data come from case.js (the corrected log): Harbourside's weekend days from 1 July (the lesson's
// fit), Harbourside's weekdays 16 August – 24 September, Millbrook's weekdays 6 September – 15 October and Harbourside's
// June. Brambleby Bakery, Corrieside Car Wash, Marlpit Outdoor, Inchmore Ferries, Saltby Clinic and every other
// business named are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=25';
import * as R from '../../../core/regression.js?v=25';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const label = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${MON[Number(r[at('date')].slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slice = (cafe, from, to, days) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to && (!days || days.includes(r[at('weekday')])) && !r[at('festival')]);
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);
const sheetOf = (rows, yName, yCol, xCol = 'high_f', xName = 'High (°F)') => ({
  A1: 'Day', B1: xName, C1: yName,
  ...col('A', 2, rows.map(label)), ...col('B', 2, rows.map((r) => r[at(xCol)])), ...col('C', 2, rows.map((r) => r[at(yCol)])),
});

// ---------------------------------------------------------------- the lesson's 49 weekend days
const WK = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-07-01' && !r[at('festival')]);
const wx = WK.map((r) => r[at('high_f')]), wy = WK.map((r) => r[at('transactions')]), wr = WK.map((r) => r[at('rain_in')]);
const FW = R.fit(wy, { High: wx });
const wkSheet = {
  cells: {
    ...sheetOf(WK, 'Transactions', 'transactions'),
    F1: 'Slope b₁', G1: '=SLOPE(C2:C50,B2:B50)',
    F2: 'Intercept b₀', G2: '=INTERCEPT(C2:C50,B2:B50)',
    F3: 'n (days)', G3: '=COUNT(B2:B50)',
    F4: 's (STEYX)', G4: '=STEYX(C2:C50,B2:B50)',
    F5: 'Sxx (DEVSQ)', G5: '=DEVSQ(B2:B50)',
    F6: 'SE(b₁)', G6: '=G4/SQRT(G5)',
    F7: 't for β₁ = 0', G7: '=G1/G6',
    F8: 'p, two-sided', G8: '=T.DIST.2T(ABS(G7),G3-2)',
    F9: 'Confidence level', G9: 0.95,
    F10: 'Lower limit', G10: '=G1-T.INV.2T(1-G9,G3-2)*G6',
    F11: 'Upper limit', G11: '=G1+T.INV.2T(1-G9,G3-2)*G6',
    F12: 'SE(b₁) from LINEST', G12: '=INDEX(LINEST(C2:C50,B2:B50,TRUE,TRUE),2,1)',
  },
};

// ---------------------------------------------------------------- guided 1: Harbourside weekdays, 16 August – 24 September
const AS = slice('Harbourside', '2027-08-16', '2027-09-24', WD);
const FAS = R.fit(AS.map((r) => r[at('transactions')]), { High: AS.map((r) => r[at('high_f')]) });
const asCells = { ...sheetOf(AS, 'Transactions', 'transactions'), E1: 'Slope b₁', F1: '=SLOPE(C2:C31,B2:B31)', E2: 'SE(b₁)', E3: 't', E4: 'p, two-sided' };
const SE_F = '=STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))';

// ---------------------------------------------------------------- independent 1: Millbrook weekdays, 6 September – 15 October
const MS = slice('Millbrook', '2027-09-06', '2027-10-15', WD);
const FMS = R.fit(MS.map((r) => r[at('footfall')]), { High: MS.map((r) => r[at('high_f')]) });
const msSheet = { cells: { ...sheetOf(MS, 'Footfall', 'footfall'), E1: 'Confidence level', F1: 0.95, E2: 'Lower limit for β₁' }, vary: { F1: [0.9, 0.99] } };

// ---------------------------------------------------------------- check 3: Harbourside, June
const JU = slice('Harbourside', '2027-06-01', '2027-06-30');
const FJU = R.fit(JU.map((r) => r[at('footfall')]), { High: JU.map((r) => r[at('high_f')]) });
const juSheet = { cells: { ...sheetOf(JU, 'Footfall', 'footfall'), E1: 'p-value for the slope' } };
const P_ONE = '=T.DIST.2T(ABS(SLOPE(C2:C31,B2:B31)/(STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31)))),COUNT(B2:B31)-2)';

// ---------------------------------------------------------------- small inputs
const BAKE = { b: 14.2, se: 4.1, n: 26 };
const ANOVA = { ssr: 4820, sse: 6300, n: 32 };
const WASH = { b: 9.4, se: 1.1, n: 40, h0: 12 };
const FERRY = { s: 12, n: 25, xbar: 65, sxx: 2500 };
const CLINIC = { b: -3.6, se: 1.5, n: 22 };
const ROW = { b: 0.42, se: 0.2, n: 20 };

export const widgets = {
  'inf-weekends': {
    type: 'regression',
    title: 'Transactions on the day’s high: Harbourside weekends, 1 July – 31 December 2027 (49 days, festival days left out)',
    y: { name: 'Transactions', values: wy },
    xs: [{ name: 'High (°F)', values: wx }, { name: 'Rain (in)', values: wr }],
    picked: [0],
    note: `With High alone: b₁ = ${FW.coefs[1].estimate.toFixed(3)} transactions per °F, SE ${FW.coefs[1].se.toFixed(3)}, t = ${FW.coefs[1].t.toFixed(2)} on ${FW.df} df, and F = t² = ${FW.F.toFixed(2)}. The P-value tests β₁ = 0 only. The 49 days come from the second half of the year, after Harbourside’s build-up, and their residuals in date order are close to independent, so these standard errors can be believed; a fit to all 306 days would mix weekdays with weekends and include the build-up. Adding Rain is multiple regression (module 3): watch the residual standard error, and the temperature slope’s standard error, fall.`,
  },
  'inf-se': {
    type: 'formula',
    title: 'What makes a slope precise: SE(b₁) = s ÷ √Sxx',
    intro: 'Sxx = (n − 1) × the variance of x, so the spread of x enters through its standard deviation.',
    inputs: [
      { id: 'b', label: 'Slope b₁', min: 0, max: 3, step: 0.01, value: 1, fmt: 'num' },
      { id: 's', label: 'Residual standard error s', min: 5, max: 40, step: 0.1, value: 15.2, fmt: 'num' },
      { id: 'n', label: 'Rows n', min: 5, max: 300, step: 1, value: 49, fmt: 'int' },
      { id: 'sdx', label: 'Standard deviation of x', min: 2, max: 30, step: 0.1, value: 16.8, fmt: 'num' },
    ],
    compute: (v) => {
      const se = v.s / (v.sdx * Math.sqrt(v.n - 1)), df = v.n - 2, t = v.b / se, p = R.tPTwo(t, df), half = tq(df) * se;
      const ns = [10, 20, 50, 100, 200, 300];
      return {
        headline: { label: 'Standard error of the slope', value: se.toFixed(4) },
        rows: [
          ['Sxx = (n − 1) × SD(x)²', (v.sdx ** 2 * (v.n - 1)).toFixed(0)],
          ['t for β₁ = 0', t.toFixed(2)],
          ['Two-sided p-value', p < 0.001 ? 'below 0.001' : p.toFixed(3)],
          ['95% interval for β₁', `${fx(v.b - half)} to ${fx(v.b + half)}`],
        ],
        note: p <= 0.05
          ? `The interval excludes 0, so the slope is significant at 5%. Its half-width, ${half.toFixed(3)}, is what to judge for practical use.`
          : `The interval includes 0, so the test can’t reject β₁ = 0 at 5%; the data are also compatible with slopes up to ${fx(v.b + half)}.`,
        chart: { kind: 'line', x: { label: 'Rows n', values: ns }, series: [{ name: '95% half-width at these s and SD(x)', values: ns.map((m) => Number((tq(m - 2) * v.s / (v.sdx * Math.sqrt(m - 1))).toFixed(4))) }], y: { label: 'Half-width of the interval' } },
      };
    },
  },
  'inf-sheet': {
    type: 'sheet',
    title: 'Inference for the slope in Excel: Harbourside weekends',
    sheet: wkSheet,
    view: 'A1:G50',
    maxHeight: '22rem',
    editable: ['C2:C50', 'G9'],
    formats: { G1: '0.0000', G2: '0.00', G4: '0.00', G5: '#,##0', G6: '0.0000', G7: '0.00', G8: '0.000000', G9: '0%', G10: '0.000', G11: '0.000', G12: '0.0000' },
    widths: { A: 11, F: 20 },
    tools: ['formulas', 'reset'],
    note: `G6 and G12 agree: STEYX ÷ √DEVSQ is what LINEST’s second row reports. Set G9 to 0.99 and the interval widens to ${fx(FW.coefs[1].estimate - tq(47, 0.99) * FW.coefs[1].se)} to ${fx(FW.coefs[1].estimate + tq(47, 0.99) * FW.coefs[1].se)}; still well clear of 0.`,
  },
};

export const guided = [
  {
    id: 'b06-inf-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harbourside’s weekdays, 16 August – 24 September 2027: the day’s high in B2:B31 and transactions in C2:C31. F1 holds the slope. Test H₀: β₁ = 0 against H₁: β₁ ≠ 0 at α = 0.05.',
    solution: `SE(b₁) = STEYX ÷ √DEVSQ = ${FAS.coefs[1].se.toFixed(4)}; t = ${FAS.coefs[1].estimate.toFixed(3)} ÷ ${FAS.coefs[1].se.toFixed(4)} = ${FAS.coefs[1].t.toFixed(2)} on 28 df; p = ${FAS.coefs[1].p.toFixed(4)}. Reject H₀: warmer weekdays in this stretch went with more transactions, about ${FAS.coefs[1].estimate.toFixed(2)} per °F (95% interval ${FAS.coefs[1].low.toFixed(2)} to ${FAS.coefs[1].high.toFixed(2)}). The days are consecutive, so check the residuals in date order before trusting p: here one day’s residual and the next correlate at ${fx(R.lag1(Array.from(FAS.resid)), 2)}, so there is no sign that neighbouring days repeat each other and make p too small. The high drifts down through the window, but it is dependence in the errors, not in x, that would matter.`,
    steps: [
      {
        id: 'b06-inf-g1-s1', type: 'formula',
        prompt: 'In F2, calculate the standard error of the slope from STEYX and DEVSQ.',
        sheet: { cells: asCells },
        cell: 'F2', answer: SE_F,
        alt: ['=INDEX(LINEST(C2:C31,B2:B31,TRUE,TRUE),2,1)', '=STEYX(C2:C31,B2:B31)/STDEV.S(B2:B31)/SQRT(COUNT(B2:B31)-1)'],
        view: 'A1:F31', maxHeight: '20rem', widths: { A: 11 }, formats: { F1: '0.0000', F2: '0.0000' },
        wrong: [
          { formula: '=STEYX(C2:C31,B2:B31)/DEVSQ(B2:B31)', say: 'Divide s by the square root of Sxx: SQRT(DEVSQ(B2:B31)).' },
          { formula: '=STEYX(C2:C31,B2:B31)/SQRT(COUNT(B2:B31))', say: 's ÷ √n is the standard error of a mean. The slope’s standard error divides s by √Sxx, the spread of the highs.' },
          { formula: '=STEYX(B2:B31,C2:C31)/SQRT(DEVSQ(B2:B31))', say: 'STEYX takes known_y’s first: STEYX(C2:C31,B2:B31). Swapped, it measures the residuals of the regression of the high on transactions.' },
        ],
        hints: ['SE(b₁) = s ÷ √Sxx, with s from STEYX and Sxx from DEVSQ of the x column.', '<x>=STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))</x>'],
      },
      {
        id: 'b06-inf-g1-s2', type: 'formula',
        prompt: 'In F3, calculate the t statistic for H₀: β₁ = 0 from F1 and F2.',
        sheet: { cells: { ...asCells, F2: SE_F } },
        cell: 'F3', answer: '=F1/F2',
        view: 'A1:F31', maxHeight: '20rem', widths: { A: 11 }, formats: { F1: '0.0000', F2: '0.0000', F3: '0.00' },
        wrong: [
          { formula: '=F2/F1', say: 't is the estimate divided by its standard error, not the other way round.' },
          { formula: '=F1/F2*SQRT(COUNT(B2:B31))', say: 'The standard error already allows for n. t = b₁ ÷ SE(b₁), nothing more.' },
        ],
        hints: ['t = (b₁ − 0) ÷ SE(b₁).'],
      },
      {
        id: 'b06-inf-g1-s3', type: 'formula',
        prompt: 'In F4, calculate the two-sided p-value from the t in F3.',
        sheet: { cells: { ...asCells, F2: SE_F, F3: '=F1/F2' } },
        cell: 'F4', answer: '=T.DIST.2T(ABS(F3),COUNT(B2:B31)-2)',
        alt: ['=T.DIST.2T(ABS(F3),28)', '=2*T.DIST.RT(ABS(F3),COUNT(B2:B31)-2)', '=2*(1-T.DIST(ABS(F3),COUNT(B2:B31)-2,TRUE))'],
        view: 'A1:F31', maxHeight: '20rem', widths: { A: 11 }, formats: { F1: '0.0000', F2: '0.0000', F3: '0.00', F4: '0.0000' },
        wrong: [
          { formula: '=T.DIST.2T(ABS(F3),COUNT(B2:B31)-1)', say: 'A simple regression estimates two coefficients, so the degrees of freedom are n − 2 = 28.' },
          { formula: '=T.DIST.RT(ABS(F3),COUNT(B2:B31)-2)', say: 'That is one tail. The alternative β₁ ≠ 0 is two-sided: T.DIST.2T.' },
        ],
        hints: ['Two-sided, on n − 2 degrees of freedom.', '<x>=T.DIST.2T(ABS(F3),COUNT(B2:B31)-2)</x>'],
      },
      {
        id: 'b06-inf-g1-s4', type: 'mc',
        prompt: `The test gives t = ${FAS.coefs[1].t.toFixed(2)} and p = ${FAS.coefs[1].p.toFixed(4)}. Which conclusion should Ana write?`,
        options: [
          'Warmer weekdays went with more transactions here; the days are consecutive, so check residuals by date.',
          'Each degree warmer causes exactly one more transaction on Harbourside’s weekdays, whatever the time of year.',
          'There is a 99.9% probability that the population slope is positive, so no further checks are needed.',
          'The slope is significant, so the line will predict each weekday’s transactions to within a few transactions.',
        ],
        answer: 0,
        hints: ['A test speaks about evidence for β₁ ≠ 0 under its conditions. Which condition needs checking for consecutive days?'],
        feedback: {
          1: 'A regression slope is an association with an interval, not an exact causal rate, and it describes this window of days only.',
          2: '1 − p is not the probability that the alternative is true, and a small p doesn’t remove the need to check independence.',
          3: 'Significance says nothing about how close single predictions are: that is the residual standard error’s job, and the next lesson’s prediction interval.',
        },
      },
    ],
  },
  {
    id: 'b06-inf-g2', type: 'num', kind: 'numerical',
    prompt: `Brambleby Bakery (fictional) regresses weekly sourdough loaves sold on the number of local events that week, over ${BAKE.n} weeks: b₁ = ${BAKE.b} loaves per event, SE(b₁) = ${BAKE.se}. Calculate the upper end of the 95% confidence interval for β₁, to two decimal places.`,
    answer: rnd(BAKE.b + tq(BAKE.n - 2) * BAKE.se, 2), check: () => BAKE.b + R.tQuantile(0.975, 24) * BAKE.se, unit: 'loaves per event', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(BAKE.b + 1.96 * BAKE.se, 2), say: 'That uses the normal 1.96. With 26 weeks the critical value comes from the t distribution on n − 2 = 24 df: T.INV.2T(0.05,24) = 2.064.' },
      { value: rnd(BAKE.b + BAKE.se, 2), say: 'That adds one standard error. A 95% interval adds the critical t times the standard error.' },
      { value: rnd(BAKE.b + tq(BAKE.n - 2) * BAKE.se / Math.sqrt(BAKE.n), 2), say: 'The standard error of the slope already allows for the number of weeks; don’t divide by √n again.' },
    ],
    hints: ['b₁ + t* × SE(b₁), with t* on n − 2 degrees of freedom.', `t* = <x>=T.INV.2T(0.05,24)</x> = ${tq(24).toFixed(3)}.`],
    solution: `t* = T.INV.2T(0.05, 24) = ${tq(24).toFixed(3)}; upper limit = ${BAKE.b} + ${tq(24).toFixed(3)} × ${BAKE.se} = ${(BAKE.b + tq(24) * BAKE.se).toFixed(2)} loaves per event. The lower limit is ${(BAKE.b - tq(24) * BAKE.se).toFixed(2)}: each event goes with somewhere between about 6 and 23 extra loaves, a wide range from 26 weeks.`,
  },
  {
    id: 'b06-inf-g3', type: 'num', kind: 'numerical',
    prompt: `A simple regression on ${ANOVA.n} rows has a regression sum of squares of ${ANOVA.ssr.toLocaleString('en-US')} and a residual sum of squares of ${ANOVA.sse.toLocaleString('en-US')}. What is the absolute value of the slope’s t statistic? Give two decimal places.`,
    answer: rnd(Math.sqrt(ANOVA.ssr / (ANOVA.sse / (ANOVA.n - 2))), 2), check: () => Math.sqrt((4820 / 1) / (6300 / 30)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(ANOVA.ssr / (ANOVA.sse / (ANOVA.n - 2)), 2), say: 'That is F. With one predictor F = t², so |t| = √F.' },
      { value: rnd(Math.sqrt(ANOVA.ssr / (ANOVA.sse / (ANOVA.n - 1))), 2), say: 'The residual mean square divides SSE by n − 2 = 30, not n − 1.' },
      { value: rnd(Math.sqrt(ANOVA.ssr / ANOVA.sse), 2), say: 'F compares mean squares, not sums of squares: divide SSE by its 30 degrees of freedom first.' },
    ],
    hints: ['MSE = SSE ÷ (n − 2); F = SSR ÷ MSE.', 'With one predictor, |t| = √F.'],
    solution: `MSE = 6,300 ÷ 30 = 210; F = 4,820 ÷ 210 = ${(4820 / 210).toFixed(2)}; |t| = √${(4820 / 210).toFixed(2)} = ${Math.sqrt(4820 / 210).toFixed(2)}. The ANOVA table’s F test and the slope’s t test are the same test when there is one predictor, so their p-values agree.`,
  },
  {
    id: 'b06-inf-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana wants a more precise estimate of how Millbrook’s winter footfall changes with the day’s high. Which plan does most to shrink SE(b₁), if the residual spread stays the same?',
    options: [
      'Include days across the widest range of highs she can, from the coldest days to mild ones.',
      'Record ten more days, choosing days whose highs are all close to the season’s average.',
      'Report a 99% interval instead of a 95% one, so that the population slope is more certainly inside.',
      'Copy each winter day into the data twice, so that the regression has twice as many rows.',
    ],
    answer: 0,
    hints: ['SE(b₁) = s ÷ √Sxx. What raises Sxx most?', 'Days near the mean add almost nothing to Σ(x − x̄)².'],
    feedback: {
      1: 'Days at the average high add rows but almost no Sxx, so they barely help; the slope is learned from days that differ in x.',
      2: 'A 99% interval is wider, not more precise: the standard error is unchanged and the critical t is larger.',
      3: 'Duplicated rows are not new evidence. The formula would halve the variance and report a falsely small standard error: the dependence trap in its purest form.',
    },
    solution: 'SE(b₁) = s ÷ √Sxx, and Sxx = Σ(x − x̄)² grows fastest when x is spread out. Extra days near the average high add little; duplicating rows fakes precision; a higher confidence level widens the interval. A wide range of highs is the design that pins down the slope.',
  },
];

export const independent = [
  {
    id: 'b06-inf-i1', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook’s weekdays, 6 September – 15 October 2027: the day’s high in B2:B31 and footfall in C2:C31. F1 holds the confidence level. In F2, calculate in one formula the lower limit of the confidence interval for the slope.',
    sheet: msSheet,
    cell: 'F2', answer: '=SLOPE(C2:C31,B2:B31)-T.INV.2T(1-F1,COUNT(B2:B31)-2)*STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))',
    alt: ['=INDEX(LINEST(C2:C31,B2:B31),1)-T.INV.2T(1-F1,COUNT(B2:B31)-2)*INDEX(LINEST(C2:C31,B2:B31,TRUE,TRUE),2,1)'],
    require: ['T.INV.2T'],
    view: 'A1:F31', maxHeight: '20rem', widths: { A: 11, E: 18 }, formats: { F1: '0%', F2: '0.000' },
    wrong: [
      { formula: '=SLOPE(C2:C31,B2:B31)-T.INV.2T(F1,COUNT(B2:B31)-2)*STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))', say: 'T.INV.2T takes the two-tailed probability, 1 − confidence (0.05 for 95%), not the confidence level itself.' },
      { formula: '=SLOPE(C2:C31,B2:B31)-T.INV.2T(1-F1,COUNT(B2:B31)-1)*STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))', say: 'A slope’s interval uses n − 2 degrees of freedom.' },
      { formula: '=SLOPE(C2:C31,B2:B31)-NORM.S.INV(1-(1-F1)/2)*STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))', say: 'With s estimated from the data, the critical value comes from the t distribution, not the normal: T.INV.2T.' },
      { formula: '=SLOPE(C2:C31,B2:B31)-T.INV.2T(1-F1,COUNT(B2:B31)-2)*STEYX(C2:C31,B2:B31)/SQRT(COUNT(B2:B31))', say: 'The slope’s standard error divides s by √Sxx (DEVSQ of the highs), not by √n.' },
    ],
    solution: `<x>=SLOPE(C2:C31,B2:B31)-T.INV.2T(1-F1,COUNT(B2:B31)-2)*STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31))</x>. At 95%: b₁ = ${FMS.coefs[1].estimate.toFixed(3)} people per °F, SE ${FMS.coefs[1].se.toFixed(3)}, so the interval runs from ${fx(FMS.coefs[1].low)} to ${fx(FMS.coefs[1].high)}. It includes 0 (p = ${FMS.coefs[1].p.toFixed(3)}): six weeks of Millbrook’s weekdays can’t show any temperature effect, which fits a café whose trade comes from offices; the interval still allows anything from a slightly negative slope to about ${FMS.coefs[1].high.toFixed(1)} people per °F.`,
  },
  {
    id: 'b06-inf-i2', type: 'num', kind: 'numerical',
    prompt: `Corrieside Car Wash (fictional) regresses daily washes on the day’s high over ${WASH.n} days: b₁ = ${WASH.b} washes per °F, SE(b₁) = ${WASH.se}. A franchise manual says each degree brings ${WASH.h0} washes. Calculate the t statistic for H₀: β₁ = ${WASH.h0}, to two decimal places.`,
    answer: rnd((WASH.b - WASH.h0) / WASH.se, 2), check: () => (9.4 - 12) / 1.1, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(WASH.b / WASH.se, 2), say: 'That is the t for β₁ = 0, the number software prints. To test 12, subtract it first: (9.4 − 12) ÷ 1.1.' },
      { value: rnd((WASH.h0 - WASH.b) / WASH.se, 2), say: 'The statistic is (estimate − hypothesised value) ÷ SE, so it is negative when the estimate is below 12.' },
    ],
    solution: `t = (9.4 − 12) ÷ 1.1 = ${fx((WASH.b - WASH.h0) / WASH.se, 2)} on 38 df; two-sided p = ${R.tPTwo((WASH.b - WASH.h0) / WASH.se, 38).toFixed(3)}. The data are inconsistent with the manual’s 12 washes per °F at 5%: the 95% interval, ${(WASH.b - tq(38) * WASH.se).toFixed(1)} to ${(WASH.b + tq(38) * WASH.se).toFixed(1)}, sits below it.`,
  },
  {
    id: 'b06-inf-i3', type: 'mc', kind: 'applied',
    prompt: 'Marlpit Outdoor (fictional), an online retailer, regresses basket value on page-load time across 1.8 million sessions: b₁ = −$0.04 per extra second of load time, 95% interval −$0.05 to −$0.03, p below 0.001. Baskets average $62. A vendor offers to cut load times by one second for $400,000 a year, citing “a highly significant effect on revenue”. What is the best reading?',
    options: [
      'The effect is real but about 4 cents a basket; whether $400,000 pays depends on basket numbers, not the p-value.',
      'With p below 0.001 the case is proven: speeding up the site will raise each basket’s value by a dependable amount.',
      'With 1.8 million sessions every test comes out significant, so the result should simply be ignored.',
      'The slope is negative, so slower pages must make customers spend more, and the retailer should leave the site as it is.',
    ],
    answer: 0,
    feedback: {
      1: 'Significance only says the slope isn’t 0. The size, 3 to 5 cents a basket, is what decides the purchase, and an association isn’t proof that speed causes spending.',
      2: 'Large samples detect small real effects; the problem isn’t the p-value but treating it as a measure of size.',
      3: 'A negative slope means slower loading goes with smaller baskets, not larger ones.',
    },
    solution: 'The interval says one second of load time goes with 3 to 5 cents of basket value: under 0.1% of $62. Whether the $400,000 is worth it depends on how many baskets a year that applies to (and on whether faster pages also bring more baskets, which this regression doesn’t measure), and a regression on observational sessions can’t show that cutting load time would cause the change. “Highly significant” is a statement about 1.8 million sessions, not about value.',
  },
  {
    id: 'b06-inf-i4', type: 'classify', kind: 'conceptual',
    prompt: 'For each regression, decide whether the usual standard errors are trustworthy as far as independence goes, or likely too small.',
    items: [
      'Sales on advertising for 30 branches in one city, each measured on the same 10 days, when a sunny day lifts every branch at once.',
      'Transactions on the high for 49 weekend days whose residuals in date order correlate at 0.03.',
      'Footfall on the high for 220 consecutive weekdays whose residuals correlate at 0.23 from one day to the next.',
      'Spending on age for 400 customers drawn at random from a loyalty list, each surveyed once.',
      'A store’s weekly sales on advertising over three years, with a strong Christmas season left out of the model.',
    ],
    categories: ['Independence plausible', 'Standard errors likely too small'],
    answer: [1, 0, 1, 0, 1],
    feedback: {
      0: 'Branches on the same day move together (a sunny day lifts them all), so the 300 rows hold far fewer independent observations than the formula assumes.',
      2: 'Positively correlated residuals mean neighbouring days repeat each other, so the formula overstates the evidence.',
      4: 'An omitted season makes the residuals of nearby weeks alike (and may bias the slope too).',
    },
    solution: 'Dependence comes from shared units (branches on the same day), from time (neighbouring days and weeks), and from omitted patterns that make nearby residuals alike (a season). When the related rows resemble each other, as in all three of these, the formula’s standard errors are too small. (Rows that offset each other, like Harbourside and Millbrook on the same day, can make them too large instead: the lesson’s pooled rain example.) Rows with near-zero residual autocorrelation, or a random sample of different people, give no such warning.',
  },
  {
    id: 'b06-inf-i5', type: 'num', kind: 'numerical',
    prompt: `Inchmore Ferries (fictional) regresses daily foot passengers on the day’s high over ${FERRY.n} days: s = ${FERRY.s} passengers, x̄ = ${FERRY.xbar}°F and Sxx = ${FERRY.sxx.toLocaleString('en-US')}. Calculate the standard error of the intercept, to two decimal places.`,
    answer: rnd(FERRY.s * Math.sqrt(1 / FERRY.n + FERRY.xbar ** 2 / FERRY.sxx), 2), check: () => 12 * Math.sqrt(1 / 25 + 4225 / 2500), unit: 'passengers', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(FERRY.s / Math.sqrt(FERRY.sxx), 2), say: 'That is the slope’s standard error. The intercept’s is s√(1/n + x̄²/Sxx).' },
      { value: rnd(FERRY.s * Math.sqrt(1 / FERRY.n), 2), say: 'You left out the x̄²/Sxx term, which grows the further 0 lies from the data.' },
      { value: rnd(FERRY.s * (1 / FERRY.n + FERRY.xbar ** 2 / FERRY.sxx), 2), say: 'Take the square root of 1/n + x̄²/Sxx before multiplying by s.' },
    ],
    solution: `SE(b₀) = 12 × √(1/25 + 65²/2,500) = 12 × √(0.04 + 1.69) = 12 × ${Math.sqrt(1.73).toFixed(4)} = ${(12 * Math.sqrt(1.73)).toFixed(2)} passengers. Most of it comes from x̄²/Sxx: 0°F is far from the data, so the intercept is poorly pinned down, and at 0°F a ferry timetable may not even run.`,
  },
  {
    id: 'b06-inf-i6', type: 'mc', kind: 'conceptual',
    prompt: `A ToolPak output on ${ROW.n} rows reads, for the slope: Coefficient ${ROW.b}, Standard Error ${ROW.se}, t Stat ${(ROW.b / ROW.se).toFixed(2)}, P-value ${R.tPTwo(ROW.b / ROW.se, ROW.n - 2).toFixed(4)}, Lower 95% ${fx(ROW.b - tq(ROW.n - 2) * ROW.se, 4)}, Upper 95% ${(ROW.b + tq(ROW.n - 2) * ROW.se).toFixed(4)}. Which statement is correct?`,
    options: [
      'The result sits on the 5% boundary: p just above 0.05 and an interval reaching just below 0 say the same thing.',
      'The output contradicts itself: a slope of 0.42 with p near 0.05 must have an interval that excludes 0.',
      'The slope is not significant, so the true slope is 0 and the X variable can be dropped from every future model.',
      'The lower limit is almost exactly 0, which proves that the population slope lies between 0 and 0.84.',
    ],
    answer: 0,
    feedback: {
      1: 'The interval and the two-sided test always agree at the same level: p above 0.05 goes with a 95% interval containing 0, however narrowly.',
      2: 'Not rejecting β₁ = 0 doesn’t make 0 the true value; slopes up to about 0.84 are just as compatible with the data.',
      3: 'A 95% interval is not a proof; and here it actually reaches slightly below 0.',
    },
    solution: `t = 0.42 ÷ 0.20 = 2.10 on 18 df gives p = ${R.tPTwo(2.1, 18).toFixed(4)}, a hair above 0.05, and the interval 0.42 ± ${tq(18).toFixed(3)} × 0.20 runs from ${fx(ROW.b - tq(18) * ROW.se, 4)} to ${(ROW.b + tq(18) * ROW.se).toFixed(4)}, a hair below 0. They are the same result. Report the interval; a slope anywhere from about 0 to 0.84 is compatible with these data.`,
  },
];

export const check = [
  {
    id: 'b06-inf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In the population model y = β₀ + β₁x + ε, what does ε stand for?',
    options: [
      'How far one case’s y lies from the population line, for every reason x leaves out.',
      'The residual e = y − ŷ calculated from the fitted least-squares line of the sample.',
      'The standard error of the slope, which measures how far b₁ lies from β₁ in repeated samples.',
      'The measurement mistakes made when y is recorded, such as a figure typed with an extra digit.',
    ],
    answer: 0,
    feedback: {
      1: 'The residual e is the sample’s estimate of the error, measured from the fitted line; ε is measured from the unknown population line.',
      2: 'SE(b₁) describes the slope’s sampling variation; ε is about individual cases.',
      3: 'Recording slips are part of it at most; ε covers everything that moves y apart from x: weather, events, chance.',
    },
    solution: 'ε is the error: the distance of a case from the population line β₀ + β₁x, collecting every influence on y that the line leaves out. The residuals estimate the errors; the conditions (independence, normality, equal variance) are assumptions about ε.',
  },
  {
    id: 'b06-inf-k2', type: 'num', kind: 'numerical',
    prompt: `Saltby Clinic (fictional) regresses patient satisfaction (0–100) on minutes waited, across ${CLINIC.n} days: b₁ = ${CLINIC.b} points per minute, SE(b₁) = ${CLINIC.se}. Calculate the two-sided p-value for H₀: β₁ = 0, to three decimal places.`,
    answer: rnd(R.tPTwo(CLINIC.b / CLINIC.se, CLINIC.n - 2), 3), check: () => R.tPTwo(2.4, 20), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(R.tPTwo(CLINIC.b / CLINIC.se, CLINIC.n - 2) / 2, 3), say: 'That is one tail. The alternative β₁ ≠ 0 is two-sided.' },
      { value: rnd(2 * (1 - R.normCdf(Math.abs(CLINIC.b / CLINIC.se))), 3), say: 'That uses the normal distribution; with s estimated from 22 days the statistic follows t on 20 df.' },
    ],
    solution: `t = −3.6 ÷ 1.5 = −2.40 on 20 df; <x>=T.DIST.2T(2.4,20)</x> = ${R.tPTwo(2.4, 20).toFixed(3)}. Significant at 5%: longer waits went with lower satisfaction, about 3.6 points a minute (95% interval ${fx(CLINIC.b - tq(20) * CLINIC.se, 2)} to ${fx(CLINIC.b + tq(20) * CLINIC.se, 2)}).`,
  },
  {
    id: 'b06-inf-k3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 1–30 June 2027: the day’s high in B2:B31 and footfall in C2:C31. In F1, calculate in one formula the two-sided p-value for H₀: β₁ = 0.',
    sheet: juSheet,
    cell: 'F1', answer: P_ONE,
    alt: ['=T.DIST.2T(ABS(SLOPE(C2:C31,B2:B31)/INDEX(LINEST(C2:C31,B2:B31,TRUE,TRUE),2,1)),COUNT(B2:B31)-2)', '=T.DIST.2T(ABS(CORREL(B2:B31,C2:C31)*SQRT(COUNT(B2:B31)-2)/SQRT(1-RSQ(C2:C31,B2:B31))),COUNT(B2:B31)-2)'],
    require: ['T.DIST.2T'],
    view: 'A1:F31', maxHeight: '20rem', widths: { A: 11, E: 20 }, formats: { F1: '0.0000' },
    wrong: [
      { formula: '=T.DIST.2T(ABS(SLOPE(C2:C31,B2:B31)/(STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31)))),COUNT(B2:B31)-1)', say: 'The degrees of freedom are n − 2 for a simple regression.' },
      { formula: '=T.DIST.2T(ABS(SLOPE(C2:C31,B2:B31)/(STEYX(C2:C31,B2:B31)/SQRT(COUNT(B2:B31)))),COUNT(B2:B31)-2)', say: 'SE(b₁) divides s by √Sxx, DEVSQ of the highs, not by √n.' },
      { formula: '=T.DIST.RT(ABS(SLOPE(C2:C31,B2:B31)/(STEYX(C2:C31,B2:B31)/SQRT(DEVSQ(B2:B31)))),COUNT(B2:B31)-2)', say: 'T.DIST.RT is one tail; the test is two-sided.' },
    ],
    solution: `b₁ = ${FJU.coefs[1].estimate.toFixed(2)} people per °F, SE ${FJU.coefs[1].se.toFixed(3)}, t = ${FJU.coefs[1].t.toFixed(2)} on 28 df, p = ${FJU.coefs[1].p.toFixed(4)}. Significant at 5%, but treat it with care: June’s days run in sequence, mix weekends with weekdays (which adds a lot of residual spread), and fall in the café’s build-up period, when trade was still growing as the weather warmed.`,
  },
  {
    id: 'b06-inf-k4', type: 'mc', kind: 'applied',
    prompt: 'A colleague fits footfall on rain to all 612 rows of the café log (both cafés, 306 days) and reports “−62 people per inch, SE 18.0, p &lt; 0.001: rain clearly costs both cafés customers.” On the same day the two cafés’ residuals correlate at −0.43. What is wrong with the standard error?',
    options: [
      'It treats each day’s two rows as independent; their residuals offset each other, so here it is too large.',
      'Rain is zero on most days, so the slope can’t be estimated properly and its standard error is meaningless.',
      'It is too small, because each day’s rain is counted twice and the 612 rows hold only 306 independent days.',
      'Nothing at all: 612 rows is a large sample, so the standard error and the p-value can be taken at face value.',
    ],
    answer: 0,
    feedback: {
      1: 'Zero-heavy x makes the regression contrast dry days with wet ones, but the slope and its SE are still defined.',
      2: 'Counting each day twice is the problem, but its direction depends on how the two rows are related. Negatively correlated residuals (one café busy when the other is quiet) make the formula’s SE too large, not too small.',
      3: 'A large n helps only if the rows are independent. Here the two rows of each day are related.',
    },
    solution: 'The formula treats 612 rows as 612 independent observations, but each day’s rain is entered twice and the two cafés’ residuals on a day are related: they correlate at −0.43, because Harbourside is busy at weekends and Millbrook on weekdays. Offsetting residuals make the formula’s standard error too large: a day-clustered standard error is about 9.7, half of 18.0. Either way the printed SE is wrong. Fit each café separately (Harbourside −81 people per inch, Millbrook −43, not significant at 5%) and say how the rows were treated.',
  },
  {
    id: 'b06-inf-k5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about a simple regression’s output.',
    text: 'The slope’s t statistic has [[0]] degrees of freedom. The ANOVA table’s F equals [[1]], so Significance F is [[2]] the slope’s P-value. Keeping s and n fixed, a wider spread of x makes SE(b₁) [[3]].',
    blanks: [
      { options: ['n − 1', 'n − 2', 'n'], answer: 1 },
      { options: ['t', 't²', '√t'], answer: 1 },
      { options: ['the same as', 'half', 'double'], answer: 0 },
      { options: ['larger', 'unchanged', 'smaller'], answer: 2 },
    ],
    solution: 'A simple regression estimates two coefficients, so t has n − 2 df. With one predictor F = t² and the F test is the same test as the slope’s t test, with the same p-value. SE(b₁) = s ÷ √Sxx, and a wider spread of x raises Sxx, so the standard error falls.',
  },
  {
    id: 'b06-inf-k6', type: 'num', kind: 'numerical',
    prompt: 'A regression on 26 days gives SE(b₁) = 0.30. If Ana collected 101 days with the same residual standard error and the same standard deviation of x, what would SE(b₁) be? Give two decimal places.',
    answer: rnd(0.3 * Math.sqrt(25 / 100), 2), check: () => 0.3 * Math.sqrt((26 - 1) / (101 - 1)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: rnd(0.3 * 25 / 100, 3), say: 'The standard error shrinks with the square root of Sxx, not in proportion to it: multiply by √(25/100).' },
    ],
    solution: 'Sxx = (n − 1) × SD(x)², so Sxx rises from 25 SD² to 100 SD², four times as much. SE(b₁) = s ÷ √Sxx falls by √4 = 2: 0.30 ÷ 2 = 0.15. Four times the days buys half the standard error, provided the new days are independent.',
  },
];
