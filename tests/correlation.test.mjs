// Run: node tests/correlation.test.mjs   (compares assets/js/core/correlation.js with SciPy and statsmodels fixtures)
import { readFileSync } from 'node:fs';
import * as C from '../assets/js/core/correlation.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-correlation.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truth = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };

fx.cases.forEach((c, k) => {
  close(`${k} covariance`, C.covariance(c.x, c.y), c.cov);
  close(`${k} population covariance`, C.covariance(c.x, c.y, { population: true }), c.covp);
  const P = C.pearson(c.x, c.y);
  close(`${k} r`, P.r, c.r); close(`${k} p`, P.p, c.p, 1e-7);
  close(`${k} CI low`, P.ci[0], c.ci[0], 1e-9); close(`${k} CI high`, P.ci[1], c.ci[1], 1e-9);
  const P90 = C.pearson(c.x, c.y, { conf: 0.9 });
  close(`${k} 90% CI low`, P90.ci[0], c.ci90[0], 1e-9); close(`${k} 90% CI high`, P90.ci[1], c.ci90[1], 1e-9);
  close(`${k} one-sided p`, C.pearson(c.x, c.y, { alternative: 'greater' }).p, c.pGreater, 1e-7);
  const S = C.spearman(c.x, c.y);
  close(`${k} rho`, S.rho, c.rho); close(`${k} rho p`, S.p, c.rhoP, 1e-7);
  const K = C.kendall(c.x, c.y);
  close(`${k} tau-b`, K.tau, c.tau); close(`${k} tau p`, K.p, c.tauP, 1e-7);
  const p1 = C.partial(c.x, c.y, [c.z]);
  close(`${k} partial | z`, p1.r, c.partial1, 1e-8); close(`${k} partial p`, p1.p, c.partial1P, 1e-6);
  close(`${k} partial | z, w`, C.partial(c.x, c.y, [c.z, c.w]).r, c.partial2, 1e-8);
  const rxz = C.pearson(c.x, c.z).r, ryz = C.pearson(c.y, c.z).r;
  close(`${k} partial from three r's`, C.partialFromR(c.r, rxz, ryz), c.partial1, 1e-8);
  close(`${k} r from z-scores`, C.rFromZ(c.x, c.y), c.r, 1e-9);
});
for (const m of ['bonferroni', 'holm', 'fdr_bh']) C.adjust(fx.ps, m).forEach((v, i) => close(`${m} ${i}`, v, fx.adj[m][i], 1e-12));
fx.power.forEach((t) => close(`power ${t.rho} n=${t.n}`, C.power(t.rho, t.n), t.power, 1e-7));
fx.sampleSize.forEach((t) => truth(`sample size ${t.rho}`, C.sampleSize(t.rho) === t.n));
fx.crit.forEach((t) => close(`critical r n=${t.n}`, C.criticalR(t.n), t.r, 1e-7));
fx.compare.forEach((t) => { const z = C.compareIndependent(t.r1, t.n1, t.r2, t.n2); close(`compare z`, z.z, t.z, 1e-9); close(`compare p`, z.p, t.p, 1e-7); });

// matrix: symmetric, diagonal 1, agrees with pairwise calls; adjusted p-values agree with adjust()
const c0 = fx.cases[1];
const M = C.matrix({ x: c0.x, y: c0.y, z: c0.z, w: c0.w }, { adjustMethod: 'holm' });
truth('matrix diagonal', M.r.every((row, i) => row[i] === 1) && M.pairs === 6);
truth('matrix symmetric', M.r.every((row, i) => row.every((v, j) => v === M.r[j][i])));
close('matrix r(x,y)', M.r[0][1], c0.r);
const raw = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(([i, j]) => M.p[i][j]);
C.adjust(raw, 'holm').forEach((v, k) => { const [i, j] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]][k]; close(`matrix holm ${k}`, M.pAdj[i][j], v, 1e-15); });
close('Spearman matrix', C.matrix({ x: c0.x, y: c0.y }, { method: 'spearman' }).r[0][1], c0.rho);
// pairwise deletion
const xs = [1, 2, 3, NaN, 5, 6], ys = [2, 4, null, 8, 10, 13];
truth('pairwise deletion drops incomplete pairs', C.pearson(xs, ys).n === 4);
// influence: one wild point dominates
const ix = [1, 2, 3, 4, 5, 6, 7, 8, 9, 30], iy = [2, 1, 4, 3, 5, 4, 6, 5, 7, 40];
const inf = C.influence(ix, iy);
truth('influence finds the extreme point', inf.most === 9 && inf.change < 0);
truth('perfect correlation gives p = 0', C.pearson([1, 2, 3, 4], [2, 4, 6, 8]).p === 0);
truth('unknown adjustment throws', (() => { try { C.adjust([0.1], 'xyz'); return false; } catch { return true; } })());

console.log(`${checks - fails}/${checks} correlation checks passed`);
if (fails) process.exit(1);
