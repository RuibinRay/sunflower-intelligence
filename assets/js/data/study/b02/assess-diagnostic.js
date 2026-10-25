// assess-diagnostic.js — B02 course diagnostic: three questions per module, used only to suggest where to start.
// New questions, not copies of lesson exercises or module-test items. No hints; solutions are shown on review.
// Every business, table and number is fictional. Every num item's `check` recomputes its answer.

const quantile = (a, p) => { const s = [...a].sort((x, y) => x - y); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.ceil(h)] - s[lo]); };
const serial1900 = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;

export const items = [
  // ---------------------------------------------------------------- module 1: understanding your data
  {
    id: 'b02-dg-1', lesson: 'datasets-and-variables', type: 'mc', kind: 'conceptual',
    prompt: 'Skylark Air, a fictional airline, exports its boarding file: one row per flight leg of each booking, where every booking is for a single passenger; 1,500 rows, no blank cells. booking_ref has 1,482 distinct values, passenger_id has 1,320, and the pair booking_ref + leg has 1,500. Which should be the primary key?',
    options: [
      'booking_ref + leg, a composite key',
      'booking_ref on its own, since every booking is for one passenger',
      'passenger_id on its own, since it identifies the traveller',
      'The row number, which is unique by construction',
    ],
    answer: 0,
    feedback: {
      1: '1,482 distinct values in 1,500 rows means 18 rows share a booking_ref with another row: a return trip is one booking with two legs.',
      2: 'Passengers fly more than once, so passenger_id repeats (1,320 distinct values in 1,500 rows).',
      3: 'A row number identifies a position in the file, not a passenger on a leg, so it can never reveal a duplicate.',
    },
    solution: 'A primary key must be unique and never blank. Compare each candidate’s distinct count with the row count: only booking_ref + leg has 1,500 distinct values in 1,500 rows, which matches the unit of observation (one leg of one booking). It works because each booking has one passenger; if bookings could hold several passengers, the key would need passenger_id as well.',
  },
  {
    id: 'b02-dg-2', lesson: 'datasets-and-variables', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each variable by its level of measurement.',
    items: ['Room number on a hotel door', 'Temperature of a cold-brew batch (°C)', 'Number of bags in an order', 'T-shirt size (S, M, L, XL)', 'Weight of a parcel (kg)'],
    categories: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    answer: [0, 2, 3, 1, 3],
    feedback: {
      0: 'A room number is a label written with digits: room 214 is not “twice” room 107, and averaging room numbers means nothing.',
      1: 'Differences in °C are meaningful, but 0 °C is not “no temperature”, so 20 °C is not twice as warm as 10 °C: interval.',
      3: 'Sizes are ordered, but the steps between them needn’t be equal: ordinal.',
    },
    solution: 'Room number: nominal (an identifier). Temperature in °C: interval (an arbitrary zero). Number of bags and parcel weight: ratio (a true zero, so ratios make sense). T-shirt size: ordinal.',
  },
  {
    id: 'b02-dg-3', lesson: 'profiling-and-validation', type: 'rows', kind: 'applied',
    prompt: 'A fictional coffee shop’s rule says discount must be at least 0 and no more than quantity × unit_price. Select every order that breaks it. Rows are numbered from 0.',
    data: { table: {
      head: ['order', 'quantity', 'unit_price ($)', 'discount ($)'],
      rows: [
        ['A-01', '2', '14.00', '0.00'],
        ['A-02', '1', '58.00', '5.00'],
        ['A-03', '1', '17.00', '-3.40'],
        ['A-04', '3', '19.50', '5.85'],
        ['A-05', '1', '15.50', '18.00'],
        ['A-06', '2', '16.50', '3.30'],
        ['A-07', '120', '14.00', '168.00'],
        ['A-08', '2', '22.00', '44.00'],
      ],
    } },
    answer: [2, 4],
    solution: 'A-03 has a negative discount, below the minimum of 0. A-05’s discount of $18.00 is more than its value of 1 × 15.50 = $15.50. A-08’s discount equals its value (2 × 22.00 = 44.00), which “no more than” allows. A-07’s $168 discount is large but is only 10% of 120 × 14.00 = $1,680, so it passes.',
  },
  // ---------------------------------------------------------------- module 2: fixing records and formats
  {
    id: 'b02-dg-4', lesson: 'duplicates', type: 'mc', kind: 'conceptual',
    prompt: 'Two rows in a fictional coffee shop’s order export share the order_id LC-20417 and agree in every column, except that one has a blank e-mail address and the other has the address. Which copy should survive?',
    options: [
      'The copy with the e-mail address (most complete): the blank adds nothing the other lacks',
      'The first copy in the file, whatever it contains, because the first row is the original and later rows are copies',
      'Both copies, because rows that differ in a column are two different records, not duplicates',
      'Neither: delete the order, because two copies that disagree mean none of its data can be trusted',
    ],
    answer: 0,
    feedback: {
      1: '“Keep first” is a sensible default only when the copies are identical or ordered by update time. Here it could keep the incomplete copy.',
      2: 'One order_id is one order. Keeping both counts the order and its revenue twice.',
      3: 'The order happened; only one copy lost a value. Deleting it would understate orders and revenue.',
    },
    solution: 'The copies describe the same order and conflict only because one value is blank, so the most complete copy keeps everything that is known. Record the rule (“keep the most complete copy”) in the cleaning log.',
  },
  {
    id: 'b02-dg-5', lesson: 'types-and-formats', type: 'num', kind: 'numerical',
    prompt: 'An order date arrives as the spreadsheet serial number 46101 (Excel’s 1900 date system). 1 March 2026 is 46082. On which day of March 2026 was the order placed?',
    answer: 20, check: () => 46101 - serial1900(2026, 3, 1) + 1, unit: 'day of the month', places: 0, tol: 0,
    wrong: [
      { value: 19, say: '46101 − 46082 = 19 is the number of days after 1 March, so the date is 1 + 19 = 20 March.' },
    ],
    solution: '46101 − 46082 = 19 days after 1 March 2026, which is 20 March 2026 (ISO 2026-03-20).',
  },
  {
    id: 'b02-dg-6', lesson: 'text-and-categories', type: 'num', kind: 'applied',
    prompt: 'A region column holds these eight values (␣ marks a space): North, north, ␣North, NORTH␣, N., South, south␣, Sth. How many distinct values remain after trimming spaces and converting to lower case?',
    answer: 4,
    check: () => new Set(['North', 'north', ' North', 'NORTH ', 'N.', 'South', 'south ', 'Sth'].map((v) => v.trim().toLowerCase())).size,
    unit: 'values', places: 0, tol: 0,
    wrong: [
      { value: 2, say: 'Trimming and lower-casing don’t expand abbreviations or fix typing errors: “n.” and “sth” stay separate until a mapping table merges them.' },
      { value: 8, say: 'That is the count before cleaning. Trimming and lower-casing merge the four spellings of “north” and the two of “south”.' },
    ],
    solution: 'After trimming and lower-casing: north (four values), n., south (two values) and sth, so 4 distinct values. A mapping table must then map n. to North and sth to South.',
  },
  // ---------------------------------------------------------------- module 3: missing and unusual values
  {
    id: 'b02-dg-7', lesson: 'missing-values', type: 'num', kind: 'numerical',
    prompt: 'A fictional survey file has 400 rows. income is blank in 40 rows and age in 30 rows; 10 rows have both blank. With listwise deletion on income and age, how many rows does the analysis use?',
    answer: 340, check: () => 400 - (40 + 30 - 10), unit: 'rows', places: 0, tol: 0,
    wrong: [
      { value: 330, say: 'You removed 70 rows, counting the 10 rows with both blanks twice. Rows missing at least one value: 40 + 30 − 10 = 60.' },
      { value: 390, say: 'That removes only the 10 rows missing both. Listwise deletion removes a row missing either value.' },
    ],
    solution: 'Rows missing at least one of the two: 40 + 30 − 10 = 60 (the 10 rows with both blank appear in both counts). Rows kept: 400 − 60 = 340.',
  },
  {
    id: 'b02-dg-8', lesson: 'outliers', type: 'num', kind: 'numerical',
    prompt: 'Eight days of returns at a fictional clothing shop: 3, 4, 4, 5, 6, 7, 8 and 30. Using quartiles by linear interpolation, what is the upper Tukey fence (Q3 + 1.5 × IQR)? (2 decimal places)',
    answer: 12.13,
    check: () => { const a = [3, 4, 4, 5, 6, 7, 8, 30]; const q1 = quantile(a, 0.25), q3 = quantile(a, 0.75); return q3 + 1.5 * (q3 - q1); },
    unit: 'returns', places: 2, tol: 0.01,
    wrong: [
      { value: 10.5, say: 'You added 1 × IQR (7.25 + 3.25). The Tukey fence adds 1.5 × IQR to Q3.' },
      { value: 12.75, say: 'You may have used quartiles as medians of each half (Q1 = 4, Q3 = 7.5). With linear interpolation Q3 is at position 1 + 7 × 0.75 = 6.25: 7 + 0.25 × 1 = 7.25.' },
    ],
    solution: 'Positions are 1 + (n − 1)p with n = 8. Q1 at 2.75: 4 + 0.75 × 0 = 4. Q3 at 6.25: 7 + 0.25 × (8 − 7) = 7.25. IQR = 3.25; upper fence = 7.25 + 1.5 × 3.25 = 12.125 ≈ 12.13. The 30-return day is flagged for investigation.',
  },
  {
    id: 'b02-dg-9', lesson: 'skewed-data', type: 'mc', kind: 'applied',
    prompt: 'A fictional courier’s delivery distances have a mean of 42 km and a median of 18 km. The manager asks for the distance of a typical delivery. What do you report?',
    options: [
      'The median, 18 km: the data are right-skewed, and a few long deliveries pull the mean up',
      'The mean, 42 km, because it uses every delivery',
      'The average of the mean and the median, 30 km',
      'The mean after deleting every delivery above 42 km',
    ],
    answer: 0,
    feedback: {
      1: 'The mean is right for totals (fuel for all deliveries), not for a typical delivery in a long-tailed distribution.',
      2: 'Averaging two summaries gives a number with no meaning.',
      3: 'Deleting genuine long deliveries to move the mean is removing inconvenient data.',
    },
    solution: 'A mean far above the median signals a long right tail. For a typical value report the median (with the quartiles for spread); keep the mean for totals and forecasts.',
  },
  // ---------------------------------------------------------------- module 4: preparing data for analysis
  {
    id: 'b02-dg-10', lesson: 'scaling', type: 'num', kind: 'numerical',
    prompt: 'A scaler fitted on training data stores a mean of 40 and a standard deviation of 8. What is the standardised value of a new observation of 58?',
    answer: 2.25, check: () => (58 - 40) / 8, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 18, say: 'That is the distance from the mean. Divide it by the standard deviation.' },
      { value: 7.25, say: 'Subtract the mean before dividing: (58 − 40) ÷ 8.' },
    ],
    solution: 'z = (x − mean) ÷ SD = (58 − 40) ÷ 8 = 2.25, using the training parameters unchanged.',
  },
  {
    id: 'b02-dg-11', lesson: 'encoding-categories', type: 'mc', kind: 'conceptual',
    prompt: 'A satisfaction band takes the values poor, fair, good and excellent. You encode it as 0, 1, 2 and 3 in that order. What does that encoding assume?',
    options: [
      'That the bands are ordered and that every step between neighbouring bands is the same size',
      'Nothing: the codes are only labels, and a model reads them as names of bands rather than as numbers',
      'That the bands are unordered, like colours, so a model treats each band as a separate category with no ranking',
      'That excellent is three times as good as fair',
    ],
    answer: 0,
    feedback: {
      1: 'A model that uses the codes as numbers treats 3 as more than 2 by the same amount as 2 is more than 1.',
      2: 'Unordered categories need one-hot or dummy columns; numeric codes would invent an order.',
      3: 'Ratios between ordinal codes have no meaning: 3 ÷ 1 is not a statement about satisfaction.',
    },
    solution: 'Ordinal codes keep the order (good for an ordered variable) but impose equal steps. If that assumption is doubtful, use dummy columns instead and let the model estimate each band’s effect.',
  },
  {
    id: 'b02-dg-12', lesson: 'transforming-data', type: 'num', kind: 'applied',
    prompt: 'A fictional coffee roaster sold 60 orders in the North averaging $30 and 40 orders in the South averaging $20. What is its average order value across both regions?',
    answer: 26, check: () => (60 * 30 + 40 * 20) / (60 + 40), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 25, say: 'That is the plain average of the two regional averages. The North has more orders, so it carries more weight.' },
    ],
    solution: 'The overall average is total revenue ÷ total orders: (60 × 30 + 40 × 20) ÷ 100 = (1,800 + 800) ÷ 100 = $26, a weighted average of the regional averages.',
  },
];

// If the student scores at least 80% on the items for every module before the one named, suggest starting there.
export const route = [{ module: 2, ifAtLeast: 0.8 }, { module: 3, ifAtLeast: 0.8 }, { module: 4, ifAtLeast: 0.8 }];
