// Run: node tests/inference.test.mjs   (compares assets/js/core/inference.js with SciPy/statsmodels fixtures)
import { readFileSync } from 'node:fs';
import * as I from '../assets/js/core/inference.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-infer.json', import.meta.url)), (k, v) => (v === 'inf' ? Infinity : v === '-inf' ? -Infinity : v));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = want === Infinity || want === -Infinity ? got === want : Math.abs(got - want) <= tol * Math.max(1e-300, Math.abs(want)) || Math.abs(got - want) < 1e-300;
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const eq = (label, got, want) => { checks++; if (got !== want) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); } };
const rel = 1e-9;                                           // relative tolerance for distribution values

for (const [x, mu, s, pdf, cdf, sf] of fx.dist.norm) {
  close(`normal.pdf(${x})`, I.normal.pdf(x, mu, s), pdf, rel);
  close(`normal.cdf(${x})`, I.normal.cdf(x, mu, s), cdf, rel);
  close(`normal.sf(${x})`, I.normal.sf(x, mu, s), sf, rel);
}
for (const [p, mu, s, w] of fx.dist.normInv) close(`normal.inv(${p})`, I.normal.inv(p, mu, s), w, 1e-9);
for (const [x, df, pdf, cdf, sf] of fx.dist.t) { close(`tPdf(${x},${df})`, I.tPdf(x, df), pdf, rel); close(`tCdf(${x},${df})`, I.tCdf(x, df), cdf, rel); close(`tSf(${x},${df})`, I.tSf(x, df), sf, 1e-8); }
for (const [x, k, pdf, cdf, sf] of fx.dist.chi2) { close(`chi2Pdf(${x},${k})`, I.chi2Pdf(x, k), pdf, rel); close(`chi2Cdf(${x},${k})`, I.chi2Cdf(x, k), cdf, rel); close(`chi2Sf(${x},${k})`, I.chi2Sf(x, k), sf, 1e-8); }
for (const [p, k, lo, up] of fx.dist.chi2Inv) { close(`chi2Inv(${p},${k})`, I.chi2Inv(p, k), lo, 1e-9); close(`chi2InvSf(${p},${k})`, I.chi2InvSf(p, k), up, 1e-9); }
for (const [x, d1, d2, pdf, cdf, sf] of fx.dist.f) { close(`fPdf(${x})`, I.fPdf(x, d1, d2), pdf, rel); close(`fCdf(${x})`, I.fCdf(x, d1, d2), cdf, rel); close(`fSf(${x})`, I.fSf(x, d1, d2), sf, 1e-8); }
for (const [p, d1, d2, lo, up] of fx.dist.fInv) { close(`fInv(${p})`, I.fInv(p, d1, d2), lo, 1e-9); close(`fInvSf(${p})`, I.fInvSf(p, d1, d2), up, 1e-9); }
for (const [k, n, p, pmf, cdf, sf] of fx.dist.binom) { close(`binomPmf(${k},${n},${p})`, I.binomPmf(k, n, p), pmf, 1e-9); close(`binomCdf(${k})`, I.binomCdf(k, n, p), cdf, 1e-9); close(`binomSf(${k})`, I.binomSf(k, n, p), sf, 1e-8); }
for (const [n, p, al, w] of fx.dist.binomInv) eq(`binomInv(${n},${p},${al})`, I.binomInv(al, n, p), w);
for (const [k, lam, pmf, cdf, sf] of fx.dist.poisson) { close(`poissonPmf(${k},${lam})`, I.poissonPmf(k, lam), pmf, 1e-9); close(`poissonCdf(${k})`, I.poissonCdf(k, lam), cdf, 1e-9); close(`poissonSf(${k})`, I.poissonSf(k, lam), sf, 1e-8); }
for (const [x, lam, pdf, cdf] of fx.dist.expon) { close(`exponPdf(${x})`, I.exponPdf(x, lam), pdf, rel); close(`exponCdf(${x})`, I.exponCdf(x, lam), cdf, rel); }
eq('combin(10,3)', I.combin(10, 3), 120); eq('combin(52,5)', I.combin(52, 5), 2598960); eq('permut(10,3)', I.permut(10, 3), 720); eq('factorial(10)', I.factorial(10), 3628800);

const { a, b, pre, post, groups } = fx.data;
for (const [mu, alt, [tv, pv, lo, hi]] of fx.tests.t1) {
  const r = I.tTest1(a, mu, { alternative: alt });
  close(`tTest1 t (${alt})`, r.t, tv, 1e-10); close(`tTest1 p (${alt})`, r.p, pv, 1e-8); close(`tTest1 low (${alt})`, r.low, lo, 1e-10); close(`tTest1 high (${alt})`, r.high, hi, 1e-10);
}
for (const [equalVar, alt, [tv, pv, df, lo, hi]] of fx.tests.t2) {
  const r = I.tTest2(a, b, { equalVar, alternative: alt });
  close(`tTest2 t (${equalVar},${alt})`, r.t, tv, 1e-10); close(`tTest2 p (${equalVar},${alt})`, r.p, pv, 1e-8); close(`tTest2 df`, r.df, df, 1e-10);
  close(`tTest2 low`, r.low, lo, 1e-9); close(`tTest2 high`, r.high, hi, 1e-9);
}
{
  const [tv, pv, lo, hi, r] = fx.tests.paired; const res = I.tTestPaired(post, pre);
  close('paired t', res.t, tv, 1e-10); close('paired p', res.p, pv, 1e-8); close('paired low', res.low, lo, 1e-10); close('paired high', res.high, hi, 1e-10); close('paired r', res.r, r, 1e-10);
}
{ const [mu, sigma, z, p] = fx.tests.z1; const r = I.zTest1(a, mu, sigma); close('zTest1 z', r.z, z, 1e-10); close('zTest1 p', r.p, p, 1e-9); }
{ const [F, p] = fx.tests.fvar; const r = I.fTestVar(a, b); close('fTestVar F', r.F, F, 1e-10); close('fTestVar p', r.p, p, 1e-8); }
{ const [x, n, p0, z, p] = fx.tests.prop1; const r = I.propTest1(x, n, p0); close('propTest1 z', r.z, z, 1e-10); close('propTest1 p', r.pValue, p, 1e-8); }
{ const [x1, n1, x2, n2, z, p] = fx.tests.prop2; const r = I.propTest2(x1, n1, x2, n2); close('propTest2 z', r.z, z, 1e-10); close('propTest2 p', r.pValue, p, 1e-8); }
for (const [x, n, wald, wilson] of fx.tests.ciProp) {
  const w = I.ciProp(x, n), wl = I.ciProp(x, n, 0.95, 'wilson');
  close(`ciProp wald low ${x}/${n}`, w.low, wald[0], 1e-10); close(`ciProp wald high`, w.high, wald[1], 1e-10);
  close(`ciProp wilson low ${x}/${n}`, wl.low, wilson[0], 1e-10); close(`ciProp wilson high`, wl.high, wilson[1], 1e-10);
}
{ const [m, lo, hi] = fx.tests.ciMean; const r = I.ciMean(a); close('ciMean mean', r.mean, m, 1e-12); close('ciMean low', r.low, lo, 1e-10); close('ciMean high', r.high, hi, 1e-10); }
{ const [obs, stat, p] = fx.tests.gof; const r = I.chisqGof(obs, obs.map(() => 1 / obs.length)); close('gof stat', r.stat, stat, 1e-10); close('gof p', r.p, p, 1e-8); }
{ const [obs, probs, stat, p] = fx.tests.gofProbs; const r = I.chisqGof(obs, probs); close('gof probs stat', r.stat, stat, 1e-10); close('gof probs p', r.p, p, 1e-8); }
{
  const [tab, stat, p, dof, expd] = fx.tests.indep; const r = I.chisqIndependence(tab);
  close('indep stat', r.stat, stat, 1e-10); close('indep p', r.p, p, 1e-8); eq('indep df', r.df, dof);
  expd.forEach((row, i) => row.forEach((e, j) => close(`indep expected[${i}][${j}]`, r.expected[i][j], e, 1e-12)));
}
{ const [F, p, fc] = fx.tests.anova; const r = I.anova1(groups); close('anova F', r.F, F, 1e-10); close('anova p', r.p, p, 1e-8); close('anova F crit', r.fCrit, fc, 1e-9); }
{ const [F, p, df2] = fx.tests.welch; const r = I.anovaWelch(groups); close('Welch ANOVA F', r.F, F, 1e-10); close('Welch ANOVA p', r.p, p, 1e-8); close('Welch ANOVA df2', r.df2, df2, 1e-10); }
for (const [g, H, p] of fx.tests.kruskal) { const r = I.kruskal(g); close('Kruskal–Wallis H', r.H, H, 1e-10); close('Kruskal–Wallis p', r.p, p, 1e-8); }
for (const [delta, sigma, n, w] of fx.power.oneSample) close(`power one-sample ${delta}/${sigma}/${n}`, I.powerMean({ delta, sigma, n }), w, 1e-9);
for (const [delta, sigma, n, w] of fx.power.twoSample) close(`power two-sample ${delta}/${sigma}/${n}`, I.powerMean({ delta, sigma, n, twoSample: true }), w, 1e-9);
for (const [delta, sigma, n, w] of fx.power.oneSided) close(`power one-sided`, I.powerMean({ delta, sigma, n, alternative: 'greater' }), w, 1e-9);
for (const [delta, sigma, w] of fx.power.nFor80) eq(`n for 80% power ${delta}/${sigma}`, I.sampleSizeForPower({ delta, sigma, twoSample: true }), Math.ceil(w));
// sample sizes for intervals (textbook formula n = (z σ / E)², rounded up)
eq('sampleSizeProp(0.05)', I.sampleSizeProp(0.05), 385);
eq('sampleSizeProp(0.03)', I.sampleSizeProp(0.03), 1068);
eq('sampleSizeMean(15, 3)', I.sampleSizeMean(15, 3), 97);

console.log(fails ? `${fails} of ${checks} inference checks FAILED` : `all ${checks} inference checks passed`);
process.exit(fails ? 1 : 0);
