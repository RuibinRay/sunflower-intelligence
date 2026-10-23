// scaling.ex.js — B02 · Normalisation and standardisation: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const num2 = (n) => (Math.abs(n) < 0.005 ? '0.00' : `${n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`);

export const widgets = {
  'sc-explorer': {
    type: 'formula',
    title: 'One value, three scalers',
    intro: 'Set the training parameters and a value to scale. The three scaled values update together.',
    inputs: [
      { id: 'x', label: 'Value to scale (x)', min: 0, max: 200, step: 1, value: 36, fmt: 'num' },
      { id: 'min', label: 'Training minimum', min: 0, max: 100, step: 1, value: 12, fmt: 'num' },
      { id: 'max', label: 'Training maximum', min: 1, max: 200, step: 1, value: 60, fmt: 'num' },
      { id: 'mean', label: 'Training mean', min: 0, max: 150, step: 1, value: 30, fmt: 'num' },
      { id: 'sd', label: 'Training standard deviation', min: 0.5, max: 60, step: 0.5, value: 8, fmt: 'num' },
      { id: 'median', label: 'Training median', min: 0, max: 150, step: 1, value: 28, fmt: 'num' },
      { id: 'iqr', label: 'Training IQR', min: 0.5, max: 60, step: 0.5, value: 10, fmt: 'num' },
    ],
    compute: (v) => {
      if (v.max <= v.min) return { error: 'The training maximum must be larger than the training minimum.' };
      if (v.mean < v.min || v.mean > v.max || v.median < v.min || v.median > v.max) {
        return { error: 'The training mean and median must lie between the training minimum and maximum: no real dataset has its average outside its own range.' };
      }
      const mm = (v.x - v.min) / (v.max - v.min);
      const z = (v.x - v.mean) / v.sd;
      const r = (v.x - v.median) / v.iqr;
      const inside = v.x >= v.min && v.x <= v.max;
      const notes = [
        inside
          ? 'The value lies inside the training range, so its min–max value is between 0 and 1.'
          : 'The value lies outside the training range, so its min–max value falls outside 0–1. That is expected for new data: it tells you the value is beyond anything the scaler was fitted on.',
        Math.abs(z) > 3
          ? 'Its z-score is beyond ±3, which is unusual relative to the training mean and standard deviation.'
          : 'Its z-score is within ±3 of the training mean.',
        'All three results are unitless: each says where the value sits relative to the training data, measured with a different ruler.',
      ];
      if (v.iqr < v.sd / 2) notes.push('The IQR is much smaller than the standard deviation, which happens when a few extreme values inflate the standard deviation: robust scaling then spreads the typical values far more than standardisation does.');
      return {
        headline: { label: 'Standardised value (z)', value: num2(z) },
        rows: [
          ['Min–max: (x − min) ÷ (max − min)', `(${v.x} − ${v.min}) ÷ (${v.max} − ${v.min}) = ${num2(mm)}`],
          ['Standardised: (x − mean) ÷ SD', `(${v.x} − ${v.mean}) ÷ ${v.sd} = ${num2(z)}`],
          ['Robust: (x − median) ÷ IQR', `(${v.x} − ${v.median}) ÷ ${v.iqr} = ${num2(r)}`],
        ],
        note: notes.join(' '),
        chart: {
          kind: 'bar',
          x: { label: 'Scaler', values: ['Min–max', 'Standardised', 'Robust'] },
          series: [{ name: 'Scaled value', values: [mm, z, r].map((n) => Math.round(n * 100) / 100) }],
          y: { label: 'Scaled value (no units)' },
        },
      };
    },
  },
  'sc-lab': {
    type: 'cleaning',
    dataset: {
      columns: ['customer_id', 'split', 'spend', 'orders'],
      rows: [
        ['C2001', 'train', 118, 3],
        ['C2002', 'train', 64, 2],
        ['C2003', 'train', 142, 8],
        ['C2004', 'train', 46, 1],
        ['C2005', 'train', 95, 4],
        ['C2006', 'train', 126, 7],
        ['C2007', 'train', 80, 2],
        ['C2008', 'train', 170, 5],
        ['C2009', 'train', 72, 3],
        ['C2010', 'test', 110, 6],
        ['C2011', 'test', 420, 4],
        ['C2012', 'test', 88, 2],
      ],
    },
    ops: ['scale'],
    split: 'split',
    fit: ['train', 'all'],
    watch: ['spend', 'orders'],
    task: 'This fictional table gives each customer’s spend (dollars) and number of orders for 1 March – 30 June 2026; the <code>split</code> column marks training and test rows. Scale <code>spend</code> with min–max, standardisation and robust scaling. For each method, fit it first on the training rows only and then on all rows, and compare the parameters and the training customers’ scaled values. Which method lets the large test customer (C2011) change the training values most when it is wrongly included in the fit?',
  },
};

export const guided = [
  {
    id: 'b02-sc-g1', type: 'steps', kind: 'numerical',
    prompt: 'The Harborview Hotel’s training data for nightly room rates have minimum $100, maximum $420, mean $180, standard deviation $60, median $165 and IQR $75. Scale a booking at $255 a night with each method.',
    solution: 'Min–max: (255 − 100) ÷ (420 − 100) = 155 ÷ 320 ≈ 0.48. Standardised: (255 − 180) ÷ 60 = 1.25. Robust: (255 − 165) ÷ 75 = 1.2. Three unitless descriptions of the same rate: just under halfway along the training range, 1.25 standard deviations above the mean, 1.2 IQRs above the median.',
    steps: [
      { id: 'b02-sc-g1-s1', type: 'num', prompt: 'What is the min–max normalised value? (Two decimal places.)',
        answer: 0.48, check: () => (255 - 100) / (420 - 100), tol: 0.005, unit: '', places: 2,
        hints: ['Subtract the training minimum, then divide by the training range.', 'The range is 420 − 100 = 320.'],
        wrong: [
          { value: 0.61, say: 'That is 255 ÷ 420. Min–max subtracts the minimum first and divides by the whole range, maximum minus minimum.' },
          { value: 0.37, say: 'You subtracted the minimum from the value but divided by the maximum. Divide by the range, 420 − 100 = 320.' },
        ] },
      { id: 'b02-sc-g1-s2', type: 'num', prompt: 'What is the standardised value (z)?',
        answer: 1.25, check: () => (255 - 180) / 60, tol: 0.005, unit: '', places: 2,
        hints: ['z = (x − mean) ÷ standard deviation.'],
        wrong: [
          { value: 1.5, say: 'You subtracted the median. Standardisation is centred on the mean, $180.' },
          { value: 4.25, say: 'That is 255 ÷ 60: subtract the mean before dividing by the standard deviation.' },
        ] },
      { id: 'b02-sc-g1-s3', type: 'num', prompt: 'What is the robust-scaled value?',
        answer: 1.2, check: () => (255 - 165) / 75, tol: 0.005, unit: '', places: 2,
        hints: ['Robust scaling uses the median and the IQR.', '(255 − 165) ÷ 75.'],
        wrong: [
          { value: 1, say: 'You subtracted the mean. Robust scaling is centred on the median, $165.' },
          { value: 1.5, say: 'You divided by the standard deviation. Robust scaling divides by the IQR, $75.' },
        ] },
      { id: 'b02-sc-g1-s4', type: 'mc', prompt: 'The three results are 0.48, 1.25 and 1.2. Which statement is right?',
        options: [
          'They describe the same rate with three different rulers, and none of them has units.',
          'The z-score is the accurate one; the other two contain rounding errors.',
          'They are in dollars per scaled unit, so the revenue manager can compare them with prices.',
          'They should be equal if the data were clean.',
        ],
        answer: 0,
        hints: ['Each formula divides dollars by dollars.'],
        feedback: {
          1: 'All three are exact for their own formula. They differ because they use different centres (minimum, mean, median) and spreads (range, SD, IQR).',
          2: 'Dollars divided by dollars leaves a pure number. Report rates to people in dollars and keep scaled values for models.',
          3: 'Different centres and spreads give different numbers even for perfectly clean data.',
        } },
    ],
  },
  {
    id: 'b02-sc-g2', type: 'steps', kind: 'numerical',
    prompt: 'Skylark Air, a fictional airline, timed nine passengers’ waits at a check-in desk: 2, 4, 4, 5, 5, 6, 7, 8 and 31 minutes. The 31-minute wait was real (a system outage). Use linear interpolation for quartiles.',
    solution: 'Median = 5th value = 5. Quartile positions: (9 − 1) × 0.25 = 2 and (9 − 1) × 0.75 = 6 places after the first value, so Q1 = 3rd value = 4 and Q3 = 7th value = 7; IQR = 3. Robust value of 31 = (31 − 5) ÷ 3 ≈ 8.67. With mean 8 and SD ≈ 8.80, the same wait has z ≈ 2.61: the outlier inflates the standard deviation that measures it.',
    steps: [
      { id: 'b02-sc-g2-s1', type: 'num', prompt: 'What is the median wait, in minutes?',
        answer: 5, check: () => [2, 4, 4, 5, 5, 6, 7, 8, 31][4], tol: 0.005, unit: 'minutes', places: 0,
        hints: ['With 9 ordered values, the median is the middle one.', 'It is the 5th value.'],
        wrong: [{ value: 8, say: 'That is the mean (72 ÷ 9). The median is the middle ordered value, which the 31-minute wait can’t pull upwards.' }] },
      { id: 'b02-sc-g2-s2', type: 'num', prompt: 'What is the IQR, in minutes?',
        answer: 3, check: () => 7 - 4, tol: 0.005, unit: 'minutes', places: 0,
        hints: ['With linear interpolation, Q1 sits (n − 1) × 0.25 places after the first value and Q3 sits (n − 1) × 0.75 places after it.', '(9 − 1) × 0.25 = 2, so Q1 is the 3rd value; (9 − 1) × 0.75 = 6, so Q3 is the 7th value.'],
        wrong: [{ value: 29, say: 'That is the range (31 − 2). The IQR is Q3 − Q1, the spread of the middle half.' }] },
      { id: 'b02-sc-g2-s3', type: 'num', prompt: 'What is the robust-scaled value of the 31-minute wait? (Two decimal places.)',
        answer: 8.67, check: () => (31 - 5) / 3, tol: 0.01, unit: '', places: 2,
        hints: ['(x − median) ÷ IQR.'],
        wrong: [{ value: 7.67, say: 'You subtracted the mean (8). Robust scaling subtracts the median (5).' }] },
      { id: 'b02-sc-g2-s4', type: 'mc', prompt: 'The mean wait is 8 minutes and the sample standard deviation is about 8.80, so the 31-minute wait has a z-score of about 2.61, below the usual cut-off of 3. Why?',
        options: [
          'The extreme wait raised the mean and inflated the standard deviation, the very numbers used to judge it.',
          'A 31-minute wait isn’t unusual for this desk.',
          'z-scores can’t be calculated for waiting times.',
          'The sample standard deviation divides by n − 1, which always hides outliers.',
        ],
        answer: 0,
        hints: ['Work out the standard deviation of the other eight waits and compare.'],
        feedback: {
          1: 'Its robust value of 8.67 IQRs above the median shows it is far from the other eight waits.',
          2: 'Waiting times are numbers like any other; the problem is what the outlier does to the mean and SD.',
          3: 'Dividing by n rather than n − 1 changes the SD by only about 6% here. The outlier itself is what inflates it.',
        } },
    ],
  },
  {
    id: 'b02-sc-g3', type: 'steps', kind: 'applied',
    prompt: 'A Harborview analyst is building a model of cancellations that uses lead time (days between booking and arrival), scaled with min–max. In the training bookings, lead times run from 0 to 120 days. One test booking was made 180 days ahead.',
    solution: 'Fitted on the training set, the test booking scales to (180 − 0) ÷ (120 − 0) = 1.5. Fitted on training and test rows together, the maximum becomes 180, and a training booking at 120 days scales to 120 ÷ 180 ≈ 0.67 instead of 1: the test row has changed the training features. The correct workflow fits on the training rows and applies the stored parameters unchanged to test and future rows, monitoring rather than clipping values above 1.',
    steps: [
      { id: 'b02-sc-g3-s1', type: 'num', prompt: 'With the scaler fitted on the training set, what is the test booking’s scaled lead time?',
        answer: 1.5, check: () => (180 - 0) / (120 - 0), tol: 0.005, unit: '', places: 2,
        hints: ['Use the training minimum and maximum, even though the test value is outside them.', '(180 − 0) ÷ (120 − 0).'],
        wrong: [{ value: 1, say: 'Min–max values are bounded only for the data the scaler was fitted on. A value above the training maximum scales above 1, and that is useful information.' }] },
      { id: 'b02-sc-g3-s2', type: 'num', prompt: 'Suppose instead the scaler were fitted on training and test rows together, so the maximum is 180. What would a training booking with a 120-day lead time become? (Two decimal places.)',
        answer: 0.67, check: () => 120 / 180, tol: 0.005, unit: '', places: 2,
        hints: ['The minimum is still 0; the maximum is now 180.'],
        wrong: [{ value: 1, say: 'That is its value under the training-only fit. With the test row included, the maximum rises to 180.' }] },
      { id: 'b02-sc-g3-s3', type: 'mc', prompt: 'Which workflow should the analyst use?',
        options: [
          'Fit the scaler on the training rows, transform the training rows, then transform the test rows with the same stored parameters.',
          'Fit the scaler on all rows so that every scaled value lies between 0 and 1.',
          'Fit one scaler on the training rows and a separate one on the test rows.',
          'Fit on the training rows and clip every test value above 1 back to 1.',
        ],
        answer: 0,
        hints: ['The test set should behave like data that arrives after the model is built.'],
        feedback: {
          1: 'That lets the test rows shape the training features: data leakage. The neat 0–1 range is bought with an optimistic evaluation.',
          2: 'A separate scaler measures test rows with a different ruler, so the same lead time would get different values in training and testing.',
          3: 'Clipping hides that the booking lies far outside the training range, which the model and the analyst both need to know.',
        } },
      { id: 'b02-sc-g3-s4', type: 'mc', prompt: 'After the model goes live, a booking arrives with a lead time of 200 days. What should the pipeline do?',
        options: [
          'Scale it with the stored training parameters (200 ÷ 120 ≈ 1.67) and keep track of how often values fall outside the training range.',
          'Re-fit the scaler on this month’s bookings so the new value lies between 0 and 1.',
          'Drop the booking, because the model can’t handle values above 1.',
          'Replace 200 with 120, the training maximum.',
        ],
        answer: 0,
        hints: ['The model was trained with one particular ruler.'],
        feedback: {
          1: 'Re-fitting changes the ruler: a lead time of 120 days would no longer mean what the model learned it means.',
          2: 'The booking is genuine and needs a prediction. Values above 1 are allowed; a rising share of them is a sign to retrain and re-validate.',
          3: 'That invents data. Keep the true value and let monitoring decide whether the model needs retraining.',
        } },
    ],
  },
  {
    id: 'b02-sc-g4', type: 'steps', kind: 'numerical',
    prompt: 'A Lantern segment centre sits at −0.4 on standardised spend and 2.1 on standardised orders. Spend was standardised with mean $100 and SD $40; orders with mean 4 and SD 2. Describe the centre in original units.',
    solution: 'Spend = 100 + (−0.4)(40) = $84. Orders = 4 + (2.1)(2) = 8.2. The segment buys often but spends below average: frequent, small orders.',
    steps: [
      { id: 'b02-sc-g4-s1', type: 'num', prompt: 'What spend, in dollars, does the centre represent?',
        answer: 84, check: () => 100 + -0.4 * 40, tol: 0.5, unit: '$', places: 0,
        hints: ['Reverse the standardisation: x = mean + z × SD.', '100 + (−0.4)(40).'],
        wrong: [{ value: 116, say: 'The z-value is negative, so the centre is below the mean: subtract 0.4 × 40.' }, { value: -16, say: 'You found z × SD but forgot to add the mean back.' }] },
      { id: 'b02-sc-g4-s2', type: 'num', prompt: 'How many orders does the centre represent?',
        answer: 8.2, check: () => 4 + 2.1 * 2, tol: 0.05, unit: 'orders', places: 1,
        hints: ['x = mean + z × SD, with the orders mean and SD.'],
        wrong: [{ value: 4.2, say: 'That is z × SD only. Add the mean of 4.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'b02-sc-i1', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s order-value scaler was fitted on training orders from $12 to $60. A new $75 order arrives. What is its min–max normalised value? (Two decimal places.)',
    answer: 1.31, check: () => (75 - 12) / (60 - 12), tol: 0.005, unit: '', places: 2,
    wrong: [
      { value: 1, say: 'Min–max values are bounded only for the training data. A new order above the training maximum scales above 1; don’t clip it.' },
      { value: 0.84, say: 'You divided by the new order itself, (75 − 12) ÷ 75. Divide by the training range instead: the scaler keeps its training parameters, minimum $12 and maximum $60.' },
      { value: 1.56, say: 'That is 75 ÷ 48. Subtract the minimum first: (75 − 12) ÷ 48.' },
    ],
    solution: '(75 − 12) ÷ (60 − 12) = 63 ÷ 48 ≈ 1.31. The value is above 1 because the order is larger than any training order. That is correct and informative: it is 31% of the training range above the training maximum.',
  },
  {
    id: 'b02-sc-i2', type: 'multi', kind: 'conceptual',
    prompt: 'Lantern’s analyst switches the spend column from dollars to cents, leaving order counts alone, and refits each method without any other scaling. Which methods’ results would change? Select all that apply.',
    options: ['k-nearest neighbours', 'k-means clustering', 'Ridge regression', 'A decision tree', 'A random forest', 'The predictions of an ordinary least-squares regression'],
    answer: [0, 1, 2],
    feedback: {
      3: 'A tree splits on one variable at a time at a threshold. “Spend above $95” becomes “spend above 9,500 cents”, and the same customers fall on each side.',
      4: 'A random forest is made of trees, so it is essentially unaffected by rescaling a variable.',
      5: 'Least squares without a penalty rescales the spend coefficient by 1/100 and leaves the predictions unchanged.',
    },
    solution: 'Distance-based methods (k-nearest neighbours, k-means) now see spend differences 100 times larger, so spend dominates even more. Ridge regression penalises coefficient size, and the spend coefficient shrinks by a factor of 100, so the penalty treats it differently. Trees, forests and unpenalised least squares give the same predictions.',
  },
  {
    id: 'b02-sc-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand’s training orders took 2, 3, 3, 4, 4, 5, 6, 6 and 15 days to deliver. Using linear interpolation for quartiles, what is the robust-scaled value of a new order that took 9 days? (Two decimal places.)',
    answer: 1.67, check: () => (9 - 4) / (6 - 3), tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 1.22, say: 'You subtracted the mean (about 5.33). Robust scaling subtracts the median, the 5th of the nine ordered values: 4.' },
      { value: 0.38, say: 'You divided by the range (15 − 2). Robust scaling divides by the IQR, Q3 − Q1.' },
    ],
    solution: 'Median = 5th value = 4. Q1 is (9 − 1) × 0.25 = 2 places after the first value, the 3rd value, 3; Q3 is 6 places after it, the 7th value, 6. IQR = 3. Robust value = (9 − 4) ÷ 3 ≈ 1.67.',
  },
  {
    id: 'b02-sc-i4', type: 'mc', kind: 'applied',
    prompt: 'A gym chain runs k-means on its members using annual income (dollars) and visits per month. Every cluster differs in income; visit frequency, which the marketing team cares about most, seems to make no difference. What should the analyst do?',
    options: [
      'Standardise both variables (robust scaling if income has extreme values), fitted on the members being clustered, and run k-means again.',
      'Multiply visits by 1,000 so that both variables have similar numbers.',
      'Drop income from the analysis.',
      'Min–max normalise income only, since it is the variable with large numbers.',
    ],
    answer: 0,
    feedback: {
      1: 'That changes the weights by an arbitrary factor. Scaling each variable by its own spread is the principled version of the same idea.',
      2: 'Income may well matter. The problem is the units, not the variable.',
      3: 'Income would then run from 0 to 1 while visits keep their raw values, so visits would dominate instead. Scale both variables.',
    },
    solution: 'Income differences run to thousands of dollars and visit differences to a few visits, so the Euclidean distance is almost entirely income. Scaling both variables by their own spread lets each count in proportion to its typical variation. If the business wants visits to count more, it can weight them deliberately after scaling.',
  },
  {
    id: 'b02-sc-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Harborview’s booking totals are strongly right-skewed: most are a few hundred dollars and a few long or suite stays run to thousands. After standardisation, the totals are…',
    options: [
      'still right-skewed, with mean 0 and standard deviation 1.',
      'normally distributed, with mean 0 and standard deviation 1.',
      'symmetric, because the mean has been subtracted.',
      'between −3 and 3, because standardisation removes extreme values.',
    ],
    answer: 0,
    feedback: {
      1: 'Standardising subtracts a constant and divides by a constant; it doesn’t change the shape. A transformation such as a log changes the shape.',
      2: 'Subtracting the mean moves the centre to 0 but keeps the long right tail.',
      3: 'Nothing is removed or capped: a very large total can still have a z-score of 5 or more.',
    },
    solution: 'Standardisation is linear, so the distribution keeps its shape: the long right tail remains, now measured in standard deviations from a mean of 0. To reduce the skew, take logs first and then standardise.',
  },
  {
    id: 'b02-sc-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional clothing brand regresses weekly units sold on advertising spend and price, with both predictors standardised. The coefficient on advertising is 120 units per standard deviation, and the standard deviation of weekly advertising spend is $2,000. Roughly how many extra units per week are associated with each extra $100 of advertising, holding price constant?',
    answer: 6, check: () => (120 / 2000) * 100, tol: 0.05, unit: 'units', places: 0,
    wrong: [
      { value: 0.06, say: 'That is the effect per dollar. The question asks per $100.' },
      { value: 2400, say: 'Multiply by the standard deviation and you go the wrong way. Divide the standardised coefficient by the SD to get the effect per dollar.' },
      { value: 1.2, say: 'That divides by $100 instead of by the standard deviation. Convert per SD to per dollar first: 120 ÷ 2,000.' },
    ],
    solution: 'Per dollar: 120 ÷ 2,000 = 0.06 units. Per $100: 0.06 × 100 = 6 units a week. This is an association in the brand’s data, holding price constant, not proof that extra advertising causes the extra sales.',
  },
];

export const check = [
  {
    id: 'b02-sc-k1', type: 'num', kind: 'numerical',
    prompt: 'Harborview’s rate scaler stores a training mean of $180 and a standard deviation of $60. What is the standardised value of a $330 booking?',
    answer: 2.5, check: () => (330 - 180) / 60, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 5.5, say: 'That is 330 ÷ 60. Subtract the training mean first.' }],
    solution: 'z = (330 − 180) ÷ 60 = 150 ÷ 60 = 2.5: the rate is two and a half standard deviations above the training mean.',
  },
  {
    id: 'b02-sc-k2', type: 'mc', kind: 'conceptual',
    prompt: 'A variable has a few genuine, very large values that you have decided to keep. You want the typical values to stay well spread out after scaling. Which scaler suits it best?',
    options: ['Robust scaling (median and IQR)', 'Min–max normalisation', 'Standardisation (mean and standard deviation)', 'No scaling: the large values will be handled by the model'],
    answer: 0,
    feedback: {
      1: 'The largest value sets the maximum, so the typical values are squeezed into a narrow band near 0.',
      2: 'The large values inflate the standard deviation and pull the mean up, which compresses the typical values.',
      3: 'Methods that need scaling will still be dominated by this variable’s large numbers if it isn’t scaled.',
    },
    solution: 'The median and IQR depend on the middle of the data, so a few extreme values barely change them. Robust scaling keeps typical values spread out and leaves the large values clearly visible.',
  },
  {
    id: 'b02-sc-k3', type: 'mc', kind: 'applied',
    prompt: 'An analyst standardises every numeric column of Northfield’s student records, then splits the rows 80/20 into training and test sets, trains a model and reports its test accuracy. What is wrong?',
    options: [
      'The test rows helped to set the means and standard deviations used on the training rows, so the test score is likely to be optimistic; split first and fit the scaler on the training rows only.',
      'Nothing: standardising doesn’t use the target variable, so it can’t leak.',
      'The test rows should have been standardised with their own mean and standard deviation.',
      'Standardisation should never be used before a train/test split; min–max normalisation should have been used instead.',
    ],
    answer: 0,
    feedback: {
      1: 'Leakage isn’t only about the target. Any parameter learned from test rows, such as a mean or a standard deviation, carries information the model would not have at prediction time.',
      2: 'That measures test rows with a different ruler from the one the model was trained with, so the same value would mean different things.',
      3: 'The problem is when and on which rows the scaler is fitted, not which scaler is used. Min–max fitted on all rows leaks too.',
    },
    solution: 'Split first. Fit the scaler on the training set, transform the training set, and transform the test set with the same stored parameters. Otherwise the test set has influenced the training data and no longer imitates new data.',
  },
  {
    id: 'b02-sc-k4', type: 'mc', kind: 'conceptual',
    prompt: 'A report says that customer spend was “normalised” before clustering. What do you need to find out before relying on the numbers?',
    options: [
      'Which transformation was meant (min–max, z-scores, unit-length rows or a transformation towards a normal distribution) and which rows its parameters were computed from.',
      'Nothing: normalised data always lie between 0 and 1.',
      'Whether the data now follow a normal distribution, since that is what normalising does.',
      'Only whether the outliers were removed first.',
    ],
    answer: 0,
    feedback: {
      1: 'That is true only of min–max normalisation. The word is also used for z-scores, unit-length rows and transformations towards normality.',
      2: 'Only one of the meanings changes the shape of the distribution; min–max and z-scores don’t.',
      3: 'Outliers matter, but first you need to know what the transformation was and how it was fitted.',
    },
    solution: '“Normalisation” can mean min–max scaling, z-score standardisation, scaling each row to unit length, or a transformation towards normality. Ask for the formula and for the data its parameters were fitted on, and state both whenever you report your own work.',
  },
  {
    id: 'b02-sc-k5', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s robust scaler for order value stores a training median of $28 and an IQR of $12. What is the robust-scaled value of a $64 order?',
    answer: 3, check: () => (64 - 28) / 12, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 5.33, say: 'That is 64 ÷ 12. Subtract the median first.' }],
    solution: 'r = (64 − 28) ÷ 12 = 36 ÷ 12 = 3: the order is three IQRs above the training median.',
  },
  {
    id: 'b02-sc-k6', type: 'mc', kind: 'applied',
    prompt: 'A month after Harborview’s cancellation model went live, 30% of new bookings have min–max lead-time values above 1. In training, by construction, none did. What does this suggest, and what should the analyst do?',
    options: [
      'Bookings are now made further ahead than anything in the training data; investigate, then retrain and re-validate the whole pipeline on more recent data.',
      'Re-fit only the scaler on the new month’s bookings so that the values return to 0–1.',
      'Clip every value above 1 to 1; the model was trained on 0–1 inputs.',
      'Nothing: values above 1 are a normal side effect of min–max scaling.',
    ],
    answer: 0,
    feedback: {
      1: 'That changes the ruler under a model trained with the old one, so its predictions become inconsistent. Retraining must refit the scaler and the model together, then check them on fresh test data.',
      2: 'Clipping hides the change and treats a 200-day lead time like a 120-day one.',
      3: 'An occasional value above 1 is expected; 30% of bookings is a shift in the inputs that the model may not handle well.',
    },
    solution: 'A large share of inputs outside the training range means the data have drifted. Find out why (a new booking policy, a new channel), then retrain the scaler and the model together on a more recent training period and re-validate on a test set.',
  },
];
