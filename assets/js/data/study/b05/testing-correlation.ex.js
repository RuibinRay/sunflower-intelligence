// testing-correlation.ex.js — B05 · Testing a correlation: widgets, practice and the knowledge check (answer keys live
// here). Café data come from case.js (the corrected log); Quayside Books, Harrow & Finch, Tern Air, Brightline
// Pharmacy and the other organisations named are fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); num items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import * as I from '../../../core/inference.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const win = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const short = (iso) => `${Number(iso.slice(8))} ${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(iso.slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const z975 = I.normInv(0.975), z80 = I.normInv(0.8);
const tOf = (r, n) => (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
const p2 = (r, n) => 2 * (1 - I.tCdf(Math.abs(tOf(r, n)), n - 2));

// ---------------------------------------------------------------- widgets' data
const APR = win('Harbourside', '2027-04-05', '2027-04-12');
const aprSheet = {
  cells: {
    A1: 'Day', B1: 'High (°F)', C1: 'Footfall', ...col('A', 2, APR.map((r) => `${r[at('weekday')]} ${short(r[at('date')])}`)), ...col('B', 2, APR.map((r) => r[at('high_f')])), ...col('C', 2, APR.map((r) => r[at('footfall')])),
    E1: 'r', F1: '=CORREL(B2:B9,C2:C9)',
    E2: 'n (pairs)', F2: '=COUNT(B2:B9)',
    E3: 't', F3: '=F1*SQRT(F2-2)/SQRT(1-F1^2)',
    E4: 'p, two-sided', F4: '=T.DIST.2T(ABS(F3),F2-2)',
    E5: 'Critical r at 5%', F5: '=T.INV.2T(0.05,F2-2)/SQRT(F2-2+T.INV.2T(0.05,F2-2)^2)',
    E6: 'Fisher’s z = FISHER(r)', F6: '=FISHER(F1)',
    E7: 'Standard error of z', F7: '=1/SQRT(F2-3)',
    E8: 'Confidence level', F8: 0.95,
    E9: 'Interval for ρ, lower', F9: '=FISHERINV(F6-NORM.S.INV(1-(1-F8)/2)*F7)',
    E10: 'Interval for ρ, upper', F10: '=FISHERINV(F6+NORM.S.INV(1-(1-F8)/2)*F7)',
  },
};
const critLine = [5, 8, 10, 15, 20, 30, 50, 100, 200, 400, 1000];

// ---------------------------------------------------------------- guided 1: Millbrook, 1–24 October, high and hot drinks
const OCT = win('Millbrook', '2027-10-01', '2027-10-24');
const oT = OCT.map((r) => r[at('high_f')]), oH = OCT.map((r) => r[at('hot_drinks')]);
const OP = C.pearson(oT, oH);
const octCells = { A1: 'Date', B1: 'High (°F)', C1: 'Hot drinks', ...col('A', 2, OCT.map((r) => short(r[at('date')]))), ...col('B', 2, oT), ...col('C', 2, oH), E1: 'r', F1: '=CORREL(B2:B25,C2:C25)', E2: 'n', F2: '=COUNT(B2:B25)', E3: 't', E4: 'p, two-sided' };
const T_F = '=F1*SQRT(F2-2)/SQRT(1-F1^2)';
const yearHot = C.pearson(column('high_f', { cafe: 'Millbrook' }), column('hot_drinks', { cafe: 'Millbrook' }));

// ---------------------------------------------------------------- check 3: Harbourside, 1–20 August, high and footfall
const AUG = win('Harbourside', '2027-08-01', '2027-08-20');
const gT = AUG.map((r) => r[at('high_f')]), gF = AUG.map((r) => r[at('footfall')]);
const GP = C.pearson(gT, gF);
const augSheet = { cells: { A1: 'Date', B1: 'High (°F)', C1: 'Footfall', ...col('A', 2, AUG.map((r) => short(r[at('date')]))), ...col('B', 2, gT), ...col('C', 2, gF), E1: 'p-value (two-sided)' }, fixed: ['A2:A21'] };

// ---------------------------------------------------------------- small inputs
const ciSheet = { cells: { A1: 'r', B1: 0.45, A2: 'n (pairs)', B2: 50, A3: 'Confidence level', B3: 0.95, A5: 'Interval for ρ, lower', A6: 'Interval for ρ, upper' }, vary: { B1: [0.3, 0.62, -0.25], B3: [0.9, 0.99] } };
const ci45 = C.fisherCI(0.45, 50);
const cmpSheet = { cells: { A1: 'Country', B1: 'r', C1: 'Stores', A2: 'North', B2: 0.58, C2: 64, A3: 'South', B3: 0.31, C3: 81, A5: 'z', A6: 'p-value (two-sided)' }, vary: { B2: [0.5, 0.66, 0.42], B3: [0.2, 0.38, 0.45] } };
const CMP = C.compareIndependent(0.58, 64, 0.31, 81);

export const widgets = {
  'test-rain': {
    type: 'scatter',
    title: 'Rain and footfall: both cafés, 1 March – 31 December 2027',
    x: { name: 'Rain', values: column('rain_in'), unit: 'in' },
    y: { name: 'Footfall', values: column('footfall') },
    group: { name: 'Café', values: column('cafe') },
    labels: column('date').map((d, i) => `${short(d)}, ${column('cafe')[i]}`),
    show: ['pearson', 'ci', 'p', 'r2', 'spearman'],
    toggles: ['group'],
    note: 'The column of points at 0 inches is the 209 dry days at each café. Pooled, r = −0.138 with p below 0.001 and r² = 0.019, though the 612 rows hold only 306 weather days: each day’s rain appears twice, once per café, which the p-value doesn’t know. By café, Harbourside’s r is −0.228 and Millbrook’s −0.102. The cafés share their days, so comparing the two correlations needs a test for dependent correlations (Steiger’s Z = −1.34, p = 0.18), not the independent-samples formula.',
  },
  'test-explorer': {
    type: 'formula',
    title: 'Testing r: the t statistic, the critical value and the Fisher-z interval',
    intro: 'Change r and the number of pairs.',
    inputs: [
      { id: 'r', label: 'Sample correlation r', min: -0.95, max: 0.95, step: 0.01, value: 0.64, fmt: 'num' },
      { id: 'n', label: 'Pairs n', min: 4, max: 1000, step: 1, value: 8, fmt: 'int' },
      { id: 'conf', label: 'Confidence level', min: 80, max: 99, step: 1, value: 95, fmt: 'pct' },
    ],
    compute: (v) => {
      const t = tOf(v.r, v.n), df = v.n - 2, p = 2 * (1 - I.tCdf(Math.abs(t), df)), rc = C.criticalR(v.n);
      const [lo, hi] = C.fisherCI(v.r, v.n, v.conf / 100);
      return {
        headline: { label: 'Two-sided p-value for H₀: ρ = 0', value: p < 0.001 ? 'below 0.001' : p.toFixed(3) },
        rows: [
          ['t statistic', fx(t, 3)],
          ['Degrees of freedom', String(df)],
          ['Critical |r| at α = 0.05', rc.toFixed(3)],
          [`${v.conf}% interval for ρ (Fisher’s z)`, `${fx(lo)} to ${fx(hi)}`],
          ['r²', (v.r * v.r).toFixed(3)],
        ],
        note: Math.abs(v.r) >= rc
          ? `|r| = ${Math.abs(v.r).toFixed(2)} is above the critical value ${rc.toFixed(3)}, so the test rejects ρ = 0 at 5%. That says r is unlikely to be chance, not that it is large: r² = ${(v.r * v.r).toFixed(3)}.`
          : `|r| = ${Math.abs(v.r).toFixed(2)} is below the critical value ${rc.toFixed(3)}, so the test can’t reject ρ = 0 at 5%. The interval shows how much is still possible: from ${fx(lo, 2)} to ${fx(hi, 2)}.`,
        chart: { kind: 'line', x: { label: 'Pairs n', values: critLine }, series: [{ name: 'Critical |r| at α = 0.05', values: critLine.map((n) => Number(C.criticalR(n).toFixed(3))) }], y: { label: 'Critical |r|' } },
      };
    },
  },
  'test-power': {
    type: 'formula',
    title: 'Pairs needed to detect a correlation (two-sided, α = 0.05)',
    intro: 'Choose the smallest correlation worth detecting, the power you want, and the pairs you have.',
    inputs: [
      { id: 'rho', label: 'True correlation ρ', min: 0.05, max: 0.9, step: 0.01, value: 0.3, fmt: 'num' },
      { id: 'pw', label: 'Power wanted', min: 50, max: 95, step: 1, value: 80, fmt: 'pct' },
      { id: 'n', label: 'Pairs you have', min: 5, max: 1000, step: 1, value: 306, fmt: 'int' },
    ],
    compute: (v) => {
      const need = C.sampleSize(v.rho, { power: v.pw / 100 }), have = C.power(v.rho, v.n);
      const ns = [10, 20, 50, 100, 200, 300, 500, 1000];
      return {
        headline: { label: `Pairs needed for ${v.pw}% power`, value: need.toLocaleString('en-US') },
        rows: [
          [`Power with ${v.n} pairs`, `${(have * 100).toFixed(1)}%`],
          ['Fisher’s z of ρ, atanh ρ', Math.atanh(v.rho).toFixed(3)],
          ['Pairs for half this ρ', C.sampleSize(v.rho / 2, { power: v.pw / 100 }).toLocaleString('en-US')],
        ],
        note: `With ${v.n} pairs a true correlation of ${v.rho.toFixed(2)} would be detected about ${Math.round(have * 100)} times in 100. ${have >= v.pw / 100 ? 'That meets the power you asked for.' : `To reach ${v.pw}% you would need ${need.toLocaleString('en-US')} pairs.`}`,
        chart: { kind: 'line', x: { label: 'Pairs n', values: ns }, series: [{ name: `Power at ρ = ${v.rho.toFixed(2)}`, values: ns.map((n) => Number((C.power(v.rho, n) * 100).toFixed(1))) }], y: { label: 'Power (%)' } },
      };
    },
  },
  'test-sheet': {
    type: 'sheet',
    title: 'Testing r in Excel: eight April days at Harbourside',
    sheet: aprSheet,
    view: 'A1:F10',
    editable: ['B2:C9', 'F8'],
    formats: { F1: '0.000', F3: '0.000', F4: '0.000', F5: '0.000', F6: '0.000', F7: '0.000', F8: '0%', F9: '0.000', F10: '0.000' },
    widths: { A: 12, E: 22 },
    tools: ['formulas', 'reset'],
    note: 'r = 0.639 with 8 pairs: t = 2.033, p = 0.088, below the critical r of 0.707, and the 95% interval runs from −0.120 to 0.926. Set F8 to 0.9 to narrow the interval; change Sunday’s footfall in C8 to 250 and watch r, t and p move.',
  },
};

export const guided = [
  {
    id: 'b05-test-g1', type: 'steps', kind: 'numerical',
    prompt: 'Millbrook, 1–24 October 2027: the day’s high in B2:B25 and hot drinks sold in C2:C25. F1 holds r (CORREL) and F2 the number of pairs. Test H₀: ρ = 0 against H₁: ρ ≠ 0 at α = 0.05.',
    solution: `r = ${fx(OP.r)} with 24 pairs; t = ${fx(OP.t)} with 22 degrees of freedom; p = ${fx(OP.p)}. Fail to reject H₀ at 5%: 24 October days are compatible with no linear association. Over Millbrook’s whole year the correlation is ${fx(yearHot.r)}, with a formula p-value below 0.001 that overstates the evidence, because temperature and hot-drink sales both follow the season and neighbouring days are alike. Still, the October sample was too small to say much, and October’s narrow range of temperatures makes r smaller too (the nonlinear-and-restricted lesson explains why).`,
    steps: [
      {
        id: 'b05-test-g1-s1', type: 'formula',
        prompt: 'In F3, calculate the t statistic from r in F1 and n in F2.',
        sheet: { cells: octCells },
        cell: 'F3', answer: T_F,
        alt: ['=F1*SQRT((F2-2)/(1-F1^2))', '=F1/SQRT((1-F1^2)/(F2-2))'],
        view: 'A1:F25', maxHeight: '20rem', widths: { A: 9 }, formats: { F1: '0.000', F3: '0.000' },
        wrong: [
          { formula: '=F1*SQRT(F2-1)/SQRT(1-F1^2)', say: 'A correlation test has n − 2 degrees of freedom, so the numerator uses √(n − 2).' },
          { formula: '=F1*SQRT(F2-2)/(1-F1^2)', say: 'The denominator is √(1 − r²), not 1 − r²: wrap it in SQRT.' },
          { formula: '=F1*SQRT(F2)/SQRT(1-F1^2)', say: 'Use n − 2, not n: as in fitting a straight line, two quantities (an intercept and a slope) are estimated, and each costs a degree of freedom.' },
        ],
        hints: ['t = r√(n − 2) ÷ √(1 − r²).', '<x>=F1*SQRT(F2-2)/SQRT(1-F1^2)</x>'],
      },
      {
        id: 'b05-test-g1-s2', type: 'formula',
        prompt: 'In F4, calculate the two-sided p-value from the t in F3.',
        sheet: { cells: { ...octCells, F3: T_F } },
        cell: 'F4', answer: '=T.DIST.2T(ABS(F3),F2-2)',
        alt: ['=2*T.DIST(-ABS(F3),F2-2,TRUE)', '=2*T.DIST.RT(ABS(F3),F2-2)', '=2*(1-T.DIST(ABS(F3),F2-2,TRUE))'],
        view: 'A1:F25', maxHeight: '20rem', widths: { A: 9 }, formats: { F1: '0.000', F3: '0.000', F4: '0.000' },
        wrong: [
          { formula: '=T.DIST.2T(F3,F2-2)', say: 'T.DIST.2T returns #NUM! for a negative x, and this t is negative. Give it ABS(F3).' },
          { formula: '=T.DIST.2T(ABS(F3),F2-1)', say: 'The degrees of freedom are n − 2 for a correlation, not n − 1 as for one mean.' },
          { formula: '=T.DIST(F3,F2-2,TRUE)', say: 'That is the lower tail only, the p-value for H₁: ρ < 0. The alternative here is two-sided.' },
        ],
        hints: ['Two-sided: T.DIST.2T, which needs a positive t.', '<x>=T.DIST.2T(ABS(F3),F2-2)</x>'],
      },
      {
        id: 'b05-test-g1-s3', type: 'mc',
        prompt: `The test gives r = ${fx(OP.r)}, p = ${fx(OP.p)}. Which conclusion should Ana write?`,
        options: [
          'October’s 24 days give no convincing evidence of a linear association between the day’s high and hot drinks.',
          'Temperature and hot-drink sales are unrelated at Millbrook, so she can stop recording the temperature.',
          'There is an 86% chance that warmer days go with fewer hot drinks at Millbrook in October.',
          'The negative r shows that warm days reduce hot-drink sales, so she should cut hot-drink stock when it is warm.',
        ],
        answer: 0,
        hints: ['Failing to reject H₀ is a statement about the evidence, not about the population.'],
        feedback: {
          1: 'Failing to reject is not showing that ρ = 0. With 24 days the test had little power, and the full year shows a clear negative association.',
          2: '1 − p is not the probability that H₁ is true; B04’s warning about reading p-values applies here too.',
          3: 'r = −0.31 isn’t significant here, and a correlation alone doesn’t show that temperature reduces sales.',
        },
      },
    ],
  },
  {
    id: 'b05-test-g2', type: 'num', kind: 'numerical',
    prompt: 'A bookshop chain (fictional) has 12 branches. What is the smallest |r| between two branch-level measures that would be significant at α = 0.05, two-sided? Give three decimal places.',
    answer: rnd(C.criticalR(12), 3), check: () => C.criticalR(12), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(I.tInv(0.975, 10), 3), say: 'That is the critical t. Convert it to r: t ÷ √(n − 2 + t²).' },
      { value: rnd(C.criticalR(13), 3), say: 'That uses 11 degrees of freedom. A correlation test has n − 2 = 10.' },
      { value: rnd(I.tInv(0.95, 10) / Math.sqrt(10 + I.tInv(0.95, 10) ** 2), 3), say: 'That is the one-sided critical value. For a two-sided test at 5% use T.INV.2T(0.05,10).' },
    ],
    hints: ['Critical t with 10 df: <x>=T.INV.2T(0.05,10)</x> = 2.228.', 'r_crit = 2.228 ÷ √(10 + 2.228²).'],
    solution: `t_crit = T.INV.2T(0.05, 10) = ${I.tInv(0.975, 10).toFixed(3)}; r_crit = ${I.tInv(0.975, 10).toFixed(3)} ÷ √(10 + ${I.tInv(0.975, 10).toFixed(3)}²) = ${C.criticalR(12).toFixed(3)}. With 12 branches only a correlation beyond ±${C.criticalR(12).toFixed(2)} can be told apart from chance at 5%.`,
  },
  {
    id: 'b05-test-g3', type: 'steps', kind: 'numerical',
    prompt: 'Quayside Books (fictional) finds r = 0.45 between weekly email opens and weekly online orders over 50 weeks. Build a 95% confidence interval for ρ with Fisher’s z.',
    solution: `z = atanh(0.45) = ${Math.atanh(0.45).toFixed(3)}; SE = 1 ÷ √47 = ${(1 / Math.sqrt(47)).toFixed(4)}; z ± 1.96 × SE runs from ${(Math.atanh(0.45) - z975 / Math.sqrt(47)).toFixed(3)} to ${(Math.atanh(0.45) + z975 / Math.sqrt(47)).toFixed(3)}; back-transformed, ρ lies between ${ci45[0].toFixed(3)} and ${ci45[1].toFixed(3)}. The interval excludes 0 but is wide, and it isn’t centred on 0.45: it reaches further down (0.45 − ${(0.45 - ci45[0]).toFixed(2)}) than up (+${(ci45[1] - 0.45).toFixed(2)}). Weeks in sequence are rarely independent, so treat it as approximate.`,
    steps: [
      {
        id: 'b05-test-g3-s1', type: 'num',
        prompt: 'Calculate Fisher’s z for r = 0.45, to three decimal places.',
        answer: rnd(Math.atanh(0.45), 3), check: () => 0.5 * Math.log(1.45 / 0.55), unit: '', places: 3, tol: 0.0005,
        wrong: [{ value: rnd(Math.log(1.45 / 0.55), 3), say: 'You forgot the ½: z = ½ ln((1 + r) ÷ (1 − r)).' }],
        hints: ['z = ½ ln((1 + r) ÷ (1 − r)), or <x>=FISHER(0.45)</x>.'],
      },
      {
        id: 'b05-test-g3-s2', type: 'num',
        prompt: 'Calculate the lower end of the 95% interval for ρ, to three decimal places.',
        answer: rnd(ci45[0], 3), check: () => Math.tanh(Math.atanh(0.45) - z975 / Math.sqrt(47)), unit: '', places: 3, tol: 0.0015,
        wrong: [
          { value: rnd(Math.atanh(0.45) - z975 / Math.sqrt(47), 3), say: 'That is the lower end on the z scale. Transform it back with tanh (FISHERINV).' },
          { value: rnd(Math.tanh(Math.atanh(0.45) - z975 / Math.sqrt(50)), 3), say: 'The standard error of z is 1 ÷ √(n − 3) = 1 ÷ √47, not 1 ÷ √50.' },
        ],
        hints: ['Lower end on the z scale: z − 1.96 ÷ √(50 − 3).', 'Then FISHERINV (tanh) of that.'],
      },
    ],
  },
  {
    id: 'b05-test-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Two regions of a hardware chain (fictional) each correlate weekly footfall with weekly sales over 40 weeks. The West gives r = 0.41 (p = 0.009); the East gives r = 0.27 (p = 0.09). What can you conclude about the difference between the regions?',
    options: [
      'Nothing yet: compare the two correlations directly, for example with Fisher’s z.',
      'The link is stronger in the West, because only the West’s correlation is significant at 5%.',
      'The East has no link between footfall and sales, so its stores need a different strategy.',
      'The regions differ by 0.14 in r, and with 80 weeks between them that difference must be significant.',
    ],
    answer: 0,
    hints: ['Is “significant versus not significant” itself a test of a difference?', 'Fisher’s z for two independent correlations compares them directly.'],
    feedback: {
      1: 'One significant result and one not is not evidence of a difference: the East’s test may simply lack power.',
      2: 'Failing to reject ρ = 0 in the East doesn’t show there is no link; r = 0.27 is compatible with a sizeable correlation.',
      3: 'Significance of a difference has to be tested. Treating the regions as independent, z = (atanh 0.41 − atanh 0.27) ÷ √(1/37 + 1/37) ≈ 0.68, p ≈ 0.49: no evidence of a difference.',
    },
    solution: `Comparing p-values doesn’t test the difference. Fisher’s z, treating the regions as independent: (atanh 0.41 − atanh 0.27) ÷ √(1/37 + 1/37) = ${fx(C.compareIndependent(0.41, 40, 0.27, 40).z, 2)}, p = ${C.compareIndependent(0.41, 40, 0.27, 40).p.toFixed(2)}. Strictly the samples are dependent, because both regions cover the same 40 weeks (the same seasons and holidays), so a test for dependent correlations would be more exact; but with p near 0.5 there is no sign that the regions differ.`,
  },
];

export const independent = [
  {
    id: 'b05-test-i1', type: 'formula', kind: 'numerical',
    prompt: 'B1 holds a sample correlation, B2 the number of pairs and B3 the confidence level. In B5, calculate the lower end of the confidence interval for ρ with Fisher’s z, using FISHER and FISHERINV.',
    sheet: ciSheet,
    cell: 'B5', answer: '=FISHERINV(FISHER(B1)-NORM.S.INV(1-(1-B3)/2)/SQRT(B2-3))',
    alt: ['=FISHERINV(FISHER(B1)+NORM.S.INV((1-B3)/2)/SQRT(B2-3))', '=FISHERINV(FISHER(B1)-NORM.S.INV((1+B3)/2)/SQRT(B2-3))'],
    require: ['FISHERINV'],
    view: 'A1:B6', widths: { A: 22 }, formats: { B3: '0%', B5: '0.000' },
    wrong: [
      { formula: '=FISHER(B1)-NORM.S.INV(1-(1-B3)/2)/SQRT(B2-3)', say: 'That is the lower end on the z scale. Transform it back with FISHERINV.' },
      { formula: '=FISHERINV(FISHER(B1)-NORM.S.INV(1-(1-B3)/2)/SQRT(B2))', say: 'The standard error of Fisher’s z is 1 ÷ √(n − 3), not 1 ÷ √n.' },
      { formula: '=FISHERINV(FISHER(B1)-NORM.S.INV(B3)/SQRT(B2-3))', say: 'NORM.S.INV(B3) puts the whole 5% in one tail. A two-sided interval splits it: NORM.S.INV(1-(1-B3)/2).' },
      { formula: '=B1-NORM.S.INV(1-(1-B3)/2)/SQRT(B2-3)', say: 'That subtracts the margin from r itself. The margin belongs on Fisher’s z scale: FISHER(B1) first, then FISHERINV.' },
    ],
    solution: `<x>=FISHERINV(FISHER(B1)-NORM.S.INV(1-(1-B3)/2)/SQRT(B2-3))</x>. For r = 0.45 and n = 50 at 95% it gives ${ci45[0].toFixed(3)}; the upper end, with + in place of −, is ${ci45[1].toFixed(3)}.`,
  },
  {
    id: 'b05-test-i2', type: 'num', kind: 'numerical',
    prompt: 'Harrow & Finch (fictional), an estate agent, finds r = 0.30 between the number of photos in a listing and the number of viewing requests, across 40 listings. Calculate the two-sided p-value for H₀: ρ = 0, to three decimal places.',
    answer: rnd(p2(0.3, 40), 3), check: () => p2(0.3, 40), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(p2(0.3, 40) / 2, 3), say: 'That is the one-sided p-value. The question asks for two-sided: T.DIST.2T.' },
      { value: rnd(2 * (1 - I.normCdf(tOf(0.3, 40))), 3), say: 'That uses the normal distribution. The statistic follows the t distribution with n − 2 = 38 degrees of freedom: T.DIST.2T.' },
    ],
    solution: `t = 0.30 × √38 ÷ √(1 − 0.09) = ${tOf(0.3, 40).toFixed(3)} with 38 df; <x>=T.DIST.2T(${tOf(0.3, 40).toFixed(3)},38)</x> = ${p2(0.3, 40).toFixed(3)}. Not significant at 5%: t = ${tOf(0.3, 40).toFixed(3)} is below the critical t of ${I.tInv(0.975, 38).toFixed(3)} on 38 df (equivalently, r = 0.30 is below the critical r of ${C.criticalR(40).toFixed(3)}). Forty listings can’t separate r = 0.30 from chance, and r² = 0.09 would be small even if the association were real; nor would a correlation show that adding photos brings more requests.`,
  },
  {
    id: 'b05-test-i3', type: 'num', kind: 'applied',
    prompt: 'Brightline Pharmacy (fictional) wants to check whether its stores’ staff-training hours go with customer-satisfaction scores. It would only act on a correlation of 0.25 or more, and wants 80% power with a two-sided test at α = 0.05. How many stores does it need? Give a whole number, rounded up.',
    answer: C.sampleSize(0.25), check: () => Math.ceil(((z975 + z80) / Math.atanh(0.25)) ** 2 + 3), unit: 'stores', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(((z975 + z80) / Math.atanh(0.25)) ** 2), say: 'You left out the + 3 that comes from Fisher’s standard error, 1 ÷ √(n − 3).' },
      { value: Math.ceil(((z975 + z80) / 0.25) ** 2 + 3), say: 'Use Fisher’s z of ρ, atanh(0.25) = 0.255, not 0.25 itself; the difference is small here but grows for larger ρ.' },
      { value: Math.ceil(((I.normInv(0.95) + z80) / Math.atanh(0.25)) ** 2 + 3), say: 'That uses 1.645, the one-sided value. A two-sided test at 5% needs 1.96.' },
    ],
    solution: `n = ((1.960 + 0.842) ÷ atanh 0.25)² + 3 = (2.802 ÷ ${Math.atanh(0.25).toFixed(4)})² + 3 = ${(((z975 + z80) / Math.atanh(0.25)) ** 2 + 3).toFixed(1)}, so ${C.sampleSize(0.25)} stores. A chain with 40 stores would have only about ${Math.round(C.power(0.25, 40) * 100)}% power for ρ = 0.25.`,
  },
  {
    id: 'b05-test-i4', type: 'formula', kind: 'numerical',
    prompt: 'An ice-cream maker (fictional) correlates each store’s local average summer temperature with its summer sales, separately for its stores in two countries: r and the number of stores for each are in B2:C3. In B5, calculate the z statistic that compares the two correlations, North minus South.',
    sheet: cmpSheet,
    cell: 'B5', answer: '=(FISHER(B2)-FISHER(B3))/SQRT(1/(C2-3)+1/(C3-3))',
    alt: ['=(ATANH(B2)-ATANH(B3))/SQRT(1/(C2-3)+1/(C3-3))'],
    view: 'A1:C6', widths: { A: 18 }, formats: { B5: '0.000' },
    wrong: [
      { formula: '=(B2-B3)/SQRT(1/(C2-3)+1/(C3-3))', say: 'Transform each r with FISHER before subtracting: the standard error 1 ÷ √(n − 3) belongs to Fisher’s z, not to r.' },
      { formula: '=(FISHER(B2)-FISHER(B3))/SQRT(1/C2+1/C3)', say: 'Fisher’s z has variance 1 ÷ (n − 3) in each sample, not 1 ÷ n.' },
      { formula: '=(FISHER(B2)-FISHER(B3))/(1/SQRT(C2-3)+1/SQRT(C3-3))', say: 'Add the variances, then take the square root: SQRT(1/(C2-3)+1/(C3-3)). Standard errors don’t add.' },
    ],
    solution: `z = (atanh 0.58 − atanh 0.31) ÷ √(1/61 + 1/78) = ${fx(CMP.z)}; the two-sided p-value, <x>=2*(1-NORM.S.DIST(ABS(B5),TRUE))</x>, is ${CMP.p.toFixed(3)}. The North’s correlation is significantly higher at 5%. Different stores in different countries are independent samples, which is what this formula needs; had the two correlations come from the same stores or the same weeks, it wouldn’t apply.`,
  },
  {
    id: 'b05-test-i5', type: 'mc', kind: 'applied',
    prompt: 'Tern Air (fictional) analyses 2.4 million bookings and finds r = 0.03 between how many days ahead a seat was booked and the passenger’s satisfaction score, with p below 0.001. The marketing team proposes a campaign telling customers that booking early makes them happier. What is the best response?',
    options: [
      'Real but negligible: r² is under 0.1%, and a correlation can’t show that booking early causes satisfaction.',
      'Run the campaign: with 2.4 million bookings and p below 0.001, the result is about as certain as a statistical finding can be.',
      'Reject the finding: with samples this large every test is significant, so the p-value means nothing.',
      'Recalculate with a one-sided test, which will make the result even more convincing before the campaign goes ahead.',
    ],
    answer: 0,
    feedback: {
      1: 'Certainty that r isn’t 0 is not certainty that the effect matters. r = 0.03 explains 0.09% of the variation in satisfaction.',
      2: 'The p-value is valid: large samples detect small real associations. The problem is size, not significance.',
      3: 'A one-sided test only halves an already tiny p-value; it says nothing about how large the association is.',
    },
    solution: 'With 2.4 million pairs even r = 0.03 is significant; r² = 0.0009 means booking lead time goes with less than 0.1% of the variation in satisfaction. The finding is statistically significant and practically negligible, and as a correlation it couldn’t show that booking early causes happier passengers anyway.',
  },
  {
    id: 'b05-test-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Ana’s log gives r = −0.10 between rain and footfall at Millbrook (306 days, two-sided p = 0.074, 95% interval −0.21 to 0.01). Classify each statement.',
    items: [
      'At α = 0.05 the test fails to reject ρ = 0.',
      'Rain has no effect on Millbrook’s footfall.',
      'A population correlation of −0.15 is compatible with the data.',
      'The one-sided p-value, 0.037, can be reported because rain was expected to lower footfall, an expectation Ana formed after seeing r.',
      'With 306 days the test had less than even odds of detecting a true correlation of −0.1.',
    ],
    categories: ['Supported', 'Not supported'],
    answer: [0, 1, 0, 1, 0],
    feedback: {
      1: 'Failing to reject is not evidence of no effect; the interval runs to −0.21.',
      3: 'A one-sided test must be chosen before seeing the data. Choosing it after doubles the false-alarm rate.',
      4: 'Power for ρ = −0.1 with 306 pairs is about 42%: less than even odds.',
    },
    solution: 'p = 0.074 > 0.05, so the test fails to reject ρ = 0, but the interval (−0.21 to 0.01) still includes weak negative correlations such as −0.15, so “no effect” isn’t supported. A one-sided test chosen after seeing r is p-hacking. The test’s power for ρ = −0.1 was about 42%.',
  },
];

export const check = [
  {
    id: 'b05-test-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does the null hypothesis H₀: ρ = 0 state?',
    options: [
      'The sample correlation r between the two measured variables is exactly 0.',
      'There is no linear association between the variables in the population.',
      'Neither variable has any effect, of any kind, on the other variable.',
      'The two variables are measured on different scales and can’t be compared.',
    ],
    answer: 1,
    feedback: {
      0: 'Hypotheses are about the population, not the sample: r is known once the data are in, and is almost never exactly 0.',
      2: 'ρ = 0 rules out only a linear association; a curved link can have ρ = 0, and correlation says nothing about effects.',
      3: 'Correlation doesn’t depend on units, so different scales are no obstacle.',
    },
    solution: 'ρ is the population correlation. H₀: ρ = 0 states that, in the population the sample comes from, there is no linear association between the variables. It says nothing about causes, and a strong non-linear relationship can still have ρ = 0.',
  },
  {
    id: 'b05-test-k2', type: 'num', kind: 'numerical',
    prompt: 'A clinic (fictional) finds r = −0.52 between patients’ waiting time and their satisfaction score, across 18 patients. Calculate the t statistic for H₀: ρ = 0, to two decimal places.',
    answer: rnd(tOf(-0.52, 18), 2), check: () => (-0.52 * Math.sqrt(16)) / Math.sqrt(1 - 0.52 ** 2), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((-0.52 * Math.sqrt(16)) / (1 - 0.52 ** 2), 2), say: 'The denominator is √(1 − r²), not 1 − r².' },
      { value: rnd((-0.52 * Math.sqrt(18)) / Math.sqrt(1 - 0.52 ** 2), 2), say: 'Use √(n − 2) = √16 = 4, not √18.' },
      { value: rnd((0.52 * Math.sqrt(16)) / Math.sqrt(1 - 0.52 ** 2), 2), say: 'The statistic keeps the sign of r, which is negative.' },
    ],
    solution: `t = −0.52 × √16 ÷ √(1 − 0.2704) = −2.08 ÷ ${Math.sqrt(1 - 0.2704).toFixed(4)} = ${fx(tOf(-0.52, 18), 2)}, with 16 df. The two-sided p-value is ${p2(-0.52, 18).toFixed(3)}, so at 5% the association is significant.`,
  },
  {
    id: 'b05-test-k3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 1–20 August 2027: the day’s high in B2:B21 and footfall in C2:C21. In F1, calculate in one formula the two-sided p-value for H₀: ρ = 0.',
    sheet: augSheet,
    cell: 'F1', answer: '=T.DIST.2T(ABS(CORREL(B2:B21,C2:C21)*SQRT(COUNT(B2:B21)-2)/SQRT(1-CORREL(B2:B21,C2:C21)^2)),COUNT(B2:B21)-2)',
    alt: ['=2*T.DIST.RT(ABS(CORREL(B2:B21,C2:C21)*SQRT(COUNT(B2:B21)-2)/SQRT(1-CORREL(B2:B21,C2:C21)^2)),COUNT(B2:B21)-2)', '=T.DIST.2T(ABS(CORREL(B2:B21,C2:C21))*SQRT(COUNT(B2:B21)-2)/SQRT(1-RSQ(B2:B21,C2:C21)),COUNT(B2:B21)-2)'],
    require: ['CORREL'],
    view: 'A1:F21', widths: { E: 18 }, formats: { F1: '0.000' },
    wrong: [
      { formula: '=T.DIST.2T(ABS(CORREL(B2:B21,C2:C21)*SQRT(COUNT(B2:B21)-2)/SQRT(1-CORREL(B2:B21,C2:C21)^2)),COUNT(B2:B21)-1)', say: 'Degrees of freedom for a correlation are n − 2.' },
      { formula: '=T.DIST.RT(ABS(CORREL(B2:B21,C2:C21)*SQRT(COUNT(B2:B21)-2)/SQRT(1-CORREL(B2:B21,C2:C21)^2)),COUNT(B2:B21)-2)', say: 'T.DIST.RT is one tail. The test is two-sided: T.DIST.2T.' },
      { formula: '=T.DIST.2T(ABS(CORREL(B2:B21,C2:C21)*SQRT(COUNT(B2:B21)-2)/(1-CORREL(B2:B21,C2:C21)^2)),COUNT(B2:B21)-2)', say: 'The denominator of t is √(1 − r²): wrap 1 − r² in SQRT.' },
    ],
    solution: `r = ${fx(GP.r)}, t = ${fx(GP.t)} with 18 df, and the two-sided p-value is ${GP.p.toFixed(4)}: just below 0.05. A result this close to α is weak evidence on its own, and twenty consecutive days are not independent; the whole year at Harbourside, r = 0.436 over 306 days, is far more convincing.`,
  },
  {
    id: 'b05-test-k4', type: 'num', kind: 'numerical',
    prompt: 'A study will correlate two measures across 50 pairs, with a two-sided test at α = 0.05. If the true correlation is 0.3, what is the power of the test? Use the Fisher-z approximation and give a percentage to the nearest whole number.',
    answer: Math.round(C.power(0.3, 50) * 100), check: () => I.normCdf(Math.atanh(0.3) * Math.sqrt(47) - z975) * 100, unit: '%', places: 0, tol: 1,
    wrong: [
      { value: Math.round(I.normCdf(Math.atanh(0.3) * Math.sqrt(50) - z975) * 100), say: 'Fisher’s standard error uses n − 3: multiply by √47, not √50.' },
      { value: Math.round(I.normCdf(Math.atanh(0.3) * Math.sqrt(47) - I.normInv(0.95)) * 100), say: 'That subtracts 1.645, the one-sided value. A two-sided test at 5% uses 1.96.' },
    ],
    solution: `Power ≈ Φ(atanh 0.3 × √47 − 1.96) = Φ(${Math.atanh(0.3).toFixed(4)} × ${Math.sqrt(47).toFixed(3)} − 1.96) = Φ(${(Math.atanh(0.3) * Math.sqrt(47) - z975).toFixed(3)}) ≈ ${Math.round(C.power(0.3, 50) * 100)}%. Fifty pairs miss a true correlation of 0.3 more than four times in ten; 80% power needs ${C.sampleSize(0.3)}.`,
  },
  {
    id: 'b05-test-k5', type: 'mc', kind: 'applied',
    prompt: 'A coffee roaster (fictional) reports: “Across 400 cafés we supply, r = 0.18 between how many of our bags a café buys and its rating on a review site (p &lt; 0.001). Cafés should buy more of our coffee to improve their ratings.” Which is the strongest criticism?',
    options: [
      'The p-value is too small to trust when the sample is this large.',
      'A sample of 400 cafés is far too small for a correlation test to be reliable.',
      'r = 0.18 is a weak association, and correlation doesn’t show causation.',
      'The test should have been one-sided, since the roaster expected a positive link.',
    ],
    answer: 2,
    feedback: {
      0: 'With 400 pairs the critical r is about 0.098, so r = 0.18 is genuinely significant. The problem is what the result is used to claim.',
      1: '400 pairs give plenty of power for moderate correlations; size is not the issue.',
      3: 'A one-sided test would only shrink p further. It doesn’t touch the real problems: the size of r and the causal leap.',
    },
    solution: `The correlation is significant (critical r for 400 pairs is ${C.criticalR(400).toFixed(3)}), but r² = 0.032: bag purchases go with about 3% of the variation in ratings. And busier, better-run cafés may both buy more coffee and earn better reviews, so the correlation can’t show that buying more causes better ratings.`,
  },
  {
    id: 'b05-test-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about Fisher’s z interval for ρ.',
    text: 'Fisher’s z is [[0]] of r. Its standard error is [[1]]. The interval for ρ is found by adding and subtracting the margin on the z scale and then applying [[2]]. Because of that last step, the interval is usually [[3]] about r.',
    blanks: [
      { options: ['the square', 'the inverse hyperbolic tangent', 'the rank'], answer: 1 },
      { options: ['1 ÷ √n', '√(1 − r²)', '1 ÷ √(n − 3)'], answer: 2 },
      { options: ['tanh (FISHERINV)', 'FISHER again', 'the square root'], answer: 0 },
      { options: ['symmetric', 'not symmetric', 'centred on 0'], answer: 1 },
    ],
    solution: 'z = atanh(r) = ½ ln((1 + r) ÷ (1 − r)), with standard error 1 ÷ √(n − 3). Add and subtract z* × SE on the z scale, then transform back with tanh (Excel’s FISHERINV). The back-transformation squeezes the end nearer ±1, so the interval is not symmetric about r.',
  },
];
