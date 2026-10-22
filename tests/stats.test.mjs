// Run: node tests/stats.test.mjs   (compares assets/js/core/stats.js with SciPy/statsmodels fixtures)
import { readFileSync } from 'node:fs';
import * as S from '../assets/js/core/stats.js';
import * as HW from '../assets/js/core/forecast.js';
import { unitEconomics, PRESETS } from '../assets/js/core/saas.js';
import * as FIN from '../assets/js/core/fin.js';
import * as CL from '../assets/js/core/classify.js';
import * as AB from '../assets/js/core/abtest.js';
import * as LE from '../assets/js/core/learn.js';
import * as IV from '../assets/js/core/invest.js';
import * as PF from '../assets/js/core/portfolio.js';
import * as RK from '../assets/js/core/risk.js';

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

// robust (HC3) standard errors and robust Wald F against statsmodels cov_type="HC3", use_t=True
const rb = fit.robust();
rb.coefs.forEach((c, i) => { close(`HC3 se ${c.name}`, c.se, fx.hc3.bse[i], 1e-8); close(`HC3 p ${c.name}`, c.p, fx.hc3.pvalues[i], 1e-7); });
close('HC3 Wald F', rb.F, fx.hc3.f, 1e-8);
close('HC3 Wald F p', rb.pF, fx.hc3.fp, 1e-7);

// Holt-Winters: starting states, one-step fits, forecasts and interval variance against statsmodels ETSModel
const hw = fx.hw;
const init = HW.initialStates(hw.y, hw.m);
close('HW l0', init.l0, hw.l0, 1e-10); close('HW b0', init.b0, hw.b0, 1e-10);
init.s0.forEach((v, i) => close(`HW s0[${i}]`, v, hw.s0[i], 1e-9));
const params = { alpha: hw.alpha, beta: hw.beta, gamma: hw.gamma };
const run = HW.filter(hw.y, hw.m, params, init);
let worstFit = 0; hw.fitted.forEach((v, i) => { worstFit = Math.max(worstFit, Math.abs(run.fitted[i] - v)); });
close('HW one-step fits (max error)', worstFit, 0, 1e-9);
const hwp = HW.project(run, hw.m, params, hw.mean.length);
hw.mean.forEach((v, i) => close(`HW forecast h=${i + 1}`, hwp.mean[i], v, 1e-9));
hw.mult.forEach((v, i) => close(`HW variance multiplier h=${i + 1}`, hwp.mult[i], v, 1e-9));
const best = HW.fitAdditive(hw.y, hw.m);
checks++; if (!(best.run.sse <= hw.best_sse * (1 + 1e-4))) { fails++; console.log(`FAIL HW optimiser: SSE ${best.run.sse} vs statsmodels ${hw.best_sse}`); }

// unit economics: hand-worked business-subscription example
const ue = unitEconomics(PRESETS.saas);
close('CAC', ue.cac, 900000 / 150, 1e-12);
close('LTV', ue.ltv, 420 * 0.8 / 0.012, 1e-12);
close('LTV:CAC', ue.ratio, (420 * 0.8 / 0.012) / 6000, 1e-12);
close('simple payback', ue.paybackSimple, 6000 / 336, 1e-12);
close('magic number', ue.magic, 0.7, 1e-12);
close('NRR', ue.nrr, 1.02, 1e-12);
close('GRR', ue.grr, 0.87, 1e-12);
{ // churn-adjusted payback falls between the months where the summed margin first reaches CAC
  let cum = 0, month = 0; while (cum < ue.cac) { cum += 336 * (1 - 0.012) ** month; month++; }
  checks++; if (!(ue.paybackChurn > month - 1 && ue.paybackChurn <= month)) { fails++; console.log(`FAIL churn payback ${ue.paybackChurn} vs month ${month}`); }
}
checks++; if (!unitEconomics({ ...PRESETS.saas, churn: 0 }).error) { fails++; console.log('FAIL zero churn accepted'); }

// ---------------------------------------------------------------- finance: options, bonds, WACC
for (const c of fx.bs) {
  const r = FIN.blackScholes(c);
  const tag = `BS ${c.type} S=${c.S} K=${c.K}`;
  close(`${tag} price`, r.price, c.price, 1e-10);
  close(`${tag} delta`, r.delta, c.delta, 1e-6); close(`${tag} gamma`, r.gamma, c.gamma, 1e-4);
  close(`${tag} vega`, r.vega, c.vega, 1e-6); close(`${tag} theta`, r.theta, c.theta, 1e-5); close(`${tag} rho`, r.rho, c.rho, 1e-6);
  close(`${tag} put-call parity`, r.call - r.put, c.S * Math.exp(-c.q * c.T) - c.K * Math.exp(-c.r * c.T), 1e-12);
  close(`${tag} implied vol`, FIN.impliedVol(c, c.price), c.sigma, 1e-7);
}
for (const c of fx.bonds) {
  const tag = `bond ${c.couponRate * 100}% ${c.years}y m=${c.freq}`;
  const r = FIN.bond({ ...c, mode: 'yield', ytm: c.y });
  close(`${tag} price`, r.price, c.price, 1e-11);
  close(`${tag} modified duration`, r.modified, c.modified, 1e-6);
  close(`${tag} convexity`, r.convexity, c.convexity, 1e-4);
  close(`${tag} yield from price`, FIN.bond({ ...c, mode: 'price', price: c.price2 }).ytm, c.ytm2, 1e-9);
}
{ const w = FIN.wacc({ rf: 0.04, beta: 1.2, erp: 0.055, kd: 0.06, tax: 0.25, equity: 600, debt: 400 });
  close('CAPM cost of equity', w.ke, 0.04 + 1.2 * 0.055, 1e-12); close('WACC', w.wacc, 0.6 * 0.106 + 0.4 * 0.045, 1e-12); }

// ---------------------------------------------------------------- logistic regression, ROC, k-means, silhouette
const lg = CL.logit(fx.logit.x, fx.logit.y);
lg.coefs.forEach((c, i) => { close(`logit coef ${i}`, c.estimate, fx.logit.params[i], 1e-6); close(`logit se ${i}`, c.se, fx.logit.bse[i], 1e-5); close(`logit p ${i}`, c.p, fx.logit.pvalues[i], 1e-5); });
close('logit log-likelihood', lg.ll, fx.logit.llf, 1e-9); close('logit null log-likelihood', lg.ll0, fx.logit.llnull, 1e-9);
close('logit McFadden R²', lg.pseudoR2, fx.logit.prsquared, 1e-8);
close('ROC AUC', CL.roc(fx.logit.y, Array.from(lg.prob)).auc, fx.logit.auc, 1e-10);
const km = CL.kmeans(fx.kmeans.rows, 3);
close('k-means inertia', km.inertia, fx.kmeans.inertia, 1e-8);
close('silhouette (same labels as scikit-learn)', CL.silhouette(fx.kmeans.rows, fx.kmeans.labels), fx.kmeans.silhouette, 1e-10);

// ---------------------------------------------------------------- A/B test
const ab = AB.compareRates({ n: fx.ab.a[0], conv: fx.ab.a[1] }, { n: fx.ab.b[0], conv: fx.ab.b[1] });
close('A/B z', ab.z, fx.ab.z, 1e-10); close('A/B p', ab.p, fx.ab.p, 1e-9);
{ const n = AB.sampleSize(0.05, 0.06); checks++; const pw = AB.power(0.05, 0.06, n), pwLess = AB.power(0.05, 0.06, n - 1);
  if (!(pw >= 0.8 && pwLess < 0.8)) { fails++; console.log(`FAIL sample size ${n}: power ${pw}, one fewer ${pwLess}`); } }

// ---------------------------------------------------------------- learning engine
const est = LE.eap(fx.eap.items.map((item, i) => ({ item, correct: !!fx.eap.resp[i] })));
close('IRT EAP ability', est.theta, fx.eap.theta, 1e-5); close('IRT EAP standard error', est.se, fx.eap.se, 1e-5);
close('3PL at difficulty = (1 + c)/2', LE.p3pl(0.7, { a: 1.3, b: 0.7, c: 0.2 }), 0.6, 1e-12);
{ const it = { a: 1.4, b: 0.2, c: 0.25 }, h = 1e-5, t = -0.3;           // information = P′² / (PQ), P′ by finite differences
  const dP = (LE.p3pl(t + h, it) - LE.p3pl(t - h, it)) / (2 * h), P = LE.p3pl(t, it);
  close('3PL item information', LE.info3pl(t, it), dP * dP / (P * (1 - P)), 1e-8); }
{ const L = 0.3, s = 0.08, g = 0.2, T = 0.15;                             // BKT by hand, the document's equations
  const post = L * (1 - s) / (L * (1 - s) + (1 - L) * g);
  close('BKT update after a correct answer', LE.bktUpdate(L, true), post + (1 - post) * T, 1e-14);
  const postW = L * s / (L * s + (1 - L) * (1 - g));
  close('BKT update after a wrong answer', LE.bktUpdate(L, false), postW + (1 - postW) * T, 1e-14);
  close('BKT predicted correct', LE.bktPredict(L), L * (1 - s) + (1 - L) * g, 1e-14); }
close('HLR: recall is 50% after one half-life', LE.recall(3, 3), 0.5, 1e-14);
close('HLR: one more √correct doubles the half-life', LE.halfLife({ nCorrect: 4, nWrong: 0 }) / LE.halfLife({ nCorrect: 1, nWrong: 0 }), 2, 1e-12);
close('HLR: one more √wrong halves it', LE.halfLife({ nCorrect: 1, nWrong: 1 }) / LE.halfLife({ nCorrect: 1, nWrong: 0 }), 0.5, 1e-12);
close('individualised start: θ = 0 keeps the skill prior', LE.startMastery(0, 0.25), 0.25, 1e-12);


// ---------------------------------------------------------------- investment decisions (numpy-financial, NumPy roots, SciPy MILP)
const ok = (label, cond, detail = '') => { checks++; if (!cond) { fails++; console.log(`FAIL ${label} ${detail}`); } };
for (const [k, c] of Object.entries(fx.invest.cases)) {
  const a = IV.appraise(c.flows, { rate: fx.invest.rate, financeRate: 0.1, reinvestRate: 0.12 });
  close(`NPV ${k}`, a.npv, c.npv, 1e-12);
  ok(`IRR count ${k}`, a.irrs.length === c.irrs.length, `${a.irrs} vs ${c.irrs}`);
  a.irrs.forEach((r, i) => close(`IRR ${k} #${i + 1}`, r, c.irrs[i], 1e-9));
  if (c.irr != null) close(`IRR ${k} (numpy-financial)`, a.irr, c.irr, 1e-9); else ok(`IRR ${k} undefined when several`, Number.isNaN(a.irr));
  close(`MIRR ${k}`, a.mirr, c.mirr, 1e-12);
  close(`payback ${k}`, a.payback, c.payback ?? NaN, 1e-12);
  close(`discounted payback ${k}`, a.discPayback, c.disc ?? NaN, 1e-12);
}
{ const x = IV.crossover(fx.invest.cases.A.flows, fx.invest.cases.B.flows); ok('crossover count', x.length === fx.invest.crossAB.length); close('crossover rate', x[0], fx.invest.crossAB[0], 1e-9); }
{ const P = fx.ration.projects.map(([outlay, v], i) => ({ name: `P${i}`, outlay, npv: v })); const r = IV.ration(P, fx.ration.budget);
  close('rationing best NPV (SciPy MILP)', r.exactNpv, fx.ration.npv, 1e-12);
  ok('rationing picks the same projects', r.exact.every((v, i) => +v === fx.ration.pick[i]), JSON.stringify(r.exact));
  ok('PI ranking never beats the exact answer', r.greedyNpv <= r.exactNpv + 1e-9);
  ok('divisible projects never do worse', r.fractionalNpv >= r.exactNpv - 1e-9); }

// ---------------------------------------------------------------- portfolios (NumPy, pandas, statsmodels, SciPy SLSQP)
{ const R = fx.port.R, cols = R[0].map((_, j) => R.map((row) => row[j]));
  const m = PF.moments(cols);
  m.mu.forEach((v, i) => close(`annual mean ${i}`, v, fx.port.mu[i], 1e-12));
  m.cov.forEach((row, i) => row.forEach((v, j) => close(`annual cov ${i},${j}`, v, fx.port.cov[i][j], 1e-10)));
  const g = PF.minVariance(m.mu, m.cov);
  close('minimum-variance portfolio variance (SLSQP)', PF.portVar(g, m.cov), fx.port.gmvVar, 1e-7);
  g.forEach((w, i) => close(`minimum-variance weight ${i}`, w, fx.port.gmv[i], 2e-5));
  const wt = PF.minVariance(m.mu, m.cov, fx.port.target);
  close('target-return portfolio variance (SLSQP)', PF.portVar(wt, m.cov), fx.port.wtVar, 1e-7);
  close('target return hit', PF.portRet(wt, m.mu), fx.port.target, 1e-10);
  wt.forEach((w, i) => close(`target-return weight ${i}`, w, fx.port.wt[i], 2e-5));
  const ms = PF.maxSharpe(m.mu, m.cov, fx.port.rf);
  close('max-Sharpe ratio (SLSQP)', (PF.portRet(ms, m.mu) - fx.port.rf) / Math.sqrt(PF.portVar(ms, m.cov)), fx.port.msSharpe, 1e-8);
  ms.forEach((w, i) => close(`max-Sharpe weight ${i}`, w, fx.port.ms[i], 2e-5));
  const fr = PF.frontier(m.mu, m.cov, 25);
  ok('frontier rises in return and risk', fr.points.every((p, i) => !i || (p.ret >= fr.points[i - 1].ret - 1e-12 && p.vol >= fr.points[i - 1].vol - 1e-12)));
  ok('every frontier mix is long-only and sums to one', fr.points.every((p) => p.w.every((w) => w >= 0) && Math.abs(p.w.reduce((a, b) => a + b, 0) - 1) < 1e-12));
  const rs = PF.riskReturn(cols[3], { rf: fx.port.rf });
  for (const key of ['annMean', 'vol', 'sortino', 'cagr', 'skew', 'kurt']) close(`riskReturn ${key}`, rs[key], fx.port.stats[key], 1e-9);
  const price = [50]; cols[3].forEach((r) => price.push(price[price.length - 1] * (1 + r)));
  const dd = PF.drawdowns(price);
  close('max drawdown', dd.max, fx.port.mdd, 1e-12); ok('drawdown trough and peak', dd.trough === fx.port.trough && dd.peak === fx.port.peak, `${dd.peak}-${dd.trough}`);
  const mk = cols[0].map((v, i) => 0.5 * v + 0.5 * cols[1][i]);
  const cp = PF.capm(cols[3], mk, { rf: fx.port.rf });
  close('CAPM beta (statsmodels)', cp.beta.estimate, fx.port.capm.beta, 1e-10); close('CAPM alpha', cp.alpha.estimate, fx.port.capm.alpha, 1e-10);
  close('CAPM beta SE', cp.beta.se, fx.port.capm.seBeta, 1e-9); close('CAPM R²', cp.r2, fx.port.capm.r2, 1e-10);
  const rb = PF.rollingBeta(cols[3], mk, 60);
  fx.port.rollBeta.forEach(([i, v]) => close(`rolling beta at ${i} (pandas)`, rb[i], v, 1e-9));
  const ma = PF.sma([1, 2, 3, 4, 5], 3); ok('moving average', Number.isNaN(ma[1]) && ma[2] === 2 && ma[4] === 4); }

// ---------------------------------------------------------------- market risk (NumPy, SciPy)
{ const r = fx.risk.r, c = fx.risk.c;
  const hs = RK.historical(r, c); close('historical VaR', hs.var, fx.risk.hist[0], 1e-12); close('historical ES', hs.es, fx.risk.hist[1], 1e-12);
  const pm = RK.parametric(r, c); close('normal VaR', pm.var, fx.risk.param[0], 1e-9); close('normal ES', pm.es, fx.risk.param[1], 1e-9);
  close('normal VaR, 10 periods', RK.parametric(r, c, 10).var, fx.risk.param10[0], 1e-9);
  close('Student-t degrees of freedom from kurtosis', RK.tDegrees(r), fx.risk.tdist.nu, 1e-9);
  const mc = RK.monteCarlo(r, c, 1, { draws: 200000 });
  close('Monte Carlo VaR ≈ Student-t VaR', mc.var, fx.risk.tdist.var, 0.03); close('Monte Carlo ES ≈ Student-t ES', mc.es, fx.risk.tdist.es, 0.03);
  for (const m of ['historical', 'normal', 'ewma']) {
    const b = RK.backtest(r, c, { method: m }), want = fx.risk.bt[m];
    ok(`backtest ${m}: same days and exceptions`, b.n === want.n && b.exceptions === want.x && b.hit.every((h, i) => +h === want.hits[i]), `${b.exceptions} vs ${want.x}`);
    close(`backtest ${m}: first forecast`, b.var[0], want.first, 1e-10); close(`backtest ${m}: last forecast`, b.var[b.n - 1], want.last, 1e-10);
  }
  for (const [x, n, p, lr, pv] of fx.risk.kupiec) { const k = RK.kupiec(x, n, p); close(`Kupiec LR x=${x}`, k.lr, lr, 1e-10); close(`Kupiec p x=${x}`, k.p, pv, 1e-9); }
  const ch = RK.christoffersen(fx.risk.christ.hits.map(Boolean), 0.01);
  close('Christoffersen independence LR', ch.lrInd, fx.risk.christ.out[0], 1e-10); close('Christoffersen p', ch.pInd, fx.risk.christ.out[1], 1e-9);
  close('conditional coverage = POF + independence', ch.lrCC, fx.risk.christ.out[0] + fx.risk.christ.pof[3], 1e-10);
  for (const [x, n, p, cum] of fx.risk.binom) close(`binomial CDF x=${x}`, RK.binomCdf(x, n, p), cum, 1e-10);
  ok('traffic light zones at 250 days, 99%', [[4, 'green'], [5, 'yellow'], [9, 'yellow'], [10, 'red']].every(([x, z]) => RK.trafficLight(x, 250, 0.01).zone === z));
  const book = { equity: 100, govt: { value: 100, duration: 7, convexity: 60 }, corp: { value: 50, duration: 5, convexity: 30 }, fx: 20, commodity: 10 };
  const st = RK.stress(book, { equity: -0.3, rates: 100, spreads: 200, fx: 0.1, commodity: -0.2 });
  close('stress P&L by hand', st.total, -30 + 100 * (-0.07 + 0.5 * 60 * 1e-4) + 50 * (-0.15 + 0.5 * 30 * 9e-4) + 2 - 2, 1e-12); }

console.log(fails ? `${fails} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
