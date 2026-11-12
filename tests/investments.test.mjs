// Run: node tests/investments.test.mjs   (assets/js/core/investments.js against NumPy, statsmodels and numpy-financial
// fixtures from tests/make_fixtures_investments.py, hand-worked cases and identities)
import { readFileSync } from 'node:fs';
import * as I from '../assets/js/core/investments.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-investments.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => { checks++; if (!(typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)))) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); } };
const ok = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };
const { r, m, rf } = fx.series;

// returns
close('hpr', I.hpr(40, 44, 1.2), 0.13);
close('geometric vs numpy', I.geometric(r), fx.geometric, 1e-12);
ok('geometric ≤ arithmetic', I.geometric(r) <= I.arithmetic(r));
close('wealth end = product', I.wealth([0.1, -0.1])[2], 0.99);
close('real return (Fisher)', I.realReturn(0.08, 0.03), 1.08 / 1.03 - 1);
close('annualised sd', I.annualise.sd(0.04), 0.04 * Math.sqrt(12));
{ const y = I.yearly(['2020-01', '2020-02', '2021-01'], [0.1, 0.1, -0.05]); close('yearly compounding', y[0].ret, 0.21); close('yearly second', y[1].ret, -0.05); }
{ const d = I.maxDrawdown([0.1, -0.2, -0.1, 0.5]); close('max drawdown', d.drawdown, 0.8 * 0.9 - 1); ok('drawdown peak and trough', d.peak === 1 && d.trough === 3); }

// scenarios
{ const s = I.scenarios([{ p: 0.25, r: -0.1 }, { p: 0.5, r: 0.08 }, { p: 0.25, r: 0.25 }]);
  close('scenario mean', s.er, 0.0775); close('scenario variance', s.variance, 0.25 * (-0.1775) ** 2 + 0.5 * 0.0025 ** 2 + 0.25 * 0.1725 ** 2); }
{ const c = I.scenarioCov([{ p: 0.5, a: 0.2, b: -0.1 }, { p: 0.5, a: -0.1, b: 0.2 }]); close('perfect negative correlation', c.corr, -1); }
{ const c = I.sampleCov(r, m); close('sample covariance', c.cov, fx.cov, 1e-12); close('sample correlation', c.corr, fx.corr, 1e-12); }

// portfolios
{ const p = I.twoAsset({ w: 0.6, ra: 0.1, rb: 0.04, sa: 0.18, sb: 0.06, corr: 0.2 });
  close('two-asset mean', p.er, 0.076); close('two-asset sd', p.sd, Math.sqrt(0.36 * 0.0324 + 0.16 * 0.0036 + 2 * 0.24 * 0.2 * 0.18 * 0.06)); }
{ const w = I.twoAssetMinVarWeight({ sa: 0.2, sb: 0.1, corr: 0 }); close('min-var weight, uncorrelated', w, 0.01 / 0.05);
  const at = (x) => I.twoAsset({ w: x, ra: 0, rb: 0, sa: 0.2, sb: 0.1, corr: 0 }).sd; ok('min-var weight minimises', at(w) < at(w + 1e-3) && at(w) < at(w - 1e-3)); }
close('perfectly correlated: sd is the weighted average', I.twoAsset({ w: 0.3, ra: 0, rb: 0, sa: 0.2, sb: 0.1, corr: 1 }).sd, 0.13);
close('equal-weight sd limit', I.equalWeightSd(1e9, 0.16, 0.04), 0.2, 1e-6);
close('equal-weight n=1', I.equalWeightSd(1, 0.16, 0.04), 0.4);
{ const c = I.cal({ y: 0.5, rf: 0.04, er: 0.1, sd: 0.18 }); close('CAL mean', c.er, 0.07); close('CAL sd', c.sd, 0.09); close('CAL keeps Sharpe', I.sharpe(c.er, 0.04, c.sd), I.sharpe(0.1, 0.04, 0.18)); }
close('optimal risky share', I.optimalRiskyShare({ rf: 0.04, er: 0.1, sd: 0.2, A: 3 }), 0.06 / 0.12);
{ // maximum-Sharpe portfolio of two assets matches the tangency formula
  const mu = [0.1, 0.05], cov = [[0.04, 0.002], [0.002, 0.0064]], rf0 = 0.02;
  const w = I.maxSharpe(mu, cov, rf0), ea = 0.08, eb = 0.03;
  const wa = (ea * 0.0064 - eb * 0.002) / (ea * 0.0064 + eb * 0.04 - (ea + eb) * 0.002);
  close('tangency weight', w[0], wa, 1e-9);
}

// performance and CAPM
close('treynor', I.treynor(0.1, 0.03, 1.4), 0.05);
close('jensen alpha', I.jensenAlpha(0.12, 0.03, 1.2, 0.1), 0.12 - (0.03 + 1.2 * 0.07));
close('capm', I.capm({ rf: 0.04, beta: 1.2, mrp: 0.05 }), 0.1);
{ const b = I.regressBeta(r, m, rf);
  close('beta vs statsmodels', b.beta, fx.beta.beta, 1e-10); close('alpha vs statsmodels', b.alpha, fx.beta.alpha, 1e-10);
  close('R² vs statsmodels', b.r2, fx.beta.r2, 1e-10); close('SE of beta', b.seBeta, fx.beta.seBeta, 1e-10); close('SE of alpha', b.seAlpha, fx.beta.seAlpha, 1e-10);
  const ex = (a) => a.map((v, i) => v - rf[i]); const c = I.sampleCov(ex(r), ex(m));
  close('beta = cov/var', I.betaCov(c.cov, I.sampleCov(ex(m), ex(m)).cov), b.beta, 1e-10); }
close('tracking error', I.trackingError(r, m), fx.te, 1e-12);

// bonds
fx.bonds.forEach((b, j) => {
  const d = I.duration({ couponRate: b.c, years: b.n, freq: b.f, ytm: b.y });
  close(`bond ${j} price`, d.price, b.price, 1e-10); close(`bond ${j} price vs npf`, d.price, b.pv_check, 1e-10);
  close(`bond ${j} Macaulay`, d.macaulay, b.mac, 1e-10); close(`bond ${j} modified`, d.modified, b.mod, 1e-10);
  close(`bond ${j} convexity`, d.convexity, b.conv, 2e-4);
});
close('zero-coupon Macaulay = maturity', I.duration({ couponRate: 0, years: 5, ytm: 0.05 }).macaulay, 5);
{ const d = I.duration({ couponRate: 0.05, years: 10, ytm: 0.06 }); const exact = I.duration({ couponRate: 0.05, years: 10, ytm: 0.07 }).price / d.price - 1;
  ok('convexity improves the estimate', Math.abs(I.priceChangeApprox(d, 0.01) - exact) < Math.abs(-d.modified * 0.01 - exact)); }

// fees
{ const f = I.feeDrag({ amount: 10000, years: 30, r: 0.07, fee: 0.01 });
  close('fee drag gross', f.gross, 10000 * 1.07 ** 30, 1e-9); close('fee drag net', f.net, 10000 * (1.07 * 0.99) ** 30, 1e-9); }

// valuation
{ const d = I.dcf({ fcf: [100, 110, 120, 128, 135], rate: 0.09, g: 0.025 });
  close('dcf value', d.value, fx.dcf.value, 1e-10); close('dcf tv', d.tv, fx.dcf.tv, 1e-10); close('dcf vs npf', d.value, fx.dcf.npv_check, 1e-10);
  const e = I.dcf({ fcf: [100, 110, 120, 128, 135], rate: 0.09, exitMultiple: d.tv / 135, exitMetric: 135 }); close('exit multiple equal to Gordon TV', e.value, d.value, 1e-12); close('implied growth', e.impliedGrowth, 0.025, 1e-12); }
{ const e = I.evToEquity({ ev: 1000, debt: 300, cash: 50, shares: 25 }); close('EV bridge', e.perShare, 30); }
{ const x = I.multiples({ price: 20, shares: 10, netIncome: 16, ebitda: 40, ebit: 30, revenue: 400, bookEquity: 100, debt: 60, cash: 10, growth: 0.1, dps: 0.5 });
  close('P/E', x.pe, 12.5); close('EV/EBITDA', x.evEbitda, 250 / 40); close('P/B', x.pb, 2); close('PEG', x.peg, 1.25); close('yield', x.dividendYield, 0.025); }
close('implied value from EV multiple', I.impliedValue({ multiple: 8, metric: 50, basis: 'ev', debt: 100, cash: 20, shares: 10 }).perShare, 32);
close('PVGO', I.pvgo(50, 3, 0.1), 20);
close('gordon via valuation.js', I.gordon({ d1: 2, g: 0.04, ke: 0.09 }).value, 40);

console.log(`${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
