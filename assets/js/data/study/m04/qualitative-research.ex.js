// qualitative-research.ex.js — M04 · Qualitative research: widgets, practice and the knowledge check (answer keys live
// here). The quotations, groups and Ana's codes come from ./case.js (fictional); the second coder's two different codes
// are the lesson's assumption. Every other business and figure is fictional. Formula items are marked by their results on
// the sheet and on copies; `vary` changes some of the second coder's codes on the copies so that typed-in results fail.
import { FOCUS_GROUPS } from './case.js?v=17';

const FG = FOCUS_GROUPS, T = FG.themes, Q = FG.quotes, N = Q.length, R = N + 1;
const DISAGREE = { 2: 1, 14: 2 };
const coder2 = Q.map((q, i) => (i in DISAGREE ? DISAGREE[i] : q.theme));
const cells = (map) => Object.fromEntries(Q.flatMap((q, i) => map(q, i).map(([col, v]) => [`${col}${i + 2}`, v])));
const countAB = (g, k) => Q.filter((q) => q.group === g && q.theme === k).length;

// a fictional bike-hire firm (guided g3): 40 complaints coded "about price" yes or no by two coders
const BK = { yy: 12, nn: 22, yn: 4, ny: 2 };
const bkN = BK.yy + BK.nn + BK.yn + BK.ny;
const bkPo = (BK.yy + BK.nn) / bkN, bkA = (BK.yy + BK.yn) / bkN, bkB = (BK.yy + BK.ny) / bkN;
const bkPe = bkA * bkB + (1 - bkA) * (1 - bkB);
const bkK = (bkPo - bkPe) / (1 - bkPe);
// a fictional survey firm's open answers (k2): two coders, "positive" or "negative"
const SV = { po: 0.9, a: 0.7, b: 0.75 };
const svPe = SV.a * SV.b + (1 - SV.a) * (1 - SV.b);
const svK = (SV.po - svPe) / (1 - svPe);

// the language-learning app's 16 depth interviews (fictional): new codes found in each interview
const NEW = [9, 5, 3, 2, 2, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0];
const CUM = NEW.map((_, i) => NEW.slice(0, i + 1).reduce((a, b) => a + b, 0));

export const widgets = {
  'qr-codebook': {
    type: 'sheet',
    title: 'Lantern’s Cold Brew focus groups: the coded quotations',
    sheet: { cells: {
      A1: 'no.', B1: 'group', C1: 'participant', D1: 'quotation', E1: 'theme (Ana)', F1: 'theme (coder 2)',
      ...cells((q, i) => [['A', i + 1], ['B', q.group], ['C', q.who], ['D', q.text], ['E', T[q.theme]], ['F', T[coder2[i]]]]),
      H1: 'theme', I1: 'A', J1: 'B', K1: 'all',
      ...Object.fromEntries(T.map((t, k) => [`H${k + 2}`, t])),
      H9: 'percent agreement',
    } },
    view: `A1:K${R}`,
    widths: { A: 5, B: 7, C: 11, D: 62, E: 18, F: 18, H: 20, I: 9, J: 9, K: 9 },
    formats: { I9: '0%' },
    editable: true,
    mark: ['I2:K7', 'I9'],
    maxHeight: '28rem',
    tools: ['formulas', 'fill', 'reset'],
    note: 'Columns: A number, B group (A subscribers, B non-customers), C participant, D quotation, E Ana’s theme, F the second coder’s theme. Build the table in H1:K7 with COUNTIFS (I1 and J1 hold the group letters) and the percent agreement in I9, for example with SUMPRODUCT. The second coder’s codes differ from Ana’s for quotations 3 and 15 (rows 4 and 16).',
  },
  'qr-saturation': {
    type: 'chart', kind: 'bar',
    title: 'Codes found in 16 depth interviews (a fictional language-learning app)',
    x: { label: 'Interview', values: NEW.map((_, i) => String(i + 1)) },
    series: [{ name: 'Distinct codes found so far', values: CUM }, { name: 'New codes in this interview', values: NEW }],
    y: { label: 'Codes', format: 'int' },
    note: `The first interview gave ${NEW[0]} codes and the first four ${CUM[3]}. After the seventh, the remaining nine interviews added only ${CUM[15] - CUM[6]} codes between them, and the last three none. Saturation is a judgement: here a team would probably have stopped after about twelve, with a run of interviews adding nothing, and would have missed the one code interview 13 found. So report where you stopped and why.`,
  },
};

export const guided = [
  {
    id: 'm04-qr-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the method that fits each fictional research need best.',
    items: [
      'A furniture retailer wants to see how shoppers move through its showroom and where they stop',
      'A council wants reactions to three draft designs for a new recycling leaflet, and the words residents use about them',
      'An accountancy software firm wants to understand why owners of small practices cancelled their subscriptions',
      'A gym chain wants to estimate the share of its members who would pay $5 more a month for unlimited classes',
      'A credit union wants to understand how members in financial difficulty decided whom to ask for help',
      'A cereal brand wants to understand breakfast routines by spending mornings with families in their homes',
    ],
    categories: ['Depth interviews', 'Focus groups', 'Observation or ethnography', 'A survey (not qualitative)'],
    answer: [2, 1, 0, 3, 0, 2],
    hints: [
      'Ask whether the need is a shared reaction (groups), one person’s private decision (interviews), behaviour people can’t report (watching) or a “how many” (a survey).',
      'Money troubles are private; reactions to designs are shared; “estimate the share” is descriptive.',
    ],
    feedback: {
      1: 'Reactions to designs and the language people share come out well in a group, where one person’s comment prompts another’s.',
      3: '“Estimate the share” calls for descriptive research on a planned sample. No qualitative method can estimate it.',
      4: 'Financial difficulty is personal and sensitive: one-to-one interviews let people talk without an audience.',
    },
    solution: 'Observation: the showroom paths (behaviour shoppers barely notice) and the breakfast routines (ethnography in the home). Focus groups: reactions to the leaflet designs. Depth interviews: the cancelled subscriptions and the members in difficulty (individual and, in the second case, sensitive decisions). A survey: the share who would pay more, a descriptive estimate.',
  },
  {
    id: 'm04-qr-g2', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s 20 coded quotations: group in B (A or B) and Ana’s theme in C. F2:F7 hold the six themes and G1:H1 the group letters. In G2, write one formula counting the quotations from the group in G1 that Ana coded to the theme in F2, that can be filled across to H and down to row 7.',
    sheet: { cells: {
      A1: 'participant', B1: 'group', C1: 'theme (Ana)', D1: 'theme (coder 2)',
      ...cells((q, i) => [['A', q.who], ['B', q.group], ['C', T[q.theme]], ['D', T[coder2[i]]]]),
      F1: 'theme', G1: 'A', H1: 'B', ...Object.fromEntries(T.map((t, k) => [`F${k + 2}`, t])),
    } },
    cell: 'G2', fill: 'G2:H7', view: `A1:H${R}`,
    widths: { A: 11, B: 7, C: 18, D: 18, F: 20, G: 8, H: 8 },
    require: ['COUNTIFS'],
    answer: `=COUNTIFS($B$2:$B$${R},G$1,$C$2:$C$${R},$F2)`,
    alt: [`=COUNTIFS($C$2:$C$${R},$F2,$B$2:$B$${R},G$1)`],
    wrong: [
      { formula: `=COUNTIFS(B2:B${R},G1,C2:C${R},F2)`, say: 'Without dollar signs the ranges slide down as the formula is filled, and the criteria move off the headers. Fix the ranges ($B$2:$B$21, $C$2:$C$21), the group row (G$1) and the theme column ($F2).' },
      { formula: `=COUNTIFS($B$2:$B$${R},"A",$C$2:$C$${R},$F2)`, say: 'With “A” typed in, column H also counts group A. Refer to the header: G$1, with the row fixed so it stays on row 1 as you fill down.' },
      { formula: `=COUNTIF($C$2:$C$${R},$F2)`, say: 'That counts the theme in both groups together. Add the group as a second criterion with COUNTIFS.' },
      { formula: `=COUNTIFS($B$2:$B$${R},G$1,$D$2:$D$${R},$F2)`, say: 'Column D holds the second coder’s themes. The table is of Ana’s codes, in column C.' },
    ],
    hints: [
      'COUNTIFS(group range, group, theme range, theme). Decide which parts must stay put as you fill: the data ranges always, the group’s row, the theme’s column.',
      `<x>=COUNTIFS($B$2:$B$${R},G$1,$C$2:$C$${R},$F2)</x>`,
    ],
    solution: `<x>=COUNTIFS($B$2:$B$${R},G$1,$C$2:$C$${R},$F2)</x>. The mixed references do the work: G$1 lets the group change as you fill across but not down, and $F2 lets the theme change down but not across. Group A: ${T.map((t, k) => `${t} ${countAB('A', k)}`).join(', ')}; group B: ${T.map((t, k) => `${t} ${countAB('B', k)}`).join(', ')}. Every theme appears in both groups.`,
  },
  {
    id: 'm04-qr-g3', type: 'steps', kind: 'numerical',
    prompt: `A fictional bike-hire firm has two staff code ${bkN} customer complaints independently: is the complaint about price? Both said yes for ${BK.yy} and no for ${BK.nn}; the first said yes and the second no for ${BK.yn}; the first said no and the second yes for ${BK.ny}. Measure their agreement.`,
    solution: `p_o = (12 + 22) ÷ 40 = ${bkPo.toFixed(2)}. Coder 1 said yes to 16 of 40 (0.40), coder 2 to 14 of 40 (0.35). p_e = 0.40 × 0.35 + 0.60 × 0.65 = 0.14 + 0.39 = ${bkPe.toFixed(2)}. κ = (0.85 − 0.53) ÷ (1 − 0.53) = 0.32 ÷ 0.47 = ${bkK.toFixed(2)}: good agreement beyond chance, though the six disagreements are worth reading to sharpen the definition of a price complaint.`,
    steps: [
      { id: 'm04-qr-g3-s1', type: 'num',
        prompt: 'What is the percent agreement? Give a percentage.',
        answer: bkPo * 100, check: () => (12 + 22) / 40 * 100, tol: 0.05, unit: '%', places: 0,
        hints: ['Agreement counts both kinds: both yes and both no.', '(12 + 22) ÷ 40.'],
        wrong: [{ value: 12 / 40 * 100, say: 'That counts only the complaints both coders called price complaints. Agreeing that a complaint is not about price is agreement too: add the 22.' }] },
      { id: 'm04-qr-g3-s2', type: 'num',
        prompt: 'What agreement would chance alone produce, p_e? Give a decimal to two places.',
        answer: bkPe, check: () => (16 / 40) * (14 / 40) + (24 / 40) * (26 / 40), tol: 0.005, unit: '', places: 2,
        hints: ['Each coder’s share of “yes”: coder 1 (12 + 4) ÷ 40, coder 2 (12 + 2) ÷ 40. Their shares of “no” are the rest.', 'p_e = 0.40 × 0.35 + 0.60 × 0.65.'],
        wrong: [
          { value: 0.4 * 0.35, say: 'That is chance agreement on “yes” only. Two coders can also agree by chance on “no”: add 0.60 × 0.65.' },
          { value: 0.5, say: 'That assumes each coder said yes half the time. Use their actual shares: 0.40 and 0.35.' },
        ] },
      { id: 'm04-qr-g3-s3', type: 'num',
        prompt: 'What is Cohen’s kappa? Give two decimal places.',
        answer: bkK, check: () => (0.85 - 0.53) / (1 - 0.53), tol: 0.005, unit: '', places: 2,
        hints: ['κ = (p_o − p_e) ÷ (1 − p_e).', '(0.85 − 0.53) ÷ 0.47.'],
        wrong: [
          { value: 0.85 - 0.53, say: 'That is the agreement beyond chance, but not yet as a share of what was possible beyond chance. Divide by 1 − p_e.' },
          { value: (0.85 - 0.53) / 0.53, say: 'Divide by 1 − p_e (0.47), the most agreement beyond chance there could be, not by p_e.' },
        ] },
      { id: 'm04-qr-g3-s4', type: 'mc',
        prompt: 'What should the firm do with the six complaints the coders disagreed on?',
        options: [
          'Read them together and write a clearer rule for “about price” into the codebook',
          'Drop them from the analysis, since disputed complaints can’t be counted',
          'Code them as price complaints, so that no price complaint is missed in the counts',
          'Ask a third person to code them and take the majority view without changing anything',
        ],
        answer: 0,
        hints: ['Disagreements show where the code’s definition is unclear.'],
        feedback: {
          1: 'Dropping disputed cases hides exactly the complaints that show the definition is unclear, and biases the counts.',
          2: 'Resolving every doubt one way builds a bias into the counts; the definition needs fixing instead.',
          3: 'A third vote settles these six but leaves the unclear rule in place for the next batch.',
        } },
    ],
  },
  {
    id: 'm04-qr-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional software firm has run 8 depth interviews with customers who cancelled. The seventh and eighth added two new codes each. What does saturation evidence suggest?',
    options: [
      'Keep interviewing, since the last interviews were still adding codes',
      'Stop, because 8 interviews are within the range studies have found for saturation',
      'Stop, because the first interviews already found most of the codes',
      'Switch to a survey, since depth interviews never reach saturation',
    ],
    answer: 0,
    hints: ['Saturation is judged by whether new interviews still add codes, not by reaching a number.', 'Studies found 9 to 17 interviews for fairly similar groups with narrow objectives.'],
    feedback: {
      1: 'The ranges in the evidence are what similar studies needed; the test for this study is its own data. New codes in the latest interviews mean it hasn’t saturated.',
      2: 'Finding most codes early is typical, but the late interviews still found new ones, which may be the important ones.',
      3: 'Interviews do reach saturation; a survey answers a different question (how common each reason is), and needs the codes first.',
    },
    why: 'Saturation means a run of interviews adds nothing new; these are still adding codes.',
    solution: 'Interviews 7 and 8 still added codes, so saturation hasn’t been reached. Keep interviewing, perhaps with customers unlike those already seen, and stop when a run of interviews adds nothing. Hennink and Kaiser’s review found saturation within 9 to 17 interviews for fairly similar participants: a guide for planning, not a stopping rule.',
  },
];

export const independent = [
  {
    id: 'm04-qr-i1', type: 'mc', kind: 'applied',
    prompt: 'In 10 depth interviews with members of a fictional climbing gym, 6 people complained about the changing rooms. Which statement does this support?',
    options: [
      'Changing rooms are a recurring theme, worth measuring in a survey of members',
      'About 60% of the gym’s members are unhappy with its changing rooms',
      'The changing rooms are the gym’s most serious problem, ahead of every other theme',
      'Changing rooms are a minor issue, because 4 of the 10 members didn’t mention them',
    ],
    answer: 0,
    feedback: {
      1: 'Ten chosen members can’t estimate a share of all members. Six of ten describes the interviews, not the membership.',
      2: 'How often a theme is mentioned depends on the guide and on who talks most; it doesn’t rank problems by seriousness.',
      3: 'People who didn’t mention something may still care about it; silence in an interview isn’t a measurement either.',
    },
    solution: 'The interviews show that changing rooms are a recurring theme and what members say about them. How many members are unhappy, and how much it matters compared with other problems, is a question for a survey of a planned sample, which the interviews have now helped to word.',
  },
  {
    id: 'm04-qr-i2', type: 'order', kind: 'conceptual',
    prompt: 'Put Braun and Clarke’s six phases of thematic analysis in order.',
    items: [
      'Familiarising yourself with the data',
      'Generating initial codes',
      'Searching for themes',
      'Reviewing themes',
      'Defining and naming themes',
      'Producing the report',
    ],
    solution: 'Read and re-read the transcripts; code them; gather codes into candidate themes; check the themes against the coded extracts and the whole data set; define and name each theme; write the report. The phases loop: reviewing often sends the analyst back to the data.',
  },
  {
    id: 'm04-qr-i3', type: 'multi', kind: 'applied',
    prompt: 'An agency is recruiting a focus group of people who buy sports drinks but have never bought a fictional new brand, Aldermoor. Which practices belong in its screener and recruitment? Select all that apply.',
    options: [
      'Listing Aldermoor among several brands rather than asking about it alone',
      'Excluding anyone who works in marketing, market research or the drinks trade',
      'Excluding people who took part in a paid discussion in the past six months',
      'Telling recruits at recruitment that the group will be recorded and watched',
      'Opening with “Would you like to try Aldermoor, the exciting new sports drink?”',
      'Accepting the first people who reply to a post on Aldermoor’s social-media page',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Naming and praising the brand reveals the sponsor and invites people to say what they think the client wants to hear.',
      5: 'People who follow Aldermoor’s page are self-selected fans of the brand, the opposite of the people the group needs.',
    },
    solution: 'Disguise the sponsor in a list of brands; exclude people from the industry and those who take part too often; tell recruits about recording and observation when they are recruited, and again at the start, as the MRS code requires. Don’t lead with the brand, and don’t recruit from its own followers.',
  },
  {
    id: 'm04-qr-i4', type: 'num', kind: 'numerical',
    prompt: 'Two researchers independently coded 60 passages from interviews with a fictional pharmacy chain’s customers and gave the same code to 51 of them. What is the percent agreement? Give a percentage.',
    answer: 51 / 60 * 100, check: () => 51 / 60 * 100, tol: 0.05, unit: '%', places: 0,
    wrong: [
      { value: 9 / 60 * 100, say: 'That is the share they disagreed on (9 of 60). Agreement is 51 ÷ 60.' },
      { value: 51 / 60, say: 'That is the agreement as a decimal. Multiply by 100 for a percentage.' },
    ],
    solution: '51 ÷ 60 = 0.85, so 85%. Before relying on it, calculate Cohen’s kappa, which removes the agreement expected by chance, and read the 9 disagreements.',
  },
  {
    id: 'm04-qr-i5', type: 'classify', kind: 'conceptual',
    prompt: 'A moderator’s draft guide for a group on canned coffee contains these questions. Classify each.',
    items: [
      'Tell me about the last time you bought a coffee on the way to work.',
      'Don’t you find most canned coffee far too sweet?',
      'Do you ever buy canned coffee?',
      'What makes you say that?',
      'Wouldn’t a stylish can make you more likely to try a new brand?',
      'How do you decide which one to pick up?',
    ],
    categories: ['Open and neutral', 'Leading', 'Closed (yes or no)'],
    answer: [0, 1, 2, 0, 1, 0],
    feedback: {
      1: 'The question tells participants the expected answer (“far too sweet”); a neutral version is “What do you think of the taste of canned coffee?”',
      2: 'A yes-or-no question closes the topic. In a guide, a screener has usually settled it; ask “How often…” or “Tell me about…” instead.',
      4: 'It suggests both the answer and the reason. Show the can and ask for first reactions instead.',
    },
    solution: 'Open and neutral: the last coffee on the way to work, “What makes you say that?” (a probe) and how they decide. Leading: the two questions that suggest their own answers. Closed: “Do you ever buy canned coffee?”',
  },
];

export const check = [
  {
    id: 'm04-qr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'For which of these objectives is qualitative research the right main method?',
    options: [
      'Find out why first-time visitors to a museum’s website leave without booking',
      'Estimate how many of a museum’s visitors each year come from outside the region',
      'Test whether a lower family ticket price raises the number of family visits',
      'Measure the average time visitors spend in each of the museum’s eight galleries',
    ],
    answer: 0,
    feedback: {
      1: '“Estimate how many” is descriptive: a planned sample or the ticket records, not interviews.',
      2: 'Whether a price change causes more visits is a causal question for an experiment, such as offering the price on randomly chosen days.',
      3: 'An average time is a measurement, from observation counts or sensor data analysed quantitatively.',
    },
    solution: 'Why visitors leave is an explanation to discover: depth interviews or watching people try to book would find the reasons. The other three estimate, test or measure, which need descriptive or causal designs.',
  },
  {
    id: 'm04-qr-k2', type: 'num', kind: 'numerical',
    prompt: 'Two coders classified open survey answers for a fictional energy supplier as positive or negative. They agreed on 90%. The first coded 70% of the answers positive, the second 75%. What is Cohen’s kappa? Give two decimal places.',
    answer: svK, check: () => (0.9 - (0.7 * 0.75 + 0.3 * 0.25)) / (1 - (0.7 * 0.75 + 0.3 * 0.25)), tol: 0.005, unit: '', places: 2,
    wrong: [
      { value: (0.9 - 0.7 * 0.75) / (1 - 0.7 * 0.75), say: 'Chance agreement includes agreeing on “negative” as well: 0.30 × 0.25 = 0.075. So p_e = 0.525 + 0.075 = 0.60.' },
      { value: 0.9 - svPe, say: 'That is p_o − p_e. Divide by 1 − p_e (0.40) to express it as a share of the agreement possible beyond chance.' },
    ],
    solution: 'p_e = 0.70 × 0.75 + 0.30 × 0.25 = 0.525 + 0.075 = 0.60. κ = (0.90 − 0.60) ÷ (1 − 0.60) = 0.30 ÷ 0.40 = 0.75. Because both coders called most answers positive, chance agreement is already 60%; kappa shows the coders did well beyond it.',
  },
  {
    id: 'm04-qr-k3', type: 'formula', kind: 'applied',
    prompt: 'Ana’s themes for the 20 quotations are in B2:B21 and the second coder’s in C2:C21. In F1, calculate the percent agreement: the share of quotations to which both gave the same theme.',
    sheet: {
      cells: { A1: 'participant', B1: 'theme (Ana)', C1: 'theme (coder 2)', E1: 'percent agreement', ...cells((q, i) => [['A', q.who], ['B', T[q.theme]], ['C', T[coder2[i]]]]) },
      vary: { C3: [T[1], T[2], T[3]], C4: [T[0], T[3], T[4]], C9: [T[0], T[5]] },
    },
    variants: 5,
    cell: 'F1', view: `A1:F${R}`,
    widths: { A: 11, B: 18, C: 18, E: 18, F: 9 },
    formats: { F1: '0%' },
    answer: `=SUMPRODUCT(--(B2:B${R}=C2:C${R}))/COUNTA(B2:B${R})`,
    alt: [`=SUMPRODUCT((B2:B${R}=C2:C${R})*1)/ROWS(B2:B${R})`, `=SUMPRODUCT(--(B2:B${R}=C2:C${R}))/20`, `=SUMPRODUCT(--EXACT(B2:B${R},C2:C${R}))/20`, `=SUMPRODUCT(--EXACT(B2:B${R},C2:C${R}))/COUNTA(B2:B${R})`],
    wrong: [
      { formula: `=SUMPRODUCT(--(B2:B${R}=C2:C${R}))`, say: 'That is the number of quotations they agreed on. Divide by the number coded, COUNTA(B2:B21), to get the share.' },
      { formula: `=SUMPRODUCT(--(B2:B${R}=C2:C${R}))/COUNTA(B1:B${R})`, say: 'COUNTA(B1:B21) counts the header too, so it divides by 21. Count the quotations only: B2:B21.' },
    ],
    solution: `<x>=SUMPRODUCT(--(B2:B21=C2:C21))/COUNTA(B2:B21)</x>: the comparison gives TRUE or FALSE for each quotation, the double minus turns them into 1s and 0s, and SUMPRODUCT adds them: ${Q.filter((q, i) => q.theme === coder2[i]).length} of ${N}, or ${(Q.filter((q, i) => q.theme === coder2[i]).length / N * 100).toFixed(0)}%.`,
  },
  {
    id: 'm04-qr-k4', type: 'multi', kind: 'applied',
    prompt: 'Which statements about Lantern’s two Cold Brew focus groups are supported? Select all that apply.',
    options: [
      'Every theme in the codebook came up in both groups',
      'Two groups, one of each kind, are too few to show saturation',
      'One non-customer expects to buy it at a petrol station, outside the planned channels',
      'Price matters to about 20% of Harbour City’s ready-to-drink buyers',
      'Subscribers will buy Cold Brew, since they praised Lantern’s coffee',
      'The non-customers’ views stand for all non-customers in the city',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Four of twenty quotations is a count from two transcripts, not a share of a city’s buyers.',
      4: 'Praise in a group is a reason a subscriber might buy, not a measure of how many will; the survey estimates that, with its own limits.',
      5: 'Seven recruited people can’t stand for every non-customer; their views are possibilities to test.',
    },
    solution: 'The coding shows every theme in both groups; one group per kind can’t show saturation; and one non-customer buys at a petrol station, outside the planned channels. Shares, forecasts of buying and claims about all non-customers need descriptive research.',
  },
  {
    id: 'm04-qr-k5', type: 'mc', kind: 'applied',
    prompt: 'Ten minutes into a fictional group on banking apps, one participant has answered every question first and the others now mostly agree with him. What should the moderator do?',
    options: [
      'Ask everyone to note a first reaction privately, then invite the quieter ones by name',
      'Let him continue, since a confident participant gives the clearest answers',
      'Ask him to leave the group, since dominant participants spoil the data',
      'Stop the discussion and give out a questionnaire to collect individual answers instead',
    ],
    answer: 0,
    feedback: {
      1: 'Letting one voice lead is how a group ends up reporting one person’s view as everyone’s.',
      2: 'Removing him loses a participant and embarrasses the group; managing the discussion keeps both his views and the others’.',
      3: 'A questionnaire would lose what the group is for, the discussion; the problem is how it is being run.',
    },
    solution: 'Dominant voices and conformity are the known risks of groups. Private first reactions on paper, going round the room and inviting quieter participants by name bring out the views the group would otherwise lose, while keeping the dominant participant’s contribution.',
  },
  {
    id: 'm04-qr-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements.',
    text: 'A short questionnaire that decides who may take part is a [[0]]. A neutral follow-up such as “What makes you say that?” is a [[1]]. The point at which new interviews add no new themes is [[2]], and a measure of coders’ agreement that corrects for chance is [[3]].',
    blanks: [
      { options: ['codebook', 'screener', 'discussion guide'], answer: 1 },
      { options: ['leading question', 'closed question', 'probe'], answer: 2 },
      { options: ['saturation', 'triangulation', 'thematic analysis'], answer: 0 },
      { options: ['percent agreement', 'Cohen’s kappa', 'the response rate'], answer: 1 },
    ],
    solution: 'Screeners decide eligibility; probes ask for more without leading; saturation is reached when new interviews add nothing new; Cohen’s kappa corrects percent agreement for chance.',
  },
];
