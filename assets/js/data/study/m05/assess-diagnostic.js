// assess-diagnostic.js — M05 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what M01 (segmentation, targeting and positioning in outline, value propositions), B04 (chi-square, ANOVA)
// or M04 (surveys) already teach, so that a student who knows only those courses misses module 1’s items and one who
// already has a module’s methods gets its items right.
// Module 1: the smallest segment a tailored offer can pay for when it changes the margin as well as the purchase rate
// (the gain from segmenting turned round); the ecological fallacy in a pattern across districts; the heaviest buyers’
// share of spending, not of volume, from band averages.
// Module 2: k-means++’s rule for choosing the next starting centre (probability proportional to the squared distance);
// the number of segments from the elbow, the silhouette, a split-half check and what the segments mean; spend per head
// from a segment’s share of spend and share of respondents.
// Module 3: the smallest single weight change that ties two segments (the threshold weight, for every factor); a fit
// score from segment centres and a firm’s strengths (needs fit, then centred on 50 and scaled by the largest fit in
// either direction); the cannibalisation rate implied by a new offer’s results.
// Module 4: a map’s share of the variance when only two eigenvalues are given (they add up to the number of standardised
// attributes); a missing point of parity; how far a rating change moves a brand on fixed axes, from the loading, the
// eigenvalue and the attribute’s spread across brands.
// Modules 1–3 use only mc and num items, which score 0 or 1, so that the route below can’t be passed on part marks;
// module 4 is not used for routing. New questions on businesses used nowhere else on the site (all fictional), not copies
// of lesson exercises or module tests, and nothing from the project’s scenario or data. No hints; solutions are shown on
// review. Every num item’s `check` recomputes its answer, and every figure a prompt states is computed below from its
// inputs.

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 2) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- module 1
// Brockholt Climbing Centre (fictional): a family membership beside the adult one, for families with children only
const BRK = { b1: 0.05, m1: 140, b2: 0.09, m2: 110, F: 6600 };
const brkPer = BRK.b2 * BRK.m2 - BRK.b1 * BRK.m1;                      // extra contribution a family in the town brings
const brkN = Math.ceil(BRK.F / brkPer - 1e-9);
const brkAt = (per) => Math.ceil(BRK.F / per - 1e-9);
// a bakery-café chain's loyalty bands (fictional): share of members, items a week, average spend an item
const BAKE = { bands: ['Light', 'Medium', 'Heavy'], share: [0.55, 0.30, 0.15], items: [2, 5, 13], price: [4.40, 3.20, 1.90] };
const bakeSpend = BAKE.share.map((s, i) => s * BAKE.items[i] * BAKE.price[i]);
const bakeItems = BAKE.share.map((s, i) => s * BAKE.items[i]);
const bakeHeavy = bakeSpend[2] / sum(bakeSpend);
const bakeHeavyItems = bakeItems[2] / sum(bakeItems);
const bakePerMember = BAKE.items.map((k, i) => k * BAKE.price[i]);
const bakeUnweighted = bakePerMember[2] / sum(bakePerMember);

// ---------------------------------------------------------------- module 2
// k-means++ on a toy example: the other five respondents' distances from the first centre
const KPP = [0.5, 1.0, 1.5, 2.0, 3.0];
const kppSq = KPP.map((d) => d * d);
const kppP = kppSq[4] / sum(kppSq);
// a travel insurer (fictional): 1,500 customers, six standardised needs
const INS = { n: 1500, p: 6, ks: [2, 3, 4, 5, 6, 7], wcss: [6100, 5050, 4180, 3980, 3820, 3690], sil: [0.29, 0.24, 0.26, 0.21, 0.20, 0.18], ari: [0.96, 0.74, 0.92, 0.61, 0.55, 0.49] };
const insT = (INS.n - 1) * INS.p;
const insFall = INS.wcss.map((w, i) => (i ? INS.wcss[i - 1] : insT) - w);
// a gym chain's 'early birds' (fictional): spend per head from two shares
const GYM = { share: 0.18, spendShare: 0.27, avg: 40 };
const gymHead = GYM.avg * (GYM.spendShare / GYM.share);

// ---------------------------------------------------------------- module 3
// a broadband provider (fictional): small offices (A) against home workers (B)
const BB = { factors: ['Size', 'Spend per head', 'Growth', 'Room from the nearest rival', 'Fit with the provider’s strengths'], w: [3, 3, 2, 2, 4], A: [100, 70, 40, 80, 90], B: [75, 90, 100, 60, 70] };
const bbSum = (s) => sum(s.map((v, k) => v * BB.w[k]));
const bbGap = bbSum(BB.A) - bbSum(BB.B);
const bbDelta = BB.A.map((a, k) => bbGap / (BB.B[k] - a));            // + raise, − lower the weight to tie
const bbScore = (s) => bbSum(s) / sum(BB.w);
// a cookware brand (fictional): marks for its strengths and three segments' centres (z)
const CK = { needs: ['Quality', 'Design', 'Price', 'Durability', 'Easy cleaning', 'Fast delivery'], marks: [1, 1, -1, 0, 0, 0],
  segs: ['Home chefs', 'Budget kitchens', 'Busy households'],
  z: [[1.2, 0.9, -0.8, 0.6, -0.2, -0.4], [-0.9, -1.0, 1.5, -0.3, 0.4, 0.5], [0.3, 0.5, 0.4, -0.2, 1.1, 0.8]] };
const ckFitWith = (marks) => CK.z.map((z) => sum(z.map((v, j) => v * marks[j])) / sum(marks.map(Math.abs)));
const ckFit = ckFitWith(CK.marks);
const ckMax = Math.max(...ckFit.map(Math.abs));
const ckScore = (f, max) => 50 + (50 * f) / max;
const ckC = ckScore(ckFit[2], ckMax);
const ckNoSign = ckFitWith(CK.marks.map(Math.abs));
const ckMinMax = (100 * (ckFit[2] - Math.min(...ckFit))) / (Math.max(...ckFit) - Math.min(...ckFit));
// a meal-kit company (fictional): what its new two-person box did to total contribution
const MK = { Q: 3000, mNew: 6, F: 5000, dC: 4600, mOld: 11 };
const mkC = (MK.Q * MK.mNew - MK.F - MK.dC) / (MK.Q * MK.mOld);

// ---------------------------------------------------------------- module 4
// sparkling-water brands (fictional): seven standardised attributes, the first two eigenvalues
const SW = { p: 7, brands: 5, l1: 4.20, l2: 1.61 };
const swShare = (SW.l1 + SW.l2) / SW.p;
// supermarket chains (fictional): fresh produce on Dimension 1
const FP = { loading: 0.72, eig: 3.24, sd: 0.60, dr: 1.2 };
const fpMove = (FP.loading / Math.sqrt(FP.eig) / FP.sd) * FP.dr;

export const items = [
  // ================================================================ Module 1: segmentation bases
  {
    id: 'm05-dg-1', lesson: 'why-segment', type: 'num', kind: 'applied',
    prompt: `Brockholt Climbing Centre (fictional) sells one adult membership. ${pc(BRK.b1, 0)} of the town’s families with children buy it, each contributing $${BRK.m1} a year. The centre is considering a family membership for that group alone: cheaper, contributing $${BRK.m2} a year, which it expects ${pc(BRK.b2, 0)} of families to buy, and costing $${int(BRK.F)} a year to run (Sunday-morning family sessions and their staff). Families who would have bought the adult membership would take the family one instead. How many families with children must the town hold for the family membership to pay for itself? Round up to a whole number of families.`,
    answer: brkN,
    check: () => Math.ceil(6600 / (0.09 * 110 - 0.05 * 140) - 1e-9),
    unit: 'families', places: 0, tol: 0.5,
    wrong: [
      { value: brkAt((BRK.b2 - BRK.b1) * BRK.m1), say: `That keeps the adult membership’s $${BRK.m1} for every family membership. The ${pc(BRK.b1, 0)} who switch now contribute $${BRK.m2}, so compare ${BRK.b2} × ${BRK.m2} with ${BRK.b1} × ${BRK.m1} a family.` },
      { value: brkAt((BRK.b2 - BRK.b1) * BRK.m2), say: `That counts only the extra ${fx((BRK.b2 - BRK.b1) * 100, 0)} points of families. The ${pc(BRK.b1, 0)} who already buy each contribute $${BRK.m1 - BRK.m2} less once they switch, which the new members must make up too.` },
      { value: brkAt(BRK.b2 * BRK.m2), say: `That treats every family membership as new money. Subtract what the families who would have bought the adult membership contributed: ${BRK.b1} × $${BRK.m1} a family.` },
      { value: brkN - 1, say: `${int(brkN - 1)} families bring ${int(brkN - 1)} × $${fx(brkPer)} = ${usd((brkN - 1) * brkPer, 2)}, just short of the $${int(BRK.F)}: round up.` },
    ],
    solution: `The family membership changes what each family in the town contributes on average from ${BRK.b1} × $${BRK.m1} = $${fx(BRK.b1 * BRK.m1)} to ${BRK.b2} × $${BRK.m2} = $${fx(BRK.b2 * BRK.m2)}: $${fx(brkPer)} more a family. It pays for its $${int(BRK.F)} when the group holds at least ${int(BRK.F)} ÷ ${fx(brkPer)} = ${fx(BRK.F / brkPer, 1)} families, so ${int(brkN)}. That is the substantial test in numbers: a tailored offer needs a segment big enough to cover its own fixed cost, and a cheaper offer has to win far more buyers than a dearer one to pay.`,
  },
  {
    id: 'm05-dg-2', lesson: 'demographic-and-geographic', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional energy-drink brand compares its 40 sales districts. Districts where students make up more of the population have much higher sales of the brand per 1,000 residents (correlation 0.71). The brand manager concludes that students drink more of the brand than other residents do, and plans to move the whole budget to student media. What is the main problem with the conclusion?',
    options: [
      'A pattern across districts needn’t hold for the people in them: the buyers there may be the non-students',
      'A correlation of 0.71 across districts is too weak to show that students and the brand’s sales are related at all',
      'Forty districts are too few for a correlation to mean anything; a hundred would be needed',
      'Correlation is not causation, so the brand should first have run a chi-square test of district by sales band',
    ],
    answer: 0,
    feedback: {
      1: 'A correlation of 0.71 is strong. The problem is the level it is measured at: districts, not people.',
      2: 'Forty districts can show a clear pattern between districts. What they can’t show is who, inside each district, is buying.',
      3: 'A chi-square test on districts would share the same flaw: it would still compare areas, not students with other residents.',
    },
    solution: 'This is the ecological fallacy: assuming that a pattern among areas holds for the individuals in them. Student districts differ in other ways (city-centre shops, nightlife, young workers), and the buyers there may be the other residents. To learn whether students buy more, compare students with other people directly, with survey or purchase data that records each buyer’s status. The district pattern is still useful for deciding where to put shelf space and local advertising.',
  },
  {
    id: 'm05-dg-3', lesson: 'psychographic-and-behavioural', type: 'num', kind: 'numerical',
    prompt: `A fictional bakery-café chain puts each loyalty member in a band by the number of items they buy a week. Light buyers are ${pc(BAKE.share[0], 0)} of members and buy ${BAKE.items[0]} items a week at $${fx(BAKE.price[0])} an item on average; medium buyers are ${pc(BAKE.share[1], 0)}, buying ${BAKE.items[1]} items at $${fx(BAKE.price[1])}; heavy buyers are ${pc(BAKE.share[2], 0)}, buying ${BAKE.items[2]} items at $${fx(BAKE.price[2])}, mostly loaves and rolls. What percentage of the members’ spending comes from the heavy buyers? Give one decimal place.`,
    answer: r1(bakeHeavy * 100),
    check: () => (0.15 * 13 * 1.9) / (0.55 * 2 * 4.4 + 0.3 * 5 * 3.2 + 0.15 * 13 * 1.9) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1(bakeHeavyItems * 100), say: 'That is the heavy band’s share of the items. Heavy buyers buy the cheapest items, so their share of spending is much smaller: weight each band’s items by its price too.' },
      { value: BAKE.share[2] * 100, say: 'That is the heavy band’s share of members. Its share of spending weights each band by what a member spends.' },
      { value: r1(bakeUnweighted * 100), say: 'That compares one member from each band, as if the bands were the same size. Multiply each band’s spend a member by its share of members first.' },
    ],
    solution: `Spending a week, per member of the scheme: light ${BAKE.share[0]} × ${BAKE.items[0]} × $${fx(BAKE.price[0])} = $${fx(bakeSpend[0], 3)}, medium ${BAKE.share[1]} × ${BAKE.items[1]} × $${fx(BAKE.price[1])} = $${fx(bakeSpend[1], 3)}, heavy ${BAKE.share[2]} × ${BAKE.items[2]} × $${fx(BAKE.price[2])} = $${fx(bakeSpend[2], 3)}; total $${fx(sum(bakeSpend), 3)}. The heavy buyers’ share is ${fx(bakeSpend[2], 3)} ÷ ${fx(sum(bakeSpend), 3)} ≈ ${pc(bakeHeavy)}, although they buy ${pc(bakeHeavyItems)} of the items. Heavy by volume is not heavy by value: who counts as a best customer depends on whether usage is measured in units or in money.`,
  },

  // ================================================================ Module 2: segmenting with data
  {
    id: 'm05-dg-4', lesson: 'cluster-analysis', type: 'num', kind: 'numerical',
    prompt: `In a toy example of six respondents, k-means++ has picked one respondent as the first starting centre. The other five sit at Euclidean distances of ${KPP.map((d) => fx(d, 1)).join(', ')} from it. What is the probability that k-means++ picks the respondent at ${fx(KPP[4], 1)} as the second starting centre? Give a percentage to one decimal place.`,
    answer: r1(kppP * 100),
    check: () => (9 / (0.25 + 1 + 2.25 + 4 + 9)) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1((KPP[4] / sum(KPP)) * 100), say: 'That makes the chance proportional to the distance. k-means++ uses the squared distance, which favours far-off respondents more strongly.' },
      { value: 20, say: 'k-means++ doesn’t pick at random with equal chances; that is the plain random start it improves on.' },
      { value: 100, say: 'Always taking the farthest point is a different rule, which is easily pulled to outliers. k-means++ picks at random, with each respondent’s chance proportional to its squared distance.' },
    ],
    solution: `k-means++ picks each further starting centre with probability proportional to the squared distance from the nearest centre already chosen. The squared distances are ${kppSq.map((v) => fx(v)).join(', ')}, adding to ${fx(sum(kppSq))}, so the respondent at ${fx(KPP[4], 1)} is picked with probability ${fx(kppSq[4])} ÷ ${fx(sum(kppSq))} ≈ ${pc(kppP)}. The starts spread out, but they are still random, which is why k-means is run from many such starts and the lowest within-cluster sum of squares kept.`,
  },
  {
    id: 'm05-dg-5', lesson: 'cluster-analysis', type: 'mc', kind: 'applied',
    prompt: `A fictional travel insurer ran k-means on ${int(INS.n)} customers’ standardised ratings of six needs, with 30 restarts for each k; with one segment the within-cluster sum of squares is ${int(insT)}. Two segments split the customers into price-first and cover-first; at four, each of those divides into groups that want different policies; at five, one of the four splits into two groups that want the same cover, one more strongly than the other. The split-half check segmented each half of the sample separately and compared the two assignments. Which number of segments does the evidence support best?`,
    data: { table: { head: ['k', 'Within-cluster sum of squares', 'Fall from k − 1', 'Mean silhouette', 'Split-half adjusted Rand index'], rows: INS.ks.map((k, i) => [String(k), int(INS.wcss[i]), int(insFall[i]), fx(INS.sil[i]), fx(INS.ari[i])]), align: ['r', 'r', 'r', 'r', 'r'] } },
    options: [
      'Four: the falls shrink after four, its silhouette is a local peak, its halves agree and each segment needs its own policy',
      'Two: it has the highest mean silhouette and the most stable halves, which makes it the statistically correct number of segments',
      'Seven: its within-cluster sum of squares is the lowest of any k in the table, so seven segments describe the customers best',
      `Five: the fall from four to five (${int(insFall[3])}) is larger than any fall after it, so the bend in the curve comes at five`,
    ],
    answer: 0,
    feedback: {
      1: 'Two is true but too coarse: it is one broad split, and the silhouette tends to favour a few large groups. Read it with the elbow and with what the segments would let the insurer do differently.',
      2: 'The within-cluster sum of squares always falls as k rises and would reach 0 with a segment for every customer. Look for where the falls shrink.',
      3: `Each fall in this table is larger than the ones after it, so that alone can’t locate the bend. The bend is where the falls drop sharply: ${int(insFall[2])} from three to four, then only ${int(insFall[3])}. Five also halves less consistently (${fx(INS.ari[3])}) and splits a segment into two strengths of the same want.`,
    },
    solution: `The falls are ${insFall.map(int).join(', ')}: large up to four, then small, so the elbow is at four. The silhouette is highest at two (${fx(INS.sil[0])}), the broad split, with a local peak at four (${fx(INS.sil[2])} against ${fx(INS.sil[1])} and ${fx(INS.sil[3])}). The halves agree well at four (${fx(INS.ari[2])}) and poorly at five (${fx(INS.ari[3])}). And four segments call for four different policies, while five only splits one segment by strength. Statistics narrow the choice; what the segments mean decides it.`,
  },
  {
    id: 'm05-dg-6', lesson: 'profiling-segments', type: 'num', kind: 'numerical',
    prompt: `In a fictional gym chain’s survey of its members, the “early birds” segment is ${pc(GYM.share, 0)} of the respondents and accounts for ${pc(GYM.spendShare, 0)} of their monthly spending at the gym. Across all respondents, spending averages $${GYM.avg} a month. What does an early bird spend a month at the gym, on average? Give a whole number of dollars.`,
    answer: Math.round(gymHead),
    check: () => 40 * (0.27 / 0.18),
    unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: r2(GYM.avg * GYM.spendShare), say: 'That multiplies the average by the share of spend. A segment’s spend per head is the average times its share of spend divided by its share of people.' },
      { value: r2(GYM.avg * (GYM.share / GYM.spendShare)), say: 'The ratio is upside down. A segment with a larger share of spend than of people spends more than average a head.' },
      { value: (GYM.spendShare / GYM.share) * 100, say: 'That is the segment’s index of spend per head against the average (100 = average). The question asks for dollars.' },
      { value: r2(GYM.avg * (1 + GYM.spendShare - GYM.share)), say: `Adding the ${fx((GYM.spendShare - GYM.share) * 100, 0)}-point gap to the average treats the shares as if they were growth rates. Divide one share by the other instead.` },
    ],
    solution: `Share of spend ÷ share of people = spend per head ÷ the average: ${pc(GYM.spendShare, 0)} ÷ ${pc(GYM.share, 0)} = ${fx(GYM.spendShare / GYM.share)}, so an early bird spends ${fx(GYM.spendShare / GYM.share)} × $${GYM.avg} = $${fx(gymHead, 0)} a month, an index of ${fx((GYM.spendShare / GYM.share) * 100, 0)}. The two shares rank segments differently, and both matter: one counts customers, the other money.`,
  },

  // ================================================================ Module 3: targeting
  {
    id: 'm05-dg-7', lesson: 'evaluating-segments', type: 'mc', kind: 'applied',
    prompt: 'A fictional broadband provider scores two segments on five factors (0–100). Which is the smallest change to one weight, with every other weight unchanged, that would make the two segments draw level?',
    data: { table: { head: ['Factor', 'Weight', 'Small offices', 'Home workers'], rows: BB.factors.map((f, k) => [f, String(BB.w[k]), String(BB.A[k]), String(BB.B[k])]), align: ['l', 'r', 'r', 'r'] } },
    options: [
      `Raise growth’s weight from ${BB.w[2]} to ${fx(BB.w[2] + bbDelta[2])}`,
      `Lower size’s weight from ${BB.w[0]} to ${fx(BB.w[0] + bbDelta[0], 1)}`,
      `Lower fit’s weight from ${BB.w[4]} to ${fx(BB.w[4] + bbDelta[4])}`,
      `Raise spend per head’s weight from ${BB.w[1]} to ${fx(BB.w[1] + 0.25)}`,
    ],
    answer: 0,
    feedback: {
      1: `That does tie them, but it moves a weight by ${fx(-bbDelta[0], 1)}. Find the change for every factor and compare.`,
      2: `That ties them too, but with a change of ${fx(-bbDelta[4])}. Growth, where home workers lead by 60 points, needs far less.`,
      3: `Home workers lead on spend per head by only 20 points, so each point of weight closes 20 points of the ${int(bbGap)}-point gap: the weight would have to reach ${fx(BB.w[1] + bbDelta[1])}.`,
    },
    solution: `Weighted sums (Σ weight × score): small offices ${int(bbSum(BB.A))}, home workers ${int(bbSum(BB.B))}, a gap of ${int(bbGap)} (scores ${fx(bbScore(BB.A), 1)} against ${fx(bbScore(BB.B), 1)} out of 100). Each point of weight on a factor changes the gap by the difference in the two segments’ scores on it, so the weight that ties them moves by the gap divided by that difference: growth ${sgn(bbDelta[2])} (home workers lead by ${BB.B[2] - BB.A[2]}), spend per head ${sgn(bbDelta[1])}, size ${sgn(bbDelta[0], 1)}, room ${sgn(bbDelta[3])}, fit ${sgn(bbDelta[4])}. A quarter of a point on growth reverses the order, so the two are effectively tied: the decision rests on the growth estimates, which are the judgement to test.`,
  },
  {
    id: 'm05-dg-8', lesson: 'evaluating-segments', type: 'num', kind: 'numerical',
    prompt: 'A fictional cookware brand marks itself strong (+1) on quality and design, weak (−1) on price, and average (0) on durability, easy cleaning and fast delivery. The table gives three segments’ centres in standardised units (0 = the average customer). What is the busy households’ fit score on the 0–100 scale used in this course’s segment scorecards? Give one decimal place.',
    data: { table: { head: ['Need', ...CK.segs], rows: CK.needs.map((nd, j) => [nd, ...CK.z.map((z) => sgn(z[j], 1))]), align: ['l', 'r', 'r', 'r'] } },
    answer: r1(ckC),
    check: () => { const f = [(1.2 + 0.9 + 0.8) / 3, (-0.9 - 1.0 - 1.5) / 3, (0.3 + 0.5 - 0.4) / 3]; return 50 + (50 * f[2]) / Math.max(...f.map(Math.abs)); },
    unit: '', places: 1, tol: 0.06,
    wrong: [
      { value: r1(ckScore(ckFit[2], Math.max(...ckFit))), say: `That scales by the largest positive fit, the home chefs’ ${sgn(ckFit[0])}. The scale uses the largest fit in either direction: the budget kitchens’ ${sgn(ckFit[1])}.` },
      { value: r1((100 * ckFit[2]) / Math.max(...ckFit)), say: 'That is a ratio to the best segment, the rule for size or spend. Fit can be negative, so it is centred on 50 (no better than average) before scaling.' },
      { value: r1(ckScore(ckNoSign[2], Math.max(...ckNoSign.map(Math.abs)))), say: 'That adds the price z-score instead of subtracting it. A weak mark (−1) means caring about price counts against fit.' },
      { value: r1(ckMinMax), say: 'That is min–max scaling, which sets the worst segment to 0. The fit score sets average to 50 and the segment furthest from average to 0 or 100.' },
    ],
    solution: `Fit = Σ z × mark ÷ Σ|mark| = (quality + design − price) ÷ 3: home chefs ${sgn(ckFit[0])}, budget kitchens ${sgn(ckFit[1])}, busy households (${fx(CK.z[2][0], 1)} + ${fx(CK.z[2][1], 1)} − ${fx(CK.z[2][2], 1)}) ÷ 3 = ${sgn(ckFit[2])}. The largest fit in either direction is ${fx(ckMax)} (budget kitchens, negative), so busy households score 50 + 50 × ${fx(ckFit[2])} ÷ ${fx(ckMax)} ≈ ${fx(ckC, 1)}: only a little better than average, because what they care about most (easy cleaning, fast delivery) is where the brand is merely average.`,
  },
  {
    id: 'm05-dg-9', lesson: 'targeting-strategies', type: 'num', kind: 'applied',
    prompt: `A fictional meal-kit company launched a cheaper two-person box beside its family box. Six months on, the two-person box sells ${int(MK.Q)} boxes a month, each contributing $${MK.mNew}, and its packing line adds $${int(MK.F)} a month of fixed costs. With everything else unchanged, the company’s total contribution has risen by $${int(MK.dC)} a month. Each family box contributes $${MK.mOld}, and each customer who switched buys one two-person box in place of one family box. What percentage of two-person boxes are bought by customers who switched from the family box? Give one decimal place.`,
    answer: r1(mkC * 100),
    check: () => ((3000 * 6 - 5000 - 4600) / (3000 * 11)) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1(((MK.Q * MK.mNew - MK.dC) / (MK.Q * MK.mOld)) * 100), say: `That leaves out the $${int(MK.F)} of fixed costs. The rise in contribution is what remains after the fixed costs and the switchers’ lost family boxes.` },
      { value: r1(((MK.Q * MK.mNew - MK.F - MK.dC) / (MK.Q * MK.mNew)) * 100), say: `Each switcher takes away a family box’s $${MK.mOld}, not the new box’s $${MK.mNew}: divide by the contribution lost per switcher.` },
      { value: r1(((MK.Q * MK.mNew - MK.F - MK.dC) / (MK.Q * (MK.mOld - MK.mNew))) * 100), say: `The new box’s $${MK.mNew} is already counted on every box sold; what a switcher removes is the whole $${MK.mOld} of the family box they stopped buying.` },
    ],
    solution: `Incremental contribution = Q × m_new − c × Q × m_old − F, so c = (Q × m_new − F − ΔC) ÷ (Q × m_old) = (${int(MK.Q)} × ${MK.mNew} − ${int(MK.F)} − ${int(MK.dC)}) ÷ (${int(MK.Q)} × ${MK.mOld}) = ${int(MK.Q * MK.mNew - MK.F - MK.dC)} ÷ ${int(MK.Q * MK.mOld)} ≈ ${pc(mkC)}. About a quarter of the new box’s sales are taken from the family box. “Everything else unchanged” is the weak point: seasons, prices and rivals also move total contribution, so the company should check the rate by asking buyers what the box replaced.`,
  },

  // ================================================================ Module 4: positioning
  {
    id: 'm05-dg-10', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: `A perceptual map of ${SW.brands} fictional sparkling-water brands is built by principal components from their mean ratings on ${SW.p} standardised attributes. The map’s two dimensions have eigenvalues of ${fx(SW.l1)} and ${fx(SW.l2)}. What percentage of the differences between the brands does the map show? Give one decimal place.`,
    answer: r1(swShare * 100),
    check: () => ((4.2 + 1.61) / 7) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1((SW.l1 / (SW.l1 + SW.l2)) * 100), say: 'That is Dimension 1’s share of the two dimensions together. The map’s share compares the two with all the variance, which for standardised attributes adds up to the number of attributes.' },
      { value: r1((SW.l1 / SW.p) * 100), say: 'That is Dimension 1 alone. The map shows both dimensions: add their eigenvalues.' },
      { value: r1(((SW.l1 + SW.l2) / SW.brands) * 100), say: 'The eigenvalues of standardised attributes add up to the number of attributes (7), not the number of brands.' },
    ],
    solution: `With standardised attributes the eigenvalues add up to the number of attributes, ${SW.p}, whether or not the rest are listed (with ${SW.brands} brands at most ${SW.brands - 1} are above zero). The map shows (${fx(SW.l1)} + ${fx(SW.l2)}) ÷ ${SW.p} = ${pc(swShare)} of how the brands’ average ratings differ, and leaves ${pc(1 - swShare)} off the flat picture.`,
  },
  {
    id: 'm05-dg-11', lesson: 'positioning-statements', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional electric-scooter hire scheme launched with the city’s quietest, most comfortable scooters, which riders rate far above both rival schemes on comfort. Six months on, few people use it: its scooters are parked in a third as many places as the rivals’, and riders say they can rarely find one nearby. In Keller, Sternthal and Tybout’s terms, what went wrong?',
    options: [
      'It missed a point of parity: riders can’t find a scooter nearby, so its comfort never gets the chance to count',
      'Its point of difference was wrong: comfort can’t set any scooter scheme apart, because riders choose on price and nothing else',
      'It chose the wrong frame of reference: comfortable scooters should have been framed against taxis, where comfort is expected',
      'It lacked a reason to believe: riders doubted the comfort claim because the scheme offered no proof that its scooters are quieter',
    ],
    answer: 0,
    feedback: {
      1: 'Riders do value comfort: they rate the scheme far above its rivals on it. The difference is real; it just can’t work while the basics are missing.',
      2: 'Changing the frame would change the rivals, but scooters riders can’t find would fail in any frame.',
      3: 'Riders rate its comfort highly, so they believe it. What they can’t do is find a scooter.',
    },
    solution: 'Keller, Sternthal and Tybout’s point is that an offer must be good enough on its frame’s points of parity before its points of difference matter. For scooter hire, finding one nearby is parity: without it riders don’t consider the scheme, however comfortable the ride. The fix is coverage first (more parking places), with comfort kept as the difference once riders can find a scooter.',
  },
  {
    id: 'm05-dg-12', lesson: 'differentiation-and-repositioning', type: 'num', kind: 'numerical',
    prompt: `On a fictional perceptual map of supermarket chains, the attribute “fresh produce” has a loading of ${fx(FP.loading)} on Dimension 1, whose eigenvalue is ${fx(FP.eig)}. The chains’ mean fresh-produce ratings have a standard deviation of ${fx(FP.sd)} across the chains. With the map’s axes held fixed, by how much does a chain’s Dimension 1 score change if its mean fresh-produce rating rises by ${fx(FP.dr, 1)} points? Give two decimal places.`,
    answer: r2(fpMove),
    check: () => (0.72 / Math.sqrt(3.24) / 0.6) * 1.2,
    unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(FP.loading * FP.dr), say: 'A loading is the attribute’s correlation with the dimension, not the score’s weight on the attribute. Divide it by √eigenvalue to get the weight, then by the standard deviation to work in rating points.' },
      { value: r2((FP.loading / Math.sqrt(FP.eig)) * FP.dr), say: `That uses the weight on the standardised rating. A rating point is not one standard deviation, so divide by the chains’ standard deviation, ${fx(FP.sd)}, as well.` },
      { value: r2((FP.loading / FP.eig / FP.sd) * FP.dr), say: `The weight divides the loading by the square root of the eigenvalue (${fx(Math.sqrt(FP.eig), 1)}), not by the eigenvalue itself.` },
      { value: r2((FP.loading / FP.sd) * FP.dr), say: `That forgets to turn the loading into a weight: divide by √eigenvalue = ${fx(Math.sqrt(FP.eig), 1)}.` },
    ],
    solution: `A brand’s score is a weighted sum of its standardised ratings, and the weight on an attribute is its loading ÷ √eigenvalue = ${fx(FP.loading)} ÷ ${fx(Math.sqrt(FP.eig), 1)} = ${fx(FP.loading / Math.sqrt(FP.eig), 1)}. One rating point is 1 ÷ ${fx(FP.sd)} standard deviations, so each point moves the chain ${fx(FP.loading / Math.sqrt(FP.eig), 1)} ÷ ${fx(FP.sd)} = ${fx(FP.loading / Math.sqrt(FP.eig) / FP.sd, 3)} along Dimension 1, and ${fx(FP.dr, 1)} points move it ${fx(fpMove)}. The move is on today’s axes; whether customers’ ratings really rise is a question for the next survey.`,
  },
];

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
