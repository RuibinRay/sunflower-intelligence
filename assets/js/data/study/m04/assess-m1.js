// assess-m1.js — M04 module 1 test: Planning research (the research process, secondary research, qualitative research).
// New scenarios, all fictional; facts about the professional codes and County Business Patterns are from the module's
// lessons and their references. No hints; the solution is shown when the student reviews the test.

// a publisher's print run (item 2): three demand states
const PUB = { p: [0.25, 0.45, 0.3], large: [50000, 10000, -30000], small: [15000, 12000, 5000] };
const evOf = (v) => PUB.p.reduce((a, p, i) => a + p * v[i], 0);
const pubPerfect = PUB.p.reduce((a, p, i) => a + p * Math.max(PUB.large[i], PUB.small[i]), 0);
const pubEvpi = pubPerfect - Math.max(evOf(PUB.large), evOf(PUB.small));
// three-code kappa (item 7)
const K3 = { po: 0.82, c1: [0.5, 0.3, 0.2], c2: [0.45, 0.35, 0.2] };
const k3pe = K3.c1.reduce((a, q, i) => a + q * K3.c2[i], 0);
const k3k = (K3.po - k3pe) / (1 - k3pe);
// a theatre's post-show interviews (item 8): participant, kind of theatregoer, theme
const REMARKS = [
  ['P1', 'first-time', 'Price'], ['P1', 'first-time', 'Booking'], ['P2', 'regular', 'The play'], ['P3', 'first-time', 'Seats'],
  ['P3', 'first-time', 'Price'], ['P4', 'regular', 'Seats'], ['P5', 'regular', 'Price'], ['P5', 'regular', 'Seats'],
  ['P6', 'first-time', 'Price'], ['P6', 'first-time', 'The play'], ['P7', 'regular', 'Booking'], ['P7', 'regular', 'The play'],
  ['P8', 'first-time', 'Bar'], ['P8', 'first-time', 'Seats'], ['P9', 'regular', 'Seats'], ['P9', 'regular', 'Booking'],
];
const RR = REMARKS.length + 1;
const remarkCells = Object.fromEntries(REMARKS.flatMap(([p, k, t], i) => [[`A${i + 2}`, p], [`B${i + 2}`, k], [`C${i + 2}`, t]]));
const count = (k, t) => REMARKS.filter((r) => r[1] === k && r[2] === t).length;

export const items = [
  {
    id: 'm04-m1-1', lesson: 'the-research-process', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional regional airline’s research team reports five findings. Which kind of research design could have produced each?',
    items: [
      '41% of passengers on the morning flights travel for work (±4 points, from a random sample of 600)',
      'Business travellers describe the check-in queue as “the part that makes me want to drive instead”',
      'Passengers offered online check-in at random were 9 points more likely to rebook within three months than the control group',
      'Frequent flyers compare the airline with the train, not with other airlines, when they talk about it',
      'On average, passengers book 19 days before departure, according to last year’s booking records',
    ],
    categories: ['Exploratory', 'Descriptive', 'Causal'],
    answer: [1, 0, 2, 0, 1],
    feedback: {
      1: 'A vivid description of how people feel, in their own words, is what exploratory interviews or groups produce; it says nothing about how many feel it.',
      2: 'Random assignment and a control group make this an experiment: the only design that can attribute the rise to the online check-in.',
      4: 'An average from records is a descriptive measure, even though nobody was asked anything.',
    },
    solution: 'Descriptive: the 41% with its margin of error (a sample survey) and the average booking lead time (records). Exploratory: how business travellers describe the queue and how frequent flyers frame the competition (interviews or groups). Causal: the online check-in result, from random assignment with a control group.',
  },
  {
    id: 'm04-m1-2', lesson: 'the-research-process', type: 'steps', kind: 'numerical',
    prompt: 'A fictional publisher must choose a print run for a new cookbook before it knows demand. Its estimates of profit: a large run makes $50,000 if demand is high (probability 0.25), $10,000 if it is medium (0.45) and loses $30,000 if it is low (0.30); a small run makes $15,000, $12,000 and $5,000 in the same three cases. Give each answer in dollars.',
    solution: `Large run: 0.25 × 50,000 + 0.45 × 10,000 + 0.30 × (−30,000) = 12,500 + 4,500 − 9,000 = $${evOf(PUB.large).toLocaleString('en-US')}. Small run: 0.25 × 15,000 + 0.45 × 12,000 + 0.30 × 5,000 = 3,750 + 5,400 + 1,500 = $${evOf(PUB.small).toLocaleString('en-US')}, the better choice without research. With perfect information the publisher would print large if demand were high ($50,000) and small otherwise ($12,000 or $5,000): 12,500 + 5,400 + 1,500 = $${pubPerfect.toLocaleString('en-US')}. EVPI = 19,400 − 10,650 = $${pubEvpi.toLocaleString('en-US')}: no study of demand can be worth more to this decision.`,
    steps: [
      { id: 'm04-m1-2-s1', type: 'num', prompt: 'Weighting the three cases by their probabilities, what profit should the publisher expect from printing the large run?',
        answer: evOf(PUB.large), check: () => 0.25 * 50000 + 0.45 * 10000 + 0.3 * -30000, tol: 0.5, unit: '$', places: 0,
        wrong: [
          { value: (50000 + 10000 - 30000) / 3, say: 'That is the plain average of the three results. The cases have different probabilities: weight each result by its own.' },
          { value: 0.25 * 50000 + 0.45 * 10000 + 0.3 * 30000, say: 'The low case is a loss, so it enters as −30,000: 0.30 × (−30,000) = −9,000.' },
        ] },
      { id: 'm04-m1-2-s2', type: 'num', prompt: 'On the same basis, what profit should it expect from printing the small run?',
        answer: evOf(PUB.small), check: () => 0.25 * 15000 + 0.45 * 12000 + 0.3 * 5000, tol: 0.5, unit: '$', places: 0,
        wrong: [{ value: 15000 + 12000 + 5000, say: 'That adds the three results without weighting them by their probabilities.' }] },
      { id: 'm04-m1-2-s3', type: 'num', prompt: 'What is the most the publisher could gain, on average, from a market study that told it in advance which demand case would occur?',
        answer: pubEvpi, check: () => (0.25 * 50000 + 0.45 * 12000 + 0.3 * 5000) - Math.max(0.25 * 50000 + 0.45 * 10000 - 0.3 * 30000, 0.25 * 15000 + 0.45 * 12000 + 0.3 * 5000), tol: 0.5, unit: '$', places: 0,
        wrong: [
          { value: pubPerfect, say: 'That is the expected value of choosing with perfect information. Its worth is the gain over the best choice without it.' },
          { value: pubPerfect - evOf(PUB.large), say: 'That subtracts the large run’s expected value. The comparison is with the best choice without information, the small run.' },
        ] },
    ],
  },
  {
    id: 'm04-m1-3', lesson: 'the-research-process', type: 'mc', kind: 'applied',
    prompt: 'A UK toy company hires an agency that follows the MRS Code of Conduct to interview 14-year-olds about a new game. What must the agency do before each interview?',
    options: [
      'Obtain and verify a responsible adult’s permission for the child to take part',
      'Nothing extra: the ICC/ESOMAR code calls 13- to 17-year-olds young persons, not children',
      'Ask each 14-year-old to tick a box confirming that they are 16 or over',
      'Get one head teacher’s consent on behalf of every pupil interviewed at the school',
    ],
    answer: 0,
    feedback: {
      1: 'The ICC/ESOMAR code does draw its line at 12, but the MRS code, which the agency follows, defines a child as under 16; and the ICC/ESOMAR code too asks for special care with young persons.',
      2: 'Asking a child to claim an age they aren’t is dishonest and leaves the rule broken.',
      3: 'The MRS code asks for the permission of a responsible adult for each child, obtained and verified; a head teacher can’t give it wholesale for every pupil.',
    },
    solution: 'Under the MRS Code of Conduct a child is anyone under 16, and a responsible adult’s permission must be obtained and verified before a child takes part. The codes differ (ICC/ESOMAR draws the line at 12), so the agency follows the code it belongs to and the law where the children live.',
  },
  {
    id: 'm04-m1-4', lesson: 'secondary-research', type: 'mc', kind: 'conceptual',
    prompt: 'County Business Patterns shows 48 establishments in “full-service restaurants” in a US county. A business directory of restaurant companies based in the county lists 31. Which explanation fits the Census Bureau’s definitions?',
    options: [
      'Some companies run several restaurants, and each location counts as an establishment',
      'The directory must be wrong, because official statistics are complete and accurate',
      'County Business Patterns also counts restaurants without employees, which the directory leaves out',
      'County Business Patterns counts each company once for every state where it pays tax',
    ],
    answer: 0,
    feedback: {
      1: 'Both can be right: they count different things. Official statistics are accurate for their own definitions.',
      2: 'It is the other way round: County Business Patterns covers only establishments with paid employees; non-employers are in a separate product.',
      3: 'County Business Patterns counts locations in the county, not companies by state.',
    },
    solution: 'An establishment is a single physical location at which business is conducted, so a company with five restaurants is five establishments. A count of establishments is naturally higher than a count of companies; the directory may also miss some, which is a separate question.',
  },
  {
    id: 'm04-m1-5', lesson: 'secondary-research', type: 'num', kind: 'numerical',
    prompt: 'A fictional statistics office’s diary survey finds that private households in a university city buy an average of 0.8 frozen pizzas a week. The city has 120,000 private households. Students in halls of residence, whom the survey leaves out, are thought to buy another 10% on top of the households’ total. Estimate the city’s frozen-pizza purchases in a year. Give a whole number.',
    answer: 120000 * 0.8 * 52 * 1.1, check: () => 120000 * 0.8 * 52 + 0.1 * 120000 * 0.8 * 52, tol: 0.5, unit: 'pizzas', places: 0,
    wrong: [
      { value: 120000 * 0.8 * 52, say: 'That is the private households’ total. Add the 10% bought by students in halls, whom the diary survey doesn’t cover.' },
      { value: 120000 * 0.8 * 12 * 1.1, say: 'The rate is per week, so a year has 52 of them, not 12.' },
      { value: 120000 * 0.8 * 52 / 0.9, say: 'Dividing by 0.9 treats halls as 10% of the city’s total. They add 10% on top of the households’ total: multiply by 1.10.' },
    ],
    solution: 'Households: 120,000 × 0.8 × 52 = 4,992,000 pizzas a year. Students in halls add 10%: 4,992,000 × 1.10 = 5,491,200. The estimate inherits the diary’s limits (self-reported, possibly under-reported) and the rough 10% assumption, so report it as about 5.5 million.',
  },
  {
    id: 'm04-m1-6', lesson: 'secondary-research', type: 'multi', kind: 'applied',
    prompt: 'A fictional juice brand compares two estimates of annual sales of juice shots in its city: a household diary survey, scaled up, gives 3.0 million bottles; a retail-measurement report covering about 80% of stores, grossed up, gives 3.6 million bottles. Which could explain the gap? Select all that apply.',
    options: [
      'Diaries may under-report small purchases such as single bottles',
      'The household survey leaves out bottles bought by gyms, offices and visitors',
      'Stores not covered may sell more or fewer shots per store than covered ones',
      'Grossing up for coverage always overstates a market by about a fifth',
      'The household survey must be wrong, because retail data comes from checkouts',
      'The two sources count in different units, one in bottles and one in litres',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Grossing up is exact if the uncovered stores behave like the covered ones; any error depends on how they differ, not on a fixed fifth.',
      4: 'Checkout data has its own gaps (stores that don’t share data); disagreement calls for explanation, not for discarding one source.',
      5: 'Both figures are given in bottles, so units can’t explain this gap.',
    },
    solution: 'The diaries probably miss some purchases and leave out buyers who aren’t households (gyms, offices, visitors), both of which push the household figure down; the grossed-up retail figure rests on the assumption that uncovered stores sell like covered ones. Explain the gap before using either, and report a range.',
  },
  {
    id: 'm04-m1-7', lesson: 'qualitative-research', type: 'num', kind: 'numerical',
    prompt: 'Two coders sorted 100 open answers from a fictional broadband provider’s survey into three themes (speed, price, service). They agreed on 82. Coder 1 put 50% of the answers in speed, 30% in price and 20% in service; coder 2 put 45%, 35% and 20%. What is Cohen’s kappa? Give two decimal places.',
    answer: k3k, check: () => (0.82 - (0.5 * 0.45 + 0.3 * 0.35 + 0.2 * 0.2)) / (1 - (0.5 * 0.45 + 0.3 * 0.35 + 0.2 * 0.2)), tol: 0.005, unit: '', places: 2,
    wrong: [
      { value: K3.po - k3pe, say: 'That is the agreement beyond chance, p_o − p_e. Divide it by 1 − p_e to get kappa.' },
      { value: (K3.po - 0.5 * 0.45) / (1 - 0.5 * 0.45), say: 'Chance agreement sums the products for all three themes: 0.225 + 0.105 + 0.04 = 0.37, not the speed theme alone.' },
    ],
    solution: 'p_e = 0.50 × 0.45 + 0.30 × 0.35 + 0.20 × 0.20 = 0.225 + 0.105 + 0.040 = 0.37. κ = (0.82 − 0.37) ÷ (1 − 0.37) = 0.45 ÷ 0.63 ≈ 0.71: agreement well beyond chance, though the 18 disagreements should still be read to tighten the codebook.',
  },
  {
    id: 'm04-m1-8', lesson: 'qualitative-research', type: 'formula', kind: 'applied',
    prompt: 'A fictional city theatre coded remarks from post-show interviews: participant in A, kind of theatregoer in B, theme in C. K1 holds a kind of theatregoer and K2 a theme. In K3, count the remarks from that kind of theatregoer coded to that theme, in a formula that still works if K1 or K2 changes.',
    sheet: {
      cells: { A1: 'participant', B1: 'theatregoer', C1: 'theme', ...remarkCells, J1: 'theatregoer', K1: 'first-time', J2: 'theme', K2: 'Price', J3: 'remarks' },
      vary: { K1: ['regular'], K2: ['Booking', 'Bar'] },
    },
    cell: 'K3', view: `A1:K${RR}`,
    widths: { A: 11, B: 13, C: 11, J: 13, K: 12 },
    answer: `=COUNTIFS(B2:B${RR},K1,C2:C${RR},K2)`,
    alt: [`=COUNTIFS(C2:C${RR},K2,B2:B${RR},K1)`, `=SUMPRODUCT((B2:B${RR}=K1)*(C2:C${RR}=K2))`],
    wrong: [
      { formula: `=COUNTIF(C2:C${RR},K2)`, say: 'That counts the theme for every kind of theatregoer. Add the kind in K1 as a second criterion with COUNTIFS.' },
      { formula: `=COUNTIFS(B2:B${RR},"first-time",C2:C${RR},K2)`, say: 'With the kind typed in, the formula ignores K1 and gives the wrong count when it changes. Refer to K1.' },
      { formula: `=COUNTIFS(B2:B${RR},K2,C2:C${RR},K1)`, say: 'The criteria are swapped: column B holds the kinds of theatregoer (K1) and column C the themes (K2).' },
    ],
    solution: `<x>=COUNTIFS(B2:B${RR},K1,C2:C${RR},K2)</x> gives ${count('first-time', 'Price')} for first-time theatregoers and price. Remember what the count is: remarks in the transcripts, which depend on who talked most and what the guide asked, not a share of all theatregoers.`,
  },
  {
    id: 'm04-m1-9', lesson: 'qualitative-research', type: 'classify', kind: 'conceptual',
    prompt: 'Sentences from the draft report of 12 depth interviews with users of a fictional travel app. Classify each.',
    items: [
      'Several participants in both age groups described the booking screen as “confusing”',
      '58% of users find the booking screen confusing',
      'Users will switch to a rival app unless the booking screen is redesigned',
      'One participant (P7) disagreed, finding the screen “fast once you know it”',
      'Trust came up more often than any other theme, so it is the main reason users leave',
      'Participants used the phrase “hidden fees” about prices, wording worth testing in the survey',
    ],
    categories: ['Supported by the interviews', 'Claims more than the interviews can show'],
    answer: [0, 1, 1, 0, 1, 0],
    feedback: {
      1: 'Twelve chosen participants can’t give a population share; a percentage from them invites readers to treat it as one.',
      2: 'A prediction about what users will do, and why, needs evidence of behaviour and cause, not what interviewees said.',
      4: 'How often a theme came up reflects the guide and who talked most; it doesn’t rank the reasons users leave.',
    },
    solution: 'Supported: a theme shared across groups, a dissenting view reported with its code, and customers’ own words turned into wording for the survey. Over-claims: a percentage from 12 interviews, a prediction of switching, and a ranking of reasons from how often codes appeared.',
  },
  {
    id: 'm04-m1-10', lesson: 'qualitative-research', type: 'mc', kind: 'applied',
    prompt: 'A fictional bank plans depth interviews about mobile banking with two very different groups: students and retired people. How should it plan the number of interviews?',
    options: [
      'Plan interviews for each group and stop in each when new interviews add no codes',
      'Plan twelve interviews in total, since twelve were enough in Guest and colleagues’ study',
      'Run four interviews in each group, the low end of the range found for focus groups',
      'Interview whoever replies first, since saturation doesn’t depend on who takes part',
    ],
    answer: 0,
    feedback: {
      1: 'Guest and colleagues found saturation within twelve interviews for one fairly similar group, and warned that more varied groups need more. Two very different groups need saturation in each.',
      2: 'Hennink and Kaiser’s 4 to 8 refers to focus group discussions, not interviews; for interviews their range was 9 to 17, for each kind of participant.',
      3: 'Saturation depends on how varied the participants are, so who takes part matters; the screener decides it.',
    },
    solution: 'Saturation is reached within each kind of participant. For two very different groups, plan enough interviews for each (studies suggest somewhere in the 9 to 17 range for fairly similar participants), track how many new codes each interview adds, and stop in each group when a run of interviews adds nothing.',
  },
];
