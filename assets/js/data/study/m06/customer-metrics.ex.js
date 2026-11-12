// customer-metrics.ex.js — M06 · Customer metrics: widgets, practice and the knowledge check (answer keys live here).
// The worksheets slice Lantern's members from case.js: eight members' 35 visits (the visit log), and a customer table of
// 30 members (every 86th, from the fifth). Text cells don't change on the marker's copies, so items that pick a member
// `vary` the member cell. Halverton, Ostler Bike Works and the businesses in the classify item are fictional. Every num
// item's `check` recomputes its answer.
import { VISIT_LIST, members, AS_OF } from './case.js?v=31';
import * as CU from '../../../core/customer.js?v=31';
import { isoToSerial } from '../../../core/sheet.js?v=31';

const ALL = members(), N = ALL.length;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const r2 = (x) => Math.round(x * 100) / 100, r1 = (x) => Math.round(x * 10) / 10;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const row = (id) => ALL.find((m) => m.id === id);
const asOfSerial = isoToSerial(CU.isoDay(AS_OF));

// ---------------------------------------------------------------- the visit log: eight members, 35 visits
const IDS = ['A0002', 'A0006', 'A0769', 'A0774', 'A0780', 'A1694', 'A1763', 'A1867'];
const LOG = VISIT_LIST.filter((v) => IDS.includes(v.id));
const NL = LOG.length, LL = NL + 1;                                  // data rows 2..36
const logCells = {
  A1: 'member', B1: 'date', C1: 'café', D1: 'amount',
  ...col('A', 2, LOG.map((v) => v.id)), ...col('B', 2, LOG.map((v) => isoToSerial(v.date))), ...col('C', 2, LOG.map((v) => v.cafe)), ...col('D', 2, LOG.map((v) => v.amount)),
  F1: 'member', G1: 'visits', H1: 'spend', I1: 'first visit', J1: 'last visit', K1: 'recency', L1: 'tenure', N1: 'as of', N2: asOfSerial,
};
const logFormats = { B: 'date', D: '$#,##0.00', H: '$#,##0.00', I: 'date', J: 'date', N2: 'date' };
const logWidths = { A: 9, B: 12, C: 12, D: 9, F: 9, I: 12, J: 12, N: 12 };
const one = (id) => ({ ...logCells, F2: id });
const VARY = { F2: ['A0774', 'A1867', 'A0006'] };
const lv = (id) => LOG.filter((v) => v.id === id);

// ---------------------------------------------------------------- the customer table: 30 members
const T30 = ALL.filter((_, i) => i % 86 === 5).slice(0, 30);
const NT = T30.length, TL = NT + 1;                                  // rows 2..31
const tabCells = { A1: 'member', B1: 'visits', C1: 'spend', D1: 'recency', ...col('A', 2, T30.map((m) => m.id)), ...col('B', 2, T30.map((m) => m.frequency)), ...col('C', 2, T30.map((m) => m.monetary)), ...col('D', 2, T30.map((m) => m.recency)) };
const tabFormats = { C: '$#,##0.00' };

// ---------------------------------------------------------------- widgets
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const records = ALL.map((m) => ({ Café: m.cafe, Joined: MONTHS[+m.joinedIso.slice(5, 7) - 1], Members: 1, Visits: m.frequency, Spend: m.monetary, Repeater: m.frequency >= 2 ? 1 : 0, 'Active (60 days)': m.recency <= 60 ? 1 : 0 }));

export const widgets = {
  'metr-sheet': {
    type: 'sheet', title: 'Eight members’ visits with the app, 1 March – 31 December 2027',
    sheet: { cells: { ...logCells, ...col('F', 2, IDS) } },
    view: `A1:N${LL}`, editable: true, mark: ['G2:L9'], maxHeight: '26rem',
    formats: logFormats, widths: logWidths,
    tools: ['formulas', 'fill', 'reset'],
    note: 'Try <x>=COUNTIFS($A$2:$A$36,F2)</x> in G2, <x>=SUMIFS($D$2:$D$36,$A$2:$A$36,F2)</x> in H2, <x>=MINIFS($B$2:$B$36,$A$2:$A$36,F2)</x> in I2, <x>=MAXIFS($B$2:$B$36,$A$2:$A$36,F2)</x> in J2, <x>=$N$2-J2</x> in K2 and <x>=$N$2-I2</x> in L2, and fill down to row 9.',
  },
  'metr-pivot': {
    type: 'pivot', title: `Lantern’s ${N.toLocaleString('en-US')} loyalty-app members on 31 December 2027`,
    records,
    fields: ['Café', 'Joined'],
    values: ['Members', 'Visits', 'Spend', 'Repeater', 'Active (60 days)'],
    defaults: { rows: 'Café', cols: null, value: 'Visits', agg: 'sum', show: 'value' },
    order: { Joined: MONTHS.slice(2) },
    formats: { Spend: '$#,##0.00', Repeater: '0.0%', 'Active (60 days)': '0.0%' },
    note: 'Café is where the member joined. Members is 1 for each member, so its Sum counts them; Repeater and Active are 1 or 0, so their Average is a share.',
  },
  'metr-rfm': {
    type: 'rfm', title: 'Recency, frequency and spend: the quintile cut points (31 December 2027)',
    customers: ALL.map((m) => ({ id: m.id, recency: m.recency, frequency: m.frequency, monetary: m.monetary })),
    k: 5, method: 'quantile', show: ['cuts'], unit: 'visits',
    note: 'A value above a cut point is in a higher group. Frequency’s cut points are whole numbers, and every member on a cut point shares a group with the members below it, so the groups are uneven.',
  },
  'metr-dist': {
    type: 'distribution', title: 'Members’ total spend', values: ALL.map((m) => m.monetary), label: 'Spend per member, 1 March – 31 December 2027 ($)',
    transforms: ['none', 'log'],
  },
};

// ---------------------------------------------------------------- guided practice
const G1 = row('A1694');
const AOV4 = ['A0774', 'A0780', 'A1763', 'A1867'].map(row);
const aov4 = sum(AOV4.map((m) => m.monetary)) / sum(AOV4.map((m) => m.frequency));
const mean4 = sum(AOV4.map((m) => m.aov)) / 4;
const OS = [
  ['1001', 'h.ferris@example.com', '2027-04-02', 58.0, ''],
  ['1002', 'p.nolan@example.com', '2027-04-05', 22.5, ''],
  ['1001', 'h.ferris@example.com', '2027-04-19', 31.0, ''],
  ['TEST', 'it@ostler.example', '2027-04-20', 0.01, 'card test'],
  ['', '', '2027-04-21', 14.0, 'card, no account'],
  ['1002', 'p.nolan@example.com', '2027-04-26', -7.5, 'partial refund'],
  ['1044', 'h.ferris@example.com', '2027-05-03', 40.0, 'new account'],
  ['1017', 'd.ahmed@example.com', '2027-05-06', 18.0, ''],
];

export const guided = [
  {
    id: 'm06-metr-g1', type: 'steps', kind: 'numerical',
    prompt: `The worksheet holds eight members’ ${NL} visits: member in column A, date in B, café in C and amount in D, rows 2–${LL}. N2 holds the as-of date, 31 December 2027. Build the customer-table row for the member named in F2, so that each formula works for whichever member F2 names.`,
    solution: `For A1694: <x>=COUNTIFS(A2:A36,F2)</x> gives ${G1.frequency} visits, <x>=SUMIFS(D2:D36,A2:A36,F2)</x> ${money(G1.monetary)}, <x>=MAXIFS(B2:B36,A2:A36,F2)</x> 16 December 2027 and <x>=N2-J2</x> a recency of ${G1.recency} days.`,
    steps: [
      {
        id: 'm06-metr-g1-s1', type: 'formula',
        prompt: 'In G2, count the visits of the member named in F2.',
        sheet: { cells: one('A1694'), vary: VARY }, cell: 'G2', view: `A1:N${LL}`, formats: logFormats, widths: logWidths,
        answer: `=COUNTIFS(A2:A${LL},F2)`,
        alt: [`=COUNTIF(A2:A${LL},F2)`, '=COUNTIFS(A:A,F2)', '=COUNTIF(A:A,F2)'],
        wrong: [
          { formula: `=COUNTIFS(A2:A${LL},"A1694")`, say: 'With the ID typed in, the formula ignores F2. Refer to F2 so it works for any member.' },
          { formula: `=COUNT(B2:B${LL})`, say: 'That counts every visit in the log, all eight members’. Count only the rows whose member matches F2.' },
        ],
        hints: ['COUNTIFS(criteria_range, criterion) counts the rows that match.', `<x>=COUNTIFS(A2:A${LL},F2)</x>.`],
      },
      {
        id: 'm06-metr-g1-s2', type: 'formula',
        prompt: 'In H2, add up the spend of the member named in F2: their monetary value.',
        sheet: { cells: one('A1694'), vary: VARY }, cell: 'H2', view: `A1:N${LL}`, formats: logFormats, widths: logWidths,
        answer: `=SUMIFS(D2:D${LL},A2:A${LL},F2)`,
        alt: [`=SUMIF(A2:A${LL},F2,D2:D${LL})`, '=SUMIFS(D:D,A:A,F2)'],
        wrong: [
          { formula: `=SUMIFS(A2:A${LL},D2:D${LL},F2)`, say: 'The ranges are swapped: SUMIFS takes the range to add first (the amounts in D), then the criteria range (A) and the criterion (F2).' },
          { formula: `=AVERAGEIFS(D2:D${LL},A2:A${LL},F2)`, say: 'That is the member’s average spend per visit. Monetary value here is their total.' },
        ],
        hints: ['SUMIFS(sum_range, criteria_range, criterion).', `<x>=SUMIFS(D2:D${LL},A2:A${LL},F2)</x>.`],
      },
      {
        id: 'm06-metr-g1-s3', type: 'formula',
        prompt: 'In J2, find the date of the member’s last visit.',
        sheet: { cells: one('A1694'), vary: VARY }, cell: 'J2', view: `A1:N${LL}`, formats: logFormats, widths: logWidths,
        answer: `=MAXIFS(B2:B${LL},A2:A${LL},F2)`,
        alt: ['=MAXIFS(B:B,A:A,F2)', `=MAX(IF(A2:A${LL}=F2,B2:B${LL}))`],
        wrong: [
          { formula: `=MAX(B2:B${LL})`, say: 'That is the last visit by anyone in the log. Add the member as a condition with MAXIFS.' },
          { formula: `=MINIFS(B2:B${LL},A2:A${LL},F2)`, say: 'MINIFS gives the first visit (for tenure). Recency needs the last: MAXIFS.' },
        ],
        hints: ['Dates are numbers, so the latest date is the largest.', `<x>=MAXIFS(B2:B${LL},A2:A${LL},F2)</x>.`],
      },
      {
        id: 'm06-metr-g1-s4', type: 'formula',
        prompt: 'J2 now holds the last visit. In K2, calculate the member’s recency in days as of the date in N2.',
        sheet: { cells: { ...one('A1694'), J2: `=MAXIFS(B2:B${LL},A2:A${LL},F2)` }, vary: VARY }, cell: 'K2', view: `A1:N${LL}`, formats: logFormats, widths: logWidths,
        answer: '=N2-J2',
        alt: ['=$N$2-J2', `=N2-MAXIFS(B2:B${LL},A2:A${LL},F2)`, '=DAYS(N2,J2)'],
        wrong: [
          { formula: '=J2-N2', say: 'That is negative: recency is the as-of date minus the last visit.' },
          { formula: `=N2-MINIFS(B2:B${LL},A2:A${LL},F2)`, say: 'That measures back to the first visit, which is tenure. Recency runs to the last.' },
          { formula: '=TODAY()-J2', say: 'Today isn’t the as-of date: the data end on 31 December 2027. Use N2 so the table says what date it describes.' },
        ],
        hints: ['Recency = as-of date − last visit.', '<x>=N2-J2</x>.'],
      },
    ],
  },
  {
    id: 'm06-metr-g2', type: 'num', kind: 'numerical',
    prompt: 'Four members’ rows of the customer table on 31 December 2027 are below. Calculate their average order value as a group.',
    data: { table: { head: ['Member', 'Visits', 'Spend', 'Spend per visit'], align: ['l', 'r', 'r', 'r'], rows: AOV4.map((m) => [m.id, String(m.frequency), money(m.monetary), money(m.aov)]) } },
    answer: r2(aov4), check: () => sum(AOV4.map((m) => m.monetary)) / sum(AOV4.map((m) => m.frequency)), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: r2(mean4), say: 'That is the mean of the four members’ own averages, which gives a member with 5 visits as much weight as one with 7. Divide total spend by total visits.' }],
    hints: ['Average order value = total spend ÷ total purchases.', `(${AOV4.map((m) => money(m.monetary)).join(' + ')}) ÷ (${AOV4.map((m) => m.frequency).join(' + ')}).`],
    solution: `Total spend ${money(sum(AOV4.map((m) => m.monetary)))} ÷ total visits ${sum(AOV4.map((m) => m.frequency))} = ${money(aov4)}. The mean of the last column, ${money(mean4)}, weights each member equally instead of each visit.`,
  },
  {
    id: 'm06-metr-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Is each relationship contractual (the business records when a customer leaves) or noncontractual (the customer can stop without telling it)? Every business is fictional.',
    items: [
      'A mobile network’s 24-month phone contracts, ended by giving notice',
      'A supermarket’s shoppers who scan a loyalty card at the till',
      'A climbing centre’s monthly memberships, cancelled at the front desk',
      'A hair salon’s clients, who book each appointment separately',
      'A car insurer’s annual policies, which lapse unless renewed',
      'An online bookshop’s customers, who order whenever they like',
    ],
    categories: ['Contractual', 'Noncontractual'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      1: 'The card records purchases, not departures: a shopper who switches supermarkets just stops appearing.',
      3: 'Each booking is a separate purchase; a client who goes elsewhere simply doesn’t book again.',
      4: 'A renewal is a recorded decision: the insurer knows which policies weren’t renewed.',
    },
    hints: ['Ask: would the business have a record of the day the customer left?', 'Contracts, memberships and policies end with a recorded act; shops and salons don’t.'],
    solution: 'Contractual: the phone contracts, the climbing memberships and the insurance policies, because ending them is recorded (notice, cancellation, non-renewal). Noncontractual: the supermarket, the salon and the bookshop, where churn can only be inferred from silence.',
  },
  {
    id: 'm06-metr-g4', type: 'rows', kind: 'applied',
    prompt: 'Ostler Bike Works (fictional) exported April–May 2027 orders to build a customer table. Select every row that has to be fixed or set aside before the orders are summarised by customer.',
    data: { table: { head: ['Customer', 'Email', 'Date', 'Amount', 'Note'], align: ['l', 'l', 'l', 'r', 'l'], index: 1, rows: OS.map((r) => [r[0] || '(blank)', r[1] || '(blank)', r[2], r[3] < 0 ? `−${money(-r[3])}` : money(r[3]), r[4]]) } },
    answer: [3, 4, 5, 6],
    feedback: { 3: 'A card test isn’t a customer: drop it.', 4: 'With no customer ID the order can’t join any row; set it aside and report the share.', 5: 'A refund is a negative amount, not a purchase: net it against the 5 April order in row 2, which stays a purchase.', 6: 'Same email as 1001: one customer with two IDs, so merge it into 1001.' },
    hints: ['Look for rows that aren’t a customer’s purchase, and for two IDs that are one person.', 'Four rows: a test, a missing ID, a refund and a second account.'],
    solution: 'Rows 4 (a card test, not a customer), 5 (no customer ID: set aside and report it), 6 (a partial refund: net it against row 2’s order, which stays one purchase of $15.00) and 7 (customer 1044 has 1001’s email: merge). Rows 1, 2, 3 and 8 are ordinary purchases.',
  },
];

// ---------------------------------------------------------------- on your own
const SORTED = ALL.slice().sort((a, b) => b.monetary - a.monetary), TOP20 = sum(SORTED.slice(0, Math.round(N * 0.2)).map((m) => m.monetary)) / sum(ALL.map((m) => m.monetary));
const HBM = CU.baseMetrics(members({ cafe: 'Harbourside' })), MBM = CU.baseMetrics(members({ cafe: 'Millbrook' }));
const HB = { visits: HBM.orders, spend: r2(HBM.spend), n: HBM.customers };
const OB = [410, 260, 120, 95, 80, 64, 50, 41, 30, 20];
const obTop = (OB[0] + OB[1]) / sum(OB);
const A0774 = row('A0774');
const lastA0774 = CU.isoDay(A0774.last);

export const independent = [
  {
    id: 'm06-metr-i1', type: 'formula', kind: 'numerical',
    prompt: `The visit log is in A2:D${LL} (member, date, café, amount) and the as-of date in N2. In L2, calculate the tenure in days of the member named in F2: the days from their first visit to the as-of date. Use one formula.`,
    sheet: { cells: one('A1867'), vary: { F2: ['A0002', 'A0780', 'A1763'] } }, cell: 'L2', view: `A1:N${LL}`, formats: logFormats, widths: logWidths,
    answer: `=N2-MINIFS(B2:B${LL},A2:A${LL},F2)`,
    alt: [`=$N$2-MINIFS($B$2:$B$${LL},$A$2:$A$${LL},F2)`, '=N2-MINIFS(B:B,A:A,F2)', `=DAYS(N2,MINIFS(B2:B${LL},A2:A${LL},F2))`],
    require: ['MINIFS'],
    wrong: [
      { formula: `=N2-MAXIFS(B2:B${LL},A2:A${LL},F2)`, say: 'MAXIFS finds the last visit, which gives recency. Tenure runs from the first visit: MINIFS.' },
      { formula: `=MAXIFS(B2:B${LL},A2:A${LL},F2)-MINIFS(B2:B${LL},A2:A${LL},F2)`, say: 'That is the span from first to last visit. Tenure runs to the as-of date, so a member who stopped coming keeps ageing.' },
    ],
    solution: `<x>=N2-MINIFS(B2:B36,A2:A36,F2)</x>. For A1867 (first visit 23 September 2027): ${row('A1867').tenure} days.`,
  },
  {
    id: 'm06-metr-i2', type: 'formula', kind: 'numerical',
    prompt: `Column B holds the visits of ${NT} members on 31 December 2027 (rows 2–${TL}). In F2, calculate the repeat rate: the share of these members with at least two visits.`,
    sheet: { cells: { ...tabCells, E2: 'repeat rate' } }, cell: 'F2', view: `A1:F${TL}`, formats: { ...tabFormats, F2: '0.0%' }, widths: { E: 12 },
    answer: `=COUNTIF(B2:B${TL},">=2")/COUNT(B2:B${TL})`,
    alt: [`=COUNTIFS(B2:B${TL},">=2")/COUNT(B2:B${TL})`, `=COUNTIF(B2:B${TL},">1")/COUNT(B2:B${TL})`, `=1-COUNTIF(B2:B${TL},"<2")/COUNT(B2:B${TL})`, `=COUNTIF(B2:B${TL},">=2")/COUNTA(A2:A${TL})`],
    wrong: [
      { formula: `=COUNTIF(B2:B${TL},">=2")`, say: 'That is the number of repeaters. The rate divides by every member in the table.' },
      { formula: `=COUNTIF(B2:B${TL},">2")/COUNT(B2:B${TL})`, say: 'Members with exactly two visits came back once, so they are repeaters: use ">=2".' },
    ],
    solution: `<x>=COUNTIF(B2:B31,">=2")/COUNT(B2:B31)</x>: ${T30.filter((m) => m.frequency >= 2).length} of ${NT}, ${pc(T30.filter((m) => m.frequency >= 2).length / NT)}.`,
  },
  {
    id: 'm06-metr-i3', type: 'num', kind: 'numerical',
    prompt: `Ostler Bike Works (fictional) has ten customers this year, who spent $${OB.join(', $')}. What share of spend comes from the top 20% of customers? Give a percentage to one decimal place.`,
    answer: r1(obTop * 100), check: () => ((410 + 260) / OB.reduce((a, b) => a + b, 0)) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 80, say: 'That is the 80/20 rule of thumb, not this business’s figure: add up the top two customers’ spend and divide by the total.' },
      { value: 20, say: 'The top 20% are two customers; the question is what share of spend they bring.' },
    ],
    solution: `The top 20% of ten customers are the top two: $410 + $260 = $670 of $${sum(OB).toLocaleString('en-US')}, ${pc(obTop)}.`,
  },
  {
    id: 'm06-metr-i4', type: 'num', kind: 'numerical',
    prompt: `Member A0774 last visited Millbrook on ${+lastA0774.slice(8, 10)} October 2027 and didn’t come in November. What was A0774’s recency as of 30 November 2027, in days?`,
    answer: CU.dayNum('2027-11-30') - A0774.last, check: () => CU.dayNum('2027-11-30') - CU.dayNum(lastA0774), unit: 'days', places: 0, tol: 0,
    wrong: [{ value: CU.dayNum('2027-11-30') - A0774.last + 1, say: 'Recency is the difference between the dates, so a purchase on the as-of date gives 0; don’t count both ends.' }, { value: A0774.recency, say: 'That is the recency as of 31 December. The as-of date here is 30 November.' }],
    solution: `30 November − ${+lastA0774.slice(8, 10)} October = ${CU.dayNum('2027-11-30') - A0774.last} days (the rest of October, ${31 - +lastA0774.slice(8, 10)} days, plus 30 in November).`,
  },
  {
    id: 'm06-metr-i5', type: 'mc', kind: 'applied',
    prompt: `A manager says Harbourside’s members are more loyal than Millbrook’s because they spend more each: ${money(HBM.perCustomer)} against ${money(MBM.perCustomer)} on 31 December 2027. Harbourside’s members average ${HBM.frequency.toFixed(2)} visits at ${money(HBM.aov)} a visit, Millbrook’s ${MBM.frequency.toFixed(2)} at ${money(MBM.aov)}. What is the best reply?`,
    options: [
      'Harbourside’s members visit less often; their higher spend comes from a higher ticket, so spend per member isn’t evidence of loyalty',
      'The manager is right: spend per member is the best single measure of loyalty, and Harbourside’s is about 25% higher',
      'The figures can’t be compared, because the two cafés’ members joined in different months of 2027',
      'Millbrook’s members are worth more, because 8.13 × $3.61 is more than 6.36 × $5.77 when you work it out',
    ],
    answer: 0,
    feedback: {
      1: 'Spend per member mixes how often people come with what they buy. Split it: visits per member × average order value.',
      2: 'Join months do differ, and that is worth checking, but the split into visits and ticket already answers the claim.',
      3: `${MBM.frequency.toFixed(2)} × ${money(MBM.aov)} = ${money(r2(MBM.frequency) * r2(MBM.aov))} and ${HBM.frequency.toFixed(2)} × ${money(HBM.aov)} = ${money(r2(HBM.frequency) * r2(HBM.aov))} (the products of the rounded figures): Harbourside’s members do spend more each.`,
    },
    solution: `Spend per member = visits per member × average order value. Harbourside’s members come less often (${HBM.frequency.toFixed(2)} against ${MBM.frequency.toFixed(2)} visits) and spend more per visit (${money(HBM.aov)} against ${money(MBM.aov)}). Frequency is closer to loyalty than spend; on that, Millbrook’s members are ahead.`,
  },
];

// ---------------------------------------------------------------- knowledge check

export const check = [
  {
    id: 'm06-metr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is average order value calculated as total spend ÷ total purchases, rather than as the mean of each customer’s own average purchase?',
    options: [
      'It describes the typical purchase, so each purchase must count once; the mean of averages counts each customer once instead',
      'The mean of averages is always the larger figure, and taking the smaller of the two gives a more cautious basis for planning budgets',
      'Total spend ÷ total purchases ignores customers who bought only once, who would otherwise drag the average down',
      'The two always give the same answer, and dividing the totals is quicker to calculate in Excel for a large base',
    ],
    answer: 0,
    feedback: {
      1: 'It isn’t always larger: it depends on whether light or heavy buyers have the higher tickets. The point is the weighting.',
      2: 'One-time buyers are included: their one purchase counts once, like everyone else’s.',
      3: 'They differ whenever customers make different numbers of purchases at different average values.',
    },
    solution: 'Average order value is a property of purchases, so each purchase gets equal weight: total spend ÷ total purchases. The mean of customers’ averages weights customers equally, and answers a different question.',
  },
  {
    id: 'm06-metr-k2', type: 'num', kind: 'numerical',
    prompt: `Members who joined at Harbourside made ${HB.visits.toLocaleString('en-US')} visits with the app from 1 March to 31 December 2027 and spent ${money(HB.spend)}. What was their average order value?`,
    answer: r2(HB.spend / HB.visits), check: () => members({ cafe: 'Harbourside' }).reduce((a, m) => a + m.monetary, 0) / members({ cafe: 'Harbourside' }).reduce((a, m) => a + m.frequency, 0), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: r2(HB.spend / HB.n), say: `That divides by the ${HB.n} members: spend per member. Average order value divides by visits.` }],
    solution: `${money(HB.spend)} ÷ ${HB.visits.toLocaleString('en-US')} = ${money(HB.spend / HB.visits)} per visit.`,
  },
  {
    id: 'm06-metr-k3', type: 'formula', kind: 'applied',
    prompt: `Column D holds the recency in days of ${NT} members on 31 December 2027 (rows 2–${TL}), and G1 the threshold for “active” in days. In G2, count the active members: those whose recency is at most the threshold.`,
    sheet: { cells: { ...tabCells, F1: 'threshold (days)', G1: 60, F2: 'active' }, vary: { G1: [30, 90, 45] } }, cell: 'G2', view: `A1:G${TL}`, formats: tabFormats, widths: { F: 15 },
    answer: `=COUNTIF(D2:D${TL},"<="&G1)`,
    alt: [`=COUNTIFS(D2:D${TL},"<="&G1)`, `=COUNTIF(D2:D${TL},"<="&$G$1)`, `=COUNT(D2:D${TL})-COUNTIF(D2:D${TL},">"&G1)`],
    wrong: [
      { formula: `=COUNTIF(D2:D${TL},"<=60")`, say: 'With 60 typed in, the count ignores G1. Join the operator to the cell: "<="&G1.' },
      { formula: `=COUNTIF(D2:D${TL},">="&G1)`, say: 'Active members have recency at most the threshold: a short time since their last visit. Use "<=".' },
      { formula: `=COUNTIF(D2:D${TL},"<"&G1)`, say: 'A member whose last visit was exactly the threshold’s number of days ago is still active by the rule “at most”: use "<=".' },
    ],
    solution: `<x>=COUNTIF(D2:D31,"<="&G1)</x>. With a 60-day threshold, ${T30.filter((m) => m.recency <= 60).length} of the ${NT} members are active.`,
  },
  {
    id: 'm06-metr-k4', type: 'mc', kind: 'applied',
    prompt: 'A café chain with a loyalty app reports “churn of 31% this quarter”. What must the report say before the number means anything?',
    options: [
      'The lapse that counts as churn (how many days without a visit), the base and the dates',
      'Which customers cancelled their memberships, since a loyalty app records each cancellation',
      'The customers’ average order value, because churn is a share of spend lost rather than of customers',
      'Nothing more: churn is 1 − retention and has the same meaning for every business, contractual or not',
    ],
    answer: 0,
    feedback: {
      1: 'Deleting an app isn’t leaving the café, and keeping it isn’t staying: buying is noncontractual whatever the app records.',
      2: 'Churn as normally defined counts customers. A spend-based measure exists (revenue churn), but would need its own label.',
      3: 'In a noncontractual setting there is no recorded end, so churn depends on a lapse definition the report must state.',
    },
    solution: 'Café customers can stop coming without telling anyone (a noncontractual setting), so churn has to be defined: for example, no visit for 60 days. The count changes with that threshold, the base and the dates.',
  },
  {
    id: 'm06-metr-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these would make a customer table’s repeat rate look higher than it really is? Select all that apply.',
    options: [
      'Refunds recorded as separate purchases',
      'Shoppers who check out as guests on some orders, so those orders carry no ID',
      'A staff card that is scanned for every staff drink',
      'Members who often forget to show the app',
      'A test account used to make several small purchases',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Orders without an ID are missing from the customers’ rows, which can only turn repeaters into apparent one-time buyers.',
      3: 'Missing visits can only turn repeaters into apparent one-time buyers, which lowers the rate.',
    },
    solution: 'A refund counted as a purchase can turn a one-time buyer into a “repeater”; the staff card and the test account add repeat “customers” who aren’t customers. Guest checkouts and forgotten scans leave purchases out, which can only push the rate down.',
  },
  {
    id: 'm06-metr-k6', type: 'mc', kind: 'applied',
    prompt: `Lantern’s top 20% of members by spend bring ${pc(TOP20)} of members’ spend (1 March – 31 December 2027). Which conclusion is justified?`,
    options: [
      'Spend is concentrated, if less than 80/20 suggests; the figure is for members over this window',
      'Lantern’s data break the Pareto principle, so its loyalty app must be failing to attract heavy users',
      `Losing the top 20% of members would cut the cafés’ total sales by ${pc(TOP20)}`,
      `Since ${pc(TOP20)} is far below 80%, spend is spread evenly enough that every member can be treated alike`,
    ],
    answer: 0,
    feedback: {
      1: '80/20 is a rule of thumb, not a law to break, and the share says nothing about whether the app attracts heavy users.',
      2: `Members’ visits are about a third of the cafés’ transactions, and those members might still buy without the app: the share is of members’ logged spend, not the cafés’ sales, so losing them wouldn’t cut sales by ${pc(TOP20)}.`,
      3: 'Even spread would be 20%. A fifth of members bringing well over half the spend is strong concentration.',
    },
    solution: `Equal spend would give 20%; ${pc(TOP20)} is a strongly concentrated base, if less so than 80/20. The share is for members’ logged spend in this window, not the cafés’ sales.`,
  },
];
