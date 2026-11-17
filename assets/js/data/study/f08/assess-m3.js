// assess-m3.js — F08 module 3 test: Managing risk (hedging-with-derivatives, margin-leverage-and-short-selling,
// value-at-risk-and-stress-tests). No hints; full solutions shown on review. Copperline Foods, Westbay Pension Fund and
// all their figures are fictional and introduced here.
import { hedgeRatio, contractsNeeded } from '../../../core/derivatives.js?v=40';
import { kupiec } from '../../../core/risk.js?v=40';

const h = hedgeRatio({ rho: 0.9, sdSpot: 0.025, sdFutures: 0.03 }).h;
const losses = [3.1, 2.8, 2.6, 2.4, 2.2, 1.9, 1.8, 1.7];   // the 8 worst daily losses in 100 days, % of value

export const items = [
  {
    id: 'f08-m3-1', lesson: 'hedging-with-derivatives', type: 'steps', kind: 'numerical',
    prompt: 'Copperline Foods will buy $3,000,000 of soybean oil next month. Changes in its price have a standard deviation of 2.5% a month; soybean-oil futures 3.0%; correlation 0.90. Each futures contract is worth $60,000.',
    steps: [
      { id: 'f08-m3-1a', type: 'num', kind: 'numerical', prompt: 'What is the minimum-variance hedge ratio?', answer: 0.75, check: () => hedgeRatio({ rho: 0.9, sdSpot: 0.025, sdFutures: 0.03 }).h, unit: '', places: 4, tol: 0.0001 },
      { id: 'f08-m3-1b', type: 'num', kind: 'numerical', prompt: 'How many futures contracts should Copperline buy (1 decimal)?', answer: 37.5, check: () => contractsNeeded({ h, exposure: 3e6, size: 60000 }), unit: '', places: 1, tol: 0.05 },
    ],
    solution: 'h* = 0.90 × 0.025 ÷ 0.030 = 0.75; N* = 0.75 × 3,000,000 ÷ 60,000 = 37.5, so 37 or 38 contracts.',
  },
  {
    id: 'f08-m3-2', lesson: 'hedging-with-derivatives', type: 'num', kind: 'numerical',
    prompt: 'Copperline bought soybean-oil futures at $2.40 a gallon. When it buys the oil, the spot price is $2.70 and the futures $2.66. What price has it effectively paid ($ a gallon)?',
    answer: 2.44, check: () => 2.7 - (2.66 - 2.4), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 2.4, say: 'The futures price at the start is locked in only if the basis closes at zero; here it is +0.04.' }],
    solution: 'It pays 2.70 and gains 2.66 − 2.40 = 0.26 on the futures: 2.70 − 0.26 = $2.44 = F₀ + closing basis (2.40 + 0.04).',
  },
  {
    id: 'f08-m3-3', lesson: 'hedging-with-derivatives', type: 'num', kind: 'numerical',
    prompt: 'Westbay Pension Fund holds $8,000,000 of shares with a beta of 1.1 and wants a beta of 0.5 for three months. Index futures are at 5,200 with a $50 multiplier. How many contracts must it sell (2 decimals)?',
    answer: Math.round((1.1 - 0.5) * 8e6 / 260000 * 100) / 100, check: () => (1.1 - 0.5) * 8e6 / (5200 * 50), unit: '', places: 2, tol: 0.01,
    solution: '(1.1 − 0.5) × 8,000,000 ÷ 260,000 = 18.46, so about 18 contracts.',
  },
  {
    id: 'f08-m3-4', lesson: 'hedging-with-derivatives', type: 'mc', kind: 'applied',
    prompt: 'Westbay wants protection against a fall in its shares over the next year, will pay no premium, and accepts giving up gains above 8%. Which hedge fits?',
    options: ['Sell index futures for the whole portfolio', 'A collar: buy index puts, write calls 8% higher', 'Buy index puts and nothing else', 'Write index puts to earn income'],
    answer: 1,
    feedback: { 0: 'Futures remove the gains as well as the losses, not only those above 8%.', 2: 'Puts alone cost a premium.', 3: 'Written puts add to losses in a fall.' },
    solution: 'The calls written pay for the puts bought: a floor below and a cap 8% above, at little or no net cost.',
  },
  {
    id: 'f08-m3-5', lesson: 'margin-leverage-and-short-selling', type: 'num', kind: 'numerical',
    prompt: 'An investor buys 400 shares at $75, paying 60% and borrowing the rest. The broker’s maintenance margin is 30%. Below what price does a margin call come?',
    answer: Math.round(12000 / (400 * 0.7) * 100) / 100, check: () => (400 * 75 * 0.4) / (400 * 0.7), unit: '$', places: 2, tol: 0.005,
    solution: 'Loan 400 × 75 × 40% = 12,000. P* = 12,000 ÷ (400 × 0.70) = $42.86.',
  },
  {
    id: 'f08-m3-7', lesson: 'margin-leverage-and-short-selling', type: 'num', kind: 'numerical',
    prompt: 'A trader sells 800 shares short at $30 and buys them back three months later at $26. The borrowing fee is 2% a year on the sale value; no dividend is paid. What is the profit ($)?',
    answer: 3080, check: () => (30 - 26) * 800 - 800 * 30 * 0.02 * 0.25, unit: '$', places: 0, tol: 1,
    solution: 'Gain (30 − 26) × 800 = 3,200; fee 24,000 × 2% × ¼ = 120; profit $3,080.',
  },
  {
    id: 'f08-m3-8', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: 'Westbay reports a ten-day 99% VaR for its $5,000,000 bond portfolio. Daily returns have mean zero and standard deviation 0.9%, and are assumed independent. What is the ten-day VaR ($)? (z = 2.326)',
    answer: Math.round(2.326 * 0.009 * Math.sqrt(10) * 5e6), check: () => 2.326 * 0.009 * Math.sqrt(10) * 5e6, unit: '$', places: 0, tol: 2,
    wrong: [{ value: Math.round(2.326 * 0.009 * 10 * 5e6), say: 'With independent days the standard deviation grows with √10, not 10.' }],
    solution: `One day: 2.326 × 0.009 × 5,000,000 = 104,670; ten days: × √10 = $${Math.round(2.326 * 0.009 * Math.sqrt(10) * 5e6).toLocaleString('en-US')}.`,
  },
  {
    id: 'f08-m3-9', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: `Over 100 days, Copperline’s treasury portfolio had these eight worst daily losses, as % of its value: ${losses.join(', ')}. Using the worst 5 days, what is the 95% one-day expected shortfall (%)?`,
    answer: 2.62, check: () => losses.slice(0, 5).reduce((s, x) => s + x, 0) / 5, unit: '%', places: 2, tol: 0.005,
    wrong: [{ value: 2.2, say: 'That is the fifth-worst loss, near the VaR. Expected shortfall averages the tail.' }],
    solution: '(3.1 + 2.8 + 2.6 + 2.4 + 2.2) ÷ 5 = 2.62%.',
  },
  {
    id: 'f08-m3-10', lesson: 'value-at-risk-and-stress-tests', type: 'mc', kind: 'applied',
    prompt: `A 99% one-day VaR was exceeded on 9 of 250 days (2.5 were expected; Kupiec’s p-value is ${kupiec(9, 250, 0.01).p.toFixed(3)}). What should the risk manager conclude?`,
    options: ['The model understates risk and should be revised', 'The model is conservative, since it erred on the safe side', 'Nine exceptions is within normal luck at 99%', 'VaR models cannot be tested with only 250 days'],
    answer: 0,
    feedback: { 1: 'More exceptions than expected means the VaR was too low, not too high.', 2: 'The p-value is far below 0.05: so many exceptions are very unlikely if the model were right.', 3: 'A year of daily data is the standard regulatory backtest.' },
    solution: 'Losses beat the VaR far more often than 1%: the model understates risk.',
  },
  {
    id: 'f08-m3-11', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: 'Westbay stress-tests a scenario: shares fall 30% and interest rates rise 1 percentage point. It holds $2,000,000 of shares and $1,000,000 of bonds with a duration of 6 (ignore convexity). What is the total loss ($)?',
    answer: 660000, check: () => 2e6 * 0.3 + 1e6 * 6 * 0.01, unit: '$', places: 0, tol: 1,
    solution: 'Shares 600,000; bonds 1,000,000 × 6 × 1% = 60,000; total $660,000.',
  },
  {
    id: 'f08-m3-12', lesson: 'value-at-risk-and-stress-tests', type: 'mc', kind: 'conceptual',
    prompt: 'Two desks each report a 95% VaR of $1 million. Desk A’s worst days lose about $1.2 million; desk B’s lose up to $6 million. Which measure shows the difference?',
    options: ['Expected shortfall', 'The VaR at 90% confidence', 'The number of trades on each desk', 'The square-root-of-time rule'],
    answer: 0,
    feedback: { 1: 'A lower confidence level looks even less far into the tail.', 2: 'Trade counts say nothing about tail losses.', 3: 'Scaling changes the horizon, not what is measured.' },
    solution: 'Expected shortfall averages the losses beyond VaR, so it is far larger for desk B.',
  },
  {
    id: 'f08-m3-13', lesson: 'hedging-with-derivatives', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a minimum-variance cross hedge usually leave some risk, however many contracts are used?',
    options: ['The futures and the exposure are not perfectly correlated', 'Because exchanges limit how many contracts one firm may hold', 'Because futures prices never move by more than the spot price', 'Because margin calls cancel part of every gain on the futures'],
    answer: 0,
    feedback: { 1: 'Position limits exist but are not why risk remains.', 2: 'Futures can move more than spot; that is why h* can be below 1.', 3: 'Margin moves cash in time; it does not change the gain.' },
    solution: 'The risk left is σ<sub>S</sub>√(1 − ρ²): with ρ below 1, part of the exposure moves independently of the futures.',
  },
];
