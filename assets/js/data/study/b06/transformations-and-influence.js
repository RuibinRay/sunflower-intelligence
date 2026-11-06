// transformations-and-influence.js — B06 · Transformations and influence. Content only; exercises are in
// transformations-and-influence.ex.js. Uses the café log (case.js): Harbourside's footfall in logs (the funnel of
// assumptions-and-diagnostics removed, coefficients as percentage changes, the opening build-up as a hinge in the day
// count), the peak wait against the load (a squared hinge at 7), and the footfall slip in the raw log and the festival
// days for leverage, studentized residuals and Cook's distance. Every figure printed is recomputed in `checks`.
import { column, SLIP } from './case.js?v=28';
import * as R from '../../../core/regression.js?v=28';
import { mean, sd } from '../../../core/stats.js?v=28';

const H = { cafe: 'Harbourside' };
const coef = (f, name) => f.coefs.find((c) => c.name === name);
const pct = (b) => (Math.exp(b) - 1) * 100;

// ---------------------------------------------------------------- Harbourside in levels and in logs
const day = column('day', H), hDate = column('date', H), hMonth = column('month', H), fest = column('festival01', H);
const BU = column('build_up', H);
const hiH = column('high_f', H), loT = Math.min(...hiH), hiT = Math.max(...hiH);
const plantedPct = (t) => (0.011 / (1 + 0.011 * (t - 60))) * 100;
const base = { 'High (°F)': column('high_f', H), 'Rain (in)': column('rain_in', H), Weekend: column('weekend', H), Festival: fest };
const yL = column('footfall', H), yG = column('log_footfall', H);
const LOGD = R.fit(yG, { ...base, Day: day });
const LOG = R.fit(yG, { ...base, 'Build-up': BU }), LEVB = R.fit(yL, { ...base, 'Build-up': BU });
const bp = (f) => R.breuschPagan(f.cols, f.resid);
const monthMean = (f, m) => mean(Array.from(f.resid).filter((_, i) => hMonth[i] === m));
const smear = mean(Array.from(LOG.resid).map(Math.exp));
// predictions (build-up complete, dry, no festival)
const satP = LOG.predict([75, 0, 1, 0, 1]), tueP = LOG.predict([45, 0, 0, 0, 1]);
const satL = LEVB.predict([75, 0, 1, 0, 1]), tueL = LEVB.predict([45, 0, 0, 0, 1]);
// festival days with and without a dummy
const keep = (a) => a.filter((_, i) => !fest[i]);
const noDummyX = { 'High (°F)': base['High (°F)'], 'Rain (in)': base['Rain (in)'], Weekend: base.Weekend, 'Build-up': BU };
const NOD = R.fit(yG, noDummyX), nodInf = R.influence(NOD.cols, yG);
const DROP = R.fit(keep(yG), Object.fromEntries(Object.entries(noDummyX).map(([k, v]) => [k, keep(v)])));
const festIdx = fest.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
const festExt = festIdx.map((i) => nodInf.external[i]), festCook = festIdx.map((i) => nodInf.cooks[i]), festHat = festIdx.map((i) => nodInf.hat[i]);

// ---------------------------------------------------------------- the peak wait against the load
const LOAD = column('peak_load'), WAIT = column('peak_wait_min');
const hinge = (c, q) => LOAD.map((v) => Math.max(0, v - c) ** q);
const WL = R.fit(WAIT, { Load: LOAD }), WQ = R.fit(WAIT, { Load: LOAD, 'Load²': LOAD.map((v) => v * v) });
const WH = R.fit(WAIT, { Load: LOAD, Hinge: hinge(7, 1) }), WS = R.fit(WAIT, { Load: LOAD, 'Hinge²': hinge(7, 2) });
const scan = [5, 6, 6.5, 7, 7.5, 8, 9].map((c) => [c, R.fit(WAIT, { Load: LOAD, H: hinge(c, 2) }).r2]);
const quadMin = -WQ.beta[1] / (2 * WQ.beta[2]);
const lowLoad = WAIT.filter((_, i) => LOAD[i] < 4);

// ---------------------------------------------------------------- the slip: footfall and transactions, both cafés
const FR = column('footfall', { raw: true }), FC = column('footfall'), TR = column('transactions');
const DATE = column('date'), CAFE = column('cafe');
const SI = DATE.findIndex((d, i) => d === SLIP.date && CAFE[i] === SLIP.cafe);
const RAW = R.fit(TR, { Footfall: FR }), CLEAN = R.fit(TR, { Footfall: FC });
const rawInf = R.influence([FR], TR), cleanInf = R.influence([FC], TR);
const n = FR.length, xbar = mean(FR), Sxx = (n - 1) * sd(FR) ** 2;
const cleanTop = cleanInf.cooks.indexOf(Math.max(...cleanInf.cooks));
const conv = (cafe) => mean(TR.filter((_, i) => CAFE[i] === cafe).map((t, k) => t / FC.filter((_, j) => CAFE[j] === cafe)[k]));

// ---------------------------------------------------------------- figure: four fits of the wait on the load
const f1 = (x) => Math.round(x * 10) / 10;
function waitFigure() {
  const W0 = 440, x0 = 58, x1 = 425, y0 = 300, y1 = 30, lx = [0, 15], ly = [0, 16];
  const X = (v) => x0 + (v - lx[0]) / (lx[1] - lx[0]) * (x1 - x0), Y = (v) => y0 - (v - ly[0]) / (ly[1] - ly[0]) * (y0 - y1);
  let svg = `<svg viewBox="0 0 ${W0} 405" xmlns="http://www.w3.org/2000/svg" font-size="16" fill="currentColor">`;
  svg += `<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" stroke="var(--ink-3)"/><line x1="${x0}" x2="${x0}" y1="${y1}" y2="${y0}" stroke="var(--ink-3)"/>`;
  [0, 5, 10, 15].forEach((v) => { svg += `<text x="${f1(X(v))}" y="${y0 + 20}" text-anchor="middle" font-size="15" fill="var(--ink-3)">${v}</text>`; });
  [0, 5, 10, 15].forEach((v) => { svg += `<text x="${x0 - 8}" y="${f1(Y(v)) + 5}" text-anchor="end" font-size="15" fill="var(--ink-3)">${v}</text>`; });
  svg += `<text x="${(x0 + x1) / 2}" y="${y0 + 42}" text-anchor="middle" font-size="15">Load (peak transactions per barista hour)</text>`;
  svg += `<text x="16" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="15" transform="rotate(-90 16 ${(y0 + y1) / 2})">Peak wait (min)</text>`;
  LOAD.forEach((v, i) => { if (i % 3 === 0) svg += `<circle cx="${f1(X(v))}" cy="${f1(Y(Math.min(WAIT[i], 16)))}" r="2.2" fill="var(--ink-3)" opacity="0.55"/>`; });
  // draw only where the curve is inside the plot (the straight line starts where it crosses 0, at a load of about 4.6)
  const path = (f, dash, colour) => { let d = ''; for (let v = 1.5; v <= 14.75; v += 0.05) { const w = f(v); if (w < ly[0] || w > ly[1]) continue; d += `${d ? 'L' : 'M'}${f1(X(v))},${f1(Y(w))}`; } return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="2.6"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`; };
  svg += path((v) => WL.beta[0] + WL.beta[1] * v, '7 5', 'var(--series-2)');
  svg += path((v) => WQ.beta[0] + WQ.beta[1] * v + WQ.beta[2] * v * v, '2 4', 'var(--series-3)');
  svg += path((v) => WS.beta[0] + WS.beta[1] * v + WS.beta[2] * Math.max(0, v - 7) ** 2, '', 'var(--series-1)');
  // legend below the plot
  const leg = [['7 5', 'var(--series-2)', 'straight line', 30, 366], ['2 4', 'var(--series-3)', 'quadratic', 230, 366], ['', 'var(--series-1)', 'squared hinge at 7', 30, 392]];
  leg.forEach(([dash, c, t, lx0, ly0]) => { svg += `<line x1="${lx0}" x2="${lx0 + 30}" y1="${ly0 - 5}" y2="${ly0 - 5}" stroke="${c}" stroke-width="2.6"${dash ? ` stroke-dasharray="${dash}"` : ''}/><text x="${lx0 + 36}" y="${ly0}" font-size="15">${t}</text>`; });
  return `${svg}</svg>`;
}

export default {
  slug: 'transformations-and-influence',
  title: 'Transformations and influence',
  blurb: 'When the diagnostics fail, change the model, not the data. Fit footfall in logs and read its slopes as percentages, bend a line with polynomial and hinge terms, and find the few rows that move a regression, then decide what to do with them honestly.',
  status: 'reviewed',
  objectives: [
    'Transform y with a natural log, interpret the coefficients as percentage changes (approximately 100b, exactly 100(eᵇ − 1)) and back-transform a prediction and its interval.',
    'Use polynomial and hinge terms to follow a curve or a threshold, and choose between them with residual plots and fit statistics.',
    'Calculate leverage, studentized residuals and Cook’s distance, and use them to tell outliers, high-leverage points and influential points apart.',
    'Handle errors and genuine extremes correctly: check the source, correct, report with and without, and never delete a point because it spoils a result.',
  ],
  prerequisites: [
    { lesson: 'b06/assumptions-and-diagnostics', why: 'The residual plots and tests that show when a model needs changing, the build-up term, and the funnel this lesson repairs.' },
    { lesson: 'b06/categorical-predictors-and-interactions', why: 'Dummy variables, used here for the festival days.' },
    { lesson: 'b05/nonlinear-and-restricted', why: 'The threshold in the peak wait and the hinge transformation, met there as correlations.' },
    { lesson: 'b05/outliers-and-influence', why: 'The footfall slip and the festival days, and leave-one-out influence on a correlation.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'The diagnostics left Ana with three problems. Harbourside’s footfall model has a funnel: busy days vary by more people than quiet days, so a single prediction interval is wrong for both. The peak wait doesn’t rise in a straight line with the load on the baristas. And her raw log still contains the slip she found in B05, Millbrook’s 14 September footfall typed as 2,566 instead of 256, along with five festival days that are real but extreme. Each calls for a different response.' },

    { h: 'Logs: when effects are percentages' },
    { p: 'Footfall grows by percentages. A weekend adds a share of an ordinary day’s trade, not a fixed number of people, and the same is true of a warm day or a festival. When effects multiply like this, a model of footfall itself fits a straight-line sum to a product, and the residuals fan out as the level rises. Taking the natural <g>log transformation</g> of y turns products into sums: if footfall = base × weekend effect × weather effect, then ln(footfall) = ln(base) + ln(weekend effect) + ln(weather effect), which is exactly the form a regression fits.' },
    { p: 'Ana refits Harbourside’s model with ln(footfall) as y and the same predictors as the last lesson’s final model (the high, rain, weekend, festival and the opening build-up, 0 on 1 March rising to 1 on 29 June). The funnel goes: Breusch–Pagan falls from LM = 67.8 in levels to 5.4 in logs, a p-value of 0.37. The time order stays clean too: the residuals’ monthly averages all lie within ±0.017 and Durbin–Watson is 1.97. The build-up term matters here as much as in levels. With a straight-line day count in its place, the log model’s residuals average −0.052 in March, +0.036 in June and −0.027 in December: an arch, because a straight line assumes the build-up never stopped.' },

    { h: 'Reading a log model’s coefficients' },
    { p: String.raw`In a model for <m>\ln y</m>, a slope b is the change in ln y for a one-unit change in x, holding the other predictors fixed. Since a change of b in a log multiplies y by <m>e^b</m>, the slope means a change of <m>100(e^b - 1)</m>%. For small b this is close to 100b%: the slope for the day’s high, 0.0109, means about 1.1% more people per °F warmer, on average over the year’s range of temperatures, holding rain, the weekend, festivals and the build-up fixed. For larger b the shortcut fails. The weekend coefficient, 0.469, does not mean 47% more people: <m>e^{0.469} - 1 = 0.598</m>, so weekend days have about 60% more footfall than weekdays with the same weather. The festival coefficient, 0.891, means <m>e^{0.891} = 2.44</m> times an ordinary weekend day’s footfall.` },
    { p: 'These are the numbers the café’s fictional log was built from, recovered: footfall at Harbourside was generated with 1.1% more per °F near 60°F (not exactly a constant percentage: the planted rise is about 1.7% per °F on the log’s coldest day, 28°F, and 0.8% on its hottest, 94°F, so 1.1% is an average), a weekend base 61% above the weekday one, festival days at 2.3 times normal (inside the coefficient’s 95% interval, 2.23 to 2.66) and a build-up from 72% to full trade over four months. The levels model could not express any of these as single numbers, because in levels the weekend adds more people on a warm day than on a cold one.' },

    { h: 'Bending a line: polynomial and hinge terms' },
    { p: 'The peak wait rises with the load, the peak transactions per barista hour, but not in a straight line. B05 found the shape: waits barely change up to a load of about 7 and climb ever faster beyond it. A regression can follow a curve by adding a transformed copy of x as another predictor. A <g>polynomial regression</g> adds x², and perhaps x³. A <g>hinge transformation</g> adds max(0, x − 7), which is zero up to the threshold and rises after it; squaring it, max(0, x − 7)², lets the rise steepen.' },
    { figure: {
      svg: waitFigure(),
      caption: 'Peak wait against the load, every third café-day, with three fitted curves. The straight line misses the flat start and the steep end; the quadratic bends the wrong way at low loads; the squared hinge at 7 follows the data.',
      alt: 'A scatterplot of peak wait in minutes (0 to 16) against the load (0 to 15). The points form a flat band near 1.5 minutes for loads up to about 7, then rise ever more steeply, reaching about 10 to 14 minutes at loads of 13 to 15. Three curves: a dashed straight line starting at zero near a load of 4.6 and rising to about 8 minutes at 15, below the points at low and high loads and above them in the middle; a dotted quadratic that dips to a minimum near a load of 6 and rises at both ends, so it is too high at low loads; and a solid squared-hinge curve that stays flat near 1.6 minutes up to 7 and then curves upward through the points.',
    } },
    { p: 'Across 612 café-days the straight line accounts for 68.9% of the variation in waits, the quadratic 94.3% and the squared hinge 96.1%. The squared hinge’s coefficient, 0.226 minutes per squared transaction above 7, is close to the 0.22 the fictional data were built with. At a load of 10 the model predicts a wait of 3.7 minutes, at 12 a wait of 7.3. The quadratic’s good R² hides a fault the figure shows: a parabola must turn somewhere, and this one has its minimum at a load of 6.0, so it predicts that waits rise again as the load falls, 4.0 minutes at a load of 2, where the 11 days with a load below 4 averaged 1.8.' },

    { h: 'Influence: the rows that move a regression' },
    { p: 'In B05 one mistyped footfall cut the correlation between footfall and transactions from 0.981 to 0.679. In a regression the same day does more visible damage. With the slip, the least-squares slope of transactions on footfall across all 612 café-days is 0.260 transactions per person through the door; corrected, it is 0.560. One row among 612 more than halved the slope.' },
    { p: 'Three numbers say why. The slip’s footfall, 2,566, lies so far from the mean that its <g>leverage (in regression)</g> is 0.551: more than half of its own fitted value is set by its own y. Its residual from the line fitted with it is −583.5 transactions, and its <g>studentized residual</g>, the residual divided by the standard deviation it should have, is −23.8 (−91.2 when the standard deviation is estimated without it). <g>Cook’s distance</g>, which combines the two into the change in all the fitted values when the row is left out, is 349; the conventional point at which to worry is 1. A point that is far out in x and far from the line is influential; a point that is only one of those may not be.' },
  ],

  theory: [
    { h: 'The log transformation in detail' },
    { p: String.raw`Logs need y > 0; for counts that can be zero, B02’s <m>\ln(1 + y)</m> is a common workaround, though its coefficients no longer read as percentages. Logging y changes three things at once: the form (effects multiply), the spread (errors proportional to the level become constant in logs) and the shape of the errors (a right skew in y often becomes symmetric in ln y). Check all three after the change; here the residual standard deviation in logs, 0.098, means a typical day is within about 10% of its predicted footfall, busy or quiet.` },
    { p: String.raw`Logs can go on x instead, or on both. With <m>\ln x</m> as the predictor, a 1% rise in x goes with a change of about b/100 in y. With logs on both sides, b is an elasticity: a 1% rise in x goes with about b% change in y. Choose the scale from how the effect works (fixed amounts or percentages) and from the residual plots, not from which version has the larger R².` },
    { callout: 'warn', title: 'Don’t compare R² across a change of y', html: 'The levels model has R² = 0.944 and the log model 0.939. They measure different things: the share of the variation in footfall, and in ln(footfall). Compare models with different y by their residual plots, or by their errors on a common scale (back-transform the log model’s predictions and compare errors in people).' },

    { h: 'Back-transforming a prediction' },
    { p: String.raw`A log model predicts <m>\widehat{\ln y}</m>. Exponentiating gives <m>e^{\widehat{\ln y}}</m>, which estimates the <i>median</i> footfall for that day, not the mean, because the exponential stretches the upper half of the errors more than the lower. To estimate the mean, multiply by a correction: Duan’s smearing factor, the average of <m>e^{e_i}</m> over the log model’s residuals, or <m>e^{s^2/2}</m> if the errors are normal. For Harbourside both are 1.005, a 0.5% correction, small because s is small; with s = 0.5 it would be 13%.` },
    { p: 'Prediction intervals back-transform directly: exponentiate the two limits. The result is not symmetric about the prediction, and it widens with the level, which is the point. For a dry 75°F Saturday after the build-up the log model predicts a median of 227 people, with a 95% prediction interval from 187 to 276. For a dry 45°F Tuesday it predicts 103, from 85 to 124. The levels model gives each day the same ±33 people, too narrow for the Saturday and too wide for the Tuesday.' },

    { h: 'Polynomial and hinge terms' },
    { table: {
      caption: 'Four models for the peak wait (612 café-days)',
      head: ['Model', 'Terms besides the load', 'R²', 's (min)', 'AIC'],
      rows: [
        ['Straight line', 'none', '0.689', '1.11', '1,867'],
        ['Quadratic', 'load²', '0.943', '0.48', '835'],
        ['Hinge at 7', 'max(0, load − 7)', '0.857', '0.75', '1,395'],
        ['Squared hinge at 7', 'max(0, load − 7)²', '0.961', '0.39', '596'],
      ],
      align: ['l', 'l', 'r', 'r', 'r'],
      note: 'Lower AIC is better for models of the same y on the same rows. All four have three or fewer coefficients.',
    } },
    { p: 'A polynomial is quick to try, but its shape is global: a squared term bends the whole curve, including where the data are flat, and higher powers swing wildly at the ends of the data. A hinge is local: it leaves the line alone below the threshold and changes it only above. The price is choosing the threshold. Ana’s came from B05’s bands, chosen before this fit; trying thresholds from 5 to 9 gives R² from 0.930 to 0.961, highest at 7, so the data agree. Choosing a threshold by searching many values and picking the best fit overstates how well the model will do on new data; if you search, say so, and check on data not used to choose it.' },
    { p: String.raw`Interpret transformed terms through predictions, not single coefficients. In the squared-hinge model the effect of one more transaction per barista hour depends on where you start: below 7 it is the load slope, −0.005 minutes (indistinguishable from zero); at a load of 10 it is <m>-0.005 + 2 \times 0.226 \times 3 = 1.35</m> minutes. The squared term on its own is not “the effect of load”.` },

    { h: 'Leverage' },
    { p: String.raw`Leverage measures how far a row’s predictor values are from the centre of all the rows’. With one predictor, <m>h_i = 1/n + (x_i - \bar x)^2 / \sum (x - \bar x)^2</m>. Leverages lie between 1/n and 1 and average p/n, where p counts the coefficients; a common rule of thumb flags rows above 2p/n (here 2 × 2 ÷ 612 = 0.0065). For the slip, <m>h = 1/612 + (2566 - 186.8)^2 / 10{,}305{,}017 = 0.551</m>, 84 times the flag. With several predictors leverage comes from the hat matrix, but the idea is the same: an unusual combination of x values, such as a festival day on a weekend with heavy rain, can have high leverage even if no single value is extreme.` },

    { h: 'Studentized residuals' },
    { p: String.raw`Residuals of high-leverage rows are small by construction, because the line is pulled towards them. Dividing by the standard deviation each residual should have puts them on one scale: the internally studentized residual is <m>r_i = e_i / (s\sqrt{1 - h_i})</m>. The externally studentized (deleted) version, <m>t_i</m>, uses s from the fit without row i, so a large error can’t hide by inflating s; it follows a t distribution on n − p − 1 df if the model is right. Penn State’s regression notes call a row with an externally studentized residual beyond ±3 an outlier; ±2 is a common, looser convention for a first look, especially in small samples. Treat both as warning flags, not rules.` },

    { h: 'Cook’s distance' },
    { p: String.raw`Cook’s distance asks how much all the fitted values would move if row i were left out, scaled by the model’s precision: <m>D_i = \dfrac{r_i^2}{p} \cdot \dfrac{h_i}{1 - h_i}</m>. It is large only when both the residual and the leverage are. Rules of thumb vary: Penn State’s notes suggest a closer look above 0.5 and call values above 1 quite likely influential; others use 4/n. The most useful check is visual, a value that stands far apart from the rest.` },
    { p: 'The festival days show why both parts matter. In a log model of Harbourside’s footfall without a festival term, the five festival days have studentized residuals from 5.0 to 7.4, extreme outliers. But they are ordinary weekend days in their predictor values, with leverages from 0.015 to 0.024, and their Cook’s distances are 0.08 to 0.20: above the 4/n line (0.013), far below 0.5. They still matter: all five fell on weekends, and leaving them in without a term raises the weekend coefficient from 0.469 to 0.521 (60% to 68% more people). Once corrected, the most influential rows in the footfall-and-transactions regression are the same festival days (29 May has the largest Cook’s distance, 0.56): their footfall is high, and they sit below the pooled line because Harbourside converts about 47% of visitors where Millbrook converts 55%, a sign that the pooled model needs a café term.' },

    { h: 'What to do with an unusual point' },
    { ol: [
      '<b>Check it against the source.</b> The door counter’s export showed 256 for 14 September: an error. Correct it, and record the change.',
      '<b>If it is real, ask whether the model is missing something.</b> The festival days are real and different. A festival dummy gives them their own coefficient; the other coefficients are then almost exactly those from leaving the five days out (weekend 0.4691 either way), and the model still describes them.',
      '<b>Report with and without.</b> When a real point moves a conclusion and no term explains it, show both fits and say which conclusions depend on it.',
      '<b>Never delete a point because it spoils the result,</b> and don’t delete automatically by a cut-off. Rules such as |t| > 3 or D > 1 tell you where to look, not what to remove.',
    ] },
    { callout: 'key', title: 'Influence is not error', html: 'A point can be influential and correct (a festival day), or an error with little influence (a mistyped footfall near the middle of the data). Diagnostics find the points that matter; only the source can say whether they are right.' },
  ],

  formulas: [
    { id: 'b06-log-pct', name: 'Percentage change from a coefficient in a model for ln y',
      tex: String.raw`\%\Delta y = 100\,(e^{b} - 1) \approx 100\,b \quad \text{(small } b\text{)}`,
      where: [[String.raw`b`, 'The slope for x in the model for ln y, holding the other predictors fixed', 'per unit of x'], [String.raw`\%\Delta y`, 'Percentage change in y for a one-unit rise in x', '%']],
      assumptions: 'The model for ln y is right; the change is in the median of y (and in the mean, if the error spread doesn’t change with x).',
      note: 'In Excel: <x>=EXP(b)-1</x>; for a change of d units, <x>=EXP(d*b)-1</x>. The shortcut 100b is within 0.5 percentage points while |b| ≤ 0.1.' },
    { id: 'b06-back-transform', name: 'Back-transforming a log prediction',
      tex: String.raw`\tilde y = e^{\widehat{\ln y}}, \qquad \hat{\bar y} = \tilde y \times \frac{1}{n}\sum_{i=1}^{n} e^{e_i}`,
      where: [[String.raw`\widehat{\ln y}`, 'The log model’s prediction', 'log units'], [String.raw`\tilde y`, 'Estimated median of y', 'units of y'], [String.raw`e_i`, 'The log model’s residuals', 'log units'], [String.raw`\hat{\bar y}`, 'Estimated mean of y (Duan’s smearing estimate)', 'units of y'], [String.raw`n`, 'Number of rows in the log model', '']],
      assumptions: 'The errors in logs have the same distribution for every row.',
      note: 'With normal errors the factor is about e^(s²/2). Prediction interval: exponentiate both limits.' },
    { id: 'b06-hinge-model', name: 'A squared hinge term',
      tex: String.raw`\hat y = b_0 + b_1 x + b_2 \max(0,\, x - c)^2`,
      where: [[String.raw`c`, 'The threshold, chosen before fitting (from earlier work or the business)', 'units of x'], [String.raw`b_1`, 'The slope below the threshold', 'units of y per unit of x'], [String.raw`b_2`, 'How fast the slope grows above the threshold', 'units of y per (unit of x)²'], [String.raw`x`, 'The predictor', 'units of x'], [String.raw`\hat y`, 'Fitted value', 'units of y']],
      note: 'The slope at x is b₁ + 2b₂ max(0, x − c). In Excel: <x>=MAX(0,B2-7)^2</x> as a new column.' },
    { id: 'b06-leverage', name: 'Leverage with one predictor',
      tex: String.raw`h_i = \dfrac{1}{n} + \dfrac{(x_i - \bar x)^2}{\sum_{j=1}^{n}(x_j - \bar x)^2}`,
      where: [[String.raw`h_i`, 'Row i’s leverage, between 1/n and 1', ''], [String.raw`x_i`, 'Row i’s predictor value', 'units of x'], [String.raw`\bar x`, 'Mean of the predictor', 'units of x'], [String.raw`n`, 'Number of rows', '']],
      note: 'Leverages average p/n; rows above 2p/n are often flagged. With several predictors, hᵢ is the i-th diagonal of the hat matrix X(X⊤X)⁻¹X⊤.' },
    { id: 'b06-studentized', name: 'Studentized residuals',
      tex: String.raw`r_i = \dfrac{e_i}{s\sqrt{1 - h_i}}, \qquad t_i = r_i\sqrt{\dfrac{n - p - 1}{n - p - r_i^2}}`,
      where: [[String.raw`e_i`, 'Row i’s residual', 'units of y'], [String.raw`s`, 'Residual standard error of the fit with every row', 'units of y'], [String.raw`h_i`, 'Row i’s leverage', ''], [String.raw`p`, 'Number of coefficients, counting the intercept', ''], [String.raw`r_i`, 'Internally studentized residual', ''], [String.raw`t_i`, 'Externally studentized residual, which uses s from the fit without row i', ''], [String.raw`n`, 'Number of rows', '']],
      note: 'tᵢ follows a t distribution on n − p − 1 df if the model is right.' },
    { id: 'b06-cooks-distance', name: 'Cook’s distance',
      tex: String.raw`D_i = \dfrac{r_i^2}{p}\cdot\dfrac{h_i}{1 - h_i}`,
      where: [[String.raw`r_i`, 'Internally studentized residual', ''], [String.raw`h_i`, 'Leverage', ''], [String.raw`p`, 'Number of coefficients, counting the intercept', ''], [String.raw`D_i`, 'How far all the fitted values move when row i is left out, in units of the model’s precision', '']],
      note: 'Look closer above 0.5; above 1 the row is quite likely influential. Some analysts flag values above 4/n.' },
  ],

  examples: [
    { level: 'simple', title: 'Reading the log model’s coefficients', fictional: true,
      setup: 'Harbourside’s model for ln(footfall) has slopes of 0.0109 for the day’s high (°F), −0.784 for rain (inches) and 0.469 for the weekend dummy. Turn each into a percentage change in footfall, holding the other predictors fixed: for one °F, for 0.1 inch of rain and for a weekend day.',
      steps: [
        String.raw`High: <m>e^{0.0109} - 1 = 0.0110</m>, about 1.1% more people per °F. The shortcut 100b gives 1.09%, near enough because b is small.`,
        String.raw`Rain, per 0.1 inch: multiply first, <m>0.1 \times (-0.784) = -0.0784</m>, then <m>e^{-0.0784} - 1 = -0.075</m>, about 7.5% fewer people. (Per whole inch, <m>e^{-0.784} - 1 = -0.543</m>, 54% fewer, where the shortcut would say 78%.)`,
        String.raw`Weekend: <m>e^{0.469} - 1 = 0.598</m>, about 60% more people than on a weekday with the same weather, not the 47% the shortcut gives.`,
      ],
      answer: 'About +1.1% per °F, −7.5% per 0.1 inch of rain, +60% on a weekend day, each holding the other predictors fixed.',
      interpretation: 'Because the effects are percentages, a 10°F warmer day adds about 12% (e^0.109 − 1) whether it is a Tuesday or a Saturday, though 12% of a Saturday is more people. That is the multiplicative pattern the funnel in the levels model was hinting at.' },

    { level: 'challenging', title: 'How much did one slip move the line?', fictional: true,
      setup: 'In the raw log, Millbrook’s 14 September footfall reads 2,566 (true value 256) with 130 transactions. Across the 612 café-days, raw footfall has mean 186.8 and Σ(x − x̄)² = 10,305,017. The raw regression of transactions on footfall has slope 0.260, intercept 46.4 and s = 36.5. Calculate the slip’s leverage, residual, internally studentized residual and Cook’s distance, and compare the slope after correction (0.560).',
      steps: [
        String.raw`Leverage: <m>h = 1/612 + (2566 - 186.8)^2 / 10{,}305{,}017 = 0.0016 + 5{,}660{,}593 / 10{,}305{,}017 = 0.551</m>. The flag is 2p/n = 4/612 = 0.0065.`,
        String.raw`Residual: the raw line predicts <m>46.4 + 0.260 \times 2566 = 713.5</m> transactions, so <m>e = 130 - 713.5 = -583.5</m>.`,
        String.raw`Internally studentized: <m>r = -583.5 / (36.5\sqrt{1 - 0.551}) = -583.5 / 24.5 = -23.8</m>.`,
        String.raw`Cook’s distance: <m>D = (23.8^2 / 2) \times 0.551 / 0.449 = 283.2 \times 1.227 = 347</m> (349 unrounded), against a threshold of 1.`,
        'Correct the value to 256 and refit: the slope becomes 0.560 and R² rises from 0.461 to 0.963. The corrected day has leverage 0.003 and a studentized residual of −0.61: an ordinary day.',
      ],
      answer: 'Leverage 0.551, residual −583.5, studentized residual −23.8, Cook’s distance about 349. Corrected, the slope is 0.560 transactions per visitor instead of 0.260.',
      interpretation: 'The slip was both far out in x and far from the line, so it dragged the line towards itself: the raw slope implies that only one visitor in four buys, when the café converts about half. One check of the source changes the answer; a regression run on the raw log would have been confidently wrong.' },

    { level: 'applied', title: 'Rostering Harbourside from the log model', fictional: true,
      setup: 'Ana rosters Harbourside’s peak so that waits stay short on all but the busiest days. She wants an upper figure for footfall that only about one dry day in forty should exceed (the top of a 95% prediction interval), for a 75°F Saturday and a 45°F Tuesday after the build-up. Compare the log model with the levels model with the same predictors.',
      steps: [
        'Log model: predicted ln(footfall) is 5.427 for the Saturday and 4.631 for the Tuesday. Exponentiated, the medians are 227 and 103 people.',
        'Prediction intervals in logs, exponentiated: Saturday 187 to 276, Tuesday 85 to 124. The upper limits are 21% above the median on both days: the width is a percentage.',
        'Levels model: the Saturday’s interval is 180 to 246 and the Tuesday’s 68 to 134, ±33 people on both.',
        'Which to trust: the levels model’s residuals fan out (Breusch–Pagan LM = 67.8 with these predictors); the log model’s don’t (5.4). Over the year, its constant width is too narrow on busy days and too wide on quiet ones.',
        'Upper figures for the roster: about 276 people for the Saturday, not 246; about 124 for the Tuesday, not 134.',
      ],
      answer: 'Roster for about 276 people on a warm Saturday and 124 on a cold Tuesday (log model), not the levels model’s 246 and 134.',
      interpretation: 'The log model shifts staff from quiet days to busy ones: about 30 more people to plan for on the Saturday and 10 fewer on the Tuesday. The medians, 227 and 103, are what a typical such day brings; for the stock order, which follows the average, multiply by the smearing factor (1.005), a difference of about one person.' },
  ],

  demo: [
    { widget: 'trans-logs', intro: 'Harbourside’s footfall model with its residual plots. With the log switch off, see the funnel (Breusch–Pagan about 67). Switch to the log of footfall: the funnel goes. Then swap Build-up for Day, a straight-line day count, and watch the arch appear in the time-order plot; swap back and Durbin–Watson returns to about 1.97.' },
    { widget: 'trans-hinge', intro: 'Fit the peak wait on the load plus a hinge at a threshold you choose, straight or squared. Move the threshold from 5 to 9 and compare R² and s; try the straight hinge against the squared one. Where does the fit peak, and how much does it matter?' },
    { widget: 'trans-slip', intro: 'Transactions on footfall in the raw log, all 612 café-days, with the residuals-against-leverage plot. One point sits alone at the right, beyond the Cook’s distance curves: Millbrook’s 14 September. Its studentized residual and Cook’s distance are printed in the panel.' },
    { widget: 'trans-clean', intro: 'The same regression on the corrected log. The largest Cook’s distances now belong to Harbourside’s festival days: real days, below a line that mixes two cafés with different conversion rates.' },
  ],

  mistakes: [
    { title: '“The log coefficient is 0.47, so weekends have 47% more people.”', html: 'The shortcut 100b works only for small b. The exact change is 100(e^b − 1): e^0.469 − 1 = 60%. For negative coefficients the shortcut overstates the fall: rain’s −0.784 per inch is a 54% fall, not 78%.' },
    { title: 'Exponentiating a log prediction and calling it the mean', html: 'e to the predicted log is an estimate of the median. Totals and averages built from it run low; multiply by a smearing factor (the mean of e to the residuals). For Harbourside it is 1.005; for noisier data it can be much larger.' },
    { title: 'Choosing between y and ln y by R²', html: 'The two R²s measure the share of variation in different quantities. Decide by the residual plots and by errors on a common scale, and by whether the effects work as amounts or as percentages.' },
    { title: 'Reaching for a high-degree polynomial', html: 'A polynomial bends everywhere. The quadratic for the wait has R² = 0.943 and still predicts that waits rise as the load falls below 6. A hinge at a threshold you can justify follows the data with fewer surprises; extrapolate neither.' },
    { title: '“It has a huge residual, so it’s influential”, or “It has high leverage, so delete it”', html: 'Influence needs both: in the log model without a festival term, the festival days’ studentized residuals of 5 to 7 come with Cook’s distances of 0.2 or less, and a high-leverage point that sits on the line changes nothing. Measure with Cook’s distance, then go to the source.' },
    { title: 'Deleting the points that spoil the result', html: 'Points removed because the result looks better without them make every later p-value and interval misleading. Correct errors from the source, model real differences (a festival dummy), and report with and without when a real point decides a conclusion.' },
  ],

  application: [
    { case: 'Ana’s change record for the 2027 log: “Millbrook, 14 Sep, footfall typed 2,566, door counter says 256: corrected (Cook’s D for the raw value 349). Festival days (5, Harbourside): real, kept, modelled with a dummy; without it the weekend effect reads 68% instead of 60%. Harbourside footfall now modelled in logs with a build-up term (to 29 June): residuals pass the spread and time-order checks; coefficients reported as percentages; roster limits from the log model’s prediction intervals.”' },
    { p: 'Records like this are routine wherever regression output drives money. A marketing analyst at an online retailer, say, fits sales in logs so that advertising effects come out as elasticities, checks the influence of the week a competitor’s site was down, and files a note saying which weeks were corrected, which were modelled and which were left as they are. The note matters as much as the model: anyone who reruns the analysis, or audits it, can see that no row was dropped to get a better answer.' },
    { p: 'Two habits separate a careful analyst from a hasty one. The first is choosing transformations for reasons that would hold before seeing the fit: effects that are percentages, a threshold known from the operation, a build-up known to have happened. Transformations chosen by trying many and keeping the best fit look better than they are on the next year’s data. The second is reporting results in the units a decision-maker uses. A log coefficient of 0.0109 means nothing to a café manager; “about 1% more people for every degree warmer” does, and so does “plan for 276 people on a warm Saturday”.' },
    { p: 'Finally, the influence checks belong at the start of an analysis as well as the end. Plotting the data and screening for leverage before fitting would have caught the slip in minutes. Done last, after a model has been presented, the same check becomes an awkward correction.' },
  ],

  summary: [
    'When effects are percentages, model ln y: products become sums, a funnel often disappears (Harbourside: Breusch–Pagan 67.8 in levels, 5.4 in logs), and coefficients read as percentage changes, exactly 100(eᵇ − 1), about 100b when b is small.',
    'Back-transform a log prediction with eˣ to get a median; multiply by a smearing factor for a mean; exponentiate the interval’s limits, which then widen with the level.',
    'Polynomial terms bend the whole curve; hinge terms, max(0, x − c) or its square, change it only beyond a threshold. The wait’s squared hinge at 7 has R² = 0.961 against 0.689 for a line, and a coefficient close to the planted 0.22.',
    'Leverage measures how unusual a row’s x values are (average p/n); studentized residuals measure how far it is from the line on a common scale; Cook’s distance combines them into influence.',
    'The raw slip had leverage 0.551, studentized residual −23.8 and Cook’s distance 349, and halved the slope; in a log model without a festival term the festival days are outliers with little leverage and Cook’s distances of 0.2 or less, but they still shift the weekend coefficient.',
    'Check unusual points against the source; correct errors; model real differences; report with and without; never delete a point to improve a result.',
  ],

  glossary: [
    { term: 'Polynomial regression', def: 'A regression that includes powers of a predictor (x², x³, …) as extra predictors so the fitted relationship can curve; the curve’s shape is set over the whole range of x at once.' },
    { term: 'Leverage (in regression)', def: 'How far a row’s predictor values are from the centre of all the rows’, measured by its hat value hᵢ between 1/n and 1. High-leverage rows pull the fitted line towards themselves.' },
    { term: 'Studentized residual', def: 'A residual divided by the standard deviation it should have given its leverage, so that residuals can be compared on one scale; the externally studentized version estimates that standard deviation without the row itself.' },
    { term: 'Cook’s distance', def: 'A measure of a row’s influence on a regression: how far all the fitted values move when the row is left out, scaled by the model’s precision. It is large only when a row has both a large residual and high leverage.' },
    { term: 'Smearing estimate', def: 'A correction for back-transforming predictions from a model of ln y: multiply e to the predicted log by the average of e to the residuals, to estimate the mean of y rather than its median.' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, 7.2, “Log-transforming Only the Response for SLR”.', url: 'https://online.stat.psu.edu/stat462/node/153', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, 9.3, “Identifying Outliers (Unusual Y Values)”.', url: 'https://online.stat.psu.edu/stat462/node/172', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, 9.4, “Studentized Residuals”.', url: 'https://online.stat.psu.edu/stat462/node/247', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, 9.5, “Identifying Influential Data Points”.', url: 'https://online.stat.psu.edu/stat462/node/173', checked: '2026-11-01' },
    { text: 'Microsoft Support. “LN function”.', url: 'https://support.microsoft.com/en-us/Excel/functions/ln-function', checked: '2026-11-01' },
  ],

  checks: [
    // logs
    { what: 'Planted % per °F on the coldest day', value: plantedPct(loT), shown: 1.7, tol: 0.05 },
    { what: 'Coldest day 28°F', value: loT, shown: 28 },
    { what: 'Planted % per °F on the hottest day', value: plantedPct(hiT), shown: 0.8, tol: 0.05 },
    { what: 'Hottest day 94°F', value: hiT, shown: 94 },
    { what: 'Build-up reaches 1 on 29 June', value: Number(BU[hDate.indexOf('2027-06-29')] === 1 && BU[hDate.indexOf('2027-06-28')] < 1), shown: 1 },
    { what: 'Log+day March mean residual', value: monthMean(LOGD, 3), shown: -0.052, tol: 0.0005 },
    { what: 'Log+day June', value: monthMean(LOGD, 6), shown: 0.036, tol: 0.0005 },
    { what: 'Log+day December', value: monthMean(LOGD, 12), shown: -0.027, tol: 0.0005 },
    { what: 'An arch: March and December below, June above', value: Number(monthMean(LOGD, 3) < 0 && monthMean(LOGD, 12) < 0 && monthMean(LOGD, 6) > 0), shown: 1 },
        { what: 'Build-up: monthly means within ±0.017', value: Math.max(...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => Math.abs(monthMean(LOG, m)))), shown: 0.017, tol: 0.0005 },
    { what: 'Build-up DW', value: R.durbinWatson(LOG.resid), shown: 1.97, tol: 0.005 },
    { what: 'Build-up BP', value: bp(LOG).lm, shown: 5.4, tol: 0.05 },
    { what: 'Build-up BP p', value: bp(LOG).p, shown: 0.37, tol: 0.005 },
    { what: 'High slope (logs)', value: coef(LOG, 'High (°F)').estimate, shown: 0.0109, tol: 0.00005 },
    { what: 'High % exact', value: pct(coef(LOG, 'High (°F)').estimate), shown: 1.1, tol: 0.05 },
    { what: 'High % shortcut', value: coef(LOG, 'High (°F)').estimate * 100, shown: 1.09, tol: 0.005 },
    { what: 'High exact (4 dp)', value: Math.exp(0.0109) - 1, shown: 0.0110, tol: 0.00005 },
    { what: 'Weekend slope', value: coef(LOG, 'Weekend').estimate, shown: 0.469, tol: 0.0005 },
    { what: 'Weekend %', value: pct(0.469), shown: 59.8, tol: 0.05 },
    { what: 'Weekend (3 dp)', value: Math.exp(0.469) - 1, shown: 0.598, tol: 0.0005 },
    { what: 'Weekend about 60%', value: pct(coef(LOG, 'Weekend').estimate), shown: 60, tol: 0.5 },
    { what: 'Festival slope', value: coef(LOG, 'Festival').estimate, shown: 0.891, tol: 0.0005 },
    { what: 'Festival multiple', value: Math.exp(0.891), shown: 2.44, tol: 0.005 },
    { what: 'Festival CI low', value: Math.exp(coef(LOG, 'Festival').low), shown: 2.23, tol: 0.005 },
    { what: 'Festival CI high', value: Math.exp(coef(LOG, 'Festival').high), shown: 2.66, tol: 0.005 },
    { what: 'Planted festival ×2.3 inside the CI', value: Number(Math.log(2.3) > coef(LOG, 'Festival').low && Math.log(2.3) < coef(LOG, 'Festival').high), shown: 1 },
    { what: 'Planted weekend base 196/122 is 61% above', value: (196 / 122 - 1) * 100, shown: 61, tol: 0.5 },
    { what: 'Rain slope', value: coef(LOG, 'Rain (in)').estimate, shown: -0.784, tol: 0.0005 },
    { what: 'Rain per 0.1 in', value: 0.1 * -0.784, shown: -0.0784, tol: 0.00005 },
    { what: 'Rain per 0.1 in %', value: Math.exp(-0.0784) - 1, shown: -0.075, tol: 0.0005 },
    { what: 'Rain per inch %', value: Math.exp(-0.784) - 1, shown: -0.543, tol: 0.0005 },
    { what: 'Rain per inch % (whole)', value: pct(-0.784), shown: -54, tol: 0.5 },
    { what: 'Rain shortcut per inch', value: 0.784 * 100, shown: 78, tol: 0.5 },
    { what: '10°F warmer', value: pct(10 * 0.0109), shown: 12, tol: 0.5 },
    { what: '10 × 0.0109', value: 10 * 0.0109, shown: 0.109, tol: 0.0005 },
    { what: 'Build-up from 72% (generator: 1/0.72 over the four months ≈ e^b)', value: Number(Math.abs(Math.exp(coef(LOG, 'Build-up').estimate) - 1 / 0.72) < 0.05), shown: 1 },
    { what: 'Residual SD in logs', value: LOG.sigma, shown: 0.098, tol: 0.0005 },
    { what: 'About 10%', value: (Math.exp(LOG.sigma) - 1) * 100, shown: 10, tol: 0.5 },
    { what: 'Levels R² (with build-up)', value: LEVB.r2, shown: 0.944, tol: 0.0005 },
    { what: 'Log R² (build-up)', value: LOG.r2, shown: 0.939, tol: 0.0005 },
    { what: 'Smearing factor', value: smear, shown: 1.005, tol: 0.0005 },
    { what: 'Normal factor', value: Math.exp(LOG.sigma ** 2 / 2), shown: 1.005, tol: 0.0005 },
    { what: 'Smearing at s = 0.5', value: (Math.exp(0.5 ** 2 / 2) - 1) * 100, shown: 13, tol: 0.5 },
    { what: 'Saturday log prediction', value: satP.yhat, shown: 5.427, tol: 0.0005 },
    { what: 'Tuesday log prediction', value: tueP.yhat, shown: 4.631, tol: 0.0005 },
    { what: 'Saturday median', value: Math.exp(satP.yhat), shown: 227, tol: 0.5 },
    { what: 'Saturday PI low', value: Math.exp(satP.piLow), shown: 187, tol: 0.5 },
    { what: 'Saturday PI high', value: Math.exp(satP.piHigh), shown: 276, tol: 0.5 },
    { what: 'Tuesday median', value: Math.exp(tueP.yhat), shown: 103, tol: 0.5 },
    { what: 'Tuesday PI low', value: Math.exp(tueP.piLow), shown: 85, tol: 0.5 },
    { what: 'Tuesday PI high', value: Math.exp(tueP.piHigh), shown: 124, tol: 0.5 },
    { what: 'Upper limit 21% above median (Sat)', value: (Math.exp(satP.piHigh - satP.yhat) - 1) * 100, shown: 21, tol: 0.5 },
    { what: 'Upper limit 21% above median (Tue)', value: (Math.exp(tueP.piHigh - tueP.yhat) - 1) * 100, shown: 21, tol: 0.5 },
    { what: 'Levels Saturday PI low', value: satL.piLow, shown: 180, tol: 0.5 },
    { what: 'Levels Saturday PI high', value: satL.piHigh, shown: 246, tol: 0.5 },
    { what: 'Levels Tuesday PI low', value: tueL.piLow, shown: 68, tol: 0.5 },
    { what: 'Levels Tuesday PI high', value: tueL.piHigh, shown: 134, tol: 0.5 },
    { what: 'Levels half-width', value: (satL.piHigh - satL.piLow) / 2, shown: 33, tol: 0.5 },
    { what: 'Levels half-width same on Tuesday', value: (tueL.piHigh - tueL.piLow) / 2, shown: 33, tol: 0.5 },
    { what: 'BP levels with build-up', value: bp(LEVB).lm, shown: 67.8, tol: 0.05 },
    { what: 'About 30 more on Saturday', value: Math.exp(satP.piHigh) - satL.piHigh, shown: 30, tol: 1 },
    { what: 'About 10 fewer on Tuesday', value: tueL.piHigh - Math.exp(tueP.piHigh), shown: 10, tol: 1 },
    { what: 'Smearing adds about one person', value: Math.exp(satP.yhat) * (smear - 1), shown: 1, tol: 0.5 },
    // waits
    { what: 'Café-days', value: WAIT.length, shown: 612 },
    { what: 'Line R² %', value: WL.r2 * 100, shown: 68.9, tol: 0.05 },
    { what: 'Quadratic R² %', value: WQ.r2 * 100, shown: 94.3, tol: 0.05 },
    { what: 'Squared hinge R² %', value: WS.r2 * 100, shown: 96.1, tol: 0.05 },
    { what: 'Line R²', value: WL.r2, shown: 0.689, tol: 0.0005 },
    { what: 'Quadratic R²', value: WQ.r2, shown: 0.943, tol: 0.0005 },
    { what: 'Hinge R²', value: WH.r2, shown: 0.857, tol: 0.0005 },
    { what: 'Squared hinge R²', value: WS.r2, shown: 0.961, tol: 0.0005 },
    { what: 'Line s', value: WL.sigma, shown: 1.11, tol: 0.005 },
    { what: 'Quadratic s', value: WQ.sigma, shown: 0.48, tol: 0.005 },
    { what: 'Hinge s', value: WH.sigma, shown: 0.75, tol: 0.005 },
    { what: 'Squared hinge s', value: WS.sigma, shown: 0.39, tol: 0.005 },
    { what: 'Line AIC', value: WL.aic, shown: 1867, tol: 0.5 },
    { what: 'Quadratic AIC', value: WQ.aic, shown: 835, tol: 0.5 },
    { what: 'Hinge AIC', value: WH.aic, shown: 1395, tol: 0.5 },
    { what: 'Squared hinge AIC', value: WS.aic, shown: 596, tol: 0.5 },
    { what: 'Squared hinge coefficient', value: coef(WS, 'Hinge²').estimate, shown: 0.226, tol: 0.0005 },
    { what: 'Load slope in squared-hinge model', value: coef(WS, 'Load').estimate, shown: -0.005, tol: 0.0005 },
    { what: 'Load slope not distinguishable from zero', value: Number(coef(WS, 'Load').p > 0.05), shown: 1 },
    { what: 'Planted 0.22 inside the hinge² CI', value: Number(0.22 > coef(WS, 'Hinge²').low && 0.22 < coef(WS, 'Hinge²').high), shown: 1 },
    { what: 'Wait at load 10', value: WS.predict([10, 9]).yhat, shown: 3.7, tol: 0.05 },
    { what: 'Wait at load 12', value: WS.predict([12, 25]).yhat, shown: 7.3, tol: 0.05 },
    { what: 'Line crosses 0 near 4.6', value: -WL.beta[0] / WL.beta[1], shown: 4.6, tol: 0.05 },
    { what: 'Line below the data at 5 and 14, above at 9 (squared-hinge fit as the data’s shape)', value: Number((() => { const l = (v) => WL.beta[0] + WL.beta[1] * v, q = (v) => WS.beta[0] + WS.beta[1] * v + WS.beta[2] * Math.max(0, v - 7) ** 2; return l(5) < q(5) && l(14) < q(14) && l(9) > q(9); })()), shown: 1 },
    { what: 'Line at 15 about 8', value: WL.beta[0] + 15 * WL.beta[1], shown: 8, tol: 0.1 },
    { what: 'Quadratic minimum', value: quadMin, shown: 6.0, tol: 0.05 },
    { what: 'Quadratic at load 2', value: WQ.predict([2, 4]).yhat, shown: 4.0, tol: 0.05 },
    { what: 'Days with load below 4', value: lowLoad.length, shown: 11 },
    { what: 'Their mean wait', value: mean(lowLoad), shown: 1.8, tol: 0.05 },
    { what: 'Scan R² at 9 (lowest)', value: Math.min(...scan.map(([, r]) => r)), shown: 0.930, tol: 0.0005 },
    { what: 'Scan R² best', value: Math.max(...scan.map(([, r]) => r)), shown: 0.961, tol: 0.0005 },
    { what: 'Scan peaks at 7', value: scan.find(([, r]) => r === Math.max(...scan.map(([, q]) => q)))[0], shown: 7 },
    { what: 'Slope at load 10', value: coef(WS, 'Load').estimate + 2 * coef(WS, 'Hinge²').estimate * 3, shown: 1.35, tol: 0.005 },
    { what: 'Slope at 10 from rounded', value: -0.005 + 2 * 0.226 * 3, shown: 1.35, tol: 0.005 },
    // the slip
    { what: 'B05 corrected r', value: Math.sqrt(CLEAN.r2), shown: 0.981, tol: 0.0005 },
    { what: 'B05 raw r', value: Math.sqrt(RAW.r2), shown: 0.679, tol: 0.0005 },
    { what: 'Raw slope', value: RAW.beta[1], shown: 0.260, tol: 0.0005 },
    { what: 'Clean slope', value: CLEAN.beta[1], shown: 0.560, tol: 0.0005 },
    { what: 'Raw intercept', value: RAW.beta[0], shown: 46.4, tol: 0.05 },
    { what: 'Raw s', value: RAW.sigma, shown: 36.5, tol: 0.05 },
    { what: 'Slip recorded', value: SLIP.recorded, shown: 2566 },
    { what: 'Slip actual', value: SLIP.actual, shown: 256 },
    { what: 'Slip transactions', value: TR[SI], shown: 130 },
    { what: 'Raw mean footfall', value: xbar, shown: 186.8, tol: 0.05 },
    { what: 'Sxx', value: Sxx, shown: 10305017, tol: 1 },
    { what: '(2566 − 186.8)²', value: (2566 - 186.8) ** 2, shown: 5660593, tol: 1 },
    { what: '1/612', value: 1 / 612, shown: 0.0016, tol: 0.00005 },
    { what: 'Slip leverage', value: rawInf.hat[SI], shown: 0.551, tol: 0.0005 },
    { what: 'Leverage by formula', value: 1 / n + (2566 - xbar) ** 2 / Sxx, shown: 0.551, tol: 0.0005 },
    { what: 'Flag 2p/n', value: rawInf.flags.leverage, shown: 0.0065, tol: 0.00005 },
    { what: '84 times the flag', value: rawInf.hat[SI] / rawInf.flags.leverage, shown: 84, tol: 0.5 },
    { what: 'Raw fitted at slip', value: RAW.fitted[SI], shown: 713.5, tol: 0.05 },
    { what: 'Slip residual', value: RAW.resid[SI], shown: -583.5, tol: 0.05 },
    { what: 'Rounded fitted 46.4 + 0.260 × 2566', value: 46.4 + 0.26 * 2566, shown: 713.6, tol: 0.15 },
    { what: 'Denominator 36.5√(1 − 0.551)', value: 36.5 * Math.sqrt(1 - 0.551), shown: 24.5, tol: 0.05 },
    { what: 'Slip internal', value: rawInf.internal[SI], shown: -23.8, tol: 0.05 },
    { what: 'Slip external', value: rawInf.external[SI], shown: -91.2, tol: 0.05 },
    { what: '23.8²/2', value: 23.8 ** 2 / 2, shown: 283.2, tol: 0.05 },
    { what: '0.551/0.449', value: 0.551 / 0.449, shown: 1.227, tol: 0.0005 },
    { what: 'Rounded Cook', value: 283.2 * 1.227, shown: 347, tol: 0.5 },
    { what: 'Slip Cook', value: rawInf.cooks[SI], shown: 349, tol: 0.5 },
    { what: 'Raw R²', value: RAW.r2, shown: 0.461, tol: 0.0005 },
    { what: 'Clean R²', value: CLEAN.r2, shown: 0.963, tol: 0.0005 },
    { what: 'Corrected day leverage', value: cleanInf.hat[SI], shown: 0.003, tol: 0.0005 },
    { what: 'Corrected day studentized', value: cleanInf.external[SI], shown: -0.61, tol: 0.005 },
    { what: 'Slope more than halved', value: Number(RAW.beta[1] < CLEAN.beta[1] / 2), shown: 1 },
    { what: 'One visitor in four', value: RAW.beta[1], shown: 0.25, tol: 0.015 },
    // festival days
    { what: 'Festival studentized low', value: Math.min(...festExt), shown: 5.0, tol: 0.05 },
    { what: 'Festival studentized high', value: Math.max(...festExt), shown: 7.4, tol: 0.05 },
    { what: 'Festival leverage low', value: Math.min(...festHat), shown: 0.015, tol: 0.0005 },
    { what: 'Festival leverage high', value: Math.max(...festHat), shown: 0.024, tol: 0.0005 },
    { what: 'Festival Cook low', value: Math.min(...festCook), shown: 0.08, tol: 0.005 },
    { what: 'Festival Cook high', value: Math.max(...festCook), shown: 0.20, tol: 0.005 },
    { what: '4/n', value: nodInf.flags.cooks, shown: 0.013, tol: 0.0005 },
    { what: 'All festivals on weekends', value: Number(festIdx.every((i) => base.Weekend[i] === 1)), shown: 1 },
    { what: 'Weekend without festival term', value: coef(NOD, 'Weekend').estimate, shown: 0.521, tol: 0.0005 },
    { what: 'Weekend % without festival term', value: pct(coef(NOD, 'Weekend').estimate), shown: 68, tol: 0.5 },
    { what: 'Weekend with dummy (4 dp)', value: coef(LOG, 'Weekend').estimate, shown: 0.4691, tol: 0.00005 },
    { what: 'Weekend dropping festivals (4 dp)', value: coef(DROP, 'Weekend').estimate, shown: 0.4691, tol: 0.00005 },
    { what: 'High: dummy ≈ drop', value: Math.abs(coef(DROP, 'High (°F)').estimate - coef(LOG, 'High (°F)').estimate), shown: 0, tol: 0.0002 },
    { what: 'Clean top Cook is 29 May Harbourside', value: Number(DATE[cleanTop] === '2027-05-29' && CAFE[cleanTop] === 'Harbourside'), shown: 1 },
    { what: 'Its Cook', value: cleanInf.cooks[cleanTop], shown: 0.56, tol: 0.005 },
    { what: 'Top five clean Cook all festival days', value: Number([...cleanInf.cooks].map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 5).every(([, i]) => column('festival01')[i] === 1)), shown: 1 },
    { what: 'They sit below the line', value: Number(column('festival01').every((f, i) => !f || CLEAN.resid[i] < 0)), shown: 1 },
    { what: 'Harbourside conversion', value: conv('Harbourside') * 100, shown: 47, tol: 0.5 },
    { what: 'Millbrook conversion', value: conv('Millbrook') * 100, shown: 55, tol: 0.5 },
  ],
};
