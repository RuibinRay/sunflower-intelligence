// mixsim.js — the model behind the Marketing Mix Simulator (M02 The 4Ps Marketing Mix).
//
// A teaching model, not a forecast. It turns a launch plan for Lantern Cold Brew (fictional) into simulated
// year-1 demand, money and customer measures, using the fictional market in data/study/m02/market.js and the
// coefficients in C below. Pure and deterministic: no DOM, no randomness; the same plan gives the same numbers.
// Checked by tests/mixsim.test.mjs.
//
// THE MODEL, quarter by quarter (q = 1…4) and channel by channel (c). Every coefficient is described in MODEL.
//
//  1. Category cans     N(c,q) = cansPerYear ÷ 4 × seasonality(q) × volume(c)
//  2. Utility           U(j,c) = βq(c)·quality(j) − βp(c)·price(j) + βv·ln(SKUs(j)) + γ·[organic tier, natural grocers]
//                       + h(c) for the three established competitors (repeat buyers; Lantern has none in year 1).
//                       Competitors' ranges aren't in the market file, so their variety term is 0.
//  3. Attraction        A(j,c,q) = availability(j,c) × awareness(j,q) × lift(j,c,q) × exp(U(j,c))
//                       availability is 1 if the brand is stocked in the channel and 0 if not; lift is the sampling
//                       multiplier (Lantern, retail channels only; 1 otherwise). Competitors' awareness is fixed.
//  4. Share (retail)    s(j,c,q) = A(j) ÷ Σ A(every brand stocked in c)        attraction model / multinomial logit
//     Share (direct)    s = A(Lantern) ÷ (A(Lantern) + exp(U0))               U0: the outside option, not buying here
//  5. Awareness         Gd(q) = λd·Gd(q−1) + digital(q)       Gr(q) = λr·Gr(q−1) + w·PR(q)         (adstock pools)
//                       awareness(q) = a0 + (ceiling − a0) × (1 − exp(−(Gd + Gr) ÷ K))
//                       no spend → both pools stay 0 → awareness stays a0 (LANTERN.awareness)
//  6. Sampling          S(q) = λs·S(q−1) + sampling(q) ÷ coverage      lift(q) = 1 + M × (1 − exp(−S(q) ÷ Ks))
//                       coverage = the category volume share of the retail channels chosen: the same budget spread
//                       over more stores does less in each. No retail channel → no lift.
//  7. Trade promotions  in a share φ(q) of weeks, retail shoppers pay P × (1 − d) and Lantern pays P × d per can;
//                       shoppers respond to the perceived cut d × (1 − ρ·φ) (frequent deals impress less);
//                       φ(q) is set so the discounts Lantern pays equal the quarter's trade budget, capped at φmax.
//  8. Units             retail: N × [(1 − φ)·s(regular weeks) + φ·s(promoted weeks)]     direct: N × s
//  9. Money             net price: retail P × (1 − margin(c)); direct P − fulfilment (Lantern's revenue per can)
//                       gross profit = Σ units × (net price − cost of goods)
//                       trade cost = Σ promoted units × P × d
//                       marketing = digital + sampling + PR
//                       fixed costs = listing(c) × SKUs for each retail channel + range fixed cost + direct fixed cost
//                       contribution = gross profit − trade cost − marketing − fixed costs
//                       profit after overhead = contribution − LANTERN.overhead
//                       contribution per can = (gross profit − trade cost) ÷ units
//                       break-even cans = (fixed costs + marketing + overhead) ÷ contribution per can
// 10. Satisfaction      r = (Lantern quality ÷ average price paid) ÷ (awareness-weighted quality per dollar of the
//                       competitors a shopper could buy in that channel; all three for the direct channel)
//                       index = 100 × r^k ÷ (1 + r^k): 50 means the same value for money as the alternatives.
//                       A simulated index; it does not feed back into demand.
// 11. Elasticity        own-price, holding promotion activity fixed: ε(c) = Σ units × (−βp(c) × price × (1 − s)) ÷ Σ units
//                       over the regular and promoted weeks of every quarter (price = the price shoppers react to).
//
// Functional forms: multinomial logit (McFadden, 1974), attraction / market-share models (Cooper & Nakanishi,
// 1988), advertising carryover as adstock (Broadbent, 1979). The coefficient values are invented for teaching and
// were calibrated so the default plan behaves sensibly (targets and results in tests/mixsim.test.mjs).
import { CATEGORY, TIERS, RANGES, CHANNELS, COMPETITORS, PROMOTION, LANTERN, DEFAULT_PLAN } from '../data/study/m02/market.js?v=22';

export { CATEGORY, TIERS, RANGES, CHANNELS, COMPETITORS, PROMOTION, LANTERN, DEFAULT_PLAN };

/** The range of shelf prices the model covers (and the simulator's slider). */
export const PRICE = Object.freeze({ min: 1.99, max: 4.99, step: 0.10 });
/** The simulator's budget sliders, per promotion vehicle per year. The engine accepts 0 to BUDGET.limit. */
export const BUDGET = Object.freeze({ min: 0, max: 200_000, step: 5_000, limit: 1_000_000 });
/** The decisions a plan contains (the keys a widget can lock). */
export const DECISIONS = Object.freeze(['tier', 'range', 'price', 'channels', 'promotion']);
export const PROMO_KEYS = Object.freeze(PROMOTION.map((p) => p.id)); // digital, sampling, trade, pr

const TIER = Object.fromEntries(TIERS.map((t) => [t.id, t]));
const RANGE = Object.fromEntries(RANGES.map((r) => [r.id, r]));
const CHANNEL = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
const CH_IDS = CHANNELS.map((c) => c.id);
const RETAIL = CH_IDS.filter((id) => id !== 'direct');
const QUARTERS = 4;

// ================================================================ coefficients
const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); };

/** Every number the model uses besides market.js. MODEL.coefficients describes each one. */
export const C = deepFreeze({
  betaPrice: { supermarket: 0.55, convenience: 0.30, natural: 0.36, direct: 0.42 },
  betaQuality: { supermarket: 0.10, convenience: 0.10, natural: 0.22, direct: 0.15 },
  betaVariety: 0.18,
  organicFit: 0.10,
  habit: { supermarket: 1.0, convenience: 1.6, natural: 0.6 },
  outside: 1.2,
  awareness: { ceiling: 0.38, scale: 60_000, retainDigital: 0.5, weightPR: 0.6, retainPR: 0.8 },
  sampling: { maxLift: 0.5, scale: 30_000, retain: 0.4 },
  trade: { depth: 0.20, maxShare: 0.40, fatigue: 1.25 },
  satisfaction: { steepness: 4 },
});

const coef = (id, group, sym, sub, value, unit, about) => ({ id, group, symbol: sym, sub, value, unit, about });
const CH_NAME = { supermarket: 'supermarkets', convenience: 'convenience stores', natural: 'natural grocers', direct: 'direct' };

/** The model's coefficients, equations, sources and limits, for the lab page, the tests and anyone checking the work. */
export const MODEL = deepFreeze({
  name: 'Marketing Mix Simulator',
  version: '1.0',
  summary: 'A teaching model of a fictional launch: shares come from an attraction (multinomial logit) model, awareness builds with adstock-style carryover, and the money follows the price build-up through each channel.',
  caveat: 'Simulated predictions, not verified outcomes: use them to reason about trade-offs, not as forecasts.',
  coefficients: [
    coef('betaPrice.supermarket', 'Demand', 'β', 'p, supermarkets', C.betaPrice.supermarket, 'per $', 'Price sensitivity: how much $1 more on the shelf lowers a brand’s appeal to supermarket shoppers, who compare prices on the shelf.'),
    coef('betaPrice.convenience', 'Demand', 'β', 'p, convenience', C.betaPrice.convenience, 'per $', 'Convenience-store shoppers buy chilled singles on impulse and compare prices less.'),
    coef('betaPrice.natural', 'Demand', 'β', 'p, natural', C.betaPrice.natural, 'per $', 'Natural and specialty grocers’ shoppers are less price-sensitive than supermarket shoppers.'),
    coef('betaPrice.direct', 'Demand', 'β', 'p, direct', C.betaPrice.direct, 'per $', 'Lantern’s café and online customers, choosing between Lantern and not buying a can here.'),
    coef('betaQuality.supermarket', 'Demand', 'β', 'q, supermarkets', C.betaQuality.supermarket, 'per quality point', 'Quality weight: the appeal one taste-panel point adds in supermarkets.'),
    coef('betaQuality.convenience', 'Demand', 'β', 'q, convenience', C.betaQuality.convenience, 'per quality point', 'Quality weight in convenience stores.'),
    coef('betaQuality.natural', 'Demand', 'β', 'q, natural', C.betaQuality.natural, 'per quality point', 'Natural-grocer shoppers weigh quality about twice as heavily.'),
    coef('betaQuality.direct', 'Demand', 'β', 'q, direct', C.betaQuality.direct, 'per quality point', 'Quality weight among Lantern’s own customers.'),
    coef('betaVariety', 'Demand', 'β', 'v', C.betaVariety, 'per ln(SKUs)', 'Variety: a wider range appeals to more tastes; three flavours add 0.18 × ln 3 ≈ 0.20 to utility.'),
    coef('organicFit', 'Demand', 'γ', 'organic', C.organicFit, 'utility', 'Extra appeal of the certified-organic tier to natural-grocer shoppers, who pay for provenance.'),
    coef('habit.supermarket', 'Demand', 'h', 'supermarkets', C.habit.supermarket, 'utility', 'Repeat buyers of the three established brands; Lantern, new in year 1, has none.'),
    coef('habit.convenience', 'Demand', 'h', 'convenience', C.habit.convenience, 'utility', 'Stronger in convenience stores: impulse buyers grab a brand they already know.'),
    coef('habit.natural', 'Demand', 'h', 'natural', C.habit.natural, 'utility', 'Weaker in natural grocers, whose shoppers try new brands for quality and provenance.'),
    coef('outside', 'Demand', 'U', '0', C.outside, 'utility', 'The outside option in the direct channel: the appeal of not buying a Lantern can in its cafés or online shop.'),
    coef('awareness.ceiling', 'Awareness', 'a', 'max', C.awareness.ceiling, 'share of buyers', 'The most awareness a year of advertising and PR can reach (competitors, after years, have 50–75%).'),
    coef('awareness.scale', 'Awareness', 'K', '', C.awareness.scale, '$ of ad stock', 'Ad stock that closes about 63% of the gap between 12% and the ceiling: sets how fast returns diminish.'),
    coef('awareness.retainDigital', 'Awareness', 'λ', 'd', C.awareness.retainDigital, 'per quarter', 'Share of last quarter’s ad stock that carries into this quarter (ads fade quickly).'),
    coef('awareness.weightPR', 'Awareness', 'w', '', C.awareness.weightPR, 'per $', 'A PR dollar adds 0.6 of what an ad dollar adds in the quarter it is spent…'),
    coef('awareness.retainPR', 'Awareness', 'λ', 'r', C.awareness.retainPR, 'per quarter', '…but coverage and events are remembered longer, so PR builds more slowly and lasts.'),
    coef('sampling.maxLift', 'Sampling', 'M', '', C.sampling.maxLift, 'multiplier', 'The most in-store sampling and displays can raise Lantern’s appeal at the shelf (+50%).'),
    coef('sampling.scale', 'Sampling', 'K', 's', C.sampling.scale, '$ per quarter ÷ coverage', 'Sampling stock that delivers about 63% of the maximum lift; spreading it over more stores dilutes it.'),
    coef('sampling.retain', 'Sampling', 'λ', 's', C.sampling.retain, 'per quarter', 'Share of the trial effect that carries into the next quarter.'),
    coef('trade.depth', 'Trade promotion', 'd', '', C.trade.depth, 'share of price', 'In promoted weeks shoppers pay 20% less; Lantern pays the discount on every promoted can.'),
    coef('trade.maxShare', 'Trade promotion', 'φ', 'max', C.trade.maxShare, 'share of weeks', 'Retailers run a brand’s promotions in at most 40% of weeks; budget beyond that can’t be spent.'),
    coef('trade.fatigue', 'Trade promotion', 'ρ', '', C.trade.fatigue, '', 'Deal fatigue: the more weeks on deal, the less special each deal looks (perceived cut = d × (1 − ρφ)).'),
    coef('satisfaction.steepness', 'Satisfaction', 'k', '', C.satisfaction.steepness, '', 'How quickly the satisfaction index moves away from 50 as value for money departs from the alternatives’.'),
  ],
  sources: [
    { text: 'McFadden, D. (1974). Conditional logit analysis of qualitative choice behavior. In P. Zarembka (Ed.), Frontiers in Econometrics (pp. 105–142). Academic Press.', url: 'https://eml.berkeley.edu/~mcfadden/dlmcv10.html', checked: '2026-10-22', for: 'the multinomial logit form of the choice model' },
    { text: 'Cooper, L. G., & Nakanishi, M. (1988). Market-Share Analysis: Evaluating Competitive Marketing Effectiveness. Kluwer Academic Publishers (web edition, UCLA).', url: 'https://www.anderson.ucla.edu/faculty/lee.cooper/MCI_Book/Book1.htm', checked: '2026-10-22', for: 'attraction models: a brand’s share is its attraction divided by the total attraction of all brands' },
    { text: 'Broadbent, S. (1979). One way TV advertisements work. Journal of the Market Research Society.', url: 'https://en.wikipedia.org/wiki/Advertising_adstock', checked: '2026-10-22', for: 'adstock: advertising effects that carry over and decay from period to period' },
  ],
  leavesOut: [
    'Competitor reactions: rival prices, promotions and awareness stay fixed whatever Lantern does.',
    'Stock-outs and capacity: every can demanded is supplied.',
    'Word of mouth and repeat purchase: satisfaction does not feed back into demand, and only sampling’s trial effect carries over.',
    'Cannibalisation: extra flavours and extra channels never take sales from each other.',
    'Category growth: the category stays at 4.8 million cans whatever Lantern does; Lantern’s cans come from rivals (or, in the direct channel, from people who would not have bought).',
    'Different prices by channel: one shelf price everywhere (in practice retailers set their own shelf prices).',
    'Shelf presence: a listed channel counts as fully stocked from day one, and trade money buys only price cuts, never better shelf position, features or retailer goodwill.',
    'Uncertainty: the model gives one number, not a range; real launches vary widely.',
    'Years after the first: awareness and habit built in year 1 would carry into year 2.',
  ],
});

// ================================================================ plans
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const money0 = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const price2 = (v) => `$${v.toFixed(2)}`;
const int0 = (v) => Math.round(v).toLocaleString('en-US');
const pct1 = (v) => `${(v * 100).toFixed(1)}%`;

/**
 * Checks a plan and returns { ok, errors, warnings, plan } where `plan` is a clean copy (channels de-duplicated and
 * in the market file's order; missing promotion budgets set to 0). Errors are sentences a student can act on.
 */
export function validatePlan(plan) {
  const errors = [], warnings = [];
  if (!plan || typeof plan !== 'object') return { ok: false, errors: ['A plan is needed: product tier, range, price, channels and promotion.'], warnings, plan: null };
  if (!TIER[plan.tier]) errors.push(`Choose a product tier: ${TIERS.map((t) => t.name).join(', ')}.`);
  if (!RANGE[plan.range]) errors.push(`Choose a range: ${RANGES.map((r) => r.name.toLowerCase()).join(' or ')}.`);
  const price = typeof plan.price === 'string' && plan.price.trim() !== '' ? Number(plan.price) : plan.price;
  if (!isNum(price)) errors.push('Set a shelf price per can.');
  else if (price < PRICE.min - 1e-9 || price > PRICE.max + 1e-9) errors.push(`Set a shelf price between ${price2(PRICE.min)} and ${price2(PRICE.max)}: the range this model covers.`);
  const list = Array.isArray(plan.channels) ? plan.channels : [];
  const unknown = list.filter((c) => !CHANNEL[c]);
  if (unknown.length) errors.push(`Unknown channel${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}.`);
  const channels = CH_IDS.filter((id) => list.includes(id));
  if (!channels.length && !unknown.length) errors.push('Choose at least one channel.');
  const promo = {};
  const given = plan.promotion && typeof plan.promotion === 'object';
  const src = given ? plan.promotion : {};
  for (const k of PROMO_KEYS) {
    const raw = src[k];
    const v = raw == null ? 0 : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
    const name = PROMOTION.find((p) => p.id === k).name;
    if (!isNum(v) || v < 0) errors.push(`${name}: the budget must be zero or more.`);
    else if (v > BUDGET.limit) errors.push(`${name}: the budget can’t exceed ${money0(BUDGET.limit)} a year in this model.`);
    else promo[k] = v;
    if (raw == null && given) warnings.push(`${name}: no budget given, so $0 is used.`);
  }
  if (!given) warnings.push('No promotion budget given, so every vehicle is $0.');
  const ok = errors.length === 0;
  return { ok, errors, warnings, plan: ok ? { tier: plan.tier, range: plan.range, price, channels, promotion: promo } : null };
}

/** A deep copy of a plan (so callers can change it freely). */
export function clonePlan(plan) {
  return { tier: plan.tier, range: plan.range, price: plan.price, channels: [...(plan.channels || [])], promotion: { ...(plan.promotion || {}) } };
}
export const defaultPlan = () => clonePlan(DEFAULT_PLAN);

// ================================================================ the model
function utility(c, quality, price, skus, organic) {
  return C.betaQuality[c] * quality - C.betaPrice[c] * price + C.betaVariety * Math.log(skus) + (organic && c === 'natural' ? C.organicFit : 0);
}
/** One competitor's attraction in channel c: awareness × exp(U + habit(c)). */
function rivalA(k, c) { return k.awareness * Math.exp(utility(c, k.quality, k.price, 1, false) + C.habit[c]); }
/** Σ over the competitors stocked in each retail channel (fixed: competitors don't react in this model). */
const RIVALS = Object.fromEntries(RETAIL.map((c) => [c, COMPETITORS.filter((k) => k.in.includes(c)).reduce((a, k) => a + rivalA(k, c), 0)]));

/** Awareness in each quarter, from the yearly digital and PR budgets (split evenly across quarters). */
export function awarenessPath(digital, pr) {
  const a = C.awareness, a0 = LANTERN.awareness;
  let gd = 0, gr = 0;
  const out = [];
  for (let q = 0; q < QUARTERS; q++) {
    gd = a.retainDigital * gd + digital / QUARTERS;
    gr = a.retainPR * gr + a.weightPR * pr / QUARTERS;
    out.push({ q: q + 1, awareness: a0 + (a.ceiling - a0) * (1 - Math.exp(-(gd + gr) / a.scale)), adsStock: gd, prStock: gr });
  }
  return out;
}

/** Sampling multiplier on Lantern's attraction at the shelf in each quarter; coverage = volume share of retail channels. */
export function samplingPath(sampling, coverage) {
  const k = C.sampling;
  let st = 0;
  const out = [];
  for (let q = 0; q < QUARTERS; q++) {
    st = k.retain * st + (coverage > 0 ? sampling / QUARTERS / coverage : 0);
    out.push(1 + k.maxLift * (1 - Math.exp(-st / k.scale)));
  }
  return out;
}

function netPrice(c, P) {
  const cfg = CHANNEL[c];
  return c === 'direct' ? P - cfg.fulfil : P * (1 - cfg.margin);
}

/** The competitors a shopper in channel c could have bought, and their awareness-weighted quality per dollar. */
function altValue(c) {
  const rivals = c === 'direct' ? COMPETITORS : COMPETITORS.filter((k) => k.in.includes(c));
  const w = rivals.reduce((a, k) => a + k.awareness, 0);
  return rivals.reduce((a, k) => a + k.awareness * (k.quality / k.price), 0) / w;
}
const ALT = Object.fromEntries(CH_IDS.map((c) => [c, altValue(c)]));
/** Value-for-money index (0–100) for quality per dollar `v` in channel c. */
export function satisfactionIndex(v, c) {
  const rk = (v / ALT[c]) ** C.satisfaction.steepness;
  return 100 * rk / (1 + rk);
}

/**
 * The core calculation, for a plan that has already been validated. opts.phi fixes the share of promoted weeks
 * per quarter (used for the numerical elasticity check, which holds promotion activity fixed).
 */
function compute(plan, opts = {}) {
  const tier = TIER[plan.tier], range = RANGE[plan.range], P = plan.price;
  const skus = range.skus, organic = tier.id === 'organic';
  const pr = plan.promotion;
  const chosen = plan.channels;
  const retail = chosen.filter((c) => c !== 'direct');
  const coverage = retail.reduce((a, c) => a + CHANNEL[c].volume, 0);
  const aw = awarenessPath(pr.digital, pr.pr);
  const lift = samplingPath(pr.sampling, coverage);
  const { depth: d, maxShare, fatigue } = C.trade;
  const U0 = Math.exp(C.outside);

  const ch = Object.fromEntries(chosen.map((c) => [c, { units: 0, reg: 0, promo: 0, cans: 0, outside: 0, elastNum: 0, satNum: 0, rivals: Object.fromEntries(COMPETITORS.filter((k) => k.in.includes(c)).map((k) => [k.id, 0])) }]));
  const quarters = [];
  for (let q = 0; q < QUARTERS; q++) {
    const catQ = CATEGORY.cansPerYear / QUARTERS * CATEGORY.seasonality[q];
    const awq = aw[q].awareness, lq = lift[q];
    const row = { q: q + 1, units: 0, byChannel: {}, awareness: awq, samplingLift: retail.length ? lq : 1, promoShare: 0, share: 0, revenue: 0, grossProfit: 0, tradeCost: 0 };
    // regular weeks in each retail channel
    const st = {};
    for (const c of retail) {
      const Areg = awq * lq * Math.exp(utility(c, tier.quality, P, skus, organic));
      st[c] = { N: catQ * CHANNEL[c].volume, Areg, sReg: Areg / (Areg + RIVALS[c]) };
    }
    // promoted weeks: shoppers react to P × (1 − d(1 − ρφ)); they pay P(1 − d); Lantern pays P·d per promoted can
    const promoAt = (phi) => {
      let cost = 0;
      for (const c of retail) {
        const x = st[c];
        x.Ppro = P * (1 - d * (1 - fatigue * phi));
        x.Apro = awq * lq * Math.exp(utility(c, tier.quality, x.Ppro, skus, organic));
        x.sPro = x.Apro / (x.Apro + RIVALS[c]);
        cost += phi * x.N * x.sPro * P * d;
      }
      return cost;
    };
    const budget = pr.trade / QUARTERS;
    let phi = 0;
    if (opts.phi) phi = retail.length ? opts.phi[q] : 0;
    else if (retail.length && budget > 0) {
      if (promoAt(maxShare) <= budget) phi = maxShare;
      else {
        let lo = 0, hi = maxShare; // the cost of promoting rises with φ, so bisection finds the φ the budget pays for
        for (let it = 0; it < 60; it++) { const mid = (lo + hi) / 2; if (promoAt(mid) < budget) lo = mid; else hi = mid; }
        phi = (lo + hi) / 2;
      }
    }
    promoAt(phi);
    row.promoShare = phi;
    for (const c of chosen) {
      const k = ch[c];
      let uReg, uPro = 0, N, eps, paid;
      if (c === 'direct') {
        N = catQ * CHANNEL.direct.volume;
        const A = awq * Math.exp(utility('direct', tier.quality, P, skus, organic));
        const s = A / (A + U0);
        uReg = N * s;
        eps = uReg * (-C.betaPrice.direct * P * (1 - s));
        k.outside += N * (1 - s);
        paid = uReg * P;
      } else {
        const x = st[c];
        N = x.N;
        uReg = N * (1 - phi) * x.sReg; uPro = N * phi * x.sPro;
        eps = uReg * (-C.betaPrice[c] * P * (1 - x.sReg)) + uPro * (-C.betaPrice[c] * x.Ppro * (1 - x.sPro));
        for (const r of COMPETITORS) if (r.in.includes(c)) {
          const ar = rivalA(r, c);
          k.rivals[r.id] += N * ((1 - phi) * ar / (x.Areg + RIVALS[c]) + phi * ar / (x.Apro + RIVALS[c]));
        }
        paid = uReg * P + uPro * P * (1 - d);
      }
      const u = uReg + uPro;
      k.units += u; k.reg += uReg; k.promo += uPro; k.cans += N; k.elastNum += eps;
      k.satNum += u * satisfactionIndex(tier.quality / (u > 0 ? paid / u : P), c);
      row.byChannel[c] = u;
      row.units += u;
      const net = netPrice(c, P);
      row.revenue += u * net;
      row.grossProfit += u * (net - tier.cogs);
      row.tradeCost += uPro * P * d;
    }
    row.share = row.units / catQ;
    quarters.push(row);
  }

  // ---- channels and the year
  const byChannel = chosen.map((c) => {
    const k = ch[c], cfg = CHANNEL[c];
    const net = netPrice(c, P);
    const revenue = k.units * net, grossProfit = k.units * (net - tier.cogs);
    const tradeCost = k.promo * P * d;
    const fixed = c === 'direct' ? (cfg.fixed || 0) : cfg.listing * skus;
    const brands = c === 'direct'
      ? [{ id: 'lantern', name: 'Lantern Cold Brew', share: k.units / k.cans }, { id: 'outside', name: 'Not buying from Lantern', share: k.outside / k.cans }]
      : [{ id: 'lantern', name: 'Lantern Cold Brew', share: k.units / k.cans }, ...COMPETITORS.filter((r) => r.in.includes(c)).map((r) => ({ id: r.id, name: r.name, share: k.rivals[r.id] / k.cans }))];
    return {
      id: c, name: cfg.name, units: k.units, cans: k.cans, share: k.units / k.cans,
      regularUnits: k.reg, promotedUnits: k.promo,
      shelfPrice: P, margin: cfg.margin, fulfil: cfg.fulfil, netPrice: net, cogs: tier.cogs, grossMarginPerCan: net - tier.cogs,
      revenue, grossProfit, tradeCost, fixedCosts: fixed, contribution: grossProfit - tradeCost - fixed,
      elasticity: k.units > 0 ? k.elastNum / k.units : 0,
      satisfaction: k.units > 0 ? k.satNum / k.units : satisfactionIndex(tier.quality / P, c),
      brands,
    };
  });
  const sum = (key) => byChannel.reduce((a, r) => a + r[key], 0);
  const units = sum('units'), revenue = sum('revenue'), grossProfit = sum('grossProfit'), tradeCost = sum('tradeCost');
  const marketing = pr.digital + pr.sampling + pr.pr;
  const fixedCosts = sum('fixedCosts') + range.fixed;
  const contribution = grossProfit - tradeCost - marketing - fixedCosts;
  const profit = contribution - LANTERN.overhead;
  const perCan = units > 0 ? (grossProfit - tradeCost) / units : 0;
  const year = {
    units, share: units / CATEGORY.cansPerYear, revenue, cogs: units * tier.cogs, grossProfit,
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    tradeBudget: pr.trade, tradeCost, marketing, fixedCosts,
    listingFees: byChannel.filter((r) => r.id !== 'direct').reduce((a, r) => a + r.fixedCosts, 0),
    rangeFixed: range.fixed, directFixed: chosen.includes('direct') ? (CHANNEL.direct.fixed || 0) : 0,
    contribution, overhead: LANTERN.overhead, profit,
    contributionPerCan: perCan,
    breakEvenUnits: perCan > 0 ? (fixedCosts + marketing + LANTERN.overhead) / perCan : null,
    breakEvenUnitsBeforeOverhead: perCan > 0 ? (fixedCosts + marketing) / perCan : null,
    satisfaction: units > 0 ? byChannel.reduce((a, r) => a + r.units * r.satisfaction, 0) / units : 50,
    awarenessStart: LANTERN.awareness, awarenessEnd: aw[QUARTERS - 1].awareness,
    elasticity: units > 0 ? byChannel.reduce((a, r) => a + r.units * r.elasticity, 0) / units : 0,
    promotedShare: units > 0 ? sum('promotedUnits') / units : 0,
  };
  return { quarters, byChannel, year, phi: quarters.map((r) => r.promoShare) };
}

const CAVEAT = 'Simulated with a teaching model: these are predictions from stated assumptions, not forecasts or verified outcomes.';

/** Notes that explain this plan's results in words (plain text). */
function planNotes(plan, r) {
  const notes = [];
  const retail = plan.channels.filter((c) => c !== 'direct');
  const pr = plan.promotion, y = r.year;
  if (!retail.length && pr.sampling > 0) notes.push(`Sampling and displays work at the shelf, so with no retail channel the ${money0(pr.sampling)} sampling budget is spent without raising sales.`);
  if (!retail.length && pr.trade > 0) notes.push(`Trade promotions fund price cuts in stores, so with no retail channel the ${money0(pr.trade)} trade budget is not spent.`);
  else if (pr.trade > 0 && y.tradeCost < pr.trade - 1) notes.push(`Retailers run a brand’s promotions in at most ${Math.round(C.trade.maxShare * 100)}% of weeks, so only ${money0(y.tradeCost)} of the ${money0(pr.trade)} trade budget can be spent.`);
  if (y.contributionPerCan <= 0) notes.push('At this price each can loses money after the trade margin, cost of goods and promotion discounts, so no volume breaks even.');
  else if (y.profit < 0) notes.push(`The plan loses money in year 1: at ${price2(y.contributionPerCan)} contribution per can it needs about ${int0(y.breakEvenUnits)} cans, not ${int0(y.units)}, to cover its fixed costs, marketing and the launch overhead.`);
  if (pr.digital === 0 && pr.pr === 0) notes.push(`With no advertising or PR, awareness stays at the ${Math.round(LANTERN.awareness * 100)}% who already know Lantern.`);
  return notes;
}

/**
 * Simulates a plan for one year. Returns { ok: true, plan, quarters, year, byChannel, notes, warnings, caveat } or,
 * for a plan that can't be simulated, { ok: false, error, errors } (for example 'Choose at least one channel.').
 */
export function simulate(plan) {
  const v = validatePlan(plan);
  if (!v.ok) return { ok: false, error: v.errors[0], errors: v.errors };
  const r = compute(v.plan);
  return { ok: true, plan: v.plan, quarters: r.quarters, year: r.year, byChannel: r.byChannel, notes: planNotes(v.plan, r), warnings: v.warnings, caveat: CAVEAT };
}

/**
 * Own-price elasticity of Lantern's units in one channel, holding promotion activity fixed.
 * Returns { channel, analytic, numeric, share } or null when the plan doesn't use the channel (or is invalid).
 * analytic = units-weighted −βp × price × (1 − s); numeric = central difference of ln(units) against ln(price).
 */
export function elasticity(plan, channel) {
  const v = validatePlan(plan);
  if (!v.ok || !v.plan.channels.includes(channel)) return null;
  const base = compute(v.plan);
  const row = base.byChannel.find((r) => r.id === channel);
  const h = 1e-4;
  const at = (f) => compute({ ...v.plan, price: v.plan.price * f }, { phi: base.phi }).byChannel.find((r) => r.id === channel).units;
  const numeric = (Math.log(at(1 + h)) - Math.log(at(1 - h))) / (Math.log(1 + h) - Math.log(1 - h));
  return { channel, analytic: row.elasticity, numeric, share: row.share };
}

/** Sets one decision in a copy of the plan. key: 'tier' | 'range' | 'price' | 'channels' | 'promotion' | 'promotion.<vehicle>'. */
export function withDecision(plan, key, value) {
  const p = clonePlan(plan);
  if (key.startsWith('promotion.')) p.promotion[key.slice(10)] = value;
  else if (key === 'promotion') p.promotion = { ...value };
  else if (key === 'channels') p.channels = [...value];
  else p[key] = value;
  return p;
}

/**
 * Runs the plan once per value of one decision (see withDecision for keys). Returns [{ value, ok, units, share,
 * revenue, grossProfit, tradeCost, contribution, profit, contributionPerCan, satisfaction, awarenessEnd, elasticity }],
 * or { value, ok: false, error } for a value the model can't simulate.
 */
export function sweep(plan, key, values) {
  return values.map((value) => {
    const r = simulate(withDecision(plan, key, value));
    if (!r.ok) return { value, ok: false, error: r.error };
    const y = r.year;
    return { value, ok: true, units: y.units, share: y.share, revenue: y.revenue, grossProfit: y.grossProfit, tradeCost: y.tradeCost, contribution: y.contribution, profit: y.profit, contributionPerCan: y.contributionPerCan, satisfaction: y.satisfaction, awarenessEnd: y.awarenessEnd, elasticity: y.elasticity };
  });
}

/** Every shelf price on the simulator's grid ($1.99, $2.09 … $4.99). */
export function priceGrid(step = PRICE.step) {
  const n = Math.round((PRICE.max - PRICE.min) / step);
  return Array.from({ length: n + 1 }, (_, i) => Math.round((PRICE.min + i * step) * 100) / 100);
}

/**
 * The shelf price that maximises profit with everything else in the plan fixed: the best 10-cent grid point, then
 * the best cent within 10 cents of it. Returns { price, profit, contribution, units } or null for an invalid plan.
 */
export function bestPrice(plan) {
  const v = validatePlan(plan);
  if (!v.ok) return null;
  const at = (p) => compute({ ...v.plan, price: p }).year;
  let best = PRICE.min, bp = -Infinity;
  for (const p of priceGrid()) { const y = at(p); if (y.profit > bp) { bp = y.profit; best = p; } }
  const from = Math.round(Math.max(PRICE.min, best - 0.1) * 100), to = Math.round(Math.min(PRICE.max, best + 0.1) * 100);
  for (let c = from; c <= to; c++) { const y = at(c / 100); if (y.profit > bp) { bp = y.profit; best = c / 100; } }
  const y = at(best);
  return { price: best, profit: y.profit, contribution: y.contribution, units: y.units };
}

// ================================================================ words
const listWords = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** 'Social and search ads' → 'social and search ads', but 'PR and events' stays. */
const lower1 = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

/**
 * A plain-text summary of a plan and its simulated results, for students to paste into a written recommendation.
 * Says plainly that the numbers come from a teaching model.
 */
export function describe(plan) {
  const r = simulate(plan);
  if (!r.ok) return `This plan can’t be simulated yet: ${r.errors.join(' ')}`;
  const p = r.plan, y = r.year, tier = TIER[p.tier], range = RANGE[p.range];
  const promoTotal = PROMO_KEYS.reduce((a, k) => a + p.promotion[k], 0);
  const lines = [
    'Lantern Cold Brew launch plan (fictional case, Marketing Mix Simulator)',
    '',
    `Product: ${tier.name} (taste-panel quality ${tier.quality} out of 10, cost of goods ${price2(tier.cogs)} a can), ${range.name.toLowerCase()}${range.skus > 1 ? ` (${listWords(range.flavours)})` : ''}.`,
    `Price: ${price2(p.price)} a can on the shelf.`,
    `Place: ${p.channels.map((c) => (c === 'direct' ? CHANNEL[c].name : lower1(CHANNEL[c].name))).join('; ')}.`,
    `Promotion: ${PROMOTION.map((v) => `${money0(p.promotion[v.id])} ${lower1(v.name)}`).join('; ')} (${money0(promoTotal)} a year in total).`,
    '',
    'Simulated year 1 (a teaching model, not a forecast):',
    `- Cans sold: ${int0(y.units)}, ${pct1(y.share)} of the category’s ${int0(CATEGORY.cansPerYear)} cans.`,
    `- Revenue to Lantern (after trade margins and direct fulfilment): ${money0(y.revenue)}; gross profit ${money0(y.grossProfit)} (${pct1(y.grossMargin)} of revenue).`,
    `- Costs: trade promotions ${money0(y.tradeCost)}, marketing ${money0(y.marketing)}, fixed costs ${money0(y.fixedCosts)}.`,
    `- Contribution ${money0(y.contribution)}; profit after the ${money0(y.overhead)} launch overhead ${money0(y.profit)}.`,
    `- Contribution per can ${price2(y.contributionPerCan)}; break-even ${y.breakEvenUnits == null ? 'not reachable at this price' : `${int0(y.breakEvenUnits)} cans`}.`,
    `- Awareness ${Math.round(y.awarenessStart * 100)}% at launch, ${Math.round(y.awarenessEnd * 100)}% at the end of the year; satisfaction index ${Math.round(y.satisfaction)} out of 100 (simulated index; 50 = the same value for money as competitors).`,
    '',
    'By channel:',
    ...r.byChannel.map((c) => `- ${c.name}: ${int0(c.units)} cans (${pct1(c.share)} of the channel), net price ${price2(c.netPrice)}, contribution ${money0(c.contribution)}, price elasticity ${c.elasticity.toFixed(2).replace('-', '−')}.`),
  ];
  if (r.notes.length) lines.push('', 'Notes:', ...r.notes.map((n) => `- ${n}`));
  lines.push('', MODEL.caveat);
  return lines.join('\n');
}
