// assess-m2.js — B01 module 2 test: Data and where it comes from (data-types, data-collection, data-quality).
// No hints. Each item has a full solution, shown when the student reviews the test.
// Every business and figure is fictional except Lantern’s October order count, which comes from case.js.
import { DERIVED, UTC_OFFSET_HOURS } from './case.js?v=13';

const OCT = 3;   // index of Oct 2026 in case.js arrays
const BEHIND = -UTC_OFFSET_HOURS;   // hours Lantern's local time is behind UTC
const WORDS = { 4: 'four', 5: 'five', 6: 'six' };
const CUT = `${24 - BEHIND}:00`;      // local time from which orders take the next day's UTC date
// m2-8: local order times (late November 2026), the UTC timestamps the platform stores, and which change date
const LOCAL = ['2026-11-27T18:40', '2026-11-27T19:05', '2026-11-27T21:30', '2026-11-28T00:30', '2026-11-28T04:10', '2026-11-28T20:15', '2026-11-28T23:59'];
const toUtc = (t) => new Date(Date.parse(`${t}:00Z`) + BEHIND * 3600000).toISOString().replace('.000Z', 'Z');
const localLabel = (t) => `${Number(t.slice(8, 10))} Nov ${t.slice(11, 16)}`;
const MOVED = LOCAL.map((t, i) => (toUtc(t).slice(0, 10) !== t.slice(0, 10) ? i : -1)).filter((i) => i >= 0);

export const items = [
  {
    id: 'b01-m2-1', lesson: 'data-types', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional gym records these variables for each member. Classify each by level of measurement.',
    items: ['Member number', 'Membership tier (Basic, Plus, Premium)', 'Visits last month', 'Date the member joined', 'Monthly fee ($)', 'Favourite class (yoga, spin, boxing)'],
    categories: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    answer: [0, 1, 3, 2, 3, 0],
    feedback: {
      0: 'A member number is an identifier: a label written with digits, so nominal.',
      1: 'Tiers are ordered, but the gap from Basic to Plus needn’t equal the gap from Plus to Premium: ordinal.',
      3: 'Differences between dates are meaningful (days since joining); ratios are not: interval.',
      5: 'Classes are categories with no order: nominal.',
    },
    solution: 'Member number and favourite class: nominal. Membership tier: ordinal. Joining date: interval. Visits and the monthly fee: ratio, because zero means none and ratios make sense (8 visits is twice 4).',
  },
  {
    id: 'b01-m2-2', lesson: 'data-types', type: 'mc', kind: 'applied',
    prompt: 'A fictional chain of 30 cafés records each café’s sales in each of the last 52 weeks. What kind of data is this, and what can it show that one week’s figures for all 30 cafés can’t?',
    options: [
      'Panel data: it shows how each café’s sales changed through the year',
      'Time-series data: it shows the chain’s total for each week but nothing about individual cafés',
      'Cross-sectional data: it compares the cafés at a single point in time',
      'Unstructured data: it must be coded before it can be analysed',
    ],
    answer: 0,
    feedback: {
      1: 'There are 30 units, each followed separately; a time series follows one unit, such as the chain’s total.',
      2: 'One week’s figures for all cafés would be cross-sectional; 52 weeks of the same cafés is more than that.',
      3: 'Weekly sales by café fit a table of rows and columns: structured data.',
    },
    solution: 'The same 30 units observed in 52 periods make panel data. One week’s figures (a cross-section) compare cafés; the chain’s weekly total (a time series) shows the trend; only the panel shows how each café changed, for example whether a refurbished café grew faster than the rest.',
  },
  {
    id: 'b01-m2-3', lesson: 'data-types', type: 'num', kind: 'numerical',
    prompt: 'An export of one afternoon’s online orders (fictional) has one row per order: 6 orders from 4 customers, totalling $252.00. What was the average spend per customer that afternoon?',
    answer: 63, check: () => 252 / 4, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 42, say: 'That is the average per order (252 ÷ 6). The question’s unit is the customer: divide by the 4 customers.' },
      { value: 252, say: 'That is the afternoon’s total. Divide it by the number of customers.' },
    ],
    solution: 'One row is one order, but the question is about customers. Total ÷ distinct customers = 252.00 ÷ 4 = $63.00 per customer. Per order it would be 252.00 ÷ 6 = $42.00: the unit decides the answer.',
  },
  {
    id: 'b01-m2-4', lesson: 'data-collection', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern offers free delivery on orders over $35. Ana wants to know whether raising the threshold to $40 would raise the average order value. Which approach can best show cause and effect?',
    options: [
      'Randomly show half of website visitors the $40 threshold for four weeks and compare the groups',
      'Compare average order value in the month before and the month after raising the threshold for everyone',
      'Ask customers in a survey whether a higher threshold would make them spend more',
      'Compare customers who choose express delivery with those who don’t',
    ],
    answer: 0,
    feedback: {
      1: 'A before-and-after comparison mixes the change with everything else that changed between the two months, such as the season or a promotion.',
      2: 'A survey measures what people say they would do, which often differs from what they do.',
      3: 'Customers choose their delivery, so the two groups differ in many ways besides delivery.',
    },
    solution: 'Only random assignment makes the two groups alike on average in everything except the offer, so that a clear difference in order value can be attributed to the offer rather than to who received it or when. That is an A/B test.',
  },
  {
    id: 'b01-m2-5', lesson: 'data-collection', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline e-mails a satisfaction survey to 2,000 passengers, and 400 reply; 300 of them say they were satisfied. How many percentage points wide is the range of possible values for the share of all 2,000 passengers who were satisfied, allowing for anything the non-respondents might have said?',
    answer: 80, check: () => ((300 + (2000 - 400)) / 2000 - 300 / 2000) * 100, unit: 'points', places: 0, tol: 0.5,
    wrong: [
      { value: 20, say: 'That is the response rate (400 ÷ 2,000). The range runs from the lowest possible share to the highest; its width is set by the non-respondents.' },
      { value: 75, say: 'That is the respondents’ share satisfied (300 ÷ 400), a point inside the range, not its width.' },
      { value: 95, say: 'That is the top of the range. Subtract the bottom, 300 ÷ 2,000 = 15%.' },
    ],
    solution: 'Lowest possible: 300 ÷ 2,000 = 15% (no non-respondent satisfied). Highest: (300 + 1,600) ÷ 2,000 = 95% (all of them satisfied). Width = 95 − 15 = 80 percentage points, which is the share who didn’t reply: 1,600 ÷ 2,000. The respondents’ 75% says nothing about where in that range the truth lies.',
  },
  {
    id: 'b01-m2-6', lesson: 'data-collection', type: 'classify', kind: 'conceptual',
    prompt: 'What is the main problem with each of these fictional survey questions?',
    items: [
      '“How did you find our new self-service kiosk?”, asked of every customer, including those who ordered at the counter',
      '“How happy were you with the price and quality of our coffee?”',
      '“How many times did you visit a café in the past five years?”',
      '“Wouldn’t you say our new café is the best in town?”',
    ],
    categories: ['Double-barrelled', 'Leading', 'Unanswerable from memory', 'Asked of people it doesn’t apply to'],
    answer: [3, 0, 2, 1],
    feedback: {
      0: 'Counter customers never used the kiosk; route them past the question with a filter question.',
      1: 'Price and quality are two things; a customer may like one and not the other.',
      3: 'The wording tells respondents the expected answer.',
    },
    solution: 'Kiosk question: asked of people it doesn’t apply to (add a filter question). Price and quality: double-barrelled (split it). Five years of café visits: unanswerable from memory (ask about a short, recent period). “Best in town”: leading (ask for a rating on a balanced scale).',
  },
  {
    id: 'b01-m2-7', lesson: 'data-collection', type: 'rows', kind: 'applied',
    prompt: 'Harborview Hotel (fictional) asked every guest who stayed in October: “How satisfied were you with the new spa?” The extract shows eight answers and, from the booking records, whether each guest used the spa. Select every answer that can’t be an evaluation of the spa.',
    data: { table: {
      head: ['Guest', 'Used the spa', 'Answer'],
      rows: [
        ['G-201', 'yes', 'Very satisfied'],
        ['G-202', 'no', 'Satisfied'],
        ['G-203', 'yes', 'Dissatisfied'],
        ['G-204', 'no', 'Very satisfied'],
        ['G-205', 'no', 'Neither'],
        ['G-206', 'yes', 'Satisfied'],
        ['G-207', 'yes', 'Very satisfied'],
        ['G-208', 'no', 'Satisfied'],
      ],
    } },
    answer: [1, 3, 4, 7],
    solution: 'Guests G-202, G-204, G-205 and G-208 never used the spa, yet answered, so their answers measure something else: their general mood, or politeness. That is measurement bias. Only the four spa users’ answers evaluate the spa. The next survey should ask first whether the guest used the spa and show the question only to those who did.',
  },
  {
    id: 'b01-m2-8', lesson: 'data-quality', type: 'rows', kind: 'applied',
    prompt: `Lantern’s platform stores order times in UTC, and Lantern’s local time is ${WORDS[BEHIND]} hours behind UTC. A daily report groups orders by the date of the stored UTC timestamp. Select every order that the report puts on a different day from the customer’s local day.`,
    data: { table: {
      head: ['order_id', 'Local time', 'Stored timestamp (UTC)'],
      rows: LOCAL.map((t, i) => [`LC-${11781 + i}`, localLabel(t), toUtc(t)]),
    } },
    answer: MOVED,
    solution: `Every order placed at ${CUT} local time or later is stored with the next day’s UTC date: LC-11782 and LC-11783 (27 November, reported on the 28th) and LC-11786 and LC-11787 (28 November, reported on the 29th). Orders in the early hours of local time stay on the same date, because adding ${WORDS[BEHIND]} hours doesn’t cross midnight. The timestamps are accurate; the report’s definition of a day doesn’t fit a business that works in local time.`,
  },
  {
    id: 'b01-m2-9', lesson: 'data-quality', type: 'num', kind: 'numerical',
    prompt: 'A fictional coffee shop’s export lists 205 rows worth $8,610 in total for a week in which it took 200 orders. The 5 extra rows repeat earlier orders and are worth $410 between them. What was the true average order value? Dollars and cents.',
    answer: 41, check: () => (8610 - 410) / 200, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 42, say: 'That is the average of the rows as exported (8,610 ÷ 205). Remove the repeated rows’ value and divide by the 200 real orders.' },
      { value: 43.05, say: 'That divides the inflated total by the true number of orders. Remove the $410 first.' },
      { value: 40, say: 'That removes the $410 but still divides by 205 rows. Divide by the 200 real orders.' },
    ],
    solution: 'True revenue = 8,610 − 410 = $8,200 from 200 orders, so the average order value is 8,200 ÷ 200 = $41.00. The export’s rows give 8,610 ÷ 205 = $42.00: the repeated orders were larger than average (410 ÷ 5 = $82 on average), so they lifted the average as well as the count.',
  },
  {
    id: 'b01-m2-10', lesson: 'data-quality', type: 'mc', kind: 'applied',
    prompt: `For October, Lantern’s dashboard shows ${DERIVED.orders[OCT]} online orders and the order export, once duplicates are removed, has ${DERIVED.orders[OCT]} rows. The accounting system records 322 online sales for October. What should the analyst do first?`,
    options: [
      'Find each system’s definition of a sale or order and explain the gap before choosing a figure',
      'Use the largest of the three figures, so that no sale is left out of the review',
      'Average the three figures, so that each system’s view counts equally in the review',
      `Treat the accounting figure as an error and report ${DERIVED.orders[OCT]}, because the other two sources agree on it`,
    ],
    answer: 0,
    feedback: {
      1: 'Choosing the largest figure doesn’t make it right; it may count things the review shouldn’t.',
      2: 'An average of three definitions is a figure that matches none of them.',
      3: 'The dashboard and the export come from the same platform, so their agreement says little; the accounting system may count something different.',
    },
    solution: 'Differences between systems usually come from definitions: when a sale is recorded (an order placed in September but paid in October, say), whether refunds or adjustments are included, which channel an order is assigned to. Find each definition, explain the gap of 3, and then use the figure whose definition fits the question; for counting orders customers placed, that is the platform’s.',
  },
  {
    id: 'b01-m2-11', lesson: 'data-quality', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about missing values is correct?',
    options: [
      'They bias an average when the missing values differ from those present, as when unhappy customers rate less',
      'They never bias an average; they only make it less precise, because fewer values are left to average',
      'Any blank in a column is a quality defect, whether or not the field is required',
      'Filling every blank with the column’s average removes the problem, because the average then stays exactly the same',
    ],
    answer: 0,
    feedback: {
      1: 'That is true only when values are missing completely at random. When the gaps fall more often on some kinds of value or customer, the average of what remains is biased.',
      2: 'Completeness is measured against what is required. A blank in an optional field, such as a rating, is allowed.',
      3: 'Filling blanks with the average invents values and hides the gap; if the missing values differ from the rest, the bias remains.',
    },
    solution: 'What matters is which values are missing, not only how many. If, say, less satisfied customers rate less often, the average of the ratings given overstates satisfaction. B02 teaches how to test for this and what to do about it.',
  },
];
