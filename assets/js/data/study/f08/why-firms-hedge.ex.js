// why-firms-hedge.ex.js — F08 · Why firms hedge: widgets, practice and the knowledge check (answer keys live here).
// Figures from case.js (COFFEE, ebitda2029, DEBT_SERVICE_2029); every num item's `check` recomputes its answer.
import { COFFEE as K, DERIVED as D, ebitda2029, DEBT_SERVICE_2029 as DS } from './case.js?v=39';

const $ = (x) => `$${Math.round(x).toLocaleString('en-US')}`;

export const widgets = {
  'wh-coffee': {
    type: 'formula', title: 'Lantern’s 2029 EBITDA and the price of coffee',
    intro: 'F07’s base case assumes $36.00 a kg. Kilnworth will fix the price at $37.50 for any share of 2029’s 2,400 kg.',
    inputs: [
      { id: 'p', label: 'Kilnworth’s 2029 list price ($ a kg)', min: 24, max: 60, step: 0.6, value: 43.2, fmt: 'num' },
      { id: 'h', label: 'Share fixed at $37.50', min: 0, max: 100, step: 10, value: 0, fmt: 'pct' },
    ],
    compute: (v) => {
      const h = v.h / 100, e = ebitda2029(v.p, h), cost = K.kgRoasted * (h * K.forwardPerKg + (1 - h) * v.p);
      const xs = Array.from({ length: 13 }, (_, i) => 24 + 3 * i);
      return {
        headline: { label: '2029 EBITDA', value: $(e) },
        rows: [['Coffee bill', $(cost)], ['Change from the plan', `${e >= D.ebitda2029 ? '+' : '−'}${$(Math.abs(e - D.ebitda2029))}`], ['Debt-service cover (EBITDA ÷ debt service)', `${(e / DS).toFixed(2)}×`], ['EBITDA with no hedge', $(ebitda2029(v.p, 0))], ['EBITDA fully hedged', $(ebitda2029(v.p, 1))]],
        note: h === 0 ? 'With no hedge, every $1 a kg moves EBITDA by $2,400.' : `With ${v.h}% fixed, every $1 a kg moves EBITDA by ${$(K.kgRoasted * (1 - h))}; the fixed part costs the same at any price.`,
        chart: { kind: 'line', x: { label: 'Kilnworth’s price ($ a kg)', values: xs },
          series: [{ name: 'No hedge', values: xs.map((p) => Math.round(ebitda2029(p, 0))) }, { name: 'Fully hedged', values: xs.map((p) => Math.round(ebitda2029(p, 1))) },
            ...(h > 0 && h < 1 ? [{ name: `${v.h}% hedged`, values: xs.map((p) => Math.round(ebitda2029(p, h))) }] : [])],
          y: { label: '2029 EBITDA ($)', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-wh-g1', type: 'num', kind: 'numerical',
    prompt: 'A bakery buys 18,000 kg of flour a year. By how much does its annual profit change for each $0.10 a kg rise in the price of flour, if it cannot raise its own prices?',
    answer: 1800, check: () => 18000 * 0.10, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 180, say: 'That is the change for a $0.01 rise. Multiply the quantity by $0.10.' }],
    hints: ['Exposure = quantity × change in price.', '18,000 kg × $0.10.'],
    solution: '18,000 × $0.10 = $1,800 a year less profit for each $0.10 a kg.',
  },
  {
    id: 'f08-wh-g2', type: 'steps', kind: 'numerical',
    prompt: `Lantern fixes the price of all its 2029 coffee (2,400 kg) at $37.50 a kg. F07’s plan assumes $36.00 a kg and EBITDA of ${$(D.ebitda2029)}.`,
    steps: [
      { id: 'f08-wh-g2a', type: 'num', kind: 'numerical', prompt: 'What is the 2029 coffee bill with the fixed price ($)?', answer: 90000, check: () => 2400 * 37.5, unit: '$', places: 0, tol: 1, hints: ['2,400 × $37.50.'] },
      { id: 'f08-wh-g2b', type: 'num', kind: 'numerical', prompt: 'What is 2029 EBITDA with the fixed price ($)?', answer: Math.round(ebitda2029(36, 1)), check: () => D.ebitda2029 - (90000 - 86400), unit: '$', places: 0, tol: 1, hints: ['The bill is $3,600 more than the plan’s $86,400.'] },
      { id: 'f08-wh-g2c', type: 'num', kind: 'numerical', prompt: 'If Kilnworth’s list price turns out to be $30.00, how much better off would Lantern have been without the contract ($)?', answer: 18000, check: () => 2400 * (37.5 - 30), unit: '$', places: 0, tol: 1, hints: ['Compare the bill at $37.50 with the bill at $30.00.'] },
    ],
    solution: `The bill is 2,400 × 37.50 = $90,000, so EBITDA is ${$(ebitda2029(36, 1))} at any price. At $30.00 the unhedged bill would have been $72,000, $18,000 less: the hedge gives up the gain from a fall.`,
  },
  {
    id: 'f08-wh-g3', type: 'num', kind: 'numerical',
    prompt: 'A supplier offers to fix next year’s price of a material at $52 a tonne. The business expects the price to be $50 a tonne next year and buys 3,000 tonnes a year. What is the expected cost of fixing the price ($)?',
    answer: 6000, check: () => 3000 * (52 - 50), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 156000, say: 'That is the whole bill at the fixed price. The cost of the hedge is the difference from the expected price.' }],
    hints: ['Compare the fixed price with the price expected next year, not with today’s.', '3,000 × (52 − 50).'],
    solution: '3,000 × ($52 − $50) = $6,000 a year in expected terms: what the business gives up, on average, for certainty.',
  },
  {
    id: 'f08-wh-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why, in markets with no taxes, no distress costs and no trading costs, does a fairly priced hedge not make a firm more valuable?',
    options: ['It changes the spread of outcomes, not their average', 'Because hedging contracts are always overpriced by the banks that sell them', 'Because a hedge always loses money in the end', 'Because firms in such markets have no risks to hedge'],
    answer: 0,
    feedback: { 1: 'The argument assumes fair prices; overpricing is a separate cost.', 2: 'A hedge gains in some outcomes and loses in others; at a fair price the average is about zero.', 3: 'The risks are there; the point is that investors can bear or hedge them as cheaply as the firm.' },
    hints: ['What does a fair forward cost to enter, and what is its expected payoff?'],
    solution: 'A fair hedge has an expected payoff of about zero, and investors can reduce the risk themselves at the same cost (by hedging or diversifying), so they will not pay more for a hedged firm.',
  },
];

export const independent = [
  {
    id: 'f08-wh-i1', type: 'num', kind: 'numerical',
    prompt: `What would Lantern’s 2029 EBITDA be if Kilnworth’s price rose to $40.00 a kg and nothing was hedged? (Plan: $36.00 a kg, EBITDA ${$(D.ebitda2029)}, 2,400 kg.)`,
    answer: Math.round(ebitda2029(40, 0)), check: () => D.ebitda2029 - 2400 * 4, unit: '$', places: 0, tol: 1,
    solution: `${$(D.ebitda2029)} − 2,400 × $4 = ${$(ebitda2029(40, 0))}.`,
  },
  {
    id: 'f08-wh-i2', type: 'num', kind: 'numerical',
    prompt: 'Lantern fixes 75% of its 2,400 kg at $37.50 and buys the rest at the list price. What is its coffee bill if the list price is $44.00 a kg ($)?',
    answer: 93900, check: () => 2400 * (0.75 * 37.5 + 0.25 * 44), unit: '$', places: 0, tol: 1,
    solution: '2,400 × (0.75 × 37.50 + 0.25 × 44.00) = 2,400 × 39.125 = $93,900.',
  },
  {
    id: 'f08-wh-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Is each position a hedge or speculation?',
    items: ['A café that agrees today to buy next year’s coffee at a fixed price', 'An investor with no business in coffee who buys coffee futures expecting prices to rise', 'An exporter paid in euros who agrees today to sell those euros for dollars in six months', 'A café that buys fixed-price coffee for three times the amount it uses'],
    categories: ['Hedge', 'Speculation'],
    answer: [0, 1, 0, 1],
    feedback: { 3: 'Only the coffee it uses is a hedge; the rest is a position that gains or loses on its own.' },
    solution: 'A position is a hedge when it offsets a risk its holder already has. The investor has no coffee risk to offset, and the café buying three times its needs is hedged on a third and speculating on the rest.',
  },
  {
    id: 'f08-wh-i4', type: 'num', kind: 'numerical',
    prompt: 'A firm estimates a 5% chance that, without a hedge, it breaks a covenant at a cost of $400,000. A hedge removes that chance and has an expected cost of $15,000. By how much does the hedge raise the firm’s expected cash flow ($)?',
    answer: 5000, check: () => 0.05 * 400000 - 15000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 20000, say: 'That is the expected distress cost avoided; subtract the hedge’s expected cost.' }],
    solution: '0.05 × $400,000 = $20,000 of expected distress costs avoided, less $15,000 expected cost of the hedge = $5,000.',
  },
  {
    id: 'f08-wh-i5', type: 'mc', kind: 'applied',
    prompt: 'Lantern can pass on half of any rise in the price of coffee through its menu. What is its exposure to coffee, in EBITDA for each $1 a kg?',
    options: ['$1,200', '$2,400', '$600', '$4,800'],
    answer: 0,
    feedback: { 1: 'That ignores the half passed on to customers.', 2: 'Half of $2,400 is $1,200, not a quarter.', 3: 'Passing costs on reduces the exposure; it cannot double it.' },
    solution: '2,400 kg × $1 × (1 − 0.5) = $1,200. Hedging the full $2,400 would over-hedge.',
  },
];

export const check = [
  {
    id: 'f08-wh-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a forward contract to buy at a fixed price do to the buyer’s outcomes?',
    options: ['It removes losses from a price rise and gains from a fall', 'It removes losses from a rise but keeps the gains from a fall', 'It keeps both but lowers the average price paid', 'It removes all of the buyer’s risk, whatever quantity it ends up needing'],
    answer: 0,
    feedback: { 1: 'That describes an option, which costs a premium up front.', 2: 'A fair forward does not lower the expected price; it fixes it.', 3: 'Only if the quantity is known; buying more or less than it needs leaves some risk.' },
    solution: 'A forward fixes the price, so the buyer gives up the gain from a fall in return for protection against a rise.',
  },
  {
    id: 'f08-wh-k2', type: 'num', kind: 'numerical',
    prompt: 'A chain buys 50,000 kg of coffee a year and cannot pass on price changes. By how much does its profit fall if the price rises from $36 to $40 a kg ($)?',
    answer: 200000, check: () => 50000 * 4, unit: '$', places: 0, tol: 1,
    solution: '50,000 × ($40 − $36) = $200,000.',
  },
  {
    id: 'f08-wh-k3', type: 'num', kind: 'numerical',
    prompt: 'A forward fixes the price at $8.40 a unit for 20,000 units. The price expected at delivery is $8.10. What is the hedge’s expected cost ($)?',
    answer: 6000, check: () => 20000 * (8.4 - 8.1), unit: '$', places: 0, tol: 1,
    solution: '20,000 × ($8.40 − $8.10) = $6,000.',
  },
  {
    id: 'f08-wh-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are reasons hedging can add value to a firm? Select all that apply.',
    options: ['It lowers the expected costs of financial distress', 'It keeps cash available for planned investment in bad years', 'Its owners cannot diversify the risk away', 'A hedge raises the firm’s expected operating profit at any fair price'],
    answer: [0, 1, 2],
    feedback: { 3: 'A fair hedge changes the spread of outcomes, not the average.' },
    solution: 'Distress costs, investment plans and undiversified owners are frictions that make lower risk valuable. A fair hedge does not raise expected profit.',
  },
  {
    id: 'f08-wh-k5', type: 'mc', kind: 'applied',
    prompt: 'Coffee prices fall during 2029 and Lantern pays $37.50 a kg under its fixed-price contract while the list price is $33. What is the best judgement of the hedge?',
    options: ['It did its job: it removed the risk of a rise', 'It was a mistake, because it lost money', 'It should be cancelled and replaced by a lower fixed price for the rest of 2029', 'It shows that hedging always costs more than it saves'],
    answer: 0,
    feedback: { 1: 'A hedge is judged by the risk it removed, not by the outcome; it would have gained had prices risen.', 2: 'Locking in a lower price now is a new decision; it does not undo the old one.', 3: 'One outcome tells little about the average; the expected cost was the difference from the expected price.' },
    solution: 'The hedge gave certainty at an expected cost; that prices fell is the outcome it gave up, not a sign it failed.',
  },
  {
    id: 'f08-wh-k6', type: 'num', kind: 'applied',
    prompt: `With all 2,400 kg fixed at $37.50, what is Lantern’s 2029 debt-service cover (EBITDA ÷ debt service of ${$(DS)})? Give two decimals.`,
    answer: Math.round(ebitda2029(36, 1) / DS * 100) / 100, check: () => (D.ebitda2029 - 3600) / DS, unit: '×', places: 2, tol: 0.01,
    solution: `EBITDA ${$(ebitda2029(36, 1))} ÷ ${$(DS)} = ${(ebitda2029(36, 1) / DS).toFixed(2)} times, at any coffee price.`,
  },
];
