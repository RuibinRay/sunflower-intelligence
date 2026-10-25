// assess-m1.js — M02 module 1 test: The mix and the product (marketing-mix, product-decisions, product-life-cycle).
// No hints; solutions are shown when the student reviews the test. Lantern figures come from m02/market.js (fictional);
// every number is recomputed by `check`.

export const items = [
  {
    id: 'm02-m1-1', lesson: 'marketing-mix', type: 'mc', kind: 'conceptual',
    prompt: 'A friend says, “Marketing is just advertising.” Which reply is most accurate?',
    options: [
      'Advertising is one promotion tool; marketing also chooses the customers, the product, the price and where it is sold.',
      'That is right: marketing is the department that buys advertising, and everything else belongs to sales or operations.',
      'Marketing is selling: persuading people to buy whatever the company has already decided to make.',
      'Marketing is market research, finding out what customers think and want; advertising is a separate function run by agencies.',
    ],
    answer: 0,
    feedback: {
      1: 'Advertising is only part of one P. A business with excellent advertising and the wrong product, price or availability still fails.',
      2: 'Selling what has already been made starts from the company, not the customer. Marketing begins with what customers need and designs the offer around it.',
      3: 'Research informs marketing decisions, but marketing is the decisions themselves: product, price, place and promotion.',
    },
    solution: 'Marketing creates, communicates, delivers and exchanges offerings that have value for customers, clients, partners and society (the AMA’s definition). Advertising is one way of communicating, within promotion; product, price and place are equally part of marketing.',
  },
  {
    id: 'm02-m1-2', lesson: 'marketing-mix', type: 'classify', kind: 'conceptual',
    prompt: 'An online retailer of outdoor gear (fictional) makes these decisions. Classify each one as product, price, place or promotion.',
    items: [
      'Offering free returns within 60 days',
      'Opening a pick-up point in a city-centre outdoor shop',
      'Charging a $5 delivery fee on orders under $50',
      'Sending a monthly email with trail guides and new arrivals',
      'Adding a range of children’s hiking boots',
    ],
    categories: ['Product', 'Price', 'Place', 'Promotion'],
    answer: [0, 2, 1, 3, 0],
    feedback: {
      0: 'Free returns are part of what the customer gets: they remove the risk of buying boots that don’t fit. That makes them product (an augmentation).',
      2: 'The delivery fee is part of what the customer pays and the terms of payment: price.',
    },
    solution: 'Product: free returns and the children’s boots. Price: the delivery fee. Place: the pick-up point. Promotion: the monthly email.',
  },
  {
    id: 'm02-m1-3', lesson: 'marketing-mix', type: 'num', kind: 'numerical',
    prompt: 'Lantern considers selling the Classic blend ($0.58 a can) in convenience stores at $2.99 a can. The distributor and retailer together keep 40% of the shelf price. What is Lantern’s gross margin per can?',
    answer: 1.21, check: () => 2.99 * (1 - 0.40) - 0.58, tol: 0.01, unit: '$', places: 2,
    wrong: [
      { value: 1.79, say: 'That is what Lantern receives from the trade ($2.99 × 0.60). Subtract the $0.58 cost of the can and its contents.' },
      { value: 2.41, say: 'You subtracted the cost from the shelf price, but the trade keeps 40% of it. Start from the 60% Lantern receives.' },
      { value: 0.62, say: 'You treated the trade’s 40% as Lantern’s share. Lantern receives 60% of the shelf price.' },
    ],
    solution: 'Lantern receives $2.99 × (1 − 0.40) = $1.794 a can. Gross margin = $1.794 − $0.58 = $1.214, about $1.21 a can.',
  },
  {
    id: 'm02-m1-4', lesson: 'marketing-mix', type: 'mc', kind: 'applied',
    prompt: 'A plan positions Lantern Cold Brew as café-quality cold brew close to the premium brand’s price. It uses the Organic single-origin liquid at $3.59 in natural grocers and supermarkets with in-store sampling, but puts half the promotion budget into deep, frequent trade promotions that cut the shelf price to about $2.70. Which change would do most to make the mix consistent?',
    options: [
      'Move most of the trade-promotion money into sampling and PR, keeping occasional promotions only.',
      'Switch to the Classic blend to cut the cost of goods, so the deep promotions cost less per can.',
      'Add convenience stores to reach more commuters, who compare prices less than supermarket shoppers do.',
      'Raise the regular shelf price to $4.29 so that the promotions look deeper and the can seems more premium.',
    ],
    answer: 0,
    feedback: {
      1: 'A cheaper liquid would make the product contradict the premium positioning as well; it fixes the margin, not the mixed message.',
      2: 'A new channel doesn’t resolve the conflict between a premium positioning and constant discounting; it adds the most price-hungry trade margin (40%).',
      3: 'A higher list price with frequent deep cuts makes the inconsistency worse: shoppers learn to wait for the deal, and the regular price loses credibility.',
    },
    solution: 'The product, the regular price and the channels say premium; frequent deep price cuts say value and teach shoppers that $3.59 is not the real price. Shifting the money to sampling and PR supports the positioning by letting people taste the difference, which is the reason to pay a premium.',
  },
  {
    id: 'm02-m1-5', lesson: 'product-decisions', type: 'num', kind: 'numerical',
    prompt: 'From the market file: the Classic blend costs $0.58 a can and the Organic single-origin $0.88 a can. If Lantern expects to sell 50,000 cans in its first year, how much more would the Organic tier cost in total than the Classic blend?',
    answer: 15000, check: () => (0.88 - 0.58) * 50000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 7000, say: 'That compares the Organic with the Single-origin ($0.74). The question compares it with the Classic blend.' },
      { value: 44000, say: 'That is the whole cost of 50,000 Organic cans. The question asks for the difference from the Classic blend.' },
    ],
    solution: 'Difference per can: $0.88 − $0.58 = $0.30. Over 50,000 cans: $0.30 × 50,000 = $15,000.',
  },
  {
    id: 'm02-m1-6', lesson: 'product-decisions', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern sells through all three retail channels: supermarkets (listing fee $9,000 per flavour per year), convenience stores ($4,000) and natural grocers ($2,000). The three-flavour range also adds $12,000 a year of production runs, labels and plates. How much extra fixed cost per year does the three-flavour range add compared with one flavour?',
    answer: 42000, check: () => (3 - 1) * (9000 + 4000 + 2000) + 12000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 30000, say: 'That is the extra listing fees only. Add the range’s own $12,000 of production costs.' },
      { value: 57000, say: 'You added the listing fees for all three flavours. Compared with one flavour, only the two extra flavours add fees.' },
      { value: 27000, say: 'You charged the listing fee once per channel. Listing fees are charged for every flavour in every channel.' },
    ],
    solution: 'Listing fees per flavour across the three channels: $9,000 + $4,000 + $2,000 = $15,000. Two extra flavours: 2 × $15,000 = $30,000. Add the range cost: $30,000 + $12,000 = $42,000 a year.',
  },
  {
    id: 'm02-m1-7', lesson: 'product-decisions', type: 'classify', kind: 'conceptual',
    prompt: 'An airline (fictional) sells a premium economy seat to business travellers. Classify each part of the offer by product level.',
    items: [
      'Arriving at a meeting rested and able to work',
      'A wider seat with more legroom and a power socket',
      'Free changes to the ticket date',
      'Access to the airline’s lounge before departure',
      'The airline’s name and its safety and punctuality record',
    ],
    categories: ['Core benefit', 'Actual product', 'Augmented product'],
    answer: [0, 1, 2, 2, 1],
    feedback: {
      2: 'Free date changes don’t alter the flight itself; they reduce the risk of buying. That is an augmentation.',
      3: 'The lounge is a service added around the flight: augmented product.',
      4: 'The brand and its record are part of the product the traveller buys: actual product.',
    },
    solution: 'Core benefit: arriving rested and able to work. Actual product: the seat and its features, and the brand. Augmented product: free date changes and lounge access.',
  },
  {
    id: 'm02-m1-8', lesson: 'product-decisions', type: 'mc', kind: 'applied',
    prompt: 'At a category review, a supermarket buyer tells Lantern that its Vanilla flavour sells far more slowly than Original and Oat Milk Latte, and asks whether to keep it. Lantern pays $9,000 a year to list it. What should Lantern’s product manager do first?',
    options: [
      'Check how many of Vanilla’s sales are extra, not taken from other flavours, and whether their margin covers its listing fee.',
      'Insist on keeping it, because a longer line always brings more sales and shows the buyer that Lantern is committed to the category.',
      'Drop Original instead, because it is the most ordinary flavour and the buyer already stocks plain rivals.',
      'Cut Vanilla’s price, because a flavour that sells slowly must be overpriced compared with the other two.',
    ],
    answer: 0,
    feedback: {
      1: 'A longer line adds costs and can cannibalise. Each item has to earn its place, and the retailer will judge each one separately.',
      2: 'Original is the best seller. Dropping it to protect a slow flavour cuts the line’s strongest item.',
      3: 'A price cut may not be the cause or the cure, and it lowers the margin on every can. First find out whether the flavour pays its way.',
    },
    solution: 'Line-length decisions depend on each item’s incremental contribution. Lantern should estimate the extra cans Vanilla brings (net of cannibalisation), multiply by the gross margin per can, and compare with its $9,000 listing fee and its share of production costs. If it doesn’t pay, shortening the line may raise profit.',
  },
  {
    id: 'm02-m1-9', lesson: 'product-life-cycle', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement correctly distinguishes a fad from a fashion?',
    options: [
      'A fad rises and collapses quickly with intense short-lived enthusiasm; a fashion is a popular style that typically rises, lasts a while and declines slowly.',
      'A fad lasts for generations; a fashion lasts one season.',
      'Fads apply only to toys; fashions apply only to clothing.',
      'A fad is a basic mode of expression such as casual or formal dress.',
    ],
    answer: 0,
    feedback: {
      1: 'You have reversed them, and lasting for generations describes a style.',
      2: 'Fads and fashions occur in many categories, including food and drink, technology and entertainment.',
      3: 'A basic, lasting mode of expression is a style.',
    },
    solution: 'Style: a basic, lasting mode of expression. Fashion: a currently popular style, rising and declining slowly. Fad: a quick rise and quick collapse. Repeat purchase is the best evidence that a fast-growing product is more than a fad.',
  },
  {
    id: 'm02-m1-10', lesson: 'product-life-cycle', type: 'num', kind: 'numerical',
    prompt: 'A hypothetical brand sold 136,000 cans in the fourth quarter of this year. Harbour City’s fourth-quarter seasonal index is 0.85. Last year’s fourth quarter, seasonally adjusted, was 150,000 cans. By what percentage did seasonally adjusted fourth-quarter sales change?',
    answer: 6.67, check: () => (136000 / 0.85 - 150000) / 150000 * 100, tol: 0.05, unit: '%', places: 2,
    wrong: [
      { value: -9.33, say: 'You compared actual sales (136,000) with adjusted sales (150,000). Adjust this year’s quarter first: 136,000 ÷ 0.85.' },
      { value: -22.93, say: 'You multiplied by the index instead of dividing. Seasonally adjusted sales = actual ÷ index.' },
    ],
    solution: 'Adjusted sales this year: 136,000 ÷ 0.85 = 160,000 cans. Change: (160,000 − 150,000) ÷ 150,000 × 100 ≈ +6.67%.',
  },
  {
    id: 'm02-m1-11', lesson: 'product-life-cycle', type: 'mc', kind: 'applied',
    prompt: 'A brand manager (fictional company) says: “Our snack brand is 30 years old and sales have been flat for five years. The product life cycle says decline comes next, so let’s cut its advertising to zero and use the money elsewhere.” What is the best response?',
    options: [
      'Flat sales mean maturity, not certain decline; cutting support could cause it, so first test changes to market, product or mix.',
      'Agree: every product follows the life cycle and maturity is always followed by decline, so advertising a 30-year-old brand is wasted.',
      'Double the advertising budget immediately, because spending always reverses flat sales in a mature brand.',
      'Withdraw the brand now, before decline starts, to save the cost of the decline stage and free its shelf space for newer products.',
    ],
    answer: 0,
    feedback: {
      1: 'The life cycle is a pattern, not a law. Mature brands can stay mature for decades, and cutting support can make a brand decline that would otherwise have held its sales.',
      2: 'Spending more without evidence is as unjustified as cutting to zero. Test which extensions pay before committing.',
      3: 'A flat, established brand may be highly profitable. Withdrawing it on a forecast drawn from a chart throws that profit away.',
    },
    solution: 'Dhalla and Yuspeh warned that treating the life cycle as destiny leads to costly mistakes: sales depend partly on the firm’s own decisions. The manager should treat maturity as a hypothesis, check the evidence, and evaluate extensions (new users or uses, product changes, new channels or packs) on their own costs and returns.',
  },
];
