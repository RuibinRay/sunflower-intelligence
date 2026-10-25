// assess-final.js — M05 final assessment: 24 questions across all four modules and all eight of the course’s outcomes,
// two or three per lesson (six for module 1, six for module 2, five for module 3 and seven for module 4). 70% passes.
// Mixed conceptual, numerical and applied items; four are formula items (two of them steps) on worksheets whose inputs
// are scaled or varied on the marking copies, so that typed results fail. Many combine what several lessons teach:
// the gain from tailored offers, then which segments are substantial enough to keep (m05-fn-1); a demographic as a
// descriptor of a needs segment, read from a cross-tab in both directions and sharpened by a second descriptor
// (m05-fn-3); whether a base is good depends on the decision it serves and on the strength of the association, not its
// p-value (m05-fn-4); the heaviest buyers’ share in Excel, then what it means for the light ones (m05-fn-5); choosing k
// from the elbow, the silhouette and a no-structure benchmark, then naming a segment from its index profile (m05-fn-7);
// rating indexes against standardised centres (m05-fn-10); the typing tool’s standardising and squared distances in
// Excel (m05-fn-11); threshold weights for every factor in Excel, then which judgement decides the choice (m05-fn-13);
// a rival’s move on the perceptual map fed back into the room factor of Lantern’s scorecard (m05-fn-14); the distance
// between two segments’ centres, then whether their indexes let one offer serve both (m05-fn-15); persona lines judged
// against segment data (m05-fn-16); a second channel for a distant segment, with cannibalisation and M02’s channel
// economics (m05-fn-17); each segment’s nearest brand on the map, then whether the least closely served is an opening
// given fit and spend (m05-fn-18); a short arrow on a biplot and what two nearby brands can still differ on
// (m05-fn-19); the all-customer ideal point as the size-weighted average of segment ideals, and why positioning at it
// suits nobody (m05-fn-20); the nearest rival read from a map, then points of parity and difference against it
// (m05-fn-21); a planned move on fixed axes and its distance to every segment in Excel (m05-fn-23); a sub-brand rather
// than repositioning when the target is far from the brand (m05-fn-24).
// Lantern’s needs study appears from new angles (income and café use as descriptors of Craft and local, Mindful’s size
// from the panel, Arcadia moving nearer the Craft and local ideal, Mindful’s centre against Craft and local’s, the
// convenience-store channel, the least closely served segment); the other businesses are fictional and used nowhere else
// on the site, and nothing comes from the project’s scenario or data. No hints; solutions are shown on review. Every num
// item’s `check` recomputes its answer, every figure a prompt states is computed below from its inputs, and every formula
// item is marked by its results on the sheet and on changed copies.
import { RESPONDENTS, DERIVED, BRANDS, NEEDS } from './case.js?v=14';
import { CHANNELS, DEFAULT_PLAN, TIERS, CATEGORY } from '../m02/market.js?v=14';
import { weightedScore } from '../../../core/percmap.js?v=14';
import { normInv } from '../../../core/inference.js?v=14';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 2) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r0 = (x) => Math.round(x), r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const dist = (a, b) => Math.sqrt(sum(a.map((v, j) => (v - b[j]) ** 2)));
const Z = normInv(0.975);

// Lantern's segments (case.js)
const S = DERIVED.segments, NAMES = S.names, LAB = S.labels;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), OG = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const ORDER = [VR, OG, EX, CL, MI];

// ---------------------------------------------------------------- module 1: segmentation bases
// a community arts centre (fictional): three tailored memberships beside the general one
const ARTS = { m1: 120, F: 7000, groups: [
  { name: 'Families with young children', N: 4000, b1: 0.02, m2: 90, b2: 0.05 },
  { name: 'Retired people', N: 6000, b1: 0.03, m2: 100, b2: 0.06 },
  { name: 'Working artists', N: 300, b1: 0.08, m2: 260, b2: 0.12 },
] };
const artsPer = (g) => g.b2 * g.m2 - g.b1 * ARTS.m1;
const artsGain = ARTS.groups.map((g) => g.N * artsPer(g) - ARTS.F);
const artsAll = sum(artsGain);
const artsBest = sum(artsGain.filter((v) => v > 0));
const artsMinArtists = Math.ceil(ARTS.F / artsPer(ARTS.groups[2]) - 1e-9);
// a pet insurer's 'first-time worriers' (fictional)
const PET = { owners: 52000, share: 0.18, spend: 420, line: 90000, top2: [0.64, 0.22] };
const petN = PET.owners * PET.share;
// Lantern: income over $80,000 and café use as descriptors of Craft and local
const RS = RESPONDENTS;
const hi = (r) => r.income >= 2, cafe = (r) => r.source === 0;
const cnt = (f) => RS.filter(f).length;
const inCL = (i) => LAB[i] === CL;
const D3 = {
  clHiCafe: cnt((r, i) => inCL(i) && hi(r) && cafe(r)), clHiOther: cnt((r, i) => inCL(i) && hi(r) && !cafe(r)), clLo: cnt((r, i) => inCL(i) && !hi(r)),
  allHiCafe: cnt((r) => hi(r) && cafe(r)), allHiOther: cnt((r) => hi(r) && !cafe(r)), allLo: cnt((r) => !hi(r)),
};
D3.cl = D3.clHiCafe + D3.clHiOther + D3.clLo; D3.clHi = D3.clHiCafe + D3.clHiOther; D3.allHi = D3.allHiCafe + D3.allHiOther; D3.n = RS.length;
const d3Hi = D3.clHi / D3.allHi, d3HiCafe = D3.clHiCafe / D3.allHiCafe, d3Rev = D3.clHi / D3.cl;
// a farm shop's veg-box scheme (fictional): boxes bought last year by 25 members
const BOX = [14, 3, 41, 9, 21, 6, 30, 1, 17, 12, 48, 5, 23, 8, 2, 26, 11, 19, 4, 36, 7, 16, 10, 13, 15];
const boxTop = sum([...BOX].sort((a, b) => b - a).slice(0, 5));
const boxShare = boxTop / sum(BOX);
const boxCells = { A1: 'member', B1: 'boxes last year', ...col('A', 2, BOX.map((_, i) => `M${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, BOX), D2: 'share of boxes bought by the heaviest 20% of members' };

// ---------------------------------------------------------------- module 2: segmenting with data
// a regional theatre (fictional): 900 respondents, six standardised needs
const TH = { n: 900, p: 6, ks: [2, 3, 4, 5, 6, 7], wcss: [3880, 3300, 2790, 2450, 2330, 2240], sil: [0.30, 0.25, 0.23, 0.26, 0.22, 0.20], random: 0.09 };
const thT = (TH.n - 1) * TH.p;
const thFall = TH.wcss.map((w, i) => (i ? TH.wcss[i - 1] : thT) - w);
const TH_NEEDS = ['A low price', 'Star names', 'New writing', 'Classic plays', 'Convenient times', 'A night out with friends'];
const TH_INDEX = [74, 92, 168, 63, 95, 104];
const TH_YOUNG = [0.61, 0.33];
// a swimming club (fictional): six members' visits last month, two runs of k-means with k = 2
const SWIM = { ids: ['A', 'B', 'C', 'D', 'E', 'F'], v: [1, 2, 3, 10, 11, 30] };
function kmeans1d(x, c) {
  let centres = c.slice(), labels = [];
  for (let it = 0; it < 50; it++) {
    const next = x.map((v) => (Math.abs(v - centres[0]) <= Math.abs(v - centres[1]) ? 0 : 1));
    if (next.join() === labels.join()) break;
    labels = next;
    centres = [0, 1].map((g) => { const m = x.filter((_, i) => labels[i] === g); return sum(m) / m.length; });
  }
  return { labels, centres, wcss: sum(x.map((v, i) => (v - centres[labels[i]]) ** 2)) };
}
const swim1 = kmeans1d(SWIM.v, [SWIM.v[0], SWIM.v[5]]), swim2 = kmeans1d(SWIM.v, [SWIM.v[0], SWIM.v[4]]);
const swimStart2 = sum(SWIM.v.map((v) => Math.min((v - SWIM.v[0]) ** 2, (v - SWIM.v[4]) ** 2)));
const groupOf = (run, g) => SWIM.ids.filter((_, i) => run.labels[i] === g).join(', ');
// Ward's method on a bakery's ten wholesale customers (fictional): the increase in WCSS at each merge
const WARD = [0.3, 0.4, 0.4, 0.6, 0.7, 0.9, 1.1, 6.2, 9.8];
const wardWcss = (groups) => sum(WARD.slice(0, 10 - groups));     // ten customers: after m merges, 10 − m groups
// a supermarket's 'health-first shoppers' (fictional): two needs, segment and all-shopper means and SDs
const HF = [
  { need: 'Organic range', seg: 3.0, all: 2.0, sd: 1.5 },
  { need: 'Fresh produce', seg: 6.4, all: 5.2, sd: 0.8 },
].map((x) => ({ ...x, index: (x.seg / x.all) * 100, z: (x.seg - x.all) / x.sd }));
// a pet-food brand's typing tool (fictional): three golden questions
const PF = { qs: ['A low price', 'Natural ingredients', 'Recommended by vets'], ans: [3, 6, 6], mu: [4.3, 4.9, 3.6], sd: [1.6, 1.2, 1.5],
  segs: ['Bargain feeders', 'Natural first', 'Vet-led', 'Habit buyers'], z: [[1.1, -0.7, -0.4], [-0.5, 1.0, 0.2], [-0.3, 0.1, 1.3], [0.2, -0.6, -0.8]] };
const pfZ = PF.ans.map((a, j) => (a - PF.mu[j]) / PF.sd[j]);
const pfD = PF.z.map((c) => sum(c.map((v, j) => (pfZ[j] - v) ** 2)));
const pfNear = pfD.indexOf(Math.min(...pfD));
const pfSecond = pfD.map((d, g) => ({ d, g })).sort((a, b) => a.d - b.d)[1].g;
const pfCells = {
  B1: PF.qs[0], C1: PF.qs[1], D1: PF.qs[2],
  A2: 'new customer’s answer (1–7)', B2: PF.ans[0], C2: PF.ans[1], D2: PF.ans[2],
  A3: 'study mean', B3: PF.mu[0], C3: PF.mu[1], D3: PF.mu[2],
  A4: 'study standard deviation', B4: PF.sd[0], C4: PF.sd[1], D4: PF.sd[2],
  A6: 'segment centre (z)', B6: PF.qs[0], C6: PF.qs[1], D6: PF.qs[2], E6: 'squared distance',
  ...Object.fromEntries(PF.segs.flatMap((s, g) => [[`A${g + 7}`, s], ...PF.z[g].map((v, j) => [`${'BCD'[j]}${g + 7}`, v])])),
};
// Mindful's size from the panel
const miN = S.sizes[MI].n, miShare = S.sizes[MI].share;
const miMoe = Z * Math.sqrt((miShare * (1 - miShare)) / RS.length);

// ---------------------------------------------------------------- module 3: targeting
// a car-rental firm (fictional): business travellers (A) against holidaymakers (B)
const CAR = { factors: ['Size', 'Spend per head', 'Growth', 'Room from the nearest rival', 'Fit with the firm’s strengths'], w: [4, 3, 2, 2, 4], A: [100, 85, 40, 60, 90], B: [80, 70, 100, 75, 60] };
const carSum = (s) => sum(s.map((v, k) => v * CAR.w[k]));
const carGap = carSum(CAR.A) - carSum(CAR.B);
const carDelta = CAR.A.map((a, k) => carGap / (CAR.B[k] - a));
const carCells = {
  A1: 'factor', B1: 'weight', C1: 'Business travellers', D1: 'Holidaymakers', E1: 'change in weight that ties them',
  ...col('A', 2, CAR.factors), ...col('B', 2, CAR.w), ...col('C', 2, CAR.A), ...col('D', 2, CAR.B),
  A7: 'weighted sum (Σ weight × score)', C7: '=SUMPRODUCT($B$2:$B$6,C2:C6)', D7: '=SUMPRODUCT($B$2:$B$6,D2:D6)',
};
// Lantern's scorecard (evaluating-segments): ratio-to-best scores, fit centred on 50, Ana's weights; then Arcadia moves
const share = S.sizes.map((s) => s.share), head = S.sizes.map((s) => s.perHead);
const growth = DERIVED.targeting.growth, fit = DERIVED.targeting.fit;
const room = DERIVED.map.nearestRival.map((x) => x.d);
const ratio = (a) => a.map((v) => (100 * v) / Math.max(...a));
const maxFit = Math.max(...fit.map(Math.abs));
const fitS = fit.map((v) => 50 + (50 * v) / maxFit);
const W_ANA = [4, 4, 2, 2, 4];
const scoreWith = (rm) => weightedScore([ratio(share), ratio(head), ratio(growth), ratio(rm), fitS], W_ANA);
const ARC = 0.70;                                                     // Arcadia's new distance from the Craft and local ideal
const roomNew = room.map((d, g) => (g === CL ? ARC : d));
const T0 = scoreWith(room), T1 = scoreWith(roomNew);
const roomScoreOld = ratio(room), roomScoreNew = ratio(roomNew);
const clRest = [ratio(share)[CL], ratio(head)[CL], ratio(growth)[CL], fitS[CL]];
const clWith = (roomScore) => (W_ANA[0] * clRest[0] + W_ANA[1] * clRest[1] + W_ANA[2] * clRest[2] + W_ANA[3] * roomScore + W_ANA[4] * clRest[3]) / sum(W_ANA);
const bestRoomNew = Math.max(...roomNew), bestRoomSeg = roomNew.indexOf(bestRoomNew);
const tieD = ((T1[EX] * sum(W_ANA) - (W_ANA[0] * clRest[0] + W_ANA[1] * clRest[1] + W_ANA[2] * clRest[2] + W_ANA[4] * clRest[3])) / W_ANA[3]) * bestRoomNew / 100;
// Mindful's centre against Craft and local's
const cMI = S.centres[MI], cCL = S.centres[CL];
const dMICL = dist(cMI, cCL), dCLEX = dist(cCL, S.centres[EX]), dCLOG = dist(cCL, S.centres[OG]);
const miNearest = ORDER.filter((g) => g !== MI).map((g) => ({ g, d: dist(cMI, S.centres[g]) })).sort((a, b) => a.d - b.d)[0].g;
// a regional rail operator's 'weekend explorers' (fictional)
const RAIL = { n: 412, others: 2188, age: 239, ageOthers: 687, scenic: 293, scenicOthers: 394, app: 194, station: 128, web: 90, median: 3, mean: 4.6 };
// Lantern Cold Brew in convenience stores (M02's channel economics)
const ch = (id) => CHANNELS.find((c) => c.id === id);
const PRICE = DEFAULT_PLAN.price, LIQ = TIERS.find((t) => t.id === DEFAULT_PLAN.tier).cogs;
const mConv = PRICE * (1 - ch('convenience').margin) - LIQ, mSup = PRICE * (1 - ch('supermarket').margin) - LIQ;
const LIST = ch('convenience').listing, CANNIB = 0.30;
const convQ = (per) => Math.ceil(LIST / per - 1e-9);
const convNeed = convQ(mConv - CANNIB * mSup);
const convChannel = CATEGORY.cansPerYear * ch('convenience').volume;

// ---------------------------------------------------------------- module 4: positioning
// Lantern's map: each segment's distance to every brand
const MD = DERIVED.map.distances;
const nearestBrand = MD.map((row) => { const b = row.indexOf(Math.min(...row)); return { b, d: row[b] }; });
const leastServed = nearestBrand.map((x, g) => ({ ...x, g })).sort((a, b) => b.d - a.d)[0];
// a bank map (fictional): a short arrow
const BANK = { l1: 0.35, l2: 0.40, P: 6.1, Q: 2.9, share: 0.88 };
const bankH2 = BANK.l1 ** 2 + BANK.l2 ** 2;
// running-shoe buyers (fictional): three segments' ideal points and the all-customer ideal
const RUN = { segs: ['Racers', 'Comfort walkers', 'Fashion buyers'], size: [0.40, 0.35, 0.25], ideal: [[2.0, 1.0], [-1.5, 1.5], [0.5, -2.0]] };
const runAll = [0, 1].map((k) => sum(RUN.ideal.map((p, g) => RUN.size[g] * p[k])));
const runD = RUN.ideal.map((p) => dist(runAll, p));
const runNear = runD.indexOf(Math.min(...runD));
const runPlain = [0, 1].map((k) => sum(RUN.ideal.map((p) => p[k])) / RUN.ideal.length);
// Fernlow Yoga (fictional) and three rival studios: the map, then the screen against the nearest rival
const YO = { studios: ['Fernlow Yoga', 'Studio Q', 'Studio R', 'Studio S'], at: [[1.2, 0.8], [1.5, 0.3], [-1.4, 1.1], [0.2, -1.2]], ideal: [1.9, 0.0],
  attrs: ['Class times that suit me', 'Teachers’ expertise', 'A low price', 'A heated studio', 'A friendly community'], index: [130, 145, 85, 120, 104],
  r: [[5.0, 6.2, 3.1, 5.4, 4.8], [5.2, 4.9, 4.0, 6.1, 4.5], [3.8, 6.0, 5.5, 3.0, 5.6], [6.0, 5.1, 3.5, 4.2, 4.9]] };
const yoD = YO.at.map((p) => dist(p, YO.ideal));
const yoRival = [1, 2, 3].sort((a, b) => yoD[a] - yoD[b])[0];
const SCREEN = ['Point of difference', 'Parity held', 'Parity to reach', 'Less important'];
const screen = (k, rival) => { if (YO.index[k] < 110) return 3; const g = YO.r[0][k] - YO.r[rival][k]; return g >= 0.5 - 1e-9 ? 0 : g <= -0.5 + 1e-9 ? 2 : 1; };
// a hotel brand's planned move (fictional)
const HOT = { at: [0.6, 0.9], per: [0.30, -0.25], rise: 1.6, segs: ['Business travellers', 'Families', 'Couples on short breaks'], ideal: [[1.3, 0.2], [-0.8, 1.4], [0.4, 1.3]] };
const hotNew = HOT.at.map((v, k) => v + HOT.rise * HOT.per[k]);
const hotD0 = HOT.ideal.map((p) => dist(HOT.at, p)), hotD1 = HOT.ideal.map((p) => dist(hotNew, p));
const hotCells = {
  B1: 'Dimension 1', C1: 'Dimension 2',
  A2: 'the hotel today', B2: HOT.at[0], C2: HOT.at[1],
  A3: 'move per point of “quiet rooms”', B3: HOT.per[0], C3: HOT.per[1],
  A4: 'planned rise in the “quiet rooms” rating', B4: HOT.rise,
  A6: 'segment ideal', B6: 'Dimension 1', C6: 'Dimension 2', D6: 'distance after the move',
  ...Object.fromEntries(HOT.segs.flatMap((s, g) => [[`A${g + 7}`, s], [`B${g + 7}`, HOT.ideal[g][0]], [`C${g + 7}`, HOT.ideal[g][1]]])),
};

export const items = [
  // ================================================================ Module 1: segmentation bases
  {
    id: 'm05-fn-1', lesson: 'why-segment', type: 'steps', kind: 'applied',
    prompt: `A fictional community arts centre sells one general membership, each contributing $${ARTS.m1} a year. It could add a tailored membership for each of three groups in its town, each costing $${int(ARTS.F)} a year to run. Anyone in a group who would have bought the general membership would take the group’s tailored one instead.`,
    data: { table: { head: ['Group', 'People in the town', 'Buy the general membership', 'Tailored membership: contribution a year', 'Tailored membership: share who buy'], rows: ARTS.groups.map((g) => [g.name, int(g.N), pc(g.b1, 0), `$${g.m2}`, pc(g.b2, 0)]), align: ['l', 'r', 'r', 'r', 'r'] } },
    steps: [
      {
        id: 'm05-fn-1-s1', type: 'num',
        prompt: 'What is the gain from offering all three tailored memberships, against selling these groups the general membership alone? Give a whole number of dollars.',
        answer: artsAll,
        check: () => (4000 * (0.05 * 90 - 0.02 * 120) - 7000) + (6000 * (0.06 * 100 - 0.03 * 120) - 7000) + (300 * (0.12 * 260 - 0.08 * 120) - 7000),
        unit: '$', places: 0, tol: 0.5,
        wrong: [
          { value: artsBest, say: `That is the gain from the two tailored memberships that pay. The artists’ membership loses ${usd(-artsGain[2])}, which the total for all three must include.` },
          { value: artsAll + 3 * ARTS.F, say: `That is the extra contribution before the three memberships’ running costs of $${int(ARTS.F)} each.` },
          { value: sum(ARTS.groups.map((g) => g.N * g.b2 * g.m2)) - 3 * ARTS.F, say: 'That counts every tailored member’s contribution as new. Those who would have bought the general membership already contributed $120 each: subtract it.' },
          { value: sum(ARTS.groups.map((g) => g.N * (g.b2 - g.b1) * ARTS.m1)) - 3 * ARTS.F, say: 'That keeps $120 for every tailored member. Each tailored membership has its own contribution: $90, $100 and $260.' },
        ],
        solution: `Gain for each group = N × (share × contribution with the tailored membership − share × $${ARTS.m1} with the general one) − $${int(ARTS.F)}. ${ARTS.groups.map((g, i) => `${g.name}: ${int(g.N)} × (${fx(g.b2 * g.m2)} − ${fx(g.b1 * ARTS.m1)}) − ${int(ARTS.F)} = ${usd(artsGain[i])}`).join('; ')}. All three: ${usd(artsAll)}.`,
      },
      {
        id: 'm05-fn-1-s2', type: 'mc',
        prompt: 'Which plan should the centre adopt?',
        options: [
          'Tailor for the families and the retired, and keep the artists on the general membership: too few of them to cover their offer’s cost',
          'Offer all three: each tailored membership raises its group’s purchase rate, so each one brings in more members than the general one',
          'Tailor for the retired only: the family membership earns $30 less per member than the general one, so it can only lose money',
          'Tailor for the artists only: their membership earns the most per member and they have the highest purchase rate of the three groups',
        ],
        answer: 0,
        feedback: {
          1: 'More members isn’t enough: each tailored membership must cover its own running cost. The artists’ adds too little contribution to do so.',
          2: 'A lower contribution per member can still pay if many more people buy: the family membership more than doubles the share who join.',
          3: 'Per member the artists’ membership is the best, but there are only 300 artists: the group is too small to cover a $7,000 offer.',
        },
        solution: `Families gain ${usd(artsGain[0])} and the retired ${usd(artsGain[1])}; the artists lose ${usd(-artsGain[2])}, because each artist in the town adds only $${fx(artsPer(ARTS.groups[2]))} a year and it would take ${int(artsMinArtists)} of them to cover the $${int(ARTS.F)}. Two tailored memberships earn ${usd(artsBest)}, more than all three.`,
      },
    ],
    solution: `Offering all three gains ${usd(artsAll)}; leaving the artists on the general membership gains ${usd(artsBest)}. The artists are the most valuable members each, but they fail the substantial test: ${int(ARTS.groups[2].N)} of them can’t pay for a ${usd(ARTS.F)} offer (the smallest group that could is ${int(artsMinArtists)}). Each tailored offer must pay its own way, and the estimates of who would buy are the thing to test before launching any of them.`,
  },
  {
    id: 'm05-fn-2', lesson: 'why-segment', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional pet insurer’s cluster analysis of pet owners’ needs found a segment it calls “first-time worriers”. Its notes on the segment are in the table. Select all the tests of a usable segment that the segment already passes.',
    data: { table: { head: ['The insurer’s notes'], rows: [
      [`A random sample of 2,000 pet owners in the region puts the segment at about ${pc(PET.share, 0)} of the region’s ${int(PET.owners)} owners: about ${int(Math.round(petN / 100) * 100)} people.`],
      [`They spend about $${PET.spend} a year each on pet insurance, about $${fx((petN * PET.spend) / 1e6, 1)} million in all; an advice line for them would cost about $${int(PET.line)} a year.`],
      ['Most are not yet its customers, and no list or medium the insurer can buy reaches first-time pet owners as such.'],
      [`In a concept test they rated a policy with an advice line far higher than other owners did: ${pc(PET.top2[0], 0)} top-two box against ${pc(PET.top2[1], 0)}.`],
      ['The insurer employs no vets or veterinary nurses to staff an advice line, and can’t recruit any this year.'],
    ] } },
    options: ['Measurable', 'Substantial', 'Accessible', 'Differentiable', 'Actionable'],
    answer: [0, 1, 3],
    feedback: {
      2: 'No list or medium reaches them, and most aren’t customers: until the insurer can find them (with a question at quote time, say), it can’t reach them at an affordable cost.',
      4: 'Actionable asks whether the business can design and run the programme with its resources. Without vets or nurses it can’t staff the advice line the segment wants.',
    },
    solution: 'Measurable: a probability sample sizes it. Substantial: millions of dollars of premiums against a $90,000 programme. Differentiable: it responds to the advice-line concept very differently from other owners. It fails accessible (no way yet to reach first-time owners as such) and actionable (no staff to deliver the advice). Each failure has a remedy (a typing question in the quote form; a partnership with a veterinary practice), and the segment can’t be marketed to until both are in place.',
  },
  {
    id: 'm05-fn-3', lesson: 'demographic-and-geographic', type: 'steps', kind: 'numerical',
    prompt: `Lantern’s media agency proposes reaching the Craft and local segment with advertising aimed at households with incomes over $80,000, pointing out that ${pc(d3Rev)} of the segment have such incomes. The table counts the needs study’s ${D3.n} respondents (an opt-in panel with age quotas).`,
    data: { table: { head: ['', 'Over $80k, mostly buy at a café', 'Over $80k, other main source', '$80k or under', 'All'], rows: [
      ['Craft and local', String(D3.clHiCafe), String(D3.clHiOther), String(D3.clLo), String(D3.cl)],
      ['Other segments', String(D3.allHiCafe - D3.clHiCafe), String(D3.allHiOther - D3.clHiOther), String(D3.allLo - D3.clLo), String(D3.n - D3.cl)],
      ['All respondents', String(D3.allHiCafe), String(D3.allHiOther), String(D3.allLo), String(D3.n)],
    ], align: ['l', 'r', 'r', 'r', 'r'] } },
    steps: [
      {
        id: 'm05-fn-3-s1', type: 'num',
        prompt: 'What percentage of the respondents with incomes over $80,000 are in Craft and local? Give one decimal place.',
        answer: r1(d3Hi * 100),
        check: () => ((52 + 33) / (107 + 161)) * 100,
        unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1(d3Rev * 100), say: 'That is the share of Craft and local who have high incomes. The agency’s question is the other way round: of the high earners an advertisement reaches, how many are in the segment?' },
          { value: r1((D3.cl / D3.n) * 100), say: 'That is Craft and local’s share of all respondents. Restrict the base to those with incomes over $80,000.' },
          { value: r1((D3.allHi / D3.n) * 100), say: 'That is the share of all respondents with incomes over $80,000.' },
          { value: r1((D3.clHi / D3.n) * 100), say: 'That divides by all 640 respondents. The base is the high earners only.' },
        ],
        solution: `Of the ${D3.allHi} respondents with incomes over $80,000, ${D3.clHi} (${D3.clHiCafe} + ${D3.clHiOther}) are Craft and local: ${pc(d3Hi)}.`,
      },
      {
        id: 'm05-fn-3-s2', type: 'num',
        prompt: 'What percentage of the respondents with incomes over $80,000 who mostly buy their coffee at a café are in Craft and local? Give one decimal place.',
        answer: r1(d3HiCafe * 100),
        check: () => (52 / 107) * 100,
        unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1((D3.clHiCafe / D3.cl) * 100), say: 'That is the share of Craft and local who are high-earning café buyers. The base is everyone who is both.' },
          { value: r1((D3.clHiCafe / D3.clHi) * 100), say: 'That is the share of Craft and local’s high earners who mostly buy at a café. Divide by all high-earning café buyers instead.' },
        ],
        solution: `${D3.clHiCafe} of the ${D3.allHiCafe} high-earning café buyers are Craft and local: ${pc(d3HiCafe)}.`,
      },
      {
        id: 'm05-fn-3-s3', type: 'mc',
        prompt: 'What should Ana tell the agency?',
        options: [
          'Income describes the segment without defining it: use it with where people buy, and reach the segment first in Lantern’s own cafés',
          'Income is the right base: when nearly four-fifths of a segment share a trait, advertising by that trait reaches it with little waste',
          'Drop income altogether: a demographic can’t help find a needs segment, so the agency should buy its media by need instead',
          'Aim at high earners who buy at cafés: adding a second descriptor guarantees that almost everyone reached is in Craft and local',
        ],
        answer: 0,
        feedback: {
          1: 'A trait shared by most of a segment can still be shared by many people outside it. What matters for waste is the share of the people reached who are in the segment.',
          2: 'Nobody sells media by need. Descriptors such as income and café use are how a needs segment is reached, accepting some waste.',
          3: 'Two descriptors sharpen the aim but leave plenty of other drinkers in the audience. Only Lantern’s own customers, typed with the golden questions, can be picked out one by one.',
        },
        solution: 'Read the cross-tab both ways. Most of Craft and local are high earners, but most high earners belong to other segments, so income alone would spend much of the budget on other drinkers. Adding café use roughly halves the waste, and Lantern’s cafés reach the segment where it already buys. Demographics describe and help reach a needs segment; they don’t define it.',
      },
    ],
    solution: `Craft and local are ${pc(d3Rev)} high earners, but only ${pc(d3Hi)} of high earners are Craft and local; among high earners who mostly buy at a café, ${pc(d3HiCafe)} are. These are shares of an opt-in panel, so treat them as a guide to how mixed each audience is, not as the city’s figures.`,
  },
  {
    id: 'm05-fn-4', lesson: 'demographic-and-geographic', type: 'mc', kind: 'applied',
    prompt: 'A fictional cinema chain’s agency wants to segment its audience by age band, because that is how it buys media. The chain surveyed a random sample of 2,400 of its loyalty members and crossed age band with two things: the kind of film each saw most often last year (chi-square p < 0.001, Cramér’s V = 0.07) and how each usually buys tickets, by app, website or at the box office (p < 0.001, V = 0.34). What should the chain conclude?',
    options: [
      'Age is a sound base for planning how tickets are sold, but a weak one for choosing which films to programme and promote',
      'Age is a strong base for both decisions, because both associations are significant at p < 0.001 with 2,400 cinema-goers',
      'Age is useless for both decisions, because a demographic base can never explain why people choose to see a film',
      'Age should decide the film programme, because the films people watch matter more to a cinema than how they buy',
    ],
    answer: 0,
    feedback: {
      1: 'With 2,400 people even tiny associations are significant. Judge the strength: V = 0.07 means every age band watches every kind of film.',
      2: 'Age is associated with how people buy tickets fairly strongly (V = 0.34), which is exactly the decision a ticketing plan needs. A base is judged by the decision it serves.',
      3: 'Importance doesn’t make age informative about films: V = 0.07 says the age bands barely differ in what they watch.',
    },
    solution: 'A segmentation is judged by the decision it serves. For how tickets are sold, age separates people clearly (V = 0.34), and it is measurable and accessible. For which films to show and promote, the age bands are nearly alike (V = 0.07): significant with so large a sample, but too weak to change a programme. The chain should use age to plan its ticketing and look for a base closer to why people choose films, such as the benefits they seek.',
  },
  {
    id: 'm05-fn-5', lesson: 'psychographic-and-behavioural', type: 'steps', kind: 'numerical',
    prompt: 'A fictional farm shop’s veg-box scheme has 25 members. Column B holds the boxes each member bought last year.',
    steps: [
      {
        id: 'm05-fn-5-s1', type: 'formula',
        prompt: 'In E2, calculate the share of all the boxes bought last year that the heaviest 20% of members bought.',
        sheet: { cells: boxCells }, cell: 'E2', view: 'A1:E26', maxHeight: '22rem',
        formats: { E2: '0.0%' }, widths: { A: 9, B: 15, C: 3, D: 44, E: 10 },
        answer: '=SUM(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)',
        alt: ['=SUMPRODUCT(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)', '=SUMIF(B2:B26,">="&LARGE(B2:B26,5))/SUM(B2:B26)', '=SUM(LARGE(B2:B26,SEQUENCE(5)))/SUM(B2:B26)'],
        wrong: [
          { formula: '=LARGE(B2:B26,5)/SUM(B2:B26)', say: 'LARGE(B2:B26,5) is the fifth-largest value alone. The heaviest 20% of 25 members are the top five: add all five, for example with LARGE(B2:B26,{1,2,3,4,5}) inside SUM.' },
          { formula: '=SUM(B2:B6)/SUM(B2:B26)', say: 'B2:B6 are the first five members in the list, not the five heaviest. The list isn’t sorted: pick the largest five with LARGE.' },
          { formula: '=SUMIF(B2:B26,">"&LARGE(B2:B26,5))/SUM(B2:B26)', say: '“>” leaves out the fifth-heaviest member. Use ">=" to include it.' },
          { formula: '=SUM(LARGE(B2:B26,{1,2,3,4,5}))/COUNT(B2:B26)', say: 'That divides by the number of members, giving boxes per member. A share of the boxes divides by all the boxes, SUM(B2:B26).' },
        ],
        solution: `<x>=SUM(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)</x>: the five heaviest members bought ${boxTop} of the ${sum(BOX)} boxes, ${pc(boxShare)}.`,
      },
      {
        id: 'm05-fn-5-s2', type: 'mc',
        prompt: 'The shop is thinking of dropping its weekly newsletter for every member outside the heaviest five. What does the result suggest?',
        options: [
          'Keep it: the other twenty members together still buy a large part of the boxes, and some light buyers become heavier',
          'Drop it: a share like this confirms the 80/20 rule, so the five heaviest members are in effect the whole scheme',
          'Drop it: light buyers can’t be persuaded to buy more often, so any newsletter sent to them is money wasted',
          'Wait: concentration can’t be judged until the share has been tested against chance with a chi-square test',
        ],
        answer: 0,
        feedback: {
          1: 'Check the rule against the data. The heaviest fifth buy far less than 80% of the boxes here, as in most brands’ data.',
          2: 'Nothing in the data says that; and today’s light buyers include tomorrow’s heavier ones, as well as members who would lapse without contact.',
          3: 'The share describes these 25 members exactly; no test is needed to read it. The question is what it implies for the newsletter.',
        },
        solution: 'Usage is concentrated but nowhere near 80/20, and the lighter four-fifths of members still buy over half the boxes. Ehrenberg-Bass researchers find the same pattern across consumer brands: the heaviest fifth usually give not much more than half of sales. Cutting off light members gives up much of the scheme’s volume.',
      },
    ],
    solution: `The heaviest 20% (5 of 25 members) bought ${boxTop} of ${sum(BOX)} boxes, ${pc(boxShare)}: concentrated, far from 80/20, and towards the low end of the 44% to 68% range Sharp, Romaniuk and Graham report for consumer brands. The other members buy most of the boxes, so the newsletter should stay.`,
  },
  {
    id: 'm05-fn-6', lesson: 'psychographic-and-behavioural', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional outdoor-clothing retailer has built a reliable four-item scale of customers’ concern for the environment (Cronbach’s alpha 0.84). High scorers are far more likely than low scorers to have bought from its repair-and-resell range (41% against 9%), but in a test mailing they were no more likely to buy its new waterproof jacket (6.1% against 5.8%). The jacket team wants to send its launch campaign only to high scorers. What is the best advice?',
    options: [
      'Don’t: the scale predicts the behaviour that expresses the concern, and buying the jacket didn’t; look for a base tied to jacket buying',
      'Do: a reliable attitude scale predicts every kind of purchase, so the jacket result is almost certainly sampling noise',
      'Don’t: an alpha of 0.84 shows the scale is too unreliable to target anybody with until more items are added',
      'Do: customers with strong values are the most loyal customers, so they are the retailer’s best prospects for any product',
    ],
    answer: 0,
    feedback: {
      1: 'Reliability means the items measure one thing consistently; it doesn’t make the attitude relevant to every purchase. The scale predicted repair-and-resell buying well and jacket buying not at all.',
      2: 'An alpha of 0.84 is good. The problem is not the scale’s reliability but what it is used to predict.',
      3: 'The data don’t show that, and the test mailing says the opposite for this product.',
    },
    solution: 'An attitude predicts behaviour in proportion to how closely the behaviour expresses it. Environmental concern predicts buying repaired and resold clothes; it doesn’t predict buying a new jacket. The jacket campaign needs a base closer to why people buy jackets: benefits sought (staying dry on long walks, say), usage (how often they walk in the rain) or past purchases of outdoor gear.',
  },

  // ================================================================ Module 2: segmenting with data
  {
    id: 'm05-fn-7', lesson: 'cluster-analysis', type: 'steps', kind: 'applied',
    prompt: `A fictional regional theatre surveyed ${int(TH.n)} people about how much ${TH.p} things matter when they choose a night at the theatre, and ran k-means on the standardised answers with 30 restarts for each k.`,
    steps: [
      {
        id: 'm05-fn-7-s1', type: 'mc',
        prompt: `How many segments should the theatre take into profiling? The table gives each solution; with one segment the within-cluster sum of squares is ${int(thT)}. On random ratings of the same size, five segments give a mean silhouette of ${fx(TH.random)}. At four, two segments with different tastes in plays merge into one; at six, one segment splits into two groups that want the same things, one more strongly than the other.`,
        data: { table: { head: ['k', 'Within-cluster sum of squares', 'Fall from k − 1', 'Mean silhouette'], rows: TH.ks.map((k, i) => [String(k), int(TH.wcss[i]), int(thFall[i]), fx(TH.sil[i])]), align: ['r', 'r', 'r', 'r'] } },
        options: [
          'Five: the falls shrink after it, its silhouette beats four and six at three times the benchmark, and four would merge two tastes',
          `Two: its mean silhouette, ${fx(TH.sil[0])}, is the highest of all, which makes two the statistically correct number of segments`,
          'Seven: its within-cluster sum of squares is the lowest of the six solutions, so it describes the audience in the most detail',
          `Six: the fall from five to six (${int(thFall[4])}) is still bigger than the fall from six to seven, so the curve hasn’t levelled off`,
        ],
        answer: 0,
        feedback: {
          1: 'The silhouette tends to favour a few large groups, and two is one broad split. Read it with the elbow and with what the segments mean.',
          2: 'The within-cluster sum of squares always falls as k rises. Look for where the falls shrink, not for the lowest value.',
          3: 'Falls usually keep shrinking a little; the elbow is where they drop sharply, here after five. Six also splits a segment into two strengths of the same want.',
        },
        solution: `The falls are ${thFall.map(int).join(', ')}: they shrink sharply after five (${int(thFall[3])}, then ${int(thFall[4])}). The silhouette is highest at two (${fx(TH.sil[0])}) but has a local peak at five (${fx(TH.sil[3])} against ${fx(TH.sil[2])} and ${fx(TH.sil[4])}), about three times the random benchmark (${fx(TH.random)}): real but overlapping structure. Four would merge two tastes the theatre programmes for differently; six adds nothing new. Five, then, with stability checks to follow.`,
      },
      {
        id: 'm05-fn-7-s2', type: 'mc',
        prompt: `In the chosen solution, one segment’s indexes against the average respondent are: ${TH_NEEDS.map((n, j) => `${n.toLowerCase()} ${TH_INDEX[j]}`).join(', ')}. ${pc(TH_YOUNG[0], 0)} of its members are under 35, against ${pc(TH_YOUNG[1], 0)} of all respondents. Which name fits the segment best?`,
        options: ['New-writing seekers', 'Young bohemians', 'Serious theatre lovers', 'Bargain hunters'],
        answer: 0,
        feedback: {
          1: 'Age is a descriptor, not what formed the segment, and four in ten members are 35 or over; “bohemian” claims a lifestyle nobody measured.',
          2: 'They care much less than average about classic plays (index 63): the name would claim a breadth of taste the profile contradicts.',
          3: 'A low price indexes 74: price matters less to this segment than to the average respondent.',
        },
        solution: 'Name a needs segment by its highest indexes and check the name against the lows. New writing (168) stands far above everything else, and classic plays (63) and a low price (74) are well below average. “New-writing seekers” says that and nothing more; the age profile goes in the segment’s description as a share, not in its name.',
      },
    ],
    solution: 'Five segments: the elbow and a local peak of the silhouette agree, the structure is well above the random benchmark, and four or six would lose or duplicate a meaningful difference. Then name each segment from its highs and lows, keeping descriptors such as age for the description.',
  },
  {
    id: 'm05-fn-8', lesson: 'cluster-analysis', type: 'steps', kind: 'numerical',
    prompt: `A fictional swimming club tries k-means with k = 2 on one variable, its six members’ visits last month, to keep the arithmetic short: ${SWIM.ids.map((id, i) => `${id} ${SWIM.v[i]}`).join(', ')}. Run 1 starts with its centres at members A and F; run 2 starts with them at members A and E.`,
    steps: [
      {
        id: 'm05-fn-8-s1', type: 'num',
        prompt: 'Run 2 assigns and updates until no member moves. What is its within-cluster sum of squares when it stops?',
        answer: swim2.wcss,
        check: () => ((1 - 2) ** 2 + 0 + (3 - 2) ** 2) + ((10 - 17) ** 2 + (11 - 17) ** 2 + (30 - 17) ** 2),
        unit: '', places: 0, tol: 0.5,
        wrong: [
          { value: swimStart2, say: 'That is measured around the starting centres, before the update move. Move each centre to its members’ mean, then check whether anyone changes group.' },
          { value: swim1.wcss, say: 'That is where run 1 stops. Run 2’s start leads to a different grouping.' },
          { value: swim2.wcss - sum([1, 2, 3].map((v) => (v - 2) ** 2)), say: 'That is the second group alone. Add the first group’s squared distances too.' },
        ],
        solution: `Around A (1) and E (11): A, B and C join A; D, E and F join E. The centres move to 2 and (10 + 11 + 30) ÷ 3 = 17. Now D is 8 from 2 and 7 from 17, so it stays, and nobody moves. WCSS = (1 + 0 + 1) + (49 + 36 + 169) = ${fx(swim2.wcss, 0)}.`,
      },
      {
        id: 'm05-fn-8-s2', type: 'mc',
        prompt: `Run 1 stops with ${groupOf(swim1, 0)} in one segment and ${groupOf(swim1, 1)} in the other, and a within-cluster sum of squares of ${fx(swim1.wcss, 1)}. What do the two runs show?`,
        options: [
          'Run 2 stopped at a local optimum that no single move improves; keep run 1’s grouping, and run k-means from many starts',
          'Run 2 is the better solution, because its two segments are of equal size while run 1’s are five members and one',
          'The members have no structure worth segmenting, because two runs of k-means on the same data gave different answers',
          'Run 1 is invalid, because k-means can’t return a segment with only one member in it, so run 2 is the one to keep',
        ],
        answer: 0,
        feedback: {
          1: 'k-means is judged by the within-cluster sum of squares, not by how even the segments are, and run 1’s is far lower. Whether a one-member segment is worth an offer is a separate question, the substantial test.',
          2: 'Different answers from different starts are what local optima look like, even in data with clear structure. Compare the runs’ sums and keep the lowest.',
          3: 'k-means can return a segment of one; it does here. A tiny segment may fail the substantial test, but that doesn’t make the run invalid.',
        },
        solution: 'k-means only improves the solution it starts from, so a poor start can stop at a grouping that no single assign or update move improves, although a better one exists. That is why analysts use k-means++ starts and many restarts, and keep the run with the lowest within-cluster sum of squares.',
      },
    ],
    solution: `Run 2 stops at ${groupOf(swim2, 0)} and ${groupOf(swim2, 1)} with a within-cluster sum of squares of ${fx(swim2.wcss, 0)}; run 1 reaches ${fx(swim1.wcss, 1)}. Both are stable groupings, but run 2’s is a local optimum. Keep the lower sum, and in real analyses use many k-means++ starts, as Lantern’s analyst did.`,
  },
  {
    id: 'm05-fn-9', lesson: 'cluster-analysis', type: 'steps', kind: 'numerical',
    prompt: 'A fictional bakery clustered its ten wholesale customers with Ward’s method, on three standardised needs. The table lists the merges in the order they were made, with how much each increased the within-cluster sum of squares.',
    data: { table: { head: ['Merge', 'Groups left after it', 'Increase in within-cluster sum of squares'], rows: WARD.map((v, m) => [String(m + 1), String(9 - m), fx(v, 1)]), align: ['r', 'r', 'r'] } },
    steps: [
      {
        id: 'm05-fn-9-s1', type: 'mc',
        prompt: 'Where does the dendrogram suggest cutting the tree?',
        options: [
          `Into three groups: merge 8 would add ${fx(WARD[7], 1)}, more than five times any merge before it`,
          `Into two groups: the last merge, at ${fx(WARD[8], 1)}, costs more than any other merge in the tree`,
          'Into ten groups: every merge adds to the within-cluster sum of squares, so none is worth making',
          `Into four groups: merge 7 adds ${fx(WARD[6], 1)}, the first increase in the table above 1`,
        ],
        answer: 0,
        feedback: {
          1: 'Cutting below the last merge only stops the final, costliest step. The jump comes a merge earlier: merge 8 already costs far more than everything before it.',
          2: 'Every merge raises the sum; the question is which ones raise it by much. Ten groups of one would be no segmentation at all.',
          3: 'Merge 7 costs about as much as the merges before it. The jump comes at merge 8.',
        },
        solution: 'The first seven merges each add 1.1 or less; merge 8 adds 6.2. Merges with small costs join groups that are already close; the jump says merge 8 would join groups that are far apart. Cut the tree just below it, leaving three groups, and check the choice with k-means and what the groups mean.',
      },
      {
        id: 'm05-fn-9-s2', type: 'num',
        prompt: 'What is the within-cluster sum of squares of the two-group solution? Give one decimal place.',
        answer: r1(wardWcss(2)),
        check: () => 0.3 + 0.4 + 0.4 + 0.6 + 0.7 + 0.9 + 1.1 + 6.2,
        unit: '', places: 1, tol: 0.05,
        wrong: [
          { value: WARD[7], say: 'That is what merge 8 adds. Ward’s method starts with every customer alone (a sum of 0), so the sum after a merge is all the increases so far.' },
          { value: r1(wardWcss(3)), say: 'That is the three-group solution’s sum, before merge 8.' },
          { value: r1(wardWcss(1)), say: 'That includes the last merge: it is the total sum of squares, with one group.' },
          { value: WARD[8], say: 'That is the cost of the last merge, which joins the two groups into one.' },
        ],
        solution: `Starting from ten groups of one (a sum of 0), each merge adds its cost, so two groups (after merge 8) have ${WARD.slice(0, 8).map((v) => fx(v, 1)).join(' + ')} = ${fx(wardWcss(2), 1)}. Three groups have ${fx(wardWcss(3), 1)}; one group, the total, ${fx(wardWcss(1), 1)}.`,
      },
    ],
    solution: `Ward’s method merges the two groups that add least to the within-cluster sum of squares, so the merge costs add up to it: ${fx(wardWcss(3), 1)} with three groups, ${fx(wardWcss(2), 1)} with two. The jump at merge 8 suggests three groups.`,
  },
  {
    id: 'm05-fn-10', lesson: 'profiling-segments', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional supermarket’s “health-first shoppers” segment rates two needs as in the table (1–7 importance). Which need sets the segment apart from the average shopper more?',
    data: { table: { head: ['Need', 'Segment mean', 'All shoppers’ mean', 'All shoppers’ standard deviation'], rows: HF.map((x) => [x.need, fx(x.seg, 1), fx(x.all, 1), fx(x.sd, 1)]), align: ['l', 'r', 'r', 'r'] } },
    options: [
      `Fresh produce: the segment sits ${fx(HF[1].z, 1)} standard deviations above the average shopper on it, against ${fx(HF[0].z, 1)} on the organic range`,
      `The organic range: its index of ${fx(HF[0].index, 0)} is higher than fresh produce’s ${fx(HF[1].index, 0)}, so it sets the segment apart more`,
      `The organic range: the segment cares ${fx(HF[0].index - 100, 0)}% more about it than the average shopper does, and only ${fx(HF[1].index - 100, 0)}% more about fresh produce`,
      'Neither: two needs with different means among all shoppers can’t be compared in any way',
    ],
    answer: 0,
    feedback: {
      1: 'On a rating scale with no true zero, the same gap in points gives a bigger index where the average is low. Compare needs in standard deviations, as the segment centres do.',
      2: 'A rating index is a ratio of means, not a percentage of caring: 1–7 ratings have no true zero.',
      3: 'Indexes are hard to compare across needs, but the segment’s centre in standardised units puts both needs on one footing.',
    },
    solution: `Indexes: organic ${fx(HF[0].seg, 1)} ÷ ${fx(HF[0].all, 1)} × 100 = ${fx(HF[0].index, 0)}, fresh produce ${fx(HF[1].seg, 1)} ÷ ${fx(HF[1].all, 1)} × 100 = ${fx(HF[1].index, 0)}. In standard deviations: (${fx(HF[0].seg, 1)} − ${fx(HF[0].all, 1)}) ÷ ${fx(HF[0].sd, 1)} = ${fx(HF[0].z, 2)} against (${fx(HF[1].seg, 1)} − ${fx(HF[1].all, 1)}) ÷ ${fx(HF[1].sd, 1)} = ${fx(HF[1].z, 2)}. Shoppers agree closely about fresh produce, so a 1.2-point gap is large there; the organic range has a low average, which inflates its index. Read rating indexes beside the means or the centres.`,
  },
  {
    id: 'm05-fn-11', lesson: 'profiling-segments', type: 'formula', kind: 'numerical',
    prompt: 'A fictional pet-food brand’s typing tool asks three golden questions, each rated 1–7. Row 2 holds a new customer’s answers, rows 3 and 4 the study’s means and standard deviations, and rows 7 to 10 each segment’s centre in standardised units. In E7, calculate the customer’s squared distance from the centre in row 7, in a formula that can be filled down to E10.',
    sheet: { cells: pfCells }, cell: 'E7', fill: 'E7:E10', view: 'A1:E10',
    formats: { B3: '0.0', C3: '0.0', D3: '0.0', B4: '0.0', C4: '0.0', D4: '0.0', B: '0.0', C: '0.0', D: '0.0', E: '0.00' }, widths: { A: 26, B: 13, C: 18, D: 19, E: 15 },
    answer: '=SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4-B7:D7)^2)',
    alt: [
      '=(($B$2-$B$3)/$B$4-B7)^2+(($C$2-$C$3)/$C$4-C7)^2+(($D$2-$D$3)/$D$4-D7)^2',
      '=SUMPRODUCT((STANDARDIZE($B$2:$D$2,$B$3:$D$3,$B$4:$D$4)-B7:D7)^2)',
      '=SUMPRODUCT((B7:D7-($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4)^2)',
    ],
    wrong: [
      { formula: '=SUMPRODUCT(($B$2:$D$2-B7:D7)^2)', say: 'That compares raw 1–7 answers with centres in standard deviations. Standardise the answers first, with the study’s means and standard deviations.' },
      { formula: '=SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)-B7:D7)^2)', say: 'Subtracting the mean isn’t enough: divide by the study’s standard deviation, so the answers are in the same units as the centres.' },
      { formula: '=SUMPRODUCT((($B$2:$D$2-AVERAGE($B$2:$D$2))/$B$4:$D$4-B7:D7)^2)', say: 'That centres the customer on her own average, which throws away whether her ratings are high or low compared with other customers. Use the study’s stored means.' },
      { formula: '=SUMPRODUCT(((B2:D2-B3:D3)/B4:D4-B7:D7)^2)', say: 'Without $ the answers, means and standard deviations slide down as you fill: lock them with $B$2:$D$2, $B$3:$D$3 and $B$4:$D$4.' },
      { formula: '=SQRT(SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4-B7:D7)^2))', say: 'That is the distance itself. It ranks the segments the same way, but the column asks for the squared distance the tool compares.' },
    ],
    solution: `<x>=SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4-B7:D7)^2)</x>: her z-scores are ${pfZ.map((v) => sgn(v)).join(', ')}, and her squared distances are ${PF.segs.map((s, g) => `${s} ${fx(pfD[g])}`).join(', ')}. The tool assigns her to ${PF.segs[pfNear]}, the nearest centre, with ${PF.segs[pfSecond]} next at ${fx(pfD[pfSecond])}: clear enough, though a close call would deserve a second look.`,
  },
  {
    id: 'm05-fn-12', lesson: 'profiling-segments', type: 'multi', kind: 'conceptual',
    prompt: `Ana wants to turn Mindful’s share of the needs study (${miN} of ${RS.length} respondents, ${pc(miShare)}) into a number of Harbour City coffee drinkers for a market-size estimate. The study came from an opt-in panel with quotas on age band. Select all the statements that are true.`,
    options: [
      'The quotas fixed the respondents’ age mix, not their mix of needs, so Mindful’s share of the city could differ from its share of the study.',
      'Weighting the respondents to the city’s age mix would correct the age mix only, not who chose to join the panel and answer.',
      'What Mindful drinkers want is less likely to be distorted by the panel than how many of them there are.',
      'A city-wide figure built from the share should be given as a range and checked against other evidence, such as sales.',
      `A 95% margin of error of about ±${fx(miMoe * 100, 1)} points gives the range for Mindful’s share of the city.`,
      'Because the age quotas matched the city, every segment’s share matches the city too.',
      'Segment shares from a panel mean nothing, so Ana should leave Mindful’s size out of her plans.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'A margin of error measures sampling error in a probability sample. An opt-in panel isn’t one, so the formula gives a number with no clear meaning; the bigger risk is bias from who joined.',
      5: 'Quotas control only the variables they are set on. Within each age band, the people are those who joined a panel and chose to answer.',
      6: 'The shares are informative, especially for comparing segments; they need care, not abandoning. State the base, cross-check and use a range.',
    },
    solution: `${pc(miShare)} is a share of the study’s respondents. Quotas on age band make the age mix match Ana’s targets and do nothing else, and weighting can’t fix self-selection within a weighting cell. Profiles are more robust than sizes. So Ana can use the share as the starting point of a planning range, checked against other evidence, but not as a measured share of the city with a margin of error.`,
  },

  // ================================================================ Module 3: targeting
  {
    id: 'm05-fn-13', lesson: 'evaluating-segments', type: 'steps', kind: 'applied',
    prompt: 'A fictional car-rental firm scores two segments, business travellers and holidaymakers, on five factors (0–100). Column B holds its weights and row 7 each segment’s weighted sum.',
    steps: [
      {
        id: 'm05-fn-13-s1', type: 'formula',
        prompt: 'In E2, calculate how much the weight in row 2 would have to change, with every other weight unchanged, for the two segments to draw level (negative for a fall), in a formula that can be filled down to E6.',
        sheet: { cells: carCells }, cell: 'E2', fill: 'E2:E6', view: 'A1:E7',
        formats: { C7: '#,##0', D7: '#,##0', E: '0.00' }, widths: { A: 30, B: 8, C: 19, D: 14, E: 30 },
        answer: '=($C$7-$D$7)/(D2-C2)',
        alt: ['=(C$7-D$7)/(D2-C2)', '=($D$7-$C$7)/(C2-D2)', '=-($C$7-$D$7)/(C2-D2)'],
        wrong: [
          { formula: '=($C$7-$D$7)/(C2-D2)', say: 'The sign is reversed. Raising a weight helps the segment that scores higher on that factor, so divide the leader’s advantage by the challenger’s advantage on the factor: D2 − C2.' },
          { formula: '=(C7-D7)/(D2-C2)', say: 'Without $ the weighted sums slide down as you fill, to empty cells. Lock them: $C$7 and $D$7.' },
          { formula: '=($C$7-$D$7)/SUM($B$2:$B$6)/(D2-C2)', say: 'That uses the gap in the weighted scores out of 100. One point of weight changes the weighted sums, not the scores, by the difference in the two scores: use the gap in the sums.' },
          { formula: '=($C$7-$D$7)/D2', say: 'Each point of weight changes the gap by the difference between the two segments’ scores on the factor, not by one segment’s score.' },
        ],
        solution: `<x>=($C$7-$D$7)/(D2-C2)</x>: the gap in weighted sums is ${int(carGap)}, so the changes are ${CAR.factors.map((f, k) => `${f.toLowerCase()} ${sgn(carDelta[k])}`).join(', ')}.`,
      },
      {
        id: 'm05-fn-13-s2', type: 'mc',
        prompt: 'Which judgement does the choice between the two segments depend on most?',
        options: [
          'The weight on growth: a modest rise in it would tie them, so the growth estimates are the first thing to test',
          'The weight on fit: fit has the largest gap between the two segments of any factor, so fit decides the result',
          'The weight on size: the leader’s advantage rests on size, and lowering it slightly would reverse the order',
          'None of them: the leader is ahead on three of the five factors, so no single weight can change the order',
        ],
        answer: 0,
        feedback: {
          1: 'Fit favours business travellers, so only lowering its weight could help holidaymakers, and it would have to fall most of the way to zero.',
          2: 'Size would have to fall below zero to tie them, which no weight can do.',
          3: 'Counting factors won is not how a weighted score works. Holidaymakers lead on growth by 60 points, so a small rise in growth’s weight closes the gap.',
        },
        solution: `Growth needs a rise of only ${fx(carDelta[2])} (from ${CAR.w[2]} to ${fx(CAR.w[2] + carDelta[2])}); room would need ${fx(carDelta[3])}; fit would have to fall to ${fx(CAR.w[4] + carDelta[4])}; size and spend per head would have to go below zero. The choice turns on how much growth matters and on the growth estimates themselves.`,
      },
    ],
    solution: `Business travellers lead by ${int(carGap)} points in the weighted sums. The threshold weight for each factor is the gap divided by the challenger’s advantage on it: ${CAR.factors.map((f, k) => `${f.toLowerCase()} ${sgn(carDelta[k])}`).join(', ')}. Only growth is fragile; report the lead together with that threshold, and test the growth estimates before deciding.`,
  },
  {
    id: 'm05-fn-14', lesson: 'evaluating-segments', type: 'num', kind: 'applied',
    prompt: `Suppose (fictional) Arcadia Coffee relaunches, and the next survey puts it ${fx(ARC)} from the Craft and local ideal on Lantern’s map, with every other distance, score and weight unchanged. Ana scores room from the nearest rival, like size, spend per head and growth, as a ratio to the best segment; fit is centred on 50; her weights are ${W_ANA.join(', ')} for size, spend per head, growth, room and fit. What would Craft and local’s weighted score become? Give one decimal place.`,
    data: { table: { head: ['Segment', 'Size', 'Spend per head', 'Growth', 'Fit', 'Distance from ideal to nearest rival'], rows: ORDER.map((g) => [NAMES[g], fx(ratio(share)[g], 1), fx(ratio(head)[g], 1), fx(ratio(growth)[g], 1), fx(fitS[g], 1), fx(room[g])]), align: ['l', 'r', 'r', 'r', 'r', 'r'] } },
    answer: r1(T1[CL]),
    check: () => { const best = Math.max(...room.map((d, g) => (g === CL ? 0.70 : d))); return (4 * ratio(share)[CL] + 4 * ratio(head)[CL] + 2 * ratio(growth)[CL] + 2 * (100 * 0.70) / best + 4 * fitS[CL]) / 16; },
    unit: '', places: 1, tol: 0.06,
    wrong: [
      { value: r1(T0[CL]), say: 'That is today’s score, with Craft and local’s room at 100. With Arcadia closer, Craft and local no longer has the most room.' },
      { value: r1(clWith((100 * ARC) / room[CL])), say: `That scores the new distance against Craft and local’s old one (${fx(room[CL])}). A ratio to the best divides by the largest distance now on the table: ${NAMES[bestRoomSeg]}’s ${fx(bestRoomNew)}.` },
      { value: r1(T1[EX]), say: 'That is Explorers’ new score. The best room is now Value routine’s, which raises every other segment’s room score, Explorers’ included.' },
      { value: r1(clWith((100 * Math.min(...roomNew)) / ARC)), say: 'More distance from the nearest rival means more room, so the ratio is each segment’s distance over the largest, not the smallest distance over each.' },
    ],
    solution: `The largest distance is now ${NAMES[bestRoomSeg]}’s ${fx(bestRoomNew)}, so Craft and local’s room score is 100 × ${fx(ARC)} ÷ ${fx(bestRoomNew)} = ${fx(roomScoreNew[CL], 1)}. Its weighted score is (4 × ${fx(clRest[0], 1)} + 4 × ${fx(clRest[1], 1)} + 2 × ${fx(clRest[2], 1)} + 2 × ${fx(roomScoreNew[CL], 1)} + 4 × ${fx(clRest[3], 1)}) ÷ 16 = ${fx(T1[CL], 1)}, down from ${fx(T0[CL], 1)}. Every other segment’s room score rises (Explorers’ to ${fx(roomScoreNew[EX], 1)}), so Explorers move to ${fx(T1[EX], 1)}. Craft and local still lead; Arcadia would have to come within about ${fx(tieD)} of their ideal for Explorers to draw level. A rival’s move is a reason to rescore, and to watch the next survey.`,
  },
  {
    id: 'm05-fn-15', lesson: 'targeting-strategies', type: 'steps', kind: 'applied',
    prompt: 'Ana wonders whether the craft Cold Brew planned for Craft and local could serve the Mindful segment too.',
    steps: [
      {
        id: 'm05-fn-15-s1', type: 'num',
        prompt: 'The table gives the two segments’ centres in standardised units on the eight needs. How far apart are the centres (Euclidean distance)? Give two decimal places.',
        data: { table: { head: ['Need', 'Craft and local', 'Mindful'], rows: NEEDS.map((n, j) => [n.label, sgn(cCL[j]), sgn(cMI[j])]), align: ['l', 'r', 'r'] } },
        answer: r2(dMICL),
        check: () => Math.sqrt(S.centres[3].reduce((a, v, j) => a + (v - S.centres[4][j]) ** 2, 0)),
        unit: '', places: 2, tol: 0.012,
        wrong: [
          { value: r2(dMICL ** 2), say: 'That is the squared distance. The distance between centres is its square root.' },
          { value: r2(sum(cCL.map((v, j) => Math.abs(v - cMI[j])))), say: 'That adds the absolute differences (city-block distance). The Euclidean distance squares them, adds and takes the square root.' },
        ],
        solution: `Square the eight differences, add and take the root: √${fx(dMICL ** 2)} ≈ ${fx(dMICL)}.`,
      },
      {
        id: 'm05-fn-15-s2', type: 'mc',
        prompt: `For comparison, Craft and local’s centre is ${fx(dCLEX)} from Explorers’ and ${fx(dCLOG)} from On the go’s. The two segments’ indexes against the average respondent are in the table. Could one craft offer serve both segments?`,
        data: { table: { head: ['Need', 'Craft and local', 'Mindful'], rows: NEEDS.map((n, j) => [n.label, String(S.index[CL][j]), String(S.index[MI][j])]), align: ['l', 'r', 'r'] } },
        options: [
          'Partly: Mindful shares the craft pair’s care for sustainability and local sourcing, but wants low sugar far more and new flavours less, so it needs its own variant',
          'Fully: Mindful is nearer to Craft and local than to any other segment, so the same can and the same message will serve it without change',
          'Not at all: Mindful wants the opposite of Craft and local on almost every need, as On the go does, so it needs a separate brand',
          'Fully: Mindful rates sustainability even higher than Craft and local does, so a craft cold brew is already its ideal coffee',
        ],
        answer: 0,
        feedback: {
          1: 'Nearest isn’t near: Mindful sits further from Craft and local than Explorers do, and the gaps are in health (168 against 101) and novelty (84 against 124), which a craft can of new single origins doesn’t address.',
          2: 'Mindful is much closer to Craft and local than On the go is, and the two share above-average care for sustainability and local businesses.',
          3: 'Sustainability is shared, but Mindful’s top need is health (index 168), which Craft and local rate only average. A sugary or novel can wouldn’t fit.',
        },
        solution: 'Read the distance and the indexes together. Mindful and Craft and local share above-average interest in sustainability and local businesses, but Mindful wants low sugar and calories far more and new flavours less. One position (independent, ethically sourced) could carry both, with a separate product for Mindful, such as an unsweetened low-calorie can: differentiated marketing under one brand, at the cost of a second product.',
      },
    ],
    solution: `The centres are ${fx(dMICL)} apart: further than Explorers (${fx(dCLEX)}), much nearer than On the go (${fx(dCLOG)}). Mindful’s nearest segment is ${NAMES[miNearest]}, but its needs differ on health and novelty, so it would need its own variant rather than the same can.`,
  },
  {
    id: 'm05-fn-16', lesson: 'targeting-strategies', type: 'multi', kind: 'applied',
    prompt: `A fictional regional rail operator’s survey of ${int(RAIL.n + RAIL.others)} passengers found a “weekend explorers” segment of ${RAIL.n}. Its team is drafting a persona from the data in the table. Select all the lines that belong on the persona.`,
    data: { table: { head: ['Measure', 'Weekend explorers', 'Other passengers'], rows: [
      ['Respondents', String(RAIL.n), int(RAIL.others)],
      ['Aged 25–44', pc(RAIL.age / RAIL.n), pc(RAIL.ageOthers / RAIL.others)],
      ['Trips a month', `median ${RAIL.median}, mean ${fx(RAIL.mean, 1)}`, 'median 2, mean 3.1'],
      ['Rate scenic routes 6 or 7 (1–7)', pc(RAIL.scenic / RAIL.n), pc(RAIL.scenicOthers / RAIL.others)],
      ['Usually book', `app ${pc(RAIL.app / RAIL.n)}, station ${pc(RAIL.station / RAIL.n)}, website ${pc(RAIL.web / RAIL.n)}`, 'app 38%, station 44%, website 18%'],
    ], align: ['l', 'r', 'r'] } },
    options: [
      `${fx((RAIL.age / RAIL.n) * 100, 0)}% are aged 25 to 44.`,
      `They usually make about ${RAIL.median} trips a month (the median); a few frequent travellers pull the mean up to ${fx(RAIL.mean, 1)}.`,
      `${fx((RAIL.scenic / RAIL.n) * 100, 0)}% rate scenic routes 6 or 7 out of 7, against ${fx((RAIL.scenicOthers / RAIL.others) * 100, 0)}% of other passengers.`,
      'Books trips through the app.',
      'Is 34 years old and travels with a partner most weekends.',
      'Has a creative job and saves weekends for exploring the region by train.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: `The app is the most common way, but ${pc(RAIL.app / RAIL.n, 0)} is not most of the segment. Write it as a share: “${pc(RAIL.app / RAIL.n, 0)} book through the app”.`,
      4: 'The survey recorded age bands, not an exact age, and nothing about partners. A single age and an invented companion describe almost nobody in the segment.',
      5: 'Neither the job nor the motive was measured. Invented details make a persona vivid and wrong.',
    },
    solution: 'Every persona line should trace to a figure about the segment, given as the share it describes: the age band as a share, usage with the median beside a mean that heavy users pull up, and the defining need with the comparison that shows why it defines the segment. The most common answer is not a description of the persona; exact ages and invented jobs and companions are stereotypes the data never made.',
  },
  {
    id: 'm05-fn-17', lesson: 'targeting-strategies', type: 'num', kind: 'numerical',
    prompt: `Suppose (fictional) Ana lists Lantern Cold Brew in Harbour City’s convenience stores to reach On the go drinkers. From M02’s figures: at $${fx(PRICE)} a can the stores keep ${pc(ch('convenience').margin, 0)} of the price, the single-origin liquid costs $${fx(LIQ)} a can, and the listing costs $${int(LIST)} a year; a can sold through a supermarket earns Lantern $${fx(mSup)}. If ${pc(CANNIB, 0)} of the cans sold in convenience stores would otherwise have been bought in a supermarket, how many cans a year must the convenience stores sell for the listing to add anything at all? Round up to a whole number of cans.`,
    answer: convNeed,
    check: () => Math.ceil(4000 / ((3.49 * 0.6 - 0.74) - 0.3 * (3.49 * 0.68 - 0.74)) - 1e-9),
    unit: 'cans', places: 0, tol: 0.5,
    wrong: [
      { value: convQ(mConv), say: `That ignores cannibalisation. ${pc(CANNIB, 0)} of the convenience-store cans replace supermarket cans that earned $${fx(mSup)} each, which the listing must make up as well.` },
      { value: convQ(PRICE * (1 - ch('convenience').margin)), say: `That uses what Lantern receives a can, $${fx(PRICE * (1 - ch('convenience').margin))}, before the liquid. Subtract the $${fx(LIQ)} to get its contribution.` },
      { value: convQ((1 - CANNIB) * mConv), say: `Cannibalised cans don’t just earn nothing: each one takes away a supermarket can’s $${fx(mSup)}. Net contribution a can = $${fx(mConv)} − ${CANNIB} × $${fx(mSup)}.` },
      { value: convQ(mSup), say: `That uses the supermarket can’s contribution. A convenience-store can earns Lantern $${fx(PRICE)} × ${fx(1 - ch('convenience').margin)} − $${fx(LIQ)} = $${fx(mConv)}.` },
    ],
    solution: `A convenience-store can earns ${fx(PRICE)} × ${fx(1 - ch('convenience').margin)} − ${fx(LIQ)} = $${fx(mConv, 3)}; net of cannibalisation, ${fx(mConv, 3)} − ${CANNIB} × ${fx(mSup, 3)} = $${fx(mConv - CANNIB * mSup, 3)} a can. The listing pays from ${int(LIST)} ÷ ${fx(mConv - CANNIB * mSup, 3)} ≈ ${fx(LIST / (mConv - CANNIB * mSup), 1)}, so ${int(convNeed)} cans a year, about ${pc(convNeed / convChannel, 2)} of the ${fx(convChannel / 1e6, 2)} million cans M02 puts through the city’s convenience stores. The money is not the obstacle; the targeting is. On the go wants convenience and energy, where Lantern is weak, Corner Cup is close to its ideal, and a second message pulls against Lantern’s craft position.`,
  },

  // ================================================================ Module 4: positioning
  {
    id: 'm05-fn-18', lesson: 'perceptual-maps', type: 'mc', kind: 'applied',
    prompt: 'The table gives the distance on Lantern’s map from each segment’s ideal point to each brand. Which segment is least closely served by its nearest brand, and is that an opening for Lantern?',
    data: { table: { head: ['Brand', ...ORDER.map((g) => NAMES[g])], rows: BRANDS.map((b, k) => [b, ...ORDER.map((g) => fx(MD[g][k]))]), align: ['l', 'r', 'r', 'r', 'r', 'r'] } },
    options: [
      `${NAMES[leastServed.g]}, ${fx(leastServed.d)} from ${BRANDS[leastServed.b]}; not an opening for Lantern, which sits ${fx(MD[leastServed.g][0])} from that ideal and fits the segment worst`,
      `Explorers, ${fx(MD[EX][1])} from Summit Brew; an opening for Lantern, which is the Explorers’ second-nearest brand after Summit Brew`,
      `Craft and local, ${fx(MD[CL][3])} from Arcadia Coffee; an opening Lantern should claim quickly before Arcadia moves closer to it`,
      `${NAMES[leastServed.g]}, ${fx(leastServed.d)} from ${BRANDS[leastServed.b]}; an opening for Lantern, since it is the study’s largest segment`,
    ],
    answer: 0,
    feedback: {
      1: `Explorers are ${fx(MD[EX][1])} from Summit Brew, closer than Value routine are to any brand; and Corner Cup (${fx(MD[EX][5])}) is nearer to them than Lantern (${fx(MD[EX][0])}).`,
      2: `Craft and local’s nearest brand is Lantern itself, at ${fx(MD[CL][0])}; Arcadia is its nearest rival.`,
      3: `Size isn’t enough. Lantern is ${fx(MD[VR][0])} from Value routine’s ideal, the segment spends least a head ($${fx(S.sizes[VR].perHead)}) and its fit with Lantern is the worst of the five.`,
    },
    solution: `Each segment’s nearest brand: ${ORDER.map((g) => `${NAMES[g]} ${BRANDS[nearestBrand[g].b]} (${fx(nearestBrand[g].d)})`).join(', ')}. ${NAMES[leastServed.g]} is served least closely. A thinly served space is an opening only for a firm that can credibly fill it and profit: Lantern is ${fx(MD[VR][0])} away, and a cheaper, more convenient brand is far better placed. For Lantern the space is a reason to leave the segment to others.`,
  },
  {
    id: 'm05-fn-19', lesson: 'perceptual-maps', type: 'mc', kind: 'conceptual',
    prompt: `On a fictional perceptual map of five banks, built from six attributes, the two dimensions carry ${pc(BANK.share, 0)} of the variance. Banks P and Q sit almost on top of each other. The arrow for “branches nearby” is short, with loadings of ${fx(BANK.l1)} and ${fx(BANK.l2)}, and customers rate P ${fx(BANK.P, 1)} and Q ${fx(BANK.Q, 1)} on it. What should the analyst conclude?`,
    options: [
      'P and Q look alike on the attributes the map shows well, but it hides most of their difference on branches nearby',
      'Customers see P and Q as the same bank, so neither of them can claim having branches nearby as a point of difference',
      'Branches nearby matters little to bank customers, because its arrow is the shortest of the six on the map',
      'The ratings must be wrong, because two banks at one point on a map must be rated alike on every attribute',
    ],
    answer: 0,
    feedback: {
      1: 'The map shows only part of how the banks differ on branches nearby; the means show P far ahead. P could well claim it.',
      2: 'An arrow’s length shows how well the map represents an attribute, not how much customers care about it. Importance comes from needs data.',
      3: `The map shows ${pc(BANK.share, 0)} of the variance overall but only ${pc(bankH2, 0)} of the differences on branches nearby, so two banks can coincide on the map and still differ on it.`,
    },
    solution: `Branches nearby has a communality of ${fx(BANK.l1)}² + ${fx(BANK.l2)}² = ${fx(bankH2, 4)}: the map shows about ${pc(bankH2, 0)} of the banks’ differences on it. P and Q are close on the map because they are alike on the well-represented attributes, but the table of means shows a gap of ${fx(BANK.P - BANK.Q, 1)} points on branches. Check the means before claiming two brands are seen alike.`,
  },
  {
    id: 'm05-fn-20', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: `On a fictional perceptual map of running shoes, three segments’ ideal points are ${RUN.segs.map((s, g) => `${s.toLowerCase()} (${RUN.size[g] * 100}% of buyers) at (${RUN.ideal[g].map((v) => fx(v, 1).replace('-', '−')).join(', ')})`).join(', ')}. A brand plans to position itself at the ideal point of the average buyer, which lies at the size-weighted average of the three segments’ ideal points. How far is that point from the nearest segment’s ideal? Give two decimal places.`,
    answer: r2(runD[runNear]),
    check: () => Math.hypot(0.4 * 2 + 0.35 * -1.5 + 0.25 * 0.5 - 2.0, 0.4 * 1 + 0.35 * 1.5 + 0.25 * -2 - 1.0),
    unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(dist(runPlain, RUN.ideal[0])), say: 'That averages the three ideal points as if the segments were the same size. Weight each by its share of buyers.' },
      { value: r2(Math.hypot(...runAll)), say: 'That is the average ideal’s distance from the centre of the map. The question asks for its distance from the nearest segment’s ideal.' },
      { value: r2(runD[1]), say: `That is the distance to the ${RUN.segs[1].toLowerCase()}’ ideal. The ${RUN.segs[runNear].toLowerCase()}’ ideal is nearer.` },
      { value: r2(runD[runNear] ** 2), say: 'That is the squared distance. Take the square root.' },
    ],
    solution: `Average ideal: (${RUN.size.map((s, g) => `${s} × ${fx(RUN.ideal[g][0], 1)}`).join(' + ')}, ${RUN.size.map((s, g) => `${s} × ${fx(RUN.ideal[g][1], 1)}`).join(' + ')}) = (${fx(runAll[0], 3)}, ${fx(runAll[1], 3)}). Distances: ${RUN.segs.map((s, g) => `${s.toLowerCase()} ${fx(runD[g])}`).join(', ')}. The nearest, the ${RUN.segs[runNear].toLowerCase()}, are ${fx(runD[runNear])} away: a brand placed at the average buyer’s ideal sits far from every segment’s. Positioning for the average is positioning for nobody in particular, which is the case for segmenting in the first place.`,
  },
  {
    id: 'm05-fn-21', lesson: 'positioning-statements', type: 'steps', kind: 'applied',
    prompt: `Fernlow Yoga (fictional) wants to position itself for its town’s “committed practitioners” segment. On a perceptual map of the town’s four studios, the segment’s ideal point is at (${YO.ideal.map((v) => fx(v, 1)).join(', ')}).`,
    data: { table: { head: ['Studio', 'Dimension 1', 'Dimension 2'], rows: YO.studios.map((s, i) => [s, sgn(YO.at[i][0], 1), sgn(YO.at[i][1], 1)]), align: ['l', 'r', 'r'] } },
    steps: [
      {
        id: 'm05-fn-21-s1', type: 'mc',
        prompt: 'Which rival studio sits nearest the segment’s ideal point?',
        options: YO.studios.slice(1),
        answer: yoRival - 1,
        feedback: Object.fromEntries([1, 2, 3].filter((i) => i !== yoRival).map((i) => [i - 1, `${YO.studios[i]} is ${fx(yoD[i])} from the ideal; ${YO.studios[yoRival]} is ${fx(yoD[yoRival])}.`])),
        solution: `Distances from (${YO.ideal.map((v) => fx(v, 1)).join(', ')}): ${YO.studios.map((s, i) => `${s} ${fx(yoD[i])}`).join(', ')}. The nearest rival is ${YO.studios[yoRival]}, nearer even than Fernlow.`,
      },
      {
        id: 'm05-fn-21-s2', type: 'classify',
        prompt: 'Using the screen from this course (a need matters to the target if its index is at least 110; the studio has a point of difference where it leads the rival by 0.5 rating points or more, holds parity within half a point either side, and has parity to reach where it trails by 0.5 or more), classify each attribute for Fernlow against the rival nearest the ideal. The table gives the segment’s needs index and every studio’s mean rating (1–7).',
        data: { table: { head: ['Attribute', 'Index', ...YO.studios], rows: YO.attrs.map((a, k) => [a, String(YO.index[k]), ...YO.r.map((r) => fx(r[k], 1))]), align: ['l', 'r', 'r', 'r', 'r', 'r'] } },
        items: YO.attrs,
        categories: SCREEN,
        answer: YO.attrs.map((_, k) => screen(k, yoRival)),
        fixed: true,
        feedback: Object.fromEntries(YO.attrs.map((a, k) => [k, (() => { const c = screen(k, yoRival), g = YO.r[0][k] - YO.r[yoRival][k]; return c === 3 ? `Index ${YO.index[k]}: below 110, so it matters less to this segment than the screen requires.` : `Index ${YO.index[k]}, and Fernlow is ${sgn(g, 1)} against ${YO.studios[yoRival]}: ${SCREEN[c].toLowerCase()}.`; })()])),
        solution: `Against ${YO.studios[yoRival]}: ${YO.attrs.map((a, k) => `${a.toLowerCase()} ${SCREEN[screen(k, yoRival)].toLowerCase()}`).join('; ')}.`,
      },
    ],
    solution: `${YO.studios[yoRival]} is the rival nearest the committed practitioners’ ideal (${fx(yoD[yoRival])}, against Fernlow’s ${fx(yoD[0])}), so it is the rival that sets the frame. Against it, Fernlow’s point of difference is its teachers’ expertise, it holds parity on class times, and it trails on a heated studio, the parity it must reach first. The statement follows: for committed practitioners, Fernlow Yoga is the yoga studio with the town’s most expert teachers, because of whatever checkable fact proves it (their training and years of teaching, say), once its studio is as warm as the rival’s. Against another rival the screen would give different answers: the rival decides what counts as a difference.`,
  },
  {
    id: 'm05-fn-22', lesson: 'positioning-statements', type: 'fill', kind: 'conceptual',
    prompt: 'Brindlewick Walks (fictional) is a dog-walking service. Its owner’s notes: most clients work long days in offices and worry about their dogs while they are out; the two rival walking services charge about the same and also use insured, vetted walkers; only Brindlewick’s walkers carry a tracked phone that sends the owner a live map and photos of every walk. Complete its positioning statement.',
    text: 'For [[0]], Brindlewick Walks is the [[1]] that [[2]], because [[3]].',
    blanks: [
      { options: ['dog owners in the city', 'owners who work long days and worry about their dog while they are out', 'people who love dogs and want the best for them', 'busy professionals who want to save money on dog care'], answer: 1 },
      { options: ['dog-walking service', 'pet-care brand', 'only GPS-tracked walking service in the city', 'app for dog owners'], answer: 0 },
      { options: ['uses insured, vetted walkers', 'charges about what other walkers charge', 'lets you see every walk as it happens', 'really loves dogs'], answer: 2 },
      { options: ['it is the fastest-growing walking service in the city', 'its customers say they trust it more than any rival', 'its walkers are the friendliest in town', 'every walker carries a tracked phone that sends a live map and photos'], answer: 3 },
    ],
    solution: '“For owners who work long days and worry about their dog while they are out, Brindlewick Walks is the dog-walking service that lets you see every walk as it happens, because every walker carries a tracked phone that sends a live map and photos.” The target is the group the notes describe, not all owners; the frame is what clients would use instead, the rival walkers; insured walkers and similar prices are points of parity, which Brindlewick must match rather than claim; the difference is the benefit only it offers; and the reason to believe is the checkable fact that makes it credible. Growth, trust and friendliness assert rather than prove.',
  },
  {
    id: 'm05-fn-23', lesson: 'differentiation-and-repositioning', type: 'formula', kind: 'numerical',
    prompt: 'A fictional hotel brand sits at the point in row 2 of its market’s perceptual map. With the axes held fixed, each point on its “quiet rooms” rating moves it by the amounts in row 3, and B4 holds the rise it plans. In D7, calculate the hotel’s distance after the move from the ideal point in row 7, in a formula that can be filled down to D9.',
    sheet: { cells: hotCells, vary: { B4: [0.8, 2.4] } }, cell: 'D7', fill: 'D7:D9', view: 'A1:D9',
    formats: { B: '0.00', C: '0.00', D: '0.00' }, widths: { A: 38, B: 12, C: 12, D: 22 },
    answer: '=SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)',
    alt: [
      '=SQRT((B7-$B$2-$B$4*$B$3)^2+(C7-$C$2-$B$4*$C$3)^2)',
      '=((($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2))^0.5',
      '=SQRT(SUMSQ($B$2+$B$4*$B$3-B7,$C$2+$B$4*$C$3-C7))',
    ],
    wrong: [
      { formula: '=SQRT(($B$2-B7)^2+($C$2-C7)^2)', say: 'That is the distance from where the hotel is today. Move it first: add B4 times the move per point to each coordinate.' },
      { formula: '=SQRT(($B$2+$B$3-B7)^2+($C$2+$C$3-C7)^2)', say: 'That moves the hotel by one rating point. Multiply the move per point by the planned rise in B4.' },
      { formula: '=($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2', say: 'That is the squared distance. Take the square root, as the map’s distances do.' },
      { formula: '=SQRT((B2+B4*B3-B7)^2+(C2+B4*C3-C7)^2)', say: 'Without $ the hotel’s position and the planned move slide down as you fill. Lock them: $B$2, $B$3, $B$4, $C$2 and $C$3.' },
    ],
    solution: `<x>=SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)</x>. The planned rise of ${fx(HOT.rise, 1)} moves the hotel from (${HOT.at.map((v) => fx(v, 2)).join(', ')}) to (${hotNew.map((v) => fx(v, 2)).join(', ')}). Distances after the move: ${HOT.segs.map((s, g) => `${s.toLowerCase()} ${fx(hotD1[g])} (from ${fx(hotD0[g])})`).join(', ')}. The hotel would become the business travellers’ near neighbour but move away from the couples, whose ideal it sits nearest today: the plan should count the couples it could lose, and the ratings would only move if guests experienced quieter rooms.`,
  },
  {
    id: 'm05-fn-24', lesson: 'differentiation-and-repositioning', type: 'mc', kind: 'applied',
    prompt: 'A fictional craft brewery is known for small-batch ales sold in its taproom and in delicatessens. It is determined to win the large “party-pack” segment, who buy twelve-can multipacks of cheap lager in supermarkets and whose ideal point sits on the far side of the market’s perceptual map from the brewery. Which plan puts least of what it already has at risk?',
    options: [
      'Launch a lager under a separate name, priced and sold for the party-pack buyers, so the brewery’s own brand keeps its craft position',
      'Reposition the brewery’s main brand towards cheap multipacks, since the party-pack segment is much larger than its current one',
      'Cut the price of its ales to lager levels in supermarkets, which moves the brewery towards the party-pack ideal on the map',
      'Claim in its advertising that its craft ales are ideal for parties, which repositions the brand without changing the product',
    ],
    answer: 0,
    feedback: {
      1: 'Moving the main brand that far risks the customers who chose it for what it is, and a craft brewery claiming cheap lager would struggle to be believed.',
      2: 'A price cut without lower costs erodes the margin, and it tells today’s drinkers the ales are worth less, while the ales still aren’t what party-pack buyers want.',
      3: 'A claim the product doesn’t support is overpromising; ratings move only when customers experience something different.',
    },
    solution: 'When a target sits far from a brand’s position, moving the main brand risks the customers who chose it, and the move may not be believed. A separately named product (a sub-brand or a new brand) can be positioned, priced and sold for the new segment while the parent keeps its position: differentiated marketing with separate brands. Leaving the segment to rivals is the other low-risk choice, if the brewery is less determined than this one.',
  },
];
