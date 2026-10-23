// assess-m2.js — M01 module 2 test: How customers buy (consumer-decisions, influences-on-buying, business-buying).
// No hints. Each item has a full solution, shown when the student reviews the test. All businesses, people and figures
// are fictional unless an item names a cited source from the lessons.

export const items = [
  {
    id: 'm01-m2-1', lesson: 'consumer-decisions', type: 'num', kind: 'numerical',
    prompt: 'A family choosing a holiday cottage weights location 0.4, price 0.35 and size 0.25. Cottage X scores 7, 8 and 5 out of 10 on those attributes; Cottage Y scores 9, 5 and 8 (higher is always better). What is the weighted score of the cottage the model expects them to choose? Give two decimal places.',
    answer: 7.35, check: () => Math.max(0.4 * 7 + 0.35 * 8 + 0.25 * 5, 0.4 * 9 + 0.35 * 5 + 0.25 * 8), tol: 0.005, unit: 'points', places: 2,
    wrong: [
      { value: 6.85, say: 'That is Cottage X’s score. Cottage Y scores higher, so it is the one the model expects them to choose.' },
      { value: 7.33, say: 'That is the plain average of Cottage Y’s scores. Multiply each score by its weight before adding.' },
      { value: 22, say: 'That is the sum of Cottage Y’s scores. Weight each one first.' },
    ],
    solution: 'X: 0.4 × 7 + 0.35 × 8 + 0.25 × 5 = 2.8 + 2.8 + 1.25 = 6.85. Y: 0.4 × 9 + 0.35 × 5 + 0.25 × 8 = 3.6 + 1.75 + 2.0 = 7.35. The model expects them to choose Cottage Y, with 7.35: its location and size outweigh its higher price.',
  },
  {
    id: 'm01-m2-2', lesson: 'consumer-decisions', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each purchase by the kind of buying behaviour it shows.',
    items: [
      'A retired couple compare cruise lines for months, reading reviews and brochures, before booking.',
      'A driver fills up at whichever petrol station is nearest when the tank is low.',
      'A diner orders a different pizza topping on each visit, just for a change.',
      'A homeowner quickly picks one of three similar-looking roofing firms, then reads reviews to feel better about the choice.',
    ],
    categories: ['Complex', 'Dissonance-reducing', 'Habitual', 'Variety-seeking'],
    answer: [0, 2, 3, 1],
    feedback: {
      1: 'Petrol is a low-involvement purchase between brands most drivers see as alike: habitual.',
      3: 'The roof matters a great deal, but the firms look alike to her, so she chooses quickly and then seeks reassurance: dissonance-reducing.',
    },
    solution: 'The cruise: complex (high involvement, real differences). The petrol: habitual (low involvement, little difference). The pizza: variety-seeking (low involvement, switching for novelty). The roofing firm: dissonance-reducing (high involvement, similar options, doubts afterwards).',
  },
  {
    id: 'm01-m2-3', lesson: 'consumer-decisions', type: 'mc', kind: 'applied',
    prompt: 'A fictional bike retailer’s survey finds that many customers who started out looking at one brand bought a brand they first came across on a comparison site while researching. Which idea best explains this, and what does it imply for the retailer’s marketing?',
    options: [
      'Consideration sets can grow during active evaluation, so its bikes must be easy to find while people research.',
      'The funnel: buyers narrow steadily from many brands to one, so it should advertise only to people who are new to cycling.',
      'Habitual buying: customers repurchase their usual brand, so it should put its effort into reminders for past buyers.',
      'Post-purchase dissonance: buyers regretted their first choice, so it should send reassuring e-mails after each sale.',
    ],
    answer: 0,
    feedback: {
      1: 'The funnel predicts that brands drop out, not that they are added during research; this survey shows the opposite.',
      2: 'These buyers switched from the brand they started with, which is not habitual repurchase.',
      3: 'The switch happened before buying, during research, so it isn’t post-purchase doubt.',
    },
    solution: 'Court and colleagues (2009) found buyers adding brands during active evaluation, with most touchpoints at that stage driven by consumers (reviews, comparison sites, word of mouth). A brand absent from a buyer’s first list can still be chosen, provided it shows up where people research.',
  },
  {
    id: 'm01-m2-4', lesson: 'consumer-decisions', type: 'num', kind: 'applied',
    prompt: 'Among families, Hartmoor Dental (fictional) trails a rival practice by 0.6 points in weighted score. Families weight opening hours 0.3 and price 0.2. Hartmoor can raise its opening-hours score by one point for about $8,000 a year (an extra evening session) or its price score by one point for about $15,000 a year (lower fees). Changing only one attribute, what is the lowest yearly cost of drawing level with the rival?',
    answer: 16000, check: () => Math.min((0.6 / 0.3) * 8000, (0.6 / 0.2) * 15000), tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 45000, say: 'That is the cost of the price route: 3 points × $15,000. The opening-hours route needs fewer points, each cheaper.' },
      { value: 4800, say: 'You multiplied the score gap by the cost per point. First find the points needed (gap ÷ weight), then multiply by the cost per point.' },
      { value: 2, say: 'That is the number of points needed on opening hours. Multiply by the $8,000 each point costs.' },
    ],
    solution: 'Points needed = gap ÷ weight. Opening hours: 0.6 ÷ 0.3 = 2 points, costing 2 × $8,000 = $16,000 a year. Price: 0.6 ÷ 0.2 = 3 points, costing 3 × $15,000 = $45,000 a year. The cheaper route is opening hours, at $16,000. The heavier weight means fewer points, and here each point is also cheaper; when the two pull in different directions, compare the costs, not just the points.',
  },
  {
    id: 'm01-m2-5', lesson: 'influences-on-buying', type: 'mc', kind: 'conceptual',
    prompt: 'A manager says: “Our customers are struggling financially, so Maslow tells us they won’t buy treats or gifts until their basic needs are met.” What is the best response?',
    options: [
      'Evidence for a fixed order of needs is weak, and people on tight budgets still buy treats.',
      'That is right: Maslow’s hierarchy shows that higher needs come into play only once basic needs are fully met.',
      'That is right for gifts, but treats meet physiological needs, so they will keep selling whatever happens.',
      'Maslow’s theory applies only to luxury brands, not to treats.',
    ],
    answer: 0,
    feedback: {
      1: 'Maslow himself said the hierarchy was not rigid, and later research (Wahba and Bridwell, 1976; Tay and Diener, 2011) found little support for a fixed sequence.',
      2: 'Gifts and treats can serve belonging and esteem needs, and people pursue those even when basic needs are not fully met.',
      3: 'Maslow wrote about human motivation in general, not about kinds of brand.',
    },
    solution: 'Maslow’s list of needs is a useful checklist of benefits, but the order is not a law: Maslow described it as less rigid than his diagrams suggest, and the evidence for a fixed sequence is weak. Tay and Diener found people reporting social and self-actualisation needs met even when basic needs were not. Financial pressure changes what people buy, but it doesn’t switch off higher needs.',
  },
  {
    id: 'm01-m2-6', lesson: 'influences-on-buying', type: 'classify', kind: 'conceptual',
    prompt: 'Which idea from the lesson does each example mainly illustrate?',
    items: [
      'An employer enrols new staff in its mid-price dental plan unless they choose another plan.',
      'An energy company’s letter says: “You are losing $180 a year by staying on your current tariff.”',
      'A landlord opens rent talks at $2,400 a month, and the rent finally agreed ends up close to it.',
      'Hikers on an online forum buy the boots recommended by a long-time member known for her careful gear reviews.',
    ],
    categories: ['Anchoring', 'Default effect', 'Loss aversion', 'Opinion leader'],
    answer: [1, 2, 0, 3],
    feedback: {
      1: 'The letter frames staying put as losing $180, rather than switching as saving $180. Because losses weigh more than equal gains, the loss frame is the stronger one: loss aversion.',
      2: 'The opening figure in a negotiation is an anchor: later offers are judged against it and adjusted from it.',
      3: 'Others seek out and follow her advice because of her knowledge: she is an opinion leader.',
    },
    solution: 'The dental plan is a default; “you are losing $180” uses loss aversion; the landlord’s opening figure is an anchor; the forum member is an opinion leader whose word-of-mouth recommendations others follow.',
  },
  {
    id: 'm01-m2-7', lesson: 'influences-on-buying', type: 'num', kind: 'numerical',
    prompt: 'A fictional coffee-subscription service wins 600 customers through advertising. Each new customer refers 0.4 new customers on average, and 25% of referred customers would have joined anyway. It pays a $15 credit for every referral. In the long run, what does the credit cost per incremental customer?',
    answer: 20, check: () => ((600 / (1 - 0.4) - 600) * 15) / ((600 / (1 - 0.4) - 600) * (1 - 0.25)), tol: 0.05, unit: '$', places: 2,
    wrong: [
      { value: 15, say: 'That is the cost per referral. A quarter of referred customers would have joined anyway, but the credit is paid for them too, so the cost per incremental customer is higher.' },
      { value: 6000, say: 'That is the total cost of the credits. Divide it by the number of incremental customers.' },
      { value: 60, say: 'You divided by the customers who would have joined anyway. Divide by the incremental ones, the other 75%.' },
    ],
    solution: 'Long-run total = 600 ÷ (1 − 0.4) = 1,000, so 400 customers are referred. Credits: 400 × $15 = $6,000. Incremental customers: 400 × 0.75 = 300. Cost per incremental customer: $6,000 ÷ 300 = $20.',
  },
  {
    id: 'm01-m2-8', lesson: 'influences-on-buying', type: 'mc', kind: 'applied',
    prompt: 'A fictional streaming service wants more customers on its annual plan. Which design is a legitimate nudge rather than a dark pattern?',
    options: [
      'Showing the annual plan’s saving clearly beside the monthly plan, with neither of them pre-selected.',
      'Pre-selecting the annual plan and showing its total price in small grey type below the button.',
      'A countdown saying the annual offer ends in ten minutes, which restarts every time the page is opened.',
      'One-click sign-up for the annual plan, but a phone call during office hours to cancel it.',
    ],
    answer: 0,
    feedback: {
      1: 'Pre-selection combined with a hidden price relies on buyers not noticing: it fails the test of whether they would accept it if they saw how it worked.',
      2: 'The deadline is false, so the urgency is a deception, using loss aversion to rush the decision.',
      3: 'Making leaving far harder than joining traps customers rather than serving them.',
    },
    solution: 'Ask the four questions: is it true, in the customer’s interest, easy to reverse, and acceptable if the customer saw how it worked? Showing a real saving clearly, with an active choice, passes all four. The other designs depend on inattention, false urgency or friction.',
  },
  {
    id: 'm01-m2-9', lesson: 'business-buying', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel chain has 2,000 beds and replaces 12.5% of its mattresses each year. New hotels opening next year will add 10% to its beds. By what percentage will next year’s mattress orders exceed a normal year’s?',
    answer: 80, check: () => ((2000 * 1.1 - 2000 * (1 - 0.125)) / (2000 * 0.125) - 1) * 100, tol: 0.5, unit: '%', places: 0,
    wrong: [
      { value: 10, say: 'That is the growth in beds. Mattress orders grow far faster, because they include the 200 extra mattresses as well as the usual replacements.' },
      { value: 450, say: 'That is next year’s order in mattresses. Compare it with a normal year’s 250 to find the percentage.' },
      { value: 180, say: 'That is next year’s order as a percentage of a normal year’s. The question asks how far above a normal year it is.' },
    ],
    solution: 'Normal year: 2,000 × 0.125 = 250 mattresses. Next year the chain needs 2,000 × 1.1 = 2,200; after retiring 250, it has 1,750 in service, so it orders 2,200 − 1,750 = 450. That is 450 ÷ 250 − 1 = 0.8, or 80% above a normal year, from a 10% rise in beds: the acceleration effect, seen by the mattress maker.',
  },
  {
    id: 'm01-m2-10', lesson: 'business-buying', type: 'multi', kind: 'applied',
    prompt: 'A fictional packaging firm supplies a food maker’s cartons through an automated monthly reorder. Which statements about its position are correct? Select all that apply.',
    options: [
      'While the reorder stays automatic, rivals’ prices are unlikely even to be looked at.',
      'If the food maker tightens its carton specification after a quality complaint, rivals get a chance.',
      'A price rise that makes the food maker ask for new quotes turns the purchase into a modified rebuy.',
      'As the in-supplier, it can stop worrying about the food maker’s reviews of its performance.',
      'An automated reorder counts as a new task, because a computer and not a person places it.',
      'A rival’s best move is to wait for the next automated order and undercut it by a few cents.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Performance reviews decide whether the straight rebuy continues. A poor review is exactly what reopens the decision.',
      4: 'An automated reorder is the clearest straight rebuy there is: the same item, supplier and terms, with no search at all.',
      5: 'In a straight rebuy nobody compares prices at the next order. A rival must give the buyer a reason to reopen the decision first.',
    },
    solution: 'The automated reorder is a straight rebuy, which protects the in-supplier: nobody searches or compares. Anything that makes the buyer reconsider, such as a tighter specification after a complaint or a price rise that triggers new quotes, turns it into a modified rebuy and gives rivals their chance. That is why the in-supplier must keep earning good performance reviews, and why a rival must create a reason to reopen the decision rather than wait.',
  },
  {
    id: 'm01-m2-11', lesson: 'business-buying', type: 'mc', kind: 'applied',
    prompt: 'At a fictional factory, the maintenance supervisor tells a pump supplier: “I love your pumps, but I can only sign for up to $3,000. Anything bigger goes to the plant director.” The supplier’s proposal is for $12,000 of pumps, which the supervisor’s team will install and run. In this purchase, the supervisor is best described as:',
    options: [
      'A user and an influencer, but not the decider for this order.',
      'The decider, because he has already made up his mind about which supplier he prefers.',
      'The gatekeeper, as he controls the pumps chosen.',
      'The buyer and the decider, because he is the person the supplier has been dealing with.',
    ],
    answer: 0,
    feedback: {
      1: 'Preferring a supplier makes him an influencer. At $12,000 the power to approve lies with the plant director.',
      2: 'A gatekeeper controls information and access to the others. Installing and running the pumps makes the team users.',
      3: 'Being the supplier’s contact doesn’t make him the decider. His approval limit settles that.',
    },
    solution: 'His team will install and run the pumps (users), and his opinion shapes the choice (influencer). With a $3,000 limit, the $12,000 purchase must be approved by the plant director, the decider. The supplier should help the supervisor make the case to the director, not assume the sale is won.',
  },
  {
    id: 'm01-m2-12', lesson: 'business-buying', type: 'mc', kind: 'applied',
    prompt: 'A US federal agency needs $40,000 of laboratory supplies and won’t advertise the purchase publicly. Under the Federal Acquisition Regulation as described in the lesson, what should its contracting officer do?',
    options: [
      'Promote competition and consider asking at least three sources.',
      'Buy from any one supplier without quotes, as allowed up to $350,000.',
      'Split it into three orders of about $13,300, each a micro-purchase.',
      'Run a full formal tender, as for every purchase above $15,000.',
    ],
    answer: 0,
    feedback: {
      1: 'Buying without competing quotations is allowed only for micro-purchases, at or below $15,000. Up to $350,000 the officer must promote competition.',
      2: 'Splitting a requirement into smaller purchases just to get under a threshold is not allowed.',
      3: 'Between $15,000 and $350,000 the simplified procedures apply; more formal procedures are for larger purchases.',
    },
    solution: '$40,000 lies between the micro-purchase threshold ($15,000) and the simplified acquisition threshold ($350,000). The contracting officer must promote competition as far as practicable and, as the purchase is not advertised publicly, should consider asking at least three sources. Splitting it into micro-purchases to avoid that would break the rules.',
  },
];
