// assumptions-and-diagnostics.js — B06 · Assumptions and diagnostics. Content only; exercises are in
// assumptions-and-diagnostics.ex.js. Uses the corrected café log (case.js): Harbourside's footfall on the weather and the
// calendar (a funnel and a drift in time order), the iced share against the day's high (a curve), Millbrook's footfall
// (the opening build-up in time order). Tidemark Ferry Kiosk and its residuals are fictional. Transformations and
// influence are the next lesson's; the conditions were named in inference-for-coefficients. Every figure printed is
// recomputed in `checks`.
import { column } from './case.js?v=31';
import * as R from '../../../core/regression.js?v=31';
import { mean, sd } from '../../../core/stats.js?v=31';
import { pearson } from '../../../core/correlation.js?v=31';

// ---------------------------------------------------------------- Harbourside footfall on the weather and calendar
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const hx = { 'High (°F)': column('high_f', H), 'Rain (in)': column('rain_in', H), Weekend: column('weekend', H), Festival: column('festival01', H) };
const hy = column('footfall', H);
const HF = R.fit(hy, hx), HR = HF.robust();
const hBP = R.breuschPagan(HF.cols, HF.resid), hDW = R.durbinWatson(HF.resid), hLag = R.lag1(HF.resid);
const hInf = R.influence(HF.cols, hy);
const fest = column('festival01', H), hDate = column('date', H), hMonth = column('month', H);
const fit = Array.from(HF.fitted), res = Array.from(HF.resid);
const band = (lo, hi) => sd(res.filter((_, i) => fit[i] >= lo && fit[i] < hi && !fest[i]));
const bandN = (lo, hi) => res.filter((_, i) => fit[i] >= lo && fit[i] < hi && !fest[i]).length;
const festSD = sd(res.filter((_, i) => fest[i]));
const monthMean = (m) => mean(res.filter((_, i) => hMonth[i] === m));
const ext = hInf.external, iMay29 = hDate.indexOf('2027-05-29'), iOct16 = hDate.indexOf('2027-10-16'), iMay30 = hDate.indexOf('2027-05-30');
const over2 = ext.filter((v) => Math.abs(v) > 2).length;
const rm = mean(res), rs = sd(res);
const nR = res.length;
// Excel's KURT (the bias-adjusted sample excess kurtosis)
const exKurt = (nR * (nR + 1) / ((nR - 1) * (nR - 2) * (nR - 3))) * res.reduce((a, v) => a + ((v - rm) / rs) ** 4, 0) - 3 * (nR - 1) ** 2 / ((nR - 2) * (nR - 3));
const coef = (f, name) => f.coefs.find((c) => c.name === name);
const rc = (name) => HR.coefs[HF.names.indexOf(name)];
// with the build-up (0 on 1 March rising to 1 on 29 June, then 1), and, as a contrast, a straight-line day count
const HD = R.fit(hy, { ...hx, 'Build-up': column('build_up', H) }), hdBP = R.breuschPagan(HD.cols, HD.resid);
const HL = R.fit(hy, { ...hx, Day: column('day', H) });
const hdMonth = (m) => mean(Array.from(HD.resid).filter((_, i) => hMonth[i] === m));
// the two cafés on the same day (levels, without a trend)
const MF0 = R.fit(column('footfall', M), { 'High (°F)': column('high_f', M), 'Rain (in)': column('rain_in', M), Weekend: column('weekend', M) });
const crossR = pearson(res, Array.from(MF0.resid)).r;
// Millbrook with and without a trend
const MD = R.fit(column('footfall', M), { 'High (°F)': column('high_f', M), 'Rain (in)': column('rain_in', M), Weekend: column('weekend', M), 'Build-up': column('build_up', M) });
const ML = R.fit(column('footfall', M), { 'High (°F)': column('high_f', M), 'Rain (in)': column('rain_in', M), Weekend: column('weekend', M), Day: column('day', M) });
const mHigh = column('high_f', M), mHighMonth = (m) => mean(mHigh.filter((_, i) => mMonth[i] === m));
const mMonth = column('month', M), mRes = Array.from(MF0.resid);
const mMonthMean = (m) => mean(mRes.filter((_, i) => mMonth[i] === m));

// ---------------------------------------------------------------- the iced share: a curve
const ICE = R.fit(column('iced_share'), { 'High (°F)': column('high_f') }), hiAll = column('high_f');
const iceBand = (lo, hi) => mean(Array.from(ICE.resid).filter((_, i) => hiAll[i] >= lo && hiAll[i] < hi));

// ---------------------------------------------------------------- Tidemark Ferry Kiosk (fictional): eight weekly residuals
const TK = [5, 7, 4, -1, -4, -7, -3, -1];
const tkShift = pearson(TK.slice(1), TK.slice(0, -1)).r;
const tkNum = TK.slice(1).reduce((s, v, i) => s + (v - TK[i]) ** 2, 0), tkDen = TK.reduce((s, v) => s + v * v, 0);
const tkDW = tkNum / tkDen, tkLag = R.lag1(TK);

// ---------------------------------------------------------------- figure: four residual plots (schematic, fictional)
const f1 = (x) => Math.round(x * 10) / 10;
function patterns() {
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const P = [
    { t: 'A: a patternless band', e: (u) => 0.9 * rnd() },
    { t: 'B: a curve', e: (u) => 2.2 * (u - 0.5) ** 2 * 4 - 0.7 + 0.45 * rnd() },
    { t: 'C: a funnel', e: (u) => (0.15 + 1.5 * u) * rnd() * 1.4 },
    { t: 'D: a drift in time order', e: (u) => 1.3 * (u - 0.5) + 0.45 * rnd() },
  ];
  let svg = '<svg viewBox="0 0 440 400" xmlns="http://www.w3.org/2000/svg" font-size="16" fill="currentColor">';
  P.forEach((q, k) => {
    const ox = 20 + (k % 2) * 215, oy = 30 + Math.floor(k / 2) * 190, w = 190, hgt = 130;
    svg += `<text x="${ox + w / 2}" y="${oy - 8}" text-anchor="middle">${q.t}</text>`;
    svg += `<line x1="${ox}" x2="${ox + w}" y1="${oy + hgt / 2}" y2="${oy + hgt / 2}" stroke="var(--rule-strong)" stroke-dasharray="4 3"/>`;
    svg += `<line x1="${ox}" x2="${ox}" y1="${oy}" y2="${oy + hgt}" stroke="var(--ink-3)"/><line x1="${ox}" x2="${ox + w}" y1="${oy + hgt}" y2="${oy + hgt}" stroke="var(--ink-3)"/>`;
    for (let j = 0; j < 40; j++) {
      const u = (j + 0.5) / 40, v = Math.max(-1, Math.min(1, q.e(u)));
      svg += `<circle cx="${f1(ox + 6 + u * (w - 12))}" cy="${f1(oy + hgt / 2 - v * (hgt / 2 - 6))}" r="3" fill="var(--series-1)"/>`;
    }
    svg += `<text x="${ox + w / 2}" y="${oy + hgt + 20}" text-anchor="middle" font-size="14" fill="var(--ink-3)">${k === 3 ? 'row order (time)' : 'fitted value'}</text>`;
  });
  return `${svg}</svg>`;
}

const r1 = (x) => Math.round(x * 10) / 10;

export default {
  slug: 'assumptions-and-diagnostics',
  title: 'Assumptions and diagnostics',
  blurb: 'A regression’s coefficients, p-values and intervals are only as good as the assumptions behind them. Read residual plots and two standard tests to check each assumption, and learn which failures bias the coefficients and which only distort the standard errors.',
  status: 'reviewed',
  objectives: [
    'State the four conditions of the linear regression model and say which results (coefficients, standard errors, prediction intervals) depend on each.',
    'Diagnose curvature, unequal spread, non-normal errors and dependence from residual plots, a normal Q–Q plot and residuals in time order.',
    'Calculate the Durbin–Watson statistic and the Breusch–Pagan statistic, and interpret them with their limitations.',
    'Compare ordinary and HC3 robust standard errors and decide which to report.',
    'Distinguish failures that bias coefficients (a wrong form, an omitted trend) from failures that leave them unbiased but make standard errors and intervals wrong.',
  ],
  prerequisites: [
    { lesson: 'b06/inference-for-coefficients', why: 'The population model, its conditions and the standard errors and t tests that depend on them.' },
    { lesson: 'b06/residuals-and-r-squared', why: 'Residuals, the residual standard error and a first residual plot.' },
    { lesson: 'b06/multiple-regression', why: 'Slopes with other predictors held fixed, and why leaving out a predictor can change them.' },
    { lesson: 'b04/normal-distribution', why: 'Normal scores and the normal probability plot, used here on residuals.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana has a model for Harbourside’s daily footfall from its 306 days in 2027: the day’s high temperature, the rain, whether it is a weekend and whether it is one of the five festival days. It accounts for 92.2% of the variation in footfall, its residual standard error is 19.5 people, and every slope has a p-value below 0.001. She wants to use it twice: to say how much a warmer day goes with, and to roster baristas from a prediction interval. Before she does either, she checks whether the model’s assumptions hold.' },

    { h: 'What the model assumes' },
    { p: String.raw`The population model behind every regression in this course is <m>y = \beta_0 + \beta_1 x_1 + \dots + \beta_k x_k + \varepsilon</m>. Fitting it by least squares always works; the t tests, confidence intervals and prediction intervals that the output prints rely on four conditions about the error <m>\varepsilon</m>. <b>Linearity</b>: at every combination of the predictors the errors average zero, so the model’s form is right. <b>Independence</b>: one row’s error tells you nothing about another’s. <b>Normality</b>: the errors follow a normal distribution. <b>Equal variance</b>: the errors have the same spread, σ, whatever the predictors. These are the <g>LINE conditions</g> named in inference-for-coefficients; this lesson checks them.` },
    { p: 'You never see the errors, only the <g>residuals</g>, e = y − ŷ, which are their estimates. So every check in this lesson is a look at the residuals for the pattern a failure would leave. If the model is right, the residuals should look like random noise: no curve, no funnel, no drift, no clusters. Any structure you can see is structure the model has missed.' },

    { h: 'Residuals against fitted values: the form' },
    { p: 'The first <g>residual plot</g> to draw is the residuals against the fitted values. The figure shows the four patterns it can reveal. A patternless horizontal band (A) is what a good model leaves. A curve (B) means the straight-line form is wrong. A funnel (C) means the spread changes with the size of the prediction. A drift when the residuals are plotted in time order (D) means neighbouring rows share something the model doesn’t contain.' },
    { figure: {
      svg: patterns(),
      caption: 'Four residual plots (schematic, fictional data). A: what a good model leaves. B: a curve, so the form is wrong. C: a funnel, so the spread grows with the fitted value. D: residuals in time order drift from negative to positive, so something changing over time is missing.',
      alt: 'Four small scatter plots in a two-by-two grid, each with a dashed horizontal line at zero. Top left, labelled “A: a patternless band”, points scattered evenly above and below zero across the plot. Top right, “B: a curve”, points above zero at both ends and below zero in the middle, a U shape. Bottom left, “C: a funnel”, points close to zero on the left and spreading widely on the right. Bottom right, “D: a drift in time order”, with row order on the horizontal axis, points below zero on the left rising steadily to above zero on the right.',
    } },
    { p: 'The cafés’ iced share shows pattern B. A straight line of iced share on the day’s high, across all 612 café-days, has R² = 0.883, which sounds excellent. Its residuals are not random: they average +0.143 on days below 45°F, −0.095 between 55 and 65°F, and +0.062 between 75 and 85°F. The share follows an S-shaped curve, flat on cold days, steep in the middle, levelling off on hot days, and a line cuts across it. Every prediction from the line is too low at the cold end and too high in the cool middle, so this failure biases the predictions and the slope itself is an average of very different rates.' },

    { h: 'A funnel: unequal spread' },
    { p: 'Harbourside’s footfall model shows pattern C. On ordinary days with fitted footfall below 100 people, the residuals have a standard deviation of 14.6; on days with fitted footfall between 150 and 200 it is 24.0; on the five festival days it is 48.1. Busy days vary by more people than quiet days do. That is natural for counts that grow by percentages: a warm Saturday that is 10% busier than expected is 20 people out, a cold Tuesday 10% busier is 8. In this fictional log footfall is built multiplicatively, so a funnel in levels is the case’s planted fact.' },
    { p: 'Unequal spread is called <g>heteroskedasticity</g> (constant spread is homoskedasticity). It does not bias the slopes: on average least squares still finds the right ones. It does make the usual standard errors wrong, because their formula assumes one σ for every row, and it makes a single <g>prediction interval</g> too wide on quiet days and too narrow on busy ones, which is exactly where rostering matters.' },

    { h: 'Normality: the Q–Q plot' },
    { p: 'A <g>normal probability plot</g> of the residuals, also called a normal Q–Q plot, puts the sorted residuals against the values a normal sample of the same size would have. Harbourside’s residuals follow the line through the middle and leave it at the ends: the largest studentized residual is 4.66, on the festival Saturday of 29 May, and the next 3.68, on 16 October. Eleven of the 306 days lie beyond ±2, close to the 14 a normal sample would give, so the departure is a few extreme days rather than a wholesale change of shape.' },
    { p: 'Normality matters least of the four. With hundreds of rows, the coefficients’ sampling distribution is close to normal whatever the errors look like, so the t tests still work. It matters most for prediction intervals, which describe single days and so depend on the shape of the errors themselves, and for small samples, where nothing else rescues the t tests.' },

    { h: 'Independence: residuals in time order' },
    { p: 'Plotted in date order, Harbourside’s residuals drift (pattern D). They average −21.5 people in March, −13.8 in April and −6.8 in May, and are positive from July on (+11.4 in November). The model has no term for the café building up its trade after opening, so the early months sit below the line and the later ones above it. Neighbouring days’ residuals are alike: their lag-1 autocorrelation is 0.22.' },
    { p: 'Adding a build-up term removes the drift. It is 0 on opening day, rises evenly to 1 on 29 June, the end of the café’s first four months, and stays at 1; the residuals’ monthly averages then all lie within ±3.8 people. The R² rises from 0.922 to 0.944 and, more to the point, the slope for the day’s high changes from 1.66 to 1.44 people per °F. The missing trend was not just making the residuals untidy: because temperatures rose through the spring while the café was building up, leaving the trend out let the temperature slope take credit for part of the build-up. (A straight-line day count over the whole year is not a fix: it assumes the build-up never stopped, and it pushes the slope the other way, to 1.79.) A pattern in time order is often a sign of a missing predictor, and a missing predictor that goes with the others biases their coefficients.' },
    { p: 'The two cafés raise a second independence question. Their rows share the same days and the same weather, and their residuals from the two cafés’ own models correlate at 0.33 day by day. Pooling both cafés’ 612 rows as if they were 612 independent observations gets the standard errors wrong, and not always in the same direction: in these data, standard errors that treat each day as a cluster come out a little larger than the printed ones for some slopes and smaller for others (rain, which hits both cafés at once, is one). Fit each café separately, or use standard errors that allow for rows sharing a day.' },
  ],

  theory: [
    { h: 'What rests on each condition' },
    { table: {
      caption: 'The four conditions: what a failure does and how to check it',
      head: ['Condition', 'If it fails, the coefficients…', 'Standard errors and tests', 'Prediction intervals', 'Check'],
      rows: [
        ['Linearity (right form, nothing important left out)', 'are biased', 'misleading', 'wrong', 'residuals against fitted values and against each predictor'],
        ['Independence', 'are unbiased if the form is right', 'usually too small', 'too narrow', 'residuals in time order; Durbin–Watson'],
        ['Equal variance', 'are unbiased', 'wrong (too small or too large)', 'wrong width at each x', 'residuals against fitted values; Breusch–Pagan'],
        ['Normality', 'are unbiased', 'fine with large n; doubtful with small n', 'wrong shape, so wrong limits', 'normal Q–Q plot of the residuals'],
      ],
      align: ['l', 'l', 'l', 'l', 'l'],
      note: 'Linearity carries the most weight: the other three concern how precise the estimates are, linearity whether they estimate the right thing.',
    } },
    { p: 'Two further points complete the table. The predictors are treated as fixed numbers measured without error; the <i>Introductory Business Statistics</i> list of assumptions states this, and measurement error in a predictor biases its slope towards zero. And independence of the errors is not the same as independence of the predictors from each other: predictors that move together (multicollinearity) are the previous lesson’s subject and don’t break any of these conditions.' },

    { h: 'Checking the form' },
    { p: 'Plot the residuals against the fitted values, and against each numerical predictor in turn: a curve against one predictor shows which term needs a different form. Band the residuals if the plot is crowded: average them within ranges of the fitted value or the predictor, as the iced-share bands above do. Averages that move steadily away from zero, or change sign more than chance would, mean the form is wrong. The NIST/SEMATECH e-Handbook (4.4.4.2) warns that a funnel can be an artefact of a wrong functional form, which is one reason to check the form before the spread.' },

    { h: 'Testing for unequal spread: Breusch–Pagan' },
    { p: String.raw`The Breusch–Pagan test asks whether the squared residuals can be predicted from the predictors. Regress <m>e_i^2</m> on the model’s predictors and take <m>LM = nR^2_{\text{aux}}</m>, where <m>R^2_{\text{aux}}</m> is that auxiliary regression’s R². Under equal variance LM follows a chi-square distribution with k degrees of freedom (the number of predictors). This is Koenker’s version, which statsmodels and R report by default (other packages, Stata among them, default to the original); the original divided by an estimate that assumes normal errors.` },
    { p: 'For Harbourside, LM = 55.7 on 4 degrees of freedom, a p-value below 0.001: the spread clearly changes. Read the test alongside the plot. With hundreds of rows it detects differences in spread too small to matter, and with a dozen rows it can miss a funnel you can see. A significant test also doesn’t say what to do: if the funnel comes from a wrong form, fix the form; if the spread grows in proportion to the mean, a log of y (the next lesson) often removes it.' },

    { h: 'Robust standard errors' },
    { p: String.raw`When the spread is unequal but the form is right, the slopes are fine and only their standard errors need repair. <g>Robust standard errors</g> estimate each coefficient’s variance from the residuals row by row instead of from one pooled σ. The version called HC3 divides each squared residual by <m>(1 - h_i)^2</m>, where <m>h_i</m> is the row’s leverage (next lesson), which keeps the estimate honest in modest samples. Excel’s ToolPak doesn’t offer them; the regression panel in this lesson does.` },
    { table: {
      caption: 'Harbourside footfall model: ordinary and HC3 standard errors (306 days)',
      head: ['Term', 'Coefficient', 'Ordinary SE', 'HC3 SE', 'HC3 ÷ ordinary'],
      rows: [
        ['High (°F)', '1.656', '0.075', '0.077', '1.02'],
        ['Rain (in)', '−75.8', '5.75', '4.35', '0.76'],
        ['Weekend', '69.1', '2.53', '3.10', '1.22'],
        ['Festival', '329.9', '9.07', '24.37', '2.69'],
      ],
      align: ['l', 'r', 'r', 'r', 'r'],
      note: 'Robust standard errors can be larger or smaller than ordinary ones. The festival coefficient rests on five days whose residuals are far larger than the rest, so its ordinary SE was much too small.',
    } },
    { p: 'Every conclusion here survives: the festival coefficient’s t statistic falls from 36 to 13.5, still far beyond any critical value. That is common with hundreds of rows and large effects, and it is the reason to look rather than assume: in a smaller sample the same switch can move a p-value from 0.01 to 0.2. Robust standard errors repair tests and confidence intervals for coefficients; they don’t repair prediction intervals for single days, which need a model of the spread itself.' },

    { h: 'The normal Q–Q plot' },
    { p: String.raw`Sort the n residuals (or, better, the studentized residuals, which put every row on the same scale) and plot them against normal scores <m>\Phi^{-1}\big((i - 3/8)/(n + 1/4)\big)</m>, Blom’s plotting positions. Points on a straight line mean normal-looking residuals. A curve bending the same way at both ends means skew; points running off the line in opposite directions at the two ends (an S) mean heavier tails than a normal distribution, with more extreme residuals than it would produce. Harbourside’s residuals have an excess kurtosis of 1.13 (the sample version Excel’s KURT gives): mildly heavy-tailed, with two residuals beyond ±3 where a normal sample of 306 would expect about one, though no more beyond ±2 than expected.` },

    { h: 'Testing for dependence: Durbin–Watson' },
    { p: String.raw`For rows in time order, the <g>Durbin–Watson statistic</g> compares neighbouring residuals: <m>DW = \sum_{t=2}^{n}(e_t - e_{t-1})^2 \big/ \sum_{t=1}^{n} e_t^2</m>. It runs from 0 to 4 and is close to <m>2(1 - r_1)</m>, where <m>r_1</m> is the residuals’ lag-1 <g>autocorrelation</g>. A value near 2 means no first-order autocorrelation; values well below 2 mean positive autocorrelation (neighbours alike), above 2 negative. Its exact critical values depend on n and the number of predictors and come from published tables; in practice a DW below about 1.5 in a daily series deserves a look at the time-order plot.` },
    { p: 'For Harbourside, DW = 1.55 without the build-up term and 2.15 with it. The statistic only means something when the rows are in time order within one series. The café log lists both cafés day by day, alternating; run on that order, DW compares Harbourside with Millbrook on the same day, not one day with the next. Sort by café, then date, or fit each café separately.' },
    { p: 'Positive autocorrelation makes the usual standard errors too small, because 306 days that resemble their neighbours carry less independent information than 306 unrelated days. The cure depends on the cause. If the residuals drift because something is missing (a trend, a season, a holiday), add it, as the build-up term did. If neighbouring errors are simply alike after the form is right, time-series methods or autocorrelation-consistent (Newey–West) standard errors are the tools; forecasting courses cover them.' },

    { h: 'Which failures bias the coefficients' },
    { p: 'The table’s second column is the one to remember. Only a failure of linearity, in the broad sense of the wrong form or a missing predictor that goes with the included ones (<g>omitted-variable bias</g>), biases the coefficients themselves. Unequal spread, dependence and non-normal errors leave the coefficients unbiased; they make the model’s statements about its own precision wrong. That ranking tells you what to fix first: a wrong form changes the answer, the others change how sure you can be of it.' },
    { callout: 'warn', title: 'A pattern in the residuals may be a missing variable', html: 'Autocorrelation and unequal spread are often symptoms, not causes. Harbourside’s residuals in time order looked like an independence problem, but the cause was a missing trend, and adding it changed the temperature slope from 1.66 to 1.44. Before reaching for robust or autocorrelation-consistent standard errors, ask whether a predictor is missing.' },

    { h: 'An order for checking' },
    { ol: [
      'Plot residuals against fitted values and against each numerical predictor: is the form right?',
      'Plot residuals in time order (within each series) and compute DW: is something changing over time?',
      'Look at the spread in the first plot and run Breusch–Pagan: does it grow with the fitted value?',
      'Draw the normal Q–Q plot: are a few points far off the line, or is the whole shape wrong?',
      'Find the points with large studentized residuals or high leverage and check them (the next lesson).',
      'Fix the most serious problem, refit, and look at all the plots again.',
    ] },
  ],

  formulas: [
    { id: 'b06-durbin-watson', name: 'Durbin–Watson statistic',
      tex: String.raw`DW = \dfrac{\sum_{t=2}^{n}(e_t - e_{t-1})^2}{\sum_{t=1}^{n} e_t^2} \approx 2(1 - r_1)`,
      where: [[String.raw`e_t`, 'The residual for period t, with the rows in time order', 'units of y'], [String.raw`n`, 'Number of periods', ''], [String.raw`r_1`, 'Lag-1 autocorrelation of the residuals', ''], [String.raw`DW`, 'Between 0 and 4; near 2 means no first-order autocorrelation', '']],
      assumptions: 'Rows in time order within one series; a model with an intercept.',
      note: 'In Excel, with residuals in E2:E41: <x>=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E2:E41)</x>.' },
    { id: 'b06-lag1-resid', name: 'Lag-1 autocorrelation of residuals',
      tex: String.raw`r_1 = \dfrac{\sum_{t=2}^{n}(e_t - \bar e)(e_{t-1} - \bar e)}{\sum_{t=1}^{n}(e_t - \bar e)^2}`,
      where: [[String.raw`e_t`, 'The residual for period t, in time order', 'units of y'], [String.raw`\bar e`, 'The mean residual (0 for a model with an intercept)', 'units of y'], [String.raw`r_1`, 'How alike neighbouring residuals are, from −1 to 1', '']],
      note: 'CORREL of the residuals with the same residuals shifted one row gives almost the same value for long series; for short ones the two differ (Tidemark’s eight weeks: 0.77 against 0.69).' },
    { id: 'b06-breusch-pagan', name: 'Breusch–Pagan test (Koenker’s form)',
      tex: String.raw`LM = n\,R^2_{\text{aux}}, \qquad \text{df} = k`,
      where: [[String.raw`R^2_{\text{aux}}`, 'R² of the regression of the squared residuals on the model’s predictors', ''], [String.raw`n`, 'Number of rows', ''], [String.raw`k`, 'Number of predictors (not counting the intercept)', ''], [String.raw`LM`, 'Test statistic, compared with the chi-square distribution on k df', '']],
      assumptions: 'H₀: the error variance is the same for every row.',
      note: 'With one predictor in B and squared residuals in F: <x>=COUNT(F2:F31)*RSQ(F2:F31,B2:B31)</x>, and p <x>=CHISQ.DIST.RT(LM,1)</x>.' },
    { id: 'b06-hc3', name: 'HC3 robust covariance of the coefficients',
      tex: String.raw`\widehat{V}_{\text{HC3}} = (X^{\top}X)^{-1} X^{\top}\,\operatorname{diag}\!\left(\dfrac{e_i^2}{(1 - h_i)^2}\right) X\,(X^{\top}X)^{-1}`,
      where: [[String.raw`X`, 'The matrix of predictors, with a column of 1s for the intercept', ''], [String.raw`e_i`, 'Row i’s residual', 'units of y'], [String.raw`h_i`, 'Row i’s leverage, between 0 and 1', ''], [String.raw`\widehat{V}_{\text{HC3}}`, 'Estimated covariance matrix; the square roots of its diagonal are the robust SEs', 'units of the coefficients, squared']],
      assumptions: 'The model’s form is right; the errors are independent but may have unequal variances.',
      note: 'MacKinnon and White’s HC3; the ordinary formula replaces the middle matrix with s²X⊤X.' },
    { id: 'b06-blom', name: 'Normal scores for a Q–Q plot (Blom)',
      tex: String.raw`q_i = \Phi^{-1}\!\left(\dfrac{i - 3/8}{n + 1/4}\right)`,
      where: [[String.raw`i`, 'Rank of the residual, 1 for the smallest', ''], [String.raw`n`, 'Number of residuals', ''], [String.raw`\Phi^{-1}`, 'The standard normal inverse; Excel’s NORM.S.INV', ''], [String.raw`q_i`, 'The value a normal sample would put at that rank, in SD units', '']],
      note: 'Plot the sorted (studentized) residuals against q₁ … qₙ.' },
  ],

  examples: [
    { level: 'simple', title: 'Durbin–Watson for eight weeks at a ferry kiosk', fictional: true,
      setup: 'Tidemark Ferry Kiosk (fictional) models its weekly sales on the number of sailings. Its residuals for eight consecutive weeks, in hundreds of dollars, are 5, 7, 4, −1, −4, −7, −3, −1. Calculate the Durbin–Watson statistic and the lag-1 autocorrelation, and say what they suggest.',
      table: { head: ['Week', '1', '2', '3', '4', '5', '6', '7', '8'], rows: [['Residual', ...TK.map((v) => (v < 0 ? `−${-v}` : String(v)))]], align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        'Differences of neighbours: 7 − 5 = 2, 4 − 7 = −3, −1 − 4 = −5, −4 − (−1) = −3, −7 − (−4) = −3, −3 − (−7) = 4, −1 − (−3) = 2.',
        'Sum of squared differences: 4 + 9 + 25 + 9 + 9 + 16 + 4 = 76.',
        'Sum of squared residuals: 25 + 49 + 16 + 1 + 16 + 49 + 9 + 1 = 166.',
        String.raw`Durbin–Watson: <m>DW = 76 / 166 = 0.46</m>. The lag-1 autocorrelation of the eight residuals is 0.69, and <m>2(1 - 0.69) = 0.62</m>; the approximation is rough with only eight weeks, but both say the same thing.`,
      ],
      answer: 'DW = 0.46 and r₁ = 0.69: strong positive autocorrelation.',
      interpretation: 'The residuals run in a block of positive weeks followed by a block of negative ones: the kiosk did better than the model predicted for three weeks and worse for the next five. Something the model lacks, perhaps the school holidays or the weather, changed in week 4. Until it is found, the model’s standard errors are too small and its forecasts for next week should lean on the recent residuals.' },

    { level: 'challenging', title: 'What survives the checks at Harbourside', fictional: true,
      setup: 'Ana’s Harbourside model (306 days) regresses footfall on the high, rain, a weekend dummy and a festival dummy. The diagnostics: Breusch–Pagan LM = 55.7 (4 df); Durbin–Watson 1.55; the largest studentized residual 4.66; HC3 standard errors as in the table above. A build-up term (0 at opening, 1 from 29 June) added as a fifth predictor gives DW = 2.15 and changes the slope for the high from 1.66 to 1.44. Which of her results can she trust, which must change, and what should she report?',
      steps: [
        'Form first: the time-order plot drifts from −21.5 in March to positive from July, and adding the build-up term changes the temperature slope by −0.22 people per °F. Leaving the trend out was a specification error, so the model to report includes it.',
        'Spread: LM = 55.7 on 4 df gives a p-value below 0.001, and the residual SD rises from 14.6 on quiet days to 24.0 on busy ones. With the build-up included the test still gives LM = 67.8 on 5 df. The slopes are unbiased, but the ordinary standard errors are not to be trusted: report HC3 ones.',
        'With HC3 the festival coefficient’s SE rises from 9.1 to about 24.4 people; its t is still about 13.5, so the conclusion that festival days are far busier stands, with a much wider interval.',
        'Normality: one festival day at 4.66 and one ordinary day at 3.68 aside, the Q–Q plot is close to straight. With 306 days the coefficient tests are safe; prediction intervals for single days are not, because the spread varies.',
        'Dependence: with the build-up term, DW = 2.15, so neighbouring days are no longer alike in a way that matters.',
      ],
      answer: 'Report the model with the build-up term (high: 1.44 people per °F) and HC3 standard errors. The coefficients and their tests survive; the constant-width prediction interval does not, because the spread grows with the fitted value.',
      interpretation: 'The first two results Ana wanted come out differently. The temperature slope she would have quoted, 1.66, mixed the season with the café’s build-up. And a single prediction interval, ±2 × 16.5 people or so with the build-up term, is too wide for a cold Tuesday and too narrow for a warm Saturday. The next lesson’s log of footfall deals with the second problem.' },

    { level: 'applied', title: 'Millbrook’s temperature effect for the winter roster', fictional: true,
      setup: 'Millbrook’s manager wants to know how much a cold snap cuts weekday trade, to trim the roster in January. Ana fits Millbrook’s 306 days: footfall on the high, rain and a weekend dummy. The slope for the high is 0.89 people per °F. The residuals in date order average −41.2 in March, +7.0 in July and +27.7 in December, and DW = 1.03. With the build-up term added (0 at opening, 1 from 29 June), DW = 1.81 and the slope for the high is 0.45. What should Ana tell the manager?',
      steps: [
        'Read the time-order plot: the residuals climb by about 69 people from March to December, and DW = 1.03, well below 2. From March to July the café was building up its trade.',
        'Ask what that does to the temperature slope. Temperatures rose from March to July, just when the café was building up, so without a build-up term the slope for the high takes credit for the build-up and comes out too steep. That also explains why the residuals keep climbing after the build-up ended: as the autumn cools (from 83.5°F in July to 43.3°F in December on average), the too-steep slope predicts a larger fall in trade than happened, so the cold months sit above the line.',
        'Refit with the build-up term. DW rises to 1.81, and the slope for the high becomes 0.45 people per °F, holding the rain, the weekend and the build-up fixed. (A straight-line day count would overshoot the other way, to 1.17, because it assumes the build-up never stopped.)',
        'Turn it into the manager’s question: a January weekday 20°F colder than an October one goes with about 20 × 0.45 ≈ 9 fewer people, against about 18 on the slope without the build-up term.',
      ],
      answer: 'About 0.45 fewer people per °F colder (holding rain, weekday and the build-up fixed): roughly 9 fewer for a 20°F colder weekday, half the 18 the model without the build-up implies.',
      interpretation: 'The number the manager can roster from comes from the model that passed its checks. Ana should add a caveat: 2027 is the only winter in the log, and January is colder than any day the slope was fitted to, so the figure rests on one season and a modest extrapolation.' },
  ],

  demo: [
    { widget: 'diag-harbour', intro: 'Harbourside’s footfall model with all five residual plots. Start with the four predictors ticked: see the funnel in the first plot, the festival days off the line in the Q–Q plot, and the drift in the time-order plot (DW 1.55). Then tick Build-up: DW moves to 2.15, but Breusch–Pagan still flags the funnel. The panel’s largest Cook’s distance, 1.02 on 29 May, comes from the festival dummy: with only five festival days, each has a leverage of about 0.2 for its own coefficient, so its large residual counts for a lot.' },
    { widget: 'diag-iced', intro: 'The iced share against the day’s high across 612 café-days. R² is 0.883, yet the residuals against fitted values trace a wave: the straight line is the wrong form. Compare its Q–Q plot, which is pulled out of line by the same curve.' },
    { widget: 'diag-robust', intro: 'The same Harbourside model as Excel’s ToolPak would print it. Switch to HC3 standard errors and watch which ones grow (Festival, Weekend) and which shrink (Rain). Do any conclusions change?' },
  ],

  mistakes: [
    { title: '“R² is 0.88, so the model is right.”', html: 'R² measures how much variation the model accounts for, not whether its form is right. The iced-share line has R² = 0.883 and residuals that trace a wave: it is too low on cold days and too high in the cool middle. Always plot the residuals.' },
    { title: '“The residuals aren’t normal, so the regression is invalid.”', html: 'With hundreds of rows, the coefficient tests barely depend on normality. Non-normal errors matter for prediction intervals and for small samples. Check the Q–Q plot for a few extreme points (which deserve checking in the data) before worrying about the shape.' },
    { title: '“Robust standard errors fix heteroskedasticity.”', html: 'HC3 standard errors repair the tests and intervals for coefficients. They leave the coefficients and the fitted values as they were, they don’t make a single prediction interval right for every row, and they can be smaller as well as larger than the ordinary ones (Harbourside’s rain SE fell from 5.75 to 4.35).' },
    { title: 'Running Durbin–Watson on rows in any order', html: 'The statistic compares each row with the row before it, so it only means something for one series in time order. On the café log as listed, alternating Harbourside and Millbrook, it compares two cafés on the same day. Sort by café and date first, or fit each café separately.' },
    { title: '“Autocorrelation only affects the standard errors.”', html: 'True when the form is right; but residuals that drift are often a sign of a missing trend or season, and a missing predictor that goes with the others biases their slopes. Harbourside’s temperature slope changed from 1.66 to 1.44 when the build-up was added.' },
    { title: 'Treating a non-significant test as proof', html: 'A Breusch–Pagan or Durbin–Watson result that isn’t significant doesn’t show the condition holds, especially in a small sample, where the tests have little power. Judge the plot and the size of the problem, not only the p-value.' },
  ],

  application: [
    { case: 'Ana’s model note for the 2028 roster: “Harbourside footfall on high, rain, weekend, festival and the opening build-up (306 days, 2027). Checked: form (residuals against fitted and each predictor: no curve), time order (DW 2.15 with the build-up; without it the temperature slope is biased), spread (Breusch–Pagan LM = 67.8, 5 df, p < 0.001: busy days vary more, so HC3 standard errors reported), normality (Q–Q close to straight apart from 29 May and 16 October, both checked against the till). Not usable as it stands: a single ±33-person prediction interval for rostering. Next: refit footfall in logs.”' },
    { p: 'A note like this is what model validation looks like in practice. Banks, insurers and public bodies that rely on regression models usually have someone other than the model’s builder check it, and the checks are the ones in this lesson, done in a fixed order and written down: what was looked at, what was found, what was changed, and what the model should not be used for. The habit is useful far beyond regulated industries, because it turns “the model has an R² of 0.92” into a statement someone else can rely on.' },
    { p: 'The most useful line in such a note is often the last one: the use the model isn’t fit for. A footfall model with unbiased slopes and honest robust standard errors can support a statement about how much a warm day goes with, and still be the wrong tool for a prediction interval for one Saturday. Saying which is which saves a manager from rostering by an interval that is too narrow on exactly the days that matter.' },
    { p: 'Two judgements recur. The first is how large a departure has to be before it matters. A Breusch–Pagan test on 306 days can be significant for a modest change in spread; the question is whether it changes a decision, which you answer by comparing the ordinary and robust results, or the intervals, side by side. The second is when to stop. Every model of real data fails some check slightly; the aim is a model whose remaining failures are small, known and written down, not one that passes every test.' },
  ],

  summary: [
    'The linear model’s inference rests on four conditions about the errors: linearity (the right form), independence, normality and equal variance. The residuals are how you check them.',
    'Residuals against fitted values show the form (a curve, as in the iced share with R² = 0.883) and the spread (a funnel, as in Harbourside’s footfall).',
    'Unequal spread leaves the slopes unbiased but makes ordinary standard errors and a single prediction interval wrong; Breusch–Pagan tests for it (Harbourside: LM = 55.7, 4 df) and HC3 robust standard errors repair the coefficient tests.',
    'The normal Q–Q plot shows tails and skew; normality matters most for prediction intervals and small samples.',
    'Residuals in time order and the Durbin–Watson statistic (≈ 2(1 − r₁), near 2 is good) show dependence; Harbourside’s 1.55 came from a missing trend, and adding it moved the temperature slope from 1.66 to 1.44.',
    'Only a wrong form or a missing predictor biases the coefficients; the other failures make the model’s statements about its own precision wrong. Fix the form first, then the standard errors, and write down what the model shouldn’t be used for.',
  ],

  glossary: [
    { term: 'Heteroskedasticity', def: 'Errors whose spread differs from row to row, typically growing with the fitted value; the opposite of homoskedasticity, a constant spread. It leaves least-squares slopes unbiased but makes the usual standard errors and prediction intervals wrong.' },
    { term: 'Breusch–Pagan test', def: 'A test of equal error variance: regress the squared residuals on the predictors and compare n × R² of that regression with a chi-square distribution on as many degrees of freedom as there are predictors.' },
    { term: 'Robust standard error', def: 'A standard error for a regression coefficient that stays valid when the error variance differs between rows, estimated from each row’s own squared residual; HC3 is a common version.' },
    { term: 'Durbin–Watson statistic', def: 'The sum of squared differences between successive residuals divided by the sum of squared residuals, for rows in time order. It runs from 0 to 4; near 2 means no first-order autocorrelation, well below 2 means neighbouring residuals are alike.' },
    { term: 'Autocorrelation', def: 'The correlation of a series with itself shifted by one or more periods; in regression, the tendency of residuals that are close in time to be alike.' },
  ],

  references: [
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 4.4.4, “How can I tell if a model fits my data?”.', url: 'https://itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm', checked: '2026-11-01' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 4.4.4.2, “How can I detect non-constant variation across the data?”.', url: 'https://itl.nist.gov/div898/handbook/pmd/section4/pmd442.htm', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, section 13.4, “The Regression Equation” (the assumptions of the ordinary least squares model). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/13-4-the-regression-equation', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 501: Regression Methods</i>, Lesson 4, “SLR Model Assumptions”.', url: 'https://online.stat.psu.edu/stat501/lesson/4', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 501: Regression Methods</i>, T.2.3, “Testing and Remedial Measures for Autocorrelation”.', url: 'https://online.stat.psu.edu/stat501/book/export/html/998', checked: '2026-11-01' },
  ],

  checks: [
    // the Harbourside model
    { what: 'Harbourside days', value: hy.length, shown: 306 },
    { what: 'Harbourside R² (%)', value: HF.r2 * 100, shown: 92.2, tol: 0.05 },
    { what: 'Harbourside R² (3 dp)', value: HF.r2, shown: 0.922, tol: 0.0005 },
    { what: 'Residual SE', value: HF.sigma, shown: 19.5, tol: 0.05 },
    { what: 'Every slope p < 0.001', value: Number(HF.coefs.slice(1).every((c) => c.p < 0.001)), shown: 1 },
    { what: 'High slope', value: coef(HF, 'High (°F)').estimate, shown: 1.656, tol: 0.0005 },
    { what: 'High slope (2 dp)', value: coef(HF, 'High (°F)').estimate, shown: 1.66 },
    { what: 'Rain slope', value: coef(HF, 'Rain (in)').estimate, shown: -75.8, tol: 0.05 },
    { what: 'Weekend', value: coef(HF, 'Weekend').estimate, shown: 69.1, tol: 0.05 },
    { what: 'Festival', value: coef(HF, 'Festival').estimate, shown: 329.9, tol: 0.05 },
    { what: 'SE high', value: coef(HF, 'High (°F)').se, shown: 0.075, tol: 0.0005 },
    { what: 'SE rain', value: coef(HF, 'Rain (in)').se, shown: 5.75, tol: 0.005 },
    { what: 'SE weekend', value: coef(HF, 'Weekend').se, shown: 2.53, tol: 0.005 },
    { what: 'SE festival', value: coef(HF, 'Festival').se, shown: 9.07, tol: 0.005 },
    { what: 'SE festival (1 dp)', value: coef(HF, 'Festival').se, shown: 9.1, tol: 0.05 },
    { what: 'HC3 high', value: rc('High (°F)').se, shown: 0.077, tol: 0.0005 },
    { what: 'HC3 rain', value: rc('Rain (in)').se, shown: 4.35, tol: 0.005 },
    { what: 'HC3 weekend', value: rc('Weekend').se, shown: 3.10, tol: 0.005 },
    { what: 'HC3 festival', value: rc('Festival').se, shown: 24.37, tol: 0.005 },
    { what: 'HC3 festival (1 dp)', value: rc('Festival').se, shown: 24.4, tol: 0.05 },
    { what: 'Ratio high', value: rc('High (°F)').se / coef(HF, 'High (°F)').se, shown: 1.02, tol: 0.005 },
    { what: 'Ratio rain', value: rc('Rain (in)').se / coef(HF, 'Rain (in)').se, shown: 0.76, tol: 0.005 },
    { what: 'Ratio weekend', value: rc('Weekend').se / coef(HF, 'Weekend').se, shown: 1.22, tol: 0.005 },
    { what: 'Ratio festival', value: rc('Festival').se / coef(HF, 'Festival').se, shown: 2.69, tol: 0.005 },
    { what: 'Festival t ordinary', value: coef(HF, 'Festival').t, shown: 36, tol: 0.5 },
    { what: 'Festival t HC3', value: rc('Festival').t, shown: 13.5, tol: 0.05 },
    { what: 'Festival t HC3 still p < 0.001', value: Number(rc('Festival').p < 0.001), shown: 1 },
    // the funnel
    { what: 'Residual SD, fitted below 100', value: band(0, 100), shown: 14.6, tol: 0.05 },
    { what: 'Residual SD, fitted 150–200', value: band(150, 200), shown: 24.0, tol: 0.05 },
    { what: 'Residual SD, festival days', value: festSD, shown: 48.1, tol: 0.05 },
    { what: 'Funnel: SD rises from below 100 to 150–200 and to festivals', value: Number(band(0, 100) < band(150, 200) && band(150, 200) < festSD && band(100, 150) < band(150, 200)), shown: 1 },
    { what: 'Days in the bands are not few', value: Number(bandN(0, 100) > 50 && bandN(150, 200) > 50), shown: 1 },
    { what: '10% of 200', value: 0.1 * 200, shown: 20 },
    { what: '10% of 80', value: 0.1 * 80, shown: 8 },
    { what: 'BP LM', value: hBP.lm, shown: 55.7, tol: 0.05 },
    { what: 'BP df', value: hBP.df, shown: 4 },
    { what: 'BP p < 0.001', value: Number(hBP.p < 0.001), shown: 1 },
    // normality
    { what: 'Largest studentized residual', value: Math.max(...ext), shown: 4.66, tol: 0.005 },
    { what: 'It is 29 May', value: Number(ext.indexOf(Math.max(...ext)) === iMay29), shown: 1 },
    { what: '29 May is a festival Saturday', value: Number(fest[iMay29] === 1 && column('weekday', H)[iMay29] === 'Sat'), shown: 1 },
    { what: 'Next largest is 16 October', value: Number([...ext].sort((a, b) => b - a)[1] === ext[iOct16]), shown: 1 },
    { what: '16 October value', value: ext[iOct16], shown: 3.68, tol: 0.005 },
    { what: '16 October is an ordinary day', value: Number(fest[iOct16] === 0), shown: 1 },
    { what: 'Days beyond ±2', value: over2, shown: 11 },
    { what: 'Normal sample would give about 14', value: 306 * 2 * (1 - R.normCdf(2)), shown: 14, tol: 0.5 },
    { what: 'Beyond ±3', value: ext.filter((v) => Math.abs(v) > 3).length, shown: 2 },
    { what: 'Normal expects about one beyond ±3', value: 306 * 2 * (1 - R.normCdf(3)), shown: 1, tol: 0.5 },
    { what: 'Excess kurtosis (Excel KURT)', value: exKurt, shown: 1.13, tol: 0.005 },
    { what: 'Heavy tails (positive excess kurtosis)', value: Number(exKurt > 0.5), shown: 1 },
    // time order
    { what: 'March residual mean', value: monthMean(3), shown: -21.5, tol: 0.05 },
    { what: 'April', value: monthMean(4), shown: -13.8, tol: 0.05 },
    { what: 'May', value: monthMean(5), shown: -6.8, tol: 0.05 },
    { what: 'November', value: monthMean(11), shown: 11.4, tol: 0.05 },
    { what: 'Positive from July on', value: Number([7, 8, 9, 10, 11, 12].every((m) => monthMean(m) > 0)), shown: 1 },
    { what: 'Lag-1 autocorrelation', value: hLag, shown: 0.22, tol: 0.005 },
    { what: 'DW without trend', value: hDW, shown: 1.55, tol: 0.005 },
    { what: 'DW with build-up', value: R.durbinWatson(HD.resid), shown: 2.15, tol: 0.005 },
    { what: 'R² with build-up', value: HD.r2, shown: 0.944, tol: 0.0005 },
    { what: 'High slope with build-up', value: coef(HD, 'High (°F)').estimate, shown: 1.44, tol: 0.005 },
    { what: 'Build-up monthly residuals within ±3.8', value: Math.max(...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => Math.abs(hdMonth(m)))), shown: 3.8, tol: 0.05 },
    { what: 'Linear day count overshoots to 1.79', value: coef(HL, 'High (°F)').estimate, shown: 1.79, tol: 0.005 },
    { what: 'Build-up is 1 from 29 June', value: Number(column('build_up', H)[hDate.indexOf('2027-06-29')] === 1 && column('build_up', H)[hDate.indexOf('2027-06-28')] < 1 && column('build_up', H)[0] === 0), shown: 1 },
    { what: 'Residual SE with build-up', value: HD.sigma, shown: 16.5, tol: 0.05 },
    { what: '±33 interval', value: 2 * HD.sigma, shown: 33, tol: 0.5 },
    { what: 'Largest Cook (4 predictors) on 29 May', value: Math.max(...hInf.cooks), shown: 1.02, tol: 0.005 },
    { what: 'Its leverage about 0.2', value: hInf.hat[iMay29], shown: 0.2, tol: 0.01 },
    { what: 'Tidemark shifted CORREL', value: tkShift, shown: 0.77, tol: 0.005 },
    { what: 'Change in high slope', value: coef(HD, 'High (°F)').estimate - coef(HF, 'High (°F)').estimate, shown: -0.22, tol: 0.005 },
    { what: 'Temperatures rose March to July', value: Number(mean(column('high_f', H).filter((_, i) => hMonth[i] === 7)) > mean(column('high_f', H).filter((_, i) => hMonth[i] === 3)) + 20), shown: 1 },
    { what: 'BP with build-up', value: hdBP.lm, shown: 67.8, tol: 0.05 },
    { what: 'BP with trend df', value: hdBP.df, shown: 5 },
    { what: 'BP with trend p < 0.001', value: Number(hdBP.p < 0.001), shown: 1 },
    { what: 'Cross-café residual r', value: crossR, shown: 0.33, tol: 0.005 },
    { what: '612 rows', value: column('footfall').length, shown: 612 },
    // iced share
    { what: 'Iced line R²', value: ICE.r2, shown: 0.883, tol: 0.0005 },
    { what: 'Iced residual mean below 45°F', value: iceBand(0, 45), shown: 0.143, tol: 0.0005 },
    { what: 'Iced residual mean 55–65°F', value: iceBand(55, 65), shown: -0.095, tol: 0.0005 },
    { what: 'Iced residual mean 75–85°F', value: iceBand(75, 85), shown: 0.062, tol: 0.0005 },
    { what: 'Iced 45–55 negative too (a wave)', value: Number(iceBand(45, 55) < 0 && iceBand(0, 45) > 0 && iceBand(75, 85) > 0), shown: 1 },
    // Tidemark (fictional)
    { what: 'Tidemark squared differences', value: tkNum, shown: 76 },
    { what: 'Tidemark squared residuals', value: tkDen, shown: 166 },
    { what: 'Tidemark DW', value: tkDW, shown: 0.46, tol: 0.005 },
    { what: 'Tidemark lag-1', value: tkLag, shown: 0.69, tol: 0.005 },
    { what: 'Tidemark 2(1 − r1)', value: 2 * (1 - 0.69), shown: 0.62, tol: 0.005 },
    { what: 'Tidemark residuals sum to 0', value: TK.reduce((s, v) => s + v, 0), shown: 0 },
    // Millbrook
    { what: 'Millbrook high slope, no trend', value: coef(MF0, 'High (°F)').estimate, shown: 0.89, tol: 0.005 },
    { what: 'Millbrook March mean residual', value: mMonthMean(3), shown: -41.2, tol: 0.05 },
    { what: 'Millbrook December mean residual', value: mMonthMean(12), shown: 27.7, tol: 0.05 },
    { what: 'Millbrook climb March to December', value: mMonthMean(12) - mMonthMean(3), shown: 69, tol: 0.5 },
    { what: 'Millbrook DW no trend', value: R.durbinWatson(MF0.resid), shown: 1.03, tol: 0.005 },
    { what: 'Millbrook DW with build-up', value: R.durbinWatson(MD.resid), shown: 1.81, tol: 0.005 },
    { what: 'Millbrook high slope with build-up', value: coef(MD, 'High (°F)').estimate, shown: 0.45, tol: 0.005 },
    { what: 'Millbrook linear day count overshoots to 1.17', value: coef(ML, 'High (°F)').estimate, shown: 1.17, tol: 0.005 },
    { what: '20°F × 0.45', value: 20 * 0.45, shown: 9, tol: 0.5 },
    { what: 'Millbrook July mean residual (no trend)', value: mMonthMean(7), shown: 7.0, tol: 0.05 },
    { what: 'Residuals keep climbing after July (no trend)', value: Number(mMonthMean(12) > mMonthMean(7) && mMonthMean(10) > mMonthMean(7)), shown: 1 },
    { what: 'Millbrook July mean high', value: mHighMonth(7), shown: 83.5, tol: 0.05 },
    { what: 'Millbrook December mean high', value: mHighMonth(12), shown: 43.3, tol: 0.05 },
    { what: 'No-trend slope too steep: above the build-up slope', value: Number(coef(MF0, 'High (°F)').estimate > coef(MD, 'High (°F)').estimate), shown: 1 },
    { what: 'Half of 18', value: 18 / 2, shown: 9 },
    { what: '20°F × 0.89', value: 20 * 0.89, shown: 18, tol: 0.5 },
  ],
};
