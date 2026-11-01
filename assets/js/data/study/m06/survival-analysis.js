// survival-analysis.js — M06 · Survival analysis. Content only; exercises are in survival-analysis.ex.js. Time to churn
// with censoring: the Kaplan–Meier estimator on a fictional climbing centre's members (Glaisdale) and on the cafés'
// loyalty-app members with a lapse rule (case.js lapseData, as of 31 December 2027); the log-rank test; then
// contractual projection with the shifted-beta-geometric model on Fader & Hardie's (2007) published High End data.
// The project's subscriptions are not used. Every figure printed is recomputed in `checks`.
import { MEMBER_LIST, lapseData } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

const pc = (x) => x * 100;
const med = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

// ---------------------------------------------------------------- Glaisdale Climbing Centre (fictional), months
const GT = [2, 3, 3, 5, 6, 7, 8, 10, 12, 12], GE = [1, 1, 0, 1, 0, 1, 0, 1, 0, 0];
const GKM = CU.kaplanMeier(GT, GE);
const gs = (t) => GKM.steps.find((s) => s.t === t);
const GDROP = CU.kaplanMeier(GT.filter((_, i) => GE[i]), GT.filter((_, i) => GE[i]).map(() => 1));
const gw7 = 1 / (10 * 9) + 1 / (9 * 8) + 1 / (7 * 6) + 1 / (5 * 4);

// ---------------------------------------------------------------- members, lapse rule L = 60 (and 30, 90)
const LD = lapseData();
const byId = new Map(MEMBER_LIST.map((m) => [m.id, m]));
const T60 = CU.lapseTimes(LD, 60), T30 = CU.lapseTimes(LD, 30), T90 = CU.lapseTimes(LD, 90);
const KM60 = CU.kaplanMeier(T60.times, T60.events), KM30 = CU.kaplanMeier(T30.times, T30.events), KM90 = CU.kaplanMeier(T90.times, T90.events);
const st90 = KM60.steps.filter((s) => s.t <= 90).pop();
const zero60 = T60.times.filter((x, i) => x === 0 && T60.events[i]).length;
const ev60 = T60.times.filter((_, i) => T60.events[i]);
const DROP = CU.kaplanMeier(ev60, ev60.map(() => 1)), ASLAPSED = CU.kaplanMeier(T60.times, T60.times.map(() => 1));
const lateIdx = T60.ids.map((id, i) => i).filter((i) => byId.get(T60.ids[i]).joinedIso >= '2027-11-01');
const groupKM = (T, key, val) => { const ix = T.ids.map((_, i) => i).filter((i) => byId.get(T.ids[i])[key] === val); return CU.kaplanMeier(ix.map((i) => T.times[i]), ix.map((i) => T.events[i])); };
const ON = groupKM(T60, 'notifications', 1), OFF = groupKM(T60, 'notifications', 0);
const lrBy = (T, key) => CU.logRank(T.times, T.events, T.ids.map((id) => byId.get(id)[key]));
const LRN60 = lrBy(T60, 'notifications'), LRN30 = lrBy(T30, 'notifications'), LRN90 = lrBy(T90, 'notifications');
const LRC60 = lrBy(T60, 'cafe'), LRC30 = lrBy(T30, 'cafe'), LRC90 = lrBy(T90, 'cafe');
const obs = (lr, g) => lr.observed[lr.groups.indexOf(g)], expd = (lr, g) => lr.expected[lr.groups.indexOf(g)];
const HB = groupKM(T60, 'cafe', 'Harbourside'), MB = groupKM(T60, 'cafe', 'Millbrook');

// ---------------------------------------------------------------- Fader & Hardie (2007), Table 1, High End and Regular
const FH_HIGH = [100, 86.9, 74.3, 65.3, 59.3, 55.1, 51.7, 49.1, 46.8, 44.5, 42.7, 40.9, 39.4];
const FH_REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1, 22.3, 20.7, 19.4, 18.3, 17.3];
const toCounts = (a) => a.map((v) => Math.round(v * 10));
// both fits to the first `fit` periods, as the sbg widget computes them: sBG by maximum likelihood; constant retention =
// renewals ÷ chances to renew over the window
function sbgCompute(cohorts, fit) {
  const cut = cohorts.map((c) => ({ alive: c.alive.slice(0, fit + 1) }));
  let renew = 0, chances = 0;
  for (const { alive } of cut) for (let t = 1; t < alive.length; t++) { renew += alive[t]; chances += alive[t - 1]; }
  return { sbg: CU.sbgFit(cut), r: renew / chances };
}
const HI = sbgCompute([{ alive: toCounts(FH_HIGH) }], 7), RG = sbgCompute([{ alive: toCounts(FH_REG) }], 7);
const hs = HI.sbg, rs = RG.sbg;

// ---------------------------------------------------------------- figure: Glaisdale's Kaplan–Meier curve
const f1 = (x) => Math.round(x * 10) / 10;
function kmFigure() {
  const x0 = 60, x1 = 420, y0 = 250, y1 = 30;
  const X = (t) => x0 + t / 12 * (x1 - x0), Y = (v) => y0 - v * (y0 - y1);
  let s = '<svg viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  [0, 0.5, 1].forEach((v) => { s += `<line x1="${x0}" x2="${x1}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--rule-strong)" stroke-dasharray="3 4"/><text x="${x0 - 8}" y="${f1(Y(v)) + 5}" text-anchor="end" fill="var(--ink-3)">${Math.round(v * 100)}%</text>`; });
  [0, 3, 6, 9, 12].forEach((t) => { s += `<text x="${f1(X(t))}" y="${y0 + 24}" text-anchor="middle" fill="var(--ink-3)">${t}</text>`; });
  s += `<text x="${(x0 + x1) / 2}" y="${y0 + 46}" text-anchor="middle">Months since joining</text>`;
  let d = `M${X(0)},${Y(1)}`, prev = 1;
  for (const st of GKM.steps) { d += `L${f1(X(st.t))},${f1(Y(prev))}L${f1(X(st.t))},${f1(Y(st.S))}`; prev = st.S; }
  d += `L${f1(X(12))},${f1(Y(prev))}`;
  s += `<path d="${d}" fill="none" stroke="var(--series-1)" stroke-width="2.8"/>`;
  GT.forEach((t, i) => { if (!GE[i]) { const v = GKM.at(t); s += `<line x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${f1(Y(v) - 9)}" y2="${f1(Y(v) + 9)}" stroke="var(--series-2)" stroke-width="2.6"/>`; } });
  s += `<line x1="70" x2="96" y1="318" y2="318" stroke="var(--series-1)" stroke-width="2.8"/><text x="102" y="323">share not yet left</text>`;
  s += `<line x1="270" x2="270" y1="309" y2="327" stroke="var(--series-2)" stroke-width="2.6"/><text x="280" y="323">censored</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'survival-analysis',
  title: 'Survival analysis',
  blurb: 'Measure how long customers stay when some of them haven’t left yet. Estimate a survival curve with the Kaplan–Meier method, compare groups with the log-rank test, define lapsing for customers who never cancel, and project contractual retention with a model that lets customers differ.',
  status: 'draft',
  objectives: [
    'Explain censoring and show why dropping censored customers, or counting them as churned, biases estimates of how long customers stay.',
    'Calculate a Kaplan–Meier survival curve step by step, read the median lifetime from it, and interpret Greenwood standard errors and confidence intervals.',
    'Compare the survival of two groups with the log-rank test and state what the result does and doesn’t show.',
    'Define lapsing for a noncontractual business and explain how the length of the lapse rule changes the survival curve.',
    'Apply the shifted-beta-geometric model to project contractual retention, and evaluate it against constant retention on periods not used for fitting.',
  ],
  prerequisites: [
    { lesson: 'm06/retention-and-churn-rates', why: 'Retention and churn rates, lapse rules, and why a group’s retention rises when customers differ.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'Chi-square tests of observed against expected counts, the idea behind the log-rank test.' },
    { lesson: 'b04/confidence-intervals', why: 'Standard errors and 95% intervals.' },
    { lesson: 'b06/logistic-regression', why: 'Maximum likelihood, used to fit the sBG model.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana wants to know how long a new loyalty-app member keeps coming to the cafés. The obvious calculation, the average time from joining to the last visit, gives a strangely short answer, and it is short for a reason: the members who are still coming haven’t had their last visit yet. A member who joined in November can’t have been a member for more than two months, however loyal. Any honest answer has to use what is known about them, which is that they are still here, without pretending to know when they will stop.' },

    { h: 'Time to churn and censoring' },
    { p: 'Survival analysis studies the time until an event, here a customer leaving. For each customer it needs two things: a time, and whether the event was seen. A customer who left after 7 months contributes a time of 7 and an event. A customer who joined 5 months ago and is still a customer contributes a time of 5 and no event: all we know is that their lifetime is longer than 5 months. That incomplete observation is <g>censoring</g>, and almost every customer dataset has it, because the data stop on a date while customers are still active.' },
    { p: 'Glaisdale Climbing Centre (fictional) follows ten members who joined at different times over the past year. Five have cancelled, after 2, 3, 5, 7 and 10 months. Five are still members today, having joined 3, 6, 8, 12 and 12 months ago, so their lifetimes are at least that long. Two shortcuts both mislead. Dropping the five censored members and looking only at the cancellers says the median membership lasts 5 months and that nobody stays beyond 10: it keeps only the people who left. Counting the five as if they cancelled today gives a median of 6.5 months: it invents departures. Both answers are too short.' },

    { h: 'The Kaplan–Meier estimator' },
    { p: 'The <g>Kaplan–Meier estimator</g> uses every member for exactly as long as they were watched. At each time when someone leaves, it asks: of the members still being watched just before then (the <b>risk set</b>), what share stayed? The <g>survival function</g> S(t), the share of members expected still to be members after time t, is the running product of those shares.' },
    { table: {
      caption: 'Glaisdale Climbing Centre: the Kaplan–Meier calculation (fictional)',
      head: ['Month', 'At risk', 'Cancelled', 'Share staying', 'S(t)'],
      rows: [
        ['2', '10', '1', '9/10', '0.900'],
        ['3', '9', '1', '8/9', '0.800'],
        ['5', '7', '1', '6/7', '0.686'],
        ['7', '5', '1', '4/5', '0.549'],
        ['10', '3', '1', '2/3', '0.366'],
      ],
      align: ['r', 'r', 'r', 'r', 'r'],
      note: 'The member censored at month 3 is still counted at risk at month 3 (they were there when the month-3 cancellation happened) and leaves the risk set afterwards; those censored at 6 and 8 leave it before months 7 and 10.',
    } },
    { p: 'After month 2, 9 of 10 remain: S = 0.900. At month 3, 8 of the 9 still at risk stay: S = 0.900 × 8/9 = 0.800. Between months 3 and 5 two members leave the risk set, one by cancelling at month 3 and one by being censored, so 7 are at risk at month 5 and S = 0.800 × 6/7 = 0.686. The censored members never cause a drop; they simply stop being counted. The <b>median lifetime</b> is the first time at which S falls to 0.5 or below: 10 months, twice what the cancellers-only shortcut said.' },
    { figure: {
      svg: kmFigure(),
      caption: 'Glaisdale’s Kaplan–Meier curve (fictional): a step down at each cancellation, and a tick where a member was censored. The curve stops at 36.6% because nobody was seen to cancel after month 10.',
      alt: 'A step chart of the share of members not yet left, from 100% at month 0. It steps down to 90% at month 2, 80% at month 3, 68.6% at month 5, 54.9% at month 7 and 36.6% at month 10, then stays flat to month 12. Short vertical ticks on the curve mark the censored members at months 3, 6, 8 and 12.',
    } },

    { h: 'Members who never cancel: lapsing' },
    { p: 'Lantern’s app members don’t cancel, so the event has to be defined, as the previous lesson did, with a lapse rule. Here a member <b>lapses</b> at a visit that is followed by more than L days without another; their lifetime is the days from joining to that visit. A member whose last visit is within L days of 31 December 2027 hasn’t lapsed yet and is censored at their last visit. With L = 60, of the 2,584 members, 1,540 had lapsed and 1,044 were censored. 469 lapsed at day 0: they joined and didn’t come back within 60 days. All 423 members who joined in November or December are censored; none can have had 60 days of silence yet.' },
    { p: 'The Kaplan–Meier curve for the members starts with that drop at day 0, to 81.8%, and falls fastest in the first weeks: 61.1% are still active (not lapsed) at 30 days, 38.1% at 90 days and 25.4% at 180. The median lifetime is 52 days. The shortcuts are wrong here by even more than at Glaisdale: using only the members who lapsed gives a median of 17 days, and counting the censored members as lapsed gives 31.' },
    { p: 'The rule matters as much as the method. With L = 30 the median is 20 days; with L = 90 it is 93 days. A short rule calls every holiday a lapse; a long one counts members as active long after they have stopped. The survival widget below lets you change L and watch the curves move.' },

    { h: 'Comparing groups' },
    { p: 'Members with notifications on (1,418) and off (1,166) give two curves. With L = 60 the medians are 57 and 48 days, and 41.1% against 34.5% are still active at 90 days. The <g>log-rank test</g> asks whether the curves differ by more than chance: at each lapse time it compares the lapses seen in each group with those expected if both groups shared one curve, and adds up the differences. Members with notifications on had 815 lapses against 871.0 expected; χ² = 8.83 on 1 df, p = 0.003. The difference is unlikely to be chance.' },
    { callout: 'warn', title: 'A difference in survival is an association', html: 'Members chose whether to turn notifications on. The log-rank test says the two groups’ curves differ; it can’t say that turning notifications on would make a member stay longer. Keener members may both choose notifications and keep coming. Only a randomised test, as in B06, measures the effect of switching them on.' },
  ],

  theory: [
    { h: 'The estimator and its standard error' },
    { p: String.raw`Order the distinct event times <m>t_1 < t_2 < \dots</m>. At each, let <m>n_j</m> be the number at risk (still watched and not yet churned just before <m>t_j</m>, including anyone censored at <m>t_j</m>) and <m>d_j</m> the number who churn at <m>t_j</m>. Then <m>\hat S(t) = \prod_{t_j \le t} (1 - d_j/n_j)</m>. The fraction <m>d_j/n_j</m> is the <b>hazard</b> at <m>t_j</m>, the churn rate among those still there; the survival curve is built from hazards exactly as the previous lesson built multi-period retention from per-period retention.` },
    { p: String.raw`<b>Greenwood’s formula</b> gives the standard error: <m>\text{SE}(\hat S(t)) = \hat S(t)\sqrt{\sum_{t_j \le t} d_j / [n_j(n_j - d_j)]}</m>. At Glaisdale’s month 7, the sum is 1/90 + 1/72 + 1/42 + 1/20 = 0.0988, so SE = 0.5486 × √0.09881 = 0.172. With ten members the estimate is very uncertain. A 95% interval of S ± 1.96 SE can run below 0 or above 1, so software usually works on the log(−log S) scale and transforms back, which keeps the limits inside 0 to 1: here 0.187 to 0.806. For the 2,584 members at 90 days, S = 38.1% with SE 1.1 points and a 95% interval of 36.0% to 40.2%.` },
    { list: [
      '<b>Censoring must be uninformative.</b> The method assumes that a censored customer’s chance of churning is the same as that of customers still watched. Censoring because the data end on a date is usually fine. Censoring because a customer moved to a partner business, or because their records were deleted when they complained, may not be.',
      '<b>Late entrants.</b> Customers who joined late are watched for a short time and censored early. Kaplan–Meier uses them for the early part of the curve only; the tail rests on the earliest joiners. If the business changed, the tail describes the old customers.',
      '<b>The curve stops where the data stop.</b> If the last observation is censored, the curve never reaches 0, and the median is “not reached” if it never falls to 0.5. The mean lifetime can’t be estimated without assumptions about the tail.',
    ] },

    { h: 'The log-rank test' },
    { p: String.raw`At each event time, the risk sets give the expected churners in each group if both shared one curve: group A’s share of those at risk times all churners at that time. Summing gives the observed (O) and expected (E) churn for each group. The simplest form of the statistic is <m>\sum (O - E)^2 / E</m> over the groups, compared with a chi-square distribution on (groups − 1) degrees of freedom; software uses a slightly more exact variance, which this course’s engine and the widget use. The test compares whole curves, weighting every event time equally. It is weak when curves cross (one group lapses early and the other late), so always look at the curves as well, and it gives a p-value, not the size of a difference: report the medians or survival at chosen times alongside it.` },
    { p: 'For the cafés, the conclusion depends on L. Millbrook members (median 54 days with L = 60) and Harbourside members (51 days) differ with χ² = 5.30, p = 0.021, at L = 60; at L = 30 the difference is stark (χ² = 23.90, p below 0.001); at L = 90 it isn’t clear (χ² = 2.34, p = 0.126). The notifications difference holds at all three (p = 0.004, 0.003 and 0.031). A finding that survives a range of sensible lapse rules is more trustworthy than one that appears at only one.' },

    { h: 'Projecting contractual retention' },
    { p: 'Kaplan–Meier describes the past; it can’t say what happens after the last observation. For contractual customers, who renew or don’t at known periods, a model can. The simplest assumes a constant retention rate r, so <m>S(t) = r^t</m>. The previous lesson showed why this fails when customers differ: the group’s retention rises as the flighty leave.' },
    { p: String.raw`The <g>shifted-beta-geometric model</g> (sBG) of Fader and Hardie (2007) builds that in. Each customer has their own churn probability <m>\theta</m>, the same in every period, so their lifetime is geometric. Across customers, <m>\theta</m> follows a beta distribution with parameters <m>\alpha</m> and <m>\beta</m>, a flexible family of distributions on 0 to 1; the mean churn probability is <m>\alpha/(\alpha + \beta)</m>. Averaged over customers, the share still active after <m>t</m> periods and the retention rate in period <m>t</m> are` },
    { math: String.raw`S(t) = \frac{B(\alpha, \beta + t)}{B(\alpha, \beta)}, \qquad r_t = \frac{S(t)}{S(t-1)} = \frac{\beta + t - 1}{\alpha + \beta + t - 1},` },
    { p: String.raw`where <m>B</m> is the beta function. The retention rate rises with <m>t</m> towards 1, faster when <m>\alpha</m> is small relative to <m>\beta</m>. The two parameters are fitted by maximum likelihood to the counts still active after each period: customers who churned in period <m>t</m> contribute <m>\log P(T = t)</m>, those still active at the end <m>\log S(T)</m>. Fader and Hardie show the model can be fitted in a spreadsheet.` },
    { p: 'Their High End customers, fitted to years 0–7 only, give α = 0.668 and β = 3.806 (standard errors 0.104 and 0.786), so the average new customer has a 14.9% chance of leaving in a year, with retention rising from 85.1% in year 1 to 94.2% in year 8. The model projects that 37.8% of the customers are still active after 12 years; the actual figure, unseen when fitting, is 39.4%. A constant retention rate fitted to the same seven years (89.7% a year) projects 27.0%. For the Regular customers (α = 0.704, β = 1.182) the sBG projects 17.0% against an actual 17.3%, and constant retention 4.6%. Fader and Hardie report that regression curves fitted to survival over time project far worse, and that the sBG’s year-12 figures are within 4% (High End) and 2% (Regular) of the truth.' },
    { callout: 'note', title: 'A typo in the source', html: 'The paper’s text gives α = 0.688 for the High End segment; its appendix, and the fit in this course’s engine, give 0.668. Use 0.668.' },
    { p: 'The sBG is for contractual settings, where a customer is either renewed or gone. For noncontractual customers such as the cafés’ members, the equivalent models (the Pareto/NBD and BG/NBD families; Fader, Hardie and Lee 2005) describe each customer’s buying and their unseen drop-out together, and give from recency and frequency the probability that a customer is still active; the members’ data were in fact generated from a process of that kind. They are beyond this course; the next lesson predicts lapsing with logistic regression instead.' },
  ],

  formulas: [
    { id: 'm06-kaplan-meier', name: 'The Kaplan–Meier estimator',
      tex: String.raw`\hat S(t) = \prod_{t_j \le t} \left(1 - \frac{d_j}{n_j}\right)`,
      where: [[String.raw`t_j`, 'The distinct times at which at least one customer churned', 'periods or days'], [String.raw`n_j`, 'Customers at risk just before t_j: still watched and not yet churned (those censored at t_j included)', 'customers'], [String.raw`d_j`, 'Customers who churned at t_j', 'customers'], [String.raw`\hat S(t)`, 'Estimated share of customers who have not churned by time t', ''], [String.raw`t`, 'Time since joining', 'periods or days']],
      assumptions: 'Censoring is uninformative: censored customers would have churned at the same rate as those still watched.',
      note: 'The median lifetime is the first t with Ŝ(t) ≤ 0.5. In a worksheet: <x>=H2*(1-G3/F3)</x>, filled down, with at-risk counts from <x>=COUNTIF($B$2:$B$21,">="&E3)</x>.' },
    { id: 'm06-greenwood', name: 'Greenwood’s standard error',
      tex: String.raw`\text{SE}\big(\hat S(t)\big) = \hat S(t)\sqrt{\sum_{t_j \le t} \frac{d_j}{n_j (n_j - d_j)}}`,
      where: [[String.raw`\hat S(t)`, 'Kaplan–Meier estimate at t', ''], [String.raw`n_j, d_j`, 'At risk and churned at each event time up to t', 'customers']],
      assumptions: 'Large risk sets; the interval S ± 1.96 SE can leave 0 to 1, so a log–log interval is usually reported.',
      note: 'This course’s engine and widget give log–log 95% limits, which stay inside 0 to 1.' },
    { id: 'm06-logrank', name: 'The log-rank test (simple form)',
      tex: String.raw`\chi^2 \approx \sum_{g} \frac{(O_g - E_g)^2}{E_g}, \qquad E_g = \sum_j d_j \frac{n_{gj}}{n_j}`,
      where: [[String.raw`O_g`, 'Churners observed in group g', 'customers'], [String.raw`E_g`, 'Churners expected in group g if all groups shared one survival curve', 'customers'], [String.raw`n_{gj}`, 'Group g’s customers at risk at event time j', 'customers'], [String.raw`n_j, d_j`, 'All customers at risk, and all churners, at event time j', 'customers']],
      assumptions: 'Uninformative censoring in each group. Compared with chi-square on (groups − 1) df.',
      note: 'Software uses a variance-based version of the statistic; it gives similar values.' },
    { id: 'm06-sbg', name: 'The shifted-beta-geometric (sBG) model',
      tex: String.raw`S(t) = \frac{B(\alpha, \beta + t)}{B(\alpha, \beta)}, \qquad r_t = \frac{\beta + t - 1}{\alpha + \beta + t - 1}, \qquad \bar\theta = \frac{\alpha}{\alpha + \beta}`,
      where: [[String.raw`\alpha, \beta`, 'Parameters of the beta distribution of customers’ churn probabilities', ''], [String.raw`B`, 'The beta function', ''], [String.raw`S(t)`, 'Share of a cohort still active after t periods', ''], [String.raw`r_t`, 'Retention rate in period t: the share of those active at the start of period t who renew', ''], [String.raw`\bar\theta`, 'Mean churn probability of a new customer', ''], [String.raw`t`, 'Periods since joining', 'periods']],
      assumptions: 'Contractual renewals at discrete periods; each customer’s churn probability is fixed over time; probabilities vary across customers as a beta distribution.',
      note: 'In a worksheet, without the beta function: S(t) = S(t − 1) × r_t, starting from S(0) = 1.' },
  ],

  examples: [
    { level: 'simple', title: 'A survival curve by hand', fictional: true,
      setup: 'Coniston Swim School (fictional) follows eight pupils from their first lesson. Pupils A to H left, or were last seen still enrolled, after these months: A 1 (left), B 2 (still enrolled), C 4 (left), D 4 (left), E 5 (still enrolled), F 6 (left), G 8 (still enrolled), H 9 (still enrolled). Estimate S(t) and the median time enrolled.',
      steps: [
        'Order the times at which pupils left: 1, 4 and 6 months. Censored pupils (B, E, G, H) never cause a step.',
        'Month 1: 8 at risk, 1 leaves: S = 7/8 = 0.875.',
        'Month 4: B was censored at month 2, so 6 are at risk; 2 leave: S = 0.875 × 4/6 = 0.583.',
        'Month 6: E was censored at month 5, so 3 are at risk (F, G, H); 1 leaves: S = 0.583 × 2/3 = 0.389.',
        'The first time S falls to 0.5 or below is month 6: the median.',
      ],
      answer: 'S(1) = 0.875, S(4) = 0.583, S(6) = 0.389; median time enrolled 6 months.',
      interpretation: 'Half of new pupils are expected to have left by six months. With eight pupils the estimate is rough (Greenwood’s SE at month 6 is about 0.20), but it uses all eight, including the four still enrolled.' },

    { level: 'challenging', title: 'Does a member’s notification setting go with staying longer, and under which rule?', fictional: true,
      setup: 'Using the members’ lapse data as of 31 December 2027, compare members with notifications on and off. Is the difference clear, does it depend on the lapse rule, and what can Ana conclude?',
      steps: [
        'With L = 60: medians 57 days (on, 1,418 members) and 48 days (off, 1,166); still active at 90 days, 41.1% against 34.5%.',
        'Log-rank: lapses observed among members with notifications on were 815 against 871.0 expected under one shared curve; χ² = 8.83 on 1 df, p = 0.003.',
        'Repeat with other rules: p = 0.004 with L = 30 and p = 0.031 with L = 90. The difference survives each rule.',
        'Contrast the cafés: Millbrook against Harbourside gives p below 0.001 at L = 30, 0.021 at 60 and 0.126 at 90: a difference that depends on the rule.',
      ],
      answer: 'Members with notifications on stayed active longer (median 57 against 48 days at L = 60), and the difference is clear under every rule tried (p from 0.003 to 0.031).',
      interpretation: 'The finding is robust to the lapse rule but not causal: members chose the setting. It supports testing notifications by randomising a default for new members, which B06 recommended for returns within 30 days; it doesn’t say how many extra days switching them on would buy.' },

    { level: 'applied', title: 'Projecting a contract business’s customers', fictional: true,
      setup: 'A firm with Fader and Hardie’s High End retention data has seen seven years of renewals and wants to forecast how many of a cohort of 1,000 will still be customers in year 12. Compare a constant-retention forecast with the sBG, fitted to the same years, and check both against the year-12 figure the firm later saw (394).',
      steps: [
        'Constant retention: over years 1–7, renewals ÷ chances to renew = 89.7% a year, so the forecast is 1,000 × 0.897¹² = 270 customers.',
        'sBG by maximum likelihood on the counts for years 0–7: α = 0.668, β = 3.806; mean first-year churn 14.9%.',
        'sBG forecast: S(12) = B(0.668, 15.806) ÷ B(0.668, 3.806) = 0.378, or 378 customers; the implied retention rate in year 12 is (3.806 + 11) ÷ (0.668 + 3.806 + 11) = 95.7%.',
        'Against the actual 394: the sBG is 16 customers short (4%), constant retention 124 short (31%).',
      ],
      answer: 'Constant retention forecasts 270 customers in year 12 and the sBG 378; 394 remained.',
      interpretation: 'Constant retention carries the early leavers’ churn rate into years when only loyal customers are left, so it writes off about a third of the survivors. For valuing the customer base, the difference compounds: the customer-lifetime-value lesson uses the sBG to show how much value an average retention rate misses.' },
  ],

  demo: [
    { widget: 'surv-glaisdale', intro: 'Glaisdale’s ten members. The table shows each step of the calculation, with Greenwood’s standard error and the 95% interval; notice how wide the band is with ten members, and that the curve stops at 36.6%.' },
    { widget: 'surv-lapse', intro: 'The cafés’ 2,584 members, split by notifications. Change how many days without a visit count as lapsed: the curves, the medians and the log-rank test all move. Which conclusions survive every choice?' },
    { widget: 'surv-sbg', intro: 'Fader and Hardie’s High End customers. Both models are fitted only to the years up to the slider; the years after it are a test. Fit to 3 years, then 7: the sBG stays close to the actual curve, constant retention falls below it, and in the lower chart only the sBG rises with the actual retention rates.' },
    { widget: 'surv-sbg-shape', intro: 'Choose α and β for the sBG and see the survival curve, the retention rate in each period and the mean churn probability. Keep α ÷ (α + β) fixed and make both larger: customers become more alike and the curve approaches constant retention.' },
  ],

  mistakes: [
    { title: 'Averaging the lifetimes of customers who have left', html: 'It keeps only the customers who left, and so the shortest lifetimes. At Lantern it gives a median of 17 days against Kaplan–Meier’s 52. Use every customer, with the censored ones counted for as long as they were watched.' },
    { title: 'Treating censored customers as churned', html: 'A customer still active when the data end hasn’t churned. Counting them as churned at that point invents departures and shortens lifetimes (a median of 31 days for the members).' },
    { title: 'Reading the tail of the curve as firmly as the start', html: 'The late part of a Kaplan–Meier curve rests on the few earliest customers still watched; its interval is wide. Look at the standard errors and the numbers at risk before quoting survival at long times.' },
    { title: 'Treating a significant log-rank test as an effect of the grouping', html: 'Survival curves of self-selected groups (notifications on and off) differ for many reasons. The test shows a difference, not its cause.' },
    { title: 'Projecting with the average retention rate', html: 'When customers differ, retention rises with tenure, and one rate fitted to early periods understates later survival badly (27.0% against 39.4% for the High End customers after 12 years). Use a model that allows heterogeneity, such as the sBG, and check it on periods not used to fit it.' },
  ],

  application: [
    { p: 'Survival analysis is how subscription businesses, insurers, banks and telecoms describe customer lifetimes, because their data are always censored: most customers are still customers. An analyst asked “how long do our customers stay?” answers with a Kaplan–Meier curve and its median, with the numbers at risk printed under it, and says what counts as the event and when observation stops. Comparing curves by acquisition channel, plan or region is often the first diagnostic of where churn comes from.' },
    { case: 'Ana adds a survival chart to her report: the share of app members still active by days since joining, under a 60-day rule, with the medians for notifications on and off (57 and 48 days) and a note that the difference holds under 30- and 90-day rules but is an association. She leaves out the café comparison, which changes with the rule. For planning she uses survival at fixed times rather than the median: of every 100 new members, about 61 are still active after a month and about 38 after three months.' },
    { p: 'For contractual businesses, projection is where the money is. Budgets, investor valuations and acquisition targets all depend on how many of today’s customers will still be there in three or five years. A constant churn rate is the default in most spreadsheets, and it is biased downwards whenever customers differ, which is almost always. The sBG needs only the counts of a cohort still active in each period, fits in a spreadsheet, and should be judged as Fader and Hardie judge it: fitted to the early periods, tested on the later ones.' },
    { p: 'Two cautions travel with every survival analysis. Know why observations are censored, because censoring linked to churn (customers who switch to a partner, accounts closed after a complaint) biases the curve. And keep the event definition fixed: for a noncontractual business the lapse rule is part of the result, and curves made with different rules can’t be compared.' },
  ],

  summary: [
    'Survival data record, for each customer, a time and whether churn was seen. Customers still active when the data end are censored: their lifetime is at least the time observed.',
    'Dropping censored customers or counting them as churned both make lifetimes look too short (members’ median: 17 or 31 days, against 52).',
    'Kaplan–Meier: Ŝ(t) = Π(1 − d_j ÷ n_j) over event times up to t, with censored customers in the risk set until they leave it. Greenwood’s formula gives the standard error; log–log limits stay inside 0 to 1.',
    'For a noncontractual business the event is a lapse: a visit followed by more than L days without one. L changes the curve (members’ median 20, 52 or 93 days for L = 30, 60 or 90).',
    'The log-rank test compares observed with expected churn in each group under one shared curve (notifications: χ² = 8.83, p = 0.003). It shows a difference, not a cause; check it under other lapse rules.',
    'For contractual retention, the sBG gives each customer a fixed churn probability drawn from a beta distribution, so retention rises with tenure; fitted to years 0–7 of Fader and Hardie’s High End data it projects 37.8% after 12 years against an actual 39.4%, while constant retention projects 27.0%.',
  ],

  glossary: [
    { term: 'Censoring', def: 'Incomplete observation of a time to an event: the event had not happened when observation stopped, so the time is known only to exceed the time observed. Customers still active when the data end are censored.' },
    { term: 'Survival function', def: 'S(t), the probability that the event (such as churn) has not happened by time t; for a group of customers, the share expected still to be customers after time t.' },
    { term: 'Kaplan–Meier estimator', def: 'A nonparametric estimate of the survival function from censored data: the running product, over the times at which events occur, of the share of those at risk who did not have the event.' },
    { term: 'Log-rank test', def: 'A test of whether two or more groups share one survival curve, comparing the events observed in each group with those expected at each event time if they did; the statistic is compared with a chi-square distribution.' },
    { term: 'Shifted-beta-geometric model', def: 'A model of contractual retention in which each customer has a fixed probability of leaving at each renewal, and these probabilities vary across customers according to a beta distribution; abbreviated sBG. It implies retention rates that rise with tenure.' },
  ],

  references: [
    { text: 'Fader, P. S., & Hardie, B. G. S. (2007). How to project customer retention. <i>Journal of Interactive Marketing</i>, 21(1), 76–90.', url: 'https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Fader_hardie_jim_07.pdf', checked: '2026-11-01' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 8.2.1.5, “Empirical model fitting – distribution free (Kaplan-Meier) approach”.', url: 'https://itl.nist.gov/div898/handbook/apr/section2/apr215.htm', checked: '2026-11-01' },
    { text: 'Brunner, J. (2019). <i>The Kaplan-Meier (product limit) estimate</i>. Lecture notes, STA312, University of Toronto (the estimator and its Greenwood-type standard error).', url: 'https://utstat.utoronto.ca/~brunner/oldclass/312s19/lectures/312s19KaplanMeier.pdf', checked: '2026-11-01' },
    { text: 'Brown, E. R. (2019). <i>Introduction to survival analysis</i>, module 6, session 2. Summer Institute in Statistics for Clinical Research, University of Washington (Greenwood intervals and the log–log transformation).', url: 'https://si.biostat.washington.edu/sites/default/files/modules/module%206%20session%202.pdf', checked: '2026-11-01' },
    { text: 'Bland, J. M., & Altman, D. G. (2004). The logrank test. <i>BMJ</i>, 328, 1073.', url: 'https://www.bmj.com/content/328/7447/1073', checked: '2026-11-01' },
    { text: 'Fader, P. S., Hardie, B. G. S., & Lee, K. L. (2005). “Counting your customers” the easy way: An alternative to the Pareto/NBD model. <i>Marketing Science</i>, 24(2).', url: 'https://www.brucehardie.com/papers/018/', checked: '2026-11-01' },
  ],

  checks: [
    // Glaisdale
    { what: 'Glaisdale members', value: GT.length, shown: 10 },
    { what: 'Cancelled', value: GE.filter(Boolean).length, shown: 5 },
    { what: 'Drop censored: median', value: med(GT.filter((_, i) => GE[i])), shown: 5 },
    { what: 'Drop censored: nobody beyond 10', value: GDROP.at(10), shown: 0, tol: 1e-9 },
    { what: 'Censored as cancelled: median', value: med(GT), shown: 6.5, tol: 1e-9 },
    { what: 'S(2)', value: gs(2).S, shown: 0.900, tol: 0.0005 },
    { what: 'S(3)', value: gs(3).S, shown: 0.800, tol: 0.0005 },
    { what: 'S(5)', value: gs(5).S, shown: 0.686, tol: 0.0005 },
    { what: 'S(7)', value: gs(7).S, shown: 0.549, tol: 0.0005 },
    { what: 'S(10)', value: gs(10).S, shown: 0.366, tol: 0.0005 },
    { what: 'At risk 10, 9, 7, 5, 3', value: Number([2, 3, 5, 7, 10].map((t) => gs(t).atRisk).join('')), shown: 109753, tol: 0.5 },
    { what: 'Curve stops at 36.6%', value: pc(GKM.at(12)), shown: 36.6, tol: 0.05 },
    { what: 'KM median', value: GKM.median, shown: 10 },
    { what: 'Twice the shortcut', value: GKM.median / 5, shown: 2 },
    { what: 'Greenwood sum at 7', value: gw7, shown: 0.0988, tol: 0.00005 },
    { what: 'Greenwood SE at 7', value: gs(7).se, shown: 0.172, tol: 0.0005 },
    { what: 'SE from rounded', value: 0.5486 * Math.sqrt(0.09881), shown: 0.172, tol: 0.0005 },
    { what: 'Log–log low at 7', value: gs(7).low, shown: 0.187, tol: 0.0005 },
    { what: 'Log–log high at 7', value: gs(7).high, shown: 0.806, tol: 0.0005 },
    // members
    { what: 'Members', value: KM60.n, shown: 2584 },
    { what: 'Lapsed L=60', value: KM60.events, shown: 1540 },
    { what: 'Censored L=60', value: KM60.n - KM60.events, shown: 1044 },
    { what: 'Lapsed at day 0', value: zero60, shown: 469 },
    { what: 'Nov–Dec joiners', value: lateIdx.length, shown: 423 },
    { what: 'All of them censored', value: lateIdx.filter((i) => T60.events[i]).length, shown: 0 },
    { what: 'S(0) %', value: pc(KM60.at(0)), shown: 81.8, tol: 0.05 },
    { what: 'S(30) %', value: pc(KM60.at(30)), shown: 61.1, tol: 0.05 },
    { what: 'S(90) %', value: pc(KM60.at(90)), shown: 38.1, tol: 0.05 },
    { what: 'S(180) %', value: pc(KM60.at(180)), shown: 25.4, tol: 0.05 },
    { what: 'Falls fastest in first weeks (claim): drop 0–30 > drop 30–90 per day', value: Number((KM60.at(0) - KM60.at(30)) / 30 > (KM60.at(30) - KM60.at(90)) / 60), shown: 1 },
    { what: 'Median L=60', value: KM60.median, shown: 52 },
    { what: 'Lapsers only: median', value: DROP.median, shown: 17 },
    { what: 'Censored as lapsed: median', value: ASLAPSED.median, shown: 31 },
    { what: 'Median L=30', value: KM30.median, shown: 20 },
    { what: 'Median L=90', value: KM90.median, shown: 93 },
    { what: 'SE at 90 (points)', value: pc(st90.se), shown: 1.1, tol: 0.05 },
    { what: 'Low at 90 %', value: pc(st90.low), shown: 36.0, tol: 0.05 },
    { what: 'High at 90 %', value: pc(st90.high), shown: 40.2, tol: 0.05 },
    // groups
    { what: 'Notifications on', value: ON.n, shown: 1418 },
    { what: 'Notifications off', value: OFF.n, shown: 1166 },
    { what: 'Median on', value: ON.median, shown: 57 },
    { what: 'Median off', value: OFF.median, shown: 48 },
    { what: 'S90 on %', value: pc(ON.at(90)), shown: 41.1, tol: 0.05 },
    { what: 'S90 off %', value: pc(OFF.at(90)), shown: 34.5, tol: 0.05 },
    { what: 'Observed on', value: obs(LRN60, 1), shown: 815 },
    { what: 'Expected on', value: expd(LRN60, 1), shown: 871.0, tol: 0.05 },
    { what: 'χ² notifications L=60', value: LRN60.chi2, shown: 8.83, tol: 0.005 },
    { what: 'p notifications L=60', value: LRN60.p, shown: 0.003, tol: 0.0005 },
    { what: 'p notifications L=30', value: LRN30.p, shown: 0.004, tol: 0.0005 },
    { what: 'p notifications L=90', value: LRN90.p, shown: 0.031, tol: 0.0005 },
    { what: 'Median Millbrook', value: MB.median, shown: 54 },
    { what: 'Median Harbourside', value: HB.median, shown: 51 },
    { what: 'χ² café L=60', value: LRC60.chi2, shown: 5.30, tol: 0.005 },
    { what: 'p café L=60', value: LRC60.p, shown: 0.021, tol: 0.0005 },
    { what: 'χ² café L=30', value: LRC30.chi2, shown: 23.90, tol: 0.005 },
    { what: 'p café L=30 < 0.001', value: Number(LRC30.p < 0.001), shown: 1 },
    { what: 'χ² café L=90', value: LRC90.chi2, shown: 2.34, tol: 0.005 },
    { what: 'p café L=90', value: LRC90.p, shown: 0.126, tol: 0.0005 },
    { what: 'Millbrook members visit more often (claim in exercises): visits per member-week', value: Number((() => { const v = (cafe) => { const ms = MEMBER_LIST.filter((m) => m.cafe === cafe); const ids = new Set(ms.map((m) => m.id)); let nv = 0; for (const id of Object.keys(LD.visits)) if (ids.has(id)) nv += LD.visits[id].length; const wk = ms.reduce((a, m) => a + (LD.end - m.joined + 1) / 7, 0); return nv / wk; }; return v('Millbrook') > v('Harbourside'); })()), shown: 1 },
    // sBG: High End and Regular, fitted to years 0–7
    { what: 'α High End', value: hs.alpha, shown: 0.668, tol: 0.0005 },
    { what: 'β High End', value: hs.beta, shown: 3.806, tol: 0.0005 },
    { what: 'SE α', value: hs.seAlpha, shown: 0.104, tol: 0.0005 },
    { what: 'SE β', value: hs.seBeta, shown: 0.786, tol: 0.0005 },
    { what: 'Mean churn %', value: pc(hs.meanChurn), shown: 14.9, tol: 0.05 },
    { what: 'r1 %', value: pc(hs.r(1)), shown: 85.1, tol: 0.05 },
    { what: 'r8 %', value: pc(hs.r(8)), shown: 94.2, tol: 0.05 },
    { what: 'r12 %', value: pc(hs.r(12)), shown: 95.7, tol: 0.05 },
    { what: 'r12 from rounded', value: pc((3.806 + 11) / (0.668 + 3.806 + 11)), shown: 95.7, tol: 0.05 },
    { what: 'sBG S(12) %', value: pc(hs.S(12)), shown: 37.8, tol: 0.05 },
    { what: 'sBG S(12) customers', value: 1000 * hs.S(12), shown: 378, tol: 0.5 },
    { what: 'Actual 39.4%', value: FH_HIGH[12], shown: 39.4, tol: 1e-9 },
    { what: 'Constant r %', value: pc(HI.r), shown: 89.7, tol: 0.05 },
    { what: 'Constant S(12) %', value: pc(HI.r ** 12), shown: 27.0, tol: 0.05 },
    { what: 'Constant customers', value: 1000 * HI.r ** 12, shown: 270, tol: 0.5 },
    { what: 'sBG short by 16', value: 394 - Math.round(1000 * hs.S(12)), shown: 16 },
    { what: 'sBG short 4%', value: pc((394 - 1000 * hs.S(12)) / 394), shown: 4, tol: 0.5 },
    { what: 'Constant short by 124', value: 394 - Math.round(1000 * HI.r ** 12), shown: 124 },
    { what: 'Constant short 31%', value: pc((394 - 1000 * HI.r ** 12) / 394), shown: 31, tol: 0.5 },
    { what: 'α Regular', value: rs.alpha, shown: 0.704, tol: 0.0005 },
    { what: 'β Regular', value: rs.beta, shown: 1.182, tol: 0.0005 },
    { what: 'Regular sBG S(12) %', value: pc(rs.S(12)), shown: 17.0, tol: 0.05 },
    { what: 'Regular actual', value: FH_REG[12], shown: 17.3, tol: 1e-9 },
    { what: 'Regular constant S(12) %', value: pc(RG.r ** 12), shown: 4.6, tol: 0.05 },
    { what: 'sBG retention rises with t (claim)', value: Number([2, 3, 5, 8, 12, 50].every((t) => hs.r(t) > hs.r(t - 1))), shown: 1 },
    // examples
    { what: 'Tarn S(1)', value: CU.kaplanMeier([1, 2, 4, 4, 5, 6, 8, 9], [1, 0, 1, 1, 0, 1, 0, 0]).at(1), shown: 0.875, tol: 0.0005 },
    { what: 'Tarn S(4)', value: CU.kaplanMeier([1, 2, 4, 4, 5, 6, 8, 9], [1, 0, 1, 1, 0, 1, 0, 0]).at(4), shown: 0.583, tol: 0.0005 },
    { what: 'Tarn S(6)', value: CU.kaplanMeier([1, 2, 4, 4, 5, 6, 8, 9], [1, 0, 1, 1, 0, 1, 0, 0]).at(6), shown: 0.389, tol: 0.0005 },
    { what: 'Tarn median', value: CU.kaplanMeier([1, 2, 4, 4, 5, 6, 8, 9], [1, 0, 1, 1, 0, 1, 0, 0]).median, shown: 6 },
    { what: 'Tarn SE at 6', value: CU.kaplanMeier([1, 2, 4, 4, 5, 6, 8, 9], [1, 0, 1, 1, 0, 1, 0, 0]).steps[2].se, shown: 0.20, tol: 0.005 },
    // application
    { what: 'About 61 of 100 after a month', value: pc(KM60.at(30)), shown: 61, tol: 0.5 },
    { what: 'About 38 after three months', value: pc(KM60.at(90)), shown: 38, tol: 0.5 },
  ],
};
