// Lesson: bond prices, yields, duration and convexity.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=18';
import { bondAtYield } from '../../core/fin.js?v=18';

const SPEC = { face: 1000, couponRate: 0.06, years: 5, freq: 1 };

export default {
  id: 'bonds',
  title: 'Bonds, yields and duration',
  minutes: 7,
  hook: 'A bond’s price is its fixed payments discounted at today’s yield. Duration says how far that price moves when yields do.',
  idea: [
    'A plain bond pays a fixed <b>coupon</b> every year and its <b>face value</b> at maturity. Its price is those payments discounted at the market’s required return, the <b>yield to maturity</b>. Because the payments are fixed, a higher yield means a lower price: prices and yields always move in opposite directions.',
    'If the coupon is above the yield, buyers pay more than face value (a <b>premium</b>) until their overall return falls to the yield; if it is below, the bond trades at a <b>discount</b>; if they are equal, it trades at face value.',
    '<b>Duration</b> measures sensitivity. Macaulay duration is the average time until you are paid, each payment weighted by its present value. Modified duration, Macaulay ÷ (1 + y), turns that into a rule: price changes by about −modified duration × the change in yield. <b>Convexity</b> corrects for the curve: for big moves, the straight-line estimate overstates the fall and understates the rise.',
  ],
  formula: {
    html: 'P = <span class="frac"><span>C</span><span>(1 + y)</span></span> + … + <span class="frac"><span>C + FV</span><span>(1 + y)<sup>N</sup></span></span>,&ensp; <span class="frac"><span>ΔP</span><span>P</span></span> ≈ −D<sub>mod</sub> × Δy + ½ × Conv × Δy<sup>2</sup>',
    terms: [
      ['C, FV', 'the annual coupon and the face value repaid at maturity'],
      ['y', 'yield to maturity, per year'],
      ['D<sub>mac</sub>', 'Macaulay duration: Σ t × PV(payment at t) ÷ P, in years'],
      ['D<sub>mod</sub>', 'modified duration: D<sub>mac</sub> ÷ (1 + y)'],
      ['Conv', 'convexity: how much the price–yield curve bends'],
    ],
  },
  example: {
    setup: 'A five-year bond with a $1,000 face value pays a 6% coupon ($60) once a year. The market yield is 5%. What is it worth, and what happens if the yield rises to 6%?',
    steps: [
      'Price: the five coupons are worth $259.8 today and the $1,000 repayment $783.5, so the bond is worth <b>$1,043.3</b>, a premium, because its 6% coupon beats the 5% yield.',
      'Duration: Macaulay duration is <b>4.478 years</b>; modified duration is 4.478 ÷ 1.05 = <b>4.265</b>.',
      'Duration’s estimate for a one-point rise in yield: −4.265 × 1% × $1,043.3 = <b>−$44.5</b>.',
      'Convexity (23.44) adds back ½ × 23.44 × 0.01² × $1,043.3 = $1.2, for an estimate of <b>−$43.3</b>.',
    ],
    result: 'At a 6% yield the coupon equals the yield, so the bond is worth exactly <b>$1,000.0</b>: a fall of <b>$43.3</b>. Duration alone was close; with convexity it is almost exact.',
  },
  mistake: {
    title: 'Using Macaulay duration as the price sensitivity',
    html: 'Macaulay duration is a time in years, not a sensitivity. Plugging it in directly gives −4.478 × 1% × $1,043.3 = −$46.7, overstating the fall by $3.4. Divide by (1 + y) first.',
  },
  remember: [
    'Price and yield move in opposite directions. Coupon above the yield means a premium; below, a discount.',
    'Price change ≈ −modified duration × yield change. A modified duration of 7 means about −7% for a one-point rise.',
    'Longer maturities and lower coupons mean more duration. More convexity helps the holder whichever way yields move sharply.',
  ],
  calc: {
    title: 'Price a bond and its sensitivity',
    intro: 'Face value $100, one coupon a year.',
    inputs: [
      { id: 'c', label: 'Coupon rate', min: 0, max: 12, step: 0.25, value: 5, fmt: 'pct' },
      { id: 'n', label: 'Years to maturity', min: 1, max: 30, step: 1, value: 10, fmt: 'int' },
      { id: 'y', label: 'Yield to maturity', min: 0.5, max: 12, step: 0.25, value: 5, fmt: 'pct' },
    ],
    compute({ c, n, y }) {
      const spec = { face: 100, couponRate: c / 100, years: n, freq: 1 };
      const at = bondAtYield(spec, y / 100), up = bondAtYield(spec, y / 100 + 0.01);
      const est = -at.modified * 0.01, exact = up.price / at.price - 1;
      const kind = Math.abs(at.price - 100) < 0.005 ? 'at face value' : at.price > 100 ? 'at a premium' : 'at a discount';
      return {
        headline: { value: F.money(at.price, { digits: 2 }), label: `per $100 of face value, ${kind}` },
        rows: [['Macaulay duration', `${F.num(at.macaulay, 2)} years`], ['Modified duration', F.num(at.modified, 2)], ['Convexity', F.num(at.convexity, 1)], ['If the yield rises one point', `${F.pct(est, 2)} by duration; ${F.pct(exact, 2)} exactly`]],
        note: at.modified > 12
          ? 'A long, low-coupon bond: every point on yields moves its price by double digits, and the gap between the straight-line estimate and the exact change (convexity) is large.'
          : at.modified < 3
            ? 'A short bond: its price barely reacts to yields, and duration alone is almost exact.'
            : 'Duration gets you most of the way; convexity explains the small difference from the exact change.',
      };
    },
  },
  tool: { href: 'finance/markets/#bonds', label: 'Bonds, in Finance › Bonds and options' },
  checks: (() => {
    const a = bondAtYield(SPEC, 0.05), b = bondAtYield(SPEC, 0.06);
    let coup = 0; for (let t = 1; t <= 5; t++) coup += 60 / 1.05 ** t;
    const dDur = -a.modified * a.price * 0.01, conv = 0.5 * a.convexity * a.price * 0.0001;
    return [
      { what: 'coupons PV', value: coup, shown: 259.8, tol: 0.05 }, { what: 'face PV', value: 1000 / 1.05 ** 5, shown: 783.5, tol: 0.05 },
      { what: 'price', value: a.price, shown: 1043.3, tol: 0.05 },
      { what: 'Macaulay', value: a.macaulay, shown: 4.478, tol: 0.0005 }, { what: 'modified', value: a.modified, shown: 4.265, tol: 0.0005 },
      { what: 'duration estimate', value: dDur, shown: -44.5, tol: 0.05 },
      { what: 'convexity', value: a.convexity, shown: 23.44, tol: 0.005 }, { what: 'convexity term', value: conv, shown: 1.2, tol: 0.05 },
      { what: 'duration + convexity', value: dDur + conv, shown: -43.3, tol: 0.05 },
      { what: 'price at 6%', value: b.price, shown: 1000.0, tol: 0.05 }, { what: 'exact fall', value: a.price - b.price, shown: 43.3, tol: 0.05 },
      { what: 'mistake: Macaulay', value: -a.macaulay * a.price * 0.01, shown: -46.7, tol: 0.05 },
      { what: 'mistake: overstatement', value: a.macaulay * a.price * 0.01 - (a.price - b.price), shown: 3.4, tol: 0.05 },
    ];
  })(),
};
