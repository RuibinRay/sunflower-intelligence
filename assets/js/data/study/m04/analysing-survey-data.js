// analysing-survey-data.js — M04 · Analysing survey data. Content only; exercises are in analysing-survey-data.ex.js.
// Lantern's February 2027 survey from case.js: the 516 completes (RESPONDENTS), the list's strata (STRATA, SIZES) and the
// derived NPS, Cold Brew intent, weights, cups and themes (DERIVED). The truth (DERIVED.nps.truth, coldbrew.truthTopTwo)
// appears only in the "What Ana couldn't see" callout. Pindlebury Garden Centre, Rookwell Fitness and Tallyroot Software
// (with Saoirse Adeyemi) are fictional. Every printed figure is recomputed in `checks`.
import { RESPONDENTS, STRATA, SIZES, LEVELS, DISPOSITIONS, DERIVED as D } from './case.js?v=22';
import * as S from '../../../core/survey.js?v=22';
import * as I from '../../../core/inference.js?v=22';

// ---------------------------------------------------------------- the figures this lesson quotes
const R = RESPONDENTS, N = R.length, LIST = SIZES.reduce((a, b) => a + b, 0);
const byS = STRATA.map((_, h) => R.filter((r) => r.stratum === h));
const nS = byS.map((g) => g.length);
const CB = D.coldbrew.crosstab;                                   // segment × Cold Brew answer
const top2 = (g) => g.filter((r) => r.coldbrew <= 2).length;
const mid = (g) => g.filter((r) => r.coldbrew === 3).length;
const bot2 = (g) => g.filter((r) => r.coldbrew >= 4).length;
const NPS = D.nps.unweighted, NPSS = D.nps.byStratum, W = D.weights.perStratum;
const wP = D.nps.weighted.pP, wD = D.nps.weighted.pD, nEff = D.weights.kish.nEff;
const Z = I.normInv(0.975);
const wMargin = 100 * Z * Math.sqrt((wP + wD - (wP - wD) ** 2) / nEff);
const promMargin = 100 * Z * Math.sqrt(NPS.pP * (1 - NPS.pP) / N);
const ptsOf = (g) => g.map((r) => [-100, 0, 100][r.group]);
const sdOf = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
const STRAT_NPS = S.stratifiedMean(STRATA.map((_, h) => { const v = ptsOf(R.filter((r) => r.stratum === h)); return { N: SIZES[h], n: v.length, mean: v.reduce((x, y) => x + y, 0) / v.length, sd: sdOf(v) }; }));
// Rocks (2016): the adjusted Wald interval AW(3,T), from survey.js
const AW_ALL = NPS.adjusted, AW_WS = NPSS[2].adjusted;
// comparisons between segments (B04's tests)
const T2 = byS.map((g) => [top2(g), g.length - top2(g)]);
const CHI5 = I.chisqIndependence(CB.counts), CHI2 = I.chisqIndependence(T2);
const SUBNEWS = I.propTest2(T2[0][0], nS[0], T2[3][0], nS[3]);
const SUBSHOP = I.propTest2(T2[0][0], nS[0], T2[1][0], nS[1]);
const SHOPNEWS = I.propTest2(T2[1][0], nS[1], T2[3][0], nS[3]);
const dNps = NPSS[0].score - NPSS[3].score, dSe = Math.hypot(NPSS[0].se, NPSS[3].se);
const wsTop2 = I.ciProp(T2[2][0], nS[2], 0.95, 'wald');
// cups bought away from home last week (Q3)
const cups = R.map((r) => r.cups);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const sdS = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const cupsByS = byS.map((g) => g.map((r) => r.cups));
// improvement themes (Q6)
const TH = D.themes, SUGG = N - TH[0];
const thBy = (h, k) => byS[h].filter((r) => r.theme === k).length;
// Pindlebury Garden Centre (fictional)
const PIN = S.nps({ promoters: 102, passives: 84, detractors: 54 });
// Rookwell Fitness (fictional): interest in a 6 a.m. class at three clubs
const RK = { clubs: ['City', 'Riverside', 'Hilltop'], members: [2400, 1500, 600], completes: [189, 157, 124], removed: [7, 5, 3], top2: [54, 38, 60], speeders: 12, straight: 6, both: 3, medianMin: 7 };
const RKkept = RK.completes.map((c, i) => c - RK.removed[i]);
const RKN = RK.members.reduce((a, b) => a + b, 0), RKn = RKkept.reduce((a, b) => a + b, 0), RKx = RK.top2.reduce((a, b) => a + b, 0);
const RKw = S.postStratWeights(RK.members, RKkept).weights;
const RKweighted = RK.members.reduce((s, M, i) => s + (M * RK.top2[i]) / RKkept[i], 0) / RKN;
const RKz = I.propTest2(RK.top2[2], RKkept[2], RK.top2[0], RKkept[0]);
// Tallyroot Software (fictional): two quarterly waves of a tracking survey
const TA = S.nps({ promoters: 262, passives: 231, detractors: 147 }), TB = S.nps({ promoters: 268, passives: 214, detractors: 128 });
const TdSe = Math.hypot(TA.se, TB.se), Tz = (TB.score - TA.score) / TdSe;

// ---------------------------------------------------------------- formatting
const p1 = (v) => `${(v * 100).toFixed(1)}%`;
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const sg = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
const int = (v) => v.toLocaleString('en-US');

function npsFigure() {
  const rows = [...STRATA.map((s, h) => [s, NPSS[h]]), ['All respondents', NPS]];
  const L = 186, BW = 300, T = 50, H = 26, G = 14;
  const height = T + rows.length * (H + G) + 26;
  let s = `<svg viewBox="0 0 640 ${height}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  const parts = [['Detractors (0–6)', 'var(--series-3)', 0.5], ['Passives (7–8)', 'var(--series-2)', 0.28], ['Promoters (9–10)', 'var(--series-1)', 0.6]];
  parts.forEach(([label, col, op], k) => {
    const x = L + k * 112;
    s += `<rect x="${x}" y="14" width="14" height="14" fill="${col}" opacity="${op}" stroke="var(--ink)" stroke-width="0.6"/>`;
    s += `<text x="${x + 20}" y="25" font-size="11">${label}</text>`;
  });
  s += `<text x="${L + BW + 14}" y="${T - 8}" font-size="11" fill="var(--ink-3)">NPS (base)</text>`;
  rows.forEach(([name, c], i) => {
    const y = T + i * (H + G);
    const shares = [c.detractors / c.n, c.passives / c.n, c.promoters / c.n];
    let x = L;
    s += `<text x="${L - 10}" y="${y + 17}" text-anchor="end"${i === rows.length - 1 ? ' font-weight="600"' : ''}>${name}</text>`;
    shares.forEach((v, k) => {
      const w = v * BW;
      s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${H}" fill="${parts[k][1]}" opacity="${parts[k][2]}" stroke="var(--ink)" stroke-width="0.6"/>`;
      if (w > 20) s += `<text x="${(x + w / 2).toFixed(1)}" y="${y + 17}" text-anchor="middle" font-size="11">${Math.round(v * 100)}%</text>`;
      x += w;
    });
    s += `<text x="${L + BW + 14}" y="${y + 17}">${sg(c.score)}  (${c.n})</text>`;
  });
  s += `<text x="${L}" y="${height - 6}" font-size="11" fill="var(--ink-3)">Unweighted. NPS = % promoters − % detractors.</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'analysing-survey-data',
  title: 'Analysing survey data',
  blurb: 'Prepare a survey export for analysis, then build frequency tables, cross-tabs, top-box scores and the Net Promoter Score with its margin of error in Excel. Weight results to the population with SUMPRODUCT, compare groups with B04’s tests, choose the median for skewed counts, and know when a base is too small to report.',
  status: 'reviewed',
  objectives: [
    'Prepare survey data for analysis: decide how to treat partial responses, flag speeders and straight-liners, code open answers and missing answers, and state the base of every figure.',
    'Build frequency tables and cross-tabs in Excel with COUNTIF, COUNTIFS and a PivotTable, percentaging within each category of the explanatory variable.',
    'Calculate top-box and top-two-box scores and the Net Promoter Score with its standard error and margin of error, and compare two scores.',
    'Calculate weighted results with SUMPRODUCT, report them with their unweighted base, and explain why they differ from unweighted ones.',
    'Compare groups with B04’s tests, choose between the mean and the median for skewed counts, and decide when a base is too small to report.',
  ],
  prerequisites: [
    { lesson: 'm04/survey-error', why: 'The response rates by segment, the weights N_h ÷ n_h, Kish’s effective sample size and what weighting can’t fix are used here without being derived again.' },
    { lesson: 'm04/questionnaire-design', why: 'The six February questions, the Net Promoter question and the purchase-intent scale are the data this lesson analyses.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'COUNTIF, COUNTIFS, AVERAGEIFS, SUMPRODUCT and mixed references build every table here.' },
    { lesson: 'b03/pivot-tables', why: 'PivotTables and Show Values As (% of Row Total) build cross-tabs without formulas.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The two-proportion z test and the chi-square test of independence compare segments.' },
    { lesson: 'b04/confidence-intervals', why: 'Margins of error and intervals for a proportion.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'The February survey closed on 16 February 2027. Of the 2,004 people Ana invited, 516 completed the questionnaire and 56 more returned partial questionnaires. Her survey tool exports one row per complete, and she has already coded the open answers to “What one thing could Lantern do better?” into themes. Before the March focus groups she wants three answers: how likely her customers are to recommend Lantern, how many would buy Lantern Cold Brew, and what Lantern should do better.' },
    { p: 'The export is a table of 516 rows and eight columns: a respondent number, the segment each person came from on the mailing list, the 0–10 recommendation score (Q1), the Cold Brew answer (Q2), cups of coffee bought away from home last week (Q3), how they first heard of Lantern (Q4), their age group (Q5) and the coded improvement theme (Q6). Turning it into answers takes five moves: prepare the data, count each answer, cross one answer with another, summarise scales into scores, and decide how far the results reach beyond the people who replied. Each move comes with one habit that separates honest analysis from a pile of percentages.' },

    { h: 'Every figure has a base' },
    { p: 'A percentage is a count divided by a <g>base</g>: the number of respondents it is calculated on. “42% would buy” means nothing until the reader knows 42% of whom, and of how many. Ana’s Cold Brew question was answered by all 516 completes, so its base is “all completes (516)”. Her table of improvement themes could use all 516 or only the 331 who suggested something, and the choice changes every figure: price was raised by 16.3% of all completes but by 25.4% of those who made a suggestion. Choose the base that answers the question, and print it with the figure.' },

    { h: 'Counting: the frequency table' },
    { p: 'A <g>frequency table</g> lists the answers to one question with the count and the percentage of the base for each. It is the first table to build for every question, because it shows the shape of the answers and anything that looks wrong: an answer nobody should be able to give, or a total that doesn’t match the base.' },
    { table: {
      caption: 'Q2: “How likely would you be to buy Lantern Cold Brew in the next three months?” Base: all completes (516), unweighted',
      head: ['Answer', 'Respondents', '% of base'],
      align: ['l', 'r', 'r'],
      rows: LEVELS.coldbrew.map((a, j) => [a, String(CB.colTotals[j]), p1(CB.colTotals[j] / N)]),
      foot: [['Total', String(N), '100%']],
      note: 'Percentages are rounded, so they may not add to exactly 100.',
    } },
    { p: 'Two summaries of a <g>purchase-intent scale</g> are standard in marketing research. The <g>top-box score</g> is the share choosing the most favourable answer, here 15.7% “definitely would buy”; the <g>top-two-box score</g> adds the next answer, giving 42.2% who would definitely or probably buy. Both are shares of the people who answered, not forecasts of buyers: <i>Survey error</i> showed that stated intentions overstate what people go on to do.' },

    { h: 'Crossing: who would buy?' },
    { p: 'The total hides what Ana most needs to know: who the likely buyers are. A <g>cross-tabulation</g>, or cross-tab, counts respondents by the answers to two questions at once: a <g>contingency table</g> of the kind B04 tested, shown with the percentages that answer the question. Ana crosses Q2 with the segment each respondent came from.' },
    { table: {
      caption: 'Cold Brew intent by segment: percentage of each segment’s completes (rows add to 100% allowing for rounding), unweighted. Workshop participants (base 27) are shown for teaching; under the minimum base in Small bases they would be suppressed.',
      head: ['Segment', 'Top two boxes', 'Might or might not', 'Bottom two boxes', 'Base'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: STRATA.map((s, h) => [s, p1(top2(byS[h]) / nS[h]), p1(mid(byS[h]) / nS[h]), p1(bot2(byS[h]) / nS[h]), String(nS[h])]),
      foot: [['All completes', p1(top2(R) / N), p1(mid(R) / N), p1(bot2(R) / N), String(N)]],
    } },
    { p: 'Each row adds up to 100%, because Ana’s question is how each segment answered. The rule is to percentage within each category of the explanatory variable, the one you think may explain the other, and then compare across those categories. Subscribers chose the top two boxes 61.8% of the time; newsletter-only respondents, 31.0%. Percentaged the other way, the same counts answer a different question: of the 81 people who would definitely buy, 31 (38.3%) were newsletter-only respondents, because there are so many of them, although only 10.4% of newsletter-only respondents gave that answer.' },

    { h: 'Scoring: the Net Promoter Score' },
    { p: 'Q1 asked how likely each person was to recommend Lantern to a friend or colleague, from 0 to 10. The <g>Net Promoter Score</g> (NPS), proposed by Frederick Reichheld in 2003 and introduced in <i>Questionnaire design</i>, sorts the answers into promoters (9 or 10), passives (7 or 8) and detractors (0 to 6), and subtracts the percentage of detractors from the percentage of promoters. Ana had 237 promoters (45.9%), 184 passives (35.7%) and 95 detractors (18.4%), so her NPS is 45.9 − 18.4 = +27.5. The score runs from −100, when everyone is a detractor, to +100, when everyone is a promoter, and is written without a % sign: +27.5 doesn’t mean that 27.5% would recommend Lantern.' },
    { figure: {
      svg: npsFigure(),
      caption: 'Promoters, passives and detractors among Ana’s 516 completes, by segment (unweighted). The NPS is the promoters’ share minus the detractors’ share; the base is in brackets. Workshop participants (base 27) are shown for teaching; under the minimum base in Small bases they would be suppressed.',
      alt: `Five horizontal bars, each split into three parts for detractors, passives and promoters, with each segment’s NPS and base at the right. Subscribers: 11% detractors, 16% passives, 73% promoters, NPS +61.8 (89). Other shop customers: 9%, 29%, 62%, NPS +53.4 (103). Workshop participants: 19%, 22%, 59%, NPS +40.7 (27). Newsletter only: 24%, 45%, 31%, NPS +7.1 (297). All respondents: 18%, 36%, 46%, NPS +27.5 (516).`,
    } },
    { p: 'Like any estimate from a sample, the score has a margin of error: ±6.5 points at 95% for 516 answers, so the survey puts the NPS of people like those who answered between about +21 and +34. Within segments the scores run from +62 among subscribers to +7 among newsletter-only respondents, with wider margins on the smaller bases.' },

    { h: 'Beyond the respondents: weighting' },
    { p: 'Ana invited each segment in proportion to its size, but the segments didn’t reply in proportion: subscribers are 8.7% of the list but 17.2% of the completes, and newsletter-only people 72.2% of the list but 57.6% of the completes. So every all-respondent figure leans towards Lantern’s keenest customers. Weighting each respondent by the segment’s list size divided by its completes, the <g>post-stratification</g> of <i>Survey error</i>, puts the segments back in proportion: the weighted NPS is +20.4 and the weighted top-two-box score 38.2%. In Excel both come from SUMPRODUCT, as In depth shows.' },
    { callout: 'key', title: 'Five habits of honest survey analysis', html: 'Write the preparation rules down before you see the results. Print a base with every figure. Percentage within each category of the explanatory variable. Give every score with its margin of error, and don’t read differences smaller than it. Weight when the respondents are out of proportion to the population, and say what weighting can’t fix.' },
  ],

  theory: [
    { h: 'Preparing the data' },
    { p: '<b>Partial responses.</b> Fifty-six of Ana’s questionnaires were partials, which under her rule in <i>Survey error</i> answered three to five of the six questions (people who answered fewer are <g>break-offs</g>, counted with the refusals). <i>Survey error</i> showed how AAPOR’s response rates count these partials; for analysis the question is which of their answers to use. One rule analyses completes only, so every question has the same base. The other keeps each partial’s answers to the questions it reached, so each question has its own base and every table needs its base printed. Ana chose completes only before fieldwork (fictional), because her questionnaire is short and one base keeps her tables comparable; whichever rule you choose, fix it before you see the results, so that it can’t be picked to suit them.' },
    { p: '<b>Speeders and straight-liners.</b> A <g>speeder</g> finishes far faster than anyone could read the questions; a respondent who is <g>straight-lining</g> gives the same answer to every item in a grid of rating questions. Both are signs of <g>satisficing</g>, answering with too little effort to be accurate, and Zhang and Conrad (2014) found that web respondents who sped also straight-lined more grid questions. Flag them by rules set in advance, such as a completion time under a third of the median, or identical answers across a grid that contains reversed items, which no attentive person would give. Thresholds differ between studies, so state yours, remove a case only when the evidence is strong, and report how many you removed. Lantern’s six questions contain no grid, so the challenging example uses a survey that does.' },
    { p: '<b>Missing answers.</b> A blank can mean that a question wasn’t asked (<g>routing</g> skipped it), that the respondent skipped it (<g>item non-response</g>), or that the answer was “don’t know” or “prefer not to say”. Give each a distinct code and never record any of them as 0, because 0 is a real answer on a 0–10 scale. If “don’t know” is stored as 99, <x>=AVERAGE(C2:C517)</x> averages the 99s with the real scores, while <x>=AVERAGEIFS(C2:C517,C2:C517,"<99")</x> leaves them out. Decide for each figure whether “don’t know” belongs in the base: on a purchase-intent question it is a meaningful answer, best shown as a row of its own. Ana’s completes have an answer to every closed question, so the problem doesn’t arise in her export, but it does in most.' },
    { p: '<b>Coding open answers.</b> Answers to an <g>open question</g> become numbers through a <g>code frame</g>: a list of themes, each with a definition and examples, drafted from a sample of the answers and then applied to all of them. <i>Qualitative research</i> builds <g>codebooks</g> the same way and checks <g>inter-coder agreement</g>. An answer can be single-coded, to its main theme, or multi-coded, to every theme it mentions; with multi-coding the percentages add to more than 100%, and the table must say so. Ana single-coded the 516 answers into seven themes, one of which, “Nothing, or left blank”, joins two different things: people with nothing to suggest and people who skipped the box.' },
    { table: {
      caption: 'Q6: “What one thing could Lantern do better?”, coded into themes (one theme per answer), unweighted',
      head: ['Theme', 'Respondents', '% of all completes (516)', '% of those who suggested something (331)'],
      align: ['l', 'r', 'r', 'r'],
      rows: LEVELS.theme.map((t, k) => [t, String(TH[k]), p1(TH[k] / N), k === 0 ? '—' : p1(TH[k] / SUGG)]),
      foot: [['Total', String(N), '100%', '100%']],
      note: 'Percentages are rounded, so they may not add to exactly 100.',
    } },
    { p: 'Both bases are honest if they are labelled; they answer different questions. Price leads with 84 suggestions, a quarter of them, ahead of range (76) and delivery speed (58). A count of mentions measures how common a theme is, not how strongly people feel or how much it would change their buying, so read the answers behind each code before acting on it. Crossed with segment, delivery speed was raised by 18.0% of subscribers and 8.1% of newsletter-only respondents, which fits the fact that subscribers are the ones waiting for deliveries.' },

    { h: 'Frequency tables and cross-tabs in Excel' },
    { p: 'With Ana’s export in A1:H517 (segment in B, the 0–10 score in C, the Cold Brew answer in D), a frequency table is one COUNTIF per answer. With the five answers in J2:J6, <x>=COUNTIF($D$2:$D$517,J2)</x> filled down counts them, and <x>=K2/SUM($K$2:$K$6)</x> turns the counts into percentages of the base. A cross-tab is a grid of COUNTIFS with mixed references, as in B03: with segments down J3:J6 and answers across K2:O2, <x>=COUNTIFS($B$2:$B$517,$J3,$D$2:$D$517,K$2)</x> in K3 fills across and down, and <x>=K3/SUM($K3:$O3)</x> gives row percentages.' },
    { p: 'A <g>PivotTable</g> builds the same table with segment in Rows, the Cold Brew answer in Columns and a count in Values, shown as % of Row Total. Formulas suit a fixed report layout that must update by itself; a PivotTable suits trying many crosses quickly. With formulas, check that the counts add to the base: a total of 515 points to an answer spelled differently from the five labels, one with a trailing space perhaps. A PivotTable counts every record, so there the same problem shows up as an extra row or column; either way it is a cleaning job.' },
    { p: 'Rounded percentages needn’t add to exactly 100: Q2’s five shares add to 100.1%. Don’t force them; a note that percentages may not add to 100 because of rounding is the convention. Give percentages to whole numbers or one decimal place, and never to more places than the base supports: with 27 respondents each person is 3.7 points, so 51.9% suggests a precision the data don’t have.' },
    { p: 'When neither variable explains the other, as with age group and how people first heard of Lantern, either direction is legitimate, but the table’s title should say which question it answers. Column percentages are sometimes exactly what is wanted: a sales planner deciding where to send free samples needs to know where the likely buyers are, and that is the column view. The error is to calculate one and read it as the other.' },

    { h: 'Top-box scores and the mean of a scale' },
    { p: 'Q2’s answers are an <g>ordinal variable</g>: “probably” lies between “definitely” and “might or might not”, but nothing says the steps are equal. Box shares respect that. A mean of the codes 1 to 5 treats the steps as equal, an assumption the question can’t support, so if you report one, report it beside the box shares, not instead of them. The bottom-two-box score, the share who probably or definitely would not buy, is 26.2%. Turning intent into a forecast needs a conversion assumption for each box, which <i>Market sizing</i> covers.' },

    { h: 'The Net Promoter Score and its margin of error' },
    { p: String.raw`Give each answer a value of +100 for a promoter, 0 for a passive and −100 for a detractor: the NPS is the mean of those values. Its standard error follows from their variance, which depends only on the shares of promoters and detractors (the formula cards). For Ana, <m>100\sqrt{(0.459 + 0.184 - 0.275^2) \div 516}</m> <m>\approx 3.32</m>, and the 95% margin is <m>1.96 \times 3.32 \approx 6.5</m> points. That is half as wide again as the margin for the promoters’ share alone, ±4.3 points, because the NPS is the difference of two shares that move against each other.` },
    { p: 'Rocks (2016) compared interval methods for the NPS and found that this simple (Wald) interval is too narrow, covering the true score less often than 95% of the time even at 300 answers (he also found an iterative score interval performs well). He recommends an adjusted version that adds 3/4 to the promoter and detractor counts and 3/2 to the passive count before applying the same formula. At Ana’s 516 answers the adjustment hardly matters (+27.4 ± 6.5); for the 27 workshop participants it moves the interval from +11.2 to +70.2 to +8.6 to +64.7. On bases that small, use the adjusted interval, or better, don’t report the score at all (see Small bases).' },
    { p: String.raw`Two independent groups’ scores are compared through the standard error of their difference, <m>\sqrt{\text{SE}_1^2 + \text{SE}_2^2}</m>. Subscribers (+61.8, SE 7.20) and newsletter-only respondents (+7.1, SE 4.28) differ by 54.7 points with a standard error of 8.37, so z ≈ 6.5: far beyond chance. Two waves of a tracking survey are independent samples too, so the same calculation shows whether a change between waves is larger than chance; In practice shows why a few points usually aren’t.` },
    { p: 'Reichheld argued that this one question usually predicted growth better than others, and that in most of the industries he studied the share of enthusiastic customers tracked growth relative to competitors. Keiningham and colleagues (2007), with longitudinal data from 21 Norwegian firms, failed to replicate its claimed superiority over other measures of customer satisfaction and loyalty. The score also throws information away: a 0 and a 6 are both detractors, and half promoters with half detractors scores 0, the same as everyone a passive. Use it as one tracked indicator, with its margin of error, beside the distribution of scores and the reasons people give. Net Promoter Score is a service mark of Bain &amp; Company, NICE Systems and Fred Reichheld.' },

    { h: 'Weighted results in Excel' },
    { p: String.raw`A weighted share is <m>\sum w_i y_i \div \sum w_i</m>, where <m>y_i</m> is 1 for a respondent who counts (a promoter, say) and 0 otherwise, and <m>w_i</m> is the respondent’s weight: a SUMPRODUCT divided by a SUM. With each respondent’s weight in column I, the weighted top-two-box score is <x>=SUMPRODUCT(I2:I517,(D2:D517="Definitely would buy")+(D2:D517="Probably would buy"))/SUM(I2:I517)</x>, and the weighted NPS is <x>=100*(SUMPRODUCT(I2:I517*(C2:C517>=9))-SUMPRODUCT(I2:I517*(C2:C517<=6)))/SUM(I2:I517)</x>. Every respondent in a segment carries the same weight, so a four-row table gives the same answers: <m>\sum N_h \hat{p}_h \div N</m>, the segments’ shares weighted by their list sizes.` },
    { table: {
      caption: 'Weighting Cold Brew intent to the mailing list’s segment sizes (weights rounded to two decimals)',
      head: ['Segment', 'On the list (N)', 'Completes (n)', 'Weight N ÷ n', 'Top two boxes', 'Top-two share'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: STRATA.map((s, h) => [s, int(SIZES[h]), String(nS[h]), W[h].toFixed(2), String(T2[h][0]), p1(T2[h][0] / nS[h])]),
      foot: [['All, unweighted', int(LIST), String(N), '', String(top2(R)), p1(top2(R) / N)], ['All, weighted', int(LIST), String(N), '', '', p1(D.coldbrew.topTwoWeighted)]],
    } },
    { p: 'Report a weighted percentage with its unweighted base, the number of people it rests on, and a note: “Weighted to the mailing list’s segment sizes; unweighted base 516.” Unequal weights reduce the <g>effective sample size</g>: Kish’s effective n is 469 (<i>Survey error</i>), which gives a quick margin for the weighted NPS of +20.4 of about ±6.8 points. The stratified standard error of <i>Sampling methods</i>, which also credits the stratification, gives ±6.3: use Kish’s figure as a quick check and the design’s own standard error when it matters. Comparisons between segments don’t need weights, because within a segment every respondent carries the same weight.' },
    { callout: 'note', title: 'What Ana couldn’t see', html: 'The case records every person’s (fictional) answers, so the truth is known: the NPS of all 6,000 people on the list is +8.4. Weighting moved Ana’s estimate from +27.5 to +20.4 by correcting for segments that replied at different rates, but within each segment promoters replied more readily than detractors, and no weight built from segments can see that. For Cold Brew intent, the weighted 38.2% is close to the true 39.3%. Non-response bias differs from one question to the next, which is why <i>Survey error</i> treats a low response rate as a warning, not as a measure of bias.' },

    { h: 'Comparing groups' },
    { p: 'Differences between segments are tested with B04’s methods. Subscribers’ top-two-box score of 61.8% against newsletter-only respondents’ 31.0% gives a <g>two-proportion z test</g> statistic of 5.25 (p &lt; 0.0001) and a 95% interval for the gap of 19.4 to 42.2 points. Subscribers against other shop customers, 61.8% against 55.3%, gives z = 0.91 and p = 0.37, with an interval from −7.5 to +20.4 points: on these bases the survey can’t tell the two apart.' },
    { p: 'To test all four segments at once, use the chi-square <g>test of independence</g>. The full 4 × 5 table fails its condition: the expected count of workshop participants who “definitely would not” buy is 2.56, below 5. Merging the answers into the top two boxes against the rest leaves a 4 × 2 table whose smallest expected count is 11.4, and gives χ² = 37.7 with 3 degrees of freedom, p &lt; 0.0001 and Cramér’s V = 0.27: intent clearly differs by segment.' },
    { p: 'Three cautions. B04’s tests assume simple random samples; each segment is a random sample of its stratum, so comparisons between segments stand, but an interval for a weighted all-respondent figure needs the stratified standard error from <i>Sampling methods</i>. The tests speak only about the people who replied: if keen newsletter readers replied more readily than indifferent ones, the gap the test confirms may be partly a gap in who answered. And twenty cross-tabs tested at the 5% level will produce about one “significant” difference by chance, the <g>multiple testing</g> problem, so choose the few comparisons that matter before looking.' },

    { h: 'The mean, the median and skewed counts' },
    { p: 'Q3 asked how many cups of coffee each person bought away from home last week. The answers run from 0 to 20 with a long right tail: 60 people (11.6%) bought none, the <g>median</g> is 3 and the <g>mean</g> 3.9, pulled up by a few heavy buyers (the standard deviation is 3.4). In Excel, <x>=MEDIAN(G2:G517)</x> and <x>=AVERAGE(G2:G517)</x> give the two. For one segment, <x>=AVERAGEIFS(G2:G517,B2:B517,J2)</x> gives the mean, and <x>=MEDIAN(IF(B2:B517=J2,G2:G517))</x> or <x>=MEDIAN(FILTER(G2:G517,B2:B517=J2))</x> the median, since Excel has no MEDIANIFS. In Excel 2019 and earlier, enter <x>=MEDIAN(IF(…))</x> with Ctrl+Shift+Enter; FILTER needs Excel 2021, Excel 2024 or Microsoft 365.' },
    { p: 'All four segments have a median of 3 cups, while their means run from 3.7 to 4.0: the differences between the means come from a few heavy buyers, not from the typical respondent. Report the median for a typical customer and the mean when you need a total, because the mean times the number of people gives the cups bought. A recall question about last week also carries <g>measurement error</g>, as <i>Survey error</i> explained, so neither figure deserves more than one decimal place.' },

    { h: 'Small bases' },
    { p: 'Workshop participants returned 27 completes. Their NPS is +40.7 with a margin of ±29.5 points, from about +11 to +70, and their top-two-box score is 51.9% with a margin of ±18.8 points. Figures like these invite over-reading: “workshop participants are less enthusiastic than subscribers” isn’t supported when the two intervals overlap this much. Set a minimum base before the analysis and apply it to every table. One published standard, from the US National Center for Health Statistics, withholds among other things any proportion whose sample size (or effective sample size) is under 30, or whose 95% Clopper–Pearson confidence interval is 30 percentage points wide or more (Parker et al., 2017); Ana adopts the first rule (fictional), so workshop participants count in every all-respondent figure but get no figure of their own.' },
  ],

  formulas: [
    { id: 'as-top-box', name: 'Top-box and top-two-box scores',
      tex: String.raw`\text{Top-}k\text{ box} = \dfrac{x_k}{n} \times 100`,
      where: [[String.raw`x_k`, 'Respondents choosing one of the k most favourable answers (k = 1 for top box, 2 for top two)', 'respondents'], [String.raw`n`, 'The base: respondents who answered the question (with “don’t know” in or out, as stated)', 'respondents'], [String.raw`k`, 'How many boxes, counted from the favourable end', '']],
      assumptions: 'The scale is ordered, with the favourable end clear.',
      note: 'Excel: <x>=SUM(COUNTIFS(D2:D517,{"Definitely would buy","Probably would buy"}))/COUNTA(D2:D517)</x>.' },
    { id: 'as-nps', name: 'Net Promoter Score',
      tex: String.raw`\text{NPS} = 100 \times (p_P - p_D), \qquad p_P = \dfrac{P}{n}, \quad p_D = \dfrac{D}{n}`,
      where: [[String.raw`P`, 'Promoters: answers of 9 or 10 to the likelihood-to-recommend question', 'respondents'], [String.raw`D`, 'Detractors: answers of 0 to 6', 'respondents'], [String.raw`n`, 'All who answered the question, passives (7 or 8) included', 'respondents'], [String.raw`p_P,\ p_D`, 'Shares of promoters and detractors', ''], [String.raw`\text{NPS}`, 'Net Promoter Score, from −100 to +100', 'points']],
      note: 'Excel: <x>=100*(COUNTIF(C2:C517,">=9")-COUNTIF(C2:C517,"<=6"))/COUNT(C2:C517)</x>.' },
    { id: 'as-nps-se', name: 'Standard error and margin of error of the NPS',
      tex: String.raw`\text{SE} = 100\sqrt{\dfrac{p_P + p_D - (p_P - p_D)^2}{n}}, \qquad \text{margin} = z^* \times \text{SE}`,
      where: [[String.raw`p_P,\ p_D`, 'Shares of promoters and detractors', ''], [String.raw`n`, 'Base', 'respondents'], [String.raw`z^*`, 'Standard normal critical value: 1.96 for 95%', ''], [String.raw`\text{SE}`, 'Standard error of the NPS', 'points']],
      assumptions: 'A simple random sample (or one stratum of a stratified sample) large enough for the normal approximation.',
      note: 'This is the Wald interval. Rocks (2016) recommends adding 3/4 to the promoter and detractor counts and 3/2 to the passives first, which matters on small bases.' },
    { id: 'as-nps-diff', name: 'Comparing two independent scores',
      tex: String.raw`\text{SE}_{\text{diff}} = \sqrt{\text{SE}_1^2 + \text{SE}_2^2}, \qquad z = \dfrac{\text{NPS}_1 - \text{NPS}_2}{\text{SE}_{\text{diff}}}`,
      where: [[String.raw`\text{SE}_1,\ \text{SE}_2`, 'Standard errors of the two scores', 'points'], [String.raw`\text{NPS}_1,\ \text{NPS}_2`, 'The two scores', 'points'], [String.raw`z`, 'Test statistic, compared with the standard normal distribution', '']],
      assumptions: 'The two groups are independent samples: two segments, or two waves of a survey with fresh samples.',
      note: 'The two-sided p-value is <x>=2*(1-NORM.S.DIST(ABS(z),TRUE))</x>.' },
    { id: 'as-weighted-share', name: 'Weighted share (or weighted mean)',
      tex: String.raw`\bar{y}_w = \dfrac{\sum_i w_i\, y_i}{\sum_i w_i} = \dfrac{\sum_h N_h\, \hat{p}_h}{N}`,
      where: [[String.raw`w_i`, 'Weight of respondent i: here N_h ÷ n_h for their segment', ''], [String.raw`y_i`, '1 if respondent i counts (a promoter, a top-two answer), else 0; or a number, for a weighted mean', ''], [String.raw`N_h,\ N`, 'Population in segment h, and in total', 'people'], [String.raw`\hat{p}_h`, 'Share in segment h among its respondents', ''], [String.raw`\bar{y}_w`, 'Weighted share or mean', '']],
      assumptions: 'The second form holds when every respondent in a segment has the same weight N_h ÷ n_h.',
      note: 'Excel: <x>=SUMPRODUCT(I2:I517,Y2:Y517)/SUM(I2:I517)</x> with the weights in I and the 0/1 values in Y, or a SUMPRODUCT of conditions as in In depth.' },
  ],

  examples: [
    { level: 'simple', title: 'A garden centre’s Net Promoter Score', fictional: true,
      setup: 'Pindlebury Garden Centre asked 240 customers at the till how likely they were to recommend it, from 0 to 10. It counted 102 answers of 9 or 10, 84 of 7 or 8 and 54 of 6 or below. What is its NPS, and what is the 95% margin of error?',
      steps: [
        'Shares: promoters 102 ÷ 240 = 42.5%, passives 84 ÷ 240 = 35.0%, detractors 54 ÷ 240 = 22.5%. The three add to 100%, a check that every answer was classified once.',
        'NPS: 42.5 − 22.5 = +20.0. Passives don’t enter the subtraction, but they stay in the base of 240.',
        String.raw`Standard error: first <m>0.425 + 0.225 - 0.200^2</m> <m>= 0.610</m>, then <m>100\sqrt{0.610 \div 240}</m> <m>\approx 5.04</m> points.`,
        String.raw`Margin at 95%: <m>1.96 \times 5.04 \approx 9.9</m> points, so the interval runs from about +10.1 to +29.9.`,
      ],
      answer: 'NPS +20.0, with a 95% margin of error of about ±9.9 points (+10.1 to +29.9). Base: 240 customers.',
      interpretation: 'The garden centre can say that more of its till customers are promoters than detractors, and fairly confidently so, but not much more precisely than “somewhere between +10 and +30”. Customers at the till on the survey days are also a convenience sample of the people who bought something, so the score describes them, not every customer.' },
    { level: 'challenging', title: 'Cleaning and weighting a gym’s class survey', fictional: true,
      setup: 'Rookwell Fitness e-mailed a random sample of members at each of its three clubs, asking how likely they would be to attend a new 6 a.m. class at least once a week (definitely, probably, might or might not, probably not, definitely not), followed by a grid of ten satisfaction items, two of them reversed. It received 470 completes. Its rules, set before fieldwork: remove anyone who finished in under a third of the median time (the median was 7 minutes), or who gave the same answer to all ten grid items. Twelve were speeders and six straight-liners, three of them both. Estimate the share of all members in the top two boxes.',
      table: {
        caption: 'Rookwell Fitness: members, completes and answers by club (fictional)',
        head: ['Club', 'Members', 'Completes', 'Removed', 'Kept', 'Top two boxes'],
        align: ['l', 'r', 'r', 'r', 'r', 'r'],
        rows: RK.clubs.map((c, i) => [c, int(RK.members[i]), String(RK.completes[i]), String(RK.removed[i]), String(RKkept[i]), String(RK.top2[i])]),
        foot: [['Total', int(RKN), String(RK.completes.reduce((a, b) => a + b, 0)), String(RK.removed.reduce((a, b) => a + b, 0)), String(RKn), String(RKx)]],
      },
      steps: [
        'Clean: a third of 7 minutes is 2 minutes 20 seconds. The two rules flag 12 + 6 − 3 = 15 people (the three flagged twice count once), leaving 455. A straight line through a grid with reversed items contradicts itself, so the evidence is strong; Rookwell reports “15 of 470 completes removed under the quality rules”.',
        'Unweighted: 152 ÷ 455 = 33.4% in the top two boxes. But Hilltop supplies 121 of the 455 (26.6%) while holding only 600 of the 4,500 members (13.3%), and Hilltop is the keenest club (60 of 121, 49.6%, against 29.7% at City and 25.0% at Riverside).',
        'Weight each club by members ÷ kept: City 2,400 ÷ 182 ≈ 13.19, Riverside 1,500 ÷ 152 ≈ 9.87, Hilltop 600 ÷ 121 ≈ 4.96. The weighted share is (2,400 × 29.67% + 1,500 × 25.00% + 600 × 49.59%) ÷ 4,500 ≈ 30.8%.',
        'Compare: is Hilltop really keener than City? 49.6% against 29.7% gives a two-proportion z of 3.50 (p ≈ 0.0005), so yes, beyond chance.',
      ],
      answer: 'About 30.8% of members (weighted to club sizes; unweighted base 455 after removing 15 under the quality rules) say they would definitely or probably attend; Hilltop members are clearly keener than City members.',
      interpretation: 'The unweighted 33.4% overstates interest because the keenest club answered out of proportion to its size. The gap between the two figures is small here, but the habit matters: the weighted figure, its base and the cleaning rule all go in the report. Interest is a stated intention, so a sensible next step is to run the class at Hilltop first and count who comes.' },
    { level: 'applied', title: 'Who would buy Lantern Cold Brew?', fictional: true,
      setup: 'Ana wants one paragraph for her March planning meeting: how many people on her list would buy Cold Brew, which segments, and how sure she can be. Use the cross-tab of Q2 by segment, B04’s tests and the weights.',
      steps: [
        'Describe with the right percentages: within each segment, the top-two-box share is 61.8% for subscribers (base 89), 55.3% for other shop customers (103), 51.9% for workshop participants (27) and 31.0% for newsletter-only respondents (297).',
        'Test: the full 4 × 5 table has an expected count of 2.56, so merge to top two against the rest; χ² = 37.7, 3 degrees of freedom, p &lt; 0.0001, V = 0.27. Subscribers against newsletter-only: z = 5.25; other shop customers against newsletter-only: z = 4.41. Subscribers against other shop customers: z = 0.91, p = 0.37, not distinguishable.',
        'Apply the minimum base: workshop participants (27) fall below 30, so they get no figure of their own in the paragraph.',
        'Generalise: unweighted, 42.2% of completes are in the top two boxes; weighted to the list’s segment sizes, 38.2%. The weighted figure is the one to quote for the list as a whole, with its unweighted base of 516.',
      ],
      answer: '“Weighted to the list’s segment sizes, 38.2% of people on Lantern’s mailing list say they would definitely or probably buy Cold Brew in the next three months (unweighted base 516). Intent is far higher among Lantern’s shop customers and subscribers (55% and 62%) than among newsletter-only contacts (31%).”',
      interpretation: 'The paragraph gives the figure, its base, its weighting and the one difference that is clearly real. It doesn’t say 38% will buy: these are stated intentions from people who answered a survey from Lantern, and the focus groups and the price audit must test why the newsletter-only contacts, the largest group on the list, are less keen.' },
  ],

  demo: [
    { widget: 'as-sheet', intro: 'All 516 completes as a worksheet, with each respondent’s weight in column I and a summary area in K to P. Build the frequency table, the NPS by segment and the weighted results with the formulas from In depth, and check your counts add to 516.' },
    { widget: 'as-pivot', intro: 'The same completes as a PivotTable. Start with Segment in Rows and Cold Brew intent in Columns, shown as % of Row Total. Then try: Average of NPS points by segment (it is each segment’s NPS); Sum of Weight instead of Sum of Respondents, where the segment rows don’t move (everyone in a segment has the same weight) but the Grand Total row becomes the weighted result, 38.2% in the top two boxes; and % of Column Total, to see the other question the same counts answer.' },
    { widget: 'as-nps', intro: 'Change the counts of promoters, passives and detractors to see the NPS, its margin of error and Rocks’s adjusted interval. Try Ana’s workshop participants (16, 6 and 5) and then the same shares ten times larger, and watch the margin shrink by about √10.' },
  ],

  mistakes: [
    { title: '“42% would buy” is a finding.', html: 'Not until the reader knows 42% of whom and of how many. Print the base with every figure (“base: all completes, 516”), say whether it is weighted, and keep one base throughout a table or print each row’s.' },
    { title: '“A cross-tab can be percentaged either way.”', html: 'Both directions are arithmetic, but they answer different questions. To compare how groups answered, percentage within each category of the explanatory variable: 61.8% of subscribers against 31.0% of newsletter-only respondents. Reading the column view (38.3% of those who would definitely buy were newsletter-only) as that group’s rate is the error.' },
    { title: '“An NPS of +27.5 means 27.5% would recommend Lantern.”', html: 'It is the percentage of promoters minus the percentage of detractors: 45.9% − 18.4%. A score of 0 can mean half promoters and half detractors, or everyone a passive, so show the three shares beside it.' },
    { title: '“Don’t know” can be stored as 0, or as 99, and averaged.', html: '0 is a real answer on a 0–10 scale, and AVERAGE treats 99 as a score. Give each kind of missing answer its own code, exclude the codes with AVERAGEIFS or a criterion such as <x>"<99"</x>, and decide whether each base includes “don’t know”.' },
    { title: '“Weighting removes non-response bias.”', html: 'Weighting to segment sizes corrects only for segments replying at different rates. If, within a segment, the people who reply differ from those who don’t, as Lantern’s promoters did, the weighted figure is still biased, and nothing in the data shows by how much.' },
    { title: '“Two segments differ because their figures differ.”', html: 'Every segment’s figure has a margin of error that grows as its base shrinks. Subscribers’ 61.8% and other shop customers’ 55.3% can’t be told apart (p = 0.37), and 27 workshop participants give margins of ±19 to ±30 points. Test the comparisons that matter, and don’t report bases below your minimum.' },
  ],

  application: [
    { case: 'Tallyroot Software, a fictional firm selling accounts software to small businesses, surveys a fresh random sample of its customers every quarter. Its customer-insight manager, Saoirse Adeyemi, runs the analysis the same way each time, which is what lets the board compare one quarter with the next.' },
    { p: '<b>She writes the rules before fieldwork.</b> Her data-processing specification sets out what counts as a complete, the speeder rule (under a third of the median time), the straight-lining rule for the eight-item satisfaction grid with its two reversed items, the code frame for open answers (with “no suggestion” kept apart from blanks), the weighting (to the customer base by plan) and the minimum base of 30 for any figure. Each quarter’s report says how many completes the rules removed.' },
    { p: '<b>Her tables put the explanatory variables across the top.</b> Every question is cross-tabulated by plan, region and how long the customer has been with Tallyroot, with the base printed above each column and the figures percentaged down the columns. The rule is about the variable, not the direction: the groups being compared are the columns, so each column adds to 100%. Weighted figures carry unweighted bases, and any column with fewer than 30 completes is left blank with a note.' },
    { p: '<b>She tests the change before anyone celebrates it.</b> This quarter’s NPS is +23.0 from 610 customers, against +18.0 from 640 last quarter, and a director wants to announce an improvement. The standard errors are 3.13 and 3.08 points, so the change of 5.0 points has a standard error of 4.39, z = 1.14 and p = 0.26: the 95% interval for the change runs from −3.6 to +13.6 points. Her summary reads: “NPS +23 (±6), against +18 (±6) last quarter: a change within what sampling alone produces. We can’t say that customers became more likely to recommend us.”' },
    { p: '<b>She keeps the score in its place.</b> Beside the NPS she shows the three shares, the coded reasons and the cross-tabs, because the reasons are what the product team can act on. When the board proposed tying bonuses to the score, she pointed to <g>Goodhart’s law</g>: a target invites teams to chase the number, by surveying only happy customers for instance, and then it stops measuring what it was meant to.' },
  ],

  summary: [
    'Prepare before you count: a rule for partial responses, speeders and straight-liners set before fieldwork, distinct codes for each kind of missing answer (never 0), and a code frame for open answers.',
    'Every percentage has a base; print it, keep it consistent within a table, and give weighted figures with their unweighted base.',
    'Build frequency tables with COUNTIF and cross-tabs with COUNTIFS or a PivotTable, and percentage within each category of the explanatory variable.',
    'Top-box and top-two-box scores summarise a purchase-intent scale as shares of the base; they are stated intentions, not forecasts.',
    'NPS = % promoters (9–10) − % detractors (0–6), from −100 to +100. SE = 100√((p_P + p_D − (p_P − p_D)²) ÷ n); compare two independent scores with √(SE₁² + SE₂²). Rocks (2016) recommends an adjusted interval, which matters most on small bases.',
    'Weighted shares are SUMPRODUCT(weights, values) ÷ SUM(weights); weighting corrects for segments replying out of proportion, not for differences within a segment.',
    'Compare groups with B04’s tests (merging categories when expected counts fall below 5), report the median for skewed counts, and set a minimum base, such as NCHS’s 30, before analysing.',
  ],

  glossary: [
    { term: 'Base', def: 'The number of respondents a percentage or average is calculated on, such as all 516 completes or the 297 newsletter-only respondents. It is printed with the figure; a weighted figure is given with its unweighted base.' },
    { term: 'Frequency table', def: 'A table of the answers to one question, giving the count and the percentage of the base for each answer.' },
    { term: 'Cross-tabulation', def: 'A table counting respondents by their answers to two questions at once, usually shown with percentages calculated within each category of the explanatory variable. Also called a cross-tab.' },
    { term: 'Top-box score', def: 'The percentage of respondents choosing the most favourable answer on a rating or purchase-intent scale, such as “definitely would buy”.' },
    { term: 'Top-two-box score', def: 'The percentage of respondents choosing either of the two most favourable answers on a scale, such as “definitely” or “probably would buy”.' },
    { term: 'Speeder', def: 'A survey respondent who completes the questionnaire much faster than anyone could read it attentively, judged against a time threshold set in advance; a sign of answering with too little effort.' },
    { term: 'Straight-lining', def: 'Giving the same answer to every item in a grid of rating questions; strong evidence of inattention when the grid contains reversed items.' },
    { term: 'Code frame', def: 'The list of themes, each with a definition and examples, used to code open survey answers into categories that can be counted.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3, “Steps in a Successful Marketing Research Plan” (analysing and interpreting the data: frequencies, cross-tabulation, verbatims). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'Bain &amp; Company. “Measuring Your Net Promoter Score”: the question, the 0–10 scale, promoters, passives and detractors, and the calculation.', url: 'https://nps.bain.com/about/measuring-your-net-promoter-score/', checked: '2026-10-24' },
    { text: 'Reichheld, F. F. (2003). The one number you need to grow. <i>Harvard Business Review</i>, 81(12), 46–54.', url: 'https://hbr.org/2003/12/the-one-number-you-need-to-grow', checked: '2026-10-24' },
    { text: 'Keiningham, T. L., Cooil, B., Andreassen, T. W. &amp; Aksoy, L. (2007). A longitudinal examination of net promoter and firm revenue growth. <i>Journal of Marketing</i>, 71(3). doi:10.1509/jmkg.71.3.39.', url: 'https://research.hub.ku.edu.tr/entities/publication/6c8605c0-154e-4020-bcd9-2e7e3e1f1550/full', checked: '2026-10-24' },
    { text: 'Rocks, B. (2016). Interval estimation for the “net promoter score”. <i>The American Statistician</i>, 70(4), 365–372. Preprint: arXiv:1601.07235.', url: 'https://arxiv.org/abs/1601.07235v1', checked: '2026-10-24' },
    { text: 'Zhang, C. &amp; Conrad, F. (2014). Speeding in web surveys: the tendency to answer very fast and its association with straightlining. <i>Survey Research Methods</i>, 8(2), 127–135.', url: 'https://ojs.ub.uni-konstanz.de/srm/article/view/5453', checked: '2026-10-24' },
    { text: 'Parker, J. D., Talih, M., Malec, D. J. et al. (2017). <i>National Center for Health Statistics Data Presentation Standards for Proportions</i>. Vital and Health Statistics, Series 2, No. 175.', url: 'https://stacks.cdc.gov/view/cdc/47786', checked: '2026-10-24' },
  ],

  checks: [
    // the survey
    { what: 'Invited', value: DISPOSITIONS.all.invited, shown: 2004 },
    { what: 'Completes', value: N, shown: 516 },
    { what: 'Partials', value: DISPOSITIONS.all.P, shown: 56 },
    { what: 'Suggested something', value: SUGG, shown: 331 },
    { what: 'Price % of all', value: (TH[1] / N) * 100, shown: 16.3, tol: 0.05 },
    { what: 'Price % of suggestions', value: (TH[1] / SUGG) * 100, shown: 25.4, tol: 0.05 },
    { what: 'Price suggestions', value: TH[1], shown: 84 },
    { what: 'Range suggestions', value: TH[3], shown: 76 },
    { what: 'Delivery suggestions', value: TH[2], shown: 58 },
    { what: 'Price is about a quarter of suggestions', value: TH[1] / SUGG, shown: 0.25, tol: 0.01 },
    { what: 'Delivery speed, subscribers %', value: (thBy(0, 2) / nS[0]) * 100, shown: 18.0, tol: 0.05 },
    { what: 'Delivery speed, newsletter only %', value: (thBy(3, 2) / nS[3]) * 100, shown: 8.1, tol: 0.05 },
    { what: 'Themes', value: LEVELS.theme.length, shown: 7 },
    // frequency table
    { what: 'Definitely %', value: (CB.colTotals[0] / N) * 100, shown: 15.7, tol: 0.05 },
    { what: 'Rounded Q2 shares add to 100.1', value: CB.colTotals.reduce((s, c) => s + Math.round((c / N) * 1000) / 10, 0), shown: 100.1, tol: 0.001 },
    { what: 'Top two %', value: D.coldbrew.topTwo * 100, shown: 42.2, tol: 0.05 },
    { what: 'Bottom two %', value: (bot2(R) / N) * 100, shown: 26.2, tol: 0.05 },
    { what: 'Definitely count', value: CB.colTotals[0], shown: 81 },
    // cross-tab
    { what: 'Subscribers top two %', value: (T2[0][0] / nS[0]) * 100, shown: 61.8, tol: 0.05 },
    { what: 'Shop top two %', value: (T2[1][0] / nS[1]) * 100, shown: 55.3, tol: 0.05 },
    { what: 'Workshop top two %', value: (T2[2][0] / nS[2]) * 100, shown: 51.9, tol: 0.05 },
    { what: 'Newsletter top two %', value: (T2[3][0] / nS[3]) * 100, shown: 31.0, tol: 0.05 },
    { what: 'Newsletter among definite buyers', value: CB.counts[3][0], shown: 31 },
    { what: 'Newsletter share of definite buyers %', value: CB.colPct[3][0] * 100, shown: 38.3, tol: 0.05 },
    { what: 'Newsletter definitely %', value: CB.rowPct[3][0] * 100, shown: 10.4, tol: 0.05 },
    { what: 'Bases', value: nS.join() === '89,103,27,297' ? 1 : 0, shown: 1 },
    { what: 'Shop base', value: nS[1], shown: 103 },
    { what: 'Newsletter base', value: nS[3], shown: 297 },
    { what: 'Workshop base', value: nS[2], shown: 27 },
    { what: 'Subscriber base', value: nS[0], shown: 89 },
    // NPS
    { what: 'Promoters', value: NPS.promoters, shown: 237 },
    { what: 'Passives', value: NPS.passives, shown: 184 },
    { what: 'Detractors', value: NPS.detractors, shown: 95 },
    { what: 'Promoters %', value: NPS.pP * 100, shown: 45.9, tol: 0.05 },
    { what: 'Passives %', value: (NPS.passives / N) * 100, shown: 35.7, tol: 0.05 },
    { what: 'Detractors %', value: NPS.pD * 100, shown: 18.4, tol: 0.05 },
    { what: 'NPS', value: NPS.score, shown: 27.5, tol: 0.05 },
    { what: '45.9 − 18.4', value: 45.9 - 18.4, shown: 27.5, tol: 1e-9 },
    { what: 'NPS SE', value: NPS.se, shown: 3.32 },
    { what: 'SE from rounded inputs', value: 100 * Math.sqrt((0.459 + 0.184 - 0.275 ** 2) / 516), shown: 3.32 },
    { what: 'NPS margin', value: NPS.margin, shown: 6.5, tol: 0.05 },
    { what: '1.96 × 3.32', value: 1.96 * 3.32, shown: 6.5, tol: 0.05 },
    { what: 'NPS low', value: NPS.low, shown: 21, tol: 0.5 },
    { what: 'NPS high', value: NPS.high, shown: 34, tol: 0.5 },
    { what: 'Promoter-share margin', value: promMargin, shown: 4.3, tol: 0.05 },
    { what: 'Half as wide again', value: NPS.margin / promMargin, shown: 1.5, tol: 0.05 },
    { what: 'Subscribers NPS', value: NPSS[0].score, shown: 61.8, tol: 0.05 },
    { what: 'Shop NPS', value: NPSS[1].score, shown: 53.4, tol: 0.05 },
    { what: 'Workshop NPS', value: NPSS[2].score, shown: 40.7, tol: 0.05 },
    { what: 'Newsletter NPS', value: NPSS[3].score, shown: 7.1, tol: 0.05 },
    { what: 'Subscribers NPS rounded', value: NPSS[0].score, shown: 62, tol: 0.5 },
    { what: 'Newsletter NPS rounded', value: NPSS[3].score, shown: 7, tol: 0.5 },
    { what: 'Subscribers SE', value: NPSS[0].se, shown: 7.20 },
    { what: 'Newsletter SE', value: NPSS[3].se, shown: 4.28 },
    { what: 'NPS gap sub − news', value: dNps, shown: 54.7, tol: 0.05 },
    { what: 'SE of gap', value: dSe, shown: 8.37 },
    { what: 'z of gap', value: dNps / dSe, shown: 6.5, tol: 0.05 },
    { what: 'Adjusted Wald all: score', value: AW_ALL.score, shown: 27.4, tol: 0.05 },
    { what: 'Adjusted Wald all: margin', value: AW_ALL.margin, shown: 6.5, tol: 0.05 },
    { what: 'Workshop Wald low', value: NPSS[2].low, shown: 11.2, tol: 0.05 },
    { what: 'Workshop Wald high', value: NPSS[2].high, shown: 70.2, tol: 0.05 },
    { what: 'Workshop adjusted low', value: AW_WS.low, shown: 8.6, tol: 0.05 },
    { what: 'Workshop adjusted high', value: AW_WS.high, shown: 64.7, tol: 0.05 },
    { what: 'Workshop NPS margin', value: NPSS[2].margin, shown: 29.5, tol: 0.05 },
    { what: 'Workshop NPS low rounded', value: NPSS[2].low, shown: 11, tol: 0.5 },
    { what: 'Workshop NPS high rounded', value: NPSS[2].high, shown: 70, tol: 0.5 },
    { what: 'Workshop promoters', value: NPSS[2].promoters, shown: 16 },
    { what: 'Workshop passives', value: NPSS[2].passives, shown: 6 },
    { what: 'Workshop detractors', value: NPSS[2].detractors, shown: 5 },
    { what: 'Rocks: 3/4 and 3/2', value: 0.75 + 1.5 + 0.75, shown: 3 },
    { what: 'Norwegian firms (Keiningham et al.)', value: 21, shown: 21 },
    { what: 'Rocks: coverage short of 95% at 300 answers', value: 300, shown: 300 },
    // weighting
    { what: 'Subscribers % of list', value: (SIZES[0] / LIST) * 100, shown: 8.7, tol: 0.05 },
    { what: 'Subscribers % of completes', value: (nS[0] / N) * 100, shown: 17.2, tol: 0.05 },
    { what: 'Newsletter % of list', value: (SIZES[3] / LIST) * 100, shown: 72.2, tol: 0.05 },
    { what: 'Newsletter % of completes', value: (nS[3] / N) * 100, shown: 57.6, tol: 0.05 },
    { what: 'Weighted NPS', value: D.nps.weighted.score, shown: 20.4, tol: 0.05 },
    { what: 'Weighted top two %', value: D.coldbrew.topTwoWeighted * 100, shown: 38.2, tol: 0.05 },
    { what: 'Weighted top two by the four-row table', value: SIZES.reduce((s, M, h) => s + (M * T2[h][0]) / nS[h], 0) / LIST, shown: D.coldbrew.topTwoWeighted, tol: 1e-12 },
    { what: 'Kish effective n', value: nEff, shown: 469, tol: 0.5 },
    { what: 'Weighted NPS margin (Kish)', value: wMargin, shown: 6.8, tol: 0.05 },
    { what: 'Weighted NPS margin (stratified SE)', value: STRAT_NPS.margin, shown: 6.3, tol: 0.05 },
    { what: 'Stratified NPS equals weighted NPS', value: STRAT_NPS.mean, shown: D.nps.weighted.score, tol: 1e-9 },
    { what: 'Weighted top two from the four-row table equals the pivot grand total', value: D.coldbrew.topTwoWeighted * 100, shown: 38.2, tol: 0.05 },
    { what: 'Truth NPS', value: D.nps.truth, shown: 8.4, tol: 0.05 },
    { what: 'True top two %', value: D.coldbrew.truthTopTwo * 100, shown: 39.3, tol: 0.05 },
    { what: 'List size', value: LIST, shown: 6000 },
    // comparisons
    { what: 'z subscribers v newsletter', value: SUBNEWS.z, shown: 5.25 },
    { what: 'p below 0.0001', value: Number(SUBNEWS.pValue < 0.0001), shown: 1 },
    { what: 'Gap CI low', value: SUBNEWS.low * 100, shown: 19.4, tol: 0.05 },
    { what: 'Gap CI high', value: SUBNEWS.high * 100, shown: 42.2, tol: 0.05 },
    { what: 'z subscribers v shop', value: SUBSHOP.z, shown: 0.91 },
    { what: 'z shop v newsletter', value: SHOPNEWS.z, shown: 4.41 },
    { what: 'p subscribers v shop', value: SUBSHOP.pValue, shown: 0.37 },
    { what: 'Sub v shop CI low', value: SUBSHOP.low * 100, shown: -7.5, tol: 0.05 },
    { what: 'Sub v shop CI high', value: SUBSHOP.high * 100, shown: 20.4, tol: 0.05 },
    { what: 'Smallest expected count, 4 × 5', value: CHI5.minExpected, shown: 2.56 },
    { what: 'Smallest expected is workshop × definitely not', value: Number(Math.abs(CHI5.expected[2][4] - CHI5.minExpected) < 1e-12), shown: 1 },
    { what: 'Smallest expected count, 4 × 2', value: CHI2.minExpected, shown: 11.4, tol: 0.05 },
    { what: 'Chi-square, 4 × 2', value: CHI2.stat, shown: 37.7, tol: 0.05 },
    { what: 'df, 4 × 2', value: CHI2.df, shown: 3 },
    { what: 'p, 4 × 2 below 0.0001', value: Number(CHI2.p < 0.0001), shown: 1 },
    { what: 'Cramér’s V', value: CHI2.cramersV, shown: 0.27 },
    { what: 'Twenty tests at 5%', value: 20 * 0.05, shown: 1 },
    // cups
    { what: 'Cups max', value: Math.max(...cups), shown: 20 },
    { what: 'Cups zero', value: cups.filter((x) => x === 0).length, shown: 60 },
    { what: 'Cups zero %', value: (cups.filter((x) => x === 0).length / N) * 100, shown: 11.6, tol: 0.05 },
    { what: 'Cups median', value: median(cups), shown: 3 },
    { what: 'Cups mean', value: mean(cups), shown: 3.9, tol: 0.05 },
    { what: 'Cups mean from case', value: D.cups.mean, shown: 3.9, tol: 0.05 },
    { what: 'Cups SD', value: sdS(cups), shown: 3.4, tol: 0.05 },
    { what: 'Every segment median is 3', value: Number(cupsByS.every((g) => median(g) === 3)), shown: 1 },
    { what: 'Lowest segment mean', value: Math.min(...cupsByS.map(mean)), shown: 3.7, tol: 0.05 },
    { what: 'Highest segment mean', value: Math.max(...cupsByS.map(mean)), shown: 4.0, tol: 0.05 },
    // small bases
    { what: 'Workshop top-two margin', value: wsTop2.margin * 100, shown: 18.8, tol: 0.05 },
    { what: 'One respondent in 27, points', value: 100 / 27, shown: 3.7, tol: 0.05 },
    { what: 'NCHS minimum', value: 30, shown: 30 },
    // the questions
    { what: 'Questions', value: 6, shown: 6 },
    { what: 'Columns in the export', value: 8, shown: 8 },
    // Pindlebury
    { what: 'Pindlebury n', value: PIN.n, shown: 240 },
    { what: 'Pindlebury promoters %', value: PIN.pP * 100, shown: 42.5, tol: 1e-9 },
    { what: 'Pindlebury passives %', value: (84 / 240) * 100, shown: 35.0, tol: 1e-9 },
    { what: 'Pindlebury detractors %', value: PIN.pD * 100, shown: 22.5, tol: 1e-9 },
    { what: 'Pindlebury NPS', value: PIN.score, shown: 20.0, tol: 1e-9 },
    { what: 'Pindlebury variance term', value: PIN.pP + PIN.pD - (PIN.pP - PIN.pD) ** 2, shown: 0.610, tol: 1e-9 },
    { what: 'Pindlebury SE', value: PIN.se, shown: 5.04 },
    { what: 'Pindlebury margin', value: PIN.margin, shown: 9.9, tol: 0.05 },
    { what: 'Pindlebury margin from rounded', value: 1.96 * 5.04, shown: 9.9, tol: 0.05 },
    { what: 'Pindlebury low', value: PIN.low, shown: 10.1, tol: 0.05 },
    { what: 'Pindlebury high', value: PIN.high, shown: 29.9, tol: 0.05 },
    // Rookwell
    { what: 'Rookwell completes', value: RK.completes.reduce((a, b) => a + b, 0), shown: 470 },
    { what: 'Rookwell removed', value: RK.speeders + RK.straight - RK.both, shown: 15 },
    { what: 'Removed by club add up', value: RK.removed.reduce((a, b) => a + b, 0), shown: 15 },
    { what: 'Rookwell kept', value: RKn, shown: 455 },
    { what: 'A third of 7 minutes, in seconds', value: (RK.medianMin * 60) / 3, shown: 140 },
    { what: 'Rookwell unweighted %', value: (RKx / RKn) * 100, shown: 33.4, tol: 0.05 },
    { what: 'Rookwell top two', value: RKx, shown: 152 },
    { what: 'Hilltop share of kept %', value: (RKkept[2] / RKn) * 100, shown: 26.6, tol: 0.05 },
    { what: 'Hilltop share of members %', value: (RK.members[2] / RKN) * 100, shown: 13.3, tol: 0.05 },
    { what: 'Hilltop top two %', value: (RK.top2[2] / RKkept[2]) * 100, shown: 49.6, tol: 0.05 },
    { what: 'City top two %', value: (RK.top2[0] / RKkept[0]) * 100, shown: 29.7, tol: 0.05 },
    { what: 'Riverside top two %', value: (RK.top2[1] / RKkept[1]) * 100, shown: 25.0, tol: 0.05 },
    { what: 'City share (2 dp)', value: (RK.top2[0] / RKkept[0]) * 100, shown: 29.67, tol: 0.005 },
    { what: 'Hilltop share (2 dp)', value: (RK.top2[2] / RKkept[2]) * 100, shown: 49.59, tol: 0.005 },
    { what: 'City weight', value: RKw[0], shown: 13.19 },
    { what: 'Riverside weight', value: RKw[1], shown: 9.87 },
    { what: 'Hilltop weight', value: RKw[2], shown: 4.96 },
    { what: 'Rookwell weighted %', value: RKweighted * 100, shown: 30.8, tol: 0.05 },
    { what: 'Rookwell weighted from rounded', value: ((2400 * 0.2967 + 1500 * 0.25 + 600 * 0.4959) / 4500) * 100, shown: 30.8, tol: 0.05 },
    { what: 'Hilltop v City z', value: RKz.z, shown: 3.50 },
    { what: 'Hilltop v City p', value: RKz.pValue, shown: 0.0005, tol: 0.00005 },
    { what: 'Rookwell members', value: RKN, shown: 4500 },
    { what: 'Grid items', value: 10, shown: 10 },
    // applied example rounding
    { what: 'Shop top two rounded', value: (T2[1][0] / nS[1]) * 100, shown: 55, tol: 0.5 },
    { what: 'Subscribers top two rounded', value: (T2[0][0] / nS[0]) * 100, shown: 62, tol: 0.5 },
    { what: 'Newsletter top two rounded', value: (T2[3][0] / nS[3]) * 100, shown: 31, tol: 0.5 },
    // Tallyroot
    { what: 'Tallyroot wave 2 NPS', value: TB.score, shown: 23.0, tol: 0.05 },
    { what: 'Tallyroot wave 1 NPS', value: TA.score, shown: 18.0, tol: 0.05 },
    { what: 'Tallyroot wave 2 n', value: TB.n, shown: 610 },
    { what: 'Tallyroot wave 1 n', value: TA.n, shown: 640 },
    { what: 'Tallyroot SE 2', value: TB.se, shown: 3.13 },
    { what: 'Tallyroot SE 1', value: TA.se, shown: 3.08 },
    { what: 'Tallyroot change', value: TB.score - TA.score, shown: 5.0, tol: 0.05 },
    { what: 'Tallyroot SE of change', value: TdSe, shown: 4.39 },
    { what: 'Tallyroot z', value: Tz, shown: 1.14 },
    { what: 'Tallyroot p', value: 2 * (1 - I.normCdf(Math.abs(Tz))), shown: 0.26 },
    { what: 'Tallyroot CI low', value: TB.score - TA.score - Z * TdSe, shown: -3.6, tol: 0.05 },
    { what: 'Tallyroot CI high', value: TB.score - TA.score + Z * TdSe, shown: 13.6, tol: 0.05 },
    { what: 'Tallyroot margins about 6', value: Math.max(TA.margin, TB.margin), shown: 6, tol: 0.5 },
    { what: 'Tallyroot grid items', value: 8, shown: 8 },
    { what: 'Tallyroot minimum base', value: 30, shown: 30 },
  ],
};
