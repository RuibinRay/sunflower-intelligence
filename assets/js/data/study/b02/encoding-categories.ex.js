// encoding-categories.ex.js — B02 · Encoding categorical variables: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const pct1 = (n) => `${n.toFixed(1)}%`;

export const widgets = {
  'enc-regions': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['map', 'encode'],
    watch: ['region'],
    task: 'One-hot encode the raw <code>region</code> column and count the new columns: every spelling variant gets its own. Then map each variant to one of the five valid regions (North, South, East, West, Central) and encode again. How many columns now, and why must consolidation come before encoding?',
  },
  'enc-lab': {
    type: 'cleaning',
    dataset: {
      columns: ['order_id', 'split', 'region', 'channel', 'roast', 'subscription', 'reordered'],
      rows: [
        ['LC-90001', 'train', 'North', 'web', 'medium', 'no', 1],
        ['LC-90002', 'train', 'South', 'app', 'dark', 'yes', 1],
        ['LC-90003', 'train', 'North', 'web', 'light', 'no', 0],
        ['LC-90004', 'train', 'East', 'web', 'dark', 'no', 0],
        ['LC-90005', 'train', 'West', 'app', 'medium', 'yes', 1],
        ['LC-90006', 'train', 'Central', 'web', 'medium', 'no', 0],
        ['LC-90007', 'train', 'North', 'app', 'dark', 'no', 1],
        ['LC-90008', 'train', 'South', 'web', 'light', 'no', 0],
        ['LC-90009', 'train', 'West', 'web', 'dark', 'yes', 1],
        ['LC-90010', 'test', 'East', 'app', 'medium', 'no', 1],
        ['LC-90011', 'test', 'Central', 'web', 'light', 'no', 0],
        ['LC-90012', 'test', 'North', 'web', 'dark', 'yes', 1],
      ],
    },
    ops: ['encode'],
    split: 'split',
    target: 'reordered',
    watch: ['region', 'roast'],
    task: 'This fictional table of Lantern orders marks training and test rows in <code>split</code>; <code>reordered</code> is the outcome (1 = the customer ordered again within 60 days). Encode <code>region</code> with one-hot encoding, with dummy coding and with label encoding, and compare the columns. Encode <code>roast</code> ordinally in the order light, medium, dark. Then target-encode <code>region</code>, fitted on the training rows only, and check which value the test rows receive.',
  },
  'enc-smooth': {
    type: 'formula',
    title: 'Smoothed target encoding',
    intro: 'One category’s encoding is a weighted average of its own rate and the overall rate.',
    inputs: [
      { id: 'n', label: 'Training rows in the category (n)', min: 1, max: 100, step: 1, value: 4, fmt: 'int', unit: 'rows' },
      { id: 'cat', label: 'Category’s own rate', min: 0, max: 100, step: 1, value: 75, fmt: 'pct' },
      { id: 'all', label: 'Overall rate in the training data', min: 0, max: 100, step: 1, value: 50, fmt: 'pct' },
      { id: 'm', label: 'Smoothing strength (m)', min: 0, max: 50, step: 1, value: 2, fmt: 'int', unit: 'rows' },
    ],
    compute: (v) => {
      const lam = v.n / (v.n + v.m);
      const s = lam * v.cat + (1 - lam) * v.all;
      const ns = [1, 2, 5, 10, 20, 50, 100];
      const note = v.m === 0
        ? 'With no smoothing the category keeps its own rate, however few rows it has: a category with one row is encoded as that row’s own outcome.'
        : `The category’s own rate gets ${(lam * 100).toFixed(0)}% of the weight and the overall rate ${((1 - lam) * 100).toFixed(0)}%. ${lam < 0.5 ? 'With so few rows relative to m, the encoding stays closer to the overall rate than to the category’s own.' : 'With this many rows relative to m, the category’s own rate dominates.'} The chart shows how the encoding approaches the category’s rate as the number of rows grows.`;
      return {
        headline: { label: 'Smoothed encoding', value: pct1(s) },
        rows: [
          ['Weight λ = n ÷ (n + m)', `${v.n} ÷ (${v.n} + ${v.m}) = ${lam.toFixed(3)}`],
          ['Encoding = λ × category rate + (1 − λ) × overall rate', `${lam.toFixed(3)} × ${v.cat}% + ${(1 - lam).toFixed(3)} × ${v.all}% = ${pct1(s)}`],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Training rows in the category', values: ns },
          series: [
            { name: 'Smoothed encoding', values: ns.map((k) => Math.round(((k / (k + v.m)) * v.cat + (v.m / (k + v.m)) * v.all) * 10) / 10) },
            { name: 'Category’s own rate', values: ns.map(() => v.cat) },
            { name: 'Overall rate', values: ns.map(() => v.all) },
          ],
          y: { label: 'Rate (%)' },
        },
      };
    },
  },
};

const ENCODINGS = ['One-hot encoding', 'Ordinal encoding in a stated order', 'A single 0/1 column', 'Frequency or target encoding, fitted on training data', 'Leave it out of the model'];

export const guided = [
  {
    id: 'b02-enc-g1', type: 'steps', kind: 'numerical',
    prompt: 'A Harborview cancellation model uses room type (Standard, Deluxe, Family, Suite) and booking channel (Direct, OTA, Phone, Corporate, Travel agent) as inputs.',
    solution: 'One-hot encoding keeps one column per category: 4 + 5 = 9 columns. Dummy coding drops one category from each variable: 3 + 4 = 7 columns. Dropping is required for an unpenalised regression with an intercept, because the full set of one-hot columns of each variable adds up to the intercept’s column of 1s.',
    steps: [
      { id: 'b02-enc-g1-s1', type: 'num', prompt: 'How many columns does one-hot encoding of both variables create, keeping every category?',
        answer: 9, check: () => 4 + 5, tol: 0.5, unit: 'columns', places: 0,
        hints: ['One column per category.', 'Count the room types and the channels and add.'],
        wrong: [{ value: 2, say: 'That is one column per variable. One-hot encoding creates one column per category.' }, { value: 7, say: 'That is dummy coding, with one category dropped from each variable. Keep every category here.' }] },
      { id: 'b02-enc-g1-s2', type: 'num', prompt: 'How many columns with dummy coding (one reference category per variable)?',
        answer: 7, check: () => (4 - 1) + (5 - 1), tol: 0.5, unit: 'columns', places: 0,
        hints: ['k − 1 columns per variable.'],
        wrong: [{ value: 8, say: 'Drop a reference category from each variable, not just one overall.' }] },
      { id: 'b02-enc-g1-s3', type: 'mc', prompt: 'For which model must the analyst use the dummy-coded version?',
        options: ['An unpenalised logistic regression with an intercept', 'A random forest built from several hundred decision trees', 'A ridge-penalised logistic regression with an intercept', 'A k-nearest-neighbours model that uses scaled distances'],
        answer: 0,
        hints: ['Where does the dummy-variable trap make the coefficients impossible to pin down?'],
        feedback: {
          1: 'Trees never invert a matrix, so all nine columns are fine, and one-hot often works slightly better.',
          2: 'The penalty makes the solution unique; dropping a column would make the reference category special.',
          3: 'Distance-based methods should keep all columns so every category is equally far from every other.',
        } },
    ],
  },
  {
    id: 'b02-enc-g2', type: 'steps', kind: 'applied',
    prompt: 'Harborview’s travel-agent bookings carry an agent code. In eight training bookings, agent T1 has four bookings with outcomes cancelled 1, 0, 0, 1; agent T2 has three, all 0; agent T3 has one, cancelled (1). The analyst wants to target-encode the agent code for a cancellation model.',
    solution: 'Plain encodings: T1 0.5, T2 0, T3 1. T3’s encoding is its single booking’s own outcome, so the feature leaks the answer. The overall rate is 3 ÷ 8 = 0.375; smoothing with m = 4 gives T3 (1 + 4 × 0.375) ÷ (1 + 4) = 0.5. A new agent not seen in training gets the overall training rate, 0.375.',
    steps: [
      { id: 'b02-enc-g2-s1', type: 'num', prompt: 'What is the plain (unsmoothed) target encoding of agent T3?',
        answer: 1, check: () => 1 / 1, tol: 0.005, unit: '', places: 2,
        hints: ['The encoding is the average outcome of the category’s training rows.', 'T3 has a single booking.'],
        wrong: [{ value: 0.375, say: 'That is the overall rate. The plain encoding uses T3’s own bookings only.' }] },
      { id: 'b02-enc-g2-s2', type: 'mc', prompt: 'Why is that encoding a problem for training the model?',
        options: [
          'It is that booking’s own outcome, so the feature contains the answer and the model learns to trust it.',
          'Encodings must lie strictly between 0 and 1.',
          'T3 is a rare agent, and categories with a single booking should be deleted from the data before encoding.',
          'Target encoding can only be used for continuous targets, not for a yes/no outcome such as whether a booking is cancelled.',
        ],
        answer: 0,
        hints: ['Where does the number 1 come from?'],
        feedback: {
          1: 'Values of 0 or 1 are possible averages. The problem is where the value came from.',
          2: 'Rare agents can be smoothed or grouped; deleting their bookings throws away real data.',
          3: 'For a yes/no target the encoding is the proportion of 1s; scikit-learn supports binary, multiclass and continuous targets.',
        } },
      { id: 'b02-enc-g2-s3', type: 'num', prompt: 'The overall training cancellation rate is 3 ÷ 8. With smoothing strength m = 4, what is T3’s smoothed encoding? (Two decimal places.)',
        answer: 0.5, check: () => (1 * 1 + 4 * (3 / 8)) / (1 + 4), tol: 0.005, unit: '', places: 2,
        hints: ['S = (n × category mean + m × overall mean) ÷ (n + m).', '(1 × 1 + 4 × 0.375) ÷ 5.'],
        wrong: [{ value: 0.875, say: 'You weighted the category by m and the overall rate by n. The category’s weight is n ÷ (n + m) = 1 ÷ 5.' }, { value: 0.69, say: 'That is the simple average of 1 and 0.375. Weight the category’s own rate by n ÷ (n + m) = 1 ÷ 5 and the overall rate by 4 ÷ 5.' }] },
      { id: 'b02-enc-g2-s4', type: 'num', prompt: 'A booking arrives from agent T9, who never appeared in training. What value should it be encoded with? (Three decimal places.)',
        answer: 0.375, check: () => 3 / 8, tol: 0.0005, unit: '', places: 3,
        hints: ['There is no category average for T9.'],
        wrong: [{ value: 0, say: 'Zero would claim T9’s bookings are never cancelled. With no information about T9, use the overall training rate.' }] },
    ],
  },
  {
    id: 'b02-enc-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern is building a model to predict reorders. Choose an encoding for each candidate input.',
    items: ['Delivery region (five regions)', 'Roast (light, medium, dark)', 'Subscription (yes or no)', 'Customer postcode (thousands of values)', 'customer_id'],
    categories: ENCODINGS,
    answer: [0, 1, 2, 3, 4],
    hints: ['Ask of each: is there an order, and how many categories are there?', 'Identifiers pick out rows; they don’t describe them.'],
    feedback: {
      0: 'Region is nominal with few categories: one-hot encoding invents no order.',
      1: 'Roast has a real order; supply it explicitly so the tool doesn’t sort it alphabetically.',
      2: 'Two categories need only one 0/1 column.',
      3: 'One-hot would create thousands of sparse columns; move up to a coarser area or use fitted frequency or target encoding.',
      4: 'An identifier lets a model memorise individual customers and says nothing about new ones.',
    },
    solution: 'Region: one-hot. Roast: ordinal, light < medium < dark. Subscription: one 0/1 column. Postcode: frequency or target encoding fitted on the training data (or a coarser area). customer_id: left out.',
  },
  {
    id: 'b02-enc-g4', type: 'num', kind: 'numerical',
    prompt: 'An unpenalised logistic regression with an intercept uses region (five regions, dummy coded), channel (web or app), subscription (yes or no), roast (ordinal: one column) and grind (whole bean, espresso, filter, cafetière; dummy coded). How many input columns does it have?',
    answer: 10, check: () => (5 - 1) + 1 + 1 + 1 + (4 - 1), tol: 0.5, unit: 'columns', places: 0,
    hints: ['Dummy coding gives k − 1 columns; a two-category variable gives 1; ordinal encoding gives 1.', '4 + 1 + 1 + 1 + 3.'],
    wrong: [
      { value: 12, say: 'That keeps every region and grind column. With an intercept and no penalty, drop one category from each.' },
      { value: 13, say: 'Two-category variables need only one column each, and dummy coding drops one category per variable.' },
    ],
    solution: 'Region 5 − 1 = 4, channel 1, subscription 1, roast 1, grind 4 − 1 = 3: 4 + 1 + 1 + 1 + 3 = 10 columns.',
  },
];

export const independent = [
  {
    id: 'b02-enc-i1', type: 'num', kind: 'numerical',
    prompt: 'An unpenalised regression with an intercept uses Northfield’s programme (six programmes), residence (on campus, off campus, family home), scholarship (yes or no) and year of study kept as a number. How many input columns?',
    answer: 9, check: () => (6 - 1) + (3 - 1) + 1 + 1, tol: 0.5, unit: 'columns', places: 0,
    wrong: [
      { value: 12, say: 'That one-hot encodes everything, including two columns for scholarship. Use k − 1 dummies per variable with an intercept and one column for a yes/no variable.' },
      { value: 11, say: 'With an intercept and no penalty, drop a reference category from programme and from residence.' },
    ],
    solution: 'Programme 5 + residence 2 + scholarship 1 + year 1 = 9 columns, with one reference programme and one reference residence.',
  },
  {
    id: 'b02-enc-i2', type: 'mc', kind: 'conceptual',
    prompt: 'A k-nearest-neighbours model uses region label-encoded alphabetically: Central 0, East 1, North 2, South 3, West 4. What goes wrong?',
    options: [
      'Central and West look four times as different as Central and East, because of the spelling of the names.',
      'Nothing: k-nearest neighbours ignores categorical variables and measures distance on the numeric ones only.',
      'The model can’t run, because the codes are integers.',
      'Every region becomes equally distant from every other region, so region no longer changes who the neighbours are.',
    ],
    answer: 0,
    feedback: {
      1: 'The model uses whatever numbers it is given; here it computes distances from meaningless codes.',
      2: 'Integers are fine for arithmetic. The problem is that the arithmetic means nothing.',
      3: 'That is what one-hot encoding achieves, not label encoding.',
    },
    solution: 'Distances between codes become distances between regions, so the alphabetical order decides which regions are “similar”. One-hot encoding puts every pair of regions √2 apart.',
  },
  {
    id: 'b02-enc-i3', type: 'num', kind: 'numerical',
    prompt: 'In Ashgrove Clothing’s training data, style K has 3 orders, 2 of them returned. The overall return rate is 0.2. What is K’s smoothed target encoding with m = 5? (Three decimal places.)',
    answer: 0.375, check: () => (2 + 5 * 0.2) / (3 + 5), tol: 0.0005, unit: '', places: 3,
    wrong: [
      { value: 0.667, say: 'That is the unsmoothed style mean, 2 ÷ 3. Blend it with the overall rate.' },
      { value: 0.2, say: 'That ignores the style’s own orders. The weight on them is 3 ÷ (3 + 5).' },
    ],
    solution: 'S = (n × mean + m × overall) ÷ (n + m) = (2 + 5 × 0.2) ÷ 8 = 3 ÷ 8 = 0.375. With only 3 orders, the style is pulled most of the way towards the overall rate.',
  },
  {
    id: 'b02-enc-i4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s model was trained with a dummy-coded region (reference: North). Lantern starts delivering to a sixth region, “Islands”. The encoder is set to encode unknown categories as all zeros. What happens to Islands orders?',
    options: [
      'They are silently treated as North orders: all zeros encodes the reference region.',
      'The encoder raises an error, because Islands was not among the categories it was fitted on.',
      'They get the average effect of all five regions, because no single region’s column is switched on.',
      'They are dropped from the predictions, because the model has no column for a region it never saw.',
    ],
    answer: 0,
    feedback: {
      1: 'That is scikit-learn’s default (handle_unknown set to error), but this encoder was set to encode unknown categories as zeros.',
      2: 'No averaging happens: all zeros means “reference category” to a dummy-coded model.',
      3: 'The rows are still scored; that is what makes the mistake silent.',
    },
    solution: 'With dummy coding, the reference category is the row with all region dummies at 0. An unknown region encoded as all zeros is indistinguishable from North. Plan for new categories: map them to “Other” or retrain once there is data.',
  },
  {
    id: 'b02-enc-i5', type: 'num', kind: 'numerical',
    prompt: 'With Standard as the reference, Harborview’s rate regression gives intercept $140 and coefficients Deluxe +45, Family +70, Suite +180. The analyst refits with Family as the reference. What is the Suite coefficient now?',
    answer: 110, check: () => (140 + 180) - (140 + 70), tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 180, say: 'Changing the reference changes the coefficients: Suite is now compared with Family, not Standard.' },
      { value: 320, say: 'That is the Suite prediction. The coefficient is the difference from the reference.' },
    ],
    solution: 'Suite is predicted at 140 + 180 = $320 and Family at 140 + 70 = $210. With Family as the reference, the Suite coefficient is 320 − 210 = $110. Predictions don’t change.',
  },
  {
    id: 'b02-enc-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Is each variable nominal or ordinal, and so how should it be encoded (when it has few categories)?',
    items: ['Hotel star category (3, 4, 5 stars)', 'Payment method', 'Clothing size (S, M, L, XL)', 'Country of residence', 'Satisfaction (poor, fair, good, excellent)', 'Colour of a product'],
    categories: ['Nominal: one-hot encoding', 'Ordinal: integer codes in the stated order'],
    answer: [1, 0, 1, 0, 1, 0],
    feedback: {
      0: 'Star categories are ordered; check whether equal steps are plausible.',
      2: 'Sizes are ordered. Better still, use real measurements if you have them.',
      3: 'Countries have no order; with many of them, group rare ones or use fitted encodings.',
    },
    solution: 'Ordered: star category, size, satisfaction (ordinal encoding with the order supplied). Unordered: payment method, country, colour (one-hot, or grouping and fitted encodings when there are many values).',
  },
];

export const check = [
  {
    id: 'b02-enc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'When must you drop one one-hot column (use a reference category)?',
    options: [
      'When fitting an unpenalised linear or logistic regression with an intercept.',
      'Whenever you one-hot encode a variable, whichever kind of model will use the columns.',
      'When fitting a random forest, so that the trees don’t split on redundant columns.',
      'When using k-means clustering, so that the distances between categories stay equal.',
    ],
    answer: 0,
    feedback: {
      1: 'Penalised, tree-based and distance-based methods usually work better with all k columns; scikit-learn and pandas keep them by default.',
      2: 'Trees don’t invert a matrix, so the trap doesn’t arise.',
      3: 'Dropping a column puts the reference category at the origin and makes it artificially close to every other category.',
    },
    solution: 'The k columns add up to the intercept’s column of 1s, so an unpenalised model with an intercept can’t estimate unique coefficients. Elsewhere, keeping all k columns is usually better.',
  },
  {
    id: 'b02-enc-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline’s ridge regression one-hot encodes cabin (economy, premium economy, business, first), booking channel (website, app, travel agent) and day of week, keeping every category. How many columns do these three variables become?',
    answer: 14, check: () => 4 + 3 + 7, tol: 0.5, unit: 'columns', places: 0,
    wrong: [{ value: 11, say: 'That drops a category from each variable. A penalised model keeps all k columns.' }, { value: 3, say: 'One-hot encoding creates one column per category, not per variable.' }],
    solution: '4 cabins + 3 channels + 7 days = 14 columns.',
  },
  {
    id: 'b02-enc-k3', type: 'mc', kind: 'applied',
    prompt: 'An analyst target-encodes product codes using the return rate of each product over the whole dataset, then splits into training and test sets. The test accuracy is excellent. What should you conclude?',
    options: [
      'The result is untrustworthy: the encodings contain test outcomes and each row’s own outcome. Split first, fit on training data out-of-fold with smoothing, and encode the test set with the training averages.',
      'The result is fine, because averages are only summaries of the data.',
      'The result is fine as long as the product codes are cleaned first.',
      'Target encoding should be replaced by label encoding, which can’t leak.',
    ],
    answer: 0,
    feedback: {
      1: 'These averages are built from the outcome the model is trying to predict, including test outcomes.',
      2: 'Cleaning is necessary but doesn’t stop the leakage.',
      3: 'Label encoding avoids this leakage but invents an order; fitted target encoding is the better tool when done properly.',
    },
    solution: 'Target averages computed on all rows put test outcomes into the training features and every row’s own outcome into its encoding. Fit on the training set, encode training rows out-of-fold, smooth small categories, and apply the training averages to the test set.',
  },
  {
    id: 'b02-enc-k4', type: 'num', kind: 'numerical',
    prompt: 'In a training set of 200 Lantern orders, 46 came from the West region. What is West’s frequency encoding?',
    answer: 0.23, check: () => 46 / 200, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 46, say: 'That is the count. Frequency encoding usually uses the share: count ÷ training rows.' }],
    solution: '46 ÷ 200 = 0.23. Compute it on the training set and reuse it for test and new orders.',
  },
  {
    id: 'b02-enc-k5', type: 'mc', kind: 'applied',
    prompt: 'An online retailer wants to predict returns using product code, which has 12,000 values; many products have been sold only once or twice. Which approach is most sensible?',
    options: [
      'Move up to product line or group rare codes into “Other”, or use frequency or smoothed out-of-fold target encoding fitted on the training data.',
      'One-hot encode all 12,000 codes and drop one.',
      'Label-encode the codes as 0 to 11,999.',
      'Use the product code as a number, since it is already numeric.',
    ],
    answer: 0,
    feedback: {
      1: 'That creates 11,999 sparse columns, most based on one or two orders, and fails on new products.',
      2: 'The codes’ order is arbitrary, so linear and distance-based models would read meaning into it.',
      3: 'A code is a label, not a quantity: product 5000 is not “more” than product 4999.',
    },
    solution: 'High-cardinality variables need compact, fitted encodings or a coarser level, with a plan for products that appear after training.',
  },
  {
    id: 'b02-enc-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A tool ordinal-encodes roast without being told the order and produces dark 0, light 1, medium 2. What is wrong, and what else should you check?',
    options: [
      'It used alphabetical order: give it light < medium < dark, and check that equal steps are plausible.',
      'Nothing: any consistent integer codes are fine for ordinal data, as long as each roast always gets the same code.',
      'Ordinal codes must start at 1, not 0.',
      'Roast is nominal, so it should never be ordinal-encoded.',
    ],
    answer: 0,
    feedback: {
      1: 'The codes must follow the real order, or the model learns a scrambled one.',
      2: 'Starting at 0 or 1 makes no difference to the model; the order does.',
      3: 'Roast has a real order from light to dark, so it is ordinal.',
    },
    solution: 'Alphabetical order scrambles light, medium, dark. Supply the order explicitly; then remember that one column with one coefficient assumes equal steps, and use one-hot encoding if that is implausible.',
  },
];
