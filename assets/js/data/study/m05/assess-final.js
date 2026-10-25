// assess-final.js — M05 final assessment: 24 questions across all four modules and all eight of the course’s outcomes,
// two or three per lesson (six for module 1, six for module 2, five for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 STP and usable segments fn-1, fn-2; 2 bases fn-3 (demographic), fn-4 (geodemographic),
// fn-5 (behavioural), fn-6 (behavioural and psychographic); 3 cluster analysis fn-7 (choosing k and naming), fn-8 (local
// optima), fn-9 (Ward’s method); 4 profiling, sizing and typing fn-10 (testing whether segments differ), fn-11 (typing),
// fn-12 (sizing from a survey); 5 scorecards, sensitivity and strategy fn-13, fn-14, fn-15, fn-17; 6 personas fn-16;
// 7 perceptual maps fn-18, fn-19 (and fn-22, fn-23); 8 positioning, differentiation and repositioning fn-20, fn-21,
// fn-22, fn-23, fn-24.
// Mixed conceptual, numerical and applied items; four are formula items (two of them in steps: fn-13 and fn-23) on
// worksheets whose inputs are fixed with chosen cells varied, or varied on the marking copies, so that typed results
// fail. Items that combine what several lessons teach: a demographic as a descriptor of a needs segment, read from a
// cross-tab both ways and sharpened by a second descriptor (fn-3: demographics and profiling); choosing k from the elbow,
// the silhouette and the random benchmark, then naming a segment from its index profile (fn-7: cluster analysis and
// profiling); tests across k-means segments, circular on a need that formed them and fair on descriptors, with
// Cramér’s V (fn-10: profiling and cluster analysis); a new rival on the perceptual map fed into the room factor of
// Lantern’s scorecard (fn-14: evaluating segments and perceptual maps); two segments’ centres and indexes, then whether
// the launch offer should also serve a third segment (fn-15: cluster analysis, profiling and targeting); a persona card
// planned from a segment’s index profile (fn-16: targeting and profiling); a convenience-store listing for a distant
// segment with cannibalisation and M02’s channel economics (fn-17: targeting and evaluating); the least closely served
// segment after a rival leaves, judged by Lantern’s distance and fit (fn-18: perceptual maps and evaluating); the
// all-customer ideal point against the segments’ ideals (fn-19: perceptual maps and why segment); a short arrow on a
// biplot and which difference is worth promoting (fn-22: perceptual maps and differentiation); a planned move on fixed
// axes against each segment’s nearest rival (fn-23: perceptual maps, differentiation and targeting); a separate brand
// rather than repositioning (fn-24: targeting strategies and repositioning).
// Lantern’s needs study appears from new angles (income and café use as descriptors of Craft and local, a new craft
// entrant’s effect on room, Mindful against the launch’s two craft segments, the convenience-store channel, Corner Cup
// leaving the market); the other businesses are fictional and in industries not used elsewhere in M05, and nothing
// comes from the project’s scenario, data or angles. No hints; solutions are shown on review. Every num item’s `check`
// recomputes its answer, every figure a prompt states is computed below from its inputs, and every formula item is
// marked by its results on the sheet and on changed copies.
import { RESPONDENTS, DERIVED, BRANDS, NEEDS } from './case.js?v=14';
import { CHANNELS, DEFAULT_PLAN, TIERS, CATEGORY } from '../m02/market.js?v=14';
import { weightedScore } from '../../../core/percmap.js?v=14';
import { fSf, chi2Sf } from '../../../core/inference.js?v=14';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 2) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const m1 = (v) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), 1)}`;      // one decimal, with a real minus sign
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const dist = (a, b) => Math.sqrt(sum(a.map((v, j) => (v - b[j]) ** 2)));

// Lantern's segments (case.js)
const S = DERIVED.segments, NAMES = S.names, LAB = S.labels;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), OG = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const ORDER = [VR, OG, EX, CL, MI];
const RS = RESPONDENTS;

// ---------------------------------------------------------------- module 1: segmentation bases
// a community arts centre (fictional): three tailored memberships beside the general one
const ARTS = { m1: 120, F: 7000, groups: [
  { name: 'Young families', N: 4000, b1: 0.02, m2: 90, b2: 0.05 },
  { name: 'Retired people', N: 6000, b1: 0.03, m2: 100, b2: 0.06 },
  { name: 'Working artists', N: 300, b1: 0.08, m2: 260, b2: 0.12 },
] };
const artsPer = (g) => g.b2 * g.m2 - g.b1 * ARTS.m1;
const artsGain = ARTS.groups.map((g) => g.N * artsPer(g) - ARTS.F);
const artsAll = sum(artsGain);
const artsBest = sum(artsGain.filter((v) => v > 0));
const artsMinArtists = Math.ceil(ARTS.F / artsPer(ARTS.groups[2]) - 1e-9);
// a boiler-servicing firm's 'anxious first-timers' (fictional)
const BOIL = { homes: 52000, share: 0.18, spend: 420, line: 90000, top2: [0.64, 0.22], sample: 2000 };
const boilN = BOIL.homes * BOIL.share;
// Lantern: income over $80,000 and café use as descriptors of Craft and local
const hi = (r) => r.income >= 2, cafe = (r) => r.source === 0;
const cnt = (f) => RS.filter(f).length;
const inCL = (i) => LAB[i] === CL;
const D3 = {
  clHiCafe: cnt((r, i) => inCL(i) && hi(r) && cafe(r)), clHiOther: cnt((r, i) => inCL(i) && hi(r) && !cafe(r)), clLo: cnt((r, i) => inCL(i) && !hi(r)),
  allHiCafe: cnt((r) => hi(r) && cafe(r)), allHiOther: cnt((r) => hi(r) && !cafe(r)), allLo: cnt((r) => !hi(r)),
  clBought: cnt((r, i) => inCL(i) && r.bought),
};
D3.cl = D3.clHiCafe + D3.clHiOther + D3.clLo; D3.clHi = D3.clHiCafe + D3.clHiOther; D3.allHi = D3.allHiCafe + D3.allHiOther; D3.n = RS.length;
const d3Hi = D3.clHi / D3.allHi, d3HiCafe = D3.clHiCafe / D3.allHiCafe, d3Rev = D3.clHi / D3.cl;
const d3OutHi = 1 - d3Hi, d3OutCafe = 1 - d3HiCafe;
const d3PerHi = (D3.allHi - D3.clHi) / D3.clHi, d3PerCafe = (D3.allHiCafe - D3.clHiCafe) / D3.clHiCafe;
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
// a pizza-delivery firm (fictional): neighbourhood types, penetration and a test leaflet drop
const PIZ = { types: ['Suburban owners', 'New-estate families', 'City-centre flats', 'Student areas'], hh: [14000, 11000, 8000, 5000], cust: [1232, 297, 456, 330], test: [3.1, 9.4, 5.2, 2.8], drop: 20000, perType: 2000 };
const pizPen = PIZ.hh.map((h, i) => (PIZ.cust[i] / h) * 1000);
const plan = (order) => { let left = PIZ.drop, won = 0; for (const i of order) { const n = Math.min(left, PIZ.hh[i]); won += (n * PIZ.test[i]) / 1000; left -= n; } return won; };
const byTest = PIZ.types.map((_, i) => i).sort((a, b) => PIZ.test[b] - PIZ.test[a]);
const byPen = PIZ.types.map((_, i) => i).sort((a, b) => pizPen[b] - pizPen[a]);
const pizTestWon = plan(byTest), pizPenWon = plan(byPen);
const pizBest = byTest[0];
// a farm shop's veg-box scheme (fictional): boxes bought last year by 25 members (no ties among the top six)
const BOX = [9, 2, 52, 6, 14, 4, 38, 1, 11, 8, 61, 3, 15, 5, 2, 33, 7, 12, 3, 45, 4, 10, 6, 9, 10];
const boxTop = sum([...BOX].sort((a, b) => b - a).slice(0, 5));
const boxShare = boxTop / sum(BOX);
const boxCells = { A1: 'member', B1: 'boxes last year', ...col('A', 2, BOX.map((_, i) => `M${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, BOX), D2: 'heaviest 20%: share of boxes' };
const BOX_AVG = { avg: 0.59, lo: 0.44, hi: 0.68 };          // the earlier analysis Sharp, Romaniuk and Graham cite

// ---------------------------------------------------------------- module 2: segmenting with data
// a comedy club (fictional): 900 respondents, six standardised needs
const CC = { n: 900, p: 6, ks: [2, 3, 4, 5, 6, 7], wcss: [3880, 3300, 2790, 2450, 2360, 2290], sil: [0.30, 0.25, 0.23, 0.26, 0.22, 0.20], random: 0.09, extra: 41 };
const ccT = (CC.n - 1) * CC.p;
const ccFall = CC.wcss.map((w, i) => (i ? CC.wcss[i - 1] : ccT) - w);
const CC_NEEDS = ['A low price', 'Famous headliners', 'New acts', 'Classic comedy nights', 'Late shows', 'A night out with friends'];
const CC_INDEX = [74, 92, 168, 63, 95, 104];
const CC_YOUNG = [0.61, 0.33];
// a board-game café (fictional): six members' visits last month, two runs of k-means with k = 2
const GAME = { ids: ['A', 'B', 'C', 'D', 'E', 'F'], v: [1, 2, 3, 10, 11, 30] };
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
const run1 = kmeans1d(GAME.v, [GAME.v[0], GAME.v[5]]), run2 = kmeans1d(GAME.v, [GAME.v[0], GAME.v[4]]);
const start2 = sum(GAME.v.map((v) => Math.min((v - GAME.v[0]) ** 2, (v - GAME.v[4]) ** 2)));
const groupOf = (run, g) => GAME.ids.filter((_, i) => run.labels[i] === g).join(', ');
// Ward's method on a commercial printer's ten business clients (fictional), three standardised needs
const WARD = { n: 10, p: 3, cost: [0.3, 0.4, 0.4, 0.6, 0.7, 0.9, 1.1, 9.4, 13.2] };
const wardJump = Math.floor(WARD.cost[7] / WARD.cost[6]);
const wardT = (WARD.n - 1) * WARD.p;                                  // total sum of squares of standardised data
const wardWcss = (groups) => sum(WARD.cost.slice(0, WARD.n - groups)); // after m merges, n − m groups
// a theme park (fictional): four k-means segments of 1,200 visitors, tested on a need that formed them and on two descriptors
const PARK = { n: 1200, k: 4, F: 412.6, party: { chi: 96.0, levels: 3 }, region: { chi: 11.2, levels: 4 } };
const parkDfF = [PARK.k - 1, PARK.n - PARK.k];
const parkTest = (t) => { const df = (PARK.k - 1) * (t.levels - 1); return { df, p: chi2Sf(t.chi, df), v: Math.sqrt(t.chi / (PARK.n * (Math.min(PARK.k, t.levels) - 1))) }; };
const parkParty = parkTest(PARK.party), parkRegion = parkTest(PARK.region), parkPF = fSf(PARK.F, ...parkDfF);
const pFmt = (p) => (p < 0.001 ? '< 0.001' : fx(p, 2));
// an olive-oil brand's typing tool (fictional): three golden questions
const PF = { qs: ['Low price', 'Single estate', 'Strong flavour'], ans: [3, 6, 6], mu: [4.3, 4.9, 3.6], sd: [1.6, 1.2, 1.5],
  segs: ['Bargain buyers', 'Provenance seekers', 'Flavour lovers', 'Everyday cooks'], z: [[1.1, -0.7, -0.4], [-0.5, 1.0, 0.2], [-0.3, 0.1, 1.3], [0.2, -0.6, -0.8]] };
const pfZ = PF.ans.map((a, j) => (a - PF.mu[j]) / PF.sd[j]);
const pfD = PF.z.map((c) => sum(c.map((v, j) => (pfZ[j] - v) ** 2)));
const pfNear = pfD.indexOf(Math.min(...pfD));
const pfSecond = pfD.map((d, g) => ({ d, g })).sort((a, b) => a.d - b.d)[1].g;
const pfCells = {
  B1: PF.qs[0], C1: PF.qs[1], D1: PF.qs[2],
  A2: 'new answer (1–7)', B2: PF.ans[0], C2: PF.ans[1], D2: PF.ans[2],
  A3: 'study mean', B3: PF.mu[0], C3: PF.mu[1], D3: PF.mu[2],
  A4: 'study SD', B4: PF.sd[0], C4: PF.sd[1], D4: PF.sd[2],
  A6: 'centre (z)', B6: PF.qs[0], C6: PF.qs[1], D6: PF.qs[2], E6: 'squared distance',
  ...Object.fromEntries(PF.segs.flatMap((s, g) => [[`A${g + 7}`, s], ...PF.z[g].map((v, j) => [`${'BCD'[j]}${g + 7}`, v])])),
};
// a home-furnishings retailer's e-mail survey of its card holders (fictional)
const HOME = { cards: 9400, replies: 1850, share: 0.31 };
const homeMoe = 1.96 * Math.sqrt((HOME.share * (1 - HOME.share)) / HOME.replies);

// ---------------------------------------------------------------- module 3: targeting
// a car-rental firm (fictional): business travellers (A) against holidaymakers (B)
const CAR = { factors: ['Size', 'Spend per head', 'Growth', 'Room from rivals', 'Fit'], w: [4, 3, 2, 2, 4], A: [100, 85, 70, 45, 90], B: [80, 70, 85, 95, 60] };
const carSum = (s) => sum(s.map((v, k) => v * CAR.w[k]));
const carGap = carSum(CAR.A) - carSum(CAR.B);
const carDelta = CAR.A.map((a, k) => carGap / (CAR.B[k] - a));
const carCells = {
  A1: 'factor', B1: 'weight', C1: 'Business', D1: 'Holidaymakers', E1: 'change to tie',
  ...col('A', 2, CAR.factors), ...col('B', 2, CAR.w), ...col('C', 2, CAR.A), ...col('D', 2, CAR.B),
  A7: 'weighted sum', C7: '=SUMPRODUCT($B$2:$B$6,C2:C6)', D7: '=SUMPRODUCT($B$2:$B$6,D2:D6)',
};
// Lantern's scorecard (evaluating-segments): ratio-to-best scores, fit centred on 50, Ana's weights; then a new entrant
const share = S.sizes.map((s) => s.share), head = S.sizes.map((s) => s.perHead);
const growth = DERIVED.targeting.growth, fit = DERIVED.targeting.fit;
const room = DERIVED.map.nearestRival.map((x) => x.d);
const ratio = (a) => a.map((v) => (100 * v) / Math.max(...a));
const maxFit = Math.max(...fit.map(Math.abs));
const fitS = fit.map((v) => 50 + (50 * v) / maxFit);
const W_ANA = [4, 4, 2, 2, 4];
const scoreWith = (rm) => weightedScore([ratio(share), ratio(head), ratio(growth), ratio(rm), fitS], W_ANA);
const NEW = 0.70;                                                     // the new craft brand's distance from the Craft and local ideal
const roomNew = room.map((d, g) => (g === CL ? NEW : d));
const T0 = scoreWith(room), T1 = scoreWith(roomNew);
const roomScoreNew = ratio(roomNew);
const clRest = [ratio(share)[CL], ratio(head)[CL], ratio(growth)[CL], fitS[CL]];
const clWith = (roomScore) => (W_ANA[0] * clRest[0] + W_ANA[1] * clRest[1] + W_ANA[2] * clRest[2] + W_ANA[3] * roomScore + W_ANA[4] * clRest[3]) / sum(W_ANA);
const bestRoomNew = Math.max(...roomNew), bestRoomSeg = roomNew.indexOf(bestRoomNew);
const tieD = ((T1[EX] * sum(W_ANA) - (W_ANA[0] * clRest[0] + W_ANA[1] * clRest[1] + W_ANA[2] * clRest[2] + W_ANA[4] * clRest[3])) / W_ANA[3]) * bestRoomNew / 100;
// Mindful's centre against Craft and local's
const cMI = S.centres[MI], cCL = S.centres[CL];
const dMICL = dist(cMI, cCL), dCLEX = dist(cCL, S.centres[EX]), dCLOG = dist(cCL, S.centres[OG]);
const miNearest = ORDER.filter((g) => g !== MI).map((g) => ({ g, d: dist(cMI, S.centres[g]) })).sort((a, b) => a.d - b.d)[0].g;
const AWARE = DERIVED.aware;
const MI_BOUGHT = cnt((r, i) => LAB[i] === MI && r.bought);
// a regional rail operator's 'scenic day-trippers' (fictional)
const RAIL = { n: 412, total: 2600, age: 239, scenic: 171, seat: 128, fares: 74, fam: { n: 530, fares: 152, scenic: 98 } };
// Lantern Cold Brew in convenience stores (M02's channel economics)
const ch = (id) => CHANNELS.find((c) => c.id === id);
const PRICE = DEFAULT_PLAN.price, COGS = TIERS.find((t) => t.id === DEFAULT_PLAN.tier).cogs;
const mConv = PRICE * (1 - ch('convenience').margin) - COGS, mSup = PRICE * (1 - ch('supermarket').margin) - COGS;
const LIST = ch('convenience').listing, CANNIB = 0.30, CANS = 9000;
const convAdd = (mNew, mOld) => CANS * (mNew - CANNIB * mOld) - LIST;
const convNet = convAdd(mConv, mSup);
const convCents = convAdd(r2(mConv), r2(mSup));
const convChannel = CATEGORY.cansPerYear * ch('convenience').volume;

// ---------------------------------------------------------------- module 4: positioning
// Lantern's map without Corner Cup: each segment's nearest remaining brand
const MD = DERIVED.map.distances;
const GONE = BRANDS.indexOf('Corner Cup');
const nearestLeft = MD.map((row) => { let b = -1; row.forEach((d, k) => { if (k !== GONE && (b < 0 || d < row[b])) b = k; }); return { b, d: row[b] }; });
const leastServed = nearestLeft.map((x, g) => ({ ...x, g })).sort((a, b) => b.d - a.d)[0];
const secondFor = (g) => MD[g].map((d, k) => ({ d, k })).filter((x) => x.k !== GONE).sort((a, b) => a.d - b.d)[1];
const nearestToday = MD.map((row) => { const b = row.indexOf(Math.min(...row)); return { b, d: row[b] }; });
// running-shoe buyers (fictional): three segments' ideal points and the all-customer ideal
const RUN = { segs: ['Racers', 'Comfort walkers', 'Fashion buyers'], size: [0.40, 0.35, 0.25], ideal: [[2.0, 1.0], [-1.5, 1.5], [0.5, -2.0]] };
const runAll = [0, 1].map((k) => sum(RUN.ideal.map((p, g) => RUN.size[g] * p[k])));
const runD = RUN.ideal.map((p) => dist(runAll, p));
const runNear = runD.indexOf(Math.min(...runD));
const runPlain = [0, 1].map((k) => sum(RUN.ideal.map((p) => p[k])) / RUN.ideal.length);
// tyre-fitting chains (fictional): a short arrow
const OPT = { l1: 0.35, l2: 0.40, P: 6.1, Q: 2.9, share: 0.80, index: 142, appP: 5.2, appQ: 5.1 };   // tyre-fitting chains
const optH2 = OPT.l1 ** 2 + OPT.l2 ** 2;
// an aquarium's planned move (fictional): 'family activities', against each segment's nearest rival
const AQ = { at: [-0.6, 1.0], per: [0.30, -0.25], rise: 2.0, segs: ['Young families', 'Couples', 'School groups'], ideal: [[0.4, 0.3], [-0.9, 1.3], [1.2, -0.4]],
  rival: [0.60, 0.70, 0.40], rivalName: ['the science centre', 'the art gallery', 'the city farm'] };
const aqNew = AQ.at.map((v, k) => v + AQ.rise * AQ.per[k]);
const aqD0 = AQ.ideal.map((p) => dist(AQ.at, p)), aqD1 = AQ.ideal.map((p) => dist(aqNew, p));
const aqGap0 = aqD0.map((d, g) => d - AQ.rival[g]), aqGap1 = aqD1.map((d, g) => d - AQ.rival[g]);
const aqCells = {
  B1: 'Dimension 1', C1: 'Dimension 2',
  A2: 'the aquarium today', B2: AQ.at[0], C2: AQ.at[1],
  A3: 'move per point', B3: AQ.per[0], C3: AQ.per[1],
  A4: 'planned rise', B4: AQ.rise,
  A6: 'segment ideal', B6: 'Dimension 1', C6: 'Dimension 2', D6: 'nearest rival', E6: 'gap after move',
  ...Object.fromEntries(AQ.segs.flatMap((s, g) => [[`A${g + 7}`, s], [`B${g + 7}`, AQ.ideal[g][0]], [`C${g + 7}`, AQ.ideal[g][1]], [`D${g + 7}`, AQ.rival[g]]])),
};

export const items = [
  // ================================================================ Module 1: segmentation bases
  {
    id: 'm05-fn-1', lesson: 'why-segment', type: 'mc', kind: 'applied',
    prompt: `A fictional community arts centre sells one general membership, each contributing $${ARTS.m1} a year. It could add a tailored membership for each of three groups in its town, each costing $${int(ARTS.F)} a year to run. Anyone in a group who would have bought the general membership would take the group’s tailored one instead. Which plan should the centre adopt?`,
    data: { table: { head: ['Group', 'People', 'Buy the general one', 'Tailored: $ a year', 'Tailored: buy'], rows: ARTS.groups.map((g) => [g.name, int(g.N), pc(g.b1, 0), `$${g.m2}`, pc(g.b2, 0)]), align: ['l', 'r', 'r', 'r', 'r'] } },
    options: [
      'Tailor for the families and the retired only: there are too few working artists to cover a tailored membership’s cost',
      'Offer all three: each tailored membership raises its group’s purchase rate, so each one brings in more members than the general one',
      `Tailor for the retired only: the family membership earns $${ARTS.m1 - ARTS.groups[0].m2} less per member than the general one, so it loses more than it gains`,
      'Tailor for the artists only: their membership earns the most per member and they have the highest purchase rate of the three groups',
    ],
    answer: 0,
    feedback: {
      1: `More members isn’t enough: each tailored membership must cover its own running cost. The artists’ adds too little contribution to do so and loses ${usd(-artsGain[2])} a year.`,
      2: `A lower contribution per member can still pay if many more people buy: the family membership more than doubles the share who join, and gains ${usd(artsGain[0])} a year after its cost.`,
      3: `Per member the artists’ membership is the best, but there are only ${int(ARTS.groups[2].N)} artists: the group is too small to cover a $${int(ARTS.F)} offer.`,
    },
    solution: `Gain for each group = N × (share × contribution with the tailored membership − share × $${ARTS.m1} with the general one) − $${int(ARTS.F)}. ${ARTS.groups.map((g, i) => `${g.name}: ${int(g.N)} × (${fx(g.b2 * g.m2)} − ${fx(g.b1 * ARTS.m1)}) − ${int(ARTS.F)} = ${usd(artsGain[i])}`).join('. ')}. Two tailored memberships gain ${usd(artsBest)} a year, all three only ${usd(artsAll)}. Each artist would be the most valuable member of all, but the group fails the substantial test: it would take ${int(artsMinArtists)} artists to cover the cost, and the town has ${int(ARTS.groups[2].N)}.`,
  },
  {
    id: 'm05-fn-2', lesson: 'why-segment', type: 'multi', kind: 'conceptual',
    prompt: `A fictional boiler-servicing firm’s cluster analysis of homeowners’ needs found a segment it calls “anxious first-timers”. Its notes on the segment:<br>1. A random sample of ${int(BOIL.sample)} homeowners in its region puts the segment at about ${pc(BOIL.share, 0)} of the region’s ${int(BOIL.homes)} homeowners: about ${int(Math.round(boilN / 100) * 100)} households.<br>2. They spend about $${BOIL.spend} a year each on boiler servicing and repairs, about $${fx((boilN * BOIL.spend) / 1e6, 1)} million in all; a telephone advice line for them would cost about $${int(BOIL.line)} a year.<br>3. Most are not yet its customers, and no list or medium the firm can buy reaches first-time homeowners as such.<br>4. In a concept test they rated a service plan with an advice line far higher than other homeowners did: ${pc(BOIL.top2[0], 0)} top-two box against ${pc(BOIL.top2[1], 0)}.<br>5. The firm has no heating engineers to spare for an advice line, and can’t recruit any this year.<br>Select all the tests of a usable segment that the segment already passes.`,
    options: ['Measurable', 'Substantial', 'Accessible', 'Differentiable', 'Actionable'],
    answer: [0, 1, 3],
    feedback: {
      2: 'No list or medium reaches them, and most aren’t customers: until the firm can find them (with a question when they book a first service, say), it can’t reach them at an affordable cost.',
      4: 'Actionable asks whether the business can design and run the programme with its resources. Without engineers to spare it can’t staff the advice line the segment wants.',
    },
    solution: `Measurable: a probability sample sizes it. Substantial: about $${fx((boilN * BOIL.spend) / 1e6, 1)} million of spending against a $${int(BOIL.line)} programme. Differentiable: it responds to the advice-line concept very differently from other homeowners. It fails accessible (no way yet to reach first-time homeowners as such) and actionable (no engineers to give the advice). Each failure has a remedy (a typing question in the booking form; engineers recruited next year or shared with a partner firm), and the segment can’t be marketed to until both are in place.`,
  },
  {
    id: 'm05-fn-3', lesson: 'demographic-and-geographic', type: 'steps', kind: 'numerical',
    prompt: `Lantern’s media agency proposes reaching the Craft and local segment with advertising aimed at households with incomes over $80,000, pointing out that ${pc(d3Rev)} of the segment have such incomes. The table counts the needs study’s ${D3.n} respondents by income and by whether they mostly buy their coffee at a café (an opt-in panel with age quotas).`,
    data: { table: { head: ['', 'Over $80k, café first', 'Over $80k, other source', '$80k or under', 'All'], rows: [
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
          { value: r1((D3.clHi / D3.n) * 100), say: `That divides by all ${D3.n} respondents. The base is the high earners only.` },
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
          'Income describes the segment without defining it: use it together with where people buy, and reach the segment in cafés',
          'Income is the right base: when nearly four-fifths of a segment share a trait, advertising by that trait reaches it with little waste',
          'Use income alone: adding café use would cut the audience by more than half and lose most of the segment’s high earners',
          'Aim at high earners who buy at cafés: with that second descriptor, most of the people reached are in Craft and local',
        ],
        answer: 0,
        feedback: {
          1: 'A trait shared by most of a segment can still be shared by many people outside it. What matters for waste is the share of the people reached who are in the segment.',
          2: `Café use cuts the audience from ${D3.allHi} to ${D3.allHiCafe}, but it keeps ${D3.clHiCafe} of the segment’s ${D3.clHi} high earners: of the ${D3.allHi - D3.allHiCafe} people it drops, only ${D3.clHiOther} are in Craft and local.`,
          3: `Fewer than half: ${pc(d3HiCafe)} of the high-earning café buyers are in Craft and local, and ${pc(d3OutCafe, 0)} are in other segments. Two descriptors sharpen the aim without removing the waste.`,
        },
        solution: `Read the cross-tab both ways. Most of Craft and local are high earners, but most high earners belong to other segments. Adding café use cuts the share of the audience outside the segment from ${pc(d3OutHi, 0)} to ${pc(d3OutCafe, 0)}: about ${WORDS[Math.round(d3PerCafe)]} other drinker per Craft and local member reached, instead of ${WORDS[Math.round(d3PerHi)]}. Only about one in seven of the segment (${D3.clBought} of ${D3.cl}) bought Lantern in the past year, so Lantern’s own cafés reach few of them; advertising where café-goers are is the wider route.`,
      },
    ],
    solution: `${pc(d3Rev)} of Craft and local are high earners, but only ${pc(d3Hi)} of high earners are Craft and local; among high earners who mostly buy at a café, ${pc(d3HiCafe)} are. Demographics describe and help reach a needs segment; they don’t define it. These are shares of an opt-in panel, so treat them as a guide to how mixed each audience is, not as the city’s figures.`,
  },
  {
    id: 'm05-fn-4', lesson: 'demographic-and-geographic', type: 'mc', kind: 'applied',
    prompt: `A fictional pizza-delivery firm classifies its delivery area by neighbourhood type, using a geodemographic classification. The table gives each type’s households, its current customers, customers per 1,000 households (penetration) and the new customers won per 1,000 leaflets when, last autumn, it sent ${int(PIZ.perType)} test leaflets into each type. This spring it can afford ${int(PIZ.drop)} leaflets, one per household. Where should most of them go?`,
    data: { table: { head: ['Neighbourhood type', 'Households', 'Customers', 'Per 1,000 households', 'New per 1,000 test leaflets'], rows: PIZ.types.map((t, i) => [t, int(PIZ.hh[i]), int(PIZ.cust[i]), fx(pizPen[i], 1), fx(PIZ.test[i], 1)]), align: ['l', 'r', 'r', 'r', 'r'] } },
    options: [
      `To the ${PIZ.types[pizBest].toLowerCase()}: the test measured what a leaflet wins now, and it won most there; penetration ranks past success`,
      `To the ${PIZ.types[byPen[0]].toLowerCase()}: the highest penetration shows the best fit with the firm, so leaflets there will win the most new customers`,
      `Spread them evenly: from ${int(PIZ.perType)} test leaflets in each type, the gaps between the four test rates are too small to act on`,
      `To the ${PIZ.types[3].toLowerCase()}: high penetration and few households mean the whole type can be covered with the fewest leaflets of all`,
    ],
    answer: 0,
    feedback: {
      1: 'High penetration says the firm already does well there, so many willing buyers are already customers. The test measures what a leaflet wins now, and suburban owners responded least but one.',
      2: `The best type’s test leaflets won about ${fx((PIZ.test[pizBest] * PIZ.perType) / 1000, 0)} new customers and the worst type’s about ${fx((Math.min(...PIZ.test) * PIZ.perType) / 1000, 0)}: over ${WORDS[Math.floor(PIZ.test[pizBest] / Math.min(...PIZ.test))]} times as many from the same number of leaflets. A small drop in the other types can keep checking the rates.`,
      3: 'Covering a type cheaply is no use if few households respond: the student areas gave the fewest new customers per leaflet.',
    },
    solution: `Penetration is customers ÷ households × 1,000: ${PIZ.types.map((t, i) => `${t.toLowerCase()} ${fx(pizPen[i], 1)}`).join(', ')}. It ranks the types by how well the firm has done, not by how many new customers a leaflet will win. The test drop measures the second directly. Leafleting in order of the test rates (all ${int(PIZ.hh[byTest[0]])} households of the first type, then the ${PIZ.types[byTest[1]].toLowerCase()} and so on) should win about ${fx(pizTestWon, 0)} new customers, against about ${fx(pizPenWon, 0)} in order of penetration. Each test rate rests on ${int(PIZ.perType)} leaflets (about ${fx((PIZ.test[pizBest] * PIZ.perType) / 1000, 0)} new customers in the best type), so keep a small drop in the other types to check the rates.`,
  },
  {
    id: 'm05-fn-5', lesson: 'psychographic-and-behavioural', type: 'formula', kind: 'numerical',
    prompt: 'A fictional farm shop’s veg-box scheme has 25 members. Column B holds the boxes each member bought last year. In E2, calculate the share of all the boxes bought last year that the heaviest 20% of members bought.',
    sheet: { cells: boxCells, fixed: ['B2:B26'], vary: { B12: [57, 66], B9: [36, 41] } }, cell: 'E2', view: 'A1:E26', maxHeight: '22rem',
    formats: { E2: '0.0%' }, widths: { A: 9, B: 15, C: 3, D: 28, E: 10 },
    answer: '=SUM(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)',
    alt: [
      '=SUMPRODUCT(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)',
      '=SUMIF(B2:B26,">="&LARGE(B2:B26,5))/SUM(B2:B26)',
      '=SUMPRODUCT((B2:B26>=LARGE(B2:B26,5))*B2:B26)/SUM(B2:B26)',
      '=SUM(LARGE(B2:B26,SEQUENCE(5)))/SUM(B2:B26)',
    ],
    wrong: [
      { formula: '=LARGE(B2:B26,5)/SUM(B2:B26)', say: '<x>LARGE(B2:B26,5)</x> is the fifth-largest value alone. The heaviest 20% of 25 members are the top five: add all five, for example with <x>LARGE(B2:B26,{1,2,3,4,5})</x> inside <x>SUM</x>.' },
      { formula: '=SUM(B2:B6)/SUM(B2:B26)', say: '<x>B2:B6</x> are the first five members in the list, not the five heaviest. The list isn’t sorted: pick the largest five with <x>LARGE</x>.' },
      { formula: '=SUMIF(B2:B26,">"&LARGE(B2:B26,5))/SUM(B2:B26)', say: 'With <x>">"</x> the fifth-heaviest member is left out. Use <x>">="</x> to include it.' },
      { formula: '=SUM(LARGE(B2:B26,{1,2,3,4,5}))/COUNT(B2:B26)', say: 'That divides by the number of members, giving boxes per member. A share of the boxes divides by all the boxes, <x>SUM(B2:B26)</x>.' },
    ],
    solution: `<x>=SUM(LARGE(B2:B26,{1,2,3,4,5}))/SUM(B2:B26)</x>: the five heaviest members bought ${boxTop} of the ${sum(BOX)} boxes, ${pc(boxShare)}. Concentrated, far from 80/20, and close to the ${pc(BOX_AVG.avg, 0)} average (${pc(BOX_AVG.lo, 0)} to ${pc(BOX_AVG.hi, 0)} across categories) of an earlier analysis that Sharp, Romaniuk and Graham cite for the heaviest fifth of a brand’s buyers. The other twenty members still buy nearly two-fifths of the boxes (${pc(1 - boxShare, 0)}), so a scheme that served only its heaviest members would give up a large part of its volume, and the light members from whom tomorrow’s heavier ones come.`,
  },
  {
    id: 'm05-fn-6', lesson: 'psychographic-and-behavioural', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional chocolate maker has six decisions to make. Which segmentation base, psychographic or behavioural, fits each decision best?',
    items: [
      'Which weeks of the year to make extra gift boxes',
      'Whether to advertise in hiking magazines or in home-baking magazines, given how its buyers like to spend their weekends',
      'Whether to lead its range with low-sugar chocolate or with intense 85% dark bars',
      'Which wholesale accounts get a volume discount, judged by how much they order a month',
      'Which customers to thank for buying from no other chocolate maker for three years',
      'What to tell people who have heard of the brand but don’t yet know what it makes',
    ],
    categories: ['Lifestyle', 'Occasion', 'Benefits sought', 'Usage rate', 'Loyalty status', 'Buyer-readiness stage'],
    answer: [1, 0, 2, 3, 4, 5],
    feedback: {
      0: 'Gift boxes sell around events (holidays, birthdays): the decision turns on when and why people buy, the occasion.',
      1: 'How buyers spend their time, their activities and interests, is lifestyle, a psychographic base: it says which media reach their world.',
      2: 'Low sugar against intensity is a choice between the benefits different buyers seek from chocolate.',
      3: 'How much an account orders in a period is its usage rate.',
      4: 'Buying from no other maker for years is strong loyalty status.',
      5: 'People who know the name but not what it offers sit at an early readiness stage (aware, not yet informed): the job is to inform.',
    },
    solution: 'Each base answers a different question. Lifestyle, a psychographic base: how buyers live and spend their time (hiking or baking, and the media that go with each). The behavioural bases: occasion, when and why people buy (gift seasons); benefits sought, what they want from the product (low sugar or intensity); usage rate, how much they buy (volume discounts); loyalty status, how firmly they stick to the brand (thanks for loyal customers); buyer-readiness stage, how far they are from buying (what to tell the merely aware). Choose the base from the decision, as with demographics.',
  },

  // ================================================================ Module 2: segmenting with data
  {
    id: 'm05-fn-7', lesson: 'cluster-analysis', type: 'steps', kind: 'applied',
    prompt: `A fictional comedy club surveyed ${int(CC.n)} people about how much six things matter when they choose a night of comedy, and ran k-means on the standardised answers with 30 restarts for each k.`,
    steps: [
      {
        id: 'm05-fn-7-s1', type: 'mc',
        prompt: `How many segments should the club take into profiling? The table gives each solution; with one segment the within-cluster sum of squares is ${int(ccT)}. On random ratings of the same size, five segments give a mean silhouette of ${fx(CC.random)}. With four segments, two groups with different tastes in acts share a segment; with six, a segment of ${CC.extra} people appears whose ratings are close to average on every need.`,
        data: { table: { head: ['k', 'Within-cluster sum of squares', 'Fall from k − 1', 'Mean silhouette'], rows: CC.ks.map((k, i) => [String(k), int(CC.wcss[i]), int(ccFall[i]), fx(CC.sil[i])]), align: ['r', 'r', 'r', 'r'] } },
        options: [
          'Five: the falls shrink sharply after it, its silhouette is a local peak, and four would put two different tastes together',
          `Two: its mean silhouette, ${fx(CC.sil[0])}, is the highest of the six, so two segments describe the audience best`,
          'Seven: its within-cluster sum of squares is the lowest of the six solutions, so it describes the audience in the most detail',
          `Six: its fall of ${int(ccFall[4])} is still a gain, and the extra ${CC.extra} people make a niche the club could serve on its own`,
        ],
        answer: 0,
        feedback: {
          1: 'The silhouette tends to favour a few large groups when one split dominates the data, and two is one broad split. Read it with the elbow and with what the segments mean.',
          2: 'The within-cluster sum of squares always falls as k rises. Look for where the falls shrink, not for the lowest value.',
          3: `A fall of ${int(ccFall[4])}, after ${int(ccFall[3])}, buys little, and a segment whose ratings are close to average on every need wants nothing in particular: it adds no new offer, and ${CC.extra} people would hardly pass the substantial test.`,
        },
        solution: `The falls are ${ccFall.map(int).join(', ')}: they shrink sharply after five (${int(ccFall[3])}, then ${int(ccFall[4])}). The silhouette is highest at two (${fx(CC.sil[0])}) but has a local peak at five (${fx(CC.sil[3])} against ${fx(CC.sil[2])} and ${fx(CC.sil[4])}). ${fx(CC.sil[3])} is weak structure on Kaufman and Rousseeuw’s scale, at the bottom of their 0.26–0.50 band, but about three times the random benchmark (${fx(CC.random)}): weak but real, with overlapping segments. Four would merge two tastes the club programmes for differently; six adds a segment that wants nothing in particular. Five, then.`,
      },
      {
        id: 'm05-fn-7-s2', type: 'mc',
        prompt: `In the chosen solution, one segment’s indexes against the average respondent are: ${CC_NEEDS.map((n, j) => `${n.toLowerCase()} ${CC_INDEX[j]}`).join(', ')}. ${pc(CC_YOUNG[0], 0)} of its members are under 35, against ${pc(CC_YOUNG[1], 0)} of all respondents. Which name fits the segment best?`,
        options: ['New-act seekers', 'Young bohemians', 'Comedy connoisseurs', 'Bargain hunters'],
        answer: 0,
        feedback: {
          1: `Age is a descriptor, not what formed the segment, and ${pc(1 - CC_YOUNG[0], 0)} of the members are 35 or over; “bohemian” claims a lifestyle nobody measured.`,
          2: `They care less than average about famous headliners (index ${CC_INDEX[1]}) and much less about classic comedy nights (${CC_INDEX[3]}): the name would claim a breadth of taste the profile contradicts.`,
          3: `A low price indexes ${CC_INDEX[0]}: price matters less to this segment than to the average respondent.`,
        },
        solution: `Name a needs segment by its highest indexes and check the name against the lows. New acts (${CC_INDEX[2]}) stand far above everything else, and classic comedy nights (${CC_INDEX[3]}) and a low price (${CC_INDEX[0]}) are well below average. “New-act seekers” says that and nothing more; the age profile goes in the segment’s description as a share, not in its name.`,
      },
    ],
    solution: 'Five segments: the elbow and a local peak of the silhouette agree, the structure is weak but well above the random benchmark, four would merge two tastes and six adds nothing new. Name each segment from its highs and lows, keeping descriptors such as age for the description, and check that the five are stable before profiling them.',
  },
  {
    id: 'm05-fn-8', lesson: 'cluster-analysis', type: 'steps', kind: 'numerical',
    prompt: `A fictional board-game café tries k-means with k = 2 on one variable, its six members’ visits last month, to keep the arithmetic short: ${GAME.ids.map((id, i) => `${id} ${GAME.v[i]}`).join(', ')}. Run 1 starts with its centres at members A and F; run 2 starts with them at members A and E.`,
    steps: [
      {
        id: 'm05-fn-8-s1', type: 'num',
        prompt: 'Run 2 assigns and updates until no member moves. What is its within-cluster sum of squares when it stops?',
        answer: run2.wcss,
        check: () => ((1 - 2) ** 2 + 0 + (3 - 2) ** 2) + ((10 - 17) ** 2 + (11 - 17) ** 2 + (30 - 17) ** 2),
        unit: '', places: 0, tol: 0.5,
        wrong: [
          { value: start2, say: 'That is measured around the starting centres, before the update move. Move each centre to its members’ mean, then check whether anyone changes group.' },
          { value: run1.wcss, say: 'That is where run 1 stops. Run 2’s start leads to a different grouping.' },
          { value: run2.wcss - sum([1, 2, 3].map((v) => (v - 2) ** 2)), say: 'That is the second group alone. Add the first group’s squared distances too.' },
        ],
        solution: `Around A (1) and E (11): A, B and C join A; D, E and F join E. The centres move to 2 and (10 + 11 + 30) ÷ 3 = 17. Now D is 8 from 2 and 7 from 17, so it stays, and nobody moves. WCSS = (1 + 0 + 1) + (49 + 36 + 169) = ${fx(run2.wcss, 0)}.`,
      },
      {
        id: 'm05-fn-8-s2', type: 'mc',
        prompt: `Run 1 stops with ${groupOf(run1, 0)} in one segment and ${groupOf(run1, 1)} in the other, and a within-cluster sum of squares of ${fx(run1.wcss, 1)}. What do the two runs show?`,
        options: [
          'Run 2 stopped at a local optimum: keep run 1’s lower-sum grouping and run k-means from many starts',
          'Run 2 is the better solution, because its two segments are of equal size while run 1’s are five members and one',
          'The six members have little structure to segment, since two runs on the same data stopped at different groupings',
          'Run 1 went wrong at its start: F, at 30 visits, is an outlier and shouldn’t have been a starting centre',
        ],
        answer: 0,
        feedback: {
          1: 'k-means is judged by the within-cluster sum of squares, not by how even the segments are, and run 1’s is far lower.',
          2: 'Different groupings from different starts are what local optima look like, even in data with clear structure. Compare the runs’ sums and keep the lowest.',
          3: 'k-means++ favours far-off members as starting centres, and run 1’s start led to the far lower sum. Whether a one-member segment is worth an offer is a separate question, the substantial test.',
        },
        solution: 'k-means only improves the solution it starts from, so a poor start can stop at a grouping that no single assign or update move improves, although a better one exists. That is why analysts use k-means++ starts and many restarts, and keep the run with the lowest within-cluster sum of squares.',
      },
    ],
    solution: `Run 2 stops at ${groupOf(run2, 0)} and ${groupOf(run2, 1)} with a within-cluster sum of squares of ${fx(run2.wcss, 0)}; run 1 reaches ${fx(run1.wcss, 1)}. Both are stable groupings, but run 2’s is a local optimum. Keep the lower sum, and in real analyses use many k-means++ starts, as Lantern’s analyst did.`,
  },
  {
    id: 'm05-fn-9', lesson: 'cluster-analysis', type: 'steps', kind: 'numerical',
    prompt: `A fictional commercial printer clustered its ${WARD.n} business clients with Ward’s method, on ${['', 'one', 'two', 'three'][WARD.p]} standardised needs. The table lists the merges in the order they were made, with how much each increased the within-cluster sum of squares.`,
    data: { table: { head: ['Merge', 'Groups left after it', 'Increase in within-cluster sum of squares'], rows: WARD.cost.map((v, m) => [String(m + 1), String(WARD.n - 1 - m), fx(v, 1)]), align: ['r', 'r', 'r'] } },
    steps: [
      {
        id: 'm05-fn-9-s1', type: 'mc',
        prompt: 'Where does the dendrogram suggest cutting the tree?',
        options: [
          `Into three groups: merge 8 would add ${fx(WARD.cost[7], 1)}, more than ${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][wardJump]} times any merge before it`,
          `Into two groups: the last merge, at ${fx(WARD.cost[8], 1)}, costs more than any other merge in the tree`,
          'Into seven groups: from merge 4 on, each merge costs more than the one before, so the groups are drifting apart',
          `Into four groups: merge 7 adds ${fx(WARD.cost[6], 1)}, the first increase in the table above 1`,
        ],
        answer: 0,
        feedback: {
          1: `In Ward’s method a merge never costs less than the one before, so the last is always the costliest; cut where the cost first jumps (${fx(WARD.cost[6], 1)} to ${fx(WARD.cost[7], 1)}), not at ${fx(WARD.cost[7], 1)} to ${fx(WARD.cost[8], 1)}.`,
          2: `Merge costs in Ward’s method don’t fall from one merge to the next, so a steady rise (${WARD.cost.slice(3, 7).map((v) => fx(v, 1)).join(', ')}) is normal. Look for the jump, at merge 8.`,
          3: 'Merge 7 costs about as much as the merges before it. The jump comes at merge 8.',
        },
        solution: `The first seven merges each add ${fx(WARD.cost[6], 1)} or less; merge 8 adds ${fx(WARD.cost[7], 1)}. Merges with small costs join groups that are already close; the jump says merge 8 would join groups that are far apart. Cut the tree just below it, leaving three groups, and check the choice with k-means and what the groups mean.`,
      },
      {
        id: 'm05-fn-9-s2', type: 'num',
        prompt: 'What is the within-cluster sum of squares of the two-group solution? Give one decimal place.',
        answer: r1(wardWcss(2)),
        check: () => 0.3 + 0.4 + 0.4 + 0.6 + 0.7 + 0.9 + 1.1 + 9.4,
        unit: '', places: 1, tol: 0.05,
        wrong: [
          { value: WARD.cost[7], say: 'That is what merge 8 adds. Ward’s method starts with every client alone (a sum of 0), so the sum after a merge is all the increases so far.' },
          { value: r1(wardWcss(3)), say: 'That is the three-group solution’s sum, before merge 8.' },
          { value: r1(wardWcss(1)), say: `That includes the last merge: it is the total sum of squares, (${WARD.n} − 1) × ${WARD.p} = ${fx(wardT, 0)} for standardised data, with one group.` },
          { value: WARD.cost[8], say: 'That is the cost of the last merge, which joins the two groups into one.' },
        ],
        solution: `Starting from ${WARD.n} groups of one (a sum of 0), each merge adds its cost, so two groups (after merge 8) have ${WARD.cost.slice(0, 8).map((v) => fx(v, 1)).join(' + ')} = ${fx(wardWcss(2), 1)}. Three groups have ${fx(wardWcss(3), 1)}; one group has the total sum of squares, (${WARD.n} − 1) × ${WARD.p} = ${fx(wardWcss(1), 1)}.`,
      },
    ],
    solution: `Ward’s method merges the two groups that add least to the within-cluster sum of squares, so the merge costs add up to it: ${fx(wardWcss(3), 1)} with three groups, ${fx(wardWcss(2), 1)} with two and the total, ${fx(wardT, 1)}, with one. The jump at merge 8 suggests three groups.`,
  },
  {
    id: 'm05-fn-10', lesson: 'profiling-segments', type: 'mc', kind: 'applied',
    prompt: `A fictional theme park segmented ${int(PARK.n)} visitors into ${WORDS[PARK.k]} segments with k-means on seven standardised needs, one of them the importance of thrill rides. Its analyst then tested whether the segments differ on that need and on two descriptors not used to form them: party type (with children, adults only or school group) and home region (${WORDS[PARK.region.levels]} regions). Which reading of the results is right?`,
    data: { table: { head: ['Test across the segments', 'Statistic', 'df', 'p', 'Cramér’s V'], rows: [
      ['ANOVA: thrill rides', `F = ${fx(PARK.F, 1)}`, `${parkDfF[0]} and ${int(parkDfF[1])}`, pFmt(parkPF), '—'],
      ['Chi-square: party type', `χ² = ${fx(PARK.party.chi, 1)}`, String(parkParty.df), pFmt(parkParty.p), fx(parkParty.v)],
      ['Chi-square: home region', `χ² = ${fx(PARK.region.chi, 1)}`, String(parkRegion.df), pFmt(parkRegion.p), fx(parkRegion.v)],
    ], align: ['l', 'r', 'r', 'r', 'r'] } },
    options: [
      `Party type is linked to segment, weakly (V = ${fx(parkParty.v)}); region shows no clear link; the thrill-rides test is circular`,
      'All three support the segments, the thrill-rides ANOVA most strongly, as its statistic is far the largest of the three',
      'Region shows no clear link, so the segments fail the accessible test and should be re-formed with region added',
      `Party type accounts for ${fx(parkParty.v * 100, 0)}% of the differences between the segments, so each segment is mostly one type of party`,
    ],
    answer: 0,
    feedback: {
      1: 'k-means chose the segments to make the needs’ means differ, so the thrill-rides F is large by construction and its p-value means nothing. Only the descriptors, which didn’t form the segments, give fair tests.',
      2: 'One descriptor without a link isn’t a failure: party type and other descriptors can still help reach the segments, and re-forming needs segments on a descriptor would change what they mean.',
      3: `Cramér’s V is not a share of anything: ${fx(parkParty.v)} is a weak association, so most segments will mix party types. Percentage the cross-tab within each segment to see how far.`,
    },
    solution: `The segments were formed on the seven needs, so a test of any of them across the segments is circular: k-means made those means differ. Tests on descriptors are fair. Party type: χ² = ${fx(PARK.party.chi, 1)} with ${parkParty.df} degrees of freedom, p ${pFmt(parkParty.p)}, and Cramér’s V = √(${fx(PARK.party.chi, 1)} ÷ (${int(PARK.n)} × ${Math.min(PARK.k, PARK.party.levels) - 1})) = ${fx(parkParty.v)}, a weak association. Home region: χ² = ${fx(PARK.region.chi, 1)} with ${parkRegion.df} degrees of freedom, p = ${fx(parkRegion.p, 2)}: no clear link. Report party type as shares within each segment, a descriptor that helps reach them, and region as not differing detectably.`,
  },
  {
    id: 'm05-fn-11', lesson: 'profiling-segments', type: 'formula', kind: 'numerical',
    prompt: 'A fictional olive-oil brand’s typing tool asks three golden questions, each rated 1–7: how much a low price, oil from a single estate and a strong flavour matter. Row 2 holds a new customer’s answers, rows 3 and 4 the study’s means and standard deviations (SD), and rows 7 to 10 each segment’s centre in standardised units. In E7, calculate the customer’s squared distance from the centre in row 7, in a formula that can be filled down to E10.',
    sheet: { cells: pfCells }, cell: 'E7', fill: 'E7:E10', view: 'A1:E10',
    formats: { B: '0.0', C: '0.0', D: '0.0', E: '0.00' }, widths: { A: 18, B: 10, C: 12, D: 13, E: 15 },
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
      { formula: '=SUMPRODUCT(((B2:D2-B3:D3)/B4:D4-B7:D7)^2)', say: 'Without $ the answers, means and standard deviations slide down as you fill: lock them with <x>$B$2:$D$2</x>, <x>$B$3:$D$3</x> and <x>$B$4:$D$4</x>.' },
      { formula: '=SQRT(SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4-B7:D7)^2))', say: 'That is the distance itself. It ranks the segments the same way, but the column asks for the squared distance the tool compares.' },
    ],
    solution: `<x>=SUMPRODUCT((($B$2:$D$2-$B$3:$D$3)/$B$4:$D$4-B7:D7)^2)</x>: her z-scores are ${pfZ.map((v) => sgn(v)).join(', ')}, and her squared distances are ${PF.segs.map((s, g) => `${s} ${fx(pfD[g])}`).join(', ')}. The tool assigns her to ${PF.segs[pfNear]}, the nearest centre, with ${PF.segs[pfSecond]} next at ${fx(pfD[pfSecond])}: clear enough, though a close call would deserve a second look.`,
  },
  {
    id: 'm05-fn-12', lesson: 'profiling-segments', type: 'multi', kind: 'applied',
    prompt: `A fictional home-furnishings retailer e-mailed a needs survey to all ${int(HOME.cards)} of its loyalty-card holders, and ${int(HOME.replies)} replied. Its “weekend decorators” segment is ${pc(HOME.share, 0)} of the respondents, and the retailer wants the segment’s share of the region’s households. Select all the statements that are true.`,
    options: [
      'Only card holders were asked, so households that don’t shop with the retailer are missing from the base.',
      `The ${int(HOME.replies)} who replied may be keener decorators than the card holders who didn’t, which could inflate the segment.`,
      'Comparing the respondents’ recorded spend with all card holders’ spend would show how far the replies lean.',
      'The segment’s profile is more usable than its size until the size has been checked against other evidence.',
      `A margin of ±${fx(homeMoe * 100, 1)} points (1.96 × √(${fx(HOME.share)} × ${fx(1 - HOME.share)} ÷ ${int(HOME.replies)})) gives the range in which the region’s share lies.`,
      `Weighting the replies to the card holders’ age and gender mix would make ${pc(HOME.share, 0)} a fair estimate of the region’s share.`,
      `With ${int(HOME.replies)} replies the sample is large enough for the ${pc(HOME.share, 0)} to hold for all the region’s households, card holders or not.`,
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'A margin of error covers sampling error from the people the survey could reach. It says nothing about the households that aren’t card holders, or about who chose to reply.',
      5: 'Weighting by age and gender corrects the mix of the card holders who replied, but it doesn’t add the households outside the list or fix self-selection within each age and gender group.',
      6: 'A large sample from the wrong frame is still the wrong frame: more replies narrow the margin of error, not the gap between card holders and the region.',
    },
    solution: `The frame is the card list, not the region, so non-customers are missing (coverage); and ${pc(HOME.replies / HOME.cards, 0)} replied, possibly the keenest (non-response). The retailer can test the second with its own records: compare respondents’ spend with all card holders’. A margin of error (±${fx(homeMoe * 100, 1)} points) covers neither problem. Use what the segment wants now, and treat its size as a share of responding card holders until it is checked against other evidence.`,
  },

  // ================================================================ Module 3: targeting
  {
    id: 'm05-fn-13', lesson: 'evaluating-segments', type: 'steps', kind: 'applied',
    prompt: 'A fictional car-rental firm scores two segments, business travellers (column C) and holidaymakers (column D), on five factors (0–100). Column B holds its weights and row 7 each segment’s weighted sum (Σ weight × score). Room from rivals comes from a perceptual map’s distances.',
    steps: [
      {
        id: 'm05-fn-13-s1', type: 'formula',
        prompt: 'In E2, calculate how much the weight in row 2 would have to change, with every other weight unchanged, for the two segments to draw level (negative for a fall), in a formula that can be filled down to E6.',
        sheet: { cells: carCells }, cell: 'E2', fill: 'E2:E6', view: 'A1:E7',
        formats: { C7: '#,##0', D7: '#,##0', E: '0.00' }, widths: { A: 15, B: 7, C: 10, D: 14, E: 13 },
        answer: '=($C$7-$D$7)/(D2-C2)',
        alt: ['=(C$7-D$7)/(D2-C2)', '=($D$7-$C$7)/(C2-D2)', '=-($C$7-$D$7)/(C2-D2)'],
        wrong: [
          { formula: '=($C$7-$D$7)/(C2-D2)', say: 'The sign is reversed. Raising a weight helps the segment that scores higher on that factor, so divide the leader’s advantage by the challenger’s advantage on the factor: <x>D2-C2</x>.' },
          { formula: '=(C7-D7)/(D2-C2)', say: 'Without $ the weighted sums slide down as you fill, to empty cells. Lock them: <x>$C$7</x> and <x>$D$7</x>.' },
          { formula: '=($C$7-$D$7)/SUM($B$2:$B$6)/(D2-C2)', say: 'That uses the gap in the weighted scores out of 100. One point of weight changes the weighted sums, not the scores, by the difference in the two scores: use the gap in the sums.' },
          { formula: '=($C$7-$D$7)/D2', say: 'Each point of weight changes the gap by the difference between the two segments’ scores on the factor, not by one segment’s score.' },
        ],
        solution: `<x>=($C$7-$D$7)/(D2-C2)</x>: the gap in weighted sums is ${int(carGap)}, so the changes are ${CAR.factors.map((f, k) => `${f.toLowerCase()} ${sgn(carDelta[k])}`).join(', ')}.`,
      },
      {
        id: 'm05-fn-13-s2', type: 'mc',
        prompt: 'Which judgement does the choice between the two segments depend on most?',
        options: [
          `The weight on room: a rise of about ${fx(carDelta[3], 1)}, to ${fx(CAR.w[3] + carDelta[3], 1)}, would tie them, so check the map behind room before deciding`,
          'The weight on growth: holidaymakers lead on growth, so growth is the factor that decides the order',
          'The weight on fit: fit has the largest gap between the two segments, so fit is what decides the result',
          `The weight on size: business travellers lead on it by ${CAR.A[0] - CAR.B[0]} points, so size is what settles the final order`,
        ],
        answer: 0,
        feedback: {
          1: `Holidaymakers lead on growth by only ${CAR.B[2] - CAR.A[2]} points, so its weight would have to rise by ${fx(carDelta[2])} to close the gap: far more than room needs.`,
          2: `Fit favours business travellers, so only lowering its weight could help holidaymakers, and it would have to fall from ${CAR.w[4]} to ${fx(CAR.w[4] + carDelta[4])}.`,
          3: `Size favours the leader, so raising its weight only widens the lead; to tie, it would have to fall by ${fx(-carDelta[0])}, below zero. Holidaymakers lead on room by ${CAR.B[3] - CAR.A[3]} points, which is why room’s weight matters most.`,
        },
        solution: `Room needs a rise of only ${fx(carDelta[3])} (from ${CAR.w[3]} to ${fx(CAR.w[3] + carDelta[3])}); growth would need ${fx(carDelta[2])}; fit would have to fall to ${fx(CAR.w[4] + carDelta[4])}; size and spend per head would have to go below zero. The choice turns on how much room from rivals matters, and room is a rough guide: it rests on a map of average ratings and ignores crowding by second-nearest rivals. Check it before relying on the lead.`,
      },
    ],
    solution: `Business travellers lead by ${int(carGap)} points in the weighted sums. The threshold weight for each factor is the gap divided by the challenger’s advantage on it: ${CAR.factors.map((f, k) => `${f.toLowerCase()} ${sgn(carDelta[k])}`).join(', ')}. Only room is fragile; report the lead together with that threshold, and test the map behind room before deciding.`,
  },
  {
    id: 'm05-fn-14', lesson: 'evaluating-segments', type: 'num', kind: 'applied',
    prompt: `Suppose a new craft coffee brand (fictional) enters Harbour City, and the next survey places it ${fx(NEW)} from the Craft and local ideal on Lantern’s map, and no nearer any other segment’s ideal than that segment’s nearest rival today. Every other score and weight stays as it is. The table gives each segment’s scores (0–100) on four factors and the distance from its ideal to its nearest rival today. Ana scores room from the nearest rival, like size, spend per head and growth, as a ratio to the best segment; fit is centred on 50; her weights are ${W_ANA.join(', ')} for size, spend per head, growth, room and fit. What would Craft and local’s weighted score become? Give one decimal place.`,
    data: { table: { head: ['Segment', 'Size', 'Spend per head', 'Growth', 'Fit', 'Nearest-rival distance'], rows: ORDER.map((g) => [NAMES[g], fx(ratio(share)[g], 1), fx(ratio(head)[g], 1), fx(ratio(growth)[g], 1), fx(fitS[g], 1), fx(room[g])]), align: ['l', 'r', 'r', 'r', 'r', 'r'] } },
    answer: r1(T1[CL]),
    check: () => { const best = Math.max(...room.map((d, g) => (g === CL ? 0.70 : d))); return (4 * ratio(share)[CL] + 4 * ratio(head)[CL] + 2 * ratio(growth)[CL] + 2 * (100 * 0.70) / best + 4 * fitS[CL]) / 16; },
    unit: '', places: 1, tol: 0.06,
    wrong: [
      { value: r1(T0[CL]), say: 'That is today’s score, with Craft and local’s room at 100. With a rival closer, Craft and local no longer has the most room.' },
      { value: r1(clWith((100 * NEW) / room[CL])), say: `That scores the new distance against Craft and local’s old one (${fx(room[CL])}). A ratio to the best divides by the largest distance now on the table: ${NAMES[bestRoomSeg]}’s ${fx(bestRoomNew)}.` },
      { value: r1(T1[EX]), say: `That is Explorers’ new score. The best room is now ${NAMES[bestRoomSeg]}’s, which raises every other segment’s room score, Explorers’ included.` },
      { value: r1(clWith((100 * Math.min(...roomNew)) / NEW)), say: 'More distance from the nearest rival means more room, so the ratio is each segment’s distance over the largest, not the smallest distance over each.' },
    ],
    solution: `The largest distance is now ${NAMES[bestRoomSeg]}’s ${fx(bestRoomNew)}, so Craft and local’s room score is 100 × ${fx(NEW)} ÷ ${fx(bestRoomNew)} = ${fx(roomScoreNew[CL], 1)}. Its weighted score is (4 × ${fx(clRest[0], 1)} + 4 × ${fx(clRest[1], 1)} + 2 × ${fx(clRest[2], 1)} + 2 × ${fx(roomScoreNew[CL], 1)} + 4 × ${fx(clRest[3], 1)}) ÷ 16 = ${fx(T1[CL], 1)}, down from ${fx(T0[CL], 1)}. Every other segment’s room score rises (Explorers’ to ${fx(roomScoreNew[EX], 1)}), so Explorers move to ${fx(T1[EX], 1)}. Craft and local still lead; the newcomer would have to sit within about ${fx(tieD)} of their ideal for Explorers to draw level. Room is a rough guide, built from average ratings on a two-dimensional map, so treat a rival’s arrival as a reason to rescore and to watch the next survey, not as a precise forecast.`,
  },
  {
    id: 'm05-fn-15', lesson: 'targeting-strategies', type: 'steps', kind: 'applied',
    prompt: 'Ana wonders whether Lantern Cold Brew, planned as one craft can for Craft and local and Explorers, could serve the Mindful segment too.',
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
        prompt: `For comparison, Craft and local’s centre is ${fx(dCLEX)} from Explorers’ and ${fx(dCLOG)} from On the go’s; the two segments’ indexes are in the table. Lantern is a small firm launching its first canned product, and ${pc(AWARE)} of the study’s respondents know it. Should the launch also serve Mindful, and how?`,
        data: { table: { head: ['Need', 'Craft and local', 'Mindful'], rows: NEEDS.map((n, j) => [n.label, String(S.index[CL][j]), String(S.index[MI][j])]), align: ['l', 'r', 'r'] } },
        options: [
          'Not at launch: keep the one craft can for its two neighbouring segments, and leave a low-sugar Mindful can for later',
          'Yes, with a separate low-sugar can for Mindful launched beside the craft can, both sold under the Lantern name',
          'Yes, with the same craft can for Mindful too, since after Explorers it is the segment nearest to Craft and local',
          'Yes, with offers tailored to each Mindful drinker from what they have bought in Lantern’s cafés and online shop',
        ],
        answer: 0,
        feedback: {
          1: 'Mindful does need its own product, but a separate variant at launch is differentiated marketing: two products for a small firm with one new can and low awareness. The five considerations (resources, the introduction stage) favour one offer first.',
          2: `Second-nearest isn’t near enough: Mindful sits further from Craft and local (${fx(dMICL)}) than Explorers do (${fx(dCLEX)}), and differs where it matters: health, low sugar and calories (${S.index[MI][5]} against ${S.index[CL][5]}), and novelty (${S.index[MI][7]} against ${S.index[CL][7]}). A craft can of new single origins wouldn’t fit it.`,
          3: `Individual marketing needs customers whose purchases Lantern already records, and only ${MI_BOUGHT} of the study’s ${S.sizes[MI].n} Mindful drinkers bought Lantern in the past year; it doesn’t create the low-sugar product they want.`,
        },
        solution: 'Mindful shares Craft and local’s care for sustainability and local businesses but wants low sugar far more and novelty less, so the craft can won’t serve it. A separate variant would be differentiated marketing, which a small firm launching its first can, with low awareness, can rarely afford at once. Keep the launch’s one craft offer for Craft and local and Explorers, and revisit a low-sugar can for Mindful once Cold Brew is established.',
      },
    ],
    solution: `The centres are ${fx(dMICL)} apart: further than Explorers (${fx(dCLEX)}), much nearer than On the go (${fx(dCLOG)}). Mindful’s nearest segment is ${NAMES[miNearest]}, but its needs differ on health and novelty, so it would need its own product; at launch, one offer for the two neighbouring craft segments fits Lantern’s resources and stage.`,
  },
  {
    id: 'm05-fn-16', lesson: 'targeting-strategies', type: 'multi', kind: 'applied',
    prompt: `A fictional regional rail operator surveyed ${int(RAIL.total)} passengers and found a “scenic day-trippers” segment of ${RAIL.n} (${pc(RAIL.n / RAIL.total, 0)}). Its needs indexes against the average passenger are scenic routes ${RAIL.scenic}, a comfortable seat ${RAIL.seat} and low fares ${RAIL.fares}, and ${pc(RAIL.age / RAIL.n, 0)} of its members are aged 25 to 44. Another segment, “weekend families” (${RAIL.fam.n}), also travels mostly at weekends but indexes ${RAIL.fam.fares} on low fares and ${RAIL.fam.scenic} on scenic routes. The marketing team is planning the day-trippers’ persona card; no passengers have been interviewed yet. Select all the steps the team should take.`,
    options: [
      `Open the card with the needs: scenic routes (${RAIL.scenic}) and a comfortable seat (${RAIL.seat}) above average, low fares (${RAIL.fares}) below.`,
      'Leave the quote off until a member of the segment has been interviewed, and then quote their own words.',
      'Put the survey’s date on the card, and rebuild the card from the new profile when the segmentation is re-run.',
      'Make one card for the day-trippers and the weekend families together, since both segments travel mostly at weekends.',
      'Write a quote in the persona’s voice that sums up what the data say, since no passenger has been interviewed yet.',
      `Open the card with its age line, “${pc(RAIL.age / RAIL.n, 0)} aged 25 to 44”, since age is the line the agency buys its media against.`,
    ],
    answer: [0, 1, 2],
    feedback: {
      3: `The two segments share a travel day, not their needs: weekend families index ${RAIL.fam.fares} on low fares, which day-trippers rate below average (${RAIL.fares}). One card would describe neither segment.`,
      4: 'A quote written by the team is invented, however well it sums up the data. A quote on a persona should be a real member’s words, from research.',
      5: `Shares such as ${pc(RAIL.age / RAIL.n, 0)} belong on the card, but after the needs: in a needs-based segmentation the needs define the segment, and age helps reach it.`,
    },
    solution: 'A persona card stands for one segment, leads with the needs that define it, says where any quote comes from, and is dated so that it can be rebuilt when the segmentation is refreshed. Merging two segments that share a habit but want different things, writing a quote, or leading with the line the media plan wants would each make the card less true to the segment it is meant to keep in view.',
  },
  {
    id: 'm05-fn-17', lesson: 'targeting-strategies', type: 'num', kind: 'numerical',
    prompt: `Suppose (fictional) the supermarket test has worked and Cold Brew is stocked across Harbour City’s supermarkets; Ana then lists it in the city’s convenience stores to reach On the go drinkers, and expects them to sell ${int(CANS)} cans a year. From M02’s figures: at $${fx(PRICE)} a can, convenience stores and their distributors keep ${pc(ch('convenience').margin, 0)} of the price and supermarkets and theirs ${pc(ch('supermarket').margin, 0)}; each can costs Lantern $${fx(COGS)} to make and deliver; and the listing costs $${int(LIST)} a year. If ${pc(CANNIB, 0)} of the convenience-store cans would otherwise have been bought in a supermarket, how much would the listing add to Lantern’s contribution a year? Give a whole number of dollars.`,
    answer: Math.round(convNet),
    check: () => 9000 * ((3.49 * 0.6 - 0.74) - 0.3 * (3.49 * 0.68 - 0.74)) - 4000,
    unit: '$', places: 0, tol: 40,
    wrong: [
      { value: Math.round(CANS * mConv - LIST), say: `That ignores cannibalisation. ${pc(CANNIB, 0)} of the convenience-store cans replace supermarket cans that would have earned Lantern $${fx(mSup)} each.` },
      { value: Math.round(CANS * (mConv - CANNIB * mSup)), say: `That is before the $${int(LIST)} listing fee. Subtract it.` },
      { value: Math.round(CANS * (1 - CANNIB) * mConv - LIST), say: `That treats a cannibalised can as adding nothing. It earns $${fx(mConv)} but replaces a supermarket can that earned $${fx(mSup)}, so each one loses $${fx(mSup - mConv)}.` },
      { value: Math.round(convAdd(PRICE * (1 - ch('convenience').margin), PRICE * (1 - ch('supermarket').margin))), say: `That uses what Lantern receives a can before its $${fx(COGS)} cost. Contribution is the price after the trade’s share, less the cost of the can.` },
    ],
    solution: `A convenience-store can would earn ${fx(PRICE)} × ${fx(1 - ch('convenience').margin)} − ${fx(COGS)} = $${fx(mConv, 3)}, and a supermarket can ${fx(PRICE)} × ${fx(1 - ch('supermarket').margin)} − ${fx(COGS)} = $${fx(mSup, 3)}. Net of cannibalisation each convenience-store can adds ${fx(mConv, 3)} − ${CANNIB} × ${fx(mSup, 3)} = $${fx(mConv - CANNIB * mSup, 3)}, so ${int(CANS)} cans add ${usd(CANS * (mConv - CANNIB * mSup))} less the $${int(LIST)} listing: about ${usd(convNet)} a year (${usd(convCents)} with both contributions rounded to the cent). That is a small sum, and ${int(CANS)} cans are about ${pc(CANS / convChannel, 1)} of the ${fx(convChannel / 1e6, 2)} million cans M02 puts through the city’s convenience stores. The money isn’t what decides it: On the go wants convenience, Lantern’s weak point, and energy, where Ana rates Lantern only average; Corner Cup sits close to its ideal; and a second message would pull against Lantern’s craft position.`,
  },

  // ================================================================ Module 4: positioning
  {
    id: 'm05-fn-18', lesson: 'perceptual-maps', type: 'mc', kind: 'applied',
    prompt: `Suppose (fictional) Corner Cup closes its cafés and leaves the market, and the other brands stay where they are on Lantern’s map. The table gives the distance from each segment’s ideal point to each brand. Which segment would then be least closely served by its nearest brand, and would that be an opening for Lantern?`,
    data: { table: { head: ['Brand', ...ORDER.map((g) => NAMES[g])], rows: BRANDS.map((b, k) => [b, ...ORDER.map((g) => fx(MD[g][k]))]), align: ['l', 'r', 'r', 'r', 'r', 'r'] } },
    options: [
      `${NAMES[leastServed.g]}, ${fx(leastServed.d)} from ${BRANDS[leastServed.b]}; not an opening: Lantern is ${fx(MD[leastServed.g][0])} away, far behind ${BRANDS[leastServed.b]} and ${BRANDS[secondFor(leastServed.g).k]}`,
      `${NAMES[VR]}, ${fx(nearestLeft[VR].d)} from ${BRANDS[nearestLeft[VR].b]}; not an opening for Lantern, which fits that segment the worst of all five`,
      `Explorers, ${fx(nearestLeft[EX].d)} from ${BRANDS[nearestLeft[EX].b]}; an opening for Lantern, which would become the Explorers’ second-nearest brand`,
      `Craft and local, ${fx(MD[CL][BRANDS.indexOf('Arcadia Coffee')])} from Arcadia Coffee; an opening that Lantern should claim before Arcadia moves closer to them`,
    ],
    answer: 0,
    feedback: {
      1: `That is today’s answer. Without Corner Cup, ${NAMES[leastServed.g]}’s nearest brand is ${BRANDS[leastServed.b]} at ${fx(leastServed.d)}, further than ${NAMES[VR]}’s ${fx(nearestLeft[VR].d)}.`,
      2: `Explorers lose nothing when Corner Cup leaves: ${BRANDS[nearestLeft[EX].b]} is still ${fx(nearestLeft[EX].d)} from them, closer than ${NAMES[leastServed.g]}’s nearest brand.`,
      3: `Craft and local’s nearest brand is Lantern itself, ${fx(MD[CL][0])} away; Arcadia is only its nearest rival.`,
    },
    solution: `Without Corner Cup, each segment’s nearest brand is: ${ORDER.map((g) => `${NAMES[g]} ${BRANDS[nearestLeft[g].b]} (${fx(nearestLeft[g].d)})`).join(', ')}. ${NAMES[leastServed.g]}, whose nearest brand today is Corner Cup (${fx(nearestToday[leastServed.g].d)}), would be served least closely. A thinly served space is an opening only for a firm that can credibly fill it: Lantern is ${fx(MD[leastServed.g][0])} from that ideal, while ${BRANDS[leastServed.b]} and ${BRANDS[secondFor(leastServed.g).k]} sit at ${fx(leastServed.d)} and ${fx(secondFor(leastServed.g).d)}, and the segment wants convenience and energy, where Lantern is weak or only average. For Lantern the space is a reason to leave the segment to others.`,
  },
  {
    id: 'm05-fn-19', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: `On a fictional perceptual map of running shoes, three segments’ ideal points are ${RUN.segs.map((s, g) => `${s.toLowerCase()} (${fx(RUN.size[g] * 100, 0)}% of buyers) at (${RUN.ideal[g].map(m1).join(', ')})`).join(', ')}. A brand plans to position itself at the ideal point of the average buyer, which lies at the size-weighted average of the three segments’ ideal points. How far is that point from the nearest segment’s ideal? Give two decimal places.`,
    answer: r2(runD[runNear]),
    check: () => Math.hypot(0.4 * 2 + 0.35 * -1.5 + 0.25 * 0.5 - 2.0, 0.4 * 1 + 0.35 * 1.5 + 0.25 * -2 - 1.0),
    unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(dist(runPlain, RUN.ideal[0])), say: 'That averages the three ideal points as if the segments were the same size. Weight each by its share of buyers.' },
      { value: r2(Math.hypot(...runAll)), say: 'That is the average ideal’s distance from the centre of the map. The question asks for its distance from the nearest segment’s ideal.' },
      { value: r2(runD[1]), say: `That is the distance to the ${RUN.segs[1].toLowerCase()}’ ideal. The ${RUN.segs[runNear].toLowerCase()}’ ideal is nearer.` },
      { value: r2(runD[runNear] ** 2), say: 'That is the squared distance. Take the square root.' },
    ],
    solution: `Average ideal: (${RUN.size.map((s, g) => `${s} × ${m1(RUN.ideal[g][0])}`).join(' + ')}, ${RUN.size.map((s, g) => `${s} × ${m1(RUN.ideal[g][1])}`).join(' + ')}) = (${fx(runAll[0], 3)}, ${fx(runAll[1], 3)}). Distances: ${RUN.segs.map((s, g) => `${s.toLowerCase()} ${fx(runD[g])}`).join(', ')}. The nearest, the ${RUN.segs[runNear].toLowerCase()}, are ${fx(runD[runNear])} away: a brand placed at the average buyer’s ideal sits far from every segment’s. The average of three groups’ ideals is an ideal none of the groups holds, so a positioning is chosen for a segment, not for the average buyer.`,
  },
  {
    id: 'm05-fn-20', lesson: 'positioning-statements', type: 'classify', kind: 'conceptual',
    prompt: 'Keller, Sternthal and Tybout describe three ways to handle two benefits that customers think can’t go together. Which does each fictional brand use?',
    items: [
      'A low-calorie ice lolly spends two years convincing buyers it tastes as good as full-sugar lollies, and only then starts to talk about calories.',
      'A discount luggage maker, seen as cheap, has a well-known designer create its new range of suitcases.',
      'A language app argues that the easiest lessons are the most effective, because learners who enjoy them keep practising every day.',
      'An e-bike maker first builds a name for the most powerful e-bikes, then adds light, easy models sold on that reputation.',
      'A watch brand known for low prices sponsors a famous round-the-world sailing race.',
      'A detergent argues that its gentle formula cleans better, because harsh detergents leave a residue that attracts dirt.',
    ],
    categories: ['Sequencing: one benefit first, the other later', 'Leveraging an unrelated attribute or endorser', 'Reframing the two as complements'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      0: 'Taste first, calories later: one benefit is established before the second is added, as Miller Lite did with “great taste” and then “less filling”.',
      1: 'The designer lends credibility to style that a cheap brand couldn’t claim on its own: leveraging an endorser.',
      2: 'Easy and effective are presented as going together, not as a trade-off: reframing them as complements.',
      3: 'Power first, ease later, on the strength of the first reputation: sequencing.',
      4: 'An association with precision and endurance borrowed from the race, to counter doubts that a cheap watch is well made: leveraging.',
      5: 'Gentleness is argued to be the cause of cleaning power: reframing the two as complements.',
    },
    solution: 'Sequencing establishes one benefit and adds the other later (the lolly, the e-bike). Leveraging borrows credibility from an unrelated attribute or endorser (the designer, the sailing race). Reframing argues that the two benefits go together (the app, the detergent). Each answers the customer’s doubt that owning one benefit means lacking the other.',
  },
  {
    id: 'm05-fn-21', lesson: 'positioning-statements', type: 'fill', kind: 'applied',
    prompt: 'Brindlewick Walks (fictional) is a dog-walking service. Its owner’s notes: most clients work long days in offices and worry about their dogs while they are out; the two rival walking services charge about the same and also use insured, vetted walkers; only Brindlewick’s walkers carry a tracked phone that sends the owner a live map and photos of every walk. Complete its positioning statement.',
    text: 'For [[0]], Brindlewick Walks is the [[1]] that [[2]], because [[3]].',
    blanks: [
      { options: ['anyone in the city who owns a dog and needs it walked', 'owners who are out all day and want peace of mind about their dog', 'people who love their dogs and want the very best care for them every day', 'busy professionals who want to spend less on care for their dog'], answer: 1 },
      { options: ['dog-walking service', 'pet-care brand', 'only GPS-tracked walking service in the city', 'app for dog owners'], answer: 0 },
      { options: ['uses insured, vetted walkers', 'charges about what other walkers charge', 'lets you see every walk as it happens', 'puts the welfare of every dog first'], answer: 2 },
      { options: ['it is the fastest-growing walking service in the city', 'its customers say they trust it more than any rival walking service', 'its walkers are insured and vetted', 'each walk is tracked live and photographed for the owner'], answer: 3 },
    ],
    solution: '“For owners who are out all day and want peace of mind about their dog, Brindlewick Walks is the dog-walking service that lets you see every walk as it happens, because each walk is tracked live and photographed for the owner.” The target is the group the notes describe, not all owners; the frame is what clients would use instead, the rival walking services; insured, vetted walkers and similar prices are points of parity, which Brindlewick must match rather than claim; the difference is the benefit only it offers; and the reason to believe is the checkable fact that makes it credible. Growth and trust assert rather than prove, and vetted walkers are parity, not proof of the difference.',
  },
  {
    id: 'm05-fn-22', lesson: 'differentiation-and-repositioning', type: 'mc', kind: 'applied',
    prompt: `On a fictional perceptual map of five tyre-fitting chains, built from six attributes, the two dimensions carry ${pc(OPT.share, 0)} of the variance, and chains P and Q sit almost on top of each other. The arrow for “branches nearby” is short, with loadings of ${fx(OPT.l1)} and ${fx(OPT.l2)}. Customers rate P ${fx(OPT.P, 1)} and Q ${fx(OPT.Q, 1)} on branches nearby, and for P’s target segment, small-business van drivers, branches nearby has a needs index of ${OPT.index}. Seeing P and Q together on the map, P’s team plans to lead instead with “the easiest booking app”, rated ${fx(OPT.appP, 1)} for P and ${fx(OPT.appQ, 1)} for Q. What should P do?`,
    options: [
      'Lead with branches nearby: the map hides that difference, which matters to the target, is large and costly to copy',
      'Lead with the app: P and Q look alike on the map, so P needs a newer feature to set itself clearly apart from Q',
      'Drop branches nearby: its short arrow shows that the chains’ customers care little about where their tyre fitter is',
      'Lead with both: each extra difference a positioning claims gives the target customers one more reason to choose P',
    ],
    answer: 0,
    feedback: {
      1: `The app fails distinctive: ${fx(OPT.appP, 1)} against ${fx(OPT.appQ, 1)} is no lead at all, and any rival could copy an app.`,
      2: `An arrow’s length shows how well the map represents an attribute, not how much customers care about it. The target’s index of ${OPT.index} says it matters a lot.`,
      3: 'A positioning leads with the difference that best passes the criteria; piling on claims blurs it, and the app adds nothing distinctive.',
    },
    solution: `Branches nearby has a communality of ${fx(OPT.l1)}² + ${fx(OPT.l2)}² = ${fx(optH2, 4)}: the map shows only about ${pc(optH2, 0)} of how the chains differ on it, so P and Q look alike on the map while the means show a ${fx(OPT.P - OPT.Q, 1)}-point gap. Against Kotler and Armstrong’s criteria, branches nearby is important (index ${OPT.index}), distinctive (${fx(OPT.P, 1)} against ${fx(OPT.Q, 1)}), communicable, and pre-emptive (a branch network is slow and costly to copy), and P already has the branches. The app fails distinctive and pre-emptive. Check the table of means before concluding that two brands close on a map have nothing to tell them apart.`,
  },
  {
    id: 'm05-fn-23', lesson: 'differentiation-and-repositioning', type: 'steps', kind: 'numerical',
    prompt: 'A fictional aquarium plans more family activities. Row 2 holds its position on its market’s perceptual map; each point on its “family activities” rating moves it by the amounts in row 3, with the axes held fixed; and B4 holds the rise in that rating it plans. Rows 7 to 9 give each segment’s ideal point and how far that ideal is from the segment’s nearest rival today.',
    steps: [
      {
        id: 'm05-fn-23-s1', type: 'formula',
        prompt: 'In E7, calculate how much further from the ideal in row 7 than the segment’s nearest rival the aquarium would be after the planned rise (negative if it would be nearer), in a formula that can be filled down to E9.',
        sheet: { cells: aqCells, vary: { B4: [1.2, 2.8] } }, cell: 'E7', fill: 'E7:E9', view: 'A1:E9',
        formats: { B: '0.00', C: '0.00', D: '0.00', E: '0.00' }, widths: { A: 19, B: 11, C: 11, D: 12, E: 14 },
        answer: '=SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)-D7',
        alt: [
          '=SQRT((B7-$B$2-$B$4*$B$3)^2+(C7-$C$2-$B$4*$C$3)^2)-D7',
          '=((($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2))^0.5-D7',
          '=-(D7-SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2))',
        ],
        wrong: [
          { formula: '=SQRT(($B$2-B7)^2+($C$2-C7)^2)-D7', say: 'That compares where the aquarium is today. Move it first: add <x>B4</x> times the move per point to each coordinate.' },
          { formula: '=SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)', say: 'That is the distance after the move. Subtract the nearest rival’s distance in column D to see whether the aquarium would beat it.' },
          { formula: '=D7-SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)', say: 'The sign is reversed: the column should be negative when the aquarium would be nearer than the rival.' },
          { formula: '=SQRT((B2+B4*B3-B7)^2+(C2+B4*C3-C7)^2)-D7', say: 'Without $ the aquarium’s position and the planned move slide down as you fill. Lock them: <x>$B$2</x>, <x>$B$3</x>, <x>$B$4</x>, <x>$C$2</x> and <x>$C$3</x>.' },
        ],
        solution: `<x>=SQRT(($B$2+$B$4*$B$3-B7)^2+($C$2+$B$4*$C$3-C7)^2)-D7</x>. The planned rise of ${fx(AQ.rise, 1)} moves the aquarium from (${AQ.at.map((v) => m1(v)).join(', ')}) to (${aqNew.map((v) => m1(v)).join(', ')}). Against each nearest rival: ${AQ.segs.map((s, g) => `${s.toLowerCase()} ${sgn(aqGap1[g])} (today ${sgn(aqGap0[g])})`).join(', ')}.`,
      },
      {
        id: 'm05-fn-23-s2', type: 'mc',
        prompt: 'What would the planned rise do to the aquarium’s place in each segment’s choice?',
        options: [
          'Make it the families’ nearest option, but put the art gallery nearer than it to the couples',
          'Make it the nearest option for families and couples, since the move brings it closer to both',
          'Make it the school groups’ nearest option, ahead of the city farm, and keep the couples',
          'Leave the families’ choice as it is, since the science centre stays nearer to them',
        ],
        answer: 0,
        feedback: {
          1: `The move takes the aquarium away from the couples’ ideal, from ${fx(aqD0[1])} to ${fx(aqD1[1])}, and the art gallery, at ${fx(AQ.rival[1])}, would then be nearer to them.`,
          2: `The school groups’ ideal stays far away: ${fx(aqD1[2])} after the move, against the city farm’s ${fx(AQ.rival[2])}.`,
          3: `After the move the aquarium would be ${fx(aqD1[0])} from the families’ ideal, nearer than the science centre’s ${fx(AQ.rival[0])}.`,
        },
        solution: `Today the aquarium is the couples’ nearest option (${sgn(aqGap0[1])} against the art gallery). After the planned rise it would beat the science centre for families (${sgn(aqGap1[0])}) but fall behind the art gallery for couples (${sgn(aqGap1[1])}), and stay far behind the city farm for school groups. A move towards one segment is a move away from another: the plan should count what the couples are worth, and ratings would move only if visitors experienced the new activities.`,
      },
    ],
    solution: 'Checking a planned move against each segment’s nearest rival shows who gains and who loses. Here the aquarium would win the families from the science centre but lose the couples to the art gallery: a trade-off to price before committing, and a change customers must experience before any survey would show it.',
  },
  {
    id: 'm05-fn-24', lesson: 'differentiation-and-repositioning', type: 'mc', kind: 'applied',
    prompt: 'A fictional craft gin distillery is known for small-batch gins sold in its tasting room and in specialist shops. It is determined to win the large “party” segment, who buy litre bottles of cheap vodka in supermarkets and whose ideal point sits on the far side of the market’s perceptual map from the distillery. Which plan puts least of what it already has at risk?',
    options: [
      'Launch a vodka under a new name for the party buyers, sold in supermarkets, and leave the distillery’s brand as it is',
      'Reposition the distillery’s main brand towards cheap litre bottles, since the party segment is much larger than its current one',
      'Cut the price of its gins to vodka levels in supermarkets, which moves the distillery towards the party ideal on the map',
      'Claim in its advertising that its craft gins are ideal for parties, which repositions the brand without changing the product',
    ],
    answer: 0,
    feedback: {
      1: 'Moving the main brand that far risks the customers who chose it for what it is, and a craft distillery claiming cheap party spirits would struggle to be believed.',
      2: 'A price cut without lower costs erodes the margin, and it tells today’s drinkers the gins are worth less, while the gins still aren’t what party buyers want.',
      3: 'A claim the product doesn’t support is overpromising; ratings move only when customers experience something different.',
    },
    solution: 'When a target sits far from a brand’s position, moving the main brand risks the customers who chose it, and the move may not be believed. A separately named product (a sub-brand or a new brand) can be positioned, priced and sold for the new segment while the parent keeps its position: differentiated marketing with separate brands. Leaving the segment to rivals is the other low-risk choice, if the distillery is less determined than this one.',
  },
];
