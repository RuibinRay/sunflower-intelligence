// Lesson: options, Black–Scholes–Merton, put–call parity and the Greeks.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=19';
import { blackScholes } from '../../core/fin.js?v=19';

const EX = { S: 50, K: 52, T: 0.5, r: 0.04, sigma: 0.3 };

export default {
  id: 'options',
  title: 'Options and what drives their value',
  minutes: 8,
  hook: 'An option is a right without an obligation. Its value comes from what the share might do before expiry, which is why volatility matters so much.',
  idea: [
    'A <b>call</b> is the right to buy a share at a fixed <b>strike</b> price on or before expiry; a <b>put</b> is the right to sell. At expiry a call is worth max(S − K, 0) and a put max(K − S, 0). The holder pays a premium up front and can never lose more than that.',
    'Before expiry an option is worth more than its payoff today, because the share may still move in the holder’s favour. The Black–Scholes–Merton model prices that from five inputs: share price, strike, time, interest rate and <b>volatility</b>. More volatility raises both calls and puts, since big moves help the holder and losses are capped.',
    'The <b>Greeks</b> measure sensitivities. <b>Delta</b> is the change in option value per $1 move in the share; vega, per point of volatility; theta, the value lost as time passes. <b>Put–call parity</b> ties the two together: a call minus a put behaves like owning the share and owing the present value of the strike. <b>Implied volatility</b> is the volatility that makes the model match a market price.',
  ],
  formula: {
    html: 'C = S × N(d<sub>1</sub>) − K e<sup>−rT</sup> × N(d<sub>2</sub>),&ensp; d<sub>1</sub> = <span class="frac"><span>ln(S/K) + (r + σ<sup>2</sup>/2)T</span><span>σ√T</span></span>,&ensp; d<sub>2</sub> = d<sub>1</sub> − σ√T',
    terms: [
      ['S, K', 'share price today and strike price'],
      ['T', 'time to expiry in years'],
      ['r', 'risk-free rate, continuously compounded'],
      ['σ', 'volatility of the share’s returns per year'],
      ['N(x)', 'the standard normal cumulative probability; N(d<sub>1</sub>) is the call’s delta'],
    ],
    note: 'Put–call parity: C − P = S − K e<sup>−rT</sup>. Both are the versions for a share that pays no dividend before expiry; the tool also takes a dividend yield.',
  },
  example: {
    setup: 'A share trades at $50. A six-month call with a $52 strike: the risk-free rate is 4% and volatility 30%. What are the call and the matching put worth?',
    steps: [
      'The model’s inputs give d<sub>1</sub> = 0.015 and d<sub>2</sub> = −0.197, so N(d<sub>1</sub>) = 0.5062 and N(d<sub>2</sub>) = 0.4220.',
      'The strike’s present value is 52 × e<sup>−0.04 × 0.5</sup> = $50.97. The call is 50 × 0.5062 − 50.97 × 0.4220 = 25.31 − 21.51 = <b>$3.80</b>.',
      'Put–call parity gives the put: 3.80 − 50 + 50.97 = <b>$4.77</b>.',
      'Delta is 0.51: if the share rises $1, the call gains about $0.51. Raise volatility to 40% and the call is worth <b>$5.21</b>.',
    ],
    result: 'The call is out of the money (the share is below the strike), so all of its <b>$3.80</b> is time value: the chance the share climbs above $52 in six months.',
  },
  mistake: {
    title: 'Forgetting to discount the strike in put–call parity',
    html: 'Writing P = C − S + K gives 3.80 − 50 + 52 = $5.80, overpricing the put by $1.03. The strike is paid at expiry, so parity uses its present value, K e<sup>−rT</sup>.',
  },
  remember: [
    'A call is the right to buy at the strike, a put the right to sell; the most a holder can lose is the premium.',
    'Higher volatility makes both calls and puts more valuable. Value change ≈ delta × share move.',
    'Call − put = S − K e<sup>−rT</sup> for European options on a share without dividends.',
  ],
  calc: {
    title: 'Price an option',
    intro: 'Black–Scholes–Merton with a 4% risk-free rate and no dividends.',
    inputs: [
      { id: 'S', label: 'Share price', min: 20, max: 100, step: 1, value: 50, fmt: 'money' },
      { id: 'K', label: 'Strike price', min: 20, max: 100, step: 1, value: 52, fmt: 'money' },
      { id: 'vol', label: 'Volatility', min: 5, max: 80, step: 1, value: 30, fmt: 'pct' },
      { id: 'months', label: 'Months to expiry', min: 1, max: 24, step: 1, value: 6, fmt: 'int' },
    ],
    compute({ S, K, vol, months }) {
      const base = { S, K, T: months / 12, r: 0.04, sigma: vol / 100 };
      const c = blackScholes({ ...base, type: 'call' }), p = blackScholes({ ...base, type: 'put' });
      if (c.error) return { error: c.error };
      return {
        headline: { value: F.money(c.call, { digits: 2 }), label: 'call value' },
        rows: [['Put value', F.money(p.put, { digits: 2 })], ['Call delta', F.num(c.delta, 2)], ['Call’s time value (above its payoff today)', F.money(c.timeValue, { digits: 2 })], ['Risk-neutral chance the call ends in the money', F.pct(c.probITM, 0)]],
        note: c.intrinsic === 0
          ? 'The call is out of the money: every cent of its value is time value, the chance the share rises above the strike before expiry.'
          : c.timeValue < 0.05 * c.call
            ? 'Deep in the money: the call behaves almost like the share itself (delta near 1), with little time value left.'
            : 'In the money: part of the value is the payoff you could take today, the rest is time value.',
      };
    },
  },
  tool: { href: 'finance/markets/#options', label: 'Options, in Finance › Bonds and options' },
  checks: (() => {
    const c = blackScholes({ ...EX, type: 'call' }), p = blackScholes({ ...EX, type: 'put' });
    const pvK = EX.K * Math.exp(-EX.r * EX.T), up = blackScholes({ ...EX, sigma: 0.4, type: 'call' });
    return [
      { what: 'd1', value: c.d1, shown: 0.015, tol: 0.0005 }, { what: 'd2', value: c.d2, shown: -0.197, tol: 0.0005 },
      { what: 'N(d1)', value: c.delta, shown: 0.5062, tol: 0.00005 }, { what: 'N(d2)', value: c.probITM, shown: 0.4220, tol: 0.00005 },
      { what: 'PV of strike', value: pvK, shown: 50.97, tol: 0.005 },
      { what: 'S N(d1)', value: EX.S * c.delta, shown: 25.31, tol: 0.005 }, { what: 'K N(d2) part', value: pvK * c.probITM, shown: 21.51, tol: 0.005 },
      { what: 'call', value: c.call, shown: 3.80, tol: 0.005 },
      { what: 'put (model)', value: p.put, shown: 4.77, tol: 0.005 }, { what: 'put (parity)', value: c.call - EX.S + pvK, shown: 4.77, tol: 0.005 },
      { what: 'delta', value: c.delta, shown: 0.51, tol: 0.005 }, { what: 'call at 40% vol', value: up.call, shown: 5.21, tol: 0.005 },
      { what: 'all time value', value: c.timeValue, shown: 3.80, tol: 0.005 },
      { what: 'mistake: parity without discounting', value: c.call - EX.S + EX.K, shown: 5.80, tol: 0.005 },
      { what: 'mistake: overpricing', value: EX.K - pvK, shown: 1.03, tol: 0.005 },
      { what: 'question: delta 0.6 × $2', value: 0.6 * 2, shown: 1.2, tol: 1e-9 },
    ];
  })(),
};
