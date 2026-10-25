// assess-m2.js — M05 module 2 test: Segmenting with data (cluster-analysis, profiling-segments).
// New questions on new businesses (Skelby Cinemas, Ostrey Car Club and Amberlyn Ski Resort are fictional), with angles
// the lessons don't drill: a centre updated when one member joins, diagnosing two analysts' disagreement from the
// adjusted Rand index, silhouettes in Excel, Ward's preference for merging small groups, the natural / reproducible /
// constructive typology, an index on a share, weighting a segment's size to a population's age mix, what validates a
// segmentation, a typing tool's hold-out accuracy in Excel, and why in-sample accuracy flatters. No hints; solutions are
// shown when the student reviews the test. Every num item's `check` recomputes its answer.

const r0 = (x) => Math.round(x), r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;

// Skelby Cinemas: a centre after one member joins; Ward's candidate merges
const SK = { n: 4, c: 0.5, joiner: 1.5 };
const skNew = (SK.n * SK.c + SK.joiner) / (SK.n + 1);
const WA = { n: 4, c: [0, 0] }, WB = { n: 12, c: [0.8, 0.6] }, WC = { n: 1, c: [-1.2, 0.9] };
const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
const cost = (x, y) => (x.n * y.n) / (x.n + y.n) * d2(x.c, y.c);
const AB = cost(WA, WB), AC = cost(WA, WC), BC = cost(WB, WC);
// Amberlyn Ski Resort: silhouettes in Excel; a typing tool's hold-out
const AS = [[1.2, 2.8], [0.9, 3.1], [1.5, 1.7], [2.2, 1.6], [1.1, 2.4], [1.8, 2.0], [0.7, 2.9], [2.5, 2.1]];
const silCells = { A1: 'pass holder', B1: 'a: own segment', C1: 'b: nearest other', D1: 'silhouette' };
AS.forEach(([a, b], i) => Object.assign(silCells, { [`A${i + 2}`]: `S${i + 1}`, [`B${i + 2}`]: a, [`C${i + 2}`]: b }));
const sil = AS.map(([a, b]) => (b - a) / Math.max(a, b));
const HO = [[52, 6, 2], [5, 41, 4], [3, 7, 30]];
const hoCells = { A1: 'full segmentation ↓ / typed →', B1: 'Carvers', C1: 'Families', D1: 'Off-piste', A2: 'Carvers', A3: 'Families', A4: 'Off-piste', A6: 'typed into the same segment' };
HO.forEach((row, i) => row.forEach((v, j) => { hoCells[`${'BCD'[j]}${i + 2}`] = v; }));
const hoAcc = (HO[0][0] + HO[1][1] + HO[2][2]) / HO.flat().reduce((a, b) => a + b, 0);
// Ostrey Car Club: weighting a segment's share to the city's age mix
const OC = { bands: ['18–34', '35–54', '55 and over'], n: [200, 150, 50], rate: [0.30, 0.20, 0.10], pop: [0.25, 0.40, 0.35] };
const ocW = OC.pop.reduce((a, w, i) => a + w * OC.rate[i], 0);
const ocU = OC.n.reduce((a, n, i) => a + n * OC.rate[i], 0) / OC.n.reduce((a, b) => a + b, 0);

export const items = [
  // ---------------------------------------------------------------- cluster-analysis
  {
    id: 'm05-m2-1', lesson: 'cluster-analysis', type: 'num', kind: 'numerical',
    prompt: `In a k-means run on Skelby Cinemas’ loyalty members (fictional), segment B has ${SK.n} members and its centre on the first standardised need is ${SK.c.toFixed(2)}. In the next assign move one more member, whose value on that need is ${SK.joiner.toFixed(2)}, joins B and no one leaves. What is B’s centre on that need after the update move? Give two decimal places.`,
    answer: r2(skNew), check: () => (4 * 0.5 + 1.5) / 5, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: r2((SK.c + SK.joiner) / 2), say: 'Averaging the old centre with the newcomer gives one member the weight of four. The centre is the mean of all five members.' },
      { value: r2((SK.n * SK.c + SK.joiner) / SK.n), say: 'Divide by the five members now in the segment, not by the four it had.' },
      { value: SK.c, say: 'The update move recomputes every centre from its current members; with a new member, B’s centre moves.' },
    ],
    solution: `The four members’ values add up to 4 × ${SK.c.toFixed(2)} = ${(SK.n * SK.c).toFixed(2)}; with the newcomer the total is ${(SK.n * SK.c + SK.joiner).toFixed(2)}, and the mean of five is ${skNew.toFixed(2)}. The centre moves a fifth of the way towards the newcomer.`,
  },
  {
    id: 'm05-m2-2', lesson: 'cluster-analysis', type: 'mc', kind: 'applied',
    prompt: 'Two analysts segmented Ostrey Car Club’s 1,200 members (fictional) from the same survey: five needs rated 1–7 and the average length of a trip in minutes (8 to 240). Analyst A standardised all six variables and kept the best of 50 k-means++ starts; analyst B used the raw values and one start. Their five-segment solutions have an adjusted Rand index of 0.12. What does that say, and what is the likeliest cause?',
    options: [
      'The two barely agree beyond chance; in B’s raw data, trip minutes, with by far the widest spread, decided most of the distances',
      'They agree on 12% of the members, so 88% of them would have to move segment to reconcile the two solutions',
      'They agree well: any positive adjusted Rand index means both analysts found the same segments',
      'B’s solution is the better one, because a single start avoids averaging over many runs',
    ],
    answer: 0,
    feedback: {
      1: 'The adjusted Rand index counts agreement over pairs of members and corrects it for chance; it isn’t the share of members in matching segments.',
      2: 'About 0 means chance agreement and 1 identical groupings; 0.12 is barely above chance.',
      3: 'Restarts don’t average solutions: they keep the best one. A single start risks a local optimum, a second reason B’s solution is less trustworthy.',
    },
    solution: 'An adjusted Rand index of 0.12 is close to the 0 that chance gives, so the solutions are essentially different. Unstandardised, trip minutes (spread over hundreds) swamp five 1–7 ratings, so B’s segments are mostly trip-length bands; one start adds the risk of a local optimum. A’s solution is the one to profile.',
  },
  {
    id: 'm05-m2-3', lesson: 'cluster-analysis', type: 'formula', kind: 'numerical',
    prompt: 'Amberlyn Ski Resort (fictional) segmented its season-pass holders. For eight of them, column B holds a, the average distance to the other members of their own segment, and column C holds b, the average distance to the members of the nearest other segment. In D2, calculate the pass holder’s silhouette, in a formula that can be filled down to D9.',
    sheet: { cells: silCells }, cell: 'D2', fill: 'D2:D9',
    answer: '=(C2-B2)/MAX(B2,C2)',
    alt: ['=(C2-B2)/MAX(C2,B2)', '=IF(C2>=B2,1-B2/C2,C2/B2-1)', '=(C2-B2)/MAX(B2:C2)'],
    view: 'A1:D9', formats: { B: '0.0', C: '0.0', D: '0.00' }, widths: { A: 12, B: 16, C: 18, D: 11 },
    wrong: [
      { formula: '=(C2-B2)/C2', say: 'Dividing by b works only when b is the larger. When a member is nearer another segment (a > b, as in rows 5 and 9), divide by a: use MAX(a, b).' },
      { formula: '=(C2-B2)/B2', say: 'Divide by the larger of a and b, not always by a; that keeps the silhouette between −1 and 1.' },
      { formula: '=(B2-C2)/MAX(B2,C2)', say: 'The sign is reversed: s = (b − a) ÷ max(a, b), positive when a member is nearer its own segment.' },
      { formula: '=C2-B2', say: 'That is b − a in distance units. Divide by max(a, b) to put it on the −1 to 1 scale.' },
    ],
    solution: `<x>=(C2-B2)/MAX(B2,C2)</x> filled down gives ${sil.map((v) => v.toFixed(2).replace('-', '−')).join(', ')}. Pass holders S4 and S8 have negative silhouettes: on average they are nearer the members of another segment than their own.`,
  },
  {
    id: 'm05-m2-4', lesson: 'cluster-analysis', type: 'num', kind: 'applied',
    prompt: `Partway through Ward’s method on Skelby Cinemas’ members, three groups remain close together, in standardised units: A has ${WA.n} members with centre (${WA.c.join(', ')}), B has ${WB.n} with centre (${WB.c.join(', ')}), and C is a single member at (${WC.c.join(', ').replace('-', '−')}). B’s centre is nearer A’s than C is. Ward’s method makes whichever of the three possible merges of these three groups adds least to the within-cluster sum of squares. How much does that merge add? Give two decimal places.`,
    answer: r2(Math.min(AB, AC, BC)), check: () => Math.min((4 * 12) / 16 * (0.8 ** 2 + 0.6 ** 2), (4 * 1) / 5 * (1.2 ** 2 + 0.9 ** 2), (12 * 1) / 13 * (2.0 ** 2 + 0.3 ** 2)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: r2(AB), say: 'That is A with B. Their centres are nearest, but merging two large groups is costly: 4 × 12 ÷ 16 = 3 times the squared distance. Compare all three merges.' },
      { value: r2(d2(WA.c, WB.c)), say: 'That is the squared distance between A’s and B’s centres alone. Ward’s cost multiplies it by n_A n_B ÷ (n_A + n_B).' },
      { value: r2(d2(WA.c, WC.c)), say: 'That is the squared distance from A to C, without the weight 4 × 1 ÷ 5 = 0.8.' },
      { value: r2(BC), say: 'That is B with C, the costliest of the three.' },
    ],
    solution: `A with B: 4 × 12 ÷ 16 × (0.8² + 0.6²) = 3 × 1.00 = ${AB.toFixed(2)}. A with C: 4 × 1 ÷ 5 × (1.2² + 0.9²) = 0.8 × 2.25 = ${AC.toFixed(2)}. B with C: 12 × 1 ÷ 13 × (2.0² + 0.3²) = ${BC.toFixed(2)}. Ward merges A with C, adding ${AC.toFixed(2)}, although B’s centre is nearer: the size weight makes merging a small group cheaper.`,
  },
  {
    id: 'm05-m2-5', lesson: 'cluster-analysis', type: 'classify', kind: 'conceptual',
    prompt: 'Dolnicar and Leisch distinguish natural, reproducible and constructive segmentation. Which does each finding point to?',
    items: [
      'Every k-means run on bootstrap samples finds the same three tight groups, with a mean silhouette of 0.74.',
      'Runs on bootstrap samples find nearly the same five groups each time, though the groups overlap and the mean silhouette is 0.30.',
      'Each run finds different groups, and the mean silhouette is no higher than for random ratings of the same size.',
      'Restarts, Ward’s method and two halves of the sample all give similar segments, which overlap at their edges.',
      'With no structure in the data, the team picks the split that best suits its marketing plan.',
    ],
    categories: ['Natural segmentation', 'Reproducible segmentation', 'Constructive segmentation'],
    answer: [0, 1, 2, 1, 2],
    feedback: {
      0: 'Clear, well-separated groups that reappear every time are real clusters in the data: natural segmentation, which is rare in consumer data.',
      1: 'Stable but overlapping groups: the data have structure that gives the same answer again, without clear clusters.',
      2: 'Unstable solutions with no more structure than random data: any segmentation is constructed by choice.',
      3: 'Stability across starts, methods and halves, with overlap: reproducible, like Lantern’s segments.',
      4: 'Choosing among artificial splits for their usefulness is constructive segmentation.',
    },
    solution: 'Natural: real, clearly separated clusters that reappear. Reproducible: structure that gives the same overlapping segments again and again. Constructive: no structure, so the analyst and the business choose among artificial solutions, which can still be useful if judged honestly as such.',
  },
  // ---------------------------------------------------------------- profiling-segments
  {
    id: 'm05-m2-6', lesson: 'profiling-segments', type: 'num', kind: 'numerical',
    prompt: 'At Skelby Cinemas, 38% of the “premiere-night fans” segment are students, against 16% of all members surveyed. What is the segment’s index for being a student? Give a whole number.',
    answer: r0(38 / 16 * 100), check: () => (38 / 16) * 100, unit: '', places: 0, tol: 0.6,
    wrong: [
      { value: 22, say: 'That is the difference in percentage points. An index divides: 38 ÷ 16 × 100.' },
      { value: r0(16 / 38 * 100), say: 'Upside down: the segment’s figure goes on top.' },
      { value: 137.5, say: 'That is how far above 100 the index is. The index itself is 38 ÷ 16 × 100.' },
    ],
    solution: '38 ÷ 16 × 100 = 237.5, about 238: students are nearly two and a half times as common in the segment as among all members. A share has a true zero, so the index reads straightforwardly. Being a student is a descriptor here, so it describes the segment; it shouldn’t go into the name unless nearly every member is one.',
  },
  {
    id: 'm05-m2-7', lesson: 'profiling-segments', type: 'num', kind: 'applied',
    prompt: `Ostrey Car Club (fictional) surveyed an opt-in panel. Its “weekend movers” segment is ${OC.rate.map((v) => `${v * 100}%`).join(', ')} of the ${OC.n.join(', ')} respondents aged ${OC.bands.join(', ')} respectively. Among the city’s adults, ${OC.pop.map((v) => `${v * 100}%`).join(', ')} are in those age bands. Estimate the segment’s share of the city’s adults, weighted to the city’s age mix. Give a percentage to one decimal place.`,
    answer: r1(ocW * 100), check: () => (0.25 * 0.30 + 0.40 * 0.20 + 0.35 * 0.10) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1(ocU * 100), say: 'That is the unweighted share of all 400 respondents, which leans towards the 18–34s: half the respondents but a quarter of the city.' },
      { value: r1((OC.rate.reduce((a, b) => a + b, 0) / 3) * 100), say: 'That averages the three bands equally. Weight each band’s rate by its share of the city’s adults.' },
    ],
    solution: `Weighted: 0.25 × 30% + 0.40 × 20% + 0.35 × 10% = ${(ocW * 100).toFixed(1)}%, against ${(ocU * 100).toFixed(2)}% unweighted ((60 + 30 + 5) ÷ 400). Weighting corrects the panel’s age mix only; within each age band the respondents are people who joined a panel and chose to answer, so ${(ocW * 100).toFixed(0)}% is a planning estimate, not a measured share of the city.`,
  },
  {
    id: 'm05-m2-8', lesson: 'profiling-segments', type: 'mc', kind: 'conceptual',
    prompt: 'Amberlyn Ski Resort’s analyst reports that its three segments of season-pass holders “differ significantly on all six needs used to form them (every p < 0.001), which validates the segmentation”. Which result would actually support that the segments are useful?',
    options: [
      'Every one of the six needs has an F statistic above 100, not only a p-value below 0.001',
      'The mean silhouette rises when the analyst adds a fourth and a fifth segment to the three',
      'The segments differ in pass renewal, which wasn’t used to form them',
      'Each of the three segments now has a distinct name agreed with the resort’s marketing team',
    ],
    answer: 2,
    feedback: {
      0: 'Larger F statistics on the segmentation variables are still circular: k-means made the segments differ on those needs, and even random ratings give large F values.',
      1: 'A silhouette for a different number of segments says nothing about whether these three are useful; with more segments it often falls anyway.',
      3: 'Names make segments easier to talk about; they don’t show that the segments differ in anything the resort cares about.',
    },
    solution: 'Tests on the segmentation variables are circular. A difference in a variable not used to form the segments, such as renewal, spend or where people book, shows the segments say something beyond the needs that made them; stability and a typing tool that works on a hold-out add to the case.',
  },
  {
    id: 'm05-m2-9', lesson: 'profiling-segments', type: 'formula', kind: 'applied',
    prompt: 'Amberlyn Ski Resort typed 150 held-back pass holders with three golden questions. The table cross-tabulates each one’s segment in the full segmentation (rows) against the segment the typing tool chose (columns). In B6, calculate the share of the 150 that the tool put in the same segment as the full segmentation.',
    sheet: { cells: hoCells }, cell: 'B6',
    answer: '=(B2+C3+D4)/SUM(B2:D4)',
    alt: ['=SUM(B2,C3,D4)/SUM(B2:D4)', '=(B2+C3+D4)/(SUM(B2:D2)+SUM(B3:D3)+SUM(B4:D4))'],
    view: 'A1:D6', formats: { B6: '0.0%' }, widths: { A: 26, B: 10, C: 10, D: 10 },
    wrong: [
      { formula: '=B2/SUM(B2:D2)', say: 'That is the accuracy for Carvers only. Add the matching cells for all three segments, the diagonal, and divide by everyone.' },
      { formula: '=(B2+C3+D4)/3', say: 'That averages the three diagonal counts. Divide by the total number typed, SUM(B2:D4).' },
      { formula: '=SUM(B2:D4)/(B2+C3+D4)', say: 'Upside down: the matches go on top.' },
    ],
    solution: `The matches lie on the diagonal: 52 + 41 + 30 = 123 of 150, <x>=(B2+C3+D4)/SUM(B2:D4)</x> = ${(hoAcc * 100).toFixed(1)}%. Most errors are between Families and the other two, which is where the tool would need a better question.`,
  },
  {
    id: 'm05-m2-10', lesson: 'profiling-segments', type: 'mc', kind: 'conceptual',
    prompt: 'A typing tool’s golden questions agree with the full segmentation for 93% of the respondents who formed the segments, but for only 86% of a hold-out. Why is the first figure higher?',
    options: [
      'New customers always answer golden questions more carefully than survey panels do',
      'The centres were fitted to those very respondents, so the tool was tested on data it had already seen',
      'The full segmentation uses more needs, so it is less accurate than the tool on the respondents who formed it',
      'Agreement can only be measured on new customers, so any in-sample figure is meaningless and should be read as zero',
    ],
    answer: 1,
    feedback: {
      0: 'There is no such rule, and careful answering would raise hold-out agreement, not lower it.',
      2: 'The full segmentation is the reference the tool is compared with; on its own respondents it defines the segments.',
      3: 'The in-sample figure is informative but optimistic; it isn’t meaningless. Report the hold-out figure for the tool.',
    },
    solution: 'The segment centres (and usually the standardisation and the choice of questions) were estimated from the same respondents, so they fit those respondents’ quirks; new people, whose answers the tool never saw, sit near boundaries more often. That is why accuracy is reported on a hold-out, as B02’s training and test sets taught. With a small hold-out, part of a gap like 93% against 86% is also chance: a few hundred people give a margin of several points, and a different hold-out would give a different figure.',
  },
];
