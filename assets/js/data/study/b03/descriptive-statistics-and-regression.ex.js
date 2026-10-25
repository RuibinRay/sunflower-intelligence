// descriptive-statistics-and-regression.ex.js — B03 · Descriptive statistics and regression in Excel: widgets,
// practice and the knowledge check (answer keys live here). Lantern's orders and catering events come from case.js;
// any other business is fictional. Formula items are marked by their results (core/sheet.js gradeFormula), num items
// recompute their answers in `check`. The regression widgets offer guests as the only X: hours, pastries and baristas
// belong to the project's multiple regression.
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, DERIVED as D, tableCells } from './case.js?v=14';

const TOT = ORDERS.map((r) => r[ORDER_COLUMNS.indexOf('order_total')]);
const ev = (name, rows) => rows.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const ONE = EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('days')] === 1);
const ofType = (t) => EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('event_type')] === t);
const sheetOf = (rows, cols, extra = {}) => ({ cells: { ...tableCells(EVENT_COLUMNS, rows, { cols }).cells, ...extra } });
const RS = D.regression.simple, RA = D.regression.allEvents;
const C0 = RS.coefs.Intercept, C1 = RS.coefs.guests;

// numbers as Excel's output prints them (6 significant figures) and small helpers
const sig = (v, k = 6) => String(Number(v.toPrecision(k)));
const P0 = Number(sig(C0.b)), P1 = Number(sig(C1.b)), PSE1 = Number(sig(C1.se));     // the printed coefficients
const sci = (p) => p.toExponential(2).toUpperCase();                                  // 1.47E-34
const usd = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
/** Least squares of y on one x, with LINEST's statistics. */
function fit1(xs, ys) {
  const n = xs.length, mx = mean(xs), my = mean(ys);
  const sxx = sum(xs.map((x) => (x - mx) ** 2)), sxy = sum(xs.map((x, i) => (x - mx) * (ys[i] - my))), syy = sum(ys.map((y) => (y - my) ** 2));
  const b = sxy / sxx, a = my - b * mx, sse = syy - b * sxy, df = n - 2, sey = Math.sqrt(sse / df);
  return { b, a, r: sxy / Math.sqrt(sxx * syy), r2: 1 - sse / syy, sey, seB: sey / Math.sqrt(sxx), seA: sey * Math.sqrt(1 / n + mx * mx / sxx), F: (syy - sse) / (sse / df), df, ssr: syy - sse, sse };
}
const G1 = ev('guests', ONE);
const MEET = fit1(ev('guests', ofType('Meeting')), ev('invoice', ofType('Meeting')));
const LAUNCH = fit1(ev('guests', ofType('Launch')), ev('invoice', ofType('Launch')));
const NEW_GUESTS = 130;

// sheets
const statLabels = [['Count', '=COUNT(B2:B232)', 'general'], ['Mean', '=AVERAGE(B2:B232)'], ['Standard error', '=STDEV.S(B2:B232)/SQRT(COUNT(B2:B232))'],
  ['Median', '=MEDIAN(B2:B232)'], ['Mode', '=MODE.SNGL(B2:B232)'], ['SD (sample)', '=STDEV.S(B2:B232)'], ['SD (population)', '=STDEV.P(B2:B232)'],
  ['Q1 (.INC)', '=QUARTILE.INC(B2:B232,1)'], ['Q1 (.EXC)', '=QUARTILE.EXC(B2:B232,1)'], ['Q3 (.INC)', '=QUARTILE.INC(B2:B232,3)'],
  ['90th percentile', '=PERCENTILE.INC(B2:B232,0.9)'], ['Minimum', '=MIN(B2:B232)'], ['Maximum', '=MAX(B2:B232)'], ['Sum', '=SUM(B2:B232)'],
  ['Skewness', '=SKEW(B2:B232)', '0.00'], ['Kurtosis', '=KURT(B2:B232)', '0.00'], ['Confidence level (95%)', '=CONFIDENCE.T(0.05,STDEV.S(B2:B232),COUNT(B2:B232))']];
const statFormats = Object.fromEntries(statLabels.map((x, i) => [`D${i + 2}`, x[2]]).filter((x) => x[1]));
const statSheet = {
  cells: {
    ...tableCells(ORDER_COLUMNS, ORDERS, { cols: ['order_id', 'order_total'] }).cells,
    C1: 'Statistic', D1: 'Value', E1: 'Bin up to', F1: 'Orders',
    ...Object.fromEntries(statLabels.flatMap(([l, f], i) => [[`C${i + 2}`, l], [`D${i + 2}`, f]])),
    E2: 20, E3: 40, E4: 60, E5: 80, E6: 100, E7: 'above 100', F2: '=FREQUENCY(B2:B232,E2:E6)',
  },
};
const launch = sheetOf(ofType('Launch'), ['event_id', 'guests', 'invoice']);
const meetingsInv = sheetOf(ofType('Meeting'), ['event_id', 'invoice'], { D1: 'Over', E1: 'Up to', F1: 'Events', D2: 0, D3: 400, D4: 600, D5: 800, E2: 400, E3: 600, E4: 800, E5: 1000 });
const meetings = sheetOf(ofType('Meeting'), ['event_id', 'guests', 'invoice'], { E1: 'Result' });
const teamDay = sheetOf(ofType('Team day'), ['event_id', 'guests', 'invoice'], { E1: 'IQR' });
const teamBins = sheetOf(ofType('Team day'), ['event_id', 'guests', 'invoice'], { E1: 'Bin up to', F1: 'Events', E2: 700, E3: 900, E4: 1100, E5: 'above 1100' });
const oneDay = sheetOf(ONE, ['event_id', 'guests', 'invoice'], { E1: 'Guests', E2: NEW_GUESTS, F1: 'Predicted invoice' });
const launchFit = sheetOf(ofType('Launch'), ['event_id', 'guests', 'invoice'], { E1: 'LINEST: slope', F1: 'intercept' });

export const widgets = {
  'ds-orders': {
    type: 'distribution',
    values: TOT,
    label: 'Order total, spring 2026 ($)',
    transforms: ['none', 'log'],
    rules: ['iqr', 'mad'],
    closed: 'right',
    edges: [20, 40, 60, 80, 100],
  },
  'ds-sheet': {
    type: 'sheet',
    title: 'Lantern’s 231 spring order totals with live statistics and a FREQUENCY table',
    sheet: statSheet,
    view: 'A1:F232',
    maxHeight: '24rem',
    formats: { B: '$#,##0.00', D: '$#,##0.00', ...statFormats, E: '$#,##0' },
    widths: { C: 20, E: 11 },
    tools: ['formulas', 'reset'],
    note: 'Row 145 holds LC-10144, the $1,512.00 office order. Change it to 151.2 (as if it had been 12 bags) and compare, as the challenging example does: the mean, the standard error, the standard deviations, the confidence level, the maximum, the skewness and the kurtosis all move a long way; the median, the quartiles (by either method) and the mode don’t move, and nor do the FREQUENCY counts, because $151.20 is still above $100. F2 holds one FREQUENCY formula that spills into F2:F7, one count per bin and one for orders above $100.',
  },
  'ds-reg': {
    type: 'regression',
    title: 'Regression of invoice on guests: Lantern’s 75 one-day catering events, 2026',
    y: { name: 'invoice', values: ev('invoice', ONE) },
    xs: [{ name: 'guests', values: ev('guests', ONE) }],
    picked: [0],
    format: { y: 'money' },
    note: 'Input Y Range: invoice; Input X Range: guests; Labels ticked. Compare R Square with the square of CORREL, the guests coefficient with SLOPE, the Intercept with INTERCEPT, and the Standard Error with the typical vertical distance of the points from the line. The two-day conference is not included.',
  },
  'ds-reg-all': {
    type: 'regression',
    title: 'The same regression with the two-day conference included: all 76 events',
    y: { name: 'invoice', values: ev('invoice', EVENTS) },
    xs: [{ name: 'guests', values: ev('guests', EVENTS) }],
    picked: [0],
    format: { y: 'money' },
    note: `One event, Meridian Partners’ two-day conference (263 guests, $4,200), raises the slope from about ${usd(C1.b)} to about ${usd(RA.coefs.guests.b)} a guest, turns the intercept negative, lowers R Square from ${RS.r2.toFixed(3)} to ${RA.r2.toFixed(3)} and almost triples the Standard Error (${usd(RS.se)} to ${usd(RA.se)}). The conference is priced day by day and lies beyond the largest one-day event, so the one-day line describes the one-day business better.`,
  },
};

export const guided = [
  {
    id: 'b03-ds-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lantern’s 11 product-launch events of 2026 are in A2:C12 (event, guests, invoice). Describe their invoices.',
    solution: 'Median <x>=MEDIAN(C2:C12)</x> = $790, the 6th of 11 sorted invoices. Sample standard deviation <x>=STDEV.S(C2:C12)</x> ≈ $230.52. The 11 launches stand for Ana’s launch catering in general, so the sample version (divide by n − 1 = 10) is the right one; STDEV.P would give about $219.79.',
    steps: [
      {
        id: 'b03-ds-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the median invoice.',
        sheet: { cells: { ...launch.cells, D2: 'Median', D3: 'Standard deviation' } },
        cell: 'E2', answer: '=MEDIAN(C2:C12)',
        alt: ['=QUARTILE.INC(C2:C12,2)', '=PERCENTILE.INC(C2:C12,0.5)'],
        view: 'A1:E12', formats: { C: '$#,##0', E: '$#,##0.00' }, widths: { D: 18 },
        wrong: [
          { formula: '=AVERAGE(C2:C12)', say: 'That is the mean. For these 11 launches it happens to equal the median ($790), but not when the invoices change: the median is the middle value once sorted, MEDIAN.' },
          { formula: '=MEDIAN(B2:B12)', say: 'Column B holds the guests. The invoices are in C2:C12.' },
        ],
        hints: ['The median is the middle value of the sorted invoices.', 'Use MEDIAN on the invoice column, C2:C12.'],
      },
      {
        id: 'b03-ds-g1-s2', type: 'formula',
        prompt: 'In E3, calculate the sample standard deviation of the invoices.',
        sheet: { cells: { ...launch.cells, D2: 'Median', D3: 'Standard deviation', E2: '=MEDIAN(C2:C12)' } },
        cell: 'E3', answer: '=STDEV.S(C2:C12)',
        alt: ['=STDEV(C2:C12)', '=SQRT(VAR.S(C2:C12))'],
        view: 'A1:E12', formats: { C: '$#,##0', E: '$#,##0.00' }, widths: { D: 18 },
        wrong: [
          { formula: '=STDEV.P(C2:C12)', say: 'STDEV.P divides by n, treating the 11 launches as the whole population. They are a sample of Ana’s launch events, so use STDEV.S, which divides by n − 1.' },
          { formula: '=VAR.S(C2:C12)', say: 'VAR.S is the variance, the standard deviation squared, in dollars squared. Take STDEV.S instead.' },
        ],
        hints: ['Sample, not population: the function ends in .S.', '<x>=STDEV.S(C2:C12)</x>'],
      },
      {
        id: 'b03-ds-g1-s3', type: 'mc',
        prompt: 'Why is STDEV.S, not STDEV.P, the right choice here?',
        options: [
      'The 11 launches stand for Ana’s launch catering in general, so they are a sample: STDEV.S divides by n − 1.',
      'STDEV.S always gives the larger of the two answers, so it is the cautious, conservative choice to report to Ana.',
      'STDEV.P only works on 30 or more values, and with 11 launches Excel would return an error.',
      'STDEV.S leaves out the largest and smallest invoices, which makes it less sensitive to extreme events.',
    ],
        answer: 0,
        hints: ['Ask whether the 11 rows are everything you want to describe, or a sample of something larger.'],
        feedback: {
          1: 'It is slightly larger, but that is a consequence, not the reason. The choice depends on whether the data are a sample or the whole population.',
          2: 'STDEV.P works on any number of values. The question is what the values represent.',
          3: 'Both functions use every value; they differ only in dividing by n − 1 or n.',
        },
      },
    ],
  },
  {
    id: 'b03-ds-g2', type: 'formula', kind: 'numerical',
    prompt: 'Ana wants a histogram of her 28 meeting invoices (B2:B29). D2:E5 hold the bins: over D, up to E. In F2, count the invoices above the bin’s lower edge and up to and including its upper edge, the rule FREQUENCY uses, and fill down to F5.',
    sheet: { ...meetingsInv, fixed: ['D2:E5'] },
    cell: 'F2', fill: 'F2:F5', answer: '=COUNTIFS($B$2:$B$29,">"&D2,$B$2:$B$29,"<="&E2)',
    alt: ['=COUNTIFS($B$2:$B$29,"<="&E2)-COUNTIFS($B$2:$B$29,"<="&D2)', '=COUNTIFS($B$2:$B$29,"<="&E2,$B$2:$B$29,">"&D2)'],
    view: 'A1:F29', maxHeight: '20rem',
    formats: { B: '$#,##0', D: '$#,##0', E: '$#,##0' },
    widths: { A: 10 },
    wrong: [
      { formula: '=COUNTIFS($B$2:$B$29,">="&D2,$B$2:$B$29,"<"&E2)', say: 'That includes the lower edge and excludes the upper one, so the four $800 meetings move from the $600–$800 bin to the next. Excel’s bins are above the lower edge and up to the upper: <x>">"&D2</x> and <x>"<="&E2</x>.' },
      { formula: '=COUNTIFS(B2:B29,">"&D2,B2:B29,"<="&E2)', say: 'Without <code>$</code> the data range slides down as you fill, so each bin misses the first meetings. Lock it: <code>$B$2:$B$29</code>.' },
      { formula: '=COUNTIF($B$2:$B$29,"<="&E2)', say: 'That counts everything up to the upper edge, a running (cumulative) total. Add the second condition, above the lower edge.' },
    ],
    hints: [
      'Two conditions on the same range: greater than the lower edge in D, and less than or equal to the upper edge in E. COUNTIFS takes range, criterion pairs.',
      'Join the operator to the cell with &: <x>">"&D2</x>. Lock the data range with <code>$</code> so it doesn’t move when you fill.',
    ],
    solution: '<x>=COUNTIFS($B$2:$B$29,">"&D2,$B$2:$B$29,"<="&E2)</x> filled down gives 2, 11, 10 and 5 meetings (28 in all). <x>=FREQUENCY(B2:B29,E2:E5)</x> returns the same four counts plus a fifth, 0, for invoices above $1,000.',
  },
  {
    id: 'b03-ds-g3', type: 'formula', kind: 'numerical',
    prompt: 'For the 28 meetings (guests in B2:B29, invoices in C2:C29), calculate in E2 the slope of the least-squares line of invoice on guests: the dollars added to the invoice per extra guest.',
    sheet: meetings,
    cell: 'E2', answer: '=SLOPE(C2:C29,B2:B29)',
    alt: ['=COVARIANCE.S(B2:B29,C2:C29)/VAR.S(B2:B29)', '=CORREL(B2:B29,C2:C29)*STDEV.S(C2:C29)/STDEV.S(B2:B29)'],
    view: 'A1:E29', maxHeight: '20rem',
    formats: { C: '$#,##0', E: '0.0000' },
    wrong: [
      { formula: '=SLOPE(B2:B29,C2:C29)', say: 'SLOPE takes known_y’s first. With the invoices second you get the slope of guests on invoice, guests per dollar. Put C2:C29 first.' },
      { formula: '=INTERCEPT(C2:C29,B2:B29)', say: 'INTERCEPT gives the predicted invoice at 0 guests. The dollars per extra guest are the slope.' },
      { formula: '=CORREL(B2:B29,C2:C29)', say: 'CORREL measures how closely the points follow a line, from −1 to 1; it has no units. The slope is in dollars per guest: SLOPE.' },
    ],
    hints: [
      'SLOPE(known_y’s, known_x’s): y is what you predict (the invoice), x what you predict it from (guests).',
      '<x>=SLOPE(C2:C29,B2:B29)</x>',
    ],
    solution: `<x>=SLOPE(C2:C29,B2:B29)</x> ≈ ${MEET.b.toFixed(4)}: across these 28 meetings, each extra guest went with about ${usd(MEET.b)} more on the invoice. Swapping the ranges gives the slope of guests on invoice, a different line.`,
  },
  {
    id: 'b03-ds-g4', type: 'mc', kind: 'applied',
    prompt: `Ana’s Regression output for the 75 one-day events shows R Square ${RS.r2.toFixed(3)} and Significance F ${sci(RS.pF)}. Which conclusion does it support?`,
    options: [
      `A clear linear relationship: the line accounts for about ${Math.round(RS.r2 * 100)}% of the variation in these invoices.`,
      `About ${Math.round(RS.r2 * 100)}% of the line’s predictions for future events will land within a few dollars of the actual invoice.`,
      `The number of guests causes about ${Math.round(RS.r2 * 100)}% of the amount on each invoice, and other factors the rest.`,
      `There is a probability of only ${sci(RS.pF)} that the regression line is wrong for these events.`,
    ],
    answer: 0,
    hints: [
      'R Square describes how much of the past variation in y the line accounts for.',
      'Significance F is a p-value: how likely a slope this far from 0 would be if there were no linear relationship.',
    ],
    feedback: {
      1: `R² is not predictive accuracy. The typical miss is the Standard Error, about ${usd(RS.se, 0)}, and only new events show how well the line predicts.`,
      2: 'R² describes association in past data, not causation, and it isn’t a share of each invoice. Hours, pastries and bespoke changes also affect invoices.',
      3: 'A p-value is not the probability that a model is wrong. It is the probability of so strong a slope if the true slope were 0.',
    },
    solution: `R Square ${RS.r2.toFixed(3)} says ${(RS.r2 * 100).toFixed(1)}% of the variation in these 75 invoices around their mean lines up with guests. Significance F, ${sci(RS.pF)}, says a slope this strong would essentially never arise if guests had no linear relationship with invoice. Neither number measures future accuracy or proves causation.`,
  },
];

export const independent = [
  {
    id: 'b03-ds-i1', type: 'formula', kind: 'numerical',
    prompt: 'Lantern’s 11 team-day events are in A2:C12. In E2, calculate the interquartile range of the invoices with Excel’s inclusive quartiles, in one formula.',
    sheet: teamDay,
    cell: 'E2', answer: '=QUARTILE.INC(C2:C12,3)-QUARTILE.INC(C2:C12,1)',
    alt: ['=PERCENTILE.INC(C2:C12,0.75)-PERCENTILE.INC(C2:C12,0.25)', '=QUARTILE(C2:C12,3)-QUARTILE(C2:C12,1)'],
    view: 'A1:E12',
    formats: { C: '$#,##0', E: '$#,##0.00' },
    wrong: [
      { formula: '=QUARTILE.EXC(C2:C12,3)-QUARTILE.EXC(C2:C12,1)', say: 'That uses the exclusive method, positions (n + 1)p, and gives $410. The question asks for the inclusive quartiles, QUARTILE.INC.' },
      { formula: '=QUARTILE.INC(C2:C12,1)-QUARTILE.INC(C2:C12,3)', say: 'The IQR is Q3 − Q1, which is never negative. Swap the two.' },
      { formula: '=MAX(C2:C12)-MIN(C2:C12)', say: 'That is the range, which depends on the two extremes. The IQR is the width of the middle half: Q3 − Q1.' },
    ],
    solution: '<x>=QUARTILE.INC(C2:C12,3)-QUARTILE.INC(C2:C12,1)</x> = $980 − $620 = $360. With n = 11, the inclusive quartiles sit at positions 3.5 and 8.5 of the sorted invoices. The exclusive method (positions 3 and 9) gives $990 − $580 = $410.',
  },
  {
    id: 'b03-ds-i2', type: 'formula', kind: 'numerical',
    prompt: 'For Lantern’s 11 launch events (guests in B2:B12, invoices in C2:C12), return the regression of invoice on guests with its statistics in one formula in E2: LINEST with stats set to TRUE. It spills into E2:F6, as the In depth section describes.',
    sheet: launchFit,
    cell: 'E2', answer: '=LINEST(C2:C12,B2:B12,TRUE,TRUE)',
    alt: ['=LINEST(C2:C12,B2:B12,1,1)'],
    require: ['LINEST'],
    view: 'A1:F12',
    formats: { C: '$#,##0', E: '0.0000', F: '0.0000' },
    widths: { E: 13, F: 13 },
    wrong: [
      { formula: '=LINEST(B2:B12,C2:C12,TRUE,TRUE)', say: 'LINEST takes known_y’s first: the invoices, C2:C12, then the guests.' },
      { formula: '=LINEST(C2:C12,B2:B12)', say: 'Without the fourth argument LINEST returns only the slope and intercept (one row). Set stats to TRUE for the five rows of statistics.' },
      { formula: '=LINEST(C2:C12,B2:B12,FALSE,TRUE)', say: 'The third argument, const, set to FALSE forces the line through the origin: the intercept becomes 0 and every statistic changes. Leave const TRUE and set the fourth argument, stats, to TRUE.' },
    ],
    solution: `<x>=LINEST(C2:C12,B2:B12,TRUE,TRUE)</x> spills five rows by two columns: slope ${LAUNCH.b.toFixed(4)} and intercept ${LAUNCH.a.toFixed(2)}; their standard errors ${LAUNCH.seB.toFixed(4)} and ${LAUNCH.seA.toFixed(2)}; R² ${LAUNCH.r2.toFixed(4)} and the standard error of the estimate ${LAUNCH.sey.toFixed(2)}; F ${LAUNCH.F.toFixed(1)} and ${LAUNCH.df} residual degrees of freedom; the regression and residual sums of squares. These are the numbers the ToolPak’s Regression output prints, in a different layout.`,
  },
  {
    id: 'b03-ds-i3', type: 'formula', kind: 'applied',
    prompt: 'Count Lantern’s 11 team-day invoices (C2:C12) into the bins in E2:E4 with one FREQUENCY formula in F2. It spills into F2:F5, the last cell counting invoices above $1,100.',
    sheet: { ...teamBins, fixed: ['E2:E4'] },
    cell: 'F2', answer: '=FREQUENCY(C2:C12,E2:E4)',
    require: ['FREQUENCY'],
    view: 'A1:F12',
    formats: { C: '$#,##0', E: '$#,##0' },
    widths: { E: 11 },
    wrong: [
      { formula: '=FREQUENCY(C2:C11,E2:E4)', say: 'The data range stops at C11 and leaves out the last team day (row 12). Use C2:C12.' },
      { formula: '=FREQUENCY(E2:E4,C2:C12)', say: 'The arguments are the wrong way round: FREQUENCY(data_array, bins_array). The invoices come first.' },
    ],
    solution: '<x>=FREQUENCY(C2:C12,E2:E4)</x> spills four counts: 5 invoices up to $700 (including the one of exactly $700), 1 over $700 to $900, 4 over $900 to $1,100 and 1 above $1,100. Four counts for three bins: FREQUENCY always returns one more than the number of bins. In Excel 2019 and earlier, select F2:F5, type the formula and press Ctrl+Shift+Enter (on Windows).',
  },
  {
    id: 'b03-ds-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Match each line of the Analysis ToolPak’s Descriptive Statistics report to what it is.',
    items: ['Standard Error', 'Kurtosis', 'Skewness', 'Confidence Level(95.0%)', 'Sample Variance', 'Range'],
    categories: ['Standard deviation ÷ √n', 'Excess kurtosis: about 0 for normal data', 'Asymmetry: positive for a long right tail', 'Half-width of a 95% interval for the mean', 'The standard deviation squared', 'Maximum minus minimum'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      0: 'Here “Standard Error” is the standard error of the mean, s ÷ √n, not the standard deviation of the data.',
      3: 'The Confidence Level line is a margin in the data’s units (t × standard error), not a percentage.',
    },
    solution: 'Standard Error = STDEV.S ÷ √COUNT. Kurtosis = KURT, excess kurtosis. Skewness = SKEW. Confidence Level(95.0%) = t × standard error, so mean ± this value is a 95% confidence interval. Sample Variance = VAR.S. Range = MAX − MIN.',
  },
  {
    id: 'b03-ds-i5', type: 'mc', kind: 'conceptual',
    prompt: 'In which case is STDEV.P, rather than STDEV.S, the right function?',
    options: [
      'A shop with exactly eight employees describes how much their hourly wages vary, and generalises no further.',
      'Ana times 40 of Saturday’s packed orders to estimate how long packing an order usually takes her.',
      'A survey of 60 customers is used to describe how satisfied all of Lantern’s customers are with its delivery times.',
      'A bakery weighs 12 loaves taken from a batch of 2,000 to check the batch’s average and spread of weight.',
    ],
    answer: 0,
    feedback: {
      1: 'The 40 orders stand for packing in general: a sample, so STDEV.S.',
      2: 'Sixty surveyed customers are a sample of all the customers: STDEV.S.',
      3: '12 loaves are a sample of the batch: STDEV.S.',
    },
    solution: 'STDEV.P is for data that are the entire population you describe, with no generalising beyond it: all eight employees, and only them. In the other cases the rows are a sample used to describe something larger, so STDEV.S, which divides by n − 1, is the right estimate.',
  },
  {
    id: 'b03-ds-i6', type: 'multi', kind: 'applied',
    prompt: `Ana’s Regression output for the 75 one-day events: Intercept ${sig(C0.b)}, guests ${sig(C1.b)} (Lower 95% ${sig(C1.low)}, Upper 95% ${sig(C1.high)}), R Square ${sig(RS.r2)}, Standard Error ${sig(RS.se)}; guests ranged from ${Math.min(...G1)} to ${Math.max(...G1)}. Select all the statements the output supports.`,
    options: [
      `On these events, each extra guest went with about ${usd(C1.b)} more on the invoice, on average.`,
      `A typical invoice was about ${usd(RS.se, 0)} away from the line.`,
      'The 95% interval for the slope doesn’t include 0.',
      `Ana’s setup charge for an event is ${usd(C0.b)}.`,
      'The line predicts the invoice for a 400-guest festival as well as for a 100-guest meeting.',
      `Because R Square is ${RS.r2.toFixed(3)}, predictions will be within ${((1 - RS.r2) * 100).toFixed(1)}% of the actual invoice.`,
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The intercept is the predicted invoice at 0 guests, an extrapolation far below the smallest event. It absorbs everything the line leaves out.',
      4: `400 guests is far beyond the largest event in the data (${Math.max(...G1)}): an extrapolation, with no evidence the line still holds.`,
      5: `R² is not a percentage error. The Standard Error, about ${usd(RS.se, 0)}, describes the typical miss.`,
    },
    solution: `Supported: the slope, ${usd(C1.b)} a guest; the standard error, a typical miss of about ${usd(RS.se, 0)}; and the 95% interval for the slope, ${usd(C1.low)} to ${usd(C1.high)}, which excludes 0. Not supported: reading the intercept as a setup charge, predicting far outside ${Math.min(...G1)}–${Math.max(...G1)} guests, and treating R² as a measure of prediction error.`,
  },
];

export const check = [
  {
    id: 'b03-ds-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Excel’s KURT returns 0.05 for a column of delivery times. What does that tell you?',
    options: [
      'Its tails are about as heavy as a normal distribution’s, because KURT reports excess kurtosis.',
      'The delivery times are almost perfectly symmetric around their mean, with no long tail either way.',
      'The delivery times hardly vary at all: almost every delivery takes about the same time.',
      'The distribution has a very sharp peak and extremely heavy tails compared with a normal one.',
    ],
    answer: 0,
    feedback: {
      1: 'Symmetry is measured by skewness (SKEW). Kurtosis is about the tails.',
      2: 'Spread is measured by the standard deviation. KURT is scaled by it and says nothing about its size.',
      3: 'Heavy tails would show as a large positive KURT. Excel subtracts the normal distribution’s value, so near 0 means normal-like tails.',
    },
    solution: 'KURT subtracts a term so that normally distributed data give about 0: it reports excess kurtosis. A value of 0.05 means tails about as heavy as a normal distribution’s. By the NIST handbook’s convention (kurtosis without the subtraction) the same data would give about 3.',
  },
  {
    id: 'b03-ds-k2', type: 'formula', kind: 'numerical',
    prompt: 'In E2, calculate the correlation coefficient between guests (B2:B29) and invoice (C2:C29) for Lantern’s 28 meetings.',
    sheet: meetings,
    cell: 'E2', answer: '=CORREL(B2:B29,C2:C29)',
    alt: ['=CORREL(C2:C29,B2:B29)', '=PEARSON(B2:B29,C2:C29)'],
    view: 'A1:E29', maxHeight: '20rem',
    formats: { C: '$#,##0', E: '0.0000' },
    wrong: [
      { formula: '=RSQ(C2:C29,B2:B29)', say: 'RSQ returns r², the square of the correlation coefficient. CORREL returns r itself.' },
      { formula: '=SLOPE(C2:C29,B2:B29)', say: 'SLOPE gives dollars per guest. The correlation coefficient has no units and lies between −1 and 1: CORREL.' },
    ],
    solution: `<x>=CORREL(B2:B29,C2:C29)</x> ≈ ${MEET.r.toFixed(4)}, a strong positive linear relationship. The order of the two ranges doesn’t matter for CORREL; its square, ${(MEET.r ** 2).toFixed(3)}, is what RSQ returns.`,
  },
  {
    id: 'b03-ds-k3', type: 'num', kind: 'numerical',
    prompt: `From the Regression output for the 75 one-day events (Intercept ${sig(C0.b)}, guests ${sig(C1.b)}), what invoice does the line predict for a one-day event with 60 guests? Give dollars to the cent.`,
    answer: Math.round((P0 + P1 * 60) * 100) / 100, check: () => C0.b + C1.b * 60, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: Math.round(P1 * 60 * 100) / 100, say: 'You left out the intercept. The prediction is intercept + slope × guests.' },
      { value: Math.round((P0 * 60 + P1) * 100) / 100, say: 'You multiplied the intercept by 60. The slope multiplies the guests; the intercept is added once.' },
    ],
    solution: `ŷ = ${P0} + ${P1} × 60 = ${P0} + ${(P1 * 60).toFixed(3)} ≈ ${usd(P0 + P1 * 60)}. Sixty guests lies inside the data’s range (${Math.min(...G1)} to ${Math.max(...G1)}), so this is an interpolation; actual invoices at that size have typically been about ${usd(RS.se, 0)} either side of the line.`,
  },
  {
    id: 'b03-ds-k4', type: 'mc', kind: 'conceptual',
    prompt: 'A bike-repair shop (fictional) regresses the invoice on minutes of labour for 200 repairs, all between 15 and 240 minutes. The intercept is $18.40. What is the right reading?',
    options: [
      'It is the line’s value at 0 minutes, outside the data: it anchors the line and needn’t be a charge.',
      'Every repair includes a fixed charge of $18.40, which the shop adds before charging for labour time.',
      'A repair that needs no labour at all would cost a customer $18.40 on average, according to the shop’s data.',
      'The intercept is the average invoice of the 200 repairs, the point where the line crosses the y-axis.',
    ],
    answer: 0,
    feedback: {
      1: 'The line doesn’t know the shop’s price list. A fixed charge may exist, but no repair in the data had fewer than 15 minutes, so the intercept is an extrapolation.',
      2: 'No repair in the data had 0 minutes, so the data say nothing directly about one.',
      3: 'The average invoice is ȳ; the line passes through (x̄, ȳ), not through (0, ȳ).',
    },
    solution: 'The intercept is the predicted invoice at 0 minutes, well outside the 15–240 minutes in the data. It fixes the height of the line within the data’s range; reading it as a fixed fee, or predicting a no-labour job, extrapolates beyond what the data can support.',
  },
  {
    id: 'b03-ds-k5', type: 'formula', kind: 'applied',
    prompt: 'A new client asks Ana for a rough estimate for a one-day event with the number of guests in E2. Using the 75 one-day events (guests in B2:B76, invoices in C2:C76), calculate in F2 the invoice the least-squares line predicts.',
    sheet: oneDay,
    cell: 'F2', answer: '=FORECAST.LINEAR(E2,C2:C76,B2:B76)',
    alt: ['=FORECAST(E2,C2:C76,B2:B76)', '=INTERCEPT(C2:C76,B2:B76)+SLOPE(C2:C76,B2:B76)*E2', '=TREND(C2:C76,B2:B76,E2)'],
    view: 'A1:F76', maxHeight: '20rem',
    formats: { C: '$#,##0', F: '$#,##0.00' },
    widths: { F: 16 },
    wrong: [
      { formula: '=FORECAST.LINEAR(E2,B2:B76,C2:C76)', say: 'FORECAST.LINEAR(x, known_y’s, known_x’s): the invoices are the y’s and come first.' },
      { formula: `=FORECAST.LINEAR(${NEW_GUESTS},C2:C76,B2:B76)`, say: `Point at E2 rather than typing ${NEW_GUESTS}, so the estimate updates when the client changes the number of guests.` },
      { formula: '=SLOPE(C2:C76,B2:B76)*E2', say: 'That leaves out the intercept. The line is intercept + slope × guests.' },
      { formula: `=${P0}+${P1}*E2`, say: 'The typed coefficients are rounded and don’t update; calculate them from the cells (FORECAST.LINEAR, or INTERCEPT + SLOPE).' },
    ],
    solution: `<x>=FORECAST.LINEAR(E2,C2:C76,B2:B76)</x> gives about ${usd(C0.b + C1.b * NEW_GUESTS)} for ${NEW_GUESTS} guests, the same as <x>=INTERCEPT(C2:C76,B2:B76)+SLOPE(C2:C76,B2:B76)*E2</x>. It is a rough check, not a quote: the line’s typical miss is about ${usd(RS.se, 0)}, and it ignores hours and pastries, which Ana’s quote sheet prices separately.`,
  },
  {
    id: 'b03-ds-k6', type: 'num', kind: 'numerical',
    prompt: `In the Coefficients table, the guests row shows Coefficients ${P1} and Standard Error ${PSE1}. What t Stat does Excel print beside them? Give two decimal places.`,
    answer: Math.round((P1 / PSE1) * 100) / 100, check: () => C1.b / C1.se, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round((PSE1 / P1) * 100) / 100, say: 'That is the standard error divided by the coefficient. t Stat = coefficient ÷ standard error.' },
      { value: Math.round(P1 * PSE1 * 100) / 100, say: 'That is the product of the two. t Stat = coefficient ÷ standard error.' },
    ],
    solution: `t Stat = ${P1} ÷ ${PSE1} ≈ ${(P1 / PSE1).toFixed(2)}: the slope is about ${(P1 / PSE1).toFixed(1)} standard errors from 0, which is why its P-value is tiny (${sci(C1.p)}).`,
  },
];
