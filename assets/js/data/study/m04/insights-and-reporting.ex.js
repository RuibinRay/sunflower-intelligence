// insights-and-reporting.ex.js — M04 · Insights and reporting: widgets, practice and the knowledge check (answer keys live
// here). Lantern's figures come from case.js (the survey, focus groups, price audit and sizing); the bookshop, bakery
// chain, bus company and catering example are fictional. Every num item's `check` recomputes its answer.
import { RESPONDENTS, STRATA, PRICE_AUDIT, DEFAULT_PLAN, COLD_BREW_SIZING, CLIENT_INTERVIEWS, DERIVED as D } from './case.js?v=13';
import { normInv } from '../../../core/inference.js?v=13';

const R = RESPONDENTS, N = R.length, Z = normInv(0.975);
const byS = STRATA.map((_, h) => R.filter((r) => r.stratum === h));
const nS = byS.map((g) => g.length), t2 = byS.map((g) => g.filter((r) => r.coldbrew <= 2).length);
const share = t2.map((x, h) => x / nS[h]);
const WT = D.coldbrew.topTwoWeighted, NEFF = D.weights.kish.nEff, WM = Z * Math.sqrt((WT * (1 - WT)) / NEFF);
const gap = (a, na, b, nb) => { const d = a - b, se = Math.sqrt((a * (1 - a)) / na + (b * (1 - b)) / nb); return { d, se, low: d - Z * se, high: d + Z * se }; };
const SUBSHOP = gap(share[0], nS[0], share[1], nS[1]), SUBNEWS = gap(share[0], nS[0], share[3], nS[3]);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const brandAvg = PRICE_AUDIT.brands.map((_, j) => mean(PRICE_AUDIT.stores.map((s) => s.prices[j]).filter((p) => p != null)));
const allAvg = D.audit.mean, PRICE = DEFAULT_PLAN.price;
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const money = (v) => `$${v.toFixed(2)}`;
const pts = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v * 100).toFixed(1)}`;

// ---------------------------------------------------------------- widgets
function words(v) {
  if (v.x1 > v.n1 || v.x2 > v.n2) return { error: 'A count can’t be larger than its base.' };
  const p1 = v.x1 / v.n1, p2 = v.x2 / v.n2;
  const g = gap(p1, v.n1, p2, v.n2);
  const lo = pts(g.low), hi = pts(g.high);
  let say;
  if (v.n1 < 30 || v.n2 < 30) say = 'One base is below 30: don’t compare these groups. Report them together, or say there were too few answers to report them separately.';
  else if (g.low > 0) say = `Group 1 is clearly higher, by between ${(g.low * 100).toFixed(1)} and ${(g.high * 100).toFixed(1)} points.`;
  else if (g.high < 0) say = `Group 2 is clearly higher, by between ${(-g.high * 100).toFixed(1)} and ${(-g.low * 100).toFixed(1)} points.`;
  else if (g.high - g.low <= 0.1) say = `Little or no difference: the gap lies between ${lo} and ${hi} points, an interval no more than 10 points wide.`;
  else say = `Can’t be told apart on these data: the gap could be anywhere from ${lo} to ${hi} points.`;
  return {
    headline: { label: 'Gap, group 1 − group 2', value: `${pts(g.d)} points` },
    rows: [['Shares', `${pct(p1)} and ${pct(p2)}`], ['95% interval for the gap', `${lo} to ${hi} points`], ['Standard error of the gap', `${(g.se * 100).toFixed(2)} points`], ['Smaller base', String(Math.min(v.n1, v.n2))]],
    note: say,
    chart: { kind: 'bar', x: { label: 'Group', values: ['Group 1', 'Group 2'] }, series: [{ name: 'Share (%)', values: [p1, p2].map((p) => Math.round(p * 1000) / 10) }], y: { label: 'Share (%)', format: 'pct' } },
  };
}

export const widgets = {
  'ir-words': {
    type: 'formula', title: 'From an interval to words',
    intro: 'Each group’s count (here, answers in the top two boxes) and base. The interval is for the difference between two independent percentages (B04). An interval that includes zero counts as narrow here when it is no more than 10 points wide.',
    inputs: [
      { id: 'x1', label: 'Group 1: count', min: 0, max: 1000, step: 1, value: t2[0], fmt: 'int' },
      { id: 'n1', label: 'Group 1: base', min: 10, max: 1000, step: 1, value: nS[0], fmt: 'int' },
      { id: 'x2', label: 'Group 2: count', min: 0, max: 1000, step: 1, value: t2[1], fmt: 'int' },
      { id: 'n2', label: 'Group 2: base', min: 10, max: 1000, step: 1, value: nS[1], fmt: 'int' },
    ],
    compute: words,
  },
  'ir-chart': {
    type: 'chart', kind: 'bar', title: 'Lantern Cold Brew: share in the top two boxes, February 2027',
    x: { label: 'Segment (base)', values: [`Subscribers (${nS[0]})`, `Other shop customers (${nS[1]})`, `Newsletter only (${nS[3]})`, `All, weighted (${N})`] },
    series: [{ name: 'Definitely or probably would buy (%)', values: [share[0], share[1], share[3], WT].map((p) => Math.round(p * 1000) / 10) }],
    y: { label: 'Share in the top two boxes (%)', format: 'pct' },
    note: `Bases in brackets; segment figures unweighted, the last weighted to the list’s segment sizes (unweighted base ${N}). Workshop participants (base ${nS[2]}) aren’t shown separately: base below 30. Margins of error: about ±${(Z * Math.sqrt(share[0] * (1 - share[0]) / nS[0]) * 100).toFixed(0)}, ±${(Z * Math.sqrt(share[1] * (1 - share[1]) / nS[1]) * 100).toFixed(0)}, ±${(Z * Math.sqrt(share[3] * (1 - share[3]) / nS[3]) * 100).toFixed(0)} and ±${(WM * 100).toFixed(0)} points.`,
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm04-ir-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each line from the draft of Ana’s Cold Brew report.',
    items: [
      `Weighted, ${pct(WT)} of Lantern’s list say they would definitely or probably buy.`,
      'Ready-to-drink buyers who don’t know Lantern judge Cold Brew as one more can, so price and the chance to try it decide whether they buy.',
      `At ${money(PRICE)}, Cold Brew would cost ${money(PRICE - brandAvg[1])} more than Daily Grind RTD’s average shelf price.`,
      'Give free cans to shoppers in natural grocers during the first month, and count how many buy again.',
      'Subscribers expect Cold Brew to taste like the coffee they already trust, which is why their intent is so much higher than other groups’.',
      'List Cold Brew in the remaining supermarkets only if the test stores without free cans average 10 cans a store a week.',
    ],
    categories: ['Finding', 'Insight', 'Recommendation'],
    answer: [0, 1, 0, 2, 1, 2],
    hints: ['A finding is a fact from the data, with its figure.', 'An insight explains why something happens; a recommendation says what to do and how to check it.'],
    feedback: {
      1: 'It explains why non-customers are cooler: it rests on the focus groups and the audit, and fits the survey’s lower intent among newsletter-only contacts.',
      4: 'It explains the gap between segments rather than stating it, which makes it an insight; the focus-group quotations support it.',
      5: 'An action with a condition set in advance: a recommendation with its decision rule.',
    },
    solution: 'Findings: the weighted intent and the price gap. Insights: why strangers hesitate (price and trial) and why subscribers are keen (taste they trust). Recommendations: the sampling with its measure, and the supermarket listing with its decision rule.',
  },
  {
    id: 'm04-ir-g2', type: 'steps', kind: 'applied',
    prompt: 'Triangulate Ana’s evidence on whether people who don’t know Lantern will pay $3.49 for Cold Brew.',
    solution: `The focus group of ready-to-drink buyers who have never bought from Lantern (group B) and the audit agree: “about two fifty … a dollar more”, and Daily Grind RTD averages ${money(brandAvg[1])}, ${money(PRICE - brandAvg[1])} below $3.49. With the survey’s gap between segments, they support one insight: intent depends on knowing Lantern, so trial among strangers is the risk to test.`,
    steps: [
      {
        id: 'm04-ir-g2-s1', type: 'mc',
        prompt: 'Which two sources bear most directly on whether people who don’t know Lantern hesitate at $3.49?',
        options: ['Group B of the focus groups and the March shelf-price audit', 'The survey’s subscribers and the subscribers’ focus group (group A)', 'The catering client interviews and the bottom-up sizing', 'The survey’s Net Promoter Score and the shelf-price audit'],
        answer: 0,
        feedback: {
          1: 'Both describe people who know Lantern well, so they share the same blind spot.',
          2: 'The catering interviews are about a different product and different buyers.',
          3: 'The NPS measures willingness to recommend Lantern among people on its list, not reactions to the can’s price.',
        },
        hints: ['Which sources include people who don’t buy from Lantern?', 'One is qualitative, one is about the prices on the shelf.'],
      },
      {
        id: 'm04-ir-g2-s2', type: 'num',
        prompt: 'By how much would $3.49 exceed Daily Grind RTD’s average price in the March audit? Give dollars to the cent.',
        answer: Math.round((PRICE - brandAvg[1]) * 100) / 100, check: () => PRICE - mean(PRICE_AUDIT.stores.map((s) => s.prices[1]).filter((p) => p != null)), unit: '$', places: 2, tol: 0.006,
        wrong: [
          { value: Math.round((PRICE - 2.29) * 100) / 100, say: '$2.29 is M02’s usual price for Daily Grind RTD. The audit’s average across the seven stores that stock it differs: convenience stores charge more, and one supermarket had it on promotion.' },
          { value: Math.round((PRICE - allAvg) * 100) / 100, say: 'That uses the average of all 24 prices in the audit, across all three brands. The question is about Daily Grind RTD alone.' },
          { value: Math.round((PRICE - 1.99) * 100) / 100, say: '$1.99 was a promotional price at one store. Use the average across the stores that stock the brand.' },
        ],
        hints: ['Average the Daily Grind RTD prices in the stores that stock it (seven of the ten).', 'Then subtract that average from $3.49.'],
      },
      {
        id: 'm04-ir-g2-s3', type: 'mc',
        prompt: 'What does the combined evidence support?',
        options: ['Intent depends on knowing Lantern, so winning trial among strangers is the risk', 'With 38% of the list ready to buy, the goal of 100,000 cans is safe', 'Price doesn’t matter, since subscribers would pay more than for big brands', 'One buyer in five cares about price, since 4 of the 20 quotations were about it'],
        answer: 0,
        feedback: {
          1: 'The 38% is stated intent from Lantern’s own list; the bottom-up estimate, about 48,000 cans, is about half the goal.',
          2: 'Subscribers would, but the people the launch must win in supermarkets aren’t subscribers.',
          3: 'Quotations illustrate themes from 15 recruited people; their counts aren’t shares of any population.',
        },
        hints: ['Look for where the sources agree.', 'Qualitative counts aren’t shares; stated intent isn’t volume.'],
      },
    ],
  },
  {
    id: 'm04-ir-g3', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to know whether a first-week offer of $2.49 makes more people buy Cold Brew again at the full price. Which evidence could answer that?',
    options: [
      'Run the offer in randomly chosen test stores and compare their repeat sales',
      'Ask a survey sample whether a first-week offer would make them buy again',
      'Hold a third focus group in which subscribers discuss first-week offers',
      'Compare repeat sales in stores that chose to run the offer with stores that didn’t',
    ],
    answer: 0,
    hints: ['The question is about cause: does the offer change behaviour?', 'Who decides which stores get the offer matters.'],
    feedback: {
      1: 'A survey records stated intentions about a hypothetical offer, which overstate what people do.',
      2: 'A focus group can suggest why an offer might work, not whether it changes how many buy again.',
      3: 'Stores that choose to run an offer may differ in other ways, busier or with keener managers, so the comparison is confounded.',
    },
    solution: 'Only a design that assigns the offer at random can attribute a difference in repeat sales to the offer: a test market in which some stores, chosen at random, run it and the rest don’t. On Lantern’s own web shop the same question could be an A/B test.',
  },
  {
    id: 'm04-ir-g4', type: 'fill', kind: 'conceptual',
    prompt: 'Choose the words Ana’s report should use.',
    text: `Subscribers’ top-two-box share (${pct(share[0])}, base ${nS[0]}) and other shop customers’ (${pct(share[1])}, base ${nS[1]}) differ by ${(SUBSHOP.d * 100).toFixed(1)} points, with a 95% interval for the gap of ${pts(SUBSHOP.low)} to ${pts(SUBSHOP.high)} points, so the two segments [[0]]. Subscribers’ share is higher than newsletter-only contacts’ by between ${(SUBNEWS.low * 100).toFixed(1)} and ${(SUBNEWS.high * 100).toFixed(1)} points, so subscribers are [[1]]. The weighted top-two share is ${pct(WT)} with a margin of about ±${(WM * 100).toFixed(1)} points, so the report should give it as [[2]] of the list.`,
    blanks: [
      { options: ['are the same', 'differ significantly', 'can’t be told apart on these bases', 'differ by exactly 6.5 points'], answer: 2 },
      { options: ['possibly keener', 'clearly keener', 'no keener', 'as keen'], answer: 1 },
      { options: ['exactly 38.2%', 'between 38% and 39%', 'at least 42%', 'between about 34% and 43%'], answer: 3 },
    ],
    hints: ['If the interval includes zero, the data can’t say which is higher.', 'A margin of ±4.4 points turns 38.2% into a range.'],
    solution: `The first interval includes zero and is wide, so the segments can’t be told apart (not “the same”). The second lies wholly above zero, so subscribers are clearly keener. The weighted share is best given as a range, about ${Math.round((WT - WM) * 100)}% to ${Math.round((WT + WM) * 100)}%, with the base and the weighting in a note.`,
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'm04-ir-i1', type: 'order', kind: 'conceptual',
    prompt: 'Put the parts of a research report in the order this lesson recommends.',
    items: ['Executive summary', 'Background and objectives', 'Method', 'Findings', 'Limitations', 'Conclusions and recommendations', 'Appendix'],
    solution: 'Answer first (executive summary), then why the research was done (background and objectives), how (method), what it found (findings), what could make it wrong (limitations), what to do (conclusions and recommendations), and the detail behind it all (appendix). Some organisations put limitations straight after the method; what matters is that they are there.',
  },
  {
    id: 'm04-ir-i2', type: 'multi', kind: 'applied',
    prompt: 'Ana’s first draft of the Cold Brew chart has a bar for each of the four segments and one labelled “All customers” (the unweighted 42.2%), a value axis from 30% to 70%, each bar labelled to one decimal place, segments sorted from keenest to least keen, and no bases. Select all the problems.',
    options: [
      'The value axis starts at 30%.',
      'No base is shown for any bar.',
      'Workshop participants, a base of 27, get a bar like the others.',
      '“All customers” is unweighted and describes only Lantern’s list.',
      'Segments are sorted from keenest to least keen.',
      'Each bar carries its percentage to one decimal place.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Sorting by size is a reasonable choice for segments, which have no natural order (unlike the answers on a scale).',
      5: 'One decimal place is fine on these bases, provided bases and margins are shown.',
    },
    solution: 'A truncated axis exaggerates gaps between shares; bars need bases; a base below 30 shouldn’t be plotted like the rest; and the overall bar should be the weighted 38.2%, labelled as Lantern’s list, not “all customers”. Sorting segments by size and labelling bars are fine.',
  },
  {
    id: 'm04-ir-i3', type: 'num', kind: 'numerical',
    prompt: 'A bakery chain (fictional) reports its staff survey by shop. The Riverside shop has only 4 staff, so its cell is suppressed. The table shows that 31 staff in all are unhappy with their rotas, and 9, 12 and 8 at the three other shops. How many Riverside staff are unhappy, as any reader of the table can work out?',
    answer: 2, check: () => 31 - (9 + 12 + 8), unit: 'staff', places: 0, tol: 0.4,
    wrong: [
      { value: 29, say: 'That is the total of the three shops shown. The hidden cell is the grand total minus them: 31 − 29.' },
      { value: 4, say: '4 is the number of staff at Riverside, not the number unhappy.' },
    ],
    solution: '31 − (9 + 12 + 8) = 2. Suppressing one cell is useless when the total and every other cell are shown: two of Riverside’s four staff can now be identified as unhappy. Suppress a second cell too (secondary suppression), or merge Riverside with another shop.',
  },
  {
    id: 'm04-ir-i4', type: 'mc', kind: 'applied',
    prompt: 'A bookshop (fictional) asked 400 customers whether they would join a $5-a-month book club: 31% said definitely or probably. In a two-month trial at one branch, offered to every customer at the till, 3% joined. What should the report conclude?',
    options: [
      'Use the trial for how many join, and the survey for who is interested and why',
      'Average the two figures to 17% and use that as the best estimate of demand',
      'Trust the survey, because its 400 answers outweigh a single branch’s trial',
      'Discard the survey, since stated intentions contain no useful information at all',
    ],
    answer: 0,
    feedback: {
      1: 'A stated and a revealed figure measure different things; averaging them has no meaning.',
      2: 'Saying “probably” costs nothing; joining costs $5 a month. The trial is the better guide to volume, though one branch may not be typical.',
      3: 'The survey still shows which customers are interested and their reasons, which helps design the offer.',
    },
    solution: 'The trial is a revealed preference and the better guide to how many will join (with the caveat that it covers one branch for two months). The survey is a stated preference: it overstates joining, but crossing interest with customer type shows who to target and why.',
  },
  {
    id: 'm04-ir-i5', type: 'short', kind: 'applied',
    prompt: 'Write the executive summary of Ana’s Cold Brew report in no more than 120 words, for her team.',
    rubric: [
      'Leads with the recommendation.',
      'Gives the key figures with their base and uncertainty: the weighted top-two share (about 34% to 43% of the list; 516 completes) and the gap between segments.',
      'Uses the qualitative and audit evidence to explain why, without turning quotations into percentages.',
      'States the main limitation: Lantern’s own list and stated intentions, not sales.',
      'States the decision rule or the test that will settle what the research can’t.',
      'Keeps findings and interpretation distinguishable, and identifies no respondent.',
    ],
    model: `Recommendation: launch Cold Brew in stages. Weighted to Lantern’s mailing list, ${pct(WT)} say they would definitely or probably buy (about ${Math.round((WT - WM) * 100)}% to ${Math.round((WT + WM) * 100)}%; 516 completes), and subscribers are clearly keener than newsletter-only contacts (${Math.round(share[0] * 100)}% against ${Math.round(share[3] * 100)}%). In our focus group, ready-to-drink buyers who don’t know Lantern compared $3.49 with cans costing about a dollar less and wanted to try first. Our bottom-up estimate is about 48,000 cans in year one, half the goal, which this plan can’t reach. We launch in our own channel and natural grocers, planning on about 33,000 cans, aim free cans at strangers, and test a few supermarkets: we list in the rest only if test stores without free cans average 10 cans a week. These are our own customers’ stated intentions, not sales.`,
    solution: 'Compare your summary with the model and the rubric. The model leads with the recommendation, gives each figure with its base and range, explains the gap with the focus groups and the audit, states the limits and the decision rule, and names no one.',
  },
  {
    id: 'm04-ir-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Where in Ana’s report does each item belong?',
    items: [
      `${N} completes from ${D.survey.allocation.reduce((a, b) => a + b, 0).toLocaleString('en-US')} invitations (AAPOR RR1, ${(D.survey.rr.RR1 * 100).toFixed(1)}%), web questionnaire, 2–16 February 2027.`,
      `Subscribers’ top-two-box share was ${pct(share[0])}, against ${pct(share[3])} for newsletter-only contacts.`,
      'The mailing list covers Lantern’s own contacts, not the city’s ready-to-drink coffee buyers.',
      'Every cross-tab with its bases, and the code frame for the open answers.',
      'Launch through Lantern’s own channel and natural grocers; test supermarkets first.',
      `Weighted to the list’s segment sizes; Kish’s effective sample size ${Math.round(NEFF)}.`,
    ],
    categories: ['Method', 'Findings', 'Limitations', 'Recommendations', 'Appendix'],
    answer: [0, 1, 2, 4, 3, 0],
    feedback: {
      2: 'Coverage is a limitation of the design: it bounds who the findings describe.',
      3: 'Full tables and the code frame support the report; they belong in the appendix, with the key figures in the findings.',
      5: 'How the data were weighted is part of the method (it is on AAPOR’s disclosure list).',
    },
    solution: 'Method: the sample, response rate, mode, dates and weighting. Findings: the segment shares. Limitations: the list’s coverage. Recommendations: the staged launch. Appendix: the full tables and the code frame.',
  },
];

// ---------------------------------------------------------------- knowledge check
const ciLow = (WT - WM) * 100;
export const check = [
  {
    id: 'm04-ir-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A bus company (fictional) has four lines for its rider survey report. Which one is an insight?',
    options: [
      'Riders mind not knowing when a bus will come more than slow trips, so arrival times may matter most',
      'Of 820 riders surveyed in June, 41% rated punctuality poor or very poor, up from 29% a year earlier',
      'Complaints about late buses doubled in the two months after the May timetable change, from 60 to 125',
      'Install real-time arrival screens at the 20 busiest stops by December, and track the ratings quarterly',
    ],
    answer: 0,
    feedback: {
      1: 'That is a finding: what the survey showed, with its base. It doesn’t explain why.',
      2: 'That is a finding from complaints data. Combined with the survey it might support an insight, but it doesn’t explain anything itself.',
      3: 'That is a recommendation: an action with a measure. It would follow from the insight.',
    },
    solution: 'The insight explains the punctuality ratings (uncertainty, not slowness, is what riders mind) and implies an action (arrival information) that the findings alone don’t. The survey figure and the complaint counts are findings; the screens are the recommendation.',
  },
  {
    id: 'm04-ir-k2', type: 'num', kind: 'numerical',
    prompt: `Ana’s weighted top-two share for Cold Brew is ${pct(WT)}, and Kish’s effective sample size for her weights is ${Math.round(NEFF)}. Her report gives the share as a range. What is the lower end of the 95% interval, in per cent? Give one decimal place.`,
    answer: Math.round(ciLow * 10) / 10, check: () => (0.382 - 1.96 * Math.sqrt((0.382 * 0.618) / 469)) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: Math.round((WT - Z * Math.sqrt((WT * (1 - WT)) / N)) * 1000) / 10, say: 'That uses all 516 completes. Unequal weights reduce the effective sample size: use Kish’s 469.' },
      { value: Math.round((WT + WM) * 1000) / 10, say: 'That is the upper end of the interval.' },
      { value: Math.round((WT - 1.645 * Math.sqrt((WT * (1 - WT)) / NEFF)) * 1000) / 10, say: '1.645 gives a 90% interval. For 95% use 1.96.' },
    ],
    solution: `Margin = 1.96 × √(0.382 × 0.618 ÷ 469) ≈ ${(WM * 100).toFixed(1)} points, so the interval runs from about ${ciLow.toFixed(1)}% to ${((WT + WM) * 100).toFixed(1)}%. In words: “between about ${Math.round(ciLow)}% and ${Math.round((WT + WM) * 100)}% of people on Lantern’s list say they would definitely or probably buy”.`,
  },
  {
    id: 'm04-ir-k3', type: 'multi', kind: 'applied',
    prompt: 'Select all the statements Ana’s Cold Brew report can make on the evidence it has.',
    options: [
      `Weighted, ${pct(WT)} of Lantern’s list say they would definitely or probably buy.`,
      `${pct(WT)} of Harbour City’s coffee drinkers will buy Cold Brew in its first three months.`,
      'Subscribers are clearly keener on Cold Brew than newsletter-only contacts.',
      'Becoming a Lantern subscriber makes people keener on Lantern’s new Cold Brew.',
      'A ready-to-drink buyer in the focus groups compared $3.49 with their usual, cheaper can.',
      '20% of ready-to-drink buyers worry about price, as 4 of 20 quotations were about it.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Two over-claims: the list isn’t the city’s coffee drinkers, and stated intent isn’t buying.',
      3: 'The survey shows an association; loyal customers choose to subscribe, so loyalty may explain both.',
      5: 'Quotations illustrate themes; their counts aren’t shares of any population.',
    },
    solution: 'Supported: the weighted finding with its population (the list), the clear gap between segments (interval 19 to 42 points), and a description of what one focus-group participant said. Not supported: projecting intent onto the city as purchases, a causal reading of the association, and treating quotation counts as shares.',
  },
  {
    id: 'm04-ir-k4', type: 'mc', kind: 'applied',
    prompt: `Suppose one of the ${CLIENT_INTERVIEWS.interviewed} catering clients interviewed in November 2026 had said: “We switched because Brewline’s urns ran dry at our March board meeting.” Ana wants to quote it, attributed to “the operations manager of a 40-person law firm on the harbour”. What should she do?`,
    options: [
      'Attribute it to “a catering client” and cut identifying details, unless the client consents',
      'Use it as written: a job title and a firm’s size aren’t personal data on their own',
      'Use it as written, because the client is a business, and anonymity rules protect only individuals',
      'Leave the quotation out and report only that some clients mentioned problems with Brewline’s urns',
    ],
    answer: 0,
    feedback: {
      1: 'A role, a firm size and a location together point to one firm among twelve: deductive disclosure.',
      2: 'The quotation is a person’s words, and with 12 clients the firm and its manager are easy to recognise. The MRS Code asks for particular care with small business samples.',
      3: 'Dropping it loses useful evidence; anonymising it keeps the evidence and protects the client.',
    },
    solution: 'Under the MRS Code participants stay anonymous unless they consent to be identified, and members must take particular care where samples are small, as in business research. Attribute the quotation to “a catering client”, remove the firm’s size, location and the meeting’s details if they could identify it, or ask the client’s permission to name them.',
  },
  {
    id: 'm04-ir-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of evidence answers each question about Lantern Cold Brew best?',
    items: [
      'Does intent differ between subscribers and newsletter-only contacts by more than chance?',
      'Why do ready-to-drink buyers who don’t know Lantern hesitate at $3.49?',
      'Does handing out free cans cause more people to buy again?',
      'How many cans does each supermarket actually sell a week after launch?',
      'How does $3.49 compare with rivals’ prices on the shelf today?',
    ],
    categories: ['A survey with a significance test', 'Focus groups or depth interviews', 'A randomised test in some stores', 'Sales records', 'A shelf-price audit'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'Reasons are qualitative questions: what people think and why, in their own words.',
      2: 'A cause needs the cause varied on purpose: sampling in randomly chosen stores, compared with the rest.',
      3: 'What people actually buy is a revealed preference: read it from sales.',
    },
    solution: 'Comparing groups: a survey and a test. Reasons: qualitative research. Causes: a randomised experiment. Actual behaviour: sales data. Competitors’ prices: a store audit. Each method answers its own kind of question.',
  },
  {
    id: 'm04-ir-k6', type: 'mc', kind: 'applied',
    prompt: 'Suppose that twelve weeks after launch the test supermarkets without free cans have sold an average of 6 cans a store a week, against the decision rule of 10 set before launch. What does acting on the research mean then?',
    options: [
      'Hold the wider listing, as the rule says, and look into why the sales fell short',
      'Keep the 100,000-can goal, because the survey found 38% of the list would buy',
      'Run a new survey to check whether customers still say they intend to buy Cold Brew',
      'Cut the price at once, because the focus groups talked about price more than taste',
    ],
    answer: 0,
    feedback: {
      1: 'Stated intent from Lantern’s list was never a forecast of supermarket sales; the test’s sales are the better evidence.',
      2: 'Another survey would measure intentions again; the test has already measured behaviour.',
      3: 'The focus groups suggest price as one possible reason; a price change is a decision to test, not to make on four quotations.',
    },
    solution: 'The decision rule exists so that the result, not enthusiasm, decides. Lantern holds the wider listing, keeps its own channel and the natural grocers, and investigates the shortfall (placement, price, awareness), perhaps with a price test, before deciding again. Comparing 6 with the assumed 10 also tells Ana how far to trust her sizing assumptions next time.',
  },
];
