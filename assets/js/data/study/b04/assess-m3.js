// assess-m3.js — B04 module 3 test: Testing hypotheses (hypothesis-testing, comparing-means). New questions on new
// businesses, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Every
// business, person and number is fictional. Formula items are marked by their results (core/sheet.js gradeFormula);
// every num item's `check` recomputes its answer.
import * as I from '../../../core/inference.js?v=12';
import { mean, sd } from '../../../core/stats.js?v=12';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const r = (x, p) => Math.round(x * 10 ** p) / 10 ** p;

// Brookfield Water: 36 bottles labelled 500 ml; the filler's SD is known to be 4 ml
const BOTTLES = [493.5, 500.1, 501.9, 495.5, 495.6, 497.5, 495.9, 498.4, 504.8, 497.3, 501.2, 495.8, 499.8, 501.4, 499.1, 504.3, 504.8, 503.1, 494.2, 499.7, 496.8, 495.6, 493.4, 495.8, 500.5, 493.3, 499, 497.4, 497.1, 500.4, 506.2, 503.1, 492.4, 500.5, 498.6, 495.9];
const BZ = I.zTest1(BOTTLES, 500, 4);
const bottleSheet = { cells: { A1: 'Bottle', B1: 'Volume (ml)', ...col('A', 2, BOTTLES.map((_, i) => i + 1)), ...col('B', 2, BOTTLES), D1: 'μ₀ (ml)', E1: 500, D2: 'Known σ (ml)', E2: 4, D3: 'p-value, two-sided' }, vary: { E1: [499.5, 500.5], E2: [3.5, 4.5] } };
// Alderley Clinic: 192 of 240 appointments started on time; target 85%
const AL = I.propTest1(192, 240, 0.85, { alternative: 'less' });
const alWrong = I.normCdf((192 / 240 - 0.85) / Math.sqrt((0.8 * 0.2) / 240));
// Brookfield's planning numbers
const nPlan = I.sampleSizeForPower({ delta: 1.5, sigma: 4, alpha: 0.05, power: 0.9, alternative: 'less' });
const nRaw = (za, zb) => ((za + zb) * 4 / 1.5) ** 2;
// Lighthouse Cinemas: snack spend per customer ($) at two sites
const SITE_A = [6.82, 7, 5.59, 14.4, 13.73, 7.26, 11.09, 17.98, 13.15, 8.07, 10.56, 14.06, 11.58, 12.23, 12.5];
const SITE_B = [10.15, 6.28, 7.04, 8.44, 10.38, 7.32, 9.08, 12.45, 10.61, 7.99, 7.99, 10.66, 4.86, 9.23, 11.51, 10.1, 10.41, 3.91];
const LW = I.tTest2(SITE_A, SITE_B), LP = I.tTest2(SITE_A, SITE_B, { equalVar: true });
const snackSheet = { cells: { A1: 'Riverside site ($)', B1: 'Market Street site ($)', ...col('A', 2, SITE_A), ...col('B', 2, SITE_B), D1: 'Welch’s t' } };
// Silverline Car Hire: weekly rentals at 11 branches, the week before and the week after a price rise
const BEFORE = [84, 78, 65, 77, 75, 76, 65, 65, 75, 77, 80];
const AFTER = [82, 75, 62, 78, 69, 76, 63, 66, 70, 70, 81];
const SP = I.tTestPaired(AFTER, BEFORE);
const rentSheet = { cells: { A1: 'Branch', B1: 'Before', C1: 'After', ...col('A', 2, BEFORE.map((_, i) => `S${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, BEFORE), ...col('C', 2, AFTER), E1: 'p-value (H₁: rentals fell)' } };
// Alderley Clinic: 14 receptionists timed before and after a new booking system (paired summary)
const CL = { n: 14, dbar: 3.1, sd: 4.2 };
const clT = I.tInv(0.975, CL.n - 1), clSE = CL.sd / Math.sqrt(CL.n);

export const items = [
  // ---------------------------------------------------------------- hypothesis-testing
  {
    id: 'b04-m3-1', lesson: 'hypothesis-testing', type: 'mc', kind: 'conceptual',
    prompt: 'Wexford Ferries (fictional) advertises that its crossing takes 45 minutes on average. A group of regular passengers believes crossings take longer, and plans to time a random sample of crossings. Which pair of hypotheses should they test?',
    options: [
      'H₀: μ = 45 minutes against H₁: μ > 45 minutes, where μ is the mean of all crossings.',
      'H₀: μ > 45 minutes against H₁: μ = 45 minutes, where μ is the mean of all crossings.',
      'H₀: x̄ = 45 minutes against H₁: x̄ > 45 minutes, where x̄ is the mean of the timed crossings.',
      'H₀: μ < 45 minutes against H₁: μ ≥ 45 minutes, where μ is the mean of all crossings.',
    ],
    answer: 0,
    feedback: {
      1: 'The equality belongs in the null hypothesis: the test assumes the advertised 45 minutes and looks for evidence of more. The passengers’ claim is the alternative.',
      2: 'Hypotheses are about the population mean μ of all crossings. The sample mean x̄ is known once the crossings are timed.',
      3: 'The null must contain the equality (=, ≤ or ≥), and the claim needing evidence, “longer”, is μ > 45.',
    },
    solution: 'The null hypothesis is the advertised claim, with the equality: H₀: μ = 45 (or μ ≤ 45). The passengers’ belief, the claim that needs evidence, is the one-sided alternative H₁: μ > 45. Both are about μ, the mean of all crossings, not the sample mean.',
  },
  {
    id: 'b04-m3-2', lesson: 'hypothesis-testing', type: 'formula', kind: 'numerical',
    prompt: 'Brookfield Water (fictional) fills bottles labelled 500 ml on a filler whose standard deviation is known to be 4 ml (E2). B2:B37 hold the volumes of 36 bottles taken at random. In E3, calculate the p-value of a two-sided z test of H₀: μ = μ₀, with μ₀ in E1.',
    sheet: bottleSheet,
    cell: 'E3', answer: '=2*MIN(Z.TEST(B2:B37,E1,E2),1-Z.TEST(B2:B37,E1,E2))',
    alt: ['=2*(1-NORM.S.DIST(ABS((AVERAGE(B2:B37)-E1)/(E2/SQRT(COUNT(B2:B37)))),TRUE))', '=2*NORM.S.DIST(-ABS((AVERAGE(B2:B37)-E1)/(E2/SQRT(COUNT(B2:B37)))),TRUE)'],
    view: 'A1:E37', maxHeight: '20rem',
    formats: { B: '0.0', E3: '0.0000' }, widths: { D: 18 },
    wrong: [
      { formula: '=Z.TEST(B2:B37,E1,E2)', say: 'Z.TEST returns the one-tailed, upper-tail p-value. For two sides, Microsoft’s formula is 2 × MIN(Z.TEST, 1 − Z.TEST).' },
      { formula: '=2*Z.TEST(B2:B37,E1,E2)', say: 'Doubling Z.TEST works only when the sample mean is above μ₀. Here it is below, so Z.TEST is above 0.5 and doubling it gives more than 1. Use MIN.' },
      { formula: '=2*MIN(Z.TEST(B2:B37,E1),1-Z.TEST(B2:B37,E1))', say: 'Without its third argument, Z.TEST uses the sample standard deviation. The filler’s σ is known: give Z.TEST E2.' },
      { formula: '=1-Z.TEST(B2:B37,E1,E2)', say: 'That is the lower-tail p-value, for H₁: μ < μ₀. The question is two-sided.' },
    ],
    solution: `The sample mean is ${fx(BZ.mean, 2)} ml, so z = (${fx(BZ.mean, 2)} − 500) ÷ (4 ÷ 6) ≈ ${neg(BZ.z)} and the two-sided p-value is ${fx(BZ.p, 4)}: <x>=2*MIN(Z.TEST(B2:B37,E1,E2),1-Z.TEST(B2:B37,E1,E2))</x>. At α = 0.05 the bottles’ mean differs from 500 ml; the shortfall is about ${fx(500 - BZ.mean, 1)} ml.`,
  },
  {
    id: 'b04-m3-3', lesson: 'hypothesis-testing', type: 'num', kind: 'numerical',
    prompt: 'Alderley Clinic (fictional) aims to start 85% of appointments on time. In a random sample of 240 appointments, 192 started on time. Test H₀: p = 0.85 against H₁: p < 0.85. What is the p-value? Give three decimal places.',
    answer: r(AL.pValue, 3), check: () => I.normCdf((192 / 240 - 0.85) / Math.sqrt((0.85 * 0.15) / 240)), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: r(2 * AL.pValue, 3), say: 'That is the two-sided p-value. The alternative is one-sided, p < 0.85, so use one tail.' },
      { value: r(alWrong, 3), say: 'You built the standard error from p̂ = 0.80. The test assumes H₀, so the standard error uses p₀: √(0.85 × 0.15 ÷ 240).' },
    ],
    solution: `p̂ = 192 ÷ 240 = 0.80. SE = √(0.85 × 0.15 ÷ 240) = ${fx(AL.se0, 4)}; z = (0.80 − 0.85) ÷ ${fx(AL.se0, 4)} ≈ ${neg(AL.z)}; p = <x>=NORM.S.DIST(${neg(AL.z, 3).replace('−', '-')},TRUE)</x> ≈ ${fx(AL.pValue, 3)}. At α = 0.05 the clinic is falling short of its target. The conditions hold: np₀ = 204 and n(1 − p₀) = 36 are both at least 10.`,
  },
  {
    id: 'b04-m3-4', lesson: 'hypothesis-testing', type: 'classify', kind: 'conceptual',
    prompt: 'A small trial of a new store layout (fictional) compared average spend with the old layout’s known average and gave a two-sided p-value of 0.20. Classify each statement as supported or not supported by that result.',
    items: [
      'The data are compatible with no change in average spend.',
      'The trial shows that the new layout makes no difference to spend.',
      'The trial may have been too small to detect a real change.',
      'There is an 80% chance that the layout makes no difference.',
      'A 95% confidence interval for the change in spend would include 0.',
    ],
    categories: ['Supported', 'Not supported'],
    answer: [0, 1, 0, 1, 0],
    feedback: {
      1: 'Failing to reject is not accepting H₀: a p-value of 0.20 is a lack of evidence, not evidence of no effect.',
      3: 'A p-value is not the probability of a hypothesis, and 1 − p is not the probability that H₀ is true.',
      4: 'A two-sided test at 5% fails to reject exactly when the 95% interval contains the null value, here a change of 0.',
    },
    solution: 'p = 0.20 means data like these are quite likely if the layout makes no difference, so the data are compatible with no change, and the interval includes 0. That doesn’t show there is no effect (the trial may lack power), and it isn’t an 80% probability of anything.',
  },
  {
    id: 'b04-m3-5', lesson: 'hypothesis-testing', type: 'mc', kind: 'applied',
    prompt: 'Lighthouse Cinemas (fictional) will replace its ticketing software, at a cost of $250,000, if a test shows that average queue times have risen. Missing a real rise costs little, because queue times are reviewed every quarter. How should it set the significance level?',
    options: [
      'Use a small α such as 0.01, because a false alarm, a Type I error, is the expensive mistake here.',
      'Use a large α such as 0.10, because a Type II error, a missed rise, is the expensive mistake here.',
      'The choice of α doesn’t matter, because the p-value already takes the cost of each error into account.',
      'Choose α after seeing the p-value, so that the decision about the software matches what the data show.',
    ],
    answer: 0,
    feedback: {
      1: 'The costly error is replacing the software when queues haven’t risen: rejecting a true H₀, a Type I error. A missed rise is cheap, since it is caught next quarter.',
      2: 'A p-value knows nothing about costs. The costs of the two errors are what should set α.',
      3: 'Choosing α after seeing the result makes the test meaningless: any result could be called significant.',
    },
    solution: 'A Type I error (concluding queues rose when they didn’t) costs $250,000; a Type II error (missing a real rise) costs little because the next review will catch it. So keep the Type I risk small with α = 0.01, accepting lower power, and set α before seeing the data.',
  },
  {
    id: 'b04-m3-6', lesson: 'hypothesis-testing', type: 'num', kind: 'numerical',
    prompt: 'Brookfield Water wants its next check to have a 90% chance of detecting a 1.5 ml underfill with a one-sided z test at α = 0.05, taking σ = 4 ml. How many bottles does it need? Give a whole number, rounded up.',
    answer: nPlan, check: () => Math.ceil(nRaw(I.normInv(0.95), I.normInv(0.9))), unit: 'bottles', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(nRaw(I.normInv(0.975), I.normInv(0.9))), say: 'That uses z₀.₉₇₅ = 1.96, the two-sided value. The test is one-sided: z₀.₉₅ = 1.645.' },
      { value: Math.ceil(nRaw(I.normInv(0.95), I.normInv(0.8))), say: 'That is the sample size for 80% power. For 90% power use z₀.₉₀ = 1.282.' },
      { value: Math.ceil((I.normInv(0.95) + I.normInv(0.9)) * 4 / 1.5), say: 'You forgot to square: n = ((z₁₋α + z₁₋β) × σ ÷ δ)².' },
    ],
    solution: `n = ((z₀.₉₅ + z₀.₉₀) × σ ÷ δ)² = ((1.645 + 1.282) × 4 ÷ 1.5)² = ${fx((I.normInv(0.95) + I.normInv(0.9)) * 4 / 1.5, 3)}² ≈ ${fx(nRaw(I.normInv(0.95), I.normInv(0.9)), 1)}, so ${nPlan} bottles. Its 36-bottle sample had only about ${Math.round(I.powerMean({ delta: 1.5, sigma: 4, n: 36, alternative: 'greater' }) * 100)}% power for a 1.5 ml underfill.`,
  },
  {
    id: 'b04-m3-7', lesson: 'hypothesis-testing', type: 'multi', kind: 'applied',
    prompt: 'A marketing analyst (fictional) is checking whether a loyalty email changed spending. Select all the practices that make the p-value she reports misleadingly small.',
    options: [
      'Testing 15 customer segments and reporting only the one with p below 0.05.',
      'Adding a week of data and retesting each week until p falls below 0.05.',
      'Switching to a one-sided test after seeing which way spending moved.',
      'Writing down the hypotheses, α and the analysis before looking at the data.',
      'Reporting all 15 segment tests with their p-values, significant or not.',
      'Testing each of the 15 segments at α = 0.05 ÷ 15 instead of 0.05.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Fixing the analysis in advance is the main defence against p-hacking.',
      4: 'Full reporting is what the ASA’s fourth principle asks for: it lets readers judge how many chances there were for a false alarm.',
      5: 'Bonferroni’s adjustment makes each test stricter, which protects against multiple testing rather than exploiting it.',
    },
    solution: 'Selective reporting of one segment out of 15, retesting until significant, and choosing the tail after seeing the data all make the real chance of a false alarm larger than the reported p-value suggests. Pre-specifying the analysis, reporting every test and Bonferroni’s adjustment are the remedies.',
  },
  // ---------------------------------------------------------------- comparing-means
  {
    id: 'b04-m3-8', lesson: 'comparing-means', type: 'mc', kind: 'applied',
    prompt: 'Silverline Car Hire (fictional) had 18 agents each process a set of claims with the old software and then the same number with the new software, recording each agent’s average minutes per claim on both. Which analysis fits this design?',
    options: [
      'A paired t test on each agent’s difference, new minus old, because each agent is measured twice.',
      'Welch’s two-sample t test, because the two pieces of software may give different variances.',
      'The pooled two-sample t test, because the same number of agents used each piece of software.',
      'A one-sample t test of the new software’s average time against the old software’s overall mean time.',
    ],
    answer: 0,
    feedback: {
      1: 'Welch’s test is for independent samples. Here the same agents appear in both columns, so the values come in pairs.',
      2: 'Equal group sizes don’t make samples independent. Each agent’s two times belong together.',
      3: 'Treating the old mean as a known constant ignores its own sampling error and throws away the pairing.',
    },
    solution: 'Each agent provides both measurements, so the data are paired: test the mean of the 18 differences with a paired t test (T.TEST type 1, or the paired ToolPak tool). Pairing removes the large differences in speed between agents.',
  },
  {
    id: 'b04-m3-9', lesson: 'comparing-means', type: 'formula', kind: 'numerical',
    prompt: 'Lighthouse Cinemas compared snack spend per customer at two sites from random samples of customers: column A holds 15 values from the Riverside site and column B 18 from Market Street. In E1, calculate Welch’s t statistic (Riverside minus Market Street) from the data.',
    sheet: snackSheet,
    cell: 'E1', answer: '=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(VAR.S(A2:A16)/COUNT(A2:A16)+VAR.S(B2:B19)/COUNT(B2:B19))',
    alt: ['=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(STDEV.S(A2:A16)^2/COUNT(A2:A16)+STDEV.S(B2:B19)^2/COUNT(B2:B19))', '=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(VAR.S(A2:A16)/15+VAR.S(B2:B19)/18)'],
    view: 'A1:E19',
    formats: { A: '$0.00', B: '$0.00', E1: '0.000' }, widths: { A: 18, B: 22 },
    wrong: [
      { formula: '=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(STDEV.S(A2:A16)/COUNT(A2:A16)+STDEV.S(B2:B19)/COUNT(B2:B19))', say: 'Welch’s standard error adds the variances divided by n: VAR.S, or STDEV.S squared, not STDEV.S.' },
      { formula: '=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(VAR.S(A2:A16)+VAR.S(B2:B19))', say: 'Each variance must be divided by its sample size: the standard error of a difference in means, not of single customers.' },
      { formula: '=(AVERAGE(A2:A16)-AVERAGE(B2:B19))/SQRT(((COUNT(A2:A16)-1)*VAR.S(A2:A16)+(COUNT(B2:B19)-1)*VAR.S(B2:B19))/(COUNT(A2:A16)+COUNT(B2:B19)-2)*(1/COUNT(A2:A16)+1/COUNT(B2:B19)))', say: 'That is the pooled t statistic, which assumes equal variances. Welch’s keeps the two variances separate: √(s₁²/n₁ + s₂²/n₂).' },
    ],
    solution: `Riverside averages $${fx(mean(SITE_A))} (SD $${fx(sd(SITE_A))}) and Market Street $${fx(mean(SITE_B))} (SD $${fx(sd(SITE_B))}). SE = √(${fx(sd(SITE_A) ** 2, 3)} ÷ 15 + ${fx(sd(SITE_B) ** 2, 3)} ÷ 18) = ${fx(LW.se, 4)}, so t = ${fx(LW.diff, 3)} ÷ ${fx(LW.se, 4)} ≈ ${fx(LW.t, 3)}, with about ${fx(LW.df, 1)} degrees of freedom; <x>=T.TEST(A2:A16,B2:B19,2,3)</x> = ${fx(LW.p, 4)}. The pooled t would be ${fx(LP.t, 3)}.`,
  },
  {
    id: 'b04-m3-10', lesson: 'comparing-means', type: 'formula', kind: 'applied',
    prompt: 'Silverline raised its prices and recorded weekly rentals at 11 branches in the week before (B2:B12) and the week after (C2:C12), branch by branch. Before collecting the data it set the alternative that rentals fell. In E2, calculate the p-value for that alternative with T.TEST.',
    sheet: rentSheet,
    cell: 'E2', answer: '=T.TEST(C2:C12,B2:B12,1,1)',
    alt: ['=T.TEST(B2:B12,C2:C12,1,1)', '=T.TEST(C2:C12,B2:B12,2,1)/2'],
    view: 'A1:E12',
    formats: { E2: '0.0000' }, widths: { E: 24 },
    wrong: [
      { formula: '=T.TEST(C2:C12,B2:B12,2,1)', say: 'Tails = 2 gives the two-sided p-value. The alternative, set in advance, is one-sided, and the data point its way: tails = 1.' },
      { formula: '=T.TEST(C2:C12,B2:B12,1,3)', say: 'Type 3 treats the two weeks as independent groups. The same branches appear in both: type 1, paired.' },
      { formula: '=1-T.TEST(C2:C12,B2:B12,1,1)', say: 'Rentals did fall on average, so the alternative points the same way as the data and T.TEST’s one-tailed value is the p-value. 1 minus it would be the p-value for “rentals rose”.' },
    ],
    solution: `The changes average ${neg(SP.meanDiff)} rentals a branch (SD ${fx(SP.sdDiff, 2)}), so t = ${neg(SP.t, 3)} with 10 df. Rentals fell, the direction of the alternative, so <x>=T.TEST(C2:C12,B2:B12,1,1)</x> = ${fx(SP.p / 2, 4)} is its p-value: at α = 0.05 the rise in prices went with fewer rentals. Without a comparison group of branches whose prices didn’t change, a seasonal dip could look the same.`,
  },
  {
    id: 'b04-m3-11', lesson: 'comparing-means', type: 'mc', kind: 'conceptual',
    prompt: 'A 95% Welch interval for the difference in mean repair time between two garages (fictional) runs from −0.8 to 6.2 minutes. Which conclusion is correct?',
    options: [
      'No significant difference at 5%: the data allow a 0.8-minute advantage up to a 6.2-minute disadvantage.',
      'The two garages’ mean repair times are equal, because the interval includes a difference of 0.',
      'There is a 95% probability that the true difference lies between −0.8 and 6.2 minutes for these two garages.',
      'The difference is significant at 5%, because most of the interval lies above 0 and its centre is at 2.7 minutes.',
    ],
    answer: 0,
    feedback: {
      1: 'Including 0 means 0 is plausible, not proven: the interval also includes differences of several minutes.',
      2: 'Once calculated, an interval either contains the true difference or doesn’t; 95% describes the method’s long-run success rate.',
      3: 'Significance depends on whether 0 is inside the interval, not on where most of it lies.',
    },
    solution: 'The interval contains 0, so a two-sided Welch test at 5% would not reject H₀. That is not evidence the means are equal: anything from the first garage being 0.8 minutes quicker to 6.2 minutes slower is compatible with the data. “95%” describes how often the method captures the true difference, not the chance for this particular interval.',
  },
  {
    id: 'b04-m3-12', lesson: 'comparing-means', type: 'num', kind: 'numerical',
    prompt: 'Alderley Clinic (fictional) timed 14 receptionists handling a standard booking before and after a new booking system. The 14 savings in time (before minus after) have mean 3.1 minutes and standard deviation 4.2 minutes. Calculate the lower limit of the 95% confidence interval for the mean saving. Give two decimal places.',
    answer: r(CL.dbar - clT * clSE, 2), check: () => 3.1 - I.tInv(0.975, 13) * 4.2 / Math.sqrt(14), unit: 'minutes', places: 2, tol: 0.011,
    wrong: [
      { value: r(CL.dbar - I.normInv(0.975) * clSE, 2), say: 'That uses z = 1.96. With s_d from 14 pairs, use t with 13 degrees of freedom: 2.160.' },
      { value: r(CL.dbar - clT * CL.sd / CL.n, 2), say: 'The standard error is s_d ÷ √n = 4.2 ÷ √14, not 4.2 ÷ 14.' },
    ],
    solution: `SE = 4.2 ÷ √14 = ${fx(clSE, 4)}; t for 95% with 13 df is <x>=T.INV.2T(0.05,13)</x> = ${fx(clT, 3)}; lower limit = 3.1 − ${fx(clT, 3)} × ${fx(clSE, 4)} ≈ ${fx(CL.dbar - clT * clSE, 2)} minutes. The interval, ${fx(CL.dbar - clT * clSE, 2)} to ${fx(CL.dbar + clT * clSE, 2)} minutes, excludes 0, so the saving is significant at 5%, but its size is uncertain.`,
  },
];
