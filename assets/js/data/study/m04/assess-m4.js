// assess-m4.js — M04 module 4 test: From data to insight (analysing-survey-data, insights-and-reporting). New scenarios
// and angles, not copies of lesson exercises: missing-value codes, sample size for an NPS margin, percentaging,
// a weighted mean, mean against median, findings and insights, stated against revealed preference, method disclosure,
// confidentiality in a small team and a truncated axis. Fenwold Buses, Glenmarrow Books and the other businesses are
// fictional. No hints; solutions show when the student reviews the test. Every num item's `check` recomputes its answer.
import { normInv } from '../../../core/inference.js?v=18';

const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const Z = normInv(0.975);

// Fenwold Buses (fictional): 40 riders' 0–10 ratings of their route, 99 = “don't know”
const ROUTE = Array.from({ length: 40 }, (_, i) => (i % 2 === 0 ? 'Express' : 'Local'));
const SCORE = [8, 7, 99, 9, 6, 10, 5, 8, 99, 7, 9, 4, 8, 6, 99, 10, 7, 3, 9, 8, 6, 99, 7, 9, 5, 8, 0, 2, 99, 7, 8, 6, 9, 7, 99, 8, 5, 9, 6, 7];
const busSheet = { cells: { A1: 'rider', B1: 'route type', C1: 'rating (0–10; 99 = don’t know)', ...col('A', 2, ROUTE.map((_, i) => i + 1)), ...col('B', 2, ROUTE), ...col('C', 2, SCORE), E1: 'route type', F1: 'Express', E2: 'mean rating' }, fixed: ['C2:C41'], vary: { F1: ['Local'], C2: [3, 9], C5: [2, 10] } };
const express = SCORE.filter((v, i) => ROUTE[i] === 'Express');
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const exMean = mean(express.filter((v) => v !== 99)), exWith99 = mean(express);
// Glenmarrow Books (fictional): planning a survey for an NPS margin of ±5 points
const PLAN = { pP: 0.5, pD: 0.2, E: 5 };
const nNeeded = (Z * 100) ** 2 * (PLAN.pP + PLAN.pD - (PLAN.pP - PLAN.pD) ** 2) / PLAN.E ** 2;
// a software firm (fictional): cancellations by plan
const SW = { basic: 1400, basicCancel: 182, pro: 600, proCancel: 30 };
// a music festival (fictional): spend by ticket type
const FEST = { types: ['Day', 'Weekend', 'Camping'], holders: [3000, 1800, 1200], respondents: [120, 210, 270], spend: [42, 95, 130] };
const festSheet = { cells: { A1: 'ticket type', B1: 'ticket holders (N)', C1: 'respondents (n)', D1: 'mean spend ($)', ...col('A', 2, FEST.types), ...col('B', 2, FEST.holders), ...col('C', 2, FEST.respondents), ...col('D', 2, FEST.spend), A6: 'mean spend, all ticket holders' } };
const festW = FEST.holders.reduce((s, N, i) => s + N * FEST.spend[i], 0) / FEST.holders.reduce((a, b) => a + b, 0);
const festU = FEST.respondents.reduce((s, n, i) => s + n * FEST.spend[i], 0) / FEST.respondents.reduce((a, b) => a + b, 0);

export const items = [
  // ---------------------------------------------------------------- analysing-survey-data
  {
    id: 'm04-m4-1', lesson: 'analysing-survey-data', type: 'formula', kind: 'numerical',
    prompt: 'Fenwold Buses (fictional) asked 40 riders to rate their route from 0 to 10; the survey tool stores “don’t know” as 99. F1 names a route type. In F2, calculate the mean rating given by riders on that route type, leaving out the “don’t know” answers.',
    sheet: busSheet, cell: 'F2',
    answer: '=AVERAGEIFS(C2:C41,B2:B41,F1,C2:C41,"<99")',
    alt: ['=AVERAGEIFS(C2:C41,B2:B41,F1,C2:C41,"<>99")', '=AVERAGEIFS(C2:C41,C2:C41,"<99",B2:B41,F1)', '=AVERAGE(FILTER(C2:C41,(B2:B41=F1)*(C2:C41<>99)))'],
    view: 'A1:F41', formats: { F2: '0.00' }, widths: { B: 11, C: 26, E: 12 }, maxHeight: '22rem',
    wrong: [
      { formula: '=AVERAGEIF(B2:B41,F1,C2:C41)', say: 'That averages the 99s with the real ratings, as if “don’t know” were a score of 99. Add a criterion that leaves them out: "<99".' },
      { formula: '=AVERAGEIFS(C2:C41,C2:C41,"<99")', say: 'That leaves out the 99s but averages every route type. Add the route-type criterion: B2:B41 equal to F1.' },
      { formula: '=AVERAGEIFS(C2:C41,B2:B41,F1,C2:C41,"<>0")', say: 'That drops the riders who gave 0, a real answer, and keeps the 99s. Exclude the code, not the zeros.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C41,B2:B41,F1,C2:C41,"<99")</x> ≈ ${exMean.toFixed(2)} for Express riders. Left in, the 99s would push the mean to ${exWith99.toFixed(2)}, a rating no one gave. The base is the ${express.filter((v) => v !== 99).length} Express riders who gave a rating; the report should also say how many answered “don’t know” (${express.filter((v) => v === 99).length}).`,
  },
  {
    id: 'm04-m4-2', lesson: 'analysing-survey-data', type: 'num', kind: 'numerical',
    prompt: 'Glenmarrow Books (fictional) is planning a customer survey and wants its Net Promoter Score to have a 95% margin of error of no more than ±5 points. From an earlier survey it expects about 50% promoters and 20% detractors. How many completed questionnaires does it need? Round up to a whole number.',
    answer: Math.ceil(nNeeded), check: () => Math.ceil((1.96 * 100) ** 2 * (0.5 + 0.2 - 0.3 ** 2) / 25), unit: 'completes', places: 0, tol: 1,
    wrong: [
      { value: Math.ceil((Z * 100) ** 2 * 0.5 * 0.5 / 25), say: 'That is the sample for the promoters’ share alone, p(1 − p) with p = 0.5. The NPS is a difference of two shares, with variance p_P + p_D − (p_P − p_D)².' },
      { value: Math.ceil((Z * 100) ** 2 * (0.5 + 0.2) / 25), say: 'You left out the squared term: the variance is p_P + p_D − (p_P − p_D)² = 0.70 − 0.09 = 0.61.' },
      { value: Math.ceil((Z * 100) ** 2 * 0.61 / 5), say: 'The margin must be squared: divide by 5² = 25, not by 5.' },
    ],
    solution: `From margin = 1.96 × 100 × √(v ÷ n), n = (1.96 × 100)² × v ÷ E², with v = 0.5 + 0.2 − 0.3² = 0.61 and E = 5: n = 38,416 × 0.61 ÷ 25 ≈ ${nNeeded.toFixed(1)}, so ${Math.ceil(nNeeded)} completes. At an expected response rate the invitations must be several times that, as in B04’s sample-size planning.`,
  },
  {
    id: 'm04-m4-3', lesson: 'analysing-survey-data', type: 'mc', kind: 'conceptual',
    prompt: `A software firm (fictional) asks whether its plan type explains cancellations. Of ${SW.basic.toLocaleString('en-US')} Basic customers, ${SW.basicCancel} cancelled last year; of ${SW.pro} Pro customers, ${SW.proCancel} did. Which figures answer the question?`,
    options: [
      `Within each plan: ${(SW.basicCancel / SW.basic * 100).toFixed(0)}% of Basic customers cancelled, against ${(SW.proCancel / SW.pro * 100).toFixed(0)}% of Pro customers`,
      `Within the cancellers: ${(SW.basicCancel / (SW.basicCancel + SW.proCancel) * 100).toFixed(0)}% of the customers who cancelled were on the Basic plan`,
      `Of all ${(SW.basic + SW.pro).toLocaleString('en-US')} customers: ${(SW.basicCancel / (SW.basic + SW.pro) * 100).toFixed(1)}% were Basic customers who cancelled during the year`,
      `The counts: ${SW.basicCancel} Basic customers cancelled, six times as many as the ${SW.proCancel} on Pro`,
    ],
    answer: 0,
    feedback: {
      1: 'That percentages the other way: it mostly reflects how many customers are on Basic. The question is about each plan’s rate.',
      2: 'A share of the grand total mixes the size of the plan with its cancellation rate.',
      3: 'Counts depend on how many customers each plan has; Basic has more than twice as many. Compare rates.',
    },
    solution: `Plan is the explanatory variable, so percentage within each plan: ${(SW.basicCancel / SW.basic * 100).toFixed(1)}% of Basic customers cancelled against ${(SW.proCancel / SW.pro * 100).toFixed(1)}% of Pro customers. The ${(SW.basicCancel / (SW.basicCancel + SW.proCancel) * 100).toFixed(0)}% figure answers a different question (who the cancellers are). Even the rates show only an association: customers chose their plan.`,
  },
  {
    id: 'm04-m4-4', lesson: 'analysing-survey-data', type: 'formula', kind: 'applied',
    prompt: 'A music festival (fictional) surveyed ticket holders about their spending on site. Camping ticket holders replied far more readily than day-ticket holders. In B6, use SUMPRODUCT to estimate the mean spend of all ticket holders, weighting each ticket type by its number of holders.',
    sheet: festSheet, cell: 'B6', require: ['SUMPRODUCT'],
    answer: '=SUMPRODUCT(B2:B4,D2:D4)/SUM(B2:B4)',
    alt: ['=SUMPRODUCT(D2:D4,B2:B4)/SUM(B2:B4)', '=SUMPRODUCT(B2:B4/C2:C4,C2:C4*D2:D4)/SUMPRODUCT(B2:B4/C2:C4,C2:C4)'],
    view: 'A1:D6', formats: { B: '#,##0', C: '#,##0', D: '$#,##0.00', B6: '$#,##0.00' }, widths: { A: 28, B: 18, C: 16, D: 15 },
    wrong: [
      { formula: '=SUMPRODUCT(C2:C4,D2:D4)/SUM(C2:C4)', say: 'Weighting by respondents gives the unweighted mean of all replies, which leans towards the campers who replied most. Weight by the number of ticket holders in column B.' },
      { formula: '=AVERAGE(D2:D4)', say: 'That gives each ticket type the same weight, but there are two and a half times as many day-ticket holders as campers. Weight by holders.' },
      { formula: '=SUMPRODUCT(B2:B4,D2:D4)/SUM(C2:C4)', say: 'The numerator is total spend by all holders; divide it by the number of holders, SUM(B2:B4), not by the respondents.' },
    ],
    solution: `<x>=SUMPRODUCT(B2:B4,D2:D4)/SUM(B2:B4)</x> = (3,000 × 42 + 1,800 × 95 + 1,200 × 130) ÷ 6,000 = $${festW.toFixed(2)}. The unweighted mean of the replies is $${festU.toFixed(2)}, too high because campers, the biggest spenders, are 45% of the replies but 20% of holders. Weighting fixes that imbalance, not any difference between the holders who replied and those who didn’t within a ticket type.`,
  },
  {
    id: 'm04-m4-5', lesson: 'analysing-survey-data', type: 'mc', kind: 'applied',
    prompt: 'Glenmarrow Books (fictional) surveyed 350 customers about how many books they bought last year: the median is 6 and the mean 8.1, pulled up by two respondents who run reading groups and bought over 300 each. The shop wants a figure for “a typical customer” and an estimate of the total books bought by its 9,000 customers. Which figures should it use?',
    options: [
      'The median for a typical customer, and the mean, after checking the outliers, for the total',
      'The mean for both, since it uses every answer while the median ignores almost all of them',
      'The median for both, since a mean pulled up by extreme answers should never be reported',
      'The mean for a typical customer and the median for the total, as totals need robust figures',
    ],
    answer: 0,
    feedback: {
      1: 'The mean describes no typical customer here: most bought far fewer than 8 books.',
      2: 'A total is the mean times the number of customers; the median times 9,000 would leave out the heavy buyers entirely.',
      3: 'This swaps the two: the median describes the middle customer, the mean is what multiplies up to a total.',
    },
    solution: 'For a right-skewed count the median (6) describes the typical customer. A total needs the mean, because mean × 9,000 = total books, but two answers of over 300 add at least 1.7 books to it, some 15,000 books across 9,000 customers: check they are genuine and whether reading groups are a separate kind of customer, and report the total with that caveat.',
  },

  // ---------------------------------------------------------------- insights-and-reporting
  {
    id: 'm04-m4-6', lesson: 'insights-and-reporting', type: 'classify', kind: 'conceptual',
    prompt: 'A city museum (fictional) is writing up its visitor research. Classify each statement.',
    items: [
      'Of 900 visitors surveyed, 58% of those under 35 rated the café poor, against 22% of those over 55.',
      'Younger visitors mostly come on weekday evenings, when the café is closed, so they are rating a café they never find open.',
      'Open the café on Thursday evenings for one term and compare evening ratings and takings with the term before.',
      'Visitor numbers fell 6% in 2026 while the city’s other museums grew.',
      'Visitors who book online arrive with a plan and see more galleries, so a booking prompt on the website could lengthen visits.',
    ],
    categories: ['Finding', 'Insight', 'Recommendation'],
    answer: [0, 1, 2, 0, 1],
    feedback: {
      1: 'It explains the gap in the café ratings and points to a cause that can be acted on.',
      3: 'A fact from the data, with its comparison: a finding, though one that calls for an explanation.',
      4: 'An explanation of why online bookers see more, implying an action: an insight to be tested.',
    },
    solution: 'Findings report what the data show with their figures (the café ratings by age; the fall in visitors). Insights explain why and imply something to do (evening visitors meet a closed café; planners see more). Recommendations are actions with a way to check them (the Thursday opening with its comparison).',
  },
  {
    id: 'm04-m4-7', lesson: 'insights-and-reporting', type: 'mc', kind: 'applied',
    prompt: 'In a cinema chain’s member survey (fictional), 44% said they would come to 10 p.m. screenings at least once a month. Before scheduling late screenings at all 12 of its cinemas, what should the chain do?',
    options: [
      'Try late screenings at a few randomly chosen cinemas and count the tickets sold',
      'Schedule them at all 12 cinemas, since 44% of members is a large and reliable share',
      'Repeat the survey with a sample twice as large to narrow the margin of error first',
      'Hold focus groups with members to find out how many of them would really attend',
    ],
    answer: 0,
    feedback: {
      1: 'The 44% is a stated preference: saying “at least once a month” costs nothing, and intentions overstate attendance.',
      2: 'A bigger sample measures the same stated intention more precisely; it doesn’t turn it into behaviour.',
      3: 'Focus groups explain why people might come; they can’t measure how many will.',
    },
    solution: 'Ticket sales are a revealed preference. A trial at a few cinemas, chosen at random so that they aren’t the busiest or the keenest, measures what members do and lets the chain set a rule in advance (keep late screenings where they fill a stated share of seats) before rolling out. The survey stays useful for who wants late screenings and why.',
  },
  {
    id: 'm04-m4-8', lesson: 'insights-and-reporting', type: 'multi', kind: 'conceptual',
    prompt: 'A garden-centre group (fictional) is about to publish the results of its customer survey. Select all the items its method section should contain.',
    options: [
      'Who paid for the survey and who carried it out.',
      'The exact wording of the questions behind the published figures.',
      'How the sample was drawn, how many took part and the margin of error.',
      'How the results were weighted, if they were.',
      'The names of the customers who gave the lowest ratings.',
      'The recommendations the marketing team has drawn from the results.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Naming respondents breaks the promise of confidentiality; no code of conduct allows it without consent.',
      5: 'Recommendations belong in their own section, kept apart from the method and the findings.',
    },
    solution: 'AAPOR’s disclosure standards list, among other things, the sponsor and the organisation that conducted the survey, the exact question wording, the population and how the sample was drawn, the sample sizes and precision, and the weighting. Respondents’ names never appear, and recommendations go in their own section.',
  },
  {
    id: 'm04-m4-9', lesson: 'insights-and-reporting', type: 'mc', kind: 'applied',
    prompt: 'An architecture practice (fictional) reports its staff survey by team. The legal team has three members, and one of them wrote a comment naming a manager who “never answers e-mails”. What should the report do?',
    options: [
      'Merge the legal team with another for reporting, and paraphrase the comment without the name',
      'Report the legal team separately, as every team leader expects a figure for their own team',
      'Quote the comment in full, since the manager named in it isn’t one of the survey’s participants',
      'Leave the legal team out of every figure, including the totals, to keep its members anonymous',
    ],
    answer: 0,
    feedback: {
      1: 'With three members, any figure for the team says almost exactly what each person answered; the MRS Code asks for particular care with small employee samples.',
      2: 'The comment and its context could identify its writer, and naming a third party in a report raises its own confidentiality problem.',
      3: 'The team’s answers can stay in the totals; the risk lies in showing them separately, where they can be traced to individuals.',
    },
    solution: 'Small cells are suppressed or merged (and a second cell hidden if totals would reveal the first). The comment is reported for its point, slow replies to e-mail, without the manager’s name or anything that identifies its writer. The team’s answers still count in the practice-wide figures.',
  },
  {
    id: 'm04-m4-10', lesson: 'insights-and-reporting', type: 'num', kind: 'numerical',
    prompt: 'A slide compares two regions’ satisfaction: 68% and 59%, drawn as bars on a value axis that starts at 50%. How many times the height of the second bar is the first? Give two decimal places.',
    answer: Math.round(((68 - 50) / (59 - 50)) * 100) / 100, check: () => (68 - 50) / (59 - 50), unit: 'times', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round((68 / 59) * 100) / 100, say: 'That is the true ratio of the two percentages. The bars start at 50%, so their heights are 18 and 9 points.' },
      { value: 9, say: '9 is the difference in points. The question asks for the ratio of the bar heights.' },
    ],
    solution: `The bars are 68 − 50 = 18 and 59 − 50 = 9 units tall, so the first looks 2.00 times the second, although 68% is only ${(68 / 59).toFixed(2)} times 59%. Bars for shares should start at zero; to show a small gap clearly, label the values or plot the difference with its interval.`,
  },
];
