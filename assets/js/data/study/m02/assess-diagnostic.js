// assess-diagnostic.js — M02 The 4Ps Marketing Mix: course diagnostic. Two or three items per module, no hints;
// solutions are shown when the student reviews it. `route` suggests where to start: if the student scores at least
// 80% on the items for every module before module n, start at module n.
// Lantern figures come from ./market.js (fictional). Every other business and figure is fictional too.
// Every num item's check recomputes its answer.
export const items = [
  // ---------------------------------------------------------------- module 1: the mix and the product
  {
    id: 'm02-dg-1', lesson: 'marketing-mix', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery positions its sourdough as an artisan loaf, baked slowly by hand, at $7.50. To grow quickly it starts selling through discount supermarkets, where the loaf is on a “half price” deal every other week. What is wrong with this mix?',
    options: [
      'Place and promotion contradict the product and price: discount outlets and constant half-price deals tell shoppers the loaf is ordinary, so the artisan positioning stops being believable.',
      'Nothing: more outlets and more deals always mean more customer value.',
      'Only the price is wrong: an artisan loaf should cost less than $7.50 to sell in supermarkets.',
      'The product is wrong: a slowly baked loaf can’t be sold through any retailer.',
    ],
    answer: 0,
    feedback: {
      1: 'More availability and lower prices can raise value for some shoppers, but the mix has to fit the positioning. A loaf that is half price every other week teaches shoppers that $7.50 isn’t its real price.',
      2: 'Cutting the price would make the contradiction worse: the problem is that place and promotion send a “bargain” message about a premium product.',
      3: 'Artisan products are sold through retailers all the time; the question is which retailers and how they are promoted there.',
    },
    solution: 'Judge each P against the positioning and against the others. Hand-baked sourdough at $7.50 says premium; discount supermarkets and frequent half-price deals say bargain. A consistent mix would use bakeries, delicatessens or selected grocers and promote the craft (tastings, the baking story), with few or no deep deals.',
  },
  {
    id: 'm02-dg-2', lesson: 'product-decisions', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional company installs battery-storage systems for warehouses. Classify each part of its offer by product level.',
    items: [
      'Lower and more predictable electricity bills for the warehouse',
      'The battery modules, their control system and the company’s brand',
      'Installation by the company’s own engineers',
      'Remote monitoring and a ten-year performance warranty',
    ],
    categories: ['Core benefit', 'Actual product', 'Augmented product'],
    answer: [0, 1, 2, 2],
    feedback: {
      0: 'This is what the warehouse is really buying: the need the system satisfies, not the hardware.',
      1: 'The physical system, its features and its brand deliver the core benefit: they are the actual product.',
      2: 'Installation is a service added around the system: part of the augmented product.',
    },
    solution: 'Core benefit: lower, more predictable energy costs. Actual product: the batteries, the control system and the brand. Augmented product: installation, monitoring and the warranty. In business markets the augmented level often wins the contract.',
  },
  {
    id: 'm02-dg-3', lesson: 'product-life-cycle', type: 'num', kind: 'numerical',
    prompt: 'A hypothetical product category sold 3,600,000 units last year and 3,780,000 this year. What was its year-on-year growth rate, as a percentage?',
    answer: 5, check: () => (3780000 - 3600000) / 3600000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 4.76, say: 'You divided by this year’s sales. Growth is measured against the earlier year: 180,000 ÷ 3,600,000.' },
      { value: 180000, say: 'That is the change in units. Divide it by last year’s sales to get a growth rate.' },
    ],
    solution: 'Growth = (3,780,000 − 3,600,000) ÷ 3,600,000 × 100 = 180,000 ÷ 3,600,000 × 100 = 5.0%. Growth this low, if it persists, is a sign of maturity.',
  },
  // ---------------------------------------------------------------- module 2: price
  {
    id: 'm02-dg-4', lesson: 'pricing-approaches', type: 'num', kind: 'numerical',
    prompt: 'A fictional wholesaler of hotel linen prices every item with an 80% markup on cost. What margin on price does that give? Give a percentage to one decimal place.',
    answer: 44.4, check: () => 0.8 / (1 + 0.8) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 80, say: 'That is the markup, a percentage of cost. The margin divides the same profit by the price: 0.8 ÷ 1.8.' },
      { value: 55.6, say: '55.6% is the cost’s share of the price (1 ÷ 1.8). The margin is the profit’s share.' },
    ],
    solution: 'Margin = markup ÷ (1 + markup) = 0.8 ÷ 1.8 ≈ 44.4%. Check with a $100 cost: price $180, profit $80, margin 80 ÷ 180 ≈ 44.4%.',
  },
  {
    id: 'm02-dg-5', lesson: 'pricing-approaches', type: 'num', kind: 'applied',
    prompt: 'A fictional yoga studio sells single-class passes for $18. Each class attended costs it $3 in variable costs (towels, cleaning, card fees). Its fixed costs are $9,600 a month. How many passes must it sell each month to break even?',
    answer: 640, check: () => 9600 / (18 - 3), unit: 'passes', places: 0, tol: 0.5,
    wrong: [
      { value: 533, say: 'You divided by the price. Each pass contributes only $18 − $3 = $15 towards fixed costs.' },
      { value: 3200, say: 'You divided by the variable cost. Break-even divides fixed costs by the contribution per unit.' },
    ],
    solution: 'Contribution per pass = 18 − 3 = $15. Break-even = 9,600 ÷ 15 = 640 passes a month.',
  },
  {
    id: 'm02-dg-6', lesson: 'price-response', type: 'mc', kind: 'conceptual',
    prompt: 'Demand for a product has a price elasticity of −1.8. The seller cuts the price by 5%. What happens to revenue?',
    options: [
      'It rises: quantity rises by about 9%, more than enough to offset the 5% lower price.',
      'It falls: every unit now sells for 5% less.',
      'It stays the same, because the price and quantity changes cancel out.',
      'It can’t be predicted without knowing the variable cost.',
    ],
    answer: 0,
    feedback: {
      1: 'Each unit earns 5% less, but about 1.8 × 5% = 9% more units are sold. With elastic demand the quantity effect wins.',
      2: 'The changes cancel only at unit elasticity (−1). Here the magnitude is 1.8.',
      3: 'Revenue depends only on price and quantity. Variable cost matters for contribution and profit, not for revenue.',
    },
    solution: 'Elastic demand (magnitude above 1): quantity changes by a larger percentage than price, so a cut raises revenue. Roughly, revenue becomes 0.95 × 1.09 ≈ 1.04 of what it was. Whether profit rises is a separate question that needs the contribution margin.',
  },
  // ---------------------------------------------------------------- module 3: place
  {
    id: 'm02-dg-7', lesson: 'distribution-channels', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern sold its single-origin can (cost of goods $0.74) at $3.29 in supermarkets, where the distributor and the store together keep 32% of the shelf price. What would Lantern’s gross margin per can be? Give it to the cent.',
    answer: 1.50, check: () => 3.29 * (1 - 0.32) - 0.74, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 2.24, say: 'That is Lantern’s net price (3.29 × 0.68). Subtract the $0.74 cost of goods to get the gross margin.' },
      { value: 2.55, say: 'You subtracted the cost from the shelf price. Lantern receives only 68% of the shelf price.' },
      { value: 0.31, say: 'You subtracted the trade’s share and the cost from the trade’s share. Lantern keeps 3.29 × 0.68 = $2.24 before the cost of goods.' },
    ],
    solution: 'Net price = 3.29 × (1 − 0.32) = $2.2372. Gross margin = 2.2372 − 0.74 = $1.4972 ≈ $1.50 a can.',
  },
  {
    id: 'm02-dg-8', lesson: 'distribution-channels', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional luxury watchmaker sells watches at about $9,000 each. Which distribution intensity fits it best?',
    options: [
      'Exclusive: one or a very few carefully chosen jewellers in each city.',
      'Intensive: every department store, pharmacy and petrol station that will stock it.',
      'Selective at first, then intensive as soon as sales grow.',
      'Intensive online and exclusive in shops, so that the price differs by channel.',
    ],
    answer: 0,
    feedback: {
      1: 'Intensive distribution suits products people buy on impulse or habit. Buyers of a $9,000 watch will make an effort to find it, and wide availability would weaken its prestige.',
      2: 'Widening to intensive distribution would undo the scarcity and expert service that support the price.',
      3: 'Different prices by channel invite channel conflict; and selling everywhere online contradicts the exclusive image.',
    },
    solution: 'A specialty product with a premium image suits exclusive distribution: scarcity and expert service support the price, and each outlet invests in the brand because no nearby rival sells it.',
  },
  // ---------------------------------------------------------------- module 4: promotion and the whole mix
  {
    id: 'm02-dg-9', lesson: 'promotion-mix', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional university is recruiting students for a new degree. Which promotion tool is each activity?',
    items: [
      'Video ads on a streaming service, paid for by the university',
      'An admissions officer meets each shortlisted applicant on a video call',
      'A newspaper writes about the degree after a launch event for local employers',
      'A $500 fee discount for applications received before 31 January',
      'Personalised emails to people who downloaded the prospectus, inviting them to apply',
    ],
    categories: ['Advertising', 'Sales promotion', 'Personal selling', 'Public relations', 'Direct and digital marketing'],
    answer: [0, 2, 3, 1, 4],
    feedback: {
      2: 'The university doesn’t pay for the article: earned coverage from an event is public relations.',
      3: 'A short-term incentive to act now is a sales promotion.',
      4: 'Targeted messages to known individuals that invite a response are direct marketing.',
    },
    solution: 'Paid media ads: advertising. A person-to-person conversation aimed at a decision: personal selling. Earned newspaper coverage: public relations. An early-application discount: sales promotion. Targeted emails inviting a response: direct and digital marketing.',
  },
  {
    id: 'm02-dg-10', lesson: 'measuring-the-mix', type: 'num', kind: 'applied',
    prompt: 'A fictional online retailer keeps 40% of each sale as contribution after the cost of the goods, payment fees and delivery. If every attributed sale is incremental, what ROAS does a campaign need to break even?',
    answer: 2.5, check: () => 1 / 0.40, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 1, say: 'A ROAS of 1 returns the spend in revenue, but only 40% of that revenue is contribution, so the campaign would lose 60% of its cost.' },
      { value: 0.4, say: 'Break-even ROAS is the reciprocal of the contribution margin ratio: 1 ÷ 0.40.' },
    ],
    solution: 'Break-even ROAS = 1 ÷ contribution margin ratio = 1 ÷ 0.40 = 2.5. Each $1 of ads must bring $2.50 of revenue, which leaves $1 of contribution to cover the $1 spent.',
  },
  {
    id: 'm02-dg-11', lesson: 'measuring-the-mix', type: 'mc', kind: 'conceptual',
    prompt: 'A campaign report says “ROAS 3.0”. What does that tell you?',
    options: [
      '$3 of revenue was attributed to the campaign for every $1 spent; it doesn’t say whether the campaign made a profit or caused those sales.',
      'The campaign returned three times its cost in profit.',
      'The campaign’s return on investment was 300%.',
      'The campaign caused $3 of extra sales for every $1 spent.',
    ],
    answer: 0,
    feedback: {
      1: 'ROAS divides revenue, not profit, by spend. Profit depends on the margin left on that revenue.',
      2: 'ROI compares the contribution added, minus the cost, with the cost. A ROAS of 3 can go with a negative ROI if margins are thin.',
      3: 'Attributed revenue is not necessarily incremental: some of it would have happened anyway. Only a holdout or experiment measures what the campaign caused.',
    },
    solution: 'ROAS = attributed revenue ÷ ad spend. It ignores costs and attribution bias. Marketing ROI = (incremental contribution − marketing cost) ÷ marketing cost, which needs the margin and an estimate of how many sales were incremental.',
  },
];

// If the student scores at least 80% on the items for the modules before module n, suggest starting at module n.
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.8 },
  { module: 4, ifAtLeast: 0.8 },
];
