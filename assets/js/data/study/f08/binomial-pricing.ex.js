// binomial-pricing.ex.js — F08 · Binomial pricing: widgets, practice and the knowledge check (answer keys live here).
// Figures from case.js (OPT, bs); every num item's `check` recomputes its answer.
import { OPT as O, bs } from './case.js?v=40';
import { binomial, oneStep } from '../../../core/derivatives.js?v=40';

const rh = 1.045 ** 0.5 - 1;
const usd = (x, d = 2) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const widgets = {
  'bt-one': {
    type: 'formula', title: 'One-step replication of a Brightcup option',
    intro: 'Brightcup at $42.00; one step of six months; risk-free rate for the step 2.2252% (4.5% a year).',
    inputs: [
      { id: 'u', label: 'Up factor u', min: 1.01, max: 1.6, step: 0.01, value: 1.2, fmt: 'num' },
      { id: 'd', label: 'Down factor d', min: 0.5, max: 1.0, step: 0.01, value: 0.85, fmt: 'num' },
      { id: 'K', label: 'Strike', min: 36, max: 48, step: 1, value: 42, fmt: 'money' },
      { id: 'call', label: 'Option (1 = call, 0 = put)', min: 0, max: 1, step: 1, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      if (!(v.d < 1 + rh && 1 + rh < v.u)) return { headline: { label: 'Option price', value: '—' }, rows: [], note: '', error: 'No arbitrage needs d < 1.0223 < u: otherwise the share always beats, or always loses to, the risk-free rate.' };
      const o = oneStep({ S: O.S, u: v.u, d: v.d, K: v.K, r: rh, type: v.call ? 'call' : 'put' });
      return {
        headline: { label: `${v.call ? 'Call' : 'Put'} price by replication`, value: usd(o.price, 4) },
        rows: [['Share price up / down', `${usd(o.Su)} / ${usd(o.Sd)}`], ['Option payoff up / down', `${usd(o.Cu)} / ${usd(o.Cd)}`], ['Delta (shares held)', o.delta.toFixed(4)], [o.bond < 0 ? 'Borrowed' : 'Lent', usd(Math.abs(o.bond), 4)], ['Risk-neutral probability of up', o.p.toFixed(4)], ['Price by risk-neutral valuation', usd(o.riskNeutral, 4)]],
        note: v.call ? 'A call is copied by buying shares with borrowed money.' : 'A put is copied by selling shares short and lending the proceeds.',
      };
    },
  },
  'bt-steps': {
    type: 'formula', title: 'Cox–Ross–Rubinstein trees: more steps',
    intro: 'Brightcup $42 options: S = $42.00, σ = 30%, six months, continuous rate 4.402%.',
    inputs: [{ id: 'n', label: 'Steps in the tree', min: 1, max: 200, step: 1, value: 2, fmt: 'int' }],
    compute: (v) => {
      const t = (n, type, am = false) => binomial({ S: O.S, K: 42, T: O.T, r: O.r, sigma: O.sigma, steps: n, type, american: am }).price;
      const bc = bs(42, 'call').price;
      const ns = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 60, 80, 100, 150, 200];
      return {
        headline: { label: `European call, ${v.n} step${v.n === 1 ? '' : 's'}`, value: usd(t(v.n, 'call'), 4) },
        rows: [['European put', usd(t(v.n, 'put'), 4)], ['American put', usd(t(v.n, 'put', true), 4)], ['Early-exercise premium', usd(t(v.n, 'put', true) - t(v.n, 'put'), 4)], ['Black–Scholes call', usd(bc, 4)], ['Tree less Black–Scholes', usd(t(v.n, 'call') - bc, 4)]],
        note: 'Each extra step moves the price less, though the error swings from one side to the other as the strike falls between nodes.',
        chart: { kind: 'line', x: { label: 'Steps', values: ns },
          series: [{ name: 'Tree call', values: ns.map((n) => Math.round(t(n, 'call') * 1e4) / 1e4) }, { name: 'Black–Scholes', values: ns.map(() => Math.round(bc * 1e4) / 1e4) }],
          y: { label: 'Call price ($)', format: 'num' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-bt-g1', type: 'steps', kind: 'numerical',
    prompt: 'A share at $20 will be $24 or $16 in a year. The risk-free rate is 5% a year. Price a one-year call with strike $21.',
    steps: [
      { id: 'f08-bt-g1a', type: 'num', kind: 'numerical', prompt: 'Delta (shares in the replicating portfolio)?', answer: 0.375, check: () => oneStep({ S: 20, u: 1.2, d: 0.8, K: 21, r: 0.05 }).delta, unit: '', places: 4, tol: 0.0001, hints: ['(C<sub>u</sub> − C<sub>d</sub>) ÷ (S<sub>u</sub> − S<sub>d</sub>) = (3 − 0) ÷ (24 − 16).'] },
      { id: 'f08-bt-g1b', type: 'num', kind: 'numerical', prompt: 'Amount borrowed ($)?', answer: 5.7143, check: () => -oneStep({ S: 20, u: 1.2, d: 0.8, K: 21, r: 0.05 }).bond, unit: '$', places: 4, tol: 0.0001, hints: ['B = (ΔS<sub>d</sub> − C<sub>d</sub>) ÷ 1.05 = 0.375 × 16 ÷ 1.05.'] },
      { id: 'f08-bt-g1c', type: 'num', kind: 'numerical', prompt: 'Call price ($)?', answer: 1.7857, check: () => oneStep({ S: 20, u: 1.2, d: 0.8, K: 21, r: 0.05 }).price, unit: '$', places: 4, tol: 0.0001, hints: ['ΔS<sub>0</sub> − B.'] },
    ],
    solution: 'Δ = 3 ÷ 8 = 0.375; B = 0.375 × 16 ÷ 1.05 = 5.7143; C = 0.375 × 20 − 5.7143 = $1.7857.',
  },
  {
    id: 'f08-bt-g2', type: 'num', kind: 'numerical',
    prompt: 'In the same tree (u = 1.2, d = 0.8, r = 5%), what is the risk-neutral probability of an up move?',
    answer: 0.625, check: () => oneStep({ S: 20, u: 1.2, d: 0.8, K: 21, r: 0.05 }).p, unit: '', places: 4, tol: 0.0001,
    wrong: [{ value: 0.5, say: 'Equal chances would make the share earn 0% on average; risk-neutral p makes it earn the 5% risk-free rate.' }],
    hints: ['p = (1 + r − d) ÷ (u − d).', '(1.05 − 0.80) ÷ 0.40.'],
    solution: 'p = 0.25 ÷ 0.40 = 0.625; check: 0.625 × 3 ÷ 1.05 = $1.7857, the replication price.',
  },
  {
    id: 'f08-bt-g3', type: 'num', kind: 'numerical',
    prompt: 'A CRR tree has σ = 25% and steps of one month (Δt = 1/12). What is the up factor u (4 decimals)?',
    answer: 1.0748, check: () => Math.exp(0.25 * Math.sqrt(1 / 12)), unit: '', places: 4, tol: 0.0001,
    hints: ['u = e<sup>σ√Δt</sup>.', 'e<sup>0.25 × 0.288675</sup>.'],
    solution: 'u = e<sup>0.072169</sup> = 1.0748; d = 1/u = 0.9304.',
  },
  {
    id: 'f08-bt-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Two investors disagree about the chance that a share rises. Using the same one-step tree and rate, what do they conclude about the call’s price?',
    options: ['The same price, since replication does not use their probabilities', 'The more optimistic investor values the call higher', 'The more pessimistic investor values the call higher', 'Each gets a different price, and the market takes the average of the two'],
    answer: 0,
    feedback: { 1: 'Optimism is already in the share price; the call is priced relative to it.', 2: 'Probabilities do not enter the replication.', 3: 'No averaging is needed: replication gives one price.' },
    hints: ['Did the replication argument use a probability anywhere?'],
    solution: 'The replicating portfolio costs the same whatever anyone believes, so the call has one no-arbitrage price.',
  },
];

export const independent = [
  {
    id: 'f08-bt-i1', type: 'num', kind: 'numerical',
    prompt: 'A share at $50 will be $60 or $42 in six months; the six-month risk-free rate is 2%. Price a six-month put with strike $50 ($, 4 decimals).',
    answer: Math.round(oneStep({ S: 50, u: 1.2, d: 0.84, K: 50, r: 0.02, type: 'put' }).price * 1e4) / 1e4, check: () => oneStep({ S: 50, u: 1.2, d: 0.84, K: 50, r: 0.02, type: 'put' }).price, unit: '$', places: 4, tol: 0.0001,
    solution: `p = (1.02 − 0.84) ÷ 0.36 = 0.5; put = (1 − 0.5) × 8 ÷ 1.02 = $${oneStep({ S: 50, u: 1.2, d: 0.84, K: 50, r: 0.02, type: 'put' }).price.toFixed(4)}.`,
  },
  {
    id: 'f08-bt-i2', type: 'num', kind: 'numerical',
    prompt: `Using the case’s two-step tree for Brightcup (σ = 30%, two steps of three months, continuous rate 4.402%), what is the $44 European call worth ($, 4 decimals)?`,
    answer: Math.round(binomial({ S: O.S, K: 44, T: O.T, r: O.r, sigma: O.sigma, steps: 2, type: 'call' }).price * 1e4) / 1e4, check: () => binomial({ S: O.S, K: 44, T: O.T, r: O.r, sigma: O.sigma, steps: 2, type: 'call' }).price, unit: '$', places: 4, tol: 0.0001,
    solution: 'Only the top node pays: 56.69 − 44 = 12.69. Discount it back two steps with p twice: p² × 12.69 ÷ e<sup>2rΔt</sup>.',
  },
  {
    id: 'f08-bt-i3', type: 'classify', kind: 'conceptual',
    prompt: 'At a node of an American option’s tree, which value is used?',
    items: ['A deep in-the-money put whose exercise value exceeds its continuation value', 'An out-of-the-money put', 'A call on a share with no dividends', 'Any European option'],
    categories: ['Exercise value', 'Continuation value'],
    answer: [0, 1, 1, 1],
    solution: 'Each node takes the larger of the two. Out-of-the-money options have no exercise value; calls on non-dividend shares are always worth more alive; European options cannot be exercised early.',
  },
  {
    id: 'f08-bt-i4', type: 'num', kind: 'numerical',
    prompt: 'A one-step tree has u = 1.10, d = 0.95 and a step rate of 1%. A put has C<sub>u</sub> = 0 and C<sub>d</sub> = 3.00 with S<sub>0</sub> = 60. What is the put’s delta?',
    answer: -0.3333, check: () => (0 - 3) / (60 * 1.1 - 60 * 0.95), unit: '', places: 4, tol: 0.0001,
    solution: 'Δ = (0 − 3) ÷ (66 − 57) = −0.3333: replicate the put by selling a third of a share short and lending.',
  },
  {
    id: 'f08-bt-i5', type: 'mc', kind: 'applied',
    prompt: 'A dealer has written calls. After the share rises, the calls’ delta has gone up. What must the dealer do to stay hedged?',
    options: ['Buy more shares', 'Sell some of the shares it holds', 'Do nothing until expiry', 'Buy puts with the same strike'],
    answer: 0,
    feedback: { 1: 'Selling would reduce the hedge when the exposure has grown.', 2: 'A static hedge drifts away from the option as delta changes.', 3: 'That changes the position but is not the delta adjustment.' },
    solution: 'The written calls now lose more for each $1 rise, so the hedge needs more shares: buy the difference in delta.',
  },
];

export const check = [
  {
    id: 'f08-bt-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why must an option cost the same as its replicating portfolio?',
    options: ['Otherwise buying the cheaper and selling the dearer is an arbitrage', 'Because exchanges set option prices from replicating portfolios', 'Because both have the same expected return as the share', 'Because the portfolio is always cheaper to trade than the option'],
    answer: 0,
    feedback: { 1: 'Prices come from trading; arbitrage keeps them in line.', 2: 'The option and the share have different expected returns; what matters is identical payoffs.', 3: 'Trading costs vary; the argument rests on identical payoffs.' },
    solution: 'They pay the same in every state, so any price difference is a riskless profit.',
  },
  {
    id: 'f08-bt-k2', type: 'num', kind: 'numerical',
    prompt: 'A share at $40 will be $48 or $34 in a year; the risk-free rate is 4%. What is the risk-neutral probability of an up move (4 decimals)?',
    answer: 0.5429, check: () => (1.04 - 0.85) / (1.2 - 0.85), unit: '', places: 4, tol: 0.0001,
    solution: 'u = 1.20, d = 0.85; p = (1.04 − 0.85) ÷ 0.35 = 0.5429.',
  },
  {
    id: 'f08-bt-k3', type: 'num', kind: 'numerical',
    prompt: 'In that tree, what is a one-year $40 call worth ($, 4 decimals)?',
    answer: 4.1758, check: () => oneStep({ S: 40, u: 1.2, d: 0.85, K: 40, r: 0.04 }).price, unit: '$', places: 4, tol: 0.0001,
    solution: '0.5429 × 8 ÷ 1.04 = $4.1758.',
  },
  {
    id: 'f08-bt-k4', type: 'mc', kind: 'applied',
    prompt: 'Which option is best valued with a binomial tree rather than the Black–Scholes formula?',
    options: ['An American put on a share', 'A European call on a share with no dividends', 'A European put on a share with no dividends', 'A forward contract on a share'],
    answer: 0,
    feedback: { 1: 'Black–Scholes prices it exactly.', 2: 'Black–Scholes prices it, or parity from the call.', 3: 'A forward needs no option model at all.' },
    solution: 'Early exercise needs a check at every node, which a tree provides and the formula does not.',
  },
  {
    id: 'f08-bt-k5', type: 'num', kind: 'numerical',
    prompt: 'A CRR tree has σ = 40% and steps of three months. What is the down factor d (4 decimals)?',
    answer: 0.8187, check: () => Math.exp(-0.4 * Math.sqrt(0.25)), unit: '', places: 4, tol: 0.0001,
    solution: 'u = e<sup>0.4 × 0.5</sup> = 1.2214; d = 1/u = e<sup>−0.2</sup> = 0.8187.',
  },
  {
    id: 'f08-bt-k6', type: 'mc', kind: 'conceptual',
    prompt: 'What happens to binomial option prices as the number of steps grows large?',
    options: ['They converge to the Black–Scholes–Merton values', 'They grow without limit as more paths are added', 'They fall towards the option’s intrinsic value', 'They become more sensitive to real-world probabilities'],
    answer: 0,
    feedback: { 1: 'More steps refine the distribution; they do not add value.', 2: 'Time value remains however many steps there are.', 3: 'Real-world probabilities never enter.' },
    solution: 'With infinitely small steps, the tree’s distribution of prices becomes the lognormal of Black–Scholes–Merton.',
  },
];
