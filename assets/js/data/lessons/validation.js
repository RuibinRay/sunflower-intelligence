// Lesson: validating models — held-out data, overfitting, k-fold cross-validation, the one-standard-error rule and leakage.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=13';
import { mean, sd } from '../../core/stats.js?v=13';

// Invented five-fold cross-validation errors (RMSE) for polynomial degrees 1–5.
const FOLDS = { 1: [2.10, 2.30, 1.95, 2.25, 2.15], 2: [1.15, 1.40, 1.05, 1.35, 1.25], 3: [1.05, 1.40, 0.95, 1.30, 1.20], 4: [1.00, 1.42, 0.92, 1.33, 1.18], 5: [1.10, 1.60, 0.98, 1.45, 1.27] };
const se = (f) => sd(f) / Math.sqrt(f.length);

export default {
  id: 'validation',
  title: 'Validating a model: held-out data and cross-validation',
  minutes: 6,
  hook: 'A model always looks better on the data it learned from. Holding data back, and choosing the simplest model that is as good as the best, is how you find out what it will really do.',
  idea: [
    'Error on the training data flatters a model, and a more complex model drives it ever lower. Error on <b>held-out</b> data, which the model never saw, falls at first and then rises once the model starts fitting noise. That rise is <b>overfitting</b>: the model has memorised the sample instead of the pattern.',
    'One small held-out set is a shaky judge. <b>k-fold cross-validation</b> splits the data into k folds and holds each out in turn, so every row is tested once. Average the k errors, and measure their wobble with a standard error. The <b>one-standard-error rule</b> takes the simplest model whose average error is within one standard error of the best: models that close can’t really be told apart, and simpler ones travel better.',
    'Every preparation step, such as scaling, filling gaps or choosing columns, must be fitted on the training part only. Otherwise information from the test rows <b>leaks</b> into training and flatters the score. For data over time, train on the past and test on the future.',
  ],
  formula: {
    html: 'SE = <span class="frac"><span>s<sub>folds</sub></span><span>√k</span></span>,&ensp; choose the simplest model with CV ≤ CV<sub>best</sub> + SE<sub>best</sub>,&ensp; E[training MSE] = σ<sup>2</sup><span class="frac"><span>n − p</span><span>n</span></span>,&ensp; E[new-data MSE] = σ<sup>2</sup><span class="frac"><span>n + p</span><span>n</span></span>',
    terms: [
      ['s<sub>folds</sub>, k', 'the standard deviation of the k fold errors, and the number of folds'],
      ['CV', 'a model’s average error across the folds'],
      ['n, p, σ', 'rows, fitted coefficients and noise, for a straight-line (least-squares) model; new data at the same inputs'],
    ],
  },
  example: {
    setup: 'Five-fold cross-validation scores polynomial curves of degree 1 to 5 on the same data. Which degree should you choose?',
    steps: [
      'Average each degree’s five fold errors: <b>2.15</b>, <b>1.24</b>, <b>1.18</b>, <b>1.17</b> and <b>1.28</b>. The lowest is degree 4, at 1.17.',
      'Degree 4’s fold errors have a standard deviation of <b>0.212</b>, so its standard error is 0.212 ÷ √5 = <b>0.095</b>.',
      'The threshold is 1.17 + 0.095 = <b>1.265</b>. Degrees 2, 3 and 4 all fall within it.',
      'Take the simplest of them: <b>degree 2</b>.',
    ],
    result: 'Degree 2’s error of <b>1.24</b> is within the noise of degree 4’s 1.17, and its curve bends far less, so it is the safer bet on new data. Degree 5’s rise to 1.28 is overfitting starting to show.',
  },
  mistake: {
    title: 'Letting the test data leak into training',
    html: 'Scaling the whole table before splitting lets the test rows set the means and standard deviations the model trains with, so the test score comes out too good. A stronger leak: a churn model that includes “refund issued”, a column recorded only after a customer cancels, can score near perfectly in testing and be useless in practice, because at prediction time that column is always empty. Fit every step on training rows, and use only what you would know at the moment of prediction.',
  },
  remember: [
    'Training error only falls with complexity; held-out error falls, then rises. The rise is overfitting.',
    'Cross-validation tests every row once. Prefer the simplest model within one standard error of the best.',
    'Fit scaling and every other preparation step on the training rows only, and never use information from after the prediction.',
  ],
  calc: {
    title: 'How much training error flatters a model',
    intro: 'A least-squares model with p coefficients fitted to n rows, noise of 1. The gap is pure optimism: the model has fitted part of the noise.',
    inputs: [
      { id: 'n', label: 'Rows of data', min: 20, max: 200, step: 10, value: 40, fmt: 'int' },
      { id: 'p', label: 'Coefficients in the model', min: 1, max: 19, step: 1, value: 5, fmt: 'int' },
    ],
    compute({ n, p }) {
      const train = Math.sqrt((n - p) / n), fresh = Math.sqrt((n + p) / n);
      const ratio = fresh / train;
      const note = p / n >= 0.5 ? 'Nearly as many coefficients as rows: the model can thread through the noise, so its training error is close to meaningless.'
        : ratio >= 1.2 ? 'A clear gap: training error understates the real error. Judge the model on held-out rows.'
          : 'Plenty of rows for this many coefficients: training error is only mildly optimistic, though held-out data is still the honest test.';
      return {
        headline: { value: `${F.num(ratio, 2)}×`, label: 'new-data error ÷ training error' },
        rows: [['Expected training error (RMSE)', F.num(train, 2)], ['Expected error on new data', F.num(fresh, 2)], ['True noise', '1.00']],
        note,
      };
    },
  },
  tool: { href: 'models/#lab', label: 'Why I hold data back, in How I build the models' },
  checks: (() => {
    const m = Object.fromEntries(Object.entries(FOLDS).map(([d, f]) => [d, mean(f)]));
    const best = Object.keys(m).reduce((a, b) => (m[b] < m[a] ? b : a));
    const thr = m[best] + se(FOLDS[best]);
    const pick = Object.keys(m).find((d) => m[d] <= thr);
    return [
      { what: 'degree 1', value: m[1], shown: 2.15, tol: 1e-9 }, { what: 'degree 2', value: m[2], shown: 1.24, tol: 1e-9 },
      { what: 'degree 3', value: m[3], shown: 1.18, tol: 1e-9 }, { what: 'degree 4', value: m[4], shown: 1.17, tol: 1e-9 },
      { what: 'degree 5', value: m[5], shown: 1.28, tol: 1e-9 }, { what: 'best degree', value: +best, shown: 4, tol: 0 },
      { what: 'sd of degree 4', value: sd(FOLDS[4]), shown: 0.212, tol: 0.0005 }, { what: 'SE of degree 4', value: se(FOLDS[4]), shown: 0.095, tol: 0.0005 },
      { what: 'threshold', value: thr, shown: 1.265, tol: 0.0005 }, { what: 'degree 2 within', value: m[2] <= thr ? 1 : 0, shown: 1, tol: 0 },
      { what: 'degree 5 outside', value: m[5] > thr ? 1 : 0, shown: 1, tol: 0 }, { what: 'degree 1 outside', value: m[1] > thr ? 1 : 0, shown: 1, tol: 0 },
      { what: 'one-SE pick', value: +pick, shown: 2, tol: 0 },
    ];
  })(),
};
