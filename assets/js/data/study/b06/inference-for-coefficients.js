// inference-for-coefficients.js — B06 · Inference for coefficients. Content only; exercises are in
// inference-for-coefficients.ex.js. Uses the cafés' corrected log from case.js: Harbourside's weekend days from 1 July
// 2027 (after the café's four-month build-up; the three festival days left out) for the main fit, transactions on the
// day's high; Harbourside's sales on transactions (DERIVED.salesOnTransH) for a test against a value other than 0;
// Millbrook's footfall on the high and on rain for statistical against practical significance; all 306 Harbourside days
// and the two cafés pooled for dependence. Fitting the line, residuals and R² are module 1's; checking the conditions is
// assumptions-and-diagnostics'; prediction is prediction-and-intervals'. Every figure printed is recomputed in `checks`.
import { column, CLEAN_ROWS, CAFE_COLUMNS, DERIVED as D } from './case.js?v=24';
import * as R from '../../../core/regression.js?v=24';
import * as C from '../../../core/correlation.js?v=24';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
// ---------------------------------------------------------------- Harbourside weekends, 1 July – 31 December, no festival days
const WK = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-07-01' && !r[at('festival')]);
const wx = WK.map((r) => r[at('high_f')]), wy = WK.map((r) => r[at('transactions')]), wRain = WK.map((r) => r[at('rain_in')]);
const FW = R.fit(wy, { 'High (°F)': wx });
const [W0, W1] = FW.coefs;
const n = FW.n, xbar = mean(wx), Sxx = wx.reduce((s, v) => s + (v - xbar) ** 2, 0);
const tq47 = R.tQuantile(0.975, 47);
const ssr = FW.sst - FW.sse;
const FWrain = R.fit(wy, { High: wx, Rain: wRain });
// the generator's planted slope for these days: 0.47 × 196 × 0.011 × the average rain factor × E[lognormal noise]
const planted = 0.47 * 196 * 0.011 * mean(wRain.map((v) => 1 - 0.62 * Math.min(v, 1))) * Math.exp(0.09 ** 2 / 2);
const plantedLong = 0.47 * 196 * 0.011 * 0.9509 * Math.exp(0.09 ** 2 / 2);   // long-run E[rain factor] = 0.9509 for b05-data.py's rain
const rW = C.pearson(wx, wy);
// ---------------------------------------------------------------- all 306 Harbourside days: footfall on the high
const FA = R.fit(column('footfall', H), { High: column('high_f', H) });
const rA = C.pearson(column('high_f', H), column('footfall', H));
const day120 = column('day', H).map((d, i) => i).filter((i) => column('day', H)[i] <= 120);
const springTrend = C.pearson(day120.map((i) => column('day', H)[i]), day120.map((i) => column('high_f', H)[i])).r;
// ---------------------------------------------------------------- Millbrook: significance and size
const FMh = R.fit(column('footfall', M), { High: column('high_f', M) });
const FMr = R.fit(column('footfall', M), { Rain: column('rain_in', M) });
const FHr = R.fit(column('footfall', H), { Rain: column('rain_in', H) });
const FPr = R.fit(column('footfall'), { Rain: column('rain_in') });
const meanFootM = mean(column('footfall', M));
// ---------------------------------------------------------------- dependence: sandwich standard errors for a simple slope, computed here
// (the engine has none): V = (X'X)⁻¹ M (X'X)⁻¹ with M from day clusters or from Newey–West (Bartlett) lags, with
// statsmodels' default small-sample corrections, which these values reproduce.
const slopeSE = (x, y, meat) => {
  const f = R.fit(y, { x }), e = Array.from(f.resid), n = x.length, A = f.XtXinv, X = x.map((v) => [1, v]);
  const Mt = meat(X, e, n), B = [0, 1].map((i) => [0, 1].map((j) => A[i][0] * Mt[0][j] + A[i][1] * Mt[1][j]));
  return Math.sqrt(B[1][0] * A[0][1] + B[1][1] * A[1][1]);
};
const neweyWest = (L) => (X, e, n) => {
  const Mt = [[0, 0], [0, 0]];
  for (let l = 0; l <= L; l++) {
    const w = l ? 1 - l / (L + 1) : 1;
    for (let t = l; t < n; t++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      Mt[a][b] += w * e[t] * e[t - l] * X[t][a] * X[t - l][b];
      if (l) Mt[a][b] += w * e[t] * e[t - l] * X[t - l][a] * X[t][b];
    }
  }
  return Mt.map((r) => r.map((v) => v * n / (n - 2)));
};
const byCluster = (g) => (X, e, n) => {
  const G = new Map(); X.forEach((r, i) => { const v = G.get(g[i]) || [0, 0]; v[0] += r[0] * e[i]; v[1] += r[1] * e[i]; G.set(g[i], v); });
  const Mt = [[0, 0], [0, 0]]; for (const v of G.values()) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) Mt[a][b] += v[a] * v[b];
  const c = G.size / (G.size - 1) * (n - 1) / (n - 2); return Mt.map((r) => r.map((v) => v * c));
};
// pooled rain, clustered by day; the two cafés' residuals on the same day
const clusterRain = slopeSE(column('rain_in'), column('footfall'), byCluster(column('date')));
const pooledRes = Array.from(FPr.resid), sameDayR = C.pearson(pooledRes.filter((_, i) => i % 2 === 0), pooledRes.filter((_, i) => i % 2 === 1)).r;
const rowsAlternate = column('cafe').every((c, i) => c === (i % 2 ? 'Millbrook' : 'Harbourside'));
// Harbourside's 220 non-festival weekdays: footfall on the high, with Newey–West standard errors
const WDH = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && !['Sat', 'Sun'].includes(r[at('weekday')]) && !r[at('festival')]);
const dx = WDH.map((r) => r[at('high_f')]), dy = WDH.map((r) => r[at('footfall')]);
const FD = R.fit(dy, { High: dx }), FD1 = FD.coefs[1];
const nw5 = slopeSE(dx, dy, neweyWest(5)), nw10 = slopeSE(dx, dy, neweyWest(10)), nw20 = slopeSE(dx, dy, neweyWest(20));
const FDb = R.fit(dy, { High: dx, Build: WDH.map((r) => Math.min(Math.round((Date.parse(r[at('date')]) - Date.parse('2027-03-01')) / 864e5), 120) / 120) });
const buildH = column('build_up', H);
const springBuild = C.pearson(buildH.slice(0, 121), column('high_f', H).slice(0, 121)).r;
// the all-306-days fit: residual lags 1 and 7, and Newey–West
const resA = Array.from(FA.resid), lagK = (a, k) => C.pearson(a.slice(0, -k), a.slice(k)).r;
const nwA7 = slopeSE(column('high_f', H), column('footfall', H), neweyWest(7));
// the exercise windows (inference-for-coefficients.ex.js g1; assess-m2 item 2)
const winOf = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to && !['Sat', 'Sun'].includes(r[at('weekday')]) && !r[at('festival')]);
const AS = winOf('Harbourside', '2027-08-16', '2027-09-24'), MB = winOf('Millbrook', '2027-08-02', '2027-09-10');
const asFit = R.fit(AS.map((r) => r[at('transactions')]), { x: AS.map((r) => r[at('high_f')]) }), mbFit = R.fit(MB.map((r) => r[at('sales')]), { x: MB.map((r) => r[at('transactions')]) });
const asNW = slopeSE(AS.map((r) => r[at('high_f')]), AS.map((r) => r[at('transactions')]), neweyWest(3));
const mbNW = slopeSE(MB.map((r) => r[at('transactions')]), MB.map((r) => r[at('sales')]), neweyWest(3));
// Millbrook's conversion
const convM = mean(column('transactions', M).map((t, i) => t / column('footfall', M)[i]));
// ---------------------------------------------------------------- sales on transactions at Harbourside
const ST = D.salesOnTransH, ST1 = ST.coefs[1];
const t640 = (ST1.estimate - 6.4) / ST1.se, p640 = R.tPTwo(t640, ST.df);
const meanTicketH = mean(column('avg_ticket', H));
// ---------------------------------------------------------------- Ferrybridge Ice Cream (fictional): eight days
const KX = [62, 66, 70, 71, 75, 78, 82, 88], KY = [118, 131, 140, 152, 149, 170, 176, 197];
const FK = R.fit(KY, { High: KX });
const kxbar = mean(KX), kSxx = KX.reduce((s, v) => s + (v - kxbar) ** 2, 0), kSxy = KX.reduce((s, v, i) => s + (v - kxbar) * (KY[i] - mean(KY)), 0);
const tq6 = R.tQuantile(0.975, 6);

const sig = (v) => String(Number(v.toPrecision(6)));
const E = (v) => v.toExponential(2).replace('e', 'E').replace(/E([+-])(\d)$/, 'E$10$2');

export default {
  slug: 'inference-for-coefficients',
  title: 'Inference for coefficients',
  blurb: 'Decide whether a fitted slope is evidence of a real relationship and how precisely it is known: the population model and its conditions, the standard error of a slope, t tests and confidence intervals for slope and intercept, the F test, and the ToolPak’s output. Then the two judgements software can’t make for you: whether a significant slope matters, and whether the rows were independent enough to trust its standard error.',
  status: 'reviewed',
  objectives: [
    'State the population regression model y = β₀ + β₁x + ε and its four conditions, and say which of them each inference relies on.',
    'Calculate the standard error of a slope, s ÷ √Sxx, and explain how the residual spread, the number of rows and the spread of x change it.',
    'Test H₀: β₁ = 0, or any other value, with t = (b₁ − β₁₀) ÷ SE(b₁) on n − 2 degrees of freedom, and build confidence intervals for the slope and the intercept, by hand and in Excel.',
    'Read the ANOVA and coefficient tables of the ToolPak’s Regression output, and show that t² = F when there is one predictor.',
    'Assess whether a statistically significant slope is large enough to matter, and explain how rows that share a day or follow a season make standard errors too small.',
  ],
  prerequisites: [
    { lesson: 'b06/least-squares-line', why: 'The least-squares slope and intercept, and what they mean in context, are what this lesson tests.' },
    { lesson: 'b06/residuals-and-r-squared', why: 'Residuals, SST = SSR + SSE and the residual standard error s are the raw material of every standard error here.' },
    { lesson: 'b04/hypothesis-testing', why: 'Null and alternative hypotheses, p-values, α and the difference between statistical and practical significance are used without re-teaching.' },
    { lesson: 'b04/confidence-intervals', why: 'An interval as estimate ± critical t × standard error, and what 95% confidence means.' },
    { lesson: 'b05/testing-correlation', why: 'The t test of r, which gives exactly the same t as the test of a slope when there is one predictor.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'Running the ToolPak’s Regression tool and LINEST; this lesson explains the columns B03 named.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana wants to roster Harbourside’s weekend peak from the weather forecast. She takes the café’s weekend days from 1 July 2027, when its first four months of building up a clientele were over, to 31 December, and sets aside the three harbour-festival days: 49 Saturdays and Sundays. Fitted by least squares, transactions on the day’s high give ŷ = 26.10 + 1.005x: about one more transaction for each degree warmer. Is that slope a real feature of Harbourside’s weekends, or could 49 days of chance have produced it? And if it is real, how precisely does she know it?' },

    { h: 'A line from a sample' },
    { p: String.raw`Ana’s 49 days are a sample from all the weekend days the café might trade under similar conditions. Behind them is a <g>population regression model</g>:` },
    { math: String.raw`y = \beta_0 + \beta_1 x + \varepsilon` },
    { p: String.raw`Here <m>\beta_0 + \beta_1 x</m> is the population line, the average number of transactions on all weekend days with a high of x, and <m>\varepsilon</m> (epsilon), the error, is how far one day falls from that average for every reason the line leaves out: rain, a coach party, a sporting event on television. The least-squares coefficients <m>b_0</m> and <m>b_1</m> estimate <m>\beta_0</m> and <m>\beta_1</m>. A different 49 weekends would give a different line, so <m>b_1</m> has a sampling distribution, and its spread is what inference measures.` },

    { h: 'The standard error of the slope' },
    { p: String.raw`The standard deviation of that sampling distribution, estimated from the data, is the <g>standard error of the slope</g>:` },
    { math: String.raw`SE(b_1) = \dfrac{s}{\sqrt{S_{xx}}}, \qquad S_{xx} = \sum (x - \bar{x})^2` },
    { p: String.raw`Here s is the residual standard error from the residuals lesson (the <g>standard error of the regression</g>), 15.24 transactions for Ana’s weekends, and <m>S_{xx}</m> is the sum of squared deviations of the highs from their mean, 64.3°F: 13,529. So <m>SE(b_1) = 15.24 \div \sqrt{13{,}529} = 0.131</m> transactions per °F. Three things make a slope precise: small residuals (s), many rows, and a wide spread of x (both of which raise <m>S_{xx}</m>). Ana’s weekends run from 33°F in December to 94°F in August, and that range is what pins the slope down.` },

    { h: 'Is the slope zero? The t test' },
    { p: String.raw`If temperature had no linear relation to weekend transactions, <m>\beta_1</m> would be 0. The test of <m>H_0: \beta_1 = 0</m> against <m>H_1: \beta_1 \ne 0</m> uses` },
    { math: String.raw`t = \dfrac{b_1 - 0}{SE(b_1)} = \dfrac{1.005}{0.131} = 7.67` },
    { p: String.raw`on <m>n - 2 = 47</m> <g>degrees of freedom</g>: two coefficients were estimated, and each costs one. The two-sided p-value, <x>=T.DIST.2T(7.671,47)</x>, is below 0.001 (the ToolPak prints 7.92E-10). Ana rejects <m>H_0</m>: warmer weekend days go with more transactions at Harbourside, and a slope this far from 0 would essentially never arise by chance if there were no linear relationship. This is the same t as the test of the correlation in B05, <m>r\sqrt{n-2}/\sqrt{1-r^2}</m> with r = 0.746: with one predictor the two tests are identical.` },

    { h: 'How large is it? The confidence interval' },
    { p: String.raw`A test only says the slope isn’t 0. The <g>confidence interval</g> says how large it plausibly is:` },
    { math: String.raw`b_1 \pm t^{*}_{n-2} \times SE(b_1) = 1.005 \pm 2.012 \times 0.131 = 0.741 \text{ to } 1.269` },
    { p: 'where 2.012 is <x>=T.INV.2T(0.05,47)</x>. Each extra degree goes with between 0.74 and 1.27 more transactions on an average weekend day, holding nothing else fixed because nothing else is in the model; ten degrees warmer, between 7.4 and 12.7. The interval is the number to plan with: it carries the uncertainty that the single figure 1.005 hides. (The case’s data are generated with a known relationship; its planted slope for Harbourside’s weekends is about 0.97 transactions per °F (0.96 with these days’ rain), inside the interval.)' },
    { callout: 'key', title: 'What the interval covers, and what it doesn’t', html: 'A 95% interval for β₁ is built by a method that captures the population slope in 95% of samples, if the model’s conditions hold. It allows for sampling variation only. It doesn’t allow for rows that aren’t independent, for a straight line fitted to a curve, or for a variable left out that moves with x. Those are judgements about the data, made before the interval is believed.' },
  ],

  theory: [
    { h: 'The conditions' },
    { p: 'The t distribution of (b₁ − β₁) ÷ SE(b₁) rests on four conditions about the errors, often remembered by Penn State’s STAT 462 course as LINE:' },
    { list: [
      '<b>Linearity</b>: the average of y really is a straight line in x. If it curves, the slope is an average of different rates and its interval describes the wrong thing.',
      '<b>Independence</b>: each error is unrelated to the others. Violations make the standard error wrong, usually too small.',
      '<b>Normality</b>: the errors are roughly normal. With dozens of rows the slope’s t test is fairly robust to skewed errors; small samples, and prediction intervals for single cases, depend on it much more.',
      '<b>Equal variance</b>: the errors have the same spread at every x. If the spread grows with x, the usual standard error is off, and robust standard errors are the remedy.',
    ] },
    { p: 'OpenStax’s list adds a fifth: the data come from a random sample or a randomised experiment. This lesson names the conditions; assumptions-and-diagnostics checks each one with residual plots and tests. The case’s generator is multiplicative, so its spread in transactions grows with the average; over Ana’s 49 weekends the effect is too small to see (the Breusch–Pagan test that module 4 introduces gives p = 0.42), though across all 306 of Harbourside’s days, weekdays and weekends together, the same test on transactions against the high gives p = 0.006.' },

    { h: 'Where the standard error comes from' },
    { p: String.raw`The least-squares slope is a weighted sum of the y values, <m>b_1 = \sum (x_i - \bar{x})\,y_i \div S_{xx}</m>. If the errors are independent with common variance <m>\sigma^2</m>, the variance of that sum is <m>\sigma^2 / S_{xx}</m>. The residual standard error s estimates <m>\sigma</m> on <m>n - 2</m> degrees of freedom, and replacing <m>\sigma</m> by s is what turns a normal distribution into a t distribution. Both steps lean on independence: the weights only add up this way if each day’s error is unconnected with the next.` },
    { p: String.raw`Adding a predictor that accounts for part of the error lowers s and with it every standard error. Rain is the obvious one for a waterfront café: with the day’s rain in the model as well (multiple regression, module 3), s falls from 15.24 to 12.91 transactions and the temperature slope’s standard error from 0.131 to 0.111.` },

    { h: 'The intercept' },
    { p: String.raw`The intercept has its own standard error, <m>SE(b_0) = s\sqrt{1/n + \bar{x}^2/S_{xx}}</m>, here <m>15.24 \times \sqrt{1/49 + 64.35^2/13{,}529} = 8.71</m>. Its t is 26.10 ÷ 8.71 = 3.00 (p = 0.004) and its 95% interval runs from 8.6 to 43.6 transactions. Software prints this test for every model, but read it only when x = 0 means something. Here it is the average weekend at 0°F, colder than any day in the data (the coldest was 33°F), so the test answers a question nobody asked. The least-squares-line lesson shows the same problem in a starker form: Harbourside’s sales on transactions has an intercept of −$76.58.` },

    { h: 'Testing a value other than 0' },
    { p: String.raw`The t statistic works for any hypothesised slope: <m>t = (b_1 - \beta_{1,0}) \div SE(b_1)</m>. The useful question is often not “is there a relationship?” but “is it the size the plan assumes?”. Ana’s budget (a fictional planning figure) assumes each extra transaction at Harbourside brings $6.40 of sales. Across the café’s 306 days, sales on transactions give a slope of $6.641 per transaction with a standard error of $0.0479, so <m>t = (6.641 - 6.40) \div 0.0479 = 5.03</m> on 304 degrees of freedom, p below 0.001. The worked examples follow it through.` },

    { h: 'The F test and the ANOVA table' },
    { p: String.raw`The ToolPak’s ANOVA block splits the total sum of squares as the residuals lesson did, SST = SSR + SSE, and turns the split into a test. Each sum of squares divided by its degrees of freedom is a mean square; the residual mean square is <m>s^2</m>. The <g>F statistic</g> is their ratio:` },
    { math: String.raw`F = \dfrac{\text{MSR}}{\text{MSE}} = \dfrac{\text{SSR}/1}{\text{SSE}/(n-2)}` },
    { table: {
      caption: 'ANOVA: transactions on the day’s high, Harbourside weekends, 1 July – 31 December 2027 (49 days)',
      head: ['', 'df', 'SS', 'MS', 'F', 'Significance F'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Regression', '1', sig(ssr), sig(ssr), sig(FW.F), E(FW.pF)],
        ['Residual', String(FW.df), sig(FW.sse), sig(FW.s2), '', ''],
        ['Total', String(FW.n - 1), sig(FW.sst), '', '', ''],
      ],
    } },
    { p: 'F tests whether all the slopes are 0 at once. With one predictor that is the same hypothesis as the t test, and F is exactly t²: 7.671² = 58.85. Significance F is therefore the same p-value as the slope’s, 7.92E-10. The F test earns its keep in multiple regression, where it tests several slopes together and the t tests no longer add up to it.' },

    { h: 'Reading the coefficient table' },
    { table: {
      caption: 'Coefficients: the same fit, as the ToolPak prints them',
      head: ['', 'Coefficients', 'Standard Error', 't Stat', 'P-value', 'Lower 95%', 'Upper 95%'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Intercept', sig(W0.estimate), sig(W0.se), sig(W0.t), sig(W0.p), sig(W0.low), sig(W0.high)],
        ['High (°F)', sig(W1.estimate), sig(W1.se), sig(W1.t), E(W1.p), sig(W1.low), sig(W1.high)],
      ],
    } },
    { list: [
      '<b>Coefficients</b> are b₀ and b₁; <b>Standard Error</b> is SE(b₀) and SE(b₁).',
      '<b>t Stat</b> is the coefficient divided by its standard error: the test of H₀: β = 0 only. To test another value, subtract it first.',
      '<b>P-value</b> is two-sided. E-notation such as 7.92E-10 means 7.92 × 10⁻¹⁰; report it as “below 0.001”.',
      '<b>Lower 95%</b> and <b>Upper 95%</b> are the coefficient ± T.INV.2T(0.05, n − 2) × its standard error. The ToolPak’s Confidence Level box adds a second pair at another level.',
    ] },
    { p: 'LINEST gives the same numbers in a different arrangement: <x>=LINEST(C2:C50,B2:B50,TRUE,TRUE)</x> returns the slope and intercept in its first row and their standard errors in its second, so <x>=INDEX(LINEST(C2:C50,B2:B50,TRUE,TRUE),2,1)</x> is SE(b₁). LINEST prints no t or p; divide and use T.DIST.2T.' },

    { h: 'Statistical and practical significance' },
    { p: String.raw`A p-value says whether the slope is distinguishable from 0, not whether it matters. At Millbrook, the office-district café, footfall on the day’s high across all 306 days gives a slope of 0.85 people per °F, t = 2.77, p = 0.006: <g>statistically significant</g>. But R² is 0.025, and a day 10°F warmer goes with about 8.5 more people on an average of 226, roughly 4% more. Whether that has <g>practical significance</g> depends on the decision: it is too small to change a roster, whose half-hour steps cover about 3.5 peak transactions: 8.5 more people at Millbrook’s 55% conversion is about 4.7 transactions, 2.6 of them in the peak.` },
    { p: String.raw`The reverse mistake is as common. Millbrook’s footfall on rain gives a slope of −42.9 people per inch, p = 0.074: not significant at 5%. Its interval, −90.0 to +4.2, still includes losing 90 people on a one-inch day. “Not significant” means the data can’t rule out 0, not that the effect is 0; the interval shows what they can’t rule out on either side.` },

    { h: 'When rows aren’t independent' },
    { p: String.raw`Independence is the condition that business data break most often, and the one the output gives no warning about. Two forms appear in Ana’s log.` },
    { p: String.raw`<b>Days in sequence.</b> Harbourside’s 220 weekdays (festival days left out) give a slope of footfall on the day’s high of 1.36 people per °F, with a formula standard error of 0.094 and t = 14.4. But the high follows the season, with a correlation of 0.93 between one day’s high and the next, and the residuals do too: one weekday’s residual and the next correlate at 0.23. Neighbouring days repeat each other, so the 220 days carry less independent information than 220 separate draws. Newey–West standard errors, which allow for residuals correlated over a chosen number of lags (beyond this course to derive), put the slope’s standard error at 0.121 allowing 5 lags, 0.147 allowing 10 and 0.185 allowing 20: the formula’s figure is up to about half what it should be, and its interval up to about twice too narrow. The weekdays also include the café’s build-up over its first four months, which coincided with the spring’s warming (over the first 120 days, the high and the build-up correlate at 0.79); holding the build-up fixed (multiple regression) moves the slope to 1.15. Ana’s weekend sample avoids both problems: it starts after the build-up, and its residuals in date order correlate at only 0.03. It is not the seasonal x that matters, but whether the errors depend on each other.` },
    { p: String.raw`Leaving a pattern out can create dependence of its own. All 306 Harbourside days together give residuals that correlate at 0.30 from one day to the next and 0.43 a week apart: that is the weekly pattern of busy weekends, which a line in temperature alone leaves in the residuals. The cure there is to model the weekday pattern (categorical predictors, module 3), not only to adjust the standard error.` },
    { p: String.raw`<b>Rows that share a day.</b> Pooling both cafés, footfall on rain across 612 rows gives a slope of −62.0 people per inch with a formula standard error of 18.0. But the 612 rows hold only 306 days of weather: each day’s rain is entered twice, and the formula treats the two rows of a day as independent. They aren’t: on the same day the two cafés’ residuals correlate at −0.43, because Harbourside is busy at weekends and Millbrook on weekdays, so one café’s busy day is the other’s quiet one. Here that makes the formula’s standard error too large rather than too small: allowing for the pairing by day (a day-clustered standard error, beyond this course) gives 9.68, about half. Dependence doesn’t only make standard errors too small; it makes them wrong, in a direction that depends on how the rows are related. Rows that resemble each other (two branches in the same town on a sunny day) make the formula too optimistic; rows that offset each other, as here, make it too cautious. Fit each café separately (Harbourside’s slope is −81.1, Millbrook’s −42.9): each café’s 306 rows have one row a day, and the question “what does rain cost this café?” is the one Ana can act on.` },
    { callout: 'warn', title: 'Where a p-value is printed, say whether the rows are independent', html: 'A p-value from seasonal days in sequence, or from two cafés’ rows on the same days, rests on a standard error that assumes independent rows. Usually the error is too small (days that repeat each other), but it can be too large (rows that offset each other). The slope itself is still a fair description; it is its standard error, interval and p-value that can’t be taken at face value. Module 4’s Durbin–Watson statistic measures the dependence of residuals in time order.' },
  ],

  formulas: [
    { id: 'inf-model', name: 'Population simple regression model',
      tex: String.raw`y = \beta_0 + \beta_1 x + \varepsilon`,
      where: [[String.raw`\beta_0, \beta_1`, 'Population intercept and slope, estimated by b₀ and b₁', 'units of y; units of y per unit of x'], [String.raw`x`, 'Predictor', 'its units'], [String.raw`y`, 'Response', 'its units'], [String.raw`\varepsilon`, 'Error: how far one case falls from the population line', 'units of y']],
      assumptions: 'Linearity, independent errors, roughly normal errors, equal error variance at every x (LINE).',
      note: 'Checked with residual plots in assumptions-and-diagnostics.' },
    { id: 'inf-se-slope', name: 'Standard error of the slope',
      tex: String.raw`SE(b_1) = \dfrac{s}{\sqrt{S_{xx}}}, \qquad S_{xx} = \sum (x_i - \bar{x})^2`,
      where: [[String.raw`s`, 'Residual standard error, √(SSE ÷ (n − 2)); Excel’s STEYX', 'units of y'], [String.raw`S_{xx}`, 'Sum of squared deviations of x from its mean; Excel’s DEVSQ', 'units of x squared'], [String.raw`x_i, \bar{x}`, 'Each value of x and their mean', 'units of x'], [String.raw`SE(b_1)`, 'Estimated standard deviation of the slope’s sampling distribution', 'units of y per unit of x']],
      assumptions: 'Independent errors with equal variance.',
      note: 'In Excel: <x>=STEYX(C2:C50,B2:B50)/SQRT(DEVSQ(B2:B50))</x>, or <x>=INDEX(LINEST(C2:C50,B2:B50,TRUE,TRUE),2,1)</x>.' },
    { id: 'inf-t-slope', name: 't test for a slope',
      tex: String.raw`t = \dfrac{b_1 - \beta_{1,0}}{SE(b_1)}, \qquad \text{df} = n - 2`,
      where: [[String.raw`b_1`, 'Estimated slope', 'units of y per unit of x'], [String.raw`\beta_{1,0}`, 'Slope under the null hypothesis, usually 0', 'units of y per unit of x'], [String.raw`SE(b_1)`, 'Standard error of the slope', 'units of y per unit of x'], [String.raw`n`, 'Number of rows', ''], [String.raw`t`, 'Test statistic, compared with the t distribution', ''], [String.raw`\text{df}`, 'Degrees of freedom', '']],
      assumptions: 'The LINE conditions; the t distribution is exact for normal errors and approximate otherwise.',
      note: 'Two-sided p-value: <x>=T.DIST.2T(ABS(t),n-2)</x>. With one predictor this t equals the t test of r.' },
    { id: 'inf-ci-slope', name: 'Confidence interval for a slope',
      tex: String.raw`b_1 \pm t^{*}_{n-2}\, SE(b_1)`,
      where: [[String.raw`t^{*}_{n-2}`, 'Critical t for the confidence level; for 95%, T.INV.2T(0.05, n − 2)', ''], [String.raw`b_1`, 'Estimated slope', 'units of y per unit of x'], [String.raw`SE(b_1)`, 'Standard error of the slope', 'units of y per unit of x']],
      note: 'The ToolPak’s Lower 95% and Upper 95%.' },
    { id: 'inf-se-intercept', name: 'Standard error of the intercept',
      tex: String.raw`SE(b_0) = s\sqrt{\dfrac{1}{n} + \dfrac{\bar{x}^2}{S_{xx}}}`,
      where: [[String.raw`SE(b_0)`, 'Standard error of the intercept b₀', 'units of y'], [String.raw`s`, 'Residual standard error', 'units of y'], [String.raw`n`, 'Number of rows', ''], [String.raw`\bar{x}`, 'Mean of x', 'units of x'], [String.raw`S_{xx}`, 'Sum of squared deviations of x', 'units of x squared']],
      note: 'Test and interval as for the slope, on n − 2 df; meaningful only when x = 0 is a sensible value inside or near the data.' },
    { id: 'inf-f-test', name: 'F test for a simple regression',
      tex: String.raw`F = \dfrac{\text{SSR}/1}{\text{SSE}/(n - 2)} = t^2`,
      where: [[String.raw`\text{SSR}`, 'Regression sum of squares, SST − SSE', 'units of y squared'], [String.raw`\text{SSE}`, 'Residual sum of squares', 'units of y squared'], [String.raw`n`, 'Number of rows', ''], [String.raw`F`, 'F statistic: the regression mean square over the residual mean square', ''], [String.raw`t`, 'The slope’s t statistic', '']],
      assumptions: 'As for the t test; compared with the F distribution on 1 and n − 2 df.',
      note: 'Significance F: <x>=F.DIST.RT(F,1,n-2)</x>. With several predictors F tests all slopes at once (multiple-regression).' },
  ],

  examples: [
    { level: 'simple', title: 'Cones and temperature at a seafront kiosk', fictional: true,
      setup: 'Ferrybridge Ice Cream (fictional), a seafront kiosk, recorded the day’s high and the cones sold on eight days. The least-squares line is ŷ = −65.70 + 2.971x, with residual standard error s = 4.803 cones. Is the slope significantly different from 0 at α = 0.05, and what is its 95% confidence interval?',
      table: { head: ['High (°F)', ...KX.map(String)], rows: [['Cones sold', ...KY.map(String)]], align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        String.raw`Spread of x: the mean high is <m>\bar{x} = 74</m>°F and <m>S_{xx} = \sum (x - 74)^2 = 144 + 64 + 16 + 9 + 1 + 16 + 64 + 196 = 510</m>.`,
        String.raw`Standard error of the slope: <m>SE(b_1) = 4.803 \div \sqrt{510} = 4.803 \div 22.58 = 0.2127</m> cones per °F.`,
        String.raw`t test of <m>H_0: \beta_1 = 0</m>: <m>t = 2.971 \div 0.2127 = 13.97</m> on 8 − 2 = 6 degrees of freedom. <x>=T.DIST.2T(13.97,6)</x> is about 0.00001, below 0.001: reject <m>H_0</m>.`,
        String.raw`Interval: the critical t is <x>=T.INV.2T(0.05,6)</x> = 2.447, so <m>2.971 \pm 2.447 \times 0.2127</m> runs from 2.450 to 3.491 cones per °F.`,
      ],
      answer: 't = 13.97 on 6 df, p below 0.001; 95% interval for the slope 2.45 to 3.49 cones per °F.',
      interpretation: 'Even with eight days the slope is clearly not 0, because the residuals are small (about 5 cones) relative to how much sales change across a 26-degree range. The interval is still wide in relative terms: a 10°F warmer day goes with somewhere between 25 and 35 more cones. Eight days from one stretch of summer may not be independent either: look at the residuals in date order before trusting the interval exactly.' },
    { level: 'challenging', title: 'Is an extra transaction worth the budget’s $6.40?', fictional: true,
      setup: 'Ana’s 2028 budget (a fictional planning figure) assumes each extra transaction at Harbourside brings $6.40 of sales. Across Harbourside’s 306 days in 2027, sales on transactions give b₁ = $6.641 per transaction, SE(b₁) = $0.0479, and an intercept of −$76.58. Test H₀: β₁ = 6.40 at α = 0.05, give the 95% interval, and explain why the slope is well above Harbourside’s average ticket of $5.34.',
      steps: [
        String.raw`Hypotheses: <m>H_0: \beta_1 = 6.40</m> (the budget’s figure), <m>H_1: \beta_1 \ne 6.40</m>. The ToolPak’s t Stat, 138.6, tests <m>\beta_1 = 0</m>, which nobody doubts; it is the wrong test here.`,
        String.raw`Statistic: <m>t = (6.641 - 6.40) \div 0.0479 = 5.03</m> on 306 − 2 = 304 degrees of freedom; <x>=T.DIST.2T(5.030,304)</x> is about 0.000001, below 0.001. Reject <m>H_0</m>.`,
        String.raw`Interval: <m>6.641 \pm 1.968 \times 0.0479</m>, from $6.547 to $6.735 per transaction. It excludes $6.40, as the test at 5% requires.`,
        'Why above the average ticket: the slope is the extra sales that go with one more transaction, not the average sale. In this log the average ticket itself rises on busier days (B05 found footfall and average ticket positively correlated within each café), so each extra transaction comes with slightly bigger tickets on the rest; the line pays for that with its negative intercept.',
        'Dependence: the residuals of this fit correlate at 0.18 from one day to the next, so check them in date order before trusting the standard error exactly. With t = 5.03 the conclusion would survive a standard error a good deal larger.',
      ],
      answer: 't = 5.03 on 304 df, p below 0.001: the slope differs from $6.40. 95% interval $6.55 to $6.74 per extra transaction.',
      interpretation: 'The budget’s figure is a little low as a marginal value, and the difference is about 24 cents a transaction: on a busy day 50 transactions above normal, about $12. Statistically clear, practically modest. Ana should keep the planning figure honest by quoting the interval, and should not confuse the slope (extra sales per extra transaction on this range of days) with the average ticket ($5.34), which is what each transaction brings on average.' },
    { level: 'applied', title: 'How many more barista hours per 10 degrees?', fictional: true,
      setup: 'Ana rosters Harbourside’s 7–11 a.m. peak to keep peak transactions per barista hour at about 7 or fewer (B05 found waits rise steeply above that load). In the log, peak transactions are 55% of the day’s. Using the weekend model (b₁ = 1.005 transactions per °F, 95% interval 0.741 to 1.269), how many extra barista hours should a weekend forecast 10°F warmer than another add?',
      steps: [
        'Slope to the change: 10°F × 0.741 to 10 × 1.269 = 7.4 to 12.7 more transactions in the day; 10.05 at the estimate.',
        'Peak share: 55% of those fall in the peak, 0.55 × 7.41 = 4.08 to 0.55 × 12.69 = 6.98 peak transactions.',
        'Barista hours at 7 transactions each: 4.08 ÷ 7 = 0.58 to 6.98 ÷ 7 = 1.00 extra barista hour; 0.79 at the estimate.',
        'Check the inputs: the 49 days start after the café’s build-up and leave out festivals, and their residuals in date order correlate at only 0.03, so the interval is believable. It is an interval for the average change, not a promise about a particular Saturday.',
      ],
      answer: 'Between about half an hour and one hour of extra barista time for each 10°F; 0.8 hour at the estimate: one extra half hour per 10°F, or a full hour if Ana plans to the interval’s upper end.',
      interpretation: 'The interval, not the estimate, sets the rule: even its lower end justifies an extra half hour for a 10-degree warmer forecast. How many hours a particular Saturday needs is a different question, about one day rather than the average, and needs the wider prediction interval of the next lesson. Rain, the other big influence on a waterfront café, would sharpen the rule; multiple regression adds it.' },
  ],

  demo: [
    { widget: 'inf-weekends', intro: 'The ToolPak’s Summary Output for Harbourside’s 49 weekend days from July. With High (°F) alone, check SE(b₁) = 0.131, t = 7.67 and the interval 0.741 to 1.269, and that F = t². Then tick Rain as well: s falls from 15.24 to 12.91 and the temperature slope’s standard error with it.' },
    { widget: 'inf-se', intro: 'What makes a slope precise? Change the residual standard error, the number of rows and the spread of x, and watch SE(b₁), t and the interval. Doubling the spread of x halves the standard error; doubling n only divides it by about 1.4.' },
    { widget: 'inf-sheet', intro: 'The same 49 days with the whole inference as formulas: SLOPE, STEYX, DEVSQ, the standard error, t, T.DIST.2T and T.INV.2T, and LINEST’s standard error for comparison. Change the confidence level in G9, or a day’s transactions, and everything updates.' },
  ],

  mistakes: [
    { title: '“p is below 0.001, so the slope is large.”', html: 'The p-value measures distance from 0 in standard errors. Millbrook’s 0.85 people per °F is significant (p = 0.006) and too small to change a roster. Report the slope with its interval and judge the size in the decision’s units.' },
    { title: '“The slope isn’t significant, so x has no effect.”', html: 'Failing to reject β₁ = 0 means 0 is among the plausible values, not that it is the true one. Millbrook’s rain slope has p = 0.074 and an interval from −90 to +4 people per inch: a large effect is still possible.' },
    { title: 'Using the printed t Stat to test the value a plan assumes', html: 'The ToolPak’s t Stat and P-value test β = 0 only. To test β₁ = 6.40, compute (b₁ − 6.40) ÷ SE(b₁), or check whether 6.40 lies inside the interval.' },
    { title: 'Reading the intercept’s test when x = 0 is meaningless', html: 'Every output tests the intercept, but at 0°F, or 0 transactions, the line is an extrapolation. Ignore the intercept’s p-value unless x = 0 is a real and observed situation.' },
    { title: 'Trusting standard errors from dependent rows', html: 'Two cafés on the same days, or consecutive days that follow the season, are not independent observations. Consecutive weekdays at Harbourside make the formula’s standard error up to about half what it should be; two cafés with opposite weekly patterns make it about twice too large. Fit groups separately, choose rows whose errors are independent, check residuals in date order, and say so beside the p-value.' },
    { title: 'Using n − 1 degrees of freedom', html: 'A simple regression estimates two coefficients, so its t tests and intervals use n − 2 degrees of freedom: T.INV.2T(0.05, n − 2), T.DIST.2T(|t|, n − 2).' },
  ],

  application: [
    { case: 'Ana’s note to Harbourside’s manager reads: “Weekend transactions rise by about 1.0 for each degree of forecast high (95% CI 0.74 to 1.27; 49 weekend days, July to December 2027, festival days excluded; t = 7.7, p &lt; 0.001). Residuals from day to day are essentially independent (r = 0.03), so the interval is a fair guide. For each 10°F warmer forecast, roster an extra half hour of barista time at the peak (0.8 hour at the estimate), or a full hour if we plan to the interval’s upper end. This is an average; for a particular day see the prediction intervals. Don’t use the figure for all 306 days (2.0 people per °F in footfall): it mixes weekdays with weekends and includes the café’s first four months of build-up.”' },
    { p: 'The note gives the slope in the decision’s units, its interval, the sample and its exclusions, and the condition most likely to fail. It translates the interval into the roster’s half-hour steps, which is where practical significance is decided, and it separates the average change (this lesson) from a single day’s forecast (the next).' },
    { p: 'Analysts elsewhere make the same moves. An electricity retailer estimating extra demand per degree of cooling weather reports the slope with an interval and knows that consecutive hot days are not independent. A hotel group testing whether its own 6.5% planned uplift per marketing pound is right tests the slope against 6.5%, not against 0. A clinic finding that waiting time falls by a significant 0.2 minutes per extra receptionist hour decides whether 0.2 minutes is worth an hour’s wage; the p-value can’t make that call.' },
    { p: 'Two cautions travel with every coefficient. It is an association: warm weekends go with more transactions, which is plausible as a cause here, but the regression alone doesn’t show it. And it holds for the range and conditions sampled: Harbourside’s weekends from July, between 33°F and 94°F, after the café was established.' },
  ],

  summary: [
    'The population model is y = β₀ + β₁x + ε; b₀ and b₁ estimate β₀ and β₁, and vary from sample to sample.',
    'SE(b₁) = s ÷ √Sxx: smaller residuals, more rows and a wider spread of x make the slope more precise.',
    'Test H₀: β₁ = β₁₀ with t = (b₁ − β₁₀) ÷ SE(b₁) on n − 2 df; the ToolPak’s t Stat tests 0 only. With one predictor this t equals the t test of r, and F = t².',
    'The 95% interval b₁ ± T.INV.2T(0.05, n − 2) × SE(b₁) says how large the slope plausibly is. Plan with it, not with the estimate alone.',
    'The conditions are linearity, independence, normality and equal variance (LINE); module 4 checks them. Read the intercept’s test only when x = 0 is meaningful.',
    'Significant is not the same as important, and not significant is not the same as no effect: judge both with the interval in the decision’s units.',
    'Rows that share a day or follow a season are not independent: standard errors, intervals and p-values are then wrong, usually too small, sometimes too large. Say so wherever they are printed.',
  ],

  glossary: [
    { term: 'Population regression model', def: 'The model y = β₀ + β₁x + ε that a sample regression estimates: a population line giving the average of y at each x, plus an error ε for how far each case falls from it.' },
    { term: 'LINE conditions', def: 'The four conditions behind regression’s t tests and intervals: a linear relationship, independent errors, normally distributed errors and equal error variance at every x.' },
    { term: 'Standard error of the slope', def: 'The estimated standard deviation of a regression slope’s sampling distribution, s ÷ √Sxx in simple regression: how far the slope from one sample typically lies from the population slope.' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, lesson 3.1, “Inference for the Population Intercept and Slope”.', url: 'https://online.stat.psu.edu/stat462/node/102', checked: '2026-11-01' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.4, “Testing the Significance of the Correlation Coefficient” (the regression assumptions). OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-4-testing-the-significance-of-the-correlation-coefficient', checked: '2026-11-01' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 4.1.4.1, “Linear Least Squares Regression”.', url: 'https://itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm', checked: '2026-11-01' },
    { text: 'Microsoft Support. “LINEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/linest-function', checked: '2026-11-01' },
    { text: 'Microsoft Support. “STEYX function”.', url: 'https://support.microsoft.com/en-us/excel/functions/steyx-function', checked: '2026-11-01' },
  ],

  checks: [
    // the weekend sample
    { what: 'Weekend days', value: n, shown: 49 },
    { what: 'Three festival days left out of July–December weekends', value: CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-07-01' && r[at('festival')]).length, shown: 3 },
    { what: 'Intercept', value: W0.estimate, shown: 26.10 },
    { what: 'Slope', value: W1.estimate, shown: 1.005, tol: 0.0005 },
    { what: 'Slope about one', value: W1.estimate, shown: 1.0, tol: 0.05 },
    { what: 's', value: FW.sigma, shown: 15.24 },
    { what: 'Mean high', value: xbar, shown: 64.3, tol: 0.05 },
    { what: 'Mean high (2 dp)', value: xbar, shown: 64.35 },
    { what: 'Sxx', value: Sxx, shown: 13529, tol: 0.5 },
    { what: 'SE(b1)', value: W1.se, shown: 0.131, tol: 0.0005 },
    { what: 'SE formula', value: FW.sigma / Math.sqrt(Sxx), shown: W1.se, tol: 1e-9 },
    { what: 'Lowest high', value: Math.min(...wx), shown: 33 },
    { what: 'Highest high', value: Math.max(...wx), shown: 94 },
    { what: 'Coldest in December, warmest in August', value: Number(WK[wx.indexOf(33)][at('date')].startsWith('2027-12') && WK[wx.indexOf(94)][at('date')].startsWith('2027-08')), shown: 1 },
    { what: 't', value: W1.t, shown: 7.67 },
    { what: 't (3 dp)', value: W1.t, shown: 7.671, tol: 0.0005 },
    { what: 'df', value: FW.df, shown: 47 },
    { what: 'p below 0.001', value: Number(W1.p < 0.001), shown: 1 },
    { what: 'p in E notation', value: W1.p * 1e10, shown: 7.92, tol: 0.005 },
    { what: 'r of the weekend sample', value: rW.r, shown: 0.746, tol: 0.0005 },
    { what: 't of r equals t of slope', value: rW.t, shown: W1.t, tol: 1e-6 },
    { what: 't*', value: tq47, shown: 2.012, tol: 0.0005 },
    { what: 'CI lower', value: W1.low, shown: 0.741, tol: 0.0005 },
    { what: 'CI upper', value: W1.high, shown: 1.269, tol: 0.0005 },
    { what: 'CI lower (2 dp)', value: W1.low, shown: 0.74 },
    { what: 'CI upper (2 dp)', value: W1.high, shown: 1.27 },
    { what: '10 × lower', value: 10 * W1.low, shown: 7.4, tol: 0.05 },
    { what: '10 × upper', value: 10 * W1.high, shown: 12.7, tol: 0.05 },
    { what: '10 × lower (2 dp)', value: 10 * W1.low, shown: 7.41 },
    { what: '10 × upper (2 dp)', value: 10 * W1.high, shown: 12.69 },
    { what: '10 × slope', value: 10 * W1.estimate, shown: 10.05 },
    { what: 'Planted slope with these days’ rain', value: planted, shown: 0.96 },
    { what: 'Planted slope, long run', value: plantedLong, shown: 0.97 },
    { what: 'Planted slope inside the interval', value: Number(planted > W1.low && planted < W1.high), shown: 1 },
    // conditions and rain
    { what: 'Breusch–Pagan p on the weekends', value: R.breuschPagan([wx], FW.resid).p, shown: 0.42 },
    { what: 'Breusch–Pagan on all Harbourside days, transactions on high', value: R.breuschPagan([column('high_f', H)], R.fit(column('transactions', H), { High: column('high_f', H) }).resid).p, shown: 0.006, tol: 0.0005 },
    { what: 's with rain', value: FWrain.sigma, shown: 12.91 },
    { what: 'SE(high) with rain', value: FWrain.coefs[1].se, shown: 0.111, tol: 0.0005 },
    // intercept
    { what: 'SE(b0)', value: W0.se, shown: 8.71 },
    { what: 'SE(b0) formula', value: FW.sigma * Math.sqrt(1 / n + xbar ** 2 / Sxx), shown: W0.se, tol: 1e-9 },
    { what: 't of intercept', value: W0.t, shown: 3.00 },
    { what: 'p of intercept', value: W0.p, shown: 0.004, tol: 0.0005 },
    { what: 'Intercept CI lower', value: W0.low, shown: 8.6, tol: 0.05 },
    { what: 'Intercept CI upper', value: W0.high, shown: 43.6, tol: 0.05 },
    { what: 'Harbourside sales on transactions intercept', value: ST.coefs[0].estimate, shown: -76.58 },
    // value other than 0
    { what: 'Sales slope', value: ST1.estimate, shown: 6.641, tol: 0.0005 },
    { what: 'Sales slope SE', value: ST1.se, shown: 0.0479, tol: 0.00005 },
    { what: 't vs 6.40', value: t640, shown: 5.03 },
    { what: 't vs 6.40 (3 dp)', value: t640, shown: 5.030, tol: 0.0005 },
    { what: 'p vs 6.40 below 0.001', value: Number(p640 < 0.001), shown: 1 },
    { what: 'p vs 6.40 about 0.000001', value: p640, shown: 0.000001, tol: 0.0000005 },
    { what: 'Sales df', value: ST.df, shown: 304 },
    { what: 'Harbourside days', value: ST.n, shown: 306 },
    { what: 'Sales t Stat vs 0', value: ST1.t, shown: 138.6, tol: 0.05 },
    { what: 't* 304', value: R.tQuantile(0.975, 304), shown: 1.968, tol: 0.0005 },
    { what: 'Sales CI lower', value: ST1.low, shown: 6.547, tol: 0.0005 },
    { what: 'Sales CI upper', value: ST1.high, shown: 6.735, tol: 0.0005 },
    { what: 'Sales CI lower (2 dp)', value: ST1.low, shown: 6.55 },
    { what: 'Sales CI upper (2 dp)', value: ST1.high, shown: 6.74 },
    { what: 'Mean ticket at Harbourside', value: meanTicketH, shown: 5.34 },
    { what: 'Slope above mean ticket', value: Number(ST1.estimate > meanTicketH), shown: 1 },
    { what: 'Average ticket rises with footfall inside Harbourside (B05)', value: Number(C.pearson(column('footfall', H), column('avg_ticket', H)).r > 0), shown: 1 },
    { what: 'Sales residual lag-1', value: R.lag1(Array.from(ST.resid)), shown: 0.18 },
    { what: 'About 24 cents', value: (ST1.estimate - 6.4) * 100, shown: 24, tol: 0.5 },
    { what: '50 transactions × 24 cents', value: 50 * (ST1.estimate - 6.4), shown: 12, tol: 0.1 },
    // ANOVA
    { what: 'F', value: FW.F, shown: 58.85 },
    { what: 't² = F', value: W1.t ** 2, shown: 58.85 },
    { what: 'Significance F = slope p', value: FW.pF, shown: W1.p, tol: 1e-15 },
    // Millbrook
    { what: 'Millbrook high slope', value: FMh.coefs[1].estimate, shown: 0.85 },
    { what: 'Millbrook high t', value: FMh.coefs[1].t, shown: 2.77 },
    { what: 'Millbrook high p', value: FMh.coefs[1].p, shown: 0.006, tol: 0.0005 },
    { what: 'Millbrook high R²', value: FMh.r2, shown: 0.025, tol: 0.0005 },
    { what: '10°F at Millbrook', value: 10 * FMh.coefs[1].estimate, shown: 8.5, tol: 0.05 },
    { what: 'Millbrook mean footfall', value: meanFootM, shown: 226, tol: 0.5 },
    { what: 'Roughly 4% more', value: 10 * FMh.coefs[1].estimate / meanFootM * 100, shown: 4, tol: 0.5 },
    { what: 'Half-hour step covers 3.5 peak transactions at 7 per barista hour', value: 0.5 * 7, shown: 3.5 },
    { what: 'Millbrook conversion about 55%', value: convM, shown: 0.55, tol: 0.005 },
    { what: '8.5 people × 55% = transactions', value: 10 * FMh.coefs[1].estimate * 0.55, shown: 4.7, tol: 0.05 },
    { what: 'Of which in the peak', value: 10 * FMh.coefs[1].estimate * 0.55 * 0.55, shown: 2.6, tol: 0.05 },
    { what: 'Millbrook rain slope', value: FMr.coefs[1].estimate, shown: -42.9, tol: 0.05 },
    { what: 'Millbrook rain p', value: FMr.coefs[1].p, shown: 0.074, tol: 0.0005 },
    { what: 'Millbrook rain CI lower', value: FMr.coefs[1].low, shown: -90.0, tol: 0.05 },
    { what: 'Millbrook rain CI upper', value: FMr.coefs[1].high, shown: 4.2, tol: 0.05 },
    { what: 'Millbrook rain CI lower (whole)', value: FMr.coefs[1].low, shown: -90, tol: 0.5 },
    // dependence
    { what: 'All-days slope (1 dp)', value: FA.coefs[1].estimate, shown: 2.0, tol: 0.05 },
    { what: 'Lag-1 of the high', value: R.lag1(column('high_f', H)), shown: 0.93 },
    { what: 'Lag-1 of all-days residuals', value: R.lag1(resA), shown: 0.30 },
    { what: 'Lag-7 of all-days residuals', value: lagK(resA, 7), shown: 0.43 },
    { what: 'Lags 2–5 of all-days residuals are negative: the weekly pattern', value: Number([2, 3, 4, 5].every((k) => lagK(resA, k) < 0)), shown: 1 },
    { what: 'All-days Newey–West SE (7 lags) within 10% of OLS: not a too-narrow-interval example', value: Number(Math.abs(nwA7 / FA.coefs[1].se - 1) < 0.1), shown: 1 },
    { what: 'Weekdays: 220 non-festival days', value: WDH.length, shown: 220 },
    { what: 'Weekday slope', value: FD1.estimate, shown: 1.36 },
    { what: 'Weekday OLS SE', value: FD1.se, shown: 0.094, tol: 0.0005 },
    { what: 'Weekday t', value: FD1.t, shown: 14.4, tol: 0.05 },
    { what: 'Weekday residual lag-1', value: R.lag1(Array.from(FD.resid)), shown: 0.23 },
    { what: 'Newey–West 5 lags', value: nw5, shown: 0.121, tol: 0.0005 },
    { what: 'Newey–West 10 lags', value: nw10, shown: 0.147, tol: 0.0005 },
    { what: 'Newey–West 20 lags', value: nw20, shown: 0.185, tol: 0.0005 },
    { what: 'Formula SE up to about half the Newey–West one', value: FD1.se / nw20, shown: 0.5, tol: 0.03 },
    { what: 'Newey–West grows with lags (dependence is positive)', value: Number(FD1.se < nw5 && nw5 < nw10 && nw10 < nw20), shown: 1 },
    { what: 'Spring: high and build-up, first 120 days', value: springBuild, shown: 0.79 },
    { what: 'build_up column is the generator’s ramp variable', value: Number(buildH[0] === 0 && buildH[120] === 1 && buildH[200] === 1), shown: 1 },
    { what: 'Weekday build-up computed here matches case.js', value: Number(WDH.every((r) => Math.abs(Math.min(Math.round((Date.parse(r[at('date')]) - Date.parse('2027-03-01')) / 864e5), 120) / 120 - buildH[column('date', H).indexOf(r[at('date')])]) < 1e-12)), shown: 1 },
    { what: 'Weekday slope with build-up held fixed', value: FDb.coefs[1].estimate, shown: 1.15 },
    { what: 'Weekend residual lag-1', value: R.lag1(Array.from(FW.resid)), shown: 0.03 },
    { what: 'ex g1 window: residual lag-1', value: R.lag1(Array.from(asFit.resid)), shown: -0.12 },
    { what: 'ex g1 window: Newey–West SE not above OLS (no sign p is too small)', value: Number(asNW <= asFit.coefs[1].se), shown: 1 },
    { what: 'assess m2-2 window: residual lag-1', value: R.lag1(Array.from(mbFit.resid)), shown: -0.05 },
    { what: 'assess m2-2 window: Newey–West SE above OLS', value: Number(mbNW > mbFit.coefs[1].se), shown: 1 },
    { what: 'Weekend rows are in date order', value: Number(WK.every((r, i) => !i || r[at('date')] > WK[i - 1][at('date')])), shown: 1 },
    { what: 'Pooled rows', value: FPr.n, shown: 612 },
    { what: 'Pooled rain slope', value: FPr.coefs[1].estimate, shown: -62.0, tol: 0.05 },
    { what: 'Pooled rain SE', value: FPr.coefs[1].se, shown: 18.0, tol: 0.05 },
    { what: 'Rows alternate Harbourside, Millbrook by day', value: Number(rowsAlternate), shown: 1 },
    { what: 'Same-day residual correlation', value: sameDayR, shown: -0.43 },
    { what: 'Day-clustered SE', value: clusterRain, shown: 9.68 },
    { what: 'Clustered SE about half the formula’s', value: clusterRain / FPr.coefs[1].se, shown: 0.5, tol: 0.05 },
    { what: 'Formula SE too large here', value: Number(FPr.coefs[1].se > clusterRain), shown: 1 },
    { what: 'Distinct days', value: new Set(column('date')).size, shown: 306 },
    { what: 'Harbourside rain slope', value: FHr.coefs[1].estimate, shown: -81.1, tol: 0.05 },
    // kiosk
    { what: 'Kiosk mean high', value: kxbar, shown: 74 },
    { what: 'Kiosk Sxx', value: kSxx, shown: 510 },
    { what: 'Kiosk Sxx terms', value: 144 + 64 + 16 + 9 + 1 + 16 + 64 + 196, shown: 510 },
    { what: 'Kiosk slope', value: kSxy / kSxx, shown: 2.971, tol: 0.0005 },
    { what: 'Kiosk intercept', value: FK.coefs[0].estimate, shown: -65.70 },
    { what: 'Kiosk s', value: FK.sigma, shown: 4.803, tol: 0.0005 },
    { what: 'Kiosk s about 5', value: FK.sigma, shown: 5, tol: 0.5 },
    { what: '√510', value: Math.sqrt(510), shown: 22.58 },
    { what: 'Kiosk SE', value: FK.coefs[1].se, shown: 0.2127, tol: 0.00005 },
    { what: 'Kiosk t', value: FK.coefs[1].t, shown: 13.97 },
    { what: 'Kiosk p', value: FK.coefs[1].p, shown: 0.00001, tol: 0.000005 },
    { what: 'Kiosk p below 0.001', value: Number(FK.coefs[1].p < 0.001), shown: 1 },
    { what: 'Kiosk t*', value: tq6, shown: 2.447, tol: 0.0005 },
    { what: 'Kiosk CI lower', value: FK.coefs[1].low, shown: 2.450, tol: 0.0005 },
    { what: 'Kiosk CI upper', value: FK.coefs[1].high, shown: 3.491, tol: 0.0005 },
    { what: 'Kiosk CI lower (2 dp)', value: FK.coefs[1].low, shown: 2.45 },
    { what: 'Kiosk CI upper (2 dp)', value: FK.coefs[1].high, shown: 3.49 },
    { what: 'Kiosk range of highs', value: Math.max(...KX) - Math.min(...KX), shown: 26 },
    { what: 'Kiosk 10°F lower', value: 10 * FK.coefs[1].low, shown: 25, tol: 0.5 },
    { what: 'Kiosk 10°F upper', value: 10 * FK.coefs[1].high, shown: 35, tol: 0.5 },
    // staffing
    { what: 'Peak lower', value: 0.55 * 10 * W1.low, shown: 4.08, tol: 0.005 },
    { what: 'Peak upper', value: 0.55 * 10 * W1.high, shown: 6.98, tol: 0.005 },
    { what: 'Hours lower', value: 0.55 * 10 * W1.low / 7, shown: 0.58, tol: 0.005 },
    { what: 'Hours upper', value: 0.55 * 10 * W1.high / 7, shown: 1.00, tol: 0.005 },
    { what: 'Hours at estimate', value: 0.55 * 10 * W1.estimate / 7, shown: 0.79, tol: 0.005 },
    { what: 'Peak share 55%', value: column('peak_load', H)[0] * column('peak_staff_hours', H)[0] / column('transactions', H)[0], shown: 0.55, tol: 1e-9 },
    { what: 'Note: t rounded', value: W1.t, shown: 7.7, tol: 0.05 },
  ],
};
