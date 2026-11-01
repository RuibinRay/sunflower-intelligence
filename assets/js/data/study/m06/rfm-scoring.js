// rfm-scoring.js — M06 · RFM scoring. Content only; exercises are in rfm-scoring.ex.js.
// Lantern's members scored on recency, frequency and monetary value with core/customer.js (score, cutPoints, rfm): the
// quintile cut points on 31 December 2027, ties and uneven groups, equal-sized groups (NTILE) and how they split ties,
// the boundary convention (a value on a cut point stays in the lower group; MATCH on lower bounds moves it up), the 125
// cells, the combined score and FM, changing k, and scores moving with the date (31 October against 31 December).
// The November–December return rates by score use case.js churnTable() (members who joined by 31 August, scored as
// of 31 October). Naming segments is left to rfm-segments. Quaymouth Books is fictional. Every printed figure is in
// `checks`.
import { members, churnTable, CALIBRATION_END, DERIVED as D } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';
import { spearman } from '../../../core/correlation.js?v=25';

const ALL = members(), N = ALL.length;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const int = (v) => v.toLocaleString('en-US');
const num = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const R = ALL.map((m) => m.recency), F = ALL.map((m) => m.frequency), M = ALL.map((m) => m.monetary), AOV = ALL.map((m) => m.aov);
const CR = CU.cutPoints(R), CF = CU.cutPoints(F), CM = CU.cutPoints(M);
// who would be on a top-spenders list, and on a most-recent list
const TOP5 = Math.round(N * 0.2), early = (m) => m.joinedIso < '2027-09', isDec = (m) => m.joinedIso >= '2027-12';
const topEarly = ALL.slice().sort((a, b) => b.monetary - a.monetary).slice(0, TOP5).filter(early).length, allEarly = ALL.filter(early).length;
const decAll = ALL.filter(isDec).length;
const SQ = CU.rfm(ALL), SN = CU.rfm(ALL, { method: 'ntile' });
const r5n = SQ.filter((c) => c.R === 5).length, decR5 = SQ.filter((c) => c.R === 5 && isDec(c)).length;
const CR3 = CU.cutPoints(R, 3);
const counts = (S, key, k = 5) => Array.from({ length: k }, (_, j) => S.filter((c) => c[key] === j + 1).length);
const FQ = counts(SQ, 'F'), FN = counts(SN, 'F'), RQ = counts(SQ, 'R'), MQ = counts(SQ, 'M');
const ones = F.filter((v) => v === 1).length, twos = F.filter((v) => v === 2).length;
// NTILE splits the members with two visits by their row order (join order)
const two = ALL.map((m, i) => ({ m, s: SN[i].F })).filter((x) => x.m.frequency === 2);
const twoF1 = two.filter((x) => x.s === 1), twoF2 = two.filter((x) => x.s === 2);
const lastJoinF1 = twoF1[twoF1.length - 1].m.joinedIso;
// the boundary convention: MATCH against lower bounds puts a value on a cut point in the higher group
const up = (v, c) => 1 + c.filter((q) => q <= v).length;
const matchF = F.map((v) => up(v, CF)), matchR = R.map((v) => 6 - up(v, CR)), matchM = M.map((v) => up(v, CM));
const diffF = matchF.filter((s, i) => s !== SQ[i].F).length, diffR = matchR.filter((s, i) => s !== SQ[i].R).length, diffM = matchM.filter((s, i) => s !== SQ[i].M).length;
const matchFc = Array.from({ length: 5 }, (_, j) => matchF.filter((s) => s === j + 1).length);
// cells, totals and FM
const CELLS = new Map(); SQ.forEach((c) => CELLS.set(c.cell, (CELLS.get(c.cell) || 0) + 1));
const cellsUsed = CELLS.size, small = [...CELLS.values()].filter((v) => v < 10).length;
const used = (k) => new Set(CU.rfm(ALL, { k }).map((c) => c.cell)).size;
const FMc = counts(SQ, 'FM');
const rhoFM = spearman(F, M).rho, rhoFA = spearman(F, AOV).rho;
const sameFM = SQ.filter((c) => c.F === c.M).length / N, near1 = SQ.filter((c) => Math.abs(c.F - c.M) <= 1).length / N;
const k3 = CU.rfm(ALL, { k: 3 }), k4 = CU.rfm(ALL, { k: 4 });
const F3 = counts(k3, 'F', 3), F4 = counts(k4, 'F', 4);
// three members scored against the base
const at = (id) => SQ.find((c) => c.id === id);
const X1 = at('A1694'), X2 = at('A0774'), X3 = at('A0006');
const W = (c) => 3 * c.R + 2 * c.F + c.M;
// the date: 31 October against 31 December
const OCT = members({ asOf: CALIBRATION_END }), SO = CU.rfm(OCT), dec = new Map(SQ.map((c) => [c.id, c]));
const COR = CU.cutPoints(OCT.map((m) => m.recency)), COF = CU.cutPoints(OCT.map((m) => m.frequency)), COM = CU.cutPoints(OCT.map((m) => m.monetary));
const QUIET = SO.filter((c) => dec.get(c.id).frequency === c.frequency);
const rDown = QUIET.filter((c) => dec.get(c.id).R < c.R).length, fMoved = QUIET.filter((c) => dec.get(c.id).F !== c.F).length;
const A82o = SO.find((c) => c.id === 'A0082'), A82d = dec.get('A0082'), A01o = SO.find((c) => c.id === 'A0001'), A01d = dec.get('A0001');
// later behaviour by score (members who joined by 31 August, scored on 31 October)
const CT = churnTable(), SC = CU.rfm(CT);
const backBy = (key, s) => { const g = SC.filter((c) => c[key] === s); return g.filter((c) => c.back).length / g.length; };
const backTot = (t) => { const g = SC.filter((c) => c.total === t); return g.filter((c) => c.back).length / g.length; };

// ---------------------------------------------------------------- the simple example: Quaymouth Books (fictional)
const QB = [1, 1, 1, 2, 2, 3, 4, 6, 9, 15];
const QC = CU.cutPoints(QB), QS = CU.score(QB), QN = CU.score(QB, { method: 'ntile' });
const QG = counts(QS.map((s) => ({ s })), 's');

// ---------------------------------------------------------------- figure: Quaymouth's ten customers, cut points and groups
function figure() {
  const x0 = 30, x1 = 410, X = (v) => Math.round((x0 + ((v - 0) / 16) * (x1 - x0)) * 10) / 10;
  let s = '<svg viewBox="0 0 440 230" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  s += `<line x1="${x0}" x2="${x1}" y1="130" y2="130" stroke="var(--ink-3)" stroke-width="2"/>`;
  [0, 2, 4, 6, 8, 10, 12, 14, 16].forEach((v) => { s += `<line x1="${X(v)}" x2="${X(v)}" y1="130" y2="137" stroke="var(--ink-3)"/><text x="${X(v)}" y="156" text-anchor="middle" font-size="14" fill="var(--ink-3)">${v}</text>`; });
  s += `<text x="${(x0 + x1) / 2}" y="182" text-anchor="middle" font-size="15">Orders in the year</text>`;
  const stack = {}; QB.forEach((v) => { stack[v] = (stack[v] || 0) + 1; s += `<circle cx="${X(v)}" cy="${130 - 14 * stack[v]}" r="6" fill="var(--series-1)"/>`; });
  QC.forEach((c) => { s += `<line x1="${X(c)}" x2="${X(c)}" y1="44" y2="130" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="5 4"/><text x="${X(c)}" y="38" text-anchor="middle" font-size="14">${num(c)}</text>`; });
  s += `<text x="${x1}" y="18" text-anchor="end" font-size="14">dashed lines: cut points</text>`;
  s += `<text x="${x0}" y="214" font-size="15">Scores: 1 (3 customers), 2 (2), 3 (1), 4 (2), 5 (2)</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'rfm-scoring',
  title: 'RFM scoring',
  blurb: 'Score every customer from 1 to 5 on recency, frequency and monetary value, relative to the rest of the base: set quintile cut points, handle ties, reverse recency, and choose between 125 cells, a combined score and the R × FM grid. See why scores depend on the method, the number of groups and the date.',
  status: 'reviewed',
  objectives: [
    'Explain where RFM comes from and why recency is usually put first.',
    'Calculate quintile cut points with PERCENTILE.INC and score customers 1–5 on recency, frequency and monetary value, reversing recency.',
    'Compare quantile cut points with equal-sized groups (NTILE), and explain how each handles ties and why frequency’s groups are uneven.',
    'Combine scores as 125 RFM cells, a combined or weighted score, or the R × FM grid, and judge what each hides.',
    'Explain why scores are relative to a customer base and an as-of date, and how changing the number of groups changes them.',
  ],
  prerequisites: [
    { lesson: 'm06/customer-metrics', why: 'Scores are calculated from the customer table: recency, frequency and monetary value as of a stated date.' },
    { lesson: 'm05/psychographic-and-behavioural', why: 'RFM is a behavioural segmentation base: usage rate and loyalty status measured from records.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'Percentiles and PERCENTILE.INC give the cut points.' },
    { lesson: 'b03/functions-and-logic', why: 'Nested IFs turn a value and its cut points into a score.' },
  ],
  case: 'lantern',

  concept: [
    { case: `The café managers asked Ana for a list of Lantern’s best members. A list of the top spenders would be dominated by members who joined before September (${int(topEarly)} of the top ${int(TOP5)}, ${pc(topEarly / TOP5)}, against ${pc(allEarly / N)} of all members); a list of the most recent visitors over-represents the newest joiners (December’s are ${pc(decAll / N)} of members but ${pc(decR5 / r5n)} of the most recent fifth). She wants a way to describe every one of the ${int(N)} members on all three behaviours at once, in terms anyone in the cafés can read.` },
    { p: '<g>RFM analysis</g> does that. Each customer gets three scores, usually from 1 to 5: one for recency (R), one for frequency (F) and one for monetary value (M), where 5 means among the most recent, the most frequent or the biggest spenders in the base. A member scored 5-4-3 visited very recently, comes often and spends a middling amount.' },
    { p: 'The method comes from direct marketing. Catalogue and mail-order companies had to decide whom to send the next mailing to, and used each customer’s past buying to choose. Fader, Hardie and Lee (2005) describe RFM as drawn from the direct-marketing literature, and note, citing Hughes (2000), that it is called RFM rather than FRM because recency is usually the most powerful of the three.' },
    { h: 'From values to scores' },
    { p: 'A score ranks a customer against the others. The usual recipe sorts customers by a value and cuts the range at four <g>cut points</g>: the 20th, 40th, 60th and 80th percentiles. These divide the base into <g>quintiles</g>, five groups of about a fifth each. A value scores 1 plus the number of cut points it is above. For frequency and monetary value, high is good, so the score rises with the value; for recency, low is good, so the scale is reversed: the most recent fifth score 5.' },
    { table: {
      caption: 'Quintile cut points for Lantern’s members on 31 December 2027 (PERCENTILE.INC)',
      head: ['', '20th', '40th', '60th', '80th'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [['Recency (days)', ...CR.map(num)], ['Frequency (visits)', ...CF.map(num)], ['Monetary value ($)', ...CM.map((v) => v.toFixed(2))]],
    } },
    { p: `Member A1694 (recency ${X1.recency} days, ${X1.frequency} visits, ${money(X1.monetary)}) is above one recency cut point (${num(CR[0])}) but not the second (${num(CR[1])}), so the unreversed score is 2 and R = 6 − 2 = ${X1.R}. Four visits is above the cut points 2 and 3 but not 6: F = ${X1.F}. ${money(X1.monetary)} is above ${money(CM[0])} and ${money(CM[1])} but not ${money(CM[2])}: M = ${X1.M}. Written as a cell, A1694 is <b>${X1.cell}</b>.` },
    { h: 'Ties make uneven groups' },
    { p: `Quintiles are only “a fifth each” when the values are spread out. Frequency isn’t: ${int(ones)} members visited once and ${int(twos)} twice, and the first cut point is 2. Everyone at or below a cut point shares the lower score, so F1 holds ${int(FQ[0])} members (${pc(FQ[0] / N)}) and F2 only ${int(FQ[1])}. Recency and monetary value have few ties, and their groups come out close to ${int(Math.round(N / 5))} each.` },
    { p: 'You can force equal groups instead by sorting the customers and dealing them out in fifths (SQL’s NTILE does this). Then the members with two visits are split between F1 and F2 by nothing more than the order the rows happened to be in. Neither choice is wrong; each costs something, and the scores depend on which you make.' },
    { h: 'Three scores, or one?' },
    { p: `With five scores each, R, F and M make 5 × 5 × 5 = 125 <g>RFM cells</g>, from 111 to 555. That is too many to act on, and at Lantern only ${cellsUsed} of the 125 are used, ${small} of them by fewer than 10 members, while 555 holds ${CELLS.get('555')} and 111 holds ${CELLS.get('111')}. Analysts usually compress. A <g>combined RFM score</g> adds the three (3 to 15) or weights them. An <g>FM score</g> averages F and M, because at Lantern (and in most businesses) frequent visitors are the big spenders: the two scores are equal for ${pc(sameFM)} of members. R and FM then form a 5 × 5 grid that keeps recency separate, the grid the next lesson names.` },
    { callout: 'key', title: 'A score is relative', html: 'An R5 member is in about the most recent fifth of <i>this</i> base on <i>this</i> date. Add new members, change the window or move the as-of date, and the cut points move: a member can lose a score without doing anything. Compare scores only within one scoring run.' },
  ],

  theory: [
    { h: 'Quantile cut points' },
    { p: 'With k groups, the cut points are the k − 1 percentiles at 1/k, 2/k, …, (k − 1)/k. Excel’s PERCENTILE.INC (the same rule as QUARTILE.INC, NumPy’s and R’s default) sorts the n values and, for a percentile p, finds position (n − 1)p counting from 0, interpolating between neighbours when it falls between two. A value v then scores' },
    { math: String.raw`S(v) = 1 + \#\{\, j : v > c_j \,\}` },
    { p: 'so a value exactly on a cut point stays in the lower group (the interval is closed on the right). Ties always share a score, which is the main argument for this method: two customers who behaved identically get the same score. The cost is unequal groups wherever values pile up.' },
    { figure: { svg: figure(), caption: `Quaymouth Books (fictional): ten customers’ orders in a year, with the quintile cut points ${QC.map(num).join(', ')}. The three customers with one order share score 1, so the groups are 3, 2, 1, 2 and 2 customers.`, alt: `A number line of orders from 0 to 16 with ten dots stacked at their values: three at 1, two at 2, one each at 3, 4, 6, 9 and 15. Dashed vertical lines, labelled at the top, mark the cut points: ${QC.map(num).join(', ')}. A caption line reads: scores 1 (3 customers), 2 (2), 3 (1), 4 (2), 5 (2).` } },
    { h: 'Equal-sized groups' },
    { p: `The alternative sorts customers and deals them into k groups of near-equal size; SQL’s NTILE makes the first groups one larger when n doesn’t divide by k. Every score then has a fifth of the base, which suits a campaign that must mail exactly a fifth. The cost falls on ties: at Lantern, the ${int(twos)} members with two visits are split ${int(twoF1.length)} into F1 and ${int(twoF2.length)} into F2. Which ones go down depends on the sort’s tie-break, here the order of the rows: the ${twoF1.length} earliest in the row order (all joined by ${+lastJoinF1.slice(8, 10)} April) score F1. Microsoft’s documentation describes NTILE as nondeterministic: a database that returns tied rows in no fixed order can give a different answer each time it runs, so add a tie-breaker such as the customer ID.` },
    { table: {
      caption: 'Lantern’s members by frequency score, two methods (31 December 2027)',
      head: ['F score', '1', '2', '3', '4', '5'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [['Quantile cut points', ...FQ.map(int)], ['Equal-sized groups', ...FN.map(int)]],
    } },
    { h: 'The boundary convention' },
    { p: `Where a value lands when it equals a cut point is a convention, and for heavily tied values it matters more than the method. A lookup with MATCH against a table of lower bounds (0, then the four cut points) puts a value on a cut point in the <i>higher</i> group. For Lantern’s frequency that moves ${int(diffF)} members (everyone with exactly 2, 3, 6 or 11 visits) up a score, and F1 shrinks to the ${int(matchFc[0])} one-visit members. For recency it moves ${diffR} members and for spend none, because few values sit exactly on those cut points. Pick one convention, write it down and use it every time.` },
    { h: 'Reversing recency' },
    { p: 'Recency is the only one of the three where a small value is good. Either score it as usual and reverse (R = k + 1 − S), or write the tests the other way round (5 if recency ≤ the first cut point, 4 if ≤ the second, and so on). Both give the same scores. Forgetting to reverse is the commonest RFM error: it labels the members who left long ago as the best.' },
    { h: 'How many groups?' },
    { p: `Five is a habit, not a rule; deciles are also used, and Fader, Hardie and Lee (2005) use three groups on each dimension for their example. More groups make finer distinctions but sparser cells: at Lantern three groups use ${used(3)} of 27 cells, four use ${used(4)} of 64 and five ${used(5)} of 125. Heavily tied values also limit k: with three groups, frequency’s cut points are ${CU.cutPoints(F, 3).map(num).join(' and ')} and the groups hold ${F3.map(int).join(', ')} members; with four, ${F4.map(int).join(', ')}.` },
    { h: 'Combining the three' },
    { list: [
      `<b>125 cells</b> keep every detail but are too many to act on and spread customers thinly (${small} of Lantern’s used cells hold fewer than 10 members).`,
      `<b>A combined score</b>, R + F + M from 3 to 15, ranks everyone on one scale but hides the profile: A1694 (${X1.cell}) and A0774 (${X2.cell}) both total ${X1.total}, one recent but lighter, the other heavier but quieter.`,
      '<b>A weighted score</b>, such as 3R + 2F + M, encodes a judgement that recency matters more. There are no standard weights; choose them from evidence, such as how well each score predicted response to a past campaign, and test them again later.',
      `<b>FM</b> is the rounded mean of F and M (halves round up), which works because the two measure much the same thing: their rank correlation at Lantern is ${rhoFM.toFixed(2)}, and F and M differ by at most one for ${pc(near1)} of members. The R × FM grid has 25 cells, holding ${FMc.map(int).join(', ')} members in FM 1 to 5.`,
    ] },
    { p: `Lantern’s own data agree with the direct-marketing lore about recency. Score the members who had joined by 31 August as of 31 October, and see who visited in November or December: ${pc(backBy('R', 5))} of R5 members came back against ${pc(backBy('R', 1))} of R1, a much wider spread than across F scores (${pc(backBy('F', 5))} against ${pc(backBy('F', 1))}) or M scores (${pc(backBy('M', 5))} against ${pc(backBy('M', 1))}). By the combined score, ${pc(backTot(15))} of those scoring 15 came back and ${pc(backTot(3))} of those scoring 3. These are associations in one period; the lessons on RFM segments and predicting churn check scores against later behaviour properly.` },
    { h: 'Monetary value: total or average?' },
    { p: `This course scores M on total spend, so M largely repeats F. Fader, Hardie and Lee define monetary value as the average spend per transaction and treat it as separate from how often someone buys. At Lantern the average ticket barely relates to frequency (rank correlation ${rhoFA.toFixed(2)}): scoring it would add information that total spend doesn’t. Either is defensible; say which you used.` },
    { h: 'Scores depend on the base and the date' },
    { p: `Scored on 31 October 2027, when ${int(OCT.length)} members had joined, the cut points were ${COR.map(num).join(', ')} days for recency, ${COF.map(num).join(', ')} visits and ${COM.map((v) => money(v)).join(', ')}. By 31 December they were ${CR.map(num).join(', ')}; ${CF.map(num).join(', ')}; and ${CM.map((v) => money(v)).join(', ')}. Of the ${int(QUIET.length)} October members who didn’t visit in November or December, ${int(rDown)} had a lower R score on 31 December, and ${int(fMoved)} a different F score although their frequency hadn’t changed. Member A0082 went from ${A82o.cell} to ${A82d.cell}; member A0001, with two visits in March, from ${A01o.cell} to ${A01d.cell}, because the first frequency cut point rose from ${num(COF[0])} to ${num(CF[0])}.` },
    { p: 'For one decision on one date, relative scores are exactly what you want: they rank the base. To track customers over time, either fix the cut points from a reference date and reuse them (the engine’s “cuts” method), or track the underlying recency, frequency and spend.' },
    { h: 'In Excel' },
    { ol: [
      'Lay the sheet out as in Explore: recency in B, visits in C and spend in D (rows 2–2585), the percentiles 0.2, 0.4, 0.6, 0.8 in F2:F5, and the recency, visits and spend cut points in H, I and J.',
      'Cut points: <x>=PERCENTILE.INC($C$2:$C$2585,F2)</x> in I2, filled down to I5 (and the same with columns B and D in H and J).',
      'A score with nested IFs: <x>=IF(C2<=$I$2,1,IF(C2<=$I$3,2,IF(C2<=$I$4,3,IF(C2<=$I$5,4,5))))</x>. The same in one function: <x>=1+COUNTIF($I$2:$I$5,"<"&C2)</x>, which counts the cut points below the value.',
      'Recency reversed: <x>=5-COUNTIF($H$2:$H$5,"<"&B2)</x>, or nested IFs that give 5 to the smallest values.',
      'MATCH with lower bounds: put 0 in I1 and use <x>=MATCH(C2,$I$1:$I$5,1)</x>. It is compact, but a value equal to a cut point scores one higher than with the formulas above; for frequency that changes many scores.',
      'FM: <x>=ROUND((F2+G2)/2,0)</x>, which rounds 3.5 up to 4 as Excel’s ROUND rounds halves away from zero. A cell label: <x>=R2&F2&M2</x> joins the three scores as text.',
    ] },
  ],

  formulas: [
    { id: 'rfms-cut-points', name: 'Quintile cut points',
      tex: String.raw`c_j = Q\!\left(\tfrac{j}{k}\right), \quad j = 1, \dots, k - 1, \qquad Q(p) = x_{(\lfloor h \rfloor)} + (h - \lfloor h \rfloor)\left(x_{(\lfloor h \rfloor + 1)} - x_{(\lfloor h \rfloor)}\right), \quad h = (n - 1)p`,
      where: [
        [String.raw`c_j`, 'The j-th cut point', 'units of the value'],
        [String.raw`k`, 'The number of groups (5 for quintiles)', ''],
        [String.raw`j`, 'Which cut point: 1 to k − 1', ''],
        [String.raw`Q(p)`, 'The p-th quantile (PERCENTILE.INC)', 'units of the value'],
        [String.raw`p`, 'The percentile as a fraction, for example 0.2', ''],
        [String.raw`x_{(i)}`, 'The values sorted from smallest to largest, counting from x₍₀₎', 'units of the value'],
        [String.raw`h`, 'The position of the quantile in the sorted list', ''],
        [String.raw`n`, 'The number of customers', 'customers'],
      ],
      assumptions: 'Other quantile rules exist and give slightly different cut points on small bases; state the one you use.',
      note: 'Excel, with visits in C2:C2585: <x>=PERCENTILE.INC($C$2:$C$2585,0.2)</x> and so on for 0.4, 0.6 and 0.8.' },
    { id: 'rfms-score', name: 'A score from cut points',
      tex: String.raw`S(v) = 1 + \#\{\, j : v > c_j \,\}, \qquad R = k + 1 - S(\text{recency}), \quad F = S(\text{frequency}), \quad M = S(\text{monetary value})`,
      where: [
        [String.raw`S(v)`, 'The score of a value v: 1 plus the number of cut points it is above', ''],
        [String.raw`v`, 'A customer’s recency, frequency or monetary value', 'days, purchases or $'],
        [String.raw`c_j`, 'The cut points for that variable', 'as v'],
        [String.raw`k`, 'The number of groups', ''],
        [String.raw`j`, 'Which cut point: 1 to k − 1', ''],
        [String.raw`R,\ F,\ M`, 'The recency (reversed), frequency and monetary scores, 1 to k with k best', ''],
      ],
      assumptions: 'A value equal to a cut point stays in the lower group; ties share a score, so groups can be unequal.',
      note: 'Excel, with visits in C2 and their cut points in I2:I5: <x>=1+COUNTIF($I$2:$I$5,"<"&C2)</x>, or nested IFs with <=.' },
    { id: 'rfms-combine', name: 'Combining the scores',
      tex: String.raw`\text{FM} = \operatorname{round}\!\left(\tfrac{F + M}{2}\right), \qquad \text{Total} = R + F + M, \qquad \text{Weighted} = w_R R + w_F F + w_M M`,
      where: [
        [String.raw`\text{FM}`, 'The rounded mean of F and M (halves round up)', ''],
        [String.raw`\text{Total}`, 'The combined score, 3 to 15 with k = 5', ''],
        [String.raw`R,\ F,\ M`, 'The recency, frequency and monetary scores', ''],
        [String.raw`w_R,\ w_F,\ w_M`, 'Weights chosen by the analyst, ideally from evidence', ''],
        [String.raw`\text{Weighted}`, 'A weighted combined score', ''],
      ],
      assumptions: 'Adding scores treats a step of one as worth the same on every scale; FM assumes F and M measure much the same thing.',
      note: 'The 125 cells (R, F, M as a three-digit label) keep the most detail; the R × FM grid keeps recency separate in 25 cells.' },
  ],

  examples: [
    { level: 'simple', title: 'Scoring ten customers on frequency', fictional: true,
      setup: `Quaymouth Books, a fictional bookshop, has ten customers who ordered ${QB.join(', ')} times last year. Score them 1–5 on frequency with quintile cut points, then with equal-sized groups, and compare.`,
      steps: [
        `Cut points with PERCENTILE.INC: for the 20th percentile, h = (10 − 1) × 0.2 = 1.8, between the 2nd and 3rd smallest values (1 and 1), so c₁ = ${num(QC[0])}. For the 40th, h = 3.6, between 2 and 2: c₂ = ${num(QC[1])}. For the 60th, h = 5.4, between 3 and 4: c₃ = 3 + 0.4 × 1 = ${num(QC[2])}. For the 80th, h = 7.2, between 6 and 9: c₄ = 6 + 0.2 × 3 = ${num(QC[3])}.`,
        `Score each customer 1 + the number of cut points their value is above: 1 → ${QS[0]} (on c₁, not above it); 2 → ${QS[3]}; 3 → ${QS[5]}; 4 and 6 → ${QS[6]}; 9 and 15 → ${QS[8]}. Group sizes: ${QG.join(', ')}.`,
        `Equal-sized groups instead: sorted, the ten customers are dealt two to a score: ${QN.join(', ')}. The third one-order customer now scores 2, and the two customers with two orders split between 2 and 3.`,
      ],
      answer: `Quantile cut points ${QC.map(num).join(', ')} give scores ${QS.join(', ')} (groups of ${QG.join(', ')}); equal-sized groups give ${QN.join(', ')} (two each).`,
      interpretation: 'The cut-point scores treat identical customers identically but leave score 3 with one customer; the equal groups are tidy but give two customers who each ordered once different scores. With few distinct values, both methods are making distinctions the data barely support.' },
    { level: 'challenging', title: 'Three members, one base', fictional: true,
      setup: `Using the cut points for all ${int(N)} members on 31 December 2027 (the table in The idea), score members A1694 (recency ${X1.recency}, ${X1.frequency} visits, ${money(X1.monetary)}), A0774 (${X2.recency}, ${X2.frequency}, ${money(X2.monetary)}) and A0006 (${X3.recency}, ${X3.frequency}, ${money(X3.monetary)}). Give each one’s cell, FM, combined score and a weighted score 3R + 2F + M, and say what the combined score hides.`,
      steps: [
        `Recency (reversed): ${X1.recency} is above ${num(CR[0])} only, so R = 6 − 2 = ${X1.R}; ${X2.recency} is above ${num(CR[0])} and ${num(CR[1])}, R = 6 − 3 = ${X2.R}; ${X3.recency} is above ${num(CR[2])} but not ${num(CR[3])}, R = 6 − 4 = ${X3.R}.`,
        `Frequency (cut points ${CF.map(num).join(', ')}): 4 visits → F = ${X1.F}; 7 → F = ${X2.F}; 3 → F = ${X3.F}, because 3 is on the second cut point, not above it, so it stays in the lower group.`,
        `Monetary (cut points ${CM.map((v) => money(v)).join(', ')}): ${money(X1.monetary)} → M = ${X1.M}; ${money(X2.monetary)} → M = ${X2.M}; ${money(X3.monetary)}, just above ${money(CM[0])}, → M = ${X3.M}.`,
        `Cells ${X1.cell}, ${X2.cell} and ${X3.cell}. FM: (3 + 3) ÷ 2 = ${X1.FM}; (4 + 3) ÷ 2 = 3.5, rounded up to ${X2.FM}; (2 + 2) ÷ 2 = ${X3.FM}. Combined: ${X1.total}, ${X2.total}, ${X3.total}. Weighted 3R + 2F + M: ${W(X1)}, ${W(X2)}, ${W(X3)}.`,
      ],
      answer: `A1694 ${X1.cell} (FM ${X1.FM}, total ${X1.total}, weighted ${W(X1)}); A0774 ${X2.cell} (FM ${X2.FM}, total ${X2.total}, weighted ${W(X2)}); A0006 ${X3.cell} (FM ${X3.FM}, total ${X3.total}, weighted ${W(X3)}).`,
      interpretation: `The combined score ties A1694 and A0774 at ${X1.total}, though one is recent and lighter and the other heavier but ${X2.recency} days quiet: a café would treat them differently. The weighting breaks the tie towards recency, but only because the analyst chose 3, 2 and 1. A0006’s 3 visits show the boundary convention at work: with MATCH on lower bounds it would score F3.` },
    { level: 'applied', title: 'Choosing a scoring recipe for the monthly run', fictional: true,
      setup: `Ana will score every member on the last day of each month and send the managers the R × FM grid. She must choose the method, the boundary convention and k, and decide what the managers may compare from month to month. Use the October and December runs to decide.`,
      steps: [
        `Method: quantile cut points give ${FQ.map(int).join(', ')} members in F1 to F5; equal-sized groups give ${FN.map(int).join(', ')} but split the ${int(twos)} two-visit members by row order. Ana prefers cut points: members who behaved alike get the same score, and the uneven F groups are reported honestly.`,
        `Convention: values on a cut point stay in the lower group (PERCENTILE.INC with nested IFs), because MATCH on lower bounds would move ${int(diffF)} members’ F score and make F1 the one-visit members only. She writes the rule on the report.`,
        `k: five groups. With three, F would have ${F3.map(int).join(', ')} members and R would lump together members three weeks and almost four months quiet (${CR3[0] + 1}–${CR3[1]} days).`,
        `Comparisons: between 31 October and 31 December, ${int(rDown)} of the ${int(QUIET.length)} members who hadn’t visited since October dropped an R score (so far, as expected), and ${int(fMoved)} had their F score changed by the moving cut points alone. So month-to-month, managers compare the cut points and the grid’s shape, not individual members’ scores; for individuals, the report gives the underlying days, visits and spend.`,
      ],
      answer: 'Quantile cut points at the 20th, 40th, 60th and 80th percentiles, a value on a cut point in the lower group, recency reversed, k = 5, FM for the grid; the cut points are published with each run, and scores are compared only within a run.',
      interpretation: 'The recipe is a set of choices, each defensible and each changing who is “best”. Writing them down is what makes next month’s grid comparable with this one. Naming the grid’s cells and deciding what to do with each is the next lesson.' },
  ],

  demo: [
    { widget: 'rfms-rfm', intro: `All ${int(N)} members on 31 December 2027. Switch between quantile cut points and equal-sized groups and watch the F row of “Customers with each score” change while R and M barely move. Try 3 and 4 groups. Shade the R × FM grid by spend to see how much sits in the top-right corner.` },
    { widget: 'rfms-oct', intro: `The same members on 31 October 2027 (${int(OCT.length)} had joined by then). Compare the cut points with the December ones above: every one has moved, so the same behaviour can earn a different score.` },
    { widget: 'rfms-sheet', intro: 'Thirty members with their recency, visits and spend. Calculate the cut points in H to J with PERCENTILE.INC, then score each member in L to N with nested IFs or COUNTIF, reversing recency, and FM in O.' },
  ],

  mistakes: [
    { title: '“R5 means the member visited long ago.”', html: 'Recency is the one variable where small is good. Reverse it (R = 6 − S) or write the tests the other way; check that the members with the smallest recency score 5.' },
    { title: '“Quintiles always hold a fifth of the customers each.”', html: `Only without ties. With quantile cut points Lantern’s F1 holds ${pc(FQ[0] / N)} of members because ${int(ones)} visited once and ${int(twos)} twice. Equal groups are possible, but only by giving identical customers different scores.` },
    { title: '“A value on a cut point goes in the higher group.”', html: `That is MATCH’s convention on a table of lower bounds, not PERCENTILE.INC’s cut-point rule, and for frequency it moves ${int(diffF)} Lantern members. Choose one convention and state it.` },
    { title: '“Two customers with a combined score of 10 are equally valuable.”', html: `A1694 (${X1.cell}) and A0774 (${X2.cell}) both score 10: one recent and lighter, one heavier and quieter. Keep the cells, or at least R and FM, alongside any combined score.` },
    { title: '“Her score fell, so she is buying less.”', html: `Scores are relative to the base and the date. Member A0001 went from ${A01o.cell} to ${A01d.cell} between October and December without any change in the member’s visits: the cut points moved. Track the underlying values for individuals.` },
    { title: '“RFM shows why customers behave as they do.”', html: 'RFM describes past behaviour. It says nothing about why a member stopped coming, and a high score is not a cause of anything: it predicts, roughly, what comes next.' },
  ],

  application: [
    { case: 'Ana’s first scoring run goes to the café managers as one page: the cut points, the number of members with each score, and the R × FM grid shaded by members and by spend. The recipe is printed under the grid: quintile cut points (PERCENTILE.INC), a value on a cut point in the lower group, recency reversed, M on total spend since joining, FM = the rounded mean of F and M, as of the last day of the month.' },
    { p: `<b>The grid shows the base at a glance.</b> On 31 December, ${int(SQ.filter((c) => c.R === 5 && c.FM === 5).length)} members sit in the top-right cell (R5, FM5) and bring ${pc(sum(SQ.filter((c) => c.R === 5 && c.FM === 5).map((c) => c.monetary)) / D.spend)} of members’ spend; ${int(SQ.filter((c) => c.R === 1 && c.FM === 1).length)} sit in the bottom-left (R1, FM1), members who came once or twice long ago. The Millbrook manager asked why so many cells near the middle were thin: frequency’s ties push members into F1 and F2.` },
    { p: '<b>She resists over-reading individual scores.</b> A manager who saw his favourite regular drop from R5 to R4 over the Christmas fortnight was shown the underlying days: two weeks without a visit had moved her past the first recency cut point, nine days. The score was right about the base and too coarse for a judgement about one person.' },
    { p: '<b>Direct marketers used the same scores to decide whom to mail.</b> A mail-order company (fictional numbers) mails every cell in a test, records each cell’s response rate, and next time mails only cells whose rate beats the break-even rate: a mailing that costs $0.80 and earns $20 of margin per response breaks even at 0.80 ÷ 20 = 4%. Lantern has no mailing cost, but the logic of testing a score against a later outcome before acting on it carries over.' },
    { p: 'The next lesson names the grid’s cells (Champions, At risk, Hibernating and others), sizes them, and asks what Lantern should do with each, and with whom it should do nothing.' },
  ],

  summary: [
    'RFM scores each customer 1–5 on recency, frequency and monetary value against the rest of the base, 5 best; it comes from direct marketing, where recency was usually the strongest predictor.',
    'Quintile cut points are the 20th, 40th, 60th and 80th percentiles (PERCENTILE.INC); a value scores 1 plus the number of cut points it is above, and recency is reversed.',
    'Ties share a score under cut points, so heavily tied variables such as frequency give unequal groups; equal-sized groups (NTILE) split ties by row order instead.',
    'Whether a value on a cut point goes up or down is a convention that can move many scores; state it.',
    '125 cells are too many to act on; a combined or weighted score hides the profile; FM works because F and M largely agree, and the R × FM grid keeps recency separate.',
    'Scores are relative to the base, the window and the date: cut points move, so compare scores only within one run, and track underlying values for individuals.',
  ],

  glossary: [
    { term: 'RFM analysis', def: 'Scoring customers on the recency, frequency and monetary value of their past purchases, relative to the rest of the customer base, to rank and group them.' },
    { term: 'RFM score', def: 'A customer’s score on recency, frequency or monetary value, usually 1 to 5 with 5 best, from the customer’s position among all customers on a stated date.' },
    { term: 'Cut point', def: 'A value that divides a sorted variable into groups; for quintiles, the 20th, 40th, 60th and 80th percentiles.' },
    { term: 'Quintile', def: 'One of five groups formed by cutting sorted values at the 20th, 40th, 60th and 80th percentiles; with ties, the groups need not be equal.' },
    { term: 'RFM cell', def: 'The combination of a customer’s three RFM scores written as a label, such as 534: with five scores each there are 125 cells.' },
    { term: 'Combined RFM score', def: 'The sum of a customer’s R, F and M scores (3 to 15 with five groups), or a weighted sum.' },
    { term: 'FM score', def: 'The rounded mean of a customer’s frequency and monetary scores, used with the recency score to form a 5 × 5 grid.' },
  ],

  references: [
    { text: 'Fader, P. S., Hardie, B. G. S. &amp; Lee, K. L. (2005). RFM and CLV: Using iso-value curves for customer base analysis. <i>Journal of Marketing Research</i>, 42(4), 415–430. (Working paper version, February 2005, which cites Hughes, A. M. (2000), <i>Strategic Database Marketing</i>, 2nd ed., on why recency comes first.)', url: 'https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf', checked: '2026-11-01' },
    { text: 'Microsoft. PERCENTILE.INC function. Microsoft Support.', url: 'https://support.microsoft.com/office/680f9539-45eb-410b-9a5e-c1355e5fe2ed', checked: '2026-11-01' },
    { text: 'Microsoft. NTILE (Transact-SQL). Microsoft Learn (Remarks: “NTILE is nondeterministic”).', url: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/ntile-transact-sql', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics</i> (2nd ed.), section 2.2: Measures of the location of the data. OpenStax. (Its percentile formula locates the kth percentile at (n + 1)p, a different rule from PERCENTILE.INC’s (n − 1)p.)', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/2-2-measures-of-the-location-of-the-data', checked: '2026-11-01' },
  ],

  checks: [
    { what: 'Members', value: N, shown: 2584 },
    { what: 'Top 517 by spend', value: TOP5, shown: 517 },
    { what: 'Top spenders joined before September', value: topEarly, shown: 441 },
    { what: 'Top spenders joined before September %', value: topEarly / TOP5 * 100, shown: 85.3, tol: 0.05 },
    { what: 'All members joined before September %', value: allEarly / N * 100, shown: 64.4, tol: 0.05 },
    { what: 'December joiners % of members', value: decAll / N * 100, shown: 7.8, tol: 0.05 },
    { what: 'December joiners % of R5', value: decR5 / r5n * 100, shown: 22.4, tol: 0.05 },
    { what: 'R5 members', value: r5n, shown: 531 },
    { what: 'R5 is about a fifth (within 1 point)', value: Math.abs(r5n / N - 0.2) < 0.01 ? 1 : 0, shown: 1 },
    { what: 'k=3 recency cuts', value: Number(CR3.join() === '23,119'), shown: 1 },
    { what: 'k=3 R2 from 24 days', value: CR3[0] + 1, shown: 24 },
    { what: 'k=3 R2 to 119 days', value: CR3[1], shown: 119 },
    { what: 'Excel layout rows 2–2585', value: N + 1, shown: 2585 },
    { what: 'R cut points', value: CR.join() === [9, 36, 94.79999999999995, 171].join() ? 1 : CR.reduce((a, c, j) => a + Math.abs(c - [9, 36, 94.8, 171][j]), 0) < 1e-6 ? 1 : 0, shown: 1 },
    { what: 'R cut 1', value: CR[0], shown: 9 }, { what: 'R cut 2', value: CR[1], shown: 36 }, { what: 'R cut 3', value: CR[2], shown: 94.8, tol: 0.05 }, { what: 'R cut 4', value: CR[3], shown: 171 },
    { what: 'F cut 1', value: CF[0], shown: 2 }, { what: 'F cut 2', value: CF[1], shown: 3 }, { what: 'F cut 3', value: CF[2], shown: 6 }, { what: 'F cut 4', value: CF[3], shown: 11 },
    { what: 'M cut 1', value: CM[0], shown: 6.93 }, { what: 'M cut 2', value: CM[1], shown: 13.36 }, { what: 'M cut 3', value: CM[2], shown: 24.44 }, { what: 'M cut 4', value: CM[3], shown: 47.02 },
    { what: 'A1694 recency', value: X1.recency, shown: 15 }, { what: 'A1694 visits', value: X1.frequency, shown: 4 }, { what: 'A1694 spend', value: X1.monetary, shown: 18.15 },
    { what: 'A1694 R', value: X1.R, shown: 4 }, { what: 'A1694 F', value: X1.F, shown: 3 }, { what: 'A1694 M', value: X1.M, shown: 3 }, { what: 'A1694 cell 433', value: Number(X1.cell === '433'), shown: 1 },
    { what: 'A1694 unreversed recency score', value: 6 - X1.R, shown: 2 },
    { what: 'Members with one visit', value: ones, shown: 475 }, { what: 'Members with two visits', value: twos, shown: 382 },
    { what: 'F1 quantile', value: FQ[0], shown: 857 }, { what: 'F1 share %', value: FQ[0] / N * 100, shown: 33.2, tol: 0.05 }, { what: 'F2 quantile', value: FQ[1], shown: 267 },
    ...[521, 445, 494].map((v, j) => ({ what: `F${j + 3} quantile`, value: FQ[j + 2], shown: v })),
    ...[517, 517, 517, 517, 516].map((v, j) => ({ what: `F${j + 1} NTILE`, value: FN[j], shown: v })),
    { what: 'A fifth of members', value: Math.round(N / 5), shown: 517 },
    { what: 'R groups close to a fifth (within 15)', value: Number(RQ.every((v) => Math.abs(v - N / 5) <= 15) && MQ.every((v) => Math.abs(v - N / 5) <= 15)), shown: 1 },
    { what: 'Cells 5×5×5', value: 5 * 5 * 5, shown: 125 },
    { what: 'Cells used', value: cellsUsed, shown: 71 }, { what: 'Cells under 10', value: small, shown: 16 },
    { what: 'Cell 555', value: CELLS.get('555'), shown: 184 }, { what: 'Cell 111', value: CELLS.get('111'), shown: 162 },
    { what: 'F = M share %', value: sameFM * 100, shown: 66.1, tol: 0.05 },
    { what: 'Combined score range', value: 3 + 15, shown: 18 },
    { what: 'R × FM grid cells', value: 5 * 5, shown: 25 },
    // theory
    { what: 'NTILE twos into F1', value: twoF1.length, shown: 42 }, { what: 'NTILE twos into F2', value: twoF2.length, shown: 340 },
    { what: 'NTILE F1 twos joined first: last join 13 April', value: Number(lastJoinF1 === '2027-04-13'), shown: 1 },
    { what: 'NTILE F1 twos are the earliest joiners', value: Number(Math.max(...twoF1.map((x) => x.m.joined)) <= Math.min(...twoF2.map((x) => x.m.joined))), shown: 1 },
    { what: 'MATCH moves F', value: diffF, shown: 881 }, { what: 'MATCH moves R', value: diffR, shown: 60 }, { what: 'MATCH moves M', value: diffM, shown: 0 },
    { what: 'MATCH F1 = one-visit members', value: matchFc[0], shown: 475 },
    { what: 'MATCH-moved F are those on 2, 3, 6, 11', value: Number(diffF === F.filter((v) => [2, 3, 6, 11].includes(v)).length), shown: 1 },
    { what: 'Cells k=3', value: used(3), shown: 21 }, { what: 'Cells k=4', value: used(4), shown: 40 }, { what: 'Cells k=5', value: used(5), shown: 71 },
    { what: 'k=3 cells possible', value: 3 ** 3, shown: 27 }, { what: 'k=4 cells possible', value: 4 ** 3, shown: 64 },
    { what: 'k=3 F cuts', value: Number(CU.cutPoints(F, 3).join() === '3,7'), shown: 1 },
    ...[1124, 627, 833].map((v, j) => ({ what: `k=3 F${j + 1}`, value: F3[j], shown: v })),
    ...[857, 476, 612, 639].map((v, j) => ({ what: `k=4 F${j + 1}`, value: F4[j], shown: v })),
    { what: 'FHL use three groups (terciles)', value: 3, shown: 3 },
    { what: 'A0774 R', value: X2.R, shown: 3 }, { what: 'A0774 F', value: X2.F, shown: 4 }, { what: 'A0774 M', value: X2.M, shown: 3 }, { what: 'A0774 cell 343', value: Number(X2.cell === '343'), shown: 1 },
    { what: 'A1694 total', value: X1.total, shown: 10 }, { what: 'A0774 total', value: X2.total, shown: 10 },
    { what: 'Weights 3, 2, 1', value: 3 + 2 + 1, shown: 6 },
    { what: 'Spearman F, M', value: rhoFM, shown: 0.96 },
    { what: 'F and M within one %', value: near1 * 100, shown: 98.8, tol: 0.05 },
    ...[514, 491, 497, 496, 586].map((v, j) => ({ what: `FM${j + 1}`, value: FMc[j], shown: v })),
    { what: 'Back R5 %', value: backBy('R', 5) * 100, shown: 86.8, tol: 0.05 }, { what: 'Back R1 %', value: backBy('R', 1) * 100, shown: 3.3, tol: 0.05 },
    { what: 'Back F5 %', value: backBy('F', 5) * 100, shown: 58.6, tol: 0.05 }, { what: 'Back F1 %', value: backBy('F', 1) * 100, shown: 13.9, tol: 0.05 },
    { what: 'Back M5 %', value: backBy('M', 5) * 100, shown: 57.7, tol: 0.05 }, { what: 'Back M1 %', value: backBy('M', 1) * 100, shown: 11.6, tol: 0.05 },
    { what: 'Recency spread widest', value: Number(backBy('R', 5) - backBy('R', 1) > backBy('F', 5) - backBy('F', 1) && backBy('R', 5) - backBy('R', 1) > backBy('M', 5) - backBy('M', 1)), shown: 1 },
    { what: 'Back total 15 %', value: backTot(15) * 100, shown: 92.4, tol: 0.05 }, { what: 'Back total 3 %', value: backTot(3) * 100, shown: 6.5, tol: 0.05 },
    { what: 'Joined by 31 August, scored 31 October', value: CT.every((c) => c.joined <= CU.dayNum('2027-08-31')) ? 1 : 0, shown: 1 },
    { what: 'Spearman F, AOV', value: rhoFA, shown: -0.14 },
    { what: 'October members', value: OCT.length, shown: 2161 },
    ...[8, 25, 64, 125].map((v, j) => ({ what: `Oct R cut ${j + 1}`, value: COR[j], shown: v })),
    ...[1, 3, 5, 10].map((v, j) => ({ what: `Oct F cut ${j + 1}`, value: COF[j], shown: v })),
    ...[6.55, 12.6, 22.55, 42.45].map((v, j) => ({ what: `Oct M cut ${j + 1}`, value: COM[j], shown: v })),
    { what: 'Quiet October members', value: QUIET.length, shown: 1324 }, { what: 'Quiet with lower R', value: rDown, shown: 557 }, { what: 'Quiet with F moved', value: fMoved, shown: 327 },
    { what: 'A0082 Oct 555', value: Number(A82o.cell === '555'), shown: 1 }, { what: 'A0082 Dec 355', value: Number(A82d.cell === '355'), shown: 1 },
    { what: 'A0001 Oct 122', value: Number(A01o.cell === '122'), shown: 1 }, { what: 'A0001 Dec 112', value: Number(A01d.cell === '112'), shown: 1 },
    { what: 'A0001 two visits in March', value: Number(A01d.frequency === 2 && CU.monthOf(A01d.last) === CU.monthOf(CU.dayNum('2027-03-01'))), shown: 1 },
    { what: 'A0001 rows unchanged Oct–Dec', value: Number(A01o.frequency === A01d.frequency), shown: 1 },
    { what: 'Excel rows 2–2585', value: 2585 - 1, shown: N },
    { what: 'ROUND 3.5 → 4', value: Math.round(3.5), shown: 4 },
    // examples
    { what: 'Quaymouth cuts', value: Number(QC.map((v) => Math.round(v * 10) / 10).join() === '1,2,3.4,6.6'), shown: 1 },
    { what: 'Quaymouth h 20%', value: 9 * 0.2, shown: 1.8 }, { what: 'Quaymouth h 40%', value: 9 * 0.4, shown: 3.6 }, { what: 'Quaymouth h 60%', value: 9 * 0.6, shown: 5.4 }, { what: 'Quaymouth h 80%', value: 9 * 0.8, shown: 7.2 },
    { what: 'Quaymouth c3', value: 3 + 0.4 * 1, shown: 3.4 }, { what: 'Quaymouth c4', value: 6 + 0.2 * 3, shown: 6.6 },
    { what: 'Quaymouth scores', value: Number(QS.join() === '1,1,1,2,2,3,4,4,5,5'), shown: 1 },
    { what: 'Quaymouth groups', value: Number(QG.join() === '3,2,1,2,2'), shown: 1 },
    { what: 'Quaymouth NTILE', value: Number(QN.join() === '1,1,2,2,3,3,4,4,5,5'), shown: 1 },
    { what: 'A0774 recency', value: X2.recency, shown: 67 }, { what: 'A0774 visits', value: X2.frequency, shown: 7 }, { what: 'A0774 spend', value: X2.monetary, shown: 23.45 },
    { what: 'A0006 recency', value: X3.recency, shown: 99 }, { what: 'A0006 visits', value: X3.frequency, shown: 3 }, { what: 'A0006 spend', value: X3.monetary, shown: 7 },
    { what: 'A0006 cell 222', value: Number(X3.cell === '222'), shown: 1 },
    { what: 'A0774 FM', value: X2.FM, shown: 4 }, { what: 'A1694 FM', value: X1.FM, shown: 3 }, { what: 'A0006 FM', value: X3.FM, shown: 2 }, { what: 'A0006 total', value: X3.total, shown: 6 },
    { what: 'FM 3.5', value: (4 + 3) / 2, shown: 3.5 },
    { what: 'Weighted A1694', value: W(X1), shown: 21 }, { what: 'Weighted A0774', value: W(X2), shown: 20 }, { what: 'Weighted A0006', value: W(X3), shown: 12 },
    { what: 'A0006 with MATCH would be F3', value: up(3, CF), shown: 3 },
    // application
    { what: 'R5 FM5', value: SQ.filter((c) => c.R === 5 && c.FM === 5).length, shown: 227 },
    { what: 'R5 FM5 spend share %', value: sum(SQ.filter((c) => c.R === 5 && c.FM === 5).map((c) => c.monetary)) / D.spend * 100, shown: 27.6, tol: 0.05 },
    { what: 'R1 FM1', value: SQ.filter((c) => c.R === 1 && c.FM === 1).length, shown: 162 },
    { what: 'First recency cut point: nine days', value: CR[0], shown: 9 },
    { what: 'Break-even', value: 0.8 / 20 * 100, shown: 4 },
  ],
};
