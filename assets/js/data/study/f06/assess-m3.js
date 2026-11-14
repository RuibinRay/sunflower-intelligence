// assess-m3.js — F06 module 3 test: Portfolios and the market (diversification, efficient-portfolios, capm-and-beta,
// funds-and-indexing). No hints. Each item has a full solution, shown when the student reviews the test. New questions,
// not copies of the lesson exercises. Every business, fund and person named here is fictional; items 2, 6 and 12 refer
// to the course’s simulated data or its fictional funds.
import { MARKET, ASSETS } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const { rf, mrp } = MARKET;
// item 9: twelve months of fictional excess returns (decimals)
const MKT = [0.021, -0.034, 0.015, 0.042, -0.011, 0.008, 0.027, -0.052, 0.019, 0.033, -0.006, 0.012];
const FUND = [0.024, -0.027, 0.011, 0.045, -0.006, 0.014, 0.022, -0.041, 0.024, 0.029, 0.001, 0.009];
const cells9 = { A1: 'Month', B1: 'Market excess', C1: 'Fund excess', E1: 'Alpha (a month)' };
MKT.forEach((v, i) => { cells9[`A${i + 2}`] = i + 1; cells9[`B${i + 2}`] = v; cells9[`C${i + 2}`] = FUND[i]; });

export const items = [
  {
    id: 'f06-m3-1', lesson: 'diversification', type: 'num', kind: 'numerical',
    prompt: 'A fictional investor holds 40% in a gold-mining fund (standard deviation 25% a year) and 60% in a government bond fund (10%). Their correlation is −0.2. What is the portfolio’s standard deviation? Give a percentage to two decimal places.',
    answer: 10.58, check: () => IV.twoAsset({ w: 0.4, ra: 0, rb: 0, sa: 0.25, sb: 0.10, corr: -0.2 }).sd * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: 16, say: 'That is the weighted average of the standard deviations, which applies only at a correlation of +1.' },
      { value: 11.66, say: 'That leaves out the covariance term. With a negative correlation it subtracts: 2 × 0.4 × 0.6 × (−0.2) × 0.25 × 0.10.' },
    ],
    solution: 'σ² = 0.16 × 0.0625 + 0.36 × 0.01 + 2 × 0.4 × 0.6 × (−0.2) × 0.25 × 0.10 = 0.01 + 0.0036 − 0.0024 = 0.0112; σ = 10.58%. The portfolio is barely riskier than the bond fund alone, though 40% of it is in a fund two and a half times as volatile.',
  },
  {
    id: 'f06-m3-2', lesson: 'diversification', type: 'mc', kind: 'conceptual',
    prompt: 'An investor already holds 30 shares spread across industries. Which change is most likely to lower her portfolio’s standard deviation substantially?',
    options: [
      'Moving part of the money into a fund of high-quality bonds',
      'Adding a 31st share from an industry she doesn’t yet hold',
      'Replacing her five most volatile shares with five others of average volatility from the same industries',
      'Spreading the same 30 shares more evenly by value',
    ],
    answer: 0,
    feedback: {
      1: 'With 30 shares almost all the unsystematic risk is already gone; one more share removes very little.',
      2: 'That trims a little specific risk, but the remaining risk is mostly systematic, which all shares share.',
      3: 'Equal weighting helps at the margin, but the systematic risk of shares remains whatever the weights.',
    },
    solution: 'Thirty diversified shares are close to the floor of share-market risk: what remains is systematic. Only an asset outside the share market with low correlation, such as bonds (or bills), lowers it much further.',
  },
  {
    id: 'f06-m3-3', lesson: 'diversification', type: 'num', kind: 'applied',
    prompt: 'On a fictional emerging stock exchange, shares have standard deviations of about 40% a year and an average pairwise correlation of 0.3. An analyst says that no equally weighted portfolio of these shares, however many it holds, can get below a certain standard deviation. What is that floor? Give a percentage to one decimal place.',
    answer: 21.9, check: () => Math.sqrt(0.3 * 0.4 ** 2) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 12, say: 'That is 0.3 × 40%, the correlation times the standard deviation. The floor is the square root of the average covariance: √(0.3 × 0.16).' }, { value: 0, say: 'Only unsystematic risk diversifies away; the average covariance remains.' }],
    solution: 'Average covariance = 0.3 × 0.40² = 0.048. As n grows, σ_P → √0.048 = 21.9%: the market risk these shares share. Even 25 shares give 22.9%, close to the floor.',
  },
  {
    id: 'f06-m3-4', lesson: 'efficient-portfolios', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional investors agree on every expected return, standard deviation and correlation, and both can lend and borrow at the risk-free rate. One has a risk-aversion coefficient of 2, the other of 8. How do their best portfolios differ?',
    options: [
      'The same risky mix; the second holds a quarter as much of it',
      'The second holds a mix of risky assets weighted towards the least volatile ones, and no safe asset',
      'The first holds only the asset with the highest expected return; the second only the one with the lowest risk',
      'They hold identical portfolios, because their inputs are identical',
    ],
    answer: 0,
    feedback: {
      1: 'Under separation both use the maximum-Sharpe portfolio; caution is expressed through the share held in it.',
      2: 'Holding single assets is inefficient: the maximum-Sharpe mix gives more return per unit of risk.',
      3: 'The inputs fix the risky mix, but y* = (E[r_P] − r_f) ÷ (Aσ²) depends on A.',
    },
    solution: 'Both hold the maximum-Sharpe portfolio. Since y* is inversely proportional to A, the investor with A = 8 holds a quarter of the share the investor with A = 2 holds, and the rest in the risk-free asset.',
  },
  {
    id: 'f06-m3-5', lesson: 'efficient-portfolios', type: 'num', kind: 'numerical',
    prompt: 'A fictional adviser’s best risky portfolio has an expected return of 8.5% and a standard deviation of 12%; the risk-free rate is 3.5%. For a client with a risk-aversion coefficient of 4, what share should go into the risky portfolio? Give a percentage to one decimal place.',
    answer: 86.8, check: () => IV.optimalRiskyShare({ rf: 0.035, er: 0.085, sd: 0.12, A: 4 }) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [{ value: 10.4, say: 'That divides by Aσ (4 × 0.12). Square the standard deviation: 4 × 0.0144.' }, { value: 147.6, say: 'That uses the whole 8.5% return rather than the excess over the risk-free rate.' }],
    solution: 'y* = (0.085 − 0.035) ÷ (4 × 0.12²) = 0.05 ÷ 0.0576 = 0.868: 86.8% in the risky portfolio and 13.2% in the risk-free asset.',
  },
  {
    id: 'f06-m3-6', lesson: 'efficient-portfolios', type: 'num', kind: 'applied',
    prompt: 'A client says she could accept a worst year of −20%. Her adviser stress-tests with a year in which the risky portfolio falls 35% and the safe account earns 4%. What is the largest share she can hold in the risky portfolio and still lose no more than 20% in that year? Give a percentage to one decimal place.',
    answer: 61.5, check: () => (0.20 + 0.04) / (0.35 + 0.04) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [{ value: 57.1, say: 'That is 20 ÷ 35, which ignores the 4% earned on the safe part.' }],
    solution: 'Solve y × (−35%) + (1 − y) × 4% = −20%: −39y = −24, so y = 0.615. She can hold up to 61.5% in the risky portfolio. The stress year is an assumption; a worse one would call for less.',
  },
  {
    id: 'f06-m3-7', lesson: 'capm-and-beta', type: 'num', kind: 'numerical',
    prompt: 'A fictional software share’s returns have a correlation of 0.6 with the market’s and a standard deviation of 30% a year; the market’s standard deviation is 15%. Using a 4.2% risk-free rate and a 5.5% market risk premium, what is its CAPM required return? Give a percentage to one decimal place.',
    answer: 10.8, check: () => IV.capm({ rf, beta: 0.6 * 0.30 / 0.15, mrp }) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 7.5, say: 'That uses the correlation (0.6) as if it were beta. Beta = ρ × σ_i ÷ σ_M = 0.6 × 30 ÷ 15 = 1.2.' }, { value: 15.2, say: 'That uses σ_i ÷ σ_M = 2 as beta, ignoring the correlation: only the correlated part of the risk counts.' }],
    solution: 'β = ρσ_i ÷ σ_M = 0.6 × 0.30 ÷ 0.15 = 1.2. Required return = 4.2% + 1.2 × 5.5% = 10.8%.',
  },
  {
    id: 'f06-m3-8', lesson: 'capm-and-beta', type: 'mc', kind: 'applied',
    prompt: 'A fictional sector fund has a higher Treynor ratio than the market but a lower Sharpe ratio, and a regression R² of 0.45. A friend wants to put all her savings in it. What is the best advice?',
    options: [
      'For all her savings, Sharpe counts, and the fund is worse',
      'The Treynor ratio is the better measure, so the fund is the better choice for her savings',
      'The two ratios conflict, so the fund’s performance cannot be judged at all',
      'An R² of 0.45 shows the fund has positive alpha, so she should invest',
    ],
    answer: 0,
    feedback: {
      1: 'Treynor ignores specific risk, which she would bear in full if the fund were all she held.',
      2: 'They answer different questions; for a whole portfolio, total risk is what matters.',
      3: 'R² measures how much of its variance moves with the market, not whether it outperformed.',
    },
    solution: 'With R² of 0.45, more than half the fund’s variance is specific to it. As one holding among many, that would be diversified, and Treynor flatters it; as her only holding, she bears it all, and the Sharpe ratio, which counts total risk, says the market fund is better.',
  },
  {
    id: 'f06-m3-9', lesson: 'capm-and-beta', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds twelve months of a fictional fund’s excess returns (C) and the market’s (B). In E2, write a formula for the fund’s alpha: the intercept of the regression of the fund’s excess returns on the market’s.',
    sheet: { cells: cells9 },
    cell: 'E2', view: 'A1:E13', widths: { A: 8, B: 14, C: 12, E: 16 }, formats: { B: '0.0%', C: '0.0%', E2: '0.00%' },
    answer: '=INTERCEPT(C2:C13,B2:B13)',
    alt: ['=AVERAGE(C2:C13)-SLOPE(C2:C13,B2:B13)*AVERAGE(B2:B13)'],
    wrong: [
      { formula: '=INTERCEPT(B2:B13,C2:C13)', say: 'INTERCEPT takes the y range first: the fund’s excess returns (C) on the market’s (B).' },
      { formula: '=SLOPE(C2:C13,B2:B13)', say: 'That is the slope, the fund’s beta. Alpha is the intercept.' },
      { formula: '=AVERAGE(C2:C13)-AVERAGE(B2:B13)', say: 'That is the average gap, which assumes a beta of exactly 1. The intercept allows for the fund’s actual beta.' },
    ],
    solution: '<x>=INTERCEPT(C2:C13,B2:B13)</x> gives the fund’s alpha in per cent a month, about 0.34%. Twelve months give a very noisy estimate: its standard error would be large.',
  },
  {
    id: 'f06-m3-10', lesson: 'funds-and-indexing', type: 'num', kind: 'numerical',
    prompt: 'A fictional family trust has $100,000 to invest for 20 years and assumes 6% a year before fees. An index fund charges 0.10% a year; an active fund 0.95%. If the active fund’s managers add nothing before fees, how much more would the trust have at the end in the index fund? Give a whole number of dollars.',
    answer: 49384, check: () => IV.feeDrag({ amount: 100000, years: 20, r: 0.06, fee: 0.001 }).net - IV.feeDrag({ amount: 100000, years: 20, r: 0.06, fee: 0.0095 }).net, unit: '$', places: 0, tol: 5,
    wrong: [{ value: 17000, say: 'That is 0.85% of $100,000 for 20 years without compounding. Fees are charged on a growing balance and lose their own growth.' }],
    solution: 'Index fund: 100,000 × (1.06 × 0.999)²⁰ = $314,360. Active: 100,000 × (1.06 × 0.9905)²⁰ = $264,976. Difference: $49,384, half the original investment.',
  },
  {
    id: 'f06-m3-11', lesson: 'funds-and-indexing', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements are true? Select all that apply.',
    options: [
      'An ETF can be actively managed.',
      'A mutual fund’s shares change hands on a stock exchange throughout the day.',
      'An ETF’s market price can differ slightly from its net asset value.',
      'An index fund’s return is usually a little below its index’s, by about its costs.',
      'A fund with a high tracking error must have trailed its benchmark.',
    ],
    answer: [0, 2, 3],
    feedback: {
      1: 'Mutual fund shares are bought from and sold back to the fund at the end-of-day NAV.',
      4: 'Tracking error measures how much the gap varies, not its direction; a fund can stray far and still come out ahead.',
    },
    solution: 'True: ETFs can be active; their price can differ from NAV; index funds trail by about their costs. False: mutual funds trade with the fund at NAV; tracking error is variability, not shortfall.',
  },
  {
    id: 'f06-m3-12', lesson: 'funds-and-indexing', type: 'mc', kind: 'applied',
    prompt: `Over five years a fictional index fund with an expense ratio of ${(ASSETS.market.fee * 100).toFixed(2)}% (the same as the Harbourline total-market fund’s) trailed its index by 0.45 points a year on average. What should an investor conclude?`,
    options: [
      'It tracks poorly: the gap is over ten times its fee',
      'It is fine: index funds trail their indexes, and 0.45 points is small',
      'The index return is probably mismeasured, as tracking gaps rarely exceed fees',
      'It has a high tracking error, which explains the shortfall',
    ],
    answer: 0,
    feedback: {
      1: 'All index funds trail a little, but a well-run one trails by about its fee; 0.45 points is more than ten times this fund’s fee.',
      2: 'Trading costs, cash holdings and sampling can all add to the gap.',
      3: 'A shortfall is the tracking difference; tracking error is how much the gap varies, and says nothing about its average.',
    },
    solution: 'A tracking difference of −0.45 points against a 0.04% fee means about 0.41 points a year of other costs or poor tracking. Over decades that matters as much as a high fee; an investor should prefer a rival that tracks closely.',
  },
];
