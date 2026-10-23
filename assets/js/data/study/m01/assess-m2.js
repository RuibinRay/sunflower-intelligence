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
    prompt: 'Among busy parents, a fictional online grocer trails the market leader by 0.36 points in weighted score. These buyers give delivery speed a weight of 0.24. By how many points must the grocer’s delivery-speed score rise, with nothing else changing, to draw level with the leader? Give one decimal place.',
    answer: 1.5, check: () => 0.36 / 0.24, tol: 0.05, unit: 'points', places: 1,
    wrong: [
      { value: 0.36, say: 'That is the gap in weighted scores. Each point of delivery speed adds only 0.24 to the weighted score, so divide the gap by the weight.' },
      { value: 0.1, say: 'You multiplied the gap by the weight (0.36 × 0.24 ≈ 0.09). The rise needed is gap ÷ weight.' },
    ],
    solution: 'Rise needed = gap ÷ weight = 0.36 ÷ 0.24 = 1.5 points on delivery speed. Whether that is the best route depends on what faster delivery costs compared with improving another attribute.',
  },
  {
    id: 'm01-m2-5', lesson: 'influences-on-buying', type: 'mc', kind: 'conceptual',
    prompt: 'A manager says: “Our customers are struggling financially, so Maslow tells us they won’t buy treats or gifts until their basic needs are met.” What is the best response?',
    options: [
      'The evidence gives little support to a fixed order of needs, and people on tight budgets still buy treats and gifts.',
      'That is right: Maslow’s hierarchy shows that higher needs come into play only once basic needs are fully met.',
      'That is right for gifts, but treats meet physiological needs, so they will keep selling whatever happens.',
      'Maslow’s theory applies only to luxury brands, so it has nothing to say about everyday treats and gifts.',
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
      'A restaurant lists a $95 steak at the top of the menu, so the $45 dishes seem reasonable.',
      'A pension scheme enrols employees automatically unless they choose to opt out.',
      'A music app’s free trial ends with: “You’ll lose your saved playlists unless you subscribe.”',
      'A student buys the jacket that the most admired students at her school wear.',
    ],
    categories: ['Anchoring', 'Default effect', 'Loss aversion', 'Reference group'],
    answer: [0, 1, 2, 3],
    feedback: {
      2: 'The message frames not subscribing as losing something the user already has, which weighs more than an equivalent gain: loss aversion.',
      3: 'The admired students are a group she wants to resemble: an aspirational reference group.',
    },
    solution: 'The $95 steak is an anchor; automatic enrolment is a default; “you’ll lose your playlists” uses loss aversion; the jacket shows a reference group’s influence.',
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
    prompt: 'A fictional regional airline flies 60 aircraft and retires 5% of its fleet each year. The aircraft it needs are proportional to passenger demand, which is expected to grow by 5% next year. How many aircraft will it order next year?',
    answer: 6, check: () => 60 * 1.05 - 60 * 0.95, tol: 0.05, unit: 'aircraft', places: 0,
    wrong: [
      { value: 3, say: 'That is a normal year’s replacements (5% of 60). With 5% growth it also needs 3 extra aircraft.' },
      { value: 63, say: 'That is the number of aircraft it needs in total; 57 remain in service after retirements.' },
      { value: 3.15, say: 'That is 5% more than the normal 3 replacements. Orders are the aircraft needed minus those still in service.' },
    ],
    solution: 'Aircraft needed: 60 × 1.05 = 63. Still in service after retiring 5%: 60 × 0.95 = 57. Orders: 63 − 57 = 6, twice the normal 3. A 5% rise in passengers doubles the aircraft maker’s orders from this airline: the acceleration effect.',
  },
  {
    id: 'm01-m2-10', lesson: 'business-buying', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each purchase as a straight rebuy, a modified rebuy or a new task.',
    items: [
      'A hospital reorders surgical gloves under its standing contract.',
      'A university, unhappy with its cleaning contractor, re-tenders the contract with stricter standards.',
      'A farm cooperative buys its first drone for monitoring crops.',
      'An airline keeps its catering supplier but changes the menu specification.',
    ],
    categories: ['Straight rebuy', 'Modified rebuy', 'New task'],
    answer: [0, 1, 2, 1],
    feedback: {
      1: 'The university has bought cleaning before but is reopening the supplier and the terms: a modified rebuy.',
      3: 'Same supplier, changed specification: a modified rebuy.',
    },
    solution: 'The gloves: straight rebuy. The cleaning contract and the airline menu: modified rebuys. The drone: a new task, bought for the first time.',
  },
  {
    id: 'm01-m2-11', lesson: 'business-buying', type: 'mc', kind: 'applied',
    prompt: 'At a fictional factory, the maintenance supervisor tells a pump supplier: “I love your pumps, but I can only sign for up to $3,000. Anything bigger goes to the plant director.” The supplier’s proposal is for $12,000 of pumps, which the supervisor’s team will install and run. In this purchase, the supervisor is best described as:',
    options: [
      'A user and an influencer, but not the decider, because the purchase is above his approval limit.',
      'The decider, because he has already made up his mind about which supplier he prefers.',
      'The gatekeeper, because he decides which pumps his team will install and maintain.',
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
    prompt: 'A US federal agency needs $9,000 of office chairs. Under the Federal Acquisition Regulation in force from 13 March 2026, as described in the lesson, which statement is correct?',
    options: [
      'As a micro-purchase (at or below $15,000), it may be bought without competing quotations if the price is reasonable.',
      'It needs a formal request for proposal, because every federal purchase must go through one.',
      'It must get at least three quotes, as the simplified acquisition threshold requires for purchases of any size.',
      'It may be bought only from whichever supplier offered the agency the lowest price for chairs last year.',
    ],
    answer: 0,
    feedback: {
      1: 'Formal procedures are for larger purchases. Small purchases are simplified precisely so that they don’t need them.',
      2: 'The micro-purchase rules let purchases up to $15,000 be made without competing quotations when the price is reasonable; asking for several sources applies above that threshold.',
      3: 'Nothing in the rules ties a purchase to last year’s cheapest supplier; micro-purchases are to be spread fairly among qualified suppliers.',
    },
    solution: '$9,000 is below the $15,000 micro-purchase threshold (FAR 2.101), so under FAR part 13 the purchase may be made without soliciting competing quotations if the price is considered reasonable, and such purchases are to be distributed fairly among qualified suppliers where practicable. A supplier selling to the agency at this size competes on being known, approved and reasonably priced, not on a formal bid.',
  },
];
