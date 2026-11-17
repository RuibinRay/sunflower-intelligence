// swaps.ex.js — F08 · Swaps: widgets, practice and the knowledge check (answer keys live here).
// Figures from case.js (SWAP, DERIVED); every num item's `check` recomputes its answer.
import { SWAP as W, DERIVED as D } from './case.js?v=39';
import { discountFactors, swapRate, swapValue } from '../../../core/derivatives.js?v=39';

const mn = (x) => `${x < 0 ? '−' : ''}$${(Math.abs(x) / 1e6).toFixed(2)} million`;

export const widgets = {
  'sw-rate': {
    type: 'formula', title: 'The swap rate from a zero curve',
    intro: 'Brightcup’s curve: 4.0%, 4.2%, 4.3%, 4.4%, 4.5% for years 1–5 (fictional).',
    inputs: [1, 2, 3, 4, 5].map((t, i) => ({ id: `z${t}`, label: `Zero rate, year ${t}`, min: 1, max: 9, step: 0.1, value: W.zeros[i] * 100, fmt: 'pct' })),
    compute: (v) => {
      const z = [v.z1, v.z2, v.z3, v.z4, v.z5].map((x) => x / 100), df = discountFactors(z), k = swapRate(df);
      return {
        headline: { label: 'Five-year swap rate', value: `${(k * 100).toFixed(4)}%` },
        rows: [['Discount factors', df.map((d) => d.toFixed(4)).join(', ')], ['Sum of discount factors', df.reduce((s, d) => s + d, 0).toFixed(6)], ['Swap rate less the five-year zero rate', `${((k - z[4]) * 100).toFixed(4)} points`], ['Brightcup’s all-in fixed rate (+1.5%)', `${((k + W.spread) * 100).toFixed(4)}%`]],
        note: Math.abs(k - z[4]) < 1e-6 ? 'A flat curve: the swap rate equals the zero rate.' : k < z[4] ? 'The curve rises, so earlier payments are discounted at lower rates and the swap rate sits below the five-year zero rate.' : 'The curve falls, so the swap rate sits above the five-year zero rate.',
        chart: { kind: 'line', x: { label: 'Year', values: [1, 2, 3, 4, 5] },
          series: [{ name: 'Zero rate (%)', values: z.map((x) => Math.round(x * 1e4) / 100) }, { name: 'Swap rate (%)', values: z.map(() => Math.round(k * 1e6) / 1e4) }],
          y: { label: 'Rate (%)', format: 'num' } },
      };
    },
  },
  'sw-value': {
    type: 'formula', title: 'Brightcup’s swap a year later',
    intro: 'Brightcup pays 4.4815% on $200 million for four more years. Case curve a year later: 4.8%, 4.9%, 5.0%, 5.1%.',
    inputs: [{ id: 'bp', label: 'Shift in all of next year’s zero rates (basis points)', min: -200, max: 200, step: 10, value: 0, fmt: 'int' }],
    compute: (v) => {
      const df = discountFactors(W.zerosLater.map((z) => z + v.bp / 1e4)), V = swapValue({ notional: W.notional, fixed: D.swapRate, df }), k2 = swapRate(df);
      const xs = Array.from({ length: 21 }, (_, i) => -200 + 20 * i);
      return {
        headline: { label: 'Value to Brightcup (pays fixed)', value: mn(V) },
        rows: [['New four-year swap rate', `${(k2 * 100).toFixed(4)}%`], ['Brightcup’s fixed rate', `${(D.swapRate * 100).toFixed(4)}%`], ['Value to the bank (receives fixed)', mn(-V)]],
        note: V >= 0 ? 'Market rates are above Brightcup’s fixed rate, so the right to pay 4.4815% is an asset. Its loan now costs more; the swap makes up the difference.' : 'Market rates are below Brightcup’s fixed rate: the swap is a liability, and the loan is cheaper. Together they still cost a fixed 5.98%.',
        chart: { kind: 'line', x: { label: 'Shift (basis points)', values: xs },
          series: [{ name: 'Swap value ($ million)', values: xs.map((b) => Math.round(swapValue({ notional: W.notional, fixed: D.swapRate, df: discountFactors(W.zerosLater.map((z) => z + b / 1e4)) }) / 1e4) / 100) }],
          y: { label: '$ million', format: 'num' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-sw-g1', type: 'num', kind: 'numerical',
    prompt: 'A company pays 3.8% fixed and receives the floating rate on a $50 million swap with annual payments. The floating rate set at the start of the year was 4.3%. What net amount does the company receive at the end of the year ($)?',
    answer: 250000, check: () => (0.043 - 0.038) * 50e6, unit: '$', places: 0, tol: 1,
    wrong: [{ value: -250000, say: 'The company receives floating, which is the higher rate this year, so it is owed the difference.' }],
    hints: ['Net received by the fixed payer = (floating − fixed) × notional.', '(4.3% − 3.8%) × 50 million.'],
    solution: '(0.043 − 0.038) × 50,000,000 = $250,000 received.',
  },
  {
    id: 'f08-sw-g2', type: 'steps', kind: 'numerical',
    prompt: 'Zero rates are 3.0% for one year and 3.5% for two years (annual compounding). Find the two-year swap rate.',
    steps: [
      { id: 'f08-sw-g2a', type: 'num', kind: 'numerical', prompt: 'Discount factor for year 2 (6 decimals)?', answer: 0.933511, check: () => 1 / 1.035 ** 2, unit: '', places: 6, tol: 0.000001, hints: ['1 ÷ 1.035².'] },
      { id: 'f08-sw-g2b', type: 'num', kind: 'numerical', prompt: 'Sum of the two discount factors (6 decimals)?', answer: 1.904384, check: () => 1 / 1.03 + 1 / 1.035 ** 2, unit: '', places: 6, tol: 0.000001, hints: ['1 ÷ 1.03 + 0.933511.'] },
      { id: 'f08-sw-g2c', type: 'num', kind: 'numerical', prompt: 'Swap rate (%, 4 decimals)?', answer: 3.4914, check: () => swapRate(discountFactors([0.03, 0.035])) * 100, unit: '%', places: 4, tol: 0.0001, hints: ['k = (1 − DF<sub>2</sub>) ÷ (DF<sub>1</sub> + DF<sub>2</sub>).'] },
    ],
    solution: 'DF<sub>1</sub> = 0.970874, DF<sub>2</sub> = 0.933511, sum 1.904384. k = (1 − 0.933511) ÷ 1.904384 = 3.4914%.',
  },
  {
    id: 'f08-sw-g3', type: 'num', kind: 'numerical',
    prompt: 'A company has a $30 million loan at the benchmark rate + 2.25% and enters a payer swap at 3.60%. What is its all-in fixed borrowing rate (%)?',
    answer: 5.85, check: () => 3.6 + 2.25, unit: '%', places: 2, tol: 0.001,
    hints: ['The benchmark it pays on the loan and receives on the swap cancels.', 'Swap rate + spread.'],
    solution: '3.60% + 2.25% = 5.85%: the swap fixes the benchmark; the spread was already fixed.',
  },
  {
    id: 'f08-sw-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the floating side of a swap worth its notional on a reset date?',
    options: ['It will pay the market rate each period, like a floating bond priced at par', 'Because the floating rate never changes during the life of the swap', 'Because the notional principal is paid on every reset date', 'Because floating rates are always equal to the swap rate'],
    answer: 0,
    feedback: { 1: 'It changes every period; that is why it is always worth par at a reset.', 2: 'The notional is never exchanged in an interest-rate swap.', 3: 'They differ; the swap rate is fixed, the floating rate moves.' },
    hints: ['What is a bond worth whose coupon is always the going market rate?'],
    solution: 'A floating-rate bond that pays the market rate for each coming period is priced at par when the rate is reset.',
  },
];

export const independent = [
  {
    id: 'f08-sw-i1', type: 'num', kind: 'numerical',
    prompt: `Brightcup pays ${(D.swapRate * 100).toFixed(4)}% fixed on $200 million. The benchmark is reset at 5.2% for year 3. What net amount does Brightcup receive at the end of year 3 ($)?`,
    answer: Math.round((0.052 - D.swapRate) * 200e6), check: () => (0.052 - D.swapRate) * W.notional, unit: '$', places: 0, tol: 1,
    solution: `(5.2% − ${(D.swapRate * 100).toFixed(4)}%) × 200,000,000 = $${Math.round((0.052 - D.swapRate) * 200e6).toLocaleString('en-US')}.`,
  },
  {
    id: 'f08-sw-i2', type: 'num', kind: 'numerical',
    prompt: 'Zero rates for years 1–3 are 5.0%, 4.8% and 4.6% (annual). What is the three-year swap rate (%)?',
    answer: Math.round(swapRate(discountFactors([0.05, 0.048, 0.046])) * 1e6) / 1e4, check: () => swapRate(discountFactors([0.05, 0.048, 0.046])) * 100, unit: '%', places: 4, tol: 0.0001,
    solution: `DFs 0.952381, 0.910495, 0.873786; sum 2.736661. k = (1 − 0.873786) ÷ 2.736661 = ${(swapRate(discountFactors([0.05, 0.048, 0.046])) * 100).toFixed(4)}%. A falling curve puts the swap rate above the three-year zero rate.`,
  },
  {
    id: 'f08-sw-i3', type: 'num', kind: 'numerical',
    prompt: 'A payer swap on $10 million has a fixed rate of 4.0% and three annual payments left. Today’s three-year swap rate is 3.5%, and the three discount factors sum to 2.80. What is the swap worth to the fixed payer ($)?',
    answer: -140000, check: () => (0.035 - 0.04) * 10e6 * 2.8, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 140000, say: 'Rates have fallen below the fixed rate, so paying 4.0% is now a liability.' }],
    solution: '(3.5% − 4.0%) × 10,000,000 × 2.80 = −$140,000.',
  },
  {
    id: 'f08-sw-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Does each party gain or lose value when market interest rates rise?',
    items: ['A company paying fixed on a swap', 'A bank receiving fixed on a swap', 'A company with an unhedged floating-rate loan', 'An investor holding a fixed-rate bond'],
    categories: ['Gains', 'Loses'],
    answer: [0, 1, 1, 1],
    solution: 'Paying fixed gains when rates rise. Receiving fixed (like holding a fixed bond) loses, and a floating-rate borrower pays more.',
  },
  {
    id: 'f08-sw-i5', type: 'mc', kind: 'applied',
    prompt: 'A US company issues a 5-year bond in euros to fund a German plant whose profits are in euros. Its lenders want euros; its shareholders want dollar profits. What does a currency swap from euros into dollars do?',
    options: ['Turns its euro payments into dollar payments at a rate fixed today', 'Turns its fixed-rate euro debt into floating-rate euro debt', 'Removes the need to repay the euro principal at maturity', 'Guarantees that the plant’s euro profits are worth more in dollars'],
    answer: 0,
    feedback: { 1: 'That would be an interest-rate swap in euros.', 2: 'The principal is still repaid; the swap supplies the euros in exchange for dollars.', 3: 'A swap fixes the exchange of payments; it does not change the plant’s profits.' },
    solution: 'The company exchanges principal at the start and at maturity and swaps euro interest for dollar interest, so its debt behaves like dollar debt. (With euro profits, it might prefer to keep some euro debt as a natural hedge.)',
  },
];

export const check = [
  {
    id: 'f08-sw-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What changes hands on each payment date of a plain-vanilla interest-rate swap?',
    options: ['Only the net difference between fixed and floating interest', 'Both full interest payments and the notional principal', 'The full fixed payment, with the floating one paid at maturity', 'Nothing until the swap matures, when all the interest is settled'],
    answer: 0,
    feedback: { 1: 'The notional is never exchanged, and payments are netted.', 2: 'Both legs pay on each date; only the net moves.', 3: 'Payments are made each period.' },
    solution: 'Payments are netted: the party owing more pays the difference.',
  },
  {
    id: 'f08-sw-k2', type: 'num', kind: 'numerical',
    prompt: 'Discount factors for years 1–4 are 0.96, 0.92, 0.88 and 0.84. What is the four-year swap rate (%)?',
    answer: 4.4444, check: () => swapRate([0.96, 0.92, 0.88, 0.84]) * 100, unit: '%', places: 4, tol: 0.0001,
    solution: '(1 − 0.84) ÷ (0.96 + 0.92 + 0.88 + 0.84) = 0.16 ÷ 3.60 = 4.4444%.',
  },
  {
    id: 'f08-sw-k3', type: 'num', kind: 'numerical',
    prompt: 'A receiver swap (receives fixed 3.2%) on $25 million has two annual payments left, on a reset date. Discount factors are 0.95 and 0.90. What is it worth to the fixed receiver ($)?',
    answer: Math.round(swapValue({ notional: 25e6, fixed: 0.032, df: [0.95, 0.9], payFixed: false })), check: () => swapValue({ notional: 25e6, fixed: 0.032, df: [0.95, 0.9], payFixed: false }), unit: '$', places: 0, tol: 1,
    solution: 'Fixed bond: 25,000,000 × (0.032 × 1.85 + 0.90) = 23,980,000. Floating bond: 25,000,000. Receiver value = 23,980,000 − 25,000,000 = −$1,020,000.',
  },
  {
    id: 'f08-sw-k4', type: 'mc', kind: 'applied',
    prompt: 'A company with a floating-rate loan expects its revenues to rise with interest rates (it lends to its customers at floating rates). Should it swap the loan to fixed?',
    options: ['Probably not: its floating costs are already offset by revenues', 'Yes, because fixed-rate debt is always less risky for a company', 'Yes, because swaps always reduce a company’s interest cost', 'No, because swaps cannot be used with loans from banks'],
    answer: 0,
    feedback: { 1: 'Fixing the rate would create a mismatch with its floating revenues.', 2: 'A swap at a fair rate changes risk, not the expected cost.', 3: 'Swaps are widely used to hedge bank loans.' },
    solution: 'Its natural hedge already matches floating costs to floating revenues; fixing the debt would add risk.',
  },
  {
    id: 'f08-sw-k5', type: 'num', kind: 'numerical',
    prompt: 'Zero rates: 4.0% (1 year) and 4.2% (2 years), annual compounding. What is the discount factor for year 2 (6 decimals)?',
    answer: 0.92101, check: () => 1 / 1.042 ** 2, unit: '', places: 6, tol: 0.000001,
    solution: '1 ÷ 1.042² = 0.921010.',
  },
  {
    id: 'f08-sw-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Since the reforms after 2008, how is the counterparty risk of most standard swaps between dealers handled?',
    options: ['Central clearing, with margin posted as values change', 'By requiring each swap to be repaid in full every year', 'By banning swaps between banks', 'By exchanging the notional principal at the start'],
    answer: 0,
    feedback: { 1: 'Swaps run for their full term; collateral covers changes in value.', 2: 'Interbank swaps remain the core of the market.', 3: 'The notional is not exchanged in an interest-rate swap.' },
    solution: 'Standard swaps are cleared through central counterparties, which collect margin as their values change, like futures.',
  },
];
