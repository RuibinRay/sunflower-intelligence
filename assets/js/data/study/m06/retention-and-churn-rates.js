// retention-and-churn-rates.js — M06 · Retention and churn rates. Content only; exercises are in
// retention-and-churn-rates.ex.js. The cafés' loyalty-app members (case.js: visits to 31 December 2027) show why
// "churn" needs a definition in a noncontractual setting; contractual examples use fictional businesses (Corriemoor
// Mobile, Thistlebank Insurance, Tarnfield Software) and Fader & Hardie's (2007) published retention data. The project's
// subscriptions are not used. Every figure printed is recomputed in `checks`.
import { MEMBER_LIST, VISIT_LIST, AS_OF, CALIBRATION_END, members } from './case.js?v=30';
import * as CU from '../../../core/customer.js?v=30';

const { monthOf, dayNum } = CU;
const pc = (x) => x * 100;

// ---------------------------------------------------------------- Fader & Hardie (2007), Table 1: % surviving, years 0–12
const FH_REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1, 22.3, 20.7, 19.4, 18.3, 17.3];
const fhRate = FH_REG.slice(1).map((v, i) => v / FH_REG[i]);

// ---------------------------------------------------------------- members: active in a calendar month
const LAST = monthOf(AS_OF);
const act = (m) => new Set(VISIT_LIST.filter((v) => monthOf(v.day) === m).map((v) => v.id));
const NOV = act(LAST - 1), DEC = act(LAST), SEP = act(LAST - 3), OCT = act(LAST - 2);
const decJoin = new Set(MEMBER_LIST.filter((m) => monthOf(m.joined) === LAST).map((m) => m.id));
const keptND = [...NOV].filter((id) => DEC.has(id)).length;
const reactND = [...DEC].filter((id) => !NOV.has(id) && !decJoin.has(id)).length;
const laterND = new Set(VISIT_LIST.filter((v) => monthOf(v.day) >= LAST - 1).map((v) => v.id));
const sepGap = [...SEP].filter((id) => !OCT.has(id));
const sepBack = sepGap.filter((id) => laterND.has(id)).length;
const wrongND = CU.periodRetention({ start: NOV.size, end: DEC.size, acquired: decJoin.size });

// share active again the next month, by months since joining (pooled, and March–July joiners only)
const monthsOf = new Map();
for (const v of VISIT_LIST) (monthsOf.get(v.id) || monthsOf.set(v.id, new Set()).get(v.id)).add(monthOf(v.day));
function nextMonth(k, lastJoin = Infinity) {
  let a = 0, b = 0;
  for (const m of MEMBER_LIST) {
    const j = monthOf(m.joined); if (j + k + 1 > LAST || j > lastJoin) continue;
    const s = monthsOf.get(m.id); if (s.has(j + k)) { a++; if (s.has(j + k + 1)) b++; }
  }
  return { a, b, r: b / a };
}
const POOL = [0, 1, 2, 3, 4].map((k) => nextMonth(k));
const JUL = monthOf(dayNum('2027-07-01'));
const EARLY = [0, 1, 2, 3, 4].map((k) => nextMonth(k, JUL));

// lapse rules on 31 December and on 31 October
const ALL = members();
const lapsedAt = (L) => ALL.filter((c) => c.recency > L).length;
const OCTM = members({ asOf: CALIBRATION_END });
const later = new Set(VISIT_LIST.filter((v) => v.day > CALIBRATION_END).map((v) => v.id));
const quiet60 = OCTM.filter((c) => c.recency > 60);
const quiet60back = quiet60.filter((c) => later.has(c.id)).length;

// ---------------------------------------------------------------- fictional businesses
const CM = { start: 12000, end: 12900, acquired: 2400 };            // Corriemoor Mobile, one quarter (fictional)
const CMR = CU.periodRetention(CM);
const TB = { n: 1000, w: 0.5, rA: 0.5, rB: 0.9 };                    // Thistlebank Insurance, two kinds of policyholder (fictional)
const tbS = (t) => TB.w * TB.rA ** t + (1 - TB.w) * TB.rB ** t;      // share of the 1,000 still insured after t renewals
const tbR = (t) => tbS(t) / tbS(t - 1);
const TS = { arr: 400000, n: 200, lostN: 18, lost: 36000, down: 12000, up: 58000, newN: 30, newArr: 90000 };   // Tarnfield Software (fictional)
const GRR = (TS.arr - TS.lost - TS.down) / TS.arr, NRR = (TS.arr - TS.lost - TS.down + TS.up) / TS.arr;

// ---------------------------------------------------------------- figure: Fader & Hardie's Regular retention rates
const f1 = (x) => Math.round(x * 10) / 10;
function rateFigure() {
  const x0 = 64, x1 = 420, y0 = 250, y1 = 30, lo = 0.6, hi = 1;
  const X = (t) => x0 + (t - 1) / 11 * (x1 - x0), Y = (v) => y0 - (v - lo) / (hi - lo) * (y0 - y1);
  let s = '<svg viewBox="0 0 440 310" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  [0.6, 0.7, 0.8, 0.9, 1].forEach((v) => { s += `<line x1="${x0}" x2="${x1}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--rule-strong)" stroke-dasharray="3 4"/><text x="${x0 - 8}" y="${f1(Y(v)) + 5}" text-anchor="end" fill="var(--ink-3)">${Math.round(v * 100)}%</text>`; });
  [1, 4, 8, 12].forEach((t) => { s += `<text x="${f1(X(t))}" y="${y0 + 24}" text-anchor="middle" fill="var(--ink-3)">${t}</text>`; });
  s += `<text x="${(x0 + x1) / 2}" y="${y0 + 48}" text-anchor="middle">Year of the relationship</text>`;
  s += `<path d="${fhRate.map((r, i) => `${i ? 'L' : 'M'}${f1(X(i + 1))},${f1(Y(r))}`).join('')}" fill="none" stroke="var(--series-1)" stroke-width="2.8"/>`;
  fhRate.forEach((r, i) => { s += `<circle cx="${f1(X(i + 1))}" cy="${f1(Y(r))}" r="4" fill="var(--series-1)"/>`; });
  return `${s}</svg>`;
}

export default {
  slug: 'retention-and-churn-rates',
  title: 'Retention and churn rates',
  blurb: 'Measure how many customers a business keeps, with the right denominator and over the right horizon. See why average retention rises with tenure when customers differ, why “churn” must be defined before it can be counted when nobody cancels, and how revenue retention differs from customer retention.',
  status: 'reviewed',
  objectives: [
    'Calculate a period’s retention and churn rates from customers at the start, customers at the end and customers won during the period.',
    'Convert a constant churn rate between months, quarters and years by compounding, and calculate the expected lifetime it implies.',
    'Explain why a group’s retention rate rises with tenure when customers differ, even though no customer becomes more loyal.',
    'Define churn for a noncontractual business with a lapse rule, and show how the choice of rule changes the figure.',
    'Calculate gross and net revenue retention and say what each adds to customer retention.',
  ],
  prerequisites: [
    { lesson: 'm01/customer-value', why: 'Retention rate, churn rate and customer lifetime value were introduced there; this lesson measures them properly.' },
    { lesson: 'm06/customer-metrics', why: 'Recency as of a stated date, and the difference between contractual and noncontractual settings.' },
    { lesson: 'm06/cohort-analysis', why: 'Cohorts and the share of a cohort active in each month since joining.' },
    { lesson: 'f00/interest-and-inflation', why: 'Compounding: a rate applied period after period multiplies, it doesn’t add.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In January 2028 Ana asks a simple question about the cafés’ loyalty app: “How many of our members are we keeping?” Three people give her three answers. The café managers say 108%, because more members visited in December than in November. Her analyst says 68.5%, the share of November’s visitors who came back in December. The app’s dashboard says 51.2% of members have “churned”. None of them has made an arithmetic mistake. Each has measured something different, and this lesson is about telling them apart.' },

    { h: 'Retention and churn for a period' },
    { p: 'The <g>retention rate</g> for a period is the share of the customers a business had at the start who are still customers at the end. The <g>churn rate</g> is its complement, the share who have gone: churn = 1 − retention. Both are about one group of people, those present at the start, followed to the end. That one sentence settles most arguments about retention, because it says what belongs in the denominator and what doesn’t.' },
    { p: 'Corriemoor Mobile (fictional) sells phone contracts. It had 12,000 customers on 1 January and 12,900 on 31 March. During the quarter it signed 2,400 new customers who were still with it on 31 March. Those 2,400 were not customers at the start, so they can’t be “retained”: of the 12,900 at the end, 12,900 − 2,400 = 10,500 were there on 1 January. Retention for the quarter is 10,500 ÷ 12,000 = 87.5%, and churn is 12.5%: Corriemoor lost 1,500 of its starting customers.' },
    { p: 'The tempting shortcut, end ÷ start = 12,900 ÷ 12,000 = 107.5%, measures growth, not retention. A business can grow while losing customers quickly, as long as it signs new ones faster; it can also shrink while keeping almost everyone, if it stops selling. The managers’ 108% for the cafés is this shortcut. Mixing the new customers into either side of the ratio is the <b>denominator trap</b>, and it always flatters a business that is acquiring customers.' },
    { callout: 'key', title: 'Who counts', html: 'Start with the customers you had when the period began. Follow only them. New customers won during the period are reported separately, as acquisition; a new customer who joins and leaves within the period appears in neither the start nor the end, but counts towards how many were won.' },

    { h: 'Months, quarters and years' },
    { p: 'A churn rate belongs to a period, and it can’t be scaled like a price. If Corriemoor keeps 87.5% of its customers each quarter, a customer is still there after a year with probability 0.875 × 0.875 × 0.875 × 0.875 = 0.586, so annual retention is 58.6% and annual churn 41.4%, not 4 × 12.5% = 50%. Churn compounds, exactly as interest does: <m>1 - (1 - c)^{T}</m> over <m>T</m> periods. Going the other way, the equivalent monthly churn is <m>1 - 0.875^{1/3}</m> = 4.35%, a little more than a third of the quarterly rate.' },
    { p: 'A constant churn rate also gives a customer’s <g>expected lifetime</g>. If each quarter a customer leaves with probability 12.5%, the number of quarters they stay, counting the first, averages 1 ÷ 0.125 = 8 quarters, or two years. The formula is the mean of a geometric distribution; it holds only if the rate really is constant, which the next section questions.' },

    { h: 'Why retention seems to grow with tenure' },
    { p: 'Businesses that follow a group of customers from the day they join almost always see the retention rate rise: a large share leave in the first period, fewer in the second, fewer again later. Fader and Hardie’s (2007) data on the “Regular” customers of an unnamed subscription business, the share of a group acquired together that is still active in each of 12 years, show it clearly. Of those who started, 63.1% renewed for a second year; of those still there, 74.2% renewed for a third, then 81.6%, and by year 12 the rate was 94.5%.' },
    { figure: {
      svg: rateFigure(),
      caption: 'Annual retention rate in each year of the relationship: Fader and Hardie’s (2007) “Regular” customers. Each year’s rate is the share of those still customers at the start of the year who are still customers at its end.',
      alt: 'A line chart of the retention rate against the year of the relationship, from year 1 to year 12. The rate starts at 63.1% in year 1, rises steeply to 81.6% by year 3, then more slowly, reaching 92.0% in year 7 and 94.5% in year 12. Every year’s rate is higher than the year before.',
    } },
    { p: 'The natural reading is that customers grow more loyal the longer they stay. Often it isn’t true, and it doesn’t need to be. Suppose Thistlebank Insurance (fictional) has 1,000 new home-insurance customers of two kinds, 500 who renew each year with probability 50% and 500 who renew with probability 90%, and nobody ever changes. In year 1 retention is 0.5 × 50% + 0.5 × 90% = 70%. But the leavers are mostly the first kind, so the 700 who renew are 250 of the first kind and 450 of the second, and in year 2 the group’s retention is (125 + 405) ÷ 700 = 75.7%. In year 3 it is 80.6%, and it keeps rising towards 90%. No customer changed; the mix did.' },
    { p: 'This is the <g>sorting effect</g>: when customers differ, the ones likely to leave leave first, and the survivors are increasingly the loyal ones. Fader and Hardie conclude that the rise in their data is “simply due to heterogeneity”, an effect long known as the ruse of heterogeneity. It matters because a business that measures one rate and assumes it holds for ever gets the future wrong. Thistlebank’s year-1 rate of 70%, held constant, predicts that 0.7⁵ = 16.8% of the 1,000 are still insured after five renewals; in fact 31.1% are. The survival-analysis lesson builds a model that expects the rise.' },
  ],

  theory: [
    { h: 'The formulas, with their assumptions' },
    { p: String.raw`For a period with <m>S</m> customers at the start, <m>E</m> at the end and <m>N</m> of the end’s customers won during the period, retention is <m>r = (E - N)/S</m> and churn <m>c = 1 - r</m>. The formula assumes a customer’s status is known at both dates, which is true when customers sign up and cancel: a <g>contractual setting</g>, such as phone contracts, insurance, memberships and software licences. Customers who leave and rejoin within the period can be counted as kept or as lost and won again; either is defensible, but say which.` },
    { p: String.raw`With a constant per-period churn <m>c</m>, the share still customers after <m>T</m> periods is <m>(1 - c)^T</m>, churn over <m>T</m> periods is <m>1 - (1 - c)^T</m>, and the expected number of periods a new customer stays, counting the first, is <m>1/c</m> (equivalently <m>1/(1 - r)</m>). Lifetimes of this kind are skewed: with quarterly churn of 12.5%, half of Corriemoor’s customers have gone within <m>\ln 0.5 / \ln 0.875 = 5.2</m> quarters, well short of the mean of 8.` },
    { callout: 'warn', title: 'Averages of rates', html: 'Don’t average monthly retention rates over months of different sizes, and don’t compare one business’s monthly churn with another’s annual churn. Convert to one horizon first, by compounding, and weight by the customers at risk.' },

    { h: 'Heterogeneity and the shape of retention' },
    { p: String.raw`If a share <m>w_k</m> of a group are customers of kind <m>k</m>, each renewing with a fixed probability <m>r_k</m>, the share still customers after <m>t</m> periods is <m>S(t) = \sum_k w_k r_k^{\,t}</m>, and the group’s retention rate in period <m>t</m> is <m>S(t)/S(t-1)</m>. That ratio is a weighted average of the <m>r_k</m> in which the weights shift towards the kinds with the highest <m>r_k</m> as <m>t</m> grows, so it rises towards the largest of them. Two kinds are enough to show the effect; real customers differ continuously, and the shifted-beta-geometric model in the next lesson lets each customer have their own rate.` },
    { p: 'The rise can still have other causes: customers who stay may learn to use a product more, or face costs of switching that grow with time. Aggregate data can’t tell sorting from genuine change, because both raise the group’s rate. What the sorting effect shows is that rising retention is not evidence that customers become more loyal, and that a single average rate, used to project far ahead, will understate how many customers remain.' },

    { h: 'When nobody cancels: defining churn' },
    { p: 'Lantern’s loyalty-app members never tell the cafés that they have stopped coming; they just stop. In this <g>noncontractual setting</g> a customer’s departure is never observed, only inferred from silence, and a silence can end. So “churn” has no meaning until someone defines it. The two common definitions give very different numbers.' },
    { list: [
      '<b>Active this period, active next period.</b> Of the 905 members who visited in November 2027, 620 visited again in December: 68.5%. This is the analyst’s figure. But a month without a visit is not a departure. Of the 314 members who visited in September and not in October, 91 (29.0%) visited again in November or December. “Churn” of 31.5% a month would badly overstate how many members Lantern is losing.',
      '<b>A lapse rule.</b> A member has lapsed on a date if they haven’t visited for more than <i>L</i> days. On 31 December 2027, with <i>L</i> = 60, 1,324 of the 2,584 members (51.2%) had lapsed: the dashboard’s figure. With <i>L</i> = 30 it would be 1,609 (62.3%); with <i>L</i> = 90, 1,069 (41.4%). The rule, not the members, decides the answer.',
    ] },
    { p: 'The month-to-month version also hides a denominator trap of its own. December had 975 active members: 202 who joined in December, 620 who had also visited in November, and 153 who came back after skipping November. The contractual formula, (975 − 202) ÷ 905 = 85.4%, treats the 153 returners as if they had been kept from November, which they weren’t. In a noncontractual setting the end of a period has three kinds of customer, not two: kept, new and reactivated.' },
    { p: String.raw`A good lapse rule is chosen from the business, checked against later behaviour, and stated every time the figure is quoted. Choose <m>L</m> long enough that few “lapsed” customers come back: of the 909 members who on 31 October had been silent for more than 60 days, 68 (7.5%) visited in November or December. A rule that wrongly writes off 7.5% of its lapsers may be acceptable for counting; for deciding whom to send a win-back offer, the members it misclassifies are exactly the ones who matter. The <i>Predicting churn</i> lesson models the chance of coming back instead of drawing one line.` },

    { h: 'Members, too, look more loyal with tenure' },
    { p: 'The sorting effect appears in the members’ data. Pooling all cohorts, of the members who visited in the month they joined, 60.5% visited the next month; of those who visited in their fourth month after joining, 70.8% visited in their fifth. Pooled curves mix cohorts of different ages, so the later months come only from the earlier joiners. Restricting to the members who joined from March to July, who can all be followed for five months, gives the same start, 60.5%, and necessarily the same end, 70.8%, since only March–July joiners reach their fifth month; in between it is not a steady climb (64.1% in the second month, then 62.1%). The data were generated with each member visiting at a fixed rate and having a fixed chance of dropping out after each visit, so the rise can’t be growing loyalty: it is mostly sorting, with some help from the calendar, since each month since joining falls in different calendar months for different members.' },

    { h: 'Revenue retention' },
    { p: 'Customer retention counts heads. Businesses whose customers pay different and changing amounts also track how much of the revenue from existing customers they keep. Take the recurring revenue from customers at the start of a period. <g>Gross revenue retention</g> (GRR) keeps what is left after customers who leave and customers who downgrade, and can’t exceed 100%. <g>Net revenue retention</g> (NRR) also adds what continuing customers spend on upgrades, so it can exceed 100%. New customers are excluded from both, for the same reason as before.' },
    { p: 'Tarnfield Software (fictional) began the year with $400,000 of annual recurring revenue from 200 customers. Eighteen customers, worth $36,000, left; continuing customers downgraded by $12,000 and upgraded by $58,000; 30 new customers brought $90,000. Customer retention was 182 ÷ 200 = 91.0%. GRR was (400,000 − 36,000 − 12,000) ÷ 400,000 = 88.0% and NRR (352,000 + 58,000) ÷ 400,000 = 102.5%. Total revenue grew 25.0%, to $500,000, but most of that growth was bought with new customers. Definitions of these measures vary between companies (some use monthly revenue, some exclude price rises), so read the definition before comparing two firms’ figures.' },
  ],

  formulas: [
    { id: 'm06-period-retention', name: 'Retention and churn for a period',
      tex: String.raw`r = \dfrac{E - N}{S}, \qquad c = 1 - r`,
      where: [[String.raw`S`, 'Customers at the start of the period', 'customers'], [String.raw`E`, 'Customers at the end of the period', 'customers'], [String.raw`N`, 'Customers at the end who were won during the period', 'customers'], [String.raw`r`, 'Retention rate for the period', ''], [String.raw`c`, 'Churn rate for the period', '']],
      assumptions: 'Each customer’s status is known at both dates (a contractual setting). Customers won and lost within the period are in neither the start nor the end.',
      note: 'End ÷ start measures growth, not retention.' },
    { id: 'm06-compound-churn', name: 'Churn over several periods (constant rate)',
      tex: String.raw`c_T = 1 - (1 - c)^{T}, \qquad c = 1 - (1 - c_T)^{1/T}`,
      where: [[String.raw`c`, 'Churn rate per period (a month, say)', ''], [String.raw`T`, 'Number of periods in the longer horizon (12 months in a year)', 'periods'], [String.raw`c_T`, 'Churn rate over the T periods', '']],
      assumptions: 'The same churn rate applies in every period, to every customer.',
      note: 'In Excel: <x>=1-(1-B2)^12</x> for annual churn from monthly churn in B2.' },
    { id: 'm06-expected-lifetime', name: 'Expected lifetime (constant churn)',
      tex: String.raw`\text{Expected lifetime} = \dfrac{1}{c} = \dfrac{1}{1 - r}`,
      where: [[String.raw`c`, 'Churn rate per period', ''], [String.raw`r`, 'Retention rate per period', '']],
      assumptions: 'A constant churn rate; the first period counts as one period of the lifetime.',
      note: 'The median lifetime, ln 0.5 ÷ ln r, is shorter than the mean, because a few customers stay a long time.' },
    { id: 'm06-mixture-retention', name: 'A group’s retention when customers differ',
      tex: String.raw`S(t) = \sum_k w_k\, r_k^{\,t}, \qquad r_t = \dfrac{S(t)}{S(t-1)}`,
      where: [[String.raw`w_k`, 'Share of the starting customers of kind k', ''], [String.raw`r_k`, 'Retention rate per period for customers of kind k, fixed over time', ''], [String.raw`t`, 'Periods since the customers joined', 'periods'], [String.raw`S(t)`, 'Share of the starting customers still customers after t periods', ''], [String.raw`r_t`, 'The group’s retention rate in period t', '']],
      assumptions: 'Each customer’s rate is fixed; the kinds differ.',
      note: 'r_t rises with t towards the largest r_k: the sorting effect.' },
    { id: 'm06-revenue-retention', name: 'Gross and net revenue retention',
      tex: String.raw`\text{GRR} = \dfrac{R_0 - L - D}{R_0}, \qquad \text{NRR} = \dfrac{R_0 - L - D + U}{R_0}`,
      where: [[String.raw`R_0`, 'Recurring revenue from customers at the start of the period', '$'], [String.raw`L`, 'Revenue lost from customers who left', '$'], [String.raw`D`, 'Revenue lost from continuing customers who downgraded', '$'], [String.raw`U`, 'Revenue gained from continuing customers who upgraded', '$']],
      assumptions: 'New customers’ revenue is excluded from both.',
      note: 'Companies define these differently (monthly or annual revenue, price rises in or out); state the definition.' },
  ],

  examples: [
    { level: 'simple', title: 'Retention without the new customers', fictional: true,
      setup: 'Hartsop Fitness (fictional) had 1,800 members on 1 April and 1,950 on 30 June. During the quarter 420 people joined, of whom 390 were still members on 30 June. What were the quarter’s retention and churn rates, and what would “end ÷ start” have said?',
      steps: [
        'Identify the starting group: the 1,800 members on 1 April. Only they can be retained.',
        'Remove new members from the end: 1,950 − 390 = 1,560 of the 30 June members were members on 1 April. The 30 joiners who also left during the quarter were in neither count, so they need no adjustment.',
        'Retention = 1,560 ÷ 1,800 = 86.7%; churn = 1 − 0.867 = 13.3%, or 240 of the starting members.',
        'End ÷ start = 1,950 ÷ 1,800 = 108.3%: a growth figure, which includes the 390 new members.',
      ],
      answer: 'Retention 86.7%, churn 13.3% (240 members lost). The membership grew 8.3%.',
      interpretation: 'Hartsop is growing because it signs up more people than it loses, not because it loses few: about one member in seven left during the quarter. Reporting 108% as “retention” would hide that.' },

    { level: 'challenging', title: 'Projecting with one rate when customers differ', fictional: true,
      setup: 'Thistlebank Insurance (fictional) wins 1,000 home-insurance customers in one month: 500 renew each year with probability 50% and 500 with probability 90%. Its analyst sees 70% renew after the first year and projects that 0.7⁵ of them will still be customers after five renewals. Work out the group’s retention rate in years 2 and 3, the true share left after five renewals, and explain the gap.',
      steps: [
        'Year 1: 0.5 × 50% + 0.5 × 90% = 70%, so 700 renew: 250 of the first kind and 450 of the second.',
        'Year 2: 250 × 0.5 + 450 × 0.9 = 125 + 405 = 530 renew, so the group’s rate is 530 ÷ 700 = 75.7%.',
        'Year 3: 530 is 125 of the first kind and 405 of the second; 62.5 + 364.5 = 427 renew, 427 ÷ 530 = 80.6%.',
        'After five renewals: 500 × 0.5⁵ + 500 × 0.9⁵ = 15.6 + 295.2 = 310.9 customers, 31.1%. The analyst’s 0.7⁵ = 16.8% is barely more than half of that.',
      ],
      answer: 'The group’s retention rises from 70% to 75.7% and 80.6%; after five renewals 31.1% remain, against the 16.8% projected from a constant 70%.',
      interpretation: 'Each customer’s rate is constant, yet the group’s rate rises, because the customers likely to leave leave first. A projection from one early rate assumes the leavers keep leaving at the same pace and so writes off loyal customers who are in fact still there. For a business valuing its customers, that error compounds into lifetime value.' },

    { level: 'applied', title: 'What “churn” should Ana report?', fictional: true,
      setup: 'Ana wants one retention figure for the cafés’ loyalty app in her January 2028 report to Lantern’s board. She has the three candidates from the start of the lesson: 108% (December’s active members ÷ November’s), 68.5% (November’s visitors who visited in December) and 51.2% lapsed (no visit for more than 60 days on 31 December). Which should she use, and how should she word it?',
      steps: [
        'Reject 108%: December’s 975 active members include 202 new members and 153 who came back after skipping November. It is growth in activity, not retention.',
        'Treat 68.5% with care: it is month-to-month activity among November’s visitors, and a missed month is not a departure. Of September’s visitors who skipped October, 29.0% were back by December.',
        'The lapse rule gives a status for every member on a stated date: 1,324 of 2,584 members (51.2%) hadn’t visited for more than 60 days on 31 December. It depends on L (62.3% with 30 days, 41.4% with 90), so the rule must be in the sentence.',
        'Check the rule against later behaviour: of members silent for more than 60 days on 31 October, 7.5% visited in November or December, so most “lapsed” members really had stopped.',
      ],
      answer: 'Use the lapse rule and say what it is: “On 31 December 2027, 1,324 of our 2,584 app members (51.2%) had not visited for more than 60 days. About one in thirteen members who pass that point come back within two months.” Report month-to-month activity (68.5% of November’s visitors came again in December) as a separate, labelled measure of engagement.',
      interpretation: 'In a noncontractual business, a churn figure is a definition applied to silence. Stating the rule and its error rate lets the board compare like with like next year, and stops a busy December being read as 108% retention.' },
  ],

  demo: [
    { widget: 'ret-compound', intro: 'Set a monthly churn rate and see the annual churn it implies, against the tempting 12 × the monthly rate, and the expected and median lifetimes. Try 5% a month: annual churn is 46%, not 60%.' },
    { widget: 'ret-mix', intro: 'Two kinds of customer, each with a fixed retention rate. The group’s rate starts at their average and climbs as the leavers leave. Make the two rates equal and the climb disappears; make them far apart and the constant-rate projection falls far below the truth.' },
    { widget: 'ret-fh', intro: 'Fader and Hardie’s (2007) “Regular” customers. Look first at the second chart: the actual retention rate rises year after year, while a single constant rate is flat. The top chart shows what that does to a projection; the next lesson explains the sBG model and the fitting window.' },
  ],

  mistakes: [
    { title: 'Counting new customers as retained', html: 'End ÷ start, or (end − start) ÷ start, mixes acquisition into retention. Remove the customers won during the period from the end before dividing by the start.' },
    { title: 'Scaling churn by multiplying', html: 'Monthly churn of 3% is annual churn of 1 − 0.97¹² = 30.6%, not 36%. Rates compound; convert with powers, not multiplication.' },
    { title: 'Reading rising retention as growing loyalty', html: 'A group’s retention rises with tenure whenever customers differ, because the likeliest leavers go first. Projecting the first period’s rate for ever understates how many customers remain; reading the rise as each customer’s loyalty growing may be wrong.' },
    { title: 'Quoting a noncontractual churn figure without its rule', html: '“51% churn” is meaningless until the lapse rule is stated: 51.2% of members had not visited for more than 60 days on 31 December, but 62.3% for 30 days and 41.4% for 90. And a missed month is not a lost customer.' },
    { title: 'Treating net revenue retention as customer retention', html: 'NRR above 100% can coexist with many customers leaving, if those who stay spend more. Report customer retention and GRR alongside it.' },
  ],

  application: [
    { p: 'Retention figures go into budgets, valuations and bonuses, so the definition behind them is a business decision, not a technicality. A telecoms finance team that forecasts subscriber numbers needs churn on the same horizon as its forecast, compounded correctly, and from the customers at the start. A software company reporting net revenue retention to investors needs its definition fixed in advance, so the figure can’t be flattered by moving upgrades or price rises in and out.' },
    { p: 'The sorting effect changes how managers should read their dashboards. A rising retention rate among long-standing customers is good news about who they are, not necessarily about anything the business did; a falling rate among new customers may reflect who was recruited (a promotion that brought in deal-seekers) rather than worse service. Comparing cohorts at the same tenure, as the cohort-analysis lesson does, separates the two better than one blended rate.' },
    { case: 'Ana’s report to the board defines its terms. “Retention” is used only for contractual products, which start and stop. For the app’s members it reports two labelled measures: the share of each month’s visitors who visit the next month (68.5% from November to December), and the share lapsed on 31 December under a 60-day rule (51.2%), with the note that 7.5% of members past 60 days come back within two months. She adds a cohort chart instead of a single rate, because the members who joined in December can’t yet have lapsed under a 60-day rule.' },
    { p: 'In a noncontractual business, a lapse rule is a tool for counting, and every tool has an error rate. Choose L from how often customers normally buy (a café sees members weekly; a furniture shop might wait years), check how many “lapsed” customers come back, and keep the rule fixed so that figures from different years compare. When a decision depends on individual customers, such as whom to send an offer, replace the line with a prediction, which the next two lessons build.' },
  ],

  summary: [
    'Retention for a period = (customers at the end − those won during the period) ÷ customers at the start; churn = 1 − retention. End ÷ start measures growth (Corriemoor: 87.5% retention, 107.5% growth).',
    'Churn compounds: over T periods it is 1 − (1 − c)^T (12.5% a quarter is 41.4% a year, not 50%). With constant churn c the expected lifetime is 1 ÷ c periods.',
    'When customers differ, the group’s retention rises with tenure because the likeliest leavers go first (Fader and Hardie’s Regular customers: 63.1% in year 1, 94.5% by year 12). Projecting an early rate understates how many remain (Thistlebank: 16.8% projected, 31.1% actual).',
    'In a noncontractual setting churn is never observed and must be defined: a lapse rule of L days without a purchase. The rule decides the figure (51.2% of members at 60 days, 41.4% at 90), so state it and check how many “lapsed” customers come back.',
    'Month-to-month activity is not retention: missed months end, and December’s active members include new and reactivated members.',
    'Gross revenue retention removes lost and downgraded revenue; net revenue retention adds upgrades and can exceed 100%. Both exclude new customers.',
  ],

  glossary: [
    { term: 'Expected lifetime', def: 'The average number of periods a new customer stays, counting the first; with a constant churn rate c per period it is 1 ÷ c.' },
    { term: 'Sorting effect', def: 'The rise in a group’s retention rate with tenure that occurs when customers differ in their chance of leaving: those most likely to leave do so first, so the survivors are increasingly the loyal ones, even if no customer changes.' },
    { term: 'Lapse rule', def: 'A definition of churn for a noncontractual business: a customer counts as lapsed on a date if they have not bought for more than a stated number of days, L.' },
    { term: 'Gross revenue retention', def: 'The share of the recurring revenue from customers at the start of a period that remains at the end after losses from customers who leave and downgrade; new customers and upgrades are excluded, so it cannot exceed 100%.' },
    { term: 'Net revenue retention', def: 'The recurring revenue at the end of a period from customers who were there at the start, including their upgrades and net of losses and downgrades, divided by their revenue at the start; it can exceed 100%.' },
  ],

  references: [
    { text: 'Fader, P. S., & Hardie, B. G. S. (2007). How to project customer retention. <i>Journal of Interactive Marketing</i>, 21(1), 76–90.', url: 'https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Fader_hardie_jim_07.pdf', checked: '2026-11-01' },
    { text: 'Fader, P. S., & Hardie, B. G. S. (2009). Probability models for customer-base analysis. <i>Journal of Interactive Marketing</i>, 23(1), 61–69 (abstract: the contractual and noncontractual settings).', url: 'https://econpapers.repec.org/RePEc:eee:joinma:v:23:y:2009:i:1:p:61-69', checked: '2026-11-01' },
  ],

  checks: [
    // case narrative
    { what: 'Managers’ 108%: Dec active ÷ Nov active', value: pc(DEC.size / NOV.size), shown: 108, tol: 0.5 },
    { what: 'Analyst’s 68.5%', value: pc(keptND / NOV.size), shown: 68.5, tol: 0.05 },
    { what: 'Dashboard 51.2%', value: pc(lapsedAt(60) / ALL.length), shown: 51.2, tol: 0.05 },
    // Corriemoor
    { what: 'Corriemoor kept', value: CMR.kept, shown: 10500 },
    { what: 'Corriemoor retention %', value: pc(CMR.retention), shown: 87.5, tol: 0.05 },
    { what: 'Corriemoor churn %', value: pc(CMR.churn), shown: 12.5, tol: 0.05 },
    { what: 'Corriemoor lost', value: CMR.lost, shown: 1500 },
    { what: 'End ÷ start %', value: pc(CM.end / CM.start), shown: 107.5, tol: 0.05 },
    { what: 'Annual retention', value: 0.875 ** 4, shown: 0.586, tol: 0.0005 },
    { what: 'Annual retention %', value: pc(0.875 ** 4), shown: 58.6, tol: 0.05 },
    { what: 'Annual churn %', value: pc(CU.compoundChurn(CMR.churn, 4)), shown: 41.4, tol: 0.05 },
    { what: '4 × 12.5%', value: 4 * 12.5, shown: 50 },
    { what: 'Monthly equivalent %', value: pc(1 - 0.875 ** (1 / 3)), shown: 4.35, tol: 0.005 },
    { what: 'Expected lifetime quarters', value: CU.expectedLifetime(CMR.retention), shown: 8, tol: 1e-9 },
    { what: 'Median lifetime quarters', value: Math.log(0.5) / Math.log(0.875), shown: 5.2, tol: 0.05 },
    // Fader & Hardie Regular
    { what: 'FH year 1 %', value: pc(fhRate[0]), shown: 63.1, tol: 0.05 },
    { what: 'FH year 2 %', value: pc(fhRate[1]), shown: 74.2, tol: 0.05 },
    { what: 'FH year 3 %', value: pc(fhRate[2]), shown: 81.6, tol: 0.05 },
    { what: 'FH year 7 %', value: pc(fhRate[6]), shown: 92.0, tol: 0.05 },
    { what: 'FH year 12 %', value: pc(fhRate[11]), shown: 94.5, tol: 0.05 },
    { what: 'FH rate rises every year (claim)', value: Number(fhRate.every((r, i) => i === 0 || r > fhRate[i - 1])), shown: 1 },
    // Thistlebank
    { what: 'Thistlebank year 1 %', value: pc(tbR(1)), shown: 70, tol: 1e-9 },
    { what: 'Year 1 renew 700', value: TB.n * tbS(1), shown: 700, tol: 1e-9 },
    { what: '250 of first kind', value: 500 * TB.rA, shown: 250, tol: 1e-9 },
    { what: '450 of second kind', value: 500 * TB.rB, shown: 450, tol: 1e-9 },
    { what: '125', value: 250 * TB.rA, shown: 125, tol: 1e-9 },
    { what: '405', value: 450 * TB.rB, shown: 405, tol: 1e-9 },
    { what: '530', value: TB.n * tbS(2), shown: 530, tol: 1e-9 },
    { what: 'Year 2 %', value: pc(tbR(2)), shown: 75.7, tol: 0.05 },
    { what: '62.5', value: 125 * TB.rA, shown: 62.5, tol: 1e-9 },
    { what: '364.5', value: 405 * TB.rB, shown: 364.5, tol: 1e-9 },
    { what: '427', value: TB.n * tbS(3), shown: 427, tol: 1e-9 },
    { what: 'Year 3 %', value: pc(tbR(3)), shown: 80.6, tol: 0.05 },
    { what: 'Group rate keeps rising towards 90% (claim)', value: Number([2, 3, 4, 5, 10, 20].every((t) => tbR(t) > tbR(t - 1) && tbR(t) < TB.rB)), shown: 1 },
    { what: '0.7^5 %', value: pc(0.7 ** 5), shown: 16.8, tol: 0.05 },
    { what: 'True five-year share %', value: pc(tbS(5)), shown: 31.1, tol: 0.05 },
    { what: '15.6', value: 500 * 0.5 ** 5, shown: 15.6, tol: 0.05 },
    { what: '295.2', value: 500 * 0.9 ** 5, shown: 295.2, tol: 0.05 },
    { what: '310.9', value: TB.n * tbS(5), shown: 310.9, tol: 0.05 },
    // members: month to month
    { what: 'November active', value: NOV.size, shown: 905 },
    { what: 'Visited Nov and Dec', value: keptND, shown: 620 },
    { what: 'September, not October', value: sepGap.length, shown: 314 },
    { what: 'Of them back Nov–Dec', value: sepBack, shown: 91 },
    { what: 'Back %', value: pc(sepBack / sepGap.length), shown: 29.0, tol: 0.05 },
    { what: '1 − 68.5%', value: 100 - 68.5, shown: 31.5, tol: 1e-9 },
    { what: 'Members', value: ALL.length, shown: 2584 },
    { what: 'Lapsed L=60', value: lapsedAt(60), shown: 1324 },
    { what: 'Lapsed L=30', value: lapsedAt(30), shown: 1609 },
    { what: 'Lapsed L=30 %', value: pc(lapsedAt(30) / ALL.length), shown: 62.3, tol: 0.05 },
    { what: 'Lapsed L=90', value: lapsedAt(90), shown: 1069 },
    { what: 'Lapsed L=90 %', value: pc(lapsedAt(90) / ALL.length), shown: 41.4, tol: 0.05 },
    { what: 'December active', value: DEC.size, shown: 975 },
    { what: 'December joiners', value: decJoin.size, shown: 202 },
    { what: 'Reactivated in December', value: reactND, shown: 153 },
    { what: '975 = 202 + 620 + 153', value: decJoin.size + keptND + reactND, shown: 975 },
    { what: 'Contractual formula on members %', value: pc(wrongND.retention), shown: 85.4, tol: 0.05 },
    { what: 'Quiet > 60 days on 31 Oct', value: quiet60.length, shown: 909 },
    { what: 'Of them visited Nov–Dec', value: quiet60back, shown: 68 },
    { what: 'Came back %', value: pc(quiet60back / quiet60.length), shown: 7.5, tol: 0.05 },
    { what: 'One in thirteen', value: quiet60.length / quiet60back, shown: 13, tol: 0.5 },
    // members: next-month activity by tenure
    { what: 'Pooled month 0 %', value: pc(POOL[0].r), shown: 60.5, tol: 0.05 },
    { what: 'Pooled month 4 %', value: pc(POOL[4].r), shown: 70.8, tol: 0.05 },
    { what: 'Pooled rises every month 0–4 (claim)', value: Number(POOL.every((p, k) => k === 0 || p.r > POOL[k - 1].r)), shown: 1 },
    { what: 'Mar–Jul month 0 %', value: pc(EARLY[0].r), shown: 60.5, tol: 0.05 },
    { what: 'Mar–Jul month 1 %', value: pc(EARLY[1].r), shown: 64.1, tol: 0.05 },
    { what: 'Mar–Jul month 2 %', value: pc(EARLY[2].r), shown: 62.1, tol: 0.05 },
    { what: 'Mar–Jul month 4 %', value: pc(EARLY[4].r), shown: 70.8, tol: 0.05 },
    { what: 'Mar–Jul not a steady climb (claim)', value: Number(EARLY[2].r < EARLY[1].r), shown: 1 },
    // Tarnfield
    { what: 'Customer retention %', value: pc((TS.n - TS.lostN) / TS.n), shown: 91.0, tol: 0.05 },
    { what: '182', value: TS.n - TS.lostN, shown: 182 },
    { what: 'GRR %', value: pc(GRR), shown: 88.0, tol: 0.05 },
    { what: '352,000', value: TS.arr - TS.lost - TS.down, shown: 352000 },
    { what: 'NRR %', value: pc(NRR), shown: 102.5, tol: 0.05 },
    { what: 'Total revenue end', value: TS.arr - TS.lost - TS.down + TS.up + TS.newArr, shown: 500000 },
    { what: 'Growth %', value: pc((TS.arr - TS.lost - TS.down + TS.up + TS.newArr) / TS.arr - 1), shown: 25.0, tol: 0.05 },
    // Hartsop example
    { what: 'Hartsop kept', value: 1950 - 390, shown: 1560 },
    { what: 'Hartsop retention %', value: pc(CU.periodRetention({ start: 1800, end: 1950, acquired: 390 }).retention), shown: 86.7, tol: 0.05 },
    { what: 'Hartsop churn %', value: pc(CU.periodRetention({ start: 1800, end: 1950, acquired: 390 }).churn), shown: 13.3, tol: 0.05 },
    { what: 'Hartsop lost', value: 1800 - 1560, shown: 240 },
    { what: 'Hartsop joiners who left', value: 420 - 390, shown: 30 },
    { what: 'End ÷ start %', value: pc(1950 / 1800), shown: 108.3, tol: 0.05 },
    { what: 'Growth 8.3%', value: pc(1950 / 1800 - 1), shown: 8.3, tol: 0.05 },
    { what: 'One in seven', value: 1800 / 240, shown: 7, tol: 0.6 },
    // demo and mistakes
    { what: '5% monthly → annual 46%', value: pc(CU.compoundChurn(0.05, 12)), shown: 46, tol: 0.5 },
    { what: '12 × 5%', value: 12 * 5, shown: 60 },
    { what: '3% monthly → annual 30.6%', value: pc(CU.compoundChurn(0.03, 12)), shown: 30.6, tol: 0.05 },
    { what: '12 × 3%', value: 12 * 3, shown: 36 },
  ],
};
