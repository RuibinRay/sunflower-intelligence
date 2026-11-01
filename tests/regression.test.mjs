// Run: node tests/regression.test.mjs   (compares assets/js/core/regression.js with statsmodels fixtures)
import { readFileSync } from 'node:fs';
import * as R from '../assets/js/core/regression.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-regression.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-8) => {
  checks++;
  const ok = typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const all = (label, got, want, tol) => want.forEach((w, i) => close(`${label}[${i}]`, got[i], w, tol));

fx.cases.forEach((c, k) => {
  const xs = Object.fromEntries(c.X.map((col, j) => [`x${j + 1}`, col]));
  const f = R.fit(c.y, xs);
  all(`${k} params`, f.beta, c.params); all(`${k} se`, f.coefs.map((q) => q.se), c.bse); all(`${k} t`, f.coefs.map((q) => q.t), c.t);
  all(`${k} p`, f.coefs.map((q) => q.p), c.p, 1e-6);
  c.ci.forEach(([lo, hi], j) => { close(`${k} ci low ${j}`, f.coefs[j].low, lo); close(`${k} ci high ${j}`, f.coefs[j].high, hi); });
  close(`${k} r2`, f.r2, c.r2); close(`${k} adj`, f.adjR2, c.adj); close(`${k} F`, f.F, c.F); close(`${k} pF`, f.pF, c.pF, 1e-6);
  close(`${k} sigma`, f.sigma, c.sigma); close(`${k} llf`, f.logLik, c.llf); close(`${k} aic`, f.aic, c.aic); close(`${k} bic`, f.bic, c.bic);
  const I = R.influence(c.X, c.y);
  all(`${k} hat`, I.hat, c.hat); all(`${k} internal`, I.internal, c.internal); all(`${k} external`, I.external, c.external);
  all(`${k} cooks`, I.cooks, c.cooks); all(`${k} dffits`, I.dffits, c.dffits);
  close(`${k} DW`, R.durbinWatson(f.resid), c.dw);
  const bp = R.breuschPagan(c.X, f.resid); close(`${k} BP LM`, bp.lm, c.bpLM); close(`${k} BP p`, bp.p, c.bpP, 1e-6);
  all(`${k} HC3`, f.robust().coefs.map((q) => q.se), c.hc3);
  const pr = f.predict(c.x0);
  close(`${k} yhat`, pr.yhat, c.yhat); close(`${k} CI low`, pr.ciLow, c.ciLow); close(`${k} CI high`, pr.ciHigh, c.ciHigh);
  close(`${k} PI low`, pr.piLow, c.piLow); close(`${k} PI high`, pr.piHigh, c.piHigh);
  all(`${k} standardized`, R.standardized(f, c.X, c.y), c.std);
  if (c.nestedF !== undefined) {
    const red = R.fit(c.y, { x1: c.X[0] }), t = R.nestedF(f, red);
    close(`${k} nested F`, t.F, c.nestedF); close(`${k} nested p`, t.p, c.nestedP, 1e-6); close(`${k} nested df`, t.df1, c.nestedDf);
  }
});

fx.logits.forEach((c, k) => {
  const xs = Object.fromEntries(c.X.map((col, j) => [`x${j + 1}`, col]));
  const m = R.logistic(c.y, xs);
  all(`L${k} params`, m.beta, c.params, 1e-6); all(`L${k} se`, m.coefs.map((q) => q.se), c.bse, 1e-6);
  all(`L${k} z`, m.coefs.map((q) => q.z), c.z, 1e-6); all(`L${k} p`, m.coefs.map((q) => q.p), c.p, 1e-5);
  close(`L${k} llf`, m.ll, c.llf); close(`L${k} llnull`, m.ll0, c.llnull); close(`L${k} LR`, m.lr, c.llr, 1e-7);
  close(`L${k} LR p`, m.lrP, c.llrP, 1e-5); close(`L${k} McFadden`, m.mcfadden, c.prsq, 1e-8);
  close(`L${k} aic`, m.aic, c.aic); close(`L${k} bic`, m.bic, c.bic);
  const pr = m.predictCI(c.x0);
  close(`L${k} prob`, pr.p, c.prob, 1e-7); close(`L${k} prob low`, pr.low, c.probLow, 1e-6); close(`L${k} prob high`, pr.high, c.probHigh, 1e-6);
  if (c.lrStat !== undefined) {
    const red = R.logistic(c.y, { x1: c.X[0] }), t = R.lrTest(m, red);
    close(`L${k} LR test`, t.stat, c.lrStat, 1e-6); close(`L${k} LR df`, t.df, c.lrDf);
  }
});

close('lag-1 autocorrelation', R.lag1(fx.series), fx.lag1);
// dummies and interactions
const d = R.dummies(['Mon', 'Sat', 'Sun', 'Mon'], { reference: 'Mon', name: 'Day' });
checks++; if (JSON.stringify(d) !== JSON.stringify({ 'Day: Sat': [0, 1, 0, 0], 'Day: Sun': [0, 0, 1, 0] })) { fails++; console.log('FAIL dummies', d); }
checks++; if (JSON.stringify(R.interaction([1, 2, 3], [0, 1, 2])) !== '[0,2,6]') { fails++; console.log('FAIL interaction'); }
// normal scores: Blom positions, sorted
const ns = R.normalScores([3, 1, 2]);
close('normal scores 1', ns[0].theoretical, -0.8694237732888853, 1e-9); close('normal scores sample', ns[2].sample, 3);

console.log(fails ? `${fails} of ${checks} regression checks FAILED` : `${checks}/${checks} regression checks passed`);
process.exit(fails ? 1 : 0);
