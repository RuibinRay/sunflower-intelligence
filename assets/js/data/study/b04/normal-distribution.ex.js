// normal-distribution.ex.js — B04 · The normal distribution: widgets, practice and the knowledge check (answer keys
// live here). Kilnworth's specification and Ana's 40 bags come from case.js; Redfern Bakery, Tollgate Bike Hire,
// Hatchmere Call Centre, Sedgefield Dairy, Westcliff Gym and Tamarind Kitchen are fictional. Formula items are marked
// by their results on the sheet and on copies with the numbers changed; num items recompute their answers in `check`.
import { KILNWORTH_1KG as K, KG_BAGS, DERIVED as D } from './case.js';
import * as I from '../../../core/inference.js';

const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const PHI = I.normCdf, INV = I.normInv;
const within = (k) => KG_BAGS.filter((x) => Math.abs(x - D.kg.mean) < k * D.kg.sd).length;

// Redfern Bakery (fictional): 800 g sourdough loaves, N(812, 6)
const LOAF = { mean: 812, sd: 6, label: 800 };
const loafZ = (LOAF.label - LOAF.mean) / LOAF.sd;
// Tollgate Bike Hire (fictional): e-bike range on a full charge, N(62, 5) km
const BIKE = { mean: 62, sd: 5, lo: 55, hi: 70 };
// Sedgefield Dairy (fictional): 1-litre bottles, N(1006, 2.5) ml
const MILK = { mean: 1006, sd: 2.5, label: 1000, lo: 1002, hi: 1010 };
// Westcliff Gym (fictional): 200 members invited to an open day, each comes with probability 0.3
const GYM = { n: 200, p: 0.3, k: 70 };
const gymMu = GYM.n * GYM.p, gymSd = Math.sqrt(GYM.n * GYM.p * (1 - GYM.p));
// Tamarind Kitchen (fictional): weekly rice use, N(120, 18) kg, 98% service level
const RICE = { mean: 120, sd: 18, level: 0.98 };

// the worksheet widget: Ana's bags with the normality checks, and Kilnworth's specification
const bagSheet = {
  cells: {
    A1: 'Bag weight (g)', ...col('A', 2, KG_BAGS),
    C1: 'Check', D1: 'Value',
    C2: 'Count', D2: '=COUNT(A2:A41)',
    C3: 'Mean', D3: '=AVERAGE(A2:A41)',
    C4: 'Median', D4: '=MEDIAN(A2:A41)',
    C5: 'SD (sample)', D5: '=STDEV.S(A2:A41)',
    C6: 'SKEW', D6: '=SKEW(A2:A41)',
    C7: 'KURT', D7: '=KURT(A2:A41)',
    C8: 'Share within 1 SD', D8: '=COUNTIFS(A2:A41,">"&D3-D5,A2:A41,"<"&D3+D5)/D2',
    C9: 'Share within 2 SD', D9: '=COUNTIFS(A2:A41,">"&D3-2*D5,A2:A41,"<"&D3+2*D5)/D2',
    C10: 'Share within 3 SD', D10: '=COUNTIFS(A2:A41,">"&D3-3*D5,A2:A41,"<"&D3+3*D5)/D2',
    C11: 'Bags under the label', D11: '=COUNTIF(A2:A41,"<"&G2)',
    F1: 'Specification', G1: 'Value',
    F2: 'Label (g)', G2: K.label,
    F3: 'Setting (g)', G3: K.setting,
    F4: 'SD (g)', G4: K.sd,
    F5: 'Share under the label', G5: '=NORM.DIST(G2,G3,G4,TRUE)',
    F6: 'Expected short in 40 bags', G6: '=G5*D2',
    F7: 'Setting for 1% short', G7: '=G2+NORM.S.INV(0.99)*G4',
    F8: 'Sample’s model: share under', G8: '=NORM.DIST(G2,D3,D5,TRUE)',
  },
};

export const widgets = {
  'nd-kiln': {
    type: 'curve', title: 'Kilnworth’s 1 kg bags: N(1,004, 3) if the machine runs as specified',
    dist: 'normal', params: { mean: K.setting, sd: K.sd }, vary: ['mean', 'sd'], limits: { mean: [995, 1015, 0.5], sd: [0.5, 8, 0.1] },
    asks: ['below', 'above', 'between', 'inverse'], a: K.label, b: 1008, prob: 0.01, xLabel: 'Bag weight (g)', places: 2,
    note: 'Start with P(X &lt; a) at a = 1,000 g: 0.0912. Raise the mean until the probability is 0.01 (about 1,007 g), then put it back at 1,004 and lower the standard deviation instead (about 1.72 g). With “Value for a probability” at 0.01, the curve gives the weight with 1% of bags below it.',
  },
  'nd-bags': {
    type: 'distribution', values: KG_BAGS, label: 'Weight of Ana’s 40 bags, October 2026 (g)', transforms: ['none'], rules: ['iqr', 'z'],
  },
  'nd-sheet': {
    type: 'sheet', title: 'Ana’s 40 bags: the normality checks, and Kilnworth’s specification',
    sheet: bagSheet, view: 'A1:G41', maxHeight: '22rem', editable: 'A2:G41',
    formats: { A: '0.0', D3: '0.00', D4: '0.00', D5: '0.00', D6: '0.00', D7: '0.00', D8: '0.0%', D9: '0.0%', D10: '0.0%', G5: '0.00%', G6: '0.0', G7: '0.00', G8: '0.00%' },
    widths: { C: 20, F: 26 },
    tools: ['formulas', 'reset'],
    note: 'D8:D10 count the bags within one, two and three standard deviations of the mean with COUNTIFS, for comparison with 68%, 95% and 99.7%. G5 is the specification’s share under the label and G7 the setting that would leave 1% short. Change G3 or G4, or a weight in column A, and compare G5 with G8, the share the sample’s own mean and standard deviation imply.',
  },
  'nd-z': {
    type: 'curve', title: 'The standard normal distribution, N(0, 1)',
    dist: 'normal', params: { mean: 0, sd: 1 }, asks: ['inverse', 'outside', 'below', 'above'], a: 1.96, prob: 0.975, xLabel: 'z', places: 3,
    note: 'With “Value for a probability” at 0.975 the cut-off is 1.960. “Both tails” at a distance of 1.96 gives 0.05: the 5% outside ±1.96. “P(X &lt; a)” at a = −1.333 is Kilnworth’s 0.0912.',
  },
};

export const guided = [
  {
    id: 'b04-nd-g1', type: 'steps', kind: 'numerical',
    prompt: 'Redfern Bakery (fictional) sells 800 g sourdough loaves. Its oven and divider produce loaf weights that are roughly normal with mean 812 g and standard deviation 6 g. What share of loaves weigh less than the 800 g on the label?',
    solution: `z = (800 − 812) ÷ 6 = −2.00. The area below −2 is <x>=NORM.DIST(800,812,6,TRUE)</x> = ${PHI(-2).toFixed(4)}, so about ${pc(PHI(-2))} of loaves, roughly 2 in 100, are under 800 g.`,
    steps: [
      {
        id: 'b04-nd-g1-s0', type: 'order',
        prompt: 'First, put the method for a normal probability in order.',
        items: [
          'Sketch the curve and shade the area the question asks for: here, below 800 g.',
          'Standardise the cut-off: z = (800 − 812) ÷ 6.',
          'Find the area below z with NORM.S.DIST, or use NORM.DIST on the grams directly.',
          'Turn that area into the one the question needs: 1 minus it for “above”, a difference for “between”.',
          'State the result in the bakery’s terms: the share of loaves under 800 g.',
        ],
        hints: ['Decide which area you need before you calculate anything.', 'Sketch, standardise, look up, adjust, interpret.'],
      },
      {
        id: 'b04-nd-g1-s1', type: 'num',
        prompt: 'What is the z-score of an 800 g loaf? Give two decimal places.',
        answer: -2, check: () => (LOAF.label - LOAF.mean) / LOAF.sd, unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: 2, say: 'That is the distance, but 800 g is below the mean of 812 g, so the z-score is negative: (800 − 812) ÷ 6.' },
          { value: -12, say: 'That is the gap in grams. Divide it by the standard deviation to measure it in standard deviations.' },
        ],
        hints: ['z = (x − μ) ÷ σ.', '(800 − 812) ÷ 6'],
        solution: 'z = (800 − 812) ÷ 6 = −12 ÷ 6 = −2.00: an 800 g loaf is two standard deviations below the mean.',
      },
      {
        id: 'b04-nd-g1-s2', type: 'formula',
        prompt: 'B1:B3 hold the mean, the standard deviation and the cut-off. In B5, calculate the share of loaves that weigh less than the cut-off, with NORM.DIST.',
        sheet: { cells: { A1: 'Mean (g)', B1: LOAF.mean, A2: 'SD (g)', B2: LOAF.sd, A3: 'Cut-off (g)', B3: LOAF.label, A5: 'Share under the cut-off' }, vary: { B3: [795, 805] } },
        cell: 'B5', answer: '=NORM.DIST(B3,B1,B2,TRUE)',
        alt: ['=NORM.DIST(B3,B1,B2,1)'],
        require: ['NORM.DIST'],
        view: 'A1:B5', formats: { B5: '0.0000' }, widths: { A: 22 },
        wrong: [
          { formula: '=NORM.DIST(B3,B1,B2,FALSE)', say: 'With FALSE, NORM.DIST returns the height of the density curve, not a probability. Set cumulative to TRUE for the area below the cut-off.' },
          { formula: '=1-NORM.DIST(B3,B1,B2,TRUE)', say: 'That is the share heavier than the cut-off. NORM.DIST with TRUE already gives the area below it.' },
          { formula: '=NORM.DIST(800,812,6,TRUE)', say: 'Right function, but typed numbers don’t update when the inputs change. Point at B3, B1 and B2.' },
          { formula: '=NORM.S.DIST(B3,TRUE)', say: 'NORM.S.DIST takes a z-score, not grams. Standardise first, (B3 − B1) ÷ B2, or use NORM.DIST with the mean and standard deviation.' },
        ],
        hints: ['NORM.DIST(x, mean, standard_dev, cumulative): the cumulative form gives the area below x.', '<x>=NORM.DIST(B3,B1,B2,TRUE)</x>'],
      },
      {
        id: 'b04-nd-g1-s3', type: 'mc',
        prompt: 'How should the bakery read the result?',
        options: [
          `About ${pc(PHI(-2))} of loaves, roughly 2 in every 100, weigh less than 800 g.`,
          'About 2% of loaves are short, because the z-score of the label is −2.',
          `About ${pc(1 - PHI(-2))} of loaves weigh less than 800 g, so nearly all are short.`,
          'About 5% of loaves are short, because 95% of values lie within two standard deviations.',
        ],
        answer: 0,
        hints: ['The probability is the area below the cut-off; the z-score is a distance.'],
        feedback: {
          1: 'The z-score is a distance in standard deviations, not a percentage. That it is close to the answer here is a coincidence of z = −2.',
          2: `${pc(1 - PHI(-2))} is the area above 800 g: the loaves that are not short.`,
          3: 'The 5% outside two standard deviations is split between two tails. Only the lower tail is short: about 2.3%.',
        },
      },
    ],
  },
  {
    id: 'b04-nd-g2', type: 'formula', kind: 'applied',
    prompt: 'Redfern Bakery wants no more than the share in B3 of its loaves under the 800 g label (B1), with the standard deviation in B2. In B5, calculate the mean weight the bakery should aim for.',
    sheet: { cells: { A1: 'Label (g)', B1: LOAF.label, A2: 'SD (g)', B2: LOAF.sd, A3: 'Most short (share)', B3: 0.005, A5: 'Target mean (g)' }, vary: { B3: [0.01, 0.02] } },
    cell: 'B5', answer: '=B1+NORM.S.INV(1-B3)*B2',
    alt: ['=B1-NORM.S.INV(B3)*B2', '=NORM.INV(1-B3,B1,B2)', '=B1-NORM.INV(B3,0,1)*B2'],
    view: 'A1:B5', formats: { B3: '0.0%', B5: '0.00' }, widths: { A: 20 },
    wrong: [
      { formula: '=NORM.INV(B3,B1,B2)', say: 'That is the weight with 0.5% of loaves below it if the mean were 800 g, about 784.5 g. The label must sit z standard deviations below the target, so the target is 800 + z × 6, with z = NORM.S.INV(1 − B3).' },
      { formula: '=B1+NORM.S.INV(B3)*B2', say: 'NORM.S.INV(0.005) is negative (−2.576), so this aims below the label. Use the z with 99.5% below it, NORM.S.INV(1 − B3), or subtract.' },
      { formula: '=B1+NORM.S.INV(1-B3/2)*B2', say: 'Only short loaves matter, a single lower tail: put all of B3 in it. Halving B3 is for two-tailed questions.' },
    ],
    hints: [
      'For 0.5% below the label, the label must sit 2.576 standard deviations below the mean: NORM.S.INV(0.995) = 2.576.',
      'Target = label + z × SD: <x>=B1+NORM.S.INV(1-B3)*B2</x>.',
    ],
    solution: `z = NORM.S.INV(0.995) = ${INV(0.995).toFixed(3)}, so the target is 800 + ${INV(0.995).toFixed(3)} × 6 = ${(800 + INV(0.995) * 6).toFixed(2)} g: <x>=B1+NORM.S.INV(1-B3)*B2</x>. Check: <x>=NORM.DIST(800,815.45,6,TRUE)</x> returns 0.005.`,
  },
  {
    id: 'b04-nd-g3', type: 'num', kind: 'numerical',
    prompt: 'Tollgate Bike Hire (fictional) finds that its e-bikes’ range on a full charge is roughly normal with mean 62 km and standard deviation 5 km. What percentage of full charges give a range between 55 km and 70 km? Give one decimal place.',
    answer: Math.round((PHI(1.6) - PHI(-1.4)) * 1000) / 10, check: () => (I.normal.cdf(BIKE.hi, BIKE.mean, BIKE.sd) - I.normal.cdf(BIKE.lo, BIKE.mean, BIKE.sd)) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [
      { value: Math.round(PHI(1.6) * 1000) / 10, say: 'That is the share below 70 km. Subtract the share below 55 km to keep only the part between.' },
      { value: Math.round(PHI(-1.4) * 1000) / 10, say: 'That is the share below 55 km, one of the two areas you need. The share between is below 70 minus below 55.' },
      { value: Math.round((1 - PHI(-1.4)) * 1000) / 10, say: 'That is the share above 55 km, which still includes the charges over 70 km.' },
    ],
    hints: ['z-scores: (55 − 62) ÷ 5 = −1.4 and (70 − 62) ÷ 5 = 1.6.', 'Area between = area below 1.6 − area below −1.4.'],
    solution: `z = −1.4 and 1.6. Area below 1.6 = ${PHI(1.6).toFixed(4)}, below −1.4 = ${PHI(-1.4).toFixed(4)}, so between = ${(PHI(1.6) - PHI(-1.4)).toFixed(4)}, about ${pc(PHI(1.6) - PHI(-1.4))}. In Excel: <x>=NORM.DIST(70,62,5,TRUE)-NORM.DIST(55,62,5,TRUE)</x>.`,
  },
  {
    id: 'b04-nd-g4', type: 'mc', kind: 'conceptual',
    prompt: 'For which of these measurements would a normal model be the poorest choice?',
    options: [
      'Hatchmere Call Centre’s (fictional) answer times: most calls within a minute, a few after ten.',
      'The volume in 1-litre bottles from a filling line that has been running steadily all week, checked hourly.',
      'The diameter of bolts cut by one well-maintained machine to a 10 mm specification.',
      'The weight of 800 g loaves from one bakery’s divider and oven, weighed over a month.',
    ],
    answer: 0,
    hints: ['Look for a measurement bounded at zero with a long tail on one side.'],
    feedback: {
      1: 'A steady filling process misses its target as often over as under, with large misses rare: a classic normal pattern.',
      2: 'A well-maintained machine’s small errors in both directions usually give a roughly normal spread.',
      3: 'Loaf weights from a stable process are usually close to symmetric, so a normal model is a reasonable start (check the data).',
    },
    solution: 'Waiting times can’t go below zero and have a long right tail: many short waits, a few very long ones. A normal curve would put area below zero and understate the long waits. The three fill and size measurements come from steady processes that miss their targets symmetrically.',
  },
];

export const independent = [
  {
    id: 'b04-nd-i1', type: 'formula', kind: 'numerical',
    prompt: 'B1 and B2 hold Kilnworth’s setting and standard deviation. In B5, calculate the share of bags heavier than the weight in B3.',
    sheet: { cells: { A1: 'Setting (g)', B1: K.setting, A2: 'SD (g)', B2: K.sd, A3: 'Heavier than (g)', B3: 1010, A5: 'Share heavier' }, vary: { B3: [1007, 1012] } },
    cell: 'B5', answer: '=1-NORM.DIST(B3,B1,B2,TRUE)',
    alt: ['=NORM.DIST(2*B1-B3,B1,B2,TRUE)', '=1-NORM.S.DIST((B3-B1)/B2,TRUE)', '=NORM.S.DIST((B1-B3)/B2,TRUE)'],
    view: 'A1:B5', formats: { B5: '0.0000' }, widths: { A: 18 },
    wrong: [
      { formula: '=NORM.DIST(B3,B1,B2,TRUE)', say: 'NORM.DIST with TRUE gives the area below B3, the bags lighter than it. Subtract it from 1 for the heavier ones.' },
      { formula: '=1-NORM.DIST(B3,B1,B2,FALSE)', say: 'FALSE returns the curve’s height, not an area, so 1 minus it means nothing. Use TRUE.' },
    ],
    solution: `<x>=1-NORM.DIST(B3,B1,B2,TRUE)</x>: z = (1,010 − 1,004) ÷ 3 = 2, and the area above 2 is 1 − ${PHI(2).toFixed(4)} = ${(1 - PHI(2)).toFixed(4)}, about 2.3% of bags.`,
  },
  {
    id: 'b04-nd-i2', type: 'num', kind: 'numerical',
    prompt: 'Redfern’s loaves are N(812, 6) in grams. Only the heaviest 10% of loaves go to a café that pays for “large” loaves. Above what weight is a loaf among the heaviest 10%? Give grams to one decimal place.',
    answer: Math.round((LOAF.mean + INV(0.9) * LOAF.sd) * 10) / 10, check: () => I.normal.inv(0.9, LOAF.mean, LOAF.sd), unit: 'g', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round((LOAF.mean + INV(0.95) * LOAF.sd) * 10) / 10, say: 'That uses z = 1.645, the cut-off for the top 5%. The top 10% starts at the 90th percentile, z = 1.282.' },
      { value: Math.round((LOAF.mean - INV(0.9) * LOAF.sd) * 10) / 10, say: 'That is the 10th percentile, the lightest 10%. The heaviest 10% lie above the 90th percentile: 812 + 1.282 × 6.' },
      { value: Math.round((LOAF.mean + 0.9 * LOAF.sd) * 10) / 10, say: '0.9 is the area, not the z-score. Turn it into z with NORM.S.INV(0.9) = 1.282 first.' },
    ],
    solution: `The 90th percentile: z = NORM.S.INV(0.9) = ${INV(0.9).toFixed(3)}, so x = 812 + ${INV(0.9).toFixed(3)} × 6 = ${(LOAF.mean + INV(0.9) * LOAF.sd).toFixed(1)} g, or <x>=NORM.INV(0.9,812,6)</x>.`,
  },
  {
    id: 'b04-nd-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Kilnworth’s bags are N(1,004, 3). Match each question to the Excel formula that answers it.',
    items: ['The share of bags lighter than 1,000 g', 'The share of bags heavier than 1,010 g', 'The share of bags between 1,000 and 1,008 g', 'The weight that only 5% of bags exceed', 'How many standard deviations 1,000 g lies from the setting', 'The height of the density curve at 1,000 g'],
    categories: ['=NORM.DIST(1000,1004,3,TRUE)', '=1-NORM.DIST(1010,1004,3,TRUE)', '=NORM.DIST(1008,1004,3,TRUE)-NORM.DIST(1000,1004,3,TRUE)', '=NORM.INV(0.95,1004,3)', '=STANDARDIZE(1000,1004,3)', '=NORM.DIST(1000,1004,3,FALSE)'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      1: 'NORM.DIST with TRUE gives the area below; the area above is 1 minus it.',
      3: 'NORM.INV takes the area below the cut-off. Only 5% above means 95% below.',
      5: 'FALSE returns the curve’s height, which is not a probability.',
    },
    solution: 'Below: NORM.DIST(…, TRUE). Above: 1 − NORM.DIST(…, TRUE). Between: the difference of two NORM.DIST values, the larger x first. A cut-off with 5% above: NORM.INV(0.95, …). A z-score: STANDARDIZE. The height of the curve: NORM.DIST(…, FALSE).',
  },
  {
    id: 'b04-nd-i4', type: 'multi', kind: 'applied',
    prompt: 'Before quoting a normal probability, Ana checks her 40 bags. Select all the findings that support using a normal model for the bags’ weights.',
    options: [
      `${within(1)} of the 40 bags lie within one standard deviation of the mean, and ${within(2)} within two.`,
      'The mean (1,002.75 g) and the median (1,002.55 g) are only 0.2 g apart.',
      'SKEW returns −0.23 and KURT returns −0.34.',
      'Five of the 40 bags weigh less than the 1,000 g printed on the label of every bag.',
      'The bags’ mean, 1,002.75 g, is 1.25 g below the 1,004 g setting in Kilnworth’s specification.',
      'On a normal probability plot the 40 points lie close to a straight line.',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'How many bags are short says something about where the weights sit, not about their shape. It is what the model is for, not a check of it.',
      4: 'The mean’s level is a question for a test (Module 3). A normal model can have any mean; the check is about shape.',
    },
    solution: 'Shape checks: the empirical-rule counts (72.5% and 95% against 68% and 95%), a mean close to the median, SKEW and KURT near 0, and a straight normal probability plot. The number of short bags and the mean’s distance from the setting are about the level of the weights, not their shape.',
  },
  {
    id: 'b04-nd-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about a continuous variable X.',
    text: 'For a continuous variable, a probability is an [[0]] under the density curve. So P(X = 1,000) is [[1]], and P(X < 1,000) is [[2]] P(X ≤ 1,000). For any normal distribution, exactly 95% of values lie within [[3]] standard deviations of the mean.',
    blanks: [
      { options: ['area', 'height', 'slope'], answer: 0 },
      { options: ['0', 'the height of the curve at 1,000', '0.5'], answer: 0 },
      { options: ['equal to', 'smaller than', 'larger than'], answer: 0 },
      { options: ['1.96', '2', '1.645', '2.576'], answer: 0 },
    ],
    solution: 'Probabilities are areas. A single value has no width, so its probability is 0, and including or excluding the end point doesn’t change an area: P(X < 1,000) = P(X ≤ 1,000). Exactly 95% lies within 1.96 standard deviations; “two” is the empirical rule’s rounding (95.45%).',
  },
  {
    id: 'b04-nd-i6', type: 'num', kind: 'applied',
    prompt: 'Westcliff Gym (fictional) invites 200 members to an open day; from past events each comes with probability 0.3, independently. The room holds 69. Use the normal approximation with a continuity correction to estimate the percentage chance that 70 or more come. Give one decimal place.',
    answer: Math.round(I.normal.sf(GYM.k - 0.5, gymMu, gymSd) * 1000) / 10, check: () => I.normal.sf(GYM.k - 0.5, gymMu, gymSd) * 100, unit: '%', places: 1, tol: 0.2,
    wrong: [
      { value: Math.round(I.normal.sf(GYM.k, gymMu, gymSd) * 1000) / 10, say: 'That leaves out the continuity correction. “70 or more” starts at 69.5 on the continuous scale: P(Y > 69.5).' },
      { value: Math.round(I.normal.sf(GYM.k + 0.5, gymMu, gymSd) * 1000) / 10, say: 'The correction goes the other way: 70 or more includes 70, whose interval starts at 69.5. Use P(Y > 69.5).' },
      { value: Math.round(I.normal.cdf(GYM.k - 0.5, gymMu, gymSd) * 1000) / 10, say: 'That is the chance that 69 or fewer come. The question asks for 70 or more: the area above 69.5.' },
    ],
    solution: `μ = np = 200 × 0.3 = 60 and σ = √(200 × 0.3 × 0.7) = √42 = ${gymSd.toFixed(3)}; np = 60 and n(1 − p) = 140 are both large. P(X ≥ 70) ≈ P(Y > 69.5): z = (69.5 − 60) ÷ ${gymSd.toFixed(3)} = ${((69.5 - gymMu) / gymSd).toFixed(3)}, area above ≈ ${(I.normal.sf(69.5, gymMu, gymSd) * 100).toFixed(1)}%. The exact binomial, <x>=1-BINOM.DIST(69,200,0.3,TRUE)</x>, gives ${(I.binomSf(69, GYM.n, GYM.p) * 100).toFixed(1)}%.`,
  },
];

export const check = [
  {
    id: 'b04-nd-k1', type: 'mc', kind: 'conceptual',
    prompt: `<x>=NORM.DIST(1004,1004,3,FALSE)</x> returns ${I.normal.pdf(1004, 1004, 3).toFixed(3)}. What is that number?`,
    options: [
      'The curve’s height at 1,004 g: roughly 13% of bags lie within half a gram of 1,004 g.',
      'The probability that a bag weighs exactly 1,004 g, which is about 13% of all bags.',
      'The share of bags that weigh 1,004 g or less, which the curve shows as 13.3% of all bags.',
      'The z-score of a 1,004 g bag, telling you how many standard deviations it lies from the machine’s setting.',
    ],
    answer: 0,
    feedback: {
      1: 'One exact weight has probability 0 for a continuous variable. FALSE gives the curve’s height, a probability per gram.',
      2: 'The share at or below the mean of a normal distribution is exactly 0.5; that needs cumulative set to TRUE.',
      3: 'The z-score of the mean is 0, and STANDARDIZE calculates z-scores. NORM.DIST with FALSE gives the density.',
    },
    solution: 'With cumulative FALSE, NORM.DIST returns the density: 0.133 per gram at 1,004 g. Over a narrow window, height × width approximates the probability: 0.133 × 1 g ≈ 13% of bags within ±0.5 g of 1,004 g. It is not the probability of exactly 1,004 g, which is 0.',
  },
  {
    id: 'b04-nd-k2', type: 'formula', kind: 'numerical',
    prompt: 'Sedgefield Dairy (fictional) fills 1-litre bottles; the volume is roughly normal with the mean and standard deviation in B1 and B2. In B6, calculate the share of bottles that hold between the volumes in B3 and B4.',
    sheet: { cells: { A1: 'Mean (ml)', B1: MILK.mean, A2: 'SD (ml)', B2: MILK.sd, A3: 'From (ml)', B3: MILK.lo, A4: 'To (ml)', B4: MILK.hi, A6: 'Share between' }, vary: { B3: [1001, 1003] } },
    cell: 'B6', answer: '=NORM.DIST(B4,B1,B2,TRUE)-NORM.DIST(B3,B1,B2,TRUE)',
    alt: ['=NORM.S.DIST((B4-B1)/B2,TRUE)-NORM.S.DIST((B3-B1)/B2,TRUE)', '=(1-NORM.DIST(B3,B1,B2,TRUE))-(1-NORM.DIST(B4,B1,B2,TRUE))'],
    view: 'A1:B6', formats: { B6: '0.0000' }, widths: { A: 14 },
    wrong: [
      { formula: '=NORM.DIST(B3,B1,B2,TRUE)-NORM.DIST(B4,B1,B2,TRUE)', say: 'The areas are subtracted the wrong way round, which gives a negative answer. Take the area below the upper volume (B4) minus the area below the lower one (B3).' },
      { formula: '=NORM.DIST(B4,B1,B2,TRUE)', say: 'That is the share below the upper volume, which includes the bottles below B3. Subtract the area below B3.' },
      { formula: '=NORM.DIST(B4,B1,B2,FALSE)-NORM.DIST(B3,B1,B2,FALSE)', say: 'FALSE gives the curve’s heights, and a difference of heights is not an area. Use TRUE.' },
    ],
    solution: `<x>=NORM.DIST(B4,B1,B2,TRUE)-NORM.DIST(B3,B1,B2,TRUE)</x>: the z-scores are −1.6 and +1.6, and the area between is ${(I.normal.cdf(MILK.hi, MILK.mean, MILK.sd) - I.normal.cdf(MILK.lo, MILK.mean, MILK.sd)).toFixed(4)}, about ${pc(I.normal.cdf(MILK.hi, MILK.mean, MILK.sd) - I.normal.cdf(MILK.lo, MILK.mean, MILK.sd))} of bottles.`,
  },
  {
    id: 'b04-nd-k3', type: 'num', kind: 'numerical',
    prompt: 'Sedgefield’s bottles are N(1,006, 2.5) in millilitres. What percentage hold less than the 1,000 ml on the label? Give two decimal places.',
    answer: Math.round(I.normal.cdf(MILK.label, MILK.mean, MILK.sd) * 10000) / 100, check: () => I.normal.cdf(MILK.label, MILK.mean, MILK.sd) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round((1 - I.normal.cdf(MILK.label, MILK.mean, MILK.sd)) * 10000) / 100, say: 'That is the share holding more than 1,000 ml. The area below the label is NORM.DIST(1000,1006,2.5,TRUE).' },
      { value: 2.4, say: '2.4 is the distance in standard deviations, (1,006 − 1,000) ÷ 2.5. Turn z = −2.4 into an area with NORM.S.DIST.' },
    ],
    solution: `z = (1,000 − 1,006) ÷ 2.5 = −2.4, and the area below it is ${I.normal.cdf(MILK.label, MILK.mean, MILK.sd).toFixed(4)}: about ${(I.normal.cdf(MILK.label, MILK.mean, MILK.sd) * 100).toFixed(2)}% of bottles, or 8 in 1,000. <x>=NORM.DIST(1000,1006,2.5,TRUE)</x>.`,
  },
  {
    id: 'b04-nd-k4', type: 'mc', kind: 'applied',
    prompt: 'A colleague fits a normal curve to Lantern’s 231 spring order values (mean $39.38, standard deviation $100.90) and finds that <x>=NORM.DIST(0,39.38,100.9,TRUE)</x> returns 0.348. What should Ana conclude?',
    options: [
      'A normal curve doesn’t fit these skewed values; describe them with the data’s percentiles.',
      'About a third of spring orders were refunds or negative, so the shop should review its returns.',
      'The model is fine but should use the population standard deviation, STDEV.P, of the 231 orders.',
      'The model fits once the $1,512 office order is set aside, so she can then use it for every order.',
    ],
    answer: 0,
    feedback: {
      1: 'Every order is at least $12.60. The 34.8% is an artefact of forcing a symmetric curve onto right-skewed data.',
      2: 'STDEV.P gives $100.68, almost the same; the problem is the shape, not the divisor.',
      3: `Without it the mean is $32.97 and the standard deviation $26.73, and the normal curve still puts ${pc(I.normal.cdf(0, 32.97, 26.73))} of orders below $0: the ordinary orders are skewed too.`,
    },
    solution: 'No order is below $12.60, so a model that puts 35% of orders below $0 doesn’t describe them. Order values are bounded at zero with a long right tail; use percentiles (PERCENTILE.INC) to describe them, or transform them before modelling.',
  },
  {
    id: 'b04-nd-k5', type: 'formula', kind: 'applied',
    prompt: 'Tamarind Kitchen (fictional) uses a roughly normal amount of rice each week, with the mean and standard deviation in B1 and B2 (kg). It wants enough rice at the start of each week to cover the week’s use with the probability in B3. In B5, calculate how many kilograms it should hold.',
    sheet: { cells: { A1: 'Mean weekly use (kg)', B1: RICE.mean, A2: 'SD (kg)', B2: RICE.sd, A3: 'Service level', B3: RICE.level, A5: 'Stock to hold (kg)' }, vary: { B3: [0.9, 0.95] } },
    cell: 'B5', answer: '=NORM.INV(B3,B1,B2)',
    alt: ['=B1+NORM.S.INV(B3)*B2', '=B1-NORM.S.INV(1-B3)*B2'],
    view: 'A1:B5', formats: { B3: '0%', B5: '0.0' }, widths: { A: 20 },
    wrong: [
      { formula: '=NORM.INV(1-B3,B1,B2)', say: 'That is the amount with only 2% of weeks below it, far too little. The stock must cover 98% of weeks: the value with 98% below it, NORM.INV(B3, …).' },
      { formula: '=B1+B3*B2', say: 'The service level is a probability, not a number of standard deviations. Turn it into z with NORM.S.INV(B3) first.' },
      { formula: '=NORM.S.INV(B3)', say: 'That is the z-score (2.054), not kilograms. Convert it: mean + z × SD, or NORM.INV(B3, B1, B2).' },
    ],
    solution: `<x>=NORM.INV(B3,B1,B2)</x> = 120 + ${INV(0.98).toFixed(3)} × 18 = ${I.normal.inv(RICE.level, RICE.mean, RICE.sd).toFixed(1)} kg: the 98th percentile of weekly use. The ${(I.normal.inv(RICE.level, RICE.mean, RICE.sd) - RICE.mean).toFixed(0)} kg above the average is safety stock.`,
  },
  {
    id: 'b04-nd-k6', type: 'num', kind: 'numerical',
    prompt: 'Kilnworth keeps its 1,004 g setting but could make the machine steadier. What standard deviation would leave exactly 2.5% of bags under 1,000 g? Give grams to two decimal places.',
    answer: Math.round(((K.setting - K.label) / INV(0.975)) * 100) / 100, check: () => (K.setting - K.label) / INV(0.975), unit: 'g', places: 2, tol: 0.01,
    wrong: [
      { value: 2, say: 'z = −2 leaves 2.28% below, not 2.5%. The z with 2.5% below it is NORM.S.INV(0.025) = −1.96: σ = 4 ÷ 1.96.' },
      { value: Math.round(((K.setting - K.label) / INV(0.99)) * 100) / 100, say: 'That uses z = 2.326, which leaves 1% below. For 2.5% use 1.96.' },
      { value: Math.round(((K.setting - K.label) / INV(0.95)) * 100) / 100, say: 'z = 1.645 leaves 5% in one tail. For 2.5% in the lower tail use 1.96.' },
    ],
    solution: `The label must be 1.96 standard deviations below 1,004 g: (1,000 − 1,004) ÷ σ = −1.96, so σ = 4 ÷ 1.96 = ${((K.setting - K.label) / INV(0.975)).toFixed(2)} g.`,
  },
];
