// business-questions.ex.js — B01 · Business questions and measurable objectives: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const pct = (x, d = 2) => `${x.toFixed(d)}%`;

export const widgets = {
  'bq-definitions': {
    type: 'formula',
    title: 'Which orders count? Conversion under four definitions',
    intro: 'A month of a fictional online bookshop’s orders. Each definition leaves out one more kind of record: staff test orders, then cancellations before payment, then full refunds.',
    inputs: [
      { id: 'records', label: 'Order records in the system', min: 500, max: 3000, step: 10, value: 1260, fmt: 'int', unit: 'orders' },
      { id: 'tests', label: 'Staff test orders', min: 0, max: 100, step: 1, value: 24, fmt: 'int', unit: 'orders' },
      { id: 'cancelled', label: 'Cancelled before payment', min: 0, max: 200, step: 1, value: 46, fmt: 'int', unit: 'orders' },
      { id: 'refunded', label: 'Paid, then refunded in full', min: 0, max: 200, step: 1, value: 35, fmt: 'int', unit: 'orders' },
      { id: 'visits', label: 'Website visits', min: 10000, max: 80000, step: 1000, value: 42000, fmt: 'int', unit: 'visits' },
      { id: 'target', label: 'Conversion target', min: 1, max: 5, step: 0.1, value: 3, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.tests + v.cancelled + v.refunded >= v.records) return { error: 'The tests, cancellations and refunds add up to at least as many as the order records, which is impossible. Lower them or raise the records.' };
      const counts = [v.records, v.records - v.tests, v.records - v.tests - v.cancelled, v.records - v.tests - v.cancelled - v.refunded];
      const names = ['A. Every order record', 'B. Real customers', 'C. Paid orders', 'D. Kept orders'];
      const conv = counts.map((n) => (n / v.visits) * 100);
      const meets = conv.map((c) => Math.round(c * 100) / 100 >= v.target - 1e-9);
      const nMeet = meets.filter(Boolean).length;
      return {
        headline: { label: 'Conversion on paid orders by real customers (C)', value: pct(conv[2]) },
        rows: names.map((n, i) => [n, `${counts[i].toLocaleString('en-US')} orders: ${pct(conv[i])}, ${meets[i] ? 'meets' : 'misses'} the target`]),
        note: nMeet === 4 ? 'Every definition meets the target, so here the choice of definition does not change the verdict, though it still changes the number reported.'
          : nMeet === 0 ? 'No definition meets the target: the shop missed it however an order is counted.'
            : `${nMeet} of the 4 definitions meet the target and ${4 - nMeet} miss it. The data are the same in every row; only the definition differs, so it must be agreed before anyone sees the result.`,
        chart: {
          kind: 'bar',
          x: { label: 'Definition of an order', values: ['A', 'B', 'C', 'D'] },
          series: [
            { name: 'Conversion (%)', values: conv.map((c) => Math.round(c * 100) / 100) },
            { name: 'Target (%)', values: [v.target, v.target, v.target, v.target] },
          ],
          y: { label: 'Percent of visits' },
        },
      };
    },
  },
  'bq-unit-share': {
    type: 'formula',
    title: 'The app’s share: counted in customers or in orders?',
    intro: 'One week of a shop’s business (fictional). Each customer uses only the app or only the website.',
    inputs: [
      { id: 'appCust', label: 'Customers who ordered in the app', min: 10, max: 200, step: 1, value: 60, fmt: 'int', unit: 'customers' },
      { id: 'appPer', label: 'Orders per app customer', min: 1, max: 4, step: 0.1, value: 1.5, fmt: 'num' },
      { id: 'webCust', label: 'Customers who ordered on the website', min: 10, max: 300, step: 1, value: 100, fmt: 'int', unit: 'customers' },
      { id: 'webPer', label: 'Orders per website customer', min: 1, max: 4, step: 0.1, value: 1.1, fmt: 'num' },
    ],
    compute: (v) => {
      const appOrders = v.appCust * v.appPer, webOrders = v.webCust * v.webPer;
      const byCust = (v.appCust / (v.appCust + v.webCust)) * 100;
      const byOrder = (appOrders / (appOrders + webOrders)) * 100;
      const gap = byOrder - byCust;
      return {
        headline: { label: 'App share of orders', value: pct(byOrder, 1) },
        rows: [
          ['App share of customers', pct(byCust, 1)],
          ['App share of orders', pct(byOrder, 1)],
          ['Orders: app and website', `${appOrders.toFixed(0)} and ${webOrders.toFixed(0)}`],
          ['Difference between the two shares', `${gap >= 0 ? '' : '−'}${Math.abs(gap).toFixed(1)} percentage points`],
        ],
        note: Math.abs(gap) < 0.05
          ? 'Customers in both channels order equally often, so the two shares agree: here the unit makes no difference.'
          : `${gap > 0 ? 'App' : 'Website'} customers order more often, so the app’s share of orders is ${gap > 0 ? 'larger' : 'smaller'} than its share of customers. Both figures are correct; a question about recruiting customers needs the first, one about packing orders the second.`,
        chart: {
          kind: 'bar',
          x: { label: 'Unit counted', values: ['Customers', 'Orders'] },
          series: [
            { name: 'App (%)', values: [Math.round(byCust * 10) / 10, Math.round(byOrder * 10) / 10] },
            { name: 'Website (%)', values: [Math.round((100 - byCust) * 10) / 10, Math.round((100 - byOrder) * 10) / 10] },
          ],
          y: { label: 'Share of the total (%)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-bq-g1', type: 'mc', kind: 'applied',
    prompt: 'The manager of a fictional bike-hire firm asks: “Is the new kiosk location working?” By the end of the month she must decide whether to renew the kiosk’s lease for another year. Which is the best decision-focused version of her question?',
    options: [
      'Over the eight weeks since the kiosk moved, did weekend rentals per day fall compared with the same weeks last year and with the firm’s other kiosk, by more than the 10% that would make the lease unprofitable?',
      'How do customers feel about the new kiosk location?',
      'How many bikes has the firm rented since it was founded?',
      'Will bike hire become more popular in the city over the next ten years?',
    ],
    answer: 0,
    hints: [
      'Which option names a measure, a period, a comparison and a threshold?',
      'The lease decision turns on whether rentals at the new site are high enough to pay for it.',
    ],
    feedback: {
      1: 'Customers’ feelings may matter, but this names no measure, period or threshold, and does not connect to the lease.',
      2: 'A total since the firm was founded mixes the old and new locations and has nothing to compare with.',
      3: 'A ten-year trend does not bear on a one-year lease decided this month.',
    },
    solution: 'The first option ties the question to the lease: a measure (weekend rentals per day), a time frame (eight weeks since the move), two comparisons (last year, the other kiosk) and a threshold (a fall of more than 10%) that would change the decision.',
  },
  {
    id: 'b01-bq-g2', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these objectives are SMART? Select all that apply.',
    options: [
      'Raise the share of orders delivered within three working days from 82% to at least 90% by 31 March 2027.',
      'Improve customer satisfaction.',
      'Increase website conversion as much as possible next year.',
      'Cut the average time to answer a customer e-mail to under 24 hours in every week of the first quarter of 2027.',
      'Treble revenue by the end of next month, with no extra budget or staff.',
      'Reach 10,000 followers on a social network by June, for a firm that sells only to other businesses through its sales team.',
    ],
    answer: [0, 3],
    hints: [
      'Test each against all five letters: what exactly, how much, is it possible, does it matter, by when?',
      'Two of the six pass every test. Watch for objectives that are measurable but irrelevant, or precise but impossible.',
    ],
    feedback: {
      1: 'Not specific or measurable: which customers, measured how, to what level, and by when?',
      2: '“As much as possible” is not a level, so nobody can say whether it was met.',
      4: 'Specific, measurable and time-bound, but not achievable: trebling revenue in a month with no extra resources is not a serious target.',
      5: 'Specific, measurable and time-bound, but not relevant: followers do nothing for a business that sells only through its sales team.',
    },
    solution: 'The delivery objective and the e-mail objective each say what changes, by how much, by when, and are plausible and relevant. “Improve customer satisfaction” and “as much as possible” fail Specific and Measurable; trebling revenue in a month fails Achievable; the follower target fails Relevant.',
  },
  {
    id: 'b01-bq-g3', type: 'steps', kind: 'numerical',
    prompt: 'Petal Post, a fictional online florist, had 25,000 website visits in May and 820 order records. Of these, 14 were staff test orders and 31 were cancelled by customers before payment. Its target is to convert at least 3.2% of visits into orders.',
    solution: 'Paid orders by real customers: 820 − 14 − 31 = 775. Conversion: 775 ÷ 25,000 = 3.10%. Counting every record gives 820 ÷ 25,000 = 3.28%, which would appear to meet the 3.2% target; on paid orders by real customers Petal Post missed it.',
    steps: [
      { id: 'b01-bq-g3-s1', type: 'num',
        prompt: 'How many paid orders by real customers were there?',
        answer: 775, check: () => 820 - 14 - 31, unit: 'orders', places: 0, tol: 0.5,
        hints: ['Start from all 820 records and remove the two kinds that are not purchases by customers.', 'Remove both the 14 tests and the 31 cancellations.'],
        wrong: [
          { value: 806, say: 'That removes the staff tests but not the cancellations. An order cancelled before payment is not a paid order.' },
          { value: 789, say: 'That removes the cancellations but not the staff tests. Test orders are not customers.' },
          { value: 820, say: 'That counts every record, including tests and cancellations.' },
        ] },
      { id: 'b01-bq-g3-s2', type: 'num',
        prompt: 'What was the conversion rate on paid orders by real customers? Give a percentage to two decimal places.',
        answer: 3.1, check: () => (820 - 14 - 31) / 25000 * 100, unit: '%', places: 2, tol: 0.005,
        hints: ['Conversion = orders ÷ visits, multiplied by 100 for a percentage.', '775 ÷ 25,000 × 100.'],
        wrong: [
          { value: 3.28, say: 'That uses all 820 records. Use the 775 paid orders by real customers.' },
          { value: 0.031, say: 'That is the proportion. Multiply by 100 to express it as a percentage.' },
        ] },
      { id: 'b01-bq-g3-s3', type: 'mc',
        prompt: 'Which statement is right?',
        options: [
          'Petal Post met its 3.2% target only if every order record is counted; on paid orders by real customers it missed it.',
          'Petal Post met its target under any definition.',
          'Petal Post missed its target under any definition.',
          'Whether a target is met cannot depend on the definition of an order.',
        ],
        answer: 0,
        hints: ['Compare 3.28% (every record) and 3.10% (paid orders by real customers) with 3.2%.'],
        feedback: {
          1: 'On paid orders by real customers the rate is 3.10%, below 3.2%.',
          2: 'Counting every record gives 3.28%, above 3.2%, so one definition meets it.',
          3: 'It can, and here it does: the definition moves the rate from 3.28% to 3.10%, either side of the target.',
        } },
    ],
  },
  {
    id: 'b01-bq-g4', type: 'fill', kind: 'applied',
    prompt: 'Complete an operational definition of a new customer for Lantern’s monthly report.',
    text: 'A new customer in a month is a customer whose [[0]] order with the online shop was placed in that month, identified by [[1]], counting [[2]] orders only, with each order dated in [[3]].',
    blanks: [
      { options: ['first ever', 'largest', 'most recent'], answer: 0 },
      { options: ['customer_id', 'e-mail address', 'delivery postcode'], answer: 0 },
      { options: ['paid', 'all submitted', 'refunded'], answer: 0 },
      { options: ['the shop’s own time zone, the same for every order', 'the customer’s local time zone', 'whatever time zone each export happens to use'], answer: 0 },
    ],
    hints: [
      'A customer is new in the month of their first order ever, not their latest. Customers are best identified by the system’s stable identifier, because e-mail addresses change and can be shared.',
      'A cancelled or test order is not a purchase. And an order placed just before midnight should land in the same month whoever counts it.',
    ],
    solution: 'A new customer is one whose first ever paid order falls in the month, identified by customer_id (a stable identifier; e-mails change and postcodes are shared), with every order dated in one fixed time zone, so that an order placed near midnight on the last day of a month is always counted in the same month. B02 shows what goes wrong when exports mix time zones.',
  },
];

export const independent = [
  {
    id: 'b01-bq-i1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional regional airline’s analyst writes: “Ahead of the board’s decision on 30 June about adding a second daily flight to Eastmere, did the average share of seats filled, per departure of the existing evening flight, over January–May exceed 85%, compared with the same months last year?” Which part of a well-framed question is each phrase?',
    items: [
      'over January–May',
      'exceed 85%',
      'per departure',
      'compared with the same months last year',
      'the average share of seats filled',
      'ahead of the board’s decision on 30 June about adding a second daily flight',
    ],
    categories: ['Decision', 'Measure', 'Unit of analysis', 'Time frame', 'Comparison', 'Threshold'],
    answer: [3, 5, 2, 4, 1, 0],
    feedback: {
      1: '85% is the level that would justify the decision: the threshold.',
      2: 'Each departure is one unit; the average is taken over departures.',
      3: 'Last year’s same months are the baseline that removes the season.',
    },
    solution: 'Decision: the board’s choice on 30 June. Measure: the share of seats filled. Unit of analysis: the departure. Time frame: January–May. Comparison: the same months last year. Threshold: 85%.',
  },
  {
    id: 'b01-bq-i2', type: 'num', kind: 'numerical',
    prompt: 'In one week a fictional food-delivery service had 400 customers who ordered only through its app, placing 720 orders, and 600 customers who ordered only on its website, placing 780 orders. What percentage of the week’s orders came through the app? Give one decimal place.',
    answer: 48, check: () => 720 / (720 + 780) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 40, say: 'That is the app’s share of customers (400 of 1,000). The question asks about orders.' },
      { value: 52, say: 'That is the website’s share of orders. The app placed 720 of the 1,500.' },
      { value: 92.3, say: 'That divides app orders by website orders. A share divides by the total of both: 720 + 780.' },
    ],
    solution: 'Total orders: 720 + 780 = 1,500. App share = 720 ÷ 1,500 × 100 = 48.0%. Counted in customers the app’s share is only 40%, because app customers ordered 1.8 times each against 1.3 on the website.',
  },
  {
    id: 'b01-bq-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Loyalty-card sign-ups fell at a fictional café chain after some of its cafés switched to a new sign-up form on 1 May. Which is a testable hypothesis?',
    options: [
      'If the new form is the cause, sign-ups per 100 customers should have fallen after 1 May in the cafés that switched, but not in the cafés still using the old form.',
      'Something about the new form might be putting some people off.',
      'Customers do not like change.',
      'The fall in sign-ups has many causes.',
    ],
    answer: 0,
    feedback: {
      1: 'This names no measure, comparison or period, so no result could contradict it.',
      2: 'A general claim about customers predicts nothing specific that data could check.',
      3: 'Possibly true, but it rules nothing out, so it cannot be tested.',
    },
    solution: 'The first option names the measure (sign-ups per 100 customers), the timing (after 1 May), the comparison (cafés that did not switch) and what would contradict it (a similar fall in the cafés that kept the old form).',
  },
  {
    id: 'b01-bq-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym recorded 3,100 visits in January (31 days) and 2,856 in February (28 days). By what percentage did visits per day change from January to February? Give one decimal place, with a minus sign for a fall.',
    answer: 2, check: () => ((2856 / 28) / (3100 / 31) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: -7.9, say: 'That compares the monthly totals, which penalises February for having three fewer days. Compare visits per day.' },
      { value: -2, say: 'Check the direction: February averaged 102 visits a day against January’s 100, a rise.' },
    ],
    solution: 'January: 3,100 ÷ 31 = 100 visits a day. February: 2,856 ÷ 28 = 102 a day. Change: (102 − 100) ÷ 100 × 100 = +2.0%. The monthly totals fell by 7.9%, but only because February is shorter.',
  },
  {
    id: 'b01-bq-i5', type: 'multi', kind: 'applied',
    prompt: 'Lantern is starting a monthly report of “orders”. With whom should the analyst check the definition of an order? Select all that apply.',
    options: [
      'Ana, who will use the report to make decisions',
      'Whoever manages the shop’s order system and knows how cancellations and test orders are recorded',
      'The packing team, who see which orders are actually shipped',
      'An analyst at a competing coffee company',
      'The web agency, if the website records the orders',
      'Nobody: the order system’s total is the definition',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'A competitor is not a stakeholder in Lantern’s report and has no knowledge of how its orders are recorded.',
      5: 'The system’s total includes whatever the system happens to record, such as test orders. That is a number, not an agreed definition.',
    },
    solution: 'The decision-maker (Ana) must agree that the definition fits her questions; the people who produce or handle the data (the order system’s manager, the web agency, the packing team) know what is actually recorded and where it differs from what is shipped.',
  },
  {
    id: 'b01-bq-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put these steps of framing and answering a business question in order.',
    items: [
      'Ask the decision-maker what decision the answer will inform, and by when.',
      'Rewrite the question with a defined measure, unit, time frame, comparison and threshold.',
      'Agree the written question brief with the decision-maker.',
      'Open the data and carry out the analysis the brief describes.',
      'Report the answer, with its uncertainty, in time for the decision.',
    ],
    solution: 'Decision first, because it determines everything else; then the measurable question; then agreement, before any data are opened, so that the definitions cannot drift towards a convenient answer; then the analysis; then the report, in time to be used.',
  },
];

export const check = [
  {
    id: 'b01-bq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is an operational definition?',
    options: [
      'An exact statement of how a concept is measured (which records count, from which source, by which rule and over which period) so that two people get the same number',
      'The meaning of the word in a dictionary',
      'The definition the operations team uses in its own reports',
      'A definition chosen after seeing the data, so that it fits the result',
    ],
    answer: 0,
    feedback: {
      1: 'A dictionary meaning (“an order is a request to buy something”) does not say which records to count.',
      2: '“Operational” refers to how the concept is measured, not to the operations department.',
      3: 'Choosing a definition after seeing the data invites one that flatters the result. Agree it beforehand.',
    },
    solution: 'An operational definition turns a concept into a measurement rule: which records, which source, which rule, which period. Its test is that two people applying it to the same data get the same number.',
  },
  {
    id: 'b01-bq-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional online pet-supply shop had 18,000 visits in March and 612 order records. Of these, 9 were staff test orders and 27 were cancelled before payment. What was its conversion rate on paid orders by real customers? Give a percentage to two decimal places.',
    answer: 3.2, check: () => (612 - 9 - 27) / 18000 * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 3.4, say: 'That uses all 612 records. Leave out the 9 tests and the 27 cancellations first.' },
      { value: 3.35, say: 'That leaves out the staff tests but not the cancellations.' },
      { value: 3.25, say: 'That leaves out the cancellations but not the staff tests.' },
    ],
    solution: 'Paid orders by real customers: 612 − 9 − 27 = 576. Conversion: 576 ÷ 18,000 × 100 = 3.20%.',
  },
  {
    id: 'b01-bq-k3', type: 'multi', kind: 'applied',
    prompt: 'Which details would turn Ana’s target “a conversion rate of at least 3.0%” into a SMART objective? Select all that apply.',
    options: [
      'The period it applies to, such as every calendar month from October to December 2026',
      'The exact formula: which orders and which visits count, and whether web and app are counted together',
      'Raising the level to 5%, to make it more ambitious',
      'Why it matters: conversion is the part of revenue the website most affects',
      'The colour of the dashboard tile that shows it',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'A higher level does not make a target SMART, and it may make it unachievable.',
      4: 'Presentation does not affect whether the objective is specific, measurable, achievable, relevant or time-bound.',
    },
    solution: 'The period makes it time-bound; the exact formula makes it specific and measurable; the link to the website makes its relevance explicit. Ana’s judgement that 3.0% is realistic covers achievable.',
  },
  {
    id: 'b01-bq-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional report for one week says: “The app accounts for 30% of our customers but 36% of our orders.” What explains the difference?',
    options: [
      'App customers placed more orders each, on average, so the app’s share is larger when the unit counted is the order.',
      'One of the two figures must be wrong.',
      'App orders are larger in value than website orders.',
      'The app has more customers than the website.',
    ],
    answer: 0,
    feedback: {
      1: 'Both can be right: they count different units.',
      2: 'Order value would affect a share of revenue, not a share of the number of orders.',
      3: 'The app has 30% of customers, so the website has more.',
    },
    solution: 'A share depends on the unit. If app customers order more often than website customers, the app’s share of orders exceeds its share of customers. Both figures are correct answers to different questions.',
  },
  {
    id: 'b01-bq-k5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the checklist.',
    text: 'A SMART objective is Specific, Measurable, [[0]], Relevant and [[1]]. It is only as measurable as the [[2]] behind its measure.',
    blanks: [
      { options: ['Achievable', 'Accurate', 'Automated'], answer: 0 },
      { options: ['Time-bound', 'Tested', 'Targeted'], answer: 0 },
      { options: ['operational definition', 'dashboard', 'software'], answer: 0 },
    ],
    solution: 'Specific, Measurable, Achievable (some sources say Attainable), Relevant and Time-bound. “At least 3.0% conversion” is measurable only once visits and orders have operational definitions.',
  },
  {
    id: 'b01-bq-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery sold 4,650 loaves in March (31 days) and 4,440 in April (30 days). By what percentage did sales per day change from March to April? Give one decimal place, with a minus sign for a fall.',
    answer: -1.3, check: () => ((4440 / 30) / (4650 / 31) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: -4.5, say: 'That compares the monthly totals, which ignores that April has one day fewer. Compare loaves per day.' },
      { value: 1.3, say: 'Check the direction: April averaged 148 loaves a day against March’s 150, a fall.' },
    ],
    solution: 'March: 4,650 ÷ 31 = 150 a day. April: 4,440 ÷ 30 = 148 a day. Change: (148 − 150) ÷ 150 × 100 ≈ −1.3%. The totals fell 4.5%, mostly because April is a day shorter.',
  },
];
