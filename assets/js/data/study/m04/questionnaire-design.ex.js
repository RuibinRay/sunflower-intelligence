// questionnaire-design.ex.js — M04 · Questionnaire design: widgets, practice and the knowledge check (answer keys live
// here). Lantern's questions come from case.js; Ana's draft is the lesson's (fictional). Saltreed Festival, Tamberlake
// Gyms, Pennyholt Bakeries, Brindlecombe Garden Centre, Orrinsby Software and Marrowby Buses are fictional. The Pew
// figures in the chart are from Pew Research Center's "Writing Survey Questions" (2008 experiment).
import { SURVEY_2027 } from './case.js?v=15';

const Q = SURVEY_2027.questions;
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// Saltreed Festival (fictional): four Likert items, 1 = strongly disagree … 5 = strongly agree; item 3 reverse-worded
const FEST = [[4, 4, 2, 5], [5, 4, 1, 5], [2, 3, 4, 3], [3, 3, 3, 4], [4, 5, 2, 4], [1, 2, 5, 2], [4, 3, 3, 4], [4, 4, 2, 4]];
const festCells = {
  A1: 'Person', B1: 'Easy to get around', C1: 'Water easy to find', D1: 'Overcrowded (rev.)', E1: 'Felt safe',
  F1: 'Score', G1: 'Unreversed', H1: 'Opposites?',
};
FEST.forEach((r, i) => {
  const k = i + 2;
  Object.assign(festCells, { [`A${k}`]: i + 1, [`B${k}`]: r[0], [`C${k}`]: r[1], [`D${k}`]: r[2], [`E${k}`]: r[3],
    [`F${k}`]: `=AVERAGE(B${k},C${k},6-D${k},E${k})`, [`G${k}`]: `=AVERAGE(B${k}:E${k})`, [`H${k}`]: `=IF(AND(B${k}>=4,D${k}>=4),"Check","")` });
});
Object.assign(festCells, { A10: 'Average', F10: '=AVERAGE(F2:F9)', G10: '=AVERAGE(G2:G9)',
  A11: 'Variance', B11: '=VAR.S(B2:B9)', C11: '=VAR.S(C2:C9)', D11: '=VAR.S(D2:D9)', E11: '=VAR.S(E2:E9)',
  A12: 'Alpha (F)', B12: '=4/3*(1-SUM(B11:E11)/(16*VAR.S(F2:F9)))', A13: 'Alpha (G)', B13: '=4/3*(1-SUM(B11:E11)/(16*VAR.S(G2:G9)))' });

// Tamberlake Gyms (fictional): four items on a 1–7 scale about staff; item 2 ("Staff were hard to find") reverse-worded
const GYM = [[6, 2, 6, 5], [7, 1, 6, 7], [3, 5, 4, 3], [5, 3, 5, 6], [2, 6, 3, 2], [6, 3, 7, 6], [4, 4, 4, 5], [7, 2, 6, 6]];
const gymCells = { A1: 'Member', B1: 'Friendly', C1: 'Hard to find', D1: 'Knew the kit', E1: 'Helped me', F1: 'Staff score' };
GYM.forEach((r, i) => Object.assign(gymCells, { [`A${i + 2}`]: i + 1, [`B${i + 2}`]: r[0], [`C${i + 2}`]: r[1], [`D${i + 2}`]: r[2], [`E${i + 2}`]: r[3] }));
const gymScore = (r) => avg([r[0], 8 - r[1], r[2], r[3]]);

// knowledge check: one respondent, five-point items, item 2 reverse-worded
const K2 = [4, 2, 5, 4];
// Ostlake Hotels (fictional): a four-item scale's sample standard deviations and the SD of the total score
const OST = { sd: [0.95, 1.05, 0.9, 1.1], totalSd: 3.0 };
const ostAlpha = (4 / 3) * (1 - OST.sd.reduce((a, x) => a + x * x, 0) / OST.totalSd ** 2);

export const widgets = {
  'qd-openclosed': {
    type: 'chart', kind: 'bar', title: 'Pew Research Center, 2008: the same question, closed and open',
    x: { label: 'Answer', values: ['Named the economy', 'Gave an answer not on the list'] },
    series: [
      { name: 'Closed: five options listed', values: [58, 8] },
      { name: 'Open: answer in own words', values: [35, 43] },
    ],
    y: { label: '% of respondents' },
    note: 'Asked which issue mattered most in their presidential vote, 58% of those shown a list of five chose the economy, against 35% of those who answered in their own words; 43% of the open answers named something the list didn’t include. Source: Pew Research Center, “Writing Survey Questions”.',
  },
  'qd-likert': {
    type: 'sheet', title: 'Saltreed Festival (fictional): a four-item Likert scale with one reverse-worded item',
    sheet: { cells: festCells }, view: 'A1:H13', editable: 'B2:E9',
    formats: { F: '0.00', G: '0.00', B11: '0.00', C11: '0.00', D11: '0.00', E11: '0.00', B12: '0.00', B13: '0.00' },
    widths: { A: 9, B: 11, C: 11, D: 11, E: 8, F: 7, G: 9, H: 9 },
    tools: ['formulas', 'reset'],
    note: 'Codes run from 1 (strongly disagree) to 5 (strongly agree); D is the reverse-worded item, “The site felt overcrowded”. F reverse-codes it with 6 − D; G averages the raw codes. G pulls the scores of people who answered consistently towards the middle, flattering those who felt crowded (a high D) and underselling those who didn’t; F does neither. Column H flags anyone who agrees both that the site was easy to get around and that it felt overcrowded (4 or 5 on both): a sign of acquiescence or of not reading the items. Rows 11 to 13 compute Cronbach’s alpha from the sample variances (VAR.S): the variance of a reversed item equals the original’s, and the total of four items is four times the average, so its variance is 16 times the average’s. Alpha is 0.96 for F’s properly coded scale, high enough to ask whether some items overlap, and negative for G’s, because the unreversed item pulls against the others.',
  },
};

export const guided = [
  {
    id: 'm04-qd-g1', type: 'steps', kind: 'applied',
    prompt: 'Work through Lantern’s February questionnaire with the brief’s three survey objectives in mind: interest in Cold Brew, recommending Lantern, and how people buy coffee, found Lantern and think it could improve.',
    solution: 'Write each question for the analysis it must support: a number for a mean, ordered points for shares in each box, a list for counts. Then test every question against the objectives; one that feeds neither, such as household income, goes.',
    steps: [
      {
        id: 'm04-qd-g1-s1', type: 'mc',
        prompt: 'Ana wants the average number of cups of coffee each segment buys away from home in a week. Which version of Q3 lets her calculate it?',
        options: [
          '“Last week, about how many cups of coffee did you buy away from home?” (a number)',
          '“Last week, how many cups did you buy away from home? None / 1–2 / 3–5 / 6 or more”',
          '“How often do you buy coffee away from home? Rarely / Sometimes / Often / Very often”',
          '“Do you buy a coffee away from home on most working days? Yes / No”',
        ],
        answer: 0,
        hints: ['A mean needs amounts that can be added up.', 'Only one version records a count, a ratio variable.'],
        feedback: {
          1: 'Bands give an ordinal answer. You could report the share in each band, but not a mean: “6 or more” has no value to add.',
          2: 'Vague quantifiers are ordinal and mean different things to different people; one person’s “often” is another’s “sometimes”.',
          3: 'A yes/no answer gives a share, not an amount.',
        },
        solution: 'Only the open numeric version records a count (a ratio variable), from which a mean and a median can be calculated. Bands and vague quantifiers fix the answer as ordinal before any data arrives.',
      },
      {
        id: 'm04-qd-g1-s2', type: 'classify',
        prompt: 'Classify the answer to each February question by its level of measurement.',
        items: [
          `Q1: ${Q[0].text} (0 to 10)`,
          'Q2: likelihood of buying Cold Brew, from “definitely would buy” to “definitely would not”',
          `Q3: ${Q[2].text}`,
          `Q4: ${Q[3].text} (five routes)`,
          `Q5: ${Q[4].text} (18–34, 35–54, 55 or over)`,
          'Q6: “What one thing could Lantern do better?”, once the answers are coded into themes',
        ],
        categories: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
        answer: [1, 1, 3, 0, 1, 0],
        fixed: true,
        hints: ['Ask of each: are the categories ordered? Is there a true zero?', 'Only Q3 counts something; Q4 and the coded Q6 have no order.'],
        feedback: {
          0: 'The eleven points are ordered, but nothing guarantees that the step from 6 to 7 equals the step from 9 to 10. B01 classes ratings as ordinal, though they are often analysed as numbers.',
          2: 'Cups bought is a count with a true zero (no cups), so it is ratio.',
          3: 'The five routes have no natural order: nominal.',
          4: 'Bands of a ratio variable are ordered categories: ordinal. The bands lose the detail a mean would need.',
          5: 'Themes such as price, delivery and range are unordered categories once coded: nominal.',
        },
        solution: 'Q1, Q2 and Q5 are ordinal; Q3 is ratio; Q4 and the coded Q6 are nominal. None is interval: there is no question whose zero is arbitrary, such as a date.',
      },
      {
        id: 'm04-qd-g1-s3', type: 'mc',
        prompt: 'Which of these questions fails the earn-its-place test outright?',
        options: [
          '“What is your annual household income?”',
          '“How did you first hear of Lantern?”',
          '“What one thing could Lantern do better?”',
          '“How likely would you be to buy Lantern Cold Brew in the next three months?”',
        ],
        answer: 0,
        hints: ['For each, name the objective it serves.', 'One asks for personal data that no planned analysis uses.'],
        feedback: {
          1: 'This serves objective 3, how people found Lantern, which guides where marketing effort goes.',
          2: 'This serves objective 3, what people think Lantern could do better; the answers are coded and counted.',
          3: 'This serves objective 1, the heart of the Cold Brew decision.',
        },
        solution: 'Income serves none of the survey’s objectives and no table in the analysis plan uses it. Many people also prefer not to give it, and collecting personal information without a purpose breaks data minimisation. Ana dropped it.',
      },
    ],
  },
  {
    id: 'm04-qd-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Pennyholt Bakeries (fictional) drafted these questions for its customer survey. Name the main fault in each.',
    items: [
      '“Wouldn’t you say our sourdough is the best in town?”',
      '“How much more do you spend with us since we started baking on site?”',
      '“How would you rate the freshness and the price of our bread?”',
      '“Do you disagree that we shouldn’t open on Sundays?”',
      '“How do you rate our viennoiserie SKU range?”',
      '“Do you visit us regularly?”',
    ],
    categories: ['Leading', 'Loaded', 'Double-barrelled', 'Double negative', 'Jargon', 'Ambiguous'],
    answer: [0, 1, 2, 3, 4, 5],
    hints: ['Leading signals the wanted answer; loaded makes you accept an assumption to answer at all.', 'Ask what a customer would need to know, or accept, before they could answer each one.'],
    feedback: {
      0: '“Wouldn’t you say…” tells people which answer is expected: leading.',
      1: 'It assumes the customer spends more since the change. Someone who spends the same or less can’t answer honestly: loaded.',
      2: 'Freshness and price are two things. A customer who loves the bread but finds it dear has no answer.',
      3: '“Disagree” with “shouldn’t open” takes two negatives to untangle; many will answer the opposite of what they mean.',
      4: '“Viennoiserie” and “SKU” are trade terms. Ask about “croissants and pastries” and “the choice we offer”.',
      5: '“Regularly” means weekly to one person and yearly to another. Ask for a number of visits over a stated period.',
    },
    solution: 'Leading (“Wouldn’t you say…”), loaded (assumes spending rose), double-barrelled (freshness and price), double negative (disagree that we shouldn’t), jargon (viennoiserie, SKU) and ambiguous (“regularly”).',
  },
  {
    id: 'm04-qd-g3', type: 'formula', kind: 'numerical',
    prompt: 'Tamberlake Gyms (fictional) asked members to rate four statements about its staff on a 1–7 scale (1 = strongly disagree, 7 = strongly agree): “Staff were friendly”, “Staff were hard to find when I needed help”, “Staff knew the equipment” and “Staff helped me”. Item 2, in column C, is worded the opposite way. In F2, calculate member 1’s staff score, the average of the four items with item 2 reverse-coded, so that it can be filled down to F9.',
    sheet: { cells: gymCells },
    cell: 'F2', fill: 'F2:F9', answer: '=AVERAGE(B2,8-C2,D2,E2)',
    alt: ['=(B2+8-C2+D2+E2)/4', '=(B2+(8-C2)+D2+E2)/4', '=SUM(B2,8-C2,D2,E2)/4', '=AVERAGE(B2,D2,E2,8-C2)'],
    view: 'A1:F9', formats: { F: '0.00' }, widths: { A: 9, B: 12, C: 13, D: 14, E: 12, F: 11 },
    wrong: [
      { formula: '=AVERAGE(B2:E2)', say: 'Item 2 runs the other way: agreeing that staff were hard to find is a bad sign. Reverse it before averaging, or a member who is unhappy with the staff looks average.' },
      { formula: '=AVERAGE(B2,6-C2,D2,E2)', say: 'On a 1–7 scale the reversed code is (1 + 7) − x = 8 − x. 6 − x is the rule for a five-point scale, and here it maps 7 to −1.' },
      { formula: '=AVERAGE(B2,7-C2,D2,E2)', say: '7 − x maps a 1 to 6 and a 7 to 0, off the scale. The reversed code is (lowest + highest) − x = 8 − x.' },
      { formula: '=SUM(B2,8-C2,D2,E2)', say: 'That is the sum of the four items. The prompt asks for the average, which stays on the 1–7 range: divide by 4.' },
    ],
    hints: ['A reversed code is (lowest + highest) − x.', '<x>=AVERAGE(B2,8-C2,D2,E2)</x>'],
    solution: `<x>=AVERAGE(B2,8-C2,D2,E2)</x>. Member 1: (6 + (8 − 2) + 6 + 5) ÷ 4 = ${gymScore(GYM[0]).toFixed(2)}. Filled down, the scores run from ${Math.min(...GYM.map(gymScore)).toFixed(2)} (member 5) to ${Math.max(...GYM.map(gymScore)).toFixed(2)} (member 2).`,
  },
  {
    id: 'm04-qd-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Brindlecombe Garden Centre (fictional) asks its loyalty members for their age. Which set of options is mutually exclusive and exhaustive for adults?',
    options: [
      'Under 25 / 25–39 / 40–59 / 60 or over / Prefer not to say',
      '18–25 / 25–40 / 40–60 / 60 or over / Prefer not to say',
      'Under 25 / 26–39 / 40–59 / 60 or over / Prefer not to say',
      '25 or under / 30–39 / 40–59 / 60 or over / Prefer not to say',
    ],
    answer: 0,
    hints: ['Check the boundaries: is any age in two boxes, or in none?', 'Try the ages 25, 26, 40 and 60 against each set.'],
    feedback: {
      1: 'Overlapping: someone aged 25, 40 or 60 fits two boxes.',
      2: 'A gap: “under 25” stops at 24 and the next band starts at 26, so 25-year-olds have no box.',
      3: 'A gap: ages 26 to 29 fit no box.',
    },
    solution: 'Under 25, 25–39, 40–59 and 60 or over meet without overlapping and cover every adult age; “prefer not to say” lets people decline instead of skipping the question.',
  },
];

export const independent = [
  {
    id: 'm04-qd-i7', type: 'num', kind: 'numerical',
    prompt: `Ostlake Hotels (fictional) piloted a four-item “room comfort” scale with 30 guests. The items’ sample standard deviations are ${OST.sd.join(', ')}, and the standard deviation of guests’ total scores is ${OST.totalSd.toFixed(1)}. What is Cronbach’s alpha? Give two decimal places.`,
    answer: Math.round(ostAlpha * 100) / 100, check: () => (4 / 3) * (1 - (0.95 ** 2 + 1.05 ** 2 + 0.9 ** 2 + 1.1 ** 2) / 3 ** 2), unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: Math.round((1 - OST.sd.reduce((a, x) => a + x * x, 0) / OST.totalSd ** 2) * 100) / 100, say: 'That leaves out k ÷ (k − 1) = 4 ÷ 3. Without it, alpha is understated, most of all for short scales.' },
      { value: Math.round((4 / 3) * (1 - OST.sd.reduce((a, b) => a + b, 0) / OST.totalSd) * 100) / 100, say: 'Alpha uses variances, the squares of the standard deviations: 0.95² = 0.9025 and so on, and 3.0² = 9.0 for the total.' },
      { value: Math.round((3 / 4) * (1 - OST.sd.reduce((a, x) => a + x * x, 0) / OST.totalSd ** 2) * 100) / 100, say: 'The factor is k ÷ (k − 1) = 4 ÷ 3, not (k − 1) ÷ k.' },
    ],
    solution: `Item variances: 0.95² + 1.05² + 0.90² + 1.10² = 0.9025 + 1.1025 + 0.81 + 1.21 = ${OST.sd.reduce((a, x) => a + x * x, 0).toFixed(3)}. Total variance: 3.0² = 9. α = 4 ÷ 3 × (1 − ${OST.sd.reduce((a, x) => a + x * x, 0).toFixed(3)} ÷ 9) = 1.3333 × ${(1 - OST.sd.reduce((a, x) => a + x * x, 0) / 9).toFixed(4)} = ${ostAlpha.toFixed(3)}, about ${ostAlpha.toFixed(2)}: within the usual 0.70 to 0.90.`,
  },
  {
    id: 'm04-qd-i2', type: 'order', kind: 'conceptual',
    prompt: 'Put the parts of Brindlecombe Garden Centre’s (fictional) visitor questionnaire in the order they should appear.',
    items: [
      'Who is asking, why, how long it takes and how answers will be used',
      'Have you visited Brindlecombe in the last three months? (screening question)',
      'How likely are you to recommend Brindlecombe to a friend or colleague? (0 to 10)',
      'How satisfied were you with the plants, the café and the staff on your last visit? (three separate questions)',
      'What one thing would make you visit more often? (open)',
      'Which age group are you in? What is the first half of your postcode?',
      'Thank you, and how to contact the centre about the survey',
    ],
    solution: 'Introduction (informed choice), then screening (only recent visitors continue), a general opener, the specific questions, the open question, the profile questions near the end, and the thank-you. General before specific avoids colouring the overall judgement; demographics go last unless needed for routing.',
  },
  {
    id: 'm04-qd-i3', type: 'multi', kind: 'applied',
    prompt: 'Orrinsby Software (fictional) wants to know how often its small-business users back up their files, and suspects people overstate it. Which changes would reduce social desirability bias in the answers? Select all that apply.',
    options: [
      'Ask on a web form the user completes alone, not in a call with their account manager.',
      'Preface the question with “Many businesses find it hard to back up as often as they’d like.”',
      'Include infrequent options such as “Less than once a month” and “Never”.',
      'Turn it into a statement for users to rate: “I back up my files regularly” (agree or disagree).',
      'Have the user’s account manager ask the question in person at the annual review meeting.',
      'Promise users that their answers will be passed on to their account manager after the survey.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'An agree/disagree statement adds acquiescence to social desirability: both push towards “agree”.',
      4: 'An interviewer, and especially one the user deals with, makes the flattering answer more tempting.',
      5: 'Telling people their answer will reach someone they want to impress raises the pressure to look good.',
    },
    solution: 'A self-administered mode, wording that makes the less flattering answer easy to give, and options that include infrequent behaviour all reduce the pull towards the good-looking answer (Pew uses the last two). An agree/disagree statement, an interviewer who matters to the respondent, and answers shared with that person all increase it.',
  },
  {
    id: 'm04-qd-i4', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of the Net Promoter question.',
    text: 'Reichheld’s question asks how likely someone is to recommend a company on a scale from [[0]] to 10. Answers of 9 or 10 are [[1]], 7 or 8 are passives, and answers of [[2]] are detractors. The score is the percentage of promoters minus the percentage of detractors, so it can run from [[3]] to +100.',
    blanks: [
      { options: ['1', '0', '5'], answer: 1 },
      { options: ['passives', 'detractors', 'promoters'], answer: 2 },
      { options: ['0 to 6', '0 to 4', '1 to 5'], answer: 0 },
      { options: ['0', '−10', '−100'], answer: 2 },
    ],
    fixed: true,
    solution: 'The scale runs from 0 to 10. Promoters answer 9 or 10, passives 7 or 8 and detractors 0 to 6. If everyone is a detractor the score is 0% − 100% = −100; if everyone is a promoter it is +100.',
  },
  {
    id: 'm04-qd-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Pennyholt Bakeries (fictional) is choosing formats for its next survey. Name the format of each question.',
    items: [
      '“Pennyholt’s bread is good value for money.” Strongly disagree / Disagree / Neither / Agree / Strongly agree',
      '“Pennyholt is: Old-fashioned ○ ○ ○ ○ ○ ○ ○ Modern”',
      '“On a scale of 0 to 10, how would you rate your last visit?”',
      '“If Pennyholt sold gluten-free loaves at $5.20, how likely would you be to buy one in the next month?” Definitely would … Definitely would not',
      '“Put these in order of importance to you: freshness, price, choice, location.”',
      '“Have you bought from Pennyholt in the last month?” Yes / No',
    ],
    categories: ['Likert item', 'Semantic differential', 'Numeric rating scale', 'Purchase-intent scale', 'Ranking question', 'Dichotomous question'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      1: 'Two opposite adjectives at the ends of seven points: a semantic differential.',
      3: 'A described product, a price, a period and verbal points from “definitely would” to “definitely would not”: a purchase-intent scale.',
      4: 'Putting options in order is ranking. It shows which matters most, not by how much.',
    },
    solution: 'Agree/disagree with a statement: Likert item. Opposite adjectives: semantic differential. A number on a stated range: numeric rating. Likelihood of buying a described product: purchase intent. Putting options in order: ranking. Two answers: dichotomous.',
  },
  {
    id: 'm04-qd-i6', type: 'short', kind: 'applied',
    prompt: 'Marrowby Buses (fictional) wants to add this to its passenger survey: “Don’t you agree that our friendly, punctual drivers deserve a pay rise?” Rewrite it as one or more good questions, and say in a sentence what each change fixes.',
    rubric: [
      'Separates friendliness from punctuality (the original is double-barrelled).',
      'Removes the leading “Don’t you agree” and the agree/disagree format, which invites acquiescence.',
      'Removes the loaded assumption that drivers are friendly and punctual.',
      'Questions whether the pay-rise part belongs in a passenger survey at all (it serves no passenger-experience objective), or asks about it neutrally if it does.',
      'Uses balanced, fully labelled answer options suitable for the mode.',
    ],
    model: '“How would you rate the friendliness of the drivers on your journeys in the last month?” (very good, good, neither good nor poor, poor, very poor) and “How often were your buses in the last month on time, within five minutes of the timetable?” (always, mostly, about half the time, rarely, never). The original asked about two qualities at once, assumed both were present, and told passengers what to say; drivers’ pay is not something passengers are placed to judge, so the pay-rise clause is dropped unless an objective needs passengers’ views on it, in which case it would be asked separately and neutrally.',
  },
];

export const check = [
  {
    id: 'm04-qd-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which pretest finding needs a method in which real respondents take part, such as a cognitive interview?',
    options: [
      'Two of five customers took “ready-to-drink” to mean a café drink.',
      'The routing sends everyone who answers 0 to Q3 past Q4 by mistake.',
      'Question 10 contains a double negative that could confuse readers.',
      'No question in the draft serves the objective about recommending Lantern.',
    ],
    answer: 0,
    feedback: {
      1: 'A test run of the survey tool, with made-up answers along every path, finds routing errors without any respondent.',
      2: 'A double negative can be spotted in an expert review of the wording. The Census Bureau counts expert review as useful but not as a pretest, because it can’t show how respondents read a question.',
      3: 'Comparing the questions with the objectives is a desk check the researcher does alone.',
    },
    solution: 'How people actually understand a word is only discovered by asking them: in a cognitive interview they think aloud or are probed on what a term meant. Routing errors, visible faults in wording and gaps against the objectives can be found without respondents, which is why the Census Bureau requires at least one respondent-based method on top of such checks.',
  },
  {
    id: 'm04-qd-k2', type: 'num', kind: 'numerical',
    prompt: `A respondent answers four five-point Likert items (1 = strongly disagree, 5 = strongly agree) with ${K2.join(', ')}. Item 2 is worded the opposite way from the others. What is the respondent’s scale score, the average after reverse-coding? Give two decimal places.`,
    answer: avg([K2[0], 6 - K2[1], K2[2], K2[3]]), check: () => (K2[0] + (1 + 5 - K2[1]) + K2[2] + K2[3]) / 4, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: avg(K2), say: 'That averages the raw codes. Item 2 runs the other way, so its 2 becomes 6 − 2 = 4 before averaging.' },
      { value: avg([K2[0], 5 - K2[1], K2[2], K2[3]]), say: 'On a 1–5 scale the reversed code is (1 + 5) − x = 6 − x, which maps 2 to 4, not 5 − x.' },
      { value: K2[0] + 6 - K2[1] + K2[2] + K2[3], say: 'That is the sum. The score asked for is the average, which stays on the 1–5 range.' },
    ],
    solution: `Reverse item 2: 6 − 2 = 4. Average: (4 + 4 + 5 + 4) ÷ 4 = ${avg([K2[0], 6 - K2[1], K2[2], K2[3]]).toFixed(2)}.`,
  },
  {
    id: 'm04-qd-k3', type: 'mc', kind: 'applied',
    prompt: 'A colleague suggests replacing Lantern’s Q2 with the statement “I would buy Lantern Cold Brew” (strongly disagree … strongly agree), because “it’s quicker to read”. What is the main risk?',
    options: [
      'Acquiescence: people tend to agree with statements, so apparent willingness to buy would rise for reasons unrelated to the product.',
      'The answers would become nominal, so Ana could no longer report the share of respondents in the top two boxes of the scale.',
      'The statement would become double-barrelled, because it names both the Lantern brand and the Cold Brew product in one sentence.',
      'None: agreeing that you would buy something measures exactly the same thing as rating how likely you are to buy it.',
    ],
    answer: 0,
    feedback: {
      1: 'Agreement points are still ordered, so the answers stay ordinal and top-box shares can still be reported. The problem is what pushes people into the top boxes.',
      2: 'Naming the brand of the product is one subject, not two. A double-barrelled question asks about two things, such as taste and price.',
      3: 'Agree/disagree formats add acquiescence, which Krosnick and Presser put at about 10% on average. The intent scale asks about the thing itself, and also drops the price, which a bare statement leaves out.',
    },
    solution: 'Agree/disagree statements invite acquiescence, especially among less engaged respondents, so an agreement scale would inflate apparent interest. Lantern’s Q2 asks directly how likely people are to buy a described product at a stated price, on balanced verbal points.',
  },
  {
    id: 'm04-qd-k7', type: 'classify', kind: 'conceptual',
    prompt: 'Fellmark Language School (fictional) has built a six-item scale of learners’ confidence in speaking. Name the kind of evidence each finding gives.',
    items: [
      'The same 40 learners complete the scale twice, a fortnight apart, and their two scores correlate at 0.85.',
      'Cronbach’s alpha across the scale’s six items is 0.82.',
      'Three experienced teachers check that the items cover speaking to strangers, on the phone, in groups and in class.',
      'Scores correlate 0.70 with an established speaking-confidence questionnaire and 0.05 with how much learners enjoy grammar exercises.',
      'Learners’ scores in September predict how often teachers count them speaking up in class in December.',
      'Learners’ scores agree closely with the marks examiners gave them in an oral exam held the same week.',
    ],
    categories: ['Test–retest reliability', 'Internal consistency', 'Content validity', 'Construct validity', 'Criterion validity'],
    answer: [0, 1, 2, 3, 4, 4],
    feedback: {
      2: 'Comparing the items with what the idea covers is content validity: no scores are involved.',
      3: 'Strong agreement with a measure of the same idea (convergent) and almost none with a different idea (discriminant): construct validity.',
      4: 'An outcome measured later that the scale should predict: criterion validity (predictive).',
      5: 'An outcome measured at the same time: criterion validity (concurrent).',
    },
    solution: 'Two administrations agreeing: test–retest reliability. Items moving together: internal consistency. Items covering the idea: content validity. The right pattern of correlations with other measures: construct validity. Agreement with an outcome, now (concurrent) or later (predictive): criterion validity.',
  },
  {
    id: 'm04-qd-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about order effects that are correct.',
    options: [
      'A question about late buses asked just before overall satisfaction can change the satisfaction answers.',
      'In a telephone interview, options read out last tend to be chosen more often.',
      'A question tracked from year to year should keep its place in the questionnaire.',
      'The points of a satisfaction scale should be shuffled into a random order for each respondent.',
      'Order effects change form rather than disappear when a survey moves from the telephone to the web.',
      'Asking demographic questions first reduces fatigue and so removes order effects.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Shuffling an ordered scale makes it unreadable. Keep it in order, and reverse it for half the sample to spread any primacy or recency.',
      4: 'Correct too: on screen, the options read first gain (primacy), where on the phone those heard last did.',
      5: 'Demographics usually go last; opening with them is dull and can feel intrusive, and it does nothing to stop earlier questions colouring later ones.',
    },
    solution: 'Earlier questions colour later ones (so general before specific, and tracked questions stay put); heard lists favour the last options (recency), read lists the first (primacy). Moving to the web turns recency into primacy rather than removing order effects. Ordered scales stay in order, and demographics belong near the end.',
  },
  {
    id: 'm04-qd-k6', type: 'mc', kind: 'conceptual',
    prompt: 'In Pew’s 2008 experiment, 58% of people shown a list of five issues chose the economy as the issue that mattered most to their vote, against 35% of people asked the same question with no list. What does the difference mainly show?',
    options: [
      'The list itself shaped the answers, reminding people of the economy and steering them away from issues it left out.',
      'Open answers are less accurate, because people asked in their own words forget the issues that matter most to them.',
      'Random sampling error: the two samples happened to differ, and a larger sample would have closed most of the gap.',
      'The open answers must have been coded wrongly, because so large a gap can only come from processing mistakes.',
    ],
    answer: 0,
    feedback: {
      1: 'Neither version is the right one. The open version shows what comes to mind unprompted; the closed version shows choices among the options offered. The point is that the list changes the result.',
      2: 'A 23-point gap between two large random samples is far beyond chance, and 43% of the open answers named issues the list didn’t include.',
      3: 'Nothing suggests a coding error; the same pattern appears whenever a list prompts some answers and omits others.',
    },
    solution: 'Closed lists prompt the options they show and hide the rest: only 8% of the closed group gave an answer outside the list, against 43% of the open group. Pew notes that researchers sometimes pilot an open version and build the closed list from the commonest answers.',
  },
];
