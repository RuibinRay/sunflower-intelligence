// Lesson: market attractiveness scores (log size, rescaling, weights), CAGR, and attractiveness against reach.
import * as F from '../../core/format.js?v=14';
import { rescale, cagr } from '../../core/market.js?v=14';

const GDP = [50, 400, 2000], GROWTH = [6, 3, 1.5];
const score = (gdp, growth, w, log = true) => {
  const s = rescale(gdp, { log, cap: null }), g = rescale(growth, { cap: null });
  return gdp.map((_, i) => w * s[i] + (1 - w) * g[i]);
};

export default {
  id: 'markets',
  title: 'Choosing markets: attractiveness and reach',
  minutes: 6,
  hook: 'Rank countries on what makes a market worth entering, on one scale and with weights you choose, then weigh how attractive each is against how hard it is to reach.',
  idea: [
    'Market measures come in different units: GDP in dollars, growth in percent, population in people. An <b>attractiveness score</b> puts each on a common 0–100 scale across the countries you compare, lowest 0 and highest 100, then adds them up with your weights.',
    'Size needs a <b>log scale</b>. GDP runs from a few billion dollars to tens of trillions, so on a raw scale the biggest economies sit near 100 and everyone else near 0. Growth is a <b>compound annual growth rate</b>: from $200bn to $300bn in five years is (300 ÷ 200)<sup>1/5</sup> − 1 = 8.4% a year, not 10%.',
    'Scores are relative: change the set of countries and every score can move. And attractive is not the same as reachable. Plotting attractiveness against <b>reach</b>, closeness to your home market, gives a GE–McKinsey-style grid: high on both is where to grow first; high on only one calls for selectivity.',
  ],
  formula: {
    html: 'scaled = 100 × <span class="frac"><span>x − lowest</span><span>highest − lowest</span></span>,&ensp; score = Σ weight × scaled,&ensp; CAGR = (end ÷ start)<sup>1/years</sup> − 1',
    terms: [
      ['x', 'a country’s measure; for GDP, its natural logarithm'],
      ['weight', 'how much each measure counts; weights are divided by their total so they add to 1'],
      ['CAGR', 'compound annual growth rate'],
      ['reach', '100 next door, 0 on the far side of the planet'],
    ],
    note: 'The market map also caps each measure at its 5th and 95th percentiles before scaling, so one extreme country can’t squash the rest.',
  },
  example: {
    setup: 'Compare three countries. A has a GDP of $50bn growing 6% a year; B, $400bn growing 3%; C, $2,000bn growing 1.5%. Size counts 60% and growth 40%.',
    steps: [
      'Logs of GDP: ln 50 = <b>3.91</b>, ln 400 = <b>5.99</b>, ln 2,000 = <b>7.60</b>.',
      'Size scores: A <b>0</b>; B (5.99 − 3.91) ÷ (7.60 − 3.91) × 100 = <b>56</b>; C <b>100</b>.',
      'Growth scores: A <b>100</b>; B (3 − 1.5) ÷ (6 − 1.5) × 100 = <b>33</b>; C <b>0</b>.',
      'Weighted: A 0.6 × 0 + 0.4 × 100 = <b>40</b>; B 0.6 × 56 + 0.4 × 33 = <b>47</b>; C 0.6 × 100 + 0.4 × 0 = <b>60</b>.',
    ],
    result: 'C ranks first on sheer size, but B, mid-sized and growing twice as fast as C, comes second, ahead of the small fast grower A. Change the weights and the order can change; that is the point of setting them yourself.',
  },
  mistake: {
    title: 'Scaling GDP without logs',
    html: 'On a raw scale B’s size score is (400 − 50) ÷ (2,000 − 50) × 100 = 18 instead of 56, its total falls to 24, and the tiny market A, at 40, overtakes it. The largest economy sets the scale and everyone else looks the same size.',
  },
  remember: [
    'Put every measure on 0–100 across the countries in view, size on a log scale, then weight them. Change the set and the scores change.',
    'Growth is compound: CAGR = (end ÷ start)<sup>1/years</sup> − 1. Measured in US dollars it includes inflation and currency moves.',
    'Weigh attractiveness against reach: strong on both, grow there first; strong on only one, be selective.',
  ],
  calc: {
    title: 'Score three markets',
    intro: 'A and C as in the example; move B and the weights.',
    inputs: [
      { id: 'w', label: 'Weight on size (the rest on growth)', min: 0, max: 100, step: 5, value: 60, fmt: 'pct' },
      { id: 'gdp', label: 'B’s GDP', min: 60, max: 1900, step: 10, value: 400, fmt: 'money', unit: 'bn' },
      { id: 'growth', label: 'B’s growth a year', min: 0, max: 8, step: 0.5, value: 3, fmt: 'pct', digits: 1 },
    ],
    compute({ w, gdp, growth }) {
      const gd = [50, gdp, 2000], gr = [6, growth, 1.5];
      const s = score(gd, gr, w / 100), names = ['A', 'B', 'C'];
      const order = [0, 1, 2].sort((i, j) => s[j] - s[i]);
      const raw = score(gd, gr, w / 100, false);
      return {
        headline: { value: `${names[order[0]]} · ${F.int(s[order[0]])}`, label: 'the most attractive of the three' },
        rows: names.map((n, i) => [`${n}: ${F.money(gd[i], { unit: 'bn' })}, ${F.num(gr[i], 1)}% growth`, F.int(s[i])]),
        note: `Ranking: ${order.map((i) => names[i]).join(', ')}. Without logs it would be ${[0, 1, 2].sort((i, j) => raw[j] - raw[i]).map((i) => names[i]).join(', ')}.`,
      };
    },
  },
  tool: { href: 'marketing/map/#score', label: 'Attractiveness score, in Marketing › Market map' },
  checks: (() => {
    const ls = rescale(GDP, { log: true, cap: null }), gs = rescale(GROWTH, { cap: null }), sc = score(GDP, GROWTH, 0.6), rawS = rescale(GDP, { cap: null }), raw = score(GDP, GROWTH, 0.6, false);
    return [
      { what: 'CAGR 200→300', value: cagr(300, 200, 5) * 100, shown: 8.4, tol: 0.05 },
      { what: 'ln 50', value: Math.log(50), shown: 3.91, tol: 0.005 }, { what: 'ln 400', value: Math.log(400), shown: 5.99, tol: 0.005 }, { what: 'ln 2000', value: Math.log(2000), shown: 7.6, tol: 0.005 },
      { what: 'size B', value: ls[1], shown: 56, tol: 0.5 }, { what: 'size A', value: ls[0], shown: 0, tol: 1e-9 }, { what: 'size C', value: ls[2], shown: 100, tol: 1e-9 },
      { what: 'growth B', value: gs[1], shown: 33, tol: 0.5 },
      { what: 'score A', value: sc[0], shown: 40, tol: 0.5 }, { what: 'score B', value: sc[1], shown: 47, tol: 0.5 }, { what: 'score C', value: sc[2], shown: 60, tol: 0.5 },
      { what: 'rounded B arithmetic', value: 0.6 * 56 + 0.4 * 33, shown: 47, tol: 0.5 },
      { what: 'raw size B', value: rawS[1], shown: 18, tol: 0.5 }, { what: 'raw total B', value: raw[1], shown: 24, tol: 0.5 },
    ];
  })(),
};
