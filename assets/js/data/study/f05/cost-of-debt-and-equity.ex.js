// cost-of-debt-and-equity.ex.js — F05 · The cost of debt and equity: widgets, practice and the knowledge check.
// Answer keys live here. Lantern’s inputs come from case.js; yields, betas and CAPM from core/corpfin.js. Every other
// business named here is fictional (Brightcup Coffee and Harbour Street Foods are the case’s fictional listed peers;
// Ferncastle Utilities’ preferred share is F04’s).
import { MARKET, PEERS, DEBT, TARGET_DV, TAX } from './case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';

const { rf, mrp, smallFirm } = MARKET;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;   // epsilon: 5.625 shows as 5.63
const money = (v) => `$${v.toFixed(2)}`;
const bondPrice = (y, coupon, years, face = 100) => { let v = 0; for (let t = 1; t <= years; t++) v += face * coupon / (1 + y) ** t; return v + face / (1 + y) ** years; };
const peersU = PEERS.map((p) => CF.unleverBeta(p.beta, p.de, p.tax));

export const widgets = {
  'cdc-ytm': {
    type: 'formula',
    title: 'From a bond’s price to the cost of debt',
    intro: 'A bond with a $100 face value and annual coupons. The yield to maturity is the rate that makes its remaining payments worth today’s price; after tax it is what the issuer’s debt costs it. The starting values are Brightcup Coffee’s fictional bond.',
    inputs: [
      { id: 'price', label: 'Price per $100 of face value', min: 70, max: 130, step: 0.1, value: 96.2, fmt: 'money' },
      { id: 'coupon', label: 'Coupon rate (a year)', min: 0, max: 12, step: 0.25, value: 5, fmt: 'pct' },
      { id: 'years', label: 'Years to maturity', min: 1, max: 30, step: 1, value: 6, fmt: 'int', unit: 'years' },
      { id: 'tax', label: 'Issuer’s tax rate', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
    ],
    compute: (v) => {
      const c = v.coupon / 100, T = v.tax / 100;
      const y = CF.ytm({ price: v.price, face: 100, coupon: c, years: v.years });
      const cy = v.price > 0 ? c * 100 / v.price : 0;   // a fraction
      const ys = Array.from({ length: 16 }, (_, i) => i);
      let note;
      if (Math.abs(v.price - 100) < 0.05) note = 'At a price of $100 the yield equals the coupon: the bond pays exactly what the market requires.';
      else if (v.price < 100) note = `The bond trades below face value, so a buyer earns the coupon and a gain of ${money(100 - v.price)} at maturity: the yield (${pct(y)}) is above the ${pct(c)} coupon. New debt would cost this issuer about ${pct(y)}.`;
      else note = `The bond trades above face value, so a buyer loses ${money(v.price - 100)} by maturity: the yield (${pct(y)}) is below the ${pct(c)} coupon.`;
      note += ` After tax at ${pct(T, 0)}, the issuer’s cost of debt is ${pct(y * (1 - T))}.`;
      if (y < 0) note += ' A negative yield means the price is more than all the remaining payments added together.';
      return {
        headline: { label: 'Yield to maturity (cost of debt before tax)', value: pct(y) },
        rows: [
          ['Coupon paid each year', money(100 * c)],
          ['Current yield (coupon ÷ price)', pct(cy)],
          ['After-tax cost of debt', pct(y * (1 - T))],
          ['Price if the yield were 1 point higher', money(bondPrice(y + 0.01, c, v.years))],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Yield to maturity (%)', values: ys },
          series: [{ name: 'Price', values: ys.map((r) => Math.round(bondPrice(r / 100, c, v.years) * 100) / 100) }, { name: 'Today', values: ys.map(() => v.price) }],
          y: { label: 'Price per $100 ($)' } },
      };
    },
  },
  'cdc-peers': {
    type: 'capstructure',
    title: 'Lantern’s beta from its peers, and its cost of equity',
    peers: PEERS, rf, mrp, premium: smallFirm, tax: TAX, rD: DEBT.termLoan.rate, dv: TARGET_DV, dvMax: 0.6,
    note: 'All figures fictional: three listed peers, a 4.2% risk-free rate, a 5.5% market risk premium, Ana’s 3% extra premium and Coastline’s 7.5% for new debt, held at 7.5% for every debt share here. The relevered beta and the cost of equity rise with debt because shareholders bear more of the business’s risk.',
  },
};

export const guided = [
  {
    id: 'f05-cdc-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) has a bond with four years to maturity, a 6.5% coupon paid twice a year (two payments of $3.25 per $100) and a face value of $100. It trades at $101.50. Harbour Street pays tax at 25%.',
    solution: 'The price is above $100, so the yield is below the 6.5% coupon. With eight half-years, the half-year rate that makes $3.25 for eight periods plus $100 at the end worth $101.50 is 3.036%; doubled, the yield to maturity is 6.07% a year. After tax: 6.07% × 0.75 = 4.55%.',
    steps: [
      { id: 'f05-cdc-g1-s1', type: 'mc', prompt: 'Without calculating, is the yield to maturity above or below the 6.5% coupon?',
        options: ['Below 6.5%: a buyer pays $101.50 and gets only $100 back at maturity', 'Above 6.5%: the price is above face value, so investors require more', 'Exactly 6.5%: the coupon is what the bond pays', 'It cannot be told without the issuer’s credit rating'],
        answer: 0,
        hints: ['A buyer who pays more than $100 loses part of the price by maturity.'],
        feedback: { 1: 'A high price means a low yield: the buyer pays more for the same payments, so earns less on the money.', 2: 'The coupon is what the bond pays on its face value. A buyer pays $101.50, not $100, so earns less than 6.5%.', 3: 'The rating explains why the market requires what it does, but the price already reflects it: price above face value means yield below coupon.' } },
      { id: 'f05-cdc-g1-s2', type: 'num', prompt: 'What is the yield to maturity, as an annual rate (twice the half-year yield)? Give a percentage to two decimal places.',
        answer: 6.07, check: () => CF.ytm({ price: 101.5, face: 100, coupon: 0.065, years: 4, freq: 2 }) * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['There are 8 half-year periods, each paying $3.25, with $100 at the end. Find the half-year rate that makes them worth $101.50.', 'In a spreadsheet: =RATE(8,3.25,-101.5,100) gives the half-year rate, about 3.04%; double it.'],
        wrong: [{ value: 6.5, say: 'That is the coupon. The bond costs $101.50, so its yield is lower.' }, { value: 6.4, say: 'That is the current yield (6.50 ÷ 101.50). It ignores the $1.50 a buyer loses by maturity.' }, { value: 3.04, say: 'That is the half-year rate. Double it for the annual yield.' }] },
      { id: 'f05-cdc-g1-s3', type: 'num', prompt: 'What is Harbour Street’s after-tax cost of debt? Give a percentage to two decimal places.',
        answer: 4.55, check: () => CF.ytm({ price: 101.5, face: 100, coupon: 0.065, years: 4, freq: 2 }) * 0.75 * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['Multiply the yield by (1 − 0.25).'],
        wrong: [{ value: 4.88, say: 'That takes tax off the coupon. The cost of debt is the yield, not the coupon: 6.07% × 0.75.' }, { value: 1.52, say: 'That is the tax saving (6.07% × 0.25), not the cost after it.' }] },
    ],
  },
  {
    id: 'f05-cdc-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional roastery chain wants a beta and has one close listed peer: Morrow &amp; Pike Roasters, with an equity beta of 0.90 at a market D/E of 0.15. The chain plans to keep debt at half its equity (D/E 0.5). Tax is 25% for both; use a 4.2% risk-free rate and a 5.5% market risk premium.',
    solution: 'Unlever: 0.90 ÷ (1 + 0.75 × 0.15) = 0.90 ÷ 1.1125 = 0.809. Relever at D/E 0.5: 0.809 × (1 + 0.75 × 0.5) = 0.809 × 1.375 = 1.112. CAPM: 4.2% + 1.112 × 5.5% = 10.32%. The chain’s beta is higher than the peer’s because it carries more debt, not because its business is riskier.',
    steps: [
      { id: 'f05-cdc-g2-s1', type: 'num', prompt: 'Morrow &amp; Pike’s unlevered beta, to three decimal places.',
        answer: 0.809, check: () => CF.unleverBeta(0.9, 0.15, 0.25), unit: '', places: 3, tol: 0.002,
        hints: ['β_U = β_L ÷ (1 + (1 − T) × D/E).', '1 + 0.75 × 0.15 = 1.1125.'],
        wrong: [{ value: 0.783, say: 'You left out the tax: 0.90 ÷ 1.15. Hamada’s formula multiplies D/E by (1 − T).' }, { value: 1.001, say: 'That relevers the peer instead of unlevering it: divide, don’t multiply.' }] },
      { id: 'f05-cdc-g2-s2', type: 'num', prompt: 'The chain’s levered beta at its D/E of 0.5, to three decimal places.',
        answer: 1.112, check: () => CF.releverBeta(CF.unleverBeta(0.9, 0.15, 0.25), 0.5, 0.25), unit: '', places: 3, tol: 0.003,
        hints: ['β_L = β_U × (1 + (1 − T) × D/E), with the chain’s D/E.', '0.809 × 1.375.'],
        wrong: [{ value: 0.9, say: 'That is the peer’s beta as it stands, at its own D/E of 0.15. The chain has far more debt.' }, { value: 1.213, say: 'You left out the tax when relevering: use 1 + 0.75 × 0.5.' }] },
      { id: 'f05-cdc-g2-s3', type: 'num', prompt: 'The chain’s cost of equity from the CAPM. Give a percentage to two decimal places.',
        answer: 10.32, check: () => (rf + CF.releverBeta(CF.unleverBeta(0.9, 0.15, 0.25), 0.5, 0.25) * mrp) * 100, unit: '%', places: 2, tol: 0.03,
        hints: ['r_E = 4.2% + β × 5.5%.'],
        wrong: [{ value: 9.15, say: 'That uses the peer’s own beta (0.90). Use the chain’s relevered beta.' }, { value: 10.79, say: 'That multiplies the market’s whole return (4.2% + 5.5%) by beta. Beta scales only the premium: 4.2% + 1.112 × 5.5%.' }] },
    ],
  },
  {
    id: 'f05-cdc-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a bond’s price per $100, its annual coupon rate, its years to maturity and its face value. In B6, write a formula that returns its yield to maturity (coupons paid once a year).',
    sheet: { cells: { A1: 'Price', B1: 96.2, A2: 'Coupon rate', B2: 0.05, A3: 'Years to maturity', B3: 6, A4: 'Face value', B4: 100, A6: 'Yield to maturity' },
      vary: { B1: [92.5, 103], B2: [0.04, 0.065], B3: [5, 9] }, fixed: ['B4'] },
    cell: 'B6', view: 'A1:B6', widths: { A: 22, B: 12 }, formats: { B1: '$#,##0.00', B2: '0.0%', B4: '$#,##0.00', B6: '0.00%' },
    answer: '=RATE(B3,B2*B4,-B1,B4)',
    alt: ['=RATE(B3,B4*B2,-B1,B4)', '=RATE(B3,-B2*B4,B1,-B4)', '=RATE(B3,-B4*B2,B1,-B4)'],
    require: ['RATE'],
    wrong: [
      { formula: '=RATE(B3,B2*B4,B1,B4)', say: 'The price and the payments have the same sign, so there is no rate that balances them. The price is paid out: enter it as −B1.' },
      { formula: '=B2*B4/B1', say: 'That is the current yield (coupon ÷ price). It leaves out the gain or loss between the price and the $100 repaid at maturity.' },
      { formula: '=RATE(B3,B2,-B1,B4)', say: 'The payment is in dollars: the coupon rate times the face value, B2*B4, not the rate itself.' },
    ],
    hints: ['RATE(nper, pmt, pv, fv): the number of years, the coupon in dollars, the price, the face value.', 'Money paid and money received take opposite signs: the price is paid, so it is negative. =RATE(B3, B2*B4, −B1, B4).'],
    solution: '<x>=RATE(B3,B2*B4,-B1,B4)</x> returns 5.77% for Brightcup’s bond: six payments of $5 and $100 at the end, against a price of $96.20 paid today. The minus sign on the price tells RATE that it is paid out while the coupons and face value come in.',
  },
  {
    id: 'f05-cdc-g4', type: 'mc', kind: 'applied',
    prompt: 'In February 2028 Ana must choose the before-tax cost of debt for Lantern’s long-term projects. Which rate should she use?',
    options: ['7.5%, Coastline’s rate for a new five-year term loan', '6%, the rate on Lantern’s first Coastline note', '7.2%, Coastline’s quote for an equipment loan in March 2027', '9%, the rate on Lantern’s line of credit, its most expensive debt'],
    answer: 0,
    hints: ['The cost of capital is what new money costs today.', 'Which rate is a current price for long-term borrowing?'],
    feedback: {
      1: 'The 6% was agreed in 2026, and the note is repaid on 1 March 2028. It tells Ana nothing about what lenders require now.',
      2: 'That was the market’s price a year earlier. Rates have moved since: Coastline now asks 7.5%.',
      3: 'The line of credit is short-term money meant for seasonal working capital. Long-lived projects are financed at the long-term rate.',
    },
    solution: 'Use 7.5%: it is what a lender requires today for five-year money, which is what the cost of debt means. After tax it is 7.5% × 0.75 = 5.625%. The old note and the old quote are history; the line of credit is a different, short-term kind of borrowing.',
  },
];

export const independent = [
  {
    id: 'f05-cdc-i1', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) is listed and has an equity beta of 1.25. With a 4.2% risk-free rate and a 5.5% market risk premium, what is its own cost of equity from the CAPM? Give a percentage to two decimal places.',
    answer: 11.08, check: () => CF.capm({ rf, beta: 1.25, mrp }) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 6.88, say: 'That is 1.25 × 5.5%, the premium alone. Add the risk-free rate.' }, { value: 12.13, say: 'That multiplies the market’s whole return (4.2% + 5.5%) by beta. Beta scales only the premium: 4.2% + 1.25 × 5.5%.' }],
    solution: '4.2% + 1.25 × 5.5% = 4.2% + 6.875% = 11.075%, about 11.08%. Harbour Street’s own beta is the right one for its own shares, because it reflects its own debt; it is only for another firm that the beta must be unlevered and relevered.',
  },
  {
    id: 'f05-cdc-i2', type: 'num', kind: 'numerical',
    prompt: 'Corrick Water (fictional, listed) has just paid a dividend of $1.10 a share, expects dividends to grow at 3% a year indefinitely, and its shares trade at $25.00. What cost of equity does the dividend growth model give? Give a percentage to two decimal places.',
    answer: 7.53, check: () => CF.dividendGrowthCost({ d1: 1.1 * 1.03, p0: 25, g: 0.03 }) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 7.4, say: 'That uses the dividend just paid. The model needs next year’s: 1.10 × 1.03 = 1.133.' }, { value: 4.53, say: 'That is the dividend yield alone. Add the 3% growth.' }],
    solution: 'D₁ = 1.10 × 1.03 = $1.133. r_E = 1.133 ÷ 25.00 + 3% = 4.53% + 3% = 7.53%. A water utility with steady dividends is the kind of firm the model suits.',
  },
  {
    id: 'f05-cdc-i3', type: 'num', kind: 'numerical',
    prompt: 'Ferncastle Utilities’ fictional preferred share pays $5.50 a year for ever. If its price falls to $74.80, what is its cost? Give a percentage to two decimal places.',
    answer: 7.35, check: () => 5.5 / 74.8 * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 5.51, say: 'That takes tax off. Preferred dividends are not deductible, so there is no (1 − T).' }, { value: 5.5, say: 'That is the dividend rate on the $100 par value. At $74.80 investors earn more.' }],
    solution: 'r_P = D_P ÷ P_P = 5.50 ÷ 74.80 = 7.35%. A lower price means a higher required return; no tax adjustment, because the dividend comes out of after-tax profit.',
  },
  {
    id: 'f05-cdc-i4', type: 'formula', kind: 'applied',
    prompt: 'A fictional private bakery chain’s cost-of-equity inputs are in B1:B4: the risk-free rate, its relevered beta, the market risk premium and an extra premium its owners add for size. In B6, write the formula for its cost of equity, with the extra premium added to the CAPM.',
    sheet: { cells: { A1: 'Risk-free rate', B1: 0.042, A2: 'Relevered beta', B2: 1.08, A3: 'Market risk premium', B3: 0.055, A4: 'Extra premium for size', B4: 0.02, A6: 'Cost of equity' },
      vary: { B1: [0.035, 0.05], B2: [0.85, 1.3], B3: [0.045, 0.06], B4: [0, 0.03] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 24, B: 12 }, formats: { B1: '0.0%', B2: '0.00', B3: '0.0%', B4: '0.0%', B6: '0.00%' },
    answer: '=B1+B2*B3+B4',
    alt: ['=B1+B3*B2+B4', '=B4+B1+B2*B3', '=B1+B4+B2*B3'],
    wrong: [
      { formula: '=B1+B2*B3', say: 'That is the CAPM alone. The prompt asks for the cost with the owners’ extra premium added.' },
      { formula: '=(B1+B3)*B2+B4', say: 'Beta scales the market risk premium only, not the risk-free rate: B1 + B2*B3.' },
      { formula: '=B1+B2*(B3+B4)', say: 'The size premium is added once, outside the CAPM; it is not scaled by beta.' },
    ],
    solution: '<x>=B1+B2*B3+B4</x> gives 4.2% + 1.08 × 5.5% + 2% = 12.14%. Keeping the extra premium in its own cell lets a reader set it to zero and see the CAPM figure.',
  },
  {
    id: 'f05-cdc-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Ana re-estimates Lantern’s cost of equity with the peer method and the CAPM. What does each change do to the estimate, other things equal?',
    items: [
      'The long-term government bond yield rises from 4.2% to 4.6%.',
      'Ana raises Lantern’s target debt share from 20% to 30%.',
      'Harbour Street Foods is replaced by a peer with a lower unlevered beta.',
      'Ana drops the 3% size premium.',
      'Lantern’s first Coastline note, at 6%, is repaid.',
      'The corporate tax rate used to relever falls from 25% to 21%.',
    ],
    categories: ['Raises it', 'Lowers it', 'No effect'],
    answer: [0, 0, 1, 1, 2, 0],
    feedback: {
      0: 'The risk-free rate is the base of the CAPM: it adds directly.',
      1: 'More debt per dollar of equity raises the relevered beta, so shareholders require more.',
      2: 'A lower unlevered beta lowers the average business risk and so the relevered beta.',
      3: 'The premium is added on top of the CAPM; dropping it lowers the estimate by 3 points.',
      4: 'An old loan’s rate does not enter the cost of equity at all.',
      5: 'With a lower tax rate, (1 − T) × D/E is larger, so the relevered beta, and the cost of equity, rise slightly.',
    },
    solution: 'Raise: a higher risk-free rate, more target debt, a lower relevering tax rate. Lower: a peer with less business risk, dropping the size premium. No effect: repaying the old note.',
  },
  {
    id: 'f05-cdc-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Two listed bakeries (fictional) have the same business, but one has an equity beta of 0.95 and the other 1.40. What is the most likely explanation?',
    options: ['The second carries much more debt relative to its equity', 'The second is a riskier business with more volatile sales', 'One of the betas must be mismeasured, since the businesses are the same', 'The second pays a lower dividend, so its shares rise faster'],
    answer: 0,
    feedback: {
      1: 'The businesses are the same, so their business risk (unlevered beta) should be similar. The difference is in how they are financed.',
      2: 'Beta estimates are noisy, but a gap this size between identical businesses is what different leverage produces. Unlever both before deciding.',
      3: 'Dividend policy does not change systematic risk in this way; leverage does.',
    },
    solution: 'Debt has a fixed claim, so more of it makes shareholders’ returns swing more with the business: a higher equity (levered) beta for the same business beta. Unlevering both with their own D/E should bring them close together.',
  },
];

export const check = [
  {
    id: 'f05-cdc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is a firm’s cost of debt measured by the yield to maturity on its bonds rather than their coupon rate?',
    options: ['The yield reflects what lenders require today; the coupon was fixed when the bonds were issued', 'The coupon is paid before tax, while the yield to maturity is already measured after the interest deduction', 'The yield includes the bond’s default risk, which the coupon never does', 'The coupon applies only to bonds held to maturity'],
    answer: 0,
    feedback: {
      1: 'Both are before-tax rates. The tax adjustment is a separate step: r_D(1 − T).',
      2: 'The coupon also reflected default risk, as judged on the day of issue. What has changed is the market’s requirement since then.',
      3: 'The yield to maturity is the measure that assumes the bond is held to maturity.',
    },
    solution: 'The cost of capital is forward-looking: the return investors require now. A bond’s price adjusts so that a buyer today earns the current required return, which is its yield; the coupon is history.',
  },
  {
    id: 'f05-cdc-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm’s bonds yield 8.0% and it pays tax at 21%. What is its after-tax cost of debt? Give a percentage to two decimal places.',
    answer: 6.32, check: () => 8 * (1 - 0.21), unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 1.68, say: 'That is the tax saving, 8% × 0.21. The cost after tax is 8% × 0.79.' }, { value: 6, say: 'That uses a 25% tax rate. This firm pays 21%.' }],
    solution: '8.0% × (1 − 0.21) = 6.32%.',
  },
  {
    id: 'f05-cdc-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional private firm’s peers have an average unlevered beta of 0.85. It targets a debt-to-equity ratio of 0.40 and pays tax at 25%. With a 4.2% risk-free rate and a 5.5% market risk premium, what is its cost of equity from the CAPM (no extra premium)? Give a percentage to two decimal places.',
    answer: 10.28, check: () => CF.capm({ rf, beta: CF.releverBeta(0.85, 0.4, 0.25), mrp }) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 8.88, say: 'That uses the unlevered beta. Relever it at the firm’s D/E: 0.85 × (1 + 0.75 × 0.40) = 1.105.' }, { value: 10.75, say: 'You relevered without the tax: 0.85 × 1.40. Use 1 + (1 − 0.25) × 0.40.' }],
    solution: 'β_L = 0.85 × (1 + 0.75 × 0.40) = 0.85 × 1.30 = 1.105. r_E = 4.2% + 1.105 × 5.5% = 10.28%.',
  },
  {
    id: 'f05-cdc-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s accountant objects to the 3% premium she adds to Lantern’s CAPM cost of equity. Which reply is most accurate?',
    options: [
      'It is a judgement outside the CAPM: some add it for size and illiquidity, others find the evidence weak',
      'It is required by the CAPM for any firm whose shares are not listed',
      'Some analysts add it, but only to correct for Lantern’s debt, which they say the relevered beta leaves out',
      'Historical data show small firms have earned at least 3% a year more than large ones in every decade since the 1920s',
    ],
    answer: 0,
    feedback: {
      1: 'The CAPM has no such term; the premium is added outside the model.',
      2: 'The relevered beta already includes Lantern’s target debt. Adding a premium for leverage would count it twice.',
      3: 'The evidence reviewed in the lesson says the opposite: the small-firm premium seemed to fade after about 1980 and was concentrated in the smallest firms.',
    },
    solution: 'The premium is Ana’s judgement. Arguments for: Lantern is small and its shares can’t be sold easily. Arguments against: the evidence for a size premium is weak since about 1980, and the CAPM rewards only systematic risk. Showing the estimate with and without it (12.75% and 9.75%) lets the reader decide.',
  },
  {
    id: 'f05-cdc-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Why can’t Ana use the dividend growth model for Lantern’s cost of equity? Select all that apply.',
    options: ['Lantern’s shares have no market price', 'Lantern’s dividends ($300 and $4,700 in 2026, $2,000 in 2027) follow no steady growth path', 'The model gives the cost of debt, not of equity', 'Lantern’s dividends cannot be expected to grow at a constant rate below the cost of equity for ever', 'The model works only for firms with no debt'],
    answer: [0, 1, 3],
    feedback: { 2: 'The model gives the return implied by a share’s price and dividends: a cost of equity.', 4: 'Debt doesn’t stop the model working; the price and dividends already reflect it.' },
    solution: 'The model needs a market price P₀ and dividends growing steadily for ever at g below r_E. Lantern has neither a price nor a steady dividend. Debt is no obstacle.',
  },
  {
    id: 'f05-cdc-k6', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern expected to make losses for several years, so that it could not use any interest deduction. What would its effective cost of new debt from Coastline be? Give a percentage to one decimal place.',
    answer: 7.5, check: () => DEBT.termLoan.rate * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 5.6, say: 'That assumes the 25% deduction is used. With no taxable profit, the deduction saves nothing.' }],
    solution: 'The after-tax cost r_D(1 − T) assumes the interest is deducted from taxable profit. With no profit to deduct it from, the saving is zero (or deferred), so the cost is the full 7.5%.',
  },
];
