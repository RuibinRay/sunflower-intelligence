// assess-m4.js — M02 module 4 test: Promotion and the whole mix (promotion-mix, measuring-the-mix). No hints; solutions shown on review.
// Campaign figures are hypothetical; Lantern figures come from ./market.js (fictional). Every num item's check recomputes its answer.
const P = 'promotion-mix';
const M = 'measuring-the-mix';

export const items = [
  {
    id: 'm02-m4-1', lesson: M, type: 'num', kind: 'numerical',
    prompt: 'A television schedule reaches 70% of its target audience with an average frequency of 3.5. How many gross rating points does it deliver?',
    answer: 245, check: () => 70 * 3.5, unit: 'GRPs', places: 0, tol: 0.5,
    wrong: [{ value: 2.45, say: 'Use reach as a percentage (70), not a decimal.' }, { value: 73.5, say: 'Multiply reach by frequency; don’t add them.' }],
    solution: 'GRPs = reach % × average frequency = 70 × 3.5 = 245.',
  },
  {
    id: 'm02-m4-2', lesson: M, type: 'num', kind: 'numerical',
    prompt: 'A fictional dance school is choosing how to promote its autumn classes. A sponsored message in a local parents’ newsletter costs $1,350 and is opened 45,000 times. A month of posters on bus shelters near the school costs $2,880 and is expected to be seen 360,000 times. By how many dollars does the newsletter’s CPM exceed the bus shelters’?',
    answer: 22, check: () => 1350 / 45000 * 1000 - 2880 / 360000 * 1000, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 0.022, say: 'That is the difference in cost per single impression. CPM is per thousand impressions: multiply by 1,000.' },
      { value: 3.75, say: 'That is how many times higher the newsletter’s CPM is (30 ÷ 8). The question asks for the difference in dollars.' },
      { value: -1530, say: 'That compares the two costs, not the cost per thousand impressions. Divide each cost by its impressions first.' },
    ],
    solution: 'Newsletter CPM = 1,350 ÷ 45,000 × 1,000 = $30.00. Bus-shelter CPM = 2,880 ÷ 360,000 × 1,000 = $8.00. The newsletter costs 30.00 − 8.00 = $22.00 more per thousand impressions. That alone doesn’t make the posters the better buy: the newsletter reaches parents who are choosing activities for their children, and a cheap impression nobody notices is not a bargain.',
  },
  {
    id: 'm02-m4-3', lesson: M, type: 'num', kind: 'numerical',
    prompt: 'A $9,000 campaign is shown 1,500,000 times, has a click-through rate of 0.8% and converts 2.5% of clicks into orders. What is the CPA?',
    answer: 30, check: () => 9000 / (1500000 * 0.008 * 0.025), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 0.75, say: 'That is the cost per click (9,000 ÷ 12,000). CPA divides by orders: 12,000 × 2.5% = 300.' }, { value: 0.24, say: 'You applied the 2.5% conversion rate to impressions instead of clicks. Clicks = 1,500,000 × 0.008 = 12,000; orders = 12,000 × 0.025 = 300.' }],
    solution: 'Clicks = 1,500,000 × 0.008 = 12,000. Orders = 12,000 × 0.025 = 300. CPA = 9,000 ÷ 300 = $30.',
  },
  {
    id: 'm02-m4-4', lesson: M, type: 'num', kind: 'numerical',
    prompt: 'A campaign costs $7,500 and its platform attributes $33,000 of revenue to it. What is the ROAS?',
    answer: 4.4, check: () => 33000 / 7500, unit: '', places: 2, tol: 0.01,
    wrong: [{ value: 0.23, say: 'Invert it: ROAS is revenue ÷ spend.' }, { value: 3.4, say: 'ROAS is revenue ÷ spend, not (revenue − spend) ÷ spend.' }],
    solution: 'ROAS = 33,000 ÷ 7,500 = 4.4.',
  },
  {
    id: 'm02-m4-5', lesson: M, type: 'num', kind: 'applied',
    prompt: 'For the same campaign ($7,500 spend, $33,000 attributed revenue), the business keeps 25% of revenue as contribution, and a holdout test shows that 70% of the attributed sales were incremental. What is the marketing ROI, as a percentage?',
    answer: -23, check: () => (33000 * 0.25 * 0.70 - 7500) / 7500 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 10, say: 'That assumes every attributed sale was incremental: (8,250 − 7,500) ÷ 7,500. The holdout says only 70% were.' },
      { value: 340, say: 'That uses revenue as if it were profit. Use incremental contribution.' },
    ],
    solution: 'Incremental contribution = 33,000 × 0.25 × 0.70 = $5,775. ROI = (5,775 − 7,500) ÷ 7,500 = −23%. A ROAS of 4.4 hides a loss: the break-even ROAS at a 25% margin is 4.0 even before incrementality.',
  },
  {
    id: 'm02-m4-6', lesson: P, type: 'num', kind: 'numerical',
    prompt: 'A fictional university forecasts $2,750,000 of revenue from a new programme and sets its promotion budget at 6% of forecast revenue. What is the budget?',
    answer: 165000, check: () => 0.06 * 2750000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 16500, say: 'Check the decimal: 6% is 0.06.' }],
    solution: 'Budget = 0.06 × 2,750,000 = $165,000.',
  },
  {
    id: 'm02-m4-7', lesson: P, type: 'num', kind: 'applied',
    prompt: 'Lantern plans a second-year push into natural grocers by objective and task (hypothetical costs): 120 demonstration days at $180 a day; 3,200,000 targeted ad impressions at $7.50 per thousand; and six shelf-display placements at $2,500 each. What is the budget?',
    answer: 60600, check: () => 120 * 180 + 3200000 / 1000 * 7.5 + 6 * 2500, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 24036600, say: 'The $7.50 is per thousand impressions: 3,200,000 ÷ 1,000 × 7.50 = $24,000.' }, { value: 48100, say: 'There are six display placements: 6 × $2,500 = $15,000.' }],
    solution: 'Demonstrations 120 × 180 = $21,600; ads 3,200,000 ÷ 1,000 × 7.50 = $24,000; displays 6 × 2,500 = $15,000. Total = $60,600.',
  },
  {
    id: 'm02-m4-8', lesson: P, type: 'classify', kind: 'conceptual',
    prompt: 'Classify each activity as push or pull.',
    items: [
      'A drinks brand gives distributors a bonus for every case placed in new stores.',
      'A drinks brand runs video ads showing where to buy its new can.',
      'A software firm’s salespeople train resellers to demonstrate the product.',
      'A clothing brand emails a discount code to past customers.',
    ],
    categories: ['Push', 'Pull'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'The bonus motivates an intermediary to sell the product on: push.',
      2: 'Training resellers equips the channel to sell: push.',
    },
    solution: 'Push works on the channel (the distributor bonus, reseller training); pull works on final customers (the video ads, the email to customers).',
  },
  {
    id: 'm02-m4-9', lesson: P, type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about AIDA and other hierarchy-of-effects models is best supported?',
    options: [
      'They help set stage-by-stage objectives, but the evidence doesn’t support a fixed order of stages.',
      'They have been shown by research to describe the order in which every buyer’s purchase decision happens.',
      'They apply only to personal selling, where a salesperson can lead the buyer through each stage.',
      'They show that more advertising always leads to more sales, because each stage feeds the next.',
    ],
    answer: 0,
    feedback: {
      1: 'A major review of the evidence (Vakratsas and Ambler, 1999) found little support for a fixed order of effects.',
      2: 'AIDA came from selling, but hierarchy models are used for advertising and campaigns in general.',
      3: 'The models describe stages, not the size of advertising’s effect; they say nothing about more spending always paying.',
    },
    solution: 'Hierarchy models are checklists for planning objectives, not laws of behaviour; buyers can skip or reverse stages, especially for cheap, low-risk products.',
  },
  {
    id: 'm02-m4-10', lesson: M, type: 'mc', kind: 'applied',
    prompt: 'Lantern wants to know whether its emails to online-shop customers actually increase orders. Which design measures this best?',
    options: [
      'Randomly hold out a share of customers from each email and compare their orders with those who got it.',
      'Count the orders placed within a week of each email and credit them all to the email.',
      'Compare customers who open emails with those who don’t, and treat the difference as the email’s effect.',
      'Compare orders in the month after the email programme started with the month before.',
    ],
    answer: 0,
    feedback: {
      1: 'Many of those orders would have happened anyway: loyal customers order regularly whether or not they get an email.',
      2: 'People who open emails are already more engaged, so they would order more even without the email: a selection problem.',
      3: 'Seasonality and other changes can move orders between months; a before-and-after comparison can’t separate them from the email’s effect.',
    },
    solution: 'A random holdout makes the two groups alike on average, so the difference in orders is the email’s incremental effect.',
  },
  {
    id: 'm02-m4-11', lesson: P, type: 'mc', kind: 'applied',
    prompt: 'Lantern’s ads present the single-origin can as a café-quality treat at $3.49, but its trade budget funds “2 for $5” deals in supermarkets every other week. What principle does this break, and what should Lantern do?',
    options: [
      'Integrated marketing communications: the deals say “cheap” and contradict the ads; keep them to a few planned windows.',
      'Competitive parity: Lantern should match Daily Grind’s $2.29 shelf price so that the frequent deals are no longer needed.',
      'Push strategy: Lantern should stop all trade promotions at once and rely on consumer advertising alone.',
      'AIDA: the deals skip the desire stage, so Lantern should advertise more heavily to build desire before each deal.',
    ],
    answer: 0,
    feedback: {
      1: 'Competitive parity is a budgeting method, and matching a value brand’s price would abandon the positioning.',
      2: 'A new brand still needs push to win and keep shelf space; the problem is the frequency and depth of the deals, not their existence.',
      3: 'More advertising wouldn’t fix a contradiction between the ads and the shelf price.',
    },
    solution: 'IMC requires every touchpoint to support one positioning. Frequent deep deals teach shoppers that the real price is the deal price; a few planned windows keep trade support without contradicting the brand.',
  },
  {
    id: 'm02-m4-12', lesson: M, type: 'mc', kind: 'conceptual',
    prompt: 'Why does last-click attribution tend to overstate the value of brand-name search ads?',
    options: [
      'It credits the final click, but brand searchers have usually been persuaded already, and many would have used the free listing.',
      'Search ads are counted twice by every analytics tool, once as a click and once as an order.',
      'Last-click gives all the credit to the first ad a customer saw, which is usually the brand search ad.',
      'Brand-name searches never lead to purchases, so any sales credited to them must be counting errors.',
    ],
    answer: 0,
    feedback: {
      1: 'The problem isn’t double counting; it is giving one touchpoint credit for demand other activity created.',
      2: 'That describes first-click attribution.',
      3: 'Brand searches often lead to purchases; the question is whether the ad caused them.',
    },
    solution: 'Last-click credits whatever touched the customer last. Brand searchers are near the end of their decision, so the search ad collects credit for sales it often didn’t cause; field experiments at eBay found brand-keyword ads had no measurable short-term benefit.',
  },
];
