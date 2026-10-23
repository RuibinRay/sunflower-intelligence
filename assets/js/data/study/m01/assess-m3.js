// assess-m3.js — M01 module 3 test: Foundations of strategy (situation-analysis, marketing-objectives, competitive-advantage).
// No hints. Each item has a full solution, shown when the student reviews the test. All businesses and figures are fictional.

export const items = [
  {
    id: 'm01-m3-1', lesson: 'situation-analysis', type: 'rows', kind: 'applied',
    prompt: 'A fictional island ferry operator has collected notes for its SWOT. Select every row that belongs in the external half of the grid (opportunities or threats).',
    data: { table: {
      head: ['Note', 'Source'],
      rows: [
        ['A rival operator has ordered a faster boat for next summer', 'Harbour notice'],
        ['Our two boats are 30 years old and need more repairs each year', 'Maintenance log'],
        ['The island’s council plans a new development of 300 holiday homes', 'Planning application'],
        ['Our crews have the best safety record on the route', 'Regulator’s annual report'],
        ['Marine fuel prices have risen sharply this year', 'Supplier invoices'],
        ['Add a late-evening sailing on Fridays', 'Manager’s idea'],
        ['A new law will require every ferry to count passengers electronically from 2028', 'Government consultation'],
      ],
    } },
    answer: [0, 2, 4, 6],
    solution: 'External: the rival’s faster boat (a threat), the holiday-home development (an opportunity), the rise in fuel prices (a threat from the economy, even though the firm’s own invoices are where it shows up) and the new counting law (a legal factor, probably a threat as a cost). Internal: the ageing boats (a weakness) and the safety record (a strength). The late sailing is an action, an option for later, not a SWOT item.',
  },
  {
    id: 'm01-m3-2', lesson: 'situation-analysis', type: 'num', kind: 'numerical',
    prompt: 'Customers of a fictional bike-repair shop made 50 mentions of what decides where they take their bike: speed of repair 20, price 15, friendliness 10 and location 5. The shop is rated 3, 4, 5 and 2 out of 5 on those factors. What is its weighted competitive-strength score? (Two decimal places.)',
    answer: 3.6, check: () => (20 * 3 + 15 * 4 + 10 * 5 + 5 * 2) / 50, tol: 0.005, unit: 'points', places: 2,
    wrong: [
      { value: 3.5, say: 'That is the plain average of the four ratings. Weight each rating by its share of the 50 mentions first.' },
      { value: 14, say: 'That is the sum of the ratings. Multiply each by its weight (0.4, 0.3, 0.2, 0.1) and add.' },
    ],
    solution: 'Weights: 20 ÷ 50 = 0.4, 15 ÷ 50 = 0.3, 10 ÷ 50 = 0.2, 5 ÷ 50 = 0.1. Score = 0.4 × 3 + 0.3 × 4 + 0.2 × 5 + 0.1 × 2 = 1.2 + 1.2 + 1.0 + 0.2 = 3.6. Its weakest rating, speed, is on the factor customers mention most: the obvious place to improve.',
  },
  {
    id: 'm01-m3-3', lesson: 'situation-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a PESTEL scan list factors without labelling them as opportunities or threats?',
    options: [
      'The same factor can help one business and harm another; that judgement belongs in the SWOT for a particular business',
      'Every PESTEL factor is a threat to every business, so a label would add nothing to the analysis',
      'PESTEL covers only factors inside the business, which SWOT then sorts into strengths and weaknesses',
      'PESTEL factors are too uncertain to judge at all, so they should be left out of strategic planning',
    ],
    answer: 0,
    feedback: {
      1: 'A new packaging rule is a cost for one firm and a selling point for another that already complies. Factors are not threats by nature.',
      2: 'PESTEL scans the macroenvironment, which is external. Strengths and weaknesses are internal.',
      3: 'Uncertain factors can still be prioritised by impact and likelihood; leaving them out is how plans get surprised.',
    },
    solution: 'PESTEL is a checklist of wider forces. Whether a force is an opportunity or a threat depends on the business, its strengths and its objectives, so that judgement is made in the SWOT, not in the scan.',
  },
  {
    id: 'm01-m3-4', lesson: 'situation-analysis', type: 'mc', kind: 'applied',
    prompt: 'A fictional software firm surveyed its 40 longest-standing customers, and 36 of them said they were “very satisfied”. The marketing manager writes in the SWOT: “Strength: 90% of the market is very satisfied with our product.” What is the main flaw?',
    options: [
      'The sample is customers who stayed longest, so it can’t speak for the market or for customers who left',
      'A sample of 40 customers is always too small to support any conclusion about what customers think',
      '36 out of 40 is 85%, not 90%, so the figure written in the SWOT is simply miscalculated',
      'Satisfaction is an external factor, so it belongs among the opportunities rather than the strengths',
    ],
    answer: 0,
    feedback: {
      1: 'Forty customers can tell you something about those forty. The problem is who they are, not only how many.',
      2: '36 ÷ 40 = 0.90, so 90% is right for the sample. The flaw is in what the sample represents.',
      3: 'Customers’ satisfaction with the firm’s own product reflects something the firm controls: internal.',
    },
    solution: 'Long-standing customers are the ones who were satisfied enough to stay: survivorship bias. The finding (90% of these 40) may support a strength among loyal customers, but it says nothing about the whole market, prospects who chose rivals, or customers who left. The entry should say who was asked.',
  },
  {
    id: 'm01-m3-5', lesson: 'marketing-objectives', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym chain has 2,500 members at the start of the year and expects to keep 72% of them. It wants 8% more members at the end of the year, at the same fee. How many new members must it recruit (counting only those still members at the year end)?',
    answer: 900, check: () => 2500 * (1 + 0.08 - 0.72), tol: 0.5, unit: 'members', places: 0,
    wrong: [
      { value: 200, say: 'That is only the growth, as if every member stayed. The chain loses 28% of its members, who must be replaced first.' },
      { value: 700, say: 'That is only the members lost. Add the 200 of growth.' },
      { value: 2700, say: 'That is the total needed at the year end. Subtract the 1,800 members it keeps.' },
    ],
    solution: 'Needed: 2,500 × 1.08 = 2,700. Kept: 2,500 × 0.72 = 1,800. New: 2,700 − 1,800 = 900, or 2,500 × (1 + 0.08 − 0.72) = 2,500 × 0.36. Of the 900, 700 replace members who leave.',
  },
  {
    id: 'm01-m3-6', lesson: 'marketing-objectives', type: 'num', kind: 'applied',
    prompt: 'A fictional IT-support firm has 150 business clients, each paying $8,000 a year. Its goal is 20% more revenue next year. It will raise its fee by 6% and expects to keep 88% of its clients. How many new clients must it win? Round up only at the end.',
    answer: 38, check: () => Math.ceil(150 * 8000 * 1.20 / (8000 * 1.06) - 150 * 0.88), tol: 0.5, unit: 'clients', places: 0,
    wrong: [
      { value: 48, say: 'That ignores the fee rise. With each client paying 6% more, fewer clients are needed: 180 ÷ 1.06 ≈ 169.8, not 180.' },
      { value: 37, say: 'You rounded down. 169.8 − 132 = 37.8, and 37 clients would leave the firm short of its goal.' },
      { value: 30, say: 'That is 20% of the starting clients, as if every client stayed and the fee didn’t change.' },
    ],
    solution: 'Revenue target: 150 × 8,000 × 1.20 = $1,440,000. Fee next year: 8,000 × 1.06 = $8,480. Clients needed: 1,440,000 ÷ 8,480 ≈ 169.8. Kept: 150 × 0.88 = 132. New: 169.8 − 132 = 37.8, rounded up to 38. The objective should also watch retention after the fee rise: at 85% retention it would keep 127.5 clients and need 43.',
  },
  {
    id: 'm01-m3-7', lesson: 'marketing-objectives', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional business-software firm tracks six measures. Classify each as a leading or a lagging indicator of its revenue.',
    items: [
      'Qualified leads received this month',
      'Revenue for the year',
      'Proposals sent this quarter',
      'Clients lost last year',
      'Share of target buyers who recognise the brand',
      'Profit for the quarter',
    ],
    categories: ['Leading indicator', 'Lagging indicator'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      3: 'Clients lost is an outcome that has already happened, reported after the fact: lagging. A rise in complaints or falling usage would be leading signs of it.',
      4: 'Awareness sits at the top of the funnel and moves before enquiries, proposals and revenue: leading.',
    },
    solution: 'Leading (they move first and warn early): qualified leads, proposals and brand awareness. Lagging (they report outcomes): annual revenue, clients lost last year and quarterly profit. A set of objectives needs both: lagging measures say whether the goal was met, leading ones say in time whether it is going to be.',
  },
  {
    id: 'm01-m3-8', lesson: 'marketing-objectives', type: 'mc', kind: 'applied',
    prompt: 'A fictional university rewards its admissions team for the number of offers it makes to applicants. Which guardrail metric best protects the university against this target being gamed?',
    options: [
      'The share of offer-holders who go on to complete their first year, kept at least at last year’s level',
      'The number of enquiries received each month, compared with the same month last year',
      'The total number of offers made, reported to the admissions team every week',
      'The admissions advertising budget, kept within the amount agreed for the year',
    ],
    answer: 0,
    feedback: {
      1: 'Enquiries are a useful leading indicator, but they don’t change if the team meets its target by making offers to weaker applicants.',
      2: 'That is the target itself. A guardrail is a different measure that must not get worse while the target is pursued.',
      3: 'A budget control limits spending, but the easiest way to game an offers target costs nothing: lower the bar.',
    },
    solution: 'The cheapest way to make more offers is to offer places to applicants who are less likely to succeed. First-year completion is the measure that would get worse if that happened, so it is the guardrail. This is Goodhart’s law in action: the target needs a second measure that catches gains made at a hidden cost.',
  },
  {
    id: 'm01-m3-9', lesson: 'competitive-advantage', type: 'num', kind: 'numerical',
    prompt: 'A rival gym charges $45 a month, and a typical member would pay up to $60 for it. The same member would pay up to $75 a month for a fictional climbing gym. At the highest price that still leaves the member at least as well off as the rival does, what is the climbing gym’s price premium over the rival? Give a percentage to one decimal place.',
    answer: 33.3, check: () => ((45 + (75 - 60)) / 45 - 1) * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 25, say: 'You divided the $15 gap by the climbing gym’s price. The premium is measured against the rival’s price: 15 ÷ 45.' },
      { value: 66.7, say: 'That uses the member’s willingness to pay ($75) as the price. At $75 the member keeps nothing, so would choose the rival.' },
      { value: 15, say: 'That is the premium in dollars. Express it as a percentage of the rival’s $45.' },
    ],
    solution: 'The rival leaves the member 60 − 45 = $15. The climbing gym must leave at least $15, so its highest price is 75 − 15 = $60 (the rival’s $45 plus the $15 gap in willingness to pay). Premium = (60 ÷ 45 − 1) × 100 ≈ 33.3%.',
  },
  {
    id: 'm01-m3-10', lesson: 'competitive-advantage', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional brewery runs VRIO on four of its resources. What does VRIO conclude about each?',
    items: [
      'Stainless-steel brewing equipment of the kind every brewery uses',
      'A new seasonal beer, popular this year, that rivals could copy by next season',
      'A spring the brewery has owned for a century, whose water gives its beer a taste customers seek out, featured on every label',
      'Historic recipes that tasters rate highly and no rival has, which the brewery has never brewed or marketed',
    ],
    categories: ['Competitive parity', 'Temporary advantage', 'Sustained advantage', 'Unexploited advantage'],
    answer: [0, 1, 2, 3],
    feedback: {
      1: 'Valuable and rare this year, but easy to copy: the lead lasts only until rivals brew their own.',
      3: 'Valuable, rare and hard to imitate, but the brewery isn’t organised to use them: the O of VRIO.',
    },
    solution: 'Common equipment: valuable but not rare, so parity. The seasonal beer: valuable and rare but easy to copy, so temporary. The spring: valuable, rare, impossible to copy and used in the brand, so sustained. The unused recipes: an unexploited advantage until the brewery organises to brew and sell them.',
  },
  {
    id: 'm01-m3-11', lesson: 'competitive-advantage', type: 'mc', kind: 'applied',
    prompt: 'A fictional speciality coffee roaster sells to cafés at $16 a kilogram and earns a margin of $4 a kilogram. A cheaper rival sells at $13, and a few cafés have switched. If the roaster matched the rival’s price for all its clients, what would happen to its margin?',
    options: [
      'It would fall from $4 to $1 a kilogram, three-quarters of it, on every client, including those happy to pay $16',
      'It would fall by about 19%, the same percentage as the cut in price, on every kilogram it sells',
      'It would stay at $4 a kilogram, because the extra volume from clients who return would make up for the cut',
      'It would rise, because matching the rival’s price would give the roaster a cost advantage over that rival',
    ],
    answer: 0,
    feedback: {
      1: 'The price falls by 19% ($3 of $16), but the whole $3 comes out of the $4 margin: a 75% fall.',
      2: 'The margin per kilogram falls by $3 whatever the volume. To earn the same total margin the roaster would need four times the volume.',
      3: 'A price cut doesn’t change costs. Without lower costs, matching hands value to customers.',
    },
    solution: 'New margin: 4 − (16 − 13) = $1 a kilogram, a fall of 3 ÷ 4 = 75%, on every kilogram sold to every client. The roaster would need four times the volume to earn the same total margin. A differentiator should first find out which cafés are leaving and what its difference is worth to them.',
  },
  {
    id: 'm01-m3-12', lesson: 'competitive-advantage', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about Porter’s idea of being “stuck in the middle” is most accurate?',
    options: [
      'Porter warned that pursuing low cost and differentiation at once can leave a firm with neither; Hill (1988) argued that the two can sometimes be combined',
      'Porter proved that no firm in any industry can ever have both low costs and a product that customers value more than its rivals’ products',
      'It describes any firm that follows a focus strategy, since a focused firm serves only the middle part of its market and ignores both ends',
      'It means a firm whose prices sit in the middle of its market, whatever its costs are and whatever its customers think of what it offers',
    ],
    answer: 0,
    feedback: {
      1: 'The generic strategies are a framework, not a proof. Hill showed mechanisms, such as scale won by a valued product, through which cost and differentiation can go together.',
      2: 'Focus means serving a narrow segment well, through cost or differentiation. It is a clear choice, the opposite of being stuck.',
      3: 'Being stuck is about having no clear source of advantage, not about where the price sits.',
    },
    solution: 'Porter (1980) argued that firms succeed by a clear choice of cost leadership, differentiation or focus, and that firms trying for both cost and differentiation without achieving either end up stuck in the middle. Hill (1988) qualified this: differentiation can bring the volume that lowers cost, so in some industries both are possible. Use the framework to force a clear choice, not as a law.',
  },
];
