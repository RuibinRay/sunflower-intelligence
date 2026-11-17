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

console.log(fail ? `${fail} failed, ${pass} passed` : `${pass}/${pass} F08 checks passed`);
process.exit(fail ? 1 : 0);
