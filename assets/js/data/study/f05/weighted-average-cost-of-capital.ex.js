// weighted-average-cost-of-capital.ex.js — F05 · The weighted average cost of capital: widgets, practice and the
// knowledge check. Answer keys live here. Lantern’s figures come from case.js (DERIVED.targetWacc at TARGET_DV); every
// other business named here is fictional. The debt-rate bands in the capstructure widget beyond 25% debt are
// illustrative assumptions, not Coastline quotes.
import { MARKET, PEERS, DEBT, TARGET_DV, TAX, DERIVED, coldBrewFlows } from './case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { npv } from '../../../core/invest.js?v=28';

const { rf, mrp, smallFirm } = MARKET;
const rD = DEBT.termLoan.rate;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;   // epsilon: 5.625 shows as 5.63
const money0 = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const CB = coldBrewFlows().fcf;
const waccAt = (dv, prem = smallFirm) => { const b = CF.releverBeta(DERIVED.betaU, dv / (1 - dv), TAX); return CF.wacc({ E: 1 - dv, D: dv, rE: rf + b * mrp + prem, rD, tax: TAX }).wacc; };

export const widgets = {
  'wacc-lantern': {
    type: 'capstructure',
    title: 'Lantern’s WACC across debt shares',
    peers: PEERS, rf, mrp, premium: smallFirm, tax: TAX,
    rates: [[0.25, rD], [0.4, 0.085], [0.55, 0.10], [0.7, 0.12]],
    dv: TARGET_DV, dvMax: 0.7,
    note: 'Fictional: the three peers, a 4.2% risk-free rate, a 5.5% market risk premium and Ana’s 3% premium. Coastline’s 7.5% applies up to 25% debt; the higher rates beyond it (8.5%, 10% and 12%) are illustrative assumptions of how lenders charge more as debt grows. Financial distress costs are not modelled: the capital-structure lesson in module 4 adds them.',
  },
  'wacc-project': {
    type: 'formula',
    title: 'A project’s rate from a pure-play peer, and Cold Brew’s NPV',
    intro: 'Unlever a peer’s beta, relever it at Lantern’s target debt share, and build the project’s rate. The NPV uses Cold Brew’s free cash flows from the project-cash-flows lesson.',
    inputs: [
      { id: 'beta', label: 'Peer’s equity beta', min: 0.5, max: 2.5, step: 0.05, value: 1.4, fmt: 'num' },
      { id: 'de', label: 'Peer’s debt-to-equity ratio', min: 0, max: 1.5, step: 0.05, value: 0.2, fmt: 'num' },
      { id: 'dv', label: 'Lantern’s target debt share, D/V', min: 0, max: 60, step: 1, value: 20, fmt: 'pct' },
      { id: 'prem', label: 'Extra premium on equity', min: 0, max: 5, step: 0.5, value: 3, fmt: 'pct' },
      { id: 'rd', label: 'Cost of debt before tax', min: 4, max: 12, step: 0.25, value: 7.5, fmt: 'pct' },
    ],
    compute: (v) => {
      const dv = v.dv / 100, de = dv / (1 - dv);
      const bU = CF.unleverBeta(v.beta, v.de, TAX), bL = CF.releverBeta(bU, de, TAX);
      const rE = rf + bL * mrp + v.prem / 100;
      const r = CF.wacc({ E: 1 - dv, D: dv, rE, rD: v.rd / 100, tax: TAX }).wacc;
      const n = npv(r, CB), nW = npv(DERIVED.targetWacc, CB);
      const rates = Array.from({ length: 16 }, (_, i) => i * 2);
      const cmp = r > DERIVED.targetWacc + 1e-9 ? 'above' : r < DERIVED.targetWacc - 1e-9 ? 'below' : 'equal to';
      return {
        headline: { label: 'Project rate', value: pct(r) },
        rows: [
          ['Peer’s unlevered beta', bU.toFixed(3)],
          ['Relevered at Lantern’s D/E', `${bL.toFixed(3)} (D/E ${de.toFixed(3)})`],
          ['Cost of equity for the project', pct(rE)],
          ['After-tax cost of debt', pct(v.rd / 100 * (1 - TAX))],
          ['Cold Brew NPV at this rate', money0(n)],
          ['Cold Brew NPV at Lantern’s WACC (11.33%)', money0(nW)],
        ],
        note: `This rate is ${cmp} Lantern’s WACC. At ${pct(r)} Cold Brew’s NPV is ${money0(n)}: ${n > 0 ? 'still worth doing on these forecasts.' : 'the project no longer pays for its risk on these forecasts.'} Only systematic risk belongs in the rate; uncertainty about sales belongs in the cash-flow analysis.`,
        chart: { kind: 'line', x: { label: 'Discount rate (%)', values: rates },
          series: [{ name: 'Cold Brew NPV', values: rates.map((x) => Math.round(npv(x / 100, CB))) }],
          y: { label: 'NPV ($)' } },
      };
    },
  },
  'wacc-calc': {
    type: 'formula',
    title: 'WACC from market values',
    intro: 'Market values (in $ millions) and costs for any firm. The starting values are Wren Valley Storage’s (fictional).',
    inputs: [
      { id: 'E', label: 'Equity (market value, $m)', min: 0, max: 500, step: 0.1, value: 222, fmt: 'num' },
      { id: 'P', label: 'Preferred stock (market value, $m)', min: 0, max: 200, step: 0.1, value: 0, fmt: 'num' },
      { id: 'D', label: 'Debt (market value, $m)', min: 0, max: 300, step: 0.1, value: 93.6, fmt: 'num' },
      { id: 'rE', label: 'Cost of equity', min: 4, max: 25, step: 0.1, value: 12, fmt: 'pct' },
      { id: 'rP', label: 'Cost of preferred stock', min: 2, max: 15, step: 0.1, value: 7, fmt: 'pct' },
      { id: 'rD', label: 'Cost of debt before tax', min: 1, max: 15, step: 0.1, value: 6.4, fmt: 'pct' },
      { id: 'T', label: 'Tax rate', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.E + v.P + v.D <= 0) return { error: 'Enter at least one positive market value.' };
      const w = CF.wacc({ E: v.E, D: v.D, P: v.P, rE: v.rE / 100, rD: v.rD / 100, rP: v.rP / 100, tax: v.T / 100 });
      const parts = [w.wE * v.rE / 100, w.wP * v.rP / 100, w.wD * v.rD / 100 * (1 - v.T / 100)];
      return {
        headline: { label: 'WACC', value: pct(w.wacc) },
        rows: [
          ['Weights: equity, preferred, debt', `${pct(w.wE, 1)}, ${pct(w.wP, 1)}, ${pct(w.wD, 1)}`],
          ['After-tax cost of debt', pct(v.rD / 100 * (1 - v.T / 100))],
          ['Contribution of equity', pct(parts[0])],
          ['Contribution of preferred', pct(parts[1])],
          ['Contribution of debt', pct(parts[2])],
        ],
        note: `Each source contributes its weight times its cost; only debt’s cost is reduced by tax. ${w.wD > 0 ? `The tax deduction on interest lowers the WACC by ${pct(w.wD * v.rD / 100 * v.T / 100)}.` : 'With no debt, the WACC is a weighted average of the equity costs alone.'}`,
        chart: { kind: 'bar', x: { label: 'Source', values: ['Equity', 'Preferred', 'Debt'] }, series: [{ name: 'Contribution to WACC (%)', values: parts.map((x) => Math.round(x * 10000) / 100) }], y: { label: 'Percentage points' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f05-wacc-g1', type: 'steps', kind: 'numerical',
    prompt: 'Eastbrook Ferries (fictional, listed) has 5 million shares at $24.00. Its bonds have a face value of $64 million and trade at 93.75% of face, yielding 6.8%. Its cost of equity is 11% and its tax rate 25%.',
    solution: 'Equity 5 × 24 = $120 million; debt 64 × 0.9375 = $60 million; V = $180 million. Weights: 66.7% equity, 33.3% debt. WACC = 0.667 × 11% + 0.333 × 6.8% × 0.75 = 7.33% + 1.70% = 9.03%.',
    steps: [
      { id: 'f05-wacc-g1-s1', type: 'num', prompt: 'What is the market value of Eastbrook’s equity, in $ millions?',
        answer: 120, check: () => 5 * 24, unit: '$m', places: 1, tol: 0.1,
        hints: ['Shares × price.'],
        wrong: [{ value: 24, say: 'That is the price of one share. Multiply by the 5 million shares.' }] },
      { id: 'f05-wacc-g1-s2', type: 'num', prompt: 'What share of Eastbrook’s value is debt, at market values? Give a percentage to one decimal place.',
        answer: 33.3, check: () => 60 / 180 * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Debt at market value is 64 × 0.9375.', 'D ÷ (D + E) = 60 ÷ 180.'],
        wrong: [{ value: 34.8, say: 'That uses the bonds’ face value, $64 million. Use what they trade at: $60 million.' }, { value: 50, say: 'That is D ÷ E. The weight is D ÷ (D + E).' }] },
      { id: 'f05-wacc-g1-s3', type: 'num', prompt: 'What is Eastbrook’s WACC? Give a percentage to two decimal places.',
        answer: 9.03, check: () => (120 * 0.11 + 60 * 0.068 * 0.75) / 180 * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['WACC = (E/V) × r_E + (D/V) × r_D × (1 − T).', '0.667 × 11% + 0.333 × 6.8% × 0.75.'],
        wrong: [{ value: 9.6, say: 'You left out the tax deduction on interest: use 6.8% × 0.75 = 5.1% for debt.' }, { value: 8.9, say: 'That is a simple average of 11% and 6.8%. Weight each by its share of the firm’s value, and take tax off the debt.' }] },
    ],
  },
  {
    id: 'f05-wacc-g2', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a firm’s equity and debt at market value, its cost of equity, its pre-tax cost of debt and its tax rate. In B7, write a formula for its WACC.',
    sheet: { cells: { A1: 'Equity, market value ($m)', B1: 120, A2: 'Debt, market value ($m)', B2: 60, A3: 'Cost of equity', B3: 0.11, A4: 'Cost of debt, before tax', B4: 0.068, A5: 'Tax rate', B5: 0.25, A7: 'WACC' },
      vary: { B3: [0.09, 0.14], B4: [0.05, 0.08], B5: [0.21, 0.3] } },
    cell: 'B7', view: 'A1:B7', widths: { A: 28, B: 12 }, formats: { B1: '#,##0.0', B2: '#,##0.0', B3: '0.0%', B4: '0.0%', B5: '0%', B7: '0.00%' },
    answer: '=(B1*B3+B2*B4*(1-B5))/(B1+B2)',
    alt: ['=B1/(B1+B2)*B3+B2/(B1+B2)*B4*(1-B5)'],
    wrong: [
      { formula: '=(B1*B3+B2*B4)/(B1+B2)', say: 'That leaves out the tax deduction on interest. Multiply the cost of debt by (1−B5).' },
      { formula: '=(B3+B4*(1-B5))/2', say: 'That averages the two costs equally. Weight each by its market value: B1 and B2.' },
      { formula: '=B1/B2*B3+B4*(1-B5)', say: 'The weights must be shares of the total, B1/(B1+B2) and B2/(B1+B2), and they must add to 1.' },
    ],
    hints: ['Each cost times its share of the total value, added up; tax comes off the debt only.', '=(B1*B3 + B2*B4*(1−B5)) / (B1+B2).'],
    solution: '<x>=(B1*B3+B2*B4*(1-B5))/(B1+B2)</x> gives 9.03% for Eastbrook. Dividing the sum of value × cost by the total value is the same as weighting each cost by its share.',
  },
  {
    id: 'f05-wacc-g3', type: 'steps', kind: 'applied',
    prompt: 'Rowanbrook Hotels (fictional) is considering a commercial laundry that would serve other hotels. Its pure-play peer, a listed laundry firm, has an equity beta of 0.70 at a D/E of 0.40. Rowanbrook keeps 40% debt (D/E 0.6667) and pays 6.5% on it; tax is 25%, the risk-free rate 4.2% and the market risk premium 5.5%. Rowanbrook’s own WACC is 9.4%.',
    solution: 'Unlever: 0.70 ÷ (1 + 0.75 × 0.40) = 0.538. Relever at D/E 0.6667: 0.538 × (1 + 0.75 × 0.6667) = 0.538 × 1.5 = 0.808. Cost of equity 4.2% + 0.808 × 5.5% = 8.64%. Project rate 0.6 × 8.64% + 0.4 × 6.5% × 0.75 = 5.19% + 1.95% = 7.14%, well below the hotel group’s 9.4%: laundry is a steadier business than hotels.',
    steps: [
      { id: 'f05-wacc-g3-s1', type: 'num', prompt: 'The peer’s unlevered beta, to three decimal places.',
        answer: 0.538, check: () => CF.unleverBeta(0.7, 0.4, 0.25), unit: '', places: 3, tol: 0.002,
        hints: ['β_U = β_L ÷ (1 + (1 − T) D/E).'],
        wrong: [{ value: 0.5, say: 'You left out the tax: 0.70 ÷ 1.40. Use 1 + 0.75 × 0.40 = 1.30.' }] },
      { id: 'f05-wacc-g3-s2', type: 'num', prompt: 'The laundry’s beta relevered at Rowanbrook’s D/E, to three decimal places.',
        answer: 0.808, check: () => CF.releverBeta(CF.unleverBeta(0.7, 0.4, 0.25), 0.4 / 0.6, 0.25), unit: '', places: 3, tol: 0.003,
        hints: ['Multiply by 1 + 0.75 × 0.6667 = 1.5.'],
        wrong: [{ value: 0.7, say: 'That is the peer’s beta at its own leverage. Unlever, then relever at Rowanbrook’s.' }] },
      { id: 'f05-wacc-g3-s3', type: 'num', prompt: 'The rate for the laundry project. Give a percentage to two decimal places.',
        answer: 7.14, check: () => { const b = CF.releverBeta(CF.unleverBeta(0.7, 0.4, 0.25), 0.4 / 0.6, 0.25); return (0.6 * (rf + b * mrp) + 0.4 * 0.065 * 0.75) * 100; }, unit: '%', places: 2, tol: 0.03,
        hints: ['Cost of equity 4.2% + β × 5.5%; then weight 60% equity and 40% after-tax debt.'],
        wrong: [{ value: 9.4, say: 'That is Rowanbrook’s own WACC, which reflects hotels. The laundry’s risk comes from its peer.' }, { value: 7.79, say: 'You left the tax off the debt: use 6.5% × 0.75.' }] },
      { id: 'f05-wacc-g3-s4', type: 'mc', prompt: 'The laundry is expected to earn 8.2%. What should Rowanbrook conclude?',
        options: ['Accept: 8.2% is above the 7.14% its own risk requires', 'Reject: 8.2% is below the group’s 9.4% WACC', 'Reject: a hotel group should not invest outside hotels', 'Accept only if it can be financed entirely with debt at 6.5%'],
        answer: 0,
        hints: ['Which rate reflects the laundry’s risk?'],
        feedback: { 1: 'The group WACC reflects hotels’ risk. Judged against it, a safe project that earns more than its own risk requires would be rejected wrongly.', 2: 'Diversification by a firm is not in itself a reason to reject; what matters is whether the project earns its required return.', 3: 'The financing mix is already in the rate. Borrowing more for this project would not change the risk of its business.' } },
    ],
  },
  {
    id: 'f05-wacc-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s accountant suggests weighting Lantern’s WACC with its 31 December 2027 balance sheet: $65,250 of debt and $62,818 of equity, about 51% debt. Why is that a poor choice?',
    options: ['Book equity is history (Ana’s $20,000 and profits kept), not what the equity is worth', 'Balance-sheet debt is always worth far more than its market value, so debt is overstated', 'The WACC must use exactly the average debt share of Lantern’s three listed peers, 23.9%', 'Book values include the line of credit, which is not a form of debt'],
    answer: 0,
    hints: ['What does book equity measure?'],
    feedback: { 1: 'For bank loans at close to current rates, book and market values of debt are usually close. The problem is on the equity side.', 2: 'The peers are evidence for a target, not a rule: Ana sets her own target (20%) with the peers in mind.', 3: 'The line of credit is debt; it is left out of the weights because it finances working capital, not because it isn’t borrowing.' },
    solution: 'The weights should reflect the market values of the claims, or the target mix kept over the project’s life. Book equity is historical: $20,000 paid in and profits kept. Lantern’s book weights would put far too much weight on cheap debt and understate its cost of capital; a target consistent with the peers’ market structures is better.',
  },
];

export const independent = [
  {
    id: 'f05-wacc-i1', type: 'num', kind: 'numerical',
    prompt: 'Glenmere Mills (fictional) has equity worth $300 million (cost 8.5%), preferred stock worth $50 million (cost 6.2%) and debt worth $150 million (pre-tax cost 5.4%). Tax is 25%. What is its WACC? Give a percentage to two decimal places.',
    answer: 6.94, check: () => CF.wacc({ E: 300, P: 50, D: 150, rE: 0.085, rP: 0.062, rD: 0.054, tax: 0.25 }).wacc * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 7.34, say: 'You left out the tax deduction on interest. Debt costs 5.4% × 0.75 = 4.05% after tax.' }, { value: 6.78, say: 'You took tax off the preferred dividend too. Preferred dividends are not deductible: use 6.2% as it is.' }],
    solution: 'V = 300 + 50 + 150 = 500. WACC = 0.60 × 8.5% + 0.10 × 6.2% + 0.30 × 5.4% × 0.75 = 5.10% + 0.62% + 1.215% = 6.94%.',
  },
  {
    id: 'f05-wacc-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm needs $5,000,000 for a project and raises it at its target mix of 60% equity and 40% debt. Issuing equity costs 6% of the amount raised and debt 1.5%. Following the outlay method, how much should be added to the project’s initial outlay for flotation costs? Give whole dollars.',
    answer: 219207, check: () => 5e6 / (1 - (0.6 * 0.06 + 0.4 * 0.015)) - 5e6, unit: '$', places: 0, tol: 2,
    wrong: [{ value: 210000, say: 'That is 4.2% of $5,000,000. The costs are a share of the amount raised, which is larger: raise 5,000,000 ÷ (1 − 0.042).' }, { value: 300000, say: 'That applies the equity rate to everything. Weight the two rates by the target mix.' }],
    solution: 'f_A = 0.6 × 6% + 0.4 × 1.5% = 4.2%. Amount raised = 5,000,000 ÷ 0.958 = $5,219,207, so flotation costs add $219,207 to the outlay.',
  },
  {
    id: 'f05-wacc-i3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s WACC is 11.33% in nominal terms. If Ana forecast a project’s cash flows in today’s prices, with expected inflation of 2.5% a year, what real rate should she use? Give a percentage to two decimal places.',
    answer: 8.61, check: () => (1.1133 / 1.025 - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 8.83, say: 'That subtracts inflation (11.33% − 2.5%). The exact relation divides: 1.1133 ÷ 1.025 − 1.' }, { value: 11.33, say: 'That is the nominal rate. Cash flows in today’s prices need a real rate.' }],
    solution: '1.1133 ÷ 1.025 − 1 = 8.61%. Subtracting gives 8.83%, close but not exact (F04’s Fisher relation).',
  },
  {
    id: 'f05-wacc-i4', type: 'classify', kind: 'applied',
    prompt: 'Lantern’s WACC (11.33%) reflects its café, catering and online coffee business. For each use of money, should the discount rate be higher than, about the same as, or lower than Lantern’s WACC?',
    items: [
      'Cold Brew: a packaged drink sold through grocers, with heavy promotion.',
      'A third café run exactly like Harbourside and Millbrook.',
      'Putting spare cash into a government bond until it is needed.',
      'Solar panels whose savings depend on electricity prices rather than coffee sales.',
    ],
    categories: ['Higher', 'About the same', 'Lower'],
    answer: [0, 1, 2, 2],
    feedback: {
      0: 'Its natural peers are drinks makers, whose business betas are higher than the coffee peers’.',
      1: 'A copy of Lantern’s existing business has the firm’s average risk: the WACC fits.',
      2: 'A government bond is close to risk-free: its required return is the risk-free rate, far below Lantern’s WACC.',
      3: 'Savings tied to electricity prices move little with the economy and much less than café sales, so their systematic risk is lower.',
    },
    solution: 'Match the rate to each use’s systematic risk: higher for Cold Brew, the WACC for a copy of the existing business, lower for near-risk-free uses of cash and for savings that hardly move with the economy.',
  },
  {
    id: 'f05-wacc-i5', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional firm’s analyst deducts the interest on the loan that will pay for a machine from the machine’s yearly cash flows, then discounts them at the firm’s WACC. What is wrong?',
    options: ['Debt is charged twice: in the cash flows and in the WACC', 'Interest should be deducted, but the rate should then be the cost of debt alone', 'Nothing is wrong, provided the interest is deducted after tax', 'The WACC should be raised to allow for the loan’s repayments'],
    answer: 0,
    feedback: { 1: 'Discounting at the cost of debt alone would ignore the shareholders’ required return on the rest of the money.', 2: 'After tax or not, the interest is still counted in the cash flows and again in the rate.', 3: 'Repayments are financing flows too; like interest, they stay out of free cash flow.' },
    solution: 'Free cash flow excludes interest because the WACC already charges for debt through its after-tax debt term. Deducting interest as well double-counts it and understates the NPV. (Discounting cash flows after interest at the cost of equity is a different, consistent method, but not with the WACC.)',
  },
  {
    id: 'f05-wacc-i6', type: 'formula', kind: 'applied',
    prompt: 'Column B holds a firm’s market values of equity, preferred stock and debt; column C the after-tax cost of each; D2:D4 their weights. In B6, write one formula that returns the WACC.',
    sheet: { cells: { A1: 'Source', B1: 'Market value ($m)', C1: 'After-tax cost', D1: 'Weight', A2: 'Equity', B2: 300, C2: 0.085, D2: '=B2/SUM($B$2:$B$4)', A3: 'Preferred', B3: 50, C3: 0.062, D3: '=B3/SUM($B$2:$B$4)', A4: 'Debt', B4: 150, C4: 0.0405, D4: '=B4/SUM($B$2:$B$4)', A6: 'WACC' },
      vary: { B2: [250, 420], B3: [30, 90], B4: [100, 220], C2: [0.08, 0.11] } },
    cell: 'B6', view: 'A1:D6', widths: { A: 12, B: 17, C: 14, D: 10 }, formats: { B: '#,##0.0', C: '0.00%', D: '0.0%', B6: '0.00%' },
    answer: '=SUMPRODUCT(C2:C4,D2:D4)',
    alt: ['=SUMPRODUCT(D2:D4,C2:C4)', '=SUMPRODUCT(B2:B4,C2:C4)/SUM(B2:B4)', '=C2*D2+C3*D3+C4*D4'],
    wrong: [
      { formula: '=AVERAGE(C2:C4)', say: 'A simple average treats $50 million of preferred like $300 million of equity. Weight each cost by its share of value.' },
      { formula: '=SUMPRODUCT(B2:B4,C2:C4)', say: 'That multiplies costs by dollar values without dividing by the total. Use the weights in D, or divide by SUM(B2:B4).' },
      { formula: '=SUM(C2:C4)*SUM(D2:D4)', say: 'That adds all the costs and multiplies by 1. Each cost must be multiplied by its own weight before adding: SUMPRODUCT.' },
    ],
    solution: '<x>=SUMPRODUCT(C2:C4,D2:D4)</x> multiplies each cost by its weight and adds: 0.60 × 8.5% + 0.10 × 6.2% + 0.30 × 4.05% = 6.94%. The costs in C are already after tax, so no (1 − T) is needed here.',
  },
];

export const check = [
  {
    id: 'f05-wacc-k1', type: 'num', kind: 'numerical',
    prompt: 'Suppose Ana set Lantern’s target at 30% debt (D/E 0.4286) and Coastline still charged 7.5%. Relevering the peers’ average unlevered beta of 0.850 and keeping her 3% premium, what would Lantern’s WACC be? Give a percentage to two decimal places.',
    answer: 11.05, check: () => waccAt(0.3) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [{ value: 11.33, say: 'That is the WACC at 20%. At 30% debt the relevered beta rises to 1.124 and the weights change.' }, { value: 10.61, say: 'That keeps the cost of equity at 12.75% while changing the weights. More debt raises the relevered beta.' }],
    solution: 'β_L = 0.850 × (1 + 0.75 × 0.4286) = 1.124. r_E = 4.2% + 1.124 × 5.5% + 3% = 13.38%. WACC = 0.7 × 13.38% + 0.3 × 5.625% = 9.37% + 1.69% = 11.05%. At a fixed cost of debt, more debt lowers the WACC slightly; in practice the cost of debt would rise too. The lesson’s widget assumes it does (8.5% above 25% debt), which gives about 11.28% at 30%.',
  },
  {
    id: 'f05-wacc-k2', type: 'mc', kind: 'conceptual',
    prompt: 'Why might Lantern’s WACC be the wrong discount rate for Cold Brew?',
    options: ['Cold Brew’s systematic risk resembles a drinks maker’s, not the cafés’', 'Cold Brew will be financed entirely by Ana’s equity, so its rate should be 12.75%', 'Cold Brew’s sales forecasts are uncertain, so its rate needs a premium for forecasting error', 'The WACC is too low because it includes a size premium'],
    answer: 0,
    feedback: { 1: 'The rate depends on the project’s risk, not on which dollars happen to pay for it; the firm’s target mix finances everything over time.', 2: 'Uncertainty that is not systematic belongs in the cash-flow analysis (sensitivity, scenarios), not the rate.', 3: 'A size premium raises the WACC, not lowers it; and it applies to Lantern as a whole.' },
    solution: 'The WACC is the right rate for projects as risky as the firm’s existing business. Cold Brew is a packaged drink sold through grocers; its pure-play peers have a higher business beta, giving a rate of about 13.25%.',
  },
  {
    id: 'f05-wacc-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm has 8 million shares at $15.00 and debt with a market value of $45 million. What share of its value is debt? Give a percentage to one decimal place.',
    answer: 27.3, check: () => 45 / (8 * 15 + 45) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 37.5, say: 'That is D ÷ E (45 ÷ 120). The weight is D ÷ (D + E).' }],
    solution: 'E = 8 × 15 = $120 million; D/V = 45 ÷ 165 = 27.3%.',
  },
  {
    id: 'f05-wacc-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional utility group’s WACC is 8%. Its telecoms division (pure-play rate 11%) proposes a project with an IRR of 9.5%, typical of the division’s risk. What should the board do?',
    options: ['Reject it: 9.5% is below the 11% its risk requires', 'Accept it: 9.5% beats the group’s 8% WACC', 'Accept it, because a lower group rate is a benefit of diversification', 'Reject it, because the group should use 11% for all its projects'],
    answer: 0,
    feedback: { 1: 'The group WACC averages the utility and telecoms risks. A telecoms project must earn what telecoms risk requires.', 2: 'Investors can diversify for themselves; owning a utility does not lower the return they require on a telecoms project.', 3: 'Using the highest rate everywhere would reject good utility projects. Each division’s projects take that division’s rate.' },
    solution: 'Judge the project at the rate for its own risk, 11%. Its 9.5% falls short, so it destroys value even though it beats the group’s average rate.',
  },
  {
    id: 'f05-wacc-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are errors in estimating or using a WACC? Select all that apply.',
    options: ['Weighting by book values of equity', 'Discounting real cash flows at a nominal WACC', 'Using the after-tax cost of debt in the WACC', 'Deducting interest from cash flows that are then discounted at the WACC', 'Relevering the beta at a D/E different from the one in the WACC’s weights'],
    answer: [0, 1, 3, 4],
    feedback: { 2: 'That is correct practice: free cash flow taxes EBIT as if there were no interest, so the tax saving enters through r_D(1 − T).' },
    solution: 'Errors: book weights, a nominal rate for real cash flows, charging interest in the cash flows as well as in the rate, and a beta relevered at a different capital structure from the weights. Using the after-tax cost of debt is right.',
  },
  {
    id: 'f05-wacc-k6', type: 'num', kind: 'applied',
    prompt: 'Ana’s accountant asks what Lantern’s WACC would be without the 3% size premium, keeping the 20% target and the 7.5% cost of debt. Give a percentage to two decimal places.',
    answer: 8.93, check: () => waccAt(TARGET_DV, 0) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 9.75, say: 'That is the cost of equity without the premium. Weight it with the after-tax cost of debt.' }, { value: 8.33, say: 'That takes the full 3 points off the WACC. The premium applies only to the 80% financed by equity: 11.33% − 0.8 × 3%.' }],
    solution: '0.8 × 9.75% + 0.2 × 5.625% = 7.80% + 1.13% = 8.93%: 2.4 points lower, because the premium applies to the 80% equity share.',
  },
];
