// assess-m3.js — B06 module 3 test: Multiple regression (multiple-regression, categorical-predictors-and-interactions,
// multicollinearity-and-model-choice). New questions on new scenarios, not copies of lesson exercises: the lessons work
// mostly with Harbourside, so the café items here use Millbrook (its year, its July and its December). No hints;
// solutions are shown when the student reviews the test. Café data come from case.js (the corrected log); Fallow Point
// Ferries, Kelso Street Gyms and every other business, person and number are fictional. Formula items are marked by
// their results (core/sheet.js gradeFormula); every num item's `check` recomputes its answer.
import { column } from './case.js?v=30';
import * as R from '../../../core/regression.js?v=30';

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;

// ---------------------------------------------------------------- Millbrook
const M = { cafe: 'Millbrook' };
const y = column('footfall', M), hi = column('high_f', M), rain = column('rain_in', M), wk = column('weekend', M), mo = column('month', M), dates = column('date', M);
const YR = R.fit(y, { High: hi, Rain: rain, Weekend: wk });
const sheetFor = (m, label) => {
  const idx = mo.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0), g = (a) => idx.map((i) => a[i]);
  const cells = {
    A1: 'Day', B1: 'Footfall', C1: 'High (°F)', D1: 'Rain (in)', E1: 'Weekend',
    ...col('A', 2, idx.map((i) => `${Number(dates[i].slice(8, 10))} ${label}`)), ...col('B', 2, g(y)), ...col('C', 2, g(hi)), ...col('D', 2, g(rain)), ...col('E', 2, g(wk)),
  };
  const full = R.fit(g(y), { High: g(hi), Rain: g(rain), Weekend: g(wk) }), red = R.fit(g(y), { Weekend: g(wk) });
  return { cells, n: idx.length, full, red };
};
const DEC = sheetFor(12, 'Dec'), JUL = sheetFor(7, 'Jul');
const decHigh = DEC.full.coefs[1], julNF = R.nestedF(JUL.full, JUL.red);
const widths = { A: 8, B: 10, C: 10, D: 10, E: 10, F: 3, G: 26, H: 12 };

// ---------------------------------------------------------------- fictional figures
const FP = { b0: 410, summer: 260, routeB: -120, inter: 180 };   // Fallow Point Ferries: daily passengers
const VF = { n0: 50, vif: 6 };                                   // rows needed for the same SE

export const items = [
  // ---------------------------------------------------------------- multiple-regression
  {
    id: 'b06-m3-1', lesson: 'multiple-regression', type: 'num', kind: 'applied',
    prompt: `Over Millbrook’s 306 days, footfall regressed on the day’s high, rain and a weekend dummy has slopes of ${fx(YR.beta[1], 3)} people per °F, ${fx(YR.beta[2], 2)} per inch of rain and ${fx(YR.beta[3], 2)} for a weekend day. The forecast for next Tuesday is 0.4 inches of rain; last Tuesday was dry and equally warm. How many fewer visitors does the model expect? Give one decimal place.`,
    answer: rnd(-rnd(YR.beta[2], 2) * 0.4, 1), check: () => YR.predict([60, 0, 0]).yhat - YR.predict([60, 0.4, 0]).yhat, unit: 'people', places: 1, tol: 0.15,
    wrong: [
      { value: rnd(-YR.beta[2], 1), say: 'That is the difference for a full inch of rain. The forecast is 0.4 inches.' },
      { value: rnd(-YR.beta[2] * 0.4 - YR.beta[3], 1), say: 'Both days are Tuesdays, so the weekend term is 0 for each and cancels.' },
    ],
    solution: `Only rain differs, so the difference is the rain slope times 0.4: ${fx(-YR.beta[2], 2)} × 0.4 = ${fx(-YR.beta[2] * 0.4, 1)} fewer people, comparing days alike on temperature and day of the week. The temperature and weekend terms cancel.`,
  },
  {
    id: 'b06-m3-2', lesson: 'multiple-regression', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Millbrook’s 31 days of December 2027: footfall in B, the high in C, rain in D and the weekend dummy in E. In G2, calculate the two-sided p-value of the slope on the high in the regression of footfall on all three, in one formula: use LINEST with its statistics for the slope, its standard error and the residual degrees of freedom.',
    sheet: { cells: { ...DEC.cells, G1: 'p-value, slope on high' } },
    cell: 'G2', answer: '=T.DIST.2T(ABS(INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),1,3)/INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),2,3)),INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),4,2))',
    alt: ['=T.DIST.2T(ABS(INDEX(LINEST(B2:B32,C2:E32,1,1),1,3)/INDEX(LINEST(B2:B32,C2:E32,1,1),2,3)),27)'],
    require: ['LINEST', 'T.DIST.2T'],
    view: 'A1:H32', maxHeight: '20rem', formats: { G2: '0.000' }, widths,
    wrong: [
      { formula: '=T.DIST.2T(ABS(INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),1,1)/INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),2,1)),INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),4,2))', say: 'Column 1 of LINEST’s output is the last x column, the weekend. The high, the first of three x columns, is column 3.' },
      { formula: '=T.DIST.2T(ABS(INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),1,3)/INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),2,3)),29)', say: 'The residual df are n − p = 31 − 4 = 27, which LINEST gives in row 4, column 2; 29 is right only for one predictor.' },
    ],
    solution: `The slope on the high is ${fx(decHigh.estimate, 3)} people per °F (SE ${fx(decHigh.se, 3)}), so t = ${fx(decHigh.t, 3)} on 27 df and p = ${fx(decHigh.p, 3)}. In December, holding rain and the weekend fixed, there is no evidence that Millbrook’s footfall moved with the temperature, unsurprising at an office café in a month of cold days.`,
  },
  {
    id: 'b06-m3-3', lesson: 'multiple-regression', type: 'mc', kind: 'conceptual',
    prompt: 'A regression of x₁ on x₂ has a slope of exactly 0: the two predictors are unrelated in the data. x₂ is then added to a model of y that contained only x₁, and x₂’s slope is large. What happens to the slope on x₁ and to its standard error?',
    options: [
      'The slope on x₁ is unchanged; its standard error usually falls, as s shrinks.',
      'The slope on x₁ changes by b₂ times the correlation of x₁ and y, so its standard error rises.',
      'Both stay exactly the same, because an unrelated predictor can’t affect anything about x₁.',
      'The slope on x₁ shrinks towards zero, because x₂ now shares the credit for explaining y.',
    ],
    answer: 0,
    feedback: {
      1: 'The omitted-variable formula has δ, the slope of x₂ on x₁, not the correlation with y; with δ = 0 there is no change in the slope.',
      2: 'The slope is unchanged, but the standard error depends on s, which falls when x₂ explains part of y.',
      3: 'Shared credit needs the predictors to overlap. With δ = 0 they don’t, and b₁ is unchanged.',
    },
    solution: 'b̃₁ = b₁ + b₂δ with δ = 0, so the slope is the same with or without x₂. But x₂ explains part of the residual variation, so s falls and SE(b₁) = s ÷ √(Σ(x₁ − x̄₁)²) × √VIF (with VIF = 1) falls too: adding a relevant, unrelated predictor sharpens the estimate.',
  },
  {
    id: 'b06-m3-4', lesson: 'multiple-regression', type: 'num', kind: 'numerical',
    prompt: 'Kelso Street Gyms (fictional) models monthly memberships at 30 branches. With four predictors R² = 0.400; adding a fifth raises it to 0.410. Calculate adjusted R² for the five-predictor model. Give four decimal places.',
    answer: rnd(1 - (1 - 0.41) * 29 / 24, 4), check: () => 1 - (1 - 0.41) * (30 - 1) / (30 - 6), unit: '', places: 4, tol: 0.0001,
    wrong: [
      { value: rnd(1 - (1 - 0.4) * 29 / 25, 4), say: 'That is the four-predictor model’s adjusted R². Use R² = 0.410 and n − p = 30 − 6 = 24.' },
      { value: rnd(1 - (1 - 0.41) * 29 / 25, 4), say: 'Five predictors plus the intercept make p = 6, so n − p = 24.' },
    ],
    solution: `Five predictors: 1 − 0.590 × 29 ÷ 24 = ${fx(1 - 0.59 * 29 / 24, 4)}. Four predictors: 1 − 0.600 × 29 ÷ 25 = ${fx(1 - 0.6 * 29 / 25, 4)}. R² rose but adjusted R² fell: the fifth predictor’s |t| is below 1, so it adds less than its cost.`,
  },
  // ---------------------------------------------------------------- categorical-predictors-and-interactions
  {
    id: 'b06-m3-5', lesson: 'categorical-predictors-and-interactions', type: 'num', kind: 'applied',
    prompt: 'Fallow Point Ferries (fictional) runs routes A and B and models daily passengers on a summer dummy, a route-B dummy and their product: passengers = 410 + 260 × summer − 120 × routeB + 180 × (summer × routeB). By how many passengers does summer raise route B’s daily traffic?',
    answer: FP.summer + FP.inter, check: () => (410 + 260 - 120 + 180) - (410 - 120), unit: 'passengers', places: 0, tol: 0,
    wrong: [
      { value: FP.summer, say: 'That is the summer effect on route A, the reference route. Route B’s adds the interaction.' },
      { value: FP.inter, say: 'The interaction is how much more summer adds on route B than on route A, not route B’s summer effect itself.' },
      { value: FP.summer + FP.inter + FP.routeB, say: 'The route-B dummy is 1 in both seasons on route B, so it cancels in the summer-minus-winter difference.' },
    ],
    solution: 'Route B in summer: 410 + 260 − 120 + 180 = 730; route B otherwise: 410 − 120 = 290. Summer adds 260 + 180 = 440 passengers on route B, against 260 on route A.',
  },
  {
    id: 'b06-m3-6', lesson: 'categorical-predictors-and-interactions', type: 'classify', kind: 'conceptual',
    prompt: 'Ana refits a model of footfall on the high, rain and a café dummy with Millbrook as the reference café instead of Harbourside. For each quantity, does it change?',
    items: ['The intercept', 'The café dummy’s coefficient', 'The slope on rain', 'The fitted footfall for every café-day', 'R² and the residual standard error'],
    categories: ['Changes', 'Doesn’t change'],
    answer: [0, 0, 1, 1, 1],
    feedback: {
      0: 'The intercept describes the reference café, which is now Millbrook.',
      1: 'The coefficient is now Harbourside’s difference from Millbrook: the same size, the opposite sign.',
      2: 'With no interaction, rain’s slope is shared by both cafés and doesn’t depend on which one is the reference.',
      3: 'Both codings describe the same model, so every fitted value is the same.',
      4: 'Same fitted values, same residuals, same R² and s.',
    },
    solution: 'Recoding the reference rewrites the same model: the intercept and the dummy’s coefficient change (the dummy flips sign), while shared slopes, fitted values, residuals, R² and s don’t.',
  },
  {
    id: 'b06-m3-7', lesson: 'categorical-predictors-and-interactions', type: 'mc', kind: 'applied',
    prompt: 'Kelso Street Gyms (fictional) regresses monthly cancellations on average class size (members per class) for its city-centre and suburban branches pooled, without a branch-type dummy, and finds that larger classes went with fewer cancellations. City-centre branches had larger classes and much lower cancellation rates whatever the class size. What should the analyst do first?',
    options: [
      'Add a branch-type dummy (and test a class-size × branch-type interaction) before reading the class-size slope.',
      'Report that larger classes reduce cancellations, since the pooled data cover every branch and so are the most complete.',
      'Drop the city-centre branches, because their low cancellation rates are outliers that distort the slope.',
      'Code the branch type as 1 and 2 in a single column and treat it as a number in the regression.',
    ],
    answer: 0,
    feedback: {
      1: 'Pooled rows mix branch types that differ in both class sizes and cancellations: a confounder, and a likely Simpson’s paradox.',
      2: 'The branches aren’t errors; they are a group, and the dummy lets them be compared fairly.',
      3: 'With two categories a 1/2 column fits the same as a 0/1 dummy, but it does nothing to answer the question unless it is in the model alongside class size, and a 0/1 dummy makes the coefficient a plain difference.',
    },
    solution: 'Branch type confounds class size and cancellations, as the café confounded footfall and the ticket. A dummy holds it fixed; an interaction lets each type have its own class-size slope. Only then read the class-size slope, still as an association.',
  },
  // ---------------------------------------------------------------- multicollinearity-and-model-choice
  {
    id: 'b06-m3-8', lesson: 'multicollinearity-and-model-choice', type: 'num', kind: 'numerical',
    prompt: 'With two unrelated predictors, 50 rows would give a slope a certain standard error. A predictor with a VIF of 6 is collinear with the others. Roughly how many rows would it take for its slope to have the same standard error, assuming the same residual standard error and the same spread of each predictor?',
    answer: VF.n0 * VF.vif, check: () => 50 * 6, unit: 'rows', places: 0, tol: 0,
    wrong: [
      { value: Math.round(50 * Math.sqrt(6)), say: 'The standard error grows by √VIF, and it shrinks like 1 ÷ √n, so n must grow by VIF itself, not √VIF.' },
      { value: 50 + 6, say: 'The VIF multiplies the variance of the slope; rows must be multiplied by it too, not added.' },
    ],
    solution: 'SE ∝ √VIF ÷ √n. To offset √6 with √n, n must be 6 times larger: 50 × 6 = 300 rows. A VIF says how many unrelated rows each collinear row is worth: about 1 in 6 here.',
  },
  {
    id: 'b06-m3-9', lesson: 'multicollinearity-and-model-choice', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook’s July 2027: footfall in B; high, rain and weekend in C:E. G1 holds the SSE of footfall on all three, G2 the SSE on the weekend dummy alone, and G3 the full model’s residual degrees of freedom. In G4, calculate the nested F statistic for the two weather predictors together.',
    sheet: { cells: { ...JUL.cells, F1: '', G1: '=INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),5,2)', H1: 'SSE, full', G2: '=INDEX(LINEST(B2:B32,E2:E32,TRUE,TRUE),5,2)', H2: 'SSE, weekend only', G3: '=INDEX(LINEST(B2:B32,C2:E32,TRUE,TRUE),4,2)', H3: 'df, full', H4: 'Nested F' } },
    cell: 'G4', answer: '=((G2-G1)/2)/(G1/G3)',
    alt: ['=(G2-G1)/2/(G1/G3)', '=((G2-G1)/2)*G3/G1'],
    view: 'A1:H32', maxHeight: '20rem', formats: { G1: '#,##0', G2: '#,##0', G4: '0.000' }, widths: { ...widths, G: 12, H: 18 },
    wrong: [
      { formula: '=((G2-G1)/1)/(G1/G3)', say: 'Two predictors (the high and rain) are dropped from the full model, so q = 2.' },
      { formula: '=((G2-G1)/2)/(G2/G3)', say: 'The denominator is the full model’s mean squared residual, SSE_F ÷ df_F = G1 ÷ G3.' },
      { formula: '=((G1-G2)/2)/(G1/G3)', say: 'The reduced model has the larger SSE, so the numerator is G2 − G1.' },
    ],
    solution: `F = ((${fx(JUL.red.sse, 0)} − ${fx(JUL.full.sse, 0)}) ÷ 2) ÷ (${fx(JUL.full.sse, 0)} ÷ 27) = ${fx(julNF.F, 3)} on 2 and 27 df, p = ${fx(julNF.p, 3)}. Together, the weather adds to the weekend dummy in July, a question no single t test answers.`,
  },
  {
    id: 'b06-m3-10', lesson: 'multicollinearity-and-model-choice', type: 'mc', kind: 'applied',
    prompt: 'Ana will use a model to forecast Millbrook’s footfall for each week of 2028. She has 2027’s ten months and five candidate models. Which plan gives the most honest estimate of how accurate the chosen model will be?',
    options: [
      'Choose among the models on March–October fits tested on November, then check the chosen one, untouched, on December.',
      'Fit all five on all ten months and report the R² of the one with the highest adjusted R².',
      'Fit all five on a random half of the days, test on the other half, and report the winner’s test RMSE.',
      'Fit all five on all ten months and report the error of the one with the lowest AIC on those same months.',
    ],
    answer: 0,
    feedback: {
      1: 'Every number here comes from the data used to fit, so none measures accuracy on new weeks.',
      2: 'A random split of days tests interpolation between neighbouring days, not forecasting ahead, and the winner’s test RMSE is optimistic because the test chose it.',
      3: 'AIC ranks candidates but isn’t an error on new data, and the error on the fitting months understates the forecast error.',
    },
    solution: 'A forward split matches the use, a forecast of later weeks, and keeping a final month untouched by every choice gives one honest check of the chosen model. One month is a small test; Ana should keep checking against 2028’s actuals.',
  },
  {
    id: 'b06-m3-11', lesson: 'multicollinearity-and-model-choice', type: 'mc', kind: 'conceptual',
    prompt: 'In a model of a hotel’s nightly revenue on rooms occupied and guests staying (r = 0.97 between them), the slope on guests isn’t significant. The analyst drops guests to “simplify”. When is that a mistake?',
    options: [
      'When guests matter at a given number of rooms: dropping them biases the slope on rooms.',
      'Never: a predictor that isn’t significant contributes nothing and should always be removed from the model.',
      'Always, because with r = 0.97 the two predictors are perfectly collinear and both must be kept.',
      'Only if adjusted R² falls by more than 0.05 when guests are dropped from the model.',
    ],
    answer: 0,
    feedback: {
      1: 'Under collinearity “not significant” means “can’t be separated”, not “no effect”; dropping a real confounder brings back omitted-variable bias.',
      2: 'Perfect collinearity is r = ±1; at 0.97 both can be fitted, imprecisely.',
      3: 'No such rule; the decision depends on the question and on whether guests confound the rooms slope.',
    },
    solution: 'If guests affect revenue at a given number of rooms (extra breakfasts, say), the rooms-only slope absorbs that effect through b₂δ. For predicting total revenue, dropping guests costs little; for explaining what a room is worth, it changes the answer.',
  },
];
