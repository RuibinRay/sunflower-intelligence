// Run: node tests/percmap.test.mjs   (compares assets/js/core/percmap.js with NumPy and scikit-learn fixtures)
import { readFileSync } from 'node:fs';
import * as PM from '../assets/js/core/percmap.js';
import { kmeans } from '../assets/js/core/classify.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-percmap.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truth = (label, cond, detail = '') => { checks++; if (!cond) { fails++; console.log(`FAIL ${label} ${detail}`); } };

// ---------------------------------------------------------------- the map against NumPy's SVD
fx.cases.forEach((c, n) => {
  const m = PM.perceptualMap(c.M);
  c.mu.forEach((v, a) => close(`map ${n}: mean of attribute ${a}`, m.mu[a], v));
  c.sd.forEach((v, a) => close(`map ${n}: sd of attribute ${a}`, m.sd[a], v));
  for (let k = 0; k < c.keep; k++) {
    close(`map ${n}: eigenvalue ${k}`, m.values[k], c.values[k], 1e-8);
    close(`map ${n}: share ${k}`, m.ratio[k], c.ratio[k], 1e-8);
    c.scores.forEach((row, b) => close(`map ${n}: brand ${b} score ${k}`, m.scores[b][k], row[k], 1e-7));
    c.loadings.forEach((row, a) => close(`map ${n}: attribute ${a} loading ${k}`, m.loadings[a][k], row[k], 1e-7));
    c.project.forEach((row, e) => close(`map ${n}: projected profile ${e} on component ${k}`, m.project(c.extra[e])[k], row[k], 1e-7));
  }
  close(`map ${n}: shares add to 1`, m.ratio.reduce((a, b) => a + b, 0), 1, 1e-12);
  // a brand's own profile projects to its own score
  c.M.forEach((row, b) => close(`map ${n}: projecting brand ${b}'s means gives its score`, m.project(row)[0], m.scores[b][0], 1e-12));
  // each loading is the attribute's correlation with the component scores (a biplot vector)
  const corr = (x, y) => { const mx = x.reduce((a, v) => a + v, 0) / x.length, my = y.reduce((a, v) => a + v, 0) / y.length; let sxy = 0, sxx = 0, syy = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sxx += (v - mx) ** 2; syy += (y[i] - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };
  for (let a = 0; a < c.M[0].length; a++) close(`map ${n}: loading ${a} equals its correlation with component 1`, m.loadings[a][0], corr(c.M.map((r) => r[a]), m.scores.map((s) => s[0])), 1e-9);
});
truth('too few brands is refused', !!PM.perceptualMap([[1, 2], [3, 4]]).error);
truth('a constant attribute is refused', !!PM.perceptualMap([[1, 2], [1, 3], [1, 5]]).error);

// ---------------------------------------------------------------- brand means, distances, typing tool, weighted score
{
  const recs = [{ brand: 0, ratings: [5, 3] }, { brand: 0, ratings: [7, 1] }, { brand: 1, ratings: [2, 4] }];
  const { means, counts } = PM.brandMeans(recs, 3, 2);
  close('brandMeans: brand 0 attribute 0', means[0][0], 6); close('brandMeans: brand 0 attribute 1', means[0][1], 2);
  close('brandMeans: count', counts[0], 2); truth('brandMeans: an unrated brand is NaN', Number.isNaN(means[2][0]));
  close('distance', PM.distance([0, 0, 9], [3, 4, -9]), 5);
  const lab = PM.nearestCentroid([[0, 0], [10, 10]], [[1, 2], [9, 7], [5, 4.9], [5, 5.1]]);
  truth('nearestCentroid', lab.join() === '0,1,0,1', lab.join());
  close('agreement', PM.agreement([0, 1, 1, 2], [0, 1, 2, 2]), 0.75);
  close('weightedScore', PM.weightedScore([[100, 50], [0, 100]], [3, 1])[0], 75);
  close('weightedScore (second)', PM.weightedScore([[100, 50], [0, 100]], [3, 1])[1], 62.5);
}

// ---------------------------------------------------------------- the elbow against scikit-learn's best of 50 starts
{
  const rows = fx.kmeansRows;
  const el = PM.elbow(rows, fx.kmeans.map((x) => x.k), { restarts: 20 });
  fx.kmeans.forEach((w, i) => {
    // k-means finds local optima: ours (20 seeded k-means++ starts) must reach scikit-learn's best to within 0.5%
    truth(`elbow k = ${w.k}: inertia within 0.5% of scikit-learn's best`, el[i].inertia <= w.inertia * 1.005, `${el[i].inertia} vs ${w.inertia}`);
    if (Math.abs(el[i].inertia - w.inertia) < 1e-6 * w.inertia) close(`elbow k = ${w.k}: silhouette at the same solution`, el[i].silhouette, w.silhouette, 1e-9);
  });
  truth('elbow: inertia falls as k rises', el.every((e, i) => !i || e.inertia < el[i - 1].inertia));
  const km = kmeans(rows, 4, { restarts: 20 });
  truth('k-means sizes add to n', km.sizes.reduce((a, b) => a + b, 0) === rows.length);
}

console.log(fails ? `${fails} of ${checks} percmap checks FAILED` : `all ${checks} percmap checks passed`);
process.exit(fails ? 1 : 0);
