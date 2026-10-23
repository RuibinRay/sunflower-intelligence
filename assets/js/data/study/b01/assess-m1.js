// assess-m1.js — B01 module 1 test: What analytics is for (four-kinds-of-analytics, business-questions, problem-solving-frameworks).
// No hints. Each item has a full solution, shown when the student reviews the test. All businesses and figures are fictional.

const KINDS = ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'];

export const items = [
  {
    id: 'b01-m1-1', lesson: 'four-kinds-of-analytics', type: 'classify', kind: 'applied',
    prompt: 'A fictional city bus operator is reviewing its services. Which kind of analytics does each question need?',
    items: [
      'How many passengers boarded each route last month?',
      'Why have evening passengers on route 12 fallen since the timetable changed?',
      'How many passengers will use the new airport route in its first year?',
      'How many buses should run on each route in each hour to carry the forecast passengers at the lowest cost?',
      'Which buses’ engines are likely to fail in the next three months?',
    ],
    categories: KINDS,
    answer: [0, 1, 2, 3, 2],
    feedback: {
      1: '“Why” asks for an explanation of a change that has already happened: diagnostic.',
      3: 'Choosing how many buses to run is a decision, made by combining a forecast with costs: prescriptive.',
      4: 'A likelihood of a future failure is a prediction. Deciding which buses to service first would be prescriptive.',
    },
    solution: 'Last month’s passengers: descriptive. Why route 12 fell: diagnostic. Airport-route passengers and likely engine failures: predictive. Buses per route per hour at the lowest cost: prescriptive.',
  },
  {
    id: 'b01-m1-2', lesson: 'four-kinds-of-analytics', type: 'num', kind: 'numerical',
    prompt: 'A fictional greengrocer is deciding how many boxes of strawberries to order for the weekend. Ordering 30 boxes earns $240 if demand is high (probability 0.6) and $90 if demand is low (probability 0.4), because unsold strawberries spoil. What is the expected profit of ordering 30 boxes?',
    answer: 180, check: () => 0.6 * 240 + 0.4 * 90, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 165, say: 'That is the plain average of $240 and $90. The outcomes are not equally likely: weight each by its probability.' },
      { value: 240, say: 'That is the profit only if demand is high. Weight both outcomes by their probabilities.' },
      { value: 330, say: 'You added the two profits without weighting them.' },
    ],
    solution: 'EV = 0.6 × 240 + 0.4 × 90 = 144 + 36 = $180.',
  },
  {
    id: 'b01-m1-3', lesson: 'four-kinds-of-analytics', type: 'mc', kind: 'conceptual',
    prompt: 'A company announces that it has “moved beyond descriptive, diagnostic, predictive and prescriptive analytics to machine learning”. What is wrong with the claim?',
    options: [
      'Machine learning is a set of methods used within the four kinds, mostly for prediction; it is not a stage beyond them.',
      'Nothing: machine learning replaces the four kinds.',
      'Machine learning can be used only for descriptive analytics.',
      'Machine learning does not use data.',
    ],
    answer: 0,
    feedback: {
      1: 'A machine-learning model still answers one of the four questions, most often “what will happen?”, and still depends on good descriptive data.',
      2: 'Machine learning is used mainly for prediction, though clustering is descriptive work and some systems are prescriptive.',
      3: 'Machine learning fits models to data; without data there is nothing to learn from.',
    },
    solution: 'Machine learning fits models to data. It is used inside the four kinds of analytics, most often for prediction (scoring, forecasting), sometimes for description (clustering) or prescription. It does not remove the need for a clear question and trustworthy data.',
  },
  {
    id: 'b01-m1-4', lesson: 'four-kinds-of-analytics', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer forecast 140 installations for the quarter and completed 160. What was the percentage error (actual minus forecast, as a percentage of the actual)? Give one decimal place, with a minus sign if the forecast was too high.',
    answer: 12.5, check: () => (160 - 140) / 160 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 14.3, say: 'You divided by the forecast. Percentage error divides by the actual: 20 ÷ 160.' },
      { value: -12.5, say: 'Check the sign: the actual (160) was above the forecast (140), so the error is positive: the forecast was too low.' },
      { value: 20, say: 'That is the error in installations. Divide it by the actual and multiply by 100.' },
    ],
    solution: 'Error = A − F = 160 − 140 = 20 installations. Percentage error = 20 ÷ 160 × 100 = 12.5%: the forecast was too low by an eighth of the actual.',
  },
  {
    id: 'b01-m1-5', lesson: 'business-questions', type: 'rows', kind: 'applied',
    prompt: 'Below is an extract from a fictional online coffee shop’s order system for one morning. Its conversion KPI defines an order as “a paid order from a real customer”, so staff test orders, orders cancelled before payment and failed payments are left out, and later refunds do not matter. Select every row that counts as an order under this definition.',
    data: { table: {
      head: ['order_id', 'customer', 'status', 'note'],
      rows: [
        ['O-3101', 'C-118', 'paid', '—'],
        ['O-3102', 'STAFF-02', 'paid', 'test of the new checkout'],
        ['O-3103', 'C-245', 'cancelled', 'cancelled before payment'],
        ['O-3104', 'C-077', 'paid', 'refunded on 3 November'],
        ['O-3105', 'C-118', 'paid', 'second order this morning'],
        ['O-3106', 'C-301', 'payment failed', 'card declined'],
        ['O-3107', 'C-150', 'paid', '—'],
      ],
    } },
    answer: [0, 3, 4, 6],
    solution: 'O-3101, O-3104, O-3105 and O-3107 count. O-3102 is a staff test, O-3103 was cancelled before payment and O-3106 was never paid. O-3104 was paid, and the definition ignores later refunds. O-3105 counts even though the same customer ordered earlier: the unit is the order, not the customer. Four orders, from three customers.',
  },
  {
    id: 'b01-m1-6', lesson: 'business-questions', type: 'mc', kind: 'applied',
    prompt: 'The owner of a fictional online tea shop says: “We want more repeat customers.” Which is the best SMART version of her objective?',
    options: [
      'Raise the share of each month’s paid orders placed by customers who have ordered before (identified by customer ID) from 28% to at least 35% in every month from January to June 2027.',
      'Get many more repeat customers as soon as possible.',
      'Raise the share of orders from repeat customers to 90% by next month.',
      'Increase the shop’s social-media followers by 20% by June 2027.',
    ],
    answer: 0,
    feedback: {
      1: 'Not specific or measurable (how many is “many more”?) and not time-bound (“as soon as possible”).',
      2: 'Specific and dated, but a jump to 90% in one month is not achievable for most shops.',
      3: 'Measurable and time-bound, but followers are not repeat customers: it is not relevant to the objective.',
    },
    solution: 'The first option says exactly what is measured and how (share of paid orders from customers who have ordered before, by customer ID), the starting point and the level to reach (28% to 35%), and the period (every month, January to June 2027). It is plausible and directly relevant to repeat custom.',
  },
  {
    id: 'b01-m1-7', lesson: 'business-questions', type: 'num', kind: 'numerical',
    prompt: 'In one month a fictional cinema sold tickets to 1,200 members, who bought 3,000 tickets between them, and to 4,800 non-members, who bought 6,000 tickets. What percentage of the month’s tickets were bought by members? Give one decimal place.',
    answer: 33.3, check: () => 3000 / (3000 + 6000) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 20, say: 'That is members’ share of customers (1,200 of 6,000). The question asks about tickets.' },
      { value: 50, say: 'That divides members’ tickets by non-members’ tickets. A share divides by the total: 3,000 + 6,000.' },
      { value: 66.7, say: 'That is the non-members’ share of tickets.' },
    ],
    solution: 'Members bought 3,000 of 9,000 tickets: 3,000 ÷ 9,000 × 100 ≈ 33.3%. They are only 20% of customers but buy 2.5 tickets each against 1.25 for non-members, so their share of tickets is larger.',
  },
  {
    id: 'b01-m1-8', lesson: 'business-questions', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional ice-cream maker launched a new recipe on 1 June and wants to know whether it changed sales. Why is comparing June’s sales with May’s a weak comparison?',
    options: [
      'Ice-cream sales usually rise into the summer, so a rise could be the season rather than the recipe; the same months last year, or shops still selling the old recipe, would be fairer baselines.',
      'May and June have the same number of days, so the comparison is perfect.',
      'Comparisons with the previous month are never allowed.',
      'Sales in different months cannot be compared at all.',
    ],
    answer: 0,
    feedback: {
      1: 'May has 31 days and June 30, and even equal lengths would not remove the season.',
      2: 'Month-on-month comparisons are allowed and often useful; they are weak when the season changes between the months.',
      3: 'They can be compared, as long as the comparison separates the change being studied from other differences between the months.',
    },
    solution: 'A baseline should differ from the period studied only in the change being studied. June differs from May in season and in length as well as recipe. The same two months last year remove the season; shops that kept the old recipe show what would have happened without the change.',
  },
  {
    id: 'b01-m1-9', lesson: 'problem-solving-frameworks', type: 'num', kind: 'numerical',
    prompt: 'A fictional online bookshop had 40,000 visits, a conversion rate of 3.0% and an average order value of $30 in January, and 36,000 visits, 3.0% and $32 in February. Changing visits first, then the conversion rate, then the order value, how much did the change in order value contribute to the change in revenue?',
    answer: 2160, check: () => 36000 * 0.03 * (32 - 30), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2400, say: 'You used January’s 40,000 visits. Visits were changed first, so the order-value step uses February’s 36,000.' },
      { value: -1440, say: 'That is the total change in revenue (34,560 − 36,000). The question asks for the order value’s contribution.' },
      { value: -3600, say: 'That is the contribution of visits: (36,000 − 40,000) × 0.03 × 30.' },
    ],
    solution: 'Visits: (36,000 − 40,000) × 0.03 × 30 = −$3,600. Conversion: unchanged, $0. Order value: 36,000 × 0.03 × (32 − 30) = +$2,160. Total: −$1,440, matching 36,000 × 0.03 × 32 − 40,000 × 0.03 × 30 = 34,560 − 36,000.',
  },
  {
    id: 'b01-m1-10', lesson: 'problem-solving-frameworks', type: 'classify', kind: 'conceptual',
    prompt: 'Is each split MECE? If not, is the problem an overlap or a gap?',
    items: [
      'Hotel guests: business travellers, leisure travellers, and guests attending conferences (many of whom travel for business)',
      'Orders: placed before noon, or placed at noon or later',
      'Complaints: about delivery or about product quality, for a firm that also receives complaints about billing',
      'Revenue: subscriptions, one-off orders, and everything else',
    ],
    categories: ['MECE', 'Overlap: not mutually exclusive', 'Gap: not collectively exhaustive'],
    answer: [1, 0, 2, 0],
    feedback: {
      0: 'A business traveller at a conference belongs to two groups.',
      2: 'Billing complaints belong to neither group.',
      3: '“Everything else” closes any gap, and the three parts cannot overlap if every sale is put in exactly one.',
    },
    solution: 'Conference guests overlap with business travellers. Before noon versus noon or later is MECE by construction. Delivery and quality leave billing out. Subscriptions, one-off orders and everything else is MECE.',
  },
  {
    id: 'b01-m1-11', lesson: 'problem-solving-frameworks', type: 'mc', kind: 'applied',
    prompt: 'The average waiting time at a fictional call centre doubled over three months. The manager ran the five whys and concluded: “too few staff at lunchtime, because two people left and were not replaced”. A driver tree shows that waiting time depends on calls received and on calls handled per hour, and calls received rose by 40% over the same period. What should the analyst advise?',
    options: [
      'The five whys followed one path; the driver tree shows a second cause, the rise in calls, which also needs explaining before the fix is chosen.',
      'The five whys has found the root cause, so the rise in calls can be ignored.',
      'The five whys is unreliable, so its finding about the staff should be discarded.',
      'Hire lunchtime staff only; the rise in calls will sort itself out.',
    ],
    answer: 0,
    feedback: {
      1: 'A 40% rise in calls would lengthen waits even with every post filled. Ignoring it risks fixing only part of the problem.',
      2: 'The staffing finding may well be right; the problem is that it is not the whole story.',
      3: 'Nothing suggests the rise in calls will reverse. Its cause (a product fault? a billing change?) may be the bigger issue.',
    },
    solution: 'The five whys tends to follow a single causal chain. The driver tree is MECE across the two things that set waiting time, demand and capacity, and shows that both moved. Replacing the two staff addresses capacity; the 40% rise in calls needs its own root-cause work, and may matter more.',
  },
];
