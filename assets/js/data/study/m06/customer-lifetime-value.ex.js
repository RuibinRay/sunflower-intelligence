// customer-lifetime-value.ex.js — M06 · Customer lifetime value: widgets, practice and the knowledge check (answer keys
// live here). Member data from case.js (the first 24 members who joined in March 2027, as of 31 December 2027); Fader &
// Hardie's (2007) published survival for the sBG widget. Morrowfield Lawn Care, Callowmere Tutors and every other business
// named are fictional. The 67% café margin is F03's (cost of goods 31%, card fees 2% of café sales), checked in the
// lesson file. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute in `check`.
import { members, VISIT_LIST, joinMap } from './case.js?v=27';
import * as CU from '../../../core/customer.js?v=27';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MR = 0.67;

// ---------------------------------------------------------------- Fader & Hardie Regular customers, years 0–7
const REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1].map((p) => Math.round(p * 10));
const SB = CU.sbgFit([{ alive: REG }]);
let rn = 0, chn = 0; for (let t = 1; t < REG.length; t++) { rn += REG[t]; chn += REG[t - 1]; }
const R_CONST = Math.round(rn / chn * 100) / 100;

// ---------------------------------------------------------------- March 2027 joiners: spend per joiner by month since joining
const CT = CU.cohortTable(joinMap(), VISIT_LIST);
const MAR = CT.revenue[0].map((v) => v / CT.cohorts[0].size);
function memberValue(mPct, q, dYear) {
  const dM = Math.round(((1 + dYear / 100) ** (1 / 12) - 1) * 10000) / 10000, m = mPct / 100;   // rounded to 0.01%, as the lesson rounds 0.797% to 0.8%
  const months = Array.from({ length: 36 }, (_, k) => (k < MAR.length ? MAR[k] : MAR[9] * q ** (k - 9)));
  let hist = 0, tail = 0; const cum = []; let acc = 0;
  for (let k = 0; k < 2000; k++) { const s = k < MAR.length ? MAR[k] : MAR[9] * q ** (k - 9), v = s * m / (1 + dM) ** k; if (k < MAR.length) hist += v; else tail += v; if (k < 36) { acc += v; cum.push(acc); } }
  return { hist, tail, total: hist + tail, cum, months };
}

// ---------------------------------------------------------------- worksheet: the first 24 March joiners
const MW = members().filter((c) => c.joinedIso < '2027-04-01').slice(0, 24);
const N = MW.length, last = N + 1;
const memberCells = { A1: 'Member', B1: 'Café', C1: 'Notifications', D1: 'Spend to 31 Dec ($)', E1: 'Margin ($)', G1: 'Margin rate', H1: MR,
  ...col('A', 2, MW.map((c) => c.id)), ...col('B', 2, MW.map((c) => c.cafe)), ...col('C', 2, MW.map((c) => c.notifications)), ...col('D', 2, MW.map((c) => c.monetary)) };
const marginCells = col('E', 2, MW.map((_, i) => `=D${i + 2}*$H$1`));
const avgIf = (f) => { const a = MW.filter(f); return a.reduce((s, c) => s + c.monetary * MR, 0) / a.length; };
const wH = avgIf((c) => c.cafe === 'Harbourside'), wM = avgIf((c) => c.cafe === 'Millbrook');
const wOn = avgIf((c) => c.notifications === 1), wOff = avgIf((c) => c.notifications === 0);
const nH = MW.filter((c) => c.cafe === 'Harbourside').length;

// ---------------------------------------------------------------- fictional contracts
const ML = { m: 85, r: 0.68, d: 0.09 };                       // Morrowfield Lawn Care (fictional), per year
const mlA = ML.m * (1 + ML.d) / (1 + ML.d - ML.r), mlC = ML.m * ML.r / (1 + ML.d - ML.r);
const ml3 = ML.m * (1 + ML.r / (1 + ML.d) + (ML.r / (1 + ML.d)) ** 2);
const OT = { m: 45, r: 0.96, d: 0.008 };                      // Callowmere Tutors (fictional), per month
const otA = OT.m * (1 + OT.d) / (1 + OT.d - OT.r);
const HE = { a: 0.668, b: 3.806 };
const ret8 = (HE.b + 7) / (HE.a + HE.b + 7);
const tailNoDisc = 2.0 * 0.85 / (1 - 0.85) * MR;
const horizonSheet = { A1: 'Margin per year ($)', B1: 64, A2: 'Retention per year', B2: 0.72, A3: 'Discount rate per year', B3: 0.1, A4: 'Horizon (years)', B4: 4, A6: 'Value over the horizon ($)' };
const hzAns = 64 * 1.1 / (1.1 - 0.72) * (1 - (0.72 / 1.1) ** 4);

export const widgets = {
  'clv-regular': {
    type: 'clv',
    title: 'A Regular customer’s value: one retention rate against the sBG',
    m: 100, r: R_CONST, d: 0.1, cac: 150,
    ranges: { m: [20, 300, 5], r: [0.5, 0.97, 0.01], d: [0, 0.2, 0.005], cac: [0, 400, 5] },
    timing: 'start', horizon: 20, unit: 'year',
    sbg: { alpha: SB.alpha, beta: SB.beta },
    note: `Survival from Fader and Hardie (2007), years 0–7 of 1,000 Regular customers. Constant retention fitted to the same years is ${fx(rn / chn * 100, 1)}%; the slider starts at ${fx(R_CONST * 100, 0)}%, the nearest step. The $100 margin and the $150 acquisition cost are fictional.`,
  },
  'clv-members': {
    type: 'formula',
    title: 'What a new café member is worth',
    intro: 'Ten observed months of the March 2027 joiners’ spend per joiner, then a projection that keeps falling by the decay factor each month.',
    inputs: [
      { id: 'm', label: 'Margin on spend', min: 40, max: 80, step: 1, value: 67, fmt: 'pct' },
      { id: 'q', label: 'Monthly decay factor after month 9', min: 0.7, max: 0.95, step: 0.01, value: 0.85, fmt: 'num' },
      { id: 'd', label: 'Discount rate a year', min: 0, max: 20, step: 0.5, value: 10, fmt: 'pct' },
    ],
    compute: (v) => {
      const R = memberValue(v.m, v.q, v.d);
      return {
        headline: { label: 'Value of a new member (margin, discounted)', value: `$${fx(R.total)}` },
        rows: [['First ten months (observed)', `$${fx(R.hist)}`], ['After month 9 (projected)', `$${fx(R.tail)}`], ['Share of the value that is projected', `${fx(R.tail / R.total * 100, 1)}%`], ['Discount rate a month (rounded to 0.01%)', `${fx(Math.round(((1 + v.d / 100) ** (1 / 12) - 1) * 10000) / 100, 2)}%`]],
        note: `With a decay of ${fx(v.q, 2)} the projected months add ${fx(R.tail / R.hist * 100, 0)}% to what the first ten months brought. The observed months carry most of the value, so the answer is more sensitive to the margin than to the projection.`,
        chart: { kind: 'line', x: { label: 'Months since joining', values: Array.from({ length: 36 }, (_, k) => k) }, series: [{ name: 'Cumulative value ($)', values: R.cum }], y: { label: 'Cumulative margin per member ($)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'm06-clv-g1', type: 'steps', kind: 'numerical',
    prompt: 'Morrowfield Lawn Care (fictional) sells yearly garden-care contracts. The worksheet holds the margin per year (B1), the share of customers who renew each year (B2) and the discount rate (B3).',
    solution: `B5: <x>=B1*(1+B3)/(1+B3-B2)</x> = $${fx(mlA)} for a customer about to sign, first margin now. B6: <x>=B1*B2/(1+B3-B2)</x> = $${fx(mlC)} for a customer whose margin for this year has been paid, which is B5 − B1. The first is the most a new contract is worth; the second is what losing an existing customer costs.`,
    steps: [
      {
        id: 'm06-clv-g1-s1', type: 'formula',
        prompt: 'In B5, calculate the lifetime value of a customer who signs today, with the first year’s margin received now and each renewal at the start of its year.',
        sheet: { cells: { A1: 'Margin per year ($)', B1: ML.m, A2: 'Retention per year', B2: ML.r, A3: 'Discount rate per year', B3: ML.d, A5: 'New customer ($)', A6: 'Existing customer ($)' }, vary: { B2: [0.6, 0.72, 0.8], B3: [0.06, 0.1, 0.12] } },
        cell: 'B5', answer: '=B1*(1+B3)/(1+B3-B2)', alt: ['=B1/(1-B2/(1+B3))'],
        view: 'A1:B6', formats: { B1: '$#,##0.00', B2: '0.00', B3: '0.0%', B5: '$#,##0.00', B6: '$#,##0.00' }, widths: { A: 24, B: 12 },
        wrong: [
          { formula: '=B1/(1+B3-B2)', say: 'That puts the first margin at the end of the first year (M01’s timing). Here the first margin arrives now, so multiply by (1 + d).' },
          { formula: '=B1*B2/(1+B3-B2)', say: 'That is the residual value: it leaves out the margin received now. A customer who signs today pays this year’s margin too.' },
          { formula: '=B1/(1-B2)', say: 'That ignores discounting: it is the margin times the expected lifetime. Divide by 1 + d − r and multiply by 1 + d.' },
        ],
        hints: ['The margins form a geometric series m, m r ÷ (1 + d), m r² ÷ (1 + d)², …', 'Its sum is m(1 + d) ÷ (1 + d − r).'],
      },
      {
        id: 'm06-clv-g1-s2', type: 'formula',
        prompt: 'In B6, calculate the residual value of an existing customer whose margin for this year has already been received.',
        sheet: { cells: { A1: 'Margin per year ($)', B1: ML.m, A2: 'Retention per year', B2: ML.r, A3: 'Discount rate per year', B3: ML.d, A5: 'New customer ($)', B5: '=B1*(1+B3)/(1+B3-B2)', A6: 'Existing customer ($)' }, vary: { B2: [0.6, 0.72, 0.8], B3: [0.06, 0.1, 0.12] } },
        cell: 'B6', answer: '=B1*B2/(1+B3-B2)', alt: ['=B5-B1'],
        view: 'A1:B6', formats: { B1: '$#,##0.00', B2: '0.00', B3: '0.0%', B5: '$#,##0.00', B6: '$#,##0.00' }, widths: { A: 24, B: 12 },
        wrong: [
          { formula: '=B1*(1+B3)/(1+B3-B2)', say: 'That counts this year’s margin, which the existing customer has already paid. Only the margins still to come count.' },
          { formula: '=B1*B2/(1-B2)', say: 'Discount the future margins: the denominator is 1 + d − r.' },
        ],
        hints: ['The first margin still to come arrives in a year, and only if the customer renews: m r ÷ (1 + d).', 'Sum: m r ÷ (1 + d − r), or the new-customer value less this year’s margin.'],
      },
      {
        id: 'm06-clv-g1-s3', type: 'mc',
        prompt: 'Morrowfield is deciding the most it should pay a referral partner for each new customer introduced. Which value is the ceiling?',
        options: [
          'The new-customer value in B5: a referred customer brings this year’s margin and every renewal.',
          'The existing-customer value in B6, because it is the more cautious figure and a partner should never be paid the full value.',
          'The margin in B1, because only the first year’s margin is certain.',
          'B5 minus B6, the margin received now, because that is the only money the referral itself causes.',
        ],
        answer: 0,
        hints: ['What does winning one extra customer add, from the moment they sign?'],
        feedback: {
          1: 'Being cautious is a reason to pay less than the ceiling, not a reason to value a new customer without their first margin. Fader and Hardie (2012) criticise exactly this use of the residual formula.',
          2: 'Renewals are uncertain, but their expected value is real; the lifetime value already weights them by the chance of renewing.',
          3: 'The referral wins the whole relationship, not only its first year.',
        },
      },
    ],
  },
  {
    id: 'm06-clv-g2', type: 'num', kind: 'numerical',
    prompt: `Morrowfield’s managers will count only the first three years of a new contract (margin $${ML.m} a year, received at the start of each year, the first now; ${ML.r * 100}% renew; 9% discount rate). What is a new customer worth over that horizon? Give dollars to the cent.`,
    answer: Math.round(ml3 * 100) / 100, check: () => CU.clvConstant({ m: 85, r: 0.68, d: 0.09, horizon: 3 }).value, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(85 * 3 * 100) / 100, say: 'That counts three full margins. Each later year is weighted by the chance of renewing and discounted.' }, { value: Math.round(85 * (0.68 / 1.09 + (0.68 / 1.09) ** 2 + (0.68 / 1.09) ** 3) * 100) / 100, say: 'That starts the first margin a year from now. Here it is received at signing, undiscounted.' }],
    hints: ['Three margins: now, in a year if renewed, in two years if renewed twice.', `85 × (1 + 0.68 ÷ 1.09 + (0.68 ÷ 1.09)²).`],
    solution: `85 + 85 × 0.68 ÷ 1.09 + 85 × 0.68² ÷ 1.09² = 85 + ${fx(85 * 0.68 / 1.09)} + ${fx(85 * (0.68 / 1.09) ** 2)} = $${fx(ml3)}. The infinite-horizon value is $${fx(mlA)}, so three years keep ${fx(ml3 / mlA * 100, 0)}% of it.`,
  },
  {
    id: 'm06-clv-g3', type: 'steps', kind: 'applied',
    prompt: `The worksheet lists the first ${N} members who joined the cafés in March 2027, with what each spent with the app to 31 December 2027. H1 holds the cafés’ margin rate.`,
    solution: `E2: <x>=D2*$H$1</x>, filled down. Then <x>=AVERAGEIFS(E2:E${last},B2:B${last},"Harbourside")</x> = $${fx(wH)} for the ${nH} Harbourside members, against $${fx(wM)} at Millbrook. These are historical values over ten months for a small sample, not lifetime values.`,
    steps: [
      {
        id: 'm06-clv-g3-s1', type: 'formula',
        prompt: 'In E2, calculate the first member’s margin, so that the formula fills down to every member.',
        sheet: { cells: { ...memberCells } },
        cell: 'E2', fill: `E2:E${last}`, answer: '=D2*$H$1', alt: ['=$H$1*D2'],
        view: `A1:H${last}`, maxHeight: '20rem', formats: { D: '$#,##0.00', E: '$#,##0.00', H1: '0%' }, widths: { A: 9, B: 12, C: 13, D: 17, E: 11, G: 12 },
        wrong: [
          { formula: '=D2*H1', say: 'Lock the margin rate with dollar signs ($H$1), or it moves down the column as the formula fills.' },
          { formula: '=D2*(1-$H$1)', say: 'H1 is the margin rate itself, not the cost share. Margin = spend × margin rate.' },
        ],
        hints: ['Margin = spend × margin rate.', '<x>=D2*$H$1</x>'],
      },
      {
        id: 'm06-clv-g3-s2', type: 'formula',
        prompt: 'In H3, calculate the average margin per member for the members who joined at Harbourside.',
        sheet: { cells: { ...memberCells, ...marginCells, G3: 'Harbourside' } },
        cell: 'H3', answer: `=AVERAGEIFS(E2:E${last},B2:B${last},"Harbourside")`, alt: [`=AVERAGEIFS(E2:E${last},B2:B${last},G3)`, `=SUMIFS(E2:E${last},B2:B${last},"Harbourside")/COUNTIFS(B2:B${last},"Harbourside")`],
        view: `A1:H${last}`, maxHeight: '20rem', formats: { D: '$#,##0.00', E: '$#,##0.00', H1: '0%', H3: '$#,##0.00' }, widths: { A: 9, B: 12, C: 13, D: 17, E: 11, G: 12 },
        wrong: [
          { formula: `=AVERAGE(E2:E${last})`, say: 'That averages every member. Add the condition that the café is Harbourside.' },
          { formula: `=AVERAGEIFS(D2:D${last},B2:B${last},"Harbourside")`, say: 'That averages spend. Value is built from margin: average column E.' },
        ],
        hints: ['AVERAGEIFS(average_range, criteria_range, criteria).', `<x>=AVERAGEIFS(E2:E${last},B2:B${last},"Harbourside")</x>`],
      },
    ],
  },
  {
    id: 'm06-clv-g4', type: 'mc', kind: 'conceptual',
    prompt: 'In Fader and Hardie’s Regular customers, 63.1% renewed after the first year but 92.0% of those remaining renewed after the seventh. What does the shifted-beta-geometric model say causes the rise?',
    options: [
      'Customers differ in fixed churn probabilities; the likely leavers go first, leaving mostly low-churn customers.',
      'Each customer becomes more loyal the longer they stay, so everyone’s churn probability falls with tenure.',
      'Later years are measured on fewer customers, so their retention rates are inflated by sampling error.',
      'The business improved its service over the seven years, which lifted retention for every cohort.',
    ],
    answer: 0,
    hints: ['In the sBG, does any one customer’s churn probability change over time?'],
    feedback: {
      1: 'The sBG assumes each customer’s churn probability is fixed. The cohort’s rate rises without anyone changing, because of who is left.',
      2: 'Fewer customers make later rates noisier, not systematically higher; the rise is steady across the years.',
      3: 'Possible in real data, but these figures are one cohort, and the model reproduces the rise with no change in service at all.',
    },
    solution: 'The retention rate in period t is (β + t − 1) ÷ (α + β + t − 1), which rises with t because high-churn customers leave first. Fader and Hardie (2007) call it a sorting effect in a heterogeneous population.',
  },
];

export const independent = [
  {
    id: 'm06-clv-i1', type: 'num', kind: 'numerical',
    prompt: 'A business discounts at 12% a year and wants to value monthly margins. What monthly discount rate is equivalent? Give a percentage to three decimal places.',
    answer: Math.round(((1.12 ** (1 / 12)) - 1) * 100000) / 1000, check: () => (Math.pow(1.12, 1 / 12) - 1) * 100, unit: '%', places: 3, tol: 0.0006,
    wrong: [{ value: 1, say: '12% ÷ 12 ignores compounding: twelve months at 1% compound to 12.68%. Use (1.12)^(1/12) − 1.' }],
    solution: `(1.12)^(1/12) − 1 = ${fx((1.12 ** (1 / 12) - 1) * 100, 3)}% a month. Twelve months at that rate compound to exactly 12%.`,
  },
  {
    id: 'm06-clv-i2', type: 'formula', kind: 'applied',
    prompt: `Column E holds each of the first ${N} March joiners’ margin to 31 December and column C whether they turned notifications on (1) or not (0). In H4, calculate how much more margin, on average, members with notifications on brought in than members with them off.`,
    sheet: { cells: { ...memberCells, ...marginCells, G4: 'On minus off' } },
    cell: 'H4', answer: `=AVERAGEIFS(E2:E${last},C2:C${last},1)-AVERAGEIFS(E2:E${last},C2:C${last},0)`,
    view: `A1:H${last}`, maxHeight: '20rem', formats: { D: '$#,##0.00', E: '$#,##0.00', H1: '0%', H4: '$#,##0.00' }, widths: { A: 9, B: 12, C: 13, D: 17, E: 11, G: 12 },
    require: ['AVERAGEIFS'],
    wrong: [
      { formula: `=SUMIFS(E2:E${last},C2:C${last},1)-SUMIFS(E2:E${last},C2:C${last},0)`, say: 'That compares totals, which depend on how many members are in each group. Compare averages.' },
      { formula: `=AVERAGEIFS(E2:E${last},C2:C${last},0)-AVERAGEIFS(E2:E${last},C2:C${last},1)`, say: 'The question asks for on minus off.' },
    ],
    solution: `<x>=AVERAGEIFS(E2:E${last},C2:C${last},1)-AVERAGEIFS(E2:E${last},C2:C${last},0)</x> = $${fx(wOn)} − $${fx(wOff)} = $${fx(wOn - wOff)} in this sample of ${N}. With so few members the difference is noisy, and in any case members chose notifications: it is an association, not what switching them on would add.`,
  },
  {
    id: 'm06-clv-i3', type: 'mc', kind: 'conceptual',
    prompt: 'A restaurant owner finds that 64% of the diners who ate at her restaurant last year came back at least once, and values a diner as margin × (1 + d) ÷ (1 + d − 0.64). What is wrong?',
    options: [
      'Diners don’t announce they have stopped coming, so 64% is a repeat-visit share, not a retention rate.',
      'The formula should use 1 − 0.64 = 0.36, the churn rate, in place of r, since r stands for those who leave.',
      'Nothing, provided she uses margin per visit rather than revenue per visit.',
      'She should use timing B instead, because diners pay after they eat, so margins arrive at the end of each period, not the start.',
    ],
    answer: 0,
    feedback: {
      1: 'Swapping in churn would make the formula meaningless; the problem is the kind of setting, not which rate she typed.',
      2: 'Margin is right, but the formula still needs a per-period probability of remaining a customer, which a noncontractual business never observes.',
      3: 'Timing matters, but it isn’t the main error: the formula assumes a contractual setting.',
    },
    solution: 'The constant-retention formulas assume customers are observed to stay or leave each period. In a noncontractual setting use a cohort’s spend over time (as the cafés do) or a model made for the setting; Fader and Hardie (2012) make the same warning.',
  },
  {
    id: 'm06-clv-i4', type: 'num', kind: 'numerical',
    prompt: 'For Fader and Hardie’s High End customers the sBG estimates are α = 0.668 and β = 3.806. What retention rate does the model give for the eighth year, (β + t − 1) ÷ (α + β + t − 1) with t = 8? Give a percentage to one decimal place.',
    answer: Math.round(ret8 * 1000) / 10, check: () => CU.sbgRetention(0.668, 3.806, 8) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: Math.round((3.806 + 8) / (0.668 + 3.806 + 8) * 1000) / 10, say: 'With t = 8, t − 1 = 7: add 7, not 8.' }, { value: Math.round(3.806 / (0.668 + 3.806) * 1000) / 10, say: 'That is the first year’s retention. The eighth year’s adds t − 1 = 7 to both the numerator and the denominator.' }],
    solution: `(3.806 + 7) ÷ (0.668 + 3.806 + 7) = 10.806 ÷ 11.474 = ${fx(ret8 * 100, 1)}%, against ${fx(3.806 / 4.474 * 100, 1)}% in the first year. The paper’s table, beyond the seven years the model was fitted to, shows 95.3% of those left renewing in year 8 (46.8 ÷ 49.1): close to the model.`,
  },
  {
    id: 'm06-clv-i5', type: 'multi', kind: 'applied',
    prompt: 'Ana estimates that a new café member is worth about $32 of margin. Select all the uses this figure can properly support.',
    options: [
      'Setting a ceiling on what Lantern should spend, per member won, on a campaign to sign up new members.',
      'Comparing the value of different kinds of new members, with the same method, to see where acquisition spend is best directed.',
      'Telling a particular member at the till that they are worth $32 to the café.',
      'Concluding that a member who has spent only $10 so far has been a loss to the business.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'CLV is an average forecast for a kind of customer, not a figure about any one person.',
      3: 'Historical and predictive value differ: a member with $10 of spend so far may still bring more, and $10 of spend is still positive margin.',
    },
    solution: 'Lifetime value is a planning number: a ceiling for acquisition spend and a basis for comparing groups. It is not an individual’s worth, and it isn’t a judgement on what any member has spent so far.',
  },
  {
    id: 'm06-clv-i6', type: 'num', kind: 'numerical',
    prompt: 'A cohort of café members spent $2.00 per joiner in its latest month. Suppose spend per joiner keeps falling by a factor of 0.85 each month and ignore discounting. With a 67% margin, how much more margin per joiner will the cohort bring in after the latest month? Give dollars to the cent.',
    answer: Math.round(tailNoDisc * 100) / 100, check: () => { let s = 0; for (let k = 1; k < 2000; k++) s += 2 * 0.85 ** k * 0.67; return s; }, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(2 / (1 - 0.85) * 0.67 * 100) / 100, say: 'That includes the latest month again. The months still to come start at 2.00 × 0.85.' }, { value: Math.round(2 * 0.85 / 0.15 * 100) / 100, say: 'That is spend, not margin: multiply by 0.67.' }],
    solution: `2.00 × (0.85 + 0.85² + …) = 2.00 × 0.85 ÷ 0.15 = $${fx(2 * 0.85 / 0.15)} of spend, × 0.67 = $${fx(tailNoDisc)} of margin. Discounting would lower it a little.`,
  },
];

export const check = [
  {
    id: 'm06-clv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A software firm wants to know how much margin it stands to lose if its existing customers, whose payments for this year are already in, all left. Which constant-retention value should it use?',
    options: [
      'The residual value, m r ÷ (1 + d − r): only the margins still to come are at risk.',
      'The full value with the first margin now, m(1 + d) ÷ (1 + d − r), because the customers are still active.',
      'The full value with margins at period ends, m ÷ (1 + d − r), because it lies between the other two.',
      'm ÷ (1 − r), the margin times the expected lifetime, because losing a customer loses their whole lifetime.',
    ],
    answer: 0,
    feedback: {
      1: 'This year’s margin has been received; counting it again overstates what is at risk.',
      2: 'Lying between two numbers is not a reason to choose a convention. Match the timeline to the question.',
      3: 'That ignores discounting and still counts this year’s margin.',
    },
    solution: 'Draw the timeline: the customers have paid for this year, so only next year’s margin (if they renew) and later ones are at stake: m r ÷ (1 + d − r).',
  },
  {
    id: 'm06-clv-k2', type: 'num', kind: 'numerical',
    prompt: 'Callowmere Tutors (fictional) earns a margin of $45 a month from each family on its monthly tutoring plan; 96% of families continue each month, and it discounts at 0.8% a month. What is a family that signs today worth, with the first month’s margin received now? Give dollars to the cent.',
    answer: Math.round(otA * 100) / 100, check: () => CU.clvConstant({ m: 45, r: 0.96, d: 0.008 }).value, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(45 / (1 - 0.96) * 100) / 100, say: 'That ignores discounting. Divide by 1 + d − r and multiply by 1 + d.' }, { value: Math.round(45 * 0.96 / 0.048 * 100) / 100, say: 'That is the residual value, without the first month’s margin.' }],
    solution: `45 × 1.008 ÷ (1.008 − 0.96) = 45.36 ÷ 0.048 = $${fx(otA)}. Without discounting it would be 45 ÷ 0.04 = $1,125.`,
  },
  {
    id: 'm06-clv-k3', type: 'formula', kind: 'numerical',
    prompt: 'In B6, calculate the value of a new customer counting only the first B4 years, with margins at the start of each year (the first now), constant retention B2 and discount rate B3.',
    sheet: { cells: { ...horizonSheet }, vary: { B2: [0.6, 0.66, 0.8], B3: [0.06, 0.08, 0.12], B4: [3, 5, 6] } },
    cell: 'B6', answer: '=B1*(1+B3)/(1+B3-B2)*(1-(B2/(1+B3))^B4)',
    alt: ['=B1*(1-(B2/(1+B3))^B4)/(1-B2/(1+B3))'],
    view: 'A1:B6', formats: { B1: '$#,##0.00', B2: '0.00', B3: '0.0%', B4: '0', B6: '$#,##0.00' }, widths: { A: 26, B: 12 },
    wrong: [
      { formula: '=B1*(1+B3)/(1+B3-B2)', say: 'That is the infinite-horizon value. Multiply by 1 − (r ÷ (1 + d))^H to stop after H years.' },
      { formula: '=B1*(1+B3)/(1+B3-B2)*(1-B2^B4)', say: 'The ratio that is raised to the power H is r ÷ (1 + d): retention and discounting together.' },
    ],
    solution: `<x>=B1*(1+B3)/(1+B3-B2)*(1-(B2/(1+B3))^B4)</x>. With $64, 72%, 10% and 4 years: $${fx(hzAns)}, against $${fx(64 * 1.1 / 0.38)} with no horizon.`,
  },
  {
    id: 'm06-clv-k4', type: 'mc', kind: 'applied',
    prompt: 'A broadband provider values every customer with one retention rate, the average across its whole base. It is deciding how much to spend on a programme for customers who have been with it for over five years. If customers differ in how likely they are to leave, what does the single rate do to that decision?',
    options: [
      'It understates long-standing customers’ value, since they are mostly the low-churn ones, so the programme looks less worth funding.',
      'It overstates what long-standing customers are worth, because the base-wide average retention rate is pulled up by the many loyal customers who stay.',
      'Nothing on average: the errors for new and old customers cancel out.',
      'It understates new customers’ value but gets long-standing customers right, since their churn has already settled.',
    ],
    answer: 0,
    feedback: {
      1: 'The average is pulled down by the many short-lived customers, so it is too low for the stayers.',
      2: 'The decision is about one group, so errors in other groups don’t cancel for it.',
      3: 'It is the long-standing customers whose value is understated most: the single rate forgets that they have already shown themselves to be stayers.',
    },
    solution: 'Under heterogeneity, survivors are the low-churn customers. A constant rate gives everyone the same future, so it understates established customers’ residual value most (for Fader and Hardie’s Regular customers after five renewals, $261 against $626, both counting the coming renewal undiscounted).',
  },
  {
    id: 'm06-clv-k5', type: 'mc', kind: 'applied',
    prompt: 'Over their first five months, Harbourside’s March–August joiners brought in about $25 of margin each and Millbrook’s about $20, although Millbrook members visited more often. Which conclusion does this support?',
    options: [
      'A typical Harbourside joiner has been worth more so far: larger tickets outweigh fewer visits.',
      'Moving members from Millbrook to Harbourside, for example with offers redeemable only there, would raise each one’s value by about $5.',
      'Millbrook members are more loyal, so their lifetime value must in the end be higher than Harbourside’s.',
      'Harbourside members are worth more because they visit more often than Millbrook members.',
    ],
    answer: 0,
    feedback: {
      1: 'The groups differ in who they are and where they live; the comparison describes them, it doesn’t predict what moving anyone would do.',
      2: 'More visits so far is not the same as more value: value multiplies visits by ticket size and margin.',
      3: 'Millbrook members visit more often, not less.',
    },
    solution: 'Value is visits × spend per visit × margin. Harbourside’s tickets are larger, so its members brought in more margin in their first five months despite fewer visits. It is a description of two groups, not the effect of an action.',
  },
  {
    id: 'm06-clv-k6', type: 'classify', kind: 'conceptual',
    prompt: 'For each statement about customer lifetime value, say whether it is true or false.',
    items: [
      'Under constant retention, a customer who has stayed ten years has the same residual value as one who joined last year.',
      'A lifetime value built from revenue instead of margin overstates what a customer is worth to the business.',
      'With retention of 75% and an 8% discount rate, counting only five years keeps less than half of a new customer’s value.',
      'With a positive discount rate, lifetime value with the first margin now is larger than with every margin at the end of its period, other things equal.',
    ],
    categories: ['True', 'False'],
    answer: [0, 0, 1, 0],
    feedback: {
      0: 'Constant retention has no memory: the expected future is the same whatever the tenure.',
      1: 'Revenue includes the costs of serving the customer, which the business doesn’t keep.',
      2: 'Quillmore’s five years keep 1 − (0.75 ÷ 1.08)^5, about 84%: distant years count for little.',
      3: 'Moving every margin one period earlier multiplies the value by 1 + d, which is above 1 when d is positive.',
    },
    solution: 'True, true, false (about 84%), true.',
  },
];
