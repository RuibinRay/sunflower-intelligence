// hypothesis-testing.ex.js — B04 · Hypothesis testing: widgets, practice and the knowledge check (answer keys live
// here). Kilnworth's bags, the set-up times and the web shop's months come from case.js; Beacon Fitness, Kinfolk Trust,
// Hearthstone Bakery, Dalton Foods, Hawthorn Pharmacy and Bellwood Stores are fictional. Formula items are marked by
// their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { KG_BAGS, KILNWORTH_1KG, SETUP_MINUTES, SHOP, TARGETS, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, sd } from '../../../core/stats.js?v=12';

const K = KILNWORTH_1KG, KG = D.kg;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const sci = (p, d = 1) => { const [m, e] = p.toExponential(d).split('e'); return `${m} × 10${String(Number(e)).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}`; };
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- sheets
const bags = { A1: 'Bag', B1: 'Weight (g)', ...col('A', 2, KG_BAGS.map((_, i) => i + 1)), ...col('B', 2, KG_BAGS) };
const T = KG.vsSetting, TL = KG.vsLabel;
const zXl = 1 - I.normCdf((KG.mean - K.setting) / (K.sd / Math.sqrt(KG.n)));
const demoSheet = {
  cells: {
    ...bags,
    D1: 'Hypothesised mean μ₀ (g)', E1: K.setting,
    D2: 'Known σ for the z test (g)', E2: K.sd,
    D3: 'n', E3: '=COUNT(B2:B41)',
    D4: 'Mean', E4: '=AVERAGE(B2:B41)',
    D5: 'SD (s)', E5: '=STDEV.S(B2:B41)',
    D6: 'Standard error s/√n', E6: '=E5/SQRT(E3)',
    D7: 't', E7: '=(E4-E1)/E6',
    D8: 'p, H₁: μ < μ₀', E8: '=T.DIST(E7,E3-1,TRUE)',
    D9: 'p, H₁: μ > μ₀', E9: '=T.DIST.RT(E7,E3-1)',
    D10: 'p, two-sided', E10: '=T.DIST.2T(ABS(E7),E3-1)',
    D11: 'z (σ known)', E11: '=(E4-E1)/(E2/SQRT(E3))',
    D12: 'Z.TEST (upper tail)', E12: '=Z.TEST(B2:B41,E1,E2)',
    D13: 'z test p, H₁: μ < μ₀', E13: '=1-E12',
    D14: '95% interval, lower', E14: '=E4-CONFIDENCE.T(0.05,E5,E3)',
    D15: '95% interval, upper', E15: '=E4+CONFIDENCE.T(0.05,E5,E3)',
  },
};
const labelSheet = (extra = {}) => ({ cells: { ...bags, D1: 'μ₀ (g)', E1: K.label, D2: 'n', E2: '=COUNT(B2:B41)', D3: 't', D4: 'p-value (H₁: μ > μ₀)', ...extra }, vary: { E1: [999, 1001, 1002] }, fixed: ['B2:B41'] });
const T_FORMULA = '=(AVERAGE(B2:B41)-E1)/(STDEV.S(B2:B41)/SQRT(E2))';
const zSheet = { cells: { ...bags, D1: 'μ₀ (g)', E1: K.setting, D2: 'σ (g)', E2: K.sd, D3: 'p-value (H₁: μ < μ₀)' }, vary: { E1: [1003, 1003.5, 1004.5], E2: [2.5, 3.5] }, fixed: ['B2:B41'] };
const SU = I.tTest1(SETUP_MINUTES, 40);
const setupSheet = {
  cells: {
    A1: 'Event', B1: 'Set-up (minutes)', ...col('A', 2, SETUP_MINUTES.map((_, i) => i + 1)), ...col('B', 2, SETUP_MINUTES),
    D1: 'μ₀ (minutes)', E1: 40, D2: 't', E2: '=(AVERAGE(B2:B25)-E1)/(STDEV.S(B2:B25)/SQRT(COUNT(B2:B25)))', D3: 'df', E3: '=COUNT(B2:B25)-1', D4: 'p, two-sided',
  },
  vary: { E1: [37, 38.5, 42] },
};
// Kinfolk Trust (fictional): an appeal letter's response rate against a 5% benchmark
const KIN = { letters: 2400, gifts: 98, p0: 0.05 };
const kinT = I.propTest1(KIN.gifts, KIN.letters, KIN.p0, { alternative: 'less' });
const kinSheet = { cells: { A1: 'Letters sent', B1: KIN.letters, A2: 'Donations', B2: KIN.gifts, A3: 'Benchmark p₀', B3: KIN.p0, A5: 'p-value (H₁: p < p₀)' }, vary: { B3: [0.045, 0.055, 0.06] } };
// Dalton Foods (fictional): 30 cereal boxes labelled 500 g
const BOXES = [492.8, 496.1, 500.4, 499.4, 499.8, 499.6, 496.3, 492.6, 495.6, 505.9, 502.4, 502.7, 499.4, 497.6, 498.3, 499.1, 504.9, 498.2, 502, 495, 503.7, 498.8, 498.3, 501.5, 495.2, 498.8, 496.4, 498.2, 502.5, 495.3];
const BX = I.tTest1(BOXES, 500, { alternative: 'less' });
const boxSheet = { cells: { A1: 'Box', B1: 'Weight (g)', ...col('A', 2, BOXES.map((_, i) => i + 1)), ...col('B', 2, BOXES), D1: 'μ₀ (g)', E1: 500, D2: 'p-value (H₁: μ < μ₀)' }, vary: { E1: [499, 499.5, 501] }, fixed: ['B2:B31'] };
// Dalton's planning figures for the power item
const PL = { delta: 1.5, sigma: 3.3, n: 30, alpha: 0.05 };
const plPower = I.powerMean({ delta: PL.delta, sigma: PL.sigma, n: PL.n, alpha: PL.alpha, alternative: 'greater' });
const powerSheet = { cells: { A1: 'True shortfall δ (g)', B1: PL.delta, A2: 'σ (g)', B2: PL.sigma, A3: 'n (boxes)', B3: PL.n, A4: 'α (one-sided)', B4: PL.alpha, A6: 'Power' } };
// December (B01): the share of orders from returning customers against Ana's 35% target
const DEC = 5, decOrders = SHOP.webOrders[DEC] + SHOP.appOrders[DEC], decReturning = decOrders - SHOP.newCustomers[DEC], p35 = TARGETS.returningShare / 100;
const RET = I.propTest1(decReturning, decOrders, p35, { alternative: 'less' });
const retWrongSE = (RET.p - p35) / Math.sqrt((RET.p * (1 - RET.p)) / decOrders);
const retWrongNew = (SHOP.newCustomers[DEC] / decOrders - p35) / RET.se0;
const returningByMonth = SHOP.webOrders.map((w, i) => w + SHOP.appOrders[i] - SHOP.newCustomers[i]);
const r2 = (x) => Math.round(x * 100) / 100;

export const widgets = {
  'ht-curve': {
    type: 'curve',
    title: 'Ana’s t statistic on the t distribution with 39 degrees of freedom',
    dist: 't', params: { df: 39 },
    asks: ['below', 'outside', 'inverse'],
    a: Number(T.t.toFixed(3)), prob: 0.05,
    critical: { alpha: 0.05, tails: 'lower' },
    stat: { value: T.t, label: 't' },
    overlay: 'normal', places: 3, xLabel: 't statistic',
    note: `“P(X < a)” at a = ${neg(T.t, 3)} is the one-sided p-value, ${fx(T.p, 4)}, the same as <x>=T.DIST(${neg(T.t, 3).replace('−', '-')},39,TRUE)</x>. “Both tails” doubles it. “Value for a probability” at 0.05 gives the critical value −1.685, <x>=T.INV(0.05,39)</x>: any t below it falls in the rejection region.`,
  },
  'ht-sheet': {
    type: 'sheet',
    title: 'A one-sample t test (and a z test) on Ana’s 40 bags',
    sheet: demoSheet,
    view: 'A1:E41', maxHeight: '24rem',
    editable: ['B2:B41', 'E1:E2'],
    formats: { B: '0.0', E4: '0.00', E5: '0.0000', E6: '0.0000', E7: '0.000', E8: '0.0000', E9: '0.0000', E10: '0.0000', E11: '0.000', E12: '0.0000', E13: '0.0000', E14: '0.00', E15: '0.00' },
    widths: { D: 26 },
    tools: ['formulas', 'reset'],
    note: 'E1 holds μ₀ and E2 the σ that Kilnworth’s specification states. With μ₀ = 1004, t = −2.976 and the lower-tail p-value is 0.0025; Z.TEST in E12 returns the upper tail, 0.9958, so the z test’s lower-tail p-value is 1 − E12. Set E1 to 1000 to test the label: t becomes positive and the upper-tail p-value in E9 becomes tiny. Set it to 1003: every p-value is above 0.05, and 1,003 lies inside the interval in E14:E15.',
  },
  'ht-power': {
    type: 'power',
    title: 'Power of Ana’s check for a 1 g underfill (σ = 3 g, one-sided, α = 0.05)',
    sigma: K.sd, delta: -1, n: KG.n, alpha: 0.05, alternative: 'less', null: K.setting, units: 'g',
    vary: ['n', 'delta', 'sigma', 'alpha', 'alternative'],
    xLabel: 'Mean weight of the sample (g)',
    note: 'The left curve is centred on the true mean (here 1,003 g), the right one on the null value, 1,004 g. Power is the share of the true curve beyond the critical value. Try n = 56 (80% power), δ = −0.5 (a half-gram underfill), and α = 0.01; then switch the alternative to “Greater”: a test looking the wrong way almost never rejects H₀, and no sample size helps.',
  },
};

export const guided = [
  {
    id: 'b04-ht-g1', type: 'steps', kind: 'numerical',
    prompt: 'Is the mean fill of Kilnworth’s bags above the 1,000 g label? Test H₀: μ = 1,000 g against H₁: μ > 1,000 g at α = 0.05, on Ana’s 40 bags in B2:B41 (μ₀ is in E1 and n in E2).',
    solution: `t = (${fx(KG.mean)} − 1,000) ÷ (${fx(KG.sd, 4)} ÷ √40) ≈ ${fx(TL.t)}; the upper-tail p-value <x>=T.DIST.RT(E3,E2-1)</x> is about ${sci(TL.p)}. Reject H₀: the mean fill is above the label. That is a statement about the average bag: 5 of the 40 bags weighed less than 1,000 g, and a machine averaging about 1,003 g with an SD near 3 g puts a noticeable share of bags under the label.`,
    steps: [
      {
        id: 'b04-ht-g1-s1', type: 'formula',
        prompt: 'In E3, calculate the t statistic from the data, pointing at E1 for μ₀ and E2 for n.',
        sheet: labelSheet(),
        cell: 'E3', answer: T_FORMULA,
        alt: ['=(AVERAGE(B2:B41)-E1)/(STDEV.S(B2:B41)/SQRT(COUNT(B2:B41)))', '=(AVERAGE(B2:B41)-E1)*SQRT(E2)/STDEV.S(B2:B41)', '=STANDARDIZE(AVERAGE(B2:B41),E1,STDEV.S(B2:B41)/SQRT(E2))'],
        view: 'A1:E41', maxHeight: '20rem',
        formats: { B: '0.0', E3: '0.000' }, widths: { D: 20 },
        wrong: [
          { formula: '=(AVERAGE(B2:B41)-E1)/(STDEV.P(B2:B41)/SQRT(E2))', say: 'STDEV.P divides by n and treats the 40 bags as the whole population. They are a sample of the machine’s output: use STDEV.S.' },
          { formula: '=(AVERAGE(B2:B41)-E1)/STDEV.S(B2:B41)', say: 'That measures the gap in standard deviations of single bags. A test of the mean measures it in standard errors of the mean: divide s by √n first.' },
          { formula: '=(AVERAGE(B2:B41)-E1)/(STDEV.S(B2:B41)/E2)', say: 'The standard error is s ÷ √n, not s ÷ n. Wrap E2 in SQRT.' },
          { formula: '=(AVERAGE(B2:B41)-1000)/(STDEV.S(B2:B41)/SQRT(E2))', say: 'Point at E1 rather than typing 1000, so the same sheet tests any hypothesised mean.' },
          { formula: '=(AVERAGE(B2:B41)-E1)/(3/SQRT(E2))', say: 'That is a z statistic with Kilnworth’s σ = 3 g. The t test uses the sample’s own standard deviation, STDEV.S(B2:B41).' },
        ],
        hints: ['t = (sample mean − μ₀) ÷ (s ÷ √n). The sample mean is AVERAGE, s is STDEV.S.', '<x>=(AVERAGE(B2:B41)-E1)/(STDEV.S(B2:B41)/SQRT(E2))</x>'],
      },
      {
        id: 'b04-ht-g1-s2', type: 'formula',
        prompt: 'In E4, calculate the p-value for H₁: μ > μ₀ from the t in E3, with n − 1 degrees of freedom.',
        sheet: labelSheet({ E3: T_FORMULA }),
        cell: 'E4', answer: '=T.DIST.RT(E3,E2-1)',
        alt: ['=1-T.DIST(E3,E2-1,TRUE)', '=T.DIST(-E3,E2-1,TRUE)'],
        view: 'A1:E41', maxHeight: '20rem',
        formats: { B: '0.0', E3: '0.000', E4: '0.00E+00' }, widths: { D: 20 },
        wrong: [
          { formula: '=T.DIST(E3,E2-1,TRUE)', say: 'T.DIST with TRUE is the left tail, P(T ≤ t). The alternative μ > μ₀ points right: T.DIST.RT.' },
          { formula: '=T.DIST.2T(ABS(E3),E2-1)', say: 'That is the two-sided p-value, twice the one-sided one. The alternative here is one-sided (μ > μ₀).' },
          { formula: '=T.DIST.RT(E3,E2)', say: 'A one-sample t test has n − 1 degrees of freedom: E2-1.' },
          { formula: '=1-NORM.S.DIST(E3,TRUE)', say: 'That uses the normal distribution. With s estimated from the sample, the statistic follows the t distribution: T.DIST.RT.' },
        ],
        hints: ['Upper-tail alternative, so the area to the right of t.', 'T.DIST.RT(x, deg_freedom) with deg_freedom = E2-1.'],
      },
      {
        id: 'b04-ht-g1-s3', type: 'mc',
        prompt: `The test gives t ≈ ${fx(TL.t)} and p ≈ ${sci(TL.p)}. Which conclusion should Ana write?`,
        options: [
          'The bags’ mean fill is above the 1,000 g label, though 5 of the 40 bags weighed less than that.',
          'Every bag Kilnworth fills weighs more than 1,000 g, because the test rejected H₀ so decisively.',
          'The probability that the mean fill is 1,000 g or less is below 0.0001, so the label is met for every customer.',
          'Because the bags average more than the label, her earlier finding that they average less than 1,004 g was wrong.',
        ],
        answer: 0,
        hints: ['A test of μ is about the average bag, not each bag.'],
        feedback: {
          1: 'The test is about the mean. Five of the 40 bags were under 1,000 g: individual bags vary around the mean.',
          2: 'A p-value is not the probability that H₀ is true, and a statement about the mean says nothing about every customer’s bag.',
          3: 'Both can be true: the mean lies between the label and the setting. The two tests answer different questions.',
        },
      },
    ],
  },
  {
    id: 'b04-ht-g2', type: 'formula', kind: 'numerical',
    prompt: 'Taking Kilnworth’s σ in E2 as known, calculate in E3 the p-value of a z test of H₀: μ = μ₀ against H₁: μ < μ₀ for the 40 bags in B2:B41, using Excel’s Z.TEST.',
    sheet: zSheet,
    cell: 'E3', answer: '=1-Z.TEST(B2:B41,E1,E2)',
    require: ['Z.TEST'],
    view: 'A1:E41', maxHeight: '20rem',
    formats: { B: '0.0', E3: '0.0000' }, widths: { D: 22 },
    wrong: [
      { formula: '=Z.TEST(B2:B41,E1,E2)', say: 'Z.TEST returns the upper-tail p-value, the probability of a sample mean above the observed one. That is 0.9958 here; the lower tail is 1 minus it.' },
      { formula: '=1-Z.TEST(B2:B41,E1)', say: 'Without sigma, Z.TEST uses the sample standard deviation. The question takes σ from E2 as known: give Z.TEST its third argument.' },
      { formula: '=2*MIN(Z.TEST(B2:B41,E1,E2),1-Z.TEST(B2:B41,E1,E2))', say: 'That is Microsoft’s two-sided p-value. The alternative here is one-sided, μ < μ₀.' },
    ],
    hints: [
      'Z.TEST(array, x, sigma) = 1 − NORM.S.DIST(z, TRUE): the probability above the observed mean.',
      'You want the probability below it: <x>=1-Z.TEST(B2:B41,E1,E2)</x>.',
    ],
    solution: `<x>=1-Z.TEST(B2:B41,E1,E2)</x> = ${fx(1 - zXl, 4)}. Z.TEST itself returns ${fx(zXl, 4)}, the upper tail, because the sample mean (${fx(KG.mean)} g) is below μ₀. The same p-value comes from <x>=NORM.S.DIST((AVERAGE(B2:B41)-E1)/(E2/SQRT(COUNT(B2:B41))),TRUE)</x>, with z ≈ ${neg((KG.mean - K.setting) / (K.sd / Math.sqrt(KG.n)))}.`,
  },
  {
    id: 'b04-ht-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Beacon Fitness (fictional) tests whether a new induction session raises new members’ average number of visits in their first month above last year’s 6.0. The one-sided test gives p = 0.03. Which statement is correct?',
    options: [
      'With no real effect, a sample mean this high or higher would turn up in about 3% of samples.',
      'There is a 3% chance that the new induction session makes no difference at all to members’ visits.',
      'There is a 97% chance that the new induction raises members’ average visits in their first month.',
      'The new induction raises the average number of first-month visits by about 3% on last year.',
    ],
    answer: 0,
    hints: ['A p-value is calculated assuming H₀ is true.', 'It is a probability about the data, given H₀; not about H₀, given the data.'],
    feedback: {
      1: 'That reads the p-value as the probability that H₀ is true. The p-value assumes H₀ is true and asks how surprising the data are.',
      2: '1 − p is not the probability that H₁ is true. The ASA’s second principle warns against exactly this reading.',
      3: 'A p-value is not an effect size. The size of the rise comes from the sample mean and its interval.',
    },
    solution: 'The p-value is the probability, if H₀ is true (the induction makes no difference, μ = 6.0), of a result at least as extreme as the one observed. p = 0.03 means a sample this far above 6.0 would happen about 3% of the time by chance. It is evidence against H₀ at α = 0.05, but it is not the probability of either hypothesis and says nothing about how large the rise is.',
  },
  {
    id: 'b04-ht-g4', type: 'num', kind: 'numerical',
    prompt: `One of Ana’s targets for the shop (B01) is that at least ${TARGETS.returningShare}% of orders come from returning customers. In December the shop took ${decOrders} orders, ${SHOP.newCustomers[DEC]} of them a new customer’s first order. Test H₀: p = 0.35 against H₁: p < 0.35, where p is the underlying share of orders from returning customers. Calculate the z statistic, to two decimal places.`,
    answer: r2(RET.z), check: () => ((decOrders - SHOP.newCustomers[DEC]) / decOrders - 0.35) / Math.sqrt((0.35 * 0.65) / decOrders),
    unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(retWrongSE), say: 'You built the standard error from p̂. A test works under H₀, so the standard error uses p₀: √(0.35 × 0.65 ÷ 583).' },
      { value: r2(retWrongNew), say: 'That uses the share of first orders. Returning orders are the rest: 583 − 414 = 169.' },
      { value: r2((RET.p - p35) * 100), say: 'That is the gap in percentage points. Divide the gap in proportions by its standard error to get z.' },
    ],
    hints: [
      'Returning orders are all orders except first orders: 583 − 414. The standard error under H₀ is √(p₀(1 − p₀) ÷ n) with p₀ = 0.35.',
      `p̂ = 169 ÷ 583 = ${fx(RET.p, 4)}; z = (${fx(RET.p, 4)} − 0.35) ÷ ${fx(RET.se0, 6)}.`,
    ],
    solution: `p̂ = ${decReturning} ÷ ${decOrders} = ${fx(RET.p, 4)}; SE = √(0.35 × 0.65 ÷ ${decOrders}) = ${fx(RET.se0, 6)}; z = (${fx(RET.p, 4)} − 0.35) ÷ ${fx(RET.se0, 6)} ≈ ${neg(RET.z)}. The p-value, <x>=NORM.S.DIST(${neg(RET.z, 3).replace('−', '-')},TRUE)</x>, is ${fx(RET.pValue, 4)}: strong evidence that December’s share was below 35%. The test doesn’t say the shortfall is bad news. December brought ${SHOP.newCustomers[DEC]} first-time buyers with the gift boxes, and its ${decReturning} returning orders were the most of any month since July (${Math.max(...returningByMonth.slice(0, DEC))} at most before), so the share fell because new customers flooded in. One customer can also place several orders, so orders are only roughly independent trials.`,
  },
];

export const independent = [
  {
    id: 'b04-ht-i1', type: 'formula', kind: 'numerical',
    prompt: 'Ana’s staffing plan allows 40 minutes to set up a catering event (fictional). B2:B25 hold the set-up times of 24 autumn events drawn at random; E2 holds the t statistic for H₀: μ = μ₀ (μ₀ in E1) and E3 the degrees of freedom. In E4, calculate the two-sided p-value.',
    sheet: setupSheet,
    cell: 'E4', answer: '=T.DIST.2T(ABS(E2),E3)',
    alt: ['=2*T.DIST.RT(ABS(E2),E3)', '=2*T.DIST(-ABS(E2),E3,TRUE)', '=2*(1-T.DIST(ABS(E2),E3,TRUE))'],
    view: 'A1:E25', maxHeight: '20rem',
    formats: { E2: '0.000', E4: '0.0000' }, widths: { B: 16, D: 14 },
    wrong: [
      { formula: '=T.DIST.2T(E2,E3)', say: 'T.DIST.2T returns #NUM! for a negative x, and this t is negative. Give it the size of t: ABS(E2).' },
      { formula: '=T.DIST(E2,E3,TRUE)', say: 'That is one tail, P(T ≤ t). A two-sided test counts both tails: T.DIST.2T(ABS(E2),E3).' },
      { formula: '=T.DIST.2T(ABS(E2),E3+1)', say: 'E3 already holds the degrees of freedom, n − 1. Use it as it is.' },
      { formula: '=2*(1-NORM.S.DIST(ABS(E2),TRUE))', say: 'That is the normal distribution’s two-sided p-value. With s from the sample, use the t distribution with E3 degrees of freedom.' },
    ],
    solution: `<x>=T.DIST.2T(ABS(E2),E3)</x> = ${fx(SU.p, 4)}, with t = ${neg(SU.t, 3)} and 23 degrees of freedom. Fail to reject H₀ at 5%: the mean of ${fx(SU.mean, 2)} minutes is compatible with 40. The 95% interval, ${fx(SU.low, 1)} to ${fx(SU.high, 1)} minutes, includes 40, as a non-significant two-sided test at 5% requires.`,
  },
  {
    id: 'b04-ht-i2', type: 'num', kind: 'numerical',
    prompt: 'A one-sided t test of H₁: μ > μ₀ at α = 0.01 uses a sample of 15 observations. What is the critical value of t? Give three decimal places.',
    answer: Math.round(I.tInv(0.99, 14) * 1000) / 1000, check: () => I.tInv(0.99, 14), unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: Math.round(I.tInv(0.995, 14) * 1000) / 1000, say: 'That is the two-sided critical value, with 0.5% in each tail (T.INV.2T(0.01,14)). A one-sided test puts the whole 1% in the upper tail: T.INV(0.99,14).' },
      { value: Math.round(I.tInv(0.99, 15) * 1000) / 1000, say: 'That uses 15 degrees of freedom. A one-sample t test has n − 1 = 14.' },
      { value: Math.round(I.normInv(0.99) * 1000) / 1000, say: 'That is the standard normal value, z₀.₉₉. With s estimated from 15 values, use the t distribution with 14 degrees of freedom, whose tails are heavier.' },
    ],
    solution: `With 1% in the upper tail and 14 degrees of freedom, <x>=T.INV(0.99,14)</x> = ${fx(I.tInv(0.99, 14), 3)}. Reject H₀ if t > ${fx(I.tInv(0.99, 14), 3)}. The two-sided value at 1%, <x>=T.INV.2T(0.01,14)</x> = ${fx(I.tInv(0.995, 14), 3)}, is larger, and z₀.₉₉ = ${fx(I.normInv(0.99), 3)} smaller.`,
  },
  {
    id: 'b04-ht-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For each situation, say whether the decision is a Type I error, a Type II error or a correct decision.',
    items: [
      'The machine averages 1,004 g, but Ana’s test rejects H₀ and she complains to Kilnworth.',
      'The machine averages 1,002 g, and Ana’s test fails to reject H₀.',
      'The machine averages 1,002 g, and Ana’s test rejects H₀.',
      'The machine averages 1,004 g, and Ana’s test fails to reject H₀.',
      'A redesigned page converts no better than the old one, but a test declares it significantly better.',
      'A price rise really does lose customers, but a small survey finds no significant change.',
    ],
    categories: ['Type I error', 'Type II error', 'Correct decision'],
    answer: [0, 1, 2, 2, 0, 1],
    feedback: {
      0: 'H₀ is true and was rejected: a false alarm, a Type I error. Its probability is α.',
      1: 'H₀ is false (the machine fills light) and the test missed it: a Type II error, probability β.',
      2: 'H₀ is false and was rejected: the test had the power to catch it.',
      5: 'The effect is real and the test missed it, probably because the sample was too small: a Type II error.',
    },
    solution: 'A Type I error rejects a true null (the machine is fine, or the page is no better, but the test says otherwise). A Type II error fails to reject a false null (the machine fills light, or the price rise loses customers, and the test doesn’t detect it). Rejecting a false null and failing to reject a true one are correct decisions.',
  },
  {
    id: 'b04-ht-i4', type: 'multi', kind: 'applied',
    prompt: 'Ana wants her next check of Kilnworth’s bags to have more power to detect a 1 g underfill. Select all the changes that raise the power.',
    options: [
      'Weighing 60 bags from the delivery instead of 40.',
      'Testing at α = 0.10 instead of 0.05, accepting more false alarms.',
      'Using scales that read to 0.1 g, so that less of the spread is measurement error.',
      'Switching from the one-sided test to a two-sided test at the same α.',
      'Testing at α = 0.01 so that the result is more convincing.',
      'Weighing each of the 40 bags twice and treating the 80 weighings as 80 bags.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A two-sided test splits α between the tails, so the lower critical value moves further out and power to detect an underfill falls.',
      4: 'A stricter α moves the critical value further out: fewer false alarms, but more missed underfills, so less power.',
      5: 'Weighing a bag twice measures the scales, not the machine. The 80 numbers are not 80 independent bags, so the test would overstate its precision.',
    },
    solution: 'Power rises with the sample size (60 bags), with a larger α (0.10, at the price of more false alarms) and with less noise (better scales reduce σ). A two-sided test or a stricter α lowers power for the same underfill, and repeated weighings of the same bags add no information about the machine while making the test look more precise than it is.',
  },
  {
    id: 'b04-ht-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete Ana’s reasoning about her one-sided test of the 1,004 g setting.',
    text: 'Because p = 0.0025 is [[0]] α = 0.05, Ana [[1]] H₀. The p-value is the probability of a sample mean of 1,002.75 g or less [[2]]. If p had been 0.12, she would have [[3]].',
    blanks: [
      { options: ['above', 'below', 'equal to'], answer: 1 },
      { options: ['fails to reject', 'accepts', 'rejects'], answer: 2 },
      { options: ['given that the machine fills light', 'if the machine averages 1,004 g', 'if the sample is unrepresentative'], answer: 1 },
      { options: ['shown that the machine averages 1,004 g', 'shown that the machine fills light with probability 0.88', 'found no convincing evidence that the machine fills light'], answer: 2 },
    ],
    solution: 'p = 0.0025 is below α = 0.05, so Ana rejects H₀. The p-value is calculated assuming H₀, that the machine averages 1,004 g. With p = 0.12 she would fail to reject H₀: no convincing evidence of underfilling, which doesn’t show the machine is on target, and 1 − p is not the probability that it fills light.',
  },
  {
    id: 'b04-ht-i6', type: 'formula', kind: 'applied',
    prompt: 'Kinfolk Trust (fictional), a charity, expects 5% of the people who receive an appeal letter to donate. Its latest appeal went to the number in B1 and brought the donations in B2; the benchmark p₀ is in B3. In B5, calculate the p-value of a one-proportion z test of H₀: p = p₀ against H₁: p < p₀.',
    sheet: kinSheet,
    cell: 'B5', answer: '=NORM.S.DIST((B2/B1-B3)/SQRT(B3*(1-B3)/B1),TRUE)',
    alt: ['=1-NORM.S.DIST((B3-B2/B1)/SQRT(B3*(1-B3)/B1),TRUE)', '=NORM.DIST(B2/B1,B3,SQRT(B3*(1-B3)/B1),TRUE)'],
    view: 'A1:B5',
    formats: { B3: '0.0%', B5: '0.0000' }, widths: { A: 24 },
    wrong: [
      { formula: '=NORM.S.DIST((B2/B1-B3)/SQRT(B2/B1*(1-B2/B1)/B1),TRUE)', say: 'That builds the standard error from p̂. A test asks how p̂ would vary if H₀ were true, so it uses p₀: SQRT(B3*(1-B3)/B1).' },
      { formula: '=1-NORM.S.DIST((B2/B1-B3)/SQRT(B3*(1-B3)/B1),TRUE)', say: 'That is the upper tail. The alternative p < p₀ points down: NORM.S.DIST(z, TRUE) on its own.' },
      { formula: '=NORM.S.DIST((B2/B1-B3)/SQRT(B3*(1-B3)/B1),FALSE)', say: 'With FALSE, NORM.S.DIST returns the height of the curve, not a probability. Use TRUE for the area to the left of z.' },
    ],
    solution: `p̂ = ${KIN.gifts} ÷ ${KIN.letters.toLocaleString('en-US')} = ${fx(kinT.p, 5)}; SE = √(0.05 × 0.95 ÷ ${KIN.letters.toLocaleString('en-US')}) = ${fx(kinT.se0, 5)}; z = (${fx(kinT.p, 5)} − 0.05) ÷ ${fx(kinT.se0, 5)} ≈ ${neg(kinT.z)}; p ≈ ${fx(kinT.pValue, 4)}. At α = 0.05 the appeal’s response rate is below the 5% benchmark; np₀ = ${(KIN.letters * KIN.p0).toLocaleString('en-US')} and n(1 − p₀) = ${(KIN.letters * (1 - KIN.p0)).toLocaleString('en-US')} are well above 10, so the normal model is reasonable. Whether a shortfall of about ${fx((KIN.p0 - kinT.p) * 100, 1)} points matters depends on what the appeal cost.`,
  },
];

export const check = [
  {
    id: 'b04-ht-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Hearthstone Bakery (fictional) weighs a random sample of its sourdough loaves; the 95% t interval for the mean weight is 796.1 g to 803.4 g. Which hypothesised mean would a two-sided t test at the 5% level reject?',
    options: ['795 g', '800 g', '803 g', '797 g'],
    answer: 0,
    feedback: {
      1: '800 g lies inside the interval, so a two-sided test at 5% would not reject it.',
      2: '803 g is inside the interval, just below its upper end of 803.4 g, so it is not rejected.',
      3: '797 g is inside the interval, just above its lower end of 796.1 g, so it is not rejected.',
    },
    solution: 'A two-sided t test at level α rejects μ₀ exactly when μ₀ lies outside the (1 − α) t interval built from the same sample. Only 795 g is outside 796.1 to 803.4 g.',
  },
  {
    id: 'b04-ht-k2', type: 'formula', kind: 'numerical',
    prompt: 'Dalton Foods (fictional) labels its cereal boxes 500 g. B2:B31 hold the weights of 30 boxes taken at random from a day’s production. In E2, calculate in one formula the p-value of a t test of H₀: μ = μ₀ against H₁: μ < μ₀, with μ₀ in E1.',
    sheet: boxSheet,
    cell: 'E2', answer: '=T.DIST((AVERAGE(B2:B31)-E1)/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31)-1,TRUE)',
    alt: ['=1-T.DIST.RT((AVERAGE(B2:B31)-E1)/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31)-1)', '=T.DIST.RT((E1-AVERAGE(B2:B31))/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31)-1)'],
    view: 'A1:E31', maxHeight: '20rem',
    formats: { B: '0.0', E2: '0.0000' }, widths: { D: 20 },
    wrong: [
      { formula: '=T.DIST.RT((AVERAGE(B2:B31)-E1)/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31)-1)', say: 'T.DIST.RT is the upper tail. The alternative μ < μ₀ needs the lower tail: T.DIST(t, df, TRUE).' },
      { formula: '=T.DIST((AVERAGE(B2:B31)-E1)/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31)-1,FALSE)', say: 'With FALSE, T.DIST returns the height of the curve, not a probability. Use TRUE for the cumulative area.' },
      { formula: '=T.DIST((AVERAGE(B2:B31)-E1)/(STDEV.S(B2:B31)/SQRT(COUNT(B2:B31))),COUNT(B2:B31),TRUE)', say: 'A one-sample t test has n − 1 degrees of freedom: COUNT(B2:B31)-1.' },
      { formula: '=1-Z.TEST(B2:B31,E1)', say: 'Without sigma, Z.TEST plugs the sample SD into the normal distribution. That is a z test, not the t test asked for.' },
    ],
    solution: `t = (${fx(BX.mean, 3)} − 500) ÷ (${fx(BX.sd, 3)} ÷ √30) ≈ ${neg(BX.t, 2)} with 29 degrees of freedom, and <x>=T.DIST(t,29,TRUE)</x> ≈ ${fx(BX.p, 4)}. At α = 0.05 the boxes are underweight on average, by about ${fx(500 - BX.mean, 1)} g.`,
  },
  {
    id: 'b04-ht-k3', type: 'num', kind: 'numerical',
    prompt: 'Hawthorn Pharmacy (fictional) promises prescriptions in 15 minutes on average. For 25 customers chosen at random, the wait averaged 16.8 minutes with a standard deviation of 4.0 minutes. Calculate the t statistic for H₀: μ = 15 minutes. Give two decimal places.',
    answer: 2.25, check: () => (16.8 - 15) / (4.0 / Math.sqrt(25)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.45, say: 'You divided by the standard deviation. The t statistic divides by the standard error, s ÷ √n = 4.0 ÷ 5 = 0.8.' },
      { value: 11.25, say: 'You divided s by n instead of √n: the standard error is 4.0 ÷ √25 = 0.8.' },
    ],
    solution: 'SE = 4.0 ÷ √25 = 0.8 minutes, so t = (16.8 − 15) ÷ 0.8 = 2.25, with 24 degrees of freedom. For H₁: μ > 15 the p-value is <x>=T.DIST.RT(2.25,24)</x>, about 0.017.',
  },
  {
    id: 'b04-ht-k4', type: 'mc', kind: 'applied',
    prompt: 'Bellwood Stores (fictional) timed 50,000 checkout transactions after new card readers were installed: the mean was 61.6 seconds against a long-run 62.0 seconds, and a one-sample t test gives p = 0.0001. The new readers cost $180,000. What should the operations manager conclude?',
    options: [
      'The fall is very unlikely to be chance, but 0.4 seconds may not repay $180,000: judge its size and value.',
      'The p-value is tiny, so the new readers have a large effect and the $180,000 investment has clearly paid off.',
      'With a p-value of 0.0001 there is a 99.99% chance that the new readers made checkout faster.',
      'The test is invalid, because samples as large as 50,000 always produce significant results whatever the truth.',
    ],
    answer: 0,
    feedback: {
      1: 'A tiny p-value says the effect is unlikely to be zero, not that it is large. With 50,000 transactions a 0.4-second change is detectable.',
      2: '1 − p is not the probability that the alternative is true.',
      3: 'Large samples detect small real differences; they don’t make a true null look false more often than α. The test is valid; its result is small.',
    },
    solution: 'Statistical significance shows the 0.4-second fall is unlikely to be chance alone. Practical significance asks whether 0.4 seconds a transaction is worth $180,000: multiply by the transactions a year and the value of a second of staff and customer time, and look at the interval for the saving. The ASA’s fifth principle: a p-value does not measure the size or importance of an effect.',
  },
  {
    id: 'b04-ht-k5', type: 'num', kind: 'applied',
    prompt: 'Every month a manager tests each of 20 product categories for a change in average basket value, at α = 0.05. In a month when nothing has changed in any category, what is the probability that at least one test is significant? Assume the tests are independent and give a percentage to one decimal place.',
    answer: Math.round((1 - 0.95 ** 20) * 1000) / 10, check: () => (1 - 0.95 ** 20) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 5, say: 'That is the chance for one test. With 20 tests there are 20 chances of a false alarm.' },
      { value: 100, say: 'Adding 20 × 5% overcounts: the chance of at least one is 1 − 0.95²⁰, which can never reach 100%.' },
      { value: Math.round(0.95 ** 20 * 1000) / 10, say: 'That is the chance that none of the 20 tests is significant. The chance of at least one is 1 minus that.' },
    ],
    solution: `P(no false alarm) = 0.95²⁰ = ${fx(0.95 ** 20, 3)}, so P(at least one) = 1 − ${fx(0.95 ** 20, 3)} = ${fx(1 - 0.95 ** 20, 3)}, about ${fx((1 - 0.95 ** 20) * 100, 1)}%. One false alarm a month is expected (20 × 0.05). Testing each category at 0.05 ÷ 20 = 0.0025 (Bonferroni) keeps the monthly chance of any false alarm below 5%.`,
  },
  {
    id: 'b04-ht-k6', type: 'formula', kind: 'applied',
    prompt: 'Dalton Foods plans its next check of the 500 g boxes: B1 holds the shortfall it wants to detect, B2 a planning SD, B3 the number of boxes and B4 α for a one-sided z test. In B6, calculate the power.',
    sheet: powerSheet,
    cell: 'B6', answer: '=NORM.S.DIST(ABS(B1)/(B2/SQRT(B3))-NORM.S.INV(1-B4),TRUE)',
    alt: ['=NORM.S.DIST(B1/(B2/SQRT(B3))-NORM.S.INV(1-B4),TRUE)', '=1-NORM.S.DIST(NORM.S.INV(1-B4)-B1/(B2/SQRT(B3)),TRUE)', '=NORM.S.DIST(B1*SQRT(B3)/B2+NORM.S.INV(B4),TRUE)'],
    view: 'A1:B6',
    formats: { B6: '0.000' }, widths: { A: 20 },
    wrong: [
      { formula: '=NORM.S.DIST(ABS(B1)/(B2/SQRT(B3))-NORM.S.INV(1-B4/2),TRUE)', say: 'NORM.S.INV(1-B4/2) is the two-sided critical value. This check is one-sided: NORM.S.INV(1-B4).' },
      { formula: '=NORM.S.DIST(ABS(B1)/B2-NORM.S.INV(1-B4),TRUE)', say: 'The shortfall must be measured in standard errors of the mean, σ ÷ √n, not in standard deviations of single boxes.' },
      { formula: '=1-NORM.S.DIST(ABS(B1)/(B2/SQRT(B3))-NORM.S.INV(1-B4),TRUE)', say: 'That is β, the chance of missing the shortfall. Power is 1 − β.' },
    ],
    solution: `Power = Φ(|δ| ÷ (σ ÷ √n) − z₁₋α) = Φ(1.5 ÷ (3.3 ÷ √30) − 1.645) = Φ(${fx(PL.delta / (PL.sigma / Math.sqrt(PL.n)), 3)} − 1.645) ≈ ${fx(plPower, 3)}. Thirty boxes give about an ${Math.round(plPower * 100)}% chance of detecting a 1.5 g shortfall; for a 1 g shortfall the same check would have only about ${Math.round(I.powerMean({ delta: 1, sigma: PL.sigma, n: PL.n, alpha: PL.alpha, alternative: 'greater' }) * 100)}% power.`,
  },
];
