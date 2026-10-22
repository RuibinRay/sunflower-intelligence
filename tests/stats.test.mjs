// Run: node tests/stats.test.mjs   (compares assets/js/core/stats.js with SciPy/statsmodels fixtures)
import { readFileSync } from 'node:fs';
import * as S from '../assets/js/core/stats.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-6) => {
  checks++;
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};

for (const [t, df, w] of fx.dist.tcdf) close(`tCdf(${t},${df})`, S.tCdf(t, df), w, 1e-9);
for (const [p, df, w] of fx.dist.tq) close(`tQuantile(${p},${df})`, S.tQuantile(p, df), w, 1e-8);
for (const [f, a, b, w] of fx.dist.fp) close(`fPUpper(${f})`, S.fPUpper(f, a, b), w, 1e-9);
for (const [x, k, w] of fx.dist.chi2p) close(`chi2PUpper(${x},${k})`, S.chi2PUpper(x, k), w, 1e-9);
for (const [p, w] of fx.dist.nq) close(`normQuantile(${p})`, S.normQuantile(p), w, 1e-9);
for (const [z, w] of fx.dist.ncdf) close(`normCdf(${z})`, S.normCdf(z), w, 1e-12);

const { x1, x2, x3, y } = fx.data;
const d = S.describe(x1);
close('mean', d.mean, fx.describe.mean, 1e-12);
close('sd', d.sd, fx.describe.sd, 1e-12);
close('median', d.median, fx.describe.median, 1e-12);
close('q1', d.q1, fx.describe.q1, 1e-12);
close('q3', d.q3, fx.describe.q3, 1e-12);
close('skew', d.skewness, fx.describe.skew, 1e-10);
close('kurt', d.kurtosis, fx.describe.kurt, 1e-10);
close('ciLow', d.ciLow, fx.describe.ciLow, 1e-10);
close('ciHigh', d.ciHigh, fx.describe.ciHigh, 1e-10);

const pr = S.pearson(x1, y);
close('pearson r', pr.r, fx.corr.pearson[0], 1e-12);
close('pearson p', pr.p, fx.corr.pearson[1], 1e-9);
const sp = S.spearman(x1, y);
close('spearman r', sp.r, fx.corr.spearman[0], 1e-12);
close('spearman p', sp.p, fx.corr.spearman[1], 1e-9);

const fit = S.ols([x1, x2, x3], y, { names: ['x1', 'x2', 'x3'] });
fit.coefs.forEach((c, i) => {
  close(`beta${i}`, c.estimate, fx.ols.params[i], 1e-10);
  close(`se${i}`, c.se, fx.ols.bse[i], 1e-10);
  close(`p${i}`, c.p, fx.ols.pvalues[i], 1e-8);
  close(`ciLo${i}`, c.low, fx.ols.ci[i][0], 1e-9);
  close(`ciHi${i}`, c.high, fx.ols.ci[i][1], 1e-9);
});
close('r2', fit.r2, fx.ols.r2, 1e-12);
close('adjr2', fit.adjR2, fx.ols.adjr2, 1e-12);
close('F', fit.F, fx.ols.f, 1e-10);
close('pF', fit.pF, fx.ols.fp, 1e-6);
const pd = fit.predict([11, 4, 7]);
close('pred mean', pd.yhat, fx.ols.pred.mean, 1e-10);
close('pred obs lo', pd.piLow, fx.ols.pred.obs_lo, 1e-9);
close('pred obs hi', pd.piHigh, fx.ols.pred.obs_hi, 1e-9);
close('pred mean lo', pd.ciLow, fx.ols.pred.mean_lo, 1e-9);
close('pred mean hi', pd.ciHigh, fx.ols.pred.mean_hi, 1e-9);

const bp = S.breuschPagan([x1, x2, x3], fit.resid);
close('BP lm', bp.lm, fx.bp.lm, 1e-9);
close('BP p', bp.p, fx.bp.p, 1e-9);
S.vif([x1, x2, x3]).forEach((v, i) => close(`vif${i}`, v, fx.vif[i], 1e-9));

// collinearity is reported, not hidden
const col = S.ols([x1, x1.map((v) => 2 * v)], y, { names: ['a', 'b'] });
checks++; if (!col.error) { fails++; console.log('FAIL collinear not detected'); }

// quintile scores: ties share a score, higher-is-better flips
const q = S.quintileScores([1, 1, 1, 2, 3, 4, 5, 6, 7, 8]);
checks++; if (!(q[0] === q[1] && q[1] === q[2] && q[9] === 5)) { fails++; console.log('FAIL quintiles', q); }

// polynomial fit reproduces a cubic exactly
const xs = Array.from({ length: 20 }, (_, i) => i / 2), ys = xs.map((v) => 2 - v + 0.5 * v ** 2 - 0.05 * v ** 3);
const f3 = S.polyfit(xs, ys, 3);
close('polyfit cubic', f3(3.3), 2 - 3.3 + 0.5 * 3.3 ** 2 - 0.05 * 3.3 ** 3, 1e-9);

console.log(fails ? `${fails} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
