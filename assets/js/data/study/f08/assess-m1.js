// assess-m1.js — F08 module 1 test: Forwards, futures and swaps (why-firms-hedge, forwards-and-futures,
// pricing-by-no-arbitrage, swaps). No hints; full solutions shown on review. Pinecrest Bakeries, Marlin Outdoor and
// Halyard Shipping, and all their figures, are fictional and introduced here.
import { fxForward, forwardValue, forwardPrice, marginAccount, swapRate } from '../../../core/derivatives.js?v=40';

const flourExposure = 120 * 50 * (1 - 0.4);
const oil = marginAccount({ prices: [80, 80.9, 81.8], contracts: 3, size: 1000, initial: 6000, maintenance: 4500, long: false });
const gbp = fxForward({ spot: 1.25, rDomestic: 0.04, rForeign: 0.05, T: 0.75 });
const eurVal = forwardValue({ F: 1.13, K: 1.10, r: 0.04, T: 4 / 12 }) * 500_000;
const sr = swapRate([0.97, 0.935, 0.90]);

export const items = [
  {
    id: 'f08-m1-1', lesson: 'why-firms-hedge', type: 'num', kind: 'numerical',
    prompt: 'Pinecrest Bakeries buys 120 tonnes of flour a year and can pass 40% of any rise in its cost on to customers through prices. By how much does its yearly profit fall if flour rises $50 a tonne?',
    answer: flourExposure, check: () => 120 * 50 * (1 - 0.4), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 6000, say: 'That ignores the 40% passed on; only 60% of the rise stays with Pinecrest.' }, { value: 2400, say: 'That is the part passed on to customers, not the part Pinecrest bears.' }],
    solution: '120 × $50 = $6,000 of extra cost, of which 60% stays with Pinecrest: $3,600.',
  },
  {
    id: 'f08-m1-2', lesson: 'why-firms-hedge', type: 'num', kind: 'numerical',
    prompt: 'Pinecrest’s miller offers to fix next year’s flour at $412 a tonne for all 120 tonnes. Pinecrest’s own forecast of next year’s price is $405. What is the fixed price’s expected cost?',
    answer: 840, check: () => 120 * (412 - 405), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 49440, say: 'That is the whole bill at the fixed price; the hedge’s cost is the gap from the expected price.' }],
    solution: '120 × ($412 − $405) = $840 a year: what Pinecrest expects to give up for certainty.',
  },
  {
    id: 'f08-m1-3', lesson: 'why-firms-hedge', type: 'mc', kind: 'conceptual',
    prompt: 'Which firm gains most from hedging a price it cannot pass on?',
    options: ['A listed firm with no debt, owned by diversified funds', 'A firm near its loan covenant, owned by one family', 'A firm whose costs and revenues move with the same price', 'A firm whose exposure is small next to its cash reserves'],
    answer: 1,
    feedback: { 0: 'With no distress risk and diversified owners, the frictions that make hedging valuable are weak.', 2: 'It already has a natural hedge.', 3: 'A small exposure it can absorb gives little reason to pay for protection.' },
    solution: 'Distress costs near a covenant and owners who cannot diversify are the frictions that give hedging value.',
  },
  {
    id: 'f08-m1-4', lesson: 'forwards-and-futures', type: 'num', kind: 'numerical',
    prompt: 'Halyard Shipping sells 3 crude-oil futures contracts (1,000 barrels each) at $80.00 to hedge fuel it has in storage. Initial margin is $6,000 and maintenance margin $4,500 a contract. Settlement prices on the next two days are $80.90 and $81.80. How much must Halyard pay in at the end of day 2?',
    answer: oil.rows[1].call, check: () => marginAccount({ prices: [80, 80.9, 81.8], contracts: 3, size: 1000, initial: 6000, maintenance: 4500, long: false }).rows[1].call, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 0, say: 'A short position loses as the price rises: $2,700 each day, taking the balance below $13,500.' }],
    solution: 'Start 18,000; each day −0.90 × 3,000 = −2,700, so 15,300 then 12,600, below 13,500. The call restores 18,000: $5,400.',
  },
  {
    id: 'f08-m1-5', lesson: 'forwards-and-futures', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements are true of a futures contract but not of a forward? Select all that apply.',
    options: ['Its gains and losses are settled every day', 'Its quantity can be set to any amount the parties choose', 'A clearing house stands between buyer and seller', 'It is usually closed out with an opposite trade'],
    answer: [0, 2, 3],
    feedback: { 1: 'Futures come in standard sizes; tailor-made quantities are a forward’s advantage.' },
    solution: 'Futures are standardised, cleared, marked to market daily and usually closed out before delivery.',
  },
  {
    id: 'f08-m1-6', lesson: 'pricing-by-no-arbitrage', type: 'num', kind: 'numerical',
    prompt: 'Marlin Outdoor must pay £200,000 in nine months. Spot is $1.2500 a pound; the dollar rate is 4.0% and the pound rate 5.0% a year (annual compounding). What is the no-arbitrage nine-month forward rate ($ a pound, 4 decimals)?',
    answer: Math.round(gbp * 1e4) / 1e4, check: () => fxForward({ spot: 1.25, rDomestic: 0.04, rForeign: 0.05, T: 0.75 }), unit: '$', places: 4, tol: 0.0001,
    wrong: [{ value: Math.round(fxForward({ spot: 1.25, rDomestic: 0.05, rForeign: 0.04, T: 0.75 }) * 1e4) / 1e4, say: 'The rates are the wrong way round: multiply by the dollar factor and divide by the pound factor.' }],
    solution: `1.25 × 1.04<sup>0.75</sup> ÷ 1.05<sup>0.75</sup> = $${gbp.toFixed(4)}: the pound, with the higher rate, trades at a forward discount.`,
  },
  {
    id: 'f08-m1-7', lesson: 'pricing-by-no-arbitrage', type: 'mc', kind: 'applied',
    prompt: `Gold is $2,300 an ounce, storage is negligible and the rate is 5% a year. A dealer quotes a one-year forward at $2,450. What should an arbitrageur do?`,
    options: ['Buy the forward, short gold now and invest the cash', 'Borrow, buy gold, store it and sell the forward', 'Buy the forward and wait for gold to rise', 'Nothing, since the gap is within normal noise'],
    answer: 1,
    feedback: { 0: `That trade profits when the forward is below carry ($${forwardPrice({ S: 2300, r: 0.05, T: 1 }).toFixed(0)}); here it is above.`, 2: 'That is a bet, not an arbitrage.', 3: '$35 an ounce is a riskless profit for anyone able to borrow and store gold.' },
    solution: `Carry price 2,300 × 1.05 = $2,415. The forward is $35 dear: buy spot with borrowed money, sell forward, deliver and repay.`,
  },
  {
    id: 'f08-m1-8', lesson: 'pricing-by-no-arbitrage', type: 'num', kind: 'numerical',
    prompt: 'Marlin agreed to buy €500,000 forward at $1.1000. With four months left, the forward rate for the same date is $1.1300 and the dollar rate is 4% (annual). What is Marlin’s forward worth today ($)?',
    answer: Math.round(eurVal), check: () => forwardValue({ F: 1.13, K: 1.10, r: 0.04, T: 4 / 12 }) * 500000, unit: '$', places: 0, tol: 2,
    wrong: [{ value: 15000, say: 'That is the gain at maturity; discount it for the four months left.' }],
    solution: `(1.13 − 1.10) × 500,000 ÷ 1.04<sup>1/3</sup> = 15,000 ÷ 1.01316 = $${Math.round(eurVal).toLocaleString('en-US')}.`,
  },
  {
    id: 'f08-m1-9', lesson: 'swaps', type: 'num', kind: 'numerical',
    prompt: 'Discount factors for years 1–3 are 0.970, 0.935 and 0.900. What fixed rate makes a new three-year annual swap worth zero (%, 3 decimals)?',
    answer: Math.round(sr * 1e5) / 1e3, check: () => swapRate([0.97, 0.935, 0.9]) * 100, unit: '%', places: 3, tol: 0.001,
    solution: `(1 − 0.900) ÷ (0.970 + 0.935 + 0.900) = 0.100 ÷ 2.805 = ${(sr * 100).toFixed(3)}%.`,
  },
  {
    id: 'f08-m1-10', lesson: 'swaps', type: 'num', kind: 'numerical',
    prompt: 'Halyard has a $25 million bank loan at the benchmark rate + 2.0%, and has swapped it: it pays 3.8% fixed and receives the benchmark. In a year when the benchmark is 4.6%, what is Halyard’s total interest cost across the loan and the swap ($)?',
    answer: 1450000, check: () => 25e6 * (0.046 + 0.02) - (0.046 - 0.038) * 25e6, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 1650000, say: 'That is the loan alone; the swap pays Halyard (4.6% − 3.8%) × $25 million this year.' }, { value: 950000, say: 'That is the swap rate alone; the loan’s 2.0% spread is still paid.' }],
    solution: 'Loan: 6.6% × 25m = 1,650,000. Swap: Halyard receives (4.6% − 3.8%) × 25m = 200,000. Net 1,450,000 = (3.8% + 2.0%) × 25m, whatever the benchmark.',
  },
  {
    id: 'f08-m1-11', lesson: 'swaps', type: 'mc', kind: 'conceptual',
    prompt: 'A year after entering a payer swap, market swap rates for the remaining term have fallen below its fixed rate. What has happened to its value for the fixed payer?',
    options: ['It has become a liability', 'It has become an asset', 'It is still worth zero', 'It depends only on the notional'],
    answer: 0,
    feedback: { 1: 'Paying above the market rate is a cost, so the swap is worth less than zero to the payer.', 2: 'A swap is worth zero only at the start or when rates are back at its fixed rate.', 3: 'The notional scales the value; the sign comes from the rates.' },
    solution: 'Value = (k<sub>new</sub> − k) × N × ΣDF, negative when k<sub>new</sub> < k: the payer is locked into paying more than a new swap would cost.',
  },
];
