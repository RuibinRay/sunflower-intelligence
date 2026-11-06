// assess-m3.js — F05 module 3 test: The cost of capital (cost-of-debt-and-equity, weighted-average-cost-of-capital).
// No hints. Each item has a full solution, shown when the student reviews the test. New questions, not copies of the
// lesson exercises. Every business named here is fictional; items 4 and 12 use Lantern’s case inputs from case.js
// (the 20% target, Coastline’s 7.5%, the peers’ average unlevered beta).
import { MARKET, DEBT, TARGET_DV, TAX, DERIVED } from './case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { npv } from '../../../core/invest.js?v=28';

const { rf, mrp } = MARKET;
const annuity = (c, n) => Array.from({ length: n }, () => c);

export const items = [
  {
    id: 'f05-m3-1', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'numerical',
    prompt: 'Saltcote Marine (fictional, listed) has a bond with eight years to maturity, a 5.5% coupon paid once a year and a $100 face value, trading at $97.40. Saltcote pays tax at 25%. What is its after-tax cost of debt? Give a percentage to two decimal places.',
    answer: 4.44, check: () => CF.ytm({ price: 97.4, face: 100, coupon: 0.055, years: 8 }) * 0.75 * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 4.13, say: 'That takes tax off the coupon (5.5% × 0.75). The cost of debt is the yield to maturity, about 5.92%, which is above the coupon because the bond trades below $100.' },
      { value: 5.92, say: 'That is the yield before tax. Multiply by (1 − 0.25).' },
      { value: 4.24, say: 'That uses the current yield (5.50 ÷ 97.40 = 5.65%), which ignores the $2.60 gain at maturity.' },
    ],
    solution: 'The yield that makes $5.50 a year for eight years plus $100 at the end worth $97.40 is 5.92% (=RATE(8,5.5,−97.4,100)). After tax: 5.92% × 0.75 = 4.44%.',
  },
  {
    id: 'f05-m3-2', lesson: 'cost-of-debt-and-equity', type: 'mc', kind: 'conceptual',
    prompt: 'A credit-rating agency downgrades Halford Utilities (fictional). Its existing bonds carry a 4% coupon. What happens to its cost of debt?',
    options: [
      'It rises: lenders require more, so bond prices fall and yields rise',
      'It stays at 4%, the coupon written into the bonds',
      'It falls, because the bonds now trade below face value and are cheaper to buy back',
      'It changes only when Halford next issues new bonds and sets a new coupon',
    ],
    answer: 0,
    feedback: {
      1: 'The coupon is fixed at issue; the cost of debt is what lenders require now, read from the yield.',
      2: 'A lower price means a higher yield for buyers, and so a higher cost for any new borrowing. Buying back cheap bonds doesn’t lower the rate lenders require.',
      3: 'The market’s requirement changes at once and shows in today’s prices; a new issue would simply have to match it.',
    },
    solution: 'The downgrade raises the return lenders require for Halford’s risk. Its bonds fall in price until their yield matches that requirement, and that higher yield is its cost of debt for new projects.',
  },
  {
    id: 'f05-m3-3', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'numerical',
    prompt: 'A fictional private bakery chain has two listed peers: one with an equity beta of 1.20 at a D/E of 0.50, the other with 0.95 at a D/E of 0.20, both taxed at 25%. The chain targets 25% debt (D/E 1/3). With a 4.2% risk-free rate and a 5.5% market risk premium, what is its cost of equity from the CAPM, with no extra premium? Give a percentage to two decimal places.',
    answer: 10.04, check: () => { const u = (CF.unleverBeta(1.2, 0.5, 0.25) + CF.unleverBeta(0.95, 0.2, 0.25)) / 2; return CF.capm({ rf, beta: CF.releverBeta(u, 1 / 3, 0.25), mrp }) * 100; }, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: 10.11, say: 'That averages the peers’ equity betas as they stand (1.075). Unlever each first: their debt levels differ.' },
      { value: 8.87, say: 'That uses the average unlevered beta (0.849). Relever it at the chain’s D/E of 1/3.' },
    ],
    solution: 'Unlever: 1.20 ÷ (1 + 0.75 × 0.5) = 0.873; 0.95 ÷ (1 + 0.75 × 0.2) = 0.826. Average 0.849. Relever: 0.849 × (1 + 0.75 × 1/3) = 1.062. CAPM: 4.2% + 1.062 × 5.5% = 10.04%.',
  },
  {
    id: 'f05-m3-4', lesson: 'cost-of-debt-and-equity', type: 'mc', kind: 'applied',
    prompt: 'Ana’s accountant suggests using the yield on a three-month government bill as the risk-free rate in Lantern’s CAPM, because it is “the safest rate there is”. Lantern’s projects last five to ten years, and Ana’s 5.5% market risk premium is measured over long-term government bonds. What is the best response?',
    options: [
      'Use the bill rate: the safest asset gives the most accurate CAPM',
      'Use a long-term government bond yield, matching the projects and the premium',
      'Average the bill rate and the bond yield, to balance the two horizons fairly',
      'Use Coastline’s 7.5% as the base rate instead, since that is what Lantern actually pays to borrow today',
    ],
    answer: 1,
    feedback: {
      0: 'The bill is safe over three months, not over a ten-year project, and the premium was measured over bonds: mixing the two bases misstates the cost of equity.',
      2: 'An average matches neither the premium’s base nor the projects’ horizon.',
      3: 'Coastline’s rate includes a premium for Lantern’s credit risk; the CAPM starts from a risk-free rate.',
    },
    solution: 'The risk-free rate should match the life of the cash flows and the rate over which the market risk premium was measured. For long-lived projects and a premium over long-term bonds, use a long-term government bond yield (Ana assumes 4.2%).',
  },
  {
    id: 'f05-m3-5', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'applied',
    prompt: 'Halford Utilities (fictional) trades at $60.00 and is expected to pay a dividend of $2.40 next year. An analyst’s CAPM estimate of its cost of equity is 9.0%. If the market price is consistent with that cost of equity and the dividend growth model, what constant growth rate of dividends are investors expecting? Give a percentage to one decimal place.',
    answer: 5.0, check: () => (0.09 - 2.4 / 60) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 4.0, say: 'That is the dividend yield, 2.40 ÷ 60. Growth is what the cost of equity requires beyond it: 9.0% − 4.0%.' },
      { value: 13.0, say: 'That adds the dividend yield to the cost of equity. Rearranged, g = r_E − D₁ ÷ P₀.' },
    ],
    solution: 'r_E = D₁ ÷ P₀ + g, so g = 9.0% − 2.40 ÷ 60.00 = 9.0% − 4.0% = 5.0%. If analysts forecast much less growth than 5%, the two methods disagree and one of the inputs deserves another look.',
  },
  {
    id: 'f05-m3-6', lesson: 'cost-of-debt-and-equity', type: 'fill', kind: 'conceptual',
    text: 'A bond that trades above its face value has a yield to maturity [[0]] its coupon rate. A firm’s cost of debt is measured by the [[1]], and its after-tax cost is that rate multiplied by [[2]]. To use a listed peer’s beta for a private firm, first [[3]] it with the peer’s own debt-to-equity ratio.',
    blanks: [
      { options: ['above', 'equal to', 'below'], answer: 2 },
      { options: ['coupon rate', 'yield to maturity', 'current yield'], answer: 1 },
      { options: ['(1 − T)', '(1 + T)', 'T'], answer: 0 },
      { options: ['relever', 'average', 'unlever'], answer: 2 },
    ],
    prompt: 'Complete the statements.',
    solution: 'Above face value, the yield is below the coupon. The cost of debt is the yield to maturity, and after tax r_D(1 − T). A peer’s beta is unlevered with its own D/E, then averaged and relevered at the private firm’s target.',
  },
  {
    id: 'f05-m3-7', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'numerical',
    prompt: 'Pentreath Rail (fictional) has 20 million shares at $30.00 (cost of equity 10.5%), 2 million preferred shares at $50.00 paying a fixed $3.25 a year, and debt with a market value of $300 million and a pre-tax cost of 5.6%. Tax is 25%. What is its WACC? Give a percentage to two decimal places.',
    answer: 8.21, check: () => CF.wacc({ E: 20 * 30, P: 2 * 50, D: 300, rE: 0.105, rP: 3.25 / 50, rD: 0.056, tax: 0.25 }).wacc * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 8.63, say: 'You left the tax off the debt: use 5.6% × 0.75 = 4.2%.' },
      { value: 8.05, say: 'You took tax off the preferred dividend too. Only interest is deductible.' },
    ],
    solution: 'E = $600m, P = $100m (cost 3.25 ÷ 50 = 6.5%), D = $300m; V = $1,000m. WACC = 0.60 × 10.5% + 0.10 × 6.5% + 0.30 × 5.6% × 0.75 = 6.30% + 0.65% + 1.26% = 8.21%.',
  },
  {
    id: 'f05-m3-8', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'applied',
    prompt: 'Linnet Foods (fictional), a frozen-food maker that keeps 20% debt (D/E 0.25) at a pre-tax cost of 6%, is considering an energy-drinks line. A listed energy-drinks maker has an equity beta of 1.60 at a D/E of 0.60. Tax is 25%, the risk-free rate 4.2% and the market risk premium 5.5%. What discount rate should Linnet use for the new line? Give a percentage to two decimal places.',
    answer: 10.03, check: () => { const b = CF.releverBeta(CF.unleverBeta(1.6, 0.6, 0.25), 0.25, 0.25); return CF.wacc({ E: 0.8, D: 0.2, rE: rf + b * mrp, rD: 0.06, tax: 0.25 }).wacc * 100; }, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: 11.3, say: 'That uses the peer’s beta as it stands. Unlever it (1.60 ÷ 1.45 = 1.103) and relever at Linnet’s D/E of 0.25.' },
      { value: 11.41, say: 'That is the cost of equity for the line. The project’s rate also weights in Linnet’s after-tax cost of debt.' },
    ],
    solution: 'Unlever: 1.60 ÷ (1 + 0.75 × 0.60) = 1.103. Relever at 0.25: 1.103 × 1.1875 = 1.310. Cost of equity 4.2% + 1.310 × 5.5% = 11.41%. Rate = 0.8 × 11.41% + 0.2 × 6% × 0.75 = 9.13% + 0.90% = 10.03%.',
  },
  {
    id: 'f05-m3-9', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'applied',
    prompt: 'Saltcote Marine’s WACC is 9%. Its leisure-cruise division proposes a boat costing $1,000,000 that would return $280,000 a year for five years (year-end, no salvage). Cruise operators’ pure-play rate is 13%. What is the boat’s NPV at the rate that matches its risk? Give whole dollars, with a minus sign if negative.',
    answer: -15175, check: () => npv(0.13, [-1e6, ...annuity(280000, 5)]), unit: '$', places: 0, tol: 5,
    wrong: [
      { value: 89102, say: 'That discounts at the firm’s 9% WACC. The boat’s risk is the cruise business’s: use 13%.' },
      { value: 400000, say: 'That ignores discounting (5 × 280,000 − 1,000,000).' },
    ],
    solution: 'At 13%: −1,000,000 + 280,000 × (1 − 1.13⁻⁵) ÷ 0.13 = −1,000,000 + 280,000 × 3.5172 = −$15,175. At the firm’s 9% it would look worth $89,102: the single rate would accept a project that does not earn what its risk requires.',
  },
  {
    id: 'f05-m3-10', lesson: 'weighted-average-cost-of-capital', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional firm will sell new shares to finance a factory, paying underwriting fees of 5% of the amount raised. How should the fees enter the factory’s appraisal?',
    options: [
      'Raise the WACC by 5 points for this project',
      'Ignore them: fees are a financing cost, and financing costs never enter a project’s cash flows or its discount rate',
      'Add them to the factory’s initial outlay, grossing up the amount raised by the weighted flotation rate',
      'Deduct 5% of the factory’s cash flow every year of its life',
    ],
    answer: 2,
    feedback: {
      0: 'The fee is paid once; adding 5 points to the rate charges it every year and badly overstates it.',
      1: 'Interest stays out because the WACC charges for it. Flotation fees are a one-off cash cost the rate doesn’t include, so they must go somewhere.',
      3: 'The fee is paid once, at the start, not as a share of every year’s cash flow.',
    },
    solution: 'Flotation costs are a one-off cash cost of raising this project’s money. Weight them by the target mix (f_A), gross up the amount needed by 1 − f_A, and add the difference to the initial outlay; leave the WACC unchanged.',
  },
  {
    id: 'f05-m3-11', lesson: 'weighted-average-cost-of-capital', type: 'formula', kind: 'applied',
    prompt: 'A firm’s target debt share D/V is in B1, its cost of equity in B2, its pre-tax cost of debt in B3 and its tax rate in B4. In B6, write a formula for the WACC using these four cells only.',
    sheet: { cells: { A1: 'Target debt share (D/V)', B1: TARGET_DV, A2: 'Cost of equity', B2: DERIVED.targetCostOfEquity, A3: 'Cost of debt, before tax', B3: DEBT.termLoan.rate, A4: 'Tax rate', B4: TAX, A6: 'WACC' },
      vary: { B1: [0.1, 0.35], B2: [0.1, 0.15], B3: [0.06, 0.09], B4: [0.21, 0.3] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 26, B: 12 }, formats: { B1: '0%', B2: '0.00%', B3: '0.00%', B4: '0%', B6: '0.00%' },
    answer: '=(1-B1)*B2+B1*B3*(1-B4)',
    alt: ['=B2*(1-B1)+B1*B3*(1-B4)', '=B1*B3*(1-B4)+(1-B1)*B2'],
    wrong: [
      { formula: '=(1-B1)*B2+B1*B3', say: 'The debt cost must be after tax: multiply B3 by (1−B4).' },
      { formula: '=B1*B2+(1-B1)*B3*(1-B4)', say: 'The weights are swapped: B1 is the debt share, so it weights the cost of debt; equity’s share is 1−B1.' },
      { formula: '=B2+B1*B3*(1-B4)', say: 'The cost of equity must be weighted by equity’s share, 1−B1, so the weights add to 1.' },
    ],
    solution: '<x>=(1-B1)*B2+B1*B3*(1-B4)</x>. With Lantern’s figures (20%, 12.75%, 7.5%, 25%) it gives 11.33%. With only a debt share given, equity’s share is 1 − D/V.',
  },
  {
    id: 'f05-m3-12', lesson: 'weighted-average-cost-of-capital', type: 'multi', kind: 'conceptual',
    prompt: 'Ana raises Lantern’s target debt share from 20% to 35%, with the same peers, Coastline still charging 7.5% and her 3% premium unchanged. In the lesson’s model, which of these happen? Select all that apply.',
    options: ['The relevered beta rises', 'The cost of equity rises', 'The WACC falls slightly', 'The average unlevered beta of the peers rises', 'The after-tax cost of debt rises'],
    answer: [0, 1, 2],
    feedback: {
      3: 'The unlevered beta measures the peers’ business risk; Lantern’s target doesn’t change it.',
      4: 'With Coastline’s rate fixed at 7.5% and tax at 25%, the after-tax cost stays at 5.625%. In practice lenders would charge more as debt grows.',
    },
    solution: `More debt raises the relevered beta (0.850 at the base, ${CF.releverBeta(DERIVED.betaU, 0.35 / 0.65, TAX).toFixed(3)} at 35%) and the cost of equity, but more of the firm is financed by cheaper, tax-deductible debt, so the WACC falls slightly, to about ${(CF.wacc({ E: 0.65, D: 0.35, rE: rf + CF.releverBeta(DERIVED.betaU, 0.35 / 0.65, TAX) * mrp + MARKET.smallFirm, rD: DEBT.termLoan.rate, tax: TAX }).wacc * 100).toFixed(2)}%. The peers’ unlevered beta and the after-tax cost of debt don’t change.`,
  },
];
