// summarising-data.ex.js — B01 · Summarising data: changes, averages and spread: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// The weighted-average widget starts from Lantern's July web and app counts (case.js); every other business and figure
// is fictional.
import { SHOP as S } from './case.js?v=13';

const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const signed = (v, d = 2) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`;
const round2 = (v) => Math.round(v * 100) / 100;

// Forty fictional December order values ($): many one- and two-pack orders, some gift boxes, two bulk orders.
const DEC_ORDERS = [14, 14, 16.5, 16.5, 17, 19.5, 19.5, 19.5, 22, 22, 22, 28, 28, 28, 28, 30.5, 33, 33, 35.5, 36, 39, 39, 41.5, 44, 46, 46, 49.5, 52, 58, 58, 58, 64, 72, 78, 98, 98, 116, 140, 175, 240];

export const widgets = {
  'sum-change': {
    type: 'formula',
    title: 'Percentage points and relative change',
    intro: 'Two values of a rate, such as a conversion rate in two months.',
    inputs: [
      { id: 'old', label: 'Old rate', min: 0.5, max: 20, step: 0.1, value: 3.0, fmt: 'pct' },
      { id: 'nw', label: 'New rate', min: 0.5, max: 20, step: 0.1, value: 2.6, fmt: 'pct' },
    ],
    compute: (v) => {
      const pp = v.nw - v.old;
      const rel = (v.nw / v.old - 1) * 100;
      return {
        headline: { label: 'Change in percentage points', value: `${signed(pp, 1)} points` },
        rows: [
          ['Relative change', `${signed(rel, 1)}%`],
          ['New rate ÷ old rate', (v.nw / v.old).toFixed(3)],
          ['How not to write it', Math.abs(pp) < 1e-9 ? '—' : `“${pp > 0 ? 'up' : 'down'} ${Math.abs(pp).toFixed(1)}%”`],
        ],
        note: Math.abs(pp) < 1e-9
          ? 'The two rates are equal: no change in points or in relative terms.'
          : `From ${pct(v.old, 1)} to ${pct(v.nw, 1)} is ${signed(pp, 1)} percentage points and a relative change of ${signed(rel, 1)}%. The relative change is ${Math.abs(rel / pp).toFixed(1)} times the change in points here${v.old < 2 ? ': from a small base, a small change in points becomes a large relative change' : ''}. Writing “${Math.abs(pp).toFixed(1)}%” would describe neither.`,
        chart: { kind: 'bar', x: { label: 'Rate', values: ['Old rate', 'New rate'] }, series: [{ name: 'Rate (%)', values: [v.old, v.nw] }], y: { label: 'Rate (%)', format: 'pct' } },
      };
    },
  },
  'sum-orders': {
    type: 'distribution',
    values: DEC_ORDERS,
    label: 'December order value ($), a fictional sample of 40 orders',
    transforms: ['none', 'log'],
    rules: ['iqr'],
  },
  'sum-weighted': {
    type: 'formula',
    title: 'Overall conversion as a weighted average',
    intro: 'Two channels, each with its own visits and conversion rate. Starts at Lantern’s July figures.',
    inputs: [
      { id: 'wv', label: 'Website visits', min: 1000, max: 15000, step: 100, value: S.webVisits[0], fmt: 'int', unit: 'visits' },
      { id: 'wc', label: 'Website conversion', min: 0.5, max: 6, step: 0.01, value: round2(S.webOrders[0] / S.webVisits[0] * 100), fmt: 'pct' },
      { id: 'av', label: 'App visits', min: 500, max: 10000, step: 100, value: S.appVisits[0], fmt: 'int', unit: 'visits' },
      { id: 'ac', label: 'App conversion', min: 0.5, max: 6, step: 0.01, value: round2(S.appOrders[0] / S.appVisits[0] * 100), fmt: 'pct' },
    ],
    compute: (v) => {
      const total = v.wv + v.av;
      const overall = (v.wv * v.wc + v.av * v.ac) / total;
      const plain = (v.wc + v.ac) / 2;
      const ws = (v.wv / total) * 100;
      return {
        headline: { label: 'Overall conversion rate (weighted by visits)', value: pct(overall) },
        rows: [
          ['Website share of visits', pct(ws, 1)],
          ['Orders implied (visits × rate)', `${Math.round(v.wv * v.wc / 100 + v.av * v.ac / 100)}`],
          ['Plain average of the two rates', pct(plain)],
          ['Plain average minus weighted average', `${signed(plain - overall)} points`],
        ],
        note: Math.abs(plain - overall) < 0.005
          ? 'The plain and weighted averages agree, because the channels have equal visits or equal rates.'
          : `The website has ${pct(ws, 1)} of the visits, so its rate counts for that share of the overall rate. The plain average treats the channels as equal and is ${Math.abs(plain - overall).toFixed(2)} points ${plain > overall ? 'too high' : 'too low'}. Move visits from one channel to the other without changing either rate: the overall rate moves anyway.`,
        chart: { kind: 'bar', x: { label: 'Rate', values: ['Website', 'App', 'Overall (weighted)', 'Plain average'] }, series: [{ name: 'Conversion (%)', values: [v.wc, v.ac, round2(overall), round2(plain)] }], y: { label: 'Conversion (%)', format: 'pct' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-sum-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional online shop’s checkout completion rate (orders ÷ checkouts started × 100) rose from 40% in March to 46% in April. Describe the change both ways.',
    solution: 'In points: 46 − 40 = 6 percentage points. Relative: (46 − 40) ÷ 40 × 100 = 15%. Both are correct; “rose 6%” would be wrong.',
    steps: [
      { id: 'b01-sum-g1-s1', type: 'num', prompt: 'By how many percentage points did the rate change?',
        answer: 6, check: () => 46 - 40, unit: 'percentage points', places: 0, tol: 0.05,
        hints: ['For a difference between two percentages, subtract them.'],
        wrong: [{ value: 15, say: 'That is the relative change. In points, subtract: 46 − 40.' }] },
      { id: 'b01-sum-g1-s2', type: 'num', prompt: 'What was the relative (percentage) change?',
        answer: 15, check: () => (46 - 40) / 40 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Percentage change = (new − old) ÷ old × 100.', 'The base is March’s 40%.'],
        wrong: [
          { value: 6, say: 'That is the change in percentage points. Divide it by the old rate.' },
          { value: 13.04, say: 'You divided by the new rate, 46. The base is the old value, 40.' },
        ] },
    ],
  },
  {
    id: 'b01-sum-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional fitness app’s monthly active users grew from 20,000 in January to 29,282 in May, with different growth each month. What was the average monthly growth rate, compounded? Give a percentage to one decimal place.',
    answer: 10, check: () => ((29282 / 20000) ** (1 / 4) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    hints: ['January to May is four monthly steps, not five.', 'g = (29,282 ÷ 20,000)^(1/4) − 1.'],
    wrong: [
      { value: 11.6, say: 'That divides the total growth, 46.41%, by four. Growth compounds: take the fourth root of 1.4641 instead.' },
      { value: 46.41, say: 'That is the total growth over the four months. The question asks for the monthly rate.' },
      { value: 7.92, say: 'You used five periods. January to May is four steps.' },
    ],
    solution: 'Total growth factor = 29,282 ÷ 20,000 = 1.4641. Over four steps, g = 1.4641^(1/4) − 1 = 1.1 − 1 = 10.0% a month. Check: 20,000 × 1.1⁴ = 29,282.',
  },
  {
    id: 'b01-sum-g3', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery chain has two shops. Shop A’s average rating is 4.6 from 300 ratings; shop B’s is 4.0 from 100 ratings. What is the chain’s average rating across all 400 ratings? Give two decimal places.',
    answer: 4.45, check: () => (300 * 4.6 + 100 * 4.0) / 400, unit: 'stars', places: 2, tol: 0.005,
    hints: ['Each shop’s average should count in proportion to how many ratings it represents.', 'Total stars = 300 × 4.6 + 100 × 4.0. Divide by 400.'],
    wrong: [{ value: 4.3, say: 'That is the plain average of the two shops. Shop A has three times as many ratings, so its average must count three times as much.' }],
    solution: 'Weighted average = (300 × 4.6 + 100 × 4.0) ÷ 400 = (1,380 + 400) ÷ 400 = 4.45 stars. The plain average, 4.3, gives the smaller shop as much say as the larger one.',
  },
  {
    id: 'b01-sum-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the most suitable summary for each question about a fictional online shop.',
    items: [
      'Which delivery region is most common?',
      'What does a typical order cost, in a month with a few very large bulk orders?',
      'How much revenue should we budget for 600 orders?',
      'What is the middle customer rating on the 1–5 scale?',
      'How spread out are delivery times, given that a few parcels were lost for weeks?',
      'How spread out are the weights of bags filled by a machine, which are roughly symmetric around 250 g?',
    ],
    categories: ['Mode', 'Median', 'Mean', 'Interquartile range', 'Standard deviation'],
    answer: [0, 1, 2, 1, 3, 4],
    hints: ['Region is nominal: only one average works for it.', 'Ask whether extreme values are present, and whether the question is about a typical value or a total.'],
    feedback: {
      1: 'A few huge orders pull the mean up; the median describes the typical order.',
      2: 'Totals come from the mean: mean × count = total.',
      4: 'A few extreme values inflate the standard deviation; the IQR describes the middle half and ignores them.',
      5: 'For roughly symmetric data without extremes, the standard deviation uses every value and pairs with the mean.',
    },
    solution: 'Region: the mode (nominal data). Typical order with extremes: the median. Budgeting a total: the mean. Middle rating: the median (ordinal data). Spread with extremes: the IQR. Spread of symmetric data: the standard deviation.',
  },
];

export const independent = [
  {
    id: 'b01-sum-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional florist’s online orders on seven days were 12, 15, 9, 31, 14, 11 and 13. What is the median number of orders a day?',
    answer: 13, check: () => [12, 15, 9, 31, 14, 11, 13].sort((a, b) => a - b)[3], unit: 'orders', places: 0, tol: 0.05,
    wrong: [
      { value: 15, say: 'That is the mean (105 ÷ 7). The median is the middle value once the values are sorted.' },
      { value: 31, say: 'That is the middle of the list as given. Sort the values first: 9, 11, 12, 13, 14, 15, 31.' },
    ],
    solution: 'Sorted: 9, 11, 12, 13, 14, 15, 31. With n = 7 the median is at position (7 + 1) ÷ 2 = 4: 13 orders. The mean is 15, pulled up by the 31.',
  },
  {
    id: 'b01-sum-i2', type: 'num', kind: 'numerical',
    prompt: 'Find the sample standard deviation of 4, 8, 6 and 2. Give two decimal places.',
    answer: 2.58, check: () => Math.sqrt(((4 - 5) ** 2 + (8 - 5) ** 2 + (6 - 5) ** 2 + (2 - 5) ** 2) / 3), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 2.24, say: 'You divided by n = 4. A sample standard deviation divides the sum of squares by n − 1 = 3.' },
      { value: 6.67, tol: 0.05, say: 'That is the variance (20 ÷ 3). Take its square root.' },
    ],
    solution: 'Mean = 20 ÷ 4 = 5. Distances: −1, 3, 1, −3; squares 1, 9, 1, 9, summing to 20. Divide by n − 1 = 3: 6.667. Square root: s ≈ 2.58.',
  },
  {
    id: 'b01-sum-i3', type: 'rows', kind: 'applied',
    prompt: 'A fictional retailer’s monthly report describes these changes. Select every row whose “Reported as” is wrong.',
    data: { table: {
      head: ['Measure', 'Before', 'After', 'Reported as'],
      rows: [
        ['Conversion rate', '2.5%', '3.0%', '+0.5 percentage points'],
        ['Return rate', '8%', '6%', '−2%'],
        ['Orders', '400', '500', '+25%'],
        ['Email open rate', '20%', '25%', '+25%'],
        ['Market share', '10%', '12%', '+2%'],
        ['Average order value', '$40', '$44', '+10%'],
        ['Cancellation rate', '5%', '4%', '−20%'],
      ],
    } },
    answer: [1, 4],
    solution: 'The return rate fell 2 percentage points (a relative fall of 25%), not 2%; market share rose 2 percentage points (a relative rise of 20%), not 2%. The open rate’s +25% and the cancellation rate’s −20% are correct relative changes, though adding the change in points (+5 and −1) would help readers.',
  },
  {
    id: 'b01-sum-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional online shop had 20,000 website visits converting at 2.0% and 5,000 app visits converting at 4.0%. What was its overall conversion rate? Give a percentage to one decimal place.',
    answer: 2.4, check: () => (20000 * 0.02 + 5000 * 0.04) / 25000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 3, say: 'That is the plain average of the two rates. The website has four times the app’s visits, so weight each rate by its visits.' }],
    solution: 'Orders = 20,000 × 0.02 + 5,000 × 0.04 = 400 + 200 = 600. Overall = 600 ÷ 25,000 × 100 = 2.4%. As a weighted average: 0.8 × 2.0% + 0.2 × 4.0% = 2.4%.',
  },
  {
    id: 'b01-sum-i5', type: 'mc', kind: 'applied',
    prompt: 'A fictional consultancy completed 20 projects last year: 18 with fees between $5,000 and $15,000, and two large ones at $400,000 each. Its brochure wants to describe a typical project fee. Which summary should it use?',
    options: [
      'The median fee',
      'The mean fee',
      'The range of fees',
      'The total fees divided by 18',
    ],
    answer: 0,
    feedback: {
      1: 'The two $400,000 projects add $800,000 and drag the mean above $40,000, higher than every one of the other 18 fees.',
      2: 'The range describes spread, not a typical value, and here it is driven entirely by the two large projects.',
      3: 'There were 20 projects; dividing by 18 gives a meaningless figure.',
    },
    solution: 'With two extreme values, the mean is far above what most clients paid. The median, which depends only on the middle values, sits within the $5,000–$15,000 range of the typical project.',
  },
  {
    id: 'b01-sum-i6', type: 'num', kind: 'numerical',
    prompt: 'A new product’s weekly sales went from 4 units to 14 units. What was the percentage change?',
    answer: 250, check: () => (14 - 4) / 4 * 100, unit: '%', places: 0, tol: 0.05,
    wrong: [
      { value: 10, say: 'That is the absolute change in units. Divide it by the starting value, 4.' },
      { value: 71.43, say: 'You divided by the new value. The base is the old value, 4.' },
      { value: 350, say: 'That is the new value as a percentage of the old (14 ÷ 4 × 100). Subtract 100 to get the change.' },
    ],
    solution: 'Percentage change = (14 − 4) ÷ 4 × 100 = 250%. A small base makes the percentage dramatic; report the 10 extra units beside it.',
  },
];

export const check = [
  {
    id: 'b01-sum-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A conversion rate rose from 2.0% to 2.5%. Which statement is correct?',
    options: [
      'It rose by 0.5 percentage points, or 25% in relative terms.',
      'It rose by 0.5%, which is the same as 0.5 percentage points.',
      'It rose by 25 percentage points, or 0.5% in relative terms.',
      'It rose by 2.5 percentage points, to a rate of 2.5%.',
    ],
    answer: 0,
    feedback: {
      1: 'A relative rise of 0.5% would take 2.0% to 2.01%. Percent and percentage points are not interchangeable.',
      2: 'The two figures are swapped: 0.5 is the change in points and 25% the relative change.',
      3: '2.5% is the new rate, not the change. In points the change is 2.5 − 2.0 = 0.5.',
    },
    solution: 'In points: 2.5 − 2.0 = 0.5. Relative: 0.5 ÷ 2.0 × 100 = 25%.',
  },
  {
    id: 'b01-sum-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional roastery’s annual revenue grew from $50,000 to $72,000 over three years. What was its compound annual growth rate? Give a percentage to one decimal place.',
    answer: 12.9, check: () => ((72000 / 50000) ** (1 / 3) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 14.67, say: 'That divides the total growth, 44%, by three. Growth compounds: take the cube root of 1.44.' },
      { value: 44, say: 'That is the total growth over three years, not the yearly rate.' },
    ],
    solution: 'g = (72,000 ÷ 50,000)^(1/3) − 1 = 1.44^(1/3) − 1 ≈ 12.9% a year. Check: 50,000 × 1.129³ ≈ 72,000.',
  },
  {
    id: 'b01-sum-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional online shop took 300 orders in October with an average order value of $40, and 100 orders in November with an AOV of $60. What was its AOV over the two months together, in dollars?',
    answer: 45, check: () => (300 * 40 + 100 * 60) / 400, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 50, say: 'That is the plain average of the two AOVs. October had three times as many orders, so weight each AOV by its orders.' }],
    solution: 'Revenue = 300 × 40 + 100 × 60 = 12,000 + 6,000 = $18,000 from 400 orders. AOV = 18,000 ÷ 400 = $45.',
  },
  {
    id: 'b01-sum-k4', type: 'classify', kind: 'conceptual',
    prompt: 'For each variable, which averages are meaningful, given its level of measurement?',
    items: ['Product name', 'Star rating (1 to 5)', 'Order value in dollars', 'Delivery region', 'Roast level (light, medium, dark)', 'Packs ordered'],
    categories: ['The mode only', 'The median and the mode', 'The mean, the median and the mode'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      1: 'Ratings are ordered, so the median works; their steps aren’t guaranteed equal, so the mean is a convenience rather than strictly meaningful.',
      4: 'Roast levels are ordered categories: the median roast is meaningful, a mean roast is not.',
      5: 'A count of packs is a ratio variable: every average works.',
    },
    solution: 'Nominal (product, region): the mode only. Ordinal (rating, roast level): the median and the mode. Ratio (order value, packs): all three.',
  },
  {
    id: 'b01-sum-k5', type: 'fill', kind: 'applied',
    prompt: 'Complete the sentences for a fictional shop’s monthly report.',
    text: 'The returning-customer share rose from 30% to 36%: up [[0]], a relative rise of [[1]]. Visits rose from 8,000 to 10,000, up [[2]].',
    blanks: [
      { options: ['6 percentage points', '6%', '20 percentage points'], answer: 0 },
      { options: ['20%', '6%', '16.7%'], answer: 0 },
      { options: ['25%', '20%', '2,000 percentage points'], answer: 0 },
    ],
    solution: 'The share changed by 36 − 30 = 6 percentage points, a relative rise of 6 ÷ 30 = 20%. Visits are a count, so their change is a plain percentage: 2,000 ÷ 8,000 = 25%.',
  },
  {
    id: 'b01-sum-k6', type: 'num', kind: 'numerical',
    prompt: 'Nine fictional delivery times, in days, sorted: 3, 4, 6, 7, 9, 10, 12, 15, 30. Using quartiles by linear interpolation (position 1 + (n − 1)p), what is the interquartile range, in days?',
    answer: 6, check: () => { const s = [3, 4, 6, 7, 9, 10, 12, 15, 30]; return s[1 + 8 * 0.75 - 1] - s[1 + 8 * 0.25 - 1]; }, unit: 'days', places: 0, tol: 0.05,
    wrong: [
      { value: 27, say: 'That is the range (30 − 3). The IQR is Q3 − Q1.' },
      { value: 9, say: 'That is the median. The IQR is the gap between the third and first quartiles.' },
    ],
    solution: 'n = 9. Q1 is at position 1 + 8 × 0.25 = 3: 6 days. Q3 is at position 1 + 8 × 0.75 = 7: 12 days. IQR = 12 − 6 = 6 days. Unlike the range, it ignores the 30-day parcel.',
  },
];
