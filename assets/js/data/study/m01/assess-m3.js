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
    solution: 'Weights: 20 ÷ 50 = 0.4, 15 ÷ 50 = 0.3, 10 ÷ 50 = 0.2, 5 ÷ 50 = 0.1. Score = 0.4 × 3 + 0.3 × 4 + 0.2 × 5 + 0.1 × 2 = 1.2 + 1.2 + 1.0 + 0.2 = 3.6. Its rating on speed (3), the factor customers mention most, has the most weight behind it: each extra point adds 0.4.',
  },
  {
    id: 'm01-m3-3', lesson: 'situation-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a PESTEL scan list factors without labelling them as opportunities or threats?',
    options: [
      'The same factor can help one business and harm another; the SWOT makes that judgement',
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
      'Long-standing customers stayed because they were satisfied; they can’t speak for the market',
      'A sample of 40 customers is always too small to support any conclusion about what customers think',
      '36 out of 40 is 85%, not 90%, so the figure written in the SWOT is miscalculated',
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
    prompt: 'Clients of a fictional consultancy each pay $4,000 a year, billed monthly from the month they sign. The firm needs $80,000 more revenue this year from new clients, and expects them to sign evenly through the year. About how many new clients must it win this year?',
    answer: 40, check: () => 80000 / (4000 * 0.5), tol: 0.5, unit: 'clients', places: 0,
    wrong: [
      { value: 20, say: 'That assumes every new client signs on 1 January and pays for the whole year. Signing evenly through the year, each pays for about half of it on average.' },
    ],
    solution: 'Clients who sign evenly through the year are clients for about half of it on average, so each brings in about 4,000 × 0.5 = $2,000 this year. 80,000 ÷ 2,000 = 40 new clients. Had they all signed on 1 January, 80,000 ÷ 4,000 = 20 would have been enough. A target must say which timing it assumes, or be set as the revenue rate at the year end.',
  },
  {
    id: 'm01-m3-6', lesson: 'marketing-objectives', type: 'mc', kind: 'applied',
    prompt: 'A fictional design agency’s growth goal needs 60 new clients next year (top-down). Last year it received 400 leads and won 10% of them, and nothing in next year’s plan changes either figure (bottom-up). What should the marketing plan do?',
    options: [
      'Name the actions that will close the gap of 20 clients, or revise the goal before the year starts',
      'Keep the target at 60 and trust the sales team to find the extra clients during the year',
      'Average the two figures and aim for 50 new clients, which splits the difference fairly',
      'Set the target at 40, the bottom-up figure, and report the goal as met if 40 are won',
    ],
    answer: 0,
    feedback: {
      1: 'A target with nothing behind it is a hope. The plan must say what will be different: more leads, a better win rate, or both.',
      2: 'Averaging hides the problem: 50 is still 10 more than the plan can deliver, and the goal still needs 60.',
      3: 'Lowering the target is a fair choice only if the goal is revised openly. Reporting 40 as meeting a goal that needed 60 misleads the business.',
    },
    why: 'The gap between the top-down and bottom-up figures is the most useful number in the plan: it must be closed by named actions or by revising the goal.',
    solution: 'Bottom-up, 400 × 0.10 = 40 new clients; the goal needs 60, a gap of 20. The plan should either name what will close it, such as 600 leads at the same win rate (60 ÷ 0.10) or a 15% win rate on the same 400 leads (60 ÷ 400), and budget for it, or the goal should be revised before the year starts.',
  },
  {
    id: 'm01-m3-7', lesson: 'marketing-objectives', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional business-software firm tracks six measures. Classify each as a leading or a lagging indicator.',
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
      'First-year completion among offer-holders, kept at least at last year’s level',
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
    id: 'm01-m3-10', lesson: 'competitive-advantage', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these changes increase the value a business creates for each customer (willingness to pay minus cost)? Select all that apply.',
    options: [
      'Cutting the cost of serving customers without changing what they get',
      'Adding a feature customers value at $10 that costs $4 to provide',
      'Cutting the price by $5, so that every customer keeps $5 more of the value',
      'Adding a feature that costs $6 to provide and that customers value at $2',
      'Raising the price by $5 with no change to the offer or to the cost of providing it',
      'Dropping a service that costs $8 to provide and that customers value at $3',
    ],
    answer: [0, 1, 5],
    feedback: {
      2: 'A price cut moves value from the business to the customer. Willingness to pay and cost don’t change, so the total doesn’t either.',
      3: 'Value created falls by $4: the feature adds $2 of willingness to pay and $6 of cost.',
      4: 'A price rise moves value from the customer to the business; the total is unchanged, and some customers may leave.',
    },
    solution: 'Value created = willingness to pay − cost. It rises when cost falls and willingness to pay doesn’t (the first option), when a feature adds more willingness to pay than cost ($10 − $4 = +$6), and when a service that costs more than it is worth is dropped (−$3 + $8 = +$5). Price changes only move value between customer and business, and the $6 feature worth $2 destroys $4.',
  },
  {
    id: 'm01-m3-11', lesson: 'competitive-advantage', type: 'mc', kind: 'applied',
    prompt: 'A fictional translation agency serves two kinds of client. Law firms would pay up to $900 for a typical job from the agency, and up to $600 for the same job from a cheaper rival that charges $500. Start-ups would pay up to $500 for it from the agency and up to $540 from the rival, whose online ordering they prefer. A job costs the agency $470. What should the agency do?',
    options: [
      'Serve law firms, at up to $800 a job, and leave start-ups to the rival',
      'Charge both kinds of client $630, the average of the two winning prices, to keep one price list',
      'Cut its price to $460 for everyone, so that both kinds of client choose the agency',
      'Match the rival’s $500 for every client, so that neither kind of client has a reason to leave',
    ],
    answer: 0,
    feedback: {
      1: 'At $630 start-ups still choose the rival (paying $630 for a job they value at $500 leaves them $130 worse off, against $40 better off with the rival), and each law firm pays $170 less than it would have accepted.',
      2: 'At $460 the agency loses $10 on every job, and law firms pay $340 less than they would have accepted.',
      3: 'At $500 start-ups keep nothing with the agency against $40 with the rival, so they still leave; law firms pay $300 less than they would accept, and the agency earns only $30 a job.',
    },
    solution: 'Law firms: the rival leaves them 600 − 500 = $100, so the agency can charge up to 900 − 100 = $800 and earn 800 − 470 = $330 a job. Start-ups: the rival leaves them 540 − 500 = $40, so the agency’s ceiling is 500 − 40 = $460, below its $470 cost: it can’t win them profitably. Willingness to pay differs between segments, so the agency should concentrate on law firms and let the rival have the start-ups, unless it changes its offer for them.',
  },
  {
    id: 'm01-m3-12', lesson: 'competitive-advantage', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about Porter’s idea of being “stuck in the middle” is most accurate?',
    options: [
      'Porter warned that chasing both can leave a firm with neither; Hill (1988) argued both can sometimes combine',
      'Porter proved that no firm in any industry can ever have both low costs and a product that customers value more than its rivals’ products',
      'It describes any firm that follows a focus strategy, since a focused firm serves only the middle part of its market and ignores both ends',
      'It means a firm whose prices sit in the middle of its market, whatever its costs are and whatever its customers think of what it offers',
    ],
    answer: 0,
    feedback: {
      1: 'The generic strategies are a framework, not a proof, and Hill (1988) argued that cost and differentiation can sometimes go together.',
      2: 'Focus means serving a narrow segment well, through cost or differentiation. It is a clear choice, the opposite of being stuck.',
      3: 'Being stuck is about having no clear source of advantage, not about where the price sits.',
    },
    solution: 'Porter (1980) argued that firms succeed by a clear choice of cost leadership, differentiation or focus, and that firms trying for both cost and differentiation without achieving either end up stuck in the middle. Hill (1988) qualified this, arguing that the two need not be opposites and that in some circumstances a firm can achieve both. Use the framework to force a clear choice, not as a law.',
  },
];
