// assess-m1.js — B02 module 1 test: Understanding your data (datasets-and-variables, profiling-and-validation).
// No hints; solutions are shown when the student reviews the test. All businesses and tables are fictional.

// b02-m1-8: a bike-hire firm’s rentals (fictional) and its conditional cross-field rule. The key is computed from the rows:
// returned Yes needs an end_time later than start_time; returned No needs a blank end_time.
const HIRES = [
  ['R-501', '2026-08-01 09:00', '2026-08-01 10:30', 'Yes'],
  ['R-502', '2026-08-01 09:15', '', 'Yes'],
  ['R-503', '2026-08-01 09:40', '', 'No'],
  ['R-504', '2026-08-01 10:05', '2026-08-01 09:50', 'Yes'],
  ['R-505', '2026-08-01 10:20', '2026-08-01 12:00', 'No'],
  ['R-506', '2026-08-01 11:00', '2026-08-01 11:00', 'Yes'],
  ['R-507', '2026-08-01 11:30', '2026-08-02 08:10', 'Yes'],
  ['R-508', '2026-08-01 12:45', '', 'No'],
];
const hireBreaks = ([, start, end, returned]) => (returned === 'Yes' ? !(end && end > start) : end !== '');
const hireTime = (i, c) => HIRES[i][c].slice(11);

export const items = [
  {
    id: 'b02-m1-1', lesson: 'datasets-and-variables', type: 'mc', kind: 'conceptual',
    prompt: 'A clothing brand’s returns file (fictional) has the columns return_id, order_id, item_sku, size, reason and refund. One order can produce several returns, and each return covers exactly one item. What is the unit of observation?',
    options: ['One returned item', 'One order, with all its returns', 'One customer who returned something', 'One reason for returning'],
    answer: 0,
    feedback: {
      1: 'Several rows can share an order_id, so a row is smaller than an order.',
      2: 'Customers don’t appear in the file directly, and one customer can return many items from many orders.',
      3: 'reason is a variable describing each return, not the thing each row describes.',
    },
    solution: 'Each row is one return of one item, identified by return_id. order_id links the return to its order, which can have several returns, so counting rows counts returned items, not orders.',
  },
  {
    id: 'b02-m1-2', lesson: 'datasets-and-variables', type: 'classify', kind: 'conceptual',
    prompt: 'A battery-storage installer (fictional) records these variables for each installation. Classify each by its level of measurement.',
    items: ['System capacity (kWh)', 'Installation date', 'Customer satisfaction (1 to 5)', 'Installer ID', 'Battery chemistry (LFP or NMC)', 'Warranty length (years)'],
    categories: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    answer: [3, 2, 1, 0, 0, 3],
    feedback: {
      1: 'Differences between dates are meaningful (days from installation to first service), ratios are not: interval.',
      2: 'Ratings are ordered, but their steps needn’t be equal: ordinal.',
      3: 'An ID is a label, whatever characters it uses: nominal.',
    },
    solution: 'Capacity: ratio (zero means no storage; 10 kWh is twice 5 kWh). Installation date: interval. Satisfaction: ordinal. Installer ID: nominal. Chemistry: nominal (unordered categories). Warranty length: ratio (a duration with a true zero).',
  },
  {
    id: 'b02-m1-3', lesson: 'datasets-and-variables', type: 'num', kind: 'numerical',
    prompt: 'Harborview’s room-night table (fictional) has one row per booking per night. In June it has 2,460 rows covering 820 distinct booking_ids, and the rates on those rows add to $418,200. What is the average revenue per booking?',
    answer: 510, check: () => 418200 / 820, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 170, say: 'That is the average per row, which here is per room-night (418,200 ÷ 2,460). The question asks per booking: divide by the number of distinct bookings.' },
      { value: 3, say: 'That is the average length of stay in nights (2,460 ÷ 820), not revenue.' },
    ],
    solution: 'The unit you want is the booking, so divide the total by the number of distinct booking_ids: 418,200 ÷ 820 = $510. Each booking covers 2,460 ÷ 820 = 3 nights on average, which is why this is three times the average per room-night of $170.',
  },
  {
    id: 'b02-m1-4', lesson: 'datasets-and-variables', type: 'rows', kind: 'applied',
    prompt: 'Northfield’s marks table (fictional) has one row per student per module per term, so student_id, module and term together should be unique. Select every row whose combination of the three also appears in another row.',
    data: { table: {
      head: ['student_id', 'module', 'term', 'mark'],
      rows: [
        ['N1023', 'STAT101', '2025-S1', '58'],
        ['N1023', 'STAT101', '2026-S1', '71'],
        ['N1047', 'STAT101', '2025-S1', '64'],
        ['N1047', 'ECON110', '2025-S1', '49'],
        ['N1047', 'STAT101', '2025-S1', '66'],
        ['N1088', 'ECON110', '2025-S1', '72'],
        ['N1088', 'ECON110', '2025-S1', '72'],
        ['N1102', 'STAT101', '2026-S1', '55'],
      ],
    } },
    answer: [2, 4, 5, 6],
    solution: 'N1047 has two STAT101 marks for 2025-S1 (64 and 66), and N1088 has two identical ECON110 rows for 2025-S1: both break the composite key. N1023’s two STAT101 rows are a retake in a different term, which the key allows.',
  },
  {
    id: 'b02-m1-5', lesson: 'datasets-and-variables', type: 'num', kind: 'numerical',
    prompt: 'Northfield publishes a wide table of applications (fictional): a programme column, one row for each of 8 programmes, and one column for each year from 2019 to 2026. Converted to long format with the columns programme, year and applications, how many rows does it have?',
    answer: 64, check: () => 8 * (2026 - 2019 + 1), unit: 'rows', places: 0, tol: 0.5,
    wrong: [
      { value: 56, say: 'Count the years inclusively: 2019 to 2026 is 8 years, not 7.' },
      { value: 8, say: 'That is the number of rows in the wide table. In long format every programme–year value gets its own row.' },
    ],
    solution: 'There are 2026 − 2019 + 1 = 8 year columns. Each programme–year value becomes one row: 8 programmes × 8 years = 64 rows, with 3 columns.',
  },
  {
    id: 'b02-m1-6', lesson: 'profiling-and-validation', type: 'classify', kind: 'conceptual',
    prompt: 'Which quality dimension does each problem in an online shop’s order data (fictional) affect most directly?',
    items: [
      'An order’s delivery status still says “pending” days after delivery, because the export runs weekly.',
      'The same customer is “C-0042” in the orders table and “42” in the loyalty table.',
      'Some orders have no delivery postcode, although the field is required.',
      'A quantity is recorded as 3 when the customer ordered 2.',
      'An order appears twice after a payment system retried.',
      'A rating of 7 on a 1-to-5 scale.',
    ],
    categories: ['Completeness', 'Validity', 'Accuracy', 'Consistency', 'Uniqueness', 'Timeliness'],
    answer: [5, 3, 0, 2, 4, 1],
    feedback: {
      1: 'Both values identify the customer; the problem is that one thing is represented two ways across tables: consistency.',
      3: '3 is a valid quantity. Only the real order shows that it is wrong: accuracy.',
    },
    solution: 'Weekly export with an outdated status: timeliness. C-0042 and 42: consistency. Missing required postcode: completeness. 3 for 2: accuracy. Order recorded twice: uniqueness. Rating of 7 on a 1–5 scale: validity.',
  },
  {
    id: 'b02-m1-7', lesson: 'profiling-and-validation', type: 'num', kind: 'numerical',
    prompt: 'An airline’s file of 400 bookings (fictional) is checked with three hard rules. 18 rows fail R1, 12 fail R2 and 10 fail R3. Of these, 6 rows fail both R1 and R2, and no other row fails more than one rule. What percentage of the 400 rows fail at least one rule?',
    answer: 8.5, check: () => (18 + 12 + 10 - 6) / 400 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 10, say: 'You added the failures (40). The 6 rows that fail both R1 and R2 were counted twice: count rows, not failures.' },
    ],
    solution: 'Rows failing at least one rule = 18 + 12 + 10 − 6 = 34, because the 6 rows failing both R1 and R2 appear in both counts. 34 ÷ 400 × 100 = 8.5%.',
  },
  {
    id: 'b02-m1-8', lesson: 'profiling-and-validation', type: 'rows', kind: 'applied',
    prompt: 'A fictional bike-hire firm’s rentals file has one cross-field rule: if <code>returned</code> is Yes, <code>end_time</code> must be filled in and later than <code>start_time</code>; if <code>returned</code> is No, <code>end_time</code> must be blank. Select every rental that breaks the rule. Rows are numbered from 0.',
    data: { table: { index: 0,
      head: ['rental_id', 'start_time', 'end_time', 'returned'],
      rows: HIRES.map((r) => r.map((c) => c || '<i>blank</i>')),
    } },
    answer: HIRES.flatMap((r, i) => (hireBreaks(r) ? [i] : [])),
    solution: `Check each row against the half of the rule its <code>returned</code> value selects. ${HIRES[1][0]} is marked returned but has no end time, and ${HIRES[3][0]} ends at ${hireTime(3, 2)}, before its ${hireTime(3, 1)} start. ${HIRES[4][0]} is not returned yet has an end time, so one of the two columns is wrong. ${HIRES[5][0]} ends at the minute it started, which “later than” rules out: a bike docked straight back or a clock fault, to be checked. ${HIRES[6][0]} runs overnight and passes, and so do the blank end times of ${HIRES[2][0]} and ${HIRES[7][0]}, because the rule says when a blank is allowed: a cross-field rule has to be explicit about blanks.`,
  },
  {
    id: 'b02-m1-9', lesson: 'profiling-and-validation', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s analyst finds orders whose customer_id has no matching row in the customer table. Which rule catches this, and what is the right first response?',
    options: [
      'A referential-integrity rule; list the orphaned orders and find out whether the customer table is out of date or the IDs were mistyped.',
      'A uniqueness rule on customer_id in the orders table; delete the repeated IDs.',
      'A range rule on customer_id; replace each failing ID with the nearest valid one.',
      'A completeness rule on customer_id; overwrite the failing IDs with “unknown”.',
    ],
    answer: 0,
    feedback: {
      1: 'customer_id is expected to repeat in the orders table, because customers order more than once. Uniqueness applies to it in the customer table.',
      2: 'IDs are labels, so “nearest” means nothing, and replacing values guesses at data.',
      3: 'The IDs aren’t blank; they point nowhere. Overwriting them destroys the evidence you need to trace the problem.',
    },
    solution: 'Every reference from orders to customers must point to an existing customer: that is referential integrity. A failure is evidence of a problem upstream (a customer table exported before new customers were added, deleted customers, or typing errors), so list the orders and investigate before deciding anything.',
  },
  {
    id: 'b02-m1-10', lesson: 'profiling-and-validation', type: 'mc', kind: 'conceptual',
    prompt: 'Every value in a booking extract passes all of its validation rules. What can you conclude?',
    options: [
      'No value breaks the rules as written; values can still be wrong, and problems the rules don’t test may remain.',
      'The data is accurate.',
      'The data is complete.',
      'The data needs no further checks before analysis, because every column has a rule and every one of those rules has passed.',
    ],
    answer: 0,
    feedback: {
      1: 'Rules test validity. A valid check-in date can still be the wrong date.',
      2: 'Only if the rule set includes a completeness rule for every required column, and blanks in optional columns may still matter to your analysis.',
      3: 'Passing tells you nothing about plausible but wrong values, out-of-date records or duplicates stored under different keys.',
    },
    solution: 'Validation shows that values are possible under the rules you wrote, not that they are true. Accuracy needs a comparison with the source, and any problem the rule set doesn’t test, such as timeliness or duplicates under different keys, is untouched.',
  },
];
