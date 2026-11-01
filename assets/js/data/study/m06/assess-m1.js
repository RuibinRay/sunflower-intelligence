// assess-m1.js — M06 module 1 test: Customer data and RFM (customer-metrics, rfm-scoring). New questions on new
// scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. The visit
// log and the scored members come from case.js; Fernleigh Hotels, Greenmantle Plants and Pinebrook Outdoor are
// fictional, as are their numbers. Formula items are marked by their results; every num item's `check` recomputes it.
import { VISIT_LIST, members } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';
import { isoToSerial } from '../../../core/sheet.js?v=25';

const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const r2 = (x) => Math.round(x * 100) / 100;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const ALL = members();

// a visit log of seven other members, as of 30 November 2027
const IDS = ['A0011', 'A0773', 'A0776', 'A0791', 'A1687', 'A1767', 'A1778'];
const ASOF = '2027-11-30';
const LOG = VISIT_LIST.filter((v) => IDS.includes(v.id) && v.date <= ASOF), LL = LOG.length + 1;
const logCells = {
  A1: 'member', B1: 'date', C1: 'café', D1: 'amount',
  ...col('A', 2, LOG.map((v) => v.id)), ...col('B', 2, LOG.map((v) => isoToSerial(v.date))), ...col('C', 2, LOG.map((v) => v.cafe)), ...col('D', 2, LOG.map((v) => v.amount)),
  F1: 'as of', G1: isoToSerial(ASOF), F3: 'member', G3: 'A0791', F4: 'recency (days)',
};
const recOn = (id) => CU.dayNum(ASOF) - Math.max(...LOG.filter((v) => v.id === id).map((v) => v.day));

// twenty members' spend, scored in thirds
const T20 = ALL.filter((_, i) => i % 129 === 7).slice(0, 20), L20 = T20.length + 1;
const terCells = { A1: 'member', B1: 'visits', C1: 'spend', ...col('A', 2, T20.map((m) => m.id)), ...col('B', 2, T20.map((m) => m.frequency)), ...col('C', 2, T20.map((m) => m.monetary)),
  F1: 'percentile', F2: 1 / 3, F3: 2 / 3, G1: 'spend cut', G2: `=PERCENTILE.INC($C$2:$C$${L20},F2)`, G3: `=PERCENTILE.INC($C$2:$C$${L20},F3)`, D1: 'M (1–3)' };
const terCuts = CU.cutPoints(T20.map((m) => m.monetary), 3);

// Fernleigh Hotels (fictional)
const FH = { guests: 1200, stays: 2040, revenue: 612000 };
// Greenmantle Plants (fictional): customers by number of orders
const GP = [['1 order', 1840], ['2 orders', 610], ['3–5 orders', 420], ['6 or more', 130]];
const gpN = GP.reduce((s, r) => s + r[1], 0), gpRep = (gpN - GP[0][1]) / gpN;
// Pinebrook Outdoor (fictional): twelve customers' orders, quintile cut points
const PB = [1, 1, 2, 2, 2, 3, 3, 4, 5, 7, 8, 12];
const pbC = CU.cutPoints(PB);
const pbOn = PB.filter((v) => pbC.includes(v)).length;
const SP = [8, 11, 14, 14, 19, 23, 26, 31, 40, 44, 58, 75];

export const items = [
  {
    id: 'm06-m1-1', lesson: 'customer-metrics', type: 'formula', kind: 'applied',
    prompt: `Seven members’ visits up to 30 November 2027 are in A2:D${LL} (member, date, café, amount), and G1 holds the as-of date. Ana wants each member’s recency in a single cell. In G4, write one formula that gives the recency in days of the member named in G3.`,
    sheet: { cells: logCells, vary: { G3: ['A1778', 'A0011', 'A1767'] } }, cell: 'G4', view: `A1:G${LL}`,
    formats: { B: 'date', D: '$#,##0.00', G1: 'date' }, widths: { A: 9, B: 12, C: 12, F: 14, G: 12 },
    answer: `=G1-MAXIFS(B2:B${LL},A2:A${LL},G3)`,
    alt: [`=$G$1-MAXIFS($B$2:$B$${LL},$A$2:$A$${LL},$G$3)`, '=G1-MAXIFS(B:B,A:A,G3)', `=DAYS(G1,MAXIFS(B2:B${LL},A2:A${LL},G3))`],
    require: ['MAXIFS'],
    wrong: [
      { formula: `=G1-MINIFS(B2:B${LL},A2:A${LL},G3)`, say: 'MINIFS finds the first visit, so this is tenure. Recency runs back to the last visit: MAXIFS.' },
      { formula: `=MAXIFS(B2:B${LL},A2:A${LL},G3)-G1`, say: 'The subtraction is the wrong way round, giving a negative number. Recency = as-of date − last visit.' },
      { formula: `=G1-MAX(B2:B${LL})`, say: 'That is the days since anyone’s last visit. Restrict the maximum to the member in G3.' },
    ],
    solution: `<x>=G1-MAXIFS(B2:B${LL},A2:A${LL},G3)</x>. For A0791, whose last visit before 30 November was in June: ${recOn('A0791')} days. MAXIFS finds the latest date among that member’s rows.`,
  },
  {
    id: 'm06-m1-2', lesson: 'customer-metrics', type: 'num', kind: 'numerical',
    prompt: `Fernleigh Hotels (fictional) had ${FH.guests.toLocaleString('en-US')} guests last year, who made ${FH.stays.toLocaleString('en-US')} stays and paid $${FH.revenue.toLocaleString('en-US')} in all. Using average spend per stay and stays per guest, what was the spend per guest?`,
    answer: FH.revenue / FH.guests, check: () => (612000 / 2040) * (2040 / 1200), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: FH.revenue / FH.stays, say: 'That is the average spend per stay ($300). Multiply by stays per guest (1.7) for spend per guest.' }],
    solution: `Average spend per stay = $612,000 ÷ 2,040 = $${(FH.revenue / FH.stays).toFixed(2)}; stays per guest = 2,040 ÷ 1,200 = ${(FH.stays / FH.guests).toFixed(2)}. Spend per guest = $300.00 × 1.70 = $${(FH.revenue / FH.guests).toFixed(2)}, the same as $612,000 ÷ 1,200.`,
  },
  {
    id: 'm06-m1-3', lesson: 'customer-metrics', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst builds a customer table from sales data that end on 30 June, but measures recency from the day she runs it, 20 July. She then counts as active everyone whose recency is 30 days or less. What has gone wrong?',
    options: [
      'Every recency is 20 days too long, so customers whose last purchase was between 31 May and 19 June are wrongly counted as inactive',
      'Nothing: recency is always measured from the day of analysis, and customers who haven’t bought since 30 June really are less recent',
      'Frequency is now wrong too, since every customer’s purchases between 30 June and 20 July have been left out of their counts',
      'The as-of date affects tenure but not recency, so only the tenure column needs correcting before the active count is used',
    ],
    answer: 0,
    feedback: {
      1: 'The data can’t show whether anyone bought after 30 June. Measure from the data’s last day, so recency reflects what the data know.',
      2: 'Frequency counts purchases in the window that the data cover; it isn’t changed by where recency is measured from.',
      3: 'Both recency and tenure are measured to the as-of date, so both are 20 days too long.',
    },
    solution: 'The as-of date should be the data’s last day, 30 June. Measuring from 20 July adds 20 days to every recency (and tenure), so the 30-day active rule really becomes a 10-day rule: customers last seen from 31 May to 19 June drop out of the count.',
  },
  {
    id: 'm06-m1-4', lesson: 'customer-metrics', type: 'classify', kind: 'applied',
    prompt: 'Greenmantle Plants (fictional) is building a customer table from its order export. If it isn’t fixed, does each problem make purchases per customer in the customer table too high or too low?',
    items: [
      'A shopper opens a second account with a new email address',
      'Refunds are exported as separate orders with negative amounts and counted as orders',
      'Customers often check out as guests, so their orders carry no customer ID',
      'Three flatmates share one account for all their orders',
    ],
    categories: ['Too high', 'Too low'],
    answer: [1, 0, 1, 0],
    feedback: {
      0: 'One person becomes two customers, each with part of the history: more customers for the same purchases.',
      1: 'Each refund adds an “order” that wasn’t a purchase.',
      2: 'The registered customers’ guest orders are missing from their rows.',
      3: 'Three people’s orders sit in one customer’s row.',
    },
    solution: 'Too high: refunds counted as orders add purchases that weren’t made, and a shared account puts three people’s orders in one row. Too low: a second account splits one customer’s purchases over two rows, and guest checkouts leave registered customers with fewer recorded purchases than they made.',
  },
  {
    id: 'm06-m1-5', lesson: 'customer-metrics', type: 'mc', kind: 'applied',
    prompt: 'Greenmantle Plants’ customers spent a mean of $85 last year and a median of $34; the top 20% brought 64% of spend. The marketing manager plans next year’s welcome budget as “$85 per new customer, because that’s what a customer is worth”. What should the analyst say?',
    options: [
      'The median customer spends $34; a few big spenders lift the mean, so most new customers will be worth far less than $85',
      'The mean is right because it includes every customer, while the median ignores the biggest spenders the business depends on',
      'Neither figure can be used, because spend that is skewed like this has no meaningful average at all',
      'Use 64% of $85, because the top 20% bring 64% of spend and the rest of the customers bring only the remaining 36%',
    ],
    answer: 0,
    feedback: {
      1: 'The mean is the right total per head, but the typical customer is nearer the median: planning as if everyone were average overstates most.',
      2: 'Skewed data have both a mean and a median; the point is to report both and know what each says.',
      3: 'That arithmetic doesn’t give any customer’s value; the top-20% share describes concentration, not a typical customer.',
    },
    solution: 'Spend is right-skewed: the mean ($85) is pulled up by the top 20%, who bring 64% of spend, and the typical customer spends $34. Budget per head can use the mean only if it is spread over everyone; most new customers will be worth much less. Spend is also revenue, not margin, and last year’s, not a forecast.',
  },
  {
    id: 'm06-m1-6', lesson: 'customer-metrics', type: 'num', kind: 'numerical',
    prompt: 'Greenmantle Plants’ customers last year, by the number of orders they placed, are below. What was the repeat rate? Give a percentage to one decimal place.',
    data: { table: { head: ['Orders', 'Customers'], align: ['l', 'r'], rows: GP.map((r) => [r[0], r[1].toLocaleString('en-US')]) } },
    answer: Math.round(gpRep * 1000) / 10, check: () => ((610 + 420 + 130) / (1840 + 610 + 420 + 130)) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: Math.round(((420 + 130) / gpN) * 1000) / 10, say: 'Customers with exactly two orders are repeaters too: the repeat rate counts everyone with two or more.' }, { value: Math.round((1840 / gpN) * 1000) / 10, say: 'That is the share who bought once. The repeat rate is the rest.' }],
    solution: `Repeaters are everyone with two or more orders: 610 + 420 + 130 = ${gpN - GP[0][1]} of ${gpN.toLocaleString('en-US')} customers, ${pc(gpRep)}.`,
  },
  {
    id: 'm06-m1-7', lesson: 'rfm-scoring', type: 'num', kind: 'numerical',
    prompt: `Pinebrook Outdoor (fictional) has twelve customers who spent $${SP.join(', $')} last season. Using Excel’s PERCENTILE.INC rule, what is the 40th-percentile cut point for monetary value?`,
    answer: r2(CU.quantile(SP, 0.4)), check: () => { const h = 11 * 0.4; return SP[4] + (h - 4) * (SP[5] - SP[4]); }, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 19, say: 'Position 4.4 (counting from 0) lies 40% of the way from the 5th value, $19, to the 6th, $23: interpolate.' }, { value: 23, say: 'h = (12 − 1) × 0.4 = 4.4, counting from 0: between $19 and $23, not at $23.' }],
    solution: `h = (12 − 1) × 0.4 = 4.4. Counting from 0, positions 4 and 5 hold $19 and $23, so the cut point is 19 + 0.4 × 4 = ${money(CU.quantile(SP, 0.4))}.`,
  },
  {
    id: 'm06-m1-8', lesson: 'rfm-scoring', type: 'formula', kind: 'numerical',
    prompt: `Twenty members’ total spend is in C2:C${L20}. Ana is trying three groups instead of five: G2 and G3 hold the spend cut points at the 1/3 and 2/3 percentiles. In D2, give the member’s M score from 1 to 3 (3 = highest spend; a value on a cut point stays in the lower group), and fill down to D${L20}.`,
    sheet: { cells: terCells, fixed: ['F2:F3'] }, cell: 'D2', fill: `D2:D${L20}`, view: `A1:G${L20}`,
    formats: { C: '$#,##0.00', G: '$#,##0.00', F: '0.000' }, widths: { D: 9, F: 10, G: 10 },
    answer: '=1+COUNTIF($G$2:$G$3,"<"&C2)',
    alt: ['=IF(C2<=$G$2,1,IF(C2<=$G$3,2,3))', '=1+(C2>$G$2)+(C2>$G$3)', '=IFS(C2<=$G$2,1,C2<=$G$3,2,TRUE,3)'],
    wrong: [
      { formula: '=IF(C2<=$G$2,3,IF(C2<=$G$3,2,1))', say: 'That reverses the scale, as recency needs. For spend, the highest values score 3.' },
      { formula: '=1+COUNTIF(G2:G3,"<"&C2)', say: 'The cut-point range slides as the formula fills down, so lower rows compare against empty cells. Anchor it: $G$2:$G$3.' },
    ],
    solution: `<x>=1+COUNTIF($G$2:$G$3,"<"&C2)</x>, or <x>=IF(C2<=$G$2,1,IF(C2<=$G$3,2,3))</x>, filled down. The cut points are ${money(terCuts[0])} and ${money(terCuts[1])}.`,
  },
  {
    id: 'm06-m1-9', lesson: 'rfm-scoring', type: 'num', kind: 'numerical',
    prompt: `Pinebrook Outdoor’s twelve customers placed ${PB.join(', ')} orders. The frequency cut points (PERCENTILE.INC at 20%, 40%, 60% and 80%) are ${pbC.map((c) => (Number.isInteger(c) ? c : c.toFixed(1))).join(', ')}. How many customers would get a different F score if a value on a cut point went into the higher group instead of the lower one?`,
    answer: pbOn, check: () => PB.filter((v) => CU.cutPoints(PB).some((c) => Math.abs(c - v) < 1e-9)).length, unit: 'customers', places: 0, tol: 0,
    wrong: [{ value: 0, say: 'Look for customers whose number of orders equals a cut point exactly: each of them moves up a group under the other convention.' }],
    solution: `Only values exactly on a cut point change group. ${pbOn} customers have exactly ${[...new Set(PB.filter((v) => pbC.includes(v)))].join(' or ')} orders, which are cut points, so ${pbOn} scores change.`,
  },
  {
    id: 'm06-m1-10', lesson: 'rfm-scoring', type: 'mc', kind: 'conceptual',
    prompt: 'A database scores customers into five equal-sized groups by frequency with NTILE, ordering only by the number of purchases. 900 of its 4,000 customers bought exactly once. Run twice on the same data, some of these customers get F1 on one run and F2 on the next. Why?',
    options: [
      'F1 can hold only 800 customers, so 100 of the 900 tied customers must go to F2, and which 100 depends on the order the database happens to return tied rows',
      'NTILE interpolates between tied values, and the result of the interpolation depends on exactly how many customers are in the base at the moment that the database query runs',
      'The scores are relative to the base, and the base changed between the two runs because new customers kept arriving',
      'NTILE gives tied customers the average of the scores they span, and rounds that average up or down at random',
    ],
    answer: 0,
    feedback: {
      1: 'NTILE doesn’t interpolate: it sorts and deals rows into groups of fixed size.',
      2: 'The question says the data were the same both times; the base didn’t change.',
      3: 'Averaging tied scores is a ranking method, not NTILE; NTILE gives each row one group by position.',
    },
    solution: 'Equal-sized groups of 4,000 ÷ 5 = 800 can’t hold 900 tied customers, so 100 are pushed into F2. With nothing but frequency in the ORDER BY, the database may return tied rows in any order (Microsoft’s NTILE documentation calls the function nondeterministic), so different customers are pushed each time. Add a tie-breaker (the customer ID), or use quantile cut points, under which all 900 share F1.',
  },
  {
    id: 'm06-m1-11', lesson: 'rfm-scoring', type: 'mc', kind: 'applied',
    prompt: 'An online retailer scores M on each customer’s total spend and finds its F and M scores are equal for most customers. The analyst wants the three scores to say three different things. What is the best change?',
    options: [
      'Score M on average spend per order, which barely depends on how often people buy',
      'Give M a larger weight in the combined score, so that it counts for more than F does',
      'Drop F, since total spend already includes how often each customer bought from the retailer',
      'Use ten groups instead of five, so that small differences between F and M show up in the scores',
    ],
    answer: 0,
    feedback: {
      1: 'Weighting changes how much M counts, not what it measures: it would still repeat F.',
      2: 'Dropping F loses the visit count, which matters on its own (a frequent low spender differs from a rare big spender).',
      3: 'More groups would still give scores that rise together, because total spend is largely frequency × ticket.',
    },
    solution: 'Total spend is roughly frequency × average order value, so its score largely repeats F. Scoring M on average spend per order (as Fader, Hardie and Lee define monetary value) measures something frequency doesn’t; alternatively, combine F and M into FM and accept two dimensions.',
  },
  {
    id: 'm06-m1-12', lesson: 'rfm-scoring', type: 'multi', kind: 'conceptual',
    prompt: 'Fernleigh Hotels (fictional) scored its guests on 31 March and again on 30 June. Which of these could change a guest’s R score between the two dates even though the guest didn’t stay at all in between? Select all that apply.',
    options: [
      'The guest’s recency grew by 91 days',
      'New guests who stayed in the quarter changed the cut points',
      'The guest’s F score changed',
      'The guest’s M score changed',
      'The guest’s total spend was recalculated',
    ],
    answer: [0, 1],
    feedback: {
      2: 'R is scored on recency alone; F doesn’t enter it.',
      3: 'M is scored separately; it doesn’t enter R.',
      4: 'Spend affects M, not R.',
    },
    solution: 'R depends on the guest’s recency (which grows every day without a stay) and on the cut points (which move as the base changes). F and M are scored separately and don’t affect R.',
  },
];
