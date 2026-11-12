// customer-metrics.js — M06 · Customer metrics. Content only; exercises are in customer-metrics.ex.js.
// From the cafés' visit log (case.js VISIT_LIST, members()) to a customer table as of 31 December 2027: recency,
// frequency, monetary value, tenure, average order value, purchases per customer, repeat rate and active members, the
// skew of the distributions and a Pareto check, contractual against noncontractual settings, and data problems. B05's
// café log (b05/case.js) gives the cafés' transactions and sales, so members' share can be shown. Pellwick Paper and
// Halverton Climbing Centre are fictional. Every printed figure is recomputed in `checks`.
import { MEMBER_LIST, VISIT_LIST, members, AS_OF, DERIVED as D } from './case.js?v=31';
import { CAFE_COLUMNS, CLEAN_ROWS } from '../b05/case.js?v=31';
import * as CU from '../../../core/customer.js?v=31';

const ALL = members(), N = ALL.length, B = D.base;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const Q = (a, p) => CU.quantile(a, p);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const int = (v) => v.toLocaleString('en-US');
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`;

// ---------------------------------------------------------------- the base as of 31 December 2027
const byCafe = (c) => ALL.filter((m) => m.cafe === c);
const H = CU.baseMetrics(byCafe('Harbourside')), Mb = CU.baseMetrics(byCafe('Millbrook'));
const freq = ALL.map((m) => m.frequency), spend = ALL.map((m) => m.monetary);
const meanAov = sum(ALL.map((m) => m.aov)) / N;
const singles = ALL.filter((m) => m.frequency === 1).length;
const active = (L, g = ALL) => g.filter((m) => m.recency <= L).length;
const sorted = ALL.slice().sort((a, b) => b.monetary - a.monetary), TOPN = Math.round(N * 0.2), TOP = sorted.slice(0, TOPN);
const topEarly = TOP.filter((m) => m.joinedIso < '2027-09').length;
const topSpendShare = sum(TOP.map((m) => m.monetary)) / B.spend, topVisitShare = sum(TOP.map((m) => m.frequency)) / B.orders;
const p80 = Q(spend, 0.8);
// gaps between one visit and the same member's next
const GAPS = []; for (let i = 1; i < VISIT_LIST.length; i++) if (VISIT_LIST[i].id === VISIT_LIST[i - 1].id) GAPS.push(VISIT_LIST[i].day - VISIT_LIST[i - 1].day);
// visits at the other café (after the join)
const joinCafe = new Map(MEMBER_LIST.map((m) => [m.id, m.cafe]));
let later = 0, away = 0; { const seen = new Set(); for (const v of VISIT_LIST) { if (!seen.has(v.id)) { seen.add(v.id); continue; } later++; if (v.cafe !== joinCafe.get(v.id)) away++; } }
// by join month
const MONTHS = ['2027-03', '2027-04', '2027-05', '2027-06', '2027-07', '2027-08', '2027-09', '2027-10', '2027-11', '2027-12'];
const JM = MONTHS.map((k) => { const g = ALL.filter((m) => m.joinedIso.startsWith(k)); return { k, n: g.length, f: sum(g.map((m) => m.frequency)) / g.length, r: Q(g.map((m) => m.recency), 0.5), act: active(60, g) / g.length }; });
// B05's café log: transactions and sales from 1 March to 31 December 2027
const at = (n) => CAFE_COLUMNS.indexOf(n);
const TX = sum(CLEAN_ROWS.map((r) => r[at('transactions')])), SALES = sum(CLEAN_ROWS.map((r) => r[at('sales')]));

// ---------------------------------------------------------------- the simple example: three members
const SEL = ['A0006', 'A1694', 'A0002'];
const visitsOf = (id) => VISIT_LIST.filter((v) => v.id === id);
const rowOf = (id) => ALL.find((m) => m.id === id);
const EXR = SEL.map(rowOf);
const exSpend = sum(EXR.map((m) => m.monetary)), exVisits = sum(EXR.map((m) => m.frequency));
const exMeanAov = sum(EXR.map((m) => m.aov)) / EXR.length;
const fig = rowOf('A1694'), figV = visitsOf('A1694');

// ---------------------------------------------------------------- the challenging example: Pellwick Paper (fictional)
const PW_ASOF = CU.dayNum('2027-06-30');
const PW = [
  { id: 'C101', email: 'amos.j@example.com', date: '2027-02-03', amount: 24.0 },
  { id: 'C117', email: 'r.bello@example.com', date: '2027-02-10', amount: 42.0 },
  { id: 'C117', email: 'r.bello@example.com', date: '2027-02-14', amount: -42.0, note: 'return of the 10 February order' },
  { id: '', email: '', date: '2027-03-05', amount: 12.0, note: 'guest checkout' },
  { id: 'C101', email: 'amos.j@example.com', date: '2027-03-20', amount: 18.5 },
  { id: 'C150', email: 'k.osei@example.com', date: '2027-04-01', amount: 27.5 },
  { id: 'C117', email: 'r.bello@example.com', date: '2027-04-22', amount: 15.0 },
  { id: 'C230', email: 'amos.j@example.com', date: '2027-05-02', amount: 31.0, note: 'new account, same email as C101' },
];
const pwTx = (rows) => rows.map((r) => ({ id: r.id || null, day: CU.dayNum(r.date), amount: r.amount }));
const PWN = CU.summarise(pwTx(PW), { asOf: PW_ASOF });
const PWC = CU.summarise(pwTx(PW.filter((r) => r.id && !(r.id === 'C117' && Math.abs(r.amount) === 42)).map((r) => ({ ...r, id: r.id === 'C230' ? 'C101' : r.id }))), { asOf: PW_ASOF });
const pwBN = CU.baseMetrics(PWN), pwBC = CU.baseMetrics(PWC);
const pwAll = sum(PW.filter((r) => r.amount > 0 && !(r.id === 'C117' && r.amount === 42)).map((r) => r.amount));
const pwRec = (S, id) => S.find((c) => c.id === id).recency;

// ---------------------------------------------------------------- figure: one member's timeline
function timeline() {
  const x0 = 30, x1 = 410, d0 = CU.dayNum('2027-09-01'), d1 = AS_OF;
  const X = (d) => Math.round((x0 + ((d - d0) / (d1 - d0)) * (x1 - x0)) * 10) / 10;
  let s = '<svg viewBox="0 0 440 250" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  s += `<line x1="${x0}" x2="${x1}" y1="120" y2="120" stroke="var(--ink-3)" stroke-width="2"/>`;
  figV.forEach((v) => { s += `<circle cx="${X(v.day)}" cy="120" r="7" fill="var(--series-1)"/>`; });
  s += `<line x1="${X(AS_OF)}" x2="${X(AS_OF)}" y1="96" y2="144" stroke="var(--ink)" stroke-width="2.5"/>`;
  ['2027-09-01', '2027-10-01', '2027-11-01', '2027-12-01'].forEach((d) => { s += `<text x="${X(CU.dayNum(d))}" y="165" text-anchor="middle" font-size="14" fill="var(--ink-3)">${MON[+d.slice(5, 7) - 1].slice(0, 3)}</text>`; });
  s += `<text x="${x1}" y="88" text-anchor="end" font-size="14">31 Dec (as of)</text>`;
  const yT = 200, yR = 50;
  s += `<line x1="${X(fig.first)}" x2="${X(AS_OF)}" y1="${yT}" y2="${yT}" stroke="var(--series-2)" stroke-width="2.5"/><line x1="${X(fig.first)}" x2="${X(fig.first)}" y1="${yT - 8}" y2="${yT + 8}" stroke="var(--series-2)" stroke-width="2.5"/><line x1="${X(AS_OF)}" x2="${X(AS_OF)}" y1="${yT - 8}" y2="${yT + 8}" stroke="var(--series-2)" stroke-width="2.5"/>`;
  s += `<text x="${X(fig.first)}" y="${yT + 30}" font-size="15">tenure: ${fig.tenure} days</text>`;
  s += `<line x1="${X(fig.last)}" x2="${X(AS_OF)}" y1="${yR}" y2="${yR}" stroke="var(--series-3)" stroke-width="2.5"/><line x1="${X(fig.last)}" x2="${X(fig.last)}" y1="${yR - 8}" y2="${yR + 8}" stroke="var(--series-3)" stroke-width="2.5"/>`;
  s += `<text x="${X(fig.last) - 8}" y="${yR + 5}" text-anchor="end" font-size="15">recency: ${fig.recency} days</text>`;
  s += `<text x="${x0}" y="24" font-size="15">${fig.frequency} visits, ${money(fig.monetary)} in all</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'customer-metrics',
  title: 'Customer metrics',
  blurb: 'Turn a log of purchases into a customer table, one row per customer, as of a stated date: recency, frequency, monetary value and tenure for each customer, and the base’s average order value, repeat rate and active customers. Describe how unequal customers are, tell contractual from noncontractual settings, and clean the data before you trust any of it.',
  status: 'reviewed',
  objectives: [
    'Build a customer table from transaction records as of a stated date and window, with each customer’s recency, frequency, monetary value and tenure.',
    'Calculate average order value, purchases per customer, repeat rate and active customers for a customer base, and explain why average order value is total spend ÷ purchases.',
    'Describe skewed customer distributions with medians, percentiles and the top 20%’s share of spend, treating the 80/20 pattern as something to check.',
    'Distinguish contractual from noncontractual settings and explain why churn is observed in one and has to be inferred in the other.',
    'Identify data problems that distort customer metrics (one customer with two IDs, missing IDs, returns) and correct for them.',
    'Calculate customer metrics in Excel with COUNTIFS, SUMIFS, MAXIFS and MINIFS, and with a PivotTable.',
  ],
  prerequisites: [
    { lesson: 'm05/psychographic-and-behavioural', why: 'Behavioural segmentation (usage rate, loyalty status) is where this course starts: M06 measures behaviour from records instead of asking about it.' },
    { lesson: 'm01/customer-value', why: 'Retention, churn and customer lifetime value are introduced there; this lesson builds the data they are calculated from.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'COUNTIFS, SUMIFS, MAXIFS and MINIFS build the customer table in Excel.' },
    { lesson: 'b02/duplicates', why: 'Finding records that describe the same customer is the first step before counting customers.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is January 2028. Lantern’s loyalty app opened at both cafés on 1 March 2027, and by 31 December ${int(D.members)} people had joined: ${int(byCafe('Harbourside').length)} at Harbourside and ${int(byCafe('Millbrook').length)} at Millbrook. The app is set up at the till, so joining is itself a visit, and every later visit where the member shows the app is logged: ${int(D.visits)} visits and ${money(D.spend)} of spend in ten months. The café managers have questions Ana can’t answer from the till totals. How many members are regulars? Who has stopped coming? Are the members who spend most also the ones who come most often?` },
    { p: 'The app’s log is <g>transactional data</g>: one row per visit, with the member, the date, the café and the amount. A table like that answers questions about sales (how much was spent in October, at which café). Questions about customers need a different table, with one row per customer, built by summarising each customer’s rows. That <g>customer table</g> is the starting point of everything in this course: scores, segments, cohorts, retention, churn models and lifetime value.' },
    { h: 'Four numbers for every customer' },
    { p: 'Four summaries of a customer’s purchases do most of the work. Each is measured at an <g>as-of date</g>, the day the table describes, using the purchases in a stated window that ends on it (here, 1 March to 31 December 2027, as of 31 December).' },
    { define: [
      ['<g>Recency</g>', 'Days from the customer’s last purchase to the as-of date: 0 if they bought that day. Low is good.'],
      ['<g>Purchase frequency</g>', 'The number of purchases in the window, counting the first. For Lantern’s members, visits, including the join.'],
      ['<g>Monetary value</g>', 'Total spend in the window. Some analysts use the average spend per purchase instead; say which you use.'],
      ['<g>Tenure</g>', 'Days from the first purchase to the as-of date: how long the customer has been a customer.'],
    ] },
    { figure: { svg: timeline(), caption: `Member A1694 (fictional, as is every member): joined at Harbourside on 4 September 2027 and made ${fig.frequency} visits by 31 December. Recency is measured back from the as-of date to the last visit, tenure to the first.`, alt: `A timeline from September to 31 December 2027 with four dots for member A1694’s visits: 4 September, 27 September, 9 December and 16 December. A vertical line marks 31 December, the as-of date. A bar above the timeline runs from the last visit, 16 December, to 31 December, labelled recency ${fig.recency} days. A bar below runs from the first visit, 4 September, to 31 December, labelled tenure ${fig.tenure} days. The title reads ${fig.frequency} visits, ${money(fig.monetary)} in all.` } },
    { p: `Member A1694’s row in the customer table is therefore recency ${fig.recency} days, frequency ${fig.frequency}, monetary value ${money(fig.monetary)} and tenure ${fig.tenure} days. Recency, frequency and monetary value are the three behaviours that the next lesson scores (RFM); tenure tells you how long the customer has had to build them up.` },
    { h: 'Numbers for the whole base' },
    { p: `Summing over the customer table gives the base’s figures. Lantern’s ${int(N)} members made ${int(B.orders)} visits, <b>${B.frequency.toFixed(2)} purchases per customer</b>. They spent ${money(B.spend)}, so the <g>average order value</g> is ${money(B.spend)} ÷ ${int(B.orders)} = <b>${money(B.aov)}</b>. ${int(B.repeaters)} members came back at least once after joining: a <g>repeat rate</g> of <b>${pc(B.repeatRate)}</b>. And ${int(active(60))} members (${pc(active(60) / N)}) had visited in the last 60 days, which is one way to count <g>active customers</g>.` },
    { callout: 'key', title: 'Average order value is total spend ÷ purchases', html: `Averaging each member’s own average gives ${money(meanAov)}, not ${money(B.aov)}: it counts a member with one $7.50 visit as heavily as a member with a hundred visits. Average order value describes the typical purchase, so every purchase gets equal weight. The mean of members’ averages answers a different question (the typical member’s usual ticket), and is rarely what a report means.` },
    { h: 'Customers are very unequal' },
    { p: `The typical member is nothing like the average member. ${int(singles)} members (${pc(singles / N)}) have visited only once, the median member has made ${Q(freq, 0.5)} visits, the mean is ${B.frequency.toFixed(2)}, and one Millbrook regular has made ${Math.max(...freq)}. Spend is skewed the same way: a median of ${money(Q(spend, 0.5))} and a mean of ${money(B.perCustomer)}. When a few large values pull the mean up, report the median beside it.` },
    { p: `A quick way to describe the inequality is to ask what share of spend the top 20% of customers bring. Lantern’s top ${TOPN} members by spend (everyone with at least ${money(TOP[TOPN - 1].monetary)}) account for <b>${pc(topSpendShare)} of members’ spend</b> and ${pc(topVisitShare)} of their visits. The “80/20 rule” (the Pareto principle) says 20% of customers bring 80% of sales; it is a rule of thumb, not a law, and here it is closer to 58/20. Check it in your own data rather than assume it.` },
    { h: 'Did they leave, or have they just not come yet?' },
    { p: 'At Halverton Climbing Centre (fictional), members pay monthly and cancel by telling the centre. That is a <g>contractual setting</g>: the business sees the day each customer leaves, so churn is observed. Lantern’s cafés are a <g>noncontractual setting</g>: nobody tells Lantern they have stopped coming. A member silent for two months might have moved away, or might be on holiday. Churn can only be inferred from silence, and a count of “lost” members depends on how long a silence you decide counts as lapsed.' },
    { p: 'That is why recency matters so much in a noncontractual business: it is the strongest evidence a customer is still a customer. The rest of this course keeps the distinction in view. Retention and churn rates, survival curves and lifetime value are calculated differently in the two settings, and the lessons on retention and on survival show how a lapse definition turns silence into a churn date.' },
  ],

  theory: [
    { h: 'The as-of date and the window' },
    { p: 'A customer table is a snapshot. Recency and tenure change every day even if nobody buys, so a table without its as-of date can’t be read. State both ends of the window, too: frequency over ten months and frequency over the last 90 days are different numbers. Three rules keep the arithmetic consistent.' },
    { ol: [
      'Use the data’s last day, not today, as the as-of date for historical data. Lantern’s log runs to 31 December 2027; measuring recency from the day Ana opens the file (in January 2028) would add the same few days to everyone and make every member look less recent than the data show.',
      'Count days as date differences: recency = as-of date − last purchase date, so a purchase on the as-of date gives 0. Tenure = as-of date − first purchase date.',
      'Count purchases in the window, the first included. Probability models of repeat buying often use the number of <i>repeat</i> purchases, frequency − 1, instead; if you share figures with someone using those models, say which you mean.',
    ] },
    { h: 'Base metrics and what each one hides' },
    { p: `Purchases per customer and average order value multiply to spend per customer: ${B.frequency.toFixed(2)} × ${money(B.aov)} = ${money(B.perCustomer)}. That identity helps explain a difference between groups. Harbourside’s members spend ${money(H.perCustomer)} each against Millbrook’s ${money(Mb.perCustomer)}, but they come less often (${H.frequency.toFixed(2)} visits against ${Mb.frequency.toFixed(2)}): the gap is all in the ticket, ${money(H.aov)} against ${money(Mb.aov)}. The groups here are by the café each member joined at; ${pc(away / later)} of visits after the join were at the other café.` },
    { p: 'The repeat rate is the share of customers with at least two purchases. It is easy to read but blunt: a member who came back once in March and never again counts as a repeater. Active customers need a threshold: a member is active if their recency is at most L days. The count moves a lot with L:' },
    { table: {
      caption: `Lantern’s members active on 31 December 2027, by the recency threshold`,
      head: ['Active means a visit in the last …', 'Members', 'Share of members'],
      align: ['l', 'r', 'r'],
      rows: [30, 60, 90].map((L) => [`${L} days`, int(active(L)), pc(active(L) / N)]),
    } },
    { p: `A threshold should reflect how often customers usually buy. Of the ${int(GAPS.length)} gaps between one visit and the same member’s next, half are ${Q(GAPS, 0.5)} days or shorter and 90% are ${Q(GAPS, 0.9)} days or shorter. A 60-day silence is therefore unusual for a member who is still coming. But those gaps are only the ones that ended in another visit: the silence of a member who has left never ends, so it never appears in the list.` },
    { h: 'Tenure shapes recency and frequency' },
    { p: 'A member who joined in March has had ten months to visit; one who joined in December has had at most a month. Comparing their frequencies says more about when they joined than about how loyal they are, and the December joiner’s recency is short almost by construction.' },
    { table: {
      caption: 'Lantern’s members on 31 December 2027, by the month they joined',
      head: ['Joined', 'Members', 'Mean visits', 'Median recency (days)', 'Visited in the last 60 days'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: JM.map((j) => [`${MON[+j.k.slice(5, 7) - 1]} 2027`, int(j.n), j.f.toFixed(2), String(j.r), pc(j.act)]),
    } },
    { p: `Mean visits run from ${JM[0].f.toFixed(2)} to ${JM[2].f.toFixed(2)} for the spring (March–May) joiners and fall, not quite steadily, to ${JM[9].f.toFixed(2)} for December joiners; median recency falls from ${JM[0].r} days for March joiners to ${JM[9].r}. Two remedies are common: compare customers who joined at the same time (the cohort analysis lesson does this systematically), or divide frequency by tenure to get a rate. A rate has its own trap: a member who joined yesterday and visited twice has an enormous rate built on two days. Notice too that every November and December joiner counts as active: their join is a visit within 60 days.` },
    { h: 'Skewed distributions' },
    { p: `Customer spend and frequency are almost always right-skewed: many small customers and a long tail of large ones. Describe them with percentiles as well as means. Lantern’s members’ spend has a 20th percentile of ${money(Q(spend, 0.2))}, a median of ${money(Q(spend, 0.5))} and an 80th percentile of ${money(p80)}; the largest is ${money(Math.max(...spend))}. Frequency has heavy <i>ties</i>: ${int(singles)} members share the value 1, and ${int(ALL.filter((m) => m.frequency === 2).length)} share the value 2. Ties matter as soon as you cut customers into groups, as the next lesson shows.` },
    { p: 'The top-20% share is a concentration measure: 20% would be perfect equality, and the higher it is, the more the business depends on a few customers. It depends on the window (over a short window more customers look small), on the base (members only, or every customer?) and on the measure (spend or visits). Quote it with all three.' },
    { h: 'Contractual and noncontractual settings' },
    { p: 'Fader and Hardie (2009) organise customer-base analysis around this distinction. In a contractual setting (a phone contract, an insurance policy, a gym membership, software licensed by the month) the end of the relationship is recorded. Retention and churn can be counted directly, and the question is how long customers stay. In a noncontractual setting (a café, a supermarket, most online shops) the end is never recorded: the business has to infer from each customer’s purchases how likely it is that they are still a customer, and churn needs a definition, usually a lapse of L days without a purchase.' },
    { p: 'The same business can have both: a climbing centre selling day passes at the desk (noncontractual) and monthly memberships that members cancel (contractual). Analyse them separately, because the metrics mean different things. A contractual customer who hasn’t bought for 60 days but hasn’t cancelled (a member who doesn’t use the climbing wall) is still a customer and still paying; a noncontractual customer silent for 60 days may be gone.' },
    { h: 'Data problems that distort every metric' },
    { list: [
      '<b>One customer, two IDs.</b> A member who reinstalls the app, or a shopper who opens a second account, appears as two customers, each with half the purchases. The customer count rises, purchases per customer falls, and the repeat rate usually falls, though a split can turn one repeater into two; the older ID looks lapsed. Match IDs on a stable key such as an email address or phone number, as in B02’s lesson on duplicates, and decide which ID survives.',
      `<b>Missing IDs.</b> Only visits where the member shows the app are in the log. B05’s café log has ${int(TX)} transactions and ${money(SALES)} of sales from 1 March to 31 December; members’ logged visits are ${int(D.visits)} of the transactions (${pc(D.visits / TX)}) and ${money(D.spend)} of the sales (${pc(D.spend / SALES)}). Everything in the customer table describes members, not café customers, and a member who forgets the app is recorded as visiting less often than they did.`,
      '<b>Returns and refunds.</b> A refund is a negative amount, not a purchase. Net it against monetary value; remove a fully returned order from frequency as well (decide and state the rule for partial refunds). Counting the refund as a purchase inflates frequency and makes recency look better than it is if the refund came after the last real purchase.',
      '<b>Records that aren’t customers.</b> Staff cards, test accounts and the café’s own card used for wastage look like extreme customers. Check the largest values before reporting them; Lantern’s busiest member (111 visits, about four a week since joining in June) is plausible for a regular, but deserves a look.',
    ] },
    { h: 'In Excel' },
    { p: 'With the visit log in columns A to D (member, date, café, amount), a list of members in F and the as-of date in a cell, four conditional functions build the customer table: <x>=COUNTIFS($A$2:$A$36,F2)</x> for frequency, <x>=SUMIFS($D$2:$D$36,$A$2:$A$36,F2)</x> for monetary value, <x>=MAXIFS($B$2:$B$36,$A$2:$A$36,F2)</x> for the last visit and <x>=MINIFS($B$2:$B$36,$A$2:$A$36,F2)</x> for the first. Recency is then the as-of cell minus the last visit, and tenure the as-of cell minus the first. MAXIFS and MINIFS take the range to search first, then range–criterion pairs, like SUMIFS; they need Excel 2019 or later.' },
    { p: 'A PivotTable does the same in one step: put the member in Rows, and in Values the Count of date (frequency), the Sum of amount (monetary value) and the Max and Min of date (last and first visit, shown as dates once formatted). Base metrics come from the customer table: <x>=SUM(H2:H9)/SUM(G2:G9)</x> for average order value, <x>=COUNTIF(G2:G9,">=2")/COUNT(G2:G9)</x> for the repeat rate.' },
  ],

  formulas: [
    { id: 'metr-customer-row', name: 'A customer’s row in the customer table',
      tex: String.raw`R_i = D - \ell_i, \qquad T_i = D - f_i, \qquad F_i = n_i, \qquad M_i = \sum_{j=1}^{n_i} s_{ij}`,
      where: [
        [String.raw`D`, 'The as-of date: the last day of the window', 'date'],
        [String.raw`\ell_i,\ f_i`, 'The dates of customer i’s last and first purchases in the window', 'date'],
        [String.raw`n_i`, 'The number of purchases customer i made in the window, the first included', 'purchases'],
        [String.raw`s_{ij}`, 'The amount of customer i’s purchase j, net of refunds', '$'],
        [String.raw`R_i,\ T_i`, 'Recency and tenure of customer i', 'days'],
        [String.raw`F_i,\ M_i`, 'Frequency and monetary value of customer i', 'purchases; $'],
      ],
      assumptions: 'Each customer has one ID, and every purchase in the window is recorded against it.',
      note: 'Excel: <x>=COUNTIFS(A:A,F2)</x>, <x>=SUMIFS(D:D,A:A,F2)</x>, <x>=$N$2-MAXIFS(B:B,A:A,F2)</x> and <x>=$N$2-MINIFS(B:B,A:A,F2)</x>, with the as-of date in N2.' },
    { id: 'metr-base', name: 'Base metrics',
      tex: String.raw`\text{AOV} = \dfrac{\sum_i M_i}{\sum_i F_i}, \qquad \bar{F} = \dfrac{\sum_i F_i}{N}, \qquad \text{Repeat rate} = \dfrac{\#\{i : F_i \ge 2\}}{N}, \qquad \text{Active}_L = \#\{i : R_i \le L\}`,
      where: [
        [String.raw`i`, 'A customer in the table', ''],
        [String.raw`F_i,\ M_i,\ R_i`, 'Frequency, monetary value and recency of customer i, from the customer table', 'purchases; $; days'],
        [String.raw`\text{AOV}`, 'Average order value: spend per purchase', '$'],
        [String.raw`\bar{F}`, 'Purchases per customer', 'purchases'],
        [String.raw`N`, 'Customers in the table', 'customers'],
        [String.raw`L`, 'The recency threshold for counting a customer as active', 'days'],
        [String.raw`\text{Active}_L`, 'Customers whose last purchase was at most L days before the as-of date', 'customers'],
      ],
      assumptions: 'Sums run over every customer in the table; the base (which customers) and the window are stated.',
      note: `Spend per customer = AOV × purchases per customer. Not the mean of the customers’ own averages (${money(meanAov)} for Lantern, against an AOV of ${money(B.aov)}).` },
    { id: 'metr-top-share', name: 'Share of spend from the top 20% of customers',
      tex: String.raw`\text{Top-20\% share} = \dfrac{\sum_{i \in \text{top } 20\%} M_i}{\sum_i M_i}`,
      where: [
        [String.raw`\text{top } 20\%`, 'The customers with the highest monetary value, a fifth of the base', ''],
        [String.raw`M_i`, 'Monetary value of customer i', '$'],
      ],
      assumptions: 'The window, the base and the measure (spend or purchases) are stated; ties at the boundary are included or excluded by a stated rule.',
      note: '20% means every customer spends the same; the 80/20 pattern is a rule of thumb to check, not a law.' },
  ],

  examples: [
    { level: 'simple', title: 'Three members’ rows in the customer table', fictional: true,
      setup: 'Three of Lantern’s members made the visits below between 1 March and 31 December 2027. Build their rows of the customer table as of 31 December 2027, and work out their average order value as a group.',
      table: {
        caption: 'Visits logged by the app (fictional members)',
        head: ['Member', 'Date', 'Café', 'Spend'],
        align: ['l', 'l', 'l', 'r'],
        rows: SEL.flatMap((id) => visitsOf(id).map((v) => [id, `${longDate(v.date)} 2027`, v.cafe, money(v.amount)])),
      },
      steps: [
        `Frequency counts each member’s visits, the join included: A0006 ${EXR[0].frequency}, A1694 ${EXR[1].frequency}, A0002 ${EXR[2].frequency}.`,
        `Monetary value adds each member’s spend: A0006 $3.15 + $2.35 + $1.50 = ${money(EXR[0].monetary)}; A1694 $5.15 + $2.95 + $6.00 + $4.05 = ${money(EXR[1].monetary)}; A0002 ${money(EXR[2].monetary)}.`,
        `Recency is 31 December minus the last visit: A0006 last came on 23 September, ${EXR[0].recency} days before; A1694 on 16 December, ${EXR[1].recency} days; A0002 never came back after joining on 1 March, ${EXR[2].recency} days. Tenure is 31 December minus the first visit: ${EXR[0].tenure}, ${EXR[1].tenure} and ${EXR[2].tenure} days.`,
        `Average order value for the three: total spend ÷ total visits = ${money(exSpend)} ÷ ${exVisits} = ${money(exSpend / exVisits)}. (The mean of their own averages, (${money(EXR[0].aov)} + ${money(EXR[1].aov)} + ${money(EXR[2].aov)}) ÷ 3 = ${money(exMeanAov)}, gives A0002’s single visit as much weight as A1694’s four.)`,
      ],
      answer: `A0006: recency ${EXR[0].recency}, frequency ${EXR[0].frequency}, monetary ${money(EXR[0].monetary)}, tenure ${EXR[0].tenure}. A1694: ${EXR[1].recency}, ${EXR[1].frequency}, ${money(EXR[1].monetary)}, ${EXR[1].tenure}. A0002: ${EXR[2].recency}, ${EXR[2].frequency}, ${money(EXR[2].monetary)}, ${EXR[2].tenure} (all days, visits and dollars as of 31 December 2027). Average order value ${money(exSpend / exVisits)}.`,
      interpretation: 'A0006 and A0002 have the same tenure but A0006 was seen in September; A1694 joined only in September and has already made more visits. Each row is a summary at one date: on 31 January the recencies would all be 31 days longer unless the members came back.' },
    { level: 'challenging', title: 'Cleaning an order export before summarising it', fictional: true,
      setup: 'Pellwick Paper, a fictional online stationery shop, exported its orders from 1 January to 30 June 2027. Build the customer table as of 30 June 2027 as the export stands, then again after fixing its problems, and compare the customer count, repeat rate, average order value and C101’s recency.',
      table: {
        caption: 'Pellwick Paper’s order export (fictional)',
        head: ['Customer ID', 'Email', 'Date', 'Amount', 'Note'],
        align: ['l', 'l', 'l', 'r', 'l'],
        rows: PW.map((r) => [r.id || '(blank)', r.email || '(blank)', `${longDate(r.date)} 2027`, r.amount < 0 ? `−${money(-r.amount)}` : money(r.amount), r.note || '']),
      },
      steps: [
        `As exported (ignoring the blank ID): ${pwBN.customers} customers (C101, C117, C150, C230), ${pwBN.orders} orders, ${money(pwBN.spend)} of spend. C117 has 3 “purchases” and C101 has 2, so the repeat rate is ${pwBN.repeaters} ÷ ${pwBN.customers} = ${pc(pwBN.repeatRate)} and the average order value ${money(pwBN.spend)} ÷ ${pwBN.orders} = ${money(pwBN.aov)}. C101’s last order was on 20 March: recency ${pwRec(PWN, 'C101')} days.`,
        'Fix one customer with two IDs: C230 has C101’s email, so its order belongs to C101. Fix the return: the 14 February refund cancels the 10 February order in full, so remove both from C117’s frequency and spend. The guest order has no ID: it can’t be attached to anyone, so it stays out of the customer table (and the report says so).',
        `Cleaned: ${pwBC.customers} customers, ${pwBC.orders} orders, ${money(pwBC.spend)} of spend. Only C101 has bought more than once (3 orders), so the repeat rate is ${pwBC.repeaters} ÷ ${pwBC.customers} = ${pc(pwBC.repeatRate)}; the average order value is ${money(pwBC.spend)} ÷ ${pwBC.orders} = ${money(pwBC.aov)}. C101’s last order is now 2 May: recency ${pwRec(PWC, 'C101')} days.`,
        `The guest order is ${money(12)} of the ${money(pwAll)} of kept orders, ${pc(12 / pwAll)}: the customer table covers the rest.`,
      ],
      answer: `Cleaning cut the customer count from ${pwBN.customers} to ${pwBC.customers}, the repeat rate from ${pc(pwBN.repeatRate)} to ${pc(pwBC.repeatRate)}, raised the average order value from ${money(pwBN.aov)} to ${money(pwBC.aov)}, and C101’s recency fell from ${pwRec(PWN, 'C101')} to ${pwRec(PWC, 'C101')} days.`,
      interpretation: 'The problems pulled in opposite directions: the duplicate ID split a good customer into a lapsed-looking one and a new one, while the return made C117 look like a repeat buyer. On a real export the effects are smaller per customer but run across thousands of rows, and they move every metric in the rest of this course. Clean first, and say what you couldn’t fix.' },
    { level: 'applied', title: 'Lantern’s members on one page', fictional: true,
      setup: 'The café managers want one page on the loyalty-app members: how many are regulars, how much a typical member is worth to the cafés, and whether a small group carries the spend. Build it from the customer table as of 31 December 2027.',
      steps: [
        `Base and window: ${int(N)} members who joined from 1 March to 31 December 2027; their visits with the app in the same window, as of 31 December.`,
        `Base metrics: ${B.frequency.toFixed(2)} visits per member; average order value ${money(B.spend)} ÷ ${int(B.orders)} = ${money(B.aov)}; repeat rate ${int(B.repeaters)} ÷ ${int(N)} = ${pc(B.repeatRate)}; active (a visit in the last 60 days) ${int(active(60))}, ${pc(active(60) / N)}.`,
        `The typical member: median ${Q(freq, 0.5)} visits and ${money(Q(spend, 0.5))} of spend, against means of ${B.frequency.toFixed(2)} and ${money(B.perCustomer)}. ${pc(singles / N)} came only once.`,
        `Concentration: the top ${TOPN} members by spend brought ${pc(topSpendShare)} of members’ spend.`,
        `By the café they joined at: Harbourside ${H.frequency.toFixed(2)} visits per member at ${money(H.aov)}, ${money(H.perCustomer)} a member; Millbrook ${Mb.frequency.toFixed(2)} at ${money(Mb.aov)}, ${money(Mb.perCustomer)}.`,
      ],
      answer: `About half the members (${pc(active(60) / N)}) are active by a 60-day rule; the typical member has made ${Q(freq, 0.5)} visits and spent ${money(Q(spend, 0.5))}; a fifth of members bring ${pc(topSpendShare)} of spend.`,
      interpretation: 'The page tells the managers that the app’s value is concentrated in a regular core, that most members are light users and that Harbourside’s members are worth more per head only because of the ticket. It also carries its definitions: a different active threshold or window gives different numbers, and the figures describe members, about a third of the cafés’ transactions.' },
  ],

  demo: [
    { widget: 'metr-sheet', intro: 'Eight members’ visits in columns A to D and the as-of date in N2. Build their rows in G to L with COUNTIFS, SUMIFS, MINIFS and MAXIFS, then recency and tenure from N2, and fill down to row 9. Change N2 to 31 October 2027 and watch recency and tenure shrink, even below zero for members seen after it (frequency doesn’t, because the log still includes November and December: a window needs its end applied to the visits too).' },
    { widget: 'metr-pivot', intro: 'Every member as a record: the café they joined at, the month they joined, and their visits, spend and whether they were active in the last 60 days. Put Café or Joined in Rows and try Sum of Visits ÷ Sum of Members (purchases per customer), Average of Repeater (the repeat rate) and Average of Active (60 days).' },
    { widget: 'metr-rfm', intro: 'The quantiles of recency, frequency and spend for all members. Read the cut points as the 20th, 40th, 60th and 80th percentiles: spend’s gaps widen towards the top (skew), and frequency’s cut points are whole numbers with very uneven groups (ties). The next lesson turns these into scores.' },
    { widget: 'metr-dist', intro: 'Members’ total spend. Compare the mean with the median, then try the log transformation: the long right tail is typical of customer spend.' },
  ],

  mistakes: [
    { title: '“Average order value is the average of the customers’ average orders.”', html: `That weights each customer equally, so a one-visit member counts as much as a daily regular: ${money(meanAov)} for Lantern against the true ${money(B.aov)}. Divide total spend by total purchases.` },
    { title: '“Recency is the days since the last purchase.” Since when?', html: 'Recency is always measured to an as-of date. Use the data’s last day for historical data, state it, and recompute when the date changes; otherwise every customer drifts older while the report looks the same.' },
    { title: '“Members who joined in the spring are our most loyal: they visit most.”', html: `They have had longest to visit. March–May joiners average ${JM[0].f.toFixed(2)} to ${JM[2].f.toFixed(2)} visits and December joiners ${JM[9].f.toFixed(2)}, mostly because of tenure. Compare customers who joined at the same time, or use a rate with care.` },
    { title: '“20% of customers bring 80% of sales: that’s the Pareto rule.”', html: `It is a rule of thumb. Lantern’s top 20% bring ${pc(topSpendShare)} of members’ spend. The share also depends on the window, the base and whether you count spend or visits; measure it.` },
    { title: '“A customer who hasn’t bought for three months has churned.”', html: 'In a noncontractual setting nobody tells you they have left; churn is a definition you choose (a lapse of L days), and the count moves with L. In a contractual setting a customer who hasn’t used the service but hasn’t cancelled is still a customer.' },
    { title: '“The export is the customer list.”', html: 'Duplicate IDs split customers, returns pose as purchases and rows without IDs vanish. Clean before summarising, and report what share of transactions the customer table covers.' },
  ],

  application: [
    { case: `Ana now sends the café managers a one-page member report on the first Monday of each month. It opens with a definitions box: the base (members who have joined since 1 March 2027), the window (since 1 March), the as-of date (the last day of the previous month), and the rule for active (a visit with the app in the last 60 days).` },
    { p: `<b>She leads with medians and the active count.</b> The January report says ${int(active(60))} of ${int(N)} members (${pc(active(60) / N)}) were active on 31 December, with a median of ${Q(freq, 0.5)} visits and ${money(Q(spend, 0.5))} of spend. The means are in a second row, with a note that a few heavy users lift them.` },
    { p: `<b>She splits by café only where the café explains something.</b> Harbourside’s members spend more per head, ${money(H.perCustomer)} against ${money(Mb.perCustomer)}, and the report shows that this is the ticket (${money(H.aov)} against ${money(Mb.aov)}), not more visits. The Millbrook manager had been told her members were “worth less”; the identity spend per member = visits per member × average order value showed her members come more often.` },
    { p: `<b>She keeps the denominators honest.</b> The report states that members’ logged visits are about a third of the cafés’ transactions, so member figures can’t stand in for all customers, and that a member who forgets the app is undercounted. Duplicate members (a reinstalled app gives a new ID) are merged monthly on the phone number held by the app, and Ana reports how many were merged.` },
    { p: `<b>The managers asked for a list of “our best customers”.</b> Ana could have given them the top ${TOPN} by spend, but that list is mostly members who joined before September (${int(topEarly)} of the ${TOPN}). Instead the next lesson scores every member on recency, frequency and monetary value relative to the others, so that a member who joined in October and comes every week can sit beside one who has been coming since March.` },
  ],

  summary: [
    'A customer table has one row per customer, built from transactions as of a stated date and window; without the as-of date, recency and tenure can’t be read.',
    'Recency = as-of date − last purchase (0 = bought that day); frequency = purchases in the window, the first included; monetary value = total spend in the window (say if you use the average); tenure = as-of date − first purchase.',
    'Average order value = total spend ÷ total purchases, not the mean of customers’ averages; spend per customer = purchases per customer × average order value.',
    'The repeat rate and the active count are simple but depend on definitions: active needs a recency threshold, and the count moves with it.',
    'Customer distributions are right-skewed with heavy ties in frequency: report medians and percentiles, and measure the top 20%’s share instead of assuming 80/20.',
    'Tenure shapes recency and frequency: compare customers who joined at the same time.',
    'Contractual settings record when customers leave; noncontractual ones don’t, so churn must be inferred from silence with a stated lapse definition.',
    'Merge duplicate IDs, net returns, and say what share of transactions has no customer ID before you trust any metric.',
  ],

  glossary: [
    { term: 'Customer table', def: 'A table with one row per customer summarising that customer’s transactions in a stated window as of a stated date: for example recency, frequency, monetary value and tenure.' },
    { term: 'As-of date', def: 'The date a customer table or score describes, from which recency and tenure are measured; usually the last day of the data’s window.' },
    { term: 'Recency', def: 'The number of days from a customer’s last purchase to the as-of date; 0 means they bought on that date.' },
    { term: 'Purchase frequency', def: 'The number of purchases a customer made in a stated window, counting the first.' },
    { term: 'Monetary value', def: 'A customer’s total spend in a stated window (some analysts use the average spend per purchase instead).' },
    { term: 'Tenure', def: 'The number of days from a customer’s first purchase to the as-of date.' },
    { term: 'Repeat rate', def: 'The share of customers in a base who made at least two purchases in the window.' },
    { term: 'Active customers', def: 'Customers whose most recent purchase falls within a stated number of days of the as-of date.' },
    { term: 'Contractual setting', def: 'A business relationship in which the end is recorded, for example when a subscriber cancels, so churn is observed.' },
    { term: 'Noncontractual setting', def: 'A business relationship in which customers can stop buying without telling the business, so churn must be inferred from the absence of purchases.' },
  ],

  references: [
    { text: 'Fader, P. S. &amp; Hardie, B. G. S. (2009). Probability models for customer-base analysis. <i>Journal of Interactive Marketing</i>, 23(1), 61–69. doi:10.1016/j.intmar.2008.11.003.', url: 'https://www.london.edu/faculty-and-research/academic-research/p/probability-models-for-customer-base-analysis', checked: '2026-11-01' },
    { text: 'Fader, P. S., Hardie, B. G. S. &amp; Lee, K. L. (2005). RFM and CLV: Using iso-value curves for customer base analysis. <i>Journal of Marketing Research</i>, 42(4), 415–430. (Working paper version, February 2005.)', url: 'https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics</i> (2nd ed.), section 2.2: Measures of the location of the data. OpenStax. (Its percentile formula locates the kth percentile at (n + 1)p, a different rule from Excel’s PERCENTILE.INC.)', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/2-2-measures-of-the-location-of-the-data', checked: '2026-11-01' },
    { text: 'Microsoft. MAXIFS function. Microsoft Support (Excel 2019 and later).', url: 'https://support.microsoft.com/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883', checked: '2026-11-01' },
  ],

  checks: [
    // the base
    { what: 'Members', value: D.members, shown: 2584 },
    { what: 'Harbourside members', value: byCafe('Harbourside').length, shown: 877 },
    { what: 'Millbrook members', value: byCafe('Millbrook').length, shown: 1707 },
    { what: 'Visits', value: D.visits, shown: 19458 },
    { what: 'Spend', value: D.spend, shown: 82251.25 },
    { what: 'Customer table rows = members', value: N, shown: 2584 },
    { what: 'Window: ten months, 1 March to 31 December', value: CU.monthOf(AS_OF) - CU.monthOf(CU.dayNum('2027-03-01')) + 1, shown: 10 },
    { what: 'As of 31 December 2027', value: AS_OF, shown: CU.dayNum('2027-12-31') },
    { what: 'Purchases per customer', value: B.frequency, shown: 7.53 },
    { what: 'AOV', value: B.aov, shown: 4.23 },
    { what: 'Repeaters', value: B.repeaters, shown: 2109 },
    { what: 'Repeat rate %', value: B.repeatRate * 100, shown: 81.6, tol: 0.05 },
    { what: 'Active 60', value: active(60), shown: 1260 },
    { what: 'Active 60 %', value: active(60) / N * 100, shown: 48.8, tol: 0.05 },
    { what: 'Active 30', value: active(30), shown: 975 },
    { what: 'Active 30 %', value: active(30) / N * 100, shown: 37.7, tol: 0.05 },
    { what: 'Active 90', value: active(90), shown: 1515 },
    { what: 'Active 90 %', value: active(90) / N * 100, shown: 58.6, tol: 0.05 },
    { what: 'Mean of members’ averages', value: meanAov, shown: 4.42 },
    { what: 'A one-visit member at $7.50 (A0002)', value: rowOf('A0002').monetary, shown: 7.5 },
    { what: 'Members with one visit', value: singles, shown: 475 },
    { what: 'One-visit share %', value: singles / N * 100, shown: 18.4, tol: 0.05 },
    { what: 'Median visits', value: Q(freq, 0.5), shown: 4 },
    { what: 'Largest frequency', value: Math.max(...freq), shown: 111 },
    { what: 'The busiest member joined at Millbrook', value: Number(ALL.find((m) => m.frequency === 111).cafe === 'Millbrook'), shown: 1 },
    { what: 'Busiest member joined in June', value: Number(ALL.find((m) => m.frequency === 111).joinedIso.startsWith('2027-06')), shown: 1 },
    { what: 'Busiest member: about four visits a week', value: 111 / (ALL.find((m) => m.frequency === 111).tenure / 7), shown: 4, tol: 0.1 },
    { what: 'Median spend', value: Q(spend, 0.5), shown: 18 },
    { what: 'Mean spend per member', value: B.perCustomer, shown: 31.83 },
    { what: 'Top 20% members', value: TOPN, shown: 517 },
    { what: 'Top 20% lowest spend', value: TOP[TOPN - 1].monetary, shown: 47.05 },
    { what: 'Next member below the top 20% spends less (no tie at the boundary)', value: Number(sorted[TOPN].monetary < TOP[TOPN - 1].monetary), shown: 1 },
    { what: 'Top 20% spend share %', value: topSpendShare * 100, shown: 57.9, tol: 0.05 },
    { what: 'Top 20% visit share %', value: topVisitShare * 100, shown: 56.1, tol: 0.05 },
    { what: '58/20 rounding', value: topSpendShare * 100, shown: 58, tol: 0.5 },
    { what: 'Pareto rule 80/20', value: 100 - 20, shown: 80 },
    { what: 'Two months of silence ≈ 60 days', value: 60, shown: 60 },
    // figure and A1694
    { what: 'A1694 visits', value: fig.frequency, shown: 4 },
    { what: 'A1694 spend', value: fig.monetary, shown: 18.15 },
    { what: 'A1694 recency', value: fig.recency, shown: 15 },
    { what: 'A1694 tenure', value: fig.tenure, shown: 118 },
    { what: 'A1694 joined 4 September at Harbourside', value: Number(rowOf('A1694').joinedIso === '2027-09-04' && rowOf('A1694').cafe === 'Harbourside'), shown: 1 },
    { what: 'A1694 visit dates', value: Number(figV.map((v) => v.date).join() === '2027-09-04,2027-09-27,2027-12-09,2027-12-16'), shown: 1 },
    // theory
    { what: 'Identity: visits × AOV = spend per member', value: B.frequency * B.aov, shown: 31.83 },
    { what: 'Harbourside spend per member', value: H.perCustomer, shown: 36.73 },
    { what: 'Millbrook spend per member', value: Mb.perCustomer, shown: 29.32 },
    { what: 'Harbourside visits per member', value: H.frequency, shown: 6.36 },
    { what: 'Millbrook visits per member', value: Mb.frequency, shown: 8.13 },
    { what: 'Harbourside AOV', value: H.aov, shown: 5.77 },
    { what: 'Millbrook AOV', value: Mb.aov, shown: 3.61 },
    { what: 'Visits at the other café %', value: away / later * 100, shown: 6.0, tol: 0.05 },
    { what: 'Gaps between visits', value: GAPS.length, shown: 16874 },
    { what: 'Median gap', value: Q(GAPS, 0.5), shown: 5 },
    { what: 'p90 gap', value: Q(GAPS, 0.9), shown: 25 },
    ...JM.flatMap((j, i) => [
      { what: `Joined ${j.k}: members`, value: j.n, shown: [242, 238, 285, 293, 313, 293, 272, 225, 221, 202][i] },
      { what: `Joined ${j.k}: mean visits`, value: j.f, shown: [9.34, 9.94, 9.95, 8.71, 8.38, 8.68, 6.63, 4.68, 4.64, 1.97][i] },
      { what: `Joined ${j.k}: median recency`, value: j.r, shown: [212, 179, 146, 139, 90, 71, 66, 39, 17, 8][i] },
      { what: `Joined ${j.k}: active 60 %`, value: j.act * 100, shown: [23.1, 26.5, 30.2, 33.1, 39.3, 48.1, 47.8, 62.7, 100.0, 100.0][i], tol: 0.05 },
    ]),
    { what: 'Join months add to all members', value: sum(JM.map((j) => j.n)), shown: 2584 },
    { what: 'Mean visits fall from March to December joiners', value: Number(JM[0].f > JM[9].f && JM[0].r > JM[9].r), shown: 1 },
    { what: 'Most visits among March–May joiners', value: Number(Math.max(...JM.map((j) => j.f)) === Math.max(JM[0].f, JM[1].f, JM[2].f)), shown: 1 },
    { what: 'Spring range low (March)', value: Math.min(JM[0].f, JM[1].f, JM[2].f), shown: 9.34 },
    { what: 'Spring range high (May)', value: Math.max(JM[0].f, JM[1].f, JM[2].f), shown: 9.95 },
    { what: 'Top 517 joined before September', value: topEarly, shown: 441 },
    { what: 'Spend p20', value: Q(spend, 0.2), shown: 6.93 },
    { what: 'Spend p80', value: p80, shown: 47.02 },
    { what: 'Largest spend', value: Math.max(...spend), shown: 427.4 },
    { what: 'Members with two visits', value: ALL.filter((m) => m.frequency === 2).length, shown: 382 },
    { what: 'Equality share', value: 20, shown: 20 },
    { what: 'B05 transactions Mar–Dec', value: TX, shown: 58091 },
    { what: 'B05 sales Mar–Dec', value: SALES, shown: 236000 },
    { what: 'Members’ share of transactions %', value: D.visits / TX * 100, shown: 33.5, tol: 0.05 },
    { what: 'Members’ share of sales %', value: D.spend / SALES * 100, shown: 34.9, tol: 0.05 },
    { what: 'About a third of transactions', value: D.visits / TX, shown: 1 / 3, tol: 0.01 },
    { what: 'Excel ranges: 35 visits in rows 2–36', value: 36 - 1, shown: 35 },
    { what: 'Excel: eight members in rows 2–9', value: 9 - 1, shown: 8 },
    { what: 'MAXIFS from Excel 2019', value: 2019, shown: 2019 },
    // simple example
    { what: 'A0006 visits', value: EXR[0].frequency, shown: 3 },
    { what: 'A0006 spend', value: EXR[0].monetary, shown: 7.0 },
    { what: 'A0006 spend parts', value: 3.15 + 2.35 + 1.5, shown: 7.0 },
    { what: 'A0006 visits are 1 Mar, 15 Aug, 23 Sep', value: Number(visitsOf('A0006').map((v) => `${v.date}:${v.amount}`).join() === '2027-03-01:3.15,2027-08-15:2.35,2027-09-23:1.5'), shown: 1 },
    { what: 'A1694 visits and amounts', value: Number(visitsOf('A1694').map((v) => v.amount).join() === '5.15,2.95,6,4.05'), shown: 1 },
    { what: 'A1694 spend parts', value: 5.15 + 2.95 + 6.0 + 4.05, shown: 18.15 },
    { what: 'A0002 one visit on 1 March', value: Number(visitsOf('A0002').length === 1 && visitsOf('A0002')[0].date === '2027-03-01'), shown: 1 },
    { what: 'A0006 recency', value: EXR[0].recency, shown: 99 },
    { what: 'A0002 recency', value: EXR[2].recency, shown: 305 },
    { what: 'A0006 tenure', value: EXR[0].tenure, shown: 305 },
    { what: 'A0002 tenure', value: EXR[2].tenure, shown: 305 },
    { what: 'Three members spend', value: exSpend, shown: 32.65 },
    { what: 'Three members visits', value: exVisits, shown: 8 },
    { what: 'Three members AOV', value: exSpend / exVisits, shown: 4.08 },
    { what: 'A0006 AOV', value: EXR[0].aov, shown: 2.33 },
    { what: 'A1694 AOV', value: EXR[1].aov, shown: 4.54 },
    { what: 'Mean of the three averages', value: exMeanAov, shown: 4.79 },
    { what: 'Thirty-one days in January', value: CU.dayNum('2028-01-31') - CU.dayNum('2027-12-31'), shown: 31 },
    // Pellwick
    { what: 'Pellwick naive customers', value: pwBN.customers, shown: 4 },
    { what: 'Pellwick naive orders', value: pwBN.orders, shown: 7 },
    { what: 'Pellwick naive spend', value: pwBN.spend, shown: 116 },
    { what: 'Pellwick naive repeaters', value: pwBN.repeaters, shown: 2 },
    { what: 'Pellwick naive repeat %', value: pwBN.repeatRate * 100, shown: 50.0, tol: 0.05 },
    { what: 'Pellwick naive AOV', value: pwBN.aov, shown: 16.57 },
    { what: 'Pellwick C117 naive purchases', value: PWN.find((c) => c.id === 'C117').frequency, shown: 3 },
    { what: 'Pellwick C101 naive purchases', value: PWN.find((c) => c.id === 'C101').frequency, shown: 2 },
    { what: 'Pellwick C101 naive recency', value: pwRec(PWN, 'C101'), shown: 102 },
    { what: 'Pellwick clean customers', value: pwBC.customers, shown: 3 },
    { what: 'Pellwick clean orders', value: pwBC.orders, shown: 5 },
    { what: 'Pellwick clean spend', value: pwBC.spend, shown: 116 },
    { what: 'Pellwick clean repeaters', value: pwBC.repeaters, shown: 1 },
    { what: 'Pellwick C101 clean orders', value: PWC.find((c) => c.id === 'C101').frequency, shown: 3 },
    { what: 'Pellwick clean repeat %', value: pwBC.repeatRate * 100, shown: 33.3, tol: 0.05 },
    { what: 'Pellwick clean AOV', value: pwBC.aov, shown: 23.2 },
    { what: 'Pellwick C101 clean recency', value: pwRec(PWC, 'C101'), shown: 59 },
    { what: 'Pellwick guest order', value: 12, shown: 12 },
    { what: 'Pellwick kept orders total', value: pwAll, shown: 128 },
    { what: 'Pellwick guest share %', value: 12 / pwAll * 100, shown: 9.4, tol: 0.05 },
    // application
    { what: 'Report rule: 60 days', value: 60, shown: 60 },
  ],
};
