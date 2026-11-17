// forwards-and-futures.ex.js — F08 · Forwards and futures: widgets, practice and the knowledge check (answer keys here).
// Figures from case.js (EURO, COFFEE.futures, DERIVED); every num item's `check` recomputes its answer.
import { EURO as E, COFFEE as K, DERIVED as D } from './case.js?v=40';
import { marginAccount } from '../../../core/derivatives.js?v=40';

const $ = (x) => `${x < 0 ? '−' : ''}$${Math.round(Math.abs(x)).toLocaleString('en-US')}`;
const fut = K.futures;

export const widgets = {
  'ff-forward': {
    type: 'formula', title: 'Lantern’s euro forward at maturity',
    intro: 'Lantern buys €38,000 forward for 31 March 2029. Coastline’s quote is $1.0920 a euro.',
    inputs: [
      { id: 'K', label: 'Delivery price ($ a euro)', min: 1.04, max: 1.14, step: 0.001, value: 1.092, fmt: 'num' },
      { id: 'S', label: 'Spot rate on 31 March ($ a euro)', min: 0.95, max: 1.25, step: 0.005, value: 1.15, fmt: 'num' },
    ],
    compute: (v) => {
      const pay = (v.S - v.K) * E.amount, spot = v.S * E.amount;
      const xs = Array.from({ length: 13 }, (_, i) => Math.round((0.95 + 0.025 * i) * 1000) / 1000);
      return {
        headline: { label: 'Payoff of the long forward', value: $(pay) },
        rows: [['Cost of €38,000 at the spot rate', $(spot)], ['Net cost with the forward', $(spot - pay)], ['Payoff to Coastline (the short side)', $(-pay)]],
        note: pay >= 0 ? 'The euro ended above the delivery price: the forward saved Lantern money, and Coastline lost the same amount.' : 'The euro ended below the delivery price: Lantern would have done better without the forward. Its cost is still fixed.',
        chart: { kind: 'line', x: { label: 'Spot rate on 31 March ($ a euro)', values: xs },
          series: [{ name: 'Long (Lantern)', values: xs.map((s) => Math.round((s - v.K) * E.amount)) }, { name: 'Short (Coastline)', values: xs.map((s) => Math.round((v.K - s) * E.amount)) }],
          y: { label: 'Payoff ($)', format: 'money' } },
      };
    },
  },
  'ff-margin': {
    type: 'formula', title: 'A week in a futures margin account',
    intro: 'Settlement prices: $6.40 (day 0), then 6.32, 6.25, 6.35, 6.18, 6.26, 6.38. Each contract is 5,000 kg of green coffee.',
    inputs: [
      { id: 'n', label: 'Contracts', min: 1, max: 10, step: 1, value: 1, fmt: 'int' },
      { id: 'side', label: 'Position (1 = long, −1 = short)', min: -1, max: 1, step: 2, value: 1, fmt: 'int' },
      { id: 'im', label: 'Initial margin a contract', min: 1000, max: 5000, step: 100, value: 2500, fmt: 'money' },
      { id: 'mm', label: 'Maintenance margin a contract', min: 500, max: 4500, step: 100, value: 1800, fmt: 'money' },
    ],
    compute: (v) => {
      if (v.mm > v.im) return { headline: { label: 'Margin calls', value: '—' }, rows: [], note: '', error: 'The maintenance margin must not be above the initial margin.' };
      const a = marginAccount({ prices: K.settlements, contracts: v.n, size: fut.size, initial: v.im, maintenance: v.mm, long: v.side > 0 });
      const calls = a.rows.filter((r) => r.call > 0);
      const days = [0, ...a.rows.map((r) => r.day)];
      return {
        headline: { label: 'Margin calls in the week', value: `${calls.length} (${$(calls.reduce((s, r) => s + r.call, 0))})` },
        rows: [['Cash paid in (initial margin + calls)', $(a.deposits)], ['Balance after day 6', $(a.finalBalance)], ['Gain (loss) over the week', $(a.cumulative)], ['Lowest balance before a call', $(Math.min(...a.rows.map((r) => r.before)))]],
        note: `${v.side > 0 ? 'A long position loses when the price falls.' : 'A short position loses when the price rises.'} Over the week the price fell 2 cents, so the ${v.side > 0 ? 'long loses' : 'short gains'} ${$(Math.abs(a.cumulative))} however it got there; the calls depend on the path and the margins.`,
        chart: { kind: 'line', x: { label: 'Day', values: days },
          series: [{ name: 'Balance', values: [a.initial, ...a.rows.map((r) => Math.round(r.balance))] }, { name: 'Maintenance level', values: days.map(() => a.maintenance) }],
          y: { label: 'Margin account ($)', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-ff-g1', type: 'num', kind: 'numerical',
    prompt: 'A business agrees to buy £50,000 forward at $1.2700 a pound in three months. At maturity the spot rate is $1.3100. What is the payoff of its forward ($)?',
    answer: 2000, check: () => (1.31 - 1.27) * 50000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: -2000, say: 'The business is long: it gains when the spot rate ends above the delivery price.' }],
    hints: ['Long payoff = (S<sub>T</sub> − K) × quantity.', '(1.3100 − 1.2700) × 50,000.'],
    solution: '(1.3100 − 1.2700) × 50,000 = $2,000: it buys pounds at $1.27 that are worth $1.31.',
  },
  {
    id: 'f08-ff-g2', type: 'steps', kind: 'numerical',
    prompt: 'A trader buys 2 futures contracts of 5,000 kg at $6.40 a kg. Initial margin is $2,500 and maintenance margin $1,800 a contract. The next two settlement prices are $6.30 and $6.22.',
    steps: [
      { id: 'f08-ff-g2a', type: 'num', kind: 'numerical', prompt: 'What is the loss on day 1 ($)?', answer: 1000, check: () => (6.40 - 6.30) * 5000 * 2, unit: '$', places: 0, tol: 1, hints: ['(6.40 − 6.30) × 5,000 kg × 2 contracts.'] },
      { id: 'f08-ff-g2b', type: 'num', kind: 'numerical', prompt: 'What is the balance before any call at the end of day 2 ($)?', answer: 3200, check: () => 5000 - 1000 - (6.30 - 6.22) * 10000, unit: '$', places: 0, tol: 1, hints: ['Start from 2 × 2,500 = 5,000 and take off both days’ losses.'] },
      { id: 'f08-ff-g2c', type: 'num', kind: 'numerical', prompt: 'How much must the trader pay in at the end of day 2 ($)?', answer: 1800, check: () => { const b = 5000 - 1000 - 800; return b < 3600 ? 5000 - b : 0; }, unit: '$', places: 0, tol: 1, hints: ['The maintenance level for 2 contracts is 3,600; a call restores 5,000.'] },
    ],
    solution: 'Day 1: −1,000, balance 4,000. Day 2: −800, balance 3,200, below 3,600, so a call of 1,800 restores 5,000.',
  },
  {
    id: 'f08-ff-g3', type: 'num', kind: 'numerical',
    prompt: 'A trader sells 3 futures contracts of 1,000 units at $82.50 and closes the position by buying 3 contracts at $79.10. What is the total gain ($)?',
    answer: 10200, check: () => (82.5 - 79.1) * 1000 * 3, unit: '$', places: 0, tol: 1,
    wrong: [{ value: -10200, say: 'A short position gains when the price falls.' }],
    hints: ['For a short position, gain = (opening price − closing price) × size × contracts.'],
    solution: '(82.50 − 79.10) × 1,000 × 3 = $10,200, whatever the daily prices in between.',
  },
  {
    id: 'f08-ff-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why can two strangers safely trade a futures contract with each other?',
    options: ['The clearing house is each side’s counterparty and collects margin daily', 'Because the exchange checks the credit rating of every trader before each trade', 'Because the price is fixed and cannot move against either side', 'Because both sides must deliver the asset on the same day they trade'],
    answer: 0,
    feedback: { 1: 'Brokers check their own customers; the protection against a default is margin and the clearing house.', 2: 'Futures prices move every day; that is why gains and losses are settled daily.', 3: 'Delivery comes at maturity, if at all.' },
    hints: ['Who is the counterparty once a trade is made, and what stops losses building up?'],
    solution: 'The clearing house becomes buyer to every seller and seller to every buyer, and daily settlement with margin means losses are paid before they can grow.',
  },
];

export const independent = [
  {
    id: 'f08-ff-i1', type: 'num', kind: 'numerical',
    prompt: 'A grain exporter agrees to sell 200 tonnes forward at $240 a tonne. At maturity the spot price is $262 a tonne. What is the payoff of its forward ($)?',
    answer: -4400, check: () => (240 - 262) * 200, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 4400, say: 'The exporter is short: it loses when the price rises above the delivery price (but sells its grain for more).' }],
    solution: '(240 − 262) × 200 = −$4,400; the exporter’s grain is worth $4,400 more, so its total is fixed at $48,000.',
  },
  {
    id: 'f08-ff-i2', type: 'num', kind: 'numerical',
    prompt: 'One futures contract covers $32,000 of coffee and needs $2,500 of initial margin. By what percentage must the price fall to wipe out the initial margin (%)?',
    answer: 7.8125, check: () => 2500 / 32000 * 100, unit: '%', places: 2, tol: 0.01,
    solution: '2,500 ÷ 32,000 = 7.81%. The position is about 12.8 times the margin.',
  },
  {
    id: 'f08-ff-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of contract does each feature describe?',
    items: ['Settled every day through a margin account', 'Terms agreed between the two parties', 'Traded on an exchange in standard sizes', 'Usually ends in delivery or a single cash settlement'],
    categories: ['Forward', 'Futures'],
    answer: [1, 0, 1, 0],
    solution: 'Futures are standardised, exchange-traded and settled daily; forwards are private agreements settled once at maturity.',
  },
  {
    id: 'f08-ff-i4', type: 'num', kind: 'numerical',
    prompt: `In the case, Lantern buys one Green Coffee contract at $6.40 and the price falls to $6.25 by day 2. If the maintenance margin were $2,000 instead of $1,800 (initial margin still $2,500), how much would the day 1 call be? (Day 1 settlement: $6.32.)`,
    answer: 0, check: () => { const b = 2500 - 0.08 * 5000; return b < 2000 ? 2500 - b : 0; }, unit: '$', places: 0, tol: 0.5,
    solution: 'Day 1 loss 0.08 × 5,000 = 400; balance 2,100, still above 2,000, so no call on day 1. (Day 2 would bring a call.)',
  },
  {
    id: 'f08-ff-i5', type: 'mc', kind: 'applied',
    prompt: 'A futures price is above the spot price on the last day of delivery. What will traders do?',
    options: ['Buy the asset spot, sell futures and deliver at once', 'Buy futures and sell the asset spot, then take delivery later', 'Nothing, because futures and spot prices are not linked at delivery', 'Wait for the next delivery month'],
    answer: 0,
    feedback: { 1: 'That loses money when futures are dear.', 2: 'At delivery they are tied together by the chance to deliver.', 3: 'The profit is available now; that is what forces convergence.' },
    solution: 'Buying cheap in the spot market and delivering against an expensive futures sale is a riskless profit, so the two prices converge.',
  },
];

export const check = [
  {
    id: 'f08-ff-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is paid when a forward contract is agreed?',
    options: ['Usually nothing; the delivery price makes it worth zero to both', 'The full delivery price, paid at once in cash by the buyer to the seller', 'An initial margin, deposited with the clearing house', 'A premium, paid by the buyer for the right to buy'],
    answer: 0,
    feedback: { 1: 'The price is paid at maturity.', 2: 'Margin is a futures feature.', 3: 'A premium is paid for an option, not a forward.' },
    solution: 'A forward’s delivery price is set so that the contract starts with zero value; payment happens at maturity.',
  },
  {
    id: 'f08-ff-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern bought €38,000 forward at $1.0920. On 31 March 2029 the spot rate is $1.0650. What is the forward’s payoff to Lantern ($)?',
    answer: -1026, check: () => (1.065 - D.euroBank) * E.amount, unit: '$', places: 0, tol: 1,
    solution: '(1.0650 − 1.0920) × 38,000 = −$1,026. Lantern’s euros still cost $41,496 in total.',
  },
  {
    id: 'f08-ff-k3', type: 'num', kind: 'numerical',
    prompt: 'A long position in 4 contracts of 5,000 kg has a margin balance of $9,200. Initial margin is $2,500 and maintenance margin $1,800 a contract. The price falls $0.12. How much is the margin call ($)?',
    answer: 3200, check: () => { const b = 9200 - 0.12 * 5000 * 4; return b < 7200 ? 10000 - b : 0; }, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 2400, say: 'That is the loss. The call restores the initial margin of 4 × 2,500 = 10,000.' }, { value: 400, say: 'That only brings the balance back to the maintenance level; a call restores the initial margin.' }],
    solution: 'Loss 0.12 × 20,000 = 2,400; balance 6,800, below 4 × 1,800 = 7,200. The call restores 4 × 2,500 = 10,000: 10,000 − 6,800 = $3,200.',
  },
  {
    id: 'f08-ff-k4', type: 'mc', kind: 'applied',
    prompt: 'A bakery needs 300 tonnes of a special flour blend in June. Wheat futures cover 136 tonnes of standard wheat. Why might it prefer a forward from its miller?',
    options: ['The forward matches its exact quantity, product and date', 'Because forwards never carry any risk that the other side fails', 'Because futures cannot be closed before delivery', 'Because forwards must be marked to market every day'],
    answer: 0,
    feedback: { 1: 'Forwards carry counterparty risk; futures nearly none.', 2: 'Futures are easy to close by an opposite trade.', 3: 'That describes futures, not forwards.' },
    solution: 'A forward can fit the quantity, grade and date exactly; futures come in fixed sizes of a standard grade.',
  },
  {
    id: 'f08-ff-k5', type: 'num', kind: 'numerical',
    prompt: 'A trader buys 5 contracts of 50 units at $4,800 and closes them at $4,722. What is the total gain or loss ($, negative for a loss)?',
    answer: -19500, check: () => (4722 - 4800) * 50 * 5, unit: '$', places: 0, tol: 1,
    solution: '(4,722 − 4,800) × 50 × 5 = −$19,500.',
  },
  {
    id: 'f08-ff-k6', type: 'mc', kind: 'conceptual',
    prompt: 'What does the basis of a futures contract do as delivery approaches?',
    options: ['It moves towards zero', 'It grows, because futures prices move faster than spot prices', 'It stays fixed at the level when the contract was first traded', 'It equals the initial margin divided by the contract size'],
    answer: 0,
    feedback: { 1: 'Arbitrage ties the two prices together at delivery.', 2: 'The basis changes over time; how it changes is basis risk.', 3: 'Margin has nothing to do with the basis.' },
    solution: 'Basis = spot − futures, which converges to about zero at delivery.',
  },
];
