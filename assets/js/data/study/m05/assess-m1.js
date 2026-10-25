// assess-m1.js — M05 module 1 test: Segmentation bases (why-segment, demographic-and-geographic,
// psychographic-and-behavioural). New businesses and new angles: the gain from segmenting when tailored offers also change
// the margin, sorting activities into the stages of STP, a first segmentation from records alone, why the nested B2B
// approach works from the outside in, penetration in Excel, Cramér's V for a two-row table, age against cohort effects, a
// non-significant Lantern cross-tab, the share of visits from heavy users given band averages, Kotler's behavioural
// variables, a psychographic system misapplied to a business market, and sound and unsound uses of geodemographics.
// Tamsworth Language School, Fellbrook Animal Rescue, Thistlebay Florists, Corrin Wines, Ravensmere Cinemas, Brightlock
// Adhesives and the other businesses are fictional. No hints; solutions show when the student reviews the test. Every num
// item's `check` recomputes its answer.
import { RESPONDENTS, LEVELS } from './case.js?v=14';
import * as I from '../../../core/inference.js?v=14';

const R = RESPONDENTS;
const HH = I.chisqIndependence(LEVELS.household.map((_, l) => LEVELS.source.map((__, s) => R.filter((r) => r.household === l && r.source === s).length)));
// Tamsworth Language School: one course or two, with different margins
const TL = { N: [1500, 4000], one: [0.04, 0.03], m1: 200, two: [0.07, 0.04], m2: [320, 180], F: 20000 };
const tlOne = (TL.N[0] * TL.one[0] + TL.N[1] * TL.one[1]) * TL.m1;
const tlTwo = TL.N[0] * TL.two[0] * TL.m2[0] + TL.N[1] * TL.two[1] * TL.m2[1];
// Thistlebay Florists: customers by area type
const TF = { types: ['Town centre', 'Riverside flats', 'Older suburbs', 'New estates', 'Villages', 'Farmland'], hh: [6400, 5200, 11800, 9300, 4100, 1700], cust: [416, 182, 1003, 372, 287, 34] };
const tfCells = { A1: 'area type', B1: 'households', C1: 'customers', D1: 'customers per 1,000 households' };
TF.types.forEach((t, i) => Object.assign(tfCells, { [`A${i + 2}`]: t, [`B${i + 2}`]: TF.hh[i], [`C${i + 2}`]: TF.cust[i] }));
const tfPen = TF.hh.map((h, i) => (TF.cust[i] / h) * 1000);
// ticketing app: region (4) by bought in the last month (2)
const TA = { chi: 24.2, n: 1500 };
// Ravensmere Cinemas: member bands
const RC = { share: [0.50, 0.35, 0.15], visits: [2, 6, 16] };
const rcHeavy = (RC.share[2] * RC.visits[2]) / (RC.share[0] * RC.visits[0] + RC.share[1] * RC.visits[1] + RC.share[2] * RC.visits[2]);
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

export const items = [
  // ---------------------------------------------------------------- why-segment
  {
    id: 'm05-m1-1', lesson: 'why-segment', type: 'num', kind: 'numerical',
    prompt: 'Tamsworth Language School (fictional) runs evening courses. Its town has 1,500 business professionals and 4,000 people planning to travel abroad who might enrol. With one general course, 4% of the professionals and 3% of the travellers would enrol, each enrolment contributing $200. With two courses, a business course at a higher price and a travel course, 7% of professionals would enrol at $320 of contribution each and 4% of travellers at $180 each. The second course adds $20,000 a year of fixed cost. What is the gain from offering two courses? Give a whole number of dollars (negative for a loss).',
    answer: tlTwo - tlOne - TL.F, check: () => (1500 * 0.07 * 320 + 4000 * 0.04 * 180) - (1500 * 0.04 + 4000 * 0.03) * 200 - 20000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: (1500 * 0.07 + 4000 * 0.04) * 200 - tlOne - TL.F, say: 'That keeps the $200 contribution for the tailored courses. The business course earns $320 per enrolment and the travel course $180: a tailored offer can change the margin as well as the purchase rate.' },
      { value: tlTwo - tlOne, say: 'That is the extra contribution before the second course’s $20,000 of fixed cost. Subtract it.' },
      { value: tlTwo - TL.F, say: 'The gain compares two strategies: subtract the one-course contribution, (60 + 120) × $200, as well.' },
    ],
    solution: `One course: (1,500 × 0.04 + 4,000 × 0.03) × $200 = 180 × $200 = ${usd(tlOne)}. Two courses: 105 × $320 + 160 × $180 = $33,600 + $28,800 = ${usd(tlTwo)}. Gain = ${usd(tlTwo)} − ${usd(tlOne)} − $20,000 = ${usd(tlTwo - tlOne - TL.F)}. Most of it comes from the business course’s higher margin, which only a tailored offer could charge.`,
  },
  {
    id: 'm05-m1-2', lesson: 'why-segment', type: 'classify', kind: 'conceptual',
    prompt: 'A brand’s planning team lists its tasks for the year. Which stage of segmentation, targeting and positioning does each belong to?',
    items: [
      'Deciding which survey questions to cluster respondents on',
      'Estimating how many people are in each group and what they spend',
      'Scoring each group on its size, growth and competition',
      'Deciding to serve two of the five groups and not the other three',
      'Agreeing that the brand should be seen as the craft choice that is also easy to find',
      'Setting the price and the pack design so that they fit that image',
    ],
    categories: ['Segmentation', 'Targeting', 'Positioning'],
    answer: [0, 0, 1, 1, 2, 2],
    feedback: {
      0: 'Choosing the bases is the first step of segmentation.',
      1: 'Profiling and sizing the groups completes segmentation.',
      2: 'Judging attractiveness is targeting.',
      3: 'Choosing which segments to serve is the targeting decision.',
      4: 'The place the brand should hold in customers’ minds is the position.',
      5: 'Building the marketing mix that delivers the position is the last step of positioning.',
    },
    solution: 'Segmentation: choosing the bases and sizing the groups. Targeting: scoring the groups and choosing which to serve. Positioning: choosing the place to hold in the targets’ minds and building the mix that delivers it.',
  },
  {
    id: 'm05-m1-3', lesson: 'why-segment', type: 'mc', kind: 'applied',
    prompt: 'Fellbrook Animal Rescue (fictional) wants to segment its 12,000 donors for an autumn appeal that must be planned within a month. It holds each donor’s gift amounts, how often they give and how they first gave, and it has no budget for a survey. Which approach fits best?',
    options: [
      'An a priori segmentation from its own records, such as regular against one-off donors and gift size, refined with research later',
      'A post hoc needs-based segmentation, because segments formed by clustering needs always explain giving better than records of gifts do',
      'One appeal for every donor, because the donors of an animal charity all share the same motive',
      'Waiting until it can afford a survey, since segments built from records are not real segments',
    ],
    answer: 0,
    feedback: {
      1: 'Needs-based segments need a survey Fellbrook can’t afford in time; and records of giving are behaviour, often a strong base for a charity’s own donors.',
      2: 'Donors give for many reasons and respond differently to appeals; assuming they are all alike gives up whatever segmenting could add.',
      3: 'A priori segments from behaviour are real, usable segments if they pass the five tests; waiting delays the appeal for no clear gain.',
    },
    solution: 'With records of behaviour, no survey budget and a deadline, an a priori behavioural segmentation (frequency, gift size, how they first gave) is measurable, accessible and quick. It can be refined later with a needs survey; the two kinds of segmentation complement each other.',
  },
  {
    id: 'm05-m1-4', lesson: 'why-segment', type: 'mc', kind: 'conceptual',
    prompt: 'Shapiro and Bonoma’s nested approach to industrial markets puts general characteristics such as industry, company size and location in the outer ring and the buyers’ personal characteristics at the centre. Why does a marketer work from the outside in?',
    options: [
      'Outer criteria are the easiest to observe; move inward only while the insight repays the effort',
      'Outer criteria explain why firms buy better than any of the inner criteria can',
      'Using buyers’ personal characteristics to segment business customers is generally against the law',
      'The outer ring is the only one that can be measured from the information firms publish about themselves',
    ],
    answer: 0,
    feedback: {
      1: 'The inner rings are usually closer to why a firm buys; they are harder to assess, not less informative.',
      2: 'There is no such general rule; the inner criteria are harder to observe, which is why they come last.',
      3: 'Published information covers the outer ring well, but operating variables and purchasing approaches can also be learned from customers and sales staff.',
    },
    solution: 'The rings run from criteria that are easy and cheap to observe (industry, size, location) to those that are subtle and costly to assess (purchasing approaches, situations, buyers’ personal characteristics). Starting outside and moving inward only while the extra insight repays the effort keeps segmentation practical.',
  },
  // ---------------------------------------------------------------- demographic-and-geographic
  {
    id: 'm05-m1-5', lesson: 'demographic-and-geographic', type: 'formula', kind: 'numerical',
    prompt: 'Thistlebay Florists (fictional) delivers flowers across six area types. Columns B and C hold each area type’s households and Thistlebay’s customers. In D2, calculate the customers per 1,000 households, in a formula that can be filled down to D7.',
    sheet: { cells: tfCells }, cell: 'D2', fill: 'D2:D7',
    answer: '=C2/B2*1000',
    alt: ['=1000*C2/B2', '=C2*1000/B2', '=(C2/B2)*1000'],
    view: 'A1:D7', formats: { B: '#,##0', C: '#,##0', D: '0.0' }, widths: { A: 16, B: 12, C: 11, D: 30 },
    wrong: [
      { formula: '=B2/C2*1000', say: 'The division is upside down: households per customer. Penetration is customers ÷ households × 1,000.' },
      { formula: '=C2/SUM($B$2:$B$7)*1000', say: 'That divides each area’s customers by all households in the region, which mixes the area’s size with how well Thistlebay does there. Divide by the area’s own households.' },
      { formula: '=C2/$B$2*1000', say: '$B$2 divides every row by the town centre’s households. Leave the reference relative so each row uses its own.' },
      { formula: '=C2/B2*100', say: 'That is per 100 households, a percentage. The heading asks for customers per 1,000.' },
    ],
    solution: `<x>=C2/B2*1000</x> filled down gives ${tfPen.map((v) => v.toFixed(1)).join(', ')} customers per 1,000 households. Older suburbs and villages lead; farmland and riverside flats trail. The rates, not the raw customer counts, compare the areas fairly.`,
  },
  {
    id: 'm05-m1-6', lesson: 'demographic-and-geographic', type: 'num', kind: 'numerical',
    prompt: 'A ticketing app (fictional) crossed 1,500 users’ region (four regions) with whether they bought a ticket in the last month (yes or no), and found χ² = 24.2. What is Cramér’s V? Give three decimal places.',
    answer: Math.round(Math.sqrt(TA.chi / (TA.n * 1)) * 1000) / 1000, check: () => Math.sqrt(24.2 / (1500 * Math.min(4 - 1, 2 - 1))), unit: '', places: 3, tol: 0.002,
    wrong: [
      { value: Math.round(Math.sqrt(TA.chi / (TA.n * 3)) * 1000) / 1000, say: 'You used r − 1 = 3. V uses the smaller of r − 1 and c − 1; with two columns that is 1.' },
      { value: Math.round(Math.sqrt(TA.chi / (TA.n * 2)) * 1000) / 1000, say: 'You used min(r, c) = 2. V divides by n × min(r − 1, c − 1) = 1,500 × 1.' },
      { value: Math.round((TA.chi / TA.n) * 1000) / 1000, say: 'That is V², 0.016. Take the square root.' },
    ],
    solution: `With a 4 × 2 table, min(r − 1, c − 1) = 1, so V = √(24.2 ÷ 1,500) = √0.0161 ≈ ${Math.sqrt(TA.chi / TA.n).toFixed(3)}: a weak association, though highly significant with 3 degrees of freedom.`,
  },
  {
    id: 'm05-m1-7', lesson: 'demographic-and-geographic', type: 'mc', kind: 'conceptual',
    prompt: 'A 2027 survey for Corrin Wines (fictional) finds that adults under 30 drink wine far less often than adults over 50. Its planner concludes: “Wine drinking will fall as today’s under-30s replace today’s over-50s.” What is the main problem with the conclusion?',
    options: [
      'One survey can’t separate an age effect from a cohort effect: under-30s may drink more wine as they age',
      'Age should be recorded in exact years rather than in bands, or comparisons between age groups mean nothing at all',
      'Income bands should have been used, since income always explains wine drinking better than age does in surveys',
      'Differences between age bands are never statistically significant in a single survey',
    ],
    answer: 0,
    feedback: {
      1: 'Bands are the usual way to record age and support comparisons well; the issue is what an age difference in one survey can and can’t reveal.',
      2: 'Income may matter too, but no base “always” explains better; the conclusion’s flaw is about age and cohort.',
      3: 'Age differences can be highly significant; significance doesn’t say whether the young will keep their habits.',
    },
    solution: 'The planner reads an age difference as a cohort effect (the young will keep drinking less). It could equally be an age effect (people drink more wine as they get older), or a mix. One cross-sectional survey can’t tell them apart; repeated surveys of the same cohorts can.',
  },
  {
    id: 'm05-m1-8', lesson: 'demographic-and-geographic', type: 'mc', kind: 'applied',
    prompt: `In Lantern’s needs study, crossing household type (single, couple, family with children, sharing) with main source of coffee gives χ² = ${HH.stat.toFixed(1)} with ${HH.df} degrees of freedom, p = ${HH.p.toFixed(2)}, and Cramér’s V = ${HH.cramersV.toFixed(2)}. What should Ana conclude?`,
    options: [
      'The study gives no evidence that household type is associated with where people get their coffee, so it is a poor base for that decision',
      'Household type has a strong effect on where people buy, but 640 respondents are too few to detect it',
      'Every household type buys its coffee in exactly the same places, so household can be ignored in all decisions',
      'Household type is a useful base, since a p-value of 0.26 is close to being significant',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing suggests a strong effect: V is close to zero. Absence of evidence is not proof of no effect, but it is no reason to segment on household.',
      2: 'A non-significant test doesn’t prove the groups are identical, and household may matter for other decisions, such as pack sizes.',
      3: 'A p-value of 0.26 means differences this large arise often by chance; “close to significant” is not evidence.',
    },
    solution: `p = ${HH.p.toFixed(2)} and V = ${HH.cramersV.toFixed(2)}: the differences between household types in where they get coffee are no larger than chance would often produce. That doesn’t prove there are none, but it gives Lantern no reason to use household as a base for decisions about where to sell.`,
  },
  {
    id: 'm05-m1-12', lesson: 'demographic-and-geographic', type: 'multi', kind: 'applied',
    prompt: 'A home-improvement retailer (fictional) has bought a geodemographic classification of its region. Select all the uses that are sound.',
    options: [
      'Profiling its loyalty-card customers’ postcodes to see which neighbourhood types they come from.',
      'Choosing which neighbourhoods get a leaflet drop, then measuring the response by type.',
      'Refusing in-store credit to anyone whose postcode is classified as a low-income type.',
      'Writing personalised letters that assume every household in a “young families” postcode has children.',
      'Finding areas whose profile matches its best stores’ catchments when choosing a site for a new store.',
      'Estimating the number of households of each type within reach of a planned store.',
    ],
    answer: [0, 1, 4, 5],
    feedback: {
      2: 'A postcode’s type describes the area, not each applicant: this is the ecological fallacy, and an unfair one. Judge individuals on their own information.',
      3: 'The same fallacy: many households in a “young families” postcode have no children, and letters that assume they do will misfire.',
    },
    solution: 'Sound: profiling customers’ postcodes, choosing where to concentrate a leaflet drop and measuring the response, matching sites to successful catchments, and counting households by type. Unsound: refusing credit or personalising letters on the assumption that each household matches its area’s type, the ecological fallacy.',
  },
  // ---------------------------------------------------------------- psychographic-and-behavioural
  {
    id: 'm05-m1-9', lesson: 'psychographic-and-behavioural', type: 'num', kind: 'numerical',
    prompt: 'Ravensmere Cinemas (fictional) groups its members by visits last year: light members (50% of members) averaged 2 visits, medium members (35%) 6 visits and heavy members (15%) 16 visits. What share of all member visits came from heavy members? Give a percentage to one decimal place.',
    answer: Math.round(rcHeavy * 1000) / 10, check: () => (0.15 * 16) / (0.5 * 2 + 0.35 * 6 + 0.15 * 16) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 15, say: 'That is heavy members’ share of members. Their share of visits weights each band by its average visits.' },
      { value: Math.round((16 / (2 + 6 + 16)) * 1000) / 10, say: 'That averages the bands as if each held the same number of members. Weight each band’s visits by its share of members: 0.15 × 16 ÷ (0.50 × 2 + 0.35 × 6 + 0.15 × 16).' },
      { value: Math.round(0.15 * 16 * 10) / 10, say: '2.4 is heavy members’ visits per member of the whole scheme. Divide by all visits per member, 5.5.' },
    ],
    solution: `Visits per member: light 0.50 × 2 = 1.0, medium 0.35 × 6 = 2.1, heavy 0.15 × 16 = 2.4, total 5.5. Heavy members’ share = 2.4 ÷ 5.5 ≈ ${(rcHeavy * 100).toFixed(1)}%: 15% of members bring under half the visits, close to the pattern usually found and far from 80/20.`,
  },
  {
    id: 'm05-m1-10', lesson: 'psychographic-and-behavioural', type: 'classify', kind: 'conceptual',
    prompt: 'Which behavioural segmentation variable does each description illustrate?',
    items: [
      'Buys flowers only for birthdays and anniversaries.',
      'Chooses a phone plan mainly to get the most data for the lowest price.',
      'Used to subscribe to the magazine but cancelled last year.',
      'Has heard of the new electric car and is reading reviews of it.',
      'Flies with the same airline whenever it has a route, even at a higher fare.',
      'Orders a takeaway more than four times a week.',
    ],
    categories: ['Occasion', 'Benefits sought', 'User status', 'Readiness stage', 'Loyalty status', 'Usage rate'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      0: 'Buying tied to particular events is occasion segmentation.',
      1: 'What the buyer most wants from the product is the benefit sought.',
      2: 'A former customer is an ex-user: user status.',
      3: 'Aware and gathering information: a buyer-readiness stage.',
      4: 'Sticking to one brand even at a cost is strong loyalty status.',
      5: 'How often someone buys is usage rate.',
    },
    solution: 'Occasion: flowers for birthdays. Benefits sought: most data for the price. User status: the lapsed subscriber. Readiness stage: aware and reading reviews. Loyalty status: the same airline at a higher fare. Usage rate: takeaways four times a week.',
  },
  {
    id: 'm05-m1-11', lesson: 'psychographic-and-behavioural', type: 'mc', kind: 'applied',
    prompt: 'Brightlock Adhesives (fictional) sells industrial glues to furniture factories. An agency proposes segmenting its customers by VALS type. What is the main weakness of the proposal?',
    options: [
      'VALS types people by their motivations, not firms by their needs',
      'VALS types can’t be trusted because people answer a questionnaire to be assigned to one',
      'VALS has only five types, too few to cover the many kinds of industrial buyer',
      'VALS applies only to Innovators and Achievers, the types with the most resources to spend',
    ],
    answer: 0,
    feedback: {
      1: 'A questionnaire is how most psychographic and needs data are gathered; that isn’t the weakness here.',
      2: 'VALS has eight US types, and the number isn’t the problem: the unit is.',
      3: 'VALS classifies all adults, from Innovators to Survivors; that isn’t the weakness here.',
    },
    solution: 'VALS is a consumer psychographic system: it classifies individual adults by resources and motivation. Brightlock’s customers are factories whose buying centres decide on technical and commercial grounds, so firmographic, needs-based and value-based bases fit; the buyers’ personal characteristics are only the innermost ring of the nested approach.',
  },
];
