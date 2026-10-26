// sampling-distributions.ex.js — B04 · Sampling distributions: widgets, practice and the knowledge check (answer keys
// live here). Lantern's orders, subscription flags and channel counts come from case.js; Tollgate Bike Hire, Westcliff
// Gym, Cragside Events, Sedgefield Dairy, Ambleside Hotel and the Whitlow Trust are fictional. Formula items are marked
// by their results on the sheet and on copies with the numbers changed; num items recompute their answers in `check`.
import { ORDER_VALUES, SUBSCRIPTION_FLAGS, CHANNEL_SUBSCRIPTION, DERIVED as D } from './case.js?v=19';
import * as I from '../../../core/inference.js?v=19';

const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const usd = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const ORDINARY = ORDER_VALUES.filter((x) => x !== D.orders.max);

// Tollgate Bike Hire (fictional): rental durations, mean 95 min, SD 48 min, skewness about 1
const RENT = { mu: 95, sigma: 48, n: 64, cut: 105 };
const rentSE = RENT.sigma / Math.sqrt(RENT.n), rentZ = (RENT.cut - RENT.mu) / rentSE;
// Cragside Events (fictional): 400 invoices in the year, SD $220, audit sample of 80
const AUDIT = { N: 400, n: 80, sigma: 220 };
const auditSE = (AUDIT.sigma / Math.sqrt(AUDIT.n)) * Math.sqrt((AUDIT.N - AUDIT.n) / (AUDIT.N - 1));
// Lantern: app orders
const APP = CHANNEL_SUBSCRIPTION.counts[1][0] + CHANNEL_SUBSCRIPTION.counts[1][1];
const pApp = APP / D.orders.n, seApp = Math.sqrt((pApp * (1 - pApp)) / 80), zApp = (0.5 - pApp) / seApp;
// Sedgefield Dairy (fictional): bottles N(1006, 2.5) ml; averages of 25 bottles
const MILK = { mu: 1006, sigma: 2.5, n: 25, xbar: 1005.1, cut: 1005 };
const milkSE = MILK.sigma / Math.sqrt(MILK.n);

export const widgets = {
  'sd-orders': {
    type: 'sampling', title: 'Samples from Lantern’s 231 spring orders, the population',
    population: ORDER_VALUES, label: 'spring orders', units: 'dollars', stat: 'mean', sizes: [5, 10, 30, 100], n: 30, seed: 11, places: 2,
    note: 'Compare the “SD of the means” with σ ÷ √n: they agree at every size. The shape is another matter. At n = 30 the means form a main hump in the low $30s and a second, smaller one about $50 higher, from the samples that include the $1,512 office order; even at n = 100 the histogram is lopsided.',
  },
  'sd-ordinary': {
    type: 'sampling', title: 'Samples from the 230 orders without the office order',
    population: ORDINARY, label: 'spring orders without LC-10144', units: 'dollars', stat: 'mean', sizes: [5, 10, 30, 100], n: 10, seed: 11, places: 2,
    note: 'These orders are still right-skewed (SKEW about 2.3), so samples of 5 give lopsided means. By n = 30 the histogram follows the dashed normal curve closely, with a slightly longer right tail.',
  },
  'sd-subs': {
    type: 'sampling', title: 'Sample proportions of subscription orders',
    population: SUBSCRIPTION_FLAGS, label: 'spring orders (1 = subscription)', stat: 'proportion', sizes: [10, 20, 50, 100], n: 50, seed: 5,
    note: 'The population is 104 subscriptions among 231 orders, 45.0%. At n = 50 the standard error is √(0.45 × 0.55 ÷ 50) ≈ 0.070, about 7 points: most sample proportions land between about 31% and 59%.',
  },
  'sd-se': {
    type: 'formula', title: 'The standard error and the finite population correction',
    intro: 'Set the population’s standard deviation, the sample size and the population size.',
    inputs: [
      { id: 'sigma', label: 'Population SD (σ)', min: 5, max: 200, step: 1, value: 101, fmt: 'money' },
      { id: 'n', label: 'Sample size (n)', min: 2, max: 231, step: 1, value: 30, fmt: 'int' },
      { id: 'N', label: 'Population size (N)', min: 231, max: 20000, step: 1, value: 231, fmt: 'int' },
    ],
    compute: (v) => {
      const se0 = v.sigma / Math.sqrt(v.n), f = Math.sqrt((v.N - v.n) / (v.N - 1)), share = v.n / v.N;
      const xs = [5, 10, 20, 30, 50, 100, 150, 200].filter((k) => k <= v.N);
      return {
        headline: { label: 'Standard error without replacement', value: `$${(se0 * f).toFixed(2)}` },
        rows: [['σ ÷ √n (with replacement)', `$${se0.toFixed(2)}`], ['Correction √((N − n) ÷ (N − 1))', f.toFixed(4)], ['Sample as a share of the population', `${(share * 100).toFixed(1)}%`]],
        note: share > 0.05
          ? `The sample is ${(share * 100).toFixed(1)}% of the population, more than 5%, so the correction matters: it cuts the standard error by ${((1 - f) * 100).toFixed(1)}%.`
          : `The sample is only ${(share * 100).toFixed(1)}% of the population, so the correction changes the standard error by ${((1 - f) * 100).toFixed(1)}%: ignore it.`,
        chart: { kind: 'line', x: { label: 'Sample size (n)', values: xs }, series: [{ name: 'σ ÷ √n', values: xs.map((k) => Number((v.sigma / Math.sqrt(k)).toFixed(3))) }, { name: 'With the correction', values: xs.map((k) => Number(((v.sigma / Math.sqrt(k)) * Math.sqrt((v.N - k) / (v.N - 1))).toFixed(3))) }], y: { label: 'Standard error ($)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b04-sd-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each number as a parameter (it describes a whole population) or a statistic (it is calculated from a sample).',
    items: [
      'The mean of all 231 spring orders, which Ana treats as her population: $39.38',
      'The mean of 30 orders Ana drew at random from those 231: $31.20',
      'The share of all the bags Kilnworth fills that weigh under 1,000 g',
      'Five of the 40 bags Ana weighed were under 1,000 g: 12.5%',
      `The standard deviation of the ${D.kg.n} bags Ana weighed: ${D.kg.sd.toFixed(2)} g`,
      'The share of all Lantern’s customers who would recommend it to a friend',
    ],
    categories: ['Parameter', 'Statistic'],
    answer: [0, 1, 0, 1, 1, 0],
    hints: ['Ask: is the number about everything the question concerns, or about the part that was observed?', 'The 40 bags and the 30 orders are samples; Kilnworth’s whole output and all customers are populations.'],
    feedback: {
      2: 'Nobody has weighed every bag, so this share is unknown, but it is still a parameter: a fixed number describing the whole population.',
      5: 'B01’s survey estimated this from 79 replies; the share among all customers is the parameter those replies estimate.',
    },
    solution: 'Parameters: the mean of the 231 orders (taken as the population), the share of all Kilnworth bags under 1,000 g, the share of all customers who would recommend Lantern. Statistics: the mean of the 30 sampled orders, the 12.5% of Ana’s 40 bags, the standard deviation of those 40 bags. Parameters are fixed but usually unknown; statistics vary from sample to sample.',
  },
  {
    id: 'b04-sd-g2', type: 'formula', kind: 'numerical',
    prompt: 'Tollgate Bike Hire (fictional) knows that its rental durations have a standard deviation of 48 minutes (B1). In B4, calculate the standard error of the mean duration of a random sample of the size in B2.',
    sheet: { cells: { A1: 'Population SD (min)', B1: RENT.sigma, A2: 'Sample size', B2: 36, A4: 'Standard error (min)' }, vary: { B2: [49, 64] } },
    cell: 'B4', answer: '=B1/SQRT(B2)',
    alt: ['=B1/B2^0.5', '=B1*SQRT(1/B2)', '=B1/POWER(B2,0.5)'],
    view: 'A1:B4', formats: { B4: '0.00' }, widths: { A: 20 },
    wrong: [
      { formula: '=B1/B2', say: 'The standard error divides by the square root of n, not by n: averaging n values cuts the spread by √n.' },
      { formula: '=SQRT(B1/B2)', say: 'Take the square root of n only: σ ÷ √n. The square root of σ ÷ n has the wrong units (square roots of minutes).' },
      { formula: '=B1*SQRT(B2)', say: 'Larger samples give less variable means, so the standard error must fall as n grows: divide by √n.' },
    ],
    hints: ['Standard error of the mean = σ ÷ √n.', '<x>=B1/SQRT(B2)</x>'],
    solution: '<x>=B1/SQRT(B2)</x> = 48 ÷ √36 = 48 ÷ 6 = 8 minutes. A sample of 36 rentals has a mean that typically lies within about 8 minutes of the true mean duration.',
  },
  {
    id: 'b04-sd-g3', type: 'steps', kind: 'numerical',
    prompt: 'Tollgate’s rental durations have mean 95 minutes and standard deviation 48 minutes, with a moderate right skew (skewness about 1). It checks a random sample of 64 rentals each month. How often will the sample’s mean duration exceed 105 minutes by chance?',
    solution: `SE = 48 ÷ √64 = 6 minutes; z = (105 − 95) ÷ 6 = ${rentZ.toFixed(2)}; P(Z > ${rentZ.toFixed(2)}) = ${I.normSf(rentZ).toFixed(4)}, about ${pc(I.normSf(rentZ))}. Skewness about 1 needs n above 25 by Cochran’s rule (25 × 1²), so 64 is enough for the normal model.`,
    steps: [
      {
        id: 'b04-sd-g3-s0', type: 'order',
        prompt: 'First, put the method in order.',
        items: [
          'Check that the sample is random and large enough for the population’s skewness.',
          'Find the standard error of the mean, σ ÷ √n.',
          'Standardise the cut-off: z = (105 − 95) ÷ standard error.',
          'Find the area above z.',
          'Say how often the sample’s mean will exceed 105 minutes.',
        ],
        hints: ['The normal model is only worth using once its condition is met.', 'Condition, standard error, z, area, interpretation.'],
      },
      {
        id: 'b04-sd-g3-s1', type: 'num',
        prompt: 'What is the standard error of the mean of 64 rentals, in minutes?',
        answer: rentSE, check: () => RENT.sigma / Math.sqrt(RENT.n), unit: 'min', places: 2, tol: 0.01,
        wrong: [{ value: RENT.sigma / RENT.n, say: 'Divide by √64 = 8, not by 64.' }, { value: RENT.sigma, say: 'That is the standard deviation of single rentals. A mean of 64 varies less: σ ÷ √n.' }],
        hints: ['σ ÷ √n', '48 ÷ 8'],
        solution: '48 ÷ √64 = 48 ÷ 8 = 6 minutes.',
      },
      {
        id: 'b04-sd-g3-s2', type: 'num',
        prompt: 'How many standard errors above the mean is a sample mean of 105 minutes? Give two decimal places.',
        answer: Math.round(rentZ * 100) / 100, check: () => (RENT.cut - RENT.mu) / (RENT.sigma / Math.sqrt(RENT.n)), unit: '', places: 2, tol: 0.005,
        wrong: [{ value: Math.round(((RENT.cut - RENT.mu) / RENT.sigma) * 100) / 100, say: 'That divides by σ, which measures single rentals. For a sample mean, divide by the standard error, 6.' }],
        hints: ['z = (x̄ − μ) ÷ SE', '(105 − 95) ÷ 6'],
        solution: `z = (105 − 95) ÷ 6 = ${rentZ.toFixed(2)}.`,
      },
      {
        id: 'b04-sd-g3-s3', type: 'num',
        prompt: 'What percentage of months will the sample mean exceed 105 minutes? Give one decimal place.',
        answer: Math.round(I.normSf(rentZ) * 1000) / 10, check: () => I.normal.sf(RENT.cut, RENT.mu, RENT.sigma / Math.sqrt(RENT.n)) * 100, unit: '%', places: 1, tol: 0.1,
        wrong: [
          { value: Math.round(I.normSf((RENT.cut - RENT.mu) / RENT.sigma) * 1000) / 10, say: 'That is the share of single rentals over 105 minutes (using σ). A mean of 64 rentals is far less variable: use the standard error.' },
          { value: Math.round(I.normCdf(rentZ) * 1000) / 10, say: 'That is the area below z = 1.67. The question asks how often the mean exceeds 105: the area above.' },
        ],
        hints: ['The area above z = 1.67.', '<x>=1-NORM.DIST(105,95,6,TRUE)</x>'],
        solution: `<x>=1-NORM.DIST(105,95,6,TRUE)</x> = ${I.normSf(rentZ).toFixed(4)}: in about ${pc(I.normSf(rentZ))} of months, roughly one in 21, chance alone pushes the sample’s mean above 105 minutes.`,
      },
    ],
  },
  {
    id: 'b04-sd-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement of the central limit theorem is correct?',
    options: [
      'For large enough n, the sample mean’s distribution is close to normal, whatever the population.',
      'For large enough n, the values in a sample are close to normally distributed, whatever the population.',
      'Once n reaches 30, a sample mean is equal to the population mean apart from rounding errors.',
      'For large enough n, the population itself becomes normal, because rare values are averaged away.',
    ],
    answer: 0,
    hints: ['The theorem is about a statistic, not about the data.'],
    feedback: {
      1: 'A large sample of skewed values is still skewed: it resembles the population. It is the mean that becomes normal.',
      2: 'The sample mean still varies, with standard error σ ÷ √n; the theorem describes the shape of that variation.',
      3: 'Sampling doesn’t change the population. The theorem describes how the sample mean behaves.',
    },
    solution: 'The central limit theorem concerns the sampling distribution of the mean: as n grows, it approaches a normal distribution with mean μ and standard error σ ÷ √n, whatever the population’s shape. How large n must be depends on the population’s skewness.',
  },
];

export const independent = [
  {
    id: 'b04-sd-i1', type: 'formula', kind: 'numerical',
    prompt: 'Westcliff Gym (fictional) knows that the share of its members who use the sauna is in B1. In B4, calculate the standard error of the proportion in a random sample of the size in B2.',
    sheet: { cells: { A1: 'Population proportion', B1: 0.3, A2: 'Sample size', B2: 60, A4: 'Standard error' }, vary: { B1: [0.25, 0.4], B2: [40, 80] } },
    cell: 'B4', answer: '=SQRT(B1*(1-B1)/B2)',
    alt: ['=(B1*(1-B1)/B2)^0.5', '=SQRT(B1*(1-B1))/SQRT(B2)'],
    view: 'A1:B4', formats: { B1: '0%', B4: '0.0000' }, widths: { A: 22 },
    wrong: [
      { formula: '=B1*(1-B1)/B2', say: 'That is the variance of the sample proportion. The standard error is its square root.' },
      { formula: '=SQRT(B1*(1-B1))/B2', say: 'Divide by √n, not n: √(p(1 − p) ÷ n).' },
      { formula: '=SQRT(B1/B2)', say: 'The variance of one 0/1 value is p(1 − p), not p. Use √(p(1 − p) ÷ n).' },
    ],
    solution: `<x>=SQRT(B1*(1-B1)/B2)</x> = √(0.3 × 0.7 ÷ 60) = ${Math.sqrt(0.21 / 60).toFixed(4)}: a sample of 60 members typically gives a proportion within about 6 points of 30%.`,
  },
  {
    id: 'b04-sd-i2', type: 'num', kind: 'numerical',
    prompt: 'Cragside Events (fictional) issued 400 invoices this year, with a standard deviation of $220. Its auditor draws 80 of them at random without replacement. What is the standard error of the sample’s mean invoice, with the finite population correction? Give dollars to the cent.',
    answer: Math.round(auditSE * 100) / 100, check: () => (AUDIT.sigma / Math.sqrt(AUDIT.n)) * Math.sqrt((AUDIT.N - AUDIT.n) / (AUDIT.N - 1)), unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: Math.round((AUDIT.sigma / Math.sqrt(AUDIT.n)) * 100) / 100, say: 'That leaves out the correction. Eighty of 400 is 20% of the population, so multiply by √((400 − 80) ÷ 399).' },
      { value: Math.round((AUDIT.sigma / Math.sqrt(AUDIT.n)) * ((AUDIT.N - AUDIT.n) / (AUDIT.N - 1)) * 100) / 100, say: 'The correction factor is the square root of (N − n) ÷ (N − 1). You multiplied by the fraction itself.' },
    ],
    solution: `σ ÷ √n = 220 ÷ √80 = ${usd(AUDIT.sigma / Math.sqrt(AUDIT.n))}; the correction is √(320 ÷ 399) = ${Math.sqrt(320 / 399).toFixed(4)}; the standard error is ${usd(auditSE)}. The sample is 20% of the population, well above 5%, so the correction matters.`,
  },
  {
    id: 'b04-sd-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Ana wants about 40 of the 231 spring orders for a packing-quality check. Classify each plan by its sampling design.',
    items: [
      'Number the orders 1 to 231, put <x>=RAND()</x> beside each, sort by it and take the first 40',
      'Choose a random start between 1 and 6, then take every 6th order in date order',
      'Split the orders by region and draw at random within each region in proportion to its orders',
      'Pick 21 of the 122 spring days at random and take every order placed on those days (about 40, at 1.9 a day)',
      'Take the first 40 orders that come up when she opens the export',
    ],
    categories: ['Simple random', 'Systematic', 'Stratified', 'Cluster', 'Convenience'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'One random start, then a fixed interval: systematic. It is random only in its starting point.',
      3: 'Whole groups (days) are chosen and everything in them is kept: cluster sampling.',
      4: 'Whatever is easiest to reach is a convenience sample, and the export’s first rows are the earliest March orders.',
    },
    solution: 'RAND and sort: simple random. A random start and every kth: systematic. Random draws within regions in proportion: stratified. Random days with every order on them: cluster. The first rows of the export: convenience, not random at all.',
  },
  {
    id: 'b04-sd-i4', type: 'multi', kind: 'applied',
    prompt: 'Norland Pharmacy (fictional) plans an email survey of its loyalty-card customers. Select all the problems that sending it to a much larger number of customers would NOT fix.',
    options: [
      'Customers who are happy with the pharmacy are more likely to reply than unhappy customers.',
      'The list holds only customers who signed up online, so in-store sign-ups are missing.',
      'One question asks customers “How much do you love our new longer opening hours?”',
      'With only 50 replies, the share who are satisfied varies a lot from one sample to the next.',
      'A satisfaction score of 7.4 could come out at 7.1 or 7.7 from another sample this size.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'This is sampling error, and more replies do reduce it: the standard error falls with √n.',
      4: 'Chance variation between samples is exactly what a larger sample shrinks.',
    },
    solution: 'Non-response bias (who replies), a frame that misses part of the population, and a leading question (measurement bias) push every sample in the same direction, however large. A bigger sample only reduces sampling error, the chance variation in the last two options.',
  },
  {
    id: 'b04-sd-i5', type: 'num', kind: 'applied',
    prompt: `${APP} of the 231 spring orders came through the app. If Ana draws 80 of the orders at random (with replacement), what is the probability, by the normal model, that more than half of the sample are app orders? Use the normal model for p̂ without a continuity correction, and give the percentage to one decimal place.`,
    answer: Math.round(I.normSf(zApp) * 1000) / 10, check: () => I.normSf((0.5 - APP / 231) / Math.sqrt(((APP / 231) * (1 - APP / 231)) / 80)) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [
      { value: Math.round(I.normCdf(zApp) * 1000) / 10, say: 'That is the chance that half or fewer are app orders. “More than half” is the area above z.' },
      { value: Math.round(I.normSf((0.5 - pApp) / ((pApp * (1 - pApp)) / 80)) * 1000) / 10, say: 'The standard error is the square root of p(1 − p) ÷ n. Without the square root it is far too small.' },
    ],
    solution: `p = ${APP} ÷ 231 = ${pApp.toFixed(4)}; SE = √(${pApp.toFixed(4)} × ${(1 - pApp).toFixed(4)} ÷ 80) = ${seApp.toFixed(4)}; z = (0.5 − ${pApp.toFixed(4)}) ÷ ${seApp.toFixed(4)} = ${zApp.toFixed(2)}; area above ≈ ${pc(I.normSf(zApp))}. The normal model is fine here: 80 × ${pApp.toFixed(2)} ≈ ${(80 * pApp).toFixed(0)} and 80 × ${(1 - pApp).toFixed(2)} ≈ ${(80 * (1 - pApp)).toFixed(0)} are both well above 10.`,
  },
  {
    id: 'b04-sd-i6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about standard errors.',
    text: 'To halve the standard error of a sample mean, multiply the sample size by [[0]]. The standard error measures how much [[1]] vary from sample to sample. The finite population correction matters when the sample is more than about [[2]] of the population. A larger sample reduces [[3]] but not bias.',
    blanks: [
      { options: ['2', '4', '√2'], answer: 1 },
      { options: ['sample means', 'individual values', 'population means'], answer: 0 },
      { options: ['50%', '30 members', '5%'], answer: 2 },
      { options: ['non-response bias', 'sampling error', 'measurement bias'], answer: 1 },
    ],
    solution: 'SE = σ ÷ √n, so halving it needs √n to double: four times the sample. It describes the variation of sample means, not of single values. The correction is used above about 5% of the population (OpenStax’s guide). Only sampling error shrinks with n.',
  },
];

export const check = [
  {
    id: 'b04-sd-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana draws 1,000 random samples of 30 spring orders and plots their means. The histogram is clearly skewed to the right, with a second small hump. What is the best explanation?',
    options: [
      'One $1,512 order makes the population so skewed that 30 is too small for the mean to be normal.',
      'The central limit theorem holds only for populations that are themselves normal, and these orders are not.',
      'A sample of 30 is too large: the theorem works best for small samples, which average out the extremes.',
      'Ana must have made a mistake in drawing the samples, because means of 30 values are always normal.',
    ],
    answer: 0,
    feedback: {
      1: 'The theorem holds for almost any population as n grows; for a normal population the mean is normal at every n.',
      2: 'It is the other way round: the larger n, the closer to normal.',
      3: '30 is a rule of thumb, not a guarantee. With one extreme value, about 12% of samples contain it and form their own hump.',
    },
    solution: 'The central limit theorem says the mean becomes normal as n grows, not that 30 is always enough. Lantern’s orders have skewness 13.7; Cochran’s rule (n > 25 × skewness²) asks for thousands. At n = 30 the samples that contain the office order form a second hump about $50 higher.',
  },
  {
    id: 'b04-sd-k2', type: 'formula', kind: 'numerical',
    prompt: 'Sedgefield Dairy (fictional) fills bottles with mean (B1) and standard deviation (B2) in millilitres. An inspector measures a random sample of the size in B4 and gets the mean in B3. In B6, calculate how many standard errors the sample mean lies from the population mean.',
    sheet: { cells: { A1: 'Population mean (ml)', B1: MILK.mu, A2: 'Population SD (ml)', B2: MILK.sigma, A3: 'Sample mean (ml)', B3: MILK.xbar, A4: 'Sample size', B4: MILK.n, A6: 'z' }, vary: { B1: [1005.5, 1006.5], B3: [1005.6, 1006.8] } },
    cell: 'B6', answer: '=(B3-B1)/(B2/SQRT(B4))',
    alt: ['=(B3-B1)*SQRT(B4)/B2', '=STANDARDIZE(B3,B1,B2/SQRT(B4))'],
    view: 'A1:B6', formats: { B6: '0.00' }, widths: { A: 20 },
    wrong: [
      { formula: '=(B3-B1)/B2', say: 'That measures the gap in standard deviations of single bottles. A mean of 25 bottles varies less: divide by the standard error, B2/SQRT(B4).' },
      { formula: '=STANDARDIZE(B3,B1,B2)', say: 'STANDARDIZE with σ treats the mean as one bottle. Give it the standard error as standard_dev: B2/SQRT(B4).' },
      { formula: '=(B3-B1)/(B2/B4)', say: 'The standard error divides σ by √n, not by n.' },
    ],
    solution: `<x>=(B3-B1)/(B2/SQRT(B4))</x>: SE = 2.5 ÷ √25 = 0.5 ml, so z = (1,005.1 − 1,006) ÷ 0.5 = ${((MILK.xbar - MILK.mu) / milkSE).toFixed(2)}. The sample mean is 1.8 standard errors below the target, though only 0.36 standard deviations of a single bottle.`,
  },
  {
    id: 'b04-sd-k3', type: 'num', kind: 'numerical',
    prompt: 'Sedgefield’s bottles have mean 1,006 ml and standard deviation 2.5 ml. What is the probability that the mean of a random sample of 25 bottles is below 1,005 ml? Give the percentage to two decimal places.',
    answer: Math.round(I.normal.cdf(MILK.cut, MILK.mu, milkSE) * 10000) / 100, check: () => I.normal.cdf(MILK.cut, MILK.mu, MILK.sigma / Math.sqrt(MILK.n)) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round(I.normal.cdf(MILK.cut, MILK.mu, MILK.sigma) * 10000) / 100, say: 'That is the share of single bottles below 1,005 ml (standard deviation 2.5). The mean of 25 bottles has standard error 0.5 ml.' },
      { value: Math.round(I.normal.sf(MILK.cut, MILK.mu, milkSE) * 10000) / 100, say: 'That is the probability that the mean is above 1,005 ml. Below is the lower tail.' },
    ],
    solution: `SE = 2.5 ÷ √25 = 0.5 ml; z = (1,005 − 1,006) ÷ 0.5 = −2; P = ${I.normCdf(-2).toFixed(4)}, about ${(I.normCdf(-2) * 100).toFixed(2)}%. Single bottles below 1,005 ml are common (about 34%); a mean of 25 that low is rare. Bottle volumes from a steady filler are close to normal, so the normal model holds even for n = 25.`,
  },
  {
    id: 'b04-sd-k4', type: 'mc', kind: 'applied',
    prompt: 'Tamarind Kitchen (fictional) emailed a feedback survey to 400 diners and 120 replied. It could send the next one to 4,000 diners and expect about 1,200 replies. What would the larger survey change?',
    options: [
      'It would shrink the sampling error, but not any bias from the kind of diner who chooses to reply.',
      'It would remove non-response bias, because 1,200 replies are enough to represent all the diners.',
      'It would raise the response rate, because a larger mailing reaches more diners who like to reply.',
      'It would change nothing, because the standard error depends on the share replying, not the number.',
    ],
    answer: 0,
    feedback: {
      1: 'If happier diners are keener to reply, 1,200 replies are just as tilted as 120, only more precisely so.',
      2: 'The response rate is 30% either way; only the number of replies grows.',
      3: 'The standard error depends on the number of replies, n: √(p(1 − p) ÷ 1,200) is about a third of √(p(1 − p) ÷ 120).',
    },
    solution: 'Ten times the replies cuts the standard error by √10, about a factor of 3. Non-response bias, if the diners who reply differ from those who don’t, stays exactly as large. To reduce it, raise the response rate or follow up the diners who didn’t reply, a question for survey design (M04).',
  },
  {
    id: 'b04-sd-k5', type: 'formula', kind: 'applied',
    prompt: 'Ambleside Hotel (fictional) reviews a random sample of its guest stays this month, drawn without replacement: B1 holds the standard deviation of spend per night, B2 the sample size and B3 the number of stays in the month. In B5, calculate the standard error of the sample’s mean spend, with the finite population correction.',
    sheet: { cells: { A1: 'SD of spend per night ($)', B1: 45, A2: 'Stays sampled', B2: 60, A3: 'Stays in the month', B3: 300, A5: 'Standard error ($)' }, vary: { B2: [50, 75] } },
    cell: 'B5', answer: '=B1/SQRT(B2)*SQRT((B3-B2)/(B3-1))',
    alt: ['=B1/SQRT(B2)*((B3-B2)/(B3-1))^0.5', '=SQRT(B1^2/B2*(B3-B2)/(B3-1))'],
    view: 'A1:B5', formats: { B5: '0.00' }, widths: { A: 24 },
    wrong: [
      { formula: '=B1/SQRT(B2)', say: 'That leaves out the correction. Sixty of 300 stays is 20% of the month, so multiply by √((N − n) ÷ (N − 1)).' },
      { formula: '=B1/SQRT(B2)*(B3-B2)/(B3-1)', say: 'The correction factor is a square root: √((B3 − B2) ÷ (B3 − 1)).' },
      { formula: '=B1/SQRT(B3)', say: 'The standard error depends on the sample size, B2. The population size enters only through the correction.' },
    ],
    solution: `<x>=B1/SQRT(B2)*SQRT((B3-B2)/(B3-1))</x> = 45 ÷ √60 × √(240 ÷ 299) = ${(45 / Math.sqrt(60)).toFixed(3)} × ${Math.sqrt(240 / 299).toFixed(4)} = ${usd((45 / Math.sqrt(60)) * Math.sqrt(240 / 299))}.`,
  },
  {
    id: 'b04-sd-k6', type: 'num', kind: 'numerical',
    prompt: 'The Whitlow Trust (fictional), a charity, finds that its online donations have a skewness of 4.0. By Cochran’s rule, a sample mean of donations behaves normally enough for a standard 95% interval when n exceeds what number?',
    answer: 400, check: () => 25 * 4 ** 2, unit: '', places: 0, tol: 0.5,
    wrong: [
      { value: 100, say: 'The rule squares the skewness: 25 × 4² = 25 × 16.' },
      { value: 30, say: '30 is the general rule of thumb, which is too small for a population this skewed.' },
      { value: 16, say: '16 is the skewness squared. Cochran’s rule multiplies it by 25.' },
    ],
    solution: 'n > 25 × skewness² = 25 × 4.0² = 25 × 16 = 400. A few large gifts make donation data strongly skewed, so samples need to be far larger than 30 before their means behave normally.',
  },
];
