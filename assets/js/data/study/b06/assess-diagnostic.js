// assess-diagnostic.js — B06 course diagnostic: three items per module, each written so that it needs that module’s
// regression method, not the correlation of B05 (r, its test, partial correlation) or the tests and intervals of B04, so
// that a student who knows only those courses misses a module’s items and one who already has its method gets them right.
// Module 1: predicting y from x̄, ȳ, the SDs and r (b₁ = r·s_y/s_x through the means; dg-1); picking the least-squares
// line for five points (slope Sxy/Sxx through the means, not the line of x on y turned round; dg-2); the residual
// standard error from residuals, on n − 2 degrees of freedom (dg-3).
// Module 2: SE(b₁) = s ÷ (s_x √(n − 1)) (dg-4); with one predictor the F test’s Significance F is the slope’s p-value
// (t² = F; dg-5); the confidence interval for the mean response at x₀ with 1/n + (x₀ − x̄)²/Sxx (dg-6).
// Module 3: the direction of omitted-variable bias when a correlated predictor is added (dg-7); comparing two
// non-reference levels of a categorical predictor from their dummy coefficients (dg-8); the VIF from the correlation of
// two predictors (dg-9).
// Module 4: what HC3 robust standard errors change and leave alone (dg-10); a log-level coefficient over a several-unit
// change, e^(b·Δx) − 1 (dg-11); a probability from a base-rate probability and an odds ratio (dg-12).
// Modules 1–3 use only mc and num items, which score 0 or 1, so the route can’t be passed on part marks; module 4 is not
// used for routing. Every business, person and number is fictional (no café data, so nothing here depends on how the
// log was generated); every num item’s `check` recomputes its answer, and every figure an item shows is computed below
// with core/regression.js. New questions, not copies of lesson exercises, module tests, the final or the project.
// No hints; solutions are shown on review.
import * as R from '../../../core/regression.js?v=22';

const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const sum = (a) => a.reduce((s, v) => s + v, 0);
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);

// dg-1 Frostmere Ice Rink (fictional): the day’s high (°F) and skaters
const RINK = { xbar: 41, sx: 9, ybar: 520, sy: 110, r: -0.62, x0: 55 };
const rinkB1 = (k) => (k.r * k.sy) / k.sx;
const rinkHat = (k) => k.ybar + rinkB1(k) * (k.x0 - k.xbar);
// dg-2 Cindermoor Pottery (fictional): Instagram posts in a week (x) and workshop sign-ups (y)
const POSTS = [1, 2, 3, 4, 5], SIGNS = [3, 5, 4, 8, 10];
const LS2 = R.fit(SIGNS, { Posts: POSTS });
const sseOf = (b0, b1) => sum(POSTS.map((x, i) => (SIGNS[i] - b0 - b1 * x) ** 2));
const xOnY = R.fit(POSTS, { Signups: SIGNS });
const inv = { b1: 1 / xOnY.beta[1] }; inv.b0 = sum(SIGNS) / 5 - inv.b1 * (sum(POSTS) / 5);
const ends = { b1: (SIGNS[4] - SIGNS[0]) / (POSTS[4] - POSTS[0]) }; ends.b0 = SIGNS[0] - ends.b1 * POSTS[0];
const LINES = [
  { b0: LS2.beta[0], b1: LS2.beta[1] },
  { b0: inv.b0, b1: inv.b1 },
  { b0: ends.b0, b1: ends.b1 },
  { b0: sum(SIGNS) / 5, b1: LS2.beta[1] },
];
if (LINES.slice(1).some((l) => sseOf(l.b0, l.b1) <= sseOf(LINES[0].b0, LINES[0].b1))) throw new Error('b06 diagnostic dg-2: the key is not the least-squares line');
const lineText = (l) => `ŷ = ${fx(l.b0, 2)} + ${fx(l.b1, 2)}x`;
// dg-3 Stobart Removals (fictional): rooms in a house (x) and hours a job took (y)
const ROOMS = [2, 3, 3, 4, 5, 5, 6, 8], HOURS = [3.5, 4.0, 5.5, 5.0, 6.5, 7.5, 7.0, 10.5];
const MOVE = R.fit(HOURS, { Rooms: ROOMS });
const RES = Array.from(MOVE.resid, (e) => rnd(e, 2));
const sseShown = sum(RES.map((e) => e * e));
const sRes = Math.sqrt(sseShown / (RES.length - 2));
// dg-4 Ellerby Garden Centre (fictional): weekly sales on hours of sunshine
const SUN = { s: 14, sx: 6.5, n: 26 };
const seB1 = (k) => k.s / (k.sx * Math.sqrt(k.n - 1));
// dg-6 Wistow Leisure Pool (fictional): daily swims on the high
const POOL = { n: 24, s: 35, xbar: 68, sxx: 1800, x0: 80, b0: -310, b1: 9.2 };
const poolHat = POOL.b0 + POOL.b1 * POOL.x0;
const poolSeMean = POOL.s * Math.sqrt(1 / POOL.n + (POOL.x0 - POOL.xbar) ** 2 / POOL.sxx);
const poolSePred = POOL.s * Math.sqrt(1 + 1 / POOL.n + (POOL.x0 - POOL.xbar) ** 2 / POOL.sxx);
// dg-8 Thornick Buses (fictional): minutes late on rain and depot (North the reference)
const BUS = { east: 4.6, west: -2.3 };
// dg-9 two predictors correlated at r = 0.9
const VIFR = 0.9;
// dg-11 Saltrigg Ferries (fictional): ln(passengers) on the high (°C)
const FERRY = { b: 0.035, dx: 5 };
// dg-12 Oxlade Library (fictional): returning a book on time, reminder text
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
    id: 'b06-dg-2', lesson: 'least-squares-line', type: 'mc', kind: 'numerical',
    prompt: `Cindermoor Pottery (fictional) counted, for five weeks, its Instagram posts (x: ${POSTS.join(', ')}) and the workshop sign-ups that followed (y: ${SIGNS.join(', ')}). Which of these is the least-squares line of sign-ups on posts?`,
    options: LINES.map(lineText),
    answer: 0,
    feedback: {
      1: `That line goes through the means with slope ${fx(inv.b1, 2)}: it is the line of posts on sign-ups solved for y. Regressing x on y minimises misses in x, a different criterion; the line of y on x has slope Sxy ÷ Sxx = ${fx(LS2.beta[1], 2)}.`,
      2: 'That joins the first and last weeks. A line through two chosen points ignores the other three; the least-squares line uses every point and has the smallest sum of squared residuals.',
      3: `The slope is right but the intercept isn’t: ${fx(sum(SIGNS) / 5, 0)} is ȳ, the value at the mean of x (3 posts), not at x = 0. b₀ = ȳ − b₁x̄.`,
    },
    solution: `x̄ = 3, ȳ = 6; Sxx = Σ(x − x̄)² = 10 and Sxy = Σ(x − x̄)(y − ȳ) = ${fx(LS2.beta[1] * 10, 0)}. b₁ = Sxy ÷ Sxx = ${fx(LS2.beta[1], 2)} sign-ups per post and b₀ = ȳ − b₁x̄ = 6 − ${fx(LS2.beta[1], 2)} × 3 = ${fx(LS2.beta[0], 2)}. Its sum of squared residuals is ${fx(sseOf(LINES[0].b0, LINES[0].b1), 2)}, against ${LINES.slice(1).map((l) => fx(sseOf(l.b0, l.b1), 2)).join(', ')} for the other three lines. Five weeks show only an association; busy weeks may get both more posts and more sign-ups.`,
  },
  {
    id: 'b06-dg-3', lesson: 'residuals-and-r-squared', type: 'num', kind: 'numerical',
    prompt: `Stobart Removals (fictional) fitted a least-squares line of a job’s hours on the number of rooms, from ${ROOMS.length} jobs. The residuals, in hours, are ${RES.map((e) => fx(e, 2)).join(', ')}. What is the line’s residual standard error, in hours? Give two decimal places.`,
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
    id: 'b06-dg-5', lesson: 'inference-for-coefficients', type: 'mc', kind: 'conceptual',
    prompt: 'A ToolPak Regression output for one X variable shows, in its ANOVA table, F = 7.4 and Significance F = 0.012. The coefficient table’s row for the slope has been cut off. What can you say about the slope’s two-sided p-value and t statistic?',
    options: [
      'The p-value is 0.012 and |t| = √7.4 ≈ 2.72',
      'The p-value is 0.006, half of Significance F, and t = 7.4',
      'The p-value is 0.012 but t can’t be found without SE(b₁)',
      'Nothing: F tests the whole model, not the slope on its own',
    ],
    answer: 0,
    feedback: {
      1: 'Significance F is already two-sided in effect: F = t² counts large t of either sign. And t is the square root of F, not F itself.',
      2: 'With one predictor the F statistic is the slope’s t squared, so |t| = √F follows from F.',
      3: 'With a single X variable “the whole model” is the slope: the F test and the slope’s t test are the same test, so their p-values agree.',
    },
    solution: 'With one predictor the F test asks whether the slope is zero, the same question as the slope’s t test, and F = t². So the slope’s two-sided p-value equals Significance F, 0.012, and |t| = √7.4 ≈ 2.72 (its sign is the slope’s). With several predictors the two differ: F then tests all slopes at once.',
  },
  {
    id: 'b06-dg-6', lesson: 'prediction-and-intervals', type: 'num', kind: 'applied',
    prompt: `Wistow Leisure Pool (fictional) regresses daily swims on the high over ${POOL.n} summer days: ŷ = ${fx(POOL.b0, 0)} + ${fx(POOL.b1, 1)}x, s = ${POOL.s} swims, x̄ = ${POOL.xbar}°F, Sxx = ${POOL.sxx.toLocaleString('en-US')}. The manager wants a 95% interval for the average number of swims on all ${POOL.x0}°F days, to set the lifeguards’ standard roster. What is its upper end? Give a whole number of swims.`,
    answer: Math.round(poolHat + tq(POOL.n - 2) * poolSeMean),
    check: () => (-310 + 9.2 * 80) + R.tQuantile(0.975, 22) * 35 * Math.sqrt(1 / 24 + 144 / 1800),
    unit: 'swims', places: 0, tol: 1,
    wrong: [
      { value: Math.round(poolHat + tq(POOL.n - 2) * poolSePred), say: 'That is the prediction interval for one day’s swims, with the extra 1 under the root. The manager asked about the average over all such days: the confidence interval for the mean response.' },
      { value: Math.round(poolHat + tq(POOL.n - 2) * POOL.s * Math.sqrt(1 / POOL.n)), say: 'That leaves out (x₀ − x̄)² ÷ Sxx. 80°F is 12 degrees above the mean high, where the slope’s uncertainty widens the interval.' },
      { value: Math.round(poolHat + tq(POOL.n - 2) * POOL.s), say: 'That uses s itself as the standard error. The mean response is pinned down far better than one day: its SE is s√(1/n + (x₀ − x̄)²/Sxx).' },
    ],
    solution: `ŷ = ${fx(POOL.b0, 0)} + ${fx(POOL.b1, 1)} × ${POOL.x0} = ${fx(poolHat, 0)} swims. SE of the mean response = s√(1/n + (x₀ − x̄)²/Sxx) = 35 × √(1/24 + 144/1,800) = ${fx(poolSeMean, 2)}. With t* = T.INV.2T(0.05, 22) = ${fx(tq(22), 3)}, the interval is ${fx(poolHat, 0)} ± ${fx(tq(22) * poolSeMean, 1)}: up to about ${Math.round(poolHat + tq(POOL.n - 2) * poolSeMean)} swims on average. Any single 80°F day can stray much further (the prediction interval reaches ${Math.round(poolHat + tq(POOL.n - 2) * poolSePred)}), and consecutive summer days are not independent, so the interval is an approximation.`,
  },

  // ================================================================ Module 3: multiple regression
  {
    id: 'b06-dg-7', lesson: 'multiple-regression', type: 'mc', kind: 'applied',
    prompt: 'Haverleigh Ice Cream (fictional) regresses a van’s daily sales on what it spent on leaflets that day and finds $4.10 of sales per $1 of leaflets. The drivers hand out most leaflets on warm days, and warm days sell more ice cream whatever the leaflets do. If the day’s high is added to the regression, what should the owner expect to happen to the leaflet slope?',
    options: [
      'It should fall: part of the $4.10 was warm weather that came with the leaflets.',
      'It should stay at $4.10, since adding a predictor never changes the other slopes.',
      'It should rise, because the high soaks up noise and sharpens the leaflet effect.',
      'It can’t be said in advance; only the leaflet slope’s p-value can change.',
    ],
    answer: 0,
    feedback: {
      1: 'A slope stays put only when the added predictor is unrelated to it in the data. Leaflets and warm days go together, so the slope changes.',
      2: 'A new predictor can reduce the residual spread, but the direction of the change in a slope comes from how the added variable relates to both: here it is positively related to leaflets and to sales.',
      3: 'The estimate itself changes, not just its standard error: without the high, the leaflet slope carries the high’s association with sales.',
    },
    solution: 'Omitted-variable bias: when a variable that goes with both the predictor and the outcome is left out, the predictor’s slope absorbs its association. The high is positively related to leaflet spending and to sales, so the simple slope of $4.10 overstates what goes with leaflets on days of the same temperature; adding the high should lower it. Even then it is an association holding the high fixed, not proof that leaflets cause sales.',
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
    prompt: `A model has two predictors, which correlate at r = ${VIFR} with each other. What is the variance inflation factor of each? Give two decimal places.`,
    answer: rnd(1 / (1 - VIFR ** 2), 2),
    check: () => 1 / (1 - 0.81),
    unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(1 / (1 - VIFR), 2), say: 'VIF = 1 ÷ (1 − R²ⱼ), where R²ⱼ comes from regressing one predictor on the other. With one other predictor, R²ⱼ = r² = 0.81, not r.' },
      { value: rnd(Math.sqrt(1 / (1 - VIFR ** 2)), 2), say: 'That is √VIF, the factor by which the standard error grows. The VIF itself is the factor on the variance.' },
    ],
    solution: `Regressing one predictor on the other gives R²ⱼ = r² = ${fx(VIFR ** 2, 2)}, so VIF = 1 ÷ (1 − ${fx(VIFR ** 2, 2)}) = ${fx(1 / (1 - VIFR ** 2), 2)}. Each slope’s variance is ${fx(1 / (1 - VIFR ** 2), 2)} times what it would be with unrelated predictors, and its standard error √VIF = ${fx(Math.sqrt(1 / (1 - VIFR ** 2)), 2)} times. Above 5 or 10 is a common warning level, a convention rather than a rule.`,
  },

  // ================================================================ Module 4: checking and extending a model
  {
    id: 'b06-dg-10', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'conceptual',
    prompt: 'A model’s residuals fan out as the fitted values grow, and the Breusch–Pagan test is significant. The analyst switches to HC3 robust standard errors. What changes?',
    options: [
      'The standard errors, t statistics, p-values and intervals; the coefficients stay',
      'The coefficients, which are re-estimated with less weight on the noisy rows',
      'The coefficients and R², since the funnel had biased both of them upwards',
      'Nothing about the output; HC3 only certifies that the residuals are normal',
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
    prompt: `Saltrigg Ferries (fictional) regresses ln(daily passengers) on the day’s high in °C and finds a slope of ${FERRY.b}. By what percentage does the model expect passengers to differ on a day ${FERRY.dx}°C warmer, holding the other predictors fixed? Give one decimal place.`,
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
    prompt: `At Oxlade Library (fictional), ${LIB.p0 * 100}% of borrowers who get no reminder return their books on time. A logistic regression gives a reminder text an odds ratio of ${LIB.or}, holding the other predictors fixed. For a borrower like that who does get a reminder, what probability of returning on time does the model give? Give three decimal places.`,
    answer: rnd(pFromOR(LIB.p0, LIB.or), 3),
    check: () => { const o = (0.6 / 0.4) * 2.5; return o / (1 + o); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(LIB.p0 * LIB.or, 3), say: 'An odds ratio multiplies the odds, not the probability (and 0.6 × 2.5 is not a probability at all). Turn 60% into odds of 1.5 first.' },
      { value: rnd((LIB.p0 / (1 - LIB.p0)) * LIB.or, 3), say: '3.75 is the new odds. Convert back to a probability: odds ÷ (1 + odds).' },
      { value: rnd(LIB.or / (1 + LIB.or), 3), say: 'That treats the odds ratio as the odds. Multiply the starting odds, 0.6 ÷ 0.4 = 1.5, by 2.5 first.' },
    ],
    solution: `Odds without a reminder: 0.6 ÷ 0.4 = 1.5. The odds ratio multiplies the odds: 1.5 × 2.5 = 3.75. Back to a probability: 3.75 ÷ 4.75 = ${fx(pFromOR(LIB.p0, LIB.or), 3)}. The rise is ${fx((pFromOR(LIB.p0, LIB.or) - LIB.p0) * 100, 1)} points; the same odds ratio would move a borrower who starts at 10% by only ${fx((pFromOR(0.1, LIB.or) - 0.1) * 100, 1)} points, because odds ratios act on odds, not on probabilities. And unless reminders were assigned at random, the odds ratio is an association, not the effect of sending one.`,
  },
];

export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
