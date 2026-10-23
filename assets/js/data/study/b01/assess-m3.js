// assess-m3.js — B01 module 3 test: Measuring and reading results (kpis, summarising-data, interpreting-results).
// No hints. Each item has a full solution, shown when the student reviews the test. Every business and figure is fictional.

export const items = [
  {
    id: 'b01-m3-1', lesson: 'kpis', type: 'num', kind: 'numerical',
    prompt: 'A fictional coffee-subscription company had 52,000 website sessions and 1,404 paid orders in a month. What was its conversion rate? Give a percentage to two decimal places.',
    answer: 2.7, check: () => 1404 / 52000 * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 0.027, say: 'That is the proportion. Multiply by 100 for a percentage.' },
      { value: 37.04, say: 'You divided sessions by orders. Conversion puts orders on top: 1,404 ÷ 52,000.' },
    ],
    solution: 'Conversion = orders ÷ sessions × 100 = 1,404 ÷ 52,000 × 100 = 2.70%.',
  },
  {
    id: 'b01-m3-2', lesson: 'kpis', type: 'rows', kind: 'applied',
    prompt: 'A fictional online bookshop drafts its KPI dictionary. Select every entry that is not yet a usable KPI.',
    data: { table: {
      head: ['KPI', 'Formula', 'Target and direction', 'Owner'],
      rows: [
        ['Conversion rate', 'Paid orders ÷ sessions × 100', '3.5%; higher is better', 'Shop manager'],
        ['Customer happiness', '—', 'Higher is better', 'Everyone'],
        ['Average order value', 'Revenue ÷ paid orders', '$52; higher is better', 'Founder'],
        ['Refund rate', 'Refunded orders ÷ orders × 100', '—', 'Operations lead'],
        ['Web traffic', 'Sessions, or perhaps users', '20,000 a month', 'Marketing'],
        ['Returning-customer share', '(Paid orders − first orders) ÷ paid orders × 100', '40%; higher is better', 'Marketing'],
      ],
    } },
    answer: [1, 3, 4],
    solution: '“Customer happiness” has no formula and no single owner (“everyone” means no one). The refund rate has a formula and an owner but no target or direction. “Web traffic” leaves its formula open: sessions and users give different numbers. The other three have an exact formula, a target with a direction, and an owner.',
  },
  {
    id: 'b01-m3-3', lesson: 'kpis', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional bank rewards branch staff for the number of new current accounts they open each month. A year later the count is well above target, but the bank’s deposits have not grown. What is the most likely explanation, and the best fix?',
    options: [
      'Staff opened accounts that customers didn’t need or use; pair the count with a measure such as accounts still active after 90 days.',
      'The target was too low; raise it so that staff work harder.',
      'Deposits are a lagging indicator, so they will catch up next year without any change.',
      'Account openings are a lagging indicator, so they can’t be used as a target.',
    ],
    answer: 0,
    feedback: {
      1: 'A higher target increases the pressure to move the count by any means: Goodhart’s law gets worse, not better.',
      2: 'Deposits do lag, but a year of rising openings with flat deposits suggests the openings are not the kind that lead to deposits.',
      3: 'Openings are, if anything, a leading indicator. The problem is that a single rewarded count can be moved without serving the objective.',
    },
    solution: 'Goodhart’s law: once the count was rewarded, it could be raised by opening accounts that were never used. A balanced pair (openings and accounts still active after 90 days) or a guardrail (deposit growth) makes that kind of gaming visible.',
  },
  {
    id: 'b01-m3-4', lesson: 'kpis', type: 'num', kind: 'applied',
    prompt: 'A fictional online tea shop expects 16,000 visits next month and an AOV of $50. What conversion rate does it need to reach revenue of $20,000? Give a percentage to one decimal place.',
    answer: 2.5, check: () => 20000 / (16000 * 50) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 0.025, say: 'That is the proportion. Express it as a percentage.' },
      { value: 400, say: 'That is the number of orders needed (20,000 ÷ 50). Divide it by the visits.' },
    ],
    solution: 'Orders needed = 20,000 ÷ 50 = 400. Conversion needed = 400 ÷ 16,000 × 100 = 2.5%.',
  },
  {
    id: 'b01-m3-5', lesson: 'summarising-data', type: 'num', kind: 'numerical',
    prompt: 'A fictional shop’s email click rate fell from 5.0% to 4.0%. What was the relative (percentage) change? Enter a fall as a negative number.',
    answer: -20, check: () => (4.0 - 5.0) / 5.0 * 100, unit: '%', places: 0, tol: 0.05,
    wrong: [
      { value: -1, say: 'That is the change in percentage points. The relative change divides it by the old rate, 5.0.' },
      { value: -25, say: 'You divided by the new rate, 4.0. The base is the old rate, 5.0.' },
    ],
    solution: 'The rate fell 1 percentage point (5.0 − 4.0); relative to the old rate that is (4.0 − 5.0) ÷ 5.0 × 100 = −20%.',
  },
  {
    id: 'b01-m3-6', lesson: 'summarising-data', type: 'num', kind: 'numerical',
    prompt: 'A fictional roastery’s orders grew from 400 a month to 625 a month over two years. What was the compound annual growth rate? Give a whole percentage.',
    answer: 25, check: () => ((625 / 400) ** (1 / 2) - 1) * 100, unit: '%', places: 0, tol: 0.05,
    wrong: [
      { value: 28.13, say: 'That halves the total growth of 56.25%. Growth compounds: take the square root of 625 ÷ 400.' },
      { value: 56.25, say: 'That is the total growth over two years, not the yearly rate.' },
    ],
    solution: 'g = (625 ÷ 400)^(1/2) − 1 = 1.5625^0.5 − 1 = 1.25 − 1 = 25% a year. Check: 400 × 1.25 × 1.25 = 625.',
  },
  {
    id: 'b01-m3-7', lesson: 'summarising-data', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional courier delivers most parcels in two or three days, but a few lost parcels take more than a month. Which statement is correct?',
    options: [
      'The lost parcels pull the mean above the median, so the median better describes a typical delivery.',
      'The lost parcels pull the median above the mean, so the mean better describes a typical delivery.',
      'The mean and median will be about equal, because most parcels take two or three days.',
      'The range is the best summary of a typical delivery time.',
    ],
    answer: 0,
    feedback: {
      1: 'The median depends only on the middle values, so a few extreme ones barely move it. It is the mean that is pulled towards the long tail.',
      2: 'The month-long deliveries add a lot to the total, so they pull the mean up; the median stays at two or three days.',
      3: 'The range measures spread, and here it is set entirely by the slowest parcel.',
    },
    solution: 'In right-skewed data a few very large values pull the mean towards the tail, above the median. For “typical delivery time” report the median (and, for spread, the IQR); use the mean only if you need totals.',
  },
  {
    id: 'b01-m3-8', lesson: 'summarising-data', type: 'num', kind: 'applied',
    prompt: 'A fictional retailer’s three warehouses shipped 1,200 orders with a 1.5% error rate, 300 orders with a 4.0% error rate and 500 orders with a 2.0% error rate. What was the company-wide error rate? Give one decimal place.',
    answer: 2, check: () => (1200 * 0.015 + 300 * 0.04 + 500 * 0.02) / (1200 + 300 + 500) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 2.5, say: 'That is the plain average of the three rates. Weight each by its orders, or divide total errors by total orders.' }],
    solution: 'Errors = 1,200 × 0.015 + 300 × 0.04 + 500 × 0.02 = 18 + 12 + 10 = 40. Orders = 2,000. Error rate = 40 ÷ 2,000 × 100 = 2.0%.',
  },
  {
    id: 'b01-m3-9', lesson: 'interpreting-results', type: 'num', kind: 'numerical',
    prompt: 'A fictional slide shows two bars, for 120 and 150, on an axis that starts at 100. How many times taller does the 150 bar look than the 120 bar?',
    answer: 2.5, check: () => (150 - 100) / (120 - 100), unit: 'times', places: 1, tol: 0.05,
    wrong: [{ value: 1.25, say: 'That is the true ratio of the values. The bars are drawn from 100, so their lengths are 50 and 20.' }],
    solution: 'Drawn lengths: 150 − 100 = 50 and 120 − 100 = 20, so the bar looks 2.5 times as tall, although 150 is only 1.25 times 120.',
  },
  {
    id: 'b01-m3-10', lesson: 'interpreting-results', type: 'mc', kind: 'conceptual',
    prompt: 'In the second quarter a fictional insurer’s online quote-to-purchase rate rose both for customers under 40 and for customers over 40, but its overall rate fell. What is the most likely explanation?',
    options: [
      'A larger share of the quarter’s quotes came from the age group that buys less often.',
      'The figures must contain an error, because the overall rate can’t fall when both groups rise.',
      'Regression to the mean.',
      'The rates were compared in percentage points rather than percentages.',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing is impossible here: the overall rate is a weighted average, and the weights can shift. This is Simpson’s paradox.',
      2: 'Regression to the mean concerns extreme results moving back towards the average; it doesn’t explain a reversal between groups and total.',
      3: 'The unit of comparison doesn’t change the direction of the change.',
    },
    solution: 'The overall rate weights each group’s rate by its share of quotes. If more quotes came from the group with the lower rate, the overall rate can fall even though both groups improved: Simpson’s paradox. Compare each group, and the mix, before concluding.',
  },
  {
    id: 'b01-m3-11', lesson: 'interpreting-results', type: 'num', kind: 'applied',
    prompt: 'A fictional fashion chain tried a new shop layout in some stores. In those stores the share of visitors who bought rose from 22% to 26%; in comparable stores without the layout it rose from 21% to 23% over the same period. Using difference in differences, estimate the layout’s effect in percentage points.',
    answer: 2, check: () => (26 - 22) - (23 - 21), unit: 'percentage points', places: 0, tol: 0.05,
    wrong: [
      { value: 4, say: 'That is the whole rise in the layout stores. The comparison stores rose 2 points without the layout; subtract that.' },
      { value: 18.18, say: 'That is the relative rise in the layout stores. Work in percentage points and subtract the comparison stores’ change.' },
    ],
    solution: 'Layout stores: 26 − 22 = 4 points. Comparison stores: 23 − 21 = 2 points, which estimates what would have happened anyway. Effect ≈ 4 − 2 = 2 percentage points, assuming the two groups would otherwise have moved in parallel.',
  },
  {
    id: 'b01-m3-12', lesson: 'interpreting-results', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each chart design as acceptable as described or likely to mislead.',
    items: [
      'A bar chart of monthly orders with the vertical axis starting at zero',
      'A bar chart of monthly orders with the vertical axis starting just below the smallest month',
      'A line chart of a conversion rate with a clearly labelled axis from 2% to 4%',
      'A bubble chart in which each value sets the bubble’s diameter, so a value twice as large gets four times the area',
      'Two series on separate left and right axes, with scales chosen so that the lines cross at a product launch',
      'A line chart of daily orders with the launch date marked and labelled',
    ],
    categories: ['Acceptable as described', 'Likely to mislead'],
    answer: [0, 1, 0, 1, 1, 0],
    feedback: {
      1: 'Bars are compared by length; cutting the bottom off exaggerates every difference.',
      2: 'Lines are read by position and slope; a labelled axis near the data is often needed for a rate.',
      3: 'Readers compare areas, so doubling the diameter makes a value look four times as large.',
      4: 'With two scales the author decides where the lines cross; the crossing means nothing.',
    },
    solution: 'Acceptable: bars from zero, a labelled line chart of a rate, and a marked launch date. Misleading: truncated bars, bubbles scaled by diameter, and dual axes tuned to make a crossing.',
  },
];
