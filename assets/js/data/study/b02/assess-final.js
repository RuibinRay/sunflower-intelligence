// assess-final.js — B02 final assessment: 24 questions across all twelve lessons, two per lesson. 70% passes.
// New questions, not copies of lesson exercises or module-test items. No hints; solutions are shown on review.
// Every business, person and number is fictional. Figures about Lantern’s export come from assets/data/study/
// lantern-orders.csv and its manifest (rows counted from 1, header not counted); the constants below are those
// figures, and every num item's `check` recomputes its answer from them.

// ---------------------------------------------------------------- figures from lantern-orders (fictional)
const RAW_ROWS = 240;
const RAW_TOTALS_SUM = 9399.45;                                        // order_total as stored, all 240 rows
const SURPLUS_TOTALS = [14.00, 14.00, 25.20, 39.00, 66.00, 14.00,     // the 6 exact copies (rows 9, 50, 126, 161, 212, 229)
  42.00, 58.50, 17.55];                                                // the 3 repeated-key copies removed (rows 46, 79, 157)
const KEPT_ROWS = RAW_ROWS - SURPLUS_TOTALS.length;                    // 231 orders
const MISSING_EMAIL_RAW = 8;                                           // rows 31, 68, 79, 96, 135, 148, 156, 201
const MISSING_EMAIL_KEPT = MISSING_EMAIL_RAW - 1;                      // row 79 is the incomplete copy that is removed
const CUSTOMERS = 112;                                                 // distinct customer_id values in the 231 orders
const REVENUE_CLEAN = 9096.15;                                         // order_total after the five unreconciled totals are corrected
// average order value by region after cleaning, rounded to the cent: [orders, average]
const REGIONS = { North: [58, 28.83], West: [53, 34.99], Central: [25, 85.04], East: [52, 36.99], South: [43, 35.35] };

const sum = (a) => a.reduce((s, v) => s + v, 0);
const quantile = (a, p) => { const s = [...a].sort((x, y) => x - y); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.ceil(h)] - s[lo]); };

export const items = [
  // ---------------------------------------------------------------- datasets-and-variables
  {
    id: 'b02-fn-1', lesson: 'datasets-and-variables', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of Lantern’s order export (fictional).',
    text: 'Each row of <code>lantern-orders</code> describes one [[0]]. <code>order_id</code> should be the [[1]]. <code>customer_id</code> repeats, because one customer can place several orders; it points to a row of the customer table, so in this table it is a [[2]]. <code>size_g</code> records the pack weight in grams (250, 480, 750 or 1000), so its level of measurement is [[3]].',
    blanks: [
      { options: ['order', 'customer', 'product', 'day of trading'], answer: 0 },
      { options: ['primary key', 'foreign key', 'measure', 'composite key'], answer: 0 },
      { options: ['foreign key', 'primary key', 'measure', 'derived variable'], answer: 0 },
      { options: ['ratio', 'nominal', 'ordinal', 'interval'], answer: 0 },
    ],
    solution: 'One row is one order, so order_id is the primary key: unique and never blank. customer_id links each order to the customer table and may repeat: a foreign key. Grams have a true zero and 1,000 g is four times 250 g, so size_g is on a ratio scale (even though only four pack sizes occur).',
  },
  {
    id: 'b02-fn-2', lesson: 'datasets-and-variables', type: 'num', kind: 'applied',
    prompt: 'After cleaning, Lantern’s export holds 231 orders from 112 customers, with order totals adding to $9,096.15 for 1 March – 30 June 2026. Ana Lim asks how much a customer spends with Lantern on average over the period. What is the answer? (2 decimal places)',
    answer: 81.22, check: () => REVENUE_CLEAN / CUSTOMERS, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 39.38, say: 'That is the average per order (9,096.15 ÷ 231). Ana’s unit is the customer: divide by the number of distinct customers.' },
    ],
    solution: 'The unit of the question is the customer, not the row. Revenue ÷ distinct customers = 9,096.15 ÷ 112 = $81.22. The average per order is 9,096.15 ÷ 231 = $39.38; a customer places about 2.06 orders on average.',
  },
  // ---------------------------------------------------------------- profiling-and-validation
  {
    id: 'b02-fn-3', lesson: 'profiling-and-validation', type: 'rows', kind: 'applied',
    prompt: 'Rows from Lantern’s raw export (fictional). The rules are: quantity is a whole number from 1 to 200; region is exactly one of North, South, East, West or Central; rating is a whole number from 1 to 5, or blank (rating is optional). Select every row that breaks at least one rule. Rows are numbered from 0.',
    data: { table: {
      head: ['order_id', 'region', 'quantity', 'rating'],
      rows: [
        ['LC-10001', 'North', '2', '2'],
        ['LC-10004', 'West', '3', ''],
        ['LC-10022', 'N.', '1', ''],
        ['LC-10038', 'Wset', '2', '5'],
        ['LC-10079', 'South', '-2', ''],
        ['LC-10105', 'North', '0', ''],
        ['LC-10144', 'Central', '120', '5'],
      ],
    } },
    answer: [2, 3, 4, 5],
    solution: 'LC-10022 (“N.”) and LC-10038 (“Wset”) fail the region rule; LC-10079 (−2) and LC-10105 (0) fail the quantity rule. The blank ratings pass, because the rule allows a blank. LC-10144’s 120 bags is unusual but inside 1 to 200: a value for the outlier review, not a rule failure.',
  },
  {
    id: 'b02-fn-4', lesson: 'profiling-and-validation', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these problems in Lantern’s raw export can a validation rule detect using only the file itself? Select all that apply.',
    options: [
      'A quantity of −2',
      'The region “Wset”',
      'Which copy of order LC-10042 is right, when one says quantity 2 and the other quantity 3 and each total matches its quantity',
      'An order_total of $64.00 for one $46.00 bag with no discount',
      'A unit price of $1,800.00 for a bag of coffee',
      'A well-formed e-mail address typed with one wrong letter',
      'Whether 04/05/2026 means 4 May or 5 April',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'A uniqueness rule shows that the order id repeats, but both copies are valid and internally consistent: only the shop system can say which is right.',
      5: 'A wrong but well-formed address passes every format rule. That is an accuracy problem, settled only by the customer or another source.',
      6: 'Both readings are valid dates inside March to June 2026, so no rule fails. The evidence is the source’s convention.',
    },
    solution: 'Range rules catch −2 and $1,800.00, a set-membership rule catches “Wset”, and the cross-field rule order_total = quantity × unit_price − discount catches $64.00 (it should be $46.00). Rules prove values impossible; they can’t prove a possible value right, so the duplicate’s correct copy, a mistyped address and an ambiguous date need outside evidence.',
  },
  // ---------------------------------------------------------------- duplicates
  {
    id: 'b02-fn-5', lesson: 'duplicates', type: 'rows', kind: 'applied',
    prompt: 'Rows from Harborview Hotel’s booking export (fictional). A channel-manager sync sometimes creates a booking again under a new booking_id from the HB-261xx series; every other column of the copy matches the original, including those not shown. Select the rows to remove so that each booking appears once. Rows are numbered from 0.',
    data: { table: {
      head: ['booking_id', 'booked_on', 'check_in', 'check_out', 'room_type', 'total ($)'],
      rows: [
        ['HB-25066', '2025-07-30', '2025-08-05', '2025-08-07', 'Standard', '358'],
        ['HB-25067', '2025-08-02', '2025-09-03', '2025-09-09', 'Suite', '2112'],
        ['HB-25068', '2025-08-04', '2025-08-22', '2025-08-27', 'Standard', '870'],
        ['HB-26101', '2025-08-02', '2025-09-03', '2025-09-09', 'Suite', '2112'],
        ['HB-25071', '2025-08-10', '2025-09-15', '2025-09-21', 'Standard', '984'],
        ['HB-25072', '2025-08-14', '2025-08-14', '2025-08-16', 'Deluxe', '510'],
        ['HB-25073', '2025-08-16', '2025-08-20', '2025-08-21', 'Deluxe', '253'],
        ['HB-26102', '2025-08-14', '2025-08-14', '2025-08-16', 'Deluxe', '510'],
      ],
    } },
    answer: [3, 7],
    solution: 'HB-26101 repeats HB-25067 and HB-26102 repeats HB-25072 in every column except the id, and both carry ids from the sync’s series. Remove the copies and keep the originals. A deduplication on booking_id finds nothing here, because the ids differ: the business key is the booking’s content (booked_on, dates, room, guests, total), which is why these are near duplicates.',
  },
  {
    id: 'b02-fn-6', lesson: 'duplicates', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s raw export has 240 rows whose stored order totals add to $9,399.45. Nine of them are surplus copies: six exact copies with totals of $14.00, $14.00, $25.20, $39.00, $66.00 and $14.00, and three repeated order ids whose removed copies have totals of $42.00, $58.50 and $17.55. By what percentage do the surplus rows overstate the total of the 231 genuine orders? (2 decimal places)',
    answer: 3.19,
    check: () => { const surplus = sum(SURPLUS_TOTALS); return surplus / (RAW_TOTALS_SUM - surplus) * 100; },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 3.09, say: 'You divided by the inflated total of $9,399.45. An overstatement is measured against the true figure, the total of the 231 genuine orders.' },
      { value: 1.87, say: 'That counts only the six exact copies. The three removed copies of repeated order ids are surplus rows too.' },
    ],
    solution: 'Surplus totals: 14.00 + 14.00 + 25.20 + 39.00 + 66.00 + 14.00 = $172.20 from the exact copies and 42.00 + 58.50 + 17.55 = $118.05 from the repeated ids, $290.25 in all. Genuine orders: 9,399.45 − 290.25 = $9,109.20. Overstatement: 290.25 ÷ 9,109.20 × 100 = 3.19%.',
  },
  // ---------------------------------------------------------------- types-and-formats
  {
    id: 'b02-fn-7', lesson: 'types-and-formats', type: 'classify', kind: 'applied',
    prompt: 'In Lantern’s export (fictional), web orders write slash dates day first with a four-digit year (DD/MM/YYYY) and app orders write them month first with a two-digit year (M/D/YY); some dates are spreadsheet serials (1900 date system, where 46082 is 1 March 2026). Choose the ISO date for each raw value.',
    items: ['05/03/2026 (a web order)', '03/04/2026 (a web order)', '46121 (a serial number)', '4/20/26 (an app order)', 'June 25, 2026'],
    categories: ['2026-03-05', '2026-05-03', '2026-04-03', '2026-03-04', '2026-04-09', '2026-04-20', '2026-06-25'],
    answer: [0, 2, 4, 5, 6],
    feedback: {
      0: 'Web orders are day first, so 05/03 is 5 March. Read month first it would be 3 May, a valid date in the same period, which is why the source’s convention matters.',
      1: 'Day first: 3 April, not 4 March.',
      2: '46121 − 46082 = 39 days after 1 March: 31 days to 1 April, then 8 more, so 9 April.',
    },
    solution: '05/03/2026 and 03/04/2026 come from the web, which writes day first: 2026-03-05 and 2026-04-03. 46121 is 39 days after serial 46082 (1 March): 2026-04-09. 4/20/26 is month first (there is no month 20): 2026-04-20. June 25, 2026 is 2026-06-25.',
  },
  {
    id: 'b02-fn-8', lesson: 'types-and-formats', type: 'num', kind: 'numerical',
    prompt: 'One of Lantern’s 231 unit prices was typed with a decimal comma as 16,50. If a tool that strips every comma had read it as 1650, by how much would that one value raise the mean unit price of the 231 orders? (2 decimal places)',
    answer: 7.07, check: () => (1650 - 16.5) / KEPT_ROWS, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 7.14, say: 'That is 1,650 ÷ 231. The misread value replaces $16.50 rather than adding to it, so the mean rises by (1,650 − 16.50) ÷ 231.' },
      { value: 1633.5, say: 'That is the change in the sum. The mean changes by the change in the sum divided by the number of values.' },
    ],
    solution: 'The sum of the prices rises by 1,650 − 16.50 = 1,633.50, so the mean rises by 1,633.50 ÷ 231 = $7.07. One misread decimal mark moves the average price by about $7, half the price of a $14 bag, which is why conversions must name the decimal mark and list what they couldn’t read.',
  },
  // ---------------------------------------------------------------- text-and-categories
  {
    id: 'b02-fn-9', lesson: 'text-and-categories', type: 'rows', kind: 'conceptual',
    prompt: 'Region values from Lantern’s raw export (␣ marks a space). After trimming spaces and converting to Title Case, which values still don’t match one of North, South, East, West or Central exactly? Rows are numbered from 0.',
    data: { table: {
      head: ['region (raw)'],
      rows: [['north␣'], ['N.'], ['SOUTH'], ['Wset'], ['␣East'], ['central'], ['Soth'], ['E.']],
    } },
    answer: [1, 3, 6, 7],
    solution: 'Trimming and Title Case turn “north␣”, “SOUTH”, “␣East” and “central” into North, South, East and Central. The abbreviations “N.” and “E.” and the typing errors “Wset” and “Soth” are untouched by mechanical cleaning: they need a reviewed mapping table (N. → North, E. → East, Wset → West, Soth → South).',
  },
  {
    id: 'b02-fn-10', lesson: 'text-and-categories', type: 'order', kind: 'conceptual',
    prompt: 'Put these steps for cleaning Lantern’s product column in the order they should run.',
    items: [
      'Keep the raw product column unchanged and work on a copy',
      'Normalise the Unicode form (NFC)',
      'Trim spaces, including non-breaking spaces, and collapse runs of spaces into one',
      'Normalise the case',
      'Apply the reviewed mapping table',
      'Validate against the product list and flag any value still unmapped',
    ],
    solution: 'Keep the raw values first, so every change can be traced and redone. Normalise the encoding, then whitespace, then case, so that the mapping table sees one form of each variant and needs fewer rows. Map next, and validate last: anything not on the product list after mapping is flagged for review, not forced into a category.',
  },
  // ---------------------------------------------------------------- missing-values
  {
    id: 'b02-fn-11', lesson: 'missing-values', type: 'mc', kind: 'applied',
    prompt: 'In a fictional extract of Northfield University’s records, weekly study_hours is blank for 30% of first-years but 8% of fourth-years, and among students who answered, fourth-years report more hours. Within each year, nothing recorded predicts who left it blank. How should the blanks be filled for an estimate of average study hours across all students?',
    options: [
      'Fill each blank with the median of the student’s own year of study, and keep a missing-value indicator',
      'Fill every blank with the overall median of the observed hours',
      'Delete the students with blanks and average the rest',
      'Fill every blank with 0, because the student didn’t report any hours',
    ],
    answer: 0,
    feedback: {
      1: 'The observed hours over-represent fourth-years, who answered more often and study more, so one overall value pulls the first-years’ filled values up.',
      2: 'Listwise deletion keeps a sample with too many fourth-years, so the average leans towards their higher hours.',
      3: 'A blank means “not answered”, not “no study”. Zeros would invent data and drag the average down.',
    },
    solution: 'Missingness depends on a recorded variable, year of study, and not on the hours within a year: missing at random given year (MAR). Filling within year groups uses each group’s own typical value, so the mix of years is respected; the indicator keeps the fact that the value was imputed.',
  },
  {
    id: 'b02-fn-12', lesson: 'missing-values', type: 'num', kind: 'numerical',
    prompt: 'An analyst filled 36 blanks in a column of 100 values with the mean of the 64 observed values. The standard deviation of all 100 values is now 6.0. What was the sample standard deviation of the 64 observed values? (2 decimal places)',
    answer: 7.52, check: () => 6 / Math.sqrt((64 - 1) / (100 - 1)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 4.79, say: 'You multiplied by the shrink factor. Mean imputation shrinks the SD, so the observed SD is larger: divide by √(63 ÷ 99).' },
      { value: 7.5, say: 'That uses √(100 ÷ 64). The sample SD divides by n − 1, so the factor is √(63 ÷ 99).' },
    ],
    solution: 'Filled values sit at the mean, so the sum of squared deviations is unchanged while the divisor rises from 63 to 99: SD after = SD observed × √(63 ÷ 99). So SD observed = 6.0 ÷ √(63 ÷ 99) = 6.0 ÷ 0.7977 = 7.52.',
  },
  // ---------------------------------------------------------------- outliers
  {
    id: 'b02-fn-13', lesson: 'outliers', type: 'rows', kind: 'applied',
    prompt: 'Ten order totals from Lantern’s cleaned export (fictional). Using quartiles by linear interpolation, select every order outside the Tukey fences (Q1 − 1.5 × IQR, Q3 + 1.5 × IQR). Rows are numbered from 0.',
    data: { table: {
      head: ['order', 'order_total ($)'],
      rows: [['A', '21.00'], ['B', '17.00'], ['C', '58.00'], ['D', '14.00'], ['E', '28.00'], ['F', '1512.00'], ['G', '19.50'], ['H', '15.50'], ['I', '24.00'], ['J', '18.00']],
    } },
    answer: [2, 5],
    solution: 'Sorted: 14, 15.5, 17, 18, 19.5, 21, 24, 28, 58, 1512. Q1 at position 1 + 9 × 0.25 = 3.25: 17 + 0.25 × 1 = 17.25. Q3 at 7.75: 24 + 0.75 × 4 = 27. IQR = 9.75; fences 17.25 − 14.625 = 2.625 and 27 + 14.625 = 41.625. Orders C ($58) and F ($1,512) are flagged. A flag starts an investigation: F is the genuine 120-bag office order, which stays.',
  },
  {
    id: 'b02-fn-14', lesson: 'outliers', type: 'mc', kind: 'conceptual',
    prompt: 'The ten order totals in the previous question include $1,512, far above the rest, yet the rule |z| > 3 flags nothing. Why?',
    options: [
      'In a sample of n values no |z| can exceed (n − 1) ÷ √n, about 2.85 for n = 10, and the extreme value also inflates the SD it is measured against',
      'The z-score rule only flags values below the mean',
      'z-scores are computed from the median and the MAD, which ignore the extreme value',
      'Ten values are too few to calculate a standard deviation',
    ],
    answer: 0,
    feedback: {
      1: '|z| > 3 is two-sided: a large positive z is flagged as readily as a large negative one.',
      2: 'That describes the modified z-score. The ordinary z-score uses the mean and the SD, which the extreme value pulls towards itself.',
      3: 'Any two or more values have a sample SD; the problem is how the extreme value affects it.',
    },
    solution: 'With n = 10, the largest possible |z| is 9 ÷ √10 ≈ 2.85, so the rule can’t fire whatever the data. More generally, an outlier raises the mean and the SD it is judged against (masking). Use the IQR fences or the modified z-score for small or contaminated samples.',
  },
  // ---------------------------------------------------------------- skewed-data
  {
    id: 'b02-fn-15', lesson: 'skewed-data', type: 'num', kind: 'numerical',
    prompt: 'Five fictional orders total $14, $15, $16, $18 and $20 (mean $16.60, median $16). A sixth order of $1,512 is added. What is the new mean? (2 decimal places)',
    answer: 265.83, check: () => sum([14, 15, 16, 18, 20, 1512]) / 6, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 17, say: 'That is the new median, the average of the third and fourth values (16 and 18). The question asks for the mean.' },
      { value: 16.6, say: 'That is the mean before the sixth order was added.' },
    ],
    solution: 'New mean = (14 + 15 + 16 + 18 + 20 + 1,512) ÷ 6 = 1,595 ÷ 6 = $265.83. The median moves only from $16 to $17. One large value makes the mean describe none of the orders: that is what a long right tail does to a mean.',
  },
  {
    id: 'b02-fn-16', lesson: 'skewed-data', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about taking the natural log of a right-skewed column are true? Select all that apply.',
    options: [
      'It can only be applied to values above zero',
      'It keeps the order of the values',
      'Back-transforming the mean of the logs gives the geometric mean, not the arithmetic mean',
      'It removes the outliers from the data',
      'It always makes the column normally distributed',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The log compresses large values but keeps every one of them; an error is still an error on the log scale.',
      4: 'It reduces right skew; it can over-correct, and nothing guarantees normality.',
    },
    solution: 'ln x is defined only for x > 0 and is increasing, so the order is kept. exp(mean of ln x) is the geometric mean, which lies below the arithmetic mean for unequal values. The log pulls in the right tail without removing values or guaranteeing a normal shape.',
  },
  // ---------------------------------------------------------------- scaling
  {
    id: 'b02-fn-17', lesson: 'scaling', type: 'num', kind: 'numerical',
    prompt: 'A scaler fitted on Northfield University’s training data (fictional) stores a mean entry_score of 64 and a standard deviation of 12. What is the standardised value of an applicant who scored 49? (2 decimal places)',
    answer: -1.25, check: () => (49 - 64) / 12, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.25, say: 'The score is below the mean, so its z-score is negative.' },
      { value: -15, say: 'That is the distance from the mean in points. Divide by the standard deviation.' },
    ],
    solution: 'z = (x − mean) ÷ SD = (49 − 64) ÷ 12 = −1.25, using the training parameters unchanged: the applicant is one and a quarter standard deviations below the training mean.',
  },
  {
    id: 'b02-fn-18', lesson: 'scaling', type: 'rows', kind: 'applied',
    prompt: 'Lantern’s min–max scaler for order value was fitted on training orders, where the minimum was $12 and the maximum $60. It is applied to these test orders. Select every test order whose scaled value falls outside 0 to 1. Rows are numbered from 0.',
    data: { table: {
      head: ['test order', 'order value ($)'],
      rows: [['T1', '8'], ['T2', '12'], ['T3', '30'], ['T4', '60'], ['T5', '75'], ['T6', '45']],
    } },
    answer: [0, 4],
    solution: 'x′ = (x − 12) ÷ (60 − 12) = (x − 12) ÷ 48. T1: (8 − 12) ÷ 48 = −0.08; T2: 0; T3: 0.375; T4: 1; T5: (75 − 12) ÷ 48 = 1.31; T6: 0.69. T1 and T5 fall outside 0 to 1. That is expected for test values outside the training range and is not an error: refitting the scaler on test data would be leakage.',
  },
  // ---------------------------------------------------------------- encoding-categories
  {
    id: 'b02-fn-19', lesson: 'encoding-categories', type: 'num', kind: 'numerical',
    prompt: 'In Lantern’s training data (fictional), 40 orders came from the West and 12 of them led to a reorder; the overall reorder rate is 0.25. What is West’s smoothed target encoding, (reorders + m × overall rate) ÷ (orders + m), with m = 20? (3 decimal places)',
    answer: 0.283, check: () => (12 + 20 * 0.25) / (40 + 20), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: 0.3, say: 'That is West’s raw reorder rate, 12 ÷ 40, without smoothing towards the overall rate.' },
      { value: 0.275, say: 'That is the simple average of 0.30 and 0.25. Smoothing weights the two by 40 orders and m = 20.' },
    ],
    solution: '(12 + 20 × 0.25) ÷ (40 + 20) = (12 + 5) ÷ 60 = 0.283. The encoding moves West’s raw rate of 0.30 a third of the way towards 0.25, because m = 20 counts as 20 imaginary orders at the overall rate. Fit it on the training rows only.',
  },
  {
    id: 'b02-fn-20', lesson: 'encoding-categories', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern plans a linear regression with an intercept. Choose the treatment for each candidate input.',
    items: ['region (North, South, East, West, Central)', 'subscription (yes, no)', 'customer_id', 'grind (whole bean, coarse, medium, fine), used as a coarse-to-fine scale', 'channel (web, app)', 'product (11 products)'],
    categories: ['Dummy columns, one fewer than the categories', 'A single 0/1 column', 'Ordinal codes in a stated order', 'Leave it out of the model'],
    answer: [0, 1, 3, 2, 1, 0],
    feedback: {
      0: 'Regions have no order, so codes 0 to 4 would invent one. With an intercept, use 4 dummies and a reference region.',
      2: 'An identifier is unique to a customer, carries no general pattern and lets the model memorise individuals.',
      3: 'Grind has a genuine order. Supply it explicitly (whole bean, coarse, medium, fine), and accept that ordinal codes assume equal steps.',
    },
    solution: 'Nominal variables with several categories (region, product) get k − 1 dummy columns; two-category variables (subscription, channel) need one 0/1 column; an ordered variable (grind) can take ordinal codes in a stated order; identifiers (customer_id) stay out.',
  },
  // ---------------------------------------------------------------- transforming-data
  {
    id: 'b02-fn-21', lesson: 'transforming-data', type: 'rows', kind: 'applied',
    prompt: 'Harborview’s total should equal nights × rate, where nights is the number of days from check_in to check_out. Derive nights from the dates and select every booking whose stored total disagrees (fictional bookings; 2026 is not a leap year). Rows are numbered from 0.',
    data: { table: {
      head: ['check_in', 'check_out', 'rate ($)', 'total ($)'],
      rows: [
        ['2026-03-29', '2026-04-02', '150', '600'],
        ['2026-02-27', '2026-03-02', '180', '720'],
        ['2026-05-30', '2026-06-01', '210', '420'],
        ['2026-06-28', '2026-07-03', '120', '720'],
        ['2026-01-10', '2026-01-17', '135', '945'],
        ['2025-12-30', '2026-01-02', '160', '480'],
        ['2026-04-29', '2026-05-01', '175', '525'],
      ],
    } },
    answer: [1, 3, 6],
    solution: 'Nights: 4 (29 March to 2 April), 3 (27 February to 2 March in a 28-day February), 2, 5, 7, 3 (across the new year) and 2 (April has 30 days). Derived totals: 600, 540, 420, 600, 945, 480 and 350. Rows 1 (720 ≠ 540), 3 (720 ≠ 600) and 6 (525 ≠ 350) disagree; each stored total equals one night too many, a sign that nights were counted inclusively.',
  },
  {
    id: 'b02-fn-22', lesson: 'transforming-data', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s cleaned orders by region (fictional): North 58 orders averaging $28.83; West 53 averaging $34.99; Central 25 averaging $85.04; East 52 averaging $36.99; South 43 averaging $35.35. What is the average order value across all regions? (2 decimal places)',
    answer: 39.38,
    check: () => { const r = Object.values(REGIONS); return sum(r.map(([n, a]) => n * a)) / sum(r.map(([n]) => n)); },
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 44.24, say: 'That is the plain average of the five regional averages. Regions with more orders must count for more: weight each average by its orders.' },
    ],
    solution: 'Revenue = 58 × 28.83 + 53 × 34.99 + 25 × 85.04 + 52 × 36.99 + 43 × 35.35 = $9,096.14 over 231 orders, so the average is $39.38 (the regional averages are rounded to the cent, so the revenue is a cent below the exact $9,096.15). The plain average of the five figures, $44.24, gives Central’s 25 orders as much say as the North’s 58.',
  },
  // ---------------------------------------------------------------- data-quality-report
  {
    id: 'b02-fn-23', lesson: 'data-quality-report', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s raw export has 240 rows, 8 of them without an e-mail address. After the 9 surplus rows are removed, 231 rows remain and 7 have no address. By how many percentage points did the share of rows without an address change? Enter a fall as a negative number. (2 decimal places)',
    answer: -0.3, check: () => (MISSING_EMAIL_KEPT / KEPT_ROWS - MISSING_EMAIL_RAW / RAW_ROWS) * 100, unit: 'percentage points', places: 2, tol: 0.01,
    wrong: [
      { value: -9.09, say: 'That is the relative change, (3.03 − 3.33) ÷ 3.33. The question asks for the difference in percentage points.' },
      { value: -1, say: 'That is the change in the count of missing addresses. Shares need their denominators: 8 of 240 and 7 of 231.' },
      { value: 0.3, say: 'The share fell, so the change is negative.' },
    ],
    solution: 'Before: 8 ÷ 240 = 3.33%. After: 7 ÷ 231 = 3.03%. Change: 3.03 − 3.33 = −0.30 percentage points (a relative fall of 9.1%). The report gives both counts with their denominators, so a reader can see that one missing address left with a removed duplicate.',
  },
  {
    id: 'b02-fn-24', lesson: 'data-quality-report', type: 'mc', kind: 'conceptual',
    prompt: 'In Lantern’s cleaned orders, Central’s average order value is $85.04 against $29 to $37 elsewhere. One of Central’s 25 orders is a genuine 120-bag office order of $1,512.00. What should the data quality report say?',
    options: [
      'Central’s average is $85.04 including one genuine 120-bag office order ($1,512.00) and $25.58 without it; the order is kept because it is real revenue, and comparisons of typical orders should use medians',
      'Central’s average is $25.58, after removing an outlier',
      'Central’s average is $85.04, with no further comment, because the order is genuine',
      'Central’s average is calculated after capping the order at the upper Tukey fence',
    ],
    answer: 0,
    feedback: {
      1: 'Removing a genuine order because it is inconvenient understates Central’s revenue, and calling it an outlier without saying it is real misleads the reader.',
      2: 'True, but incomplete: a reader comparing regions would conclude Central’s customers spend far more per order, when one order drives the difference.',
      3: 'Capping replaces a real amount with an invented one and hides the decision.',
    },
    solution: 'The report keeps the genuine value, discloses its effect and gives the figure with and without it: (2,125.90 − 1,512.00) ÷ 24 = $25.58 without the office order. Readers can then use whichever figure fits their question.',
  },
];
