// datasets-and-variables.ex.js — B02 · Datasets: rows, columns, records and variables: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All tables are fictional and built for these exercises; none is taken from the course datasets.

const LEVELS = ['Nominal', 'Ordinal', 'Interval', 'Ratio'];
const fmt1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

export const widgets = {
  'lantern-explore': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: [],
    watch: ['order_id', 'unit_price'],
    task: 'Don’t change anything yet; read the table. (1) Complete the sentence “one row of this export is one ___”. (2) Which column should identify each row? Sort it and look for values that repeat. (3) Find a column that should hold numbers but that the export stores as text, and say what in its values gives this away.',
  },
  'class-size': {
    type: 'formula',
    title: 'Average class size: per module or per student?',
    intro: 'Three modules, each with its own number of students. The first average counts each module once; the second counts each student once.',
    inputs: [
      { id: 'a', label: 'Module A', min: 5, max: 60, step: 1, value: 10, fmt: 'int', unit: 'students' },
      { id: 'b', label: 'Module B', min: 5, max: 120, step: 1, value: 20, fmt: 'int', unit: 'students' },
      { id: 'c', label: 'Module C', min: 5, max: 300, step: 1, value: 90, fmt: 'int', unit: 'students' },
    ],
    compute: (v) => {
      const total = v.a + v.b + v.c;
      const perModule = total / 3;
      const perStudent = (v.a * v.a + v.b * v.b + v.c * v.c) / total;
      const gap = perStudent - perModule;
      return {
        headline: { label: 'Average class a student sits in', value: `${fmt1(perStudent)} students` },
        rows: [
          ['Average per module (each module counts once)', `${fmt1(perModule)} students`],
          ['Average per student (each enrolment counts once)', `${fmt1(perStudent)} students`],
          ['Total enrolments (rows in the enrolment file)', `${total}`],
          ['Difference between the two averages', `${fmt1(gap)} students`],
        ],
        note: gap < 0.05
          ? 'The modules are the same size, so both units give the same average.'
          : `Averaging per student weights each module by its size, so the larger modules count more: the typical student’s class is ${fmt1(gap)} students larger than the typical module.`,
        chart: { kind: 'bar', x: { label: 'Unit of the average', values: ['Per module', 'Per student'] }, series: [{ name: 'Average class size', values: [Math.round(perModule * 10) / 10, Math.round(perStudent * 10) / 10] }], y: { label: 'Students' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b02-dv-g1', type: 'steps', kind: 'applied',
    prompt: 'Lantern’s subscription team keeps a shipments table (fictional). Each month every active subscription is sent one parcel, and a parcel can contain more than one coffee. Work out what one row is and how to identify it.',
    data: { table: {
      head: ['subscription_id', 'ship_month', 'customer_id', 'product', 'packs'],
      rows: [
        ['S-201', '2026-04', 'C14', 'House Blend 250g', '2'],
        ['S-201', '2026-04', 'C14', 'Decaf Colombia 250g', '1'],
        ['S-202', '2026-04', 'C09', 'Ethiopia Yirgacheffe 250g', '1'],
        ['S-201', '2026-05', 'C14', 'House Blend 250g', '2'],
        ['S-202', '2026-05', 'C09', 'Ethiopia Yirgacheffe 250g', '1'],
        ['S-203', '2026-05', 'C14', 'Colombia Huila 250g', '1'],
      ],
    } },
    solution: 'One row is one coffee in one month’s parcel for one subscription, so the key must combine subscription_id, ship_month and product. The table has 6 rows but only 3 subscriptions (S-201, S-202 and S-203) and 2 customers: C14 holds two subscriptions.',
    steps: [
      { id: 'b02-dv-g1-s1', type: 'mc',
        prompt: 'What does one row of this table describe?',
        options: ['One coffee in one month’s parcel for one subscription', 'One subscription', 'One customer', 'One month’s parcel for one subscription, with all its coffees'],
        answer: 0,
        hints: ['Look for a subscription that appears more than once in the same month.', 'S-201 has two rows for 2026-04. What differs between them?'],
        feedback: {
          1: 'S-201 appears in three rows, so a row can’t be a whole subscription.',
          2: 'C14 appears in four rows and holds two different subscriptions, so a row is not a customer.',
          3: 'S-201’s April parcel takes two rows, one for each coffee, so a row is smaller than a parcel.',
        } },
      { id: 'b02-dv-g1-s2', type: 'mc',
        prompt: 'Which columns together should form the primary key?',
        options: ['subscription_id + ship_month + product', 'subscription_id + ship_month', 'customer_id + ship_month + product', 'subscription_id + product'],
        answer: 0,
        hints: ['The key must identify one row: one coffee, in one month, for one subscription.', 'Check each option for a repeated combination. S-201 is the place to look.'],
        feedback: {
          1: 'S-201 has two rows for 2026-04 (House Blend and Decaf Colombia), so this pair repeats.',
          2: 'This combination happens to be unique in these six rows, but it identifies a customer, not a subscription. If C14’s two subscriptions ever sent the same coffee in the same month, it would repeat. A key must match the unit of observation, not just pass the test today.',
          3: 'S-201 is sent House Blend every month, so subscription_id + product repeats.',
        } },
      { id: 'b02-dv-g1-s3', type: 'num',
        prompt: 'How many distinct subscriptions does the table contain?',
        answer: 3, check: () => new Set(['S-201', 'S-201', 'S-202', 'S-201', 'S-202', 'S-203']).size, unit: 'subscriptions', places: 0, tol: 0.5,
        hints: ['Count distinct values of subscription_id, not rows.'],
        wrong: [
          { value: 6, say: 'That is the number of rows. Several rows belong to the same subscription: count distinct subscription_id values.' },
          { value: 2, say: 'That is the number of customers (C14 and C09). C14 holds two subscriptions, S-201 and S-203.' },
        ] },
    ],
  },
  {
    id: 'b02-dv-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each column of Lantern’s order export by its level of measurement.',
    items: ['order_date', 'region', 'quantity', 'unit_price', 'rating (1 to 5)', 'customer_id', 'subscription (yes or no)', 'size_g (pack size in grams)'],
    categories: LEVELS,
    answer: [2, 0, 3, 3, 1, 0, 0, 3],
    hints: ['For each column ask three questions in turn: does the order of the values matter? Are differences meaningful? Does zero mean “none”?', 'Dates allow differences but not ratios. An identifier is a label, however it is written.'],
    feedback: {
      0: 'The gap between two dates is meaningful, but no date is “twice” another, because the calendar’s starting point is a convention: interval.',
      2: 'Quantity counts packs. Zero packs means none, and 4 packs is twice 2: ratio.',
      4: 'Ratings are ordered, but the step from 1 to 2 needn’t equal the step from 4 to 5: ordinal.',
      5: 'customer_id is a label; arithmetic on it means nothing: nominal.',
      6: 'Two categories with no order, yes and no: nominal.',
      7: 'Grams have a true zero, and a 1,000 g pack holds four times as much as a 250 g pack: ratio.',
    },
    solution: 'order_date: interval. region: nominal. quantity: ratio (a count with a true zero). unit_price: ratio. rating: ordinal. customer_id: nominal (an identifier). subscription: nominal (two unordered categories). size_g: ratio.',
  },
  {
    id: 'b02-dv-g3', type: 'rows', kind: 'applied',
    prompt: 'Harborview’s booking file (fictional) should have one row per booking, with booking_id as the primary key. Select every row whose booking_id also appears in another row.',
    data: { table: {
      head: ['booking_id', 'check_in', 'nights', 'room_type', 'rate ($)'],
      rows: [
        ['HB-33101', '2026-06-01', '2', 'Standard', '140'],
        ['HB-33102', '2026-06-01', '3', 'Deluxe', '185'],
        ['HB-33103', '2026-06-02', '1', 'Standard', '140'],
        ['HB-33102', '2026-06-01', '3', 'Deluxe', '185'],
        ['HB-33104', '2026-06-03', '4', 'Suite', '320'],
        ['HB-33105', '2026-06-03', '2', 'Standard', '150'],
        ['HB-33104', '2026-06-04', '3', 'Suite', '320'],
        ['HB-33106', '2026-06-05', '1', 'Deluxe', '185'],
      ],
    } },
    answer: [1, 3, 4, 6],
    hints: ['Read down the booking_id column only. Which values appear twice?', 'Two IDs repeat. Select both rows for each of them.'],
    solution: 'HB-33102 appears twice with identical values, and HB-33104 appears twice with different check-in dates and nights. Both break the rule that booking_id is unique, so all four rows need attention. They will need different treatment, which the lesson on duplicates covers: the first pair looks like one booking recorded twice; the second could be one booking that was changed, or two bookings given the same ID.',
  },
  {
    id: 'b02-dv-g4', type: 'fill', kind: 'applied',
    prompt: 'Complete the data dictionary entry for the quantity column of Lantern’s order export.',
    text: 'quantity. Meaning: the number of [[0]] ordered. Level: [[1]]. Type: [[2]]. Rule: at least [[3]]. Blanks: [[4]].',
    blanks: [
      { options: ['packs', 'grams', 'dollars', 'orders'], answer: 0 },
      { options: ['nominal', 'ordinal', 'interval', 'ratio'], answer: 3 },
      { options: ['whole number', 'decimal number', 'text', 'date'], answer: 0 },
      { options: ['0', '1', '250'], answer: 1 },
      { options: ['not allowed: every order has a quantity', 'allowed: a blank means 1', 'allowed: a blank means 0'], answer: 0 },
    ],
    hints: ['size_g already records the weight of a pack, and unit_price its price. What does quantity count?', 'An order of zero packs isn’t an order. Would it be safe to guess what a blank quantity means?'],
    solution: 'quantity counts packs, so it is a ratio variable (zero means none, and 4 packs is twice 2) stored as a whole number. Every order contains at least 1 pack. A blank quantity is a defect to investigate, not something to fill in: deciding that it means 1 or 0 would invent data.',
  },
];

export const independent = [
  {
    id: 'b02-dv-i1', type: 'classify', kind: 'conceptual',
    prompt: 'An online clothing retailer (fictional) records these variables for each order. Classify each one.',
    items: ['Number of items in the order', 'Parcel weight (kg)', 'Delivery postcode', 'Time from order to dispatch (hours)', 'Number of items returned', 'Garment size (XS, S, M, L, XL)'],
    categories: ['Numerical, discrete', 'Numerical, continuous', 'Categorical'],
    answer: [0, 1, 2, 1, 0, 2],
    feedback: {
      1: 'Weight is measured and can take any value in a range (1.37 kg), so it is continuous even if the scales round it.',
      2: 'A postcode is a label, even when it contains digits: you can’t add or average postcodes.',
      3: 'Time is measured and can take any value in a range (2.75 hours), so it is continuous even if the system records whole hours.',
      5: 'Sizes are ordered categories (an ordinal variable), not measurements.',
    },
    solution: 'Items ordered and items returned are counts: numerical, discrete. Parcel weight and time to dispatch are measurements: numerical, continuous. The postcode is a label and garment size is a set of ordered categories, so both are categorical (nominal and ordinal respectively).',
  },
  {
    id: 'b02-dv-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Northfield University’s marks table (fictional) has one row per student per module per term, with the columns student_id, module, term and mark. Students may retake a failed module in a later term. Which columns should form the primary key?',
    options: ['student_id, module and term', 'student_id and module', 'student_id', 'module and term'],
    answer: 0,
    feedback: {
      1: 'A student who retakes a module has two rows for the same student and module, in different terms.',
      2: 'Each student takes many modules, so student_id repeats on every row of their record.',
      3: 'Every student taking that module that term shares the same module and term.',
    },
    solution: 'The unit of observation is one student’s attempt at one module in one term, so the key must identify exactly that. A retake creates a second row for the same student and module, which is why term must be part of the composite key: student_id + module + term.',
  },
  {
    id: 'b02-dv-i3', type: 'rows', kind: 'applied',
    prompt: 'A regional manager emails Lantern this weekly sales sheet (fictional). It is meant to have one row per region per week. Select every row that is not an observation of that unit.',
    data: { table: {
      head: ['region', 'week', 'packs'],
      rows: [
        ['North', 'W1', '40'],
        ['North', 'W2', '35'],
        ['North total', '', '75'],
        ['region', 'week', 'packs'],
        ['South', 'W1', '22'],
        ['South', 'W2', '30'],
        ['South total', '', '52'],
        ['East', 'W1 and W2', '61'],
        ['Grand total', '', '188'],
      ],
    } },
    answer: [2, 3, 6, 7, 8],
    solution: 'The subtotal and grand-total rows describe a whole region or the whole business, not a region-week: they are a different observational unit, and any sum of the packs column counts them twice (summing the column as it stands gives 503 instead of 188). The repeated header row isn’t data at all; it is a copy-and-paste artefact, and it would also make software read packs as text. The East row stores two weeks in one cell, so it can’t be compared with the other region-weeks: ask for the weekly figures. Only the four North and South weekly rows are observations of the intended unit.',
  },
  {
    id: 'b02-dv-i4', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s line-item report for one afternoon (fictional) has one row per product on an order. What is the average order value, in dollars?',
    data: { table: {
      head: ['order_id', 'line', 'product', 'line_total ($)'],
      rows: [
        ['2051', '1', 'House Blend 250g', '28.00'],
        ['2051', '2', 'Ethiopia Yirgacheffe 250g', '19.50'],
        ['2052', '1', 'House Blend 1kg', '46.00'],
        ['2053', '1', 'Decaf Colombia 250g', '16.50'],
        ['2053', '2', 'Colombia Huila 250g', '17.00'],
        ['2053', '3', 'Cold Brew Pack', '22.00'],
        ['2054', '1', 'House Blend 250g', '14.00'],
      ],
    } },
    answer: 40.75,
    check: () => (28 + 19.5 + 46 + 16.5 + 17 + 22 + 14) / new Set([2051, 2051, 2052, 2053, 2053, 2053, 2054]).size,
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 23.29, say: 'That is the average line (163 ÷ 7). An order can have several lines: divide the total by the number of distinct orders.' },
      { value: 163, say: 'That is the total for all orders. Divide it by the number of distinct orders.' },
    ],
    solution: 'The rows are order lines. The line totals add to 28.00 + 19.50 + 46.00 + 16.50 + 17.00 + 22.00 + 14.00 = $163.00. There are 4 distinct order_ids (2051, 2052, 2053 and 2054), so the average order value is 163 ÷ 4 = $40.75. Averaging the column directly would give 163 ÷ 7 ≈ $23.29, the average line.',
  },
  {
    id: 'b02-dv-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement is meaningful, given the level of measurement of the variable it uses?',
    options: [
      'A stay that starts on 10 June starts 9 days after one that starts on 1 June.',
      'A guest who rated their stay 4 was twice as satisfied as one who rated it 2.',
      'Order 1004 was worth more than order 1001, because its number is larger.',
      'At 24 °C the hotel lobby is twice as warm as at 12 °C.',
    ],
    answer: 0,
    feedback: {
      1: 'Ratings are ordinal: they rank, but the distance between points isn’t fixed, so ratios between ratings mean nothing.',
      2: 'Order numbers are labels. A larger number may mean a later order, never a bigger one.',
      3: 'Celsius has an arbitrary zero, so it is interval and ratios aren’t meaningful: in Fahrenheit the same temperatures are 75.2 °F and 53.6 °F, nowhere near a ratio of 2.',
    },
    solution: 'Dates are interval: differences between them are meaningful, so “9 days after” is a valid statement (10 − 1 = 9). Statements about “twice as” need a ratio variable; ratings are ordinal, order numbers nominal and degrees Celsius interval.',
  },
  {
    id: 'b02-dv-i6', type: 'num', kind: 'numerical',
    prompt: 'A battery-storage installer (fictional) keeps a wide table of installations: a depot column, one row for each of its 5 depots, and one column for each of the 12 months of 2025. Converted to long format with the columns depot, month and installations, how many rows will the table have?',
    answer: 60, check: () => 5 * 12, unit: 'rows', places: 0, tol: 0.5,
    wrong: [
      { value: 12, say: 'That is the number of month columns. In long format every depot–month combination gets its own row.' },
      { value: 13, say: 'The depot column stays a column. Count depot–month combinations: one row for each.' },
      { value: 5, say: 'That is the number of rows in the wide table. Each of its 12 month cells becomes a row of its own.' },
    ],
    solution: 'Each month cell of the wide table holds one depot–month value, and the long format gives each value its own row: 5 depots × 12 months = 60 rows, with 3 columns (depot, month and installations).',
  },
];

export const check = [
  {
    id: 'b02-dv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these tables breaks the tidy-data rules?',
    options: [
      'A sales table with one column for each month (Jan, Feb, Mar …)',
      'An orders table with one row per order and one column per variable',
      'A separate customers table with one row per customer',
      'A bookings table with check_in and check_out in separate columns',
    ],
    answer: 0,
    feedback: {
      1: 'This is tidy: each variable is a column and each order is a row.',
      2: 'Giving customers their own table follows the third rule: each type of observational unit forms a table.',
      3: 'check_in and check_out are two different variables, so each has its own column. That is tidy.',
    },
    solution: 'Month is a variable, but the first table spreads its values across the column headers. Wickham (2014) lists this as the first common problem with messy data: column headers that are values, not variable names. The long layout, with a month column, is the tidy one.',
  },
  {
    id: 'b02-dv-k2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each hotel variable by its level of measurement.',
    items: ['Hotel star category (1 to 5 stars)', 'Room number', 'Check-in date', 'Nightly rate ($)', 'Thermostat setting (°C)', 'Number of guests in the room'],
    categories: LEVELS,
    answer: [1, 0, 2, 3, 2, 3],
    feedback: {
      0: 'Star categories are ordered, but the step from 3 to 4 stars needn’t equal the step from 4 to 5: ordinal.',
      1: 'A room number labels a room. Its first digit may tell you the floor, but the number itself is not an amount: nominal.',
      2: 'Differences between dates are meaningful (length of stay), ratios are not: interval.',
      4: 'Celsius has an arbitrary zero, so 22 °C is not twice 11 °C: interval.',
    },
    solution: 'Star category: ordinal. Room number: nominal. Check-in date: interval. Nightly rate: ratio. Thermostat setting in °C: interval. Number of guests: ratio (a count with a true zero).',
  },
  {
    id: 'b02-dv-k3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s line-item report for May (fictional) has 1,240 rows covering 410 distinct order_ids, and its line totals add to $31,775. What is the average order value?',
    answer: 77.5, check: () => 31775 / 410, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 25.63, say: 'That is the average line (31,775 ÷ 1,240). Each order has several lines on average: divide by the number of distinct orders.' },
      { value: 3.02, say: 'That is the average number of lines per order (1,240 ÷ 410), not a value in dollars.' },
    ],
    solution: 'The unit you want is the order, so divide the total by the number of distinct orders: 31,775 ÷ 410 = $77.50. The number of rows (1,240) counts order lines, not orders.',
  },
  {
    id: 'b02-dv-k4', type: 'rows', kind: 'applied',
    prompt: 'Harborview’s room-night table (fictional) has one row per booking per night, so the pair booking_id and night should be unique. Select every row whose booking_id and night pair also appears in another row.',
    data: { table: {
      head: ['booking_id', 'night', 'room', 'rate ($)'],
      rows: [
        ['HB-34410', '2026-07-01', '305', '160'],
        ['HB-34410', '2026-07-02', '305', '160'],
        ['HB-34411', '2026-07-01', '118', '140'],
        ['HB-34410', '2026-07-02', '306', '160'],
        ['HB-34412', '2026-07-01', '220', '210'],
        ['HB-34411', '2026-07-02', '118', '140'],
        ['HB-34412', '2026-07-01', '220', '210'],
        ['HB-34413', '2026-07-02', '412', '175'],
      ],
    } },
    answer: [1, 3, 4, 6],
    solution: 'HB-34410 has two rows for 2 July (in rooms 305 and 306), and HB-34412 has two identical rows for 1 July. Both pairs break the composite key. HB-34410 and HB-34411 each appearing on two different nights is fine: the key is the pair, not booking_id alone.',
  },
  {
    id: 'b02-dv-k5', type: 'fill', kind: 'applied',
    prompt: 'Complete the data dictionary entry for discount in Lantern’s order export, so that order_total can be checked from the other columns.',
    text: 'discount. Meaning: money taken off [[0]]. Unit: [[1]]. Level: [[2]]. Rule: at least 0 and at most [[3]]. Blanks: [[4]].',
    blanks: [
      { options: ['each pack', 'the whole order', 'the customer’s next order'], answer: 1 },
      { options: ['dollars', 'percent', 'packs'], answer: 0 },
      { options: ['interval', 'ordinal', 'ratio', 'nominal'], answer: 2 },
      { options: ['unit_price', 'quantity × unit_price', 'order_total', '100'], answer: 1 },
      { options: ['not allowed: record 0 when there is no discount', 'allowed: a blank means no discount', 'allowed: a blank means unknown'], answer: 0 },
    ],
    solution: 'Defined as a dollar amount for the whole order, discount makes the rule order_total = quantity × unit_price − discount checkable. It is a ratio amount (zero means none); it can’t be negative or exceed what the packs cost; and recording 0 rather than a blank removes any doubt about whether a blank means “no discount” or “not recorded”.',
  },
  {
    id: 'b02-dv-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s customer table could use email as its primary key instead of customer_id. What is the main problem with that?',
    options: [
      'Emails change, can be shared, get mistyped or are left blank, so they can’t identify one customer for good.',
      'Emails are text, and a primary key must be a whole number so that the database can sort, index and join on it.',
      'Emails are too long: a key should be short, and an address can run to dozens of characters.',
      'Emails are nominal, and a primary key must be ordinal so that the rows can be ranked by it.',
    ],
    answer: 0,
    feedback: {
      1: 'Keys can be text: a booking code such as HB-33101 is text. What matters is that the key is unique, never blank and stable.',
      2: 'Length is a minor storage question. The real issue is whether the value stays unique, present and unchanged.',
      3: 'Keys are labels, so they are normally nominal. Order plays no part in identifying a row.',
    },
    solution: 'A primary key must be unique, never blank and stable. Customers change email addresses, share them, mistype them and sometimes don’t give one, so an email can stop identifying the same customer, or start identifying two. A system-issued customer_id avoids all four problems.',
  },
];
