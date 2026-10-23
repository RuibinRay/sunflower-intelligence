// situation-analysis.ex.js — M01 · Situation analysis: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every business is fictional; every number is recomputed by `check`
// (see ../AUTHORING.md).

const FIRMS = [
  { name: 'Larkhill', s: [4, 5, 2, 5] },
  { name: 'Mossgiel', s: [4, 3, 4, 2] },
  { name: 'Halvorsen', s: [2, 3, 5, 1] },
];
const PESTEL = ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal'];

export const widgets = {
  'sa-scorecard': {
    type: 'formula',
    title: 'Weighted competitive-strength scorecard: Larkhill and its rivals',
    intro: 'Set how much each factor matters to the buyers you are thinking about. The ratings (1 to 5) are fixed: Larkhill 4, 5, 2, 5; Mossgiel 4, 3, 4, 2; Halvorsen 2, 3, 5, 1, for reliability, plant quality, price and design advice.',
    inputs: [
      { id: 'rel', label: 'Importance of reliability', min: 0, max: 10, step: 1, value: 4, fmt: 'int' },
      { id: 'qual', label: 'Importance of plant quality', min: 0, max: 10, step: 1, value: 3, fmt: 'int' },
      { id: 'price', label: 'Importance of price', min: 0, max: 10, step: 1, value: 2, fmt: 'int' },
      { id: 'design', label: 'Importance of design advice', min: 0, max: 10, step: 1, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      const raw = [v.rel, v.qual, v.price, v.design];
      const total = raw.reduce((a, b) => a + b, 0);
      if (total === 0) return { error: 'Give at least one factor some importance: with every weight at zero there is nothing to compare.' };
      const w = raw.map((x) => x / total);
      const scores = FIRMS.map((f) => w.reduce((t, wi, i) => t + wi * f.s[i], 0));
      const order = FIRMS.map((f, i) => [f.name, scores[i]]).sort((a, b) => b[1] - a[1]);
      const gap = order[0][1] - order[1][1];
      return {
        headline: { label: 'Highest weighted score', value: `${order[0][0]}, ${order[0][1].toFixed(2)}` },
        rows: [
          ...FIRMS.map((f, i) => [`${f.name}`, scores[i].toFixed(2)]),
          ['Weights used (reliability, quality, price, design)', w.map((x) => x.toFixed(2)).join(', ')],
        ],
        note: gap < 0.05
          ? `${order[0][0]} and ${order[1][0]} are effectively level (${gap.toFixed(2)} points apart): a small change in the weights, or in one rating, would swap them. Treat the ranking as undecided.`
          : `${order[0][0]} leads ${order[1][0]} by ${gap.toFixed(2)} points. Price carries ${(w[2] * 100).toFixed(0)}% of the weight here; Larkhill’s weak price rating matters more as that share rises.`,
        chart: {
          kind: 'bar',
          x: { label: 'Firm', values: FIRMS.map((f) => f.name) },
          series: [{ name: 'Weighted score (1–5)', values: scores.map((s) => Math.round(s * 100) / 100) }],
          y: { label: 'Weighted score (1–5)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-sa-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional seaside hotel is scanning its macroenvironment. Give each factor the PESTEL letter that fits it best.',
    items: [
      'The interest rate on the hotel’s bank loan has risen',
      'Keyless room locks that guests open with their phones have become cheap enough for small hotels',
      'The government has introduced a new tax on overnight stays',
      'Rising sea levels threaten the hotel’s seafront car park with flooding',
      'Retired people make up a growing share of the region’s visitors',
      'A court ruling makes hotels liable for guests’ belongings left in their rooms',
    ],
    categories: PESTEL,
    answer: [1, 3, 0, 4, 2, 5],
    hints: [
      'Ask where each change comes from: government policy, the economy, people’s habits and make-up, new technology, the natural world, or the law and the courts.',
      'A tax is a policy decision (political). A change in who visits the region is about the population (social). A court ruling is legal.',
    ],
    feedback: {
      2: 'Taxes are set by government policy, so political is the usual letter, even though a tax also has an economic effect. Some analysts would write political/economic, and that is fine.',
      4: 'The age mix of visitors is a demographic change, which PESTEL puts under social.',
      5: 'A court ruling changes what the law requires of the hotel: legal, not political.',
    },
    solution: 'Loan interest rate: economic. Cheap keyless locks: technological. Tax on overnight stays: political (a policy decision). Sea levels: environmental. More retired visitors: social (demographics). Court ruling: legal. Where a factor fits two letters, such as a tax, choose the one that helps the discussion; the classification serves the analysis, not the other way round.',
  },
  {
    id: 'm01-sa-g2', type: 'steps', kind: 'numerical',
    prompt: 'Orchard Lane Grooming (fictional) is a dog-grooming salon. Asked what decides where they take their dog, its customers made 60 mentions: grooming quality 21, location 15, price 9 and opening hours 15. Orchard Lane is rated 5, 3, 3 and 2 on those four factors (out of 5); the grooming counter at a nearby pet superstore is rated 3, 4, 4 and 5. Compare them with a weighted competitive-strength scorecard.',
    solution: 'Weights: quality 21 ÷ 60 = 0.35, location 15 ÷ 60 = 0.25, price 9 ÷ 60 = 0.15, hours 15 ÷ 60 = 0.25. Orchard Lane: 0.35 × 5 + 0.25 × 3 + 0.15 × 3 + 0.25 × 2 = 1.75 + 0.75 + 0.45 + 0.50 = 3.45. Superstore: 0.35 × 3 + 0.25 × 4 + 0.15 × 4 + 0.25 × 5 = 1.05 + 1.00 + 0.60 + 1.25 = 3.90. The superstore leads, mainly on opening hours, a factor a quarter of the mentions named and on which Orchard Lane scores only 2. Raising hours to 4 would add 0.25 × 2 = 0.50 and put Orchard Lane ahead (3.95).',
    steps: [
      { id: 'm01-sa-g2-s1', type: 'num',
        prompt: 'What weight does grooming quality get? (Give a decimal, such as 0.20.)',
        answer: 0.35, check: () => 21 / 60, tol: 0.005, unit: '', places: 2,
        hints: ['A weight is a factor’s share of all the mentions.', 'Divide 21 by the total of 60 mentions.'],
        wrong: [
          { value: 0.25, say: 'That is the weight of location (or of opening hours). Quality had 21 of the 60 mentions.' },
          { value: 21, say: 'That is the number of mentions. Divide by the total, 60, to turn it into a weight.' },
        ] },
      { id: 'm01-sa-g2-s2', type: 'num',
        prompt: 'What is Orchard Lane’s weighted score? (Two decimal places.)',
        answer: 3.45, check: () => (21 * 5 + 15 * 3 + 9 * 3 + 15 * 2) / 60, tol: 0.005, unit: 'points', places: 2,
        hints: ['The weights are 0.35, 0.25, 0.15 and 0.25. Multiply each by Orchard Lane’s rating on that factor.', '0.35 × 5 + 0.25 × 3 + 0.15 × 3 + 0.25 × 2.'],
        wrong: [
          { value: 3.25, say: 'That is the plain average of the four ratings. The factors don’t matter equally: weight each rating first.' },
          { value: 13, say: 'That is the sum of the ratings. Multiply each by its weight, then add.' },
        ] },
      { id: 'm01-sa-g2-s3', type: 'num',
        prompt: 'What is the superstore counter’s weighted score? (Two decimal places.)',
        answer: 3.9, check: () => (21 * 3 + 15 * 4 + 9 * 4 + 15 * 5) / 60, tol: 0.005, unit: 'points', places: 2,
        hints: ['Same weights, the superstore’s ratings: 3, 4, 4 and 5.', '0.35 × 3 + 0.25 × 4 + 0.15 × 4 + 0.25 × 5.'],
        wrong: [{ value: 4, say: 'That is the plain average of the superstore’s ratings. Weight them: 1.05 + 1.00 + 0.60 + 1.25.' }] },
      { id: 'm01-sa-g2-s4', type: 'mc',
        prompt: 'Which single improvement would put Orchard Lane ahead of the superstore, if customers’ priorities stay the same?',
        options: [
          'Longer opening hours, raising its rating on hours from 2 to 4',
          'Lower prices, raising its rating on price from 3 to 5',
          'Better grooming, raising its rating on quality from 5 to 6',
          'A better location, raising its rating on location from 3 to 4',
        ],
        answer: 0,
        hints: ['A one-point rise on a factor adds that factor’s weight to the score. Orchard Lane needs more than 3.90 − 3.45 = 0.45.', 'Hours: 0.25 × 2. Price: 0.15 × 2. Location: 0.25 × 1.'],
        feedback: {
          1: 'Two more points on price add only 0.15 × 2 = 0.30, because price carries a small weight: 3.75, still behind 3.90.',
          2: 'The scale stops at 5, and Orchard Lane is already there. Quality is its strength; the gap is elsewhere.',
          3: 'One more point on location adds 0.25, giving 3.70: not enough.',
        } },
    ],
  },
  {
    id: 'm01-sa-g3', type: 'classify', kind: 'applied',
    prompt: 'Bellweather Bakery (fictional) asks you to sort its notes into a SWOT. Classify each note.',
    items: [
      'Its sourdough has won a regional baking award two years running',
      'Its oven is old and breaks down about once a month',
      'A large office development opening on its street next year will bring about 2,000 workers to the area',
      'The supermarket opposite has opened an in-store bakery with lower prices',
      'Open a second shop near the railway station',
      'Two of its four bakers are leaving at Christmas and haven’t been replaced',
    ],
    categories: ['Strength', 'Weakness', 'Opportunity', 'Threat', 'Not a SWOT item'],
    answer: [0, 1, 2, 3, 4, 1],
    hints: [
      'First ask whether each note is about the bakery itself (internal) or the world around it (external). Then ask whether it helps or harms.',
      'One note is something the bakery might do, not a fact about its situation.',
    ],
    feedback: {
      2: 'The office development is outside the bakery’s control and could bring customers if the bakery acts: an opportunity.',
      4: 'A second shop is an action the bakery could take, a strategy. It might come out of the SWOT later; it isn’t part of it.',
      5: 'Staffing belongs to the bakery itself, so it is internal, and losing half the bakers harms it: a weakness.',
    },
    solution: 'Strength: the award-winning sourdough (evidence: two awards). Weaknesses: the unreliable oven and the two unreplaced bakers. Opportunity: the office development and its 2,000 workers. Threat: the supermarket’s cheaper in-store bakery. The second shop is an option to evaluate later, not part of the SWOT.',
  },
  {
    id: 'm01-sa-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A consultant’s SWOT for a city hotel lists one opportunity: “Launch a spa.” What is wrong with this entry?',
    options: [
      'It is an action, not an external condition; whatever makes a spa attractive is the opportunity.',
      'A spa would be part of the hotel, so it belongs under Strengths, not Opportunities.',
      'Opportunities should be stated in money, so it needs the spa’s expected revenue.',
      'Nothing is wrong: any idea that could raise revenue counts as an opportunity.',
    ],
    answer: 0,
    hints: ['Opportunities and threats are external. Is “launch a spa” something in the hotel’s environment?', 'What condition outside the hotel would make a spa a good idea?'],
    feedback: {
      1: 'The spa doesn’t exist yet: it is a plan. A strength is something the hotel already has or does well, with evidence.',
      2: 'Numbers help prioritise, but the entry’s problem is its kind, not its precision: it is an action.',
      3: 'Treating ideas as opportunities skips the analysis and builds the conclusion into the list. That is the main way a SWOT goes wrong.',
    },
    why: 'Opportunities are conditions in the environment; actions come afterwards, as options evaluated against them.',
    solution: 'An opportunity is an external condition the hotel could take advantage of, such as more travellers booking short wellness breaks in the city (with evidence). “Launch a spa” is one possible response to that condition, an option for the strategy stage, where it would be weighed against the hotel’s strengths, costs and alternatives.',
  },
];

export const independent = [
  {
    id: 'm01-sa-i1', type: 'classify', kind: 'conceptual',
    prompt: 'For a fictional city-centre cinema, classify each actor in its microenvironment.',
    items: [
      'Another cinema chain two streets away',
      'A streaming service that releases new films at home',
      'The film distributor that rents the cinema its films',
      'A ticketing app that sells the cinema’s seats for a commission',
      'The local newspaper’s film critic',
      'A bowling alley in the same shopping centre',
    ],
    categories: ['Direct competitor', 'Substitute', 'Supplier', 'Intermediary', 'Public'],
    answer: [0, 1, 2, 3, 4, 1],
    feedback: {
      1: 'Streaming meets the same need (watching a new film) in a different way: a substitute, often the most important competitor of all.',
      3: 'The app helps the cinema reach and sell to customers and is paid for doing so: an intermediary.',
      5: 'Bowling is a different product, but it competes for the same evening out and the same money: a substitute.',
    },
    solution: 'Direct competitor: the other cinema chain. Substitutes: streaming and the bowling alley (other ways to spend the evening). Supplier: the film distributor. Intermediary: the ticketing app. Public: the newspaper critic, whose reviews shape what people think of the cinema.',
  },
  {
    id: 'm01-sa-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional ice-cream maker sold $1.8 million of ice cream last year in a regional market worth $15 million. What was its market share? Give a percentage.',
    answer: 12, check: () => 1.8 / 15 * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 0.12, say: 'That is the share as a decimal. Multiply by 100 to give a percentage.' },
      { value: 8.33, say: 'You divided the market by the firm’s sales. Share is the firm’s sales divided by the market’s.' },
    ],
    solution: 'Market share = 1.8 ÷ 15 × 100 = 12%. The figure means something only with its definition: ice cream (not all desserts), in this region, by value, last year.',
  },
  {
    id: 'm01-sa-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which practices make a SWOT analysis more useful? Select all that apply.',
    options: [
      'Giving each item its source of evidence',
      'Listing as many items as possible in each box',
      'Ranking the items in each box by importance',
      'Putting planned actions under Opportunities',
      'Judging strengths against competitors, as customers see them',
      'Linking each important item to an objective, an option or a research question',
    ],
    answer: [0, 2, 4, 5],
    feedback: {
      1: 'Long lists were exactly the failure Hill and Westbrook found: vague, unprioritised and never used. A few well-supported items are worth more.',
      3: 'Actions are options for the strategy stage. Listing them as opportunities skips the analysis.',
    },
    solution: 'Evidence, priorities, a competitor-relative and customer-judged test for strengths, and a clear link to what happens next are what separate a useful SWOT from a list. Length and premature actions are what made the SWOTs in Hill and Westbrook’s study useless.',
  },
  {
    id: 'm01-sa-i4', type: 'mc', kind: 'applied',
    prompt: 'A fictional window-cleaning firm interviewed 15 of its current business clients about why they chose it; only 2 mentioned price. Last year it also lost 8 tenders, 7 of them to a rival whose prices are about a fifth lower. Which conclusion does this evidence support?',
    options: [
      'Price mattered little to the clients who chose the firm, but the interviews say little about the buyers who didn’t.',
      'Price matters little to buyers of window cleaning in general, so the firm can leave it out of its plans.',
      'About 13% of the local window-cleaning market chooses its supplier mainly on price.',
      'The firm’s prices are lower than its current clients expected to pay when they signed.',
    ],
    answer: 0,
    feedback: {
      1: 'Everyone interviewed had already chosen the firm at its price. The buyers who chose the cheaper rival aren’t in the sample: survivorship bias. The lost tenders point the other way.',
      2: '2 of 15 (about 13%) describes the firm’s own clients, not the market, and 15 interviews are far too few to estimate a market share of anything.',
      3: 'The interviews asked why clients chose the firm, not what they expected to pay. Nothing in them supports this.',
    },
    why: 'The sample is the firm’s current clients, so it can describe them but not the buyers it lost.',
    solution: 'Only current clients were asked, so the finding describes people who accepted the firm’s price. The tenders lost to a cheaper rival suggest that other buyers weigh price much more heavily. To learn about them, the firm needs win–loss interviews with the prospects who chose the rival. Both pieces of evidence belong in the situation analysis, each labelled with who it describes.',
  },
  {
    id: 'm01-sa-i5', type: 'short', kind: 'applied',
    prompt: 'A fictional bicycle shop’s SWOT reads: <b>Strengths</b>: friendly staff; great location; good website. <b>Weaknesses</b>: none significant. <b>Opportunities</b>: open a café; sell e-bikes; run cycling events. <b>Threats</b>: competition; the economy. Write a critique of this SWOT and show how two of its entries could be rewritten so that they would be useful.',
    rubric: [
      'Identifies that the opportunities are actions, not external conditions, and gives an example of the condition that might lie behind one of them.',
      'Identifies that the strengths are vague and untested: not compared with competitors, not shown to matter to customers, with no evidence.',
      'Points out that “none significant” and one-word threats are not credible analysis, and that nothing is prioritised.',
      'Rewrites at least two entries so that they are specific, evidenced and correctly placed (for example a named competitor, a measured strength, an external condition).',
    ],
    model: 'The SWOT fails the basic tests. Its “opportunities” are all actions the shop might take; the opportunities are the conditions that would make them attractive, such as a rise in e-bike sales locally or a council plan for new cycle lanes. Its strengths are untested adjectives: friendly compared with whom, and do customers choose the shop for it? A “great location” is a strength only if customers say they come because of it, and rivals are worse placed. “None significant” under weaknesses is not credible; every business has some, and they are often the most useful part of the analysis. “Competition” and “the economy” name categories, not threats. Nothing has evidence or a priority. Two rewrites: “Strength: the only shop in town with a qualified e-bike mechanic; 40% of last year’s service revenue came from e-bikes (till records).” “Threat: a national chain opens a large store on the ring road in March, with lower prices on mid-range bikes (planning notice; their price list).” Each now says what, compared with whom, and how we know, and each points to a decision.',
  },
  {
    id: 'm01-sa-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional accounting firm’s clients weight three factors: expertise 0.5, responsiveness 0.3 and fees 0.2. The firm is rated 4, 3 and 2 out of 5 on them. What is its weighted competitive-strength score? (Two decimal places.)',
    answer: 3.3, check: () => 0.5 * 4 + 0.3 * 3 + 0.2 * 2, tol: 0.005, unit: 'points', places: 2,
    wrong: [
      { value: 3, say: 'That is the plain average of the ratings. Multiply each rating by its weight, then add.' },
      { value: 9, say: 'That is the sum of the ratings. Weight them: 2.0 + 0.9 + 0.4.' },
    ],
    solution: '0.5 × 4 + 0.3 × 3 + 0.2 × 2 = 2.0 + 0.9 + 0.4 = 3.3 points. The weighted score is above the plain average (3.0) because the firm is strongest on the factor its clients value most.',
  },
];

export const check = [
  {
    id: 'm01-sa-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In a SWOT for a fictional neighbourhood bakery, which of these belongs in the external half of the grid?',
    options: [
      'A large office block opening on the bakery’s street next year',
      'The bakery’s award-winning sourdough recipe',
      'The bakery’s plan to start opening on Sundays from next spring',
      'The bakery’s ageing oven',
    ],
    answer: 0,
    feedback: {
      1: 'The recipe belongs to the bakery: internal, and a strength if customers value it and rivals can’t match it.',
      2: 'A plan is an action the bakery could take. It isn’t a SWOT item at all; it is an option to evaluate later.',
      3: 'The oven is the bakery’s own equipment: internal, and a weakness if it is unreliable.',
    },
    solution: 'External factors are conditions the business doesn’t control. The office block is one: an opportunity if the bakery acts on it. The recipe and the oven are internal; the Sunday opening is an action.',
  },
  {
    id: 'm01-sa-k2', type: 'num', kind: 'numerical',
    prompt: 'Customers of a fictional printing firm made 36 mentions of what decides their choice: reliability 18, price 9 and range of services 9. The firm is rated 3 on reliability, 5 on price and 4 on range (out of 5). What is its weighted competitive-strength score? (Two decimal places.)',
    answer: 3.75, check: () => (18 * 3 + 9 * 5 + 9 * 4) / 36, tol: 0.005, unit: 'points', places: 2,
    wrong: [
      { value: 4, say: 'That is the plain average of the three ratings. Weight them first: reliability counts for half of the mentions.' },
      { value: 12, say: 'That is the sum of the ratings. Turn the mentions into weights (18 ÷ 36 = 0.5, 9 ÷ 36 = 0.25) and weight each rating.' },
    ],
    solution: 'Weights: 18 ÷ 36 = 0.50, 9 ÷ 36 = 0.25, 9 ÷ 36 = 0.25. Score = 0.50 × 3 + 0.25 × 5 + 0.25 × 4 = 1.50 + 1.25 + 1.00 = 3.75. It is below the plain average of 4 because the firm is weakest on the factor customers mention most.',
  },
  {
    id: 'm01-sa-k3', type: 'classify', kind: 'conceptual',
    prompt: 'For a fictional heat-pump installer, classify each item as part of its microenvironment or its macroenvironment.',
    items: [
      'A government subsidy for households that install heat pumps',
      'The firm that supplies its heat pumps',
      'Rising electricity prices across the country',
      'A rival installer offering free home surveys',
      'A local website where homeowners review installers',
      'New building regulations on home insulation',
    ],
    categories: ['Microenvironment', 'Macroenvironment'],
    answer: [1, 0, 1, 0, 0, 1],
    feedback: {
      2: 'Electricity prices across the country are a wide economic force that affects every installer: macroenvironment.',
      4: 'A review site is a public the installer deals with, and it shapes what customers think: microenvironment.',
      5: 'Regulations apply to the whole market: a legal factor in the macroenvironment.',
    },
    solution: 'Microenvironment (actors the firm deals with): its supplier, the rival installer and the review website. Macroenvironment (wider forces): the subsidy (political), electricity prices (economic) and the building regulations (legal).',
  },
  {
    id: 'm01-sa-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional regional dairy is known for the fastest deliveries to independent shops in its region. A chain of farm shops is opening branches across the region and is choosing suppliers. The dairy decides to bid, leading with its delivery record. Which TOWS pairing does this option come from?',
    options: [
      'SO: a strength used to take an opportunity',
      'ST: a strength used to counter a threat',
      'WO: a weakness fixed to take an opportunity',
      'WT: limiting damage where a weakness meets a threat',
    ],
    answer: 0,
    feedback: {
      1: 'The new chain is a chance to win business, not a danger to existing business: an opportunity, not a threat.',
      2: 'Fast delivery is something the dairy already does well, a strength, not a weakness it needs to fix.',
      3: 'Neither a weakness nor a threat is involved: the dairy is using what it does well to win new customers.',
    },
    solution: 'Fast delivery is an internal strength; a new chain choosing suppliers is an external opportunity. Using the first to win the second is an SO option. It still needs evaluating: can the dairy’s capacity serve the chain without slowing deliveries to its existing shops?',
  },
  {
    id: 'm01-sa-k5', type: 'multi', kind: 'applied',
    prompt: 'Ana wants to find out who Lantern’s real competitors are for catering. Which sources of evidence would help? Select all that apply.',
    options: [
      'Asking prospects who chose another option what they chose instead',
      'Notes from the bids Lantern lost in 2026',
      'Asking current clients what they would do if Lantern stopped catering',
      'Counting the cafés in the whole country',
      'Assuming the competitors are the firms that advertise most',
      'Comparing other caterers’ published prices and services',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'Cafés across the country are mostly not options for Lantern’s clients. Define the market first: office catering in Lantern’s area.',
      4: 'Advertising shows who is loud, not whom customers compare you with. Ask the customers.',
    },
    solution: 'The best evidence of who competes comes from customers’ choices: what lost prospects chose, why bids were lost, and what current clients would turn to otherwise (which may be a substitute, such as a leased coffee machine). Published prices and services then help profile those competitors. National café counts and advertising volume answer different questions.',
  },
  {
    id: 'm01-sa-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about situation analysis.',
    text: 'Strengths and weaknesses are [[0]] factors, which the business can change; opportunities and threats are [[1]] factors. PESTEL is a checklist for the [[2]]. A finding drawn only from current clients is open to [[3]].',
    blanks: [
      { options: ['internal', 'external'], answer: 0 },
      { options: ['internal', 'external'], answer: 1 },
      { options: ['microenvironment', 'macroenvironment'], answer: 1 },
      { options: ['survivorship bias', 'a low market share', 'the TOWS matrix'], answer: 0 },
    ],
    solution: 'Strengths and weaknesses belong to the business (internal); opportunities and threats are conditions outside it (external). PESTEL scans the wider forces of the macroenvironment. Research with current clients only leaves out those who chose a rival or left: survivorship bias.',
  },
];
