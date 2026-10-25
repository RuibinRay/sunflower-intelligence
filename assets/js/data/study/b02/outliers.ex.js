// outliers.ex.js — B02 · Outliers and impossible values: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). All businesses, people and figures are fictional.

// Helpers for the checks: quartiles by linear interpolation (Excel QUARTILE.INC, NumPy default), median, MAD, sample SD.
const sorted = (a) => [...a].sort((x, y) => x - y);
const q = (a, p) => { const s = sorted(a); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.ceil(h)] - s[lo]); };
const median = (a) => q(a, 0.5);
const mad = (a) => { const m = median(a); return median(a.map((v) => Math.abs(v - m))); };
const modz = (a, x) => 0.6745 * (x - median(a)) / mad(a);
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const upper = (a) => q(a, 0.75) + 1.5 * (q(a, 0.75) - q(a, 0.25));

const RETURNS = [3, 4, 4, 5, 6, 6, 7, 8, 9, 10, 31];
const DELIVERY = [2, 3, 3, 4, 5, 6, 21];
const BATTERY = [9.8, 10.4, 10.1, 9.6, 10.9, 10.2, 9.9, 10.5, 10.0, 512.0];
const NIGHTS = [1, 1, 2, 2, 2, 3, 3, 4, 14];
const TOTALS = [18, 22, 24, 25, 27, 29, 31, 35, 95];
const STAYS = [1, 2, 2, 2, 3, 3, 4, 5, 12];

export const widgets = {
  'out-orders': {
    type: 'distribution',
    values: [1, 1, 2, 2, 2, 3, 3, 4, 5, 6, 120, 999],
    label: 'Bags per order, twelve Lantern orders (fictional)',
    transforms: ['none'],
    rules: ['iqr', 'z', 'mad'],
  },
  'out-hotel': {
    type: 'distribution',
    dataset: 'harborview-bookings',
    column: 'rate',
    transforms: ['none'],
    rules: ['iqr', 'z', 'mad'],
  },
  'out-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['validate', 'outliers'],
    watch: ['quantity', 'order_total'],
    task: 'First add a validation rule for quantity from the data dictionary (a whole number from 1 to 200) and look at the orders that fail it: they are impossible values, not outliers, so set them to missing. Then run an outlier check on quantity with each rule. The modified z-score can’t be calculated here (more than half the orders are for one bag, so the MAD is 0), and with an IQR of one bag the Tukey fences flag ordinary orders of four to six bags as well. Check the largest flagged order against its order total and discount to decide whether it is a typing error or a genuine bulk order. The genuine bulk order should still be in the data when you finish.',
  },
};

export const guided = [
  {
    id: 'b02-out-g1', type: 'steps', kind: 'numerical',
    prompt: 'A clothing brand’s online shop records the number of returns each day. Over eleven days: 3, 4, 4, 5, 6, 6, 7, 8, 9, 10 and 31 (already sorted). Find the Tukey fences using quartiles by linear interpolation.',
    solution: 'Positions are 1 + 10p. Q1 at 3.5: halfway from 4 to 5 = 4.5. Q3 at 8.5: halfway from 8 to 9 = 8.5. IQR = 4, so 1.5 × IQR = 6. Fences: 4.5 − 6 = −1.5 and 8.5 + 6 = 14.5. Only 31 lies outside, so it is the one day to investigate (a returns batch after a sizing error, perhaps, or two days’ returns logged together).',
    steps: [
      { id: 'b02-out-g1-s1', type: 'num', prompt: 'What is Q1?',
        answer: 4.5, check: () => q(RETURNS, 0.25), tol: 0.01, unit: 'returns', places: 2,
        hints: ['Q1 sits at position 1 + (n − 1) × 0.25 = 1 + 10 × 0.25 = 3.5.', 'Position 3.5 is halfway between the 3rd value (4) and the 4th value (5).'],
        wrong: [{ value: 4, say: 'That is the median of the lower half, another common method. This course interpolates: position 3.5 is halfway from 4 to 5.' }] },
      { id: 'b02-out-g1-s2', type: 'num', prompt: 'What is Q3?',
        answer: 8.5, check: () => q(RETURNS, 0.75), tol: 0.01, unit: 'returns', places: 2,
        hints: ['Position 1 + 10 × 0.75 = 8.5.', 'Halfway between the 8th value (8) and the 9th (9).'],
        wrong: [{ value: 9, say: 'That is the median of the upper half. With linear interpolation, position 8.5 is halfway from 8 to 9.' }] },
      { id: 'b02-out-g1-s3', type: 'num', prompt: 'What is the upper fence?',
        answer: 14.5, check: () => upper(RETURNS), tol: 0.01, unit: 'returns', places: 2,
        hints: ['IQR = Q3 − Q1 = 8.5 − 4.5.', 'Upper fence = Q3 + 1.5 × IQR = 8.5 + 1.5 × 4.'],
        wrong: [
          { value: 6, say: 'That is 1.5 × IQR, the distance from Q3 to the fence. Add it to Q3.' },
          { value: 20.5, say: 'You added 3 × IQR, which gives the outer fence. The usual (inner) fence uses 1.5 × IQR.' },
        ] },
      { id: 'b02-out-g1-s4', type: 'mc', prompt: 'Which days are flagged?',
        options: ['Only the day with 31 returns', 'The days with 10 and 31 returns', 'No days', 'The days with 3 and 31 returns'],
        answer: 0,
        hints: ['The lower fence is 4.5 − 6 = −1.5; compare every value with both fences.'],
        feedback: { 1: '10 is below the upper fence of 14.5.', 2: '31 is far above 14.5.', 3: 'The lower fence is −1.5, and 3 is above it.' } },
    ],
  },
  {
    id: 'b02-out-g2', type: 'num', kind: 'numerical',
    prompt: 'Seven deliveries from an online retailer took 2, 3, 3, 4, 5, 6 and 21 days. Calculate the modified z-score of the 21-day delivery. (2 decimal places)',
    answer: 11.47, check: () => modz(DELIVERY, 21), tol: 0.01, unit: '', places: 2,
    hints: ['The median of seven sorted values is the 4th: 4 days. The absolute distances from 4 are 2, 1, 1, 0, 1, 2 and 17.', 'Sorted distances: 0, 1, 1, 1, 2, 2, 17, so MAD = 1. Then M = 0.6745 × (21 − 4) ÷ 1.'],
    wrong: [
      { value: 17, say: 'You left out the constant 0.6745, which puts the score on the same scale as an ordinary z-score.' },
      { value: 25.2, say: 'You divided by 0.6745 instead of multiplying: M = 0.6745 × (x − median) ÷ MAD.' },
      { value: 2.22, say: 'That is the ordinary z-score, (21 − 6.29) ÷ 6.63. The 21 inflates the mean and SD, so it looks unremarkable; the modified score uses the median and MAD.' },
    ],
    solution: 'Median = 4. Absolute distances from 4: 2, 1, 1, 0, 1, 2, 17; their median (the MAD) is 1. M = 0.6745 × (21 − 4) ÷ 1 = 11.47, far above 3.5, so the delivery is flagged. Its ordinary z-score is only 2.22.',
  },
  {
    id: 'b02-out-g3', type: 'steps', kind: 'applied',
    prompt: 'A battery-storage installer logs the energy (kWh) each customer’s home battery delivers per day. One battery’s readings over ten days were 9.8, 10.4, 10.1, 9.6, 10.9, 10.2, 9.9, 10.5, 10.0 and 512.0. The 512.0 came from a sensor fault.',
    solution: 'In ten values no |z| can exceed 9 ÷ √10 = 2.85, and the faulty reading reaches that ceiling (z = 2.85): a |z| > 3 rule can never flag it. The median is 10.15 and the MAD is 0.30, so its modified z-score is 0.6745 × 501.85 ÷ 0.30 = 1,128. Use the modified z-score or the IQR fences for small samples, and a range check (a home battery can’t deliver hundreds of kWh a day) before either.',
    steps: [
      { id: 'b02-out-g3-s1', type: 'num', prompt: 'What is the largest absolute z-score that any value in a sample of ten can have? (2 decimal places)',
        answer: 2.85, check: () => 9 / Math.sqrt(10), tol: 0.01, unit: '', places: 2,
        hints: ['Shiffler’s ceiling is (n − 1) ÷ √n.', '(10 − 1) ÷ √10 = 9 ÷ 3.162.'] },
      { id: 'b02-out-g3-s2', type: 'num', prompt: 'The ten readings have mean 60.34 and sample standard deviation 158.70. What is the z-score of 512.0? (2 decimal places)',
        answer: 2.85, check: () => (512 - mean(BATTERY)) / sd(BATTERY), tol: 0.01, unit: '', places: 2,
        hints: ['z = (x − mean) ÷ s.', '(512.0 − 60.34) ÷ 158.70.'] },
      { id: 'b02-out-g3-s3', type: 'num', prompt: 'The median of the readings is 10.15 and the MAD is 0.30. What is the modified z-score of 512.0? (nearest whole number)',
        answer: 1128, check: () => modz(BATTERY, 512), tol: 1, unit: '', places: 0,
        hints: ['M = 0.6745 × (x − median) ÷ MAD.', '0.6745 × (512.0 − 10.15) ÷ 0.30 = 0.6745 × 501.85 ÷ 0.30.'] },
      { id: 'b02-out-g3-s4', type: 'mc', prompt: 'What should the installer’s monitoring rule use?',
        options: [
          'A range check for physically possible readings, then the modified z-score or IQR fences to flag unusual days.',
          'The |z| > 3 rule, but only after collecting more than ten days of readings.',
          'The |z| > 2 rule, since 2.85 is above 2.',
          'No rule: delete the largest reading each week, so that any faulty reading is removed before anyone looks at the data.',
        ],
        answer: 0,
        hints: ['The faulty reading is both impossible and extreme. Which tools deal with each?'],
        feedback: {
          1: 'More data raises the z ceiling, but the fault still inflates the mean and SD (masking). Robust rules work at any sample size.',
          2: 'Lowering the cut-off flags many ordinary values in larger samples, and masking still applies.',
          3: 'That deletes a genuine reading every week when nothing is wrong, and keeps a second fault in the same week.',
        } },
    ],
  },
  {
    id: 'b02-out-g4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s export shows an order for 999 bags from a household customer whose previous orders were for one or two bags. The order total charged equals the price of nine bags. What should the analyst do?',
    options: [
      'Correct the quantity to 9, keep the original value in a separate column, and log the reason.',
      'Delete the order, because it is an outlier.',
      'Cap the quantity at the upper Tukey fence, so that the order stays in but can’t distort the averages.',
      'Keep 999, because the customer might genuinely have ordered it.',
    ],
    answer: 0,
    hints: ['Which evidence outside the quantity column tells you what really happened?'],
    feedback: {
      1: 'The order is real: a customer paid for nine bags. Deleting it loses a genuine sale.',
      2: 'Capping replaces one wrong number with another (10.125 bags). The evidence says the true value is 9.',
      3: 'The payment record shows nine bags were bought; 999 would also be wildly out of line with the customer’s history.',
    },
    solution: 'The payment record is independent evidence that nine bags were ordered, so this is a typing error with a known correction. Correct it to 9, keep 999 in a raw column or change log, and record why.',
  },
];

export const independent = [
  {
    id: 'b02-out-i1', type: 'num', kind: 'numerical',
    prompt: 'Nine Harborview bookings were for 1, 1, 2, 2, 2, 3, 3, 4 and 14 nights. Using quartiles by linear interpolation, what is the upper Tukey fence?',
    answer: 4.5, check: () => upper(NIGHTS), tol: 0.01, unit: 'nights', places: 2,
    wrong: [
      { value: 4, say: 'You added 1 × IQR. The fence is Q3 + 1.5 × IQR.' },
      { value: 6, say: 'You added 3 × IQR, the outer fence.' },
    ],
    solution: 'Positions are 1 + 8p. Q1 at position 3 is 2; Q3 at position 7 is 3. IQR = 1, so the upper fence is 3 + 1.5 × 1 = 4.5 nights. The 14-night stay is flagged: worth checking whether it is a long-stay guest or two bookings merged.',
  },
  {
    id: 'b02-out-i2', type: 'rows', kind: 'applied',
    prompt: 'Ten Harborview bookings (fictional). Select every booking whose nightly rate lies outside the Tukey fences (quartiles by linear interpolation).',
    data: { table: { head: ['Booking', 'Room type', 'Nightly rate ($)'], rows: [
      ['HB-7701', 'Standard', '149'], ['HB-7702', 'Standard', '0'], ['HB-7703', 'Deluxe', '189'], ['HB-7704', 'Standard', '135'], ['HB-7705', 'Suite', '420'],
      ['HB-7706', 'Standard', '142'], ['HB-7707', 'Deluxe', '170'], ['HB-7708', 'Standard', '129'], ['HB-7709', 'Standard', '155'], ['HB-7710', 'Deluxe', '162'],
    ] } },
    answer: [1, 4],
    solution: 'Sorted rates: 0, 129, 135, 142, 149, 155, 162, 170, 189, 420. Q1 (position 3.25) = 135 + 0.25 × 7 = 136.75; Q3 (position 7.75) = 162 + 0.75 × 8 = 168; IQR = 31.25; fences 136.75 − 46.875 = 89.875 and 168 + 46.875 = 214.875. Flagged: HB-7702 ($0) and HB-7705 ($420). They need different treatment: $0 is a placeholder a range check should have caught (set it to missing), while $420 is a suite, a genuine extreme that belongs in the revenue figures.',
  },
  {
    id: 'b02-out-i3', type: 'num', kind: 'numerical',
    prompt: 'Over 400 bookings, Harborview’s standard rooms have a mean nightly rate of $152 and a sample standard deviation of $18. What is the z-score of a booking at $221? (2 decimal places)',
    answer: 3.83, check: () => (221 - 152) / 18, tol: 0.01, unit: '', places: 2,
    wrong: [{ value: 69, say: 'That is the distance in dollars. Divide it by the standard deviation to express it in standard deviations.' }],
    solution: 'z = (221 − 152) ÷ 18 = 69 ÷ 18 = 3.83. With 400 bookings and roughly symmetric rates, |z| > 3 is a reasonable flag, so this booking is worth checking (an upgrade billed at the suite rate, perhaps).',
  },
  {
    id: 'b02-out-i4', type: 'mc', kind: 'conceptual',
    prompt: 'In Lantern’s twelve orders, the 120-bag order had a z-score of 0.08 until the 999-bag typo was corrected, when it rose to 3.17. Why?',
    options: [
      'The 999 inflated the mean and standard deviation that every z-score is measured against, hiding the 120 (masking).',
      'Correcting the typo changed the 120-bag order itself.',
      'z-scores are only valid after the data have been sorted.',
      'The 120-bag order is an error, and errors only show up after other errors are fixed.',
    ],
    answer: 0,
    feedback: {
      1: 'The 120 didn’t change; the yardstick did. The mean fell from 95.67 to 13.17 and the SD from 286.47 to 33.72.',
      2: 'Sorting doesn’t affect z-scores; each depends only on the value, the mean and the SD.',
      3: 'The 120-bag order is genuine. Its z-score changed because the 999 had distorted the mean and SD.',
    },
    solution: 'A z-score is measured against the mean and standard deviation of all the values, outliers included. The 999 raised the mean to 95.67 and the SD to 286.47, so 120 looked ordinary. This is masking, and it is why robust rules based on the median and MAD are preferred.',
  },
  {
    id: 'b02-out-i5', type: 'num', kind: 'numerical',
    prompt: 'A clothing brand’s weekly online sales of one jacket over eight weeks were 40, 42, 45, 47, 50, 52, 55 and 140 units (the 140 was a week with a celebrity mention). The upper Tukey fence is 65.5. If the analyst winsorises at the fence, what is the new mean weekly sales figure? (2 decimal places)',
    answer: 49.56, check: () => (40 + 42 + 45 + 47 + 50 + 52 + 55 + 65.5) / 8, tol: 0.01, unit: 'units', places: 2,
    wrong: [
      { value: 58.88, say: 'That is the mean before capping. Winsorising replaces 140 with the fence value, 65.5.' },
      { value: 47.29, say: 'That is the mean with the 140 week removed. Winsorising keeps the week but caps its value.' },
    ],
    solution: 'Replace 140 with 65.5: (40 + 42 + 45 + 47 + 50 + 52 + 55 + 65.5) ÷ 8 = 396.5 ÷ 8 = 49.56 units. The original mean was 471 ÷ 8 = 58.88. For a forecast of ordinary weeks the capped figure may be more useful, but the 140 units really were sold, so revenue reports must use the original.',
  },
  {
    id: 'b02-out-i6', type: 'mc', kind: 'applied',
    prompt: 'A confirmed and paid Harborview booking is a 14-night stay in a Deluxe room with a total of $3,528, about seven times the median booking total and far above the upper Tukey fence. The finance team is preparing the revenue report for the month. How should the booking be treated?',
    options: [
      'Keep it in revenue and the average booking value, and report the median booking value alongside so the typical booking is also visible.',
      'Remove it, because it is above the upper Tukey fence.',
      'Cap it at the upper fence so the average booking value isn’t distorted.',
      'Replace it with the median booking total.',
    ],
    answer: 0,
    feedback: {
      1: 'It is a genuine booking that brought in real money. Removing it would understate revenue by the whole stay.',
      2: 'Capping changes real revenue. That can make sense inside a model, not in a report of what happened.',
      3: 'Replacing a known, correct value with a typical one falsifies the record.',
    },
    solution: 'A genuine extreme belongs in a report of what happened. Keep it, so revenue and the average booking value are correct, and add a robust summary (the median) so readers also see what a typical booking is worth.',
  },
];

export const check = [
  {
    id: 'b02-out-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Northfield’s records show a student with an attendance of 112%. What is the right first step?',
    options: [
      'Treat it as a validation failure: correct it from the source records, or set it to missing if it can’t be corrected.',
      'Winsorise it at the upper Tukey fence, so that it stays in the data without distorting the averages.',
      'Keep it, and summarise attendance with the median instead of the mean, which one extreme value barely moves.',
      'Compute its modified z-score first, to find out whether it lies far enough from the other students to count as an outlier.',
    ],
    answer: 0,
    feedback: {
      1: 'Capping an impossible value at a statistical fence produces another made-up number. It needs correcting from the source, not taming.',
      2: 'Robust statistics are for genuine extremes. An attendance above 100% is not a real value at all.',
      3: 'No statistic is needed: attendance can’t exceed 100%, so a range check settles it, and impossible values should be removed before outlier rules are computed.',
    },
    solution: 'An attendance above 100% is impossible, so it is a validation problem, caught with a range check (0–100%). Correct it from the register if possible (perhaps 12% or 100% was meant), otherwise set it to missing; only then look for statistical outliers.',
  },
  {
    id: 'b02-out-k2', type: 'num', kind: 'numerical',
    prompt: 'Nine Lantern online orders had totals of $18, $22, $24, $25, $27, $29, $31, $35 and $95. Using quartiles by linear interpolation, what is the upper Tukey fence?',
    answer: 41.5, check: () => upper(TOTALS), tol: 0.01, unit: '$', places: 2,
    wrong: [
      { value: 38, say: 'You added 1 × IQR to Q3. The fence is Q3 + 1.5 × IQR.' },
      { value: 52, say: 'You added 3 × IQR, the outer fence.' },
      { value: 10.5, say: 'That is 1.5 × IQR, the distance from Q3 to the fence. Add it to Q3.' },
    ],
    solution: 'Positions are 1 + 8p. Q1 at position 3 is $24; Q3 at position 7 is $31. IQR = $7, so the upper fence is 31 + 1.5 × 7 = $41.50. The $95 order is flagged for review.',
  },
  {
    id: 'b02-out-k3', type: 'num', kind: 'numerical',
    prompt: 'Nine Harborview stays lasted 1, 2, 2, 2, 3, 3, 4, 5 and 12 nights. What is the modified z-score of the 12-night stay? (2 decimal places)',
    answer: 6.07, check: () => modz(STAYS, 12), tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 9, say: 'That is the distance from the median divided by the MAD, without the constant 0.6745.' },
      { value: 13.34, say: 'You divided by 0.6745 instead of multiplying.' },
    ],
    solution: 'Median = 3 (the 5th of nine values). Absolute distances from 3, sorted: 0, 0, 1, 1, 1, 1, 2, 2, 9, so MAD = 1. M = 0.6745 × (12 − 3) ÷ 1 = 6.07, above 3.5, so the stay is flagged.',
  },
  {
    id: 'b02-out-k4', type: 'rows', kind: 'applied',
    prompt: 'Eight Northfield students recorded their weekly study hours (fictional). Select every student flagged by the modified z-score rule, |M| > 3.5.',
    data: { table: { head: ['Student', 'Programme', 'Study hours per week'], rows: [
      ['N-301', 'Economics', '11'], ['N-302', 'Nursing', '40'], ['N-303', 'Psychology', '9'], ['N-304', 'Economics', '13'],
      ['N-305', 'Computer Science', '2'], ['N-306', 'Nursing', '12'], ['N-307', 'Psychology', '14'], ['N-308', 'Computer Science', '10'],
    ] } },
    answer: [1],
    solution: 'Sorted: 2, 9, 10, 11, 12, 13, 14, 40; median = (11 + 12) ÷ 2 = 11.5. Absolute distances, sorted: 0.5, 0.5, 1.5, 1.5, 2.5, 2.5, 9.5, 28.5, so MAD = (1.5 + 2.5) ÷ 2 = 2. M(40) = 0.6745 × 28.5 ÷ 2 = 9.61 (flagged); M(2) = 0.6745 × (−9.5) ÷ 2 = −3.20 (not flagged, since |−3.20| < 3.5). Only N-302 is flagged. The Tukey fences (4.5 and 18.5) would also flag the 2 hours, a reminder that different rules draw the line in different places.',
  },
  {
    id: 'b02-out-k5', type: 'mc', kind: 'applied',
    prompt: 'Lantern is forecasting next month’s demand for home-delivery boxes, which hold up to six bags. Its order data include several genuine office orders of 60 to 150 bags. What should the forecast do with them?',
    options: [
      'Flag them as business orders and forecast household and business demand separately.',
      'Delete them, since they are outliers.',
      'Winsorise them at the upper fence and forecast from all orders together.',
      'Keep them all in a single forecast of total demand, since every one of them is a real order.',
    ],
    answer: 0,
    feedback: {
      1: 'They are real orders; deleting them would also lose the business demand Lantern must still supply.',
      2: 'Capping turns a 150-bag order into a fictitious 10-bag one: wrong for business demand and still distorting household box needs.',
      3: 'A single forecast mixes two different kinds of customer; the office orders would inflate the predicted number of household boxes.',
    },
    solution: 'The office orders are genuine but come from a different kind of customer with different packaging. Flagging them (is_bulk) and forecasting the two segments separately keeps every real order while answering the box-sizing question with household data.',
  },
  {
    id: 'b02-out-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are robust statistics, barely moved by a few extreme values? Select all that apply.',
    options: ['Median', 'Interquartile range', 'Median absolute deviation', 'Mean', 'Sample standard deviation', 'Range (maximum − minimum)'],
    answer: [0, 1, 2],
    feedback: {
      3: 'One extreme value can move the mean as far as you like: Lantern’s mean order went from 13.17 to 95.67 bags because of one typo.',
      4: 'The standard deviation squares distances, so extreme values dominate it.',
      5: 'The range is set by the two most extreme values, so it is the least robust summary of all.',
    },
    solution: 'The median, the IQR and the MAD depend on the middle of the sorted data, so a few extreme values barely move them. The mean, the standard deviation and the range all respond directly to extremes.',
  },
];
