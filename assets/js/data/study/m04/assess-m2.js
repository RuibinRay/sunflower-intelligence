// assess-m2.js — M04 module 2 test: Surveys and samples (questionnaire-design, sampling-methods, survey-error).
// New questions on new businesses (Corvane Bike Share, Ellmoor Museum and Tessaly Theatre are fictional), with angles the
// lessons don't drill: rewriting a loaded question, naming effects from evidence, Neyman allocation in Excel, inferring an
// intraclass correlation, the margin a fixed budget buys, RR2 with ineligible cases in Excel, and comparing biases.
// No hints; solutions are shown when the student reviews the test. Every num item's `check` recomputes its answer.
import * as I from '../../../core/inference.js?v=13';

const Z = I.normInv(0.975);
// Corvane Bike Share (fictional): riders by plan, planning SDs of trip length (minutes)
const CV = { plans: ['Annual', 'Monthly', 'Pay as you go', 'Day pass'], N: [3000, 4000, 12000, 1000], S: [12, 18, 30, 45], n: 600 };
const cvCells = { A1: 'Plan', B1: 'Riders (N)', C1: 'SD of trip length (min)', D1: 'Neyman allocation', A6: 'Total', B6: '=SUM(B2:B5)', A8: 'Sample size', B8: CV.n };
CV.plans.forEach((p, i) => Object.assign(cvCells, { [`A${i + 2}`]: p, [`B${i + 2}`]: CV.N[i], [`C${i + 2}`]: CV.S[i] }));
const cvNS = CV.N.map((k, i) => k * CV.S[i]), cvAlloc = cvNS.map((v) => CV.n * v / cvNS.reduce((a, b) => a + b, 0));
// Corvane weighting
const CW = { N: [3000, 12000], n: [150, 150], x: [90, 45] };
const cwW = CW.N.map((k, i) => k / CW.n[i]);
const cwEst = CW.N.reduce((a, k, i) => a + k * CW.x[i] / CW.n[i], 0) / 15000;
const cwNeff = (cwW[0] * 150 + cwW[1] * 150) ** 2 / (150 * cwW[0] ** 2 + 150 * cwW[1] ** 2);
// Ellmoor Museum (fictional): members, a fixed invitation budget
const EM = { N: 900, inv: 500, r: 0.35 };
const emN = EM.inv * EM.r, emMoe = Z * Math.sqrt(0.25 / emN) * Math.sqrt((EM.N - emN) / (EM.N - 1));
// Tessaly Theatre (fictional): dispositions
const TT = { I: 410, P: 62, R: 38, NC: 74, U: 1376, NE: 40 };
const ttCells = { A1: 'Disposition', B1: 'Cases', A2: 'Complete', B2: TT.I, A3: 'Partial', B3: TT.P, A4: 'Refusal or break-off', B4: TT.R, A5: 'Non-contact (bounced)', B5: TT.NC, A6: 'No reply', B6: TT.U, A7: 'Not eligible', B7: TT.NE, A9: 'Target RR1', B9: 0.3, A10: 'Extra completes needed' };
const ttEl = TT.I + TT.P + TT.R + TT.NC + TT.U, ttExtra = 0.3 * ttEl - TT.I;

export const items = [
  // ---------------------------------------------------------------- questionnaire-design
  {
    id: 'm04-m2-1', lesson: 'questionnaire-design', type: 'mc', kind: 'applied',
    prompt: 'Corvane Bike Share (fictional) launched a new app and drafted the question “How much time has our new app saved you?”. Which replacement best removes the problem while still serving the aim of learning whether the app made renting quicker?',
    options: [
      '“Compared with the old app, is renting now quicker, about the same or slower?”',
      '“How much time each week has our new, faster app saved you when renting a bike?”',
      '“Don’t you agree that the new app makes it quicker to rent one of our bikes?”',
      '“How satisfied are you with the speed and the design of our new rental app?”',
    ],
    answer: 0,
    feedback: {
      1: 'Adding “faster” makes the assumption explicit: it is more loaded, not less. Riders who find the app slower still can’t answer.',
      2: '“Don’t you agree” is leading, and agree/disagree invites acquiescence.',
      3: 'Speed and design are two things in one question, and satisfaction is a different measure from whether renting got quicker.',
    },
    solution: 'The draft is loaded: it assumes the app saved time. A balanced comparison (quicker, about the same, slower) lets every rider answer and still measures the aim. The other versions add an assumption, lead, or ask about two things at once.',
  },
  {
    id: 'm04-m2-2', lesson: 'questionnaire-design', type: 'classify', kind: 'conceptual',
    prompt: 'Each finding comes from a survey test. Name the effect it shows.',
    items: [
      'In a phone survey, the last of six reasons read out is chosen far more often than in the web version of the same question.',
      'Many members agree both that the gym is “never crowded” and that it is “often too crowded”.',
      'More visitors say they returned their reusable cup when an interviewer asks than when they fill in a web form.',
      'Ratings of overall service fall when the question follows one about the respondent’s most recent complaint.',
      'On a web form, the first sponsor in an unordered list is picked twice as often as when it appears last.',
    ],
    categories: ['Recency effect', 'Acquiescence', 'Social desirability bias', 'Order effect (question order)', 'Primacy effect'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'Options heard last gain in oral modes: recency.',
      1: 'Agreeing with two opposite statements is agreement regardless of content: acquiescence.',
      2: 'The flattering answer is more common in front of an interviewer: social desirability.',
      3: 'An earlier question provides the context for a later one: a question-order effect.',
      4: 'Options read first gain on screen: primacy.',
    },
    solution: 'Heard last: recency. Agreeing with opposites: acquiescence. Better behaviour reported to an interviewer: social desirability. A complaint question colouring overall ratings: question order. First on screen: primacy.',
  },
  {
    id: 'm04-m2-3', lesson: 'questionnaire-design', type: 'multi', kind: 'applied',
    prompt: 'Ellmoor Museum’s (fictional) draft asks: “How many times have you visited museums? 1–2 / 2–5 / 5–10 / More than 10”. Which changes fix its problems? Select all that apply.',
    options: [
      'State a period, such as “in the last 12 months”.',
      'Make the bands meet without overlapping: 1–2, 3–5, 6–10, 11 or more.',
      'Add “None” as an option, so that the list covers every answer.',
      'Add “Other (please specify)” to catch any answers the bands might miss.',
      'Reword it as “You don’t visit museums very often, do you?” to reduce pressure.',
      'Replace the numbers with “Rarely / Sometimes / Often”, which are easier to answer.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'With “None” added and bands that meet, the list is already exhaustive; “Other” boxes are rarely used and can’t fix overlapping bands.',
      4: 'That is a leading question, and it invites agreement.',
      5: 'Vague quantifiers mean different things to different people and lose the counts the museum could use.',
    },
    solution: 'The draft has no recall period, overlapping bands (2, 5 and 10 each fit two boxes) and no box for people who haven’t visited. A stated period, bands that meet and a “None” option fix all three. “Other”, a leading rewording and vague quantifiers don’t.',
  },
  // ---------------------------------------------------------------- sampling-methods
  {
    id: 'm04-m2-4', lesson: 'sampling-methods', type: 'formula', kind: 'numerical',
    prompt: 'Corvane Bike Share (fictional) will survey riders about trip length, stratified by plan. B2:B5 hold the riders on each plan, C2:C5 a planning standard deviation of trip length for each plan, and B8 the total sample size. In D2, calculate the annual plan’s Neyman allocation (unrounded), so that the formula can be filled down to D5.',
    sheet: { cells: cvCells, vary: { B8: [400, 800] } },
    cell: 'D2', fill: 'D2:D5', answer: '=$B$8*B2*C2/SUMPRODUCT($B$2:$B$5,$C$2:$C$5)',
    alt: ['=$B$8*(B2*C2)/SUMPRODUCT($B$2:$B$5,$C$2:$C$5)', '=B2*C2/SUMPRODUCT($B$2:$B$5,$C$2:$C$5)*$B$8', '=$B$8*B2*C2/SUMPRODUCT($B$2:$B$5*$C$2:$C$5)', '=B2*C2*$B$8/SUMPRODUCT($B$2:$B$5,$C$2:$C$5)'],
    view: 'A1:D8', formats: { D: '0.0', B: '#,##0' }, widths: { A: 14, B: 11, C: 22, D: 17 },
    wrong: [
      { formula: '=$B$8*B2/$B$6', say: 'That is proportional allocation. Neyman allocation also weights each plan by its standard deviation: n × N_h S_h ÷ Σ N_k S_k.' },
      { formula: '=$B$8*B2*C2/SUMPRODUCT(B2:B5,C2:C5)', say: 'Right in D2, but the SUMPRODUCT ranges move when filled down. Fix them with $ signs.' },
      { formula: '=$B$8*C2/SUM($C$2:$C$5)', say: 'That allocates by spread alone. A large plan with the same spread as a small one needs more of the sample: use N_h × S_h.' },
    ],
    solution: `<x>=$B$8*B2*C2/SUMPRODUCT($B$2:$B$5,$C$2:$C$5)</x>: N_h × S_h = ${cvNS.map((v) => v.toLocaleString('en-US')).join(', ')}, total ${cvNS.reduce((a, b) => a + b, 0).toLocaleString('en-US')}; with 600, the allocation is ${cvAlloc.map((v) => v.toFixed(1)).join(', ')}. Pay-as-you-go riders, numerous and variable, get most of the sample; day-pass riders get more than their 5% share because their trips vary most.`,
  },
  {
    id: 'm04-m2-5', lesson: 'sampling-methods', type: 'num', kind: 'numerical',
    prompt: 'Tessaly Theatre (fictional) surveys every member of 40 randomly chosen audiences of 20 people for a post-show study: 800 people. From past studies it expects the 800 to be worth only about 400 independently chosen audience members. What intraclass correlation does that imply? Give three decimal places.',
    answer: Math.round((800 / 400 - 1) / (20 - 1) * 1000) / 1000, check: () => (800 / 400 - 1) / 19, unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: (800 / 400 - 1) / 20, say: 'The design effect is 1 + (b − 1)ρ, so divide by b − 1 = 19, not by 20.' },
      { value: (800 / 400) / 20, say: 'Subtract 1 from the design effect first: ρ = (deff − 1) ÷ (b − 1).' },
    ],
    solution: 'deff = n ÷ n_eff = 800 ÷ 400 = 2. From deff = 1 + (b − 1)ρ: ρ = (2 − 1) ÷ (20 − 1) = 0.053. A correlation that small doubles the variance because each audience contributes 20 people.',
  },
  {
    id: 'm04-m2-6', lesson: 'sampling-methods', type: 'mc', kind: 'conceptual',
    prompt: 'Corvane Bike Share (fictional) has a list of its 300 docking stations but no list of the people who ride (many pay by card without an account). Which design gives it a probability sample of riders?',
    options: [
      'Choose stations at random, then at randomly chosen times interview every rider (or every kth) who docks at each chosen station.',
      'Draw a simple random sample of riders, then contact each of them through the rental app.',
      'Fill quotas of riders by age and sex at the twenty busiest stations during the morning rush hour.',
      'Put an open link on every station’s screen inviting any rider to take part in the survey.',
    ],
    answer: 0,
    feedback: {
      1: 'A simple random sample needs a list of riders, which Corvane doesn’t have, and many riders don’t use the app.',
      2: 'Quotas filled by interviewers at chosen stations are a non-probability sample; the busiest stations and the rush hour aren’t chosen at random either.',
      3: 'An open link is self-selected: who answers depends on who chooses to.',
    },
    solution: 'With a list of stations but not of riders, a multistage design selects stations at random, then times at random within each, and takes every rider (or every kth) who docks at those times. That is a probability sample of trips; frequent riders have more chances, so each interview is weighted by how often that rider uses the stations. It is also clustered, so less precise than a simple random sample of the same size.',
  },
  {
    id: 'm04-m2-7', lesson: 'sampling-methods', type: 'num', kind: 'applied',
    prompt: `Ellmoor Museum (fictional) can afford to invite ${EM.inv} of its ${EM.N} members and expects ${EM.r * 100}% to reply. What margin of error, at 95% and for a share near 50%, should it expect for its members, using the finite population correction √((N − n) ÷ (N − 1))? Give percentage points to one decimal place.`,
    answer: Math.round(emMoe * 1000) / 10, check: () => 1.959964 * Math.sqrt(0.25 / 175) * Math.sqrt((900 - 175) / 899) * 100, unit: 'points', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round(Z * Math.sqrt(0.25 / emN) * 1000) / 10, say: 'That leaves out the finite population correction. 175 completes is nearly a fifth of the 900 members.' },
      { value: Math.round(Z * Math.sqrt(0.25 / EM.inv) * Math.sqrt((EM.N - EM.inv) / (EM.N - 1)) * 1000) / 10, say: 'The margin depends on completes, not invitations: 500 × 0.35 = 175.' },
    ],
    solution: `Completes: 500 × 0.35 = 175. Margin: 1.96 × √(0.25 ÷ 175) × √(725 ÷ 899) = ${(Z * Math.sqrt(0.25 / emN)).toFixed(4)} × ${Math.sqrt((EM.N - emN) / (EM.N - 1)).toFixed(4)} = ${emMoe.toFixed(4)}, about ±${(emMoe * 100).toFixed(1)} points, and only if non-respondents resemble respondents.`,
  },
  // ---------------------------------------------------------------- survey-error
  {
    id: 'm04-m2-8', lesson: 'survey-error', type: 'steps', kind: 'applied',
    prompt: `Corvane Bike Share (fictional) asked riders whether they would use electric bikes. It has ${CW.N[0].toLocaleString('en-US')} annual members and ${CW.N[1].toLocaleString('en-US')} pay-as-you-go riders; ${CW.n[0]} of each group replied, and ${CW.x[0]} annual members and ${CW.x[1]} pay-as-you-go riders said yes.`,
    solution: `Weights: 3,000 ÷ 150 = ${cwW[0]} and 12,000 ÷ 150 = ${cwW[1]}. Weighted share: (3,000 × 0.60 + 12,000 × 0.30) ÷ 15,000 = ${(cwEst * 100).toFixed(1)}%, against 135 ÷ 300 = 45% unweighted. n_eff = 15,000² ÷ (150 × ${cwW[0]}² + 150 × ${cwW[1]}²) = ${cwNeff.toFixed(1)}.`,
    steps: [
      {
        id: 'm04-m2-8-s1', type: 'num',
        prompt: 'What post-stratification weight does each pay-as-you-go respondent carry?',
        answer: cwW[1], check: () => 12000 / 150, unit: '', places: 0, tol: 0.5,
        wrong: [{ value: 150 / 12000, say: 'The weight is riders per respondent, N_h ÷ n_h, not the share who responded.' }, { value: 15000 / 300, say: 'That is the average weight for everyone. Each group gets its own N_h ÷ n_h.' }],
        solution: '12,000 ÷ 150 = 80 riders per respondent.',
      },
      {
        id: 'm04-m2-8-s2', type: 'num',
        prompt: 'Estimate the share of all riders who would use electric bikes, weighted to the two groups’ sizes. Give a percentage to one decimal place.',
        answer: Math.round(cwEst * 1000) / 10, check: () => (3000 * 90 / 150 + 12000 * 45 / 150) / 15000 * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [{ value: 135 / 300 * 100, say: 'That is the unweighted share: the two groups replied in equal numbers, but pay-as-you-go riders are four-fifths of riders.' }, { value: (0.6 + 0.3) / 2 * 100, say: 'Weight each group by its share of the 15,000 riders, not equally.' }],
        solution: '(3,000 × 0.60 + 12,000 × 0.30) ÷ 15,000 = 5,400 ÷ 15,000 = 36.0%.',
      },
      {
        id: 'm04-m2-8-s3', type: 'num',
        prompt: 'What is Kish’s effective sample size for the 300 respondents? Give a whole number.',
        answer: Math.round(cwNeff), check: () => 15000 ** 2 / (150 * 20 ** 2 + 150 * 80 ** 2), unit: 'respondents', places: 0, tol: 0.6,
        wrong: [{ value: 300, say: 'That ignores the unequal weights. n_eff = (Σw)² ÷ Σw².' }],
        solution: `Σw = 150 × 20 + 150 × 80 = 15,000; Σw² = 150 × 400 + 150 × 6,400 = 1,020,000; n_eff = 225,000,000 ÷ 1,020,000 = ${cwNeff.toFixed(1)}, about ${Math.round(cwNeff)}.`,
      },
    ],
  },
  {
    id: 'm04-m2-9', lesson: 'survey-error', type: 'formula', kind: 'numerical',
    prompt: 'Tessaly Theatre (fictional) e-mailed a survey to past ticket buyers. B2:B7 hold the final dispositions (the cases in B7 turned out not to be in the population) and B9 the RR1 the theatre had hoped for. In B10, calculate how many more completes would have lifted RR1 to that target, assuming the extra completes would have come from cases now counted as refusals, non-contacts or no reply, so that the number of eligible cases stays the same.',
    sheet: { cells: ttCells, vary: { B9: [0.25, 0.35] } },
    cell: 'B10', answer: '=B9*SUM(B2:B6)-B2',
    alt: ['=SUM(B2:B6)*B9-B2', '=B9*(SUM(B2:B7)-B7)-B2', '=B9*(B2+B3+B4+B5+B6)-B2'],
    view: 'A1:B10', formats: { B9: '0%', B10: '#,##0', B: '#,##0' }, widths: { A: 22, B: 9 },
    wrong: [
      { formula: '=B9*SUM(B2:B7)-B2', say: 'Cases that turn out not to be eligible are left out of RR1’s denominator: sum B2:B6 only.' },
      { formula: '=B9*SUM(B2:B6)', say: 'That is the total number of completes the target needs. Subtract the completes already in B2.' },
      { formula: '=B9*SUM(B2:B6)-B2-B3', say: 'Partials don’t count towards RR1, which has completes alone in its numerator; they would count towards RR2.' },
    ],
    solution: `<x>=B9*SUM(B2:B6)-B2</x>: eligible cases ${ttEl.toLocaleString('en-US')} (the ${TT.NE} ineligible excluded); 30% of them is ${(0.3 * ttEl).toLocaleString('en-US')} completes, against ${TT.I} achieved, so ${ttExtra.toFixed(0)} more. The current RR1 is ${TT.I} ÷ ${ttEl.toLocaleString('en-US')} = ${(TT.I / ttEl * 100).toFixed(1)}%.`,
  },
  {
    id: 'm04-m2-10', lesson: 'survey-error', type: 'mc', kind: 'conceptual',
    prompt: 'Survey A had a 70% response rate, and a follow-up found its non-respondents 30 points less satisfied than its respondents. Survey B had a 25% response rate, and its non-respondents were 4 points less satisfied. Which respondent figure is more biased, and by how much?',
    options: [
      'A’s, by about 9 points against B’s 3: bias is the non-response rate times the gap.',
      'B’s, because a 25% response rate always produces more bias than a 70% one.',
      'Neither: with a follow-up of non-respondents, both figures are free of non-response bias.',
      'A’s, by about 21 points against B’s 1: bias is the response rate times the respondent gap.',
    ],
    answer: 0,
    feedback: {
      1: 'B’s non-respondents are 75% of its sample but differ by only 4 points: 0.75 × 4 = 3. The response rate alone doesn’t decide which is worse.',
      2: 'The follow-up measures the gap; the respondents’ own figure is still biased by it. The fix is to combine the groups.',
      3: 'Multiply by the share who did not respond: A’s is 1 − 0.70 = 0.30, so 0.30 × 30 = 9.',
    },
    solution: 'Bias = (1 − RR) × (respondents − non-respondents). A: 0.30 × 30 = 9 points. B: 0.75 × 4 = 3 points. The survey with the much higher response rate has the more biased respondent figure, because its few non-respondents are very different.',
  },
  {
    id: 'm04-m2-11', lesson: 'survey-error', type: 'classify', kind: 'conceptual',
    prompt: 'Ellmoor Museum (fictional) knows how its 900 members split by age and by membership type. Which of these problems can post-stratification weighting to those totals correct?',
    items: [
      'Members aged under 35 are 30% of members but only 12% of respondents.',
      'Within every age group, members who rarely visit ignored the survey more often.',
      'Family memberships replied at twice the rate of individual memberships.',
      'The question “Don’t you agree our exhibitions are excellent?” pushed answers upwards.',
      'Respondents overstated how often they visit, compared with the museum’s ticket scans.',
    ],
    categories: ['Weighting can correct this', 'Weighting can’t correct this'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      1: 'Weighting by age can’t see who visits rarely within an age group; that bias stays unless visit frequency is weighted on too.',
      3: 'A leading question is measurement error: every respondent’s answer is pushed, and reweighting them doesn’t undo it.',
      4: 'Over-reporting is measurement error; weighting changes who counts how much, not what they said.',
    },
    solution: 'Weighting fixes imbalances on the weighting variables (age, membership type). It can’t fix differences within weighting groups (rare visitors missing in every age group) or measurement errors (a leading question, over-reported visits). The museum could weight on visit frequency from its ticket scans if it knows it for every member.',
  },
];
