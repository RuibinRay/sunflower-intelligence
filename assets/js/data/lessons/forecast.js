// Lesson: seasonal forecasting with Holt-Winters — level, trend and season, how they update, and how to check a forecast.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=14';
import { filter, project } from '../../core/forecast.js?v=14';

// Invented shop: quarterly sales ($k). States at the end of last year.
const INIT = { l0: 200, b0: 5, s0: [-30, -10, 0, 40] };
const sm = (v, d) => `${v > 0 ? '+' : ''}${F.money(v, { digits: d, unit: 'k' })}`;
const step = (actual, params) => { const run = filter([actual], 4, params, INIT); return { run, ahead: Array.from(project(run, 4, params, 4).mean) }; };

export default {
  id: 'forecast',
  title: 'Seasonal forecasting with Holt-Winters',
  minutes: 7,
  hook: 'A seasonal series has a level, a trend and a pattern that repeats every year. Holt-Winters tracks all three, updating each as new figures arrive, and a fair test tells you whether to trust it.',
  idea: [
    'Split the series into three parts. The <b>level</b> is where sales are now, the <b>trend</b> is how much they grow each period, and the <b>seasonal</b> part is the repeating pattern within the year, such as a December peak. A forecast adds them up: level, plus trend for each period ahead, plus that period’s seasonal effect.',
    'After each new figure, every part moves part of the way toward what the surprise suggests. Three smoothing weights between 0 and 1 set how far: α for the level, β for the trend, γ for the season. High weights react fast but chase noise; low weights are steady but slow to notice change. If the seasonal swings grow as sales grow, they are <b>multiplicative</b>: model the logarithm, where they become constant.',
    'Before trusting a forecast, hold back the last season, forecast it from the rest, and compare the errors with <b>seasonal naive</b>: simply repeating last season. That baseline is free and often hard to beat; a model has to earn its complexity against it.',
  ],
  formula: {
    html: 'ŷ<sub>t</sub> = ℓ<sub>t−1</sub> + b<sub>t−1</sub> + s<sub>t−m</sub>,&ensp; e<sub>t</sub> = y<sub>t</sub> − ŷ<sub>t</sub>,&ensp; ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + b<sub>t−1</sub> + αe<sub>t</sub>,&ensp; b<sub>t</sub> = b<sub>t−1</sub> + αβe<sub>t</sub>,&ensp; s<sub>t</sub> = s<sub>t−m</sub> + γe<sub>t</sub>',
    terms: [
      ['ℓ, b, s', 'level, trend per period, and seasonal effect'],
      ['m', 'the season length: 4 for quarters, 12 for months'],
      ['e<sub>t</sub>', 'the surprise: actual minus forecast'],
      ['α, β, γ', 'smoothing weights for level, trend and season, chosen to minimise one-step errors'],
    ],
    note: 'Forecasting h periods ahead: ℓ + h × b + the seasonal effect for that period. The 95% interval widens with h.',
  },
  example: {
    setup: 'A shop’s quarterly sales ($k) end last year with level 200, trend +5 a quarter and seasonal effects of −30, −10, 0 and +40 for quarters 1–4. The weights are α = 0.3, β = 0.1, γ = 0.2. First-quarter sales come in at 181.',
    steps: [
      'The forecast was 200 + 5 − 30 = <b>175</b>, so the surprise is 181 − 175 = <b>+6</b>.',
      'Update: level 200 + 5 + 0.3 × 6 = <b>206.8</b>; trend 5 + 0.3 × 0.1 × 6 = <b>5.18</b>; the first quarter’s seasonal effect −30 + 0.2 × 6 = <b>−28.8</b>.',
      'Next quarter: 206.8 + 5.18 − 10 = <b>202.0</b>.',
      'The same quarter next year, four quarters ahead: 206.8 + 4 × 5.18 − 28.8 = <b>198.7</b>.',
    ],
    result: 'One good quarter nudged all three parts up a little, not all the way. Over many quarters, those small corrections are how the model learns the business’s rhythm.',
  },
  mistake: {
    title: 'Using additive seasonality when the swings grow with the level',
    html: 'December runs 40% above a level of 100, so +40. When the level reaches 200, a multiplicative season predicts 200 × 1.4 = <b>280</b>; an additive one still adds 40, forecasting <b>240</b> and missing by <b>14%</b>. If the peaks grow as sales grow, model the logarithm (the forecasting tool tries both and keeps the better fit).',
  },
  remember: [
    'Level, trend and season: the seasonal component carries the repeating pattern within the year.',
    'Swings that grow with the level are multiplicative; on a log scale they become constant.',
    'Hold back the last season and beat repeating last season before trusting a forecast.',
  ],
  calc: {
    title: 'Watch one update',
    intro: 'The shop above. The forecast for the first quarter was 175; set what actually happened and how strongly the model reacts. The trend weight β stays at 0.1.',
    inputs: [
      { id: 'actual', label: 'First-quarter sales came in at', min: 150, max: 220, step: 1, value: 181, fmt: 'money', unit: 'k' },
      { id: 'alpha', label: 'Level weight α', min: 0, max: 1, step: 0.05, value: 0.3, fmt: 'num', digits: 2 },
      { id: 'gamma', label: 'Season weight γ', min: 0, max: 1, step: 0.05, value: 0.2, fmt: 'num', digits: 2 },
    ],
    compute({ actual, alpha, gamma }) {
      const { run, ahead } = step(actual, { alpha, beta: 0.1, gamma });
      const e = run.resid[0];
      const note = alpha >= 0.7 ? 'A high level weight treats almost every surprise as a lasting change, so forecasts will chase noise.'
        : alpha <= 0.1 ? 'A low level weight barely reacts: steady, but slow to notice if sales really have shifted.'
          : Math.abs(e) >= 25 ? 'A big surprise. If it was a one-off (a promotion, a strike), the model will over-react a little and correct over the next quarters.'
            : 'A moderate weight: the model moves part of the way toward each surprise.';
      return {
        headline: { value: F.money(ahead[0], { digits: 1, unit: 'k' }), label: 'forecast for next quarter' },
        rows: [['Surprise this quarter', sm(e, 0)], ['New level', F.money(run.l, { digits: 1, unit: 'k' })], ['First quarter’s seasonal effect', sm(run.season[0], 1)], ['Same quarter next year', F.money(ahead[3], { digits: 1, unit: 'k' })]],
        note,
      };
    },
  },
  tool: { href: 'analytics/forecast/#forecast', label: 'Forecast, in Business analytics › Forecasting' },
  checks: (() => {
    const { run, ahead } = step(181, { alpha: 0.3, beta: 0.1, gamma: 0.2 });
    return [
      { what: 'forecast', value: run.fitted[0], shown: 175, tol: 1e-9 }, { what: 'surprise', value: run.resid[0], shown: 6, tol: 1e-9 },
      { what: 'level', value: run.l, shown: 206.8, tol: 1e-9 }, { what: 'trend', value: run.b, shown: 5.18, tol: 1e-9 },
      { what: 'Q1 season', value: run.season[0], shown: -28.8, tol: 1e-9 },
      { what: 'next quarter', value: ahead[0], shown: 202.0, tol: 0.05 }, { what: 'four quarters ahead', value: ahead[3], shown: 198.7, tol: 0.05 },
      { what: 'multiplicative December', value: 200 * 1.4, shown: 280, tol: 1e-9 }, { what: 'additive December', value: 200 + 40, shown: 240, tol: 1e-9 },
      { what: 'miss', value: ((280 - 240) / 280) * 100, shown: 14, tol: 0.5 },
    ];
  })(),
};
