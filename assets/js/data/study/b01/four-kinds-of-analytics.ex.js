// four-kinds-of-analytics.ex.js — B01 · The four kinds of analytics: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
import { MONTHS, SHOP } from './case.js?v=13';

const KINDS = ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'];
const money = (v) => {
  const c = Math.round(Math.abs(v));
  return `${v < 0 && c !== 0 ? '−' : ''}$${c.toLocaleString('en-US')}`;
};

export const widgets = {
  'fka-gift-chart': {
    type: 'chart',
    kind: 'bar',
    title: 'Lantern’s gift-box orders by month, July–December 2026 (fictional)',
    x: { label: 'Month', values: MONTHS },
    series: [{ name: 'Orders containing a gift box', values: SHOP.giftBoxOrders }],
    y: { label: 'Orders containing a gift box' },
    note: 'July to October hover between 5 and 9 orders a month; November and December are a different world. A forecaster standing in October has no December in the shop’s history to copy, which is why the applied example uses scenarios. Fictional figures from the B01 case.',
  },
  'fka-gift-stock': {
    type: 'formula',
    title: 'How many gift boxes to assemble: expected profit',
    intro: 'December’s gift-box demand is 160 boxes (probability 25%), 240 or 320. The chance of 320 is set below; 240 takes the rest. Each box sold earns a profit; each box left over loses money; an order that finds no box left is lost.',
    inputs: [
      { id: 'boxes', label: 'Gift boxes assembled', min: 100, max: 400, step: 10, value: 240, fmt: 'int', unit: 'boxes' },
      { id: 'margin', label: 'Profit on each box sold', min: 5, max: 40, step: 1, value: 24, fmt: 'money' },
      { id: 'loss', label: 'Loss on each box left over', min: 0, max: 40, step: 1, value: 12, fmt: 'money' },
      { id: 'pHigh', label: 'Chance of high demand (320 boxes)', min: 0, max: 50, step: 5, value: 25, fmt: 'pct' },
    ],
    compute: (v) => {
      const scen = [[160, 0.25], [240, 0.75 - v.pHigh / 100], [320, v.pHigh / 100]];
      const profit = (q, d) => Math.min(d, q) * v.margin - Math.max(q - d, 0) * v.loss;
      const ev = (q) => scen.reduce((s, [d, p]) => s + p * profit(q, d), 0);
      const grid = Array.from({ length: 31 }, (_, k) => 100 + 10 * k);
      let best = grid[0];
      grid.forEach((q) => { if (ev(q) > ev(best) + 1e-9) best = q; });
      const left = scen.reduce((s, [d, p]) => s + p * Math.max(v.boxes - d, 0), 0);
      const lost = scen.reduce((s, [d, p]) => s + p * Math.max(d - v.boxes, 0), 0);
      const here = ev(v.boxes);
      const gap = ev(best) - here;
      return {
        headline: { label: `Expected profit from ${v.boxes} boxes`, value: money(here) },
        rows: [
          ['Profit if demand is 160 (probability 25%)', money(profit(v.boxes, 160))],
          [`Profit if demand is 240 (probability ${75 - v.pHigh}%)`, money(profit(v.boxes, 240))],
          [`Profit if demand is 320 (probability ${v.pHigh}%)`, money(profit(v.boxes, 320))],
          ['Expected boxes left over', left.toFixed(1)],
          ['Expected orders turned away', lost.toFixed(1)],
          ['Best number to assemble (in steps of 10)', `${best} boxes, expected profit ${money(ev(best))}`],
        ],
        note: gap < 0.5
          ? `${v.boxes} boxes is the best choice on these inputs. Its worst case is ${money(Math.min(...scen.map(([d]) => profit(v.boxes, d))))}; a cautious owner might still accept a little less expected profit for a better worst case.`
          : `Assembling ${best} boxes instead would raise expected profit by ${money(gap)}. The best number rises when a sale earns more compared with what a leftover box loses, and when high demand becomes more likely.`,
        chart: {
          kind: 'line',
          x: { label: 'Boxes assembled', values: grid },
          series: [{ name: 'Expected profit ($)', values: grid.map((q) => Math.round(ev(q))) }],
          y: { label: 'Expected profit ($)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-fka-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of analytics does each question need?',
    items: [
      'A hospital asks how many patients waited more than four hours in its emergency department last month.',
      'A bike-hire firm asks why weekend rentals fell after it moved its kiosk to the other side of the station.',
      'A supermarket asks how many turkeys it will sell in the week before Christmas.',
      'A delivery company asks which route each van should take tomorrow to deliver every parcel at the lowest fuel cost.',
      'A bank asks how likely each loan applicant is to miss a repayment.',
      'A university asks whether its new timetable caused the drop in attendance at Friday lectures.',
    ],
    categories: KINDS,
    answer: [0, 1, 2, 3, 2, 1],
    hints: [
      'Find the question word in each: what happened, why, what will happen (or how likely), or what should we do?',
      'A probability for each applicant is an estimate of something not yet known. Choosing each van’s route is a decision.',
    ],
    feedback: {
      1: 'The fall in rentals is already known; the firm asks why, which is diagnosis.',
      3: 'Choosing routes at the lowest cost is a decision, usually found by optimisation: prescriptive.',
      4: 'A probability of a future event is a prediction. Deciding whom to lend to, given the probabilities, would be prescriptive.',
      5: '“Caused” is the signal: the university wants an explanation of a change, which is diagnostic.',
    },
    solution: 'Waiting times last month: descriptive (a count of what happened). Why rentals fell and whether the timetable caused the drop: diagnostic (explanations). Turkey sales and each applicant’s chance of missing a repayment: predictive (estimates of the unknown). Van routes at the lowest cost: prescriptive (a decision).',
  },
  {
    id: 'b01-fka-g2', type: 'steps', kind: 'numerical',
    prompt: 'Hartwell Bakery, a fictional bakery, decides each evening how many sourdough loaves to bake for the next day. Each loaf sold earns $3 more than it costs to bake; each loaf still unsold at closing loses $2. Tomorrow’s demand will be 40 loaves (probability 0.5) or 60 loaves (probability 0.5). Should it bake 40 or 60?',
    solution: 'Baking 40: it sells 40 whatever happens, so the profit is 40 × 3 = $120 in both scenarios and the expected value is $120. Baking 60: if demand is 40 it sells 40 and has 20 left, 40 × 3 − 20 × 2 = $80; if demand is 60 it sells all 60, 60 × 3 = $180. Expected value 0.5 × 80 + 0.5 × 180 = $130. Baking 60 has the higher expected value, though it can earn as little as $80.',
    steps: [
      { id: 'b01-fka-g2-s1', type: 'num',
        prompt: 'If the bakery bakes 60 loaves and demand is 40, what is its profit?',
        answer: 80, check: () => 40 * 3 - (60 - 40) * 2, unit: '$', places: 0, tol: 0.5,
        hints: ['It sells 40 loaves and has 20 left over.', 'Profit = 40 × $3 − 20 × $2.'],
        wrong: [
          { value: 120, say: 'That counts the 40 loaves sold but forgets the 20 unsold loaves, each of which loses $2.' },
          { value: 180, say: 'That assumes all 60 are sold. Demand is only 40 in this scenario.' },
          { value: 140, say: 'You subtracted the loss on the unsold loaves from the profit on all 60: 180 − 40. Only 40 loaves are sold.' },
        ] },
      { id: 'b01-fka-g2-s2', type: 'num',
        prompt: 'What is the expected profit of baking 60 loaves?',
        answer: 130, check: () => 0.5 * (40 * 3 - 20 * 2) + 0.5 * (60 * 3), unit: '$', places: 0, tol: 0.5,
        hints: ['If demand is 60, all 60 sell: 60 × $3 = $180.', 'Weight each scenario’s profit by its probability: 0.5 × 80 + 0.5 × 180.'],
        wrong: [
          { value: 150, say: 'You left out the loss on the 20 unsold loaves in the low scenario: its profit is $80, not $120.' },
          { value: 180, say: 'That is the profit only if demand is 60. Weight both scenarios by their probabilities.' },
          { value: 260, say: 'You added the two profits without weighting them. Each scenario has a probability of 0.5.' },
        ] },
      { id: 'b01-fka-g2-s3', type: 'mc',
        prompt: 'Baking 40 loaves earns $120 in either scenario. What should the bakery do if it wants the highest expected profit?',
        options: [
          'Bake 60: its expected profit is $130, against $120 for 40.',
          'Bake 40: it can never lose money on unsold loaves.',
          'Bake 50, the average demand, which is always the best choice.',
          'Either: once risk is allowed for, the two are worth the same.',
        ],
        answer: 0,
        hints: ['Compare the two expected values.', 'Is baking the average demand automatically best? Try 50: what does it earn in each scenario?'],
        feedback: {
          1: 'Baking 40 is the safer choice, but its expected profit ($120) is lower. Safety and expected value are different things.',
          2: 'Baking the average is not automatically best. With 50 loaves: 0.5 × (40 × 3 − 10 × 2) + 0.5 × (50 × 3) = 0.5 × 100 + 0.5 × 150 = $125, less than $130.',
          3: 'Their expected profits differ ($130 against $120). Risk is a separate question: 60 loaves can earn as little as $80, which a cautious baker might weigh, but it does not make the expected values equal.',
        } },
    ],
  },
  {
    id: 'b01-fka-g3', type: 'order', kind: 'conceptual',
    prompt: 'A fictional battery-storage installer is deciding whether to add a fourth installation crew next spring. Put the steps of its analysis in the order of the analytics process.',
    items: [
      'Agree the decision (add a fourth crew next spring or not) and what evidence would justify it.',
      'Gather two years of job records and check that every job has a start date and a finish date.',
      'Forecast next spring’s jobs and compare the crew-days they will need with the crew-days available.',
      'Recommend to the managing director that the firm hire a fourth crew from March, giving the forecast’s range.',
      'In June, compare the jobs completed and customers’ waiting times with what the forecast said.',
    ],
    hints: [
      'The process runs question, data, analysis, decision, measure.',
      'Checking the dates in the job records belongs to the data step; the forecast is analysis.',
    ],
    solution: 'Question (agree the decision), data (gather and check the job records), analysis (forecast and compare capacity), decision (the recommendation, with its uncertainty), measure (compare June’s results with the forecast). The last step tells the installer whether its forecasting can be trusted next time.',
  },
  {
    id: 'b01-fka-g4', type: 'mc', kind: 'applied',
    prompt: 'Ana tells you: “I want a dashboard that shows every number the shop records, updated every day.” What is the best response from an analyst?',
    options: [
      'Ask which decisions it should support, then show only the measures they need.',
      'Build it as asked: with every number on screen, nothing Ana needs is left out.',
      'Suggest a machine-learning model instead, since a model can use every number at once.',
      'Advise against it, since daily figures for a small shop move about too much to read.',
    ],
    answer: 0,
    hints: [
      'Analytics needs data, people and decisions. Which of the three is missing from Ana’s request?',
      'A useful dashboard is designed backwards from the decisions it informs.',
    ],
    feedback: {
      1: 'Data without a decision produce reports that nobody reads. A screen of every number hides the few that matter.',
      2: 'A model answers a different kind of question. Ana first needs to see the facts that bear on her decisions, which is descriptive work.',
      3: 'Noisy daily figures are a fair worry, but the bigger problem is that the request names no decision. Weekly or monthly views of the right measures solve both.',
    },
    solution: 'The request names data but no decision. Ask what Ana decides each week or month (keep or change the checkout, how much stock, where to advertise) and show the measures those decisions need, defined exactly and compared with a target or the previous period.',
  },
];

export const independent = [
  {
    id: 'b01-fka-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Which kind of analytics does each piece of work belong to?',
    items: [
      'A monthly sales report comparing each region with its target',
      'Splitting a fall in sales by region, product and channel to find where it happened',
      'A score for each subscriber giving the probability of cancelling next month',
      'A model that sets each week’s staff rota to cover forecast demand at the lowest wage cost',
      'Comparing the shops that changed their opening hours with similar shops that did not',
      'A chart of the last twelve months’ website visits',
    ],
    categories: KINDS,
    answer: [0, 1, 2, 3, 1, 0],
    feedback: {
      1: 'Breaking a change into its parts to locate it is the first move of diagnosis.',
      3: 'The rota model uses a forecast, but its output is a decision (who works when): prescriptive.',
      4: 'Setting the shops that changed beside similar ones that did not is a comparison designed to explain an effect: diagnostic.',
    },
    solution: 'The sales report and the chart of visits are descriptive. Splitting the fall and comparing the shops are diagnostic. The cancellation score is predictive. The rota model is prescriptive: it recommends what to do.',
  },
  {
    id: 'b01-fka-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand forecast that it would sell 1,350 of a new jumper in its first month. It sold 1,200. What was the percentage error (actual minus forecast, as a percentage of the actual)? Give one decimal place, with a minus sign if the forecast was too high.',
    answer: -12.5, check: () => (1200 - 1350) / 1200 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: -11.1, say: 'You divided by the forecast. Percentage error, as defined in this lesson, divides by the actual: −150 ÷ 1,200.' },
      { value: 12.5, say: 'Check the sign: actual minus forecast is 1,200 − 1,350 = −150, because the forecast was too high.' },
      { value: -150, say: 'That is the error in jumpers. Divide it by the actual and multiply by 100 to get a percentage.' },
    ],
    solution: 'Error = A − F = 1,200 − 1,350 = −150 jumpers. Percentage error = −150 ÷ 1,200 × 100 = −12.5%. The forecast was too high by an eighth of what was actually sold.',
  },
  {
    id: 'b01-fka-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional events company can hold its summer festival outdoors, earning $50,000 if the weather is fine (probability 0.7) and losing $20,000 if it rains (probability 0.3), or indoors for a certain profit of $25,000. What is the expected value of the outdoor option?',
    answer: 29000, check: () => 0.7 * 50000 + 0.3 * -20000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 15000, say: 'That is the plain average of $50,000 and −$20,000. The two outcomes are not equally likely: weight each by its probability.' },
      { value: 35000, say: 'That counts only the fine-weather outcome. Add the rain outcome, 0.3 × (−$20,000) = −$6,000.' },
      { value: 41000, say: 'The rain outcome is a loss, so it reduces the expected value: 35,000 − 6,000, not 35,000 + 6,000.' },
    ],
    solution: 'EV = 0.7 × 50,000 + 0.3 × (−20,000) = 35,000 − 6,000 = $29,000. That beats the certain $25,000 indoors, but outdoors carries a 30% chance of a $20,000 loss; a company that could not absorb that loss might rationally choose indoors.',
  },
  {
    id: 'b01-fka-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about machine learning are correct? Select all that apply.',
    options: [
      'It is most often used for prediction, such as scoring each customer’s chance of ordering again.',
      'Supervised learning learns from examples whose outcomes are known.',
      'It is a fifth kind of analytics that replaces the other four.',
      'Its models should be checked on cases they have not seen.',
      'It removes the need for a clear business question.',
      'Grouping similar customers when there is no outcome to predict is unsupervised learning.',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Machine learning is a set of methods used inside the four kinds, mostly for prediction. It does not replace them.',
      4: 'A model still needs a clear question: what is being predicted, for whom, and which decision the prediction serves.',
    },
    solution: 'Machine learning fits models to data. Supervised learning learns from labelled examples, unsupervised learning finds structure such as groups, and both must be judged on cases they have not seen. It serves the four kinds of analytics, mostly prediction, and needs a clear question like any other analysis.',
  },
  {
    id: 'b01-fka-i5', type: 'mc', kind: 'conceptual',
    prompt: 'A manager says: “We should stop producing descriptive reports and spend everything on prescriptive models, because prescriptive analytics has the most value.” What is the main flaw in this argument?',
    options: [
      'Prescriptive models inherit the errors of the descriptions they are built on.',
      'Prescriptive models cost too much for most businesses to build and maintain.',
      'Lenders and regulators ask for descriptive reports, so they must continue anyway.',
      'Prescriptive models work only in industries such as airlines and hotels.',
    ],
    answer: 0,
    feedback: {
      1: 'Cost can matter, but many prescriptive tools are cheap. The flaw is thinking they can stand without the steps beneath them.',
      2: 'Outside reporting is one reason to keep some reports, but it is not the main flaw: even with no lender or regulator, the models would need good descriptions.',
      3: 'Prescriptive methods are used in many industries: rotas, stock, delivery routes, prices.',
    },
    solution: 'The staircase is not a list of alternatives. A prescription combines forecasts with costs and constraints, and the forecasts are built on descriptions of the past. Errors at the bottom flow to the top, so good descriptive work is a precondition for good prescriptive work.',
  },
  {
    id: 'b01-fka-i6', type: 'fill', kind: 'applied',
    prompt: 'Complete the description of Lantern’s gift-box analysis.',
    text: 'Counting gift-box orders month by month is [[0]] analytics. Setting out scenarios for December’s orders is [[1]] analytics. Choosing how many boxes to assemble from the expected profits is [[2]] analytics. Comparing December’s actual orders with the scenarios is the [[3]] step of the analytics process.',
    blanks: [
      { options: KINDS, answer: 0 },
      { options: KINDS, answer: 2 },
      { options: KINDS, answer: 3 },
      { options: ['question', 'data', 'decision', 'measure'], answer: 3 },
    ],
    solution: 'Counting what happened is descriptive; scenarios for the future are predictive; choosing an action from them is prescriptive; and checking the actual result against the forecast is the measure step, which improves next year’s scenarios.',
  },
];

export const check = [
  {
    id: 'b01-fka-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What distinguishes diagnostic analytics from descriptive analytics?',
    options: [
      'Descriptive reports what happened; diagnostic explains why it happened.',
      'Diagnostic analytics works on more recent, more detailed data than descriptive.',
      'Diagnostic analytics predicts what will happen if nothing is done.',
      'Descriptive analytics uses charts, while diagnostic analytics uses statistical tests.',
    ],
    answer: 0,
    feedback: {
      1: 'Both can use data of any age and detail. The difference is the question: what happened, or why.',
      2: 'Estimating what will happen, with or without action, is predictive analytics.',
      3: 'Either kind can use charts or statistical tests. The difference lies in the question each answers.',
    },
    solution: 'Descriptive analytics answers “what happened?” with counts, totals, rates and comparisons. Diagnostic analytics answers “why?”: it drills down, compares the group that changed with one that did not, checks timing, and treats each explanation as a hypothesis until tested.',
  },
  {
    id: 'b01-fka-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional ski-hire shop can rent 30 or 60 extra pairs of skis for the holiday week. With 30 pairs it expects to earn $2,400 if the snow is good (probability 0.5), $1,500 if it is average (0.3) and $300 if it is poor (0.2). With 60 pairs the three figures are $4,500, $1,800 and −$1,200. What is the expected profit of the option with the higher expected value?',
    answer: 2550, check: () => Math.max(0.5 * 2400 + 0.3 * 1500 + 0.2 * 300, 0.5 * 4500 + 0.3 * 1800 + 0.2 * -1200), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1710, say: 'That is the expected profit of renting 30 pairs. Work out both options and report the higher.' },
      { value: 1700, say: 'That is the plain average of the three outcomes for 60 pairs. Weight each outcome by its probability.' },
      { value: 3030, say: 'The poor-snow outcome for 60 pairs is a loss, so it reduces the expected value: subtract 0.2 × 1,200, do not add it.' },
    ],
    solution: '30 pairs: 0.5 × 2,400 + 0.3 × 1,500 + 0.2 × 300 = 1,200 + 450 + 60 = $1,710. 60 pairs: 0.5 × 4,500 + 0.3 × 1,800 + 0.2 × (−1,200) = 2,250 + 540 − 240 = $2,550. Renting 60 pairs has the higher expected value, though in a poor season it loses $1,200 where 30 pairs would still earn $300.',
  },
  {
    id: 'b01-fka-k3', type: 'classify', kind: 'applied',
    prompt: 'Ana has more questions about Lantern’s shop. Which kind of analytics does each need?',
    items: [
      'What share of September’s orders came through the app?',
      'Did the payment-page bug on mobile browsers cause some of September’s lost website orders?',
      'How many visits will the shop receive in January 2027?',
      'Which customers should receive a discount code to encourage a second order, given what each code costs?',
      'Which of November’s new customers are likely to order again?',
    ],
    categories: KINDS,
    answer: [0, 1, 2, 3, 2],
    feedback: {
      1: '“Did it cause?” asks for an explanation of something that has happened: diagnostic.',
      3: 'Choosing whom to send a code to, weighing its cost, is a decision: prescriptive. It would use the predictions from the last question.',
      4: 'A likelihood of a future order is a prediction, even though it is about customers who already exist.',
    },
    solution: 'The app’s share of September’s orders is descriptive. Whether the bug caused lost orders is diagnostic. January’s visits and the chance that each new customer orders again are predictive. Choosing whom to send codes to is prescriptive.',
  },
  {
    id: 'b01-fka-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional cinema chain cut ticket prices at its Eastgate cinema in March, and attendance there rose 12% from February to March. Before giving the price cut the credit, what should the analyst check first?',
    options: [
      'Attendance at similar cinemas that kept their prices',
      'Whether Eastgate’s attendance stayed higher in April and May',
      'How much revenue Eastgate gave up on each ticket after the cut',
      'Whether a forecasting model would have predicted the rise',
    ],
    answer: 0,
    feedback: {
      1: 'A rise that lasts would be interesting, but it could still be the season or new films. It does not show what would have happened without the cut.',
      2: 'That matters for whether the cut paid for itself, not for whether it caused the rise.',
      3: 'A model’s prediction is not evidence of cause. The question is what would have happened without the price cut.',
    },
    solution: 'March may be a better month for cinemas (school holidays, new films). Comparing Eastgate with similar cinemas that kept their prices shows how much of the 12% would probably have happened anyway; only the difference is a candidate effect of the price cut.',
  },
  {
    id: 'b01-fka-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s forecasts for four weeks were 500, 510, 490 and 520 room-nights; it actually sold 520, 540, 500 and 540. What was the average forecast error (actual minus forecast) per week?',
    answer: 20, check: () => ((520 - 500) + (540 - 510) + (500 - 490) + (540 - 520)) / 4, unit: 'room-nights', places: 0, tol: 0.5,
    wrong: [
      { value: -20, say: 'That is forecast minus actual. This course defines the error as actual minus forecast, so a forecast that is too low gives a positive error.' },
      { value: 80, say: 'That is the total of the four errors. Divide by the four weeks for the average.' },
    ],
    solution: 'Errors: 20, 30, 10 and 20 room-nights; their average is 80 ÷ 4 = 20. Every error is positive, so the forecasts were too low every week: the method is biased, and the hotel should correct for that rather than treat each miss as bad luck.',
  },
  {
    id: 'b01-fka-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the kinds of analytics are correct? Select all that apply.',
    options: [
      'One decision often uses several kinds in turn.',
      'A prescriptive recommendation inherits any error in the forecast it uses.',
      'Descriptive analytics is not worth doing once a business can afford predictive models.',
      'Predictive analytics gives a value that will certainly happen.',
      'Not every source uses four kinds: INFORMS, for example, describes three.',
      'The value of an analysis depends on the decision it supports.',
    ],
    answer: [0, 1, 4, 5],
    feedback: {
      2: 'Every forecast and recommendation is built on descriptions of the past; the descriptive base never stops mattering.',
      3: 'A forecast is an estimate under assumptions, with uncertainty that should be stated as a range or scenarios.',
    },
    solution: 'Decisions draw on several kinds in turn, and errors flow upwards from description to prescription. Classifications differ (INFORMS uses descriptive, predictive and prescriptive), and value comes from the decision an analysis informs. Predictions are uncertain, and description remains the foundation.',
  },
];
