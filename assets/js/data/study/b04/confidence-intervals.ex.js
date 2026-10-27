// confidence-intervals.ex.js — B04 · Confidence intervals: widgets, practice and the knowledge check (answer keys live
// here). Lantern's set-up times, bags, orders and subscription flags come from case.js; Redfern Bakery, Tamarind
// Kitchen, Ambleside Hotel, Westcliff Gym, Tollgate Bike Hire and Brockwell Clinic are fictional. Formula items are
// marked by their results on the sheet and on copies with the numbers changed; num items recompute their answers.
import { SETUP_MINUTES, ORDER_VALUES, SUBSCRIPTION_FLAGS, SURVEY, DERIVED as D } from './case.js?v=22';
import * as I from '../../../core/inference.js?v=22';

const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const t2 = (conf, df) => I.tInv(1 - (1 - conf) / 2, df);
const Z = I.normInv(0.975);

// Redfern Bakery (fictional): σ = 6 g from long experience; 36 loaves weighed, mean 810.4 g
const LOAF = { sigma: 6, n: 36, mean: 810.4 };
const loafM = Z * LOAF.sigma / Math.sqrt(LOAF.n);
// Tamarind Kitchen (fictional): 16 lunchtime orders timed, mean 14.2 min, s 3.6 min
const TAM = { n: 16, mean: 14.2, s: 3.6 };
const tamUp = TAM.mean + t2(0.95, TAM.n - 1) * TAM.s / Math.sqrt(TAM.n);
// Ambleside Hotel (fictional): 12 check-in times (min); 46 of 120 guests rated breakfast excellent
const CHECKIN = [4.2, 6.8, 3.5, 5.1, 7.9, 4.6, 5.5, 6.1, 3.9, 8.4, 5.0, 4.8];
const CI_CHK = I.ciMean(CHECKIN);
const BREAKFAST = { x: 46, n: 120 };
// Westcliff Gym (fictional): 132 of 220 members want early opening
const GYM = { x: 132, n: 220 };
const gymP = GYM.x / GYM.n, gymSE = Math.sqrt(gymP * (1 - gymP) / GYM.n);
// Tollgate Bike Hire (fictional): σ ≈ 48 min, mean duration to within ±5 min
const RENT = { sigma: 48, E: 5 };
// Brockwell Clinic (fictional): 30 patients' waiting times, s = 11.4 min
const CLINIC = { s: 11.4, n: 30 };
// Redfern again: 50 loaves, s = 5.8 g, 99% margin
const LOAF50 = { s: 5.8, n: 50 };

const setupSheet = {
  cells: {
    A1: 'Set-up time (min)', ...col('A', 2, SETUP_MINUTES),
    C1: 'Statistic', D1: 'Value',
    C2: 'Confidence level', D2: 0.95,
    C3: 'n', D3: '=COUNT(A2:A25)',
    C4: 'Mean', D4: '=AVERAGE(A2:A25)',
    C5: 'SD (sample)', D5: '=STDEV.S(A2:A25)',
    C6: 'Standard error', D6: '=D5/SQRT(D3)',
    C7: 't multiplier', D7: '=T.INV.2T(1-D2,D3-1)',
    C8: 'Margin (CONFIDENCE.T)', D8: '=CONFIDENCE.T(1-D2,D5,D3)',
    C9: 'Margin (t × SE)', D9: '=D7*D6',
    C10: 'Lower limit', D10: '=D4-D8',
    C11: 'Upper limit', D11: '=D4+D8',
    C12: 'z margin, for comparison', D12: '=NORM.S.INV(1-(1-D2)/2)*D6',
  },
};

export const widgets = {
  'ci-sheet': {
    type: 'sheet', title: 'Ana’s 24 set-up times and a t interval for their mean',
    sheet: setupSheet, view: 'A1:D25', maxHeight: '22rem', editable: true,
    formats: { D2: '0%', D4: '0.000', D5: '0.000', D6: '0.000', D7: '0.000', D8: '0.000', D9: '0.000', D10: '0.00', D11: '0.00', D12: '0.000' },
    widths: { A: 16, C: 24 },
    tools: ['formulas', 'reset'],
    note: 'D8 and D9 always agree: CONFIDENCE.T is the t multiplier times the standard error. D12 shows the narrower margin you would get by wrongly using z with the sample’s s. Change a set-up time to 120 (a disastrous set-up) and see how one value widens the interval.',
  },
  'ci-t': {
    type: 'curve', title: 'The t distribution with 23 degrees of freedom, and the standard normal',
    dist: 't', params: { df: 23 }, vary: ['df'], limits: { df: [1, 200, 1] }, asks: ['inverse', 'outside', 'above'], prob: 0.975, a: 1.96, overlay: 'normal', xLabel: 't', places: 3,
    note: 'At 23 degrees of freedom the value with 97.5% below it is 2.069. With “Both tails” at 1.96, the area outside is about 0.062, not 0.05. Set the degrees of freedom to 2, then to 100.',
  },
  'ci-cover-subs': {
    type: 'sampling', title: '95% intervals for the subscription share (the population: 104 of 231, 45.0%)',
    population: SUBSCRIPTION_FLAGS, label: 'spring orders (1 = subscription)', stat: 'proportion', mode: 'intervals', conf: 0.95, sizes: [20, 50, 100], n: 50, seed: 21,
    note: 'Each line is p̂ ± 1.96 × √(p̂(1 − p̂) ÷ n) from one random sample. Over many samples about 95% contain 45.0%; at n = 20 a little fewer, because the Wald interval is only approximate.',
  },
  'ci-cover-orders': {
    type: 'sampling', title: '95% t intervals for the mean order value (the population mean: $39.38)',
    population: ORDER_VALUES, label: 'spring orders', units: 'dollars', stat: 'mean', mode: 'intervals', conf: 0.95, sizes: [10, 30, 100], n: 30, seed: 21, places: 2,
    note: 'The misses are almost all on the low side. Seven samples in eight miss the $1,512 office order; their means centre on about $33 with a small s, and about a third of their intervals lie wholly below $39.38, while every sample that includes the order captures it. The capture rate is about 70% at n = 30 and worse, about 58%, at n = 100, because the samples that miss the order give narrower intervals around $33. Drawing more intervals doesn’t change the rate; the t interval’s conditions fail for this population until samples run into the thousands.',
  },
};

export const guided = [
  {
    id: 'b04-ci-g1', type: 'steps', kind: 'numerical',
    prompt: 'Redfern Bakery (fictional) knows from years of records that its loaf weights have a standard deviation of 6 g. This week it weighed 36 loaves at random: mean 810.4 g. Build a 95% confidence interval for this week’s mean loaf weight.',
    solution: `SE = 6 ÷ √36 = 1 g; margin = 1.96 × 1 = ${loafM.toFixed(2)} g; interval ${(LOAF.mean - loafM).toFixed(2)} to ${(LOAF.mean + loafM).toFixed(2)} g. <x>=CONFIDENCE.NORM(0.05,6,36)</x> returns the margin.`,
    steps: [
      {
        id: 'b04-ci-g1-s1', type: 'num',
        prompt: 'What is the standard error of the mean, in grams?',
        answer: 1, check: () => LOAF.sigma / Math.sqrt(LOAF.n), unit: 'g', places: 2, tol: 0.005,
        wrong: [{ value: LOAF.sigma / LOAF.n, say: 'Divide σ by √n = 6, not by n = 36.' }, { value: 6, say: 'That is the standard deviation of single loaves. The mean of 36 varies less: σ ÷ √n.' }],
        hints: ['σ ÷ √n', '6 ÷ √36'],
        solution: '6 ÷ √36 = 6 ÷ 6 = 1 g.',
      },
      {
        id: 'b04-ci-g1-s2', type: 'formula',
        prompt: 'B2 holds σ, B3 the sample size and B4 the confidence level. In B6, calculate the margin of error with CONFIDENCE.NORM.',
        sheet: { cells: { A1: 'Sample mean (g)', B1: LOAF.mean, A2: 'Known SD (g)', B2: LOAF.sigma, A3: 'Loaves weighed', B3: LOAF.n, A4: 'Confidence level', B4: 0.95, A6: 'Margin of error (g)' }, vary: { B4: [0.9, 0.99] } },
        cell: 'B6', answer: '=CONFIDENCE.NORM(1-B4,B2,B3)',
        require: ['CONFIDENCE.NORM'],
        view: 'A1:B6', formats: { B4: '0%', B6: '0.000' }, widths: { A: 20 },
        wrong: [
          { formula: '=CONFIDENCE.NORM(B4,B2,B3)', say: 'CONFIDENCE.NORM’s first argument is alpha, 1 − the confidence level: 0.05 for a 95% interval. With 0.95 you get a 5% interval, far too narrow.' },
          { formula: '=CONFIDENCE.T(1-B4,B2,B3)', say: 'σ is known here, so the z interval applies: CONFIDENCE.NORM. CONFIDENCE.T is for a standard deviation estimated from the sample.' },
          { formula: '=CONFIDENCE.NORM(1-B4,B2,SQRT(B3))', say: 'Give CONFIDENCE.NORM the sample size itself; it takes the square root for you.' },
        ],
        hints: ['CONFIDENCE.NORM(alpha, standard_dev, size), with alpha = 1 − confidence level.', '<x>=CONFIDENCE.NORM(1-B4,B2,B3)</x>'],
      },
      {
        id: 'b04-ci-g1-s3', type: 'order',
        prompt: 'Put the steps for building and reporting the interval in order.',
        items: [
          'Check the conditions: a random sample, and loaf weights roughly normal or a sample large enough.',
          'Calculate the standard error of the mean.',
          'Choose the multiplier for the confidence level: z, because σ is known.',
          'Multiply to get the margin of error.',
          'Subtract the margin from the sample mean and add it to get the two limits.',
          'Report the interval with its confidence level, as a statement about the mean weight.',
        ],
        hints: ['Conditions first, the report last.', 'Conditions, SE, multiplier, margin, limits, report.'],
      },
      {
        id: 'b04-ci-g1-s4', type: 'mc',
        prompt: `The interval is ${(LOAF.mean - loafM).toFixed(1)} to ${(LOAF.mean + loafM).toFixed(1)} g. Which reading is correct?`,
        options: [
          'It comes from a method that captures the true mean in 95% of samples; this one may or may not.',
          `95% of the loaves the bakery baked this week weigh between ${(LOAF.mean - loafM).toFixed(1)} g and ${(LOAF.mean + loafM).toFixed(1)} g.`,
          `There is a 95% probability that the week’s true mean lies between ${(LOAF.mean - loafM).toFixed(1)} and ${(LOAF.mean + loafM).toFixed(1)} g.`,
          `If the bakery weighed 36 more loaves, their mean would fall in this interval with probability 0.95.`,
        ],
        answer: 0,
        hints: ['The 95% belongs to the procedure, repeated over many samples.'],
        feedback: {
          1: 'Single loaves vary with σ = 6 g, so most lie far outside a range only 4 g wide. The interval is for the mean.',
          2: 'The true mean is fixed; once computed, the interval contains it or doesn’t. The 95% is the method’s long-run capture rate.',
          3: 'A new sample’s mean varies around the true mean, not around this sample’s 810.4 g, so the chance it lands in this interval is less than 95%.',
        },
      },
    ],
  },
  {
    id: 'b04-ci-g2', type: 'formula', kind: 'numerical',
    prompt: 'B1 holds a confidence level and B2 a sample size. In B4, calculate the t multiplier for a two-sided confidence interval for a mean.',
    sheet: { cells: { A1: 'Confidence level', B1: 0.95, A2: 'Sample size', B2: 15, A4: 't multiplier' }, vary: { B1: [0.9, 0.99], B2: [10, 25] } },
    cell: 'B4', answer: '=T.INV.2T(1-B1,B2-1)',
    alt: ['=T.INV(1-(1-B1)/2,B2-1)', '=-T.INV((1-B1)/2,B2-1)', '=T.INV((1+B1)/2,B2-1)'],
    view: 'A1:B4', formats: { B1: '0%', B4: '0.000' }, widths: { A: 18 },
    wrong: [
      { formula: '=T.INV.2T(1-B1,B2)', say: 'The degrees of freedom are n − 1, not n: B2-1.' },
      { formula: '=T.INV(B1,B2-1)', say: 'T.INV(0.95, …) puts all 5% in the upper tail, a one-sided multiplier. A two-sided interval needs 2.5% in each tail: T.INV.2T(0.05, df).' },
      { formula: '=NORM.S.INV(1-(1-B1)/2)', say: 'That is the z multiplier, 1.96. With σ estimated from the sample, use t with n − 1 degrees of freedom.' },
    ],
    hints: ['T.INV.2T(probability, deg_freedom) gives the t with that probability in the two tails together.', '<x>=T.INV.2T(1-B1,B2-1)</x>'],
    solution: `<x>=T.INV.2T(1-B1,B2-1)</x> = T.INV.2T(0.05, 14) = ${t2(0.95, 14).toFixed(3)}. Equivalent: <x>=T.INV(0.975,14)</x>. It is larger than z = 1.96 because 14 degrees of freedom give heavier tails.`,
  },
  {
    id: 'b04-ci-g3', type: 'num', kind: 'numerical',
    prompt: 'Tamarind Kitchen (fictional) timed 16 lunchtime orders from order to table, drawn at random over a month: mean 14.2 minutes, standard deviation 3.6 minutes, no outliers. What is the upper limit of a 95% confidence interval for the mean time? Give minutes to two decimal places.',
    answer: Math.round(tamUp * 100) / 100, check: () => TAM.mean + I.tInv(0.975, TAM.n - 1) * TAM.s / Math.sqrt(TAM.n), unit: 'min', places: 2, tol: 0.02,
    wrong: [
      { value: Math.round((TAM.mean + Z * TAM.s / Math.sqrt(TAM.n)) * 100) / 100, say: 'That uses z = 1.96. With s estimated from 16 orders, use t with 15 degrees of freedom: 2.131.' },
      { value: Math.round((TAM.mean + t2(0.95, TAM.n - 1) * TAM.s) * 100) / 100, say: 'Multiply t by the standard error, s ÷ √n = 0.9, not by s.' },
    ],
    hints: ['SE = 3.6 ÷ √16 = 0.9; t with 15 degrees of freedom: T.INV.2T(0.05,15).', 'Upper limit = 14.2 + 2.131 × 0.9.'],
    solution: `SE = 3.6 ÷ 4 = 0.9; t = T.INV.2T(0.05, 15) = ${t2(0.95, 15).toFixed(3)}; margin = ${t2(0.95, 15).toFixed(3)} × 0.9 = ${(t2(0.95, 15) * 0.9).toFixed(3)}; upper limit = ${tamUp.toFixed(2)} minutes (lower limit ${(2 * TAM.mean - tamUp).toFixed(2)}).`,
  },
  {
    id: 'b04-ci-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s 95% interval for the mean set-up time is 34.4 to 41.3 minutes. Which change would legitimately make the next interval narrower?',
    options: [
      'Timing more events chosen at random, because the margin falls with the square root of n.',
      'Reporting a 99% interval instead, because a higher confidence level gives a more precise result.',
      'Using 1.96 instead of the t multiplier, because both describe the same 95% of the bell curve.',
      'Leaving out the two slowest set-ups, because they make the standard deviation larger than usual.',
    ],
    answer: 0,
    hints: ['Which of the three ingredients, multiplier, spread or n, can she change honestly?'],
    feedback: {
      1: 'Higher confidence needs a larger multiplier (2.807 instead of 2.069 here), so the interval gets wider, not narrower.',
      2: 'It would be narrower but wrong: with s estimated, the t multiplier is the one that delivers 95%. With 1.96 the method captures μ less often.',
      3: 'Dropping real values to tidy the data understates the spread and biases the interval. Remove a value only if it is an error.',
    },
    solution: 'The margin is t × s ÷ √n. More randomly chosen events shrink it with √n (four times as many halve it). A higher confidence level widens it; using z with s or deleting genuine values narrows it dishonestly.',
  },
];

export const independent = [
  {
    id: 'b04-ci-i1', type: 'formula', kind: 'numerical',
    prompt: 'Ambleside Hotel (fictional) timed 12 check-ins chosen at random (A2:A13, minutes). In D2, calculate the lower limit of a 95% t interval for the mean check-in time in one formula.',
    sheet: { cells: { A1: 'Check-in (min)', ...col('A', 2, CHECKIN), C2: 'Lower 95% limit' } },
    cell: 'D2', answer: '=AVERAGE(A2:A13)-CONFIDENCE.T(0.05,STDEV.S(A2:A13),COUNT(A2:A13))',
    alt: ['=AVERAGE(A2:A13)-T.INV.2T(0.05,COUNT(A2:A13)-1)*STDEV.S(A2:A13)/SQRT(COUNT(A2:A13))', '=AVERAGE(A2:A13)-CONFIDENCE.T(0.05,STDEV.S(A2:A13),12)', '=AVERAGE(A2:A13)-T.INV(0.975,11)*STDEV.S(A2:A13)/SQRT(12)'],
    view: 'A1:D13', formats: { A: '0.0', D2: '0.00' }, widths: { C: 16 },
    wrong: [
      { formula: '=AVERAGE(A2:A13)-CONFIDENCE.NORM(0.05,STDEV.S(A2:A13),COUNT(A2:A13))', say: 'CONFIDENCE.NORM uses z = 1.96 and assumes σ is known. With s estimated from 12 check-ins, use CONFIDENCE.T (t with 11 degrees of freedom).' },
      { formula: '=AVERAGE(A2:A13)-CONFIDENCE.T(0.05,STDEV.P(A2:A13),COUNT(A2:A13))', say: 'Use the sample standard deviation, STDEV.S: the 12 check-ins are a sample of all check-ins.' },
      { formula: '=AVERAGE(A2:A13)+CONFIDENCE.T(0.05,STDEV.S(A2:A13),COUNT(A2:A13))', say: 'Adding the margin gives the upper limit. The lower limit subtracts it.' },
      { formula: '=AVERAGE(A2:A13)-CONFIDENCE.T(0.95,STDEV.S(A2:A13),COUNT(A2:A13))', say: 'CONFIDENCE.T takes alpha, 0.05 for a 95% interval, not the confidence level.' },
    ],
    solution: `<x>=AVERAGE(A2:A13)-CONFIDENCE.T(0.05,STDEV.S(A2:A13),COUNT(A2:A13))</x>: mean ${CI_CHK.mean.toFixed(3)}, s ${CI_CHK.sd.toFixed(3)}, margin ${CI_CHK.margin.toFixed(3)}, so the interval is ${CI_CHK.low.toFixed(2)} to ${CI_CHK.high.toFixed(2)} minutes.`,
  },
  {
    id: 'b04-ci-i2', type: 'num', kind: 'numerical',
    prompt: 'Westcliff Gym (fictional) surveyed 220 members chosen at random; 132 would use a 6 a.m. opening. What is the upper limit of the 95% (Wald) confidence interval for the share of all members who would use it? Give the percentage to one decimal place.',
    answer: Math.round((gymP + Z * gymSE) * 1000) / 10, check: () => (GYM.x / GYM.n + I.normInv(0.975) * Math.sqrt((GYM.x / GYM.n) * (1 - GYM.x / GYM.n) / GYM.n)) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round((gymP + I.normInv(0.95) * gymSE) * 1000) / 10, say: 'That uses 1.645, the multiplier for a 90% interval. For 95% use 1.96.' },
      { value: Math.round(Z * gymSE * 1000) / 10, say: 'That is the margin of error alone. Add it to p̂ = 60% for the upper limit.' },
      { value: Math.round((gymP + Z * Math.sqrt(gymP * (1 - gymP)) / GYM.n) * 1000) / 10, say: 'The standard error divides by √n inside the square root: √(p̂(1 − p̂) ÷ n).' },
    ],
    solution: `p̂ = 132 ÷ 220 = 0.60; SE = √(0.6 × 0.4 ÷ 220) = ${gymSE.toFixed(4)}; margin = 1.96 × ${gymSE.toFixed(4)} = ${(Z * gymSE).toFixed(4)}; interval ${pc(gymP - Z * gymSE)} to ${pc(gymP + Z * gymSE)}. Conditions: 132 and 88, both at least 10.`,
  },
  {
    id: 'b04-ci-i3', type: 'num', kind: 'applied',
    prompt: 'Tollgate Bike Hire (fictional) wants to estimate its mean rental duration to within ±5 minutes at 95% confidence. Past data suggest a standard deviation of about 48 minutes. How many rentals should it sample?',
    answer: I.sampleSizeMean(RENT.sigma, RENT.E), check: () => Math.ceil((I.normInv(0.975) * RENT.sigma / RENT.E) ** 2), unit: 'rentals', places: 0, tol: 0.5,
    wrong: [
      { value: Math.floor((Z * RENT.sigma / RENT.E) ** 2), say: 'Always round a sample size up: 354.03 rentals would give a margin slightly over 5 minutes.' },
      { value: Math.ceil(Z * RENT.sigma / RENT.E), say: 'You forgot to square: n = (zσ ÷ E)².' },
      { value: Math.ceil((I.normInv(0.95) * RENT.sigma / RENT.E) ** 2), say: 'That uses 1.645, the 90% multiplier. For 95% use 1.96.' },
    ],
    solution: `n = (1.96 × 48 ÷ 5)² = (${(Z * 48 / 5).toFixed(3)})² = ${((Z * 48 / 5) ** 2).toFixed(2)}, rounded up to ${I.sampleSizeMean(RENT.sigma, RENT.E)} rentals.`,
  },
  {
    id: 'b04-ci-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Ana’s 95% confidence interval for Lantern’s mean set-up time is 34.4 to 41.3 minutes. Select all the statements that are correct.',
    options: [
      'Over many samples, about 95% of intervals built this way would contain the true mean.',
      'It gives a range of plausible values for Lantern’s long-run mean set-up time.',
      'A 99% interval from the same 24 set-up times would be wider than this one.',
      '95% of individual events take between 34.4 and 41.3 minutes to set up.',
      'There is a 95% probability that Lantern’s true mean lies between 34.4 and 41.3 minutes.',
      'Timing 48 events instead of 24 would halve the width of the interval.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The interval is for the mean. Individual set-ups ranged from 22 to 50 minutes.',
      4: 'Once computed, the interval contains the fixed true mean or doesn’t. The 95% describes the method.',
      5: 'The width falls with √n: doubling n divides it by about 1.41. Halving it takes four times as many events.',
    },
    solution: 'Correct: the repeated-sampling meaning of 95%, the interval as a range of plausible values for the mean, and a wider interval at 99%. Wrong: reading it as a range for individual events, as a probability about this one interval, and halving the width by doubling n.',
  },
  {
    id: 'b04-ci-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Match each situation to the interval that suits it.',
    items: [
      'Mean fill weight from 40 bags, with the machine’s standard deviation known from its specification',
      'Mean set-up time from 24 events, standard deviation estimated from the same 24, no outliers',
      'Share of customers who would recommend Lantern: 61 yes and 18 no',
      'Share of orders with a complaint: 3 of 40',
      'Mean order value from 30 spring orders, where one order in the population is $1,512',
    ],
    categories: ['z interval (CONFIDENCE.NORM)', 't interval (CONFIDENCE.T)', 'Wald interval for a proportion is adequate', 'Wilson interval needed: Wald is unreliable here', 'None of these as it stands'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      3: 'Three successes is too few for p̂ ± z√(p̂(1 − p̂) ÷ n), which would give a negative lower limit. The Wilson interval stays between 0 and 1.',
      4: 'With such a skewed population, 95% t intervals from samples of 30 capture the mean only about 70% of the time. Use a far larger sample, or describe the orders with the median and percentiles.',
    },
    solution: 'σ known: z. σ estimated, roughly normal data: t. A proportion with at least 10 of each outcome: the Wald interval is adequate (Wilson would also do). Three successes: Wald gives a negative lower limit, so the Wilson interval is needed. A strongly skewed population with a small sample: none of these is reliable as it stands.',
  },
  {
    id: 'b04-ci-i6', type: 'fill', kind: 'applied',
    prompt: 'Complete Ana’s planning notes.',
    text: 'To cut the margin for the mean set-up time from ±3.5 to ±1.75 minutes at the same confidence, I would need about [[0]] times as many events. In <x>=CONFIDENCE.T(0.05,D5,D3)</x> the 0.05 is [[1]]. For a survey share with no idea of its value, the cautious planning value is p = [[2]], because it makes p(1 − p) [[3]].',
    blanks: [
      { options: ['2', '4', '1.41'], answer: 1 },
      { options: ['alpha, 1 − the confidence level', 'the confidence level', 'the margin of error'], answer: 0 },
      { options: ['0.95', '0.05', '0.5'], answer: 2 },
      { options: ['as small as possible', 'as large as possible', 'equal to 1'], answer: 1 },
    ],
    solution: 'The margin falls with √n, so halving it needs four times the sample. CONFIDENCE.T takes alpha, 0.05 for 95%. p(1 − p) peaks at 0.25 when p = 0.5, so planning with 0.5 can only overestimate the sample needed.',
  },
];

export const check = [
  {
    id: 'b04-ci-k1', type: 'mc', kind: 'conceptual',
    prompt: `Ana’s 95% t interval for the mean weight of Kilnworth’s bags is ${D.kg.ci.low.toFixed(2)} to ${D.kg.ci.high.toFixed(2)} g. Which statement is correct?`,
    options: [
      'Its method captures the true mean in 95% of samples; this particular interval contains it or doesn’t.',
      'There is a 95% chance that the true mean weight of Kilnworth’s bags lies inside this particular interval.',
      `95% of the bags Kilnworth fills weigh between ${D.kg.ci.low.toFixed(2)} g and ${D.kg.ci.high.toFixed(2)} g.`,
      'If Ana weighed 40 more bags, their mean would lie in this interval with a probability of 0.95.',
    ],
    answer: 0,
    feedback: {
      1: 'The true mean is fixed, not random; the probability statement belongs to the method across many samples.',
      2: 'Single bags vary with a standard deviation of about 2.7 g; a range under 2 g wide can’t hold 95% of them. The interval is for the mean.',
      3: 'A new sample’s mean varies around the true mean, not around 1,002.75 g, so the chance is below 95%.',
    },
    solution: 'Confidence is a property of the procedure: in the long run about 95% of intervals built this way contain μ (NIST). This particular interval either contains Kilnworth’s true mean or doesn’t. It is about the mean, not about individual bags.',
  },
  {
    id: 'b04-ci-k2', type: 'formula', kind: 'numerical',
    prompt: 'Brockwell Clinic (fictional) recorded the waiting times of a random sample of patients: the standard deviation is in B1 and the sample size in B2. In B5, calculate the margin of error of a t interval for the mean wait at the confidence level in B3.',
    sheet: { cells: { A1: 'SD of waits (min)', B1: CLINIC.s, A2: 'Patients', B2: CLINIC.n, A3: 'Confidence level', B3: 0.9, A5: 'Margin of error (min)' }, vary: { B3: [0.95, 0.99] } },
    cell: 'B5', answer: '=CONFIDENCE.T(1-B3,B1,B2)',
    alt: ['=T.INV.2T(1-B3,B2-1)*B1/SQRT(B2)', '=T.INV(1-(1-B3)/2,B2-1)*B1/SQRT(B2)'],
    view: 'A1:B5', formats: { B3: '0%', B5: '0.000' }, widths: { A: 20 },
    wrong: [
      { formula: '=CONFIDENCE.T(B3,B1,B2)', say: 'The first argument is alpha, 1 − the confidence level.' },
      { formula: '=CONFIDENCE.NORM(1-B3,B1,B2)', say: 'With s estimated from the sample, use the t distribution: CONFIDENCE.T.' },
      { formula: '=T.INV.2T(1-B3,B2-1)*B1', say: 'Multiply t by the standard error, s ÷ √n, not by s.' },
    ],
    solution: `<x>=CONFIDENCE.T(1-B3,B1,B2)</x> = T.INV.2T(0.1, 29) × 11.4 ÷ √30 = ${t2(0.9, 29).toFixed(3)} × ${(11.4 / Math.sqrt(30)).toFixed(3)} = ${(t2(0.9, 29) * 11.4 / Math.sqrt(30)).toFixed(3)} minutes at 90%.`,
  },
  {
    id: 'b04-ci-k3', type: 'num', kind: 'numerical',
    prompt: 'A shop (fictional) wants to estimate the share of its customers who use its loyalty card to within ±5 percentage points at 90% confidence, with no idea what the share is. How many customers must it ask (replies needed)?',
    answer: I.sampleSizeProp(0.05, 0.9), check: () => Math.ceil(I.normInv(0.95) ** 2 * 0.25 / 0.05 ** 2), unit: 'replies', places: 0, tol: 0.5,
    wrong: [
      { value: Math.floor(I.normInv(0.95) ** 2 * 0.25 / 0.05 ** 2), say: 'Round a sample size up, not to the nearest whole number: 270.55 replies would leave the margin just over 5 points.' },
      { value: I.sampleSizeProp(0.05, 0.95), say: 'That is the size for 95% confidence (z = 1.96). At 90%, z = 1.645.' },
      { value: Math.ceil(I.normInv(0.95) ** 2 * 0.25 / 0.05), say: 'Square the margin too: E² = 0.05² = 0.0025.' },
    ],
    solution: `n = z² × p(1 − p) ÷ E² = 1.645² × 0.25 ÷ 0.05² = ${(I.normInv(0.95) ** 2 * 0.25 / 0.0025).toFixed(2)}, rounded up to ${I.sampleSizeProp(0.05, 0.9)} replies, using the cautious p = 0.5.`,
  },
  {
    id: 'b04-ci-k4', type: 'mc', kind: 'applied',
    prompt: `B01’s September survey: ${SURVEY.sent} customers invited, ${SURVEY.responses} replied, ${SURVEY.wouldRecommend.yes} would recommend Lantern (${pc(D.survey.recommend.p, 0)}, 95% interval ${pc(D.survey.recommend.low, 0)} to ${pc(D.survey.recommend.high, 0)}). Which sentence can Ana put in her report?`,
    options: [
      `“Among customers like the ${SURVEY.responses} who replied, ${pc(D.survey.recommend.low, 0)} to ${pc(D.survey.recommend.high, 0)} would recommend us; only a third of those invited replied.”`,
      `“We are 95% confident that between ${pc(D.survey.recommend.low, 0)} and ${pc(D.survey.recommend.high, 0)} of all our customers would recommend us to a friend.”`,
      `“${pc(D.survey.recommend.p, 0)} of the ${SURVEY.sent} customers we surveyed in September would recommend us to a friend, give or take ${['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][Math.round(D.survey.recommend.margin * 100)] ?? Math.round(D.survey.recommend.margin * 100)} points.”`,
      '“The interval is too wide to say anything, so the survey tells us nothing about our customers’ views.”',
    ],
    answer: 0,
    feedback: {
      1: 'The interval covers only sampling error among those who replied. With two-thirds not replying, a claim about all customers ignores possible non-response bias.',
      2: `Only ${SURVEY.responses} of the ${SURVEY.sent} answered; nothing is known about the other ${SURVEY.sent - SURVEY.responses}.`,
      3: `It says a lot: even the lower limit, ${pc(D.survey.recommend.low, 0)}, is a clear majority of those who replied. The caveat is about who replied, not about the width.`,
    },
    solution: 'The margin of error measures sampling error, the luck of which customers ended up among the replies. It doesn’t cover non-response bias: if happier customers were keener to reply, the true share among all customers could be lower. So the claim is limited to customers like those who replied, with the response rate stated.',
  },
  {
    id: 'b04-ci-k5', type: 'formula', kind: 'applied',
    prompt: 'Ambleside Hotel (fictional) asked a random sample of guests to rate breakfast: B1 rated it excellent out of B2. In B5, calculate the upper limit of the Wald confidence interval for the share of all guests who would rate it excellent, at the confidence level in B3.',
    sheet: { cells: { A1: 'Rated excellent', B1: BREAKFAST.x, A2: 'Guests asked', B2: BREAKFAST.n, A3: 'Confidence level', B3: 0.95, A5: 'Upper limit' }, vary: { B3: [0.9, 0.99] } },
    cell: 'B5', answer: '=B1/B2+NORM.S.INV(1-(1-B3)/2)*SQRT(B1/B2*(1-B1/B2)/B2)',
    alt: ['=B1/B2-NORM.S.INV((1-B3)/2)*SQRT(B1/B2*(1-B1/B2)/B2)', '=B1/B2+NORM.S.INV((1+B3)/2)*SQRT((B1/B2)*(1-B1/B2)/B2)'],
    view: 'A1:B5', formats: { B3: '0%', B5: '0.0%' }, widths: { A: 16 },
    wrong: [
      { formula: '=B1/B2+NORM.S.INV(B3)*SQRT(B1/B2*(1-B1/B2)/B2)', say: 'NORM.S.INV(0.95) is 1.645, which leaves 5% in one tail. A two-sided 95% interval needs 2.5% in each: NORM.S.INV(0.975).' },
      { formula: '=B1/B2+NORM.S.INV(1-(1-B3)/2)*B1/B2*(1-B1/B2)/B2', say: 'The standard error is a square root: SQRT(p̂(1 − p̂) ÷ n).' },
      { formula: '=B1/B2+T.INV.2T(1-B3,B2-1)*SQRT(B1/B2*(1-B1/B2)/B2)', say: 'The interval for a proportion uses the z multiplier; the t distribution is for means with an estimated standard deviation.' },
    ],
    solution: `<x>=B1/B2+NORM.S.INV(1-(1-B3)/2)*SQRT(B1/B2*(1-B1/B2)/B2)</x>: p̂ = 46 ÷ 120 = ${(46 / 120).toFixed(4)}, SE = ${Math.sqrt((46 / 120) * (74 / 120) / 120).toFixed(4)}, upper limit ${pc(46 / 120 + Z * Math.sqrt((46 / 120) * (74 / 120) / 120))}. With 46 and 74 guests in the two groups, the Wald interval’s condition holds.`,
  },
  {
    id: 'b04-ci-k6', type: 'num', kind: 'numerical',
    prompt: 'Redfern Bakery weighs 50 loaves chosen at random; their standard deviation is 5.8 g. What is the margin of error of a 99% t interval for the mean weight? Give grams to two decimal places.',
    answer: Math.round(t2(0.99, LOAF50.n - 1) * LOAF50.s / Math.sqrt(LOAF50.n) * 100) / 100, check: () => I.tInv(0.995, 49) * 5.8 / Math.sqrt(50), unit: 'g', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round(I.normInv(0.995) * LOAF50.s / Math.sqrt(LOAF50.n) * 100) / 100, say: 'That uses z = 2.576. With s from the sample, use t with 49 degrees of freedom: 2.680.' },
      { value: Math.round(t2(0.95, LOAF50.n - 1) * LOAF50.s / Math.sqrt(LOAF50.n) * 100) / 100, say: 'That is the 95% margin. For 99%, alpha is 0.01: T.INV.2T(0.01,49).' },
      { value: Math.round(t2(0.99, LOAF50.n - 1) * LOAF50.s * 100) / 100, say: 'Multiply t by the standard error, 5.8 ÷ √50, not by s.' },
    ],
    solution: `t = T.INV.2T(0.01, 49) = ${t2(0.99, 49).toFixed(3)}; SE = 5.8 ÷ √50 = ${(5.8 / Math.sqrt(50)).toFixed(4)}; margin = ${(t2(0.99, 49) * 5.8 / Math.sqrt(50)).toFixed(2)} g, or <x>=CONFIDENCE.T(0.01,5.8,50)</x>.`,
  },
];
