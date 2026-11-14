// predicting-churn.ex.js — M06 · Predicting churn: widgets, practice and the knowledge check (answer keys live here).
// The worksheets use 31 members of the churn table (every 55th from case.js churnTable(), from the 8th): recency and
// frequency on 31 October 2027 and whether they lapsed in November–December, scored with the recency-only logistic
// regression fitted to all 1,664. The offer's uplifts, cost and value, and Patterdale Broadband, Rosthwaite Insurance and the
// other businesses named, are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { churnTable } from './case.js?v=31';
import * as R from '../../../core/regression.js?v=31';
import * as CU from '../../../core/customer.js?v=31';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const r4 = (v) => Math.round(v * 10000) / 10000, r3 = (v) => Math.round(v * 1000) / 1000;

const CT = churnTable();
const y = CT.map((c) => c.lapsed);
const XS = { 'Days since last visit': CT.map((c) => c.recency), 'Visits to date': CT.map((c) => c.frequency), 'Days since joining': CT.map((c) => c.tenure), 'Spend to date ($)': CT.map((c) => c.monetary), Near: CT.map((c) => c.near), Notifications: CT.map((c) => c.notifications), Millbrook: CT.map((c) => c.millbrook) };
const FULL = R.logistic(y, XS);
const REC = R.logistic(y, { Recency: CT.map((c) => c.recency) });
const B0 = r4(REC.coefs[0].estimate), B1 = r4(REC.coefs[1].estimate);
const sig = (e) => 1 / (1 + Math.exp(-e));

// ---------------------------------------------------------------- worksheet: 31 members
const P = CT.filter((_, i) => i % 55 === 7), N = P.length, LR = N + 1;
const memberCells = { A1: 'Member', B1: 'Days since last visit', C1: 'Visits', D1: 'Lapsed', ...col('A', 2, P.map((c) => c.id)), ...col('B', 2, P.map((c) => c.recency)), ...col('C', 2, P.map((c) => c.frequency)), ...col('D', 2, P.map((c) => c.lapsed)) };
const coefCells = { F2: 'Intercept', G2: B0, F3: 'Slope (per day)', G3: B1 };
const probF = (r) => `=1/(1+EXP(-($G$2+$G$3*B${r})))`;
const nLap = P.reduce((s, c) => s + c.lapsed, 0);
const rateAbove = (cut) => { const g = P.filter((c) => c.recency >= cut); return g.reduce((s, c) => s + c.lapsed, 0) / g.length; };
const rateWithin = (cut) => { const g = P.filter((c) => c.recency <= cut); return g.reduce((s, c) => s + c.lapsed, 0) / g.length; };
const wsW = { A: 9, B: 12, C: 7, D: 8, E: 11, F: 15, G: 10 };
// the expected-gain sheet: the first 20 of them, with the lesson's fictional uplifts by recency band
const U = [0.05, 0.15, 0.06, 0.01], band = (r) => (r <= 30 ? 0 : r <= 90 ? 1 : r <= 150 ? 2 : 3);
const P20 = P.slice(0, 20), L20 = 21;
const gainCells = { A1: 'Member', B1: 'Days since last visit', C1: 'P(lapse)', D1: 'Uplift', F1: 'Value kept ($)', G1: 12, F2: 'Cost of contact ($)', G2: 1, E1: 'Expected gain ($)',
  ...col('A', 2, P20.map((c) => c.id)), ...col('B', 2, P20.map((c) => c.recency)), ...col('C', 2, P20.map((c) => r3(sig(B0 + B1 * c.recency)))), ...col('D', 2, P20.map((c) => U[band(c.recency)])) };
const gains = P20.map((c) => r3(sig(B0 + B1 * c.recency)) * U[band(c.recency)] * 12 - 1);
const best = gains.indexOf(Math.max(...gains));

export const widgets = {
  'pred-logit': {
    type: 'logistic', title: 'Lapsing in November–December: 1,664 members described on 31 October 2027',
    y: { name: 'Lapsed in November–December', values: y, yes: 'lapsed', no: 'came back' },
    xs: XS, axis: 'Days since last visit', binary: ['Near', 'Notifications', 'Millbrook'], threshold: 0.5,
    show: ['coefs', 'odds', 'lr', 'table'],
    note: 'Every predictor is measured on 31 October; the outcome comes from the two months after. Members chose notifications and where they live, so the coefficients are associations.',
  },
  'pred-lift': {
    type: 'lift', title: 'Ranking members by their chance of lapsing',
    y: { name: 'Lapsed in November–December', values: y, yes: 'lapsed' },
    scores: { 'Logistic model (seven predictors)': FULL.prob, 'Recency alone': CT.map((c) => c.recency) },
    k: 10, cost: { contact: 1, value: 12 },
    note: 'In-sample: the model was fitted to these members. The profit column assumes every contacted lapser is kept, which no offer achieves; the applied example uses assumed uplifts instead.',
  },
};

export const guided = [
  {
    id: 'm06-pred-g1', type: 'steps', kind: 'numerical',
    prompt: `The worksheet holds ${N} members of the churn table: days since their last visit on 31 October (B), visits to date (C) and whether they lapsed in November–December (D). G2 and G3 hold the intercept and slope of the recency-only logistic regression fitted to all 1,664 members.`,
    solution: `E2: <x>${probF(2)}</x>, filled down. Lift for members silent at least G5 days: <x>=AVERAGEIFS(D2:D${LR},B2:B${LR},">="&G5)/AVERAGE(D2:D${LR})</x>. With G5 = 60: ${pct(rateAbove(60))} lapsed against ${pct(nLap / N)} of these ${N}, a lift of ${fx(rateAbove(60) / (nLap / N))}. Most of these members lapsed anyway, so no group can be much richer in lapsers than the whole: the lift is capped at 1 ÷ ${fx(nLap / N)} = ${fx(N / nLap)}.`,
    steps: [
      {
        id: 'm06-pred-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the first member’s predicted probability of lapsing from the model in G2:G3, so that the formula fills down to every member.',
        sheet: { cells: { ...memberCells, E1: 'P(lapse)', ...coefCells } },
        cell: 'E2', fill: `E2:E${LR}`, answer: probF(2), alt: ['=EXP($G$2+$G$3*B2)/(1+EXP($G$2+$G$3*B2))', '=1/(1+EXP(-$G$2-$G$3*B2))'],
        view: `A1:G${LR}`, maxHeight: '20rem', formats: { E: '0.000', G2: '0.0000', G3: '0.0000' }, widths: wsW,
        wrong: [
          { formula: '=$G$2+$G$3*B2', say: 'That is the log-odds. Turn it into a probability: 1 ÷ (1 + e^−(log-odds)).' },
          { formula: '=1/(1+EXP(-(G2+G3*B2)))', say: 'Lock the coefficients with dollar signs so they stay put as the formula fills down.' },
          { formula: '=1/(1+EXP($G$2+$G$3*B2))', say: 'The exponent needs a minus sign; without it you get the probability of coming back.' },
        ],
        hints: ['Log-odds = intercept + slope × days since the last visit.', `<x>${probF(2)}</x>`],
      },
      {
        id: 'm06-pred-g1-s2', type: 'formula',
        prompt: 'G5 holds a cut-off in days. In G6, calculate the lift of the members silent for at least G5 days: their lapse rate divided by the lapse rate of all the members on the sheet.',
        sheet: { cells: { ...memberCells, ...coefCells, F5: 'Cut-off (days)', G5: 60, F6: 'Lift' }, vary: { G5: [30, 45, 90] } },
        cell: 'G6', answer: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">="&G5)/AVERAGE(D2:D${LR})`, require: ['AVERAGEIFS'],
        view: `A1:G${LR}`, maxHeight: '20rem', formats: { G6: '0.00', G2: '0.0000', G3: '0.0000' }, widths: wsW,
        wrong: [
          { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">="&G5)`, say: 'That is the group’s lapse rate. Lift divides it by the overall rate, AVERAGE(D2:D…).' },
          { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">=60")/AVERAGE(D2:D${LR})`, say: 'Refer to the cut-off cell, ">="&G5, so the lift updates when Ana changes it.' },
          { formula: `=COUNTIFS(B2:B${LR},">="&G5,D2:D${LR},1)/SUM(D2:D${LR})`, say: 'That is the share of all lapsers found (the gains), not the lift.' },
        ],
        hints: ['Lapse rate of the group: AVERAGEIFS over D where B is at least G5.', 'Divide by AVERAGE(D2:D…), the overall rate.'],
      },
      {
        id: 'm06-pred-g1-s3', type: 'mc', kind: 'conceptual',
        prompt: 'On these members the lift of the longest-silent group is well below 2, however the cut-off is set. Why?',
        options: [
          'Most of them lapsed anyway, which caps the lift.',
          'Recency is a weak predictor of lapsing.',
          'The model’s coefficients are wrong for these members.',
          'Lift is always between 1 and 2.',
        ],
        answer: 0,
        hints: ['What is the largest lift possible when three members in four lapse?'],
        feedback: { 1: 'Recency ranks members very well (AUC 0.90); the cap comes from the base rate.', 2: 'The lift uses only the outcomes and the cut-off, not the coefficients.', 3: 'With a 5% base rate a lift of 10 is possible.' },
      },
    ],
  },
  {
    id: 'm06-pred-g2', type: 'num', kind: 'numerical',
    prompt: 'Patterdale Broadband (fictional) loses 8% of its customers a year. Of the top tenth of customers ranked by its churn score, 30% left. What is that group’s lift?',
    answer: 3.75, check: () => 0.3 / 0.08, places: 2, tol: 0.01, unit: '',
    wrong: [{ value: 22, say: 'Lift is a ratio, not a difference: 30% ÷ 8%.' }, { value: 0.27, say: 'Divide the group’s rate by the overall rate, not the other way round.' }],
    hints: ['Lift = group rate ÷ overall rate.', '0.30 ÷ 0.08.'],
    solution: 'Lift = 30% ÷ 8% = 3.75: the top tenth is 3.75 times as rich in leavers as the customer base. The largest possible lift here is 1 ÷ 0.08 = 12.5.',
  },
  {
    id: 'm06-pred-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Ana builds a model on 1 November to predict which members lapse in November–December. Which predictor would leak the outcome?',
    options: [
      'Whether the member opened any app message in November.',
      'Days since the member’s last visit, as of 31 October.',
      'Visits to date, as of 31 October.',
      'The café where the member joined, recorded at the till on the day they joined.',
    ],
    answer: 0,
    hints: ['Which of these could Ana not know on 1 November?'],
    feedback: { 1: 'Known on 31 October: fine.', 2: 'Known on 31 October: fine.', 3: 'Known since the member joined: fine.' },
    solution: 'November behaviour happens after the prediction date and is related to whether the member visits. Every predictor must come from the calibration period, up to 31 October.',
  },
  {
    id: 'm06-pred-g4', type: 'num', kind: 'numerical',
    prompt: 'A member has a 70% chance of lapsing. Ana assumes the offer keeps 10% of members who would otherwise lapse, a kept member is worth $40 of margin and a contact costs $2 (all fictional). What is the expected gain from contacting this member, in dollars?',
    answer: 0.8, check: () => 0.7 * 0.1 * 40 - 2, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 26, say: 'That counts the full $40 for every likely lapser, as if the offer always worked. Multiply by the uplift, 10%.' }, { value: 2.8, say: 'Subtract the cost of the contact.' }],
    hints: ['Expected gain = p × u × V − c.', '0.7 × 0.1 × 40 − 2.'],
    solution: 'p × u × V − c = 0.7 × 0.1 × $40 − $2 = $2.80 − $2.00 = $0.80. A member with a 95% chance of lapsing but an uplift of 2% would be worth 0.95 × 0.02 × $40 − $2 = −$1.24: risk alone doesn’t decide.',
  },
];

export const independent = [
  {
    id: 'm06-pred-i1', type: 'num', kind: 'numerical',
    prompt: 'A quarter of a firm’s customers churn. What is the largest lift any group selected by a churn score could have?',
    answer: 4, check: () => 1 / 0.25, places: 2, tol: 0.01, unit: '',
    wrong: [{ value: 0.25, say: 'The cap is 1 ÷ base rate: a group in which everyone churns has a rate of 100%.' }],
    solution: 'A group in which every customer churns has a rate of 100%; its lift is 100% ÷ 25% = 4. With Lantern’s 66.0% base rate the cap is 1.52.',
  },
  {
    id: 'm06-pred-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Ana is building predictors on 1 November for the November–December outcome. Is each one usable, or does it leak?',
    items: ['Visits in October.', 'Visits in the first week of November.', 'Days since joining, on 31 October.', 'Recency on 31 December.', 'Whether the member lives or works within a mile.', 'Whether the member redeemed a November offer.'],
    categories: ['Usable', 'Leaks'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: { 1: 'November visits are part of the outcome.', 3: 'On 31 December recency already shows whether the member visited in November–December.', 5: 'Redeeming means visiting in November.' },
    solution: 'Only information available by 31 October can be used. Anything from November or December leaks the outcome.',
  },
  {
    id: 'm06-pred-i3', type: 'num', kind: 'numerical',
    prompt: 'Rosthwaite Insurance (fictional) has 2,000 customers, 300 of whom later cancelled. The 400 customers with the highest churn scores included 150 of those who cancelled. What is the lift of that group?',
    answer: 2.5, check: () => (150 / 400) / (300 / 2000), places: 2, tol: 0.01, unit: '',
    wrong: [{ value: 0.5, say: 'That is the share of all cancellers found (the gains), 150 ÷ 300. Lift compares rates: (150 ÷ 400) ÷ (300 ÷ 2,000).' }, { value: 37.5, say: 'That is the group’s cancellation rate as a percentage. Divide it by the overall rate, 15%.' }],
    solution: 'Group rate 150 ÷ 400 = 37.5%; overall 300 ÷ 2,000 = 15%; lift 2.5. The top fifth found half of all cancellers.',
  },
  {
    id: 'm06-pred-i4', type: 'mc', kind: 'applied',
    prompt: 'Three groups of members, each of 100. A: 97% will lapse, and a randomised test showed the offer brings back 1% of would-be lapsers. B: 77% will lapse; the offer brings back 15%. C: 20% will lapse; the offer brings back 5%. Each contact costs $1 and a kept member is worth $12 (all fictional). Which group should Ana contact?',
    options: ['B, the only group where the expected gain is positive.', 'A, because its members are the most likely to lapse.', 'C, because its members are the least likely to lapse and so the cheapest to keep.', 'All three, because each contains lapsers.'],
    answer: 0,
    feedback: { 1: 'Risk isn’t responsiveness: 0.97 × 0.01 × $12 = $0.12 per member against $1 of cost.', 2: 'The value of a kept member is the same $12 in each group; C has few lapsers and a small uplift.', 3: 'Contacting A and C loses money under these figures.' },
    solution: 'Expected gain per member: A 0.97 × 0.01 × 12 − 1 = −$0.88; B 0.77 × 0.15 × 12 − 1 = $0.39; C 0.20 × 0.05 × 12 − 1 = −$0.88. Only B pays.',
  },
  {
    id: 'm06-pred-i5', type: 'formula', kind: 'applied',
    prompt: 'The worksheet holds 20 members with their predicted chance of lapsing (C) and the uplift Ana assumes for their recency band (D, fictional). G1 is the value of a kept member and G2 the cost of a contact. In E2, calculate the first member’s expected gain from being contacted, so that the formula fills down.',
    sheet: { cells: { ...gainCells } },
    cell: 'E2', fill: `E2:E${L20}`, answer: '=C2*D2*$G$1-$G$2', alt: ['=$G$1*C2*D2-$G$2', '=C2*D2*$G$1-1*$G$2'],
    view: `A1:G${L20}`, maxHeight: '20rem', formats: { C: '0.000', D: '0%', E: '$#,##0.00', G: '$#,##0.00' }, widths: { A: 9, B: 12, C: 9, D: 8, E: 13, F: 17, G: 8 },
    wrong: [
      { formula: '=C2*$G$1-$G$2', say: 'That assumes the offer keeps every member who would lapse. Multiply by the uplift in D.' },
      { formula: '=C2*D2*G1-G2', say: 'Lock G1 and G2 with dollar signs so they don’t move as the formula fills down.' },
      { formula: '=C2*D2*$G$1', say: 'Subtract the cost of the contact, G2.' },
    ],
    solution: `<x>=C2*D2*$G$1-$G$2</x>. The best of these 20 is ${P20[best].id}, silent for ${P20[best].recency} days: an expected gain of $${fx(gains[best])}. Members silent for months have high chances of lapsing but, under these assumptions, negative expected gains.`,
  },
  {
    id: 'm06-pred-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A churn score has an AUC of 0.90. What does that mean?',
    options: [
      'For a random churner and a random non-churner, the churner scores higher 90% of the time.',
      '90% of customers are classified correctly.',
      'The score explains 90% of the variation in churn.',
      'Contacting the 10% of customers with the highest scores would find 90% of all the churners.',
    ],
    answer: 0,
    feedback: { 1: 'Accuracy depends on a threshold; the AUC doesn’t.', 2: 'That is a description of R² for a linear model, not the AUC.', 3: 'That is a point on the gains curve, which depends on the base rate.' },
    solution: 'The AUC is the probability that a random positive outranks a random negative (ties half). It summarises ranking across every threshold.',
  },
];

export const check = [
  {
    id: 'm06-pred-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s seven-predictor model classifies 85.1% of members correctly at a threshold of 0.5. 66.0% of members lapsed. What is the right comparison?',
    options: [
      'Against 66.0%, what predicting that every member lapses would score with no model at all.',
      'Against 50%, what tossing a coin would score.',
      'Against 100%, so the model misses 14.9% of members and needs more predictors before Ana uses it.',
      'Against 34.0%, the share who came back.',
    ],
    answer: 0,
    feedback: { 1: 'Guessing the commoner outcome beats a coin here; it is the benchmark.', 2: 'Perfect accuracy is not attainable when behaviour is partly chance; the benchmark is the base rate.', 3: 'Predicting “comes back” for everyone would score 34.0%, but nobody would choose that rule.' },
    solution: 'The no-model benchmark is the commoner outcome’s share: 66.0%. The model adds 19 points. For targeting, its ranking (lift, gains, AUC) matters more than accuracy at one threshold.',
  },
  {
    id: 'm06-pred-k2', type: 'num', kind: 'numerical',
    prompt: 'Ranked by recency, the top 40% of the 1,664 members (666 members) contained 634 of the 1,098 who lapsed. What share of all lapsers does contacting them find, as a percentage?',
    answer: Math.round(CU.liftTable(y, CT.map((c) => c.recency), 5).rows[1].captured * 1000) / 10, check: () => { const T = CU.liftTable(y, CT.map((c) => c.recency), 5); return (T.rows[0].positives + T.rows[1].positives) / T.positives * 100; }, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: Math.round(634 / 666 * 1000) / 10, say: 'That is the group’s lapse rate. The gains curve divides by all lapsers, 1,098.' }],
    solution: '634 ÷ 1,098 = 57.7% of all lapsers, from 40% of members. A random 40% would find 40%.',
  },
  {
    id: 'm06-pred-k3', type: 'mc', kind: 'applied',
    prompt: 'A retention manager at Patterdale Broadband (fictional) sends a discount to the 5% of customers with the highest churn scores. Many still leave. She concludes that discounts don’t work. What is the main flaw?',
    options: [
      'Without a random no-discount group, she can’t tell what it changed.',
      'The churn score must have been wrong, because the customers left.',
      'She should have sent the discount to the customers least likely to leave.',
      'Discounts never work for broadband customers.',
    ],
    answer: 0,
    feedback: { 1: 'High-risk customers leaving is what the score predicted; it says nothing about the discount.', 2: 'Those customers mostly stay anyway; a discount there mostly rewards loyalty that was already there.', 3: 'A sweeping claim the evidence doesn’t support either way.' },
    solution: 'Without a randomly chosen group of similar customers who weren’t sent the discount, she can’t tell how many would have left anyway, or whether customers lower down the list would have responded. Measuring uplift needs a randomised holdout within each band of the score. The highest-risk customers may be beyond reach; the offer may work in the middle of the list.',
  },
  {
    id: 'm06-pred-k4', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds the 31 members. In H3, calculate the lapse rate among members whose last visit was at most H1 days before 31 October.',
    sheet: { cells: { ...memberCells, G1: 'Within (days)', H1: 30, G3: 'Lapse rate' }, vary: { H1: [45, 60, 90] } },
    cell: 'H3', answer: `=AVERAGEIFS(D2:D${LR},B2:B${LR},"<="&H1)`, require: ['AVERAGEIFS'],
    view: `A1:H${LR}`, maxHeight: '20rem', formats: { H3: '0.0%' }, widths: { A: 9, B: 12, C: 7, D: 8, G: 13, H: 9 },
    wrong: [
      { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},"<"&H1)`, say: 'At most H1 days includes members exactly H1 days away: use "<=".' },
      { formula: `=COUNTIFS(B2:B${LR},"<="&H1,D2:D${LR},1)`, say: 'That is the number who lapsed. Divide by the number of members in the group.' },
      { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">"&H1)`, say: 'That is the lapse rate of the members silent for longer. The question asks about recent visitors.' },
    ],
    solution: `<x>=AVERAGEIFS(D2:D${LR},B2:B${LR},"<="&H1)</x>. With H1 = 30: ${pct(rateWithin(30))} of the recent visitors lapsed, against ${pct(nLap / N)} of all ${N}.`,
  },
  {
    id: 'm06-pred-k5', type: 'num', kind: 'applied',
    prompt: 'Under the lesson’s fictional assumptions (a kept member is worth $12, a contact costs $1), members silent for 31–90 days lapse at 77.0% and the offer brings back 15% of would-be lapsers. What is the expected gain per member contacted in that band, in dollars?',
    answer: Math.round((0.77 * 0.15 * 12 - 1) * 100) / 100, check: () => 0.77 * 0.15 * 12 - 1, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: Math.round((0.77 * 12 - 1) * 100) / 100, say: 'That counts every lapser as kept. Multiply by the uplift, 15%.' }],
    solution: '0.77 × 0.15 × $12 − $1 = $1.386 − $1 = $0.39 per member: across the band’s 452 members, about $174, as in the lesson’s applied example.',
  },
  {
    id: 'm06-pred-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true of Ana’s churn model.',
    options: [
      'Its predictors are measured up to 31 October and its outcome in November–December.',
      'Judged on members not used to fit it, it ranks about as well as on the members it was fitted to.',
      'Its probabilities are well calibrated at the extremes.',
      'Its coefficients show which actions would keep members.',
      'Recency alone ranks members about as well as the full model.',
    ],
    answer: [0, 1, 4],
    feedback: { 2: 'It overstates lapsing at both ends: 99.3% against 97.0% in the top fifth and 20.8% against 14.5% in the bottom fifth.', 3: 'They are associations in observational data, not effects of actions.' },
    solution: 'Calibration and holdout periods; a fair test with AUC 0.906 against 0.893; recency’s AUC 0.901 against 0.899. Calibration is imperfect at the extremes, and the coefficients are not levers.',
  },
];
