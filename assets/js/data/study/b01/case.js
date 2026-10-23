// case.js — the B01 Introduction to Business Analytics story: Lantern Coffee Co.'s online shop in the second half of
// 2026 (July–December), after the March–June export that B02 cleans (assets/data/study/lantern-orders.csv). One source
// of truth for every figure B01's lessons, exercises, assessments and project use. Every name and number is invented.
//
// The story: Ana Lim's Lantern Coffee sells beans, a cold-brew pack and gift boxes online, through its website ("web")
// and its app, alongside its catering and workshops (F01). From July 2026 she reviews the shop each month. On
// 1 September a redesigned website checkout went live; on 5 October a fix for a payment-page bug on mobile browsers
// was released. November and December bring gift-box orders.
//
// Scale: the March–June export B02 cleans has 240 orders, about 60 a month. On 1 July Lantern relaunched the shop with
// free delivery over $35 and a subscription offer, and monthly orders rose to about five times that pace (294 in July).

/** The shop's order system stamps times in UTC; Lantern's local time is five hours behind (the same assumption as B02). */
export const UTC_OFFSET_HOURS = -5;

export const MONTHS = ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'];

/** Sessions (visits) and orders by channel, and average order value (AOV, $) per month. */
export const SHOP = {
  webVisits: [7_400, 7_700, 8_800, 8_300, 10_400, 12_500],
  appVisits: [2_400, 2_500, 2_600, 2_700, 3_200, 3_700],
  webOrders: [205, 224, 158, 222, 322, 446],
  appOrders: [89, 92, 93, 97, 113, 137],
  aov: [41.2, 40.8, 41.5, 42.1, 47.9, 55.3],
  newCustomers: [182, 190, 141, 188, 291, 414],        // first-time buyers among the month's orders
  avgRating: [4.4, 4.4, 4.1, 4.3, 4.4, 4.5],           // mean rating of that month’s orders (1–5 stars)
  ratingsGiven: [118, 126, 97, 124, 161, 199],         // how many orders were rated
  giftBoxOrders: [6, 7, 5, 9, 88, 231],
};

/** A survey e-mailed on 1 October to the 240 customers who ordered in September (some ordered twice), fictional. */
export const SURVEY = {
  sent: 240, responses: 79,
  checkoutEasy: { agree: 44, neutral: 17, disagree: 18 },      // “The new checkout was easy to use” (all 79 respondents answered; app buyers too, though they never saw it)
  wouldRecommend: { yes: 61, no: 18 },
};

/** Ana's targets for the shop, set in July 2026. */
export const TARGETS = { conversion: 3.0, aov: 45, monthlyRevenue: 15_000, returningShare: 35 };

// ---------------------------------------------------------------- derived (recomputed by the checker)
const sum = (a, b) => a.map((x, i) => x + b[i]);
const visits = sum(SHOP.webVisits, SHOP.appVisits);
const orders = sum(SHOP.webOrders, SHOP.appOrders);
export const DERIVED = {
  visits,                                                            // 9,800 10,200 11,400 11,000 13,600 16,200
  orders,                                                            // 294 316 251 319 435 583
  conversion: orders.map((o, i) => (o / visits[i]) * 100),           // % : 3.00 3.10 2.20 2.90 3.20 3.60
  webConversion: SHOP.webOrders.map((o, i) => (o / SHOP.webVisits[i]) * 100),   // 2.77 2.91 1.80 2.67 3.10 3.57
  appConversion: SHOP.appOrders.map((o, i) => (o / SHOP.appVisits[i]) * 100),   // 3.71 3.68 3.58 3.59 3.53 3.70
  revenue: orders.map((o, i) => o * SHOP.aov[i]),                    // 12,112.80 12,892.80 10,416.50 13,429.90 20,836.50 32,239.90
  returningShare: orders.map((o, i) => ((o - SHOP.newCustomers[i]) / o) * 100),  // % of orders from returning customers
  ratingShare: orders.map((o, i) => (SHOP.ratingsGiven[i] / o) * 100),
};
