// Lesson: market risk — Value at Risk, Expected Shortfall and backtesting.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=10';
import { normQuantile } from '../../core/stats.js?v=10';
import { kupiec, trafficLight } from '../../core/risk.js?v=10';

const phi = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
/** Normal VaR and ES as fractions of value, with a zero average return, over h days. */
function normalRisk(sigma, c, h = 1) {
  const z = normQuantile(1 - c), s = sigma * Math.sqrt(h);
  return { z, var: -z * s, es: (s * phi(z)) / (1 - c) };
}

export default {
  id: 'mrisk',
  title: 'Value at Risk and Expected Shortfall',
  minutes: 7,
  hook: 'Value at Risk is the loss a portfolio should exceed only rarely. Expected Shortfall asks how bad those rare days are, and a backtest asks whether the model was right.',
  idea: [
    'A one-day 99% <b>Value at Risk</b> of $1m means losses should exceed $1m on about one day in a hundred. It is a threshold, not a worst case: it says nothing about how far beyond it the bad days go. <b>Expected Shortfall</b> answers that, as the average loss on the days beyond VaR, which is why bank capital rules now use it, at 97.5%.',
    'There are three common ways to estimate them. <b>Historical simulation</b> replays past returns. The <b>normal</b> (variance–covariance) method uses only the average and volatility, and so understates risk when returns have fat tails. <b>Monte Carlo</b> simulates many outcomes from a fitted model. Longer horizons are often scaled by √time, which assumes one day’s return tells you nothing about the next.',
    'A model is checked by <b>backtesting</b>: count the days its VaR was broken. <b>Kupiec’s test</b> asks whether the count fits the confidence level; <b>Christoffersen’s test</b> asks whether breaks bunch together, the sign of a model slow to notice stormy weather. Banks’ 99% models are graded on 250 days: 0–4 breaks is green, 5–9 yellow, 10 or more red.',
  ],
  formula: {
    html: 'VaR<sub>c</sub> = z<sub>c</sub> × σ × √h × V,&ensp; ES<sub>c</sub> = <span class="frac"><span>φ(z<sub>c</sub>)</span><span>1 − c</span></span> × σ × √h × V',
    terms: [
      ['c', 'confidence level, such as 99%'],
      ['z<sub>c</sub>', 'the normal quantile for c: 2.326 at 99%, 1.645 at 95%'],
      ['σ', 'daily volatility of the portfolio’s returns'],
      ['h, V', 'horizon in days, and the portfolio’s value'],
      ['φ', 'the standard normal density'],
    ],
    note: 'This is the normal method with an average daily return of zero, the usual simplification over short horizons.',
  },
  example: {
    setup: 'A $10m portfolio has a daily volatility of 1.2%. Using the normal method at 99%, what are its one-day VaR and Expected Shortfall, and its ten-day VaR?',
    steps: [
      'One-day VaR: 2.326 × 1.2% × $10m = <b>$279k</b>.',
      'Expected Shortfall: φ(2.326) ÷ 0.01 = 2.665, so 2.665 × 1.2% × $10m = <b>$320k</b>. On the worst 1% of days, the average loss is about 15% beyond VaR.',
      'Ten days by the square-root-of-time rule: $279k × √10 ≈ $279k × 3.16 = <b>$882k</b>.',
      'Backtest: over the last 250 days the loss beat the VaR 6 times, against 2.5 expected. That is the Basel <b>yellow</b> zone; Kupiec’s p-value is 0.06, so the count alone is not quite enough to reject the model at the usual 5% level.',
    ],
    result: 'Report <b>$279k</b> as the one-day 99% VaR and <b>$320k</b> as Expected Shortfall. Six breaks is a warning: check whether returns have fatter tails than the normal curve, and whether the breaks came in a cluster.',
  },
  mistake: {
    title: 'Scaling VaR by the number of days',
    html: 'Multiplying by 10 instead of √10 gives $2.79m for ten days, more than three times the √time answer. Risk grows with the square root of time when returns are independent, because good and bad days partly cancel.',
  },
  remember: [
    'A 99% one-day VaR should be broken on about one day in a hundred; it is not the most you can lose.',
    'Expected Shortfall is the average loss beyond VaR. The normal method understates both when tails are fat.',
    'Ten-day VaR ≈ one-day VaR × √10. Backtest the count (Kupiec) and the clustering (Christoffersen).',
  ],
  calc: {
    title: 'Size the risk',
    intro: 'The normal method, with an average daily return of zero.',
    inputs: [
      { id: 'value', label: 'Portfolio value', min: 1, max: 100, step: 1, value: 10, fmt: 'money', unit: 'm' },
      { id: 'vol', label: 'Daily volatility', min: 0.2, max: 4, step: 0.1, value: 1.2, fmt: 'pct', digits: 1 },
      { id: 'conf', label: 'Confidence', min: 90, max: 99.5, step: 0.5, value: 99, fmt: 'pct', digits: 1 },
      { id: 'h', label: 'Horizon in days', min: 1, max: 20, step: 1, value: 1, fmt: 'int' },
    ],
    compute({ value, vol, conf, h }) {
      const c = conf / 100, r = normalRisk(vol / 100, c, h), V = value * 1e6;
      const fmt = (x) => (x >= 1e6 ? `$${F.num(x / 1e6, 2)}m` : `$${F.num(x / 1e3, 0)}k`);
      return {
        headline: { value: fmt(r.var * V), label: `${F.pct(c, 1)} ${h === 1 ? 'one-day' : `${h}-day`} VaR` },
        rows: [['Expected Shortfall', fmt(r.es * V)], ['As a share of the portfolio', `${F.pct(r.var, 2)} VaR; ${F.pct(r.es, 2)} ES`], ['Breaks to expect in 250 days', F.num(250 * (1 - c), 1)]],
        note: h > 1
          ? 'Longer horizons here use the square-root-of-time rule. It assumes days are independent; in calm-then-stormy markets the real ten-day risk can be larger.'
          : c >= 0.99
            ? 'Far out in the tail the normal curve is at its weakest: real returns usually have fatter tails, so historical or Monte Carlo estimates often come out higher.'
            : 'At lower confidence levels the three methods tend to agree more, because the normal curve fits the middle of the distribution better than its tails.',
      };
    },
  },
  tool: { href: 'finance/risk/#var', label: 'Value at Risk, in Finance › Risk management' },
  checks: (() => {
    const r = normalRisk(0.012, 0.99), V = 10e6, k = kupiec(6, 250, 0.01), tl = trafficLight(6, 250, 0.01);
    return [
      { what: 'z at 99%', value: -r.z, shown: 2.326, tol: 0.0005 },
      { what: 'one-day VaR ($k)', value: (r.var * V) / 1e3, shown: 279, tol: 0.5 },
      { what: 'φ(z) / 0.01', value: phi(r.z) / 0.01, shown: 2.665, tol: 0.0005 },
      { what: 'ES ($k)', value: (r.es * V) / 1e3, shown: 320, tol: 0.5 },
      { what: 'ES about 15% beyond VaR', value: (r.es / r.var - 1) * 100, shown: 15, tol: 0.5 },
      { what: 'ten-day as printed (×3.16)', value: 279 * 3.16, shown: 882, tol: 0.5 },
      { what: 'ten-day exact ($k), within the ≈', value: (normalRisk(0.012, 0.99, 10).var * V) / 1e3, shown: 882, tol: 1 },
      { what: 'expected breaks', value: 250 * 0.01, shown: 2.5, tol: 1e-9 },
      { what: 'Kupiec p', value: k.p, shown: 0.06, tol: 0.005 },
      { what: 'traffic light 6 → yellow (1 = yellow)', value: tl.zone === 'yellow' ? 1 : 0, shown: 1, tol: 0 },
      { what: 'mistake: ×10 ($m)', value: (r.var * V * 10) / 1e6, shown: 2.79, tol: 0.005 },
      { what: 'question: $2m × √10', value: 2 * Math.sqrt(10), shown: 6.3, tol: 0.05 },
    ];
  })(),
};
