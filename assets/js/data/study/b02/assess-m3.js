// assess-m3.js — B02 module 3 test: Missing and unusual values (missing-values, outliers, skewed-data).
// No hints; solutions are shown when the student reviews the test. All businesses, people and figures are fictional.

const sorted = (a) => [...a].sort((x, y) => x - y);
const q = (a, p) => { const s = sorted(a); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.ceil(h)] - s[lo]); };
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const num = (x) => String(+x.toFixed(3));                        // 26.25, 32.5: no trailing zeros
const listed = (a, f = String) => `${a.slice(0, -1).map(f).join(', ')} and ${f(a.at(-1))}`;

// b02-m3-5: minutes to clean each of ten hotel rooms one morning (fictional); a very short time is the suspect.
const CLEANS = [24, 31, 2, 27, 35, 26, 30, 38, 28, 33];
const C_S = sorted(CLEANS), C_Q1 = q(CLEANS, 0.25), C_Q3 = q(CLEANS, 0.75), C_IQR = C_Q3 - C_Q1;
const C_HALF_Q1 = q(C_S.slice(0, 5), 0.5), C_HALF_Q3 = q(C_S.slice(5), 0.5);   // medians of the halves, another convention

// b02-m3-10: first-year savings of five home batteries (fictional); one large value stretches the arithmetic mean.
const SAVINGS = [200, 250, 320, 400, 1600];
const S_AM = mean(SAVINGS), S_LOGMEAN = mean(SAVINGS.map(Math.log)), S_GM = Math.exp(S_LOGMEAN), S_MEDIAN = q(SAVINGS, 0.5);
const dollars = (v) => `$${v.toLocaleString('en-US')}`;

export const items = [
  {
    id: 'b02-m3-1', lesson: 'missing-values', type: 'classify', kind: 'conceptual',
    prompt: 'Classify the missingness mechanism in each scenario.',
    items: [
      'Lantern’s delivery-time field is blank for every order handled by a courier whose system doesn’t report times; the courier is recorded in the export, and within each courier, missing times are unrelated to how long deliveries took.',
      'Guests who had a bad stay at Harborview are the least likely to answer the satisfaction survey, and nothing else recorded predicts a bad stay.',
      'A spreadsheet crash wiped a random block of Northfield attendance records.',
    ],
    categories: ['MCAR', 'MAR', 'MNAR'],
    answer: [1, 2, 0],
    feedback: {
      0: 'Missingness depends on the courier, a recorded variable, and not on the delivery time within courier: MAR.',
      1: 'Whether the score is missing depends on the unseen score itself: MNAR.',
      2: 'The lost records are a random block, unrelated to any data: MCAR.',
    },
    solution: 'Courier: MAR (depends on a recorded variable). Unhappy guests not answering: MNAR (depends on the missing value). Random crash: MCAR.',
  },
  {
    id: 'b02-m3-2', lesson: 'missing-values', type: 'num', kind: 'numerical',
    prompt: 'A clothing brand has 20 observed customer ages with a sample standard deviation of 5 years. It fills 12 missing ages with the observed mean. What is the standard deviation of all 32 ages afterwards? (2 decimal places)',
    answer: 3.91, check: () => 5 * Math.sqrt((20 - 1) / (20 + 12 - 1)), tol: 0.01, unit: 'years', places: 2,
    wrong: [
      { value: 5, say: 'Mean imputation leaves the mean unchanged, not the standard deviation.' },
      { value: 3.95, say: 'You used √(20 ÷ 32). The sample SD divides by n − 1: the factor is √(19 ÷ 31).' },
    ],
    solution: 'SD after = 5 × √((20 − 1) ÷ (20 + 12 − 1)) = 5 × √(19 ÷ 31) = 5 × 0.783 = 3.91 years. The filled ages add nothing to the sum of squared deviations but raise the divisor from 19 to 31.',
  },
  {
    id: 'b02-m3-3', lesson: 'missing-values', type: 'num', kind: 'applied',
    prompt: 'Harborview had 60 corporate stays (15 answered the survey, average score 7.0) and 140 leisure stays (70 answered, average 8.6). Assuming the scores are MAR given segment, estimate the average satisfaction across all 200 stays. (2 decimal places)',
    answer: 8.12, check: () => (60 * 7.0 + 140 * 8.6) / 200, tol: 0.006, unit: '', places: 2,
    wrong: [
      { value: 8.32, say: 'That averages the 85 answers, over-weighting leisure guests, who answer more often. Weight each segment by its stays.' },
      { value: 7.8, say: 'That is the simple average of the two segment averages. The segments differ in size: weight by stays.' },
    ],
    solution: 'Weight each segment’s average by its stays: (60 × 7.0 + 140 × 8.6) ÷ 200 = (420 + 1,204) ÷ 200 = 8.12. Ignoring non-response gives (15 × 7.0 + 70 × 8.6) ÷ 85 = 8.32.',
  },
  {
    id: 'b02-m3-4', lesson: 'missing-values', type: 'mc', kind: 'conceptual',
    prompt: 'Why should the median used to fill missing values be computed from the training rows only, when a model will be tested on held-out rows?',
    options: [
      'Otherwise the test rows shape the training data, and the test score overstates how the model will do on new data.',
      'Because the training median is always closer to the true population median than a median taken over all the rows.',
      'Because medians computed on test rows are biased under MCAR.',
      'Because the test rows should be left with their gaps unfilled, so that the model is tested on the data exactly as it arrived.',
    ],
    answer: 0,
    feedback: {
      1: 'If anything, a median over all the rows rests on more data; the point is to keep the test data unseen, not to get a better estimate.',
      2: 'Under MCAR any random subset gives an unbiased median; the problem is leakage, not bias.',
      3: 'The test rows must be filled too, using the training value, exactly as new data will be.',
    },
    solution: 'Fill values are learned from data. If the test rows help determine them, the test set no longer represents unseen data and the evaluation is optimistic (leakage). Learn the value on training rows; apply it to both.',
  },
  {
    id: 'b02-m3-5', lesson: 'outliers', type: 'num', kind: 'numerical',
    prompt: `Harborview’s housekeeping app (fictional) logs how many minutes each room took to clean. One morning’s ten rooms took ${listed(CLEANS)} minutes. A very short time can mean that a room was marked clean without being cleaned. Using quartiles by linear interpolation, what is the lower Tukey fence, below which a time is flagged? (2 decimal places)`,
    answer: 16.88, check: () => q(CLEANS, 0.25) - 1.5 * (q(CLEANS, 0.75) - q(CLEANS, 0.25)), tol: 0.01, unit: 'minutes', places: 2,
    wrong: [
      { value: C_Q1 - C_IQR, say: 'You subtracted 1 × IQR from Q1. The fence is Q1 − 1.5 × IQR.' },
      { value: C_Q1 - 3 * C_IQR, say: 'You subtracted 3 × IQR, which gives the outer fence. The usual flag uses 1.5 × IQR.' },
      { value: C_Q3 + 1.5 * C_IQR, say: `That is the upper fence, Q3 + 1.5 × IQR. A short cleaning time is a low value, so it is judged against the lower fence, Q1 − 1.5 × IQR.` },
      { value: C_HALF_Q1 - 1.5 * (C_HALF_Q3 - C_HALF_Q1), say: `You used the medians of the lower and upper halves (Q1 = ${num(C_HALF_Q1)}, Q3 = ${num(C_HALF_Q3)}), another common method. With linear interpolation Q1 is at position ${num(1 + (CLEANS.length - 1) * 0.25)}: ${num(C_Q1)}.` },
    ],
    solution: `Sorted: ${listed(C_S)}, so positions are 1 + ${CLEANS.length - 1}p. Q1 at position ${num(1 + (CLEANS.length - 1) * 0.25)} is ${C_S[2]} + 0.25 × (${C_S[3]} − ${C_S[2]}) = ${num(C_Q1)}, and Q3 at position ${num(1 + (CLEANS.length - 1) * 0.75)} is ${C_S[6]} + 0.75 × (${C_S[7]} − ${C_S[6]}) = ${num(C_Q3)}. IQR = ${num(C_IQR)}; lower fence = ${num(C_Q1)} − 1.5 × ${num(C_IQR)} = ${num(C_Q1 - 1.5 * C_IQR)} ≈ ${(C_Q1 - 1.5 * C_IQR).toFixed(2)} minutes. Only the ${C_S[0]}-minute room falls below it (the upper fence, ${num(C_Q3 + 1.5 * C_IQR)}, flags nothing). A flag starts a check of that room, not a correction: low values can be errors as well as high ones.`,
  },
  {
    id: 'b02-m3-6', lesson: 'outliers', type: 'num', kind: 'numerical',
    prompt: 'Over 2,000 orders, an online retailer’s delivery times have a mean of 3.2 days and a sample standard deviation of 0.8 days. What is the z-score of a 6.1-day delivery? (2 decimal places)',
    answer: 3.63, check: () => (6.1 - 3.2) / 0.8, tol: 0.01, unit: '', places: 2,
    wrong: [{ value: 2.9, say: 'That is the distance in days. Divide by the standard deviation.' }],
    solution: 'z = (6.1 − 3.2) ÷ 0.8 = 2.9 ÷ 0.8 = 3.63, beyond the common |z| > 3 flag. With 2,000 orders the ceiling on z is no constraint, though a few extreme deliveries could still inflate the SD.',
  },
  {
    id: 'b02-m3-7', lesson: 'outliers', type: 'rows', kind: 'applied',
    prompt: 'Nine orders from a clothing brand’s online shop (fictional). Select every order flagged by the modified z-score rule, |M| > 3.5.',
    data: { table: { head: ['Order', 'Delivery time (days)'], rows: [
      ['C-101', '4'], ['C-102', '11'], ['C-103', '3'], ['C-104', '2'], ['C-105', '20'],
      ['C-106', '5'], ['C-107', '4'], ['C-108', '6'], ['C-109', '3'],
    ] } },
    answer: [1, 4],
    solution: 'Sorted: 2, 3, 3, 4, 4, 5, 6, 11, 20; median = 4. Absolute distances, sorted: 0, 0, 1, 1, 1, 2, 2, 7, 16, so MAD = 1. M(11) = 0.6745 × 7 = 4.72 and M(20) = 0.6745 × 16 = 10.79 are flagged; the next largest, 6 days, scores 1.35. Flagged: C-102 and C-105, to be investigated (a courier delay, or a wrong dispatch date?).',
  },
  {
    id: 'b02-m3-8', lesson: 'outliers', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst runs a |z| > 3 rule on a column with two very large errors and flags neither of them. What is the most likely explanation?',
    options: [
      'Masking: the two errors inflate the mean and the SD, so neither looks extreme against them.',
      'The z-score rule only detects values below the mean, so it can never flag errors that are too large.',
      'Large errors always have z-scores close to zero, however far they lie from the rest of the values.',
      'The column must be left-skewed.',
    ],
    answer: 0,
    feedback: {
      1: 'z-scores are signed; |z| > 3 catches both sides.',
      2: 'Not always; they do when they distort the mean and SD enough, which is masking.',
      3: 'Two large errors would make it right-skewed, if anything.',
    },
    solution: 'Outliers are part of the mean and SD they are judged against. Two large errors raise both, shrinking each other’s z-scores (masking). The median and MAD, used by the modified z-score, are barely affected.',
  },
  {
    id: 'b02-m3-9', lesson: 'outliers', type: 'mc', kind: 'applied',
    prompt: 'Harborview’s export contains several standard-room bookings with a nightly rate of $9,999, which the booking system uses as a placeholder. What should the analyst do with them?',
    options: [
      'Catch them with a range check and correct them from other evidence (total ÷ nights, or the invoices), or set them to missing if no evidence exists, before running any outlier rule.',
      'Winsorise them at the upper Tukey fence.',
      'Keep them and report the median rate instead of the mean.',
      'Delete the whole bookings, since they are outliers.',
    ],
    answer: 0,
    feedback: {
      1: 'Capping a placeholder produces another invented rate.',
      2: 'Robust summaries suit genuine extremes; a placeholder isn’t a rate at all, and it would still corrupt totals.',
      3: 'The stays happened; only the rate is unknown. Losing the whole row loses real nights, guests and dates.',
    },
    solution: '$9,999 is an impossible value for a standard room: a validation failure, not an outlier. A range check finds it; the rate is recovered from other evidence where it exists (in Harborview’s export, total ÷ nights) or otherwise becomes missing, and outlier rules run afterwards on genuine rates.',
  },
  {
    id: 'b02-m3-10', lesson: 'skewed-data', type: 'num', kind: 'numerical',
    prompt: `A fictional battery-storage installer reports first-year electricity savings of ${listed(SAVINGS, dollars)} for five home systems. By how many dollars does the geometric mean saving fall short of the arithmetic mean saving? (2 decimal places)`,
    answer: 154, check: () => SAVINGS.reduce((s, v) => s + v, 0) / SAVINGS.length - SAVINGS.reduce((p, v) => p * v, 1) ** (1 / SAVINGS.length), tol: 0.01, unit: '$', places: 2,
    wrong: [
      { value: S_GM, say: 'That is the geometric mean itself. The question asks how far it falls below the arithmetic mean.' },
      { value: S_AM, say: 'That is the arithmetic mean. Subtract the geometric mean from it.' },
      { value: S_AM - S_MEDIAN, say: `That is the gap between the arithmetic mean and the median (${dollars(S_MEDIAN)}). The geometric mean is the nth root of the product of the values.` },
    ],
    solution: `Geometric mean = (${SAVINGS.map((v) => v.toLocaleString('en-US')).join(' × ')})^(1/${SAVINGS.length}) = ${dollars(+num(S_GM))}, the same as e raised to the mean of the logs (${S_LOGMEAN.toFixed(3)}). Arithmetic mean = ${SAVINGS.reduce((s, v) => s + v, 0).toLocaleString('en-US')} ÷ ${SAVINGS.length} = ${dollars(+num(S_AM))}. The gap is ${num(S_AM)} − ${num(S_GM)} = ${dollars(+num(S_AM - S_GM))}. The one large saving pulls the arithmetic mean up far more than the geometric mean, which is why a total across many systems needs the arithmetic mean.`,
  },
  {
    id: 'b02-m3-11', lesson: 'skewed-data', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst averages ln(order total) over all orders and converts the result back with eˣ. What has she computed?',
    options: [
      'The geometric mean, which is at or below the arithmetic mean.',
      'The arithmetic mean of the order totals, because eˣ undoes the log.',
      'The median order total, exactly, whatever the shape of the distribution.',
      'The skewness of the order totals.',
    ],
    answer: 0,
    feedback: {
      1: 'Averaging logs and back-transforming gives the geometric mean, which is lower unless all orders are equal.',
      2: 'It equals the median only when the logs are symmetric; in general it is the geometric mean.',
      3: 'Skewness is a measure of asymmetry, computed from cubed deviations.',
    },
    solution: 'exp(mean of ln x) = (x₁x₂…xₙ)^(1/n), the geometric mean. For right-skewed order totals it describes a typical order and is below the arithmetic mean, so it must not be used to forecast totals.',
  },
  {
    id: 'b02-m3-12', lesson: 'skewed-data', type: 'mc', kind: 'applied',
    prompt: 'Northfield’s board asks how many hours a typical first-year studies each week. The hours are strongly right-skewed, and the survey allows answers of 0. What should the analyst report?',
    options: [
      'The median (with the quartiles), in hours.',
      'The back-transformed mean of log(hours).',
      'The mean of log(1 + hours).',
      'The arithmetic mean, because it uses every value.',
    ],
    answer: 0,
    feedback: {
      1: 'The log of 0 is undefined, so this fails as soon as any student reports 0 hours, and log-scale results still have to be explained to the board.',
      2: 'That number is on a log scale; “2.1 log-hours” means nothing to the board.',
      3: 'In a right-skewed variable, a few heavy studiers pull the mean above what a typical student does.',
    },
    solution: 'For a typical value of a skewed variable, report the median, in real units, with the quartiles to show the spread. Transformations belong inside models, not in reports.',
  },
];
