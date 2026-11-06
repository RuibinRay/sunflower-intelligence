// assess-m2.js — B06 module 2 test: Inference and prediction (inference-for-coefficients, prediction-and-intervals).
// New questions on new scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews
// the test. Café data come from case.js (the corrected log): Millbrook's weekdays 2 August – 10 September 2027, sales on
// transactions. Hollins Library, Glenfold Scooters, Brambleby Bakery, Tarnby Hardware, the launderette, the beach-hut firm and every other business and
// number outside the log are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); every
// num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=27';
import * as R from '../../../core/regression.js?v=27';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const label = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${MON[Number(r[at('date')].slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);

// Millbrook, weekdays 2 August – 10 September 2027: transactions and sales
const MB = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-08-02' && r[at('date')] <= '2027-09-10' && !['Sat', 'Sun'].includes(r[at('weekday')]));
const mT = MB.map((r) => r[at('transactions')]), mS = MB.map((r) => r[at('sales')]);
const FMB = R.fit(mS, { Transactions: mT });
const last = MB.length + 1;
const mbCells = { A1: 'Day', B1: 'Transactions', C1: 'Sales ($)', ...col('A', 2, MB.map(label)), ...col('B', 2, mT), ...col('C', 2, mS) };
const tMB = (FMB.coefs[1].estimate - 4) / FMB.coefs[1].se;
const p180 = FMB.predict([180]);

// fictional inputs
const LIB = { b: 2.8, se: 1.1, n: 15 };
const LAUN = { s: 8, n: 20, xbar: 50, sxx: 2000, x0: 60 };
const launSE = LAUN.s * Math.sqrt(1 + 1 / LAUN.n + (LAUN.x0 - LAUN.xbar) ** 2 / LAUN.sxx);
const BAKE = { yhat: 420, sePred: 35, n: 30, per: 60 };
const bakeUp = BAKE.yhat + R.tQuantile(0.95, BAKE.n - 2) * BAKE.sePred;

export const items = [
  // ---------------------------------------------------------------- inference-for-coefficients
  {
    id: 'b06-m2-1', lesson: 'inference-for-coefficients', type: 'mc', kind: 'conceptual',
    prompt: 'A regression’s 95% confidence interval for the slope runs from 0.8 to 2.4. What do two-sided tests at α = 0.05 conclude about H₀: β₁ = 0 and about H₀: β₁ = 2?',
    options: [
      'Reject β₁ = 0; don’t reject β₁ = 2.',
      'Reject both, because the estimate is neither 0 nor 2.',
      'Don’t reject β₁ = 0; reject β₁ = 2.',
      'Neither can be judged without the p-values themselves.',
    ],
    answer: 0,
    feedback: {
      1: 'A hypothesised value is rejected at 5% only if it lies outside the 95% interval. 2 lies inside 0.8 to 2.4.',
      2: 'It is the other way round: 0 is outside the interval, 2 is inside.',
      3: 'The 95% interval holds exactly the values a two-sided 5% test would not reject, so it answers both questions.',
    },
    solution: 'A two-sided test at 5% rejects a hypothesised slope exactly when it falls outside the 95% interval (for the same data and method). 0 is outside 0.8–2.4, so β₁ = 0 is rejected; 2 is inside, so β₁ = 2 is not. The interval answers every such test at once.',
  },
  {
    id: 'b06-m2-2', lesson: 'inference-for-coefficients', type: 'formula', kind: 'numerical',
    prompt: `Millbrook’s weekdays, 2 August – 10 September 2027: transactions in B2:B${last} and sales in C2:C${last}. Ana’s plan for Millbrook (a fictional planning figure) assumes the extra sales per extra transaction shown in F2. In F3, calculate the t statistic for testing the slope of sales on transactions against the value in F2.`,
    sheet: { cells: { ...mbCells, E2: 'Planned $ per transaction', F2: 4, E3: 't statistic' }, vary: { F2: [3.5, 4.6] } },
    cell: 'F3', answer: `=(SLOPE(C2:C${last},B2:B${last})-F2)/(STEYX(C2:C${last},B2:B${last})/SQRT(DEVSQ(B2:B${last})))`,
    alt: [`=(SLOPE(C2:C${last},B2:B${last})-F2)/INDEX(LINEST(C2:C${last},B2:B${last},TRUE,TRUE),2,1)`],
    view: `A1:F${last}`, maxHeight: '20rem', widths: { A: 11, E: 24 }, formats: { C: '#,##0.00', F2: '$0.00', F3: '0.00' },
    wrong: [
      { formula: `=SLOPE(C2:C${last},B2:B${last})/(STEYX(C2:C${last},B2:B${last})/SQRT(DEVSQ(B2:B${last})))`, say: 'That tests a slope of 0. Subtract the planned value first: (b₁ − F2) ÷ SE(b₁).' },
      { formula: `=(SLOPE(C2:C${last},B2:B${last})-F2)/STEYX(C2:C${last},B2:B${last})`, say: 'Divide by the slope’s standard error, s ÷ √Sxx, not by s itself.' },
      { formula: `=(SLOPE(B2:B${last},C2:C${last})-F2)/(STEYX(B2:B${last},C2:C${last})/SQRT(DEVSQ(C2:C${last})))`, say: 'The regression is of sales (C) on transactions (B): known_y’s are C.' },
    ],
    solution: `b₁ = $${FMB.coefs[1].estimate.toFixed(3)} per transaction, SE $${FMB.coefs[1].se.toFixed(3)}, so against $4.00: t = (${FMB.coefs[1].estimate.toFixed(3)} − 4) ÷ ${FMB.coefs[1].se.toFixed(3)} = ${fx(tMB, 2)} on ${FMB.df} df, p = ${R.tPTwo(tMB, FMB.df).toFixed(2)}. Six weeks of weekdays are consistent with the plan (95% interval $${FMB.coefs[1].low.toFixed(2)} to $${FMB.coefs[1].high.toFixed(2)}); the interval is wide, and the weekdays are consecutive, so check the residuals in date order before trusting it (here they show no sign of making it too narrow).`,
  },
  {
    id: 'b06-m2-3', lesson: 'inference-for-coefficients', type: 'num', kind: 'numerical',
    prompt: `Hollins Library (fictional) regresses weekly loans on weekly opening hours across ${LIB.n} branches: slope ${LIB.b} loans per extra hour, standard error ${LIB.se}. Calculate the lower end of the 90% confidence interval for the slope, to two decimal places.`,
    answer: rnd(LIB.b - tq(LIB.n - 2, 0.9) * LIB.se, 2), check: () => 2.8 - R.tQuantile(0.95, 13) * 1.1, unit: 'loans per hour', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(LIB.b - tq(LIB.n - 2) * LIB.se, 2), say: 'That is the 95% interval. For 90%, use T.INV.2T(0.10, 13) = 1.771.' },
      { value: rnd(LIB.b - 1.645 * LIB.se, 2), say: '1.645 is the normal value; with 15 branches use t on 13 df.' },
    ],
    solution: `t* = T.INV.2T(0.10, 13) = ${tq(13, 0.9).toFixed(3)}; lower end = 2.8 − ${tq(13, 0.9).toFixed(3)} × 1.1 = ${(LIB.b - tq(13, 0.9) * LIB.se).toFixed(2)} loans per hour (upper end ${(LIB.b + tq(13, 0.9) * LIB.se).toFixed(2)}). With 15 branches the slope is positive at 90% confidence but loosely pinned down; and branches with longer hours may differ in other ways (size, location), so it is not the effect of opening an hour longer.`,
  },
  {
    id: 'b06-m2-4', lesson: 'inference-for-coefficients', type: 'mc', kind: 'applied',
    prompt: 'Tarnby Hardware (fictional) regresses monthly sales on staff hours using 12 stores observed every month for three years: 432 rows. The slope’s standard error is small and p is below 0.001. What is the most important reason to doubt the standard error?',
    options: [
      'The rows are 12 stores measured again and again, so each store’s rows are related: far less independent evidence.',
      'Three years is too short a period for a regression, which needs at least ten years of monthly data to be reliable.',
      'Monthly sales are measured in dollars and staff hours in hours, so the slope’s units make its standard error meaningless.',
      'A p-value below 0.001 always means that the sample is too large, so the result should be recalculated on fewer rows.',
    ],
    answer: 0,
    feedback: {
      1: 'There is no fixed minimum span. The problem is what the rows are, not how many years they cover.',
      2: 'A slope has units of y per unit of x and its standard error the same; mixed units are normal.',
      3: 'Small p-values from large samples can be genuine. Throwing data away is not the fix; recognising dependence is.',
    },
    solution: 'Each store contributes 36 related rows: a busy store is busy month after month, and every store shares the same seasons. The formula treats 432 rows as independent, so its standard error is too small and its p-value too optimistic. The honest analysis allows for the clustering by store (or works with store averages) and for the shared months, and, since bigger stores both employ more staff and sell more, it doesn’t read the slope as the effect of adding hours.',
  },
  {
    id: 'b06-m2-5', lesson: 'inference-for-coefficients', type: 'classify', kind: 'conceptual',
    prompt: 'A simple regression gives a slope with standard error SE(b₁). Assuming independent rows, classify the effect of each change on SE(b₁).',
    items: [
      'The residual standard error doubles, with the same x values.',
      'The x values are spread twice as widely about their mean, with the same s and n.',
      'The confidence level of the reported interval rises from 95% to 99%.',
      'Four times as many independent rows are collected, with the same s and spread of x.',
      'Every x value is increased by 10 units, so the whole sample shifts to the right.',
    ],
    categories: ['Larger', 'Smaller', 'Unchanged'],
    answer: [0, 1, 2, 1, 2],
    feedback: {
      2: 'The confidence level changes t*, and so the interval’s width, but not the standard error itself.',
      4: 'Shifting every x leaves the deviations x − x̄, and so Sxx, unchanged; only the intercept changes.',
    },
    solution: 'SE(b₁) = s ÷ √Sxx. Doubling s doubles it; doubling the spread of x quadruples Sxx and halves it; four times the rows roughly quadruple Sxx and halve it. The confidence level affects the multiplier, not the standard error, and shifting x leaves Sxx alone.',
  },
  {
    id: 'b06-m2-6', lesson: 'inference-for-coefficients', type: 'mc', kind: 'conceptual',
    prompt: 'A beach-hut rental firm (fictional) regresses daily bookings on the day’s high, using summer days between 58°F and 91°F. The ToolPak shows the intercept with P-value 0.62 and the slope with P-value below 0.001. How should the intercept’s result be read?',
    options: [
      'Mostly ignored: it tests bookings at 0°F, far below the coldest day, so its value matters to no decision.',
      'As evidence that the model is wrong, because a good regression has every coefficient significant at the 5% level.',
      'As showing that bookings would be zero on a freezing day, so the firm can close in winter.',
      'As a reason to refit the line through the origin, since the intercept is not significantly different from zero.',
    ],
    answer: 0,
    feedback: {
      1: 'Coefficients don’t all need to be significant; the intercept is often there only to anchor the line.',
      2: 'Not rejecting β₀ = 0 isn’t evidence that β₀ = 0, and 0°F is an extrapolation the data can’t speak to.',
      3: 'Forcing the line through the origin changes the slope and the fit, to satisfy a test of an irrelevant point.',
    },
    solution: 'The intercept is the predicted bookings at 0°F, 58 degrees below the coldest day in the data. Its test asks whether that extrapolated value is 0, which matters to no decision. Keep the intercept in the model to anchor the line, and read the slope and its interval.',
  },
  // ---------------------------------------------------------------- prediction-and-intervals
  {
    id: 'b06-m2-7', lesson: 'prediction-and-intervals', type: 'mc', kind: 'conceptual',
    prompt: 'Each analyst below uses a fitted regression. Which of them needs a prediction interval rather than a confidence interval for the mean response?',
    options: [
      'A shop manager setting how much milk to order for tomorrow, from tomorrow’s forecast footfall.',
      'An analyst estimating the average energy bill of all two-bedroom flats in a city at a given floor area.',
      'A planner estimating the typical number of passengers on all 8 a.m. trains with eight carriages.',
      'A researcher estimating the mean yield of every field of a crop that gets a given amount of rain.',
    ],
    answer: 0,
    feedback: {
      1: 'An average over all such flats is a mean response; its interval narrows with more data.',
      2: '“Typical” over all such trains is the mean response, not one train.',
      3: 'The mean yield of every such field is the population line’s height: a confidence interval for the mean.',
    },
    solution: 'Only the milk order is about one future case, tomorrow, whose own scatter around the line must be allowed for: a prediction interval. The other three ask for the average over all cases with a given x, the confidence interval for the mean response.',
  },
  {
    id: 'b06-m2-8', lesson: 'prediction-and-intervals', type: 'formula', kind: 'numerical',
    prompt: `Millbrook’s weekdays, 2 August – 10 September 2027: transactions in B2:B${last} and sales in C2:C${last}. F1 holds a number of transactions. In F2, calculate in one formula the lower end of the 95% prediction interval for a day’s sales with that many transactions.`,
    sheet: { cells: { ...mbCells, E1: 'Transactions on the day', F1: 180, E2: 'Lower end, 95% prediction interval' }, vary: { F1: [160, 200] } },
    cell: 'F2', answer: `=FORECAST.LINEAR(F1,C2:C${last},B2:B${last})-T.INV.2T(0.05,COUNT(B2:B${last})-2)*STEYX(C2:C${last},B2:B${last})*SQRT(1+1/COUNT(B2:B${last})+(F1-AVERAGE(B2:B${last}))^2/DEVSQ(B2:B${last}))`,
    alt: [`=TREND(C2:C${last},B2:B${last},F1)-T.INV.2T(0.05,COUNT(B2:B${last})-2)*STEYX(C2:C${last},B2:B${last})*SQRT(1+1/COUNT(B2:B${last})+(F1-AVERAGE(B2:B${last}))^2/DEVSQ(B2:B${last}))`],
    require: ['STEYX'],
    view: `A1:F${last}`, maxHeight: '20rem', widths: { A: 11, E: 30 }, formats: { C: '#,##0.00', F2: '$#,##0.00' },
    wrong: [
      { formula: `=FORECAST.LINEAR(F1,C2:C${last},B2:B${last})-T.INV.2T(0.05,COUNT(B2:B${last})-2)*STEYX(C2:C${last},B2:B${last})*SQRT(1/COUNT(B2:B${last})+(F1-AVERAGE(B2:B${last}))^2/DEVSQ(B2:B${last}))`, say: 'That is the interval for the mean of all such days. One day needs 1+ under the square root.' },
      { formula: `=FORECAST.LINEAR(F1,C2:C${last},B2:B${last})-T.INV.2T(0.05,COUNT(B2:B${last})-1)*STEYX(C2:C${last},B2:B${last})*SQRT(1+1/COUNT(B2:B${last})+(F1-AVERAGE(B2:B${last}))^2/DEVSQ(B2:B${last}))`, say: 'The multiplier uses n − 2 degrees of freedom.' },
      { formula: `=FORECAST.LINEAR(F1,B2:B${last},C2:C${last})-T.INV.2T(0.05,COUNT(B2:B${last})-2)*STEYX(C2:C${last},B2:B${last})*SQRT(1+1/COUNT(B2:B${last})+(F1-AVERAGE(B2:B${last}))^2/DEVSQ(B2:B${last}))`, say: 'FORECAST.LINEAR takes known_y’s (sales, C) before known_x’s (transactions, B).' },
    ],
    solution: `At 180 transactions: ŷ = $${p180.yhat.toFixed(2)}, s = $${FMB.sigma.toFixed(2)}, and the 95% prediction interval runs from $${p180.piLow.toFixed(2)} to $${p180.piHigh.toFixed(2)}. The interval for the average 180-transaction weekday is much narrower, $${p180.ciLow.toFixed(2)} to $${p180.ciHigh.toFixed(2)}.`,
  },
  {
    id: 'b06-m2-9', lesson: 'prediction-and-intervals', type: 'num', kind: 'numerical',
    prompt: `A seafront launderette (fictional) regresses daily machine loads on the day’s high over ${LAUN.n} days: s = ${LAUN.s} loads, x̄ = ${LAUN.xbar}°F, Sxx = ${LAUN.sxx.toLocaleString('en-US')}. Calculate the half-width of the 95% prediction interval for one day with a high of ${LAUN.x0}°F, to two decimal places.`,
    answer: rnd(tq(LAUN.n - 2) * launSE, 2), check: () => R.tQuantile(0.975, 18) * 8 * Math.sqrt(1 + 0.05 + 100 / 2000), unit: 'loads', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(tq(LAUN.n - 2) * LAUN.s * Math.sqrt(1 / LAUN.n + 100 / LAUN.sxx), 2), say: 'That is the half-width for the mean response. One day adds 1 under the square root.' },
      { value: rnd(1.96 * launSE, 2), say: 'Use t on n − 2 = 18 df, 2.101, not 1.96.' },
      { value: rnd(tq(LAUN.n - 2) * LAUN.s * Math.sqrt(1 + 1 / LAUN.n + 10 / LAUN.sxx), 2), say: 'Square the distance from the mean: (60 − 50)² = 100.' },
    ],
    solution: `SE_pred = 8 × √(1 + 1/20 + 10²/2,000) = 8 × √1.10 = ${launSE.toFixed(3)} loads; half-width = ${tq(18).toFixed(3)} × ${launSE.toFixed(3)} = ${(tq(18) * launSE).toFixed(2)} loads. Almost all of it is the day’s own scatter, the 1 under the root.`,
  },
  {
    id: 'b06-m2-10', lesson: 'prediction-and-intervals', type: 'num', kind: 'applied',
    prompt: `Brambleby Bakery (fictional) predicts ${BAKE.yhat} customers for Saturday, with SE_pred = ${BAKE.sePred} from a regression on ${BAKE.n} Saturdays. Each counter server handles ${BAKE.per} customers a day. The owner will accept running short on about 1 Saturday in 20. How many servers should she roster?`,
    answer: Math.ceil(bakeUp / BAKE.per), check: () => Math.ceil((420 + R.tQuantile(0.95, 28) * 35) / 60), unit: 'servers', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(BAKE.yhat / BAKE.per), say: 'That covers the predicted customers only, so she would run short on about half of such Saturdays.' },
      { value: Math.ceil((BAKE.yhat + tq(BAKE.n - 2) * BAKE.sePred) / BAKE.per), say: 'That uses the top of a two-sided 95% interval, which is exceeded only 1 time in 40. One in 20 is a one-sided bound: T.INV(0.95, 28).' },
    ],
    solution: `One-sided 95% upper bound: 420 + T.INV(0.95, 28) × 35 = 420 + ${R.tQuantile(0.95, 28).toFixed(3)} × 35 = ${bakeUp.toFixed(1)} customers; ÷ 60 = ${(bakeUp / 60).toFixed(2)}, so ${Math.ceil(bakeUp / 60)} servers. The two-sided interval’s top, ${(BAKE.yhat + tq(28) * BAKE.sePred).toFixed(1)}, would call for ${Math.ceil((BAKE.yhat + tq(28) * BAKE.sePred) / 60)}: a safer roster than she asked for.`,
  },
  {
    id: 'b06-m2-11', lesson: 'prediction-and-intervals', type: 'mc', kind: 'applied',
    prompt: 'Glenfold Scooters (fictional) fits daily hires on the high using April–September days between 50°F and 90°F. For a January day forecast at 25°F, the line predicts −14 hires, with a prediction interval of −52 to 24. What should the firm conclude?',
    options: [
      'The model can’t be used at 25°F: it is outside the data, and a negative prediction shows the line doesn’t hold there.',
      'Expect no hires at all, since the prediction is below zero, and close the scheme for every day under 50°F.',
      'Take the interval’s top end, 24 hires, as a safe upper bound for January, since prediction intervals allow for extrapolation.',
      'Use the interval but widen it by 1.96 standard errors to allow for the colder conditions of the winter months.',
    ],
    answer: 0,
    feedback: {
      1: 'Below-zero predictions don’t imply zero; they show the straight line has run past where it applies. The data say nothing about January.',
      2: 'Prediction intervals measure scatter about an assumed line; they don’t allow for the line itself being wrong outside the data.',
      3: 'No fixed widening fixes extrapolation; the bias is unknown, not a known extra amount of noise.',
    },
    solution: '25°F is 25 degrees below the coldest day fitted, and January is outside the months sampled. The negative prediction is the line’s own warning that it doesn’t apply there. The firm needs winter data, or a model built for the full year, before forecasting January hires.',
  },
];
