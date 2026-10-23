// kpis.ex.js — B01 · KPIs: measuring what matters: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Uses TARGETS from case.js for the widget defaults; every business and figure in the exercises is fictional.
import { TARGETS as T } from './case.js';

const money = (v, d = 0) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const int = (v) => Math.round(v).toLocaleString('en-US');

export const widgets = {
  'kpi-driver': {
    type: 'formula',
    title: 'Revenue from its drivers',
    intro: 'Revenue = visits × conversion rate × average order value. Set the three drivers and a revenue target.',
    inputs: [
      { id: 'visits', label: 'Visits in the month', min: 5000, max: 20000, step: 100, value: 10000, fmt: 'int', unit: 'visits' },
      { id: 'conv', label: 'Conversion rate', min: 1, max: 5, step: 0.1, value: T.conversion, fmt: 'pct' },
      { id: 'aov', label: 'Average order value', min: 30, max: 70, step: 0.5, value: T.aov, fmt: 'money' },
      { id: 'target', label: 'Revenue target', min: 5000, max: 30000, step: 500, value: T.monthlyRevenue, fmt: 'money' },
    ],
    compute: (v) => {
      const orders = v.visits * v.conv / 100;
      const rev = orders * v.aov;
      const perVisit = (v.conv / 100) * v.aov;
      const needVisits = v.target / perVisit;
      const needConv = (v.target / (v.visits * v.aov)) * 100;
      const needAov = v.target / orders;
      const gap = rev - v.target;
      return {
        headline: { label: 'Revenue', value: money(rev) },
        rows: [
          ['Orders (visits × conversion)', `about ${int(orders)}`],
          ['Revenue per visit (conversion × AOV)', money(perVisit, 2)],
          ['Revenue as a share of the target', pct((rev / v.target) * 100, 1)],
          ['Visits needed at this conversion and AOV', int(needVisits)],
          ['Conversion needed at these visits and AOV', pct(needConv, 2)],
          ['AOV needed at these visits and conversion', money(needAov, 2)],
        ],
        note: gap >= 0
          ? `Revenue reaches the target with ${money(gap)} to spare. Each visit is worth ${money(perVisit, 2)} on average.`
          : `Revenue is ${money(-gap)} short of the target. Any one of these would close the gap on its own: ${int(needVisits)} visits, a conversion rate of ${pct(needConv, 2)}${needConv > 6 ? ' (far above what most shops achieve)' : ''}, or an AOV of ${money(needAov, 2)}.${v.conv >= T.conversion && v.aov >= T.aov ? ' Meeting the conversion and AOV targets does not guarantee the revenue target: traffic matters too.' : ''}`,
        chart: { kind: 'bar', x: { label: 'Measure', values: ['Revenue', 'Target'] }, series: [{ name: 'Dollars', values: [Math.round(rev), v.target] }], y: { label: 'Dollars', format: 'money' } },
      };
    },
  },
  'kpi-campaign': {
    type: 'formula',
    title: 'What a low-converting campaign does to the conversion rate',
    intro: 'A shop’s usual traffic and a paid campaign’s traffic, each with its own conversion rate (fictional).',
    inputs: [
      { id: 'core', label: 'Usual visits', min: 4000, max: 15000, step: 100, value: 8000, fmt: 'int', unit: 'visits' },
      { id: 'coreConv', label: 'Conversion of usual visits', min: 1, max: 6, step: 0.1, value: 3.6, fmt: 'pct' },
      { id: 'camp', label: 'Campaign visits', min: 0, max: 10000, step: 100, value: 3000, fmt: 'int', unit: 'visits' },
      { id: 'campConv', label: 'Conversion of campaign visits', min: 0.2, max: 4, step: 0.1, value: 1.5, fmt: 'pct' },
      { id: 'aov', label: 'Average order value', min: 30, max: 70, step: 0.5, value: 45, fmt: 'money' },
    ],
    compute: (v) => {
      const coreOrders = v.core * v.coreConv / 100;
      const campOrders = v.camp * v.campConv / 100;
      const orders = coreOrders + campOrders;
      const overall = (orders / (v.core + v.camp)) * 100;
      return {
        headline: { label: 'Overall conversion rate', value: pct(overall) },
        rows: [
          ['Orders with the campaign', `about ${int(orders)}`],
          ['Orders without it', `about ${int(coreOrders)}`],
          ['Conversion without it', pct(v.coreConv)],
          ['Revenue with the campaign', money(orders * v.aov)],
          ['Revenue without it', money(coreOrders * v.aov)],
        ],
        note: v.camp === 0
          ? 'With no campaign traffic, the overall rate is the usual rate. Add campaign visits to see the overall rate move.'
          : v.campConv < v.coreConv
            ? `The campaign lowers the overall conversion rate by ${(v.coreConv - overall).toFixed(2)} percentage points, yet adds about ${int(campOrders)} orders and ${money(campOrders * v.aov)} of revenue. Someone paid on conversion alone would want it stopped; whether it is worth its cost depends on that cost and the margin on the extra orders.`
            : `The campaign converts at least as well as the usual traffic, so it raises orders and does not lower the conversion rate.`,
        chart: { kind: 'bar', x: { label: 'Scenario', values: ['With campaign', 'Without campaign'] }, series: [{ name: 'Orders', values: [Math.round(orders), Math.round(coreOrders)] }], y: { label: 'Orders', format: 'int' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-kpi-g1', type: 'num', kind: 'numerical',
    prompt: 'A fictional online bookshop had 18,500 sessions and 444 paid orders in May. What was its conversion rate (paid orders per session)? Give a percentage to two decimal places.',
    answer: 2.4, check: () => 444 / 18500 * 100, unit: '%', places: 2, tol: 0.005,
    hints: ['Conversion rate = orders ÷ visits × 100. Which count is the numerator?', '444 ÷ 18,500 = 0.024. Now express it as a percentage.'],
    wrong: [
      { value: 0.024, say: 'That is the proportion. Multiply by 100 to express it as a percentage.' },
      { value: 41.67, tol: 0.05, say: 'You divided visits by orders: that is the number of sessions per order. Put orders on top.' },
    ],
    solution: 'Conversion = 444 ÷ 18,500 × 100 = 2.40%: about 2.4 paid orders for every 100 sessions.',
  },
  {
    id: 'b01-kpi-g2', type: 'classify', kind: 'conceptual',
    prompt: 'For an online shop whose objective is profitable growth, classify each measure as a leading or a lagging indicator.',
    items: ['Revenue for the quarter', 'Visits to the shop this week', 'Checkouts started today', 'Returning-customer share for the year', 'Newsletter sign-ups this month', 'Profit for the year'],
    categories: ['Leading indicator', 'Lagging indicator'],
    answer: [1, 0, 0, 1, 0, 1],
    hints: ['Ask whether the measure is the result the business ultimately wants, or something that happens on the way to it.', 'Visits, checkouts and sign-ups happen before orders are placed; revenue, repeat business and profit are counted afterwards.'],
    feedback: {
      0: 'Revenue for a quarter is counted after the sales have happened: a lagging outcome.',
      2: 'A started checkout comes before the order it may become, so it signals orders to come.',
      3: 'A year’s returning share records what customers already did: lagging.',
      4: 'Sign-ups come before the orders they may lead to: leading, if the link holds.',
    },
    solution: 'Leading: visits, checkouts started and newsletter sign-ups, which come before orders. Lagging: quarterly revenue, the year’s returning share and annual profit, which record outcomes. A leading indicator is only worth steering by if past data show it really does move ahead of the outcome.',
  },
  {
    id: 'b01-kpi-g3', type: 'steps', kind: 'applied',
    prompt: 'Brightleaf Tea, a fictional online tea shop, recorded in March: 12,000 visits, 336 orders, revenue of $13,104 and 210 orders that were a customer’s first. Its targets are a conversion rate of 3.0% and an AOV of $40. Build its scorecard.',
    solution: 'Conversion = 336 ÷ 12,000 × 100 = 2.80%, 0.2 percentage points below the 3.0% target. AOV = 13,104 ÷ 336 = $39.00, 97.5% of the $40 target. Returning share = (336 − 210) ÷ 336 × 100 = 37.5%. The shop is slightly below target on conversion and AOV.',
    steps: [
      { id: 'b01-kpi-g3-s1', type: 'num', prompt: 'What was the conversion rate? Give a percentage to two decimal places.',
        answer: 2.8, check: () => 336 / 12000 * 100, unit: '%', places: 2, tol: 0.005,
        hints: ['Orders ÷ visits × 100.'],
        wrong: [{ value: 35.71, say: 'That is visits per order. Put orders on top.' }, { value: 0.028, say: 'That is the proportion; multiply by 100.' }] },
      { id: 'b01-kpi-g3-s2', type: 'num', prompt: 'By how many percentage points is conversion below its 3.0% target? Enter a positive number.',
        answer: 0.2, check: () => 3.0 - 336 / 12000 * 100, unit: 'percentage points', places: 1, tol: 0.005,
        hints: ['For a KPI that is a percentage, subtract the two percentages.'],
        wrong: [{ value: 6.67, tol: 0.05, say: 'That is the relative shortfall (0.2 ÷ 3.0 × 100). The question asks for percentage points: 3.0 − 2.8.' }] },
      { id: 'b01-kpi-g3-s3', type: 'num', prompt: 'What was the average order value, in dollars?',
        answer: 39, check: () => 13104 / 336, unit: '$', places: 2, tol: 0.005,
        hints: ['AOV = revenue ÷ orders.'],
        wrong: [{ value: 1.09, say: 'That is revenue per visit (13,104 ÷ 12,000). AOV divides by orders.' }] },
      { id: 'b01-kpi-g3-s4', type: 'num', prompt: 'What was the returning-customer share of orders? Give a percentage to one decimal place.',
        answer: 37.5, check: () => (336 - 210) / 336 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Returning orders are all orders except first orders.', '(336 − 210) ÷ 336 × 100.'],
        wrong: [{ value: 62.5, say: 'That is the share of first orders. The returning share is what is left: 100 − 62.5.' }] },
    ],
  },
  {
    id: 'b01-kpi-g4', type: 'fill', kind: 'applied',
    prompt: 'Complete Lantern’s KPI dictionary entry for the rating response rate.',
    text: 'Rating response rate. Numerator: [[0]]. Denominator: [[1]]. Both counts refer to orders [[2]] in the month. Report it beside [[3]].',
    blanks: [
      { options: ['orders placed in the month that were rated', 'ratings received in the month, whenever the order was placed', 'five-star ratings received in the month'], answer: 0 },
      { options: ['orders placed in the month', 'visits in the month', 'customers on the mailing list'], answer: 0 },
      { options: ['placed', 'delivered', 'rated'], answer: 0 },
      { options: ['the average rating', 'the conversion rate', 'the average order value'], answer: 0 },
    ],
    hints: ['The numerator must come from the denominator’s population, and both must cover the same period.', 'A rating can arrive weeks after the order. Which month should it count in, if it is to match the denominator?'],
    solution: 'Rated orders ÷ orders, both for orders placed in the month, so that a late rating is counted with the order it belongs to. The rate says how many customers the average rating speaks for, so report the two together.',
  },
];

export const independent = [
  {
    id: 'b01-kpi-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional online plant shop took $27,540 from 612 orders in October. What was its average order value, in dollars?',
    answer: 45, check: () => 27540 / 612, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 0.02, say: 'You divided orders by revenue. AOV is revenue ÷ orders.' }],
    solution: 'AOV = revenue ÷ orders = 27,540 ÷ 612 = $45.00.',
  },
  {
    id: 'b01-kpi-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional online bakery took 850 orders in a month, of which 527 were a customer’s first ever order. What was its returning-customer share of orders? Give a percentage to one decimal place.',
    answer: 38, check: () => (850 - 527) / 850 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 62, say: 'That is the share of first orders. Returning orders are the rest: 850 − 527 = 323.' },
      { value: 61.29, say: 'You divided returning orders by first orders (323 ÷ 527). The denominator is all orders.' },
    ],
    solution: 'Returning orders = 850 − 527 = 323. Share = 323 ÷ 850 × 100 = 38.0%. It is a share of orders, not of customers.',
  },
  {
    id: 'b01-kpi-i3', type: 'rows', kind: 'applied',
    prompt: 'Harborview Hotel’s new manager (fictional) proposes these monthly KPIs. Select every one whose numerator and denominator do not come from the same population or the same period.',
    data: { table: {
      head: ['KPI', 'Proposed formula'],
      rows: [
        ['Occupancy rate', 'Room-nights sold ÷ room-nights available in the month × 100'],
        ['Website booking conversion', 'All bookings (website, phone and travel agents) ÷ website sessions × 100'],
        ['Cancellation rate', 'Bookings made in the month that were later cancelled ÷ bookings made in the month × 100'],
        ['Average daily rate', 'Room revenue ÷ room-nights sold in the month'],
        ['Review rate', 'Reviews received this month ÷ guests who checked out in the same month last year × 100'],
        ['App booking conversion', 'App bookings ÷ app sessions × 100'],
      ],
    } },
    answer: [1, 4],
    solution: 'Website conversion puts phone and agent bookings over website sessions, so it mixes populations and overstates the rate: use website bookings only. The review rate divides this month’s reviews by last year’s guests, a mismatch of periods: use reviews from guests who checked out in the month ÷ guests who checked out in the month. The other four take numerator and denominator from the same population and period.',
  },
  {
    id: 'b01-kpi-i4', type: 'mc', kind: 'applied',
    prompt: 'A fictional coffee wholesaler pays its warehouse pickers a bonus for orders picked per hour. Which measure would make the best guardrail?',
    options: [
      'Picking errors per 1,000 orders shipped',
      'Total hours worked by pickers each week',
      'Orders picked per day, warehouse-wide',
      'Number of pickers on each shift',
    ],
    answer: 0,
    feedback: {
      1: 'Hours worked is an input, and would not reveal whether speed is being bought with mistakes.',
      2: 'Orders per day measures the same thing as orders per hour; it would rise with any gaming of speed, not catch it.',
      3: 'Headcount says nothing about the quality of the picking.',
    },
    solution: 'The cheapest way to pick faster is to pick carelessly. Picking errors per 1,000 orders would rise if that happened, so it guards against speed gained at the expense of accuracy.',
  },
  {
    id: 'b01-kpi-i5', type: 'classify', kind: 'conceptual',
    prompt: 'For each of these Lantern measures, which direction should its KPI dictionary state?',
    items: ['Refund rate', 'Average order value', 'Days of coffee stock on hand', 'Average delivery time (days)', 'Conversion rate', 'Share of orders shipped the same day'],
    categories: ['Higher is better', 'Lower is better', 'Keep within a band'],
    answer: [1, 0, 2, 1, 0, 0],
    feedback: {
      0: 'Refunds are money returned and usually a sign of a problem: lower is better.',
      2: 'Too little stock means lost sales; too much means stale beans and cash tied up. Set a band.',
      3: 'Customers want their coffee sooner: lower is better.',
    },
    solution: 'Higher is better: AOV, conversion and the same-day shipping share. Lower is better: the refund rate and delivery time. Stock on hand needs a band, because both too little and too much are costly. Writing the direction down stops a dashboard from praising a rising refund rate.',
  },
  {
    id: 'b01-kpi-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional online cookware shop converts 2.5% of its visits, and its AOV is $48. How many visits does it need in a month to reach revenue of $18,000?',
    answer: 15000, check: () => 18000 / ((2.5 / 100) * 48), unit: 'visits', places: 0, tol: 0.5,
    wrong: [
      { value: 150, say: 'You used 2.5 rather than 0.025 for the conversion rate. Convert the percentage first.' },
      { value: 375, say: 'That is the number of orders needed (18,000 ÷ 48). Divide it by the conversion rate to get visits.' },
    ],
    solution: 'Revenue per visit = 0.025 × 48 = $1.20. Visits needed = 18,000 ÷ 1.20 = 15,000. Equivalently, 18,000 ÷ 48 = 375 orders, and 375 ÷ 0.025 = 15,000 visits.',
  },
];

export const check = [
  {
    id: 'b01-kpi-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What turns a metric into a key performance indicator?',
    options: [
      'It tracks a business objective and has a target, a direction and an owner.',
      'It is expressed as a percentage, so that months and channels of different sizes can be compared.',
      'It is shown on the company dashboard, where every manager sees it highlighted in colour.',
      'It is calculated automatically every day by the shop platform, without any manual work.',
    ],
    answer: 0,
    feedback: {
      1: 'Revenue is a count of dollars and is often a KPI; many percentages are not KPIs.',
      2: 'A dashboard displays KPIs; appearing on one doesn’t make a number a KPI, and colour alone shouldn’t carry meaning.',
      3: 'How often, or how easily, a metric can be calculated says nothing about whether it tracks an objective.',
    },
    solution: 'A KPI is a metric with a job: it tracks progress towards an objective, and it comes with a target, a direction and someone accountable, as well as an exact formula.',
  },
  {
    id: 'b01-kpi-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional online pet-food shop took 640 orders in June, and 208 of them were rated. What was its rating response rate? Give a percentage to one decimal place.',
    answer: 32.5, check: () => 208 / 640 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 307.69, say: 'You divided orders by rated orders. The numerator is the rated orders.' },
      { value: 67.5, say: 'That is the share of orders that were not rated.' },
    ],
    solution: 'Rating response rate = 208 ÷ 640 × 100 = 32.5%. The average rating therefore speaks for about one order in three.',
  },
  {
    id: 'b01-kpi-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional online shop’s conversion rate rose from 2.8% in March to 3.4% in April, while its orders fell from 560 to 510. What is the best explanation?',
    options: [
      'Visits fell faster than orders did, so the rate rose because its denominator shrank.',
      'Each visit became more valuable, so the shop is doing better overall than in March.',
      'The figures must be wrong, because a conversion rate cannot rise while orders fall.',
      'Visits rose sharply, and the extra traffic pushed the conversion rate up with them.',
    ],
    answer: 0,
    feedback: {
      1: 'Each remaining visit converted better, but the shop sold less: 50 fewer orders. A higher rate is not automatically better news.',
      2: 'A rate rises whenever its denominator falls faster than its numerator. Nothing here is impossible.',
      3: 'Visits = orders ÷ conversion: 560 ÷ 0.028 = 20,000 in March and 510 ÷ 0.034 = 15,000 in April. Visits fell.',
    },
    solution: 'Visits = orders ÷ conversion rate: 560 ÷ 0.028 = 20,000 and 510 ÷ 0.034 = 15,000. Visits fell by a quarter while orders fell by under a tenth, so the rate rose. Reading the rate without its counts would have reported a good month.',
  },
  {
    id: 'b01-kpi-k4', type: 'num', kind: 'numerical',
    prompt: 'A fictional online shop expects 12,500 visits next month, a conversion rate of 2.8% and an AOV of $46. What revenue does that imply, in dollars?',
    answer: 16100, check: () => 12500 * (2.8 / 100) * 46, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1610000, say: 'You used 2.8 instead of 0.028 for the conversion rate. Divide the percentage by 100.' },
      { value: 350, say: 'That is the number of orders. Multiply by the AOV to get revenue.' },
    ],
    solution: 'Orders = 12,500 × 0.028 = 350. Revenue = 350 × $46 = $16,100.',
  },
  {
    id: 'b01-kpi-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these help stop a KPI from being gamed? Select all that apply.',
    options: [
      'Pairing it with a measure that would suffer if it were gamed',
      'Adding a guardrail metric that must not get worse',
      'Writing down its formula and fixing it',
      'Raising its target every month',
      'Reporting only the rate, so attention stays on one number',
      'Reporting the counts behind the rate',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'A higher target increases the pressure to move the number by any means; it doesn’t protect the measure.',
      4: 'Hiding the counts makes gaming easier to miss: a rate can rise because its denominator fell.',
    },
    solution: 'Balanced pairs and guardrails make the cheap ways of moving a KPI visible; a fixed, written formula stops quiet redefinition; and the counts show whether a rate moved through its numerator or its denominator.',
  },
  {
    id: 'b01-kpi-k6', type: 'classify', kind: 'applied',
    prompt: 'Ana wants Lantern’s KPIs to cover all four perspectives of Kaplan and Norton’s balanced scorecard. Classify each measure by the perspective it mainly represents.',
    items: ['Monthly revenue', 'Returning-customer share', 'Conversion rate of visits to orders', 'New coffees developed and launched this year', 'Average rating of orders', 'Share of roasted batches that pass the taste test first time'],
    categories: ['Financial', 'Customer', 'Internal process', 'Innovation and learning'],
    answer: [0, 1, 2, 3, 1, 2],
    feedback: {
      2: 'Conversion measures how well the shop’s process turns a visit into a sale.',
      3: 'Developing new products is the business’s capacity to improve and create value: innovation and learning.',
      4: 'Ratings are the customer’s view of the business.',
      5: 'Getting roasting right first time is an internal process the business must excel at.',
    },
    solution: 'Financial: revenue. Customer: returning share and average rating. Internal process: conversion and batches passing the taste test first time. Innovation and learning: new coffees launched. Lantern’s original four targets had nothing in the last perspective.',
  },
];
