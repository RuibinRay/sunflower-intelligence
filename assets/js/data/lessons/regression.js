// Lesson: linear regression — coefficients, R², p-values and the diagnostics that qualify them.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=10';
import { ols, mean } from '../../core/stats.js?v=10';
import { mulberry32, normalGen } from '../../core/rng.js?v=10';

// Eight weeks of invented data: advertising ($k) and sales ($k).
const AD = [2, 3, 4, 5, 6, 7, 8, 9];
const SALES = [14, 13, 18, 15, 20, 17, 22, 19];
// Fixed noise for the calculator, so the same settings always give the same sample.
const Z = (() => { const N = normalGen(mulberry32(2024)); return Array.from({ length: 60 }, () => N()); })();

export default {
  id: 'regression',
  title: 'Regression: what the coefficients and R² say',
  minutes: 7,
  hook: 'A regression line turns “these move together” into “this much more of y for each unit of x”. Its numbers come with uncertainty, and the diagnostics say when to doubt them.',
  idea: [
    'Ordinary least squares (OLS) draws the line that makes the squared vertical distances from the points, the <b>residuals</b>, as small as possible. Each slope is the expected change in the outcome for one more unit of that predictor, <em>holding the other predictors fixed</em>.',
    '<b>R²</b> is the share of the outcome’s variation the model accounts for: 1 minus the leftover squared error over the total. With one predictor it equals the squared correlation. Adjusted R² charges for each extra predictor, so adding noise columns cannot raise it for free.',
    'Each coefficient has a standard error, a t statistic (estimate ÷ standard error) and a <b>p-value</b>: how often a slope this far from zero would turn up by chance if the true effect were zero. If the residuals fan out (uneven spread), use robust HC3 standard errors; if two predictors overlap heavily (variance inflation factors above about 10), their separate effects can’t be pinned down.',
  ],
  formula: {
    html: 'ŷ = b<sub>0</sub> + b<sub>1</sub>x,&ensp; b<sub>1</sub> = <span class="frac"><span>Σ (x − x̄)(y − ȳ)</span><span>Σ (x − x̄)<sup>2</sup></span></span>,&ensp; b<sub>0</sub> = ȳ − b<sub>1</sub>x̄,&ensp; R<sup>2</sup> = 1 − <span class="frac"><span>SSE</span><span>SST</span></span>,&ensp; t = <span class="frac"><span>b<sub>1</sub></span><span>SE(b<sub>1</sub>)</span></span>',
    terms: [
      ['b<sub>1</sub>', 'the slope: change in y for one more unit of x'],
      ['b<sub>0</sub>', 'the intercept: the predicted y when x is 0'],
      ['SSE', 'sum of squared residuals, Σ (y − ŷ)²'],
      ['SST', 'total sum of squares around the mean, Σ (y − ȳ)²'],
      ['t', 'the estimate in standard errors; its p-value comes from a t distribution with n − 2 degrees of freedom here'],
    ],
  },
  example: {
    setup: 'Over eight weeks a shop spent $2k to $9k on advertising and sold $14k, $13k, $18k, $15k, $20k, $17k, $22k and $19k. How strongly are they linked?',
    steps: [
      'Means: advertising x̄ = <b>5.5</b>, sales ȳ = <b>17.25</b>. Σ (x − x̄)² = <b>42</b> and Σ (x − x̄)(y − ȳ) = <b>41.0</b>.',
      'Slope b<sub>1</sub> = 41.0 ÷ 42 = <b>0.976</b>: each extra $1k of advertising goes with about $0.98k more sales. Intercept b<sub>0</sub> = 17.25 − 0.976 × 5.5 = <b>11.88</b>.',
      'R² = 1 − 27.5 ÷ 67.5 = <b>0.59</b>: the line accounts for 59% of the week-to-week variation in sales.',
      'Standard error of the slope <b>0.330</b>, so t = 0.976 ÷ 0.330 = <b>2.96</b>, with a p-value of <b>0.025</b> on 6 degrees of freedom.',
      'Predicted sales for a $10k week: 11.88 + 0.976 × 10 = <b>$21.64k</b>.',
    ],
    result: 'The data support a positive link: about <b>$0.98k</b> of sales per $1k of advertising, unlikely to be chance (p = 0.025). Eight weeks is little evidence, and a third factor such as season could drive both.',
  },
  mistake: {
    title: 'Reading a p-value as the chance the effect is real',
    html: 'Suppose the slope’s p-value had been 0.30. That does <em>not</em> mean a 70% chance that advertising works. It means that if advertising had no effect at all, a slope at least this far from zero would appear in about 30% of samples like this one. The right reading is “the data can’t tell the effect apart from zero”, not “probably real”.',
  },
  remember: [
    'A slope is the change in y per unit of x, with the other predictors held fixed, and it describes association, not cause.',
    'R² is the share of variation explained; with one predictor it is the correlation squared (R² = 0.64 means r = 0.8).',
    'A p-value is not the probability the effect is real. Fanning residuals call for robust (HC3) standard errors; high VIFs mean overlapping predictors.',
  ],
  calc: {
    title: 'How much can a sample tell you?',
    intro: 'Sales = 10 + true slope × week + noise. The same fixed noise is reused, so only your settings change the sample.',
    inputs: [
      { id: 'slope', label: 'True slope', min: -1, max: 2, step: 0.1, value: 0.5, fmt: 'num', digits: 1 },
      { id: 'noise', label: 'Noise (standard deviation)', min: 0.5, max: 10, step: 0.5, value: 3, fmt: 'num', digits: 1 },
      { id: 'n', label: 'Weeks of data', min: 6, max: 60, step: 1, value: 12, fmt: 'int' },
    ],
    compute({ slope, noise, n }) {
      const x = Array.from({ length: n }, (_, i) => i + 1);
      const y = x.map((v, i) => 10 + slope * v + noise * Z[i]);
      const fit = ols([x], y);
      if (fit.error) return { error: fit.error };
      const b = fit.coefs[1];
      const sig = b.p < 0.05;
      return {
        headline: { value: F.num(b.estimate, 2), label: `estimated slope (true ${F.num(slope, 1)})` },
        rows: [['95% interval for the slope', `${F.num(b.low, 2)} to ${F.num(b.high, 2)}`], ['p-value', F.pValue(b.p)], ['R²', F.num(fit.r2, 2)]],
        note: sig
          ? `The interval excludes zero, so the data can tell the slope from no effect.${fit.r2 < 0.3 ? ' Even so, R² is low: most of the variation is noise.' : ''}`
          : 'The interval includes zero: with this much noise and this few weeks, the data can’t tell the slope apart from no effect. More weeks or less noise narrow it.',
      };
    },
  },
  tool: { href: 'analytics/explore/#regress', label: 'Regress, in Business analytics › Explore your data' },
  checks: (() => {
    const fit = ols([AD], SALES), mx = mean(AD), my = mean(SALES);
    const sxx = AD.reduce((s, v) => s + (v - mx) ** 2, 0), sxy = AD.reduce((s, v, i) => s + (v - mx) * (SALES[i] - my), 0);
    const [a, b] = fit.coefs;
    return [
      { what: 'mean x', value: mx, shown: 5.5, tol: 1e-9 }, { what: 'mean y', value: my, shown: 17.25, tol: 1e-9 },
      { what: 'Sxx', value: sxx, shown: 42, tol: 1e-9 }, { what: 'Sxy', value: sxy, shown: 41.0, tol: 0.05 },
      { what: 'slope', value: b.estimate, shown: 0.976, tol: 0.0005 }, { what: 'slope as $k', value: b.estimate, shown: 0.98, tol: 0.005 },
      { what: 'intercept', value: a.estimate, shown: 11.88, tol: 0.005 },
      { what: 'SSE', value: fit.sse, shown: 27.5, tol: 0.05 }, { what: 'SST', value: fit.sst, shown: 67.5, tol: 1e-9 },
      { what: 'R²', value: fit.r2, shown: 0.59, tol: 0.005 }, { what: 'R² as a share', value: fit.r2 * 100, shown: 59, tol: 0.5 },
      { what: 'SE of slope', value: b.se, shown: 0.330, tol: 0.0005 }, { what: 't', value: b.t, shown: 2.96, tol: 0.005 },
      { what: 'p-value', value: b.p, shown: 0.025, tol: 0.0005 }, { what: 'degrees of freedom', value: fit.df, shown: 6, tol: 0 },
      { what: 'prediction at $10k', value: fit.predict([10]).yhat, shown: 21.64, tol: 0.005 },
      { what: 'R² 0.64 means r = 0.8', value: Math.sqrt(0.64), shown: 0.8, tol: 1e-12 },
    ];
  })(),
};
