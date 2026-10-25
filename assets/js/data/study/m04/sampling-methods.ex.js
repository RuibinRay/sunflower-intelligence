// sampling-methods.ex.js — M04 · Sampling methods: widgets, practice and the knowledge check (answer keys live here).
// Lantern's list, strata and allocation come from case.js; the sampler uses the list's known answers as a teaching
// device. Pennyholt Bakeries, Marrowby Buses, Tamberlake Gyms, Saltreed Festival, Brindlecombe Garden Centre and
// Orrinsby Software are fictional. Formula items are marked by their results on the sheet and on copies with the numbers
// changed; num items recompute their answers.
import { PEOPLE, STRATA, SIZES, SURVEY_2027, SURVEY_PLAN } from './case.js?v=14';
import * as S from '../../../core/survey.js?v=14';
import * as I from '../../../core/inference.js?v=14';

const Z = I.normInv(0.975);
const A = SURVEY_2027.allocation, RR = SURVEY_PLAN.responseRate;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// Pennyholt Bakeries (fictional): loyalty members by shop; a disproportionate follow-up survey
const PEN = { shops: ['Mill Lane', 'Quayside', 'Station Road', 'Westgate'], N: [3200, 2100, 1500, 1200], n: [100, 80, 60, 60], yes: [38, 42, 25, 38] };
const penCells = (withSample) => {
  const c = { A1: 'Shop', B1: 'Members (N)', A6: 'Total', B6: '=SUM(B2:B5)' };
  PEN.shops.forEach((s, i) => Object.assign(c, { [`A${i + 2}`]: s, [`B${i + 2}`]: PEN.N[i] }));
  if (withSample) { Object.assign(c, { C1: 'Sampled (n)', D1: 'Would join', E2: 'Stratified estimate' }); PEN.n.forEach((v, i) => Object.assign(c, { [`C${i + 2}`]: v, [`D${i + 2}`]: PEN.yes[i] })); }
  else Object.assign(c, { C1: 'Allocation (unrounded)', A8: 'Sample size', B8: 400 });
  return c;
};
const PEN_EST = S.stratifiedProportion(PEN.N.map((N, i) => ({ N, n: PEN.n[i], x: PEN.yes[i] })));
// Marrowby Buses (fictional): smartcards and on-board Wi-Fi
const MB = { N: [18000, 6000, 1000], n: [300, 300, 200], x: [60, 30, 110] };
const MB_EST = S.stratifiedProportion(MB.N.map((N, i) => ({ N, n: MB.n[i], x: MB.x[i] })));
// Saltreed Festival (fictional): volunteers; ticket holders
const VOL = { N: 600, E: 0.08, r: 0.4 };
const volN0 = Z ** 2 * 0.25 / VOL.E ** 2, volN = Math.ceil(volN0 / (1 + (volN0 - 1) / VOL.N) - 1e-9);
const TIX = [{ N: 9000, n: 300, x: 240 }, { N: 3000, n: 200, x: 110 }];
const TIX_EST = S.stratifiedProportion(TIX);
const tixNoFpc = Math.sqrt(TIX.reduce((a, s) => a + (s.N / 12000) ** 2 * (s.x / s.n) * (1 - s.x / s.n) / (s.n - 1), 0));
const tixPool = TIX.reduce((a, s) => a + s.x, 0) / TIX.reduce((a, s) => a + s.n, 0);
// Brindlecombe Garden Centre (fictional): visitors in randomly chosen hours
const HR = { hours: 30, per: 16, rho: 0.06 };
const hrDeff = 1 + (HR.per - 1) * HR.rho, hrN = HR.hours * HR.per;

// the sheet behind sm-alloc: Lantern's allocation, expected completes and margins (with the FPC)
const allocCells = { A1: 'Stratum', B1: 'On the list', C1: 'Share', D1: 'Invited', E1: 'Completes', F1: 'Margin (±)', A6: 'Total', B6: '=SUM(B2:B5)', C6: '=SUM(C2:C5)', D6: '=SUM(D2:D5)', E6: '=SUM(E2:E5)', F6: '=1.96*SQRT(0.25/E6)*SQRT((B6-E6)/(B6-1))', A8: 'Invitations', B8: SURVEY_2027.invited, A9: 'Expected response rate', B9: RR };
STRATA.forEach((nm, h) => { const r = h + 2; Object.assign(allocCells, { [`A${r}`]: nm, [`B${r}`]: SIZES[h], [`C${r}`]: `=B${r}/$B$6`, [`D${r}`]: `=ROUND($B$8*B${r}/$B$6,0)`, [`E${r}`]: `=D${r}*$B$9`, [`F${r}`]: `=1.96*SQRT(0.25/E${r})*SQRT((B${r}-E${r})/(B${r}-1))` }); });
// the k6 sheet: Lantern's strata and expected completes
const needCells = { A1: 'Stratum', B1: 'On the list (N)', C1: 'Expected completes', D1: 'Completes needed', A7: 'n₀ for ±10 points', B7: 96.04 };
STRATA.forEach((nm, h) => Object.assign(needCells, { [`A${h + 2}`]: nm, [`B${h + 2}`]: SIZES[h], [`C${h + 2}`]: Math.round(A[h] * RR * 10) / 10 }));
const needF = (n0, N) => n0 / (1 + (n0 - 1) / N);

export const widgets = {
  'sm-sampler': {
    type: 'sampler', title: 'Four designs on Lantern’s mailing list: the share of promoters',
    strata: PEOPLE.stratum, strataNames: STRATA, value: PEOPLE.group.map((g) => (g === 2 ? 1 : 0)), valueLabel: 'promoters',
    propensity: PEOPLE.propensity, cluster: PEOPLE.batch, clusterLabel: 'sign-up batches',
    methods: ['srs', 'stratified', 'cluster', 'optin'], method: 'srs', sizes: [100, 300, 600], n: 300, nonresponse: false, weight: false, seed: 4,
    note: 'With full response, simple random, stratified and cluster samples all centre on the truth: they are unbiased. They differ in spread. The cluster design takes whole sign-up batches of 100, and people who signed up together answer alike, so three batches carry far less information than 300 separate people. The open link is different in kind: people who are keen on Lantern are far likelier to answer, so its estimates sit well above the truth however many you collect. Leave non-response and weighting off here; the Survey error lesson turns them on.',
  },
  'sm-alloc': {
    type: 'sheet', title: 'Lantern’s February allocation and what each stratum can be read to',
    sheet: { cells: allocCells }, view: 'A1:F9', editable: true,
    formats: { C: '0.0%', D: '#,##0', E: '0.0', F: '0.0%', B9: '0%', B2: '#,##0', B3: '#,##0', B4: '#,##0', B5: '#,##0', B6: '#,##0', B8: '#,##0' },
    widths: { A: 19, B: 9, C: 7, D: 8, E: 10, F: 9 },
    tools: ['formulas', 'reset'],
    note: 'D rounds each stratum’s proportional share of the invitations in B8; E applies the response rate in B9; F is the 95% margin for a proportion near 50% read within that stratum alone, with the finite population correction √((N − n) ÷ (N − 1)), which is why the total’s margin is a little under ±4 points. Overwrite a cell in D to try a disproportionate design.',
  },
};

export const guided = [
  {
    id: 'm04-sm-g1', type: 'steps', kind: 'applied',
    prompt: 'Ana’s February survey drew from Lantern’s mailing list. Work through what the list covers and what the design gives each group.',
    solution: 'For a question about customers, the list misses customers who never joined it and includes newsletter readers who never bought. Proportional allocation gives the 150 workshop participants 2,004 × 150 ÷ 6,000 ≈ 50 invitations, about 15 completes at 30%: too few to read that group on its own.',
    steps: [
      {
        id: 'm04-sm-g1-s1', type: 'classify',
        prompt: 'The question is “How do Lantern’s customers rate it?”. Classify each person.',
        items: [
          'A subscriber who orders every month',
          'A newsletter reader who signed up at a market stall and has never bought',
          'An online customer who unsubscribed from Lantern’s e-mails last year',
          'A workshop participant who has never ordered online',
          'A catering client’s events organiser who books events by phone and never joined the list',
        ],
        categories: ['In the target population and on the frame', 'Undercoverage: a customer missing from the frame', 'Overcoverage: on the frame but not a customer'],
        answer: [0, 2, 1, 0, 1],
        hints: ['Ask two questions of each person: are they a customer, and are they on the list?', 'Buying a workshop place makes someone a customer.'],
        feedback: {
          1: 'On the list, but someone who has never bought is outside a population of customers. Unless screened out, their answers are mixed in.',
          2: 'A customer, but not on the list any more, so the survey can’t reach them.',
          3: 'Paying for a workshop makes this person a customer, and they are on the list.',
          4: 'A customer (a catering client) who isn’t on the list: undercoverage.',
        },
        solution: 'Customers on the list are covered; customers off the list (the unsubscribed online customer, the catering contact) are undercoverage; newsletter readers who never bought are overcoverage for a question about customers.',
      },
      {
        id: 'm04-sm-g1-s2', type: 'num',
        prompt: `Proportional allocation shares ${SURVEY_2027.invited.toLocaleString('en-US')} invitations among the ${SIZES.reduce((a, b) => a + b, 0).toLocaleString('en-US')} people on the list. How many go to the ${SIZES[2]} workshop participants? Give a whole number.`,
        answer: A[2], check: () => Math.round(SURVEY_2027.invited * SIZES[2] / 6000), unit: 'invitations', places: 0, tol: 0.5,
        wrong: [
          { value: SURVEY_2027.invited / 4, say: 'That splits the invitations equally among the four strata. Proportional allocation gives each stratum its share of the list: 150 ÷ 6,000 = 2.5%.' },
          { value: A[2] * RR, say: 'That is the number of completes expected at a 30% response. The question asks for invitations.' },
        ],
        hints: ['n_h = n × N_h ÷ N', '2,004 × 150 ÷ 6,000'],
        solution: '2,004 × 150 ÷ 6,000 = 50.1, so 50 invitations.',
      },
      {
        id: 'm04-sm-g1-s3', type: 'mc',
        prompt: 'At the planned 30% response, what can the survey say about workshop participants on their own?',
        options: [
          'Very little: about 15 completes give a margin of roughly ±24 points.',
          'As much as about the whole list: the margin of error is ±4 points.',
          'Nothing at all: workshop participants are outside the target population.',
          'Only biased figures: a stratum as small as 150 is bound to be biased.',
        ],
        answer: 0,
        hints: ['Work out the completes, 50 × 0.3, then the margin for that many.', 'A small sample is imprecise; that is not the same as biased.'],
        feedback: {
          1: '±4 points is for about 600 completes. A group read alone has its own, much smaller, sample.',
          2: 'They are customers: they paid for a workshop. The problem is the size of their sample, not whether they belong.',
          3: 'A small sample gives a wide margin, which is sampling error. Bias comes from who is reached and who replies, not from the size of a stratum.',
        },
        solution: '50 × 0.3 = 15 completes; with p = 0.5 and the finite population correction the margin is about 1.96 × √(0.25 ÷ 15) × √(135 ÷ 149) ≈ ±24 points. Enough to include them in the whole, not to describe them alone.',
      },
    ],
  },
  {
    id: 'm04-sm-g2', type: 'formula', kind: 'numerical',
    prompt: 'Pennyholt Bakeries (fictional) will survey its loyalty members, stratified by the shop they use. B2:B5 hold the members at each shop, B6 the total and B8 the sample size. In C2, calculate the Mill Lane shop’s proportional (unrounded) share of the sample, so that the formula can be filled down to C5.',
    sheet: { cells: penCells(false), vary: { B8: [300, 500] } },
    cell: 'C2', fill: 'C2:C5', answer: '=$B$8*B2/$B$6',
    alt: ['=$B$8*B2/SUM($B$2:$B$5)', '=B2/$B$6*$B$8', '=B2*$B$8/$B$6', '=$B$8*(B2/$B$6)', '=B2/SUM($B$2:$B$5)*$B$8'],
    view: 'A1:C8', formats: { C: '0.0', B: '#,##0' }, widths: { A: 14, B: 13, C: 20 },
    wrong: [
      { formula: '=B8*B2/B6', say: 'Right for C2, but without $ signs the references to B8 and B6 move when you fill down (C3 would read B9 and B7). Fix them: <x>=$B$8*B2/$B$6</x>.' },
      { formula: '=$B$8/4', say: 'That splits the sample equally among the shops. Proportional allocation gives each shop its share of the members.' },
      { formula: '=B2/$B$6', say: 'That is the shop’s share of the members. Multiply it by the sample size in B8.' },
    ],
    hints: ['n_h = n × N_h ÷ N. The sample size and the total must stay put when you fill down.', '<x>=$B$8*B2/$B$6</x>'],
    solution: '<x>=$B$8*B2/$B$6</x>: Mill Lane 400 × 3,200 ÷ 8,000 = 160, then 105, 75 and 60. These add to 400 without rounding; when they don’t, round by largest remainder so that the parts still add to n.',
  },
  {
    id: 'm04-sm-g3', type: 'num', kind: 'numerical',
    prompt: `Marrowby Buses (fictional) has ${MB.N.map((v) => v.toLocaleString('en-US')).join(', ').replace(/, ([^,]*)$/, ' and $1')} adult, concession and student smartcards. It surveys ${MB.n.join(', ').replace(/, ([^,]*)$/, ' and $1')} randomly chosen cardholders in the three groups (all reply), and ${MB.x.join(', ').replace(/, ([^,]*)$/, ' and $1')} would pay for on-board Wi-Fi. Estimate the share of all cardholders who would pay. Give a percentage to one decimal place.`,
    answer: Math.round(MB_EST.p * 1000) / 10, check: () => (18000 * (60 / 300) + 6000 * (30 / 300) + 1000 * (110 / 200)) / 25000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 200 / 800 * 100, say: 'That pools the 800 replies. Students were sampled at 20% and adults at under 2%, so pooling lets the keen students count twelve times over. Weight each group’s share by its size.' },
      { value: Math.round((0.2 + 0.1 + 0.55) / 3 * 1000) / 10, say: 'That averages the three groups’ shares as if they were equally large. Weight each by its share of the 25,000 cardholders.' },
    ],
    hints: ['Find each group’s share (60 ÷ 300 and so on), then weight it by N_h ÷ N.', '(18,000 × 0.20 + 6,000 × 0.10 + 1,000 × 0.55) ÷ 25,000'],
    solution: `Shares: 0.20, 0.10, 0.55. Weights: 0.72, 0.24, 0.04. Estimate: 0.72 × 0.20 + 0.24 × 0.10 + 0.04 × 0.55 = 0.144 + 0.024 + 0.022 = ${MB_EST.p.toFixed(3)}, so ${pc(MB_EST.p)}. The pooled 25% overstates it because students, the keenest group, are oversampled.`,
  },
  {
    id: 'm04-sm-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Tamberlake Gyms (fictional) wants 50 men and 50 women from each of its six gyms. Plan A: staff hand questionnaires to members as they arrive until each quota is full. Plan B: draw 50 men and 50 women at random from each gym’s membership list and e-mail them. Which statement is correct?',
    options: [
      'Only plan B is a probability sample; in plan A, staff and timing decide who is asked.',
      'Both are stratified samples, because both fix how many men and women come from each gym.',
      'Plan A is the better design, because questionnaires handed over in person get more replies.',
      'Plan B is a quota sample, because it sets a fixed number of men and of women for every gym.',
    ],
    answer: 0,
    hints: ['Fixing numbers per group is common to both. What differs is how people are chosen within each group.'],
    feedback: {
      1: 'Fixed numbers per group are common to both. A stratified sample also draws at random within each group; plan A lets staff and timing decide.',
      2: 'Plan A may well get more replies, but from members who come in at the times staff hand out questionnaires: regulars, not the members who rarely visit, whose views may matter most.',
      3: 'A quota sample lets the fieldworker choose within each quota. Plan B draws at random from a list within each group, which makes it stratified.',
    },
    solution: 'Plan B draws at random within each gym-and-sex stratum, so every member has a known chance of selection: a stratified probability sample. Plan A fills quotas with whoever arrives, so frequent visitors are far likelier to be included and the chances are unknown.',
  },
];

export const independent = [
  {
    id: 'm04-sm-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Name the design each researcher used.',
    items: [
      'Number every member on the list, then let a random-number generator pick 400 of them.',
      'Pick a random start from 1 to 20, then take every 20th name on the alphabetical list.',
      'Split the members by tier and draw a random sample within each tier.',
      'Choose 12 of the chain’s 60 stores at random and survey every customer in them on one Saturday.',
      'Choose 10 towns at random, then 3 stores in each chosen town, then every 10th customer passing at randomly chosen times in each store.',
      'Interviewers stop shoppers until they have 40 people under 35 and 40 aged 35 or over.',
      'Each owner of a vintage scooter who is interviewed passes the survey on to other owners they know.',
      'A banner on a recipe website invites visitors to take a five-minute survey for a prize draw.',
    ],
    categories: ['Simple random', 'Systematic', 'Stratified', 'Cluster', 'Multistage', 'Quota', 'Snowball', 'River (opt-in)'],
    answer: [0, 1, 2, 3, 4, 5, 6, 7],
    feedback: {
      3: 'Whole stores are chosen and everyone in them surveyed: a cluster sample.',
      4: 'Random selection at three stages (towns, stores, customers): multistage.',
      5: 'Fixed numbers per age group, filled by whoever interviewers stop: quota, not stratified.',
      7: 'Recruited through an invitation on a website: a river sample, self-selected.',
    },
    solution: 'Random pick from a list: simple random. Random start and every kth: systematic. Random within each tier: stratified. Whole stores: cluster. Towns, stores, customers: multistage. Fixed numbers filled by interviewers: quota. Referrals: snowball. Website banner: river (opt-in).',
  },
  {
    id: 'm04-sm-i2', type: 'formula', kind: 'numerical',
    prompt: 'Pennyholt Bakeries’ (fictional) follow-up survey sampled different numbers at each shop. B2:B5 hold the members at each shop, C2:C5 the members sampled and D2:D5 how many would join a bread club. In F2, calculate the stratified estimate of the share of all members who would join, in one formula with SUMPRODUCT.',
    sheet: { cells: penCells(true) },
    cell: 'F2', answer: '=SUMPRODUCT(B2:B5,D2:D5/C2:C5)/SUM(B2:B5)', require: ['SUMPRODUCT'],
    alt: ['=SUMPRODUCT(B2:B5,D2:D5/C2:C5)/B6', '=SUMPRODUCT(B2:B5/B6,D2:D5/C2:C5)', '=SUMPRODUCT(B2:B5/SUM(B2:B5),D2:D5/C2:C5)', '=SUMPRODUCT(D2:D5/C2:C5,B2:B5)/SUM(B2:B5)'],
    view: 'A1:F6', formats: { F2: '0.0%', B: '#,##0' }, widths: { A: 14, B: 13, C: 12, D: 20, E: 18, F: 10 },
    wrong: [
      { formula: '=SUM(D2:D5)/SUM(C2:C5)', say: 'That pools the replies. The shops were sampled at different rates (Mill Lane about 3%, Westgate 5%), so each stratum’s share must be weighted by its members, not its sample.' },
      { formula: '=SUMPRODUCT(C2:C5,D2:D5/C2:C5)/SUM(C2:C5)', say: 'Weighting by the sample sizes gives back the pooled share. The weights are the members at each shop, B2:B5.' },
      { formula: '=SUMPRODUCT(B2:B5,D2:D5)/SUM(B2:B5)', say: 'D holds counts, not shares. Divide each by its sample size first: D2:D5/C2:C5.' },
    ],
    solution: `<x>=SUMPRODUCT(B2:B5,D2:D5/C2:C5)/SUM(B2:B5)</x>: shares 0.380, 0.525, 0.417 and 0.633, weighted by 3,200, 2,100, 1,500 and 1,200 members, give ${pc(PEN_EST.p)}. The pooled share, 143 ÷ 300 = ${pc(143 / 300)}, over-represents the smaller shops, which were sampled at higher rates.`,
  },
  {
    id: 'm04-sm-i3', type: 'num', kind: 'applied',
    prompt: 'Saltreed Festival (fictional) has 600 volunteers and wants the share who would return to within ±8 points at 95% confidence, planning with p = 0.5 and the finite population correction. It expects 40% of those invited to reply. How many volunteers should it invite? Round the completes up, then the invitations up.',
    answer: Math.ceil(volN / VOL.r - 1e-9), check: () => { const n0 = I.normInv(0.975) ** 2 * 0.25 / 0.0064; return Math.ceil(Math.ceil(n0 / (1 + (n0 - 1) / 600) - 1e-9) / 0.4 - 1e-9); }, unit: 'volunteers', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(Math.ceil(volN0 - 1e-9) / VOL.r - 1e-9), say: 'That skips the finite population correction. With 600 volunteers, a sample of 150 is a quarter of them: n = n₀ ÷ (1 + (n₀ − 1) ÷ N) = 121 completes.' },
      { value: volN, say: 'That is the number of completes. Divide by the 40% response rate for the invitations.' },
      { value: Math.ceil(volN0 / (1 + (volN0 - 1) / VOL.N) / VOL.r - 1e-9), say: 'Round the completes up to 121 first: 121 ÷ 0.4 = 302.5, so 303.' },
    ],
    solution: `n₀ = 1.96² × 0.25 ÷ 0.08² = ${volN0.toFixed(1)}; with the correction n = ${volN0.toFixed(1)} ÷ (1 + ${(volN0 - 1).toFixed(1)} ÷ 600) = ${(volN0 / (1 + (volN0 - 1) / 600)).toFixed(1)}, so ${volN} completes; ${volN} ÷ 0.4 = ${(volN / 0.4).toFixed(1)}, so ${Math.ceil(volN / VOL.r - 1e-9)} invitations, half of all volunteers.`,
  },
  {
    id: 'm04-sm-i4', type: 'num', kind: 'numerical',
    prompt: `Brindlecombe Garden Centre (fictional) surveys every visitor in ${HR.hours} randomly chosen opening hours, about ${HR.per} visitors an hour, ${hrN} in all. Visitors in the same hour tend to answer alike: the intraclass correlation is ${HR.rho}. What is the effective sample size? Give a whole number.`,
    answer: Math.round(hrN / hrDeff), check: () => 480 / (1 + 15 * 0.06), unit: 'visitors', places: 0, tol: 0.6,
    wrong: [
      { value: Math.round(hrN / (1 + HR.per * HR.rho)), say: 'The design effect is 1 + (b − 1)ρ, with b − 1 = 15, not b = 16.' },
      { value: hrN, say: 'That ignores the clustering. Visitors in the same hour resemble each other, so the 480 are worth fewer independent visitors: divide by the design effect.' },
      { value: Math.round(hrN * hrDeff), say: 'Divide by the design effect, don’t multiply: clustering reduces the information.' },
    ],
    solution: `deff = 1 + (16 − 1) × 0.06 = ${hrDeff.toFixed(2)}; n_eff = 480 ÷ ${hrDeff.toFixed(2)} = ${(hrN / hrDeff).toFixed(1)}, about ${Math.round(hrN / hrDeff)}: the hours sampled carry the precision of about ${Math.round(hrN / hrDeff)} separately chosen visitors.`,
  },
  {
    id: 'm04-sm-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Orrinsby Software (fictional) has 8,000 Free, 1,600 Pro and 400 Enterprise customers. It expects between 40% and 60% of every plan to want a new feature, and its analyst proposes Neyman allocation for a sample of 500. What will that give, compared with proportional allocation (400, 80, 20)?',
    options: [
      'Almost the same as proportional, since √(p(1 − p)) is 0.49 to 0.50 in every plan.',
      'Far more Enterprise customers, since Neyman allocation always favours the smallest stratum.',
      'About 167 from each plan, since Neyman allocation gives every stratum an equal share.',
      'About 480 Free customers, since Neyman allocation always favours the largest stratum.',
    ],
    answer: 0,
    feedback: {
      1: 'Neyman allocation favours strata that are large or variable. Enterprise is the smallest, and no more variable than the rest here.',
      2: 'Equal shares would be a different (and here wasteful) allocation. Neyman allocation is proportional to N_h × S_h.',
      3: 'Size matters, but in proportion: with equal S_h, Neyman allocation is exactly proportional, 400 Free.',
    },
    solution: 'n_h ∝ N_h × S_h, with S_h = √(p_h(1 − p_h)). Between p = 0.4 and 0.6, S_h runs from 0.49 to 0.50, so the allocation is almost exactly proportional. Neyman allocation departs from proportional only when strata differ a lot in spread, such as shares near 10% in one plan and 60% in another.',
  },
  {
    id: 'm04-sm-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about non-probability samples that are correct.',
    options: [
      'Members of an opt-in panel chose to join it, so the chance that any given person is in a sample from it is unknown.',
      'A river sample recruits respondents through invitations placed on websites.',
      'A snowball sample gives every member of a hard-to-reach group the same chance of selection.',
      'An opt-in panel sample of 5,000 has a margin of error of about ±1.4 points, like a random sample.',
      'Weighting an opt-in sample to the population’s age and sex makes it into a probability sample.',
      'A quota sample matches the population on every characteristic, not just the quota characteristics.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'A snowball sample reaches people through contacts, so people with many contacts, or close to the starting participants, are far likelier to be included.',
      3: 'The margin-of-error formula assumes known selection chances. Treating such a sample as a simple random sample assumes, in the AAPOR task force’s word, that how people came to be in it is ‘ignorable’.',
      4: 'Weighting can bring the sample’s age and sex into line, but selection chances stay unknown; any bias in other characteristics remains.',
      5: 'Quotas match only the quota traits. Within each quota, whoever the interviewer found fills it.',
    },
    solution: 'Opt-in panels are self-selected and river samples recruit through website invitations. Snowball samples favour well-connected people, no non-probability sample supports a margin of error as it stands, weighting doesn’t make one a probability sample, and quotas match only the traits they set.',
  },
];

export const check = [
  {
    id: 'm04-sm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which feature makes a sample a probability sample, and so lets a margin of error be calculated for it?',
    options: [
      'A random mechanism gave every unit on the frame a known chance of selection above zero.',
      'The sample matches the population’s mix of ages, sexes and regions to the nearest person.',
      'The sample is large enough to make the margin of error smaller than five points.',
      'Everyone who wanted to take part, whoever they were, was allowed to answer the survey.',
    ],
    answer: 0,
    feedback: {
      1: 'A quota sample can match on chosen traits and still be a non-probability sample: within the quotas, selection chances are unknown.',
      2: 'Size reduces sampling error only once selection is random; a large self-selected sample is still a non-probability sample.',
      3: 'Letting anyone answer gives a self-selected sample: those who choose to take part decide its make-up.',
    },
    solution: 'Known, non-zero selection chances set by a random mechanism are what make the sampling distribution, and so the standard error, apply. Matching on some traits, size and openness to all comers don’t provide them.',
  },
  {
    id: 'm04-sm-k2', type: 'num', kind: 'numerical',
    prompt: 'Saltreed Festival (fictional) sold 9,000 weekend and 3,000 day tickets. It surveys 300 weekend and 200 day ticket holders at random (all reply); 240 and 110 say they will come back next year. Estimate the share of all ticket holders who will come back. Give a percentage to one decimal place.',
    answer: TIX_EST.p * 100, check: () => (9000 * (240 / 300) + 3000 * (110 / 200)) / 12000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: tixPool * 100, say: 'That pools the 500 replies. Day tickets were sampled at a higher rate (6.7% against 3.3%), so pooling overweights them. Weight each group by its share of the 12,000 tickets.' },
      { value: (0.8 + 0.55) / 2 * 100, say: 'That averages the two groups as if they were the same size. Weekend tickets are three-quarters of the total.' },
    ],
    solution: `Weekend 240 ÷ 300 = 0.80; day 110 ÷ 200 = 0.55. Weights 9,000 ÷ 12,000 = 0.75 and 0.25. Estimate 0.75 × 0.80 + 0.25 × 0.55 = 0.6 + 0.1375 = ${TIX_EST.p.toFixed(4)}, so 73.75% (73.8% to one decimal place).`,
  },
  {
    id: 'm04-sm-k3', type: 'num', kind: 'numerical',
    prompt: 'For Saltreed’s estimate (weekend: 9,000 tickets, 300 sampled, 240 yes; day: 3,000 tickets, 200 sampled, 110 yes), calculate the standard error of the stratified estimate, using SE = √(Σ W_h² (1 − n_h ÷ N_h) p̂_h(1 − p̂_h) ÷ (n_h − 1)). Give it in percentage points to two decimal places.',
    answer: Math.round(TIX_EST.se * 10000) / 100, check: () => 100 * Math.sqrt(0.75 ** 2 * (1 - 300 / 9000) * 0.8 * 0.2 / 299 + 0.25 ** 2 * (1 - 200 / 3000) * 0.55 * 0.45 / 199), unit: 'points', places: 2, tol: 0.012,
    wrong: [
      { value: Math.round(tixNoFpc * 10000) / 100, say: 'That leaves out the finite population correction, 1 − n_h ÷ N_h (0.967 and 0.933 here).' },
      { value: Math.round(Math.sqrt(tixPool * (1 - tixPool) / 500) * 10000) / 100, say: 'That treats the 500 replies as one simple random sample with the pooled share. Add the strata’s variances, each weighted by W_h².' },
      { value: Math.round(Math.sqrt(0.75 * (1 - 300 / 9000) * 0.16 / 299 + 0.25 * (1 - 200 / 3000) * 0.2475 / 199) * 10000) / 100, say: 'Each stratum’s term is weighted by W_h squared (0.5625 and 0.0625), not by W_h.' },
    ],
    solution: `Weekend: 0.75² × (1 − 300 ÷ 9,000) × 0.80 × 0.20 ÷ 299 = ${(0.5625 * (1 - 300 / 9000) * 0.16 / 299).toFixed(7)}. Day: 0.25² × (1 − 200 ÷ 3,000) × 0.55 × 0.45 ÷ 199 = ${(0.0625 * (1 - 200 / 3000) * 0.2475 / 199).toFixed(7)}. SE = √${(0.5625 * (1 - 300 / 9000) * 0.16 / 299 + 0.0625 * (1 - 200 / 3000) * 0.2475 / 199).toFixed(7)} = ${TIX_EST.se.toFixed(4)}, about ${(TIX_EST.se * 100).toFixed(2)} points, so the 95% margin is about ±${(TIX_EST.margin * 100).toFixed(1)} points.`,
  },
  {
    id: 'm04-sm-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to know what share of Harbour City’s ready-to-drink coffee buyers would try Lantern Cold Brew. Why can’t the February survey of her mailing list tell her?',
    options: [
      'Its frame holds only people who already know Lantern, so most of the city’s buyers could never be chosen.',
      'Its sample is too small: 516 completes can’t estimate a share in a city with millions of cans sold a year.',
      'It was stratified, and a stratified sample can only describe the strata, never a whole population.',
      'Its questionnaire used a purchase-intent scale, and such scales can’t be used outside a test market.',
    ],
    answer: 0,
    feedback: {
      1: 'The size of a sample needed doesn’t depend on the size of the population once that is large; 516 random replies from the right frame would do. The problem is the frame.',
      2: 'A stratified estimate describes the whole population the frame covers, by weighting the strata. Here the frame itself covers the wrong population.',
      3: 'Stated intentions have their own problems (see Survey error), but intent scales are used in ordinary surveys. The more basic problem is who could be asked.',
    },
    solution: 'The target population is Harbour City’s ready-to-drink buyers; the frame is people on Lantern’s list, a small and friendly slice of them. That undercoverage is fixed before sampling and no sample size or weighting fixes it. The survey describes Lantern’s contacts; the market is sized from other sources in module 3.',
  },
  {
    id: 'm04-sm-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each sample as a probability or a non-probability sample.',
    items: [
      'Every 25th booking from a random start in a hotel’s booking list',
      'The first 200 people who answer a link posted on a brand’s social media page',
      'Twenty branches chosen at random, then 15 customers chosen at random in each',
      'Interviewers fill quotas of 100 men and 100 women outside a station',
      'Members of an online panel who accepted an invitation to the survey',
      'A random sample of 50 accounts from each of a bank’s four regions',
    ],
    categories: ['Probability sample', 'Non-probability sample'],
    answer: [0, 1, 0, 1, 1, 0],
    feedback: {
      1: 'Whoever chooses to answer a posted link is self-selected.',
      3: 'Quotas fix the numbers, but interviewers choose who fills them.',
      4: 'An opt-in panel is made of volunteers; inviting some of them at random doesn’t give the population known chances.',
    },
    solution: 'Systematic, multistage and stratified random samples are probability samples. A posted link, interviewer quotas and an opt-in panel are not: in each, who ends up in the sample depends on choices whose probabilities are unknown.',
  },
  {
    id: 'm04-sm-k6', type: 'formula', kind: 'applied',
    prompt: 'B2:B5 hold the size of each of Lantern’s four strata, C2:C5 the completes expected at a 30% response, and B7 the completes n₀ that a large population would need for a margin of ±10 points at 95%. In D2, calculate the completes the subscriber stratum needs for that margin with the finite population correction, n = n₀ ÷ (1 + (n₀ − 1) ÷ N), so that the formula can be filled down to D5.',
    sheet: { cells: needCells, vary: { B7: [150.06, 384.16] } },
    cell: 'D2', fill: 'D2:D5', answer: '=$B$7/(1+($B$7-1)/B2)',
    alt: ['=$B$7*B2/(B2+$B$7-1)', '=1/(1/$B$7+($B$7-1)/($B$7*B2))'],
    view: 'A1:D7', formats: { D: '0.0', B: '#,##0', C: '0.0', B7: '0.00' }, widths: { A: 20, B: 13, C: 17, D: 16 },
    wrong: [
      { formula: '=$B$7', say: 'That leaves out the finite population correction, which matters most in the small strata: the workshop stratum has only 150 people.' },
      { formula: '=$B$7/(1+$B$7/B2)', say: 'The correction divides by 1 + (n₀ − 1) ÷ N, not 1 + n₀ ÷ N.' },
      { formula: '=B7/(1+(B7-1)/B2)', say: 'Right in D2, but B7 moves when the formula is filled down. Fix it with $ signs: $B$7.' },
    ],
    solution: `<x>=$B$7/(1+($B$7-1)/B2)</x>: ${STRATA.map((nm, h) => `${nm.toLowerCase()} ${needF(96.04, SIZES[h]).toFixed(1)}`).join(', ')}, so ${STRATA.map((nm, h) => Math.ceil(needF(96.04, SIZES[h]) - 1e-9)).join(', ')} completes after rounding up. Against the expected ${STRATA.map((nm, h) => (Math.round(A[h] * RR * 10) / 10).toFixed(1)).join(', ')}, only the shop-customer and newsletter-only strata reach ±10 points; the workshop stratum would need more completes than a 30% response from all 150 could give.`,
  },
];
