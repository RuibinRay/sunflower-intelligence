// assess-final.js — M01 cumulative final: 25 items, every lesson at least twice; eight conceptual, eight numerical and
// nine applied. Many items combine lessons: Levitt’s myopia beside the new marketing myopia, a non-profit’s non-money
// price, lifetime value against the cost of the extra customers, the five orientations in one decision, three choice
// rules on one set of scores, habitual buying and learning, a PESTEL law → the default effect it removes, attitude change
// through the weighted-attribute model, a value proposition → the buying-centre roles that must believe it → the funnel
// objective that measures it, PESTEL changes → buying situations, a plan from situation analysis to measures, the timing
// behind a customer target, a growth objective → the new clients it needs → the lifetime value their acquisition creates,
// and lifetime value → acquisition spending → a generic strategy.
// New questions, not copies of lesson exercises, module-test, diagnostic or project items (none uses Lantern’s
// catering figures, Harbor Tech’s buying centre, Lantern’s SWOT or its strategy). No hints; solutions show in review.
// 70% passes. Every business, person and figure is fictional. Lifetime value uses the course’s timing: margins at the
// end of each year, the customer certain to be there for year 1, constant retention, so CLV = m ÷ (1 + d − r).

export const items = [
  // ---------------------------------------------------------------- what-is-marketing
  {
    id: 'm01-fn-1', lesson: 'what-is-marketing', type: 'num', kind: 'numerical',
    prompt: 'Elodie Marchetti (fictional) photographs weddings. The most a couple would pay for her coverage, rather than go without it, is $2,400, and delivering it costs her $1,200 in an assistant, travel and editing. At what price would the couple keep exactly a quarter of the value the exchange creates? Give dollars.',
    answer: 2100, check: () => 2400 - 0.25 * (2400 - 1200), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1500, say: 'At $1,500 Elodie keeps the quarter ($1,500 − $1,200 = $300) and the couple three-quarters. The couple keeps willingness to pay minus price.' },
      { value: 1800, say: 'That is three-quarters of the couple’s willingness to pay. The quarter is of the value created, $2,400 − $1,200 = $1,200, not of $2,400.' },
      { value: 300, say: 'That is the couple’s share in dollars. The question asks for the price that leaves them that share.' },
      { value: 900, say: 'That is Elodie’s gain at the right price. The question asks for the price itself.' },
    ],
    solution: 'Value created = willingness to pay − cost = $2,400 − $1,200 = $1,200. A quarter of it is $300, which the couple keeps when $2,400 − P = $300, so P = $2,100. Elodie then keeps $2,100 − $1,200 = $900, three-quarters. Any price between $1,200 and $2,400 leaves both sides better off; the price only decides how the $1,200 is shared.',
  },
  {
    id: 'm01-fn-2', lesson: 'market-orientation', type: 'mc', kind: 'conceptual',
    prompt: 'Theodore Levitt’s “marketing myopia” (1960) and Smith, Drumwright and Gentile’s “new marketing myopia” (2010) name two different mistakes. Which pair describes them correctly?',
    options: [
      'Levitt: defining a business by its product, not by the need it serves. New: a single-minded focus on customers that excludes other stakeholders',
      'Levitt: ignoring society’s long-term interests in the pursuit of sales. New: defining a business by the product it makes rather than by the need it serves',
      'Levitt: spending too little on advertising compared with rivals. New: spending too much on digital advertising and too little on understanding customers',
      'Levitt: trying to serve every customer in a market at once. New: serving so few customers that a business can never grow beyond a small niche',
    ],
    answer: 0,
    feedback: {
      1: 'This mixes them up. Defining a business by its product is Levitt’s idea, from 1960; the 2010 paper warned against attending to customers so single-mindedly that employees, neighbours and the environment are forgotten.',
      2: 'Neither idea is about advertising budgets. Levitt was writing about how a business defines what it does; the 2010 paper about whose interests it weighs.',
      3: 'Neither idea is about how many customers to serve. Myopia is about what a business thinks it is for, and whom it takes into account.',
    },
    solution: 'Levitt’s marketing myopia is defining a business by what it makes instead of the customer need it serves, which hides substitutes: the railroads saw themselves in the railroad business, not transportation. Smith, Drumwright and Gentile named a single-minded focus on customers, to the exclusion of other stakeholders such as employees, suppliers, neighbours and the environment, as one source of what they called “the new marketing myopia”. The first is cured by a need-based definition of the business; the second by the societal marketing concept.',
  },
  {
    id: 'm01-fn-3', lesson: 'what-is-marketing', type: 'mc', kind: 'applied',
    prompt: 'Thornfield Animal Rescue (fictional) asks a $90 adoption fee, less than half of what each adoption costs it. Many visitors say they would like to adopt a dog but leave without applying. In exit interviews they mention a 12-page application form, three home visits spread over six weeks and no weekend opening. The trustees propose cutting the fee to $40. What does the evidence suggest?',
    options: [
      'The main barrier is the non-money price of adopting, in time and effort; simplify the process before touching the fee',
      'The fee is the barrier: a lower price always turns a want into demand, so cutting it to $40 will bring in the adopters it needs',
      'Marketing ideas don’t apply here, because a charity sells nothing and the people who adopt are not its customers',
      'Visitors want a dog but have no real need for one, so the rescue should run a campaign that creates the need',
    ],
    answer: 0,
    feedback: {
      1: 'Nobody in the interviews mentioned the fee, and halving it would deepen the rescue’s loss on every adoption. Demand depends on the whole price to the adopter, and here most of that price is time and effort.',
      2: 'Kotler and Levy argued that non-profits face the same marketing tasks as firms. The rescue seeks a desired response, an adoption, and offers value in exchange for a fee, time and effort.',
      3: 'Marketing doesn’t create needs. These visitors already want to adopt; what stops them is the cost of acting on the want.',
    },
    solution: 'An adoption is an exchange: the adopter gives a fee, time and effort, and gets a dog and the satisfaction of giving it a home. Demand is a want backed by the ability and willingness to pay the whole price, and the exit interviews point to its non-money part: a long form, six weeks of visits and no weekend opening. A shorter form, visits bunched into a week or two and Saturday opening would lower that price without cutting income; halving the fee would cut income and leave the barriers in place. The rescue should then check whether applications rise, against a baseline such as the same months last year.',
  },

  // ---------------------------------------------------------------- customer-value
  {
    id: 'm01-fn-4', lesson: 'customer-value', type: 'num', kind: 'numerical',
    prompt: 'Bexley Pest Control (fictional) earns a margin of $300 a year from a typical household contract; 70% of households renew each year, and it discounts future money at 10% a year. The owner’s spreadsheet counts each year’s margin at the start of the year, so the first arrives the day a contract is signed; this course counts it at the end of the year. Everything else is the same. How much higher is the spreadsheet’s lifetime value than the course’s? Give dollars.',
    answer: 75, check: () => 300 * 1.10 / 0.40 - 300 / 0.40, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 825, say: 'That is the spreadsheet’s lifetime value. Subtract the course’s $750.' },
      { value: 27.27, say: 'That moves only the first margin. Every later margin also arrives a year earlier, so the whole stream is worth 1.10 times as much.' },
      { value: 300, say: 'Counting at the start of the year doesn’t add a margin; it receives each one a year sooner.' },
    ],
    solution: 'The course’s convention: CLV = m ÷ (1 + d − r) = 300 ÷ (1 + 0.10 − 0.70) = 300 ÷ 0.40 = $750. Receiving every margin a year earlier multiplies the whole stream by 1 + d, so the spreadsheet shows 750 × 1.10 = $825. The gap, $75, comes from timing alone. Compare lifetime values only when they use the same convention, and say which one you use.',
  },
  {
    id: 'm01-fn-5', lesson: 'customer-value', type: 'mc', kind: 'applied',
    prompt: 'Brisk IT Repairs (fictional) fixes laptops for small offices. Its records show that about 40% of repairs are finished within 4 hours and 97% within 24 hours. Which value proposition is most likely to leave its clients satisfied?',
    options: [
      'For small offices: your laptop back within 24 hours, or the repair is free',
      'For small offices: your laptop repaired within 4 hours, guaranteed, or the repair is free',
      'The fastest, friendliest and most reliable laptop repairs anywhere in the city',
      'Repairs for every laptop, phone and tablet, for homes and offices, at prices to suit every budget',
    ],
    answer: 0,
    feedback: {
      1: 'It names the customers and gives a guarantee, but Brisk misses 4 hours on about 60% of repairs. The promise sets the expectation, so most clients would experience negative disconfirmation, and Brisk would give most repairs away.',
      2: 'Any rival can say this, nobody can check it, and Brisk’s records don’t support “fastest”. It gives clients no reason to believe.',
      3: 'Trying to serve everyone gives no one a reason to choose Brisk, and it promises no particular benefit.',
    },
    solution: 'A value proposition names the customers, the benefit and a reason to believe, and it sets the expectations that satisfaction is judged against (expectation disconfirmation). Brisk keeps a 24-hour promise on 97% of repairs, so most clients get what they were promised or better, many of them far sooner, and the guarantee is affordable on the 3% it misses. A 4-hour promise would turn the same service into a disappointment for most clients. Promise what you can deliver every time, then deliver it.',
  },
  {
    id: 'm01-fn-6', lesson: 'customer-value', type: 'num', kind: 'numerical',
    prompt: 'Larchmere Wines (fictional), an online wine club, spent $4,000 on social-media advertising in March and won 50 new members. In April it spent $8,000 and won 70. A member brings a margin of $60 a year, 60% renew each year, and the club discounts at 10% a year; assume the extra members are like the others. What is a member’s lifetime value minus the cost of each extra member that the extra spending won? Give dollars, with a minus sign if negative.',
    answer: -80, check: () => 60 / (1 + 0.10 - 0.60) - (8000 - 4000) / (70 - 50), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 5.71, say: 'That uses April’s average cost per member, $8,000 ÷ 70 ≈ $114.29. The question is about the extra members: the extra $4,000 won only 20 more.' },
      { value: 40, say: 'That uses March’s cost per member, $80. The extra spending won 20 extra members at $4,000 ÷ 20 = $200 each.' },
      { value: 80, say: 'Check the sign: the lifetime value, $120, is less than the $200 each extra member cost.' },
      { value: -50, say: 'That leaves out discounting: 60 ÷ (1 − 0.60) = $150. Use 1 + d − r = 0.50, which gives $120.' },
    ],
    solution: 'Lifetime value: 60 ÷ (1 + 0.10 − 0.60) = 60 ÷ 0.50 = $120. The extra spending, $8,000 − $4,000 = $4,000, won 70 − 50 = 20 extra members: $200 each, the marginal acquisition cost. $120 − $200 = −$80, so each extra member is worth $80 less than it cost. The averages hide this: April’s average cost, about $114, is below the lifetime value. Before spending $8,000 again, the club should find out whether the extra members differ from the first 50, or go back to March’s level.',
  },

  // ---------------------------------------------------------------- market-orientation
  {
    id: 'm01-fn-7', lesson: 'market-orientation', type: 'classify', kind: 'conceptual',
    prompt: 'Oakleigh Freight (fictional), a haulage firm, describes six of its practices. Which part of Narver and Slater’s account of market orientation does each mainly show?',
    items: [
      'Account managers spend a day at each major client’s warehouse twice a year, to see what goes wrong at its loading bays',
      'For every tender it loses, the firm records which rival won it and at what price',
      'Sales, the depot and finance meet each month to plan how to serve the largest accounts',
      'It turned down a three-year contract that would have raised this year’s revenue but lost money over its life',
      'Drivers’ notes on clients’ complaints go straight to the planners who set the routes',
      'When a rival started running electric trucks, Oakleigh asked what that rival could offer clients next year',
    ],
    categories: ['Customer orientation', 'Competitor orientation', 'Inter-functional coordination', 'Decision criterion: long-term focus and profitability'],
    answer: [0, 1, 2, 3, 2, 1],
    feedback: {
      0: 'Seeing at first hand how clients receive the service is understanding target customers well enough to keep creating value for them: customer orientation.',
      3: 'Giving up revenue now to avoid losses later applies Narver and Slater’s two decision criteria: a long-term focus and profitability.',
      4: 'What one function hears (the drivers) reaches the one that can act on it (route planning): the whole business working to serve customers.',
      5: 'Asking what a current or potential rival can and is likely to do is competitor orientation.',
    },
    solution: 'Narver and Slater (1990) described three behavioural components, customer orientation, competitor orientation and inter-functional coordination, guided by two decision criteria, a long-term focus and profitability. The warehouse visits are customer orientation; the lost-tender records and the question about the electric trucks are competitor orientation; the monthly meeting and the drivers’ notes reaching the planners are inter-functional coordination; turning down the loss-making contract applies the decision criteria.',
  },
  {
    id: 'm01-fn-8', lesson: 'market-orientation', type: 'mc', kind: 'applied',
    prompt: 'Ferrous Ink (fictional) makes printer cartridges for offices. Its customers keep asking for cheaper cartridges. Its sales team also reports that two rivals have launched printers with refillable ink tanks, and that clients print less every year. Which response is most market-oriented?',
    options: [
      'Share the findings with product and finance, study where office printing is heading, then decide what to offer',
      'Cut cartridge prices by 15%, since lower prices are what customers ask for most often and most loudly',
      'Invest in cartridges that print sharper text, so that a better product wins back customers from the rivals',
      'Pay the sales team bigger bonuses on cartridge sales, so that they push harder against the rivals’ refillable printers',
    ],
    answer: 0,
    feedback: {
      1: 'Doing what customers ask most loudly is being customer-led. A price cut may slow the loss of customers, but it doesn’t answer the change in how offices print, and rivals can match it.',
      2: 'This is the product concept, and a route to myopia: a sharper cartridge improves the product that customers are leaving for refillable tanks and printing less with.',
      3: 'This is the selling concept: pushing harder what the firm already makes. Bonuses don’t change what customers will need next.',
    },
    solution: 'Kohli and Jaworski’s market orientation covers customers’ future needs and the forces that shape them, including competitors and technology, not only today’s requests. The sales team has generated that intelligence; sharing it with product and finance and studying the trend lets the whole business respond with a long-term view. The answer might be refillable printers of its own, a managed printing service or a planned exit from part of the market, but it rests on where the market is going. The other options respond only to the loudest request, to the product, or to the sales target.',
  },

  // ---------------------------------------------------------------- consumer-decisions
  {
    id: 'm01-fn-9', lesson: 'consumer-decisions', type: 'fill', kind: 'numerical',
    prompt: 'Odile is choosing between three fictional e-readers. She weights screen quality 0.5, battery life 0.3 and price 0.2, and scores each out of 10, higher always better: the Papyra ($240) 9, 5 and 4; the Scrivo ($180) 7, 8 and 6; the Leafline ($120) 6, 7 and 9. Complete the sentences.',
    text: 'Under the weighted-attribute model Odile chooses [[0]]. If she uses a lexicographic rule instead, she chooses [[1]]. If she refuses to pay more than $150, whatever the scores, she chooses [[2]]. The weighted-attribute model is compensatory; the other two rules are [[3]].',
    blanks: [
      { options: ['the Papyra', 'the Scrivo', 'the Leafline'], answer: 1 },
      { options: ['the Papyra', 'the Scrivo', 'the Leafline'], answer: 0 },
      { options: ['the Papyra', 'the Scrivo', 'the Leafline'], answer: 2 },
      { options: ['non-compensatory', 'compensatory', 'weighted'], answer: 0 },
    ],
    solution: 'Weighted scores: Papyra 0.5 × 9 + 0.3 × 5 + 0.2 × 4 = 4.5 + 1.5 + 0.8 = 6.8; Scrivo 3.5 + 2.4 + 1.2 = 7.1; Leafline 3.0 + 2.1 + 1.8 = 6.9. The Scrivo leads. A lexicographic rule picks the best option on the most important attribute, screen quality, and looks further only to break a tie: the Papyra, with 9. A $150 cut-off is a conjunctive rule that removes the Papyra and the Scrivo before anything is weighed, leaving the Leafline. Under both non-compensatory rules a weakness can’t be made up by strengths elsewhere, so the same scores lead to three different choices.',
  },
  {
    id: 'm01-fn-10', lesson: 'consumer-decisions', type: 'mc', kind: 'applied',
    prompt: 'Oatlands (fictional) launches a new oat drink. Most shoppers in its target market buy the market leader’s oat drink every week without looking at the others, and see little difference between brands. Which plan suits this kind of buying best?',
    options: [
      'Break the habit with free samples and a trial price, then make the pack easy to spot on the next visit',
      'Publish detailed comparison tables of protein, sugar and price, for shoppers to study before they buy',
      'Send reassuring emails after each purchase, to ease buyers’ doubts about the choice they have just made',
      'Launch a new flavour every month, because shoppers like these switch brands for the sake of a change',
    ],
    answer: 0,
    feedback: {
      1: 'Comparison tables suit complex buying, with high involvement and real differences. These shoppers don’t search or compare: they reach for the usual carton.',
      2: 'Reassurance after the sale suits dissonance-reducing buying, where an important choice is followed by doubt. A weekly carton raises no such doubt, and Oatlands’ problem is being tried at all.',
      3: 'Monthly novelty suits variety-seeking buyers, who switch for a change. These shoppers buy the same brand every week.',
    },
    solution: 'Low involvement and little perceived difference make this habitual buying, and habits come from learning: each satisfying purchase reinforces the response. A challenger has to interrupt the loop with a reason to try (a sample, a trial price), then make the new habit easy to form: a recognisable pack, stocked where shoppers look, so that a good first experience is reinforced on the next visit.',
  },

  // ---------------------------------------------------------------- influences-on-buying
  {
    id: 'm01-fn-11', lesson: 'influences-on-buying', type: 'num', kind: 'numerical',
    prompt: 'Tarn Fitness (fictional), a workout app, wins 1,200 subscribers through advertising and wants referrals to bring the long-run total to 1,500. Using the referral multiplier, what average number of new subscribers must each new subscriber refer? Give two decimal places.',
    answer: 0.2, check: () => 1 - 1200 / 1500, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.25, say: 'That would be enough if only the first round of referrals counted (300 ÷ 1,200). Referred subscribers refer others too, so a lower rate reaches 1,500: N ÷ (1 − r) = 1,500.' },
      { value: 0.8, say: 'That is 1 − r, the ratio 1,200 ÷ 1,500. The referral rate is 1 − 0.8.' },
      { value: 1.25, say: 'That is the long-run multiplier, 1,500 ÷ 1,200. The multiplier is 1 ÷ (1 − r), so r = 1 − 1 ÷ 1.25.' },
      { value: 300, say: 'That is the number of referred subscribers needed. The question asks for the rate per new subscriber.' },
    ],
    solution: 'The long-run total is T = N ÷ (1 − r), so 1 − r = N ÷ T = 1,200 ÷ 1,500 = 0.8, and r = 0.20. Check: 1,200 + 240 + 48 + 9.6 + … approaches 1,200 ÷ 0.8 = 1,500. Before relying on the 300 referred subscribers, ask how many would have joined anyway: only the incremental ones add value.',
  },
  {
    id: 'm01-fn-12', lesson: 'influences-on-buying', type: 'mc', kind: 'applied',
    prompt: 'A fictional country passes a consumer-protection law: from next year, online shops may not pre-select paid add-ons at the checkout, so customers must tick any add-on themselves. Gantry Electronics (fictional) pre-selects $6 delivery insurance, and 70% of its buyers keep it. What should Gantry expect when the law takes effect?',
    options: [
      'A large fall in take-up: the law removes a default, and defaults stick through effort, endorsement and loss aversion',
      'Little change: the 70% chose the insurance freely, since every buyer could untick the box at any time',
      'A rise in take-up: buyers who have to choose the insurance actively will value it more, so more will buy it',
      'Little change: a legal factor in PESTEL affects the shop’s costs, but it doesn’t change how its customers make their choices',
    ],
    answer: 0,
    feedback: {
      1: 'Defaults are not neutral. Changing one takes effort, people read it as a recommendation, and it becomes the reference point, so many of the 70% kept the insurance without really choosing it.',
      2: 'Making a choice active doesn’t make the insurance worth more. In Johnson and Goldstein’s experiment, agreement was about twice as high when people had to opt out as when they had to opt in.',
      3: 'Macroenvironmental forces act on customers as well as on costs. This law changes how the choice is presented at the checkout, which is exactly what drives take-up.',
    },
    solution: 'The law is a legal factor in Gantry’s macroenvironment, and its effect runs through buyer behaviour. While the insurance is pre-selected, effort, implied endorsement and loss aversion keep many buyers on it; once they must opt in, take-up should fall sharply (in Johnson and Goldstein’s different setting, opt-in agreement was about half the opt-out rate). Gantry can estimate the effect before the law arrives with an A/B test of an unticked box, and its situation analysis should treat the change as a high-impact, near-certain threat to add-on revenue.',
  },
  {
    id: 'm01-fn-13', lesson: 'influences-on-buying', type: 'fill', kind: 'conceptual',
    prompt: 'Helmshore Helmets (fictional) wants more cyclists to choose its helmets, which are the best ventilated on the market. In terms of the weighted-attribute model, what does each action try to change?',
    text: 'Publishing independent crash tests in which its helmets beat rivals’ changes [[0]]. A campaign explaining why ventilation matters on long summer rides changes [[1]]. A helmet with a built-in rear light, a feature buyers had never thought about, changes [[2]]. Telling cyclists that a rival’s helmets fail safety tests would change [[3]], and is acceptable only if the claim is true and fair.',
    blanks: [
      { options: ['buyers’ beliefs about Helmshore (its scores)', 'the importance of an attribute (its weight)', 'the attributes buyers consider'], answer: 0 },
      { options: ['buyers’ beliefs about Helmshore (its scores)', 'the importance of an attribute (its weight)', 'the attributes buyers consider'], answer: 1 },
      { options: ['buyers’ beliefs about Helmshore (its scores)', 'the importance of an attribute (its weight)', 'the attributes buyers consider'], answer: 2 },
      { options: ['buyers’ beliefs about a competitor', 'the importance of an attribute', 'the attributes buyers consider'], answer: 0 },
    ],
    solution: 'An attitude towards a brand rests on what buyers believe about each option (the scores) and how much each attribute matters to them (the weights). The crash tests raise Helmshore’s score on safety. The ventilation campaign raises the weight of an attribute on which Helmshore already scores best. The rear light adds an attribute to the evaluation. Changing beliefs about a competitor is the fourth route and the riskiest: it must rest on claims that are true and fair.',
  },

  // ---------------------------------------------------------------- business-buying
  {
    id: 'm01-fn-14', lesson: 'business-buying', type: 'fill', kind: 'applied',
    prompt: 'Fennimore Learning (fictional) sells an online course on handling medicines safely to groups of care homes. Its value proposition: “Every care worker trained in 90 minutes on a phone, with records ready for inspectors, for $8 a worker a month.” At Mapleton Care Homes (fictional), the training manager asked for a better course after a poor inspection; about 600 care workers would take it; the compliance officer checks every course against the inspectors’ standards; and the finance director approves any contract above $20,000 a year. Complete Fennimore’s account plan.',
    text: 'The training manager, who asked for a better course after the inspection, is the [[0]]. “90 minutes on a phone” matters most to the [[1]], who will fit the course between shifts. The compliance officer, who must be satisfied that the records really are ready for inspectors, acts as [[2]]. An annual contract would be worth [[3]], so the price must convince the [[4]], who decides. To check whether the proposition persuades care homes that are already weighing it up, Fennimore should set an objective for [[5]].',
    blanks: [
      { options: ['initiator', 'decider', 'gatekeeper'], answer: 0 },
      { options: ['deciders', 'users', 'gatekeepers'], answer: 1 },
      { options: ['a gatekeeper', 'the initiator', 'an influencer'], answer: 2 },
      { options: ['$4,800', '$96', '$57,600'], answer: 2 },
      { options: ['training manager', 'finance director', 'compliance officer'], answer: 1 },
      { options: ['awareness: the share of care-home managers who know its name', 'conversion: the share of proposals that become signed contracts', 'retention: the share of clients still subscribing after a year'], answer: 1 },
    ],
    solution: 'The training manager started the purchase: the initiator. The care workers will use the course, so the speed and the phone matter most to them. The compliance officer shapes the choice without making it, and can stop a course that fails the inspectors’ standards: an influencer, with something close to a veto. 600 workers × $8 × 12 months = $57,600 a year ($4,800 is one month; $96 is one worker for a year), above the $20,000 limit, so the finance director is the decider and needs the economic case. A value proposition has to be believed by every role it speaks to. Whether it persuades homes that are already considering the course shows at the conversion stage of the funnel: the share of proposals or trials that become contracts, tracked against a target with a date.',
  },
  {
    id: 'm01-fn-15', lesson: 'business-buying', type: 'num', kind: 'numerical',
    prompt: 'Hopwood Brewery (fictional) is choosing between two pumps for its bottling line, each expected to last 5 years. Pump A costs $3,000, with maintenance of $400 a year and electricity of $900 a year. Pump B costs $3,800, with maintenance of $250 a year and electricity of $700 a year. Ignoring discounting, by how much is Pump B’s total cost of ownership over the 5 years lower than Pump A’s? Give dollars, with a minus sign if B costs more.',
    answer: 950, check: () => (3000 + 5 * (400 + 900)) - (3800 + 5 * (250 + 700)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -800, say: 'That compares purchase prices only. Total cost of ownership adds five years of maintenance and electricity.' },
      { value: 1750, say: 'That is the running-cost saving alone (5 × $350). Pump B also costs $800 more to buy.' },
      { value: -450, say: 'That counts only one year of running costs. Each pump is used for 5 years.' },
      { value: 350, say: 'That is one year’s saving in running costs. Count all 5 years and the difference in purchase price.' },
    ],
    solution: 'Pump A: $3,000 + 5 × ($400 + $900) = $3,000 + $6,500 = $9,500. Pump B: $3,800 + 5 × ($250 + $700) = $3,800 + $4,750 = $8,550. B costs $950 less over its life, although its price is $800 higher. That is why business buyers look at total cost of ownership, and why B’s supplier should put the five-year figures in front of the decider. Discounting the later savings would narrow the gap a little without reversing it.',
  },
  {
    id: 'm01-fn-16', lesson: 'business-buying', type: 'classify', kind: 'conceptual',
    prompt: 'A change in an organisation’s environment often leads to a purchase. Which buying situation does each change lead to?',
    items: [
      'A new food-safety rule requires allergen labels on every dish, so a school district re-tenders its catering contract with a new specification',
      'A city will ban diesel vans from its centre from 2028, so a courier that has only ever run diesel vans buys charging points for its depot for the first time',
      'Interest rates rise, but a hospital keeps reordering printer paper from its usual supplier on the same terms',
      'A sharp rise in the price of steel leads a builder to ask its usual supplier and two others to quote again for steel beams',
      'A government grant for rooftop solar panels leads a warehouse firm to buy solar panels for the first time',
    ],
    categories: ['Straight rebuy', 'Modified rebuy', 'New task'],
    answer: [1, 2, 0, 1, 2],
    feedback: {
      0: 'The district has bought catering before, but the rule changes the specification and reopens the choice of supplier: a modified rebuy.',
      2: 'Not every PESTEL change reaches every purchase. The paper is reordered unchanged: a straight rebuy.',
      3: 'The beams have been bought before, but the price shock has reopened the choice of supplier: a modified rebuy.',
    },
    solution: 'Legal (the allergen rule, the diesel ban), economic (interest rates, steel prices) and political (the grant) changes can reopen routine purchases or create new ones. The catering contract and the steel beams are modified rebuys; the charging points and the solar panels are new tasks; the paper is still a straight rebuy. A supplier that watches its customers’ macroenvironment can see a modified rebuy or a new task coming, and be there in time to help shape the specification.',
  },

  // ---------------------------------------------------------------- situation-analysis
  {
    id: 'm01-fn-17', lesson: 'situation-analysis', type: 'order', kind: 'conceptual',
    prompt: 'Linwood Physiotherapy (fictional) is writing next year’s marketing plan. Put its work in a sensible order.',
    items: [
      'Review last year’s patient numbers, the referrals it lost and a PESTEL scan of its area',
      'Summarise what it found in a SWOT, with evidence for every item',
      'Set objectives: 220 new patients, and 80% of patients completing their course of treatment, by December',
      'Choose how to compete: become the area’s specialist in sports injuries for amateur athletes',
      'Plan this quarter’s tactics: an open evening for running clubs and referral cards for local gyms',
      'Track new patients and completion each month, and feed the results into next year’s review',
    ],
    solution: 'A marketing plan answers four questions in order. Where are we now? The review, and the SWOT that summarises it. Where do we want to be? Objectives, which need the starting point the review gives. How will we get there? First the strategy, then the tactics that carry it out. How will we know? The measures, which feed the next situation analysis. Setting objectives before the review, or choosing tactics before the strategy, lets what the owner already believes decide the plan.',
  },
  {
    id: 'm01-fn-18', lesson: 'situation-analysis', type: 'rows', kind: 'applied',
    prompt: 'Dunescape Holiday Parks (fictional) scored eight PESTEL factors from 1 to 5 for their impact on the business and their likelihood over the next year. It will discuss only the factors whose priority, impact × likelihood, is at least 12. Select every factor it will discuss.',
    data: { table: {
      head: ['Factor', 'PESTEL', 'Impact', 'Likelihood'],
      rows: [
        ['A proposed tax on overnight stays in the region', 'Political', '4', '3'],
        ['Rising interest rates squeezing household budgets', 'Economic', '5', '4'],
        ['More families holidaying outside the school summer break', 'Social', '3', '3'],
        ['Booking apps that let guests check in by phone', 'Technological', '2', '5'],
        ['More frequent summer storms on the coast', 'Environmental', '4', '4'],
        ['A new law requiring fire-safety checks on every caravan', 'Legal', '3', '5'],
        ['A possible change to the national holiday calendar', 'Political', '5', '2'],
        ['Higher fuel prices for guests driving to the coast', 'Economic', '3', '4'],
      ],
    } },
    answer: [0, 1, 4, 5, 7],
    solution: 'Priority = impact × likelihood: tourist tax 4 × 3 = 12; interest rates 5 × 4 = 20; off-peak holidays 3 × 3 = 9; phone check-in 2 × 5 = 10; storms 4 × 4 = 16; fire-safety law 3 × 5 = 15; holiday calendar 5 × 2 = 10; fuel prices 3 × 4 = 12. Five factors reach 12, two of them exactly. The factor with the highest impact (the holiday calendar) ranks low because it is unlikely, and a near-certain one (phone check-in) because it matters little. The scores are judgements, recorded so that they can be challenged. Because the product is only a rough ranking, the lesson advises reviewing high-impact factors separately: the holiday calendar misses the cut-off but would hurt most if it happened, so it deserves a separate look. Whether each factor is an opportunity or a threat for Dunescape is decided in the SWOT.',
  },
  {
    id: 'm01-fn-19', lesson: 'situation-analysis', type: 'classify', kind: 'conceptual',
    prompt: 'Selbourne Bikes (fictional), an e-bike shop, has this SWOT. Strength: the town’s only certified e-bike mechanic. Weakness: a showroom with room for only six bikes. Opportunity: the council is building 20 km of new cycle lanes. Threat: an online retailer sells the same e-bikes 15% cheaper. Which TOWS pairing does each option come from?',
    items: [
      'Rent a larger showroom, so the shop can stock enough bikes for the riders the new lanes will bring',
      'Offer a year’s free servicing with every bike bought in the shop, which the online retailer can’t match',
      'Stock only a few models the online retailer doesn’t sell, so the small showroom avoids head-on price comparison',
      'Run rides to open the new lanes, with the mechanic checking every bike, to win the riders the lanes attract',
    ],
    categories: ['SO', 'ST', 'WO', 'WT'],
    answer: [2, 1, 3, 0],
    feedback: {
      0: 'The small showroom is a weakness; fixing it to serve the riders the lanes bring is WO.',
      1: 'The mechanic is a strength, and the free servicing uses it against the online retailer’s lower price: ST.',
      2: 'The small showroom (a weakness) meets the cheaper online rival (a threat); the option limits the damage where they meet: WT.',
    },
    solution: 'TOWS pairs the boxes of a SWOT. SO uses a strength to take an opportunity (the mechanic and the new lanes); ST uses a strength to counter a threat (servicing the online retailer can’t offer); WO fixes a weakness to take an opportunity (a bigger showroom for the new riders); WT limits the damage where a weakness meets a threat (a narrow range the online retailer doesn’t sell). The matrix produces options to evaluate against the shop’s objectives, not a decision.',
  },

  // ---------------------------------------------------------------- marketing-objectives
  {
    id: 'm01-fn-20', lesson: 'marketing-objectives', type: 'fill', kind: 'numerical',
    prompt: 'Quarry Hill Accountants (fictional) wants $54,000 a year more revenue from new clients. Each pays $4,500 a year, billed monthly from the month it signs, and new clients sign evenly through the year. Complete the plan.',
    text: 'To receive the extra $54,000 within this year, the firm must win about [[0]] new clients. To be billing at a rate $54,000 a year higher by 31 December, it must win [[1]]. Its objective should [[2]].',
    blanks: [
      { options: ['12', '24', '6'], answer: 1 },
      { options: ['24', '6', '12'], answer: 2 },
      { options: ['say which of the two it means', 'use the larger number, to be safe', 'use the average of the two numbers'], answer: 0 },
    ],
    solution: 'Clients who sign evenly through the year pay, on average, for about half of it, so each brings in about $4,500 × 0.5 = $2,250 this year: $54,000 ÷ $2,250 = 24 clients to receive the money within the year. To be billing $54,000 a year more by 31 December, each new client counts at its full $4,500 a year: $54,000 ÷ $4,500 = 12. Both are right answers to different questions, so the objective must say which it means; mixing them halves or doubles the work. A larger or averaged number is not a definition.',
  },
  {
    id: 'm01-fn-21', lesson: 'marketing-objectives', type: 'num', kind: 'applied',
    prompt: 'Rennick & Shaw (fictional), a payroll bureau, starts the year with 300 clients and expects a fifth of them to leave during it. It wants to end the year with 330 clients, at the same fees. A client brings a margin of $1,200 a year, the bureau discounts future money at 10% a year, and winning a client costs about $400 in sales time and free trials. Counting each new client’s lifetime value (the course’s formula) when it is won, how much value does the year’s acquisition create after its cost? Give dollars.',
    answer: 324000, check: () => 300 * (1.10 - 0.80) * (1200 / (1 + 0.10 - 0.80) - 400), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 360000, say: 'That leaves out the $36,000 it costs to win the 90 clients ($400 each).' },
      { value: 108000, say: 'That counts only the 30 clients of growth. The 60 clients who replace those lost must be won too, and each is worth the same.' },
      { value: 504000, say: 'That leaves out discounting: 1,200 ÷ (1 − 0.80) = $6,000. Use 1 + d − r = 0.30, which gives $4,000.' },
      { value: 3600, say: 'That is the value created by one new client. The bureau must win 90.' },
    ],
    solution: 'Clients kept: 300 × 0.80 = 240, so new clients: 330 − 240 = 90, of whom 60 replace those lost. Each new client’s lifetime value: 1,200 ÷ (1 + 0.10 − 0.80) = 1,200 ÷ 0.30 = $4,000, or $3,600 after the $400 it costs to win. Value created: 90 × $3,600 = $324,000, after acquisition spending of 90 × $400 = $36,000. The spending pays, but two-thirds of it only replaces lost clients: each point of retention saves 3 clients and $1,200 of acquisition spending.',
  },
  {
    id: 'm01-fn-22', lesson: 'marketing-objectives', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these practices make a set of marketing objectives more reliable? Select all that apply.',
    options: [
      'Planning staff and stock around the forecast, and treating the target as the stretch above it',
      'Adding the funnel’s stage-to-stage conversion rates to find the share of leads that become customers',
      'Pairing each acquisition target with a guardrail, such as the share of new customers still buying after a year',
      'Setting fifteen or more objectives, so that every part of the business, down to each small team, has a target of its own',
      'Building the target top-down from the goal and bottom-up from past results, and explaining any gap',
      'Comparing a twelve-month target with last year’s ten-month total to show the growth needed',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Conversion rates multiply. If 30% of leads reach a proposal and 25% of proposals are won, 7.5% of leads become customers, not 55%.',
      3: 'Long lists of objectives conflict and are quietly ignored. Three to five, consistent with each other and each with an owner, steer a business better.',
      5: 'Compare equal periods: annualise last year’s total or compare the same months. Otherwise the target looks far harder than it is.',
    },
    solution: 'A target is not a forecast, so resources follow the forecast and the target is the stretch. Guardrails stop a target being met in ways that damage the business, as Goodhart’s law predicts. Setting the level top-down and bottom-up shows whether the plan names what will close any gap. Rates along a funnel multiply; long lists of objectives are ignored; and periods must be equal before they are compared.',
  },

  // ---------------------------------------------------------------- competitive-advantage
  {
    id: 'm01-fn-23', lesson: 'competitive-advantage', type: 'num', kind: 'numerical',
    prompt: 'A rival bakery sells a celebration cake for $50, and a typical customer would pay up to $58 for it. Delphine’s Patisserie (fictional) wants to charge a 30% premium over the rival’s price. How much more must the typical customer value Delphine’s cake than the rival’s for that price still to leave her at least as well off as the rival’s cake does? Give dollars.',
    answer: 15, check: () => (50 * 1.30 + (58 - 50)) - 58, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 30, say: 'That is the premium as a percentage. In dollars, 30% of the rival’s $50 is $15.' },
      { value: 7, say: 'You compared Delphine’s $65 price with what the customer would pay for the rival’s cake. Compare value with value: what she would pay for each cake.' },
      { value: 73, say: 'That is what the customer must be willing to pay for Delphine’s cake. The question asks how much more than the rival’s $58 that is.' },
      { value: 23, say: 'That compares the $73 Delphine’s cake must be worth with the rival’s price. Compare it with what the customer would pay for the rival’s cake, $58.' },
    ],
    solution: 'A 30% premium on $50 is a price of $65. The rival leaves the customer $58 − $50 = $8, so Delphine must leave her at least $8 too: the cake must be worth at least $65 + $8 = $73 to her, which is $73 − $58 = $15 more than the rival’s. Equivalently, the highest winning price is the rival’s price plus the gap in willingness to pay, so that gap must be at least the $15 price gap. The premium must also cover any extra cost of making the better cake.',
  },
  {
    id: 'm01-fn-24', lesson: 'competitive-advantage', type: 'mc', kind: 'applied',
    prompt: 'Damask Linen (fictional) supplies table linen to restaurants. A fine-dining restaurant brings it a margin of $2,400 a year, 85% of them stay each year, and winning one costs about $1,500 in samples and visits. A café brings $600 a year, 50% stay, and winning one costs about $500. A larger rival undercuts Damask’s prices for cafés. Damask discounts at 10% a year. What do the numbers support?',
    options: [
      'Concentrate on fine dining: each is worth about $9,600 against $1,500 to win, which supports a differentiation focus',
      'Match the rival’s prices for cafés: there are far more of them, and winning that volume will bring Damask’s costs down',
      'Spend the same on winning each kind of client, because a café is worth about as much to Damask as a restaurant',
      'Stop chasing fine-dining clients: at $1,500 each they cost three times as much to win as cafés do',
    ],
    answer: 0,
    feedback: {
      1: 'Matching a larger rival’s price without its cost base hands margin to customers, and the rival can cut again. Volume lowers costs only if Damask can win it, and cafés are the less valuable clients.',
      2: 'A café is worth 600 ÷ (1 + 0.10 − 0.50) = $1,000 over its life; a fine-dining client 2,400 ÷ 0.25 = $9,600. They are far from equal.',
      3: 'Acquisition cost means little without lifetime value. A fine-dining client is worth 6.4 times what it costs to win; a café only twice.',
    },
    solution: 'Lifetime values: fine dining 2,400 ÷ (1 + 0.10 − 0.85) = 2,400 ÷ 0.25 = $9,600, or $8,100 after the $1,500 to win one; cafés 600 ÷ (1 + 0.10 − 0.50) = 600 ÷ 0.60 = $1,000, or $500 net. Fine-dining clients are worth far more and justify more spending to win them. Serving them with what they value, at a premium, rather than fighting a larger rival on price for cafés, is a differentiation focus. Cafés need not be turned away, but they shouldn’t be won with price cuts the rival can always beat. The figures are estimates, so the strategy should be checked as clients are won and kept.',
  },
  {
    id: 'm01-fn-25', lesson: 'competitive-advantage', type: 'classify', kind: 'conceptual',
    prompt: 'A good position is relevant to the target customers, distinct from rivals’ positions, credible given what the business delivers, and consistent across everything customers see. Which test does each fictional positioning most clearly fail?',
    items: [
      'A budget hotel chain calls itself “the luxury choice for business travellers”, but its rooms have no desks and guests rate them 2 out of 5',
      'A tutoring firm aimed at parents of pupils facing exams promotes the comfort of the sofas in its waiting room',
      'Three plumbers in the same town all advertise themselves as “friendly, reliable and good value”',
      'An outdoor brand’s adverts promise tough gear for serious mountaineers, while its website sells the same jackets as city fashion at half price',
    ],
    categories: ['Relevant', 'Distinct', 'Credible', 'Consistent'],
    answer: [2, 0, 1, 3],
    feedback: {
      0: 'The claim may even be unusual, but what the hotel delivers contradicts it: it isn’t credible.',
      1: 'Comfortable sofas may be true and even unusual, but parents choose a tutor for results: the position isn’t relevant to them.',
      2: 'Each claim may be true, but all three make it, so none gives customers a reason to choose it: not distinct.',
      3: 'Two messages to different customers pull against each other: the position isn’t consistent.',
    },
    solution: 'Positioning is the place a business wants its offer to hold in target customers’ minds, relative to rivals. It works only if it matters to those customers (relevant), differs from what rivals claim (distinct), matches what the business actually delivers (credible) and is the same wherever customers meet it (consistent). M05 Market Segmentation and Positioning teaches how to choose and test one.',
  },
];
