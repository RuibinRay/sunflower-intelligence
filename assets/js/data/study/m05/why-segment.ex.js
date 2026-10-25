// why-segment.ex.js — M05 · Why segment?: widgets, practice and the knowledge check (answer keys live here).
// Lantern's needs study comes from case.js (RESPONDENTS, NEEDS): all 640 respondents in the worksheets. Nettlefield Ski
// Hire, Halberd Theatre, Wyndle Ferries, Marrowgate Garden Supplies and the other businesses named here are fictional.
// Every num item's `check` recomputes its answer.
import { RESPONDENTS, NEEDS } from './case.js?v=14';

const R = RESPONDENTS, N = R.length, L = N + 1;                 // data rows 2..641
const sum = (a) => a.reduce((s, x) => s + x, 0);
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const J = Object.fromEntries(NEEDS.map((n, j) => [n.key, j]));
const LETTER = (j, base = 'K') => String.fromCharCode(base.charCodeAt(0) + j);

// ---------------------------------------------------------------- widgets
// the pairs grid: data in J:R (respondent, eight needs), the grid in A:H
const pairCells = { J1: 'respondent' };
NEEDS.forEach((n, j) => { pairCells[`${LETTER(j)}1`] = n.label; });
R.forEach((r, i) => { pairCells[`J${i + 2}`] = r.id; r.needs.forEach((v, j) => { pairCells[`${LETTER(j)}${i + 2}`] = v; }); });
const DATA = `$K$2:$R$${L}`;
const colOf = (cell) => `INDEX(${DATA},0,${cell})`;
Object.assign(pairCells, {
  A1: 'rows: need no.', B1: J.price + 1,
  A2: 'columns: need no.', B2: J.local + 1,
  A4: 'rows \\ cols', A12: 'total',
  A13: 'correlation', B13: `=CORREL(${colOf('$B$1')},${colOf('$B$2')})`,
  A14: 'rows: 6 or 7', B14: `=SUMPRODUCT(--(${colOf('$B$1')}>=6))`,
  A15: 'columns: 6 or 7', B15: `=SUMPRODUCT(--(${colOf('$B$2')}>=6))`,
  A16: 'both 6 or 7', B16: `=SUMPRODUCT((${colOf('$B$1')}>=6)*(${colOf('$B$2')}>=6))`,
  A17: 'both, if unrelated', B17: `=B14*B15/COUNT($K$2:$K$${L})`,
});
for (let k = 1; k <= 7; k++) {
  const c = String.fromCharCode(65 + k);                         // B..H
  pairCells[`${c}4`] = k;
  pairCells[`A${4 + k}`] = k;
  for (let rr = 1; rr <= 7; rr++) pairCells[`${c}${4 + rr}`] = `=SUMPRODUCT((${colOf('$B$1')}=$A${4 + rr})*(${colOf('$B$2')}=${c}$4))`;
  pairCells[`${c}12`] = `=SUM(${c}5:${c}11)`;
}
const needOptions = NEEDS.map((n, j) => [j + 1, n.label]);

function offers(v) {
  const one = ((v.nA * v.oA + v.nB * v.oB) / 100) * v.m;
  const two = ((v.nA * v.tA + v.nB * v.tB) / 100) * v.m;
  const gain = two - one - v.F;
  const buyers1 = (v.nA * v.oA + v.nB * v.oB) / 100, buyers2 = (v.nA * v.tA + v.nB * v.tB) / 100;
  const lift = two - one;
  return {
    headline: { label: 'Gain from tailored offers, after the extra fixed cost', value: usd(gain) },
    rows: [
      ['Buyers: one offer / tailored offers', `${int(buyers1)} / ${int(buyers2)}`],
      ['Contribution: one offer', usd(one)],
      ['Contribution: tailored offers, before the extra fixed cost', usd(two)],
      ['Largest extra fixed cost that still pays (break-even)', lift > 0 ? usd(lift) : 'none: tailoring adds no contribution'],
    ],
    note: lift <= 0
      ? 'The tailored offers win no more buyers than one offer, so a second offer can only cost money. Segmenting pays only when groups respond differently to offers made for them.'
      : gain >= 0
        ? `Tailoring pays by ${usd(gain)}. It would stop paying if the second offer cost more than ${usd(lift)} a year, or if the purchase rates, which are estimates, came in lower.`
        : `Tailoring loses ${usd(-gain)}: the extra buyers are worth ${usd(lift)}, less than the ${usd(v.F)} the second offer costs. One offer is the better choice unless the costs can be cut or the response raised.`,
    chart: { kind: 'bar', x: { label: 'Strategy', values: ['One offer', 'Tailored offers'] }, series: [{ name: 'Contribution after the extra fixed cost ($)', values: [Math.round(one), Math.round(two - v.F)] }], y: { label: 'Contribution ($)', format: 'money' } },
  };
}

export const widgets = {
  'ws-pairs': {
    type: 'sheet', title: 'Lantern’s needs study: how two needs combine (640 respondents)',
    sheet: { cells: pairCells },
    view: `A1:R${L}`, editable: false, mark: ['B5:H11'], maxHeight: '33rem',
    formats: { B13: '0.00', B17: '0.0' },
    widths: { A: 16, B: 6, C: 6, D: 6, E: 6, F: 6, G: 6, H: 6, I: 3, J: 10, K: 9, L: 9, M: 11, N: 13, O: 8, P: 8, Q: 9, R: 9 },
    rules: [{ range: 'B5:H11', type: 'scale' }],
    controls: [{ cell: 'B1', label: 'Rows', options: needOptions }, { cell: 'B2', label: 'Columns', options: needOptions }],
    tools: ['formulas'],
    note: 'B1 and B2 hold the numbers of the two needs chosen (1 taste … 8 novelty), rows 14–16 count respondents rating the row need, the column need and both at 6 or 7, and B17 shows how many would rate both that high if the two needs were unrelated (B14 × B15 ÷ 640). Each cell of B5:H11 counts the respondents who gave the row need the rating in column A and the column need the rating in row 4, with <x>=SUMPRODUCT((INDEX($K$2:$R$641,0,$B$1)=$A5)*(INDEX($K$2:$R$641,0,$B$2)=B$4))</x>: INDEX picks the need’s column from the data in K:R. Rating 1 is the top row, so two needs that move together fill the diagonal from top left to bottom right; two that run against each other, like price and local, fill the other diagonal. (The lesson’s figure puts 7 at the top.) Unrelated needs spread across the middle.',
  },
  'ws-offers': {
    type: 'formula', title: 'One offer or tailored offers?',
    intro: 'Two groups of potential buyers, one offer for both or a tailored offer for each.',
    inputs: [
      { id: 'nA', label: 'Group A: potential buyers', min: 0, max: 10000, step: 100, value: 2400, fmt: 'int' },
      { id: 'nB', label: 'Group B: potential buyers', min: 0, max: 10000, step: 100, value: 1600, fmt: 'int' },
      { id: 'oA', label: 'Group A buying the one offer', min: 0, max: 50, step: 1, value: 10, fmt: 'pct' },
      { id: 'oB', label: 'Group B buying the one offer', min: 0, max: 50, step: 1, value: 6, fmt: 'pct' },
      { id: 'tA', label: 'Group A buying its tailored offer', min: 0, max: 50, step: 1, value: 15, fmt: 'pct' },
      { id: 'tB', label: 'Group B buying its tailored offer', min: 0, max: 50, step: 1, value: 14, fmt: 'pct' },
      { id: 'm', label: 'Contribution per buyer', min: 5, max: 200, step: 5, value: 40, fmt: 'money' },
      { id: 'F', label: 'Extra fixed cost of the second offer', min: 0, max: 40000, step: 500, value: 9000, fmt: 'money' },
    ],
    compute: offers,
  },
};

// ---------------------------------------------------------------- guided practice
// Nettlefield Ski Hire (fictional): families and experienced skiers
const NS = { N: [3000, 1200], one: [0.08, 0.05], two: [0.11, 0.15], m: 60, F: 12000 };
const nsOne = sum(NS.N.map((n, s) => n * NS.one[s] * NS.m));
const nsTwo = sum(NS.N.map((n, s) => n * NS.two[s] * NS.m));
const pairsSheet = (() => {
  const cells = { A1: 'respondent', B1: 'Price', C1: 'Local and independent', E1: 'Threshold', F1: 6, E2: 'Both at or above the threshold' };
  R.forEach((r, i) => { cells[`A${i + 2}`] = r.id; cells[`B${i + 2}`] = r.needs[J.price]; cells[`C${i + 2}`] = r.needs[J.local]; });
  return cells;
})();
const bothAt = (t) => R.filter((r) => r.needs[J.price] >= t && r.needs[J.local] >= t).length;

export const guided = [
  {
    id: 'm05-ws-g1', type: 'steps', kind: 'numerical',
    prompt: `Nettlefield Ski Hire (fictional) sees two groups of potential customers each winter: ${int(NS.N[0])} families and ${int(NS.N[1])} experienced skiers. With one standard hire package it expects ${Math.round(NS.one[0] * 100)}% of families and ${Math.round(NS.one[1] * 100)}% of experienced skiers to hire. With two tailored packages (a family bundle with lessons, and premium skis with a boot fitting) it expects ${Math.round(NS.two[0] * 100)}% and ${Math.round(NS.two[1] * 100)}%. Each hire contributes $${NS.m}. A second package would add ${usd(NS.F)} a year of fixed cost. Should it offer two packages?`,
    solution: `One package: (${int(NS.N[0] * NS.one[0])} + ${int(NS.N[1] * NS.one[1])}) × $${NS.m} = ${usd(nsOne)}. Two packages: (${int(NS.N[0] * NS.two[0])} + ${int(NS.N[1] * NS.two[1])}) × $${NS.m} = ${usd(nsTwo)}. Gain = ${usd(nsTwo)} − ${usd(nsOne)} − ${usd(NS.F)} = ${usd(nsTwo - nsOne - NS.F)}: the tailored packages pay, mainly because experienced skiers respond three times as well to an offer made for them.`,
    steps: [
      {
        id: 'm05-ws-g1-s1', type: 'num',
        prompt: 'What contribution does one standard package earn in a winter? Give a whole number of dollars.',
        answer: nsOne, check: () => (3000 * 0.08 + 1200 * 0.05) * 60, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: (3000 + 1200) * 0.08 * 60, say: 'You applied the families’ rate, 8%, to everyone. Each group has its own purchase rate: 8% of families and 5% of experienced skiers.' },
          { value: 3000 * 0.08 + 1200 * 0.05, say: 'That is the number of hires, 300. Multiply by the $60 each contributes.' },
        ],
        hints: ['Contribution = Σ (potential buyers × purchase rate × contribution per buyer), group by group.', '(3,000 × 0.08 + 1,200 × 0.05) × $60.'],
      },
      {
        id: 'm05-ws-g1-s2', type: 'num',
        prompt: 'What contribution do the two tailored packages earn, before their extra fixed cost? Give a whole number of dollars.',
        answer: nsTwo, check: () => (3000 * 0.11 + 1200 * 0.15) * 60, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: (3000 * 0.11 + 1200 * 0.15) * 60 - 12000, say: 'That already subtracts the extra fixed cost. This step asks for the contribution before it.' },
          { value: (3000 * 0.15 + 1200 * 0.11) * 60, say: 'The rates are swapped: families are expected to hire at 11% and experienced skiers at 15%.' },
        ],
        hints: ['Use each group’s tailored purchase rate.', '(3,000 × 0.11 + 1,200 × 0.15) × $60.'],
      },
      {
        id: 'm05-ws-g1-s3', type: 'num',
        prompt: 'What is the gain from offering two packages, after the extra fixed cost? Give a whole number of dollars (negative if two packages lose money).',
        answer: nsTwo - nsOne - NS.F, check: () => (3000 * 0.11 + 1200 * 0.15) * 60 - (3000 * 0.08 + 1200 * 0.05) * 60 - 12000, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: nsTwo - nsOne, say: 'That is the extra contribution before the second package’s fixed cost of $12,000. Subtract it.' },
          { value: nsTwo - NS.F, say: 'Compare the two strategies: subtract what one package earns as well as the extra fixed cost.' },
        ],
        hints: ['Δ = C tailored − C one offer − F.', '$30,600 − $18,000 − $12,000.'],
      },
    ],
  },
  {
    id: 'm05-ws-g2', type: 'classify', kind: 'conceptual',
    prompt: 'A marketing team has proposed five segments, and each has one problem. Which of the five tests of a usable segment does each fail?',
    items: [
      'Left-handed golfers living within 10 km of a golf shop: about 40 people in all.',
      '“Free spirits”: the team can’t say how many there are, or how anyone would count them.',
      'Night-shift workers whom no medium the brand can afford reaches.',
      '“Weekday commuters” and “weekday office workers”, who reacted identically to every test advertisement.',
      'Drinkers who want a gluten-free beer, for a brewery whose equipment can’t make one.',
    ],
    categories: ['Measurable', 'Substantial', 'Accessible', 'Differentiable', 'Actionable'],
    answer: [1, 0, 2, 3, 4],
    feedback: {
      0: 'Forty people can’t pay for an offer of their own: the segment fails substantial.',
      1: 'If a segment’s size and buying power can’t be estimated, it fails measurable, however vivid the label.',
      2: 'A segment nobody can reach at an affordable cost fails accessible.',
      3: 'Two groups that respond the same way are one segment for marketing purposes: they fail differentiable.',
      4: 'The segment is real, measurable and reachable, but the brewery can’t make what it wants: it fails actionable.',
    },
    hints: ['Ask each test’s question in turn: can we measure it, is it big enough, can we reach it, does it respond differently, can we serve it?', 'A segment can be easy to describe and still fail one test.'],
    solution: 'Golfers: substantial. “Free spirits”: measurable. Night-shift workers out of reach: accessible. Commuters and office workers who respond alike: differentiable. Gluten-free beer for a brewery that can’t make it: actionable.',
  },
  {
    id: 'm05-ws-g3', type: 'multi', kind: 'conceptual',
    prompt: 'Under which conditions is mass marketing, one offer for the whole market, likely to beat segmented marketing? Select all that apply.',
    options: [
      'Buyers want much the same thing from the product.',
      'Making and selling several versions costs far more than making one.',
      'The market is small enough that each segment would be tiny.',
      'Buyers differ widely in the benefits they want and respond differently to offers.',
      'A rival already serves each segment with an offer made for it.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Wide differences in needs and responses are exactly the condition that makes segmenting pay.',
      4: 'Rivals with tailored offers make one general offer harder to sell: each segment can choose something made for it.',
    },
    hints: ['Mass marketing gives up the gain from fit in exchange for the savings of one offer.', 'When is the gain from fit small, or the cost of several offers large?'],
    solution: 'One offer wins when there is little to gain from fit (buyers want the same thing), when several offers cost much more, or when segments would be too small to pay for offers of their own. Wide differences in needs, and rivals who already tailor, both favour segmenting.',
  },
  {
    id: 'm05-ws-g4', type: 'steps', kind: 'applied',
    prompt: 'Column B holds each respondent’s rating of “a low price” and column C their rating of “from a local, independent business”, both from 1 to 7. Ana wants to know how many respondents care a lot about both.',
    solution: `<x>=COUNTIFS(B2:B641,">="&F1,C2:C641,">="&F1)</x> gives ${bothAt(6)} at a threshold of 6. Price and local are almost never both very important to the same person: one offer can’t lead on both, which is a sign of separate segments.`,
    steps: [
      {
        id: 'm05-ws-g4-s1', type: 'formula',
        prompt: 'In F2, count the respondents who rated both needs at or above the threshold in F1, so that the count updates when F1 changes.',
        sheet: { cells: pairsSheet, fixed: [`B2:C${L}`], vary: { F1: [5, 7] } },
        cell: 'F2', answer: `=COUNTIFS(B2:B${L},">="&F1,C2:C${L},">="&F1)`,
        alt: [`=SUMPRODUCT((B2:B${L}>=F1)*(C2:C${L}>=F1))`, `=COUNTIFS($B$2:$B$${L},">="&$F$1,$C$2:$C$${L},">="&$F$1)`],
        view: `A1:F${L}`, widths: { A: 11, B: 9, C: 20, E: 28, F: 9 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIFS(B2:B${L},">=6",C2:C${L},">=6")`, say: 'With 6 typed into the criteria the count ignores F1. Join the operator to the cell: ">="&F1.' },
          { formula: `=COUNTIFS(B2:B${L},">"&F1,C2:C${L},">"&F1)`, say: '“>” leaves out respondents who gave exactly the threshold. “At or above” is >=.' },
          { formula: `=COUNTIF(B2:B${L},">="&F1)+COUNTIF(C2:C${L},">="&F1)`, say: 'Adding two counts counts people who rate either need highly, some twice. Both conditions must hold for the same person: COUNTIFS with two criteria.' },
        ],
        hints: ['COUNTIFS counts the rows where every criterion holds.', 'Build each criterion from an operator and the cell: <x>">="&F1</x>.'],
      },
      {
        id: 'm05-ws-g4-s2', type: 'mc',
        prompt: 'At a threshold of 6, 146 respondents rate price that high and 110 rate local that high. What does the count in F2 suggest for Lantern?',
        options: [
          'The keenest on price and the keenest on local are almost entirely different people',
          'Price and local are the two needs that matter most to the typical Harbour City coffee drinker',
          'Since few rate both highly, an offer combining low price and local sourcing would fill a gap',
          'The study must contain an error, because most coffee drinkers want both a low price and local coffee',
        ],
        answer: 0,
        feedback: {
          1: 'Neither need is among the highest on average (price averages 4.44 and local 3.74); the count is about how the two combine in the same person.',
          2: 'An empty combination may be empty because almost nobody wants it. A gap is an opportunity only if there is demand for it, a question for module 4.',
          3: 'Nothing in the data says most people want both; the count shows that very few do.',
        },
        hints: ['Compare the count with 146 and 110.', 'What would the count be if the two needs were unrelated?'],
      },
    ],
  },
];

// ---------------------------------------------------------------- on your own
// Halberd Theatre (fictional): a student membership
const HT = { F: 8400, m: 35, lift: 0.04 };
const htMin = HT.F / (HT.lift * HT.m);
// Wyndle Ferries (fictional): one fare or two
const WF = { N: [52000, 18000], one: [0.30, 0.12], two: [0.31, 0.20], m: 14, F: 15000 };
const wfGain = sum(WF.N.map((n, s) => n * (WF.two[s] - WF.one[s]) * WF.m)) - WF.F;

export const independent = [
  {
    id: 'm05-ws-i1', type: 'num', kind: 'numerical',
    prompt: `Halberd Theatre (fictional) is considering a membership aimed at students, with its own promotions. Running it would cost $${int(HT.F)} a year. The theatre expects it to raise the share of students it reaches who buy tickets by ${Math.round(HT.lift * 100)} percentage points, and each extra student buyer contributes $${HT.m} a year. How many students must the scheme reach just to break even? Give a whole number.`,
    answer: htMin, check: () => 8400 / (0.04 * 35), unit: 'students', places: 0, tol: 1,
    wrong: [
      { value: 8400 / 35, say: 'That is how many extra buyers the scheme needs, 240. Each student reached adds only 0.04 of a buyer, so divide again by the lift: 240 ÷ 0.04.' },
      { value: 8400 / (4 * 35), say: 'Enter the lift as a share, 0.04, not as 4.' },
      { value: 8400 * 0.04 / 35, say: 'The lift belongs in the denominator: students needed = F ÷ (lift × contribution per buyer).' },
    ],
    solution: `Each student reached adds 0.04 × $35 = $1.40 of expected contribution. Break-even reach = $8,400 ÷ $1.40 = ${int(htMin)} students. If fewer students than that come within the scheme’s reach, the segment fails the substantial test however keen its members are.`,
  },
  {
    id: 'm05-ws-i2', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of segmentation, targeting and positioning in the order a business takes them.',
    items: [
      'Choose the segmentation bases and form the segments',
      'Profile and size each segment',
      'Judge each segment’s attractiveness and the business’s fit with it',
      'Choose the segment or segments to serve',
      'Choose the position to hold in each target segment',
      'Build the marketing mix that delivers the position',
    ],
    solution: 'Segmentation (form, then profile and size the segments), targeting (evaluate, then choose) and positioning (choose the position, then deliver it through the mix). Each step needs the one before: a position is a position for a target, and targets are chosen from described segments.',
  },
  {
    id: 'm05-ws-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Is each segmentation a priori or post hoc?',
    items: [
      'A supermarket compares shoppers aged under 35 with those aged 35 or over.',
      'A bank clusters 4,000 survey respondents on how much each of twelve account features matters to them.',
      'A café chain splits its loyalty-card members into those who visit weekly and those who visit less often.',
      'A streaming service groups viewers by the patterns in what they watched, letting an algorithm find the groups.',
      'An airline divides passengers into business and leisure travellers by the fare they bought.',
    ],
    categories: ['A priori', 'Post hoc'],
    answer: [0, 1, 0, 1, 0],
    feedback: {
      0: 'The age bands were chosen in advance; the data only size and describe them.',
      1: 'The groups come out of the clustering: post hoc.',
      2: 'Weekly against less often is a cut chosen before the analysis.',
      3: 'The groups emerge from the viewing data: post hoc.',
      4: 'Fare type is a basis chosen in advance.',
    },
    solution: 'A priori: age bands, visit frequency and fare type, all chosen before the data were analysed. Post hoc: the bank’s clusters of feature importance and the streaming service’s viewing patterns, where the groups come from the analysis.',
  },
  {
    id: 'm05-ws-i4', type: 'mc', kind: 'applied',
    prompt: `Wyndle Ferries (fictional) carries two groups on its island route: ${int(WF.N[0])} island residents and ${int(WF.N[1])} visitors a year who might buy a season pass. One pass: ${Math.round(WF.one[0] * 100)}% of residents and ${Math.round(WF.one[1] * 100)}% of visitors buy. Separate resident and visitor passes: ${Math.round(WF.two[0] * 100)}% and ${Math.round(WF.two[1] * 100)}%. Each pass contributes $${WF.m}, and a second pass would cost $${int(WF.F)} a year to run. What should the company conclude?`,
    options: [
      `Offer two passes: the gain after the extra cost is about ${usd(wfGain)} a year, nearly all of it from visitors`,
      `Keep one pass: residents barely respond to a pass of their own, so a second pass could never cover its running cost`,
      `Offer two passes, because residents are the larger group and the new pass raises their purchase rate`,
      `Keep one pass: the tailored passes lift total sales by only about one-tenth, too little to matter`,
    ],
    answer: 0,
    feedback: {
      1: 'Residents add little (one point of 52,000), but the gain is judged on both groups together: visitors respond strongly.',
      2: 'Residents’ rate rises by only one point; most of the gain comes from visitors, the smaller group.',
      3: 'A small percentage rise in total sales can still be worth far more than the extra cost. Compare money with money.',
    },
    solution: `Extra contribution: residents ${int(WF.N[0])} × 0.01 × $14 = $7,280; visitors ${int(WF.N[1])} × 0.08 × $14 = $20,160. Total $27,440, less the $15,000 cost, gives a gain of ${usd(wfGain)}. The segment that matters is the one that responds to tailoring, not the larger one.`,
  },
  {
    id: 'm05-ws-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the definitions.',
    text: 'A [[0]] is a group of buyers within a market who have similar needs or respond alike to marketing. Dividing a market into such groups is [[1]], and the variables used to form the groups are [[2]]. Choosing which groups to serve is [[3]], and offering one product and one marketing mix to everyone is [[4]].',
    blanks: [
      { options: ['market segment', 'market segmentation', 'segmentation bases', 'targeting', 'mass marketing', 'positioning'], answer: 0 },
      { options: ['market segment', 'market segmentation', 'segmentation bases', 'targeting', 'mass marketing', 'positioning'], answer: 1 },
      { options: ['market segment', 'market segmentation', 'segmentation bases', 'targeting', 'mass marketing', 'positioning'], answer: 2 },
      { options: ['market segment', 'market segmentation', 'segmentation bases', 'targeting', 'mass marketing', 'positioning'], answer: 3 },
      { options: ['market segment', 'market segmentation', 'segmentation bases', 'targeting', 'mass marketing', 'positioning'], answer: 4 },
    ],
    solution: 'A market segment; market segmentation; segmentation bases; targeting; mass marketing. Positioning is the third stage of STP: the place the offer should hold in the target customers’ minds.',
  },
  {
    id: 'm05-ws-i6', type: 'short', kind: 'applied',
    prompt: 'Ana’s operations manager says: “Let’s design Cold Brew for the average Harbour City coffee drinker; that way we appeal to everyone.” Write three or four sentences explaining why the needs study argues against this, using at least two figures from the lesson.',
    rubric: [
      'Says that an average of different groups can fit nobody well, with evidence that the needs pull apart (the correlations, or the almost empty corner where price and local are both very important).',
      'Uses the price and local figures: 146 rate price 6 or 7, 110 rate local 6 or 7, and only 1 rates both, against about 25 if the two were unrelated.',
      'Draws the conclusion that an average-based product would be a weak fit for each group, so Lantern should plan for segments.',
      'Notes a limit: the study is an opt-in panel, and the segments themselves still have to be formed and evaluated.',
    ],
    model: 'The averages hide very different coffee drinkers, because the needs pull apart: price and local correlate at −0.49. 146 people rate a low price 6 or 7 and 110 rate local and independent 6 or 7, but only one rates both that high, where about 25 would if the two needs were unrelated. A Cold Brew built for the average would be half price-led and half craft, a weak fit for both groups. We should plan for segments, form them from these ratings and then choose whom to serve, remembering that the panel sample makes the exact percentages uncertain.',
    solution: 'See the model answer: the evidence is the bundles of needs that pull apart (price against local, with an almost empty corner where both matter a lot); the conclusion is to segment before designing the offer.',
  },
];

// ---------------------------------------------------------------- knowledge check
// Marrowgate Garden Supplies (fictional): trade and hobby gardeners
const MG = { N: [800, 6000], one: [0.20, 0.05], two: [0.35, 0.06], m: 90, F: 11000 };
const mgGain = sum(MG.N.map((n, s) => n * (MG.two[s] - MG.one[s]) * MG.m)) - MG.F;

export const check = [
  {
    id: 'm05-ws-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A clothing brand’s plan says: “Our segment is women aged 25–34.” When is that group a market segment in the sense of this lesson?',
    options: [
      'When its members share needs or responses to the brand’s offers that set them apart from other groups',
      'When it is large enough to be worth an offer and can be reached through the media the brand buys',
      'Always, because age and sex are measurable and easy to reach, which is what a segment requires',
      'When the brand has chosen it as the group it will serve with its next collection',
    ],
    answer: 0,
    feedback: {
      1: 'Size and reach are tests of whether a segment is usable (substantial, accessible); they don’t make a group a segment. A large, reachable group whose members want different things isn’t one segment.',
      2: 'Being measurable and reachable is necessary for a usable segment, not sufficient. Women of the same age can want very different clothes.',
      3: 'That makes it a target market. A segment exists, or not, before anyone chooses it.',
    },
    solution: 'A segment is defined by similar needs or responses, different from other groups’. Demographics often describe segments well, but an age-and-sex group is a segment only if its members want or respond alike. Size and reach decide whether a segment is usable; choosing it makes it a target.',
  },
  {
    id: 'm05-ws-k2', type: 'num', kind: 'numerical',
    prompt: `Marrowgate Garden Supplies (fictional) serves ${int(MG.N[0])} trade gardeners and ${int(MG.N[1])} hobby gardeners in its area. With one catalogue, ${Math.round(MG.one[0] * 100)}% of trade and ${Math.round(MG.one[1] * 100)}% of hobby gardeners order each year; with a separate trade catalogue and account, ${Math.round(MG.two[0] * 100)}% and ${Math.round(MG.two[1] * 100)}% would. Each ordering customer contributes $${MG.m} a year, and the trade catalogue and account would cost $${int(MG.F)} a year. What is the gain from segmenting? Give a whole number of dollars (negative for a loss).`,
    answer: mgGain, check: () => 800 * 0.15 * 90 + 6000 * 0.01 * 90 - 11000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 800 * 0.15 * 90 + 6000 * 0.01 * 90, say: 'That is the extra contribution before the $11,000 the trade catalogue costs. Subtract it.' },
      { value: (800 * 0.35 + 6000 * 0.06) * 90 - 11000, say: 'That is the tailored strategy’s contribution after its extra cost. The gain compares it with one catalogue: subtract (800 × 0.20 + 6,000 × 0.05) × $90 too.' },
      { value: 800 * 0.15 * 90 - 11000, say: 'Hobby gardeners’ ordering rate also changes, from 5% to 6%; include their extra 60 orders.' },
    ],
    solution: `Extra orders: trade 800 × 0.15 = 120, hobby 6,000 × 0.01 = 60, so 180 × $90 = $16,200 of extra contribution. Less the $11,000 cost: gain ${usd(mgGain)}. The trade gardeners, a small group that responds strongly to an offer made for them, carry the decision.`,
  },
  {
    id: 'm05-ws-k3', type: 'mc', kind: 'applied',
    prompt: 'In Lantern’s study the needs come in bundles: taste with local, convenience with energy, sustainability with health, while price runs against local (1 respondent rates both price and local 6 or 7, against about 25 if they were unrelated). What does this evidence establish?',
    options: [
      'That the market is worth segmenting, but not yet how many segments there are or which to serve',
      'That Harbour City has exactly three coffee segments, one for each of the three bundles of needs',
      'That Lantern should target the taste-and-local bundle, because it matches what Lantern does well',
      'That the averages are still a fair guide to the offer, but each bundle needs its own message',
    ],
    answer: 0,
    feedback: {
      1: 'Bundles suggest groups but don’t count them; forming and choosing the number of segments is module 2’s cluster analysis.',
      2: 'Which segment to serve is a targeting decision (module 3), which needs sizes, spending, growth and competition as well as fit.',
      3: 'Averages of needs that pull apart describe a product that is a weak fit for each bundle; separate messages can’t rescue an offer built for nobody in particular.',
    },
    solution: 'Wide spreads and bundles of needs are evidence that buyers differ in systematic ways, so segmenting is worthwhile. How many segments, who is in each and which to serve are later steps of STP.',
  },
  {
    id: 'm05-ws-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true.',
    options: [
      'A priori segments are defined before the data are analysed, such as age bands or regions.',
      'Post hoc segments are formed from the data, often by clustering people on their needs.',
      'Post hoc segments are always easier to find and reach than a priori ones, because they come from data.',
      'Firmographics play the role in business markets that demographics play in consumer markets.',
      'Over-segmentation is avoided by always using as many segments as the data allow.',
      'A segment that passes four of the five tests is usable for marketing as it stands.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Usually the reverse: segments formed on needs must be profiled with reachable descriptors before anyone can find their members.',
      4: 'Using as many segments as the data allow is over-segmentation: segments too small or too similar to act on.',
      5: 'A segment that fails one test can’t yet be marketed to: one that can’t be reached, or served, is not usable however good it looks on the other four.',
    },
    solution: 'True: a priori segments are chosen in advance; post hoc segments come from the data; firmographics are the business counterpart of demographics. False: post hoc segments are usually harder to reach; more segments isn’t better; a segment must pass all five tests to be usable.',
  },
  {
    id: 'm05-ws-k5', type: 'mc', kind: 'applied',
    prompt: 'A regional energy supplier (fictional) has split its 90,000 household customers into 40 segments by tariff, region, home type and payment method, each to get its own mailing. Response rates differ little between most of the segments. What is the best advice?',
    options: [
      'Merge the segments that respond alike, keeping apart only those large and different enough to repay a mailing of their own',
      'Keep all 40, since smaller segments are more alike inside and so tend to repay tailored mailings better',
      'Replace the 40 segments with one mailing for all 90,000 customers, because segmenting has failed here',
      'Add more variables, such as age and income, so the segments become different enough to justify 40 mailings',
    ],
    answer: 0,
    feedback: {
      1: 'Being alike inside matters only if segments also differ from each other and each can repay its mailing. Forty that respond alike are over-segmented.',
      2: 'That throws away any segments that do respond differently. The fault is too many segments, not segmenting itself.',
      3: 'More variables make more, smaller cells; they don’t make customers respond differently.',
    },
    solution: 'Forty segments that respond alike fail the differentiable test and, being small, many fail substantial too. Merge those that respond alike and keep apart only segments whose response differs enough to repay a tailored mailing.',
  },
  {
    id: 'm05-ws-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Two analysts segment the same customer survey. One finds four segments using customers’ needs; the other finds six using their media habits and age. Which statement is correct?',
    options: [
      'Both can be valid: segments are a model, judged by the decision they serve and the five tests',
      'The six-segment answer is better, because more segments describe the market in more detail',
      'At most one can be right, since a market contains a particular number of segments waiting to be discovered',
      'The four-segment answer is the right one, because segments formed on needs are the true ones',
    ],
    answer: 0,
    feedback: {
      1: 'More segments are not better in themselves; past a point they become too small or too similar to act on.',
      2: 'Segments are constructed by the analyst from chosen bases; different bases give different, equally legitimate segmentations.',
      3: 'Needs are often the best basis for understanding choice, but a segmentation for planning media may sensibly use other bases.',
    },
    solution: 'There is no single true segmentation. Each is a model built on chosen bases; the useful one is the one that helps the decision at hand and whose segments are measurable, substantial, accessible, differentiable and actionable.',
  },
];
