// capm-and-beta.ex.js — F06 · The CAPM and beta: widgets, practice and the knowledge check (answer keys live here).
// Returns from case.js (SIMULATED monthly history; fictional funds and companies); F05’s assumptions from MARKET.
// Every other company and fund named here is fictional.
import { SERIES, MONTHS, LAST60, MARKET } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { tInv } from '../../../core/inference.js?v=31';

const { rf, mrp } = MARKET;
const L = (k) => SERIES[k].slice(LAST60.from);
const exPct = (k) => L(k).map((v, i) => Math.round((v - L('bills')[i]) * 1e6) / 1e4);   // excess return in %, 4 dp
const pct = (x, d = 2) => `${x < 0 ? '−' : ''}${(Math.abs(x) + 1e-9).toFixed(d)}%`;
const months60 = MONTHS.slice(LAST60.from);
const sheetH = { A1: 'Month', B1: 'Market excess', C1: 'Harbour Street excess', E1: 'Beta' };
months60.forEach((m, k) => { sheetH[`A${k + 2}`] = m; sheetH[`B${k + 2}`] = L('market')[k] - L('bills')[k]; sheetH[`C${k + 2}`] = L('harbour')[k] - L('bills')[k]; });

export const widgets = {
  'capm-regression': {
    type: 'regression', title: 'Morrow & Pike against the market: monthly excess returns (%), 2023–2027 (simulated)',
    y: { name: 'Morrow & Pike excess (%)', values: exPct('morrow') },
    xs: [{ name: 'Market excess (%)', values: exPct('market') }],
    picked: [0],
    note: 'Excess return = the month’s total return minus the one-month bill return, in per cent. The X coefficient is beta (0.90), the intercept is alpha in per cent a month (zero), and R Square is the share of the variance that moves with the market (0.27). The data are simulated for teaching and were built so that this beta equals F05’s; Morrow &amp; Pike is fictional.',
  },
  'capm-sml': {
    type: 'formula', title: 'The security market line',
    intro: 'Required return = risk-free rate + beta × market risk premium. Compare an analyst’s forecast with it. The starting values are Morrow &amp; Pike’s beta and F05’s assumptions.',
    inputs: [
      { id: 'beta', label: 'Beta', min: 0, max: 2.5, step: 0.05, value: 0.9, fmt: 'num' },
      { id: 'rf', label: 'Risk-free rate', min: 0, max: 8, step: 0.1, value: 4.2, fmt: 'pct' },
      { id: 'mrp', label: 'Market risk premium', min: 2, max: 9, step: 0.1, value: 5.5, fmt: 'pct' },
      { id: 'fc', label: 'Analyst’s forecast return', min: 0, max: 25, step: 0.25, value: 10, fmt: 'pct' },
    ],
    compute: (v) => {
      const req = v.rf + v.beta * v.mrp, a = v.fc - req;
      const bs = Array.from({ length: 11 }, (_, k) => k / 4);
      return {
        headline: { label: 'Required return (CAPM)', value: pct(req) },
        rows: [
          ['Market’s expected return (beta 1)', pct(v.rf + v.mrp)],
          ['Forecast alpha (forecast − required)', pct(a)],
          ['Premium for this share’s market risk', pct(v.beta * v.mrp)],
        ],
        note: Math.abs(a) < 0.005 ? 'The forecast lies on the security market line: the share is fairly priced for its market risk.'
          : a > 0 ? `The forecast plots ${pct(a)} above the line: if it is right, the share is cheap for its risk and its price should rise until the expected return falls to ${pct(req)}.`
            : `The forecast plots ${pct(-a)} below the line: the share offers too little for its market risk, so it looks expensive.`,
        chart: { kind: 'line', x: { label: 'Beta', values: bs }, series: [{ name: 'SML', values: bs.map((b) => Math.round((v.rf + b * v.mrp) * 100) / 100) }, { name: 'Forecast', values: bs.map(() => v.fc) }], y: { label: 'Expected return (%)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f06-capm-g1', type: 'steps', kind: 'numerical',
    prompt: 'Regressing a fictional software company’s 60 monthly excess returns on the market’s gives a slope of 1.15 with a standard error of 0.25, and an R² of 0.30. Use a 4.2% risk-free rate and a 5.5% market risk premium; the 95% critical t-value with 58 degrees of freedom is 2.0017.',
    solution: 'Interval: 1.15 ± 2.0017 × 0.25 = 1.15 ± 0.50, from 0.65 to 1.65. Required return: 4.2% + 1.15 × 5.5% = 10.53%. R² = 0.30 means 30% of the variance moves with the market; 70% is specific and would be diversified away.',
    steps: [
      { id: 'f06-capm-g1-s1', type: 'num', prompt: 'What is the lower end of a 95% confidence interval for beta? Give two decimal places.',
        answer: 0.65, check: () => 1.15 - tInv(0.975, 58) * 0.25, unit: '', places: 2, tol: 0.005,
        hints: ['β̂ − t × SE.', '1.15 − 2.0017 × 0.25.'],
        wrong: [{ value: 0.9, say: 'That subtracts one standard error. A 95% interval uses about two: 2.0017 × 0.25.' }] },
      { id: 'f06-capm-g1-s2', type: 'num', prompt: 'What is the CAPM required return at the estimated beta? Give a percentage to two decimal places.',
        answer: 10.53, check: () => IV.capm({ rf, beta: 1.15, mrp }) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['r_f + β × MRP.'],
        wrong: [{ value: 11.16, say: 'That multiplies the market’s whole return (4.2% + 5.5%) by beta. Beta scales only the premium.' }, { value: 6.33, say: 'That is the premium for market risk alone (1.15 × 5.5%). Add the risk-free rate.' }] },
      { id: 'f06-capm-g1-s3', type: 'mc', prompt: 'What does the R² of 0.30 tell you?',
        options: ['30% of its variance moves with the market; 70% is specific', 'The estimated beta will turn out to be wrong in about 70% of future months', 'The company’s required return should be 30% of the market’s', 'The share will rise 0.30% when the market rises 1%'],
        answer: 0,
        hints: ['R² is a share of variance explained.'],
        feedback: { 1: 'R² says how much of the variation the line explains, not how often the estimate is wrong; a low R² does make beta less precise.', 2: 'The required return comes from beta, not R².', 3: 'That would be a beta of 0.30. The slope here is 1.15.' } },
    ],
  },
  {
    id: 'f06-capm-g2', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds 60 months (2023–2027, simulated) of the market’s excess return (B) and Harbour Street’s (C). In E2, write a formula for Harbour Street’s beta.',
    sheet: { cells: sheetH },
    cell: 'E2', view: 'A1:E61', widths: { A: 10, B: 14, C: 20, E: 10 }, formats: { B: '0.00%', C: '0.00%', E2: '0.00' },
    answer: '=SLOPE(C2:C61,B2:B61)',
    alt: ['=COVARIANCE.S(B2:B61,C2:C61)/VAR.S(B2:B61)', '=COVARIANCE.S(C2:C61,B2:B61)/VAR.S(B2:B61)', '=CORREL(B2:B61,C2:C61)*STDEV.S(C2:C61)/STDEV.S(B2:B61)'],
    wrong: [
      { formula: '=SLOPE(B2:B61,C2:C61)', say: 'SLOPE takes the y range first. Beta is the slope of the share’s excess return (y, column C) on the market’s (x, column B).' },
      { formula: '=CORREL(B2:B61,C2:C61)', say: 'That is the correlation. Beta is the correlation times the share’s standard deviation divided by the market’s.' },
      { formula: '=COVARIANCE.S(B2:B61,C2:C61)/VAR.S(C2:C61)', say: 'Divide by the market’s variance, not the share’s.' },
    ],
    hints: ['SLOPE(known_y’s, known_x’s).', '=SLOPE(C2:C61, B2:B61).'],
    solution: '<x>=SLOPE(C2:C61,B2:B61)</x> gives 1.25. The same number is the covariance divided by the market’s variance: <x>=COVARIANCE.S(B2:B61,C2:C61)/VAR.S(B2:B61)</x>.',
  },
  {
    id: 'f06-capm-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional small-company fund averaged 12.4% a year over ten years, with a beta of 1.1. Bills averaged 2.0% and the market 10.0%. What was its Jensen’s alpha? Give a percentage to one decimal place.',
    answer: 1.6, check: () => IV.jensenAlpha(0.124, 0.02, 1.1, 0.10) * 100, unit: '%', places: 1, tol: 0.05,
    hints: ['CAPM return: 2.0% + 1.1 × (10.0% − 2.0%).', '12.4% − 10.8%.'],
    wrong: [{ value: 2.4, say: 'That compares the fund with the market (12.4% − 10.0%) without allowing for its beta of 1.1.' }, { value: 1.4, say: 'That multiplies the market’s whole return by beta (1.1 × 10%). Beta scales only the market’s excess return.' }],
    solution: 'CAPM return = 2.0% + 1.1 × 8.0% = 10.8%. Alpha = 12.4% − 10.8% = 1.6% a year. Before calling it skill, check its standard error.',
  },
  {
    id: 'f06-capm-g4', type: 'mc', kind: 'conceptual',
    prompt: 'With a 4.2% risk-free rate and a 5.5% market risk premium, an analyst forecasts 8% a year for a fictional water utility with a beta of 0.8. Where does it plot, and what does that suggest?',
    options: ['0.6 points below the SML: it looks overpriced for its market risk', '0.6 points above the SML: it looks underpriced', 'On the SML, since a beta below 1 should earn less than the market', '3.8 points above the SML, because 8% is well above the risk-free rate'],
    answer: 0,
    hints: ['Required return: 4.2% + 0.8 × 5.5%.', '8.6% required against 8% forecast.'],
    feedback: {
      1: 'Check the sign: the forecast (8%) is below the required 8.6%.',
      2: 'A beta of 0.8 should earn less than the market, but exactly 4.2% + 0.8 × 5.5% = 8.6%, not 8%.',
      3: 'The comparison is with the required return at its beta, not with the risk-free rate.',
    },
    solution: 'Required = 4.2% + 0.8 × 5.5% = 8.6%. The forecast is 0.6 points lower: a negative forecast alpha. If the forecast is right, the price is too high for the share’s market risk.',
  },
];

export const independent = [
  {
    id: 'f06-capm-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional electricity network company has a beta of 0.6. With a 4.2% risk-free rate and a 5.5% market risk premium, what is its required return? Give a percentage to one decimal place.',
    answer: 7.5, check: () => IV.capm({ rf, beta: 0.6, mrp }) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 3.3, say: 'That is the premium alone, 0.6 × 5.5%. Add the risk-free rate.' }],
    solution: '4.2% + 0.6 × 5.5% = 4.2% + 3.3% = 7.5%.',
  },
  {
    id: 'f06-capm-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline’s excess returns have an annual covariance of 0.0270 with the market’s, and the market’s standard deviation is 15%. What is its beta? Give two decimal places.',
    answer: 1.20, check: () => IV.betaCov(0.027, 0.15 ** 2), unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 0.18, say: 'That divides by the standard deviation. Beta divides the covariance by the market’s variance: 0.15² = 0.0225.' }],
    solution: 'β = cov ÷ σ_M² = 0.0270 ÷ 0.0225 = 1.20.',
  },
  {
    id: 'f06-capm-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional dividend fund averaged 9.5% a year with a beta of 0.8, while bills averaged 2.5%. What is its Treynor ratio? Give a percentage to two decimal places.',
    answer: 8.75, check: () => IV.treynor(0.095, 0.025, 0.8) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 11.88, say: 'That divides the whole return by beta. Use the excess return: 9.5% − 2.5% = 7.0%.' }, { value: 5.6, say: 'That multiplies by beta; Treynor divides by it.' }],
    solution: '(9.5% − 2.5%) ÷ 0.8 = 7.0% ÷ 0.8 = 8.75%: excess return per unit of market risk.',
  },
  {
    id: 'f06-capm-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional mining share has a standard deviation of 30% a year and a beta of 1.2; the market’s standard deviation is 15%. What is the standard deviation of its specific (unsystematic) risk? Give a percentage to one decimal place.',
    answer: 24.0, check: () => Math.sqrt(0.3 ** 2 - (1.2 * 0.15) ** 2) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 12, say: 'That subtracts standard deviations (30% − 18%). Variances add, not standard deviations: √(0.09 − 0.0324).' }, { value: 18, say: 'That is the systematic part, 1.2 × 15%.' }],
    solution: 'Systematic: 1.2 × 15% = 18%. Specific variance = 0.30² − 0.18² = 0.09 − 0.0324 = 0.0576; specific SD = 24.0%. R² = 0.0324 ÷ 0.09 = 0.36.',
  },
  {
    id: 'f06-capm-i5', type: 'classify', kind: 'applied',
    prompt: 'Which measure fits each evaluation best?',
    items: [
      'An individual choosing a single fund to hold as her whole retirement savings',
      'A pension plan adding one specialist manager to a portfolio of twenty others',
      'Ranking balanced funds that each make up all of an investor’s risky money',
      'Judging a share that will be one of 300 holdings in a large fund',
    ],
    categories: ['Sharpe ratio (total risk)', 'Treynor ratio or alpha (market risk)'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'A whole portfolio’s investor bears all its risk, specific included.',
      1: 'Most of the specialist’s specific risk will be diversified among twenty others.',
      2: 'Each fund is the investor’s whole risky holding, so total risk is what counts.',
      3: 'One holding in 300: its specific risk is diversified; its beta is what it adds.',
    },
    solution: 'Use the Sharpe ratio when the portfolio is all the investor holds; use Treynor or alpha when the asset will sit inside a diversified portfolio.',
  },
  {
    id: 'f06-capm-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Two data services quote Morrow &amp; Pike’s beta as 0.82 and 1.01, and Ana’s own regression gives 0.90. Which explanation is most likely?',
    options: [
      'Different periods, frequencies or indexes, and each has a standard error near 0.2',
      'One of the services must have made an error, because a company has one true beta',
      'Beta changes every month, so only the most recent estimate is meaningful',
      'The services must be quoting unlevered betas, while Ana’s own regression on share returns gives a levered one',
    ],
    answer: 0,
    feedback: {
      1: 'Different reasonable choices give different estimates, all within each other’s confidence intervals.',
      2: 'Betas can drift, but one month’s data says almost nothing; longer windows are more reliable.',
      3: 'Regression on share returns gives the levered (equity) beta; services quote the same kind.',
    },
    solution: 'OpenStax notes that betas differ by source because of the period, frequency and index used. With a standard error near 0.2, 0.82, 0.90 and 1.01 are all consistent with each other.',
  },
];

export const check = [
  {
    id: 'f06-capm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'According to the CAPM, why does a share’s expected return depend on its beta rather than its standard deviation?',
    options: [
      'Diversified investors are paid only for the market risk that beta measures',
      'Beta is easier to estimate precisely than standard deviation',
      'Shares with high standard deviations always have high betas too, so the two measures always rank shares the same way',
      'Standard deviation measures past risk while beta measures future risk',
    ],
    answer: 0,
    feedback: {
      1: 'Beta is, if anything, harder to estimate; its standard error is large.',
      2: 'Morrow &amp; Pike has a high standard deviation and a beta below 1: the two can disagree sharply.',
      3: 'Both are estimated from past data and both are used as forecasts.',
    },
    solution: 'Unsystematic risk disappears in a diversified portfolio, so no premium is needed to induce investors to bear it. What remains, and must be rewarded, is the asset’s contribution to market risk: its beta.',
  },
  {
    id: 'f06-capm-k2', type: 'num', kind: 'numerical',
    prompt: 'In a fictional market the risk-free rate is 3.5% and the market risk premium 6%. What is the required return on a share with a beta of 1.4? Give a percentage to one decimal place.',
    answer: 11.9, check: () => IV.capm({ rf: 0.035, beta: 1.4, mrp: 0.06 }) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 13.3, say: 'That multiplies the market’s whole return (9.5%) by beta. Only the premium is scaled.' }],
    solution: '3.5% + 1.4 × 6% = 3.5% + 8.4% = 11.9%.',
  },
  {
    id: 'f06-capm-k3', type: 'num', kind: 'numerical',
    prompt: 'A five-year monthly regression gives a fictional retailer a beta of 0.75 with a standard error of 0.15. What is the upper end of a 95% confidence interval (t = 2.0017)? Give two decimal places.',
    answer: 1.05, check: () => 0.75 + tInv(0.975, 58) * 0.15, unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 0.9, say: 'That adds one standard error; a 95% interval adds about two.' }],
    solution: '0.75 + 2.0017 × 0.15 = 0.75 + 0.30 = 1.05. The data can’t rule out an average-risk share.',
  },
  {
    id: 'f06-capm-k4', type: 'multi', kind: 'conceptual',
    prompt: 'A regression of a share’s monthly excess returns on the market’s gives: intercept 0.10% (standard error 0.60%), slope 1.30 (standard error 0.22), R² 0.38. Which statements are justified? Select all that apply.',
    options: [
      'The share’s estimated beta is 1.30.',
      'The share has shown significant skill-based outperformance of 0.10% a month.',
      'About 62% of the variance of its excess return is specific to the company.',
      'The share is less risky than the market because its R² is below 1.',
    ],
    answer: [0, 2],
    feedback: {
      1: 'The intercept is a sixth of its standard error (t ≈ 0.17): no evidence of alpha at all.',
      3: 'R² measures how much of its variance moves with the market, not how risky it is. Its beta, 1.30, is above the market’s.',
    },
    solution: 'Beta is the slope, 1.30. 1 − R² = 0.62 is the specific share of variance. The intercept is not significant; a low R² does not mean low risk.',
  },
  {
    id: 'f06-capm-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional fund manager reports an average return of 8.9% a year over a period when bills averaged 2.0% and the market 9.6%. The fund’s beta is 0.95. What was its Jensen’s alpha? Give a percentage to two decimal places.',
    answer: -0.32, check: () => IV.jensenAlpha(0.089, 0.02, 0.95, 0.096) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: -0.7, say: 'That compares the fund with the market (8.9% − 9.6%) without adjusting for its lower beta.' }, { value: -0.22, say: 'That multiplies the market’s whole return by beta (0.95 × 9.6% = 9.12%). Use 2.0% + 0.95 × 7.6%.' }],
    solution: 'CAPM return: 2.0% + 0.95 × (9.6% − 2.0%) = 9.22%. Alpha = 8.9% − 9.22% = −0.32% a year.',
  },
  {
    id: 'f06-capm-k6', type: 'mc', kind: 'applied',
    prompt: 'Ana’s regression gives Morrow &amp; Pike a beta of 0.90 with a 95% interval of 0.51 to 1.29. What should she do when she needs its cost of equity?',
    options: [
      'Report a range and cross-check it, for example with peers’ betas, rather than rely on 0.90 alone',
      'Use 0.90 exactly, since the regression is the best estimate and the interval is only a formality',
      'Use 1.29 to be safe, because a higher discount rate always gives a better decision',
      'Abandon the CAPM because the interval includes 1',
    ],
    answer: 0,
    feedback: {
      1: '0.90 is the best single estimate, but the interval shows the required return could be anywhere from about 7.0% to 11.3%; decisions should allow for that.',
      2: 'A deliberately high rate is not conservative for every decision: it can reject good projects or understate values.',
      3: 'Wide intervals are normal for single shares; averaging peers and using longer windows narrows them.',
    },
    solution: 'Report the point estimate with its range, check it against peers (as F05 did for Lantern) and a longer window (0.94 over fifteen years), and show how the answer changes across the range.',
  },
];
