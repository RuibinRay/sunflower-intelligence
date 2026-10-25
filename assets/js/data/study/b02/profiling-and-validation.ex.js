// profiling-and-validation.ex.js — B02 · Profiling a dataset and writing validation rules: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All tables are fictional and built for these exercises; none is taken from the course datasets.

const DIMENSIONS = ['Completeness', 'Validity', 'Accuracy', 'Consistency', 'Uniqueness', 'Timeliness'];

export const widgets = {
  'lantern-profile': {
    type: 'cleaning',
    dataset: {
      columns: ['order_id', 'order_date', 'region', 'quantity', 'unit_price', 'rating'],
      rows: [
        ['5001', '2026-05-02', 'North', '2', '$14.00', '5'],
        ['5002', '2026-05-02', 'north', '1', '$22.00', ''],
        ['5003', '2026-05-03', 'South', '1', '$46.00', '4'],
        ['5004', '2026-05-03', 'East', '3', '$14.00', '4'],
        ['5005', '2026-05-04', 'South', '-1', '$16.50', '3'],
        ['5006', '2026-05-04', 'Nth', '1', '22,00', ''],
        ['5007', '2026-05-05', 'East', '40', '$14.00', '5'],
        ['5007', '2026-05-05', 'East', '4', '$14.00', '5'],
        ['5008', '2026-05-06', 'SOUTH', '2', '$15.50', '9'],
        ['5009', '2025-05-06', 'North', '1', '$46.00', ''],
      ],
    },
    ops: [],
    watch: ['quantity', 'rating'],
    task: 'Profile the extract without changing it. For each column note the type, the number of blanks, the number of distinct values and the range. Sort quantity both ways and compare its mean with its median. List every issue you find and the quality dimension it affects.',
  },
  'hv-validate': {
    type: 'cleaning',
    dataset: 'harborview-bookings',
    ops: ['validate'],
    watch: ['nights', 'rate'],
    task: 'Apply these rules: check_out is after check_in; nights equals the number of days from check_in to check_out; rate is above 0 (the lab’s Minimum includes the value you enter, and rates are whole dollars, so use a minimum of 1); rate is no higher than a sensible maximum for the hotel. For each rule, note how many rows fail and whether you would treat it as hard (an error) or soft (a value to check). Open a few failing rows and decide which value is most likely wrong. Don’t correct anything yet.',
  },
};

export const guided = [
  {
    id: 'b02-pv-g1', type: 'steps', kind: 'numerical',
    prompt: 'Northfield University (fictional) requires an attendance percentage for every student, from 0 to 100. Here is an extract of ten students.',
    data: { table: {
      head: ['student_id', 'attendance_pct'],
      rows: [['N2001', '92'], ['N2002', ''], ['N2003', '88'], ['N2004', '104'], ['N2005', '75'], ['N2006', ''], ['N2007', '100'], ['N2008', '61'], ['N2009', '97'], ['N2010', '112']],
    } },
    solution: 'Completeness = 8 present ÷ 10 required = 80%. The range rule (0 to 100) checks the 8 present values and fails 104 and 112: 2 ÷ 8 = 25%. Values above 100 are impossible for a percentage of sessions attended, so they point to a calculation problem to investigate, not to students who should be deleted or capped.',
    steps: [
      { id: 'b02-pv-g1-s1', type: 'num',
        prompt: 'What is the completeness of attendance_pct, in percent?',
        answer: 80, check: () => (10 - 2) / 10 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['The column is required for all ten students. How many have a value?', 'Completeness = values present ÷ values required × 100.'],
        wrong: [
          { value: 20, say: 'That is the share missing. Completeness is the share present.' },
          { value: 8, say: 'That is the number of values present. Express it as a percentage of the 10 required.' },
        ] },
      { id: 'b02-pv-g1-s2', type: 'num',
        prompt: 'The range rule says attendance_pct is between 0 and 100. What is its failure rate, in percent?',
        answer: 25, check: () => [92, 88, 104, 75, 100, 61, 97, 112].filter((v) => v < 0 || v > 100).length / 8 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['Which present values are outside 0 to 100? Remember that 100 itself is allowed.', 'Divide by the rows the rule checks: blanks are completeness’s business, not the range rule’s.'],
        wrong: [
          { value: 20, say: 'You divided by all 10 rows. The range rule checks only the 8 values present; the 2 blanks are measured by completeness.' },
          { value: 37.5, say: '100 is inside the range 0 to 100, so it passes. Only 104 and 112 fail.' },
        ] },
      { id: 'b02-pv-g1-s3', type: 'mc',
        prompt: 'What should you do about 104 and 112?',
        options: [
          'Flag them and ask how attendance is worked out: extra sessions or the wrong denominator may be to blame.',
          'Change them to 100, the nearest valid value.',
          'Delete the two students from the dataset, because a record with an impossible value can’t be trusted at all.',
          'Leave them alone: high attendance is good news, and a range rule on attendance is there to catch students who miss classes.',
        ],
        answer: 0,
        hints: ['A percentage of sessions attended can’t exceed 100, so something produced these values. Is that something likely to affect other students too?'],
        feedback: {
          1: 'Capping hides the problem and guesses the answer. If the calculation is wrong, other students’ values are probably wrong too, just less visibly.',
          2: 'Deleting rows throws away two students’ records because of one bad column, and doesn’t fix the cause.',
          3: 'The values are impossible as defined, so they are a validity failure, whatever they say about the students.',
        } },
    ],
  },
  {
    id: 'b02-pv-g2', type: 'rows', kind: 'applied',
    prompt: 'Harborview (fictional) applies the hard rule “check_out is after check_in”. Select every booking that fails it.',
    data: { table: {
      head: ['booking_id', 'check_in', 'check_out', 'adults'],
      rows: [
        ['HB-37101', '2026-11-02', '2026-11-04', '2'],
        ['HB-37102', '2026-11-03', '2026-11-01', '1'],
        ['HB-37103', '2026-11-03', '2026-11-03', '2'],
        ['HB-37104', '2026-11-29', '2026-12-02', '2'],
        ['HB-37105', '2026-12-01', '2026-11-30', '3'],
        ['HB-37106', '2026-11-05', '2026-11-06', '1'],
      ],
    } },
    answer: [1, 2, 4],
    hints: ['Compare the two dates in each row. “After” means strictly later.', 'One row has the same date in both columns; a hotel stay needs at least one night.'],
    solution: 'HB-37102 checks out two days before it checks in, and HB-37105 one day before. HB-37103 checks out on its check-in date, which is not after it: a stay of zero nights. HB-37104 crosses a month end but is fine (29 November to 2 December is three nights).',
  },
  {
    id: 'b02-pv-g3', type: 'fill', kind: 'applied',
    prompt: 'Write Lantern’s cross-field rule R8 for order_total, using the definitions in the data dictionary.',
    text: 'R8: the absolute difference between order_total and ([[0]] × [[1]] − [[2]]) is at most $[[3]].',
    blanks: [
      { options: ['size_g', 'quantity', 'rating'], answer: 1 },
      { options: ['unit_price', 'order_total', 'discount'], answer: 0 },
      { options: ['quantity', 'unit_price', 'discount'], answer: 2 },
      { options: ['1.00', '0.01', '10.00'], answer: 1 },
    ],
    hints: ['The dictionary defines order_total as the price of the packs less the discount on the whole order.', 'Money is stored to the cent. Allow for rounding, but no more.'],
    solution: 'order_total should equal quantity × unit_price − discount. Writing the rule as an absolute difference of at most $0.01 allows for rounding to the cent; a tolerance of $1.00 or $10.00 would let real errors through.',
  },
  {
    id: 'b02-pv-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Which quality dimension does each problem in Lantern’s data affect most directly?',
    items: [
      'Some orders have no email, which is required for the receipt.',
      'An order’s unit_price is “14,00” where the dictionary requires 14.00.',
      'Region is “East” in one order and “east” in another.',
      'Order 5120 appears twice, identically.',
      'A customer’s quantity was typed as 3 instead of 2.',
      'The export was taken at 9 a.m., so it lacks the rest of that day’s orders.',
    ],
    categories: DIMENSIONS,
    answer: [0, 1, 3, 4, 2, 5],
    hints: ['Ask what kind of evidence reveals each problem: counting blanks, testing a rule, comparing two representations, counting keys, checking the real world, or looking at the clock.', 'Accuracy problems pass every rule; only the source reveals them.'],
    feedback: {
      1: 'The value breaks the format the dictionary requires (a dot as the decimal separator), so it is invalid.',
      2: 'Each spelling is recognisably the same region; the problem is that one region is written two ways: consistency.',
      4: '3 is a perfectly valid quantity. Only the real order shows it is wrong: accuracy.',
      5: 'Nothing recorded is wrong; the data is out of date for the question being asked: timeliness.',
    },
    solution: 'Missing required email: completeness. “14,00”: validity. East and east: consistency. Order twice: uniqueness. 3 typed for 2: accuracy. Export taken too early: timeliness.',
  },
];

export const independent = [
  {
    id: 'b02-pv-i1', type: 'rows', kind: 'applied',
    prompt: 'Apply Lantern’s rule that order_total = quantity × unit_price − discount (to the cent). Select every order that fails it.',
    data: { table: {
      head: ['order_id', 'quantity', 'unit_price', 'discount', 'order_total'],
      rows: [
        ['6101', '2', '14.00', '0.00', '28.00'],
        ['6102', '1', '22.00', '2.20', '19.80'],
        ['6103', '3', '16.50', '0.00', '47.50'],
        ['6104', '2', '46.00', '9.20', '82.80'],
        ['6105', '1', '15.50', '0.00', '1.55'],
        ['6106', '4', '14.00', '5.60', '50.40'],
        ['6107', '2', '22.00', '4.40', '44.00'],
        ['6108', '1', '17.00', '0.00', '17.00'],
      ],
    } },
    answer: [2, 4, 6],
    solution: 'Recompute each total. 6103: 3 × 16.50 − 0 = 49.50, not 47.50. 6105: 1 × 15.50 = 15.50, not 1.55 (a slipped decimal point). 6107: 2 × 22.00 − 4.40 = 39.60, not 44.00 (the discount wasn’t applied). The others agree: 28.00, 19.80, 82.80, 50.40 and 17.00.',
  },
  {
    id: 'b02-pv-i2', type: 'classify', kind: 'conceptual',
    prompt: 'What kind of validation rule is each of these?',
    items: [
      'nights is at least 1',
      'email contains exactly one @',
      'booking_id appears only once',
      'every order’s product exists in the product catalogue table',
      'check_out is later than check_in',
      'room_type is Standard, Deluxe, Family or Suite',
      'rate is not blank',
    ],
    categories: ['Range', 'Format', 'Set membership', 'Uniqueness', 'Completeness', 'Cross-field', 'Referential integrity'],
    answer: [0, 1, 3, 6, 5, 2, 4],
    feedback: {
      3: 'The allowed values live in another table that can change, so this is referential integrity. A short fixed list written into the rule, like the room types, is set membership.',
      4: 'It compares two columns of the same row: a cross-field rule.',
      6: 'It tests only that a value is present: completeness.',
    },
    solution: 'nights ≥ 1: range. One @: format. booking_id once: uniqueness. Product exists in the catalogue table: referential integrity. check_out after check_in: cross-field. room_type from a fixed list: set membership. rate not blank: completeness.',
  },
  {
    id: 'b02-pv-i3', type: 'num', kind: 'numerical',
    prompt: 'Harborview (fictional) checks 250 bookings with three hard rules. R1 (check_out after check_in) fails 9 rows, R2 (nights match the dates) fails 14 rows and R3 (rate above 0) fails 5 rows. Every row that fails R1 also fails R2, and no other row fails more than one rule. What percentage of the bookings fail at least one hard rule?',
    answer: 7.6, check: () => (9 + 14 + 5 - 9) / 250 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 11.2, say: 'You added the three counts (28 failures). The 9 rows failing R1 are already among R2’s 14, so they were counted twice.' },
    ],
    solution: 'Count rows, not failures. The 9 rows failing R1 are among the 14 failing R2, so R1 and R2 together cover 14 rows; R3 adds 5 more. Rows failing at least one rule = 14 + 5 = 19, and 19 ÷ 250 = 7.6%. (It makes sense that R1 failures also fail R2: if check-out comes before check-in, the days between them are negative and can’t match a positive number of nights.)',
  },
  {
    id: 'b02-pv-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A Lantern order shows quantity 3 and passes every rule. The customer emails to say they ordered 2 and were charged for 3. Which dimension of quality failed, and why didn’t validation catch it?',
    options: [
      'Accuracy: 3 is a valid quantity, so only a comparison with the real order could reveal the error.',
      'Validity: a range rule on quantity should have rejected the 3, so the rule set has a gap to close.',
      'Completeness: the true quantity is missing from the row, which a completeness rule should have caught.',
      'Consistency: the quantity disagrees with the other columns, so the cross-field rule on order_total should have failed.',
    ],
    answer: 0,
    feedback: {
      1: 'Any range rule that allows real orders of 3 packs must accept this value. Validity can’t tell a real 3 from a mistyped one.',
      2: 'Nothing is blank: a wrong value is present.',
      3: 'The customer was charged for 3, so order_total was calculated from the same wrong quantity. The row is internally consistent and passes the cross-field rule too.',
    },
    solution: 'The value is valid but wrong, which is an accuracy failure. Rules can only reject impossible values or flag unusual ones; a plausible wrong value passes them all. Accuracy is checked against the source: here, the customer’s own record of the order.',
  },
  {
    id: 'b02-pv-i5', type: 'mc', kind: 'applied',
    prompt: 'Harborview’s most expensive room has a list price of $500 a night (fictional). Which pair of rules treats the rate column sensibly?',
    options: [
      'Hard: rate is above 0, unless the booking is marked complimentary. Soft: a rate above $500 is flagged for review.',
      'Hard: rate is between $1 and $500, and any booking outside that range is deleted.',
      'Soft: rate is above 0. Hard: a rate above $500 is an error.',
      'No rules: rates are set by the market, so any value is possible.',
    ],
    answer: 0,
    feedback: {
      1: 'Deleting is not a validation action, and a rate above the list price is possible (a package, an event night), so it needs review, not removal.',
      2: 'This reverses the logic. A paid booking must have a positive rate, so 0 is an error unless it is a recorded complimentary stay; a high rate is merely unusual.',
      3: 'Placeholder values such as 0 and 9999 are exactly what rules on rate exist to catch.',
    },
    solution: 'A rate of 0 on a paid booking is impossible, so “rate above 0” is hard, with an exception the data dictionary should define for complimentary stays. A rate above the list price is possible but suspicious, so it is soft: flagged for someone to check. Neither rule deletes anything.',
  },
  {
    id: 'b02-pv-i6', type: 'rows', kind: 'applied',
    prompt: 'Lantern’s customer table (fictional) contains the customer IDs C01 to C08. Select every order whose customer_id breaks referential integrity.',
    data: { table: {
      head: ['order_id', 'order_date', 'customer_id', 'order_total ($)'],
      rows: [
        ['7001', '2026-06-01', 'C03', '28.00'],
        ['7002', '2026-06-01', 'C11', '16.00'],
        ['7003', '2026-06-02', 'C08', '48.00'],
        ['7004', '2026-06-02', 'C00', '26.00'],
        ['7005', '2026-06-03', 'C01', '14.00'],
        ['7006', '2026-06-03', 'C09', '30.00'],
        ['7007', '2026-06-04', 'C02', '15.00'],
      ],
    } },
    answer: [1, 3, 5],
    solution: 'C11, C00 and C09 are not in the customer table, so those three orders point to customers that don’t exist there. Possible causes include customers created after the customer table was exported (a timeliness problem: C09 would be the next ID issued), deleted customer records and mistyped IDs. List the orphaned orders and investigate before deciding what to do.',
  },
];

export const check = [
  {
    id: 'b02-pv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why should you profile a dataset before cleaning it?',
    options: [
      'To learn what the data contains, so that every change answers a known problem instead of a guess.',
      'To make the dataset smaller before analysis, by removing the rows and columns that fail its checks.',
      'Because profiling corrects the most common errors automatically, such as stray spaces, mixed case and mixed date formats.',
      'To produce the summary statistics that will be reported to managers.',
    ],
    answer: 0,
    feedback: {
      1: 'Profiling changes nothing, including the size of the data. It describes.',
      2: 'Profiling finds problems; it doesn’t fix them. Deciding on fixes comes after the issue list.',
      3: 'Statistics from uncleaned data, like the extract’s mean of 5.4 packs, can be badly misleading. Profile statistics are diagnostic, not results.',
    },
    solution: 'Profiling describes each column’s types, blanks, distinct values, ranges and distributions, and checks relationships between columns. It tells you where the problems are and how big they are, so cleaning can follow a plan instead of guesswork, and so values that look odd but are genuine aren’t “fixed” by mistake.',
  },
  {
    id: 'b02-pv-k2', type: 'classify', kind: 'conceptual',
    prompt: 'Which quality dimension does each problem in Harborview’s data (fictional) affect most directly?',
    items: [
      'A booking appears twice after a channel-manager sync.',
      'country is “GB” in some rows and “United Kingdom” in others.',
      'A guest’s check-in was typed as the 12th instead of the 21st; both are valid dates.',
      'Some bookings have no rate, although rate is required.',
      'nights is −2.',
      'The occupancy report uses bookings exported last Monday, so it misses this week’s cancellations.',
    ],
    categories: DIMENSIONS,
    answer: [4, 3, 2, 0, 1, 5],
    feedback: {
      1: 'Both are recognisable ways of naming the country; the problem is that one thing is represented two ways: consistency.',
      2: 'The wrong date passes every rule; only the booking itself shows it is wrong: accuracy.',
      4: 'A negative number of nights is impossible by definition: validity.',
      5: 'The records were right when exported; they are out of date now: timeliness.',
    },
    solution: 'Duplicate booking: uniqueness. GB and United Kingdom: consistency. 12th for 21st: accuracy. Missing required rate: completeness. −2 nights: validity. Last Monday’s export: timeliness.',
  },
  {
    id: 'b02-pv-k3', type: 'num', kind: 'numerical',
    prompt: 'Harborview’s export (fictional) has 1,600 bookings. Email is required only for direct bookings, of which there are 900, and 828 direct bookings have an email. What is the completeness of email, in percent?',
    answer: 92, check: () => 828 / 900 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 51.75, say: 'You divided by all 1,600 bookings, but email is required only on the 900 direct bookings. Completeness compares values present with values required.' },
      { value: 8, say: 'That is the share of direct bookings missing an email. Completeness is the share present.' },
    ],
    solution: 'Completeness = values present ÷ values required × 100 = 828 ÷ 900 × 100 = 92%. Bookings through other channels don’t require an email, so their blanks are not defects and stay out of the denominator.',
  },
  {
    id: 'b02-pv-k4', type: 'num', kind: 'numerical',
    prompt: 'Lantern applies the rule “rating is a whole number from 1 to 5” to 2,000 orders (fictional). Rating is optional, 1,450 orders have one, and 29 of those are outside 1 to 5. What is the rule’s failure rate, in percent?',
    answer: 2, check: () => 29 / 1450 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 1.45, say: 'You divided by all 2,000 orders. The rule checks only the 1,450 orders with a rating; blank ratings are allowed and aren’t failures.' },
    ],
    solution: 'Failure rate = rows that fail ÷ rows the rule checks × 100 = 29 ÷ 1,450 × 100 = 2%. The 550 blank ratings are allowed by the data dictionary, so the rule doesn’t apply to them.',
  },
  {
    id: 'b02-pv-k5', type: 'rows', kind: 'applied',
    prompt: 'Select every Harborview booking (fictional) that breaks the rule “nights equals the number of days from check_in to check_out”.',
    data: { table: {
      head: ['booking_id', 'check_in', 'check_out', 'nights'],
      rows: [
        ['HB-38001', '2026-02-26', '2026-03-01', '3'],
        ['HB-38002', '2026-03-01', '2026-03-04', '3'],
        ['HB-38003', '2026-03-02', '2026-03-03', '2'],
        ['HB-38004', '2026-03-05', '2026-03-12', '6'],
        ['HB-38005', '2026-03-06', '2026-03-08', '2'],
        ['HB-38006', '2026-03-09', '2026-03-07', '2'],
      ],
    } },
    answer: [2, 3, 5],
    solution: 'Count the days for each row: 3 (February 2026 has 28 days, so 26 February to 1 March is 3 nights), 3, 1, 7, 2 and −2. HB-38003 records 2 nights for a 1-day gap, HB-38004 records 6 for a 7-day gap, and HB-38006’s check-out comes 2 days before its check-in, so the days are −2, not 2. HB-38001 looks suspicious at first but passes.',
  },
  {
    id: 'b02-pv-k6', type: 'mc', kind: 'applied',
    prompt: 'Profiling Lantern’s export shows one order for 40 packs, while almost every other order is for one to three. What should you do first?',
    options: [
      'Record it as an issue, flag it with a soft rule and check it against the order record first.',
      'Replace it with the median quantity, so that one unusual order can’t distort the averages in the analysis.',
      'Delete the row, because an order that far from all the others is an extreme value and will distort the analysis.',
      'Keep it and report the mean, because 40 is a valid quantity and valid values need no further check.',
    ],
    answer: 0,
    feedback: {
      1: 'Replacing a value invents data. If the order was genuine, you would have destroyed a real bulk sale.',
      2: 'Extreme is not the same as wrong. Cafés do buy in bulk; only the order record can say which this is.',
      3: 'Valid isn’t the same as accurate, and one unchecked value can move the mean a long way: in the extract, a single 40 supplied 40 of the 54 packs.',
    },
    solution: 'A value that is possible but unusual fails a soft rule: it calls for a check, not a correction. Record it in the issue list with its evidence, confirm it against the source, and only then decide whether to correct it, keep it or analyse it separately.',
  },
];
