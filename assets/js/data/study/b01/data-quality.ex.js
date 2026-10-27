// data-quality.ex.js — B01 · Data quality: is the data fit for the question? Widgets, practice and the knowledge check.
// Answer keys live here. Every business and number is fictional; every number is recomputed by `check`.
// The lantern-orders widget is inspect-only (ops: []): B02 teaches the repairs.

import { UTC_OFFSET_HOURS } from './case.js?v=22';

const BEHIND = -UTC_OFFSET_HOURS;   // hours Lantern's local time is behind UTC
const WORDS = { 4: 'four', 5: 'five', 6: 'six' };
/** A local date-time 'YYYY-MM-DDTHH:MM' written as the UTC timestamp the platform stores, shifted by `hours`. */
const utcStamp = (local, hours = BEHIND) => new Date(Date.parse(`${local}:00Z`) + hours * 3600000).toISOString().replace('.000Z', 'Z');
const ORDER_LOCAL = '2026-11-30T21:30';

const DIMS = ['Accuracy', 'Completeness', 'Consistency', 'Validity', 'Timeliness', 'Uniqueness'];
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);

export const widgets = {
  'dq-inspect': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: [],
    advice: false,
    watch: ['order_id', 'region', 'quantity', 'rating'],
    task: 'Inspect only: change nothing. For each issue the explorer lists, name its dimension, the figure it would distort and the question you’d ask Ana; then say what the file alone can’t show (accuracy, timeliness). The repairs are B02’s subject.',
  },
  'dq-ratings': {
    type: 'formula',
    title: 'Whose ratings make up the average?',
    intro: 'Orders come from subscribers and one-off buyers. Each group rates some of its orders and has its own average rating.',
    inputs: [
      { id: 'subShare', label: 'Orders from subscribers', min: 0, max: 100, step: 5, value: 30, fmt: 'pct' },
      { id: 'subRate', label: 'Subscriber orders that are rated', min: 0, max: 100, step: 5, value: 80, fmt: 'pct' },
      { id: 'oneRate', label: 'One-off orders that are rated', min: 0, max: 100, step: 5, value: 20, fmt: 'pct' },
      { id: 'subAvg', label: 'Subscribers’ average rating', min: 1, max: 5, step: 0.1, value: 4.6, fmt: 'num', unit: 'stars' },
      { id: 'oneAvg', label: 'One-off buyers’ average rating', min: 1, max: 5, step: 0.1, value: 3.5, fmt: 'num', unit: 'stars' },
    ],
    compute: (v) => {
      const s = v.subShare / 100, rs = v.subRate / 100, ro = v.oneRate / 100;
      const rated = s * rs + (1 - s) * ro;
      if (rated <= 0) return { error: 'No orders are rated, so there is no average rating to report.' };
      const given = (s * rs * v.subAvg + (1 - s) * ro * v.oneAvg) / rated;
      const all = s * v.subAvg + (1 - s) * v.oneAvg;
      const gap = given - all;
      const subOfRatings = s * rs / rated * 100;
      return {
        headline: { label: 'Average of the ratings given', value: `${f2(given)} stars` },
        rows: [
          ['Orders rated', `${f1(rated * 100)}%`],
          ['Subscribers’ share of orders', `${f1(v.subShare)}%`],
          ['Subscribers’ share of ratings', `${f1(subOfRatings)}%`],
          ['Estimate for all orders (raters like non-raters within each group)', `${f2(all)} stars`],
          ['Gap: ratings given minus estimate for all orders', `${gap >= 0.005 ? '+' : gap <= -0.005 ? '−' : ''}${f2(Math.abs(gap))} stars`],
        ],
        note: Math.abs(gap) < 0.005
          ? 'The ratings given and the estimate for all orders agree: either both groups rate equally often, or both are equally satisfied, so who rates doesn’t change the average.'
          : `Subscribers are ${f1(v.subShare)}% of orders but ${f1(subOfRatings)}% of ratings, so the average of the ratings given is ${f2(Math.abs(gap))} stars ${gap > 0 ? 'higher' : 'lower'} than the estimate for all orders. Report the groups separately, with their counts.`,
        chart: { kind: 'bar', x: { label: 'Figure', values: ['Ratings given', 'All orders (estimate)', 'Subscribers', 'One-off buyers'] }, series: [{ name: 'Average rating (stars)', values: [Math.round(given * 100) / 100, Math.round(all * 100) / 100, v.subAvg, v.oneAvg] }], y: { label: 'Stars', format: 'num' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-dq-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which quality dimension does each problem in Lantern’s data mainly affect?',
    items: [
      'A rating of 9 on the 1–5 scale',
      'One order exported twice',
      'An order for 4 packs recorded as 40 packs',
      'The same region written “North”, “north” and “Nth”',
      'A customer’s new delivery address entered a week after they moved, so a parcel goes to the old one',
      'Orders with no e-mail address, although e-mail is required',
    ],
    categories: DIMS,
    answer: [3, 5, 0, 2, 4, 1],
    hints: [
      'For each problem ask: is the value impossible (validity), possible but wrong (accuracy), absent (completeness), written differently in different places (consistency), out of date (timeliness) or repeated (uniqueness)?',
      'Forty packs is a possible order, so a rule can’t reject it.',
    ],
    feedback: {
      0: 'A rating of 9 is outside the allowed range: validity.',
      2: 'Forty packs is possible, so it passes the rules; it is wrong because it doesn’t match what the customer ordered: accuracy.',
      3: 'One region represented three ways: consistency.',
      4: 'The address was right once but was not updated in time for the order: timeliness.',
    },
    solution: 'Rating 9: validity. Order exported twice: uniqueness. 40 packs for 4: accuracy. Three spellings of North: consistency. Address updated a week late: timeliness. Missing required e-mail: completeness.',
  },
  {
    id: 'b01-dq-g2', type: 'rows', kind: 'applied',
    prompt: 'An export of nine Lantern orders (fictional) should have one row per order. Select every row that repeats an order already listed above it.',
    data: { table: {
      head: ['order_id', 'channel', 'order_total ($)'],
      rows: [
        ['LC-11702', 'web', '22.00'],
        ['LC-11703', 'app', '46.00'],
        ['LC-11704', 'web', '14.00'],
        ['LC-11703', 'app', '46.00'],
        ['LC-11705', 'web', '58.00'],
        ['LC-11706', 'app', '19.50'],
        ['LC-11704', 'web', '14.00'],
        ['LC-11707', 'web', '36.00'],
        ['LC-11706', 'app', '19.50'],
      ],
    } },
    answer: [3, 6, 8],
    hints: [
      'Read down the order_id column only and look for values you have already seen.',
      'Three order_ids appear twice; select the second copy of each.',
    ],
    solution: 'LC-11703, LC-11704 and LC-11706 each appear twice, so rows 3, 6 and 8 repeat earlier rows. The export has 9 rows for 6 orders: a count of rows overstates orders by (9 − 6) ÷ 6 = 50%.',
  },
  {
    id: 'b01-dq-g3', type: 'num', kind: 'numerical',
    prompt: 'Fifty ratings of a coffee average 4.30 stars, but one of them was typed as 9 instead of 4. Once it is corrected, what is the mean? Two decimal places.',
    answer: 4.2, check: () => (4.30 * 50 - 9 + 4) / 50, unit: 'stars', places: 2, tol: 0.006,
    hints: [
      'The wrong value is 5 stars too high. What does that add to the total of the 50 ratings, and so to their mean?',
      'Shift in the mean = (9 − 4) ÷ 50.',
    ],
    wrong: [
      { value: 4.4, say: 'You added the shift. The typed value was too high, so the corrected mean is lower.' },
      { value: -0.7, say: 'You subtracted the whole 5-star error from the mean. Spread it over the 50 ratings first: 5 ÷ 50 = 0.10.' },
    ],
    solution: 'Shift = (x wrong − x right) ÷ n = (9 − 4) ÷ 50 = 0.10 stars. Corrected mean = 4.30 − 0.10 = 4.20 stars. (Check: total 4.30 × 50 = 215; corrected total 215 − 9 + 4 = 210; 210 ÷ 50 = 4.20.)',
  },
  {
    id: 'b01-dq-g4', type: 'steps', kind: 'applied',
    prompt: `Lantern’s platform stores order times in UTC. Assume Lantern’s local time is ${WORDS[BEHIND]} hours behind UTC throughout. A customer places an order at 21:30 local time on Monday 30 November 2026.`,
    solution: `The platform stores ${utcStamp(ORDER_LOCAL)}, so a report that groups by the UTC date puts the order in December. Over a whole month, the UTC report loses the last evening of its own month (12 orders here) and gains the last evening of the month before (9), a net change of −3 for November.`,
    steps: [
      { id: 'b01-dq-g4-s1', type: 'mc',
        prompt: 'What timestamp does the platform store?',
        options: [utcStamp(ORDER_LOCAL), utcStamp(ORDER_LOCAL, -BEHIND), utcStamp(ORDER_LOCAL, 0), utcStamp(ORDER_LOCAL, 24)],
        answer: 0,
        hints: [`UTC is ahead of Lantern’s local time, so add ${WORDS[BEHIND]} hours.`, `21:30 plus ${WORDS[BEHIND]} hours is ${utcStamp(ORDER_LOCAL).slice(11, 16)} on the next day.`],
        feedback: {
          1: `That subtracts ${WORDS[BEHIND]} hours. Lantern is behind UTC, so UTC is ${WORDS[BEHIND]} hours later.`,
          2: 'That is the local time with a Z added; Z means UTC, so the hours must change.',
          3: `The date moves on, but the time must change too: 21:30 + ${BEHIND} hours = ${utcStamp(ORDER_LOCAL).slice(11, 16)}.`,
        } },
      { id: 'b01-dq-g4-s2', type: 'mc',
        prompt: 'A monthly report groups orders by the date part of the stored timestamp. In which month does this order appear?',
        options: ['December', 'November', 'Both months'],
        answer: 0,
        hints: ['Look at the date in the stored timestamp, not the customer’s clock.'],
        feedback: { 1: 'The customer ordered in November by local time, but the stored date is 1 December.', 2: 'Each order is counted once, in the month of its stored date.' } },
      { id: 'b01-dq-g4-s3', type: 'num',
        prompt: 'Suppose 12 orders were placed between 19:00 and midnight local time on 30 November, and 9 between 19:00 and midnight on 31 October. Compared with a report by local date, by how much does the UTC report change November’s order count? Enter a fall as a negative number.',
        answer: -3, check: () => -12 + 9, unit: 'orders', places: 0, tol: 0.5,
        hints: ['November loses its own last evening to December. What does it gain?', 'It gains 31 October’s evening orders, which the UTC report dates 1 November.'],
        wrong: [
          { value: -12, say: 'November loses 30 November’s evening orders, but it also gains 31 October’s evening orders.' },
          { value: 21, say: 'The two movements go in opposite directions: −12 + 9.' },
          { value: 3, say: 'Check the sign: November loses more (12) than it gains (9).' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'b01-dq-i1', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s order export is missing e-mail addresses for some customers, while every order has a correct date and total. For which purpose is it least fit as it stands?',
    options: [
      'E-mailing every November customer about a product recall',
      'Calculating November’s revenue for Ana’s monthly shop review',
      'Counting orders by day of the week to plan packing staff',
      'Comparing average order value between web and app',
    ],
    answer: 0,
    feedback: {
      1: 'Revenue depends on totals and dates, which are complete and correct.',
      2: 'Counting by day needs dates, not e-mail addresses.',
      3: 'Average order value needs totals and channel, not e-mail addresses.',
    },
    solution: 'Fitness depends on the purpose. Missing e-mail addresses don’t affect revenue, counts or averages, but a recall must reach every affected customer, so for that purpose completeness of the e-mail column is critical. Customers without an address would need another route, such as their delivery address.',
  },
  {
    id: 'b01-dq-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s booking export for May has 1,272 rows, but 72 of them are duplicates created by a channel-manager sync. By what percentage does a count of rows overstate the true number of bookings? One decimal place.',
    answer: 6, check: () => 72 / (1272 - 72) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 5.7, say: 'That divides by the inflated count, 1,272. The overstatement is measured against the true number of bookings: 1,272 − 72 = 1,200.' },
      { value: 72, say: 'That is the number of extra rows, not a percentage.' },
    ],
    solution: 'True bookings = 1,272 − 72 = 1,200. Overstatement = (1,272 − 1,200) ÷ 1,200 × 100 = 6.0%.',
  },
  {
    id: 'b01-dq-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Lantern keeps finding orders with no e-mail address. Which actions prevent the problem where it starts, rather than cleaning it up afterwards? Select all that apply.',
    options: [
      'Make e-mail a required field on the checkout form',
      'Have the app refuse an order until an address in a valid format has been entered',
      'Ask the analyst to look up missing addresses by hand each month',
      'Delete orders with no e-mail address from the analysis file',
      'Tell customers, at the point they type it, why the address is needed (receipts and delivery updates)',
      'Fill missing addresses with a placeholder such as none@example.com',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'That repairs one month downstream and has to be repeated every month.',
      3: 'Deleting orders hides the problem, loses real orders and can bias every figure built from the file.',
      5: 'A placeholder fills the cell without supplying a value: it turns a visible gap into a hidden one.',
    },
    solution: 'Required fields, validation at the point of entry and telling customers why the address matters all stop the gap from arising. Hand look-ups, deletion and placeholders act after the fact; the last two also make the data worse.',
  },
  {
    id: 'b01-dq-i4', type: 'classify', kind: 'applied',
    prompt: 'Which way does each problem push the figure named?',
    items: [
      'Duplicate rows in the order export → the number of orders',
      'Region spelled “North”, “north” and “Nth” → the orders shown for “North”',
      'Ratings given mostly by satisfied subscribers → the average rating of all customers',
      'A month’s report run before the last night’s app orders synced → the month’s orders',
      'A rating of 9 typed for a 4 → the average rating',
      'Orders dated by UTC instead of local time → the orders on one particular day',
    ],
    categories: ['Too high', 'Too low', 'Could go either way'],
    answer: [0, 1, 0, 1, 0, 2],
    feedback: {
      1: 'Orders written “north” or “Nth” are counted under other labels, so “North” shows too few.',
      3: 'The missing night’s orders aren’t counted at all.',
      5: 'A day loses its own late evening and gains the previous evening’s orders, so it can end up higher or lower.',
    },
    solution: 'Duplicates, a satisfied group that rates more often and a typed 9 all push their figures up. Split spellings and late data push them down. Dating by UTC moves orders from one day to the next, so a particular day can gain or lose.',
  },
  {
    id: 'b01-dq-i5', type: 'num', kind: 'numerical',
    prompt: 'E-mail is required on every order. In a fictional extract of 250 orders, 235 have an e-mail address. What is the completeness of the e-mail column? One decimal place.',
    answer: 94, check: () => 235 / 250 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 6, say: 'That is the share missing. Completeness is the share present.' },
      { value: 15, say: 'That is the number of missing addresses, not a percentage.' },
    ],
    solution: 'Completeness = values present ÷ values required × 100 = 235 ÷ 250 × 100 = 94.0%. Fifteen orders (6%) lack a required address.',
  },
  {
    id: 'b01-dq-i6', type: 'mc', kind: 'conceptual',
    prompt: 'An order’s quantity is recorded as 3 packs, a whole number between 1 and 200 as Lantern’s rules require, but the customer actually ordered 2. Which statement is correct?',
    options: [
      'The value is valid but inaccurate',
      'The value is invalid',
      'The value is inaccurate, so it must also be invalid',
      'The value is valid, so it must be accurate',
    ],
    answer: 0,
    feedback: {
      1: 'It meets every rule: a whole number between 1 and 200.',
      2: 'Inaccurate values can be perfectly valid; that is why rules can’t catch them.',
      3: 'Passing the rules shows the value is possible, not that it is true.',
    },
    solution: 'Validity is about conforming to the rules; accuracy is about matching reality. A quantity of 3 is possible, so it is valid, but it doesn’t match the customer’s order, so it is inaccurate. Only a comparison with the source, such as the payment record, would catch it.',
  },
];

export const check = [
  {
    id: 'b01-dq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Suppose Ana had run her November report at 07:30 on 1 December, before app orders from the night of 30 November reached the platform at 09:00. Which dimension would that mainly affect?',
    options: ['Timeliness', 'Uniqueness', 'Validity', 'Consistency'],
    answer: 0,
    feedback: {
      1: 'Nothing is recorded twice.',
      2: 'The values that arrived are fine; some hadn’t arrived yet.',
      3: 'Nothing is recorded in two different ways.',
    },
    solution: 'The data wouldn’t yet have reflected the whole period when the report was run: a timeliness failure. Waiting for the overnight sync before pulling the month prevents it, which is why Ana downloads the export after the sync.',
  },
  {
    id: 'b01-dq-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery’s export for one day lists 52 orders worth $1,560 in total, but 4 of the rows repeat other rows. The four repeated orders were worth $30, $45, $25 and $20. What was the day’s true revenue?',
    answer: 1440, check: () => 1560 - (30 + 45 + 25 + 20), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1560, say: 'That is the revenue as exported, including the repeated rows.' },
      { value: 1680, say: 'The repeated rows were already counted in the $1,560; subtract them, don’t add them.' },
      { value: 120, say: 'That is the value of the repeated rows: subtract it from the exported total.' },
    ],
    solution: 'The repeated rows add 30 + 45 + 25 + 20 = $120 that was never earned. True revenue = 1,560 − 120 = $1,440, from 48 orders. The export overstated revenue by 120 ÷ 1,440 ≈ 8.3%.',
  },
  {
    id: 'b01-dq-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Which dimension does each problem in Harborview Hotel’s data (fictional) mainly affect?',
    items: [
      'Two rows for the same booking, created by a sync',
      'A nightly rate of $9,999 for a standard room, far above the highest rate on the hotel’s price list',
      'Check-in dates written 2026-06-01 in one system and 01/06/2026 in another',
      'A guest’s country recorded as Canada when they live in Mexico',
      'Cancellations entered a week after they happen',
      'Bookings with no check-out date, which is required',
    ],
    categories: DIMS,
    answer: [5, 3, 2, 0, 4, 1],
    feedback: {
      1: 'The rate is outside the allowed range, which a rule can catch: validity.',
      2: 'The same thing is represented differently in different places: consistency.',
      3: 'Canada is a valid country, so no rule catches it; it is wrong about the guest: accuracy.',
      4: 'The data doesn’t reflect reality when it is needed: timeliness.',
    },
    solution: 'Repeated booking: uniqueness. $9,999 placeholder: validity. Two date formats: consistency. Wrong country: accuracy. Late cancellations: timeliness. Missing check-out dates: completeness.',
  },
  {
    id: 'b01-dq-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s ratings are optional: subscribers rate most of their orders, one-off buyers rarely do. Ana wants to know how satisfied one-off buyers are. What is the best judgement?',
    options: [
      'Treat them as weak evidence: report the one-off average with its count, and ask a random sample of one-off buyers',
      'Use the overall average rating, since it includes the one-off buyers who did rate their orders',
      'Discard the ratings entirely: with so many of them missing, they can tell Ana nothing about any group of customers',
      'Fill the missing ratings with the overall average, then calculate the one-off buyers’ average from the full column',
    ],
    answer: 0,
    feedback: {
      1: 'The overall average is dominated by subscribers, who give most of the ratings.',
      2: 'Missing ratings limit what the data can show; they don’t make every use impossible. The one-off ratings that exist are evidence, reported with their count.',
      3: 'Filling the gaps with an average invents ratings, mostly subscribers’, and hides how little one-off evidence there is.',
    },
    solution: 'Fitness depends on the purpose. For one-off buyers’ satisfaction the relevant ratings are few and possibly unrepresentative, so report them separately with their count and caveat, and, if the decision matters, collect better evidence from a random sample of one-off buyers.',
  },
  {
    id: 'b01-dq-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s 80 online reviews average 4.15 stars, but one review was entered as 0 stars by mistake; the guest gave 4. Once it is corrected, what is the average? Two decimal places.',
    answer: 4.2, check: () => (4.15 * 80 - 0 + 4) / 80, unit: 'stars', places: 2, tol: 0.006,
    wrong: [
      { value: 4.1, say: 'The recorded 0 was too low, so correcting it raises the average: add (4 − 0) ÷ 80 = 0.05.' },
      { value: 8.15, say: 'Spread the 4-star error over all 80 reviews: 4 ÷ 80 = 0.05.' },
    ],
    solution: 'Shift = (x wrong − x right) ÷ n = (0 − 4) ÷ 80 = −0.05: the recorded average is 0.05 stars too low. Corrected average = 4.15 + 0.05 = 4.20 stars.',
  },
  {
    id: 'b01-dq-k6', type: 'rows', kind: 'applied',
    prompt: 'This extract from Lantern’s export (fictional) should have one row per order, a region from North, South, East, West and Central, a quantity of at least 1, and a rating from 1 to 5 or blank (ratings are optional). Select every row with a quality problem. Where an order appears twice, select only the later copy.',
    data: { table: {
      head: ['order_id', 'region', 'quantity', 'rating'],
      rows: [
        ['LC-11810', 'North', '2', '5'],
        ['LC-11811', 'north', '1', ''],
        ['LC-11812', 'East', '0', '4'],
        ['LC-11813', 'West', '1', ''],
        ['LC-11814', 'Central', '3', '7'],
        ['LC-11815', 'South', '1', '4'],
        ['LC-11813', 'West', '1', ''],
        ['LC-11816', 'Nth', '2', '5'],
      ],
    } },
    answer: [1, 2, 4, 6, 7],
    solution: 'Row 1: “north” is North written another way, a consistency problem (it also fails the rule that region must be one of the five names). Row 2: a quantity of 0 breaks the rule of at least 1 (validity). Row 4: a rating of 7 is outside 1–5 (validity). Row 6 repeats row 3 (uniqueness). Row 7: “Nth” is North abbreviated, the same consistency problem. The blank ratings in rows 1 and 3 are allowed, so they are not problems in themselves.',
  },
];
