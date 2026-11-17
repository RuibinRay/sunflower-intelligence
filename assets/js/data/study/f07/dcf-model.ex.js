// dcf-model.ex.js — F07 · A DCF model from the forecast: widgets, practice and the knowledge check (answer keys live
// here). Figures from case.js (MODEL, DCF, VALUATION, NET_DEBT_2027); every num item's `check` recomputes its answer.
import { MODEL as M, DCF as D, VALUATION as V, NET_DEBT_2027, dcf } from './case.js?v=39';

const R = D.rows;
const f0 = (x) => (Math.round(x) + 0).toLocaleString('en-US');

export const widgets = {
  'dcf-explorer': {
    type: 'formula', title: 'Lantern’s DCF, from the full model',
    intro: 'Start at F05’s WACC (11.16%) and Ana’s 2.5% long-run growth.',
    inputs: [
      { id: 'wacc', label: 'Discount rate (WACC)', min: 8, max: 20, step: 0.01, value: 11.16, fmt: 'pct' },
      { id: 'g', label: 'Long-run growth', min: 1, max: 4, step: 0.1, value: 2.5, fmt: 'pct' },
    ],
    compute: (v) => {
      // 11.16 on the slider stands for F05's WACC itself (11.1608%), so the default matches the lesson to the dollar
      const d = dcf(M, { ...V, wacc: Math.abs(v.wacc - 11.16) < 1e-9 ? V.wacc : v.wacc / 100, terminalGrowth: v.g / 100 });
      return {
        headline: { label: 'Equity value, 31 December 2027', value: `$${f0(d.equity)}` },
        rows: [['Present value of 2028–2032 FCFF', `$${f0(d.sumPv)}`], ['Present value of the terminal value', `$${f0(d.pvTv)}`], ['Enterprise value', `$${f0(d.ev)}`], ['Net debt at the end of 2027', `$${f0(d.netDebt)}`], ['Terminal value’s share of enterprise value', `${(d.tvShare * 100).toFixed(0)}%`], ['Hollis’s price implies (before his money)', `$${f0(V.hollisPre)}`]],
        note: d.equity > V.hollisPre * 1.5 ? 'At this rate the forecast values Lantern well above Hollis’s price.' : d.equity < V.hollisPre * 0.9 ? 'At this rate the forecast values Lantern below Hollis’s price.' : 'At this rate the forecast and Hollis’s price are close: the discount rate explains most of the gap.',
        chart: { kind: 'bar', x: { label: 'Year', values: R.map((r) => String(r.year)) }, series: [{ name: 'Free cash flow to the firm', values: d.rows.map((r) => Math.round(r.fcff)) }], y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f07-dcf-g1', type: 'num', kind: 'numerical',
    prompt: `In 2029 Lantern’s EBIT is $${f0(R[1].ebit)}, depreciation $${f0(R[1].dep)}, capital spending $${f0(R[1].capex)} and the increase in working capital $${f0(R[1].dNwc)}. At a 25% tax rate on EBIT, what is free cash flow to the firm?`,
    answer: Math.round(R[1].fcff), check: () => R[1].ebit * 0.75 + R[1].dep - R[1].capex - R[1].dNwc, unit: '$', places: 0, tol: 1,
    wrong: [{ value: Math.round(R[1].ebit * 0.75 + R[1].dep - R[1].capex - R[1].dNwc - M.rows[1].interest), say: 'Interest is not deducted from FCFF: it is a payment to lenders, whose cost is in the WACC.' }, { value: Math.round(R[1].ebit * 0.75 - R[1].capex - R[1].dNwc), say: 'Depreciation is not a cash cost: add it back.' }],
    hints: ['NOPAT = EBIT × (1 − 0.25); then add depreciation, subtract capital spending and the increase in working capital.'],
    solution: `${f0(R[1].ebit)} × 0.75 = ${f0(R[1].nopat)}; + ${f0(R[1].dep)} − ${f0(R[1].capex)} − ${f0(R[1].dNwc)} = ${f0(R[1].fcff)} dollars.`,
  },
  {
    id: 'f07-dcf-g2', type: 'steps', kind: 'numerical',
    prompt: 'A business’s NOPAT is $80,000 in the last forecast year and its operating working capital $16,000. Long-run growth is 2.5% and the WACC 11%.',
    steps: [
      { id: 'f07-dcf-g2a', type: 'num', kind: 'numerical', prompt: 'Normalised FCFF for the year after the forecast ($), with capital spending equal to depreciation.', answer: 81600, check: () => 80000 * 1.025 - 0.025 * 16000, unit: '$', places: 0, tol: 1, hints: ['NOPAT × (1 + g) − g × working capital.'] },
      { id: 'f07-dcf-g2b', type: 'num', kind: 'numerical', prompt: 'Terminal value at the end of the forecast ($).', answer: 960000, check: () => (80000 * 1.025 - 0.025 * 16000) / (0.11 - 0.025), unit: '$', places: 0, tol: 1, hints: ['FCFF ÷ (WACC − g).'] },
    ],
    solution: '80,000 × 1.025 − 0.025 × 16,000 = 81,600; 81,600 ÷ 0.085 = 960,000 dollars.',
  },
  {
    id: 'f07-dcf-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s free cash flow is after paying the café leases (their cost is in occupancy, before EBITDA). How should the leases be treated in the bridge from enterprise value to equity?',
    options: ['Leave them out of net debt: their cost is already in the cash flows', 'Subtract the lease liabilities from enterprise value as if they were debt', 'Add the right-of-use assets to the enterprise value as extra assets', 'Subtract both the lease liabilities and the year’s lease payments'],
    answer: 0,
    feedback: { 1: 'That would count the leases twice: once in the cash flows, once as debt.', 2: 'The assets’ value is already in the cash flows they help produce.', 3: 'That is double counting twice over.' },
    hints: ['Has the lease cost already reduced the free cash flow?'],
    solution: 'The FCFF is after the lease payments, so the leases are not debt here. Treating them as debt would require adding their cost back to FCFF.',
  },
  {
    id: 'f07-dcf-g4', type: 'num', kind: 'numerical',
    prompt: 'At an 11.16% discount rate, what is the discount factor for cash received at the end of the fifth year?',
    answer: 0.5892, check: () => 1 / 1.1116 ** 5, unit: '', places: 4, tol: 0.0005,
    hints: ['1 ÷ (1 + rate)⁵.'],
    solution: '1 ÷ 1.1116⁵ = 0.5892.',
  },
];

export const independent = [
  {
    id: 'f07-dcf-i1', type: 'num', kind: 'numerical',
    prompt: `Lantern’s enterprise value is $${f0(D.ev)}. At the end of 2027 it owed $41,250 on its loans and $24,000 on its line of credit, and held $6,531 of cash. What is the equity value?`,
    answer: Math.round(D.equity), check: () => D.ev - (41250 + 24000 - 6531), unit: '$', places: 0, tol: 1,
    wrong: [{ value: Math.round(D.ev - 41250 - 24000), say: 'Cash belongs to the shareholders: add it back (subtract net debt, not gross debt).' }],
    solution: `${f0(D.ev)} − (41,250 + 24,000 − 6,531) = ${f0(D.equity)} dollars.`,
  },
  {
    id: 'f07-dcf-i2', type: 'num', kind: 'numerical',
    prompt: 'An investor pays $90,000 for 25% of a company, in new shares. What is the pre-money value?',
    answer: 270000, check: () => 90000 / 0.25 - 90000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 360000, say: 'That is the post-money value; pre-money excludes the investor’s own cash.' }],
    solution: 'Post-money 90,000 ÷ 0.25 = 360,000; pre-money 360,000 − 90,000 = 270,000 dollars.',
  },
  {
    id: 'f07-dcf-i3', type: 'num', kind: 'numerical',
    prompt: `Lantern’s terminal value is $${f0(D.tv)} and its 2032 EBITDA $${f0(M.rows[4].ebitda)}. What exit multiple of EBITDA does the terminal value imply?`,
    answer: Math.round(D.tv / M.rows[4].ebitda * 100) / 100, check: () => D.tv / M.rows[4].ebitda, unit: '×', places: 2, tol: 0.02,
    solution: `${f0(D.tv)} ÷ ${f0(M.rows[4].ebitda)} = ${(D.tv / M.rows[4].ebitda).toFixed(2)} times.`,
  },
  {
    id: 'f07-dcf-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Which of these belong in free cash flow to the firm?',
    items: ['Tax on EBIT', 'Interest on the term loan', 'Depreciation added back', 'Capital spending on the second kitchen', 'Repayment of the term loan', 'The increase in receivables'],
    categories: ['In FCFF', 'Not in FCFF'],
    answer: [0, 1, 0, 0, 1, 0],
    feedback: { 1: 'Interest is a payment to lenders; its cost is in the WACC.', 4: 'Repayments are financing, not operations.' },
    solution: 'FCFF holds operating items and investment: tax on EBIT, depreciation, capital spending and working capital. Interest and repayments are payments to lenders.',
  },
  {
    id: 'f07-dcf-i5', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s 2032 free cash flow includes a $54,000 café refit. Why does the terminal value use a normalised year instead of growing 2032’s FCFF?',
    options: ['A one-off refit grown for ever would understate the value', 'Because the terminal value must always be higher than the forecast', 'Because 2032 is too far ahead to forecast at all', 'Because refits are financed by debt, so they never affect value'],
    answer: 0,
    feedback: { 1: 'It must reflect a steady state, which may be higher or lower.', 2: 'The forecast includes 2032; the issue is whether it is typical.', 3: 'Capital spending reduces FCFF however it is financed.' },
    solution: 'A terminal value grows one year for ever, so that year must be typical: capital spending equal to depreciation, not a refit year.',
  },
];

export const check = [
  {
    id: 'f07-dcf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is tax in FCFF charged on EBIT rather than on profit after interest?',
    options: ['The WACC already counts the interest tax shield', 'Because businesses pay tax on EBIT under the tax law', 'Because interest is never tax-deductible for small companies', 'To make the valuation lower and so more prudent'],
    answer: 0,
    feedback: { 1: 'Tax is charged on profit after interest; the choice is about not counting the shield twice.', 2: 'Interest is generally deductible; that is the shield.', 3: 'It is about consistency, not prudence.' },
    solution: 'FCFF is the cash flow of an unlevered business; the benefit of deducting interest enters through the WACC’s after-tax cost of debt.',
  },
  {
    id: 'f07-dcf-k2', type: 'num', kind: 'numerical',
    prompt: 'Free cash flow next year is expected to be $50,000, growing 3% a year for ever. The WACC is 10%. What is the business worth today?',
    answer: 714285.71, check: () => 50000 / (0.10 - 0.03), unit: '$', places: 0, tol: 1,
    solution: '50,000 ÷ (0.10 − 0.03) = 714,286 dollars.',
  },
  {
    id: 'f07-dcf-k3', type: 'num', kind: 'numerical',
    prompt: 'The present value of a forecast’s five years of FCFF is $120,000 and of its terminal value $480,000. What share of the enterprise value comes from the terminal value, as a percentage?',
    answer: 80, check: () => 480000 / (120000 + 480000) * 100, unit: '%', places: 0, tol: 0.5,
    solution: '480,000 ÷ 600,000 = 80%.',
  },
  {
    id: 'f07-dcf-k4', type: 'mc', kind: 'applied',
    prompt: 'The model values Lantern at $618,676 before Hollis’s money; his price implies $175,000. What explains most of the gap?',
    options: ['Hollis’s 20% required return against the 11.16% WACC', 'An error in the model’s cash flow statement for 2028', 'The café leases, which the model forgets to subtract as debt', 'The line of credit, which the model treats as equity'],
    answer: 0,
    feedback: { 1: 'The model balances and its FCFF ties to the statements.', 2: 'Leaving leases out of net debt is consistent with FCFF after lease payments.', 3: 'The line of credit is in net debt.' },
    solution: 'At 20% the same forecast gives about $214,000, close to his price: the discount rate, reflecting his risk and illiquidity, explains most of the gap.',
  },
  {
    id: 'f07-dcf-k5', type: 'num', kind: 'numerical',
    prompt: 'A forecast’s terminal value is $900,000 and the final year’s EBITDA $150,000. What exit multiple does it imply?',
    answer: 6, check: () => 900000 / 150000, unit: '×', places: 1, tol: 0.05,
    solution: '900,000 ÷ 150,000 = 6.0 times EBITDA.',
  },
  {
    id: 'f07-dcf-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A modeller uses a long-run growth rate of 8% with a WACC of 9%. What is the problem?',
    options: ['It outgrows the economy, and the value explodes', 'There is no problem as long as the growth rate stays below the WACC', 'Growth rates above 5% make the terminal value negative', 'The WACC must always be twice the growth rate'],
    answer: 0,
    feedback: { 1: 'Below the WACC is necessary, not sufficient; the value becomes hypersensitive and implausible.', 2: 'It stays positive; it becomes enormous.', 3: 'There is no such rule; the issue is plausibility and sensitivity.' },
    solution: 'Growth for ever should not exceed the economy’s, and a spread of 1 point makes the value swing wildly with tiny changes.',
  },
];
