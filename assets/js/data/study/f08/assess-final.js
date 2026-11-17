// assess-final.js — F08 final: all three modules, 22 items; 70% passes. No hints; solutions on review. Kestrel Air,
// Northwind Avocado Growers, Lumen Labs and all their figures are fictional and introduced here. Option items use
// continuously compounded rates.
import { discountFactors, swapRate, oneStep } from '../../../core/derivatives.js?v=40';
import { blackScholes } from '../../../core/fin.js?v=40';

const df2 = discountFactors([0.035, 0.04]), k2 = swapRate(df2);
const putOne = oneStep({ S: 80, u: 1.15, d: 0.9, K: 80, r: 0.02, type: 'put' });
const bsPut = blackScholes({ S: 80, K: 80, T: 0.5, r: 0.04, sigma: 0.35, type: 'put' });

export const items = [
  // ---------------------------------------------------------------- module 1
  {
    id: 'f08-fn-1', lesson: 'why-firms-hedge', type: 'num', kind: 'numerical',
    prompt: 'Kestrel Air (fictional) will burn 40 million gallons of jet fuel next year and has fixed the price of 60% of it. By how much does its fuel bill rise if the price of unhedged fuel rises $0.10 a gallon?',
    answer: 1600000, check: () => 40e6 * (1 - 0.6) * 0.1, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 4000000, say: 'Only the 40% left unhedged is exposed.' }, { value: 2400000, say: 'That is the hedged 60%, whose price is fixed.' }],
    solution: '40,000,000 × 40% × $0.10 = $1,600,000.',
  },
  {
    id: 'f08-fn-2', lesson: 'why-firms-hedge', type: 'mc', kind: 'conceptual',
    prompt: 'An economist says Kestrel’s hedging cannot add value for its shareholders. In which world is that true?',
    options: ['One with no taxes, distress costs or trading frictions', 'One where fuel prices are certain to rise next year', 'One where the airline has no debt but many competitors', 'One where fuel is bought only with forward contracts'],
    answer: 0,
    feedback: { 1: 'If a rise were certain, forward prices would already reflect it.', 2: 'Competitors matter for strategy; the argument rests on frictions.', 3: 'The instrument does not change the argument.' },
    solution: 'With fair prices and no frictions, shareholders can hedge or diversify for themselves, so the firm’s hedging changes risk but not value.',
  },
  {
    id: 'f08-fn-3', lesson: 'forwards-and-futures', type: 'num', kind: 'numerical',
    prompt: 'Northwind Avocado Growers (fictional) sold 10 futures contracts of 40,000 lb at $1.85 a lb and later closed them by buying at $1.72. What was the total gain on the futures ($)?',
    answer: 52000, check: () => (1.85 - 1.72) * 40000 * 10, unit: '$', places: 0, tol: 1,
    solution: 'Short: (1.85 − 1.72) × 40,000 × 10 = $52,000, received day by day through the margin account.',
  },
  {
    id: 'f08-fn-4', lesson: 'forwards-and-futures', type: 'mc', kind: 'conceptual',
    prompt: 'Northwind can fix its price with a forward from one packer or with exchange futures. Which risk does it take with the packer that it largely avoids with futures?',
    options: ['That the packer fails to honour the contract', 'That avocado prices change before the harvest', 'That it must deliver avocados of a set quality', 'That interest rates rise during the season'],
    answer: 0,
    feedback: { 1: 'Both contracts fix the price; that is the point of either.', 2: 'Quality terms exist in both, and are tighter in futures.', 3: 'Neither contract is mainly about interest rates.' },
    solution: 'A forward depends on the other party; futures are guaranteed by the clearing house and margin.',
  },
  {
    id: 'f08-fn-5', lesson: 'pricing-by-no-arbitrage', type: 'num', kind: 'numerical',
    prompt: 'A share index stands at 4,800 with a continuous dividend yield of 1.8%; the continuously compounded rate is 4.5%. What is the six-month futures price?',
    answer: Math.round(4800 * Math.exp((0.045 - 0.018) * 0.5) * 100) / 100, check: () => 4800 * Math.exp(0.027 * 0.5), unit: '', places: 2, tol: 0.05,
    solution: `4,800 × e<sup>(0.045 − 0.018) × 0.5</sup> = ${(4800 * Math.exp(0.0135)).toFixed(2)}.`,
  },
  {
    id: 'f08-fn-6', lesson: 'pricing-by-no-arbitrage', type: 'mc', kind: 'conceptual',
    prompt: 'Why does the currency with the higher interest rate trade at a forward discount?',
    options: ['Holding it earns more interest, which the forward rate offsets', 'Markets expect high-rate currencies to weaken by exactly that amount', 'Banks charge more to sell high-rate currencies forward', 'High interest rates make a currency’s spot rate unreliable'],
    answer: 0,
    feedback: { 1: 'The forward rate is fixed by arbitrage, whatever anyone expects.', 2: 'Banks’ margins are small; the discount comes from the rates.', 3: 'Spot rates are as reliable either way.' },
    solution: 'Covered interest-rate parity: otherwise borrowing the low-rate currency, investing in the high-rate one and selling it forward would be riskless profit.',
  },
  {
    id: 'f08-fn-7', lesson: 'swaps', type: 'num', kind: 'numerical',
    prompt: 'Zero rates are 3.5% for one year and 4.0% for two years (annual compounding). What is the two-year annual swap rate (%, 3 decimals)?',
    answer: Math.round(k2 * 1e5) / 1e3, check: () => swapRate(discountFactors([0.035, 0.04])) * 100, unit: '%', places: 3, tol: 0.001,
    solution: `DF₁ = ${df2[0].toFixed(6)}, DF₂ = ${df2[1].toFixed(6)}; k = (1 − DF₂) ÷ (DF₁ + DF₂) = ${(k2 * 100).toFixed(3)}%.`,
  },
  {
    id: 'f08-fn-8', lesson: 'swaps', type: 'num', kind: 'numerical',
    prompt: 'A bank receives 3.2% fixed on a $50 million swap with three annual payments left. Today’s three-year swap rate is 3.9% and the three discount factors sum to 2.75. What is the swap worth to the bank ($)?',
    answer: -962500, check: () => -(0.039 - 0.032) * 50e6 * 2.75, unit: '$', places: 0, tol: 1,
    solution: 'To the fixed payer: (3.9% − 3.2%) × 50m × 2.75 = 962,500; the receiver’s value is the negative: −$962,500.',
  },
  // ---------------------------------------------------------------- module 2
  {
    id: 'f08-fn-9', lesson: 'options-payoffs', type: 'num', kind: 'numerical',
    prompt: 'A trader buys a Lumen Labs (fictional) straddle with strike $80: the call costs $6.20 and the put $5.30. Lumen ends at $95. What is the profit a share ($)?',
    answer: 3.5, check: () => Math.abs(95 - 80) - (6.2 + 5.3), unit: '$', places: 2, tol: 0.005,
    solution: 'The call pays 15; the put expires worthless; profit 15 − 11.50 = $3.50.',
  },
  {
    id: 'f08-fn-10', lesson: 'options-payoffs', type: 'mc', kind: 'applied',
    prompt: 'Northwind wants a minimum price for its avocados but to benefit fully if prices rise. Which hedge fits?',
    options: ['Buy put options on avocado futures', 'Sell avocado futures for the whole crop', 'Write call options on avocado futures', 'Buy call options on avocado futures'],
    answer: 0,
    feedback: { 1: 'Futures fix the price, giving up the benefit of a rise.', 2: 'Writing calls gives up the rise in return for a premium, and sets no floor.', 3: 'Calls gain when prices rise, adding to an exposure Northwind already has.' },
    solution: 'A seller wants a floor: puts pay when prices fall and cost only the premium otherwise.',
  },
  {
    id: 'f08-fn-11', lesson: 'put-call-parity', type: 'num', kind: 'numerical',
    prompt: 'Lumen Labs trades at $80 and pays no dividend. A one-year European $85 put costs $8.10 and the continuously compounded rate is 4%. What must the matching call cost ($)?',
    answer: Math.round((8.1 + 80 - 85 * Math.exp(-0.04)) * 100) / 100, check: () => 8.1 + 80 - 85 * Math.exp(-0.04), unit: '$', places: 2, tol: 0.005,
    solution: `c = p + S − Ke<sup>−rT</sup> = 8.10 + 80 − 81.67 = $${(8.1 + 80 - 85 * Math.exp(-0.04)).toFixed(2)}.`,
  },
  {
    id: 'f08-fn-12', lesson: 'binomial-pricing', type: 'num', kind: 'numerical',
    prompt: 'In one step Lumen Labs will move from $80 to $92 or $72; the risk-free rate for the step is 2%. What is a $80 put worth ($)?',
    answer: Math.round(putOne.price * 100) / 100, check: () => oneStep({ S: 80, u: 1.15, d: 0.9, K: 80, r: 0.02, type: 'put' }).price, unit: '$', places: 2, tol: 0.005,
    solution: `p = (1.02 − 0.90) ÷ 0.25 = ${putOne.p.toFixed(2)}; the put pays 8 in the down state: (1 − ${putOne.p.toFixed(2)}) × 8 ÷ 1.02 = $${putOne.price.toFixed(2)}.`,
  },
  {
    id: 'f08-fn-13', lesson: 'binomial-pricing', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst is sure Lumen Labs will rise. Why does that belief not change the call’s no-arbitrage price?',
    options: ['The share price already reflects such views, and the call is priced against it', 'Because option prices are set by the exchange each morning', 'Because calls ignore the direction of the share price', 'Because the analyst’s view must be checked by the regulator'],
    answer: 0,
    feedback: { 1: 'Prices come from trading, held in line by replication.', 2: 'Call values rise with the share price; direction matters to the payoff, not to the replication price.', 3: 'Views are not regulated.' },
    solution: 'The call is replicated from the share and borrowing at today’s prices; beliefs enter only through the share price itself.',
  },
  {
    id: 'f08-fn-14', lesson: 'black-scholes-and-greeks', type: 'num', kind: 'numerical',
    prompt: 'Price a six-month European $80 put on Lumen Labs: share $80, continuously compounded rate 4%, volatility 35%.',
    answer: Math.round(bsPut.price * 100) / 100, check: () => blackScholes({ S: 80, K: 80, T: 0.5, r: 0.04, sigma: 0.35, type: 'put' }).price, unit: '$', places: 2, tol: 0.005,
    solution: `d₁ = (0.04 + 0.06125) × 0.5 ÷ 0.2475 = ${bsPut.d1.toFixed(4)}; d₂ = ${bsPut.d2.toFixed(4)}; p = 80e<sup>−0.02</sup>N(−d₂) − 80N(−d₁) = $${bsPut.price.toFixed(2)}.`,
  },
  {
    id: 'f08-fn-15', lesson: 'black-scholes-and-greeks', type: 'num', kind: 'numerical',
    prompt: 'A Lumen call has delta 0.45 and gamma 0.03. Using both, estimate the change in its value if the share falls $3 ($).',
    answer: -1.215, check: () => 0.45 * -3 + 0.5 * 0.03 * 9, unit: '$', places: 3, tol: 0.001,
    wrong: [{ value: -1.35, say: 'That uses delta only; add ½ × gamma × 9.' }],
    solution: '0.45 × (−3) + ½ × 0.03 × 9 = −1.35 + 0.135 = −$1.215.',
  },
  // ---------------------------------------------------------------- module 3
  {
    id: 'f08-fn-16', lesson: 'hedging-with-derivatives', type: 'num', kind: 'numerical',
    prompt: 'Northwind sold futures at $1.85 a lb. When it sells its crop, spot is $1.60 and the futures $1.68. What price has it effectively received ($ a lb)?',
    answer: 1.77, check: () => 1.6 + (1.85 - 1.68), unit: '$', places: 2, tol: 0.005,
    solution: '1.60 + (1.85 − 1.68) = $1.77 = F₀ + closing basis (1.85 − 0.08).',
  },
  {
    id: 'f08-fn-17', lesson: 'hedging-with-derivatives', type: 'num', kind: 'numerical',
    prompt: 'Kestrel hedges $84 million of jet fuel with heating-oil futures worth $105,000 a contract, using a hedge ratio of 0.70. How many contracts does it buy?',
    answer: 560, check: () => 0.7 * 84e6 / 105000, unit: '', places: 0, tol: 0.5,
    solution: '0.70 × 84,000,000 ÷ 105,000 = 560 contracts.',
  },
  {
    id: 'f08-fn-18', lesson: 'margin-leverage-and-short-selling', type: 'num', kind: 'numerical',
    prompt: 'A hedge fund is short 2,500 Lumen Labs shares sold at $16, and its account holds the $40,000 proceeds plus $20,000 of margin. Lumen now trades at $18. What is the account’s margin ratio, equity ÷ value of the shares owed (%, 1 decimal)?',
    answer: 33.3, check: () => (60000 - 2500 * 18) / (2500 * 18) * 100, unit: '%', places: 1, tol: 0.05,
    solution: 'Equity 60,000 − 45,000 = 15,000; 15,000 ÷ 45,000 = 33.3%, just above a 30% maintenance margin.',
  },
  {
    id: 'f08-fn-19', lesson: 'margin-leverage-and-short-selling', type: 'mc', kind: 'conceptual',
    prompt: 'Why can a fall in prices feed on itself when many investors use borrowed money?',
    options: ['Margin calls force sales, which push prices lower and bring more calls', 'Lenders cut interest rates, which encourages more borrowing to buy', 'Short sellers must close their positions when prices fall', 'Falling prices raise the value of the collateral lenders hold'],
    answer: 0,
    feedback: { 1: 'Lenders tend to raise margins in volatile markets, not cut rates.', 2: 'Short sellers profit from falls; forced buying comes after rises.', 3: 'Falling prices lower collateral values.' },
    solution: 'A liquidity spiral: forced selling meets few buyers, prices fall further, and margins rise.',
  },
  {
    id: 'f08-fn-20', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: 'Kestrel’s $2,000,000 pension-fund holding has normally distributed monthly returns with mean zero and standard deviation 5%. What is its one-month 95% expected shortfall ($)? (The standard normal density at 1.645 is 0.1031.)',
    answer: 206200, check: () => 0.05 * 0.1031 / 0.05 * 2e6, unit: '$', places: 0, tol: 2,
    wrong: [{ value: 164500, say: 'That is the 95% VaR. Expected shortfall averages the tail beyond it: σφ(z) ÷ (1 − c).' }],
    solution: 'ES = σ × φ(1.645) ÷ 0.05 × V = 0.05 × 0.1031 ÷ 0.05 × 2,000,000 = $206,200, against a VaR of $164,500.',
  },
  {
    id: 'f08-fn-21', lesson: 'value-at-risk-and-stress-tests', type: 'mc', kind: 'applied',
    prompt: 'A VaR model built on the last two years of daily data has the right number of exceptions overall, but most came in the weeks after a market shock. What would improve it?',
    options: ['Weight recent days more, so it reacts faster', 'Use a lower confidence level, so it has fewer exceptions', 'Drop the shock weeks from the data as outliers', 'Report the VaR monthly instead of daily'],
    answer: 0,
    feedback: { 1: 'A lower confidence level gives more exceptions, not fewer.', 2: 'The shocks are exactly the risk the model must capture.', 3: 'A longer horizon hides the problem without fixing it.' },
    solution: 'Clustered exceptions show slow adaptation; volatility weighting (for example EWMA) and stress tests address it.',
  },
  {
    id: 'f08-fn-22', lesson: 'value-at-risk-and-stress-tests', type: 'num', kind: 'numerical',
    prompt: 'A $1,000,000 index fund holding is protected by index puts struck 10% below today’s level, bought for $18,000. In a stress test the index falls 25%. What is the total loss including the premium ($)?',
    answer: 118000, check: () => 1e6 * 0.25 - 1e6 * 0.15 + 18000, unit: '$', places: 0, tol: 1,
    solution: 'The holding loses 250,000; the puts pay 15% × 1,000,000 = 150,000; plus the 18,000 premium: $118,000.',
  },
];
