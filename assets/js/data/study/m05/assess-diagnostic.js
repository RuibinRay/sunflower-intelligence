// assess-diagnostic.js — M05 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what M01 (segmentation, targeting and positioning in outline, value propositions), B04 (chi-square, ANOVA)
// or M04 (surveys) already teach, so that a student who knows only those courses misses module 1’s items and one who
// already has a module’s methods gets its items right. Several distractors are what those courses’ methods suggest (an
// ANOVA across needs, a significant chi-square, equal weights meaning equal influence).
// Module 1: the evidence that a market is worth segmenting (opposite bundles of needs, not means or significance
// tests); the ecological fallacy in a pattern across districts; how the heaviest buyers’ share grows with the length of
// the period measured.
// Module 2: k-means++’s rule for choosing the next starting centre (probability proportional to the squared distance);
// what agreement between Ward’s method and k-means does and doesn’t show (reproducible, not natural, segments; the
// adjusted Rand index is not a share of people placed correctly); the typing tool (standardise with the study’s means
// and standard deviations, then the nearest centre), with the two slips the lesson warns about as distractors.
// Module 3: a factor’s pull on a scorecard (weight × the spread of its scores), not its weight alone; a fit score from
// segment centres and a firm’s strengths (needs fit, then centred on 50 and scaled by the largest fit in either
// direction); how few members match a persona built from each line’s most common answer.
// Module 4: a map’s share of the variance from the eigenvalues it leaves off (they add up to the number of standardised
// attributes); a missing point of parity; how far a rating change moves a brand on fixed axes, from the loading, the
// eigenvalue and the attribute’s spread across brands.
// Modules 1–3 use only mc and num items, which score 0 or 1, so that the route below can’t be passed on part marks;
// module 4 is not used for routing. New questions on businesses used nowhere else in M05 (all fictional), not copies of
// lesson exercises, module tests, the final or the project, and nothing from the project’s scenario or data. No hints;
// solutions are shown on review. Every num item’s `check` recomputes its answer, and every figure a prompt states is
// computed below from its inputs.

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 2) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- module 1
// a hair-salon chain (fictional): low price against luxury treatments
const SAL = { n: 1200, price: 260, both: 9, r: -0.52, lo: 3.9, hi: 4.8 };
// how the heaviest fifth's share grows with the period (Graham, Sharp, Dawes and Trinh 2017, cited by Sharp et al.)
const PERIOD = { quarter: 0.40, year: 0.50, five: 0.60, brand: 0.41 };

// ---------------------------------------------------------------- module 2
// k-means++ on a toy example: the other five respondents' distances from the first centre
const KPP = [0.5, 1.0, 1.5, 2.0, 3.0];
const kppSq = KPP.map((d) => d * d);
const kppP = kppSq[4] / sum(kppSq);
// a mobile-phone network (fictional): k-means against Ward's method at five segments
const NET = { n: 800, same: 760, ari: 0.88 };
// a delicatessen chain's typing tool (fictional)
const DELI = { qs: ['Low prices', 'Advice at the counter', 'Rare imports'], mu: [4.6, 3.8, 3.2], sd: [1.5, 1.2, 1.8],
  segs: ['Bargain hunters', 'Advice seekers', 'Collectors'], c: [[1.0, -0.5, -0.6], [-0.2, 1.1, -0.1], [-0.7, 0.2, 1.3]], ans: [6, 5, 5] };
const deliDist = (z) => DELI.c.map((c) => sum(c.map((v, j) => (z[j] - v) ** 2)));
const nearest = (d) => d.indexOf(Math.min(...d));
const deliZ = DELI.ans.map((a, j) => (a - DELI.mu[j]) / DELI.sd[j]);
const deliD = deliDist(deliZ);
const deliNoSd = deliDist(DELI.ans.map((a, j) => a - DELI.mu[j]));                    // slip: no division by the SD
const deliOwnMean = sum(DELI.ans) / DELI.ans.length;
const deliOwn = deliDist(DELI.ans.map((a, j) => (a - deliOwnMean) / DELI.sd[j]));   // slip: centred on her own mean
const [dK, dNoSd, dOwn] = [nearest(deliD), nearest(deliNoSd), nearest(deliOwn)];
const deliSorted = [...deliD].sort((a, b) => a - b);

// ---------------------------------------------------------------- module 3
// a solar-panel installer (fictional): weights and the spread of two factors' scores
const SOL = { wSize: 5, wFit: 3, size: [64, 100], fit: [12, 96] };
const pullSize = SOL.wSize * (SOL.size[1] - SOL.size[0]), pullFit = SOL.wFit * (SOL.fit[1] - SOL.fit[0]);
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
// a craft-supplies shop's persona (fictional): the most common answer on five lines
const CRAFT = { n: 400, lines: [['aged 45–59', 0.41], ['household income $60k–90k', 0.38], ['lives in a suburb', 0.52], ['a couple without children at home', 0.44], ['buys online', 0.57]] };
const craftMin = Math.min(...CRAFT.lines.map((l) => l[1])), craftMax = Math.max(...CRAFT.lines.map((l) => l[1]));
const craftAvg = sum(CRAFT.lines.map((l) => l[1])) / CRAFT.lines.length;

// ---------------------------------------------------------------- module 4
// sparkling-water brands (fictional): seven standardised attributes, the eigenvalues left off the map
const SW = { p: 7, brands: 5, off: [0.74, 0.45] };
const swShare = (SW.p - sum(SW.off)) / SW.p;
// home coffee-machine brands (fictional): “easy to clean” on Dimension 1
const FP = { loading: 0.72, eig: 3.24, sd: 0.60, dr: 1.2 };
const fpMove = (FP.loading / Math.sqrt(FP.eig) / FP.sd) * FP.dr;

export const items = [
  // ================================================================ Module 1: segmentation bases
  {
    id: 'm05-dg-1', lesson: 'why-segment', type: 'mc', kind: 'conceptual',
    prompt: `A fictional hair-salon chain surveyed ${int(SAL.n)} customers on how much eight things matter when they choose a salon, from 1 (not at all) to 7 (essential). Which finding is the best evidence that its market is worth dividing into segments that want different things?`,
    options: [
      `Of the ${SAL.price} who rate a low price 6 or 7, only ${SAL.both} also rate luxury treatments that high; the two correlate at ${sgn(SAL.r)}`,
      `All eight needs average between ${fx(SAL.lo, 1)} and ${fx(SAL.hi, 1)}, so a salon that offers a little of everything suits most customers`,
      'A one-way ANOVA shows that the eight needs’ mean ratings differ from one another significantly (p < 0.001)',
      'A chi-square test shows that age band is significantly associated with how often people visit a salon (p < 0.001)',
    ],
    answer: 0,
    feedback: {
      1: 'Middling averages are what a mix of opposite groups looks like. Look at the spread, and at which needs go together and which run against each other.',
      2: 'That says some needs matter more than others to customers on average. It says nothing about whether customers differ from one another.',
      3: 'With 1,200 people even a weak association is significant, and visiting more or less often by age isn’t the same as groups wanting different things.',
    },
    solution: `Segments exist when customers differ in what they want and the differences come in bundles. Of the ${SAL.price} customers who put a low price first, almost none want luxury treatments too, and the two needs run against each other (r = ${sgn(SAL.r)}): two crowds in opposite corners. That says the market is worth dividing; it doesn’t yet say how many segments there are or which to serve. Average ratings in the middle of the scale can hide exactly such opposite groups, and significance tests on means or on demographics don’t show them.`,
  },
  {
    id: 'm05-dg-2', lesson: 'demographic-and-geographic', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional kombucha brand compares its 40 sales districts. Districts where students make up more of the population have much higher sales of the brand per 1,000 residents (correlation 0.71). The brand manager concludes that students drink more of the brand than other residents do, and plans to move the whole budget to student media. What is the main problem with the conclusion?',
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
    id: 'm05-dg-3', lesson: 'psychographic-and-behavioural', type: 'mc', kind: 'conceptual',
    prompt: `In a fictional household panel, the heaviest 20% of a breakfast cereal’s buyers account for ${pc(PERIOD.brand, 0)} of its sales over one quarter. What should the brand expect their share to be if the same panel’s purchases are counted over five years instead?`,
    options: [
      'Higher, nearer 60%: a longer window counts many more light buyers, so the heaviest fifth stand further above the rest',
      `About the same, ${pc(PERIOD.brand, 0)}: the heaviest fifth are much the same households in any period, so their share is stable`,
      'Lower, nearer 30%: over five years heavy buyers lapse and light buyers catch up, so purchases even out',
      'About 80%: over a long enough period every brand’s sales settle at the Pareto principle’s 80/20',
    ],
    answer: 0,
    feedback: {
      1: 'The share depends on the window. A longer one brings in many buyers who buy only once or twice, which makes the heaviest fifth look heavier by comparison.',
      2: 'Some heavy buyers do lapse, but the longer window adds far more very light buyers to the base, and that effect is larger.',
      3: 'Panel studies find the share rises with the period but stays well short of 80%: about 60% over five years.',
    },
    solution: `Sharp, Romaniuk and Graham cite a study of European household panels (Graham, Sharp, Dawes and Trinh, 2017) in which the heaviest 20% of a brand’s buyers gave about ${pc(PERIOD.quarter, 0)} of its sales over a quarter, ${pc(PERIOD.year, 0)} over a year and ${pc(PERIOD.five, 0)} over five years, because a longer window counts more very light buyers. So a share is meaningless without its period: state the window whenever you quote one, and compare shares only over the same window.`,
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
    id: 'm05-dg-5', lesson: 'cluster-analysis', type: 'mc', kind: 'conceptual',
    prompt: `A fictional mobile-phone network’s analyst segmented ${int(NET.n)} customers twice, with k-means at five segments and with Ward’s method cut at five. The two put ${int(NET.same)} of the ${int(NET.n)} customers (${pc(NET.same / NET.n, 0)}) in matching groups, an adjusted Rand index of ${fx(NET.ari)}. A colleague says this proves that the five segments exist in the market. What is the best reading?`,
    options: [
      'Close agreement between two methods shows reproducible segments, not natural ones; check a split half and what they mean',
      'The colleague is right: when two different methods find the same five groups, the groups are natural segments of the market',
      `An adjusted Rand index of ${fx(NET.ari)} means that ${pc(NET.ari, 0)} of the customers have been put in their true segment`,
      `The methods disagree on ${int(NET.n - NET.same)} customers, so the analyst should drop to four segments, where agreement would be higher`,
    ],
    answer: 0,
    feedback: {
      1: 'Agreement between methods shows the grouping doesn’t depend on one method. Natural segments are clearly separated clusters, which are rare in consumer data; overlapping but stable segments are reproducible.',
      2: 'The adjusted Rand index compares two groupings over pairs of customers, corrected for chance. It says nothing about a “true” segment, which no real analyst can see.',
      3: 'Close agreement is a good result, not a reason to change k. The number of segments comes from the elbow, the silhouette and what the segments mean.',
    },
    solution: `An adjusted Rand index of ${fx(NET.ari)} (1 = identical groupings, about 0 = chance) shows that k-means and Ward’s method find much the same five groups: the result doesn’t hang on one method. That is evidence of a reproducible segmentation, not proof of natural segments waiting in the market. Add the other stability checks (many restarts, the same segments from each half of the sample), and judge the segments by whether they mean something a business can act on.`,
  },
  {
    id: 'm05-dg-6', lesson: 'profiling-segments', type: 'mc', kind: 'applied',
    prompt: `A fictional delicatessen chain’s typing tool asks three golden questions, rated 1–7. A new customer answers ${DELI.ans.join(', ')}. Which segment does the tool put her in?`,
    data: { table: { head: ['', ...DELI.qs], rows: [
      ['Study mean', ...DELI.mu.map((v) => fx(v, 1))], ['Study standard deviation', ...DELI.sd.map((v) => fx(v, 1))],
      ...DELI.segs.map((s, g) => [`Centre (z): ${s}`, ...DELI.c[g].map((v) => sgn(v, 1))]),
    ], align: ['l', 'r', 'r', 'r'] } },
    options: [DELI.segs[dK], DELI.segs[dNoSd], DELI.segs[dOwn], 'None: two centres are equally near, so the tool can’t place her'],
    answer: 0,
    feedback: {
      1: `That is what you get without dividing by the standard deviations: the answers must be in standard deviations, like the centres. Standardised, she is nearest ${DELI.segs[dK]}.`,
      2: 'That centres her answers on her own average, which throws away how high or low her ratings are compared with other customers. Standardise with the study’s stored means and standard deviations.',
      3: `Her squared distances are ${DELI.segs.map((s, g) => `${s} ${fx(deliD[g])}`).join(', ')}: one centre is clearly nearest.`,
    },
    solution: `Standardise each answer with the study’s mean and standard deviation: ${DELI.ans.map((a, j) => `(${a} − ${fx(DELI.mu[j], 1)}) ÷ ${fx(DELI.sd[j], 1)} = ${sgn(deliZ[j])}`).join(', ')}. Squared distances to the centres: ${DELI.segs.map((s, g) => `${s} ${fx(deliD[g])}`).join(', ')}. The nearest is ${DELI.segs[dK]}, ${fx(deliSorted[1] - deliSorted[0])} closer than the next. A tool that is fed raw answers, or answers centred on the customer’s own average, places her elsewhere.`,
  },

  // ================================================================ Module 3: targeting
  {
    id: 'm05-dg-7', lesson: 'evaluating-segments', type: 'num', kind: 'numerical',
    prompt: `A fictional solar-panel installer’s segment scorecard gives size a weight of ${SOL.wSize} and fit a weight of ${SOL.wFit}. Across its five segments, the size scores run from ${SOL.size[0]} to ${SOL.size[1]} and the fit scores from ${SOL.fit[0]} to ${SOL.fit[1]} (both on 0–100). Fit has the smaller weight. How many times as far as size can it move a segment’s weighted total? Give one decimal place.`,
    answer: r1(pullFit / pullSize),
    check: () => (3 * (96 - 12)) / (5 * (100 - 64)),
    unit: 'times', places: 1, tol: 0.05,
    wrong: [
      { value: r1(SOL.wFit / SOL.wSize), say: 'That compares the weights alone. A factor’s pull on the totals is its weight times the spread of its scores, and fit’s scores spread far more widely than size’s.' },
      { value: r1((SOL.fit[1] - SOL.fit[0]) / (SOL.size[1] - SOL.size[0])), say: 'That compares the spreads alone. Multiply each spread by its factor’s weight.' },
      { value: r2(pullSize / pullFit), say: 'Upside down: that is how far size can move a total compared with fit.' },
    ],
    solution: `A factor’s pull is its weight times the range of its scores: size ${SOL.wSize} × (${SOL.size[1]} − ${SOL.size[0]}) = ${pullSize}; fit ${SOL.wFit} × (${SOL.fit[1]} − ${SOL.fit[0]}) = ${pullFit}. Fit can move a total ${pullFit} ÷ ${pullSize} ≈ ${fx(pullFit / pullSize, 1)} times as far as size, although its weight is smaller. When you ask what drives a scorecard’s ranking, look at weight × spread, not the weights alone.`,
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
    id: 'm05-dg-9', lesson: 'targeting-strategies', type: 'mc', kind: 'applied',
    prompt: `A fictional craft-supplies shop builds a persona for its ${CRAFT.n}-member “gift makers” segment by taking the most common answer on each of five lines: ${CRAFT.lines.map(([l, s]) => `${l} (${pc(s, 0)} of the segment)`).join(', ')}. What can it say about how many members match the persona on all five lines?`,
    options: [
      `At most ${pc(craftMin, 0)}, and probably very few: each line leaves out part of the segment`,
      'Most of them, because every line on the persona is the segment’s most common answer to that question',
      `About ${pc(craftMax, 0)}, the share on the most common of the five lines, since the persona is built around it`,
      `About ${pc(craftAvg, 0)}, the average of the five lines’ shares, since each line describes part of the persona`,
    ],
    answer: 0,
    feedback: {
      1: 'The most common answer on a line can still leave out most of the segment, and every extra line leaves out more. The members who match all five are those in every line’s group at once.',
      2: `No one can match the persona without matching every line, including the ${pc(craftMin, 0)} one, so the share can’t be higher than that, and the overlap is usually far smaller.`,
      3: 'Averaging the lines doesn’t count the members who are in all five groups at once; that number can only be smaller than the smallest group.',
    },
    solution: `A member matches the persona only if they are in every line’s group, so at most the smallest group, ${pc(craftMin, 0)}, can match, and usually far fewer: in Lantern’s study only 1 of 109 Craft and local respondents matched the most common answer on five lines. Write demographic lines as shares of the segment, lead with the needs most members share, and keep the base on the card.`,
  },

  // ================================================================ Module 4: positioning
  {
    id: 'm05-dg-10', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: `A perceptual map of ${SW.brands} fictional sparkling-water brands is built by principal components from their mean ratings on ${SW.p} standardised attributes. The dimensions it leaves off have eigenvalues of ${SW.off.map((v) => fx(v)).join(' and ')}, and all the others not drawn are zero. What percentage of the differences between the brands does the two-dimensional map show? Give one decimal place.`,
    answer: r1(swShare * 100),
    check: () => ((7 - 0.74 - 0.45) / 7) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1((sum(SW.off) / SW.p) * 100), say: 'That is the share the map leaves off. The map shows the rest.' },
      { value: r1(((SW.brands - sum(SW.off)) / SW.brands) * 100), say: 'The eigenvalues of standardised attributes add up to the number of attributes (7), not the number of brands.' },
      { value: r1(((SW.p - SW.off[0]) / SW.p) * 100), say: 'Both dimensions left off count against the map: subtract 0.45 as well.' },
    ],
    solution: `With standardised attributes the eigenvalues add up to the number of attributes, ${SW.p}. The two dimensions left off carry ${SW.off.map((v) => fx(v)).join(' + ')} = ${fx(sum(SW.off))}, so the map’s two carry ${SW.p} − ${fx(sum(SW.off))} = ${fx(SW.p - sum(SW.off))}, or ${pc(swShare)} of how the brands’ average ratings differ. With ${SW.brands} brands at most ${SW.brands - 1} eigenvalues can be above zero.`,
  },
  {
    id: 'm05-dg-11', lesson: 'positioning-statements', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional electric-scooter hire scheme launched with the city’s quietest, most comfortable scooters, which riders rate far above both rival schemes on comfort. Six months on, few people use it: its scooters are parked in a third as many places as the rivals’, and riders say they can rarely find one nearby. In Keller, Sternthal and Tybout’s terms, what went wrong?',
    options: [
      'It fell short on a point of parity, so its point of difference never came into play',
      'Comfort was a point of parity rather than a difference, so it needed a second difference such as lower fares',
      'Its frame of reference was too narrow: comfort only counts against taxis, so it should have positioned against them',
      'Its point of difference wasn’t relevant enough: riders on short trips don’t value a quieter, smoother scooter',
    ],
    answer: 0,
    feedback: {
      1: 'Riders rate the scheme far above both rivals on comfort, so it is a difference, not parity. The trouble lies elsewhere.',
      2: 'Changing the frame would change the rivals, but scooters riders can’t find would fail in any frame.',
      3: 'Nothing suggests riders don’t value comfort. What they report is that they can’t find a scooter: a basic is missing.',
    },
    solution: 'Keller, Sternthal and Tybout’s point is that an offer must be good enough on its frame’s points of parity before its points of difference matter. For scooter hire, finding one nearby is parity: without it riders don’t consider the scheme, however comfortable the ride. The fix is coverage first (more parking places), with comfort kept as the difference once riders can find a scooter.',
  },
  {
    id: 'm05-dg-12', lesson: 'differentiation-and-repositioning', type: 'num', kind: 'numerical',
    prompt: `On a fictional perceptual map of home coffee-machine brands, the attribute “easy to clean” has a loading of ${fx(FP.loading)} on Dimension 1, whose eigenvalue is ${fx(FP.eig)}. The brands’ mean ratings on it have a standard deviation of ${fx(FP.sd)} across the brands. With the map’s axes held fixed, by how much does a brand’s Dimension 1 score change if its mean “easy to clean” rating rises by ${fx(FP.dr, 1)} points? Give two decimal places.`,
    answer: r2(fpMove),
    check: () => (0.72 / Math.sqrt(3.24) / 0.6) * 1.2,
    unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(FP.loading * FP.dr), say: 'A loading is the attribute’s correlation with the dimension, not the score’s weight on the attribute. Divide it by √eigenvalue to get the weight, then by the standard deviation to work in rating points.' },
      { value: r2((FP.loading / Math.sqrt(FP.eig)) * FP.dr), say: `That uses the weight on the standardised rating. A rating point is not one standard deviation, so divide by the brands’ standard deviation, ${fx(FP.sd)}, as well.` },
      { value: r2((FP.loading / FP.eig / FP.sd) * FP.dr), say: `The weight divides the loading by the square root of the eigenvalue (${fx(Math.sqrt(FP.eig), 1)}), not by the eigenvalue itself.` },
      { value: r2((FP.loading / FP.sd) * FP.dr), say: `That forgets to turn the loading into a weight: divide by √eigenvalue = ${fx(Math.sqrt(FP.eig), 1)}.` },
    ],
    solution: `A brand’s score is a weighted sum of its standardised ratings, and the weight on an attribute is its loading ÷ √eigenvalue = ${fx(FP.loading)} ÷ ${fx(Math.sqrt(FP.eig), 1)} = ${fx(FP.loading / Math.sqrt(FP.eig), 1)}. One rating point is 1 ÷ ${fx(FP.sd)} standard deviations, so each point moves the brand ${fx(FP.loading / Math.sqrt(FP.eig), 1)} ÷ ${fx(FP.sd)} = ${fx(FP.loading / Math.sqrt(FP.eig) / FP.sd, 3)} along Dimension 1, and ${fx(FP.dr, 1)} points move it ${fx(fpMove)}. The move is on today’s axes; whether customers’ ratings really rise is a question for the next survey.`,
  },
];

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
