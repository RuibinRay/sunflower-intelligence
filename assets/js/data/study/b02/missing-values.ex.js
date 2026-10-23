// missing-values.ex.js — B02 · Missing values: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). All businesses, people and figures are fictional.

const sdAfter = (s, n, m) => s * Math.sqrt((n - 1) / (n + m - 1));

export const widgets = {
  'mv-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['drop-missing', 'fill', 'flag-missing'],
    watch: ['rating'],
    task: 'Find how many ratings are missing and how the gaps split between subscribers and one-off buyers. Then try the treatments one at a time (remove each step before the next) and compare the row count, the mean rating and its standard deviation: drop the rows with no rating; fill the gaps with the mean; fill them with the mean within groups of subscription; flag the gaps with a missing-value indicator. Which treatment changes only the row count, which changes only the spread, which moves the mean, and which keeps a record of what was missing?',
  },
  'mv-impute': {
    type: 'formula',
    title: 'What mean imputation does to the mean and the spread',
    intro: 'Set how many ratings were observed and how many are filled with their mean. The last slider is the true average of the missing ratings, which in real data you never get to see.',
    inputs: [
      { id: 'n', label: 'Observed values (n)', min: 3, max: 200, step: 1, value: 110, fmt: 'int' },
      { id: 'm', label: 'Missing values filled with the mean (m)', min: 0, max: 200, step: 1, value: 90, fmt: 'int' },
      { id: 'mean', label: 'Mean of the observed ratings', min: 1, max: 5, step: 0.01, value: 4.38, fmt: 'num' },
      { id: 'sd', label: 'Standard deviation of the observed ratings (sample)', min: 0.1, max: 2, step: 0.05, value: 0.8, fmt: 'num' },
      { id: 'miss', label: 'True mean of the missing ratings (unknown in practice)', min: 1, max: 5, step: 0.05, value: 3.8, fmt: 'num' },
    ],
    compute: (v) => {
      const after = sdAfter(v.sd, v.n, v.m);
      const pct = (1 - after / v.sd) * 100;
      const all = (v.n * v.mean + v.m * v.miss) / (v.n + v.m);
      const bias = v.mean - all;
      const xs = [0, 25, 50, 75, 100, 125, 150, 175, 200];
      const sign = bias > 0.005 ? '+' : bias < -0.005 ? '−' : '';
      let note;
      if (v.m === 0) note = 'Nothing is imputed, so the mean and the spread are the observed ones.';
      else if (Math.abs(bias) < 0.005) note = `The missing ratings average the same as the observed ones, as they would under MCAR, so the mean is unbiased. The spread is still understated by ${pct.toFixed(1)}%, because ${v.m} values sit exactly on the mean.`;
      else note = `Mean imputation reports ${v.mean.toFixed(2)}, but all ${v.n + v.m} ratings would average ${all.toFixed(2)}: filling gaps with the observed mean keeps the full bias of ignoring them (${sign}${Math.abs(bias).toFixed(2)} stars). On top of that, the spread is understated by ${pct.toFixed(1)}%.`;
      return {
        headline: { label: 'Standard deviation after mean imputation', value: after.toFixed(3) },
        rows: [
          ['Mean after imputation', `${v.mean.toFixed(2)} (the observed mean, unchanged)`],
          ['Standard deviation of the observed values', v.sd.toFixed(3)],
          ['Spread understated by', `${pct.toFixed(1)}%`],
          ['Share of values that are imputed', `${(100 * v.m / (v.n + v.m)).toFixed(1)}%`],
          ['True mean of all n + m ratings', all.toFixed(2)],
          ['Bias of the reported mean', `${sign}${Math.abs(bias).toFixed(2)}`],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Values filled with the mean (m)', values: xs },
          series: [{ name: 'Standard deviation after imputation', values: xs.map((k) => +sdAfter(v.sd, v.n, k).toFixed(3)) }],
          y: { label: 'Standard deviation (stars)' },
        },
      };
    },
  },
};

const MECH = ['MCAR', 'MAR', 'MNAR'];

export const guided = [
  {
    id: 'b02-mv-g1', type: 'steps', kind: 'applied',
    prompt: 'Harborview Hotel emails a satisfaction survey, scored 0 to 10, after every stay. Business travellers answer it less often than leisure guests. Here are ten recent stays (fictional; — marks a blank).',
    data: { table: { head: ['Stay', 'Segment', 'Score'], rows: [
      ['H-501', 'Business', '6'], ['H-502', 'Business', '—'], ['H-503', 'Business', '—'], ['H-504', 'Business', '7'], ['H-505', 'Business', '—'],
      ['H-506', 'Leisure', '9'], ['H-507', 'Leisure', '8'], ['H-508', 'Leisure', '—'], ['H-509', 'Leisure', '9'], ['H-510', 'Leisure', '10'],
    ] } },
    solution: 'Ignoring the blanks: (6 + 7 + 9 + 8 + 9 + 10) ÷ 6 = 49 ÷ 6 = 8.17. Group means: business (6 + 7) ÷ 2 = 6.5, leisure (9 + 8 + 9 + 10) ÷ 4 = 9. Filling each blank with its segment’s mean: (5 × 6.5 + 5 × 9) ÷ 10 = 7.75. Leisure guests score higher and answer more often, so they supply four of the six answers but only half the stays; the complete-case average leans towards them.',
    steps: [
      { id: 'b02-mv-g1-s1', type: 'num',
        prompt: 'What is the average score if you simply ignore the blanks? (2 decimal places)',
        answer: 8.17, check: () => (6 + 7 + 9 + 8 + 9 + 10) / 6, tol: 0.01, unit: '', places: 2,
        hints: ['Add the six scores that exist and divide by six.', 'Business: 6 + 7. Leisure: 9 + 8 + 9 + 10. Total 49.'],
        wrong: [{ value: 4.9, say: 'You divided by all ten stays, which treats the four blanks as scores of 0. Ignoring blanks means dividing by the number of scores that exist.' }] },
      { id: 'b02-mv-g1-s2', type: 'num',
        prompt: 'Now assume the scores are MAR given segment: within each segment, guests who skipped the survey are like those who answered. Fill each blank with its segment’s mean and average all ten stays.',
        answer: 7.75, check: () => (5 * ((6 + 7) / 2) + 5 * ((9 + 8 + 9 + 10) / 4)) / 10, tol: 0.01, unit: '', places: 2,
        hints: ['Business mean = (6 + 7) ÷ 2; leisure mean = (9 + 8 + 9 + 10) ÷ 4.', 'Each segment has five stays: (5 × 6.5 + 5 × 9) ÷ 10.'],
        wrong: [{ value: 8.17, say: 'That is the complete-case average again. Filling with the overall mean would also leave it at 8.17; fill each blank with its own segment’s mean.' }] },
      { id: 'b02-mv-g1-s3', type: 'mc',
        prompt: 'Why is the average that ignores blanks higher than the group-wise estimate?',
        options: [
          'Leisure guests score higher and answer more often, so they supply four of the six answers although they make up only half the stays.',
          'Ignoring blanks always produces a higher average than imputing.',
          'The business travellers who skipped would all have scored 10.',
          'The blanks are MCAR, and MCAR gaps bias averages upwards.',
        ],
        answer: 0,
        hints: ['Compare each segment’s share of the answers with its share of the stays.'],
        feedback: {
          1: 'Not always: if the group that answers more often scored lower, ignoring blanks would pull the average down. The direction depends on who is missing.',
          2: 'Nothing in the data says that, and it would push the estimate up, not down. The group-wise estimate assumes skippers resemble answerers in their segment.',
          3: 'MCAR gaps are a random subset and cause no bias. These gaps depend on segment, so they are not MCAR.',
        } },
    ],
  },
  {
    id: 'b02-mv-g2', type: 'num', kind: 'numerical',
    prompt: 'An online retailer has delivery times for 25 of 40 orders, with a sample standard deviation of 3.0 days. The analyst fills the other 15 with the mean of the 25. What is the standard deviation of all 40 values afterwards? (2 decimal places)',
    answer: 2.35, check: () => sdAfter(3.0, 25, 15), tol: 0.006, unit: 'days', places: 2,
    hints: ['Imputed values sit exactly at the mean, so the sum of squared deviations doesn’t change; only the divisor does.', 'SD after = 3.0 × √((25 − 1) ÷ (40 − 1)).'],
    wrong: [
      { value: 3.0, say: 'The mean is unchanged, but the standard deviation isn’t: the same sum of squared deviations is now divided by 39 instead of 24.' },
      { value: 2.37, say: 'You used √(25 ÷ 40). The sample standard deviation divides by n − 1, so the factor is √(24 ÷ 39).' },
      { value: 1.875, say: 'You scaled the standard deviation itself by 25 ÷ 40. It is the variance that is divided by a larger number, so the SD shrinks by the square root of the ratio.' },
    ],
    solution: 'Sum of squared deviations of the 25 observed values = 3.0² × 24 = 216. The 15 filled values add 0, so the variance of all 40 is 216 ÷ 39 = 5.54 and the SD is √5.54 = 2.35 days. Equivalently, 3.0 × √(24 ÷ 39) = 3.0 × 0.784 = 2.35.',
  },
  {
    id: 'b02-mv-g3', type: 'classify', kind: 'conceptual',
    prompt: 'For each value, decide what it really means and how to treat it.',
    items: [
      'A rating of 0 in a column whose scale runs from 1 to 5',
      'A discount of 0 on an order placed without a promotion code',
      'A blank children field in a hotel booking, where the form records children only when there are some',
      'An entry score of −999 in student records',
      'A region recorded as “unknown”',
      'Zero study hours reported by a student who answered the question',
    ],
    categories: ['Missing: convert to a missing marker', 'A real value: keep it', 'A blank that means zero: fill with 0'],
    answer: [0, 1, 2, 0, 0, 1],
    hints: ['Ask what the person or system that wrote the value meant.', 'A value outside the column’s possible range can’t be real; a zero that the situation allows can be.'],
    feedback: {
      0: 'A 1–5 scale has no 0, so this is a placeholder for “no rating”.',
      1: 'No promotion code means no discount: 0 is the true value.',
      2: 'The form leaves the field empty when there are no children, so this blank carries information: it means 0.',
      3: '−999 is a classic placeholder code; no entry score is negative.',
      4: '“unknown” is a text stand-in for a missing value. In a category column you might later keep it as an explicit Unknown level, but first recognise it as missing.',
      5: 'The student answered, and zero hours is possible. Changing it would destroy real information.',
    },
    solution: 'Missing: the 0 rating (impossible on a 1–5 scale), the −999 entry score (a placeholder) and “unknown” (a text stand-in). Real values: the zero discount and the zero study hours. Blank meaning zero: the children field.',
  },
  {
    id: 'b02-mv-g4', type: 'mc', kind: 'applied',
    prompt: 'An analyst at an online clothing retailer is building a model to predict returns. 15% of customer ages are missing. She has split the data 80/20 into training and test sets and wants to fill the gaps with the median age. Which approach is correct?',
    options: [
      'Compute the median from the training rows and use it to fill the gaps in both the training and the test rows.',
      'Compute the median from all rows before splitting, so both sets get the same, more accurate value.',
      'Compute one median from the training rows for the training set and another from the test rows for the test set.',
      'Leave the test set’s gaps blank so the test data stay untouched.',
    ],
    answer: 0,
    hints: ['Think of the test rows as customers who haven’t arrived yet: what could you know about them when you build the model?'],
    feedback: {
      1: 'Using all rows lets the test set influence how training data are cleaned: that is leakage, and it makes the test score optimistic.',
      2: 'A median computed from the test rows uses test information, and new customers arriving one at a time have no “test median”. Apply the training value to everything.',
      3: 'Most models can’t score a row with a gap, and new customers will have gaps too. The test set must be cleaned exactly as new data will be: with values learned from training.',
    },
    solution: 'Split first. Learn the fill value (the median) from the training rows only, then apply that same value to the training rows and the test rows, and save it with the model for future data.',
  },
];

export const independent = [
  {
    id: 'b02-mv-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify the missingness mechanism in each scenario.',
    items: [
      'A server fault deleted the ratings of every Lantern order placed on two particular days.',
      'Older hotel guests answer the emailed survey less often; within each age band, answering is unrelated to how satisfied guests were.',
      'Students who study very little are the ones who leave the study-hours question blank.',
      'Customers whose delivery went wrong are less likely to leave a rating, and delivery problems aren’t recorded anywhere in the export.',
      'One-off buyers rate less often than subscribers; among buyers of the same type, rating is unrelated to satisfaction.',
      'To shorten a survey, a random half of respondents were never shown the income question.',
    ],
    categories: MECH,
    answer: [0, 1, 2, 2, 1, 0],
    feedback: {
      0: 'The days were not chosen because of anything about the orders, so the lost ratings are a random subset: MCAR.',
      1: 'Missingness depends on age, which is recorded, and not on satisfaction within an age band: MAR.',
      2: 'Whether hours are missing depends on the hours themselves: MNAR.',
      3: 'Missingness depends on the experience behind the rating, and nothing recorded captures it: MNAR. If delivery problems were logged in another column, the data could become MAR given that column.',
      4: 'Missingness depends on customer type, which is recorded: MAR.',
      5: 'Planned missingness chosen at random is the textbook case of MCAR.',
    },
    solution: 'MCAR: the server fault and the randomly skipped income question. MAR: age-related survey response and customer-type-related rating. MNAR: low-study students skipping the hours question and unhappy customers not rating when the problem isn’t recorded.',
  },
  {
    id: 'b02-mv-i2', type: 'rows', kind: 'applied',
    prompt: 'You want the correlation between order total and rating, using listwise deletion. Select every row that would be dropped. (— marks a blank cell.)',
    data: { table: { head: ['Order', 'Email', 'Order total ($)', 'Rating'], rows: [
      ['L-3101', 'ana.k@example.com', '42.00', '5'],
      ['L-3102', '—', '18.50', '4'],
      ['L-3103', 'j.osei@example.com', '27.00', '—'],
      ['L-3104', 'm.ruiz@example.com', '—', '3'],
      ['L-3105', 'unknown', '35.50', '—'],
      ['L-3106', 'p.tan@example.com', '61.00', '5'],
      ['L-3107', 'l.berg@example.com', '22.00', 'NA'],
      ['L-3108', 'r.ito@example.com', '30.00', '2'],
    ] } },
    answer: [2, 3, 4, 6],
    solution: 'Listwise deletion drops rows with a gap in any variable <i>the analysis uses</i>: here order total and rating. L-3103 and L-3105 have no rating, L-3104 has no total, and L-3107’s “NA” is a missing marker. L-3102’s missing email (and L-3105’s “unknown” email) don’t matter for this analysis, so L-3102 stays. Four of eight rows remain: a 50% loss from just four gaps.',
  },
  {
    id: 'b02-mv-i3', type: 'num', kind: 'numerical',
    prompt: 'In a Northfield seminar group of ten students, the five first-years recorded study hours of 10, 12 and 14 (two left the question blank), and the five third-years recorded 6 and 8 (three left it blank). Assuming the hours are MAR given year, fill each blank with its year’s mean. What is the mean study time of all ten students?',
    answer: 9.5, check: () => (5 * ((10 + 12 + 14) / 3) + 5 * ((6 + 8) / 2)) / 10, unit: 'hours', places: 1, tol: 0.01,
    wrong: [
      { value: 10, say: 'That is the average of the five recorded values. First-years, who study more, supplied three of the five, so ignoring the blanks over-weights them.' },
      { value: 5, say: 'You divided the five recorded hours by ten students, which treats the blanks as zero hours.' },
    ],
    solution: 'First-year mean = (10 + 12 + 14) ÷ 3 = 12; third-year mean = (6 + 8) ÷ 2 = 7. Filling gaps by year gives first-years 5 × 12 = 60 hours and third-years 5 × 7 = 35 hours, so the mean is (60 + 35) ÷ 10 = 9.5 hours, compared with 10 if the blanks are ignored.',
  },
  {
    id: 'b02-mv-i4', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst builds a correlation matrix for rating, order total and quantity using pairwise deletion. What is the main risk?',
    options: [
      'Each correlation uses a different set of rows, so the correlations can be inconsistent with each other, and deletion’s bias remains when the data aren’t MCAR.',
      'It drops every row with any gap, wasting more data than listwise deletion.',
      'It fills the gaps with the column means, weakening every correlation.',
      'It can only be used with categorical data.',
    ],
    answer: 0,
    feedback: {
      1: 'That describes listwise deletion. Pairwise deletion keeps more rows, because each statistic uses every row that has the two values it needs.',
      2: 'Pairwise deletion doesn’t fill anything; it computes each statistic from the rows available for it.',
      3: 'It is most often used for numeric statistics such as correlations and covariances.',
    },
    solution: 'Pairwise (available-case) deletion computes each correlation from the rows that have both values. The rows differ from one correlation to the next, so the matrix may not correspond to any single dataset, which breaks methods such as regression that rely on it; and like any deletion it is biased unless the data are MCAR.',
  },
  {
    id: 'b02-mv-i5', type: 'num', kind: 'numerical',
    prompt: 'A Harborview analyst converts 30 placeholder nightly rates to missing values and fills them with the mean of the 50 genuine rates. By what percentage is the standard deviation now understated, compared with the standard deviation of the 50 genuine rates? (1 decimal place)',
    answer: 21.2, check: () => (1 - Math.sqrt(49 / 79)) * 100, tol: 0.1, unit: '%', places: 1,
    wrong: [
      { value: 37.5, say: 'That is the share of values imputed (30 of 80). The understatement depends on √((n − 1) ÷ (n + m − 1)).' },
      { value: 38.0, say: 'That is how much the variance falls (1 − 49 ÷ 79). The standard deviation is its square root, so it falls by less.' },
    ],
    solution: 'Factor = √((50 − 1) ÷ (50 + 30 − 1)) = √(49 ÷ 79) = √0.6203 = 0.7876. The SD is 78.8% of its observed value, so it is understated by 1 − 0.7876 = 21.2%.',
  },
  {
    id: 'b02-mv-i6', type: 'mc', kind: 'applied',
    prompt: 'Lantern is building a model to predict which subscribers will cancel. The analyst has noticed that subscribers who stop rating their deliveries often cancel a few weeks later. She will fill missing ratings with the training median. What else should she do?',
    options: [
      'Add a rating_missing column (1 if the rating was missing) so the model can use the fact of missingness.',
      'Nothing: once the gaps are filled, the information is preserved in the median values.',
      'Delete subscribers with missing ratings, since they are probably leaving anyway.',
      'Fill the gaps with 1 star instead, because silent customers must be unhappy.',
    ],
    answer: 0,
    feedback: {
      1: 'After filling, a missing rating looks exactly like a genuine median rating. The signal “this customer stopped rating” is lost unless an indicator records it.',
      2: 'Those are exactly the customers the model most needs to learn about; deleting them biases it towards customers who stay.',
      3: 'That bakes an unverified MNAR assumption into the data. The indicator lets the model learn how silence relates to cancelling instead.',
    },
    solution: 'Keep a missing-value indicator alongside the filled column. Missingness here is informative (it predicts cancelling), and the indicator lets the model use it; it also records which values were imputed.',
  },
];

export const check = [
  {
    id: 'b02-mv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern finds that ratings are missing far more often for one-off buyers than for subscribers. What can the analyst conclude from the data alone?',
    options: [
      'The ratings are not MCAR, but the data can’t show whether they are MAR or MNAR.',
      'The ratings are MAR, because missingness depends on a recorded variable.',
      'The ratings are MNAR, because one-off buyers are less satisfied.',
      'The ratings are MCAR, because both groups have some missing values.',
    ],
    answer: 0,
    feedback: {
      1: 'Missingness depends on customer type, but it might also depend on satisfaction within each type. That would make it MNAR, and the observed data can’t rule it out.',
      2: 'Being less satisfied on average doesn’t make the gaps MNAR; MNAR means missingness depends on the missing values themselves. The data can’t establish that either way.',
      3: 'MCAR means missingness is unrelated to any data. Here it clearly depends on customer type.',
    },
    solution: 'A difference in missingness between recorded groups rules out MCAR. Whether, within each group, missingness depends on the unseen ratings (MNAR) or not (MAR) can’t be tested from the observed data; it has to be judged from how the ratings are collected and explored with what-if analyses.',
  },
  {
    id: 'b02-mv-k2', type: 'num', kind: 'numerical',
    prompt: 'A course-feedback survey has 30 observed satisfaction scores with a sample standard deviation of 12 points. The 10 blank scores are filled with the observed mean. What is the standard deviation of all 40 scores afterwards? (2 decimal places)',
    answer: 10.35, check: () => sdAfter(12, 30, 10), tol: 0.01, unit: 'points', places: 2,
    wrong: [
      { value: 12, say: 'Filling with the mean leaves the mean unchanged, not the standard deviation.' },
      { value: 10.39, say: 'You used √(30 ÷ 40). The sample SD divides by n − 1: the factor is √(29 ÷ 39).' },
      { value: 9, say: 'You multiplied the SD by 30 ÷ 40. It is the variance that is divided by a larger number; the SD shrinks by the square root of the ratio.' },
    ],
    solution: 'SD after = 12 × √((30 − 1) ÷ (30 + 10 − 1)) = 12 × √(29 ÷ 39) = 12 × 0.8623 = 10.35 points.',
  },
  {
    id: 'b02-mv-k3', type: 'num', kind: 'applied',
    prompt: 'An airline surveys passengers after a flight (scores 0–10). Business class: 40 passengers, 30 responded, average 8.2. Economy: 160 passengers, 40 responded, average 6.5. Assuming the responses are MAR given cabin, estimate the average satisfaction of all 200 passengers. (2 decimal places)',
    answer: 6.84, check: () => (40 * 8.2 + 160 * 6.5) / 200, tol: 0.006, unit: '', places: 2,
    wrong: [
      { value: 7.23, say: 'That averages the 70 responses, so business class (30 of 70 responses but 40 of 200 passengers) is over-weighted.' },
      { value: 7.35, say: 'That is the simple average of the two cabin averages. Weight each cabin by its number of passengers.' },
    ],
    solution: 'Weight each cabin’s average by its passengers: (40 × 8.2 + 160 × 6.5) ÷ 200 = (328 + 1,040) ÷ 200 = 6.84. Ignoring the non-responders gives (30 × 8.2 + 40 × 6.5) ÷ 70 = 7.23, which overstates satisfaction because the happier cabin responds more.',
  },
  {
    id: 'b02-mv-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify the missingness mechanism in each scenario.',
    items: [
      'A random 5% of paper survey forms were lost in the post.',
      'Employees who are unhappy at work are the ones who skip the satisfaction question in the engagement survey.',
      'Younger customers leave the income field blank more often; within each age group, skipping is unrelated to income.',
      'High earners are more likely to leave the income field blank, whatever their age.',
    ],
    categories: MECH,
    answer: [0, 2, 1, 2],
    feedback: {
      0: 'Losses in the post don’t depend on what the forms say: MCAR.',
      1: 'Whether the answer is missing depends on the answer itself (unhappiness): MNAR.',
      2: 'Missingness depends on a recorded variable (age) and not on income within age groups: MAR.',
      3: 'Missingness depends on the unrecorded income itself: MNAR.',
    },
    solution: 'Lost forms: MCAR. Unhappy employees skipping: MNAR. Age-related skipping of income: MAR. High earners skipping: MNAR.',
  },
  {
    id: 'b02-mv-k5', type: 'mc', kind: 'applied',
    prompt: 'A courier’s handheld scanner failed on three random days, so 2% of delivery times are missing. You are reporting the median delivery time to management. What is the most sensible treatment?',
    options: [
      'Drop the rows with missing times and note how many were dropped: the gaps are plausibly MCAR and few.',
      'Fill the gaps with the mean delivery time so that no rows are lost.',
      'Fill the gaps with 0 days, since those parcels have no recorded time.',
      'Report no median until the missing times can be recovered.',
    ],
    answer: 0,
    feedback: {
      1: 'Mean imputation adds no information and shrinks the spread; for a median of the remaining 98% it gains nothing. Deletion is simpler and, under MCAR, unbiased.',
      2: 'A blank here means “not recorded”, not “delivered instantly”. Zeros would drag the median down.',
      3: 'A small MCAR loss barely affects the median. Waiting for perfect data delays a decision for no real gain.',
    },
    solution: 'The failure was on random days, so the missing times are plausibly MCAR, and only 2% are affected. Dropping them leaves an unbiased median from 98% of deliveries; say in a footnote how many were excluded and why.',
  },
  {
    id: 'b02-mv-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are effects of filling the missing values in a numeric column with the mean of its observed values? Select all that apply.',
    options: [
      'The column’s mean is unchanged.',
      'The column’s standard deviation becomes smaller than that of the observed values.',
      'Correlations with other columns tend to move towards zero.',
      'The bias in the mean disappears if the data are MAR.',
      'Standard errors computed afterwards become larger, reflecting the extra uncertainty.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The mean stays at the observed mean, so any bias from who is missing remains. Group-wise or multiple imputation using the variables that drive missingness is needed under MAR.',
      4: 'The reverse: the analysis now thinks it has more real observations, so standard errors become too small.',
    },
    solution: 'Mean imputation keeps the observed mean (and its bias), adds values with zero deviation so the standard deviation shrinks, and adds rows that carry no information about relationships, so correlations weaken. Standard errors become too small, not larger.',
  },
];
