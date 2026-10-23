// Run: node tests/mixsim.test.mjs   (checks assets/js/core/mixsim.js, the Marketing Mix Simulator's model:
// its internal consistency, its economics and the calibration targets for the default plan)
import * as M from '../assets/js/core/mixsim.js';

let fails = 0, checks = 0;
const truthy = (label, ok, detail = '') => { checks++; if (!ok) { fails++; console.log(`FAIL ${label} ${detail}`); } };
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = Number.isFinite(got) && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const within = (label, v, lo, hi) => truthy(label, Number.isFinite(v) && v >= lo && v <= hi, `: ${v} not in [${lo}, ${hi}]`);

const D = M.defaultPlan();
const ALL = M.CHANNELS.map((c) => c.id);
const subsets = (xs) => xs.reduce((acc, x) => acc.concat(acc.map((s) => [...s, x])), [[]]).filter((s) => s.length);
const CH_SETS = subsets(ALL); // all 15 non-empty channel choices
const ZERO = { digital: 0, sampling: 0, trade: 0, pr: 0 };
const sim = (p) => { const r = M.simulate(p); if (!r.ok) throw new Error(`plan failed: ${r.error}`); return r; };
const finiteDeep = (o, path = '') => {
  if (o === null) return [];
  if (typeof o === 'number') return Number.isFinite(o) ? [] : [path];
  if (Array.isArray(o)) return o.flatMap((v, i) => finiteDeep(v, `${path}[${i}]`));
  if (typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => finiteDeep(v, `${path}.${k}`));
  return [];
};

// ---------------------------------------------------------------- determinism and shape
{
  const a = sim(D), b = sim(M.defaultPlan());
  truthy('determinism: the same plan gives identical results', JSON.stringify(a) === JSON.stringify(b));
  truthy('determinism: describe() is stable', M.describe(D) === M.describe(M.defaultPlan()));
  truthy('simulate does not change the plan passed in', JSON.stringify(D) === JSON.stringify(M.DEFAULT_PLAN));
  truthy('four quarters', a.quarters.length === 4 && a.quarters.every((q, i) => q.q === i + 1));
  truthy('a row per chosen channel, in market order', JSON.stringify(a.byChannel.map((c) => c.id)) === JSON.stringify(['supermarket', 'natural', 'direct']));
  for (const k of ['units', 'share', 'revenue', 'grossProfit', 'tradeCost', 'marketing', 'fixedCosts', 'contribution', 'profit', 'breakEvenUnits', 'satisfaction', 'awarenessEnd']) truthy(`year.${k} present`, Number.isFinite(a.year[k]));
  for (const k of ['id', 'units', 'share', 'netPrice', 'revenue', 'contribution', 'elasticity']) truthy(`byChannel.${k} present`, a.byChannel.every((c) => c[k] != null));
  truthy('the caveat says it is not a forecast', /not forecasts/.test(a.caveat) && /not verified outcomes/.test(M.MODEL.caveat));
}

// ---------------------------------------------------------------- shares, sums and money reconcile
for (const chs of CH_SETS) for (const tier of ['classic', 'organic']) {
  const p = { ...D, tier, channels: chs, promotion: { digital: 80_000, sampling: 30_000, trade: 60_000, pr: 20_000 } };
  const r = sim(p), y = r.year, tag = `${tier} ${chs.join('+')}`;
  for (const c of r.byChannel) close(`shares in ${c.id} sum to 1 (${tag})`, c.brands.reduce((a, b) => a + b.share, 0), 1, 1e-12);
  close(`quarters add up to the year's units (${tag})`, r.quarters.reduce((a, q) => a + q.units, 0), y.units, 1e-10);
  for (const c of r.byChannel) close(`quarters add up in ${c.id} (${tag})`, r.quarters.reduce((a, q) => a + q.byChannel[c.id], 0), c.units, 1e-10);
  close(`revenue = units × net price (${tag})`, r.byChannel.reduce((a, c) => a + c.units * c.netPrice, 0), y.revenue, 1e-10);
  close(`channel contributions reconcile with the year (${tag})`, r.byChannel.reduce((a, c) => a + c.contribution, 0) - y.marketing - y.rangeFixed, y.contribution, 1e-10);
  close(`profit = contribution − overhead (${tag})`, y.contribution - M.LANTERN.overhead, y.profit, 1e-12);
  truthy(`trade cost never exceeds the budget (${tag})`, y.tradeCost <= p.promotion.trade * (1 + 1e-9));
  close(`share of category = units ÷ category cans (${tag})`, y.share, y.units / M.CATEGORY.cansPerYear, 1e-12);
}
{
  const r = sim(D);
  close('trade cost equals the budget when retailers’ cap does not bind', r.year.tradeCost, D.promotion.trade, 1e-6);
  const big = sim({ ...D, promotion: { ...D.promotion, trade: 500_000 } });
  truthy('a trade budget beyond the 40% cap is not all spent, and a note says so', big.year.tradeCost < 500_000 && big.quarters.every((q) => Math.abs(q.promoShare - M.C.trade.maxShare) < 1e-12) && big.notes.some((n) => /at most 40%/.test(n)));
  const dOnly = sim({ ...D, channels: ['direct'] });
  truthy('no retail channel: no trade spend, no sampling lift, and notes explain both', dOnly.year.tradeCost === 0 && dOnly.quarters.every((q) => q.samplingLift === 1) && dOnly.notes.length >= 2);
}

// ---------------------------------------------------------------- price: units fall, profit has one peak
const singlePeaked = (ys) => { let i = 0; while (i < ys.length - 1 && ys[i + 1] > ys[i]) i++; while (i < ys.length - 1 && ys[i + 1] < ys[i]) i++; return i === ys.length - 1; };
const grid = M.priceGrid();
truthy('price grid runs $1.99 to $4.99 in 10-cent steps', grid.length === 31 && grid[0] === 1.99 && grid[30] === 4.99 && grid.includes(3.49));
for (const chs of CH_SETS) for (const tier of ['classic', 'single', 'organic']) for (const promotion of [D.promotion, ZERO]) {
  const p = { ...D, tier, channels: chs, promotion };
  const sw = M.sweep(p, 'price', grid);
  const tag = `${tier} ${chs.join('+')}${promotion === ZERO ? ' no promotion' : ''}`;
  truthy(`units fall as price rises (${tag})`, sw.every((s, i) => i === 0 || s.units < sw[i - 1].units));
  truthy(`profit is single-peaked over $1.99–$4.99 (${tag})`, singlePeaked(sw.map((s) => s.profit)));
}

// ---------------------------------------------------------------- elasticity: analytic = numerical
for (const p of [D, { ...D, channels: ALL }, { ...D, channels: ALL, tier: 'organic', range: 'three', promotion: { digital: 150_000, sampling: 90_000, trade: 120_000, pr: 40_000 } }, { ...D, price: 1.99, channels: ALL }, { ...D, price: 4.99, channels: ALL }, { ...D, channels: ALL, promotion: ZERO }]) {
  for (const c of p.channels) {
    const e = M.elasticity(p, c);
    close(`elasticity in ${c} at $${p.price}: analytic ≈ numerical`, e.analytic, e.numeric, 1e-6);
    truthy(`elasticity in ${c} is negative`, e.analytic < 0);
    close(`byChannel elasticity matches elasticity() (${c})`, sim(p).byChannel.find((x) => x.id === c).elasticity, e.analytic, 1e-12);
  }
}
truthy('elasticity() is null for a channel the plan doesn’t use', M.elasticity(D, 'convenience') === null);
{
  // with no promotion and a single quarter's share, the textbook logit formula holds exactly
  const p = { ...D, channels: ['supermarket'], promotion: ZERO };
  const r = sim(p), s = r.byChannel[0].share; // share is the same every quarter when awareness is flat
  close('no promotion: ε = −βp × P × (1 − s)', r.byChannel[0].elasticity, -M.C.betaPrice.supermarket * p.price * (1 - s), 1e-12);
}

// ---------------------------------------------------------------- awareness and promotion
{
  const r = sim({ ...D, promotion: ZERO });
  truthy('zero promotion: awareness stays at 12% every quarter', r.quarters.every((q) => q.awareness === M.LANTERN.awareness) && r.year.awarenessEnd === M.LANTERN.awareness);
  const r2 = sim({ ...D, promotion: { digital: 0, sampling: 100_000, trade: 100_000, pr: 0 } });
  truthy('sampling and trade alone don’t move awareness', r2.year.awarenessEnd === M.LANTERN.awareness);
  for (const key of ['digital', 'pr']) {
    const vals = [0, 50_000, 100_000, 150_000, 200_000];
    const aw = vals.map((v) => M.awarenessPath(key === 'digital' ? v : 0, key === 'pr' ? v : 0)[3].awareness);
    truthy(`more ${key} spend → more awareness`, aw.every((a, i) => i === 0 || a > aw[i - 1]));
    const gains = aw.slice(1).map((a, i) => a - aw[i]);
    truthy(`${key}: each extra $50,000 adds less awareness than the last`, gains.every((g, i) => i === 0 || g < gains[i - 1]));
    truthy(`${key}: awareness stays below the ceiling`, aw.every((a) => a < M.C.awareness.ceiling));
  }
  const q = M.awarenessPath(50_000, 0).map((x) => x.awareness);
  truthy('awareness builds over the year with steady spend (carryover)', q.every((a, i) => i === 0 || a > q[i - 1]));
  const pr = M.awarenessPath(0, 50_000).map((x) => x.awareness), ad = M.awarenessPath(50_000, 0).map((x) => x.awareness);
  truthy('PR builds awareness more slowly than the same spend on ads', pr[0] < ad[0]);
  // diminishing returns in units, for every vehicle and for the whole budget
  for (const key of ['digital', 'sampling', 'pr', 'trade']) {
    const vals = [0, 25_000, 50_000, 75_000, 100_000];
    const u = M.sweep(D, `promotion.${key}`, vals).map((s) => s.units);
    const gains = u.slice(1).map((x, i) => x - u[i]);
    // trade: once retailers' 40% cap on promoted weeks binds, extra budget buys nothing (gain 0), so ≥ and ≤ there
    const strict = key !== 'trade';
    truthy(`${key}: more spend → more cans`, gains.every((g, i) => g > 0 || (!strict && i > 1 && g >= 0)), gains.join(', '));
    truthy(`${key}: diminishing returns (each extra $25,000 adds fewer cans)`, gains.every((g, i) => i === 0 || g < gains[i - 1] || (!strict && g === 0 && gains[i - 1] >= 0)), gains.map(Math.round).join(', '));
  }
  const scale = [0, 0.5, 1, 1.5, 2, 3];
  const tot = scale.map((k) => sim({ ...D, promotion: Object.fromEntries(Object.entries(D.promotion).map(([kk, v]) => [kk, v * k])) }).year);
  const g = tot.slice(1).map((y, i) => (y.units - tot[i].units) / (scale[i + 1] - scale[i]));
  truthy('whole promotion budget: diminishing returns in cans', g.every((x, i) => i === 0 || x < g[i - 1]), g.map(Math.round).join(', '));
  truthy('whole promotion budget: tripling it earns less profit than the default', tot[5].profit < tot[2].profit);
}

// ---------------------------------------------------------------- channels and fixed costs
for (const drop of ALL) for (const range of ['one', 'three']) {
  const full = sim({ ...D, range, channels: ALL }), cut = sim({ ...D, range, channels: ALL.filter((c) => c !== drop) });
  const skus = M.RANGES.find((r) => r.id === range).skus, ch = M.CHANNELS.find((c) => c.id === drop);
  truthy(`removing ${drop} removes its row and its units (${range})`, !cut.byChannel.some((c) => c.id === drop) && cut.quarters.every((q) => q.byChannel[drop] == null));
  close(`removing ${drop} removes its listing fees (${range})`, full.year.fixedCosts - cut.year.fixedCosts, drop === 'direct' ? ch.fixed : ch.listing * skus, 1e-12);
  truthy(`removing ${drop} lowers total units (${range})`, cut.year.units < full.year.units);
}
{
  const one = sim(D), three = sim({ ...D, range: 'three' });
  close('three flavours add three SKUs of listing fees plus the range fixed cost', three.year.fixedCosts - one.year.fixedCosts, (9_000 + 2_000) * 2 + 12_000, 1e-12);
  truthy('three flavours sell more cans (variety)', three.year.units > one.year.units);
}

// ---------------------------------------------------------------- break-even
for (const p of [D, { ...D, channels: ALL }, { ...D, channels: ['direct'] }, { ...D, channels: ['convenience'], tier: 'organic', price: 2.49 }, { ...D, promotion: ZERO }]) {
  const y = sim(p).year;
  close(`profit at break-even is zero (${p.channels.join('+')})`, y.contributionPerCan * y.breakEvenUnits - y.fixedCosts - y.marketing - y.overhead, 0, 1e-9);
  close(`contribution at break-even before overhead is zero (${p.channels.join('+')})`, y.contributionPerCan * y.breakEvenUnitsBeforeOverhead - y.fixedCosts - y.marketing, 0, 1e-9);
  truthy(`profit is positive exactly when units exceed break-even (${p.channels.join('+')})`, (y.profit > 0) === (y.units > y.breakEvenUnits));
  close(`contribution = per-can contribution × units − fixed − marketing (${p.channels.join('+')})`, y.contributionPerCan * y.units - y.fixedCosts - y.marketing, y.contribution, 1e-9);
}

// ---------------------------------------------------------------- satisfaction
{
  const at = (tier, price) => sim({ ...D, tier, price, promotion: ZERO }).year.satisfaction;
  truthy('satisfaction: organic > single > classic at the same price', at('organic', 3.49) > at('single', 3.49) && at('single', 3.49) > at('classic', 3.49));
  truthy('satisfaction falls as price rises', at('single', 2.99) > at('single', 3.49) && at('single', 3.49) > at('single', 3.99));
  const altDirect = M.COMPETITORS.reduce((a, k) => a + k.awareness * k.quality / k.price, 0) / M.COMPETITORS.reduce((a, k) => a + k.awareness, 0);
  close('satisfaction is 50 at the alternatives’ value for money', M.satisfactionIndex(altDirect, 'direct'), 50, 1e-12);
  const sA = sim({ ...D, promotion: { ...ZERO, digital: 100_000 } }), sB = sim({ ...D, promotion: ZERO });
  truthy('satisfaction in each channel depends on value for money, not on awareness', sA.byChannel.every((c, i) => Math.abs(c.satisfaction - sB.byChannel[i].satisfaction) < 1e-9));
  truthy('promoted weeks (a lower price paid) raise satisfaction a little', sim({ ...D, promotion: { ...ZERO, trade: 50_000 } }).byChannel[0].satisfaction > sB.byChannel[0].satisfaction);
}

// ---------------------------------------------------------------- edges: no NaN anywhere, clear errors
{
  let n = 0, bad = [];
  const promos = [ZERO, D.promotion, { digital: 200_000, sampling: 200_000, trade: 200_000, pr: 200_000 }, { digital: 1e6, sampling: 1e6, trade: 1e6, pr: 1e6 }];
  for (const chs of CH_SETS) for (const tier of ['classic', 'single', 'organic']) for (const range of ['one', 'three']) for (const price of [1.99, 3.49, 4.99]) for (const promotion of promos) {
    const p = { tier, range, price, channels: chs, promotion };
    const r = M.simulate(p);
    n++;
    if (!r.ok) { bad.push(`${JSON.stringify(p)} → ${r.error}`); continue; }
    const nonFinite = finiteDeep({ quarters: r.quarters, year: r.year, byChannel: r.byChannel });
    if (nonFinite.length) bad.push(`${JSON.stringify(p)}: ${nonFinite.slice(0, 3).join(', ')}`);
    if (r.year.breakEvenUnits === null && r.year.contributionPerCan > 0) bad.push(`${JSON.stringify(p)}: break-even missing`);
    if (r.year.satisfaction <= 0 || r.year.satisfaction >= 100) bad.push(`${JSON.stringify(p)}: satisfaction ${r.year.satisfaction}`);
    if (!/teaching model/.test(M.describe(p))) bad.push('describe');
  }
  truthy(`no NaN or Infinity in ${n} edge plans`, bad.length === 0, bad.slice(0, 5).join('\n'));
  const none = M.simulate({ ...D, channels: [] });
  truthy('no channels → “Choose at least one channel.”', none.ok === false && none.error === 'Choose at least one channel.');
  truthy('describe() of a plan with no channels says what to fix', /Choose at least one channel/.test(M.describe({ ...D, channels: [] })));
  const errs = [
    [{ ...D, tier: 'gold' }, /product tier/], [{ ...D, range: 'five' }, /range/], [{ ...D, price: 1.5 }, /between \$1\.99 and \$4\.99/], [{ ...D, price: 5.49 }, /between/],
    [{ ...D, price: NaN }, /shelf price/], [{ ...D, channels: ['vending'] }, /Unknown channel/], [{ ...D, promotion: { ...D.promotion, digital: -1 } }, /zero or more/],
    [{ ...D, promotion: { ...D.promotion, pr: 2e6 } }, /can’t exceed/], [null, /plan is needed/],
  ];
  for (const [p, re] of errs) { const v = M.validatePlan(p); truthy(`validatePlan rejects ${JSON.stringify(p)?.slice(0, 60)}`, !v.ok && v.errors.some((e) => re.test(e)), v.errors.join(' ')); }
  const v = M.validatePlan({ ...D, price: '3.49', channels: ['direct', 'supermarket', 'direct'], promotion: { digital: '1000' } });
  truthy('validatePlan cleans a plan: numeric strings, duplicate and out-of-order channels, missing budgets', v.ok && v.plan.price === 3.49 && JSON.stringify(v.plan.channels) === '["supermarket","direct"]' && v.plan.promotion.sampling === 0 && v.plan.promotion.digital === 1000 && v.warnings.length === 3);
  const sw = M.sweep(D, 'channels', [[], ['natural']]);
  truthy('sweep reports a value it can’t simulate instead of throwing', sw[0].ok === false && /channel/.test(sw[0].error) && sw[1].ok === true);
}

// ---------------------------------------------------------------- the documentation matches the code
{
  const get = (path) => path.split('.').reduce((o, k) => o[k], M.C);
  for (const c of M.MODEL.coefficients) {
    truthy(`MODEL ${c.id} has a description`, typeof c.about === 'string' && c.about.length > 20);
    close(`MODEL ${c.id} value matches the engine`, c.value, get(c.id), 0);
  }
  const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));
  truthy('every coefficient in C is documented in MODEL', leaves(M.C).length === M.MODEL.coefficients.length, `${leaves(M.C).length} vs ${M.MODEL.coefficients.length}`);
  truthy('coefficients are frozen', Object.isFrozen(M.C) && Object.isFrozen(M.C.betaPrice));
  truthy('MODEL lists what the model leaves out', M.MODEL.leavesOut.length >= 5 && M.MODEL.leavesOut.some((t) => /Competitor reactions/.test(t)));
}

// ---------------------------------------------------------------- performance
{
  const t0 = performance.now(); for (let i = 0; i < 300; i++) M.simulate(D); const per = (performance.now() - t0) / 300;
  truthy('simulate() runs in well under 5 ms', per < 1, `${per.toFixed(3)} ms`);
}

// ---------------------------------------------------------------- calibration targets (DEFAULT_PLAN)
const cal = {};
{
  const r = sim(D), y = r.year, chOf = (res, id) => res.byChannel.find((c) => c.id === id);
  cal.share = y.share; within('calibration: year-1 share of category cans is 3–6%', y.share, 0.03, 0.06);
  cal.elasticity = Object.fromEntries(ALL.map((c) => [c, M.elasticity({ ...D, channels: ALL }, c).analytic]));
  cal.elasticityDefault = Object.fromEntries(D.channels.map((c) => [c, M.elasticity(D, c).analytic]));
  within('calibration: supermarket own-price elasticity −2.5 to −1.5', cal.elasticityDefault.supermarket, -2.5, -1.5);
  truthy('calibration: convenience and natural shoppers are less price-sensitive than supermarket shoppers', cal.elasticity.convenience > cal.elasticity.supermarket && cal.elasticity.natural > cal.elasticity.supermarket);
  const best = M.bestPrice(D); cal.bestPrice = best;
  within('calibration: profit-maximising price $2.79–$4.29', best.price, 2.79, 4.29);
  const conv = sim({ ...D, channels: [...D.channels, 'convenience'] }).year;
  cal.convenience = { units: conv.units, perCan: conv.contributionPerCan };
  truthy('calibration: adding convenience stores raises units', conv.units > y.units);
  truthy('calibration: adding convenience stores lowers contribution per can', conv.contributionPerCan < y.contributionPerCan);
  const org = sim({ ...D, tier: 'organic' });
  cal.organic = { satisfaction: org.year.satisfaction, natural: chOf(org, 'natural').share, perCan: org.year.contributionPerCan };
  truthy('calibration: organic raises the satisfaction index', org.year.satisfaction > y.satisfaction);
  truthy('calibration: organic raises natural-grocer share', chOf(org, 'natural').share > chOf(r, 'natural').share);
  truthy('calibration: organic costs more per can', chOf(org, 'natural').cogs > chOf(r, 'natural').cogs && org.year.contributionPerCan < y.contributionPerCan);
  cal.default = y;
}

console.log(`\nCalibration (DEFAULT_PLAN, simulated): share ${(cal.share * 100).toFixed(2)}%, ${Math.round(cal.default.units).toLocaleString('en-US')} cans; contribution $${Math.round(cal.default.contribution).toLocaleString('en-US')}; profit after overhead $${Math.round(cal.default.profit).toLocaleString('en-US')}`);
console.log(`  elasticity: ${Object.entries(cal.elasticityDefault).map(([c, e]) => `${c} ${e.toFixed(2)}`).join(', ')} (convenience if added ${cal.elasticity.convenience.toFixed(2)})`);
console.log(`  profit-maximising price $${cal.bestPrice.price.toFixed(2)} (profit $${Math.round(cal.bestPrice.profit).toLocaleString('en-US')}); satisfaction ${cal.default.satisfaction.toFixed(1)}; awareness ${(cal.default.awarenessEnd * 100).toFixed(1)}% at year end`);
console.log(`\n${checks - fails} of ${checks} checks passed`);
if (fails) process.exit(1);
