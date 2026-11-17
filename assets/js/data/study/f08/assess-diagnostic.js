// assess-diagnostic.js — F08 diagnostic: what a student already knows about derivatives and risk. Eleven items across
// the three modules; `route` suggests where to start. Redfern Cycles and its figures are fictional and introduced here.
// No hints; solutions on review.
import { forwardPrice, oneStep } from '../../../core/derivatives.js?v=39';

export const items = [
  {
    id: 'f08-dg-1', lesson: 'why-firms-hedge', type: 'mc', kind: 'conceptual',
    prompt: 'Redfern Cycles (fictional) imports bicycles priced in euros and sells them in the United States in dollars. When does its profit suffer?',
    options: ['When the euro strengthens against the dollar', 'When the euro weakens against the dollar', 'When US interest rates fall', 'Only when its US sales fall'],
    answer: 0,
    feedback: { 1: 'A weaker euro makes its imports cheaper in dollars.', 2: 'Rates affect its borrowing, not its import costs directly.', 3: 'Its costs move with the exchange rate even when sales hold up.' },
    solution: 'Its costs are in euros and its revenue in dollars, so a stronger euro raises its costs in dollars.',
  },
  {
    id: 'f08-dg-2', lesson: 'forwards-and-futures', type: 'num', kind: 'numerical',
    prompt: 'Redfern agreed to buy €80,000 forward at $1.1000. On the delivery date the spot rate is $1.0600. What is the forward’s payoff to Redfern ($, negative for a loss)?',
    answer: -3200, check: () => (1.06 - 1.1) * 80000, unit: '$', places: 0, tol: 1,
    solution: '(1.0600 − 1.1000) × 80,000 = −$3,200: Redfern pays more than spot, but its cost was fixed in advance.',
  },
  {
    id: 'f08-dg-3', lesson: 'pricing-by-no-arbitrage', type: 'num', kind: 'numerical',
    prompt: 'Redfern’s bank offers a two-year forward on a $40 share that pays no dividends at $45.00. Money costs 5% a year (annual compounding). By how much is the quote above the no-arbitrage price ($)?',
    answer: 0.9, check: () => 45 - forwardPrice({ S: 40, r: 0.05, T: 2 }), unit: '$', places: 2, tol: 0.005,
    solution: 'No-arbitrage price 40 × 1.05² = 44.10; the quote is $0.90 above it, so selling the forward and carrying the share would earn $0.90 risk-free.',
  },
  {
    id: 'f08-dg-4', lesson: 'swaps', type: 'mc', kind: 'applied',
    prompt: 'Redfern has a floating-rate bank loan at the benchmark + 2% and enters a swap paying 4% fixed and receiving the benchmark. What does it now pay?',
    options: ['A fixed 6% whatever the benchmark does', 'The benchmark + 6% each year', 'A fixed 4%, because the swap cancels the spread', 'The benchmark − 2% each year'],
    answer: 0,
    feedback: { 1: 'The benchmark it receives on the swap cancels the benchmark it pays on the loan.', 2: 'The swap fixes the benchmark, not the bank’s 2% spread.', 3: 'That would need the swap to pay Redfern more than the benchmark.' },
    solution: 'Loan (benchmark + 2%) + swap (4% − benchmark) = 6% fixed.',
  },
  {
    id: 'f08-dg-5', lesson: 'options-payoffs', type: 'num', kind: 'numerical',
    prompt: 'An investor wrote a $30 put for $1.50. At expiry the share is $26. What is the writer’s profit a share ($, negative for a loss)?',
    answer: -2.5, check: () => 1.5 - Math.max(30 - 26, 0), unit: '$', places: 2, tol: 0.005,
    solution: 'The writer must buy at $30 a share worth $26: −4.00, plus the $1.50 premium kept: −$2.50.',
  },
  {
    id: 'f08-dg-6', lesson: 'put-call-parity', type: 'num', kind: 'numerical',
    prompt: 'A share is at $50; European options on it with strike $50 expire in one year; the continuously compounded rate is 4%. By how much must the call’s price exceed the put’s ($)?',
    answer: 1.96, check: () => 50 - 50 * Math.exp(-0.04), unit: '$', places: 2, tol: 0.005,
    solution: 'c − p = S − Ke<sup>−rT</sup> = 50 − 48.04 = $1.96.',
  },
  {
    id: 'f08-dg-7', lesson: 'binomial-pricing', type: 'num', kind: 'numerical',
    prompt: 'Redfern’s share price, now $40, will be either $50 or $32 in a year. How many shares are in the portfolio that copies a one-year call with a $40 strike (4 decimals)?',
    answer: 0.5556, check: () => oneStep({ S: 40, u: 1.25, d: 0.8, K: 40, r: 0.04 }).delta, unit: 'shares', places: 4, tol: 0.0001,
    solution: 'Delta = (10 − 0) ÷ (50 − 32) = 0.5556 shares, financed partly by borrowing.',
  },
  {
    id: 'f08-dg-8', lesson: 'black-scholes-and-greeks', type: 'num', kind: 'numerical',
    prompt: 'An investor holds 10 call contracts (100 shares each) with a delta of 0.60. How many shares does the position behave like for a small move?',
    answer: 600, check: () => 10 * 100 * 0.6, unit: 'shares', places: 0, tol: 0.5,
    solution: '1,000 options × 0.60 = 600 share-equivalents.',
  },
  {
    id: 'f08-dg-9', lesson: 'hedging-with-derivatives', type: 'num', kind: 'numerical',
    prompt: 'Redfern’s euro costs and a currency future move with standard deviations of 3.0% and 4.5% a quarter and a correlation of 0.75. What is the minimum-variance hedge ratio?',
    answer: 0.5, check: () => 0.75 * 0.03 / 0.045, unit: '', places: 2, tol: 0.005,
    solution: '0.75 × 3.0 ÷ 4.5 = 0.50.',
  },
  {
    id: 'f08-dg-10', lesson: 'margin-leverage-and-short-selling', type: 'num', kind: 'numerical',
    prompt: 'An investor has $10,000 of her own money and a broker that requires 50% initial margin. What is the largest value of shares she can buy?',
    answer: 20000, check: () => 10000 / 0.5, unit: '$', places: 0, tol: 1,
    solution: 'Her $10,000 must be at least half the purchase: 10,000 ÷ 0.5 = $20,000, with $10,000 borrowed.',
  },
  {
    id: 'f08-dg-11', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: 'A fund’s one-month 95% VaR is $30,000. Assuming independent months and a mean near zero, what is its four-month VaR ($)?',
    answer: 60000, check: () => 30000 * Math.sqrt(4), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 120000, say: 'VaR grows with the square root of time: √4 = 2, not 4.' }],
    solution: '30,000 × √4 = $60,000.',
  },
];

/** Start at module 2 or 3 when the items for the earlier modules are answered well. */
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.8 },
];
