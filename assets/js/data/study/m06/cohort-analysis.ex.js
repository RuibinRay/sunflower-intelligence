// cohort-analysis.ex.js — M06 · Cohort analysis: widgets, practice and the knowledge check (answer keys live here).
// The cohort widget takes core/customer.js cohortTable() for both cafés and each café (case.js joinMap, VISIT_LIST).
// Worksheet items use four members' visits (dates as serial numbers, which the marking copies move by whole months) and
// the first ten members by id of the June, July and August cohorts with their visits and spend in month 1 (cohort names
// are text, so the items that pick one `vary` that cell). Pellbrook Cinema Club, Hartsease Books and Wrenlow Gym are
// fictional. Every num item's `check` recomputes its answer.
import { MEMBER_LIST, VISIT_LIST, joinMap } from './case.js?v=28';
import * as CU from '../../../core/customer.js?v=28';
import { propTest2 } from '../../../core/inference.js?v=28';
import { isoToSerial } from '../../../core/sheet.js?v=28';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const money = (v) => `$${v.toFixed(2)}`;

// ---------------------------------------------------------------- cohort tables
const T = CU.cohortTable(joinMap(), VISIT_LIST);
const TH = CU.cohortTable(joinMap({ cafe: 'Harbourside' }), VISIT_LIST);
const TM = CU.cohortTable(joinMap({ cafe: 'Millbrook' }), VISIT_LIST);
const ci = (label) => T.cohorts.findIndex((c) => c.label === label);
const JUN = ci('2027-06'), AUG = ci('2027-08');
const byId = new Map(MEMBER_LIST.map((m) => [m.id, m]));

export const widgets = {
  'coh-table': {
    type: 'cohort', title: 'Lantern’s loyalty-app members by joining month, to 31 December 2027',
    tables: { 'Both cafés': T, Harbourside: TH, Millbrook: TM },
    view: 'retention', curves: ['2027-10', '2027-11'],
    note: 'A member is active in a month if they made at least one visit with the app in it; month 0 is the joining month, when every member is active because the join is a visit. Revenue per joiner is the cohort’s spend in the month divided by the number who joined. The bottom row pools every cohort observed that long.',
  },
  'coh-mix': {
    type: 'formula', title: 'A mix effect: two groups, two cohorts',
    intro: 'Group B is behind group A by the gap you set in both cohorts. How each group’s members split between the older and the newer cohort decides who leads overall.',
    inputs: [
      { id: 'old', label: 'Group A: share active, older cohort', min: 10, max: 60, step: 1, value: 30, fmt: 'pct' },
      { id: 'young', label: 'Group A: share active, newer cohort', min: 30, max: 90, step: 1, value: 50, fmt: 'pct' },
      { id: 'gap', label: 'Group B’s lead in each cohort (negative: B behind)', min: -10, max: 10, step: 1, value: -5, fmt: 'pct' },
      { id: 'ma', label: 'Share of group A from the older cohort', min: 0, max: 100, step: 5, value: 80, fmt: 'pct' },
      { id: 'mb', label: 'Share of group B from the older cohort', min: 0, max: 100, step: 5, value: 20, fmt: 'pct' },
    ],
    compute: (x) => {
      const bo = x.old + x.gap, by = x.young + x.gap;
      if (bo < 0 || by > 100) return { error: 'Group B’s shares active must stay between 0% and 100%.' };
      const a = (x.ma / 100) * x.old + (1 - x.ma / 100) * x.young, b = (x.mb / 100) * bo + (1 - x.mb / 100) * by;
      const sa = 0.5 * (x.old + x.young), sb = 0.5 * (bo + by);
      const lead = (d) => (d > 0 ? 'B ahead' : d < 0 ? 'A ahead' : 'level');
      return {
        headline: { label: 'Overall share active: A against B', value: `${a.toFixed(1)}% against ${b.toFixed(1)}%` },
        rows: [
          ['Within each cohort', lead(x.gap)],
          ['Overall', lead(b - a)],
          ['Standardised to a 50:50 mix of cohorts', `A ${sa.toFixed(1)}%, B ${sb.toFixed(1)}%`],
        ],
        note: Math.sign(b - a) !== Math.sign(x.gap) && x.gap !== 0
          ? 'The overall comparison reverses the within-cohort one: Simpson’s paradox. The group with more members from the older cohort is pulled down by their age, not by how it behaves.'
          : 'The overall comparison points the same way as the within-cohort one here. Make the groups’ mixes more different to see it reverse.',
        chart: { kind: 'bar', x: { label: '', values: ['Older cohort', 'Newer cohort', 'Overall'] }, series: [{ name: 'Group A', values: [x.old, x.young, a] }, { name: 'Group B', values: [bo, by, b] }], y: { label: 'Share active (%)' } },
      };
    },
  },
};

// ---------------------------------------------------------------- worksheets
// four members' visits
const FOUR = ['A0223', 'A0224', 'A0229', 'A0459'];
const VROWS = VISIT_LIST.filter((v) => FOUR.includes(v.id));
const nv = VROWS.length, LV = nv + 1;
const visitCells = { A1: 'member', B1: 'joined', C1: 'visit date', D1: 'spend ($)', E1: 'months since joining',
  ...col('A', 2, VROWS.map((v) => v.id)), ...col('B', 2, VROWS.map((v) => isoToSerial(byId.get(v.id).joinedIso))), ...col('C', 2, VROWS.map((v) => isoToSerial(v.date))), ...col('D', 2, VROWS.map((v) => v.amount)) };
const monthsSince = (v) => { const j = byId.get(v.id).joinedIso; return (+v.date.slice(0, 4) - +j.slice(0, 4)) * 12 + (+v.date.slice(5, 7) - +j.slice(5, 7)); };
const a223 = VROWS.filter((v) => v.id === 'A0223');
const dm = (iso) => `${+iso.slice(8)} ${['January','February','March','April','May','June','July','August','September','October','November','December'][+iso.slice(5, 7) - 1]}`;
// thirty members: the first ten by id from the June, July and August cohorts, with month-1 visits and spend
const COH = [['2027-06', 'June'], ['2027-07', 'July'], ['2027-08', 'August']];
const m1Of = (m) => { const mo = +m.joinedIso.slice(5, 7) + 1, ym = `2027-${String(mo).padStart(2, '0')}`; const v = VISIT_LIST.filter((x) => x.id === m.id && x.date.startsWith(ym)); return { visits: v.length, spend: r2(sum(v.map((x) => x.amount))) }; };
const MROWS = COH.flatMap(([lab, name]) => MEMBER_LIST.filter((m) => m.joinedIso.startsWith(lab)).slice(0, 10).map((m) => ({ id: m.id, cohort: name, ...m1Of(m) })));
const nm = MROWS.length, LM = nm + 1;
const memberCells = { A1: 'member', B1: 'cohort', C1: 'visits in month 1', D1: 'spend in month 1 ($)',
  ...col('A', 2, MROWS.map((r) => r.id)), ...col('B', 2, MROWS.map((r) => r.cohort)), ...col('C', 2, MROWS.map((r) => r.visits)), ...col('D', 2, MROWS.map((r) => r.spend)) };
const Wm = { A: 8, B: 9, C: 15, D: 17, F: 18, G: 10 };
const shareActive = (name) => { const g = MROWS.filter((r) => r.cohort === name); return g.filter((r) => r.visits > 0).length / g.length; };
const revJoiner = (name) => { const g = MROWS.filter((r) => r.cohort === name); return sum(g.map((r) => r.spend)) / g.length; };

// ---------------------------------------------------------------- Lantern figures for the num items
const Jk = 3, Jact = T.active[JUN][Jk], Jsize = T.cohorts[JUN].size;
const AUGv = VISIT_LIST.filter((v) => byId.get(v.id).joinedIso.startsWith('2027-08') && v.date.startsWith('2027-09'));
const Aact = T.active[AUG][1], Asize = T.cohorts[AUG].size, Avis = AUGv.length, Arev = T.revenue[AUG][1];
const HM = { ha: TH.pooled[1].active, hn: TH.pooled[1].size, ma: TM.pooled[1].active, mn: TM.pooled[1].size };
const HMt = propTest2(HM.ma, HM.mn, HM.ha, HM.hn);

// fictional
const PC = [[500, 0.40], [200, 0.55], [300, 0.50]];             // Pellbrook Cinema Club: [size, month-2 share active]
const pcPooled = sum(PC.map(([n, a]) => n * a)) / sum(PC.map(([n]) => n));
const pcMean = sum(PC.map(([, a]) => a)) / PC.length;
const HB = { email: [[300, 0.20], [100, 0.40]], social: [[100, 0.18], [300, 0.36]] };   // Hartsease Books: [older, newer] cohorts
const hbAll = (g) => sum(HB[g].map(([n, a]) => n * a)) / sum(HB[g].map(([n]) => n));

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm06-coh-g1', type: 'steps', kind: 'numerical',
    prompt: `Columns A to D list every visit of four Lantern members: their joining date, each visit’s date and its spend. The first visit is the join. Work out each visit’s month since joining.`,
    solution: `<x>=(YEAR(C2)-YEAR(B2))*12+MONTH(C2)-MONTH(B2)</x>, filled down. A0223 joined on ${dm(byId.get('A0223').joinedIso)} and visited on ${dm(a223[1].date)}: month ${monthsSince(a223[1])}, although only ${CU.dayNum(a223[1].date) - CU.dayNum(byId.get('A0223').joinedIso)} days had passed. <x>=DATEDIF(B2,C2,"m")</x> would give 0, because it counts complete months.`,
    steps: [
      {
        id: 'm06-coh-g1-s1', type: 'formula',
        prompt: `In E2, calculate the visit’s month since joining by calendar month (0 for a visit in the joining month, 1 for the next calendar month), so that it fills down to E${LV}.`,
        sheet: { cells: visitCells }, cell: 'E2', fill: `E2:E${LV}`,
        answer: '=(YEAR(C2)-YEAR(B2))*12+MONTH(C2)-MONTH(B2)',
        alt: ['=12*(YEAR(C2)-YEAR(B2))+(MONTH(C2)-MONTH(B2))', '=(YEAR(C2)*12+MONTH(C2))-(YEAR(B2)*12+MONTH(B2))'],
        view: `A1:E${LV}`, formats: { B: 'date', C: 'date', D: '0.00', E: '0' }, widths: { A: 8, B: 12, C: 12, D: 9, E: 20 },
        wrong: [
          { formula: '=DATEDIF(B2,C2,"m")', say: `DATEDIF counts complete months: a member who joins on ${dm(byId.get('A0223').joinedIso)} and visits on ${dm(a223[1].date)} gets 0. Cohorts are by calendar month, so compare the years and months: (YEAR − YEAR) × 12 + MONTH − MONTH.` },
          { formula: '=(C2-B2)/30', say: 'Days ÷ 30 is neither calendar months nor whole months. Use the years and months of the two dates.' },
          { formula: '=ROUNDDOWN((C2-B2)/30,0)', say: 'That approximates complete months from days. A cohort table counts calendar months: (YEAR − YEAR) × 12 + MONTH − MONTH.' },
        ],
        hints: ['Month number of the visit minus month number of the join, with 12 for every year between.', '<x>=(YEAR(C2)-YEAR(B2))*12+MONTH(C2)-MONTH(B2)</x>.'],
      },
      {
        id: 'm06-coh-g1-s2', type: 'num',
        prompt: `A0223’s visits fall in months ${a223.map(monthsSince).join(', ')} since joining. In how many of months 1 to 9 was A0223 active?`,
        answer: new Set(a223.map(monthsSince).filter((k) => k >= 1)).size, check: () => new Set(a223.map(monthsSince).filter((k) => k >= 1 && k <= 9)).size, unit: 'months', places: 0, tol: 0,
        wrong: [{ value: a223.filter((v) => monthsSince(v) >= 1).length, say: 'That counts visits. A member is active in a month if they made at least one visit in it, however many.' }],
        hints: ['Count distinct months, not visits.', `The distinct months from 1 up: ${[...new Set(a223.map(monthsSince).filter((k) => k >= 1))].join(', ')}.`],
      },
    ],
  },
  {
    id: 'm06-coh-g2', type: 'steps', kind: 'numerical',
    prompt: `Columns A to D hold the first ten members by id of Lantern’s June, July and August 2027 cohorts, with their visits and spend in month 1 (the calendar month after they joined). G1 names a cohort.`,
    solution: `Share active: <x>=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")/COUNTIF(B2:B${LM},G1)</x>; for June’s ten, ${pc(shareActive('June'), 0)}. Revenue per joiner: <x>=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIF(B2:B${LM},G1)</x>, ${money(revJoiner('June'))}. Ten members per cohort make these rough: the full June cohort’s month 1 was ${pc(T.retention[JUN][1], 0)}.`,
    steps: [
      {
        id: 'm06-coh-g2-s1', type: 'formula',
        prompt: 'In G2, calculate the share of the cohort named in G1 who were active in month 1.',
        sheet: { cells: { ...memberCells, F1: 'cohort', G1: 'June', F2: 'share active, month 1' }, vary: { G1: ['July', 'August'] } }, cell: 'G2',
        answer: `=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")/COUNTIF(B2:B${LM},G1)`,
        alt: [`=COUNTIFS(B2:B${LM},G1,C2:C${LM},">=1")/COUNTIFS(B2:B${LM},G1)`, `=SUMPRODUCT((B2:B${LM}=G1)*(C2:C${LM}>0))/COUNTIF(B2:B${LM},G1)`],
        view: `A1:G${LM}`, formats: { G2: '0%' }, widths: Wm,
        wrong: [
          { formula: `=AVERAGEIFS(C2:C${LM},B2:B${LM},G1)`, say: 'That is visits per member who joined, not the share active. Count the members with at least one visit and divide by the cohort’s size.' },
          { formula: `=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")`, say: 'That is the number active. Divide by the number who joined to make it a share.' },
          { formula: `=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")/COUNTIF(C2:C${LM},">0")`, say: 'That divides by everyone active across the three cohorts. A share active divides by the cohort’s own size.' },
        ],
        hints: ['Share active = members with a visit ÷ members who joined.', `<x>=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")/COUNTIF(B2:B${LM},G1)</x>.`],
      },
      {
        id: 'm06-coh-g2-s2', type: 'formula',
        prompt: 'In G3, calculate the cohort’s revenue per joiner in month 1.',
        sheet: { cells: { ...memberCells, F1: 'cohort', G1: 'June', F2: 'share active, month 1', G2: `=COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")/COUNTIF(B2:B${LM},G1)`, F3: 'revenue per joiner' }, vary: { G1: ['July', 'August'] } }, cell: 'G3',
        answer: `=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIF(B2:B${LM},G1)`,
        alt: [`=AVERAGEIFS(D2:D${LM},B2:B${LM},G1)`, `=AVERAGEIF(B2:B${LM},G1,D2:D${LM})`],
        view: `A1:G${LM}`, formats: { G2: '0%', G3: '$#,##0.00' }, widths: Wm,
        wrong: [
          { formula: `=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")`, say: 'That is spend per active member. Revenue per joiner divides by everyone who joined, active or not.' },
          { formula: `=SUMIFS(D2:D${LM},B2:B${LM},G1)`, say: 'That is the cohort’s total. Divide by the number who joined.' },
        ],
        hints: ['Revenue per joiner = the cohort’s spend in the month ÷ the cohort’s size.', `<x>=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIF(B2:B${LM},G1)</x>.`],
      },
    ],
  },
  {
    id: 'm06-coh-g3', type: 'steps', kind: 'numerical',
    prompt: `In September, its month 1, Lantern’s August cohort (${Asize} members) had ${Aact} members active, who made ${Avis} visits and spent ${money(Arev)}. Decompose its revenue per joiner.`,
    solution: `Share active ${Aact} ÷ ${Asize} = ${pc(Aact / Asize)}; visits per active member ${Avis} ÷ ${Aact} = ${r2(Avis / Aact)}; spend per visit ${money(Arev)} ÷ ${Avis} = ${money(Arev / Avis)}. Product: ${(Aact / Asize).toFixed(3)} × ${(Avis / Aact).toFixed(2)} × ${(Arev / Avis).toFixed(2)} = ${money(Arev / Asize)}, which is ${money(Arev)} ÷ ${Asize}.`,
    steps: [
      {
        id: 'm06-coh-g3-s1', type: 'num', prompt: 'How many visits did each active member make? Give two decimal places.',
        answer: r2(Avis / Aact), check: () => Avis / Aact, unit: 'visits', places: 2, tol: 0.01,
        wrong: [{ value: r2(Avis / Asize), say: 'That divides by everyone who joined. Visits per active member divides by the members who were active.' }],
        hints: ['Visits ÷ active members.', `${Avis} ÷ ${Aact}.`],
      },
      {
        id: 'm06-coh-g3-s2', type: 'num', prompt: 'What was the cohort’s revenue per joiner in month 1? Give dollars and cents.',
        answer: r2(Arev / Asize), check: () => Arev / Asize, unit: '$', places: 2, tol: 0.01,
        wrong: [
          { value: r2(Arev / Aact), say: 'That is spend per active member. Revenue per joiner divides by everyone who joined.' },
          { value: r2(Arev / Avis), say: 'That is spend per visit, the last of the three parts.' },
        ],
        hints: ['Revenue ÷ members who joined; or share active × visits per active × spend per visit.', `${money(Arev)} ÷ ${Asize}.`],
      },
    ],
  },
  {
    id: 'm06-coh-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Wrenlow Gym (fictional) tracks members’ monthly visits by joining-month cohort in a left-aligned table. What does each pattern most likely point to?',
    items: [
      'Every cohort’s share active dips in the same calendar month, August, whatever its age.',
      'The March cohort is below every other cohort at every age, from month 1 onwards.',
      'The share of all members active falls each month, while each cohort’s month-1 share stays at about the same level.',
      'A cohort that joined during a campaign aimed at students is lower at every age, and was 70% students against 30% usually.',
    ],
    categories: ['A calendar (seasonal) effect', 'A difference in the cohort itself', 'The base getting older', 'A change in who joined (mix)'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'An effect of the calendar appears on a diagonal of a left-aligned table: every cohort in the same calendar month.',
      1: 'An effect that follows one cohort along its row, at every age, is about that cohort.',
      2: 'A whole-base share falls as older members, who are less often active, become a bigger part of the base.',
      3: 'When the cohort’s make-up changed, its difference may come from who joined; compare like with like within the student and non-student members.',
    },
    hints: ['Diagonal or row?', 'Does the pattern follow the calendar, the cohort, the base’s age or the cohort’s make-up?'],
    solution: 'August dip in every cohort: season. March low at every age: the cohort. Whole-base share falling with steady cohorts: the base ageing. Student-heavy campaign cohort: a change in mix (it could also be the campaign; within-group comparisons help separate them).',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'm06-coh-i1', type: 'num', kind: 'numerical',
    prompt: 'Pellbrook Cinema Club (fictional) has three cohorts with 500, 200 and 300 members, and 40%, 55% and 50% of them active in month 2. What is the pooled share active in month 2? Give a percentage to one decimal place.',
    answer: r1(pcPooled * 100), check: () => (500 * 0.4 + 200 * 0.55 + 300 * 0.5) / 1000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: r1(pcMean * 100), say: 'That is the plain mean of the three shares. The pooled curve weights each cohort by its size: active members ÷ members who joined.' }],
    solution: `Active: 500 × 0.40 + 200 × 0.55 + 300 × 0.50 = ${500 * 0.4 + 200 * 0.55 + 300 * 0.5} of 1,000 members, ${pc(pcPooled)}. The plain mean of the shares (${pc(pcMean)}) gives the small 200-member cohort as much weight as the 500-member one.`,
  },
  {
    id: 'm06-coh-i2', type: 'num', kind: 'numerical',
    prompt: `Lantern’s June cohort had ${Jsize} members, and ${Jact} of them visited in September. What share of the cohort was active in month ${Jk}? Give a percentage to one decimal place.`,
    answer: r1(Jact / Jsize * 100), check: () => Jact / Jsize * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: r1((1 - Jact / Jsize) * 100), say: 'That is the share not active. Share active = active ÷ joined.' }],
    solution: `September is month 3 for a June cohort (September − June). ${Jact} ÷ ${Jsize} = ${pc(Jact / Jsize)}.`,
  },
  {
    id: 'm06-coh-i3', type: 'num', kind: 'applied',
    prompt: `Hartsease Books (fictional) compares app members who signed up from an email with those from social media. Email: 300 members in the older cohort (20% active this month) and 100 in the newer (40%). Social: 100 in the older (18%) and 300 in the newer (36%). By how many percentage points does social lead email overall (negative if it trails)? Give one decimal place.`,
    answer: r1((hbAll('social') - hbAll('email')) * 100), check: () => ((100 * 0.18 + 300 * 0.36) / 400 - (300 * 0.2 + 100 * 0.4) / 400) * 100, unit: 'points', places: 1, tol: 0.05,
    wrong: [{ value: -2, say: 'Within each cohort email leads by 2 or 4 points, but the question asks about the overall shares, which weight each cohort by its members.' }],
    solution: `Email overall (60 + 40) ÷ 400 = ${pc(hbAll('email'))}; social (18 + 108) ÷ 400 = ${pc(hbAll('social'))}: social leads by ${r1((hbAll('social') - hbAll('email')) * 100)} points, although email is ahead within both cohorts. Social’s members are mostly from the newer cohort: a mix effect, Simpson’s paradox. Compare cohort by cohort.`,
  },
  {
    id: 'm06-coh-i4', type: 'num', kind: 'numerical',
    prompt: `Pooled over the cohorts, ${HM.ma} of ${HM.mn.toLocaleString('en-US')} Millbrook joiners and ${HM.ha} of ${HM.hn} Harbourside joiners were active in month 1. Calculate the two-proportion z statistic for Millbrook minus Harbourside, with the pooled standard error. Give two decimal places.`,
    answer: r2(HMt.z), check: () => { const p1 = HM.ma / HM.mn, p2 = HM.ha / HM.hn, p = (HM.ma + HM.ha) / (HM.mn + HM.hn); return (p1 - p2) / Math.sqrt(p * (1 - p) * (1 / HM.mn + 1 / HM.hn)); }, unit: '', places: 2, tol: 0.01,
    wrong: [{ value: r2(-HMt.z), say: 'The sign: the question asks for Millbrook minus Harbourside.' }],
    solution: `p̂ Millbrook ${pc(HM.ma / HM.mn)}, Harbourside ${pc(HM.ha / HM.hn)}; pooled p = ${(HM.ma + HM.ha)} ÷ ${HM.mn + HM.hn} = ${HMt.pool.toFixed(3)}; SE = √(${HMt.pool.toFixed(3)} × ${(1 - HMt.pool).toFixed(3)} × (1/${HM.mn} + 1/${HM.hn})) = ${HMt.sePool.toFixed(4)}; z = ${r2(HMt.z)}, p ${HMt.pValue < 0.001 ? 'below 0.001' : `= ${HMt.pValue.toFixed(3)}`}. Millbrook members are more often active in month 1, an association between café and behaviour, not an effect of moving a member.`,
  },
  {
    id: 'm06-coh-i5', type: 'mc', kind: 'conceptual',
    prompt: 'In Lantern’s left-aligned cohort table, which comparison tells you whether newer cohorts are keeping members better than older ones?',
    options: [
      'Down a column: each cohort’s share active at the same number of months since joining',
      'Along the last diagonal: every cohort’s share active in December, the latest month observed',
      'The pooled curve’s last point against its first point, which spans the whole year',
      'The number of active members in each cohort’s most recent month',
    ],
    answer: 0,
    feedback: {
      1: 'December is a different age for every cohort, month 9 for March and month 1 for November; older cohorts are lower because they are older.',
      2: 'The pooled curve’s last point is the oldest cohort alone; it compares ages, and different members.',
      3: 'Counts depend on cohort size and age, not only on how well a cohort keeps members.',
    },
    solution: 'A column compares cohorts at the same age on the same measure; that is the like-for-like comparison.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'm06-coh-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In a left-aligned cohort table by joining month, where do the cells for a single calendar month, say July, lie?',
    options: ['On a diagonal running across the cohorts', 'In a single column, the one for month 4 since joining', 'In a single row, the July cohort’s', 'In the bottom row, where the pooled curve is'],
    answer: 0,
    feedback: { 1: 'A column is one age (months since joining) across cohorts, which falls in a different calendar month for each.', 2: 'A row is one cohort as it ages.', 3: 'The pooled row averages each age across cohorts; it mixes calendar months.' },
    solution: 'July is month 4 for March joiners, month 3 for April joiners and so on: a diagonal. Seasonal effects show there.',
  },
  {
    id: 'm06-coh-k2', type: 'num', kind: 'numerical',
    prompt: 'Wrenlow Gym’s (fictional) January cohort has 400 members. In month 2, 180 were active, making 630 visits and spending $4,410 on classes and drinks. What were the visits per active member? Give two decimal places.',
    answer: 3.5, check: () => 630 / 180, unit: 'visits', places: 2, tol: 0.01,
    wrong: [{ value: r2(630 / 400), say: 'That divides by all 400 who joined. Visits per active member divides by the 180 active.' }, { value: 24.5, say: 'That is spend per active member ($4,410 ÷ 180).' }],
    solution: '630 ÷ 180 = 3.50 visits. The full decomposition: share active 180 ÷ 400 = 45%, visits per active 3.50, spend per visit $4,410 ÷ 630 = $7.00; revenue per joiner 0.45 × 3.50 × $7.00 = $11.03, which is $4,410 ÷ 400 to the cent.',
  },
  {
    id: 'm06-coh-k3', type: 'mc', kind: 'applied',
    prompt: `Lantern’s active app members rose from ${new Set(VISIT_LIST.filter((v) => v.date.startsWith('2027-03')).map((v) => v.id)).size} in March to ${new Set(VISIT_LIST.filter((v) => v.date.startsWith('2027-12')).map((v) => v.id)).size} in December. A manager concludes that members are getting more loyal. What should Ana say?`,
    options: [
      'The total grew because new members joined every month; the cohort table shows each cohort’s share active falling as it ages, so the total says nothing about loyalty',
      'She agrees: more active members means each member is visiting more often',
      'She agrees, as long as the rise is statistically significant',
      'The total should be divided by twelve months to give a monthly loyalty rate',
    ],
    answer: 0,
    feedback: { 1: 'A total mixes how many joined with how they behave; visits per member is a separate measure.', 2: 'Significance doesn’t fix the mix: the total would grow even if every cohort faded faster.', 3: 'Dividing a total by months doesn’t separate joiners from loyalty either.' },
    solution: 'Follow cohorts: the share active in each month since joining shows behaviour after joining, separately from how many joined.',
  },
  {
    id: 'm06-coh-k4', type: 'formula', kind: 'numerical',
    prompt: `The sheet lists the first ten members by id of three Lantern cohorts with their visits and spend in month 1. In G2, calculate the spend per active member in month 1 of the cohort named in G1.`,
    sheet: { cells: { ...memberCells, F1: 'cohort', G1: 'July', F2: 'spend per active member' }, vary: { G1: ['June', 'August'] } }, cell: 'G2',
    answer: `=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")`,
    alt: [`=AVERAGEIFS(D2:D${LM},B2:B${LM},G1,C2:C${LM},">0")`],
    view: `A1:G${LM}`, formats: { G2: '$#,##0.00' }, widths: Wm,
    wrong: [
      { formula: `=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIF(B2:B${LM},G1)`, say: 'That is revenue per joiner, dividing by everyone who joined. Spend per active member divides by those with at least one visit.' },
      { formula: `=SUMIFS(D2:D${LM},B2:B${LM},G1)/SUMIFS(C2:C${LM},B2:B${LM},G1)`, say: 'That is spend per visit. Divide by the number of active members instead.' },
    ],
    solution: `<x>=SUMIFS(D2:D${LM},B2:B${LM},G1)/COUNTIFS(B2:B${LM},G1,C2:C${LM},">0")</x>, or AVERAGEIFS with both conditions. For July’s ten: ${money(sum(MROWS.filter((r) => r.cohort === 'July').map((r) => r.spend)) / MROWS.filter((r) => r.cohort === 'July' && r.visits > 0).length)}.`,
  },
  {
    id: 'm06-coh-k5', type: 'multi', kind: 'conceptual',
    prompt: 'A cohort’s month-1 share active is 9 points above earlier cohorts’. Which of these could explain it without the cohort’s members being any more inclined to come back? Select all that apply.',
    options: [
      'Chance: with about 250 members a share active is uncertain by several points, and many cohorts were compared',
      'Its month 1 fell in a busy calendar month',
      'More of its members joined at the café whose members visit more often',
      'It is the newest cohort, so its later months are not yet observed',
    ],
    answer: [0, 1, 2],
    feedback: { 3: 'Month 1 is observed for it as for the others; unobserved later months don’t change its month 1.' },
    solution: 'Chance, the season and the mix of members can each move a cohort’s figure. The missing later months affect what can be compared, not the month-1 figure itself.',
  },
  {
    id: 'm06-coh-k6', type: 'mc', kind: 'applied',
    prompt: `Lantern’s pooled curve reads ${pc(T.pooled[1].rate, 0)} in month 1 and ${pc(T.pooled[9].rate, 0)} in month 9. Ana wants to project what share of January 2028’s joiners will be active in their ninth month. What is the main caution?`,
    options: [
      'Month 9 rests on one cohort, March 2027’s, whose members may differ from January’s',
      'The pooled curve can’t be used for projections, because a left-aligned table has no calendar dates',
      'Month 9 must be wrong, because a café’s share active should never fall below 20%',
      'Month 1 includes the joining visit, so every pooled figure from month 1 on is too high',
    ],
    answer: 0,
    feedback: { 1: 'Left-alignment is what makes a projection by age possible.', 2: 'There is no floor; the curve is whatever the members did.', 3: 'Month 0 is the joining month and is 100% by construction; month 1 is the next calendar month.' },
    solution: 'The pooled curve’s later points rest on fewer, older cohorts. Use it with that caution, revisit as more cohorts age, or use a model (Survival analysis, Customer lifetime value).',
  },
];
