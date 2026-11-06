// prediction-and-intervals.js — B06 · Prediction and intervals. Content only; exercises are in
// prediction-and-intervals.ex.js. Uses the cafés' corrected log from case.js: the same 49 Harbourside weekend days from
// 1 July 2027 as inference-for-coefficients (transactions on the day's high, festival days left out), to predict a
// Saturday's trade and roster its 7–11 a.m. peak; Harbourside's March weekends, before the café's build-up was over, to
// show extrapolation in time; and Ferrybridge Ice Cream's eight fictional days for the hand calculation. Intervals for
// several predictors are multiple-regression's; checking constant spread and normality is assumptions-and-diagnostics';
// back-transforming a prediction from logs is transformations-and-influence'. Every figure printed is recomputed in
// `checks`.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const sdv = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
// ---------------------------------------------------------------- the 49 weekend days
const WK = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-07-01' && !r[at('festival')]);
const wx = WK.map((r) => r[at('high_f')]), wy = WK.map((r) => r[at('transactions')]), wRain = WK.map((r) => r[at('rain_in')]);
const FW = R.fit(wy, { 'High (°F)': wx });
const [b0, b1] = FW.beta, s = FW.sigma, n = FW.n;
const xbar = mean(wx), Sxx = wx.reduce((t, v) => t + (v - xbar) ** 2, 0);
const tq = R.tQuantile(0.975, 47), t90 = R.tQuantile(0.9, 47);
const P = (x0) => FW.predict([x0]);
const p80 = P(80), pBar = P(xbar), p94 = P(94), p100 = P(100), p33 = P(33);
const upper90 = p80.yhat + t90 * p80.sePred;
const hours = (T) => 0.55 * T / 7;
const insidePI = wx.filter((x, i) => { const p = P(x); return wy[i] >= p.piLow && wy[i] <= p.piHigh; }).length;
const resid = Array.from(FW.resid);
const sdWarm = sdv(resid.filter((e, i) => wx[i] >= 70)), sdCool = sdv(resid.filter((e, i) => wx[i] < 55));
const FWrain = R.fit(wy, { High: wx, Rain: wRain });
const warmDays = WK.filter((r) => r[at('high_f')] >= 78);
const prRain = FWrain.predict([80, 0]), rainBound = prRain.yhat + R.tQuantile(0.9, FWrain.df) * prRain.sePred;
const ub90 = wx.map((v) => P(v).yhat + t90 * P(v).sePred), dryI = wRain.map((v, i) => i).filter((i) => wRain[i] === 0);
const dryExceed = dryI.filter((i) => wy[i] > ub90[i]).length / dryI.length, dryMeanRes = mean(dryI.map((i) => resid[i]));
const pAboveCI = R.tPTwo((p80.ciHigh - p80.yhat) / p80.sePred, 47) / 2;
const warmStaff = warmDays.map((r) => r[at('peak_staff_hours')]);
// March weekends: inside the range of highs, outside the period
const MAR = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] < '2027-04-01');
const marRes = MAR.map((r) => r[at('transactions')] - P(r[at('high_f')]).yhat);
// ---------------------------------------------------------------- Ferrybridge Ice Cream (fictional)
const KX = [62, 66, 70, 71, 75, 78, 82, 88], KY = [118, 131, 140, 152, 149, 170, 176, 197];
const FK = R.fit(KY, { High: KX }), k80 = FK.predict([80]), tq6 = R.tQuantile(0.975, 6);

// ---------------------------------------------------------------- the figure: data, line, interval for the mean, prediction interval
function bandsFigure() {
  const L = 62, Rt = 424, T = 18, B = 238, X0 = 30, X1 = 100, Y0 = 20, Y1 = 170;
  const X = (v) => L + ((v - X0) / (X1 - X0)) * (Rt - L), Y = (v) => B - ((v - Y0) / (Y1 - Y0)) * (B - T);
  const xs = []; for (let v = 33; v <= 94; v += 1) xs.push(v);
  const path = (f) => xs.map((v, k) => `${k ? 'L' : 'M'}${X(v).toFixed(1)},${Y(f(v)).toFixed(1)}`).join(' ');
  let svg = '<svg viewBox="0 0 440 300" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  // interval for the mean: shaded band
  svg += `<path d="${path((v) => P(v).ciHigh)} ${[...xs].reverse().map((v) => `L${X(v).toFixed(1)},${Y(P(v).ciLow).toFixed(1)}`).join(' ')} Z" fill="var(--series-2)" opacity="0.28"/>`;
  // prediction interval: dashed lines
  svg += `<path d="${path((v) => P(v).piHigh)}" fill="none" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="6 4"/>`;
  svg += `<path d="${path((v) => P(v).piLow)}" fill="none" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="6 4"/>`;
  // points
  wx.forEach((v, i) => { svg += `<circle cx="${X(v).toFixed(1)}" cy="${Y(wy[i]).toFixed(1)}" r="3.6" fill="var(--series-1)" opacity="0.8"/>`; });
  // fitted line
  svg += `<path d="${path((v) => b0 + b1 * v)}" fill="none" stroke="var(--ink)" stroke-width="2.2"/>`;
  // axes
  svg += `<line x1="${L}" x2="${Rt}" y1="${B}" y2="${B}" stroke="var(--ink)"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="var(--ink)"/>`;
  [40, 60, 80, 100].forEach((v) => { svg += `<line x1="${X(v)}" x2="${X(v)}" y1="${B}" y2="${B + 5}" stroke="var(--ink)"/><text x="${X(v)}" y="${B + 22}" text-anchor="${v === 100 ? 'end' : 'middle'}" fill="var(--ink-3)">${v}</text>`; });
  [50, 100, 150].forEach((v) => { svg += `<line x1="${L - 5}" x2="${L}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--ink)"/><text x="${L - 9}" y="${Y(v) + 5}" text-anchor="end" fill="var(--ink-3)">${v}</text>`; });
  svg += `<text x="${(L + Rt) / 2}" y="${B + 48}" text-anchor="middle" fill="var(--ink-3)">Day’s high (°F)</text>`;
  svg += `<text x="16" y="${(T + B) / 2}" text-anchor="middle" fill="var(--ink-3)" transform="rotate(-90 16 ${(T + B) / 2})">Transactions</text>`;
  // legend in the empty upper left
  svg += `<line x1="74" x2="98" y1="30" y2="30" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="6 4"/><text x="104" y="35" font-size="14">95% prediction interval</text>`;
  svg += `<rect x="74" y="45" width="24" height="12" fill="var(--series-2)" opacity="0.28"/><text x="104" y="56" font-size="14">95% interval for the mean</text>`;
  svg += `<line x1="74" x2="98" y1="72" y2="72" stroke="var(--ink)" stroke-width="2.2"/><text x="104" y="77" font-size="14">fitted line</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'prediction-and-intervals',
  title: 'Prediction and intervals',
  blurb: 'Use a fitted line to predict, and say how far to trust the prediction: the confidence interval for the average at a given x against the prediction interval for one new case, why both widen away from the mean of x, why the prediction interval never shrinks below the residual spread, and why extrapolation escapes them both. Then roster a Saturday’s peak from a weather forecast, by hand and in Excel.',
  status: 'reviewed',
  objectives: [
    'Calculate a point prediction ŷ₀ = b₀ + b₁x₀ for a new x, and explain why the same number estimates both the average at x₀ and a single new case.',
    'Calculate the confidence interval for the mean response and the prediction interval for one new case, using 1/n + (x₀ − x̄)²/Sxx, by hand and with FORECAST.LINEAR, STEYX, DEVSQ and T.INV.2T.',
    'Explain why both intervals are narrowest at x̄ and widen away from it, and why the prediction interval can’t shrink below about ±t × s however much data there is.',
    'Identify extrapolation, both beyond the range of x and to conditions the sample didn’t cover, and explain why no interval allows for it.',
    'Use a prediction bound to make a planning decision, and state what the prediction interval assumes about the errors.',
  ],
  prerequisites: [
    { lesson: 'b06/inference-for-coefficients', why: 'The population model, its conditions, standard errors and the t multiplier on n − 2 degrees of freedom.' },
    { lesson: 'b06/residuals-and-r-squared', why: 'The residual standard error s, which sets the width of every prediction interval.' },
    { lesson: 'b04/confidence-intervals', why: 'Intervals as estimate ± critical value × standard error, and what the confidence level promises.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'FORECAST.LINEAR and its argument order; B03 introduced it for point predictions only.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Friday’s forecast for Saturday is a high of 80°F and no rain. Harbourside’s manager has to set the 7–11 a.m. barista roster tonight, and Ana’s rule is to keep peak transactions per barista hour at about 7 or fewer, where B05 found that waits stay short. The previous lesson’s 49 weekend days give ŷ = 26.10 + 1.005x. How many transactions should the manager plan for, and how sure can she be?' },

    { h: 'A point prediction, and two questions it answers' },
    { p: String.raw`Put the forecast into the line: <m>\hat{y}_0 = 26.10 + 1.005 \times 80 = 106.5</m> transactions. That single number, the <g>point prediction</g>, answers two different questions, and they need different intervals.` },
    { list: [
      '<b>What is the average number of transactions on weekend days with a high of 80°F?</b> This is a question about the population line at x₀ = 80, the mean response. Its uncertainty comes only from not knowing β₀ and β₁ exactly.',
      '<b>How many transactions will there be this Saturday?</b> This is a question about one new day. Its uncertainty includes the line’s and, on top, the day’s own error ε: rain that wasn’t forecast, a coach party, a quiet morning.',
    ] },
    { p: String.raw`The first gets a <g>confidence interval for the mean response</g>, from 100.5 to 112.5 transactions. The second gets a <g>prediction interval</g>, from 75.3 to 137.8. The manager is rostering one Saturday, so the prediction interval is hers. Its width is the honest summary: even with a good model and a reliable forecast, a single 80°F Saturday could plausibly bring anything from about 75 to 138 transactions.` },

    { h: 'Where the widths come from' },
    { p: String.raw`Both intervals are <m>\hat{y}_0 \pm t^{*}_{n-2} \times</m> a standard error. For the mean response,` },
    { math: String.raw`SE_{\text{mean}} = s\sqrt{\dfrac{1}{n} + \dfrac{(x_0 - \bar{x})^2}{S_{xx}}}` },
    { math: String.raw`= 15.24 \times \sqrt{\dfrac{1}{49} + \dfrac{(80 - 64.35)^2}{13{,}529}} = 2.99` },
    { p: String.raw`and for a single new case one more <m>s^2</m> goes under the square root, for the new day’s own error:` },
    { math: String.raw`SE_{\text{pred}} = s\sqrt{1 + \dfrac{1}{n} + \dfrac{(x_0 - \bar{x})^2}{S_{xx}}}` },
    { math: String.raw`= 15.24 \times \sqrt{1 + 0.0204 + 0.0181} = 15.53` },
    { p: String.raw`With <m>t^{*}_{47} = 2.012</m>, the intervals are <m>106.5 \pm 2.012 \times 2.99</m> (100.5 to 112.5) and <m>106.5 \pm 2.012 \times 15.53</m> (75.3 to 137.8). The 1 under the second root dominates: the line is known to within about 3 transactions at 80°F, but a single day scatters about it by about 15.` },
    { figure: {
      svg: bandsFigure(),
      caption: 'Harbourside’s 49 weekend days from July: transactions against the day’s high, with the fitted line, the 95% confidence interval for the mean (shaded) and the 95% prediction interval for one new day (dashed). Both are narrowest at the mean high, 64°F.',
      alt: 'A scatterplot of 49 points, transactions from about 34 to 141 on the vertical axis against the day’s high from 33 to 94°F on the horizontal axis, rising from lower left to upper right. A straight fitted line runs through them from about 59 transactions at 33°F to about 121 at 94°F. A narrow shaded band hugs the line, a few transactions either side near 64°F and widening towards both ends to about 9 either side at 33°F and 94°F. Two dashed curves run about 31 transactions above and below the line, almost parallel to it, bending out slightly at the ends. All but two of the points lie between the dashed curves. A legend in the upper left names the prediction interval, the interval for the mean and the fitted line.',
    } },
    { callout: 'key', title: 'Two intervals, two questions', html: 'The confidence interval for the mean response is about the average of all days like this one; it shrinks towards zero width as data accumulate. The prediction interval is about one new day; however much data there is, it can’t be narrower than the scatter of single days about the line, roughly ±t × s. When the decision is about a single case (this Saturday’s roster, one customer’s bill, one machine’s output), use the prediction interval.' },
  ],

  theory: [
    { h: 'Why the intervals widen away from x̄' },
    { p: String.raw`The term <m>(x_0 - \bar{x})^2 / S_{xx}</m> is zero at the mean of x and grows with the square of the distance from it. The least-squares line always passes through <m>(\bar{x}, \bar{y})</m>; an error in its slope swings it round that point like a seesaw, so the line is pinned most firmly in the middle of the data and least at the ends. At <m>x_0 = \bar{x}</m> the standard error of the mean response is simply <m>s/\sqrt{n} = 15.24/7 = 2.18</m>, the standard error of a mean; at 80°F it is 2.99 and at the warmest day in the data, 94°F, 4.45.` },
    { table: {
      caption: 'Predicted transactions and 95% intervals at four highs (49 weekend days; t* = 2.012 on 47 df)',
      head: ['High (°F)', 'ŷ₀', 'Interval for the mean', 'Prediction interval'],
      align: ['l', 'r', 'r', 'r'],
      rows: [[`${xbar.toFixed(1)} (x̄)`, pBar], ['80', p80], ['94 (warmest day)', p94], ['100 (beyond the data)', p100]].map(([lab, p]) => [lab, p.yhat.toFixed(1), `${p.ciLow.toFixed(1)} to ${p.ciHigh.toFixed(1)}`, `${p.piLow.toFixed(1)} to ${p.piHigh.toFixed(1)}`]),
    } },
    { p: 'The interval for the mean more than doubles in width from x̄ to 94°F, while the prediction interval hardly moves: the day’s own error, s, dwarfs the uncertainty in the line. That is typical of business data with a modest R² (here 0.56). Better estimates of the line help the mean much more than the single case; only a better model, one that explains more of each day’s scatter, narrows the prediction interval substantially.' },
    { p: String.raw`The seesaw also says where data are most useful. A prediction at the warm end is helped by more warm days, which pull <m>\bar{x}</m> towards 80°F, and by a wide spread of highs, which raises <m>S_{xx}</m>. A sample of days all near 64°F would predict 64°F well and 90°F badly, even with the same n and the same s. If a model will be used mostly at one end of its range (Ana rosters with care on hot weekends, rarely on cold ones), that end is where the data should be densest.` },

    { h: 'The prediction interval’s floor' },
    { p: String.raw`As n grows, <m>1/n</m> and <m>(x_0 - \bar{x})^2/S_{xx}</m> both shrink towards 0, so <m>SE_{\text{mean}} \to 0</m> but <m>SE_{\text{pred}} \to s</m>. With ten years of weekends Ana would know the average at 80°F almost exactly, and a single Saturday would still range about ±1.96 × 15 transactions. Penn State’s STAT 462 puts it this way: the prediction interval is always wider than the confidence interval at the same x, and the extra term never goes away. The only way to narrow it is to reduce s itself. Rain is the obvious candidate: with the day’s rain in the model as well (multiple regression, module 3), s falls from 15.24 to 12.91.` },

    { h: 'Extrapolation' },
    { p: String.raw`The intervals assume the straight line holds at <m>x_0</m>. Inside the data’s range, 33°F to 94°F, the data can check that; outside it, nothing can. A forecast of 100°F gives ŷ = 126.6 with a prediction interval of 94.2 to 159.0, but the interval only measures uncertainty about a line that is assumed to continue. Real trade may level off as the waterfront becomes too hot to sit in, or the café may simply run out of seats. That is <g>extrapolation</g>, and NIST’s e-Handbook lists poor extrapolation among the main weaknesses of linear least squares. OpenStax’s statistics texts draw the same line between interpolation (predicting inside the observed x values) and extrapolation (outside them).` },
    { p: String.raw`Extrapolation is not only about x. Ana’s 49 days are Harbourside weekends from July, after the café had built up its regulars. Applied to March, inside the range of temperatures but outside the period, the line overpredicts every one of the eight March weekend days, by 16 transactions on average: the café was still in its first months. The same model is equally unfit for a weekday, for Millbrook, or for a festival day. A prediction is safe only for cases like the ones the model was fitted to, in x and in everything the model leaves out.` },

    { h: 'What the prediction interval assumes' },
    { p: 'The interval for the mean leans on the same conditions as the slope’s inference; the prediction interval leans on them harder, because it describes where one error will fall, not where an average will.' },
    { list: [
      '<b>Equal spread.</b> The interval has the same half-width (apart from the small seesaw term) at every x. If the spread grows with the mean, it is too wide for cool days and too narrow for warm ones. The case’s generator is multiplicative, so this is the direction to expect; in these 49 days the residuals’ standard deviation is 15.8 on days of 70°F or more against 13.2 below 55°F, a modest difference the Breusch–Pagan test can’t distinguish from chance.',
      '<b>Roughly normal errors.</b> The ±t × SE recipe sets the 95% limits where a normal error would put them. For the slope, the central limit theorem rescues the interval as n grows; for one new case it doesn’t, because a single error is not an average. Skewed errors make one tail of the prediction interval too short at any n. Module 4’s normal Q–Q plot checks this.',
      '<b>Independence and the right model.</b> The day must be like those the model was fitted to, and the model must not have left out a trend that has moved since.',
    ] },
    { p: 'A rough check is how many of the fitted days fall outside their own 95% prediction intervals: here 2 of 49 (4%), about the 5% expected. That is reassuring, though not a test: the intervals were computed from the same days.' },

    { h: 'Reporting a prediction' },
    { p: 'A prediction is only useful with four things beside it: the point value, the interval and which kind it is, the confidence level, and the scope (the range of x and the kind of case the model was fitted to). Software names the two intervals differently: OpenStax’s business statistics text calls them the confidence interval and the prediction interval, Penn State’s course the confidence interval for the mean response and the prediction interval for a new response, and some statistical packages label them “mean” and “obs” (observation). Whatever the label, ask whether it contains the 1 under the square root. If a report gives a single interval for a forecast without saying which, ask; one much narrower than the residual standard error suggests is probably the interval for the mean.' },

    { h: 'In Excel' },
    { p: 'The ToolPak’s Regression tool prints no interval for a new x, so build them from functions. With the highs in B2:B50, transactions in C2:C50 and the new high in F1:' },
    { list: [
      'Point prediction: <x>=FORECAST.LINEAR(F1,C2:C50,B2:B50)</x> (new x first, then known_y’s, then known_x’s; Microsoft’s page notes it replaced FORECAST in Excel 2016). <x>=TREND(C2:C50,B2:B50,F1)</x> gives the same value.',
      'The pieces: s is <x>=STEYX(C2:C50,B2:B50)</x>, Sxx is <x>=DEVSQ(B2:B50)</x>, n is <x>=COUNT(B2:B50)</x> and the multiplier is <x>=T.INV.2T(0.05,COUNT(B2:B50)-2)</x>.',
      'Half-width of the prediction interval: <x>=T.INV.2T(0.05,COUNT(B2:B50)-2)*STEYX(C2:C50,B2:B50)*SQRT(1+1/COUNT(B2:B50)+(F1-AVERAGE(B2:B50))^2/DEVSQ(B2:B50))</x>. Drop the <x>1+</x> for the interval for the mean.',
    ] },

    { h: 'One-sided bounds for planning' },
    { p: String.raw`A 95% prediction interval leaves 2.5% in each tail. A roster only worries about the upper tail: too few baristas is the costly mistake. A one-sided upper bound puts all the risk on that side: <m>\hat{y}_0 + t_{0.90,\,n-2} \times SE_{\text{pred}}</m> is exceeded on about 10% of such days, if the model and its conditions hold. At 80°F that is <m>106.5 + 1.300 \times 15.53 = 126.7</m> transactions, with 1.300 from <x>=T.INV(0.9,47)</x>. Which tail probability to accept is a business choice, the cost of an idle barista against the cost of long waits; the statistics only price each choice.` },
  ],

  formulas: [
    { id: 'pred-point', name: 'Point prediction',
      tex: String.raw`\hat{y}_0 = b_0 + b_1 x_0`,
      where: [[String.raw`\hat{y}_0`, 'Predicted y at the new x: the estimated mean response, and the best single guess for one new case', 'units of y'], [String.raw`b_0, b_1`, 'Fitted intercept and slope', 'units of y; per unit of x'], [String.raw`x_0`, 'The new value of x', 'units of x']],
      note: 'Excel: <x>=FORECAST.LINEAR(x0,known_y\'s,known_x\'s)</x> or <x>=TREND(known_y\'s,known_x\'s,x0)</x>.' },
    { id: 'pred-ci-mean', name: 'Confidence interval for the mean response',
      tex: String.raw`\hat{y}_0 \pm t^{*}_{n-2}\, s\sqrt{\dfrac{1}{n} + \dfrac{(x_0 - \bar{x})^2}{S_{xx}}}`,
      where: [[String.raw`\hat{y}_0`, 'Point prediction at x₀', 'units of y'], [String.raw`t^{*}_{n-2}`, 'Critical t; for 95%, T.INV.2T(0.05, n − 2)', ''], [String.raw`s`, 'Residual standard error (STEYX)', 'units of y'], [String.raw`n`, 'Number of rows', ''], [String.raw`x_0, \bar{x}`, 'The new x and the mean of the data’s x', 'units of x'], [String.raw`S_{xx}`, 'Sum of squared deviations of x (DEVSQ)', 'units of x squared']],
      assumptions: 'The LINE conditions; x₀ inside the range and conditions of the data.',
      note: 'Narrowest at x₀ = x̄, where it is ŷ ± t* × s ÷ √n.' },
    { id: 'pred-pi', name: 'Prediction interval for one new case',
      tex: String.raw`\hat{y}_0 \pm t^{*}_{n-2}\, s\sqrt{1 + \dfrac{1}{n} + \dfrac{(x_0 - \bar{x})^2}{S_{xx}}}`,
      where: [[String.raw`\hat{y}_0`, 'Point prediction at x₀', 'units of y'], [String.raw`t^{*}_{n-2}`, 'Critical t on n − 2 df', ''], [String.raw`s`, 'Residual standard error', 'units of y'], [String.raw`1`, 'The new case’s own error variance, in units of s²', ''], [String.raw`n`, 'Number of rows', ''], [String.raw`x_0, \bar{x}`, 'The new x and the mean of x', 'units of x'], [String.raw`S_{xx}`, 'Sum of squared deviations of x', 'units of x squared']],
      assumptions: 'As for the mean, and more strongly: constant spread at every x and roughly normal errors, at any sample size.',
      note: 'Never narrower than about ±t* × s, however large n is.' },
    { id: 'pred-upper', name: 'One-sided upper prediction bound',
      tex: String.raw`\hat{y}_0 + t_{1-\alpha,\,n-2}\; s\sqrt{1 + \dfrac{1}{n} + \dfrac{(x_0 - \bar{x})^2}{S_{xx}}}`,
      where: [[String.raw`t_{1-\alpha,\,n-2}`, 'One-sided critical t: T.INV(1 − α, n − 2), e.g. T.INV(0.9, n − 2) for a bound exceeded about 10% of the time', ''], [String.raw`\hat{y}_0`, 'Point prediction', 'units of y'], [String.raw`s`, 'Residual standard error', 'units of y'], [String.raw`n`, 'Number of rows', ''], [String.raw`x_0, \bar{x}`, 'The new x and the mean of x', 'units of x'], [String.raw`S_{xx}`, 'Sum of squared deviations of x', 'units of x squared']],
      note: 'Used when only one side of the error is costly (a roster, a stock level, a capacity).' },
  ],

  examples: [
    { level: 'simple', title: 'How many cones on an 80-degree day?', fictional: true,
      setup: 'Ferrybridge Ice Cream (fictional), from the previous lesson: eight days, highs from 62°F to 88°F, ŷ = −65.70 + 2.971x, s = 4.803 cones, x̄ = 74°F, Sxx = 510. Tomorrow’s forecast is 80°F. Give the 95% interval for the average number of cones on 80°F days, and the 95% prediction interval for tomorrow.',
      steps: [
        String.raw`Point prediction: <m>\hat{y}_0 = -65.70 + 2.971 \times 80 = 171.98</m> cones with the rounded coefficients; 171.95 with the unrounded ones, which the rest of the working uses.`,
        String.raw`Distance term: <m>(80 - 74)^2 / 510 = 36/510 = 0.0706</m>; with <m>1/n = 0.125</m>, the sum is 0.1956.`,
        String.raw`Standard errors: <m>SE_{\text{mean}} = 4.803 \times \sqrt{0.1956} = 2.124</m>; <m>SE_{\text{pred}} = 4.803 \times \sqrt{1.1956} = 5.252</m>.`,
        String.raw`Multiplier: <x>=T.INV.2T(0.05,6)</x> = 2.447. Interval for the mean: <m>171.95 \pm 2.447 \times 2.124</m>, 166.8 to 177.1. Prediction interval: <m>171.95 \pm 2.447 \times 5.252</m>, 159.1 to 184.8.`,
      ],
      answer: 'About 172 cones; 95% interval for the average at 80°F: 166.8 to 177.1; 95% prediction interval for tomorrow: 159.1 to 184.8 cones.',
      interpretation: 'To decide how much mix to make for tomorrow the kiosk needs the prediction interval: about 185 cones covers all but an unlucky day. The interval for the average would suit a different question, such as the season’s plan for 80-degree days. With only eight days, the 1/n term is large, so the line’s own uncertainty is a sizeable part of the prediction interval here, unlike in Ana’s 49 days.' },
    { level: 'challenging', title: 'Near the middle, at the edge, and beyond', fictional: true,
      setup: 'Using Harbourside’s 49 weekend days, compare the 95% intervals at the mean high (64.3°F), at 94°F (the warmest day in the data) and at 100°F. Then judge a prediction for a Saturday in March with a forecast of 50°F.',
      steps: [
        String.raw`At x̄ = 64.3°F: the distance term is 0, so <m>SE_{\text{mean}} = s/\sqrt{n} = 15.24/7 = 2.18</m> and <m>SE_{\text{pred}} = 15.24\sqrt{1 + 1/49} = 15.39</m>. ŷ = 90.8; intervals 86.4 to 95.2 (mean) and 59.8 to 121.7 (one day).`,
        String.raw`At 94°F: <m>(94 - 64.35)^2/13{,}529 = 0.065</m>, so <m>SE_{\text{mean}} = 4.45</m> and <m>SE_{\text{pred}} = 15.88</m>. ŷ = 120.6; intervals 111.6 to 129.5 and 88.6 to 152.5. The mean’s interval has doubled; the prediction interval has widened by about 3%.`,
        String.raw`At 100°F: ŷ = 126.6, prediction interval 94.2 to 159.0, barely wider than at 94°F. The formula can’t see that no day in the data was above 94°F: it assumes the line continues. The interval is not wrong arithmetic; it is the answer to a question the data can’t support.`,
        'March at 50°F: inside the range of highs, so the formula gives ŷ = 76.4 with an ordinary-looking interval. But the model was fitted to July–December, after the café’s build-up, and on all eight March weekend days it overpredicted, by 16 transactions on average. The March prediction is extrapolation in time.',
      ],
      answer: 'At x̄ the intervals are narrowest (±4.4 and ±31.0); at 94°F the mean’s interval doubles while the prediction interval barely changes; at 100°F and in March the formula still gives intervals, but they rest on assumptions the data can’t check.',
      interpretation: 'Distance from x̄ matters for the line’s uncertainty; distance from the data matters for whether the line applies at all. Only the first appears in the formula. Ana should use the model for warm weekends inside 33–94°F in the second half of the year, and refit when she has a full year of established trade.' },
    { level: 'applied', title: 'Rostering an 80-degree Saturday', fictional: true,
      setup: 'Saturday’s forecast at Harbourside is 80°F and dry. Peak (7–11 a.m.) transactions are 55% of the day’s, and Ana’s rule is about 7 peak transactions per barista hour. On the 14 weekend days in the sample with highs of 78°F or more, the roster gave 6.5 to 7.5 barista hours. How many barista hours should the manager roster, using the mean, the 95% prediction interval and a one-sided 90% upper bound?',
      steps: [
        'At the point prediction, 106.5 transactions: 0.55 × 106.5 = 58.6 peak transactions, ÷ 7 = 8.4 barista hours.',
        'At the 95% prediction interval’s upper end, 137.8: 0.55 × 137.8 ÷ 7 = 10.8 barista hours.',
        'At the one-sided 90% upper bound, 106.5 + 1.300 × 15.53 = 126.7: 0.55 × 126.7 ÷ 7 = 10.0 barista hours.',
        'Compare with practice: 6.5 to 7.5 hours on warm weekends means loads of about 8 to 9 at the predicted trade, above Ana’s rule. B05’s rule keeps the expected peak load at about 7, which means rostering to ŷ: 8.4 hours, or 8.5 in half-hour steps. That puts the load above 7 on about half of such Saturdays. The one-sided 90% bound is Ana’s stricter choice of tail risk: a load above 7 on about one Saturday in ten.',
        'Check the conditions: Saturday is a weekend day after the build-up, the forecast is inside 33–94°F, and it is dry, while the model averages over wet and dry days, so a dry 80°F day is likely to come in a little above the line.',
      ],
      answer: 'Roster 10 barista hours (the one-sided 90% bound, in half-hour steps): about 2.5 baristas across the four-hour peak, against the 6.5–7.5 hours warm weekends have been getting.',
      interpretation: 'The prediction interval turns a forecast into a staffing risk Ana can choose. Ten hours leaves about a one-in-ten chance of a load above 7 if the model holds; 8.5 hours, the rule’s own roster, would be cheaper and leave it near even odds. The model ignores rain, and the forecast is dry. Dry weekend days in the sample came in about 4 transactions above the line on average, but a model with rain also has smaller residuals (s of 12.91 against 15.24), and the two effects roughly cancel: the rain model’s one-sided 90% bound for a dry 80°F day is 127.5 transactions against 126.7 here, and the dry days in the sample exceeded this lesson’s bound 9.7% of the time. The roster is the decision; the regression only prices the options.' },
  ],

  demo: [
    { widget: 'pred-weekends', intro: 'The weekend model with prediction boxes. Enter 80 for the high and read ŷ = 106.5, the interval for the mean (100.5 to 112.5) and the prediction interval (75.3 to 137.8). Try 64.3, the mean high, then 94 and 33, and watch the interval for the mean widen while the prediction interval hardly moves. Then try 100, outside the data: the widget still answers, which is exactly the danger.' },
    { widget: 'pred-bands', intro: 'Half-widths of the two intervals across the range of highs, for a chosen confidence level and size of sample. The chart shows the interval for the mean bowing out from the middle and the prediction interval sitting on its floor of about ±t × s. Raise n to see the mean’s interval shrink towards 0 while the prediction interval doesn’t.' },
    { widget: 'pred-sheet', intro: 'The calculation in Excel: FORECAST.LINEAR for ŷ, then STEYX, DEVSQ, COUNT, AVERAGE and T.INV.2T for the two intervals, and the barista hours at the upper bound. Change the forecast in G1 or the confidence level in G2.' },
  ],

  mistakes: [
    { title: 'Using the confidence interval for a single day', html: 'The interval for the mean, 100.5 to 112.5 at 80°F, is about the average of all such days. One Saturday scatters about that average by roughly s, so its interval, 75.3 to 137.8, is five times as wide. Rostering to the top of the narrow one under-staffs about a third of such Saturdays.' },
    { title: '“More data will make the prediction interval as narrow as I like.”', html: 'More data shrinks 1/n and the distance term, not the 1 under the square root. The prediction interval’s floor is about ±t × s; only a model with smaller residuals lowers it.' },
    { title: 'Extrapolating because the formula still gives an answer', html: 'At 100°F, or for a March weekend, FORECAST.LINEAR returns a number and the formula an interval. Neither knows the data stopped at 94°F or began after the café’s build-up. Check that x₀ and the conditions are inside what the model was fitted to.' },
    { title: 'Treating the interval as exact when the spread changes with x', html: 'The prediction interval has nearly the same width at every x. If the spread grows with the mean, as a multiplicative process makes it, the interval is too narrow at the busy end, where mistakes cost most. Check the residual plot (module 4) before trusting the busy end.' },
    { title: 'Mixing up FORECAST.LINEAR’s arguments', html: 'FORECAST.LINEAR takes the new x first, then known_y’s, then known_x’s; SLOPE, INTERCEPT and STEYX take known_y’s first. <x>=FORECAST.LINEAR(80,B2:B50,C2:C50)</x> predicts the high from transactions instead.' },
  ],

  application: [
    { case: 'Ana’s weekend rostering sheet now has three columns beside the forecast: the predicted transactions, the one-sided 90% upper bound, and the barista hours at that bound. Her note to the manager reads: “Roster to the bound, rounded to the half hour. The model covers weekends from July to December 2027 between 33°F and 94°F; don’t use it for weekdays, festivals or forecasts outside that range. It ignores rain; on a dry 80°F forecast a model with rain gives almost the same bound (127.5 transactions against 126.7). It will be refitted with rain and the full year once 2028’s spring weekends are in.”' },
    { p: 'The sheet turns a prediction interval into a rule a manager can follow without statistics, and the note limits the rule to the cases it was built from. That is how prediction is used professionally: a point forecast for the central plan, a prediction bound for capacity, and a written scope. A bakery sets the next day’s bake from a predicted demand plus a margin for the day’s scatter; a call centre staffs to an upper bound on calls; an energy supplier hedges against the upper end of a cold-weather demand forecast.' },
    { p: 'In each case the width of the interval is itself information. A wide prediction interval says the model leaves a lot of each day unexplained; narrowing it is a job for a better model, with more predictors or a better functional form, not for more decimal places. And the interval for the mean has its own uses: a budget for the season’s average warm Saturday, or a comparison between two cafés’ typical days.' },
    { p: 'Finally, a prediction is only as good as its inputs. A 95% prediction interval treats the forecast high as known. If the forecast itself might be 5°F out, the transactions it implies are more uncertain still; a slope of about 1 transaction per °F makes that roughly 5 transactions either way, small beside the interval’s ±31 but worth knowing.' },
  ],

  summary: [
    'ŷ₀ = b₀ + b₁x₀ estimates both the average at x₀ and a single new case; FORECAST.LINEAR(x₀, known_y’s, known_x’s) computes it.',
    'Interval for the mean response: ŷ₀ ± t* × s√(1/n + (x₀ − x̄)²/Sxx). Prediction interval for one new case: the same with 1 + under the root.',
    'Both are narrowest at x̄ and widen with (x₀ − x̄)²; the interval for the mean shrinks towards 0 with more data, the prediction interval never below about ±t* × s.',
    'Extrapolation, beyond the data’s x or to conditions the sample didn’t cover, is outside what any interval measures.',
    'The prediction interval depends strongly on constant spread and roughly normal errors, at any sample size.',
    'For planning against one costly side, use a one-sided bound: ŷ₀ + T.INV(1 − α, n − 2) × SE_pred.',
  ],

  glossary: [
    { term: 'Point prediction', def: 'The value of a fitted regression at a new x, ŷ₀ = b₀ + b₁x₀: the estimate of the mean response there and the best single guess for one new case.' },
    { term: 'Confidence interval for the mean response', def: 'An interval for the average of y over all cases with a given x, ŷ₀ ± t* × s√(1/n + (x₀ − x̄)²/Sxx) in simple regression. It narrows towards zero width as the sample grows.' },
    { term: 'Prediction interval', def: 'An interval for the value of y in one new case at a given x, ŷ₀ ± t* × s√(1 + 1/n + (x₀ − x̄)²/Sxx) in simple regression. Always wider than the interval for the mean, because it adds the new case’s own error.' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, lesson 4.11, “Prediction Interval for a New Response”.', url: 'https://online.stat.psu.edu/stat462/node/127', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.6, “Predicting with a Regression Equation”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/13-6-predicting-with-a-regression-equation', checked: '2026-11-01' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.5, “Prediction”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-5-prediction', checked: '2026-11-01' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 4.1.4.1, “Linear Least Squares Regression”.', url: 'https://itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm', checked: '2026-11-01' },
    { text: 'Microsoft Support. “FORECAST and FORECAST.LINEAR functions”.', url: 'https://support.microsoft.com/en-us/excel/forecast-and-forecast-linear-functions', checked: '2026-11-01' },
  ],

  checks: [
    { what: 'Weekend days', value: n, shown: 49 },
    { what: 'Intercept', value: b0, shown: 26.10 },
    { what: 'Slope', value: b1, shown: 1.005, tol: 0.0005 },
    { what: 'ŷ at 80', value: p80.yhat, shown: 106.5, tol: 0.05 },
    { what: 'ŷ at 80 by hand', value: 26.10 + 1.005 * 80, shown: 106.5, tol: 0.05 },
    { what: 'CI at 80 low', value: p80.ciLow, shown: 100.5, tol: 0.05 },
    { what: 'CI at 80 high', value: p80.ciHigh, shown: 112.5, tol: 0.05 },
    { what: 'PI at 80 low', value: p80.piLow, shown: 75.3, tol: 0.05 },
    { what: 'PI at 80 high', value: p80.piHigh, shown: 137.8, tol: 0.05 },
    { what: 'About 75 to 138', value: p80.piLow, shown: 75, tol: 0.5 },
    { what: 'About 138', value: p80.piHigh, shown: 138, tol: 0.5 },
    { what: 's', value: s, shown: 15.24 },
    { what: 'Mean high', value: xbar, shown: 64.35 },
    { what: 'Mean high (1 dp)', value: xbar, shown: 64.3, tol: 0.05 },
    { what: 'Mean high (whole)', value: xbar, shown: 64, tol: 0.5 },
    { what: 'Sxx', value: Sxx, shown: 13529, tol: 0.5 },
    { what: 'SE mean at 80', value: p80.seMean, shown: 2.99 },
    { what: 'SE mean by formula', value: s * Math.sqrt(1 / n + (80 - xbar) ** 2 / Sxx), shown: p80.seMean, tol: 1e-9 },
    { what: '1/49', value: 1 / 49, shown: 0.0204, tol: 0.00005 },
    { what: 'Distance term at 80', value: (80 - xbar) ** 2 / Sxx, shown: 0.0181, tol: 0.00005 },
    { what: 'SE pred at 80', value: p80.sePred, shown: 15.53 },
    { what: 'SE pred by formula', value: s * Math.sqrt(1 + 1 / n + (80 - xbar) ** 2 / Sxx), shown: p80.sePred, tol: 1e-9 },
    { what: 't*', value: tq, shown: 2.012, tol: 0.0005 },
    { what: 'Line known within about 3', value: p80.seMean, shown: 3, tol: 0.05 },
    { what: 'A day scatters by about 15', value: s, shown: 15, tol: 0.5 },
    { what: 'Five times as wide', value: p80.sePred / p80.seMean, shown: 5, tol: 0.25 },
    // the figure
    { what: 'Figure: lowest transactions', value: Math.min(...wy), shown: 34 },
    { what: 'Figure: highest transactions', value: Math.max(...wy), shown: 141 },
    { what: 'Figure: line at 33', value: p33.yhat, shown: 59, tol: 0.5 },
    { what: 'Figure: line at 94', value: p94.yhat, shown: 121, tol: 0.5 },
    { what: 'Figure: band about 9 either side at 33', value: p33.yhat - p33.ciLow, shown: 9, tol: 0.5 },
    { what: 'Figure: band about 9 either side at 94', value: p94.yhat - p94.ciLow, shown: 9, tol: 0.5 },
    { what: 'Figure: PI about 31 either side at x̄', value: pBar.yhat - pBar.piLow, shown: 31, tol: 0.5 },
    { what: 'Figure: points outside the PI', value: n - insidePI, shown: 2 },
    { what: 'Figure fits the axes', value: Number(Math.min(...wy, p33.piLow) > 20 && Math.max(...wy, p94.piHigh) < 170 && Math.min(...wx) > 30 && Math.max(...wx) < 100), shown: 1 },
    { what: 'Legend area is empty: no point or PI line above 112 below 60°F', value: Number(wx.every((x, i) => x >= 60 || wy[i] < 112) && P(60).piHigh < 120), shown: 1 },
    // why widen
    { what: 'SE mean at x̄', value: pBar.seMean, shown: 2.18 },
    { what: 's/√n', value: s / Math.sqrt(n), shown: 2.18 },
    { what: '√49', value: Math.sqrt(49), shown: 7 },
    { what: 'SE mean at 94', value: p94.seMean, shown: 4.45 },
    { what: 'Warmest day', value: Math.max(...wx), shown: 94 },
    { what: 'Coldest day', value: Math.min(...wx), shown: 33 },
    { what: 'Mean interval more than doubles to 94', value: Number(p94.seMean / pBar.seMean > 2), shown: 1 },
    { what: 'R²', value: FW.r2, shown: 0.56 },
    // floor
    { what: 'Rain model s', value: FWrain.sigma, shown: 12.91 },
    { what: '±1.96 × 15', value: 1.96 * 15, shown: 29.4, tol: 0.05 },
    // extrapolation
    { what: 'ŷ at 100', value: p100.yhat, shown: 126.6, tol: 0.05 },
    { what: 'PI at 100 low', value: p100.piLow, shown: 94.2, tol: 0.05 },
    { what: 'PI at 100 high', value: p100.piHigh, shown: 159.0, tol: 0.05 },
    { what: 'March weekend days', value: MAR.length, shown: 8 },
    { what: 'Every March day overpredicted', value: Number(marRes.every((e) => e < 0)), shown: 1 },
    { what: 'Mean March overprediction', value: -mean(marRes), shown: 16, tol: 0.5 },
    { what: 'March highs inside the range', value: Number(MAR.every((r) => r[at('high_f')] >= 33 && r[at('high_f')] <= 94)), shown: 1 },
    // assumptions
    { what: 'Residual SD on warm days', value: sdWarm, shown: 15.8, tol: 0.05 },
    { what: 'Residual SD on cool days', value: sdCool, shown: 13.2, tol: 0.05 },
    { what: 'Breusch–Pagan can’t distinguish it', value: Number(R.breuschPagan([wx], FW.resid).p > 0.1), shown: 1 },
    { what: 'Points outside PI', value: n - insidePI, shown: 2 },
    { what: 'Outside as %', value: (n - insidePI) / n * 100, shown: 4, tol: 0.5 },
    // one-sided
    { what: 't 0.90', value: t90, shown: 1.300, tol: 0.0005 },
    { what: 'Upper bound', value: upper90, shown: 126.7, tol: 0.05 },
    // kiosk
    { what: 'Kiosk ŷ at 80 (unrounded)', value: k80.yhat, shown: 171.95, tol: 0.005 },
    { what: 'Kiosk ŷ at 80 (rounded coefficients)', value: -65.70 + 2.971 * 80, shown: 171.98, tol: 0.005 },
    { what: 'Kiosk about 172', value: k80.yhat, shown: 172, tol: 0.5 },
    { what: 'Kiosk 36/510', value: 36 / 510, shown: 0.0706, tol: 0.00005 },
    { what: 'Kiosk 1/8', value: 1 / 8, shown: 0.125 },
    { what: 'Kiosk sum', value: 1 / 8 + 36 / 510, shown: 0.1956, tol: 0.00005 },
    { what: 'Kiosk SE mean', value: k80.seMean, shown: 2.124, tol: 0.0005 },
    { what: 'Kiosk SE pred', value: k80.sePred, shown: 5.252, tol: 0.0005 },
    { what: 'Kiosk t*', value: tq6, shown: 2.447, tol: 0.0005 },
    { what: 'Kiosk CI low', value: k80.ciLow, shown: 166.8, tol: 0.05 },
    { what: 'Kiosk CI high', value: k80.ciHigh, shown: 177.1, tol: 0.05 },
    { what: 'Kiosk PI low', value: k80.piLow, shown: 159.1, tol: 0.05 },
    { what: 'Kiosk PI high', value: k80.piHigh, shown: 184.8, tol: 0.05 },
    { what: 'Kiosk about 185', value: k80.piHigh, shown: 185, tol: 0.5 },
    { what: 'Kiosk mean high', value: mean(KX), shown: 74 },
    { what: 'Kiosk s', value: FK.sigma, shown: 4.803, tol: 0.0005 },
    { what: 'Kiosk intercept', value: FK.beta[0], shown: -65.70 },
    { what: 'Kiosk slope', value: FK.beta[1], shown: 2.971, tol: 0.0005 },
    // challenging
    { what: 'ŷ at x̄', value: pBar.yhat, shown: 90.8, tol: 0.05 },
    { what: 'SE pred at x̄', value: pBar.sePred, shown: 15.39 },
    { what: 'CI at x̄ low', value: pBar.ciLow, shown: 86.4, tol: 0.05 },
    { what: 'CI at x̄ high', value: pBar.ciHigh, shown: 95.2, tol: 0.05 },
    { what: 'PI at x̄ low', value: pBar.piLow, shown: 59.8, tol: 0.05 },
    { what: 'PI at x̄ high', value: pBar.piHigh, shown: 121.7, tol: 0.06 },
    { what: 'CI half at x̄', value: pBar.yhat - pBar.ciLow, shown: 4.4, tol: 0.05 },
    { what: 'PI half at x̄', value: pBar.yhat - pBar.piLow, shown: 31.0, tol: 0.05 },
    { what: 'Distance term at 94', value: (94 - xbar) ** 2 / Sxx, shown: 0.065, tol: 0.0005 },
    { what: 'SE pred at 94', value: p94.sePred, shown: 15.88 },
    { what: 'ŷ at 94', value: p94.yhat, shown: 120.6, tol: 0.05 },
    { what: 'CI at 94 low', value: p94.ciLow, shown: 111.6, tol: 0.05 },
    { what: 'CI at 94 high', value: p94.ciHigh, shown: 129.5, tol: 0.05 },
    { what: 'PI at 94 low', value: p94.piLow, shown: 88.6, tol: 0.05 },
    { what: 'PI at 94 high', value: p94.piHigh, shown: 152.5, tol: 0.05 },
    { what: 'Mean interval doubled at 94', value: p94.seMean / pBar.seMean, shown: 2, tol: 0.1 },
    { what: 'PI widened about 3%', value: (p94.sePred / pBar.sePred - 1) * 100, shown: 3, tol: 0.5 },
    { what: 'ŷ at 50', value: P(50).yhat, shown: 76.4, tol: 0.05 },
    // applied
    { what: 'Warm weekend days (≥ 78°F)', value: warmDays.length, shown: 14 },
    { what: 'Warm days fewest barista hours', value: Math.min(...warmStaff), shown: 6.5 },
    { what: 'Warm days most barista hours', value: Math.max(...warmStaff), shown: 7.5 },
    { what: 'Peak at mean', value: 0.55 * p80.yhat, shown: 58.6, tol: 0.05 },
    { what: 'Hours at mean', value: hours(p80.yhat), shown: 8.4, tol: 0.05 },
    { what: 'Hours at PI upper', value: hours(p80.piHigh), shown: 10.8, tol: 0.05 },
    { what: 'Hours at one-sided bound', value: hours(upper90), shown: 10.0, tol: 0.05 },
    { what: 'Load at 6.5 hours', value: 0.55 * p80.yhat / 6.5, shown: 9, tol: 0.05 },
    { what: 'Load at 7.5 hours', value: 0.55 * p80.yhat / 7.5, shown: 8, tol: 0.2 },
    { what: '2.5 baristas across four hours', value: 10 / 4, shown: 2.5 },
    { what: 'Brambleby (ex g3): s ÷ √Sxx = 21 ÷ √26.2 matches inference-for-coefficients g2’s SE of 4.1', value: 21 / Math.sqrt(26.2), shown: 4.1, tol: 0.005 },
    { what: 'Rostering to ŷ in half-hour steps', value: Math.ceil(hours(p80.yhat) * 2) / 2, shown: 8.5 },
    { what: 'Rain model one-sided 90% bound, dry 80°F', value: rainBound, shown: 127.5, tol: 0.05 },
    { what: 'Dry days exceed this lesson’s 90% bound', value: dryExceed * 100, shown: 9.7, tol: 0.05 },
    { what: 'Dry days’ mean residual about +4', value: dryMeanRes, shown: 4, tol: 0.5 },
    { what: 'Rain model s', value: FWrain.sigma, shown: 12.91 },
    { what: 'Rostering to the CI top under-staffs about a third', value: pAboveCI, shown: 0.35, tol: 0.005 },
    { what: 'A dry 80°F day sits above the line (model with rain)', value: Number(FWrain.beta[0] + FWrain.beta[1] * 80 > p80.yhat), shown: 1 },
    { what: 'Forecast 5°F out: about 5 transactions', value: 5 * b1, shown: 5, tol: 0.1 },
    { what: 'Interval ±31 at 80', value: p80.yhat - p80.piLow, shown: 31, tol: 0.5 },
    { what: '8.5 hours near even odds: bound at 8.5 h is within 0.15 SE of ŷ', value: Math.abs((8.5 * 7 / 0.55 - p80.yhat) / p80.sePred), shown: 0.1, tol: 0.1 },
  ],
};
