// assess-m2.js — B04 module 2 test: From samples to populations (normal-distribution, sampling-distributions,
// confidence-intervals). New questions on new businesses and on Lantern data the lessons don't use for these methods
// (the star ratings); not copies of lesson exercises. No hints; solutions are shown when the student reviews the test.
// Marsden Mills, Wyvern Ferries, Fairlop Bookshop, Loopline Cycles and Aldergrove Clinic are fictional. Formula items
// are marked by their results; every num item's `check` recomputes its answer.
import { RATINGS } from './case.js?v=19';
import * as I from '../../../core/inference.js?v=19';

const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const Z = I.normInv(0.975);

// Marsden Mills (fictional): 1.5 kg flour bags, N(1,512, 6) g; acceptable range 1,500 to 1,525 g
const FLOUR = { mean: 1512, sd: 6, lo: 1500, hi: 1525 };
// Wyvern Ferries (fictional): crossing times N(52, 4) minutes; fuel per crossing SD about 40 litres
const FERRY = { mean: 52, sd: 4, claim: 57, fuelSd: 40, fuelE: 8 };
// Fairlop Bookshop (fictional): sale values, mean $28, SD $15; a day's 50 sales
const BOOK = { mu: 28, sigma: 15, n: 50, cut: 31 };
// Loopline Cycles (fictional): 600 customers, 150 surveyed without replacement
const LOOP = { N: 600, n: 150 };
// Lantern: the 154 star ratings
const RCI = I.ciMean(RATINGS), FIVE = RATINGS.filter((x) => x === 5).length, PF = FIVE / RATINGS.length;
const WIL = I.ciProp(FIVE, RATINGS.length, 0.95, 'wilson');
const wilsonNoDen = (PF + Z * Z / (2 * RATINGS.length)) - Z * Math.sqrt(PF * (1 - PF) / RATINGS.length + Z * Z / (4 * RATINGS.length ** 2));
const ratingSheet = { cells: { A1: 'Rating (stars)', ...col('A', 2, RATINGS), C1: 'Confidence level', D1: 0.95, C2: 'Width of the interval' } };

export const items = [
  // ---------------------------------------------------------------- normal-distribution
  {
    id: 'b04-m2-1', lesson: 'normal-distribution', type: 'formula', kind: 'numerical',
    prompt: 'Marsden Mills (fictional) fills 1.5 kg bags of flour; weights are roughly normal with the mean and standard deviation in B1 and B2 (grams). A bag is rejected if it weighs less than B3 or more than B4. In B6, calculate the share of bags rejected.',
    sheet: { cells: { A1: 'Mean (g)', B1: FLOUR.mean, A2: 'SD (g)', B2: FLOUR.sd, A3: 'Lightest allowed (g)', B3: FLOUR.lo, A4: 'Heaviest allowed (g)', B4: FLOUR.hi, A6: 'Share rejected' }, vary: { B1: [1510, 1514], B2: [5, 7], B3: [1498, 1502], B4: [1523, 1527] } },
    cell: 'B6', answer: '=NORM.DIST(B3,B1,B2,TRUE)+1-NORM.DIST(B4,B1,B2,TRUE)',
    alt: ['=1-(NORM.DIST(B4,B1,B2,TRUE)-NORM.DIST(B3,B1,B2,TRUE))', '=NORM.DIST(B3,B1,B2,TRUE)+NORM.DIST(2*B1-B4,B1,B2,TRUE)'],
    view: 'A1:B6', formats: { B6: '0.00%' }, widths: { A: 20 },
    wrong: [
      { formula: '=NORM.DIST(B4,B1,B2,TRUE)-NORM.DIST(B3,B1,B2,TRUE)', say: 'That is the share accepted, between the two limits. The rejected bags are in the two tails: 1 minus it.' },
      { formula: '=2*NORM.DIST(B3,B1,B2,TRUE)', say: 'Doubling one tail works only when the limits are the same distance from the mean. Here 1,500 g is 12 g below and 1,525 g is 13 g above: add the two tails separately.' },
      { formula: '=NORM.DIST(B3,B1,B2,TRUE)+NORM.DIST(B4,B1,B2,TRUE)', say: 'The upper tail is the area above 1,525 g: 1 − NORM.DIST(B4, …, TRUE).' },
    ],
    solution: `Lower tail: z = (1,500 − 1,512) ÷ 6 = −2, area ${I.normCdf(-2).toFixed(4)}. Upper tail: z = (1,525 − 1,512) ÷ 6 = 2.17, area ${I.normal.sf(FLOUR.hi, FLOUR.mean, FLOUR.sd).toFixed(4)}. Rejected: ${pc(I.normal.cdf(FLOUR.lo, FLOUR.mean, FLOUR.sd) + I.normal.sf(FLOUR.hi, FLOUR.mean, FLOUR.sd), 2)}. <x>=NORM.DIST(B3,B1,B2,TRUE)+1-NORM.DIST(B4,B1,B2,TRUE)</x>.`,
  },
  {
    id: 'b04-m2-2', lesson: 'normal-distribution', type: 'num', kind: 'applied',
    prompt: 'Wyvern Ferries (fictional) advertises that “at least 90% of crossings take 57 minutes or less”. Crossing times are roughly normal with mean 52 minutes and standard deviation 4 minutes. What percentage of crossings actually take 57 minutes or less? Give one decimal place.',
    answer: Math.round(I.normal.cdf(FERRY.claim, FERRY.mean, FERRY.sd) * 1000) / 10, check: () => I.normal.cdf(FERRY.claim, FERRY.mean, FERRY.sd) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round(I.normal.sf(FERRY.claim, FERRY.mean, FERRY.sd) * 1000) / 10, say: 'That is the share taking longer than 57 minutes. The claim is about 57 minutes or less: the area below.' },
      { value: 1.25, say: '1.25 is the z-score, (57 − 52) ÷ 4, not a percentage. Convert it with NORM.S.DIST(1.25, TRUE).' },
    ],
    solution: `z = (57 − 52) ÷ 4 = 1.25; <x>=NORM.DIST(57,52,4,TRUE)</x> = ${I.normal.cdf(FERRY.claim, FERRY.mean, FERRY.sd).toFixed(4)}: ${pc(I.normal.cdf(FERRY.claim, FERRY.mean, FERRY.sd))} of crossings, just short of the advertised 90%. The 90th percentile is <x>=NORM.INV(0.9,52,4)</x> = ${I.normal.inv(0.9, FERRY.mean, FERRY.sd).toFixed(1)} minutes, so “58 minutes” would be honest.`,
  },
  {
    id: 'b04-m2-3', lesson: 'normal-distribution', type: 'mc', kind: 'conceptual',
    prompt: 'A normal probability plot of 60 repair bills at Loopline Cycles (fictional) shows the points close to the straight line for the lower two-thirds of the bills, then bending sharply upwards above the line at the right-hand end. What does that show?',
    options: [
      'The largest bills are larger than a normal model predicts: a long right tail (right skew).',
      'The bills follow a normal distribution closely, because most of the points lie on the line.',
      'The smallest bills are lower than a normal model predicts: a long left tail, or left skew.',
      'The bills have less spread than normal at the top, so the model overstates the largest bills.',
    ],
    answer: 0,
    feedback: {
      1: 'The departure is systematic and at the end that matters most for large bills. A normal model would understate how often big bills occur.',
      2: 'A long left tail would show as points bending away below the line at the left-hand end.',
      3: 'Points above the line at the right mean the largest values are larger than normal scores predict, not smaller.',
    },
    solution: 'On a normal probability plot each sorted value is plotted against the value a normal distribution would put in that position. Points rising above the line at the right mean the top values are further out than normal: a right-skewed distribution with a long upper tail, common for bills, waits and order values.',
  },
  // ---------------------------------------------------------------- sampling-distributions
  {
    id: 'b04-m2-4', lesson: 'sampling-distributions', type: 'formula', kind: 'numerical',
    prompt: 'Fairlop Bookshop’s (fictional) sales have the mean and standard deviation in B1 and B2. On a typical day it makes the number of sales in B3, which behave like a random sample. In B6, use the normal model to calculate the probability that a day’s average sale is more than the amount in B4.',
    sheet: { cells: { A1: 'Mean sale ($)', B1: BOOK.mu, A2: 'SD of sales ($)', B2: BOOK.sigma, A3: 'Sales in a day', B3: BOOK.n, A4: 'Average above ($)', B4: BOOK.cut, A6: 'Probability' }, vary: { B4: [30, 33] } },
    cell: 'B6', answer: '=1-NORM.DIST(B4,B1,B2/SQRT(B3),TRUE)',
    alt: ['=1-NORM.S.DIST((B4-B1)/(B2/SQRT(B3)),TRUE)', '=NORM.DIST(2*B1-B4,B1,B2/SQRT(B3),TRUE)'],
    view: 'A1:B6', formats: { B6: '0.0000' }, widths: { A: 18 },
    wrong: [
      { formula: '=1-NORM.DIST(B4,B1,B2,TRUE)', say: 'That is the chance that one sale is above $31. A day’s average of 50 sales varies with the standard error, B2/SQRT(B3).' },
      { formula: '=NORM.DIST(B4,B1,B2/SQRT(B3),TRUE)', say: 'That is the probability the average is below B4. Subtract it from 1 for “more than”.' },
      { formula: '=1-NORM.DIST(B4,B1,B2/B3,TRUE)', say: 'The standard error divides σ by √n, not n.' },
    ],
    solution: `SE = 15 ÷ √50 = ${(15 / Math.sqrt(50)).toFixed(3)}; z = (31 − 28) ÷ ${(15 / Math.sqrt(50)).toFixed(3)} = ${((BOOK.cut - BOOK.mu) / (BOOK.sigma / Math.sqrt(BOOK.n))).toFixed(2)}; P = ${I.normal.sf(BOOK.cut, BOOK.mu, BOOK.sigma / Math.sqrt(BOOK.n)).toFixed(4)}, about one day in 13. A single sale is above $31 far more often (${pc(I.normal.sf(BOOK.cut, BOOK.mu, BOOK.sigma), 0)} under a normal model, though book sales are probably skewed).`,
  },
  {
    id: 'b04-m2-5', lesson: 'sampling-distributions', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about the sampling distribution of the sample mean that are true for random samples.',
    options: [
      'Its mean equals the population mean μ, whatever the population’s shape.',
      'Its standard deviation is σ ÷ √n, so it shrinks as the sample grows.',
      'If the population is normal, the sample mean is normal for any sample size.',
      'Its standard deviation depends mainly on the population size N, not on n.',
      'A large enough sample makes the values in the sample normally distributed.',
      'With n = 30 it is always close to normal, however skewed the population.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'When n is a small share of N, the standard error is σ ÷ √n; N enters only through the finite population correction for large shares.',
      4: 'The central limit theorem is about the mean’s distribution. A big sample of skewed values is still skewed.',
      5: '30 is a rule of thumb. With very skewed populations, like Lantern’s orders with one $1,512 order, far larger samples are needed.',
    },
    solution: 'True: centre μ, standard error σ ÷ √n, and an exactly normal sample mean when the population is normal. False: the population size doesn’t drive the standard error (except through the correction when n is a large share of N), the data don’t become normal, and 30 is not enough for every population.',
  },
  {
    id: 'b04-m2-6', lesson: 'sampling-distributions', type: 'num', kind: 'applied',
    prompt: 'Loopline Cycles (fictional) has 600 customers and surveys 150 of them, chosen at random without replacement. By what percentage does the finite population correction reduce the standard error, compared with σ ÷ √n? Give one decimal place.',
    answer: Math.round((1 - Math.sqrt((LOOP.N - LOOP.n) / (LOOP.N - 1))) * 1000) / 10, check: () => (1 - Math.sqrt((LOOP.N - LOOP.n) / (LOOP.N - 1))) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round((1 - (LOOP.N - LOOP.n) / (LOOP.N - 1)) * 1000) / 10, say: 'The correction is the square root of (N − n) ÷ (N − 1). Without the square root you overstate the reduction.' },
      { value: Math.round(Math.sqrt((LOOP.N - LOOP.n) / (LOOP.N - 1)) * 1000) / 10, say: 'That is the correction factor itself, as a percentage. The reduction is 1 minus it.' },
    ],
    solution: `Factor = √((600 − 150) ÷ 599) = √(450 ÷ 599) = ${Math.sqrt(450 / 599).toFixed(4)}, so the standard error is ${pc(1 - Math.sqrt(450 / 599))} smaller. The sample is 25% of the customers, well above the 5% at which the correction starts to matter.`,
  },
  {
    id: 'b04-m2-7', lesson: 'sampling-distributions', type: 'order', kind: 'applied',
    prompt: 'Put the steps for drawing a simple random sample of 40 rows from a customer list in Excel in order.',
    items: [
      'Make sure the list holds every customer in the population you want to describe (the sampling frame).',
      'In a new column, type <x>=RAND()</x> beside every customer.',
      'Copy the column and paste it back as values, so the numbers stop changing.',
      'Sort the whole list by that column.',
      'Take the first 40 rows as the sample.',
    ],
    solution: 'Check the frame first: no randomisation fixes a list that misses part of the population. RAND gives every row a random number, and pasting values freezes them (RAND recalculates every time the sheet does). Sorting by the frozen numbers shuffles the list, so the first 40 rows are a simple random sample.',
  },
  // ---------------------------------------------------------------- confidence-intervals
  {
    id: 'b04-m2-8', lesson: 'confidence-intervals', type: 'formula', kind: 'numerical',
    prompt: `A2:A155 hold the ${RATINGS.length} star ratings (1 to 5) that customers gave Lantern’s spring orders, and D1 holds a confidence level. In D2, calculate the width of the t interval for the mean rating at that level (upper limit minus lower limit), in one formula.`,
    sheet: { ...ratingSheet, vary: { D1: [0.9, 0.99] } },
    cell: 'D2', answer: '=2*CONFIDENCE.T(1-D1,STDEV.S(A2:A155),COUNT(A2:A155))',
    alt: ['=CONFIDENCE.T(1-D1,STDEV.S(A2:A155),COUNT(A2:A155))*2', '=2*T.INV.2T(1-D1,COUNT(A2:A155)-1)*STDEV.S(A2:A155)/SQRT(COUNT(A2:A155))'],
    view: 'A1:D155', maxHeight: '20rem', formats: { D1: '0%', D2: '0.000' }, widths: { C: 18 },
    wrong: [
      { formula: '=CONFIDENCE.T(1-D1,STDEV.S(A2:A155),COUNT(A2:A155))', say: 'CONFIDENCE.T returns the margin of error, the half-width. The interval runs from mean − margin to mean + margin, so its width is twice the margin.' },
      { formula: '=2*CONFIDENCE.T(D1,STDEV.S(A2:A155),COUNT(A2:A155))', say: 'The first argument is alpha, 1 − the confidence level: 1-D1.' },
      { formula: '=2*CONFIDENCE.NORM(1-D1,STDEV.S(A2:A155),COUNT(A2:A155))', say: 'The question asks for a t interval, which is what applies when σ is estimated by s: CONFIDENCE.T. (With 154 ratings the two are close, but not the same.)' },
    ],
    solution: `<x>=2*CONFIDENCE.T(1-D1,STDEV.S(A2:A155),COUNT(A2:A155))</x>: at 95% the margin is ${RCI.margin.toFixed(3)} stars, so the interval (${RCI.low.toFixed(2)} to ${RCI.high.toFixed(2)}) is ${(2 * RCI.margin).toFixed(3)} stars wide; at 90% it is ${(2 * I.ciMean(RATINGS, 0.9).margin).toFixed(3)} and at 99% ${(2 * I.ciMean(RATINGS, 0.99).margin).toFixed(3)}. Ratings are whole numbers and left-skewed, but with 154 of them the sample mean is close to normal. The bigger caveat: 77 orders weren’t rated, and customers who rate may differ from those who don’t.`,
  },
  {
    id: 'b04-m2-9', lesson: 'confidence-intervals', type: 'num', kind: 'numerical',
    prompt: `${FIVE} of the ${RATINGS.length} rated spring orders got five stars. What is the lower limit of the 95% Wilson interval for the share of five-star ratings? Give the percentage to one decimal place.`,
    answer: Math.round(WIL.low * 1000) / 10, check: () => I.ciProp(FIVE, RATINGS.length, 0.95, 'wilson').low * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round(I.ciProp(FIVE, RATINGS.length).low * 1000) / 10, say: 'That is the Wald lower limit, p̂ − 1.96 × √(p̂(1 − p̂) ÷ n). The Wilson interval shifts the centre towards 0.5 and divides by 1 + z²/n.' },
      { value: Math.round(wilsonNoDen * 1000) / 10, say: 'You left out the denominator, 1 + z² ÷ n: divide both the centre and the half-width by it.' },
    ],
    solution: `p̂ = ${FIVE} ÷ ${RATINGS.length} = ${PF.toFixed(4)}, z = 1.96, z² ÷ n = ${(Z * Z / RATINGS.length).toFixed(5)}. Centre = (p̂ + z² ÷ 2n) ÷ (1 + z² ÷ n) = ${WIL.centre.toFixed(4)}; half-width = z√(p̂(1 − p̂) ÷ n + z² ÷ 4n²) ÷ (1 + z² ÷ n) = ${WIL.margin.toFixed(4)}; interval ${pc(WIL.low)} to ${pc(WIL.high)}. The Wald interval, ${pc(I.ciProp(FIVE, RATINGS.length).low)} to ${pc(I.ciProp(FIVE, RATINGS.length).high)}, is close because both counts (${FIVE} and ${RATINGS.length - FIVE}) are well above 10.`,
  },
  {
    id: 'b04-m2-10', lesson: 'confidence-intervals', type: 'classify', kind: 'conceptual',
    prompt: 'A 95% t interval for a mean has been calculated. What does each change do to its margin of error, other things equal?',
    items: [
      'Raise the confidence level to 99%',
      'Take a sample four times as large',
      'Measure a population whose values are more spread out',
      'Draw the same size of sample from a population ten times as large (still a small share of it)',
      'Use 90% confidence instead of 95%',
    ],
    categories: ['Wider', 'Narrower', 'About the same'],
    answer: [0, 1, 0, 2, 1],
    feedback: {
      1: 'Four times the sample halves the margin, because it falls with √n.',
      3: 'The population size doesn’t enter the standard error unless the sample is a large share of it.',
    },
    solution: 'Higher confidence needs a larger multiplier: wider. A larger sample shrinks the standard error with √n: narrower. More spread means a larger s: wider. A bigger population makes no difference while the sample is a small share of it. Lower confidence: narrower, at the cost of capturing μ less often.',
  },
  {
    id: 'b04-m2-11', lesson: 'confidence-intervals', type: 'mc', kind: 'applied',
    prompt: 'Aldergrove Clinic (fictional) timed a random sample of 80 patients from arrival to consultation and found a 95% confidence interval for the mean wait of 18 to 24 minutes. Its poster says: “95% of our patients are seen within 18 to 24 minutes.” What is wrong with the poster?',
    options: [
      'It is an interval for the mean wait; single waits vary far more, so far fewer than 95% fall in it.',
      'Nothing: a 95% confidence interval contains 95% of the values in the population it describes.',
      'The interval should be quoted as 21 minutes ± 6, because a confidence interval is always symmetric.',
      'With 80 patients the clinic should have used z, and a z interval would make the poster correct.',
    ],
    answer: 0,
    feedback: {
      1: 'That confuses a range for the mean with a range for individual values. A confidence interval narrows as n grows; the spread of waits doesn’t.',
      2: 'The interval is 21 ± 3 minutes, and the multiplier makes no difference to what it is about: the mean, not individual patients.',
      3: 'With 80 patients z and t give almost the same interval, and either is about the mean wait, not individual waits.',
    },
    solution: 'A confidence interval estimates the mean. Individual waits have a standard deviation far larger than the standard error (here roughly 3 ÷ 1.99 × √80 ≈ 13 minutes), so many patients wait less than 18 or more than 24 minutes. A statement about individual patients needs percentiles of the waits, or a prediction interval (B06).',
  },
  {
    id: 'b04-m2-12', lesson: 'confidence-intervals', type: 'formula', kind: 'applied',
    prompt: 'Wyvern Ferries wants to estimate its mean fuel use per crossing to within the margin in B2 (litres) at the confidence level in B3. Past records suggest the standard deviation in B1. In B5, calculate the number of crossings to record, rounded up to a whole number.',
    sheet: { cells: { A1: 'Planning SD (litres)', B1: FERRY.fuelSd, A2: 'Margin wanted (litres)', B2: FERRY.fuelE, A3: 'Confidence level', B3: 0.95, A5: 'Crossings needed' }, vary: { B2: [5, 10], B3: [0.9, 0.99] } },
    cell: 'B5', answer: '=ROUNDUP((NORM.S.INV(1-(1-B3)/2)*B1/B2)^2,0)',
    alt: ['=CEILING((NORM.S.INV(1-(1-B3)/2)*B1/B2)^2,1)', '=CEILING.MATH((NORM.S.INV(1-(1-B3)/2)*B1/B2)^2)', '=ROUNDUP(NORM.S.INV((1+B3)/2)^2*B1^2/B2^2,0)'],
    view: 'A1:B5', formats: { B3: '0%', B5: '0' }, widths: { A: 22 },
    wrong: [
      { formula: '=ROUND((NORM.S.INV(1-(1-B3)/2)*B1/B2)^2,0)', say: 'A sample size is rounded up, never to the nearest: 96.04 crossings must become 97, or the margin ends up slightly larger than wanted.' },
      { formula: '=ROUNDUP(NORM.S.INV(1-(1-B3)/2)*B1/B2,0)', say: 'n = (zσ ÷ E)²: square the bracket before rounding up.' },
      { formula: '=ROUNDUP((NORM.S.INV(B3)*B1/B2)^2,0)', say: 'NORM.S.INV(0.95) = 1.645 leaves 5% in one tail. A two-sided 95% margin needs 2.5% in each: NORM.S.INV(0.975).' },
    ],
    solution: `<x>=ROUNDUP((NORM.S.INV(1-(1-B3)/2)*B1/B2)^2,0)</x> = (1.96 × 40 ÷ 8)² = ${((Z * 40 / 8) ** 2).toFixed(2)}, rounded up to ${I.sampleSizeMean(FERRY.fuelSd, FERRY.fuelE)} crossings.`,
  },
];
