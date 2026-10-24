// anova.ex.js — B04 · One-way analysis of variance: widgets, practice and the knowledge check (answer keys live here).
// Lantern's invoice per guest-day by event type comes from case.js (PER_GUEST_BY_TYPE, DERIVED.eventTypes.anova); every
// other business is fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { PER_GUEST_BY_TYPE, EVENT_TYPES, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';

const AN = D.eventTypes.anova;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

// ---------------------------------------------------------------- sheets
// Gullwing Bikes (fictional): five hire lengths (minutes) at each of three docking stations
const BIKE = [[22, 25, 28, 24, 26], [30, 27, 33, 31, 29], [26, 24, 29, 23, 28]];
const bikeSheet = {
  cells: {
    A1: 'Hire', B1: 'Harbour', C1: 'Market', D1: 'Station Square', ...col('A', 2, [1, 2, 3, 4, 5]),
    ...col('B', 2, BIKE[0]), ...col('C', 2, BIKE[1]), ...col('D', 2, BIKE[2]),
    A7: 'Mean', B7: '=AVERAGE(B2:B6)', C7: '=AVERAGE(C2:C6)', D7: '=AVERAGE(D2:D6)',
    A8: 'SD', B8: '=STDEV.S(B2:B6)', C8: '=STDEV.S(C2:C6)', D8: '=STDEV.S(D2:D6)',
    A10: 'Source', B10: 'SS', C10: 'df', D10: 'MS', E10: 'F', F10: 'P-value', G10: 'F crit',
    A11: 'Between Groups', B11: '=B13-B12', C11: '=COLUMNS(B2:D6)-1', D11: '=B11/C11', E11: '=D11/D12', F11: '=F.DIST.RT(E11,C11,C12)', G11: '=F.INV.RT(0.05,C11,C12)',
    A12: 'Within Groups', B12: '=DEVSQ(B2:B6)+DEVSQ(C2:C6)+DEVSQ(D2:D6)', C12: '=COUNT(B2:D6)-COLUMNS(B2:D6)', D12: '=B12/C12',
    A13: 'Total', B13: '=DEVSQ(B2:D6)', C13: '=COUNT(B2:D6)-1',
    A15: 'Eta squared', B15: '=B11/B13',
  },
};
// Wheelhouse Gym (fictional): minutes per visit for five members on each of three plans
const GYM = [[42, 50, 38, 46, 44], [52, 48, 55, 51, 49], [47, 53, 45, 50, 50]];
const GYMR = I.anova1(GYM);
const gymBase = {
  A1: 'Member', B1: 'Basic', C1: 'Plus', D1: 'Premium', ...col('A', 2, ['M1', 'M2', 'M3', 'M4', 'M5']),
  ...col('B', 2, GYM[0]), ...col('C', 2, GYM[1]), ...col('D', 2, GYM[2]),
  F2: 'SS total', F3: 'SS within', F4: 'SS between', G4: '=G2-G3', F5: 'df between', G5: '=COLUMNS(B2:D6)-1', F6: 'df within', G6: '=COUNT(B2:D6)-COLUMNS(B2:D6)',
  F7: 'F', F8: 'p-value',
};
const gymFormats = { G2: '0.00', G3: '0.00', G4: '0.00', G7: '0.000', G8: '0.0000' };
const critSheet = { cells: { A1: 'Significance level', B1: 0.05, A2: 'Groups (k)', B2: 5, A3: 'Observations in all (N)', B3: 76, A4: 'Critical F' }, vary: { B1: [0.01, 0.1], B2: [3, 4], B3: [40, 60] } };
// a parcel depot (fictional): minutes to load a van, by shift (summary statistics only)
const DEPOT = { shift: ['Early', 'Late', 'Night', 'Weekend'], n: [12, 15, 10, 13], m: [31.5, 29.8, 34.1, 30.6], s: [4.2, 3.8, 5.1, 4.4] };
const depotSheet = {
  cells: {
    A1: 'Shift', B1: 'Vans (n)', C1: 'Mean (minutes)', D1: 'SD (minutes)', F1: 'SS within',
    ...col('A', 2, DEPOT.shift), ...col('B', 2, DEPOT.n), ...col('C', 2, DEPOT.m), ...col('D', 2, DEPOT.s),
  },
};
const DEPOT_SSW = DEPOT.n.reduce((a, n, i) => a + (n - 1) * DEPOT.s[i] ** 2, 0);
// Lantern's event types as a ragged grid (a column per type, as Anova: Single Factor wants them)
const eventCells = {};
EVENT_TYPES.forEach((t, j) => { eventCells[`${LETTERS[j]}1`] = t; PER_GUEST_BY_TYPE[t].forEach((v, i) => { eventCells[`${LETTERS[j]}${i + 2}`] = v; }); });
const lastRow = 1 + Math.max(...AN.counts);
const eventSheet = {
  cells: {
    ...eventCells,
    G1: 'F', H1: `=((DEVSQ(A2:E${lastRow})-H4)/(H5-1))/(H4/(H3-H5))`, G2: 'p-value',
    G3: 'Events', H3: `=COUNT(A2:E${lastRow})`,
    G4: 'SS within', H4: LETTERS.map((L) => `DEVSQ(${L}2:${L}${lastRow})`).join('+').replace(/^/, '='),
    G5: 'Event types', H5: '=COUNTA(A1:E1)',
  },
};

export const widgets = {
  'an-sheet': {
    type: 'sheet', title: 'Gullwing Bikes: a one-way ANOVA table built from DEVSQ',
    sheet: bikeSheet, view: 'A1:G15', editable: 'B2:D6',
    formats: { B7: '0.00', C7: '0.00', D7: '0.00', B8: '0.00', C8: '0.00', D8: '0.00', B11: '0.00', B12: '0.00', B13: '0.00', D11: '0.000', D12: '0.000', E11: '0.000', F11: '0.0000', G11: '0.000', B15: '0.000' },
    widths: { A: 15, D: 14 },
    tools: ['formulas', 'reset'],
    note: 'B13 is <x>=DEVSQ(B2:D6)</x>, the total sum of squares; B12 adds each station’s DEVSQ; B11 is the difference. The df, MS, F, P-value and F crit follow the ToolPak’s layout. Turn on Show formulas to see each step.',
  },
  'an-toolpak': {
    type: 'toolpak', title: 'Anova: Single Factor — invoice per guest-day by event type, Lantern’s 76 events of 2026',
    tool: 'anova', groups: EVENT_TYPES.map((t) => ({ name: t, values: PER_GUEST_BY_TYPE[t] })), alpha: 0.05,
    note: 'Input Range: five columns, one per event type, with the type names in the first row; Grouped By: Columns, with Labels in first row ticked. SS for Between Groups divided by SS for Total is η² ≈ 0.134. The SUMMARY’s Variance column shows why the equal-variance condition fails: launches about 0.46, meetings about 4.63.',
  },
  'an-fcurve': {
    type: 'curve', title: 'Lantern’s F on the F distribution with 4 and 71 degrees of freedom',
    dist: 'f', params: { df1: 4, df2: 71 }, vary: ['df1', 'df2'], asks: ['above', 'inverse'],
    a: Math.round(AN.F * 1000) / 1000, prob: 0.95, places: 3, xLabel: 'F',
    critical: { alpha: 0.05, tails: 'upper' }, stat: { value: AN.F, label: 'F' },
    note: 'P(F &gt; a) is the ANOVA p-value, <x>=F.DIST.RT(a,4,71)</x>. The 5% critical value is about 2.50, and Lantern’s F of 2.75 lies just inside the rejection region. With 4 and 10 degrees of freedom, as for five groups of three, the critical value rises to about 3.48: small samples need a larger F.',
  },
  'an-fwer': {
    type: 'formula', title: 'The family-wise error rate of testing every pair',
    intro: 'Choose the number of groups and the level of each test.',
    inputs: [
      { id: 'k', label: 'Number of groups', min: 2, max: 10, step: 1, value: 5, fmt: 'int' },
      { id: 'a', label: 'Significance level of each test', min: 1, max: 10, step: 1, value: 5, fmt: 'pct' },
    ],
    compute: (v) => {
      const m = (v.k * (v.k - 1)) / 2, a = v.a / 100, fw = 1 - (1 - a) ** m;
      const xs = Array.from({ length: 45 }, (_, i) => i + 1);
      return {
        headline: { label: 'Chance of at least one false alarm across all pairs (independent tests)', value: `${(fw * 100).toFixed(1)}%` },
        rows: [['Pairs, one test each', String(m)], ['Bonferroni upper bound, m × α', `${Math.min(100, m * v.a).toFixed(1)}%`], ['Bonferroni level for each test, α ÷ m', (a / m).toFixed(4)]],
        note: m === 1 ? 'With two groups there is one comparison, so its level is the family-wise rate: no adjustment is needed.' : `Testing all ${m} pairs at ${v.a}% each gives about a ${(fw * 100).toFixed(0)}% chance of at least one false alarm if no group really differs. Testing each pair at ${(a / m).toFixed(4)} instead keeps that chance at or below ${v.a}%.`,
        chart: { kind: 'line', x: { label: 'Number of tests', values: xs }, series: [{ name: 'Chance of at least one false alarm (%)', values: xs.map((t) => Math.round((1 - (1 - a) ** t) * 1000) / 10) }], y: { label: 'Per cent' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b04-an-g1', type: 'steps', kind: 'numerical',
    prompt: 'Wheelhouse Gym (fictional) timed one visit by each of five members on its Basic, Plus and Premium plans (minutes, in B2:D6). Build a one-way ANOVA in the worksheet to test whether mean visit length differs by plan.',
    solution: `SST = DEVSQ of all 15 visits = ${GYMR.sst}; SSW = 80 + 30 + 38 = ${GYMR.ssw}; SSB = ${GYMR.ssb}. df 2 and 12, so F = (${GYMR.ssb} ÷ 2) ÷ (${GYMR.ssw} ÷ 12) ≈ ${GYMR.F.toFixed(2)} and p = F.DIST.RT(F, 2, 12) ≈ ${GYMR.p.toFixed(3)}. At the 5% level mean visit length differs by plan (means 44, 51 and 49 minutes); a follow-up would show which plans differ, and five members per plan is a very small sample.`,
    steps: [
      {
        id: 'b04-an-g1-s1', type: 'formula',
        prompt: 'In G2, calculate the total sum of squares: every visit’s squared distance from the mean of all 15.',
        sheet: { cells: { ...gymBase } }, cell: 'G2', answer: '=DEVSQ(B2:D6)',
        alt: ['=VAR.S(B2:D6)*(COUNT(B2:D6)-1)', '=SUMSQ(B2:D6)-COUNT(B2:D6)*AVERAGE(B2:D6)^2'],
        view: 'A1:G8', formats: gymFormats, widths: { F: 12 },
        wrong: [
          { formula: '=VAR.S(B2:D6)', say: 'That is the variance, the sum of squares divided by n − 1. The total sum of squares is the sum itself: DEVSQ.' },
          { formula: '=DEVSQ(B2:B6)', say: 'That covers the Basic plan only. The total uses all 15 visits, B2:D6, around their overall mean.' },
          { formula: '=SUMSQ(B2:D6)', say: 'SUMSQ squares the values themselves, measured from 0. A sum of squares in ANOVA measures distances from the mean: DEVSQ.' },
        ],
        hints: ['DEVSQ(range) returns the sum of squared deviations from the range’s own mean.', 'Give it all three columns at once: B2:D6.'],
      },
      {
        id: 'b04-an-g1-s2', type: 'formula',
        prompt: 'In G3, calculate the sum of squares within groups: each visit’s squared distance from its own plan’s mean, added over the three plans.',
        sheet: { cells: { ...gymBase, G2: '=DEVSQ(B2:D6)' } }, cell: 'G3', answer: '=DEVSQ(B2:B6)+DEVSQ(C2:C6)+DEVSQ(D2:D6)',
        alt: ['=4*(VAR.S(B2:B6)+VAR.S(C2:C6)+VAR.S(D2:D6))', '=SUM(DEVSQ(B2:B6),DEVSQ(C2:C6),DEVSQ(D2:D6))'],
        view: 'A1:G8', formats: gymFormats, widths: { F: 12 },
        wrong: [
          { formula: '=DEVSQ(B2:D6)', say: 'That measures every visit from the overall mean, the total. Within groups, each column is measured from its own mean: one DEVSQ per plan, added.' },
          { formula: '=VAR.S(B2:B6)+VAR.S(C2:C6)+VAR.S(D2:D6)', say: 'Those are the three variances. Each sum of squares is (n − 1) times its variance: use DEVSQ for each plan.' },
          { formula: '=DEVSQ(B2:B6)*3', say: 'That assumes every plan has the Basic plan’s spread. Add the three plans’ own DEVSQ values.' },
        ],
        hints: ['Within groups means around each group’s own mean, so take DEVSQ of each column separately.', '<x>=DEVSQ(B2:B6)+DEVSQ(C2:C6)+DEVSQ(D2:D6)</x>'],
      },
      {
        id: 'b04-an-g1-s3', type: 'formula',
        prompt: 'G4 now holds SS between (G2 − G3), and G5 and G6 the degrees of freedom. In G7, calculate F.',
        sheet: { cells: { ...gymBase, G2: '=DEVSQ(B2:D6)', G3: '=DEVSQ(B2:B6)+DEVSQ(C2:C6)+DEVSQ(D2:D6)' } }, cell: 'G7', answer: '=(G4/G5)/(G3/G6)',
        alt: ['=G4/G5/(G3/G6)', '=(G4*G6)/(G5*G3)'],
        view: 'A1:G8', formats: gymFormats, widths: { F: 12 },
        wrong: [
          { formula: '=G4/G3', say: 'That divides the sums of squares. F divides the mean squares: each SS over its own degrees of freedom first.' },
          { formula: '=(G3/G6)/(G4/G5)', say: 'That is MS within over MS between, upside down. F = MS between ÷ MS within.' },
          { formula: '=(G4/3)/(G3/15)', say: 'Divide by the degrees of freedom, k − 1 = 2 and N − k = 12, not by the numbers of groups and visits.' },
        ],
        hints: ['MS between = SS between ÷ df between; MS within = SS within ÷ df within.', 'F = MS between ÷ MS within = (G4/G5)/(G3/G6).'],
      },
      {
        id: 'b04-an-g1-s4', type: 'formula',
        prompt: 'In G8, calculate the p-value of the F in G7.',
        sheet: { cells: { ...gymBase, G2: '=DEVSQ(B2:D6)', G3: '=DEVSQ(B2:B6)+DEVSQ(C2:C6)+DEVSQ(D2:D6)', G7: '=(G4/G5)/(G3/G6)' } }, cell: 'G8', answer: '=F.DIST.RT(G7,G5,G6)',
        alt: ['=1-F.DIST(G7,G5,G6,TRUE)', '=F.DIST.RT(G7,2,12)'],
        view: 'A1:G8', formats: gymFormats, widths: { F: 12 },
        wrong: [
          { formula: '=F.DIST(G7,G5,G6,TRUE)', say: 'That is the left-tail probability, P(F < f). Only large values of F count against H₀, so the p-value is the right tail: F.DIST.RT.' },
          { formula: '=F.DIST.RT(G7,G6,G5)', say: 'The degrees of freedom are the wrong way round. The numerator (between groups, G5) comes first.' },
          { formula: '=F.DIST(G7,G5,G6,FALSE)', say: 'With FALSE, F.DIST returns the height of the density curve, not a probability.' },
        ],
        hints: ['The p-value is the area to the right of F under the F distribution with (k − 1, N − k) df.', '<x>=F.DIST.RT(G7,G5,G6)</x>'],
      },
    ],
  },
  {
    id: 'b04-an-g2', type: 'num', kind: 'numerical',
    prompt: 'A retailer (fictional) compares weekly sales across six store formats by running a t test at α = 0.05 on every pair of formats. If no format really differs and the tests were independent, what is the chance of at least one false alarm? Give a percentage to one decimal place.',
    answer: Math.round((1 - 0.95 ** 15) * 1000) / 10, check: () => (1 - 0.95 ** ((6 * 5) / 2)) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 75, say: 'That is 15 × 5%, the Bonferroni upper bound. The chance of at least one false alarm is 1 − 0.95¹⁵, a little less.' },
      { value: Math.round((1 - 0.95 ** 6) * 1000) / 10, say: 'That counts six tests, one per format. Six formats make 6 × 5 ÷ 2 = 15 pairs.' },
      { value: 5, say: 'Each test alone has a 5% chance, but there are 15 of them, and any one false alarm counts.' },
    ],
    hints: ['First count the pairs: k(k − 1) ÷ 2 with k = 6.', 'P(at least one false alarm) = 1 − P(none) = 1 − 0.95ᵐ.'],
    solution: `Six formats make 6 × 5 ÷ 2 = 15 pairs. If the tests were independent, P(no false alarm) = 0.95¹⁵ ≈ ${(0.95 ** 15).toFixed(3)}, so P(at least one) ≈ ${((1 - 0.95 ** 15) * 100).toFixed(1)}%. That is why an ANOVA, then adjusted comparisons, come before any pairwise conclusions.`,
  },
  {
    id: 'b04-an-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A supermarket chain (fictional) tests four store layouts and its one-way ANOVA gives F = 4.2 with p = 0.01. What does that result tell the chain?',
    options: [
      'At least one layout’s mean sales differ from another layout’s.',
      'All four layouts have different mean sales from one another.',
      'The layout with the highest sample mean is significantly better than each of the other three layouts.',
      'There is a 1% probability that the four layouts really have the same mean sales.',
    ],
    answer: 0,
    hints: ['What is the alternative hypothesis of a one-way ANOVA?', 'H₁ says “at least one mean differs”, which is satisfied by a single layout out of line.'],
    feedback: {
      1: 'A significant F is consistent with one layout differing and the other three equal. It doesn’t say all of them differ.',
      2: 'The F test doesn’t compare pairs. Which layouts differ needs Tukey’s HSD or Bonferroni-adjusted comparisons.',
      3: 'A p-value is computed assuming H₀ is true; it isn’t the probability that H₀ is true.',
    },
    solution: 'One-way ANOVA tests H₀: all four means equal against H₁: at least one differs. p = 0.01 is evidence against H₀, so not all layouts have the same mean sales. Which ones differ is a separate question for adjusted pairwise comparisons.',
  },
  {
    id: 'b04-an-g4', type: 'num', kind: 'numerical',
    prompt: 'An ANOVA on four groups with 40 observations in all gives SS between = 48.6 and SS within = 162. What is F? Give two decimal places.',
    answer: 3.6, check: () => (48.6 / (4 - 1)) / (162 / (40 - 4)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 0.3, say: 'That is SS between ÷ SS within. Divide each sum of squares by its degrees of freedom first: 3 and 36.' },
      { value: 3, say: 'You divided by k and N (4 and 40). The degrees of freedom are k − 1 = 3 and N − k = 36.' },
      { value: Math.round(((162 / 36) / (48.6 / 3)) * 100) / 100, say: 'That is MS within ÷ MS between, upside down. F = MS between ÷ MS within.' },
    ],
    hints: ['MS between = 48.6 ÷ (4 − 1); MS within = 162 ÷ (40 − 4).', 'F = 16.2 ÷ 4.5.'],
    solution: 'MS between = 48.6 ÷ 3 = 16.2; MS within = 162 ÷ 36 = 4.5; F = 16.2 ÷ 4.5 = 3.60. <x>=F.DIST.RT(3.6,3,36)</x> ≈ 0.023.',
  },
];

export const independent = [
  {
    id: 'b04-an-i1', type: 'formula', kind: 'numerical',
    prompt: 'In B4, return the critical value of F for a one-way ANOVA at the significance level in B1, with the number of groups in B2 and the total number of observations in B3.',
    sheet: critSheet, cell: 'B4', answer: '=F.INV.RT(B1,B2-1,B3-B2)',
    alt: ['=F.INV(1-B1,B2-1,B3-B2)'],
    view: 'A1:B4', formats: { B4: '0.000' }, widths: { A: 24 },
    wrong: [
      { formula: '=F.INV(B1,B2-1,B3-B2)', say: 'F.INV gives the value with probability B1 below it, in the left tail. The critical value cuts off B1 in the right tail: F.INV.RT.' },
      { formula: '=F.INV.RT(0.05,B2-1,B3-B2)', say: 'Point at the significance level in B1 rather than typing 0.05, so the formula works for any level.' },
      { formula: '=F.INV.RT(B1,B3-B2,B2-1)', say: 'The degrees of freedom are swapped. The numerator df, between groups (k − 1), comes first.' },
      { formula: '=F.INV.RT(B1,B2,B3)', say: 'Those are the numbers of groups and observations. The degrees of freedom are k − 1 and N − k.' },
      { formula: '=F.INV.RT(B1,B2-1,B3-1)', say: 'N − 1 is the total df. The denominator df is within groups: N − k.' },
    ],
    solution: '<x>=F.INV.RT(B1,B2-1,B3-B2)</x>: for α = 0.05, 5 groups and 76 observations, F.INV.RT(0.05, 4, 71) ≈ 2.501, the F crit of Lantern’s ANOVA. An F above it is significant at that level.',
  },
  {
    id: 'b04-an-i2', type: 'formula', kind: 'applied',
    prompt: 'A parcel depot (fictional) has only a summary of loading times by shift: vans timed (B), mean minutes (C) and standard deviation (D). In F2, calculate the sum of squares within groups in one formula.',
    sheet: depotSheet, cell: 'F2', answer: '=SUMPRODUCT(B2:B5-1,D2:D5^2)',
    alt: ['=SUMPRODUCT((B2:B5-1)*D2:D5^2)', '=SUMPRODUCT(B2:B5-1,D2:D5,D2:D5)'],
    view: 'A1:F5', formats: { F2: '0.00' }, widths: { C: 15, D: 13, F: 11 },
    wrong: [
      { formula: '=SUMPRODUCT(B2:B5,D2:D5^2)', say: 'Each group’s sum of squares is (n − 1) × s², because s² divides by n − 1. Use B2:B5-1.' },
      { formula: '=SUMPRODUCT(B2:B5-1,D2:D5)', say: 'Column D holds standard deviations. Square them to get variances: D2:D5^2.' },
      { formula: '=SUM(D2:D5^2)', say: 'That adds the variances without weighting them by group size. SS within = Σ(nᵢ − 1)sᵢ².' },
    ],
    solution: `SS within = Σ(nᵢ − 1)sᵢ² = 11 × 4.2² + 14 × 3.8² + 9 × 5.1² + 12 × 4.4² ≈ ${DEPOT_SSW.toFixed(2)}, which <x>=SUMPRODUCT(B2:B5-1,D2:D5^2)</x> gives in one step. With SS between from the means (Σ nᵢ(x̄ᵢ − x̄)²), the depot can complete the ANOVA table without the raw times, which the ToolPak would need.`,
  },
  {
    id: 'b04-an-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Match each entry in the ANOVA table of Excel’s Anova: Single Factor output to how it is calculated (k groups, N observations).',
    items: ['SS for Between Groups', 'df for Within Groups', 'MS for Within Groups', 'F', 'P-value', 'F crit'],
    categories: ['Σ nᵢ(x̄ᵢ − x̄)²', 'N − k', 'SS within ÷ (N − k)', 'MS between ÷ MS within', 'F.DIST.RT(F, k − 1, N − k)', 'F.INV.RT(Alpha, k − 1, N − k)'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      2: 'MS within is the pooled variance: SS within over its df, N − k.',
      5: 'F crit depends only on Alpha and the two df, not on the data’s F.',
    },
    solution: 'Between Groups SS weights each group mean’s squared distance from the grand mean by its size. Within Groups df is N − k, and its MS is SS ÷ df. F = MS between ÷ MS within. P-value is the right-tail area beyond F; F crit is the value with Alpha to its right.',
  },
  {
    id: 'b04-an-i4', type: 'multi', kind: 'applied',
    prompt: 'A hotel group (fictional) compares mean room-service spend per order at four hotels with a one-way ANOVA. The groups have 40, 38, 45 and 12 orders; their standard deviations are $9, $11, $10 and $24; the smallest hotel’s orders include two very large ones; guests often order several times during a stay. Select all the concerns about the ANOVA’s conditions.',
    options: [
      'The largest standard deviation ($24) is more than twice the smallest ($9).',
      'The smallest hotel’s mean and SD rest heavily on its two very large orders.',
      'Several orders from one guest may not be independent of each other.',
      'The four hotels have different numbers of orders, which one-way ANOVA can’t handle.',
      'Spend per order is a numerical response, but ANOVA needs a categorical one.',
      'ANOVA needs each hotel’s mean to be close to the grand mean before it can be run.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'One-way ANOVA handles unequal group sizes; the formulas weight each group by nᵢ.',
      4: 'ANOVA needs a numerical response and a categorical factor (the hotel), which is what this is.',
      5: 'That is what the test investigates, not a condition for running it.',
    },
    solution: 'Concerns: unequal spread (24 ÷ 9 ≈ 2.7, above the rule of thumb of about 2), outliers dominating the smallest group, and repeat orders from one guest breaking independence. The group sizes needn’t be equal, the response is numerical as it should be, and the means’ distance from the grand mean is what F measures. With these concerns, check the result with Welch’s ANOVA or Kruskal–Wallis, or analyse spend per stay.',
  },
  {
    id: 'b04-an-i5', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a one-way ANOVA analysis in order.',
    items: [
      'Plot the groups and check independence, normality and equal spread.',
      'Calculate SST, SSB and SSW and their degrees of freedom.',
      'Divide each sum of squares by its degrees of freedom to get MSB and MSW.',
      'Divide MSB by MSW to get F.',
      'Find the p-value with F.DIST.RT(F, k − 1, N − k) and compare it with α.',
      'If F is significant, compare pairs with Tukey’s HSD or Bonferroni-adjusted tests.',
    ],
    solution: 'Look at the data and the conditions first; then the sums of squares and df; the mean squares; F; its p-value; and only after a significant F, the adjusted pairwise comparisons.',
  },
  {
    id: 'b04-an-i6', type: 'num', kind: 'numerical',
    prompt: 'An ANOVA output shows SS between = 42.3 and SS within = 357.7. What is η²? Give three decimal places.',
    answer: Math.round((42.3 / (42.3 + 357.7)) * 1000) / 1000, check: () => 42.3 / (42.3 + 357.7), unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: Math.round((42.3 / 357.7) * 1000) / 1000, say: 'That divides by SS within. η² divides SS between by the total, SS between + SS within = 400.' },
      { value: Math.round((357.7 / 400) * 1000) / 1000, say: 'That is the share within groups. η² is the share between groups: 42.3 ÷ 400.' },
    ],
    solution: 'SST = 42.3 + 357.7 = 400, so η² = 42.3 ÷ 400 ≈ 0.106: about 11% of the variation lies between the groups. Whether that matters depends on the means themselves and on the business question.',
  },
];

export const check = [
  {
    id: 'b04-an-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does the F statistic of a one-way ANOVA tend to be close to 1 when the null hypothesis is true?',
    options: [
      'Both mean squares then estimate the same variance, that of single values, so their ratio is near 1.',
      'The sample group means are then exactly equal, which makes the sum of squares between the groups zero.',
      'F is a probability, and a probability of about 1 means the data fit the null hypothesis very well.',
      'The within-group variation then disappears, so both sums of squares become small and very similar.',
    ],
    answer: 0,
    feedback: {
      1: 'Sample means vary by chance even when population means are equal, and an SSB of 0 would make F = 0, not 1.',
      2: 'F is a ratio of two variance estimates, and it can be far above 1. The p-value is the probability.',
      3: 'Within-group variation doesn’t depend on H₀; it is the denominator of F whatever the means are.',
    },
    solution: 'MS within estimates σ² whatever the means are. MS between estimates σ² plus a term that grows with the spread of the population means, which is 0 under H₀. So under H₀ both estimate σ² and F is near 1; differences between the means push F up.',
  },
  {
    id: 'b04-an-k2', type: 'num', kind: 'numerical',
    prompt: 'Three groups of 6 observations have means 12, 15 and 18 and sample variances 9, 12 and 15. Calculate F for a one-way ANOVA. Give one decimal place.',
    answer: 4.5, check: () => { const ssb = 6 * ((12 - 15) ** 2 + (15 - 15) ** 2 + (18 - 15) ** 2), ssw = 5 * (9 + 12 + 15); return (ssb / 2) / (ssw / 15); }, unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: 9, say: 'That is SS between (108) ÷ MS within (12). Divide SS between by its df, 2, first.' },
      { value: 1.5, say: 'You left out the group size when computing SS between. It is Σ nᵢ(x̄ᵢ − x̄)², with nᵢ = 6.' },
      { value: Math.round(((6 * 18) / 2 / ((9 + 12 + 15) * 5 / 18)) * 10) / 10, say: 'You divided SS within by N = 18. Its df is N − k = 15.' },
    ],
    solution: 'Grand mean 15 (equal groups). SSB = 6 × (3² + 0² + 3²) = 108; MSB = 108 ÷ 2 = 54. SSW = 5 × (9 + 12 + 15) = 180; MSW = 180 ÷ 15 = 12 (with equal groups, the mean of the variances). F = 54 ÷ 12 = 4.5, and <x>=F.DIST.RT(4.5,2,15)</x> ≈ 0.029.',
  },
  {
    id: 'b04-an-k3', type: 'formula', kind: 'applied',
    prompt: `Lantern’s invoice per guest-day is in A2:E${lastRow}, one column per event type (the columns have different lengths). H1 holds F, H3 the number of events and H5 the number of types. In H2, return the ANOVA p-value, taking the degrees of freedom from H3 and H5.`,
    sheet: eventSheet, cell: 'H2', answer: '=F.DIST.RT(H1,H5-1,H3-H5)',
    alt: ['=F.DIST.RT(H1,4,71)', '=1-F.DIST(H1,H5-1,H3-H5,TRUE)'],
    view: `A1:H${lastRow}`, maxHeight: '20rem', formats: { A: '0.00', B: '0.00', C: '0.00', D: '0.00', E: '0.00', H1: '0.000', H2: '0.0000', H4: '0.00' }, widths: { G: 12, E: 10 },
    wrong: [
      { formula: '=F.DIST(H1,H5-1,H3-H5,TRUE)', say: 'That is the left tail. The ANOVA p-value is the right-tail area beyond F: F.DIST.RT.' },
      { formula: '=F.DIST.RT(H1,H3-H5,H5-1)', say: 'The degrees of freedom are swapped: between groups (k − 1 = 4) first, then within (N − k = 71).' },
      { formula: '=F.DIST.RT(H1,H5,H3)', say: 'Those are k and N. The degrees of freedom are k − 1 and N − k.' },
      { formula: '=F.DIST.RT(H1,H5-1,H3-1)', say: 'N − 1 is the total df. The denominator is the within-groups df, N − k.' },
    ],
    solution: `<x>=F.DIST.RT(H1,H5-1,H3-H5)</x> = F.DIST.RT(${AN.F.toFixed(3)}, 4, 71) ≈ ${AN.p.toFixed(4)}, the P-value of the ToolPak’s output. Below 0.05, so at the 5% level the event types don’t all share one mean; the conditions (unequal spreads, repeat clients) and the follow-up comparisons still need reporting.`,
  },
  {
    id: 'b04-an-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s ANOVA of invoice per guest-day by event type gives F = 2.75, p = 0.035 (Welch’s ANOVA p = 0.009). Bonferroni-adjusted Welch t tests find only team days against launches below 0.005. Which conclusion can Ana draw?',
    options: [
      'Not all five types share one mean; after adjustment only team days and launches clearly differ.',
      'Every one of the five event types earns a different average amount per guest-day from all the others.',
      'Booking a team day instead of a launch makes a client pay about $2.25 more per guest-day.',
      'The p-value of 0.035 means there is a 3.5% chance that all five types have the same mean.',
    ],
    answer: 0,
    feedback: {
      1: 'A significant F means at least one mean differs; the follow-ups find only one clearly different pair.',
      2: 'That is a causal claim from observational data. Team days also ran longer hours, and the events come from repeat clients.',
      3: 'A p-value is the probability of an F this large if the means were equal, not the probability that they are.',
    },
    solution: 'The F test rejects equal means at the 5% level, and Welch’s ANOVA agrees despite the unequal spreads. The Bonferroni-adjusted comparisons locate the clear difference: team days ($11.25) against launches ($9.00). Because the data are observational and type is tangled with hours, the result describes 2026’s events; it doesn’t show that changing the type would change the price.',
  },
  {
    id: 'b04-an-k5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the degrees of freedom of a one-way ANOVA with k groups and N observations in all.',
    text: 'Between groups: [[0]]. Within groups: [[1]]. Total: [[2]].',
    blanks: [
      { options: ['k − 1', 'N − k', 'N − 1', 'k'], answer: 0 },
      { options: ['k − 1', 'N − k', 'N − 1', 'N'], answer: 1 },
      { options: ['k − 1', 'N − k', 'N − 1', 'N + k'], answer: 2 },
    ],
    fixed: true,
    solution: 'Between groups k − 1 (k means tied together by the grand mean); within groups N − k (N observations around k estimated means); total N − 1. The first two add up to the third.',
  },
  {
    id: 'b04-an-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A manager compares every pair of four store formats with t tests and wants the family-wise error rate to be at most 5%. With a Bonferroni correction, at what level should each test be run?',
    options: ['0.05 ÷ 6 ≈ 0.0083', '0.05 ÷ 4 = 0.0125', '0.05, because each test is separate', '6 × 0.05 = 0.30'],
    answer: 0,
    feedback: {
      1: 'Four formats make 4 × 3 ÷ 2 = 6 pairs, not 4 comparisons. Divide α by the number of tests.',
      2: 'Testing each at 0.05 lets the family-wise error rate rise towards 1 − 0.95⁶ ≈ 26%.',
      3: 'Multiplying is the upper bound on the family-wise error rate at 0.05 each. The correction divides α by m.',
    },
    solution: 'Four formats give m = 4 × 3 ÷ 2 = 6 pairs. Bonferroni tests each at α ÷ m = 0.05 ÷ 6 ≈ 0.0083, which keeps the chance of any false alarm at or below 5%.',
  },
];
