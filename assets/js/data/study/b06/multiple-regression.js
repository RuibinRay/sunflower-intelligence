// multiple-regression.js — B06 · Multiple regression. Content only; exercises are in multiple-regression.ex.js.
// Uses the cafés' daily log (case.js: column) for Harbourside's footfall on the weather, the calendar and the opening
// build-up, and both cafés' peak waits on barista hours and transactions (B05's partial correlation, now as a slope).
// Ferrowick Bike Hire is fictional. Inference for one slope is inference-for-coefficients'; categorical predictors and
// interactions are the next lesson's; collinearity and model choice the one after. Every figure printed is recomputed in
// `checks`.
import { column } from './case.js?v=24';
import * as R from '../../../core/regression.js?v=24';
import * as C from '../../../core/correlation.js?v=24';
import { mean, sd } from '../../../core/stats.js?v=24';

// ---------------------------------------------------------------- Harbourside's footfall (306 days)
const H = { cafe: 'Harbourside' };
const y = column('footfall', H), hi = column('high_f', H), rain = column('rain_in', H), wk = column('weekend', H);
const fest = column('festival01', H), day = column('day', H), mo = column('month', H);
/** The opening build-up as a column: 0 on 1 March, rising evenly to 1 on 29 June (day 121), then 1. */
const build = column('build_up', H);
const M1 = R.fit(y, { 'High (°F)': hi });
const M2 = R.fit(y, { 'High (°F)': hi, 'Rain (in)': rain });
const M3 = R.fit(y, { 'High (°F)': hi, 'Rain (in)': rain, Weekend: wk, Festival: fest });
const M4 = R.fit(y, { 'High (°F)': hi, 'Rain (in)': rain, Weekend: wk, Festival: fest, 'Build-up': build });
const MHF = R.fit(y, { 'High (°F)': hi, Festival: fest });
const MDAY = R.fit(y, { 'High (°F)': hi, 'Rain (in)': rain, Weekend: wk, Festival: fest, Day: day });
const b = (f, j) => f.coefs[j].estimate;
const festHigh = mean(hi.filter((_, i) => fest[i])), otherHigh = mean(hi.filter((_, i) => !fest[i]));
// the planted per-°F effect, averaged over Harbourside's days: base × 1.1% × build-up × rain factor × festival × E[noise]
const plantedDer = wk.map((w, i) => (w ? 196 : 122) * 0.011 * Math.min(1, 0.72 + 0.28 * (day[i] - 1) / 120) * (1 - 0.62 * Math.min(rain[i], 1)) * (fest[i] ? 2.3 : 1) * Math.exp(0.09 ** 2 / 2));
const plantedAvg = mean(plantedDer);
// the estimand: the fourth model's least-squares slope fitted to the planted mean footfall of each day
const plantedMean = wk.map((w, i) => (w ? 196 : 122) * (1 + 0.011 * (hi[i] - 60)) * Math.min(1, 0.72 + 0.28 * (day[i] - 1) / 120) * (1 - 0.62 * Math.min(rain[i], 1)) * (fest[i] ? 2.3 : 1) * Math.exp(0.09 ** 2 / 2));
const planted = R.fit(plantedMean, { h: hi, r: rain, w: wk, f: fest, b: build }).beta[1];
const julySat = mean(hi.filter((_, i) => mo[i] === 7 && column('weekday', H)[i] === 'Sat'));
const resMonth = (f, m) => mean(Array.from(f.resid).filter((_, i) => mo[i] === m));
const STD = R.standardized(M4, [hi, rain, wk, fest, build], y);
const lagM3 = R.lag1(Array.from(M3.resid)), lagM4 = R.lag1(Array.from(M4.resid));
const sdFest = sd(fest), sdY = sd(y);

// ---------------------------------------------------------------- peak waits (both cafés, 612 days)
const S = column('peak_staff_hours'), T = column('transactions'), W = column('peak_wait_min');
const WS = R.fit(W, { 'Peak barista hours': S });
const WST = R.fit(W, { 'Peak barista hours': S, Transactions: T });
const TS = R.fit(T, { 'Peak barista hours': S });
const PT = C.partial(S, W, [T]);

// ---------------------------------------------------------------- Ferrowick Bike Hire (fictional)
const FB = { b0: 12, high: 2.5, rain: -18, wk: 40 };
const fbPred = FB.b0 + FB.high * 70 + FB.rain * 2 + FB.wk * 1;

// ---------------------------------------------------------------- applied example: a hot Saturday in July
const sat = (h) => M4.predict([h, 0, 1, 0, 1]).yhat;
const convH = column('transactions', H).reduce((s, v) => s + v, 0) / y.reduce((s, v) => s + v, 0);

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const row = (name, f) => [name, fx(b(f, 1)), f.coefs.length > 2 ? fx(b(f, 2), 1) : '—', f.r2.toFixed(3), f.adjR2.toFixed(3), f.sigma.toFixed(1)];

export default {
  slug: 'multiple-regression',
  title: 'Multiple regression',
  blurb: 'Fit one equation with several predictors, read each slope as a comparison with the others held fixed, and see why a slope changes when a predictor joins the model. Then judge the whole model with adjusted R² and the overall F test, and read the output in Excel.',
  status: 'reviewed',
  objectives: [
    'Interpret each slope of a multiple regression as the change in the fitted value per unit of its predictor, holding the other predictors fixed, with units.',
    'Explain why a slope changes when a predictor is added or left out, and calculate the change with the omitted-variable formula.',
    'Calculate adjusted R² and the overall F statistic from R², n and the number of predictors, and say what each tests or measures.',
    'Read a multiple-regression Summary Output from the ToolPak and the coefficients LINEST returns for several x columns, in their reverse order.',
    'Evaluate standardised slopes and a time trend left out of the model, and say when each misleads.',
  ],
  prerequisites: [
    { lesson: 'b06/least-squares-line', why: 'The least-squares line, its slope and intercept, and why the criterion is the sum of squared residuals.' },
    { lesson: 'b06/residuals-and-r-squared', why: 'R², SST = SSR + SSE and the residual standard error, which carry over unchanged.' },
    { lesson: 'b06/inference-for-coefficients', why: 'The t test and interval for one slope, read here for each slope in turn.' },
    { lesson: 'b05/partial-correlation', why: 'Holding a variable fixed with residuals, and the barista-hours and waits puzzle this lesson turns into a slope.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'LINEST and the ToolPak Regression tool for one x, which this lesson extends to several.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s Harbourside manager wants to know what a warm day is worth. The least-squares line of footfall on the day’s high temperature over Harbourside’s 306 days has a slope of 2.02: each extra °F goes with about two more people through the door. But warm days at the waterfront differ in other ways too. The five harbour-festival days all fell in late May, July and August, and on those days the crowds had nothing to do with the thermometer. Ana wants the warm-day figure with those other differences taken out.' },

    { h: 'One equation, several predictors' },
    { p: String.raw`A <g>multiple regression</g> predicts y from several predictors at once: <m>\hat y = b_0 + b_1x_1 + b_2x_2 + \dots + b_kx_k</m>. The coefficients are chosen by the same rule as for one predictor, least squares: they make the <g>residual sum of squares</g>, <m>\text{SSE} = \sum (y - \hat y)^2</m>, as small as possible. With two predictors the fitted values lie on a flat plane above the (x₁, x₂) grid rather than on a line; with more, no picture helps, but the arithmetic is the same and software does it.` },
    { p: 'For Harbourside, Ana fits footfall on four predictors: the day’s high (°F), the day’s rain (inches), a weekend column that is 1 on Saturdays and Sundays and 0 otherwise, and a festival column that is 1 on the five festival days. The table shows the high temperature’s slope as predictors join the model one model at a time.' },
    { table: {
      caption: 'Harbourside’s daily footfall, 1 March – 31 December 2027 (306 days): four models',
      head: ['Predictors', 'Slope on high (people per °F)', 'Slope on rain (people per inch)', 'R²', 'Adjusted R²', 's (people)'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [row('High', M1), row('High, rain', M2), row('High, rain, weekend, festival', M3), row('… and the build-up', M4)],
      note: 'Each row is a separate least-squares fit. s is the residual standard error. The build-up column is explained under “A trend left out” below.',
    } },
    { p: 'Read the third model’s equation as the line for days that are alike on everything else:' },
    { math: String.raw`\widehat{\text{footfall}} = 15.1 + 1.66\,\text{high} - 75.8\,\text{rain} + 69.1\,\text{weekend} + 329.9\,\text{festival}` },
    { p: 'Its slope on the high, 1.66, says that among days with the same rain, the same weekend-or-weekday status and the same festival status, each extra °F goes with about 1.66 more people. The rain slope says that, holding the temperature, the day of the week and festivals fixed, each inch of rain goes with about 76 fewer people. The weekend slope compares a Saturday or Sunday with a weekday of the same weather: about 69 more people. A slope in a multiple regression is a <g>partial slope</g>: it answers its question only for days that match on the other predictors.' },
    { callout: 'key', title: 'Holding the other predictors fixed', html: 'Every slope in a multiple regression is a comparison between rows that are alike on the other predictors in the model. Change the other predictors and you change the question, so the slope can change too. Say which predictors were held fixed whenever you quote one.' },

    { h: 'Why the slope changed' },
    { p: 'The high temperature’s slope moved from 2.02 to 2.07 when rain joined, then fell to 1.66 when the weekend and festival columns joined. The festival days explain most of it: their highs were 77–84°F against an average of 63.9°F on the other days, and their crowds were about 330 people above a normal day. With temperature alone in the model, the line has to account for those hot, packed days, so it tilts up: part of the festival effect is credited to the weather. Fitting high and festival alone gives a slope of 1.55. The weekend column changes the slope hardly at all, because Saturdays are no warmer than Wednesdays.' },
    { p: String.raw`This is <g>omitted-variable bias</g>: a slope estimated without a predictor that both affects y and goes with the included x absorbs part of that predictor’s effect. It is the regression version of a <g>confounding variable</g>, and it is the same thing the partial-correlation lesson did with residuals. A multiple-regression slope can even reverse sign, as the next example shows.` },

    { h: 'Baristas and waits, as slopes' },
    { p: String.raw`B05 found that peak barista hours and peak waits correlate at +0.53 over the 612 café-days, but at −0.72 holding transactions fixed. The regression of the peak wait on barista hours alone has a slope of +0.548: days with an extra barista hour had waits about half a minute longer. Add transactions as a second predictor and the slope on barista hours becomes −1.264: on days with the same number of transactions, an extra barista hour goes with a peak wait about 1.26 minutes shorter. The t statistic for that slope is −25.95 on 609 degrees of freedom, exactly the t of B05’s partial correlation; the two methods ask the same question and share one test.` },
    { p: String.raw`The omitted-variable formula shows where the +0.548 came from. Let <m>\delta</m> be the slope of the omitted predictor (transactions) on the included one (barista hours): 23.72 transactions per barista hour, because managers roster more baristas on busier days. Then the short regression’s slope is the long one’s plus the omitted predictor’s slope times <m>\delta</m>:` },
    { math: String.raw`\tilde b_1 = b_1 + b_2\,\delta = -1.264 + 0.0764 \times 23.72 = 0.548` },
    { p: 'The identity is exact for least squares, not an approximation. Barista hours look harmful alone because they carry the busy-day effect of transactions with them. The case’s generator planted this: waits depend on transactions per barista hour, and managers roster from the trade they expect. The waits rise along a curve rather than a line (B05 found the steep rise beyond about seven transactions per barista hour), so −1.264 is an average slope; the transformations-and-influence lesson fits the curve.' },
  ],

  theory: [
    { h: 'The model' },
    { p: String.raw`The population model behind a multiple regression is <m>y = \beta_0 + \beta_1x_1 + \dots + \beta_kx_k + \varepsilon</m>, with errors <m>\varepsilon</m> that average zero at every combination of the x’s. The fitted coefficients <m>b_0, \dots, b_k</m> estimate the <m>\beta</m>’s. There are <m>p = k + 1</m> coefficients counting the intercept, and the residual standard error is <m>s = \sqrt{\text{SSE}/(n - p)}</m>, in y’s units (the <g>standard error of the regression</g>). The conditions for the t tests and intervals are those of the inference-for-coefficients lesson, applied to the model as a whole; the assumptions-and-diagnostics lesson checks them.` },
    { p: String.raw`The model is additive: each predictor’s slope is the same whatever the values of the others. On a weekend and on a weekday the high temperature is assumed to add the same 1.66 people per °F. When that is false (the cafés respond differently to the weekend, for example) the model needs an interaction term, which the next lesson adds.` },

    { h: 'A partial slope is a slope of residuals' },
    { p: String.raw`There is a concrete way to see “holding the others fixed”. Regress y on all the other predictors and keep the residuals; regress <m>x_1</m> on the same predictors and keep its residuals. The least-squares slope of the first set of residuals on the second is exactly <m>b_1</m> from the multiple regression (a result known as the Frisch–Waugh–Lovell theorem). The residuals of <m>x_1</m> are the part of <m>x_1</m> the other predictors can’t predict, so <m>b_1</m> is estimated only from that part. B05’s partial correlation is the correlation of the same two sets of residuals; the partial slope is their slope, in y’s units per unit of <m>x_1</m>.` },
    { p: 'This explains a practical rule. A slope can be estimated well only if its predictor varies once the others are held fixed. If a predictor is almost a copy of the others, its residuals are tiny and its slope is poorly determined: that is multicollinearity, the subject of the multicollinearity-and-model-choice lesson.' },

    { h: 'Omitted-variable bias' },
    { p: String.raw`Suppose the true model contains <m>x_1</m> and <m>x_2</m>, and you fit <m>x_1</m> alone. The short slope is <m>\tilde b_1 = b_1 + b_2\delta</m>, where <m>\delta</m> is the slope of <m>x_2</m> on <m>x_1</m>. Two conditions make the bias: <m>x_2</m> must matter for y (<m>b_2 \neq 0</m>) and it must go with <m>x_1</m> (<m>\delta \neq 0</m>). Its direction is the sign of <m>b_2 \times \delta</m>: festivals add footfall and go with warm days, so leaving them out pushes the temperature slope up. Leaving out something unrelated to the included predictors, like the weekend column for the temperature slope, costs precision (a larger s) but causes no bias.` },
    { p: 'Not every extra predictor reduces bias. Adding a variable that lies on the path from x to y (a mediator, in B05’s terms) removes part of the effect you want; adding one caused by both x and y (a collider) creates a false link. The choice of predictors is a judgement about how the business works, which the multicollinearity-and-model-choice lesson takes further.' },

    { h: 'A trend left out' },
    { p: 'New cafés take time to find their customers. The generator planted a build-up: each café’s trade starts at 72% of its eventual level on 1 March and reaches 100% after four months. The weather follows the season, and March and April were both cold and quiet; so a model without the build-up credits some of the build-up to temperature. The third model’s residuals show it: they average −21.5 people in March and −13.8 in April, and +9.5 to +11.4 from October to December. The model over-predicts the early months and under-predicts the late ones.' },
    { p: String.raw`The fourth model adds a build-up column that rises evenly from 0 on 1 March to 1 on 29 June and stays at 1, the shape the generator used. Its slope, 35.5 people, is the build-up’s size; the temperature slope falls to 1.44, and the monthly residual averages shrink to within ±4 people. The planted effect is multiplicative, so it differs from day to day: from about 0.4 people per °F on a wet weekday in March to about 5 on a festival day. Fitting the fourth model to the generator’s planted mean footfall for each day gives a temperature slope of 1.47 people per °F, the average effect the linear slope estimates; the fourth model recovers it and the third overstates it by about 13%. With real data no one tells you the trend’s shape. A straight-line “day” column is the wrong shape here: R² rises, but the temperature slope moves further from the truth, to 1.79; plotting residuals in time order, as the assumptions-and-diagnostics lesson does, is how you find out what is missing.` },
    { callout: 'warn', title: 'Rows that aren’t independent', html: 'The standard errors in every model here treat Harbourside’s 306 days as independent. Neighbouring days share the season and the build-up, so they aren’t: the third model’s residuals have a lag-1 autocorrelation of 0.22, which makes its standard errors too small and its p-values too small. Adding the build-up brings it to −0.08. Models that pool both cafés have a second problem, since the two rows of a day share its weather.' },

    { h: 'R² and adjusted R²' },
    { p: String.raw`R² keeps its meaning, the share of the variation in y around its mean that the fitted values account for: <m>R^2 = 1 - \text{SSE}/\text{SST}</m>. It can never fall when a predictor is added, because least squares can always set the new slope to zero and do no worse. So R² rewards adding anything, even a column of random numbers. <g>Adjusted R-squared</g> charges for each coefficient:` },
    { math: String.raw`\bar R^2 = 1 - (1 - R^2)\,\dfrac{n - 1}{n - p}` },
    { p: String.raw`For the third model, <m>1 - (1 - 0.9221) \times 305/301 = 0.9211</m>. Adjusted R² rises when a new predictor’s t statistic is larger than 1 in size and falls otherwise, so it can go down. It is a rough guard against padding a model, not a test, and it is not a share of anything: it can even be negative. The next lesson but one compares models more carefully.` },

    { h: 'The overall F test' },
    { p: String.raw`Each slope’s t test asks whether that predictor adds anything, holding the others fixed. The <g>overall F test</g> asks whether the predictors together add anything at all: <m>H_0: \beta_1 = \beta_2 = \dots = \beta_k = 0</m>. Its statistic compares the variation explained per predictor with the residual variation per degree of freedom:` },
    { math: String.raw`F = \dfrac{\text{SSR}/k}{\text{SSE}/(n - p)} = \dfrac{R^2/k}{(1 - R^2)/(n - p)}` },
    { p: String.raw`on k and n − p degrees of freedom. For the third model, <m>F = (0.9221/4) \div (0.0779/301) = 891</m> on 4 and 301 df, and the p-value (Significance F in Excel) is far below 0.001. With one predictor F is the slope’s t squared; with several it is a single test of all of them. The two kinds of test can disagree: when two predictors carry the same information, F can be large while neither t is, because the data show that something matters but can’t say which. The general F test that compares any two nested models is in the multicollinearity-and-model-choice lesson.` },

    { h: 'Reading the output in Excel' },
    { p: 'The ToolPak’s Regression tool takes an Input X Range of several adjacent columns and prints the same three blocks as for one predictor: Regression Statistics (Multiple R, R Square, Adjusted R Square, Standard Error, Observations), the ANOVA table (Regression, Residual and Total rows with df, SS, MS, F and Significance F) and one row of coefficients per predictor with its standard error, t Stat, P-value and 95% limits. The Explore widget prints it for any set of Harbourside’s predictors.' },
    { p: String.raw`LINEST accepts several x columns too, but returns the coefficients in reverse order: for x’s in columns C, D and E, <x>=LINEST(B2:B31,C2:E31)</x> spills <m>b_E, b_D, b_C, b_0</m> across one row (Microsoft’s documentation states the order as m<sub>n</sub>, m<sub>n−1</sub>, …, m<sub>1</sub>, b). To pick out the slope on column C, take the third entry: <x>=INDEX(LINEST(B2:B31,C2:E31),1,3)</x>. With stats set to TRUE, row 2 holds the standard errors in the same order, row 3 R² and s, row 4 F and the residual df, and row 5 SSR and SSE. TREND with several x columns predicts from the fitted equation: <x>=TREND(B2:B31,C2:E31,G2:I2)</x> for a new day whose x values are in G2:I2.` },

    { h: 'Standardised slopes, with care' },
    { p: String.raw`Slopes come in their predictors’ units (people per °F, per inch, per festival), so their sizes can’t be compared directly. A <g>standardised slope</g> rescales each to standard deviations, <m>b_j^{*} = b_j\,s_{x_j}/s_y</m>: the change in y, in SDs of y, per SD of <m>x_j</m>. For the fourth model they are 0.31 for the high, −0.21 for rain, 0.45 for the weekend, 0.61 for the festival and 0.16 for the build-up.` },
    { p: 'They are easy to over-read. A 0/1 column’s SD depends on how common the 1s are, not on any “typical change”: the festival column’s SD is only 0.13 because festivals are rare, and its 0.61 means 330 people times that small SD. Rain’s SD is inflated by a few wet days, since most days are dry. And standardising uses this sample’s spreads, so the same effect gets a different standardised slope in a sample with a narrower range. Use them to describe one sample, not to rank causes.' },
  ],

  formulas: [
    { id: 'mult-model', name: 'Fitted multiple regression',
      tex: String.raw`\hat y = b_0 + b_1x_1 + b_2x_2 + \dots + b_kx_k`,
      where: [[String.raw`\hat y`, 'Fitted value of y for a row', 'units of y'], [String.raw`b_0`, 'Intercept: the fitted value when every x is 0', 'units of y'], [String.raw`b_j`, 'Partial slope: change in the fitted value per unit of x_j, the other x’s held fixed', 'units of y per unit of x_j'], [String.raw`x_j`, 'The j-th predictor', 'its units'], [String.raw`k`, 'Number of predictors', '']],
      assumptions: 'The coefficients minimise the sum of squared residuals; each predictor’s effect is the same at every value of the others (additive).',
      note: 'p = k + 1 coefficients count the intercept. LINEST returns b_k, …, b_1, b_0 in that order.' },
    { id: 'mult-adj-r2', name: 'Adjusted R²',
      tex: String.raw`\bar R^2 = 1 - (1 - R^2)\,\dfrac{n - 1}{n - p}`,
      where: [[String.raw`\bar R^2`, 'Adjusted R²', ''], [String.raw`R^2`, 'Share of the variation in y around its mean accounted for, 1 − SSE/SST', ''], [String.raw`n`, 'Number of rows', ''], [String.raw`p`, 'Number of coefficients, counting the intercept (k + 1)', '']],
      note: 'Rises when a new predictor’s |t| exceeds 1, falls otherwise; can be negative. Not a test.' },
    { id: 'mult-overall-f', name: 'Overall F test of a multiple regression',
      tex: String.raw`F = \dfrac{\text{SSR}/k}{\text{SSE}/(n - p)} = \dfrac{R^2/k}{(1 - R^2)/(n - p)}, \qquad \text{df} = (k,\; n - p)`,
      where: [[String.raw`F`, 'Test statistic for H₀: every slope is 0', ''], [String.raw`\text{SSR}`, 'Regression sum of squares, Σ(ŷ − ȳ)²', 'units of y squared'], [String.raw`\text{SSE}`, 'Residual sum of squares, Σ(y − ŷ)²', 'units of y squared'], [String.raw`R^2`, 'SSR ÷ SST', ''], [String.raw`k`, 'Number of predictors', ''], [String.raw`n`, 'Number of rows', ''], [String.raw`p`, 'Number of coefficients, k + 1', '']],
      assumptions: 'The model’s conditions (independent rows, constant spread, roughly normal errors).',
      note: 'Excel: F.DIST.RT(F, k, n − p) is Significance F.' },
    { id: 'mult-ovb', name: 'Omitted-variable formula',
      tex: String.raw`\tilde b_1 = b_1 + b_2\,\delta`,
      where: [[String.raw`\tilde b_1`, 'Slope on x₁ when x₂ is left out', 'units of y per unit of x₁'], [String.raw`b_1, b_2`, 'Slopes on x₁ and x₂ when both are in', 'units of y per unit of x₁; of x₂'], [String.raw`\delta`, 'Slope of the least-squares line of x₂ on x₁', 'units of x₂ per unit of x₁']],
      assumptions: 'Exact for least-squares fits on the same rows (with any other predictors in both models, δ comes from regressing x₂ on all the included predictors).',
      note: 'Bias is zero if x₂ doesn’t matter (b₂ = 0) or doesn’t go with x₁ (δ = 0); its sign is that of b₂δ.' },
    { id: 'mult-std-slope', name: 'Standardised slope',
      tex: String.raw`b_j^{*} = b_j\,\dfrac{s_{x_j}}{s_y}`,
      where: [[String.raw`b_j^{*}`, 'Standardised slope: SDs of y per SD of x_j', ''], [String.raw`b_j`, 'The slope in its own units', 'units of y per unit of x_j'], [String.raw`s_{x_j}, s_y`, 'Sample standard deviations of x_j and of y', 'units of x_j; of y']],
      note: 'Depends on this sample’s spreads; misleading for 0/1 and skewed predictors.' },
  ],

  examples: [
    { level: 'simple', title: 'Bike hire on a showery Saturday', fictional: true,
      setup: 'Ferrowick Bike Hire (fictional) fits daily rentals on the day’s high (°F), the hours of rain and a weekend column (1 on Saturdays and Sundays) over one summer: rentals = 12 + 2.5 × high − 18 × rain hours + 40 × weekend. A simple regression of rentals on the high alone had a slope of 3.1. Interpret the three slopes, predict rentals for a 70°F Saturday with 2 hours of rain, and explain why the temperature slope is smaller here than in the simple regression.',
      steps: [
        'Read each slope with the others held fixed. High: among days with the same rain and the same weekend status, each extra °F goes with 2.5 more rentals. Rain: holding the temperature and the day fixed, each hour of rain goes with 18 fewer. Weekend: a Saturday or Sunday has 40 more rentals than a weekday with the same weather.',
        String.raw`Substitute: <m>12 + 2.5 \times 70 - 18 \times 2 + 40 \times 1 = 12 + 175 - 36 + 40 = 191</m> rentals.`,
        'Compare slopes with the omitted-variable rule. The simple slope, 3.1, also carries rain’s effect (and possibly the weekend’s) if warm days were drier: rain lowers rentals (b₂ < 0) and goes down as temperature goes up (δ < 0), so b₂δ is positive and the short slope is pushed up.',
      ],
      answer: 'About 191 rentals. The multiple-regression slope on the high, 2.5 rentals per °F, compares days with the same rain and day of the week; the simple slope of 3.1 also credits the temperature with warm days’ drier weather, and with any weekend crowds if warm days fell more often at weekends.',
      interpretation: 'If the manager staffs from the temperature forecast alone, she should use the simple slope only if she has no rain forecast; with both forecasts, the multiple regression keeps rain’s effect from being counted twice.' },

    { level: 'challenging', title: 'Why barista hours looked harmful', fictional: true,
      setup: 'Over both cafés’ 612 days, the peak wait regressed on peak barista hours alone has a slope of +0.548 minutes per barista hour. With transactions added, the slopes are −1.264 on barista hours and 0.0764 minutes per transaction. Transactions regressed on barista hours have a slope of 23.72. Show how the short slope arises from the long one, say what each answers, and explain what the second model still can’t claim.',
      steps: [
        String.raw`Apply the omitted-variable formula with x₁ = barista hours and x₂ = transactions: <m>\tilde b_1 = b_1 + b_2\delta = -1.264 + 0.0764 \times 23.72 = -1.264 + 1.812 = 0.548</m>. It reproduces the short slope exactly.`,
        'Name the parts. b₂ > 0: more transactions go with longer waits. δ > 0: managers roster more barista hours on busier days. Their product, +1.81 minutes per barista hour, is the busy-day effect that the short regression credits to the baristas.',
        'Read each slope. The short slope answers “on days with an extra barista hour, how much longer were waits?” (half a minute, because they were busy days). The long slope answers “on days with the same transactions, how did waits differ per extra barista hour?” (about 1.26 minutes shorter).',
        'Link to B05: the long model’s t for barista hours is −25.95 on 609 df, the same as the t test of the partial correlation −0.725. Both are the same comparison of equally busy days.',
        'State the limits. The rows are both cafés on the same days, so they aren’t independent, and the t is too large; waits rise along a curve in the load, so −1.264 averages a small effect on quiet days and a large one on busy days; and the log is observational.',
      ],
      answer: 'The +0.548 is −1.264 (the barista-hours slope at a given number of transactions) plus 0.0764 × 23.72 = 1.812 (the busy-day effect carried by barista hours). Holding transactions fixed, each extra barista hour goes with a peak wait about 1.26 minutes shorter.',
      interpretation: 'For a roster decision Ana needs the long slope, because she wants to compare a day with and without an extra barista at the same trade. The planted mechanism agrees with its sign. Its size should be treated as rough until the curve is modelled and the dependence between rows is allowed for.' },

    { level: 'applied', title: 'What a hot Saturday is worth', fictional: true,
      setup: 'Harbourside’s manager sees a forecast of 82°F and no rain for a Saturday in July, against a cool Saturday of 68°F (July Saturdays averaged 81.4°F). Using the fourth model (high, rain, weekend, festival and the build-up, which is complete by July), how many more people should she expect, and roughly how many more transactions? Which model should she not use, and why?',
      steps: [
        String.raw`The fourth model’s fitted values for a dry, non-festival Saturday after the build-up: <m>\hat y = b_0 + b_1 \times \text{high} + b_3 + b_5</m>, so the difference between two such days depends only on the high: <m>1.436 \times (82 - 68) = 20.1</m> people.`,
        'The fitted values themselves are about 223 people at 82°F and 203 people at 68°F. Their difference is 20.1, as the slope says.',
        String.raw`Over the year Harbourside turned 46.9% of its visitors into transactions (total transactions ÷ total footfall), so 20 more visitors mean roughly <m>20.1 \times 0.469 \approx 9</m> more transactions.`,
        'Don’t use the one-predictor slope (2.02 per °F) or the third model (1.66 per °F). Both overstate the weather’s effect because they credit it with festival crowds or with the early months’ build-up, and would suggest 28 or 23 extra people.',
      ],
      answer: 'About 20 more people (223 against 203) and roughly 9 more transactions, using the slope of 1.44 people per °F from the model with the build-up.',
      interpretation: 'Twenty more visitors over the whole day is not a reason for a second barista at the peak; a festival (about 330 more people) is. How uncertain a single day’s footfall is around those fitted values is the prediction-and-intervals lesson’s question, and the answer is wider than 20 people.' },
  ],

  demo: [
    { widget: 'mult-foot', intro: 'Harbourside’s 306 days. Start with the high temperature alone, then tick Festival: watch the slope on the high fall. Add Rain, Weekend and the Build-up one at a time and watch R², adjusted R², the standard error and the high temperature’s slope. Which predictor moves the temperature slope most, and which hardly moves it?' },
    { widget: 'mult-wait', intro: 'Both cafés’ 612 days. With barista hours alone the slope is positive; tick Transactions and it turns negative. Compare its t Stat with B05’s partial-correlation test.' },
    { widget: 'mult-ovb', intro: 'The omitted-variable formula. Start at the waits example, then set δ to 0 (barista hours unrelated to trade) or the transactions slope to 0 (trade doesn’t affect waits): the bias disappears either way.' },
  ],

  mistakes: [
    { title: '“The slope on temperature is the effect of one more degree.”', html: 'It is the difference in fitted footfall per °F between days alike on the other predictors in this model. Leave out the build-up and it becomes 1.66; leave out everything but temperature and it becomes 2.02. A coefficient is an association with the others held fixed; it becomes an effect only with an argument that nothing important is left out.' },
    { title: '“Adding a predictor can only make the other slopes more accurate.”', html: 'It removes omitted-variable bias only when the new predictor is a confounder. A mediator (on the path from x to y) or a collider (affected by both) makes the slope answer a different question or creates a link that isn’t there. Choose predictors from how the business works.' },
    { title: '“R² went up, so the new predictor belongs in the model.”', html: 'R² can’t go down when a predictor is added, whatever it is. Adjusted R² charges for each coefficient, and the t test asks whether the predictor adds anything given the others. Neither replaces judgement about what the model is for.' },
    { title: '“The first coefficient LINEST returns belongs to the first x column.”', html: 'With several x columns LINEST returns them in reverse order: the last column’s slope first and the intercept last. INDEX(LINEST(…),1,k + 1 − j) is the slope on the j-th of k columns. The ToolPak prints them in the original order with their names, which is why it is easier to read.' },
    { title: '“The largest standardised slope is the most important predictor.”', html: 'Standardised slopes depend on the sample’s spreads, and for 0/1 or skewed predictors the SD isn’t a meaningful change. Harbourside’s festival column has the largest standardised slope, but only five days in the year. Compare slopes in their own units against changes that are realistic for the decision.' },
    { title: '“The p-values are tiny, so the slopes are certain.”', html: 'The standard errors assume independent rows. Neighbouring days share the season and the cafés share their weather, so the standard errors are too small; a time trend left out (the build-up) makes residuals run in streaks. Check the residuals in time order before trusting the third decimal place.' },
  ],

  application: [
    { p: 'Multiple regression is the everyday tool for “what goes with what, other things equal”. A retailer estimates how much a promotion adds to a store’s weekly sales holding the store’s size, the season and local holidays fixed. A hotel asks how much an extra night of advance booking is worth at the same room type and day of the week. An energy supplier models daily demand on temperature, the day of the week and public holidays, because each of those changes demand and they go together through the year. In each case the analyst’s main work is choosing what to hold fixed and checking what was left out; the arithmetic is the easy part.' },
    { case: 'Ana’s note to the Harbourside manager: “Over 2027, each extra °F went with about 1.4 more people through the door, comparing days with the same rain, day of the week and festival status, after allowing for the café’s first four months of build-up (model with five predictors, R² = 0.94, s = 16 people). The simple line through footfall and temperature gives 2.0 per °F, because it also credits the weather with the festival crowds and with the quiet, cold spring when the café was new. Rain costs about 76 people per inch and a weekend adds about 69. These are associations in observational data, and the standard errors are somewhat too small because neighbouring days are alike.”' },
    { p: 'Her note does what a good regression report does. It gives the slope with its units and with the list of what was held fixed. It sets the multiple-regression slope beside the simple one and explains the gap in terms of the business, not the algebra. It reports the fit (R² and s) so the reader knows how much the model leaves unexplained, and it flags what could make the standard errors misleading. It doesn’t rank the predictors by standardised slopes or claim that warm weather “drives” 1.4 extra people; it says what the data show for days that were alike.' },
    { p: 'The same habits carry into the rest of the module. The categorical-predictors-and-interactions lesson lets the weekend’s effect differ between the two cafés, which pooling them hides. The multicollinearity-and-model-choice lesson asks what happens when two predictors carry nearly the same information, such as footfall and transactions, and how to choose between models with more and fewer terms without fooling yourself.' },
  ],

  summary: [
    'A multiple regression ŷ = b₀ + b₁x₁ + … + b_kx_k is fitted by least squares; each slope is the change in ŷ per unit of its predictor, holding the other predictors fixed.',
    'A partial slope equals the slope of y’s residuals on x_j’s residuals after both are regressed on the other predictors: the same idea as B05’s partial correlation, in y’s units.',
    'Leaving out a predictor that matters and goes with an included one biases its slope: b̃₁ = b₁ + b₂δ, exactly. Barista hours’ slope on waits is +0.548 alone and −1.264 holding transactions fixed.',
    'A time trend can be the omitted predictor: without the build-up, Harbourside’s temperature slope is 1.66 people per °F; with it, 1.44, close to the planted average of 1.47.',
    'R² never falls when a predictor is added; adjusted R² = 1 − (1 − R²)(n − 1)/(n − p) charges for each coefficient.',
    'The overall F test, F = (R²/k) ÷ ((1 − R²)/(n − p)) on k and n − p df, tests whether all the slopes are zero; each t test asks about one slope given the others.',
    'LINEST returns several slopes in reverse order; the ToolPak prints them in order with their names. Standardised slopes describe one sample and mislead for 0/1 or skewed predictors.',
  ],

  glossary: [
    { term: 'Multiple regression', def: 'A least-squares model that predicts y from two or more predictors at once, ŷ = b₀ + b₁x₁ + … + b_kx_k.' },
    { term: 'Partial slope', def: 'A slope in a multiple regression: the change in the fitted value of y per unit of one predictor, holding the other predictors in the model fixed. Also called a partial regression coefficient.' },
    { term: 'Omitted-variable bias', def: 'The change in a slope caused by leaving out a predictor that affects y and goes with the included predictor; for least squares the short slope is b₁ + b₂δ, δ being the slope of the omitted predictor on the included one.' },
    { term: 'Adjusted R-squared', def: 'R² adjusted for the number of coefficients, 1 − (1 − R²)(n − 1)/(n − p). It falls when a predictor adds too little, and can be negative.' },
    { term: 'Overall F test', def: 'The test of a regression model’s null hypothesis that every slope is zero, F = (SSR/k) ÷ (SSE/(n − p)) on k and n − p degrees of freedom; Significance F in Excel’s output.' },
    { term: 'Standardised slope', def: 'A slope rescaled to standard-deviation units, b_j × s(x_j) ÷ s(y): the change in y, in SDs, per SD of the predictor in the sample.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. <i>Introductory Business Statistics 2e</i>, section 13.4, “The Regression Equation” (multiple regression, adjusted R², the F test). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, Lesson 5, “Multiple Linear Regression (MLR) Model &amp; Evaluation”.', url: 'https://online.stat.psu.edu/stat462/node/83', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, “The general linear F-test”.', url: 'https://online.stat.psu.edu/stat462/node/135', checked: '2026-11-01' },
    { text: 'Microsoft Support. “LINEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/linest-function', checked: '2026-11-01' },
  ],

  checks: [
    // the four Harbourside models
    { what: 'Harbourside days', value: y.length, shown: 306 },
    { what: 'M1 slope on high', value: b(M1, 1), shown: 2.02 },
    { what: 'M1 R²', value: M1.r2, shown: 0.190, tol: 0.0005 },
    { what: 'M2 slope on high', value: b(M2, 1), shown: 2.07 },
    { what: 'M2 slope on rain', value: b(M2, 2), shown: -88.4, tol: 0.05 },
    { what: 'M3 intercept', value: b(M3, 0), shown: 15.1, tol: 0.05 },
    { what: 'M3 high', value: b(M3, 1), shown: 1.66 },
    { what: 'M3 rain', value: b(M3, 2), shown: -75.8, tol: 0.05 },
    { what: 'M3 rain about 76', value: -b(M3, 2), shown: 76, tol: 0.5 },
    { what: 'M3 weekend', value: b(M3, 3), shown: 69.1, tol: 0.05 },
    { what: 'M3 weekend about 69', value: b(M3, 3), shown: 69, tol: 0.5 },
    { what: 'M3 festival', value: b(M3, 4), shown: 329.9, tol: 0.05 },
    { what: 'M3 festival about 330', value: b(M3, 4), shown: 330, tol: 0.5 },
    { what: 'M3 R²', value: M3.r2, shown: 0.9221, tol: 0.00005 },
    { what: 'M3 1 − R²', value: 1 - M3.r2, shown: 0.0779, tol: 0.00005 },
    { what: 'M3 adjusted R²', value: M3.adjR2, shown: 0.9211, tol: 0.00005 },
    { what: 'M3 adjusted R² by the formula', value: 1 - (1 - 0.9221) * 305 / 301, shown: 0.9211, tol: 0.0001 },
    { what: 'M3 n − 1, n − p', value: (M3.n - 1) * 1000 + M3.df, shown: 305 * 1000 + 301 },
    { what: 'M3 F', value: M3.F, shown: 891, tol: 0.5 },
    { what: 'M3 F from rounded R²', value: (0.9221 / 4) / (0.0779 / 301), shown: 891, tol: 1 },
    { what: 'M3 F p below 0.001', value: Number(M3.pF < 0.001), shown: 1 },
    { what: 'M4 high', value: b(M4, 1), shown: 1.44 },
    { what: 'M4 rain about 76', value: -b(M4, 2), shown: 76, tol: 0.5 },
    { what: 'M4 weekend about 69', value: b(M4, 3), shown: 69, tol: 0.5 },
    { what: 'M4 festival about 330', value: b(M4, 4), shown: 330, tol: 0.5 },
    { what: 'M4 build-up', value: b(M4, 5), shown: 35.5, tol: 0.05 },
    { what: 'M4 R²', value: M4.r2, shown: 0.94, tol: 0.005 },
    { what: 'M4 s', value: M4.sigma, shown: 16, tol: 0.5 },
    { what: 'Table shows each model’s slope rising R²', value: Number(M1.r2 < M2.r2 && M2.r2 < M3.r2 && M3.r2 < M4.r2), shown: 1 },
    // why the slope changed
    { what: 'Festival days’ highs: min', value: Math.min(...hi.filter((_, i) => fest[i])), shown: 77 },
    { what: 'Festival days’ highs: max', value: Math.max(...hi.filter((_, i) => fest[i])), shown: 84 },
    { what: 'Five festival days', value: fest.reduce((s, v) => s + v, 0), shown: 5 },
    { what: 'Other days’ mean high', value: otherHigh, shown: 63.9, tol: 0.05 },
    { what: 'Festival days hotter (claim)', value: Number(festHigh > otherHigh + 10), shown: 1 },
    { what: 'Festival months: May, July, August', value: Number(mo.filter((_, i) => fest[i]).every((m) => [5, 7, 8].includes(m))), shown: 1 },
    { what: 'High + festival slope', value: b(MHF, 1), shown: 1.55 },
    { what: 'Weekend hardly changes the high slope (high + weekend)', value: Math.abs(b(R.fit(y, { h: hi, w: wk }), 1) - b(M1, 1)), shown: 0, tol: 0.01 },
    { what: 'Saturdays no warmer: r(weekend, high) small', value: Number(Math.abs(C.pearson(wk, hi).r) < 0.1), shown: 1 },
    // waits
    { what: 'B05 simple r', value: C.pearson(S, W).r, shown: 0.53 },
    { what: 'B05 partial r', value: PT.r, shown: -0.72 },
    { what: 'B05 partial r (3 dp)', value: PT.r, shown: -0.725, tol: 0.0005 },
    { what: 'Café-days', value: S.length, shown: 612 },
    { what: 'Short slope', value: b(WS, 1), shown: 0.548, tol: 0.0005 },
    { what: 'Long slope on staff', value: b(WST, 1), shown: -1.264, tol: 0.0005 },
    { what: 'Long slope on staff about 1.26', value: -b(WST, 1), shown: 1.26 },
    { what: 'Long slope on transactions', value: b(WST, 2), shown: 0.0764, tol: 0.00005 },
    { what: 'δ', value: b(TS, 1), shown: 23.72 },
    { what: 'OVB identity exact', value: b(WST, 1) + b(WST, 2) * b(TS, 1), shown: b(WS, 1), tol: 1e-9 },
    { what: 'OVB with rounded figures', value: -1.264 + 0.0764 * 23.72, shown: 0.548, tol: 0.001 },
    { what: 'Busy-day part b2δ', value: 0.0764 * 23.72, shown: 1.812, tol: 0.001 },
    { what: 'Busy-day part about 1.81', value: b(WST, 2) * b(TS, 1), shown: 1.81 },
    { what: 'Long t on staff', value: WST.coefs[1].t, shown: -25.95 },
    { what: 'Long df', value: WST.df, shown: 609 },
    { what: 'Partial-correlation t equals slope t', value: PT.t, shown: WST.coefs[1].t, tol: 1e-6 },
    // the trend left out
    { what: 'M3 March residual mean', value: resMonth(M3, 3), shown: -21.5, tol: 0.05 },
    { what: 'M3 April residual mean', value: resMonth(M3, 4), shown: -13.8, tol: 0.05 },
    { what: 'M3 Oct–Dec residual means between 9.5 and 11.4', value: Number([10, 11, 12].every((m) => resMonth(M3, m) >= 9.45 && resMonth(M3, m) <= 11.45)), shown: 1 },
    { what: 'M3 October residual mean', value: resMonth(M3, 10), shown: 9.5, tol: 0.05 },
    { what: 'M3 November residual mean', value: resMonth(M3, 11), shown: 11.4, tol: 0.05 },
    { what: 'M4 monthly residual means within ±4', value: Number([3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every((m) => Math.abs(resMonth(M4, m)) < 4)), shown: 1 },
    { what: 'Planted per-°F effect (estimand)', value: planted, shown: 1.47 },
    { what: 'Planted average derivative close to the estimand', value: plantedAvg, shown: 1.46 },
    { what: 'Planted effect min (wet March weekday)', value: Math.min(...plantedDer), shown: 0.4, tol: 0.05 },
    { what: 'Min is on a wet March weekday', value: Number(plantedDer.some((v, i) => v === Math.min(...plantedDer) && mo[i] === 3 && !wk[i] && rain[i] > 0.5)), shown: 1 },
    { what: 'Planted effect max (festival day)', value: Math.max(...plantedDer), shown: 5, tol: 0.05 },
    { what: 'Max is on a festival day', value: Number(fest[plantedDer.indexOf(Math.max(...plantedDer))] === 1), shown: 1 },
    { what: 'Day column raises R²', value: Number(MDAY.r2 > M3.r2), shown: 1 },
    { what: 'July Saturdays mean high', value: julySat, shown: 81.4, tol: 0.05 },
    { what: '68°F is cool for a July Saturday', value: Number(julySat > 75), shown: 1 },
    { what: 'M3 overstates by about 13%', value: b(M3, 1) / planted - 1, shown: 0.13, tol: 0.01 },
    { what: 'Day-trend slope on high', value: b(MDAY, 1), shown: 1.79 },
    { what: 'Build-up is 1 from day 121 (29 June)', value: Number(build[120] === 1 && build[119] < 1 && column('date', H)[120] === '2027-06-29'), shown: 1 },
    { what: 'Build-up starts at 72%: generator ramp at day 1', value: 0.72 + 0.28 * 0 / 120, shown: 0.72 },
    { what: 'Lag-1 autocorrelation M3', value: lagM3, shown: 0.22 },
    { what: 'Lag-1 autocorrelation M4', value: lagM4, shown: -0.08 },
    // standardised slopes
    { what: 'Std high', value: STD[0], shown: 0.31 },
    { what: 'Std rain', value: STD[1], shown: -0.21 },
    { what: 'Std weekend', value: STD[2], shown: 0.45 },
    { what: 'Std festival', value: STD[3], shown: 0.61 },
    { what: 'Std build-up', value: STD[4], shown: 0.16 },
    { what: 'SD festival column', value: sdFest, shown: 0.13 },
    { what: 'Std festival = slope × SD ÷ s_y', value: b(M4, 4) * sdFest / sdY, shown: STD[3], tol: 1e-9 },
    { what: 'Most days dry', value: Number(rain.filter((v) => v === 0).length > 153), shown: 1 },
    // Ferrowick
    { what: 'Ferrowick prediction', value: fbPred, shown: 191 },
    { what: 'Ferrowick 2.5 × 70', value: 2.5 * 70, shown: 175 },
    { what: 'Ferrowick 18 × 2', value: 18 * 2, shown: 36 },
    // applied
    { what: 'Hot Saturday difference', value: b(M4, 1) * 14, shown: 20.1, tol: 0.05 },
    { what: 'Rounded slope × 14', value: 1.436 * 14, shown: 20.1, tol: 0.05 },
    { what: 'Fitted at 82°F', value: sat(82), shown: 223, tol: 0.5 },
    { what: 'Fitted at 68°F', value: sat(68), shown: 203, tol: 0.5 },
    { what: 'Fitted difference', value: sat(82) - sat(68), shown: 20.1, tol: 0.05 },
    { what: 'Harbourside conversion', value: convH * 100, shown: 46.9, tol: 0.05 },
    { what: 'Extra transactions', value: 20.1 * 0.469, shown: 9, tol: 0.5 },
    { what: 'One-predictor extra people', value: b(M1, 1) * 14, shown: 28, tol: 0.5 },
    { what: 'M3 extra people', value: b(M3, 1) * 14, shown: 23, tol: 0.5 },
    // the build-up is complete by July
    { what: 'July build-up is 1', value: Math.min(...build.filter((_, i) => mo[i] === 7)), shown: 1 },
  ],
};
