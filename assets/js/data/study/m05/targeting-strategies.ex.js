// targeting-strategies.ex.js — M05 · Targeting strategies: widgets, practice and the knowledge check (answer keys live
// here). Lantern's respondents and segments come from case.js (RESPONDENTS, DERIVED.segments.labels); text columns
// don't change on the marker's test copies, so COUNTIFS items `vary` the label cells. The cinema chain, the hotel
// group, the soft-drink maker and the other businesses named here are fictional. Every num item's `check` recomputes
// its answer.
import { DERIVED as D, RESPONDENTS, LEVELS, tableCells } from './case.js?v=14';

const S = D.segments, NAMES = S.names, LAB = S.labels, R = RESPONDENTS, N = R.length, L = N + 1;
const G = (name) => NAMES.indexOf(name);
const EX = G('Explorers'), CL = G('Craft and local');
const members = (g) => R.filter((_, i) => LAB[i] === g);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const f1 = (x) => x.toFixed(1), p1 = (x) => `${(x * 100).toFixed(1)}%`;
const int = (x) => Math.round(x).toLocaleString('en-US');

// ---------------------------------------------------------------- widgets
const records = R.map((r, i) => ({
  Segment: NAMES[LAB[i]], Age: LEVELS.age[r.age], Income: LEVELS.income[r.income], Household: LEVELS.household[r.household],
  Region: LEVELS.area[r.area], 'Main source': LEVELS.source[r.source], 'Cold Brew intent': LEVELS.coldbrew[r.coldbrew - 1],
  'Knows Lantern': r.aware ? 'Yes' : 'No', 'Bought Lantern': r.bought ? 'Yes' : 'No',
  Respondents: 1, 'Spend a month': r.spend, 'Cups a week': r.cups, 'Local loyalty': Math.round((r.loyal.reduce((a, b) => a + b, 0) / 3) * 100) / 100, 'Top two': r.coldbrew <= 2 ? 1 : 0,
}));

function cannibal(v) {
  const c = v.c / 100;
  const gross = v.Q * v.mNew, lost = c * v.Q * v.mOld, inc = gross - lost - v.F;
  const be = (v.Q * v.mNew - v.F) / (v.Q * v.mOld);
  const net = v.mNew - c * v.mOld;
  const qNeed = net > 0 ? v.F / net : NaN;
  const rate = (x) => (x <= 0 ? 'none: the fixed costs exceed the new offer’s contribution even with no cannibalisation' : x >= 1 ? 'above 100%: the offer adds contribution at any rate' : `${(x * 100).toFixed(1)}%`);
  return {
    headline: { label: 'Incremental contribution a period', value: `${inc < 0 ? '−' : ''}$${int(Math.abs(inc))}` },
    rows: [
      ['New offer’s own contribution (Q × m_new)', `$${int(gross)}`],
      ['Taken from the existing offer (c × Q × m_old)', `$${int(lost)}`],
      ['Extra fixed costs (F)', `$${int(v.F)}`],
      ['Break-even cannibalisation rate', rate(be)],
      ['Net contribution per new unit (m_new − c × m_old)', `${net < 0 ? '−' : ''}$${Math.abs(net).toFixed(2)}`],
      ['Units needed to cover the fixed costs', Number.isFinite(qNeed) ? int(Math.ceil(qNeed)) : 'never: each new unit loses contribution'],
    ],
    note: inc >= 0
      ? `The new offer adds $${int(inc)}. It would stop adding anything if the cannibalisation rate rose to ${rate(be)}.`
      : `The new offer loses $${int(-inc)} for the company as a whole: it takes more from the existing offer, after its fixed costs, than it earns.`,
    chart: { kind: 'line', x: { label: 'Cannibalisation rate (%)', values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
      series: [{ name: 'Incremental contribution ($)', values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((k) => Math.round(v.Q * v.mNew - (k / 100) * v.Q * v.mOld - v.F)) }],
      y: { label: 'Incremental contribution ($)' } },
  };
}

export const widgets = {
  'ts-persona-pivot': {
    type: 'pivot', title: 'Lantern’s needs study: 640 respondents with their segment',
    records,
    fields: ['Segment', 'Age', 'Income', 'Household', 'Region', 'Main source', 'Cold Brew intent', 'Knows Lantern', 'Bought Lantern'],
    values: ['Respondents', 'Spend a month', 'Cups a week', 'Local loyalty', 'Top two'],
    defaults: { rows: 'Segment', cols: 'Age', value: 'Respondents', agg: 'sum', show: 'pct-row' },
    order: { Segment: NAMES, Age: LEVELS.age, Income: LEVELS.income, Household: LEVELS.household, Region: LEVELS.area, 'Main source': LEVELS.source, 'Cold Brew intent': LEVELS.coldbrew, 'Knows Lantern': ['Yes', 'No'], 'Bought Lantern': ['Yes', 'No'] },
    formats: { 'Spend a month': '$#,##0.00', 'Cups a week': '0.0', 'Local loyalty': '0.00', 'Top two': '0.0%' },
    note: 'Respondents is 1 for each person, so its Sum counts them and % of Row Total gives each segment’s shares. Top two is 1 for “definitely” or “probably would buy” Cold Brew, so its Average is the top-two-box score. Local loyalty is each person’s mean on the three-item scale (1–5).',
  },
  'ts-cannibal': {
    type: 'formula', title: 'Incremental contribution after cannibalisation',
    intro: 'A new offer for a new segment, some of whose sales come from the company’s existing offer.',
    inputs: [
      { id: 'Q', label: 'Units of the new offer (Q)', min: 100, max: 10000, step: 100, value: 3000, fmt: 'int' },
      { id: 'mNew', label: 'Contribution per new unit (m_new)', min: 1, max: 60, step: 1, value: 14, fmt: 'money' },
      { id: 'c', label: 'Cannibalisation rate (c)', min: 0, max: 100, step: 1, value: 20, fmt: 'pct' },
      { id: 'mOld', label: 'Contribution lost per cannibalised unit (m_old)', min: 1, max: 100, step: 1, value: 40, fmt: 'money' },
      { id: 'F', label: 'Extra fixed costs (F)', min: 0, max: 50000, step: 500, value: 0, fmt: 'money' },
    ],
    compute: cannibal,
  },
};

// ---------------------------------------------------------------- guided practice
// a regional cinema chain (fictional): an off-peak membership beside the standard one
const CN = { Q: 5000, mNew: 7, mOld: 18, c: 0.25, F: 3000 };
const cnInc = CN.Q * CN.mNew - CN.c * CN.Q * CN.mOld - CN.F, cnBE = (CN.Q * CN.mNew - CN.F) / (CN.Q * CN.mOld);
const pCols = ['respondent', 'segment', 'age', 'income', 'main_source', 'region', 'household'];
const pRows = R.map((r, i) => [r.id, NAMES[LAB[i]], LEVELS.age[r.age], LEVELS.income[r.income], LEVELS.source[r.source], LEVELS.area[r.area], LEVELS.household[r.household]]);
const pCells = tableCells(pCols, pRows).cells;
const matchCells = { ...pCells, I1: 'Segment', J1: 'Craft and local', I2: 'Age', J2: '45–59', I3: 'Income', J3: '$80k–120k', I5: 'Members matching all three' };
const countOf = (seg, age, inc) => pRows.filter((x) => x[1] === seg && x[2] === age && x[3] === inc).length;
const XM = members(EX), nEX = XM.length;
const ex1829 = XM.filter((r) => r.age === 0).length, exNov = XM.filter((r) => r.needs[7] >= 6).length;
const exNovOut = R.filter((r, i) => LAB[i] !== EX && r.needs[7] >= 6).length;

export const guided = [
  {
    id: 'm05-ts-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which targeting strategy is each business following?',
    items: [
      'A salt producer sells one pack at one price through every supermarket, backed by one national campaign.',
      'A hotel group runs a budget brand for families and a luxury brand for business travellers, each with its own website and prices.',
      'A saddler makes saddles only for endurance riders and sells them at endurance events.',
      'A supermarket chain stocks each store to suit the languages and festivals of its neighbourhood.',
      'An online bookshop emails each customer recommendations built from that customer’s own purchases.',
      'A carmaker sells a city car, a family SUV and a sports model, each to a different group with its own advertising.',
    ],
    categories: ['Undifferentiated marketing', 'Differentiated marketing', 'Concentrated marketing', 'Local marketing', 'Individual marketing'],
    answer: [0, 1, 2, 3, 4, 1],
    feedback: {
      0: 'One product, one price, one campaign for everyone: undifferentiated. Salt hardly varies, which is why it can work.',
      1: 'Two segments, two separate mixes: differentiated.',
      2: 'One narrow segment with one mix: concentrated (a niche).',
      3: 'The offer adapts to each store’s area: local marketing, a form of micromarketing.',
      4: 'Each customer gets their own offer from their own data: individual marketing.',
      5: 'Three segments with three models and three campaigns: differentiated.',
    },
    hints: ['Count the segments served, then ask whether each gets its own mix.', 'Local and individual marketing adapt the offer within a segment, to a place or to one person.'],
    solution: 'Salt producer: undifferentiated. Hotel group and carmaker: differentiated (separate mixes for separate segments). Saddler: concentrated on a niche. Supermarket: local marketing. Online bookshop: individual marketing.',
  },
  {
    id: 'm05-ts-g2', type: 'steps', kind: 'numerical',
    prompt: `A regional cinema chain (fictional) plans an off-peak membership for students and retired people. Each off-peak member contributes $${CN.mNew} a month; it expects ${int(CN.Q)} of them, and an extra $${int(CN.F)} a month of fixed costs. ${CN.c * 100}% of off-peak members are expected to be standard members switching down, each of whom contributed $${CN.mOld} a month.`,
    solution: `ΔC = 5,000 × 7 − 0.25 × 5,000 × 18 − 3,000 = 35,000 − 22,500 − 3,000 = $${int(cnInc)} a month. Break-even rate: (35,000 − 3,000) ÷ (5,000 × 18) = 32,000 ÷ 90,000 ≈ ${p1(cnBE)}. The expected 25% is about ten points below it: the membership adds money, but a modest error in the switching estimate would wipe it out.`,
    steps: [
      {
        id: 'm05-ts-g2-s1', type: 'num',
        prompt: 'What is the off-peak membership’s incremental contribution a month? Give a whole number of dollars.',
        answer: cnInc, check: () => 5000 * 7 - 0.25 * 5000 * 18 - 3000, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: CN.Q * CN.mNew - CN.F, say: 'That ignores the standard members who switch down. Subtract c × Q × m_old = 0.25 × 5,000 × $18.' },
          { value: CN.Q * CN.mNew - CN.c * CN.Q * CN.mOld, say: 'Nearly: subtract the $3,000 of extra fixed costs too.' },
          { value: CN.Q * CN.mNew, say: 'That is the off-peak members’ own contribution, before what they take from standard memberships and the fixed costs.' },
          { value: CN.Q * CN.mNew - CN.c * CN.Q * CN.mNew - CN.F, say: 'A switching member takes the standard membership’s $18 with them, not the off-peak $7: use m_old.' },
        ],
        hints: ['ΔC = Q × m_new − c × Q × m_old − F.', '35,000 − 0.25 × 5,000 × 18 − 3,000.'],
      },
      {
        id: 'm05-ts-g2-s2', type: 'num',
        prompt: 'At what cannibalisation rate would the membership add nothing? Give a percentage to one decimal place.',
        answer: r1(cnBE * 100), check: () => ((5000 * 7 - 3000) / (5000 * 18)) * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1((CN.mNew / CN.mOld) * 100), say: 'That is m_new ÷ m_old, the break-even rate when there are no fixed costs. Subtract F first: (Q × m_new − F) ÷ (Q × m_old).' },
          { value: r1((CN.Q * CN.mNew) / (CN.Q * CN.mOld + CN.F) * 100), say: 'The fixed costs reduce the numerator (what the new offer has left to lose); they don’t add to the denominator.' },
        ],
        hints: ['c* = (Q × m_new − F) ÷ (Q × m_old).', '(35,000 − 3,000) ÷ 90,000.'],
      },
      {
        id: 'm05-ts-g2-s3', type: 'mc',
        prompt: 'What should the chain take from these results?',
        options: [
          'The membership is safe: any positive incremental contribution means it should be launched',
          'It pays at the expected rate, but switching only ten points above it would wipe the gain out',
          'The membership loses money, because one standard member in four switches down to it',
          'Cannibalisation can be ignored, because the off-peak members are a separate segment',
        ],
        answer: 1,
        feedback: {
          0: 'The result rests on the 25% estimate; with a break-even rate of about 36%, the margin for error is narrow.',
          2: 'A quarter of off-peak members switch, not a quarter of standard members, and at 25% the membership still adds $9,500.',
          3: 'Being a separate segment doesn’t stop some members of the existing one buying the cheaper offer: that is what the 25% measures.',
        },
        hints: ['Compare the expected rate with the break-even rate.', 'How good is a 25% estimate likely to be?'],
      },
    ],
  },
  {
    id: 'm05-ts-g3', type: 'formula', kind: 'applied',
    prompt: 'Column B holds each respondent’s segment, C their age band and D their household income. J1:J3 hold three lines of a draft persona. In J5, count the respondents who match all three: in the segment in J1, the age band in J2 and the income band in J3.',
    sheet: { cells: matchCells, vary: { J1: ['Explorers', 'Mindful'], J2: ['30–44', '18–29'] } }, cell: 'J5',
    answer: `=COUNTIFS(B2:B${L},J1,C2:C${L},J2,D2:D${L},J3)`,
    alt: [`=COUNTIFS($B$2:$B$${L},$J$1,$C$2:$C$${L},$J$2,$D$2:$D$${L},$J$3)`, '=COUNTIFS(B:B,J1,C:C,J2,D:D,J3)', `=SUMPRODUCT((B2:B${L}=J1)*(C2:C${L}=J2)*(D2:D${L}=J3))`],
    view: `A1:J${L}`, widths: { B: 16, C: 8, D: 12, E: 18, F: 9, G: 18, I: 26, J: 16 }, maxHeight: '22rem',
    wrong: [
      { formula: `=COUNTIFS(C2:C${L},J2,D2:D${L},J3)`, say: 'That counts everyone in the study with that age and income, in every segment. Add the segment criterion, B2:B641 against J1.' },
      { formula: `=COUNTIF(B2:B${L},J1)`, say: 'That is the size of the segment. The persona test needs all three lines at once: COUNTIFS with three range–criterion pairs.' },
      { formula: `=COUNTIFS(B2:B${L},"Craft and local",C2:C${L},J2,D2:D${L},J3)`, say: 'With the segment typed in, the formula ignores J1. Refer to the cells so the test works for any draft.' },
    ],
    hints: ['COUNTIFS(range1, criterion1, range2, criterion2, …) counts rows that meet every criterion.', `<x>=COUNTIFS(B2:B641,J1,C2:C641,J2,D2:D641,J3)</x>.`],
    solution: `<x>=COUNTIFS(B2:B641,J1,C2:C641,J2,D2:D641,J3)</x> finds ${countOf('Craft and local', '45–59', '$80k–120k')} of Craft and local’s ${members(CL).length} members aged 45–59 with an income of $80k–120k: the two most common answers together already leave out more than four in five. Add the main source, region and household criteria and the count falls to 1.`,
  },
  {
    id: 'm05-ts-g4', type: 'steps', kind: 'applied',
    prompt: `Ana wants a persona for Explorers too. Of the segment’s ${nEX} members, ${ex1829} are aged 18–29, and ${exNov} rate novelty (“new and interesting flavours”) 6 or 7 out of 7, against ${exNovOut} of the other ${N - nEX} respondents.`,
    solution: `18–29: ${ex1829} ÷ ${nEX} ≈ ${p1(ex1829 / nEX)}. Novelty 6 or 7: ${exNov} ÷ ${nEX} ≈ ${p1(exNov / nEX)}. The persona should lead with the need that defines the segment (novelty) and give age as a share, “${Math.round((ex1829 / nEX) * 100)}% aged 18–29”.`,
    steps: [
      {
        id: 'm05-ts-g4-s1', type: 'num',
        prompt: 'What share of Explorers are aged 18–29? Give a percentage to one decimal place.',
        answer: r1((ex1829 / nEX) * 100), check: () => (members(EX).filter((r) => r.age === 0).length / members(EX).length) * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1((ex1829 / N) * 100), say: 'That divides by all 640 respondents. A persona’s shares describe the segment: divide by its 129 members.' },
          { value: r1((ex1829 / R.filter((r) => r.age === 0).length) * 100), say: 'That is the share of all 18–29s who are Explorers, a column percentage. The persona needs the share of Explorers who are 18–29.' },
        ],
        hints: ['Base: the segment’s members.', `${ex1829} ÷ ${nEX}.`],
      },
      {
        id: 'm05-ts-g4-s2', type: 'num',
        prompt: 'What share of Explorers rate novelty 6 or 7? Give a percentage to one decimal place.',
        answer: r1((exNov / nEX) * 100), check: () => (members(EX).filter((r) => r.needs[7] >= 6).length / members(EX).length) * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1((exNov / (exNov + exNovOut)) * 100), say: 'That is the share of all high-novelty respondents who are Explorers. The persona line is about the segment: divide by its 129 members.' },
        ],
        hints: ['Same base as before.', `${exNov} ÷ ${nEX}.`],
      },
      {
        id: 'm05-ts-g4-s3', type: 'mc',
        prompt: 'Which opening line for the Explorers persona does the data support best?',
        options: [
          '“Sam, 24, a design student who loves trying new things and visits a new café every single week”',
          `“Wants new and interesting flavours: ${Math.round((exNov / nEX) * 100)}% rate novelty 6 or 7, against ${Math.round((exNovOut / (N - nEX)) * 100)}% of other drinkers”`,
          '“A young drinker: Explorers are the coffee market’s 18–29s, its students”',
          '“Sam, 18–29, an early adopter who shares every new coffee find with friends online”',
        ],
        answer: 1,
        feedback: {
          0: 'An exact age and a job the survey never asked about: vivid, and not data.',
          2: `About a third of Explorers are 30 or over, and many 18–29s are in other segments. Age describes them partly; novelty defines them.`,
          3: 'Sharing on social media was not measured. Leave it out or mark it as a hypothesis to research.',
        },
        hints: ['Lead with the need that defines the segment.', 'Every line should trace to a number.'],
      },
    ],
  },
];

// ---------------------------------------------------------------- on your own
// a soft-drink maker (fictional): a new 330 ml can beside the 500 ml bottle
const SD = { mNew: 0.42, mOld: 0.60 };
const pSteps = [
  'State the segment the persona stands for, with its size and share of spending',
  'Take the highest and lowest needs indexes as what the segment cares about more and less than average',
  'Add how much, how often and where they buy, with medians beside means',
  'Give the demographic and regional lines as shares of the segment',
  'Add awareness, past purchase and intent for the brand',
  'Give it a name as a label, and a quote only from a real interview',
];

export const independent = [
  {
    id: 'm05-ts-i1', type: 'mc', kind: 'applied',
    prompt: 'A start-up with $150,000 of capital is launching its first product, a gluten-free fresh pasta. The market’s buyers differ widely (coeliacs, health-minded shoppers, people who want quick dinners), and two large pasta brands already sell to most of them. Which targeting strategy fits best at launch?',
    options: [
      'Undifferentiated: one pasta and one message for every pasta buyer, to win scale fast',
      'Differentiated: three versions for the three groups, so no segment is left to a rival',
      'Concentrated: one segment, such as coeliacs, whose needs the large brands serve least well',
      'Individual marketing: personalised offers to each shopper from a loyalty-card database',
    ],
    answer: 2,
    feedback: {
      0: 'Buyers who differ widely, large rivals and a new product all argue against one mix for everyone, and the start-up can’t outspend the brands.',
      1: 'Three mixes need three times the product development, listings and promotion that $150,000 can barely fund once.',
      3: 'Individual marketing needs customer data and a relationship the start-up doesn’t yet have.',
    },
    solution: 'Limited resources, a variable market, a new product and competitors who already serve the broad market all point to concentration. The coeliac segment needs gluten-free most, is served poorly by brands for whom it is a side line, and is reachable through specialist channels.',
  },
  {
    id: 'm05-ts-i2', type: 'num', kind: 'numerical',
    prompt: `A soft-drink maker (fictional) plans a 330 ml can for commuters, contributing $${SD.mNew.toFixed(2)} a unit. Each sale it takes from the existing 500 ml bottle loses $${SD.mOld.toFixed(2)} of contribution. With no extra fixed costs, above what cannibalisation rate would the can lose money for the company? Give a percentage to the nearest whole number.`,
    answer: 70, check: () => (0.42 / 0.60) * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: r1((SD.mOld / SD.mNew) * 100), say: 'Upside down: the break-even rate is m_new ÷ m_old, the share of sales that can be cannibalised before the losses equal the gains.' },
      { value: r1((1 - SD.mNew / SD.mOld) * 100), say: 'That is 1 − m_new ÷ m_old. The can breaks even when c × m_old = m_new, so c = m_new ÷ m_old.' },
    ],
    solution: 'With F = 0, c* = m_new ÷ m_old = 0.42 ÷ 0.60 = 0.70. Below 70% the can adds contribution; above it, each can sold takes more from the bottle than it earns. The rate is high because the can’s margin is close to the bottle’s.',
  },
  {
    id: 'm05-ts-i3', type: 'multi', kind: 'conceptual',
    prompt: 'A team is building a persona from a segmentation study. Which belong on the persona? Select all that apply.',
    options: [
      'The segment’s size and its share of customers’ spending',
      'The needs on which the segment differs most from the average customer',
      'Age, income and region as the shares of the segment they describe',
      'A job title and hobbies chosen to make the persona feel real',
      'A quote written by the team in the persona’s voice',
      'The study, its date and how the sample was drawn',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'Details the study didn’t measure make the persona vivid and wrong. Leave them out or label them as hypotheses.',
      4: 'A quote belongs only if it comes from a real interview with a member of the segment.',
    },
    solution: 'A persona is the segment’s data given a label: its base (size and spend), its defining needs, demographics as shares, and the source and date so readers know what it rests on. Invented details and invented quotes don’t belong.',
  },
  {
    id: 'm05-ts-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps for building a persona from segment data in order.',
    items: pSteps,
    solution: 'Start with what the persona stands for (its base), then the needs that define the segment, then behaviour, then demographics as shares, then the brand’s position with the segment, and only last a name and, if there is one, a real quote.',
  },
  {
    id: 'm05-ts-i5', type: 'mc', kind: 'applied',
    prompt: `Lantern’s agency drafts the Craft and local persona as: “Quinn is 52, a graphic designer in Central, owns a dog and listens to jazz while brewing pour-over at weekends.” What is the main problem?`,
    options: [
      'It should have a more common name, so that café staff find the persona easier to remember',
      'Only the place is in the data, and as a share; the age, job, dog and jazz are not',
      'It describes home brewing, while most of the segment buys coffee mostly at a café',
      'It is too short: a persona should include more such details so the team can picture Quinn',
    ],
    answer: 1,
    feedback: {
      0: 'The name is only a label; the problem is the invented content.',
      2: 'True that 61% buy mostly at a café, but the deeper problem is that most of the sentence is invented.',
      3: 'More invented detail makes the persona more vivid and less true.',
    },
    solution: `The study gives Craft and local’s age bands, region, household, income and channels as shares (38% live in Central; the age bands 30–44 and 45–59 are nearly equal), and nothing at all about jobs, pets or music. A precise age and invented habits make a persona that describes almost no one in the segment; the needs (local, taste, novelty) should lead instead.`,
  },
  {
    id: 'm05-ts-i6', type: 'classify', kind: 'applied',
    prompt: 'A retailer is planning micromarketing. Is each plan responsible, or does it raise a privacy or exclusion problem?',
    items: [
      'Suggesting coffees similar to those a customer has bought, with a clear way to switch the suggestions off.',
      'Inferring from purchases that a customer is probably pregnant and sending baby offers she never asked for.',
      'Showing job advertisements only to people under 40.',
      'Sending a new café’s opening offer to customers within two kilometres who signed up for local news.',
      'Buying a list of people’s health conditions to target energy-drink advertising.',
    ],
    categories: ['Responsible', 'Raises a privacy or exclusion problem'],
    answer: [0, 1, 1, 0, 1],
    feedback: {
      0: 'Uses data the customer expects the shop to have, for a purpose they would expect, with control.',
      1: 'Inferring a sensitive trait and acting on it unasked is a classic breach of trust.',
      2: 'Excluding people by age from job adverts can be unlawful discrimination.',
      3: 'Customers asked for local news; the offer is local. Purpose and consent match.',
      4: 'Health data are sensitive personal data, and targeting caffeine at people with health conditions fails the harm-and-vulnerability screen too.',
    },
    solution: 'Responsible micromarketing uses data customers expect to be used, for purposes they agreed to, with a way out. Inferring sensitive traits, excluding people from jobs by age, and buying health data to sell caffeine raise privacy, legal and ethical problems.',
  },
];

// ---------------------------------------------------------------- knowledge check
// a hotel group (fictional): a budget brand beside its mid-priced hotels
const HG = { Q: 8000, mNew: 22, mOld: 48, c: 0.15, F: 40000 };
const hgInc = HG.Q * HG.mNew - HG.c * HG.Q * HG.mOld - HG.F;
const shareCells = { ...pCells, I1: 'Segment', J1: 'Craft and local', I2: 'Main source', J2: 'Café', I4: 'Share of the segment with that main source' };
const shareOf = (seg, src) => pRows.filter((x) => x[1] === seg && x[4] === src).length / pRows.filter((x) => x[1] === seg).length;

export const check = [
  {
    id: 'm05-ts-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement describes concentrated marketing?',
    options: [
      'One marketing mix aimed at the whole market, ignoring the differences between its segments',
      'A separate marketing mix for each of two or more segments, often under separate brands',
      'One marketing mix aimed at a single segment or niche, seeking a large share of it',
      'Offers adapted to single customers or neighbourhoods, usually from detailed customer data',
    ],
    answer: 2,
    feedback: {
      0: 'That is undifferentiated (mass) marketing.',
      1: 'That is differentiated marketing.',
      3: 'That is micromarketing: individual and local marketing.',
    },
    solution: 'Concentrated (niche) marketing puts one mix behind one segment and aims to own it. It suits limited resources and builds deep knowledge, at the risk of having all the eggs in one basket.',
  },
  {
    id: 'm05-ts-k2', type: 'num', kind: 'numerical',
    prompt: `A hotel group (fictional) plans a budget brand. It expects ${int(HG.Q)} room-nights a month at a contribution of $${HG.mNew} each, extra fixed costs of $${int(HG.F)} a month, and that ${HG.c * 100}% of the budget room-nights would otherwise have been booked in its mid-priced hotels at $${HG.mOld} each. What is the budget brand’s incremental contribution a month? Give a whole number of dollars.`,
    answer: hgInc, check: () => 8000 * 22 - 0.15 * 8000 * 48 - 40000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: HG.Q * HG.mNew - HG.F, say: 'That leaves out the room-nights taken from the mid-priced hotels: subtract 0.15 × 8,000 × $48.' },
      { value: HG.Q * HG.mNew - HG.c * HG.Q * HG.mOld, say: 'Subtract the $40,000 of extra fixed costs too.' },
      { value: (1 - HG.c) * HG.Q * HG.mNew - HG.F, say: 'Cannibalised nights still earn the budget contribution; what is lost is the $48 they would have earned in the mid-priced hotels. ΔC = Q × m_new − c × Q × m_old − F.' },
    ],
    solution: `ΔC = 8,000 × 22 − 0.15 × 8,000 × 48 − 40,000 = 176,000 − 57,600 − 40,000 = $${int(hgInc)} a month.`,
  },
  {
    id: 'm05-ts-k3', type: 'formula', kind: 'applied',
    prompt: 'Column B holds each respondent’s segment and E their main source of coffee. J1 names a segment and J2 a main source. In J4, calculate the share of that segment’s members whose main source is the one in J2: a line for the segment’s persona.',
    sheet: { cells: shareCells, vary: { J1: ['Explorers', 'On the go', 'Mindful'], J2: ['Home-brewed', 'Supermarket or RTD'] } }, cell: 'J4',
    answer: `=COUNTIFS(B2:B${L},J1,E2:E${L},J2)/COUNTIF(B2:B${L},J1)`,
    alt: [`=COUNTIFS(E2:E${L},J2,B2:B${L},J1)/COUNTIFS(B2:B${L},J1)`, '=COUNTIFS(B:B,J1,E:E,J2)/COUNTIF(B:B,J1)', `=SUMPRODUCT((B2:B${L}=J1)*(E2:E${L}=J2))/COUNTIF(B2:B${L},J1)`],
    view: `A1:J${L}`, formats: { J4: '0.0%' }, widths: { B: 16, C: 8, D: 12, E: 18, F: 9, G: 18, I: 38, J: 18 }, maxHeight: '22rem',
    wrong: [
      { formula: `=COUNTIFS(B2:B${L},J1,E2:E${L},J2)/COUNTA(B2:B${L})`, say: 'That divides by all 640 respondents. A persona line is a share of the segment: divide by COUNTIF(B2:B641,J1).' },
      { formula: `=COUNTIFS(B2:B${L},J1,E2:E${L},J2)/COUNTIF(E2:E${L},J2)`, say: 'That is the share of everyone with that main source who belongs to the segment, a column percentage. The persona needs the share of the segment with that source.' },
      { formula: `=COUNTIFS(B2:B${L},J1,E2:E${L},J2)`, say: 'That is a count. Divide by the segment’s size to make it a share.' },
    ],
    solution: `<x>=COUNTIFS(B2:B641,J1,E2:E641,J2)/COUNTIF(B2:B641,J1)</x>: for Craft and local and Café, ${p1(shareOf('Craft and local', 'Café'))}, the persona’s “61% buy mostly at a café”. The base is the segment, not the whole study.`,
  },
  {
    id: 'm05-ts-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s agency proposes launching Cold Brew with two campaigns under the Lantern name: a craft campaign for Craft and local and Explorers, and an “energy, anywhere” campaign in convenience stores for On the go. What is the strongest objection?',
    options: [
      'On the go has too few likely buyers to be worth any campaign, since it is fourth on Ana’s scorecard',
      'Two campaigns are always too expensive for a company with Lantern’s turnover and number of cafés',
      'Two messages under one brand pull against each other, and On the go buys where Lantern earns less',
      'Convenience stores never stock craft products, so On the go could not buy the cans in any case',
    ],
    answer: 2,
    feedback: {
      0: 'On the go holds the most top-two-box answers of any segment (56 of 187). The problem is fit, cost and position, not numbers.',
      1: '“Always” is too strong; the question is whether this second campaign earns its cost, and what it does to the brand.',
      3: 'Nothing in the case says so, and a test in a few convenience stores would show whether On the go buys a craft can.',
    },
    solution: 'The plan is differentiated marketing under one brand. On the go’s needs are far from Craft and local’s, so the two campaigns would say opposite things about Lantern; serving On the go also means convenience stores, where Lantern earns $1.35 a can rather than $1.63, and competing with Corner Cup, which sits close to the segment’s ideal. A launch concentrated on the craft-minded pair, with a later test for On the go, avoids all three problems.',
  },
  {
    id: 'm05-ts-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about buyer personas are true? Select all that apply.',
    options: [
      'A persona built from the most common answer on every line may match almost no real member of the segment.',
      'A persona should lead with the needs that define the segment rather than its demographics.',
      'A persona can replace the segment’s data tables once the team has agreed on it.',
      'Every line of a data-based persona should trace to a figure about the segment.',
      'Giving the persona an exact age and income makes it more accurate than giving shares.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'The persona keeps the segment in view; the tables, with their bases, remain the evidence.',
      4: 'An exact age describes one person; shares describe the segment. Precision here is false.',
    },
    solution: 'True: modal answers combine to fit very few members (1 of 109 for Craft and local on five lines); the defining needs are shared by most members; every line should trace to data. False: the persona summarises the data rather than replacing it, and exact figures where the data give shares are invented precision.',
  },
  {
    id: 'm05-ts-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the sentences.',
    text: 'A firm that serves one segment with one mix is following [[0]] marketing. A firm with a separate mix for each of several segments is following [[1]] marketing. A café chain that changes its menu for each neighbourhood is practising [[2]] marketing, and an online shop that builds each customer’s offers from their own purchases is practising [[3]] marketing.',
    blanks: [
      { options: ['concentrated', 'differentiated', 'local', 'individual', 'undifferentiated'], answer: 0 },
      { options: ['concentrated', 'differentiated', 'local', 'individual', 'undifferentiated'], answer: 1 },
      { options: ['concentrated', 'differentiated', 'local', 'individual', 'undifferentiated'], answer: 2 },
      { options: ['concentrated', 'differentiated', 'local', 'individual', 'undifferentiated'], answer: 3 },
    ],
    solution: 'One segment, one mix: concentrated. Several segments, a mix each: differentiated. Adapting to neighbourhoods: local marketing. Adapting to each customer: individual marketing. Local and individual marketing are the two forms of micromarketing.',
  },
];
