// rfm-segments.js — M06 · RFM segments. Content only; exercises are in rfm-segments.ex.js.
// Lantern's 2,584 loyalty-app members scored as of 31 December 2027 (case.js members(), core/customer.js rfm with quantile
// cut points, k = 5), named with the engine's R × FM grid (segmentOf: one practitioner naming, not a standard), and the
// check against later behaviour: the 1,664 members who joined by 31 August, scored as of 31 October (churnTable) and
// whether each came back in November–December. The cafés' cost of goods (31% of sales) is F03's. Tallowby Books and the
// pastry offer's cost are fictional. Every printed figure is in `checks`; every claim about the data's shape has a check
// that would fail if it were false.
import { members, churnTable, VISIT_LIST, HOLDOUT, AS_OF } from './case.js?v=30';
import * as CU from '../../../core/customer.js?v=30';
import { propTest2 } from '../../../core/inference.js?v=30';
import { FACTS as F03 } from '../f03/case.js?v=30';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const pc = (v, d = 1) => `${(Math.round(v * 10 ** (d + 2) * (1 + 1e-12)) / 10 ** d).toFixed(d)}%`;
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const int = (v) => v.toLocaleString('en-US');
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);

// ---------------------------------------------------------------- scored as of 31 December 2027
const MS = members();
const N = MS.length;
const SC = CU.rfm(MS, { k: 5, method: 'quantile' });
const SPEND = sum(SC.map((c) => c.monetary));
const SEG = CU.groupBy(SC, 'segment');
const S = Object.fromEntries(SEG.map((g) => [g.key, g]));
const NAMES = CU.SEGMENTS.map((s) => s.name);
const CUT = { R: CU.cutPoints(MS.map((c) => c.recency)), F: CU.cutPoints(MS.map((c) => c.frequency)), M: CU.cutPoints(MS.map((c) => c.monetary)) };
const grid = (r, fm) => SC.filter((c) => c.R === r && c.FM === fm);
const of = (name) => SC.filter((c) => c.segment === name);
const top3 = ['Champions', 'Loyal', 'Can’t lose them'];
const top3n = sum(top3.map((k) => S[k].n)), top3spend = sum(top3.map((k) => S[k].spendShare));
// recency bands behind each R score (the quantile rule: a value above a cut point moves down an R score)
const rBand = (r) => { const g = SC.filter((c) => c.R === r).map((c) => c.recency); return [Math.min(...g), Math.max(...g)]; };
const fBand = (f) => { const g = SC.filter((c) => c.F === f).map((c) => c.frequency); return [Math.min(...g), Math.max(...g)]; };
// who is in the segments: tenure and café
const newDec = of('New customers').filter((c) => c.joinedIso >= '2027-12-01').length;
const lostLateJoin = of('Lost').filter((c) => c.joinedIso >= '2027-08-01').length;
const hShare = (g) => g.filter((c) => c.cafe === 'Harbourside').length / g.length;
const hAll = hShare(SC), hM5 = hShare(SC.filter((c) => c.M === 5)), hM1 = hShare(SC.filter((c) => c.M === 1));
const notif = (g) => g.filter((c) => c.notifications).length / g.length;
const tick = (cs) => sum(cs.map((c) => c.monetary)) / sum(cs.map((c) => c.frequency));
const tickH = tick(SC.filter((c) => c.cafe === 'Harbourside')), tickM = tick(SC.filter((c) => c.cafe === 'Millbrook'));

// ---------------------------------------------------------------- the check: scored on 31 October, back in November–December?
const CT = churnTable();
const OC = CU.rfm(CT, { k: 5, method: 'quantile' });
const NO = OC.length, BACK = sum(OC.map((c) => c.back)), BASE = BACK / NO;
const ndSpend = new Map();
for (const v of VISIT_LIST) if (v.day >= HOLDOUT[0] && v.day <= HOLDOUT[1]) ndSpend.set(v.id, (ndSpend.get(v.id) || 0) + v.amount);
const OSEG = CU.groupBy(OC, 'segment').map((g) => {
  const m = OC.filter((c) => c.segment === g.key), b = sum(m.map((c) => c.back));
  return { ...g, back: b, rate: b / g.n, lift: b / g.n / BASE, nd: sum(m.map((c) => ndSpend.get(c.id) || 0)) };
});
const O = Object.fromEntries(OSEG.map((g) => [g.key, g]));
const ND_ALL = sum(OC.map((c) => ndSpend.get(c.id) || 0));
const rRate = (r) => { const g = OC.filter((c) => c.R === r); return sum(g.map((c) => c.back)) / g.length; };
const r3fm = (fm) => { const g = OC.filter((c) => c.R === 3 && c.FM === fm); return { n: g.length, rate: sum(g.map((c) => c.back)) / g.length }; };
const R3 = [1, 2, 3, 4, 5].map(r3fm);
// the same silence, different frequency: recency 61–90 days on 31 October
const band = OC.filter((c) => c.recency >= 61 && c.recency <= 90);
const light = band.filter((c) => c.frequency <= 2), heavy = band.filter((c) => c.frequency >= 7);
const rateOf = (g) => sum(g.map((c) => c.back)) / g.length;
const LvP = propTest2(O.Loyal.back, O.Loyal.n, O['Potential loyalists'].back, O['Potential loyalists'].n);
const AvH = propTest2(O['At risk'].back, O['At risk'].n, O.Hibernating.back, O.Hibernating.n);
// scores move with the date: the same 1,664 members rescored on 31 December
const DEC = new Map(CU.rfm(members({ joinedBy: CU.dayNum('2027-08-31') }), { k: 5 }).map((c) => [c.id, c]));
const stayedAway = OC.filter((c) => !c.back);
const movedAnyway = stayedAway.filter((c) => DEC.get(c.id).segment !== c.segment).length;
const champToLoyal = stayedAway.filter((c) => c.segment === 'Champions' && DEC.get(c.id).segment === 'Loyal').length;
const sameSeg = OC.filter((c) => DEC.get(c.id).segment === c.segment).length;

// ---------------------------------------------------------------- the applied example: a pastry offer (fictional cost)
const MARGIN = 1 - F03.cafes.cogsShare;                       // F03: the cafés' cost of goods is 31% of sales
const returners = OC.filter((c) => c.back);
const ND_PER_RETURNER = sum(returners.map((c) => ndSpend.get(c.id))) / returners.length;
const segSpend = (k) => { const r = OC.filter((c) => c.segment === k && c.back); return sum(r.map((c) => ndSpend.get(c.id))) / r.length; };
const VALUE_OF = (k) => segSpend(k) * MARGIN;                 // margin from a returning member of that segment
const COST = 1.1;                                             // fictional: cost to Lantern of a redeemed pastry
const NET_OF = (k) => VALUE_OF(k) - COST;
const subsidy = (k) => O[k].back * COST;
const needed = (k) => subsidy(k) / NET_OF(k);
const ch = 'Champions', ar = 'At risk';

// ---------------------------------------------------------------- the simple example (fictional bookshop)
const TB = [
  ['C01', 5, 5, 4], ['C02', 5, 2, 1], ['C03', 4, 3, 2], ['C04', 3, 5, 5], ['C05', 2, 4, 5],
  ['C06', 1, 3, 2], ['C07', 2, 1, 2], ['C08', 4, 4, 3],
];
const TBS = TB.map(([id, r, f, m]) => { const fm = Math.floor((f + m) / 2 + 0.5); return { id, r, f, m, fm, seg: CU.segmentOf(r, fm) }; });
const TB_SPEND = [412.5, 18.0, 64.0, 380.0, 295.5, 41.0, 22.5, 150.0];
const tbTot = sum(TB_SPEND);
const tbSeg = (name) => sum(TBS.map((c, i) => (c.seg === name ? TB_SPEND[i] : 0)));

// ---------------------------------------------------------------- tables
const GRID_ROWS = [5, 4, 3, 2, 1].map((r) => [`R = ${r}`, ...[1, 2, 3, 4, 5].map((fm) => CU.segmentOf(r, fm))]);
const SEG_ROWS = SEG.map((g) => [g.key, int(g.n), pc(g.share), pc(g.spendShare), f1(g.meanRecency), f2(g.meanFrequency), money(g.meanSpend)]);
const VAL_ROWS = OSEG.slice().sort((a, b) => b.rate - a.rate).map((g) => [g.key, int(g.n), int(g.back), pc(g.rate), f2(g.lift), money(g.nd / g.n)]);
const ACT_NAMES = ['Champions', 'Loyal', 'Potential loyalists', 'New customers', 'At risk', 'Can’t lose them', 'Hibernating', 'Lost'];

export default {
  slug: 'rfm-segments',
  title: 'RFM segments',
  blurb: 'Turn R, F and M scores into named segments on the R × FM grid, size each one in members and in spend, choose what to do with each (and whom to leave alone), and check the segments against what members did next: Lantern’s “Loyal” members turned out to be among the least likely to come back.',
  status: 'reviewed',
  objectives: [
    'Classify scored customers into segments on the R × FM grid, naming them with a stated convention.',
    'Calculate each segment’s size, share of members, share of spend, mean recency and mean frequency, in Excel with COUNTIFS, SUMIFS and AVERAGEIFS.',
    'Choose an action for each segment, including whom not to target, and judge whether an offer can pay for itself once members who would have come anyway are counted.',
    'Evaluate segments against later behaviour with return rates, lift and a two-proportion test, and explain why a frequent customer gone quiet is a poorer prospect than an infrequent one.',
    'Explain the limits of RFM segments: backward-looking, silent on why, moving with the date, associations not causes, and open to regression to the mean.',
    'Compare RFM segmentation with the needs-based segmentation of M05.',
  ],
  prerequisites: [
    { lesson: 'm06/rfm-scoring', why: 'This lesson starts from scored customers: R, F and M from 1 to 5 by quantile cut points, and FM, the rounded mean of F and M.' },
    { lesson: 'm05/profiling-segments', why: 'Sizing segments in people and in spend, share of spend against share of people, and naming segments honestly.' },
    { lesson: 'm05/psychographic-and-behavioural', why: 'Behavioural segmentation and needs-based segmentation, which RFM is compared with here.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The two-proportion z test used to compare segments’ return rates.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is January 2028. Ana has every loyalty-app member who joined Lantern’s cafés in 2027, ${int(N)} of them, scored as of 31 December on recency, frequency and monetary value, each from 1 to 5. The scores say how each member compares with the others. They don’t yet say what to do. A score of 3-5-5 is a member who once came often and spent well but hasn’t been in for a while; 5-1-1 is someone who joined last week. Ana wants a handful of groups her café managers can act on, and a way to tell whether the groups mean anything.` },
    { p: 'An <g>RFM segment</g> is a group of customers with similar R, F and M scores, given a name and an action. Five scores on each of three measures give 125 possible cells, far too many to act on, so practitioners collapse them. The most common collapse keeps recency on its own and combines frequency and monetary value, because F and M usually move together: a member who visits often also spends more in total.' },

    { h: 'The R × FM grid' },
    { p: String.raw`FM is the mean of the F and M scores, rounded to a whole number (halves round up): a member with F = 4 and M = 5 has <m>\text{FM} = (4 + 5) \div 2 = 4.5</m>, which rounds to 5. Plotting R (rows) against FM (columns) gives the <g>R × FM grid</g>, 25 cells. Each cell, or block of cells, then gets a name. The naming below is one widely used <em>practitioner convention</em>, not a standard: marketing software vendors name and draw the blocks differently (Braze’s documentation, for example, scores 0–3 and defines ten groups by its own rules), so always say which scheme you used.` },
    { table: {
      caption: 'One common naming of the R × FM grid (rows: R, 5 = most recent; columns: FM, 5 = most frequent and highest spend). The rules are core/customer.js’s segmentOf.',
      head: ['', 'FM = 1', 'FM = 2', 'FM = 3', 'FM = 4', 'FM = 5'],
      align: ['l', 'l', 'l', 'l', 'l', 'l'],
      rows: GRID_ROWS,
    } },
    { p: `Read the grid by its corners. Top right, recent and valuable: <b>Champions</b>. Bottom right, valuable but long gone: <b>Can’t lose them</b>, and next to it <b>At risk</b>. Top left, recent but with little history: <b>New customers</b>. Bottom left, neither recent nor valuable: <b>Lost</b> and <b>Hibernating</b>. The middle row, R = 3, holds members drifting away: <b>Loyal</b> if they were valuable, <b>Need attention</b> in the middle, <b>About to sleep</b> if not.` },

    { h: 'Lantern’s members on the grid' },
    { p: `With quantile cut points on Lantern’s ${int(N)} members as of 31 December 2027, R = 5 means a last visit within ${CUT.R[0]} days (the most recent fifth), and R = 1 means more than ${CUT.R[3]} days ago. Frequency is heavily tied, as <i>RFM scoring</i> showed: F = 1 covers every member with ${fBand(1)[0]} or ${fBand(1)[1]} visits, ${int(SC.filter((c) => c.F === 1).length)} members, while F = 5 starts at ${fBand(5)[0]} visits. The table gives each segment’s size and what its members did, largest share of spend first.` },
    { table: {
      caption: `Lantern’s loyalty-app members by RFM segment, as of 31 December 2027 (${int(N)} members, ${money(SPEND)} of spend since 1 March; quantile cut points, k = 5)`,
      head: ['Segment', 'Members', 'Share of members', 'Share of spend', 'Mean recency (days)', 'Mean visits', 'Mean spend'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: SEG_ROWS,
    } },
    { p: `Spend is concentrated. Champions are ${pc(S.Champions.share)} of members and hold ${pc(S.Champions.spendShare)} of the spend; with Loyal and Can’t lose them, ${int(top3n)} members (${pc(top3n / N)}) account for ${pc(top3spend)}. At the other end, ${int(S.Lost.n)} Lost members, ${pc(S.Lost.share)} of the base, made ${f2(S.Lost.meanFrequency)} visits on average and hold ${pc(S.Lost.spendShare)} of spend. Can’t lose them and At risk hold the same share of spend (${pc(S['Can’t lose them'].spendShare)} each), but the ${int(S['Can’t lose them'].n)} members of Can’t lose them averaged ${f1(S['Can’t lose them'].meanFrequency)} visits and the ${int(S['At risk'].n)} At risk members ${f1(S['At risk'].meanFrequency)}.` },
    { callout: 'key', title: 'A segment is a description, not a diagnosis', html: 'A name like “At risk” describes a pattern of scores on one date. It says nothing about why the members behave as they do, nothing about what an offer would change, and it may not even predict what they do next. All three need other evidence; the last can be checked, as this lesson does below.' },

    { h: 'From segments to actions' },
    { p: 'Each segment suggests a different kind of contact, and some suggest none. The list follows the engine’s naming; the actions are common practice, not evidence that they work.' },
    { list: ACT_NAMES.map((k) => `<b>${k}</b>: ${CU.SEGMENTS.find((s) => s.name === k).act}`) },
    { p: `Two principles keep this honest. First, a discount should go where it changes behaviour, not where it rewards behaviour that was happening anyway: Champions visit without being asked, so a voucher to them mostly subsidises visits Lantern would have had. Second, every contact has a cost, in money and in attention: a member who has stopped coming and is pestered weekly is not won back, and an app’s notifications can be switched off. Deciding <em>whom not to target</em> is as much a part of the plan as deciding whom to target.` },
  ],

  theory: [
    { h: 'Who is in each segment' },
    { p: `Segments are partly made by tenure. Recency and frequency both depend on how long a member has had to visit, so the segments sort members by when they joined as much as by how they behave. Of the ${int(S['New customers'].n)} New customers, ${int(newDec)} joined in December; none of the ${int(S.Lost.n)} Lost members joined after July (the latest joined on ${(() => { const d = of('Lost').map((c) => c.joinedIso).sort().pop(); return `${+d.slice(8)} ${['January','February','March','April','May','June','July','August','September','October','November','December'][+d.slice(5, 7) - 1]}`; })()}). Comparing a March joiner’s frequency with a December joiner’s is comparing ten months with a few weeks. <i>Cohort analysis</i>, the next lesson, separates tenure from behaviour by comparing members who joined at the same time.` },
    { p: `Scores are also relative to this customer base. Harbourside’s tickets are bigger (${money(tickH)} a visit for members who joined there, against ${money(tickM)} at Millbrook), so the monetary score partly measures which café a member uses: Harbourside members are ${pc(hAll, 0)} of all members but ${pc(hM5, 0)} of those with M = 5 and ${pc(hM1, 0)} of those with M = 1. If the cafés are to be managed separately, score each café’s members against each other.` },

    { h: 'Checking segments against later behaviour' },
    { p: `A segmentation that says something true about members should predict what they do next. Lantern can test that with data it already has: score the ${int(NO)} members who had joined by 31 August as of 31 October 2027, using only what was known then, and see who came back in November and December. Nobody was sent anything, so these are the return rates with no campaign at all. Overall ${int(BACK)} came back, a <g>base rate</g> of ${pc(BASE)}; a segment’s <g>lift</g> is its return rate divided by the base rate.` },
    { table: {
      caption: `Members who joined by 31 August 2027, scored on 31 October (quantile cut points on these ${int(NO)} members), and whether they visited in November–December`,
      head: ['Segment on 31 October', 'Members', 'Came back', 'Return rate', 'Lift', 'Nov–Dec spend per member'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: VAL_ROWS,
      foot: [['All', int(NO), int(BACK), pc(BASE), '1.00', money(ND_ALL / NO)]],
    } },
    { p: `Champions passed the test: ${pc(O.Champions.rate)} came back (lift ${f2(O.Champions.lift)}), and their Nov–Dec spend was ${pc(O.Champions.nd / ND_ALL)} of these members’ total. Recency alone did most of the work. Return rates by R score alone ran ${[5, 4, 3, 2, 1].map((r) => pc(rRate(r))).join(', ')} from R = 5 down to R = 1. But two names failed badly. Only ${O.Loyal.back} of the ${O.Loyal.n} “Loyal” members came back (${pc(O.Loyal.rate)}), against ${pc(O['Potential loyalists'].rate)} of Potential loyalists. And none of the ${O['Can’t lose them'].n} members of “Can’t lose them” returned, while At risk (${pc(O['At risk'].rate)}) did worse than Hibernating (${pc(O.Hibernating.rate)}), the segment the naming treats as less valuable.` },
    { p: `The gaps are not chance. A two-proportion z test (B04) of Loyal against Potential loyalists gives z = ${f1(LvP.z)}, p below 0.001; At risk against Hibernating gives z = ${f2(AvH.z)}, p = ${AvH.pValue.toFixed(3)}. The tests treat these members as a sample of the kind of members Lantern will have, which is the question Ana cares about.` },

    { h: 'Why the frequent and quiet are poor prospects' },
    { p: `Lantern’s members, like most customers of a café or a shop, are in a <g>noncontractual setting</g>: nobody announces they have stopped coming, so being gone has to be inferred from silence. Silence means more for a member who used to come often. If a member who visited twice a week hasn’t been seen for two months, that silence is very unlikely if they were still coming; for a member who came once a month, two quiet months are unremarkable. So at the same recency, higher frequency is a <em>worse</em> sign. Fader, Hardie and Lee (2005) showed this pattern in their model of an online music retailer’s (CDNOW’s) customers, in the iso-value curves fitted to its recency and frequency, and called it the increasing frequency paradox.` },
    { p: `Lantern’s data show it plainly. Among members whose last visit was 61–90 days before 31 October, ${pc(rateOf(light), 0)} of those with one or two visits came back, against ${pc(rateOf(heavy), 0)} of those with seven or more. Within R = 3, return rates fell as FM rose: ${R3.map((x) => pc(x.rate)).join(', ')} for FM = 1 to 5. That is exactly where the grid puts “Loyal”: R = 3, FM of 4 or 5. The grid assumes value and recency add up; in this setting they interact, and the names inherited the error.` },
    { callout: 'warn', title: 'Names are hypotheses', html: `“Loyal” and “Can’t lose them” are labels from a convention written for typical businesses. On Lantern’s data, scored on 31 October, the Loyal segment came back at ${pc(O.Loyal.rate)} and Can’t lose them at 0%. Check every naming against later behaviour before acting on it, and rename segments that fail.` },

    { h: 'Scores move with the date' },
    { p: `A segment is a snapshot. Every day a member doesn’t visit, their recency grows by one; every day other members visit, the cut points move. Rescoring the same ${int(NO)} members on 31 December put ${pc(sameSeg / NO, 0)} in the same segment as on 31 October. Even among the ${int(stayedAway.length)} who never came back, ${int(movedAnyway)} changed segment, ${champToLoyal} of them from Champions to Loyal. A campaign list should be drawn on the day it is sent, and a report should give its as-of date.` },

    { h: 'Limits of RFM segments' },
    { list: [
      '<b>Backward-looking.</b> RFM summarises the past. It forecasts only as far as the past repeats; Fader, Hardie and Lee show that using R, F and M as inputs to a probability model of buying gives a forward-looking forecast that simple scores miss.',
      '<b>No reason why.</b> Scores say who is quiet, not whether they moved house, switched to a rival, or only come in summer. Contact, a survey or a needs study answers why.',
      '<b>Relative and dated.</b> Cut points depend on the customer base and the as-of date. A “5” in December 2027 is not the same customer as a “5” in December 2028.',
      '<b>Associations, not causes.</b> Champions have notifications on more often than Lost members (' + pc(notif(of('Champions')), 0) + ' against ' + pc(notif(of('Lost')), 0) + '), but members chose notifications themselves; switching them on for a Lost member need not make a Champion. Only a randomised test shows what an action changes.',
      '<b>Regression to the mean.</b> Low scores are partly bad luck in timing, and some low scorers come back on their own (below).',
    ] },

    { h: 'Regression to the mean in win-back campaigns' },
    { p: `A member whose last visit happened to fall just before a quiet spell scores low on recency; some of them were never gone. Pick members because their scores are low, and some will look better next time without anything being done: <g>regression to the mean</g>. Barnett, van der Pols and Dobson (2005) note it is more noticeable when follow-up is limited to a group selected on its first measurement, which is exactly what a win-back list is. In Lantern’s data ${O.Lost.back} of the ${O.Lost.n} Lost members (${pc(O.Lost.rate)}) and ${O.Hibernating.back} of the ${O.Hibernating.n} Hibernating (${pc(O.Hibernating.rate)}) came back in November–December with no campaign. Had Ana mailed them a voucher, she might have credited it with those returns. The remedy is a <g>holdout group</g>: send the offer to a random part of the segment and compare its return rate with the rest. <i>Loyalty and retention strategy</i> shows how to analyse such a test.` },

    { h: 'RFM and needs-based segments' },
    { p: `M05 segmented by needs: a survey asked what people want from coffee, and clustering found groups with similar answers. RFM is <g>behavioural segmentation</g> on a business’s own records: what each customer has done with Lantern. The two answer different questions. <g>Needs-based segmentation</g> explains why people buy, covers people who aren’t yet customers, and guides products and positioning; it depends on a survey and a typing tool to place individuals. RFM covers every customer automatically, updates daily and is cheap, but it says nothing about non-customers or about why. Used together, RFM decides whom to contact this month and the needs segments decide what to say; if some members answered the needs study, cross-tabulating their two segments shows which needs Lantern’s Champions share.` },
  ],

  formulas: [
    { id: 'rfmseg-fm', name: 'Combined frequency–monetary score',
      tex: String.raw`\text{FM} = \left\lfloor \dfrac{F + M}{2} + 0.5 \right\rfloor`,
      where: [
        [String.raw`F`, 'Frequency score, 1–5 (5 = most visits in the window)', ''],
        [String.raw`M`, 'Monetary score, 1–5 (5 = highest spend in the window)', ''],
        [String.raw`\text{FM}`, 'Their mean, rounded to a whole number with halves rounded up', ''],
      ],
      assumptions: 'F and M are scored on the same scale (1–5) and are given equal weight.',
      note: 'Excel: <x>=ROUND((C2+D2)/2,0)</x>. Excel’s ROUND rounds halves away from zero, which for positive scores is the same as rounding up.' },
    { id: 'rfmseg-share', name: 'A segment’s share of members and of spend',
      tex: String.raw`\begin{gathered} \text{share}_g = \dfrac{n_g}{n} \\[4pt] \text{spend share}_g = \dfrac{S_g}{S} \\[4pt] \text{concentration}_g = \dfrac{S_g / S}{n_g / n} \end{gathered}`,
      where: [
        [String.raw`n_g`, 'Customers in segment g', 'customers'],
        [String.raw`n`, 'All customers scored', 'customers'],
        [String.raw`S_g`, 'Total spend of segment g in the window', '$'],
        [String.raw`S`, 'Total spend of all customers in the window', '$'],
      ],
      note: 'Concentration above 1 means the segment spends more per head than average (it equals the segment’s mean spend ÷ the overall mean). Excel: <x>=COUNTIFS(G2:G34,J2)/COUNTA(G2:G34)</x> and <x>=SUMIFS(F2:F34,G2:G34,J2)/SUM(F2:F34)</x>.' },
    { id: 'rfmseg-lift', name: 'Return rate and lift of a segment',
      tex: String.raw`p_g = \dfrac{b_g}{n_g}, \qquad \text{lift}_g = \dfrac{p_g}{p}, \qquad p = \dfrac{\sum_g b_g}{n}`,
      where: [
        [String.raw`b_g`, 'Customers in segment g who bought again in the follow-up window', 'customers'],
        [String.raw`n_g`, 'Customers in segment g when scored', 'customers'],
        [String.raw`p_g`, 'Segment g’s return rate', ''],
        [String.raw`p`, 'The base rate: the return rate of everyone scored', ''],
      ],
      assumptions: 'Scores use only data from before the follow-up window.',
      note: 'Lift 2 means twice the base rate. With no campaign, p_g is the segment’s natural return rate, the baseline any offer must beat.' },
    { id: 'rfmseg-offer', name: 'Does an offer to a segment pay?',
      tex: String.raw`\text{Net value} = n_g\,u\,(v - c) - n_g\,p_g\,c`,
      where: [
        [String.raw`n_g`, 'Members in the segment sent the offer', 'members'],
        [String.raw`p_g`, 'Share who would come back anyway (the segment’s return rate without the offer)', ''],
        [String.raw`u`, 'Extra share brought back by the offer (the uplift), measured against a holdout group', ''],
        [String.raw`v`, 'Margin from a member who comes back, over the follow-up window', '$'],
        [String.raw`c`, 'Cost of the offer per member who redeems it', '$'],
      ],
      assumptions: 'Everyone who comes back redeems the offer; contacting a member costs nothing until they redeem.',
      note: 'The second term is the subsidy: the offer paid to members who would have come anyway. Break-even uplift: u = p_g c ÷ (v − c).' },
  ],

  examples: [
    { level: 'simple', title: 'Naming a bookshop’s customers', fictional: true,
      setup: 'Tallowby Books, an online bookshop, has scored eight customers 1–5 on recency, frequency and monetary value with quantile cut points, as of 30 June. Combine F and M, place each customer on the R × FM grid with the naming in this lesson, and find the Champions’ share of the eight customers’ spend.',
      table: {
        caption: 'Tallowby Books: eight customers’ scores and spend in the year to 30 June (fictional)',
        head: ['Customer', 'R', 'F', 'M', 'Spend'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: TB.map(([id, r, f, m], i) => [id, String(r), String(f), String(m), money(TB_SPEND[i])]),
      },
      steps: [
        `FM is the mean of F and M, halves rounded up: C01 (5 + 4) ÷ 2 = 4.5 → 5; C02 (2 + 1) ÷ 2 = 1.5 → 2; C03 2.5 → 3; C04 5; C05 4.5 → 5; C06 2.5 → 3; C07 1.5 → 2; C08 3.5 → 4.`,
        `Look up each (R, FM) cell: ${TBS.map((c) => `${c.id} (${c.r}, ${c.fm}) ${c.seg}`).join('; ')}.`,
        `Champions are C01 and C08: ${money(TB_SPEND[0])} + ${money(TB_SPEND[7])} = ${money(tbSeg('Champions'))} of ${money(tbTot)} in all.`,
        `Share of spend = ${money(tbSeg('Champions'))} ÷ ${money(tbTot)} = ${pc(tbSeg('Champions') / tbTot)}, from 2 of 8 customers (25%).`,
      ],
      answer: `C01 and C08 are Champions (${pc(tbSeg('Champions') / tbTot)} of spend); C02 New customers; C03 Potential loyalists; C04 Loyal; C05 Can’t lose them; C06 At risk; C07 Hibernating.`,
      interpretation: 'C04 and C05 spent nearly as much as C01 but are drifting (C04) or gone quiet (C05). Whether a win-back offer would bring them back is a question the scores can’t answer; the next step is to check how customers like them behaved in past quarters.' },
    { level: 'challenging', title: 'Did “Loyal” mean loyal?', fictional: false,
      setup: `Ana scored the ${int(NO)} members who had joined by 31 August as of 31 October 2027. ${O.Loyal.n} were “Loyal” (R = 3, FM 4–5) and ${O['Potential loyalists'].n} were “Potential loyalists” (R 4–5, FM = 3). In November–December ${O.Loyal.back} and ${O['Potential loyalists'].back} of them came back, out of ${int(BACK)} returners overall. Compare the two segments, test the difference, and explain it.`,
      steps: [
        `Return rates: Loyal ${O.Loyal.back} ÷ ${O.Loyal.n} = ${pc(O.Loyal.rate)}; Potential loyalists ${O['Potential loyalists'].back} ÷ ${O['Potential loyalists'].n} = ${pc(O['Potential loyalists'].rate)}. Base rate ${int(BACK)} ÷ ${int(NO)} = ${pc(BASE)}.`,
        `Lift = rate ÷ base rate: Loyal ${pc(O.Loyal.rate)} ÷ ${pc(BASE)} = ${f2(O.Loyal.lift)}; Potential loyalists ${f2(O['Potential loyalists'].lift)}. The segment named for loyalty came back at less than a quarter of the base rate.`,
        `Two-proportion z test: pooled p = (${O.Loyal.back} + ${O['Potential loyalists'].back}) ÷ (${O.Loyal.n} + ${O['Potential loyalists'].n}) = ${LvP.pool.toFixed(3)}; SE = √(${LvP.pool.toFixed(3)} × ${(1 - LvP.pool).toFixed(3)} × (1/${O.Loyal.n} + 1/${O['Potential loyalists'].n})) = ${LvP.sePool.toFixed(4)}; z = (${LvP.p1.toFixed(3)} − ${LvP.p2.toFixed(3)}) ÷ ${LvP.sePool.toFixed(4)} = ${f2(LvP.z)}, p below 0.001.`,
        `Why: Loyal members have R = 3 (last visit 49–91 days before 31 October) and high FM, so they used to come often and then stopped. For a frequent visitor, seven to thirteen silent weeks is strong evidence they have stopped for good; Potential loyalists were seen recently. Within R = 3, return rates fell from ${pc(R3[0].rate)} at FM = 1 to ${pc(R3[4].rate)} at FM = 5.`,
      ],
      answer: `Loyal ${pc(O.Loyal.rate)} against Potential loyalists ${pc(O['Potential loyalists'].rate)} (z = ${f2(LvP.z)}, p below 0.001): the names rank these segments the wrong way round for predicting returns.`,
      interpretation: 'High past value doesn’t protect a member who has gone quiet; it makes the quiet more telling. Ana renames R = 3, FM 4–5 “Lapsed regulars” and stops treating it as a safe group. Their past spend still makes them worth a test of a win-back message, measured against a holdout, because nothing in these data shows what an offer would do.' },
    { level: 'applied', title: 'A pastry offer: Champions or At risk?', fictional: true,
      setup: `Looking back, Ana asks what a free pastry for any member who visited in November–December would have needed to achieve had she sent it through the app on 31 October to one segment. Fictional assumption: a redeemed pastry costs Lantern ${money(COST)}. The cafés’ cost of goods is ${pc(F03.cafes.cogsShare, 0)} of sales (F03). Returning Champions spent ${money(segSpend(ch))} each in November–December and the five returning At risk members ${money(segSpend(ar))} each; she assumes an extra returner would spend the same as the segment’s own returners. Return rates without any offer: Champions ${O[ch].back} of ${O[ch].n}, At risk ${O[ar].back} of ${O[ar].n}. How many extra returners would each segment have needed for the offer to break even?`,
      steps: [
        `Margin per returner: Champions ${money(segSpend(ch))} × (1 − ${F03.cafes.cogsShare}) = ${money(VALUE_OF(ch))}; At risk ${money(segSpend(ar))} × ${(1 - F03.cafes.cogsShare).toFixed(2)} = ${money(VALUE_OF(ar))}. Each extra returner also redeems a pastry, so nets ${money(NET_OF(ch))} (Champions) or ${money(NET_OF(ar))} (At risk).`,
        `The subsidy: members who would have come anyway redeem too. Champions: ${O[ch].back} × ${money(COST)} = ${money(subsidy(ch))}. At risk: ${O[ar].back} × ${money(COST)} = ${money(subsidy(ar))}.`,
        `Break-even extra returners = subsidy ÷ net per extra returner. Champions: ${money(subsidy(ch))} ÷ ${money(NET_OF(ch))} = ${f1(needed(ch))}, so ${Math.ceil(needed(ch))} more, an uplift of ${pc(Math.ceil(needed(ch)) / O[ch].n)} on ${O[ch].n} members. At risk: ${money(subsidy(ar))} ÷ ${money(NET_OF(ar))} = ${f1(needed(ar))}, so two more members would have been enough.`,
        `Feasibility: of the Champions, only ${O[ch].n - O[ch].back} would have stayed away, so the offer would have had to bring back ${pc(Math.ceil(needed(ch)) / (O[ch].n - O[ch].back), 0)} of them. At risk members would have cost almost nothing to try, but ${O[ar].n - O[ar].back} of ${O[ar].n} stayed away with no offer, and nothing here shows whether a pastry would move any of them.`,
      ],
      answer: `Champions would have needed about ${Math.ceil(needed(ch))} extra returners (${pc(Math.ceil(needed(ch)) / O[ch].n)} uplift) just to pay for the pastries given to members who would have come anyway; At risk would have needed two.`,
      interpretation: 'The offer is cheap to try on At risk members and expensive on Champions, whose visits it mostly subsidises. For the next quarter Ana plans to send it to At risk with a random half held back, so the difference in return rates measures what the pastry does. The margin, the pastry cost and the spend of extra returners are assumptions (only five At risk members came back, so their $5.96 is a rough figure); the formula widget below lets her change them.' },
  ],

  demo: [
    { widget: 'rfmseg-grid', intro: `All ${int(N)} members scored as of 31 December 2027. Shade the grid by customers, then by spend: the top-right Champions block holds about a fifth of members and nearly half the spend. Switch to equal-sized groups, or to 3 or 4 groups per score, and watch members change segment: the naming is only defined for 5 × 5.` },
    { widget: 'rfmseg-offer', intro: 'The offer arithmetic from the applied example. Set the segment’s size and its return rate without the offer, the uplift you hope for, the margin per returner and the cost per redemption. A high return rate makes the subsidy large: try the Champions’ 77% and then the At risk 2.5%.' },
  ],

  mistakes: [
    { title: '“The segment names are standard definitions.”', html: 'They are one practitioner convention; vendors define “At risk” or “Champions” with different cells and scales. State the scheme, the cut-point rule and the as-of date with any segment count.' },
    { title: '“Loyal and Can’t lose them are the best win-back targets because they were valuable.”', html: `In a noncontractual setting, a frequent customer gone quiet is more likely gone. Scored on 31 October, Lantern’s Loyal members came back at ${pc(O.Loyal.rate)} and Can’t lose them at 0%, against ${pc(BASE)} overall. Past value may still justify a test, but not an assumption.` },
    { title: '“Send the discount to the Champions; they respond best.”', html: `They “respond” because they come anyway: ${pc(O.Champions.rate)} returned with no offer. A discount to them is mostly a subsidy. Judge an offer by the extra returns it causes, measured against a holdout group.` },
    { title: '“The win-back campaign brought back 5% of Lost members.”', html: `Without a control group that figure means nothing: ${pc(O.Lost.rate)} of Lantern’s Lost members returned with no campaign at all. Selecting on low scores invites regression to the mean; compare with a random holdout.` },
    { title: '“Members with notifications on are Champions, so turn notifications on for everyone.”', html: 'Members chose notifications themselves, and the members who choose them may differ in other ways. A segment’s profile is an association. Only a randomised test shows whether an action changes behaviour.' },
    { title: '“A member in At risk today will still be At risk next month.”', html: `Segments move with the date even when the member does nothing: ${int(movedAnyway)} of the ${int(stayedAway.length)} members who never came back changed segment between 31 October and 31 December. Draw lists on the day they are used.` },
  ],

  application: [
    { case: `January 2028. Ana meets Lantern’s two café managers to agree what the app should send members in the first quarter. She brings the 31 December segments and the 31 October check, and one rule: no segment gets a discount unless a random part of it is held back.` },
    { p: `<b>Champions get thanks, not discounts.</b> ${int(S.Champions.n)} members, ${pc(S.Champions.spendShare)} of 2027’s member spend. The managers will invite them to taste new beans first and ask them to recommend the app to a friend; no voucher, because the October check showed most come back anyway.` },
    { p: `<b>New customers and Potential loyalists get a second-visit nudge.</b> Recency is the strongest sign a member is still coming, and these members are recent but have little history. A message a week after joining, tested on a random half of January’s joiners, will show whether it lifts second visits.` },
    { p: `<b>At risk, Can’t lose them and the renamed Lapsed regulars (R = 3, FM 4–5) get one win-back message, with a holdout.</b> Their past spend makes a small test worth running; their return rates without any offer (${pc(O['At risk'].rate)}, ${O['Can’t lose them'].back} of ${O['Can’t lose them'].n} and ${pc(O.Loyal.rate)} in the October check) say not to expect much, and suggest most of Can’t lose them are gone. Half of each segment, chosen at random, gets nothing, so any difference is the message’s effect and not regression to the mean.` },
    { p: `<b>Lost and Hibernating are left alone.</b> ${int(S.Lost.n + S.Hibernating.n)} members, ${pc(S.Lost.spendShare + S.Hibernating.spendShare)} of spend. Repeated messages cost attention and may lead members to switch notifications off; they will see only general news.` },
    { p: `<b>Café by café.</b> Because Harbourside’s tickets are larger, the managers will also score each café’s members against each other, so that a Millbrook regular isn’t ranked low on M only for drinking cheaper coffee. Ana rescores on the first of each month, records each list’s as-of date and checks every named segment against the next two months, as she did in October. <i>Predicting churn</i> builds on that check with a model that uses recency, frequency and the members’ other details together.` },
  ],

  summary: [
    'RFM segments collapse 125 score cells into a few named groups; the common R × FM grid keeps recency separate and combines F and M as FM = their rounded mean.',
    'The names (Champions, Loyal, At risk, Can’t lose them, Hibernating, Lost …) are a practitioner convention, not a standard; state the scheme, the cut-point rule and the as-of date.',
    'Size each segment in members and in spend: Lantern’s Champions are about a fifth of members and nearly half of member spend.',
    'Choose actions by what an offer would change, not by who spends most: a discount to customers who would come anyway is a subsidy, and some segments should be left alone.',
    'Evaluate segments against later behaviour with return rates, lift and a two-proportion test; at Lantern, “Loyal” and “Can’t lose them” failed, because a frequent customer gone quiet is likely gone.',
    'RFM segments are backward-looking, relative, dated and silent on why; their profiles are associations, and win-back results need a random holdout because of regression to the mean.',
    'RFM is behavioural segmentation of existing customers; needs-based segmentation explains why and reaches non-customers. Use them together.',
  ],

  glossary: [
    { term: 'RFM segment', def: 'A named group of customers with similar recency, frequency and monetary scores, defined by a stated rule on a stated date, such as a block of cells on the R × FM grid.' },
    { term: 'R × FM grid', def: 'A 5 × 5 table with the recency score as rows and FM, the rounded mean of the frequency and monetary scores, as columns, whose cells are grouped into named RFM segments.' },
    { term: 'Lift', def: 'A group’s rate of an outcome divided by the rate for everyone (the base rate): lift 2 means twice as likely as average.' },
    { term: 'Increasing frequency paradox', def: 'In a noncontractual setting, the finding that among customers with the same long silence, those who used to buy more often are less likely to buy again, because their silence is stronger evidence that they have stopped.' },
  ],

  references: [
    { text: 'Fader, P. S., Hardie, B. G. S. &amp; Lee, K. L. (2005). RFM and CLV: Using iso-value curves for customer base analysis. <i>Journal of Marketing Research</i>, 42(4), 415–430. Authors’ version (February 2005).', url: 'https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf', checked: '2026-11-01' },
    { text: 'Braze. “RFM SQL segments” (user guide: segment extensions). Braze documentation.', url: 'https://www.braze.com/docs/user_guide/engagement_tools/segments/segment_extension/sql_segments/rfm_segments', checked: '2026-11-01' },
    { text: 'Barnett, A. G., van der Pols, J. C. &amp; Dobson, A. J. (2005). Regression to the mean: what it is and how to deal with it. <i>International Journal of Epidemiology</i>, 34(1), 215–220. doi:10.1093/ije/dyh299.', url: 'https://pubmed.ncbi.nlm.nih.gov/15333621/', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, 10.4 “Comparing Two Independent Population Proportions”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/10-4-comparing-two-independent-population-proportions', checked: '2026-11-01' },
  ],

  checks: [
    // the base and the grid
    { what: 'Members', value: N, shown: 2584 },
    { what: 'Spend', value: SPEND, shown: 82251.25, tol: 0.005 },
    { what: 'As-of date is 31 December 2027', value: Number(CU.isoDay(AS_OF) === '2027-12-31'), shown: 1 },
    { what: 'Cells', value: 5 * 5 * 5, shown: 125 },
    { what: 'Grid cells', value: 5 * 5, shown: 25 },
    { what: 'FM example', value: (4 + 5) / 2, shown: 4.5 },
    { what: 'FM example rounds to', value: Math.floor((4 + 5) / 2 + 0.5), shown: 5 },
    { what: 'Eleven segments', value: SEG.length, shown: 11 },
    { what: 'R cut 1', value: CUT.R[0], shown: 9 },
    { what: 'R cut 4', value: CUT.R[3], shown: 171 },
    { what: 'F = 1 band low', value: fBand(1)[0], shown: 1 },
    { what: 'F = 1 band high', value: fBand(1)[1], shown: 2 },
    { what: 'F = 1 members', value: SC.filter((c) => c.F === 1).length, shown: 857 },
    { what: 'F = 5 starts at', value: fBand(5)[0], shown: 12 },
    { what: 'Recency at R = 5 is within the first cut', value: Number(rBand(5)[1] <= CUT.R[0]), shown: 1 },
    { what: 'F and M move together (correlation of scores > 0.8)', value: Number((() => { const f = SC.map((c) => c.F), m = SC.map((c) => c.M), mf = sum(f) / N, mm = sum(m) / N; const r = sum(f.map((v, i) => (v - mf) * (m[i] - mm))) / Math.sqrt(sum(f.map((v) => (v - mf) ** 2)) * sum(m.map((v) => (v - mm) ** 2))); return r > 0.8; })()), shown: 1 },
    // segments
    { what: 'Champions n', value: S.Champions.n, shown: 563 },
    { what: 'Champions share %', value: S.Champions.share * 100, shown: 21.8, tol: 0.05 },
    { what: 'Champions spend share %', value: S.Champions.spendShare * 100, shown: 48.5, tol: 0.05 },
    { what: 'Champions first by spend', value: Number(SEG[0].key === 'Champions'), shown: 1 },
    { what: 'Top three n', value: top3n, shown: 899 },
    { what: 'Top three share %', value: top3n / N * 100, shown: 34.8, tol: 0.05 },
    { what: 'Top three spend %', value: top3spend * 100, shown: 73.6, tol: 0.05 },
    { what: 'Lost n', value: S.Lost.n, shown: 292 },
    { what: 'Lost share %', value: S.Lost.share * 100, shown: 11.3, tol: 0.05 },
    { what: 'Lost mean visits', value: S.Lost.meanFrequency, shown: 1.55, tol: 0.005 },
    { what: 'Lost spend share %', value: S.Lost.spendShare * 100, shown: 2.4, tol: 0.05 },
    { what: 'Can’t lose them spend share %', value: S['Can’t lose them'].spendShare * 100, shown: 11.4, tol: 0.05 },
    { what: 'At risk spend share %', value: S['At risk'].spendShare * 100, shown: 11.4, tol: 0.05 },
    { what: 'Can’t lose them n', value: S['Can’t lose them'].n, shown: 130 },
    { what: 'Can’t lose them mean visits', value: S['Can’t lose them'].meanFrequency, shown: 16.4, tol: 0.05 },
    { what: 'At risk n', value: S['At risk'].n, shown: 388 },
    { what: 'At risk mean visits', value: S['At risk'].meanFrequency, shown: 5.7, tol: 0.05 },
    // who is in them
    { what: 'New customers', value: S['New customers'].n, shown: 121 },
    { what: 'New customers joined in December', value: newDec, shown: 95 },
    { what: 'Lost joined after July', value: lostLateJoin, shown: 0 },
    { what: 'Latest Lost join is 10 July', value: Number(of('Lost').map((c) => c.joinedIso).sort().pop() === '2027-07-10'), shown: 1 },
    { what: 'Harbourside ticket', value: tickH, shown: 5.77, tol: 0.005 },
    { what: 'Millbrook ticket', value: tickM, shown: 3.61, tol: 0.005 },
    { what: 'Harbourside share all %', value: hAll * 100, shown: 34, tol: 0.5 },
    { what: 'Harbourside share M5 %', value: hM5 * 100, shown: 43, tol: 0.5 },
    { what: 'Harbourside share M1 %', value: hM1 * 100, shown: 24, tol: 0.5 },
    // the October check
    { what: 'Scored on 31 October', value: NO, shown: 1664 },
    { what: 'Came back', value: BACK, shown: 566 },
    { what: 'Base rate %', value: BASE * 100, shown: 34.0, tol: 0.05 },
    { what: 'Champions return %', value: O.Champions.rate * 100, shown: 77.4, tol: 0.05 },
    { what: 'Champions lift', value: O.Champions.lift, shown: 2.28, tol: 0.005 },
    { what: 'Champions Nov–Dec spend share %', value: O.Champions.nd / ND_ALL * 100, shown: 81.9, tol: 0.05 },
    { what: 'R5 return %', value: rRate(5) * 100, shown: 86.8, tol: 0.05 },
    { what: 'R4 return %', value: rRate(4) * 100, shown: 54.5, tol: 0.05 },
    { what: 'R3 return %', value: rRate(3) * 100, shown: 17.0, tol: 0.05 },
    { what: 'R2 return %', value: rRate(2) * 100, shown: 6.4, tol: 0.05 },
    { what: 'R1 return %', value: rRate(1) * 100, shown: 3.3, tol: 0.05 },
    { what: 'Return rate falls with every step down in R', value: Number([5, 4, 3, 2].every((r) => rRate(r) > rRate(r - 1))), shown: 1 },
    { what: 'Loyal n', value: O.Loyal.n, shown: 106 },
    { what: 'Loyal back', value: O.Loyal.back, shown: 8 },
    { what: 'Loyal return %', value: O.Loyal.rate * 100, shown: 7.5, tol: 0.05 },
    { what: 'Loyal lift', value: O.Loyal.lift, shown: 0.22, tol: 0.005 },
    { what: 'Loyal lift under a quarter', value: Number(O.Loyal.lift < 0.25), shown: 1 },
    { what: 'Potential loyalists n', value: O['Potential loyalists'].n, shown: 123 },
    { what: 'Potential loyalists back', value: O['Potential loyalists'].back, shown: 75 },
    { what: 'Potential loyalists return %', value: O['Potential loyalists'].rate * 100, shown: 61.0, tol: 0.05 },
    { what: 'Potential loyalists lift', value: O['Potential loyalists'].lift, shown: 1.79, tol: 0.005 },
    { what: 'Can’t lose them n (Oct)', value: O['Can’t lose them'].n, shown: 58 },
    { what: 'Can’t lose them back (Oct)', value: O['Can’t lose them'].back, shown: 0 },
    { what: 'At risk n (Oct)', value: O['At risk'].n, shown: 201 },
    { what: 'At risk back (Oct)', value: O['At risk'].back, shown: 5 },
    { what: 'At risk return %', value: O['At risk'].rate * 100, shown: 2.5, tol: 0.05 },
    { what: 'Hibernating n (Oct)', value: O.Hibernating.n, shown: 179 },
    { what: 'Hibernating back', value: O.Hibernating.back, shown: 16 },
    { what: 'Hibernating return %', value: O.Hibernating.rate * 100, shown: 8.9, tol: 0.05 },
    { what: 'Lost n (Oct)', value: O.Lost.n, shown: 222 },
    { what: 'Lost back', value: O.Lost.back, shown: 11 },
    { what: 'Lost return %', value: O.Lost.rate * 100, shown: 5.0, tol: 0.05 },
    { what: 'Loyal v PL z', value: LvP.z, shown: -8.4, tol: 0.05 },
    { what: 'Loyal v PL z (2 dp)', value: LvP.z, shown: -8.39, tol: 0.005 },
    { what: 'Loyal v PL p below 0.001', value: Number(LvP.pValue < 0.001), shown: 1 },
    { what: 'Pooled p', value: LvP.pool, shown: 0.362, tol: 0.0005 },
    { what: 'Pooled SE', value: LvP.sePool, shown: 0.0637, tol: 0.00005 },
    { what: 'At risk v Hibernating z', value: AvH.z, shown: -2.75, tol: 0.005 },
    { what: 'At risk v Hibernating p', value: AvH.pValue, shown: 0.006, tol: 0.0005 },
    { what: 'Loyal R = 3 band on 31 October: 49–91 days', value: Number(CU.cutPoints(CT.map((c) => c.recency))[1] === 48 && CU.cutPoints(CT.map((c) => c.recency))[2] === 91), shown: 1 },
    // the paradox
    { what: 'Light 61–90 return %', value: rateOf(light) * 100, shown: 22, tol: 0.5 },
    { what: 'Heavy 61–90 return %', value: rateOf(heavy) * 100, shown: 2, tol: 0.5 },
    { what: 'R3 FM1 %', value: R3[0].rate * 100, shown: 20.5, tol: 0.05 },
    { what: 'R3 FM2 %', value: R3[1].rate * 100, shown: 22.7, tol: 0.05 },
    { what: 'R3 FM3 %', value: R3[2].rate * 100, shown: 20.6, tol: 0.05 },
    { what: 'R3 FM4 %', value: R3[3].rate * 100, shown: 9.1, tol: 0.05 },
    { what: 'R3 FM5 %', value: R3[4].rate * 100, shown: 5.9, tol: 0.05 },
    { what: 'Within R = 3, FM 4–5 return less than FM 1–3', value: Number(Math.max(R3[3].rate, R3[4].rate) < Math.min(R3[0].rate, R3[1].rate, R3[2].rate)), shown: 1 },
    // scores move
    { what: 'Same segment %', value: sameSeg / NO * 100, shown: 78, tol: 0.5 },
    { what: 'Stayed away', value: stayedAway.length, shown: 1098 },
    { what: 'Moved anyway', value: movedAnyway, shown: 197 },
    { what: 'Champions to Loyal', value: champToLoyal, shown: 45 },
    { what: 'Champions notifications %', value: notif(of('Champions')) * 100, shown: 58, tol: 0.5 },
    { what: 'Lost notifications %', value: notif(of('Lost')) * 100, shown: 47, tol: 0.5 },
    // applied example
    { what: 'Cost of goods %', value: F03.cafes.cogsShare * 100, shown: 31 },
    { what: 'Nov–Dec spend per returner', value: ND_PER_RETURNER, shown: 17.60, tol: 0.005 },
    { what: 'Champions Nov–Dec spend per returner', value: segSpend(ch), shown: 23.11, tol: 0.005 },
    { what: 'At risk Nov–Dec spend per returner', value: segSpend(ar), shown: 5.96, tol: 0.005 },
    { what: 'Champions margin per returner', value: VALUE_OF(ch), shown: 15.95, tol: 0.005 },
    { what: 'At risk margin per returner', value: VALUE_OF(ar), shown: 4.11, tol: 0.005 },
    { what: 'Champions net per extra returner', value: NET_OF(ch), shown: 14.85, tol: 0.005 },
    { what: 'At risk net per extra returner', value: NET_OF(ar), shown: 3.01, tol: 0.005 },
    { what: 'Five At risk returners', value: O[ar].back, shown: 5 },
    { what: 'Champions subsidy', value: subsidy(ch), shown: 388.30, tol: 0.005 },
    { what: 'At risk subsidy', value: subsidy(ar), shown: 5.50, tol: 0.005 },
    { what: 'Champions needed', value: needed(ch), shown: 26.2, tol: 0.05 },
    { what: 'Champions needed (whole)', value: Math.ceil(needed(ch)), shown: 27 },
    { what: 'Champions uplift %', value: Math.ceil(needed(ch)) / O[ch].n * 100, shown: 5.9, tol: 0.05 },
    { what: 'Champions back (Oct)', value: O[ch].back, shown: 353 },
    { what: 'Champions n (Oct)', value: O[ch].n, shown: 456 },
    { what: 'Champions stayed away', value: O[ch].n - O[ch].back, shown: 103 },
    { what: 'Share of stayers needed %', value: Math.ceil(needed(ch)) / (O[ch].n - O[ch].back) * 100, shown: 26, tol: 0.5 },
    { what: 'At risk needed', value: needed(ar), shown: 1.8, tol: 0.05 },
    { what: 'At risk needed (whole)', value: Math.ceil(needed(ar)), shown: 2 },
    { what: 'At risk stayed away', value: O[ar].n - O[ar].back, shown: 196 },
    // simple example
    { what: 'Tallowby total', value: tbTot, shown: 1383.50 },
    { what: 'Tallowby Champions spend', value: tbSeg('Champions'), shown: 562.50 },
    { what: 'Tallowby Champions share %', value: tbSeg('Champions') / tbTot * 100, shown: 40.7, tol: 0.05 },
    { what: 'Tallowby segments as stated', value: Number(TBS.map((c) => c.seg).join('|') === 'Champions|New customers|Potential loyalists|Loyal|Can’t lose them|At risk|Hibernating|Champions'), shown: 1 },
    { what: 'Tallowby FM as stated', value: Number(TBS.map((c) => c.fm).join('') === '52355324'), shown: 1 },
    { what: '2 of 8 %', value: 2 / 8 * 100, shown: 25 },
    // application
    { what: 'Lost + Hibernating', value: S.Lost.n + S.Hibernating.n, shown: 516 },
    { what: 'Lost + Hibernating spend %', value: (S.Lost.spendShare + S.Hibernating.spendShare) * 100, shown: 4.5, tol: 0.05 },
  ],
};
