// efficient-portfolios.ex.js — F06 · Efficient portfolios: widgets, practice and the knowledge check (answer keys live here).
// Fund returns come from case.js (SIMULATED monthly history; fictional funds); forward-looking expected returns use
// F05’s assumptions (MARKET) and the funds’ 2023–2027 betas. Every other fund and person named here is fictional.
import { SERIES, MONTHS, DERIVED, MARKET, RISK_PROFILE } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { moments } from '../../../core/portfolio.js?v=31';

const st = DERIVED.stats;
const MO = moments(['market', 'intl', 'bonds'].map((n) => SERIES[n]), 12);
const muC = [0, 1, 2].map((i) => IV.capm({ rf: MARKET.rf, beta: MO.cov[i][0] / MO.cov[0][0], mrp: MARKET.mrp }));   // betas from the same covariances
const pct = (x, d = 2) => `${x < 0 ? '−' : ''}${(Math.abs(x) * 100 + 1e-9).toFixed(d)}%`;
const i27 = MONTHS.indexOf('2027-01');
const cells27 = { A1: 'Month', B1: 'Total market', D1: 'Risk-free rate (a year)', E1: MARKET.rf, D3: 'Sharpe ratio (a year)' };
for (let k = 0; k < 12; k++) { cells27[`A${k + 2}`] = MONTHS[i27 + k]; cells27[`B${k + 2}`] = SERIES.market[i27 + k]; }

export const widgets = {
  'eff-history': {
    type: 'portfolio', mode: 'many', title: 'Ana’s three funds: the frontier from fifteen years of history',
    series: { 'Total market': SERIES.market, 'International': SERIES.intl, 'Bonds': SERIES.bonds },
    rf: st.bills.mean, y: 1, maxY: 1.5, show: ['frontier', 'cal', 'assets', 'weights'],
    note: 'Means, standard deviations and covariances from the simulated 2013–2027 monthly returns of the fictional Harbourline funds, annualised; the risk-free rate is the bills’ average over the same years (2.03%). Long-only: no fund can have a negative weight.',
  },
  'eff-forward': {
    type: 'portfolio', mode: 'many', title: 'The same funds with forward-looking expected returns',
    assets: [{ name: 'Total market', er: muC[0], sd: Math.sqrt(MO.cov[0][0]) }, { name: 'International', er: muC[1], sd: Math.sqrt(MO.cov[1][1]) }, { name: 'Bonds', er: muC[2], sd: Math.sqrt(MO.cov[2][2]) }],
    cov: MO.cov, rf: MARKET.rf, y: 1, maxY: 1.5, show: ['frontier', 'cal', 'assets', 'weights'],
    note: 'Expected returns 9.70%, 8.87% and 4.66%: the 4.2% risk-free rate plus each fund’s beta against the total-market fund (0.85 and 0.08, from the same 2013–2027 covariances) times a 5.5% market risk premium (F05’s assumptions). Standard deviations and covariances as in the first chart (simulated history). With returns set this way, the maximum-Sharpe portfolio is the total-market fund itself.',
  },
  'eff-choose': {
    type: 'formula', title: 'How much in the risky portfolio?',
    intro: 'Mean–variance utility U = E[r] − ½Aσ² along the capital allocation line. The starting values are the total-market fund with its forward-looking expected return (9.70%), its simulated standard deviation (16.00%) and Ana’s risk aversion of 3.',
    inputs: [
      { id: 'A', label: 'Risk-aversion coefficient A', min: 1, max: 10, step: 0.5, value: RISK_PROFILE.aversionA, fmt: 'num' },
      { id: 'er', label: 'Risky portfolio’s expected return', min: 2, max: 15, step: 0.01, value: 9.7, fmt: 'pct' },
      { id: 'sd', label: 'Risky portfolio’s standard deviation', min: 2, max: 30, step: 0.01, value: 16, fmt: 'pct' },
      { id: 'rf', label: 'Risk-free rate', min: 0, max: 8, step: 0.1, value: 4.2, fmt: 'pct' },
    ],
    compute: (v) => {
      const er = v.er / 100, s = v.sd / 100, rf = v.rf / 100;
      const y = IV.optimalRiskyShare({ rf, er, sd: s, A: v.A });
      const c = IV.cal({ y, rf, er, sd: s });
      const ys = Array.from({ length: 21 }, (_, k) => k / 10);
      const u = (yy) => { const q = IV.cal({ y: yy, rf, er, sd: s }); return q.er - 0.5 * v.A * q.sd ** 2; };
      const out = {
        headline: { label: 'Best share in the risky portfolio, y*', value: pct(y, 0) },
        rows: [
          ['Sharpe ratio of the risky portfolio', ((er - rf) / s).toFixed(3)],
          ['Expected return of the mix', pct(c.er)],
          ['Standard deviation of the mix', pct(c.sd)],
          ['Utility (certainty-equivalent return)', pct(u(y))],
        ],
        chart: { kind: 'line', x: { label: 'Share in the risky portfolio', values: ys }, series: [{ name: 'Utility (%)', values: ys.map((yy) => Math.round(u(yy) * 10000) / 100) }], y: { label: 'Utility (%)' } },
      };
      if (er <= rf) { out.note = 'The risky portfolio offers no more than the risk-free rate, so a risk-averse investor holds none of it (y* is zero or negative).'; out.error = 'Set the expected return above the risk-free rate.'; }
      else if (y > 1) out.note = `y* above 100% means borrowing ${pct(y - 1, 0)} of your own money at the risk-free rate. If you can’t borrow that cheaply, hold no safe asset and move up the efficient frontier instead.`;
      else out.note = `Hold ${pct(y, 0)} in the risky portfolio and ${pct(1 - y, 0)} in the safe asset. Doubling A would halve the risky share; the risky portfolio itself would not change.`;
      return out;
    },
  },
};

export const guided = [
  {
    id: 'f06-eff-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional fund adviser’s best risky portfolio has an expected return of 9% a year and a standard deviation of 15%. The risk-free rate is 4%.',
    solution: 'Sharpe ratio (9% − 4%) ÷ 15% = 0.333. With 70% in the portfolio: E = 4% + 0.7 × 5% = 7.5% and σ = 0.7 × 15% = 10.5%. To hold σ at 12%, y = 12 ÷ 15 = 0.8, giving E = 4% + 0.8 × 5% = 8%.',
    steps: [
      { id: 'f06-eff-g1-s1', type: 'num', prompt: 'What is the portfolio’s Sharpe ratio? Give three decimal places.',
        answer: 0.333, check: () => (0.09 - 0.04) / 0.15, unit: '', places: 3, tol: 0.002,
        hints: ['Sharpe = (expected return − risk-free rate) ÷ standard deviation.'],
        wrong: [{ value: 0.6, say: 'That divides the whole return, 9%, by 15%. Subtract the risk-free rate first.' }] },
      { id: 'f06-eff-g1-s2', type: 'num', prompt: 'A client puts 70% in the portfolio and 30% in the risk-free asset. What is her expected return? Give a percentage to one decimal place.',
        answer: 7.5, check: () => (0.04 + 0.7 * 0.05) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['E[r_C] = r_f + y(E[r_P] − r_f).', '4% + 0.7 × 5%.'],
        wrong: [{ value: 6.3, say: 'That is 0.7 × 9%, which leaves out the 30% earning the risk-free rate.' }] },
      { id: 'f06-eff-g1-s3', type: 'num', prompt: 'Another client wants a standard deviation of exactly 12%. What expected return can she have on this line? Give a percentage to one decimal place.',
        answer: 8.0, check: () => (0.04 + (0.12 / 0.15) * 0.05) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['σ_C = yσ_P, so y = 12% ÷ 15% = 0.8.', 'Or use the line directly: E = r_f + Sharpe × σ_C = 4% + 0.333 × 12%.'],
        wrong: [{ value: 7.2, say: 'That multiplies 9% by 0.8 and forgets the 20% in the risk-free asset.' }] },
    ],
  },
  {
    id: 'f06-eff-g2', type: 'num', kind: 'numerical',
    prompt: 'For the same portfolio (9% expected return, 15% standard deviation, risk-free 4%), what share should a client with a risk-aversion coefficient of 4 hold in it? Give a percentage to one decimal place.',
    answer: 55.6, check: () => IV.optimalRiskyShare({ rf: 0.04, er: 0.09, sd: 0.15, A: 4 }) * 100, unit: '%', places: 1, tol: 0.15,
    hints: ['y* = (E[r_P] − r_f) ÷ (Aσ²), all in decimals.', '0.05 ÷ (4 × 0.0225).'],
    wrong: [{ value: 8.3, say: 'You divided by Aσ rather than Aσ²: square the standard deviation.' }],
    solution: 'y* = 0.05 ÷ (4 × 0.15²) = 0.05 ÷ 0.09 = 0.556: 55.6% in the risky portfolio and 44.4% in the risk-free asset.',
  },
  {
    id: 'f06-eff-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Four fictional portfolios built from the same funds are shown. Which one is not efficient?',
    data: { table: { head: ['Portfolio', 'Expected return', 'Standard deviation'], align: ['l', 'r', 'r'], rows: [['P', '6.0%', '7.0%'], ['Q', '7.5%', '10.0%'], ['R', '7.0%', '11.0%'], ['S', '9.0%', '14.0%']] } },
    options: ['R', 'P', 'Q', 'S'],
    answer: 0,
    hints: ['Look for a portfolio that another one beats on both counts.', 'Compare R with Q.'],
    feedback: {
      1: 'P has the lowest risk; nothing in the table has both a higher return and lower risk than P.',
      2: 'Q is not beaten by any other: R has more risk and less return than Q.',
      3: 'S has the highest return; it is riskier, but nothing offers more return.',
    },
    solution: 'Q has a higher expected return (7.5% against 7.0%) and a lower standard deviation (10% against 11%) than R, so R lies below the frontier and no one who prefers return and dislikes risk would hold it.',
  },
  {
    id: 'f06-eff-g4', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds the total-market fund’s simulated monthly returns for 2027 and an annual risk-free rate in E1. In E3, write a formula for the fund’s annualised Sharpe ratio over the year: the mean monthly return × 12, less the risk-free rate, divided by the monthly standard deviation × √12.',
    sheet: { cells: cells27, vary: { E1: [0.03, 0.05] } },
    cell: 'E3', view: 'A1:E13', widths: { A: 10, B: 13, D: 22, E: 10 }, formats: { B: '0.00%', E1: '0.0%', E3: '0.00' },
    answer: '=(AVERAGE(B2:B13)*12-E1)/(STDEV.S(B2:B13)*SQRT(12))',
    alt: ['=(12*AVERAGE(B2:B13)-E1)/(SQRT(12)*STDEV.S(B2:B13))', '=(AVERAGE(B2:B13)*12-E1)/STDEV.S(B2:B13)/SQRT(12)', '=(AVERAGE(B2:B13)-E1/12)/STDEV.S(B2:B13)*SQRT(12)'],
    require: ['AVERAGE', 'STDEV.S'],
    wrong: [
      { formula: '=(AVERAGE(B2:B13)*12-E1)/(STDEV.S(B2:B13)*12)', say: 'Standard deviation scales with the square root of time: multiply the monthly SD by √12, not 12.' },
      { formula: '=(AVERAGE(B2:B13)-E1)/STDEV.S(B2:B13)', say: 'E1 is an annual rate and the returns are monthly. Annualise the mean (× 12) and the SD (× √12) first.' },
      { formula: '=AVERAGE(B2:B13)*12/(STDEV.S(B2:B13)*SQRT(12))', say: 'That leaves out the risk-free rate: the Sharpe ratio uses the return above it.' },
    ],
    hints: ['AVERAGE(B2:B13)*12 is the annual mean; STDEV.S(B2:B13)*SQRT(12) the annual standard deviation.', '=(AVERAGE(B2:B13)*12−E1)/(STDEV.S(B2:B13)*SQRT(12)).'],
    solution: '<x>=(AVERAGE(B2:B13)*12-E1)/(STDEV.S(B2:B13)*SQRT(12))</x> gives 1.07 for 2027 with a 4.2% risk-free rate: a good year. One year’s Sharpe ratio says little about the next; the fifteen-year figure, 0.525 against the bills’ average, is a steadier guide.',
  },
];

export const independent = [
  {
    id: 'f06-eff-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional hedge-fund client borrows at the risk-free rate of 3% to hold 140% of her capital in a portfolio with an expected return of 10% and a standard deviation of 20%. What is her expected return? Give a percentage to one decimal place.',
    answer: 12.8, check: () => IV.cal({ y: 1.4, rf: 0.03, er: 0.10, sd: 0.2 }).er * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 14, say: 'That is 1.4 × 10% without paying interest on the 40% borrowed: E = 3% + 1.4 × (10% − 3%).' }],
    solution: 'E = 3% + 1.4 × (10% − 3%) = 3% + 9.8% = 12.8%. Her standard deviation is 1.4 × 20% = 28%: borrowing scales up risk and excess return together.',
  },
  {
    id: 'f06-eff-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional balanced fund has an expected return of 8% and a standard deviation of 12%. What is its mean–variance utility for an investor with A = 5? Give a percentage to one decimal place.',
    answer: 4.4, check: () => (0.08 - 0.5 * 5 * 0.12 ** 2) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: -352, say: 'Use decimals: 0.08 − 2.5 × 0.12² = 0.044, not 8 − 2.5 × 144.' }, { value: 6.56, say: 'That subtracts σ² once. The penalty is ½ × A × σ² = 2.5 × 0.0144.' }],
    solution: 'U = 0.08 − ½ × 5 × 0.0144 = 0.08 − 0.036 = 0.044, or 4.4%: this investor would be as happy with a certain 4.4% as with the fund.',
  },
  {
    id: 'f06-eff-i3', type: 'num', kind: 'numerical',
    prompt: 'Using forward-looking figures for the total-market fund alone (expected return 9.7%, standard deviation 16%) and a 4.2% risk-free rate, what share would an investor with A = 2 hold in it? Give a percentage to one decimal place.',
    answer: 107.4, check: () => IV.optimalRiskyShare({ rf: 0.042, er: 0.097, sd: 0.16, A: 2 }) * 100, unit: '%', places: 1, tol: 0.2,
    wrong: [{ value: 17.2, say: 'That divides by Aσ. Square the standard deviation: y* = 0.055 ÷ (2 × 0.0256).' }],
    solution: 'y* = 0.055 ÷ (2 × 0.16²) = 0.055 ÷ 0.0512 = 1.074: she would borrow 7.4% of her capital to hold 107.4% in the fund. Without borrowing she would hold 100%.',
  },
  {
    id: 'f06-eff-i4', type: 'mc', kind: 'conceptual',
    prompt: 'An optimiser run on fifteen years of returns puts 80% of a portfolio in bonds. A colleague raises the bond fund’s expected return by one percentage point, less than its standard error, and the bond weight jumps to about 90%. What does this show?',
    options: [
      'Optimised weights are very sensitive to imprecise expected returns',
      'The bond fund’s standard error must have been calculated wrongly',
      'Bonds are the best asset and the optimiser has found it correctly',
      'Correlations, not expected returns, are the main source of the instability in the weights',
    ],
    answer: 0,
    feedback: {
      1: 'A one-point change within one standard error is ordinary sampling noise; the calculation can be right and the result still fragile.',
      2: 'The optimiser has only found the best mix for these estimates. Change them by an amount you can’t rule out and the answer changes.',
      3: 'Correlations matter too, but here only an expected return changed. Expected returns are the hardest input to estimate and the one optimisers are most sensitive to.',
    },
    solution: 'Optimisers treat estimates as exact and lean on whatever looks best, so small, statistically meaningless changes in expected returns move the weights a lot. Model-based expected returns, constraints and judgement reduce the problem.',
  },
  {
    id: 'f06-eff-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Separation splits portfolio choice into two decisions. Which decision does each consideration belong to?',
    items: [
      'The expected returns, standard deviations and correlations of the funds',
      'The investor’s risk-aversion coefficient',
      'When the investor will need the money',
      'Finding the mix of funds with the highest Sharpe ratio',
      'How large a fall in one year the investor could live with',
    ],
    categories: ['Which risky portfolio (the same for everyone who agrees on the inputs)', 'How much to hold in it (personal)'],
    answer: [0, 1, 1, 0, 1],
    feedback: {
      0: 'The inputs to the frontier don’t depend on who is investing.',
      1: 'A sets how far along the capital allocation line the investor goes.',
      2: 'The horizon decides how much risk the investor can afford to carry.',
      3: 'The maximum-Sharpe portfolio is found before anything personal enters.',
      4: 'A worst-year limit is a personal check on the share in the risky portfolio.',
    },
    solution: 'The risky portfolio depends only on the assets’ characteristics and the risk-free rate; the share held in it depends on the investor’s risk aversion, horizon and capacity for loss.',
  },
  {
    id: 'f06-eff-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional fund has ten years of monthly returns with a monthly standard deviation of 5%. What is the standard error of its annualised mean return (the monthly standard error × 12)? Give a percentage to two decimal places.',
    answer: 5.48, check: () => 0.05 / Math.sqrt(120) * 12 * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 0.46, say: 'That is the monthly standard error, 5% ÷ √120. Multiply by 12 for the annual mean.' }],
    solution: 'Monthly SE = 5% ÷ √120 = 0.456%; annual = 12 × 0.456% = 5.48%. A 95% interval for the fund’s expected return is about ±11 points wide each way: ten years tell you little about it.',
  },
];

export const check = [
  {
    id: 'f06-eff-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the maximum-Sharpe portfolio the best risky portfolio to combine with a risk-free asset?',
    options: [
      'Its line with the risk-free asset is the steepest, giving the most return at every level of risk',
      'It has the lowest standard deviation on the frontier, so cautious and bold investors can both use it unchanged',
      'It has the highest expected return of any portfolio on the frontier, which every investor prefers',
      'It is the only portfolio that contains every asset available to the investor',
    ],
    answer: 0,
    feedback: {
      1: 'That is the minimum-variance portfolio. The maximum-Sharpe one usually has more risk than that.',
      2: 'The highest-return portfolio is usually 100% in one asset. More return can be had more efficiently by holding more of the maximum-Sharpe portfolio.',
      3: 'It may leave some assets out entirely: with CAPM-based expected returns the optimiser holds only the total-market fund.',
    },
    solution: 'Every mix with the risk-free asset lies on a straight line whose slope is the risky portfolio’s Sharpe ratio. The steepest line dominates all others at every level of risk; investors then choose a point on it.',
  },
  {
    id: 'f06-eff-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional property fund averaged 7.2% a year with a standard deviation of 9% over a period when bills averaged 1.8%. What was its Sharpe ratio? Give two decimal places.',
    answer: 0.60, check: () => (0.072 - 0.018) / 0.09, unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 0.8, say: 'That divides the whole 7.2% by 9%. Use the return above bills: 5.4%.' }],
    solution: '(7.2% − 1.8%) ÷ 9% = 5.4 ÷ 9 = 0.60.',
  },
  {
    id: 'f06-eff-k3', type: 'num', kind: 'applied',
    prompt: 'Ana considers the total-market fund plus a safe account. With forward-looking figures (expected return 9.7%, standard deviation 16%, risk-free 4.2%) and her risk aversion of 3, what share should she put in the fund? Give a percentage to one decimal place.',
    answer: 71.6, check: () => IV.optimalRiskyShare({ rf: 0.042, er: 0.097, sd: 0.16, A: RISK_PROFILE.aversionA }) * 100, unit: '%', places: 1, tol: 0.2,
    wrong: [{ value: 11.5, say: 'That divides by Aσ (3 × 0.16). Square the standard deviation: y* = 0.055 ÷ (3 × 0.0256).' }, { value: 107.4, say: 'That uses A = 2. Ana’s coefficient is 3.' }],
    solution: 'y* = 0.055 ÷ (3 × 0.16²) = 0.055 ÷ 0.0768 = 0.716: about 72% in the fund and 28% in the safe account. With CAPM-based expected returns measured against this fund, it is also the maximum-Sharpe portfolio, so this is the same answer the lesson’s forward-looking optimiser gives.',
  },
  {
    id: 'f06-eff-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements are true? Select all that apply.',
    options: [
      'Mixing a risky portfolio with a risk-free asset changes its standard deviation but not its Sharpe ratio.',
      'A more risk-averse investor should hold a different, safer mix of risky assets.',
      'Fifteen years of monthly returns pin down the market’s expected return to within about half a percentage point.',
      'If y* is above 1 and the investor can’t borrow, she should move up the efficient frontier instead.',
      'Historical average returns should be compared with the historical average risk-free rate, not today’s.',
    ],
    answer: [0, 3, 4],
    feedback: {
      1: 'Under separation everyone holds the same risky portfolio; a cautious investor holds less of it and more of the safe asset.',
      2: 'The standard error of the annual mean was about 4 points in the simulated data; a 95% interval is about ±8 points.',
    },
    solution: 'True: mixing with bills slides along a line of constant slope; without borrowing, move up the frontier; compare like with like. False: the risky mix is the same for all; history leaves expected returns very uncertain.',
  },
  {
    id: 'f06-eff-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana’s flat deposit, about $60,000, is due in April 2032. Her analysis points to a mostly-shares mix for her retirement account. Where should the deposit savings go?',
    options: [
      'A safe savings account, since it is needed within a few years',
      'The same mostly-shares mix, as it is the efficient choice for her risk aversion',
      'Mostly shares, as their higher expected return should usually win over four years',
      'The bond index fund, as its losses in the simulated history were small',
    ],
    answer: 0,
    feedback: {
      1: 'The efficient mix was chosen for 30-year money. Over four years a 2022-type year (the 80/20 shares-and-bonds mix lost 24.1% in the simulated data) could leave her short when she must pay.',
      2: 'Higher expected return comes with a wide spread of outcomes over a short horizon.',
      3: 'The simulated bond fund lost 13% in 2022: not small for money that must be there on a known date.',
    },
    solution: 'The horizon and purpose of the money come before the frontier. Money for a known payment soon belongs in safe assets; the efficient-portfolio analysis applies to her long-term account.',
  },
  {
    id: 'f06-eff-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional investor holds 60% in a risky portfolio and 40% in bills. In a bad year the risky portfolio returns −30% and bills 4%. What does her whole portfolio return? Give a percentage to one decimal place.',
    answer: -16.4, check: () => (0.6 * -0.30 + 0.4 * 0.04) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: -18, say: 'That counts the risky part only; the 40% in bills still earns 4%.' }, { value: -30, say: 'Only 60% of the money is in the risky portfolio.' }],
    solution: '0.6 × (−30%) + 0.4 × 4% = −18% + 1.6% = −16.4%. Scaling y is how to bring a worst-year loss inside a limit.',
  },
];
