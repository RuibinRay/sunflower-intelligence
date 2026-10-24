// case.js — the B04 Descriptive and Inferential Statistics story: Ana Lim's questions at Lantern Coffee Co. from
// October 2026 to January 2027, answered with statistics. One source of truth for every figure B04's lessons,
// exercises, assessments and project use. Every name and number is invented for teaching.
//
// The story: B01 reviewed the relaunched online shop month by month (July–December 2026), B02 cleaned the March–June
// export and B03 analysed it in Excel. Ana now wants to know which of her numbers are signal and which are noise: is a
// month's dip real, are Kilnworth's 1 kg bags filled as promised, does the app attract subscribers, which catering events
// earn more per guest. The lessons use B03's spring orders and catering events, B01's monthly figures and survey, and
// three small new samples (Kilnworth's 1 kg bags, catering set-up times, a workshop's latte-art scores). The project
// (January 2027) uses data the lessons never touch: a courier trial, the November gift-box email test, workshop
// satisfaction by format and a subscriber survey.
//
// Agrees with other courses (checked in IDENTITIES): b03's 231 spring orders ($9,096.15) and 76 catering events
// ($62,320); b01's monthly visits and orders, the September survey (79 replies, 61 would recommend) and the 3.0%
// conversion target; b03's courier cost of $5.20 a parcel.
import { ORDER_COLUMNS, ORDERS, EVENT_COLUMNS, EVENTS, PRODUCTS, SHOP_MODEL, tableCells, DERIVED as B03 } from '../b03/case.js?v=12';
import { SHOP, SURVEY, MONTHS, TARGETS } from '../b01/case.js?v=12';
import {
  KG_BAGS, SETUP_MINUTES, LATTE_PRE, LATTE_POST, SWIFTLINE_DAYS, PARCELBIRD_DAYS, WORKSHOP_IN_PERSON, WORKSHOP_ONLINE, WORKSHOP_HYBRID,
} from './data.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, sd, variance, median, quantile, skewness, kurtosis } from '../../../core/stats.js?v=12';

export { ORDER_COLUMNS, ORDERS, EVENT_COLUMNS, EVENTS, PRODUCTS, tableCells, SHOP, SURVEY, MONTHS, TARGETS };
export { KG_BAGS, SETUP_MINUTES, LATTE_PRE, LATTE_POST };

const r2 = (x) => Math.round(x * 100) / 100;
const col = (name) => ORDERS.map((r) => r[ORDER_COLUMNS.indexOf(name)]);
const ecol = (name) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(name)]);

// ---------------------------------------------------------------- the spring orders (B03), as B04 uses them
/** The 231 order values ($), in order_id order. */
export const ORDER_VALUES = col('order_total');
/** 1 for a subscription order, 0 for a one-off order (for proportions and the sampling widget). */
export const SUBSCRIPTION_FLAGS = col('subscription').map((v) => (v === 'yes' ? 1 : 0));
/** Star ratings of the 154 rated orders (77 orders were not rated). */
export const RATINGS = col('rating').filter((v) => v !== '' && v != null);
const dates = col('order_date');
/** The 122 days of 1 March – 30 June 2026 and the number of shop orders placed on each. */
export const SPRING_DAYS = Array.from({ length: 122 }, (_, i) => new Date(Date.UTC(2026, 2, 1 + i)).toISOString().slice(0, 10));
export const ORDERS_PER_DAY = SPRING_DAYS.map((d) => dates.filter((x) => x === d).length);
/** Orders by weekday (Monday first) and how many of each weekday the period contains. */
const WD = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const wdOf = (iso) => (new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7;
export const WEEKDAYS = {
  names: WD,
  orders: WD.map((_, k) => dates.filter((d) => wdOf(d) === k).length),
  days: WD.map((_, k) => SPRING_DAYS.filter((d) => wdOf(d) === k).length),
};
/** Channel × subscription counts: rows web, app; columns subscription yes, no. */
const chan = col('channel'), sub = col('subscription'), region = col('region'), rating = col('rating');
export const CHANNEL_SUBSCRIPTION = {
  rows: ['web', 'app'], cols: ['subscription', 'one-off'],
  counts: ['web', 'app'].map((c) => ['yes', 'no'].map((s) => chan.filter((x, i) => x === c && sub[i] === s).length)),
};
/** Rated orders: five stars or fewer, by channel (rows web, app; columns 5 stars, 1–4 stars). */
export const RATING_BY_CHANNEL = {
  rows: ['web', 'app'], cols: ['5 stars', '1–4 stars'],
  counts: ['web', 'app'].map((c) => [5, 'less'].map((k) => chan.filter((x, i) => x === c && rating[i] !== '' && rating[i] != null && (k === 5 ? rating[i] === 5 : rating[i] < 5)).length)),
};
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
export const REGION_SUBSCRIPTION = {
  rows: REGIONS, cols: ['subscription', 'one-off'],
  counts: REGIONS.map((g) => ['yes', 'no'].map((s) => region.filter((x, i) => x === g && sub[i] === s).length)),
};

// ---------------------------------------------------------------- the catering events (B03)
/** Invoice per guest-day ($) for each event, grouped by event type (a two-day event counts its guests twice). */
const etype = ecol('event_type'), einv = ecol('invoice'), eg = ecol('guests'), edays = ecol('days');
export const EVENT_TYPES = [...new Set(etype)];
export const PER_GUEST_BY_TYPE = Object.fromEntries(EVENT_TYPES.map((t) => [t, EVENTS.map((_, i) => i).filter((i) => etype[i] === t).map((i) => r2(einv[i] / (eg[i] * edays[i])))]));

// ---------------------------------------------------------------- new lesson data
/** Kilnworth Roasting's specification for its 1 kg bags: the filling machine is set to 1,004 g with an SD of 3 g. */
export const KILNWORTH_1KG = { label: 1000, setting: 1004, sd: 3 };
/** B01's September dip: web visits and orders, August against September. */
export const CONVERSION = { aug: { visits: SHOP.webVisits[1], orders: SHOP.webOrders[1] }, sep: { visits: SHOP.webVisits[2], orders: SHOP.webOrders[2] }, target: TARGETS.conversion / 100 };

// ---------------------------------------------------------------- the project (lessons must not use these)
/** The November–December 2026 courier trial: business days to delivery, and the price per parcel. Late = more than 3 days. */
export const COURIER_TRIAL = {
  swiftline: { name: 'Swiftline', days: SWIFTLINE_DAYS, price: SHOP_MODEL.courier },
  parcelbird: { name: 'Parcelbird', days: PARCELBIRD_DAYS, price: 5.65 },
  lateAfter: 3,
};
/** The 12 November gift-box email: three subject lines, each sent to 1,500 customers chosen at random; gift-box orders within a week. */
export const EMAIL_TEST = {
  sent: 1500,
  lines: [
    { id: 'A', subject: 'Gift boxes are back', orders: 41 },
    { id: 'B', subject: 'Your coffee lover’s gift, sorted', orders: 58 },
    { id: 'C', subject: 'Free delivery on gift boxes until 15 December', orders: 47 },
  ],
};
/** Workshop satisfaction (0–10) by format, 2026. */
export const WORKSHOP_SCORES = { 'In person': WORKSHOP_IN_PERSON, Online: WORKSHOP_ONLINE, Hybrid: WORKSHOP_HYBRID };
/** The December subscriber survey: “Would you rather receive your coffee every two weeks instead of monthly?” */
export const SUBSCRIBER_SURVEY = { invited: 520, responded: 312, fortnightly: 187 };
/** Ana's plan for a 2027 customer survey: a proportion to within ±4 points at 95%, expecting 30% of those invited to reply. */
export const SURVEY_PLAN = { margin: 0.04, conf: 0.95, responseRate: 0.3 };

// ---------------------------------------------------------------- derived figures (recomputed by the checker)
const perDayCounts = Array.from({ length: Math.max(...ORDERS_PER_DAY) + 1 }, (_, k) => ORDERS_PER_DAY.filter((x) => x === k).length);
const lambda = ORDERS.length / SPRING_DAYS.length;
const daysShare = WEEKDAYS.days.map((d) => d / SPRING_DAYS.length);
const bulkZ = (Math.max(...ORDER_VALUES) - mean(ORDER_VALUES)) / sd(ORDER_VALUES);
const swift = SWIFTLINE_DAYS, pbird = PARCELBIRD_DAYS;
const late = (xs) => xs.filter((x) => x > COURIER_TRIAL.lateAfter).length;
const ws = Object.values(WORKSHOP_SCORES);
const nPlan = I.sampleSizeProp(SURVEY_PLAN.margin, SURVEY_PLAN.conf);

export const DERIVED = {
  orders: {
    n: ORDER_VALUES.length, mean: mean(ORDER_VALUES), median: median(ORDER_VALUES), sd: sd(ORDER_VALUES), sdPop: sd(ORDER_VALUES, 0),
    q1: quantile(ORDER_VALUES, 0.25), q3: quantile(ORDER_VALUES, 0.75), skewness: skewness(ORDER_VALUES), kurtosis: kurtosis(ORDER_VALUES),
    max: Math.max(...ORDER_VALUES), min: Math.min(...ORDER_VALUES), bulkZ,
    subscriptionShare: mean(SUBSCRIPTION_FLAGS), subscriptions: SUBSCRIPTION_FLAGS.filter((x) => x === 1).length,
    rated: RATINGS.length, meanRating: mean(RATINGS), fiveStar: RATINGS.filter((x) => x === 5).length,
  },
  perDay: { lambda, counts: perDayCounts, expected: perDayCounts.map((_, k) => SPRING_DAYS.length * I.poissonPmf(k, lambda)) },
  weekdays: I.chisqGof(WEEKDAYS.orders, daysShare),
  channelSubscription: I.chisqIndependence(CHANNEL_SUBSCRIPTION.counts),
  ratingByChannel: I.chisqIndependence(RATING_BY_CHANNEL.counts),
  regionSubscription: I.chisqIndependence(REGION_SUBSCRIPTION.counts),
  kg: {
    n: KG_BAGS.length, mean: mean(KG_BAGS), sd: sd(KG_BAGS), underLabel: KG_BAGS.filter((x) => x < KILNWORTH_1KG.label).length,
    pUnderSpec: I.normal.cdf(KILNWORTH_1KG.label, KILNWORTH_1KG.setting, KILNWORTH_1KG.sd),
    vsSetting: I.tTest1(KG_BAGS, KILNWORTH_1KG.setting, { alternative: 'less' }), vsLabel: I.tTest1(KG_BAGS, KILNWORTH_1KG.label, { alternative: 'greater' }),
    ci: I.ciMean(KG_BAGS),
  },
  setup: I.ciMean(SETUP_MINUTES),
  latte: { paired: I.tTestPaired(LATTE_POST, LATTE_PRE), unpaired: I.tTest2(LATTE_POST, LATTE_PRE), diffs: LATTE_POST.map((x, i) => x - LATTE_PRE[i]) },
  conversion: {
    aug: CONVERSION.aug.orders / CONVERSION.aug.visits, sep: CONVERSION.sep.orders / CONVERSION.sep.visits,
    test: I.propTest2(CONVERSION.aug.orders, CONVERSION.aug.visits, CONVERSION.sep.orders, CONVERSION.sep.visits),
    sepVsTarget: I.propTest1(CONVERSION.sep.orders, CONVERSION.sep.visits, CONVERSION.target, { alternative: 'less' }),
  },
  survey: { recommend: I.ciProp(SURVEY.wouldRecommend.yes, SURVEY.responses), responseRate: SURVEY.responses / SURVEY.sent },
  eventTypes: { anova: I.anova1(EVENT_TYPES.map((t) => PER_GUEST_BY_TYPE[t])), means: Object.fromEntries(EVENT_TYPES.map((t) => [t, mean(PER_GUEST_BY_TYPE[t])])) },
  project: {
    courier: {
      swift: { n: swift.length, mean: mean(swift), sd: sd(swift), late: late(swift) }, pbird: { n: pbird.length, mean: mean(pbird), sd: sd(pbird), late: late(pbird) },
      welch: I.tTest2(swift, pbird), pooled: I.tTest2(swift, pbird, { equalVar: true }),
      lateTest: I.propTest2(late(swift), swift.length, late(pbird), pbird.length),
      extraCostPerParcel: r2(COURIER_TRIAL.parcelbird.price - COURIER_TRIAL.swiftline.price),
      powerHalfDay: I.powerMean({ delta: 0.5, sigma: Math.sqrt((variance(swift) + variance(pbird)) / 2), n: 60, twoSample: true }),
      nForQuarterDay: I.sampleSizeForPower({ delta: 0.25, sigma: Math.sqrt((variance(swift) + variance(pbird)) / 2), twoSample: true }),
    },
    email: {
      rates: EMAIL_TEST.lines.map((l) => l.orders / EMAIL_TEST.sent),
      chi: I.chisqIndependence([EMAIL_TEST.lines.map((l) => l.orders), EMAIL_TEST.lines.map((l) => EMAIL_TEST.sent - l.orders)]),
      bVsA: I.propTest2(EMAIL_TEST.lines[1].orders, EMAIL_TEST.sent, EMAIL_TEST.lines[0].orders, EMAIL_TEST.sent),
    },
    workshops: { anova: I.anova1(ws), means: ws.map(mean), sds: ws.map((x) => sd(x)) },
    subscribers: { ci: I.ciProp(SUBSCRIBER_SURVEY.fortnightly, SUBSCRIBER_SURVEY.responded), responseRate: SUBSCRIBER_SURVEY.responded / SUBSCRIBER_SURVEY.invited },
    surveyPlan: { n: nPlan, invite: Math.ceil(nPlan / SURVEY_PLAN.responseRate - 1e-9) },
  },
};

export const IDENTITIES = [
  ['231 spring orders worth $9,096.15 (B03)', ORDER_VALUES.length === B03.orders && r2(ORDER_VALUES.reduce((a, b) => a + b, 0)) === B03.orderValue],
  ['154 rated orders (B03)', RATINGS.length === B03.rated],
  ['every order falls on one of the 122 spring days', ORDERS_PER_DAY.reduce((a, b) => a + b, 0) === ORDERS.length],
  ['weekday orders add to 231 and weekdays to 122 days', WEEKDAYS.orders.reduce((a, b) => a + b, 0) === 231 && WEEKDAYS.days.reduce((a, b) => a + b, 0) === 122],
  ['channel × subscription table covers every order', CHANNEL_SUBSCRIPTION.counts.flat().reduce((a, b) => a + b, 0) === 231],
  ['76 catering events, $62,320 (B03, F02)', EVENTS.length === B03.events && einv.reduce((a, b) => a + b, 0) === B03.eventValue],
  ['B01: August and September web orders and visits', CONVERSION.aug.orders === 224 && CONVERSION.sep.visits === 8_800],
  ['B01 survey: 61 of 79 would recommend', SURVEY.responses === 79 && SURVEY.wouldRecommend.yes === 61],
  ['Swiftline charges B03’s $5.20 a parcel', COURIER_TRIAL.swiftline.price === 5.2],
  ['each email line sent to 1,500 customers', EMAIL_TEST.lines.length === 3 && EMAIL_TEST.sent === 1500],
  ['subscriber survey: replies within invitations', SUBSCRIBER_SURVEY.responded <= SUBSCRIBER_SURVEY.invited && SUBSCRIBER_SURVEY.fortnightly <= SUBSCRIBER_SURVEY.responded],
  ['latte scores paired (12 and 12)', LATTE_PRE.length === 12 && LATTE_POST.length === 12],
];
