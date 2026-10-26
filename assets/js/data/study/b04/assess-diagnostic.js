// assess-diagnostic.js — B04 course diagnostic: three items per module, each written so that it needs that module’s
// statistical method, not the descriptive statistics, Excel and survey basics of B01–B03, so that a student who knows only
// those courses misses module 1’s items and one who already has a module’s methods gets its items right.
// Module 1: Chebyshev’s guarantee against the empirical rule and a normal-curve range, Bayes’ rule over two independent inspections, a Poisson
// count over a fraction of the rate’s interval. Module 2: a normal cut-off from the lower tail, the normal model for a
// sample proportion, the sample size for a proportion with a planning value. Module 3: a one-sided t test from summary
// figures, a one-sided p-value from a two-sided one, choosing T.TEST’s type from the design (two prices for each item). Module 4: goodness of fit
// against stated shares, the two-proportion z test, what drives F.
// Modules 1–3 use only mc, num and formula items, which score 0 or 1, so that the route below can’t be passed on part
// marks; module 4 is not used for routing. New questions on businesses used nowhere else on the site, not copies of
// lesson exercises, module tests, the final or the project. No hints; solutions are shown on review. Every business,
// record and number is fictional; every num item’s `check` recomputes its answer, and every formula item is marked by
// its results on the sheet and on changed copies.
import * as I from '../../../core/inference.js?v=20';

const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const r = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const usd2 = (v) => `$${fx(v, 2)}`;

// Ottermere Car Park: daily takings, mean $3,200, SD $400, right-skewed
const PARK = { mean: 3200, sd: 400, share: 0.64 };
const kCheb = 1 / Math.sqrt(1 - PARK.share);                       // 1 − 1/k² = 0.64 gives k = 1/0.6
const zMid = I.normInv(0.5 + PARK.share / 2);                      // the normal curve's middle 64%
const dollars = (x) => `$${Math.round(x).toLocaleString('en-US')}`;
const parkRange = (k) => `${dollars(PARK.mean - k * PARK.sd)} to ${dollars(PARK.mean + k * PARK.sd)}`;
// Glasswing Electronics: 3% of boards faulty; each inspection flags 92% of faulty and 6% of good boards
const BOARD = { base: 0.03, hit: 0.92, falseHit: 0.06 };
const twoFlags = (b, h, f) => (b * h * h) / (b * h * h + (1 - b) * f * f);
const oneFlag = (b, h, f) => (b * h) / (b * h + (1 - b) * f);
// Larchfield Plumbing: 2.4 calls an hour; a 20-minute break
const CALLS = { perHour: 2.4, breakMin: 20 };
const lamBreak = (CALLS.perHour * CALLS.breakMin) / 60;
// Yarrowby Running Club: 5 km times N(27.4, 3.1) minutes; the fastest fifth
const RUN = { mean: 27.4, sd: 3.1, share: 0.2 };
// Elmhurst Leisure Centre: 32% of visits are swims; samples of 150; cut-off 25%
const SWIM = { p: 0.32, n: 150, cut: 0.25 };
const seSwim = Math.sqrt((SWIM.p * (1 - SWIM.p)) / SWIM.n);
// Ketterby Trams: ±3 points at 95%, planning value 20%
const TRAM = { E: 0.03, p: 0.2 };
// Hazelbank Tyres: 16 fittings, mean 32.1, SD 4.2, against 30 minutes
const FIT = { n: 16, mean: 32.1, sd: 4.2, mu0: 30 };
const tFit = (FIT.mean - FIT.mu0) / (FIT.sd / Math.sqrt(FIT.n));
// Sallowmere Pharmacies: two wholesalers' prices for the same 12 items ($)
const PRICE_A = [3.40, 12.85, 7.20, 24.60, 5.15, 41.30, 9.95, 2.80, 18.40, 6.75, 31.20, 14.10];
const PRICE_B = [3.15, 12.10, 7.05, 23.85, 4.70, 40.65, 9.60, 2.70, 17.55, 6.55, 30.40, 13.80];
const PAIR = I.tTestPaired(PRICE_A, PRICE_B), WELCH = I.tTest2(PRICE_A, PRICE_B);
// Swallowtail Sweets: 500 sweets counted against the stated mix
const FLAVOURS = ['Strawberry', 'Lemon', 'Lime', 'Orange'];
const SWEETS = [182, 128, 101, 89], MIX = [0.3, 0.25, 0.25, 0.2];
const GOF = I.chisqGof(SWEETS, MIX);
// Whinmoor Theatre: programme buyers, matinee against evening
const PROG = I.propTest2(96, 400, 141, 500);
const progUnpooled = 2 * I.normSf(Math.abs(PROG.diff / PROG.se));

export const items = [
  // ================================================================ Module 1: describing data and chance
  {
    id: 'b04-dg-1', lesson: 'describing-distributions', type: 'mc', kind: 'conceptual',
    prompt: 'Ottermere Car Park (fictional) took a mean of $3,200 a day over the last two years, with a standard deviation of $400. The daily takings are right-skewed: a few event days take far more than usual. The manager wants the narrowest range, centred on the mean, that is certain to contain at least 64% of the days whatever the shape of the distribution. Which range is it?',
    options: [
      `${parkRange(kCheb)}: ${fx(kCheb, 2)} standard deviations either side of the mean`,
      `${parkRange(zMid)}: the middle 64% of a normal curve with that mean and SD`,
      `${parkRange(1)}: one standard deviation, which holds about 68% of the days`,
      `${parkRange(2)}: two standard deviations either side of the mean`,
    ],
    answer: 0,
    feedback: {
      1: 'That range holds 64% of the days only if the takings follow a normal curve. They are right-skewed, so no normal-curve range is guaranteed; Chebyshev’s inequality is the rule that holds for every shape.',
      2: 'About 68% within one standard deviation is the empirical rule, which holds only for bell-shaped data. For any shape, Chebyshev guarantees nothing within one standard deviation (1 − 1/1² = 0).',
      3: 'Two standard deviations is guaranteed to hold at least 1 − 1/2² = 75% of the days, so it certainly holds 64%, but it is wider than it needs to be.',
    },
    solution: `Chebyshev’s inequality: for any data, at least 1 − 1/k² of the values lie within k standard deviations of the mean. Setting 1 − 1/k² = 0.64 gives 1/k² = 0.36, so k = 1 ÷ 0.6 ≈ ${fx(kCheb, 2)}: $3,200 ± ${fx(kCheb, 2)} × $400 = $3,200 ± ${dollars(kCheb * PARK.sd)}, from ${parkRange(kCheb)}. The normal curve’s middle 64% ($3,200 ± ${fx(zMid, 2)} × $400) would be narrower, but for skewed takings nothing guarantees it; two standard deviations is guaranteed but wider than needed.`,
  },
  {
    id: 'b04-dg-2', lesson: 'probability', type: 'num', kind: 'numerical',
    prompt: 'Glasswing Electronics (fictional) makes circuit boards, 3% of which have a hidden solder fault. An automated inspection flags 92% of faulty boards and 6% of good ones. Every flagged board goes through a second machine with the same rates, whose mistakes are independent of the first’s. What is the probability that a board flagged by both machines is faulty? Give three decimal places.',
    answer: r(twoFlags(BOARD.base, BOARD.hit, BOARD.falseHit), 3),
    check: () => { const p1 = oneFlag(0.03, 0.92, 0.06); return (p1 * 0.92) / (p1 * 0.92 + (1 - p1) * 0.06); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: r(oneFlag(BOARD.base, BOARD.hit, BOARD.falseHit), 3), say: 'That is the probability after one flag. A good board must fool both machines, which happens with probability 0.06 × 0.06, so the second flag raises the probability a lot.' },
      { value: r(BOARD.hit * BOARD.hit, 3), say: 'That is P(two flags | faulty), the chance a faulty board is flagged twice. The question turns it round: P(faulty | two flags), which needs the base rate of 3%.' },
      { value: r((BOARD.base * BOARD.hit * BOARD.hit) / (BOARD.base * BOARD.hit * BOARD.hit + (1 - BOARD.base) * BOARD.falseHit), 3), say: 'You squared the 92% but not the 6%. A good board flagged twice has been wrongly flagged by both machines: 0.97 × 0.06².' },
      { value: r(BOARD.base * BOARD.hit * BOARD.hit, 3), say: 'That is the joint probability that a board is faulty and flagged twice. Divide it by the probability that any board is flagged twice.' },
    ],
    solution: `Bayes’ rule with the two flags as the evidence. Faulty and flagged twice: 0.03 × 0.92² = ${fx(BOARD.base * BOARD.hit ** 2, 6)}; good and flagged twice: 0.97 × 0.06² = ${fx((1 - BOARD.base) * BOARD.falseHit ** 2, 6)}. P(faulty | two flags) = ${fx(BOARD.base * BOARD.hit ** 2, 6)} ÷ (${fx(BOARD.base * BOARD.hit ** 2, 6)} + ${fx((1 - BOARD.base) * BOARD.falseHit ** 2, 6)}) ≈ ${fx(twoFlags(BOARD.base, BOARD.hit, BOARD.falseHit), 3)}. One flag alone gives only ${fx(oneFlag(BOARD.base, BOARD.hit, BOARD.falseHit), 3)}; updating that with the second flag gives the same ${fx(twoFlags(BOARD.base, BOARD.hit, BOARD.falseHit), 3)}. The answer rests on the two machines erring independently: if both are fooled by the same boards, a second flag adds far less.`,
  },
  {
    id: 'b04-dg-3', lesson: 'discrete-distributions', type: 'formula', kind: 'applied',
    prompt: 'Larchfield Plumbing’s (fictional) emergency line receives calls at random, independently of one another, at the average hourly rate in B1. The engineer on duty takes a break of the length in B2 (minutes); if two or more calls come in during it, the break is cut short. In B4, calculate the probability that the break is cut short.',
    sheet: { cells: { A1: 'Calls per hour (mean)', B1: CALLS.perHour, A2: 'Break (minutes)', B2: CALLS.breakMin, A4: 'P(2 or more calls)' }, vary: { B2: [15, 30, 45] } },
    cell: 'B4', view: 'A1:B4', formats: { B4: '0.0000' }, widths: { A: 22 },
    answer: '=1-POISSON.DIST(1,B1*B2/60,TRUE)',
    alt: ['=1-POISSON.DIST(1,B1/60*B2,TRUE)', '=1-POISSON.DIST(0,B1*B2/60,FALSE)-POISSON.DIST(1,B1*B2/60,FALSE)', '=1-EXP(-B1*B2/60)*(1+B1*B2/60)', '=1-POISSON.DIST(1,B2*B1/60,1)'],
    wrong: [
      { formula: '=1-POISSON.DIST(1,B1,TRUE)', say: 'That uses the mean number of calls in a whole hour. The break lasts B2 minutes, so the mean number of calls in it is B1 × B2 ÷ 60.' },
      { formula: '=1-POISSON.DIST(2,B1*B2/60,TRUE)', say: 'That is P(more than 2 calls). “Two or more” is 1 − P(at most 1): 1 − POISSON.DIST(1, …, TRUE).' },
      { formula: '=1-POISSON.DIST(1,B1*B2/60,FALSE)', say: 'With FALSE you subtract only P(exactly 1 call). Subtract P(at most 1), with TRUE.' },
      { formula: '=1-POISSON.DIST(1,B1*B2,TRUE)', say: 'B1 is per hour and B2 in minutes. Convert the break to hours, B2 ÷ 60, before multiplying.' },
    ],
    solution: `The number of calls in the break is Poisson, and its mean scales with the length of the interval: λ = ${CALLS.perHour} × ${CALLS.breakMin} ÷ 60 = ${fx(lamBreak, 1)}. P(X ≥ 2) = 1 − P(X ≤ 1) = 1 − e^(−${fx(lamBreak, 1)}) × (1 + ${fx(lamBreak, 1)}) ≈ ${fx(I.poissonSf(1, lamBreak), 4)}: <x>=1-POISSON.DIST(1,B1*B2/60,TRUE)</x>. About one break in five is cut short, if calls really arrive at a steady rate. In a cold snap they bunch, and the model understates the risk.`,
  },

  // ================================================================ Module 2: from samples to populations
  {
    id: 'b04-dg-4', lesson: 'normal-distribution', type: 'num', kind: 'numerical',
    prompt: 'Yarrowby Running Club’s (fictional) members run its 5 km time trial in times that are roughly normal, with a mean of 27.4 minutes and a standard deviation of 3.1 minutes. The club’s fast group is open to the fastest fifth of its runners. What time must a runner beat to join it? Give minutes to two decimal places.',
    answer: r(I.normal.inv(RUN.share, RUN.mean, RUN.sd), 2),
    check: () => 27.4 + I.normInv(0.2) * 3.1,
    unit: 'minutes', places: 2, tol: 0.011,
    wrong: [
      { value: r(I.normal.inv(1 - RUN.share, RUN.mean, RUN.sd), 2), say: 'That is the time with 80% of runners below it, the cut-off for the slowest fifth. The fastest runners have the lowest times: the cut-off has 20% below it.' },
      { value: r(RUN.mean - RUN.sd, 2), say: 'One standard deviation below the mean leaves about 16% of a normal curve below it, not 20%. Use the z with 20% below it: NORM.S.INV(0.2) = −0.84.' },
      { value: r(RUN.mean - RUN.share * RUN.sd, 2), say: '0.2 is the share of runners, not a z-score. Convert it with NORM.S.INV(0.2), or use NORM.INV(0.2, 27.4, 3.1) directly.' },
    ],
    solution: `The fastest fifth have the lowest times, so the cut-off has 20% of times below it: <x>=NORM.INV(0.2,27.4,3.1)</x> = ${fx(I.normal.inv(RUN.share, RUN.mean, RUN.sd), 2)} minutes. By hand, z = NORM.S.INV(0.2) = ${neg(I.normInv(RUN.share), 3)}, and 27.4 − ${fx(-I.normInv(RUN.share), 3)} × 3.1 = ${fx(I.normal.inv(RUN.share, RUN.mean, RUN.sd), 2)}. A runner must finish in under about 24 minutes 47 seconds.`,
  },
  {
    id: 'b04-dg-5', lesson: 'sampling-distributions', type: 'formula', kind: 'numerical',
    prompt: 'At Elmhurst Leisure Centre (fictional), the share of all visits that are swims is the figure in B1. Each week the manager checks a random sample of visits, of the size in B2. In B5, use the normal model to calculate the probability that a week’s sample has a share of swims below the figure in B3.',
    sheet: { cells: { A1: 'Share of visits that are swims', B1: SWIM.p, A2: 'Visits sampled', B2: SWIM.n, A3: 'Cut-off share', B3: SWIM.cut, A5: 'P(sample share below B3)' }, vary: { B3: [0.22, 0.27, 0.29] } },
    cell: 'B5', view: 'A1:B5', formats: { B1: '0.00', B3: '0.00', B5: '0.0000' }, widths: { A: 28 },
    answer: '=NORM.DIST(B3,B1,SQRT(B1*(1-B1)/B2),TRUE)',
    alt: ['=NORM.S.DIST((B3-B1)/SQRT(B1*(1-B1)/B2),TRUE)', '=1-NORM.DIST(2*B1-B3,B1,SQRT(B1*(1-B1)/B2),TRUE)', '=NORM.DIST(B3,B1,SQRT(B1*(1-B1))/SQRT(B2),TRUE)'],
    wrong: [
      { formula: '=NORM.DIST(B3,B1,SQRT(B1*(1-B1))/B2,TRUE)', say: 'The standard error of a sample share divides by n inside the square root: √(p(1 − p) ÷ n), so B2 goes under the SQRT.' },
      { formula: '=NORM.DIST(B3,B1,B1*(1-B1)/B2,TRUE)', say: 'p(1 − p) ÷ n is the variance of the sample share. NORM.DIST needs its standard deviation, the standard error: take the square root.' },
      { formula: '=NORM.DIST(B3,B1,SQRT(B1*(1-B1)),TRUE)', say: '√(p(1 − p)) is the spread of a single visit, scored 1 for a swim and 0 otherwise. The share in a sample of B2 visits varies far less: divide by B2 inside the root.' },
      { formula: '=1-NORM.DIST(B3,B1,SQRT(B1*(1-B1)/B2),TRUE)', say: 'That is the probability that the sample share is above B3. NORM.DIST with TRUE already gives the area below.' },
    ],
    solution: `The sample share p̂ varies around p = ${SWIM.p} with standard error √(${SWIM.p} × ${fx(1 - SWIM.p, 2)} ÷ ${SWIM.n}) = ${fx(seSwim, 4)}. z = (${SWIM.cut} − ${SWIM.p}) ÷ ${fx(seSwim, 4)} = ${neg((SWIM.cut - SWIM.p) / seSwim)}, and the area below it is ${fx(I.normal.cdf(SWIM.cut, SWIM.p, seSwim), 4)}: <x>=NORM.DIST(B3,B1,SQRT(B1*(1-B1)/B2),TRUE)</x>. A week with under 25% swims would happen by chance about once in 30 weeks. The normal model is reasonable: a sample is expected to hold ${Math.round(SWIM.n * SWIM.p)} swims and ${Math.round(SWIM.n * (1 - SWIM.p))} other visits, both well above 10.`,
  },
  {
    id: 'b04-dg-6', lesson: 'confidence-intervals', type: 'num', kind: 'applied',
    prompt: 'Ketterby Trams (fictional) wants to estimate the share of its passengers who pay by phone to within ±3 percentage points at 95% confidence. Last year about 20% did. Using 20% as the planning value, how many passengers must it survey? Give the number of replies needed, a whole number.',
    answer: I.sampleSizeProp(TRAM.E, 0.95, TRAM.p),
    check: () => Math.ceil((I.normInv(0.975) ** 2 * 0.2 * 0.8) / 0.03 ** 2),
    unit: 'replies', places: 0, tol: 0.5,
    wrong: [
      { value: I.sampleSizeProp(TRAM.E), say: 'That uses p = 0.5, the cautious value when nothing is known about the share. The question gives a planning value, 20%, and p(1 − p) = 0.16 is smaller than 0.25.' },
      { value: Math.floor((I.normInv(0.975) ** 2 * TRAM.p * (1 - TRAM.p)) / TRAM.E ** 2), say: 'A sample size is always rounded up: 682.9 replies must become 683, or the margin ends up slightly wider than ±3 points.' },
      { value: I.sampleSizeProp(TRAM.E, 0.9, TRAM.p), say: 'That uses 1.645, the multiplier for 90% confidence. A 95% margin uses 1.96.' },
      { value: Math.ceil((1.96 * TRAM.p * (1 - TRAM.p)) / TRAM.E ** 2), say: 'The formula squares the multiplier: n = z² p(1 − p) ÷ E², with z² = 1.96² = 3.84.' },
    ],
    solution: `n = z² p(1 − p) ÷ E² = 1.96² × 0.20 × 0.80 ÷ 0.03² = ${fx((I.normInv(0.975) ** 2 * 0.16) / 0.0009, 1)}, rounded up to ${I.sampleSizeProp(TRAM.E, 0.95, TRAM.p)} replies. Without a planning value, p = 0.5 would ask for ${I.sampleSizeProp(TRAM.E).toLocaleString('en-US')}. If the share has moved well towards 50% since last year, ${I.sampleSizeProp(TRAM.E, 0.95, TRAM.p)} replies give a margin wider than ±3 points. And the passengers must be chosen at random: the margin says nothing about bias in who is asked or who replies.`,
  },

  // ================================================================ Module 3: testing hypotheses
  {
    id: 'b04-dg-7', lesson: 'hypothesis-testing', type: 'num', kind: 'numerical',
    prompt: 'Hazelbank Tyres (fictional) tells customers that fitting a set of tyres takes 30 minutes on average. A manager who suspects it takes longer timed 16 fittings chosen at random: mean 32.1 minutes, standard deviation 4.2 minutes, no outliers. Testing H₀: μ = 30 against H₁: μ > 30, what is the p-value? Give three decimal places.',
    answer: r(I.tSf(tFit, FIT.n - 1), 3),
    check: () => I.tSf((32.1 - 30) / (4.2 / Math.sqrt(16)), 15),
    unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: r(2 * I.tSf(tFit, FIT.n - 1), 3), say: 'That is the two-sided p-value. The alternative, set before the data, is one-sided (μ > 30), and the sample mean lies on that side: use one tail.' },
      { value: r(I.normSf(tFit), 3), say: 'That uses the normal distribution. With the standard deviation estimated from 16 fittings, the statistic follows the t distribution with 15 degrees of freedom.' },
      { value: r(I.tSf(tFit, FIT.n), 3), say: 'The degrees of freedom are n − 1 = 15, not 16.' },
      { value: r(1 - I.tSf(tFit, FIT.n - 1), 3), say: 'That is the lower tail, the p-value for H₁: μ < 30. The alternative here is μ > 30: the area above t.' },
    ],
    solution: `t = (32.1 − 30) ÷ (4.2 ÷ √16) = 2.1 ÷ 1.05 = ${fx(tFit, 2)} with 15 degrees of freedom. The upper-tail p-value is <x>=T.DIST.RT(2,15)</x> = ${fx(I.tSf(tFit, FIT.n - 1), 4)}. At α = 0.05 there is evidence that fittings take longer than 30 minutes on average; the estimate is about 2 minutes longer, and whether that should change the promise is a business judgement, not something the p-value decides.`,
  },
  {
    id: 'b04-dg-8', lesson: 'hypothesis-testing', type: 'mc', kind: 'conceptual',
    prompt: 'Before collecting any data, Ravenscar Dental Practice (fictional) decided to test whether its patients’ mean wait is longer than the 15 minutes it promises (H₁: μ > 15), at α = 0.05. Its software reports only a two-sided p-value: 0.08. The sample’s mean wait was 16.2 minutes. What should the practice conclude?',
    options: [
      'The one-sided p-value is 0.04, so at the 5% level there is evidence that μ > 15.',
      'The p-value is 0.08 whatever the alternative, so it fails to reject H₀ at the 5% level.',
      'The one-sided p-value is 0.16, because a one-sided test asks for stronger evidence.',
      'The one-sided p-value is 0.92, which is 1 minus the two-sided p-value of 0.08.',
    ],
    answer: 0,
    feedback: {
      1: 'The p-value depends on the alternative. A two-sided p-value counts both tails; with the direction fixed in advance and the sample mean on that side, only one tail counts.',
      2: 'When the data point the way of H₁, the one-sided p-value is half the two-sided one, not double it.',
      3: '1 − 0.04 = 0.96 would be the p-value for the opposite alternative, μ < 15. 1 − 0.08 has no meaning here.',
    },
    solution: 'A two-sided p-value adds the two tails beyond the observed statistic. The practice fixed H₁: μ > 15 before seeing the data, and the sample mean, 16.2 minutes, lies on that side, so its p-value is one tail: 0.08 ÷ 2 = 0.04, which is at most 0.05. It rejects H₀. Halving is legitimate only because the side was chosen in advance: choosing it after seeing which way the data fell would double the real chance of a false alarm.',
  },
  {
    id: 'b04-dg-9', lesson: 'comparing-means', type: 'formula', kind: 'applied',
    prompt: 'Sallowmere Pharmacies (fictional) asked two wholesalers to quote for the same 12 items, chosen at random from its stock list. Column B holds wholesaler A’s price for each item and column C wholesaler B’s price for the same item. In E2, calculate the two-sided p-value for a difference in mean price, with T.TEST.',
    sheet: { cells: { A1: 'Item', B1: 'Wholesaler A ($)', C1: 'Wholesaler B ($)', E1: 'Two-sided p-value', ...col('A', 2, PRICE_A.map((_, i) => `P${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, PRICE_A), ...col('C', 2, PRICE_B) } },
    cell: 'E2', view: 'A1:E13', formats: { B: '$0.00', C: '$0.00', E2: '0.000000' }, widths: { B: 16, C: 16, E: 17 },
    require: ['T.TEST'],
    answer: '=T.TEST(B2:B13,C2:C13,2,1)',
    alt: ['=T.TEST(C2:C13,B2:B13,2,1)', '=2*T.TEST(B2:B13,C2:C13,1,1)'],
    wrong: [
      { formula: '=T.TEST(B2:B13,C2:C13,2,3)', say: 'Type 3, Welch’s test, treats the two price lists as separate samples. Each item is priced by both wholesalers, so the values come in pairs: type 1.' },
      { formula: '=T.TEST(B2:B13,C2:C13,2,2)', say: 'Type 2, the pooled test, also treats the two lists as independent samples, and the large differences between items swamp the gap between the wholesalers. Each item is priced by both wholesalers: type 1, paired.' },
      { formula: '=T.TEST(B2:B13,C2:C13,1,1)', say: 'tails = 1 gives the one-tailed p-value. The question asks for a two-sided test: tails = 2.' },
    ],
    solution: `Each item is priced by both wholesalers, so the prices come in pairs: <x>=T.TEST(B2:B13,C2:C13,2,1)</x> ≈ ${PAIR.p.toFixed(6)} (t = ${fx(PAIR.t, 2)} on ${PAIR.df} df; wholesaler B is ${usd2(PAIR.meanDiff)} cheaper per item on average, with a standard deviation of ${usd2(PAIR.sdDiff)}, and cheaper on ${PRICE_A.every((a, i) => PRICE_B[i] < a) ? 'every one of the 12 items' : `${PRICE_A.filter((a, i) => PRICE_B[i] < a).length} of the 12 items`}). Welch’s test on the same columns gives p ≈ ${fx(WELCH.p, 2)}, because the items’ prices (${usd2(Math.min(...PRICE_B))} to ${usd2(Math.max(...PRICE_A))}) differ from one another far more than the wholesalers do. Because the 12 items were chosen at random, the result is evidence about the stock list as a whole: wholesaler B’s prices are lower on average, by more than chance would produce.`,
  },

  // ================================================================ Module 4: categories and groups
  {
    id: 'b04-dg-10', lesson: 'proportions-and-chi-square', type: 'formula', kind: 'applied',
    prompt: 'Swallowtail Sweets (fictional) says its mixed bags contain 30% strawberry, 25% lemon, 25% lime and 20% orange sweets. A shop counted a random sample of 500 sweets taken from many bags: the counts are in B2:B5 and the stated shares in C2:C5. In E2, calculate in one formula the p-value of the chi-square goodness-of-fit test of the stated mix.',
    sheet: { cells: { A1: 'Flavour', B1: 'Sweets counted', C1: 'Stated share', E1: 'p-value', ...col('A', 2, FLAVOURS), ...col('B', 2, SWEETS), ...col('C', 2, MIX) }, fixed: ['C2:C5'] },
    cell: 'E2', view: 'A1:E5', formats: { C: '0%', E2: '0.0000' }, widths: { A: 11, B: 14, C: 12 },
    answer: '=CHISQ.TEST(B2:B5,C2:C5*SUM(B2:B5))',
    alt: [
      '=CHISQ.TEST(B2:B5,SUM(B2:B5)*C2:C5)',
      '=CHISQ.DIST.RT(SUMPRODUCT((B2:B5-C2:C5*SUM(B2:B5))^2/(C2:C5*SUM(B2:B5))),3)',
      '=CHISQ.DIST.RT(SUMPRODUCT((B2:B5-C2:C5*SUM(B2:B5))^2/(C2:C5*SUM(B2:B5))),COUNT(B2:B5)-1)',
    ],
    wrong: [
      { formula: '=CHISQ.TEST(B2:B5,C2:C5)', say: 'CHISQ.TEST compares counts with counts. Given the shares, it compares 182 sweets with 0.3 of a sweet and returns a p-value of almost 0. Multiply the shares by the total, SUM(B2:B5).' },
      { formula: '=CHISQ.TEST(B2:B5,C2:C5*500)', say: 'The total of 500 is typed in, so the formula stops being right when the counts change. Use SUM(B2:B5).' },
      { formula: '=CHISQ.DIST(SUMPRODUCT((B2:B5-C2:C5*SUM(B2:B5))^2/(C2:C5*SUM(B2:B5))),3,TRUE)', say: 'CHISQ.DIST with TRUE is the left-tail area. A chi-square p-value is the right tail: CHISQ.DIST.RT, or CHISQ.TEST.' },
      { formula: '=CHISQ.DIST.RT(SUMPRODUCT((B2:B5-C2:C5*SUM(B2:B5))^2/(C2:C5*SUM(B2:B5))),4)', say: 'With four categories and no parameter estimated from the data, the test has 4 − 1 = 3 degrees of freedom.' },
    ],
    solution: `The expected counts are 500 times the stated shares: ${GOF.expected.join(', ')}. <x>=CHISQ.TEST(B2:B5,C2:C5*SUM(B2:B5))</x> returns p ≈ ${fx(GOF.p, 4)}, from χ² ≈ ${fx(GOF.stat, 2)} on 3 degrees of freedom. Strawberry (182 against 150) and lime (101 against 125) contribute most: the sample is evidence, at the 5% level, that the mix differs from the one stated. Every expected count is far above 5, and sweets taken from many bags can be treated as independent; sweets from one bag might not be.`,
  },
  {
    id: 'b04-dg-11', lesson: 'proportions-and-chi-square', type: 'num', kind: 'numerical',
    prompt: 'Whinmoor Theatre (fictional) found that 96 of 400 matinee customers bought a programme, against 141 of 500 evening customers. Test H₀: p₁ = p₂ against a two-sided alternative with the two-proportion z test. What is the p-value? Give three decimal places.',
    answer: r(PROG.pValue, 3),
    check: () => { const p = 237 / 900; const z = (96 / 400 - 141 / 500) / Math.sqrt(p * (1 - p) * (1 / 400 + 1 / 500)); return 2 * I.normCdf(-Math.abs(z)); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: r(PROG.pValue / 2, 3), say: 'That is a one-sided p-value. The alternative is two-sided: count both tails.' },
      { value: r(progUnpooled, 3), say: 'That uses each sample’s own proportion in the standard error, as an interval does. The test assumes p₁ = p₂, so it pools: p̄ = 237 ÷ 900.' },
      { value: r(Math.abs(PROG.z), 2), say: 'That is |z|. The p-value is the area beyond ±1.42 under the standard normal curve: 2 × (1 − NORM.S.DIST(1.42, TRUE)).' },
    ],
    solution: `p̂₁ = 96 ÷ 400 = 0.240 and p̂₂ = 141 ÷ 500 = 0.282. Pooled p̄ = 237 ÷ 900 = ${fx(PROG.pool, 4)}; SE = √(p̄(1 − p̄)(1/400 + 1/500)) = ${fx(PROG.sePool, 4)}; z = −0.042 ÷ ${fx(PROG.sePool, 4)} = ${neg(PROG.z)}; two-sided p = ${fx(PROG.pValue, 3)}. There is no evidence at the 5% level that matinee and evening customers buy programmes at different rates. That isn’t evidence that they are the same: the 95% interval for the difference runs from ${neg(PROG.low * 100, 1)} to ${neg(PROG.high * 100, 1)} percentage points.`,
  },
  {
    id: 'b04-dg-12', lesson: 'anova', type: 'mc', kind: 'conceptual',
    prompt: 'Two studies (fictional) each compare three groups of 10 with a one-way ANOVA, and both find group means of 20, 24 and 28. In study A the values in each group lie within about 2 of their group’s mean; in study B they spread about 10 either side. What can you say about the two F statistics?',
    options: [
      'Study A’s F is far larger: the same gaps between the means stand out against less spread within groups.',
      'The two F statistics are equal, because the group means and the group sizes are the same in both studies.',
      'Study B’s F is larger, because its more spread-out values give larger sums of squares throughout the table.',
      'Neither F can be calculated without the population means that the three groups’ sample means estimate.',
    ],
    answer: 0,
    feedback: {
      1: 'The between-groups sum of squares is the same in both, but F divides it by the within-groups mean square, which is much larger in study B.',
      2: 'Study B’s larger spread raises the within-groups sum of squares, the denominator of F, not the between-groups part. A larger denominator makes F smaller.',
      3: 'F is calculated from the sample: the group means, the grand mean and the spread within the groups. The population means are what the test is about, not inputs to it.',
    },
    solution: 'SS between depends only on the group sizes and means: 10 × (4² + 0² + 4²) = 320 in both studies, so MS between is 320 ÷ 2 = 160 in both. MS within is the pooled variance inside the groups: small in study A, where values lie within about 2 of their means, and large in study B. F = MS between ÷ MS within is therefore far larger in A: the same differences between means are much clearer against less noise.',
  },
];

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
