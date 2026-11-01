// assess-diagnostic.js — M06 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what M05 (needs-based segmentation, cluster analysis, profiling) or B04 and B06 (tests, intervals,
// logistic regression, classification tables) already teach, so that a student who knows only the prerequisites misses a
// module’s items and one who already has its method gets them right. Several distractors are what the prerequisites
// suggest (a mean of customers’ own averages, dividing by the customers who were active, a simple average of rates,
// linear scaling of a rate, a share of the customers seen to leave, a test statistic where a cost is asked for).
// Module 1: average order value as total spend ÷ total purchases, not the mean of customers’ averages (dg-1); a reversed
// recency score from quantile cut points, a value on a cut point staying in the more recent group (dg-2); how heavy ties
// make quantile groups unequal: the number scored F1 from PERCENTILE.INC cut points (dg-3).
// Module 2: the R × FM grid’s naming, with FM the rounded mean of F and M, halves up (dg-4); a cohort’s revenue per
// joiner, divided by the cohort’s size, not its active members (dg-5); the pooled share active in a month since joining,
// over only the cohorts observed that long and weighted by size (dg-6).
// Module 3: an annual retention rate turned into a constant monthly churn by compounding, 1 − r^(1/12), not ÷ 12 (dg-7);
// a Kaplan–Meier step with censored customers counted at risk until they leave observation (dg-8); a churn score’s lift,
// the top group’s rate ÷ the base rate (dg-9).
// Module 4: lifetime value under constant retention with the first margin now, m(1 + d) ÷ (1 + d − r) (dg-10); payback
// with retention, the month the expected cumulative margin covers the acquisition cost, against CAC ÷ margin (dg-11);
// an offer’s cost per extra customer in a randomised test, all redemptions ÷ the uplift over the holdout (dg-12).
// Every item is mc or num, which score 0 or 1, so the route can’t be passed on part marks; module 4 is not used for
// routing. Every business, person and number is fictional (no member data, so nothing here depends on how the case was
// generated), and none is a subscription like the project’s; every num item’s `check` recomputes its answer, and every
// figure an item shows is computed below with core/customer.js. New questions, not copies of lesson exercises, module
// tests, the final or the project. No hints; solutions are shown on review.
import * as CU from '../../../core/customer.js?v=25';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (v) => `$${fx(v, 2)}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const sum = (a) => a.reduce((s, v) => s + v, 0);

// dg-1 Tarnfold Books (fictional): four customers' orders and spend last year
const TB = [{ c: 'Customer A', n: 1, s: 96 }, { c: 'Customer B', n: 3, s: 84 }, { c: 'Customer C', n: 6, s: 108 }, { c: 'Customer D', n: 10, s: 132 }];
const tbAov = CU.baseMetrics(TB.map((r) => ({ frequency: r.n, monetary: r.s }))).aov;
const tbMeanOfMeans = sum(TB.map((r) => r.s / r.n)) / TB.length;
// dg-2 Wyndhurst Garden Centre (fictional): recency cut points (days) and one customer
const WG = { cuts: [14, 35, 70, 160], rec: 35 };
const wgR = CU.score([WG.rec], { method: 'cuts', cuts: WG.cuts, higherIsBetter: false })[0];
// dg-3 Brackenwick Cycles (fictional): twelve customers' purchases
const BC = [1, 1, 1, 1, 1, 2, 2, 3, 4, 6, 9, 15];
const bcF = CU.score(BC, { k: 5, method: 'quantile' });
const bcCuts = CU.cutPoints(BC, 5);
const bcF1 = bcF.filter((s) => s === 1).length;
// dg-4 a customer's scores
const SC = { R: 2, F: 5, M: 4 };
const scFM = Math.floor((SC.F + SC.M) / 2 + 0.5);                // as core/customer.js rfm() rounds FM
const scSeg = CU.segmentOf(SC.R, scFM);
// dg-5 Fellgate Climbing Wall (fictional): the January cohort in month 3
const FC = { size: 400, active: 150, spend: 2700 };
// dg-6 Hollinsby Swim School (fictional): three cohorts, month 2
const HS = [{ m: 'January', n: 400, a2: 120 }, { m: 'February', n: 100, a2: 60 }, { m: 'March', n: 250, a2: null }];
const hsObs = HS.filter((c) => c.a2 != null);
const hsPooled = sum(hsObs.map((c) => c.a2)) / sum(hsObs.map((c) => c.n));
// dg-7 Marlhurst Leisure Centre (fictional): annual retention
const ML = { r: 0.7 };
const mlMonthly = 1 - ML.r ** (1 / 12);
// dg-8 Selwick Riding School (fictional): eight new riders, months observed and whether they left
const SR = { t: [2, 4, 5, 5, 7, 9, 10, 12], e: [1, 0, 1, 0, 1, 0, 1, 0], at: 8 };
const srKM = CU.kaplanMeier(SR.t, SR.e);
const srS = srKM.at(SR.at);
const srDrop = (() => { const ev = SR.t.filter((_, i) => SR.e[i]); return ev.filter((t) => t > SR.at).length / ev.length; })();
const srNaive = SR.t.filter((t, i) => t > SR.at || !SR.e[i]).length / SR.t.length;
const srAsLeft = SR.t.filter((t) => t > SR.at).length / SR.t.length;
const srRiders = SR.t.map((t, i) => `${t} (${SR.e[i] ? 'left' : 'still riding'})`).join(', ');
// dg-9 Merriton Mobile (fictional): a churn score's top tenth
const MM = { n: 8000, left: 1200, top: 800, topLeft: 360 };
const mmLift = (MM.topLeft / MM.top) / (MM.left / MM.n);
// dg-10 Callowfield Boiler Cover (fictional): yearly plans
const CB = { m: 120, r: 0.8, d: 0.1 };
const cbV = CU.clvConstant({ ...CB, timing: 'start' }).value;
// dg-11 Elmscar Tool Library (fictional): monthly membership
const ET = { m: 20, r: 0.85, cac: 60 };
const etPay = CU.payback({ cac: ET.cac, m: ET.m, r: ET.r, d: 0 });
const etSimple = CU.simplePayback(ET.cac, ET.m);
const etCum = CU.clvConstant({ m: ET.m, r: ET.r, d: 0, timing: 'start' }).curve(etPay);
// dg-12 Gildersome Shoe Repairs (fictional): a randomised voucher test
const GS = { n: 1000, pT: 0.18, pC: 0.12, voucher: 6 };
const gsExtra = (GS.pT - GS.pC) * GS.n;
const gsCost = GS.pT * GS.n * GS.voucher;
const gsPerExtra = gsCost / gsExtra;

export const items = [
  // ================================================================ Module 1: customer data and RFM
  {
    id: 'm06-dg-1', lesson: 'customer-metrics', type: 'num', kind: 'numerical',
    prompt: 'Tarnfold Books (fictional) had four customers last year. What was the shop’s average order value? Give dollars to the cent.',
    data: { table: { head: ['Customer', 'Orders', 'Spend ($)'], align: ['l', 'r', 'r'], rows: TB.map((r) => [r.c, r.n, fx(r.s, 0)]) } },
    answer: rnd(tbAov, 2),
    check: () => (96 + 84 + 108 + 132) / (1 + 3 + 6 + 10),
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(tbMeanOfMeans, 2), say: 'That is the mean of each customer’s own average order. It gives the one-order customer as much weight as the ten-order one; the average order value divides total spend by total orders.' },
      { value: rnd(sum(TB.map((r) => r.s)) / TB.length, 2), say: 'That is spend per customer. Average order value divides by the number of orders, not of customers.' },
    ],
    solution: `Average order value = total spend ÷ total orders = $${sum(TB.map((r) => r.s))} ÷ ${sum(TB.map((r) => r.n))} = ${money(tbAov)}. The mean of the four customers’ own averages, ${money(tbMeanOfMeans)}, weights Customer A’s single $96 order like Customer D’s ten, so it describes a typical customer’s habit, not a typical order.`,
  },
  {
    id: 'm06-dg-2', lesson: 'rfm-scoring', type: 'num', kind: 'numerical',
    prompt: `Wyndhurst Garden Centre (fictional) scores recency from 1 to 5 with quintile cut points of ${WG.cuts.join(', ')} days; a value equal to a cut point goes in the group on the more recent side. A customer last bought ${WG.rec} days ago. What is the customer’s R score?`,
    answer: wgR,
    check: () => 5 - WG.cuts.filter((c) => c < 35).length,
    unit: '', places: 0, tol: 0,
    wrong: [
      { value: 6 - wgR, say: 'That ranks recency the way a spend score ranks spend, so the longest absences would score 5. Recency is reversed: the most recent customers score 5.' },
      { value: wgR - 1, say: '35 days is exactly on a cut point, and the rule puts it in the more recent group (4), not the next one down.' },
    ],
    solution: `${WG.rec} days is above 14 and equal to 35, so it falls in the second group counting from the most recent (14–35 days, the cut point included). Counting from the most recent, the groups score 5, 4, 3, 2, 1, so the customer scores R = ${wgR}.`,
  },
  {
    id: 'm06-dg-3', lesson: 'rfm-scoring', type: 'num', kind: 'numerical',
    prompt: `Brackenwick Cycles (fictional) has twelve customers, who made ${BC.join(', ')} purchases last year. It scores frequency 1–5 with quintile cut points from Excel’s PERCENTILE.INC (the 20th, 40th, 60th and 80th percentiles); a value equal to a cut point goes in the lower group. How many customers score F = 1?`,
    answer: bcF1,
    check: () => BC.filter((v) => v <= CU.quantile(BC, 0.2)).length,
    unit: 'customers', places: 0, tol: 0,
    wrong: [
      { value: 2, say: 'That deals the twelve into equal groups of two or three. Quantile cut points put every tied value on the same side of a cut, so all the one-purchase customers share a score.' },
      { value: 3, say: 'Twelve ÷ 5 is about 2.4, but quantile scoring doesn’t make equal groups when values tie. Find the 20th-percentile cut point first.' },
    ],
    solution: `PERCENTILE.INC at 20% sits at position (12 − 1) × 0.2 = 2.2 in the sorted list (counting from 0), between two 1s, so the first cut point is ${fx(bcCuts[0], 1)}; the others are ${bcCuts.slice(1).map((c) => fx(c, 1)).join(', ')}. Every customer with one purchase is on or below the first cut point: ${bcF1} customers score F = 1, and nobody scores F = 2 (no customer is above 1 and at most ${fx(bcCuts[1], 1)}). Heavy ties make quantile groups unequal; equal-sized groups (NTILE) would instead split the tied customers between scores.`,
  },

  // ================================================================ Module 2: segments and cohorts
  {
    id: 'm06-dg-4', lesson: 'rfm-segments', type: 'mc', kind: 'conceptual',
    prompt: `A customer scores R = ${SC.R}, F = ${SC.F} and M = ${SC.M}. FM is the mean of F and M rounded to a whole number, halves up. In the course’s naming of the R × FM grid (a practitioner convention), which segment is the customer in?`,
    options: ['Can’t lose them', 'At risk', 'Hibernating', 'Champions'],
    answer: 0,
    feedback: {
      1: 'At risk is R 1–2 with FM 3 or 4. Here FM = (5 + 4) ÷ 2 = 4.5, which rounds up to 5.',
      2: 'Hibernating is R = 2 with low FM (1 or 2). This customer has bought often and spent a lot.',
      3: 'Champions are recent (R 4–5) as well as frequent and high-spending. An R of 2 means the customer hasn’t bought for a long time.',
    },
    solution: `FM = (${SC.F} + ${SC.M}) ÷ 2 = 4.5, rounded up to ${scFM}. R = ${SC.R} with FM = 5 is ${scSeg}: a former best customer who has gone quiet. The names and cells are one practitioner scheme, not a standard; other schemes draw the grid differently.`,
  },
  {
    id: 'm06-dg-5', lesson: 'cohort-analysis', type: 'num', kind: 'numerical',
    prompt: `Fellgate Climbing Wall (fictional) had ${FC.size} members join in January. In month 3 of that cohort (April), ${FC.active} of them climbed, spending $${FC.spend.toLocaleString('en-US')} in all. For the cohort table of revenue per joiner, what goes in the January cohort’s month-3 cell? Give dollars to the cent.`,
    answer: FC.spend / FC.size,
    check: () => 2700 / 400,
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: FC.spend / FC.active, say: 'That is spend per active member. Revenue per joiner divides by everyone who joined, so it falls as members drop away and can be compared across cohorts of different sizes.' },
    ],
    solution: `Revenue per joiner = month-3 spend ÷ cohort size = $${FC.spend.toLocaleString('en-US')} ÷ ${FC.size} = ${money(FC.spend / FC.size)}. It is the share active (${fx((FC.active / FC.size) * 100, 1)}%) times spend per active member (${money(FC.spend / FC.active)}).`,
  },
  {
    id: 'm06-dg-6', lesson: 'cohort-analysis', type: 'num', kind: 'numerical',
    prompt: `Hollinsby Swim School (fictional) has three cohorts so far. ${HS.map((c) => `${c.m}: ${c.n} joined${c.a2 == null ? ', not yet observed in month 2' : `, ${c.a2} active in month 2`}`).join('; ')}. What is the pooled share active in month 2 since joining? Give a percentage to one decimal place.`,
    answer: rnd(hsPooled * 100, 1),
    check: () => ((120 + 60) / (400 + 100)) * 100,
    unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: rnd((sum(hsObs.map((c) => c.a2)) / sum(HS.map((c) => c.n))) * 100, 1), say: 'The March cohort hasn’t reached month 2, so it can’t count in the denominator: its members aren’t inactive in month 2, they just haven’t got there.' },
      { value: rnd((sum(hsObs.map((c) => c.a2 / c.n)) / hsObs.length) * 100, 1), say: 'That is the plain mean of the two cohorts’ shares (30% and 60%). The pooled curve weights each by its size: total active ÷ total joiners of the cohorts observed.' },
    ],
    solution: `Only January and February have reached month 2. Pooled = (120 + 60) ÷ (400 + 100) = ${fx(hsPooled * 100, 1)}%. The pooled figure is dominated by the larger January cohort; and as later months are reached by fewer cohorts, the pooled curve describes an ever-older, smaller group.`,
  },

  // ================================================================ Module 3: retention and churn
  {
    id: 'm06-dg-7', lesson: 'retention-and-churn-rates', type: 'num', kind: 'numerical',
    prompt: `Marlhurst Leisure Centre (fictional) keeps ${ML.r * 100}% of its members over a year. If the monthly churn rate were the same every month, what would it be? Give a percentage to two decimal places.`,
    answer: rnd(mlMonthly * 100, 2),
    check: () => (1 - Math.exp(Math.log(0.7) / 12)) * 100,
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(((1 - ML.r) / 12) * 100, 2), say: 'Dividing the annual churn by 12 ignores compounding: each month’s churn applies only to the members still there. Solve (1 − c)¹² = 0.7.' },
      { value: rnd((1 - ML.r) * 100, 2), say: '30% is the churn over the whole year. The question asks for the constant monthly rate that compounds to it: 1 − 0.7^(1/12).' },
    ],
    solution: `Monthly retention r satisfies r¹² = 0.7, so r = 0.7^(1/12) = ${fx(1 - mlMonthly, 4)} and the monthly churn is 1 − r = ${fx(mlMonthly * 100, 2)}%, more than 30% ÷ 12 = 2.50% because each month’s losses come from a smaller base.`,
  },
  {
    id: 'm06-dg-8', lesson: 'survival-analysis', type: 'num', kind: 'numerical',
    prompt: `Selwick Riding School (fictional) has followed eight new riders. Months observed, and whether each left or is still riding: ${srRiders}. Using the Kaplan–Meier (product-limit) estimator, what is the probability that a new rider is still riding after ${SR.at} months? Give three decimal places.`,
    answer: rnd(srS, 3),
    check: () => (7 / 8) * (5 / 6) * (3 / 4),
    unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: rnd(srAsLeft, 3), say: 'That treats the riders still riding as if they had left when observation stopped, which understates survival. A censored rider counts as at risk up to their last month and then drops out of the count.' },
      { value: rnd(srDrop, 3), say: 'That leaves out the riders still riding, keeping only those whose departure was seen, so it describes the quickest leavers.' },
      { value: rnd(srNaive, 3), say: 'That counts every rider still riding as a survivor past month 8, even the two observed for only 4 and 5 months. Nobody knows yet whether they will last 8 months.' },
    ],
    solution: `At 2 months 8 are at risk and 1 leaves: × 7/8. The rider censored at 4 drops out of the count. At 5 months 6 are at risk (the rider censored at 5 counts as at risk then) and 1 leaves: × 5/6. At 7 months 4 are at risk and 1 leaves: × 3/4. S(8) = 7/8 × 5/6 × 3/4 = ${fx(srS, 3)}.`,
  },
  {
    id: 'm06-dg-9', lesson: 'predicting-churn', type: 'num', kind: 'numerical',
    prompt: `Merriton Mobile (fictional) had ${MM.n.toLocaleString('en-US')} customers, of whom ${MM.left.toLocaleString('en-US')} left the following quarter. The ${MM.top} customers with the highest churn scores beforehand included ${MM.topLeft} of the leavers. What is the lift of that top group? Give two decimal places.`,
    answer: rnd(mmLift, 2),
    check: () => (360 / 800) / (1200 / 8000),
    unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: rnd((MM.topLeft / MM.top) * 100, 2), say: '45% is the top group’s churn rate. Lift compares it with the base rate: 45% ÷ 15%.' },
      { value: rnd(MM.topLeft / MM.left, 2), say: 'That is the share of all leavers the group captured (a point on the gains curve). Lift divides the group’s rate by the overall rate.' },
    ],
    solution: `The top group’s churn rate is ${MM.topLeft} ÷ ${MM.top} = 45%; the base rate is ${MM.left.toLocaleString('en-US')} ÷ ${MM.n.toLocaleString('en-US')} = 15%. Lift = 45% ÷ 15% = ${fx(mmLift, 2)}: the top tenth holds three times its share of leavers (30% of them). It says nothing about whether contacting them would keep any.`,
  },

  // ================================================================ Module 4: customer value and strategy
  {
    id: 'm06-dg-10', lesson: 'customer-lifetime-value', type: 'num', kind: 'numerical',
    prompt: `Callowfield Boiler Cover (fictional) earns a margin of $${CB.m} a year on each household’s yearly cover, paid at the start of the year; ${CB.r * 100}% of households renew each year, and the firm discounts at ${CB.d * 100}% a year. What is a household that signs today worth, counting this year’s margin, under constant retention? Give dollars to the cent.`,
    answer: rnd(cbV, 2),
    check: () => 120 * 1.1 / (1.1 - 0.8),
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(CB.m / (1 - CB.r), 2), say: 'That is the undiscounted value: the margin times the expected lifetime of 5 years. Later years’ margins are worth less today.' },
      { value: rnd(CU.clvConstant({ ...CB, timing: 'end' }).value, 2), say: 'That leaves out this year’s margin, which arrives now: it values a household after its first payment, from the first renewal on.' },
    ],
    solution: `With the first margin now and each later one only if the household renews, CLV = m(1 + d) ÷ (1 + d − r) = 120 × 1.1 ÷ 0.3 = ${money(cbV)}: the sum of 120 × 0.8ᵗ ÷ 1.1ᵗ over t = 0, 1, 2, …`,
  },
  {
    id: 'm06-dg-11', lesson: 'acquisition-cost-and-payback', type: 'num', kind: 'numerical',
    prompt: `Elmscar Tool Library (fictional) spends $${ET.cac} to win a member, who pays a monthly fee that leaves $${ET.m} of margin at the start of each month they stay; ${ET.r * 100}% of members stay each month. Ignoring discounting, in which month does a new member’s expected cumulative margin first cover the acquisition cost?`,
    answer: etPay,
    check: () => { let s = 0; for (let t = 0; t < 100; t++) { s += 20 * 0.85 ** t; if (s >= 60) return t + 1; } return Infinity; },
    unit: 'month', places: 0, tol: 0,
    wrong: [
      { value: etSimple, say: '$60 ÷ $20 = 3 months is simple payback, which assumes every member stays. With 15% leaving each month, the expected margin after three months is only $51.45.' },
    ],
    solution: `Expected cumulative margin: ${etCum.map((v) => money(v)).join(', ')} after months 1 to ${etPay} (each month adds 20 × 0.85ᵗ). It first reaches $${ET.cac} in month ${etPay}, a month later than the simple payback of ${etSimple} months. Discounting would delay it further.`,
  },
  {
    id: 'm06-dg-12', lesson: 'loyalty-and-retention-strategy', type: 'num', kind: 'applied',
    prompt: `Gildersome Shoe Repairs (fictional) chose ${GS.n.toLocaleString('en-US')} lapsed customers at random for a $${GS.voucher} voucher and held out another ${GS.n.toLocaleString('en-US')}. Within a month ${GS.pT * 100}% of those sent the voucher came back, all using it, against ${GS.pC * 100}% of the holdout. What did the vouchers cost per customer they brought back who wouldn’t otherwise have come? Give dollars to the cent.`,
    answer: rnd(gsPerExtra, 2),
    check: () => (0.18 * 1000 * 6) / ((0.18 - 0.12) * 1000),
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: GS.voucher, say: '$6 is the cost per voucher used. Most of the 180 who used one would have come back anyway; only the uplift over the holdout, 60 customers, was won by the vouchers.' },
      { value: rnd(gsCost / GS.n, 2), say: 'That spreads the vouchers’ cost over everyone sent one. The question is what each extra returner cost: divide by the uplift over the holdout, 60 customers.' },
    ],
    solution: `Vouchers used: ${GS.pT * GS.n} × $${GS.voucher} = $${gsCost.toLocaleString('en-US')}. Extra returners: (18% − 12%) × ${GS.n.toLocaleString('en-US')} = ${gsExtra}. Cost per extra customer = $${gsCost.toLocaleString('en-US')} ÷ ${gsExtra} = ${money(gsPerExtra)}, three times the voucher’s face value, because the 120 who would have come anyway used vouchers too. Compare it with what a returning customer is worth.`,
  },
];

export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
