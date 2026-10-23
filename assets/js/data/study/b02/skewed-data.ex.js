// skewed-data.ex.js — B02 · Skewed data and transformations: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). All businesses, people and figures are fictional.

const moments = (a) => { const n = a.length, m = a.reduce((s, v) => s + v, 0) / n; let m2 = 0, m3 = 0; for (const v of a) { m2 += (v - m) ** 2; m3 += (v - m) ** 3; } return { n, m, m2: m2 / n, m3: m3 / n }; };
const skew = (a) => { const { n, m2, m3 } = moments(a); return Math.sqrt(n * (n - 1)) / (n - 2) * m3 / m2 ** 1.5; };
const gmean = (a) => Math.exp(a.reduce((s, v) => s + Math.log(v), 0) / a.length);
const WAITS = [2, 3, 3, 4, 13];

export const widgets = {
  'sk-hotel': {
    type: 'distribution',
    dataset: 'harborview-bookings',
    column: 'total',
    transforms: ['none', 'log', 'log1p', 'sqrt'],
    rules: ['iqr'],
  },
  'sk-hours': {
    type: 'distribution',
    dataset: 'northfield-students',
    column: 'study_hours',
    transforms: ['none', 'log1p', 'sqrt'],
    rules: ['iqr'],
  },
  'sk-logdiff': {
    type: 'formula',
    title: 'Log differences and percentage changes',
    intro: 'Set an old and a new price. Compare the actual percentage change with 100 × the log difference.',
    inputs: [
      { id: 'old', label: 'Old value', min: 1, max: 1000, step: 1, value: 40, fmt: 'money' },
      { id: 'nw', label: 'New value', min: 1, max: 1000, step: 1, value: 44, fmt: 'money' },
    ],
    compute: (v) => {
      const pct = (v.nw / v.old - 1) * 100;
      const d = Math.log(v.nw / v.old);
      const gap = pct - 100 * d;
      const back = (Math.exp(d) - 1) * 100;
      const xs = [-50, -25, -10, 0, 10, 25, 50, 100];
      const note = Math.abs(pct) < 10
        ? `For a change of ${pct.toFixed(1)}%, 100 × the log difference (${(100 * d).toFixed(2)}) is a close stand-in. Going back from ${v.nw} to ${v.old} gives exactly −${d.toFixed(4)} in logs, while the percentages (${pct.toFixed(1)}% and ${((v.old / v.nw - 1) * 100).toFixed(1)}%) don’t cancel.`
        : `For a change this large the approximation breaks down: 100 × the log difference is ${(100 * d).toFixed(1)}, but the actual change is ${pct.toFixed(1)}%. Convert with (eᵈ − 1) × 100.`;
      return {
        headline: { label: 'Log difference, ln(new ÷ old)', value: d.toFixed(4) },
        rows: [
          ['Actual percentage change', `${pct.toFixed(2)}%`],
          ['100 × log difference', (100 * d).toFixed(2)],
          ['Gap (percentage points)', gap.toFixed(2)],
          ['Converted back: (eᵈ − 1) × 100', `${back.toFixed(2)}%`],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Actual percentage change (%)', values: xs },
          series: [
            { name: 'Actual percentage change', values: xs },
            { name: '100 × log difference', values: xs.map((p) => +(100 * Math.log(1 + p / 100)).toFixed(2)) },
          ],
          y: { label: 'Value' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'b02-sk-g1', type: 'steps', kind: 'numerical',
    prompt: 'Five customers of an online retailer waited 2, 3, 3, 4 and 13 minutes for a live-chat reply. Calculate the adjusted Fisher–Pearson skewness step by step.',
    solution: 'Mean = 25 ÷ 5 = 5. Deviations: −3, −2, −2, −1, 8. m₂ = (9 + 4 + 4 + 1 + 64) ÷ 5 = 82 ÷ 5 = 16.4. m₃ = (−27 − 8 − 8 − 1 + 512) ÷ 5 = 468 ÷ 5 = 93.6. g₁ = 93.6 ÷ 16.4^1.5 = 93.6 ÷ 66.41 = 1.409. G₁ = √(5 × 4) ÷ 3 × 1.409 = 1.491 × 1.409 = 2.10. Strongly right-skewed: one long wait.',
    steps: [
      { id: 'b02-sk-g1-s1', type: 'num', prompt: 'What is m₂, the mean squared deviation (dividing by n)?',
        answer: 16.4, check: () => moments(WAITS).m2, tol: 0.01, unit: '', places: 2,
        hints: ['The mean is 25 ÷ 5 = 5, so the deviations are −3, −2, −2, −1 and 8.', 'Square them (9, 4, 4, 1, 64), add, and divide by 5.'],
        wrong: [{ value: 20.5, say: 'You divided by n − 1 = 4. The moments in the skewness formula divide by n = 5; the small-sample correction comes later.' }] },
      { id: 'b02-sk-g1-s2', type: 'num', prompt: 'What is m₃, the mean cubed deviation?',
        answer: 93.6, check: () => moments(WAITS).m3, tol: 0.01, unit: '', places: 2,
        hints: ['Cube each deviation, keeping the sign: −27, −8, −8, −1, 512.', 'Their sum is 468; divide by 5.'],
        wrong: [{ value: 117, say: 'You divided by 4. Use n = 5.' }, { value: 109.6, say: 'Cubes of negative numbers are negative: (−3)³ = −27, not 27.' }] },
      { id: 'b02-sk-g1-s3', type: 'num', prompt: 'What is the adjusted skewness G₁ = √(n(n − 1)) ÷ (n − 2) × m₃ ÷ m₂^1.5? (2 decimal places)',
        answer: 2.10, check: () => skew(WAITS), tol: 0.01, unit: '', places: 2,
        hints: ['g₁ = 93.6 ÷ 16.4^1.5 = 93.6 ÷ 66.41 = 1.409.', 'The factor is √(5 × 4) ÷ 3 = 4.472 ÷ 3 = 1.491.'],
        wrong: [{ value: 1.41, say: 'That is g₁ before the small-sample adjustment. Multiply by √(n(n − 1)) ÷ (n − 2).' }] },
      { id: 'b02-sk-g1-s4', type: 'mc', prompt: 'What does the result tell you?',
        options: ['The waits are right-skewed: most are short and one is much longer, so the mean (5) sits above the median (3).', 'The waits are left-skewed, because most values are small.', 'The waits are roughly symmetric, because the value is below 3.', 'The mean wait is 2.10 minutes above the median.'],
        answer: 0,
        hints: ['Positive skewness means a long tail on which side?'],
        feedback: { 1: 'The direction of skew is named after the long tail, not the bulk. The tail here is the 13-minute wait on the right.', 2: 'There is no universal cut-off, but 2.10 is far from 0; the histogram shows one value far to the right.', 3: 'Skewness has no units; it is not a distance between the mean and the median (here 5 − 3 = 2 minutes).' } },
    ],
  },
  {
    id: 'b02-sk-g2', type: 'num', kind: 'numerical',
    prompt: 'Three Lantern wholesale customers spent $25, $100 and $400 last month. What is their geometric mean spend?',
    answer: 100, check: () => gmean([25, 100, 400]), tol: 0.01, unit: '$', places: 2,
    hints: ['Geometric mean = (product of the values)^(1/n).', '25 × 100 × 400 = 1,000,000, and the cube root of 1,000,000 is 100.'],
    wrong: [{ value: 175, say: 'That is the arithmetic mean, (25 + 100 + 400) ÷ 3. The geometric mean multiplies the values and takes the nth root.' }],
    solution: 'GM = (25 × 100 × 400)^(1/3) = 1,000,000^(1/3) = $100. Equivalently, the mean of ln 25, ln 100 and ln 400 is ln 100 = 4.605, and e^4.605 = 100. The arithmetic mean is $175: the geometric mean is lower, as it always is unless all values are equal.',
  },
  {
    id: 'b02-sk-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Northfield’s weekly study hours are right-skewed and some students report 0 hours. Which transformation can be applied directly?',
    options: ['log(1 + x)', 'log x', 'The reciprocal 1/x', 'Box–Cox'],
    answer: 0,
    hints: ['Which of these is defined at x = 0?'],
    feedback: {
      1: 'ln 0 is undefined (it heads to minus infinity), so every zero-hour student would break the transformation.',
      2: '1/0 is undefined.',
      3: 'Box–Cox requires strictly positive values. Yeo–Johnson extends it to zeros and negatives.',
    },
    solution: 'log(1 + x) maps 0 to 0 and compresses large values like a log; the square root (not listed) would also work. Both need the units checked: in minutes rather than hours, the “1” would make zero an extreme value.',
  },
  {
    id: 'b02-sk-g4', type: 'num', kind: 'numerical',
    prompt: 'Lantern raises the price of a bag from $40 to $44. What is 100 × the log difference, 100 × ln(44 ÷ 40)? (2 decimal places)',
    answer: 9.53, check: () => 100 * Math.log(44 / 40), tol: 0.01, unit: '', places: 2,
    hints: ['44 ÷ 40 = 1.1.', 'ln 1.1 = 0.0953; multiply by 100.'],
    wrong: [{ value: 10, say: 'That is the actual percentage change. The log difference is close to it but not equal: 100 × ln 1.1 = 9.53.' }],
    solution: '100 × ln(1.1) = 100 × 0.0953 = 9.53, close to the true 10% rise. Converting back exactly: (e^0.0953 − 1) × 100 = 10%.',
  },
];

export const independent = [
  {
    id: 'b02-sk-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Which shape would you expect each variable to have?',
    items: [
      'Harborview booking totals',
      'Scores on an easy quiz where most students get nearly full marks',
      'Days until a new customer’s first repeat order',
      'Share of the month a subscriber stayed active, where most stay all month',
      'Weights of 250 g bags from a well-calibrated filling machine',
    ],
    categories: ['Right-skewed', 'Left-skewed', 'Roughly symmetric'],
    answer: [0, 1, 0, 1, 2],
    feedback: {
      0: 'Totals can’t go below zero but a few long stays in expensive rooms run very high: a long right tail.',
      1: 'Scores bunch near the maximum, with a tail of lower scores to the left.',
      2: 'Many customers reorder soon; a few take a very long time: a long right tail.',
      3: 'Values bunch at 100% with a tail of early leavers to the left.',
      4: 'A good machine’s errors are as likely to be slightly over as slightly under.',
    },
    solution: 'Right-skewed: booking totals and days to repeat order (bounded below, unbounded above). Left-skewed: easy-quiz scores and active share (bunched at a maximum). Roughly symmetric: bag weights from a calibrated machine.',
  },
  {
    id: 'b02-sk-i2', type: 'num', kind: 'numerical',
    prompt: 'A Northfield student reports 9 study hours a week. What is the log(1 + x) value, ln(1 + 9)? (3 decimal places)',
    answer: 2.303, check: () => Math.log1p(9), tol: 0.001, unit: '', places: 3,
    wrong: [{ value: 2.197, say: 'That is ln 9. Add 1 first: ln(10).' }, { value: 1, say: 'That is log base 10 of 10. This course uses the natural log, ln.' }],
    solution: 'ln(1 + 9) = ln 10 = 2.303.',
  },
  {
    id: 'b02-sk-i3', type: 'num', kind: 'numerical',
    prompt: 'An analyst takes the natural log of 500 Lantern order totals and finds that the logs average 3.5. What is the geometric mean order total? (2 decimal places)',
    answer: 33.12, check: () => Math.exp(3.5), tol: 0.01, unit: '$', places: 2,
    wrong: [{ value: 3.5, say: 'That is still on the log scale. Back-transform with eˣ.' }, { value: 3162.28, say: 'You used 10^3.5. These are natural logs, so use e^3.5.' }],
    solution: 'e^3.5 = $33.12. This is the geometric mean, a typical order; the arithmetic mean of the totals will be higher.',
  },
  {
    id: 'b02-sk-i4', type: 'num', kind: 'numerical',
    prompt: 'Apply the Box–Cox transformation with λ = 0.5 to the value x = 9.',
    answer: 4, check: () => (Math.pow(9, 0.5) - 1) / 0.5, tol: 0.001, unit: '', places: 2,
    wrong: [{ value: 3, say: 'That is √9. Box–Cox subtracts 1 and divides by λ: (√9 − 1) ÷ 0.5.' }, { value: 1, say: 'Divide by λ = 0.5, which doubles the value: (3 − 1) ÷ 0.5 = 4.' }],
    solution: '(9^0.5 − 1) ÷ 0.5 = (3 − 1) ÷ 0.5 = 4. With λ = 0.5 Box–Cox is a shifted and rescaled square root, so it has the square root’s effect on shape.',
  },
  {
    id: 'b02-sk-i5', type: 'mc', kind: 'applied',
    prompt: 'Harborview’s analyst is building a random forest (a collection of decision trees) to predict cancellations, using the right-skewed booking total as one input. Should she log-transform the total first?',
    options: [
      'It makes no real difference: trees split on thresholds, and a log keeps the order of the values, so the same splits are available.',
      'Yes, always: skewed inputs make every model biased.',
      'Yes, because trees can only use normally distributed inputs.',
      'No, because a log would reverse the order of the totals.',
    ],
    answer: 0,
    feedback: {
      1: 'Not every model is affected. Linear models can be; threshold-based trees are not.',
      2: 'Trees make no distributional assumption about inputs.',
      3: 'The log keeps the order; it is the reciprocal 1/x that reverses it.',
    },
    solution: 'A split such as “total above $400” is equivalent to “log total above ln 400”: the same bookings go each way. Monotonic transformations don’t change what a tree can learn, so the transformation adds work without benefit.',
  },
  {
    id: 'b02-sk-i6', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s profit per order is right-skewed and includes losses (negative values) on heavily discounted orders. The analyst wants a more symmetric version for a regression. Which approach works?',
    options: ['Yeo–Johnson, which is defined for negative, zero and positive values', 'log x', 'log(1 + x)', 'Box–Cox'],
    answer: 0,
    feedback: {
      1: 'The log is undefined for zero and negative profits.',
      2: 'log(1 + x) fails for any loss of $1 or more (x ≤ −1).',
      3: 'Box–Cox needs strictly positive values.',
    },
    solution: 'Yeo–Johnson extends the Box–Cox idea to all real values (scikit-learn’s PowerTransformer offers it). Estimate its parameter on the training rows only.',
  },
];

export const check = [
  {
    id: 'b02-sk-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A column of order values has skewness +2.4. Which description fits best?',
    options: [
      'Most orders are small and a few are very large; the mean is probably above the median.',
      'Most orders are large and a few are very small; the mean is probably below the median.',
      'The orders are symmetric around a mean of 2.4.',
      'About 2.4% of the orders are outliers.',
    ],
    answer: 0,
    feedback: {
      1: 'That describes negative (left) skew.',
      2: 'Skewness measures asymmetry and has no units; it says nothing about the mean’s value.',
      3: 'Skewness isn’t a percentage of anything.',
    },
    solution: 'Positive skewness means a long right tail: many small values and a few large ones, which usually pull the mean above the median.',
  },
  {
    id: 'b02-sk-k2', type: 'num', kind: 'numerical',
    prompt: 'An online retailer’s four marketing campaigns returned $2, $8, $32 and $128 of sales per dollar spent. What is the geometric mean return?',
    answer: 16, check: () => gmean([2, 8, 32, 128]), tol: 0.01, unit: '$', places: 2,
    wrong: [{ value: 42.5, say: 'That is the arithmetic mean. The geometric mean is the 4th root of 2 × 8 × 32 × 128.' }],
    solution: '2 × 8 × 32 × 128 = 65,536, and 65,536^(1/4) = 16. Each value is four times the previous one, so the logs are evenly spaced and the geometric mean sits exactly halfway between 8 and 32 on a log scale: √(8 × 32) = 16. The arithmetic mean, $42.50, is pulled up by the $128 campaign.',
  },
  {
    id: 'b02-sk-k3', type: 'num', kind: 'numerical',
    prompt: 'Harborview’s standard rate rises from $50 to $60. What is 100 × ln(60 ÷ 50)? (2 decimal places)',
    answer: 18.23, check: () => 100 * Math.log(60 / 50), tol: 0.01, unit: '', places: 2,
    wrong: [{ value: 20, say: 'That is the actual percentage change. For a 20% rise the log difference is noticeably smaller: 100 × ln 1.2.' }],
    solution: '100 × ln(1.2) = 100 × 0.1823 = 18.23, against an actual rise of 20%. For changes this large, convert log differences with (eᵈ − 1) × 100.',
  },
  {
    id: 'b02-sk-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the most suitable treatment for each variable.',
    items: [
      'Booking totals for a demand model: all positive, long right tail, effects naturally in percentages',
      'Weekly study hours for a grades model: right-skewed, some zeros, recorded in hours',
      'Profit per order for a regression: right-skewed, includes losses',
      'Weights of 250 g bags from a well-calibrated filling machine',
      'Order totals used only as an input to a decision tree',
    ],
    categories: ['Log', 'Log(1 + x) or square root', 'Yeo–Johnson', 'No transformation'],
    answer: [0, 1, 2, 3, 3],
    feedback: {
      0: 'Positive values with multiplicative behaviour: the log is the natural choice.',
      1: 'Zeros rule out the plain log.',
      2: 'Negative values rule out log, log(1 + x) for losses of $1 or more, and Box–Cox.',
      3: 'Already roughly symmetric: nothing to fix.',
      4: 'Trees are unaffected by order-preserving transformations.',
    },
    solution: 'Log for positive, multiplicative totals; log(1 + x) or square root for counts with zeros; Yeo–Johnson for data with negatives; nothing for symmetric data or tree-only inputs.',
  },
  {
    id: 'b02-sk-k5', type: 'mc', kind: 'applied',
    prompt: 'A finance manager needs next quarter’s revenue forecast from expected bookings and a sample of right-skewed booking totals. Which average should multiply the number of bookings?',
    options: [
      'The arithmetic mean of the totals',
      'The geometric mean (the back-transformed mean of log totals)',
      'The median total',
      'The mean of the log totals',
    ],
    answer: 0,
    feedback: {
      1: 'The geometric mean describes a typical booking and is below the arithmetic mean, so the forecast would be too low.',
      2: 'The median ignores how large the big bookings are; revenue needs them.',
      3: 'That is on the log scale; multiplying it by a count gives nothing meaningful in dollars.',
    },
    solution: 'Revenue is a sum, and a sum equals count × arithmetic mean. Skewness changes which number describes a typical booking, not how totals add up.',
  },
  {
    id: 'b02-sk-k6', type: 'num', kind: 'applied',
    prompt: 'A hotel expects 500 bookings next month. Its booking totals have an arithmetic mean of $480 and a geometric mean of $380. By how much would a revenue forecast based on the geometric mean understate the one based on the arithmetic mean?',
    answer: 50000, check: () => 500 * (480 - 380), tol: 0.5, unit: '$', places: 0,
    wrong: [{ value: 100, say: 'That is the gap per booking. Multiply by the 500 bookings.' }],
    solution: '500 × 480 = $240,000 against 500 × 380 = $190,000: the geometric-mean forecast is $50,000 too low.',
  },
];
