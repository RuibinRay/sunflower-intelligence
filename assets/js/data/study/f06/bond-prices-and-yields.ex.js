// bond-prices-and-yields.ex.js — F06 · Bond prices and yields: widgets, practice and the knowledge check (answer keys
// live here). The four bonds come from case.js BONDS (fictional); prices, durations and convexity from
// core/investments.js. The bond fund's yearly returns are SIMULATED (data.js). Every other bond and business is fictional.
import { BONDS, SERIES, MONTHS } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const [G5, G20, HB, MB] = BONDS;
const at = (b, y) => IV.bondAtYield({ face: 100, ...b }, y);
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;
const money = (v) => `$${v.toFixed(2)}`;
const YB = IV.yearly(MONTHS, SERIES.bonds), YBILL = IV.yearly(MONTHS, SERIES.bills);
const r2 = (v) => Math.round(v * 10000) / 100;

export const widgets = {
  'bond-price': {
    type: 'formula',
    title: 'A bond’s price, yields and duration',
    intro: 'Coupons paid twice a year on $100 of face value. The starting values are the five-year government note (fictional): a 4% coupon, five years left, a 4.20% yield.',
    inputs: [
      { id: 'coupon', label: 'Coupon rate (a year)', min: 0, max: 10, step: 0.25, value: 4, fmt: 'pct' },
      { id: 'years', label: 'Years to maturity', min: 0.5, max: 30, step: 0.5, value: 5, fmt: 'num', unit: 'years' },
      { id: 'ytm', label: 'Yield to maturity (a year)', min: 0.5, max: 12, step: 0.05, value: 4.2, fmt: 'pct' },
    ],
    compute: (v) => {
      const spec = { couponRate: v.coupon / 100, years: v.years, freq: 2 };
      const a = at(spec, v.ytm / 100);
      const cy = v.coupon > 0 ? v.coupon / a.price : 0;
      const ys = Array.from({ length: 25 }, (_, i) => i * 0.5);
      let note;
      if (Math.abs(a.price - 100) < 0.005) note = 'The coupon equals the yield, so the bond trades at its face value: coupon rate, current yield and yield to maturity are all the same.';
      else if (a.price < 100) note = `The coupon is below the yield, so the bond trades at a discount: coupon ${pct(v.coupon / 100)} < current yield ${pct(cy / 100)} < yield to maturity ${pct(v.ytm / 100)}. Its price will be pulled up to $100 by maturity if the yield stays put.`;
      else note = `The coupon is above the yield, so the bond trades at a premium, and the order of the yields reverses: coupon ${pct(v.coupon / 100)} > current yield ${pct(cy / 100)} > yield to maturity ${pct(v.ytm / 100)}.`;
      if (v.coupon === 0) note = `A zero-coupon bond: no coupons, so its Macaulay duration equals its maturity, ${v.years} years. ` + note.replace(/: coupon .*$/, '.');
      note += ` A one-point rise in the yield would lower the price by about ${a.modified.toFixed(2)}% (modified duration).`;
      return {
        headline: { label: 'Price per $100 of face value', value: money(a.price) },
        rows: [
          ['Current yield (annual coupon ÷ price)', v.coupon > 0 ? pct(cy / 100) : 'none (no coupons)'],
          ['Macaulay duration', `${a.macaulay.toFixed(2)} years`],
          ['Modified duration', a.modified.toFixed(2)],
          ['Convexity', a.convexity.toFixed(1)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Yield to maturity (%)', values: ys },
          series: [{ name: 'Price', values: ys.map((y) => Math.round(at(spec, y / 100).price * 100) / 100) }, { name: 'Face value', values: ys.map(() => 100) }],
          y: { label: 'Price per $100 ($)' } },
      };
    },
  },
  'bond-shock': {
    type: 'formula',
    title: 'Duration, convexity and the exact price change',
    intro: 'Move every yield by the same amount. The starting values are the 20-year government bond (fictional): 4.5% coupon, 20 years, 4.65% yield, and a rise of 100 basis points.',
    inputs: [
      { id: 'coupon', label: 'Coupon rate (a year)', min: 0, max: 10, step: 0.25, value: 4.5, fmt: 'pct' },
      { id: 'years', label: 'Years to maturity', min: 1, max: 30, step: 0.5, value: 20, fmt: 'num', unit: 'years' },
      { id: 'ytm', label: 'Yield to maturity today', min: 1, max: 10, step: 0.05, value: 4.65, fmt: 'pct' },
      { id: 'dy', label: 'Change in yield', min: -300, max: 300, step: 25, value: 100, fmt: 'int', unit: 'basis points' },
    ],
    compute: (v) => {
      const spec = { couponRate: v.coupon / 100, years: v.years, freq: 2 }, y0 = v.ytm / 100;
      const a = at(spec, y0);
      const exactAt = (dy) => (at(spec, y0 + dy).price / a.price - 1) * 100;
      const dy = v.dy / 10000;
      const exact = exactAt(dy), dur = -a.modified * dy * 100, cvx = IV.priceChangeApprox(a, dy) * 100;
      const xs = Array.from({ length: 13 }, (_, i) => -3 + i * 0.5);
      const okRange = y0 + dy > 0;
      if (!okRange) return { error: 'The new yield would be zero or below; choose a smaller fall in yield.' };
      return {
        headline: { label: 'Exact price change', value: `${exact < 0 ? '−' : '+'}${Math.abs(exact).toFixed(2)}%` },
        rows: [
          ['Price today → after', `${money(a.price)} → ${money(at(spec, y0 + dy).price)}`],
          ['Estimate with modified duration alone', `${dur < 0 ? '−' : '+'}${Math.abs(dur).toFixed(2)}%`],
          ['Estimate with duration and convexity', `${cvx < 0 ? '−' : '+'}${Math.abs(cvx).toFixed(2)}%`],
          ['Modified duration; convexity', `${a.modified.toFixed(2)}; ${a.convexity.toFixed(1)}`],
        ],
        note: v.dy === 0 ? 'No change in yield, no change in price.'
          : `Duration alone is off by ${Math.abs(exact - dur).toFixed(2)} points; adding convexity cuts the error to ${Math.abs(exact - cvx).toFixed(2)}. Duration ${v.dy > 0 ? 'overstates the fall' : 'understates the rise'}, because the price–yield curve bends away from its tangent.`,
        chart: { kind: 'line', x: { label: 'Change in yield (percentage points)', values: xs },
          series: [
            { name: 'Exact', values: xs.map((x) => (y0 + x / 100 > 0 ? Math.round(exactAt(x / 100) * 100) / 100 : null)) },
            { name: 'Duration', values: xs.map((x) => Math.round(-a.modified * x * 100) / 100) },
            { name: 'With convexity', values: xs.map((x) => Math.round(IV.priceChangeApprox(a, x / 100) * 10000) / 100) },
          ],
          y: { label: 'Price change (%)' } },
      };
    },
  },
  'bond-years': {
    type: 'chart', kind: 'bar',
    title: 'The bond fund’s calendar-year returns, 2013–2027 (simulated)',
    x: { label: 'Year', values: YB.map((y) => y.year) },
    series: [{ name: 'Bond fund', values: YB.map((y) => r2(y.ret)) }, { name: 'Bills', values: YBILL.map((y) => r2(y.ret)) }],
    y: { label: 'Return (%)' },
    note: `Simulated for teaching (tools/study/f06-data.py), not real history: the Harbourline Aggregate Bond Index Fund and one-month bills. The fund lost ${pct(-YB.find((y) => y.year === '2022').ret, 2)} in 2022, its only losing year, and gained ${pct(YB.find((y) => y.year === '2023').ret, 2)} in 2023, when bills returned ${pct(YBILL.find((y) => y.year === '2023').ret, 2)}.`,
  },
};

export const guided = [
  {
    id: 'f06-bond-g1', type: 'steps', kind: 'numerical',
    prompt: 'The Harbour Street Foods 2035 bond (fictional) has seven years left, a 5.5% coupon paid twice a year and a yield to maturity of 6.10%.',
    solution: 'Fourteen half-years, a coupon of $2.75 and a yield of 3.05% a half-year: price = 2.75 × (1 − 1.0305^−14) ÷ 0.0305 + 100 ÷ 1.0305^14 = $96.62. Current yield = 5.50 ÷ 96.62 = 5.69%. As for any discount bond, coupon (5.50%) < current yield (5.69%) < yield to maturity (6.10%).',
    steps: [
      { id: 'f06-bond-g1-s1', type: 'num', prompt: 'What is its price per $100 of face value?',
        answer: 96.62, check: () => at(HB, HB.ytm).price, unit: '$', places: 2, tol: 0.02,
        hints: ['Per half-year: coupon 5.5 ÷ 2 = $2.75, yield 6.10% ÷ 2 = 3.05%, and 7 × 2 = 14 payments.', 'Price = 2.75 × (1 − 1.0305^−14) ÷ 0.0305 + 100 ÷ 1.0305^14.'],
        wrong: [{ value: 96.66, say: 'Close, but that treats the bond as paying $5.50 once a year at 6.10%. With semi-annual coupons, use $2.75, 3.05% and 14 periods.' }, { value: 100, say: 'A bond trades at $100 only when its coupon equals its yield. Here the coupon is below the yield.' }] },
      { id: 'f06-bond-g1-s2', type: 'num', prompt: 'What is its current yield? Give a percentage to two decimal places.',
        answer: 5.69, check: () => 5.5 / at(HB, HB.ytm).price * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Current yield = annual coupon ÷ price.'],
        wrong: [{ value: 5.5, say: 'That is the coupon rate (coupon ÷ face value). Divide by the price instead.' }, { value: 2.85, say: 'That uses the half-year coupon. Current yield uses the annual coupon, $5.50.' }] },
      { id: 'f06-bond-g1-s3', type: 'mc', prompt: 'Which ordering of its three rates is correct?',
        options: ['Coupon rate < current yield < yield to maturity', 'Yield to maturity < current yield < coupon rate', 'Current yield < coupon rate < yield to maturity', 'All three are equal, because the bond is held to maturity'],
        answer: 0,
        hints: ['The bond trades below $100. Which rates divide by that lower price, and which also count the gain to $100?'],
        feedback: { 1: 'That is the order for a premium bond, priced above $100.', 2: 'The current yield divides the same coupon by a price below $100, so it is above the coupon rate.', 3: 'They are equal only when the bond trades at exactly $100.' } },
    ],
  },
  {
    id: 'f06-bond-g2', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a bond’s annual coupon rate, years to maturity, yield to maturity and face value. Coupons are paid twice a year. In B6, write a formula for its price that comes out positive.',
    sheet: { cells: { A1: 'Coupon rate', B1: 0.055, A2: 'Years to maturity', B2: 7, A3: 'Yield to maturity', B3: 0.061, A4: 'Face value', B4: 100, A6: 'Price' },
      vary: { B1: [0.04, 0.065], B2: [5, 12], B3: [0.045, 0.07] }, fixed: ['B4'] },
    cell: 'B6', view: 'A1:B6', widths: { A: 20, B: 12 }, formats: { B1: '0.00%', B3: '0.00%', B4: '$#,##0.00', B6: '$#,##0.00' },
    answer: '=PV(B3/2,B2*2,-B1*B4/2,-B4)',
    alt: ['=-PV(B3/2,B2*2,B1*B4/2,B4)', '=PV(B3/2,2*B2,-B1*B4/2,-B4)', '=PV(B3/2,B2*2,-B4*B1/2,-B4)', '=-PV(B3/2,2*B2,B1*B4/2,B4)', '=PV(B3/2,B2*2,-(B1*B4/2),-B4)'],
    require: ['PV'],
    wrong: [
      { formula: '=PV(B3,B2,-B1*B4,-B4)', say: 'That prices a bond with annual coupons. With two coupons a year, use the half-year yield (B3/2), twice the periods (B2*2) and half the coupon.' },
      { formula: '=PV(B3/2,B2*2,B1*B4/2,B4)', say: 'PV returns a negative number when the payments are entered as positive (the sign convention: money received against money paid). Make the payments negative, or put a minus in front of PV.' },
      { formula: '=PV(B3/2,B2*2,-B1/2,-B4)', say: 'The payment is in dollars: the coupon rate times the face value, halved (B1*B4/2).' },
    ],
    hints: ['PV(rate, nper, pmt, fv): the half-year yield, the number of half-years, the half-year coupon in dollars, the face value.', 'Enter the payment and face value as negative so the price comes out positive: =PV(B3/2, B2*2, −B1*B4/2, −B4).'],
    solution: '<x>=PV(B3/2,B2*2,-B1*B4/2,-B4)</x> gives $96.62 for the Harbour Street bond: 14 coupons of $2.75 and $100 at the end, discounted at 3.05% a half-year. Excel’s PRICE function would need settlement and maturity dates; PV prices a bond on a coupon date directly.',
  },
  {
    id: 'f06-bond-g3', type: 'steps', kind: 'numerical',
    prompt: 'The Morrow & Pike 2031 bond (fictional) has three and a half years left, a 4.75% coupon paid twice a year, a yield of 5.45% and a price of $97.80. Its Macaulay duration is 3.26 years.',
    solution: 'Modified duration = 3.26 ÷ (1 + 0.0545 ÷ 2) = 3.26 ÷ 1.02725 = 3.18. A rise of 0.5 points in its yield (say, from a wider credit spread) changes the price by about −3.18 × 0.005 = −1.59%, to 97.80 × (1 − 0.0159) = $96.25. The exact price at 5.95% is $96.26: for a small move, duration alone is accurate.',
    steps: [
      { id: 'f06-bond-g3-s1', type: 'num', prompt: 'What is its modified duration? Give two decimal places.',
        answer: 3.18, check: () => at(MB, MB.ytm).modified, unit: '', places: 2, tol: 0.01,
        hints: ['Modified duration = Macaulay duration ÷ (1 + yield per period).', 'The yield per half-year is 5.45% ÷ 2 = 2.725%.'],
        wrong: [{ value: 3.09, say: 'That divides by 1.0545, the annual yield. With semi-annual coupons, divide by 1 + 0.0545 ÷ 2.' }, { value: 3.26, say: 'That is the Macaulay duration. Divide it by 1.02725.' }] },
      { id: 'f06-bond-g3-s2', type: 'num', prompt: 'Using modified duration, by what percentage would its price change if its yield rose by 0.5 percentage points? Give a signed percentage to two decimal places.',
        answer: -1.59, check: () => -at(MB, MB.ytm).modified * 0.005 * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['ΔP/P ≈ −D_mod × Δy, with Δy = 0.005.'],
        wrong: [{ value: 1.59, say: 'The sign matters: a rise in yield lowers the price.' }, { value: -15.9, say: 'Half a point is 0.005, not 0.05.' }] },
      { id: 'f06-bond-g3-s3', type: 'num', prompt: 'What is the estimated new price, in dollars?',
        answer: 96.25, check: () => 97.8 * (1 - at(MB, MB.ytm).modified * 0.005), unit: '$', places: 2, tol: 0.03,
        hints: ['New price ≈ 97.80 × (1 − 0.0159).'],
        wrong: [{ value: 96.21, say: 'That subtracts 1.59 dollars; the change is 1.59% of $97.80, about $1.55.' }] },
    ],
  },
  {
    id: 'f06-bond-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Every yield rises by one percentage point. Which of these fictional bonds, each yielding about 4.5% before the rise, falls most in price?',
    options: ['A 20-year zero-coupon government bond', 'A 20-year government bond paying a 4.5% coupon', 'A 7-year BBB-rated corporate bond paying 5.5%', 'A 5-year government note paying 4%'],
    answer: 0,
    hints: ['The fall is roughly modified duration × 1%. Which bond makes its holder wait longest, on average, for her money?', 'A zero-coupon bond’s Macaulay duration equals its maturity.'],
    feedback: {
      1: 'Its coupons arrive throughout the 20 years, so its duration (about 13 years) is well below the zero’s 20 years.',
      2: 'Credit risk does not make a bond more sensitive to a general rise in yields; its seven-year maturity gives it a duration of only about 6 years.',
      3: 'With five years to maturity its duration is about 4.6 years, the shortest here.',
    },
    solution: 'The zero-coupon bond pays everything in 20 years, so its duration is 20 years (modified about 19.6) and it falls about 18% for a one-point rise. The 20-year coupon bond falls about 12%, the seven-year corporate about 5.6% and the five-year note about 4.4%.',
  },
];

export const independent = [
  {
    id: 'f06-bond-i1', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a bond’s annual coupon rate, years to maturity, price and face value; coupons are paid twice a year. In B6, write a formula for its yield to maturity as an annual rate (compounded twice a year).',
    sheet: { cells: { A1: 'Coupon rate', B1: 0.0475, A2: 'Years to maturity', B2: 3.5, A3: 'Price', B3: 97.8, A4: 'Face value', B4: 100, A6: 'Yield to maturity' },
      vary: { B1: [0.04, 0.06], B2: [4, 6.5], B3: [95.5, 101.2] }, fixed: ['B4'] },
    cell: 'B6', view: 'A1:B6', widths: { A: 20, B: 12 }, formats: { B1: '0.00%', B3: '$#,##0.00', B4: '$#,##0.00', B6: '0.00%' },
    answer: '=RATE(B2*2,B1*B4/2,-B3,B4)*2',
    alt: ['=2*RATE(B2*2,B1*B4/2,-B3,B4)', '=RATE(2*B2,B1*B4/2,-B3,B4)*2', '=RATE(B2*2,-B1*B4/2,B3,-B4)*2', '=2*RATE(2*B2,B1*B4/2,-B3,B4)'],
    require: ['RATE'],
    wrong: [
      { formula: '=RATE(B2*2,B1*B4/2,-B3,B4)', say: 'That is the yield per half-year. Multiply by 2 for the annual rate as bond yields are quoted.' },
      { formula: '=RATE(B2,B1*B4,-B3,B4)', say: 'That treats the coupons as annual. Use half-years: B2*2 periods and a coupon of B1*B4/2.' },
      { formula: '=B1*B4/B3', say: 'That is the current yield. It leaves out the gain or loss between the price and face value.' },
    ],
    solution: '<x>=RATE(B2*2,B1*B4/2,-B3,B4)*2</x> returns 5.45% for the Morrow & Pike bond: seven half-yearly coupons of $2.375 and $100 at the end against a price of $97.80. RATE finds the half-year yield; doubling it gives the annual yield compounded twice a year.',
  },
  {
    id: 'f06-bond-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional retailer’s 10-year bond yields 6.35%. Government bonds yield 4.20% at five years and 4.65% at 20 years. Interpolating a 10-year government yield on a straight line between them, what is the retailer’s credit spread in basis points?',
    answer: 200, check: () => (0.0635 - (0.042 + (10 - 5) / (20 - 5) * (0.0465 - 0.042))) * 10000, unit: 'basis points', places: 0, tol: 1,
    wrong: [{ value: 215, say: 'That uses the five-year yield as the benchmark. Interpolate to 10 years first: 4.20% + (5 ÷ 15) × 0.45% = 4.35%.' }, { value: 2, say: 'That is the spread in percentage points. One percentage point is 100 basis points.' }],
    solution: 'The 10-year government yield ≈ 4.20% + (10 − 5) ÷ (20 − 5) × (4.65% − 4.20%) = 4.20% + 0.15% = 4.35%. Spread = 6.35% − 4.35% = 2.00 percentage points = 200 basis points.',
  },
  {
    id: 'f06-bond-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional 10-year zero-coupon government bond pays $100 at maturity and yields 4.40% a year, compounded twice a year. What is its price?',
    answer: 64.71, check: () => at({ couponRate: 0, years: 10, freq: 2 }, 0.044).price, unit: '$', places: 2, tol: 0.02,
    wrong: [{ value: 65.01, say: 'That discounts once a year at 4.40%. With the yield compounded twice a year, discount 20 half-years at 2.20%.' }],
    solution: 'Price = 100 ÷ 1.022^20 = $64.71. With no coupons, its Macaulay duration is exactly 10 years.',
  },
  {
    id: 'f06-bond-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Does each bond trade at a premium, at par, or at a discount?',
    items: [
      'A 5% coupon, with a yield to maturity of 4.2%',
      'A 3% coupon, with a yield to maturity of 4%',
      'A 4.65% coupon, with a yield to maturity of 4.65%',
      'A zero-coupon bond with two years left and a positive yield',
      'A bond whose current yield is below its coupon rate',
    ],
    categories: ['Premium', 'Par', 'Discount'],
    answer: [0, 2, 1, 2, 0],
    feedback: {
      0: 'The coupon is above what the market requires, so buyers pay more than $100 for it.',
      1: 'The coupon is below the market’s yield, so the price falls below $100 to make up the difference.',
      2: 'When the coupon equals the yield, the bond is worth exactly its face value.',
      3: 'A zero-coupon bond’s whole return comes from the rise to face value, so it always sells below $100 when yields are positive.',
      4: 'Current yield = coupon ÷ price is below coupon ÷ face value only if the price is above face value.',
    },
    solution: 'Coupon above yield: premium. Coupon equal to yield: par. Coupon below yield (including a zero coupon): discount. A current yield below the coupon rate means the price is above $100, a premium.',
  },
  {
    id: 'f06-bond-i5', type: 'num', kind: 'numerical',
    prompt: 'The 20-year government bond (fictional) has a modified duration of 13.02 and a convexity of 223.1. Estimate, with both terms, the percentage change in its price if every yield falls by one percentage point. Give a percentage to two decimal places.',
    answer: 14.13, check: () => IV.priceChangeApprox(at(G20, G20.ytm), -0.01) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 13.02, say: 'That is the duration term alone. Add ½ × 223.1 × 0.01² = 1.12 points.' }, { value: 11.9, say: 'The convexity term is always added: for a fall in yield both terms are positive.' }],
    solution: 'ΔP/P ≈ −13.02 × (−0.01) + ½ × 223.1 × (−0.01)² = 13.02% + 1.12% = 14.13%. The exact rise is 14.21%: convexity makes gains larger than duration alone predicts.',
  },
  {
    id: 'f06-bond-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional government bond with a 5.25% coupon and five years left trades at $104.69, a yield of 4.20%. If its yield is still 4.20% a year from now, what will its price be?',
    options: ['Lower, about $103.83, as it is pulled towards $100', 'Still $104.69, because the yield has not changed', 'Higher, because a year’s interest has built up in the price', 'Exactly $100, because premium bonds are repaid at par each year'],
    answer: 0,
    feedback: {
      1: 'An unchanged yield does not mean an unchanged price. With one year fewer of above-market coupons left, the bond is worth less.',
      2: 'The coupons are paid out in cash, not added to the price. Between coupon dates the buyer pays accrued interest, but that is not part of the quoted price.',
      3: 'The face value is repaid only at maturity, in four more years. Until then the price moves gradually towards $100.',
    },
    solution: 'Priced with four years left at 4.20% the bond is worth $103.83: the premium shrinks as fewer above-market coupons remain. The holder still earns about 4.2% for the year: $5.25 of coupons minus the $0.86 price fall, on $104.69.',
  },
];

export const check = [
  {
    id: 'f06-bond-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Market interest rates rise. Why does the price of an existing fixed-coupon bond fall?',
    options: ['Its fixed payments are now discounted at a higher required return', 'Its issuer must raise its coupons, which takes cash from the business', 'Its face value is cut to keep the coupon rate in line with the market', 'Its holders are more likely to sell, and the selling itself pushes the price down'],
    answer: 0,
    feedback: {
      1: 'An existing bond’s coupons are fixed in its terms; only new bonds pay the new rates.',
      2: 'The face value never changes. The price adjusts instead.',
      3: 'Selling pressure is how the adjustment happens, not why: the price falls to the level at which a buyer earns the new, higher yield.',
    },
    solution: 'A bond’s price is the present value of payments fixed in its terms. When investors require a higher return, the same payments are worth less today, so the price falls until a buyer earns the market’s yield.',
  },
  {
    id: 'f06-bond-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional bond with a 6% coupon trades at $108.00 per $100 of face value. What is its current yield? Give a percentage to two decimal places.',
    answer: 5.56, check: () => 6 / 108 * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 6, say: 'That is the coupon rate. Current yield divides the coupon by the price, $108.00.' }, { value: 6.48, say: 'That multiplies by the price ratio instead of dividing: 6 ÷ 1.08 = 5.56%.' }],
    solution: 'Current yield = 6.00 ÷ 108.00 = 5.56%. The bond is at a premium, so its yield to maturity is lower still.',
  },
  {
    id: 'f06-bond-k3', type: 'num', kind: 'applied',
    prompt: 'A bond fund has an average modified duration of 6 years. If yields on its bonds rise by 1.5 percentage points, by roughly what percentage does its price fall (ignoring income and convexity)?',
    answer: 9, check: () => 6 * 1.5, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 6, say: 'That is the fall for a one-point rise. Multiply the duration by the 1.5-point rise.' }, { value: 4, say: 'Duration multiplies the change in yield: 6 × 1.5 = 9, not 6 ÷ 1.5.' }],
    solution: 'ΔP/P ≈ −D_mod × Δy = −6 × 0.015 = −9%. For a move this size convexity would make the true fall slightly smaller, and the fund’s income would offset a little more over a year.',
  },
  {
    id: 'f06-bond-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Other things equal, which of these give a fixed-coupon bond a longer duration? Select all that apply.',
    options: ['A longer time to maturity', 'A lower coupon rate', 'A higher yield to maturity', 'A lower yield to maturity', 'A better credit rating'],
    answer: [0, 1, 3],
    feedback: { 2: 'A higher yield shrinks the present value of the distant payments most, which shortens the duration.', 4: 'A rating changes the yield, not directly the timing of the payments. Duration depends on maturity, coupon and yield.' },
    solution: 'Duration is the present-value-weighted average time of the payments. It lengthens with maturity, with a lower coupon (more of the value in the final payment) and with a lower yield (distant payments discounted less).',
  },
  {
    id: 'f06-bond-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana sees that the simulated bond fund, holding only investment-grade bonds, fell 13% in 2022. Which explanation fits a fund with an average duration of about six years?',
    options: ['Yields rose about two points or more, and its fixed payments were repriced lower', 'Several of its issuers defaulted, which a duration of six years cannot prevent', 'Its fees rose sharply, which bond funds do when interest rates rise', 'Investors sold the fund’s units, and selling forces the fund’s price below its bonds’ value'],
    answer: 0,
    feedback: {
      1: 'Investment-grade issuers rarely default, and no defaults are needed: a 13% fall is what about a 2-point rise in yields does to a 6-year duration.',
      2: 'The fund’s fee is 0.05% a year; fees cannot explain a 13% fall.',
      3: 'An index fund’s price is the value of its bonds; selling by other investors does not push it below that.',
    },
    solution: 'With duration about 6, each one-point rise in yields costs about 6%; 13% ÷ 6 ≈ 2.2 points, a little more once the year’s income is counted. Interest-rate risk alone explains the loss. The data were built to show this.',
  },
  {
    id: 'f06-bond-k6', type: 'num', kind: 'numerical',
    prompt: 'The five-year government note (fictional) pays a 4% coupon twice a year. What is its price per $100 if its yield to maturity is 5.20%?',
    answer: 94.78, check: () => at(G5, 0.052).price, unit: '$', places: 2, tol: 0.02,
    wrong: [{ value: 99.11, say: 'That is its price at 4.20%. Reprice at 2.60% a half-year.' }, { value: 94.83, say: 'That treats the coupons as annual. Discount ten coupons of $2.00 at 2.60% a half-year.' }],
    solution: 'Price = 2.00 × (1 − 1.026^−10) ÷ 0.026 + 100 ÷ 1.026^10 = $94.78, or <x>=PV(5.2%/2,10,-2,-100)</x>: a fall of 4.37% from $99.11.',
  },
];
