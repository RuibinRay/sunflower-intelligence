// outliers-and-influence.js — B05 · Outliers and influence. Content only; exercises are in outliers-and-influence.ex.js.
// Uses the raw café log (CAFE_ROWS, with the footfall slip on 14 September at Millbrook) and the corrected log
// (CLEAN_ROWS) from case.js, and Harbourside's five festival days. Kestrel Bike Hire and the ten-point figure are
// fictional. Testing a correlation is module 2's; curves and restricted ranges are nonlinear-and-restricted's; groups
// are groups-and-simpsons-paradox's. Every figure printed is recomputed in `checks`.
import { column, DERIVED as D, SLIP, CAFE_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';

// ---------------------------------------------------------------- the slip
const at = (name) => CAFE_COLUMNS.indexOf(name);
const FR = column('footfall', { raw: true }), FC = column('footfall'), TR = column('transactions');
const DATE = column('date'), CAFE = column('cafe');
const SI = DATE.findIndex((d, i) => d === SLIP.date && CAFE[i] === SLIP.cafe);
const n = FR.length;
const ZX = C.zScores(FR), ZY = C.zScores(TR);
const slipTerm = ZX[SI] * ZY[SI] / (n - 1);
const restTerm = ZX.reduce((s, v, i) => (i === SI ? s : s + v * ZY[i]), 0) / (n - 1);
const INF_RAW = C.influence(FR, TR);
const deltas = INF_RAW.without.map((r, i) => [i, r - INF_RAW.r]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
const second = deltas[1];
const conv = FC.map((f, i) => TR[i] / f).filter((_, i) => i !== SI);
const MB = { cafe: 'Millbrook' };
const mRaw = C.pearson(column('footfall', { ...MB, raw: true }), column('transactions', MB));
const mClean = C.pearson(column('footfall', MB), column('transactions', MB));
const mRhoRaw = C.spearman(column('footfall', { ...MB, raw: true }), column('transactions', MB));
const mRhoClean = C.spearman(column('footfall', MB), column('transactions', MB));
const footTransRhoClean = C.spearman(FC, TR).rho;
const millFootSorted = column('footfall', { ...MB, raw: true }).slice().sort((a, b) => b - a);

// ---------------------------------------------------------------- the festival days (Harbourside)
const HB = { cafe: 'Harbourside' };
const hF = column('footfall', HB), hW = column('peak_wait_min', HB), hT = column('high_f', HB), hFest = column('festival', HB), hDate = column('date', HB);
const hSt = column('peak_staff_hours', HB), hTr = column('transactions', HB);
const keep = (a) => a.filter((_, i) => !hFest[i]);
const fwAll = C.pearson(hF, hW), fwNo = C.pearson(keep(hF), keep(hW));
const fwRhoAll = C.spearman(hF, hW).rho, fwRhoNo = C.spearman(keep(hF), keep(hW)).rho;
const tfAll = C.pearson(hT, hF), tfNo = C.pearson(keep(hT), keep(hF));
const fwInf = C.influence(hF, hW);
const may29 = hDate.indexOf('2027-05-29'), may1 = hDate.indexOf('2027-05-01');
const tfInf = C.influence(hT, hF);
const festF = hF.filter((_, i) => hFest[i]), festW = hW.filter((_, i) => hFest[i]);
const festZ = C.zScores(hF).filter((_, i) => hFest[i]);
const may1Load = hTr[may1] * 0.55 / hSt[may1];

// ---------------------------------------------------------------- Kestrel Bike Hire (fictional)
const KX = [2, 3, 4, 4, 5, 6, 6, 7, 8, 9];
const KY_TRUE = [14, 18, 17, 22, 21, 26, 23, 27, 30, 31];
const KY = KY_TRUE.map((v, i) => (i === 6 ? 230 : v));
const kRaw = C.pearson(KX, KY).r, kFix = C.pearson(KX, KY_TRUE).r;
const kRhoRaw = C.spearman(KX, KY).rho, kRhoFix = C.spearman(KX, KY_TRUE).rho;
const kZ = C.zScores(KY)[6], kMaxZ = 9 / Math.sqrt(10);
const kWithout = C.influence(KX, KY).without[6];

// ---------------------------------------------------------------- figure: three kinds of unusual point (fictional)
const BX = [2, 3, 4, 4, 5, 6, 6, 7, 8, 9], BY = [14, 18, 17, 22, 21, 26, 23, 27, 30, 31];
const PANELS = [
  { title: 'A: far out in x, on the trend', p: [16, 52] },
  { title: 'B: far out in y only', p: [5, 44] },
  { title: 'C: far out in x, off the trend', p: [16, 15] },
];
PANELS.forEach((q) => { q.r = C.pearson([...BX, q.p[0]], [...BY, q.p[1]]).r; });
const baseR = C.pearson(BX, BY).r;
const f1 = (x) => Math.round(x * 10) / 10;
const f3 = (x) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(3);
function threeKinds() {
  let svg = '<svg viewBox="0 0 660 250" xmlns="http://www.w3.org/2000/svg" font-size="11" fill="currentColor">';
  PANELS.forEach((q, k) => {
    const ox = 30 + k * 215, X = (v) => ox + 10 + v * 10.5, Y = (v) => 205 - v * 3;
    svg += `<line x1="${ox}" x2="${ox + 190}" y1="205" y2="205" stroke="var(--ink-3)" stroke-width="1"/><line x1="${ox}" x2="${ox}" y1="25" y2="205" stroke="var(--ink-3)" stroke-width="1"/>`;
    [0, 20, 40, 60].forEach((v) => { svg += `<text x="${ox - 4}" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="9" fill="var(--ink-3)">${v}</text>`; });
    [0, 5, 10, 15].forEach((v) => { svg += `<text x="${f1(X(v))}" y="218" text-anchor="middle" font-size="9" fill="var(--ink-3)">${v}</text>`; });
    BX.forEach((x, i) => { svg += `<circle cx="${f1(X(x))}" cy="${f1(Y(BY[i]))}" r="3.5" fill="var(--series-1)"/>`; });
    svg += `<circle cx="${f1(X(q.p[0]))}" cy="${f1(Y(q.p[1]))}" r="5" fill="none" stroke="var(--series-2)" stroke-width="2.2"/>`;
    svg += `<text x="${ox + 95}" y="14" text-anchor="middle" font-size="11">${q.title}</text>`;
    svg += `<text x="${ox + 95}" y="240" text-anchor="middle" font-size="11">r = ${f3(baseR)} → ${f3(q.r)}</text>`;
  });
  return `${svg}</svg>`;
}

export default {
  slug: 'outliers-and-influence',
  title: 'Outliers and influence',
  blurb: 'One wrong digit among 612 days can turn a near-perfect correlation into a middling one. Find the points that move a correlation, measure how much each one matters, and decide what to do with them without deleting what you dislike.',
  status: 'draft',
  objectives: [
    'Distinguish points that are unusual in x, in y and in both, and predict whether each will raise or lower Pearson’s r.',
    'Calculate leave-one-out correlations and use them to measure how much a single point moves r.',
    'Explain, with z-scores and standard deviations, why one extreme value can drag r down even though its own share of r is small.',
    'Diagnose a data-entry slip with plausibility checks, correct it from the source and record the change.',
    'Write up a correlation with and without genuine extreme points, and use rank correlation as a check on robustness.',
  ],
  prerequisites: [
    { lesson: 'b05/covariance-and-pearson', why: 'Pearson’s r as covariance divided by the two standard deviations, and as the average product of z-scores.' },
    { lesson: 'b05/rank-correlation', why: 'Spearman’s ρ, which this lesson uses as a check on how much a few points matter.' },
    { lesson: 'b02/outliers', why: 'Z-scores, fences and the difference between an error and a genuine extreme in one variable.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'At the end of 2027 Ana asks the café log a simple question: do more people through the door mean more sales at the till? She expects footfall and transactions to move almost in step, since about half of the people the door counter sees buy something. Across the 612 café-days she gets r = 0.679. That is a fair correlation, but far weaker than the plot of a typical week suggests.' },

    { h: 'One point among 612' },
    { p: 'The scatterplot answers the puzzle at once. Almost every day sits in a tight band rising from bottom left to top right, and one point sits far to the right on its own: Millbrook on Tuesday 14 September, with a footfall of 2,566 and 130 transactions. No other Millbrook day reached 410 people. A day on which 2,566 people came in and only 130 bought anything would mean a conversion of 5.1%, when every other day in the log converts between 28% and 67% of visitors.' },
    { p: 'Ana checks the door counter’s own daily export: it says 256. Whoever typed the log added a 6. Corrected, the correlation between footfall and transactions is 0.981. A single slip among 612 rows had cut r by 0.302, from a relationship that is close to a straight line to one that looks only moderate.' },
    { p: 'This lesson is about such points. An <g>outlier</g> is an observation that lies an abnormal distance from the rest. With two variables, “abnormal” can mean far out on x, far out on y, or simply far from the pattern the other points follow. Some outliers are errors to be corrected; others are real days that deserve to be kept and explained. What they share is that a correlation coefficient, which is built from distances from the mean, can be moved a long way by very few of them.' },

    { h: 'Where the point sits decides what it does' },
    { p: 'Whether an unusual point raises or lowers r depends on where it sits relative to the pattern. The figure adds one point to ten fictional points that rise together with r = 0.964.' },
    { figure: {
      svg: threeKinds(),
      caption: 'The same ten fictional points (r = 0.964) with one extra point, circled. A, far to the right and in line with the others, raises r to 0.989. B, at an ordinary x but far above the others, lowers it to 0.575. C, far to the right but at an ordinary height, lowers it to 0.144.',
      alt: 'Three small scatterplots side by side, each with x from 0 to 17 and y from 0 to 60. Each shows the same ten points rising from about (2, 14) to (9, 31). Panel A adds a circled point at (16, 52), far right and continuing the upward line; r rises from 0.964 to 0.989. Panel B adds a circled point at (5, 44), at an ordinary x but well above the others; r falls to 0.575. Panel C adds a circled point at (16, 15), far right but low, against the trend; r falls to 0.144.',
    } },
    { list: [
      '<b>Far out in x and in y, on the trend (A).</b> The point stretches the pattern. It adds a large positive product of z-scores and makes the cloud look more like a line, so r rises, sometimes a lot. Harbourside’s festival days, with about four times the usual footfall and long waits to match, are of this kind.',
      '<b>Far out in y only (B).</b> At an ordinary x the point’s z-score in x is small, so its own product contributes little; but it inflates the spread of y, which shrinks every other point’s contribution. r falls.',
      '<b>Far out in x, off the trend (C).</b> The most damaging kind. It inflates the spread of x and contributes nothing in return, because its y is ordinary. Millbrook’s slip is exactly this point: a footfall nine times too large with an ordinary number of transactions.',
    ] },
    { callout: 'key', title: 'Look before you compute', html: 'A correlation summarises a cloud of points in one number, and one point can write most of that number. Plot the data first, find the points that sit apart, and ask of each one: is it real, and does the conclusion depend on it?' },

    { h: 'Errors and genuine extremes' },
    { p: 'The slip and the festival days are both outliers, but they call for opposite treatment. The slip is an error with a known correct value: fix it, note the fix in the <g>cleaning log</g>, and carry on with the corrected log. The festival days are real: Harbour Days and the Fourth of July really did bring 500 to 620 people through Harbourside’s door. Deleting them would describe a café that never had a festival. Keeping them without comment would let five days speak for 306. The honest course is to report the correlation both ways and say what the difference means.' },
  ],

  theory: [
    { h: 'Why one point can move r so far' },
    { p: String.raw`Pearson’s r is the average product of z-scores, <m>r = \frac{1}{n-1}\sum z_{x} z_{y}</m>, where each <g>z-score</g> is a value’s distance from its mean in standard deviations. Each point contributes its own term <m>z_{x} z_{y}/(n-1)</m>. You might expect the slip to damage r through a huge negative term, but its term is small and positive: its footfall is 18.3 standard deviations above the mean, its transactions only 0.71 above, and the product divided by 611 is 0.021.` },
    { p: 'The damage is done through the standard deviation. The slip raises the standard deviation of footfall from 87.1 to 129.9 people, so every other day’s z-score for footfall shrinks by about a third. In the corrected log all 612 terms add up to 0.981; with the slip, the other 611 add up to only 0.658. In short, r ≈ 0.981 × 87.1 ÷ 129.9 ≈ 0.66, plus the slip’s own 0.021. An outlier in x that does not follow the pattern lowers r mostly by inflating the spread, not by its own contribution.' },
    { p: 'The same reasoning explains the other two cases. A point far out on both variables and on the trend inflates both standard deviations but also adds a large positive product, enough to raise r. A point far out in y alone inflates the spread of y and adds little, so r falls.' },

    { h: 'Measuring influence: leave one out' },
    { p: String.raw`An <g>influential point</g> is one whose removal would change a result noticeably. The simplest measure for a correlation is a <g>leave-one-out analysis</g>: compute r again without point i, call it <m>r_{(-i)}</m>, and look at the change <m>r_{(-i)} - r</m> for every point. With 612 points that is 612 correlations, which software does in an instant (the engine behind this course’s widgets does exactly this).` },
    { table: {
      caption: 'Leave-one-out changes in r for footfall and transactions, raw log (the two largest)',
      head: ['Day left out', 'Footfall', 'Transactions', 'r without it', 'Change in r'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['14 Sep, Millbrook (the slip)', '2,566', '130', '0.981', '+0.302'],
        ['29 May, Harbourside (festival)', '620', '293', '0.672', '−0.007'],
      ],
    } },
    { p: 'The table shows how lopsided influence can be. Removing the slip changes r by +0.302; removing any other single day changes it by at most 0.007. When one point’s change dwarfs all the others, look at that point before anything else. Influence says how much a point matters, not whether it is wrong: the festival day of 29 May is the second most influential day here, and it is perfectly genuine.' },
    { p: 'Regression has fuller measures of influence, such as leverage and Cook’s distance, which look at how a point moves a fitted line; B06 covers them. For a correlation, leave-one-out changes are usually enough.' },

    { h: 'Finding outliers in two variables' },
    { p: 'Screening each variable on its own, with z-scores or the 1.5 × IQR fences from B02, catches points like the slip, which is extreme in footfall. It misses a point that is ordinary on each variable but unusual in combination: a day with 300 visitors and 30 transactions has an unremarkable footfall and an unremarkable number of transactions, yet a conversion rate no real day has. Use three checks together:' },
    { ol: [
      '<b>Plot.</b> A scatterplot shows every kind of unusual point at once, including points that break the pattern without being extreme on either axis.',
      '<b>Screen each variable</b> with z-scores or fences, remembering that these are conventions (|z| > 3 is common, not a law).',
      '<b>Check plausibility with a ratio or rule from the business.</b> Transactions divided by footfall must lie between 0 and 1, and in practice between about a quarter and two thirds; iced plus hot drinks should be at least the transactions on most days; a wait can’t be negative. Ratios like these catch errors that no z-score will.',
    ] },
    { callout: 'warn', title: 'Small samples hide their outliers from z-scores', html: String.raw`In a sample of n values, no z-score can exceed <m>(n-1)/\sqrt{n}</m> in absolute value, because the outlier inflates the very standard deviation it is measured by. With 10 values the limit is 2.85, so a rule of |z| > 3 can never flag anything, however wild the value. The simple example below shows a typing error that reaches only z = 2.84. In small samples, plot the data and check plausibility instead.` },

    { h: 'What to do, and what not to do' },
    { ol: [
      '<b>Check the source.</b> Go back to the door counter’s export, the till report, the paper roster. Most extreme values in business data are either real events or recording slips, and the source usually says which.',
      '<b>Correct errors when the correct value is known,</b> and record the change: what was wrong, what it became, and on what evidence.',
      '<b>When a value is impossible and the source is lost,</b> set it to missing (CORREL skips text and empty cells, and the engine uses pairwise deletion) and say so. Don’t guess a replacement.',
      '<b>Keep genuine extremes,</b> and report the correlation with and without them, with the reason the two differ.',
      '<b>Check with ranks.</b> Spearman’s ρ uses only the order of the values, so a point can be at most the largest rank. For the raw log, ρ is 0.970 with the slip and 0.971 without; when Pearson’s r and Spearman’s ρ disagree sharply, a few points are usually responsible.',
    ] },
    { p: 'What not to do is delete points because the result looks better without them. A correlation computed after removing the points that “don’t fit” is a correlation of your expectations. Decide your rules for handling outliers before you see which way they push the result, apply them to every point, and report every exclusion.' },
    { callout: 'note', title: 'Ranks are a check, not a cure', html: 'Spearman’s ρ resists a single wild value well in large samples, but it measures something slightly different (whether the relationship is monotonic) and still counts an error as a real observation. With 20 Millbrook days in September, ρ falls from 0.941 to 0.810 when the slip is left in. Correcting the error is always better than finding a statistic it moves less.' },

    { h: 'Genuine extremes: the festival days' },
    { p: 'At Harbourside, footfall and the average wait at the morning peak have r = 0.673 across all 306 days. The five festival days had footfalls of 502 to 620, between 5.2 and 6.9 standard deviations above the café’s mean, when no other day passed 282. Their waits were long as well, from 4.7 to 15.3 minutes against a typical 2. They are far out on both variables and broadly on the trend, so they pull r up: without them r is 0.476, and leaving out 29 May alone takes it to 0.595.' },
    { p: 'The same five days pull a different correlation the other way. Footfall and the day’s high temperature have r = 0.436 at Harbourside with the festivals and 0.508 without: festival crowds were huge on warm, but not unusually warm, days, so the five points sit far above the temperature trend, outliers in y. One set of genuine days can raise one correlation and lower another, which is why the decision to keep or set them aside should be made for the question, and reported.' },
  ],

  formulas: [
    { id: 'out-z-term', name: 'A point’s share of Pearson’s r',
      tex: String.raw`r = \frac{1}{n-1}\sum_{i=1}^{n} z_{x,i}\,z_{y,i}, \qquad z_{x,i} = \frac{x_i - \bar{x}}{s_x}, \quad z_{y,i} = \frac{y_i - \bar{y}}{s_y}`,
      where: [[String.raw`r`, 'Pearson’s correlation coefficient', ''], [String.raw`n`, 'Number of pairs', ''], [String.raw`z_{x,i}, z_{y,i}`, 'Point i’s z-scores on x and on y', ''], [String.raw`x_i, y_i`, 'Point i’s values', 'units of x, y'], [String.raw`\bar{x}, \bar{y}`, 'Sample means', 'units of x, y'], [String.raw`s_x, s_y`, 'Sample standard deviations', 'units of x, y']],
      assumptions: 'An identity, true for any data with non-zero standard deviations.',
      note: 'Each point contributes z_x z_y ÷ (n − 1). An extreme point also changes the means and standard deviations, and so every other point’s z-scores.' },
    { id: 'out-loo', name: 'Leave-one-out change in r',
      tex: String.raw`\Delta r_i = r_{(-i)} - r`,
      where: [[String.raw`r`, 'The correlation of all n points', ''], [String.raw`r_{(-i)}`, 'The correlation of the n − 1 points left when point i is removed', ''], [String.raw`\Delta r_i`, 'How much removing point i changes r (positive: r rises without it)', '']],
      note: 'Compute it for every point and look at the largest changes. A large change says a point matters, not that it is wrong.' },
    { id: 'out-max-z', name: 'The largest possible z-score in a sample',
      tex: String.raw`|z_i| \le \frac{n-1}{\sqrt{n}}`,
      where: [[String.raw`z_i`, 'Any value’s z-score, using the sample mean and sample standard deviation', ''], [String.raw`n`, 'Number of values', '']],
      assumptions: 'z-scores calculated with the sample standard deviation (n − 1), as STANDARDIZE with AVERAGE and STDEV.S does.',
      note: '2.85 for n = 10, 4.25 for n = 20: in small samples a rule such as |z| > 3 can’t flag anything.' },
  ],

  examples: [
    { level: 'simple', title: 'A typing error at a bike-hire stand', fictional: true,
      setup: 'Kestrel Bike Hire records the hours of sunshine and the number of hires on ten days. Sunshine: 2, 3, 4, 4, 5, 6, 6, 7, 8 and 9 hours; hires: 14, 18, 17, 22, 21, 26, 230, 27, 30 and 31. CORREL gives r = 0.177. Is sunshine only weakly related to hires?',
      steps: [
        'Plot or scan the data: nine days have between 14 and 31 hires, and day 7 has 230 at 6 hours of sunshine, an ordinary x. It is an outlier in y only, and far off the pattern of the others.',
        'Screen with z-scores: 230 has z = 2.84, which a rule of |z| > 3 would not flag. With n = 10 no z-score can exceed (10 − 1) ÷ √10 = 2.85, so the rule is useless here. The plot and common sense (the stand has never had more than 40 hires in a day) are the checks that work.',
        'Leave one out: without day 7, r = 0.968; leaving out any other day leaves r between 0.110 and 0.263. Day 7 decides the result.',
        'Check the source: the booking system shows 23 hires on day 7. Correct the value and record the change. With 23, r = 0.964 and Spearman’s ρ = 0.957 (ρ was 0.866 with the error).',
      ],
      answer: 'No: corrected, sunshine and hires have r = 0.964. The weak r of 0.177 came from one mistyped value (230 for 23).',
      interpretation: 'Sunny days go with many more hires, as the owner would expect. The lesson is in the method: the z-score rule missed the error, the plot did not, and the correction came from the source rather than from deleting the point.' },
    { level: 'challenging', title: 'The anatomy of Millbrook’s slip', fictional: true,
      setup: 'In the raw café log, footfall and transactions have r = 0.679 across 612 café-days; one row, Millbrook on 14 September, records a footfall of 2,566. Explain, with z-scores, how one point among 612 can lower r by 0.3, and confirm that correcting it to 256 restores r.',
      steps: [
        String.raw`The raw footfall has mean 186.8 and standard deviation 129.9; transactions have mean 94.9 and standard deviation 49.7. The slip’s z-scores are <m>z_x = (2566 - 186.8) \div 129.9 = 18.3</m> and <m>z_y = (130 - 94.9) \div 49.7 = 0.71</m>.`,
        String.raw`Its own term in <m>r = \sum z_x z_y \div (n - 1)</m> is <m>18.3 \times 0.71 \div 611 = 0.021</m>: small and positive. The other 611 terms add up to 0.658, and 0.658 + 0.021 = 0.679.`,
        'Why are the other terms so small? Without the slip the footfall standard deviation is 87.1, not 129.9. The slip inflates it by a factor of about 1.49, so every other day’s footfall z-score is about a third smaller than it should be, and their sum falls in proportion: 0.981 × 87.1 ÷ 129.9 ≈ 0.66.',
        'Corrected to 256, the day converts 51% of its visitors, like any other Millbrook day, and r = 0.981. Spearman’s ρ barely changes (0.970 with the slip, 0.971 without), because in ranks the slip is simply Millbrook’s busiest day rather than a day nine times busier.',
      ],
      answer: 'The slip lowers r from 0.981 to 0.679 mainly by inflating the standard deviation of footfall from 87.1 to 129.9, which shrinks every other day’s contribution; its own contribution is only +0.021.',
      interpretation: 'An outlier in x that breaks the pattern does most of its damage through the spread, not through its own product. That is why a single error can hide a near-perfect relationship, and why the rank correlation, which ignores the size of the spread, hardly notices it.' },
    { level: 'applied', title: 'Festival days and the peak roster', fictional: true,
      setup: 'Ana is setting next year’s rule for rostering Harbourside’s 7–11 a.m. peak, and asks how closely footfall goes with the peak wait. Across all 306 days r = 0.673; the five festival days had footfalls of 502 to 620 and waits of 4.7 to 15.3 minutes. What should she report?',
      steps: [
        'Check the festival days at the source: the door counter, the till and the roster all confirm them. They are genuine, so they stay in the log.',
        'Measure their influence: without the five days r = 0.476 (301 days); leaving out 29 May alone gives 0.595. Spearman’s ρ is 0.420 with them and 0.391 without, so in ranks the festivals matter much less.',
        'Ask what the question is about. The roster rule is for ordinary days, and festival days are planned separately, with extra staff booked weeks ahead. For ordinary days the relevant figure is 0.48; the 0.67 is largely five days of crowds.',
        'Write both down: “Across all 306 days footfall and the peak wait have r = 0.67; without the five festival days, which are rostered separately, r = 0.48. On ordinary days busier mornings go with longer waits, but footfall alone leaves most of the variation in waits unexplained.”',
      ],
      answer: 'Report r = 0.48 for ordinary days as the figure for the roster rule, with r = 0.67 for all days beside it and the reason for the difference.',
      interpretation: 'Neither number is the “true” one; they answer different questions. The festival days show what extreme crowds do to waits, which matters for festival planning; the ordinary days show the everyday link, which matters for the weekly roster. Waits depend on how many customers each barista serves, not on footfall alone: the partial-correlation lesson shows what happens when staffing is taken into account.' },
  ],

  demo: [
    { widget: 'out-slip', intro: 'The raw log: footfall against transactions for all 612 café-days. Find the point far to the right, then use the buttons to leave out the points that move r most. Leaving out the first one (the slip) moves r from 0.679 to 0.981; the next buttons barely move it. Tick “Plot ranks” to see why Spearman’s ρ hardly noticed.' },
    { widget: 'out-festival', intro: 'Harbourside’s 306 days: footfall against the peak wait. Colour the points by festival day and look at the five far to the right. Leave them out one at a time and watch r fall from 0.673 towards 0.476. Which ordinary day is the most influential, and why might it have had such a long wait?' },
    { widget: 'out-sheet', intro: 'Twenty Millbrook days, 1–20 September, as they were typed. F1 is Pearson’s r, F2 Spearman’s ρ (Pearson’s r of the ranks) and column D the conversion rate. Find the row whose conversion is impossible, type the door counter’s value, 256, into B15, and watch both correlations move.' },
  ],

  mistakes: [
    { title: '“The correlation is weak, so the two things are only loosely related.”', html: 'A single error can turn r = 0.98 into r = 0.68. Before interpreting the size of r, plot the data and look for points that sit apart. A correlation is a summary of the plot, not a replacement for it.' },
    { title: '“No value has |z| above 3, so there are no outliers.”', html: 'In a sample of 10 no z-score can exceed 2.85, however wild the value, because the outlier inflates the standard deviation. And a point can be ordinary on each variable yet unusual in combination. Plot the pairs and use plausibility checks such as conversion rates.' },
    { title: '“That point is an outlier, so I deleted it.”', html: 'Outliers are not errors by definition. Delete or correct a value only when the source shows it is wrong; keep genuine extremes and report the correlation with and without them. Removing points because the result looks better without them is choosing the answer.' },
    { title: '“Removing the point changed r a lot, so the point must be an error.”', html: 'Influence measures how much a point matters, not whether it is right. Harbourside’s 29 May festival is the most influential day for footfall and waits, and it is entirely genuine. Check the source, not the size of the change.' },
    { title: '“I’ll switch to Spearman’s ρ and the outlier problem goes away.”', html: 'Ranks limit how far one point can pull, which makes ρ a useful check, but an error still counts as an observation: in 20 Millbrook days the slip lowers ρ from 0.941 to 0.810. Correct errors first; use ranks to show how much the conclusion depends on a few genuine extremes.' },
  ],

  application: [
    { case: 'Ana’s note in the log’s cleaning record: “14 Sep 2027, Millbrook, footfall: typed 2,566; door counter export says 256. Corrected. With the error, footfall and transactions had r = 0.68; corrected, 0.98. Festival days (5, Harbourside) checked against the till and kept. Correlations involving footfall at Harbourside are reported with and without them.”' },
    { p: 'Analysts who work with operational data meet outliers every week, and the ones who are trusted handle them in the same order every time. They plot the data before computing anything. They screen each variable and check every row against rules the business makes obvious: conversion rates, ranges, totals that must add up. They look at leave-one-out changes, or at the few points that move a result most, to see which points matter. Then they go to the source for each of those points and decide, on the evidence, whether it is an error, and they record what they did.' },
    { p: 'Reporting both ways is the habit that matters most. A finding that depends on five festival days is a different finding from one that holds on ordinary days, and the people who act on it need to know which they are getting. In a short report that can be one sentence: “r = 0.67 across all days; 0.48 excluding the five festival days.” A reader can then judge for themselves, and nobody can say that inconvenient days were quietly dropped.' },
    { p: 'Two traps are worth naming in a team’s working rules. The first is a rule that removes every point beyond |z| = 3 automatically: it removes genuine extremes along with errors, misses errors in small samples, and lets the analyst off looking at the data. The second is checking for outliers only when a result disappoints. Apply the same checks whichever way the result goes, decide what to do before seeing what each choice does to r, and the result will survive a sceptical reader.' },
  ],

  summary: [
    'One point can move a correlation a long way: Millbrook’s mistyped footfall (2,566 for 256) lowered r for footfall and transactions from 0.981 to 0.679 across 612 café-days.',
    'Where a point sits decides what it does: far out in x and y on the trend raises r; far out in y only, or far out in x off the trend, lowers it.',
    'An outlier off the trend damages r mostly by inflating a standard deviation, which shrinks every other point’s z-score; its own term, z_x z_y ÷ (n − 1), can be small.',
    'Leave-one-out changes, r₍₋ᵢ₎ − r, show which points matter. Influence is not error: the most influential genuine day still belongs in the data.',
    'Find outliers with a plot, per-variable screens and business plausibility checks; in small samples z-scores cannot reach 3 (|z| ≤ (n − 1) ÷ √n).',
    'Correct errors from the source and record the change; keep genuine extremes and report the correlation with and without them; use Spearman’s ρ as a robustness check; never delete points because the result looks better without them.',
  ],

  glossary: [
    { term: 'Influential point', def: 'A data point whose removal would change a result, such as a correlation or a fitted line, noticeably. Influence measures how much a point matters, not whether it is correct.' },
    { term: 'Leave-one-out analysis', def: 'Recomputing a result once for each observation with that observation removed, to see how much each one changes the result.' },
    { term: 'Bivariate outlier', def: 'A pair of values that lies far from the pattern of the other pairs, whether or not either value is extreme on its own.' },
    { term: 'Plausibility check', def: 'A test of a value against a rule the business or the physical world makes obvious, such as a conversion rate between 0 and 1 or a wait that cannot be negative, used to find recording errors.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. <i>Introductory Statistics 2e</i>, section 12.6, “Outliers”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-6-outliers', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 7.1.6, “What are outliers in the data?”.', url: 'https://itl.nist.gov/div898/handbook/prc/section1/prc16.htm', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.3.26, “Scatter Plot” (including the outlier sample plot).', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda33q.htm', checked: '2026-10-26' },
    { text: 'Microsoft Support. “CORREL function”.', url: 'https://support.microsoft.com/en-US/excel/functions/correl-function', checked: '2026-10-26' },
  ],

  checks: [
    // the slip
    { what: 'Café-days', value: n, shown: 612 },
    { what: 'Raw r footfall–transactions', value: D.footTransRaw.r, shown: 0.679, tol: 0.0005 },
    { what: 'Corrected r', value: D.footTrans.r, shown: 0.981, tol: 0.0005 },
    { what: 'Fall in r', value: D.footTrans.r - D.footTransRaw.r, shown: 0.302, tol: 0.0005 },
    { what: 'Slip recorded', value: SLIP.recorded, shown: 2566 },
    { what: 'Slip actual', value: SLIP.actual, shown: 256 },
    { what: 'Slip transactions', value: TR[SI], shown: 130 },
    { what: 'Slip is 14 September at Millbrook', value: Number(SLIP.date === '2027-09-14' && SLIP.cafe === 'Millbrook'), shown: 1 },
    { what: 'No other Millbrook day reached 410', value: Number(millFootSorted[1] < 410), shown: 1 },
    { what: 'Second-highest Millbrook footfall', value: millFootSorted[1], shown: 407 },
    { what: 'Slip conversion', value: TR[SI] / SLIP.recorded * 100, shown: 5.1, tol: 0.05 },
    { what: 'Lowest conversion of other days', value: Math.min(...conv) * 100, shown: 28, tol: 0.5 },
    { what: 'Highest conversion of other days', value: Math.max(...conv) * 100, shown: 67, tol: 0.5 },
    { what: 'Corrected slip-day conversion', value: TR[SI] / SLIP.actual * 100, shown: 51, tol: 0.5 },
    { what: 'Slip z_x', value: ZX[SI], shown: 18.3, tol: 0.05 },
    { what: 'Slip z_y', value: ZY[SI], shown: 0.71, tol: 0.005 },
    { what: 'Slip term', value: slipTerm, shown: 0.021, tol: 0.0005 },
    { what: 'Rest of the terms', value: restTerm, shown: 0.658, tol: 0.0005 },
    { what: 'Terms add to raw r', value: slipTerm + restTerm, shown: 0.679, tol: 0.0005 },
    { what: 'Rounded arithmetic 18.3 × 0.71 ÷ 611', value: 18.3 * 0.71 / 611, shown: 0.021, tol: 0.0005 },
    { what: 'Rounded sum 0.658 + 0.021', value: 0.658 + 0.021, shown: 0.679, tol: 0.0005 },
    { what: 'Other terms before (≈ corrected r)', value: D.footTrans.r, shown: 0.98, tol: 0.005 },
    { what: 'Raw footfall mean', value: mean(FR), shown: 186.8, tol: 0.05 },
    { what: 'Raw footfall SD', value: sd(FR), shown: 129.9, tol: 0.05 },
    { what: 'Corrected footfall SD', value: sd(FC), shown: 87.1, tol: 0.05 },
    { what: 'Transactions mean', value: mean(TR), shown: 94.9, tol: 0.05 },
    { what: 'Transactions SD', value: sd(TR), shown: 49.7, tol: 0.05 },
    { what: 'Approximation 0.981 × 87.1 ÷ 129.9', value: 0.981 * 87.1 / 129.9, shown: 0.66, tol: 0.005 },
    { what: 'SD inflation factor', value: sd(FR) / sd(FC), shown: 1.49, tol: 0.005 },
    { what: 'Other z-scores about a third smaller', value: 1 - sd(FC) / sd(FR), shown: 1 / 3, tol: 0.02 },
    { what: 'Leave-one-out: r without the slip', value: INF_RAW.without[SI], shown: 0.981, tol: 0.0005 },
    { what: 'The slip is the most influential point', value: Number(INF_RAW.most === SI), shown: 1 },
    { what: 'Change without the slip', value: INF_RAW.change, shown: 0.302, tol: 0.0005 },
    { what: 'Second most influential is 29 May Harbourside', value: Number(DATE[second[0]] === '2027-05-29' && CAFE[second[0]] === 'Harbourside'), shown: 1 },
    { what: 'Second change', value: second[1], shown: -0.007, tol: 0.0005 },
    { what: 'r without 29 May (raw)', value: INF_RAW.without[second[0]], shown: 0.672, tol: 0.0005 },
    { what: '29 May footfall', value: FR[second[0]], shown: 620 },
    { what: '29 May transactions', value: TR[second[0]], shown: 293 },
    { what: 'Spearman raw', value: D.footTransRhoRaw.rho, shown: 0.970, tol: 0.0005 },
    { what: 'Spearman corrected', value: footTransRhoClean, shown: 0.971, tol: 0.0005 },
    // Millbrook September (the sheet)
    { what: 'Millbrook 1–20 Sep Spearman corrected', value: (() => { const rs = CAFE_ROWS.filter((r) => r[1] === 'Millbrook' && r[0] >= '2027-09-01' && r[0] <= '2027-09-20'); return C.spearman(rs.map((r) => (r[0] === SLIP.date ? SLIP.actual : r[at('footfall')])), rs.map((r) => r[at('transactions')])).rho; })(), shown: 0.941, tol: 0.0005 },
    { what: 'Millbrook 1–20 Sep Spearman raw', value: (() => { const rs = CAFE_ROWS.filter((r) => r[1] === 'Millbrook' && r[0] >= '2027-09-01' && r[0] <= '2027-09-20'); return C.spearman(rs.map((r) => r[at('footfall')]), rs.map((r) => r[at('transactions')])).rho; })(), shown: 0.810, tol: 0.0005 },
    // the figure
    { what: 'Figure base r', value: baseR, shown: 0.964, tol: 0.0005 },
    { what: 'Figure A', value: PANELS[0].r, shown: 0.989, tol: 0.0005 },
    { what: 'Figure B', value: PANELS[1].r, shown: 0.575, tol: 0.0005 },
    { what: 'Figure C', value: PANELS[2].r, shown: 0.144, tol: 0.0005 },
    // festival days
    { what: 'Harbourside days', value: hF.length, shown: 306 },
    { what: 'Festival days', value: festF.length, shown: 5 },
    { what: 'Non-festival days', value: keep(hF).length, shown: 301 },
    { what: 'Footfall–wait r, all', value: fwAll.r, shown: 0.673, tol: 0.0005 },
    { what: 'Footfall–wait r, all (2 dp)', value: fwAll.r, shown: 0.67 },
    { what: 'Footfall–wait r, no festivals', value: fwNo.r, shown: 0.476, tol: 0.0005 },
    { what: 'Footfall–wait r, no festivals (2 dp)', value: fwNo.r, shown: 0.48 },
    { what: 'r without 29 May', value: fwInf.without[may29], shown: 0.595, tol: 0.0005 },
    { what: '29 May is the most influential', value: Number(fwInf.most === may29), shown: 1 },
    { what: 'Footfall–wait ρ, all', value: fwRhoAll, shown: 0.420, tol: 0.0005 },
    { what: 'Footfall–wait ρ, no festivals', value: fwRhoNo, shown: 0.391, tol: 0.0005 },
    { what: 'Festival footfall low', value: Math.min(...festF), shown: 502 },
    { what: 'Festival footfall high', value: Math.max(...festF), shown: 620 },
    { what: 'Festival footfall about 500 to 620', value: Number(Math.min(...festF) >= 500), shown: 1 },
    { what: 'Festival z low', value: Math.min(...festZ), shown: 5.2, tol: 0.05 },
    { what: 'Festival z high', value: Math.max(...festZ), shown: 6.9, tol: 0.05 },
    { what: 'Highest non-festival footfall', value: Math.max(...keep(hF)), shown: 282 },
    { what: 'Festival footfall about four times the usual', value: mean(festF) / mean(keep(hF)), shown: 4, tol: 0.2 },
    { what: 'Festival wait low', value: Math.min(...festW), shown: 4.7 },
    { what: 'Festival wait high', value: Math.max(...festW), shown: 15.3 },
    { what: 'Typical wait about 2 minutes', value: mean(keep(hW)), shown: 2, tol: 0.2 },
    { what: 'Temp–footfall r, all', value: tfAll.r, shown: 0.436, tol: 0.0005 },
    { what: 'Temp–footfall r, no festivals', value: tfNo.r, shown: 0.508, tol: 0.0005 },
    { what: '1 May: most influential ordinary day for waits', value: Number(fwInf.without.map((r, i) => [i, Math.abs(r - fwInf.r)]).filter(([i]) => !hFest[i]).sort((a, b) => b[1] - a[1])[0][0] === may1), shown: 1 },
    { what: '1 May load (for the widget hint)', value: may1Load, shown: 12.7, tol: 0.05 },
    // Kestrel (fictional)
    { what: 'Kestrel r with the error', value: kRaw, shown: 0.177, tol: 0.0005 },
    { what: 'Kestrel z of 230', value: kZ, shown: 2.84, tol: 0.005 },
    { what: 'Kestrel max z', value: kMaxZ, shown: 2.85, tol: 0.005 },
    { what: 'Kestrel r without day 7', value: kWithout, shown: 0.968, tol: 0.0005 },
    { what: 'Kestrel other leave-one-outs low', value: Math.min(...C.influence(KX, KY).without.filter((_, i) => i !== 6)), shown: 0.110, tol: 0.0005 },
    { what: 'Kestrel other leave-one-outs high', value: Math.max(...C.influence(KX, KY).without.filter((_, i) => i !== 6)), shown: 0.263, tol: 0.0005 },
    { what: 'Kestrel corrected r', value: kFix, shown: 0.964, tol: 0.0005 },
    { what: 'Kestrel corrected ρ', value: kRhoFix, shown: 0.957, tol: 0.0005 },
    { what: 'Kestrel ρ with error', value: kRhoRaw, shown: 0.866, tol: 0.0005 },
    { what: 'Kestrel hires otherwise 14 to 31', value: Number(Math.min(...KY_TRUE) === 14 && Math.max(...KY_TRUE) === 31), shown: 1 },
    // max z formula
    { what: 'Max z n = 20', value: 19 / Math.sqrt(20), shown: 4.25, tol: 0.005 },
  ],
};
