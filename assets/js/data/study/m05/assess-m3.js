// assess-m3.js — M05 module 3 test: Targeting (evaluating-segments, targeting-strategies).
// New businesses and angles the lessons don't drill: a scorecard that double-counts, a margin pool from a city-wide
// count, a scorecard laid out with segments across the columns, a threshold found by lowering a weight, a harm-and-
// vulnerability judgement on a game, reading an attractiveness–fit position, considerations that point to a strategy,
// the volume a cannibalising plan needs, a persona line from a gym's member data, which segments can share an offer,
// and the risks of concentration. Every business here is fictional (the gym, Wrenlow Leisure, has its own small
// generated dataset). No hints; solutions are shown when the student reviews the test. Every num item's `check`
// recomputes its answer.
import { mulberry32 } from '../../../core/rng.js?v=14';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const r1 = (x) => Math.round(x * 10) / 10;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// a credit union's scorecard, segments across the columns
const CU = { factors: ['Size', 'Margin per member', 'Growth', 'Room from rivals', 'Fit'], w: [3, 4, 2, 2, 4], segs: ['Students', 'Young professionals', 'Retired members'],
  s: [[60, 30, 100, 80, 50], [100, 70, 70, 40, 70], [50, 100, 30, 60, 90]] };
const cuScore = CU.s.map((sc) => sum(sc.map((v, k) => v * CU.w[k])) / sum(CU.w));
const cuCells = { A1: 'Factor', B1: 'Weight', C1: CU.segs[0], D1: CU.segs[1], E1: CU.segs[2], ...col('A', 2, CU.factors), ...col('B', 2, CU.w),
  ...col('C', 2, CU.s[0]), ...col('D', 2, CU.s[1]), ...col('E', 2, CU.s[2]), A7: 'Weighted score' };

// Wrenlow Leisure (fictional): 40 members of a leisure centre, their segment and visits last week
const WL = (() => {
  const rnd = mulberry32(5317);
  const segs = ['Fitness first', 'Social swimmers', 'Family members'];
  const base = [[3, 4], [1, 3], [1, 3]];
  const rows = [];
  for (let i = 0; i < 40; i++) {
    const u = rnd(), g = u < 0.35 ? 0 : u < 0.7 ? 1 : 2;
    const [lo, span] = base[g];
    const visits = lo + Math.floor(rnd() * (span + 1));
    const activity = g === 0 ? (rnd() < 0.7 ? 'Gym' : 'Classes') : g === 1 ? (rnd() < 0.8 ? 'Pool' : 'Café') : (rnd() < 0.6 ? 'Pool' : 'Soft play');
    rows.push([`M${String(i + 1).padStart(2, '0')}`, segs[g], visits, activity]);
  }
  return { segs, rows };
})();
const wlCells = { A1: 'member', B1: 'segment', C1: 'visits_last_week', D1: 'main_activity',
  ...Object.assign({}, ...WL.rows.map((r, i) => ({ [`A${i + 2}`]: r[0], [`B${i + 2}`]: r[1], [`C${i + 2}`]: r[2], [`D${i + 2}`]: r[3] }))),
  F1: 'Segment', G1: 'Fitness first', F2: 'At least this many visits', G2: 5, F4: 'Share of the segment' };
const wlShare = (seg, k) => WL.rows.filter((r) => r[1] === seg && r[2] >= k).length / WL.rows.filter((r) => r[1] === seg).length;

// a streaming service (fictional): an advertising-funded plan beside the standard plan
const ST = { mNew: 5, mOld: 11, c: 0.4, F: 60000 };
const stQ = ST.F / (ST.mNew - ST.c * ST.mOld);

export const items = [
  // ---------------------------------------------------------------- evaluating-segments
  {
    id: 'm05-m3-1', lesson: 'evaluating-segments', type: 'mc', kind: 'conceptual',
    prompt: 'A gym chain (fictional) scores four member segments on five factors: the number of members, spend per member, the segment’s total spend (members × spend per member), growth and fit with the chain’s strengths. What is the main flaw in this scorecard?',
    options: [
      'Growth is usually too uncertain to score, so it is better left out of the scorecard',
      'Total spend is members × spend per member, so size and spending each get two votes in the total',
      'Fit belongs to a separate decision and shouldn’t appear in a segment scorecard at all',
      'Five factors are probably more than one scorecard can combine reliably; three would be safer',
    ],
    answer: 1,
    feedback: {
      0: 'Growth is uncertain, which is a reason to test its weight, not to drop it: it is one of the standard attractiveness factors.',
      2: 'Fit is half of the evaluation: attractiveness says whether a segment is worth having, fit whether this firm can win it.',
      3: 'Five factors are common; the problem is overlap between factors, not their number.',
    },
    solution: 'Total spend is the product of the first two factors, so a segment that is large or spends a lot is rewarded twice. Keep members and spend per member and drop the total (or keep the total and drop its parts): one measure per factor.',
  },
  {
    id: 'm05-m3-2', lesson: 'evaluating-segments', type: 'num', kind: 'numerical',
    prompt: 'A city bike-hire scheme (fictional) estimates that 80,000 adults in the city cycle. Its survey puts 15% of them in a “weekend explorers” segment, spending $120 a year each on hire. The scheme’s margin on hire is 30%. What is the segment’s margin pool a year? Give a whole number of dollars.',
    answer: 432000, check: () => 80000 * 0.15 * 120 * 0.3, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 80000 * 0.15 * 120, say: 'That is the segment’s spending. The margin pool keeps the margin: multiply by 0.30.' },
      { value: 80000 * 120 * 0.3, say: 'That treats every cyclist as a weekend explorer. Only 15% are: 12,000 people.' },
      { value: 120 * 0.3, say: 'That is the margin on one person. Multiply by the 12,000 people in the segment.' },
    ],
    solution: 'People in the segment: 80,000 × 0.15 = 12,000. Spending: 12,000 × $120 = $1,440,000. Margin pool: × 0.30 = $432,000 a year: the most the scheme could earn from the segment if it won all of its hire spending.',
  },
  {
    id: 'm05-m3-3', lesson: 'evaluating-segments', type: 'formula', kind: 'applied',
    prompt: 'A credit union (fictional) lays out its scorecard with the factors down column A, their weights in column B and one segment in each of columns C to E (scores 0–100). In C7, calculate the students’ weighted score on 0–100, in a formula that can be filled right to E7.',
    sheet: { cells: cuCells }, cell: 'C7', fill: 'C7:E7', answer: '=SUMPRODUCT($B$2:$B$6,C2:C6)/SUM($B$2:$B$6)',
    alt: ['=SUMPRODUCT(C2:C6,$B$2:$B$6)/SUM($B$2:$B$6)', '=SUMPRODUCT($B2:$B6,C2:C6)/SUM($B2:$B6)', '=SUMPRODUCT(C2:C6*$B$2:$B$6)/SUM($B$2:$B$6)'],
    view: 'A1:E7', formats: { C7: '0.0', D7: '0.0', E7: '0.0' }, widths: { A: 18, B: 9, C: 12, D: 19, E: 16 },
    wrong: [
      { formula: '=SUMPRODUCT(B2:B6,C2:C6)/SUM(B2:B6)', say: 'Without $ the weights slide right as you fill: D7 would use the students’ scores as weights. Lock the column: $B$2:$B$6.' },
      { formula: '=SUMPRODUCT($B$2:$B$6,C2:C6)', say: 'That is the weighted sum. Divide by the total weight to bring it back to 0–100.' },
      { formula: '=AVERAGE(C2:C6)', say: 'That gives every factor the same weight. Multiply each score by its weight with SUMPRODUCT.' },
      { formula: '=SUMPRODUCT($B$2:$B$6,C2:C6)/5', say: 'Divide by the total of the weights (15), not by the number of factors.' },
    ],
    solution: `<x>=SUMPRODUCT($B$2:$B$6,C2:C6)/SUM($B$2:$B$6)</x> gives ${cuScore.map((v) => r1(v).toFixed(1)).join(', ')} for students, young professionals and retired members. The retired members lead young professionals by less than a point: a tie in practice, to be settled by testing the weights.`,
  },
  {
    id: 'm05-m3-4', lesson: 'evaluating-segments', type: 'num', kind: 'numerical',
    prompt: 'An online wine merchant (fictional) compares gift buyers with collectors. With its current weights, gift buyers’ weighted sum (Σ weight × score, before dividing by the total weight) is 36 points higher than collectors’. Gift buyers score 90 on fit and collectors 60; fit’s weight is 5. To what value would fit’s weight have to fall, with every other weight unchanged, for the two segments to draw level? Give one decimal place.',
    answer: 3.8, check: () => 5 - 36 / (90 - 60), unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: 1.2, say: 'That is how far the weight must fall (36 ÷ 30). The question asks for the new weight: 5 − 1.2.' },
      { value: 6.2, say: 'Raising fit’s weight helps the gift buyers, who lead on fit. To close the gap, lower it: 5 − 36 ÷ 30.' },
      { value: r1(5 - 36 / 90), say: 'Divide the gap by the difference in fit scores (90 − 60 = 30), not by the gift buyers’ score.' },
    ],
    solution: 'Each point of weight on fit is worth 90 − 60 = 30 points of gap in the weighted sums. Closing a gap of 36 needs a fall of 36 ÷ 30 = 1.2, from 5 to 3.8. A modest change of judgement about fit would reverse the choice, so the merchant should look hard at the evidence behind the fit scores.',
  },
  {
    id: 'm05-m3-5', lesson: 'evaluating-segments', type: 'mc', kind: 'applied',
    prompt: 'A mobile-game studio (fictional) finds that its highest-spending segment is 13- to 16-year-olds who buy “loot boxes”, paid packs with random contents. Applying the harm-and-vulnerability screen, which plan is best?',
    options: [
      'Target them harder with time-limited loot-box offers, since they are the most valuable segment',
      'Keep targeting them, adding a notice in small print that the contents of each box are random',
      'Stop promoting loot boxes to under-18s, and aim that spending at adult players instead',
      'Move the loot-box advertising to the parents’ social media, so the teenagers are no longer targeted',
    ],
    answer: 2,
    feedback: {
      0: 'A product with gambling-like features aimed at young teenagers is high on both harm and vulnerability; attractiveness doesn’t outweigh that.',
      1: 'A small-print notice leaves the targeting unchanged and is unlikely to protect the people least able to judge the offer.',
      3: 'The offer still reaches teenagers, now through their parents’ accounts and with the same product; the concern remains.',
    },
    solution: 'Concern about targeting rises with product harm and consumer vulnerability (Smith and Cooper-Martin, 1997). Random paid packs can encourage compulsive spending, and young teenagers are less able to judge such offers. The segment should be screened out for that product before any scoring, whatever its spending; the studio can serve adults who choose it.',
  },
  {
    id: 'm05-m3-6', lesson: 'evaluating-segments', type: 'mc', kind: 'conceptual',
    prompt: 'On a chart of segments by attractiveness (across) and fit with the company’s strengths (up), one segment sits far to the right but near the bottom. What does that position usually tell the company?',
    options: [
      'It is the best target, because attractiveness matters more than fit to the long-run return',
      'Its fit score is probably understated, since attractive segments tend to suit some of a firm’s strengths',
      'Rivals whose strengths match it are better placed; pursue it only if the firm can build that fit',
      'It should be dropped from the analysis, because a scorecard can’t handle a factor with a low score',
    ],
    answer: 2,
    feedback: {
      0: 'A segment the company fits badly is one it is likely to lose to better-suited rivals, however attractive it is.',
      1: 'Attractiveness is about the segment; fit is about this company. An attractive segment can suit a rival and not you.',
      3: 'Low scores are what a scorecard is for; the chart shows the trade-off a single total would hide.',
    },
    solution: 'A segment there is worth having for someone, but a firm whose strengths match it is better placed to win it. The company should pursue it only if it can build the missing strengths, and count that cost; a single combined score would have hidden the trade-off.',
  },
  // ---------------------------------------------------------------- targeting-strategies
  {
    id: 'm05-m3-7', lesson: 'targeting-strategies', type: 'classify', kind: 'conceptual',
    prompt: 'Each describes a company’s situation. Which targeting strategy does it point towards?',
    items: [
      'Buyers see the product as the same whoever makes it, like bottled water at a fixed size.',
      'A two-person start-up is launching its first product into a market of very varied buyers.',
      'A large company whose buyers want very different things has the budget for several product lines.',
      'A small regional brewer with a tight budget sells to drinkers who want very different beers.',
      'Buyers want the same thing, and the firm has the lowest costs in the market.',
    ],
    categories: ['Undifferentiated marketing', 'Differentiated marketing', 'Concentrated marketing'],
    answer: [0, 2, 1, 2, 0],
    feedback: {
      0: 'Little product variability favours one mix for all.',
      1: 'Limited resources and a varied market favour one well-chosen segment.',
      2: 'Varied buyers and the resources for several mixes favour a separate offer for each segment.',
      3: 'A tight budget and varied buyers point to one well-chosen segment: the brewer can’t afford a mix for each.',
      4: 'Uniform needs and a cost advantage suit one mix for the whole market.',
    },
    solution: 'Uniform products or uniform buyers point to undifferentiated marketing (with a cost advantage to make it pay). Limited resources point to concentration when buyers differ. Varied buyers plus the resources to serve several of them point to differentiated marketing.',
  },
  {
    id: 'm05-m3-8', lesson: 'targeting-strategies', type: 'num', kind: 'numerical',
    prompt: `A streaming service (fictional) plans a cheaper plan with advertising. Each subscriber to it contributes $${ST.mNew} a month; ${ST.c * 100}% of its subscribers are expected to be standard subscribers moving down, each of whom contributed $${ST.mOld} a month; running the plan adds $${ST.F.toLocaleString('en-US')} a month of fixed costs. How many subscribers to the new plan are needed for it to break even? Give a whole number.`,
    answer: Math.round(stQ), check: () => 60000 / (5 - 0.4 * 11), unit: 'subscribers', places: 0, tol: 1,
    wrong: [
      { value: ST.F / ST.mNew, say: 'That ignores the subscribers who move down. Each new subscriber adds only $5 − 0.4 × $11 = $0.60 net.' },
      { value: Math.round(ST.F / (ST.mOld - ST.mNew)), say: 'The net gain per subscriber is m_new − c × m_old = 5 − 0.4 × 11, not the difference between the two contributions.' },
      { value: Math.round(ST.F / (ST.mNew - ST.c * ST.mNew)), say: 'A subscriber who moves down takes the standard plan’s $11 with them, not the new plan’s $5.' },
    ],
    solution: `Each new subscriber adds $5 but, on average, takes 0.4 × $11 = $4.40 from the standard plan: a net $0.60. Covering $60,000 of fixed costs needs 60,000 ÷ 0.60 = ${Math.round(stQ).toLocaleString('en-US')} subscribers. Heavy cannibalisation of a richer plan makes the volume needed enormous; above a rate of about 45% (5 ÷ 11) the plan could never pay.`,
  },
  {
    id: 'm05-m3-9', lesson: 'targeting-strategies', type: 'formula', kind: 'applied',
    prompt: 'Wrenlow Leisure (fictional) is drafting a persona for each of its member segments. Column B holds each member’s segment and C their visits last week; G1 names a segment and G2 a number of visits. In G4, calculate the share of that segment’s members who visited at least as many times as G2.',
    sheet: { cells: wlCells, vary: { G1: ['Social swimmers', 'Family members'], G2: [3, 2] } }, cell: 'G4',
    answer: '=COUNTIFS(B2:B41,G1,C2:C41,">="&G2)/COUNTIF(B2:B41,G1)',
    alt: ['=COUNTIFS(C2:C41,">="&G2,B2:B41,G1)/COUNTIFS(B2:B41,G1)', '=SUMPRODUCT((B2:B41=G1)*(C2:C41>=G2))/COUNTIF(B2:B41,G1)', '=COUNTIFS(B:B,G1,C:C,">="&G2)/COUNTIF(B:B,G1)'],
    view: 'A1:G41', formats: { G4: '0.0%' }, widths: { B: 16, C: 16, D: 14, F: 24, G: 15 }, maxHeight: '22rem',
    wrong: [
      { formula: '=COUNTIFS(B2:B41,G1,C2:C41,">"&G2)/COUNTIF(B2:B41,G1)', say: '“>” leaves out members who visited exactly G2 times. “At least” is ">="&G2.' },
      { formula: '=COUNTIFS(B2:B41,G1,C2:C41,">="&G2)/COUNTA(B2:B41)', say: 'That divides by all 40 members. A persona line is a share of its own segment: divide by COUNTIF(B2:B41,G1).' },
      { formula: '=COUNTIF(C2:C41,">="&G2)/COUNTA(C2:C41)', say: 'That is the share of all members, in every segment. Add the segment criterion.' },
      { formula: '=COUNTIFS(B2:B41,G1,C2:C41,">=G2")/COUNTIF(B2:B41,G1)', say: 'Inside the quotes, G2 is just text, so nothing matches. Join the operator to the cell: ">="&G2.' },
    ],
    solution: `<x>=COUNTIFS(B2:B41,G1,C2:C41,">="&G2)/COUNTIF(B2:B41,G1)</x>: for Fitness first and 5 visits, ${(wlShare('Fitness first', 5) * 100).toFixed(1)}%. Written on the persona as a share (“${Math.round(wlShare('Fitness first', 5) * 100)}% came five or more times last week”), not as one person’s habit.`,
  },
  {
    id: 'm05-m3-10', lesson: 'targeting-strategies', type: 'mc', kind: 'applied',
    prompt: 'A bookshop (fictional) has three segments. Their needs as indexes against the average customer (100 = average) are in the table. Which two could most plausibly share one offer?',
    data: { table: { head: ['Need', 'Gift buyers', 'Book-club readers', 'Students'], rows: [['Low prices', '80', '90', '160'], ['Staff recommendations', '150', '140', '60'], ['Author events', '70', '170', '80'], ['New releases', '130', '125', '70']], align: ['l', 'r', 'r', 'r'] } },
    options: [
      'Book-club readers and students, since both groups read regularly and buy several books a year',
      'Gift buyers and students, since both index below 100 on author events, so one offer could skip them',
      'Gift buyers and book-club readers: both value staff recommendations and new releases above average',
      'None of them: segments found from data usually need offers of their own, or they would hardly be separate',
    ],
    answer: 2,
    feedback: {
      0: 'Reading habits aren’t in the table. On the needs measured, students differ from book-club readers on price, recommendations, events and new releases.',
      1: 'Sharing a low index on one need isn’t enough: the two are far apart on price, recommendations and new releases.',
      3: 'Segments can be close neighbours. Two whose needs are similar on what matters most can share an offer, adding a part (events) for one of them.',
    },
    solution: 'Gift buyers and book-club readers both want staff recommendations and new releases well above average and neither cares much about price; one offer built on recommendations and new titles could serve both, with author events added for the book clubs. Students want the opposite on almost every line and would need their own mix.',
  },
  {
    id: 'm05-m3-11', lesson: 'targeting-strategies', type: 'multi', kind: 'conceptual',
    prompt: 'Which are risks of concentrated (niche) marketing? Select all that apply.',
    options: [
      'The chosen segment may shrink, leaving the firm nothing to fall back on.',
      'A larger rival may decide the segment has become worth entering.',
      'Running a separate marketing mix for each segment raises costs.',
      'Messages aimed at very different segments may blur what the brand stands for.',
      'Customers in a niche are usually less loyal than mass-market customers.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'That is a cost of differentiated marketing, which runs several mixes; concentration runs one.',
      3: 'Blurring comes from serving distant segments under one brand, the risk of a differentiated plan.',
      4: 'If anything the opposite: a firm that knows one segment well can build strong loyalty in it.',
    },
    solution: 'Concentration puts all the eggs in one basket: if the segment shrinks or a large rival moves in, there is no other business to fall back on. The costs of several mixes and the blurring of a brand belong to differentiated marketing; niche customers are often loyal.',
  },
];
