// f08.test.mjs — F08 Derivatives and Risk Management's case: identities with earlier courses hold, the hedges do what
// the lessons say, the no-arbitrage relations agree with the trades that enforce them, and the widgets reproduce the
// lessons' figures at their defaults.
// Run: node tests/f08.test.mjs
import * as C from '../assets/js/data/study/f08/case.js';
import * as DV from '../assets/js/core/derivatives.js';
import { widgets as WH } from '../assets/js/data/study/f08/why-firms-hedge.ex.js';
import { widgets as FF } from '../assets/js/data/study/f08/forwards-and-futures.ex.js';
import { widgets as NA } from '../assets/js/data/study/f08/pricing-by-no-arbitrage.ex.js';
import { widgets as SW } from '../assets/js/data/study/f08/swaps.ex.js';
import { widgets as OP } from '../assets/js/data/study/f08/options-payoffs.ex.js';
import { widgets as PC } from '../assets/js/data/study/f08/put-call-parity.ex.js';
import { widgets as BT } from '../assets/js/data/study/f08/binomial-pricing.ex.js';
import { widgets as BS } from '../assets/js/data/study/f08/black-scholes-and-greeks.ex.js';
import { blackScholes, impliedVol } from '../assets/js/core/fin.js';
import * as RK from '../assets/js/core/risk.js';
import { mean, sd } from '../assets/js/core/stats.js';
import { widgets as HD } from '../assets/js/data/study/f08/hedging-with-derivatives.ex.js';
import { widgets as ML } from '../assets/js/data/study/f08/margin-leverage-and-short-selling.ex.js';
import { widgets as VR } from '../assets/js/data/study/f08/value-at-risk-and-stress-tests.ex.js';

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.error(`✗ ${what}`); } };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
const D = C.DERIVED, K = C.COFFEE, E = C.EURO, W = C.SWAP;

for (const [what, holds] of C.IDENTITIES) ok(holds, `identity: ${what}`);

// ---------------------------------------------------------------- module 1, lesson 1: the coffee exposure
ok(near(C.ebitda2029(K.spotPerKg, 0), D.ebitda2029), 'unhedged EBITDA at the plan’s price is F07’s');
for (const p of [24, 30, 36, 43.2, 54, 60]) {
  ok(near(C.ebitda2029(p, 0) - C.ebitda2029(p + 1, 0), K.kgRoasted), `exposure is $2,400 a $1 at $${p}`);
  ok(near(C.ebitda2029(p, 1), D.ebitda2029 - (D.coffeeAtForward - D.coffeeCost)), `a full hedge fixes EBITDA at $${p}`);
  ok(near(C.ebitda2029(p, 0.5), (C.ebitda2029(p, 0) + C.ebitda2029(p, 1)) / 2), `a half hedge is halfway at $${p}`);
}
const wh = WH['wh-coffee'].compute({ p: 43.2, h: 0 });
ok(wh.headline.value === `$${Math.round(D.ebitda2029Up20).toLocaleString('en-US')}`, 'coffee widget at its defaults shows the lesson’s $67,413');

// ---------------------------------------------------------------- lesson 2: forwards and the margin account
ok(near(D.euroBank, 1.092) && near(D.euroBankCost, 41_496), 'Coastline’s quote: $1.0920, $41,496 for €38,000');
for (const S of [0.95, 1.03, 1.092, 1.15, 1.25]) {
  const pay = DV.forwardPayoff(S, D.euroBank) * E.amount;
  ok(near(S * E.amount - pay, D.euroBankCost, 1e-6), `the forward fixes the euro bill at spot ${S}`);
}
const M = D.margin;
ok(M.rows.length === K.settlements.length - 1, 'one margin row per settlement after the opening');
ok(near(M.cumulative, (K.settlements.at(-1) - K.settlements[0]) * K.futures.size, 1e-9), 'cumulative gain = (last − first) × size');
ok(near(M.finalBalance - M.deposits, M.cumulative, 1e-9), 'balance − deposits = cumulative gain');
ok(M.rows.every((r) => r.balance >= K.futures.maintenance - 1e-9), 'every balance after a call is at least the maintenance margin');
ok(M.rows.filter((r) => r.call > 0).length === 1 && near(M.rows[1].call, 750, 1e-9), 'one call: $750 on day 2');
const ffm = FF['ff-margin'].compute({ n: 1, side: 1, im: 2500, mm: 1800 });
ok(ffm.headline.value.startsWith('1 ($750)'), 'margin widget at its defaults shows the lesson’s single $750 call');
ok(FF['ff-margin'].compute({ n: 1, side: 1, im: 2000, mm: 2500 }).error, 'margin widget rejects maintenance above initial');
const fff = FF['ff-forward'].compute({ K: 1.092, S: 1.15 });
ok(fff.headline.value === '$2,204', 'forward widget at its defaults shows the lesson’s $2,204');

// ---------------------------------------------------------------- lesson 3: no arbitrage
// the money-market hedge fixes the same rate as the parity forward
const eurToday = E.amount / (1 + E.rEur) ** E.T, usdAtT = eurToday * E.spot * (1 + E.rUsd) ** E.T;
ok(near(usdAtT / E.amount, D.euroForward, 1e-12), 'money-market hedge = parity forward');
ok(D.euroForward > E.spot && E.rUsd > E.rEur, 'the euro trades at a forward premium because dollar rates are higher');
// cash-and-carry earns exactly (F_mkt − F_0) per kg, and nothing at F_0
const carry = (F) => F * K.futures.size - (K.futures.price + K.storagePV) * K.futures.size * (1 + E.rUsd) ** 0.5;
ok(near(carry(D.coffeeForward), 0, 1e-9) && near(carry(6.8), (6.8 - D.coffeeForward) * K.futures.size, 1e-9), 'cash-and-carry profit = (F − F₀) × size, zero at F₀');
ok(near(DV.forwardValue({ F: D.euroBank, K: D.euroBank, r: E.rUsd, T: 0.25 }), 0), 'a forward is worth nothing when F = K');
const nf = NA['na-fx'].compute({ rd: 4.5, rf: 2.5, m: 6 });
ok(nf.headline.value === `$${D.euroForward.toFixed(4)}`, 'parity widget at its defaults shows $1.0905');
const nc = NA['na-carry'].compute({ S: 6.4, U: 0.08, r: 4.5, m: 6, F: 6.8 });
ok(nc.headline.value === `$${D.coffeeForward.toFixed(4)} a kg`, 'carry widget at its defaults shows $6.6242');

// ---------------------------------------------------------------- lesson 4: swaps
ok(Math.abs(DV.swapValue({ notional: W.notional, fixed: D.swapRate, df: D.df })) < 1e-6, 'a new swap at the swap rate is worth nothing');
ok(near(D.swapRate * D.df.reduce((s, d) => s + d, 0) + D.df.at(-1), 1, 1e-12), 'the swap rate is the five-year par yield');
const k2 = DV.swapRate(D.dfLater), A2 = D.dfLater.reduce((s, d) => s + d, 0);
ok(near(D.swapValueLater, (k2 - D.swapRate) * W.notional * A2, 1e-6), 'swap value = (k_new − k) × N × annuity');
ok(D.swapValueLater > 0, 'rates rose, so the fixed payer gains');
for (const z of [0.03, 0.045, 0.06]) {
  const flat = DV.discountFactors([z, z, z, z, z]);
  ok(near(DV.swapRate(flat), z, 1e-12), `a flat ${z * 100}% curve gives a ${z * 100}% swap rate`);
}
ok(D.swapRate < W.zeros.at(-1), 'a rising curve puts the swap rate below the five-year zero rate');
const sr = SW['sw-rate'].compute({ z1: 4, z2: 4.2, z3: 4.3, z4: 4.4, z5: 4.5 });
ok(sr.headline.value === `${(D.swapRate * 100).toFixed(4)}%`, 'swap-rate widget at its defaults shows 4.4815%');
const sv = SW['sw-value'].compute({ bp: 0 });
ok(sv.headline.value === `$${(D.swapValueLater / 1e6).toFixed(2)} million`, 'swap-value widget at its defaults shows $4.30 million');

// ---------------------------------------------------------------- module 2: options
const O = C.OPT, Q = C.QUOTES;
for (const Kx of O.strikes) {
  ok(near(Q[Kx].call, Math.round(C.bs(Kx, 'call').price * 100) / 100, 1e-12) && near(Q[Kx].put, Math.round(C.bs(Kx, 'put').price * 100) / 100, 1e-12), `quotes at $${Kx} are Black–Scholes at 30%, to the cent`);
  ok(Math.abs(DV.parityGap({ C: C.bs(Kx, 'call').price, P: C.bs(Kx, 'put').price, S: O.S, K: Kx, r: O.r, T: O.T })) < 1e-10, `unrounded prices obey parity at $${Kx}`);
  ok(near(impliedVol({ S: O.S, K: Kx, T: O.T, r: O.r, type: 'call' }, C.bs(Kx, 'call').price), O.sigma, 1e-7), `implied volatility recovers 30% at $${Kx}`);
}
ok(O.strikes.every((Kx, i) => i === 0 || (Q[Kx].call < Q[O.strikes[i - 1]].call && Q[Kx].put > Q[O.strikes[i - 1]].put)), 'calls fall and puts rise with the strike');
// the cap is a call: cost = price − call payoff + fee
for (const P of [24, 30, 36.3, 40, 43.2, 60]) ok(near(C.capPerKg(P), P - DV.optionPayoff(P, C.CAP.strike) + C.CAP.fee), `cap = price − call payoff + fee at $${P}`);
ok(near(C.capPerKg(36.3), K.forwardPerKg), 'cap and fixed price cost the same at $36.30');
// one-step replication with the six-month rate
const rh = 1.045 ** 0.5 - 1, c1 = DV.oneStep({ S: O.S, u: 1.2, d: 0.85, K: 42, r: rh }), p1 = DV.oneStep({ S: O.S, u: 1.2, d: 0.85, K: 42, r: rh, type: 'put' });
ok(near(c1.price - p1.price, O.S - 42 / (1 + rh), 1e-12), 'one-step call and put obey parity exactly');
// two-step tree by hand equals the engine
const tAm = DV.binomial({ S: O.S, K: 42, T: O.T, r: O.r, sigma: O.sigma, steps: 2, type: 'put', american: true }).price;
ok(near(tAm, 2.897080794, 1e-8), 'two-step American put = $2.90 (exercise at the down node)');
ok(Math.abs(DV.binomial({ S: O.S, K: 42, T: O.T, r: O.r, sigma: O.sigma, steps: 500, type: 'call' }).price - C.bs(42).price) < 0.01, '500-step tree within a cent of Black–Scholes');
// Greeks against finite differences
const h = 1e-4, g0 = C.bs(42);
ok(near(g0.delta, (C.bs(42, 'call', { S: 42 + h }).price - C.bs(42, 'call', { S: 42 - h }).price) / (2 * h), 1e-6), 'delta = dC/dS');
ok(near(g0.gamma, (C.bs(42, 'call', { S: 42 + h }).delta - C.bs(42, 'call', { S: 42 - h }).delta) / (2 * h), 1e-5), 'gamma = dΔ/dS');
ok(near(g0.vega, (C.bs(42, 'call', { sigma: 0.3 + h }).price - C.bs(42, 'call', { sigma: 0.3 - h }).price) / (2 * h), 1e-4), 'vega = dC/dσ');
ok(near(g0.theta, -(C.bs(42, 'call', { T: 0.5 + h }).price - C.bs(42, 'call', { T: 0.5 - h }).price) / (2 * h), 1e-4), 'theta = −dC/dT');
ok(near(g0.rho, (C.bs(42, 'call', { r: O.r + h }).price - C.bs(42, 'call', { r: O.r - h }).price) / (2 * h), 1e-4), 'rho = dC/dr');
// widgets at their defaults
ok(OP['op-builder'].compute({ call: 1, side: 1, K: 42, S: 50 }).headline.value === '$4.01', 'option builder at its defaults: profit $4.01');
ok(OP['op-cap'].compute({ p: 43.2 }).headline.value === '$98,880', 'cap widget at its defaults: $98,880');
const pcw = PC['pc-check'].compute({ K: 42, c: Q[42].call, p: 2.6 });
ok(pcw.headline.value === '$0.4757' && pcw.rows[2][1].startsWith('Conversion'), 'parity widget at its defaults: $0.4757, a conversion');
ok(PC['pc-check'].compute({ K: 42, c: Q[42].call, p: Q[42].put }).rows[2][1].startsWith('None'), 'parity widget: the exchange quotes need no trade');
ok(BT['bt-one'].compute({ u: 1.2, d: 0.85, K: 42, call: 1 }).headline.value === '$4.0441', 'one-step widget at its defaults: $4.0441');
ok(BT['bt-one'].compute({ u: 1.2, d: 1.0, K: 42, call: 1 }).headline.value !== '—' && BT['bt-one'].compute({ u: 1.01, d: 0.85, K: 42, call: 1 }).error, 'one-step widget rejects u below the risk-free growth');
ok(BT['bt-steps'].compute({ n: 2 }).headline.value === '$3.5837', 'tree widget at two steps: $3.5837');
ok(BS['bs-explorer'].compute({ S: 42, K: 42, sig: 30, m: 6 }).headline.value === `$${Q[42].call.toFixed(2)} / $${Q[42].put.toFixed(2)}`, 'Black–Scholes widget at its defaults shows the quotes');
ok(BS['bs-iv'].compute({ c: 4.5 }).headline.value === `${(impliedVol({ S: O.S, K: 42, T: O.T, r: O.r, type: 'call' }, 4.5) * 100).toFixed(2)}%`, 'implied volatility widget at its defaults');
ok(BS['bs-iv'].compute({ c: 0.5 }).error, 'implied volatility widget rejects a price below the arbitrage bound');

// ---------------------------------------------------------------- module 3: hedging, margin and VaR
// the minimum-variance hedge ratio minimises the residual variance (check on a grid)
const resid = (hr) => K.sdRoasted ** 2 + hr ** 2 * K.sdFutures ** 2 - 2 * hr * K.rho * K.sdRoasted * K.sdFutures;
ok(Array.from({ length: 201 }, (_, i) => i / 100).every((hr) => resid(hr) >= resid(D.hedge.h) - 1e-15), 'h* minimises the hedged variance');
ok(near(resid(D.hedge.h), K.sdRoasted ** 2 * (1 - K.rho ** 2), 1e-15), 'variance left = σ_S²(1 − ρ²)');
ok(near(D.brightcupContracts, 106.25, 1e-9), 'Brightcup needs 106.25 contracts');
const Bq = C.BASIS;
ok(near(Bq.spot1 + (Bq.fut0 - Bq.fut1), Bq.fut0 + (Bq.spot1 - Bq.fut1), 1e-12), 'effective price = F₀ + closing basis');
ok(near(C.BOOK_VALUE, 500_000) && near(C.BOOK_BETA, 0.7431, 5e-5), 'Hollis’s book: $500,000, beta 0.7431');
// the book's returns are the weighted sum of F06's series
const F6 = await import('../assets/js/data/study/f06/case.js');
ok(C.BOOK_RETURNS.every((x, i) => near(x * 5e5, 42_000 * F6.SERIES.brightcup[i] + 308_000 * F6.SERIES.market[i] + 150_000 * F6.SERIES.bonds[i], 1e-6)), 'book returns rebuild from F06 holdings');
// historical VaR from a direct sort (NumPy's linear interpolation)
const srt = [...C.BOOK_RETURNS].sort((a, b) => a - b), pos = (srt.length - 1) * 0.05, lo = Math.floor(pos);
ok(near(-(srt[lo] + (pos - lo) * (srt[lo + 1] - srt[lo])), C.VAR.hist95.var, 1e-12), 'historical 95% VaR = the 5% quantile of the sorted returns');
ok(near(C.VAR.norm95.var, -(mean(C.BOOK_RETURNS) - 1.6448536269514722 * sd(C.BOOK_RETURNS)), 1e-9), 'normal VaR = −(μ − 1.645σ)');
ok(C.VAR.hist95.es >= C.VAR.hist95.var && C.VAR.hist99.es >= C.VAR.hist99.var && C.VAR.hist99.var > C.VAR.hist95.var, 'ES ≥ VaR, and 99% > 95%');
ok(C.VAR.backtest.n === 120 && C.VAR.backtest.exceptions === 6, 'backtest: 6 exceptions in 120 months');
ok(RK.christoffersen(C.VAR.backtest.hit, 0.05).pInd < 0.05, 'the exceptions cluster (Christoffersen p < 0.05)');
// margin arithmetic
const MRr = C.MARGIN_RULES, Ln = 21_000;
ok(near((1000 * 28 - Ln) / (1000 * 28), MRr.maintenance, 1e-12), 'margin at the $28 call price is exactly 25%');
ok(near((63_000 - 1000 * (63_000 / 1300)) / (1000 * (63_000 / 1300)), MRr.shortMaintenance, 1e-12), 'short margin at the call price is exactly 30%');
// widgets at their defaults
ok(HD['hd-ratio'].compute({ rho: 0.85, sS: 6, sF: 9 }).headline.value.startsWith('106 '), 'hedge-ratio widget at its defaults: 106 contracts');
ok(HD['hd-index'].compute({ n: 1, mkt: -10 }).headline.value === '0.2431', 'index-hedge widget at its defaults: beta 0.2431');
ok(ML['ml-margin'].compute({ im: 50, i: 8, P: 46.2 }).headline.value === '12.0%', 'margin widget at its defaults: 12.0%');
ok(ML['ml-short'].compute({ P: 36, m: 6, fee: 1 }).headline.value === '$5,790', 'short-sale widget at its defaults: $5,790');
ok(VR['vr-explorer'].compute({ c: 95, hist: 1, h: 1 }).headline.value === '$24,631', 'VaR widget at its defaults: $24,631');
ok(VR['vr-stress'].compute({ b: -40, m: -20, d: 2, puts: 1, fut: 1 }).headline.value === '−$10,600', 'stress widget at its defaults: −$10,600');

// ---------------------------------------------------------------- project and assessments
const PJ = (await import('../assets/js/data/study/f08/project.js')).default;
for (const [what, got, want, tol] of PJ.verify()) ok(Math.abs(got - want) <= tol, `project: ${what} (${got} vs ${want})`);
for (const f of ['assess-m1', 'assess-m2', 'assess-m3', 'assess-diagnostic', 'assess-final']) {
  const A = await import(`../assets/js/data/study/f08/${f}.js`);
  for (const it of A.items) for (const x of it.type === 'steps' ? it.steps : [it]) if (x.check) ok(Math.abs(x.check() - x.answer) <= (x.tol ?? 0.005), `${f} ${x.id}: answer agrees with check`);
}

console.log(fail ? `${fail} failed, ${pass} passed` : `${pass}/${pass} F08 checks passed`);
process.exit(fail ? 1 : 0);
