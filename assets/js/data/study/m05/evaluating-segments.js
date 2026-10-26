// evaluating-segments.js — M05 · Evaluating segments. Content only; exercises are in evaluating-segments.ex.js.
// Lantern's five segments come from case.js (DERIVED.segments: sizes, spend per head, crosstabs; DERIVED.targeting.fit
// and growth; DERIVED.map: nearest rivals and distances). Ana's weights (4, 4, 2, 2, 4) are this lesson's own fictional
// choice. Cobbleford Cycles and Sorrelbank Software are fictional. Every printed figure is recomputed in `checks`.
import { DERIVED as D, STUDY, BRANDS, LANTERN_STRENGTHS, MARGIN, NEEDS } from './case.js?v=19';
import { weightedScore, perceptualMap, idealDistances } from '../../../core/percmap.js?v=19';
import { targetScores, needsFit } from '../../../core/market.js?v=19';
import { CHANNELS } from '../m02/market.js?v=19';

// ---------------------------------------------------------------- the five segments, as module 2 left them
const S = D.segments, NAMES = S.names, K = NAMES.length;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), GO = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const n = S.sizes.map((s) => s.n), share = S.sizes.map((s) => s.share), head = S.sizes.map((s) => s.perHead);
const spendShare = S.sizes.map((s) => s.spendShare);
const growth = D.targeting.growth, fit = D.targeting.fit;
const room = D.map.nearestRival.map((x) => x.d), rival = D.map.nearestRival.map((x) => BRANDS[x.b]);
const lanternD = D.map.distances.map((row) => row[0]);
const cafe = S.crosstabs.source.map((row, g) => row[0] / n[g]);
const mx = (a) => Math.max(...a), mn = (a) => Math.min(...a);
const sum = (a) => a.reduce((x, y) => x + y, 0);
// margin pool: monthly coffee spend of each segment per 1,000 weekly coffee drinkers, at Lantern's margin after direct costs
const pool = share.map((s, g) => 1000 * s * head[g] * MARGIN);
const pool3 = pool.map((p, g) => p * (1 + growth[g] / 100) ** 3);
// factor scores 0–100: ratio to the best segment (size, spend per head, growth, room); fit centred on 50
const ratio = (a) => a.map((v) => (100 * v) / mx(a));
const maxFit = mx(fit.map(Math.abs));
const SC = { size: ratio(share), head: ratio(head), growth: ratio(growth), room: ratio(room), fit: fit.map((v) => 50 + (50 * v) / maxFit) };
const FS = [SC.size, SC.head, SC.growth, SC.room, SC.fit];
const FACTORS = ['Size', 'Spend per head', 'Growth', 'Room from the nearest rival', 'Fit with Lantern’s strengths'];
const W_ANA = [4, 4, 2, 2, 4];
const tot = (w) => weightedScore(FS, w);
const T_ANA = tot(W_ANA), T_EQ = tot([1, 1, 1, 1, 1]), T_MONEY = tot([1, 1, 0, 0, 0]), T_NOFIT = tot([10, 4, 2, 2, 0]);
const T_ATTR = weightedScore(FS.slice(0, 4), W_ANA.slice(0, 4));
const wsum = (w, g) => sum(FS.map((f, k) => w[k] * f[g]));
const gapCE = wsum(W_ANA, CL) - wsum(W_ANA, EX);
const thrGrowth = W_ANA[2] + gapCE / (SC.growth[EX] - SC.growth[CL]);
const thrSize = W_ANA[0] + gapCE / (SC.size[EX] - SC.size[CL]);
const TG7 = tot([4, 4, 7, 2, 4]), TG8 = tot([4, 4, 8, 2, 4]);
// min–max scaling, for comparison
const minmax = (a) => a.map((v) => (100 * (v - mn(a))) / (mx(a) - mn(a)));
const FM = [minmax(share), minmax(head), minmax(growth), minmax(room), minmax(fit)];
const T_MM = weightedScore(FM, W_ANA);
// the engine's own size, spend and fit scores agree with the ones above
const TS = targetScores({ share, perHead: head, fit });
// Explorers' needs fit by hand: Σ z·s ÷ Σ|s|
const exFit = needsFit([S.centres[EX]], LANTERN_STRENGTHS)[0];
const strong = NEEDS.filter((_, j) => LANTERN_STRENGTHS[j] === 1).map((x) => x.label.toLowerCase());
const weak = NEEDS.filter((_, j) => LANTERN_STRENGTHS[j] === -1).map((x) => x.label.toLowerCase());

// Cobbleford Cycles (fictional bike shop), the simple example
const FH = { names: ['Commuters', 'Club riders', 'Families'], people: [1800, 600, 2400], spend: [240, 900, 150], fit: [80, 40, 60], w: [3, 2, 5] };
const fhS = [ratio(FH.people), ratio(FH.spend), FH.fit];
const fhT = weightedScore(fhS, FH.w);
// Sorrelbank Software (fictional), the challenging example: dental practices (A) against veterinary clinics (B)
const SB = { size: [100, 60], growth: [40, 100], room: [50, 90], fit: [90, 70], w: [4, 2, 2, 4] };
const sbF = [SB.size, SB.growth, SB.room, SB.fit];
const sbSum = (g) => sum(sbF.map((f, k) => SB.w[k] * f[g]));
const sbT = weightedScore(sbF, SB.w);
// robustness of room: distances to the nearest rival on all eight standardised attributes, not just the map's two
const PMAP = perceptualMap(D.map.brandMeans);
const room8 = idealDistances(PMAP, D.map.segIdeal, 8).map((row) => Math.min(...row.slice(1)));
const FS8 = [SC.size, SC.head, SC.growth, ratio(room8), SC.fit];
const T8 = weightedScore(FS8, W_ANA);
const thr8 = W_ANA[2] + (sum(FS8.map((f, k) => W_ANA[k] * f[CL])) - sum(FS8.map((f, k) => W_ANA[k] * f[EX]))) / (FS8[2][EX] - FS8[2][CL]);
// how much of each segment's ideal (squared distance from the map's centre, in standardised units) lies in the map's plane
const inPlane = D.map.segIdeal.map((p) => { const z = p.map((v, a) => (v - PMAP.mu[a]) / PMAP.sd[a]); const q = PMAP.project(p); return (q[0] ** 2 + q[1] ** 2) / sum(z.map((v) => v * v)); });
const goD = D.map.distances[GO];
// each factor's spread of scores, and weight × spread
const spread = FS.map((f) => mx(f) - mn(f));
const pull = spread.map((r, k) => r * W_ANA[k]);
// Value routine's main sources
const vrSrc = S.crosstabs.source[VR].map((v) => v / n[VR]);

// ---------------------------------------------------------------- formatting
const p1 = (v) => `${(v * 100).toFixed(1)}%`, p0 = (v) => `${Math.round(v * 100)}%`;
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
const sg = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;
const money = (v, d = 0) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

// ---------------------------------------------------------------- the attractiveness–fit chart
function fitChart() {
  const X = (a) => 56 + ((a - 40) / 60) * 344, Y = (f) => 318 - f * 2.8;
  const avgA = sum(T_ATTR) / K;
  const t = (x, y, txt, { size = 12, anchor = 'start', fill = 'var(--ink-3)', bold = false } = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}"${bold ? ' font-weight="700"' : ''} fill="${fill}">${txt}</text>`;
  let s = '<svg viewBox="0 0 440 392" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">';
  s += `<line x1="${X(40)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(0)}" style="stroke:var(--rule-strong);stroke-width:1.5"/>`;
  s += `<line x1="${X(40)}" y1="${Y(0)}" x2="${X(40)}" y2="${Y(100)}" style="stroke:var(--rule-strong);stroke-width:1.5"/>`;
  [40, 50, 60, 70, 80, 90, 100].forEach((v) => { s += t(X(v), Y(0) + 18, v, { anchor: 'middle' }); });
  [0, 25, 50, 75, 100].forEach((v) => { s += t(X(40) - 7, Y(v) + 4, v, { anchor: 'end' }); });
  s += `<line x1="${X(40)}" y1="${Y(50)}" x2="${X(100)}" y2="${Y(50)}" style="stroke:var(--ink-3);stroke-width:1;stroke-dasharray:5 4"/>`;
  s += `<line x1="${X(avgA).toFixed(1)}" y1="${Y(0)}" x2="${X(avgA).toFixed(1)}" y2="${Y(100)}" style="stroke:var(--ink-3);stroke-width:1;stroke-dasharray:5 4"/>`;
  s += t(X(100), Y(50) - 6, 'fit 50 = average', { anchor: 'end' });
  s += t(X(avgA) + 6, Y(0) - 7, `average attractiveness ${f1(avgA)}`);
  const pos = { [VR]: [-11, 'end'], [GO]: [11, 'start'], [EX]: [11, 'start'], [CL]: [11, 'start'], [MI]: [-11, 'end'] };
  NAMES.forEach((nm, g) => {
    const x = X(T_ATTR[g]), y = Y(SC.fit[g]), [dx, anchor] = pos[g];
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5 + 9 * share[g]).toFixed(1)}" style="fill:var(--series-1);fill-opacity:0.35;stroke:var(--series-1);stroke-width:1.5"/>`;
    s += t(x + dx, y + (g === CL ? 6 : -2), nm, { size: 14, anchor, fill: 'currentColor', bold: true });
    s += t(x + dx, y + (g === CL ? 21 : 13), `${f1(T_ATTR[g])}, ${f1(SC.fit[g])}`, { size: 12.5, anchor });
  });
  s += t((X(40) + X(100)) / 2, Y(0) + 42, 'Attractiveness (size, spend, growth, room: 4, 4, 2, 2)', { size: 13, anchor: 'middle', fill: 'currentColor' });
  s += `<text transform="translate(16 ${((Y(0) + Y(100)) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle" font-size="13" fill="currentColor">Fit with Lantern’s strengths (0–100)</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'evaluating-segments',
  title: 'Evaluating segments',
  blurb: 'A segment is worth targeting only if it is attractive and you can win it. Score segments on size, spending, growth, competition and fit with a weighted scorecard, find the weight that would change the winner, and screen out targets that would be wrong to pursue.',
  status: 'draft',
  objectives: [
    'Distinguish a segment’s attractiveness (size, growth, profitability, competition, accessibility) from its fit with a company’s objectives and strengths.',
    'Calculate a segment’s margin pool from its size, spend per head and margin, and project it over a planning horizon.',
    'Convert factor measures to 0–100 scores and combine them in a weighted segment scorecard.',
    'Find the threshold weight at which a scorecard’s winner changes, and judge how robust a choice of target is.',
    'Assess competition in a segment from the distance between its ideal point and the nearest rival on a perceptual map.',
    'Evaluate whether targeting a segment is ethical, using product harm and consumer vulnerability.',
  ],
  prerequisites: [
    { lesson: 'm05/profiling-segments', why: 'The five segments, their sizes, spend per head and indexes are taken as given here.' },
    { lesson: 'm01/situation-analysis', why: 'The weighted competitive-strength scorecard there uses the same arithmetic as a segment scorecard.' },
    { lesson: 'b03/what-if-analysis', why: 'Sensitivity analysis and Excel’s data tables test how much the answer depends on the weights.' },
    { lesson: 'm01/market-orientation', why: 'The societal marketing concept and the AMA’s ethical norms frame the ethics of targeting.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is June 2027. Module 2 found five segments in Ana’s needs study of ${STUDY.n} Harbour City adults who drink coffee every week, and named them from their profiles: ${NAMES.map((nm, g) => `<b>${nm}</b> (${n[g]} respondents, ${p1(share[g])})`).join(', ')}. Ana now has to decide which of them Lantern’s cafés, beans and the planned Cold Brew should be built around. Every segment could buy from Lantern; she can’t afford to design for all of them.` },
    { p: 'In <g>STP</g>, segmentation describes a market; <b>targeting</b> chooses. Between the two sits an evaluation, which asks two different questions of every segment. Is it worth having? And can this company win it, and does it want to? A segment can be large, rich and growing and still be the wrong target for a firm that has nothing it wants.' },

    { h: 'Attractiveness and fit' },
    { p: '<g>Segment attractiveness</g> is what makes a segment worth serving for any firm that could serve it well. The open textbook <i>Principles of Marketing</i> (BCcampus edition) lists the features of an attractive market: it is large enough to be profitable given the costs of serving it, it is growing, it is not already swamped by competitors (or the firm has a way to stand out), and it can be reached. Those give five factors to measure.' },
    { list: [
      '<b>Size:</b> how many customers there are.',
      '<b>Growth:</b> whether the segment is getting larger.',
      '<b>Profitability:</b> how much they spend, and what that spending would earn after the cost of serving it, at the firm’s margins.',
      '<b>Competition:</b> how well rivals already serve the segment’s needs.',
      '<b>Accessibility:</b> whether the firm can reach the segment through channels and media at a reasonable cost.',
    ] },
    { p: `<g>Segment fit</g> belongs to the company, not the market. The same textbook asks whether the firm has the resources to compete and whether the segment fits its mission and objectives. A segment that values convenience above all will reward a café chain with outlets everywhere, not a small roaster. Ana’s own view of Lantern is that it is strong on taste and quality, sustainability, being local and independent, and novelty, and weak on price and convenience.` },
    { p: 'The two questions explain why rivals choose differently. Summit Brew, a premium national brand with wide distribution, may find the busy convenience buyers the best target in the city; Lantern, judged on the same data, may not. Attractiveness can be measured once for everyone; fit has to be judged firm by firm.' },

    { h: 'Lantern’s segments on the factors' },
    { table: {
      caption: 'Lantern’s five segments on the measures behind each factor (needs study, May 2027)',
      head: ['Segment', 'Share of respondents', 'Spend per head ($ a month)', 'Growth (% a year)', 'Nearest rival (distance)', 'Fit with Lantern'],
      rows: NAMES.map((nm, g) => [nm, p1(share[g]), f2(head[g]), String(growth[g]), `${rival[g]} (${f2(room[g])})`, sg(fit[g])]),
      align: ['l', 'r', 'r', 'r', 'l', 'r'],
      note: 'Spend is monthly coffee spend. Growth is Ana’s estimate for the next three years (fictional). The distance runs from the segment’s ideal point to the nearest rival brand on the perceptual map of module 4: the smaller it is, the better a rival already matches what the segment wants, as far as the map can tell (see the caveats under Competition). Fit is Σ z·k ÷ Σ|k| from Ana’s marks for Lantern’s strengths (formula below): 0 means no better than the average respondent.',
    } },
    { p: `No segment leads on everything, which is why the evaluation needs a method. Value routine is the largest group but spends least: ${money(head[VR], 2)} a month per head. Craft and local is among the smallest, yet spends most per head (${money(head[CL], 2)}) and fits Lantern best. Explorers is expected to grow fastest. On the go and Mindful each have a rival sitting close to their ideal: Corner Cup and Arcadia Coffee.` },
    { p: 'The scorecard later in this lesson uses one measure for each factor. Size is the share of respondents. Spend per head stands in for profitability: one margin applies to every segment, so spending ranks the segments exactly as margin would. Growth is Ana’s estimate, competition is the room left by the nearest rival, and fit is the last column; accessibility is used as a screen rather than scored, for reasons given below.' },

    { h: 'Size in money: the margin pool' },
    { p: `Counting people is only half of size. A segment’s <g>margin pool</g> multiplies its people by their <g>spend per head</g> and by the firm’s margin: the margin the segment’s whole spending would earn if the firm won all of it. No firm wins all of it, so the pool is a ceiling, not a forecast; its use is comparing segments. (“Margin pool” is this lesson’s own label; the “profit pool” of strategy writing is a different idea.) Ana estimates (a fictional figure) that Lantern keeps ${(MARGIN * 100).toFixed(0)}% of café and bean sales after the direct costs of making and serving them, café staff time included: less than the 52% <g>gross margin</g> F02 found on the online shop, which carries no café staff.` },
    { p: `Per 1,000 weekly coffee drinkers in the study’s mix, On the go spends enough each month to give a pool of ${money(pool[GO])} at that margin, Craft and local ${money(pool[CL])}, Explorers ${money(pool[EX])}, Mindful ${money(pool[MI])} and Value routine ${money(pool[VR])}. The largest segment by headcount has the smallest pool. Grown for three years at Ana’s estimates, Craft and local’s pool becomes ${money(pool3[CL])} and Explorers’ ${money(pool3[EX])}: fast growth from a smaller base doesn’t catch up within her horizon.` },
    { p: 'Keeping the two questions apart on a chart borrows an old idea from strategy. The GE–McKinsey nine-box matrix, which dates from the early 1970s, judges a business unit by two separate measures, the attractiveness of its industry and the unit’s competitive strength in it, rather than by one combined score. The chart below does the same for Lantern’s segments, scoring them as in the scorecard later in this lesson.' },
    { figure: {
      svg: fitChart(),
      caption: 'Lantern’s segments by attractiveness and by fit, scored as in the scorecard below. A single total would hide what this shows: On the go has the largest money size but only average attractiveness once growth and room count, and it fits Lantern badly.',
      alt: `A scatter chart. The horizontal axis is attractiveness from 40 to 100, combining size, spend per head, growth and room from the nearest rival with weights 4, 4, 2 and 2. The vertical axis is fit with Lantern’s strengths from 0 to 100, with a dashed line at 50 marking no better than the average respondent, and a dashed vertical line at the average attractiveness of ${f1(sum(T_ATTR) / K)}. Each segment is a circle sized by its share of respondents. ${NAMES.map((nm, g) => `${nm}: attractiveness ${f1(T_ATTR[g])}, fit ${f1(SC.fit[g])}`).join('. ')}. Craft and local is top right, Explorers just below it, Mindful high on fit but low on attractiveness, On the go about average on attractiveness but low on fit, and Value routine low on both.`,
    } },
    { callout: 'key', title: 'Two questions, kept apart', html: 'Attractiveness is a property of the segment; fit is a relation between the segment and your company. Score them separately before you combine them, so a big number on one can’t hide a weakness on the other.' },
  ],

  theory: [
    { h: 'Measuring each factor honestly' },
    { p: `<b>Size.</b> Lantern’s sizes are shares of ${STUDY.n} people from an <g>opt-in panel</g> with quotas on age band only (a <g>quota sample</g>, M04). Within an age band, the panel’s members may drink more or less coffee than the city’s, so a segment’s share of respondents is an estimate of its share of the market with an unknown bias. Comparing segments is safer than quoting their sizes as market facts, and a size that decides the choice deserves a check against other evidence.` },
    { p: `<b>Profitability.</b> The margin pool uses one margin, ${(MARGIN * 100).toFixed(0)}%, for every segment, so its ranking is the same as the ranking of spending. A fuller analysis would use a margin for what each segment buys. M02 showed that a can sold through a supermarket loses 32% of its price to the retailer, while a café sale keeps it all; a segment that buys in supermarkets earns Lantern less per dollar it spends. The cost of serving a segment (delivery, staff time, discounts) belongs here too.` },
    { p: '<b>Growth.</b> Ana’s growth rates are her own judgements, not data. Use them to project size over the planning horizon with compound growth, and treat them as the first candidate for the sensitivity test below: the less certain a factor, the more it matters to know whether it decides the answer.' },
    { p: '<b>Competition.</b> A segment is contested when a rival already offers what it wants. Module 4’s lesson <a href="../perceptual-maps/">Perceptual maps</a> builds the tool used here. A perceptual map places brands by how customers rate them, so that brands seen as alike sit close together; a segment’s ideal point is its members’ ideal coffee placed on the same map; and the straight-line distance between an ideal point and a brand says how far the brand is from what the segment wants. The distance from a segment’s ideal to the nearest rival is a measure of how much <b>room</b> is left.' },
    { p: `Room is small for Mindful (${f2(room[MI])}, Arcadia Coffee) and On the go (${f2(room[GO])}, Corner Cup) and largest for Craft and local (${f2(room[CL])}, Arcadia Coffee). Lantern itself sits ${f2(lanternD[CL])} from the Craft and local ideal, nearer than any rival, but on the ratings of only ${D.map.counts[0]} people who know it.` },
    { p: `Treat room as a rough guide. The map’s two dimensions carry ${p1(D.map.cumulative[1])} of the differences between the brands, not of the ideal points: only ${p0(inPlane[EX])} of Explorers’ ideal (its squared distance from the map’s centre) lies in the map’s plane, against ${p0(Math.min(...inPlane.filter((_, g) => g !== EX)))} to ${p0(Math.max(...inPlane))} for the other segments. A brand’s position is everyone’s average rating of it, not the segment’s own view; the nearest rival ignores crowding (On the go also has Summit Brew at ${f2(goD[1])} and Daily Grind RTD at ${f2(goD[2])}); and a large distance can be a gap that is empty for a reason. As a check, room measured across all eight standardised attributes gives distances of ${room8.map(f2).join(', ')} and room scores of ${ratio(room8).map(f1).join(', ')}. With them Ana’s totals become ${T8.map(f1).join(', ')}: Craft and local still leads, and growth’s threshold weight (below) falls from about ${f1(thrGrowth)} to about ${f1(thr8)}.` },
    { p: `<b>Accessibility.</b> All five segments live in Harbour City and buy coffee every week, so none is out of reach. The useful question is the cost of reaching them. Lantern’s cafés already meet the people who mostly buy coffee at a café: ${p1(cafe[CL])} of Craft and local and ${p1(cafe[EX])} of Explorers, against ${p1(cafe[VR])} of Value routine, who mostly brew at home (${p0(vrSrc[1])}) or buy in supermarkets (${p0(vrSrc[2])}). When a factor is all or nothing (a licence you lack, customers you can’t legally serve), treat it as a screen before scoring, as with the must-haves in M01’s <g>weighted competitive-strength scorecard</g>.` },
    { p: '<b>Fit.</b> The fit score compares a segment’s needs with what the company is good at. Each <g>segment centre</g> from module 2 gives the segment’s mean on each need in standardised units (z-scores: 0 is the average respondent). Ana marks each need +1 where Lantern is strong, −1 where it is weak and 0 otherwise; a segment’s fit is the sum of its z-scores times those marks, divided by the number of marked needs. A positive fit means the segment cares more than the average respondent about what Lantern does well, or less about what it does badly.' },
    { p: `The map gives a cross-check of Ana’s self-assessment: the distance from Lantern to each segment’s ideal. Lantern is nearest the Craft and local ideal (${f2(lanternD[CL])}) and Explorers’ (${f2(lanternD[EX])}), and farthest from Value routine’s (${f2(lanternD[VR])}), the same order as the fit scores at both ends. When a company’s view of its strengths and its customers’ view disagree, believe the customers and find out why.` },

    { h: 'From measures to scores' },
    { p: 'The factors are in different units: percentages, dollars, map distances, z-scores. Before they can be added they must be put on one scale, usually 0 to 100. The simplest rule for a factor where more is better is the <b>ratio to the best</b>: divide each segment’s value by the best segment’s and multiply by 100. The best scores 100 and the others keep their proportions, so a segment half as large scores 50.' },
    { p: 'Fit can be negative, so it needs a different rule: centre it on 50 (no better than average) and scale it by the largest fit in either direction, so the segment furthest from average scores 100 (or 0, if its fit is negative) and every other segment falls between. For Lantern the best fit is also the largest, so Craft and local scores 100. These are the rules the site’s targeting engine uses. For a factor where less is better, such as cost to serve, invert the ratio: the cheapest segment’s cost divided by each segment’s.' },
    { p: `A common alternative, <b>min–max scaling</b>, sets the worst segment to 0 and the best to 100. It stretches small differences: Lantern’s segments range only from ${p1(mn(share))} to ${p1(mx(share))} of respondents, but under min–max Craft and local’s size becomes ${f1(FM[0][CL])} and Mindful’s 0. Choose the rule before you score, and say which you used.` },

    { h: 'Weights come from objectives' },
    { p: 'The weights say how much each factor matters to this decision. They should come from the company’s objectives and be set before the scores are seen; weights chosen afterwards tend to be the ones that crown the segment someone already wanted. Weights are relative: the total is divided by their sum, so 4, 4, 2, 2, 4 gives the same result as 2, 2, 1, 1, 2. It is the arithmetic of the <g>weighted-attribute model</g> from M01, applied by the seller to segments.' },
    { p: 'Ana wants Lantern to grow its sales without becoming a different business, so she gives size, spend per head and fit 4 each. Growth and room get 2 each: they matter to her, but less than the money Lantern can earn in the next few years and the strengths it can build on. These weights are this lesson’s example, and the choice is hers to defend.' },
    { p: `A weight is not the whole story: a factor’s pull on the totals is its weight times the spread of its scores. Lantern’s size scores run only from ${f1(mn(SC.size))} to 100, a range of ${f1(spread[0])}, while fit runs from ${f1(mn(SC.fit))} to 100, a range of ${f1(spread[4])}. Weight × range is ${FACTORS.map((f, k) => `${['size', 'spend per head', 'growth', 'room', 'fit'][k]} ${Math.round(pull[k])}`).join(', ')}: size and fit both weigh 4, but fit can move a segment’s total about ${['', 'one', 'two', 'three', 'four'][Math.round(pull[4] / pull[0])]} times as far. When you ask what drives a ranking, look at these products, not only at the weights.` },
    { table: {
      caption: 'Lantern’s segment scorecard: factor scores (0–100) and weighted scores with Ana’s weights',
      head: ['Factor (weight)', ...NAMES],
      rows: [...FACTORS.map((f, k) => [`${f} (${W_ANA[k]})`, ...FS[k].map(f1)])],
      foot: [['Weighted score', ...T_ANA.map(f1)]],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      note: 'Size, spend per head, growth and room: ratio to the best segment × 100. Fit: 50 + 50 × fit ÷ the largest absolute fit. Weighted score: Σ weight × score ÷ Σ weights.',
    } },
    { p: `Craft and local leads with ${f1(T_ANA[CL])}, ahead of Explorers (${f1(T_ANA[EX])}), Mindful (${f1(T_ANA[MI])}), On the go (${f1(T_ANA[GO])}) and Value routine (${f1(T_ANA[VR])}). With every weight equal the order is the same (${f1(T_EQ[CL])} against ${f1(T_EQ[EX])} for the top two).` },

    { h: 'How sensitive is the winner?' },
    { p: 'A scorecard’s total looks precise, but it is built from judgements: the weights, the growth estimates, the fit marks. <g>Sensitivity analysis</g> (B03) asks how far each judgement would have to move to change the answer. For a weighted scorecard there is a neat way to find out. Take the leader A and a challenger B, and a factor on which B scores higher. Raising that factor’s weight by Δ changes A’s weighted sum minus B’s by Δ times the difference in their scores on it, so the two tie when Δ equals the gap in weighted sums divided by B’s advantage on that factor: the <g>threshold weight</g>.' },
    { p: `For Lantern, Craft and local’s weighted sum beats Explorers’ by ${f1(gapCE)} points (before dividing by the total weight of 16), and Explorers scores ${f1(SC.growth[EX] - SC.growth[CL])} points higher on growth. Growth’s weight would have to rise by ${f1(gapCE)} ÷ ${f1(SC.growth[EX] - SC.growth[CL])} ≈ ${f1(thrGrowth - W_ANA[2])}, from 2 to about ${f1(thrGrowth)}, for Explorers to draw level: at 7 Craft and local still leads (${f1(TG7[CL])} against ${f1(TG7[EX])}), at 8 Explorers does (${f1(TG8[EX])} against ${f1(TG8[CL])}). On size, the only other factor where Explorers is ahead, the weight would have to reach about ${f1(thrSize)}. Lowering fit, room or spend per head, even to zero, never puts Explorers in front.` },
    { p: `Other judgements can be tested the same way. A firm that cared only about money size, size and spend per head weighted equally, would put On the go narrowly first (${f1(T_MONEY[GO])} against ${f1(T_MONEY[CL])}). A firm that ignored fit and weighted size heavily (10, 4, 2, 2, 0) would choose Explorers (${f1(T_NOFIT[EX])} against ${f1(T_NOFIT[CL])}). Under min–max scaling with Ana’s weights, Craft and local still leads (${f1(T_MM[CL])} against ${f1(T_MM[EX])}). In Excel, a <g>data table</g> with the growth weight as its input cell shows the whole curve at once.` },
    { p: 'The conclusion is not “Craft and local scored 88.8”. It is: Craft and local leads unless growth matters nearly four times as much to Ana as she now says, or unless she both drops fit and weights size far above the rest. That statement tells her which judgement to examine (her growth estimates) and what evidence would change her mind.' },

    { h: 'What a scorecard can’t do' },
    { list: [
      '<b>It is compensatory.</b> A high score on one factor makes up for a low one. Screen out segments that fail an absolute requirement (legal, ethical, or beyond the company’s reach) before scoring.',
      '<b>It can count one thing twice.</b> The margin pool is size times spend, so a scorecard with size, spend per head and the pool gives size two votes. Strongly correlated measures, such as fit and the share already buying at a café, do something similar: they reward the same difference twice.',
      '<b>Its precision is false.</b> Scores built from estimates and judgements can’t separate segments a few points apart. Treat a lead that a reasonable change of weights reverses as a tie, and decide it on other grounds.',
      '<b>It can’t supply the objectives.</b> The weights carry the company’s strategy. A scorecard makes a choice explicit and testable; it doesn’t make the choice.',
    ] },

    { h: 'Ethics: who should not be targeted, and how' },
    { p: 'Targeting means concentrating persuasion on chosen people, and that raises ethical questions that attractiveness ignores. OpenStax’s <i>Principles of Marketing</i> (section 5.7) puts the problem in who is targeted and why: choosing a group is not wrong in itself, but it can exploit people less able to judge a marketing message. Its examples include young children, older adults drawn by promises about health, and low-income consumers drawn by offers such as high-interest credit. On children it cites the American Psychological Association: until about seven or eight, children can’t recognise that an advertisement is trying to sell to them.' },
    { p: 'N. Craig Smith and Elizabeth Cooper-Martin (1997) found that the public’s unease about targeting rises with two things: how harmful the product is and how vulnerable the targeted consumers are; the concern was not confined to harmful products. A useful screen asks both questions. A sports drink aimed at club athletes raises little concern; high-interest loans aimed at people in financial difficulty raise a great deal, even if the segment scores well. The AMA’s Statement of Ethics, met in M01, asks marketers to “recognize the needs of, and commitments to, vulnerable market segments”, and the <g>societal marketing concept</g> asks them to weigh customers’ long-term interests.' },
    { p: 'Not targeting a segment is not unethical in itself: every targeting decision leaves people out. OpenStax warns about the opposite error too, excluding people on assumptions (that low-income buyers can’t afford a product, say) rather than evidence. Exclusion becomes a legal issue when it touches protected characteristics: in the United States, for example, in advertising housing, jobs and credit.' },
    { p: 'For Lantern the screen mostly passes: coffee is a mild product sold to adults. Two cautions remain. On the go values “a strong caffeine kick” more than any other segment, and a Cold Brew campaign built on energy, run on social media, would reach under-18s and people for whom caffeine is a health risk; claims about caffeine need care. And Value routine’s price sensitivity makes it the segment where a misleading discount would do most harm.' },
  ],

  formulas: [
    { id: 'es-margin-pool', name: 'Margin pool of a segment',
      tex: String.raw`\Pi_s = n_s \times \bar{x}_s \times m`,
      where: [
        [String.raw`\Pi_s`, 'Margin pool: the margin the segment’s whole spending would earn at the firm’s margin', '$ per period'],
        [String.raw`n_s`, 'Number of customers in segment s (or its share times the market’s size)', 'people'],
        [String.raw`\bar{x}_s`, 'Spend per head in the segment over the period', '$ per person per period'],
        ['m', 'The firm’s margin on what the segment buys, after the direct costs of making and serving it, as a share of sales', ''],
      ],
      assumptions: 'The firm could sell the segment what it now buys at the margin m. The pool is a ceiling for comparing segments, not a sales forecast.',
      note: 'Per 1,000 people in the market, use n_s = 1,000 × the segment’s share. Use a margin per segment when segments buy through channels with different margins.' },
    { id: 'es-future-pool', name: 'A segment’s size after t years of growth',
      tex: String.raw`n_{s,t} = n_{s,0} \times (1 + g_s)^{t}`,
      where: [
        [String.raw`n_{s,t}`, 'Size of segment s after t years (people, spend or margin pool)', 'as n_{s,0}'],
        [String.raw`n_{s,0}`, 'Size now', 'people or $'],
        [String.raw`g_s`, 'Growth rate a year, as a decimal (6% = 0.06)', ''],
        ['t', 'Years ahead', 'years'],
      ],
      assumptions: 'Growth is the same every year (compound growth, as in a CAGR).' },
    { id: 'es-ratio-score', name: 'Factor score: ratio to the best segment',
      tex: String.raw`s_{f,j} = 100 \times \dfrac{x_{f,j}}{\max_k x_{f,k}}`,
      where: [
        [String.raw`s_{f,j}`, 'Score of segment j on factor f', '0–100'],
        [String.raw`x_{f,j}`, 'Segment j’s measure on factor f (share, spend, growth, room), higher is better', 'the factor’s units'],
        [String.raw`\max_k x_{f,k}`, 'The best segment’s measure on that factor', 'the factor’s units'],
      ],
      assumptions: 'The measure is positive and more is better. For a measure where less is better, use 100 × (smallest value ÷ x).',
      note: 'Min–max scaling, 100 × (x − min) ÷ (max − min), sets the worst segment to 0 and stretches small differences.' },
    { id: 'es-needs-fit', name: 'Needs fit',
      tex: String.raw`\text{fit}_j = \dfrac{\sum_i z_{j,i}\, k_i}{\sum_i |k_i|}`,
      where: [
        [String.raw`\text{fit}_j`, 'Average match between what segment j wants and what the company is good at; 0 = no better than the average respondent', 'z (standard deviations)'],
        [String.raw`z_{j,i}`, 'Segment j’s mean on need i in standardised units (its centre)', 'z'],
        [String.raw`k_i`, 'The company’s mark for need i: +1 strong, 0 average, −1 weak', ''],
      ],
      assumptions: 'The marks are the company’s honest view of its strengths; check them against customers’ ratings.',
      note: 'This is <code>needsFit</code> in the site’s market engine. Only marked needs count in the divisor, so changing a mark to 0 changes both the sum and the divisor.' },
    { id: 'es-fit-score', name: 'Fit score (centred on 50)',
      tex: String.raw`s_{\text{fit},j} = 50 + 50 \times \dfrac{\text{fit}_j}{\max_l |\text{fit}_l|}`,
      where: [
        [String.raw`s_{\text{fit},j}`, 'Fit score of segment j', '0–100'],
        [String.raw`\text{fit}_j`, 'Segment j’s needs fit', 'z'],
        [String.raw`\max_l |\text{fit}_l|`, 'The largest fit in either direction among the segments compared', 'z'],
      ],
      assumptions: 'Fit can be negative, so the ratio to the best won’t do; 50 means no better than average.',
      note: 'The segment furthest from average sits at 100 (or at 0, if its fit is negative); the others keep their proportions around 50.' },
    { id: 'es-weighted-score', name: 'Weighted segment score',
      tex: String.raw`S_j = \dfrac{\sum_f w_f\, s_{f,j}}{\sum_f w_f}`,
      where: [
        [String.raw`S_j`, 'Weighted score of segment j', '0–100'],
        [String.raw`w_f`, 'Weight of factor f, set from the objectives before scoring', 'relative (any scale)'],
        [String.raw`s_{f,j}`, 'Segment j’s score on factor f', '0–100'],
      ],
      assumptions: 'The factors can compensate for one another; must-haves have been screened out first.',
      note: 'Dividing by the sum of the weights keeps the score on 0–100 whatever scale the weights use.' },
    { id: 'es-threshold-weight', name: 'Threshold weight: the change that ties two segments',
      tex: String.raw`\Delta w_f = \dfrac{T_A - T_B}{s_{f,B} - s_{f,A}}`,
      where: [
        [String.raw`\Delta w_f`, 'Rise in factor f’s weight, others fixed, at which segment B draws level with segment A', 'weight units'],
        [String.raw`T_A,\ T_B`, 'Weighted sums Σ w s of the leader A and the challenger B, before dividing by the total weight', 'weight × score'],
        [String.raw`s_{f,A},\ s_{f,B}`, 'The two segments’ scores on factor f', '0–100'],
      ],
      assumptions: 'B scores higher than A on factor f; otherwise raising the weight never closes the gap. Only one weight changes at a time.',
      note: 'A negative Δ with the signs reversed tells you how far lowering a weight on which A leads would have to go; if that would take the weight below zero, no reduction of it alone changes the winner.' },
    { id: 'es-room', name: 'Room from the nearest rival',
      tex: String.raw`r_j = \min_{b \ne \text{own}} d(\text{ideal}_j, b)`,
      where: [
        [String.raw`r_j`, 'Distance on the perceptual map from segment j’s ideal point to the nearest rival brand', 'map units'],
        [String.raw`d(\text{ideal}_j, b)`, 'Straight-line distance between the ideal point and brand b on the map’s two dimensions', 'map units'],
        ['b', 'Each brand on the map other than the company’s own', ''],
      ],
      assumptions: 'The map’s two dimensions capture most of how customers see the brands and the ideal points, and each brand’s position rests on enough ratings. A brand’s position is everyone’s average view of it, not the segment’s own.',
      note: 'Score room with the ratio to the best: 100 × r_j ÷ the largest r. Module 4 builds the map and its distances. The nearest rival ignores crowding (a second rival close behind), and a large distance may be a gap that is empty for a reason; measuring the distance on all the attributes is a useful check. Room measures perceived competition only; a rival’s capacity, prices and plans still need a competitor analysis.' },
  ],

  examples: [
    { level: 'simple', title: 'Which riders should a bike shop build around?', fictional: true,
      setup: `Cobbleford Cycles, a bike shop in a market town, has three segments of local riders. Commuters: about ${FH.people[0].toLocaleString('en-US')} people, spending $${FH.spend[0]} a year each on bikes, parts and repairs. Club riders: ${FH.people[1]} people, $${FH.spend[1]}. Families: ${FH.people[2].toLocaleString('en-US')} people, $${FH.spend[2]}. The owner scores fit with the shop’s strengths (fast repairs, a small showroom) at ${FH.fit.join(', ')} out of 100. Her weights: size ${FH.w[0]}, spend ${FH.w[1]}, fit ${FH.w[2]}. Score the segments.`,
      steps: [
        String.raw`Score size as a ratio to the largest segment (the ratio-to-best formula), Families with ${FH.people[2].toLocaleString('en-US')}: Commuters <m>100 \times 1{,}800 \div 2{,}400 = 75</m>, Club riders <m>100 \times 600 \div 2{,}400 = 25</m>, Families 100.`,
        String.raw`Score spend the same way against the club riders’ $900: Commuters <m>100 \times 240 \div 900 \approx 26.7</m>, Club riders 100, Families <m>100 \times 150 \div 900 \approx 16.7</m>. Fit is already on 0–100.`,
        String.raw`Weight and add, then divide by the total weight of 10 (the weighted-score formula). Commuters: <m>(3 \times 75 + 2 \times 26.7 + 5 \times 80) \div 10 \approx ${f1(fhT[0])}</m>. Club riders: <m>(3 \times 25 + 2 \times 100 + 5 \times 40) \div 10 = ${f1(fhT[1])}</m>. Families: <m>(3 \times 100 + 2 \times 16.7 + 5 \times 60) \div 10 \approx ${f1(fhT[2])}</m>.`,
        String.raw`Check the money size behind the scores: people × spend is $${(FH.people[0] * FH.spend[0]).toLocaleString('en-US')} a year for commuters, $${(FH.people[1] * FH.spend[1]).toLocaleString('en-US')} for club riders and $${(FH.people[2] * FH.spend[2]).toLocaleString('en-US')} for families. The club riders’ pool is the largest, but they are few and fit the shop worst.`,
      ],
      answer: `Commuters ${f1(fhT[0])}, Families ${f1(fhT[2])}, Club riders ${f1(fhT[1])}: commuters lead.`,
      interpretation: 'Commuters win because the owner weights fit most and the shop’s fast repairs suit them. The club riders spend most in total; a shop that weighted money size heavily might choose them. The scores make that trade-off visible rather than settling it.' },

    { level: 'challenging', title: 'How fragile is a software firm’s choice?', fictional: true,
      setup: `Sorrelbank Software sells booking software to small clinics. Its scorecard compares dental practices (A) and veterinary clinics (B) on four factors scored 0–100. Size: A ${SB.size[0]}, B ${SB.size[1]}. Growth: A ${SB.growth[0]}, B ${SB.growth[1]}. Room from rivals: A ${SB.room[0]}, B ${SB.room[1]}. Fit: A ${SB.fit[0]}, B ${SB.fit[1]}. The weights are ${SB.w.join(', ')}. Which segment leads, and how much would each weight have to change for the other to draw level?`,
      steps: [
        String.raw`Weighted sums (Σ w s): A <m>4 \times 100 + 2 \times 40 + 2 \times 50 + 4 \times 90 = ${sbSum(0)}</m>; B <m>4 \times 60 + 2 \times 100 + 2 \times 90 + 4 \times 70 = ${sbSum(1)}</m>. Divided by the total weight of 12: A ${f1(sbT[0])}, B ${f1(sbT[1])}. A leads by ${sbSum(0) - sbSum(1)} in the sums.`,
        String.raw`Growth favours B by <m>100 - 40 = 60</m> points. The threshold-weight formula: <m>\Delta w = 40 \div 60 \approx 0.67</m>, so growth’s weight need only rise from 2 to about 2.7.`,
        String.raw`Room favours B by 40: <m>\Delta w = 40 \div 40 = 1</m>, from 2 to 3.`,
        String.raw`Size and fit favour A, so raising them only widens the gap. Lowering them works the other way: size’s weight from 4 to <m>4 - 40 \div 40 = 3</m>, or fit’s from 4 to <m>4 - 40 \div 20 = 2</m>, makes the two level.`,
      ],
      answer: `Dental practices lead, ${f1(sbT[0])} against ${f1(sbT[1])}, but a rise of less than one point in the weight on growth, or of one point on room, would tie them.`,
      interpretation: 'The lead is too fragile to rest a strategy on: any of four small, defensible changes in the weights reverses it. Sorrelbank should treat the segments as a tie on this evidence and look harder at the factor that matters most to the difference, growth, where veterinary clinics’ advantage is a forecast. A pilot in each segment would tell it more than a finer scorecard.' },

    { level: 'applied', title: 'Lantern’s scorecard and the judgement that decides it', fictional: true,
      setup: 'Ana has the five segments’ measures (the first table in this lesson) and her weights: size 4, spend per head 4, growth 2, room 2, fit 4. Score the segments, find the leader, and find what would make the runner-up overtake it.',
      steps: [
        `Score each factor (ratio to the best for size, spend per head, growth and room; centred for fit). For Craft and local: size 100 × ${n[CL]} ÷ ${n[VR]} ≈ ${f1(SC.size[CL])}; spend per head 100 (the best); growth 100 × 6 ÷ 9 ≈ ${f1(SC.growth[CL])}; room 100 (the most room); fit 100 (the best fit). The other segments’ scores are in the scorecard table.`,
        `Weighted scores (Σ w s ÷ 16): Craft and local ${f1(T_ANA[CL])}, Explorers ${f1(T_ANA[EX])}, Mindful ${f1(T_ANA[MI])}, On the go ${f1(T_ANA[GO])}, Value routine ${f1(T_ANA[VR])}.`,
        `Threshold for the runner-up. The weighted sums differ by ${f1(gapCE)}; Explorers leads on growth by ${f1(SC.growth[EX] - SC.growth[CL])} and on size by ${f1(SC.size[EX] - SC.size[CL])}. Growth’s weight would have to rise by about ${f1(thrGrowth - W_ANA[2])} (to ${f1(thrGrowth)}), size’s by about ${f1(thrSize - W_ANA[0])} (to ${f1(thrSize)}).`,
        `Check attractiveness and fit separately (the chart in this lesson). Craft and local is first on both. Explorers is second on attractiveness (${f1(T_ATTR[EX])}) and third on fit (${f1(SC.fit[EX])}); On the go is third on attractiveness (${f1(T_ATTR[GO])}) but fourth of five on fit (${f1(SC.fit[GO])}).`,
      ],
      answer: `Craft and local leads with ${f1(T_ANA[CL])}. Of the single-weight changes, Explorers (${f1(T_ANA[EX])}) would overtake only if growth’s weight rose above about ${f1(thrGrowth)}, nearly four times Ana’s 2, or size’s above about ${f1(thrSize)}.`,
      interpretation: 'The choice of Craft and local as Lantern’s first target is robust: of the single changes, only a much heavier weight on growth (itself built on Ana’s estimates) or a far heavier one on size reverses it, and dropping fit reverses it only if size is also weighted far above the rest. Explorers is a strong second and shares Craft and local’s interest in taste and novelty, which the next lesson uses when it asks whether to serve one segment or two. On the go’s weakness is fit, not size: it would suit a firm with Corner Cup’s outlets better than Lantern.' },
  ],

  demo: [
    { widget: 'es-scorecard', intro: 'Lantern’s scorecard with the five weights on sliders, starting at Ana’s 4, 4, 2, 2, 4. Raise growth one step at a time and find where Explorers overtakes Craft and local; then put growth back and set fit to 0, then size to 10. The note recomputes the threshold for whichever segment is second.' },
    { widget: 'es-sheet', intro: 'The same scorecard in Excel. Rows 9–13 turn the measures into scores and column G weights them with the weights in row 15. B17 holds Craft and local’s lead over Explorers. Build the data table as set (D15, the growth weight, is the column input cell) and read where the lead turns negative. Then change a measure, such as Explorers’ growth in D4, and watch every score that depends on it move.' },
  ],

  mistakes: [
    { title: '“The biggest segment is the best target.”', html: 'Size is one factor of five. Value routine is Lantern’s largest segment, yet it has the smallest margin pool and the worst fit. Size in people, size in money and fit can point in different directions; score them separately.' },
    { title: '“The scorecard’s total is the answer.”', html: 'The total depends on weights and estimates that are judgements. Report the leader together with the threshold weights that would change it; a lead that a small, reasonable change reverses is a tie.' },
    { title: '“Set the weights once you see which segment you like.”', html: 'Weights chosen after the scores tend to confirm a favourite. Set them from the objectives before scoring, write down why, and then test them.' },
    { title: '“Add every measure you have.”', html: 'Measures that overlap count the same thing twice: the margin pool already contains size and spend per head. Strongly correlated measures, such as fit and the share already buying at a café, reward the same difference twice too. Choose one measure per factor.' },
    { title: '“Min–max scaling is the neutral choice.”', html: 'It makes the worst segment 0 and the best 100 however close they are, which exaggerates small differences. The ratio to the best keeps proportions. Neither is neutral; pick one before scoring and say which.' },
    { title: '“If the people are adults and the product is legal, any target is fine.”', html: 'Ethical concern rises with the harm a product can do and with the vulnerability of the people targeted. Screen segments for both before scoring, and remember that how you target (the claims, the channels, who else the message reaches) matters as much as whom.' },
  ],

  application: [
    { p: 'In a company, the output of this lesson is a recommendation a manager can challenge: the leading segment, the runner-up, the threshold weights that separate them, and the evidence that would move them. A good targeting memo puts the sensitivity in the first paragraph, not an appendix, because it tells the reader which disagreement matters.' },
    { case: `Ana’s summary for Lantern reads like this. Craft and local leads with ${f1(T_ANA[CL])} out of 100, ahead of Explorers (${f1(T_ANA[EX])}); it has the highest spend per head, the most room from rivals and the best fit, and ${p1(cafe[CL])} of it buys coffee mostly at a café, the channel Lantern already runs. Of the single-weight changes, only a growth weight nearly four times hers, or a size weight about ${f1(thrSize / W_ANA[0])} times hers, would put Explorers ahead (dropping fit does so only if size is also weighted far above the rest), so the next thing to test is her growth estimate for Explorers. On the go has the largest money size but fits Lantern poorly, and Corner Cup is already close to what it wants; Mindful comes third (${f1(T_ANA[MI])}) and Value routine last. Whether Lantern should serve one segment or more, and with which offers, is the targeting strategy of the next lesson.` },
    { p: `Two habits make the method trustworthy. First, separate the measured factors from the judged ones: size and spend per head come from the survey, growth and fit marks from Ana, room from a map on which Lantern’s own position rests on only ${D.map.counts[0]} ratings. Second, test the judged ones hardest. If the decision survives every reasonable change to them, it is robust; if it doesn’t, the scorecard has told you where to spend the next research budget.` },
    { p: 'The same scorecard serves very different firms. A bank choosing between small-business segments might weight the cost to serve and the risk of default; a travel company might add seasonality. A software firm like Sorrelbank, in a fast-moving market, might put growth first. The factors change with the industry, and the weights with the company’s objectives; the discipline of scoring attractiveness and fit separately, screening first and testing the weights does not.' },
  ],

  summary: [
    'Evaluating a segment asks two questions: is it attractive (size, growth, profitability, competition, accessibility), and does it fit the company’s objectives and strengths?',
    'The margin pool, people × spend per head × margin, measures size in money; it is a ceiling for comparing segments, not a forecast.',
    'Put each factor on a 0–100 scale (the ratio to the best keeps proportions; fit is centred on 50), weight the scores from the objectives and divide by the total weight.',
    'A threshold weight, the gap in weighted sums divided by the challenger’s advantage on a factor, shows how far a judgement must move to change the winner.',
    'Competition can be read, roughly, from a perceptual map as the distance from a segment’s ideal to the nearest rival; check it against the map’s limits and on all the attributes.',
    'Scorecards are compensatory and falsely precise: screen must-haves first, don’t count a measure twice, and treat fragile leads as ties.',
    'Targeting is unethical when it exploits vulnerability: concern rises with product harm and consumer vulnerability, and with how the targeting is done.',
  ],

  glossary: [
    { term: 'Segment attractiveness', def: 'How worth serving a segment is for any firm that could serve it well: its size, growth and profitability, how well rivals already serve it, and how easily it can be reached.' },
    { term: 'Segment fit', def: 'How well a segment matches a particular company’s objectives, resources and strengths: whether the company can win the segment and wants to.' },
    { term: 'Margin pool', def: 'The margin a segment’s whole spending would earn at a firm’s margin: customers × spend per head × margin. A ceiling for comparing segments, not a sales forecast.' },
    { term: 'Weighted segment scorecard', def: 'A comparison of segments in which each is scored 0–100 on factors of attractiveness and fit, each score is multiplied by the factor’s weight, and the weighted scores are added and divided by the total weight.' },
    { term: 'Threshold weight', def: 'The weight a factor would need, with every other weight unchanged, for a weighted scorecard to rank two options equal; beyond it the order changes.' },
    { term: 'Vulnerable consumers', def: 'People less able than most to judge a marketing message or to protect their own interests in a purchase, such as young children or people under financial or health pressure.' },
  ],

  references: [
    { text: '<i>Principles of Marketing – H5P Edition</i> (2022), section 5.3, “Selecting Target Markets and Target-Market Strategies”. BCcampus, CC BY-NC-SA 4.0 (author removed at the original publisher’s request). The features of an attractive market: size, growth, competition, accessibility, resources and fit with the firm’s mission and objectives.', url: 'https://opentextbc.ca/principlesofmarketingh5p/chapter/selecting-target-markets-and-target-market-strategies/', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.7, “Ethical Concerns and Target Marketing”. OpenStax. Who is targeted and why; children, older adults and low-income consumers; wrongful exclusion.', url: 'https://openstax.org/books/principles-marketing/pages/5-7-ethical-concerns-and-target-marketing', checked: '2026-10-25' },
    { text: 'Smith, N. C. &amp; Cooper-Martin, E. (1997). Ethics and target marketing: the role of product harm and consumer vulnerability. <i>Journal of Marketing</i>, 61(3), 1–20. Confirmed from the University of Birmingham research portal’s record and abstract; the full text was not consulted.', url: 'https://research.birmingham.ac.uk/en/publications/ethics-and-target-marketing-the-role-of-product-harm-and-consumer/', checked: '2026-10-25' },
    { text: 'American Marketing Association. “AMA Statement of Ethics”: the three ethical norms and the value of equity, including recognising the needs of vulnerable market segments.', url: 'https://www.ama.org/ama-statement-of-ethics/', checked: '2026-10-25' },
    { text: 'McKinsey Quarterly (2008). “Enduring ideas: The GE–McKinsey nine-box matrix”. The idea of judging a business by the attractiveness of its market and its own strength there, on two separate dimensions, which the attractiveness–fit chart borrows for segments.', url: 'https://www.mckinsey.com/business-functions/strategy-and-corporate-finance/our-insights/enduring-ideas-the-ge-and-mckinsey-nine-box-matrix', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Respondents (case)', value: STUDY.n, shown: 640 },
    ...NAMES.map((nm, g) => ({ what: `${nm}: respondents`, value: n[g], shown: [152, 146, 129, 109, 104][g] })),
    ...NAMES.map((nm, g) => ({ what: `${nm}: share of respondents %`, value: share[g] * 100, shown: [23.8, 22.8, 20.2, 17.0, 16.3][g], tol: 0.05 })),
    ...NAMES.map((nm, g) => ({ what: `${nm}: spend per head`, value: head[g], shown: [27.05, 58.54, 54.60, 76.61, 39.75][g] })),
    ...NAMES.map((nm, g) => ({ what: `${nm}: growth`, value: growth[g], shown: [1, 4, 9, 6, 7][g] })),
    ...NAMES.map((nm, g) => ({ what: `${nm}: room (nearest rival distance)`, value: room[g], shown: [1.15, 0.57, 1.03, 1.52, 0.48][g] })),
    { what: 'Nearest rivals named in text', value: [VR, GO, EX, CL, MI].map((g) => ['Harbour Basics', 'Corner Cup', 'Summit Brew', 'Arcadia Coffee', 'Arcadia Coffee'][g] === rival[g] ? 1 : 0).reduce((a, b) => a + b, 0), shown: 5 },
    ...NAMES.map((nm, g) => ({ what: `${nm}: fit`, value: fit[g], shown: [-0.83, -0.55, 0.38, 0.99, 0.48][g] })),
    { what: 'Lantern strengths listed: taste, sustainability, local, novelty', value: strong.length, shown: 4 },
    { what: 'Lantern weaknesses listed: price, convenience', value: weak.length, shown: 2 },
    { what: 'Margin (case)', value: MARGIN * 100, shown: 38 },
    { what: 'F02 online-shop gross margin %', value: ((110000 - 52800) / 110000) * 100, shown: 52 },
    { what: 'M02 supermarket trade margin %', value: CHANNELS.find((c) => c.id === 'supermarket').margin * 100, shown: 32 },
    ...NAMES.map((nm, g) => ({ what: `${nm}: margin pool per 1,000 a month`, value: pool[g], shown: [2442, 5075, 4182, 4958, 2455][g], tol: 0.6 })),
    { what: 'C&L pool after 3 years', value: pool3[CL], shown: 5905, tol: 0.6 },
    { what: 'Explorers pool after 3 years', value: pool3[EX], shown: 5416, tol: 0.6 },
    { what: 'Map: two dimensions’ share %', value: D.map.cumulative[1] * 100, shown: 89.9, tol: 0.05 },
    { what: 'Lantern rated by', value: D.map.counts[0], shown: 61 },
    { what: 'Lantern distance to C&L ideal', value: lanternD[CL], shown: 0.79 },
    { what: 'Lantern distance to Explorers ideal', value: lanternD[EX], shown: 2.12 },
    { what: 'Lantern distance to VR ideal', value: lanternD[VR], shown: 4.67 },
    { what: 'C&L café share %', value: cafe[CL] * 100, shown: 61.5, tol: 0.05 },
    { what: 'Explorers café share %', value: cafe[EX] * 100, shown: 44.2, tol: 0.05 },
    { what: 'VR café share %', value: cafe[VR] * 100, shown: 7.9, tol: 0.05 },
    { what: 'Min–max: C&L size score', value: FM[0][CL], shown: 10.4, tol: 0.05 },
    { what: 'Min share %', value: mn(share) * 100, shown: 16.3, tol: 0.05 },
    { what: 'Max share %', value: mx(share) * 100, shown: 23.8, tol: 0.05 },
    ...FACTORS.flatMap((f, k) => NAMES.map((nm, g) => ({ what: `Score: ${f}, ${nm}`, value: FS[k][g], shown: [[100, 96.1, 84.9, 71.7, 68.4], [35.3, 76.4, 71.3, 100, 51.9], [11.1, 44.4, 100, 66.7, 77.8], [75.6, 37.4, 67.8, 100, 31.7], [8.1, 22.1, 69.1, 100, 74.3]][k][g], tol: 0.05 }))),
    { what: 'Engine size scores agree', value: TS.sizeS.reduce((a, v, g) => a + Math.abs(v - SC.size[g]), 0), shown: 0, tol: 1e-9 },
    { what: 'Engine spend scores agree', value: TS.spendS.reduce((a, v, g) => a + Math.abs(v - SC.head[g]), 0), shown: 0, tol: 1e-9 },
    { what: 'Engine fit scores agree', value: TS.fitS.reduce((a, v, g) => a + Math.abs(v - SC.fit[g]), 0), shown: 0, tol: 1e-9 },
    ...NAMES.map((nm, g) => ({ what: `Total (Ana): ${nm}`, value: T_ANA[g], shown: [46.7, 58.9, 77.3, 88.8, 62.3][g], tol: 0.05 })),
    { what: 'Total (equal): C&L', value: T_EQ[CL], shown: 87.7, tol: 0.05 },
    { what: 'Total (equal): Explorers', value: T_EQ[EX], shown: 78.6, tol: 0.05 },
    ...NAMES.map((nm, g) => ({ what: `Attractiveness: ${nm}`, value: T_ATTR[g], shown: [59.6, 71.1, 80.0, 85.0, 58.4][g], tol: 0.05 })),
    { what: 'Average attractiveness', value: sum(T_ATTR) / K, shown: 70.8, tol: 0.05 },
    { what: 'Gap in weighted sums C&L − Explorers', value: gapCE, shown: 183.8, tol: 0.05 },
    { what: 'Growth score gap', value: SC.growth[EX] - SC.growth[CL], shown: 33.3, tol: 0.05 },
    { what: 'Size score gap', value: SC.size[EX] - SC.size[CL], shown: 13.2, tol: 0.05 },
    { what: 'Growth weight rise', value: thrGrowth - W_ANA[2], shown: 5.5, tol: 0.05 },
    { what: 'Growth threshold', value: thrGrowth, shown: 7.5, tol: 0.05 },
    { what: 'Size threshold', value: thrSize, shown: 18.0, tol: 0.05 },
    { what: 'Size weight rise', value: thrSize - W_ANA[0], shown: 14.0, tol: 0.05 },
    { what: 'Growth 7: C&L', value: TG7[CL], shown: 83.5, tol: 0.05 },
    { what: 'Growth 7: Explorers', value: TG7[EX], shown: 82.7, tol: 0.05 },
    { what: 'Growth 8: Explorers', value: TG8[EX], shown: 83.5, tol: 0.05 },
    { what: 'Growth 8: C&L', value: TG8[CL], shown: 82.7, tol: 0.05 },
    { what: 'Lowering fit can’t flip (threshold below zero)', value: W_ANA[4] - gapCE / (SC.fit[CL] - SC.fit[EX]) < 0 ? 1 : 0, shown: 1 },
    { what: 'Lowering room can’t flip', value: W_ANA[3] - gapCE / (SC.room[CL] - SC.room[EX]) < 0 ? 1 : 0, shown: 1 },
    { what: 'Lowering spend per head can’t flip', value: W_ANA[1] - gapCE / (SC.head[CL] - SC.head[EX]) < 0 ? 1 : 0, shown: 1 },
    { what: 'Money only: On the go', value: T_MONEY[GO], shown: 86.2, tol: 0.05 },
    { what: 'Money only: C&L', value: T_MONEY[CL], shown: 85.9, tol: 0.05 },
    { what: 'No fit, size 10: Explorers', value: T_NOFIT[EX], shown: 81.6, tol: 0.05 },
    { what: 'No fit, size 10: C&L', value: T_NOFIT[CL], shown: 80.6, tol: 0.05 },
    { what: 'Min–max (Ana): C&L', value: T_MM[CL], shown: 72.9, tol: 0.05 },
    { what: 'Min–max (Ana): Explorers', value: T_MM[EX], shown: 62.6, tol: 0.05 },
    { what: 'Explorers fit by hand', value: exFit, shown: 0.38, tol: 0.005 },
    { what: 'VR mostly home-brewed %', value: vrSrc[1] * 100, shown: 50, tol: 0.5 },
    { what: 'VR mostly supermarket or RTD %', value: vrSrc[2] * 100, shown: 35, tol: 0.5 },
    { what: 'VR has the smallest margin pool', value: pool.indexOf(mn(pool)) === VR ? 1 : 0, shown: 1 },
    { what: 'Explorers ideal in the map plane %', value: inPlane[EX] * 100, shown: 42, tol: 0.5 },
    { what: 'Other segments in plane: lowest %', value: Math.min(...inPlane.filter((_, g) => g !== EX)) * 100, shown: 67, tol: 0.5 },
    { what: 'Other segments in plane: highest %', value: Math.max(...inPlane) * 100, shown: 98, tol: 0.5 },
    { what: 'On the go: Summit Brew distance', value: goD[1], shown: 1.50 },
    { what: 'On the go: Daily Grind RTD distance', value: goD[2], shown: 1.59 },
    ...NAMES.map((nm, g) => ({ what: `Room on 8 attributes: ${nm}`, value: room8[g], shown: [1.44, 1.37, 2.28, 2.97, 1.25][g] })),
    ...NAMES.map((nm, g) => ({ what: `Room score on 8 attributes: ${nm}`, value: ratio(room8)[g], shown: [48.4, 46.3, 76.8, 100, 42.3][g], tol: 0.05 })),
    ...NAMES.map((nm, g) => ({ what: `Totals with 8-attribute room: ${nm}`, value: T8[g], shown: [43.3, 60.0, 78.4, 88.8, 63.7][g], tol: 0.05 })),
    { what: 'Growth threshold with 8-attribute room', value: thr8, shown: 7.0, tol: 0.05 },
    { what: 'Lowest size score', value: mn(SC.size), shown: 68.4, tol: 0.05 },
    { what: 'Lowest fit score', value: mn(SC.fit), shown: 8.1, tol: 0.05 },
    ...FACTORS.map((f, k) => ({ what: `Spread of scores: ${f}`, value: spread[k], shown: [31.6, 64.7, 88.9, 68.3, 91.9][k], tol: 0.05 })),
    ...FACTORS.map((f, k) => ({ what: `Weight × spread: ${f}`, value: pull[k], shown: [126, 259, 178, 137, 368][k], tol: 0.5 })),
    { what: 'Fit pull over size pull ≈ 3', value: Math.round(pull[4] / pull[0]), shown: 3 },
    { what: 'Size threshold as a multiple of Ana’s size weight', value: thrSize / W_ANA[0], shown: 4.5, tol: 0.05 },
    { what: 'Mindful third', value: [...T_ANA].sort((a, b) => b - a).indexOf(T_ANA[MI]), shown: 2 },
    // Cobbleford
    { what: 'FH size score commuters', value: fhS[0][0], shown: 75 },
    { what: 'FH size score club', value: fhS[0][1], shown: 25 },
    { what: 'FH spend score commuters', value: fhS[1][0], shown: 26.7, tol: 0.05 },
    { what: 'FH spend score families', value: fhS[1][2], shown: 16.7, tol: 0.05 },
    { what: 'FH total commuters', value: fhT[0], shown: 67.8, tol: 0.05 },
    { what: 'FH total club', value: fhT[1], shown: 47.5, tol: 0.05 },
    { what: 'FH total families', value: fhT[2], shown: 63.3, tol: 0.05 },
    { what: 'FH pool commuters', value: FH.people[0] * FH.spend[0], shown: 432000 },
    { what: 'FH pool club', value: FH.people[1] * FH.spend[1], shown: 540000 },
    { what: 'FH pool families', value: FH.people[2] * FH.spend[2], shown: 360000 },
    // Sorrelbank
    { what: 'SB sum A', value: sbSum(0), shown: 940 },
    { what: 'SB sum B', value: sbSum(1), shown: 900 },
    { what: 'SB score A', value: sbT[0], shown: 78.3, tol: 0.05 },
    { what: 'SB score B', value: sbT[1], shown: 75.0, tol: 0.05 },
    { what: 'SB growth threshold rise', value: (sbSum(0) - sbSum(1)) / (SB.growth[1] - SB.growth[0]), shown: 0.67, tol: 0.005 },
    { what: 'SB growth new weight', value: SB.w[1] + (sbSum(0) - sbSum(1)) / (SB.growth[1] - SB.growth[0]), shown: 2.7, tol: 0.05 },
    { what: 'SB room threshold rise', value: (sbSum(0) - sbSum(1)) / (SB.room[1] - SB.room[0]), shown: 1 },
    { what: 'SB size lowered to', value: SB.w[0] - (sbSum(0) - sbSum(1)) / (SB.size[0] - SB.size[1]), shown: 3 },
    { what: 'SB fit lowered to', value: SB.w[3] - (sbSum(0) - sbSum(1)) / (SB.fit[0] - SB.fit[1]), shown: 2 },
  ],
};
