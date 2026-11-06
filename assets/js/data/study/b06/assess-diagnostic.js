// assess-diagnostic.js — B06 course diagnostic: three items per module, each written so that it needs that module’s
// regression method, not the correlation of B05 (r, its test, partial correlation) or the tests and intervals of B04, so
// that a student who knows only those courses misses a module’s items and one who already has its method gets them right.
// Module 1: predicting y from x̄, ȳ, the SDs and r (b₁ = r·s_y/s_x through the means; dg-1); estimating x from y with
// the line of x on y, not the line of y on x solved for x (dg-2); the residual standard error from residuals, on n − 2
// degrees of freedom (dg-3).
// Module 2: SE(b₁) = s ÷ (s_x √(n − 1)) (dg-4); the overall F from R² and n, F = R²(n − 2)/(1 − R²) (dg-5); how much the
// confidence interval for the mean response widens away from x̄, √(1/n + (x₀ − x̄)²/Sxx) against √(1/n) (dg-6).
// Module 3: the long-regression slope from the short one by the omitted-variable formula b̃₁ = b₁ + b₂δ (dg-7);
// comparing two non-reference levels of a categorical predictor from their dummy coefficients (dg-8); a predictor’s R²
// on the others from its VIF (dg-9).
// Module 4: what HC3 robust standard errors change and leave alone (dg-10); a log-level coefficient over a several-unit
// change, e^(b·Δx) − 1 (dg-11); a probability from a member’s predicted probability and an odds ratio (dg-12).
// Modules 1–3 use only mc and num items, which score 0 or 1, so the route can’t be passed on part marks; module 4 is not
// used for routing. Every business, person and number is fictional (no café data, so nothing here depends on how the
// log was generated); every num item’s `check` recomputes its answer, and every figure an item shows is computed below
// with core/regression.js. New questions, not copies of lesson exercises, module tests, the final or the project.
// No hints; solutions are shown on review.
import * as R from '../../../core/regression.js?v=26';

const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const sum = (a) => a.reduce((s, v) => s + v, 0);
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);

// dg-1 Frostmere Ice Rink (fictional): the day’s high (°F) and skaters
const RINK = { xbar: 41, sx: 9, ybar: 520, sy: 110, r: -0.62, x0: 55 };
const rinkB1 = (k) => (k.r * k.sy) / k.sx;
const rinkHat = (k) => k.ybar + rinkB1(k) * (k.x0 - k.xbar);
// dg-2 Quillmoor Couriers (fictional): a van’s daily distance (km) and fuel used (litres)
const VAN = { xbar: 180, sx: 40, ybar: 21, sy: 4.5, r: 0.8, y0: 27 };
const kmFromFuel = (k) => k.xbar + k.r * (k.sx / k.sy) * (k.y0 - k.ybar);
const kmInverted = (k) => k.xbar + (k.y0 - k.ybar) / (k.r * k.sy / k.sx);
// dg-3 Pellmore Removals (fictional): rooms in a house (x) and hours a job took (y)
const ROOMS = [2, 3, 3, 4, 5, 5, 6, 8], HOURS = [3.5, 4.0, 5.5, 5.0, 6.5, 7.5, 7.0, 10.5];
const MOVE = R.fit(HOURS, { Rooms: ROOMS });
const RES = Array.from(MOVE.resid, (e) => rnd(e, 2));
const sseShown = sum(RES.map((e) => e * e));
const sRes = Math.sqrt(sseShown / (RES.length - 2));
// dg-4 Ellerby Garden Centre (fictional): weekly sales on hours of sunshine
const SUN = { s: 14, sx: 6.5, n: 26 };
const seB1 = (k) => k.s / (k.sx * Math.sqrt(k.n - 1));
// dg-5 a simple regression’s R² and n
const FR = { r2: 0.3, n: 22 };
const fFromR2 = (k) => (k.r2 * (k.n - 2)) / (1 - k.r2);
// dg-6 Wistow Leisure Pool (fictional): daily swims on the high
const POOL = { n: 24, xbar: 68, sxx: 1800, x0: 80 };
const widen = (k) => Math.sqrt(1 / k.n + (k.x0 - k.xbar) ** 2 / k.sxx) / Math.sqrt(1 / k.n);
// dg-7 Haverleigh Ice Cream (fictional): sales on leaflets, then on leaflets and the high
const VANS = { short: 4.1, b2: 12, delta: 0.15 };
// dg-8 Thornick Buses (fictional): minutes late on rain and depot (North the reference)
const BUS = { east: 4.6, west: -2.3 };
// dg-9 a predictor with VIF 4
const VIF9 = 4;
// dg-11 Saltrigg Ferries (fictional): ln(passengers) on the high (°C)
const FERRY = { b: 0.035, dx: 5 };
// dg-12 Oxlade Library (fictional): returning a book on time, reminder text (a borrower predicted at 0.60 without one)
const LIB = { p0: 0.6, or: 2.5 };
const pFromOR = (p0, or) => { const o = (p0 / (1 - p0)) * or; return o / (1 + o); };

export const items = [
  // ================================================================ Module 1: fitting a line
  {
    id: 'b06-dg-1', lesson: 'least-squares-line', type: 'num', kind: 'numerical',
    prompt: `Frostmere Ice Rink (fictional) has a winter’s records of the day’s high and the number of skaters. The high has mean ${RINK.xbar}°F and standard deviation ${RINK.sx}°F; skaters have mean ${RINK.ybar} and standard deviation ${RINK.sy}; the correlation is r = ${fx(RINK.r, 2)}. Using the least-squares line of skaters on the high, how many skaters should the rink expect on a ${RINK.x0}°F day? Give a whole number.`,
    answer: Math.round(rinkHat(RINK)),
    check: () => 520 + (-0.62 * 110 / 9) * (55 - 41),
    unit: 'skaters', places: 0, tol: 1,
    wrong: [
      { value: Math.round(RINK.ybar - (RINK.sy / RINK.sx) * (RINK.x0 - RINK.xbar)), say: 'That moves skaters as many standard deviations as the high moved, as if r were −1. The least-squares line predicts r times as many: b₁ = r × s_y ÷ s_x.' },
      { value: Math.round(RINK.ybar + RINK.r * (RINK.sx / RINK.sy) * (RINK.x0 - RINK.xbar)), say: 'The slope is r × s_y ÷ s_x: skaters’ SD over the high’s, not the other way round.' },
      { value: Math.round(RINK.ybar + rinkB1(RINK) * RINK.x0), say: 'The line passes through the means: start from 520 at 41°F and move 14 degrees, rather than multiplying the slope by 55.' },
    ],
    solution: `The least-squares slope is b₁ = r × s_y ÷ s_x = ${fx(RINK.r, 2)} × ${RINK.sy} ÷ ${RINK.sx} = ${fx(rinkB1(RINK), 3)} skaters per °F, and the line passes through (x̄, ȳ) = (${RINK.xbar}, ${RINK.ybar}). At ${RINK.x0}°F, 14 degrees above the mean: ŷ = ${RINK.ybar} + (${fx(rinkB1(RINK), 3)}) × 14 = ${fx(rinkHat(RINK), 1)}, about ${Math.round(rinkHat(RINK))} skaters. The high is 14 ÷ 9 = ${fx(14 / 9, 2)} SDs above its mean, and the prediction is only ${fx(-RINK.r * 14 / 9, 2)} SDs below skaters’ mean: regression toward the mean.`,
  },
  {
    id: 'b06-dg-2', lesson: 'least-squares-line', type: 'num', kind: 'applied',
    prompt: `Quillmoor Couriers (fictional) records each van’s daily distance and fuel. Distance has mean ${VAN.xbar} km and standard deviation ${VAN.sx} km; fuel has mean ${VAN.ybar} litres and standard deviation ${VAN.sy} litres; r = ${VAN.r}. One van’s odometer failed on a day it used ${VAN.y0} litres. Estimate its distance that day from the least-squares line suited to the job. Give km to one decimal place.`,
    answer: rnd(kmFromFuel(VAN), 1),
    check: () => 180 + 0.8 * (40 / 4.5) * (27 - 21),
    unit: 'km', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(kmInverted(VAN), 1), say: 'That solves the line of fuel on distance for distance. That line minimises misses in fuel; to estimate distance from fuel, use the line of distance on fuel, slope r × s_x ÷ s_y.' },
      { value: rnd(VAN.xbar + (VAN.sx / VAN.sy) * (VAN.y0 - VAN.ybar), 1), say: 'That moves distance as many SDs as fuel moved, as if r were 1. The line of distance on fuel moves r times as far.' },
    ],
    solution: `To estimate x from y, regress x on y: slope r × s_x ÷ s_y = ${VAN.r} × ${VAN.sx} ÷ ${VAN.sy} = ${fx(VAN.r * VAN.sx / VAN.sy, 3)} km per litre, through the means. x̂ = ${VAN.xbar} + ${fx(VAN.r * VAN.sx / VAN.sy, 3)} × (${VAN.y0} − ${VAN.ybar}) = ${fx(kmFromFuel(VAN), 1)} km. Solving the line of fuel on distance for distance gives ${fx(kmInverted(VAN), 1)} km, too far from the mean: with r below 1 the two lines differ, and each is the best predictor only in its own direction.`,
  },
  {
    id: 'b06-dg-3', lesson: 'residuals-and-r-squared', type: 'num', kind: 'numerical',
    prompt: `Pellmore Removals (fictional) fitted a least-squares line of a job’s hours on the number of rooms, from ${ROOMS.length} jobs. The residuals, in hours, are ${RES.map((e) => fx(e, 2)).join(', ')}. What is the line’s residual standard error, in hours? Give two decimal places.`,
    answer: rnd(sRes, 2),
    check: () => { const e = Array.from(MOVE.resid, (v) => Math.round(v * 100) / 100); return Math.sqrt(e.reduce((s, v) => s + v * v, 0) / 6); },
    unit: 'hours', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(Math.sqrt(sseShown / (RES.length - 1)), 2), say: 'That divides by n − 1, as a standard deviation of one variable does. A line estimates two coefficients from the data, so the residual standard error divides the sum of squared residuals by n − 2.' },
      { value: rnd(Math.sqrt(sseShown / RES.length), 2), say: 'Dividing by n gives the root mean squared residual, which understates the spread of new jobs around the line. Divide by n − 2.' },
      { value: rnd(sum(RES.map(Math.abs)) / RES.length, 2), say: 'That is the mean absolute residual. The residual standard error squares the residuals, sums them and divides by n − 2 before taking the root.' },
    ],
    solution: `Square and add the residuals: SSE = ${fx(sseShown, 4)}. The line used two estimated coefficients, so s = √(SSE ÷ (n − 2)) = √(${fx(sseShown, 4)} ÷ 6) = ${fx(sRes, 2)} hours (Excel’s STEYX on the raw data). A typical job misses the line by about ${fx(sRes, 1)} hours, which is what the firm should allow for when it quotes a time.`,
  },

  // ================================================================ Module 2: inference and prediction
  {
    id: 'b06-dg-4', lesson: 'inference-for-coefficients', type: 'num', kind: 'numerical',
    prompt: `Ellerby Garden Centre (fictional) regresses weekly sales, in hundreds of dollars, on hours of sunshine over ${SUN.n} weeks. The residual standard error is s = ${SUN.s} (hundred dollars) and sunshine has a standard deviation of ${SUN.sx} hours. What is the standard error of the slope, in hundreds of dollars per hour? Give four decimal places.`,
    answer: rnd(seB1(SUN), 4),
    check: () => 14 / Math.sqrt(6.5 ** 2 * 25),
    unit: '', places: 4, tol: 0.0001,
    wrong: [
      { value: rnd(SUN.s / (SUN.sx * Math.sqrt(SUN.n)), 4), say: 'Sxx = (n − 1)s_x², so √Sxx = s_x√(n − 1) = 6.5 × √25, not 6.5 × √26.' },
      { value: rnd(SUN.s / Math.sqrt(SUN.n), 4), say: 's ÷ √n is the standard error of a mean. The slope’s standard error divides s by the spread of x: s ÷ √Sxx.' },
      { value: rnd(SUN.s / SUN.sx, 4), say: 'That leaves out the number of weeks. More weeks pin the slope down better: SE(b₁) = s ÷ (s_x√(n − 1)).' },
    ],
    solution: `SE(b₁) = s ÷ √Sxx, and Sxx = Σ(x − x̄)² = (n − 1)s_x² = 25 × ${SUN.sx}² = ${fx(25 * SUN.sx ** 2, 2)}. So SE(b₁) = ${SUN.s} ÷ √${fx(25 * SUN.sx ** 2, 2)} = ${SUN.s} ÷ ${fx(SUN.sx * 5, 1)} = ${fx(seB1(SUN), 4)} hundred dollars per hour of sunshine. It shrinks with less scatter (s), a wider spread of sunshine (s_x) and more weeks; and it assumes the weeks are independent, which successive weeks of weather may not be.`,
  },
  {
    id: 'b06-dg-5', lesson: 'inference-for-coefficients', type: 'num', kind: 'numerical',
    prompt: `A simple regression on ${FR.n} rows has R² = ${FR.r2}. What is its overall F statistic? Give two decimal places.`,
    answer: rnd(fFromR2(FR), 2),
    check: () => (0.3 / 1) / ((1 - 0.3) / 20),
    unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((FR.r2 * FR.n) / (1 - FR.r2), 2), say: 'F divides the residual sum of squares by its degrees of freedom, n − 2, not n.' },
      { value: rnd(FR.r2 / (1 - FR.r2), 2), say: 'That ratio of explained to unexplained variance needs each part divided by its degrees of freedom: 1 for the model, n − 2 for the residuals.' },
      { value: rnd(Math.sqrt(fFromR2(FR)), 2), say: 'That is |t| for the slope. With one predictor F = t².' },
    ],
    solution: `F = (SSR ÷ 1) ÷ (SSE ÷ (n − 2)), and SSR = R² × SST, SSE = (1 − R²) × SST, so F = R²(n − 2) ÷ (1 − R²) = ${FR.r2} × 20 ÷ ${fx(1 - FR.r2, 1)} = ${fx(fFromR2(FR), 2)} on 1 and 20 df (p = ${fx(R.tPTwo(Math.sqrt(fFromR2(FR)), 20), 3)}, the same as the slope’s t test, since t² = F).`,
  },
  {
    id: 'b06-dg-6', lesson: 'prediction-and-intervals', type: 'num', kind: 'applied',
    prompt: `Wistow Leisure Pool (fictional) regresses daily swims on the high over ${POOL.n} summer days, with x̄ = ${POOL.xbar}°F and Sxx = ${POOL.sxx.toLocaleString('en-US')}. How many times as wide is the 95% confidence interval for the mean number of swims at ${POOL.x0}°F as the same interval at ${POOL.xbar}°F? Give two decimal places.`,
    answer: rnd(widen(POOL), 2),
    check: () => Math.sqrt((1 / 24 + 144 / 1800) * 24),
    unit: 'times', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(Math.sqrt(1 + 1 / POOL.n + (POOL.x0 - POOL.xbar) ** 2 / POOL.sxx) / Math.sqrt(1 + 1 / POOL.n), 2), say: 'That compares prediction intervals for one day, with the 1 under the root. The mean’s interval has only 1/n + (x₀ − x̄)²/Sxx.' },
      { value: rnd(widen(POOL) ** 2, 2), say: 'That compares the squared SEs. The interval’s width goes with the SE, the square root.' },
    ],
    solution: `The mean response’s SE is s√(1/n + (x₀ − x̄)²/Sxx); s and t* are the same at both highs, so the ratio of widths is √(1/24 + 144/1,800) ÷ √(1/24) = ${fx(widen(POOL), 2)}. At the mean high only the intercept’s uncertainty counts; 12 degrees away the slope’s uncertainty adds (x₀ − x̄)²/Sxx, which more than doubles the variance here. A single day’s prediction interval widens far less in relative terms, since its own scatter s dominates.`,
  },

  // ================================================================ Module 3: multiple regression
  {
    id: 'b06-dg-7', lesson: 'multiple-regression', type: 'num', kind: 'applied',
    prompt: `Haverleigh Ice Cream (fictional) regresses a van’s daily sales on its leaflet spending alone and finds $${fx(VANS.short, 2)} of sales per $1 of leaflets. Drivers hand out more leaflets on warm days: the slope of the day’s high on leaflet spending is ${VANS.delta} °F per $. In the regression on both leaflets and the high, the high’s slope is $${VANS.b2} per °F. What is the leaflet slope in that regression, in dollars of sales per $1? Give two decimal places.`,
    answer: rnd(VANS.short - VANS.b2 * VANS.delta, 2),
    check: () => 4.1 - 12 * 0.15,
    unit: '$ per $', places: 2, tol: 0.005,
    wrong: [
      { value: rnd(VANS.short + VANS.b2 * VANS.delta, 2), say: 'The short slope includes the high’s association: b̃₁ = b₁ + b₂δ, so the slope holding the high fixed is the short slope minus b₂δ.' },
      { value: rnd(VANS.b2 * VANS.delta, 2), say: '$1.80 is the part of the short slope that came from warm weather. Subtract it from $4.10 to get the leaflet slope with the high held fixed.' },
      { value: VANS.short, say: 'The slope changes when the added predictor is related to leaflets (δ ≠ 0) and to sales (b₂ ≠ 0), as here.' },
    ],
    solution: `Omitted-variable formula: the short slope = the long slope + b₂ × δ, where δ is the slope of the omitted variable on the included one. So b₁ = ${fx(VANS.short, 2)} − ${VANS.b2} × ${VANS.delta} = ${fx(VANS.short - VANS.b2 * VANS.delta, 2)} dollars per $1 of leaflets, for days of the same high. Even that is an association: drivers choose where and when to leaflet.`,
  },
  {
    id: 'b06-dg-8', lesson: 'categorical-predictors-and-interactions', type: 'num', kind: 'numerical',
    prompt: `Thornick Buses (fictional) has three depots: North, East and West. It regresses a route’s average minutes late on the day’s rain and dummies for East and West (North is the reference). The East coefficient is ${fx(BUS.east, 1)} minutes and the West coefficient is ${fx(BUS.west, 1)} minutes. On days with the same rain, how many minutes later are East’s buses than West’s? Give one decimal place.`,
    answer: rnd(BUS.east - BUS.west, 1),
    check: () => 4.6 - (-2.3),
    unit: 'minutes', places: 1, tol: 0.05,
    wrong: [
      { value: BUS.east, say: '4.6 compares East with North, the reference depot. East against West is the difference of the two coefficients.' },
      { value: rnd(BUS.east + BUS.west, 1), say: 'West’s coefficient is negative (West is earlier than North), so the gap from East to West is 4.6 − (−2.3), not 4.6 + (−2.3).' },
    ],
    solution: `Each dummy coefficient compares its depot with North, holding rain fixed: East runs 4.6 minutes later than North and West 2.3 minutes earlier. East against West is ${fx(BUS.east, 1)} − (${fx(BUS.west, 1)}) = ${fx(BUS.east - BUS.west, 1)} minutes. The output gives no direct test of that gap: refit with West (or East) as the reference to get its standard error.`,
  },
  {
    id: 'b06-dg-9', lesson: 'multicollinearity-and-model-choice', type: 'num', kind: 'numerical',
    prompt: `In a model with five predictors, one of them has a variance inflation factor of ${VIF9}. What is the R² of the regression of that predictor on the other four? Give two decimal places.`,
    answer: rnd(1 - 1 / VIF9, 2),
    check: () => 1 - 1 / 4,
    unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: rnd(1 / VIF9, 2), say: 'That is 1 − R²ⱼ, the share of the predictor not explained by the others. VIF = 1 ÷ (1 − R²ⱼ).' },
      { value: rnd(1 - 1 / Math.sqrt(VIF9), 2), say: '√VIF is the factor on the standard error. VIF itself is 1 ÷ (1 − R²ⱼ), with no square root.' },
    ],
    solution: `VIF = 1 ÷ (1 − R²ⱼ), so R²ⱼ = 1 − 1/VIF = 1 − 1/${VIF9} = ${fx(1 - 1 / VIF9, 2)}. Three quarters of that predictor’s variation is shared with the other four, so its slope’s variance is ${VIF9} times, and its SE √${VIF9} = 2 times, what it would be with unrelated predictors. Warning levels of 5 or 10 are conventions, not rules.`,
  },

  // ================================================================ Module 4: checking and extending a model
  {
    id: 'b06-dg-10', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'conceptual',
    prompt: 'A model’s residuals fan out as the fitted values grow, and the Breusch–Pagan test is significant. The analyst switches to HC3 robust standard errors. What changes?',
    options: [
      'The standard errors, t statistics, p-values and intervals; the coefficients stay',
      'The coefficients, which are re-estimated with less weight on the noisy rows',
      'The coefficients and R², since the funnel had biased both of them upwards',
      'Little in the output; HC3 mainly confirms whether the residuals are normal',
    ],
    answer: 0,
    feedback: {
      1: 'Robust standard errors keep the least-squares coefficients. Down-weighting noisy rows is weighted least squares, a different method.',
      2: 'Unequal variance doesn’t bias least-squares coefficients or change R²; it makes the usual standard errors wrong. HC3 changes only the standard errors and what is built on them.',
      3: 'HC3 has nothing to do with normality. It recomputes the standard errors so that they stay valid when the variance is unequal.',
    },
    solution: 'Heteroskedasticity leaves the least-squares coefficients unbiased but makes the usual formula for their standard errors wrong. HC3 keeps the same coefficients, fitted values and R², and replaces the standard errors with ones that allow each row its own variance; the t statistics, p-values and confidence intervals change with them. Prediction intervals still assume one spread for every case, so they need a model of the spread (often a log of y), not robust SEs.',
  },
  {
    id: 'b06-dg-11', lesson: 'transformations-and-influence', type: 'num', kind: 'numerical',
    prompt: `Saltrigg Ferries (fictional) regresses ln(daily passengers) on the day’s high in °C and finds a slope of ${FERRY.b}. By what percentage does the model expect passengers to differ on a day ${FERRY.dx}°C warmer? Give one decimal place.`,
    answer: rnd((Math.exp(FERRY.b * FERRY.dx) - 1) * 100, 1),
    check: () => (Math.exp(0.035 * 5) - 1) * 100,
    unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(FERRY.b * FERRY.dx * 100, 1), say: '0.035 × 5 = 0.175 is the change in ln(passengers). As a percentage it is e^0.175 − 1, which is noticeably more than 17.5% for a change this size.' },
      { value: rnd(((1 + FERRY.b) ** FERRY.dx - 1) * 100, 1), say: 'That compounds a 3.5% rise five times. Each degree multiplies passengers by e^0.035 = 1.0356, not 1.035.' },
      { value: rnd((Math.exp(FERRY.b) - 1) * 100, 1), say: 'That is the change for one degree. Five degrees multiply passengers by e^(0.035 × 5).' },
    ],
    solution: `In a log-level model each °C adds ${FERRY.b} to ln(passengers), so five degrees add ${fx(FERRY.b * FERRY.dx, 3)} and multiply passengers by e^${fx(FERRY.b * FERRY.dx, 3)} = ${fx(Math.exp(FERRY.b * FERRY.dx), 4)}: about ${fx((Math.exp(FERRY.b * FERRY.dx) - 1) * 100, 1)}% more. The approximation “b × 100% per unit” works for small changes; over five degrees it understates the change by more than a point and a half.`,
  },
  {
    id: 'b06-dg-12', lesson: 'logistic-regression', type: 'num', kind: 'numerical',
    prompt: `Oxlade Library (fictional) models whether a borrower returns a book on time. A logistic regression gives a reminder text an odds ratio of ${LIB.or}, holding the other predictors fixed. A borrower whose predicted probability without a reminder is ${fx(LIB.p0, 2)} gets one. For that borrower, what probability of returning on time does the model give? Give three decimal places.`,
    answer: rnd(pFromOR(LIB.p0, LIB.or), 3),
    check: () => { const o = (0.6 / 0.4) * 2.5; return o / (1 + o); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(LIB.p0 * LIB.or, 3), say: 'An odds ratio multiplies the odds, not the probability (and 0.6 × 2.5 is not a probability at all). Turn 0.60 into odds of 1.5 first.' },
      { value: rnd((LIB.p0 / (1 - LIB.p0)) * LIB.or, 3), say: '3.75 is the new odds. Convert back to a probability: odds ÷ (1 + odds).' },
      { value: rnd(LIB.or / (1 + LIB.or), 3), say: 'That treats the odds ratio as the odds. Multiply the starting odds, 0.6 ÷ 0.4 = 1.5, by 2.5 first.' },
    ],
    solution: `Odds without a reminder: 0.6 ÷ 0.4 = 1.5. The odds ratio multiplies the odds: 1.5 × 2.5 = 3.75. Back to a probability: 3.75 ÷ 4.75 = ${fx(pFromOR(LIB.p0, LIB.or), 3)}. The rise is ${fx((pFromOR(LIB.p0, LIB.or) - LIB.p0) * 100, 1)} points; the same odds ratio would move a borrower who starts at 10% by only ${fx((pFromOR(0.1, LIB.or) - 0.1) * 100, 1)} points, because odds ratios act on odds, not on probabilities. And unless reminders were assigned at random, the odds ratio is an association, not the effect of sending one.`,
  },
];

export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
