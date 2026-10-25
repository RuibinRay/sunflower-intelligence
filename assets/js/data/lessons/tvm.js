// Lesson: time value of money and discounted cash flow.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=14';

const pv = (cf, r, t) => cf / (1 + r) ** t;

export default {
  id: 'tvm',
  title: 'Time value and discounted cash flow',
  minutes: 6,
  hook: 'A dollar today is worth more than a dollar next year. Discounting puts every future cash flow into today’s money, and a DCF adds them up.',
  idea: [
    'Money you have today can be invested to earn a return, so a promise of money later is worth less than the same amount now. How much less depends on the return you give up by waiting: the <b>discount rate</b>.',
    'Discounting is compounding run backwards. At 10%, $100 grows to $110 in a year, so $110 a year from now is worth $100 today. Two years away, the same $110 is worth 110 ÷ 1.10² = $90.91.',
    'A <b>discounted cash flow</b> (DCF) valuation does this for every year of a business’s forecast free cash flow, then adds a <b>terminal value</b> for everything after the forecast. For a company, the discount rate is its cost of capital (WACC).',
  ],
  formula: {
    html: 'Value = <span class="frac"><span>CF<sub>1</sub></span><span>(1 + r)</span></span> + <span class="frac"><span>CF<sub>2</sub></span><span>(1 + r)<sup>2</sup></span></span> + … + <span class="frac"><span>CF<sub>N</sub> + TV<sub>N</sub></span><span>(1 + r)<sup>N</sup></span></span>,&ensp; TV<sub>N</sub> = <span class="frac"><span>CF<sub>N</sub> × (1 + g)</span><span>r − g</span></span>',
    terms: [
      ['CF<sub>t</sub>', 'free cash flow in year <i>t</i>'],
      ['r', 'discount rate per year (WACC for a whole company)'],
      ['N', 'the last year of the forecast'],
      ['g', 'growth every year after N, forever; it must be below r'],
      ['TV<sub>N</sub>', 'terminal value: what all the years after N are worth at the end of year N (the Gordon growth formula)'],
    ],
  },
  example: {
    setup: 'A shop will make free cash flow of $100k, $110k and $120k over the next three years, then grow 2% a year forever. Its cost of capital is 9%. What is it worth today?',
    steps: [
      'Discount each forecast year: 100 ÷ 1.09 = <b>91.7</b>; 110 ÷ 1.09² = <b>92.6</b>; 120 ÷ 1.09³ = <b>92.7</b>. Together, <b>$277.0k</b>.',
      'Terminal value at the end of year 3: 120 × 1.02 ÷ (0.09 − 0.02) = 122.4 ÷ 0.07 = <b>$1,748.6k</b>.',
      'It sits at the end of year 3, so discount it three years: 1,748.6 ÷ 1.09³ = <b>$1,350.2k</b>.',
      'Add the two: 277.0 + 1,350.2 = <b>$1,627.2k</b>.',
    ],
    result: 'The shop is worth about <b>$1.63m</b>. Notice that 83% of it comes from the terminal value: the answer leans heavily on the 2% growth and 9% rate, so test both.',
  },
  mistake: {
    title: 'Discounting the terminal value by the wrong number of years',
    html: 'The Gordon formula uses year N+1’s cash flow to give a value <em>at the end of year N</em>, so it is discounted N years, exactly like year N’s cash flow. Discounting it four years in the example gives $1,515.7k; forgetting to discount it gives $2,025.6k. Both are wrong.',
  },
  remember: [
    'Present value = cash flow ÷ (1 + r)<sup>t</sup>. A higher rate or a later date means a lower value.',
    'A DCF is the present value of the forecast plus the present value of the terminal value. Check the terminal value’s share; it is often most of the answer.',
    'Growth forever must stay below the discount rate, or the formula breaks.',
  ],
  calc: {
    title: 'Value a growing business',
    intro: 'Five forecast years growing at one rate, then a slower growth rate forever.',
    inputs: [
      { id: 'cf', label: 'Free cash flow next year', min: 10, max: 500, step: 10, value: 100, fmt: 'money', unit: 'k' },
      { id: 'g1', label: 'Growth in years 2–5', min: -10, max: 25, step: 1, value: 6, fmt: 'pct' },
      { id: 'g', label: 'Growth after year 5, forever', min: -2, max: 5, step: 0.5, value: 2, fmt: 'pct' },
      { id: 'r', label: 'Discount rate', min: 4, max: 20, step: 0.5, value: 9, fmt: 'pct' },
    ],
    compute({ cf, g1, g, r }) {
      g1 /= 100; g /= 100; r /= 100;
      if (g >= r) return { error: 'Growth forever has to be below the discount rate; otherwise the terminal value is infinite.' };
      let flow = cf, pvf = 0;
      for (let t = 1; t <= 5; t++) { if (t > 1) flow *= 1 + g1; pvf += pv(flow, r, t); }
      const tv = (flow * (1 + g)) / (r - g), pvtv = pv(tv, r, 5), value = pvf + pvtv;
      return {
        headline: { value: F.money(value, { unit: 'k' }), label: 'value today' },
        rows: [['Present value of years 1–5', F.money(pvf, { unit: 'k' })], ['Present value of the terminal value', F.money(pvtv, { unit: 'k' })], ['Terminal value’s share of the total', F.pct(pvtv / value, 0)]],
        note: pvtv / value > 0.6 ? 'Most of the value comes after year 5, so the forever-growth rate and the discount rate matter more than the forecast itself.' : 'The forecast years carry much of the value here, so the forecast deserves the most scrutiny.',
      };
    },
  },
  tool: { href: 'finance/valuation/#dcf', label: 'Discounted cash flow, in Finance › Valuation' },
  checks: (() => {
    const r = 0.09, f = [pv(100, r, 1), pv(110, r, 2), pv(120, r, 3)], tv = (120 * 1.02) / (r - 0.02);
    const sum = f.reduce((a, b) => a + b, 0), pvtv = pv(tv, r, 3);
    return [
      { what: 'year 1', value: f[0], shown: 91.7, tol: 0.05 }, { what: 'year 2', value: f[1], shown: 92.6, tol: 0.05 }, { what: 'year 3', value: f[2], shown: 92.7, tol: 0.05 },
      { what: 'forecast total', value: sum, shown: 277.0, tol: 0.05 }, { what: 'terminal value', value: tv, shown: 1748.6, tol: 0.05 },
      { what: 'PV of terminal value', value: pvtv, shown: 1350.2, tol: 0.05 }, { what: 'total', value: sum + pvtv, shown: 1627.2, tol: 0.05 },
      { what: 'terminal share', value: pvtv / (sum + pvtv), shown: 0.83, tol: 0.005 },
      { what: 'two years at 10%', value: pv(110, 0.1, 2), shown: 90.91, tol: 0.005 },
      { what: 'mistake: four years', value: sum + pv(tv, r, 4), shown: 1515.7, tol: 0.05 }, { what: 'mistake: undiscounted', value: sum + tv, shown: 2025.6, tol: 0.05 },
    ];
  })(),
};
