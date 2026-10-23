// data-types.ex.js — B01 · Types of data: widgets, practice and the knowledge check (answer keys live here).
// Every business, person and number is fictional unless it comes from case.js. Every number is recomputed by `check`.

const LEVELS = ['Nominal', 'Ordinal', 'Interval', 'Ratio'];
const STARS = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
/** The value at 1-based position p of the ratings described by counts[0..4] (1 to 5 stars). */
const starAt = (counts, p) => { let cum = 0; for (let i = 0; i < counts.length; i++) { cum += counts[i]; if (p <= cum) return i + 1; } return counts.length; };
const ratings = (counts) => counts.flatMap((c, i) => Array(c).fill(i + 1));

export const widgets = {
  'dt-ratings': {
    type: 'formula',
    title: 'Same mean, different months',
    intro: 'How many customers gave each star rating? The explorer shows the mean, the median and the shares at each end of the scale.',
    inputs: [
      { id: 's1', label: '1-star ratings', min: 0, max: 60, step: 1, value: 0, fmt: 'int' },
      { id: 's2', label: '2-star ratings', min: 0, max: 60, step: 1, value: 0, fmt: 'int' },
      { id: 's3', label: '3-star ratings', min: 0, max: 60, step: 1, value: 10, fmt: 'int' },
      { id: 's4', label: '4-star ratings', min: 0, max: 60, step: 1, value: 20, fmt: 'int' },
      { id: 's5', label: '5-star ratings', min: 0, max: 60, step: 1, value: 10, fmt: 'int' },
    ],
    compute: (v) => {
      const c = [v.s1, v.s2, v.s3, v.s4, v.s5];
      const n = c.reduce((a, b) => a + b, 0);
      if (n === 0) return { error: 'Enter at least one rating.' };
      const mean = c.reduce((a, f, i) => a + (i + 1) * f, 0) / n;
      const lo = starAt(c, Math.floor((n + 1) / 2)), hi = starAt(c, Math.ceil((n + 1) / 2));
      const median = lo === hi ? `${lo} ${lo === 1 ? 'star' : 'stars'}` : `between ${lo} and ${hi} stars`;
      const low = (c[0] + c[1]) / n * 100, high = (c[3] + c[4]) / n * 100;
      const top = Math.max(...c);
      const modes = c.map((f, i) => (f === top ? i + 1 : null)).filter(Boolean);
      return {
        headline: { label: 'Mean rating', value: `${f2(mean)} stars` },
        rows: [
          ['Ratings', `${n}`],
          ['Median', median],
          ['Most common rating (mode)', modes.length === 5 ? 'all equal' : modes.map((m) => `${m}`).join(' and ')],
          ['Share of 1–2 stars', `${f1(low)}%`],
          ['Share of 4–5 stars', `${f1(high)}%`],
        ],
        note: low >= 15 && mean >= 3.8
          ? `The mean of ${f2(mean)} looks healthy, yet ${f1(low)}% of these customers gave one or two stars. A report that gives only the mean hides them: give the distribution, or at least the median and the share of low ratings.`
          : low >= 25 && high >= 25
            ? `The ratings split towards the two ends of the scale (${f1(low)}% low, ${f1(high)}% high), so a mean of ${f2(mean)} describes very few actual customers. Report the counts.`
            : `With these counts the mean (${f2(mean)}) and the median (${median}) tell a similar story. Now move most of the 3- and 4-star ratings to the two ends of the scale and watch the mean barely change while the shape does.`,
        chart: { kind: 'bar', x: { label: 'Rating', values: STARS }, series: [{ name: 'Ratings', values: c }], y: { label: 'Number of ratings', format: 'int' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-dt-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each of Lantern’s sources by how it is organised.',
    items: [
      'The order export: one row per order, with the same 14 columns for every order',
      'The app’s event log: one JSON record per event, each with its own named fields',
      'Survey comments written in customers’ own words',
      'Photos customers send of parcels damaged in the post',
      'Ana’s monthly summary spreadsheet',
      'Order-confirmation e-mails, with labelled sender, date and subject fields and a free-text body',
    ],
    categories: ['Structured', 'Semi-structured', 'Unstructured'],
    answer: [0, 1, 2, 2, 0, 1],
    hints: [
      'Ask whether every record has the same fields in the same columns. If not, ask whether its parts are at least labelled.',
      'JSON records and e-mail headers label their parts without forcing one table layout; free text and images have no labels at all.',
    ],
    feedback: {
      1: 'Each event is labelled field by field, but different events carry different fields, so the log doesn’t fit one table: semi-structured.',
      3: 'A photo has no fields at all until someone codes it (damaged: yes or no): unstructured.',
      5: 'The header fields are labelled and the body is free text: semi-structured.',
    },
    solution: 'The order export and the monthly summary are structured: fixed columns, the same fields for every record. The event log and the e-mails are semi-structured: labelled parts without one fixed layout. Comments and photos are unstructured: they must be coded before anything in them can be counted.',
  },
  {
    id: 'b01-dt-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each variable from Lantern’s data by its level of measurement.',
    items: ['channel (web or app)', 'answer to “The new checkout was easy to use” (disagree, neutral, agree)', 'order date', 'web visits in a month', 'customer_id', 'order total ($)', 'roast (light, medium, dark)', 'gift box in the order (yes or no)'],
    categories: LEVELS,
    answer: [0, 1, 2, 3, 0, 3, 1, 0],
    hints: [
      'Ask in turn: does the order of the values matter? Are differences meaningful? Does zero mean “none”?',
      'Dates allow differences but not ratios. An identifier is a label, however it is written.',
    ],
    feedback: {
      1: 'The three answers are ordered, but the step from disagree to neutral needn’t equal the step from neutral to agree: ordinal.',
      2: 'The gap between two dates is meaningful, but no date is twice another: interval.',
      3: 'Zero visits means none, and 10,400 visits is twice 5,200: ratio.',
      4: 'customer_id labels a customer; arithmetic on it means nothing: nominal.',
      6: 'Light, medium and dark are ordered categories: ordinal.',
    },
    solution: 'channel, customer_id and gift box: nominal. The checkout answer and roast: ordinal. Order date: interval. Web visits and order total: ratio, because zero means none.',
  },
  {
    id: 'b01-dt-g3', type: 'steps', kind: 'applied',
    prompt: 'Ana rolls part of the order export up into the table below (fictional): one row for each customer in each month in which they ordered. Describe it.',
    data: { table: {
      head: ['customer_id', 'month', 'orders', 'spend ($)'],
      rows: [
        ['C0305', 'Oct 2026', '1', '41.50'],
        ['C0305', 'Nov 2026', '2', '83.00'],
        ['C0311', 'Oct 2026', '1', '33.00'],
        ['C0311', 'Nov 2026', '1', '34.00'],
        ['C0322', 'Nov 2026', '1', '58.00'],
      ],
    } },
    solution: 'One row is one customer in one month, and the same customers appear in more than one month, so this is panel data. It has 5 rows but only 3 distinct customers (C0305, C0311 and C0322) and 6 orders.',
    steps: [
      { id: 'b01-dt-g3-s1', type: 'mc',
        prompt: 'What does one row describe?',
        options: ['One customer in one month', 'One order', 'One customer', 'One month'],
        answer: 0,
        hints: ['C0305 appears twice. What differs between its two rows?', 'C0305’s November row records 2 orders, so a row can hold more than one order.'],
        feedback: {
          1: 'C0305’s November row has 2 orders, so a row can be bigger than one order.',
          2: 'C0305 has two rows, one per month, so a row is smaller than a customer.',
          3: 'Each month has several rows, one per customer.',
        } },
      { id: 'b01-dt-g3-s2', type: 'mc',
        prompt: 'How does this table relate to time?',
        options: ['Panel data: the same customers in several months', 'Time-series data: one unit followed over time', 'Cross-sectional data: many units at one time'],
        answer: 0,
        hints: ['Is there one unit or several? One period or several?'],
        feedback: {
          1: 'There are several units (customers), not one.',
          2: 'There are two months, and two of the customers appear in both.',
        } },
      { id: 'b01-dt-g3-s3', type: 'num',
        prompt: 'How many distinct customers does the table contain?',
        answer: 3, check: () => new Set(['C0305', 'C0305', 'C0311', 'C0311', 'C0322']).size, unit: 'customers', places: 0, tol: 0.5,
        hints: ['Count distinct values of customer_id, not rows.'],
        wrong: [
          { value: 5, say: 'That is the number of rows. C0305 and C0311 each have two rows, one per month.' },
          { value: 6, say: 'That is the number of orders (1 + 2 + 1 + 1 + 1). Count distinct customer_id values.' },
          { value: 2, say: 'That is the number of months.' },
        ] },
    ],
  },
  {
    id: 'b01-dt-g4', type: 'num', kind: 'numerical',
    prompt: 'Harborview Hotel (fictional) received 45 guest reviews in March, each scored from 1 to 5: 2 ones, 3 twos, 6 threes, 15 fours and 19 fives. What is the mean score? Give two decimal places.',
    answer: 4.02, check: () => (1 * 2 + 2 * 3 + 3 * 6 + 4 * 15 + 5 * 19) / (2 + 3 + 6 + 15 + 19), unit: 'stars', places: 2, tol: 0.006,
    hints: [
      'Multiply each score by the number of reviews that gave it, add the products, and divide by the number of reviews.',
      'The products are 2, 6, 18, 60 and 95.',
    ],
    wrong: [
      { value: 3, say: 'That averages the five possible scores, 1 to 5, as if each had been given once. Weight each score by the number of reviews that gave it.' },
      { value: 9, say: 'That is the average count per score (45 ÷ 5). Multiply each score by its count first.' },
      { value: 4, say: 'That is the median (the 23rd of 45 scores in order). The mean uses every score: Σ s × f ÷ 45.' },
    ],
    solution: 'Σ s × f = 1 × 2 + 2 × 3 + 3 × 6 + 4 × 15 + 5 × 19 = 2 + 6 + 18 + 60 + 95 = 181. Reviews: 2 + 3 + 6 + 15 + 19 = 45. Mean = 181 ÷ 45 ≈ 4.02. Report the median (4) and the share of low scores too: 5 of the 45 reviews, about 11%, gave one or two stars.',
  },
];

export const independent = [
  {
    id: 'b01-dt-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Larkspur Regional Airways (fictional) records these variables for each passenger trip. Classify each one.',
    items: ['Number of checked bags', 'Flight time in minutes', 'Seat (such as 14C)', 'Fare paid ($)', 'Cabin (economy, premium or business)', 'Number of earlier trips with the airline'],
    categories: ['Numerical, discrete', 'Numerical, continuous', 'Categorical'],
    answer: [0, 1, 2, 1, 2, 0],
    feedback: {
      1: 'Time is measured and could be 83.5 minutes; recording it in whole minutes doesn’t turn it into a count: continuous.',
      2: 'A seat label names a place; 14C isn’t an amount: categorical.',
      3: 'Money has so many possible values that analysts treat it as continuous.',
      4: 'Cabins are ordered categories (an ordinal variable), not amounts.',
    },
    solution: 'Bags and earlier trips are counts: numerical, discrete. Flight time and fare are treated as measurements: numerical, continuous. Seat and cabin are categories (seat nominal, cabin ordinal).',
  },
  {
    id: 'b01-dt-i2', type: 'mc', kind: 'conceptual',
    prompt: 'A new dashboard for Lantern shows the tiles “Average customer_id: 1,348.6” and “Average postcode: 10,214”. What should you conclude?',
    options: [
      'Both tiles are meaningless: customer_id and postcode are identifiers, which should only be counted or matched',
      'Customers are getting newer, because the average customer_id is high',
      'Most customers live near postcode 10214',
      'The tiles are fine as long as no values are missing',
    ],
    answer: 0,
    feedback: {
      1: 'A higher customer number may mean a later sign-up, but the average of the numbers says nothing useful about customers.',
      2: 'An average of postcodes can be a postcode where nobody lives; postcodes label places, they aren’t positions on a line.',
      3: 'Complete data doesn’t rescue a meaningless calculation.',
    },
    solution: 'Both columns are identifiers: labels written with digits. The adding test fails (two customer numbers or two postcodes add up to nothing), so their averages are meaningless. The dashboard should count customers, or show the most common postcodes, instead.',
  },
  {
    id: 'b01-dt-i3', type: 'classify', kind: 'applied',
    prompt: 'Ana is investigating September’s fall in orders. Classify each source as primary or secondary data for her question.',
    items: [
      'The October survey she wrote and sent to September’s customers',
      'The shop platform’s order export',
      'National household spending figures from a government statistics office',
      'A session in which she watches five customers try to pay on their phones',
      'The payment provider’s monthly report of failed card payments',
    ],
    categories: ['Primary', 'Secondary'],
    answer: [0, 1, 1, 0, 1],
    feedback: {
      1: 'The export exists to run the shop; Ana is reusing it for a new question, so it is secondary (internal) data.',
      3: 'She collects it herself, for this question: primary data, gathered by observation.',
      4: 'The provider produces it to report on payments; reused here, it is secondary (external) data.',
    },
    solution: 'The survey and the observation session are primary: collected for this question. The export, the official statistics and the payment report are secondary: collected for other purposes and reused. The export is internal; the other two are external.',
  },
  {
    id: 'b01-dt-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional university asked 47 students to rate a module from 1 to 5 stars: 4 gave one star, 6 two, 10 three, 15 four and 12 five. What is the median rating?',
    answer: 4, check: () => { const v = ratings([4, 6, 10, 15, 12]); return v[(v.length + 1) / 2 - 1]; }, unit: 'stars', places: 0, tol: 0.1,
    wrong: [
      { value: 3.53, say: 'That is the mean (166 ÷ 47). The median is the middle rating when all 47 are put in order.' },
      { value: 3, say: 'That is the middle of the scale, not the middle rating. Find the 24th of the 47 ratings in order.' },
      { value: 24, say: 'That is the position of the median, (47 + 1) ÷ 2. Now find which rating sits at that position.' },
    ],
    solution: 'The median is at position (47 + 1) ÷ 2 = 24. Counting up, ratings 1–4 are one star, 5–10 two, 11–20 three and 21–35 four, so the 24th is a four. The mean, 166 ÷ 47 ≈ 3.53, is lower because the ten one- and two-star ratings pull it down.',
  },
  {
    id: 'b01-dt-i5', type: 'rows', kind: 'applied',
    prompt: 'Below is part of the documentation for a customer file (fictional). Select every column that should be stored and treated as text, even though its values are written with digits.',
    data: { table: {
      head: ['Column', 'Example value', 'Meaning'],
      rows: [
        ['postcode', '02134', 'Delivery postcode'],
        ['quantity', '3', 'Packs ordered'],
        ['phone', '6175550142', 'Customer’s phone number'],
        ['sku', '000417', 'Product code'],
        ['order_total', '41.20', 'Amount charged ($)'],
        ['first_order_year', '2026', 'Year of the customer’s first order'],
        ['customer_no', '10442', 'Customer number'],
      ],
    } },
    answer: [0, 2, 3, 6],
    solution: 'postcode, phone, sku and customer_no are identifiers: adding or averaging them means nothing, and postcode and sku would lose their leading zeros if stored as numbers. quantity and order_total are amounts. first_order_year is a point in time: differences between years are meaningful (2026 − 2024 = 2 years), so it is an interval number.',
  },
  {
    id: 'b01-dt-i6', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to know whether customers who first bought a gift box in November 2026 came back and ordered again in December. Which data can answer that?',
    options: [
      'A panel built from the order export, one row per customer per month, so that each November gift-box buyer can be followed into December',
      'The monthly summary’s gift-box orders for November and December',
      'A cross-section of all December orders',
      'The October survey of September’s customers',
    ],
    answer: 0,
    feedback: {
      1: 'Gift-box orders rose from 88 to 231, but totals can’t show whether the same people bought twice.',
      2: 'December’s orders alone can’t show who also bought in November unless you link them to November orders, and that link makes a panel.',
      3: 'Those customers ordered in September, before the gift season, and the survey asked nothing about repeat orders.',
    },
    solution: 'The question is about the same customers in two months, so it needs panel data: follow each November gift-box buyer (identified by customer_id) and check for a December order. Monthly totals and single-month cross-sections can’t separate returning buyers from new ones.',
  },
];

export const check = [
  {
    id: 'b01-dt-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A colleague averages the “web visits” column of Ana’s monthly summary, which has one row per month from July to December. What has she calculated?',
    options: ['The average number of web visits per month', 'The average number of visits per customer', 'The average number of pages viewed per visit', 'The website’s conversion rate'],
    answer: 0,
    feedback: {
      1: 'The table contains no customers: one row is one month.',
      2: 'Nothing in the table counts pages.',
      3: 'A conversion rate needs orders as well as visits, and divides one by the other.',
    },
    solution: 'One row is one month, so the average of a column is an average per month: the mean number of web visits in a month.',
  },
  {
    id: 'b01-dt-k2', type: 'classify', kind: 'conceptual',
    prompt: 'Northfield University (fictional) keeps these variables for each student. Classify each by level of measurement.',
    items: ['student_id', 'Programme (Economics, Nursing, …)', 'Year of study (1st, 2nd, 3rd, 4th)', 'Date of enrolment', 'Credits earned', 'Module grade (A to F)'],
    categories: LEVELS,
    answer: [0, 0, 1, 2, 3, 1],
    feedback: {
      0: 'student_id is an identifier: a label, so nominal.',
      2: 'Years of study are ordered stages; the step from 1st to 2nd year isn’t a fixed amount of anything: ordinal.',
      3: 'Differences between dates are meaningful, ratios are not: interval.',
      4: 'Zero credits means none, and 60 credits is twice 30: ratio.',
      5: 'Grades rank work, but the gap from A to B needn’t equal the gap from B to C: ordinal.',
    },
    solution: 'student_id and programme: nominal. Year of study and grade: ordinal. Date of enrolment: interval. Credits earned: ratio.',
  },
  {
    id: 'b01-dt-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional online clothing shop received 25 reviews of a jacket: 1 one-star, 2 two-star, 4 three-star, 10 four-star and 8 five-star. What is the mean rating? Give two decimal places.',
    answer: 3.88, check: () => (1 * 1 + 2 * 2 + 3 * 4 + 4 * 10 + 5 * 8) / 25, unit: 'stars', places: 2, tol: 0.006,
    wrong: [
      { value: 4, say: 'That is the median (the 13th of 25 ratings in order). The mean weights every score by its count: Σ s × f ÷ 25.' },
      { value: 3, say: 'That averages the five possible scores as if each had been given once.' },
      { value: 5, say: 'That is the average count per score (25 ÷ 5).' },
    ],
    solution: 'Σ s × f = 1 + 4 + 12 + 40 + 40 = 97; 97 ÷ 25 = 3.88 stars. The median is 4, and 3 of the 25 reviews (12%) gave one or two stars.',
  },
  {
    id: 'b01-dt-k4', type: 'mc', kind: 'applied',
    prompt: 'The average restaurant bill per guest at Harborview Hotel (fictional) rose by $6 from June to July. The manager asks whether regular guests are spending more. Which data would answer that most directly?',
    options: [
      'Bills of the same regular guests in June and in July (a panel)',
      'The restaurant’s total takings for each month (a time series)',
      'All July bills (a cross-section)',
      'A survey asking July’s guests whether they plan to spend more',
    ],
    answer: 0,
    feedback: {
      1: 'Monthly totals mix regular guests with new ones; a rise could come from more guests or different guests.',
      2: 'July’s bills alone can’t show a change, and they include guests who weren’t there in June.',
      3: 'Plans are not spending, and the question is about what already happened.',
    },
    solution: 'Comparing two months’ averages compares two cross-sections, which may contain different guests. Only following the same regular guests through both months (a panel) separates a change in their spending from a change in who was eating.',
  },
  {
    id: 'b01-dt-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are meaningful summaries of an ordinal variable such as a 1–5 star rating? Select all that apply.',
    options: [
      'The number of ratings in each category',
      'The median rating',
      'The most common rating (the mode)',
      'The share of ratings that are 4 or 5',
      '“A rating of 4 is twice as good as a rating of 2”',
      '“The rating rose by 25%, from 4 to 5”',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Ratios need a ratio variable with a true zero; ratings only rank.',
      5: 'A percentage change divides one value by another, which an ordinal scale doesn’t support.',
    },
    solution: 'Counts, shares, the mode and the median use only the order of the categories, so they suit ordinal data. Statements about ratios or percentage changes assume a true zero and equal steps, which a rating scale doesn’t have.',
  },
  {
    id: 'b01-dt-k6', type: 'num', kind: 'numerical',
    prompt: 'In a fictional sample of 160 orders from a coffee roaster’s online shop, 56 came through the app and the rest through the website. What percentage came through the app? One decimal place.',
    answer: 35, check: () => 56 / 160 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 0.35, say: 'That is the proportion. Multiply by 100 to express it as a percentage.' },
      { value: 65, say: 'That is the website’s share: 104 ÷ 160.' },
      { value: 104, say: 'That is the number of web orders, not a percentage.' },
    ],
    solution: 'Share = 56 ÷ 160 × 100 = 35.0%. Channel is nominal, so shares (and the most common channel) are the summaries it supports.',
  },
];
