// Lesson: unsupervised learning — k-means and Ward clustering, dendrogram cuts, agreement between groupings, and PCA.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=11';
import { jacobiEigen } from '../../core/ml.js?v=11';

/** Eigenvalues (largest first) and the matching vectors of a symmetric matrix. */
function eig(A) {
  const e = jacobiEigen(A), idx = e.values.map((_, i) => i).sort((a, b) => e.values[b] - e.values[a]);
  return { values: idx.map((i) => e.values[i]), vectors: idx.map((i) => e.vectors.map((row) => row[i])) };
}

export default {
  id: 'mlunsup',
  title: 'Unsupervised learning: groups and directions',
  minutes: 7,
  hook: 'With no outcome to predict, the question becomes: which rows are alike, and which few directions carry most of the variation? Clustering answers the first; principal components the second.',
  idea: [
    '<b>k-means</b> places k centres and assigns each row to the nearest, moving the centres until the within-group squared distance is as small as it gets. You choose k. <b>Ward’s hierarchical clustering</b> starts with every row alone and keeps merging the two groups whose merge adds least spread. The <b>dendrogram</b> draws every merge at its height: cut it lower for more, smaller groups; higher for fewer. Standardise the columns first in both.',
    'Two methods rarely agree exactly. The <b>adjusted Rand index</b> measures how alike two groupings are: 1 means identical, about 0 means no more alike than chance. Low agreement often means there is little real structure to find, not that one method is wrong.',
    '<b>Principal component analysis</b> (PCA) finds new axes, each a weighted mix of the standardised columns, ordered by how much variation they carry. Each one’s share is its eigenvalue divided by the number of columns. In a biplot, long arrows pointing the same way mean positively correlated columns, and opposite ways negatively correlated.',
  ],
  formula: {
    html: 'Ward merge cost Δ(A, B) = <span class="frac"><span>n<sub>A</sub> n<sub>B</sub></span><span>n<sub>A</sub> + n<sub>B</sub></span></span> ‖c<sub>A</sub> − c<sub>B</sub>‖<sup>2</sup>,&ensp; share of PC<sub>k</sub> = <span class="frac"><span>λ<sub>k</sub></span><span>p</span></span>',
    terms: [
      ['n<sub>A</sub>, c<sub>A</sub>', 'the size and centre (mean) of group A; Ward merges the pair with the smallest cost'],
      ['λ<sub>k</sub>', 'the k-th largest eigenvalue of the correlation matrix'],
      ['p', 'the number of columns (the eigenvalues add up to p)'],
      ['score', 'a row’s position on component k: Σ w<sub>jk</sub>z<sub>j</sub>, each column’s weight times the row’s standardised value'],
    ],
    note: 'The dendrogram draws each merge at √(2Δ), the same heights as SciPy.',
  },
  example: {
    setup: 'Customers’ annual spend and store visits, both standardised, correlate at 0.8. Run PCA on the two columns.',
    steps: [
      'The correlation matrix is [1, 0.8; 0.8, 1]. For two columns its eigenvalues are 1 + r = <b>1.8</b> and 1 − r = <b>0.2</b>; they add up to 2, the number of columns.',
      'The first component carries 1.8 ÷ 2 = <b>90%</b> of the variation; the second, <b>10%</b>.',
      'Its weights are <b>0.707</b> on each column: an equal mix, best read as overall engagement. The second component’s weights are 0.707 and −0.707: spend relative to visits.',
      'A customer 1.2 standard deviations above average on spend and 0.8 on visits scores 0.707 × 1.2 + 0.707 × 0.8 = <b>1.41</b> on the first component and 0.707 × 1.2 − 0.707 × 0.8 = <b>0.28</b> on the second.',
    ],
    result: 'Two columns become one engagement score that keeps <b>90%</b> of their spread. Each column correlates <b>0.95</b> with it, which is why their biplot arrows are long and point the same way.',
  },
  mistake: {
    title: 'Running PCA or clustering on unscaled columns',
    html: 'Take income in dollars (standard deviation $20,000) and age in years (standard deviation 12), correlated at 0.3. Without standardising, the first component carries over <b>99.99%</b> of the variance and is income alone, because its numbers are bigger. Standardised, the first component carries <b>65%</b> and weighs both columns equally. Distances in k-means and Ward suffer the same way.',
  },
  remember: [
    'Cutting a dendrogram lower gives more, smaller groups. Standardise before any distance-based method.',
    'Adjusted Rand: 1 is identical groupings, about 0 is chance. Low agreement can mean there is no strong structure.',
    'A component is a weighted mix of all the columns; its share of variance is its eigenvalue ÷ the number of columns.',
  ],
  calc: {
    title: 'How many directions do three columns need?',
    intro: 'Set the correlations between three standardised columns and see how the variation splits across components.',
    inputs: [
      { id: 'r12', label: 'Correlation, columns 1 and 2', min: -0.9, max: 0.9, step: 0.05, value: 0.7, fmt: 'num', digits: 2 },
      { id: 'r13', label: 'Correlation, columns 1 and 3', min: -0.9, max: 0.9, step: 0.05, value: 0.5, fmt: 'num', digits: 2 },
      { id: 'r23', label: 'Correlation, columns 2 and 3', min: -0.9, max: 0.9, step: 0.05, value: 0.4, fmt: 'num', digits: 2 },
    ],
    compute({ r12, r13, r23 }) {
      const { values, vectors } = eig([[1, r12, r13], [r12, 1, r23], [r13, r23, 1]]);
      if (values[2] < -1e-9) return { error: 'These three correlations can’t all hold at once (the matrix would need negative variance). Ease one of them.' };
      const share = values.map((v) => Math.max(0, v) / 3);
      let w = vectors[0]; const big = w.reduce((b, v, i) => (Math.abs(v) > Math.abs(w[b]) ? i : b), 0); if (w[big] < 0) w = w.map((v) => -v);
      const note = share[0] >= 0.7 ? 'One direction carries most of the variation: the three columns mostly measure the same thing, and one score could stand in for them.'
        : share[0] + share[1] >= 0.9 ? 'Two directions carry almost everything: a two-dimensional map of the rows loses little.'
          : 'The variation is spread out: each column brings something the others don’t, so dropping components loses information.';
      return {
        headline: { value: F.pct(share[0], 0), label: 'of the variation on the first component' },
        rows: [['Second component', F.pct(share[1], 0)], ['First two together', F.pct(share[0] + share[1], 0)], ['First component’s weights', values[0] - values[1] < 0.05 ? 'no single best mix (components tie)' : w.map((v) => F.signed(v, 2)).join(', ')]],
        note,
      };
    },
  },
  tool: { href: 'analytics/unsupervised/#pca', label: 'Principal components, in Business analytics › Unsupervised learning' },
  checks: (() => {
    const two = eig([[1, 0.8], [0.8, 1]]), w = two.vectors[0].map(Math.abs);
    const pc1 = (1.2 + 0.8) / Math.SQRT2, pc2 = (1.2 - 0.8) / Math.SQRT2;
    const cov = 0.3 * 20000 * 12, raw = eig([[20000 ** 2, cov], [cov, 12 ** 2]]), std = eig([[1, 0.3], [0.3, 1]]);
    return [
      { what: 'eigenvalue 1', value: two.values[0], shown: 1.8, tol: 1e-9 }, { what: 'eigenvalue 2', value: two.values[1], shown: 0.2, tol: 1e-9 },
      { what: 'eigenvalues add to 2', value: two.values[0] + two.values[1], shown: 2, tol: 1e-9 },
      { what: 'PC1 share', value: (two.values[0] / 2) * 100, shown: 90, tol: 1e-6 }, { what: 'PC2 share', value: (two.values[1] / 2) * 100, shown: 10, tol: 1e-6 },
      { what: 'weight', value: w[0], shown: 0.707, tol: 0.0005 }, { what: 'weight 2', value: w[1], shown: 0.707, tol: 0.0005 },
      { what: 'PC1 score', value: pc1, shown: 1.41, tol: 0.005 }, { what: 'PC2 score', value: pc2, shown: 0.28, tol: 0.005 },
      { what: 'loading', value: w[0] * Math.sqrt(two.values[0]), shown: 0.95, tol: 0.005 },
      { what: 'unscaled PC1 share above 99.99%', value: raw.values[0] / (raw.values[0] + raw.values[1]) > 0.9999 ? 1 : 0, shown: 1, tol: 0 },
      { what: 'unscaled PC1 is income', value: Math.abs(raw.vectors[0][0]), shown: 1, tol: 1e-6 },
      { what: 'standardised PC1 share', value: (std.values[0] / 2) * 100, shown: 65, tol: 1e-6 },
    ];
  })(),
};
