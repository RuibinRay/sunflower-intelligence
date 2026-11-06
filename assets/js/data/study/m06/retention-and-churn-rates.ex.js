// retention-and-churn-rates.ex.js — M06 · Retention and churn rates: widgets, practice and the knowledge check (answer
// keys live here). The worksheet items use 24 of the cafés' loyalty-app members (every 107th from case.js members(), as
// of 31 December 2027). Mardale Music School, Grisedale Analytics, Wasdale Broadband, Hartsop Fitness and the other
// businesses named are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { members, AS_OF } from './case.js?v=27';
import { isoToSerial } from '../../../core/sheet.js?v=27';
import * as CU from '../../../core/customer.js?v=27';

const fx = (v, d = 1) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 1) => `${fx(v * 100, d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- worksheet: 24 members on 31 December 2027
const PICK = members().filter((_, i) => i % 107 === 3).slice(0, 24);
const N = PICK.length, LR = N + 1;
const lastSerial = PICK.map((c) => isoToSerial(CU.isoDay(c.last)));
const memberCells = { A1: 'Member', B1: 'Café', C1: 'Last visit', D1: 'Lapsed', G1: 'As of', H1: isoToSerial(CU.isoDay(AS_OF)), G2: 'L (days)', H2: 60,
  ...col('A', 2, PICK.map((c) => c.id)), ...col('B', 2, PICK.map((c) => c.cafe)), ...col('C', 2, lastSerial) };
const lapsedFlags = PICK.map((c) => (c.recency > 60 ? 1 : 0));
const nLapsed = lapsedFlags.reduce((s, v) => s + v, 0);
const flagCells = col('D', 2, PICK.map((_, i) => `=IF($H$1-C${i + 2}>$H$2,1,0)`));

// ---------------------------------------------------------------- fictional numbers
const MM = { start: 640, end: 702, joined: 150, joinedStill: 138 };      // Mardale Music School, one term
const mmR = CU.periodRetention({ start: MM.start, end: MM.end, acquired: MM.joinedStill });
const GA = { mrr: 50000, lost: 4500, down: 2000, up: 7500 };            // Grisedale Analytics
const WB = { start: 8400, end: 9100, acquired: 2300 };                  // Wasdale Broadband
const MONTHLY = [0.021, 0.018, 0.025, 0.03, 0.022, 0.019, 0.024, 0.035, 0.028, 0.02, 0.017, 0.026];   // Elterwater Gyms, monthly churn
const ANNUAL = [0.25, 0.4, 0.12, 0.6, 0.33];                            // five fictional businesses' annual churn
const mix2 = (w, a, b, t) => (w * a ** t + (1 - w) * b ** t) / (w * a ** (t - 1) + (1 - w) * b ** (t - 1));

export const widgets = {
  'ret-compound': {
    type: 'formula',
    title: 'From monthly churn to a year',
    intro: 'Set the churn rate per month. The same rate applies every month.',
    inputs: [
      { id: 'c', label: 'Monthly churn', min: 0.5, max: 20, step: 0.5, value: 3, fmt: 'pct' },
    ],
    compute: (v) => {
      const c = v.c / 100, ann = CU.compoundChurn(c, 12), months = Array.from({ length: 25 }, (_, t) => t);
      return {
        headline: { label: 'Annual churn', value: pct(ann) },
        rows: [['12 × monthly churn (wrong)', pct(Math.min(12 * c, 9.99), 1) + (12 * c > 1 ? ' (impossible: above 100%)' : '')], ['Still a customer after a year', pct(1 - ann)], ['Expected lifetime (counting the first month)', `${fx(1 / c, 1)} months`], ['Median lifetime', `${fx(Math.log(0.5) / Math.log(1 - c), 1)} months`]],
        note: `A ${fx(v.c, 1)}% monthly rate compounds to ${pct(ann)} a year: each month’s churn applies only to the customers still there. The mean lifetime, ${fx(1 / c, 1)} months, is longer than the median because a few customers stay a long time.`,
        chart: { kind: 'line', x: { label: 'Months since joining', values: months }, series: [{ name: 'Share still a customer', values: months.map((t) => (1 - c) ** t) }], y: { label: 'Share still a customer' } },
      };
    },
  },
  'ret-mix': {
    type: 'formula',
    title: 'Two kinds of customer, each with a fixed retention rate',
    intro: 'A share of new customers are “flighty” and the rest “loyal”. Nobody changes. Watch the group’s retention rate.',
    inputs: [
      { id: 'w', label: 'Share who are flighty', min: 10, max: 90, step: 5, value: 50, fmt: 'pct' },
      { id: 'a', label: 'Flighty customers’ yearly retention', min: 10, max: 95, step: 5, value: 50, fmt: 'pct' },
      { id: 'b', label: 'Loyal customers’ yearly retention', min: 10, max: 99, step: 1, value: 90, fmt: 'pct' },
    ],
    compute: (v) => {
      const w = v.w / 100, a = v.a / 100, b = v.b / 100, ys = Array.from({ length: 10 }, (_, t) => t + 1);
      const S = (t) => w * a ** t + (1 - w) * b ** t, r1 = S(1);
      return {
        headline: { label: 'Group retention: year 1 → year 5', value: `${pct(r1)} → ${pct(S(5) / S(4))}` },
        rows: [['Group retention in year 2', pct(S(2) / S(1))], ['Still customers after 5 years', pct(S(5))], ['Projected from year 1’s rate held constant', pct(r1 ** 5)]],
        note: Math.abs(a - b) < 1e-9 ? 'With equal rates there is no sorting: the group’s rate stays where it started.' : `The group’s rate rises because the customers likelier to leave leave first. Holding year 1’s ${pct(r1)} constant ${S(5) > r1 ** 5 ? 'understates' : 'misstates'} the five-year survivors: ${pct(r1 ** 5)} against ${pct(S(5))}.`,
        chart: { kind: 'line', x: { label: 'Year', values: ys }, series: [{ name: 'Group retention rate', values: ys.map((t) => S(t) / S(t - 1)) }, { name: 'Year 1’s rate held constant', values: ys.map(() => r1) }], y: { label: 'Retention rate' } },
      };
    },
  },
  'ret-fh': {
    type: 'sbg',
    title: 'Fader and Hardie’s (2007) “Regular” customers, followed for 12 years',
    cohorts: [{ name: 'Regular', alive: [1000, 631, 468, 382, 326, 289, 262, 241, 223, 207, 194, 183, 173] }],
    fit: 7, fitRange: [3, 11], horizon: 12, unit: 'year',
    note: 'Published data: Table 1’s percentages still active after each year (Fader and Hardie 2007), written as counts per 1,000 customers, as the paper’s appendix does for its High End customers. “Constant” uses one retention rate for every year, fitted to the years up to the slider.',
  },
};

export const guided = [
  {
    id: 'm06-ret-g1', type: 'steps', kind: 'numerical',
    prompt: 'Mardale Music School (fictional) had 640 pupils at the start of the autumn term and 702 at the end. During the term 150 new pupils enrolled, of whom 138 were still enrolled at the end.',
    solution: `Kept = 702 − 138 = ${MM.end - MM.joinedStill}; retention = ${MM.end - MM.joinedStill} ÷ 640 = ${pct(mmR.retention)}, churn ${pct(mmR.churn)}. 702 ÷ 640 = ${pct(MM.end / MM.start)} is growth. Over three such terms: 1 − ${fx(mmR.retention, 5)}³ = ${pct(CU.compoundChurn(mmR.churn, 3))} churn.`,
    steps: [
      {
        id: 'm06-ret-g1-s1', type: 'num', kind: 'numerical',
        prompt: 'What was the term’s retention rate, as a percentage?',
        answer: Math.round(mmR.retention * 1000) / 10, check: () => (702 - 138) / 640 * 100, unit: '%', places: 1, tol: 0.05,
        wrong: [{ value: Math.round(702 / 640 * 1000) / 10, say: 'That is end ÷ start: it counts the new pupils as if they had been kept. Remove the 138 new pupils still enrolled first.' }, { value: Math.round((702 - 150) / 640 * 1000) / 10, say: 'Only the 138 new pupils still enrolled at the end are among the 702. The 12 who enrolled and left aren’t in the end count, so don’t subtract them.' }],
        hints: ['Only the 640 at the start can be retained.', 'Retention = (702 − 138) ÷ 640.'],
      },
      {
        id: 'm06-ret-g1-s2', type: 'mc', kind: 'conceptual',
        prompt: 'The school’s newsletter says “702 ÷ 640 = 109.7%: we kept more pupils than we had”. What does 109.7% measure?',
        options: ['Growth, including the new pupils.', 'Retention, which can exceed 100% when pupils return.', 'Net revenue retention.', 'The share of new pupils who stayed.'],
        answer: 0,
        hints: ['Which pupils are in 702 that weren’t in 640?'],
        feedback: { 1: 'Retention follows the 640 at the start; it can’t exceed 100%.', 2: 'Revenue retention is about money from the starting pupils; this is a head count including newcomers.', 3: 'That would be 138 ÷ 150 = 92%.' },
      },
      {
        id: 'm06-ret-g1-s3', type: 'num', kind: 'numerical',
        prompt: 'The school has three terms a year. If churn stays at this term’s rate, what is the annual churn, as a percentage?',
        answer: Math.round(CU.compoundChurn(mmR.churn, 3) * 1000) / 10, check: () => (1 - ((702 - 138) / 640) ** 3) * 100, unit: '%', places: 1, tol: 0.1,
        wrong: [{ value: Math.round(mmR.churn * 3 * 1000) / 10, say: 'Churn compounds: the second term’s churn applies only to the pupils still there. Use 1 − retention³.' }],
        hints: ['A pupil is still enrolled after a year with probability retention³.', `1 − ${fx(mmR.retention, 4)}³.`],
      },
    ],
  },
  {
    id: 'm06-ret-g2', type: 'steps', kind: 'applied',
    prompt: `The worksheet lists ${N} loyalty-app members with each one’s last visit on or before 31 December 2027 (H1). H2 holds the lapse rule: a member has lapsed if more than H2 days have passed since their last visit.`,
    solution: `D2: <x>=IF($H$1-C2>$H$2,1,0)</x>, filled down. With L = 60, ${nLapsed} of the ${N} have lapsed: <x>=AVERAGE(D2:D${LR})</x> = ${pct(nLapsed / N)} (all 2,584 members: 51.2%). Change H2 and the figure changes: the rule decides it.`,
    steps: [
      {
        id: 'm06-ret-g2-s1', type: 'formula',
        prompt: 'In D2, return 1 if the first member has lapsed under the rule in H2 and 0 if not, so that the formula fills down to every member.',
        sheet: { cells: { ...memberCells }, vary: { H2: [30, 90, 120] } },
        cell: 'D2', fill: `D2:D${LR}`, answer: '=IF($H$1-C2>$H$2,1,0)', alt: ['=IF(C2<$H$1-$H$2,1,0)', '=--($H$1-C2>$H$2)', '=($H$1-C2>$H$2)*1'],
        view: `A1:H${LR}`, maxHeight: '20rem', formats: { C: 'date', H1: 'date', D: '0' }, widths: { A: 9, B: 12, C: 13, D: 8, G: 9, H: 13 },
        wrong: [
          { formula: '=IF(H1-C2>H2,1,0)', say: 'H1 and H2 must stay put as the formula fills down: lock them with dollar signs ($H$1, $H$2).' },
          { formula: '=IF($H$1-C2>60,1,0)', say: 'Refer to the rule in H2, so the flags update when Ana changes it.' },
        ],
        hints: ['Days since the last visit = H1 − C2. Compare that with H2.', '<x>=IF($H$1-C2>$H$2,1,0)</x>'],
      },
      {
        id: 'm06-ret-g2-s2', type: 'formula',
        prompt: 'Column D now holds the flags. In H3, calculate the share of these members who have lapsed.',
        sheet: { cells: { ...memberCells, ...flagCells, G3: 'Share lapsed' }, vary: { H2: [30, 90, 120] } },
        cell: 'H3', answer: `=AVERAGE(D2:D${LR})`, alt: [`=SUM(D2:D${LR})/COUNT(D2:D${LR})`, `=COUNTIF(D2:D${LR},1)/COUNT(D2:D${LR})`, `=SUM(D2:D${LR})/${N}`, `=COUNTIF(D2:D${LR},1)/COUNTA(A2:A${LR})`],
        view: `A1:H${LR}`, maxHeight: '20rem', formats: { C: 'date', H1: 'date', D: '0', H3: '0.0%' }, widths: { A: 9, B: 12, C: 13, D: 8, G: 12, H: 13 },
        wrong: [{ formula: `=SUM(D2:D${LR})`, say: 'That is the number lapsed. Divide by the number of members for the share.' }],
        hints: ['The flags are 0s and 1s, so their average is the share of 1s.', `<x>=AVERAGE(D2:D${LR})</x>`],
      },
    ],
  },
  {
    id: 'm06-ret-g3', type: 'num', kind: 'numerical',
    prompt: 'A streaming service (fictional) loses 4% of its subscribers each month, the same every month. What is its annual churn, as a percentage?',
    answer: Math.round(CU.compoundChurn(0.04, 12) * 1000) / 10, check: () => (1 - 0.96 ** 12) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 48, say: '12 × 4% assumes each month’s churn applies to the original subscribers. It applies only to those still there.' }],
    hints: ['After a year a subscriber is still there with probability 0.96¹².', '1 − 0.96¹².'],
    solution: `0.96¹² = ${fx(0.96 ** 12, 3)}, so annual churn is ${pct(CU.compoundChurn(0.04, 12))}, not 48%. The expected lifetime is 1 ÷ 0.04 = 25 months.`,
  },
  {
    id: 'm06-ret-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A gym’s data show that 55% of new members renew after the first year, 72% of those after the second and 81% after the third. The manager concludes that members become more committed the longer they stay. What else could explain the pattern, even if no member changed?',
    options: [
      'Members differ: the likeliest leavers go first, so the members left are increasingly the committed ones.',
      'Retention rates always rise over time because the denominator shrinks.',
      'Rising prices drive out casual members each year.',
      'The data must contain an error, because retention can’t rise from year to year if each member’s chance of leaving is fixed.',
    ],
    answer: 0,
    hints: ['Think of two kinds of member with different, fixed chances of renewing.', 'Who is left after year 1?'],
    feedback: {
      1: 'A smaller denominator doesn’t raise a rate by itself: if every member renewed with the same fixed chance, the rate would stay put.',
      2: 'Possible, but that is a change in what happens to members, not the explanation that needs no change at all.',
      3: 'It can: each member’s chance is fixed, but the mix of members changes. That is the sorting effect.',
    },
    solution: 'The sorting effect: with members of different kinds, the leavers are mostly of the flighty kind, so each year’s survivors are more loyal on average and the group’s rate rises. The data can’t tell this from growing commitment; both may be at work.',
  },
];

export const independent = [
  {
    id: 'm06-ret-i1', type: 'num', kind: 'numerical',
    prompt: 'A business keeps 80% of its customers each year, the same every year. How many years does a new customer stay on average, counting the first?',
    answer: 5, check: () => CU.expectedLifetime(0.8), unit: 'years', places: 1, tol: 0.05,
    wrong: [{ value: 4, say: 'That is r ÷ (1 − r), the renewals after the first year. Counting the first year, the expected lifetime is 1 ÷ (1 − r).' }, { value: 1.25, say: 'That is 1 ÷ r. The expected lifetime divides by the churn rate, 1 − r.' }],
    solution: 'Expected lifetime = 1 ÷ churn = 1 ÷ 0.20 = 5 years. Half of customers leave within ln 0.5 ÷ ln 0.8 = 3.1 years: the mean is pulled up by the few who stay long.',
  },
  {
    id: 'm06-ret-i2', type: 'num', kind: 'numerical',
    prompt: 'Grisedale Analytics (fictional) began the month with $50,000 of monthly recurring revenue from its customers. Customers who left took $4,500; continuing customers downgraded by $2,000 and upgraded by $7,500. New customers added $6,000. What was its net revenue retention for the month, as a percentage?',
    answer: 102, check: () => (GA.mrr - GA.lost - GA.down + GA.up) / GA.mrr * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 87, say: 'That is gross revenue retention, without the upgrades. Net revenue retention adds what continuing customers spent on upgrades.' }, { value: 114, say: 'New customers’ revenue is excluded: retention is about the customers there at the start.' }],
    solution: 'NRR = (50,000 − 4,500 − 2,000 + 7,500) ÷ 50,000 = 51,000 ÷ 50,000 = 102.0%. GRR = 43,500 ÷ 50,000 = 87.0%. The $6,000 from new customers counts in growth, not retention.',
  },
  {
    id: 'm06-ret-i3', type: 'formula', kind: 'numerical',
    prompt: 'Elterwater Gyms (fictional) recorded a different churn rate in each month of the year, in B2:B13. In D2, calculate the year’s churn: the share of members at the start of the year who had left by its end, assuming each month’s rate applies to the members still there.',
    sheet: { cells: { A1: 'Month', B1: 'Monthly churn', C1: '', D1: 'Annual churn', ...col('A', 2, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']), ...col('B', 2, MONTHLY) } },
    cell: 'D2', answer: '=1-PRODUCT(1-B2:B13)', alt: ['=1-(1-B2)*(1-B3)*(1-B4)*(1-B5)*(1-B6)*(1-B7)*(1-B8)*(1-B9)*(1-B10)*(1-B11)*(1-B12)*(1-B13)'],
    view: 'A1:D13', formats: { B: '0.0%', D: '0.0%' }, widths: { A: 8, B: 14, C: 3, D: 14 },
    wrong: [
      { formula: '=SUM(B2:B13)', say: 'Adding the monthly rates assumes each applies to the original members. Multiply the monthly retention rates, (1 − churn), and subtract the product from 1.' },
      { formula: '=PRODUCT(1-B2:B13)', say: 'That is the year’s retention, the share still members. Churn is 1 minus it.' },
      { formula: '=1-(1-AVERAGE(B2:B13))^12', say: 'Close, but not exact: compound the actual monthly rates rather than their average.' },
    ],
    solution: `<x>=1-PRODUCT(1-B2:B13)</x> = ${pct(1 - MONTHLY.reduce((p, c) => p * (1 - c), 1))}. Adding the rates gives ${pct(MONTHLY.reduce((s, c) => s + c, 0))}, too high, because each month’s churn applies only to the members left.`,
  },
  {
    id: 'm06-ret-i4', type: 'mc', kind: 'applied',
    prompt: 'Wasdale Broadband (fictional) had 8,400 customers on 1 January and 9,100 on 31 December. It won 3,000 new customers during the year, of whom 2,300 were still customers on 31 December. Its report says “annual churn: 700 ÷ 8,400 = 8.3%”, where 700 is the number of new customers who left. What is wrong?',
    options: [
      'It counts the wrong people: churn is about the 8,400 at the start, of whom 8,400 − (9,100 − 2,300) = 1,600 left, 19.0%.',
      'Nothing: 700 customers left during the year and 8,400 were customers at the start, so 700 ÷ 8,400 is the right calculation.',
      'Churn should be divided by the 9,100 at the end, not the 8,400 at the start.',
      'Churn should be 1 − 9,100 ÷ 8,400, which is negative, so Wasdale had no churn.',
    ],
    answer: 0,
    feedback: {
      1: 'The 700 are new customers who joined and left within the year; they weren’t among the 8,400. The starting customers’ losses are what churn measures.',
      2: 'Dividing by the end mixes in the 2,300 new customers.',
      3: 'End ÷ start is growth. A negative “churn” is the sign that new customers have been mixed in.',
    },
    solution: 'Kept = 9,100 − 2,300 = 6,800 of the 8,400; churn = 1,600 ÷ 8,400 = 19.0%; retention 81.0%. The 700 new customers who left are an acquisition-quality problem, reported separately.',
  },
  {
    id: 'm06-ret-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Is each relationship contractual (the business sees the customer leave) or noncontractual (departure must be inferred from silence)?',
    items: ['A phone contract that the customer must cancel.', 'A café loyalty-app member.', 'An annual home-insurance policy.', 'A shopper at an online clothing store.', 'A gym membership with a monthly direct debit.', 'A supermarket loyalty-card holder.'],
    categories: ['Contractual', 'Noncontractual'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: { 1: 'Nobody tells the café they’ve stopped coming; Lantern can only see that they haven’t visited.', 3: 'A shopper can stop buying without telling the store.', 5: 'The card stays in the wallet whether or not its holder shops there.' },
    solution: 'Contractual: the phone contract, the insurance policy and the gym membership, which end with a cancellation or a non-renewal the business sees. Noncontractual: the café member, the clothing shopper and the supermarket card holder, whose “churn” needs a lapse rule.',
  },
  {
    id: 'm06-ret-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional magazine’s new subscribers are of two kinds: 60% renew each year with probability 40%, and 40% renew with probability 85%. Nobody changes. What is the group’s retention rate in year 2 (the share of year-1 renewers who renew again), as a percentage?',
    answer: Math.round(mix2(0.6, 0.4, 0.85, 2) * 1000) / 10, check: () => (0.6 * 0.4 ** 2 + 0.4 * 0.85 ** 2) / (0.6 * 0.4 + 0.4 * 0.85) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 58, say: 'That is year 1’s rate, 0.6 × 40% + 0.4 × 85%. In year 2 the mix has changed: fewer of the first kind are left.' }],
    solution: `Year 1: 0.6 × 0.4 + 0.4 × 0.85 = 0.58 renew (0.24 of the first kind, 0.34 of the second). Year 2: 0.24 × 0.4 + 0.34 × 0.85 = 0.096 + 0.289 = 0.385, so ${pct(mix2(0.6, 0.4, 0.85, 2))} of year 1’s renewers renew again.`,
  },
];

export const check = [
  {
    id: 'm06-ret-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s pooled data show that of members who visited in their joining month, 60.5% visited the next month, while of those who visited four months after joining, 70.8% visited the next month. The data were generated with each member’s visit rate and drop-out chance fixed. What explains the rise?',
    options: [
      'Members likely to stop have mostly stopped by month four; those left are the steadier ones.',
      'Members visit more often the longer they have been members.',
      'Later months have more members in them, so the rate is more precise.',
      'Seasonal footfall rises through the year, so members who joined earlier are visiting in the cafés’ busiest months.',
    ],
    answer: 0,
    feedback: {
      1: 'Not here: each member’s rate was fixed when the data were made. The group changed, not the members.',
      2: 'Precision affects how much a rate wobbles, not which way it moves. Later months in fact have fewer members.',
      3: 'The calendar may add a little, but it can’t produce a rise by months since joining in data where each member’s rate is fixed.',
    },
    solution: 'The sorting effect: members with high drop-out chances leave early, so the members active four months in are the low-risk ones. Pooled curves also mix cohorts; restricting to March–July joiners gives the same start and end, though not a steady climb.',
  },
  {
    id: 'm06-ret-k2', type: 'num', kind: 'numerical',
    prompt: 'A business’s quarterly churn is 9%, the same every quarter. What is its annual churn, as a percentage?',
    answer: Math.round(CU.compoundChurn(0.09, 4) * 1000) / 10, check: () => (1 - 0.91 ** 4) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 36, say: 'Churn compounds: 1 − 0.91⁴, not 4 × 9%.' }],
    solution: `1 − 0.91⁴ = 1 − ${fx(0.91 ** 4, 4)} = ${pct(CU.compoundChurn(0.09, 4))}.`,
  },
  {
    id: 'm06-ret-k3', type: 'num', kind: 'applied',
    prompt: 'Rydal Energy (fictional) had 15,000 household accounts on 1 July and 15,600 on 30 September. It won 2,100 new accounts in the quarter, of which 1,950 were still open on 30 September. What was its retention rate for the quarter, as a percentage?',
    answer: Math.round((15600 - 1950) / 15000 * 1000) / 10, check: () => CU.periodRetention({ start: 15000, end: 15600, acquired: 1950 }).retention * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 104, say: 'End ÷ start is growth. Remove the 1,950 new accounts still open first.' }, { value: 90, say: 'Subtract only the new accounts still open at the end (1,950), since only they are among the 15,600.' }],
    solution: 'Kept = 15,600 − 1,950 = 13,650 of the 15,000: retention 91.0%, churn 9.0% (1,350 accounts).',
  },
  {
    id: 'm06-ret-k4', type: 'mc', kind: 'applied',
    prompt: 'On 31 December 2027, 51.2% of Lantern’s app members had not visited for more than 60 days; with a 90-day rule it is 41.4%. A manager asks which figure is “the real churn”. What is the best answer?',
    options: [
      'Neither: here churn is whatever lapse rule is chosen.',
      'The 60-day figure, because a shorter rule catches churners sooner.',
      'The 90-day figure, because nobody who has been away for 90 days ever comes back.',
      'Average the two: 46.3%.',
    ],
    answer: 0,
    feedback: {
      1: 'Sooner, but it also writes off more members who will come back; whether that is better depends on what the figure is for.',
      2: 'Some do: in the data, members silent for long periods still come back occasionally. No rule is error-free.',
      3: 'An average of two definitions is a third definition, with no clearer meaning.',
    },
    solution: 'Neither is the real churn: members never cancel, so churn is whatever rule is chosen. In a noncontractual setting churn is a definition applied to silence. Choose L from the business, measure its error (7.5% of members past 60 days on 31 October came back within two months) and keep the rule fixed so that figures compare.',
  },
  {
    id: 'm06-ret-k5', type: 'formula', kind: 'numerical',
    prompt: 'B2:B6 hold five fictional businesses’ annual churn rates. In C2, calculate the equivalent constant monthly churn rate for the first business, so that the formula fills down to C6.',
    sheet: { cells: { A1: 'Business', B1: 'Annual churn', C1: 'Monthly churn', ...col('A', 2, ['Glenridding Gyms', 'Askham Apps', 'Bampton Bank', 'Shap Streaming', 'Haweswater Hosting']), ...col('B', 2, ANNUAL) } },
    cell: 'C2', fill: 'C2:C6', answer: '=1-(1-B2)^(1/12)', alt: ['=1-POWER(1-B2,1/12)'],
    view: 'A1:C6', formats: { B: '0.0%', C: '0.00%' }, widths: { A: 20, B: 13, C: 14 },
    wrong: [
      { formula: '=B2/12', say: 'Dividing by 12 ignores compounding. Find the monthly retention whose twelfth power is the annual retention: (1 − B2)^(1/12), then subtract from 1.' },
      { formula: '=(1-B2)^(1/12)', say: 'That is the monthly retention rate. Churn is 1 minus it.' },
      { formula: '=1-(1-B2)^12', say: 'That turns a monthly rate into an annual one. Here you go the other way: the power is 1/12.' },
    ],
    solution: `<x>=1-(1-B2)^(1/12)</x>: for 25% a year, 1 − 0.75^(1/12) = ${pct(1 - 0.75 ** (1 / 12), 2)} a month, a little more than 25% ÷ 12 = 2.08%.`,
  },
  {
    id: 'm06-ret-k6', type: 'multi', kind: 'conceptual',
    prompt: 'A software firm reports net revenue retention of 115% and customer retention of 78%. Select all the statements that must be true.',
    options: [
      'Continuing customers’ upgrades more than made up for the revenue lost from customers who left or downgraded.',
      'Revenue from new customers is not part of the 115%.',
      'The firm kept more than 100% of its customers.',
      'Gross revenue retention was also above 100%.',
    ],
    answer: [0, 1],
    feedback: { 2: 'Customer retention was 78%: 22% of customers left. NRR counts money, not heads.', 3: 'GRR leaves out upgrades, so it can’t exceed 100%.' },
    solution: 'NRR above 100% means the starting customers, net of losses and downgrades, spend more than they did, through upgrades. New customers are excluded. Customer retention (78%) and GRR (at most 100%) tell the rest of the story.',
  },
];
