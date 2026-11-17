// assess-m2.js — F08 module 2 test: Options (options-payoffs, put-call-parity, binomial-pricing,
// black-scholes-and-greeks). No hints; full solutions shown on review. Orchard Lane Foods and its options are fictional
// and introduced here. Rates are continuously compounded unless a step rate is stated.
import { oneStep, binomial, parityGap } from '../../../core/derivatives.js?v=39';
import { blackScholes } from '../../../core/fin.js?v=39';

const OL = { S: 60, r: 0.03 };
const putFromCall = 5.2 - 60 + 60 * Math.exp(-0.03 * 0.5);
const lb = 60 - 55 * Math.exp(-0.03);
const one = oneStep({ S: 60, u: 1.25, d: 0.8, K: 60, r: 0.03 });
const bsc = blackScholes({ S: 60, K: 62, T: 0.25, r: 0.03, sigma: 0.28, type: 'call' });

export const items = [
  {
    id: 'f08-m2-1', lesson: 'options-payoffs', type: 'num', kind: 'numerical',
    prompt: 'Orchard Lane Foods (fictional) trades at $60. An investor buys its $60 put for $4.10 and writes its $55 put for $2.00, both expiring together. What is the largest profit the position can make, a share?',
    answer: 2.9, check: () => (60 - 55) - (4.1 - 2.0), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 5, say: 'That is the largest payoff; subtract the net premium of $2.10.' }],
    solution: 'A bear put spread: net cost 4.10 − 2.00 = 2.10; payoff at most 60 − 55 = 5.00 (at $55 or below); profit at most $2.90.',
  },
  {
    id: 'f08-m2-2', lesson: 'options-payoffs', type: 'num', kind: 'numerical',
    prompt: 'An Orchard Lane shareholder buys the $56 put for $1.70 to protect shares bought today at $60. What is the least the share-plus-put position can be worth at expiry, net of the premium ($ a share)?',
    answer: 54.3, check: () => 56 - 1.7, unit: '$', places: 2, tol: 0.005,
    solution: 'The put guarantees $56; less the $1.70 premium, $54.30 (a loss of at most $5.70 from $60).',
  },
  {
    id: 'f08-m2-3', lesson: 'options-payoffs', type: 'classify', kind: 'conceptual',
    prompt: 'Which view about Orchard Lane is each position built for?',
    items: ['Long straddle at $60', 'Covered call at $65', 'Bull call spread, $60 and $65', 'Share plus $55 put'],
    categories: ['A large move, either way', 'Little change; earn income', 'A moderate rise, cheaply', 'Keep the upside, insure the downside'],
    answer: [0, 1, 2, 3],
    solution: 'A straddle bets on volatility; a covered call earns premium in a flat market; a bull spread caps a cheaper bet on a rise; a protective put insures a holding.',
  },
  {
    id: 'f08-m2-4', lesson: 'put-call-parity', type: 'num', kind: 'numerical',
    prompt: 'Orchard Lane’s six-month $60 European call costs $5.20. The share pays no dividend before expiry and the continuously compounded rate is 3%. What must the matching put cost?',
    answer: Math.round(putFromCall * 100) / 100, check: () => 5.2 - 60 + 60 * Math.exp(-0.015), unit: '$', places: 2, tol: 0.005,
    solution: `p = c − S + Ke<sup>−rT</sup> = 5.20 − 60 + 60e<sup>−0.015</sup> (59.1067) = $${putFromCall.toFixed(2)}.`,
  },
  {
    id: 'f08-m2-5', lesson: 'put-call-parity', type: 'mc', kind: 'applied',
    prompt: 'For a share at $60, a one-year $60 call is quoted at $3.00 and the put at $3.40; the rate is 3% (continuous). Parity says c − p should be $1.77. Which trade locks in a profit?',
    options: ['Write the call, buy the put, buy the share and borrow PV(K) today', 'Buy the call, write the put, short the share and deposit PV(K)', 'Buy both options and hold the share until expiry', 'Write both options and deposit the premiums received'],
    answer: 1,
    feedback: { 0: 'That conversion profits when c − p is too high; here it is too low (−0.40).', 2: 'A straddle on top of the share is a bet, not an arbitrage.', 3: 'A written straddle is a bet that the share stays still.' },
    solution: `c − p = −0.40, below S − Ke<sup>−rT</sup> = ${(60 - 60 * Math.exp(-0.03)).toFixed(2)}. The put side is dear: sell it (write the put, short the share) and buy the call side (call plus deposit): a reversal earning about $${Math.abs(parityGap({ C: 3, P: 3.4, S: 60, K: 60, r: 0.03, T: 1 })).toFixed(2)} a share.`,
  },
  {
    id: 'f08-m2-6', lesson: 'put-call-parity', type: 'num', kind: 'numerical',
    prompt: 'A one-year European call on Orchard Lane has a strike of $55. With the share at $60 and the rate 3% (continuous), what is the lowest price at which it could trade without an arbitrage?',
    answer: Math.round(lb * 100) / 100, check: () => 60 - 55 * Math.exp(-0.03), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 5, say: 'S − K ignores that the strike is paid a year later; the bound is S − Ke<sup>−rT</sup>.' }],
    solution: `60 − 55e<sup>−0.03</sup> = 60 − 53.3745 = $${lb.toFixed(2)}.`,
  },
  {
    id: 'f08-m2-7', lesson: 'binomial-pricing', type: 'num', kind: 'numerical',
    prompt: 'In one step, Orchard Lane will rise from $60 to $75 or fall to $48. The risk-free rate for the step is 3%. What is a $60 call worth today?',
    answer: Math.round(one.price * 100) / 100, check: () => oneStep({ S: 60, u: 1.25, d: 0.8, K: 60, r: 0.03 }).price, unit: '$', places: 2, tol: 0.005,
    solution: `Δ = 15 ÷ 27 = ${one.delta.toFixed(4)}; borrow ${(-one.bond).toFixed(4)} = Δ × 48 ÷ 1.03; price = Δ × 60 − B = $${one.price.toFixed(2)}.`,
  },
  {
    id: 'f08-m2-8', lesson: 'binomial-pricing', type: 'num', kind: 'numerical',
    prompt: 'In the same tree (up 25%, down 20%, 3% for the step), what is the risk-neutral probability of the up move (4 decimals)?',
    answer: Math.round(one.p * 1e4) / 1e4, check: () => (1.03 - 0.8) / (1.25 - 0.8), unit: '', places: 4, tol: 0.0001,
    solution: `p = (1.03 − 0.80) ÷ (1.25 − 0.80) = ${one.p.toFixed(4)}; check: ${one.p.toFixed(4)} × 15 ÷ 1.03 = $${one.riskNeutral.toFixed(2)}.`,
  },
  {
    id: 'f08-m2-9', lesson: 'binomial-pricing', type: 'mc', kind: 'conceptual',
    prompt: `A 100-step tree values Orchard Lane’s one-year $66 American put at $${binomial({ S: 60, K: 66, T: 1, r: 0.03, sigma: 0.28, steps: 100, type: 'put', american: true }).price.toFixed(2)} and the European put at $${binomial({ S: 60, K: 66, T: 1, r: 0.03, sigma: 0.28, steps: 100, type: 'put' }).price.toFixed(2)}. Why is the American put worth more?`,
    options: ['Its holder can take the strike early and earn interest', 'Because American options always have longer lives', 'Because American puts also pay the holder the share’s dividends', 'Because the tree adds a premium for every step'],
    answer: 0,
    feedback: { 1: 'Both expire on the same date here.', 2: 'Options do not pay dividends.', 3: 'The tree only checks the exercise value at each node.' },
    solution: 'At nodes deep in the money, exercising now (and investing the strike) is worth more than holding: the early-exercise premium.',
  },
  {
    id: 'f08-m2-10', lesson: 'black-scholes-and-greeks', type: 'num', kind: 'numerical',
    prompt: 'Price a three-month European call on Orchard Lane with strike $62: share $60, continuously compounded rate 3%, volatility 28%.',
    answer: Math.round(bsc.price * 100) / 100, check: () => blackScholes({ S: 60, K: 62, T: 0.25, r: 0.03, sigma: 0.28, type: 'call' }).price, unit: '$', places: 2, tol: 0.005,
    solution: `d₁ = [ln(60/62) + (0.03 + 0.0392) × 0.25] ÷ (0.28 × 0.5) = ${bsc.d1.toFixed(4)}; d₂ = ${bsc.d2.toFixed(4)}; c = 60N(d₁) − 62e<sup>−0.0075</sup>N(d₂) = $${bsc.price.toFixed(2)}.`,
  },
  {
    id: 'f08-m2-11', lesson: 'black-scholes-and-greeks', type: 'num', kind: 'applied',
    prompt: 'A dealer has written 2,000 Orchard Lane puts, each with a delta of −0.35. How many shares must it sell short to be delta-neutral?',
    answer: 700, check: () => 2000 * 0.35, unit: 'shares', places: 0, tol: 0.5,
    wrong: [{ value: -700, say: 'Written puts gain when the share rises (delta +0.35 each for the writer), so the hedge is a short position of 700 shares.' }],
    solution: 'Each written put has a delta of +0.35 for the dealer: +700 in all. Selling 700 shares short brings the position to zero.',
  },
  {
    id: 'f08-m2-12', lesson: 'black-scholes-and-greeks', type: 'mc', kind: 'conceptual',
    prompt: 'Orchard Lane options trade at higher prices than a 28% volatility gives, with nothing else changed. What does this mean?',
    options: ['Their implied volatility is above 28%', 'The risk-free rate must have fallen sharply', 'The options’ deltas have all become zero', 'The share price is expected to rise'],
    answer: 0,
    feedback: { 1: 'A lower rate lowers call prices and raises puts; it does not raise both.', 2: 'Delta does not depend on the market price in that way.', 3: 'Expected returns do not enter option prices.' },
    solution: 'The volatility that reproduces the market price, the implied volatility, is higher: the market expects larger moves.',
  },
];
