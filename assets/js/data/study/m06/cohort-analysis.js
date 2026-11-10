// cohort-analysis.js — M06 · Cohort analysis. Content only; exercises are in cohort-analysis.ex.js.
// Lantern's 2,584 loyalty-app members by joining month (case.js joinMap, VISIT_LIST; core/customer.js cohortTable): the
// left-aligned triangle of share active, number active and revenue per joiner, the pooled curve, the calendar view,
// the two cafés, and two-proportion tests of the October and November cohorts (core/inference.js propTest2). Footfall
// by month is B05's log. The October joiners are B06's 225 members. Calderwick Yarns and Ostrander Cycles are fictional.
// Every printed figure is in `checks`; every claim about the data's shape has a check that would fail if it were false.
import { MEMBER_LIST, VISIT_LIST, joinMap } from './case.js?v=30';
import * as CU from '../../../core/customer.js?v=30';
import { propTest2 } from '../../../core/inference.js?v=30';
import { CLEAN_ROWS, CAFE_COLUMNS } from '../b05/case.js?v=30';
import { FACTS as F03 } from '../f03/case.js?v=30';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const pc = (v, d = 1) => `${(Math.round(v * 10 ** (d + 2) * (1 + 1e-12)) / 10 ** d).toFixed(d)}%`;
const p0 = (v) => pc(v, 0);
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const int = (v) => v.toLocaleString('en-US');
const f2 = (v) => v.toFixed(2);
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MSH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mName = (label) => `${MSH[+label.slice(5, 7) - 1]} ${label.slice(0, 4)}`;

// ---------------------------------------------------------------- the cohort tables
const T = CU.cohortTable(joinMap(), VISIT_LIST);
const TH = CU.cohortTable(joinMap({ cafe: 'Harbourside' }), VISIT_LIST);
const TM = CU.cohortTable(joinMap({ cafe: 'Millbrook' }), VISIT_LIST);
const NC = T.cohorts.length, N = sum(T.cohorts.map((c) => c.size));
const ci = (label) => T.cohorts.findIndex((c) => c.label === label);
const MAR = ci('2027-03'), OCT = ci('2027-10'), NOV = ci('2027-11'), DEC = ci('2027-12');
const m1 = T.retention.map((r) => r[1]);                                  // month 1 share active (undefined for December)
const early = T.cohorts.map((_, i) => i).filter((i) => i <= ci('2027-09'));
const earlyA = sum(early.map((i) => T.active[i][1])), earlyN = sum(early.map((i) => T.cohorts[i].size));
const NOVt = propTest2(T.active[NOV][1], T.cohorts[NOV].size, earlyA, earlyN);
const OCTt = propTest2(T.active[OCT][1], T.cohorts[OCT].size, earlyA, earlyN);
const m1Early = early.map((i) => m1[i]);
// November's composition against March–September's
const byCohort = (lo, hi) => MEMBER_LIST.filter((m) => m.joinedIso.slice(0, 7) >= lo && m.joinedIso.slice(0, 7) <= hi);
const share = (g, f) => g.filter(f).length / g.length;
const gNov = byCohort('2027-11', '2027-11'), gEarly = byCohort('2027-03', '2027-09');
const comp = (f) => [share(gNov, f), share(gEarly, f)];
const cMill = comp((m) => m.cafe === 'Millbrook'), cNear = comp((m) => m.near), cNotif = comp((m) => m.notifications);
const mi = (label) => TM.cohorts.findIndex((c) => c.label === label);
const millEarly = TM.cohorts.map((_, i) => i).filter((i) => i <= mi('2027-09'));
const millEarlyRate = sum(millEarly.map((i) => TM.active[i][1])) / sum(millEarly.map((i) => TM.cohorts[i].size));
const millNov = TM.retention[mi('2027-11')][1];
const millNovT = propTest2(TM.active[mi('2027-11')][1], TM.cohorts[mi('2027-11')].size, sum(millEarly.map((i) => TM.active[i][1])), sum(millEarly.map((i) => TM.cohorts[i].size)));
const millOnly = (g) => g.filter((m) => m.cafe === 'Millbrook');
const mShare = (g, f) => share(millOnly(g), f);
const mNear = [mShare(gNov, (m) => m.near), mShare(gEarly, (m) => m.near)], mNotif = [mShare(gNov, (m) => m.notifications), mShare(gEarly, (m) => m.notifications)];
// direct standardisation: March–September month-1 rates by café × near × notifications, applied to November's mix
const activeM1 = (m) => { const mo = +m.joinedIso.slice(5, 7) + 1, ym = `2027-${String(mo).padStart(2, '0')}`; return VISIT_LIST.some((v) => v.id === m.id && v.date.startsWith(ym)); };
const cellKey = (m) => `${m.cafe}|${m.near}|${m.notifications}`;
const CELLS = new Map();
for (const m of gEarly) { const c = CELLS.get(cellKey(m)) || { n: 0, a: 0 }; c.n++; if (activeM1(m)) c.a++; CELLS.set(cellKey(m), c); }
const STD_NOV = sum(gNov.map((m) => { const c = CELLS.get(cellKey(m)); return c.a / c.n; })) / gNov.length;
// aggregate activity by calendar month
const activeIn = (ym) => new Set(VISIT_LIST.filter((v) => v.date.startsWith(ym)).map((v) => v.id)).size;
const ACT_MAR = activeIn('2027-03'), ACT_DEC = activeIn('2027-12');
const oldShare = (mo) => { let a = 0, n = 0; T.cohorts.forEach((c, i) => { const k = 2027 * 12 + mo - 1 - c.month; if (k >= 1 && k < T.active[i].length) { a += T.active[i][k]; n += c.size; } }); return a / n; };
const OLD_APR = oldShare(4), OLD_DEC = oldShare(12);
// the March cohort, month 1, decomposed
const joinOf = new Map(MEMBER_LIST.map((m) => [m.id, m]));
const marApr = VISIT_LIST.filter((v) => joinOf.get(v.id).joinedIso.startsWith('2027-03') && v.date.startsWith('2027-04'));
const marActive = T.active[MAR][1], marSize = T.cohorts[MAR].size, marVisits = marApr.length, marRev = T.revenue[MAR][1];
const perActive = marVisits / marActive, perVisit = marRev / marVisits;
// seasonality: visits per active member (joined before the month) at each café, against B05's footfall
const at = (n) => CAFE_COLUMNS.indexOf(n);
const footIdx = (cafe, mo) => { const rows = CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe), mean = sum(rows.map((r) => r[at('footfall')])) / rows.length; const m = rows.filter((r) => +r[at('date')].slice(5, 7) === mo); return sum(m.map((r) => r[at('footfall')])) / m.length / mean; };
const vpa = (cafe, mo) => { const ym = `2027-${String(mo).padStart(2, '0')}`, start = CU.dayNum(`${ym}-01`); const v = VISIT_LIST.filter((x) => x.date.startsWith(ym) && joinOf.get(x.id).cafe === cafe && joinOf.get(x.id).joined < start); return v.length / new Set(v.map((x) => x.id)).size; };
const SEAS = { hJul: vpa('Harbourside', 7), hAug: vpa('Harbourside', 8), hDec: vpa('Harbourside', 12), mJul: vpa('Millbrook', 7), mAug: vpa('Millbrook', 8), mDec: vpa('Millbrook', 12),
  fhJul: footIdx('Harbourside', 7), fhDec: footIdx('Harbourside', 12), fmJul: footIdx('Millbrook', 7), fmDec: footIdx('Millbrook', 12), fhMar: footIdx('Harbourside', 3) };
const hMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12].map((mo) => vpa('Harbourside', mo));
const hPeak = 4 + hMonths.indexOf(Math.max(...hMonths)), hLow = 4 + hMonths.indexOf(Math.min(...hMonths));
// the two cafés
const revPooled = (t, k) => { const p = t.pooled[k]; return sum(t.revenue.map((row) => (k < row.length ? row[k] : 0))) / p.size; };
const cum6 = (t) => { const cs = t.cohorts.map((_, i) => i).filter((i) => t.revenue[i].length >= 6); return { per: sum(cs.map((i) => sum(t.revenue[i].slice(0, 6)))) / sum(cs.map((i) => t.cohorts[i].size)), n: sum(cs.map((i) => t.cohorts[i].size)), k: cs.length }; };
const H6 = cum6(TH), M6 = cum6(TM);
const risesH = sum(TH.retention.map((r) => r.slice(2).filter((v, k) => v > r[k + 1]).length));
const risesAll = sum(T.retention.map((r) => r.slice(2).filter((v, k) => v > r[k + 1]).length));
const hApr = TH.retention[TH.cohorts.findIndex((c) => c.label === '2027-04')];

// ---------------------------------------------------------------- fictional examples
// Calderwick Yarns: ten customers' first and later purchase months (simple example)
const CY = [
  ['K1', 'Jan', ['Jan', 'Feb', 'Apr']], ['K2', 'Jan', ['Jan']], ['K3', 'Jan', ['Jan', 'Feb', 'Mar']], ['K4', 'Jan', ['Jan', 'Mar']],
  ['K5', 'Feb', ['Feb', 'Mar']], ['K6', 'Feb', ['Feb']], ['K7', 'Feb', ['Feb', 'Mar', 'Apr']], ['K8', 'Feb', ['Feb', 'Apr']],
  ['K9', 'Mar', ['Mar', 'Apr']], ['K10', 'Mar', ['Mar']],
];
const cyM = (s) => MSH.indexOf(s);
const cyTable = ['Jan', 'Feb', 'Mar'].map((c) => {
  const g = CY.filter((x) => x[1] === c), last = cyM('Apr') - cyM(c);
  return { c, n: g.length, act: Array.from({ length: last + 1 }, (_, k) => g.filter((x) => x[2].some((m) => cyM(m) - cyM(c) === k)).length) };
});
const cyPooled1 = sum(cyTable.map((r) => r.act[1])) / sum(cyTable.map((r) => r.n));
// Ostrander Cycles: a mix effect (challenging example)
const OS = { store: [[400, 120], [100, 50]], online: [[100, 25], [400, 180]] };   // [joined in January, joined in June]: [members, active in December]
const osRate = (g, j) => OS[g][j][1] / OS[g][j][0];
const osAll = (g) => sum(OS[g].map((x) => x[1])) / sum(OS[g].map((x) => x[0]));
const osStd = (g) => 0.5 * osRate(g, 0) + 0.5 * osRate(g, 1);

// ---------------------------------------------------------------- tables
const RET_ROWS = T.cohorts.map((c, i) => [mName(c.label), int(c.size), ...Array.from({ length: 10 }, (_, k) => (k < T.retention[i].length ? p0(T.retention[i][k]) : ''))]);
const CAL = ['2027-03', '2027-06', '2027-09'].map(ci);
const CAL_ROWS = CAL.map((i) => [mName(T.cohorts[i].label), ...Array.from({ length: 10 }, (_, j) => { const k = j - (T.cohorts[i].month - T.cohorts[MAR].month); return k >= 0 && k < T.retention[i].length ? p0(T.retention[i][k]) : ''; })]);

export default {
  slug: 'cohort-analysis',
  title: 'Cohort analysis',
  blurb: 'Group customers by when they joined and follow each group month by month: build and read the cohort triangle, choose between share active, number active and revenue per joiner, tell a better cohort from a season or a change in who joined, and avoid the mix effects that make pooled figures mislead.',
  status: 'reviewed',
  objectives: [
    'Construct a cohort table by joining month, left-aligned by months since joining, from transactions, and calculate months since joining in Excel.',
    'Calculate share active, number active and revenue per joiner, and decompose revenue per joiner into share active, visits per active customer and spend per visit.',
    'Interpret a cohort table down its columns (are newer cohorts better?) and along its rows, and test a cohort’s difference with a two-proportion test.',
    'Distinguish a cohort effect from seasonality and from a change in the mix of customers who joined.',
    'Explain why pooled curves and whole-base figures mislead when cohorts of different ages are mixed, including a Simpson’s-paradox reversal.',
  ],
  prerequisites: [
    { lesson: 'm06/customer-metrics', why: 'Turning transactions into customer-level measures as of a date, and why “churn” has to be inferred for café members.' },
    { lesson: 'm06/rfm-segments', why: 'RFM segments mix members of different tenures; cohorts separate them.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The two-proportion z test used to compare one cohort’s share active with others’.' },
    { lesson: 'm01/customer-value', why: 'Retention rate, churn rate and customer lifetime value, which cohort tables feed.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Lantern’s loyalty app had ${int(ACT_MAR)} active members in March 2027 and ${int(ACT_DEC)} in December. The café managers read that as success. Ana isn’t sure: new members joined every day, so a rising total could hide members fading away as fast as new ones arrive. To see what happens to a member after joining, she needs to follow groups of members who joined at the same time.` },
    { p: '<g>Cohort analysis</g> groups customers into a <g>cohort</g>, everyone who joined (or first bought) in the same period, and follows each cohort through time. Lantern’s cohorts are joining months: the March 2027 cohort is the 242 members who set up the app in March. Comparing cohorts at the same age, and the same cohort at different ages, separates two things a total mixes: how members behave after joining, and how many joined.' },

    { h: 'The cohort triangle' },
    { p: String.raw`A <g>cohort table</g> has one row per cohort and one column per period since joining. A member is <em>active</em> in month <m>k</m> of their cohort if they made at least one visit in that calendar month, where month 0 is the joining month. Every Lantern member is active in month 0, because the join is a visit at the till. The share active in month <m>k</m> is the number active divided by the cohort’s size. Newer cohorts have been watched for fewer months, so the table is a triangle: the March cohort has ten months of data (March to December), the December cohort one.` },
    { table: {
      caption: `Share of each cohort active, by months since joining (month 0 = the joining month). Lantern’s ${int(N)} loyalty-app members, both cafés, to 31 December 2027.`,
      head: ['Cohort', 'Joined', ...Array.from({ length: 10 }, (_, k) => String(k))],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: RET_ROWS,
      foot: [['All cohorts', int(N), ...T.pooled.map((p) => p0(p.rate))]],
    } },
    { p: `This layout is <g>left-aligned</g>: every cohort starts in column 0, so a column compares cohorts at the same age. Read along a row and you follow one cohort as it ages: the March cohort fell to ${p0(T.retention[MAR][1])} active in its first full month, ${p0(T.retention[MAR][3])} by month 3 and ${p0(T.retention[MAR][9])} by month 9. Read down a column and you compare cohorts at the same age: in month 1, the March to September cohorts sat between ${p0(Math.min(...m1Early))} and ${p0(Math.max(...m1Early))}. Every row drops most steeply from month 0 to month 1 and then flattens, a typical shape: members who come back once are likely to keep coming for a while.` },
    { p: `The same numbers can be laid out by calendar month instead. Then each cohort starts in its own joining month and a calendar month is a column; in the left-aligned table the same calendar month runs along a diagonal. The calendar view is the one to use for anything that happens on a date, such as a price change or a quiet summer.` },
    { table: {
      caption: 'The same shares active laid out by calendar month, for three cohorts (each starts at 100% in its joining month)',
      head: ['Cohort', ...MSH.slice(2)],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: CAL_ROWS,
    } },

    { h: 'Three measures' },
    { p: `The triangle can hold three different measures, and each answers a different question. <b>Share active</b> asks whether members keep coming. <b>Number active</b> asks how many members are coming, which depends on how many joined. <b>Revenue per joiner</b>, the cohort’s spend in a month divided by the number who joined, asks what a joiner is worth month by month. It is the product of three parts: share active × visits per active member × spend per visit. In April, its month 1, the March cohort had ${marActive} of ${marSize} members active (${pc(marActive / marSize)}), making ${f2(perActive)} visits each and spending ${money(perVisit)} a visit: ${money(marRev / marSize)} per joiner.` },
    { callout: 'key', title: 'Same age, same measure', html: 'Compare cohorts only at the same age (a column of a left-aligned table) and on the same measure. A cohort that is “worse” in its sixth month than another in its second is simply older, and a bigger cohort has more members active without being any better.' },
    { p: 'In a café, “active in month k” is not the same as “still a customer”. A member can skip a month and come back, so a row can rise as well as fall; nobody cancels. Many reports still call the share active “retention”. When a lesson needs the share still a customer, it has to define being lapsed, as <i>Survival analysis</i> does.' },
  ],

  theory: [
    { h: 'Reading down the columns: are newer cohorts better?' },
    { p: `Two cohorts stand out in month 1. Only ${p0(m1[OCT])} of the ${T.cohorts[OCT].size} October joiners were active in November, and ${p0(m1[NOV])} of the ${T.cohorts[NOV].size} November joiners were active in December, against ${pc(earlyA / earlyN)} for the March to September cohorts together. (The October cohort is B06’s 225 members, of whom 121 came back within 30 days of joining.) Each cohort has about 250 members, so a share active is uncertain by several points, and a difference needs testing before it is read.` },
    { p: `A two-proportion z test (B04) of November’s month 1 (${T.active[NOV][1]} of ${T.cohorts[NOV].size}) against March to September’s (${int(earlyA)} of ${int(earlyN)}) gives z = ${f2(NOVt.z)}, p = ${NOVt.pValue.toFixed(3)}; October’s gives z = ${f2(OCTt.z)}, p = ${OCTt.pValue.toFixed(3)}. But nine cohorts were compared, and with nine looks one p near 0.01 is not surprising. A Bonferroni correction (B04) asks for p below 0.05 ÷ 9 = ${(0.05 / 9).toFixed(4)}: October passes, November does not. October’s weak start looks real; November’s strong one needs another month before Ana reads much into it.` },

    { h: 'Cohort quality or a change in who joined?' },
    { p: `If November’s joiners do keep coming more, the next question is why. A cohort is better or worse because of the members in it, and the mix of members can change. November’s joiners were ${p0(cMill[0])} Millbrook members (against ${p0(cMill[1])} in March to September), ${p0(cNear[0])} lived or worked within a mile (${p0(cNear[1])}) and ${p0(cNotif[0])} had notifications on (${p0(cNotif[1])}). Millbrook members, near members and members with notifications on all come more often, so some of November’s lead could be a <g>mix effect</g>: the cohort’s average changing because the shares of different kinds of member changed. How much can be measured by <g>direct standardisation</g>: take March to September’s month-1 rate for each combination of café, near and notifications, and average those rates over November’s members. That predicts ${pc(STD_NOV)} for November, against ${pc(earlyA / earlyN)} for March to September and the ${pc(m1[NOV])} November actually reached. The mix explains about ${(Math.round((STD_NOV - earlyA / earlyN) * 100))} point of a ${Math.round((m1[NOV] - earlyA / earlyN) * 100)}-point lead.` },
    { p: `The rest is most likely chance. Within Millbrook alone November still led (${p0(millNov)} against ${p0(millEarlyRate)}; z = ${f2(millNovT.z)}, p = ${millNovT.pValue.toFixed(3)}), but that p doesn’t pass the Bonferroni threshold either, and even within Millbrook November’s joiners were more often near (${p0(mNear[0])} against ${p0(mNear[1])}) and had notifications on more often (${p0(mNotif[0])} against ${p0(mNotif[1])}), which the standardisation already allows for. Nothing in the data marks November out; its lead is the kind of result that one cohort in nine produces by chance.` },
    { p: 'Even where a mix effect is real, it says nothing about what caused it. The members chose their café, where they live and whether to switch notifications on; a cohort’s composition and its behaviour are associations. If something Lantern did in November (a sign-up drive, a new barista, a promotion) changed who joined, the cohort table shows the result but can’t separate the action from everything else that happened that month.' },

    { h: 'Seasonality or cohort quality?' },
    { p: String.raw`A cohort’s month 1 falls in a different calendar month for each cohort, so <g>seasonality</g> can look like cohort quality. The test is where the pattern sits: an effect of the calendar shows on a diagonal of the left-aligned table (every cohort affected in the same calendar month, whatever its age); an effect of the cohort runs along its row (the cohort different at every age). Lantern’s footfall is seasonal at Harbourside, on the waterfront: B05’s log shows July’s footfall at ${f2(SEAS.fhJul)} times the year’s average and December’s at ${f2(SEAS.fhDec)}. Members visit more on busy days, so Harbourside’s active members made ${f2(SEAS.hJul)} visits each in July and ${f2(SEAS.hAug)} in August but ${f2(SEAS.hDec)} in December. Millbrook’s footfall is flatter (${f2(SEAS.fmJul)} and ${f2(SEAS.fmDec)}), and so are its visits per active member (${f2(SEAS.mJul)}, ${f2(SEAS.mAug)} and ${f2(SEAS.mDec)}). On the diagonal, every cohort from March to September lost fewer points of share active from November to December than its average month-on-month loss before that; rows flatten with age anyway, so that is weak evidence, but nothing suggests December hurt the cohorts.` },
    { p: 'In a busy month the members who are still coming make more visits, so the season shows in visits per active member and revenue per joiner as well as in the share active. A cohort that joined in a busy month has a high month-0 and month-1 revenue partly because of the month. Compare such cohorts with the same calendar months a year later, once there are two years of data, or on a measure the season moves less.' },

    { h: 'Pooled curves and the mix of ages' },
    { p: String.raw`The bottom row of the triangle is the <g>pooled curve</g>: for each month since joining, the members active divided by the members who joined, over every cohort observed that long. Each point is a weighted average of the cohorts, weighted by size. It is the natural summary, with one catch: the cohorts behind each point change. Month 1 averages nine cohorts; month 9 is the March cohort alone (${p0(T.pooled[9].rate)}). If early cohorts differ from later ones, the pooled curve’s tail describes different members from its head, and its shape mixes how members age with who the early members were.` },
    { p: `Figures for the whole base mix ages too. Of the members who had joined before each month, ${pc(OLD_APR)} were active in April and ${pc(OLD_DEC)} in December. That fall doesn’t mean members got worse: every cohort’s month 1 stayed near 60% (apart from October and November). It means the base got older, and older members are less often active. Meanwhile the total of active members rose from ${int(ACT_MAR)} to ${int(ACT_DEC)}, because the base grew. A total, a share of the whole base and a cohort’s share answer three different questions.` },
    { callout: 'warn', title: 'Simpson’s paradox in customer data', html: 'When two groups of customers have different age mixes, one can lead within every cohort and still trail overall, because its customers are mostly from older cohorts. This is <g>Simpson’s paradox</g>: the comparison reverses when the cohorts are pooled, because cohort age is a <g>confounding variable</g>. Compare groups cohort by cohort, at the same age, or standardise them to a common mix of cohorts. The challenging example works one through.' },

    { h: 'The two cafés' },
    { p: `Splitting the triangle by café shows two different businesses. Millbrook members keep coming more: the pooled share active in month 1 is ${pc(TM.pooled[1].rate)} at Millbrook and ${pc(TH.pooled[1].rate)} at Harbourside. But Harbourside’s tickets are bigger, so revenue per joiner in month 1 is ${money(revPooled(TH, 1))} at Harbourside and ${money(revPooled(TM, 1))} at Millbrook. Over their first six months (months 0–5), the ${int(H6.n)} Harbourside joiners of March to July spent ${money(H6.per)} each and the ${int(M6.n)} Millbrook joiners ${money(M6.per)}. With fewer members per cohort, Harbourside’s rows are noisier: ${risesH} times a Harbourside cohort’s share active rose from one month to the next (the April cohort went from ${p0(hApr[1])} to ${p0(hApr[2])}), against ${risesAll} in the combined table.` },
    { p: 'Which café gets more from a new member is a question about these two sets of customers, not about what would happen if a Harbourside customer were moved to Millbrook. The cafés’ customers differ in where they live, what they buy and when they come.' },
  ],

  formulas: [
    { id: 'coh-age', name: 'Months since joining',
      tex: String.raw`k = 12\,(y_v - y_j) + (m_v - m_j)`,
      where: [
        [String.raw`k`, 'Months since joining: 0 for the joining month, 1 for the next calendar month', 'months'],
        [String.raw`y_v,\ m_v`, 'Year and month number (1–12) of the visit', ''],
        [String.raw`y_j,\ m_j`, 'Year and month number of the joining date', ''],
      ],
      assumptions: 'Cohorts and activity are by calendar month, so a member who joins on 31 March is in month 1 on 1 April.',
      note: 'Excel: <x>=(YEAR(C2)-YEAR(B2))*12+MONTH(C2)-MONTH(B2)</x>. <x>=DATEDIF(B2,C2,"m")</x> counts complete months instead, so it gives 0 for a visit on 1 April after joining on 31 March.' },
    { id: 'coh-active', name: 'Share active and the pooled curve',
      tex: String.raw`a_{c,k} = \dfrac{A_{c,k}}{N_c}, \qquad \bar{a}_k = \dfrac{\sum_{c \in C_k} A_{c,k}}{\sum_{c \in C_k} N_c}`,
      where: [
        [String.raw`A_{c,k}`, 'Members of cohort c with at least one purchase in month k since joining', 'members'],
        [String.raw`N_c`, 'Members who joined in cohort c (its size)', 'members'],
        [String.raw`a_{c,k}`, 'Share of cohort c active in month k', ''],
        [String.raw`C_k`, 'The cohorts observed for at least k months', ''],
        [String.raw`\bar{a}_k`, 'The pooled share active in month k: a size-weighted average over C_k', ''],
      ],
      assumptions: 'Every cohort’s month k is complete; the last calendar month of data must be a whole month.',
      note: 'The pooled curve is not the plain average of the cohorts’ shares; bigger cohorts count for more.' },
    { id: 'coh-revenue', name: 'Revenue per joiner, decomposed',
      tex: String.raw`\dfrac{R_{c,k}}{N_c} = \dfrac{A_{c,k}}{N_c} \times \dfrac{V_{c,k}}{A_{c,k}} \times \dfrac{R_{c,k}}{V_{c,k}}`,
      where: [
        [String.raw`R_{c,k}`, 'Spend by cohort c in month k', '$'],
        [String.raw`V_{c,k}`, 'Visits (purchases) by cohort c in month k', 'visits'],
        [String.raw`A_{c,k},\ N_c`, 'Active members and cohort size, as above', 'members'],
      ],
      note: 'Revenue per joiner = share active × visits per active member × spend per visit. A change in one of the three tells you where a cohort differs.' },
  ],

  examples: [
    { level: 'simple', title: 'A cohort table from ten customers', fictional: true,
      setup: 'Calderwick Yarns, an online wool shop, has ten customers who first bought between January and March. The table lists the months in which each bought. Build the left-aligned table of the number active and the share active to the end of April, and the pooled share active in month 1.',
      table: {
        caption: 'Calderwick Yarns: each customer’s first month and every month with a purchase (fictional)',
        head: ['Customer', 'First purchase', 'Months with a purchase'],
        align: ['l', 'l', 'l'],
        rows: CY.map(([id, c, ms]) => [id, c, ms.join(', ')]),
      },
      steps: [
        'Assign each customer to the cohort of their first purchase month: January K1–K4, February K5–K8, March K9 and K10.',
        `Count, for each cohort, the customers with a purchase in each month since joining. January (4 customers): month 0 all 4; month 1 (February) K1 and K3, so ${cyTable[0].act[1]}; month 2 (March) K3 and K4, ${cyTable[0].act[2]}; month 3 (April) K1, ${cyTable[0].act[3]}. February (4): ${cyTable[1].act.join(', ')} in months 0 to 2. March (2): ${cyTable[2].act.join(', ')} in months 0 and 1.`,
        `Divide by cohort size: January ${cyTable[0].act.map((a) => p0(a / 4)).join(', ')}; February ${cyTable[1].act.map((a) => p0(a / 4)).join(', ')}; March ${cyTable[2].act.map((a) => p0(a / 2)).join(', ')}.`,
        `Pooled month 1: every cohort has been seen for a month, so (${cyTable.map((r) => r.act[1]).join(' + ')}) ÷ (4 + 4 + 2) = ${cyTable.reduce((s, r) => s + r.act[1], 0)} ÷ 10 = ${p0(cyPooled1)}.`,
      ],
      answer: `Shares active: January ${cyTable[0].act.map((a) => p0(a / 4)).join(', ')}; February ${cyTable[1].act.map((a) => p0(a / 4)).join(', ')}; March ${cyTable[2].act.map((a) => p0(a / 2)).join(', ')}. Pooled month 1: ${p0(cyPooled1)}.`,
      interpretation: 'January’s row rises in month 2 (K4 came back) and falls again: activity, not survival. With two to four customers per cohort the shares jump by 25 or 50 points at a time; real cohorts need hundreds of customers before a column can be compared.' },
    { level: 'challenging', title: 'A channel that leads in every cohort and trails overall', fictional: true,
      setup: 'Ostrander Cycles, a bike shop, signs customers up to its app in the shop or online. In December the marketing manager reports that 41% of online sign-ups were active against 34% of in-shop sign-ups, and proposes moving all sign-up effort online. The figures come from two cohorts.',
      table: {
        caption: 'Ostrander Cycles: app members by sign-up channel and cohort, and those active in December (fictional)',
        head: ['Channel', 'Joined January', 'Active in Dec.', 'Joined June', 'Active in Dec.'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [['In the shop', '400', '120', '100', '50'], ['Online', '100', '25', '400', '180']],
      },
      steps: [
        `Overall: in the shop (120 + 50) ÷ (400 + 100) = ${p0(osAll('store'))}; online (25 + 180) ÷ (100 + 400) = ${p0(osAll('online'))}. Online leads by ${Math.round((osAll('online') - osAll('store')) * 100)} points.`,
        `Cohort by cohort: January joiners ${p0(osRate('store', 0))} in the shop against ${p0(osRate('online', 0))} online; June joiners ${p0(osRate('store', 1))} against ${p0(osRate('online', 1))}. The shop leads by 5 points in both cohorts.`,
        'Why the reversal: 80% of in-shop members joined in January and have had eleven months to drift away; 80% of online members joined in June. Cohort age affects both the channel mix and the share active, so it confounds the overall comparison: Simpson’s paradox.',
        `Standardise to a common mix, half January and half June: in the shop 0.5 × ${p0(osRate('store', 0))} + 0.5 × ${p0(osRate('store', 1))} = ${p0(osStd('store'))}; online ${p0(osStd('online'))}.`,
      ],
      answer: `Online’s lead (${p0(osAll('online'))} against ${p0(osAll('store'))}) is a mix effect. At the same age, in-shop members are 5 points more active (${p0(osStd('store'))} against ${p0(osStd('online'))} on a common mix).`,
      interpretation: 'The proposal rests on comparing young online members with old in-shop ones. The cohort comparison favours the shop, though only as an association: people who sign up in a shop may differ from those who sign up online. Ostrander could test it by offering in-shop customers a random choice of sign-up route.' },
    { level: 'applied', title: 'Is November’s cohort a better kind of member?', fictional: false,
      setup: `The café managers point to the November cohort: ${p0(m1[NOV])} active in its first full month, the best of the year. They propose repeating whatever they did in November. Ana checks the claim with the cohort table and the members’ details.`,
      steps: [
        `Same age, same measure: month 1, November ${T.active[NOV][1]} ÷ ${T.cohorts[NOV].size} = ${pc(m1[NOV])}, against March to September’s ${int(earlyA)} ÷ ${int(earlyN)} = ${pc(earlyA / earlyN)}.`,
        `Chance: z = ${f2(NOVt.z)}, p = ${NOVt.pValue.toFixed(3)}, but after a Bonferroni correction for nine cohort comparisons the threshold is ${(0.05 / 9).toFixed(4)}, so the lead is suggestive, not established.`,
        `Season: month 1 for November is December, one of Harbourside’s quietest months (footfall ${f2(SEAS.fhDec)} times average; only March, its opening month, was quieter at ${f2(SEAS.fhMar)}). But ${p0(cMill[0])} of November’s joiners were Millbrook members, and Millbrook’s December footfall (${f2(SEAS.fmDec)}) was about average, so the season is unlikely to have helped November much either way.`,
        `Mix: November’s joiners were ${p0(cMill[0])} Millbrook, ${p0(cNear[0])} near and ${p0(cNotif[0])} with notifications on, all above March to September (${p0(cMill[1])}, ${p0(cNear[1])}, ${p0(cNotif[1])}). Applying March to September’s month-1 rate for each café × near × notifications group to November’s members predicts ${pc(STD_NOV)}: the mix accounts for about ${Math.round((STD_NOV - earlyA / earlyN) * 100)} point of the ${Math.round((m1[NOV] - earlyA / earlyN) * 100)}-point lead.`,
      ],
      answer: `November’s month 1 (${pc(m1[NOV])}) is ahead of earlier cohorts (${pc(earlyA / earlyN)}), but its mix explains only about a point (standardised ${pc(STD_NOV)}), and the rest is not beyond chance once nine cohorts are compared: most likely November was a lucky cohort.`,
      interpretation: 'Ana tells the managers it is too early to copy November: wait for months 2 and 3, and write down now what was different in November so it can be tested later. If they want to know whether a sign-up drive brings better members, they should run it at one café in alternate weeks, chosen in advance, and compare those weeks’ cohorts.' },
  ],

  demo: [
    { widget: 'coh-table', intro: 'Every 2027 cohort of Lantern’s members, both cafés or one at a time. Switch between share active, number active and revenue per joiner, and tick up to two cohorts to draw against the pooled curve. Try October against November, then Harbourside’s revenue per joiner against Millbrook’s.' },
    { widget: 'coh-mix', intro: 'Two groups of customers, two cohorts each. Set each cohort’s share active and the gap between the groups, then change how many of each group’s members joined in the older cohort. When the groups’ mixes differ enough, the group that is behind in every cohort comes out ahead overall.' },
  ],

  mistakes: [
    { title: '“Active members are rising, so retention is fine.”', html: `A total grows with every joiner. Lantern’s active members rose from ${int(ACT_MAR)} to ${int(ACT_DEC)} while each cohort’s share active fell month by month. Follow cohorts, not totals.` },
    { title: '“The March cohort is our worst: only 17% are active.”', html: `It is ${NC - 1} months older than the newest cohort. Compare cohorts in the same column: in month 1 March (${p0(m1[MAR])}) was typical.` },
    { title: '“The pooled curve shows how a member’s activity changes over ten months.”', html: 'Its later points rest on fewer, older cohorts (month 9 is March alone), so its shape mixes ageing with who the early members were. Check the curve cohort by cohort before reading its tail.' },
    { title: '“November’s cohort is better, so November’s marketing worked.”', html: `A cohort’s lead can be chance (test it, allowing for how many cohorts were compared), a season (look along the diagonal), or a change in who joined (standardise to its mix). Lantern’s November lead is mostly chance: its mix predicts ${pc(STD_NOV)}, against ${pc(m1[NOV])} achieved and ${pc(earlyA / earlyN)} before. Even a real lead is an association; only a planned comparison shows what an action did.` },
    { title: '“Online members are more active overall, so online sign-up is better.”', html: 'If one group’s customers are mostly from older cohorts, its overall share active is lower even when it leads at every age: Simpson’s paradox. Compare at the same age or standardise to a common cohort mix.' },
    { title: '“Months since joining is what DATEDIF counts.”', html: 'DATEDIF counts complete months, so a member who joins on 31 March and visits on 1 April gets 0, not 1. Cohorts by calendar month need <x>=(YEAR(C2)-YEAR(B2))*12+MONTH(C2)-MONTH(B2)</x>.' },
  ],

  application: [
    { case: `February 2028. Lantern’s owner asks Ana for one slide on the app for the quarterly review. The managers want to show the ${int(ACT_DEC)} active members of December; Ana wants the slide to say what a new member is worth and whether that is changing.` },
    { p: `<b>She shows the triangle, not the total.</b> The slide has the share-active triangle with months since joining across the top and the pooled curve beneath it, and one sentence: about ${p0(T.pooled[1].rate)} of joiners come back in their first full month, about a third (${p0(T.pooled[4].rate)}) are still visiting in month 4, and the March cohort was at ${p0(T.retention[MAR][9])} after nine months.` },
    { p: `<b>She flags the two odd cohorts, with their uncertainty.</b> October’s weak first month (${p0(m1[OCT])}) holds up after allowing for nine comparisons; November’s strong one (${p0(m1[NOV])}) doesn’t, and its mix of members explains only about a point of it. Both will be revisited when February’s data are in, and the managers have written down what was different about those months.` },
    { p: `<b>She values a joiner by café.</b> Over the first six months a Harbourside joiner spent ${money(H6.per)} and a Millbrook joiner ${money(M6.per)}, worth ${money(H6.per * (1 - F03.cafes.cogsShare))} and ${money(M6.per * (1 - F03.cafes.cogsShare))} in margin at the cafés’ ${pc(F03.cafes.cogsShare, 0)} cost of goods (F03). Revenue per joiner, decomposed into share active, visits per active member and spend per visit, will be the app’s main measure; <i>Customer lifetime value</i> turns it into a value per member, and <i>Acquisition cost and payback</i> sets it against what a sign-up costs.` },
    { p: '<b>She sets up the comparisons for next year.</b> From March 2028 every cohort can be compared with the same month a year earlier, which separates season from cohort. Any change to how members are signed up will be run so that its cohorts can be compared with cohorts signed up the old way, rather than read off a single good month.' },
  ],

  summary: [
    'A cohort is everyone who joined in the same period; cohort analysis follows each cohort through time, so behaviour after joining isn’t hidden by how many joined.',
    'A left-aligned cohort table has a row per cohort and a column per month since joining (month 0 = the joining month); newer cohorts have fewer months, so it is a triangle. Calendar months run along its diagonals.',
    'Share active, number active and revenue per joiner answer different questions; revenue per joiner = share active × visits per active member × spend per visit.',
    'Read down a column to compare cohorts at the same age; test a cohort’s difference and allow for how many cohorts were compared.',
    'A cohort can differ because of chance, the season (a diagonal pattern), a change in who joined (a mix effect) or genuine differences; all are associations.',
    'Pooled curves and whole-base shares mix cohorts of different ages; comparing groups with different age mixes can reverse a comparison (Simpson’s paradox), so compare at the same age or standardise.',
    'Lantern’s Millbrook members keep coming more often; Harbourside’s spend more per visit and are worth more per joiner over the first six months.',
  ],

  glossary: [
    { term: 'Cohort', def: 'A group of customers who joined, or first bought, in the same period, such as a calendar month, followed together through time.' },
    { term: 'Cohort analysis', def: 'Comparing cohorts of customers at the same age, and following each cohort as it ages, to separate how customers behave after joining from how many joined.' },
    { term: 'Cohort table', def: 'A table with one row per cohort and one column per period, showing a measure such as the share of the cohort active; left-aligned by periods since joining it forms a triangle, because newer cohorts have fewer periods.' },
    { term: 'Left-aligned', def: 'Of a cohort table or chart: laid out by periods since joining rather than by calendar date, so that every cohort starts in the same column and a column compares cohorts at the same age.' },
    { term: 'Pooled curve', def: 'For each period since joining, the customers active divided by the customers who joined, over all cohorts observed that long: a size-weighted average of the cohorts’ curves.' },
    { term: 'Direct standardisation', def: 'Comparing groups by applying one set of rates for each kind of member (from a reference group) to each group’s own mix of members, or one common mix to each group’s rates, so that differences in mix are separated from differences in behaviour.' },
    { term: 'Mix effect', def: 'A change or difference in an overall average that comes from a change in the shares of different kinds of member in the group, rather than from any kind behaving differently.' },
  ],

  references: [
    { text: 'Fader, P. S., Hardie, B. G. S. &amp; Ross, M. (2025). <i>An Excel-Based Companion to “The Customer-Base Audit”</i>, version 1.0 (chapters on cohort analysis: cohort size × % active × order frequency × order value).', url: 'https://www.brucehardie.com/notes/047/the_customer_base_audit_companion_v1.0.pdf', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, 10.4 “Comparing Two Independent Population Proportions”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/10-4-comparing-two-independent-population-proportions', checked: '2026-11-01' },
    { text: 'Microsoft Support. “DATEDIF function” (the “M” unit counts complete months).', url: 'https://support.microsoft.com/en-us/excel/functions/datedif-function', checked: '2026-11-01' },
  ],

  checks: [
    // the triangle
    { what: 'Members', value: N, shown: 2584 },
    { what: 'Cohorts', value: NC, shown: 10 },
    { what: 'March cohort', value: T.cohorts[MAR].size, shown: 242 },
    { what: 'Every member active in month 0', value: Number(T.retention.every((r) => Math.abs(r[0] - 1) < 1e-12)), shown: 1 },
    { what: 'March cohort months', value: T.retention[MAR].length, shown: 10 },
    { what: 'December cohort months', value: T.retention[DEC].length, shown: 1 },
    { what: 'Active March', value: ACT_MAR, shown: 242 },
    { what: 'Active December', value: ACT_DEC, shown: 975 },
    { what: 'Active rose every month to September', value: Number([3, 4, 5, 6, 7, 8].every((mo) => activeIn(`2027-${String(mo).padStart(2, '0')}`) < activeIn(`2027-${String(mo + 1).padStart(2, '0')}`))), shown: 1 },
    { what: 'March m1', value: T.retention[MAR][1] * 100, shown: 60, tol: 0.5 },
    { what: 'March m3', value: T.retention[MAR][3] * 100, shown: 33, tol: 0.5 },
    { what: 'March m9', value: T.retention[MAR][9] * 100, shown: 17, tol: 0.5 },
    { what: 'Mar–Sep m1 min', value: Math.min(...m1Early) * 100, shown: 59, tol: 0.5 },
    { what: 'Mar–Sep m1 max', value: Math.max(...m1Early) * 100, shown: 63, tol: 0.5 },
    { what: 'Every combined row falls after month 1 (the drop flattens)', value: Number(T.retention.every((r) => r.length < 3 || (r[0] - r[1]) > (r[1] - r[2]))), shown: 1 },
    { what: 'Combined rows never rise', value: risesAll, shown: 0 },
    // decomposition
    { what: 'March active April', value: marActive, shown: 146 },
    { what: 'March share April %', value: marActive / marSize * 100, shown: 60.3, tol: 0.05 },
    { what: 'Visits per active', value: perActive, shown: 2.92, tol: 0.005 },
    { what: 'Spend per visit', value: perVisit, shown: 4.00, tol: 0.005 },
    { what: 'Revenue per joiner', value: marRev / marSize, shown: 7.04, tol: 0.005 },
    { what: 'Decomposition holds', value: (marActive / marSize) * perActive * perVisit, shown: marRev / marSize, tol: 1e-9 },
    // columns
    { what: 'October m1', value: m1[OCT] * 100, shown: 49, tol: 0.5 },
    { what: 'October size', value: T.cohorts[OCT].size, shown: 225 },
    { what: 'November m1', value: m1[NOV] * 100, shown: 70, tol: 0.5 },
    { what: 'November m1 1dp', value: m1[NOV] * 100, shown: 69.7, tol: 0.05 },
    { what: 'November size', value: T.cohorts[NOV].size, shown: 221 },
    { what: 'November active m1', value: T.active[NOV][1], shown: 154 },
    { what: 'Early active m1', value: earlyA, shown: 1176 },
    { what: 'Early joiners', value: earlyN, shown: 1936 },
    { what: 'Early m1 %', value: earlyA / earlyN * 100, shown: 60.7, tol: 0.05 },
    { what: 'Cohorts about 250', value: Number(T.cohorts.every((c) => c.size >= 200 && c.size <= 315)), shown: 1 },
    { what: 'Nov z', value: NOVt.z, shown: 2.59, tol: 0.005 },
    { what: 'Nov p', value: NOVt.pValue, shown: 0.010, tol: 0.0005 },
    { what: 'Oct z', value: OCTt.z, shown: -3.30, tol: 0.005 },
    { what: 'Oct p', value: OCTt.pValue, shown: 0.001, tol: 0.0005 },
    { what: 'Nine comparisons', value: NC - 1, shown: 9 },
    { what: 'Bonferroni', value: 0.05 / 9, shown: 0.0056, tol: 0.00005 },
    { what: 'October passes Bonferroni', value: Number(OCTt.pValue < 0.05 / 9), shown: 1 },
    { what: 'November fails Bonferroni', value: Number(NOVt.pValue > 0.05 / 9), shown: 1 },
    { what: 'B06 October joiners', value: 225, shown: 225 },
    { what: 'B06 returned within 30 days', value: VISIT_LIST.length && MEMBER_LIST.filter((m) => m.joinedIso.startsWith('2027-10')).filter((m) => VISIT_LIST.some((v) => v.id === m.id && v.day > m.joined && v.day <= m.joined + 30)).length, shown: 121 },
    // mix
    { what: 'Nov Millbrook %', value: cMill[0] * 100, shown: 74, tol: 0.5 },
    { what: 'Early Millbrook %', value: cMill[1] * 100, shown: 64, tol: 0.5 },
    { what: 'Nov near %', value: cNear[0] * 100, shown: 47, tol: 0.5 },
    { what: 'Early near %', value: cNear[1] * 100, shown: 40, tol: 0.5 },
    { what: 'Nov notifications %', value: cNotif[0] * 100, shown: 61, tol: 0.5 },
    { what: 'Early notifications %', value: cNotif[1] * 100, shown: 55, tol: 0.5 },
    { what: 'Millbrook Nov m1 %', value: millNov * 100, shown: 73, tol: 0.5 },
    { what: 'Millbrook early m1 %', value: millEarlyRate * 100, shown: 63, tol: 0.5 },
    { what: 'Millbrook pooled m1 above Harbourside', value: Number(TM.pooled[1].rate > TH.pooled[1].rate), shown: 1 },
    { what: 'Near members visit more (mean visits)', value: Number((() => { const ms = MEMBER_LIST.filter((m) => m.joinedIso < '2027-10-01'); const vis = new Map(); VISIT_LIST.forEach((v) => vis.set(v.id, (vis.get(v.id) || 0) + 1)); const mv = (f) => { const g = ms.filter(f); return sum(g.map((m) => vis.get(m.id))) / g.length; }; return mv((m) => m.near) > mv((m) => !m.near) && mv((m) => m.notifications) > mv((m) => !m.notifications) && mv((m) => m.cafe === 'Millbrook') > mv((m) => m.cafe === 'Harbourside'); })()), shown: 1 },
    // seasonality
    { what: 'Harbourside footfall July', value: SEAS.fhJul, shown: 1.34, tol: 0.005 },
    { what: 'Harbourside footfall December', value: SEAS.fhDec, shown: 0.75, tol: 0.005 },
    { what: 'Millbrook footfall July', value: SEAS.fmJul, shown: 1.09, tol: 0.005 },
    { what: 'Millbrook footfall December', value: SEAS.fmDec, shown: 1.04, tol: 0.005 },
    { what: 'H visits per active July', value: SEAS.hJul, shown: 2.82, tol: 0.005 },
    { what: 'H visits per active August', value: SEAS.hAug, shown: 2.78, tol: 0.005 },
    { what: 'H visits per active December', value: SEAS.hDec, shown: 2.08, tol: 0.005 },
    { what: 'M visits per active July', value: SEAS.mJul, shown: 3.24, tol: 0.005 },
    { what: 'M visits per active August', value: SEAS.mAug, shown: 3.36, tol: 0.005 },
    { what: 'M visits per active December', value: SEAS.mDec, shown: 3.14, tol: 0.005 },
    { what: 'Harbourside peaks in summer and is lowest in December', value: Number([7, 8, 5].includes(hPeak) && hLow === 12), shown: 1 },
    { what: 'Harbourside range wider than Millbrook’s', value: Number(SEAS.hJul - SEAS.hDec > SEAS.mJul - SEAS.mDec), shown: 1 },
    { what: 'December step smaller than each older cohort’s average earlier step', value: Number(early.every((i) => { const r = T.retention[i]; const st = r.slice(2).map((v, k) => r[k + 1] - v); return st[st.length - 1] < sum(st.slice(0, -1)) / (st.length - 1); })), shown: 1 },
    { what: 'Harbourside March footfall', value: SEAS.fhMar, shown: 0.66, tol: 0.005 },
    { what: 'Only March quieter than December at Harbourside', value: Number([3, 4, 5, 6, 7, 8, 9, 10, 11].filter((mo) => footIdx('Harbourside', mo) < SEAS.fhDec).join() === '3'), shown: 1 },
    { what: 'Standardised November %', value: STD_NOV * 100, shown: 61.7, tol: 0.05 },
    { what: 'Standardised rate far below November’s actual (mix explains under 3 of 9 points)', value: Number(STD_NOV - earlyA / earlyN < 0.03 && m1[NOV] - STD_NOV > 0.06), shown: 1 },
    { what: 'Mix explains about 1 point', value: Math.round((STD_NOV - earlyA / earlyN) * 100), shown: 1 },
    { what: 'Lead points', value: Math.round((m1[NOV] - earlyA / earlyN) * 100), shown: 9 },
    { what: 'Millbrook Nov z', value: millNovT.z, shown: 2.49, tol: 0.005 },
    { what: 'Millbrook Nov p', value: millNovT.pValue, shown: 0.013, tol: 0.0005 },
    { what: 'Millbrook Nov fails Bonferroni', value: Number(millNovT.pValue > 0.05 / 9), shown: 1 },
    { what: 'Millbrook Nov near %', value: mNear[0] * 100, shown: 49, tol: 0.5 },
    { what: 'Millbrook early near %', value: mNear[1] * 100, shown: 45, tol: 0.5 },
    { what: 'Millbrook Nov notif %', value: mNotif[0] * 100, shown: 62, tol: 0.5 },
    { what: 'Millbrook early notif %', value: mNotif[1] * 100, shown: 55, tol: 0.5 },
    // pooled
    { what: 'Pooled m9', value: T.pooled[9].rate * 100, shown: 17, tol: 0.5 },
    { what: 'Pooled m9 is March alone', value: T.pooled[9].cohorts, shown: 1 },
    { what: 'Pooled m1 cohorts', value: T.pooled[1].cohorts, shown: 9 },
    { what: 'Pooled m1', value: T.pooled[1].rate * 100, shown: 60, tol: 0.5 },
    { what: 'Pooled m4', value: T.pooled[4].rate * 100, shown: 33, tol: 0.5 },
    { what: 'Old share April %', value: OLD_APR * 100, shown: 60.3, tol: 0.05 },
    { what: 'Old share December %', value: OLD_DEC * 100, shown: 32.5, tol: 0.05 },
    { what: 'Month 1 near 60% except October and November (all others 58–64%)', value: Number(m1.slice(0, NC - 1).every((v, i) => i === OCT || i === NOV || (v > 0.58 && v < 0.64))), shown: 1 },
    // cafés
    { what: 'Millbrook pooled m1 %', value: TM.pooled[1].rate * 100, shown: 62.9, tol: 0.05 },
    { what: 'Harbourside pooled m1 %', value: TH.pooled[1].rate * 100, shown: 56.0, tol: 0.05 },
    { what: 'H revenue per joiner m1', value: revPooled(TH, 1), shown: 8.49, tol: 0.005 },
    { what: 'M revenue per joiner m1', value: revPooled(TM, 1), shown: 7.58, tol: 0.005 },
    { what: 'H six-month joiners', value: H6.n, shown: 497 },
    { what: 'M six-month joiners', value: M6.n, shown: 874 },
    { what: 'H six-month cohorts are March to July', value: H6.k, shown: 5 },
    { what: 'H six-month per joiner', value: H6.per, shown: 40.09, tol: 0.005 },
    { what: 'M six-month per joiner', value: M6.per, shown: 31.91, tol: 0.005 },
    { what: 'H rises', value: risesH, shown: 4 },
    { what: 'H six-month margin', value: H6.per * (1 - F03.cafes.cogsShare), shown: 27.66, tol: 0.005 },
    { what: 'M six-month margin', value: M6.per * (1 - F03.cafes.cogsShare), shown: 22.02, tol: 0.005 },
    { what: 'Harbourside joiner worth more over six months', value: Number(H6.per > M6.per), shown: 1 },
    { what: 'H April m1', value: hApr[1] * 100, shown: 54, tol: 0.5 },
    { what: 'H April m2', value: hApr[2] * 100, shown: 58, tol: 0.5 },
    // simple example
    { what: 'CY Jan', value: Number(cyTable[0].act.join() === '4,2,2,1'), shown: 1 },
    { what: 'CY Feb', value: Number(cyTable[1].act.join() === '4,2,2'), shown: 1 },
    { what: 'CY Mar', value: Number(cyTable[2].act.join() === '2,1'), shown: 1 },
    { what: 'CY pooled m1', value: cyPooled1 * 100, shown: 50, tol: 0.5 },
    // challenging example
    { what: 'Store overall', value: osAll('store') * 100, shown: 34 },
    { what: 'Online overall', value: osAll('online') * 100, shown: 41 },
    { what: 'Store Jan', value: osRate('store', 0) * 100, shown: 30 },
    { what: 'Online Jan', value: osRate('online', 0) * 100, shown: 25 },
    { what: 'Store Jun', value: osRate('store', 1) * 100, shown: 50 },
    { what: 'Online Jun', value: osRate('online', 1) * 100, shown: 45 },
    { what: 'Store standardised', value: osStd('store') * 100, shown: 40 },
    { what: 'Online standardised', value: osStd('online') * 100, shown: 35 },
    { what: '80% of store in January', value: 400 / 500 * 100, shown: 80 },
  ],
};
