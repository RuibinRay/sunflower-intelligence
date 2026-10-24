// descriptive-statistics-and-regression.js — B03 · Descriptive statistics and regression in Excel. Content only;
// exercises are in descriptive-statistics-and-regression.ex.js. Uses the spring orders (ORDERS; DERIVED.orderStats,
// withoutBulk, bulk) and the 2026 catering events (EVENTS; DERIVED.regression.simple for the 75 one-day events and
// DERIVED.regression.allEvents with the two-day conference). The multiple regression and the baristas variable are left
// to the project. M01's "about $9 a head" is the case's rule of thumb. Every figure printed is recomputed in `checks`.
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js';
import { tQuantile } from '../../../core/stats.js';

// ---------------------------------------------------------------- statistics, written out as Excel defines them
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const ss = (a) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)); };
const sdS = (a) => Math.sqrt(ss(a) / (a.length - 1));
const sdP = (a) => Math.sqrt(ss(a) / a.length);
const sorted = (a) => [...a].sort((x, y) => x - y);
const inc = (a, p) => { const s = sorted(a), h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
const exc = (a, p) => { const s = sorted(a), h = (s.length + 1) * p, lo = Math.floor(h); return s[lo - 1] + (h - lo) * ((s[lo] ?? s[lo - 1]) - s[lo - 1]); };
const skew = (a) => { const n = a.length, m = mean(a), s = sdS(a); return (n / ((n - 1) * (n - 2))) * sum(a.map((x) => ((x - m) / s) ** 3)); };
const kurt = (a) => { const n = a.length, m = mean(a), s = sdS(a); return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum(a.map((x) => ((x - m) / s) ** 4)) - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3)); };
const freq = (a, edges) => { const c = new Array(edges.length + 1).fill(0); a.forEach((x) => { const k = edges.findIndex((e) => x <= e); c[k < 0 ? edges.length : k] += 1; }); return c; };
const countOf = (a, v) => a.filter((x) => x === v).length;

const TOT = ORDERS.map((r) => r[ORDER_COLUMNS.indexOf('order_total')]);
const NOB = TOT.filter((x) => x !== D.bulk.value);
const n = TOT.length;
const conf = (a) => tQuantile(0.975, a.length - 1) * sdS(a) / Math.sqrt(a.length);
const BINS = [20, 40, 60, 80, 100];
const FREQ = freq(TOT, BINS);
const e = (name, rows = EVENTS) => rows.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const BREAKFAST = e('invoice', EVENTS.filter((r) => r[3] === 'Breakfast'));
const ONE = EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('days')] === 1);
const G1 = e('guests', ONE), V1 = e('invoice', ONE);
const CONF = EVENTS.find((r) => r[EVENT_COLUMNS.indexOf('days')] === 2);
const RS = D.regression.simple, RA = D.regression.allEvents;
const b0 = RS.coefs.Intercept.b, b1 = RS.coefs.guests.b;
const pred = (x) => b0 + b1 * x;
const mx = mean(G1), my = mean(V1);
const sxy = sum(G1.map((x, i) => (x - mx) * (V1[i] - my))), sxx = ss(G1), syy = ss(V1);
const r = sxy / Math.sqrt(sxx * syy);
const ssr = RS.sst - RS.sse;
const t73 = tQuantile(0.975, RS.n - 2);
const PER_HEAD = 9;                                   // M01: "about $9 a head"
const cross = b0 / (PER_HEAD - b1);

// ---------------------------------------------------------------- figures
const f1 = (x) => Math.round(x * 10) / 10;
function binFigure() {
  const X = (v) => 60 + v * 4.4, y = 120;
  let s = '<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += `<line x1="${X(0)}" x2="${X(124)}" y1="${y}" y2="${y}" stroke="var(--ink)" stroke-width="1.2"/>`;
  [0, 20, 40, 60, 80, 100].forEach((v) => { s += `<line x1="${X(v)}" x2="${X(v)}" y1="${y - 6}" y2="${y + 6}" stroke="var(--ink)" stroke-width="1.2"/><text x="${X(v)}" y="${y + 22}" text-anchor="middle" font-size="11" fill="var(--ink-3)">$${v}</text>`; });
  const labels = ['up to $20', 'over $20 to $40', 'over $40 to $60', 'over $60 to $80', 'over $80 to $100'];
  BINS.forEach((hi, i) => {
    const lo = i ? BINS[i - 1] : 0, xm = (X(lo) + X(hi)) / 2;
    s += `<line x1="${X(lo) + 7.5}" x2="${X(hi) - 4}" y1="${y - 26}" y2="${y - 26}" stroke="var(--series-1)" stroke-width="2"/>`;
    s += `<circle cx="${X(lo) + 4}" cy="${y - 26}" r="3.5" fill="none" stroke="var(--series-1)" stroke-width="1.6"/><circle cx="${X(hi) - 4}" cy="${y - 26}" r="3.5" fill="var(--series-1)"/>`;
    s += `<text x="${f1(xm)}" y="${y - 50}" text-anchor="middle" font-size="12">${FREQ[i]}</text><text x="${f1(xm)}" y="${y - 36}" text-anchor="middle" font-size="9.5" fill="var(--ink-3)">${labels[i]}</text>`;
  });
  s += `<line x1="${X(100) + 7.5}" x2="${X(124)}" y1="${y - 26}" y2="${y - 26}" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="${X(100) + 4}" cy="${y - 26}" r="3.5" fill="none" stroke="var(--series-2)" stroke-width="1.6"/>`;
  s += `<text x="${f1(X(112))}" y="${y - 50}" text-anchor="middle" font-size="12">${FREQ[5]}</text><text x="${f1(X(112))}" y="${y - 36}" text-anchor="middle" font-size="9.5" fill="var(--ink-3)">over $100</text>`;
  s += `<text x="${X(20)}" y="${y + 44}" text-anchor="middle" font-size="11">an order of exactly $20.00 counts in “up to $20”</text>`;
  s += `<text x="320" y="16" text-anchor="middle" font-size="12">FREQUENCY(order totals, {20; 40; 60; 80; 100}): ${FREQ.length} counts</text>`;
  return `${s}</svg>`;
}
function lineFigure() {
  const W = 640, H = 300, L = 70, Rr = 620, T = 20, B = 250;
  const x = (v) => L + (v / 280) * (Rr - L), y = (v) => B - (v / 4400) * (B - T);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  const gMin = Math.min(...G1), gMax = Math.max(...G1);
  s += `<rect x="${f1(x(gMin))}" y="${T}" width="${f1(x(gMax) - x(gMin))}" height="${B - T}" fill="var(--series-2)" opacity="0.12"/>`;
  s += `<text x="${f1(x(gMin)) + 6}" y="${T + 14}" font-size="11" fill="var(--ink-3)">one-day events: ${gMin} to ${gMax} guests</text>`;
  [0, 1000, 2000, 3000, 4000].forEach((t) => { s += `<line x1="${L}" x2="${Rr}" y1="${f1(y(t))}" y2="${f1(y(t))}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="${L - 6}" y="${f1(y(t)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">$${t.toLocaleString('en-US')}</text>`; });
  [0, 50, 100, 150, 200, 250].forEach((t) => { s += `<text x="${f1(x(t))}" y="${B + 16}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${t}</text>`; });
  s += `<line x1="${L}" x2="${Rr}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/>`;
  s += `<line x1="${f1(x(0))}" y1="${f1(y(pred(0)))}" x2="${f1(x(gMin))}" y2="${f1(y(pred(gMin)))}" stroke="var(--series-1)" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += `<line x1="${f1(x(gMin))}" y1="${f1(y(pred(gMin)))}" x2="${f1(x(gMax))}" y2="${f1(y(pred(gMax)))}" stroke="var(--series-1)" stroke-width="2.6"/>`;
  s += `<line x1="${f1(x(gMax))}" y1="${f1(y(pred(gMax)))}" x2="${f1(x(270))}" y2="${f1(y(pred(270)))}" stroke="var(--series-1)" stroke-width="2" stroke-dasharray="5 4"/>`;
  G1.forEach((g, i) => { s += `<circle cx="${f1(x(g))}" cy="${f1(y(V1[i]))}" r="3.2" fill="var(--ink)" opacity="0.75"/>`; });
  const cg = CONF[EVENT_COLUMNS.indexOf('guests')], cv = CONF[EVENT_COLUMNS.indexOf('invoice')];
  s += `<rect x="${f1(x(cg)) - 5}" y="${f1(y(cv)) - 5}" width="10" height="10" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`;
  s += `<text x="${f1(x(cg)) + 6}" y="${f1(y(cv)) + 22}" text-anchor="end" font-size="11">two-day conference: ${cg} guests, $${cv.toLocaleString('en-US')}</text>`;
  s += `<text x="${L + 6}" y="166" font-size="11">intercept $${Math.round(b0)} at 0 guests: outside the data</text>`;
  s += `<line x1="${L + 8}" y1="170" x2="${L + 2}" y2="${f1(y(pred(0))) - 3}" stroke="var(--ink-3)" stroke-width="1"/>`;
  s += `<text x="${(L + Rr) / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Guests</text>`;
  s += `<text x="16" y="${(T + B) / 2}" font-size="11" fill="var(--ink-3)" transform="rotate(-90 16 ${(T + B) / 2})" text-anchor="middle">Invoice</text>`;
  return `${s}</svg>`;
}

const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sig = (v, k = 6) => String(Number(v.toPrecision(k)));
const tx = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/,/g, '{,}');   // a number inside TeX

export default {
  slug: 'descriptive-statistics-and-regression',
  title: 'Descriptive statistics and regression in Excel',
  blurb: 'Describe a column of numbers with Excel’s statistics functions and the Analysis ToolPak, see what one large order does to the mean and the standard deviation, build a frequency table, and fit a straight line through catering invoices. Then read every line of the ToolPak’s regression output, and say what it does and doesn’t show.',
  status: 'draft',
  objectives: [
    'Calculate the mean, median, mode, standard deviation, variance, quartiles and percentiles of a column with Excel functions, choosing STDEV.S or STDEV.P and the .INC or .EXC quartile deliberately.',
    'Read the Analysis ToolPak’s Descriptive Statistics report and explain what its Standard Error, Kurtosis, Skewness and Confidence Level lines measure.',
    'Build a frequency table with FREQUENCY or COUNTIFS, and explain which bin Excel puts a value on a bin edge in.',
    'Explain how one extreme value moves the mean, the standard deviation and a regression line but not the median.',
    'Calculate CORREL, SLOPE, INTERCEPT, RSQ and FORECAST.LINEAR, and add a trendline with its equation and R² to a scatter chart.',
    'Interpret the ToolPak’s Regression output for a simple regression (R Square, Standard Error, Significance F, coefficients, p-values and 95% limits) without claiming more than it shows.',
  ],
  prerequisites: [
    { lesson: 'b01/summarising-data', why: 'The mean, median, quartiles and standard deviation are defined and calculated by hand there.' },
    { lesson: 'b02/outliers', why: 'Why Lantern’s $1,512 office order was kept, and the rules that flag extreme values.' },
    { lesson: 'b01/interpreting-results', why: 'Correlation, causation and confounding are the background for reading a regression.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'COUNTIFS with two criteria builds a frequency table bin by bin.' },
    { lesson: 'b03/charts-and-conditional-formatting', why: 'Histograms and scatter charts, and why a scatter chart (not a line chart) shows a relationship.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana has two questions for the summer. What does a typical spring order look like, now that the 231 orders are clean? And how much does one more guest add to a catering invoice, so that she can quote new clients quickly and check her rule of thumb of “about $9 a head”? Both have answers in Excel, one in a column of statistics and one in a straight line.' },

    { h: 'Describing a column with functions' },
    { p: 'Excel has a function for each summary that B01 calculated by hand. With the order totals in J2:J232 of Lantern’s order sheet, the table below gives each formula and its result. Each function ignores text and blank cells in the range, so a header or a gap doesn’t change the answer.' },
    { table: {
      caption: 'Lantern’s 231 spring order totals (J2:J232) described with Excel functions',
      head: ['Statistic', 'Formula', 'Result'],
      align: ['l', 'l', 'r'],
      rows: [
        ['Count', '<x>=COUNT(J2:J232)</x>', String(n)],
        ['Mean', '<x>=AVERAGE(J2:J232)</x>', money(D.orderStats.mean)],
        ['Median', '<x>=MEDIAN(J2:J232)</x>', money(D.orderStats.median)],
        ['Mode', '<x>=MODE.SNGL(J2:J232)</x>', money(14)],
        ['Standard deviation (sample)', '<x>=STDEV.S(J2:J232)</x>', money(D.orderStats.sd)],
        ['First quartile', '<x>=QUARTILE.INC(J2:J232,1)</x>', money(D.orderStats.q1)],
        ['Third quartile', '<x>=QUARTILE.INC(J2:J232,3)</x>', money(D.orderStats.q3)],
        ['90th percentile', '<x>=PERCENTILE.INC(J2:J232,0.9)</x>', money(inc(TOT, 0.9))],
        ['Minimum and maximum', '<x>=MIN(J2:J232)</x>, <x>=MAX(J2:J232)</x>', `${money(D.orderStats.min)}, ${money(D.orderStats.max)}`],
      ],
    } },
    { p: 'The figures disagree about what is typical. Half the orders are $19.50 or less, and the middle half run from $15.40 to $39.00, yet the mean is $39.38, as high as the third quartile. The mode, $14.00, is the 15 orders of one full-price House Blend 250g bag: the most common single value, but not a summary of spending. The standard deviation, $100.90, is more than twice the mean.' },

    { h: 'One order moves the mean' },
    { p: 'The cause is LC-10144, the genuine office order of 120 bags for $1,512.00, an <g>outlier</g> that B02 kept. Without it the mean of the other 230 orders is $32.97 and their standard deviation is $26.73, while the median stays at $19.50. One order in 231 raises the mean by $6.40 and almost quadruples the standard deviation, because both use every value’s size; the median uses only the order of the values.' },
    { p: 'This is why B01 paired the <g>median</g> with “typical” and the <g>mean</g> with totals. The mean of $39.38 is still the right number for revenue (mean × orders = $9,096.15), and the office order is real revenue. For “what does a typical customer spend?” the median and the quartiles answer better, and a report should say what the mean includes.' },
    { callout: 'key', title: 'Robust and sensitive measures', html: 'The median and the quartiles depend on the order of the values, so one extreme value barely moves them. The mean, the standard deviation, the skewness and a regression line use every value’s size, so one extreme value can move them a long way. Calculate both kinds, and report the one that suits the question.' },

    { h: 'Counting values into bins' },
    { p: 'A histogram needs a frequency table: how many values fall in each interval, or <g>bin</g>. Put the bins’ upper edges in a column, here 20, 40, 60, 80 and 100 in L2:L6, and type <x>=FREQUENCY(J2:J232,L2:L6)</x> in M2. In Excel for Microsoft 365, Excel 2021 and Excel 2024 the result spills into M2:M7: one count per bin plus one more for values above the last edge. Each bin counts values above the previous edge and up to and including its own.' },
    { figure: {
      svg: binFigure(),
      caption: `FREQUENCY’s six counts for the spring orders: ${FREQ.join(', ')}. Each bin is open at its lower edge and closed at its upper edge, so an order of exactly $20.00 counts in the first bin.`,
      alt: `A number line from $0 to beyond $100 with tick marks every $20. Above it, five brackets mark the bins: up to $20 with ${FREQ[0]} orders, over $20 to $40 with ${FREQ[1]}, over $40 to $60 with ${FREQ[2]}, over $60 to $80 with ${FREQ[3]}, and over $80 to $100 with ${FREQ[4]}; a dashed bracket beyond $100 holds ${FREQ[5]} orders. Each bracket has an open circle at its lower edge and a filled circle at its upper edge. A note says an order of exactly $20.00 counts in the up-to-$20 bin.`,
    } },
    { p: `More than half the orders (${FREQ[0]} of ${n}) are $20 or less, and the counts fall away to the right, with a second bump of ${FREQ[4]} orders between $80 and $100 (mostly orders of two 1 kg bags): a <g>right-skewed</g> distribution, in B02’s terms. Excel 2016 and later can draw a histogram directly with Insert &gt; Insert Statistic Chart &gt; Histogram. Left to itself it starts the bins at the smallest value, $12.60; to match the table, set Format Axis to a bin width of 20, an underflow bin of 20 and an overflow bin of 100.` },

    { h: 'A line through the catering invoices' },
    { p: 'For the second question Ana takes her 75 one-day catering events and plots invoice against guests in a scatter chart. The points rise from lower left to upper right in a narrow band. <x>=CORREL(C2:C76,B2:B76)</x>, with guests in B and invoices in C, returns the <g>correlation coefficient</g> r = ' + sig(r, 4) + ': a strong positive linear relationship.' },
    { p: `A <g>regression line</g> summarises the band. Excel’s trendline on the scatter chart shows its equation and R²: y = ${sig(b1, 5)}x + ${sig(b0, 5)}, R² = ${sig(RS.r2, 4)}. The functions give the same numbers to full precision: <x>=SLOPE(C2:C76,B2:B76)</x> returns ${b1.toFixed(4)}, <x>=INTERCEPT(C2:C76,B2:B76)</x> returns ${b0.toFixed(2)}, and <x>=RSQ(C2:C76,B2:B76)</x> returns ${RS.r2.toFixed(4)}. Read it as: on Ana’s past invoices, each extra guest went with about $${b1.toFixed(2)} more on the invoice.` },
    { p: 'The rest of this lesson explains what these numbers mean, how the Analysis ToolPak reports them with their uncertainty, and why the one two-day conference is left out.' },
  ],

  theory: [
    { h: 'Sample or population: STDEV.S and STDEV.P' },
    { p: String.raw`Excel has two standard deviations. STDEV.S assumes the data are a <g>sample</g> and divides the sum of squared deviations by <m>n - 1</m>; STDEV.P treats them as the whole <g>population</g> and divides by <m>n</m>. VAR.S and VAR.P return the corresponding <g>variance</g>, the square of the standard deviation. Microsoft’s rule: if the data represent the entire population, use STDEV.P.` },
    { p: `For Lantern’s 231 orders the difference is small: STDEV.S gives $${D.orderStats.sd.toFixed(2)} and STDEV.P $${sdP(TOT).toFixed(2)}. For the 13 breakfast events it is larger, $${sdS(BREAKFAST).toFixed(2)} against $${sdP(BREAKFAST).toFixed(2)}, because dividing by 12 instead of 13 matters more. In business analysis the data are nearly always a sample of a process that goes on (this spring’s orders stand for orders in general), so STDEV.S is the usual choice; use STDEV.P when the rows are the whole group and you don’t generalise beyond it, such as the salaries of a shop’s eight staff.` },

    { h: 'Quartiles and percentiles: .INC and .EXC' },
    { p: String.raw`QUARTILE.INC and PERCENTILE.INC place the p-th percentile at position <m>1 + (n - 1)p</m> in the sorted values, interpolating between neighbours; B01 and B02 use this method. QUARTILE.EXC and PERCENTILE.EXC use position <m>(n + 1)p</m>. For the 231 orders, Q1 is at position 58.5 by .INC, between $15.30 and $15.50, giving $15.40; by .EXC it is at position 58, exactly $15.30. The 90th percentile is $68.00 by .INC and $${exc(TOT, 0.9).toFixed(2)} by .EXC.` },
    { p: 'The .EXC versions exclude the ends: QUARTILE.EXC returns #NUM! for quart 0 or 4, and PERCENTILE.EXC returns #NUM! when k is 0 or 1, or so close to them that it can’t interpolate. QUARTILE.INC with quart 0, 2 and 4 returns the minimum, the median and the maximum. Neither method is wrong; state which one you used, and expect other software to give slightly different quartiles on small data. Excel’s box and whisker chart offers a similar choice, “inclusive median” or “exclusive median”, which Microsoft defines by whether the median is included in the calculation when the number of values is odd.' },
    { p: 'MODE.SNGL returns the most frequent value and #N/A if no value repeats. That makes it useful for counts and prices, which repeat, and close to useless for measurements such as weights or times, where almost every value is different.' },

    { h: 'The Analysis ToolPak' },
    { p: 'The <g>Analysis ToolPak</g> is an Excel add-in that runs a set of statistical tools from one dialog. On Windows, load it once with File &gt; Options &gt; Add-ins, choose Excel Add-ins in the Manage box, select Go, tick Analysis ToolPak and select OK (Microsoft’s page gives separate steps for a Mac). The tools then appear under Data &gt; Data Analysis. Each tool works on one worksheet at a time. The Descriptive Statistics and Regression reports are values, not formulas: when the data change, run the tool again. Excel for the web can’t run the Regression tool.' },
    { p: 'Descriptive Statistics asks for the input range, whether the data are grouped in columns or rows, whether the first row holds labels, where to put the output, and which parts to include: Summary statistics, Confidence Level for Mean, and the kth largest and smallest values. Microsoft’s page says only that the tool “generates a report of univariate statistics”; the lines below are those the tool prints (as Cameron’s and BetterSolutions’ guides to it list them), with the values for the 231 order totals and the worksheet formula that reproduces each one:' },
    { table: {
      caption: 'Descriptive Statistics for order_total (Analysis ToolPak), with the worksheet function that reproduces each line',
      head: ['Line', 'Value', 'Same as', 'What it measures'],
      align: ['l', 'r', 'l', 'l'],
      rows: [
        ['Mean', sig(D.orderStats.mean, 7), 'AVERAGE', 'Centre, using every value'],
        ['Standard Error', sig(D.orderStats.sd / Math.sqrt(n), 6), 'STDEV.S ÷ √COUNT', 'How precisely the mean is estimated'],
        ['Median', '19.5', 'MEDIAN', 'Centre, by position'],
        ['Mode', '14', 'MODE.SNGL', 'Most frequent value'],
        ['Standard Deviation', sig(D.orderStats.sd, 7), 'STDEV.S', 'Typical distance from the mean'],
        ['Sample Variance', sig(sdS(TOT) ** 2, 7), 'VAR.S', 'Standard deviation squared'],
        ['Kurtosis', sig(kurt(TOT), 6), 'KURT', 'Heaviness of the tails (excess kurtosis)'],
        ['Skewness', sig(skew(TOT), 6), 'SKEW', 'Asymmetry: positive means a long right tail'],
        ['Range', sig(D.orderStats.max - D.orderStats.min, 6), 'MAX − MIN', 'Spread between the extremes'],
        ['Minimum', '12.6', 'MIN', ''],
        ['Maximum', '1512', 'MAX', ''],
        ['Sum', '9096.15', 'SUM', ''],
        ['Count', String(n), 'COUNT', ''],
        ['Confidence Level(95.0%)', sig(conf(TOT), 6), 'CONFIDENCE.T', 'Half-width of a 95% interval for the mean'],
      ],
    } },
    { p: String.raw`Three lines need explaining. <b>Standard Error</b> is the <g>standard error of the mean</g>, <m>s \div \sqrt{n}</m>: how much the mean would vary from one sample of 231 orders to the next. <b>Kurtosis</b> is Excel’s KURT, which is <i>excess</i> kurtosis: about 0 for normally distributed data, positive when the tails are heavier. Its value of ${kurt(TOT).toFixed(1)} says one order sits extraordinarily far out. <b>Confidence Level(95.0%)</b> is not a probability but a margin, the same as <x>=CONFIDENCE.T(0.05,STDEV.S(J2:J232),COUNT(J2:J232))</x>: the mean plus or minus ${conf(TOT).toFixed(2)} gives a 95% confidence interval for the mean, which B04 explains.` },
    { p: `<b>Skewness</b> is Excel’s SKEW, the adjusted Fisher–Pearson coefficient that B02’s widgets use. It cubes each value’s standardised distance from the mean (kurtosis uses fourth powers), so it is even more sensitive to one extreme value than the standard deviation: ${skew(TOT).toFixed(2)} with the office order, ${skew(NOB).toFixed(2)} without it.` },

    { h: 'Frequency tables: FREQUENCY and COUNTIFS' },
    { p: 'FREQUENCY(data_array, bins_array) returns one more count than there are bins; the last counts values above the highest bin. It ignores blank cells and text. In Excel for Microsoft 365, Excel 2021 and Excel 2024 you type it in the top cell and it spills; in Excel 2019 and earlier you select the whole output range first, type the formula and press Ctrl+Shift+Enter (on Windows).' },
    { p: 'The same counts come from one COUNTIFS per bin, with the lower and upper edges in two columns: <x>=COUNTIFS($J$2:$J$232,">"&K2,$J$2:$J$232,"<="&L2)</x>, filled down. The criteria <x>">"</x> and <x>"<="</x> reproduce FREQUENCY’s rule (above the lower edge, up to the upper edge); writing <x>">="</x> and <x>"<"</x> instead would move every value that sits on an edge into the next bin. The Histogram chart and the ToolPak’s Histogram tool use the same rule, with an underflow bin that includes its edge.' },

    { h: 'Correlation' },
    { p: String.raw`CORREL(array1, array2) returns Pearson’s correlation coefficient, between −1 and +1: near +1 when the points lie close to a rising straight line, near −1 for a falling one, near 0 when there is no straight-line pattern. It skips text and blanks, returns #N/A if the two ranges hold different numbers of points, and gives the same answer whichever range comes first. PEARSON is the same calculation.` },
    { p: 'B01’s warning applies in full: two variables can be <g>correlated</g> without one causing the other, and a <g>confounding variable</g> can drive both. Here a causal story is plausible, because Ana’s quote sheet charges per guest. Hours and pastries change invoices too; in these events they are almost unrelated to the number of guests, so they show up as scatter around the line rather than in its slope. Measuring their effects takes a multiple regression, which the project reads.' },

    { h: 'The least-squares line' },
    { p: String.raw`Excel’s linear trendline, SLOPE, INTERCEPT and the ToolPak all fit the <g>least-squares line</g> <m>\hat{y} = b_0 + b_1 x</m>: the line that makes the sum of the squared <g>residuals</g> (actual minus predicted y) as small as possible. Its slope is <m>b_1 = \sum (x - \bar{x})(y - \bar{y}) \div \sum (x - \bar{x})^2</m> and its intercept <m>b_0 = \bar{y} - b_1 \bar{x}</m>, so the line passes through the point of means: ${mx.toFixed(2)} guests and $${my.toFixed(2)}.` },
    { p: 'Watch the argument order. SLOPE, INTERCEPT, RSQ and LINEST take known_y’s first and known_x’s second; FORECAST.LINEAR takes the new x first: <x>=FORECAST.LINEAR(x,known_y\'s,known_x\'s)</x>. FORECAST.LINEAR replaced FORECAST in Excel 2016; FORECAST still works for compatibility. Swapping y and x gives the regression of guests on invoice, a different line.' },
    { p: 'LINEST returns the whole fit as an array. <x>=LINEST(C2:C76,B2:B76,TRUE,TRUE)</x> gives five rows and two columns: the slope and intercept; their standard errors; R² and the standard error of the estimate; the F statistic and the residual degrees of freedom; and the regression and residual sums of squares. In Excel for Microsoft 365, Excel 2021 and Excel 2024 it spills from one cell; in Excel 2019 and earlier it must be entered as an array formula with Ctrl+Shift+Enter. A trendline label shows only five digits of each coefficient, so calculate predictions from SLOPE and INTERCEPT, not from numbers copied off the chart.' },
    { p: 'To add the trendline, select the scatter chart, open Chart Elements and tick Trendline, then in the Format Trendline pane choose Linear and tick Display Equation on chart and Display R-squared value on chart.' },

    { h: 'Reading the ToolPak’s Regression output' },
    { p: 'Data &gt; Data Analysis &gt; Regression asks for the Input Y Range (the invoices, C1:C76) and the Input X Range (the guests, B1:B76), with Labels ticked because row 1 holds headings. Its Summary Output has three blocks. The Explore section reproduces it; here it is for the 75 one-day events.' },
    { table: {
      caption: 'SUMMARY OUTPUT: invoice on guests, 75 one-day events. Regression Statistics',
      head: ['', 'Value', 'What it says'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Multiple R', sig(Math.sqrt(RS.r2)), 'The correlation between actual and predicted invoices; with one X it equals |r|'],
        ['R Square', sig(RS.r2), 'The share of the variation in invoices around their mean that the line accounts for'],
        ['Adjusted R Square', sig(RS.adjR2), 'R² adjusted for the number of X variables; for comparing models with different numbers of Xs'],
        ['Standard Error', sig(RS.se), 'The typical size of a residual, in dollars: the standard error of the regression'],
        ['Observations', String(RS.n), 'Events used'],
      ],
    } },
    { table: {
      caption: 'ANOVA',
      head: ['', 'df', 'SS', 'MS', 'F', 'Significance F'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Regression', '1', ssr.toFixed(2), ssr.toFixed(2), sig(RS.F), '1.47E-34'],
        ['Residual', String(RS.n - 2), RS.sse.toFixed(2), (RS.sse / (RS.n - 2)).toFixed(2), '', ''],
        ['Total', String(RS.n - 1), RS.sst.toFixed(2), '', '', ''],
      ],
    } },
    { table: {
      caption: 'Coefficients',
      head: ['', 'Coefficients', 'Standard Error', 't Stat', 'P-value', 'Lower 95%', 'Upper 95%'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Intercept', sig(b0), sig(RS.coefs.Intercept.se), sig(RS.coefs.Intercept.t), '6.97E-13', sig(RS.coefs.Intercept.low), sig(RS.coefs.Intercept.high)],
        ['guests', sig(b1), sig(RS.coefs.guests.se), sig(RS.coefs.guests.t), '1.47E-34', sig(RS.coefs.guests.low), sig(RS.coefs.guests.high)],
      ],
    } },
    { list: [
      String.raw`<b>R Square</b> = regression SS ÷ total SS <m>= ${tx(ssr)} \div ${tx(RS.sst)} \approx ${RS.r2.toFixed(3)}</m>. The total SS measures how far invoices vary around their mean; 87.4% of that variation lines up with the number of guests, and 12.6% is left in the residuals. With one X it equals <m>r^2</m>.`,
      String.raw`<b>Standard Error</b> <m>= \sqrt{\text{residual SS} \div (n - 2)} = \sqrt{${tx(RS.sse / (RS.n - 2), 2)}} \approx ${RS.se.toFixed(2)}</m> dollars. A typical invoice was about $85 away from the line: a more useful measure of a prediction’s accuracy than R².`,
      String.raw`<b>ANOVA</b>: each MS is SS ÷ df, and <m>F = ${tx(ssr)} \div ${tx(RS.sse / (RS.n - 2), 2)} \approx ${RS.F.toFixed(1)}</m>. <b>Significance F</b> is the <g>p-value</g> of the test that every slope is 0; with one X it equals the slope’s P-value. 1.47E-34 is Excel’s notation for <m>1.47 \times 10^{-34}</m>: a slope this far from 0 would essentially never arise by chance if guests had no linear relation to invoices.`,
      String.raw`<b>Coefficients</b>: the intercept ${b0.toFixed(2)} and the slope ${b1.toFixed(4)}. <b>t Stat</b> = coefficient ÷ its standard error (<m>${b1.toFixed(4)} \div ${RS.coefs.guests.se.toFixed(4)} \approx ${RS.coefs.guests.t.toFixed(1)}</m>). <b>Lower 95%</b> and <b>Upper 95%</b> are the coefficient ± <m>t_{0.025,\,73} \times</m> standard error, with <m>t_{0.025,\,73} \approx ${t73.toFixed(3)}</m>: the slope’s <g>95% confidence interval</g> runs from $${RS.coefs.guests.low.toFixed(2)} to $${RS.coefs.guests.high.toFixed(2)} per guest.`,
    ] },

    { h: 'What the line says, and what it doesn’t' },
    { list: [
      `<b>The slope</b>: across these events, one more guest went with $${b1.toFixed(2)} more on the invoice, on average (95% interval $${RS.coefs.guests.low.toFixed(2)} to $${RS.coefs.guests.high.toFixed(2)}). That is close to the $6.50 a guest on Ana’s quote sheet, though the line knows nothing about her price list: it only summarises what her invoices did.`,
      `<b>The intercept</b>, $${b0.toFixed(2)}, is the predicted invoice for 0 guests. No event had fewer than ${Math.min(...G1)} guests, so this is an <g>extrapolation</g>: it anchors the line and is not Ana’s setup charge.`,
      `<b>Predictions</b> are safest inside the data’s range, ${Math.min(...G1)} to ${Math.max(...G1)} guests: for 100 guests, <x>=FORECAST.LINEAR(100,C2:C76,B2:B76)</x> gives ${money(pred(100))}, and actual invoices at that size have scattered by roughly the standard error, $${RS.se.toFixed(0)}, either side.`,
      '<b>R² is not predictive accuracy.</b> 0.874 doesn’t mean predictions are 87.4% accurate or right 87.4% of the time; it says how much of the past variation the line accounts for. The standard error tells you the size of a typical miss, and only new events show how well the line predicts.',
      '<b>Correlation is not causation</b>, and the regression describes how Ana has priced in the past, not what clients would pay. Checking the line’s assumptions with residual plots, and handling several X variables, belong to B06 Regression Analysis; the p-values and intervals rest on assumptions B04 explains.',
    ] },

    { h: 'Why the two-day conference is set aside' },
    { p: `EV-001, Meridian Partners’ conference on 12 March, ran for two days with ${CONF[4]} guests and was invoiced $${CONF[9].toLocaleString('en-US')}. Ana quotes a two-day event day by day, so its invoice isn’t on the same footing as the others, and its ${CONF[4]} guests lie beyond the largest one-day event (${Math.max(...G1)}). Fitted to all 76 events, the line changes a great deal: slope $${RA.coefs.guests.b.toFixed(2)} a guest, intercept −$${Math.abs(RA.coefs.Intercept.b).toFixed(2)}, R² ${RA.r2.toFixed(3)} and standard error $${RA.se.toFixed(2)}, against $${b1.toFixed(2)}, $${b0.toFixed(2)}, ${RS.r2.toFixed(3)} and $${RS.se.toFixed(2)} without it.` },
    { figure: {
      svg: lineFigure(),
      caption: 'The 75 one-day events (dots) and their least-squares line, solid across the range of the data and dashed beyond it. The two-day conference (square) lies far above and to the right; included, it would pull the line up at the right and down at the left.',
      alt: `A scatter chart of invoice (vertical, $0 to over $4,000) against guests (horizontal, 0 to 270). Seventy-five dots for one-day events form a narrow rising band between ${Math.min(...G1)} and ${Math.max(...G1)} guests and between $${Math.min(...V1)} and $${Math.max(...V1).toLocaleString('en-US')}, and a shaded strip marks that range of guests. A straight line runs through the band; it is dashed to the left of ${Math.min(...G1)} guests, down to the intercept of about $${Math.round(b0)} at 0 guests, and dashed again beyond ${Math.max(...G1)} guests. A square at ${CONF[4]} guests and $${CONF[9].toLocaleString('en-US')}, labelled the two-day conference, sits far above the line.`,
    } },
    { p: 'One point did that because it is extreme in both directions: far beyond the other events in guests, and far above the line in dollars. Points far from the mean of x have high leverage and can tilt a least-squares line on their own, a diagnostic B06 develops. Setting the conference aside is not hiding data: the analysis says it covers one-day events, and the conference is reported separately. Excluding a point only because it spoils the fit would be.' },
  ],

  formulas: [
    { id: 'ds-sd', name: 'Sample and population standard deviation (STDEV.S, STDEV.P)',
      tex: String.raw`s = \sqrt{\dfrac{\sum_{i=1}^{n} (x_i - \bar{x})^2}{n - 1}}, \qquad \sigma = \sqrt{\dfrac{\sum_{i=1}^{n} (x_i - \bar{x})^2}{n}}`,
      where: [[String.raw`x_i`, 'The i-th value', 'units of x'], [String.raw`\bar{x}`, 'The mean of the values', 'units of x'], [String.raw`n`, 'Number of values', ''], [String.raw`s`, 'Sample standard deviation (STDEV.S)', 'units of x'], [String.raw`\sigma`, 'Population standard deviation (STDEV.P)', 'units of x']],
      note: 'The variance (VAR.S, VAR.P) is the same expression without the square root.' },
    { id: 'ds-se-mean', name: 'Standard error of the mean',
      tex: String.raw`\text{SE} = \dfrac{s}{\sqrt{n}}`,
      where: [[String.raw`s`, 'Sample standard deviation', 'units of x'], [String.raw`n`, 'Number of values', ''], [String.raw`\text{SE}`, 'Standard error of the mean', 'units of x']],
      note: 'The ToolPak’s Standard Error line. Its Confidence Level line is t × SE, with t from the t distribution with n − 1 degrees of freedom.' },
    { id: 'ds-kurt', name: 'Excess kurtosis (Excel’s KURT)',
      tex: String.raw`\text{KURT} = \dfrac{n(n+1)}{(n-1)(n-2)(n-3)} \sum_{i=1}^{n} \left(\dfrac{x_i - \bar{x}}{s}\right)^{4} - \dfrac{3(n-1)^2}{(n-2)(n-3)}`,
      where: [[String.raw`x_i`, 'The i-th value', 'units of x'], [String.raw`\bar{x}`, 'Mean', 'units of x'], [String.raw`s`, 'Sample standard deviation', 'units of x'], [String.raw`n`, 'Number of values (at least 4)', '']],
      assumptions: 'Reproduces Microsoft’s example: KURT of 3, 4, 5, 2, 3, 4, 5, 6, 4, 7 is −0.151800.',
      note: 'The subtracted term makes the result close to 0 for normally distributed data, so KURT reports excess kurtosis; the NIST handbook’s kurtosis, without it, is 3 for a normal distribution.' },
    { id: 'ds-correl', name: 'Correlation coefficient (CORREL)',
      tex: String.raw`r = \dfrac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \, \sum (y - \bar{y})^2}}`,
      where: [[String.raw`x, y`, 'Paired values of the two variables', 'their units'], [String.raw`\bar{x}, \bar{y}`, 'Their means', 'their units'], [String.raw`r`, 'Pearson’s correlation coefficient, from −1 to +1', '']],
      note: 'RSQ returns r². CORREL and PEARSON give the same result.' },
    { id: 'ds-ls-line', name: 'Least-squares line (SLOPE, INTERCEPT, FORECAST.LINEAR)',
      tex: String.raw`\hat{y} = b_0 + b_1 x, \qquad b_1 = \dfrac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2}, \qquad b_0 = \bar{y} - b_1 \bar{x}`,
      where: [[String.raw`x`, 'The explanatory variable (guests)', 'units of x'], [String.raw`\hat{y}`, 'The predicted value of y (invoice)', 'units of y'], [String.raw`b_1`, 'Slope: change in predicted y per unit of x', 'units of y per unit of x'], [String.raw`b_0`, 'Intercept: predicted y when x = 0', 'units of y'], [String.raw`\bar{x}, \bar{y}`, 'Means of x and y', 'their units']],
      assumptions: 'A straight line describes the relationship over the range of the data.',
      note: 'In Excel: SLOPE(known_y’s, known_x’s), INTERCEPT(known_y’s, known_x’s), FORECAST.LINEAR(x, known_y’s, known_x’s).' },
    { id: 'ds-fit', name: 'R² and the standard error of the regression',
      tex: String.raw`R^2 = \dfrac{\text{SS}_{\text{reg}}}{\text{SS}_{\text{tot}}} = 1 - \dfrac{\text{SS}_{\text{res}}}{\text{SS}_{\text{tot}}}, \qquad s_e = \sqrt{\dfrac{\text{SS}_{\text{res}}}{n - k - 1}}`,
      where: [[String.raw`R^2`, 'Share of the variation in y around its mean that the regression accounts for', ''], [String.raw`\text{SS}_{\text{tot}}`, 'Total sum of squares: Σ(y − ȳ)²', 'units of y squared'], [String.raw`\text{SS}_{\text{res}}`, 'Residual sum of squares: Σ(y − ŷ)²', 'units of y squared'], [String.raw`\text{SS}_{\text{reg}}`, 'Regression sum of squares: SS_tot − SS_res', 'units of y squared'], [String.raw`n`, 'Observations', ''], [String.raw`k`, 'Number of X variables (1 here)', ''], [String.raw`s_e`, 'Standard error of the regression (the ToolPak’s Standard Error)', 'units of y']],
      note: 'Adjusted R² = 1 − (1 − R²)(n − 1) ÷ (n − k − 1).' },
    { id: 'ds-t', name: 't Stat and the 95% limits of a coefficient',
      tex: String.raw`t = \dfrac{b}{\text{SE}_b}, \qquad b \pm t_{0.025,\,n-k-1} \times \text{SE}_b`,
      where: [[String.raw`b`, 'A coefficient (slope or intercept)', 'its units'], [String.raw`\text{SE}_b`, 'Its standard error', 'its units'], [String.raw`t_{0.025,\,n-k-1}`, 'The t value with 2.5% in each tail and n − k − 1 degrees of freedom', '']],
      note: 'The ToolPak’s t Stat, Lower 95% and Upper 95% columns. B04 explains the reasoning behind them.' },
  ],

  examples: [
    { level: 'simple', title: 'Describing 13 breakfast events', fictional: true,
      setup: 'Lantern’s 13 breakfast events in 2026 were invoiced (in date order) $600, $1,120, $700, $1,140, $1,060, $1,050, $540, $1,430, $1,520, $480, $810, $870 and $740, in C2:C14. Calculate the mean, median, sample and population standard deviations, and the quartiles by both methods, with formulas.',
      table: {
        caption: 'The invoices sorted, with their positions',
        head: ['Position', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        rows: [['Invoice ($)', ...sorted(BREAKFAST).map((v) => v.toLocaleString('en-US'))]],
      },
      steps: [
        String.raw`Mean: <x>=AVERAGE(C2:C14)</x> = <m>${sum(BREAKFAST).toLocaleString('en-US').replace(',', '{,}')} \div 13 \approx ${mean(BREAKFAST).toFixed(2)}</m> dollars. Median: <x>=MEDIAN(C2:C14)</x> = the 7th of 13 sorted values, $870.`,
        String.raw`Standard deviations: <x>=STDEV.S(C2:C14)</x> = $${sdS(BREAKFAST).toFixed(2)} (divide by 12) and <x>=STDEV.P(C2:C14)</x> = $${sdP(BREAKFAST).toFixed(2)} (divide by 13). These events stand for Ana’s breakfast catering in general, so STDEV.S is the one to report.`,
        String.raw`Quartiles by .INC: positions <m>1 + 12 \times 0.25 = 4</m> and <m>1 + 12 \times 0.75 = 10</m>, so <x>=QUARTILE.INC(C2:C14,1)</x> = $700 and <x>=QUARTILE.INC(C2:C14,3)</x> = $1,120; IQR $420.`,
        String.raw`Quartiles by .EXC: positions <m>14 \times 0.25 = 3.5</m> and <m>14 \times 0.75 = 10.5</m>: halfway between $600 and $700, $650, and halfway between $1,120 and $1,140, $1,130; IQR $480.`,
      ],
      answer: `Mean ${money(mean(BREAKFAST))}, median $870.00, STDEV.S ${money(sdS(BREAKFAST))}, STDEV.P ${money(sdP(BREAKFAST))}; quartiles $700 and $1,120 by .INC, $650 and $1,130 by .EXC.`,
      interpretation: 'The mean is above the median because two large breakfasts ($1,430 and $1,520) pull it up. On 13 values the choice of method moves the quartiles by $50 and the IQR by $60, so say which one you used; on Lantern’s 231 orders the two methods differ by at most ten cents at the quartiles.' },
    { level: 'challenging', title: 'What the office order does to the ToolPak report', fictional: true,
      setup: 'Ana runs Descriptive Statistics on the 231 order totals and again on the 230 without LC-10144. Using the first report’s Sum and Count, check the second report’s mean, then compare the two reports’ centre, spread and shape. What should her spring review say?',
      steps: [
        String.raw`Mean without the office order, from the first report: <m>(9{,}096.15 - 1{,}512.00) \div (231 - 1) = 7{,}584.15 \div 230 \approx 32.97</m> dollars, as the second report shows. The mean falls by <m>39.38 - 32.97 = 6.40</m> dollars (from the unrounded means).`,
        `Median: $19.50 in both reports. Removing the largest value moves the middle position by half a place, and the values around it are the same.`,
        String.raw`Spread: the standard deviation falls from $${D.orderStats.sd.toFixed(2)} to $${sdS(NOB).toFixed(2)}, so the Standard Error falls from <m>${D.orderStats.sd.toFixed(2)} \div \sqrt{231} \approx ${(D.orderStats.sd / Math.sqrt(231)).toFixed(2)}</m> to <m>${sdS(NOB).toFixed(2)} \div \sqrt{230} \approx ${(sdS(NOB) / Math.sqrt(230)).toFixed(2)}</m>, and the Confidence Level from $${conf(TOT).toFixed(2)} to $${conf(NOB).toFixed(2)}.`,
        `Shape: skewness falls from ${skew(TOT).toFixed(2)} to ${skew(NOB).toFixed(2)} and kurtosis from ${kurt(TOT).toFixed(2)} to ${kurt(NOB).toFixed(2)}. The ordinary orders are still right-skewed, with a long tail of gift boxes and 1 kg bags, but nothing like the single order of $1,512.`,
      ],
      answer: `Without LC-10144: mean $32.97 (down $6.40), median $19.50 (unchanged), standard deviation $${sdS(NOB).toFixed(2)} (down from $${D.orderStats.sd.toFixed(2)}), standard error $${(sdS(NOB) / Math.sqrt(230)).toFixed(2)}, skewness ${skew(NOB).toFixed(2)}, kurtosis ${kurt(NOB).toFixed(2)}.`,
      interpretation: 'The office order is real revenue, so the spring total and the mean of $39.38 stay as they are. The review should describe a typical order with the median ($19.50) and the quartiles ($15.40 to $39.00), report the mean both with and without the office order, and say why. Kurtosis and skewness are the lines most changed, a sign that one value dominates them.' },
    { level: 'applied', title: 'Is “about $9 a head” the right rule?', fictional: true,
      setup: `Ana has been estimating catering invoices at about $9 a head. Using the line fitted to her 75 one-day events (invoice = ${b0.toFixed(2)} + ${b1.toFixed(4)} × guests, standard error $${RS.se.toFixed(2)}), compare the two rules for events of 40, 80, 150 and 200 guests, and say which kind of event the per-head rule misprices.`,
      table: {
        caption: 'Two ways to estimate an invoice for a one-day event',
        head: ['Guests', '$9 a head', 'Regression line', 'Line minus $9 a head'],
        align: ['r', 'r', 'r', 'r'],
        rows: [40, 80, 150, 200].map((g) => [String(g), money(PER_HEAD * g), money(pred(g)), `${pred(g) - PER_HEAD * g < 0 ? '−' : ''}${money(Math.abs(pred(g) - PER_HEAD * g))}`]),
      },
      steps: [
        String.raw`Check the range: 40 to 200 guests lies inside the data (${Math.min(...G1)} to ${Math.max(...G1)} guests), so the line is interpolating, not extrapolating.`,
        String.raw`Predict with the line, for example for 40 guests: <m>${b0.toFixed(2)} + ${b1.toFixed(4)} \times 40 \approx ${pred(40).toFixed(2)}</m>, or <x>=FORECAST.LINEAR(40,C2:C76,B2:B76)</x>. The per-head rule gives <m>9 \times 40 = 360</m>.`,
        String.raw`Find where the rules agree: <m>9g = ${b0.toFixed(2)} + ${b1.toFixed(4)}g</m>, so <m>g = ${b0.toFixed(2)} \div (9 - ${b1.toFixed(4)}) \approx ${cross.toFixed(1)}</m>: about 98 guests.`,
        `Compare the gaps with the standard error. At 40 guests the per-head estimate is $${(pred(40) - 360).toFixed(2)} below the line, and at 200 guests $${(1800 - pred(200)).toFixed(2)} above it, both well beyond a typical miss of about $85. Near 80 guests the two rules are within $${(pred(80) - 720).toFixed(2)} of each other.`,
      ],
      answer: `The per-head rule matches the line near 98 guests. Below that it underestimates (by about $${(pred(40) - 360).toFixed(0)} at 40 guests); above it, it overestimates (by about $${(1800 - pred(200)).toFixed(0)} at 200 guests).`,
      interpretation: 'Ana’s invoices behave like a fixed amount plus a price per guest, which is how her quote sheet is built, so a flat rate per head undercharges small events and overprices large ones. The line is a check on her quotes, not a price list: it describes past invoices, it ignores hours and pastries, and its typical miss is about $85.' },
  ],

  demo: [
    { widget: 'ds-orders', intro: 'All 231 order totals as a histogram. Compare the mean with the median, find the office order on the far right, and switch to a log scale to see the shape of the ordinary orders.' },
    { widget: 'ds-sheet', intro: 'The order totals with live statistics beside them and a FREQUENCY table. Change B145, LC-10144’s $1,512.00, to 151.2 and watch which statistics move and which don’t. Turn on Show formulas to see how each is calculated.' },
    { widget: 'ds-reg', intro: 'The ToolPak’s Summary Output for invoice on guests, 75 one-day events, with the scatter chart and the fitted line. Match each number to the explanation in the In depth section.' },
    { widget: 'ds-reg-all', intro: 'The same regression with the two-day conference included (76 events). Compare the slope, the intercept, R Square and the Standard Error with the one-day version.' },
  ],

  mistakes: [
    { title: '“The mean is what a typical customer spends.”', html: 'Not when one value dominates. Lantern’s mean order is $39.38, but half the orders are $19.50 or less, and one $1,512 order adds $6.40 to the mean. Use the median and quartiles for “typical” and the mean for totals.' },
    { title: '“STDEV and STDEV.P are interchangeable.”', html: 'STDEV.S (and the older STDEV) divide by n − 1 for a sample; STDEV.P divides by n for a whole population. On 13 breakfasts they differ by about $13. Use STDEV.S unless the rows are the entire group and you don’t generalise.' },
    { title: '“Kurtosis near 0 means the data are flat.”', html: 'Excel’s KURT is excess kurtosis: about 0 for normally distributed data, positive for heavy tails. The NIST handbook’s kurtosis is 3 for a normal distribution. Check which convention a report uses.' },
    { title: '“<x>=SLOPE(B2:B76,C2:C76)</x> gives the slope of invoice on guests.”', html: 'SLOPE, INTERCEPT and RSQ take known_y’s first. With guests in B and invoices in C, the slope of invoice on guests is <x>=SLOPE(C2:C76,B2:B76)</x>; the swapped version fits guests on invoice.' },
    { title: '“R² = 0.874, so the predictions are 87.4% accurate.”', html: 'R² is the share of past variation in y that the line accounts for. The size of a typical miss is the Standard Error, about $85 here, and only new data show how well the line predicts.' },
    { title: '“The intercept is Ana’s setup fee.”', html: 'It is the predicted invoice at 0 guests, an extrapolation far below the smallest event (35 guests), and it absorbs everything the line leaves out. Interpret coefficients only within the data’s range.' },
  ],

  application: [
    { p: 'Describe a column before you model it. Many business measures, such as basket values, lengths of stay and call-handling times, tend to be right-skewed like Lantern’s orders, with many small values and a few very large ones, so good reports pair the median with the mean and say how extreme values were treated. The same habit applies to a regression: a scatter chart first, then the line, then the output, and a note of the range it covers.' },
    { case: 'Ana adds three lines to her spring review. “The typical spring order was $19.50 (median); the middle half ran from $15.40 to $39.00. The mean was $39.38, or $32.97 without one office order of $1,512.” And for catering: “On 75 one-day events, each extra guest added about $6.67 to the invoice (95% interval $6.08 to $7.26); a typical invoice was within about $85 of the line. The two-day conference is reported separately.” The project goes further with a multiple regression that separates guests, hours and pastries.' },
    { p: 'A regression in Excel takes a minute to run, and its output looks authoritative. What makes it trustworthy is the work around it: a clear statement of which rows were used and why, predictions kept inside the range of the data, the standard error quoted beside every prediction, and no causal language that the data can’t support. B06 adds the diagnostics; the reading skills here are the foundation.' },
  ],

  summary: [
    'AVERAGE, MEDIAN, MODE.SNGL, MIN, MAX, STDEV.S and QUARTILE.INC describe a column; they ignore text and blanks in a range.',
    'STDEV.S divides by n − 1 (a sample); STDEV.P by n (the whole population). In business analysis STDEV.S is the usual choice.',
    '.INC quartiles and percentiles use position 1 + (n − 1)p; .EXC use (n + 1)p and can’t return the minimum or maximum. State the method.',
    'One extreme value moves the mean, the standard deviation, skewness, kurtosis and a regression line; the median and quartiles barely move.',
    'The ToolPak’s Descriptive Statistics: Standard Error = s ÷ √n, Kurtosis = excess kurtosis (KURT), Confidence Level = t × standard error. Its output is static.',
    'FREQUENCY counts values above the previous bin edge and up to the current one, plus a final count above the last edge; COUNTIFS with the criteria <x>">"&K2</x> and <x>"<="&L2</x> reproduces it.',
    'CORREL measures linear association; SLOPE, INTERCEPT, RSQ (y first) and FORECAST.LINEAR (x first) give the least-squares line. Keep predictions inside the data’s range.',
    'In the Regression output, R Square is the share of variation explained, Standard Error the typical miss, Significance F and P-values test for a zero slope, and the 95% limits bound each coefficient. R² is not predictive accuracy, and correlation is not causation.',
  ],

  glossary: [
    { term: 'Variance', def: 'The average squared distance of values from their mean, dividing by n − 1 for a sample (VAR.S) or by n for a whole population (VAR.P); the square of the standard deviation.' },
    { term: 'Standard error of the mean', def: 'The sample standard deviation divided by the square root of the number of values, s ÷ √n: how much the mean would vary from one sample of that size to another.' },
    { term: 'Kurtosis', def: 'A measure of how heavy a distribution’s tails are. Excel’s KURT reports excess kurtosis, which is about 0 for normally distributed data and positive for heavier tails.' },
    { term: 'Percentile', def: 'The value with a given percentage of the sorted data at or below it, interpolating between values when needed; the 25th, 50th and 75th percentiles are the quartiles.' },
    { term: 'Bin', def: 'One of the intervals a numeric range is divided into for counting. Excel counts a value in a bin when it is above the bin’s lower edge and no more than its upper edge.' },
    { term: 'Analysis ToolPak', def: 'An Excel add-in, loaded from File &gt; Options &gt; Add-ins, that adds statistical tools (Descriptive Statistics, Histogram, Correlation, Regression and others) under Data &gt; Data Analysis. Most tools, including Descriptive Statistics and Regression, write values rather than formulas, so their reports don’t update when the data change.' },
    { term: 'Correlation coefficient', def: 'Pearson’s r: a number from −1 to +1 that measures how closely two numeric variables follow a straight line, positive when they rise together. Excel’s CORREL.' },
    { term: 'Regression line', def: 'A straight line, ŷ = b₀ + b₁x, fitted to paired data to describe how the average of y changes with x.' },
    { term: 'Least-squares line', def: 'The regression line that makes the sum of the squared residuals as small as possible; it passes through the point of means.' },
    { term: 'Residual', def: 'The actual value of y minus the value the regression line predicts for it.' },
    { term: 'R squared', def: 'The share of the variation of y around its mean that a regression accounts for, from 0 to 1; with one X it is the square of the correlation coefficient. Also called the coefficient of determination.' },
    { term: 'Standard error of the regression', def: 'The typical size of a residual, √(residual sum of squares ÷ (n − k − 1)), in the units of y. The Standard Error line in Excel’s regression output.' },
    { term: 'Extrapolation', def: 'Using a fitted relationship to predict outside the range of the data it was fitted to, where there is no evidence that the relationship still holds.' },
    { term: 'P-value', def: 'The probability of a result at least as extreme as the one observed if the null hypothesis (for a regression coefficient, that it is 0) were true. A small p-value is evidence against the null hypothesis, not the probability that it is true.' },
    { term: '95% confidence interval', def: 'A range calculated from sample data by a method that captures the true value in 95% of samples; in Excel’s regression output, the Lower 95% and Upper 95% of each coefficient.' },
  ],

  references: [
    { text: 'Microsoft Support. “QUARTILE.EXC function”, with the pages for STDEV.S, PERCENTILE.EXC, QUARTILE.INC, MODE.SNGL, KURT and SKEW.', url: 'https://support.microsoft.com/en-us/excel/functions/quartile-exc-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. “Load the Analysis ToolPak in Excel” and “Use the Analysis ToolPak to perform complex data analysis”.', url: 'https://support.microsoft.com/en-us/excel/use-the-analysis-toolpak-to-perform-complex-data-analysis', checked: '2026-10-23' },
    { text: 'Cameron, A. C. (2009). “Excel 2007: Descriptive Statistics”. University of California, Davis, Department of Economics.', url: 'https://cameron.econ.ucdavis.edu/excel/ex21descriptivestatistics.html', checked: '2026-10-23' },
    { text: 'Microsoft Support. “Perform a regression analysis”, with “LINEST function” and “FORECAST and FORECAST.LINEAR functions”.', url: 'https://support.microsoft.com/en-us/excel/perform-a-regression-analysis', checked: '2026-10-23' },
    { text: 'BetterSolutions.com. “Analysis ToolPak: Descriptive Statistics”.', url: 'https://www.bettersolutions.com/excel/add-ins/analysis-toolpak-descriptive-statistics.htm', checked: '2026-10-23' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.11, “Measures of Skewness and Kurtosis”.', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm', checked: '2026-10-23' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, section 13.4, “The Regression Equation”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/13-4-the-regression-equation', checked: '2026-10-23' },
  ],

  checks: [
    // the orders: functions table and concept
    { what: 'Orders', value: n, shown: 231 },
    { what: 'Mean order', value: D.orderStats.mean, shown: 39.38 },
    { what: 'Median order', value: D.orderStats.median, shown: 19.50 },
    { what: 'Mode order', value: Number([...new Set(TOT)].sort((a, b) => countOf(TOT, b) - countOf(TOT, a))[0]), shown: 14 },
    { what: 'Orders of exactly $14.00', value: countOf(TOT, 14), shown: 15 },
    { what: 'All $14.00 orders are one full-price House Blend 250g', value: Number(ORDERS.filter((r) => r[9] === 14).every((rw) => rw[4] === 'House Blend 250g' && rw[6] === 1 && rw[8] === 0)), shown: 1 },
    { what: 'SD (sample)', value: sdS(TOT), shown: 100.90 },
    { what: 'SD more than twice the mean', value: Number(sdS(TOT) > 2 * mean(TOT)), shown: 1 },
    { what: 'Q1 (INC)', value: inc(TOT, 0.25), shown: 15.40 },
    { what: 'Q3 (INC)', value: inc(TOT, 0.75), shown: 39.00 },
    { what: '90th percentile (INC)', value: inc(TOT, 0.9), shown: 68.00 },
    { what: 'Minimum', value: Math.min(...TOT), shown: 12.60 },
    { what: 'Maximum', value: Math.max(...TOT), shown: 1512 },
    { what: 'Office order quantity', value: ORDERS.find((rw) => rw[0] === D.bulk.id)[6], shown: 120 },
    { what: 'Office order row in a sheet with headers in row 1', value: ORDERS.findIndex((rw) => rw[0] === D.bulk.id) + 2, shown: 145 },
    { what: 'Mean without the office order', value: mean(NOB), shown: 32.97 },
    { what: 'SD without the office order', value: sdS(NOB), shown: 26.73 },
    { what: 'Median without the office order', value: inc(NOB, 0.5), shown: 19.50 },
    { what: 'Mean falls by', value: mean(TOT) - mean(NOB), shown: 6.40 },
    { what: 'SD ratio (almost quadruples)', value: sdS(TOT) / sdS(NOB), shown: 3.8, tol: 0.05 },
    { what: 'Mean × orders = total', value: mean(TOT) * n, shown: 9096.15 },
    { what: 'Sum without office order', value: sum(NOB), shown: 7584.15 },
    { what: 'Bins', value: BINS.length, shown: 5 },
    { what: 'FREQUENCY counts returned', value: FREQ.length, shown: 6 },
    { what: 'Up to $20', value: FREQ[0], shown: 116 },
    { what: 'Over $20 to $40', value: FREQ[1], shown: 61 },
    { what: 'Over $40 to $60', value: FREQ[2], shown: 25 },
    { what: 'Over $60 to $80', value: FREQ[3], shown: 7 },
    { what: 'Over $80 to $100', value: FREQ[4], shown: 16 },
    { what: 'Over $100', value: FREQ[5], shown: 6 },
    { what: 'More than half up to $20', value: Number(FREQ[0] > n / 2), shown: 1 },
    { what: 'Two 1 kg bags are most of the $80–$100 bin', value: ORDERS.filter((rw) => rw[9] > 80 && rw[9] <= 100 && rw[5] === 1000).length, shown: 13 },
    // the regression
    { what: 'One-day events', value: ONE.length, shown: 75 },
    { what: 'Correlation r', value: r, shown: 0.9349, tol: 0.00005 },
    { what: 'CORREL equals case regression', value: r * r, shown: RS.r2, tol: 1e-9 },
    { what: 'Slope', value: b1, shown: 6.6692, tol: 0.00005 },
    { what: 'Intercept', value: b0, shown: 227.88 },
    { what: 'R squared', value: RS.r2, shown: 0.8739, tol: 0.00005 },
    { what: 'Slope per guest, 2 dp', value: b1, shown: 6.67 },
    { what: 'Mean guests', value: mx, shown: 82.03 },
    { what: 'Mean invoice', value: my, shown: 774.93 },
    { what: 'Multiple R', value: Math.sqrt(RS.r2), shown: 0.934851, tol: 0.0000005 },
    { what: 'Adjusted R squared', value: RS.adjR2, shown: 0.872219, tol: 0.0000005 },
    { what: 'Adjusted R squared by formula', value: 1 - (1 - RS.r2) * (RS.n - 1) / (RS.n - 2), shown: RS.adjR2, tol: 1e-12 },
    { what: 'Standard error of the regression', value: RS.se, shown: 84.69 },
    { what: 'Standard error, about $85', value: RS.se, shown: 85, tol: 0.5 },
    { what: 'Regression SS', value: ssr, shown: 3629738.02 },
    { what: 'Residual SS', value: RS.sse, shown: 523536.64 },
    { what: 'Total SS', value: RS.sst, shown: 4153274.67 },
    { what: 'Regression SS rounded in the text', value: ssr, shown: 3629738, tol: 0.5 },
    { what: 'Total SS rounded in the text', value: RS.sst, shown: 4153275, tol: 0.5 },
    { what: 'Residual MS', value: RS.sse / (RS.n - 2), shown: 7171.73 },
    { what: 'F', value: RS.F, shown: 506.1, tol: 0.05 },
    { what: 'F = MSreg / MSres', value: ssr / (RS.sse / (RS.n - 2)), shown: RS.F, tol: 1e-6 },
    { what: 'Significance F (× 1E34)', value: RS.pF * 1e34, shown: 1.47 },
    { what: 'Intercept p (× 1E13)', value: RS.coefs.Intercept.p * 1e13, shown: 6.97 },
    { what: 'Slope p equals Significance F (× 1E34)', value: RS.coefs.guests.p * 1e34, shown: 1.47 },
    { what: 'Intercept SE', value: RS.coefs.Intercept.se, shown: 26.2093, tol: 0.00005 },
    { what: 'Slope SE', value: RS.coefs.guests.se, shown: 0.2964, tol: 0.00005 },
    { what: 'Slope t', value: RS.coefs.guests.t, shown: 22.5, tol: 0.05 },
    { what: 't = b / SE', value: b1 / RS.coefs.guests.se, shown: RS.coefs.guests.t, tol: 1e-9 },
    { what: 'Intercept t', value: RS.coefs.Intercept.t, shown: 8.69451, tol: 0.000005 },
    { what: 't(0.025, 73)', value: t73, shown: 1.993 },
    { what: 'Slope lower 95%', value: RS.coefs.guests.low, shown: 6.08 },
    { what: 'Slope upper 95%', value: RS.coefs.guests.high, shown: 7.26 },
    { what: 'Lower = b − t × SE', value: b1 - t73 * RS.coefs.guests.se, shown: RS.coefs.guests.low, tol: 1e-9 },
    { what: 'Intercept lower 95%', value: RS.coefs.Intercept.low, shown: 175.642, tol: 0.0005 },
    { what: 'Intercept upper 95%', value: RS.coefs.Intercept.high, shown: 280.112, tol: 0.0005 },
    { what: 'R squared as % explained', value: RS.r2 * 100, shown: 87.4, tol: 0.05 },
    { what: 'Unexplained %', value: (1 - RS.r2) * 100, shown: 12.6, tol: 0.05 },
    { what: 'Quote sheet per guest', value: 6.5, shown: 6.50 },
    { what: 'Fewest guests (one-day)', value: Math.min(...G1), shown: 35 },
    { what: 'Most guests (one-day)', value: Math.max(...G1), shown: 207 },
    { what: 'Prediction at 100 guests', value: pred(100), shown: 894.80 },
    { what: 'Conference guests', value: CONF[4], shown: 263 },
    { what: 'Conference invoice', value: CONF[9], shown: 4200 },
    { what: 'Conference date (day of March)', value: Number(CONF[1].slice(8)), shown: 12 },
    { what: 'All-events slope', value: RA.coefs.guests.b, shown: 10.15 },
    { what: 'All-events intercept', value: RA.coefs.Intercept.b, shown: -36.43 },
    { what: 'All-events R squared', value: RA.r2, shown: 0.746, tol: 0.0005 },
    { what: 'All-events standard error', value: RA.se, shown: 232.54 },
    // sample or population, quartile methods
    { what: 'STDEV.P orders', value: sdP(TOT), shown: 100.68 },
    { what: 'Breakfast events', value: BREAKFAST.length, shown: 13 },
    { what: 'Breakfast STDEV.S', value: sdS(BREAKFAST), shown: 326.60 },
    { what: 'Breakfast STDEV.P', value: sdP(BREAKFAST), shown: 313.79 },
    { what: 'Breakfast SDs differ by about $13', value: sdS(BREAKFAST) - sdP(BREAKFAST), shown: 13, tol: 0.5 },
    { what: 'Q1 position INC (n = 231)', value: 1 + (n - 1) * 0.25, shown: 58.5 },
    { what: '58th sorted order', value: sorted(TOT)[57], shown: 15.30 },
    { what: '59th sorted order', value: sorted(TOT)[58], shown: 15.50 },
    { what: 'Q1 position EXC', value: (n + 1) * 0.25, shown: 58 },
    { what: 'Q1 EXC', value: exc(TOT, 0.25), shown: 15.30 },
    { what: 'Q3 EXC', value: exc(TOT, 0.75), shown: 39.00 },
    { what: '90th percentile EXC', value: exc(TOT, 0.9), shown: 76.80 },
    { what: 'Quartile methods differ by at most ten cents (orders)', value: Math.max(Math.abs(inc(TOT, 0.25) - exc(TOT, 0.25)), Math.abs(inc(TOT, 0.75) - exc(TOT, 0.75))), shown: 0.10 },
    // ToolPak report
    { what: 'Standard error of the mean', value: sdS(TOT) / Math.sqrt(n), shown: 6.63879, tol: 0.000005 },
    { what: 'Sample variance', value: sdS(TOT) ** 2, shown: 10180.98, tol: 0.005 },
    { what: 'Kurtosis', value: kurt(TOT), shown: 199.5, tol: 0.05 },
    { what: 'Skewness', value: skew(TOT), shown: 13.66 },
    { what: 'Range', value: Math.max(...TOT) - Math.min(...TOT), shown: 1499.4 },
    { what: 'Confidence level', value: conf(TOT), shown: 13.08 },
    { what: 'Sum', value: sum(TOT), shown: 9096.15 },
    { what: 'KURT matches Microsoft example', value: kurt([3, 4, 5, 2, 3, 4, 5, 6, 4, 7]), shown: -0.151800, tol: 0.0000005 },
    { what: 'SKEW matches Microsoft example', value: skew([3, 4, 5, 2, 3, 4, 5, 6, 4, 7]), shown: 0.359543, tol: 0.0000005 },
    // examples
    { what: 'Breakfast invoices in date order', value: BREAKFAST.join(',') === '600,1120,700,1140,1060,1050,540,1430,1520,480,810,870,740' ? 1 : 0, shown: 1 },
    { what: 'Breakfast total', value: sum(BREAKFAST), shown: 12060 },
    { what: 'Breakfast mean', value: mean(BREAKFAST), shown: 927.69 },
    { what: 'Breakfast median', value: inc(BREAKFAST, 0.5), shown: 870 },
    { what: 'Breakfast Q1 INC', value: inc(BREAKFAST, 0.25), shown: 700 },
    { what: 'Breakfast Q3 INC', value: inc(BREAKFAST, 0.75), shown: 1120 },
    { what: 'Breakfast IQR INC', value: inc(BREAKFAST, 0.75) - inc(BREAKFAST, 0.25), shown: 420 },
    { what: 'Breakfast Q1 EXC', value: exc(BREAKFAST, 0.25), shown: 650 },
    { what: 'Breakfast Q3 EXC', value: exc(BREAKFAST, 0.75), shown: 1130 },
    { what: 'Breakfast IQR EXC', value: exc(BREAKFAST, 0.75) - exc(BREAKFAST, 0.25), shown: 480 },
    { what: 'Q1 moves by $50', value: inc(BREAKFAST, 0.25) - exc(BREAKFAST, 0.25), shown: 50 },
    { what: 'IQR moves by $60', value: (exc(BREAKFAST, 0.75) - exc(BREAKFAST, 0.25)) - (inc(BREAKFAST, 0.75) - inc(BREAKFAST, 0.25)), shown: 60 },
    { what: 'Two largest breakfasts', value: sorted(BREAKFAST)[11] + sorted(BREAKFAST)[12], shown: 1430 + 1520 },
    { what: 'Standard error without office order', value: sdS(NOB) / Math.sqrt(230), shown: 1.76 },
    { what: 'Standard error with office order', value: sdS(TOT) / Math.sqrt(231), shown: 6.64 },
    { what: 'Confidence level without', value: conf(NOB), shown: 3.47 },
    { what: 'Skewness without', value: skew(NOB), shown: 2.29 },
    { what: 'Kurtosis without', value: kurt(NOB), shown: 6.73 },
    { what: 'Kurtosis with', value: kurt(TOT), shown: 199.48 },
    { what: 'Per-head rule (M01: about $9)', value: D.perHead, shown: 9, tol: 0.5 },
    { what: 'Line at 40', value: pred(40), shown: 494.65 },
    { what: 'Line at 80', value: pred(80), shown: 761.42 },
    { what: 'Line at 150', value: pred(150), shown: 1228.26 },
    { what: 'Line at 200', value: pred(200), shown: 1561.73 },
    { what: 'Gap at 40', value: pred(40) - 360, shown: 134.65 },
    { what: 'Gap at 80', value: pred(80) - 720, shown: 41.42 },
    { what: 'Gap at 150', value: pred(150) - 1350, shown: -121.74 },
    { what: 'Gap at 200', value: 1800 - pred(200), shown: 238.27 },
    { what: 'Crossover guests', value: cross, shown: 97.8, tol: 0.05 },
    { what: 'Crossover about 98', value: cross, shown: 98, tol: 0.5 },
  ],
};
