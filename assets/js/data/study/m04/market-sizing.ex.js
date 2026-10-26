// market-sizing.ex.js — M04 · Market sizing: widgets, practice and the knowledge check (answer keys live here).
// Lantern's sizing inputs come from case.js (COLD_BREW_SIZING, CATEGORY, CHANNELS); Ana's low and high values for the
// sensitivity chart are the lesson's fictional assumptions. Pennock Kombucha, Wrexley Garden Centre, Pellinore Software,
// Ormsgill Cinemas and Quillfield Juice are fictional, as are the energy-drink brand and the meal-kit start-up. Formula
// items are marked by their results on the sheet and on copies with the numbers changed; num items recompute their answers.
import { CATEGORY, CHANNELS, COLD_BREW_SIZING as SZ, DERIVED as D } from './case.js?v=20';

const CH = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
const P = SZ.plan;
const c0 = (x) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Ana's sizing model as sheet cells: inputs in B3:B6 and the channel table in A8:G12; `results: false` leaves out
 *  G9:G12 (Lantern's cans) and `summary: false` the checks in A14:B18, for exercises that build them. */
export function sizingCells({ results = true, summary = true } = {}) {
  const c = {
    A1: 'Lantern Cold Brew: year-one sizing model (fictional)',
    A3: 'Category cans a year, all brands and channels (TAM)', B3: CATEGORY.cansPerYear,
    A4: 'Weeks in the year', B4: 52,
    A5: 'Lantern’s own channel: cans a month', B5: SZ.directPerMonth,
    A6: 'First-year goal (cans)', B6: SZ.goalCans,
    A8: 'Channel', B8: 'Share of category cans', C8: 'Category cans a year', D8: 'Stores in the city', E8: 'Stores listing Lantern', F8: 'Lantern cans a store a week', G8: 'Lantern cans a year',
    A9: 'Supermarkets', B9: CH.supermarket.volume, C9: '=B9*$B$3', D9: SZ.stores.supermarket, E9: P.supermarket.listed, F9: P.supermarket.cansPerWeek,
    A10: 'Natural and specialty grocers', B10: CH.natural.volume, C10: '=B10*$B$3', D10: SZ.stores.natural, E10: P.natural.listed, F10: P.natural.cansPerWeek,
    A11: 'Cafés and online shops (Lantern’s own)', B11: CH.direct.volume, C11: '=B11*$B$3',
    A12: 'Planned channels (SAM)', B12: '=SUM(B9:B11)', C12: '=SUM(C9:C11)',
  };
  if (results) Object.assign(c, { G9: '=E9*F9*$B$4', G10: '=E10*F10*$B$4', G11: '=B5*12', G12: '=SUM(G9:G11)' });
  if (summary) Object.assign(c, {
    A14: 'Bottom-up estimate as a share of SAM', B14: '=G12/C12',
    A15: 'Goal as a share of SAM', B15: '=B6/C12',
    A16: 'Gap: goal minus bottom-up (cans)', B16: '=B6-G12',
    A17: 'Category cans an average supermarket sells a week', B17: '=C9/D9/B4',
    A18: 'Lantern’s share of a listing supermarket’s category', B18: '=F9/B17',
  });
  return c;
}
const N0 = '#,##0';
const SIZING_FORMATS = { B3: N0, B4: N0, B5: N0, B6: N0, B9: '0%', B10: '0%', B11: '0%', B12: '0%', C: N0, D: N0, E: N0, F: N0, G: N0, B14: '0.0%', B15: '0.0%', B16: N0, B17: N0, B18: '0.0%' };
const SIZING_WIDTHS = { A: 44, B: 13, C: 13, D: 11, E: 12, F: 13, G: 13 };

// the sensitivity (Ana's fictional low and high values), as in the lesson
const model = (sl, sv, nl, nv, d) => (sl * sv + nl * nv) * 52 + d * 12;
const BASE = [30, 10, 25, 14, 1200], LO = [20, 6, 18, 8, 600], HI = [40, 14, 30, 20, 1800];
const at = (i, v) => { const a = [...BASE]; a[i] = v; return model(...a); };
const ORDER = [3, 4, 1, 0, 2];
const BU = model(...BASE);                                            // 48,200

// Wrexley Garden Centre (fictional): the repotting service
const WREX = { customers: [3200, 5400, 9800], share: [0.12, 0.05, 0.015], uses: [1.5, 1.2, 1], price: 18 };
const wrexUses = WREX.customers.reduce((a, n, i) => a + n * WREX.share[i] * WREX.uses[i], 0);

export const widgets = {
  'ms-model': {
    type: 'sheet', title: 'Lantern Cold Brew: year-one sizing model (Ana’s assumptions are fictional)',
    sheet: { cells: sizingCells() }, view: 'A1:G18', widths: SIZING_WIDTHS, formats: SIZING_FORMATS,
    editable: 'B3:F11', mark: ['G12', 'B14:B16'],
    tools: ['formulas', 'goalseek', 'datatable', 'reset'],
    goalseek: { target: 'G12', goal: SZ.goalCans, changing: 'F9' },
    datatable: { target: 'G12', input: 'E9', values: [20, 30, 40, 60, 90, 120], input2: 'F9', values2: [6, 10, 14, 20, 30], format: N0 },
    note: `The model opens with Ana’s plan: ${c0(D.sizing.bottomUpCans)} cans, ${(D.sizing.bottomUpShareOfSam * 100).toFixed(1)}% of the SAM. Goal Seek as set finds the supermarket rate of sale that would reach 100,000 cans (about 43 a store a week); compare it with B17. In the data table, listings run down the side (E9 is the column input cell) and rates of sale across the top (F9 is the row input cell): only combinations far beyond the buyers’ figures reach the goal. Set E9 to 120 and F9 to 10 to see that even every supermarket at Ana’s rate falls short.`,
  },
  'ms-swing': {
    type: 'chart', kind: 'bar', title: 'Change in Lantern’s year-one estimate with one assumption at its low or high value (fictional ranges)',
    x: { label: 'Assumption', values: ['Natural rate', 'Own channel', 'Supermarket rate', 'Supermarket listings', 'Natural listings'] },
    series: [
      { name: 'At the low value', values: ORDER.map((i) => at(i, LO[i]) - BU) },
      { name: 'At the high value', values: ORDER.map((i) => at(i, HI[i]) - BU) },
    ],
    y: { label: 'Change from 48,200 cans' },
    note: 'Each pair of bars moves one assumption to Ana’s low or high value, the others held at their central values: natural grocers’ rate of sale 8 to 20 cans a store a week (central 14); the own channel 600 to 1,800 cans a month (1,200); supermarkets’ rate of sale 6 to 14 (10); supermarket listings 20 to 40 (30); natural-grocer listings 18 to 30 (25). They are in order of their swing: the natural rate moves the estimate from −7,800 to +7,800 cans, natural listings from −5,096 to +3,640. No bar comes near the +51,800 the 100,000-can goal would need. The ranking reflects Ana’s ranges as much as the model: an assumption she is unsure of gets a wide range and a long swing.',
  },
};

export const guided = [
  {
    id: 'm04-ms-g1', type: 'steps', kind: 'numerical',
    prompt: 'Pennock Kombucha (fictional) sells chilled kombucha in 330 ml bottles. Its distributor’s data show that shoppers in the region buy 2.4 million bottles of chilled kombucha a year, 60% of them in the cafés and grocers the distributor serves. Pennock expects to win 4% of the bottles sold in those outlets next year. Work through the sizing.',
    solution: 'TAM: 2.4 million bottles. SAM: 2,400,000 × 0.60 = 1,440,000 bottles. SOM: 1,440,000 × 0.04 = 57,600 bottles, worth 57,600 × $3.20 × 0.55 = $101,376 a year to Pennock. Check the 4% first: it is the one input with no evidence behind it.',
    steps: [
      {
        id: 'm04-ms-g1-s1', type: 'classify',
        prompt: 'Match each figure to the term this course uses for it.',
        items: ['2.4 million bottles a year: all brands, every outlet in the region', '1.44 million bottles a year sold in the outlets Pennock’s distributor serves', 'The bottles Pennock expects to sell in those outlets next year'],
        categories: ['TAM', 'SAM', 'SOM'],
        answer: [0, 1, 2],
        feedback: { 0: 'Everything sold in the category, whoever supplies it: the total addressable market.', 1: 'The part of the TAM that Pennock’s route to market could serve: the serviceable available market.', 2: 'What Pennock can realistically win in the period: the serviceable obtainable market, an estimate.' },
        hints: ['TAM counts the whole category; SAM what the business could serve; SOM what it expects to win.'],
      },
      {
        id: 'm04-ms-g1-s2', type: 'num',
        prompt: 'How many bottles does Pennock expect to sell next year (its SOM)?',
        answer: 57600, check: () => 2_400_000 * 0.6 * 0.04, unit: 'bottles', places: 0, tol: 1,
        wrong: [
          { value: 2_400_000 * 0.04, say: 'That applies the 4% to the whole region’s bottles, the TAM. Pennock expects 4% of the bottles sold in its distributor’s outlets: narrow to the SAM first.' },
          { value: 2_400_000 * 0.6, say: 'That is the SAM, the bottles sold in the outlets Pennock can reach. Apply the 4% share to it.' },
        ],
        hints: ['Top-down: TAM × the share Pennock could serve × the share of that it expects to win.', '2,400,000 × 0.60 × 0.04'],
        solution: '2,400,000 × 0.60 = 1,440,000 bottles in the SAM; × 0.04 = 57,600 bottles.',
      },
      {
        id: 'm04-ms-g1-s3', type: 'num',
        prompt: 'The bottles sell for $3.20 on the shelf, and the distributor and the outlets keep 45% of that between them. What are Pennock’s expected sales worth to Pennock in a year, in dollars?',
        answer: 101376, check: () => 57600 * 3.2 * (1 - 0.45), unit: '$', places: 0, tol: 1,
        wrong: [
          { value: 57600 * 3.2, say: 'That is the value at shelf prices, what shoppers spend. Pennock receives the shelf price less the 45% the trade keeps.' },
          { value: 57600 * 3.2 * 0.45, say: 'That is the 45% the distributor and the outlets keep. Pennock receives the other 55%.' },
        ],
        hints: ['Value = volume × price, at the price level Pennock receives.', '57,600 × $3.20 × (1 − 0.45)'],
        solution: 'Pennock’s net price is $3.20 × 0.55 = $1.76 a bottle, so 57,600 × $1.76 = $101,376.',
      },
      {
        id: 'm04-ms-g1-s4', type: 'mc',
        prompt: 'Which input should Pennock check first?',
        options: [
          'The 4% share, because it is a judgement with no evidence behind it, and the result moves in step with it.',
          'The 2.4 million bottles, because a distributor’s count for a whole region is the least reliable figure here.',
          'The 330 ml bottle size, because the sizing has to be redone in litres before anybody can trust its result.',
          'The 45% trade margin, because it changes how many bottles Pennock will sell, so it must be confirmed first.',
        ],
        answer: 0,
        feedback: {
          1: 'The regional figure comes from sales data and can be checked against a second source. The 4% came from nowhere.',
          2: 'Counting bottles is fine as long as every figure counts the same 330 ml bottle; litres would change nothing.',
          3: 'The margin changes what the bottles are worth to Pennock, not how many it sells, and the distributor can confirm it in one call.',
        },
        hints: ['Which number is a judgement rather than a measurement?'],
      },
    ],
  },
  {
    id: 'm04-ms-g2', type: 'formula', kind: 'applied',
    prompt: 'Ana’s sizing model: E9:E10 hold the stores expected to list Lantern, F9:F10 the cans each sells a week and B4 the weeks in the year. In G9, write the formula for Lantern’s cans a year from supermarkets so that, filled down to G10, it gives the natural grocers’ figure too.',
    sheet: { cells: sizingCells({ results: false, summary: false }) },
    cell: 'G9', fill: 'G9:G10', answer: '=E9*F9*$B$4',
    alt: ['=F9*E9*$B$4', '=$B$4*E9*F9', '=E9*F9*B$4', '=PRODUCT(E9,F9,$B$4)'],
    view: 'A1:G12', widths: SIZING_WIDTHS, formats: SIZING_FORMATS,
    wrong: [
      { formula: '=E9*F9*B4', say: 'Right in G9, but filled down the weeks reference moves to B5, the own channel’s cans a month. Anchor it: $B$4.' },
      { formula: '=E9*F9*52', say: 'Right for this sheet, but the 52 is typed into the formula. Refer to B4, so that a change to the weeks reaches every result.' },
      { formula: '=D9*F9*$B$4', say: 'D9 counts every supermarket in the city. Lantern sells only in the stores that list it: E9.' },
      { formula: '=E9*F9', say: 'That is cans a week across the listing stores. Multiply by the weeks in B4 for a year.' },
    ],
    hints: ['Bottom-up from outlets: stores listing × cans a store a week × weeks.', '<x>=E9*F9*$B$4</x>, with B4 anchored so it stays put when the formula is filled down.'],
    solution: '<x>=E9*F9*$B$4</x> gives 30 × 10 × 52 = 15,600 cans in G9 and, filled down, 25 × 14 × 52 = 18,200 in G10. The dollar signs keep the weeks reference on B4 while E and F move with the row.',
  },
  {
    id: 'm04-ms-g3', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s supermarkets sell as Ana expects (15,600 cans a year) and its own channel sells 1,200 cans a month. At what rate of sale, in cans a store a week, would the 25 listing natural grocers have to sell for Lantern to reach 100,000 cans in a 52-week year? Give one decimal place.',
    answer: 53.8, check: () => (100000 - 15600 - 1200 * 12) / (25 * 52), unit: 'cans a store a week', places: 1, tol: 0.1,
    wrong: [
      { value: (100000 - 15600) / (25 * 52), say: 'That leaves out the own channel: subtract its 1,200 × 12 = 14,400 cans a year as well as the supermarkets’ 15,600.' },
      { value: (100000 - 15600 - 14400) / (45 * 52), say: 'That spreads the cans over all 45 natural grocers in the city. Only the 25 that list Lantern sell it.' },
      { value: (100000 - 15600 - 14400) / 25, say: 'That is cans a store a year. Divide by the 52 weeks as well.' },
    ],
    hints: ['Rate needed = (goal − cans from every other route) ÷ (stores listing × weeks).', '(100,000 − 15,600 − 14,400) ÷ (25 × 52)'],
    solution: 'Other routes: 15,600 + 1,200 × 12 = 30,000 cans. The natural grocers must sell 100,000 − 30,000 = 70,000 cans: 70,000 ÷ (25 × 52) ≈ 53.8 cans a store a week. That is nearly four times Ana’s 14, and about 17.5% of an average natural grocer’s 308 category cans a week.',
  },
  {
    id: 'm04-ms-g4', type: 'mc', kind: 'conceptual',
    prompt: 'In the February survey, 42.2% of the 516 people who completed it said they definitely or probably would buy Lantern Cold Brew in the next three months. A colleague writes: “42.2% of our 6,000-person list is 2,532 buyers, so the own channel alone will sell 2,500 cans a month.” Which is the best correction?',
    options: [
      'Weight the answers to the list’s four groups, then apply a conversion rate to each answer and a repeat-buying assumption.',
      'Use only the 15.7% who said “definitely”, because people who answer “probably” never go on to buy the product at all.',
      'Quote 42.2% plus or minus 4.3 points instead, because the survey’s margin of error covers the uncertainty in the estimate.',
      'Multiply 42.2% by the 520 subscribers instead, because only subscribers would buy cans through Lantern’s online shop.',
    ],
    answer: 0,
    feedback: {
      1: 'Some “probably” answers do turn into purchases, and some “definitely” answers don’t. Each answer needs its own conversion rate, not 100% or 0%.',
      2: 'The margin covers sampling error only. It doesn’t turn stated intent into buying, and it leaves the over-representation of subscribers untouched.',
      3: 'The own channel also reaches shop customers, workshop participants and newsletter readers, and the subscribers’ intent is higher than the list’s, so this mixes two errors.',
    },
    hints: ['Three things are wrong: who answered, what the answers mean, and what the question asked about.'],
    solution: 'Three corrections. Weight: the respondents over-represent subscribers, so the weighted 38.2% describes the list better than 42.2%. Convert: stated intent isn’t behaviour, so apply a conversion rate to “definitely” and a lower one to “probably”. Repeat: the question asked about buying in the next three months, so how often buyers come back is a separate assumption. With 40% and 10% and a four-pack a month, the lesson’s estimate is about 1,900 cans a month.',
  },
];

export const independent = [
  {
    id: 'm04-ms-i1', type: 'formula', kind: 'applied',
    prompt: 'Wrexley Garden Centre (fictional) is sizing a plant-repotting service. B2:B4 hold the customers in each group, C2:C4 the share of each group expected to use the service in a year, and D2:D4 the times a user would use it a year; B6 holds the price. In B8, calculate the expected revenue a year.',
    sheet: { cells: {
      A1: 'Customer group', B1: 'Customers', C1: 'Share using it', D1: 'Uses a year',
      A2: 'Loyalty members', B2: WREX.customers[0], C2: WREX.share[0], D2: WREX.uses[0],
      A3: 'Other regular customers', B3: WREX.customers[1], C3: WREX.share[1], D3: WREX.uses[1],
      A4: 'Occasional visitors', B4: WREX.customers[2], C4: WREX.share[2], D4: WREX.uses[2],
      A6: 'Price per repotting', B6: WREX.price, A8: 'Expected revenue a year',
    } },
    cell: 'B8', answer: '=SUMPRODUCT(B2:B4,C2:C4,D2:D4)*B6',
    alt: ['=(B2*C2*D2+B3*C3*D3+B4*C4*D4)*B6', '=SUMPRODUCT(B2:B4*C2:C4*D2:D4)*B6', '=B6*SUMPRODUCT(B2:B4,C2:C4,D2:D4)'],
    view: 'A1:D8', widths: { A: 24, B: 12, C: 14, D: 12 }, formats: { B2: N0, B3: N0, B4: N0, C: '0.0%', D: '0.0', B6: '$#,##0.00', B8: '$#,##0' },
    wrong: [
      { formula: '=SUM(B2:B4)*AVERAGE(C2:C4)*AVERAGE(D2:D4)*B6', say: 'Averaging the shares gives the small group of loyalty members the same say as the 9,800 occasional visitors. Multiply within each group, then add: SUMPRODUCT.' },
      { formula: '=SUMPRODUCT(B2:B4,C2:C4)*B6', say: 'That counts each user once. Users repot more than once a year: include the uses in D2:D4.' },
      { formula: '=SUMPRODUCT(B2:B4,C2:C4,D2:D4)', say: 'That is the number of repottings a year. Multiply by the price in B6 for revenue.' },
    ],
    solution: `Customers × share × uses, group by group: 3,200 × 0.12 × 1.5 = 576; 5,400 × 0.05 × 1.2 = 324; 9,800 × 0.015 × 1 = 147. In all ${c0(wrexUses)} repottings × $18 = $${c0(wrexUses * WREX.price)} a year: <x>=SUMPRODUCT(B2:B4,C2:C4,D2:D4)*B6</x>.`,
  },
  {
    id: 'm04-ms-i2', type: 'num', kind: 'numerical',
    prompt: 'Pellinore Software (fictional) surveyed a random sample of its 4,000 small-business customers about a payroll add-on: 18% said they definitely would buy it and 31% that they probably would. From a similar add-on last year, it assumes that 45% of the “definitely” answers and 12% of the “probably” answers turn into a purchase within a year, and none of the others. How many buyers should it plan for? Round to a whole number.',
    answer: 473, check: () => 4000 * (0.18 * 0.45 + 0.31 * 0.12), unit: 'buyers', places: 0, tol: 0.5,
    wrong: [
      { value: 4000 * (0.18 + 0.31), say: 'That counts every “definitely” and “probably” answer as a buyer. Apply each answer’s conversion rate.' },
      { value: 4000 * 0.18, say: 'That treats every “definitely” as a buyer and every “probably” as a non-buyer. Use the 45% and 12% instead.' },
      { value: 4000 * 0.18 * 0.45, say: 'That converts the “definitely” answers only. Add 12% of the “probably” answers too.' },
    ],
    solution: 'Buyers = N × Σ conversion × share = 4,000 × (0.18 × 0.45 + 0.31 × 0.12) = 4,000 × (0.081 + 0.0372) = 4,000 × 0.1182 ≈ 473. The 45% and 12% come from one earlier add-on, so Pellinore should also show the result at lower and higher rates.',
  },
  {
    id: 'm04-ms-i3', type: 'mc', kind: 'applied',
    prompt: 'A new energy-drink brand’s (fictional) plan assumes it will sell 60 cans a store a week in 200 convenience stores, 624,000 cans a year. A trade report says the whole energy-drink category sells about 240 cans a week in an average convenience store. Which check shows that the plan is implausible?',
    options: [
      'Compare the rate of sale with the category: 60 of 240 cans would be a quarter of every store’s energy drinks in year one.',
      'Compare the 624,000 cans with the country’s whole energy-drink market, to see what share of that market the plan represents.',
      'Convert the plan into litres first, because cans of different sizes can’t be compared with the trade report’s figures at all.',
      'Check the brand’s survey: if many respondents said they would definitely buy it, then 60 cans a store a week is realistic.',
    ],
    answer: 0,
    feedback: {
      1: 'A share of a national market would look tiny and reassuring. The useful comparison is with the shelf the cans must be won from: each store’s category.',
      2: 'Units matter, but the plan and the report both count cans. The problem is the rate of sale, not the unit.',
      3: 'Stated intent isn’t behaviour, and a survey can’t make a quarter of a category plausible for a new brand.',
    },
    solution: 'Rate of sale ÷ the category’s sales per store = 60 ÷ 240 = 25%: the plan has a new brand taking a quarter of every convenience store’s energy drinks. A sanity check against the category per store exposes it at once; a check against the national market would hide it.',
  },
  {
    id: 'm04-ms-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each estimate as top-down or bottom-up.',
    items: [
      'National sales of sports drinks × the city’s share of the population × the share the brand expects to win',
      'Gyms in the city, from a business register × the members each signs up a month × 12',
      'Stores expected to list the product × units a store sells a week × 52',
      'The category’s yearly sales × the share sold in the channels the brand will use',
      'Customers on the mailing list × the share expected to buy × purchases a year',
      'An industry report’s value of the regional market × the brand’s target share',
    ],
    categories: ['Top-down', 'Bottom-up'],
    answer: [0, 1, 1, 0, 1, 0],
    feedback: {
      0: 'It starts from a national total and narrows it with shares: top-down.',
      1: 'A business register is secondary data, but the estimate is built from units (gyms × sign-ups), so it is bottom-up.',
      5: 'An industry report narrowed by a share: top-down, and the target share is the input to question.',
    },
    solution: 'Top-down estimates start from a total and apply shares (national sales, category sales, a regional market value). Bottom-up estimates multiply countable parts: gyms × sign-ups, stores × rates of sale, customers × buying × frequency. The source of the inputs doesn’t decide it: a business register can feed a bottom-up estimate.',
  },
  {
    id: 'm04-ms-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Ormsgill Cinemas (fictional) has estimated how many members a new monthly membership would have after a year in two ways: top-down, 9,000; bottom-up, 3,500. Select all the explanations that could account for the gap.',
    options: [
      'The top-down share was chosen rather than measured, so it may be too high.',
      'The bottom-up starts from the chain’s own customers, the top-down from every cinema-goer in the region.',
      'One route counts members at the end of the year, the other sign-ups in a typical month.',
      'Bottom-up estimates are always too low, so the real number of members will be close to 9,000.',
      'A gap this large shows that both estimates are worthless and that the scheme can’t be sized.',
      'The average of the two, 6,250 members, is the best estimate because it combines both routes.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Neither route is biased in a known direction; each is only as good as its inputs. Read the gap for the assumption that differs.',
      4: 'A gap is information: it points to the share, the population or the units, which can each be checked.',
      5: 'Averaging hides the disagreement instead of explaining it, and if one route has an error, the average carries half of it.',
    },
    solution: 'A gap between routes points at the inputs that differ: an assumed share, a different population (current customers against everyone) or different units and periods (members at year end against sign-ups a month). It doesn’t show that one method is always low, it doesn’t make sizing impossible, and averaging the two hides the problem.',
  },
  {
    id: 'm04-ms-i6', type: 'num', kind: 'applied',
    prompt: 'Lantern’s SAM counts every can sold in its three planned channels: 3.36 million. A stricter analyst would count only the stores Ana expects to list Lantern: 30 of Harbour City’s 120 supermarkets (all 120 together sell 2.16 million category cans a year) and 25 of its 45 natural grocers (all 45 together sell 720,000). Assuming the listing stores are of average size for their channel, how many category cans a year do those 55 stores sell? Leave out the cafés and online shops.',
    answer: 940000, check: () => (30 / 120) * 2_160_000 + (25 / 45) * 720_000, unit: 'cans', places: 0, tol: 500,
    wrong: [
      { value: 2_160_000 + 720_000, say: 'That is every supermarket and natural grocer in the city. Count only the share of each channel’s stores that list Lantern.' },
      { value: (55 / 165) * (2_160_000 + 720_000), say: 'That pools the two channels, but an average supermarket sells more cans than an average natural grocer. Scale each channel by its own stores.' },
      { value: (30 / 120) * 2_160_000, say: 'That is the supermarkets alone. Add the 25 natural grocers’ share of their channel’s 720,000 cans.' },
    ],
    solution: 'Supermarkets: 30 ÷ 120 × 2,160,000 = 540,000. Natural grocers: 25 ÷ 45 × 720,000 = 400,000. Together 940,000 cans, 28% of the channel-based SAM. Lantern’s retail estimate, 15,600 + 18,200 = 33,800 cans, would be 3.6% of what those stores sell.',
  },
];

export const check = [
  {
    id: 'm04-ms-k1', type: 'mc', kind: 'conceptual',
    prompt: '“Our serviceable available market is all the food that households in this country buy: $200 billion a year,” says the pitch of a meal-kit start-up (fictional) that will deliver in two cities only. What is wrong with the claim?',
    options: [
      'It describes something closer to a TAM: a SAM counts only what the offer and the delivery area could serve.',
      'Nothing, provided the pitch also gives a TAM, which would then have to be larger than the $200 billion SAM.',
      'The figure is really the SOM, because the SOM is the whole market a start-up says it could win in the end.',
      'A SAM has to be stated in units, such as meals a year, and never in money, so the figure is in the wrong unit.',
    ],
    answer: 0,
    feedback: {
      1: 'A larger TAM wouldn’t rescue the SAM. A start-up delivering meal kits in two cities can’t serve the nation’s grocery shopping.',
      2: 'The SOM is the part of the SAM a business can realistically win in a stated period, so it would be far smaller still.',
      3: 'Market sizes can be in units or in money, as long as the price level is stated.',
    },
    solution: 'All household food spending in the country is, at best, a TAM for food. The start-up’s SAM is narrowed by its offer (meal kits) and its route to market (delivery in two cities); its SOM is the part of that it can win in a stated period.',
  },
  {
    id: 'm04-ms-k2', type: 'formula', kind: 'numerical',
    prompt: 'Ana’s sizing model, with Lantern’s cans a year in G9:G11. In B14, calculate the rate of sale, in cans a store a week, that the listing supermarkets would need for Lantern to reach the goal in B6, with the natural grocers and the own channel selling as planned.',
    sheet: { cells: { ...sizingCells({ summary: false }), A14: 'Supermarket rate of sale needed for the goal' }, vary: { B6: [90000, 120000] } },
    cell: 'B14', answer: '=(B6-G10-G11)/(E9*B4)',
    alt: ['=(B6-G10-G11)/E9/B4', '=(B6-G12+G9)/(E9*B4)', '=(B6-SUM(G10:G11))/(E9*B4)'],
    view: 'A1:G14', widths: SIZING_WIDTHS, formats: { ...SIZING_FORMATS, B14: '0.0' },
    wrong: [
      { formula: '=(B6-G10)/(E9*B4)', say: 'That leaves the own channel’s cans in G11 for the supermarkets to sell too. Subtract every other route: G10 and G11.' },
      { formula: '=(B6-G10-G11)/(D9*B4)', say: 'D9 is every supermarket in the city. The rate needed is per listing store: E9.' },
      { formula: '=(B6-G10-G11)/E9', say: 'That is cans a store a year. Divide by the weeks in B4 too.' },
      { formula: '=B6/(E9*B4)', say: 'That asks the supermarkets to sell the whole goal. The natural grocers and the own channel supply G10 and G11 of it.' },
    ],
    solution: '<x>=(B6-G10-G11)/(E9*B4)</x> = (100,000 − 18,200 − 14,400) ÷ (30 × 52) = 67,400 ÷ 1,560 ≈ 43.2 cans a store a week, the value Goal Seek finds, against Ana’s 10.',
  },
  {
    id: 'm04-ms-k3', type: 'num', kind: 'numerical',
    prompt: 'Quillfield Juice (fictional) expects to be stocked in 80 cafés, each selling 9 bottles a week over the 48 weeks the cafés trade, and to sell 600 bottles a month through its own website all year. How many bottles a year is that?',
    answer: 41760, check: () => 80 * 9 * 48 + 600 * 12, unit: 'bottles', places: 0, tol: 1,
    wrong: [
      { value: 80 * 9 * 52 + 600 * 12, say: 'The cafés trade 48 weeks, not 52. Use the period the outlets actually sell in.' },
      { value: 80 * 9 * 48, say: 'That is the cafés only. Add the website’s 600 bottles a month for 12 months.' },
      { value: 80 * 9 * 48 + 600, say: 'The website sells 600 a month: multiply by 12 for the year.' },
    ],
    solution: 'Cafés: 80 × 9 × 48 = 34,560 bottles. Website: 600 × 12 = 7,200. Total 41,760 bottles a year.',
  },
  {
    id: 'm04-ms-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s bottom-up estimate is 48,200 cans (40,000 to 56,000 if any one assumption is off); M02’s goal is 100,000; the simulator, which assumes every store in a chosen channel stocks Lantern, predicts about 199,000. Which sentence belongs in her board paper?',
    options: [
      '“About 48,000 cans; the goal needs 2.5 times the buyers’ rates of sale, so we’ll test those rates in a few stores.”',
      '“The simulator’s 199,000 cans shows that the 100,000-can goal is cautious, so we can keep it as our forecast.”',
      '“Averaging our three figures gives about 116,000 cans, close to break-even, so that is our forecast for year one.”',
      '“We expect about 1% of the category, a modest share that any new brand should be able to win in its first year.”',
    ],
    answer: 0,
    feedback: {
      1: 'The simulator assumes Lantern is in every supermarket and natural grocer; Ana expects 55 listings. Its figure answers a different question.',
      2: 'Averaging a target, a teaching model and an estimate mixes things that aren’t estimates of the same quantity, and hides why they differ.',
      3: 'One per cent of the category is about Ana’s estimate, but calling it modest skips the evidence: every can depends on listings and rates of sale.',
    },
    solution: 'Only the first sentence reports what the evidence supports, with its range in mind, says what the goal would require and names the next step. The simulator’s figure rests on full distribution, the average mixes unlike figures, and “1% is modest” is the classic top-down error.',
  },
  {
    id: 'm04-ms-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are sanity checks on a bottom-up sizing? Select all that apply.',
    options: [
      'Compare the rate of sale with what an average store sells of the whole category.',
      'Check that weeks, months and units are used consistently across the model.',
      'Check that no customer’s purchases are counted in two routes to market.',
      'Check that the business could produce and deliver the volume it estimates.',
      'Raise the inputs one by one until the total matches the sales goal.',
      'Replace the range with the central figure so that the answer looks firmer.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'That works back from the goal to the inputs it needs: useful for asking what would have to be true, but not a check that the estimate is sound.',
      5: 'Dropping the range hides the uncertainty; it doesn’t test anything.',
    },
    solution: 'Sanity checks test the answer against things already known: the category per store, consistent units and periods, double counting and capacity. Raising inputs to hit the goal and hiding the range are the opposite of checking.',
  },
  {
    id: 'm04-ms-k6', type: 'num', kind: 'numerical',
    prompt: 'A category sells 1.2 million units a year at a volume-weighted average shelf price of $4.50, and the retailers keep 30% of the shelf price. What is the category worth a year to producers, in millions of dollars? Give two decimal places.',
    answer: 3.78, check: () => 1.2 * 4.5 * (1 - 0.3), unit: '$ millions', places: 2, tol: 0.005,
    wrong: [
      { value: 1.2 * 4.5, say: 'That is the value at shelf prices, what shoppers spend. Producers receive the shelf price less the retailers’ 30%.' },
      { value: 1.2 * 4.5 * 0.3, say: 'That is the retailers’ 30%. Producers receive the other 70%.' },
    ],
    solution: 'Shelf value = 1.2 million × $4.50 = $5.4 million; producers receive 70% of it: $5.4 million × 0.70 = $3.78 million.',
  },
];
