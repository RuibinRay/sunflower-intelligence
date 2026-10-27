// cluster-analysis.ex.js — M05 · Cluster analysis: widgets, practice and the knowledge check (answer keys live here).
// The two cluster widgets use all 640 respondents of Lantern's needs study (case.js RESPONDENTS); the distance worksheet
// uses the first 12 respondents' standardised needs and segment D's centre (DERIVED.segments.centres). Thistlewick Books,
// Pennacott Fitness, Wyncombe Travel and Saltmere Energy are fictional. Every num item's `check` recomputes its answer.
import { NEEDS, RESPONDENTS, DERIVED as D } from './case.js?v=22';
import { standardise } from '../../../core/classify.js?v=22';

const RS = RESPONDENTS, N = RS.length, P = NEEDS.length;
const r2 = (x) => Math.round(x * 100) / 100, r1 = (x) => Math.round(x * 10) / 10;
const mn = (v, d = 1) => v.toFixed(d).replace(/^-/, '−');                       // a real minus sign in prose
const f1k = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const E = (k) => D.elbow.find((e) => e.k === k);
const TSS = (N - 1) * P;

// ---------------------------------------------------------------- widgets
export const widgets = {
  'ca-needs': {
    type: 'cluster', title: `Lantern’s needs study: k-means on ${N} respondents’ eight needs`,
    rows: RS.map((r) => r.needs.slice()), vars: NEEDS.map((n) => n.label), k: 5, ks: [2, 3, 4, 5, 6, 7, 8],
    choose: true, raw: true, spend: RS.map((r) => r.spend),
    note: 'Each need was rated 1 (not at all important) to 7 (essential). Spend per head is monthly spend on coffee; it describes the segments and is not used to form them. Segments are lettered by size, largest first, as in the lesson.',
  },
  'ca-spend': {
    type: 'cluster', title: 'The same respondents with monthly spend added as a ninth variable',
    rows: RS.map((r) => [...r.needs, r.spend]), vars: [...NEEDS.map((n) => n.label), 'Monthly spend ($)'], k: 5, ks: [2, 3, 4, 5, 6, 7, 8],
    choose: true, raw: true, spend: RS.map((r) => r.spend), noun: ['variable', 'variables'],
    note: 'Monthly spend runs from $6 to $215, the needs from 1 to 7. Without standardising, a $10 difference in spend counts as much in the distances as a 10-point difference on a need, which no rating can reach.',
  },
};

// ---------------------------------------------------------------- guided practice
// Thistlewick Books (fictional): six customers, [staff recommendations, low price]
const TB = [[6, 2], [7, 2], [6, 1], [2, 6], [3, 7], [4, 4]];
const tbD2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const tbStart = [TB[1], TB[5]];
const tbLab = TB.map((p) => (tbD2(p, tbStart[0]) <= tbD2(p, tbStart[1]) ? 0 : 1));
const tbCentre = [0, 1].map((g) => { const m = TB.filter((_, i) => tbLab[i] === g); return [m.reduce((a, p) => a + p[0], 0) / m.length, m.reduce((a, p) => a + p[1], 0) / m.length]; });
const tbW = TB.reduce((a, p, i) => a + tbD2(p, tbCentre[tbLab[i]]), 0);
const tbW0 = TB.reduce((a, p, i) => a + (tbLab[i] === 0 ? tbD2(p, tbCentre[0]) : 0), 0);
// the distance worksheet: the first 12 respondents in z-scores, and segment D's centre
const Z = standardise(NEEDS.map((_, j) => RS.map((r) => r.needs[j]))).rows;
const KEYS = NEEDS.map((n) => n.key);
const COLS = 'BCDEFGHI'.split('');
const distCells = { A1: 'respondent', ...Object.fromEntries(COLS.map((c, j) => [`${c}1`, KEYS[j]])), J1: 'squared distance to D', A15: 'segment', A16: 'D centre' };
Z.slice(0, 12).forEach((row, i) => { distCells[`A${i + 2}`] = RS[i].id; row.forEach((v, j) => { distCells[`${COLS[j]}${i + 2}`] = r2(v); }); });
const CD = D.segments.centres[3].map(r2);
CD.forEach((v, j) => { distCells[`${COLS[j]}16`] = v; });
const dist1 = COLS.reduce((a, _, j) => a + (r2(Z[0][j]) - CD[j]) ** 2, 0);
const nearestOf12 = Z.slice(0, 12).map((row) => row.reduce((a, v, j) => a + (r2(v) - CD[j]) ** 2, 0));
// Pennacott Fitness (fictional): a member's silhouette and the elbow table
const TF = { a: 1.8, b2: 3.0, b3: 4.5, b4: 3.6 };
const TFK = [[2, 2180, 0.24], [3, 1760, 0.26], [4, 1410, 0.29], [5, 1330, 0.25], [6, 1262, 0.23], [7, 1201, 0.22]];
const TF_N = 500, TF_P = 6, TF_T = (TF_N - 1) * TF_P;

export const guided = [
  {
    id: 'm05-ca-g1', type: 'steps', kind: 'numerical',
    prompt: 'Thistlewick Books (fictional) asked six customers how much two things matter, from 1 to 7: staff recommendations and a low price. Run k-means with k = 2 from starting centres at customers K2 and K6. Ratings are given as (staff recommendations, low price).',
    data: { table: { head: ['Customer', 'Staff recommendations', 'Low price'], align: ['l', 'r', 'r'], rows: TB.map((p, i) => [`K${i + 1}`, String(p[0]), String(p[1])]) } },
    solution: `Assign: K1, K2 and K3 join K2 (squared distances 1, 0 and 2, against 8, 13 and 13 to K6); K4, K5 and K6 join K6 (8, 10 and 0, against 41, 41 and 13). Update: K2’s group moves to (${tbCentre[0].map((v) => v.toFixed(2)).join(', ')}) and K6’s to (${tbCentre[1].map((v) => v.toFixed(2)).join(', ')}). WCSS = ${tbW0.toFixed(2)} + ${(tbW - tbW0).toFixed(2)} = ${tbW.toFixed(2)}. A second assignment moves no one (K6, the closest call, is 10.89 from the first centre and 3.78 from the second), so k-means stops after one update.`,
    steps: [
      {
        id: 'm05-ca-g1-s1', type: 'num',
        prompt: 'Calculate the squared Euclidean distance from customer K5 (3, 7) to the starting centre K2 (7, 2).',
        answer: tbD2(TB[4], tbStart[0]), check: () => (3 - 7) ** 2 + (7 - 2) ** 2, unit: '', places: 0, tol: 0.01,
        wrong: [
          { value: 9, say: 'That adds the differences (4 + 5) without squaring them. Square each difference first: 4² + 5².' },
          { value: r2(Math.sqrt(41)), say: 'That is the ordinary Euclidean distance, the square root. k-means compares squared distances: leave out the square root.' },
          { value: 1, say: 'The differences have opposite signs (3 − 7 = −4 and 7 − 2 = 5), but squaring makes both positive: 16 + 25.' },
        ],
        hints: ['Square the difference on each need and add the squares.', '(3 − 7)² + (7 − 2)² = 16 + 25.'],
      },
      {
        id: 'm05-ca-g1-s2', type: 'mc',
        prompt: 'In the first assign move, which customers join the centre at K6 (4, 4)?',
        options: ['K4, K5 and K6', 'K6 only', 'K5 and K6 only', 'K1, K4, K5 and K6'],
        answer: 0,
        feedback: {
          1: 'K6 is the centre, but customers join whichever centre is nearer: K4 is 8 from K6 and 41 from K2, and K5 is 10 from K6 and 41 from K2.',
          2: 'K4 (2, 6) is 8 from K6 and 41 from K2, so it joins K6 too.',
          3: 'K1 (6, 2) is 1 from K2 and 8 from K6: it joins K2.',
        },
        hints: ['Compare each customer’s squared distance to (7, 2) and to (4, 4).', 'K4: 41 against 8; K5: 41 against 10; K1: 1 against 8.'],
      },
      {
        id: 'm05-ca-g1-s3', type: 'num',
        prompt: 'Update move: what is the new centre of K6’s group on low price? Give two decimal places.',
        answer: r2(tbCentre[1][1]), check: () => (6 + 7 + 4) / 3, unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: 4, say: 'That is the starting centre. The update moves the centre to the mean of its members: K4, K5 and K6.' },
          { value: 6.5, say: 'That leaves out K6 itself. A starting customer is a member of its own group: (6 + 7 + 4) ÷ 3.' },
          { value: 3, say: 'That is the new centre on staff recommendations, (2 + 3 + 4) ÷ 3. On low price, average 6, 7 and 4.' },
        ],
        hints: ['A centre is the mean of its members on each need.', 'Low price for K4, K5 and K6: (6 + 7 + 4) ÷ 3.'],
      },
      {
        id: 'm05-ca-g1-s4', type: 'num',
        prompt: `After the update, the centres are (${tbCentre[0].map((v) => v.toFixed(2)).join(', ')}) and (${tbCentre[1].map((v) => v.toFixed(2)).join(', ')}). Calculate the within-cluster sum of squares. Give two decimal places.`,
        answer: r2(tbW), check: () => TB.reduce((a, p, i) => a + tbD2(p, tbCentre[i < 3 ? 0 : 1]), 0), unit: '', places: 2, tol: 0.02,
        wrong: [
          { value: r2(tbW0), say: 'That is K2’s group alone. Add the squared distances in K6’s group too.' },
          { value: r2(tbW - tbW0), say: 'That is K6’s group alone. The WCSS adds both groups.' },
          { value: r2(TB.reduce((a, p, i) => a + Math.sqrt(tbD2(p, tbCentre[i < 3 ? 0 : 1])), 0)), say: 'That adds ordinary distances. The WCSS adds squared distances.' },
        ],
        hints: ['Square each customer’s distance to their own group’s centre and add all six.', `K2’s group gives ${tbW0.toFixed(2)}; K6’s group: K4 1.11, K5 1.78, K6 3.78.`],
      },
    ],
  },
  {
    id: 'm05-ca-g2', type: 'formula', kind: 'numerical',
    prompt: 'Rows 2 to 13 hold twelve of Lantern’s respondents’ standardised needs (z-scores) and row 16 the centre of segment D. In J2, calculate the squared Euclidean distance from the respondent in row 2 to segment D’s centre, in a formula that can be filled down to J13.',
    sheet: { cells: distCells }, cell: 'J2', fill: 'J2:J13',
    answer: '=SUMPRODUCT((B2:I2-$B$16:$I$16)^2)',
    alt: ['=SUMSQ(B2:I2-$B$16:$I$16)', '=SUMPRODUCT((B2:I2-B$16:I$16)^2)', '=SUMPRODUCT(B2:I2-$B$16:$I$16,B2:I2-$B$16:$I$16)', '=SUMPRODUCT(($B$16:$I$16-B2:I2)^2)', '=SUMSQ(B2:I2-B$16:I$16)'],
    view: 'A1:J16', formats: { B: '0.00', C: '0.00', D: '0.00', E: '0.00', F: '0.00', G: '0.00', H: '0.00', I: '0.00', J: '0.00' },
    widths: { A: 11, J: 20 },
    wrong: [
      { formula: '=SUMPRODUCT((B2:I2-B16:I16)^2)', say: 'Right in J2, but without $ the centre’s row slides down as you fill: J3 compares row 3 with row 17, which is empty. Lock the centre: $B$16:$I$16.' },
      { formula: '=SUM(B2:I2-$B$16:$I$16)', say: 'Without squaring, positive and negative differences cancel. Square each difference before adding: SUMPRODUCT((…)^2).' },
      { formula: '=SQRT(SUMPRODUCT((B2:I2-$B$16:$I$16)^2))', say: 'That is the ordinary Euclidean distance. k-means works with the squared distance: leave out SQRT.' },
      { formula: '=SUMPRODUCT(B2:I2-$B$16:$I$16)^2', say: 'That squares the total of the differences, so they cancel first. Square each difference inside: SUMPRODUCT((B2:I2-$B$16:$I$16)^2).' },
    ],
    hints: ['Subtract the centre from the respondent need by need, square, and add.', 'SUMPRODUCT handles the arrays: <x>=SUMPRODUCT((B2:I2-$B$16:$I$16)^2)</x>, with the centre locked.'],
    solution: `<x>=SUMPRODUCT((B2:I2-$B$16:$I$16)^2)</x> filled down gives ${r2(dist1)} for ${RS[0].id}; across the twelve the distances run from ${Math.min(...nearestOf12).toFixed(2)} to ${Math.max(...nearestOf12).toFixed(2)}. <x>=SUMSQ(B2:I2-$B$16:$I$16)</x> does the same. The typing tool in <i>Profiling segments</i> repeats this for every segment’s centre and picks the nearest.`,
  },
  {
    id: 'm05-ca-g3', type: 'steps', kind: 'numerical',
    prompt: `Pennacott Fitness (fictional) segmented its members into four segments. One member’s average distance to the other members of her own segment is ${TF.a}; her average distances to the members of the other three segments are ${TF.b2.toFixed(1)}, ${TF.b3} and ${TF.b4}.`,
    solution: `b is the nearer of the other segments: ${TF.b2.toFixed(1)}. s = (${TF.b2.toFixed(1)} − ${TF.a}) ÷ max(${TF.a}, ${TF.b2.toFixed(1)}) = 1.2 ÷ 3.0 = ${((TF.b2 - TF.a) / TF.b2).toFixed(2)}: she sits fairly well inside her segment. A negative silhouette means a member is on average closer to another segment than to her own.`,
    steps: [
      {
        id: 'm05-ca-g3-s1', type: 'num',
        prompt: 'What is b, the value the silhouette compares with her own segment?',
        answer: TF.b2, check: () => Math.min(TF.b2, TF.b3, TF.b4), unit: '', places: 1, tol: 0.01,
        wrong: [
          { value: TF.b3, say: 'b is the nearest other segment, not the farthest: the question is how far she is from the segment she would most plausibly belong to instead.' },
          { value: r1((TF.b2 + TF.b3 + TF.b4) / 3), say: 'b doesn’t average the other segments. It is the lowest of their average distances.' },
          { value: TF.a, say: 'That is a, the distance within her own segment.' },
        ],
        hints: ['b is the average distance to the members of the nearest other segment.', 'The lowest of 3.0, 4.5 and 3.6.'],
      },
      {
        id: 'm05-ca-g3-s2', type: 'num',
        prompt: 'Calculate her silhouette. Give two decimal places.',
        answer: r2((TF.b2 - TF.a) / TF.b2), check: () => (3.0 - 1.8) / Math.max(1.8, 3.0), unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: r2((TF.b3 - TF.a) / TF.b3), say: 'That uses the farther segment (4.5). The silhouette uses the nearest other segment, 3.0.' },
          { value: r2((TF.b2 - TF.a) / TF.a), say: 'Divide by the larger of a and b, here b = 3.0, not by a. That keeps the silhouette between −1 and 1.' },
          { value: r2(TF.b2 - TF.a), say: 'That is the difference b − a. Divide it by max(a, b) to put it on a scale from −1 to 1.' },
        ],
        hints: ['s = (b − a) ÷ max(a, b).', '(3.0 − 1.8) ÷ 3.0.'],
      },
      {
        id: 'm05-ca-g3-s3', type: 'mc',
        prompt: 'Another member’s silhouette is −0.20. What does that tell Pennacott?',
        options: [
          'He is nearer, on average, to another segment’s members than to his own',
          'He is a poor prospect for the gym and should be left out of the segmentation entirely',
          'His segment is too small: a silhouette below 0 always means a segment of one member',
          'He answered carelessly, since a negative silhouette shows answers that were never read',
        ],
        answer: 0,
        feedback: {
          1: 'The silhouette is about where he sits among the segments, not about his value to the gym.',
          2: 'A member alone in a segment scores 0 by convention, not a negative number. A negative silhouette means b is smaller than a.',
          3: 'A silhouette says nothing about how carefully someone answered; it compares distances.',
        },
        hints: ['A negative silhouette means b − a is negative.', 'b smaller than a: the nearest other segment is closer than his own.'],
      },
    ],
  },
  {
    id: 'm05-ca-g4', type: 'steps', kind: 'applied',
    prompt: `Pennacott Fitness surveyed ${TF_N} members on six needs (class variety, opening hours, price, personal training, quiet space, social events), standardised them and ran k-means for k = 2 to 7.`,
    data: { table: { head: ['k', 'Within-cluster sum of squares', 'Mean silhouette'], align: ['r', 'r', 'r'], rows: TFK.map(([k, w, s]) => [String(k), w.toLocaleString('en-US'), s.toFixed(2)]) } },
    solution: `With six standardised needs the total sum of squares is (500 − 1) × 6 = ${TF_T.toLocaleString('en-US')}, so four segments leave 1 − 1,410 ÷ 2,994 = ${(100 * (1 - 1410 / TF_T)).toFixed(1)}% of the variation between segments. The falls are 420, 350, then 80, 68 and 61: the elbow is at four, where the silhouette also peaks. Before adopting four, Pennacott should read the four profiles (do they call for different offers?) and check stability (restarts, Ward’s method, a split-half test).`,
    steps: [
      {
        id: 'm05-ca-g4-s1', type: 'num',
        prompt: 'What percentage of the variation in the six needs lies between segments when k = 4? Give one decimal place.',
        answer: r1(100 * (1 - 1410 / TF_T)), check: () => 100 * (1 - 1410 / ((500 - 1) * 6)), unit: '%', places: 1, tol: 0.05,
        wrong: [
          { value: r1(100 * 1410 / TF_T), say: 'That is the share within segments, W ÷ T. The share between is 1 − W ÷ T.' },
          { value: r1(100 * (1 - 1410 / 3000)), say: 'Standardised variables have a sum of squares of n − 1 each, not n: T = 499 × 6 = 2,994.' },
          { value: r1(100 * (1 - 1410 / 2180)), say: 'That compares four segments with two. The share of variation compares W with the total sum of squares, the WCSS for one segment.' },
        ],
        hints: ['Share between = 1 − W ÷ T, with T = (n − 1) × p for standardised variables.', 'T = 499 × 6 = 2,994; 1 − 1,410 ÷ 2,994.'],
      },
      {
        id: 'm05-ca-g4-s2', type: 'mc',
        prompt: 'Where is the elbow?',
        options: ['At k = 4: the falls are 420 and 350, then only 80, 68 and 61', 'At k = 2, where the within-cluster sum of squares is largest', 'At k = 7, where the within-cluster sum of squares is smallest', 'There is none, because the sum falls at every k'],
        answer: 0,
        feedback: {
          1: 'The largest WCSS is the worst fit; the elbow is where extra segments stop paying off.',
          2: 'The WCSS is always smallest at the largest k. The elbow is where the falls shrink.',
          3: 'It always falls; the question is where the falls become small. Here that happens after k = 4.',
        },
        hints: ['Work out the fall from each k to the next.', '2 to 3: 420; 3 to 4: 350; 4 to 5: 80.'],
      },
      {
        id: 'm05-ca-g4-s3', type: 'mc',
        prompt: 'The silhouette also peaks at four. What should Pennacott do before adopting four segments?',
        options: [
          'Check that the four profiles call for different offers and that restarts, Ward and a split half agree',
          'Nothing: when the elbow and the silhouette agree, the number of segments in the market is proven beyond doubt',
          'Add age and income as segmentation variables, to make the four segments easier to reach',
          'Run k = 8, 9 and 10 as well, in case a later elbow appears',
        ],
        answer: 0,
        feedback: {
          1: 'Agreement between two statistics narrows the choice; it doesn’t prove the market has four segments, and a silhouette of 0.29 is weak structure on Kaufman and Rousseeuw’s rough scale.',
          2: 'Demographics describe segments afterwards; mixed into the clustering they make the segments part need, part demographic.',
          3: 'The WCSS keeps falling at any k; with falls of 61–80 already, more segments buy little.',
        },
        hints: ['Statistics narrow the choice; meaning and stability decide.', 'What would make four segments usable for planning offers?'],
      },
    ],
  },
];

// ---------------------------------------------------------------- on your own
// the update move in Excel: twelve respondents, two standardised needs, current segment letters
const UP = [[1.2, -0.8, 'A'], [0.9, -1.1, 'A'], [1.5, -0.4, 'A'], [-0.7, 1.3, 'B'], [-1.1, 0.8, 'B'], [-0.4, 1.6, 'B'], [-0.9, 1.1, 'B'], [0.2, 0.1, 'C'], [0.4, -0.2, 'C'], [-0.1, 0.3, 'C'], [0.3, 0.4, 'C'], [1.1, -0.9, 'A']];
const upCells = { A1: 'respondent', B1: 'need 1 (z)', C1: 'need 2 (z)', D1: 'segment', F1: 'segment', G1: 'centre: need 1', H1: 'centre: need 2', F2: 'A', F3: 'B', F4: 'C' };
UP.forEach(([a, b, s], i) => Object.assign(upCells, { [`A${i + 2}`]: `P${String(i + 1).padStart(2, '0')}`, [`B${i + 2}`]: a, [`C${i + 2}`]: b, [`D${i + 2}`]: s }));
const upMean = (s, j) => { const m = UP.filter((r) => r[2] === s); return m.reduce((a, r) => a + r[j], 0) / m.length; };

export const independent = [
  {
    id: 'm05-ca-i1', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a needs-based k-means segmentation in order.',
    items: [
      'Choose the needs to segment on and leave the demographics for describing',
      'Standardise each need to mean 0 and standard deviation 1',
      'Pick k starting centres with k-means++',
      'Assign every respondent to the nearest centre',
      'Move each centre to the mean of its members',
      'Repeat assign and update until no respondent moves, then repeat the whole run from many starts and keep the lowest WCSS',
    ],
    solution: 'Variables, then scale, then the algorithm: start, assign, update, repeat until nothing moves, and restart many times. Choosing k and checking stability come after.',
  },
  {
    id: 'm05-ca-i2', type: 'mc', kind: 'conceptual',
    prompt: 'A colleague runs k-means with k = 4 on a customer survey and reports: “The data show that our market has four segments of similar size.” What is the best reply?',
    options: [
      'k-means returns four groups from any data; compare the silhouette with a no-structure benchmark and check the elbow, stability and meaning',
      'The claim is safe as long as k-means was run with k-means++ starts and the solution with the lowest WCSS was kept',
      'Four segments of similar size are what real markets usually contain, so the result looks plausible',
      'The claim would hold if the within-cluster sum of squares for k = 4 were lower than for k = 3',
    ],
    answer: 0,
    feedback: {
      1: 'Good starts find the best four-group solution; they don’t show that four groups exist. Random data also give four groups.',
      2: 'Real markets have no typical number or size of segments, and natural segments are rare in consumer data.',
      3: 'The WCSS is always lower for more segments, so that comparison can’t show anything.',
    },
    solution: 'k-means always returns k groups, even from random ratings (Lantern’s benchmark gave five groups of 121 to 138). Evidence for four needs the elbow, a silhouette clearly above what structureless data give, stability across restarts, methods and halves, and segments that mean something different.',
  },
  {
    id: 'm05-ca-i3', type: 'num', kind: 'numerical',
    prompt: `Lantern’s ${N} respondents rated eight needs, standardised before clustering. With three segments the within-cluster sum of squares is ${f1k(E(3).inertia)}. What percentage of the variation in the needs lies between the three segments? Give one decimal place.`,
    answer: r1(100 * (1 - E(3).inertia / TSS)), check: () => 100 * (1 - E(3).inertia / ((640 - 1) * 8)), unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1(100 * E(3).inertia / TSS), say: 'That is the share within segments, W ÷ T. Between segments is 1 − W ÷ T.' },
      { value: r1(100 * (1 - E(3).inertia / (640 * 8))), say: 'A standardised variable’s sum of squares is n − 1 = 639, not 640: T = 639 × 8 = 5,112.' },
      { value: r1(100 * (1 - E(3).inertia / E(2).inertia)), say: 'That compares three segments with two. Compare with the total sum of squares, the WCSS of one segment.' },
    ],
    solution: `T = (640 − 1) × 8 = ${TSS.toLocaleString('en-US')}. 1 − ${f1k(E(3).inertia)} ÷ ${TSS.toLocaleString('en-US')} = ${(100 * (1 - E(3).inertia / TSS)).toFixed(1)}%. Five segments raise it to ${(100 * (1 - E(5).inertia / TSS)).toFixed(1)}%.`,
  },
  {
    id: 'm05-ca-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Which method does each statement describe: k-means, Ward’s method, or both (as taught in this lesson)?',
    items: [
      'You must choose the number of segments before it runs.',
      'One run shows every number of segments at once, in a dendrogram.',
      'Once two groups are merged, they are never separated again.',
      'A different starting point can give a different answer.',
      'It measures how far apart respondents are by squared Euclidean distance on standardised needs.',
      'Every step it takes keeps the within-cluster sum of squares as low as that step can.',
    ],
    categories: ['k-means', 'Ward’s method', 'Both'],
    answer: [0, 1, 1, 0, 2, 2],
    feedback: {
      0: 'k-means needs k first; Ward’s tree can be cut at any k afterwards.',
      2: 'Ward’s method never undoes a merge; k-means moves respondents freely between iterations.',
      3: 'k-means depends on its starting centres, which is why it is restarted. Ward’s method has no random start.',
      4: 'Both, as taught here, work with squared Euclidean distances on standardised variables.',
      5: 'k-means’ assign and update moves each lower the WCSS; Ward’s method merges the pair that raises it least.',
    },
    solution: 'k-means: needs k, depends on its start. Ward: shows every k in one tree, never undoes a merge. Both: squared Euclidean distance on standardised variables, and each step keeps the WCSS as low as it can (k-means lowers it, Ward raises it least).',
  },
  {
    id: 'm05-ca-i5', type: 'multi', kind: 'applied',
    prompt: 'Wyncombe Travel (fictional) wants to segment its customers on what they want from a holiday, from a survey of 900 past customers. Which variables should go into the clustering? Select all that apply.',
    options: [
      'Importance of relaxing on a beach (1–7)',
      'Importance of culture and history (1–7)',
      'Importance of adventure and activity (1–7)',
      'Importance of a low price (1–7)',
      'Importance of a low price (1–7), asked again at the end of the survey as a consistency check',
      'Customer’s age',
      'Amount spent with Wyncombe last year ($)',
      'Region of the country the customer lives in',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'That repeats the low-price item, so the price need would count twice in every distance. Use the check to clean the data, not as a second variable.',
      5: 'Age describes who is in each segment afterwards; mixed in, it makes segments part need, part demographic.',
      6: 'Spend is behaviour, a descriptor. In dollars and unstandardised it would also dominate the distances.',
      7: 'Region describes and helps reach the segments; it isn’t a need.',
    },
    solution: 'The four distinct needs form the segments: four variables, so 900 customers are well above the guideline of about 100 per variable. The repeated price item serves only to check the answers; age, spend and region are kept for profiling and describing the segments.',
  },
  {
    id: 'm05-ca-i6', type: 'formula', kind: 'numerical',
    prompt: 'A k-means run (fictional) has just made an assign move: column D holds each respondent’s segment. In G2, write the update move for segment A (in F2) on need 1: the centre’s coordinate, in a formula that can be filled across to H2 and down to H4.',
    sheet: { cells: upCells }, cell: 'G2', fill: 'G2:H4',
    answer: '=AVERAGEIFS(B$2:B$13,$D$2:$D$13,$F2)',
    alt: ['=AVERAGEIF($D$2:$D$13,$F2,B$2:B$13)', '=SUMIFS(B$2:B$13,$D$2:$D$13,$F2)/COUNTIF($D$2:$D$13,$F2)'],
    view: 'A1:H13', formats: { B: '0.00', C: '0.00', G: '0.00', H: '0.00' }, widths: { A: 11, B: 11, C: 11, F: 9, G: 15, H: 15 },
    wrong: [
      { formula: '=AVERAGEIFS($B$2:$B$13,$D$2:$D$13,$F2)', say: 'Locking column B means H2 also averages need 1. Leave the column free (B$2:B$13) so it becomes C when filled across.' },
      { formula: '=AVERAGE(B$2:B$13)', say: 'That is the mean of everyone, the same for every segment. The centre is the mean of the segment’s members only.' },
      { formula: '=AVERAGEIFS(B2:B13,D2:D13,F2)', say: 'Right in G2, but without $ the ranges slide when filled. Lock the rows of the data, the whole segment column and the label’s column.' },
    ],
    hints: ['A centre is its members’ mean: AVERAGEIFS with the segment as the criterion.', 'Mixed references: B$2:B$13 moves across, $D$2:$D$13 stays, $F2 keeps the label column.'],
    solution: `<x>=AVERAGEIFS(B$2:B$13,$D$2:$D$13,$F2)</x> filled to H4 gives A (${mn(upMean('A', 0), 2)}, ${mn(upMean('A', 1), 2)}), B (${mn(upMean('B', 0), 2)}, ${mn(upMean('B', 1), 2)}) and C (${mn(upMean('C', 0), 2)}, ${mn(upMean('C', 1), 2)}). The next assign move compares every respondent with these three centres.`,
  },
];

// ---------------------------------------------------------------- knowledge check
const K2A = [0.8, -1.2, 0.5, 1.5], K2B = [-0.4, -0.2, 1.1, 0.3];
const k2d = K2A.reduce((a, v, j) => a + (v - K2B[j]) ** 2, 0);
const WA = { n: 3, c: [1.0, -0.5] }, WB = { n: 2, c: [-0.5, 0.5] };
const wd2 = (WA.c[0] - WB.c[0]) ** 2 + (WA.c[1] - WB.c[1]) ** 2;
const wDelta = (WA.n * WB.n) / (WA.n + WB.n) * wd2;

export const check = [
  {
    id: 'm05-ca-k1', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst adds each respondent’s monthly coffee spend, in dollars, to eight 1–7 need ratings and runs k-means without standardising. The five segments turn out to be spend bands. Why?',
    options: [
      'Spend’s spread in dollars dwarfs the ratings’, so it dominates every distance',
      'Spend is the most important variable for Lantern, so k-means rightly gives it the most weight',
      'k-means sorts by the last variable in the data first, and spend was the last one added',
      'The needs have no real differences between respondents, so spend is all that is left',
    ],
    answer: 0,
    feedback: {
      1: 'k-means has no idea what matters to the business: every variable’s weight comes from its spread. Spend dominates because of its units, not its importance.',
      2: 'Order doesn’t matter: the distance adds the squared differences on every variable.',
      3: 'Without spend, the needs give five clear segments. They are drowned out, not absent.',
    },
    solution: 'Distances add squared differences, so the variable with the widest spread dominates. Spend’s variance is about 50 times that of the eight needs together, so the segments sort people by spend. Standardising each variable first gives each the same weight.',
  },
  {
    id: 'm05-ca-k2', type: 'num', kind: 'numerical',
    prompt: `Two respondents’ standardised ratings on four needs are (${K2A.map((v) => mn(v)).join(', ')}) and (${K2B.map((v) => mn(v)).join(', ')}). Calculate the squared Euclidean distance between them. Give two decimal places.`,
    answer: r2(k2d), check: () => (0.8 + 0.4) ** 2 + (-1.2 + 0.2) ** 2 + (0.5 - 1.1) ** 2 + (1.5 - 0.3) ** 2, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(Math.sqrt(k2d)), say: 'That is the Euclidean distance, the square root. The squared distance stops before the root.' },
      { value: r2(K2A.reduce((a, v, j) => a + (v - K2B[j]), 0)), say: 'That adds the differences without squaring them, so they partly cancel. Square each difference first.' },
      { value: r2(K2A.reduce((a, v, j) => a + Math.abs(v - K2B[j]), 0)), say: 'That adds absolute differences, the city-block distance. Square each difference instead.' },
    ],
    solution: `Differences: 1.2, −1.0, −0.6, 1.2. Squares: 1.44, 1.00, 0.36, 1.44. Sum: ${k2d.toFixed(2)}.`,
  },
  {
    id: 'm05-ca-k3', type: 'mc', kind: 'applied',
    prompt: 'Saltmere Energy (fictional) segmented 2,400 households on seven needs. The mean silhouette peaks at three segments (0.28); the elbow is at five. At five, one large segment splits into households that want help cutting their bills and households that want green tariffs, which call for different products. Split-half agreement (adjusted Rand index) is 0.93 at five and 0.55 at six. Which choice is best supported?',
    options: [
      'Six, because a further split could only make the segments more homogeneous',
      'Three, because the highest mean silhouette is the statistically correct number of segments to choose',
      'Five: the elbow, a split that calls for different products and good stability all point there',
      'Seven, because one segment per need makes each segment easiest to name',
    ],
    answer: 2,
    feedback: {
      0: 'Six is unstable (0.55): half the sample gives noticeably different segments, so it can’t be planned around.',
      1: 'The silhouette tends to favour a few large groups and is one guide among several; here three would merge two groups that need different products.',
      3: 'Segments are groups of households with similar combinations of needs, not one need each; seven was not even supported by the statistics.',
    },
    solution: 'Five sits at the elbow, splits a segment into two groups that need different products, and is stable (0.93). Three has the higher silhouette but merges those groups; six is unstable.',
  },
  {
    id: 'm05-ca-k4', type: 'num', kind: 'numerical',
    prompt: `In Ward’s method, group A has ${WA.n} respondents with centre (${WA.c.map((v) => mn(v)).join(', ')}) and group B has ${WB.n} with centre (${WB.c.map((v) => mn(v)).join(', ')}), in standardised units. By how much would merging them increase the within-cluster sum of squares? Give two decimal places.`,
    answer: r2(wDelta), check: () => (3 * 2) / (3 + 2) * ((1.0 + 0.5) ** 2 + (-0.5 - 0.5) ** 2), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(wd2), say: 'That is the squared distance between the centres alone. Multiply by n_A n_B ÷ (n_A + n_B) = 6 ÷ 5.' },
      { value: r2(wd2 / 2), say: 'Half the squared distance is the cost for two single respondents. For groups of 3 and 2 the weight is 3 × 2 ÷ 5 = 1.2.' },
      { value: r2(WA.n * WB.n * wd2), say: 'Divide n_A n_B by n_A + n_B: the weight is 6 ÷ 5, not 6.' },
    ],
    solution: `Squared distance between the centres: 1.5² + 1.0² = ${wd2.toFixed(2)}. Weight: 3 × 2 ÷ (3 + 2) = 1.2. Increase: 1.2 × ${wd2.toFixed(2)} = ${wDelta.toFixed(2)}.`,
  },
  {
    id: 'm05-ca-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are evidence that a five-segment solution is stable? Select all that apply.',
    options: [
      'Most of 100 runs from different starting centres reach the same lowest WCSS.',
      'Ward’s method cut at five segments agrees closely with k-means (adjusted Rand index 0.93).',
      'Segmenting each half of the sample separately gives nearly the same assignments (adjusted Rand index 0.97).',
      'The five-segment solution has a lower within-cluster sum of squares than the four-segment one.',
      'The mean silhouette at k = 5 is higher than at k = 4 and k = 6.',
      'Each of the five segments has more than 100 respondents.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A lower WCSS for more segments is guaranteed and says nothing about stability.',
      4: 'A local peak in the silhouette supports choosing five; it doesn’t show the segments would reappear in another run, method or sample.',
      5: 'Size matters for whether a segment is substantial, not for whether the solution is stable.',
    },
    solution: 'Stability means the segments reappear: across starts, across methods and across halves of the sample. The WCSS, the silhouette and the sizes help choose and judge the segments, but don’t test whether they would reappear.',
  },
  {
    id: 'm05-ca-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about k-means and the silhouette.',
    text: 'k-means always returns [[0]], whatever the data. Each assign move and each update move can only [[1]] the within-cluster sum of squares. A respondent with a silhouette near 0 sits [[2]], and a mean silhouette can be compared only between solutions on [[3]].',
    blanks: [
      { options: ['the number of segments the market contains', 'as many groups as there are needs', 'the k groups you asked for'], answer: 2 },
      { options: ['lower it or leave it unchanged', 'raise it or leave it unchanged', 'halve it'], answer: 0 },
      { options: ['well inside their segment', 'between two segments', 'in the wrong segment'], answer: 1 },
      { options: ['the same number of segments', 'the same sample size', 'the same variables and scaling'], answer: 2 },
    ],
    solution: 'k-means returns the k groups you ask for, even from random data. Its moves only lower the WCSS (or leave it), which is why it stops, at a local optimum. A silhouette near 0 means a respondent is about as close to another segment as to their own. Silhouettes compare solutions on the same variables and scaling; adding raw spend, for example, raises the silhouette without improving the needs segments.',
  },
];
