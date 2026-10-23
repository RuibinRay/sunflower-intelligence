// assess-diagnostic.js — M01 course diagnostic: four items per module, each written so that it needs the module’s
// method, not just its vocabulary: telling a change that creates value from one that only moves it, a lifetime value
// built from margin, market orientation as judgement rather than obedience, net value with time and risk; the weight at
// which a ranking flips, the psychological processes behind a purchase, tender rules, the acceleration effect; market
// a SWOT that keeps conditions apart from actions and beliefs, new customers through a funnel, cost leadership versus a
// low price, a rival’s price cut.
// New questions, not copies of lesson exercises, module-test or project items (none uses Lantern’s catering figures).
// No hints; solutions show in review. Every business, person and figure here is fictional. Lifetime value uses the
// course’s timing: margins at the end of each year, the customer certain to be there for year 1, constant retention.

export const items = [
  // ================================================================ Module 1: What marketing is
  {
    id: 'm01-dg-1', lesson: 'what-is-marketing', type: 'multi', kind: 'conceptual',
    prompt: 'Glenmoor Ski School (fictional) sells a two-hour lesson for $80. A typical pupil would pay up to $110 for it, and it costs the school $50 to provide. Which of these changes would increase the total value a lesson creates, rather than just moving value between the pupil and the school? Select all that apply.',
    options: [
      'Buying instructors’ lift passes in bulk cuts the school’s cost of a lesson to $44; pupils notice no difference.',
      'The price rises to $90, and every pupil still books.',
      'Video feedback after each lesson raises what a typical pupil would pay to $125 and adds $5 to the cost.',
      'The price falls to $70 as a thank-you to regular pupils.',
      'Heated changing rooms add $12 to the cost of a lesson and raise what pupils would pay by $8.',
      'Online check-in saves pupils a queue they would pay $6 to avoid, at no extra cost to the school.',
    ],
    answer: [0, 2, 5],
    feedback: {
      1: 'A price rise that every pupil accepts moves $10 a lesson from the pupil to the school. The value created, $110 − $50 = $60, is unchanged; only its split changes.',
      3: 'A price cut moves value the other way, from the school to the pupil. The total stays $60 a lesson.',
      4: 'This creates less value, not more: what pupils would pay rises by $8 but the cost rises by $12, so the value created falls from $60 to $56.',
    },
    solution: 'Value created = willingness to pay − cost = $110 − $50 = $60 a lesson. Cheaper passes: $110 − $44 = $66. Video feedback: $125 − $55 = $70. Online check-in: pupils would now pay $116 for the same lesson, so $116 − $50 = $66. Each of these makes the total larger. The two price changes only divide the same $60 differently (at $90 the pupil keeps $20 and the school $40), and the changing rooms cost more than pupils value them: $118 − $62 = $56. Only a better offer or a cheaper way to deliver it creates value; the price decides who keeps it.',
  },
  {
    id: 'm01-dg-2', lesson: 'customer-value', type: 'num', kind: 'numerical',
    prompt: 'Tussock Dog Grooming (fictional) sells a membership. A typical member books 10 grooms a year at $42 each, and 35% of that revenue is left after the groomer’s time, products and card fees. 72% of members renew each year, and the business discounts future money at 8% a year. Using the course’s formula for every future year, CLV = m ÷ (1 + d − r), what is a member’s lifetime value? Give dollars and cents.',
    answer: 408.33, check: () => (10 * 42 * 0.35) / (1 + 0.08 - 0.72), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 1166.67, say: 'That uses a year’s revenue ($420). Lifetime value is built from margin: 35% of $420 is $147.' },
      { value: 525, say: 'That is 147 ÷ (1 − 0.72), which leaves out discounting. Later margins are worth less today, so the denominator is 1 + 0.08 − 0.72 = 0.36.' },
      { value: 204.17, say: 'You divided by the retention rate. The denominator is 1 + d − r = 0.36.' },
      { value: 183.75, say: 'That puts the churn rate (0.28) where the formula needs the retention rate: the denominator is 1 + 0.08 − 0.72.' },
      { value: 147, say: 'That is one year’s margin. A member is expected to stay several years: use the lifetime-value formula.' },
    ],
    solution: 'Revenue a year: 10 × $42 = $420. Margin: 35% of $420 = $147. CLV = m ÷ (1 + d − r) = 147 ÷ (1 + 0.08 − 0.72) = 147 ÷ 0.36 ≈ $408.33. A member stays 1 ÷ 0.28 ≈ 3.6 years on average; without discounting the figure would be 147 ÷ 0.28 = $525, and built from revenue it would be $1,166.67, both overstatements that would justify spending too much to win members.',
  },
  {
    id: 'm01-dg-3', lesson: 'market-orientation', type: 'mc', kind: 'conceptual',
    prompt: 'Kittering Software (fictional) sells scheduling software to 400 dental practices. Its largest client, worth 6% of revenue, demands a custom feature that would take a quarter of the developers’ time for a year. Interviews and usage data show that no other client wants it. Which response fits market orientation as Narver and Slater describe it?',
    options: [
      'Treat the request as intelligence, then decide on long-term profit: build it only if the client pays for it',
      'Build it free of charge, because market orientation means giving the largest customers whatever they ask for',
      'Ignore it and keep to the plan, because one client’s request does not count as market intelligence at all',
      'Ask the sales team to persuade the client that the current software already does what it needs',
    ],
    answer: 0,
    feedback: {
      1: 'That is being customer-led, not market-oriented. Narver and Slater’s decision criteria are a long-term focus and profitability: giving one client a quarter of the developers’ time for a year, unpaid, takes that work away from the other 399.',
      2: 'A client’s request is exactly the kind of intelligence a market-oriented firm gathers and shares. Deciding against it after weighing it can be right; refusing to consider it is not.',
      3: 'Persuading customers to accept what the business already makes is the selling concept. It ignores what the client has said.',
    },
    solution: 'Market orientation means generating intelligence about customers and competitors, sharing it across the business and responding, guided by a long-term focus and profitability (Narver and Slater, 1990). The request is intelligence; the usage data and interviews show it serves one client only. Doing whatever the largest client asks is not market orientation, nor is ignoring it. A reasonable response is to offer the feature as a paid custom project, or to decline and explain why, after counting what it would cost the other clients in delayed work.',
  },
  {
    id: 'm01-dg-4', lesson: 'customer-value', type: 'num', kind: 'applied',
    prompt: 'Penrose Medical Practice (fictional) needs 2,000 leaflets printed each month and compares two printers. Inkwell charges $480; the practice manager must collect each order, which takes her 2 hours, and 1 order in 20 has errors that cost $400 to put right. Sternway charges $540 and delivers; 1 order in 100 has errors costing $400 to put right. She values her time at $30 an hour, and the leaflets are otherwise identical. Counting money, time and the expected cost of errors, how much less does Sternway cost the practice each month? Give dollars, with a minus sign if it costs more.',
    answer: 16, check: () => (480 + 2 * 30 + 400 / 20) - (540 + 400 / 100), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -60, say: 'That compares prices only. Customer value counts the non-money costs too: the manager’s time and the expected cost of errors.' },
      { value: 20, say: 'You left out Sternway’s own error risk: 1 order in 100 still costs $400 to fix, an expected $4 a month.' },
      { value: -44, say: 'You left out the manager’s time. Two hours at $30 is a real cost of choosing Inkwell.' },
      { value: 0, say: 'You left out the errors. Expected cost of risk = probability × cost if it goes wrong: $20 a month with Inkwell, $4 with Sternway.' },
    ],
    solution: 'Total cost = price + time cost + expected cost of risk. Inkwell: $480 + 2 × $30 + (1 ÷ 20) × $400 = $480 + $60 + $20 = $560. Sternway: $540 + $0 + (1 ÷ 100) × $400 = $544. Sternway costs $16 a month less, although its price is $60 higher. The same two offers might rank the other way for a practice whose manager’s time is cheaper or whose errors cost less: value is the customer’s judgement of all the costs.',
  },

  // ================================================================ Module 2: How customers buy
  {
    id: 'm01-dg-5', lesson: 'consumer-decisions', type: 'num', kind: 'numerical',
    prompt: 'A buyer is choosing between two fictional coffee grinders and cares about only two attributes, grind quality and price, with weights that add up to 1. The Avocet scores 8 for grind quality and 3 for price; the Merlin scores 4 and 9 (out of 10, higher always better). What is the smallest weight on grind quality at which the Avocet’s weighted score is at least the Merlin’s? Give a decimal to two places.',
    answer: 0.6, check: () => (9 - 3) / ((8 - 4) + (9 - 3)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.5, say: 'With equal weights the Avocet scores 5.5 and the Merlin 6.5, so the Merlin still leads. Write each score with a weight w on quality and 1 − w on price, and find where they are equal.' },
      { value: 0.4, say: 'That is the weight on price at the point where the two tie. The question asks for the weight on grind quality: 1 − 0.4.' },
      { value: 6, say: 'That is the gap in price scores (9 − 3). The Avocet’s 4-point lead on quality has to outweigh it: 4w ≥ 6(1 − w).' },
    ],
    solution: 'With weight w on quality and 1 − w on price: Avocet = 8w + 3(1 − w) = 3 + 5w; Merlin = 4w + 9(1 − w) = 9 − 5w. The Avocet is at least level when 3 + 5w ≥ 9 − 5w, so 10w ≥ 6 and w ≥ 0.60. Check: at 0.6 both score 6.0. Equivalently, the Avocet’s 4-point lead on quality, weighted by w, must cover the Merlin’s 6-point lead on price, weighted by 1 − w. The same two products rank differently for buyers with different weights, which is why weights belong to groups of buyers, not to products.',
  },
  {
    id: 'm01-dg-6', lesson: 'influences-on-buying', type: 'classify', kind: 'conceptual',
    prompt: 'Which influence on buying does each example mainly show?',
    items: [
      'A hiker starts noticing adverts for walking boots only after her old pair splits on a hill.',
      'After years of good experiences with one brand’s yoghurt, a shopper buys its new ice cream without comparing it with others.',
      'A fan of a phone brand reads a mixed review of its new model as mostly positive.',
      'A shopper who meant to compare umbrellas online buys the first one she sees when a storm starts.',
      'A new parent pays extra for the car seat with the best crash-test results, to keep her baby safe.',
      'A coffee drinker whose monthly beans have never disappointed her now reorders them without a second thought.',
    ],
    categories: ['Motivation', 'Perception', 'Learning', 'Situational factor'],
    answer: [1, 2, 1, 3, 0, 2],
    feedback: {
      0: 'Noticing only what relates to a current need is selective attention, part of perception.',
      1: 'Transferring a good experience with one product to others under the same brand is generalisation, which is how learning works.',
      2: 'Interpreting information to fit what you already believe is selective distortion: perception.',
      3: 'The storm changes the moment of purchase, not the shopper’s needs or beliefs: a situational factor.',
      5: 'Each satisfying delivery reinforced the purchase until it became a habit: learning, which is how habitual buying comes about.',
    },
    solution: 'Perception: noticing the boot adverts (selective attention) and reading the review kindly (selective distortion). Learning: trying the ice cream on the strength of the yoghurt (generalisation) and the reorder that has become a habit through reinforcement. Motivation: the safety need behind the car seat. Situational factor: the storm at the moment of purchase.',
  },
  {
    id: 'm01-dg-7', lesson: 'business-buying', type: 'mc', kind: 'applied',
    prompt: 'Dunmere County Council (fictional) is running a formal tender for school cleaning contracts. Its rules name one procurement officer as suppliers’ only contact until the tender closes. The sales manager of a cleaning firm that is bidding is invited to lunch by a member of the evaluation panel he has known for years. What should he do?',
    options: [
      'Decline politely, and send any question about the tender to the named procurement officer',
      'Accept, as long as neither of them mentions the tender at any point during the lunch',
      'Accept: the invitation came from the council, so the rule on contact does not apply to him',
      'Accept, and use the lunch to explain how his firm’s bid lowers the schools’ total cost of ownership',
    ],
    answer: 0,
    feedback: {
      1: 'The rule restricts contact itself, not just talk about the bid, and hospitality from a panel member during a tender can look like influence. Either could disqualify his firm.',
      2: 'Contact rules protect the fairness of the tender whoever starts the contact. He is still a bidder meeting a member of the panel.',
      3: 'Lobbying a member of the evaluation panel is exactly what the rule forbids. A strong case on total cost belongs in the written bid, which everyone is judged on.',
    },
    solution: 'During a tender, procurement rules often allow suppliers to contact only the named procurement officer, so that every bidder is judged on the same information. The safe course is to decline the lunch and put any question to that officer. Breaking the rule, even innocently, can disqualify a bid the firm might otherwise have won.',
  },
  {
    id: 'm01-dg-8', lesson: 'business-buying', type: 'num', kind: 'numerical',
    prompt: 'Pellucid Laundry Services (fictional) runs 80 industrial washing machines and retires 12.5% of them each year as they wear out. The machines it needs are proportional to the laundry it handles, which is expected to rise by 5% next year. In a normal year, with no change in laundry, it orders only replacements. By what percentage will next year’s orders exceed a normal year’s?',
    answer: 40, check: () => ((80 * 1.05 - 80 * (1 - 0.125)) / (0.125 * 80) - 1) * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: 5, say: 'That is the change in laundry. Orders depend on the change in demand as well as on replacements, so they swing by far more.' },
      { value: 14, say: 'That is next year’s orders in machines. Compare them with a normal year’s 10 as a percentage.' },
      { value: 4, say: 'That is the number of extra machines the growth needs. The question compares total orders with a normal year’s.' },
      { value: 140, say: 'That is next year’s orders as a percentage of a normal year’s. The rise is that minus 100%.' },
    ],
    solution: 'Normal year: 12.5% of 80 = 10 machines. Next year: it needs 80 × 1.05 = 84 machines, has 80 × 0.875 = 70 still in service, and orders 84 − 70 = 14. Orders are 14 ÷ 10 − 1 = 40% above normal, from a 5% rise in laundry: the acceleration effect of derived demand. The machine maker should forecast its customers’ laundry volumes, not just extend its own order book.',
  },

  // ================================================================ Module 3: Foundations of strategy
  {
    id: 'm01-dg-9', lesson: 'situation-analysis', type: 'classify', kind: 'applied',
    prompt: 'Copperbeech Cycle Hire (fictional) rents bikes to visitors in a historic city. Its owner has written six notes for a SWOT. Where does each belong?',
    items: [
      'Every bike is serviced after each hire, and for three years it has had the fewest breakdown complaints on the city’s review site',
      'Its booking website doesn’t work on phones, although most of its visitors browse on one',
      'The council is opening a 40-mile riverside cycle path next spring',
      'A national e-bike scheme is installing docking stations across the city centre',
      'Run guided tours along the new riverside path',
      'The owner believes tourists prefer its bikes to the national scheme’s e-bikes',
    ],
    categories: ['Strength', 'Weakness', 'Opportunity', 'Threat', 'Not a SWOT item yet'],
    answer: [0, 1, 2, 3, 4, 4],
    feedback: {
      2: 'The path is outside the firm’s control and could bring customers if it acts: an opportunity, a condition rather than an action.',
      3: 'A rival’s expansion is external and could take customers: a threat.',
      4: 'Guided tours are something the firm might do, a strategy. It may come out of the SWOT later; it isn’t part of it.',
      5: 'A belief nobody has checked is a hypothesis, not yet a strength. Ask tourists, or compare bookings where the e-bikes have arrived, before listing it.',
    },
    solution: 'Strength: the servicing record, backed by three years of review-site evidence. Weakness: the booking website, an internal problem the firm can fix. Opportunity: the new path, a condition outside the firm. Threat: the national scheme’s docking stations. Not SWOT items yet: the tours are an action (an option to evaluate against the SWOT), and the owner’s belief is an untested hypothesis that needs evidence before it can count as a strength.',
  },
  {
    id: 'm01-dg-10', lesson: 'marketing-objectives', type: 'num', kind: 'numerical',
    prompt: 'Tallow Lane Coworking (fictional) starts the year with 240 members and usually loses 35% of them over a year. The owner wants to finish the year with a tenth more members than it started with, without changing the fee. Three in ten people who tour the space sign up. How many tours must it give during the year? Assume new members join early enough to count and stay until the year end.',
    answer: 360, check: () => 240 * (1 + 0.10 - 0.65) / 0.30, unit: 'tours', places: 0, tol: 0.5,
    wrong: [
      { value: 108, say: 'That is the number of new members needed. Only 30% of tours produce a member, so more tours than members are needed.' },
      { value: 80, say: 'That covers only the growth of 24 members, as if every member stayed. The space loses 35% of its members, who must be replaced first.' },
      { value: 280, say: 'That replaces the 84 members who leave but adds no growth. Add the 24 extra members too.' },
      { value: 880, say: 'That plans to win all 264 members needed at the year end, forgetting the 156 members who stay.' },
      { value: 32.4, say: 'You multiplied by the conversion rate. To win 108 members at 30% you need 108 ÷ 0.30 tours.' },
    ],
    solution: 'Members needed: 240 × 1.10 = 264. Members kept: 240 × 0.65 = 156. New members: 264 − 156 = 108, or 240 × (1 + 0.10 − 0.65) = 240 × 0.45. Tours: 108 ÷ 0.30 = 360. Of the 108 new members, 84 only replace those who leave, so a retention objective would cut the workload: each point of retention saves 2.4 members, or 8 tours.',
  },
  {
    id: 'm01-dg-11', lesson: 'competitive-advantage', type: 'mc', kind: 'conceptual',
    prompt: 'Petrel Air (fictional) charges the lowest fares on every route it flies. Its cost per seat is the highest of the airlines on those routes, and it has made a loss for two years. Is it following a cost-leadership strategy?',
    options: [
      'No: cost leadership means the lowest cost, not the lowest price; its fares just hand value to passengers',
      'Yes: it charges the lowest fares on all of its routes, and the lowest price is what cost leadership means',
      'Yes, but in the form of cost focus, because it flies only some of the routes in the country rather than all of them',
      'No: it is following differentiation, because its fares differ from every rival’s fares on its routes',
    ],
    answer: 0,
    feedback: {
      1: 'Price and cost are different things. A cost leader has the lowest cost of serving customers, which lets it charge less and still earn a margin. Petrel has the highest cost, so its low fares are losses rivals need not copy.',
      2: 'Focus means serving a chosen segment better than broad rivals, and cost focus needs the lowest cost in that segment. Petrel has neither.',
      3: 'Differentiation is being unique in ways customers value and will pay more for, not charging a different price.',
    },
    solution: 'Cost leadership is having the lowest cost of serving customers in an industry, so that a business can charge low prices or earn higher margins. A low price without a low cost only moves value from the business to its customers, and Petrel’s losses show it. It has no competitive advantage: rivals with lower costs could match its fares and still earn a margin.',
  },
  {
    id: 'm01-dg-12', lesson: 'competitive-advantage', type: 'mc', kind: 'applied',
    prompt: 'Tamarisk Walks (fictional), a dog-walking firm, charges $30 a walk. A rival charges $22, and a typical owner would pay up to $12 more for Tamarisk’s walks than for the rival’s, because Tamarisk sends photos and uses the same walker every time. The rival cuts its price to $17. Assuming an owner stays with Tamarisk as long as it leaves her at least as much value as the rival, what should Tamarisk do to keep the typical owner?',
    options: [
      'Cut its price by $1, to $29: the rival’s new $17 plus the $12 extra that owners value its walks at',
      'Cut its price to $25, so that it keeps exactly the same $8 price gap it had over the rival before the cut',
      'Match the rival’s new $17, because otherwise owners will switch to the cheaper walk',
      'Keep its $30 price, because owners still value its walks $12 more than they value the rival’s',
    ],
    answer: 0,
    feedback: {
      1: 'Owners compare value, not price gaps. At $29 Tamarisk already leaves them as much as the rival does; cutting to $25 gives away $4 a walk for nothing.',
      2: 'Matching gives away $13 a walk. Owners value Tamarisk’s walks $12 more, so it can stay $12 above the rival and still win them.',
      3: 'At $30 an owner keeps $1 less with Tamarisk than with the rival at $17: the gap in value is $12 but the gap in price is now $13.',
    },
    solution: 'The highest price that still wins the owner is the rival’s price plus the gap in willingness to pay: $17 + $12 = $29 (before the cut it was $22 + $12 = $34). Tamarisk needs to cut by only $1. A differentiator meets a rival’s price cut by protecting the gap in value, not the gap in price; matching the cut would throw away $13 a walk on every owner, including those who would have stayed anyway.',
  },
];

// Start at module N if the student scores at least the threshold on the items for all the modules before N. With four
// items per module, module 2 needs three of the four module-1 items, and module 3 seven of the eight module 1–2 items:
// the module-3 rule pools modules 1 and 2, so at 75% a student with 2 of 4 on module 1 and 4 of 4 on module 2 would
// skip module 1 without passing the module-2 rule; 87.5% closes that gap.
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.875 },
];
