// promotion-mix.ex.js — M02 · The promotion mix and integrated marketing communications: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Costs and forecasts in these exercises are hypothetical; Lantern's figures come from ./market.js (fictional).

const money = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;

export const widgets = {
  'pm-mixsim': {
    type: 'mixsim',
    lock: { tier: true, range: true, price: true, channels: true },
    show: ['awareness', 'units', 'contribution'],
    note: 'The single-origin can, one flavour, $3.49 and the first plan’s channels (supermarkets, natural grocers, cafés and online shop) are fixed. Only the promotion budget is open: social and search ads, in-store sampling and displays, trade promotions, and PR and events. The simulator spreads each budget evenly over the four quarters. Results come from a teaching model, not a forecast.',
  },
  'pm-budget': {
    type: 'formula',
    title: 'Four ways to set Lantern’s promotion budget',
    intro: 'The first four inputs set the shortcut methods; the last four build the objective-and-task budget from Lantern’s task costs (hypothetical quotes).',
    inputs: [
      { id: 'revenue', label: 'Forecast sales revenue for the year', min: 100000, max: 2000000, step: 10000, value: 600000, fmt: 'money' },
      { id: 'pct', label: 'Percentage of sales', min: 1, max: 30, step: 0.5, value: 15, fmt: 'pct' },
      { id: 'rival', label: 'Main rival’s estimated promotion spending', min: 0, max: 400000, step: 5000, value: 150000, fmt: 'money' },
      { id: 'afford', label: 'What the owners can afford', min: 0, max: 300000, step: 5000, value: 100000, fmt: 'money' },
      { id: 'digital', label: 'Task: social and search ads', min: 0, max: 150000, step: 5000, value: 50000, fmt: 'money' },
      { id: 'sampling', label: 'Task: sampling and displays', min: 0, max: 150000, step: 5000, value: 40000, fmt: 'money' },
      { id: 'trade', label: 'Task: trade promotion windows', min: 0, max: 100000, step: 5000, value: 20000, fmt: 'money' },
      { id: 'pr', label: 'Task: PR and launch event', min: 0, max: 60000, step: 5000, value: 10000, fmt: 'money' },
    ],
    compute: (v) => {
      const task = v.digital + v.sampling + v.trade + v.pr;
      const pctB = v.revenue * v.pct / 100;
      const rows = [
        ['Percentage of sales', `${money(pctB)} (${v.pct}% of ${money(v.revenue)})`],
        ['Competitive parity', money(v.rival)],
        ['Affordable', money(v.afford)],
        ['Objective and task', money(task)],
        ['Task budget minus percentage of sales', money(task - pctB)],
        ['Task budget minus what is affordable', money(task - v.afford)],
      ];
      let note;
      if (task === 0) note = 'With no tasks there are no objectives to pay for: the shortcut methods would still hand out money, which is exactly their weakness.';
      else if (task > v.afford) note = `The tasks cost ${money(task - v.afford)} more than the owners can afford. Rather than trimming every line, decide which objective to scale back: each task line is tied to one.`;
      else note = `The tasks fit within what the owners can afford, with ${money(v.afford - task)} to spare. Check whether a more ambitious objective would be worth the extra money.`;
      return {
        headline: { label: 'Objective-and-task budget', value: money(task) },
        rows,
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Method', values: ['Percentage of sales', 'Competitive parity', 'Affordable', 'Objective and task'] },
          series: [{ name: 'Budget ($)', values: [pctB, v.rival, v.afford, task].map((x) => Math.round(x)) }],
          y: { label: 'Budget ($)' },
        },
      };
    },
  },
};

const TOOLS = ['Advertising', 'Sales promotion', 'Personal selling', 'Public relations', 'Direct and digital marketing'];

export const guided = [
  {
    id: 'm02-pm-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which promotion tool is each of these Lantern activities?',
    items: [
      'A 30-second spot on a Harbour City radio station.',
      'Lantern funds a temporary 20%-off price cut in a supermarket chain.',
      'Lantern’s sales manager presents the can to a natural-grocer chain’s buyer.',
      'A tasting evening for local food writers, with a press kit.',
      'An email with a personal discount code sent to past online-shop customers.',
      'A coupon printed on the multipack worth 50 cents off the next purchase.',
    ],
    categories: TOOLS,
    answer: [0, 1, 2, 3, 4, 1],
    hints: ['Ask: is it paid media to many people, a short-term incentive, a person-to-person conversation, earned coverage, or a message to identified individuals?', 'Price cuts and coupons are incentives to buy now, whoever they are aimed at.'],
    feedback: {
      1: 'Funding a retailer’s price cut is a trade promotion, a kind of sales promotion: a short-term incentive, not advertising.',
      3: 'Lantern doesn’t pay for the coverage itself; it hopes to earn it. That is public relations.',
      4: 'The email goes to identified customers and invites a direct response: direct and digital marketing (the discount code makes it a promotion too, but the tool is the direct message).',
    },
    solution: 'Radio spot: advertising. Funded price cut and on-pack coupon: sales promotion (trade and consumer). Presentation to a buyer: personal selling. Tasting evening for writers: public relations. Personal email to customers: direct and digital marketing.',
  },
  {
    id: 'm02-pm-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Is each activity part of a push strategy (aimed at the channel) or a pull strategy (aimed at final customers)?',
    items: [
      'Lantern funds a supermarket’s four-week price promotion.',
      'Social ads in neighbourhoods near stocking stores, showing where to buy the can.',
      'Sales calls to distributors and store buyers.',
      'A review in a local food blog after the launch event.',
      'An extra margin for stores that give Lantern a chilled display at the till.',
      'A search ad that appears when someone types “cold brew near me”.',
    ],
    categories: ['Push', 'Pull'],
    answer: [0, 1, 0, 1, 0, 1],
    hints: ['Ask who the activity is meant to persuade: a business in the channel, or the person who drinks the can?', 'Money and arguments given to retailers and distributors are push.'],
    feedback: {
      0: 'The money goes to the retailer to run the promotion: a trade promotion, which is push, even though shoppers enjoy the lower price.',
      3: 'The review persuades readers (final customers) to look for the can, so it creates pull.',
      4: 'The extra margin rewards the store for supporting the product: push.',
    },
    solution: 'Push: the funded price promotion, sales calls to the trade and the extra margin for displays. Pull: social ads, the food-blog review and the search ad, which all work on final customers.',
  },
  {
    id: 'm02-pm-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional online clothing retailer forecasts $1,850,000 of revenue next year and sets its promotion budget at 8% of forecast sales. What is the budget?',
    answer: 148000, check: () => 0.08 * 1850000, unit: '$', places: 0, tol: 0.5,
    hints: ['Percentage-of-sales budget = percentage × sales.', 'Write 8% as 0.08.'],
    wrong: [{ value: 14800, say: 'Check the decimal: 8% is 0.08, not 0.008.' }, { value: 1480000, say: 'Check the decimal: 8% is 0.08, not 0.8.' }],
    solution: 'Budget = 0.08 × 1,850,000 = $148,000. Note what the method doesn’t say: what the $148,000 is meant to achieve.',
  },
  {
    id: 'm02-pm-g4', type: 'steps', kind: 'numerical',
    prompt: 'Northfield University (fictional) builds an objective-and-task budget for its open-day campaign. Tasks (hypothetical costs): 2,400,000 targeted ad impressions at $6 per thousand; a printed prospectus mailed to 8,000 applicants at $1.50 each; three open-day events at $9,000 each. The finance office says it can afford $45,000.',
    solution: 'Ads: 2,400,000 ÷ 1,000 × 6 = $14,400. Prospectus: 8,000 × 1.50 = $12,000. Events: 3 × 9,000 = $27,000. Total: 14,400 + 12,000 + 27,000 = $53,400, which is $8,400 more than the $45,000 available. The university must either find the money or decide which objective to scale back, for example two events instead of three.',
    steps: [
      { id: 'm02-pm-g4-s1', type: 'num', prompt: 'What do the ad impressions cost?',
        answer: 14400, check: () => 2400000 / 1000 * 6, unit: '$', places: 0, tol: 0.5,
        hints: ['The price is per thousand impressions.', 'Divide the impressions by 1,000, then multiply by $6.'],
        wrong: [{ value: 14400000, say: 'The $6 is for every thousand impressions, not every impression. Divide by 1,000 first.' }] },
      { id: 'm02-pm-g4-s2', type: 'num', prompt: 'What is the total objective-and-task budget?',
        answer: 53400, check: () => 2400000 / 1000 * 6 + 8000 * 1.5 + 3 * 9000, unit: '$', places: 0, tol: 0.5,
        hints: ['Cost each task, then add them.', 'Prospectus 8,000 × $1.50; events 3 × $9,000.'],
        wrong: [{ value: 35400, say: 'You counted one open day. There are three at $9,000 each.' }] },
      { id: 'm02-pm-g4-s3', type: 'num', prompt: 'By how much does the task budget exceed what the university can afford?',
        answer: 8400, check: () => (2400000 / 1000 * 6 + 8000 * 1.5 + 3 * 9000) - 45000, unit: '$', places: 0, tol: 0.5,
        hints: ['Subtract the affordable amount from the task total.'] },
    ],
  },
];

export const independent = [
  {
    id: 'm02-pm-i1', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional company sells battery-storage systems worth several hundred thousand dollars to factories and warehouses. Each purchase involves engineers, finance staff and managers. Which promotion tool should carry most of the effort?',
    options: ['Personal selling', 'Television advertising', 'Coupons and other consumer sales promotions', 'Sponsoring a national sports team'],
    answer: 0,
    feedback: {
      1: 'Television reaches millions of people who will never buy a factory battery system. The cost per relevant contact would be enormous.',
      2: 'Coupons prompt quick, low-risk purchases. A large, technical purchase made by a group needs explanation, tailoring and negotiation.',
      3: 'Sponsorship can build awareness, but it can’t answer the buyer group’s technical and financial questions.',
    },
    solution: 'Large, complex B2B purchases made by several people need two-way, tailored communication that can answer objections and negotiate terms: personal selling, supported by technical content, PR and trade shows. The high cost per contact is justified by the size of each sale.',
  },
  {
    id: 'm02-pm-i2', type: 'num', kind: 'numerical',
    prompt: 'A brand wants to match the average promotion spending of its three main rivals, estimated at $180,000, $90,000 and $120,000. What budget does competitive parity give?',
    answer: 130000, check: () => (180000 + 90000 + 120000) / 3, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 390000, say: 'That is the rivals’ total. Competitive parity matches the average rival here: divide by 3.' }, { value: 180000, say: 'That matches the biggest spender, not the average.' }],
    solution: 'Average = (180,000 + 90,000 + 120,000) ÷ 3 = 390,000 ÷ 3 = $130,000. The rivals’ figures are estimates, and their objectives may not be the brand’s.',
  },
  {
    id: 'm02-pm-i3', type: 'mc', kind: 'conceptual',
    prompt: 'A shopper who has never heard of Lantern grabs a can because it is chilled and next to the till, tastes it, and decides she likes it. What does this suggest about AIDA?',
    options: [
      'In low-involvement purchases, trial can come before interest and desire: the stages aren’t a fixed order.',
      'AIDA is proved wrong by this one shopper, so it should never be used to plan Lantern’s promotion.',
      'The shopper skipped the attention stage, which AIDA says is impossible for any buyer.',
      'AIDA applies only to products advertised on television, so it can’t describe a can picked up beside the till.',
    ],
    answer: 0,
    feedback: {
      1: 'One counter-example shows the sequence isn’t fixed, not that the model is useless. It is still a helpful checklist of what has to happen.',
      2: 'She did notice the can (attention); what she skipped was building interest and desire before buying.',
      3: 'AIDA was formulated for selling generally, long before television. The issue is the order of the stages, not the medium.',
    },
    solution: 'The shopper noticed the can and bought it before any interest or desire had formed; liking came from the experience. Reviews of the evidence (Vakratsas and Ambler, 1999) find little support for a fixed order of effects. For cheap, low-risk products, getting trial (availability, sampling) can matter more than building desire first.',
  },
  {
    id: 'm02-pm-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline launching a new route budgets by objective and task: a PR launch costing $8,000; 3,000,000 targeted ad impressions at $7 per thousand; and incentives of $1.50 per ticket for travel agents on an expected 6,000 tickets. What is the total budget?',
    answer: 38000, check: () => 8000 + 3000000 / 1000 * 7 + 1.5 * 6000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 29000, say: 'You left out the travel-agent incentives (6,000 × $1.50), a push element of the plan.' }],
    solution: 'PR $8,000 + ads 3,000,000 ÷ 1,000 × 7 = $21,000 + agent incentives 6,000 × 1.50 = $9,000. Total = $38,000.',
  },
  {
    id: 'm02-pm-i5', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s ads say “café-quality single-origin, steeped 20 hours”. Meanwhile a supermarket’s weekly flyer shows “Lantern Cold Brew: 2 for $5” every other week, funded by Lantern’s trade budget. What is the main problem, and the best fix?',
    options: [
      'The messages clash: frequent deep deals say the can is cheap. Limit trade promotions to a few planned windows and agree how the brand is shown.',
      'There is no problem: more promotion always means more sales, and the deals and the ads reach different shoppers.',
      'The ads are the problem: Lantern should drop the origin story and advertise the 2 for $5 price instead.',
      'The flyer is the retailer’s business, so Lantern can do nothing about it except advertise more heavily.',
    ],
    answer: 0,
    feedback: {
      1: 'More promotion can mean more units now, but frequent price deals undercut a premium positioning and teach shoppers to wait for the deal.',
      2: 'That would abandon the positioning the product, price and channels were chosen for.',
      3: 'The deals are funded by Lantern’s trade budget, so Lantern can set how often and how deep they are.',
    },
    solution: 'This is an integration failure: the trade promotions say “cheap” while the ads say “premium”. Lantern controls the trade budget, so it can limit the deals to a few windows at a modest depth and agree with the retailer how the can is presented.',
  },
  {
    id: 'm02-pm-i6', type: 'short', kind: 'applied',
    prompt: 'Critique this proposed campaign for Lantern’s launch (single-origin can, $3.49, sold in supermarkets, natural grocers and Lantern’s own cafés and online shop; $120,000 budget): “Spend $70,000 on city-wide radio and outdoor posters with the line ‘The cheapest cold brew in town’; $30,000 on 25%-off trade promotions every month; $20,000 on sampling in convenience stores; nothing on PR.” Identify at least three inconsistencies and propose fixes.',
    rubric: [
      'Spots the message conflict: “cheapest” contradicts a $3.49 premium single-origin positioning (Daily Grind at $2.29 is cheaper anyway).',
      'Spots that monthly 25%-off deals undermine the price position and teach shoppers to wait for deals.',
      'Spots that sampling in convenience stores is wasted: Lantern isn’t stocked there.',
      'Notes the weak targeting of city-wide media versus ads near stocking stores, and the missing push to win and support listings.',
      'Proposes a reallocated, integrated plan with one message and measurable objectives.',
    ],
    model: 'The plan contradicts the rest of the mix. (1) “The cheapest cold brew in town” is false and off-strategy: Lantern is a premium single-origin can at $3.49, and Daily Grind sells at $2.29. The message should be about café quality and the 20-hour steep. (2) Monthly 25%-off trade promotions would make the deal price the real price in shoppers’ minds and erode margin; limit them to a few launch windows at about 20%. (3) Sampling in convenience stores creates trial where shoppers can’t buy the can; sample in the supermarkets and natural grocers that stock it. (4) City-wide radio and posters reach many people far from any stockist; geo-targeted social and search ads near stocking stores would waste less and can be measured. (5) Nothing supports the listings (displays, sell-in) or earns credible coverage; some budget should go to PR around the launch. A consistent plan would look like the first plan: about $50,000 digital, $40,000 sampling and displays in stocking stores, up to $20,000 of trade windows (as little as retailers will accept) and $10,000 PR, with awareness, trial and sales-per-store targets.',
  },
];

export const check = [
  {
    id: 'm02-pm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does integrated marketing communications (IMC) mean?',
    options: [
      'Planning the tools together so they send one consistent brand message, each doing the job it does best.',
      'Running the same advertisement, word for word, in every medium the brand uses, so that the message never varies.',
      'Spending the promotion budget equally across all five tools, so that no part of the promotion mix is neglected.',
      'Handing all communication to one advertising agency, so a single team controls every message.',
    ],
    answer: 0,
    feedback: {
      1: 'Consistency is about the message and positioning, not identical executions: a shelf tag and a video can’t say the same words.',
      2: 'Integration chooses each tool for its job; an equal split ignores what each tool does well.',
      3: 'One agency may help coordination, but integration is a planning discipline, not an organisational chart.',
    },
    solution: 'IMC coordinates all the tools around one positioning and a consistent message, with timing that lets them reinforce each other: ads point to where the product is stocked, sampling happens where the ads run, and promotions don’t contradict the brand.',
  },
  {
    id: 'm02-pm-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer forecasts revenue of $5,200,000 and sets its promotion budget at 3% of forecast sales. What is the budget?',
    answer: 156000, check: () => 0.03 * 5200000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 15600, say: 'Check the decimal: 3% is 0.03.' }],
    solution: 'Budget = 0.03 × 5,200,000 = $156,000.',
  },
  {
    id: 'm02-pm-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand plans a launch by objective and task (hypothetical costs): 90 sponsored posts by local creators at $400 each; 2,000,000 targeted ad impressions at $9 per thousand; a pop-up shop on two weekends at $7,500 per weekend. What is the budget?',
    answer: 69000, check: () => 90 * 400 + 2000000 / 1000 * 9 + 2 * 7500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 18051000, say: 'The $9 is per thousand impressions: 2,000,000 ÷ 1,000 × 9 = $18,000.' },
      { value: 61500, say: 'The pop-up runs on two weekends: 2 × $7,500.' },
    ],
    solution: 'Posts 90 × 400 = $36,000; ads 2,000,000 ÷ 1,000 × 9 = $18,000; pop-up 2 × 7,500 = $15,000. Total = $69,000.',
  },
  {
    id: 'm02-pm-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each activity as push or pull.',
    items: [
      'A hotel pays travel agents a bonus commission for every booking in the off-season.',
      'An airline emails members of its loyalty scheme about a fare sale.',
      'A snack maker pays a supermarket for an end-of-aisle display.',
      'A university posts videos of student life on social media.',
    ],
    categories: ['Push', 'Pull'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'The bonus rewards an intermediary (the travel agent) for selling: push.',
      2: 'The payment goes to the retailer for supporting the product: a trade promotion, so push.',
    },
    solution: 'Push: the travel-agent bonus and the paid display (both aimed at intermediaries). Pull: the fare-sale email and the student-life videos (both aimed at final customers).',
  },
  {
    id: 'm02-pm-k5', type: 'multi', kind: 'applied',
    prompt: 'Lantern (single-origin can, $3.49, sold in supermarkets, natural grocers and its own cafés and online shop) is reviewing a campaign proposal. Which elements are inconsistent with the rest of its mix? Select all that apply.',
    options: [
      'Sampling days in convenience stores, which don’t stock Lantern',
      'A monthly 30%-off trade promotion in every supermarket',
      'Ads with the line “Why pay café prices? We’re the cheapest”',
      'Geo-targeted social ads near stocking stores during sampling weeks',
      'A launch tasting for local food writers about the 20-hour steep',
      'Online-shop 12-packs priced in line with the shelf price per can',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'This is consistent: the ads reach people who can find the can, at the time sampling teams are there.',
      4: 'This supports the premium, provenance-led story with credible coverage.',
      5: 'Keeping online prices in line with the shelf avoids vertical conflict with the stores.',
    },
    solution: 'Sampling where the can isn’t sold wastes trial; monthly deep discounts and a “cheapest” message contradict a premium $3.49 positioning. The geo-targeted ads, the PR tasting and consistent online pricing all fit.',
  },
  {
    id: 'm02-pm-k6', type: 'mc', kind: 'conceptual',
    prompt: 'What is the main weakness of setting the promotion budget as a percentage of sales?',
    options: [
      'It treats sales as the cause of promotion, not its result: spending falls with sales and a new product gets none.',
      'It is too complicated to calculate, because it needs a forecast of every product’s sales.',
      'It always produces a larger budget than competitors spend, so the firm overspends in a crowded market.',
      'It can only be used by retailers, because manufacturers don’t know their sales until the end of each financial year.',
    ],
    answer: 0,
    feedback: {
      1: 'It is the simplest method of all, which is much of its appeal.',
      2: 'The result depends on the percentage chosen; it can be larger or smaller than rivals’ spending.',
      3: 'Any business can use it; the problem is its logic, not who uses it.',
    },
    solution: 'Promotion is meant to drive sales, but this method lets sales drive promotion. A launch has no past sales, and when sales fall the budget falls too, perhaps when promotion is most needed. It is best used as a cross-check on an objective-and-task budget.',
  },
];
