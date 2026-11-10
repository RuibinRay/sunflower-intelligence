// Run: node tests/audit.test.mjs
// The calculation audit: every engine on many random, boundary and extreme inputs against independent reference
// implementations (tests/make_fixtures_audit.py: numpy-financial, NumPy, SciPy, statsmodels), followed by identities
// that must hold whatever the inputs (put-call parity, the Gordon closed form of a DCF, mid-year discounting).
// Findings, corrections and conventions are written up in AUDIT.md.
import { readFileSync } from 'node:fs';
import * as IV from '../assets/js/core/invest.js';
import * as FIN from '../assets/js/core/fin.js';
import * as PF from '../assets/js/core/portfolio.js';
import * as RK from '../assets/js/core/risk.js';
import * as S from '../assets/js/core/stats.js';
import * as AB from '../assets/js/core/abtest.js';
import * as HW from '../assets/js/core/forecast.js';
import * as V from '../assets/js/core/valuation.js';
import * as R from '../assets/js/core/ratios.js';
import { unitEconomics } from '../assets/js/core/saas.js';
import { EXAMPLE } from '../assets/js/data/valuation-example.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-audit.json', import.meta.url)));
let fails = 0, checks = 0; const by = {};
let section = '';
const sec = (name) => { section = name; by[name] = { checks: 0, fails: 0 }; };
const note = (ok, label, detail = '') => { checks++; by[section].checks++; if (!ok) { fails++; by[section].fails++; if (by[section].fails <= 8) console.log(`FAIL [${section}] ${label}${detail ? `: ${detail}` : ''}`); } };
const close = (label, got, want, tol = 1e-9, abs = 0) => { const ok = typeof got === 'number' && Number.isFinite(got) && (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) || Math.abs(got - want) <= abs); note(ok, label, `got ${got}, want ${want}`); };
const truth = (label, cond) => note(!!cond, label);
const nanOrNull = (label, got, want) => (want === null ? note(!Number.isFinite(got), label, `got ${got}, want none`) : null);

// ================================================================ capital budgeting
sec('NPV, IRR, MIRR, payback, PI');
fx.invest.cases.forEach((c, i) => {
  close(`npv ${i}`, IV.npv(c.rate, c.flows), c.npv, 1e-10);
  if (c.irrs) { const got = IV.irrAll(c.flows); note(got.length === c.irrs.length && got.every((r, k) => Math.abs(r - c.irrs[k]) <= 1e-7 * Math.max(1, Math.abs(c.irrs[k]))), `every IRR ${i}`, `got ${JSON.stringify(got)}, want ${JSON.stringify(c.irrs)} for ${JSON.stringify(c.flows)}`);
    for (const r of got) close(`NPV at IRR is zero ${i}`, IV.npv(r, c.flows) / c.flows.reduce((a, b, t) => a + Math.abs(b) / (1 + r) ** t, 0), 0, 0, 1e-9); }   // relative to the discounted size of the flows
  const m = IV.mirr(c.flows, c.fin, c.rein); if (c.mirr === null) nanOrNull(`mirr undefined ${i}`, m, null); else close(`mirr ${i}`, m, c.mirr, 1e-10);
  const pb = IV.payback(c.flows), dp = IV.payback(c.flows, c.rate);
  if (c.payback === null) nanOrNull(`payback never ${i}`, pb, null); else close(`payback ${i}`, pb, c.payback, 1e-10);
  if (c.discPayback === null) nanOrNull(`discounted payback never ${i}`, dp, null); else close(`discounted payback ${i}`, dp, c.discPayback, 1e-9);
  const pi = IV.profitabilityIndex(c.rate, c.flows); if (c.pi === null) nanOrNull(`PI undefined ${i}`, pi, null); else close(`PI ${i}`, pi, c.pi, 1e-9);
});
fx.invest.edge.forEach((c, i) => {
  close(`edge npv ${i}`, IV.npv(c.rate, c.flows), c.npv, 1e-10);
  const got = IV.irrAll(c.flows); note(got.length === c.irrs.length && got.every((r, k) => Math.abs(r - c.irrs[k]) <= 1e-6), `edge IRRs ${i}`, `got ${JSON.stringify(got)}, want ${JSON.stringify(c.irrs)} for ${JSON.stringify(c.flows)}`);
  if (c.payback === null) nanOrNull(`edge payback ${i}`, IV.payback(c.flows), null); else close(`edge payback ${i}`, IV.payback(c.flows), c.payback);
});
truth('IRR is NaN when there are several', Number.isNaN(IV.irr([-100, 230, -132])) && IV.irrAll([-100, 230, -132]).length === 2);
truth('NPV at a zero rate is the plain sum', IV.npv(0, [-100, 30, 80]) === 10);
truth('PI needs an outlay today', Number.isNaN(IV.profitabilityIndex(0.1, [100, 50])));

// ================================================================ bonds
sec('Bonds: price, yield, duration, convexity');
fx.bonds.forEach((b, i) => {
  const spec = { face: b.face, couponRate: b.couponRate, years: b.years, freq: b.freq };
  const at = FIN.bondAtYield(spec, b.y);
  close(`price ${i}`, at.price, b.price, 1e-11); close(`Macaulay ${i}`, at.macaulay, b.macaulay, 1e-10); close(`modified ${i}`, at.modified, b.modified, 1e-10); close(`convexity ${i}`, at.convexity, b.convexity, 1e-10);
  close(`modified duration is −dP/dy ÷ P ${i}`, at.modified, b.numMod, 1e-6);
  close(`yield from price ${i}`, FIN.bondYield(spec, b.price), b.ytm, 0, 2e-9);
});
{ const par = FIN.bond({ face: 1000, couponRate: 0.06, years: 10, freq: 2, mode: 'yield', ytm: 0.06 });
  close('a bond yielding its coupon prices at par', par.price, 1000, 1e-12);
  const z = FIN.bondAtYield({ face: 100, couponRate: 0, years: 7, freq: 1 }, 0.05); close('a zero-coupon bond’s Macaulay duration is its maturity', z.macaulay, 7, 1e-12);
  truth('invalid bonds are refused', !!FIN.bond({ face: -1, couponRate: 0.05, years: 5, freq: 2, mode: 'yield', ytm: 0.05 }).error && !!FIN.bond({ face: 100, couponRate: 0.05, years: 2.3, freq: 2, mode: 'yield', ytm: 0.05 }).error && !!FIN.bond({ face: 100, couponRate: 0.05, years: 5, freq: 2, mode: 'price', price: -5 }).error); }

// ================================================================ options
sec('Black-Scholes-Merton: price, Greeks, implied volatility');
fx.options.forEach((o, i) => {
  const r = FIN.blackScholes(o);
  const scale = Math.max(1e-6, o.S);
  for (const k of ['price', 'call', 'put', 'vega', 'theta', 'rho']) close(`${k} ${i}`, r[k] / scale, o[k] / scale, 0, 2e-9);
  close(`delta ${i}`, r.delta, o.delta, 0, 2e-9); close(`gamma ${i}`, r.gamma * scale, o.gamma * scale, 0, 2e-8);
  close(`put-call parity ${i}`, (r.call - r.put) / scale, (o.S * Math.exp(-o.q * o.T) - o.K * Math.exp(-o.r * o.T)) / scale, 0, 1e-10);
  if (o.vega / scale > 1e-3 && o.price > 1e-6 * scale) close(`implied volatility recovers sigma ${i}`, FIN.impliedVol({ ...o, sigma: undefined }, o.price), o.sigma, 0, 1e-6);
});
truth('invalid option inputs are refused', !!FIN.blackScholes({ S: 0, K: 100, T: 1, r: 0.05, sigma: 0.2, type: 'call' }).error && !!FIN.blackScholes({ S: 100, K: 100, T: 0, r: 0.05, sigma: 0.2, type: 'call' }).error && !!FIN.blackScholes({ S: 100, K: 100, T: 1, r: 0.05, sigma: 0, type: 'call' }).error);
truth('no implied volatility below intrinsic value', Number.isNaN(FIN.impliedVol({ S: 100, K: 50, T: 1, r: 0.05, q: 0, type: 'call' }, 10)));

// ================================================================ portfolios
sec('Return, volatility, Sharpe, Sortino, drawdown, beta');
fx.portfolio.forEach((p, i) => {
  const rr = PF.riskReturn(p.r, { periods: p.periods, rf: p.rf });
  for (const k of ['annMean', 'vol', 'cagr', 'sharpe', 'downsideDev']) close(`${k} ${i}`, rr[k], p.rr[k], 1e-10);
  if (p.rr.sortino !== null) close(`sortino ${i}`, rr.sortino, p.rr.sortino, 1e-10);
  const prices = [100]; p.r.forEach((x) => prices.push(prices[prices.length - 1] * (1 + x)));
  const dd = PF.drawdowns(prices.slice(1));
  close(`max drawdown ${i}`, dd.max, p.maxDrawdown, 1e-10); truth(`trough position ${i}`, dd.trough === p.troughAt);
  const c = PF.capm(p.r, p.market, { rf: p.rf, periods: p.periods });
  close(`beta ${i}`, c.beta.estimate, p.beta, 1e-9); close(`alpha ${i}`, c.alpha.estimate, p.alpha, 1e-8, 1e-12); close(`beta standard error ${i}`, c.beta.se, p.betaSe, 1e-8); close(`R² ${i}`, c.r2, p.r2, 1e-9);
});
sec('Efficient frontier against SciPy SLSQP');
fx.frontier.forEach((q, i) => {
  const w = PF.minVariance(q.mu, q.cov); close(`minimum variance ${i}`, PF.portVar(w, q.cov), q.gmvVar, 1e-6);
  truth(`minimum variance is no worse than the optimiser ${i}`, PF.portVar(w, q.cov) <= q.gmvVar * (1 + 1e-9));
  truth(`weights are long-only and sum to one ${i}`, w.every((x) => x >= -1e-12) && Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 1e-12);
  const ms = PF.maxSharpe(q.mu, q.cov, q.rf); const sh = (PF.portRet(ms, q.mu) - q.rf) / Math.sqrt(PF.portVar(ms, q.cov));
  close(`maximum Sharpe ${i}`, sh, q.sharpe, 1e-6); truth(`maximum Sharpe is no worse than the optimiser ${i}`, sh >= q.sharpe * (1 - 1e-9));
  if (q.targetVar !== null) { const wt = PF.minVariance(q.mu, q.cov, q.target); close(`minimum variance at a target return ${i}`, PF.portVar(wt, q.cov), q.targetVar, 1e-5); close(`target return met ${i}`, PF.portRet(wt, q.mu), q.target, 1e-9); }
});

// ================================================================ market risk
sec('VaR, Expected Shortfall, backtests');
fx.risk.forEach((q, i) => {
  const hs = RK.historical(q.r, q.c, q.h), pa = RK.parametric(q.r, q.c, q.h);
  close(`historical VaR ${i}`, hs.var, q.histVar, 1e-10); close(`historical ES ${i}`, hs.es, q.histEs, 1e-10); truth(`tail count ${i}`, hs.tail === q.tail);
  close(`normal VaR ${i}`, pa.var, q.paraVar, 1e-9); close(`normal ES ${i}`, pa.es, q.paraEs, 1e-9);
  truth(`ES is at least VaR ${i}`, hs.es >= hs.var - 1e-15 && pa.es >= pa.var);
  close(`EWMA volatility ${i}`, RK.ewmaSigma(q.r), q.ewma, 1e-10);
});
fx.kupiec.forEach((k) => { const r = RK.kupiec(k.x, k.n, k.p); close(`Kupiec LR x=${k.x}`, r.lr, k.lr, 1e-9, 1e-10); close(`Kupiec p x=${k.x}`, r.p, k.pv, 1e-8, 1e-12); });
fx.binom.forEach((b) => close(`binomial cdf ${b.x}/${b.n}`, RK.binomCdf(b.x, b.n, b.p), b.cdf, 1e-9));
fx.basel.forEach((b) => truth(`Basel zone for ${b.x} exceptions in 250 days`, RK.trafficLight(b.x, 250, 0.01).zone === b.zone));
fx.christoffersen.forEach((q, i) => { const r = RK.christoffersen(q.hits.map(Boolean), 0.01); truth(`transition counts ${i}`, r.n00 === q.n00 && r.n01 === q.n01 && r.n10 === q.n10 && r.n11 === q.n11); close(`independence LR ${i}`, r.lrInd, q.lrInd, 1e-9, 1e-10); close(`independence p ${i}`, r.pInd, q.pInd, 1e-8, 1e-12); });

// ================================================================ distributions
sec('Distribution functions at the extremes');
fx.dist.ncdf.forEach(([z, w]) => close(`normCdf(${z})`, S.normCdf(z), w, 1e-10 * Math.min(1, Math.abs(w) || 1) / Math.max(1, Math.abs(w)), 0));   // relative accuracy, in the far tail too
close('the two-sided p-value of z = 9 keeps its digits', 2 * S.normCdf(-9), 2.257176811907681e-19, 1e-9);
fx.dist.nq.forEach(([p, w]) => close(`normQuantile(${p})`, S.normQuantile(p), w, 1e-10, 1e-12));
fx.dist.tcdf.forEach(([t, df, w]) => close(`tCdf(${t}, ${df})`, S.tCdf(t, df), w, 1e-8, 1e-14));
fx.dist.tq.forEach(([p, df, w]) => close(`tQuantile(${p}, ${df})`, S.tQuantile(p, df), w, 1e-7));
fx.dist.chi2.forEach(([x, k, w]) => close(`chi2PUpper(${x}, ${k})`, S.chi2PUpper(x, k), w, 1e-8 * Math.min(1, w) , 1e-300));
fx.dist.fp.forEach(([x, a, b, w]) => close(`fPUpper(${x}, ${a}, ${b})`, S.fPUpper(x, a, b), w, 1e-8, 1e-14));
fx.dist.betainc.forEach(([x, a, b, w]) => close(`betaInc(${x}, ${a}, ${b})`, S.betaInc(x, a, b), w, 1e-8, 1e-14));

// ================================================================ regression
sec('OLS against statsmodels');
fx.ols.forEach((q, i) => {
  const fit = S.ols(q.X, q.y);
  if (fit.error) { truth(`ols ${i} ran`, false); return; }
  fit.coefs.forEach((c, j) => { close(`coefficient ${i}.${j}`, c.estimate, q.beta[j], 1e-6, 1e-9); close(`standard error ${i}.${j}`, c.se, q.se[j], 1e-6); close(`p-value ${i}.${j}`, c.p, q.p[j], 1e-6, 1e-12); });
  close(`R² ${i}`, fit.r2, q.r2, 1e-9); close(`adjusted R² ${i}`, fit.adjR2, q.adjR2, 1e-9); close(`F ${i}`, fit.F, q.F, 1e-7); close(`residual sd ${i}`, fit.sigma, q.sigma, 1e-8);
  const rob = fit.robust('HC3'); rob.coefs.forEach((c, j) => close(`HC3 standard error ${i}.${j}`, c.se, q.hc3[j], 1e-6));
});

// ================================================================ marketing
sec('A/B tests, sample size, unit economics');
fx.ab.forEach((q, i) => { const r = AB.compareRates(q.a, q.b); close(`z ${i}`, r.z, q.z, 1e-9); close(`p ${i}`, r.p, q.p, 1e-7, 1e-13); close(`interval low ${i}`, r.low, q.low, 1e-9); close(`interval high ${i}`, r.high, q.high, 1e-9); });
fx.sampleSize.forEach((q) => { truth(`sample size ${q.p1}→${q.p2}`, AB.sampleSize(q.p1, q.p2, { alpha: q.alpha, power: q.power }) === q.n); close(`power at that size ${q.p1}→${q.p2}`, AB.power(q.p1, q.p2, q.n, { alpha: q.alpha }), q.achieved, 1e-9); truth('the planned size reaches the planned power', AB.power(q.p1, q.p2, q.n, { alpha: q.alpha }) >= q.power - 1e-9); });
truth('A/B inputs are validated', !!AB.compareRates({ n: 0, conv: 0 }, { n: 10, conv: 1 }).error && !!AB.compareRates({ n: 10, conv: 11 }, { n: 10, conv: 1 }).error && Number.isNaN(AB.sampleSize(0.1, 0.1)));
fx.unitEconomics.forEach((q, i) => { const u = unitEconomics(q.inp); close(`CAC ${i}`, u.cac, q.cac); close(`LTV equals the sum of the cohort’s margins ${i}`, u.ltv, q.ltv, 1e-9); close(`simple payback ${i}`, u.paybackSimple, q.paybackSimple);
  if (q.paybackChurn === null) truth(`payback never with churn ${i}`, u.paybackChurn === Infinity); else { close(`payback with churn ${i}`, u.paybackChurn, q.paybackChurn, 1e-9); close(`cumulative margin at payback equals CAC ${i}`, u.marginPerMonth * (1 - (1 - q.inp.churn) ** u.paybackChurn) / q.inp.churn, u.cac, 1e-9); }
  close(`magic number ${i}`, u.magic, q.magic); close(`net revenue retention ${i}`, u.nrr, q.nrr); close(`gross revenue retention ${i}`, u.grr, q.grr); });

// ================================================================ forecasting
sec('Holt-Winters recursion and forecast variance');
fx.holtWinters.forEach((q, i) => {
  const init = HW.initialStates(q.y, q.m), par = { alpha: q.alpha, beta: q.beta, gamma: q.gamma };
  const run = HW.filter(q.y, q.m, par, init), pr = HW.project(run, q.m, par, q.h);
  close(`sum of squared errors ${i}`, run.sse, q.sse, 1e-9);
  q.fitted.forEach((v, t) => { if (t % 7 === 0) close(`fitted ${i}.${t}`, run.fitted[t], v, 1e-9); });
  q.mean.forEach((v, j) => close(`forecast ${i}.${j}`, pr.mean[j], v, 1e-9)); q.mult.forEach((v, j) => close(`variance multiplier ${i}.${j}`, pr.mult[j], v, 1e-10));
});

// ================================================================ identities that must hold whatever the inputs
sec('Valuation identities');
{
  const mk = (g, m) => ({ meta: { unit: 1e6 }, history: [{ year: 2025, revenue: 1000, ebitda: 1000 * m, da: 40, capex: 50, receivables: 150, inventory: 100, payables: 150, longTermDebt: 300, cash: 80, equity: 400, totalAssets: 900, totalLiabilities: 500, interestExpense: 18 }], market: { sharesOutstanding: 50, sharePrice: 30 } });
  for (const [g, r] of [[0.02, 0.09], [0.035, 0.08], [-0.01, 0.11], [0.0, 0.07]]) {
    const P = mk(g, 0.2);
    const A = (N) => ({ horizon: N, growth: Array(N).fill(g), marginBasis: 'ebitda', margin: Array(N).fill(0.2), daPct: Array(N).fill(0.04), capexPct: Array(N).fill(0.05), nwcPct: Array(N).fill(0.1), taxRate: Array(N).fill(0.25), taxLosses: 'none', terminal: { method: 'perpetuity', growth: g, multiple: 8, multipleBasis: 'ebitda' }, discount: { mode: 'direct', direct: r, ke: r + 0.02 }, midYear: false, bridge: {}, fcfe: {} });
    const d5 = V.dcf(P, A(5)), d3 = V.dcf(P, A(3)), d10 = V.dcf(P, A(10));
    // with every driver constant and growth g throughout, free cash flow grows at g from year 1, so EV = FCFF1 ÷ (r − g) for any horizon
    close(`constant growth: EV equals FCFF₁ ÷ (r − g) at g=${g}`, d5.ev, d5.rows[0].fcff / (r - g), 1e-10);
    close(`constant growth: the horizon does not matter (3 years) at g=${g}`, d3.ev, d5.ev, 1e-10); close(`constant growth: the horizon does not matter (10 years) at g=${g}`, d10.ev, d5.ev, 1e-10);
    const mid = V.dcf(P, { ...A(5), midYear: true }); close(`mid-year discounting multiplies EV by √(1 + r) at g=${g}`, mid.ev, d5.ev * Math.sqrt(1 + r), 1e-10);
    const ex = V.dcf(P, { ...A(5), terminal: { method: 'exit', growth: g, multiple: d5.impliedMultiple, multipleBasis: 'ebitda' } });
    close(`an exit multiple equal to the implied one reproduces the perpetuity EV at g=${g}`, ex.ev, d5.ev, 1e-10); close(`…and implies the same growth at g=${g}`, ex.impliedGrowth, g, 1e-9, 1e-12);
    close(`equity bridge: EV − debt + cash at g=${g}`, d5.equity, d5.ev - 300 + 80, 1e-12); close(`per share at g=${g}`, d5.perShare, d5.equity / 50, 1e-12);
    const gd = V.gordon({ d0: 2, g, ke: r }), ms = V.multiStageDdm({ d0: 2, stages: [{ years: 6, growth: g }], gT: g, ke: r });
    close(`a multi-stage dividend model with one growth rate equals Gordon at g=${g}`, ms.value, gd.value, 1e-10);
  }
  const A0 = V.defaultAssumptions(EXAMPLE), d = V.dcf(EXAMPLE, A0);
  close('WACC is the weighted average of its parts', d.cc.wacc, d.cc.we * d.cc.ke + d.cc.wd * d.cc.kdAfter, 1e-14); close('weights sum to one', d.cc.we + d.cc.wd, 1, 1e-14);
  close('CAPM: cost of equity', d.cc.ke, A0.discount.rf + A0.discount.beta * A0.discount.erp, 1e-14);
  close('EV is the sum of its present values', d.ev, d.rows.reduce((a, x) => a + x.fcff / (1 + d.r) ** x.t, 0) + d.tv / (1 + d.r) ** d.N, 1e-12);
  d.rows.forEach((x) => close(`FCFF definition, year ${x.t}`, x.fcff, x.ebit - x.tax + x.da - x.capex - x.dNwc, 1e-12));
  d.rows.forEach((x) => close(`FCFE = FCFF − after-tax interest + net borrowing, year ${x.t}`, x.fcfe, x.fcff - x.interest * (1 - x.taxRate) + x.netBorrowing, 1e-10));
  const tor = V.tornado(EXAMPLE, A0); truth('raising WACC lowers the value and raising the margin raises it', tor.rows.find((r) => r.key === 'wacc').high < tor.base && tor.rows.find((r) => r.key === 'margin').high > tor.base);
  // growth over a gap in the years is annualised over the years elapsed, not the number of statements
  const gap = { meta: { unit: 1e6 }, history: [{ year: 2020, revenue: 100, ebitda: 20 }, { year: 2023, revenue: 133.1, ebitda: 26 }, { year: 2024, revenue: 146.41, ebitda: 29 }], market: {} };
  close('default growth uses the years elapsed across a gap', V.defaultAssumptions(gap).growth[0], 0.1, 1e-9);
  close('debt is derived from short-term debt alone when that is all there is', V.derive({ currentDebt: 40 }).p.debt, 40);
}
sec('Ratio identities');
{
  const H = V.historical(EXAMPLE);
  H.forEach((x, i) => { const dp = x.ratios.dupont; close(`DuPont: margin × turnover × leverage = ROE, ${x.year}`, dp.netMargin * dp.assetTurnover * dp.equityMultiplier, x.ratios.profitability.roe, 1e-12);
    close(`cash conversion cycle = DSO + DIO − DPO, ${x.year}`, x.ratios.efficiency.cashConversionCycle, x.ratios.efficiency.dso + x.ratios.efficiency.dio - x.ratios.efficiency.dpo, 1e-12);
    close(`assets = liabilities + equity, ${x.year}`, x.p.totalAssets, x.p.totalLiabilities + x.p.equity, 1e-9, 0.11);
    if (i) close(`the three cash flows explain the change in cash, ${x.year}`, x.p.cfo + x.p.investingCF + x.p.financingCF, x.p.cash - H[i - 1].p.cash, 1e-9, 0.11); });
  close('Altman Z″ of the risk page’s example', R.altman({ currentAssets: 310, currentLiabilities: 360, totalAssets: 900, totalLiabilities: 760, retainedEarnings: 40, ebit: 18, equity: 140 }, 'zdouble').score, 6.56 * (-50 / 900) + 3.26 * (40 / 900) + 6.72 * (18 / 900) + 1.05 * (140 / 760), 1e-14);
}

console.log(Object.entries(by).map(([k, v]) => `${v.fails ? 'FAIL' : 'ok  '} ${String(v.checks - v.fails).padStart(5)}/${String(v.checks).padEnd(5)} ${k}`).join('\n'));
console.log(`${checks - fails}/${checks} audit checks passed`);
if (fails) process.exit(1);
