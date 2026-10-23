// assess-m1.js — M01 module 1 test: What marketing is (what-is-marketing, customer-value, market-orientation).
// No hints. Each item has a full solution, shown when the student reviews the test. All businesses and figures are
// fictional. Lifetime value uses the module's timing: margins at the end of each year, the customer certain to be there
// for year 1, constant retention, so CLV = m ÷ (1 + d − r).

export const items = [
  {
    id: 'm01-m1-1', lesson: 'what-is-marketing', type: 'mc', kind: 'conceptual',
    prompt: 'The AMA defines marketing as creating, communicating, delivering and exchanging offerings that have value for “customers, clients, partners, and society at large”. Which of these fictional offers most clearly fails that definition, even though it sells well?',
    options: [
      'A cheap snack that sells partly because its label hides how much salt it contains',
      'A premium coffee subscription that only a few hundred enthusiasts in the city ever buy',
      'A free museum exhibition paid for by donations rather than ticket sales',
      'A catering contract negotiated at a discount for one large business client',
    ],
    answer: 0,
    feedback: {
      1: 'A small market is not a failure of the definition: the offer can still have value for the customers who choose it.',
      2: 'Marketing doesn’t require a price: the exhibition exchanges value with visitors and donors.',
      3: 'A negotiated discount for a business client is an ordinary B2B exchange that both sides choose freely.',
    },
    solution: 'The definition asks for value for customers and for society at large. A snack that sells by hiding its salt content misleads its buyers and harms them, so it fails on both counts, however well it sells. Small markets, non-profit offers and negotiated B2B prices are all compatible with the definition.',
  },
  {
    id: 'm01-m1-2', lesson: 'what-is-marketing', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel rents its conference room to a firm for a day at $2,400. Given its alternatives, the firm would have paid up to $3,000, and hosting the day costs the hotel $1,500. What percentage of the value created by the exchange does the firm keep?',
    answer: 40, check: () => (3000 - 2400) / (3000 - 1500) * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: 60, say: 'That is the hotel’s share ($900 of $1,500). The firm keeps $3,000 − $2,400 = $600.' },
      { value: 20, say: 'You divided the firm’s gain by its willingness to pay. Divide it by the value created, $3,000 − $1,500.' },
      { value: 25, say: 'You divided the firm’s gain by the price. Divide it by the value created, $3,000 − $1,500.' },
    ],
    solution: 'Value created = $3,000 − $1,500 = $1,500. The firm keeps $3,000 − $2,400 = $600 and the hotel $2,400 − $1,500 = $900. The firm’s share is $600 ÷ $1,500 = 40%. A higher price would shift value to the hotel without changing the $1,500 total.',
  },
  {
    id: 'm01-m1-3', lesson: 'what-is-marketing', type: 'classify', kind: 'applied',
    prompt: 'In each purchase, is the person described the customer, the consumer, or both?',
    items: [
      'A parent who chooses and pays for a swimming course for her son',
      'The son who attends the swimming course',
      'A commuter who buys a cold brew at the station and drinks it on the train',
      'A hospital patient who takes a drug chosen by her doctor and paid for by her insurer',
      'A retiree who orders beans online and brews them for herself',
    ],
    categories: ['Customer only', 'Consumer only', 'Both customer and consumer'],
    answer: [0, 1, 2, 1, 2],
    feedback: {
      1: 'The son uses the course but neither chooses nor pays for it: he is the consumer.',
      3: 'The patient uses the drug, but the doctor chooses it and the insurer pays: she is the consumer, and the marketer has to win over the others too.',
    },
    solution: 'The customer chooses and pays; the consumer uses. The parent is the customer and her son the consumer. The commuter and the retiree are both. The patient is the consumer, while the choice and the payment sit with her doctor and insurer, which is why such markets need marketing to several parties.',
  },
  {
    id: 'm01-m1-4', lesson: 'what-is-marketing', type: 'mc', kind: 'applied',
    prompt: 'A survey finds that 600 of 2,000 office workers in a business district would like barista-made coffee at their staff events. A colleague tells Ana Lim, “That’s demand from 600 people.” What is the main problem with that claim?',
    options: [
      'It measures a want; demand needs ability and willingness to pay, and employers would pay.',
      'The survey asked too few people for its results to be reliable enough to act on at all.',
      'Thirty per cent of workers is too small a share to indicate any demand worth pursuing.',
      'Office workers don’t really need coffee at events, so the survey measured the wrong thing entirely.',
    ],
    answer: 0,
    feedback: {
      1: 'Two thousand people is a sizeable survey. The problem is what was measured, not how many answered.',
      2: 'Whether 30% is worth pursuing depends on what it turns into at a price. The question is what the survey measured.',
      3: 'The need is real (alertness, feeling looked after); the survey found a want. What it can’t show is demand.',
    },
    solution: 'Liking the idea is a want. Demand is a want backed by the ability and willingness to pay at a price, and for staff events the customer who pays is the employer, not the worker (the consumer). Ana needs to know how many employers would book at $9 a head, which the survey doesn’t ask.',
  },
  {
    id: 'm01-m1-5', lesson: 'customer-value', type: 'num', kind: 'numerical',
    prompt: 'A fictional pet-insurance company earns a margin of $90 a year per policy. 85% of policyholders renew each year, and the company discounts at 8% a year. What is a policyholder’s lifetime value, over every future year? Give dollars and cents.',
    answer: 391.30, check: () => 90 / (1 + 0.08 - 0.85), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 600, say: 'That is 90 ÷ (1 − 0.85), which leaves out discounting. The denominator is 1 + 0.08 − 0.85 = 0.23.' },
      { value: 105.88, say: 'You divided by the retention rate. The denominator is 1 + d − r.' },
      { value: 391, say: 'Nearly: give the answer to the cent, $391.30.' },
    ],
    solution: 'CLV = m ÷ (1 + d − r) = 90 ÷ (1 + 0.08 − 0.85) = 90 ÷ 0.23 ≈ $391.30. A policyholder stays 1 ÷ 0.15 ≈ 6.7 years on average, and discounting reduces the undiscounted $600 to about $391.',
  },
  {
    id: 'm01-m1-6', lesson: 'customer-value', type: 'num', kind: 'applied',
    prompt: 'A fictional meal-kit company earns a margin of $60 a year per customer; 40% of customers stay from one year to the next, and it discounts at 10% a year. The board wants every customer to bring in at least three times what it cost to win them. What is the most the company should spend to win a customer? Give dollars and cents.',
    answer: 28.57, check: () => 60 / (1 + 0.10 - 0.40) / 3, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 85.71, say: 'That is the lifetime value itself. The board wants CLV to be at least three times the cost, so divide by 3.' },
      { value: 20, say: 'That is a third of one year’s margin. Customers are worth their lifetime value, not one year’s margin.' },
      { value: 50, say: 'You divided by the retention rate (60 ÷ 0.40 = $150) before dividing by 3. The denominator is 1 + d − r = 0.70.' },
      { value: 33.33, say: 'That leaves out discounting: 60 ÷ (1 − 0.40) = $100, and $100 ÷ 3. Use 1 + d − r = 0.70.' },
    ],
    solution: 'CLV = 60 ÷ (1 + 0.10 − 0.40) = 60 ÷ 0.70 ≈ $85.71. The most to spend so that CLV ≥ 3 × CAC is $85.71 ÷ 3 ≈ $28.57 per customer. With retention as low as 40%, the business can’t afford expensive acquisition; raising retention would raise that ceiling.',
  },
  {
    id: 'm01-m1-7', lesson: 'customer-value', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional couriers deliver parcels in the same city. Courier A advertises “delivered by 10 a.m.” and usually delivers by 11 a.m. Courier B advertises “delivered the same day” and usually delivers by 3 p.m. On the expectation-disconfirmation model, which is more likely to leave customers dissatisfied?',
    options: [
      'Courier A, because it usually falls short of the expectation its promise sets.',
      'Courier B, because its deliveries usually arrive about four hours later than Courier A’s.',
      'Neither, because both deliver on the day the parcel is sent.',
      'Both equally, because customers always want parcels sooner than they arrive.',
    ],
    answer: 0,
    feedback: {
      1: 'B is slower, but it keeps its promise: confirmation. Satisfaction depends on performance relative to expectations, not on speed alone.',
      2: 'Same-day delivery satisfies B’s customers because that is what B promised; A’s customers expected 10 a.m.',
      3: 'The model compares each courier’s performance with the expectation it set; A’s gap is negative, B’s is not.',
    },
    solution: 'Satisfaction depends on perceived performance compared with expectations, which the seller’s promises help to set. A promises 10 a.m. and delivers at 11: negative disconfirmation. B promises the same day and delivers it: confirmation. The faster courier creates the more disappointed customers, which is why promises should be ones the business can keep.',
  },
  {
    id: 'm01-m1-8', lesson: 'market-orientation', type: 'classify', kind: 'conceptual',
    prompt: 'Which of Kohli and Jaworski’s three activities does each action at a fictional catering business belong to?',
    items: [
      'Reading every event feedback form the morning after each event',
      'A weekly meeting where the baristas tell the owner what guests asked for',
      'Adding oat and soy milk to the standard menu after clients asked for them',
      'Asking prospects who chose a rival caterer why they did',
      'Emailing a summary of the client interviews to every member of staff',
    ],
    categories: ['Generating intelligence', 'Disseminating it', 'Responding to it'],
    answer: [0, 1, 2, 0, 1],
    feedback: {
      1: 'The baristas already have the information; the meeting moves it to someone who can act on it: dissemination.',
      3: 'Lost prospects are a source of intelligence that current clients can’t provide: generation.',
    },
    solution: 'Generating intelligence: reading feedback forms and asking lost prospects. Disseminating it: the weekly meeting and the emailed summary. Responding to it: changing the menu. A market-oriented business needs all three, and a response should be checked afterwards, which starts the cycle again.',
  },
  {
    id: 'm01-m1-9', lesson: 'market-orientation', type: 'mc', kind: 'applied',
    prompt: 'A fictional energy-drink brand finds that teenagers are among its keenest buyers and plans a promotional campaign outside schools. Applying the societal marketing concept and the AMA’s Statement of Ethics, what is the best judgement?',
    options: [
      'Drop the school campaign: teenagers are a vulnerable group and the drink can harm them; market to adults.',
      'Run the campaign: the marketing concept says to satisfy what target customers want, and teenagers want the drink.',
      'Run the campaign if it is legal, since obeying the law is what marketing ethics requires.',
      'Run the campaign but cut the price for students, so that the offer is fair to them.',
    ],
    answer: 0,
    feedback: {
      1: 'The marketing concept alone stops at customers’ wants. The societal marketing concept adds their long-term interests and society’s.',
      2: 'The AMA’s norms (do no harm, foster integrity, embrace ethical values) ask more than legality.',
      3: 'A lower price makes the product easier for teenagers to buy, which deepens the problem rather than addressing it.',
    },
    solution: 'The societal marketing concept weighs customers’ wants against their and society’s long-term interests, and the AMA’s values include equity, which recognises the needs of vulnerable market segments. Promoting a high-caffeine drink to teenagers outside schools fails both tests; marketing to adults, with clear labels, doesn’t.',
  },
  {
    id: 'm01-m1-10', lesson: 'market-orientation', type: 'num', kind: 'numerical',
    prompt: 'A fictional accountancy firm earns a margin of $3,000 a year per client; 85% of clients stay each year, and it discounts at 10% a year. Clients who left complained about slow answers, so the firm considers a client portal costing $150 per client per year. With the portal, what retention would the firm need for a client’s lifetime value to be at least what it is today? Give a percentage to two decimal places.',
    answer: 86.25, check: () => (1 + 0.10 - (3000 - 150) / (3000 / (1 + 0.10 - 0.85))) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 85, say: 'That is today’s retention. The portal lowers the margin to $2,850, so retention must rise to compensate.' },
      { value: 83.75, say: 'You added the $150 to the margin. The portal is a cost, so the margin falls to $2,850.' },
    ],
    solution: 'Today: CLV = 3,000 ÷ (1 + 0.10 − 0.85) = 3,000 ÷ 0.25 = $12,000. With the portal the margin is $2,850, so we need 2,850 ÷ (1.10 − r) ≥ 12,000: 1.10 − r ≤ 0.2375, so r ≥ 0.8625. Retention must reach at least 86.25%, 1.25 points above today, for the response to pay.',
  },
  {
    id: 'm01-m1-11', lesson: 'market-orientation', type: 'mc', kind: 'conceptual',
    prompt: 'In a study of 140 business units, Narver and Slater (1990) reported a substantial positive effect of market orientation on profitability. What is the most careful way to read that finding?',
    options: [
      'They went together in that study, but one study at one time can’t show which caused which.',
      'It proves that any firm which becomes more market-oriented will, as a result, become more profitable.',
      'It shows that market orientation matters only for businesses that sell commodities.',
      'It shows that profitability has nothing to do with how well a firm understands its customers.',
    ],
    answer: 0,
    feedback: {
      1: 'A single study of business units at one point in time shows an association. Profitable units might, for example, be able to afford more research and coordination.',
      2: 'Narver and Slater reported the effect for both commodity and non-commodity businesses.',
      3: 'The study reported the opposite: a substantial positive relationship.',
    },
    solution: 'The finding is evidence of an association between market orientation and profitability across 140 business units, both commodity and non-commodity. It supports the marketing concept, but it can’t by itself rule out other explanations, such as profitability making market orientation easier; that needs other evidence (B01’s lesson on interpreting results explains why).',
  },
];
