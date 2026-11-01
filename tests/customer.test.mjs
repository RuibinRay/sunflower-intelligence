// Run: node tests/customer.test.mjs   (compares assets/js/core/customer.js with pandas, statsmodels and SciPy fixtures,
// and the sBG fit and DERL with Fader & Hardie's published figures)
import { readFileSync } from 'node:fs';
import * as C from '../assets/js/core/customer.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-customer.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-8) => {
  checks++;
  const ok = typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const same = (label, got, want) => { checks++; if (JSON.stringify(got) !== JSON.stringify(want)) { fails++; console.log(`FAIL ${label}: got ${JSON.stringify(got).slice(0, 200)}, want ${JSON.stringify(want).slice(0, 200)}`); } };
const all = (label, got, want, tol) => { same(`${label} length`, got.length, want.length); want.forEach((w, i) => close(`${label}[${i}]`, got[i], w, tol)); };

// ---- dates
same('dayNum epoch', C.dayNum('1970-01-02'), 1);
same('isoDay round trip', C.isoDay(C.dayNum('2027-10-31')), '2027-10-31');
same('leap day', C.dayNum('2028-03-01') - C.dayNum('2028-02-28'), 2);
same('monthOf', C.monthOf(C.dayNum('2027-03-15')), 2027 * 12 + 2);

// ---- summaries
{
  const s = fx.summary, tx = s.tx.id.map((id, i) => ({ id, day: s.tx.day[i], amount: s.tx.amount[i] }));
  const got = new Map(C.summarise(tx, { asOf: s.asOf }).map((c) => [c.id, c]));
  same('summary customers', got.size, s.rows.length);
  for (const r of s.rows) {
    const c = got.get(r.id);
    for (const k of ['first', 'last', 'frequency', 'recency', 'tenure']) same(`summary ${r.id} ${k}`, c[k], r[k]);
    close(`summary ${r.id} monetary`, c.monetary, r.monetary, 1e-9);
  }
  const m = C.baseMetrics([...got.values()]);
  close('aov = spend ÷ orders', m.aov, m.spend / m.orders);
}

// ---- scores
fx.scores.forEach((c, j) => {
  same(`scores ${j} quantile`, C.score(c.x, { k: c.k }), c.quantile);
  all(`scores ${j} cuts`, C.cutPoints(c.x, c.k), c.cuts, 1e-12);
  same(`scores ${j} ntile`, C.score(c.x, { k: c.k, method: 'ntile' }), c.ntile);
  same(`scores ${j} rank`, C.score(c.x, { k: c.k, method: 'rank' }), c.rank);
  same(`scores ${j} reversed`, C.score(c.x, { k: c.k, higherIsBetter: false }), c.quantile.map((v) => c.k + 1 - v));
});
same('cuts method', C.score([1, 2, 3, 10], { method: 'cuts', cuts: [2, 5] }), [1, 1, 2, 3]);
same('segment grid', [C.segmentOf(5, 5), C.segmentOf(1, 5), C.segmentOf(1, 1), C.segmentOf(5, 1)], ['Champions', 'Can’t lose them', 'Lost', 'New customers']);
{
  const cs = [{ recency: 1, frequency: 9, monetary: 90 }, { recency: 50, frequency: 1, monetary: 5 }, { recency: 10, frequency: 3, monetary: 30 }, { recency: 30, frequency: 2, monetary: 12 }, { recency: 5, frequency: 4, monetary: 40 }];
  const r = C.rfm(cs);
  same('rfm cells', r.map((c) => c.cell), ['555', '111', '333', '222', '444']);
  same('rfm FM rounding half up', C.rfm([{ recency: 0, frequency: 2, monetary: 1 }, { recency: 1, frequency: 1, monetary: 2 }], { k: 2, method: 'ntile' }).map((c) => c.FM), [2, 2]);
}

// ---- cohorts (hand case)
{
  const d = C.dayNum;
  const joins = { a: d('2027-03-02'), b: d('2027-03-20'), c: d('2027-04-01') };
  const tx = [['a', '2027-03-02', 5], ['a', '2027-05-09', 4], ['b', '2027-03-20', 3], ['b', '2027-04-02', 2], ['b', '2027-04-30', 2], ['c', '2027-04-01', 6], ['c', '2027-05-01', 1], ['z', '2027-04-01', 9]]
    .map(([id, day, amount]) => ({ id, day: d(day), amount }));
  const t = C.cohortTable(joins, tx);
  same('cohort labels', t.cohorts.map((c) => `${c.label}:${c.size}`), ['2027-03:2', '2027-04:1']);
  same('cohort active', t.active, [[2, 1, 1], [1, 1]]);
  same('cohort revenue', t.revenue, [[8, 4, 4], [6, 1]]);
  same('cohort pooled', t.pooled.map((p) => [p.active, p.size]), [[3, 3], [2, 3], [1, 2]]);
}

// ---- retention arithmetic
{
  const p = C.periodRetention({ start: 120, end: 168, acquired: 100 });
  same('period retention kept', p.kept, 68); close('period retention', p.retention, 68 / 120);
  close('compound churn', C.compoundChurn(0.03, 12), 1 - 0.97 ** 12);
  close('expected lifetime', C.expectedLifetime(0.8), 5);
}

// ---- Kaplan–Meier and log-rank
fx.km.forEach((c, j) => {
  const k = C.kaplanMeier(c.time, c.event);
  all(`km ${j} t`, k.steps.map((s) => s.t), c.t);
  all(`km ${j} S`, k.steps.map((s) => s.S), c.S, 1e-10);
  all(`km ${j} se`, k.steps.map((s) => s.se), c.se, 1e-8);
  all(`km ${j} at risk`, k.steps.map((s) => s.atRisk), c.atRisk);
  all(`km ${j} events`, k.steps.map((s) => s.events), c.events);
  same(`km ${j} median`, k.median, c.median);
  k.steps.forEach((s, i) => { if (Number.isFinite(s.low)) { checks++; if (!(s.low < s.S && s.S < s.high && s.low > 0 && s.high < 1)) { fails++; console.log(`FAIL km ${j} CI ${i}`); } } });
  if (c.chi2 !== undefined) { const lr = C.logRank(c.time, c.event, c.group); close(`logrank ${j} chi2`, lr.chi2, c.chi2, 1e-8); close(`logrank ${j} p`, lr.p, c.p, 1e-7); }
});
{ // the log–log interval by hand at one step: S = 0.8 after 1 event in 5 (Greenwood sum 1/20)
  const k = C.kaplanMeier([1, 2, 3, 4, 5], [1, 0, 0, 0, 0]), s = k.steps[0], v = Math.sqrt(1 / 20) / Math.log(0.8);
  close('km log-log low', s.low, 0.8 ** Math.exp(-1.959963984540054 * v), 1e-10);
  close('km log-log high', s.high, 0.8 ** Math.exp(1.959963984540054 * v), 1e-10);
}

// ---- lapse-defined lifetimes (hand case, L = 30, data end day 100)
{
  const lp = { joins: { a: 0, b: 10, c: 50, d: 90, e: 5 }, visits: { a: [0, 20, 40], b: [10], c: [50, 60, 95], d: [90], e: [5, 50, 60] }, end: 100 };
  const t = C.lapseTimes(lp, 30);
  same('lapse ids', t.ids, ['a', 'b', 'c', 'd', 'e']);
  same('lapse times', t.times, [40, 0, 10, 0, 0]);       // a lapsed after day 40; b never returned; c's 35-day gap after day 60 (it came back: counts as lapsed); d censored at its join; e's 45-day gap after joining
  same('lapse events', t.events, [1, 1, 1, 0, 1]);
  same('lapse: a recent last visit is censored there', C.lapseTimes({ joins: { c: 50 }, visits: { c: [50, 60, 85] }, end: 100 }, 30), { times: [35], events: [0], ids: ['c'] });
}

// ---- sBG against SciPy
fx.sbg.forEach((c, j) => {
  const f = C.sbgFit(c.cohorts.map((alive) => ({ alive })));
  close(`sbg ${j} alpha`, f.alpha, c.alpha, 1e-5); close(`sbg ${j} beta`, f.beta, c.beta, 1e-5); close(`sbg ${j} ll`, f.logLik, c.ll, 1e-9);
  close(`sbg ${j} se alpha`, f.seAlpha, c.seAlpha, 1e-3); close(`sbg ${j} se beta`, f.seBeta, c.seBeta, 1e-3);
  all(`sbg ${j} S`, Array.from({ length: 24 }, (_, t) => C.sbgS(c.alpha, c.beta, t + 1)), c.S, 1e-10);
  all(`sbg ${j} r`, Array.from({ length: 24 }, (_, t) => C.sbgRetention(c.alpha, c.beta, t + 1)), c.r, 1e-10);
});
{ // P(T = t) sums with S to 1, and the forward recursion of Fader & Hardie (2007, eq. 7)
  const a = 0.704, b = 1.182; let cum = 0;
  for (let t = 1; t <= 30; t++) { cum += C.sbgP(a, b, t); close(`sbg 1 − S(${t})`, 1 - C.sbgS(a, b, t), cum, 1e-12); }
  close('sbg P(1)', C.sbgP(a, b, 1), a / (a + b), 1e-12);
  close('sbg recursion', C.sbgP(a, b, 5), (b + 3) / (a + b + 4) * C.sbgP(a, b, 4), 1e-12);
}

// ---- Fader & Hardie (2007), Journal of Interactive Marketing 21(1), 76–90, Table 1: % surviving, years 0–12.
// The paper fits years 0–7 (1,000 customers each) and reports Regular α = 0.704, β = 1.182; High End β = 3.806, with
// α given as 0.688 in the text and 0.668 in the appendix; the fit below says which is right.
{
  const REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1], HIGH = [100, 86.9, 74.3, 65.3, 59.3, 55.1, 51.7, 49.1];
  const reg = C.sbgFit([{ alive: REG.map((p) => Math.round(p * 10)) }]), high = C.sbgFit([{ alive: HIGH.map((p) => Math.round(p * 10)) }]);
  close('F&H Regular alpha (3 dp)', Math.round(reg.alpha * 1000) / 1000, 0.704, 1e-12); close('F&H Regular beta (3 dp)', Math.round(reg.beta * 1000) / 1000, 1.182, 1e-12);
  close('F&H High End alpha (3 dp)', Math.round(high.alpha * 1000) / 1000, 0.668, 1e-12); close('F&H High End beta (3 dp)', Math.round(high.beta * 1000) / 1000, 3.806, 1e-12);
  // the model's year-12 projection lies near the held-out data (paper Figure 3): within 2 points
  close('F&H Regular S(12) near 17.3%', Math.abs(reg.S(12) * 100 - 17.3) < 2 ? 1 : 0, 1);
  close('F&H High End S(12) near 39.4%', Math.abs(high.S(12) * 100 - 39.4) < 2 ? 1 : 0, 1);
}

// ---- DERL: series (eq. 9) against the closed form with SciPy's hyp2f1 (eq. 6), and Fader & Hardie (2010) example
fx.derl.forEach((c, j) => {
  close(`derl ${j} series`, C.sbgDERL(c.a, c.b, c.d, c.n), c.value, 1e-9);
  close(`derl ${j} own hyp2f1`, (c.b + c.n - 1) / (c.a + c.b + c.n - 1) * C.hyp2f1(1, c.b + c.n, c.a + c.b + c.n, 1 / (1 + c.d)), c.value, 1e-9);
});
close('F&H 2010 example DERL ≈ 3.59 (α 3.8, β 15.2, d 10%, n 3)', Math.round(C.sbgDERL(3.8, 15.2, 0.1, 3) * 100) / 100, 3.59, 1e-12);
close('DEL = 1 + DERL(1)/(1+d)', C.sbgDEL(0.7, 1.2, 0.1), 1 + C.sbgDERL(0.7, 1.2, 0.1, 1) / 1.1, 1e-12);
{ // with every customer identical (α, β large, θ = α/(α+β)), DERL tends to the known-θ value (1 − θ)(1 + d) ÷ (d + θ)
  const th = 0.2, d = 0.1, big = 1e6;
  close('DERL homogeneous limit', C.sbgDERL(th * big, (1 - th) * big, d, 3), (1 - th) * (1 + d) / (d + th), 1e-4);
}

// ---- CLV and payback
{
  const m = 10, r = 0.8, d = 0.1;
  close('clv start closed', C.clvConstant({ m, r, d }).value, m * (1 + d) / (1 + d - r));
  close('clv end closed', C.clvConstant({ m, r, d, timing: 'end' }).value, m * r / (1 + d - r));
  close('clv start long horizon = closed', C.clvConstant({ m, r, d, horizon: 2000 }).value, m * (1 + d) / (1 + d - r), 1e-9);
  close('clv end long horizon = closed', C.clvConstant({ m, r, d, timing: 'end', horizon: 2000 }).value, m * r / (1 + d - r), 1e-9);
  close('clv 3 periods start', C.clvConstant({ m, r, d, horizon: 3 }).value, 10 + 8 / 1.1 + 6.4 / 1.21);
  close('clv no discount = m / churn', C.clvConstant({ m, r, d: 0 }).value, m / (1 - r));
  same('clv curve', C.clvConstant({ m: 1, r: 0.5, horizon: 3 }).curve(3), [1, 1.5, 1.75]);
  same('payback periods', C.payback({ cac: 25, m: 10, r: 0.8 }), 4);       // 10, 18, 24.4, 29.52
  same('payback never', C.payback({ cac: 60, m: 10, r: 0.8 }), Infinity);  // the limit is 50
  close('simple payback', C.simplePayback(25, 10), 2.5);
  same('clv refuses r ≥ 1 + d', !!C.clvConstant({ m, r: 1.2, d: 0.1 }).error, true);
}

// ---- lift table (hand case)
{
  const y = [1, 0, 1, 1, 0, 0, 0, 1, 0, 0], s = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1];
  const t = C.liftTable(y, s, 5);
  same('lift positives', t.rows.map((r) => r.positives), [1, 2, 0, 1, 0]);
  close('lift top group', t.rows[0].lift, 0.5 / 0.4);
  same('lift captured', t.rows.map((r) => r.captured), [0.25, 0.75, 0.75, 1, 1]);
  same('lift uneven groups', C.liftTable([1, 0, 1, 0, 1, 0, 0], [7, 6, 5, 4, 3, 2, 1], 3).rows.map((r) => r.n), [3, 2, 2]);
}

console.log(`${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
