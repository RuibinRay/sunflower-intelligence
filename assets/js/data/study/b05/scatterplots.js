// scatterplots.js — B05 · Scatterplots. Content only; exercises are in scatterplots.ex.js. Uses the cafés' daily log
// (case.js: column, CLEAN_ROWS, CAFE_ROWS, SLIP, DERIVED) for direction, form, strength and unusual points, the
// overplotting and time-order problems of 612 points, and Ana's iced-drink planning. Anscombe's quartet uses the values
// in R's datasets package (anscombe). Pemberton Cinema is fictional. Every figure printed is recomputed in `checks`.
import { column, CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS, SLIP, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, variance } from '../../../core/stats.js?v=20';

const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const at = (n) => CAFE_COLUMNS.indexOf(n);
const r = (a, b, o) => C.pearson(column(a, o), column(b, o)).r;
const rho = (a, b, o) => C.spearman(column(a, o), column(b, o)).rho;

// ---------------------------------------------------------------- the log
const HIGH = column('high_f'), ICED = column('iced_share');
const BANDS = [[25, 40], [40, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 100]].map(([lo, hi]) => {
  const v = ICED.filter((_, i) => HIGH[i] >= lo && HIGH[i] < hi);
  return { lo, hi, n: v.length, share: mean(v) };
});
const LINE = (() => { const mx = mean(HIGH), my = mean(ICED); let sxy = 0, sxx = 0; HIGH.forEach((v, i) => { sxy += (v - mx) * (ICED[i] - my); sxx += (v - mx) ** 2; }); const b = sxy / sxx; return (x) => my + b * (x - mx); })();
const bandResid = [[25, 40], [40, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 100]].map(([lo, hi]) => { const idx = HIGH.map((_, i) => i).filter((i) => HIGH[i] >= lo && HIGH[i] < hi); return mean(idx.map((i) => ICED[i] - LINE(HIGH[i]))); });
const rainZero = column('rain_in').filter((v) => v === 0).length;
const festival = CLEAN_ROWS.filter((row) => row[at('festival')] === 1);
const festFoot = festival.map((row) => row[at('footfall')]);
const staff = column('peak_staff_hours'), trans = column('transactions');
const posCount = {}; staff.forEach((s, i) => { const k = `${s}|${trans[i]}`; posCount[k] = (posCount[k] || 0) + 1; });
const stacked = Object.values(posCount).filter((c) => c > 1).reduce((s, c) => s + c, 0);
const staffLevels = new Set(staff).size, highLevels = new Set(HIGH).size;
const memHigh = r('high_f', 'loyalty_members', H);
const mFootRaw = column('footfall', { ...M, raw: true }), mTrans = column('transactions', M);
const mSlipR = C.pearson(mFootRaw, mTrans).r, mCleanR = r('footfall', 'transactions', M);
// symmetry: r of y on x equals r of x on y
const symm = C.pearson(column('transactions'), column('footfall')).r;

// ---------------------------------------------------------------- Anscombe's quartet (R datasets::anscombe)
const AX = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], AX4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8];
const AY = [
  [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
  [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74],
  [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
  [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89],
];
const AXS = [AX, AX, AX, AX4];
const ANS = AY.map((y, k) => {
  const x = AXS[k], b = C.covariance(x, y) / variance(x);
  return { r: C.pearson(x, y).r, mx: mean(x), my: mean(y), vx: variance(x), vy: variance(y), b, a: mean(y) - b * mean(x) };
});
// set 3 without its stray point (index 2), set 4 without its lone x = 19 (index 7)
const a3Without = C.pearson(AX.filter((_, i) => i !== 2), AY[2].filter((_, i) => i !== 2)).r;

// ---------------------------------------------------------------- Pemberton Cinema (fictional)
const BOOK = [42, 55, 31, 68, 47, 74, 25, 60, 38, 20];
const ADMIT = [118, 152, 93, 174, 124, 188, 84, 155, 112, 210];
const cinR = C.pearson(BOOK, ADMIT).r, cinR9 = C.pearson(BOOK.slice(0, 9), ADMIT.slice(0, 9)).r;

// ---------------------------------------------------------------- figure
const f1 = (x) => Math.round(x * 10) / 10;
function anscombeFigure() {
  const W = 300, Hh = 210, pad = { l: 40, r: 12, t: 26, b: 34 };
  let svg = '<svg viewBox="0 0 640 470" xmlns="http://www.w3.org/2000/svg" font-size="11" fill="currentColor">';
  AY.forEach((y, k) => {
    const ox = (k % 2) * 320 + 10, oy = Math.floor(k / 2) * 230 + 6;
    const X = (v) => ox + pad.l + ((v - 2) / 18) * (W - pad.l - pad.r);
    const Y = (v) => oy + Hh - pad.b - ((v - 2) / 12) * (Hh - pad.t - pad.b);
    svg += `<text x="${ox + W / 2}" y="${oy + 14}" text-anchor="middle" font-size="12">Set ${k + 1}</text>`;
    svg += `<line x1="${X(2)}" x2="${X(20)}" y1="${Y(2)}" y2="${Y(2)}" stroke="var(--ink)"/><line x1="${X(2)}" x2="${X(2)}" y1="${Y(2)}" y2="${Y(14)}" stroke="var(--ink)"/>`;
    [5, 10, 15, 20].forEach((v) => { svg += `<text x="${f1(X(v))}" y="${f1(Y(2) + 14)}" text-anchor="middle" fill="var(--ink-3)">${v}</text>`; });
    [4, 8, 12].forEach((v) => { svg += `<text x="${f1(X(2) - 6)}" y="${f1(Y(v) + 4)}" text-anchor="end" fill="var(--ink-3)">${v}</text>`; });
    svg += `<line x1="${f1(X(3))}" x2="${f1(X(19.5))}" y1="${f1(Y(3 + 0.5 * 3))}" y2="${f1(Y(3 + 0.5 * 19.5))}" stroke="var(--series-2)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    y.forEach((v, i) => { svg += `<circle cx="${f1(X(AXS[k][i]))}" cy="${f1(Y(v))}" r="4" fill="var(--series-1)"/>`; });
    svg += `<text x="${f1(X(20))}" y="${f1(Y(13.2))}" text-anchor="end" fill="var(--ink-3)">r = 0.82</text>`;
  });
  return `${svg}</svg>`;
}

export default {
  slug: 'scatterplots',
  title: 'Scatterplots',
  blurb: 'Plot before you calculate. Read a scatterplot for direction, form, strength and unusual points, choose which variable goes on which axis, and make 612 café-days readable when points pile on top of one another, hide their time order, or tell four different stories behind one correlation.',
  status: 'draft',
  objectives: [
    'Describe a scatterplot by its direction, form, strength and unusual points, in the words of the business question.',
    'Choose which variable to put on each axis, and explain why the correlation is the same either way.',
    'Recognise linear, curved and clustered forms, and points that are extreme but on the pattern versus points that break it.',
    'Handle overplotting in a large dataset with transparency, jitter and one group at a time, and reveal time order that a scatterplot hides.',
    'Explain with Anscombe’s quartet why a correlation must always be read alongside its plot.',
  ],
  prerequisites: [
    { lesson: 'b03/charts-and-conditional-formatting', why: 'Making a scatter chart in Excel, with its two value axes.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'CORREL and the correlation coefficient, which this course takes apart and extends.' },
    { lesson: 'b04/describing-distributions', why: 'Shape, centre, spread and outliers for one variable; a scatterplot does the same for two.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s two cafés, Harbourside on the waterfront and Millbrook in the office district, opened on 1 March 2027. By 31 December their managers had logged 306 days each: 612 rows, one per café per day, with the day’s high temperature and rain, the door counter’s footfall, transactions and sales at the till, hot and iced drinks made, the barista hours rostered for the 7–11 a.m. peak, the average wait at the peak, and the loyalty app’s members. Ana wants to know what goes with what: which measures rise and fall together, and which of those links she can plan around.' },

    { h: 'Plot first' },
    { p: 'Every question in this course is about two variables measured on the same units, here the same café on the same day. The first tool is a picture. A <g>scatterplot</g> draws one point per unit, placed by its value of one variable across the bottom (the x-axis) and its value of the other up the side (the y-axis). B03 built one in Excel as a <g>Scatter chart</g>; this lesson is about reading one and making a large one readable.' },
    { p: 'A correlation coefficient, which B03 calculated with CORREL and the next lesson takes apart, squeezes a whole cloud of points into one number. It is a good summary of some clouds and a misleading one of others, and only the plot tells you which kind you have. Plotting takes seconds; skipping it is how analysts end up reporting a strong relationship that is really one wrong digit, or a weak one that is really a strong curve.' },

    { h: 'Four things to read' },
    { p: 'Read every scatterplot in the same order, and say what you see in the units of the question.' },
    { ol: [
      '<b>Direction.</b> Do the points rise from lower left to upper right, so that high values of one variable go with high values of the other (a <g>positive association</g>), or fall, so that high goes with low (a <g>negative association</g>)? Or neither?',
      '<b>Form.</b> Do the points follow a straight band (a <g>linear relationship</g>), a curve, or separate clusters?',
      '<b>Strength.</b> How tightly do the points hug that form? A thin band is strong; a fat cloud is weak.',
      '<b>Unusual points.</b> Are there points far from the rest, and do they lie on the pattern or break it?',
    ] },
    { p: 'The log has an example of each. Plot the share of drinks that are iced against the day’s high temperature and the points rise steeply: a positive association. Plot hot drinks against the high and they fall: a negative one. Footfall and transactions form a thin straight band, with a correlation of 0.98; rain and footfall form a loose cloud with a correlation of −0.14. Five days at Harbourside sit far to the right of everything else, and one day at Millbrook sits off on its own: the In depth section explains both.' },
    { callout: 'key', title: 'Describe it in a sentence', html: 'A good description names the variables, the direction, the form, the strength and anything unusual, in that order: “On warmer days a larger share of drinks is iced. The rise is strong but not straight: almost flat in the cold, steep between about 60°F and 80°F, and levelling off in the heat.” A correlation can follow the sentence; it can’t replace it.' },

    { h: 'Which variable goes where' },
    { p: 'Put the variable that you think helps explain or predict the other on the x-axis: the <g>explanatory variable</g>. Put the one you want to understand on the y-axis: the <g>response variable</g>. Temperature goes on x and iced share on y, because the weather is known before the day starts and the drinks follow; footfall goes on x and transactions on y, because people must come in before they buy. When neither variable comes first, as with hot and iced drinks made on the same day, either layout is fine.' },
    { p: 'The choice changes how the plot reads, not the correlation. Pearson’s r of transactions with footfall is 0.981, exactly the same as footfall with transactions, because the formula treats the two variables alike. That symmetry is worth remembering: correlation describes how two variables move together and has no idea which one you think comes first. Regression, in B06, is not symmetric, and there the choice of axis changes the answer.' },
  ],

  theory: [
    { h: 'Direction and strength' },
    { p: 'Direction is about the trend, not every point. In a positive association there are days with a high temperature and a modest iced share, but on average the share rises with the temperature. Strength is about scatter around the trend, not its steepness. A gentle slope with the points packed close to it is a strong relationship; a steep slope with points spread widely around it is a weaker one. The correlation coefficient follows strength, not steepness: footfall and transactions at Harbourside correlate at 0.985, and so do footfall and transactions at Millbrook, though the two cafés’ bands rise at different rates.' },
    { p: 'Words such as “strong” and “weak” have no agreed cut-offs. Textbooks attach different labels to the same value of r, and a correlation of 0.3 can be a useful finding in one field and noise in another. The next lesson gives the number its meaning; in a description, say what the plot shows (“a loose downward cloud”) and give r with it.' },

    { h: 'Form: lines, curves and clusters' },
    { p: 'A linear form is the one a correlation coefficient is built for. Many business relationships are not straight. The iced share is an S-shaped curve: on days below 50°F about 6–8% of drinks are iced whatever the exact temperature, between 60°F and 80°F each degree adds roughly two to three percentage points, and above 80°F the share levels off near 80%. The correlation, 0.94, is high because the curve is steady, but a straight line through it misses in a pattern: it predicts a negative share on the coldest days, too high a share in the 50s and 60s and on the hottest days, and too low a share in the 70s and 80s. The nonlinear-and-restricted lesson deals with curves, including a hockey-stick shape in the peak waits.' },
    { p: 'Clusters are separate clouds of points, and they usually mean the data mix two kinds of unit. Plot the day’s sales against its transactions for both cafés together and you see two bands, not one: at the same number of transactions Harbourside takes much more money, because its average ticket is about $5.34 against Millbrook’s $3.27. Inside each café the relationship is close to a perfect line (r = 0.99 at Harbourside and 0.98 at Millbrook), but pooled the correlation is only 0.83. When you see clusters, colour the points by group or plot one group at a time; the groups-and-simpsons-paradox lesson shows how pooling groups can even reverse a correlation.' },
    { p: 'Watch the spread too. If the cloud fans out as x grows, the relationship is tighter for small values than for large ones, and a single number can’t describe both ends. The NIST/SEMATECH handbook lists changing spread among the questions a scatterplot should answer, with outliers and curvature.' },

    { h: 'Unusual points' },
    { p: 'A point can be unusual in x, in y, or in both, and what matters is whether it breaks the pattern. On Harbourside’s five harbour-festival days footfall ran from 502 to 620, far above any other day, and transactions were far higher too. Those points are extreme in both variables but lie on the same band as the rest: they are real days that stretch the range, and they strengthen the straight-line pattern rather than distort it.' },
    { p: String.raw`Millbrook’s footfall on 14 September is recorded as ${SLIP.recorded.toLocaleString('en-US')}, more than six times the busiest day it ever had, while its transactions, 130, were ordinary. The point sits far to the right with an ordinary height: it breaks the pattern. The true count was ${SLIP.actual}; someone typed an extra digit. That one point drops Millbrook’s correlation between footfall and transactions from 0.99 to 0.52, and the two cafés’ pooled correlation from 0.98 to 0.68. A scatterplot shows a slip like this at a glance; a correlation coefficient hides it inside a number that merely looks disappointing. Checking, correcting and reporting such points is the outliers-and-influence lesson’s subject; this course’s lessons use the corrected log unless they say otherwise.` },

    { h: 'Too many points: overplotting' },
    { p: `With 612 points, many land on top of one another and the plot hides how many there are: this is <g>overplotting</g>. It is worst when values are recorded in steps. The day’s high is a whole number of degrees, and both cafés share it, so only ${highLevels} different temperatures appear across 612 rows. Peak barista hours are rostered in half-hours, ${staffLevels} different values in all. Plot transactions against peak barista hours and ${stacked} of the 612 points sit exactly on top of at least one other point: a column of dots can stand for one day or for nine.` },
    { list: [
      '<b>Transparency.</b> Draw each point partly see-through, so that places where many points overlap look darker. In Excel, the marker fill of a data series has a transparency setting.',
      '<b>Jitter.</b> <g>Jittering</g> adds a small random nudge to each point’s position, smaller than the step between recorded values (less than a quarter of an hour for barista hours), so stacked points spread into a visible clump. Jitter is for drawing only: calculate every statistic from the recorded values.',
      '<b>One group at a time.</b> Plot each café on its own panel, with the same axes, or colour the points by café. Side-by-side panels on common axes are called <g>small multiples</g>.',
      '<b>Smaller or hollow markers.</b> They overlap less, and the eye can still count them.',
      '<b>Bins.</b> With many thousands of points, count the points in small squares or hexagons of the plot and shade each by its count. With 612 points this is rarely needed.',
    ] },

    { h: 'Time order hides in a scatterplot' },
    { p: 'Each point in the log is a day, but a scatterplot throws the order of the days away. When both variables drift through the year, the plot can show a shape that only the calendar explains. Harbourside’s loyalty members grow steadily from opening day, while the high temperature rises to July and falls after it. Plotted against each other, the 306 days form a hairpin: members rise with temperature through the spring, then keep rising as temperatures fall in the autumn. The correlation over the whole year is ' + `${(memHigh < 0 ? '−' : '') + Math.abs(memHigh).toFixed(2)}` + ', which describes neither half.' },
    { p: 'To see time order, colour the points by month, or join them with a line in date order (a connected scatterplot). Whenever both variables are <g>Time-series data</g>, ask whether each simply trends with the calendar. Two series that both trend can correlate strongly without having anything to do with each other; the correlation-and-causation lesson returns to Harbourside’s members. Days that follow one another also tend to be alike, so 306 days carry less independent information than 306 unrelated observations would; the testing-correlation lesson says when that matters.' },

    { h: 'Anscombe’s quartet' },
    { p: String.raw`In 1973 the statistician Francis Anscombe published four small datasets to make the case for plotting. Each has 11 pairs of x and y. In all four the mean of x is 9, the variance of x is 11, the mean of y is 7.50, the variance of y is about 4.12, the correlation is 0.82, and the least-squares line is <m>\hat{y} = 3.00 + 0.500x</m>. By every number in a standard summary they are the same dataset.` },
    { figure: {
      svg: anscombeFigure(),
      caption: 'Anscombe’s quartet (values from R’s datasets package). Each panel has the same means, variances, correlation (0.82) and least-squares line, the dashed line ŷ = 3.00 + 0.500x, but tells a different story.',
      alt: 'Four scatterplots in a two-by-two grid, each with x from about 4 to 19 and y from about 3 to 13, and the same dashed straight line rising from lower left to upper right. Set 1: eleven points scattered evenly around the line. Set 2: the points lie on a smooth arch that rises, peaks around x = 11 and falls. Set 3: ten points lie exactly on a shallower straight line and one point at x = 13 lies far above it. Set 4: ten points stand in a vertical column at x = 8 and one point lies far to the right at x = 19, high up. Each panel is labelled r = 0.82.',
    } },
    { table: {
      caption: 'Anscombe’s quartet: the same summary, four different relationships',
      head: ['Set', 'What the plot shows', 'What r = 0.82 hides'],
      rows: [
        ['1', 'A loose straight band', 'Nothing: here r is a fair summary'],
        ['2', 'A smooth curve that rises and falls', 'y is an exact function of x, just not a straight one'],
        ['3', 'A perfect line with one stray point', `Without the stray point r is ${a3Without.toFixed(3)}`],
        ['4', 'One column of points and one far-off point', 'x varies only because of one point; without it there is no relationship to measure'],
      ],
      align: ['l', 'l', 'l'],
    } },
    { p: 'The quartet is the strongest argument for the habit this lesson teaches: compute the number, but never report it without looking at the picture it summarises.' },
  ],

  formulas: [
    { id: 'sct-symmetry', name: 'Correlation is symmetric',
      tex: String.raw`r_{xy} = r_{yx}`,
      where: [[String.raw`r_{xy}`, 'Pearson’s correlation of x with y', ''], [String.raw`r_{yx}`, 'Pearson’s correlation of y with x', '']],
      note: 'Swapping the axes of a scatterplot never changes r. CORREL(A2:A31,B2:B31) equals CORREL(B2:B31,A2:A31). A regression slope is not symmetric (B06).' },
    { id: 'sct-jitter', name: 'Jitter for drawing',
      tex: String.raw`x_i^{\text{plot}} = x_i + u_i, \qquad u_i \sim \text{Uniform}(-h, h)`,
      where: [[String.raw`x_i`, 'The recorded value of point i', 'units of x'], [String.raw`u_i`, 'A random nudge drawn afresh for each point', 'units of x'], [String.raw`h`, 'The largest nudge: less than half the step between recorded values', 'units of x'], [String.raw`x_i^{\text{plot}}`, 'Where the point is drawn', 'units of x']],
      assumptions: 'Used only to draw the plot; every statistic uses the recorded values.',
      note: 'Jitter y the same way when it is recorded in steps too.' },
  ],

  examples: [
    { level: 'simple', title: 'Reading a plot: advance bookings and admissions at a cinema', fictional: true,
      setup: 'Pemberton Cinema (fictional) records, for ten evenings, the tickets booked online by noon and the evening’s total admissions. The manager wants to know whether noon bookings are a useful early guide to how busy the evening will be. Describe the scatterplot.',
      table: { head: ['Evening', 'Booked by noon', 'Admissions'], rows: BOOK.map((b, i) => [String(i + 1), String(b), String(ADMIT[i])]), align: ['l', 'r', 'r'] },
      steps: [
        'Axes: bookings by noon are known first and are the candidate guide, so they go on x (explanatory) and admissions on y (response).',
        'Direction: on nine of the ten evenings, more bookings go with more admissions: a positive association.',
        'Form and strength: those nine points lie close to a straight band rising by roughly two to three admissions per extra booking, a strong linear pattern.',
        'Unusual points: evening 10 had the fewest bookings (20) and the most admissions (210). It sits far above the band at the left: unusual in y for its x, and it breaks the pattern. The manager checks the diary: it was a private hire, sold to a club by phone, so it never appeared in online bookings.',
        String.raw`Number, read with the plot: with evening 10, <x>=CORREL(B2:B11,C2:C11)</x> is ${cinR.toFixed(2)}; without it, ${cinR9.toFixed(3)}. The one point changes the summary from “moderate” to “nearly perfect”.`,
      ],
      answer: `A strong, positive, linear relationship on ordinary evenings (r = ${cinR9.toFixed(3)} without evening 10), with one point that breaks the pattern: a private hire. With it included, r is only ${cinR.toFixed(2)}.`,
      interpretation: 'Noon bookings are a good early guide for public screenings, and private hires need their own line in the plan. Neither number alone tells that story: the plot shows why they differ. Leaving the point out is justified here only because there is a documented reason it belongs to a different kind of evening; the outliers-and-influence lesson sets out when removing a point is honest.' },
    { level: 'challenging', title: 'Anscombe’s quartet: one summary, four stories', fictional: false,
      setup: 'Anscombe’s four datasets each have 11 pairs, the same means (x̄ = 9, ȳ = 7.50), the same variances, r = 0.82 and the same least-squares line. Using the figure in In depth, say for each set whether r = 0.82 is a fair summary, and what you would report instead when it is not.',
      steps: [
        'Set 1: the points scatter evenly around a straight line with no unusual points. r = 0.82 is a fair summary of a moderately strong linear relationship.',
        'Set 2: the points lie on a smooth curve that rises then falls. The relationship is perfect, but not linear; r measures how close the points are to a straight line, so it understates the link. Report the curve (and in B06 fit it), not r.',
        `Set 3: ten points lie exactly on one line and a single point at x = 13 lies far above it. Without that point r is ${a3Without.toFixed(3)}. Check the point: if it is an error, correct it; if it is real, report the relationship with and without it.`,
        'Set 4: ten points share x = 8, so x varies only because of the single point at x = 19. That one point creates the whole correlation. Report that x barely varies and that one observation creates the number; collect data across a range of x before claiming anything.',
        'Common lesson: the summary statistics are identical, so only the plot separates a fair summary (set 1) from a curve (2), an outlier (3) and a single influential point (4).',
      ],
      answer: 'r = 0.82 is a fair summary only for set 1. Set 2 is a perfect curve, set 3 a perfect line spoiled by one point, and set 4 has no relationship apart from one point.',
      interpretation: 'Anscombe built the quartet so that the numbers agree exactly while the pictures disagree completely. In business data the same thing happens less tidily: a data-entry slip (set 3), a curve such as the iced-drink share (set 2), or one big event that stretches the range (set 4). Plot first, and let the plot decide which number to report.' },
    { level: 'applied', title: 'Planning iced drinks from the weather forecast', fictional: true,
      setup: 'Ana wants her baristas to prepare cold-brew concentrate and ice in line with the day’s forecast high. She plots the share of drinks served iced against the high for all 612 café-days and groups the days into temperature bands. What should the plan say?',
      table: { head: ['High (°F)', 'Café-days', 'Average iced share'], rows: BANDS.map((b) => [`${b.lo}–${b.hi - 1}`, String(b.n), `${(b.share * 100).toFixed(0)}%`]), align: ['l', 'r', 'r'] },
      steps: [
        'Axes: the forecast high is known in the morning and the drinks follow, so temperature goes on x and iced share on y.',
        'Direction and strength: a strong positive association; r = 0.94 for the 612 café-days, and each café’s own plot looks the same (0.94 at both).',
        'Form: the band averages show an S-shape rather than a line. Below 50°F the share hardly moves (6% to 8%); from 50°F to 80°F it climbs steeply (13%, then 32%, then 60%); above 80°F it flattens (77% to 81%).',
        'Unusual points and structure: both cafés share each day’s temperature, so each temperature appears about ten times; drawing the points partly transparent, or the two cafés on separate panels, shows the band clearly. No point breaks the pattern.',
        'Plan: base prep on the band, not on a straight line. Cold days need a small fixed amount of iced stock; between 50°F and 80°F each extra 10°F roughly doubles the iced share; above 80°F stock for about four drinks in five being iced.',
      ],
      answer: 'Iced share rises with the day’s high in an S-shape: about 6–8% below 50°F, climbing steeply through the 60s and 70s, and levelling at about 80% above 80°F. Plan prep by temperature band.',
      interpretation: 'The correlation, 0.94, says the link is strong and steady; the plot says how it works, which is what a prep plan needs. A straight-line rule would have Ana overstock iced drinks on cool days in the 50s and 60s and understock on warm days in the 70s and 80s. In the case, warmer weather is built into the data as a reason people choose iced drinks; in real data the plot alone would show only that the two go together, and the prep plan would still work as long as the pattern holds.' },
  ],

  demo: [
    { widget: 'sct-iced', intro: 'The iced share against the day’s high for all 612 café-days. Turn on the least-squares line and see where a straight line misses the S-shaped band: below the points on the coldest days, above them in the 50s and 60s, below them in the 70s and 80s. Colour by café: the two cafés follow the same curve.' },
    { widget: 'sct-sales', intro: 'Sales against transactions, both cafés. Colour by café to see the two bands: each café’s r is close to 1, the pooled r is 0.83.' },
    { widget: 'sct-slip', intro: 'Millbrook’s footfall against transactions as the manager typed it, with the slip on 14 September. Leave out the most influential point and watch r jump back up; the rank correlation hardly moved in the first place.' },
    { widget: 'sct-jitter', intro: 'Transactions against peak barista hours, drawn with jitter: each point is nudged up to 0.2 hours left or right so that stacked days separate. The statistics underneath use the recorded hours.' },
  ],

  mistakes: [
    { title: '“r is 0.94, so the relationship is a straight line.”', html: 'A high r says the points are close to some rising pattern that a line approximates well; it doesn’t say the pattern is straight. The iced share is an S-curve with r = 0.94. Look at the plot, and at whether the points sit on one side of a straight line in some ranges and on the other side elsewhere.' },
    { title: '“r is close to 0, so there is no relationship.”', html: 'r measures only straight-line association. Anscombe’s set 2 is a perfect curve; a U-shape can give r = 0 with a perfect link. A correlation near 0 means no linear trend, which the plot must confirm.' },
    { title: 'Reporting the correlation without plotting', html: 'One slipped digit at Millbrook turns r = 0.99 into 0.52, and nothing in the number says why. The plot shows the stray point immediately. Plot every pair you report, and keep the plot with the number.' },
    { title: 'Treating every extreme point as an error', html: 'The festival days are far from the rest but real, and they lie on the pattern. Only a point that is impossible or contradicts other records (2,566 people and an ordinary 130 transactions) is a candidate error. Unusual is a reason to check, not to delete.' },
    { title: 'Computing statistics on jittered values', html: 'Jitter is a drawing aid. Calculate r and everything else from the recorded values; the jittered ones contain made-up noise.' },
    { title: 'Ignoring which café, or which month, a point belongs to', html: 'Pooled data can show clusters (sales against transactions) or hairpins (members against temperature) that come from mixing groups or periods. Colour by group and by time before trusting the overall pattern.' },
  ],

  application: [
    { case: `Ana’s first pass through the log is a page of scatterplots. For each pair of measures she cares about, she plots one café at a time on common axes, with points drawn partly transparent, and writes one sentence under each plot before looking at any correlation. The page catches the footfall slip on 14 September (corrected to ${SLIP.actual} from the counter’s own record), shows that sales against transactions form two separate bands, one per café, and turns the iced-drink question into a prep plan by temperature band.` },
    { p: 'This is how analysts use scatterplots in practice: as the first look at every relationship, before any model, and as the evidence that goes in the report next to any correlation. A plot of each pair is cheap; a decision based on a number nobody looked at can be expensive. A <g>scatterplot matrix</g>, a grid with one small scatterplot for every pair of variables, puts a whole dataset’s pairs on one page, and the correlation-matrices lesson pairs it with a table of correlations.' },
    { p: 'Write the description in the reader’s terms. “On warmer days a larger share of drinks is iced: almost none below 50°F, about four in five above 80°F, rising steeply in between” tells a café manager what to do. “r = 0.94” does not, and nor does it say that the rise is not straight.' },
    { p: 'Keep the language careful. A scatterplot shows what goes with what in the data you have. It does not show that one variable causes the other: peak barista hours go with transactions because the manager rosters more baristas on days she expects to be busy, not because baristas bring customers in. The NIST/SEMATECH handbook puts it plainly in its entry on scatterplots: association does not prove causality. This course separates the two in its last lesson.' },
    { p: 'Finally, remember what the plot can’t show. It has no time order unless you add it, no groups unless you colour them, and no record of how the data were collected. A scatterplot of the days Ana chose to look at is not a scatterplot of all days; if she had logged only weekdays, or only summer, the picture and its correlation would both change, as the nonlinear-and-restricted lesson shows.' },
  ],

  summary: [
    'Plot every pair before you calculate: a correlation summarises the cloud, and only the plot shows whether the summary is fair.',
    'Read direction (positive or negative), form (linear, curved, clusters), strength (how tightly the points hug the form) and unusual points, and describe them in the units of the question.',
    'Put the explanatory variable on x and the response on y; correlation is symmetric, so the choice changes the reading, not r.',
    'Extreme points that lie on the pattern (the festival days) are different from points that break it (the footfall slip, which takes Millbrook’s r from 0.99 to 0.52).',
    'With many points, use transparency, jitter (for drawing only), smaller markers and one group at a time.',
    'A scatterplot hides time order and groups: colour by month or group, or connect the points in date order.',
    'Anscombe’s quartet: four datasets with r = 0.82 and the same line, and only one of them is a straight-line relationship.',
  ],

  glossary: [
    { term: 'Scatterplot', def: 'A plot of paired data with one point per unit, placed by its value of one variable on the x-axis and of the other on the y-axis, used to see how two numeric variables are related. Excel calls it a scatter chart.' },
    { term: 'Positive association', def: 'A relationship in which high values of one variable tend to go with high values of the other, so the points of a scatterplot rise from lower left to upper right.' },
    { term: 'Negative association', def: 'A relationship in which high values of one variable tend to go with low values of the other, so the points of a scatterplot fall from upper left to lower right.' },
    { term: 'Linear relationship', def: 'A relationship whose points follow a straight-line band, so that each extra unit of x goes with roughly the same change in y.' },
    { term: 'Explanatory variable', def: 'In a pair of variables, the one thought to help explain or predict the other; plotted on the x-axis. Also called the independent or predictor variable.' },
    { term: 'Response variable', def: 'In a pair of variables, the one whose variation you want to understand or predict; plotted on the y-axis. Also called the dependent or outcome variable.' },
    { term: 'Overplotting', def: 'Points of a chart drawn on top of one another, so that the chart hides how many observations lie in each place.' },
    { term: 'Jittering', def: 'Adding a small random nudge to the plotted position of each point, smaller than the step between recorded values, so that overlapping points become visible. Used for drawing only.' },
    { term: 'Small multiples', def: 'A set of small charts of the same kind, one per group or period, drawn on the same axes so that they can be compared at a glance.' },
    { term: 'Scatterplot matrix', def: 'A grid of scatterplots showing every pair of a set of variables, one small plot per pair.' },
    { term: 'Anscombe’s quartet', def: 'Four small datasets published by Francis Anscombe in 1973 that share their means, variances, correlation and least-squares line but look completely different when plotted.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, sections 12.2, “Scatter Plots”, and 12.3, “The Regression Equation”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-2-scatter-plots', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.3.26, “Scatter Plot”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/scatterp.htm', checked: '2026-10-26' },
    { text: 'R Core Team. “anscombe: Anscombe’s Quartet of ‘Identical’ Simple Linear Regressions”, R documentation for the datasets package (citing Anscombe, F. J. (1973), “Graphs in statistical analysis”, <i>The American Statistician</i>, 27(1), 17–21).', url: 'https://search.r-project.org/R/refmans/datasets/html/anscombe.html', checked: '2026-10-26' },
    { text: 'Microsoft Support. “CORREL function”.', url: 'https://support.microsoft.com/en-US/excel/functions/correl-function', checked: '2026-10-26' },
  ],

  checks: [
    // the log
    { what: 'Rows', value: D.rows, shown: 612 },
    { what: 'Days', value: D.days, shown: 306 },
    { what: 'Rows by café', value: column('date', H).length, shown: 306 },
    { what: 'Iced share vs high r (2 dp)', value: D.tempIced.r, shown: 0.94 },
    { what: 'Iced share vs high r, Harbourside', value: r('high_f', 'iced_share', H), shown: 0.94 },
    { what: 'Iced share vs high r, Millbrook', value: r('high_f', 'iced_share', M), shown: 0.94 },
    { what: 'Hot drinks fall with the high', value: Number(D.tempHot.r < 0), shown: 1 },
    { what: 'Footfall–transactions r', value: D.footTrans.r, shown: 0.98 },
    { what: 'Footfall–transactions r (3 dp)', value: D.footTrans.r, shown: 0.981, tol: 0.0005 },
    { what: 'Transactions–footfall r (symmetry)', value: symm, shown: 0.981, tol: 0.0005 },
    { what: 'Symmetry exact', value: symm - D.footTrans.r, shown: 0, tol: 1e-12 },
    { what: 'Rain–footfall r', value: D.rainFootfall.r, shown: -0.14 },
    { what: 'Footfall–transactions r, Harbourside', value: r('footfall', 'transactions', H), shown: 0.985, tol: 0.0005 },
    { what: 'Footfall–transactions r, Millbrook', value: mCleanR, shown: 0.985, tol: 0.0005 },
    { what: 'The two cafés’ bands rise at different rates (slopes differ by more than 0.05)', value: Number(Math.abs(C.covariance(column('footfall', H), column('transactions', H)) / variance(column('footfall', H)) - C.covariance(column('footfall', M), column('transactions', M)) / variance(column('footfall', M))) > 0.05), shown: 1 },
    // S curve
    { what: 'Band <40: iced share (%)', value: BANDS[0].share * 100, shown: 6, tol: 0.5 },
    { what: 'Band 40s: iced share (%)', value: BANDS[1].share * 100, shown: 8, tol: 0.5 },
    { what: 'Band 50s: iced share (%)', value: BANDS[2].share * 100, shown: 13, tol: 0.5 },
    { what: 'Band 60s (%)', value: BANDS[3].share * 100, shown: 32, tol: 0.5 },
    { what: 'Band 70s (%)', value: BANDS[4].share * 100, shown: 60, tol: 0.5 },
    { what: 'Band 80s (%)', value: BANDS[5].share * 100, shown: 77, tol: 0.5 },
    { what: 'Band 90s (%)', value: BANDS[6].share * 100, shown: 81, tol: 0.5 },
    { what: 'Levels off near 80%', value: BANDS[6].share * 100, shown: 80, tol: 2 },
    { what: 'Band counts add to 612', value: BANDS.reduce((s, b) => s + b.n, 0), shown: 612 },
    { what: 'Band <40 days', value: BANDS[0].n, shown: 32 },
    { what: 'Band 40s days', value: BANDS[1].n, shown: 92 },
    { what: 'Band 50s days', value: BANDS[2].n, shown: 116 },
    { what: 'Band 60s days', value: BANDS[3].n, shown: 128 },
    { what: 'Band 70s days', value: BANDS[4].n, shown: 122 },
    { what: 'Band 80s days', value: BANDS[5].n, shown: 110 },
    { what: 'Band 90s days', value: BANDS[6].n, shown: 12 },
    { what: '60–80°F: two to three points per degree (60s to 70s band means ÷ 10)', value: (BANDS[4].share - BANDS[3].share) * 100 / 10, shown: 2.8, tol: 0.25 },
    { what: '50s to 60s roughly doubles', value: BANDS[3].share / BANDS[2].share, shown: 2, tol: 0.6 },
    { what: '60s to 70s roughly doubles', value: BANDS[4].share / BANDS[3].share, shown: 2, tol: 0.2 },
    { what: 'Lowest high', value: Math.min(...HIGH), shown: 28 },
    { what: 'Highest high', value: Math.max(...HIGH), shown: 94 },
    { what: 'About four in five iced above 80°F', value: (BANDS[5].share * BANDS[5].n + BANDS[6].share * BANDS[6].n) / (BANDS[5].n + BANDS[6].n), shown: 0.8, tol: 0.03 },
    { what: 'Each temperature appears about ten times', value: 612 / highLevels, shown: 10, tol: 0.5 },
    { what: 'Line predicts a negative share at the coldest high', value: Number(LINE(Math.min(...HIGH)) < 0), shown: 1 },
    { what: 'Line below points, coldest band', value: Number(bandResid[0] > 0), shown: 1 },
    { what: 'Line above points, 50s and 60s', value: Number(bandResid[2] < 0 && bandResid[3] < 0), shown: 1 },
    { what: 'Line below points, 70s and 80s', value: Number(bandResid[4] > 0 && bandResid[5] > 0), shown: 1 },
    { what: 'Line above points, 90s', value: Number(bandResid[6] < 0), shown: 1 },
    // clusters
    { what: 'Mean ticket Harbourside', value: D.meanTicketH, shown: 5.34, tol: 0.005 },
    { what: 'Mean ticket Millbrook', value: D.meanTicketM, shown: 3.27, tol: 0.005 },
    { what: 'Transactions–sales r Harbourside', value: r('transactions', 'sales', H), shown: 0.99 },
    { what: 'Transactions–sales r Millbrook', value: r('transactions', 'sales', M), shown: 0.98 },
    { what: 'Transactions–sales r pooled', value: D.transSales.r, shown: 0.83 },
    // unusual points
    { what: 'Festival days', value: festival.length, shown: 5 },
    { what: 'Festival days all Harbourside', value: festival.filter((row) => row[at('cafe')] === 'Harbourside').length, shown: 5 },
    { what: 'Festival footfall min', value: Math.min(...festFoot), shown: 502 },
    { what: 'Festival footfall max', value: Math.max(...festFoot), shown: 620 },
    { what: 'Festival footfall above every other day', value: Number(Math.min(...festFoot) > Math.max(...column('footfall').filter((_, i) => CLEAN_ROWS[i][at('festival')] === 0))), shown: 1 },
    { what: 'Slip recorded', value: SLIP.recorded, shown: 2566 },
    { what: 'Slip actual', value: SLIP.actual, shown: 256 },
    { what: 'Slip more than six times Millbrook’s busiest day', value: Number(SLIP.recorded / Math.max(...column('footfall', M)) > 6), shown: 1 },
    { what: 'Slip is ten times the true count', value: SLIP.recorded / SLIP.actual, shown: 10, tol: 0.05 },
    { what: 'Slip-day transactions', value: CAFE_ROWS.find((row) => row[at('date')] === SLIP.date && row[at('cafe')] === SLIP.cafe)[at('transactions')], shown: 130 },
    { what: 'Millbrook r with slip', value: mSlipR, shown: 0.52 },
    { what: 'Millbrook r corrected', value: mCleanR, shown: 0.99 },
    { what: 'Pooled r with slip', value: D.footTransRaw.r, shown: 0.68 },
    { what: 'Rho with slip barely moves', value: D.footTransRhoRaw.rho, shown: 0.97 },
    // overplotting
    { what: 'Distinct temperatures', value: highLevels, shown: 60 },
    { what: 'Distinct staff-hour values', value: staffLevels, shown: 20 },
    { what: 'Stacked points', value: stacked, shown: 345 },
    { what: 'Largest stack (one day or nine)', value: Math.max(...Object.values(posCount)), shown: 9 },
    { what: 'Rain-free rows', value: rainZero, shown: 418 },
    // time order
    { what: 'Members vs high r, Harbourside', value: memHigh, shown: -0.13, tol: 0.006 },
    { what: 'Spring positive', value: Number(D.membersTempSpring > 0), shown: 1 },
    { what: 'Autumn negative', value: Number(D.membersTempAutumn < 0), shown: 1 },
    // Anscombe
    ...ANS.flatMap((s, k) => [
      { what: `Anscombe ${k + 1} r`, value: s.r, shown: 0.82 },
      { what: `Anscombe ${k + 1} mean x`, value: s.mx, shown: 9 },
      { what: `Anscombe ${k + 1} var x`, value: s.vx, shown: 11 },
      { what: `Anscombe ${k + 1} mean y`, value: s.my, shown: 7.50 },
      { what: `Anscombe ${k + 1} var y about 4.12`, value: s.vy, shown: 4.12, tol: 0.01 },
      { what: `Anscombe ${k + 1} slope`, value: s.b, shown: 0.500, tol: 0.0005 },
      { what: `Anscombe ${k + 1} intercept`, value: s.a, shown: 3.00 },
    ]),
    { what: 'Anscombe pairs', value: AX.length, shown: 11 },
    { what: 'Anscombe 3 without stray point', value: a3Without, shown: 1.000, tol: 0.0005 },
    { what: 'Anscombe 3 stray point x', value: AX[2], shown: 13 },
    { what: 'Anscombe 4 x = 8 count', value: AX4.filter((v) => v === 8).length, shown: 10 },
    { what: 'Anscombe 4 lone x', value: Math.max(...AX4), shown: 19 },
    { what: 'Anscombe year', value: 1973, shown: 1973 },
    // cinema
    { what: 'Cinema evenings', value: BOOK.length, shown: 10 },
    { what: 'Cinema r with private hire', value: cinR, shown: 0.41 },
    { what: 'Cinema r without', value: cinR9, shown: 0.996, tol: 0.0005 },
    { what: 'Evening 10 bookings (fewest)', value: Math.min(...BOOK), shown: 20 },
    { what: 'Evening 10 admissions (most)', value: Math.max(...ADMIT), shown: 210 },
    { what: 'Two to three admissions per booking (slope, nine evenings)', value: C.covariance(BOOK.slice(0, 9), ADMIT.slice(0, 9)) / variance(BOOK.slice(0, 9)), shown: 2.5, tol: 0.5 },
  ],
};
