// hedging-with-derivatives.ex.js — F08 · Hedging with derivatives: widgets, practice and the knowledge check.
// Figures from case.js (COFFEE, DERIVED, BRIGHTCUP_COFFEE, BOOK, BOOK_BETA, INDEX_FUTURES); every num item's `check`
// recomputes its answer.
import { COFFEE as K, DERIVED as D, BRIGHTCUP_COFFEE as BC, BOOK_VALUE, BOOK_BETA, INDEX_FUTURES as IF } from './case.js?v=40';
import { hedgeRatio, contractsNeeded } from '../../../core/derivatives.js?v=40';

const usd = (x) => `${x < 0 ? '−' : ''}$${Math.round(Math.abs(x)).toLocaleString('en-US')}`;
const fv = IF.level * IF.multiplier;

export const widgets = {
  'hd-ratio': {
    type: 'formula', title: 'Minimum-variance hedge for Brightcup’s coffee',
    intro: 'Exposure: $6,000,000 of roasted coffee next quarter. One futures contract: 5,000 kg × $6.40 = $32,000.',
    inputs: [
      { id: 'rho', label: 'Correlation of spot and futures changes', min: 0, max: 1, step: 0.01, value: K.rho, fmt: 'num' },
      { id: 'sS', label: 'Volatility of Brightcup’s coffee price (a quarter)', min: 2, max: 15, step: 0.5, value: K.sdRoasted * 100, fmt: 'pct' },
      { id: 'sF', label: 'Volatility of the futures price (a quarter)', min: 2, max: 15, step: 0.5, value: K.sdFutures * 100, fmt: 'pct' },
    ],
    compute: (v) => {
      const sS = v.sS / 100, sF = v.sF / 100, { h, effectiveness } = hedgeRatio({ rho: v.rho, sdSpot: sS, sdFutures: sF });
      const resid = (hr) => Math.sqrt(Math.max(0, sS ** 2 + hr ** 2 * sF ** 2 - 2 * hr * v.rho * sS * sF)) * BC.quarterValue;
      const hs = Array.from({ length: 11 }, (_, i) => i / 5);
      return {
        headline: { label: 'Contracts to buy', value: `${Math.round(contractsNeeded({ h, exposure: BC.quarterValue, size: D.contractValue }))} (h* = ${h.toFixed(4)})` },
        rows: [['Risk with no hedge (one SD)', usd(resid(0))], ['Risk with the minimum-variance hedge', usd(resid(h))], ['Risk hedging one for one (187.5 contracts)', usd(resid(1))], ['Hedge effectiveness (ρ²)', `${(effectiveness * 100).toFixed(1)}%`]],
        note: v.rho < 0.5 ? 'With a weak correlation the futures remove little risk: the hedge is mostly basis risk.' : resid(1) > resid(0) ? 'Here a one-for-one hedge leaves more risk than no hedge at all.' : 'The minimum-variance hedge leaves σ_S√(1 − ρ²) of the exposure.',
        chart: { kind: 'line', x: { label: 'Hedge ratio h', values: hs },
          series: [{ name: 'Risk left ($)', values: hs.map((x) => Math.round(resid(x))) }],
          y: { label: 'Standard deviation ($)', format: 'money' } },
      };
    },
  },
  'hd-index': {
    type: 'formula', title: 'Hollis’s index futures hedge',
    intro: 'Book $500,000, beta 0.7431. Each Harbourline index contract (fictional) is 5,000 points × $50 = $250,000.',
    inputs: [
      { id: 'n', label: 'Contracts sold', min: 0, max: 3, step: 1, value: 1, fmt: 'int' },
      { id: 'mkt', label: 'Market move', min: -30, max: 30, step: 1, value: -10, fmt: 'pct' },
    ],
    compute: (v) => {
      const beta = BOOK_BETA - v.n * fv / BOOK_VALUE, m = v.mkt / 100;
      const book = BOOK_BETA * BOOK_VALUE * m, fut = -v.n * fv * m;
      return {
        headline: { label: 'Beta of book plus futures', value: beta.toFixed(4) },
        rows: [['Expected change in the book (beta × market)', usd(book)], ['Gain or loss on the futures', usd(fut)], ['Net', usd(book + fut)]],
        note: v.n === 0 ? 'Unhedged: the book moves about 74 cents for each dollar the market moves.' : beta < 0 ? 'Over-hedged: the position now gains when the market falls.' : 'The futures offset part of the market exposure; Brightcup’s own risk is unchanged.',
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-hd-g1', type: 'num', kind: 'numerical',
    prompt: 'An airline’s jet-fuel price changes have a standard deviation of 0.040 a month; heating-oil futures 0.050; correlation 0.80. What is the minimum-variance hedge ratio?',
    answer: 0.64, check: () => hedgeRatio({ rho: 0.8, sdSpot: 0.04, sdFutures: 0.05 }).h, unit: '', places: 4, tol: 0.0001,
    wrong: [{ value: 1, say: 'One for one ignores the different volatilities and the imperfect correlation.' }, { value: 0.8, say: 'That is the correlation alone; multiply by σ<sub>S</sub> ÷ σ<sub>F</sub>.' }],
    hints: ['h* = ρσ<sub>S</sub> ÷ σ<sub>F</sub>.', '0.80 × 0.040 ÷ 0.050.'],
    solution: '0.80 × 0.040 ÷ 0.050 = 0.64.',
  },
  {
    id: 'f08-hd-g2', type: 'steps', kind: 'numerical',
    prompt: 'The airline will buy $21 million of jet fuel. Each heating-oil futures contract is worth $105,000. Use h* = 0.64.',
    steps: [
      { id: 'f08-hd-g2a', type: 'num', kind: 'numerical', prompt: 'How many contracts (2 decimals)?', answer: 128, check: () => contractsNeeded({ h: 0.64, exposure: 21e6, size: 105000 }), unit: '', places: 2, tol: 0.01, hints: ['N = h* × V<sub>A</sub> ÷ V<sub>F</sub>.'] },
      { id: 'f08-hd-g2b', type: 'num', kind: 'numerical', prompt: 'What share of the variance does the hedge remove (%)?', answer: 64, check: () => 0.8 ** 2 * 100, unit: '%', places: 1, tol: 0.05, hints: ['Effectiveness = ρ².'] },
    ],
    solution: 'N = 0.64 × 21,000,000 ÷ 105,000 = 128 contracts, bought. Effectiveness 0.80² = 64%.',
  },
  {
    id: 'f08-hd-g3', type: 'num', kind: 'numerical',
    prompt: 'A farmer sells wheat futures at $6.20 a bushel. When she sells her crop the spot price is $5.70 and the futures $5.85. What price has she effectively received ($ a bushel)?',
    answer: 6.05, check: () => 5.7 + (6.2 - 5.85), unit: '$', places: 2, tol: 0.005,
    hints: ['Effective price = S<sub>1</sub> + (F<sub>0</sub> − F<sub>1</sub>).', '5.70 + 0.35.'],
    solution: '5.70 + (6.20 − 5.85) = $6.05 = F<sub>0</sub> + basis at close (6.20 − 0.15).',
  },
  {
    id: 'f08-hd-g4', type: 'num', kind: 'numerical',
    prompt: 'A $2,000,000 portfolio has a beta of 1.2. Index futures are at 4,000 with a $50 multiplier. How many contracts must be sold to bring its beta to zero?',
    answer: 12, check: () => 1.2 * 2e6 / (4000 * 50), unit: '', places: 0, tol: 0.5,
    hints: ['N = β × V<sub>P</sub> ÷ (F × m).'],
    solution: '1.2 × 2,000,000 ÷ 200,000 = 12 contracts sold.',
  },
];

export const independent = [
  {
    id: 'f08-hd-i1', type: 'num', kind: 'numerical',
    prompt: `With Brightcup’s estimates (σ<sub>S</sub> = 0.06, σ<sub>F</sub> = 0.09, ρ = 0.85), what is the standard deviation of a minimum-variance hedged $6,000,000 exposure ($)?`,
    answer: 189642, check: () => 0.06 * Math.sqrt(1 - 0.85 ** 2) * 6e6, unit: '$', places: 0, tol: 1,
    solution: 'σ<sub>S</sub>√(1 − ρ²) × V = 0.06 × 0.5268 × 6,000,000 = $189,642.',
  },
  {
    id: 'f08-hd-i2', type: 'num', kind: 'numerical',
    prompt: 'Hollis’s book is $500,000 with a beta of 0.7431. If he sold two index contracts ($250,000 each), what would its beta be (4 decimals)?',
    answer: Math.round((BOOK_BETA - 2 * fv / BOOK_VALUE) * 1e4) / 1e4, check: () => BOOK_BETA - 2 * fv / BOOK_VALUE, unit: '', places: 4, tol: 0.0001,
    solution: `0.7431 − 2 × 250,000 ÷ 500,000 = ${(BOOK_BETA - 2 * fv / BOOK_VALUE).toFixed(4)}: slightly short the market.`,
  },
  {
    id: 'f08-hd-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of hedge fits each need?',
    items: ['Fix the exact cost of €38,000 due on one date', 'Protect a share holding but keep the gains', 'Protect a share holding at no premium, giving up gains above a ceiling', 'Reduce a large portfolio’s market exposure for three months'],
    categories: ['Forward', 'Protective put', 'Collar', 'Index futures'],
    answer: [0, 1, 2, 3],
    solution: 'A forward fits an exact amount and date; a put keeps the upside for a premium; a collar trades the upside for cheap protection; index futures adjust beta quickly.',
  },
  {
    id: 'f08-hd-i4', type: 'num', kind: 'numerical',
    prompt: 'A buyer of soybean oil buys futures at $0.52 a pound when spot is $0.50. When it buys the oil, spot is $0.61 and futures $0.62. What is its effective cost ($ a pound)?',
    answer: 0.51, check: () => 0.61 - (0.62 - 0.52), unit: '$', places: 2, tol: 0.005,
    solution: 'It pays 0.61 and gains 0.62 − 0.52 = 0.10 on the futures: 0.61 − 0.10 = $0.51 = F<sub>0</sub> + basis at close (0.52 − 0.01).',
  },
  {
    id: 'f08-hd-i5', type: 'mc', kind: 'applied',
    prompt: 'A treasurer hedges a $10 million exposure with futures worth $14 million, saying “more protection is better”. What is wrong?',
    options: ['The extra $4 million is a speculation that adds risk', 'Nothing, since futures cannot lose money when used for hedging', 'Hedges must always be exactly half of the exposure', 'Futures can only hedge exposures smaller than $10 million'],
    answer: 0,
    feedback: { 1: 'Futures lose when prices move against them, hedging or not.', 2: 'The right ratio depends on the correlation and volatilities.', 3: 'Size is not limited; the issue is matching the exposure.' },
    solution: 'Unless h* is above 1, a position larger than the hedge ratio requires creates a new exposure in the opposite direction.',
  },
];

export const check = [
  {
    id: 'f08-hd-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a futures hedge leave when it is lifted before delivery?',
    options: ['Basis risk: the gap between spot and futures prices at the close', 'No risk at all: the price is fixed exactly', 'The full price risk of the asset', 'Only the small risk that the clearing house itself fails to pay out'],
    answer: 0,
    feedback: { 1: 'The effective price is F₀ plus the closing basis, which is uncertain.', 2: 'The futures offset most of the price risk.', 3: 'Clearing-house risk is small; basis risk is the main remainder.' },
    solution: 'Price risk is replaced by the smaller risk that the basis changes.',
  },
  {
    id: 'f08-hd-k2', type: 'num', kind: 'numerical',
    prompt: 'Spot and futures changes have standard deviations 0.030 and 0.040 and correlation 0.90. What is the minimum-variance hedge ratio (4 decimals)?',
    answer: 0.675, check: () => 0.9 * 0.03 / 0.04, unit: '', places: 4, tol: 0.0001,
    solution: '0.90 × 0.030 ÷ 0.040 = 0.6750.',
  },
  {
    id: 'f08-hd-k3', type: 'num', kind: 'numerical',
    prompt: 'A $5,000,000 portfolio with beta 0.9 is to be brought to beta 0.3 with index futures at 5,000 and a $50 multiplier. How many contracts are sold?',
    answer: 12, check: () => (0.9 - 0.3) * 5e6 / (5000 * 50), unit: '', places: 0, tol: 0.5,
    solution: '(0.9 − 0.3) × 5,000,000 ÷ 250,000 = 12.',
  },
  {
    id: 'f08-hd-k4', type: 'mc', kind: 'applied',
    prompt: 'An investor wants protection for her shares below $50 but cannot afford a put’s premium. She is willing to give up gains above $60. What should she do?',
    options: ['Buy a $50 put and write a $60 call: a collar', 'Write a $50 put and buy a $60 call', 'Buy both a $50 put and a $60 call', 'Sell the shares forward at $60 to lock in the ceiling price'],
    answer: 0,
    feedback: { 1: 'That adds to her losses below $50.', 2: 'That costs two premiums.', 3: 'A forward gives up all gains, not only above $60, and $60 may not be available.' },
    solution: 'The call she writes pays for the put she buys, fixing a floor at $50 and a ceiling at $60.',
  },
  {
    id: 'f08-hd-k5', type: 'num', kind: 'numerical',
    prompt: 'A hedge has a correlation of 0.70 between spot and futures changes. What share of the exposure’s variance does a minimum-variance hedge leave (%)?',
    answer: 51, check: () => (1 - 0.7 ** 2) * 100, unit: '%', places: 1, tol: 0.05,
    solution: '1 − 0.70² = 0.51: 51% of the variance remains.',
  },
  {
    id: 'f08-hd-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Hollis sells index futures against his book. Which risk remains?',
    options: ['Brightcup’s own (unsystematic) risk', 'All of the market risk in the book', 'Only interest-rate risk on the bond fund', 'None: an index hedge removes all risk'],
    answer: 0,
    feedback: { 1: 'The futures offset the market exposure, as measured by beta.', 2: 'The bond fund’s rate risk remains too, but Brightcup’s own risk is the larger remainder.', 3: 'Index futures do not hedge risks the market does not explain.' },
    solution: 'Index futures remove systematic risk; the risk specific to Brightcup is untouched.',
  },
];
