// acquisition-cost-and-payback.ex.js — M06 · Acquisition cost and payback: widgets, practice and the knowledge check
// (answer keys live here). Member data from case.js (the first 24 members who joined in April 2027, with their spend in
// the join month and the two months after); the 2027 cohorts' margin per joiner for the campaign widget. Glenmarra
// Climbing Centre, Vantrell Language School and every other business named are fictional, as are
// Lantern's 2028 campaign figures. Formula items are marked by their results; num items recompute in `check`.
import { MEMBER_LIST, VISIT_LIST, joinMap } from './case.js?v=27';
import * as CU from '../../../core/customer.js?v=27';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MR = 0.67, D_M = 0.008;

// ---------------------------------------------------------------- the March 2027 cohort's cumulative margin per joiner
const CT = CU.cohortTable(joinMap(), VISIT_LIST);
let acc = 0;
const MARCUM = CT.revenue[0].map((v, k) => (acc += v / CT.cohorts[0].size * MR / (1 + D_M) ** k));

// ---------------------------------------------------------------- worksheet: the first 24 April joiners, first three months
const byId = new Map(MEMBER_LIST.map((m) => [m.id, m]));
const APR = MEMBER_LIST.filter((m) => m.joinedIso.startsWith('2027-04')).slice(0, 24);
const aprSet = new Set(APR.map((m) => m.id)), spend3 = new Map(APR.map((m) => [m.id, 0]));
for (const v of VISIT_LIST) if (aprSet.has(v.id) && CU.monthOf(v.day) - CU.monthOf(byId.get(v.id).joined) <= 2) spend3.set(v.id, spend3.get(v.id) + v.amount);
const N = APR.length, last = N + 1;
const s3 = APR.map((m) => Math.round(spend3.get(m.id) * 100) / 100);
const aprCells = { A1: 'Member', B1: 'Café', C1: 'Spend, first 3 months ($)', D1: 'Margin ($)', F1: 'Margin rate', G1: MR, F2: 'Acquisition cost ($)', G2: 10, F3: 'Share paid back',
  ...col('A', 2, APR.map((m) => m.id)), ...col('B', 2, APR.map((m) => m.cafe)), ...col('C', 2, s3), ...col('D', 2, s3.map((_, i) => `=C${i + 2}*$G$1`)) };
const shareBack = s3.filter((v) => v * MR >= 10).length / N, back10 = s3.filter((v) => v * MR >= 10).length, mean24 = s3.reduce((a, v) => a + v * MR, 0) / N;

// ---------------------------------------------------------------- fictional businesses
const VL = [['Search ads', 5600, 70], ['Partner universities', 2400, 40], ['Open days', 1800, 15], ['No identified channel', 0, 75]];   // Vantrell Language School
const vlSpend = VL.reduce((s, r) => s + r[1], 0), vlN = VL.reduce((s, r) => s + r[2], 0);
const vlCells = { A1: 'Channel', B1: 'Spend ($)', C1: 'New students', D1: 'CAC ($)', ...col('A', 2, VL.map((r) => r[0])), ...col('B', 2, VL.map((r) => r[1])), ...col('C', 2, VL.map((r) => r[2])), A6: 'All channels', D7: '' };
const PB_FIXED = ['A2:A11'];
const paybackCells = { A1: 'Month since joining', B1: 'Margin per joiner ($)', C1: 'Cumulative ($)', E1: 'Acquisition cost ($)', F1: 12, E2: 'Payback month',
  ...col('A', 2, MARCUM.map((_, k) => k)), ...col('B', 2, MARCUM.map((v, k) => (k ? v - MARCUM[k - 1] : v))) };   // unrounded, so the sums match the lesson
const pbB = paybackCells; const bVals = MARCUM.map((v, k) => (k ? v - MARCUM[k - 1] : v));
const cumB = []; bVals.reduce((s, v, k) => (cumB[k] = s + v), 0);
const cumCells = col('C', 2, bVals.map((_, k) => `=SUM($B$2:B${k + 2})`));
const pb12 = cumB.filter((v) => v < 12).length;
const k2cum = []; { let s = 0; for (let t = 0; t < 8; t++) { s += 50 * 0.9 ** t; k2cum.push(s); } }
const k2pb = CU.payback({ cac: 180, m: 50, r: 0.9, d: 0 });

export const widgets = {
  'cac-climbing': {
    type: 'clv',
    title: 'Paying back a Glenmarra member won through social ads',
    m: 28, r: 0.9, d: D_M, cac: 120,
    ranges: { m: [5, 60, 1], r: [0.6, 0.99, 0.01], d: [0, 0.02, 0.001], cac: [0, 300, 5] },
    timing: 'start', horizon: 36, unit: 'month',
    note: 'Glenmarra Climbing Centre and its figures are fictional. Margins arrive at the start of each month, the first on joining.',
  },
  'cac-campaign': {
    type: 'formula',
    title: 'Lantern’s spring campaign (fictional proposal)',
    intro: 'Costs, expected joiners and the baseline are the plan’s assumptions; the payback month comes from the March 2027 joiners’ cumulative margin per joiner.',
    inputs: [
      { id: 'ads', label: 'Flyers and ads', min: 0, max: 5000, step: 100, value: 1800, fmt: 'money' },
      { id: 'drink', label: 'Free drink cost per joiner', min: 0, max: 3, step: 0.05, value: 1.1, fmt: 'money' },
      { id: 'joiners', label: 'Joiners expected with the campaign', min: 800, max: 1500, step: 10, value: 1000, fmt: 'int' },
      { id: 'base', label: 'Joiners expected without it', min: 500, max: 1200, step: 5, value: 765, fmt: 'int' },
      { id: 'value', label: 'Value of an extra member', min: 10, max: 50, step: 0.5, value: 32, fmt: 'money' },
    ],
    compute: (v) => {
      const extra = v.joiners - v.base;
      if (extra <= 0) return { error: 'With no more joiners than would have come anyway, the campaign wins no extra members: its incremental cost per member is unbounded.' };
      const cost = v.ads + v.drink * v.joiners, blended = cost / v.joiners, inc = cost / extra, k = MARCUM.findIndex((x) => x >= inc);
      return {
        headline: { label: 'Incremental cost per extra member', value: `$${fx(inc)}` },
        rows: [['Campaign cost', `$${fx(cost)}`], ['Extra members', fx(extra, 0)], ['Blended cost per joiner', `$${fx(blended)}`], ['Value ÷ incremental cost', fx(v.value / inc)], ['Payback (March 2027 joiners’ curve)', k < 0 ? 'not within the ten months observed' : `month ${k} after joining`]],
        note: v.value / inc >= 1 ? `Each extra member is worth ${fx(v.value / inc)} times what winning them costs, on these assumptions.` : 'The extra members would cost more to win than they are worth.',
      };
    },
  },
};

export const guided = [
  {
    id: 'm06-cac-g1', type: 'steps', kind: 'numerical',
    prompt: 'Vantrell Language School (fictional) recorded how each new student for its autumn term heard of it, and what it spent on each channel.',
    solution: `D2: <x>=B2/C2</x>, filled to D4: $80.00, $60.00 and $120.00. Blended: <x>=SUM(B2:B5)/SUM(C2:C5)</x> = $${fx(vlSpend)} ÷ ${vlN} = $${fx(vlSpend / vlN)}. Paid: $${fx(vlSpend)} ÷ ${vlN - 75} = $${fx(vlSpend / (vlN - 75))}. To decide whether to expand open days, look at the open-day figure, and better still at what extra open days would add.`,
    steps: [
      {
        id: 'm06-cac-g1-s1', type: 'formula',
        prompt: 'In D2, calculate the acquisition cost per new student for search ads, so that the formula fills down to the open days in row 4.',
        sheet: { cells: { ...vlCells } },
        cell: 'D2', fill: 'D2:D4', answer: '=B2/C2',
        view: 'A1:D6', formats: { B: '$#,##0', D: '$#,##0.00' }, widths: { A: 22, B: 11, C: 13, D: 10 },
        wrong: [{ formula: '=C2/B2', say: 'That is students per dollar. CAC is spending ÷ students.' }, { formula: '=B2/$C$6', say: 'Each channel’s spending is divided by that channel’s students, not by a total.' }],
        hints: ['CAC = spending ÷ customers won.', '<x>=B2/C2</x>'],
      },
      {
        id: 'm06-cac-g1-s2', type: 'formula',
        prompt: 'In D6, calculate the blended acquisition cost over all four rows.',
        sheet: { cells: { ...vlCells, ...col('D', 2, ['=B2/C2', '=B3/C3', '=B4/C4']) } },
        cell: 'D6', answer: '=SUM(B2:B5)/SUM(C2:C5)',
        view: 'A1:D6', formats: { B: '$#,##0', D: '$#,##0.00' }, widths: { A: 22, B: 11, C: 13, D: 10 },
        wrong: [{ formula: '=AVERAGE(D2:D4)', say: 'An average of the channel CACs gives each channel equal weight, however many students it brought. Divide total spending by total students.' }, { formula: '=SUM(B2:B5)/SUM(C2:C4)', say: 'That is the paid CAC, which leaves out the 75 students with no identified channel. The blended figure divides by every new student.' }],
        hints: ['Total spending ÷ total new students.', '<x>=SUM(B2:B5)/SUM(C2:C5)</x>'],
      },
      {
        id: 'm06-cac-g1-s3', type: 'mc',
        prompt: 'The school’s director says: “Our blended CAC is under $60, so every channel is cheap.” What is wrong with that?',
        options: [
          'Unattributed students cost nothing and pull the blended figure down; open days cost $120 a student.',
          'Nothing: the blended figure is the right measure of what the school pays for a student.',
          'The blended figure should be calculated as the average of the three channel CACs, which is higher.',
          'Blended CAC can’t be compared with channel CACs because it includes partner universities.',
        ],
        answer: 0,
        hints: ['Which students cost nothing to win?'],
        feedback: {
          1: 'It describes the term on average, but it hides what each channel costs, and unattributed students lower it.',
          2: 'An unweighted average of channels is not a CAC at all.',
          3: 'Partner universities are a channel like the others; the issue is the 75 unattributed students.',
        },
      },
    ],
  },
  {
    id: 'm06-cac-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional window-cleaning round wins a new household for $90 and earns a margin of $24 a month from it. What is the simple payback period in months, ignoring churn and discounting? Give one decimal place.',
    answer: 3.8, check: () => CU.simplePayback(90, 24), unit: 'months', places: 1, tol: 0.05,
    wrong: [{ value: Math.round(24 / 90 * 10) / 10, say: 'Divide the cost by the monthly margin, not the other way round.' }],
    hints: ['Simple payback = CAC ÷ margin per period.', '90 ÷ 24.'],
    solution: '90 ÷ 24 = 3.75, about 3.8 months, so the fourth month’s margin completes it if the household stays. With households leaving, payback takes longer.',
  },
  {
    id: 'm06-cac-g3', type: 'steps', kind: 'applied',
    prompt: `The worksheet lists the first ${N} members who joined in April 2027 and what each spent in their join month and the two months after. G1 holds the margin rate and G2 an acquisition cost to test.`,
    solution: `D2 is filled with <x>=C2*$G$1</x>. G3: <x>=COUNTIF(D2:D${last},">="&G2)/COUNT(D2:D${last})</x>. With $10, ${fx(shareBack * 100, 1)}% of these members had covered it within three months. The cohort average can pass a CAC while many individual members don’t.`,
    steps: [
      {
        id: 'm06-cac-g3-s1', type: 'formula',
        prompt: 'In G3, calculate the share of these members whose margin in their first three months is at least the acquisition cost in G2.',
        sheet: { cells: { ...aprCells }, vary: { G2: [6, 8, 14] } },
        cell: 'G3', answer: `=COUNTIF(D2:D${last},">="&G2)/COUNT(D2:D${last})`,
        alt: [`=COUNTIF(D2:D${last},">="&G2)/${N}`],
        view: `A1:G${last}`, maxHeight: '20rem', formats: { C: '$#,##0.00', D: '$#,##0.00', G1: '0%', G2: '$#,##0.00', G3: '0.0%' }, widths: { A: 9, B: 12, C: 22, D: 11, F: 19 },
        require: ['COUNTIF'],
        wrong: [
          { formula: `=COUNTIF(C2:C${last},">="&G2)/COUNT(C2:C${last})`, say: 'That compares spend with the cost. Payback is about margin: use column D.' },
          { formula: `=COUNTIF(D2:D${last},">=10")/COUNT(D2:D${last})`, say: 'Refer to G2 (">="&G2) so the share updates when you test another cost.' },
          { formula: `=COUNTIF(D2:D${last},">="&G2)`, say: 'That is a count. Divide by the number of members for a share.' },
        ],
        hints: ['Count the members with D at least G2, then divide by how many members there are.', `<x>=COUNTIF(D2:D${last},">="&G2)/COUNT(D2:D${last})</x>`],
      },
      {
        id: 'm06-cac-g3-s2', type: 'mc',
        prompt: `These ${N} members brought in $${fx(mean24)} of margin each on average in their first three months, well above a $10 acquisition cost, yet ${N - back10} of them individually brought in less than $10. Why can both be true?`,
        options: [
          'An average is pulled up by a few big spenders, while many members spent much less than it.',
          'The average is of spend, while the comparison with $10 is of margin, which is only two-thirds as large.',
          'The average leaves out the members who never came back after joining, which raises it above most members.',
          'The average counts Harbourside members twice, once for each café they visited.',
        ],
        answer: 0,
        hints: ['What does a skewed distribution do to an average?'],
        feedback: {
          1: 'Both are margin: column D is spend × 0.67.',
          2: 'Every member is in the average; those who never came back pull it down, not up.',
          3: 'Each member is one row, whichever café they visited.',
        },
      },
    ],
  },
  {
    id: 'm06-cac-g4', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery gives a free loaf to anyone who signs up to its newsletter in May. 600 people sign up, against about 450 in a normal May. The loaves and the posters cost $1,200 in all. What is the cost per sign-up the offer actually won?',
    options: ['$8.00: $1,200 ÷ 150.', '$2.00: $1,200 ÷ 600 sign-ups.', '$2.67: $1,200 ÷ 450 usual sign-ups.', '$1.20: the cost of a loaf and a share of the posters.'],
    answer: 0,
    hints: ['How many sign-ups would there have been without the offer?'],
    feedback: {
      1: 'That is the blended figure. 450 of the 600 would have signed up anyway, and they got loaves too.',
      2: 'The usual sign-ups are the ones the offer didn’t win; divide by the extra ones.',
      3: 'Every cost of the offer counts, including loaves given to people who would have signed up anyway.',
    },
    solution: 'Incremental CAC = $1,200 ÷ (600 − 450) = $8.00. The blended $2.00 is four times too optimistic about what each extra sign-up costs.',
  },
];

export const independent = [
  {
    id: 'm06-cac-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional cinema runs a membership drive costing $3,600 (posters, a free ticket for each new member). It gains 520 new members over the drive, against 400 it would normally expect in the same weeks. What is the incremental acquisition cost per member? Give dollars to the cent.',
    answer: 30, check: () => 3600 / (520 - 400), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: Math.round(3600 / 520 * 100) / 100, say: 'That is the blended cost over all 520. Only 120 are members the drive won.' }, { value: 9, say: 'Divide by the extra members (520 − 400), not by the usual 400.' }],
    solution: '$3,600 ÷ (520 − 400) = $3,600 ÷ 120 = $30.00 per extra member, against $6.92 blended.',
  },
  {
    id: 'm06-cac-i2', type: 'formula', kind: 'applied',
    prompt: 'Column B holds the March 2027 café joiners’ discounted margin per joiner in each month since joining (month 0 is the join month). In C2, calculate the cumulative margin per joiner up to month 0, so that the formula fills down to month 9.',
    sheet: { cells: { ...pbB }, fixed: PB_FIXED },
    cell: 'C2', fill: 'C2:C11', answer: '=SUM($B$2:B2)',
    view: 'A1:F11', formats: { B: '$#,##0.00', C: '$#,##0.00', F1: '$#,##0.00' }, widths: { A: 18, B: 20, C: 14, E: 19 },
    wrong: [{ formula: '=SUM(B2:B2)', say: 'Anchor the start of the range ($B$2) so that it grows as the formula fills down.' }, { formula: '=SUM($B$2:$B$11)', say: 'That is the ten-month total in every row. The cumulative figure adds the months up to this row only.' }],
    solution: `<x>=SUM($B$2:B2)</x>, filled down: $${fx(cumB[0])} in month 0, $${fx(cumB[2])} by month 2 and $${fx(cumB[9])} by month 9. The month in which it first reaches a CAC is that cohort’s payback period.`,
  },
  {
    id: 'm06-cac-i3', type: 'formula', kind: 'numerical',
    prompt: 'Column C holds the March joiners’ cumulative margin per joiner by month since joining and F1 an acquisition cost. In F2, find the payback month: the first month since joining in which the cumulative margin reaches F1 (as a month number from column A, starting at 0).',
    sheet: { cells: { ...pbB, ...cumCells }, fixed: PB_FIXED, vary: { F1: [6, 15, 20] } },
    cell: 'F2', answer: '=COUNTIF(C2:C11,"<"&F1)',
    alt: ['=MATCH(TRUE,C2:C11>=F1,0)-1', '=INDEX(A2:A11,MATCH(TRUE,C2:C11>=F1,0))', '=MINIFS(A2:A11,C2:C11,">="&F1)'],
    view: 'A1:F11', formats: { B: '$#,##0.00', C: '$#,##0.00', F1: '$#,##0.00', F2: '0' }, widths: { A: 18, B: 20, C: 14, E: 19 },
    wrong: [{ formula: '=COUNTIF(C2:C11,"<"&F1)+1', say: 'That counts months from 1. The months in column A start at 0, the join month, so the number of months below the cost is already the payback month.' }, { formula: '=COUNTIF(C2:C11,">="&F1)', say: 'That counts the months at or above the cost. Count those below it: they come before the payback month.' }],
    solution: `The cumulative margin only rises, so the months below the cost all come before payback: <x>=COUNTIF(C2:C11,"<"&F1)</x>. With $12.00, ${pb12} months are below it, so payback is in month ${pb12}. <x>=MATCH(TRUE,C2:C11>=F1,0)-1</x> also works.`,
  },
  {
    id: 'm06-cac-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A start-up’s investor deck says its customers are worth 3.4 times what they cost to acquire, “above the 3:1 benchmark, so our acquisition spending is justified”. Which question matters most before accepting that?',
    options: [
      'How the lifetime value was estimated: which retention, margin and horizon, and from which customers.',
      'Whether the ratio was rounded to one decimal place or two.',
      'Whether the benchmark is 3:1 or 3.5:1 in the start-up’s industry, since the ratio must clear it exactly.',
      'Whether the acquisition cost includes the cost of serving customers after they join, such as support and hosting.',
    ],
    answer: 0,
    feedback: {
      1: 'Rounding is trivial next to the assumptions inside the ratio.',
      2: 'The 3:1 figure is a guideline David Skok gives for software businesses with high gross margins, using revenue-based lifetime value; clearing it by a hair proves nothing if the value estimate is weak.',
      3: 'Serving costs belong in the margin, not in CAC; including them in CAC would be a mistake, not a check.',
    },
    solution: 'A ratio is only as good as its parts. Lifetime value built on early, optimistic retention or on revenue can make almost any CAC look justified. Ask for the margin, retention evidence, horizon, timing, and whether CAC counts every acquisition cost and only new customers.',
  },
  {
    id: 'm06-cac-i5', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional garden centre is calculating the acquisition cost of its loyalty-card sign-up drive. Select all the costs that belong in it.',
    options: [
      'The printing of leaflets advertising the drive.',
      'The $5 voucher every new member receives on joining, at its cost to the centre.',
      'Staff time spent signing customers up at the tills.',
      'The cost of the plants new members buy in later months.',
      'The centre’s rent for the months of the drive.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The cost of what members buy later is a cost of serving them: it comes off the margin, not into CAC.',
      4: 'Rent would be paid with or without the drive; it isn’t caused by acquiring members.',
    },
    solution: 'CAC counts every cost the acquisition causes: promotion, sign-up offers and the staff time spent on it. Costs of serving customers afterwards belong in the margin, and fixed costs that don’t change with the drive belong in neither.',
  },
  {
    id: 'm06-cac-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional software tool earns a margin of $40 a month per customer, received at the start of each month; 90% of customers stay each month; ignore discounting. Is a $500 acquisition cost ever paid back? Enter the lifetime value of a new customer in dollars, which settles it.',
    answer: 400, check: () => CU.clvConstant({ m: 40, r: 0.9, d: 0 }).value, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 360, say: 'That is the residual value, without the first month’s margin. A new customer pays the first month too: 40 ÷ (1 − 0.9).' }],
    solution: 'Lifetime value = 40 ÷ (1 − 0.90) = $400, the most a customer can bring in on average. A $500 acquisition cost is never paid back: the cumulative expected margin approaches $400 and stops. The simple payback, 500 ÷ 40 = 12.5 months, hides this entirely.',
  },
];

export const check = [
  {
    id: 'm06-cac-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym spent $6,000 on acquisition in a quarter: $4,500 on online ads, which it credits with 50 new members, and $1,500 on a referral scheme, credited with 30. Another 70 new members joined with no identified channel. What is the paid CAC? Give dollars to the cent.',
    answer: 75, check: () => 6000 / (50 + 30), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 40, say: 'That is the blended CAC over all 150 new members. Paid CAC divides by the 80 that the paid channels brought.' }, { value: 90, say: 'That is the online-ads CAC alone. Paid CAC covers both paid channels.' }],
    solution: '$6,000 ÷ (50 + 30) = $75.00. Blended: $6,000 ÷ 150 = $40.00. By channel: ads $90.00, referrals $50.00.',
  },
  {
    id: 'm06-cac-k2', type: 'num', kind: 'numerical',
    prompt: 'A customer brings a margin of $50 a month, received at the start of each month from joining, and 90% of customers stay each month. Ignoring discounting, in which month does the expected cumulative margin first cover an acquisition cost of $180? (Month 1 is the month of joining.)',
    answer: k2pb, check: () => { let s = 0, t = 0; while (s < 180) { s += 50 * 0.9 ** t; t++; } return t; }, unit: 'month', places: 0, tol: 0.01,
    wrong: [{ value: 4, say: 'That is the simple payback, 180 ÷ 50 = 3.6, rounded up: it assumes everyone stays. Weight each month by the chance of still being a customer.' }],
    solution: `Cumulative: ${k2cum.slice(0, 5).map((v) => `$${fx(v)}`).join(', ')}. It first reaches $180 in month ${k2pb}. Simple payback said 3.6 months.`,
  },
  {
    id: 'm06-cac-k3', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s proposed spring campaign has a blended CAC of $2.90 and an incremental CAC of $12.34, and the 2027 joiners covered $12.34 of margin per joiner within three months. Ana’s colleague wants to double the campaign’s ad spend, citing the $2.90. What should Ana say?',
    options: [
      'The extra spending would win fewer extra members per dollar than the first $1,800; estimate what it adds, ideally by testing it, before deciding.',
      'Go ahead: at $2.90 a member, each new member pays for themselves on their first visit.',
      'Doubling the ads halves the incremental CAC, because the fixed costs are spread over more members.',
      'Don’t: any campaign whose incremental CAC is more than four times its blended CAC is wasting most of its budget on people who would have joined anyway.',
    ],
    answer: 0,
    feedback: {
      1: 'The $2.90 includes members who would have joined anyway. It says nothing about what further spending buys.',
      2: 'There are no fixed costs spread here; and more advertising usually reaches people less likely to join.',
      3: 'The gap between the two shows how many joiners would have come anyway, not whether the campaign pays; it does pay on these assumptions.',
    },
    solution: 'Decisions about more spending need the marginal (incremental) cost of the extra members it would win. Diminishing returns make that higher than the average. A test (more ads at one café, or in some weeks) would measure it.',
  },
  {
    id: 'm06-cac-k4', type: 'formula', kind: 'numerical',
    prompt: 'In B6, calculate the payback period in whole months ignoring churn and discounting (simple payback, rounded up to the month in which the margin covers the cost), for the acquisition cost in B1 and the margin per month in B2.',
    sheet: { cells: { A1: 'Acquisition cost ($)', B1: 130, A2: 'Margin per month ($)', B2: 22, A6: 'Simple payback (months)' }, vary: { B1: [95, 150, 210], B2: [18, 25, 31] } },
    cell: 'B6', answer: '=ROUNDUP(B1/B2,0)', alt: ['=CEILING(B1/B2,1)', '=-INT(-B1/B2)'],
    view: 'A1:B6', formats: { B1: '$#,##0.00', B2: '$#,##0.00', B6: '0' }, widths: { A: 24, B: 11 },
    wrong: [{ formula: '=B1/B2', say: 'That is the fraction of months. The question asks for the whole month in which the cost is covered: round up.' }, { formula: '=ROUND(B1/B2,0)', say: 'ROUND can round down: 130 ÷ 22 = 5.9 rounds to 6, but 4.2 would round to 4, before the cost is covered. Use ROUNDUP.' }],
    solution: '<x>=ROUNDUP(B1/B2,0)</x>: 130 ÷ 22 = 5.9, so month 6. It is the optimistic figure: with customers leaving, the real payback is later.',
  },
  {
    id: 'm06-cac-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Two channels have the same payback period, six months. What does that tell you about which is better?',
    options: [
      'Not enough: payback ignores everything after month six, so the channels’ lifetime values may differ greatly.',
      'They are equally good, because they recover their acquisition cost at the same time and then both go on earning.',
      'The one with the higher CAC is better, because it must bring in higher margins in the early months to pay back as quickly.',
      'The one with the lower CAC is better, because it puts less of the business’s money at risk while the cost is recovered.',
    ],
    answer: 0,
    feedback: {
      1: 'Recovering the cost at the same time says nothing about what comes after.',
      2: 'Higher margins early can come with faster churn; the lifetime value settles it.',
      3: 'Less money at risk is one consideration, but the value each brings can outweigh it.',
    },
    solution: 'Payback measures how long cash is tied up; the value-to-cost ratio measures whether customers are worth winning. Read the two together.',
  },
  {
    id: 'm06-cac-k6', type: 'classify', kind: 'conceptual',
    prompt: 'For each statement about acquisition cost and payback, say whether it is true or false.',
    items: [
      'If a customer’s acquisition cost exceeds their lifetime value, they never pay back, however long you wait.',
      'Blended CAC is always at least as high as paid CAC.',
      'The 3:1 value-to-cost guideline is a convention for software businesses with high gross margins, not a law.',
      'A channel’s CAC can change when the attribution rule changes, even if nothing else does.',
    ],
    categories: ['True', 'False'],
    answer: [0, 1, 0, 0],
    feedback: {
      0: 'The cumulative expected margin approaches the lifetime value and never exceeds it.',
      1: 'Blended CAC divides by more customers (including unattributed ones), so it is at most the paid CAC.',
      2: 'Skok gives it for software-as-a-service firms with gross margins of 80% or more, measuring lifetime value on revenue.',
      3: 'Attribution decides which customers each channel is credited with.',
    },
    solution: 'True, false, true, true.',
  },
];
