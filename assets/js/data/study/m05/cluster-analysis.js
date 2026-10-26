// cluster-analysis.js — M05 · Cluster analysis. Content only; exercises are in cluster-analysis.ex.js.
// Lantern's May 2027 needs study from case.js: the 640 respondents' eight needs (RESPONDENTS), the k-means fits for
// k = 2…8 (DERIVED.elbow), the five segments' labels and sizes (DERIVED.segments) and the Ward and planted-truth
// agreements. Everything else quoted here (single starts, more restarts, unstandardised spend, the split halves, the
// no-structure benchmark) is recomputed below with the same engines (classify.js, ml.js, percmap.js). TRUE_TYPE, the
// planted kinds Ana can never see, appears only in the "What Ana couldn't see" callout. The segments are lettered by
// size (as the widget letters them); profiling-segments names them. Pellmark Cycles and Tollwick Software (with
// Teodora Rafferty) are fictional. Every printed figure is recomputed in `checks`.
import { NEEDS, RESPONDENTS, STUDY, TRUE_TYPE, DERIVED as D } from './case.js?v=20';
import { standardise, kmeans, silhouette } from '../../../core/classify.js?v=20';
import { ward, cutTree, adjustedRand, leafOrder } from '../../../core/ml.js?v=20';
import { indexVsAverage } from '../../../core/market.js?v=20';
import { nearestCentroid, agreement } from '../../../core/percmap.js?v=20';
import { mulberry32, normalGen } from '../../../core/rng.js?v=20';

// ---------------------------------------------------------------- the study
const RS = RESPONDENTS, N = RS.length, P = NEEDS.length;
const COLS = NEEDS.map((_, j) => RS.map((r) => r.needs[j]));
const Z = standardise(COLS).rows;
const SP = RS.map((r) => r.spend);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => sum(a) / a.length;
const variance = (a) => { const m = mean(a); return sum(a.map((v) => (v - m) ** 2)) / (a.length - 1); };
const E = (k) => D.elbow.find((e) => e.k === k);
const W = (k) => E(k).inertia, SIL = (k) => E(k).silhouette;
const TSS = (N - 1) * P;                                          // standardised: each need's sum of squares is n − 1
const drop = (k) => (k === 2 ? TSS : W(k - 1)) - W(k);
const LAB = D.segments.labels, SIZES = D.segments.sizes.map((s) => s.n);
const IX = D.segments.index;
const sdMin = Math.min(...D.needs.sds), sdMax = Math.max(...D.needs.sds);

// local optima: 100 single k-means++ starts at k = 5, and the case's 20 restarts against 200
const SINGLE = Array.from({ length: 100 }, (_, s) => kmeans(Z, 5, { restarts: 1, seed: s + 1 }));
const reachBest = SINGLE.filter((km) => km.inertia < W(5) + 1e-6).length;
const stuck = SINGLE.filter((km) => km.inertia >= W(5) + 1e-6);
const stuckLo = Math.min(...stuck.map((km) => km.inertia)), stuckHi = Math.max(...stuck.map((km) => km.inertia));
const worstAri = Math.min(...SINGLE.map((km) => adjustedRand(km.labels, LAB)));
const MORE = Object.fromEntries([5, 6, 7, 8].map((k) => [k, kmeans(Z, k, { restarts: 200 }).inertia]));
const WIDGET7 = kmeans(Z, 7, { restarts: 12, seed: 1888 }).inertia;          // the cluster widget's own settings

// standardising: the needs raw; the needs plus monthly spend in dollars, raw and standardised (the widget's settings)
const RAW = kmeans(RS.map((r) => r.needs.slice()), 5, { restarts: 20 });
const rawAri = adjustedRand(RAW.labels, LAB);
const NS_RAW = RS.map((r) => [...r.needs, r.spend]);
const nsRaw = kmeans(NS_RAW, 5, { restarts: 12, seed: 1888 });
const nsRawSil = silhouette(NS_RAW, nsRaw.labels), nsRawAri = adjustedRand(nsRaw.labels, LAB);
const NS_Z = standardise([...COLS, SP]).rows;
const nsZ = kmeans(NS_Z, 5, { restarts: 12, seed: 1888 });
const nsZAri = adjustedRand(nsZ.labels, LAB);
const spendVar = variance(SP), needsVar = sum(COLS.map(variance));
const spendShare = spendVar / (spendVar + needsVar);
const bands = Array.from({ length: 5 }, (_, g) => { const s = SP.filter((_, i) => nsRaw.labels[i] === g); return { n: s.length, lo: Math.min(...s), hi: Math.max(...s) }; }).sort((a, b) => a.lo - b.lo);

// k = 2, 4 and 6 against the five segments (200 restarts: the 20-restart k = 6 is a local optimum)
const KM = (k) => kmeans(Z, k, { restarts: 200 });
const km2 = KM(2), km4 = KM(4), km6 = KM(6);
const cross = (a, ka, b, kb) => Array.from({ length: ka }, (_, x) => Array.from({ length: kb }, (_, y) => a.filter((l, i) => l === x && b[i] === y).length));
const ix2 = indexVsAverage(COLS, km2.labels, 2).map((r) => r.map(Math.round));
const c25 = cross(km2.labels, 2, LAB, 5);
const g2price = km2.labels[LAB.indexOf(0)];                         // the k = 2 group that holds segment A
const g2other = 1 - g2price;
const c56 = cross(LAB, 5, km6.labels, 6);
const cSplit = c56[2].map((v, j) => ({ v, j })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);   // segment C at k = 6
const ix6 = indexVsAverage(COLS, km6.labels, 6).map((r) => r.map(Math.round));
const six = (j) => km6.labels.filter((l) => l === j).length;
const c45 = cross(km4.labels, 4, LAB, 5);
const merged = c45.find((row) => row[2] > 50 && row[3] > 50);       // the k = 4 group that holds most of C and D

// Ward against k-means, the split halves, and the planted truth
const WARD5 = cutTree(ward(Z), 5).labels;
const perms = (n) => (n === 1 ? [[0]] : perms(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)])));
const bestMatch = (a, b, k) => perms(k).reduce((best, p) => Math.max(best, agreement(a.map((v) => p[v]), b)), 0);
const wardSame = bestMatch(WARD5, LAB, 5);
const wardDiffer = Math.round(N * (1 - wardSame));
const HALF = N / 2;
const kmA = kmeans(Z.slice(0, HALF), 5, { restarts: 20 }), kmB = kmeans(Z.slice(HALF), 5, { restarts: 20 });
const splitAri = adjustedRand(nearestCentroid(kmA.centres, Z), nearestCentroid(kmB.centres, Z));
const truthAri = Object.fromEntries([2, 4, 6].map((k) => [k, adjustedRand(KM(k).labels, TRUE_TYPE)]));

// the no-structure benchmark: 640 made-up respondents, each rating drawn independently and uniformly from 1–7
const rnd = mulberry32(2027);
const NOISE = Array.from({ length: N }, () => Array.from({ length: P }, () => 1 + Math.floor(rnd() * 7)));
const NZ = standardise(Array.from({ length: P }, (_, j) => NOISE.map((r) => r[j]))).rows;
const NF = Object.fromEntries([2, 3, 4, 5, 6, 7, 8].map((k) => { const km = kmeans(NZ, k, { restarts: 100 }); return [k, { w: km.inertia, sizes: km.sizes, sil: silhouette(NZ, km.labels) }]; }));
const noiseDrops = [3, 4, 5, 6, 7, 8].map((k) => NF[k - 1].w - NF[k].w);
// two more benchmarks: each need's real answers shuffled independently (keeps every need's spread, breaks the links), and
// normal data with the needs' own correlations but no clusters (three draws)
const rsh = mulberry32(2028);
const shuffled = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rsh() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const SHZ = standardise(COLS.map(shuffled)).rows;
const shufSil = silhouette(SHZ, kmeans(SHZ, 5, { restarts: 20 }).labels);
const CORR = Array.from({ length: P }, (_, a) => Array.from({ length: P }, (_, b) => sum(Z.map((r) => r[a] * r[b])) / (N - 1)));
const CH = (() => { const Lm = CORR.map(() => new Array(P).fill(0)); for (let i = 0; i < P; i++) for (let j = 0; j <= i; j++) { let t = CORR[i][j]; for (let k = 0; k < j; k++) t -= Lm[i][k] * Lm[j][k]; Lm[i][j] = i === j ? Math.sqrt(t) : t / Lm[j][j]; } return Lm; })();
const corrSil = [11, 12, 13].map((seed) => { const g = normalGen(mulberry32(seed)); const G = Array.from({ length: N }, () => { const e = Array.from({ length: P }, () => g()); return CH.map((row) => sum(row.map((v, k) => v * e[k]))); }); const GZ = standardise(Array.from({ length: P }, (_, j) => G.map((r) => r[j]))).rows; return silhouette(GZ, kmeans(GZ, 5, { restarts: 20 }).labels); });
const corrLo = Math.min(...corrSil), corrHi = Math.max(...corrSil);
// Kaufman and Rousseeuw's rough scale for the mean silhouette (as reproduced by Emamat et al., 2022)
const KR = [[0.71, 'strong structure'], [0.51, 'reasonable structure'], [0.26, 'weak structure that could be artificial']];

// sample size: Dolnicar, Grün & Leisch's 2016 guideline (100 per variable) and the 2014 one (70)
const NEED100 = 100 * P, NEED70 = 70 * P;

// ---------------------------------------------------------------- Pellmark Cycles (fictional): k-means by hand
const PM_NAMES = 'ABCDEFGH'.split('');
const PTS = [[6, 2], [7, 1], [5, 2], [6, 3], [2, 6], [1, 7], [3, 5], [2, 5]];     // [low price, expert advice]
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const centreOf = (idx) => [mean(idx.map((i) => PTS[i][0])), mean(idx.map((i) => PTS[i][1]))];
const assign = (cs) => PTS.map((p) => (d2(p, cs[0]) <= d2(p, cs[1]) ? 0 : 1));
const wcss = (lab, cs) => sum(PTS.map((p, i) => d2(p, cs[lab[i]])));
const C0 = [PTS[6], PTS[7]];                                         // start at G and H
const L1 = assign(C0), W0 = wcss(L1, C0);
const C1 = [0, 1].map((g) => centreOf(L1.map((l, i) => (l === g ? i : -1)).filter((i) => i >= 0)));
const W1 = wcss(L1, C1);
const L2 = assign(C1);
const C2 = [0, 1].map((g) => centreOf(L2.map((l, i) => (l === g ? i : -1)).filter((i) => i >= 0)));
const W2 = wcss(L2, C2);
const L3 = assign(C2);
const PMK = Object.fromEntries([1, 2, 3, 4].map((k) => { const km = kmeans(PTS, k, { restarts: 50 }); return [k, { w: km.inertia, sil: k > 1 ? silhouette(PTS, km.labels) : NaN, sizes: km.sizes, labels: km.labels }]; }));
const PZ = standardise([PTS.map((p) => p[0]), PTS.map((p) => p[1])]);
const pzAri = adjustedRand(kmeans(PZ.rows, 2, { restarts: 50 }).labels, PMK[2].labels);
const sdP = PZ.s;
// G's silhouette in the two-segment solution
const dist = (a, b) => Math.sqrt(d2(a, b));
const aG = mean([4, 5, 7].map((i) => dist(PTS[6], PTS[i])));
const bG = mean([0, 1, 2, 3].map((i) => dist(PTS[6], PTS[i])));
const sG = (bG - aG) / Math.max(aG, bG);
// Ward's merges for the dendrogram
const PWARD = ward(PTS), PORDER = leafOrder(PWARD);
const wardCut2Ari = adjustedRand(cutTree(PWARD, 2).labels, PMK[2].labels);
const mergeCost = PWARD.merges.map((m) => (m.height ** 2) / 2);    // SciPy-style height h: the merge adds h² ÷ 2 to the WCSS
// Ward's cost for the first merge, A with C: (1 × 1 ÷ 2) × 1 = 0.5
const wardAC = ((1 * 1) / 2) * d2(PTS[0], PTS[2]);

// Tollwick Software (fictional): the application
const LK = { customers: 1150, needs: 7, restarts: 50, sil: { 3: 0.31, 4: 0.29, 5: 0.24 }, split: { 4: 0.91, 5: 0.62 }, sizes: [362, 301, 274, 213] };

// ---------------------------------------------------------------- formatting
const f0 = (v) => Math.round(v).toLocaleString('en-US');
const f1 = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f2 = (v) => v.toFixed(2);
const f3 = (v) => v.toFixed(3);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const LET = 'ABCDE';

// ---------------------------------------------------------------- figures
function pathFigure() {
  const X = (v) => 60 + (v - 1) * 52, Y = (v) => 330 - (v - 1) * 48;
  let s = '<svg viewBox="0 0 440 380" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14" fill="currentColor">';
  for (let v = 1; v <= 7; v++) {
    s += `<line x1="${X(v)}" y1="${Y(1)}" x2="${X(v)}" y2="${Y(7)}" style="stroke:var(--rule-strong);stroke-width:0.5;stroke-dasharray:2 4"/>`;
    s += `<line x1="${X(1)}" y1="${Y(v)}" x2="${X(7)}" y2="${Y(v)}" style="stroke:var(--rule-strong);stroke-width:0.5;stroke-dasharray:2 4"/>`;
    s += `<text x="${X(v)}" y="${Y(1) + 20}" text-anchor="middle" font-size="12" fill="var(--ink-3)">${v}</text>`;
    s += `<text x="${X(1) - 12}" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="var(--ink-3)">${v}</text>`;
  }
  s += `<text x="${X(4)}" y="372" text-anchor="middle" font-size="13">Low price matters (1–7)</text>`;
  s += `<text transform="translate(16 ${Y(4)}) rotate(-90)" text-anchor="middle" font-size="13">Expert advice matters (1–7)</text>`;
  // label positions [dx, dy, anchor], chosen so that no label sits on a point, a path or another label
  const CUST = [[0, 25, 'middle'], [0, 22, 'middle'], [-13, 5, 'end'], [0, -13, 'middle'], [14, 5, 'start'], [14, 5, 'start'], [0, 26, 'middle'], [-14, 5, 'end']];
  const STEP = [[[-12, 5, 'end'], [12, 5, 'start']], [[-10, 20, 'end'], [14, 5, 'start']]];
  const paths = [[C0[0], C1[0], C2[0]], [C0[1], C1[1], C2[1]]];
  // a centre that sits exactly on a customer is drawn just beside it (up and to the right), so both stay visible
  const onCustomer = (c) => PTS.some((p) => p[0] === c[0] && p[1] === c[1]);
  const at = (c, i) => { const x = X(c[0]), y = Y(c[1]); return i && onCustomer(c) ? [x + 9, y - 9] : [x, y]; };
  paths.forEach((path, g) => {
    s += `<path d="${path.map((c, i) => { const [x, y] = at(c, i); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')}" style="fill:none;stroke:var(--series-${g + 1});stroke-width:2;stroke-dasharray:6 4"/>`;
  });
  // customers: filled circle = price-first segment at the end, open circle (page-coloured) = advice-first segment
  PTS.forEach((p, i) => {
    const x = X(p[0]), y = Y(p[1]), fin = L3[i], [dx, dy, a] = CUST[i];
    s += `<circle cx="${x}" cy="${y}" r="7" style="fill:${fin === 0 ? 'var(--series-1)' : 'var(--paper)'};stroke:${fin === 0 ? 'var(--ink)' : 'var(--series-2)'};stroke-width:2"/>`;
    s += `<text x="${x + dx}" y="${y + dy}" text-anchor="${a}" font-weight="700">${PM_NAMES[i]}</text>`;
  });
  // centres on top: hollow diamonds at the start (around G and H), filled after each iteration
  paths.forEach((path, g) => path.forEach((c, i) => {
    const [x, y] = at(c, i), r = i ? 6 : 11;
    s += `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${2 * r}" height="${2 * r}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})" style="fill:${i ? `var(--series-${g + 1})` : 'none'};stroke:${i ? 'var(--ink)' : `var(--series-${g + 1})`};stroke-width:${i ? 0.8 : 2}"/>`;
    if (i) { const [dx, dy, a] = STEP[g][i - 1]; s += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" font-size="12" fill="var(--ink-3)">${i === 1 ? 'after 1' : 'after 2'}</text>`; }
  }));
  s += `<text x="${X(3) + 16}" y="${Y(5) - 14}" font-size="12" fill="var(--ink-3)">G switches in iteration 2</text>`;
  s += '</svg>';
  return s;
}

function dendroFigure() {
  const n = PTS.length, H = Math.max(...PWARD.merges.map((m) => m.height));
  const x0 = 70, step = 48, base = 250, top = 30;
  const yOf = (h) => base - (h / H) * (base - top);
  const pos = {};
  PORDER.forEach((leaf, k) => { pos[leaf] = { x: x0 + k * step, y: base }; });
  let s = '<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14" fill="currentColor">';
  [0, 2, 4, 6, 8, 10].forEach((t) => {
    s += `<line x1="44" y1="${yOf(t).toFixed(1)}" x2="48" y2="${yOf(t).toFixed(1)}" style="stroke:currentColor;stroke-width:1"/><text x="40" y="${(yOf(t) + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="var(--ink-3)">${t}</text>`;
  });
  s += `<line x1="48" y1="${top - 6}" x2="48" y2="${base}" style="stroke:currentColor;stroke-width:1"/>`;
  s += `<text transform="translate(14 ${(base + top) / 2}) rotate(-90)" text-anchor="middle" font-size="12" fill="var(--ink-3)">Merge height</text>`;
  PWARD.merges.forEach((m, k) => {
    const a = pos[m.a], b = pos[m.b], y = yOf(m.height);
    s += `<path d="M${a.x},${a.y.toFixed(1)} V${y.toFixed(1)} H${b.x} V${b.y.toFixed(1)}" style="fill:none;stroke:var(--series-1);stroke-width:2"/>`;
    pos[n + k] = { x: (a.x + b.x) / 2, y };
  });
  PORDER.forEach((leaf, k) => { s += `<text x="${x0 + k * step}" y="${base + 20}" text-anchor="middle" font-weight="700">${PM_NAMES[leaf]}</text>`; });
  const cut = yOf(6);
  s += `<line x1="52" y1="${cut.toFixed(1)}" x2="${x0 + (n - 1) * step + 24}" y2="${cut.toFixed(1)}" style="stroke:var(--series-3);stroke-width:1.5;stroke-dasharray:6 4"/>`;
  s += `<text x="${x0 + (n - 1) * step + 24}" y="${(cut - 8).toFixed(1)}" text-anchor="end" font-size="12" fill="var(--ink-3)">a cut here leaves two segments</text>`;
  s += `<text x="${x0 + 1.5 * step}" y="${base + 42}" text-anchor="middle" font-size="12" fill="var(--ink-3)">price first</text>`;
  s += `<text x="${x0 + 5.5 * step}" y="${base + 42}" text-anchor="middle" font-size="12" fill="var(--ink-3)">advice first</text>`;
  s += '</svg>';
  return s;
}

const elbowRows = [2, 3, 4, 5, 6, 7, 8].map((k) => [String(k), f1(W(k)), f1(drop(k)), f3(SIL(k)), E(k).sizes.join(', ')]);

export default {
  slug: 'cluster-analysis',
  title: 'Cluster analysis',
  blurb: 'Segment customers on their needs with data: choose and standardise the variables, run k-means (and Ward’s method as a check), pick the number of segments from the elbow, the silhouette and what the segments mean, and test whether the answer is stable. Lantern’s 640-person needs study is the data.',
  status: 'draft',
  objectives: [
    'Choose the segmentation variables for a needs-based segmentation and explain why they are standardised first.',
    'Calculate squared Euclidean distances and segment centres, run k-means by hand for two iterations and calculate the within-cluster sum of squares.',
    'Explain why k-means needs k-means++ starts and restarts, why it always returns k groups, and how Ward’s hierarchical clustering and its dendrogram differ.',
    'Choose the number of segments from the elbow, the mean silhouette and whether the segments mean something a business can act on, and justify the choice.',
    'Assess a segmentation’s stability with restarts, the agreement between Ward’s method and k-means (the adjusted Rand index) and a split-half check.',
  ],
  prerequisites: [
    { lesson: 'b02/scaling', why: 'Standardising (z-scores) and why distance-based methods such as k-means need it are used here without being derived again.' },
    { lesson: 'm05/psychographic-and-behavioural', why: 'Benefits sought and needs as a segmentation base, and why they are harder to reach than demographics.' },
    { lesson: 'm04/questionnaire-design', why: 'The eight needs are rating items on a 1–7 scale; their wording and scale come from questionnaire design.' },
    { lesson: 'm04/sampling-methods', why: 'The study comes from an opt-in panel with age quotas, a non-probability sample.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In May 2027 Ana Lim bought a needs study from a panel company for $${f0(STUDY.cost)}: ${N} Harbour City adults who drink coffee at least once a week, recruited from an <g>opt-in panel</g> with quotas on age band. Each rated how much ${P} needs matter when they choose coffee, from 1 (not at all important) to 7 (essential): taste and quality, a low price, convenience, sustainability, a strong caffeine kick, health (low in sugar and calories), buying from a local independent business, and new flavours. Module 1 showed that the ratings spread widely. Ana now wants to know whether the ${N} fall into groups that want different things, and if so how many groups and who is in each.` },
    { p: 'OpenStax defines <g>needs-based segmentation</g> as dividing a market into smaller groups of people with approximately the same needs. When the groups are formed from survey answers rather than decided in advance, it is <g>post hoc segmentation</g>, or data-driven, as module 1 explained. The tool is <g>cluster analysis</g>: a family of methods that sort observations into groups, called clusters, whose members are more alike than members of different groups, judged by a measure of distance. This lesson forms the groups; <i>Profiling segments</i> describes, names and sizes them.' },
    { callout: 'warn', title: 'A cluster analysis always returns groups', html: `Give k-means any data, even ratings drawn at random, and it returns the number of groups you asked for. The groups are a model of the market that you build, choose and check, not segments that were waiting to be discovered. Dolnicar, Grün and Leisch, whose open textbook on segmentation analysis this lesson draws on, report that natural segments, clearly separated in the data, are rare in consumer data.` },

    { h: 'Six decisions' },
    { p: 'Every needs-based cluster analysis rests on six decisions, and two analysts given the same data can reach different segments by making them differently. Write them down before you run anything, so that they can’t be chosen to flatter the result.' },
    { ol: [
      '<b>Segmentation variables</b>: which answers form the segments. Here, the eight needs; who people are and what they buy come later, to describe the segments.',
      '<b>Scale</b>: standardise each variable, so that each counts equally in the distances.',
      '<b>Distance</b>: how far apart two respondents are; k-means uses squared Euclidean distance.',
      '<b>Algorithm</b>: k-means, started well and restarted many times; Ward’s hierarchical method as a check.',
      '<b>Number of segments</b>: from the elbow, the silhouette and what the segments mean.',
      '<b>Stability</b>: whether the segments survive restarts, another method and another half of the sample.',
    ] },

    { h: 'Respondents as points' },
    { p: String.raw`Think of each respondent as a point with one coordinate per need: ${P} coordinates for Ana’s study, two in the small examples below. After each need is standardised to a <g>z-score</g> (B02’s <i>Normalisation and standardisation</i>), one unit on every axis means one standard deviation. The <g>squared Euclidean distance</g> between two respondents adds up the squared differences on every need: two people who differ by one standard deviation on all ${P} needs are <m>${P} \times 1^2 = ${P}</m> apart, and two who differ by two standard deviations on price alone are <m>2^2 = 4</m> apart. Respondents who are close want similar things; a segment is a group of respondents close to one another.` },

    { h: 'k-means in four moves' },
    { p: '<g>k-means clustering</g> sorts respondents into k groups, where k is a number you choose, so as to make the total squared distance from respondents to their group’s centre as small as possible. Each group’s <g>segment centre</g> (its centroid) is the mean of its members on every variable. The method repeats two moves until nothing changes:' },
    { ol: [
      '<b>Start</b>: choose k starting centres (k-means++ chooses them well; see In depth).',
      '<b>Assign</b>: put every respondent with the nearest centre, by squared Euclidean distance.',
      '<b>Update</b>: move each centre to the mean of the respondents assigned to it.',
      '<b>Repeat</b> the assign and update moves until no respondent changes group.',
    ] },
    { p: `The total it makes small is the <g>within-cluster sum of squares</g> (WCSS): every respondent’s squared distance to their own centre, added up. Each assign move and each update move can only lower it or leave it unchanged, so k-means always stops. Pellmark Cycles’ eight customers, worked below, show the moves on a scale small enough to do by hand: from a poor start the WCSS falls from ${f0(W0)} to ${f2(W1)} after one iteration and to ${f2(W2)} after two, when one customer, G, switches group and nothing moves again.` },
    { figure: {
      svg: pathFigure(),
      caption: `k-means with two segments on Pellmark Cycles’ eight customers (fictional), started at customers G and H. Hollow diamonds mark the starting centres (on G and H), filled diamonds each centre after iterations 1 and 2; the final price-first centre sits on customer A and is drawn just beside it. Filled circles end in the price-first segment, open circles in the advice-first segment.`,
      alt: `A scatter plot of eight customers rated 1 to 7 on how much a low price matters (horizontal) and how much expert advice matters (vertical). A at 6 and 2, B at 7 and 1, C at 5 and 2 and D at 6 and 3 form a group at the lower right, shown as filled circles. E at 2 and 6, F at 1 and 7, G at 3 and 5 and H at 2 and 5 form a group at the upper left, shown as open circles. One centre starts on G and moves to 5.4 and 2.6 after iteration 1 and to 6 and 2, on customer A, after iteration 2. The other starts on H and moves to 1.67 and 6 and then to 2 and 5.75. G switches from the lower-right group to the upper-left group in iteration 2.`,
    } },

    { h: 'How many segments?' },
    { p: `Ana’s analysis ran k-means on the ${P} standardised needs for every k from 2 to 8, each with 20 restarts. The table shows the within-cluster sum of squares for each k, how much it fell from one k to the next, and the mean silhouette, a measure of how much closer respondents are to their own segment than to the next one (In depth defines it).` },
    { table: {
      caption: `k-means on Lantern’s ${N} respondents, eight standardised needs, 20 restarts for each k. With one segment the within-cluster sum of squares is the total, ${f0(TSS)}.`,
      head: ['k', 'Within-cluster sum of squares', 'Fall from k − 1', 'Mean silhouette', 'Segment sizes'],
      align: ['r', 'r', 'r', 'r', 'l'],
      rows: elbowRows,
    } },
    { p: `The within-cluster sum of squares always falls as k rises, because extra centres can only bring respondents closer to one; with ${N} segments it would be 0. What matters is where the falls shrink. They are large up to k = 5 (${f1(drop(5))} from four to five) and then small (${f1(drop(6))} from five to six): the curve bends, an <g>elbow</g>, at five. The silhouette is highest at k = 2 (${f3(SIL(2))}), but five beats its neighbours (${f3(SIL(5))} against ${f3(SIL(4))} at four and ${f3(SIL(6))} at six), a local peak.` },
    { callout: 'key', title: 'Ana chooses five segments', html: `Two segments fit best by the silhouette, but they are one broad split: people who put price, convenience and caffeine first against people who care more about taste, sustainability, health, local businesses and new flavours. Five segments sit at the elbow and a local peak of the silhouette, and each differs from the others in a way Lantern could act on. Statistics narrowed the choice to a few values of k; what the segments mean decided it. The applied example below works the decision through and checks that the five segments are stable.` },
  ],

  theory: [
    { h: 'Choosing the segmentation variables' },
    { p: 'The segmentation variables, module 1’s <g>segmentation base</g>, are the answers that form the segments. For a needs-based segmentation they are the needs or benefits that drive the choice the business cares about, worded so that respondents can answer them, as Ana’s eight are. Leave out who people are (age, income, region) and what they do (cups, spend, where they buy): those describe the segments afterwards, and mixing them into the clustering produces groups that are part need, part demographic and hard to interpret or reach.' },
    { p: 'Three further rules keep the variables honest. Don’t include two items that ask the same thing (“a low price” and “inexpensive”): the need they share counts twice in every distance. Leave out items that almost everyone rates alike, which add noise but no separation. And keep the number of variables in proportion to the sample: Dolnicar, Grün and Leisch’s simulations led to a guideline of at least 100 respondents per segmentation variable (an earlier study had suggested 70).' },
    { p: `By that guideline Ana’s ${P} needs call for ${f0(NEED100)} respondents, and she has ${N}: enough by the older figure of ${f0(NEED70)}, short by the newer one. That doesn’t make the study useless, but it is one more reason to check that the segments are stable before relying on them. Ratings carry one more trap: some people rate everything high and others everything low, a habit of answering rather than a need. Standardising each variable, the next step, doesn’t remove it; analysts sometimes centre each respondent’s ratings on that respondent’s own mean, at the cost of losing whether someone cares about coffee at all. Whatever the study does, a tool that later places new customers in the segments must transform their answers in exactly the same way.` },

    { h: 'Standardising first' },
    { p: `Distances add squared differences, so a variable with a wide spread dominates them. Standardising each variable to mean 0 and standard deviation 1 (B02) makes every need count equally. Ana’s needs share one 1–7 scale and similar spreads (standard deviations from ${f2(sdMin)} to ${f2(sdMax)}), so here standardising changes little: k-means on the raw ratings gives almost the same five segments, with an adjusted Rand index (defined below) of ${f2(rawAri)} against the standardised ones.` },
    { p: `It matters as soon as the scales differ. Add each respondent’s monthly coffee spend, in dollars, to the eight needs without standardising: spend’s variance (${f1(spendVar)}) is ${f0(spendVar / needsVar)} times the eight needs’ variances added together (${f1(needsVar)}), ${pc(spendShare)} of the total. k-means then sorts people into spend bands ($${bands[0].lo}–${bands[0].hi}, $${bands[1].lo}–${bands[1].hi}, $${bands[2].lo}–${bands[2].hi}, $${bands[3].lo}–${bands[3].hi} and $${bands[4].lo}–${bands[4].hi} a month) whose agreement with the needs segments is ${f2(nsRawAri)}, close to none. Its mean silhouette, ${f2(nsRawSil)}, is higher than any needs solution’s, because one widely spread variable makes tidy bands: a silhouette can’t be compared across different variables or scalings. Standardised, spend becomes one variable in nine and the segments barely move (agreement ${f2(nsZAri)}), although it would still be a behaviour mixed into a needs segmentation.` },

    { h: 'Distance' },
    { p: 'k-means works with squared Euclidean distance because the mean is the point that makes the sum of squared distances to a group smallest: the update move is exactly the step that lowers the WCSS most for the current groups. Other distances exist (city-block distance adds absolute differences; others suit yes-or-no answers), and other algorithms use them, but k-means and Ward’s method as taught here are built on squared Euclidean distance. The silhouette, below, uses the ordinary Euclidean distance, the square root.' },

    { h: 'Local optima, k-means++ and restarts' },
    { p: String.raw`k-means improves the solution it starts from, so it stops at a <g>local optimum</g>: a grouping that no single assign or update move can improve, though a different grouping would be better. Arthur and Vassilvitskii (2007) note that standard k-means is guaranteed only to find a local optimum, which can be quite poor. Their <g>k-means++</g> start picks the first centre at random and each further centre with a probability proportional to its squared distance from the nearest centre already chosen, so the starting centres spread out. Analysts then run k-means from many such starts, called <i>restarts</i>, and keep the solution with the lowest WCSS.` },
    { p: `Restarts matter on Ana’s data. Of 100 runs from a single k-means++ start each at k = 5, ${reachBest} reached the best solution (WCSS ${f1(W(5))}); the other ${100 - reachBest} stopped at local optima between ${f1(stuckLo)} and ${f1(stuckHi)}, ${pc(stuckLo / W(5) - 1, 0)} to ${pc(stuckHi / W(5) - 1, 0)} worse, and the worst agreed with the best solution only ${f2(worstAri)} on the adjusted Rand index. Even 20 restarts are a heuristic: 200 find the same solution at k = 5 but slightly lower sums at k = 6, 7 and 8 (${f1(MORE[6])}, ${f1(MORE[7])} and ${f1(MORE[8])}, less than 0.1% below the table). Report how many restarts you ran.` },

    { h: 'k-means always returns k groups' },
    { p: `To see what no structure looks like, the lesson made up ${N} respondents whose ${P} ratings were each drawn at random from 1 to 7, independently, and ran the same analysis with 100 restarts. k-means still returned five segments, of ${Math.min(...NF[5].sizes)} to ${Math.max(...NF[5].sizes)} people. Their mean silhouette was ${f3(NF[5].sil)}, against ${f3(SIL(5))} for Ana’s data, and the within-cluster sum of squares fell smoothly, by ${f0(noiseDrops[0])}, ${f0(noiseDrops[1])}, ${f0(noiseDrops[2])}, ${f0(noiseDrops[3])}, ${f0(noiseDrops[4])} and ${f0(noiseDrops[5])} from one k to the next, with no elbow.` },
    { p: `Uniform ratings don’t keep each need’s own spread, but shuffling each need’s real answers independently, which does, gives much the same silhouette (${f2(shufSil)}). A stricter benchmark keeps the needs’ correlations with one another but builds in no clusters: normal data with Ana’s correlation matrix give ${f2(corrLo)} to ${f2(corrHi)} in three draws. Benchmarks like these, data of the same size and scale with no clusters built in, are a quick way to read what a silhouette means for your data.` },

    { h: 'Ward’s hierarchical clustering and the dendrogram' },
    { p: String.raw`<g>Ward’s method</g> builds segments from the bottom up. It starts with every respondent as a group of one and, at each step, merges the two groups whose merger increases the within-cluster sum of squares least, until one group remains (Ward, 1963, proposed merging to lose least by an objective the investigator chooses; the error sum of squares is the usual one). Merging groups A and B adds <m>\frac{n_A n_B}{n_A + n_B}</m> times the squared distance between their centres to the WCSS, so small groups with close centres merge first. The record of merges is drawn as a <g>dendrogram</g>, a tree whose branches join at the height of each merge; cutting it at any height gives that many segments.` },
    { figure: {
      svg: dendroFigure(),
      caption: `Ward’s method on Pellmark Cycles’ eight customers (fictional). Each pair joins at the merge height SciPy and the site’s engine use for Ward’s method, √(2 × the merge’s cost): A and C, whose merge costs ${f2(wardAC)} by the card below, join at height ${f0(PWARD.merges[0].height)}, and the last merge, at ${f2(PWARD.merges[6].height)}, costs ${f2(PWARD.merges[6].height)}² ÷ 2 = ${f2(mergeCost[6])}, exactly the fall from one segment to two in the worked example “Two segments or three?”. It costs far more than any merge before it, which is why a cut below it gives two segments.`,
      alt: `A dendrogram with the eight customers along the bottom in the order B, D, A, C, F, G, E, H. A and C join first at height 1, as do E and H. D joins A and C, and G joins E and H, at about 1.3. B joins the A, C, D group at about 2.3 and F joins the E, G, H group at about 2.6. The two groups of four join at about 11.0. A dashed horizontal line at height 6, below the last merge, cuts the tree into the price-first group B, D, A, C and the advice-first group F, G, E, H.`,
    } },
    { p: `Ward’s method needs no k in advance and shows every number of segments at once, but it never undoes a merge, so an early merge that later looks wrong stays, and it compares every pair of groups, which grows slow for tens of thousands of respondents. k-means needs k and a good start but can move respondents freely. The two are often used together: Ward’s tree to see which values of k look natural, k-means to refine the groups. On Ana’s data, Ward’s five groups and the k-means segments agree closely: ${f0(N - wardDiffer)} of ${N} respondents, ${pc(wardSame)}, are in matching groups, and ${wardDiffer} differ.` },

    { h: 'Comparing two segmentations: the adjusted Rand index' },
    { p: `Two segmentations of the same people can label their segments differently, so they are compared over pairs of respondents: does each pair sit together in both, or apart in both? The <g>adjusted Rand index</g> of Hubert and Arabie (1985) counts that agreement and corrects it for chance: 1 means identical groupings (whatever the labels), about 0 means no more agreement than random labels would give, and it can be negative. Ward against k-means on Ana’s data scores ${f2(D.segments.wardAgreement)}.` },

    { h: 'Choosing k: the elbow, the silhouette and meaning' },
    { p: String.raw`The <g>elbow</g> method plots the within-cluster sum of squares against k and looks for the bend after which extra segments buy little. The bend is often soft, so read the falls, not only the picture. With standardised data the total sum of squares is <m>(n - 1)p = ${N - 1} \times ${P} = ${f0(TSS)}</m>, so Ana’s five segments leave ${pc(1 - W(5) / TSS)} of the variation in the needs between segments and ${pc(W(5) / TSS)} within them.` },
    { p: `The <g>silhouette</g> of a respondent, proposed by Rousseeuw (1987), compares a, their average distance to the other members of their own segment, with b, their average distance to the members of the nearest other segment: s = (b − a) ÷ max(a, b). It runs from −1 to 1. Near 1, the respondent sits well inside their segment; near 0, between two segments; below 0, nearer another segment than their own. The mean silhouette over all respondents summarises the solution, and Rousseeuw suggested it might help select the number of clusters. A widely quoted rule of thumb from Kaufman and Rousseeuw’s book on cluster analysis (1990, as reproduced by Emamat and colleagues) reads a mean of ${KR[0][0]} or more as ${KR[0][1]}, ${KR[1][0]} to 0.70 as ${KR[1][1]}, ${KR[2][0]} to 0.50 as ${KR[2][1]}, and 0.25 or less as no substantial structure.` },
    { p: `Read the size of a silhouette, not only its peak. Ana’s ${f3(SIL(5))} at k = 5 is about three times the ${f3(NF[5].sil)} of random ratings and about twice the ${f2(corrLo)}–${f2(corrHi)} of correlated data without clusters, so the segments are not an accident of the method; on Kaufman and Rousseeuw’s scale it is weak structure, far from the values near 1 of tight, well-separated groups. The segments overlap, and many respondents sit near a boundary. The silhouette often peaks at a small k when one split dominates the data, as here: at k = 2 it is highest, but the two groups are ${c25[g2price].reduce((a, b) => a + b, 0)} people who put price (index ${ix2[g2price][1]} against the average respondent), convenience (${ix2[g2price][2]}) and caffeine (${ix2[g2price][4]}) first, and ${c25[g2other].reduce((a, b) => a + b, 0)} who rate taste, sustainability, health, local and novelty above average: true, and too coarse to plan five different offers around.` },
    { p: `Meaning settles it. At k = 4, most of segment D (local and taste first) and most of segment C (novelty first) merge into one group of ${merged.reduce((a, b) => a + b, 0)}, although a café that sells itself on Harbour City roots and a brand that launches new flavours every month are different propositions. At k = 6 (the best of 200 restarts), segment C divides between a group of ${six(cSplit[0].j)} (${cSplit[0].v} of C’s members and ${six(cSplit[0].j) - cSplit[0].v} from D; novelty index ${ix6[cSplit[0].j][7]}, with taste and local above average) and one of ${six(cSplit[1].j)} (novelty ${ix6[cSplit[1].j][7]}, every other need below average): the same need at two strengths, not a new one. Dolnicar, Grün and Leisch put it plainly: statistical criteria are no substitute for the judgement of the people who will use the segments.` },

    { h: 'Stability' },
    { p: `A segmentation worth acting on should not depend on the luck of one run. Three checks are quick: whether many restarts reach the same best solution (${reachBest} of 100 single starts did), whether a different method finds similar groups (Ward against k-means: an adjusted Rand index of ${f2(D.segments.wardAgreement)}), and whether another half of the sample gives the same segments. For the last, Ana’s analyst segmented the first ${HALF} respondents and the last ${HALF} separately, assigned all ${N} to each half’s nearest centres, and compared the two assignments: an adjusted Rand index of ${f2(splitAri)}.` },
    { p: 'Dolnicar and Leisch go further, re-running the segmentation on many bootstrap samples (samples of the same size drawn with replacement) and measuring how often each segment reappears. They distinguish natural segmentation, when the data hold real clusters; reproducible segmentation, when the data have structure that gives the same solution again and again without clear clusters; and constructive segmentation, when the data have no structure and the analyst and the business choose among many artificial solutions. Ana’s segments look reproducible: stable across starts, methods and halves, but overlapping. <i>Profiling segments</i> adds a fourth check, assigning held-back respondents to the segments.' },
    { callout: 'note', title: 'What Ana couldn’t see', html: `The case was generated with five kinds of coffee drinker planted in it, a truth no real analyst has. Against that truth, the five k-means segments score an adjusted Rand index of ${f2(D.segments.trueAgreement)}; two segments score ${f2(truthAri[2])}, four ${f2(truthAri[4])} and six ${f2(truthAri[6])}. Following the highest silhouette would have recovered the planted kinds far worse than following the elbow and the meaning. In real data there is no answer key, which is why the stability checks matter.` },
  ],

  formulas: [
    { id: 'ca-sq-distance', name: 'Squared Euclidean distance between two respondents',
      tex: String.raw`d^2(\mathbf{z}_i, \mathbf{z}_h) = \sum_{j=1}^{p} (z_{ij} - z_{hj})^2`,
      where: [
        [String.raw`d^2(\mathbf{z}_i, \mathbf{z}_h)`, 'Squared distance between respondents (or centres) i and h', 'squared standard deviations'],
        [String.raw`z_{ij},\ z_{hj}`, 'Their standardised ratings (z-scores) on segmentation variable j', 'standard deviations'],
        [String.raw`p`, 'Number of segmentation variables', ''],
      ],
      assumptions: 'Every variable is standardised first, so each counts equally.',
      note: 'B02’s Euclidean distance card is the square root of this; its standardisation card gives the z-scores. In Excel, with two rows of z-scores in B2:I2 and B16:I16: <x>=SUMPRODUCT((B2:I2-B16:I16)^2)</x>.' },
    { id: 'ca-centre', name: 'Segment centre (centroid)',
      tex: String.raw`c_{gj} = \dfrac{1}{n_g} \sum_{i \in g} z_{ij}`,
      where: [
        [String.raw`c_{gj}`, 'Centre of segment g on variable j: its members’ mean', 'standard deviations'],
        [String.raw`n_g`, 'Number of respondents in segment g', 'respondents'],
        [String.raw`z_{ij}`, 'Standardised rating of respondent i on variable j', 'standard deviations'],
      ],
      note: 'The update move of k-means recomputes every centre this way. In Excel, with the standardised ratings (z-scores) in B2:I641 and each respondent’s segment in J2:J641, <x>=AVERAGEIFS(B$2:B$641,$J$2:$J$641,$L2)</x> gives the centre of the segment named in L2 on the variable in column B.' },
    { id: 'ca-wcss', name: 'Within-cluster sum of squares (WCSS)',
      tex: String.raw`W_k = \sum_{g=1}^{k} \sum_{i \in g} d^2(\mathbf{z}_i, \mathbf{c}_g), \qquad T = (n - 1)\,p`,
      where: [
        [String.raw`W_k`, 'Within-cluster sum of squares of a k-segment solution', 'squared standard deviations'],
        [String.raw`d^2(\mathbf{z}_i, \mathbf{c}_g)`, 'Squared distance from respondent i to the centre of their own segment g', 'squared standard deviations'],
        [String.raw`k`, 'Number of segments', ''],
        [String.raw`T`, 'Total sum of squares: W with one segment; (n − 1)p for p standardised variables', 'squared standard deviations'],
        [String.raw`n`, 'Number of respondents', 'respondents'],
        [String.raw`p`, 'Number of segmentation variables', ''],
      ],
      assumptions: 'At its best, W falls (or stays level) as k rises, and is 0 when every respondent is a segment of one; k-means may stop above the best.',
      note: String.raw`1 − W ÷ T is the share of the variation that lies between segments. scikit-learn calls W the inertia.` },
    { id: 'ca-silhouette', name: 'Silhouette of a respondent, and the mean silhouette',
      tex: String.raw`s(i) = \dfrac{b(i) - a(i)}{\max\{a(i),\ b(i)\}}, \qquad \bar{s} = \dfrac{1}{n} \sum_{i=1}^{n} s(i)`,
      where: [
        [String.raw`a(i)`, 'Average Euclidean distance from respondent i to the other members of their own segment', 'standard deviations'],
        [String.raw`b(i)`, 'Lowest average distance from i to the members of another segment (the nearest other segment)', 'standard deviations'],
        [String.raw`s(i)`, 'Silhouette of respondent i, from −1 to 1', ''],
        [String.raw`\bar{s}`, 'Mean silhouette of the solution', ''],
        [String.raw`n`, 'Number of respondents', 'respondents'],
      ],
      assumptions: 'A respondent alone in a segment gets s = 0 by convention.',
      note: 'Rousseeuw (1987). Compare the mean silhouette only between solutions on the same variables and scaling.' },
    { id: 'ca-ward', name: 'Ward’s merge cost',
      tex: String.raw`\Delta(A, B) = \dfrac{n_A\, n_B}{n_A + n_B}\, d^2(\mathbf{c}_A, \mathbf{c}_B)`,
      where: [
        [String.raw`\Delta(A, B)`, 'Increase in the within-cluster sum of squares if groups A and B merge', 'squared standard deviations'],
        [String.raw`n_A,\ n_B`, 'Numbers of respondents in A and B', 'respondents'],
        [String.raw`d^2(\mathbf{c}_A, \mathbf{c}_B)`, 'Squared distance between their centres', 'squared standard deviations'],
      ],
      assumptions: 'Squared Euclidean distances on standardised variables.',
      note: 'At each step Ward’s method merges the pair with the smallest Δ. Two respondents alone merge at half their squared distance.' },
  ],

  examples: [
    { level: 'simple', title: 'k-means by hand at a bike shop', fictional: true,
      setup: `Pellmark Cycles asked eight customers how much two things matter when they buy, from 1 (not at all) to 7 (essential): a low price and expert advice. Run k-means with k = 2, starting from customers G and H as the two centres, until no customer changes segment.`,
      table: {
        caption: 'Pellmark Cycles: eight customers’ ratings (fictional)',
        head: ['Customer', 'Low price', 'Expert advice'],
        align: ['l', 'r', 'r'],
        rows: PTS.map((p, i) => [PM_NAMES[i], String(p[0]), String(p[1])]),
      },
      steps: [
        `Check the scale. Both needs use the same 1–7 scale, with standard deviations of ${f2(sdP[0])} and ${f2(sdP[1])}; standardising them gives exactly the same two segments (an adjusted Rand index of ${f0(pzAri)}), so this example works in rating points to keep the arithmetic readable.`,
        `Assign (iteration 1). Find each customer’s squared distance to G (3, 5) and to H (2, 5). A: (6 − 3)² + (2 − 5)² = ${d2(PTS[0], C0[0])} to G and (6 − 2)² + (2 − 5)² = ${d2(PTS[0], C0[1])} to H, so A joins G. B (${d2(PTS[1], C0[0])} against ${d2(PTS[1], C0[1])}), C (${d2(PTS[2], C0[0])} against ${d2(PTS[2], C0[1])}) and D (${d2(PTS[3], C0[0])} against ${d2(PTS[3], C0[1])}) join G too; E (${d2(PTS[4], C0[0])} against ${d2(PTS[4], C0[1])}) and F (${d2(PTS[5], C0[0])} against ${d2(PTS[5], C0[1])}) join H. Around the starting centres the WCSS is ${f0(W0)}.`,
        `Update. The centre of G’s group (A, B, C, D, G) is its members’ mean: low price (6 + 7 + 5 + 6 + 3) ÷ 5 = ${f1(C1[0][0])}, advice (2 + 1 + 2 + 3 + 5) ÷ 5 = ${f1(C1[0][1])}. H’s group (E, F, H) moves to (2 + 1 + 2) ÷ 3 = ${f2(C1[1][0])} and (6 + 7 + 5) ÷ 3 = ${f2(C1[1][1])}. The WCSS falls to ${f2(W1)}.`,
        `Assign and update (iteration 2). G is now ${f2(d2(PTS[6], C1[0]))} from (${f1(C1[0][0])}, ${f1(C1[0][1])}) and ${f2(d2(PTS[6], C1[1]))} from (${f2(C1[1][0])}, ${f2(C1[1][1])}), so G switches; no one else moves. The centres become (${C2[0].join(', ')}) for A, B, C and D and (${C2[1].join(', ')}) for E, F, G and H, and the WCSS falls to ${f2(W2)}.`,
        `Check. A third assignment moves no one: G, the closest call, is ${f0(d2(PTS[6], C2[0]))} from (${C2[0].join(', ')}) and ${f2(d2(PTS[6], C2[1]))} from (${C2[1].join(', ')}). k-means stops.`,
      ],
      answer: `Two segments: A, B, C and D, who put price first (centre: price ${C2[0][0]}, advice ${C2[0][1]}), and E, F, G and H, who put advice first (centre: price ${C2[1][0]}, advice ${C2[1][1]}). Within-cluster sum of squares ${f2(W2)}.`,
      interpretation: 'The poor start, two neighbouring advice-seekers, cost an extra iteration here and nothing more. With hundreds of respondents and eight needs, a poor start can leave k-means at a worse answer for good, which is why real analyses use k-means++ starts and many restarts.' },
    { level: 'challenging', title: 'Two segments or three?', fictional: true,
      setup: 'Pellmark’s owner asks whether three segments would describe the eight customers better than two. Compare the solutions for k = 1 to 4 on the within-cluster sum of squares and the mean silhouette, work out customer G’s silhouette in the two-segment solution, and decide.',
      table: {
        caption: 'Pellmark Cycles: k-means solutions (best of 50 starts)',
        head: ['k', 'Within-cluster sum of squares', 'Mean silhouette', 'Segment sizes'],
        align: ['r', 'r', 'r', 'l'],
        rows: [1, 2, 3, 4].map((k) => [String(k), f2(PMK[k].w), k > 1 ? f2(PMK[k].sil) : '—', PMK[k].sizes.join(', ')]),
      },
      steps: [
        `Read the within-cluster sum of squares. It falls at every k, from ${f2(PMK[1].w)} (one segment: the total) to ${f2(PMK[2].w)}, ${f2(PMK[3].w)} and ${f2(PMK[4].w)}, and would reach 0 at k = 8. The first fall (${f2(PMK[1].w - PMK[2].w)}) dwarfs the next (${f2(PMK[2].w - PMK[3].w)}): the elbow is at two.`,
        `Work out G’s silhouette for k = 2, with ordinary (not squared) distances. Within G’s segment: to E √2, to F √8 and to H 1, so a = (1.414 + 2.828 + 1) ÷ 3 = ${f3(aG)}. To the other segment: to A √18, to B √32, to C √13 and to D √13, so b = (4.243 + 5.657 + 3.606 + 3.606) ÷ 4 = ${f3(bG)}. s = (${f3(bG)} − ${f3(aG)}) ÷ ${f3(bG)} = ${f2(sG)}.`,
        `Compare the mean silhouettes, each the average of all eight customers’ silhouettes worked the same way: ${f2(PMK[2].sil)} for two segments, ${f2(PMK[3].sil)} for three and ${f2(PMK[4].sil)} for four. Three segments separate the customers less well than two.`,
        `Look at what the third segment is. k-means with k = 3 puts customer F, the keenest advice-seeker, in a segment of one (whose silhouette is 0 by convention). A segment of one customer isn’t substantial, one of module 1’s tests of a usable segment, and couldn’t justify an offer of its own.`,
      ],
      answer: `Two segments. The lower within-cluster sum of squares at k = 3 (${f2(PMK[3].w)} against ${f2(PMK[2].w)}) is guaranteed and proves nothing; the mean silhouette falls from ${f2(PMK[2].sil)} to ${f2(PMK[3].sil)}, and the third segment is one customer.`,
      interpretation: 'Eight customers make the comparison unusually clear. In a real survey the elbow is softer, the silhouette smaller and the segments overlap, so the decision leans on what the segments mean, as Lantern’s does.' },
    { level: 'applied', title: 'Choosing and checking Lantern’s segments', fictional: true,
      setup: `Ana’s analyst has run k-means on the ${N} respondents’ eight standardised needs for k = 2 to 8 (the table in The idea). Ana must decide how many segments to take into profiling, and whether she can trust them.`,
      steps: [
        `Elbow: the within-cluster sum of squares falls by ${f1(drop(2))}, ${f1(drop(3))}, ${f1(drop(4))} and ${f1(drop(5))} up to k = 5, then by only ${f1(drop(6))}, ${f1(drop(7))} and ${f1(drop(8))}. The bend is at five, where the segments leave ${pc(1 - W(5) / TSS)} of the variation between them.`,
        `Silhouette: highest at two (${f3(SIL(2))}), a local peak at five (${f3(SIL(5))}, against ${f3(SIL(4))} and ${f3(SIL(6))}). Two is a broad split, price and practicality against quality and values; five is the candidate.`,
        `Meaning: at five, the segments’ highest indexes against the average respondent are price (${IX[0][1]}) for A, energy (${IX[1][4]}) and convenience (${IX[1][2]}) for B, novelty (${IX[2][7]}) for C, local (${IX[3][6]}) and taste (${IX[3][0]}) for D, and health (${IX[4][5]}) and sustainability (${IX[4][3]}) for E. Each calls for a different offer. Four would merge C and D; six would split C into two strengths of the same need.`,
        `Stability: ${reachBest} of 100 single starts reach the same best solution; Ward’s method agrees (adjusted Rand index ${f2(D.segments.wardAgreement)}; ${wardDiffer} of ${N} respondents placed differently); the two halves of the sample give the same segments (${f2(splitAri)}).`,
        `Caveats to report: the structure is real but weak (a mean silhouette of ${f3(SIL(5))}, against ${f3(NF[5].sil)} for random ratings), the sample is below the guideline of ${f0(NEED100)} for eight variables, and it comes from an opt-in panel, so the segments describe these ${N} people first.`,
      ],
      answer: `Five segments, of ${SIZES.join(', ')} respondents (lettered A to E by size), stable across restarts, Ward’s method and the two halves of the sample.`,
      interpretation: 'Ana can take five segments into profiling with confidence that they are not an accident of one run, while saying plainly that they are a model with overlapping edges, not five separate populations. Their names, sizes in spend and the typing tool that assigns new customers come next.' },
  ],

  demo: [
    { widget: 'ca-needs', intro: `All ${N} respondents’ eight needs. Start at k = 5 and read the profile table: which needs does each segment rate above 100? Then try k = 4 and k = 6 and see which segments merge and split. Untick needs to see how the segments change when a need is left out, and untick “Standardise” to see how little it matters for ratings on one scale. The widget runs 12 restarts, so at k = 7 it may stop at a higher sum (${f1(WIDGET7)}) than the table’s ${f1(W(7))}, which is itself a local optimum: 200 restarts reach ${f1(MORE[7])}. At k = 6 its split of segment C may also differ a little from the one described in In depth.` },
    { widget: 'ca-spend', intro: `The same needs with monthly coffee spend in dollars added as a ninth variable. Untick “Standardise” and look at the segments’ spend per head: they become spend bands, with a silhouette (${f2(nsRawSil)} at k = 5) higher than any needs solution’s. Tick it again and the needs take over. Then untick “Monthly spend ($)” to return to the needs alone.` },
  ],

  mistakes: [
    { title: '“The clusters are the segments that exist in the market.”', html: `k-means returns k groups from any data: ${N} made-up respondents with random ratings still gave five segments. Clusters are a model you choose and check. Report how clear the structure is (the silhouette against a benchmark) and how stable it is, and call the segments what they are: groups of people with similar answers, with overlapping edges.` },
    { title: '“Choose the k with the lowest within-cluster sum of squares.”', html: 'The WCSS falls every time k rises and reaches 0 when every respondent is a segment of one. Look for where the falls shrink (the elbow), not for the lowest value.' },
    { title: '“The highest silhouette decides the number of segments.”', html: `The silhouette often peaks at a small k when one split dominates the data: Ana’s peaks at two, a split too coarse to plan offers around. It can’t be compared across different variables or scalings either (raw spend bands score ${f2(nsRawSil)}). Use it with the elbow, stability and what the segments mean.` },
    { title: '“One run of k-means gives the answer.”', html: `k-means stops at a local optimum that depends on its start: ${100 - reachBest} of 100 single starts on Ana’s data stopped at worse solutions. Use k-means++ starts, run many restarts, keep the lowest WCSS and report how many you ran.` },
    { title: '“Put every variable in the survey into the clustering.”', html: 'Demographics and behaviour mixed with needs give segments that are part need, part demographic, and hard to interpret. Duplicated items double-count a need, and every extra variable needs more respondents (about 100 each, by Dolnicar, Grün and Leisch’s guideline). Segment on the needs; describe with the rest.' },
    { title: '“Standardising is a formality.”', html: `It decides what the distances measure. On Ana’s 1–7 ratings it changes little, but add spend in dollars unstandardised and spend is ${pc(spendShare, 0)} of the variance: the segments become spend bands that agree with the needs segments only ${f2(nsRawAri)}.` },
  ],

  application: [
    { case: `Tollwick Software, a fictional firm that sells scheduling software to small businesses, wants to rebuild its onboarding around what different customers need. Its customer-insight lead, Teodora Rafferty, surveyed ${f0(LK.customers)} business customers on ${LK.needs} needs, from easy set-up to integration with accounting tools, each rated 1–7.` },
    { p: `<b>She writes the specification first.</b> Before looking at any results, Teodora records the segmentation variables (the ${LK.needs} needs, with firm size, sector and plan kept for describing), standardisation, k from 2 to 7, k-means with k-means++ starts and ${LK.restarts} restarts, Ward’s method as a check, and the stability tests. With ${f0(LK.customers)} customers she is above the guideline of 100 a variable (${f0(100 * LK.needs)}).` },
    { p: `<b>She shows the team three solutions, not one.</b> The silhouette is highest at three segments (${f2(LK.sil[3])}), with four close behind (${f2(LK.sil[4])}) and five lower (${f2(LK.sil[5])}). At four, the largest of the three segments splits into customers who want integrations and customers who want reports, and the product team points out that those two need different onboarding paths. Her split-half check gives an adjusted Rand index of ${f2(LK.split[4])} for four segments and ${f2(LK.split[5])} for five, so five is not stable enough to plan around.` },
    { p: `<b>She reports the choice with its evidence and its limits.</b> The team adopts four segments (${LK.sizes.join(', ')} customers), and her one-page summary gives the specification, the elbow and silhouette for every k, the stability results and a sentence on what the segments are not: “four groups of customers with similar needs, overlapping at the edges, not four kinds of customer with nothing in common.” She plans to re-run the segmentation each year with the same specification, so that a change in the segments reflects a change in customers rather than in the method.` },
    { p: 'Ana’s analysis followed the same pattern on a smaller scale, and her next job is the one Teodora’s team faced after choosing: profile each segment, give it an honest name, size it in people and in spend, and build a short questionnaire that assigns new customers to a segment.' },
  ],

  summary: [
    'Needs-based (post hoc) segmentation forms segments from customers’ needs with cluster analysis; demographics and behaviour describe the segments afterwards.',
    'Choose a few relevant, non-duplicated needs, with about 100 respondents per variable, and standardise them so each counts equally in the distances.',
    'k-means assigns each respondent to the nearest centre and moves each centre to its members’ mean until nothing changes, lowering the within-cluster sum of squares at every step.',
    'k-means stops at local optima, so use k-means++ starts and many restarts, and remember it returns k groups even from data with no structure.',
    'Ward’s method merges the two groups that raise the WCSS least, shows every k in a dendrogram, and is a useful check on k-means.',
    'Choose k from the elbow, the mean silhouette (s = (b − a) ÷ max(a, b)) and whether the segments mean something the business can act on; Lantern’s data give five.',
    'Check stability with restarts, a second method and a split-half test, comparing groupings with the adjusted Rand index (1 identical, about 0 chance).',
  ],

  glossary: [
    { term: 'Cluster analysis', def: 'A family of methods that sort observations into groups (clusters) whose members are more alike than members of different groups, judged by a chosen measure of distance. In marketing it forms segments from survey answers.' },
    { term: 'k-means clustering', def: 'A cluster analysis that sorts observations into k groups by repeatedly assigning each to the nearest group centre and moving each centre to the mean of its members, until no observation changes group; it makes the within-cluster sum of squares small.' },
    { term: 'Segment centre', def: 'The mean of a segment’s members on every segmentation variable; also called the centroid. In k-means each observation belongs to the segment with the nearest centre.' },
    { term: 'Squared Euclidean distance', def: 'The sum of the squared differences between two observations on every variable, Σ(x_j − y_j)²; the square of the straight-line distance.' },
    { term: 'Within-cluster sum of squares', def: 'The sum of every observation’s squared distance to the centre of its own cluster (WCSS); k-means makes it small, and it always falls as the number of clusters rises.' },
    { term: 'Local optimum', def: 'A solution that no small step can improve although a better solution exists elsewhere; k-means stops at one that depends on its starting centres.' },
    { term: 'k-means++', def: 'A way of choosing k-means’ starting centres: the first at random, each further one with probability proportional to its squared distance from the nearest centre already chosen, so the starts spread out (Arthur and Vassilvitskii, 2007).' },
    { term: 'Elbow', def: 'The point on a plot of the within-cluster sum of squares against the number of clusters after which extra clusters reduce it only a little; one guide to the number of clusters.' },
    { term: 'Silhouette', def: 'For one observation, (b − a) ÷ max(a, b), where a is its average distance to the other members of its cluster and b its average distance to the nearest other cluster; from −1 to 1, near 1 when it sits well inside its cluster (Rousseeuw, 1987). The mean silhouette summarises a solution.' },
    { term: 'Ward’s method', def: 'Hierarchical clustering that starts with every observation alone and repeatedly merges the two groups whose merger increases the within-cluster sum of squares least.' },
    { term: 'Dendrogram', def: 'A tree diagram of a hierarchical clustering, in which branches join at the height of each merge; cutting it at a height gives that many clusters.' },
    { term: 'Adjusted Rand index', def: 'A measure of agreement between two groupings of the same observations, counted over pairs and corrected for chance: 1 for identical groupings, about 0 for chance agreement (Hubert and Arabie, 1985).' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, chapter 5, “Market Segmentation, Targeting, and Positioning”: key terms (needs-based segmentation; market segmentation). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-key-terms', checked: '2026-10-25' },
    { text: 'Dolnicar, S., Grün, B. &amp; Leisch, F. (2018). <i>Market Segmentation Analysis: Understanding It, Doing It, and Making It Useful</i>. Springer (Management for Professionals), open access under CC BY 4.0. Chapter 2 (natural, reproducible and constructive segmentation), Step 5, “Extracting segments”, and Step 6, “Profiling segments” (statistical criteria are no substitute for user assessment).', url: 'https://link.springer.com/book/10.1007%2F978-981-10-8818-6', checked: '2026-10-25' },
    { text: 'Dolnicar, S. (2021). Data-driven market segmentation analysis. In <i>Women’s Voices in Tourism Research</i>, chapter 37. The University of Queensland. (States the guideline of 100 respondents per segmentation variable from Dolnicar, Grün &amp; Leisch, 2016, and the earlier 70; summarises natural, reproducible and constructive segmentation.)', url: 'https://uq.pressbooks.pub/tourismknowledge/chapter/market-segmentation-analysis-sara-dolnicar/', checked: '2026-10-25' },
    { text: 'Dolnicar, S., Grün, B. &amp; Leisch, F. (2016). Increasing sample size compensates for data problems in segmentation studies. <i>Journal of Business Research</i>, 69(2), 992–999. doi:10.1016/j.jbusres.2015.09.004. (The simulations behind the 100-per-variable guideline; the figure itself is given in Dolnicar, 2021, not in this abstract.)', url: 'https://ideas.repec.org/a/eee/jbrese/v69y2016i2p992-999.html', checked: '2026-10-25' },
    { text: 'Dolnicar, S. &amp; Leisch, F. (2010). Evaluation of structure and reproducibility of cluster solutions using the bootstrap. <i>Marketing Letters</i>, 21(1), 83–101. doi:10.1007/s11002-009-9083-4.', url: 'https://ideas.repec.org/a/kap/mktlet/v21y2010i1p83-101.html', checked: '2026-10-25' },
    { text: 'Arthur, D. &amp; Vassilvitskii, S. (2007). k-means++: the advantages of careful seeding. <i>Proceedings of the 18th Annual ACM-SIAM Symposium on Discrete Algorithms</i>, 1027–1035.', url: 'https://www.haralick.org/ML/kMeansPP-soda.pdf', checked: '2026-10-25' },
    { text: 'Ward, J. H., Jr. (1963). Hierarchical grouping to optimize an objective function. <i>Journal of the American Statistical Association</i>, 58, 236–244. doi:10.1080/01621459.1963.10500845.', url: 'https://doi.org/10.1080/01621459.1963.10500845', checked: '2026-10-25' },
    { text: 'Rousseeuw, P. J. (1987). Silhouettes: a graphical aid to the interpretation and validation of cluster analysis. <i>Journal of Computational and Applied Mathematics</i>, 20, 53–65. doi:10.1016/0377-0427(87)90125-7.', url: 'https://doi.org/10.1016/0377-0427(87)90125-7', checked: '2026-10-25' },
    { text: 'Kaufman, L. &amp; Rousseeuw, P. J. (1990). <i>Finding Groups in Data: An Introduction to Cluster Analysis</i>. Wiley. Their rough scale for the mean silhouette as reproduced in Emamat, M. S. M. M. et al. (2022), Using ELECTRE-TRI and FlowSort methods in a stock portfolio selection context, <i>Financial Innovation</i>, 8(1), table 16 (the book itself was not consulted).', url: 'https://jfin-swufe.springeropen.com/articles/10.1186/s40854-021-00318-1/tables/16', checked: '2026-10-25' },
    { text: 'Hubert, L. &amp; Arabie, P. (1985). Comparing partitions. <i>Journal of Classification</i>, 2, 193–218; the adjusted Rand index as documented in scikit-learn 1.9 (<code>adjusted_rand_score</code>).', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.adjusted_rand_score.html', checked: '2026-10-25' },
  ],

  checks: [
    // the study
    { what: 'Respondents', value: N, shown: 640 },
    { what: 'Needs', value: P, shown: 8 },
    { what: 'Study cost', value: STUDY.cost, shown: 9600 },
    { what: 'Scale 1–7: top', value: 7, shown: 7 },
    { what: 'One SD on all needs: squared distance', value: P * 1 ** 2, shown: 8 },
    { what: 'Two SDs on one need: squared distance', value: 2 ** 2, shown: 4 },
    { what: 'Restarts per k in the case', value: 20, shown: 20 },
    { what: 'k from 2 to 8: count', value: D.elbow.length, shown: 7 },
    // elbow table
    ...[2, 3, 4, 5, 6, 7, 8].flatMap((k) => [
      { what: `WCSS k = ${k}`, value: W(k), shown: +f1(W(k)).replace(/,/g, ''), tol: 0.05 },
      { what: `Fall to k = ${k}`, value: drop(k), shown: +f1(drop(k)).replace(/,/g, ''), tol: 0.05 },
      { what: `Silhouette k = ${k}`, value: SIL(k), shown: +f3(SIL(k)), tol: 0.0005 },
    ]),
    { what: 'Total sum of squares', value: TSS, shown: 5112 },
    { what: 'TSS equals the sum of the eight needs’ squared deviations in z', value: sum(Z.map((r) => sum(r.map((v) => v * v)))), shown: 5112, tol: 1e-6 },
    { what: 'n − 1', value: N - 1, shown: 639 },
    { what: 'Share between at k = 5 %', value: (1 - W(5) / TSS) * 100, shown: 65.4, tol: 0.05 },
    { what: 'Share within at k = 5 %', value: (W(5) / TSS) * 100, shown: 34.6, tol: 0.05 },
    { what: 'Five segment sizes', value: SIZES.join() === '152,146,129,109,104' ? 1 : 0, shown: 1 },
    { what: 'Elbow: 4→5 over three times 5→6', value: Number(drop(5) > 3 * drop(6)), shown: 1 },
    // standardising
    { what: 'Smallest need SD', value: sdMin, shown: 1.28 },
    { what: 'Largest need SD', value: sdMax, shown: 1.67 },
    { what: 'Raw needs ARI', value: rawAri, shown: 0.99 },
    { what: 'Spend variance', value: spendVar, shown: 867.7, tol: 0.05 },
    { what: 'Needs variances added', value: needsVar, shown: 17.2, tol: 0.05 },
    { what: 'Spend variance ÷ needs', value: spendVar / needsVar, shown: 50, tol: 0.5 },
    { what: 'Spend share of variance %', value: spendShare * 100, shown: 98.1, tol: 0.05 },
    { what: 'Spend share of variance, whole %', value: spendShare * 100, shown: 98, tol: 0.5 },
    ...bands.flatMap((b, i) => [{ what: `Band ${i + 1} low`, value: b.lo, shown: [6, 33, 54, 80, 117][i] }, { what: `Band ${i + 1} high`, value: b.hi, shown: [32, 53, 78, 115, 215][i] }]),
    { what: 'Needs + raw spend ARI', value: nsRawAri, shown: 0.11 },
    { what: 'Needs + raw spend silhouette', value: nsRawSil, shown: 0.47 },
    { what: 'Raw spend silhouette above every needs silhouette', value: Number(D.elbow.every((e) => nsRawSil > e.silhouette)), shown: 1 },
    { what: 'Needs + standardised spend ARI', value: nsZAri, shown: 0.95 },
    { what: 'Variables with spend', value: P + 1, shown: 9 },
    // local optima
    { what: 'Single starts', value: SINGLE.length, shown: 100 },
    { what: 'Single starts reaching the best', value: reachBest, shown: 60 },
    { what: 'Single starts stuck', value: 100 - reachBest, shown: 40 },
    { what: 'Best WCSS k = 5', value: W(5), shown: 1767.9, tol: 0.05 },
    { what: 'Stuck low', value: stuckLo, shown: 2015.9, tol: 0.05 },
    { what: 'Stuck high', value: stuckHi, shown: 2201.7, tol: 0.05 },
    { what: 'Stuck low % worse', value: (stuckLo / W(5) - 1) * 100, shown: 14, tol: 0.5 },
    { what: 'Stuck high % worse', value: (stuckHi / W(5) - 1) * 100, shown: 25, tol: 0.5 },
    { what: 'Worst single-start ARI', value: worstAri, shown: 0.64 },
    { what: '200 restarts', value: 200, shown: 200 },
    { what: '200 restarts: same at k = 5', value: Number(Math.abs(MORE[5] - W(5)) < 1e-6), shown: 1 },
    { what: '200 restarts k = 6', value: MORE[6], shown: 1677.6, tol: 0.05 },
    { what: '200 restarts k = 7', value: MORE[7], shown: 1596.4, tol: 0.05 },
    { what: '200 restarts k = 8', value: MORE[8], shown: 1526.0, tol: 0.05 },
    { what: 'All less than 0.1% below', value: Number([6, 7, 8].every((k) => MORE[k] < W(k) && (W(k) - MORE[k]) / W(k) < 0.001)), shown: 1 },
    { what: 'Widget k = 7 (12 restarts)', value: WIDGET7, shown: 1607.6, tol: 0.05 },
    { what: 'Widget restarts', value: 12, shown: 12 },
    // the benchmark
    { what: 'Benchmark k = 5 smallest', value: Math.min(...NF[5].sizes), shown: 121 },
    { what: 'Benchmark k = 5 largest', value: Math.max(...NF[5].sizes), shown: 138 },
    { what: 'Benchmark silhouette k = 5', value: NF[5].sil, shown: 0.095, tol: 0.0005 },
    { what: 'About three times the benchmark', value: SIL(5) / NF[5].sil, shown: 3, tol: 0.5 },
    ...noiseDrops.map((v, i) => ({ what: `Benchmark drop ${i + 3}`, value: v, shown: [345, 251, 211, 198, 163, 144][i], tol: 0.5 })),
    { what: 'Benchmark restarts', value: 100, shown: 100 },
    { what: 'Shuffled benchmark silhouette', value: shufSil, shown: 0.10 },
    { what: 'Correlated benchmark low', value: corrLo, shown: 0.14 },
    { what: 'Correlated benchmark high', value: corrHi, shown: 0.15 },
    { what: 'Correlated draws', value: corrSil.length, shown: 3 },
    { what: 'About twice the correlated benchmark', value: SIL(5) / ((corrLo + corrHi) / 2), shown: 2, tol: 0.2 },
    { what: 'K&R strong from', value: KR[0][0], shown: 0.71 },
    { what: 'K&R reasonable from', value: KR[1][0], shown: 0.51 },
    { what: 'K&R reasonable to', value: 0.70, shown: 0.70 },
    { what: 'K&R weak from', value: KR[2][0], shown: 0.26 },
    { what: 'K&R weak to', value: 0.50, shown: 0.50 },
    { what: 'K&R none up to', value: 0.25, shown: 0.25 },
    { what: 'Ana’s 0.305 falls in the weak band', value: Number(SIL(5) >= 0.26 && SIL(5) <= 0.50), shown: 1 },
    { what: 'Kaufman & Rousseeuw year', value: 1990, shown: 1990 },
    { what: 'Ward caption: A–C cost', value: wardAC, shown: 0.50 },
    { what: 'Ward caption: A–C height', value: PWARD.merges[0].height, shown: 1 },
    { what: 'Ward caption: last height', value: PWARD.merges[6].height, shown: 10.97, tol: 0.005 },
    { what: 'Ward caption: last cost', value: mergeCost[6], shown: 60.13, tol: 0.005 },
    { what: 'Ward caption: last cost = first fall in the table', value: mergeCost[6], shown: PMK[1].w - PMK[2].w, tol: 1e-9 },
    { what: 'k = 6 restarts', value: 200, shown: 200 },
    // sample size
    { what: '100 per variable', value: NEED100, shown: 800 },
    { what: '70 per variable', value: NEED70, shown: 560 },
    { what: 'Guideline per variable', value: 100, shown: 100 },
    { what: 'Older guideline per variable', value: 70, shown: 70 },
    // k = 2, 4, 6
    { what: 'k = 2 price group size', value: c25[g2price].reduce((a, b) => a + b, 0), shown: 312 },
    { what: 'k = 2 other group size', value: c25[g2other].reduce((a, b) => a + b, 0), shown: 328 },
    { what: 'k = 2 price index', value: ix2[g2price][1], shown: 120 },
    { what: 'k = 2 convenience index', value: ix2[g2price][2], shown: 119 },
    { what: 'k = 2 energy index', value: ix2[g2price][4], shown: 118 },
    { what: 'k = 2 other group: five needs above 100', value: Number([0, 3, 5, 6, 7].every((j) => ix2[g2other][j] > 100)), shown: 1 },
    { what: 'k = 4 merged group', value: merged.reduce((a, b) => a + b, 0), shown: 229 },
    { what: 'k = 4 merged group holds most of C', value: merged[2], shown: 125 },
    { what: 'k = 4 merged group holds most of D', value: merged[3], shown: 104 },
    { what: 'k = 6 bigger part of C', value: six(cSplit[0].j), shown: 76 },
    { what: 'k = 6 bigger part: from C', value: cSplit[0].v, shown: 74 },
    { what: 'k = 6 bigger part: from D', value: c56[3][cSplit[0].j], shown: 2 },
    { what: 'k = 6 bigger part: C plus D is all of it', value: six(cSplit[0].j) - cSplit[0].v - c56[3][cSplit[0].j], shown: 0 },
    { what: 'k = 6 smaller part of C', value: six(cSplit[1].j), shown: 55 },
    { what: 'k = 6 novelty index, bigger part', value: ix6[cSplit[0].j][7], shown: 165 },
    { what: 'k = 6 novelty index, smaller part', value: ix6[cSplit[1].j][7], shown: 148 },
    { what: 'k = 6 bigger part: taste and local above 100', value: Number(ix6[cSplit[0].j][0] > 100 && ix6[cSplit[0].j][6] > 100), shown: 1 },
    { what: 'k = 6 smaller part: every other need below 100', value: Number(ix6[cSplit[1].j].every((v, j) => j === 7 || v < 100)), shown: 1 },
    // five-segment indexes
    { what: 'A price index', value: IX[0][1], shown: 142 },
    { what: 'B energy index', value: IX[1][4], shown: 147 },
    { what: 'B convenience index', value: IX[1][2], shown: 137 },
    { what: 'C novelty index', value: IX[2][7], shown: 158 },
    { what: 'D local index', value: IX[3][6], shown: 168 },
    { what: 'D taste index', value: IX[3][0], shown: 136 },
    { what: 'E health index', value: IX[4][5], shown: 168 },
    { what: 'E sustainability index', value: IX[4][3], shown: 159 },
    // Ward, splits, truth
    { what: 'Ward ARI', value: D.segments.wardAgreement, shown: 0.93 },
    { what: 'Ward same', value: N - wardDiffer, shown: 624 },
    { what: 'Ward same %', value: wardSame * 100, shown: 97.5, tol: 0.05 },
    { what: 'Ward differ', value: wardDiffer, shown: 16 },
    { what: 'Half', value: HALF, shown: 320 },
    { what: 'Split-half ARI', value: splitAri, shown: 0.97 },
    { what: 'Truth ARI k = 5', value: D.segments.trueAgreement, shown: 0.94 },
    { what: 'Truth ARI k = 2', value: truthAri[2], shown: 0.38 },
    { what: 'Truth ARI k = 4', value: truthAri[4], shown: 0.76 },
    { what: 'Truth ARI k = 6', value: truthAri[6], shown: 0.88 },
    { what: 'Planted kinds', value: 5, shown: 5 },
    { what: 'Hubert & Arabie year', value: 1985, shown: 1985 },
    { what: 'Rousseeuw year', value: 1987, shown: 1987 },
    { what: 'Ward year', value: 1963, shown: 1963 },
    { what: 'Arthur & Vassilvitskii year', value: 2007, shown: 2007 },
    // Pellmark
    { what: 'Pellmark customers', value: PTS.length, shown: 8 },
    { what: 'Pellmark WCSS around the starts', value: W0, shown: 82 },
    { what: 'Pellmark WCSS after 1', value: W1, shown: 21.07 },
    { what: 'Pellmark WCSS after 2', value: W2, shown: 8.75 },
    { what: 'Pellmark: nothing moves in iteration 3', value: Number(L3.every((l, i) => l === L2[i])), shown: 1 },
    { what: 'Pellmark: only G moves in iteration 2', value: L1.filter((l, i) => l !== L2[i]).length + (L1[6] !== L2[6] ? 10 : 0), shown: 11 },
    { what: 'Pellmark SD price', value: sdP[0], shown: 2.27 },
    { what: 'Pellmark SD advice', value: sdP[1], shown: 2.17 },
    { what: 'Pellmark standardised ARI', value: pzAri, shown: 1 },
    { what: 'A to G', value: d2(PTS[0], C0[0]), shown: 18 },
    { what: 'A to H', value: d2(PTS[0], C0[1]), shown: 25 },
    { what: 'B to G', value: d2(PTS[1], C0[0]), shown: 32 },
    { what: 'B to H', value: d2(PTS[1], C0[1]), shown: 41 },
    { what: 'C to G', value: d2(PTS[2], C0[0]), shown: 13 },
    { what: 'C to H', value: d2(PTS[2], C0[1]), shown: 18 },
    { what: 'D to G', value: d2(PTS[3], C0[0]), shown: 13 },
    { what: 'D to H', value: d2(PTS[3], C0[1]), shown: 20 },
    { what: 'E to G', value: d2(PTS[4], C0[0]), shown: 2 },
    { what: 'E to H', value: d2(PTS[4], C0[1]), shown: 1 },
    { what: 'F to G', value: d2(PTS[5], C0[0]), shown: 8 },
    { what: 'F to H', value: d2(PTS[5], C0[1]), shown: 5 },
    { what: 'Centre 1 price after 1', value: C1[0][0], shown: 5.4 },
    { what: 'Centre 1 advice after 1', value: C1[0][1], shown: 2.6 },
    { what: 'Centre 2 price after 1', value: C1[1][0], shown: 1.67 },
    { what: 'Centre 2 advice after 1', value: C1[1][1], shown: 6.00 },
    { what: 'Centre 2 advice after 1 (1 dp, figure)', value: C1[1][1], shown: 6 },
    { what: 'G to centre 1 after 1', value: d2(PTS[6], C1[0]), shown: 11.52 },
    { what: 'G to centre 2 after 1', value: d2(PTS[6], C1[1]), shown: 2.78 },
    { what: 'Final centre 1', value: C2[0][0] * 10 + C2[0][1], shown: 62 },
    { what: 'Final centre 2 price', value: C2[1][0], shown: 2 },
    { what: 'Final centre 2 advice', value: C2[1][1], shown: 5.75 },
    { what: 'G to final centre 1', value: d2(PTS[6], C2[0]), shown: 18 },
    { what: 'G to final centre 2', value: d2(PTS[6], C2[1]), shown: 1.56, tol: 0.005 },
    { what: 'Pellmark WCSS k = 1', value: PMK[1].w, shown: 68.875 },
    { what: 'Pellmark WCSS k = 1 (2 dp)', value: PMK[1].w, shown: 68.88, tol: 0.005 },
    { what: 'Pellmark WCSS k = 2', value: PMK[2].w, shown: 8.75 },
    { what: 'Pellmark WCSS k = 3', value: PMK[3].w, shown: 5.33 },
    { what: 'Pellmark WCSS k = 4', value: PMK[4].w, shown: 2.67 },
    { what: 'Pellmark first fall', value: PMK[1].w - PMK[2].w, shown: 60.13, tol: 0.005 },
    { what: 'Pellmark second fall', value: PMK[2].w - PMK[3].w, shown: 3.42, tol: 0.005 },
    { what: 'Pellmark silhouette k = 2', value: PMK[2].sil, shown: 0.71 },
    { what: 'Pellmark silhouette k = 3', value: PMK[3].sil, shown: 0.50 },
    { what: 'Pellmark silhouette k = 4', value: PMK[4].sil, shown: 0.31 },
    { what: 'Pellmark k = 3 has a segment of one', value: Number(PMK[3].sizes.includes(1) && PMK[3].labels.filter((l) => l === PMK[3].labels[5]).length === 1), shown: 1 },
    { what: 'Pellmark k = 2 = A–D v E–H', value: Number(PMK[2].labels.slice(0, 4).every((l) => l === PMK[2].labels[0]) && PMK[2].labels.slice(4).every((l) => l === PMK[2].labels[4]) && PMK[2].labels[0] !== PMK[2].labels[4]), shown: 1 },
    { what: 'Pellmark k-means = start from G, H', value: Number(L2.every((l, i) => (l === 0) === (PMK[2].labels[i] === PMK[2].labels[0]))), shown: 1 },
    { what: 'Restarts for Pellmark', value: 50, shown: 50 },
    { what: '√2', value: Math.SQRT2, shown: 1.414, tol: 0.0005 },
    { what: '√8', value: Math.sqrt(8), shown: 2.828, tol: 0.0005 },
    { what: '√18', value: Math.sqrt(18), shown: 4.243, tol: 0.0005 },
    { what: '√32', value: Math.sqrt(32), shown: 5.657, tol: 0.0005 },
    { what: '√13', value: Math.sqrt(13), shown: 3.606, tol: 0.0005 },
    { what: 'G: a', value: aG, shown: 1.748, tol: 0.0005 },
    { what: 'G: b', value: bG, shown: 4.278, tol: 0.0005 },
    { what: 'G: s', value: sG, shown: 0.59 },
    { what: 'Ward A with C cost', value: wardAC, shown: 0.5 },
    { what: 'Ward first merge height = 1', value: PWARD.merges[0].height, shown: 1 },
    { what: 'Ward first merge cost from the height', value: mergeCost[0], shown: wardAC, tol: 1e-12 },
    { what: 'Ward D joins at', value: PWARD.merges[2].height, shown: 1.3, tol: 0.05 },
    { what: 'Ward B joins at', value: PWARD.merges[4].height, shown: 2.3, tol: 0.05 },
    { what: 'Ward F joins at', value: PWARD.merges[5].height, shown: 2.6, tol: 0.05 },
    { what: 'Ward last merge', value: PWARD.merges[6].height, shown: 11.0, tol: 0.05 },
    { what: 'Ward costs add up to the total', value: sum(mergeCost), shown: PMK[1].w, tol: 1e-9 },
    { what: 'Ward cut at 2 = k-means', value: wardCut2Ari, shown: 1 },
    { what: 'Cut line at height 6, below the last merge and above the rest', value: Number(PWARD.merges[5].height < 6 && PWARD.merges[6].height > 6), shown: 1 },
    { what: 'Leaf order BDACFGEH', value: Number(PORDER.map((i) => PM_NAMES[i]).join('') === 'BDACFGEH'), shown: 1 },
    // Tollwick
    { what: 'Tollwick customers', value: LK.customers, shown: 1150 },
    { what: 'Tollwick needs', value: LK.needs, shown: 7 },
    { what: 'Tollwick restarts', value: LK.restarts, shown: 50 },
    { what: 'Tollwick guideline', value: 100 * LK.needs, shown: 700 },
    { what: 'Tollwick sizes add up', value: sum(LK.sizes), shown: 1150 },
    { what: 'Tollwick k range top', value: 7, shown: 7 },
  ],
};
