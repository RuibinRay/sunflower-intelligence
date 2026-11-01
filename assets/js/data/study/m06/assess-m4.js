// assess-m4.js — M06 module 4 test: Customer value and strategy (customer-lifetime-value, acquisition-cost-and-payback,
// loyalty-and-retention-strategy). New questions on new scenarios, not copies of lesson exercises. No hints; solutions
// are shown when the student reviews the test. The café members' visits come from case.js; every other business, person
// and number is fictional. Formula items are marked by their results (core/sheet.js gradeFormula); every num item's
// `check` recomputes its answer.
import { MEMBER_LIST, VISIT_LIST } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';
import { propTest2 } from '../../../core/inference.js?v=25';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// the six members who joined at Harbourside on 1 May 2027, and every visit they made to 31 December
const DAY = MEMBER_LIST.filter((m) => m.joinedIso === '2027-05-01' && m.cafe === 'Harbourside');
const ids = new Set(DAY.map((m) => m.id)), join = new Map(DAY.map((m) => [m.id, m.joined]));
const VIS = VISIT_LIST.filter((v) => ids.has(v.id)).map((v) => ({ id: v.id, date: v.date, k: CU.monthOf(v.day) - CU.monthOf(join.get(v.id)), amount: v.amount }));
const nV = VIS.length, lastV = nV + 1;
const visCells = { A1: 'Member', B1: 'Date', C1: 'Months since joining', D1: 'Spend ($)', F1: DAY.length, G1: 'Joiners', F2: 1, G2: 'Month', G3: 'Spend per joiner ($)',
  ...col('A', 2, VIS.map((v) => v.id)), ...col('B', 2, VIS.map((v) => v.date)), ...col('C', 2, VIS.map((v) => v.k)), ...col('D', 2, VIS.map((v) => v.amount)) };
const perJoiner = (k) => VIS.filter((v) => v.k === k).reduce((s, v) => s + v.amount, 0) / DAY.length;

// fictional figures
const PC = { m: 60, r: 0.9, d: 0.02 };                                  // a pest-control firm's quarterly contracts
const pcRes = CU.clvConstant({ ...PC, timing: 'end' }).value;
const tailCells = { A1: 'Latest month’s spend per joiner ($)', B1: 1.8, A2: 'Monthly decay factor', B2: 0.86, A3: 'Margin rate', B3: 0.67, A4: 'Discount rate a month', B4: 0.008, A6: 'Value of the months to come ($)' };
const tailAns = 1.8 * 0.67 * 0.86 / (1 + 0.008 - 0.86);
const chCells = { A1: 'Channel', B1: 'Margin a month ($)', C1: 'Retention a month', D1: 'CAC ($)', E1: 'Value ÷ CAC', G1: 'Discount rate a month', H1: 0.01,
  A2: 'Search', B2: 9, C2: 0.9, D2: 35, A3: 'Marketplace', B3: 7, C3: 0.82, D3: 18, A4: 'Influencers', B4: 11, C4: 0.94, D4: 140 };
const chRatio = (m, r, c) => m * 1.01 / (1.01 - r) / c;
const PET = propTest2(90, 600, 66, 600);

export const items = [
  {
    id: 'm06-m4-1', lesson: 'customer-lifetime-value', type: 'num', kind: 'numerical',
    prompt: 'A fictional pest-control firm earns a margin of $60 a quarter on each household contract; 90% of households renew each quarter, and the firm discounts at 2% a quarter. A household has just paid this quarter. What are its remaining margins worth today under constant retention? Give dollars to the cent.',
    answer: Math.round(pcRes * 100) / 100, check: () => 60 * 0.9 / (1.02 - 0.9), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(60 * 1.02 / 0.12 * 100) / 100, say: 'That counts this quarter’s margin again, which the household has already paid. The residual value starts with next quarter’s, if it renews.' }, { value: 600, say: 'That ignores discounting and still counts this quarter: 60 ÷ (1 − 0.9).' }],
    solution: `Residual value = m r ÷ (1 + d − r) = 60 × 0.90 ÷ 0.12 = $${fx(pcRes)}. A household about to sign would be worth one quarter’s margin more after discounting: 60 × 1.02 ÷ 0.12 = $510.00.`,
  },
  {
    id: 'm06-m4-2', lesson: 'customer-lifetime-value', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional software firm’s first annual cohort renewed at 70%, then 78%, 83% and 86% of those remaining in years 2 to 4. An analyst averages the four rates (79%) and projects survival with that rate for ten years. If the pattern continues, what does the projection do?',
    options: [
      'It understates long-run survival.',
      'It overstates survival, because the later rates are higher than the first and pull the average up.',
      'It is unbiased, since an average of past rates is the best single estimate of future ones.',
      'It understates survival in early years but overstates it in later ones, so the errors cancel.',
    ],
    answer: 0,
    feedback: {
      1: 'The later rates are higher than the average, and if the rise continues the future rates will be higher still, so a fixed 79% loses customers too fast.',
      2: 'An average of a rising series is below its later values; rising retention (the sorting of a varied cohort) makes it biased.',
      3: 'Years 2 to 4 retained more than 79% already; a constant 79% understates survival from the start of year 2 and increasingly after.',
    },
    solution: 'Rising cohort retention is what heterogeneity produces: the flighty leave first. A constant rate fixed at the average ignores that the survivors are increasingly the loyal ones, so it understates survival and lifetime value, as the sBG comparison shows.',
  },
  {
    id: 'm06-m4-3', lesson: 'customer-lifetime-value', type: 'formula', kind: 'applied',
    prompt: `The worksheet lists every visit to 31 December 2027 by the ${DAY.length} members who joined at Harbourside on 1 May 2027, with the months since each joined (0 for May). F1 holds the number of joiners and F2 a month since joining. In F3, calculate the spend per joiner in that month, a cell of this small cohort’s row in a cohort revenue table.`,
    sheet: { cells: { ...visCells }, fixed: [`C2:C${lastV}`], vary: { F2: [0, 2, 4] } },
    cell: 'F3', answer: `=SUMIFS(D2:D${lastV},C2:C${lastV},F2)/F1`,
    alt: [`=SUMIF(C2:C${lastV},F2,D2:D${lastV})/F1`, `=SUMPRODUCT((C2:C${lastV}=F2)*D2:D${lastV})/F1`],
    view: `A1:G${lastV}`, maxHeight: '20rem', formats: { D: '$#,##0.00', F3: '$#,##0.00' }, widths: { A: 9, B: 12, C: 19, D: 10, F: 9, G: 19 },
    wrong: [
      { formula: `=SUMIFS(D2:D${lastV},C2:C${lastV},F2)/COUNTIFS(C2:C${lastV},F2)`, say: 'That is the spend per visit in that month. Revenue per joiner divides by everyone who joined, including those who didn’t visit that month.' },
      { formula: `=SUMIFS(D2:D${lastV},C2:C${lastV},F2)`, say: 'That is the cohort’s total for the month. Divide by the number of joiners in F1.' },
      { formula: `=SUMIFS(D2:D${lastV},C2:C${lastV},F2)/${DAY.length}`, say: 'Refer to F1 rather than typing the number of joiners, so the formula works for any cohort.' },
    ],
    solution: `<x>=SUMIFS(D2:D${lastV},C2:C${lastV},F2)/F1</x>. Month 1 (June): $${fx(perJoiner(1))} per joiner; month 0: $${fx(perJoiner(0))}. Times the 67% margin, these are the cohort’s margins per joiner that a historical value adds up.`,
  },
  {
    id: 'm06-m4-4', lesson: 'customer-lifetime-value', type: 'formula', kind: 'numerical',
    prompt: 'A café cohort’s spend per joiner in its latest month is in B1. Ana assumes it keeps falling by the factor in B2 each month, with the margin rate in B3 and the monthly discount rate in B4, the first projected month being one month from now. In B6, calculate the present value of all the months still to come, per joiner.',
    sheet: { cells: { ...tailCells }, vary: { B2: [0.8, 0.9, 0.93], B4: [0, 0.005, 0.012] } },
    cell: 'B6', answer: '=B1*B3*B2/(1+B4-B2)', alt: ['=B1*B2*B3/(1+B4-B2)', '=B1*B3*(B2/(1+B4))/(1-B2/(1+B4))'],
    view: 'A1:B6', formats: { B1: '$#,##0.00', B2: '0.00', B3: '0%', B4: '0.0%', B6: '$#,##0.00' }, widths: { A: 34, B: 11 },
    wrong: [
      { formula: '=B1*B3*(1+B4)/(1+B4-B2)', say: 'That includes the latest month again (undiscounted). The months to come start one month away with spend B1 × B2.' },
      { formula: '=B1*B2/(1+B4-B2)', say: 'That is spend, not margin: multiply by the margin rate in B3.' },
      { formula: '=B1*B3*B2/(1-B2)', say: 'Discount the future months: the denominator is 1 + d − q.' },
    ],
    solution: `The months to come are B1 × q × m ÷ (1 + d), B1 × q² × m ÷ (1 + d)², …, a geometric series summing to B1 × m × q ÷ (1 + d − q): <x>=B1*B3*B2/(1+B4-B2)</x> = $${fx(tailAns)}.`,
  },
  {
    id: 'm06-m4-5', lesson: 'acquisition-cost-and-payback', type: 'num', kind: 'numerical',
    prompt: 'A fictional dental practice runs a local radio campaign costing $4,800. It gains 140 new patients that quarter, against about 100 in a typical quarter. What did each patient the campaign won cost? Give dollars to the cent.',
    answer: 120, check: () => 4800 / (140 - 100), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(4800 / 140 * 100) / 100, say: 'That spreads the cost over every new patient, including the 100 who would have come anyway. The campaign won 40.' }, { value: 48, say: 'Divide by the extra patients (140 − 100), not by the usual 100.' }],
    solution: '$4,800 ÷ (140 − 100) = $120.00 per extra patient, against $34.29 blended. A patient worth less than $120 in lifetime margin would not justify the campaign, however cheap the blended figure looks.',
  },
  {
    id: 'm06-m4-6', lesson: 'acquisition-cost-and-payback', type: 'formula', kind: 'applied',
    prompt: 'A fictional online craft shop compares three acquisition channels. For each it knows the margin a customer brings each month, the share of customers who stay each month and the acquisition cost; H1 holds the monthly discount rate. In E2, calculate the value-to-cost ratio for search (lifetime value of a new customer, first month’s margin now, divided by CAC), so that the formula fills down to the other channels.',
    sheet: { cells: { ...chCells }, vary: { H1: [0.005, 0.015, 0.02] } },
    cell: 'E2', fill: 'E2:E4', answer: '=B2*(1+$H$1)/(1+$H$1-C2)/D2', alt: ['=(B2*(1+$H$1)/(1+$H$1-C2))/D2'],
    view: 'A1:H4', formats: { B: '$#,##0.00', C: '0%', D: '$#,##0.00', E: '0.00', H1: '0.0%' }, widths: { A: 13, B: 18, C: 17, D: 9, E: 12, G: 21 },
    wrong: [
      { formula: '=B2*(1+H1)/(1+H1-C2)/D2', say: 'Lock the discount rate ($H$1) so it stays put as the formula fills down.' },
      { formula: '=B2*C2/(1+$H$1-C2)/D2', say: 'That uses the residual value, which leaves out the first month’s margin. A newly won customer pays that month too.' },
      { formula: '=B2/(1-C2)/D2', say: 'Discount the margins: use (1 + d) ÷ (1 + d − r).' },
    ],
    solution: `<x>=B2*(1+$H$1)/(1+$H$1-C2)/D2</x>: search ${fx(chRatio(9, 0.9, 35))}, marketplace ${fx(chRatio(7, 0.82, 18))}, influencers ${fx(chRatio(11, 0.94, 140))}. The influencers’ customers stay longest and bring most each month, but cost so much to win that their ratio is the lowest.`,
  },
  {
    id: 'm06-m4-7', lesson: 'acquisition-cost-and-payback', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery-café chain with little cash in hand compares two ways to win catering clients. Channel A: value-to-cost ratio 4.0, payback 14 months. Channel B: ratio 2.2, payback 3 months. Which assessment is soundest?',
    options: [
      'A has the higher ratio, so it is always the better use of money, whatever the chain’s cash position.',
      'A creates more value per dollar but ties cash up for over a year; while cash is short, B may be the safer place to start.',
      'B is probably the better choice, because a payback of 3 months suggests its clients are worth more than A’s.',
      'Neither should be used, because B’s ratio is below the 3:1 rule that every business must meet.',
    ],
    answer: 1,
    feedback: {
      0: 'The ratio says whether customers are worth winning; it ignores how long the cash is tied up, which matters to a business short of cash.',
      2: 'Quick payback says nothing about what comes after: A’s clients are worth more per dollar.',
      3: 'The 3:1 figure is a guideline from software businesses, not a rule; a ratio of 2.2 still returns more than the cost.',
    },
    solution: 'Read payback and the ratio together. A is more valuable in the long run; B recovers its cost quickly and can fund further acquisition. A cash-constrained business may sensibly start with B and move to A as cash allows.',
  },
  {
    id: 'm06-m4-8', lesson: 'loyalty-and-retention-strategy', type: 'num', kind: 'numerical',
    prompt: 'A fictional pet shop texts a voucher to a random 600 lapsed customers and holds out 600. 90 of those texted and 66 of the holdout buy within a month. Calculate the two-proportion z statistic, using the pooled proportion. Give two decimal places.',
    answer: Math.round(PET.z * 100) / 100, check: () => { const p = 156 / 1200; return (0.15 - 0.11) / Math.sqrt(p * (1 - p) * (2 / 600)); }, unit: '', places: 2, tol: 0.006,
    wrong: [{ value: Math.round(0.04 / Math.sqrt(0.13 * 0.87 / 600) * 100) / 100, say: 'The standard error needs both group sizes: √(p(1 − p)(1/600 + 1/600)).' }, { value: Math.round(0.04 / Math.sqrt(0.13 * 0.87) * 100) / 100, say: 'Divide the variance by the group sizes before taking the square root.' }],
    solution: `Rates 15.0% and 11.0%; pooled p = 156 ÷ 1,200 = 0.13; SE = √(0.13 × 0.87 × (1/600 + 1/600)) = ${fx(PET.sePool, 4)}; z = 0.04 ÷ ${fx(PET.sePool, 4)} = ${fx(PET.z, 2)}, p = ${fx(PET.pValue, 3)}. The 95% interval for the difference is ${fx(PET.low * 100, 1)} to ${fx(PET.high * 100, 1)} points.`,
  },
  {
    id: 'm06-m4-9', lesson: 'loyalty-and-retention-strategy', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these statements is supported by the studies of loyalty programmes discussed in the module?',
    options: [
      'A café’s reward card raised its yearly coffee sales by about a fifth compared with cafés without one.',
      'A large loyalty programme produced only weak and inconsistent excess loyalty among the brands taking part.',
      'Small brands’ buyers are usually more loyal than large brands’, which is why small brands gain most from programmes.',
      'Retaining 5% more customers raises any company’s profits by about 95%, as Reichheld and Sasser proved.',
    ],
    answer: 1,
    feedback: {
      0: 'The 20% in Kivetz, Urminsky and Zheng (2006) is the shortening of the time between purchases as members neared a reward, not a comparison of yearly sales with other cafés.',
      2: 'Double jeopardy says the opposite: small brands have fewer buyers, who also tend to buy them less often.',
      3: 'The article concerned service companies; the size of any gain depends on margins, retention and the cost of keeping customers.',
    },
    solution: 'Sharp and Sharp (1997) found weak excess loyalty overall, with two of six brands deviating substantially, also among non-members. The other statements misstate what the studies found.',
  },
  {
    id: 'm06-m4-10', lesson: 'loyalty-and-retention-strategy', type: 'mc', kind: 'applied',
    prompt: 'A fictional cinema’s randomised win-back test recorded how long each customer had been away. Away 2–4 months: 22% of those offered came back against 13% of the holdout. Away 8–12 months: 6% against 5%. Next month it can afford to contact only one group. Which should it contact?',
    options: [
      'Those away 8–12 months, because they are the most at risk and need the offer most.',
      'Those away 8–12 months, because the offer only matters for customers who would not come back on their own without it.',
      'Those away 2–4 months, because the offer changed their behaviour most: 9 extra returns in every hundred against 1.',
      'Either group, because both showed a positive difference from the holdout.',
    ],
    answer: 2,
    feedback: {
      0: 'Being most at risk is not the same as responding to the offer. The test shows the offer barely changed the long-lapsed.',
      1: 'Plenty of the recently lapsed wouldn’t have come back either (87% of the holdout didn’t); the offer moved 9 points of them, against 1 point of the long-lapsed.',
      3: 'A difference of 1 point on a few hundred customers is easily chance, and the costs fall on every redeemer.',
    },
    solution: 'Target by uplift (the difference the offer makes), not by risk. The recently lapsed responded far more: about 9 extra returns per hundred contacted, against 1.',
  },
  {
    id: 'm06-m4-11', lesson: 'loyalty-and-retention-strategy', type: 'num', kind: 'numerical',
    prompt: 'A fictional bookshop chain wants a test able to detect a rise in a win-back offer’s response from 10% to 13%, with 80% power at the 5% level, two-sided. Using z = 1.96 and 0.84, how many customers does each group need? Round up.',
    answer: Math.ceil((1.96 + 0.84) ** 2 * (0.1 * 0.9 + 0.13 * 0.87) / 0.03 ** 2), check: () => Math.ceil(7.84 * (0.09 + 0.1131) / 0.0009), unit: 'customers', places: 0, tol: 1,
    wrong: [{ value: Math.ceil((1.96 + 0.84) ** 2 * (0.1 * 0.9 + 0.13 * 0.87) / 0.03), say: 'Square the difference in the denominator: 0.03² = 0.0009.' }],
    solution: `(2.80)² × (0.10 × 0.90 + 0.13 × 0.87) ÷ 0.03² = 7.84 × 0.2031 ÷ 0.0009 = ${Math.ceil(7.84 * 0.2031 / 0.0009)} customers a group, about 3,540 in all: small uplifts need big tests.`,
  },
  {
    id: 'm06-m4-12', lesson: 'acquisition-cost-and-payback', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about payback that are correct.',
    options: [
      'Simple payback (CAC ÷ margin per period) is shorter than or equal to the payback with retention and discounting.',
      'If the acquisition cost exceeds the lifetime value of a new customer, the customer never pays back on average.',
      'A cohort payback curve can pass the acquisition cost even though many individual customers in it never do.',
      'Two channels with equal payback periods create equal value per dollar spent.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Payback ignores everything after it; customers who keep paying for years after the payback month are worth far more than those who leave soon after.',
    },
    solution: 'Retention and discounting can only slow the build-up of margin, so the simple figure is the optimistic bound; cumulative expected margin approaches the lifetime value and never exceeds it; a cohort average hides the spread among its customers. Equal payback says nothing about value after payback.',
  },
];
