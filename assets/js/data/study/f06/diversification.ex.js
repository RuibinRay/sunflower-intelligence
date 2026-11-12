// diversification.ex.js — F06 · Diversification: widgets, practice and the knowledge check (answer keys live here).
// Fund and company returns come from case.js (SIMULATED monthly history; fictional funds and companies). Kettlewell
// Umbrellas, Brightsands Ice Cream and every other business named here is fictional.
import { SERIES, MONTHS, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const st = DERIVED.stats;
const MB = IV.sampleCov(SERIES.market, SERIES.bonds), MH = IV.sampleCov(SERIES.morrow, SERIES.harbour);
const avgVar = (st.morrow.sd ** 2 + st.harbour.sd ** 2) / 2, avgCov = MH.cov * 12;
const NS = [1, 2, 3, 5, 10, 15, 20, 30, 50, 100];
const r2 = (x) => Math.round(x * 10000) / 100;   // a decimal as a percentage to 2 dp
const i2020 = MONTHS.indexOf('2020-01');
const months2020 = MONTHS.slice(i2020, i2020 + 12);
const cells2020 = { A1: 'Month', B1: 'Total market', C1: 'Bond fund' };
months2020.forEach((m, k) => { cells2020[`A${k + 2}`] = m; cells2020[`B${k + 2}`] = SERIES.market[i2020 + k]; cells2020[`C${k + 2}`] = SERIES.bonds[i2020 + k]; });
// guided scenario (fictional)
const KB = [{ p: 0.4, a: 0.14, b: 0.00 }, { p: 0.4, a: 0.04, b: 0.10 }, { p: 0.2, a: -0.06, b: 0.05 }];

export const widgets = {
  'div-two-funds': {
    type: 'portfolio', mode: 'two', title: 'Ana’s two funds: every mix of shares and bonds',
    a: { name: 'Total market fund', er: st.market.mean, sd: st.market.sd },
    b: { name: 'Bond fund', er: st.bonds.mean, sd: st.bonds.sd },
    corr: 0.30, w: 0.6, corrSlider: true,
    note: 'Means and standard deviations are the annualised figures from the simulated 2013–2027 monthly returns of the fictional Harbourline funds (10.43% and 16.00%; 4.31% and 4.14%). Their sample correlation is 0.32; the slider moves in steps of 0.05, so it starts at 0.30. At either value the least risky mix holds no shares; drag the correlation below about 0.26 and it starts to hold some.',
  },
  'div-two-shares': {
    type: 'portfolio', mode: 'two', title: 'Two shares: Morrow & Pike and Harbour Street',
    a: { name: 'Morrow & Pike', er: st.morrow.mean, sd: st.morrow.sd },
    b: { name: 'Harbour Street', er: st.harbour.mean, sd: st.harbour.sd },
    corr: 0.35, w: 0.5, corrSlider: true,
    note: 'Annualised from the simulated 2013–2027 monthly returns of two fictional listed companies (sample correlation 0.350; the slider uses 0.35, so the widget’s figures can differ from the lesson’s in the last digit). Even the least risky mix of the two is far riskier than the total-market fund’s 16.00%.',
  },
  'div-n-shares': {
    type: 'chart', kind: 'line', title: 'Risk of an equally weighted portfolio of n typical shares',
    x: { label: 'Number of shares', values: NS },
    series: [
      { name: 'Portfolio SD', values: NS.map((n) => r2(IV.equalWeightSd(n, avgVar, avgCov))) },
    ],
    y: { label: 'Standard deviation a year (%)' },
    note: 'Each share has the average variance (0.0832) and average covariance (0.0283) of Morrow &amp; Pike and Harbour Street in the simulated history. The curve flattens towards a floor of 16.83% (the square root of the average covariance): the systematic risk no number of shares removes. The distance above the floor is the unsystematic risk still left.',
  },
};

export const guided = [
  {
    id: 'f06-div-g1', type: 'steps', kind: 'numerical',
    prompt: 'Kettlewell Umbrellas and Brightsands Ice Cream are fictional listed companies. Next summer will be wet (probability 0.4: Kettlewell returns 14%, Brightsands 0%), average (0.4: 4% and 10%) or hot (0.2: −6% and 5%). Kettlewell’s expected return is 6.0% and its standard deviation 7.48%; Brightsands’ are 5.0% and 4.47%.',
    solution: 'Deviations from the means (points): Kettlewell 8, −2, −12; Brightsands −5, 5, 0. Covariance = 0.4(8 × −5) + 0.4(−2 × 5) + 0.2(−12 × 0) = −16 − 4 + 0 = −20 %², or −0.0020. Correlation = −0.0020 ÷ (0.0748 × 0.0447) = −0.60. Half in each returns 7%, 7% and −0.5%: expected 5.5%, standard deviation 3.00%, far below the 5.98% average of the two.',
    steps: [
      { id: 'f06-div-g1-s1', type: 'num', prompt: 'What is the covariance of their returns, in decimal form? Give five decimal places.',
        answer: -0.002, check: () => IV.scenarioCov(KB).cov, unit: '', places: 5, tol: 0.00005,
        hints: ['Find each company’s deviation from its expected return in each summer, multiply the pairs, weight by probability and add.', 'Deviations in points: Kettlewell 8, −2, −12; Brightsands −5, 5, 0. Products −40, −10, 0; weighted: −16, −4, 0.'],
        wrong: [{ value: -20, say: 'That is the covariance in per cent squared. In decimals divide by 10,000: −0.0020.' }, { value: 0.002, say: 'Check the signs: in a wet summer Kettlewell is above its mean and Brightsands below, so the product is negative.' }] },
      { id: 'f06-div-g1-s2', type: 'num', prompt: 'What is their correlation? Give two decimal places.',
        answer: -0.60, check: () => IV.scenarioCov(KB).corr, unit: '', places: 2, tol: 0.01,
        hints: ['Correlation = covariance ÷ (σ_K × σ_B).', '−0.0020 ÷ (0.0748 × 0.0447).'],
        wrong: [{ value: 0.6, say: 'Check the sign: the covariance is negative, so the correlation is too.' }, { value: -0.0020, say: 'That is the covariance. Divide it by the product of the two standard deviations.' }] },
      { id: 'f06-div-g1-s3', type: 'num', prompt: 'What is the standard deviation of a portfolio with half in each? Give a percentage to two decimal places.',
        answer: 3.00, check: () => IV.scenarios(KB.map((s) => ({ p: s.p, r: 0.5 * s.a + 0.5 * s.b }))).sd * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['Either use the two-asset formula with ρ = −0.60, or find the portfolio’s return in each summer and its standard deviation directly.', 'Portfolio returns: 7%, 7% and −0.5%; expected 5.5%.'],
        wrong: [{ value: 5.98, say: 'That is the average of the two standard deviations, which would hold only if the correlation were +1.' }, { value: 0.09, say: 'That is the variance in decimals (0.0009). Take the square root.' }] },
    ],
  },
  {
    id: 'f06-div-g2', type: 'num', kind: 'numerical',
    prompt: 'In the simulated history the total-market fund has a standard deviation of 16.00% a year and the international fund 17.50%, with a correlation of 0.78. What is the standard deviation of a portfolio with half in each? Give a percentage to two decimal places.',
    answer: 15.80, check: () => IV.twoAsset({ w: 0.5, ra: 0, rb: 0, sa: 0.16, sb: 0.175, corr: 0.78 }).sd * 100, unit: '%', places: 2, tol: 0.03,
    hints: ['σ_P² = 0.25 × 0.16² + 0.25 × 0.175² + 2 × 0.25 × 0.78 × 0.16 × 0.175.', 'The variance is about 0.0250; take its square root.'],
    wrong: [{ value: 16.75, say: 'That is the average of the two standard deviations: correct only if the correlation were 1.' }, { value: 11.86, say: 'That leaves out the covariance term, as if the correlation were 0.' }],
    solution: 'σ_P² = 0.25 × 0.0256 + 0.25 × 0.030625 + 2 × 0.25 × 0.78 × 0.16 × 0.175 = 0.0064 + 0.00766 + 0.01092 = 0.02498; σ_P = 15.80%. With a correlation of 0.78 the mix is only 0.95 points below the 16.75% average: two share markets that move together diversify each other little.',
  },
  {
    id: 'f06-div-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds the simulated monthly returns of the total-market fund (B) and the bond fund (C) for 2020. In E2, write a formula for the correlation between them over the year.',
    sheet: { cells: { ...cells2020, E1: 'Correlation' } },
    cell: 'E2', view: 'A1:E13', widths: { A: 10, B: 13, C: 11, E: 12 }, formats: { B: '0.00%', C: '0.00%', E2: '0.00' },
    answer: '=CORREL(B2:B13,C2:C13)',
    alt: ['=CORREL(C2:C13,B2:B13)', '=PEARSON(B2:B13,C2:C13)', '=PEARSON(C2:C13,B2:B13)', '=COVARIANCE.S(B2:B13,C2:C13)/(STDEV.S(B2:B13)*STDEV.S(C2:C13))'],
    wrong: [
      { formula: '=COVARIANCE.S(B2:B13,C2:C13)', say: 'That is the covariance. Divide it by the two standard deviations, or use CORREL directly.' },
      { formula: '=CORREL(B2:B13,B2:B13)', say: 'Both ranges are the share fund, so the answer is always 1. The second range should be the bond fund, C2:C13.' },
    ],
    hints: ['Excel’s CORREL takes the two ranges of returns.', '=CORREL(B2:B13, C2:C13).'],
    solution: '<x>=CORREL(B2:B13,C2:C13)</x> gives 0.13 for 2020, well below the 0.32 over the fifteen years. A year’s twelve months give a noisy estimate; in March 2020 the bond fund fell only about 1% while shares fell 17%.',
  },
  {
    id: 'f06-div-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana notices that, with the simulated figures, the least risky mix of the total-market and bond funds holds no shares at all, even though the correlation is only 0.32. Why?',
    options: [
      'The share fund is so much riskier that, at a correlation of 0.32, any of it adds more risk than it diversifies away',
      'With a positive correlation of 0.32 the two funds move together too often for mixing them to cut risk much below the bond fund’s',
      'The bond fund has the lower expected return, and the least risky mix tends to favour the lower-returning asset',
      'The minimum-variance formula is unreliable when the two standard deviations differ this much, so it misstates the mix',
    ],
    answer: 0,
    hints: ['Compare the correlation with the ratio of the two standard deviations, 4.14% ÷ 16.00%.', 'When ρ is above σ_B ÷ σ_A, w* is negative.'],
    feedback: {
      1: 'Any correlation below 1 gives some diversification: the 60/40 mix is 1.00 point below the weighted average. The question is whether adding a little share fund lowers the risk of an all-bond portfolio.',
      2: 'Expected return plays no part in the minimum-variance weight; only standard deviations and correlation do.',
      3: 'The formula works for any two assets; it gives −1.8% here, which without short selling means none.',
    },
    solution: 'w* = (σ_B² − ρσ_Aσ_B) ÷ (σ_A² + σ_B² − 2ρσ_Aσ_B) is negative when ρ > σ_B ÷ σ_A = 0.26. The share fund moves partly with bonds and is nearly four times as volatile, so even a little adds risk to an all-bond portfolio. At a correlation of 0 the least risky mix would hold 6.3% in shares.',
  },
];

export const independent = [
  {
    id: 'f06-div-i1', type: 'num', kind: 'numerical',
    prompt: 'Using the simulated fifteen-year means (total market 10.43%, international 10.27%, bonds 4.31%), what is the expected return of a portfolio with 50% in the total-market fund, 30% in the international fund and 20% in bonds? Give a percentage to two decimal places.',
    answer: 9.16, check: () => (0.5 * st.market.mean + 0.3 * st.intl.mean + 0.2 * st.bonds.mean) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 8.34, say: 'That is a simple average of the three means. Weight each by its share of the portfolio.' }],
    solution: '0.5 × 10.43% + 0.3 × 10.27% + 0.2 × 4.31% = 5.215% + 3.081% + 0.862% = 9.16%. Expected returns average with the weights; standard deviations don’t.',
  },
  {
    id: 'f06-div-i2', type: 'num', kind: 'numerical',
    prompt: 'Two fictional funds have standard deviations of 20% and 25% a year and an annual covariance of 0.0120. What is their correlation? Give two decimal places.',
    answer: 0.24, check: () => 0.012 / (0.2 * 0.25), unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 0.27, say: 'That divides by the sum of the variances. Divide the covariance by the product of the standard deviations: 0.20 × 0.25 = 0.05.' }, { value: 0.012, say: 'That is the covariance itself. Correlation divides it by σ_A × σ_B.' }],
    solution: 'ρ = 0.0120 ÷ (0.20 × 0.25) = 0.0120 ÷ 0.05 = 0.24.',
  },
  {
    id: 'f06-div-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional emerging-markets fund has a standard deviation of 30% a year and a fictional property fund 20%; their correlation is 0.2. Short selling is allowed. What weight in the emerging-markets fund gives the least risky mix of the two? Give a percentage to one decimal place.',
    answer: 26.4, check: () => IV.twoAssetMinVarWeight({ sa: 0.3, sb: 0.2, corr: 0.2 }) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [{ value: 73.6, say: 'That is the weight in the property fund. The formula’s numerator uses the other asset’s variance: σ_B² − ρσ_Aσ_B.' }, { value: 30.8, say: 'That ignores the correlation (it is σ_B² ÷ (σ_A² + σ_B²)). Include the ρ terms.' }],
    solution: 'w* = (0.04 − 0.2 × 0.3 × 0.2) ÷ (0.09 + 0.04 − 2 × 0.2 × 0.3 × 0.2) = 0.028 ÷ 0.106 = 26.4% in emerging markets and 73.6% in property.',
  },
  {
    id: 'f06-div-i4', type: 'num', kind: 'numerical',
    prompt: 'Shares on a fictional exchange each have a standard deviation of about 35% a year, and pairs of them have an average correlation of 0.25. What is the standard deviation of an equally weighted portfolio of 20 of them? Give a percentage to two decimal places.',
    answer: 18.77, check: () => IV.equalWeightSd(20, 0.35 ** 2, 0.25 * 0.35 ** 2) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [{ value: 7.83, say: 'That keeps only the first term, as if the shares were uncorrelated. Add (1 − 1/n) × average covariance.' }, { value: 17.5, say: 'That is the floor with very many shares, √(0.25 × 0.1225). With 20 shares some specific risk remains.' }],
    solution: 'Average variance 0.35² = 0.1225; average covariance 0.25 × 0.1225 = 0.030625. σ_P² = 0.1225 ÷ 20 + (1 − 1/20) × 0.030625 = 0.006125 + 0.029094 = 0.035219; σ_P = 18.77%, close to the floor of 17.50%.',
  },
  {
    id: 'f06-div-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each event by the kind of risk it represents for a shareholder.',
    items: [
      'A central bank raises interest rates sharply.',
      'A roaster’s main contract with a supermarket chain is not renewed.',
      'A recession cuts consumer spending everywhere.',
      'A food maker recalls a product after a contamination scare.',
      'A company’s chief executive resigns unexpectedly.',
      'Oil prices double, raising costs across the economy.',
    ],
    categories: ['Systematic (market) risk', 'Unsystematic (specific) risk'],
    answer: [0, 1, 0, 1, 1, 0],
    feedback: {
      0: 'Interest rates affect the value of nearly every share and bond at once.',
      1: 'A lost customer hits one company; a diversified investor holds others that are unaffected.',
      2: 'A recession lowers the profits of most companies together.',
      3: 'A recall is specific to one firm (and perhaps its suppliers).',
      4: 'Management changes at one firm are specific to it.',
      5: 'Energy costs move the whole economy, though some industries more than others.',
    },
    solution: 'Systematic: interest rates, recession, oil prices; diversifying within shares can’t remove them. Unsystematic: the lost contract, the recall, the resignation; they largely cancel out in a broad portfolio.',
  },
  {
    id: 'f06-div-i6', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds the weight in asset A (B1), the two assets’ standard deviations (B2 and B3) and their correlation (B4). In B6, write a formula for the portfolio’s standard deviation, with the rest of the money in asset B.',
    sheet: { cells: { A1: 'Weight in A', B1: 0.35, A2: 'SD of A', B2: 0.22, A3: 'SD of B', B3: 0.09, A4: 'Correlation', B4: 0.15, A6: 'Portfolio SD' },
      vary: { B1: [0.6, 0.8], B2: [0.18, 0.3], B3: [0.05, 0.12], B4: [-0.3, 0.6] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 14, B: 10 }, formats: { B1: '0%', B2: '0.0%', B3: '0.0%', B4: '0.00', B6: '0.00%' },
    answer: '=SQRT(B1^2*B2^2+(1-B1)^2*B3^2+2*B1*(1-B1)*B4*B2*B3)',
    alt: ['=SQRT((B1*B2)^2+((1-B1)*B3)^2+2*B1*(1-B1)*B4*B2*B3)', '=(B1^2*B2^2+(1-B1)^2*B3^2+2*B1*(1-B1)*B4*B2*B3)^0.5'],
    wrong: [
      { formula: '=B1*B2+(1-B1)*B3', say: 'That is the weighted average of the standard deviations, which is the portfolio’s only if the correlation is 1.' },
      { formula: '=SQRT(B1^2*B2^2+(1-B1)^2*B3^2)', say: 'That leaves out the covariance term 2w(1 − w)ρσ_Aσ_B.' },
      { formula: '=B1^2*B2^2+(1-B1)^2*B3^2+2*B1*(1-B1)*B4*B2*B3', say: 'That is the variance. Take its square root.' },
    ],
    solution: '<x>=SQRT(B1^2*B2^2+(1-B1)^2*B3^2+2*B1*(1-B1)*B4*B2*B3)</x> gives 10.35% for 35% in A (σ 22%) and 65% in B (σ 9%) at a correlation of 0.15, below the 13.55% weighted average.',
  },
];

export const check = [
  {
    id: 'f06-div-k1', type: 'mc', kind: 'conceptual',
    prompt: 'For which correlation between two risky assets does combining them give no reduction in risk at all, whatever the weights?',
    options: ['+1', '0', '−1', 'Any positive correlation'],
    answer: 0,
    feedback: {
      1: 'At zero correlation the covariance term vanishes but the portfolio’s standard deviation is still below the weighted average.',
      2: 'At −1 diversification is at its most powerful: one mix has no risk at all.',
      3: 'Any correlation below +1, positive or not, gives some reduction; the 0.32 between Ana’s funds saves 1.00 point at 60/40.',
    },
    solution: 'Only at ρ = +1 is σ_P the weighted average of the two standard deviations. Every lower correlation bends the curve of mixes to the left.',
  },
  {
    id: 'f06-div-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional investor holds 70% in a share fund with a standard deviation of 18% and 30% in a bond fund with 6%; their correlation is 0.1. What is the portfolio’s standard deviation? Give a percentage to two decimal places.',
    answer: 12.90, check: () => IV.twoAsset({ w: 0.7, ra: 0, rb: 0, sa: 0.18, sb: 0.06, corr: 0.1 }).sd * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [{ value: 14.4, say: 'That is the weighted average, 0.7 × 18% + 0.3 × 6%, which ignores diversification.' }, { value: 1.67, say: 'That is the variance in per cent form (0.0167). Take the square root.' }],
    solution: 'σ_P² = 0.49 × 0.0324 + 0.09 × 0.0036 + 2 × 0.7 × 0.3 × 0.1 × 0.18 × 0.06 = 0.015876 + 0.000324 + 0.000454 = 0.016654; σ_P = 12.90%.',
  },
  {
    id: 'f06-div-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these statements about diversification are true? Select all that apply.',
    options: [
      'Adding more shares to a portfolio removes unsystematic risk but not systematic risk.',
      'A portfolio’s expected return is the weighted average of its holdings’ expected returns.',
      'Two assets with a correlation of 0.3 cannot both lose money in the same year.',
      'Most of the reduction in risk from equal weighting comes from the first ten or so shares.',
      'The market rewards investors with a higher expected return for holding unsystematic risk.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Correlation describes co-movement around each asset’s own average; in the simulated 2022 both shares and bonds lost.',
      4: 'Unsystematic risk can be diversified away cheaply, so the market pays no premium for it; Morrow &amp; Pike was far riskier than the market fund but earned less.',
    },
    solution: 'True: diversification removes specific risk only; expected returns average; the gain is front-loaded. False: low correlation doesn’t prevent joint losses; only systematic risk is rewarded.',
  },
  {
    id: 'f06-div-k4', type: 'num', kind: 'applied',
    prompt: 'Ana considers 70% in the total-market fund and 30% in the bond fund. With the simulated figures (16.00% and 4.14% standard deviations, correlation 0.32), what is the standard deviation of that mix? Give a percentage to two decimal places.',
    answer: 11.66, check: () => IV.twoAsset({ w: 0.7, ra: 0, rb: 0, sa: 0.16, sb: 0.0414, corr: 0.32 }).sd * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [{ value: 12.44, say: 'That is the weighted average 0.7 × 16.00% + 0.3 × 4.14%, as if the correlation were 1.' }, { value: 11.27, say: 'That uses a correlation of 0. Include 2 × 0.7 × 0.3 × 0.32 × 0.16 × 0.0414.' }],
    solution: 'σ_P² = 0.49 × 0.0256 + 0.09 × 0.001714 + 2 × 0.21 × 0.32 × 0.16 × 0.0414 = 0.012544 + 0.000154 + 0.000890 = 0.013589; σ_P = 11.66%, 0.79 points below the 12.44% weighted average.',
  },
  {
    id: 'f06-div-k5', type: 'mc', kind: 'applied',
    prompt: 'In the simulated 2022 the total-market fund lost 26.9% and the bond fund 13.0%, yet their monthly correlation that year was only 0.15. What is the best reading?',
    options: [
      'Both drifted down over the year for different reasons; low correlation doesn’t rule out a shared loss',
      'The correlation must have been calculated wrongly, since both funds fell together',
      'Bonds were a poor diversifier in 2022 because their correlation with shares was strongly negative',
      'A correlation of 0.15 shows the two funds were driven by the same shock every month',
    ],
    answer: 0,
    feedback: {
      1: 'There is no contradiction: correlation measures how the monthly returns move around each fund’s own average for the year, and both averages were negative.',
      2: 'The correlation was slightly positive, not strongly negative; a strongly negative one would have helped.',
      3: 'A correlation of 0.15 means the monthly moves were almost unrelated.',
    },
    solution: 'Correlation is about co-movement around the means. In 2022 rising rates pulled bonds down steadily while shares fell in a few bad months: low co-movement, but two negative means. Diversification softened the year (a 60/40 mix lost 21.3%) without preventing a loss.',
  },
  {
    id: 'f06-div-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional pension fund’s consultant estimates that shares have a standard deviation of 15% a year, property 12%, and that their correlation is 0.5. What is their annual covariance? Give four decimal places.',
    answer: 0.009, check: () => 0.5 * 0.15 * 0.12, unit: '', places: 4, tol: 0.00005,
    wrong: [{ value: 0.036, say: 'That multiplies the correlation by the sum of the two standard deviations; use their product: 0.5 × 0.15 × 0.12.' }, { value: 0.018, say: 'That is σ_A × σ_B without the correlation.' }],
    solution: 'cov = ρσ_Aσ_B = 0.5 × 0.15 × 0.12 = 0.0090.',
  },
];
