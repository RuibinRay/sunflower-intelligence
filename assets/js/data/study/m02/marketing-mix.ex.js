// marketing-mix.ex.js — M02 · The marketing mix and customer value: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern figures come from m02/market.js (fictional); every number is
// recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'mix-sandbox': {
    type: 'mixsim',
    lock: {},
    show: ['units', 'contribution', 'satisfaction'],
    note: 'Change one decision at a time and put it back before trying the next, so you can tell which change caused which effect. These are simulated results from a teaching model, not forecasts.',
  },
};

const PS = ['Product', 'Price', 'Place', 'Promotion'];

export const guided = [
  {
    id: 'm02-mm-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Ana’s team adds six more decisions to Lantern’s launch plan. Classify each one as a product, price, place or promotion decision.',
    items: [
      'Choosing the Organic single-origin liquid',
      'Paying a $2,000 yearly listing fee to be stocked in natural grocers',
      'Setting the price at $3.29 a can',
      'Running tastings in supermarkets on Saturdays',
      'Refunding anyone who doesn’t like their first can',
      'Selling chilled single cans in Lantern’s own cafés',
    ],
    categories: PS,
    answer: [0, 2, 1, 3, 0, 2],
    hints: [
      'Ask what each decision changes: what the customer gets, what the customer pays, where the customer can get it, or what the customer hears about it.',
      'A listing fee is what Lantern pays to get onto a shop’s shelf. A refund promise changes what the customer gets when they buy.',
    ],
    feedback: {
      1: 'The fee is money Lantern pays the trade, not a price the customer pays. It buys a place on the shelf, so it is a place decision.',
      4: 'A guarantee is part of what the customer gets with the can: it takes away the risk of a disappointing first purchase. It is a product decision, even though promotion will mention it.',
      5: 'This decides where customers can buy the can, so it is place. The price charged in the cafés would be a separate price decision.',
    },
    solution: 'Product: the Organic liquid and the refund promise (both change what the customer gets). Price: $3.29 a can. Place: the natural-grocer listing fee and selling in the cafés (both decide where the can is available). Promotion: the Saturday tastings (communication that persuades people to try the can).',
  },
  {
    id: 'm02-mm-g2', type: 'steps', kind: 'numerical',
    prompt: 'At the default price of $3.49 a can, how much does Lantern keep from each can of the Single-origin liquid in different channels? (Market file: the liquid costs $0.74 a can to make and deliver to the distributor.)',
    solution: 'Supermarkets: Lantern receives 3.49 × (1 − 0.32) = 3.49 × 0.68 = $2.37, and keeps 2.37 − 0.74 = $1.63 after the cost of the can. Own cafés and online shop: 3.49 − 0.45 = $3.04 received, and 3.04 − 0.74 = $2.30 kept. The same shelf price earns Lantern about 41% more per can in its own channel (2.30 ÷ 1.63 ≈ 1.41), but that channel reaches only Lantern’s own customers, about 10% of the category’s cans.',
    steps: [
      { id: 'm02-mm-g2-s1', type: 'num',
        prompt: 'In supermarkets the distributor and retailer together keep 32% of the shelf price. How much of the $3.49 does Lantern receive per can?',
        answer: 2.37, check: () => 3.49 * (1 - 0.32), tol: 0.01, unit: '$', places: 2,
        hints: ['Lantern receives the part of the price the trade doesn’t keep: 100% − 32% = 68%.', 'Multiply $3.49 by 0.68.'],
        wrong: [
          { value: 1.12, say: 'That is the trade’s 32% share. Lantern receives the other 68%.' },
          { value: 3.17, say: 'The 32% is a share of the price, not 32 cents. Multiply $3.49 by 0.68.' },
        ] },
      { id: 'm02-mm-g2-s2', type: 'num',
        prompt: 'What is Lantern’s gross margin per can in supermarkets, after the $0.74 cost of the can and its contents?',
        answer: 1.63, check: () => 3.49 * 0.68 - 0.74, tol: 0.01, unit: '$', places: 2,
        hints: ['Start from what Lantern receives, not from the shelf price.', 'Subtract $0.74 from the $2.37 you found in step 1.'],
        wrong: [{ value: 2.75, say: 'You subtracted the cost from the shelf price, but Lantern never receives the trade’s 32%. Start from the $2.37 it does receive.' }] },
      { id: 'm02-mm-g2-s3', type: 'num',
        prompt: 'In Lantern’s own cafés and online shop there is no trade margin, but packing and delivery cost $0.45 a can. What is the gross margin per can there?',
        answer: 2.30, check: () => 3.49 - 0.45 - 0.74, tol: 0.01, unit: '$', places: 2,
        hints: ['Lantern keeps the whole $3.49, then pays for packing and delivery and for the can itself.', '3.49 − 0.45 − 0.74.'],
        wrong: [
          { value: 3.04, say: 'That is what Lantern receives after packing and delivery. Subtract the $0.74 cost of the can as well.' },
          { value: 2.75, say: 'You left out the $0.45 of packing and delivery, which Lantern pays only in its own channel.' },
        ] },
    ],
  },
  {
    id: 'm02-mm-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A commuter usually buys a $5.20 cold brew at a café two streets from her station (a hypothetical price). Lantern puts chilled cans in the station’s convenience store at $3.49. How could this raise customer value for her?',
    options: [
      'It lowers both the money and the time she gives up, so it raises value if she judges the can’s taste close enough to the café’s.',
      'It raises value because $3.49 is less than $5.20; nothing else matters.',
      'It can’t raise value, because a can is a lower-quality product than a café drink.',
      'It raises value only if Lantern also advertises at the station.',
    ],
    answer: 0,
    hints: ['Customer value compares benefits with total cost: money, time, effort and risk.', 'What does she give up at the café that she doesn’t give up at the station, and what might she lose in benefits?'],
    feedback: {
      1: 'Price is only one cost, and benefits count too. If she thinks the can tastes much worse, the $1.71 saving may not make up for it.',
      2: 'Value is her judgement, relative to the alternatives. Many people would accept a slightly different taste in exchange for saving time and money.',
      3: 'Advertising may tell her the cans exist, but it doesn’t change the benefits and costs she weighs once she knows about them.',
    },
    why: 'Customer value is benefits relative to total cost, as the customer sees them, compared with the alternatives.',
    solution: 'The station can saves her $5.20 − $3.49 = $1.71 and the detour (time and effort). Whether that raises value depends on whether she judges its benefits (taste, coldness, convenience) close enough to the café’s. Price is only one of the costs, and the benefits are hers to judge.',
  },
  {
    id: 'm02-mm-g4', type: 'short', kind: 'applied',
    prompt: 'Fernwood Outfitters (fictional) makes hand-finished wool coats positioned as heirloom quality: “a coat for twenty years”. Rival heirloom coats sell for $300 to $450. Fernwood’s new plan keeps the hand-finishing but sells through discount outlet stores at $89, promoted with “buy one, get one half price” offers on social media. Diagnose the plan: which decisions fit the positioning, which don’t, and what would you change?',
    hints: ['Start from the positioning: what does “a coat for twenty years” promise, and to whom?', 'Test each P against the positioning, then test pairs: price with product, place with price, promotion with the positioning.'],
    rubric: [
      'Identifies that the product (hand-finished, heirloom quality) fits the positioning.',
      'Explains at least two inconsistencies, for example: the $89 price signals low quality and leaves little margin to pay for hand-finishing; outlet stores and multi-buy offers signal disposable fashion.',
      'Explains why the inconsistency matters, to customers (mixed signals, distrust of the quality claim) or to the business (margin, the wrong buyers).',
      'Proposes a consistent alternative and recognises that the right one depends on the target market.',
    ],
    model: 'Only the product fits. Hand-finished wool coats built to last twenty years suit an heirloom positioning. The other three Ps contradict it. An $89 price, far below rivals’ $300 to $450, tells shoppers the coat can’t be what it claims, and it probably doesn’t cover the cost of hand-finishing. Discount outlets are where people look for bargains, not heirlooms, and “buy one, get one half price” treats the coat as something you buy two of, which is the opposite of a coat for twenty years. The target customer, who wants to buy once and well, won’t believe the promise, and bargain hunters who do buy won’t value the hand-finishing Fernwood is paying for. A consistent repair is to price in the rivals’ range, sell through the brand’s own shop, selected department stores and its website, and promote craftsmanship (how the coat is made, repair services, reviews from long-time owners). If Fernwood really wants to serve price-driven buyers, it needs a different, cheaper product for them, ideally under a different name, rather than discounting the heirloom coat.',
  },
];

export const independent = [
  {
    id: 'm02-mm-i1', type: 'classify', kind: 'applied',
    prompt: 'The four Ps apply in every industry. Classify each decision (all the businesses are hypothetical).',
    items: [
      'A hotel adds a rooftop bar for guests',
      'An airline sells seats only on its own app and website instead of through travel agents',
      'A university sets next year’s fee for its online master’s programme',
      'An online retailer sponsors a podcast its customers listen to',
      'A battery-storage installer adds a 10-year performance warranty',
      'A clothing brand opens small shops inside department stores',
    ],
    categories: PS,
    answer: [0, 2, 1, 3, 0, 2],
    feedback: {
      1: 'Selling only through its own app changes how customers get the seat, so it is place, even though it may also change the airline’s costs.',
      4: 'The warranty is part of what the customer buys: it reduces the risk of owning the system. That makes it product.',
      5: 'Shop-in-shops decide where customers can find and buy the clothes: place.',
    },
    solution: 'Product: the rooftop bar and the warranty (both change what the customer gets). Price: the programme fee. Place: the airline’s own app and website, and the shop-in-shops (both change where and how customers buy). Promotion: the podcast sponsorship.',
  },
  {
    id: 'm02-mm-i2', type: 'mc', kind: 'applied',
    prompt: 'Suppose Lantern chose a value positioning instead: “good cold brew at an everyday price”. Using the market file’s options, which plan is the most internally consistent with it?',
    options: [
      'Classic blend at $2.59, sold in supermarkets and convenience stores, supported by trade promotions and displays.',
      'Organic single-origin at $2.59, sold only in natural and specialty grocers, supported by PR and events.',
      'Classic blend at $3.79, sold only in Lantern’s cafés, supported by social ads about the coffee’s origin.',
      'Single-origin at $2.29, sold only in convenience stores, with no promotion budget.',
    ],
    answer: 0,
    feedback: {
      1: 'The Organic liquid costs $0.88 a can, the most of any tier, and natural-grocer shoppers are the ones most willing to pay for quality and provenance. A $2.59 price throws away the premium they would pay and leaves a thin margin.',
      2: '$3.79 is Summit’s premium price, but the Classic blend scores 6, the same as Arcadia at $2.89. The price claims a quality the product doesn’t have, and a cafés-only plan can’t deliver everyday availability.',
      3: 'This is the premium-liquid-at-a-value-price problem from the lesson: the liquid costs more than the value position needs, convenience stores keep 40% of the price, and with no promotion almost nobody will know the can exists.',
    },
    why: 'The cheapest liquid, a price near the mid-market, the channels where most cans are bought and promotions that make the price visible all say the same thing: good value.',
    solution: 'A value positioning needs a product cheap enough to make money at a low price (the Classic blend, $0.58 a can), a price at or below the mid-market, wide availability where volume is (supermarkets and convenience stores sell 75% of the category’s cans between them) and promotion that reinforces value (trade promotions and displays). Plan A lines up all four.',
  },
  {
    id: 'm02-mm-i3', type: 'num', kind: 'numerical',
    prompt: 'An office worker values her time at $24 an hour. Option 1 is a $5.20 café cold brew that takes a 15-minute round trip. Option 2 is a $3.49 can from the convenience store in her building’s lobby, a 2-minute round trip. Counting money and time, how much more does option 1 cost her than option 2?',
    answer: 6.91, check: () => (5.20 + 24 * 15 / 60) - (3.49 + 24 * 2 / 60), tol: 0.01, unit: '$', places: 2,
    wrong: [
      { value: 1.71, say: 'That is only the difference in price. Time is a cost too: 15 minutes at $24 an hour is $6.00, and 2 minutes is $0.80.' },
      { value: 7.71, say: 'You counted the café’s 15 minutes but not the 2 minutes the can takes. Put a value on both.' },
    ],
    solution: 'Option 1: $5.20 + 15/60 × $24 = $5.20 + $6.00 = $11.20. Option 2: $3.49 + 2/60 × $24 = $3.49 + $0.80 = $4.29. Difference: $11.20 − $4.29 = $6.91. Whether option 1 is still better value depends on the benefits she gets from it, such as taste or a break from her desk.',
  },
  {
    id: 'm02-mm-i4', type: 'mc', kind: 'conceptual',
    prompt: 'In Lauterborn’s 4Cs, “convenience to buy” replaces which of the 4Ps, and what question does it make a marketer ask?',
    options: [
      'Place: how easy is it for the customer to get the product when and where they want it?',
      'Price: how much money can the business save by using cheaper channels?',
      'Promotion: how convenient is it for the business to reach customers with advertising?',
      'Product: how easy is the product to manufacture?',
    ],
    answer: 0,
    feedback: {
      1: 'The 4Cs look from the buyer’s side. Price becomes “cost to satisfy”: everything the customer gives up, not the business’s savings.',
      2: 'Promotion becomes “communication”, a two-way conversation. Convenience is about the customer’s ease of buying.',
      3: 'Product becomes “consumer wants and needs”. Ease of manufacture is a seller’s concern, the opposite of what the 4Cs ask.',
    },
    solution: 'Lauterborn (1990) restated each P from the buyer’s side: product → consumer wants and needs, price → cost to satisfy, place → convenience to buy, promotion → communication. Convenience to buy asks how easily the customer can get the product, not how convenient the channel is for the seller.',
  },
  {
    id: 'm02-mm-i5', type: 'multi', kind: 'applied',
    prompt: 'Ridgeway Energy Storage (fictional) designs and installs battery systems for warehouses. Which of these are typical of its marketing mix, compared with Lantern Cold Brew’s? Select all that apply.',
    options: [
      'Prices are quoted and often negotiated project by project.',
      'Several people at the customer take part in the buying decision.',
      'Personal selling and technical proposals do much of the promotion.',
      'Mass advertising to millions of shoppers is the main promotion tool.',
      'Installation, monitoring and warranties are part of what is sold.',
      'One standard product is sold at the same price to every customer.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Ridgeway has a few dozen potential customers, each buying a large, complex system. Mass advertising would mostly reach people who will never buy; personal selling reaches the few who will.',
      5: 'Each site needs a different system, so the product and the price are tailored to each project.',
    },
    solution: 'Business markets usually mean fewer, larger customers, decisions made by several people, products designed or configured for each customer with services around them, prices quoted and negotiated per deal, and promotion through personal selling and technical content. Mass advertising and one standard product at one price are typical of consumer goods like Lantern’s can.',
  },
  {
    id: 'm02-mm-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about where the 4Ps came from is accurate?',
    options: [
      'McCarthy grouped the marketing mix under four headings in 1960, simplifying the longer list of elements Borden had used.',
      'The 4Ps were shown in experiments to be the four factors that determine sales.',
      'Borden introduced the 4Ps in 1964 as a scientific law of marketing.',
      'The 4Ps were designed for services, and the 7Ps later adapted them for physical goods.',
    ],
    answer: 0,
    feedback: {
      1: 'The 4Ps are a way of organising decisions, not an empirical finding. No experiment established them.',
      2: 'Borden’s 1964 article listed twelve elements and presented the mix as a checklist to guide judgement, not as a science. The four Ps are McCarthy’s.',
      3: 'It was the other way round: the 4Ps came from manufacturers’ marketing, and Booms and Bitner added three Ps for services in 1981.',
    },
    solution: 'Culliton’s “mixer of ingredients” (1948) inspired Borden’s marketing mix, a twelve-element checklist he taught from the late 1940s and published in 1964. McCarthy’s 1960 textbook grouped the decisions into product, price, place and promotion around a target market. Booms and Bitner (1981) extended them to 7Ps for services.',
  },
];

export const check = [
  {
    id: 'm02-mm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which is the best description of customer value?',
    options: [
      'The customer’s judgement of an offer’s benefits relative to its total cost, compared with the alternatives.',
      'The price the customer pays for the product.',
      'The profit the business makes from each customer.',
      'What the product costs the business to make.',
    ],
    answer: 0,
    feedback: {
      1: 'Price is one of the costs the customer weighs, alongside time, effort and risk. Value also depends on the benefits.',
      2: 'That is value to the business. Customer value is judged from the customer’s side.',
      3: 'The customer neither knows nor cares what the product costs to make; they compare what they get with what they give up.',
    },
    solution: 'Customer value is perceived benefits (functional, emotional, social) relative to perceived total cost (money, time, effort, risk), judged against the next-best alternative.',
  },
  {
    id: 'm02-mm-k2', type: 'num', kind: 'numerical',
    prompt: 'In natural and specialty grocers the distributor and retailer together keep 38% of the shelf price. At $3.49 a can, what is Lantern’s gross margin per can on the Single-origin liquid, which costs $0.74 a can?',
    answer: 1.42, check: () => 3.49 * (1 - 0.38) - 0.74, tol: 0.01, unit: '$', places: 2,
    wrong: [
      { value: 2.16, say: 'That is what Lantern receives from the trade. Subtract the $0.74 cost of the can and its contents.' },
      { value: 2.75, say: 'You subtracted the cost from the shelf price, but the trade keeps 38% of it. Lantern receives 62%.' },
      { value: 0.59, say: 'You used the trade’s 38% as Lantern’s share. Lantern receives the other 62%.' },
    ],
    solution: 'Lantern receives 3.49 × (1 − 0.38) = 3.49 × 0.62 = $2.1638. Gross margin = 2.1638 − 0.74 = $1.4238, about $1.42 a can.',
  },
  {
    id: 'm02-mm-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each Lantern decision as product, price, place or promotion.',
    items: [
      'Launching three flavours instead of one',
      'Selling only in natural and specialty grocers',
      'Matching Summit’s $3.79 price',
      'Sending free cans to local food writers',
      'Switching from a 250 ml can to a 330 ml can',
    ],
    categories: PS,
    answer: [0, 2, 1, 3, 0],
    feedback: {
      1: 'Choosing which shops sell the can is a place decision (how intensively and where it is distributed).',
      3: 'Free cans for writers are a public-relations tool: communication that aims to earn coverage. That is promotion, not price.',
      4: 'The size of the can changes what the customer gets: product (packaging and quantity).',
    },
    solution: 'Product: the range and the can size. Price: $3.79. Place: natural and specialty grocers only. Promotion: free cans for food writers (public relations).',
  },
  {
    id: 'm02-mm-k4', type: 'mc', kind: 'applied',
    prompt: 'A spa hotel (fictional) is positioned as a quiet luxury retreat. It wants to fill more rooms in winter. Which proposal best keeps its marketing mix consistent with its positioning?',
    options: [
      'A winter package that adds a free treatment and late checkout at the usual room rate, offered to past guests by email.',
      'Half-price rooms advertised on discount voucher websites.',
      'Party weekends with DJs to attract groups.',
      'Fewer spa staff in winter to save costs, at the same room rate.',
    ],
    answer: 0,
    feedback: {
      1: 'Deep discounts on voucher sites change price, place and promotion together, all towards bargain hunting, and attract guests who are not looking for a quiet luxury retreat.',
      2: 'Loud events contradict “quiet retreat”, the core of the positioning, and would disappoint the hotel’s existing guests.',
      3: 'A weaker product at the same price lowers customer value and risks the hotel’s reputation; it is a cost decision that damages the mix.',
    },
    why: 'It adds benefits instead of cutting the price, protects the rate that signals luxury, and reaches people who already value what the hotel offers.',
    solution: 'The package raises customer value by adding benefits (a treatment, late checkout) that fit the positioning, keeps the usual rate, and uses a channel and message aimed at the hotel’s own target market. The other options each break one or more Ps away from “quiet luxury”.',
  },
  {
    id: 'm02-mm-k5', type: 'mc', kind: 'conceptual',
    prompt: 'What was Lauterborn’s main criticism of the 4Ps when he proposed the 4Cs in 1990?',
    options: [
      'They describe marketing from the seller’s point of view; the 4Cs restate each decision from the buyer’s.',
      'They leave out the people, process and physical evidence that services depend on.',
      'They encourage short-term transactions instead of long-term customer relationships.',
      'They have too few elements to describe a manufacturer’s marketing.',
    ],
    answer: 0,
    feedback: {
      1: 'That is Booms and Bitner’s point (1981), which led to the 7Ps for services.',
      2: 'That is closer to Grönroos’s (1994) relationship-marketing critique.',
      3: 'Borden’s list was longer, but the 4Cs have the same number of elements as the 4Ps; Lauterborn changed the viewpoint, not the count.',
    },
    solution: 'Lauterborn replaced product, price, place and promotion with consumer wants and needs, cost to satisfy, convenience to buy and communication: the same four decision areas, seen from the customer’s side.',
  },
  {
    id: 'm02-mm-k6', type: 'num', kind: 'applied',
    prompt: 'A hotel group (fictional) compares two laundry contracts. Contract X costs $42,000 a year, but the hotel’s staff spend 10 hours a week fixing its errors, at $20 an hour. Contract Y costs $50,000 a year and needs no fixing. Over a 52-week year, by how much does contract X’s total cost exceed contract Y’s? (Enter a negative number if X is cheaper.)',
    answer: 2400, check: () => (42000 + 10 * 20 * 52) - 50000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: -8000, say: 'That compares the prices only. Add the cost of the staff time spent fixing contract X’s errors.' },
      { value: 10400, say: 'That is the cost of the staff time alone. Add it to contract X’s price, then compare with contract Y.' },
    ],
    solution: 'Staff time: 10 hours × $20 × 52 weeks = $10,400 a year. Contract X’s total cost: $42,000 + $10,400 = $52,400. That is $52,400 − $50,000 = $2,400 more than contract Y. The cheaper price is the more expensive choice, which is why business buyers compare total cost, not price.',
  },
];
