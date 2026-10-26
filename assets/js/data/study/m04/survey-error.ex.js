// survey-error.ex.js — M04 · Survey error: widgets, practice and the knowledge check (answer keys live here).
// Lantern's dispositions, completes and weights come from case.js; the samplers use the list's known answers as a
// teaching device. Brindlecombe Garden Centre, Pennyholt Bakeries, Tamberlake Gyms, Marrowby Buses and Orrinsby Software
// are fictional. Formula items are marked by their results on the sheet and on copies with the numbers changed.
import { PEOPLE, STRATA, SIZES, DISPOSITIONS, DERIVED } from './case.js?v=19';

const DS = DISPOSITIONS, NC = DERIVED.survey.completesByStratum;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const sumsq = (xs) => xs.reduce((a, b) => a + b * b, 0);

// the sheet behind se-sheet: dispositions, response rates, weights and Kish
const seCells = { A1: 'Stratum', B1: 'On the list', C1: 'Invited', D1: 'Complete', E1: 'Partial', F1: 'RR1', G1: 'RR2', H1: 'Weight', A6: 'All', B6: '=SUM(B2:B5)', C6: '=SUM(C2:C5)', D6: '=SUM(D2:D5)', E6: '=SUM(E2:E5)', F6: '=D6/C6', G6: '=(D6+E6)/C6', A8: 'Kish effective sample size', B8: '=SUMPRODUCT(D2:D5,H2:H5)^2/SUMPRODUCT(D2:D5,H2:H5^2)', A9: 'Design effect of the weights', B9: '=D6/B8' };
STRATA.forEach((nm, h) => { const r = h + 2, d = DS.byStratum[h]; Object.assign(seCells, { [`A${r}`]: nm, [`B${r}`]: SIZES[h], [`C${r}`]: d.invited, [`D${r}`]: d.I, [`E${r}`]: d.P, [`F${r}`]: `=D${r}/C${r}`, [`G${r}`]: `=(D${r}+E${r})/C${r}`, [`H${r}`]: `=B${r}/D${r}` }); });

// Brindlecombe Garden Centre (fictional): respondents by tier
const BR = { tiers: ['Green', 'Silver', 'Gold'], N: [5230, 2270, 500], n: [120, 84, 46] };
const brCells = { A1: 'Tier', B1: 'Members (N)', C1: 'Respondents (n)', D1: 'Weight', A5: 'Total', B5: '=SUM(B2:B4)', C5: '=SUM(C2:C4)' };
BR.tiers.forEach((t, i) => Object.assign(brCells, { [`A${i + 2}`]: t, [`B${i + 2}`]: BR.N[i], [`C${i + 2}`]: BR.n[i] }));
// Pennyholt Bakeries (fictional): respondents by shop, for Kish
const PN = { shops: ['Mill Lane', 'Quayside', 'Station Road', 'Westgate'], N: [3200, 2100, 1500, 1200], n: [180, 70, 90, 30] };
const pnCells = { A1: 'Shop', B1: 'Members (N)', C1: 'Respondents (n)', D1: 'Weight', E2: 'Effective sample size' };
PN.shops.forEach((s, i) => Object.assign(pnCells, { [`A${i + 2}`]: s, [`B${i + 2}`]: PN.N[i], [`C${i + 2}`]: PN.n[i], [`D${i + 2}`]: `=B${i + 2}/C${i + 2}` }));
const pnW = PN.N.map((k, i) => k / PN.n[i]);
const pnNeff = PN.N.reduce((a, b) => a + b, 0) ** 2 / PN.n.reduce((a, k, i) => a + k * pnW[i] ** 2, 0);
// Kish by hand: 100 respondents with weight 4, 50 with weight 12
const KH = { n: [100, 50], w: [4, 12] };
const khNeff = (KH.n[0] * KH.w[0] + KH.n[1] * KH.w[1]) ** 2 / (KH.n[0] * KH.w[0] ** 2 + KH.n[1] * KH.w[1] ** 2);
// Marrowby Buses (fictional): weighted satisfaction
const MB = { N: [18000, 6000, 1000], n: [150, 240, 60], x: [90, 204, 30] };
const mbW = MB.N.reduce((a, k, i) => a + k * MB.x[i] / MB.n[i], 0) / 25000;
// Brindlecombe e-mail survey dispositions
const BD = { I: 312, P: 48, R: 20, NC: 60, U: 730, NE: 30 };
const bdEl = BD.I + BD.P + BD.R + BD.NC + BD.U;
// Orrinsby Software (fictional): recommend, with uneven response
const OR = { N: [8000, 1600, 400], n: [160, 120, 80], x: [72, 66, 56] };
const orW = OR.N.reduce((a, k, i) => a + k * OR.x[i] / OR.n[i], 0) / 10000;

export const widgets = {
  'se-sampler-nps': {
    type: 'sampler', title: 'Non-response and weighting on Lantern’s list: the share of promoters',
    strata: PEOPLE.stratum, strataNames: STRATA, value: PEOPLE.group.map((g) => (g === 2 ? 1 : 0)), valueLabel: 'promoters',
    propensity: PEOPLE.propensity, cluster: PEOPLE.batch,
    methods: ['srs', 'stratified', 'optin'], method: 'stratified', sizes: [100, 300, 600], n: 300, nonresponse: true, weight: false, seed: 5,
    note: 'With non-response on, each design invites enough people to expect the completes you chose and keeps only those who reply. Subscribers reply more than newsletter-only readers, and within every segment promoters reply more than detractors. Weighting to the segments removes the first problem and leaves the second, so the weighted estimates still centre above the truth. A larger sample narrows the histogram around the wrong value.',
  },
  'se-sampler-cb': {
    type: 'sampler', title: 'The same respondents, another question: would definitely or probably buy Cold Brew',
    strata: PEOPLE.stratum, strataNames: STRATA, value: PEOPLE.coldbrew.map((c) => (c <= 2 ? 1 : 0)), valueLabel: 'Cold Brew intenders',
    propensity: PEOPLE.propensity, cluster: PEOPLE.batch,
    methods: ['srs', 'stratified', 'optin'], method: 'stratified', sizes: [100, 300, 600], n: 300, nonresponse: true, weight: false, seed: 6,
    note: 'Who replied depended on the segment and on how much people liked Lantern, not directly on interest in Cold Brew. Once the segments are weighted back, little bias is left for this question. Non-response bias belongs to each estimate, not to the survey as a whole.',
  },
  'se-sheet': {
    type: 'sheet', title: 'Lantern’s February dispositions, response rates and weights',
    sheet: { cells: seCells }, view: 'A1:H9', editable: true,
    formats: { F: '0.0%', G: '0.0%', H: '0.00', B8: '0.0', B9: '0.000', B2: '#,##0', B3: '#,##0', B4: '#,##0', B5: '#,##0', B6: '#,##0', C: '#,##0' },
    widths: { A: 19, B: 8, C: 7, D: 8, E: 7, F: 6, G: 6, H: 7 },
    tools: ['formulas', 'reset'],
    note: 'RR1 counts completes, RR2 completes and partials, each over everyone invited (no one on the list is ineligible). The weight is the stratum’s size on the list over its completes. Kish’s n_eff in B8 uses one weight per stratum: (Σ n_h w_h)² ÷ Σ n_h w_h².',
  },
};

export const guided = [
  {
    id: 'm04-se-g1', type: 'steps', kind: 'applied',
    prompt: 'Work through the response to Lantern’s February survey. Ana’s rule (fictional, set before fieldwork): all five closed questions (Q1 to Q5) answered is a complete, whether or not the open Q6 was filled in; three or four, a partial; fewer than three, a break-off, counted with refusals.',
    solution: 'Classify every case first; then RR1 = completes ÷ invited, RR2 = (completes + partials) ÷ invited, since no one on the list is ineligible. The weight for a stratum is its size on the list divided by its completes. Weighting corrects the mix of segments among respondents, not differences within them.',
    steps: [
      {
        id: 'm04-se-g1-s1', type: 'classify',
        prompt: 'Give each case its AAPOR disposition, using Ana’s rule.',
        items: [
          'Answered all six questions',
          'Answered Q1 to Q5 and left the open Q6 blank',
          'Answered Q1 to Q4, then closed the page',
          'Answered Q1 only, then closed the page',
          'Replied to the invitation asking to be taken off the list',
          'The invitation bounced: the address no longer exists',
        ],
        categories: ['Complete (I)', 'Partial (P)', 'Refusal or break-off (R)', 'Non-contact (NC)'],
        answer: [0, 0, 1, 2, 2, 3],
        hints: ['Count the closed questions (Q1 to Q5) answered and apply the rule; Q6 doesn’t count.', 'A bounced invitation never reached the person; a request to be removed did.'],
        feedback: {
          1: 'All five closed questions answered makes a complete; the open Q6 is optional under Ana’s rule.',
          2: 'Four of the five closed questions is in the three-or-four band: a partial.',
          3: 'One answer is fewer than three: a break-off, counted with refusals.',
          4: 'The invitation reached the person, who declined: a refusal.',
          5: 'The invitation never reached anyone: a non-contact.',
        },
        solution: 'All six, or Q1 to Q5 with Q6 blank: complete. Four closed questions: partial. One: break-off (R). Asked to be removed: refusal (R). Bounced: non-contact (NC).',
      },
      {
        id: 'm04-se-g1-s2', type: 'num',
        prompt: `The newsletter-only stratum: ${DS.byStratum[3].invited.toLocaleString('en-US')} invited, ${DS.byStratum[3].I} complete, ${DS.byStratum[3].P} partial, ${DS.byStratum[3].R} refused or broke off, ${DS.byStratum[3].NC} bounced and ${DS.byStratum[3].U.toLocaleString('en-US')} no reply. What is its RR1? Give a percentage to one decimal place.`,
        answer: Math.round(DS.byStratum[3].I / DS.byStratum[3].invited * 1000) / 10, check: () => 297 / 1446 * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: Math.round((DS.byStratum[3].I + DS.byStratum[3].P) / DS.byStratum[3].invited * 1000) / 10, say: 'That counts the partials too: it is RR2. RR1 counts completes only.' },
          { value: Math.round(DS.byStratum[3].I / (DS.byStratum[3].invited - DS.byStratum[3].NC) * 1000) / 10, say: 'Bounced invitations stay in the denominator: the people are in the population, just not reached.' },
        ],
        hints: ['RR1 = I ÷ (I + P + R + NC + O + U).', '297 ÷ 1,446'],
        solution: `297 ÷ 1,446 = ${pc(297 / 1446)}. RR2 would be (297 + 35) ÷ 1,446 = ${pc(332 / 1446)}.`,
      },
      {
        id: 'm04-se-g1-s3', type: 'num',
        prompt: `The newsletter-only stratum has ${SIZES[3].toLocaleString('en-US')} people on the list and ${NC[3]} completes. What post-stratification weight does each of its respondents get? Give two decimal places.`,
        answer: Math.round(SIZES[3] / NC[3] * 100) / 100, check: () => 4330 / 297, unit: '', places: 2, tol: 0.006,
        wrong: [
          { value: Math.round(NC[3] / SIZES[3] * 100) / 100, say: 'That is the share of the stratum that responded. The weight is the inverse: how many people each respondent stands for.' },
          { value: Math.round(DS.byStratum[3].invited / NC[3] * 100) / 100, say: 'That weights back to the invitations. Post-stratification weights back to the population on the list: 4,330.' },
        ],
        hints: ['w_h = N_h ÷ n_h', '4,330 ÷ 297'],
        solution: `4,330 ÷ 297 = ${(4330 / 297).toFixed(2)}: each newsletter-only respondent stands for about 14.6 people on the list, against 5.84 for each subscriber.`,
      },
      {
        id: 'm04-se-g1-s4', type: 'mc',
        prompt: 'Weighting lowers Lantern’s Net Promoter Score from +27.5 to +20.4. Why?',
        options: [
          'The high-scoring customer segments are over-represented; weighting restores each segment’s share of the list.',
          'Weighting removes the extra promoters who answered more readily within each segment, leaving the true score.',
          'Weighting adds the 1,488 non-respondents back into the score, on the assumption that all of them are detractors.',
          'Weighting adjusts for the margin of error, which came out wider than planned because response was below 30%.',
        ],
        answer: 0,
        hints: ['Compare each segment’s share of the respondents with its share of the list.'],
        feedback: {
          1: 'Weighting by segment can’t see differences within a segment. That bias remains.',
          2: 'Weights rescale respondents; no answers are invented for non-respondents.',
          3: 'The margin of error is about precision; weighting changes the estimate by changing the mix of segments.',
        },
        solution: 'Subscribers are 8.7% of the list but 17.2% of respondents, and score +62; newsletter-only readers are 72.2% of the list, 57.6% of respondents and score +7. Weighting gives each segment its share of the list, which pulls the score down. It cannot correct for promoters replying more readily within a segment.',
      },
    ],
  },
  {
    id: 'm04-se-g2', type: 'formula', kind: 'numerical',
    prompt: 'Brindlecombe Garden Centre (fictional) surveyed its loyalty members. B2:B4 hold the members in each tier and C2:C4 the respondents. In D2, calculate the post-stratification weight for Green members, so that the formula can be filled down to D4.',
    sheet: { cells: brCells },
    cell: 'D2', fill: 'D2:D4', answer: '=B2/C2',
    view: 'A1:D5', formats: { D: '0.00', B: '#,##0' }, widths: { A: 10, B: 13, C: 16, D: 10 },
    wrong: [
      { formula: '=C2/B2', say: 'That is the share of the tier who responded. The weight is its inverse: members per respondent, N_h ÷ n_h.' },
      { formula: '=$B$5/$C$5', say: 'That gives every respondent the same weight, the average, and corrects nothing. Each tier needs its own N_h ÷ n_h.' },
      { formula: '=B2/$B$5', say: 'That is the tier’s share of members, W_h. The weight a respondent carries is N_h ÷ n_h.' },
    ],
    hints: ['Each respondent stands for N_h ÷ n_h members.', '<x>=B2/C2</x>'],
    solution: `<x>=B2/C2</x>: Green ${(5230 / 120).toFixed(2)}, Silver ${(2270 / 84).toFixed(2)}, Gold ${(500 / 46).toFixed(2)}. Gold members replied most readily (9.2% of the tier against 2.3% of Green), so each counts least.`,
  },
  {
    id: 'm04-se-g3', type: 'num', kind: 'numerical',
    prompt: 'Pennyholt Bakeries (fictional) invited 1,000 loyalty members to a satisfaction survey; 40% replied, and 72% of them were satisfied. A follow-up phone call to a random sample of non-respondents found 54% satisfied. By how many percentage points does the respondents’ 72% overstate the share among everyone invited? Give one decimal place.',
    answer: Math.round((1 - 0.4) * (72 - 54) * 10) / 10, check: () => (1 - 0.4) * (72 - 54), unit: 'points', places: 1, tol: 0.06,
    wrong: [
      { value: 0.4 * 18, say: 'Multiply the difference by the share who did not respond, 1 − 0.4 = 0.6, not by the response rate.' },
      { value: 18, say: 'That is the gap between respondents and non-respondents. The bias is that gap times the share of non-respondents: 0.6 × 18.' },
      { value: 0.4 * 72 + 0.6 * 54, say: 'That is the corrected estimate for everyone invited, 61.2%. The question asks for the overstatement: 72 − 61.2.' },
    ],
    hints: ['Bias = (1 − RR) × (respondents − non-respondents).', '0.6 × (72 − 54)'],
    solution: 'Bias = (1 − 0.40) × (72 − 54) = 0.6 × 18 = 10.8 points. Check: everyone invited, 0.4 × 72 + 0.6 × 54 = 61.2%, and 72 − 61.2 = 10.8.',
  },
  {
    id: 'm04-se-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Tamberlake Gyms (fictional) suspects that, in every membership type, members planning to leave were less likely to answer its renewal survey. It weights the responses by membership type. What will the weighting do?',
    options: [
      'Fix the mix of types but leave the estimate too high, because the bias lies within each type.',
      'Remove the bias completely, because after weighting the respondents match the members on membership type.',
      'Make the estimate more biased than before, because weighting always adds error to a respondent sample.',
      'Change nothing except the margin of error, because weighting affects precision and never the estimate.',
    ],
    answer: 0,
    hints: ['What does weighting by membership type assume about members within one type?'],
    feedback: {
      1: 'Matching on membership type removes bias only if, within each type, respondents answer like non-respondents. Here they don’t.',
      2: 'Weighting usually reduces bias when the weighting variable is related to both response and the answer; it costs precision, but it doesn’t add bias by itself.',
      3: 'Weighting changes the estimate whenever the respondents’ mix differs from the population’s; it also widens the margin a little.',
    },
    solution: 'Post-stratification corrects differences between groups, not within them. Leavers missing from every type keep the weighted renewal share too high; only evidence from non-respondents (a follow-up) or a variable that predicts leaving (visit records) can reduce it.',
  },
];

export const independent = [
  {
    id: 'm04-se-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Name the component of total survey error in each case.',
    items: [
      'The frame is last year’s customer list, so this year’s new customers can’t be invited.',
      'Two random samples of 400 from the same list give 41% and 45%.',
      'Customers who had a bad experience ignored the invitation more often than happy ones.',
      '“How often do you buy coffee out?” means weekly to some people and daily to others.',
      'For one day’s returns, a coder keys 5 as “very satisfied” when the form used 5 for “very dissatisfied”.',
      'Members report more gym visits last month than the turnstile records show.',
    ],
    categories: ['Coverage error', 'Sampling error', 'Non-response error', 'Measurement error', 'Processing error'],
    answer: [0, 1, 2, 3, 4, 3],
    feedback: {
      1: 'Chance differences between random samples are sampling error, the only kind the margin of error measures.',
      4: 'The respondent answered correctly; the mistake entered when the answer was recorded: processing error.',
      5: 'The answers depart from the truth, through memory or the wish to look good: measurement error.',
    },
    solution: 'Missing new customers: coverage. Two samples differing by chance: sampling. Unhappy customers not replying: non-response. A vague question: measurement. A keying mistake: processing. Over-reported visits: measurement (social desirability or memory).',
  },
  {
    id: 'm04-se-i2', type: 'num', kind: 'numerical',
    prompt: `A survey has ${KH.n[0]} respondents with weight ${KH.w[0]} and ${KH.n[1]} with weight ${KH.w[1]}. What is Kish’s effective sample size? Give a whole number.`,
    answer: Math.round(khNeff), check: () => (100 * 4 + 50 * 12) ** 2 / (100 * 16 + 50 * 144), unit: 'respondents', places: 0, tol: 0.6,
    wrong: [
      { value: 150, say: 'That is the number of respondents. Unequal weights reduce the information: n_eff = (Σw)² ÷ Σw².' },
      { value: Math.round((KH.w[0] + KH.w[1]) ** 2 / (KH.w[0] ** 2 + KH.w[1] ** 2) * 10) / 10, say: 'Sum over respondents, not over the two weight values: Σw = 100 × 4 + 50 × 12 = 1,000.' },
    ],
    solution: `Σw = 100 × 4 + 50 × 12 = 1,000; Σw² = 100 × 16 + 50 × 144 = 8,800; n_eff = 1,000² ÷ 8,800 = ${khNeff.toFixed(1)}, about ${Math.round(khNeff)}. The design effect is 150 ÷ ${khNeff.toFixed(1)} = ${(150 / khNeff).toFixed(2)}.`,
  },
  {
    id: 'm04-se-i3', type: 'formula', kind: 'numerical',
    prompt: 'Pennyholt Bakeries (fictional) weighted its survey by shop: B2:B5 hold the members at each shop, C2:C5 the respondents and D2:D5 each shop’s weight. In F2, calculate Kish’s effective sample size in one formula with SUMPRODUCT.',
    sheet: { cells: pnCells },
    cell: 'F2', answer: '=SUMPRODUCT(C2:C5,D2:D5)^2/SUMPRODUCT(C2:C5,D2:D5^2)', require: ['SUMPRODUCT'],
    alt: ['=SUM(B2:B5)^2/SUMPRODUCT(C2:C5,D2:D5^2)', '=SUMPRODUCT(C2:C5,D2:D5)^2/SUMPRODUCT(C2:C5,D2:D5,D2:D5)', '=SUMPRODUCT(C2:C5*D2:D5)^2/SUMPRODUCT(C2:C5*D2:D5^2)'],
    view: 'A1:F5', formats: { D: '0.00', F2: '0.0', B: '#,##0' }, widths: { A: 13, B: 12, C: 15, D: 8, E: 19, F: 9 },
    wrong: [
      { formula: '=SUM(D2:D5)^2/SUMSQ(D2:D5)', say: 'That treats each shop as one respondent. Every respondent carries a weight, so multiply by the respondents in C: (Σ n_h w_h)² ÷ Σ n_h w_h².' },
      { formula: '=SUMPRODUCT(C2:C5,D2:D5^2)/SUMPRODUCT(C2:C5,D2:D5)^2', say: 'Upside down: n_eff = (Σw)² ÷ Σw², which is close to the number of respondents, not a small fraction.' },
      { formula: '=SUM(C2:C5)', say: 'That is the number of respondents, which ignores the cost of unequal weights.' },
    ],
    solution: `<x>=SUMPRODUCT(C2:C5,D2:D5)^2/SUMPRODUCT(C2:C5,D2:D5^2)</x>: Σ n_h w_h = 8,000 members; Σ n_h w_h² = ${PN.n.reduce((a, k, i) => a + k * pnW[i] ** 2, 0).toFixed(0)}; n_eff = ${pnNeff.toFixed(1)} against 370 respondents, a design effect of ${(370 / pnNeff).toFixed(2)}.`,
  },
  {
    id: 'm04-se-i4', type: 'mc', kind: 'applied',
    prompt: 'Four firms plan to forecast sales from purchase-intent surveys. By Morwitz, Steckel and Gupta’s findings, whose stated intentions are likely to relate most closely to what people later buy?',
    options: [
      'A maker of an established washing machine model, asking about buying one in the next three months.',
      'A start-up launching a new kind of energy drink, asking about buying it at some point in the next year.',
      'A snack firm asking whether people will buy any brand of protein bar at all in the next two years.',
      'A firm launching a meal-kit service in a new city, asking about signing up within the next year.',
    ],
    answer: 0,
    feedback: {
      1: 'New product, non-durable, long horizon: three conditions under which intentions predict purchases less well, and new products are where Sun and Morwitz expect exaggerated intent.',
      2: 'A whole category and a two-year horizon: intentions about general categories and long horizons relate less closely to purchases.',
      3: 'A new service in a new market over a year: new offerings and longer horizons weaken the link.',
    },
    solution: 'Intentions relate more closely to purchases for existing products than new ones, for durables than non-durables, over short horizons than long ones, and for specific brands or models than categories. The established washing machine over three months meets all four.',
  },
  {
    id: 'm04-se-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about response rates that are correct.',
    options: [
      'A low response rate allows non-response bias but doesn’t prove there is any.',
      'For the same survey, RR2 is at least as high as RR1, because it adds partials to the completes.',
      'Across 59 studies, Groves and Peytcheva found little correlation between non-response rates and bias.',
      'A 60% response rate guarantees less non-response bias than a 25% rate in another survey.',
      'RR1 leaves bounced e-mail invitations out of its denominator, because they never reached anyone.',
      'The same non-respondents can bias one question in a survey much more than another.',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'Bias depends on the response rate and on how different non-respondents are. A high-rate survey whose few non-respondents are very different can be worse.',
      4: 'Non-contacts stay in RR1’s denominator: they are eligible people the survey failed to reach.',
      5: 'Correct too: bias needs non-respondents to differ on the thing measured, and they may differ on one question and not another, as Lantern’s promoters and Cold Brew intenders show.',
    },
    solution: 'A low rate allows bias; RR2 ≥ RR1 because its numerator adds partials over the same denominator; the meta-analysis found little link between rates and bias; and bias belongs to each estimate, not the survey. A higher rate doesn’t guarantee less bias, and non-contacts stay in the denominator.',
  },
  {
    id: 'm04-se-i6', type: 'num', kind: 'applied',
    prompt: `Marrowby Buses (fictional) surveyed passengers holding its ${MB.N.map((v) => v.toLocaleString('en-US')).join(', ').replace(/, ([^,]*)$/, ' and $1')} adult, concession and student smartcards. ${MB.n.join(', ').replace(/, ([^,]*)$/, ' and $1')} replied, and ${MB.x.join(', ').replace(/, ([^,]*)$/, ' and $1')} of them were satisfied. Concession holders, the most satisfied, replied most readily. Estimate the share of all cardholders who are satisfied, weighted to the cards issued. Give a percentage to one decimal place.`,
    answer: Math.round(mbW * 1000) / 10, check: () => (18000 * 90 / 150 + 6000 * 204 / 240 + 1000 * 30 / 60) / 25000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 324 / 450 * 100, say: 'That is the unweighted share. Concession holders are 24% of cardholders but 53% of respondents, so their high satisfaction is over-counted.' },
      { value: Math.round((0.6 + 0.85 + 0.5) / 3 * 1000) / 10, say: 'That averages the three groups as if each were a third of cardholders. Weight each by its share of the 25,000 cards.' },
    ],
    solution: `Shares satisfied: 90 ÷ 150 = 0.60, 204 ÷ 240 = 0.85, 30 ÷ 60 = 0.50. Weighted: (18,000 × 0.60 + 6,000 × 0.85 + 1,000 × 0.50) ÷ 25,000 = ${pc(mbW)}, against ${pc(324 / 450)} unweighted. It is still an estimate for cardholders like those who replied within each group.`,
  },
];

export const check = [
  {
    id: 'm04-se-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A survey report gives a share of 42% “with a margin of error of ±4 points”. Which error does the ±4 points reflect?',
    options: [
      'Sampling error: the chance variation from studying a random sample rather than the whole frame.',
      'Coverage error: the gap between the people on the frame and the population the report describes.',
      'Non-response error: the difference between the people who replied and the people who didn’t.',
      'Total survey error: every source of error combined, from the frame through to data processing.',
    ],
    answer: 0,
    feedback: {
      1: 'The margin of error assumes the frame is right; it can’t see who is missing from it.',
      2: 'The margin of error is computed from the respondents alone and says nothing about non-respondents.',
      3: 'Most surveys measure only the sampling variance (Groves and Lyberg); the other components are usually unmeasured and can be larger.',
    },
    solution: 'The margin of error is z × the standard error, which measures sampling variance only. Coverage, non-response, measurement and processing errors are outside it, which is why a report should also state the frame, the response rate and the weighting.',
  },
  {
    id: 'm04-se-k2', type: 'num', kind: 'numerical',
    prompt: `Brindlecombe Garden Centre (fictional) e-mailed a survey to 1,200 loyalty members. Final dispositions: ${BD.I} complete, ${BD.P} partial, ${BD.R} refused or broke off, ${BD.NC} bounced, ${BD.U} no reply, and ${BD.NE} accounts that turned out to belong to staff, who are not in the population. What is RR2? Give a percentage to one decimal place.`,
    answer: Math.round((BD.I + BD.P) / bdEl * 1000) / 10, check: () => (312 + 48) / (1200 - 30) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: (BD.I + BD.P) / 1200 * 100, say: 'Ineligible cases are left out of the denominator: 1,200 − 30 = 1,170.' },
      { value: Math.round(BD.I / bdEl * 1000) / 10, say: 'That is RR1, completes only. RR2 adds the partials: (312 + 48) ÷ 1,170.' },
      { value: Math.round((BD.I + BD.P) / (bdEl - BD.NC) * 1000) / 10, say: 'Bounced invitations stay in the denominator: those members are eligible, just not reached.' },
    ],
    solution: `Eligible cases: 1,200 − 30 = ${bdEl.toLocaleString('en-US')}. RR2 = (312 + 48) ÷ ${bdEl.toLocaleString('en-US')} = ${pc((BD.I + BD.P) / bdEl)}; RR1 = 312 ÷ ${bdEl.toLocaleString('en-US')} = ${pc(BD.I / bdEl)}.`,
  },
  {
    id: 'm04-se-k3', type: 'num', kind: 'numerical',
    prompt: `Orrinsby Software (fictional) has ${OR.N.map((v) => v.toLocaleString('en-US')).join(', ').replace(/, ([^,]*)$/, ' and $1')} Free, Pro and Enterprise customers. ${OR.n.join(', ').replace(/, ([^,]*)$/, ' and $1')} replied to its survey, and ${OR.x.join(', ').replace(/, ([^,]*)$/, ' and $1')} would recommend it. Estimate the share of all customers who would recommend Orrinsby, weighted to the customer numbers. Give a percentage to one decimal place.`,
    answer: Math.round(orW * 1000) / 10, check: () => (8000 * 72 / 160 + 1600 * 66 / 120 + 400 * 56 / 80) / 10000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round(194 / 360 * 1000) / 10, say: 'That is the unweighted share. Enterprise customers are 4% of customers but 22% of respondents.' },
      { value: Math.round((0.45 + 0.55 + 0.7) / 3 * 1000) / 10, say: 'Weight each plan by its share of the 10,000 customers, not equally.' },
    ],
    solution: `Shares: 72 ÷ 160 = 0.45, 66 ÷ 120 = 0.55, 56 ÷ 80 = 0.70. Weighted: 0.80 × 0.45 + 0.16 × 0.55 + 0.04 × 0.70 = 0.36 + 0.088 + 0.028 = ${orW.toFixed(3)}, so ${pc(orW)}, against ${pc(194 / 360)} unweighted.`,
  },
  {
    id: 'm04-se-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Marrowby Buses (fictional) e-mailed a ten-question survey to a sample of its smartcard holders, counting more than 80% of questions answered as a complete and 50% to 80% as a partial. Give each case its AAPOR disposition.',
    items: [
      'Answered all ten questions',
      'Answered seven of the ten questions',
      'Answered two questions, then closed the survey',
      'Replied “Stop e-mailing me” without answering',
      'The invitation bounced: the mailbox doesn’t exist',
      'The card turned out to be a staff pass, outside the population of passengers',
    ],
    categories: ['Complete (I)', 'Partial (P)', 'Refusal or break-off (R)', 'Non-contact (NC)', 'Not eligible'],
    answer: [0, 1, 2, 2, 3, 4],
    feedback: {
      1: 'Seven of ten is 70%, between 50% and 80%: a partial.',
      2: 'Two of ten is below the partial threshold: a break-off, counted with refusals.',
      5: 'Not part of the population: removed from the response-rate denominator.',
    },
    solution: 'Ten of ten: complete. Seven of ten: partial. Two of ten: break-off (R). An explicit refusal: R. A bounced invitation: non-contact. A staff pass: not eligible, excluded from the rates.',
  },
  {
    id: 'm04-se-k5', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s weighted Net Promoter Score is +20.4, against +27.5 unweighted. A colleague says: “Now that it’s weighted, +20.4 is our true score among the people on the list.” What should Ana reply?',
    options: [
      'It fixes the segment mix, but if happier people replied more within each segment, the true score is lower.',
      'It is the true score, because post-stratification makes the respondents match the list on all of their characteristics.',
      'It is less trustworthy than +27.5, because weighting adds bias whenever the weights are unequal across segments.',
      'It can’t be judged until the margin of error is recalculated, because weighting decides whether the score is biased.',
    ],
    answer: 0,
    feedback: {
      1: 'Weighting matches the respondents to the list on the segment only. Differences within a segment, such as keener customers replying more, remain.',
      2: 'Unequal weights cost precision (Kish’s n_eff falls to about 469), but weighting to known segment sizes removes bias that runs through the segments.',
      3: 'The margin of error describes sampling variance. Whether the score is biased depends on who replied, which a margin can’t show.',
    },
    solution: 'Post-stratification fixes the mix of segments among respondents. It can’t fix the tendency, within each segment, of people who like Lantern to reply more readily, so the weighted score is best treated as an upper estimate and reported with that warning.',
  },
  {
    id: 'm04-se-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about stated purchase intentions that are correct.',
    options: [
      'Intentions relate more closely to later purchases for existing products than for new ones.',
      'Respondents often overstate their intention to buy, especially in surveys about new products.',
      'The share who say they would definitely or probably buy is a forecast of the share who will buy.',
      'Intentions predict purchases better over a long horizon, because people have time to act on them.',
      'Weighting the respondents to the population removes the gap between intentions and purchases.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Stated intent is a measure of interest. Converting it to purchases needs an explicit assumption, tested for how much it matters.',
      3: 'The reverse: Morwitz, Steckel and Gupta found intentions relate more closely to purchases over short horizons.',
      4: 'Weighting fixes who answered, not whether their answers predict their behaviour: the intention gap is measurement error.',
    },
    solution: 'Morwitz, Steckel and Gupta found intentions more closely related to purchases for existing products, durables, short horizons and specific brands; Sun and Morwitz describe a positive intention bias likely in new-product surveys. Intent is not a forecast, the long-horizon claim is backwards, and weighting doesn’t touch measurement error.',
  },
];
