// case.js — the M06 Customer Analytics and RFM story: Lantern Coffee Co. in January 2028, looking back at 2027's
// customers. One source of truth for every figure M06's lessons, exercises, assessments and project use. Every name and
// number is invented for teaching; tools/study/m06-data.py generates the data with its behaviour planted (the header
// there lists it), so each method can be checked against what is known to be true.
//
// LESSONS: the cafés' loyalty-app members, a noncontractual setting (nobody tells Lantern they have stopped coming).
// All 2,584 members who joined at Harbourside or Millbrook from 1 March to 31 December 2027, and their 19,458 visits
// with the app (the first is the join, at the till). Lessons analyse them as of 31 December 2027; churn prediction uses
// what was known on 31 October and whether each member came back in November–December.
// PROJECT (lessons, exercises and module tests must not use it): the online shop's coffee subscriptions, a
// contractual setting. Every subscription from 1 March 2026 to 31 December 2027 and the 2027 save-offer test.
//
// Agrees with other courses (checked in IDENTITIES): each day's joins at each café are B05's log (the rise in
// loyalty_members); the October joiners are B06's 225 members (café, day, near, notifications, first ticket, and B06's
// "returned" is a visit within 30 days); members' visits and spend fit inside each café-day's transactions and sales
// (B05); the 27 spring 2026 subscribers are B03's (IDs, start, product, quantity and 90%-of-list price); 120
// subscribers on 31 December 2026 (B04's December survey invited all 120); in 2027 the joins, cancellations and active
// subscribers in every week are B05's (100 joins, 52 cancellations, 168 at the end); prices, costs and the $5.20
// parcel are B03's.
import { MEMBER_COLUMNS, MEMBERS, VISITS, SUB_COLUMNS, SUBSCRIPTIONS, REQUEST_COLUMNS, REQUESTS, SAVE_TEST_START } from './data.js?v=25';
import { CAFE_COLUMNS, CLEAN_ROWS, SHOP_COLUMNS, SHOP_WEEKS } from '../b05/case.js?v=25';
import { MEMBER_COLUMNS as B06_COLS, MEMBERS as B06_MEMBERS } from '../b06/case.js?v=25';
import { ORDER_COLUMNS as B03_COLS, ORDERS as B03_ORDERS, PRODUCTS, SHOP_MODEL } from '../b03/case.js?v=25';
import { SUBSCRIBER_SURVEY } from '../b04/case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

export { MEMBER_COLUMNS, SUB_COLUMNS, REQUEST_COLUMNS, SAVE_TEST_START };
const { dayNum, isoDay } = CU;
const r2 = (x) => Math.round(x * 100) / 100;

// ================================================================ lessons: members and visits
const START = dayNum('2027-03-01');
export const AS_OF = dayNum('2027-12-31');             // the lessons' analysis date (inclusive)
export const CALIBRATION_END = dayNum('2027-10-31');    // churn prediction: what was known then …
export const HOLDOUT = [dayNum('2027-11-01'), dayNum('2027-12-31')];   // … and whether the member came back in this window
const mAt = (n) => MEMBER_COLUMNS.indexOf(n);
const B36 = (s) => parseInt(s, 36);
/** Members as objects: id, cafe, joined (day number), joinedIso, near, notifications, b06 (B06's id or ''). */
export const MEMBER_LIST = MEMBERS.map((r) => ({ id: r[mAt('member')], cafe: r[mAt('cafe')], joinedIso: r[mAt('joined')], joined: dayNum(r[mAt('joined')]),
  near: r[mAt('near')], notifications: r[mAt('notifications')], b06: r[mAt('b06')] }));
/** Every visit: { id, day (day number), date, amount ($), cafe }. In member order, then by day. */
export const VISIT_LIST = MEMBERS.flatMap((r, i) => {
  const code = VISITS[i], out = [];
  for (let k = 0; k < code.length; k += 6) {
    const d = START + B36(code.slice(k, k + 2));
    out.push({ id: r[mAt('member')], day: d, date: isoDay(d), amount: B36(code.slice(k + 2, k + 5)) / 20, cafe: code[k + 5] === 'h' ? 'Harbourside' : 'Millbrook' });
  }
  return out;
});
const byId = new Map(MEMBER_LIST.map((m) => [m.id, m]));
/** Visits up to and including a day (default the analysis date), optionally for members who joined at one café. */
export const visits = ({ asOf = AS_OF, cafe = null, joinedBy = null } = {}) => VISIT_LIST.filter((v) => v.day <= asOf
  && (!cafe || byId.get(v.id).cafe === cafe) && (joinedBy == null || byId.get(v.id).joined <= joinedBy));
/** Customer summaries (core/customer.js summarise) for members, with their attributes attached. */
export function members({ asOf = AS_OF, cafe = null, joinedBy = null } = {}) {
  return CU.summarise(visits({ asOf, cafe, joinedBy }), { asOf }).map((c) => ({ ...byId.get(c.id), ...c, id: c.id }));
}
/** Member joins as a Map id → join day (for cohort tables), optionally for one café. */
export const joinMap = ({ cafe = null } = {}) => new Map(MEMBER_LIST.filter((m) => !cafe || m.cafe === cafe).map((m) => [m.id, m.joined]));
/** Input for core/customer.js lapseTimes and the `survival` widget's `lapse`: { joins: { id: join day }, visits: { id:
 *  [visit days] }, end } for members (optionally of one café) up to `asOf`. */
export function lapseData({ asOf = AS_OF, cafe = null } = {}) {
  const joins = {}, v = {};
  for (const m of MEMBER_LIST) if ((!cafe || m.cafe === cafe) && m.joined <= asOf) { joins[m.id] = m.joined; v[m.id] = []; }
  for (const x of VISIT_LIST) if (v[x.id] && x.day <= asOf) v[x.id].push(x.day);
  return { joins, visits: v, end: asOf };
}
/** The churn-prediction table: members who joined by 31 August 2027, described as of 31 October, with `back` = 1 if
 *  they visited in November–December (and `lapsed` = 1 − back). */
export function churnTable() {
  const later = new Set(VISIT_LIST.filter((v) => v.day >= HOLDOUT[0] && v.day <= HOLDOUT[1]).map((v) => v.id));
  return members({ asOf: CALIBRATION_END, joinedBy: dayNum('2027-08-31') }).map((c) => ({ ...c, millbrook: c.cafe === 'Millbrook' ? 1 : 0,
    back: later.has(c.id) ? 1 : 0, lapsed: later.has(c.id) ? 0 : 1 }));
}

// ================================================================ project: subscriptions
const sAt = (n) => SUB_COLUMNS.indexOf(n), qAt = (n) => REQUEST_COLUMNS.indexOf(n);
const PROD = new Map(PRODUCTS.map((p) => [p[0], { price: p[3], cost: p[4] }]));
export const PARCEL = SHOP_MODEL.courier, FEE_RATE = SHOP_MODEL.feeRate;
export const DATA_END = dayNum('2027-12-31');
/** The next billing date: the same day of the next month, capped at the 28th (the shop's rule). */
export function nextBilling(iso, dom) {
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7), ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
  return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(dom, 28)).padStart(2, '0')}`;
}
/** Subscriptions as objects. billings = billing dates before cancellation (or up to 31 December 2027); deliveries =
 *  billings not skipped; periods = billings (months subscribed, the sBG's periods); cancelled = 1 if they cancelled. */
export const SUBS = SUBSCRIPTIONS.map((r) => {
  const start = r[sAt('start')], end = r[sAt('cancelled')] || null, skipped = r[sAt('skipped')] ? r[sAt('skipped')].split(' ') : [];
  const dom = +start.slice(8, 10), billings = [];
  for (let d = start; d <= '2027-12-31' && (!end || d < end); d = nextBilling(d, dom)) billings.push(d);
  const p = PROD.get(r[sAt('product')]), qty = r[sAt('quantity')];
  return { id: r[sAt('subscriber')], start, channel: r[sAt('channel')], product: r[sAt('product')], quantity: qty, price: r[sAt('price')],
    cancelledOn: end, cancelled: end ? 1 : 0, skipped, billings, deliveries: billings.filter((d) => !skipped.includes(d)).length,
    periods: billings.length, unitCost: p.cost * qty, listPrice: p.price * qty };
});
/** Acquisition costs (fictional facts of the case): the 2026 relaunch offer halved the first month's price; a referral
 *  gives the existing subscriber and the friend $10 of shop credit each; shop and café sign-ups had no direct cost (B05's
 *  2027 paid social spend promoted the whole shop and can't be traced to subscriptions). Ana discounts future margins at
 *  10% a year. */
export const ACQUISITION = { offerShare: 0.5, referralCredit: 10, referralSides: 2 };
export const DISCOUNT_YEAR = 0.10;
export const DISCOUNT_MONTH = (1 + DISCOUNT_YEAR) ** (1 / 12) - 1;
/** Margin per delivered month: price − product cost − the $5.20 parcel − card fees at 3.5% of the price. */
export const marginOf = (s) => s.price - s.unitCost - PARCEL - FEE_RATE * s.price;
/** Active subscribers on a date (started on or before it and not yet cancelled). */
export const activeOn = (iso) => SUBS.filter((s) => s.start <= iso && (!s.cancelledOn || s.cancelledOn > iso)).length;
/** The save-offer test's requests: { id, date, offered (1 = shown the skip offer), outcome, saved }. */
export const SAVE_REQUESTS = REQUESTS.map((r) => ({ id: r[qAt('subscriber')], date: r[qAt('requested')], offered: r[qAt('offered_skip')], outcome: r[qAt('outcome')], saved: r[qAt('outcome')] === 'cancelled' ? 0 : 1 }));
/** sBG cohorts by start month: for each, the number still subscribed after 0, 1, 2, … billing periods, observed only as
 *  far as every member of the cohort could have reached by 31 December 2027. */
export function subCohorts({ channel = null, from = '2026-03', to = '2027-12' } = {}) {
  const groups = new Map();
  for (const s of SUBS) { const m = s.start.slice(0, 7); if ((channel && s.channel !== channel) || m < from || m > to) continue; (groups.get(m) || groups.set(m, []).get(m)).push(s); }
  return [...groups.entries()].sort().map(([month, ss]) => {
    const T = Math.min(...ss.map((s) => (s.cancelled ? Infinity : s.periods)));     // periods every censored member reached
    const reach = Number.isFinite(T) ? T : Math.max(...ss.map((s) => s.periods));
    const alive = Array.from({ length: reach + 1 }, (_, t) => ss.filter((s) => !s.cancelled || s.periods > t).length);
    return { month, size: ss.length, alive };
  });
}

// ================================================================ derived figures and identities
const lessons = members();
export const DERIVED = {
  members: MEMBER_LIST.length, visits: VISIT_LIST.length, spend: r2(VISIT_LIST.reduce((s, v) => s + v.amount, 0)),
  base: CU.baseMetrics(lessons),
  subscriptions: SUBS.length, active2026: activeOn('2026-12-31'), active2027: activeOn('2027-12-31'),
  joins2027: SUBS.filter((s) => s.start >= '2027-01-01').length, cancels2027: SUBS.filter((s) => s.cancelledOn && s.cancelledOn >= '2027-01-01').length,
  requests: SAVE_REQUESTS.length, saves: SAVE_REQUESTS.filter((r) => r.saved).length,
};

const cAt = (n) => CAFE_COLUMNS.indexOf(n), wAt = (n) => SHOP_COLUMNS.indexOf(n), oAt = (n) => B03_COLS.indexOf(n), bAt = (n) => B06_COLS.indexOf(n);
const logBy = new Map(CLEAN_ROWS.map((r) => [`${r[cAt('date')]}|${r[cAt('cafe')]}`, r]));
const cafeDay = new Map();
for (const v of VISIT_LIST) { const k = `${v.date}|${v.cafe}`, c = cafeDay.get(k) || { n: 0, s: 0 }; c.n++; c.s += v.amount; cafeDay.set(k, c); }
const prevMembers = (r) => { const d = isoDay(dayNum(r[cAt('date')]) - 1), p = logBy.get(`${d}|${r[cAt('cafe')]}`); return p ? p[cAt('loyalty_members')] : 0; };
const firstVisit = new Map(); for (const v of VISIT_LIST) if (!firstVisit.has(v.id)) firstVisit.set(v.id, v);
const springSubs = new Map();
for (const o of B03_ORDERS) { if (o[oAt('subscription')] !== 'yes') continue; const id = o[oAt('customer_id')], s = springSubs.get(id); if (!s || o[oAt('order_date')] < s.start) springSubs.set(id, { start: o[oAt('order_date')], product: o[oAt('product')], qty: o[oAt('quantity')], total: o[oAt('order_total')] }); }
const weekEnd = (w) => isoDay(dayNum(w[wAt('starts')]) + w[wAt('days')] - 1);

export const IDENTITIES = [
  ['each café-day’s joins are B05’s rise in loyalty_members', CLEAN_ROWS.every((r) => MEMBER_LIST.filter((m) => m.joinedIso === r[cAt('date')] && m.cafe === r[cAt('cafe')]).length === r[cAt('loyalty_members')] - prevMembers(r))],
  ['2,584 members: B05’s year-end totals at the two cafés', MEMBER_LIST.length === CLEAN_ROWS.filter((r) => r[cAt('date')] === '2027-12-31').reduce((s, r) => s + r[cAt('loyalty_members')], 0)],
  ['every member’s first visit is the join, at their café', MEMBER_LIST.every((m) => { const f = firstVisit.get(m.id); return f && f.day === m.joined && f.cafe === m.cafe; })],
  ['visits run 1 March – 31 December 2027, in order for each member', VISIT_LIST.every((v, i) => v.day >= START && v.day <= AS_OF && (i === 0 || VISIT_LIST[i - 1].id !== v.id || VISIT_LIST[i - 1].day < v.day))],
  ['members’ visits and spend fit inside each café-day’s transactions and sales (at most 65%)', [...cafeDay.entries()].every(([k, c]) => { const r = logBy.get(k); return c.n <= 0.65 * r[cAt('transactions')] && c.s <= 0.65 * r[cAt('sales')] + 1e-9; })],
  ['the October joiners are B06’s 225 members, in order', (() => { const oct = MEMBER_LIST.filter((m) => m.joinedIso.startsWith('2027-10')); return oct.length === B06_MEMBERS.length && oct.every((m, i) => m.b06 === B06_MEMBERS[i][bAt('member')]); })()],
  ['B06’s café, day, near and notifications match', MEMBER_LIST.filter((m) => m.b06).every((m, i) => { const b = B06_MEMBERS[i]; return b[bAt('cafe')] === m.cafe && b[bAt('joined')] === m.joinedIso && b[bAt('near')] === m.near && b[bAt('notifications')] === m.notifications; })],
  ['B06’s first ticket is the join visit’s spend', MEMBER_LIST.filter((m) => m.b06).every((m, i) => Math.abs(firstVisit.get(m.id).amount - B06_MEMBERS[i][bAt('first_ticket')]) < 1e-9)],
  ['B06’s “returned” = another visit within 30 days of joining', MEMBER_LIST.filter((m) => m.b06).every((m, i) => (VISIT_LIST.some((v) => v.id === m.id && v.day > m.joined && v.day <= m.joined + 30) ? 1 : 0) === B06_MEMBERS[i][bAt('returned')])],
  ['the 27 spring 2026 subscribers are B03’s: ID, start, product, quantity and price', springSubs.size === 27 && [...springSubs.entries()].every(([id, b]) => { const s = SUBS.find((x) => x.id === id); return s && s.start === b.start && s.product === b.product && s.quantity === b.qty && Math.abs(s.price - b.total) < 0.005; })],
  ['all 27 were still subscribed at the end of June 2026 (B03 shows their orders into June)', [...springSubs.keys()].every((id) => { const s = SUBS.find((x) => x.id === id); return !s.cancelledOn || s.cancelledOn > '2026-06-30'; })],
  ['every price is 90% of list (half the first month on the relaunch offer is a discount, not a price)', SUBS.every((s) => Math.abs(s.price - r2(0.9 * s.listPrice)) < 0.005)],
  ['120 subscribers on 31 December 2026: B04’s December survey invited all 120', activeOn('2026-12-31') === SUBSCRIBER_SURVEY.invited],
  ['each 2027 week’s joins are B05’s new_subscribers', SHOP_WEEKS.every((w) => SUBS.filter((s) => s.start >= w[wAt('starts')] && s.start <= weekEnd(w)).length === w[wAt('new_subscribers')])],
  ['active subscribers at the end of each 2027 week are B05’s', SHOP_WEEKS.every((w) => activeOn(weekEnd(w)) === w[wAt('active_subscribers')])],
  ['2027: 100 joins, 52 cancellations, 168 at the end', DERIVED.joins2027 === 100 && DERIVED.cancels2027 === 52 && DERIVED.active2027 === 168],
  ['the save-offer test starts on 1 March 2027 and every request is a subscriber’s', SAVE_REQUESTS.every((q) => q.date >= SAVE_TEST_START && SUBS.some((s) => s.id === q.id))],
  ['a cancelled request is that subscription’s cancellation; a save is a skipped delivery', SAVE_REQUESTS.every((q) => { const s = SUBS.find((x) => x.id === q.id); return q.saved ? s.skipped.some((d) => d >= q.date) : s.cancelledOn === q.date; })],
  ['every 2027 cancellation from 1 March went through the test', SUBS.filter((s) => s.cancelledOn && s.cancelledOn >= SAVE_TEST_START).every((s) => SAVE_REQUESTS.some((q) => q.id === s.id && !q.saved && q.date === s.cancelledOn))],
  ['nobody was offered a skip without being in the offer arm', SAVE_REQUESTS.every((q) => !q.saved || q.offered === 1)],
];
