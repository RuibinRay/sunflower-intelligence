// assess-m3.js — M06 module 3 test: Retention and churn (retention-and-churn-rates, survival-analysis, predicting-churn).
// New questions on new scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews
// the test. The worksheet uses 30 members of the churn table (every 53rd from case.js churnTable(), from the 21st); every
// other business, person and number is fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); every num item's `check` recomputes its answer.
import { churnTable } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

const fx = (v, d = 3) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

const P = churnTable().filter((_, i) => i % 53 === 20).slice(0, 30), LR = P.length + 1;
const cells = { A1: 'Member', B1: 'Days since last visit', C1: 'Visits', D1: 'Lapsed', G1: 'Silent more than (days)', H1: 30, G2: 'Visits at least', H2: 3, G4: 'Lift',
  ...col('A', 2, P.map((c) => c.id)), ...col('B', 2, P.map((c) => c.recency)), ...col('C', 2, P.map((c) => c.frequency)), ...col('D', 2, P.map((c) => c.lapsed)) };
const base = P.reduce((s, c) => s + c.lapsed, 0) / P.length;
const grp = P.filter((c) => c.recency > 30 && c.frequency >= 3);
const liftG = grp.reduce((s, c) => s + c.lapsed, 0) / grp.length / base;
const HY = CU.kaplanMeier([2, 3, 4, 6, 7, 9, 10], [1, 1, 0, 1, 0, 1, 0]);

export const items = [
  {
    id: 'm06-m3-1', lesson: 'retention-and-churn-rates', type: 'num', kind: 'numerical',
    prompt: 'Patterdale Pilates (fictional) had 3,200 members on 1 January and 3,350 on 31 March. In the quarter 700 people joined, of whom 610 were still members on 31 March. What was the quarter’s churn rate, as a percentage?',
    answer: Math.round(CU.periodRetention({ start: 3200, end: 3350, acquired: 610 }).churn * 1000) / 10, check: () => (1 - (3350 - 610) / 3200) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: Math.round((1 - (3350 - 700) / 3200) * 1000) / 10, say: 'Only the 610 joiners still there are among the 3,350; the 90 who joined and left are in neither count.' }, { value: -4.7, say: 'End ÷ start mixes in the new members; a negative churn is the sign.' }],
    solution: 'Kept = 3,350 − 610 = 2,740 of 3,200: retention 85.6%, churn 14.4% (460 members).',
  },
  {
    id: 'm06-m3-2', lesson: 'retention-and-churn-rates', type: 'mc', kind: 'numerical',
    prompt: 'A business loses 2% of its customers every month. What is its annual churn?',
    options: ['About 21.5%', 'About 24%: twelve months at 2% each', 'About 2%, because the rate never changes', 'About 78.5%, since 0.98¹² is the share that churns'],
    answer: 0,
    feedback: { 1: 'Each month’s 2% applies only to those still there, so the months compound: 1 − 0.98¹².', 2: 'That is the monthly rate, not the rate over a year.', 3: '0.98¹² = 78.5% is the share retained; churn is 1 minus it.' },
    solution: '1 − 0.98¹² = 1 − 0.785 = 21.5%.',
  },
  {
    id: 'm06-m3-3', lesson: 'retention-and-churn-rates', type: 'mc', kind: 'applied',
    prompt: 'A fictional furniture retailer’s customers buy, on average, once every three years. Its new dashboard copies a café’s churn rule: a customer has churned after 60 days without a purchase. What will the dashboard show, and what should replace the rule?',
    options: [
      'Almost everyone as churned; set L from the retailer’s own purchase gaps, and check it.',
      'An accurate churn figure, since 60 days is a standard industry rule for lapse.',
      'Too little churn, because furniture customers rarely come back once they have bought; a 30-day rule would be better.',
      'Nothing useful, because churn can’t be measured without contracts; it should report revenue retention instead.',
    ],
    answer: 0,
    feedback: { 1: 'There is no standard L; the rule has to fit how often these customers buy.', 2: 'A shorter rule would write off even more customers.', 3: 'Churn can be defined with a lapse rule; it just has to be chosen and checked.' },
    solution: 'With purchases years apart, nearly every customer goes 60 days without buying. Choose L from the retailer’s own repeat-purchase gaps (years, not days) and check the share of “lapsed” customers who buy again.',
  },
  {
    id: 'm06-m3-4', lesson: 'retention-and-churn-rates', type: 'num', kind: 'numerical',
    prompt: 'Coniston Cloud (fictional) began the year with $1,200,000 of annual recurring revenue from its customers. Customers who left took $90,000, continuing customers downgraded by $30,000 and upgraded by $180,000, and new customers added $250,000. What was net revenue retention, as a percentage?',
    answer: 105, check: () => (1200000 - 90000 - 30000 + 180000) / 1200000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 90, say: 'That is gross revenue retention, without upgrades.' }, { value: Math.round((1200000 - 90000 - 30000 + 180000 + 250000) / 1200000 * 1000) / 10, say: 'New customers’ revenue is excluded from retention.' }],
    solution: '(1,200,000 − 90,000 − 30,000 + 180,000) ÷ 1,200,000 = 1,260,000 ÷ 1,200,000 = 105.0%. GRR = 90.0%.',
  },
  {
    id: 'm06-m3-5', lesson: 'survival-analysis', type: 'num', kind: 'numerical',
    prompt: 'The table shows Hallin Yoga’s (fictional) seven members: how long each has been observed and whether they cancelled. Estimate, by the product-limit method, the probability that a new member is still a member after six months. Give three decimal places.',
    data: { table: { head: ['Member', 'Months observed', 'Status'], rows: [['P', '2', 'cancelled'], ['Q', '3', 'cancelled'], ['R', '4', 'active'], ['S', '6', 'cancelled'], ['T', '7', 'active'], ['U', '9', 'cancelled'], ['V', '10', 'active']] } },
    answer: Math.round(HY.at(6) * 1000) / 1000, check: () => (6 / 7) * (5 / 6) * (3 / 4), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round(4 / 7 * 1000) / 1000, say: 'That is the share who hadn’t left by month 6 out of all seven, treating the member censored at month 4 as still at risk. At month 6 only 4 are at risk.' }],
    solution: `S(2) = 6/7; S(3) = 6/7 × 5/6 = 0.714; at month 6 the 4 members with times of 6 or more are at risk and 1 leaves: S(6) = 0.714 × 3/4 = ${fx(HY.at(6))}. The median is month 9.`,
  },
  {
    id: 'm06-m3-6', lesson: 'survival-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional gym compares two plans. Members on the cheap plan leave fast in the first two months and slowly after; members on the flexible plan leave slowly at first and fast after month six, so the survival curves cross. The log-rank test gives p = 0.40. What should the analyst conclude?',
    options: [
      'The plans have the same survival, so the plan doesn’t matter.',
      'The test is weak when curves cross; describe the curves and survival at chosen times instead of relying on p.',
      'The flexible plan is better, because its curve is higher early on.',
      'The test is invalid because both plans have censored members.',
    ],
    answer: 1,
    feedback: { 0: 'A large p-value is not evidence of no difference, especially when early and late differences cancel.', 2: 'Which plan is “better” depends on the horizon; the curves cross.', 3: 'The log-rank test handles censoring.' },
    solution: 'Early and late differences in opposite directions cancel in the log-rank statistic. Plot the curves and report survival at, say, 2 and 12 months.',
  },
  {
    id: 'm06-m3-7', lesson: 'survival-analysis', type: 'num', kind: 'numerical',
    prompt: 'A contract business’s customers follow an sBG model with α = 2 and β = 6. What share of a new cohort does it expect to remain after three periods? Give a percentage to one decimal place.',
    answer: Math.round(CU.sbgS(2, 6, 3) * 1000) / 10, check: () => (6 / 8) * (7 / 9) * (8 / 10) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: Math.round(0.75 ** 3 * 1000) / 10, say: 'That holds period 1’s retention constant. In the sBG, period t’s retention is (β + t − 1) ÷ (α + β + t − 1).' }],
    solution: `r₁ = 6/8, r₂ = 7/9, r₃ = 8/10; S(3) = 0.75 × 0.778 × 0.8 = ${pct(CU.sbgS(2, 6, 3))}, against 0.75³ = 42.2% with constant retention.`,
  },
  {
    id: 'm06-m3-8', lesson: 'survival-analysis', type: 'multi', kind: 'applied',
    prompt: 'In which of these situations would censored customers probably bias a Kaplan–Meier estimate of time to cancellation? Select all that apply.',
    options: [
      'Customers who complain are transferred to a partner company and drop out of the data, uncounted as cancellations.',
      'The data end on 31 December, and customers still subscribed then are censored.',
      'Customers who move abroad, the likeliest to cancel, are recorded as “left the area” and censored.',
      'Customers who joined in November are censored after two months.',
    ],
    answer: [0, 2],
    feedback: { 1: 'Censoring at a fixed date has nothing to do with each customer’s chance of cancelling.', 3: 'Late joiners are watched briefly but their censoring isn’t linked to their risk.' },
    solution: 'Kaplan–Meier assumes censored customers would have churned like those still watched. Censoring of complainers or movers removes high-risk customers, so the curve is too high.',
  },
  {
    id: 'm06-m3-9', lesson: 'predicting-churn', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds 30 members of the churn table: days since their last visit on 31 October (B), visits to date (C) and whether they lapsed in November–December (D). In H4, calculate the lift of the members silent for more than H1 days who had made at least H2 visits: their lapse rate divided by the rate of all 30.',
    sheet: { cells, vary: { H1: [20, 45], H2: [2, 4] } },
    cell: 'H4', answer: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">"&H1,C2:C${LR},">="&H2)/AVERAGE(D2:D${LR})`, require: ['AVERAGEIFS'],
    view: `A1:H${LR}`, maxHeight: '20rem', formats: { H4: '0.00' }, widths: { A: 9, B: 12, C: 7, D: 8, G: 22, H: 7 },
    wrong: [
      { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">"&H1,C2:C${LR},">="&H2)`, say: 'That is the group’s lapse rate. Lift divides it by the rate of all members.' },
      { formula: `=AVERAGEIFS(D2:D${LR},B2:B${LR},">"&H1)/AVERAGE(D2:D${LR})`, say: 'Add the second condition: at least H2 visits.' },
    ],
    solution: `<x>=AVERAGEIFS(D2:D${LR},B2:B${LR},">"&H1,C2:C${LR},">="&H2)/AVERAGE(D2:D${LR})</x>. With 30 days and 3 visits: ${grp.length} members, lift ${fx(liftG, 2)}. Regulars who have gone quiet are likelier than average to have stopped.`,
  },
  {
    id: 'm06-m3-10', lesson: 'predicting-churn', type: 'num', kind: 'numerical',
    prompt: 'Of 5,000 customers of a fictional bank, 12% closed their accounts the following year. The 500 with the highest churn scores included 210 who closed. What share of all closers did the top tenth contain, as a percentage?',
    answer: 35, check: () => 210 / (0.12 * 5000) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 42, say: 'That is the top tenth’s closure rate, 210 ÷ 500. The gains curve divides by all 600 closers.' }, { value: 3.5, say: 'That is the lift, 42% ÷ 12%.' }],
    solution: '600 customers closed; 210 ÷ 600 = 35% of them were in the top tenth, a lift of 42% ÷ 12% = 3.5.',
  },
  {
    id: 'm06-m3-11', lesson: 'predicting-churn', type: 'mc', kind: 'applied',
    prompt: 'A fictional streaming service sent a retention offer to a random half of customers in each of three risk bands. Next quarter’s churn, offer against no offer: high risk 58% against 60%; medium risk 21% against 30%; low risk 4% against 5%. Where does the offer do most?',
    options: [
      'High risk: it has the most churners, so the offer reaches the most people at risk.',
      'Low risk: the offer cuts churn by a fifth there.',
      'Medium risk: it cuts churn by 9 points, the biggest measured difference.',
      'Nowhere: the differences are too small to matter in any band.',
    ],
    answer: 2,
    feedback: { 0: 'The offer cuts churn by only 2 points there: most high-risk customers leave anyway.', 1: 'A fifth of 5% is 1 point; relative cuts mislead when the base is tiny.', 3: 'Nine points in the medium band is large; whether it pays depends on the offer’s cost.' },
    solution: 'Uplift is the difference between the randomised halves: 2, 9 and 1 points. The medium band responds most; the highest-risk customers are mostly beyond reach.',
  },
  {
    id: 'm06-m3-12', lesson: 'predicting-churn', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional phone company predicts on 1 April which customers will leave between April and June. Is each predictor usable, or does it leak?',
    items: ['Calls to customer service in March.', 'Whether the customer requested their unlocking code in May.', 'Months since the contract started, as of 31 March.', 'Data used in April.'],
    categories: ['Usable', 'Leaks'],
    answer: [0, 1, 0, 1],
    feedback: { 1: 'May is inside the outcome window.', 3: 'April is after the prediction date.' },
    solution: 'Only information known by 31 March can be used; May’s unlocking requests and April’s usage come from the outcome window.',
  },
];
