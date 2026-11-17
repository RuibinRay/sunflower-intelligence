// derivatives.test.mjs — core/derivatives.js against an independent NumPy/SciPy implementation
// (tests/make_fixtures_derivatives.py) and against identities that must hold.
// Run: node tests/derivatives.test.mjs
import { readFileSync } from 'node:fs';
import * as DV from '../assets/js/core/derivatives.js';
import { blackScholes } from '../assets/js/core/fin.js';

const X = JSON.parse(readFileSync(new URL('./fixtures-derivatives.json', import.meta.url)));
let pass = 0, fail = 0;
const ok = (c, w) => { if (c) pass++; else { fail++; console.error(`✗ ${w}`); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

for (const f of X.forwards) {
  ok(near(DV.forwardPrice({ S: f.S, r: f.r, T: f.T, income: f.income, storage: f.storage }), f.F), `forward price S=${f.S}`);
  ok(near(DV.forwardPrice({ S: f.S, r: f.r, T: f.T, income: f.income, storage: f.storage, continuous: true }), f.Fc), `forward price (continuous) S=${f.S}`);
}
for (const f of X.fx) ok(near(DV.fxForward({ spot: f.spot, rDomestic: f.rd, rForeign: f.rf, T: f.T }), f.F), `FX forward spot=${f.spot}`);
for (const f of X.forwardValue) ok(near(DV.forwardValue({ F: f.F, K: f.K, r: f.r, T: f.T }), f.v), `forward value F=${f.F} K=${f.K}`);
ok(DV.forwardValue({ F: 100, K: 100, r: 0.05, T: 1 }) === 0, 'a forward is worth nothing at inception (F = K)');

for (const m of X.margin) {
  const a = DV.marginAccount(m);
  m.rows.forEach((row, i) => {
    ok(near(a.rows[i].gain, row.gain, 1e-9) && near(a.rows[i].call, row.call, 1e-9) && near(a.rows[i].balance, row.balance, 1e-9), `margin day ${i + 1} (${m.long ? 'long' : 'short'})`);
  });
  ok(near(a.finalBalance - a.deposits, a.cumulative, 1e-9), 'margin: final balance − deposits = cumulative gain');
}

for (const s of X.swaps) {
  const df = DV.discountFactors(s.zeros);
  df.forEach((d, i) => ok(near(d, s.df[i]), `discount factor ${i + 1}`));
  ok(near(DV.swapRate(df), s.rate), `swap rate ${s.zeros.length} years`);
  ok(near(DV.swapValue({ notional: s.notional, fixed: s.fixed, df }), s.valuePayer, 1e-9), `payer swap value notional ${s.notional}`);
  ok(Math.abs(DV.swapValue({ notional: s.notional, fixed: DV.swapRate(df), df })) < 1e-6 * s.notional, 'a swap at the swap rate is worth nothing');
  ok(near(DV.swapValue({ notional: s.notional, fixed: s.fixed, df, payFixed: false }), -s.valuePayer, 1e-9), 'receiver = − payer');
}

const H = X.hedge;
ok(near(DV.hedgeRatio({ rho: H.rho, sdSpot: H.sdS, sdFutures: H.sdF }).h, H.slope, 1e-9), 'minimum-variance hedge ratio = OLS slope of ΔS on ΔF');
ok(near(DV.hedgeRatio({ rho: H.rho, sdSpot: H.sdS, sdFutures: H.sdF }).effectiveness, H.rho ** 2), 'hedge effectiveness = ρ²');

for (const b of X.binomial) {
  const got = DV.binomial({ S: b.S, K: b.K, T: b.T, r: b.r, sigma: b.sigma, steps: b.steps, type: b.type, american: b.american });
  ok(near(got.price, b.price, 1e-9), `binomial ${b.type} ${b.american ? 'American' : 'European'} ${b.steps} steps`);
  const bsJs = blackScholes({ S: b.S, K: b.K, T: b.T, r: b.r, sigma: b.sigma, type: b.type }).price;
  ok(near(bsJs, b.bs, 1e-7), `Black–Scholes ${b.type} S=${b.S} K=${b.K} (core/fin.js vs SciPy)`);
  if (!b.american && b.steps >= 200) ok(Math.abs(got.price - b.bs) < 0.02, `binomial converges to Black–Scholes (${got.price.toFixed(4)} vs ${b.bs.toFixed(4)})`);
}
// parity and American premium
for (const [S, K, T, r, s] of [[100, 100, 1, 0.04, 0.2], [36, 38, 0.75, 0.045, 0.35]]) {
  const C = blackScholes({ S, K, T, r, sigma: s, type: 'call' }).price, P = blackScholes({ S, K, T, r, sigma: s, type: 'put' }).price;
  ok(Math.abs(DV.parityGap({ C, P, S, K, r, T })) < 1e-9, `put–call parity holds for Black–Scholes S=${S}`);
  const Ce = DV.binomial({ S, K, T, r, sigma: s, steps: 300, type: 'call' }).price, Pe = DV.binomial({ S, K, T, r, sigma: s, steps: 300, type: 'put' }).price;
  ok(Math.abs(DV.parityGap({ C: Ce, P: Pe, S, K, r, T })) < 1e-9, `put–call parity holds exactly in the binomial tree S=${S}`);
  ok(DV.binomial({ S, K, T, r, sigma: s, steps: 300, type: 'put', american: true }).price >= Pe - 1e-12, 'an American put is worth at least the European');
  ok(Math.abs(DV.binomial({ S, K, T, r, sigma: s, steps: 300, type: 'call', american: true }).price - Ce) < 1e-9, 'an American call on a non-dividend stock equals the European');
}
const o = DV.oneStep({ S: 40, u: 1.2, d: 0.9, K: 42, r: 0.05 });
ok(near(o.price, o.riskNeutral, 1e-12), 'one-step replication price = risk-neutral price');
ok(near(o.delta * o.Su + o.bond * 1.05, o.Cu, 1e-12) && near(o.delta * o.Sd + o.bond * 1.05, o.Cd, 1e-12), 'the replicating portfolio matches the option in both states');
ok(DV.optionProfit(45, 40, { type: 'call', premium: 3 }) === 2 && DV.optionProfit(45, 40, { type: 'call', premium: 3, long: false }) === -2, 'option profit = payoff − premium (and its mirror)');

console.log(fail ? `${fail} failed, ${pass} passed` : `${pass}/${pass} derivatives checks passed`);
process.exit(fail ? 1 : 0);
