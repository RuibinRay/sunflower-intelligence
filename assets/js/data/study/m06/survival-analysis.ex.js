// survival-analysis.ex.js — M06 · Survival analysis: widgets, practice and the knowledge check (answer keys live here).
// The Kaplan–Meier worksheet uses 20 of the cafés' loyalty-app members (every 127th from case.js MEMBER_LIST, from the
// 12th) with lapse times under a 60-day rule as of 31 December 2027 (core/customer.js lapseTimes). Glaisdale Climbing
// Centre and the other businesses named are fictional; the High End data are Fader & Hardie's (2007) published Table 1.
// Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { MEMBER_LIST, lapseData } from './case.js?v=31';
import * as CU from '../../../core/customer.js?v=31';

const fx = (v, d = 3) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- lapse data and the 20-member worksheet
const LD = lapseData();
const T60 = CU.lapseTimes(LD, 60);
const at = new Map(T60.ids.map((id, i) => [id, i]));
const group = Object.fromEntries(MEMBER_LIST.map((m) => [m.id, m.notifications ? 'Notifications on' : 'Notifications off']));
const PICK = MEMBER_LIST.filter((_, i) => i % 127 === 11).slice(0, 20);
const PT = PICK.map((m) => T60.times[at.get(m.id)]), PE = PICK.map((m) => T60.events[at.get(m.id)]);
const PKM = CU.kaplanMeier(PT, PE);
const EVT = PKM.steps.map((s) => s.t), NE = EVT.length, LE = NE + 2;              // event times in E3:E(LE)
const LR = PICK.length + 1;
const baseCells = { A1: 'Member', B1: 'Days', C1: 'Lapsed', E1: 'Days', F1: 'At risk', G1: 'Lapsed', H1: 'S(t)', E2: 'start', H2: 1,
  ...col('A', 2, PICK.map((m) => m.id)), ...col('B', 2, PT), ...col('C', 2, PE), ...col('E', 3, EVT) };
const riskF = (r) => `=COUNTIF($B$2:$B$${LR},">="&E${r})`, lapsF = (r) => `=COUNTIFS($B$2:$B$${LR},E${r},$C$2:$C$${LR},1)`;
const riskCells = col('F', 3, EVT.map((_, i) => riskF(i + 3))), lapsCells = col('G', 3, EVT.map((_, i) => lapsF(i + 3)));
const FIXED = [`B2:B${LR}`, `E3:E${LE}`];
const cens = PICK.map((_, i) => i).filter((i) => !PE[i] && PT[i] > EVT[2] && PT[i] < EVT[NE - 1]);   // a member censored mid-table
const lapsMid = PICK.map((_, i) => i).filter((i) => PE[i] && PT[i] === EVT[4]);                      // a lapse at the fifth event time
const vary1 = { [`B${cens[0] + 2}`]: [EVT[1] + 1, EVT[NE - 1] + 30] };
const lapsZero = PICK.map((_, i) => i).filter((i) => PE[i] && PT[i] === 0);                         // members who lapsed at day 0
const lapsAt = (t) => PICK.map((_, i) => i).filter((i) => PE[i] && PT[i] === t);
// copies: one day-0 lapse becomes censored; two later lapses may move to day 0 or to another event time
const vary2 = { [`C${lapsZero[0] + 2}`]: [0], [`B${lapsAt(EVT[1])[0] + 2}`]: [0, EVT[4]], [`B${lapsAt(EVT[2])[0] + 2}`]: [0, EVT[6]], [`C${lapsMid[0] + 2}`]: [0] };
const wsView = `A1:H${LR}`, wsFormats = { C: '0', F: '0', G: '0', H: '0.000', H2: '0.000' }, wsWidths = { A: 9, B: 7, C: 8, D: 3, E: 7, F: 8, G: 8, H: 8 };

// ---------------------------------------------------------------- fictional numbers
const MW = { t: [1, 3, 3, 5, 5, 7, 8, 10], e: [1, 0, 1, 1, 1, 0, 1, 0] };       // Troutbeck Wanderers walking club
const MWKM = CU.kaplanMeier(MW.t, MW.e);
const GW = { s: (10 / 12) * (8 / 9), sum: 2 / (12 * 10) + 1 / (9 * 8) };       // a Greenwood calculation
const HI = [1000, 869, 743, 653, 593, 551, 517, 491, 468, 445, 427, 409, 394];
const sbgTable = (a, b, T) => { const S = [1]; for (let t = 1; t <= T; t++) S.push(S[t - 1] * (b + t - 1) / (a + b + t - 1)); return S; };

export const widgets = {
  'surv-glaisdale': {
    type: 'survival', title: 'Glaisdale Climbing Centre (fictional): ten members',
    groups: [{ name: 'Glaisdale members', times: [2, 3, 3, 5, 6, 7, 8, 10, 12, 12], events: [1, 1, 0, 1, 0, 1, 0, 1, 0, 0] }],
    unit: 'months', show: ['ci', 'median', 'table'], at: [6, 12],
    note: 'Five members cancelled (at 2, 3, 5, 7 and 10 months); five are censored (still members after 3, 6, 8, 12 and 12 months).',
  },
  'surv-lapse': {
    type: 'survival', title: 'The cafés’ 2,584 app members: time from joining to lapsing, by notifications',
    lapse: { ...LD, group, days: [30, 60, 90], value: 60 },
    unit: 'days', show: ['median', 'logrank'], at: [30, 90, 180],
    note: 'A member lapses at a visit followed by more than the chosen number of days without one; members whose last visit is within that many days of 31 December 2027 are censored. Members chose notifications themselves, so any difference is an association.',
  },
  'surv-sbg': {
    type: 'sbg', title: 'Fader and Hardie’s (2007) High End customers, followed for 12 years',
    cohorts: [{ name: 'High End', alive: HI }], fit: 7, fitRange: [3, 11], horizon: 12, unit: 'year',
    note: 'Published data (Fader and Hardie 2007, Table 1), as counts per 1,000. The paper fits years 0–7 and gets α = 0.668, β = 3.806.',
  },
  'surv-sbg-shape': {
    type: 'formula', title: 'The sBG model: how α and β shape retention',
    intro: 'Each customer has a fixed churn probability; across customers it follows a beta(α, β) distribution.',
    inputs: [
      { id: 'a', label: 'α', min: 0.1, max: 5, step: 0.01, value: 0.67, fmt: 'num' },
      { id: 'b', label: 'β', min: 0.1, max: 20, step: 0.1, value: 3.8, fmt: 'num' },
    ],
    compute: (v) => {
      const ts = Array.from({ length: 13 }, (_, t) => t), r1 = CU.sbgRetention(v.a, v.b, 1);
      return {
        headline: { label: 'Mean churn probability of a new customer, α ÷ (α + β)', value: pct(v.a / (v.a + v.b)) },
        rows: [['Retention in period 1', pct(r1)], ['Retention in period 5', pct(CU.sbgRetention(v.a, v.b, 5))], ['Retention in period 12', pct(CU.sbgRetention(v.a, v.b, 12))], ['Still active after 12 periods (sBG)', pct(CU.sbgS(v.a, v.b, 12))], ['Still active after 12 periods if period 1’s retention held', pct(r1 ** 12)]],
        note: `Retention rises from ${pct(r1)} to ${pct(CU.sbgRetention(v.a, v.b, 12))} by period 12 because the customers with high churn probabilities leave first. Holding period 1’s rate would leave ${pct(r1 ** 12)} after 12 periods instead of ${pct(CU.sbgS(v.a, v.b, 12))}.`,
        chart: { kind: 'line', x: { label: 'Periods since joining', values: ts }, series: [{ name: 'sBG survival', values: ts.map((t) => CU.sbgS(v.a, v.b, t)) }, { name: 'Period 1’s retention held constant', values: ts.map((t) => r1 ** t) }], y: { label: 'Share still active' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'm06-surv-g1', type: 'steps', kind: 'numerical',
    prompt: `The worksheet lists ${PICK.length} app members with their lapse data under a 60-day rule on 31 December 2027: B is the days from joining to the lapse (C = 1) or to the last visit for a member who hasn’t lapsed (C = 0, censored). E3:E${LE} are the days at which at least one of them lapsed.`,
    solution: `At risk: <x>${riskF(3)}</x>; lapses: <x>${lapsF(3)}</x>; survival: H3 <x>=H2*(1-G3/F3)</x>, each filled down. S falls from ${fx(PKM.steps[0].S)} at day ${EVT[0]} to ${fx(PKM.steps[NE - 1].S)} at day ${EVT[NE - 1]}; the median is day ${PKM.median}, the first day with S at or below 0.5.`,
    steps: [
      {
        id: 'm06-surv-g1-s1', type: 'formula',
        prompt: 'In F3, count the members at risk at the time in E3 (those whose time in B is at least E3), so that the formula fills down to the last event time.',
        sheet: { cells: { ...baseCells }, fixed: FIXED, vary: vary1 },
        cell: 'F3', fill: `F3:F${LE}`, answer: riskF(3), require: ['COUNTIF'],
        view: wsView, maxHeight: '20rem', formats: wsFormats, widths: wsWidths,
        wrong: [
          { formula: `=COUNTIF($B$2:$B$${LR},">"&E3)`, say: 'Members whose time equals E3 are still at risk at E3: they lapse, or are censored, then. Use ">=".' },
          { formula: `=COUNTIF(B2:B${LR},">="&E3)`, say: 'Lock the member range with dollar signs ($B$2:$B$…) so it doesn’t move as the formula fills down.' },
          { formula: `=COUNTIFS($B$2:$B$${LR},">="&E3,$C$2:$C$${LR},1)`, say: 'Censored members are at risk too, until their time is reached. Count everyone whose time is at least E3.' },
        ],
        hints: ['A member is at risk at a time if their own time (lapse or censoring) is at least that time.', `<x>${riskF(3)}</x>`],
      },
      {
        id: 'm06-surv-g1-s2', type: 'formula',
        prompt: 'F now holds the numbers at risk and G the lapses at each time; H2 is 1, the share not yet lapsed at the start. In H3, calculate the Kaplan–Meier estimate of S at the time in E3, so that the formula fills down.',
        sheet: { cells: { ...baseCells, ...riskCells, ...lapsCells }, fixed: FIXED, vary: vary2 },
        cell: 'H3', fill: `H3:H${LE}`, answer: '=H2*(1-G3/F3)', alt: ['=H2*(F3-G3)/F3', '=(1-G3/F3)*H2'],
        view: wsView, maxHeight: '20rem', formats: wsFormats, widths: wsWidths,
        wrong: [
          { formula: '=1-G3/F3', say: 'That is the share staying at this one time. S is the running product: multiply by the previous S, in H2.' },
          { formula: '=H2-G3/F3', say: 'Survival multiplies: S(t) = S(previous) × (1 − lapses ÷ at risk).' },
          { formula: `=1-SUM($G$3:G3)/${PICK.length}`, say: 'Dividing by all members treats the censored members as if they could still lapse after they leave observation. Use each time’s risk set.' },
        ],
        hints: ['At each time, the share staying is 1 − lapses ÷ at risk.', '<x>=H2*(1-G3/F3)</x>'],
      },
      {
        id: 'm06-surv-g1-s3', type: 'num', kind: 'numerical',
        prompt: 'From column H, what is the median lifetime of these members, in days: the first event time at which S is 0.5 or below?',
        answer: PKM.median, check: () => CU.kaplanMeier(PT, PE).median, unit: 'days', places: 0, tol: 0.5,
        wrong: [{ value: (() => { const ev = PT.filter((_, i) => PE[i]).sort((a, b) => a - b); return ev[Math.floor(ev.length / 2)]; })(), say: 'That is the middle of the lapsers’ times, which ignores the censored members. Read the median from the S column.' }],
        hints: ['Look down H for the first value at or below 0.500.'],
      },
    ],
  },
  {
    id: 'm06-surv-g2', type: 'num', kind: 'numerical',
    prompt: 'Troutbeck Wanderers walking club (fictional) follows eight new members, in months: 1 (left), 3 (still a member), 3 (left), 5 (left), 5 (left), 7 (still a member), 8 (left), 10 (still a member). What is the Kaplan–Meier estimate of S(5)? Give three decimal places.',
    answer: Math.round(MWKM.at(5) * 1000) / 1000, check: () => CU.kaplanMeier(MW.t, MW.e).at(5), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: 0.5, say: 'That is 4 ÷ 8, as if the member censored at month 3 were still at risk at month 5. Work through the risk sets.' }, { value: Math.round(0.875 * 3 / 5 * 1000) / 1000, say: 'Don’t skip month 3: one member left then, with 7 at risk (the one censored at month 3 still counts).' }],
    hints: ['Month 1: 8 at risk, 1 leaves. Month 3: 7 at risk (the member censored at 3 counts), 1 leaves.', 'At month 5, 5 are at risk and 2 leave: S(5) = (7/8) × (6/7) × (3/5).'],
    solution: `S(1) = 7/8 = 0.875; S(3) = 0.875 × 6/7 = 0.750; at month 5 the 5 members with times of 5 or more are at risk and 2 leave: S(5) = 0.750 × 3/5 = ${fx(MWKM.at(5))}.`,
  },
  {
    id: 'm06-surv-g3', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst estimates how long customers stay by averaging the time from joining to cancelling for the customers who have cancelled, leaving out those still active. Which way is the estimate biased, and why?',
    options: [
      'Too short: the customers still active are the ones with the longest lifetimes so far, and they are left out.',
      'Too long: customers who cancel quickly are under-represented.',
      'Unbiased, because the customers still active haven’t churned yet and so don’t yet have a lifetime that could be averaged.',
      'Too short, because the average is always below the median.',
    ],
    answer: 0,
    hints: ['Who is excluded: customers with short or long lifetimes?'],
    feedback: {
      1: 'Quick cancellers are all in; it is the long-lived customers who are missing.',
      2: 'They do have lifetimes: known to be at least as long as they’ve been watched. Kaplan–Meier uses that.',
      3: 'With skewed lifetimes the mean usually exceeds the median; that isn’t the issue.',
    },
    solution: 'Censored customers have lifetimes of at least the time observed, often long ones. Leaving them out keeps only the departures, which pulls the estimate down (Lantern: 17 days against 52).',
  },
  {
    id: 'm06-surv-g4', type: 'num', kind: 'numerical',
    prompt: 'An sBG model of a fictional insurer’s customers has α = 1 and β = 4. What is the retention rate in period 3: the share of customers active at the start of period 3 who renew? Give a percentage to one decimal place.',
    answer: Math.round(CU.sbgRetention(1, 4, 3) * 1000) / 10, check: () => (4 + 3 - 1) / (1 + 4 + 3 - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 80, say: 'That is period 1’s rate, β ÷ (α + β). In period t it is (β + t − 1) ÷ (α + β + t − 1).' }],
    hints: ['r_t = (β + t − 1) ÷ (α + β + t − 1).', '(4 + 2) ÷ (1 + 4 + 2).'],
    solution: `r₃ = (4 + 2) ÷ (1 + 4 + 2) = 6 ÷ 7 = ${pct(CU.sbgRetention(1, 4, 3))}, up from 80% in period 1 and 83.3% in period 2.`,
  },
];

export const independent = [
  {
    id: 'm06-surv-i1', type: 'num', kind: 'numerical',
    prompt: 'A Kaplan–Meier curve has two event times so far: at month 3, 12 customers at risk and 2 churned; at month 5, 9 at risk and 1 churned. S(5) = (10/12) × (8/9) = 0.741. Calculate Greenwood’s standard error of S(5). Give three decimal places.',
    answer: Math.round(GW.s * Math.sqrt(GW.sum) * 1000) / 1000, check: () => { const k = CU.kaplanMeier([3, 3, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6], [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]); return k.steps[1].se; }, places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round(Math.sqrt(GW.sum) * 1000) / 1000, say: 'Multiply the square root by S(5) itself: SE = S × √Σ d ÷ (n(n − d)).' }],
    solution: `Σ d ÷ (n(n − d)) = 2 ÷ (12 × 10) + 1 ÷ (9 × 8) = ${fx(GW.sum, 4)}; SE = ${fx(GW.s)} × √${fx(GW.sum, 4)} = ${fx(GW.s * Math.sqrt(GW.sum))}.`,
  },
  {
    id: 'm06-surv-i2', type: 'mc', kind: 'conceptual',
    prompt: 'A log-rank test comparing members with notifications on and off gives χ² = 8.83, p = 0.003. Which statement is supported?',
    options: [
      'The two groups’ survival curves differ by more than chance would usually produce.',
      'Turning notifications on makes members stay longer.',
      'Members with notifications on stay 0.003 days longer.',
      'The curves differ by 8.83 percentage points at every time since joining, the gap the test measures.',
    ],
    answer: 0,
    feedback: { 1: 'Members chose the setting, so the test can’t separate notifications from whatever made members choose them.', 2: 'The p-value is a probability, not a size of difference.', 3: 'χ² measures how far observed churn is from expected, not a gap between curves.' },
    solution: 'The log-rank test compares observed with expected lapses under one shared curve. A small p-value says the curves differ; report medians or survival at fixed times for the size, and remember that the groups were self-selected.',
  },
  {
    id: 'm06-surv-i3', type: 'mc', kind: 'applied',
    prompt: 'Comparing Millbrook and Harbourside members, the log-rank p-value is below 0.001 with a 30-day lapse rule, 0.021 with 60 days and 0.126 with 90 days. How should Ana report the café difference?',
    options: [
      'As depending on the rule, so not a robust finding.',
      'As significant, since two of the three tests are below 0.05.',
      'As not significant, since the most generous rule gives p = 0.126.',
      'As significant at L = 30 only, so Ana should use L = 30 from now on.',
    ],
    answer: 0,
    feedback: { 1: 'Counting tests that pass is not evidence; the pattern says the difference is about short gaps, not long-run staying.', 2: 'Any one rule is a choice; the honest report shows how the answer depends on it.', 3: 'Choosing the rule that gives the wanted answer is the opposite of a fair test.' },
    solution: 'The difference is clear when short gaps count as lapses and not clear with a 90-day rule. Millbrook members visit more often, so short gaps are rarer there; with a 90-day rule the two cafés’ members lapse at similar rates. Report the dependence on L rather than one verdict.',
  },
  {
    id: 'm06-surv-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional software firm fits constant retention to its first three years of contracts and gets 80% a year. What share of a new cohort does that model project will still be customers after 10 years? Give a percentage to one decimal place.',
    answer: Math.round(0.8 ** 10 * 1000) / 10, check: () => 0.8 ** 10 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 0, say: '1 − 10 × 20% would be zero, but retention compounds: 0.8¹⁰.' }],
    solution: `0.8¹⁰ = ${pct(0.8 ** 10)}. If customers differ, retention rises with tenure and the true figure is likely higher; an sBG fitted to the same three years would allow for that.`,
  },
  {
    id: 'm06-surv-i5', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a Kaplan–Meier calculation in order.',
    items: [
      'Record for each customer a time and whether churn was observed (1) or the customer was censored (0).',
      'List the distinct times at which at least one customer churned, in order.',
      'At each of those times, count the customers at risk (time at least that time) and the churners.',
      'Multiply the running survival by (1 − churners ÷ at risk) at each time.',
      'Read the median as the first time the survival falls to 0.5 or below.',
    ],
    solution: 'Times and events; event times; risk sets and churners; the running product; the median from the curve.',
  },
  {
    id: 'm06-surv-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are reasons the late part of a Kaplan–Meier curve of customers is less reliable than the early part? Select all that apply.',
    options: [
      'Few customers are still at risk there, so each churn moves the curve a lot.',
      'It rests on the earliest joiners only, who may differ from today’s customers.',
      'Censored customers are counted as churned at the end.',
      'Greenwood’s standard error is always zero at the start of the curve and grows by a fixed amount each period.',
    ],
    answer: [0, 1],
    feedback: { 2: 'Kaplan–Meier never counts censored customers as churned.', 3: 'The SE grows as the risk set shrinks, not by a fixed amount.' },
    solution: 'Small risk sets make the tail noisy (wide intervals), and only early joiners reach long times. Report the numbers at risk with the curve.',
  },
];

export const check = [
  {
    id: 'm06-surv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What happens to a survival estimate if customers still active when the data end are counted as having churned on that date?',
    options: [
      'Survival is underestimated: departures are invented for customers who may stay much longer.',
      'Survival is overestimated: more customers count towards the denominator.',
      'Nothing, as long as the number of censored customers is small relative to the number of customers who churned.',
      'Survival is unaffected, but the confidence interval becomes wider.',
    ],
    answer: 0,
    feedback: { 1: 'They are counted as events, which pulls the curve down.', 2: 'Even a few false departures shift the curve down; at Lantern the median falls from 52 to 31 days.', 3: 'The estimate itself is biased downwards.' },
    solution: 'Censored customers have lifetimes of at least the observed time. Treating them as churned shortens lifetimes; dropping them does too. Kaplan–Meier counts them as at risk until they leave observation.',
  },
  {
    id: 'm06-surv-k2', type: 'num', kind: 'numerical',
    prompt: 'Brantwood Music Studio (fictional) follows six students, in months: 2 (left), 3 (still enrolled), 3 (left), 6 (left), 7 (still enrolled), 9 (still enrolled). What is the Kaplan–Meier estimate of S(6)? Give three decimal places.',
    answer: Math.round(CU.kaplanMeier([2, 3, 3, 6, 7, 9], [1, 0, 1, 1, 0, 0]).at(6) * 1000) / 1000, check: () => CU.kaplanMeier([2, 3, 3, 6, 7, 9], [1, 0, 1, 1, 0, 0]).at(6), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: 0.5, say: 'That is 3 ÷ 6, as if the student censored at month 3 were still enrolled at month 6. They leave the risk set after month 3: work through the risk sets.' }],
    solution: `Month 2: 6 at risk, 1 leaves, S = 5/6. Month 3: 5 at risk (the censored student counts at month 3), 1 leaves, S = 5/6 × 4/5 = 0.667. Month 6: 3 at risk, 1 leaves, S = 0.667 × 2/3 = ${fx(CU.kaplanMeier([2, 3, 3, 6, 7, 9], [1, 0, 1, 1, 0, 0]).at(6))}.`,
  },
  {
    id: 'm06-surv-k3', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet projects a cohort with the sBG model: α in F1, β in F2, periods in A2:A14 and S(0) = 1 in C2. In C3, calculate S(1) from S(0) using the period’s retention rate, so that the formula fills down to C14.',
    sheet: { cells: { A1: 'Period', C1: 'S(t)', E1: 'α', F1: 0.668, E2: 'β', F2: 3.806, C2: 1, ...col('A', 2, Array.from({ length: 13 }, (_, t) => t)) }, fixed: ['A2:A14'] },
    cell: 'C3', fill: 'C3:C14', answer: '=C2*($F$2+A3-1)/($F$1+$F$2+A3-1)', alt: ['=C2*(($F$2+A3-1)/($F$1+$F$2+A3-1))', '=C2*($F$2+A2)/($F$1+$F$2+A2)'],
    view: 'A1:F14', formats: { C: '0.000', F: '0.000' }, widths: { A: 8, B: 3, C: 9, D: 3, E: 5, F: 8 },
    wrong: [
      { formula: '=C2*$F$2/($F$1+$F$2)', say: 'That uses period 1’s retention for every period. The sBG’s retention rises: r_t = (β + t − 1) ÷ (α + β + t − 1).' },
      { formula: '=C2*(F2+A3-1)/(F1+F2+A3-1)', say: 'Lock α and β with dollar signs so they don’t move as the formula fills down.' },
      { formula: '=C2*($F$2+A3)/($F$1+$F$2+A3)', say: 'Period t’s retention is (β + t − 1) ÷ (α + β + t − 1): in period 1 it is β ÷ (α + β).' },
    ],
    solution: `<x>=C2*($F$2+A3-1)/($F$1+$F$2+A3-1)</x>. With Fader and Hardie’s High End values, S(12) = ${fx(sbgTable(0.668, 3.806, 12)[12])}, against an actual 0.394.`,
  },
  {
    id: 'm06-surv-k4', type: 'mc', kind: 'applied',
    prompt: 'A manager sees that app members with notifications on have a median lifetime of 57 days against 48 for those with them off (log-rank p = 0.003) and proposes switching notifications on for every member, “which will add nine days to the average member’s life”. What should Ana reply?',
    options: [
      'Members chose the setting, so the nine days may reflect who chooses it; test with a randomised default.',
      'Agree: a p-value of 0.003 shows notifications cause members to stay longer.',
      'Disagree: the medians depend on the lapse rule, so there is no real difference between the two groups of members to act on.',
      'Agree, but expect 9 ÷ 48 = 19% more visits from every member.',
    ],
    answer: 0,
    feedback: { 1: 'A small p-value rules out chance, not self-selection.', 2: 'The difference holds under 30-, 60- and 90-day rules; what it lacks is a causal design.', 3: 'A difference in median lifetime isn’t a change in visit frequency, and it isn’t causal.' },
    solution: 'The association is robust but observational. Randomising the default setting is the way to learn what switching notifications on would add.',
  },
  {
    id: 'm06-surv-k5', type: 'num', kind: 'numerical',
    prompt: 'An sBG model has α = 0.5 and β = 4.5. What share of a new cohort does it expect still to be active after two periods? Give a percentage to one decimal place.',
    answer: Math.round(CU.sbgS(0.5, 4.5, 2) * 1000) / 10, check: () => (4.5 / 5) * (5.5 / 6) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 81, say: 'That is 0.9², holding period 1’s retention constant. Period 2’s rate is (β + 1) ÷ (α + β + 1) = 5.5 ÷ 6.' }],
    solution: `r₁ = 4.5 ÷ 5 = 0.9 and r₂ = 5.5 ÷ 6 = ${fx(5.5 / 6)}; S(2) = 0.9 × ${fx(5.5 / 6)} = ${pct(CU.sbgS(0.5, 4.5, 2))}. The mean churn probability is 0.5 ÷ 5 = 10%.`,
  },
  {
    id: 'm06-surv-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true of the shifted-beta-geometric model.',
    options: [
      'Each customer’s churn probability is the same in every period.',
      'The cohort’s retention rate rises with tenure.',
      'It should be judged on periods not used to fit it.',
      'It assumes every customer has the same churn probability.',
      'It is designed for customers who never cancel, such as café visitors.',
    ],
    answer: [0, 1, 2],
    feedback: { 3: 'Churn probabilities differ across customers, following a beta distribution; that is what makes retention rise.', 4: 'The sBG is for contractual renewals, where churn is observed.' },
    solution: 'Fixed probabilities for each customer, varying across customers, give rising cohort retention. It models contractual settings and, as Fader and Hardie do, should be tested on later periods.',
  },
];
