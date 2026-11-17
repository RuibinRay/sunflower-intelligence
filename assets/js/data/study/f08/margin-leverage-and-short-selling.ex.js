// margin-leverage-and-short-selling.ex.js — F08 · Margin, leverage and short selling: widgets, practice and the check.
// Figures from case.js (OPT, MARGIN_RULES); every num item's `check` recomputes its answer.
import { OPT as O, MARGIN_RULES as MR } from './case.js?v=39';

const usd = (x) => `${x < 0 ? '−' : ''}$${Math.round(Math.abs(x)).toLocaleString('en-US')}`;
const pct = (x) => `${x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(1)}%`;
const n = O.holding, S = O.S, V = n * S;

export const widgets = {
  'ml-margin': {
    type: 'formula', title: 'Buying 1,000 Brightcup shares on margin',
    intro: 'Bought at $42.00; maintenance margin 25%; held for a year; dividends ignored.',
    inputs: [
      { id: 'im', label: 'Cash put up (initial margin)', min: 50, max: 100, step: 5, value: 50, fmt: 'pct' },
      { id: 'i', label: 'Loan interest rate', min: 0, max: 14, step: 0.5, value: 8, fmt: 'pct' },
      { id: 'P', label: 'Brightcup in a year', min: 20, max: 64, step: 0.2, value: 46.2, fmt: 'money' },
    ],
    compute: (v) => {
      const E = V * v.im / 100, L = V - E, cost = L * v.i / 100, eq = n * v.P - L - cost;
      const call = L > 0 ? L / (n * (1 - MR.maintenance)) : 0;
      const ps = Array.from({ length: 12 }, (_, k) => 20 + 4 * k);
      return {
        headline: { label: 'Return on Hollis’s cash', value: pct(eq / E - 1) },
        rows: [['Cash put up / borrowed', `${usd(E)} / ${usd(L)}`], ['Equity after a year', usd(eq)], ['Return buying for cash', pct(v.P / S - 1)], ['Margin call price', L > 0 ? `$${call.toFixed(2)}` : 'None (no loan)'], ['Break-even price', `$${((V + cost) / n).toFixed(2)}`]],
        note: v.P < call ? 'The price has fallen through the margin call level: Hollis would have had to add cash or be sold out on the way down.' : `Borrowing ${pct(L / V)} of the cost makes his equity move ${(V / E).toFixed(1)} times as far as the shares, less the interest.`,
        chart: { kind: 'line', x: { label: 'Brightcup in a year ($)', values: ps },
          series: [{ name: 'On margin', values: ps.map((p) => Math.round((n * p - L - cost) / E * 1000 - 1000) / 10) }, { name: 'For cash', values: ps.map((p) => Math.round((p / S - 1) * 1000) / 10) }],
          y: { label: 'Return (%)', format: 'num' } },
      };
    },
  },
  'ml-short': {
    type: 'formula', title: 'Selling 1,000 Brightcup shares short',
    intro: 'Sold at $42.00; 50% initial margin, so the account holds $63,000; maintenance margin 30%.',
    inputs: [
      { id: 'P', label: 'Brightcup when the short is closed', min: 20, max: 70, step: 0.5, value: 36, fmt: 'money' },
      { id: 'm', label: 'Months held', min: 1, max: 12, step: 1, value: 6, fmt: 'int' },
      { id: 'fee', label: 'Borrowing fee a year', min: 0, max: 20, step: 0.5, value: 1, fmt: 'pct' },
    ],
    compute: (v) => {
      const A = V * (1 + MR.initial), fee = V * v.fee / 100 * v.m / 12, div = v.m >= 9 ? 0.85 * n : 0;
      const profit = (S - v.P) * n - fee - div, ratio = (A - n * v.P) / (n * v.P), call = A / (n * (1 + MR.shortMaintenance));
      const ps = Array.from({ length: 11 }, (_, k) => 20 + 5 * k);
      return {
        headline: { label: 'Profit on the short', value: usd(profit) },
        rows: [['Borrowing fee', usd(fee)], ['Dividend owed to the lender', div ? usd(div) : 'None (closed before June)'], ['Margin ratio at this price', pct(ratio)], ['Margin call price', `$${call.toFixed(2)}`]],
        note: v.P > call ? 'Above the call price the account must be topped up or the position is bought back.' : v.P > S ? 'The share has risen: the short is losing, and the loss has no upper limit.' : 'The share has fallen: the short gains, less the costs of borrowing.',
        chart: { kind: 'line', x: { label: 'Brightcup at close ($)', values: ps },
          series: [{ name: 'Short sale profit', values: ps.map((p) => Math.round((S - p) * n - fee - div)) }],
          y: { label: 'Profit ($)', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-ml-g1', type: 'steps', kind: 'numerical',
    prompt: 'An investor buys 500 shares at $80 with 50% initial margin. The maintenance margin is 25%.',
    steps: [
      { id: 'f08-ml-g1a', type: 'num', kind: 'numerical', prompt: 'How much is borrowed ($)?', answer: 20000, check: () => 500 * 80 * 0.5, unit: '$', places: 0, tol: 1, hints: ['Half of 500 × $80.'] },
      { id: 'f08-ml-g1b', type: 'num', kind: 'numerical', prompt: 'At what price does a margin call come ($)?', answer: 53.33, check: () => 20000 / (500 * 0.75), unit: '$', places: 2, tol: 0.005, hints: ['P* = L ÷ n(1 − m).'] },
    ],
    solution: 'Loan 20,000. P* = 20,000 ÷ (500 × 0.75) = $53.33: a fall of a third.',
  },
  {
    id: 'f08-ml-g2', type: 'num', kind: 'numerical',
    prompt: 'A share bought with half the cost borrowed at 6% rises 15% in a year. What is the return on the investor’s equity (%)?',
    answer: 24, check: () => (0.15 + 1 * (0.15 - 0.06)) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 30, say: 'That doubles the return but forgets the interest on the loan.' }],
    hints: ['r<sub>E</sub> = r<sub>A</sub> + (L/E)(r<sub>A</sub> − i), with L/E = 1.'],
    solution: '0.15 + 1 × (0.15 − 0.06) = 24%.',
  },
  {
    id: 'f08-ml-g3', type: 'num', kind: 'numerical',
    prompt: 'A trader sells 2,000 shares short at $25 with 50% margin; maintenance margin 30%. At what price does a margin call come ($)?',
    answer: 28.85, check: () => (2000 * 25 * 1.5) / (2000 * 1.3), unit: '$', places: 2, tol: 0.005,
    hints: ['Account A = proceeds + 50% = 1.5 × 50,000.', 'P* = A ÷ n(1 + m<sub>s</sub>).'],
    solution: 'A = 75,000; P* = 75,000 ÷ (2,000 × 1.30) = $28.85.',
  },
  {
    id: 'f08-ml-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why can a short seller lose more than the money in the account?',
    options: ['A share’s price can rise without limit', 'Because the broker charges interest on the sale proceeds', 'Because short sellers must also buy a put option', 'Because the borrowed shares must be returned within a day'],
    answer: 0,
    feedback: { 1: 'The proceeds are held as collateral; fees are small next to the price risk.', 2: 'A put is optional, and would limit the loss.', 3: 'Shares can usually be borrowed for long periods, subject to recall.' },
    hints: ['What is the most the price could rise to?'],
    solution: 'The loss is (P − sale price) × shares, with no ceiling on P.',
  },
];

export const independent = [
  {
    id: 'f08-ml-i1', type: 'num', kind: 'numerical',
    prompt: `Hollis buys ${n.toLocaleString('en-US')} Brightcup shares at $42.00, borrowing half at 8%. In a year Brightcup is $39.90. What is his return on equity (%)?`,
    answer: -18, check: () => ((n * 39.9 - V / 2 - V / 2 * 0.08) / (V / 2) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    solution: 'Equity: 39,900 − 21,000 − 1,680 = 17,220; return 17,220 ÷ 21,000 − 1 = −18.0% (the shares fell 5%).',
  },
  {
    id: 'f08-ml-i2', type: 'num', kind: 'numerical',
    prompt: 'With a maintenance margin of 30% instead of 25%, at what price would Hollis’s margin purchase ($21,000 loan, 1,000 shares) bring a call ($)?',
    answer: 30, check: () => 21000 / (1000 * 0.7), unit: '$', places: 2, tol: 0.005,
    solution: '21,000 ÷ (1,000 × 0.70) = $30.00: a higher maintenance margin brings the call sooner.',
  },
  {
    id: 'f08-ml-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Can each position lose more than the cash committed to it?',
    items: ['Shares bought on margin', 'A short sale', 'A long futures position', 'A bought call option'],
    categories: ['Yes', 'No'],
    answer: [0, 0, 0, 1],
    solution: 'Borrowed money, short sales and futures can all lose more than the cash put up; a bought option can lose at most its premium.',
  },
  {
    id: 'f08-ml-i4', type: 'num', kind: 'numerical',
    prompt: 'A short seller sells 1,000 shares at $42, holds them for a year at a 3% borrowing fee, pays a $0.85 dividend to the lender, and buys back at $38. What is the profit ($)?',
    answer: 1890, check: () => (42 - 38) * 1000 - 42000 * 0.03 - 850, unit: '$', places: 0, tol: 1,
    solution: '4,000 − 1,260 − 850 = $1,890.',
  },
  {
    id: 'f08-ml-i5', type: 'mc', kind: 'applied',
    prompt: 'Prices fall sharply and many leveraged investors receive margin calls at once. What is the likely effect on prices?',
    options: ['Forced selling pushes prices down further', 'Prices recover at once as brokers buy the shares themselves', 'Nothing, because margin calls are settled in cash, not shares', 'Prices rise because short sellers are forced to buy back'],
    answer: 0,
    feedback: { 1: 'Brokers sell clients’ shares to cover loans; they do not buy them.', 2: 'Investors who cannot pay are sold out, adding to selling.', 3: 'That happens in a short squeeze, after rises, not falls.' },
    solution: 'Investors who cannot meet calls are sold out; the sales lower prices and bring more calls: a liquidity spiral.',
  },
];

export const check = [
  {
    id: 'f08-ml-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does Regulation T’s 50% initial margin require of a buyer of shares in a US margin account?',
    options: ['At least half the purchase in the buyer’s own money', 'A deposit of half the shares with the exchange', 'That half the shares be sold automatically if the price falls', 'That the broker lend at least half the cost'],
    answer: 0,
    feedback: { 1: 'The shares stay in the margin account as collateral.', 2: 'Forced sales follow a margin call, under the maintenance margin.', 3: 'It caps the loan; the broker can lend less.' },
    solution: 'Initial margin is the minimum share of the cost the buyer must put up; the broker may lend the rest.',
  },
  {
    id: 'f08-ml-k2', type: 'num', kind: 'numerical',
    prompt: 'An investor buys 300 shares at $50 with 60% initial margin. The maintenance margin is 25%. At what price does a margin call come ($)?',
    answer: 26.67, check: () => (300 * 50 * 0.4) / (300 * 0.75), unit: '$', places: 2, tol: 0.005,
    solution: 'Loan 6,000; P* = 6,000 ÷ (300 × 0.75) = $26.67.',
  },
  {
    id: 'f08-ml-k3', type: 'num', kind: 'numerical',
    prompt: 'A share bought with 40% of the cost borrowed (L/E = 0.4 ÷ 0.6) at 7% falls 12% in a year. What is the return on equity (%, 1 decimal)?',
    answer: -24.7, check: () => (-0.12 + (0.4 / 0.6) * (-0.12 - 0.07)) * 100, unit: '%', places: 1, tol: 0.05,
    solution: '−0.12 + 0.6667 × (−0.19) = −24.7%.',
  },
  {
    id: 'f08-ml-k4', type: 'mc', kind: 'applied',
    prompt: 'An investor expects a share to fall but wants a known maximum loss. Which position fits?',
    options: ['Buy a put option on the share', 'Sell the share short on margin', 'Sell futures on the share with no stop', 'Buy the share on margin and wait'],
    answer: 0,
    feedback: { 1: 'A short sale’s loss is unlimited if the share rises.', 2: 'A short futures position also has unlimited loss.', 3: 'That gains from a rise, not a fall.' },
    solution: 'A put gains from a fall and can lose at most its premium.',
  },
  {
    id: 'f08-ml-k5', type: 'num', kind: 'numerical',
    prompt: 'A trader sells 500 shares short at $60 with 50% margin. The maintenance margin is 30%. At what price does a margin call come ($)?',
    answer: 69.23, check: () => (500 * 60 * 1.5) / (500 * 1.3), unit: '$', places: 2, tol: 0.005,
    solution: 'A = 45,000; P* = 45,000 ÷ 650 = $69.23.',
  },
  {
    id: 'f08-ml-k6', type: 'mc', kind: 'conceptual',
    prompt: 'What is a short squeeze?',
    options: ['A rise driven by short sellers buying back to close', 'A fall caused by investors selling short together', 'A broker’s refusal to lend any more shares for new short sales', 'A rule that bans short selling during market falls'],
    answer: 0,
    feedback: { 1: 'Short selling can push prices down, but a squeeze is the opposite.', 2: 'Unavailable shares can trigger recalls, but the squeeze is the buying.', 3: 'Some regulators have imposed bans; that is not a squeeze.' },
    solution: 'When a shorted share rises, short sellers rush to buy it back, pushing it higher still.',
  },
];
