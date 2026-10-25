// discrete-distributions.ex.js — B04 · Discrete distributions: widgets, practice and the knowledge check (answer keys
// live here). Lantern's subscription share and orders per day come from case.js; the café client's weekly bags, the
// online bookshop, the autumn quotes and the gift-box markdown are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { DERIVED as D, ORDERS_PER_DAY } from './case.js?v=13';
import { variance } from '../../../core/stats.js?v=13';
import { binomPmf, binomCdf, binomSf, poissonPmf, poissonCdf, poissonSf, exponCdf } from '../../../core/inference.js?v=13';

const f = (v, d = 3) => v.toFixed(d);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const P = D.orders.subscriptionShare, LAM = D.perDay.lambda, CNT = D.perDay.counts, EXP = D.perDay.expected;
const DAYS = sum(CNT);
// a café client's weekly order of 1 kg bags (fictional)
const BAGS = [0, 1, 2, 3], PB = [0.1, 0.3, 0.4, 0.2];
const EB = sum(BAGS.map((x, i) => x * PB[i])), SB = Math.sqrt(sum(BAGS.map((x, i) => (x - EB) ** 2 * PB[i])));
// the gift-box stall with a $25 January price (fictional)
const DEMAND = [[10, 0.2], [20, 0.4], [30, 0.3], [40, 0.1]];
const profit = (q, d, salvage) => 58 * Math.min(q, d) + salvage * Math.max(0, q - d) - 20 * q;
const eProfit = (q, salvage) => sum(DEMAND.map(([d, p]) => profit(q, d, salvage) * p));
const ED = sum(DEMAND.map(([d, p]) => d * p));

// ---------------------------------------------------------------- widgets
export const widgets = {
  'dv-binomial': {
    type: 'curve', title: 'Subscriptions among the next 20 orders: a binomial distribution',
    dist: 'binomial', params: { n: 20, p: P }, vary: ['n', 'p'],
    asks: ['above', 'exact', 'below', 'between'], a: 12, b: 14,
    xLabel: 'Subscriptions in n orders',
    note: `With p = 104/231 ≈ ${f(P)}, P(X ≥ 12) ≈ ${f(binomSf(11, 20, P), 4)}, and the mean is np ≈ ${f(20 * P, 2)}. Excel’s “at least 12” subtracts the cumulative probability up to 11.`,
  },
  'dv-poisson': {
    type: 'curve', title: 'Orders on a spring day: a Poisson distribution',
    dist: 'poisson', params: { lambda: LAM }, vary: ['lambda'],
    asks: ['exact', 'below', 'above'], a: 0,
    xLabel: 'Orders on the day',
    note: `λ = 231/122 ≈ ${f(LAM)}. P(X = 0) ≈ ${f(poissonPmf(0, LAM), 4)}, so the model expects about ${f(DAYS * poissonPmf(0, LAM), 1)} of the ${DAYS} days to have no orders; ${CNT[0]} did.`,
  },
  'dv-fit': {
    type: 'chart', kind: 'bar', title: 'Spring days by number of orders: observed, and expected from a Poisson model',
    x: { label: 'Orders on the day', values: ['0', '1', '2', '3', '4', '5 or more'] },
    series: [
      { name: 'Observed days', values: CNT.slice(0, 6) },
      { name: `Expected days (Poisson, λ = ${f(LAM)})`, values: [...EXP.slice(0, 5), DAYS * poissonSf(4, LAM)].map((v) => Number(v.toFixed(1))) },
    ],
    y: { label: 'Days', format: 'num' },
    note: 'The expected days are 122 × POISSON.DIST(k, λ, FALSE) with λ = 231/122, and 122 × (1 − POISSON.DIST(4, λ, TRUE)) for five or more. Module 4 tests whether gaps this size could be chance.',
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'b04-dv-g1', type: 'steps', kind: 'numerical',
    prompt: 'A café client’s weekly order of 1 kg bags follows this distribution (fictional): 0 bags with probability 0.1, 1 bag 0.3, 2 bags 0.4, 3 bags 0.2. The values are in A2:A5 and the probabilities in B2:B5.',
    solution: `E(X) = 0 × 0.1 + 1 × 0.3 + 2 × 0.4 + 3 × 0.2 = ${f(EB, 1)} bags: <x>=SUMPRODUCT(A2:A5,B2:B5)</x>. Variance Σ(x − 1.7)²P(x) = 2.89 × 0.1 + 0.49 × 0.3 + 0.09 × 0.4 + 1.69 × 0.2 = 0.81, so σ = 0.9 bags. Over many weeks the client averages 1.7 bags a week, typically within about one bag of that.`,
    steps: [
      {
        id: 'b04-dv-g1-s1', type: 'formula',
        prompt: 'In D2, calculate the expected number of bags a week, E(X).',
        sheet: { cells: { A1: 'Bags (x)', B1: 'P(x)', D1: 'E(X)', A2: 0, A3: 1, A4: 2, A5: 3, B2: 0.1, B3: 0.3, B4: 0.4, B5: 0.2 } },
        cell: 'D2', answer: '=SUMPRODUCT(A2:A5,B2:B5)',
        alt: ['=A2*B2+A3*B3+A4*B4+A5*B5', '=SUM(A2:A5*B2:B5)'],
        view: 'A1:D5', formats: { B: '0.00', D: '0.00' },
        wrong: [
          { formula: '=AVERAGE(A2:A5)', say: 'AVERAGE treats the four values as equally likely. An expected value weights each value by its probability: SUMPRODUCT(A2:A5,B2:B5).' },
          { formula: '=SUMPRODUCT(A2:A5,B2:B5)/COUNT(A2:A5)', say: 'The probabilities already do the averaging: they add to 1, so don’t divide again.' },
          { formula: '=SUM(B2:B5)', say: 'That adds the probabilities, which always gives 1. Multiply each value by its probability first.' },
        ],
        hints: ['E(X) = Σ x × P(x): multiply each value by its probability and add.', 'SUMPRODUCT multiplies two ranges pair by pair and adds the products.'],
      },
      {
        id: 'b04-dv-g1-s2', type: 'num',
        prompt: `E(X) = ${f(EB, 1)}. What is the standard deviation of the weekly order? Give two decimal places.`,
        answer: Number(f(SB, 2)), check: () => Math.sqrt(sum(BAGS.map((x, i) => (x - EB) ** 2 * PB[i]))), unit: 'bags', places: 2, tol: 0.01,
        wrong: [
          { value: 0.81, say: 'That is the variance, Σ(x − μ)²P(x). The standard deviation is its square root.' },
          { value: Number(f(Math.sqrt(sum(BAGS.map((x) => (x - 1.5) ** 2)) / 4), 2)), say: 'That treats the four values as equally likely. Weight each squared distance from 1.7 by its probability.' },
        ],
        hints: ['Variance = Σ (x − 1.7)² × P(x).', '2.89 × 0.1 + 0.49 × 0.3 + 0.09 × 0.4 + 1.69 × 0.2, then take the square root.'],
      },
      {
        id: 'b04-dv-g1-s3', type: 'mc',
        prompt: 'What does E(X) = 1.7 bags mean for Ana?',
        options: [
          'Over many weeks, the client’s orders average out at 1.7 bags a week.',
          'In most weeks the client orders 1.7 bags, which is rounded up to 2 bags.',
          'The client orders at least one bag in 70% of weeks, on average.',
          'The client is certain to order between 1 and 2 bags in any week.',
        ],
        answer: 0,
        feedback: {
          1: 'No week has 1.7 bags. 2 bags is the most likely single order (probability 0.4), but the expected value is a long-run average.',
          2: 'At least one bag has probability 0.3 + 0.4 + 0.2 = 0.9, and that is a different quantity from E(X).',
          3: 'Orders of 0 and 3 bags happen too, with probabilities 0.1 and 0.2.',
        },
        hints: ['An expected value is a probability-weighted average.'],
      },
    ],
  },
  {
    id: 'b04-dv-g2', type: 'num', kind: 'numerical',
    prompt: 'Five of Ana’s café clients each reorder in a given week with probability 0.45, independently of each other (fictional). What is the probability that exactly 2 of the 5 reorder this week? Give four decimal places.',
    answer: Number(f(binomPmf(2, 5, 0.45), 4)), check: () => 10 * 0.45 ** 2 * 0.55 ** 3, unit: '', places: 4, tol: 0.0005,
    wrong: [
      { value: Number(f(0.45 ** 2 * 0.55 ** 3, 4)), say: 'That is the probability of one particular sequence, such as the first two reordering and the other three not. There are C(5, 2) = 10 such sequences.' },
      { value: Number(f(binomCdf(2, 5, 0.45), 4)), say: 'That is P(X ≤ 2), the cumulative probability. “Exactly 2” is a single bar: BINOM.DIST(2,5,0.45,FALSE).' },
      { value: Number(f(0.45 ** 2, 4)), say: 'You left out the three clients who don’t reorder, each with probability 0.55, and the number of ways to choose the two.' },
    ],
    hints: ['P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ.', 'C(5, 2) = 10; multiply by 0.45² × 0.55³.'],
    solution: `P(X = 2) = C(5, 2) × 0.45² × 0.55³ = 10 × 0.2025 × 0.166375 ≈ ${f(binomPmf(2, 5, 0.45), 4)}, or <x>=BINOM.DIST(2,5,0.45,FALSE)</x>. Two reorders is in fact the most likely number this week.`,
  },
  {
    id: 'b04-dv-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Which distribution is the natural first model for each quantity?',
    items: [
      'The number of subscriptions among the next 20 orders',
      'The number of shop orders placed in one hour on a Saturday',
      'The weight of coffee in a 1 kg bag',
      'The number of dented cans in a case of 12, if each can is dented with probability 0.02 independently',
      'The number of complaints Lantern receives in a week',
      'The time until the next order arrives',
    ],
    categories: ['Binomial', 'Poisson', 'Neither: a continuous quantity'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      1: 'There is no fixed number of trials: orders arrive over an interval, which suggests the Poisson.',
      3: 'A fixed number of cans (12), two outcomes, the same p and independence: binomial.',
      5: 'A time can take any value, so it is continuous. For Poisson arrivals it follows an exponential distribution.',
    },
    hints: ['Binomial: a fixed number of trials, each a success or not. Poisson: events counted over an interval.', 'Weights and times are measured, not counted.'],
    solution: 'Counts of successes in a fixed number of trials (subscriptions in 20 orders, dented cans in 12) are binomial. Counts of events in an interval (orders in an hour, complaints in a week) are Poisson. Weights and waiting times are continuous: the normal and the exponential are models for them.',
  },
  {
    id: 'b04-dv-g4', type: 'formula', kind: 'applied',
    prompt: 'B1 holds λ, the spring’s average orders a day (231 orders ÷ 122 days). In D2, calculate the Poisson probability that a day has at least 3 orders.',
    sheet: { cells: { A1: 'Orders a day (λ)', B1: '=B3/B4', A3: 'Spring orders', B3: 231, A4: 'Spring days', B4: 122, D1: 'P(at least 3)' } },
    cell: 'D2', answer: '=1-POISSON.DIST(2,B1,TRUE)',
    alt: ['=1-POISSON.DIST(0,B1,FALSE)-POISSON.DIST(1,B1,FALSE)-POISSON.DIST(2,B1,FALSE)'],
    view: 'A1:D4', formats: { B1: '0.000', D: '0.0000' }, widths: { A: 17, D: 13 },
    wrong: [
      { formula: '=1-POISSON.DIST(3,B1,TRUE)', say: 'That is 1 − P(X ≤ 3) = P(X ≥ 4). “At least 3” is 1 − P(X ≤ 2).' },
      { formula: '=POISSON.DIST(3,B1,FALSE)', say: 'That is P(exactly 3). At least 3 includes 3, 4, 5 and more: 1 − P(X ≤ 2).' },
      { formula: '=1-POISSON.DIST(2,B1,FALSE)', say: 'FALSE gives P(exactly 2). Subtract the cumulative P(X ≤ 2), with TRUE.' },
    ],
    hints: ['“At least 3” is the complement of “at most 2”.', '<x>=1-POISSON.DIST(2,B1,TRUE)</x>'],
    solution: `<x>=1-POISSON.DIST(2,B1,TRUE)</x> = 1 − ${f(poissonCdf(2, LAM), 4)} = ${f(poissonSf(2, LAM), 4)}. Over 122 days the model expects about ${f(DAYS * poissonSf(2, LAM), 1)} such days; the spring had ${CNT[3] + CNT[4] + CNT[5]}.`,
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'b04-dv-i1', type: 'formula', kind: 'numerical',
    prompt: 'B1 holds the number of orders (20), B2 the probability that an order is a subscription and B3 a threshold. In B5, calculate the binomial probability of at least B3 subscriptions among the B1 orders.',
    sheet: { cells: { A1: 'Orders (n)', B1: 20, A2: 'P(subscription)', B2: Number(P.toFixed(4)), A3: 'At least', B3: 12, A5: 'P(X ≥ threshold)' }, fixed: ['B1'], vary: { B3: [10, 13, 14] } },
    cell: 'B5', answer: '=1-BINOM.DIST(B3-1,B1,B2,TRUE)',
    alt: ['=BINOM.DIST.RANGE(B1,B2,B3,B1)', '=1-BINOM.DIST(B3-1,B1,B2,1)'],
    view: 'A1:B5', formats: { B2: '0.0000', B5: '0.0000' }, widths: { A: 17 },
    wrong: [
      { formula: '=1-BINOM.DIST(B3,B1,B2,TRUE)', say: 'That is 1 − P(X ≤ 12) = P(X > 12), which leaves out 12 itself. Subtract the cumulative probability up to B3 − 1.' },
      { formula: '=BINOM.DIST(B3,B1,B2,FALSE)', say: 'That is the probability of exactly B3 subscriptions. “At least” adds every count from B3 up to n.' },
      { formula: '=1-BINOM.DIST(11,B1,B2,TRUE)', say: 'Typing 11 works only while the threshold is 12. Use B3-1 so the formula follows the threshold in B3.' },
    ],
    solution: `<x>=1-BINOM.DIST(B3-1,B1,B2,TRUE)</x>: with a threshold of 12, 1 − P(X ≤ 11) ≈ ${f(binomSf(11, 20, 0.4502), 4)}. <x>=BINOM.DIST.RANGE(B1,B2,B3,B1)</x> gives the same probability as a range from B3 to n.`,
  },
  {
    id: 'b04-dv-i2', type: 'num', kind: 'numerical',
    prompt: `With λ = ${f(LAM)} orders a day, what is the Poisson probability of exactly 2 orders on a day? Calculate it from the formula and give three decimal places.`,
    answer: Number(f(poissonPmf(2, LAM))), check: () => Math.exp(-LAM) * LAM ** 2 / 2, unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: Number(f(poissonCdf(2, LAM))), say: 'That is P(X ≤ 2), the cumulative probability. “Exactly 2” is a single term: e^(−λ) λ² ÷ 2!.' },
      { value: Number(f(LAM ** 2 / 2)), say: 'You left out e^(−λ). Without it the “probability” is above 1.' },
      { value: Number(f(Math.exp(-LAM))), say: 'That is P(X = 0). For 2 orders multiply e^(−λ) by λ² ÷ 2!.' },
    ],
    solution: `P(X = 2) = e^(−${f(LAM)}) × ${f(LAM)}² ÷ 2! = ${f(Math.exp(-LAM), 4)} × ${f(LAM ** 2, 4)} ÷ 2 ≈ ${f(poissonPmf(2, LAM))}, or <x>=POISSON.DIST(2,231/122,FALSE)</x>. Over 122 days that is about ${f(DAYS * poissonPmf(2, LAM), 1)} days; ${CNT[2]} happened.`,
  },
  {
    id: 'b04-dv-i3', type: 'num', kind: 'numerical',
    prompt: 'An online bookshop (fictional) sends 400 orders a month, and each order is returned with probability 0.06, independently of the others. What is the standard deviation of the number of returns in a month? Give two decimal places.',
    answer: Number(f(Math.sqrt(400 * 0.06 * 0.94), 2)), check: () => Math.sqrt(400 * 0.06 * (1 - 0.06)), unit: 'returns', places: 2, tol: 0.01,
    wrong: [
      { value: 22.56, say: 'That is the variance np(1 − p). The standard deviation is its square root.' },
      { value: Number(f(Math.sqrt(24), 2)), say: 'That is √(np), the Poisson standard deviation. For a binomial multiply by 1 − p inside the root: √(np(1 − p)).' },
      { value: 24, say: 'That is the mean, np. The question asks for the spread around it.' },
    ],
    solution: 'Returns are binomial with n = 400 and p = 0.06: mean np = 24 and standard deviation √(400 × 0.06 × 0.94) = √22.56 ≈ 4.75 returns. A month with more than about 24 + 2 × 4.75 ≈ 33.5 returns would be unusual.',
  },
  {
    id: 'b04-dv-i4', type: 'mc', kind: 'applied',
    prompt: 'Ana models her orders per day with a Poisson distribution. Which observation would most undermine that model?',
    options: [
      'Orders jump on the day of every promotional email and fall back on the day after.',
      'The shop averages fewer than two orders a day, which is a very small number of events.',
      'No day in the spring brought more than five orders to the shop in a single day.',
      'The orders come from more than 200 different customers spread across the regions.',
    ],
    answer: 0,
    feedback: {
      1: 'The Poisson works for any rate, small or large; λ = 1.89 is fine.',
      2: 'With λ = 1.89, five or more orders has probability about 0.04, so a spring without busier days is consistent with the model.',
      3: 'Many separate customers support independence, one of the Poisson’s conditions.',
    },
    solution: 'The Poisson assumes a constant rate. Bursts after each email mean the rate changes from day to day, which makes very busy and very quiet days more common than the model predicts: the variance would exceed the mean. The other observations are consistent with, or support, the model.',
  },
  {
    id: 'b04-dv-i5', type: 'num', kind: 'applied',
    prompt: `Orders arrive at an average of ${f(LAM)} a day. If they follow a Poisson process, what is the probability that more than 12 hours pass between one order and the next? Give three decimal places.`,
    answer: Number(f(Math.exp(-LAM * 0.5))), check: () => 1 - exponCdf(0.5, LAM), unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: Number(f(exponCdf(0.5, LAM))), say: 'That is P(gap ≤ 12 hours), what EXPON.DIST with TRUE returns. “More than” is its complement.' },
      { value: Number(f(Math.exp(-LAM))), say: 'That is the probability of a gap of more than a whole day. 12 hours is 0.5 days: e^(−λ × 0.5).' },
      { value: Number(f(Math.exp(-LAM * 12), 3)), say: 'λ is per day, so time must be in days too: 12 hours = 0.5 days, not 12.' },
    ],
    solution: `The gap is exponential with rate λ = ${f(LAM)} per day, so P(gap > t) = e^(−λt) with t = 0.5 days: e^(−${f(LAM * 0.5, 4)}) ≈ ${f(Math.exp(-LAM * 0.5))}. In Excel, <x>=1-EXPON.DIST(0.5,231/122,TRUE)</x>. This assumes orders arrive at a constant rate around the clock, which real orders don’t.`,
  },
  {
    id: 'b04-dv-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the true statements about expected values.',
    options: [
      'An expected value can be a value that the random variable never actually takes.',
      'The expected value is the long-run average of the results over many repetitions.',
      'For a binomial count of successes in n trials, the expected value is np.',
      'The expected value is always the single most likely value of the variable.',
      'The expected profit always equals the profit you would make at the expected demand.',
      'Doubling every value doubles both the expected value and the standard deviation.',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'For orders per day E(X) = 1.89, which is not even possible; the most likely count is 1.',
      4: `Not when profit isn’t a straight-line function of demand: in the gift-box example, stocking 30 earns $${eProfit(30, 12)} on average but $${profit(30, ED, 12)} at the expected demand of ${ED} boxes.`,
    },
    solution: 'An expected value is a probability-weighted, long-run average (1.89 orders a day, which no day can have), and for a binomial it is np. Doubling every value doubles E(X) and the standard deviation (the variance is multiplied by 4). It needn’t be the most likely value, and when the outcome is not a straight-line function of the random variable (profit with leftover stock) the expected outcome differs from the outcome at the expected value.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'b04-dv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these counts meets all the conditions for a binomial distribution?',
    options: [
      'The number declined among 15 independent card payments, each declined with probability 0.03.',
      'The number of orders that arrive at the online shop during one busy hour on a Saturday afternoon.',
      'The number of orders Ana takes until the first subscription order of the day comes in.',
      'The number of 5-star ratings among all the orders rated so far this year, however many there are.',
    ],
    answer: 0,
    feedback: {
      1: 'There is no fixed number of trials: orders in an interval are a Poisson-type count.',
      2: 'The number of trials isn’t fixed; it is the count itself. That is a geometric distribution, not a binomial.',
      3: 'The number of rated orders isn’t fixed in advance, so n isn’t fixed.',
    },
    solution: 'The card payments have a fixed n (15), two outcomes, the same p (0.03) and independence: binomial, with mean 15 × 0.03 = 0.45. The other counts lack a fixed number of trials.',
  },
  {
    id: 'b04-dv-k2', type: 'formula', kind: 'numerical',
    prompt: 'Ana sends 24 catering quotes this autumn, and each is accepted with probability 0.35, independently (fictional). The number of quotes is in B1, the probability in B2 and a range of acceptances, from B3 to B4, below. In B6, calculate the probability that between B3 and B4 quotes, inclusive, are accepted.',
    sheet: { cells: { A1: 'Quotes (n)', B1: 24, A2: 'P(accepted)', B2: 0.35, A3: 'From', B3: 6, A4: 'To', B4: 10, A6: 'P(B3 ≤ X ≤ B4)' }, fixed: ['B1'], vary: { B3: [5, 7, 4], B4: [11, 9, 12] } },
    cell: 'B6', answer: '=BINOM.DIST.RANGE(B1,B2,B3,B4)',
    alt: ['=BINOM.DIST(B4,B1,B2,TRUE)-BINOM.DIST(B3-1,B1,B2,TRUE)'],
    view: 'A1:B6', formats: { B2: '0.00', B6: '0.0000' }, widths: { A: 16 },
    wrong: [
      { formula: '=BINOM.DIST(B4,B1,B2,TRUE)-BINOM.DIST(B3,B1,B2,TRUE)', say: 'Subtracting P(X ≤ B3) removes B3 itself from the range. Subtract P(X ≤ B3 − 1), or use BINOM.DIST.RANGE, which includes both ends.' },
      { formula: '=BINOM.DIST.RANGE(B2,B1,B3,B4)', say: 'BINOM.DIST.RANGE takes trials first, then the probability: BINOM.DIST.RANGE(B1,B2,B3,B4).' },
      { formula: '=BINOM.DIST(B4,B1,B2,FALSE)-BINOM.DIST(B3,B1,B2,FALSE)', say: 'FALSE gives single bars, so this is the difference between two bars, not the total of the range. Use the cumulative form or BINOM.DIST.RANGE.' },
    ],
    solution: `<x>=BINOM.DIST.RANGE(B1,B2,B3,B4)</x> = ${f(binomCdf(10, 24, 0.35) - binomCdf(5, 24, 0.35), 4)} for 6 to 10 acceptances. The same comes from <x>=BINOM.DIST(B4,B1,B2,TRUE)-BINOM.DIST(B3-1,B1,B2,TRUE)</x>. The mean is 24 × 0.35 = 8.4 acceptances.`,
  },
  {
    id: 'b04-dv-k3', type: 'num', kind: 'numerical',
    prompt: `Using a Poisson model with λ = ${f(LAM)} orders a day, on how many of the 122 spring days would you expect at most one order? Give one decimal place.`,
    answer: Number(f(DAYS * poissonCdf(1, LAM), 1)), check: () => 122 * (poissonPmf(0, LAM) + poissonPmf(1, LAM)), unit: 'days', places: 1, tol: 0.2,
    wrong: [
      { value: Number(f(DAYS * poissonPmf(1, LAM), 1)), say: 'That is the expected number of days with exactly one order. “At most one” includes days with none: POISSON.DIST(1, λ, TRUE).' },
      { value: Number(f(DAYS * poissonPmf(0, LAM), 1)), say: 'That counts only the days with no orders. Add the days with exactly one.' },
      { value: Number(f(poissonCdf(1, LAM), 1)), say: 'That is the probability for a single day. Multiply by the 122 days for the expected number of days.' },
    ],
    solution: `P(X ≤ 1) = e^(−λ)(1 + λ) ≈ ${f(poissonCdf(1, LAM), 4)}, or <x>=POISSON.DIST(1,231/122,TRUE)</x>; × 122 ≈ ${f(DAYS * poissonCdf(1, LAM), 1)} days. The spring had ${CNT[0] + CNT[1]} (${CNT[0]} + ${CNT[1]}), very close.`,
  },
  {
    id: 'b04-dv-k4', type: 'num', kind: 'applied',
    prompt: 'For the Christmas market stall (Gift Box Trio $58, cost $20; demand 10, 20, 30 or 40 boxes with probabilities 0.2, 0.4, 0.3, 0.1), suppose leftover boxes could be sold in January for $18 instead of $12. What is the expected profit from taking 30 boxes? Give whole dollars.',
    answer: eProfit(30, 18), check: () => 0.2 * (58 * 10 + 18 * 20 - 600) + 0.4 * (58 * 20 + 18 * 10 - 600) + 0.4 * (58 * 30 - 600), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: eProfit(30, 12), say: 'That uses the old $12 January price. Recalculate each outcome with leftovers at $18.' },
      { value: profit(30, ED, 18), say: `That is the profit at the expected demand of ${ED} boxes. The expected profit weights the profit for each demand by its probability, which gives a different answer.` },
      { value: profit(30, 30, 18), say: 'That assumes all 30 boxes sell. Demand of 10 or 20 boxes has probability 0.6.' },
    ],
    solution: `Profits with 30 boxes: demand 10 → 580 + 18 × 20 − 600 = $${profit(30, 10, 18)}; demand 20 → 1,160 + 180 − 600 = $${profit(30, 20, 18)}; demand 30 or 40 → $${profit(30, 30, 18).toLocaleString('en-US')}. Expected profit = 0.2 × ${profit(30, 10, 18)} + 0.4 × ${profit(30, 20, 18)} + 0.4 × ${profit(30, 30, 18).toLocaleString('en-US')} = $${eProfit(30, 18)}. A leftover box now costs only $${20 - 18} instead of $8, so carrying extra stock is cheap: 40 boxes would earn $${eProfit(40, 18)} on average, slightly more, at the price of a wider spread.`,
  },
  {
    id: 'b04-dv-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Ana models the number of subscriptions among her next 20 orders as binomial with p = 0.45. Select all the facts that would make the model wrong.',
    options: [
      'Several of the 20 orders will come from the same monthly subscriber.',
      'Most of the next 20 orders will come through the app, where subscriptions are more common.',
      'Ana will stop counting as soon as she has seen 9 subscription orders.',
      'The number of subscriptions can only be a whole number from 0 up to the 20 orders.',
      'The expected number of subscriptions, 9.0, happens to be a whole number this time.',
      'Every one of the 20 orders either is a subscription order or is not one.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A count from 0 to n is exactly what a binomial describes.',
      4: 'The mean np needn’t be a whole number, and whether it is has no bearing on the conditions.',
      5: 'Two outcomes per trial is one of the binomial’s conditions, not a problem.',
    },
    solution: 'Repeat orders from one subscriber break independence; a mostly-app mix changes p from 0.45; stopping at 9 subscriptions means n isn’t fixed. Whole-number counts from 0 to 20 and two outcomes per order are what the binomial assumes, and the mean needn’t be a whole number.',
  },
  {
    id: 'b04-dv-k6', type: 'mc', kind: 'applied',
    prompt: `Ana compares her spring days with a Poisson model (λ = ${f(LAM)}): observed ${CNT.join(', ')} days with 0 to 5 orders, against ${[...EXP.slice(0, 5), DAYS * poissonSf(4, LAM)].map((v) => f(v, 1)).join(', ')} expected (the last for 5 or more). The days’ variance is ${f(variance(ORDERS_PER_DAY))} against a mean of ${f(LAM)}. What should she conclude?`,
    options: [
      'The model describes the days well enough to plan with, and a formal test of the fit comes later.',
      'The model is proven correct, which shows that her customers order independently of each other.',
      'The model fails, because the observed and expected days are not equal in any of the six rows.',
      'The model fails, because a Poisson needs at least 30 events a day before it can be used at all.',
    ],
    answer: 0,
    feedback: {
      1: 'A close fit is consistent with the conditions but doesn’t prove them, and a model is never proven by one sample.',
      2: 'Observed counts always differ a little from expected ones by chance. The question is whether the gaps are larger than chance, which module 4 tests.',
      3: 'The Poisson has no minimum rate; it is often used for small counts like these.',
    },
    solution: 'The observed and expected days are close in every row, and the variance is close to the mean, as a Poisson model implies. That supports using the model for planning, with two cautions: the chi-square goodness-of-fit test in module 4 checks whether the gaps could be chance, and a good fit doesn’t prove why orders behave this way.',
  },
];
