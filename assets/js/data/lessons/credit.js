// Lesson: credit distress and Altman’s Z-scores.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
// The coefficients and cut-offs repeat Z_MODELS in assets/js/pages/finance-risk.js (a page module, so it
// can't be imported here); keep the two in step.
import * as F from '../../core/format.js?v=18';

const Z = { coef: [1.2, 1.4, 3.3, 0.6, 1.0], cut: [1.81, 2.99] };
const ZPP = { coef: [6.56, 3.26, 6.72, 1.05], cut: [1.1, 2.6] };
const NAMES = ['Working capital ÷ total assets', 'Retained earnings ÷ total assets', 'EBIT ÷ total assets', 'Market value of equity ÷ total liabilities', 'Sales ÷ total assets'];
const zone = (z, cut) => (z < cut[0] ? 'distress' : z > cut[1] ? 'safe' : 'grey');
const EX = [150 / 1000, 300 / 1000, 120 / 1000, 700 / 500, 1100 / 1000];

export default {
  id: 'credit',
  title: 'Spotting financial distress',
  minutes: 6,
  hook: 'Five ratios from the accounts, weighted into one score, separated manufacturers that went bankrupt from those that didn’t. Altman’s Z-score is still the standard first screen.',
  idea: [
    'In 1968 Edward Altman took 66 US manufacturers, half of which had gone bankrupt, and asked which combination of financial ratios best told the two groups apart. The answer, found by discriminant analysis, was five ratios with fixed weights, added into a single <b>Z-score</b>.',
    'The ratios cover liquidity (working capital), accumulated profit (retained earnings), <b>earning power</b> (EBIT, the largest weight at 3.3), leverage (market value of equity against liabilities) and asset turnover (sales). In the original model a score below 1.81 is the <b>distress zone</b>, above 2.99 the <b>safe zone</b>, and in between a grey zone where the model can’t call it.',
    'Altman later fitted versions for other firms. <b>Z′</b> for private companies uses book equity. <b>Z″</b> for non-manufacturers drops sales ÷ assets, because asset turnover differs so much between industries that it would make asset-light firms look strong; it has its own cut-offs, 1.1 and 2.6. It is a screen, not a forecast, and not meant for banks or insurers.',
  ],
  formula: {
    html: 'Z = 1.2 X<sub>1</sub> + 1.4 X<sub>2</sub> + 3.3 X<sub>3</sub> + 0.6 X<sub>4</sub> + 1.0 X<sub>5</sub>',
    terms: [
      ['X<sub>1</sub>', 'working capital ÷ total assets'],
      ['X<sub>2</sub>', 'retained earnings ÷ total assets'],
      ['X<sub>3</sub>', 'EBIT (operating profit) ÷ total assets'],
      ['X<sub>4</sub>', 'market value of equity ÷ total liabilities'],
      ['X<sub>5</sub>', 'sales ÷ total assets'],
    ],
    note: 'Zones for this original model: below 1.81 distress, 1.81 to 2.99 grey, above 2.99 safe.',
  },
  example: {
    setup: 'A listed manufacturer has total assets of $1,000m, working capital of $150m, retained earnings of $300m, EBIT of $120m, sales of $1,100m, total liabilities of $500m, and shares worth $700m. Where does it fall?',
    steps: [
      'The ratios: X<sub>1</sub> = 0.15, X<sub>2</sub> = 0.30, X<sub>3</sub> = 0.12, X<sub>4</sub> = 700 ÷ 500 = 1.40, X<sub>5</sub> = 1.10.',
      'Weighted: 1.2 × 0.15 = 0.18; 1.4 × 0.30 = 0.42; 3.3 × 0.12 = 0.40; 0.6 × 1.40 = 0.84; 1.0 × 1.10 = 1.10.',
      'Z = 0.18 + 0.42 + 0.40 + 0.84 + 1.10 = <b>2.94</b>.',
      'That is between 1.81 and 2.99: the <b>grey zone</b>, just short of safe.',
    ],
    result: 'Not a distress signal, but not a clean bill of health either. Turnover and the market’s valuation of the equity carry most of the score; operating profit of 12% of assets is modest for the 3.3 weight it gets. Look closer at profitability and liquidity.',
  },
  mistake: {
    title: 'Mixing the two printed forms of the model',
    html: 'Altman’s 1968 paper wrote the first four ratios as percentages (15 for 15%), so its weights read 0.012, 0.014, 0.033 and 0.006, with 0.999 on sales ÷ assets. Using those weights with ratios written as decimals gives 1.12 for this company: a false distress signal. Use 1.2, 1.4, 3.3, 0.6 and 1.0 with decimals.',
  },
  remember: [
    'Original Z: below 1.81 distress, 1.81–2.99 grey, above 2.99 safe.',
    'EBIT ÷ total assets carries the largest weight, 3.3: earning power matters most for survival.',
    'Use Z′ for private firms and Z″ for non-manufacturers, each with its own cut-offs; none of them suit banks or insurers.',
  ],
  calc: {
    title: 'Score a manufacturer',
    intro: 'The original Z for a listed manufacturer. Enter each ratio as a decimal (0.15 for 15%).',
    inputs: [
      { id: 'x1', label: 'Working capital ÷ total assets', min: -0.3, max: 0.6, step: 0.01, value: 0.15, fmt: 'num', digits: 2 },
      { id: 'x2', label: 'Retained earnings ÷ total assets', min: -0.5, max: 0.8, step: 0.01, value: 0.3, fmt: 'num', digits: 2 },
      { id: 'x3', label: 'EBIT ÷ total assets', min: -0.2, max: 0.3, step: 0.01, value: 0.12, fmt: 'num', digits: 2 },
      { id: 'x4', label: 'Market value of equity ÷ total liabilities', min: 0, max: 4, step: 0.05, value: 1.4, fmt: 'num', digits: 2 },
      { id: 'x5', label: 'Sales ÷ total assets', min: 0, max: 3, step: 0.05, value: 1.1, fmt: 'num', digits: 2 },
    ],
    compute({ x1, x2, x3, x4, x5 }) {
      const xs = [x1, x2, x3, x4, x5], parts = xs.map((x, i) => x * Z.coef[i]);
      const z = parts.reduce((a, b) => a + b, 0), zn = zone(z, Z.cut);
      const top = parts.map((p, i) => ({ p, i })).sort((a, b) => Math.abs(b.p) - Math.abs(a.p))[0];
      const needX3 = (Z.cut[1] - (z - parts[2])) / Z.coef[2];
      return {
        headline: { value: `Z = ${F.num(z, 2)}`, label: `${zn} zone` },
        rows: [['Largest contribution', `${NAMES[top.i]} (${F.signed(top.p, 2)})`], ['EBIT ÷ assets needed for the safe zone, others unchanged', needX3 <= x3 ? 'already safe' : F.num(needX3, 2)], ['Share of the score from sales ÷ assets', z > 0 ? F.pct(parts[4] / z, 0) : '—']],
        note: zn === 'distress'
          ? 'The profile matches the companies that went bankrupt within two years in Altman’s samples. It is a prompt to look hard at liquidity and profitability, not a verdict.'
          : zn === 'grey'
            ? 'The grey zone: the model can’t separate this company from either group. Look closer at the ratios that pull the score down.'
            : parts[4] / z > 0.45
              ? 'Safe, but much of the score comes from asset turnover. For a retailer or service firm, use Z″, which leaves turnover out.'
              : 'Safe: firms like this rarely failed within two years in Altman’s samples.',
      };
    },
  },
  tool: { href: 'finance/risk/#altman', label: 'Altman Z-score, in Finance › Risk management' },
  checks: (() => {
    const parts = EX.map((x, i) => x * Z.coef[i]), z = parts.reduce((a, b) => a + b, 0);
    const old = [0.012, 0.014, 0.033, 0.006, 0.999].reduce((s, w, i) => s + w * EX[i], 0);
    return [
      { what: 'X4', value: EX[3], shown: 1.40, tol: 1e-9 },
      ...parts.map((p, i) => ({ what: `part ${i + 1}`, value: p, shown: [0.18, 0.42, 0.40, 0.84, 1.10][i], tol: 0.005 })),
      { what: 'Z', value: z, shown: 2.94, tol: 0.005 },
      { what: 'grey zone (1 = grey)', value: zone(z, Z.cut) === 'grey' ? 1 : 0, shown: 1, tol: 0 },
      { what: 'mistake: 1968 weights on decimals', value: old, shown: 1.12, tol: 0.005 },
      { what: 'mistake reads as distress (1 = distress)', value: zone(old, Z.cut) === 'distress' ? 1 : 0, shown: 1, tol: 0 },
      { what: 'Z″ cut-offs', value: ZPP.cut[0] + ZPP.cut[1], shown: 3.7, tol: 1e-9 },
    ];
  })(),
};
