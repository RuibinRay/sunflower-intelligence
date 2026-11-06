// multicollinearity-and-model-choice.ex.js — B06 · Multicollinearity and model choice: widgets, practice and the
// knowledge check (answer keys live here). The cafés’ log comes from case.js (Harbourside’s year and its May for the
// widgets; its 30 days of June 2027 and the first 12 days of October for the worksheets). Linthorpe Dental, Stavely
// Cycles, Oakbridge Theatres and the other businesses named are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';
import { mean } from '../../../core/stats.js?v=26';
import { fSf } from '../../../core/inference.js?v=26';

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;

// ---------------------------------------------------------------- Harbourside
const H = { cafe: 'Harbourside' };
const sl = column('sales', H), ft = column('footfall', H), tr = column('transactions', H), mo = column('month', H), dates = column('date', H);
const inMonth = (m) => mo.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
const MAY = inMonth(5), JUN = inMonth(6);
const g = (a, idx) => idx.map((i) => a[i]);

// June worksheet: sales, footfall, transactions (30 rows)
const jun = { s: g(sl, JUN), f: g(ft, JUN), t: g(tr, JUN) };
const JF = R.fit(jun.s, { Footfall: jun.f, Transactions: jun.t }), JR = R.fit(jun.s, { Transactions: jun.t });
const junVif = R.vif([jun.f, jun.t])[0], junNF = R.nestedF(JF, JR);
const junCells = {
  A1: 'Day', B1: 'Sales ($)', C1: 'Footfall', D1: 'Transactions',
  ...col('A', 2, JUN.map((i) => `${Number(dates[i].slice(8, 10))} Jun`)), ...col('B', 2, jun.s), ...col('C', 2, jun.f), ...col('D', 2, jun.t),
};
const junView = 'A1:H31', junWidths = { A: 8, B: 10, C: 10, D: 12, E: 3, F: 30, G: 12, H: 3 };
const statCells = {
  F1: 'SSE, full model (footfall and transactions)', G1: '=INDEX(LINEST(B2:B31,C2:D31,TRUE,TRUE),5,2)',
  F2: 'SSE, reduced model (transactions only)', G2: '=INDEX(LINEST(B2:B31,D2:D31,TRUE,TRUE),5,2)',
  F3: 'Residual df, full model', G3: '=INDEX(LINEST(B2:B31,C2:D31,TRUE,TRUE),4,2)',
};

// October test rows: model B (high, rain, weekend, festival, build-up) fitted on March–September
const y = ft, hi = column('high_f', H), rain = column('rain_in', H), wk = column('weekend', H), fe = column('festival01', H), day = column('day', H);
const build = column('build_up', H);
const TR = y.map((_, i) => i).filter((i) => mo[i] <= 9);
const FB = R.fit(g(y, TR), { High: g(hi, TR), Rain: g(rain, TR), Weekend: g(wk, TR), Festival: g(fe, TR), 'Build-up': g(build, TR) });
const TE = y.map((_, i) => i).filter((i) => dates[i] >= '2027-10-01' && dates[i] <= '2027-10-12');
const pred = TE.map((i) => rnd(FB.predict([hi[i], rain[i], wk[i], fe[i], build[i]]).yhat, 1));
const testRmse = Math.sqrt(mean(TE.map((i, j) => (y[i] - pred[j]) ** 2)));
const testCells = {
  A1: 'Day', B1: 'Actual footfall', C1: 'Predicted footfall',
  ...col('A', 2, TE.map((i) => `${Number(dates[i].slice(8, 10))} Oct`)), ...col('B', 2, g(y, TE)), ...col('C', 2, pred),
  E1: 'Test RMSE (people)',
};

// ---------------------------------------------------------------- fictional figures
const LD = { sseR: 4820, sseF: 4310, q: 3, n: 60, pF: 7 };          // Linthorpe Dental: three extra predictors
const ldF = ((LD.sseR - LD.sseF) / LD.q) / (LD.sseF / (LD.n - LD.pF));
const SC = { n: 120, sse1: 2400, p1: 4, sse2: 2310, p2: 6 };         // Stavely Cycles: AIC comparison
const aic = (sse, n, p) => n * Math.log(sse / n) + 2 * p, bic = (sse, n, p) => n * Math.log(sse / n) + p * Math.log(n);
const scD = aic(SC.sse2, SC.n, SC.p2) - aic(SC.sse1, SC.n, SC.p1), scB = bic(SC.sse2, SC.n, SC.p2) - bic(SC.sse1, SC.n, SC.p1);
const OT = { r2r: 0.71, r2f: 0.74, n: 80, q: 2, pF: 6 };             // Oakbridge Theatres: nested F from R²
const otF = ((OT.r2f - OT.r2r) / OT.q) / ((1 - OT.r2f) / (OT.n - OT.pF));

export const widgets = {
  'coll-sales': {
    type: 'regression',
    title: 'Harbourside’s daily sales on footfall and transactions (306 days)',
    y: { name: 'Sales ($)', values: sl },
    xs: [{ name: 'Footfall', values: ft }, { name: 'Transactions', values: tr }],
    picked: [1],
    note: 'Footfall and transactions correlate at 0.985 (VIF 34). With both ticked, the fit hardly improves but each slope’s standard error is several times larger: the data can’t tell the two apart. The days aren’t independent (the season and the build-up), so all the standard errors are somewhat too small.',
  },
  'coll-may': {
    type: 'regression',
    title: 'Harbourside’s sales in May 2027 only (31 days, two of them festival days)',
    y: { name: 'Sales ($)', values: g(sl, MAY) },
    xs: [{ name: 'Footfall', values: g(ft, MAY) }, { name: 'Transactions', values: g(tr, MAY) }],
    picked: [0, 1],
    note: 'In May the two predictors correlate at 0.996 (VIF about 115), largely because the two festival days are far above every other day on both. Untick each predictor in turn and compare its slope alone with its slope in the pair.',
  },
  'coll-vif': {
    type: 'formula',
    title: 'Collinearity between two predictors',
    intro: 'Set the correlation between the two predictors and the number of rows.',
    inputs: [
      { id: 'r', label: 'Correlation between the predictors (r)', min: 0, max: 0.999, step: 0.001, value: 0.985, fmt: 'num' },
      { id: 'n', label: 'Rows (n)', min: 20, max: 1000, step: 1, value: 306, fmt: 'int' },
    ],
    compute: (v) => {
      const vif = 1 / (1 - v.r * v.r);
      return {
        headline: { label: 'VIF', value: fx(vif, 1) },
        rows: [['Standard errors multiplied by √VIF', fx(Math.sqrt(vif), 2)], ['Information about each separate slope, in unrelated rows (n ÷ VIF)', fx(v.n / vif, 0)]],
        note: vif < 4 ? 'Mild: the slopes are estimated almost as precisely as if the predictors were unrelated.'
          : vif < 10 ? 'Above 4, a common threshold for a closer look (a convention). The separate slopes are noticeably less precise.'
            : 'Above 10, often called serious (a convention). The data say little about each predictor’s separate slope, though predictions are unaffected.',
      };
    },
  },
};

export const guided = [
  {
    id: 'b06-coll-g1', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Harbourside’s 30 days of June 2027: sales in B, footfall in C and transactions in D. In G1, calculate the variance inflation factor for footfall in a regression of sales on footfall and transactions.',
    sheet: { cells: { ...junCells, F1: 'VIF (footfall)' } },
    cell: 'G1', answer: '=1/(1-RSQ(C2:C31,D2:D31))',
    alt: ['=1/(1-CORREL(C2:C31,D2:D31)^2)', '=1/(1-RSQ(D2:D31,C2:C31))', '=1/(1-INDEX(LINEST(C2:C31,D2:D31,TRUE,TRUE),3,1))'],
    view: junView, maxHeight: '20rem', formats: { G1: '0.0' }, widths: junWidths,
    wrong: [
      { formula: '=1/(1-CORREL(C2:C31,D2:D31))', say: 'The VIF uses R² of footfall on the other predictor: with two predictors that is r squared, not r.' },
      { formula: '=1-RSQ(C2:C31,D2:D31)', say: 'That is the share of footfall’s variation the other predictor can’t explain (the tolerance). The VIF is its reciprocal.' },
      { formula: '=1/(1-RSQ(B2:B31,C2:C31))', say: 'The VIF is about the predictors, not about sales: use R² of footfall on transactions.' },
    ],
    hints: ['VIF = 1 ÷ (1 − R²), where R² comes from regressing footfall on the other predictor.', 'With two predictors that R² is RSQ of the two columns: <x>=1/(1-RSQ(C2:C31,D2:D31))</x>.'],
    solution: `<x>=1/(1-RSQ(C2:C31,D2:D31))</x> = ${fx(junVif, 1)}. The standard errors of both slopes are about √${fx(junVif, 1)} = ${fx(Math.sqrt(junVif), 1)} times what they would be if footfall and transactions were unrelated.`,
  },
  {
    id: 'b06-coll-g2', type: 'num', kind: 'numerical',
    prompt: 'Linthorpe Dental (fictional) models monthly appointments at 60 practices. Adding three predictors about local demographics lowers SSE from 4,820 to 4,310; the full model has 7 coefficients. Calculate the nested F statistic for the three predictors. Give two decimal places.',
    answer: rnd(ldF, 2), check: () => ((4820 - 4310) / 3) / (4310 / (60 - 7)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((4820 - 4310) / (4310 / 53), 2), say: 'Divide the drop in SSE by q = 3, the number of predictors added, before dividing by the full model’s MSE.' },
      { value: rnd(((4820 - 4310) / 3) / (4310 / 57), 2), say: 'The denominator’s df is n − p of the full model: 60 − 7 = 53.' },
    ],
    hints: ['F = ((SSE_R − SSE_F) ÷ q) ÷ (SSE_F ÷ (n − p_F)).', '(510 ÷ 3) ÷ (4,310 ÷ 53).'],
    solution: `(510 ÷ 3) ÷ (4,310 ÷ 53) = 170 ÷ ${fx(4310 / 53, 2)} = ${fx(ldF, 2)} on 3 and 53 df; <x>=F.DIST.RT(${fx(ldF, 2)},3,53)</x> ≈ ${fx(fSf(ldF, 3, 53), 3)}. With p above 0.1, there is no clear evidence that the three demographic predictors together improve the fit.`,
  },
  {
    id: 'b06-coll-g3', type: 'mc', kind: 'applied',
    prompt: 'Ana has two uses for a footfall model: a forecast for next week’s roster, and a report on what a weekend is worth to each café. Peak barista hours, set in advance from the manager’s expectations, improve the fit. Where should she include them?',
    options: [
      'In the forecasting model, judged on held-out weeks, but not in the model for what a weekend is worth.',
      'In both models, because a predictor that improves adjusted R² always makes the coefficients more accurate.',
      'In neither model, because barista hours are measured in hours and footfall in people.',
      'In the weekend report only, because the roster is not known in advance and can’t be used to forecast.',
    ],
    answer: 0,
    feedback: {
      1: 'A better fit doesn’t make coefficients better estimates of what they are meant to measure. The roster carries part of the weekend’s effect, so with it in, the weekend coefficient falls (68.8 to 58.1).',
      2: 'Predictors and y can have any units; each slope carries its own.',
      3: 'The roster is set before the day, so it is available for a forecast. It is the explanatory model it spoils.',
    },
    hints: ['Which aim cares about a coefficient’s meaning, and which only about accurate predictions?'],
    solution: 'For prediction, any predictor known in advance is fair, and the roster summarises the manager’s expectations. For explanation, holding the roster fixed holds part of the weekend’s effect fixed, which shrinks the weekend coefficient. Two aims, two models.',
  },
  {
    id: 'b06-coll-g4', type: 'num', kind: 'numerical',
    prompt: 'Stavely Cycles (fictional) compares two least-squares models of weekly sales over 120 weeks: model 1 has 4 coefficients and SSE = 2,400; model 2 has 6 coefficients and SSE = 2,310. Using AIC = n ln(SSE/n) + 2p, calculate AIC(model 2) − AIC(model 1). Give two decimal places.',
    answer: rnd(scD, 2), check: () => (120 * Math.log(2310 / 120) + 12) - (120 * Math.log(2400 / 120) + 8), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(120 * Math.log(2310 / 2400), 2), say: 'That is only the fit term. Add the penalty difference, 2 × (6 − 4) = 4.' },
      { value: rnd(scB, 2), say: 'That uses BIC’s penalty, p ln n. AIC charges 2 per coefficient.' },
    ],
    hints: ['The difference of the fit terms is n ln(SSE₂ ÷ SSE₁) = 120 ln(2,310 ÷ 2,400).', 'Add 2 × (6 − 4).'],
    solution: `120 ln(2,310 ÷ 2,400) + 2 × 2 = ${fx(120 * Math.log(2310 / 2400), 2)} + 4 = ${fx(scD, 2)}. Negative, so AIC prefers model 2, but only by about ${fx(-scD, 1)}. BIC, charging ln 120 = ${fx(Math.log(120), 2)} per coefficient, gives ${fx(scB, 2)} and prefers model 1.`,
  },
];

export const independent = [
  {
    id: 'b06-coll-i1', type: 'formula', kind: 'numerical',
    prompt: 'For Harbourside’s June, G1 and G2 hold the SSE of sales on footfall and transactions (full) and on transactions alone (reduced), and G3 the full model’s residual degrees of freedom. In G4, calculate the p-value of the nested F test of footfall, in one formula.',
    sheet: { cells: { ...junCells, ...statCells, F4: 'p-value (nested F test)' } },
    cell: 'G4', answer: '=F.DIST.RT(((G2-G1)/1)/(G1/G3),1,G3)',
    alt: ['=F.DIST.RT((G2-G1)/(G1/G3),1,G3)', '=1-F.DIST(((G2-G1)/1)/(G1/G3),1,G3,TRUE)'],
    view: junView, maxHeight: '20rem', formats: { G1: '#,##0.0', G2: '#,##0.0', G4: '0.000' }, widths: junWidths,
    wrong: [
      { formula: '=F.DIST.RT(((G2-G1)/1)/(G2/G3),1,G3)', say: 'The denominator uses the full model’s SSE and df: SSE_F ÷ (n − p_F) = G1 ÷ G3.' },
      { formula: '=F.DIST.RT(((G1-G2)/1)/(G1/G3),1,G3)', say: 'The reduced model has the larger SSE: the numerator is SSE_R − SSE_F = G2 − G1.' },
      { formula: '=F.DIST.RT(((G2-G1)/1)/(G1/G3),2,G3)', say: 'Only one term is removed (footfall), so q = 1.' },
    ],
    solution: `F = (${fx(JR.sse, 1)} − ${fx(JF.sse, 1)}) ÷ (${fx(JF.sse, 1)} ÷ 27) = ${fx(junNF.F, 3)}, and <x>=F.DIST.RT(((G2-G1)/1)/(G1/G3),1,G3)</x> = ${fx(junNF.p, 3)}. With one term removed, F is footfall’s t squared and this is the same p-value as its t test. In June the data can’t separate footfall from transactions.`,
  },
  {
    id: 'b06-coll-i2', type: 'num', kind: 'numerical',
    prompt: 'For Stavely Cycles’ two models (120 weeks; model 1: 4 coefficients, SSE 2,400; model 2: 6 coefficients, SSE 2,310), calculate BIC(model 2) − BIC(model 1), using BIC = n ln(SSE/n) + p ln n. Give two decimal places.',
    answer: rnd(scB, 2), check: () => (120 * Math.log(2310 / 120) + 6 * Math.log(120)) - (120 * Math.log(2400 / 120) + 4 * Math.log(120)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(scD, 2), say: 'That is the AIC difference, with 2 per coefficient. BIC charges ln 120 per coefficient.' },
      { value: rnd(120 * Math.log(2310 / 2400) + 2 * Math.log(120) * 2, 2), say: 'The penalty difference is (6 − 4) × ln 120, once.' },
    ],
    solution: `120 ln(2,310 ÷ 2,400) + 2 × ln 120 = ${fx(120 * Math.log(2310 / 2400), 2)} + ${fx(2 * Math.log(120), 2)} = ${fx(scB, 2)}. Positive: BIC prefers the smaller model 1, while AIC narrowly preferred model 2. When they disagree by this little, neither model is clearly better; a hold-out check or the question’s needs should decide.`,
  },
  {
    id: 'b06-coll-i3', type: 'mc', kind: 'applied',
    prompt: 'An analyst at Oakbridge Theatres (fictional) starts with 40 candidate predictors of weekly ticket sales, runs a stepwise procedure that keeps the 6 with p-values below 0.05, and reports the final model’s R² and p-values as evidence that those 6 drive sales. What is the main problem?',
    options: [
      'The R² and p-values ignore the 34 predictors tried and dropped, so they overstate the support for the six.',
      'Six predictors are too many for weekly data, because a regression can have at most five predictors.',
      'Stepwise selection always removes the true predictors, so the six kept must be the wrong ones.',
      'P-values below 0.05 are too strict for business data; the analyst should have kept everything below 0.10.',
    ],
    answer: 0,
    feedback: {
      1: 'There is no such limit; what matters is the number of rows per coefficient and whether the model is checked on new data.',
      2: 'It doesn’t always remove them; the problem is that its output can’t be read at face value, and chance and proxies get in.',
      3: 'A looser threshold lets in even more chance findings. The problem is the selection, not the cut-off.',
    },
    solution: 'With 40 candidates, about two would pass at 5% by chance alone, and predictors that merely stand in for something left out pass easily. After selection, R² is biased high and the p-values don’t mean what they say (Harrell’s list). The six need checking on later weeks, and “drive” needs a causal argument that a regression can’t supply.',
  },
  {
    id: 'b06-coll-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana fits Harbourside’s footfall models with an alternating split: on odd-numbered days counted from 1 March, testing on the even ones. The 17-predictor model then does almost as well as the 5-predictor one (RMSE 17.8 against 17.6), although it forecast the autumn far worse when fitted on March to September. Why the difference?',
    options: [
      'Each even day sits between two odd training days that are nearly the same, so the test rewards interpolation, not forecasting ahead.',
      'The odd-day split has more test rows than the autumn split, and RMSE always falls as the number of test rows grows.',
      'The 17-predictor model is the better model, and the autumn test was spoiled by bad weather in October.',
      'Splitting by odd and even days leaks the y values of the test days into the fitted coefficients.',
    ],
    answer: 0,
    feedback: {
      1: 'RMSE is an average; more rows make it steadier, not systematically smaller.',
      2: 'The autumn test is the one that matches the use, a forecast of later days. Weather is in the model.',
      3: 'Nothing from the test days is used in fitting; the issue is that they resemble their training neighbours, not that their values leak.',
    },
    solution: 'Neighbouring days share the season and the build-up. A random or alternating split asks the model to fill gaps between training days, where even a wild cubic trend in the day is pinned down; a forward split asks it to extrapolate, which is what a forecast does and where the cubic trend fails.',
  },
  {
    id: 'b06-coll-i5', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s five-predictor model, fitted on March to September, predicted the first 12 days of October (column C). In E2, calculate the test RMSE: the square root of the mean squared difference between actual (B) and predicted (C) footfall, in one formula.',
    sheet: { cells: testCells },
    cell: 'E2', answer: '=SQRT(AVERAGE((B2:B13-C2:C13)^2))',
    alt: ['=SQRT(SUMSQ(B2:B13-C2:C13)/COUNT(B2:B13))', '=SQRT(SUMPRODUCT((B2:B13-C2:C13)^2)/12)', '=SQRT(SUMPRODUCT((B2:B13-C2:C13)^2)/COUNT(B2:B13))'],
    view: 'A1:E13', formats: { C: '0.0', E2: '0.00' }, widths: { A: 8, B: 15, C: 17, D: 3, E: 18 },
    wrong: [
      { formula: '=AVERAGE((B2:B13-C2:C13)^2)', say: 'That is the mean squared error, in people squared. Take its square root to get back to people.' },
      { formula: '=AVERAGE(B2:B13-C2:C13)', say: 'That is the mean error (the bias): positive and negative errors cancel. Square them first.' },
      { formula: '=SQRT(SUMSQ(B2:B13-C2:C13)/11)', say: 'RMSE on a test set divides by the number of test rows, 12; there are no coefficients estimated from these rows to allow for.' },
    ],
    solution: `<x>=SQRT(AVERAGE((B2:B13-C2:C13)^2))</x> = ${fx(testRmse, 1)} people over these 12 days, a little above the model’s training s of ${fx(FB.sigma, 1)}. Twelve days are too few to judge a model on; the whole autumn gave 16.5.`,
  },
  {
    id: 'b06-coll-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true.',
    options: [
      'Multicollinearity widens the confidence intervals of the slopes involved.',
      'A VIF of 9 multiplies a slope’s standard error by 3.',
      'With one term removed, the nested F statistic equals that term’s t statistic squared.',
      'Multicollinearity biases the slopes towards zero.',
      'AIC can compare two models fitted to different sets of rows.',
      'A model with a lower AIC than its rivals is guaranteed to predict new data well.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'It makes them imprecise, not biased: on average across samples they are still right.',
      4: 'Information criteria compare models fitted to the same rows and the same y only.',
      5: 'AIC ranks the candidates; the lowest can still be poor, as Harbourside’s 17-predictor model was on the autumn.',
    },
    solution: 'True: wider intervals; √9 = 3; F = t² for one term. False: no bias, only imprecision; AIC needs the same rows; the best AIC among bad models is still bad.',
  },
];

export const check = [
  {
    id: 'b06-coll-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A regression of sales on footfall and transactions has a high R² and a tiny Significance F, but neither slope is significant on its own. What is the most likely explanation?',
    options: [
      'They are highly correlated: together they explain sales, but not one by one.',
      'The model is overfitted, because a high R² and non-significant slopes always mean too many predictors.',
      'The overall F test is wrong, because it can’t be significant unless at least one slope is.',
      'Sales have no real relationship with either predictor, and the high R² is due to chance.',
    ],
    answer: 0,
    feedback: {
      1: 'Two predictors are not too many; the pattern points to collinearity, which the VIF would confirm.',
      2: 'The F test asks whether the slopes are all zero; with collinear predictors it can reject while each t test, asking about one slope given the other, can’t.',
      3: 'A tiny Significance F with a high R² is strong evidence that the predictors together go with sales.',
    },
    solution: 'This is the signature of multicollinearity: each t test asks what one predictor adds given the other, and because they carry the same information, neither adds much. Together they clearly matter.',
  },
  {
    id: 'b06-coll-k2', type: 'num', kind: 'numerical',
    prompt: 'In a model with four predictors, regressing one of them on the other three gives R² = 0.90. By what factor does collinearity multiply that predictor’s standard error? Give two decimal places.',
    answer: rnd(Math.sqrt(10), 2), check: () => Math.sqrt(1 / (1 - 0.9)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 10, say: 'That is the VIF, which multiplies the variance. The standard error is multiplied by its square root.' },
      { value: rnd(1 / Math.sqrt(1 - 0.81), 2), say: 'The 0.90 is already an R²; don’t square it again.' },
    ],
    solution: 'VIF = 1 ÷ (1 − 0.90) = 10, so the standard error is √10 ≈ 3.16 times what it would be if the predictor were unrelated to the others.',
  },
  {
    id: 'b06-coll-k3', type: 'formula', kind: 'numerical',
    prompt: 'For Harbourside’s June, G1 holds the SSE of sales on footfall and transactions. In G2, calculate that model’s AIC in the form n ln(SSE/n) + 2p, with n counted from the data and p = 3 coefficients.',
    sheet: { cells: { ...junCells, F1: 'SSE (footfall and transactions)', G1: '=INDEX(LINEST(B2:B31,C2:D31,TRUE,TRUE),5,2)', F2: 'AIC' } },
    cell: 'G2', answer: '=COUNT(B2:B31)*LN(G1/COUNT(B2:B31))+2*3',
    alt: ['=COUNT(B2:B31)*LN(G1/COUNT(B2:B31))+6', '=ROWS(B2:B31)*LN(G1/ROWS(B2:B31))+2*3'],
    view: junView, maxHeight: '20rem', formats: { G1: '#,##0.0', G2: '0.00' }, widths: junWidths,
    wrong: [
      { formula: '=COUNT(B2:B31)*LN(G1/COUNT(B2:B31))+2*2', say: 'p counts the intercept: two slopes plus the intercept is 3.' },
      { formula: '=COUNT(B2:B31)*LN(G1)+2*3', say: 'The fit term is n ln(SSE ÷ n), the log of the mean squared residual times n.' },
      { formula: '=COUNT(B2:B31)*LN(G1/COUNT(B2:B31))+3*LN(COUNT(B2:B31))', say: 'That is BIC’s penalty, p ln n. AIC charges 2 per coefficient.' },
    ],
    solution: `30 × ln(${fx(JF.sse, 1)} ÷ 30) + 6 = ${fx(30 * Math.log(JF.sse / 30) + 6, 2)}. The transactions-only model gives ${fx(30 * Math.log(JR.sse / 30) + 4, 2)}, so AIC prefers it by ${fx(30 * Math.log(JF.sse / 30) + 6 - (30 * Math.log(JR.sse / 30) + 4), 2)}: a negligible difference. Software adds n(ln 2π + 1) to both, which doesn’t change the comparison.`,
  },
  {
    id: 'b06-coll-k4', type: 'mc', kind: 'applied',
    prompt: 'Oakbridge Theatres (fictional) must pick a model to forecast next season’s weekly ticket sales. Model P has the lowest AIC; model Q the lowest BIC; on the most recent season, held out from fitting, Q’s RMSE is 8% lower than P’s. Which choice is best supported?',
    options: [
      'Q: it forecast held-out later data better, which is the job; then refit it on all seasons.',
      'P, because AIC is designed for prediction and so overrides a single hold-out comparison.',
      'Whichever has the higher training R², because that shows which model explains the data better.',
      'Neither; when AIC and BIC disagree the data are unsuitable for regression.',
    ],
    answer: 0,
    feedback: {
      1: 'AIC estimates predictive accuracy from the training fit; a direct test on later data, where it matches the use, is stronger evidence.',
      2: 'Training R² always favours the larger model and says nothing about new data.',
      3: 'Disagreement is common: the criteria charge differently for each coefficient. It is a reason to look at held-out performance, not to give up.',
    },
    solution: 'The forecast will be used on a later season, and Q did better on exactly that kind of data. Having used the hold-out to choose, the same caution applies: the 8% is a slightly optimistic estimate for Q, and the next season will be the real test.',
  },
  {
    id: 'b06-coll-k5', type: 'num', kind: 'numerical',
    prompt: 'Oakbridge Theatres’ model of weekly sales over 80 weeks has R² = 0.71. Adding two predictors (6 coefficients in the full model) raises R² to 0.74. Calculate the nested F statistic, using F = ((R²_F − R²_R)/q) ÷ ((1 − R²_F)/(n − p_F)). Give two decimal places.',
    answer: rnd(otF, 2), check: () => ((0.74 - 0.71) / 2) / ((1 - 0.74) / (80 - 6)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((0.03 / 2) / (0.29 / 74), 2), say: 'The denominator uses the full model’s unexplained share, 1 − 0.74.' },
      { value: rnd(0.03 / (0.26 / 74), 2), say: 'Divide the gain in R² by q = 2, the number of predictors added.' },
    ],
    solution: `(0.03 ÷ 2) ÷ (0.26 ÷ 74) = 0.015 ÷ ${fx(0.26 / 74, 5)} = ${fx(otF, 2)} on 2 and 74 df; <x>=F.DIST.RT(${fx(otF, 2)},2,74)</x> ≈ ${fx(fSf(otF, 2, 74), 3)}. This is the SSE form divided through by SST, so it gives the same F.`,
  },
  {
    id: 'b06-coll-k6', type: 'mc', kind: 'applied',
    prompt: 'A colleague proposes adding Harbourside’s loyalty-app membership (a running total) to the footfall model with high, rain, weekend and festival, because it is “highly significant” (t = 10.4). With the build-up column in the model its p-value is 0.55. What should Ana conclude?',
    options: [
      'It stood in for the build-up; with the trend modelled it adds nothing, so leave it out.',
      'Membership drives footfall, and the build-up column hides that by sharing its credit with the trend.',
      'Both should go in, because two significant predictors explain more than one.',
      'The 0.55 must be an error, because a predictor can’t lose significance when another is added.',
    ],
    answer: 0,
    feedback: {
      1: 'A running total that grows through the year tracks any trend; once the build-up is in, membership has nothing left to explain.',
      2: 'With the build-up in, membership isn’t significant, so there aren’t two significant predictors. Adding a proxy also inflates the other slopes’ standard errors.',
      3: 'It can: the t test asks what a predictor adds given the others, and membership adds little once the build-up is there.',
    },
    solution: 'Screening by p-value picked a proxy for an omitted time trend. Ana chooses the build-up for a reason (new cafés build up their trade) and doesn’t add membership, whose apparent effect came from the trend.',
  },
];
