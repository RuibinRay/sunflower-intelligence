// case.js — the B03 Excel for Business Analytics story: Ana Lim's spreadsheet work at Lantern Coffee Co. in the summer
// of 2026. One source of truth for every figure B03's lessons, exercises, assessments and project use. Every name and
// number is invented for teaching.
//
// The story: B02 cleaned the online shop's March–June export; Ana now analyses it in Excel (ORDERS: 231 orders,
// $9,096.15 of order value, the figure F02's books use). She looks up each product's cost on Kilnworth Roasting's
// spring price list (PRODUCTS; Lantern buys roasted bags from Kilnworth, F02), prices the July delivery rule (B01:
// free over $35, otherwise $4.95), studies her 76 catering events (EVENTS; F02: 76 events at an average of $820; M01:
// about $9 a head and 18 clients by December), plans the first July stock order with Solver (STOCK_PLAN) and models the
// shop's monthly profit for the relaunch (SHOP_MODEL, from B01's July figures and F02's year).
//
// Agrees with other courses (checked in IDENTITIES):
// - b02: ORDERS is B02's clean truth; its order values total $9,096.15 (F02 FACTS.shop.orderValueMarJun).
// - f01: March catering: Meridian Partners' two-day conference ($4,200, 12 March), Harbor Tech's first prepaid event
//   (26 March, $800; the others on 9 and 23 April) and Pier Nine Studio's breakfast (31 March, $600): $5,600.
// - f02: 76 catering events, $62,320 in all; House Blend 250 g cost $8.00 a bag before the autumn price rises (F02's
//   1 October layer); courier cost per shop order and card-fee rate from F02's year.
// - m01: 18 catering clients by December; Lantern charges "about $9 a head".
// - b01: July 2026: 294 orders at an average order value of $41.20; free delivery on orders over $35.
// Discounts in ORDERS: subscription orders get 10% off (B02); other discounts are a $5 promotion code, and the bulk
// order (LC-10144, 120 bags for a Central-region office) got 10% off.
import { ORDER_COLUMNS, ORDERS, EVENT_COLUMNS, EVENTS, RAW_COLUMNS, RAW } from './data.js?v=18';
import { FACTS as F02 } from '../f02/case.js?v=18';
import { MARCH } from '../f01/case.js?v=18';
import { DELIVERY, SHOP as B01_SHOP } from '../b01/case.js?v=18';
import { BUSINESS as M01 } from '../m01/case.js?v=18';
import { ols } from '../../../core/stats.js?v=18';
import { Sheet, isoToSerial, addr, colToIndex, solveLP, goalSeek } from '../../../core/sheet.js?v=18';

export { ORDER_COLUMNS, ORDERS, EVENT_COLUMNS, EVENTS, RAW_COLUMNS, RAW, isoToSerial };

/** Kilnworth Roasting's spring 2026 price list to Lantern (cost per item, delivered) and Lantern's shop prices. */
export const PRODUCT_COLUMNS = ['product', 'line', 'size_g', 'price', 'unit_cost'];
export const PRODUCTS = [
  ['House Blend 250g', 'Blend', 250, 14.00, 8.00],
  ['House Blend 1kg', 'Blend', 1000, 46.00, 26.00],
  ['Espresso Roast 250g', 'Blend', 250, 15.50, 7.80],
  ['Espresso Roast 1kg', 'Blend', 1000, 49.00, 24.50],
  ['Colombia Huila 250g', 'Single origin', 250, 17.00, 7.60],
  ['Ethiopia Yirgacheffe 250g', 'Single origin', 250, 19.50, 8.40],
  ['Sumatra Mandheling 250g', 'Single origin', 250, 18.00, 8.10],
  ['Decaf Colombia 250g', 'Decaf', 250, 16.50, 7.90],
  ['Decaf Colombia 1kg', 'Decaf', 1000, 54.00, 27.00],
  ['Cold Brew Pack', 'Cold brew', 480, 22.00, 8.50],
  ['Gift Box Trio', 'Gift', 750, 58.00, 20.00],
];

/** The July delivery rule (B01) as an approximate-match table: order value from → delivery charge. "Over $35" means
 *  $35.01 or more, so an order of exactly $35.00 still pays. */
export const DELIVERY_BANDS = [[0, DELIVERY.charge], [35.01, 0]];
/** Order-size bands Ana uses in reports (approximate match: the largest "from" not above the order value). */
export const SIZE_BANDS = [[0, 'Under $20'], [20, '$20 to $39.99'], [40, '$40 to $99.99'], [100, '$100 and over']];

/** Ana's catering quote sheet (fictional): a setup charge per event day, a price per guest, a charge per hour of
 *  service, a pastry platter, and a minimum invoice. Invoices add bespoke changes (extra staff, a late finish, a
 *  negotiated price), so they don't equal the quote exactly. A two-day event is quoted day by day. */
export const QUOTE = { setup: 60, perGuest: 6.5, perHour: 30, platter: 120, minimum: 300 };
export const quote = (guests, hours, pastries, days = 1) => Math.max(QUOTE.minimum, days * (QUOTE.setup + QUOTE.perGuest * guests + QUOTE.perHour * hours + (pastries ? QUOTE.platter : 0)));

/** The first July stock order from Kilnworth (1–14 July 2026): four lines, Kilnworth's roasting allocation for
 *  Lantern, Ana's stock budget, her packing time, and her forecast of what sells in the fortnight. */
export const STOCK_PLAN = {
  items: [
    { product: 'House Blend 250g', kg: 0.25, minutes: 2, min: 80, max: 140 },     // at least 80 for subscribers
    { product: 'Colombia Huila 250g', kg: 0.25, minutes: 2, min: 0, max: 60 },
    { product: 'Ethiopia Yirgacheffe 250g', kg: 0.25, minutes: 2, min: 0, max: 50 },
    { product: 'Espresso Roast 1kg', kg: 1, minutes: 2.5, min: 0, max: 25 },
  ],
  limits: { kg: 55, budget: 1800, minutes: 360 },        // roasted coffee (kg), cash for stock ($), packing (minutes)
};

/** Ana's monthly model of the shop after the relaunch: B01's July orders and average order value; product cost,
 *  card and platform fees and courier cost per order from F02's year; her estimate of fixed monthly costs (a
 *  part-time packer and advertising). */
export const SHOP_MODEL = {
  orders: B01_SHOP.webOrders[0] + B01_SHOP.appOrders[0],     // 294
  aov: B01_SHOP.aov[0],                                       // 41.20
  costShare: 0.48,                                            // product cost ÷ order value (F02: 52,400 ÷ 110,000)
  feeRate: 0.035,                                             // card and platform fees ÷ what customers pay (F02)
  courier: 5.20,                                              // courier cost per order (F02 shipping ÷ the year's orders)
  fixed: 2_000,                                               // fixed costs per month (Ana's estimate)
};

// ---------------------------------------------------------------- spreadsheet helpers
/** Sheet cells for a table: the header in row `at`'s row, data below; ISO dates become date serial numbers (unless
 *  `raw: true`, which keeps every value exactly as given, for raw exports) and null becomes a blank cell. `cols` picks
 *  columns by name (default all). Returns { cells, range, last, colOf }. */
export function tableCells(columns, rows, { at = 'A1', cols = columns, n = rows.length, raw = false } = {}) {
  const m = /^([A-Z]+)(\d+)$/.exec(at);
  const c0 = colToIndex(m[1]), r0 = Number(m[2]) - 1;
  const idx = cols.map((c) => columns.indexOf(c));
  if (idx.some((i) => i < 0)) throw new Error(`tableCells: unknown column in ${cols.join(', ')}`);
  const cells = {};
  cols.forEach((c, j) => { cells[addr(r0, c0 + j)] = c; });
  rows.slice(0, n).forEach((row, i) => idx.forEach((k, j) => {
    let v = row[k];
    if (!raw && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) v = isoToSerial(v);
    if (v != null) cells[addr(r0 + 1 + i, c0 + j)] = v;
  }));
  const colOf = Object.fromEntries(cols.map((c, j) => [c, addr(0, c0 + j).replace(/\d+$/, '')]));
  return { cells, range: `${addr(r0, c0)}:${addr(r0 + n, c0 + cols.length - 1)}`, last: r0 + n + 1, colOf };
}
/** The orders as a sheet (A1 header). */
export const ordersCells = (opts = {}) => tableCells(ORDER_COLUMNS, ORDERS, opts);
/** The events as a sheet (A1 header). */
export const eventsCells = (opts = {}) => tableCells(EVENT_COLUMNS, EVENTS, opts);
/** The price list as a sheet. */
export const productCells = (opts = {}) => tableCells(PRODUCT_COLUMNS, PRODUCTS, opts);
/** Records (objects) for the pivot widget, with a Month field. */
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const orderRecords = () => ORDERS.map((r) => {
  const o = Object.fromEntries(ORDER_COLUMNS.map((c, i) => [c, r[i]]));
  const p = PRODUCTS.find((x) => x[0] === o.product);
  return { Month: MON[Number(o.order_date.slice(5, 7))], Region: o.region, Product: o.product, Line: p[1], Channel: o.channel, Subscription: o.subscription,
    Orders: 1, Quantity: o.quantity, 'Order value': o.order_total, 'Product cost': Math.round(o.quantity * p[4] * 100) / 100, 'Gross margin': Math.round((o.order_total - o.quantity * p[4]) * 100) / 100 };
});
export const eventRecords = () => EVENTS.map((r) => {
  const o = Object.fromEntries(EVENT_COLUMNS.map((c, i) => [c, r[i]]));
  return { Month: MON[Number(o.event_date.slice(5, 7))], Client: o.client, Type: o.event_type, Pastries: o.pastries, Events: 1, Guests: o.guests, Invoice: o.invoice };
});

// ---------------------------------------------------------------- derived (recomputed by the checker)
const col = (name) => ORDERS.map((r) => r[ORDER_COLUMNS.indexOf(name)]);
const ecol = (name) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;
const mean = (a) => sum(a) / a.length;
const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
const pct = (a, k) => { const s = [...a].sort((x, y) => x - y), h = (s.length - 1) * k, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
const by = (keys, vals) => { const m = {}; keys.forEach((k, i) => { m[k] = (m[k] || 0) + vals[i]; }); Object.keys(m).forEach((k) => { m[k] = r2(m[k]); }); return m; };
const count = (keys) => by(keys, keys.map(() => 1));

const total = col('order_total'), qty = col('quantity'), price = col('unit_price'), disc = col('discount');
const month = col('order_date').map((d) => MON[Number(d.slice(5, 7))]);
const costOf = (p) => PRODUCTS.find((x) => x[0] === p)[4];
const cost = ORDERS.map((r) => r[ORDER_COLUMNS.indexOf('quantity')] * costOf(r[ORDER_COLUMNS.indexOf('product')]));
const ratings = col('rating').filter((v) => v != null);
const bulk = ORDERS.find((r) => r[ORDER_COLUMNS.indexOf('quantity')] === 120);
const noBulk = total.filter((_, i) => ORDERS[i] !== bulk);

const inv = ecol('invoice'), guests = ecol('guests'), days = ecol('days'), hours = ecol('hours'), pastries = ecol('pastries').map((p) => (p === 'yes' ? 1 : 0)), baristas = ecol('baristas');
const oneDay = EVENTS.map((_, i) => i).filter((i) => days[i] === 1);
const pick = (a) => oneDay.map((i) => a[i]);
const fitSimple = ols([pick(guests)], pick(inv), { names: ['guests'] });
const fitMulti = ols([pick(guests), pick(hours), pick(pastries)], pick(inv), { names: ['guests', 'hours', 'pastries'] });
const fitBaristas = ols([pick(guests), pick(hours), pick(pastries), pick(baristas)], pick(inv), { names: ['guests', 'hours', 'pastries', 'baristas'] });
const fitAll = ols([guests], inv, { names: ['guests'] });   // all 76, the two-day conference included
const summary = (f) => ({ r2: f.r2, adjR2: f.adjR2, se: f.sigma, F: f.F, pF: f.pF, n: f.n, sse: f.sse, sst: f.sst,
  coefs: Object.fromEntries(f.coefs.map((c) => [c.name, { b: c.estimate, se: c.se, t: c.t, p: c.p, low: c.low, high: c.high }])) });

// the stock order, by Simplex LP with whole bags
const SP = STOCK_PLAN;
const priceOf = (p) => PRODUCTS.find((x) => x[0] === p)[3];
const unitMargin = SP.items.map((it) => r2(priceOf(it.product) - costOf(it.product)));
const spCons = [
  { coef: SP.items.map((it) => it.kg), op: '<=', rhs: SP.limits.kg },
  { coef: SP.items.map((it) => costOf(it.product)), op: '<=', rhs: SP.limits.budget },
  { coef: SP.items.map((it) => it.minutes), op: '<=', rhs: SP.limits.minutes },
  ...SP.items.flatMap((it, i) => [{ coef: SP.items.map((_, j) => (j === i ? 1 : 0)), op: '<=', rhs: it.max }, ...(it.min ? [{ coef: SP.items.map((_, j) => (j === i ? 1 : 0)), op: '>=', rhs: it.min }] : [])]),
];
const spInt = solveLP({ objective: unitMargin, constraints: spCons, integer: SP.items.map((_, i) => i) });
const spLP = solveLP({ objective: unitMargin, constraints: spCons });
const spUse = (x) => ({ kg: sum(SP.items.map((it, i) => it.kg * x[i])), budget: r2(sum(SP.items.map((it, i) => costOf(it.product) * x[i]))), minutes: sum(SP.items.map((it, i) => it.minutes * x[i])) });

// the monthly shop model, as a sheet (the same layout the what-if lesson uses)
export const SHOP_SHEET = {
  cells: {
    A1: 'Lantern online shop: one month', A3: 'Orders per month', B3: SHOP_MODEL.orders, A4: 'Average order value', B4: SHOP_MODEL.aov,
    A5: 'Product cost (share of order value)', B5: SHOP_MODEL.costShare, A6: 'Card and platform fees (share)', B6: SHOP_MODEL.feeRate,
    A7: 'Courier cost per order', B7: SHOP_MODEL.courier, A8: 'Fixed costs per month', B8: SHOP_MODEL.fixed,
    A10: 'Order value', B10: '=B3*B4', A11: 'Product cost', B11: '=B10*B5', A12: 'Card and platform fees', B12: '=B10*B6',
    A13: 'Courier', B13: '=B3*B7', A14: 'Contribution', B14: '=B10-B11-B12-B13', A15: 'Profit', B15: '=B14-B8',
    A16: 'Contribution per order', B16: '=B14/B3',
  },
};
const shop = new Sheet(SHOP_SHEET);
const perOrder = SHOP_MODEL.aov * (1 - SHOP_MODEL.costShare - SHOP_MODEL.feeRate) - SHOP_MODEL.courier;

export const DERIVED = {
  orders: ORDERS.length,                                              // 231
  orderValue: r2(sum(total)),                                         // 9,096.15
  grossValue: r2(sum(qty.map((q, i) => q * price[i]))),              // before discounts
  discounts: r2(sum(disc)),
  units: sum(qty),
  subscriptions: col('subscription').filter((s) => s === 'yes').length,   // 104
  byMonth: { orders: count(month), value: by(month, total) },
  byChannel: { orders: count(col('channel')), value: by(col('channel'), total) },
  byRegion: { orders: count(col('region')), value: by(col('region'), total) },
  byProduct: { orders: count(col('product')), units: by(col('product'), qty), value: by(col('product'), total) },
  rated: ratings.length, meanRating: mean(ratings),
  orderStats: { mean: mean(total), median: pct(total, 0.5), sd: sdS(total), q1: pct(total, 0.25), q3: pct(total, 0.75), min: Math.min(...total), max: Math.max(...total) },
  withoutBulk: { mean: mean(noBulk), median: pct(noBulk, 0.5), sd: sdS(noBulk) },
  bulk: { id: bulk[0], value: bulk[ORDER_COLUMNS.indexOf('order_total')] },
  productCost: r2(sum(cost)), grossMargin: r2(sum(total) - sum(cost)), marginRate: (sum(total) - sum(cost)) / sum(total),
  deliveryPaying: total.filter((t) => t <= 35).length,               // orders that would pay the July charge
  sizeBands: count(total.map((t) => [...SIZE_BANDS].reverse().find((b) => t >= b[0])[1])),
  events: EVENTS.length, eventValue: sum(inv), eventMean: mean(inv), eventMedian: pct(inv, 0.5), eventSd: sdS(inv),
  guestDays: sum(guests.map((g, i) => g * days[i])), perHead: sum(inv) / sum(guests.map((g, i) => g * days[i])),
  eventsByMonth: count(ecol('event_date').map((d) => MON[Number(d.slice(5, 7))])),
  eventsByType: { events: count(ecol('event_type')), value: by(ecol('event_type'), inv) },
  clients: new Set(ecol('client')).size,
  regression: { oneDay: oneDay.length, simple: summary(fitSimple), multi: summary(fitMulti), withBaristas: summary(fitBaristas), allEvents: summary(fitAll) },
  stock: { unitMargin, best: spInt.x, contribution: spInt.objective, used: spUse(spInt.x), relaxed: spLP.x, relaxedContribution: spLP.objective },
  shop: { perOrder, contribution: shop.get('B14'), profit: shop.get('B15'), breakEven: SHOP_MODEL.fixed / perOrder,
          breakEvenSeek: goalSeek(shop, { target: 'B15', goal: 0, changing: 'B3' }).value },
};

const ev = (id) => EVENTS.find((r) => r[0] === id);
const march = (id) => MARCH.find((t) => t.id === id);
export const IDENTITIES = [
  ['order value = F02’s March–June shop figure', r2(sum(total)) === F02.shop.orderValueMarJun],
  ['every order total = quantity × price − discount', ORDERS.every((r, i) => Math.abs(qty[i] * price[i] - disc[i] - total[i]) < 0.005)],
  ['subscription orders carry exactly 10% off', ORDERS.every((r, i) => r[ORDER_COLUMNS.indexOf('subscription')] !== 'yes' || Math.abs(disc[i] - r2(qty[i] * price[i] * 0.1)) < 0.005)],
  ['every product sold is on the price list at its shop price', ORDERS.every((r, i) => PRODUCTS.some((p) => p[0] === r[ORDER_COLUMNS.indexOf('product')] && p[3] === price[i]))],
  ['House Blend 250 g costs $8.00, F02’s cost before the autumn rises', costOf('House Blend 250g') === 8],
  ['76 catering events, $62,320 (F02)', EVENTS.length === F02.catering.events && sum(inv) === F02.catering.events * F02.catering.average],
  ['Meridian conference = F01 m8', ev('EV-001')[2] === 'Meridian Partners' && ev('EV-001')[1] === march('m8').date && ev('EV-001')[9] === march('m8').lines[0].dr],
  ['Harbor Tech’s prepaid events: 26 March, 9 and 23 April at $800 (F01 m6)', ['2026-03-26', '2026-04-09', '2026-04-23'].every((d) => EVENTS.some((r) => r[1] === d && r[2] === 'Harbor Tech' && r[9] === 800)) && march('m6').lines[0].dr === 2_400],
  ['Pier Nine breakfast on 31 March, $600 (F01 a7)', EVENTS.some((r) => r[1] === '2026-03-31' && r[2] === 'Pier Nine Studio' && r[9] === 600)],
  ['March catering = $5,600 (F01)', sum(EVENTS.filter((r) => r[1] < '2026-04-01').map((r) => r[9])) === 5_600],
  ['18 catering clients (M01)', new Set(ecol('client')).size === M01.catering.clients],
  ['about $9 a head (M01)', Math.abs(sum(inv) / sum(guests.map((g, i) => g * days[i])) - M01.catering.pricePerHead) < 0.5],
  ['every invoice within $150 of its quote', EVENTS.every((r, i) => Math.abs(inv[i] - quote(guests[i], hours[i], pastries[i], days[i])) <= 150)],
  ['courier per order = F02 shipping ÷ the year’s orders', Math.abs(F02.shipping / (ORDERS.length + B01_SHOP.webOrders.reduce((s, x, i) => s + x + B01_SHOP.appOrders[i], 0)) - SHOP_MODEL.courier) < 0.005],
  ['product cost share ≈ F02 cost of goods ÷ net sales', Math.abs(F02.inventory.cogsPerpetual / (F02.shop.sales - F02.shop.refunds) - SHOP_MODEL.costShare) < 0.005],
  ['fee rate ≈ F02 card and platform fees ÷ what customers paid', Math.abs(F02.shop.cardFees / (F02.shop.sales + F02.shop.prepaidSubscriptions) - SHOP_MODEL.feeRate) < 0.001],
  ['free delivery over $35 (B01)', DELIVERY.freeOver === 35 && DELIVERY_BANDS[0][1] === DELIVERY.charge],
  ['the stock plan has a whole-bag optimum', spInt.ok && spInt.x.every(Number.isInteger)],
  ['Goal Seek agrees with fixed ÷ contribution per order', Math.abs(goalSeek(shop, { target: 'B15', goal: 0, changing: 'B3' }).value - SHOP_MODEL.fixed / perOrder) < 1e-6],
];
