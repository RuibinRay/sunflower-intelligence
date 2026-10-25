// evaluating-segments.ex.js — M05 · Evaluating segments: widgets, practice and the knowledge check (answer keys live
// here). Lantern's segments, measures and fit come from case.js (DERIVED); Ana's weights (4, 4, 2, 2, 4) are the
// lesson's. Tarnwick Travel, Sorrelbank Software, Hollinmere Credit Union, Cobbleford Cycles and the other businesses
// named here are fictional. Every num item's `check` recomputes its answer.
import { DERIVED as D, BRANDS, MARGIN, LANTERN_STRENGTHS } from './case.js?v=14';
import { weightedScore } from '../../../core/percmap.js?v=14';
import { needsFit } from '../../../core/market.js?v=14';

const S = D.segments, NAMES = S.names, K = NAMES.length;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), GO = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const share = S.sizes.map((s) => s.share), head = S.sizes.map((s) => s.perHead);
const growth = D.targeting.growth, fit = D.targeting.fit, room = D.map.nearestRival.map((x) => x.d);
const mx = (a) => Math.max(...a);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const ratio = (a) => a.map((v) => (100 * v) / mx(a));
const maxFit = mx(fit.map(Math.abs));
const FS = [ratio(share), ratio(head), ratio(growth), ratio(room), fit.map((v) => 50 + (50 * v) / maxFit)];
const FACT = ['Size', 'Spend per head', 'Growth', 'Room', 'Fit'];
const W_ANA = [4, 4, 2, 2, 4];
const wsum = (w, g) => sum(FS.map((f, k) => w[k] * f[g]));
const r0 = (x) => Math.round(x), r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2), m2 = (x) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(2)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const row = (from, r, values) => Object.fromEntries(values.map((v, j) => [`${String.fromCharCode(from.charCodeAt(0) + j)}${r}`, v]));

// ---------------------------------------------------------------- widgets
const SHORT = { 'Value routine': 'Value', 'Craft and local': 'Craft' };   // chart labels short enough for a phone
function scorecard(v) {
  const w = [v.size, v.head, v.growth, v.room, v.fit];
  if (sum(w) <= 0) return { error: 'Give at least one factor a weight above 0.' };
  const t = weightedScore(FS, w);
  const order = t.map((x, g) => g).sort((a, b) => t[b] - t[a]);
  const [L, R] = order;
  const gap = wsum(w, L) - wsum(w, R);
  const routes = FS.map((f, k) => ({ k, adv: f[R] - f[L] })).filter((x) => x.adv > 1e-9).map((x) => ({ k: x.k, to: w[x.k] + gap / x.adv }));
  const say = routes.length
    ? routes.map((x) => `${FACT[x.k].toLowerCase()} rose from ${w[x.k]} to about ${f1(x.to)}${x.to > 10 ? ' (beyond these sliders)' : ''}`).join(', or if ')
    : '';
  return {
    headline: { label: 'Leading segment', value: `${NAMES[L]} · ${f1(t[L])}` },
    rows: order.map((g, i) => [`${i + 1}. ${NAMES[g]}`, f1(t[g])]),
    note: gap < 1e-9
      ? `${NAMES[L]} and ${NAMES[R]} are level: a tie on these weights.`
      : routes.length
        ? `${NAMES[R]} is second, ${f1(t[L] - t[R])} points behind (${f1(gap)} in the weighted sums). With every other weight held, it would draw level if ${say}.`
        : `${NAMES[R]} is second, ${f1(t[L] - t[R])} points behind, and scores no higher than ${NAMES[L]} on any factor: no weight change alone can put it first.`,
    chart: { kind: 'bar', x: { label: 'Segment', values: NAMES.map((nm) => SHORT[nm] || nm) }, series: [{ name: 'Weighted score', values: t.map(r1) }], y: { label: 'Weighted score (0–100)' } },
  };
}

// the scorecard as a worksheet: measures in rows 2–6, scores in rows 9–13, weights in row 15
const sheetCells = {
  A1: 'Segment', B1: 'Share', C1: 'Spend/head', D1: 'Growth %', E1: 'Room', F1: 'Fit (z)',
  ...col('A', 2, NAMES), ...col('B', 2, share), ...col('C', 2, head), ...col('D', 2, growth), ...col('E', 2, room), ...col('F', 2, fit),
  A8: 'Scores (0–100)', ...row('B', 8, ['Size', 'Spend', 'Growth', 'Room', 'Fit', 'Weighted']),
  ...col('A', 9, NAMES),
  ...Object.assign({}, ...NAMES.map((_, g) => row('B', 9 + g, [
    ...['B', 'C', 'D', 'E'].map((c) => `=100*${c}${2 + g}/MAX(${c}$2:${c}$6)`),
    `=50+50*F${2 + g}/MAX(ABS(F$2:F$6))`,
    `=SUMPRODUCT(B${9 + g}:F${9 + g},$B$15:$F$15)/SUM($B$15:$F$15)`,
  ]))),
  A15: 'Weight', ...row('B', 15, W_ANA),
  A17: 'Lead over Explorers', B17: `=G${9 + CL}-G${9 + EX}`,
};
const sheetFormats = {
  ...Object.fromEntries([2, 3, 4, 5, 6].flatMap((r) => [[`B${r}`, '0.0%'], [`C${r}`, '$#,##0.00'], [`D${r}`, '0'], [`E${r}`, '0.00'], [`F${r}`, '0.00']])),
  ...Object.fromEntries([9, 10, 11, 12, 13].flatMap((r) => ['B', 'C', 'D', 'E', 'F', 'G'].map((c) => [`${c}${r}`, '0.0']))),
  B17: '0.0',
};

export const widgets = {
  'es-scorecard': {
    type: 'formula', title: 'Lantern’s segment scorecard: how the weights decide',
    intro: 'Each slider is a factor’s weight (0 = ignore it). Weights are relative: the scores are divided by their total.',
    inputs: [
      { id: 'size', label: 'Size (share of respondents)', min: 0, max: 10, step: 1, value: 4, fmt: 'int' },
      { id: 'head', label: 'Spend per head', min: 0, max: 10, step: 1, value: 4, fmt: 'int' },
      { id: 'growth', label: 'Growth (Ana’s estimates)', min: 0, max: 10, step: 1, value: 2, fmt: 'int' },
      { id: 'room', label: 'Room from the nearest rival', min: 0, max: 10, step: 1, value: 2, fmt: 'int' },
      { id: 'fit', label: 'Fit with Lantern’s strengths', min: 0, max: 10, step: 1, value: 4, fmt: 'int' },
    ],
    compute: scorecard,
  },
  'es-sheet': {
    type: 'sheet', title: 'Lantern’s segment scorecard in Excel',
    sheet: { cells: sheetCells }, view: 'A1:G17', editable: true, mark: ['G9:G13', 'B17'], maxHeight: '34rem',
    formats: sheetFormats, widths: { A: 18, B: 8, C: 11, D: 9, E: 8, F: 8, G: 10 },
    tools: ['formulas', 'datatable', 'reset'],
    datatable: { target: 'B17', input: 'D15', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], format: '0.0' },
    note: 'B9 is <x>=100*B2/MAX(B$2:B$6)</x>, the ratio to the best segment, filled across to E and down to row 13; F9 is <x>=50+50*F2/MAX(ABS(F$2:F$6))</x>; G9 is <x>=SUMPRODUCT(B9:F9,$B$15:$F$15)/SUM($B$15:$F$15)</x>. Show Formulas to see them all. The data table recalculates B17 for growth weights from 0 to 10: the lead turns negative between 7 and 8.',
  },
};

// ---------------------------------------------------------------- guided practice
const mPool = 1000 * share[MI] * head[MI] * MARGIN;
const mPool3 = mPool * 1.07 ** 3;
const headCells = { A1: 'Segment', B1: 'Spend per head ($ a month)', C1: 'Score (0–100)', ...col('A', 2, NAMES), ...col('B', 2, head) };
const scoreCells = { A1: 'Segment', ...row('B', 1, [...FACT, 'Weighted score']), ...col('A', 2, NAMES), ...Object.assign({}, ...NAMES.map((_, g) => row('B', 2 + g, FS.map((f) => r1(f[g]))))), A8: 'Weight', ...row('B', 8, W_ANA) };
const scoreFormats = Object.fromEntries([2, 3, 4, 5, 6].flatMap((r) => ['B', 'C', 'D', 'E', 'F', 'G'].map((c) => [`${c}${r}`, '0.0'])));
// Tarnwick Travel (fictional): adventure couples (A) against family groups (B)
const TT = { a: [70, 100, 60, 90], b: [100, 65, 80, 70], w: [3, 3, 2, 2] };
const ttSum = (x) => sum(x.map((s, k) => TT.w[k] * s));
const ttGap = ttSum(TT.a) - ttSum(TT.b);

export const guided = [
  {
    id: 'm05-es-g1', type: 'steps', kind: 'numerical',
    prompt: `Mindful is ${f2(share[MI] * 100)}% of the study’s respondents and spends $${f2(head[MI])} a head a month on coffee. Lantern’s gross margin is ${(MARGIN * 100).toFixed(0)}%, and Ana expects the segment to grow 7% a year.`,
    solution: `Margin pool = people × spend per head × margin = 1,000 × 0.1625 × $39.75 × 0.38 ≈ $${r0(mPool).toLocaleString('en-US')} a month per 1,000 weekly coffee drinkers. Three years at 7%: $${r0(mPool).toLocaleString('en-US')} × 1.07³ ≈ $${r0(mPool3).toLocaleString('en-US')}. The pool is the gross margin on the segment’s whole spending, a ceiling for comparing segments, not what Lantern will earn.`,
    steps: [
      {
        id: 'm05-es-g1-s1', type: 'num',
        prompt: 'Calculate Mindful’s monthly margin pool per 1,000 weekly coffee drinkers. Give a whole number of dollars.',
        answer: r0(mPool), check: () => 1000 * (104 / 640) * (4134 / 104) * 0.38, unit: '$', places: 0, tol: 2,
        wrong: [
          { value: r0(1000 * share[MI] * head[MI]), say: 'That is the segment’s coffee spending per 1,000 drinkers. The margin pool keeps only the margin: multiply by 0.38.' },
          { value: r2(head[MI] * MARGIN), say: 'That is the margin on one person’s spending. Per 1,000 drinkers there are 1,000 × 0.1625 = 162.5 Mindful drinkers.' },
          { value: r0(1000 * head[MI] * MARGIN), say: 'That treats all 1,000 drinkers as Mindful. Only 16.25% of them are: multiply by the share too.' },
        ],
        hints: ['Margin pool = people × spend per head × margin.', 'People per 1,000 drinkers = 1,000 × 0.1625 = 162.5; then × $39.75 × 0.38.'],
      },
      {
        id: 'm05-es-g1-s2', type: 'num',
        prompt: 'Project that pool three years ahead at 7% a year. Give a whole number of dollars.',
        answer: r0(mPool3), check: () => 1000 * (104 / 640) * (4134 / 104) * 0.38 * 1.07 ** 3, unit: '$', places: 0, tol: 3,
        wrong: [
          { value: r0(mPool * 1.21), say: 'Adding 7% three times (21%) is simple growth. Growth compounds: multiply by 1.07 three times, 1.07³ ≈ 1.225.' },
          { value: r0(mPool * 1.07), say: 'That is one year of growth. Three years: × 1.07³.' },
        ],
        hints: ['Future size = size now × (1 + g)^t.', '× 1.07³ ≈ 1.225.'],
      },
      {
        id: 'm05-es-g1-s3', type: 'mc',
        prompt: 'What does Mindful’s margin pool tell Ana?',
        options: [
          'The gross margin on all the segment’s coffee spending: a ceiling for comparing segments',
          'The gross margin Lantern should expect to earn from Mindful drinkers each month once it targets them',
          'The profit after every cost that Lantern would make by winning the whole of the Mindful segment',
          'How much more each Mindful drinker would spend each month if Lantern targeted the segment',
        ],
        answer: 0,
        feedback: {
          1: 'Lantern will win only part of the segment’s spending; the pool assumes it wins all of it.',
          2: 'A 38% gross margin is before overheads, marketing and the cost of reaching the segment.',
          3: 'The pool uses what the segment spends now; it says nothing about extra spending.',
        },
        hints: ['The pool assumes Lantern sells the segment everything it now buys.', 'Gross margin is not profit after all costs.'],
      },
    ],
  },
  {
    id: 'm05-es-g2', type: 'formula', kind: 'numerical',
    prompt: 'Column B holds each segment’s monthly spend per head. In C2, score spend per head from 0 to 100 as a ratio to the best segment, in a formula that can be filled down to C6.',
    sheet: { cells: headCells }, cell: 'C2', fill: 'C2:C6', answer: '=100*B2/MAX($B$2:$B$6)',
    alt: ['=B2/MAX($B$2:$B$6)*100', '=100*B2/MAX(B$2:B$6)', '=B2*100/MAX($B$2:$B$6)'],
    view: 'A1:C6', formats: { B: '$#,##0.00', C: '0.0' }, widths: { A: 18, B: 22, C: 14 },
    wrong: [
      { formula: '=100*B2/MAX(B2:B6)', say: 'Without $ the range slides down as you fill: C3 compares row 3 with rows 3–7 only. Lock it: MAX($B$2:$B$6).' },
      { formula: '=100*(B2-MIN($B$2:$B$6))/(MAX($B$2:$B$6)-MIN($B$2:$B$6))', say: 'That is min–max scaling: the lowest-spending segment scores 0 however close it is. The ratio to the best is 100 × B2 ÷ the best value.' },
      { formula: '=100*B2/SUM($B$2:$B$6)', say: 'Dividing by the sum gives each segment’s share of the total, so no segment scores 100. Divide by the best value, MAX.' },
      { formula: '=B2/MAX($B$2:$B$6)', say: 'Right ratio, wrong scale: the best scores 1, not 100. Multiply by 100.' },
      { formula: `=100*B2/${f2(head[CL])}`, say: 'With the best value typed in, the scores stop updating when the data change. Refer to the data: MAX($B$2:$B$6).' },
    ],
    hints: ['Divide each value by the best value and multiply by 100.', '<x>=100*B2/MAX($B$2:$B$6)</x>, with the range locked.'],
    solution: `<x>=100*B2/MAX($B$2:$B$6)</x> gives ${FS[1].map(f1).join(', ')}: Craft and local scores 100 and the others keep their proportions, so Value routine’s $${f2(head[VR])} is about a third of the best.`,
  },
  {
    id: 'm05-es-g3', type: 'formula', kind: 'applied',
    prompt: 'B2:F6 hold each segment’s scores on the five factors and B8:F8 Ana’s weights. In G2, calculate the weighted score of the segment in row 2 (on 0–100), in a formula that can be filled down to G6.',
    sheet: { cells: scoreCells }, cell: 'G2', fill: 'G2:G6', answer: '=SUMPRODUCT(B2:F2,$B$8:$F$8)/SUM($B$8:$F$8)',
    alt: ['=SUMPRODUCT($B$8:$F$8,B2:F2)/SUM($B$8:$F$8)', '=SUMPRODUCT(B2:F2*$B$8:$F$8)/SUM($B$8:$F$8)', '=(B2*$B$8+C2*$C$8+D2*$D$8+E2*$E$8+F2*$F$8)/SUM($B$8:$F$8)', '=SUMPRODUCT(B2:F2,B$8:F$8)/SUM(B$8:F$8)'],
    view: 'A1:G8', formats: scoreFormats, widths: { A: 18, B: 9, C: 15, D: 9, E: 9, F: 9, G: 15 },
    wrong: [
      { formula: '=SUMPRODUCT(B2:F2,$B$8:$F$8)', say: 'That is the weighted sum (over 1,400 for Craft and local). Divide by the total weight, SUM($B$8:$F$8), to bring it back to 0–100.' },
      { formula: '=SUMPRODUCT(B2:F2,B8:F8)/SUM(B8:F8)', say: 'Without $ the weights slide down as you fill: G3 reads row 9, which is empty. Lock them: $B$8:$F$8.' },
      { formula: '=AVERAGE(B2:F2)', say: 'That gives every factor the same weight. Use Ana’s weights with SUMPRODUCT.' },
      { formula: '=SUMPRODUCT(B2:F2,$B$8:$F$8)/5', say: 'Dividing by the number of factors (5) is right only if the weights add to 5. Divide by their total, SUM($B$8:$F$8).' },
    ],
    hints: ['SUMPRODUCT multiplies the scores by the weights and adds the products.', '<x>=SUMPRODUCT(B2:F2,$B$8:$F$8)/SUM($B$8:$F$8)</x>.'],
    solution: `<x>=SUMPRODUCT(B2:F2,$B$8:$F$8)/SUM($B$8:$F$8)</x> gives ${weightedScore(FS.map((f) => f.map(r1)), W_ANA).map(f1).join(', ')} for ${NAMES.join(', ')}. Craft and local leads. Dividing by SUM keeps the result on 0–100 whatever scale the weights use.`,
  },
  {
    id: 'm05-es-g4', type: 'steps', kind: 'numerical',
    prompt: `Tarnwick Travel (fictional) compares adventure couples (A) with family groups (B) on four factors scored 0–100. A: size ${TT.a[0]}, spend ${TT.a[1]}, growth ${TT.a[2]}, fit ${TT.a[3]}. B: size ${TT.b[0]}, spend ${TT.b[1]}, growth ${TT.b[2]}, fit ${TT.b[3]}. The weights are ${TT.w.join(', ')}.`,
    solution: `Weighted sums: A = 3×70 + 3×100 + 2×60 + 2×90 = ${ttSum(TT.a)}; B = 3×100 + 3×65 + 2×80 + 2×70 = ${ttSum(TT.b)}; A leads by ${ttGap} (${f1(ttSum(TT.a) / 10)} against ${f1(ttSum(TT.b) / 10)}). B leads on size by 30 and on growth by 20. Size’s weight would tie them if it rose by 15 ÷ 30 = 0.5 (to 3.5); growth’s if it rose by 15 ÷ 20 = 0.75 (to 2.75). The lead is fragile.`,
    steps: [
      {
        id: 'm05-es-g4-s1', type: 'num',
        prompt: 'By how much does A’s weighted sum (Σ weight × score, before dividing by the total weight) exceed B’s?',
        answer: ttGap, check: () => (3 * 70 + 3 * 100 + 2 * 60 + 2 * 90) - (3 * 100 + 3 * 65 + 2 * 80 + 2 * 70), unit: 'points', places: 0, tol: 0.01,
        wrong: [
          { value: ttGap / 10, say: 'That is the gap after dividing by the total weight of 10. The threshold formula uses the weighted sums.' },
          { value: sum(TT.a) - sum(TT.b), say: 'Those are unweighted totals. Multiply each score by its weight first.' },
        ],
        hints: ['Weighted sum = Σ weight × score.', 'A: 3×70 + 3×100 + 2×60 + 2×90.'],
      },
      {
        id: 'm05-es-g4-s2', type: 'num',
        prompt: 'By how much would the weight on size have to rise, with the others unchanged, for B to draw level with A? Give two decimal places.',
        answer: 0.5, check: () => ttGap / (TT.b[0] - TT.a[0]), unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: ttGap / (TT.b[2] - TT.a[2]), say: 'That is the rise in growth’s weight (15 ÷ 20). For size, divide by B’s advantage on size, 100 − 70 = 30.' },
          { value: ttGap / TT.b[0], say: 'Divide by B’s advantage on size (100 − 70 = 30), not by B’s score.' },
          { value: 3.5, say: '3.5 is the new weight. The question asks for the rise: 3.5 − 3 = 0.5.' },
        ],
        hints: ['Δw = (T_A − T_B) ÷ (s_B − s_A) on the factor where B leads.', '15 ÷ (100 − 70).'],
      },
      {
        id: 'm05-es-g4-s3', type: 'mc',
        prompt: 'What should Tarnwick’s planner conclude?',
        options: [
          'Treat them as close: half a point more weight on size would tie them, so test those estimates',
          'Lean towards adventure couples: they lead on the planner’s own weights, which is usually enough',
          'Choose family groups, because the segment that leads on size will usually win in the end',
          'Re-run it with equal weights and adopt whichever segment wins then, as the more neutral answer',
        ],
        answer: 0,
        feedback: {
          1: 'A lead of 1.5 points that half a point more weight on size erases is too fragile to lean on.',
          2: 'Size is one factor; with these weights A leads. The point is how little it would take to change that.',
          3: 'Equal weights are a judgement too (that size matters exactly as much as fit). Swapping one set of weights for another doesn’t test how fragile the lead is.',
        },
        hints: ['Compare the threshold with the weights themselves.', 'A rise of 0.5 on a weight of 3 is a small change of judgement.'],
      },
    ],
  },
];

// ---------------------------------------------------------------- on your own
const goStrong = [1, -1, 0, 1, 0, 0, 1, 1];          // convenience marked average instead of weak
const goFitNew = needsFit([S.centres[GO]], goStrong)[0];
const fitData = { names: ['Dental practices', 'Veterinary clinics', 'Physiotherapists', 'Opticians', 'Hearing clinics'], fit: [0.62, -0.95, 0.10, 0.31, -0.40] };
const fitCells = { A1: 'Segment', B1: 'Fit (z)', C1: 'Fit score (0–100)', ...col('A', 2, fitData.names), ...col('B', 2, fitData.fit) };
const eqGap = wsum([1, 1, 1, 1, 1], CL) - wsum([1, 1, 1, 1, 1], EX);
const eqThr = 1 + eqGap / (FS[2][EX] - FS[2][CL]);

export const independent = [
  {
    id: 'm05-es-i1', type: 'num', kind: 'numerical',
    prompt: `On the go’s centre in standardised units is ${S.centres[GO].map((z, j) => `${['taste', 'price', 'convenience', 'sustainability', 'energy', 'health', 'local', 'novelty'][j]} ${z < 0 ? '−' : ''}${Math.abs(z).toFixed(2)}`).join(', ')}. Ana’s marks are +1 for taste, sustainability, local and novelty and −1 for price and convenience. If she decided Lantern is average on convenience (mark 0) rather than weak, what would On the go’s fit be? Give two decimal places.`,
    answer: r2(goFitNew), check: () => needsFit([S.centres[GO]], [1, -1, 0, 1, 0, 0, 1, 1])[0], unit: '', places: 2, tol: 0.011,
    wrong: [
      { value: r2(needsFit([S.centres[GO]], goStrong)[0] * 5 / 8), say: 'Divide by the number of marked needs, Σ|k| = 5, not by all eight needs.' },
      { value: r2(sum(S.centres[GO].map((z, j) => z * goStrong[j])) / 6), say: 'With convenience at 0 only five needs are marked, so Σ|k| is 5, not 6.' },
      { value: r2(sum(S.centres[GO].map((z, j) => z * goStrong[j]))), say: 'That is Σ z·k. Divide by Σ|k| = 5 to get the average match.' },
      { value: r2(fit[GO]), say: 'That is the fit with convenience marked weak (−1). Recompute with the mark at 0: both the sum and the divisor change.' },
    ],
    solution: `Σ z·k = (−0.35)(+1) + (−0.04)(−1) + 1.29 × 0 + (−0.64)(+1) + (−0.74)(+1) + (−0.31)(+1) ≈ ${m2(sum(S.centres[GO].map((z, j) => z * goStrong[j])))}; Σ|k| = 5; fit ≈ ${m2(goFitNew)}. It was ${m2(fit[GO])} with convenience marked weak: the segment’s love of convenience no longer counts against Lantern, but its low interest in local, sustainable and novel coffee still does. A fit that changes this much with one mark deserves a check against customers’ own ratings of Lantern.`,
  },
  {
    id: 'm05-es-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Each finding is about a segment a company is evaluating. Is it about the segment’s attractiveness, about its fit with this company, or a screen to apply before any scoring?',
    items: [
      'The segment spends $76 a head a month on the category.',
      'The segment rates taste highest, and taste is what the company’s staff are known for.',
      'A rival café chain already sits close to the segment’s ideal on the perceptual map.',
      'An energy-drink maker finds that most of a segment is under 16.',
      'The segment is expected to grow 9% a year for the next three years.',
      'Serving the segment would need an alcohol licence the company can’t obtain.',
      'The segment cares little about price, where the company is weak.',
    ],
    categories: ['Attractiveness', 'Fit with this company', 'A screen before scoring'],
    answer: [0, 1, 0, 2, 0, 2, 1],
    feedback: {
      0: 'Spending is part of size in money: attractive to any firm.',
      1: 'A match between what the segment wants and what this company is good at is fit.',
      2: 'Competition is part of attractiveness: it makes the segment harder for anyone new to win.',
      3: 'Marketing a high-caffeine drink to children fails an ethical screen however well the segment scores.',
      4: 'Growth is an attractiveness factor.',
      5: 'An all-or-nothing requirement the company can’t meet rules the segment out; scoring it would let other factors compensate.',
      6: 'Low interest in the company’s weakness improves fit.',
    },
    solution: 'Spending, competition and growth describe the segment for any firm: attractiveness. A match between the segment’s needs and the company’s strengths or weaknesses is fit. Under-16s for an energy drink and a licence the company can’t get are screens: they rule a segment out before a compensatory scorecard can average them away.',
  },
  {
    id: 'm05-es-i3', type: 'formula', kind: 'numerical',
    prompt: 'Sorrelbank Software (fictional) has worked out its fit with five clinic segments (column B, in z units; 0 = no better than average). In C2, turn fit into a score on which 50 means average and the segment with the largest fit in either direction sits at 0 or 100, in a formula that can be filled down to C6.',
    sheet: { cells: fitCells }, cell: 'C2', fill: 'C2:C6', answer: '=50+50*B2/MAX(ABS($B$2:$B$6))',
    alt: ['=50+50*B2/MAX(MAX($B$2:$B$6),-MIN($B$2:$B$6))', '=50*(1+B2/MAX(ABS($B$2:$B$6)))', '=50+50*B2/MAX(-MIN($B$2:$B$6),MAX($B$2:$B$6))', '=50+B2*50/MAX(ABS($B$2:$B$6))'],
    view: 'A1:C6', formats: { B: '0.00', C: '0.0' }, widths: { A: 20, B: 10, C: 18 },
    wrong: [
      { formula: '=50+50*B2/MAX($B$2:$B$6)', say: 'MAX finds the largest positive fit, 0.62, but veterinary clinics’ −0.95 is larger in size, so their score falls below 0. Scale by the largest absolute fit: MAX(ABS($B$2:$B$6)).' },
      { formula: '=100*B2/MAX($B$2:$B$6)', say: 'The ratio to the best only works for measures that can’t be negative: the negative fits score below 0. Centre on 50 instead.' },
      { formula: '=50+50*B2/MAX(ABS(B2:B6))', say: 'Without $ the range slides as you fill. Lock it: $B$2:$B$6.' },
      { formula: '=50+B2/MAX(ABS($B$2:$B$6))', say: 'Without the second 50 the scores stay between 49 and 51. Multiply the scaled fit by 50.' },
    ],
    solution: `<x>=50+50*B2/MAX(ABS($B$2:$B$6))</x> gives ${fitData.fit.map((v) => f1(50 + (50 * v) / mx(fitData.fit.map(Math.abs)))).join(', ')}: veterinary clinics, the furthest from average, take 0, and dental practices ${f1(50 + (50 * 0.62) / 0.95)}. <x>MAX(ABS(…))</x> evaluates the absolute values as an array (in Excel 2019 and earlier, enter it with Ctrl+Shift+Enter, or use <x>MAX(MAX(…),-MIN(…))</x>).`,
  },
  {
    id: 'm05-es-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Five segments’ shares of a market range from 18% to 21%. A planner scores size with min–max scaling, 100 × (share − smallest) ÷ (largest − smallest). What is the effect?',
    options: [
      'A 3-point range in shares becomes a 100-point range of scores, so size can swamp the other factors in the total',
      'The scores keep the shares’ proportions, so a segment with 18% scores about 86 against the 21% segment’s 100',
      'Size can no longer change the ranking, because min–max scaling puts every segment in the middle of the scale',
      'It is the same as the ratio to the best, because both methods give the largest segment a score of 100',
    ],
    answer: 0,
    feedback: {
      1: 'That describes the ratio to the best (18 ÷ 21 ≈ 0.86). Min–max gives the 18% segment 0.',
      2: 'The opposite: min–max spreads the segments across the whole 0–100 range.',
      3: 'Both give the largest 100, but min–max gives the smallest 0 rather than about 86.',
    },
    solution: 'Under min–max the 18% segment scores 0 and the 21% segment 100, so a difference of three percentage points carries as much weight as the biggest difference on any other factor. The ratio to the best gives 18 ÷ 21 × 100 ≈ 86 and 100, keeping the proportions. Choose the rule before scoring and say which you used.',
  },
  {
    id: 'm05-es-i5', type: 'mc', kind: 'applied',
    prompt: 'Four targeting plans, all for legal products. Using product harm and consumer vulnerability, which raises the most ethical concern?',
    options: [
      'A sports-drink brand sponsoring adult amateur running clubs',
      'A coffee roaster offering a loyalty card to the regulars of its own cafés',
      'A short-term lender advertising instant loans to people who have just missed a rent payment',
      'A bookshop sending reading lists for young children to the parents who signed up for its monthly newsletter',
    ],
    answer: 2,
    feedback: {
      0: 'A mild product and adults choosing to take part: little harm, little vulnerability.',
      1: 'A low-harm product offered to adults who already buy from the business.',
      3: 'The children are young, but the message goes to their parents, who asked for it, about a beneficial product.',
    },
    solution: 'Concern rises with both product harm and consumer vulnerability (Smith and Cooper-Martin, 1997). Expensive short-term credit can do serious harm, and people who have just missed a rent payment are under financial pressure, so the lender’s plan scores high on both. The other plans involve mild or beneficial products and audiences able to judge them.',
  },
  {
    id: 'm05-es-i6', type: 'num', kind: 'numerical',
    prompt: `With every weight equal to 1, Lantern’s weighted scores are Craft and local ${f1(weightedScore(FS, [1, 1, 1, 1, 1])[CL])} and Explorers ${f1(weightedScore(FS, [1, 1, 1, 1, 1])[EX])}, and Explorers leads on growth by ${f1(FS[2][EX] - FS[2][CL])} points (100 against ${f1(FS[2][CL])}). Holding the other four weights at 1, what weight on growth would make the two level? Give two decimal places.`,
    answer: r2(eqThr), check: () => 1 + (5 * (weightedScore(FS, [1, 1, 1, 1, 1])[CL] - weightedScore(FS, [1, 1, 1, 1, 1])[EX])) / (100 - FS[2][CL]), unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: r2(eqThr - 1), say: 'That is the rise in the weight. The weight itself goes from 1 to 1 plus the rise.' },
      { value: r2(1 + (weightedScore(FS, [1, 1, 1, 1, 1])[CL] - weightedScore(FS, [1, 1, 1, 1, 1])[EX]) / (100 - FS[2][CL])), say: 'You used the gap in the weighted scores (divided by the total weight of 5). The formula needs the gap in the weighted sums: 5 times as large.' },
    ],
    solution: `The weighted sums differ by 5 × (${f1(weightedScore(FS, [1, 1, 1, 1, 1])[CL])} − ${f1(weightedScore(FS, [1, 1, 1, 1, 1])[EX])}) ≈ ${f1(eqGap)}. Δw = ${f1(eqGap)} ÷ ${f1(FS[2][EX] - FS[2][CL])} ≈ ${f2(eqThr - 1)}, so growth’s weight would have to be about ${f2(eqThr)}, a little over twice each of the others. Check: with weights 1, 1, ${f2(eqThr)}, 1, 1 the two scores are equal.`,
  },
];

// ---------------------------------------------------------------- knowledge check
// Hollinmere Credit Union (fictional): one segment's scores and the weights
const HC = { s: [80, 55, 100, 40, 70], w: [3, 4, 1, 2, 5] };
const hcScore = sum(HC.s.map((s, k) => HC.w[k] * s)) / sum(HC.w);
// Cobbleford Cycles (fictional) margin pools with a margin per segment
const FHP = { names: ['Commuters', 'Club riders', 'Families', 'Students', 'Retired riders'], people: [1800, 600, 2400, 900, 700], spend: [240, 900, 150, 120, 310], margin: [0.42, 0.28, 0.35, 0.40, 0.33] };
const fhpCells = { A1: 'Segment', B1: 'Riders', C1: 'Spend per head ($ a year)', D1: 'Margin on what they buy', E1: 'Margin pool ($ a year)', ...col('A', 2, FHP.names), ...col('B', 2, FHP.people), ...col('C', 2, FHP.spend), ...col('D', 2, FHP.margin) };
// a pet-food maker (fictional): distances from four segments' ideals to the nearest rival
const PF = { names: ['Senior dogs', 'Puppies', 'Working dogs', 'Indoor cats'], room: [0.9, 1.6, 0.4, 2.0] };

export const check = [
  {
    id: 'm05-es-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A national café chain with outlets at every railway station and a single independent roaster study the same five segments of coffee drinkers. Why can each rationally choose a different target?',
    options: [
      'The segments’ sizes, spending and growth differ depending on which of the two firms measures them',
      'A segment’s attractiveness is the same for both, but its fit depends on each firm’s strengths',
      'The larger firm can usually afford the largest segment, so the smaller firm generally does better elsewhere',
      'Each firm should choose the segment its nearest rival has not targeted, whatever its own strengths',
    ],
    answer: 1,
    feedback: {
      0: 'Size, spending and growth are facts about the segment; they don’t change with who measures them (though estimates can differ).',
      2: 'Resources matter to fit, but the size of the firm doesn’t decide the target: the chain’s strengths may suit a different segment, and the roaster’s may suit the largest one.',
      3: 'Room from rivals is one factor of attractiveness. A gap your strengths can’t fill is no target.',
    },
    solution: 'Attractiveness (size, growth, profitability, competition, accessibility) is a property of the segment. Fit is a relation between the segment and a firm: a chain with outlets everywhere fits convenience-seekers, a roaster fits drinkers who care about taste and provenance. Same data, different best targets.',
  },
  {
    id: 'm05-es-k2', type: 'num', kind: 'numerical',
    prompt: `Hollinmere Credit Union (fictional) scores its self-employed members on five factors: size ${HC.s[0]}, margin ${HC.s[1]}, growth ${HC.s[2]}, room ${HC.s[3]}, fit ${HC.s[4]}. The weights are ${HC.w.join(', ')}. What is the segment’s weighted score? Give one decimal place.`,
    answer: r1(hcScore), check: () => (3 * 80 + 4 * 55 + 1 * 100 + 2 * 40 + 5 * 70) / (3 + 4 + 1 + 2 + 5), unit: '', places: 1, tol: 0.06,
    wrong: [
      { value: sum(HC.s.map((s, k) => HC.w[k] * s)), say: 'That is the weighted sum. Divide by the total weight, 15.' },
      { value: sum(HC.s) / 5, say: 'That is the plain average of the scores, which ignores the weights.' },
      { value: sum(HC.s.map((s, k) => HC.w[k] * s)) / 5, say: 'Divide by the total of the weights (15), not by the number of factors.' },
    ],
    solution: `Σ w × s = 3×80 + 4×55 + 1×100 + 2×40 + 5×70 = 240 + 220 + 100 + 80 + 350 = 990. Total weight = 15. Weighted score = 990 ÷ 15 = ${f1(hcScore)}.`,
  },
  {
    id: 'm05-es-k3', type: 'formula', kind: 'applied',
    prompt: 'Cobbleford Cycles (fictional) knows how many riders are in each segment (column B), what each spends a year (column C) and its margin on what that segment buys (column D, which differs because the segments buy different things). In E2, calculate the segment’s margin pool, in a formula that can be filled down to E6.',
    sheet: { cells: fhpCells }, cell: 'E2', fill: 'E2:E6', answer: '=B2*C2*D2',
    alt: ['=D2*B2*C2', '=PRODUCT(B2:D2)', '=B2*C2*D2/1'],
    view: 'A1:E6', formats: { B: '#,##0', C: '$#,##0', D: '0%', E: '$#,##0' }, widths: { A: 16, B: 9, C: 20, D: 20, E: 20 },
    wrong: [
      { formula: '=B2*C2', say: 'That is the segment’s spending. The margin pool keeps only the margin: multiply by D2.' },
      { formula: '=B2*C2*$D$2', say: 'With $D$2 every segment gets the commuters’ margin. Each segment has its own margin: D2, filled down.' },
      { formula: '=C2*D2', say: 'That is the margin on one rider’s spending. Multiply by the number of riders, B2.' },
    ],
    solution: `<x>=B2*C2*D2</x> gives $${FHP.people.map((p, i) => Math.round(p * FHP.spend[i] * FHP.margin[i]).toLocaleString('en-US')).join(', $')}. With one margin for everyone, club riders’ large spending would look better than it is: they buy expensive bikes on thin margins.`,
  },
  {
    id: 'm05-es-k4', type: 'mc', kind: 'applied',
    prompt: `A colleague tells Ana: “Craft and local scored ${f1(weightedScore(FS, W_ANA)[CL])} and Explorers ${f1(weightedScore(FS, W_ANA)[EX])}, so the matter is closed.” Growth’s weight would have to rise from 2 to about 7.5 (or size’s from 4 to about 18) for Explorers to draw level, and lowering fit, room or spend per head can’t do it. What is the best reply?`,
    options: [
      `Largely agreed: a ${f1(weightedScore(FS, W_ANA)[CL] - weightedScore(FS, W_ANA)[EX])}-point lead is wide, so no further work on it is needed`,
      'No: the two are effectively tied, because any lead that some change of weights can reverse is a tie',
      'Craft and local holds unless growth’s weight nearly quadruples, so test her growth estimate',
      'The scorecard helps less than it seems: with weights this subjective, Ana should rely mostly on her own judgement',
    ],
    answer: 2,
    feedback: {
      0: 'Wide, but it rests on one uncertain judgement: a growth weight nearly four times Ana’s reverses it, and her growth rates are her own estimates. Name that and test it.',
      1: 'Every lead can be reversed by some weights. What matters is how far they must move; here, a long way on growth, further still on size, and not at all by lowering the others.',
      3: 'The judgements are there either way; the sensitivity test turns them into a clear statement of what the decision rests on.',
    },
    solution: 'Of the single-weight changes, only growth’s weight nearly quadrupling or size’s rising past about 18 reverses the lead, and lowering the others never does. The useful reply names the judgement most likely to move, Ana’s growth estimates, and the evidence that would test it.',
  },
  {
    id: 'm05-es-k5', type: 'num', kind: 'numerical',
    prompt: `A pet-food maker (fictional) measures how far each of four segments’ ideal points sits from the nearest rival brand on its perceptual map: ${PF.names.map((nm, i) => `${nm.toLowerCase()} ${PF.room[i]}`).join(', ')}. It scores room as a ratio to the segment with the most room. What is the room score of puppies?`,
    answer: 80, check: () => (100 * PF.room[1]) / Math.max(...PF.room), unit: '', places: 0, tol: 0.5,
    wrong: [
      { value: 75, say: 'That is min–max scaling, (1.6 − 0.4) ÷ (2.0 − 0.4). The ratio to the best is 100 × 1.6 ÷ 2.0.' },
      { value: 25, say: 'More room is better, so divide puppies’ room by the largest, not the smallest by puppies’.' },
      { value: r2((100 * PF.room[1]) / sum(PF.room)), say: 'That divides by the sum of the four distances. Divide by the largest, 2.0.' },
    ],
    solution: 'Room is the distance from the segment’s ideal to the nearest rival: more is better. Ratio to the best: 100 × 1.6 ÷ 2.0 = 80. Working dogs, with a rival only 0.4 away, would score 20.',
  },
  {
    id: 'm05-es-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about a weighted segment scorecard are true? Select all that apply.',
    options: [
      'A strong score on one factor can make up for a failure on a must-have, so must-haves are screened first.',
      'Including the margin pool alongside size and spend per head counts size twice.',
      'Weights are relative: doubling every weight leaves every weighted score unchanged.',
      'A segment that leads by several points can usually be chosen without checking the threshold weights.',
      'The weights should be chosen after scoring, once it is clear which segments are close.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Several points can vanish with a small change of weights, as Tarnwick’s lead did; only the thresholds show whether a lead is robust.',
      4: 'Weights set after seeing the scores tend to crown a favourite. Set them from the objectives first, then test them.',
    },
    solution: 'True: the scorecard is compensatory, so screen must-haves first; the margin pool is size × spend, so adding it double-counts size; and dividing by the total weight makes the weights relative. False: the top score is not decisive when the lead is fragile, and weights belong before the scores.',
  },
];
