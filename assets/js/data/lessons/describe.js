// Lesson: describing data — centre, spread and correlation.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=22';
import { describe, pearson, spearman } from '../../core/stats.js?v=22';

const INCOMES = [3, 4, 4, 5, 6, 7, 30];
// Twelve months: temperature drives both ice-cream sales and drownings (with a little noise of their own).
const TEMP = [3, 4, 8, 12, 16, 20, 23, 22, 18, 13, 7, 4];
const ICE = TEMP.map((t, i) => 20 + 6 * t + [3, -2, 4, -1, 2, -3, 1, 5, -4, 2, -1, 0][i]);
const DROWN = TEMP.map((t, i) => 1 + 0.25 * t + [0.4, -0.3, 0.2, 0.5, -0.6, 0.3, -0.2, 0.1, 0.4, -0.5, 0.2, -0.1][i]);
const WOBBLE = [0.6, -0.4, 0.3, -0.7, 0.5, 0.2, -0.3, 0.6, -0.5, 0.1, 0.4, -0.6, 0.2, -0.2, 0.7, -0.4, 0.3, -0.1, 0.5, -0.6];

export default {
  id: 'describe',
  title: 'Describing data: centre, spread and correlation',
  minutes: 6,
  hook: 'Before any model, describe the data: where its middle is, how far it spreads, and which columns move together. Each summary can mislead in a known way.',
  idea: [
    'The <b>mean</b> adds everything up and divides by the count; the <b>median</b> is the middle value once the data are sorted. When a few values are far out on one side (skew), the mean follows them and the median barely moves. For incomes, house prices and order sizes, report the median, or both.',
    'Spread has the same split. The <b>standard deviation</b> uses every value’s distance from the mean, so one extreme value can inflate it. The <b>interquartile range</b> (IQR), the distance between the 25th and 75th percentiles, describes the middle half and ignores the extremes.',
    '<b>Pearson’s correlation</b> <i>r</i> measures how closely two columns follow a straight line, from −1 to +1. <b>Spearman’s</b> is Pearson’s on the ranks, so it resists outliers and catches any steadily rising or falling pattern. Neither says anything about cause: a third factor can drive both.',
  ],
  formula: {
    html: 'x̄ = <span class="frac"><span>Σ x<sub>i</sub></span><span>n</span></span>,&ensp; s = √[ Σ (x<sub>i</sub> − x̄)<sup>2</sup> ÷ (n − 1) ],&ensp; r = <span class="frac"><span>Σ (x<sub>i</sub> − x̄)(y<sub>i</sub> − ȳ)</span><span>√[Σ (x<sub>i</sub> − x̄)<sup>2</sup> × Σ (y<sub>i</sub> − ȳ)<sup>2</sup>]</span></span>',
    terms: [
      ['x̄', 'the mean of the values x<sub>1</sub> … x<sub>n</sub>'],
      ['s', 'the sample standard deviation; dividing by n − 1 corrects for measuring spread around an estimated mean'],
      ['IQR', 'Q3 − Q1, the 75th minus the 25th percentile'],
      ['r', 'Pearson’s correlation; Spearman’s ρ is the same formula applied to the ranks of x and y'],
    ],
    note: 'Percentiles here interpolate between neighbouring sorted values, as spreadsheets and NumPy do by default.',
  },
  example: {
    setup: 'Seven households report monthly incomes of $3k, $4k, $4k, $5k, $6k, $7k and $30k. Describe the typical household and the spread.',
    steps: [
      'Mean: (3 + 4 + 4 + 5 + 6 + 7 + 30) ÷ 7 = 59 ÷ 7 = <b>$8.43k</b>. Median: the fourth of seven sorted values, <b>$5k</b>. Six of the seven households earn less than the mean.',
      'Standard deviation: <b>$9.61k</b>, larger than the mean itself. IQR: Q3 − Q1 = 6.5 − 4 = <b>$2.5k</b>.',
      'Drop the $30k household and look again: the mean falls to <b>$4.83k</b> and the median to <b>$4.5k</b>; the standard deviation shrinks to <b>$1.47k</b>, the IQR only to <b>$1.75k</b>.',
      'One value moved the mean by $3.6k and the standard deviation by $8.1k, but the median by $0.5k and the IQR by $0.75k.',
    ],
    result: 'The typical household earns about <b>$5k</b> a month, and the middle half spans $2.5k. The mean and standard deviation describe the one outlier more than the other six.',
  },
  mistake: {
    title: 'Reading a correlation as a cause',
    html: 'Over twelve months of invented data, ice-cream sales and drownings correlate at <b>r = 0.97</b>. Concluding that ice cream causes drowning, or that banning it would save swimmers, is wrong: hot weather raises both. A strong correlation says two things move together, not why.',
  },
  remember: [
    'Skewed data: the mean chases the long tail. Report the median, and the IQR for spread.',
    'Pearson’s r measures straight-line association only; a strong curve can score 0. Spearman’s ρ handles outliers and steady curves.',
    'Correlation is not cause. Look for a third factor that could drive both columns.',
  ],
  calc: {
    title: 'What the two correlations see',
    intro: 'Twenty points: a straight-line slope, a U-shaped bend and one outlier, plus a little fixed noise.',
    inputs: [
      { id: 'slope', label: 'Straight-line slope', min: -2, max: 2, step: 0.1, value: 1, fmt: 'num', digits: 1 },
      { id: 'curve', label: 'U-shaped bend', min: -0.5, max: 0.5, step: 0.05, value: 0, fmt: 'num', digits: 2 },
      { id: 'out', label: 'Outlier added to the first point', min: 0, max: 200, step: 10, value: 0, fmt: 'int' },
    ],
    compute({ slope, curve, out }) {
      const x = Array.from({ length: 20 }, (_, i) => i + 1);
      const y = x.map((v, i) => slope * (v - 10.5) + curve * ((v - 10.5) ** 2 - 33.25) + WOBBLE[i] + (i === 0 ? out : 0));
      const r = pearson(x, y).r, rho = spearman(x, y).r;
      let note;
      if (Math.abs(curve) >= 0.15 && Math.abs(slope) <= 0.3) note = 'Both correlations are weak, yet y depends strongly on x: it is a U shape, not a line. Plot the data before trusting a correlation of zero.';
      else if (Math.abs(r - rho) >= 0.2) note = 'Pearson and Spearman disagree: an outlier or a bend is pulling Pearson’s straight-line measure. Spearman’s ranks are the steadier read.';
      else if (Math.abs(r) >= 0.7) note = 'A strong, steady relationship: both measures agree.';
      else note = 'A weak relationship: the noise is large next to the trend.';
      return {
        headline: { value: F.signed(r, 2), label: 'Pearson’s r' },
        rows: [['Spearman’s ρ (on ranks)', F.signed(rho, 2)], ['r², share of y’s variation on a straight line', F.pct(r * r, 0)]],
        note,
      };
    },
  },
  tool: { href: 'analytics/explore/#describe', label: 'Describe and Correlate, in Business analytics › Explore your data' },
  checks: (() => {
    const all = describe(INCOMES), six = describe(INCOMES.slice(0, 6));
    return [
      { what: 'mean', value: all.mean, shown: 8.43, tol: 0.005 }, { what: 'median', value: all.median, shown: 5, tol: 1e-9 },
      { what: 'sd', value: all.sd, shown: 9.61, tol: 0.005 }, { what: 'Q1', value: all.q1, shown: 4, tol: 1e-9 }, { what: 'Q3', value: all.q3, shown: 6.5, tol: 1e-9 },
      { what: 'IQR', value: all.iqr, shown: 2.5, tol: 1e-9 },
      { what: 'mean without the outlier', value: six.mean, shown: 4.83, tol: 0.005 }, { what: 'median without', value: six.median, shown: 4.5, tol: 1e-9 },
      { what: 'sd without', value: six.sd, shown: 1.47, tol: 0.005 }, { what: 'IQR without', value: six.iqr, shown: 1.75, tol: 1e-9 },
      { what: 'mean moved', value: all.mean - six.mean, shown: 3.6, tol: 0.05 }, { what: 'sd moved', value: all.sd - six.sd, shown: 8.1, tol: 0.05 },
      { what: 'median moved', value: all.median - six.median, shown: 0.5, tol: 1e-9 }, { what: 'IQR moved', value: all.iqr - six.iqr, shown: 0.75, tol: 1e-9 },
      { what: 'six of seven below the mean', value: INCOMES.filter((v) => v < all.mean).length, shown: 6, tol: 0 },
      { what: 'ice cream vs drownings', value: pearson(ICE, DROWN).r, shown: 0.97, tol: 0.005 },
    ];
  })(),
};
