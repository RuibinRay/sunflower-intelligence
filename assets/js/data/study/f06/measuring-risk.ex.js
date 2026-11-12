// measuring-risk.ex.js — F06 · Measuring risk: widgets, practice and the knowledge check (answer keys live here).
// The fund returns are SIMULATED (case.js, tools/study/f06-data.py); every business and person named here is fictional.
import { MONTHS, SERIES, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { normCdf } from '../../../core/inference.js?v=31';

const st = DERIVED.stats;
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const sdS = (r) => { const m = r.reduce((a, b) => a + b, 0) / r.length; return Math.sqrt(r.reduce((s, v) => s + (v - m) ** 2, 0) / (r.length - 1)); };
const ddPath = (r) => { const w = IV.wealth(r); let pk = w[0]; return w.map((v) => { pk = Math.max(pk, v); return Math.round((v / pk - 1) * 1000) / 10; }); };
const roll = (k, n) => { const o = []; for (let i = 0; i + n <= SERIES[k].length; i++) o.push((SERIES[k].slice(i, i + n).reduce((p, v) => p * (1 + v), 1)) ** (12 / n) - 1); return o.sort((a, b) => a - b); };
const HZ = [12, 36, 60, 120].map((n) => roll('market', n));
const r1 = (v) => Math.round(v * 1000) / 10;

// 24 months of the market fund, January 2026 – December 2027
const M24 = MONTHS.slice(-24), R24 = SERIES.market.slice(-24).map(r4);
const sdCells = (() => { const c = { A1: 'Month', B1: 'Market fund' }; M24.forEach((m, i) => { c[`A${i + 2}`] = m; c[`B${i + 2}`] = R24[i]; }); c.A27 = 'Volatility, a year'; return c; })();
// a fictional fund’s month-end values for the drawdown items
const VALS = [100, 112, 105, 120, 96, 90, 108, 125];
const maxDD = (v) => { let pk = v[0], worst = 0; v.forEach((x) => { pk = Math.max(pk, x); worst = Math.min(worst, x / pk - 1); }); return worst; };
const VALS2 = [50, 58, 61, 49, 55, 64, 51, 70];
const bondsY = [9.7, 3.3, 5.1, 11.0, 9.3];

export const widgets = {
  'risk-hist': {
    type: 'distribution',
    values: SERIES.market.map((v) => Math.round(v * 10000) / 100),
    label: 'Monthly return of the simulated market fund (%)',
    transforms: ['none'], rules: ['z', 'iqr'],
  },
  'risk-normal': {
    type: 'curve', title: 'A normal model of one year’s return', dist: 'normal',
    params: { mean: 10.4, sd: 16 }, vary: ['mean', 'sd'], limits: { sd: [1, 40, 0.5] },
    asks: ['below', 'between', 'above'], a: -25, b: 0, xLabel: 'Return in one year (%)', places: 1,
    note: 'Starting values: the simulated market fund’s mean (10.43%, shown as 10.4) and volatility (16.00%) a year. Under this model a year worse than −25% has a probability of about 1.3%; the simulated history had one in fifteen calendar years, and real returns have fatter tails than the normal curve.',
  },
  'risk-drawdown': {
    type: 'chart', kind: 'line',
    title: 'Drawdown: the fall below the previous peak (simulated)',
    x: { label: 'Years from 1 January 2013', values: Array.from({ length: 181 }, (_, i) => Math.round(i / 12 * 1000) / 1000) },
    series: [{ name: 'Market fund', values: ddPath(SERIES.market) }],
    y: { label: 'Below previous peak (%)', format: 'pct' },
    note: 'Month-end values of the simulated Total Market Index Fund: deepest −39.1% at the end of September 2022 (9.75 years in), then 57 months below its September 2021 peak in all. The bond fund’s deepest drawdown, −13.4%, came in the same year (October 2022). Simulated for teaching.',
  },
  'risk-horizon': {
    type: 'chart', kind: 'bar',
    title: 'Annualised return over every window (simulated market fund)',
    x: { label: 'Window', values: ['1 yr', '3 yrs', '5 yrs', '10 yrs'] },
    series: [
      { name: 'Worst', values: HZ.map((a) => r1(a[0])) },
      { name: 'Median', values: HZ.map((a) => r1(a[(a.length - 1) / 2])) },
      { name: 'Best', values: HZ.map((a) => r1(a.at(-1))) },
    ],
    y: { label: 'Annualised return (%)', format: 'pct' },
    note: 'Windows start every month from January 2013 and overlap, so they are not independent evidence; there are 169 one-year windows but only 61 ten-year ones. Simulated for teaching.',
  },
};

export const guided = [
  {
    id: 'f06-risk-g1', type: 'steps', kind: 'numerical',
    prompt: 'An analyst’s fictional scenarios for a bond fund next year: +9% with probability 0.3, +4% with 0.5 and −6% with 0.2. Its expected return is 3.5%.',
    solution: 'Distances from 3.5%: 5.5, 0.5 and −9.5 points. Variance 0.3 × 30.25 + 0.5 × 0.25 + 0.2 × 90.25 = 27.25 (%²). Standard deviation √27.25 = 5.22%.',
    steps: [
      { id: 'f06-risk-g1-s1', type: 'num', prompt: 'What is the variance, in squared percentage points (%²)? Give two decimal places.',
        answer: 27.25, check: () => IV.scenarios([{ p: 0.3, r: 9 }, { p: 0.5, r: 4 }, { p: 0.2, r: -6 }]).variance, unit: '%²', places: 2, tol: 0.02,
        hints: ['Square each scenario’s distance from 3.5% and weight it by its probability.', '0.3 × 5.5² + 0.5 × 0.5² + 0.2 × (−9.5)².'],
        wrong: [{ value: 40.92, say: 'That divides the squared distances by 3 (or n − 1). Scenarios are weighted by their probabilities instead.' }, { value: 4.6, say: 'That weights the distances without squaring them first (and lets the signs cancel). Square, then weight.' }] },
      { id: 'f06-risk-g1-s2', type: 'num', prompt: 'What is the standard deviation? Give a percentage to two decimal places.',
        answer: 5.22, check: () => IV.scenarios([{ p: 0.3, r: 0.09 }, { p: 0.5, r: 0.04 }, { p: 0.2, r: -0.06 }]).sd * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['The square root of the variance.'],
        wrong: [{ value: 27.25, say: 'That is the variance. Take its square root to get back to percentage points.' }] },
    ],
  },
  {
    id: 'f06-risk-g2', type: 'steps', kind: 'numerical',
    prompt: 'The simulated bond fund’s calendar-year returns for 2023–2027 were 9.7%, 3.3%, 5.1%, 11.0% and 9.3% (rounded). Treat them as a sample.',
    solution: 'Mean 38.4 ÷ 5 = 7.68%. Squared distances: 2.02², (−4.38)², (−2.58)², 3.32², 1.62², summing to 43.568. Sample variance 43.568 ÷ 4 = 10.892; SD √10.892 = 3.30%. Over fifteen years the fund’s volatility was 4.14%: five calm years understate it.',
    steps: [
      { id: 'f06-risk-g2-s1', type: 'num', prompt: 'What is the mean return? Give a percentage to two decimal places.',
        answer: 7.68, check: () => bondsY.reduce((a, b) => a + b, 0) / 5, unit: '%', places: 2, tol: 0.01,
        hints: ['Add the five returns and divide by 5.'] },
      { id: 'f06-risk-g2-s2', type: 'num', prompt: 'What is the sample variance, in %²? Give two decimal places.',
        answer: 10.89, check: () => sdS(bondsY) ** 2, unit: '%²', places: 2, tol: 0.02,
        hints: ['Square each return’s distance from 7.68 and add them: the total is 43.568.', 'Divide by n − 1 = 4.'],
        wrong: [{ value: 8.71, say: 'That divides by n = 5. A sample divides by n − 1 = 4.' }] },
      { id: 'f06-risk-g2-s3', type: 'num', prompt: 'What is the sample standard deviation? Give a percentage to two decimal places.',
        answer: 3.30, check: () => sdS(bondsY), unit: '%', places: 2, tol: 0.02,
        hints: ['Square root of the variance.'],
        wrong: [{ value: 2.95, say: 'That is the square root of the population variance (÷ 5). Use ÷ 4 for a sample.' }] },
    ],
  },
  {
    id: 'f06-risk-g3', type: 'formula', kind: 'applied',
    prompt: 'B2:B25 hold the simulated market fund’s monthly returns for January 2026 – December 2027. In B27, write one formula for its volatility: the sample standard deviation of the monthly returns, annualised.',
    sheet: { cells: sdCells },
    cell: 'B27', view: 'A1:B27', widths: { A: 18, B: 14 }, formats: { B: '0.00%', B27: '0.00%' },
    answer: '=STDEV.S(B2:B25)*SQRT(12)',
    alt: ['=SQRT(12)*STDEV.S(B2:B25)', '=STDEV.S(B2:B25)*12^0.5', '=SQRT(VAR.S(B2:B25)*12)'],
    wrong: [
      { formula: '=STDEV.S(B2:B25)*12', say: 'Standard deviations grow with the square root of time. Multiply by √12, not 12.' },
      { formula: '=STDEV.S(B2:B25)', say: 'That is the monthly figure. Annualise it by √12.' },
      { formula: '=STDEV.P(B2:B25)*SQRT(12)', say: 'STDEV.P treats the 24 months as the whole population and divides by n. These months are a sample: use STDEV.S.' },
    ],
    hints: ['STDEV.S gives a sample standard deviation.', 'Then multiply by SQRT(12).'],
    solution: '<x>=STDEV.S(B2:B25)*SQRT(12)</x> gives 10.48% for these two years, well below the fifteen-year 16.00%: two calm years say little about how volatile a fund can be.',
  },
  {
    id: 'f06-risk-g4', type: 'num', kind: 'applied',
    prompt: 'If the simulated bond fund’s yearly returns were normally distributed with its mean of 4.31% and volatility of 4.14%, what would be the probability of a loss in a year? Give a percentage to one decimal place.',
    answer: 14.9, check: () => normCdf((0 - st.bonds.mean) / st.bonds.sd) * 100, unit: '%', places: 1, tol: 0.2,
    hints: ['Find the z-score of a 0% return: (0 − 4.31) ÷ 4.14.', 'The probability below z = −1.04 is about 0.149. In Excel: =NORM.DIST(0,0.0431,0.0414,TRUE).'],
    wrong: [{ value: 85.1, say: 'That is the probability of a gain: the area above 0. A loss is the area below.' }, { value: 1.04, say: 'That is the size of the z-score, not a probability. Look up the area below z = −1.04.' }],
    solution: 'z = (0 − 4.31) ÷ 4.14 = −1.04, and P(z < −1.04) ≈ 14.9%: about one year in seven. The fund lost money in one of its fifteen years (2022, −13.0%), and that loss was 4.2 SD below the mean, far rarer than a normal curve allows.',
  },
];

export const independent = [
  {
    id: 'f06-risk-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional fund’s monthly returns have a standard deviation of 1.5%. What is its volatility a year, assuming independent months? Give a percentage to two decimal places.',
    answer: 5.20, check: () => IV.annualise.sd(0.015) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 18, say: 'That multiplies by 12. Standard deviations scale with √12.' }, { value: 19.56, say: 'That compounds 1.5% as if it were a growth rate. Volatility is annualised by √12.' }],
    solution: '1.5% × √12 = 1.5% × 3.464 = 5.20%.',
  },
  {
    id: 'f06-risk-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional fund’s month-end values over eight months were $100, $112, $105, $120, $96, $90, $108 and $125. What was its maximum drawdown? Give a percentage to one decimal place (as a negative number).',
    data: { table: { head: ['Month', '1', '2', '3', '4', '5', '6', '7', '8'], rows: [['Value ($)', ...VALS.map(String)]] } },
    answer: -25.0, check: () => maxDD(VALS) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: -10, say: 'That is the fall from $100 to $90, measured from the start. A drawdown is measured from the highest value before the low: $120.' }, { value: -20, say: 'That is the first fall from $120 to $96. The value kept falling, to $90.' }, { value: -28.0, say: 'That measures from the final peak ($125). The low came before it; measure from $120.' }],
    solution: 'The peak before the low was $120 (month 4) and the low after it $90 (month 6): 90 ÷ 120 − 1 = −25.0%. The fund then recovered past $120 in month 8.',
  },
  {
    id: 'f06-risk-i3', type: 'num', kind: 'numerical',
    prompt: 'If a fictional fund’s yearly returns were normal with a mean of 8% and a standard deviation of 12%, what would be the probability of a year worse than −10%? Give a percentage to two decimal places.',
    answer: 6.68, check: () => normCdf((-0.10 - 0.08) / 0.12) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [{ value: 93.32, say: 'That is the probability of doing better than −10%. The question asks for the area below.' }, { value: 20.23, say: 'That uses z = (−10 − 0) ÷ 12, forgetting the 8% mean.' }],
    solution: 'z = (−10 − 8) ÷ 12 = −1.5; P(z < −1.5) = 6.68%, about one year in fifteen, if returns were normal. With fat tails the true chance of much worse years is higher than the normal suggests.',
  },
  {
    id: 'f06-risk-i4', type: 'formula', kind: 'applied',
    prompt: 'B2:B4 hold the probabilities of three fictional scenarios for a share fund next year and C2:C4 the fund’s return in each. C6 holds the expected return. In C7, write one formula for the standard deviation of the return.',
    sheet: { cells: { A1: 'Scenario', B1: 'Probability', C1: 'Return', A2: 'Strong', B2: 0.25, C2: 0.3, A3: 'Normal', B3: 0.5, C3: 0.1, A4: 'Downturn', B4: 0.25, C4: -0.15, A6: 'Expected return', C6: '=SUMPRODUCT(B2:B4,C2:C4)', A7: 'Standard deviation' },
      fixed: ['B2:B4'] },
    cell: 'C7', view: 'A1:C7', widths: { A: 18, B: 12, C: 12 }, formats: { B: '0.00', C: '0.0%', C6: '0.00%', C7: '0.00%' },
    answer: '=SQRT(SUMPRODUCT(B2:B4,(C2:C4-C6)^2))',
    alt: ['=SUMPRODUCT(B2:B4,(C2:C4-C6)^2)^0.5', '=SQRT(SUMPRODUCT((C2:C4-C6)^2,B2:B4))'],
    wrong: [
      { formula: '=SUMPRODUCT(B2:B4,(C2:C4-C6)^2)', say: 'That is the variance. Take its square root.' },
      { formula: '=STDEV.S(C2:C4)', say: 'STDEV.S treats the three returns as an equally likely sample. Scenarios must be weighted by their probabilities.' },
      { formula: '=SQRT(SUMPRODUCT(B2:B4,C2:C4^2))', say: 'The squared distances are from the expected return: subtract C6 before squaring.' },
    ],
    solution: '<x>=SQRT(SUMPRODUCT(B2:B4,(C2:C4-C6)^2))</x> returns 15.96%: each squared distance from the expected return, weighted by its probability, summed, then square-rooted.',
  },
  {
    id: 'f06-risk-i5', type: 'classify', kind: 'applied',
    prompt: 'Each goal belongs to a fictional saver. Where should the money mainly be held?',
    items: [
      'An emergency fund of three months’ spending.',
      'A deposit for a flat to be bought in under four years.',
      'Retirement savings for someone aged 30.',
      'A car to be bought in 18 months.',
      'A newborn’s university fees, due in 18 years.',
    ],
    categories: ['Cash or savings accounts', 'Mainly share funds'],
    answer: [0, 0, 1, 0, 1],
    feedback: {
      0: 'An emergency fund must be available at once and at full value: cash.',
      1: 'In the simulated history the market fund lost money in about one four-year window in three, and up to 28%.',
      2: 'Decades of horizon leave time to recover from drawdowns, so share funds can carry much of it.',
      3: 'Eighteen months is too short to wait out a fall like the −39% in the history.',
      4: 'Eighteen years is long enough to take share risk, moving towards cash as the date nears.',
    },
    solution: 'Money needed on a date within a few years (emergency fund, deposit, car) goes in cash or savings; money for goals decades away can take share risk.',
  },
  {
    id: 'f06-risk-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A fund’s monthly returns have an excess kurtosis of 3. What does that mean for an investor who estimates the chance of a very bad month from a normal distribution with the fund’s mean and standard deviation?',
    options: ['The estimate is too low: very bad months happen more often than the normal predicts', 'The estimate is too high, because kurtosis makes the distribution more peaked in the centre', 'The estimate is right, since kurtosis measures skewness rather than how likely losses are', 'The estimate is right on average, because high kurtosis means big gains as often as big losses'],
    answer: 0,
    feedback: {
      1: 'Fat-tailed distributions are more peaked in the centre and have more extreme outcomes: both. The tails are what matter for very bad months.',
      2: 'Kurtosis measures tail weight, not asymmetry; skewness is a different statistic.',
      3: 'Extreme gains may also be more common, but that does not make the estimate of extreme losses right: it is too low.',
    },
    solution: 'Positive excess kurtosis means fatter tails than the normal: extreme outcomes, including very bad months, are more frequent than a normal curve with the same mean and SD suggests.',
  },
];

export const check = [
  {
    id: 'f06-risk-k1', type: 'mc', kind: 'conceptual',
    prompt: 'If yearly returns are independent with a volatility of 16%, what happens to the standard deviation of the average yearly return over 16 years, and to the uncertainty about the ending value in dollars?',
    options: ['The average’s SD falls to 4%, while the ending value becomes more uncertain', 'Both fall: over 16 years the ending value is about four times less uncertain', 'The average’s SD stays 16%, because volatility is a property of the fund', 'The average’s SD falls to 1%, since 16 years divide 16% by 16'],
    answer: 0,
    feedback: {
      1: 'Good and bad years partly offset in the average, but the uncertainty compounds into the ending value, so its spread widens.',
      2: 'The volatility of each year is unchanged, but the average of 16 independent years varies less: σ ÷ √16.',
      3: 'The average’s SD shrinks with the square root of the number of years: 16% ÷ √16 = 4%.',
    },
    solution: 'SD of the average = 16% ÷ √16 = 4%. The ending wealth, though, compounds sixteen uncertain years, so its spread in dollars widens. Both statements are about risk; which matters depends on the goal.',
  },
  {
    id: 'f06-risk-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional investment returns +20% or −10% next year with equal probability. What is the standard deviation of its return? Give a percentage to one decimal place.',
    answer: 15.0, check: () => IV.scenarios([{ p: 0.5, r: 0.2 }, { p: 0.5, r: -0.1 }]).sd * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 21.2, say: 'That treats the two outcomes as a sample (dividing by n − 1). Scenarios are weighted by their probabilities.' }, { value: 225, say: 'That is the variance in %². Take the square root.' }, { value: 5, say: 'That is the expected return.' }],
    solution: 'E(r) = 5%. Each outcome is 15 points from it, so the variance is 0.5 × 15² + 0.5 × 15² = 225 and the SD √225 = 15%.',
  },
  {
    id: 'f06-risk-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional share fund’s monthly returns have a standard deviation of 3.2%. What is its annual volatility? Give a percentage to two decimal places.',
    answer: 11.09, check: () => IV.annualise.sd(0.032) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 38.4, say: 'That multiplies by 12; SDs scale with √12.' }],
    solution: '3.2% × √12 = 11.09%.',
  },
  {
    id: 'f06-risk-k4', type: 'num', kind: 'numerical',
    prompt: 'A fictional fund’s month-end values were $50, $58, $61, $49, $55, $64, $51 and $70. What was its maximum drawdown? Give a percentage to one decimal place (as a negative number).',
    answer: -20.3, check: () => maxDD(VALS2) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: -19.7, say: 'That is the fall from $61 to $49 measured on the low price. A drawdown divides by the peak: 49 ÷ 61 − 1.' }, { value: -2, say: 'That compares the low with the starting value. Measure from the peak before the low, $61.' }, { value: -27.1, say: 'That runs from the later peak ($70) back to an earlier low; a drawdown always runs from a peak to a later low.' }],
    solution: 'Two falls: $61 → $49 (−19.7%) and $64 → $51 (−20.3%). The larger, −20.3%, is the maximum drawdown.',
  },
  {
    id: 'f06-risk-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana’s friend Priya (fictional) has $40,000 saved for a flat deposit she will pay in two years, and sees that the simulated market fund grew 9.57% a year. What is the best advice?',
    options: ['Keep it in savings: over two years shares can fall far, and the deposit is due on a fixed date', 'Invest it in the market fund, since over any period it earns about 9.57% a year', 'Invest half in the market fund, since losses over two years are at most about 10%', 'Wait for a market fall and then invest it all, so the deposit buys more fund units'],
    answer: 0,
    feedback: {
      1: '9.57% a year is a fifteen-year compound average; individual years ranged from −26.9% to +46.5%, and the worst twelve months lost 39.1%.',
      2: 'Two-year losses in the history were far larger than 10%: the maximum drawdown was 39.1% within twelve months.',
      3: 'Nobody can reliably time a fall, and the money is still exposed to losses before the date it is needed.',
    },
    solution: 'The time horizon decides the risk that matters. For a fixed sum needed in two years, the value on that date is what counts, and a share fund can lose a large part of its value in two years. Cash or savings protect the deposit.',
  },
  {
    id: 'f06-risk-k6', type: 'formula', kind: 'applied',
    prompt: 'B1 holds a fund’s mean return a year, B2 its volatility and B3 a loss threshold. In B5, write a formula for the probability of a year below the threshold if returns were normally distributed.',
    sheet: { cells: { A1: 'Mean return a year', B1: 0.0843, A2: 'Volatility a year', B2: 0.155, A3: 'Threshold', B3: -0.2, A5: 'P(year below threshold)' },
      vary: { B1: [0.06, 0.1], B2: [0.12, 0.2], B3: [-0.25, -0.15] } },
    cell: 'B5', view: 'A1:B5', widths: { A: 24, B: 12 }, formats: { B1: '0.00%', B2: '0.00%', B3: '0.0%', B5: '0.00%' },
    answer: '=NORM.DIST(B3,B1,B2,TRUE)',
    alt: ['=NORM.S.DIST((B3-B1)/B2,TRUE)'],
    wrong: [
      { formula: '=1-NORM.DIST(B3,B1,B2,TRUE)', say: 'That is the probability of doing better than the threshold. NORM.DIST with TRUE already gives the area below.' },
      { formula: '=NORM.DIST(B3,B1,B2,FALSE)', say: 'FALSE returns the height of the curve (a density), not a probability. Use TRUE for the cumulative probability.' },
      { formula: '=NORM.DIST(B3,0,B2,TRUE)', say: 'The mean is in B1, not zero.' },
    ],
    solution: '<x>=NORM.DIST(B3,B1,B2,TRUE)</x> returns 3.33% here. Remember that real returns have fatter tails: treat this as a lower bound for extreme losses.',
  },
];
