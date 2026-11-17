// black-scholes-and-greeks.ex.js — F08 · Black–Scholes–Merton and the Greeks: widgets, practice and the knowledge check.
// Figures from case.js (OPT, bs); every num item's `check` recomputes its answer with core/fin.js.
import { OPT as O, bs } from './case.js?v=40';
import { blackScholes, impliedVol } from '../../../core/fin.js?v=40';

const usd = (x, d = 2) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const f4 = (x) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(4);

export const widgets = {
  'bs-explorer': {
    type: 'formula', title: 'Black–Scholes–Merton for a Brightcup option',
    intro: 'Continuous rate 4.402% (4.5% a year compounded annually); no dividend before expiry.',
    inputs: [
      { id: 'S', label: 'Share price', min: 30, max: 55, step: 0.5, value: 42, fmt: 'money' },
      { id: 'K', label: 'Strike', min: 36, max: 48, step: 1, value: 42, fmt: 'money' },
      { id: 'sig', label: 'Volatility', min: 10, max: 60, step: 1, value: 30, fmt: 'pct' },
      { id: 'm', label: 'Months to expiry', min: 1, max: 24, step: 1, value: 6, fmt: 'int' },
    ],
    compute: (v) => {
      const T = v.m / 12, sp = { K: v.K, T, r: O.r, sigma: v.sig / 100 };
      const c = blackScholes({ S: v.S, ...sp, type: 'call' }), p = blackScholes({ S: v.S, ...sp, type: 'put' });
      const xs = Array.from({ length: 11 }, (_, i) => 30 + 2.5 * i);
      return {
        headline: { label: 'Call / put', value: `${usd(c.price)} / ${usd(p.price)}` },
        rows: [['d₁ / d₂', `${f4(c.d1)} / ${f4(c.d2)}`], ['Delta (call / put)', `${f4(c.delta)} / ${f4(p.delta)}`], ['Gamma', f4(c.gamma)], ['Vega (a volatility point)', f4(c.vega / 100)], ['Theta a day (call / put)', `${f4(c.theta / 365)} / ${f4(p.theta / 365)}`], ['Rho (a rate point, call / put)', `${f4(c.rho / 100)} / ${f4(p.rho / 100)}`], ['Risk-neutral chance the call ends in the money, N(d₂)', `${(c.probITM * 100).toFixed(1)}%`]],
        note: `The call’s time value is ${usd(c.timeValue)} of its ${usd(c.price)}. ${Math.abs(v.S - v.K) <= 1 ? 'Near the money, gamma and vega are at their largest.' : v.S > v.K ? 'In the money, the call behaves more like the share (delta near 1).' : 'Out of the money, the call is a cheap bet on a large rise (delta near 0).'}`,
        chart: { kind: 'line', x: { label: 'Share price ($)', values: xs },
          series: [{ name: 'Call value now', values: xs.map((s) => Math.round(blackScholes({ S: s, ...sp, type: 'call' }).price * 100) / 100) }, { name: 'Call value at expiry', values: xs.map((s) => Math.max(s - v.K, 0)) }],
          y: { label: 'Call value ($)', format: 'money' } },
      };
    },
  },
  'bs-iv': {
    type: 'formula', title: 'Implied volatility of the $42 Brightcup call',
    intro: 'Share $42.00, strike $42, six months, continuous rate 4.402%.',
    inputs: [{ id: 'c', label: 'Market price of the call', min: 1, max: 9, step: 0.01, value: 4.5, fmt: 'money' }],
    compute: (v) => {
      const lower = O.S - 42 * Math.exp(-O.r * O.T);
      if (v.c <= lower) return { headline: { label: 'Implied volatility', value: '—' }, rows: [], note: '', error: `A call cannot be worth less than S − Ke^(−rT) = ${usd(lower, 4)}: that price allows an arbitrage.` };
      const iv = impliedVol({ S: O.S, K: 42, T: O.T, r: O.r, type: 'call' }, v.c);
      return {
        headline: { label: 'Implied volatility', value: `${(iv * 100).toFixed(2)}%` },
        rows: [['Price at the case’s 30%', usd(bs(42, 'call').price, 4)], ['Vega estimate of the volatility', `${(30 + (v.c - bs(42, 'call').price) / (bs(42, 'call').vega / 100)).toFixed(2)}%`], ['Implied put price by parity', usd(v.c - O.S + 42 * Math.exp(-O.r * O.T))]],
        note: iv > O.sigma ? 'The market prices Brightcup as riskier than the case’s 30%.' : 'The market prices Brightcup as less risky than the case’s 30%.',
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-bs-g1', type: 'steps', kind: 'numerical',
    prompt: 'A share is at $100; a one-year European call has strike $100; r = 5% (continuous); σ = 20%.',
    steps: [
      { id: 'f08-bs-g1a', type: 'num', kind: 'numerical', prompt: 'd₁ (4 decimals)?', answer: 0.35, check: () => blackScholes({ S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, type: 'call' }).d1, unit: '', places: 4, tol: 0.0001, hints: ['[ln(1) + (0.05 + 0.02) × 1] ÷ 0.20.'] },
      { id: 'f08-bs-g1b', type: 'num', kind: 'numerical', prompt: 'd₂ (4 decimals)?', answer: 0.15, check: () => blackScholes({ S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, type: 'call' }).d2, unit: '', places: 4, tol: 0.0001, hints: ['d₂ = d₁ − σ√T.'] },
      { id: 'f08-bs-g1c', type: 'num', kind: 'numerical', prompt: 'Call price ($), using N(0.35) = 0.6368 and N(0.15) = 0.5596?', answer: 10.45, check: () => blackScholes({ S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, type: 'call' }).price, unit: '$', places: 2, tol: 0.01, hints: ['100 × 0.6368 − 100e<sup>−0.05</sup> × 0.5596.'] },
    ],
    solution: 'd₁ = 0.07 ÷ 0.20 = 0.35; d₂ = 0.15. c = 100 × 0.6368 − 95.1229 × 0.5596 = $10.45.',
  },
  {
    id: 'f08-bs-g2', type: 'num', kind: 'numerical',
    prompt: `A call’s delta is 0.58 and its gamma 0.044. Estimate the change in its value if the share rises $2 ($, 2 decimals).`,
    answer: 1.248, check: () => 0.58 * 2 + 0.5 * 0.044 * 4, unit: '$', places: 2, tol: 0.006,
    wrong: [{ value: 1.16, say: 'That uses delta only. Add ½ × gamma × (move)² for the curvature.' }],
    hints: ['ΔV ≈ Δ·ΔS + ½Γ(ΔS)².', '0.58 × 2 + 0.5 × 0.044 × 4.'],
    solution: '1.16 + 0.088 = $1.25.',
  },
  {
    id: 'f08-bs-g3', type: 'num', kind: 'numerical',
    prompt: 'A dealer writes 2,000 calls with a delta of 0.45. How many shares should it hold to be delta-neutral?',
    answer: 900, check: () => 2000 * 0.45, unit: 'shares', places: 0, tol: 0.5,
    hints: ['Written calls lose when the share rises; hold delta × number of options in shares.'],
    solution: '2,000 × 0.45 = 900 shares bought.',
  },
  {
    id: 'f08-bs-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why is vega positive for both calls and puts?',
    options: ['Higher volatility raises the chance of a large payoff while losses stay capped', 'Because a rise in volatility always raises the share price as well', 'Because volatility lowers the present value of the strike price paid', 'Because calls and puts have the same delta at every share price'],
    answer: 0,
    feedback: { 1: 'Volatility is about the spread of outcomes, not their level.', 2: 'That is the interest rate’s effect (rho).', 3: 'Their deltas differ by 1.' },
    hints: ['What can the holder of an option lose at worst?'],
    solution: 'An option holder gains from large moves in the right direction and loses at most the premium, so a wider spread of outcomes is worth more.',
  },
];

export const independent = [
  {
    id: 'f08-bs-i1', type: 'num', kind: 'numerical',
    prompt: 'Price the six-month $44 Brightcup put with Black–Scholes–Merton (S = $42.00, σ = 30%, r = 4.402% continuous) ($, 2 decimals).',
    answer: Math.round(bs(44, 'put').price * 100) / 100, check: () => bs(44, 'put').price, unit: '$', places: 2, tol: 0.005,
    solution: `d₁ = [ln(42/44) + (0.04402 + 0.045) × 0.5] ÷ 0.2121 = ${bs(44, 'put').d1.toFixed(4)}; d₂ = ${bs(44, 'put').d2.toFixed(4)}; p = 44e<sup>−rT</sup>N(−d₂) − 42N(−d₁) = $${bs(44, 'put').price.toFixed(2)}.`,
  },
  {
    id: 'f08-bs-i2', type: 'num', kind: 'numerical',
    prompt: 'What is the delta of the six-month $40 Brightcup put (4 decimals)?',
    answer: Math.round(bs(40, 'put').delta * 1e4) / 1e4, check: () => bs(40, 'put').delta, unit: '', places: 4, tol: 0.0001,
    solution: `N(d₁) − 1 with d₁ = ${bs(40, 'put').d1.toFixed(4)}: ${bs(40, 'put').delta.toFixed(4)}.`,
  },
  {
    id: 'f08-bs-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For a long call, does each change raise or lower its value, other things equal?',
    items: ['A rise in the share price', 'A rise in volatility', 'A day passing', 'A rise in the interest rate', 'A higher strike'],
    categories: ['Raises it', 'Lowers it'],
    answer: [0, 0, 1, 0, 1],
    solution: 'Delta, vega and rho are positive for a call; theta is negative; a higher strike means paying more on exercise.',
  },
  {
    id: 'f08-bs-i4', type: 'num', kind: 'numerical',
    prompt: 'An investor holds 500 shares and 500 puts with a delta of −0.40. What is the position’s delta in shares?',
    answer: 300, check: () => 500 * (1 - 0.4), unit: 'shares', places: 0, tol: 0.5,
    solution: '500 × 1 + 500 × (−0.40) = 300: the position moves like 300 shares for small changes.',
  },
  {
    id: 'f08-bs-i5', type: 'mc', kind: 'applied',
    prompt: 'Out-of-the-money index puts have higher implied volatilities than at-the-money options with the same expiry. What does this suggest?',
    options: ['The market prices large falls as likelier than constant volatility allows', 'The Black–Scholes–Merton formula has an arithmetic error for puts', 'Out-of-the-money puts are always a bargain that investors should buy more of', 'Interest rates are higher for options with lower strikes'],
    answer: 0,
    feedback: { 1: 'The formula is correct for its assumptions; the market rejects the assumptions.', 2: 'High implied volatility means they are dear by the model, not cheap.', 3: 'One rate applies to all strikes.' },
    solution: 'The smile shows fat left tails: demand for crash protection makes low-strike puts dear relative to a lognormal model.',
  },
];

export const check = [
  {
    id: 'f08-bs-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which input to the Black–Scholes–Merton formula cannot be observed directly?',
    options: ['Volatility', 'The strike price of the option', 'The time left until expiry', 'The current share price'],
    answer: 0,
    feedback: { 1: 'The strike is written in the contract.', 2: 'The expiry date is in the contract.', 3: 'The share price is quoted on the exchange.' },
    solution: 'Volatility must be estimated, or implied from option prices.',
  },
  {
    id: 'f08-bs-k2', type: 'num', kind: 'numerical',
    prompt: 'A share is at $50; a three-month call has strike $52; r = 4% (continuous); σ = 25%. What is the call worth ($, 2 decimals)?',
    answer: Math.round(blackScholes({ S: 50, K: 52, T: 0.25, r: 0.04, sigma: 0.25, type: 'call' }).price * 100) / 100, check: () => blackScholes({ S: 50, K: 52, T: 0.25, r: 0.04, sigma: 0.25, type: 'call' }).price, unit: '$', places: 2, tol: 0.005,
    solution: `d₁ = [ln(50/52) + (0.04 + 0.03125) × 0.25] ÷ 0.125 = ${blackScholes({ S: 50, K: 52, T: 0.25, r: 0.04, sigma: 0.25, type: 'call' }).d1.toFixed(4)}; c = $${blackScholes({ S: 50, K: 52, T: 0.25, r: 0.04, sigma: 0.25, type: 'call' }).price.toFixed(2)}.`,
  },
  {
    id: 'f08-bs-k3', type: 'num', kind: 'numerical',
    prompt: 'An option has vega 0.12 a volatility point and costs $3.00 at 28% volatility. Estimate its price at 31% ($, 2 decimals).',
    answer: 3.36, check: () => 3 + 0.12 * 3, unit: '$', places: 2, tol: 0.005,
    solution: '3.00 + 0.12 × 3 = $3.36.',
  },
  {
    id: 'f08-bs-k4', type: 'mc', kind: 'applied',
    prompt: 'A dealer is delta-hedged on written at-the-money calls with a week to expiry. Why is it exposed?',
    options: ['Gamma is large, so delta and the hedge change fast', 'Because theta is zero in the last week', 'Because vega is largest just before expiry', 'Because the calls’ delta is exactly zero at the money'],
    answer: 0,
    feedback: { 1: 'Theta is largest in magnitude near expiry for at-the-money options.', 2: 'Vega falls as expiry approaches.', 3: 'At the money, delta is about 0.5.' },
    solution: 'Near expiry an at-the-money option’s delta can swing from near 0 to near 1 on a small move, so the hedge needs constant, costly rebalancing.',
  },
  {
    id: 'f08-bs-k5', type: 'num', kind: 'numerical',
    prompt: 'Convert an interest rate of 6% a year compounded annually into the continuously compounded rate for the formula (%, 4 decimals).',
    answer: 5.8269, check: () => Math.log(1.06) * 100, unit: '%', places: 4, tol: 0.0001,
    solution: 'ln(1.06) = 0.058269 = 5.8269%.',
  },
  {
    id: 'f08-bs-k6', type: 'mc', kind: 'conceptual',
    prompt: 'What does N(d₂) represent for a European call?',
    options: ['The risk-neutral probability it ends in the money', 'The number of shares needed to hedge it', 'The real-world probability that the holder will exercise it', 'The present value of the strike price'],
    answer: 0,
    feedback: { 1: 'That is N(d₁), delta.', 2: 'Risk-neutral, not real-world: the share’s expected return does not enter.', 3: 'That is Ke<sup>−rT</sup>.' },
    solution: 'N(d₂) is the probability, under risk-neutral valuation, that S<sub>T</sub> > K.',
  },
];
