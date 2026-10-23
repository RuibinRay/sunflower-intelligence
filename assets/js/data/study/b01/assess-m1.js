// assess-m1.js — B01 module 1 test: What analytics is for (four-kinds-of-analytics, business-questions, problem-solving-frameworks).
// No hints. Each item has a full solution, shown when the student reviews the test. All businesses and figures are fictional.

export const items = [
  {
    id: 'b01-m1-1', lesson: 'four-kinds-of-analytics', type: 'rows', kind: 'applied',
    prompt: 'A fictional city bus operator’s analytics plan for next year lists these tasks. Select every task that is predictive analytics.',
    data: { table: {
      head: ['Task', 'Output'],
      rows: [
        ['Count the passengers who boarded each route last month', 'Monthly report'],
        ['Estimate how many passengers the new airport route will carry in its first year', 'Forecast with a range'],
        ['Find out why evening passengers on route 12 fell after the timetable changed', 'Explanation'],
        ['Score each bus by its chance of an engine failure in the next three months', 'Risk score for each bus'],
        ['Choose how many buses to run on each route in each hour at the lowest cost', 'Timetable'],
        ['Forecast how many passengers will travel on each route on a typical weekday next year', 'Forecast by route'],
        ['Compare this year’s punctuality with last year’s', 'Chart'],
      ],
    } },
    answer: [1, 3, 5],
    solution: 'The airport-route estimate, the engine-failure scores and next year’s weekday forecast each estimate something not yet known: predictive. Counting last month’s passengers and comparing punctuality with last year are descriptive; finding why route 12 fell is diagnostic; choosing how many buses to run is prescriptive. It would use the forecasts, but its output is a decision.',
  },
  {
    id: 'b01-m1-2', lesson: 'four-kinds-of-analytics', type: 'num', kind: 'numerical',
    prompt: 'A fictional greengrocer can order 20 or 30 boxes of strawberries for the weekend. With 20 boxes it earns $160 whatever the weather. With 30 boxes it earns $240 if the weekend is warm (probability 0.6) and $90 if it is cool (probability 0.4), because unsold strawberries spoil. How much expected profit does the greengrocer give up by choosing the safer 20 boxes?',
    answer: 20, check: () => (0.6 * 240 + 0.4 * 90) - 160, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 80, say: 'That compares 20 boxes with the warm-weather profit only. Compare with the expected value of 30 boxes, which weights both outcomes.' },
      { value: 5, say: 'You used the plain average of $240 and $90 ($165). The outcomes are not equally likely: weight each by its probability.' },
      { value: 180, say: 'That is the expected value of 30 boxes. Subtract the $160 that 20 boxes earn for certain.' },
    ],
    solution: 'Expected value of 30 boxes = 0.6 × 240 + 0.4 × 90 = 144 + 36 = $180. Twenty boxes earn $160 for certain. The safer choice gives up 180 − 160 = $20 of expected profit in return for avoiding the $90 outcome, a price a greengrocer who dislikes risk might reasonably pay.',
  },
  {
    id: 'b01-m1-3', lesson: 'four-kinds-of-analytics', type: 'mc', kind: 'conceptual',
    prompt: 'A company announces that it has “moved beyond descriptive, diagnostic, predictive and prescriptive analytics to machine learning”. What is wrong with the claim?',
    options: [
      'Machine learning is a set of methods used within the four kinds.',
      'Nothing: machine learning has replaced the four kinds in modern firms.',
      'Machine learning is useful only for descriptive work such as grouping customers.',
      'Machine learning needs no business question, so it sits outside the four.',
    ],
    answer: 0,
    feedback: {
      1: 'A machine-learning model still answers one of the four questions, most often “what will happen?”, and still depends on good descriptive data.',
      2: 'Grouping customers is one use, but machine learning is used mainly for prediction, and some systems are prescriptive.',
      3: 'A model needs a clear question as much as any other analysis: what is predicted, for whom, and for which decision.',
    },
    solution: 'Machine learning fits models to data. It is used inside the four kinds of analytics, most often for prediction (scoring, forecasting), sometimes for description (clustering) or prescription. It is not a stage beyond them, and it does not remove the need for a clear question and trustworthy data.',
  },
  {
    id: 'b01-m1-4', lesson: 'four-kinds-of-analytics', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer tried two forecasting methods for March. Method A forecast 900 installations and method B 1,080; the actual number was 1,000. Using percentage error (actual minus forecast, as a percentage of the actual), what was the percentage error of the more accurate method? Give one decimal place, with a minus sign if that forecast was too high.',
    answer: -8, check: () => [(1000 - 900) / 1000 * 100, (1000 - 1080) / 1000 * 100].reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a)), unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 10, say: 'That is method A’s error. Method B’s error is smaller in size, so method B was more accurate.' },
      { value: -7.4, say: 'You divided by method B’s forecast. Percentage error divides by the actual: −80 ÷ 1,000.' },
      { value: 8, say: 'Check the sign: method B forecast 1,080, above the actual, so its error is negative.' },
    ],
    solution: 'Method A: (1,000 − 900) ÷ 1,000 × 100 = +10%. Method B: (1,000 − 1,080) ÷ 1,000 × 100 = −8%. Compare the sizes, ignoring the sign: 8% is smaller than 10%, so method B was more accurate, with an error of −8.0%. One month is thin evidence: a fair comparison tracks both methods for several months.',
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
      'Raise repeat customers’ share of paid orders from 28% to 35% each month, January–June 2027.',
      'Get many more repeat customers as soon as possible, starting with a loyalty scheme in January.',
      'Raise repeat customers’ share of paid orders from 28% to 90% by the end of next month.',
      'Increase the shop’s social-media followers by 20% by June 2027 to build customer loyalty.',
    ],
    answer: 0,
    feedback: {
      1: 'A loyalty scheme is an action, not an objective. “Many more” is not measurable and “as soon as possible” is not time-bound.',
      2: 'Specific, measurable and dated, but a jump from 28% to 90% in one month is not achievable for most shops.',
      3: 'Measurable and time-bound, but followers are not repeat customers: the objective is not relevant to what she wants.',
    },
    solution: 'The best version says what is measured (repeat customers’ share of paid orders, which needs an operational definition of a repeat customer), the starting point and level to reach (28% to at least 35%) and the period (each month, January to June 2027). It is plausible and directly relevant to repeat custom.',
  },
  {
    id: 'b01-m1-7', lesson: 'business-questions', type: 'num', kind: 'numerical',
    prompt: 'A fictional online shop’s SMART objective for March is a conversion rate (paid orders ÷ visits) of at least 2.5%. It expects 24,000 visits in March and usually takes about 540 paid orders a month from that much traffic. How many more paid orders a month does the objective require?',
    answer: 60, check: () => 24000 * 0.025 - 540, unit: 'orders', places: 0, tol: 0.5,
    wrong: [
      { value: 600, say: 'That is the total number of paid orders the objective requires. Subtract the 540 the shop usually takes.' },
      { value: 5460, say: 'You used 0.25 instead of 0.025. A conversion rate of 2.5% is 0.025 as a decimal.' },
    ],
    solution: 'Required paid orders = 24,000 × 0.025 = 600. Usual orders: 540. The gap is 600 − 540 = 60 more paid orders a month, a rise of about 11% (60 ÷ 540). Whether that is achievable, the A of SMART, is a judgement about what the shop can change by March.',
  },
  {
    id: 'b01-m1-8', lesson: 'business-questions', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional ice-cream maker launched a new recipe on 1 June and wants to know whether it changed sales. Why is comparing June’s sales with May’s a weak comparison?',
    options: [
      'June is usually stronger for ice cream, so the season could explain a rise.',
      'May and June have different numbers of days, which makes any comparison invalid.',
      'Comparisons with the previous month are never allowed in business analysis.',
      'Sales should be compared with the target, not with any earlier period.',
    ],
    answer: 0,
    feedback: {
      1: 'May has 31 days and June 30, but daily rates fix that. The bigger problem is the season, which daily rates do not remove.',
      2: 'Month-on-month comparisons are allowed and often useful; they are weak when the season changes between the months.',
      3: 'A target shows whether sales were where the maker planned, not whether the recipe changed them.',
    },
    solution: 'A baseline should differ from the period studied only in the change being studied. June differs from May in season (and length) as well as recipe. The same two months last year remove the season; shops still selling the old recipe show what would have happened without the change.',
  },
  {
    id: 'b01-m1-9', lesson: 'problem-solving-frameworks', type: 'num', kind: 'numerical',
    prompt: 'A fictional online bookshop had 40,000 visits, a conversion rate of 3.0% and an average order value of $30 in January, and 36,000 visits, 3.0% and $32 in February. Changing the order value first and then visits (the conversion rate did not change), how much did the change in order value contribute to the change in revenue?',
    answer: 2400, check: () => 40000 * 0.03 * (32 - 30), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2160, say: 'That is the order value’s contribution when it is changed after visits, at February’s 36,000 visits. Changed first, it uses January’s 40,000.' },
      { value: -1440, say: 'That is the total change in revenue (34,560 − 36,000). The question asks for the order value’s contribution.' },
      { value: -3840, say: 'That is the contribution of visits when they are changed second: (36,000 − 40,000) × 0.03 × 32.' },
    ],
    solution: 'Order value first: 40,000 × 0.03 × (32 − 30) = +$2,400. Visits second: (36,000 − 40,000) × 0.03 × 32 = −$3,840. Total: −$1,440, matching 34,560 − 36,000. Changing visits first instead gives −$3,600 and +$2,160. The sizes depend on the order, but the ranking does not: the fall in visits is the larger driver either way.',
  },
  {
    id: 'b01-m1-10', lesson: 'problem-solving-frameworks', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional cinema’s ticket revenue is screenings × tickets sold per screening × average ticket price. An analyst splits “Why did ticket revenue fall?” into two branches: fewer screenings, and fewer tickets sold per screening. Which branch must be added to make the split collectively exhaustive?',
    options: [
      'A lower average ticket price',
      'Fewer screenings at weekends',
      'Less popular films on show',
      'Higher staff and film-hire costs',
    ],
    answer: 0,
    feedback: {
      1: 'Weekend screenings are part of the screenings branch. Adding them as a separate branch would overlap with it.',
      2: 'Popularity is a possible reason within tickets sold per screening, one level down, not a branch of its own at this level.',
      3: 'Costs affect profit, not ticket revenue.',
    },
    solution: 'Revenue is the product of three drivers, so a split that is MECE at this level needs all three. The draft has two; the third, a lower average ticket price (more discounted tickets, a cheaper mix of seats), is missing. Weekend screenings and the popularity of films belong one level down.',
  },
  {
    id: 'b01-m1-11', lesson: 'problem-solving-frameworks', type: 'mc', kind: 'applied',
    prompt: 'The average waiting time at a fictional call centre doubled over three months. The manager ran the five whys and concluded: “too few staff at lunchtime, because two people left and were not replaced”. A demand-and-capacity split shows that calls received rose by 40% while calls handled per staff hour did not change. What should the analyst advise?',
    options: [
      'The five whys found one cause; the 40% rise in calls is a second that needs explaining too.',
      'The five whys found the root cause, so replacing the two staff will bring the waits back down.',
      'Discard the five whys, since it is unreliable, and start the whole analysis again.',
      'Hire lunchtime staff only, since busy periods are where the waits are longest.',
    ],
    answer: 0,
    feedback: {
      1: 'A 40% rise in calls would lengthen waits even with every post filled. Replacing the staff fixes only part of the problem.',
      2: 'The staffing finding may well be right; the problem is that it is not the whole story.',
      3: 'Nothing suggests the rise in calls will reverse, and it is not confined to lunchtime. Its cause (a product fault? a billing change?) may be the bigger issue.',
    },
    solution: 'The demand/capacity split is MECE: waits can rise only because more calls arrive or fewer can be handled. Capacity fell (two staff not replaced) and demand rose by 40%; the five whys followed only the first path. Replacing the staff addresses capacity, but the rise in calls needs its own root-cause work, and may matter more.',
  },
];
