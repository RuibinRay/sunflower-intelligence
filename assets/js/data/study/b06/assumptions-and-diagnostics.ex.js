// assumptions-and-diagnostics.ex.js — B06 · Assumptions and diagnostics: widgets, practice and the knowledge check
// (answer keys live here). The café log comes from case.js (Millbrook's first 40 weekdays and Harbourside's summer
// weekends for the worksheets); Brackenford Laundrette, Fairhaven Guest House and the other businesses named are
// fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute in `check`.
import { CLEAN_ROWS, CAFE_COLUMNS, column } from './case.js?v=28';
import * as R from '../../../core/regression.js?v=28';
import { pearson } from '../../../core/correlation.js?v=28';
import { DERIVED as D } from './case.js?v=28';
const pooledDW = R.durbinWatson(D.footfallModel.resid);

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const at = (n) => CAFE_COLUMNS.indexOf(n);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}`;

// ---------------------------------------------------------------- widgets: Harbourside's year, the iced share
const H = { cafe: 'Harbourside' };
const hxs = { 'High (°F)': column('high_f', H), 'Rain (in)': column('rain_in', H), Weekend: column('weekend', H), Festival: column('festival01', H), 'Build-up': column('build_up', H) };
const hLabels = column('date', H).map(dayLabel);
const iceLabels = column('date').map((d, i) => `${dayLabel(d)}, ${column('cafe')[i]}`);
const HF = R.fit(column('footfall', H), { 'High (°F)': hxs['High (°F)'], 'Rain (in)': hxs['Rain (in)'], Weekend: hxs.Weekend, Festival: hxs.Festival });
const HR = HF.robust();

// ---------------------------------------------------------------- worksheet 1: Millbrook's first 40 weekdays
const MB = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && !['Sat', 'Sun'].includes(r[at('weekday')])).slice(0, 40);
const mbDay = MB.map((r) => r[at('date')]), mbHigh = MB.map((r) => r[at('high_f')]), mbFoot = MB.map((r) => r[at('footfall')]);
const MBF = R.fit(mbFoot, { High: mbHigh });
const mbRes = Array.from(MBF.resid), mbDW = R.durbinWatson(mbRes);
const mbLagC = pearson(mbRes.slice(1), mbRes.slice(0, -1)).r;
const firstHalf = mbRes.slice(0, 20).reduce((s, v) => s + v, 0) / 20, secondHalf = mbRes.slice(20).reduce((s, v) => s + v, 0) / 20;
const mbBase = { A1: 'Date', B1: 'Weekday', C1: 'High (°F)', D1: 'Footfall', ...col('A', 2, mbDay.map(dayLabel)), ...col('B', 2, MB.map((r) => r[at('weekday')])), ...col('C', 2, mbHigh), ...col('D', 2, mbFoot) };
const mbResidCells = col('E', 2, mbDay.map((_, i) => `=D${i + 2}-TREND(D$2:D$41,C$2:C$41,C${i + 2})`));

// ---------------------------------------------------------------- worksheet 2: Harbourside's ordinary summer weekend days
const WK = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && ['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-06-01' && r[at('date')] <= '2027-09-30' && !r[at('festival')]);
const wkHigh = WK.map((r) => r[at('high_f')]), wkFoot = WK.map((r) => r[at('footfall')]), nW = WK.length, lastW = nW + 1;
const WKF = R.fit(wkFoot, { High: wkHigh }), wkBP = R.breuschPagan(WKF.cols, WKF.resid);
const wkCells = { A1: 'Date', B1: 'High (°F)', C1: 'Footfall', D1: 'Residual', E1: 'Residual²', ...col('A', 2, WK.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, wkHigh), ...col('C', 2, wkFoot),
  ...col('D', 2, WK.map((_, i) => `=C${i + 2}-TREND(C$2:C$${lastW},B$2:B$${lastW},B${i + 2})`)), ...col('E', 2, WK.map((_, i) => `=D${i + 2}^2`)) };

// ---------------------------------------------------------------- fictional series
const BL = [3.1, 2.4, 2.9, 1.2, -0.4, -1.8, -2.6, -1.1, -2.3, 0.6];          // Brackenford Laundrette, ten days ($ hundreds)
const blDW = R.durbinWatson(BL);
const FH = { num: 812, den: 590 };                                            // Fairhaven Guest House, sums from 48 weeks

export const widgets = {
  'diag-harbour': {
    type: 'diagnostics',
    title: 'Harbourside’s footfall, 306 days: residual plots',
    y: { name: 'Footfall', values: column('footfall', H) },
    xs: hxs, picked: ['High (°F)', 'Rain (in)', 'Weekend', 'Festival'], choose: true,
    plots: ['fitted', 'qq', 'scale', 'leverage', 'order'], labels: hLabels,
    note: 'The rows are in date order (1 March first), so the last plot is the time-order plot. Build-up is the opening build-up: 0 on 1 March, rising evenly to 1 on 29 June, then 1. With Festival ticked, the five festival days have leverage of about 0.2 each, which is why 29 May has the largest Cook’s distance.',
  },
  'diag-iced': {
    type: 'diagnostics',
    title: 'Iced share against the day’s high, 612 café-days',
    y: { name: 'Iced share', values: column('iced_share') },
    xs: { 'High (°F)': column('high_f') },
    plots: ['fitted', 'qq'], labels: iceLabels,
    note: 'A straight line through an S-shaped relationship: the wave in the first plot is the form, not noise.',
  },
  'diag-robust': {
    type: 'regression',
    title: 'Harbourside’s footfall on the weather and the calendar (306 days)',
    y: { name: 'Footfall', values: column('footfall', H) },
    xs: [{ name: 'High (°F)', values: hxs['High (°F)'] }, { name: 'Rain (in)', values: hxs['Rain (in)'] }, { name: 'Weekend', values: hxs.Weekend }, { name: 'Festival', values: hxs.Festival }],
    picked: [0, 1, 2, 3], options: ['robust'],
    note: `Breusch–Pagan for this model gives LM = ${fx(R.breuschPagan(HF.cols, HF.resid).lm, 1)} on 4 df, so the HC3 standard errors are the ones to report.`,
  },
};

export const guided = [
  {
    id: 'b06-diag-g1', type: 'steps', kind: 'numerical',
    prompt: 'The worksheet holds Millbrook’s first 40 weekdays (1 March to 23 April 2027) in date order: the day’s high and footfall. Ana fits footfall on the high alone and checks the residuals in time order.',
    solution: `Residuals: <x>=D2-TREND(D$2:D$41,C$2:C$41,C2)</x>, filled to E41. Durbin–Watson: <x>=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E2:E41)</x> = ${fx(mbDW)}, below 2. That is only modestly below 2, and with 40 rows a formal test would be borderline. The half means make the case: the first 20 weekdays’ residuals average ${neg(firstHalf, 1)} people and the last 20’s ${secondHalf > 0 ? '+' : ''}${neg(secondHalf, 1)}, because the café was building up its trade, which the high alone can’t describe. Note that the “neighbours” here skip weekends: Friday’s residual is paired with Monday’s.`,
    steps: [
      {
        id: 'b06-diag-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the first day’s residual from the least-squares line of footfall on the high over all 40 days, so that it fills down to E41.',
        sheet: { cells: { ...mbBase, E1: 'Residual' } },
        cell: 'E2', fill: 'E2:E41', answer: '=D2-TREND(D$2:D$41,C$2:C$41,C2)',
        alt: ['=D2-FORECAST.LINEAR(C2,D$2:D$41,C$2:C$41)', '=D2-(INTERCEPT(D$2:D$41,C$2:C$41)+SLOPE(D$2:D$41,C$2:C$41)*C2)'],
        view: 'A1:E41', maxHeight: '20rem', formats: { E: '0.0' }, widths: { A: 8, B: 9, C: 10, D: 10, E: 10 },
        wrong: [
          { formula: '=D2-TREND(D2:D41,C2:C41,C2)', say: 'Without dollar signs the ranges slide down as the formula fills, so later rows use a different line. Lock the rows: D$2:D$41 and C$2:C$41.' },
          { formula: '=TREND(D$2:D$41,C$2:C$41,C2)-D2', say: 'That is fitted minus actual. A residual is actual minus fitted, e = y − ŷ, so days busier than the line predicts are positive.' },
        ],
        hints: ['A residual is the actual footfall minus the fitted footfall for that day’s high.', '<x>=D2-TREND(D$2:D$41,C$2:C$41,C2)</x>'],
      },
      {
        id: 'b06-diag-g1-s2', type: 'formula',
        prompt: 'Column E now holds the residuals. In H2, calculate the Durbin–Watson statistic.',
        sheet: { cells: { ...mbBase, E1: 'Residual', ...mbResidCells, G2: 'Durbin–Watson' } },
        cell: 'H2', answer: '=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E2:E41)',
        alt: ['=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMPRODUCT(E2:E41^2)', '=SUMPRODUCT((E2:E40-E3:E41)^2)/SUMSQ(E2:E41)'],
        view: 'A1:H41', maxHeight: '20rem', formats: { E: '0.0', H: '0.00' }, widths: { A: 8, B: 9, C: 10, D: 10, E: 10, G: 14 },
        wrong: [
          { formula: '=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E3:E41)', say: 'The denominator sums the squares of all 40 residuals, E2:E41; only the numerator, which uses pairs of neighbours, has 39 terms.' },
          { formula: '=SUMSQ(E3:E41)/SUMSQ(E2:E41)', say: 'The numerator squares the differences between neighbours, (eₜ − eₜ₋₁)², not the residuals themselves.' },
        ],
        hints: ['Numerator: the sum of (each residual minus the one before it)², for rows 3 to 41.', '<x>=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E2:E41)</x>'],
      },
      {
        id: 'b06-diag-g1-s3', type: 'mc',
        prompt: `Durbin–Watson comes out at ${fx(mbDW)}, and the first 20 weekdays’ residuals average ${neg(firstHalf, 1)} people against ${secondHalf > 0 ? '+' : ''}${neg(secondHalf, 1)} for the last 20. What do the two together suggest?`,
        options: [
          'A modest drift over time: something that changes through the period is missing from the model.',
          'The residuals are not normally distributed, so the slope’s t test is invalid.',
          'The spread of the residuals grows with the fitted value, so robust standard errors are needed.',
          'The model has no problem, since Durbin–Watson can lie anywhere from 0 to 4 and any value in that range is acceptable.',
        ],
        answer: 0,
        hints: ['A value near 2 means no first-order autocorrelation. Which way is this one from 2?'],
        feedback: {
          1: 'Durbin–Watson looks at neighbouring residuals, not at their shape. Normality is checked with a Q–Q plot.',
          2: 'A funnel is a question about spread; Durbin–Watson is about rows that are next to each other in time.',
          3: 'The statistic runs from 0 to 4; values below 2 mean positive autocorrelation. Here it is only modestly below 2, but the half means show the drift.',
        },
      },
    ],
  },
  {
    id: 'b06-diag-g2', type: 'classify', kind: 'conceptual',
    prompt: 'For each problem with a regression, say what it does to the least-squares coefficients.',
    items: [
      'Iced share follows an S-shaped curve in the temperature, but the model is a straight line.',
      'Busy days’ footfall varies by more people than quiet days’ does.',
      'The residuals are heavier-tailed than a normal distribution, with 306 days of data.',
      'A café’s trade built up over its first four months, the temperature rose at the same time, and the model has no build-up term.',
      'Neighbouring days’ errors are alike, though the model’s form is right and nothing is missing.',
    ],
    categories: ['Biases the coefficients', 'Leaves them unbiased; distorts standard errors or intervals'],
    answer: [0, 1, 1, 0, 1],
    hints: ['Ask whether the model is estimating the right thing (the form and the predictors) or only how precisely it is estimating it.', 'Only a wrong form or a missing predictor that goes with the included ones biases the coefficients.'],
    feedback: {
      0: 'A line fitted to a curve gives a slope that averages very different rates and predictions that are systematically wrong at the ends and in the middle.',
      1: 'Unequal spread leaves the slopes unbiased; the ordinary standard errors and a constant-width prediction interval are what go wrong.',
      2: 'Non-normal errors don’t bias least squares; with 306 days the coefficient tests are still reliable. Prediction intervals are what suffer.',
      3: 'A missing predictor that goes with an included one biases its slope: the temperature slope picks up part of the build-up.',
      4: 'With the form right, autocorrelated errors leave the slopes unbiased but make the usual standard errors too small.',
    },
    solution: 'Biased: the wrong form (a line through a curve) and the missing trend that goes with temperature. Unbiased but with wrong standard errors or intervals: unequal spread, heavy tails and autocorrelated errors when nothing is missing.',
  },
  {
    id: 'b06-diag-g3', type: 'num', kind: 'numerical',
    prompt: `Ana regresses the squared residuals of Harbourside’s footfall model on its four predictors. That auxiliary regression has R² = ${fx(hBPaux(), 4)} over 306 days. Calculate the Breusch–Pagan statistic (Koenker’s form). Give one decimal place.`,
    answer: Math.round(306 * hBPaux() * 10) / 10, check: () => R.breuschPagan(HF.cols, HF.resid).lm, places: 1, tol: 0.15, unit: '',
    wrong: [{ value: Math.round(hBPaux() * 1000) / 1000, say: 'That is the auxiliary R² itself. The statistic is n × R², with n = 306.' }, { value: Math.round(4 * hBPaux() * 100) / 100, say: 'Multiply by the number of rows, n = 306, not the number of predictors; the predictors set the degrees of freedom.' }],
    hints: ['LM = n × R² of the auxiliary regression.', `306 × ${fx(hBPaux(), 4)}.`],
    solution: `LM = 306 × ${fx(hBPaux(), 4)} = ${fx(306 * hBPaux(), 1)}, on 4 degrees of freedom (one per predictor). <x>=CHISQ.DIST.RT(${fx(306 * hBPaux(), 1)},4)</x> is below 0.001: strong evidence that the spread of the errors changes with the predictors.`,
  },
  {
    id: 'b06-diag-g4', type: 'mc', kind: 'conceptual',
    prompt: 'On a normal Q–Q plot of a model’s studentized residuals, the points lie on the line in the middle, fall below it at the left end and rise above it at the right end. What does that show?',
    options: [
      'Heavier tails than a normal distribution: more extreme residuals at both ends than a normal sample would have.',
      'Lighter tails than a normal distribution: fewer extreme residuals at both ends than a normal sample would have.',
      'Right skew: a long tail of large positive residuals and a short tail of negative ones.',
      'Unequal spread: residuals larger for larger fitted values.',
    ],
    answer: 0,
    hints: ['At the left end the sample values are below the normal scores: more negative than a normal sample’s smallest values.', 'Both ends further out than the normal ones means more extreme values at both ends.'],
    feedback: {
      1: 'Lighter tails would put the ends closer to the middle than the normal scores: above the line on the left, below it on the right.',
      2: 'Skew bends both ends the same way (a curve). Here the two ends leave the line in opposite directions, an S.',
      3: 'A Q–Q plot sorts the residuals by size and ignores which rows they came from, so it can’t show how spread changes with the fitted value; use the residuals-against-fitted plot.',
    },
    solution: 'Points below the line on the left and above it on the right mean the smallest residuals are more negative, and the largest more positive, than a normal sample’s: heavy tails. For Harbourside a few festival and unusual days do this.',
  },
];

function hBPaux() { return R.breuschPagan(HF.cols, HF.resid).lm / 306; }

export const independent = [
  {
    id: 'b06-diag-i1', type: 'formula', kind: 'numerical',
    prompt: `The worksheet holds Harbourside’s ${nW} ordinary weekend days from June to September 2027 (no festival days), with footfall’s residuals on the high in D and their squares in E. In H2, calculate the Breusch–Pagan statistic for this one-predictor model.`,
    sheet: { cells: { ...wkCells, G2: 'Breusch–Pagan LM', G3: 'p-value', H3: '=CHISQ.DIST.RT(H2,1)' } },
    cell: 'H2', answer: `=COUNT(E2:E${lastW})*RSQ(E2:E${lastW},B2:B${lastW})`,
    alt: [`=${nW}*RSQ(E2:E${lastW},B2:B${lastW})`, `=COUNT(E2:E${lastW})*CORREL(E2:E${lastW},B2:B${lastW})^2`],
    view: `A1:H${lastW}`, maxHeight: '20rem', formats: { D: '0.0', E: '0.0', H: '0.000' }, widths: { A: 8, B: 10, C: 10, D: 10, E: 11, G: 18 },
    wrong: [
      { formula: `=COUNT(E2:E${lastW})*RSQ(D2:D${lastW},B2:B${lastW})`, say: 'Use the squared residuals (column E). The residuals themselves are uncorrelated with the predictor by construction, so their R² is 0.' },
      { formula: `=RSQ(E2:E${lastW},B2:B${lastW})`, say: 'That is the auxiliary R². The statistic multiplies it by the number of rows.' },
    ],
    solution: `<x>=COUNT(E2:E${lastW})*RSQ(E2:E${lastW},B2:B${lastW})</x> = ${fx(wkBP.lm, 3)}, and H3 gives p = ${fx(wkBP.p, 3)}. On these ${nW} days there is ${wkBP.p < 0.05 ? 'evidence' : 'no clear evidence'} that the spread changes with the temperature; with so few rows the test has little power, so look at the plot too.`,
  },
  {
    id: 'b06-diag-i2', type: 'num', kind: 'numerical',
    prompt: 'Brackenford Laundrette (fictional) models its daily takings on the day’s rain. Its residuals for ten consecutive days, in hundreds of dollars, are 3.1, 2.4, 2.9, 1.2, −0.4, −1.8, −2.6, −1.1, −2.3, 0.6. Calculate the Durbin–Watson statistic. Give two decimal places.',
    data: { table: { head: ['Day', 'Residual'], rows: BL.map((v, i) => [String(i + 1), neg(v, 1)]), align: ['l', 'r'] } },
    answer: Math.round(blDW * 100) / 100, check: () => BL.slice(1).reduce((s, v, i) => s + (v - BL[i]) ** 2, 0) / BL.reduce((s, v) => s + v * v, 0), places: 2, tol: 0.006, unit: '',
    wrong: [{ value: Math.round(BL.slice(1).reduce((s, v, i) => s + (v - BL[i]) ** 2, 0) / BL.slice(1).reduce((s, v) => s + v * v, 0) * 100) / 100, say: 'The denominator sums the squares of all ten residuals, including day 1’s.' }],
    solution: `Squared differences of neighbours sum to ${fx(BL.slice(1).reduce((s, v, i) => s + (v - BL[i]) ** 2, 0), 2)}; squared residuals to ${fx(BL.reduce((s, v) => s + v * v, 0), 2)}. DW = ${fx(blDW)}: well below 2, so neighbouring days are alike (four positive days, then five negative ones).`,
  },
  {
    id: 'b06-diag-i3', type: 'mc', kind: 'applied',
    prompt: 'A regional hotel group (fictional) regresses a hotel’s monthly revenue on its marketing spend over 60 hotel-months. The slope is 4.2 dollars of revenue per dollar of spend, with an ordinary SE of 1.5 (t = 2.8, p = 0.007). The residuals fan out for larger hotels; the HC3 SE is 2.6 (t = 1.6, p = 0.11). What should the analyst report?',
    options: [
      'The slope with the HC3 SE: once the unequal spread is allowed for, the evidence of an association is weak.',
      'The ordinary SE, because the HC3 version is only a large-sample approximation while the ordinary formula is exact.',
      'A slope of 4.2 ÷ 2.6 = 1.6 dollars of revenue per dollar of spend, because robust standard errors correct the coefficient.',
      'Both p-values averaged (about 0.06), as a compromise between the two methods.',
    ],
    answer: 0,
    feedback: {
      1: 'The ordinary SE is exact only if the error variance is the same for every row; the fan shows it isn’t, so the ordinary SE is the wrong one here.',
      2: 'Robust standard errors change the standard error, not the coefficient. 1.6 is the t statistic.',
      3: 'Averaging p-values has no meaning. One method’s assumptions fit the data and the other’s don’t.',
    },
    solution: 'Unequal spread leaves the slope unbiased but makes the ordinary SE unreliable. With the HC3 SE, t = 4.2 ÷ 2.6 ≈ 1.6 and p ≈ 0.11: the data don’t give clear evidence of an association. Report the slope with the robust SE and say why.',
  },
  {
    id: 'b06-diag-i4', type: 'multi', kind: 'conceptual',
    prompt: 'A model’s residuals against fitted values form a clear funnel, narrow on the left and wide on the right, with no curve. Select all that apply.',
    options: [
      'The least-squares slopes are still unbiased.',
      'The ordinary standard errors may be too small or too large.',
      'A prediction interval of constant width will be too narrow for the largest fitted values.',
      'The model’s form is wrong, so the slopes are biased.',
      'The R² is wrong and must be recalculated.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A funnel with no curve is a problem of spread, not of form; the slopes are unbiased.',
      4: 'R² is still the share of variation the model accounts for. It isn’t a test, and the funnel doesn’t change how it is calculated.',
    },
    solution: 'A funnel means heteroskedasticity: unbiased slopes, unreliable ordinary standard errors (use HC3), and constant-width prediction intervals that are too wide where the spread is small and too narrow where it is large. A log of y often removes a funnel whose width grows with the mean.',
  },
  {
    id: 'b06-diag-i5', type: 'mc', kind: 'conceptual',
    prompt: `A colleague fits footfall on the weather, the café and the calendar to all 612 rows of the café log as listed, which alternates Harbourside and Millbrook day by day. Durbin–Watson on those residuals is ${fx(pooledDW)}, and she concludes that neighbouring days are alike. What is wrong with the conclusion?`,
    options: [
      'Many residuals are compared with the other café’s on the same day, not with the previous day’s.',
      'Nothing: a value below 2 shows positive autocorrelation between days, so neighbouring days really are alike.',
      'Durbin–Watson needs normally distributed residuals, and the café’s footfall residuals are heavy-tailed.',
      'Durbin–Watson can only be used with one predictor.',
    ],
    answer: 0,
    feedback: {
      1: 'Read in the listed order, “the previous row” is half the time the other café on the same day, not the previous day. Sort by café, then date, before computing it.',
      2: 'The statistic itself needs no assumption of normality; the problem is the order of the rows.',
      3: 'It works with any number of predictors; its critical values depend on how many there are.',
    },
    solution: 'Durbin–Watson compares each residual with the one in the row before. With the cafés interleaved, half the pairs are the two cafés on the same day and half are one café’s day with the other café’s previous day, so the statistic mixes two different things and measures neither. Compute it for each café in date order.',
  },
];

export const check = [
  {
    id: 'b06-diag-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of the four conditions matter most for a 95% prediction interval for one day’s footfall, beyond the right form?',
    options: [
      'Equal variance and normality, because the interval describes a single day’s error.',
      'Independence alone, because prediction intervals only fail when rows are dependent.',
      'None: with 306 days the central limit theorem makes any prediction interval valid.',
      'Normality alone, because unequal spread only affects the slopes and their standard errors.',
    ],
    answer: 0,
    feedback: {
      1: 'Dependence matters, but a prediction interval also depends on how wide a single day’s error is (equal variance) and on its shape (normality).',
      2: 'The central limit theorem helps averages, such as coefficients, not a single day’s error.',
      3: 'Unequal spread leaves the slopes unbiased; it makes the width of the interval wrong at each fitted value.',
    },
    solution: 'A prediction interval adds one day’s error to the uncertainty in the line. Its width assumes the error has the same spread everywhere, and its ±t × SE limits assume the error is roughly normal. Large n doesn’t fix either.',
  },
  {
    id: 'b06-diag-k2', type: 'num', kind: 'numerical',
    prompt: 'Fairhaven Guest House (fictional) fits weekly bookings over 48 weeks. The squared differences of successive residuals sum to 812 and the squared residuals to 590. Calculate the Durbin–Watson statistic and use it to estimate the lag-1 autocorrelation of the residuals, r₁ ≈ 1 − DW ÷ 2. Enter r₁ to two decimal places.',
    answer: Math.round((1 - FH.num / FH.den / 2) * 100) / 100, check: () => 1 - (812 / 590) / 2, places: 2, tol: 0.006, unit: '',
    wrong: [{ value: Math.round(FH.num / FH.den * 100) / 100, say: 'That is the Durbin–Watson statistic. Convert it: r₁ ≈ 1 − DW ÷ 2.' }],
    solution: `DW = 812 ÷ 590 = ${fx(FH.num / FH.den)}; r₁ ≈ 1 − ${fx(FH.num / FH.den)} ÷ 2 = ${fx(1 - FH.num / FH.den / 2)}. Positive but modest autocorrelation: neighbouring weeks are somewhat alike, enough to make the usual standard errors a little too small.`,
  },
  {
    id: 'b06-diag-k3', type: 'formula', kind: 'numerical',
    prompt: 'Column E holds the residuals of Millbrook’s 40 weekdays (footfall on the high, in date order). In H3, calculate their lag-1 correlation: the correlation of each residual with the one before it.',
    sheet: { cells: { ...mbBase, E1: 'Residual', ...mbResidCells, G2: 'Durbin–Watson', H2: '=SUMPRODUCT((E3:E41-E2:E40)^2)/SUMSQ(E2:E41)', G3: 'Lag-1 correlation' } },
    cell: 'H3', answer: '=CORREL(E3:E41,E2:E40)', alt: ['=CORREL(E2:E40,E3:E41)', '=PEARSON(E3:E41,E2:E40)'],
    view: 'A1:H41', maxHeight: '20rem', formats: { E: '0.0', H: '0.00' }, widths: { A: 8, B: 9, C: 10, D: 10, E: 10, G: 17 },
    wrong: [{ formula: '=CORREL(E2:E41,C2:C41)', say: 'That correlates the residuals with the high, which least squares makes 0. The lag-1 correlation pairs each residual with the previous day’s: E3:E41 against E2:E40.' }],
    solution: `<x>=CORREL(E3:E41,E2:E40)</x> = ${fx(mbLagC)}. With DW = ${fx(mbDW)} in H2, 2(1 − ${fx(mbLagC)}) = ${fx(2 * (1 - mbLagC))}: the approximation DW ≈ 2(1 − r₁) holds roughly. Both are only modestly away from no autocorrelation, and the “neighbours” skip weekends; the drift shows more clearly in the half means of the residuals.`,
  },
  {
    id: 'b06-diag-k4', type: 'mc', kind: 'applied',
    prompt: `In Harbourside’s footfall model the weekend coefficient is ${fx(HF.coefs[3].estimate, 1)} people with an ordinary SE of ${fx(HF.coefs[3].se)} and an HC3 SE of ${fx(HR.coefs[3].se)}. Ana is asked whether the weekend difference is clearly real. What should she say?`,
    options: [
      `Yes: with the HC3 SE, t ≈ ${fx(HF.coefs[3].estimate / HR.coefs[3].se, 1)}, far beyond any critical value; the choice of SE doesn’t change that.`,
      'No: the HC3 SE is larger than the ordinary one, so the weekend coefficient is now in doubt and should be dropped.',
      'She can’t say until the residuals have been made normal, because the t test behind the p-value needs normal errors.',
      `Yes, but only with the ordinary SE, since t ≈ ${fx(HF.coefs[3].t, 1)} is larger.`,
    ],
    answer: 0,
    feedback: {
      1: 'A larger SE widens the interval, but t is still above 20: no doubt that weekends are busier.',
      2: 'With 306 days the coefficient tests rely little on normal errors; heteroskedasticity is the issue, and HC3 handles it.',
      3: 'The ordinary SE assumes equal spread, which Breusch–Pagan rejects; the HC3 one is the honest choice, and it gives the same conclusion.',
    },
    solution: `t = ${fx(HF.coefs[3].estimate, 1)} ÷ ${fx(HR.coefs[3].se)} ≈ ${fx(HF.coefs[3].estimate / HR.coefs[3].se, 1)} with HC3. The interval widens from about ±${fx(1.97 * HF.coefs[3].se, 1)} to about ±${fx(1.97 * HR.coefs[3].se, 1)} people, but the weekend difference is clearly real.`,
  },
  {
    id: 'b06-diag-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Match each finding to the condition it calls into question.',
    items: [
      'Residuals against fitted values trace a U shape.',
      'Residuals against fitted values fan out from left to right.',
      'Durbin–Watson for daily residuals in date order is 0.9.',
      'On the normal Q–Q plot the points bend away from the line in the same direction at both ends.',
    ],
    categories: ['Linearity', 'Equal variance', 'Independence', 'Normality'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'A curve in the residuals means the form is wrong.',
      1: 'A fan is spread changing with the fitted value: heteroskedasticity.',
      2: 'Well below 2: neighbouring days’ residuals are alike.',
      3: 'Both ends bending the same way is skew in the residuals.',
    },
    solution: 'U shape: linearity. Fan: equal variance. DW of 0.9: independence. A curved Q–Q plot: normality (skew).',
  },
  {
    id: 'b06-diag-k6', type: 'mc', kind: 'applied',
    prompt: 'A chain of fictional garden centres fits weekly sales on temperature for three years. Durbin–Watson is 0.8, and the time-order plot shows residuals that rise each spring and fall each autumn. What is the best first step?',
    options: [
      'Add a term for the season (month dummies, say), refit and look at the residuals again.',
      'Keep the model and switch to HC3 robust standard errors.',
      'Drop the weeks with the largest residuals until Durbin–Watson is near 2.',
      'Log the sales, since a log removes autocorrelation.',
    ],
    answer: 0,
    feedback: {
      1: 'HC3 repairs standard errors for unequal spread, not for dependence; and a missing season biases the temperature slope, which no standard error can fix.',
      2: 'Deleting inconvenient weeks hides the pattern without explaining it.',
      3: 'A log addresses a funnel or a multiplicative form; it doesn’t add the missing season.',
    },
    solution: 'A regular pattern in time order means something is missing: here the season, which goes with temperature. Adding it can change the temperature slope as well as the standard errors. Check the residuals again afterwards.',
  },
];
