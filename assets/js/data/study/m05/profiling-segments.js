// profiling-segments.js — M05 · Profiling segments. Content only; exercises are in profiling-segments.ex.js.
// Lantern's five needs segments from case.js: names, indexes, means, centres, sizes and spend, cups, cross-tabs with
// their chi-square tests, ANOVA per need, loyalty, awareness and Cold Brew intent (DERIVED.segments), and the typing
// tool (DERIVED.typing). The golden-question table, the no-structure benchmark's F tests and the worked typing example
// are recomputed below with the same engines. TRUE_TYPE appears only in the "What Ana couldn't see" note. Pennacott
// Fitness, Vantley Outdoor and Kestrow Bank (with Eilidh Bisset) are fictional. Every printed figure is in `checks`.
import { NEEDS, LEVELS, RESPONDENTS, STUDY, DERIVED as D } from './case.js?v=15';
import { standardise, kmeans } from '../../../core/classify.js?v=15';
import { indexVsAverage } from '../../../core/market.js?v=15';
import { nearestCentroid, agreement } from '../../../core/percmap.js?v=15';
import { anova1 } from '../../../core/inference.js?v=15';
import { mulberry32 } from '../../../core/rng.js?v=15';

// ---------------------------------------------------------------- the five segments
const RS = RESPONDENTS, N = RS.length, P = NEEDS.length, K = D.segments.k;
const S = D.segments, NAMES = S.names, LAB = S.labels;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), OG = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => sum(a) / a.length;
const SZ = S.sizes;                                              // { n, share, spend, spendShare, perHead }
const COLS = NEEDS.map((_, j) => RS.map((r) => r.needs[j]));
const IXraw = indexVsAverage(COLS, LAB, K);                       // unrounded; S.index is rounded
const IX = S.index, MEANS = S.means, CENTRES = S.centres;
const MU = D.needs.means, SD = D.needs.sds;
const SPEND_ALL = sum(RS.map((r) => r.spend)), HEAD_ALL = SPEND_ALL / N;
const CUPS_ALL = mean(RS.map((r) => r.cups));
const valueRatio = (g) => SZ[g].spendShare / SZ[g].share;
const topTwo = (g) => IX[g].map((v, j) => ({ v, j })).sort((a, b) => b.v - a.v).slice(0, 2);
// cross-tabs: counts by segment and column totals
const CT = S.crosstabs, CHI = S.chi;
const colTot = (t) => t[0].map((_, l) => sum(t.map((row) => row[l])));
const share = (t, g, l) => t[g][l] / sum(t[g]);
const allShare = (t, l) => colTot(t)[l] / N;
const pc = (v, d = 1) => `${(Math.round(v * 10 ** (d + 2) * (1 + 1e-12)) / 10 ** d).toFixed(d)}%`;   // half up, consistently
const p0 = (v) => `${Math.round(v * 100)}%`;
const exUnder30 = share(CT.age, EX, 0), allUnder30 = allShare(CT.age, 0), exOfUnder30 = CT.age[EX][0] / colTot(CT.age)[0];
const clRich = (CT.income[CL][2] + CT.income[CL][3]) / SZ[CL].n, allRich = (colTot(CT.income)[2] + colTot(CT.income)[3]) / N;
const clCafe = share(CT.source, CL, 0), allCafe = allShare(CT.source, 0);
const vrHome = share(CT.source, VR, 1), allHome = allShare(CT.source, 1);
const ogOffice = share(CT.source, OG, 3), allOffice = allShare(CT.source, 3);
const ogRtd = share(CT.source, OG, 2), allRtd = allShare(CT.source, 2);
const miFamily = share(CT.household, MI, 2), allFamily = allShare(CT.household, 2);
const vrCentral = share(CT.area, VR, 4), allCentral = allShare(CT.area, 4);
const VS = Object.fromEntries(Object.entries(CHI).map(([k, c]) => [k, c.cramersV]));
const maxP = Math.max(...Object.values(CHI).map((c) => c.p));
// ANOVA per need: circular on the segmentation variables
const FS = S.anova.map((a, j) => ({ j, F: a.F, p: a.p })).sort((a, b) => b.F - a.F);
const Fmin = Math.min(...S.anova.map((a) => a.F)), Fmax = Math.max(...S.anova.map((a) => a.F));
// the no-structure benchmark from Cluster analysis (same seed): k-means still makes every random rating "significant"
const rnd = mulberry32(2027);
const NOISE = Array.from({ length: N }, () => Array.from({ length: P }, () => 1 + Math.floor(rnd() * 7)));
const NZ = standardise(Array.from({ length: P }, (_, j) => NOISE.map((r) => r[j]))).rows;
const NKM = kmeans(NZ, 5, { restarts: 20 });
const NF = Array.from({ length: P }, (_, j) => anova1(Array.from({ length: 5 }, (_, g) => NOISE.filter((_, i) => NKM.labels[i] === g).map((r) => r[j]))));
const nFmin = Math.min(...NF.map((a) => a.F)), nFmax = Math.max(...NF.map((a) => a.F)), nPmax = Math.max(...NF.map((a) => a.p));

// ---------------------------------------------------------------- the typing tool
const Z = standardise(COLS).rows;
const golden = (m) => FS.slice(0, m).map((x) => x.j).sort((a, b) => a - b);
const typeWith = (js) => nearestCentroid(CENTRES.map((c) => js.map((j) => c[j])), Z.map((r) => js.map((j) => r[j])));
const ACC = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((m) => [m, agreement(typeWith(golden(m)), LAB)]));
const LOW4 = FS.slice(4).map((x) => x.j).sort((a, b) => a - b);
const accLow4 = agreement(typeWith(LOW4), LAB);
const SHORT = D.typing.short, HO = D.typing.holdOut;
// a new café customer answers the four golden questions
const ANS = { 1: 2, 3: 6, 6: 7, 7: 5 };                           // price, sustainability, local, novelty
const zNew = SHORT.map((j) => (ANS[j] - MU[j]) / SD[j]);
const dNew = CENTRES.map((c) => SHORT.reduce((a, j, q) => a + (zNew[q] - c[j]) ** 2, 0));
const nearestNew = dNew.indexOf(Math.min(...dNew));
const dSorted = dNew.slice().sort((a, b) => a - b);
// the hold-out: segment the first 480, type the other 160 with those centres (all eight needs, then the four golden questions);
// the training segments' letters are matched to the full segmentation's on the training rows
const KMT = kmeans(Z.slice(0, HO.train), K, { restarts: 20 });
const perms = (n) => (n === 1 ? [[0]] : perms(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)])));
const MAP = perms(K).reduce((b, p) => { const a = agreement(KMT.labels.map((v) => p[v]), LAB.slice(0, HO.train)); return a > b.a ? { a, p } : b; }, { a: -1, p: null }).p;
const hold8 = agreement(nearestCentroid(KMT.centres, Z.slice(HO.train)).map((v) => MAP[v]), LAB.slice(HO.train));
const hold4 = agreement(nearestCentroid(KMT.centres.map((c) => SHORT.map((j) => c[j])), Z.slice(HO.train).map((r) => SHORT.map((j) => r[j]))).map((v) => MAP[v]), LAB.slice(HO.train));
// the same hold-out without leaks: standardise, segment and rank the needs on the training rows alone, then type the test rows
function leakFree(train, test) {
  const st = standardise(COLS.map((c) => train.map((i) => c[i])));
  const zOf = (i) => COLS.map((c, j) => (c[i] - st.mu[j]) / st.s[j]);
  const km = kmeans(st.rows, K, { restarts: 20 });
  const gold = NEEDS.map((_, j) => ({ j, F: anova1(Array.from({ length: K }, (_, g) => train.filter((_, q) => km.labels[q] === g).map((i) => COLS[j][i]))).F }))
    .sort((a, b) => b.F - a.F).slice(0, 4).map((x) => x.j).sort((a, b) => a - b);
  const map = perms(K).reduce((b, p) => { const a = agreement(km.labels.map((v) => p[v]), train.map((i) => LAB[i])); return a > b.a ? { a, p } : b; }, { a: -1, p: null }).p;
  const typed = nearestCentroid(km.centres.map((c) => gold.map((j) => c[j])), test.map((i) => { const z = zOf(i); return gold.map((j) => z[j]); })).map((v) => map[v]);
  return { acc: agreement(typed, test.map((i) => LAB[i])), gold };
}
const IDX = Array.from({ length: N }, (_, i) => i);
const LF = leakFree(IDX.slice(0, HO.train), IDX.slice(HO.train));
const holdMoe = 1.96 * Math.sqrt((LF.acc * (1 - LF.acc)) / HO.test);
// which 160 are held back matters: 40 random 480/160 splits (seeded), done the same leak-free way
const rsp = mulberry32(480160);
const shuffleIdx = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rsp() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const SPLITS = Array.from({ length: 40 }, () => { const sh = shuffleIdx(IDX); return leakFree(sh.slice(0, HO.train).sort((a, b) => a - b), sh.slice(HO.train).sort((a, b) => a - b)).acc; });
const splitMean = mean(SPLITS), splitSd = Math.sqrt(sum(SPLITS.map((v) => (v - splitMean) ** 2)) / (SPLITS.length - 1));
const atOrBelow = SPLITS.filter((v) => v <= LF.acc + 1e-12).length;
// the in-sample tool (all 640) on the same 160 held-back respondents
const full160 = agreement(nearestCentroid(CENTRES.map((c) => SHORT.map((j) => c[j])), Z.slice(HO.train).map((r) => SHORT.map((j) => r[j]))), LAB.slice(HO.train));
// every set of four needs, in sample: the F ranking is a heuristic
const SETS = []; for (let a = 0; a < P; a++) for (let b = a + 1; b < P; b++) for (let c = b + 1; c < P; c++) for (let d = c + 1; d < P; d++) SETS.push([a, b, c, d]);
const SETACC = SETS.map((js) => ({ js, acc: agreement(typeWith(js), LAB) })).sort((x, y) => y.acc - x.acc);
const topFRank = SETACC.findIndex((x) => x.js.join() === golden(4).join()) + 1;
const BEST4 = SETACC[0];

// ---------------------------------------------------------------- examples (fictional)
// Pennacott Fitness: one of four member segments, on four of its six needs
const TF = { members: 500, seg: 128, needs: ['Class variety', 'Opening hours', 'Price', 'Personal training'], overall: [4.2, 4.8, 4.5, 3.4], segMean: [6.1, 4.6, 3.2, 3.6] };
const tfIx = TF.overall.map((m, j) => (TF.segMean[j] / m) * 100);
// Vantley Outdoor: a typing tool with three golden questions
const VO = { names: ['Technical', 'Style', 'Value'], qs: ['Waterproof performance', 'Fashion', 'Low price'], mu: [4.8, 3.9, 4.2], sd: [1.5, 1.6, 1.4],
  centres: [[1.1, -0.6, -0.5], [-0.4, 1.2, -0.3], [-0.5, -0.4, 0.9]], answers: [6, 5, 3] };
const voZ = VO.answers.map((x, j) => (x - VO.mu[j]) / VO.sd[j]);
const voD = VO.centres.map((c) => c.reduce((a, v, j) => a + (voZ[j] - v) ** 2, 0));
const voBest = voD.indexOf(Math.min(...voD));
const voOwn = VO.answers.map((x, _, a) => x - mean(a));          // the slip: centring on her own answers
// Kestrow Bank (application)
const KB = { customers: 2400, needs: 9, segs: 6, golden: 5, holdout: 600, acc: 0.88, rerun: 2 };

// ---------------------------------------------------------------- formatting
const minus = (t) => t.replace(/^-/, '−');
const f1 = (v) => minus(v.toFixed(1)), f2 = (v) => minus(v.toFixed(2)), f3 = (v) => minus(v.toFixed(3));
const money = (v) => `$${v.toFixed(2)}`;
const SEG_ORDER = [VR, OG, EX, CL, MI];

export default {
  slug: 'profiling-segments',
  title: 'Profiling segments',
  blurb: 'Turn a cluster solution into segments a business can use: profile them with indexes against the average, name them honestly, describe who they are and what they buy with cross-tabs and B04’s tests, size them in people and in spend, judge what an opt-in panel can say about sizes, and build a typing tool that assigns new customers from a few golden questions.',
  status: 'draft',
  objectives: [
    'Calculate a segment’s index against the average and read an index table beside the segment means and centres.',
    'Name segments from their profiles without over-claiming, and explain why tests on the segmentation variables prove nothing.',
    'Describe segments by demographics and behaviour with cross-tabs, chi-square tests and Cramér’s V.',
    'Calculate each segment’s share of respondents, share of spend and spend per head, in Excel with AVERAGEIFS and SUMIFS.',
    'Assess what segment sizes from an opt-in panel with quotas can and can’t say about the population.',
    'Build and test a typing tool that assigns new customers to the nearest segment centre from a few golden questions, measuring its accuracy on a hold-out.',
  ],
  prerequisites: [
    { lesson: 'm05/cluster-analysis', why: 'The five segments, their centres in standardised units and the squared Euclidean distance come from there.' },
    { lesson: 'm04/analysing-survey-data', why: 'Cross-tabs percentaged within each category of the explanatory variable, and bases.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The chi-square test of independence and Cramér’s V describe how segments differ by age, income and the rest.' },
    { lesson: 'b04/anova', why: 'The F statistic ranks which needs separate the segments most.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'AVERAGEIFS, SUMIFS and COUNTIFS build every profile table here.' },
    { lesson: 'm04/sampling-methods', why: 'Opt-in panels and quota samples, and why they are not probability samples.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s analyst has handed over five segments from the May 2027 needs study, lettered by size: ${SZ.map((s) => s.n).join(', ')} of the ${N} respondents. To Ana they are five letters. Before she can choose which segments Lantern’s cafés, beans and the new Cold Brew should serve, she needs five answers about each: what it wants, what to call it, who is in it, how much it spends on coffee, and how to tell which segment a new customer belongs to.` },
    { p: 'Answering those questions has two parts. <g>Profiling</g> a segment describes it on the segmentation variables, the needs that formed it; describing a segment uses other information, its <g>descriptor variables</g>: demographics, behaviour, media use, awareness of the brand. Dolnicar, Grün and Leisch treat them as separate steps of a segmentation analysis, because they answer different questions: profiling says what a segment wants, describing says who its members are and how to reach them.' },

    { h: 'The index against the average' },
    { p: String.raw`A segment’s profile is easiest to read as an <g>index against the average</g> respondent, or index for short: the segment’s mean on a need, divided by the overall mean, times 100. Craft and local segment members rate “from a local, independent business” ${f2(MEANS[CL][6])} on average, against ${f2(MU[6])} for all ${N}, an index of <m>${f2(MEANS[CL][6])} \div ${f2(MU[6])} \times 100 = ${IX[CL][6]}</m>. An index of 100 means the segment is average on that need; above 100, the need matters more to it than to the average respondent; below 100, less. Analysts often treat indexes above about 120 or below about 80 as notable, but that is a convention, not a test.` },
    { table: {
      caption: `Lantern’s five segments: each need’s index against the average respondent (100 = average). Base: ${N} respondents; the segments’ names are explained below.`,
      head: ['Need', ...SEG_ORDER.map((g) => NAMES[g])],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: NEEDS.map((n, j) => [n.label, ...SEG_ORDER.map((g) => String(IX[g][j]))]),
      foot: [['Respondents', ...SEG_ORDER.map((g) => String(SZ[g].n))]],
    } },
    { p: `Each row averages to 100 when the segments are weighted by their size, because the overall mean is the size-weighted mean of the segment means. So no segment can be above average on everything: Value routine’s ${IX[VR][1]} on price comes with indexes of ${IX[VR][7]} on novelty and ${IX[VR][6]} on local, and Mindful’s ${IX[MI][5]} on health with ${IX[MI][4]} on energy. A profile is a pattern of highs and lows, and the lows describe a segment as much as the highs.` },

    { h: 'Naming segments honestly' },
    { p: 'A name is the shorthand everyone will use for a segment for years, so it should say what the profile shows and nothing more. Name a needs segment by its highest indexes, in words customers would recognise, and check the name against the lows. Lantern’s five:' },
    { list: SEG_ORDER.map((g) => {
      const t = topTwo(g);
      const why = { [VR]: 'a low price first, convenience second; well below average on novelty, local and sustainability', [OG]: 'a strong caffeine kick and convenience', [EX]: 'new and interesting flavours, with taste a little above average', [CL]: 'local and independent, and taste and quality; above average on novelty and sustainability too', [MI]: 'health and sustainability; low on energy' }[g];
      return `<b>${NAMES[g]}</b> (${SZ[g].n}): ${why}. Highest indexes: ${NEEDS[t[0].j].label.toLowerCase()} ${t[0].v}, ${NEEDS[t[1].j].label.toLowerCase()} ${t[1].v}.`;
    }) },
    { p: `Names go wrong when they claim more than the needs show. “Young explorers” would bake in an age that ${pc(1 - exUnder30, 0)} of the segment don’t have. “Lantern loyalists” for Craft and local would be false: only ${pc(S.aware[CL], 1)} of them know Lantern. Names that judge (“coffee snobs”, “cheapskates”) colour every later decision about a group of customers. And no name should suggest a segment is a different kind of person rather than a group whose answers are similar, with edges that overlap.` },

    { h: 'Who they are and what they do' },
    { p: `Cross-tabulating segment by each descriptor, and percentaging within each segment as <i>Analysing survey data</i> taught, turns the needs segments into groups Lantern can find. Explorers are young: ${pc(exUnder30)} are aged 18–29, against ${pc(allUnder30)} of all respondents. Craft and local are the café-goers (${pc(clCafe)} mostly buy from a café, against ${pc(allCafe)}) and the best-off (${pc(clRich)} have household incomes over $80,000, against ${pc(allRich)}). Half of Value routine (${pc(vrHome)}, against ${pc(allHome)}) mostly brew at home. On the go buy from supermarkets and ready-to-drink cans (${pc(ogRtd)}, against ${pc(allRtd)}) or at the office (${pc(ogOffice)}, against ${pc(allOffice)}), and Mindful are more often families with children (${pc(miFamily)}, against ${pc(allFamily)}).` },
    { table: {
      caption: `What the segments do: means and percentages within each segment. Base: ${N} respondents (all), unweighted.`,
      head: ['Measure (all)', ...SEG_ORDER.map((g) => NAMES[g])],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        [`Cups a week (${f1(CUPS_ALL)})`, ...SEG_ORDER.map((g) => f1(S.cups[g]))],
        [`Spend per head a month ($${f2(HEAD_ALL)})`, ...SEG_ORDER.map((g) => money(SZ[g].perHead))],
        [`Local loyalty, 1–5 (${f2(D.loyalty.mean)})`, ...SEG_ORDER.map((g) => f2(S.loyalty[g]))],
        [`Know Lantern (${pc(D.aware)})`, ...SEG_ORDER.map((g) => pc(S.aware[g]))],
        [`Cold Brew, top two boxes (${pc(D.coldbrewTop2)})`, ...SEG_ORDER.map((g) => pc(S.coldbrewTop2[g]))],
      ],
    } },
    { p: `The behaviour fits the needs, which is a sign the segments are real enough to use: the convenience-driven drink the most cups, the price-driven spend the least, and the segment that values local businesses scores highest on the local-loyalty scale and knows Lantern best. It also holds a tension for later lessons. Cold Brew’s strongest intent is in Craft and local (${pc(S.coldbrewTop2[CL])}), Lantern’s natural customers, and On the go (${pc(S.coldbrewTop2[OG])}), who want convenience Lantern is weak on.` },

    { h: 'How big: people and spend' },
    { p: `A segment has two sizes: its share of the respondents and its share of what they spend. The <g>share of spend</g> is the segment’s total monthly spend divided by everyone’s; <g>spend per head</g> is the segment’s total divided by its respondents. Craft and local are ${pc(SZ[CL].share)} of respondents but account for ${pc(SZ[CL].spendShare)} of their spend, at ${money(SZ[CL].perHead)} per head against ${money(HEAD_ALL)} for everyone; Value routine are ${pc(SZ[VR].share)} of respondents and ${pc(SZ[VR].spendShare)} of spend. Sizing tests whether a segment is substantial, one of the ADAMS criteria in OpenStax’s list (accessible, differentiable, actionable, measurable and substantial) that module 1 applied; the profiles and descriptors test the others.` },
    { table: {
      caption: `Segment sizes in people and in monthly coffee spend (respondents’ own estimates). Base: ${N} respondents, $${SPEND_ALL.toLocaleString('en-US')} a month in all.`,
      head: ['Segment', 'Respondents', 'Share of respondents', 'Share of spend', 'Spend per head', 'Spend share ÷ respondent share'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: SEG_ORDER.map((g) => [NAMES[g], String(SZ[g].n), pc(SZ[g].share), pc(SZ[g].spendShare), money(SZ[g].perHead), f2(valueRatio(g))]),
      foot: [['All', String(N), '100%', '100%', money(HEAD_ALL), '1.00']],
    } },
    { callout: 'key', title: 'Two sizes, one caution', html: `Shares of respondents and shares of spend rank the segments differently, and both matter: one says how many customers a segment offers, the other how much money. Neither is yet a share of Harbour City. The study is an opt-in panel with quotas on age only, so these are shares of ${N} panel members; In depth explains what that allows Ana to say.` },
  ],

  theory: [
    { h: 'Indexes, means and centres' },
    { p: `A profile can be shown three ways, and each answers a slightly different question. Segment means (Craft and local’s ${f2(MEANS[CL][6])} on local) stay on the questionnaire’s 1–7 scale. Indexes (${IX[CL][6]}) compare with the average respondent. Centres in standardised units, the k-means centres of <i>Cluster analysis</i>, say how many standard deviations the segment sits from the average (+${f2(CENTRES[CL][6])} on local), which puts every need on the same footing.` },
    { p: `Indexes are made for quantities with a true zero, such as spend, counts and shares: “Craft and local spend ${Math.round((SZ[CL].perHead / HEAD_ALL) * 100)}% of the average a head” means what it says. A 1–7 rating has no true zero, so the same gap in points gives a bigger index where the average is low: one point above average is an index of ${Math.round(((MU[5] + 1) / MU[5]) * 100)} on health (mean ${f2(MU[5])}) but ${Math.round(((MU[0] + 1) / MU[0]) * 100)} on taste (mean ${f2(MU[0])}). Read rating indexes beside the means or the centres, and compare them across segments on one need more readily than across needs.` },

    { h: 'Profiling is not testing' },
    { p: `It is tempting to run a one-way ANOVA (B04) on each need and report that the segments “differ significantly”. They do: the F statistics run from ${f1(Fmin)} to ${f1(Fmax)}. But k-means chose the segments to make these very means differ, so the test’s assumption, that the groups were fixed before the data were seen, fails, and the p-values mean nothing. The proof is the no-structure benchmark from <i>Cluster analysis</i>: on ${N} made-up respondents with random ratings, k-means’ five segments give F statistics from ${f1(nFmin)} to ${f1(nFmax)} on the random ratings, every one with p below 0.000001.` },
    { p: `The F statistics are still useful as a ranking of which needs separate the segments most: novelty (${f1(FS[0].F)}), local (${f1(FS[1].F)}), sustainability (${f1(FS[2].F)}) and price (${f1(FS[3].F)}) lead, and taste (${f1(S.anova[0].F)}) separates them least. That ranking is a quick way to choose the golden questions, with a limit shown below.` },

    { h: 'Testing descriptors' },
    { p: `Tests on descriptor variables are legitimate, because the segments were not formed from them. The <g>test of independence</g> of B04 on each cross-tab of segment by a descriptor gives p below 0.001 for all five here, and <g>Cramér’s V</g> measures how strong each link is: ${f2(VS.source)} for main source, ${f2(VS.age)} for age, ${f2(VS.income)} for income, ${f2(VS.household)} for household and ${f2(VS.area)} for region. They run from weak (region, ${f2(VS.area)}) to moderate (main source, ${f2(VS.source)}); as module 1 noted, V has no universal cut-offs, so read them as associations, not rules.` },
    { p: `Three cautions apply. The sample is not a probability sample, so a p-value says the pattern is unlikely to be chance among people like these respondents, not that it holds in Harbour City. Testing many descriptors invites false positives, as B04’s multiple-testing warning explained, so choose the few that matter before looking. And a strong link still leaves a segment mixed: ${pc(exUnder30, 0)} of Explorers are under 30, but Explorers are only ${pc(exOfUnder30, 0)} of the under-30s, so marketing to under-30s would mostly reach other segments. Demographics describe and help reach a needs segment; they rarely define it, which is why module 1 found needs harder to reach.` },

    { h: 'Sizing in people and in spend' },
    { p: `The share of spend and spend per head come from the same totals: a segment’s share of spend divided by its share of respondents equals its spend per head divided by the average (${f2(valueRatio(CL))} for Craft and local, ${f2(valueRatio(VR))} for Value routine). Spend here is each respondent’s estimate of their monthly coffee spend, a recall question with the measurement error <i>Survey error</i> described, so the shares are better than the dollar totals. Per head, Craft and local spend ${money(SZ[CL].perHead)} a month, nearly three times Value routine’s ${money(SZ[VR].perHead)}, though Value routine drink more cups (${f1(S.cups[VR])} a week against ${f1(S.cups[CL])}).` },

    { h: 'Is the sample representative?' },
    { p: `The ${N} respondents came from an <g>opt-in panel</g>, filled to <g>quota sample</g> targets on age band. The quotas make the age mix match Ana’s targets; they do nothing for income, region or the needs themselves, and within each age band the people are those who joined a panel and chose to answer. The AAPOR task force on online panels advised researchers to avoid non-probability online panels when one of the objectives is to estimate population values accurately (Baker et al., 2010). A panel’s members may, for example, be keener on novelty than the city as a whole, which would overstate the Explorers.` },
    { p: `So Ana can say “about a fifth of the coffee drinkers in our study were Explorers”, not “a fifth of Harbour City’s coffee drinkers are Explorers”. She can check the sizes against other evidence (Lantern’s own sales by café, income figures for Harbour City), weight to known population totals as <i>Survey error</i> showed, knowing that weighting can’t fix self-selection within a weighting cell, and treat any market size built from the shares, with <i>Market sizing</i>’s methods, as a planning range. The profiles are more robust than the sizes: what Explorers want is less likely to be distorted by the panel than how many there are.` },

    { h: 'The typing tool' },
    { p: String.raw`A segmentation is only useful if new customers can be placed in it. A <g>typing tool</g> assigns a new respondent to a segment: transform their answers exactly as the study did, which for Ana means standardising with the study’s means and standard deviations, compute the squared Euclidean distance to every segment centre, and choose the nearest. Asking all eight needs in a café or a sign-up form is too long, so analysts use a few <g>golden questions</g>, chosen because they separate the segments best. Bock describes choosing them empirically, with a classification method such as discriminant analysis, and notes the trade-off: fewer questions, lower accuracy. Here the F ranking does the choosing, as a quick first cut.` },
    { table: {
      caption: `How many golden questions? Share of the ${N} respondents the nearest-centre typing tool puts in the same segment as all eight needs do, using the needs with the highest F statistics.`,
      head: ['Golden questions', 'Needs used', 'Same segment as all eight'],
      align: ['r', 'l', 'r'],
      rows: [1, 2, 3, 4, 5, 6, 7, 8].map((m) => [String(m), golden(m).map((j) => NEEDS[j].label).join(', '), pc(ACC[m])]),
    } },
    { p: `Four questions (price, sustainability, local and novelty) place ${pc(ACC[4])} of respondents, ${Math.round(ACC[4] * N)} of ${N}, in the same segment as all eight; the four needs with the lowest F statistics place only ${pc(accLow4)}. But ranking needs one at a time by F ignores how the needs overlap, and price, health and energy have nearly equal F statistics (${f1(S.anova[1].F)}, ${f1(S.anova[5].F)} and ${f1(S.anova[4].F)}). Of all ${SETS.length} sets of four needs, the top-F four rank ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][topFRank]}; ${BEST4.js.map((j) => NEEDS[j].key).join(', ').replace(/, ([^,]+)$/, ' and $1')} do best (${pc(BEST4.acc)}). That is why Bock recommends a classification method that judges the questions together. Ana keeps the top-F four, close to the best and easy to explain.` },
    { p: `Accuracy belongs on people the segmentation never saw, a <g>test set</g> in B02’s language, and nothing fitted to the tool may use them: not the segments, the means and standard deviations, or the choice of questions. Ana’s analyst segmented the first ${HO.train} respondents (the <g>training set</g>), standardised and ranked the needs on them alone (the same four questions came out on top) and typed the other ${HO.test}: ${Math.round(LF.acc * HO.test)} of ${HO.test} (${pc(LF.acc)}) landed in the same segment as in the segmentation of all ${N}. Standardising with all ${N} and taking the four questions from the full analysis would have given ${Math.round(hold4 * HO.test)} (${pc(hold4)}), so the leak hardly matters here, and on all eight needs every one of the ${HO.test} matched: the centres themselves are stable. The figure to report for the tool is ${pc(LF.acc)}.` },
    { p: `Keep it in proportion. A hold-out of ${HO.test} is uncertain by about ±${f1(holdMoe * 100)} points, and which ${HO.test} are held back matters: across ${SPLITS.length} random splits of ${HO.train} and ${HO.test}, done the same way, the hold-out figure averaged ${pc(splitMean)} (standard deviation ${f1(splitSd * 100)} points, from ${pc(Math.min(...SPLITS))} to ${pc(Math.max(...SPLITS))}), so Ana’s split is typical. The in-sample ${pc(ACC[4])} flatters the tool, but only slightly here: on the same ${HO.test} respondents, the tool built from all ${N} places ${Math.round(full160 * HO.test)} (${pc(full160)}). All these figures measure agreement with the full segmentation, not with any truth, and one research agency reports that typing tools’ accuracy ranges widely, from about 40% to 90% (Horn, n.d.). New customers answering at a till may also answer differently from panel members at home, so Ana will check the tool again on real customers.` },
    { callout: 'note', title: 'What Ana couldn’t see', html: `Against the five planted kinds of coffee drinker in the case, typing the ${HO.test} held-back respondents on all eight needs with the first ${HO.train}’s centres places ${pc(HO.againstTruth)} of them (${Math.round(HO.againstTruth * HO.test)} of ${HO.test}) in the kind they were generated from. No real study has that answer key.` },

    { h: 'The segment report' },
    { p: 'The usual deliverable is a one- or two-page report for each segment, built so that someone who never saw the analysis can use it. Dolnicar, Grün and Leisch stress that statistics are no substitute for the judgement of the people who will use the segments, and the report is what they judge from. Each report should give:' },
    { list: [
      'The name, and one sentence on what the segment wants, from its profile.',
      'Its size in respondents and in spend, with the base and what the sample allows (shares of the study, not of the city).',
      'The index profile on every need, the lows as well as the highs.',
      'Who is in it and what they do: the descriptors that differ most, as percentages with the overall figure beside them.',
      'How to reach it (where it buys, the media it uses, if asked) and how to recognise it: the golden questions and the typing tool’s accuracy.',
      'What isn’t known: overlap with other segments, small bases, and the panel’s limits.',
    ] },
  ],

  formulas: [
    { id: 'ps-index', name: 'Index against the average',
      tex: String.raw`I_{gj} = \dfrac{\bar{x}_{gj}}{\bar{x}_{j}} \times 100`,
      where: [
        [String.raw`I_{gj}`, 'Index of segment g on variable j: 100 = the average respondent', ''],
        [String.raw`\bar{x}_{gj}`, 'Mean of segment g on variable j (a rating, spend, a 0/1 share)', 'units of j'],
        [String.raw`\bar{x}_{j}`, 'Mean of all respondents on variable j', 'units of j'],
      ],
      assumptions: 'Most meaningful for quantities with a true zero (spend, counts, shares); on rating scales, read beside the means.',
      note: 'The size-weighted average of a variable’s indexes is 100. In Excel: <x>=AVERAGEIFS(O$2:O$641,$B$2:$B$641,$R2)/AVERAGE(O$2:O$641)*100</x>.' },
    { id: 'ps-spend-share', name: 'Share of spend and spend per head',
      tex: String.raw`\text{Share of spend}_g = \dfrac{S_g}{S}, \qquad \text{Spend per head}_g = \dfrac{S_g}{n_g}, \qquad \dfrac{S_g / S}{n_g / n} = \dfrac{S_g / n_g}{S / n}`,
      where: [
        [String.raw`S_g`, 'Total spend of segment g’s respondents', '$'],
        [String.raw`S`, 'Total spend of all respondents', '$'],
        [String.raw`n_g`, 'Respondents in segment g', 'respondents'],
        [String.raw`n`, 'All respondents', 'respondents'],
      ],
      note: 'The ratio on the right is above 1 when a segment spends more per head than average. Excel: <x>=SUMIFS(H$2:H$641,$B$2:$B$641,$R2)/SUM(H$2:H$641)</x> and <x>=AVERAGEIFS(H$2:H$641,$B$2:$B$641,$R2)</x>.' },
    { id: 'ps-typing', name: 'Typing a new respondent (nearest centre)',
      tex: String.raw`z_{j} = \dfrac{x_{j} - \bar{x}_{j}}{s_{j}}, \qquad g^{*} = \arg\min_{g} \sum_{j \in Q} (z_{j} - c_{gj})^2`,
      where: [
        [String.raw`x_{j}`, 'The new respondent’s answer to golden question j', 'scale points'],
        [String.raw`\bar{x}_{j},\ s_{j}`, 'Mean and standard deviation of j in the original study (stored with the tool)', 'scale points'],
        [String.raw`z_{j}`, 'The answer standardised with the study’s mean and standard deviation', 'standard deviations'],
        [String.raw`c_{gj}`, 'Centre of segment g on variable j, in standardised units', 'standard deviations'],
        [String.raw`Q`, 'The golden questions', ''],
        [String.raw`g^{*}`, 'The segment the respondent is assigned to: the nearest centre', ''],
      ],
      assumptions: 'New respondents answer the golden questions in the same wording and scale as the study.',
      note: 'Accuracy = the share of a hold-out sample assigned to the same segment as the full segmentation.' },
  ],

  examples: [
    { level: 'simple', title: 'Profiling and naming a gym segment', fictional: true,
      setup: `Pennacott Fitness segmented ${TF.members} members into four segments. Segment C has ${TF.seg} members. The table gives its mean rating on four of the six needs and every member’s mean. Work out the indexes and choose a name.`,
      table: {
        caption: 'Pennacott Fitness: segment C against all members (ratings 1–7, fictional)',
        head: ['Need', 'Segment C mean', 'All members’ mean'],
        align: ['l', 'r', 'r'],
        rows: TF.needs.map((n, j) => [n, f1(TF.segMean[j]), f1(TF.overall[j])]),
      },
      steps: [
        `Class variety: 6.1 ÷ 4.2 × 100 = ${Math.round(tfIx[0])}. Opening hours: 4.6 ÷ 4.8 × 100 = ${Math.round(tfIx[1])}. Price: 3.2 ÷ 4.5 × 100 = ${Math.round(tfIx[2])}. Personal training: 3.6 ÷ 3.4 × 100 = ${Math.round(tfIx[3])}.`,
        `Read the pattern: class variety is far above average (${Math.round(tfIx[0])}), price well below (${Math.round(tfIx[2])}), opening hours and personal training close to average.`,
        'Name from the highs and check against the lows: “Class lovers” or “Variety seekers” says what the profile shows. “Premium members” would claim a willingness to pay that a low price index hints at but no question measured; “Young and social” would claim an age and a motive that weren’t segmentation variables.',
        `Size: ${TF.seg} of ${TF.members} members, ${pc(TF.seg / TF.members)} of the members surveyed.`,
      ],
      answer: `Indexes ${tfIx.map((v) => Math.round(v)).join(', ')} for class variety, opening hours, price and personal training. A name such as “Class lovers” fits; check spend and age from the membership records before saying more.`,
      interpretation: 'The name now carries the profile into every meeting: classes matter most to this segment and price least. Whether they are also young, or spend more, is for the descriptors to show, not the name to assume.' },
    { level: 'challenging', title: 'Typing a new customer, and a close call', fictional: true,
      setup: `Vantley Outdoor, a clothing retailer, segmented its customers into three segments and built a typing tool from three golden questions, each rated 1–7. A new customer answers ${VO.answers.join(', ')} to ${VO.qs.map((q) => q.toLowerCase()).join(', ')}. Assign her, and say how confident Vantley can be.`,
      table: {
        caption: 'Vantley Outdoor: the typing tool’s stored values (fictional)',
        head: ['', ...VO.qs],
        align: ['l', 'r', 'r', 'r'],
        rows: [['Study mean', ...VO.mu.map(f1)], ['Study standard deviation', ...VO.sd.map(f1)], ...VO.names.map((n, g) => [`Centre: ${n}`, ...VO.centres[g].map(f1)])],
      },
      steps: [
        `Standardise each answer with the study’s mean and standard deviation: (6 − 4.8) ÷ 1.5 = ${f2(voZ[0])}, (5 − 3.9) ÷ 1.6 = ${f2(voZ[1])} and (3 − 4.2) ÷ 1.4 = ${f2(voZ[2])}.`,
        `Squared distance to Technical: (${f2(voZ[0])} − 1.1)² + (${f2(voZ[1])} + 0.6)² + (${f2(voZ[2])} + 0.5)² = ${f2(voD[0])}. To Style: ${f2(voD[1])}. To Value: ${f2(voD[2])}.`,
        `The nearest centre is ${VO.names[voBest]} (${f2(voD[voBest])}), but Style (${f2(voD[1])}) is almost as near: she likes performance and fashion, and sits between the two segments.`,
        `The tool must transform her answers exactly as the study transformed its respondents’: here, standardised with the study’s stored means and standard deviations and nothing else. Centring her answers on her own average instead (${voOwn.map((v) => f2(v)).join(', ')}) would put them on a different footing from the centres, throwing away how high or low her ratings are compared with other customers.`,
      ],
      answer: `Technical, by a narrow margin (${f2(voD[0])} against ${f2(voD[1])} for Style).`,
      interpretation: 'Customers near a boundary are where typing tools go wrong, and with three questions there are many of them. Vantley could store the margin between the nearest and second-nearest centre and treat close calls as uncertain, for example by asking one more golden question or by not personalising offers for them until their purchases say more.' },
    { level: 'applied', title: 'Placing a new Lantern customer and sizing her segment', fictional: true,
      setup: `A customer in one of Lantern’s cafés answers the four golden questions: ${ANS[1]} for a low price, ${ANS[3]} for sustainability, ${ANS[6]} for a local independent business and ${ANS[7]} for new flavours. Which segment does the typing tool put her in, and what does that segment mean for Lantern?`,
      steps: [
        `Standardise with the study’s means and standard deviations: price (${ANS[1]} − ${f2(MU[1])}) ÷ ${f2(SD[1])} = ${f2(zNew[0])}; sustainability (${ANS[3]} − ${f2(MU[3])}) ÷ ${f2(SD[3])} = ${f2(zNew[1])}; local (${ANS[6]} − ${f2(MU[6])}) ÷ ${f2(SD[6])} = ${f2(zNew[2])}; novelty (${ANS[7]} − ${f2(MU[7])}) ÷ ${f2(SD[7])} = ${f2(zNew[3])}.`,
        `Squared distances to the five centres on those four needs: ${SEG_ORDER.map((g) => `${NAMES[g]} ${f2(dNew[g])}`).join(', ')}.`,
        `The nearest is ${NAMES[nearestNew]} (${f2(dSorted[0])}), well clear of the next (${f2(dSorted[1])}): not a close call.`,
        `Her segment: ${pc(SZ[CL].share)} of the study’s respondents and ${pc(SZ[CL].spendShare)} of their coffee spend, ${money(SZ[CL].perHead)} per head a month (${f2(valueRatio(CL))} times the average), ${pc(clCafe)} mostly buy from cafés, and ${pc(S.coldbrewTop2[CL])} say they would definitely or probably buy Cold Brew.`,
      ],
      answer: `${NAMES[nearestNew]}, the segment that puts local, independent businesses and taste first: the most valuable per head in the study.`,
      interpretation: 'The typing tool turns a short in-café question card into a segment, and the segment report turns the segment into what Lantern knows about her kind of customer. Whether Lantern should serve this segment above the others, and how, is the question of the targeting lessons.' },
  ],

  demo: [
    { widget: 'ps-sheet', intro: `All ${N} respondents with their segment in column B. In the summary area (R to X), count each segment’s respondents with COUNTIF, its mean local rating with AVERAGEIFS, the index (mean ÷ the overall mean × 100), its share of spend with SUMIFS ÷ SUM and its spend per head with AVERAGEIFS. Craft and local’s local index should come to ${IX[CL][6]} and its share of spend to ${pc(SZ[CL].spendShare)}.` },
    { widget: 'ps-pivot', intro: 'The same respondents as a PivotTable. Start with Segment in Rows and Main source in Columns, shown as % of Row Total: each segment’s row adds to 100%. Then try Age and Income in Columns, Average of Spend a month or Cups a week as the value, and Average of Cold Brew top two for each segment’s intent.' },
  ],

  mistakes: [
    { title: '“The segments differ significantly on every need, so they are real.”', html: `k-means formed the segments to differ on those needs, so the tests are circular: random ratings clustered the same way give F statistics from ${f1(nFmin)} to ${f1(nFmax)}, all “significant”. Use the F statistics only to rank which needs separate the segments, and test descriptors instead.` },
    { title: '“An index of 168 means the segment cares 68% more.”', html: `On a 1–7 rating scale with no true zero, an index exaggerates differences on needs with low averages. It means the segment’s mean rating is 1.68 times the overall mean; read it beside the means (${f2(MEANS[MI][5])} against ${f2(MU[5])} for Mindful on health) or the centres.` },
    { title: '“Name the segment after its typical member.”', html: `A segment is a group with similar needs, not a type of person. Names that add an age, an income or a loyalty the needs didn’t measure (“Young explorers”, “Lantern loyalists”) mislead: ${pc(1 - exUnder30, 0)} of Explorers are 30 or older, and ${pc(1 - S.aware[CL], 0)} of Craft and local don’t know Lantern.` },
    { title: '“A fifth of the city are Explorers.”', html: 'The shares come from an opt-in panel with age quotas: they are shares of the study’s respondents. Quotas fix age, nothing else. State the base, cross-check with other evidence, and treat population sizes built on them as ranges.' },
    { title: '“The typing tool is 92.5% accurate.”', html: `${pc(ACC[4])} is how often four golden questions agree with all eight needs on the study’s own respondents. On a hold-out that nothing in the tool was fitted to, it is ${pc(LF.acc)}, uncertain by about ±${f1(holdMoe * 100)} points, and even that measures agreement with the full segmentation rather than truth; customers answering at a till may answer differently again.` },
    { title: '“A new customer’s answers can be prepared however is convenient.”', html: 'The tool must transform new answers exactly as the study did, or they won’t be comparable with the centres. For Ana that means standardising with the study’s stored means and standard deviations; centring a customer on her own average, or standardising against the day’s other customers, puts her on a different footing and can move her to the wrong segment.' },
  ],

  application: [
    { case: `Kestrow Bank, a fictional regional bank, segmented ${KB.customers.toLocaleString('en-US')} current-account customers on ${KB.needs} banking needs into ${KB.segs} segments. Its customer-insight manager, Eilidh Bisset, had two months to turn the analysis into something the bank’s branch, digital and marketing teams would use.` },
    { p: '<b>She wrote one report per segment, to a fixed template.</b> Each opens with the name and a sentence on what the segment wants, then the index profile with the lows as visible as the highs, then the descriptors from the bank’s own records: age band, products held, branch visits and app logins, as percentages beside the all-customer figure. Because the survey had been sent to a random sample of account holders and weighted to the customer base, she could give segment sizes as shares of customers, with margins of error; the bank’s records then gave each segment’s balances and fee income directly.' },
    { p: '<b>She tested the names with the people who would use them.</b> Branch managers objected to “Branch traditionalists” for a segment whose highest index was face-to-face advice: many of its members also used the app every week. The segment became “Advice seekers”, which said what the profile showed and nothing about how the members bank.' },
    { p: `<b>She built the typing tool into account opening.</b> ${KB.golden} golden questions, chosen by how strongly each separated the segments, now appear in the online account-opening form, and each new customer is assigned to the nearest centre using the survey’s stored means and standard deviations. On a hold-out of ${KB.holdout} surveyed customers the tool agreed with the full segmentation for ${pc(KB.acc, 0)}; Eilidh reports that figure, the share of new customers whose two nearest centres are close, and a plan to re-run the segmentation every ${KB.rerun} years with the same specification.` },
    { p: 'Ana’s version is smaller: five one-page reports, a four-question card for café staff to offer customers who join Lantern’s mailing list, and a note on every size that it is a share of the study. With the segments profiled, named and sized, the next module asks which of them Lantern should serve.' },
  ],

  summary: [
    'Profiling describes segments on the segmentation variables; describing uses descriptor variables such as demographics, behaviour and awareness.',
    'Index = segment mean ÷ overall mean × 100; above 100, the need matters more to the segment. Indexes suit spend and shares best; on ratings, read them beside the means or centres.',
    'Name segments from their highest (and lowest) indexes in plain words, without adding ages, incomes, loyalty or judgements the needs didn’t measure.',
    'Tests on the segmentation variables are circular; use their F statistics only to rank needs. Describe segments with cross-tabs, chi-square tests and Cramér’s V on descriptors, remembering a strong link still leaves segments mixed.',
    'Size segments by share of respondents and share of spend; spend share ÷ respondent share = spend per head ÷ the average.',
    'Sizes from an opt-in panel with quotas are shares of the study, not of the population; profiles are more robust than sizes.',
    'A typing tool standardises a new respondent’s golden answers with the study’s means and SDs and assigns the nearest centre; measure its accuracy on a hold-out, and watch close calls.',
  ],

  glossary: [
    { term: 'Profiling', def: 'Describing segments on the segmentation variables that formed them, for example as indexes against the average, to see what each segment wants.' },
    { term: 'Index against the average', def: 'A segment’s mean on a variable divided by the overall mean, times 100: 100 is average, above 100 the segment is higher than average. Often just called an index.' },
    { term: 'Share of spend', def: 'A segment’s total spend divided by the total spend of everyone in the base; compared with its share of people, it shows whether the segment spends more or less per head than average.' },
    { term: 'Spend per head', def: 'A group’s total spend divided by the number of people in it: the mean spend.' },
    { term: 'Typing tool', def: 'A rule or small model that assigns a new respondent or customer to an existing segment, usually from a few questions, for example by the nearest segment centre.' },
    { term: 'Golden questions', def: 'The short set of questions a typing tool uses to assign people to segments, chosen because they separate the segments best.' },
  ],

  references: [
    { text: 'Dolnicar, S., Grün, B. &amp; Leisch, F. (2018). Step 6: Profiling segments (pp. 183–197) and Step 7: Describing segments (pp. 199–236). In <i>Market Segmentation Analysis</i>. Springer (Management for Professionals), open access.', url: 'https://ideas.repec.org/h/spr/mgmchp/978-981-10-8818-6_8.html', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, chapter 5 key terms (ADAMS: accessible, differentiable, actionable, measurable and substantial segments; needs-based segmentation). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-key-terms', checked: '2026-10-25' },
    { text: 'Baker, R., Blumberg, S. J., Brick, J. M. et al. (2010). AAPOR report on online panels. <i>Public Opinion Quarterly</i>, 74(4), 711–781. doi:10.1093/poq/nfq048.', url: 'https://aapor.org/wp-content/uploads/2022/11/nfq048.pdf', checked: '2026-10-25' },
    { text: 'Bock, T. How to write golden questions for market segmentation. Q Research Software (undated web article).', url: 'https://www.qresearchsoftware.com/how-to-write-golden-questions-for-market-segmentation', checked: '2026-10-25' },
    { text: 'Horn, E. (n.d.). The Type Is Right: Maximizing the Impact of Segmentation Typing Tools. Decision Analyst (undated web article; the page carries a 2023 copyright notice).', url: 'https://decisionanalyst.com/blog/segmentationtypingtools/', checked: '2026-10-25' },
  ],

  checks: [
    // the five segments
    { what: 'Respondents', value: N, shown: 640 },
    { what: 'Segments', value: K, shown: 5 },
    { what: 'Sizes', value: SZ.map((s) => s.n).join() === '152,146,129,109,104' ? 1 : 0, shown: 1 },
    ...SEG_ORDER.map((g) => ({ what: `Size ${NAMES[g]}`, value: SZ[g].n, shown: [152, 146, 129, 109, 104][g] })),
    { what: 'Study fieldwork year', value: 2027, shown: 2027 },
    // indexes
    ...SEG_ORDER.flatMap((g) => NEEDS.map((_, j) => ({ what: `Index ${NAMES[g]} ${NEEDS[j].key}`, value: IXraw[g][j], shown: IX[g][j], tol: 0.5 }))),
    { what: 'Craft and local local mean', value: MEANS[CL][6], shown: 6.28, tol: 0.005 },
    { what: 'Overall local mean', value: MU[6], shown: 3.74, tol: 0.005 },
    { what: 'Craft and local local index', value: IXraw[CL][6], shown: 168, tol: 0.5 },
    { what: 'Index from the rounded means', value: (6.28 / 3.74) * 100, shown: 168, tol: 0.5 },
    { what: 'Index conventions', value: 120 + 80, shown: 200 },
    { what: 'Weighted indexes average 100 (local)', value: sum(SZ.map((s, g) => s.share * IXraw[g][6])), shown: 100, tol: 1e-9 },
    { what: 'Value routine price', value: IX[VR][1], shown: 142 },
    { what: 'Value routine novelty', value: IX[VR][7], shown: 57 },
    { what: 'Value routine local', value: IX[VR][6], shown: 65 },
    { what: 'Mindful health', value: IX[MI][5], shown: 168 },
    { what: 'Mindful energy', value: IX[MI][4], shown: 66 },
    { what: 'Value routine sustainability below 100', value: Number(IX[VR][3] < 100 && IX[VR][7] < 100 && IX[VR][6] < 100), shown: 1 },
    { what: 'Craft and local novelty and sustainability above 100', value: Number(IX[CL][7] > 100 && IX[CL][3] > 100), shown: 1 },
    { what: 'Explorers taste a little above 100', value: IX[EX][0], shown: 107 },
    ...SEG_ORDER.flatMap((g) => topTwo(g).map((t, q) => ({ what: `Top ${q + 1} ${NAMES[g]}`, value: t.v, shown: [[142, 104], [147, 137], [158, 107], [168, 136], [168, 159]][g][q] }))),
    // names
    { what: 'Explorers aged 30+ %', value: (1 - exUnder30) * 100, shown: 33, tol: 0.5 },
    { what: 'Craft and local aware %', value: S.aware[CL] * 100, shown: 24.8, tol: 0.05 },
    { what: 'Craft and local unaware %', value: (1 - S.aware[CL]) * 100, shown: 75, tol: 0.5 },
    // descriptors
    { what: 'Explorers 18–29 %', value: exUnder30 * 100, shown: 67.4, tol: 0.05 },
    { what: 'All 18–29 %', value: allUnder30 * 100, shown: 32.2, tol: 0.05 },
    { what: 'Explorers 18–29 rounded', value: exUnder30 * 100, shown: 67, tol: 0.5 },
    { what: 'Explorers share of under-30s', value: exOfUnder30 * 100, shown: 42, tol: 0.5 },
    { what: 'Craft and local café %', value: clCafe * 100, shown: 61.5, tol: 0.05 },
    { what: 'All café %', value: allCafe * 100, shown: 31.9, tol: 0.05 },
    { what: 'Craft and local over $80k %', value: clRich * 100, shown: 78.0, tol: 0.05 },
    { what: 'All over $80k %', value: allRich * 100, shown: 41.9, tol: 0.05 },
    { what: '$80,000', value: 80000, shown: 80000 },
    { what: 'Value routine home-brewed %', value: vrHome * 100, shown: 50.0, tol: 0.05 },
    { what: 'All home-brewed %', value: allHome * 100, shown: 28.8, tol: 0.05 },
    { what: 'On the go supermarket or RTD %', value: ogRtd * 100, shown: 39.0, tol: 0.05 },
    { what: 'On the go office %', value: ogOffice * 100, shown: 30.1, tol: 0.05 },
    { what: 'All office %', value: allOffice * 100, shown: 11.9, tol: 0.05 },
    { what: 'Mindful family %', value: miFamily * 100, shown: 38.5, tol: 0.05 },
    { what: 'All family %', value: allFamily * 100, shown: 22.0, tol: 0.05 },
    // behaviour table
    { what: 'Cups all', value: CUPS_ALL, shown: 10.6, tol: 0.05 },
    ...SEG_ORDER.map((g) => ({ what: `Cups ${NAMES[g]}`, value: S.cups[g], shown: [12.3, 15.7, 8.6, 8.4, 5.8][g], tol: 0.05 })),
    { what: 'Spend per head all', value: HEAD_ALL, shown: 50.29, tol: 0.005 },
    ...SEG_ORDER.map((g) => ({ what: `Spend per head ${NAMES[g]}`, value: SZ[g].perHead, shown: [27.05, 58.54, 54.60, 76.61, 39.75][g], tol: 0.005 })),
    { what: 'Loyalty all', value: D.loyalty.mean, shown: 3.05, tol: 0.005 },
    ...SEG_ORDER.map((g) => ({ what: `Loyalty ${NAMES[g]}`, value: S.loyalty[g], shown: [2.46, 2.58, 3.17, 3.94, 3.51][g], tol: 0.005 })),
    { what: 'Loyalty scale top', value: Math.max(...RS.flatMap((r) => r.loyal)), shown: 5 },
    { what: 'Aware all %', value: D.aware * 100, shown: 13.9, tol: 0.05 },
    ...SEG_ORDER.map((g) => ({ what: `Aware ${NAMES[g]}`, value: S.aware[g] * 100, shown: [4.6, 13.7, 16.3, 24.8, 13.5][g], tol: 0.05 })),
    { what: 'Cold Brew all %', value: D.coldbrewTop2 * 100, shown: 29.2, tol: 0.05 },
    ...SEG_ORDER.map((g) => ({ what: `Cold Brew ${NAMES[g]}`, value: S.coldbrewTop2[g] * 100, shown: [10.5, 38.4, 24.0, 45.9, 32.7][g], tol: 0.05 })),
    { what: 'Behaviour fits: On the go most cups', value: Number(S.cups[OG] === Math.max(...S.cups)), shown: 1 },
    { what: 'Behaviour fits: Value routine lowest spend', value: Number(SZ[VR].perHead === Math.min(...SZ.map((s) => s.perHead))), shown: 1 },
    { what: 'Behaviour fits: Craft and local most loyal and aware', value: Number(S.loyalty[CL] === Math.max(...S.loyalty) && S.aware[CL] === Math.max(...S.aware)), shown: 1 },
    { what: 'Cold Brew: Craft and local and On the go highest', value: Number([...S.coldbrewTop2].sort((a, b) => b - a).slice(0, 2).every((v) => v === S.coldbrewTop2[CL] || v === S.coldbrewTop2[OG])), shown: 1 },
    // sizing
    ...SEG_ORDER.flatMap((g) => [
      { what: `Share ${NAMES[g]}`, value: SZ[g].share * 100, shown: [23.8, 22.8, 20.2, 17.0, 16.3][g], tol: 0.05 },
      { what: `Spend share ${NAMES[g]}`, value: SZ[g].spendShare * 100, shown: [12.8, 26.6, 21.9, 25.9, 12.8][g], tol: 0.05 },
      { what: `Value ratio ${NAMES[g]}`, value: valueRatio(g), shown: [0.54, 1.16, 1.09, 1.52, 0.79][g], tol: 0.005 },
      { what: `Value ratio = per head ÷ average, ${NAMES[g]}`, value: valueRatio(g), shown: SZ[g].perHead / HEAD_ALL, tol: 1e-9 },
    ]),
    { what: 'Total spend', value: SPEND_ALL, shown: 32187 },
    { what: 'Craft and local % of average a head', value: (SZ[CL].perHead / HEAD_ALL) * 100, shown: 152, tol: 0.5 },
    { what: 'Craft and local nearly three times Value routine a head', value: SZ[CL].perHead / SZ[VR].perHead, shown: 2.8, tol: 0.05 },
    { what: 'About a fifth are Explorers', value: SZ[EX].share, shown: 0.2, tol: 0.005 },
    // indexes on ratings
    { what: 'Craft and local local centre', value: CENTRES[CL][6], shown: 1.57, tol: 0.005 },
    { what: 'One point above on health', value: ((MU[5] + 1) / MU[5]) * 100, shown: 128, tol: 0.5 },
    { what: 'Health mean', value: MU[5], shown: 3.62, tol: 0.005 },
    { what: 'One point above on taste', value: ((MU[0] + 1) / MU[0]) * 100, shown: 121, tol: 0.5 },
    { what: 'Taste mean', value: MU[0], shown: 4.66, tol: 0.005 },
    { what: 'Mindful health mean', value: MEANS[MI][5], shown: 6.10, tol: 0.005 },
    { what: 'Index 168 as a ratio', value: 168 / 100, shown: 1.68, tol: 1e-9 },
    // ANOVA
    { what: 'F min', value: Fmin, shown: 182.5, tol: 0.05 },
    { what: 'F max', value: Fmax, shown: 458.0, tol: 0.05 },
    { what: 'Benchmark F min', value: nFmin, shown: 11.6, tol: 0.05 },
    { what: 'Benchmark F max', value: nFmax, shown: 120.5, tol: 0.05 },
    { what: 'Benchmark: every p below 0.000001', value: Number(nPmax < 1e-6), shown: 1 },
    { what: 'F novelty', value: FS[0].F, shown: 458.0, tol: 0.05 },
    { what: 'F local', value: FS[1].F, shown: 445.8, tol: 0.05 },
    { what: 'F sustainability', value: FS[2].F, shown: 348.2, tol: 0.05 },
    { what: 'F price', value: FS[3].F, shown: 286.5, tol: 0.05 },
    { what: 'F taste', value: S.anova[0].F, shown: 182.5, tol: 0.05 },
    { what: 'F order', value: Number(FS.slice(0, 4).map((x) => NEEDS[x.j].key).join() === 'novelty,local,sustainability,price' && FS[7].j === 0), shown: 1 },
    // chi-square
    { what: 'Every chi-square p below 0.001', value: Number(maxP < 0.001), shown: 1 },
    { what: 'V source', value: VS.source, shown: 0.35 },
    { what: 'V age', value: VS.age, shown: 0.30 },
    { what: 'V income', value: VS.income, shown: 0.26 },
    { what: 'V household', value: VS.household, shown: 0.22 },
    { what: 'V region', value: VS.area, shown: 0.18 },
    { what: 'Five cross-tabs', value: Object.keys(CHI).length, shown: 5 },
    // representativeness
    { what: 'AAPOR report year', value: 2010, shown: 2010 },
    // typing
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((m) => ({ what: `Golden ${m}`, value: ACC[m] * 100, shown: [54.2, 75.6, 81.9, 92.5, 94.2, 97.3, 98.4, 100.0][m - 1], tol: 0.05 })),
    { what: 'Golden four are the case’s short set', value: Number(golden(4).join() === SHORT.join()), shown: 1 },
    { what: 'Golden four count', value: Math.round(ACC[4] * N), shown: 592 },
    { what: 'Golden four = case', value: ACC[4], shown: D.typing.shortAgreement, tol: 1e-12 },
    { what: 'Lowest four', value: accLow4 * 100, shown: 83.6, tol: 0.05 },
    { what: 'Hold-out train', value: HO.train, shown: 480 },
    { what: 'Hold-out test', value: HO.test, shown: 160 },
    { what: 'Hold-out agreement', value: HO.agreement, shown: 1 },
    { what: 'Hold-out on eight needs (recomputed)', value: hold8, shown: HO.agreement, tol: 1e-12 },
    { what: 'Hold-out four golden questions %', value: hold4 * 100, shown: 88.1, tol: 0.05 },
    { what: 'Hold-out four golden questions count', value: Math.round(hold4 * HO.test), shown: 141 },
    { what: 'Hold-out four below in-sample four', value: Number(hold4 < ACC[4]), shown: 1 },
    { what: 'Leak-free hold-out %', value: LF.acc * 100, shown: 87.5, tol: 0.05 },
    { what: 'Leak-free hold-out count', value: Math.round(LF.acc * HO.test), shown: 140 },
    { what: 'Leak-free picks the same four', value: Number(LF.gold.join() === SHORT.join()), shown: 1 },
    { what: 'Hold-out margin, points', value: holdMoe * 100, shown: 5.1, tol: 0.05 },
    { what: 'Hold-out margin about 5', value: holdMoe * 100, shown: 5, tol: 0.5 },
    { what: 'Random splits', value: SPLITS.length, shown: 40 },
    { what: 'Random splits mean %', value: splitMean * 100, shown: 88.8, tol: 0.05 },
    { what: 'Random splits SD, points', value: splitSd * 100, shown: 4.4, tol: 0.05 },
    { what: 'Random splits lowest %', value: Math.min(...SPLITS) * 100, shown: 79.4, tol: 0.05 },
    { what: 'Random splits highest %', value: Math.max(...SPLITS) * 100, shown: 94.4, tol: 0.05 },
    { what: 'Ana’s split is typical (within one SD of the mean)', value: Number(Math.abs(LF.acc - splitMean) < splitSd && atOrBelow > 5 && atOrBelow < 35), shown: 1 },
    { what: 'Full-sample tool on the same 160 %', value: full160 * 100, shown: 89.4, tol: 0.05 },
    { what: 'Full-sample tool on the same 160 count', value: Math.round(full160 * HO.test), shown: 143 },
    { what: 'Sets of four needs', value: SETS.length, shown: 70 },
    { what: 'Top-F four rank', value: topFRank, shown: 7 },
    { what: 'Best set of four %', value: BEST4.acc * 100, shown: 94.1, tol: 0.05 },
    { what: 'Best set is energy, health, local, novelty', value: Number(BEST4.js.map((j) => NEEDS[j].key).join() === 'energy,health,local,novelty'), shown: 1 },
    { what: 'F price', value: S.anova[1].F, shown: 286.5, tol: 0.05 },
    { what: 'F health', value: S.anova[5].F, shown: 277.3, tol: 0.05 },
    { what: 'F energy', value: S.anova[4].F, shown: 274.0, tol: 0.05 },
    { what: 'All supermarket or RTD %', value: allRtd * 100, shown: 27.5, tol: 0.05 },
    { what: 'Hold-out against truth %', value: HO.againstTruth * 100, shown: 98.1, tol: 0.05 },
    { what: 'Hold-out against truth count', value: HO.againstTruth * HO.test, shown: 157, tol: 1e-9 },
    { what: 'Agency range low', value: 40, shown: 40 },
    { what: 'Agency range high', value: 90, shown: 90 },
    // the new Lantern customer
    { what: 'New: price z', value: zNew[0], shown: -1.72, tol: 0.005 },
    { what: 'New: sustainability z', value: zNew[1], shown: 1.44, tol: 0.005 },
    { what: 'New: local z', value: zNew[2], shown: 2.02, tol: 0.005 },
    { what: 'New: novelty z', value: zNew[3], shown: 0.60, tol: 0.005 },
    ...SEG_ORDER.map((g) => ({ what: `New: distance to ${NAMES[g]}`, value: dNew[g], shown: [24.74, 15.65, 8.65, 1.37, 5.30][g], tol: 0.005 })),
    { what: 'New: nearest is Craft and local', value: Number(nearestNew === CL), shown: 1 },
    { what: 'New: next nearest', value: dSorted[1], shown: 5.30, tol: 0.005 },
    { what: 'Price mean', value: MU[1], shown: 4.44, tol: 0.005 },
    { what: 'Price SD', value: SD[1], shown: 1.42, tol: 0.005 },
    { what: 'Sustainability mean', value: MU[3], shown: 3.85, tol: 0.005 },
    { what: 'Sustainability SD', value: SD[3], shown: 1.49, tol: 0.005 },
    { what: 'Local SD', value: SD[6], shown: 1.61, tol: 0.005 },
    { what: 'Novelty mean', value: MU[7], shown: 4.00, tol: 0.005 },
    { what: 'Novelty SD', value: SD[7], shown: 1.67, tol: 0.005 },
    // Pennacott
    { what: 'Pennacott members', value: TF.members, shown: 500 },
    { what: 'Pennacott segment C', value: TF.seg, shown: 128 },
    { what: 'Pennacott segment share %', value: (TF.seg / TF.members) * 100, shown: 25.6, tol: 0.05 },
    ...tfIx.map((v, j) => ({ what: `Pennacott index ${j}`, value: v, shown: [145, 96, 71, 106][j], tol: 0.5 })),
    { what: 'Pennacott segments', value: 4, shown: 4 },
    { what: 'Pennacott needs in all', value: 6, shown: 6 },
    // Vantley
    ...voZ.map((v, j) => ({ what: `Vantley z ${j}`, value: v, shown: [0.80, 0.69, -0.86][j], tol: 0.005 })),
    ...voD.map((v, g) => ({ what: `Vantley distance ${g}`, value: v, shown: [1.88, 2.01, 5.96][g], tol: 0.005 })),
    { what: 'Vantley nearest is Technical', value: Number(voBest === 0), shown: 1 },
    ...voOwn.map((v, j) => ({ what: `Vantley own-centred ${j}`, value: v, shown: [1.33, 0.33, -1.67][j], tol: 0.005 })),
    { what: 'Vantley golden questions', value: VO.qs.length, shown: 3 },
    // Kestrow
    { what: 'Kestrow customers', value: KB.customers, shown: 2400 },
    { what: 'Kestrow needs', value: KB.needs, shown: 9 },
    { what: 'Kestrow segments', value: KB.segs, shown: 6 },
    { what: 'Kestrow golden', value: KB.golden, shown: 5 },
    { what: 'Kestrow hold-out', value: KB.holdout, shown: 600 },
    { what: 'Kestrow accuracy %', value: KB.acc * 100, shown: 88 },
    { what: 'Kestrow re-run years', value: KB.rerun, shown: 2 },
    { what: 'Kestrow months', value: 2, shown: 2 },
  ],
};
