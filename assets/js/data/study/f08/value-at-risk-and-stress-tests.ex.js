// value-at-risk-and-stress-tests.ex.js — F08 · Value at Risk and stress tests: widgets, practice and the knowledge check.
// Figures from case.js (BOOK, BOOK_RETURNS — F06's SIMULATED monthly returns — OPT, INDEX_FUTURES); every num item's
// `check` recomputes its answer with core/risk.js or by hand.
import { BOOK, BOOK_VALUE as V, BOOK_RETURNS as R, OPT as O, INDEX_FUTURES as IF } from './case.js?v=40';
import { historical, parametric, kupiec } from '../../../core/risk.js?v=40';

const usd = (x) => `${x < 0 ? '−' : ''}$${Math.round(Math.abs(x)).toLocaleString('en-US')}`;

export const widgets = {
  'vr-explorer': {
    type: 'formula', title: 'VaR and expected shortfall for Hollis’s book',
    intro: '$500,000; 180 simulated months, January 2013 – December 2027 (F06).',
    inputs: [
      { id: 'c', label: 'Confidence level', min: 90, max: 99.5, step: 0.5, value: 95, fmt: 'pct' },
      { id: 'hist', label: 'Method (1 = historical, 0 = normal)', min: 0, max: 1, step: 1, value: 1, fmt: 'int' },
      { id: 'h', label: 'Horizon (months)', min: 1, max: 12, step: 1, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      const c = v.c / 100, m = v.hist ? historical(R, c, v.h) : parametric(R, c, v.h);
      const months = R.filter((x) => x * V < -historical(R, c).var * V).length;
      const edges = Array.from({ length: 17 }, (_, i) => -0.14 + 0.02 * i);
      const counts = edges.slice(0, -1).map((lo, i) => R.filter((x) => x >= lo && (i === 15 ? x <= edges[16] : x < edges[i + 1])).length);
      return {
        headline: { label: `${v.h}-month ${v.c}% VaR (${v.hist ? 'historical' : 'normal'})`, value: usd(m.var * V) },
        rows: [['Expected shortfall', usd(m.es * V)], ['VaR as a share of the book', `${(m.var * 100).toFixed(2)}%`], ['Months in the sample worse than the one-month historical VaR', `${months} of 180`], ['Worst month in the sample', usd(Math.min(...R) * V)]],
        note: v.h > 1 ? `Scaled by √${v.h} from one month${v.hist ? '' : ', with the mean scaled by the horizon'}: valid only if months are independent.` : c >= 0.99 && v.hist ? 'At this confidence the historical figure rests on very few months.' : 'One month in twenty (at 95%) should lose more than this.',
        chart: { kind: 'bar', x: { label: 'Monthly return (bin starting at, %)', values: edges.slice(0, -1).map((e) => Math.round(e * 100)) },
          series: [{ name: 'Months', values: counts }], y: { label: 'Number of months', format: 'num' } },
      };
    },
  },
  'vr-stress': {
    type: 'formula', title: 'A stress test of Hollis’s book',
    intro: 'Brightcup $42,000, market fund $308,000, bond fund $150,000. Hedges: 1,000 Brightcup $40 puts; index futures (one contract = $250,000).',
    inputs: [
      { id: 'b', label: 'Brightcup', min: -80, max: 20, step: 5, value: -40, fmt: 'pct' },
      { id: 'm', label: 'Market fund', min: -50, max: 20, step: 5, value: -20, fmt: 'pct' },
      { id: 'd', label: 'Bond fund', min: -15, max: 10, step: 1, value: 2, fmt: 'pct' },
      { id: 'puts', label: 'Puts held (1 = yes, 0 = no)', min: 0, max: 1, step: 1, value: 1, fmt: 'int' },
      { id: 'fut', label: 'Index contracts sold', min: 0, max: 2, step: 1, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      const book = BOOK.brightcup * v.b / 100 + BOOK.market * v.m / 100 + BOOK.bonds * v.d / 100;
      const puts = v.puts ? Math.max(40 - O.S * (1 + v.b / 100), 0) * O.holding : 0, fut = -v.fut * IF.level * IF.multiplier * v.m / 100;
      return {
        headline: { label: 'Change in value with the hedges chosen', value: usd(book + puts + fut) },
        rows: [['Book alone', usd(book)], ['Puts', usd(puts)], ['Index futures', usd(fut)], ['As a multiple of the 95% one-month VaR', `${(-(book + puts + fut) / (historical(R, 0.95).var * V)).toFixed(1)}×`]],
        note: book + puts + fut > 0 ? 'The hedges more than offset the book in this scenario: over-hedged for a fall, they lose if markets rise instead.' : 'Stress tests show how hedges behave in the event they were bought for, which VaR cannot.',
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-vr-g1', type: 'num', kind: 'numerical',
    prompt: 'A $2,000,000 portfolio has daily returns with mean 0 and standard deviation 1.2%. What is its one-day 99% normal VaR ($)? (z = 2.326)',
    answer: 55824, check: () => 2.326 * 0.012 * 2e6, unit: '$', places: 0, tol: 2,
    hints: ['VaR = z × σ × V when the mean is zero.', '2.326 × 0.012 × 2,000,000.'],
    solution: '2.326 × 0.012 × 2,000,000 = $55,824.',
  },
  {
    id: 'f08-vr-g2', type: 'steps', kind: 'numerical',
    prompt: 'Twenty monthly returns, sorted from worst: −9.1%, −6.4%, −4.8%, −3.0%, −2.2%, then fifteen better months. Value $100,000. Use the historical method with the lowest-ranked observations.',
    steps: [
      { id: 'f08-vr-g2a', type: 'num', kind: 'numerical', prompt: 'With 20 months, how many months lie in the worst 10%?', answer: 2, check: () => 20 * 0.10, unit: 'months', places: 0, tol: 0, hints: ['10% of 20.'] },
      { id: 'f08-vr-g2b', type: 'num', kind: 'numerical', prompt: 'Expected shortfall at 90%: the average loss of those months ($).', answer: 7750, check: () => (0.091 + 0.064) / 2 * 100000, unit: '$', places: 0, tol: 1, hints: ['Average of 9.1% and 6.4%, times $100,000.'] },
    ],
    solution: 'The worst 10% is 2 months, −9.1% and −6.4%; their average loss is 7.75% = $7,750. The 90% VaR lies between the 2nd and 3rd worst months, about $4,800–$6,400 depending on the interpolation rule.',
  },
  {
    id: 'f08-vr-g3', type: 'num', kind: 'numerical',
    prompt: 'A one-month VaR is $24,631. Using the square-root-of-time rule, what is the six-month VaR ($)?',
    answer: 60334, check: () => 24631 * Math.sqrt(6), unit: '$', places: 0, tol: 2,
    wrong: [{ value: 147786, say: 'VaR scales with the square root of time, not linearly: √6, not 6.' }],
    hints: ['Multiply by √6.'],
    solution: '24,631 × √6 = 24,631 × 2.449 = $60,334, if months are independent.',
  },
  {
    id: 'f08-vr-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Two portfolios have the same 95% VaR. Portfolio A’s expected shortfall is much larger than B’s. What does that mean?',
    options: ['A’s losses beyond the VaR are larger on average', 'A loses more than its VaR more often than B', 'A has the higher expected return of the two', 'B’s VaR must have been calculated wrongly'],
    answer: 0,
    feedback: { 1: 'At the same VaR and confidence, both exceed it equally often; ES measures how far.', 2: 'ES says nothing about the expected return.', 3: 'Both can be right: VaR cannot tell their tails apart.' },
    hints: ['What does expected shortfall average?'],
    solution: 'ES is the average loss beyond VaR, so A has the fatter tail.',
  },
];

export const independent = [
  {
    id: 'f08-vr-i1', type: 'num', kind: 'numerical',
    prompt: 'Hollis’s book: monthly mean 0.72% and standard deviation 3.44% (simulated). What is the one-month 95% normal VaR on $500,000 ($)? (z = 1.645; use the rounded inputs.)',
    answer: 24694, check: () => (1.645 * 0.0344 - 0.0072) * 500000, unit: '$', places: 0, tol: 2,
    solution: '(1.645 × 0.0344 − 0.0072) × 500,000 = (0.05659 − 0.0072) × 500,000 = $24,694 (the unrounded figures give $24,671).',
  },
  {
    id: 'f08-vr-i2', type: 'num', kind: 'numerical',
    prompt: 'A 99% one-day VaR is backtested over 250 days. How many exceptions are expected?',
    answer: 2.5, check: () => 250 * 0.01, unit: '', places: 1, tol: 0.05,
    solution: '250 × 1% = 2.5 exceptions.',
  },
  {
    id: 'f08-vr-i3', type: 'num', kind: 'numerical',
    prompt: 'A 95% VaR model was exceeded 14 times in 120 months. What is Kupiec’s p-value (3 decimals)?',
    answer: Math.round(kupiec(14, 120, 0.05).p * 1000) / 1000, check: () => kupiec(14, 120, 0.05).p, unit: '', places: 3, tol: 0.001,
    solution: `Expected 6; observed 14. The likelihood-ratio statistic is ${kupiec(14, 120, 0.05).lr.toFixed(2)}, p = ${kupiec(14, 120, 0.05).p.toFixed(3)}: the model understates risk.`,
  },
  {
    id: 'f08-vr-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Which tool answers each question best?',
    items: ['What loss is exceeded one month in twenty?', 'How bad are losses, on average, in the worst 5% of months?', 'What would a repeat of March 2020 cost?', 'Would the VaR have been right over the past ten years?'],
    categories: ['VaR', 'Expected shortfall', 'Stress test', 'Backtest'],
    answer: [0, 1, 2, 3],
    solution: 'VaR gives the threshold, ES the average beyond it, stress tests the cost of a named scenario, backtests the record of the forecasts.',
  },
  {
    id: 'f08-vr-i5', type: 'num', kind: 'numerical',
    prompt: `In a scenario with Brightcup down 50%, the market down 25% and bonds unchanged, what would Hollis’s book lose without hedges ($)?`,
    answer: 98000, check: () => BOOK.brightcup * 0.5 + BOOK.market * 0.25, unit: '$', places: 0, tol: 1,
    solution: '42,000 × 50% + 308,000 × 25% = 21,000 + 77,000 = $98,000.',
  },
];

export const check = [
  {
    id: 'f08-vr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a one-month 95% VaR of $25,000 mean?',
    options: ['In about 5% of months the loss should exceed $25,000', 'The portfolio cannot lose more than $25,000 in a month', 'The average monthly loss is $25,000', 'In 95% of months the loss will exceed $25,000'],
    answer: 0,
    feedback: { 1: 'VaR is exceeded, by design, one month in twenty.', 2: 'VaR is a tail quantile, not an average.', 3: 'That reverses the probability.' },
    solution: 'VaR is the loss exceeded with probability 5% over a month.',
  },
  {
    id: 'f08-vr-k2', type: 'num', kind: 'numerical',
    prompt: 'A $1,000,000 portfolio has monthly mean 0.5% and standard deviation 4%. What is its one-month 99% normal VaR ($)? (z = 2.326)',
    answer: 88040, check: () => (2.326 * 0.04 - 0.005) * 1e6, unit: '$', places: 0, tol: 2,
    solution: '(2.326 × 0.04 − 0.005) × 1,000,000 = $88,040.',
  },
  {
    id: 'f08-vr-k3', type: 'num', kind: 'numerical',
    prompt: 'A ten-day VaR is needed from a one-day VaR of $40,000. Using the square-root-of-time rule, what is it ($)?',
    answer: 126491, check: () => 40000 * Math.sqrt(10), unit: '$', places: 0, tol: 2,
    solution: '40,000 × √10 = $126,491.',
  },
  {
    id: 'f08-vr-k4', type: 'mc', kind: 'applied',
    prompt: 'A risk manager’s VaR model had the right number of exceptions over ten years, but all of them came in two short periods. What should she conclude?',
    options: ['The model is slow to react when volatility changes', 'The model is fine, since the count was exactly right', 'The model overstates risk most of the time', 'Exceptions should be spread evenly, so the data must be wrong'],
    answer: 0,
    feedback: { 1: 'The count is right on average, but the clustering shows it fails when it matters.', 2: 'Clustering says it understated risk in those periods.', 3: 'Clustering is a common feature of real data, not an error.' },
    solution: 'Clustered exceptions fail Christoffersen’s independence test: the model should react faster (for example by weighting recent data) and be paired with stress tests.',
  },
  {
    id: 'f08-vr-k5', type: 'num', kind: 'numerical',
    prompt: `In the course scenario (Brightcup −40%, market −20%, bonds +2%), Hollis’s book loses $75,400. His 1,000 $40 puts pay with Brightcup at $25.20. What is the loss with the puts but no futures ($)?`,
    answer: 60600, check: () => 75400 - (40 - 25.2) * 1000, unit: '$', places: 0, tol: 1,
    solution: 'Puts pay (40 − 25.20) × 1,000 = 14,800; 75,400 − 14,800 = $60,600.',
  },
  {
    id: 'f08-vr-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Why did bank regulators move from VaR towards expected shortfall?',
    options: ['ES captures the size of losses beyond the threshold', 'Expected shortfall is always smaller, so banks need less capital', 'VaR cannot be calculated for portfolios that include bonds', 'Expected shortfall needs no data, only a model'],
    answer: 0,
    feedback: { 1: 'ES is at least as large as VaR at the same confidence.', 2: 'VaR applies to any portfolio.', 3: 'ES needs data and a model as much as VaR does.' },
    solution: 'VaR ignores the depth of the tail and can penalise diversification; ES averages the tail and is subadditive.',
  },
];
