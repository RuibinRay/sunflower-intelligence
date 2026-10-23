// assess-diagnostic.js — B01 course diagnostic: four items per module, each written so that it needs the module’s
// method, not just its vocabulary: reading forecast errors, changing the unit of analysis, testing a question against its
// decision, multiplying drivers; levels of measurement, sampling bias, inconsistent codes, random assignment; a ratio’s
// denominator, the base of a percentage change, a seasonal baseline, what makes a leading indicator.
// New questions, not copies of lesson exercises, module-test or project items. No hints; solutions show in review.
// Every business, person and figure here is fictional.

export const items = [
  // ================================================================ Module 1: What analytics is for
  {
    id: 'b01-dg-1', lesson: 'four-kinds-of-analytics', type: 'mc', kind: 'conceptual',
    prompt: 'Sorrel Kitchen (fictional), a meal-kit company, forecasts how many boxes it will pack each week. Over the last six weeks the forecasts and the boxes actually packed were: 1,200 and 1,130; 1,150 and 1,090; 1,300 and 1,215; 1,250 and 1,190; 1,180 and 1,120; 1,220 and 1,160. Using this course’s definition of forecast error, what should the company conclude?',
    options: [
      'Every error is negative: each forecast was too high, so the method is biased and needs correcting',
      'Every error is negative: the forecasts were too low each week, so all future forecasts should be raised',
      'Each error is only 5–7% of the actual, so the method is accurate enough and needs no change of any kind',
      'Nothing can be concluded from six weeks of errors; the company must wait until it has a full year of data',
    ],
    answer: 0,
    feedback: {
      1: 'The sign is the other way round. Error = actual − forecast, so a negative error means fewer boxes were packed than forecast: the forecast was too high. Raising the forecasts would make the problem worse.',
      2: 'Misses of 5–7% might be acceptable if they fell on both sides. All six fall on the same side, which is a bias, and every week it costs the company ingredients and staff for boxes it doesn’t pack.',
      3: 'Six misses in a row in the same direction are already a clear signal. Waiting a year means 46 more weeks of planning for boxes that aren’t packed; track the errors as they arrive and act when a pattern appears.',
    },
    solution: 'Forecast error = actual − forecast. The six errors are −70, −60, −85, −60, −60 and −60 boxes. Every one is negative, so every forecast was too high, by between about 5% and 7% of the actual (−70 ÷ 1,130 ≈ −6.2%; −85 ÷ 1,215 ≈ −7.0%; −60 ÷ 1,190 ≈ −5.0%). An unbiased method misses sometimes high and sometimes low; six misses in the same direction point to a bias, such as cancelled boxes still being counted in the history the forecast is built on. Find the cause, correct the forecasts and keep tracking the errors: that is the measure step of the analytics process.',
  },
  {
    id: 'b01-dg-2', lesson: 'business-questions', type: 'num', kind: 'numerical',
    prompt: 'Lowther Office Supplies (fictional), an online stationer, had two kinds of customer in March: 120 businesses, which placed 3 orders each at an average order value of $90, and 480 households, which placed 1 order each at an average order value of $30. Businesses were 20% of its customers. What percentage of March’s revenue came from businesses? Give one decimal place.',
    answer: 69.2, check: () => (120 * 3 * 90) / (120 * 3 * 90 + 480 * 1 * 30) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 20, say: 'That is the businesses’ share of customers. The question asks about revenue, so count dollars: each business placed 3 orders worth $90 on average.' },
      { value: 42.9, say: 'That is the businesses’ share of orders (360 of 840). Revenue also depends on order value: business orders averaged $90 against $30.' },
      { value: 75, say: 'That compares the two average order values ($90 of $120). Revenue also depends on how many orders each group placed: work out each group’s total revenue first.' },
    ],
    solution: 'Revenue from businesses = 120 × 3 × $90 = $32,400; from households = 480 × 1 × $30 = $14,400; total $46,800. Businesses’ share of revenue = 32,400 ÷ 46,800 × 100 ≈ 69.2%. The same businesses are 20% of customers (120 of 600) and 42.9% of orders (360 of 840). Each figure is correct for its unit of analysis; a question about where the money comes from needs revenue, one about where to recruit customers needs customers.',
  },
  {
    id: 'b01-dg-3', lesson: 'business-questions', type: 'mc', kind: 'conceptual',
    prompt: 'The director of Bellhaven Theatre (fictional) asks her analyst to find out whether audiences prefer Friday or Saturday performances. Next season’s programme, dates and ticket prices were fixed and published last month, and nothing else depends on the answer for at least a year. What should the analyst do first?',
    options: [
      'Ask which decision the answer would change; as none can change for a year, frame it when next season is planned',
      'Compare Friday and Saturday ticket sales for the past season, since those data are already in the box-office system',
      'Survey this season’s audiences about the night they prefer, so that the answer rests on primary data from customers',
      'Build a model to forecast next season’s Friday and Saturday sales, because a forecast is what the director needs',
    ],
    answer: 0,
    feedback: {
      1: 'The data are cheap, but a question is worth analysing only if different answers would lead to different actions. With the season fixed, any answer leads to the same action now.',
      2: 'A survey costs time and goodwill, and its answer could change nothing this year. Start from the decision the analysis supports.',
      3: 'Nothing in the request calls for a forecast, and no decision would use one for a year. Find out what the director would do differently with the answer.',
    },
    solution: 'The test of a decision-focused question is to ask the person who decides: “If the answer were Friday, what would you do? And if it were Saturday?” Here both answers lead to the same action, because the season is fixed. The analyst should say so, and agree to frame the question (which nights to schedule, at what prices, compared with what) when next season’s programme is being planned, when the answer can change something.',
  },
  {
    id: 'b01-dg-4', lesson: 'problem-solving-frameworks', type: 'num', kind: 'applied',
    prompt: 'Driftwood Kites (fictional) expects 15% fewer visits to its online shop next month, when a paid search campaign ends, and expects its average order value to rise by 2%. By what percentage must its conversion rate rise to keep revenue unchanged? Give one decimal place.',
    answer: 15.3, check: () => (1 / ((1 - 0.15) * (1 + 0.02)) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 13, say: 'That adds and subtracts the growth rates (15 − 2). Revenue is a product of its drivers, so their growth factors multiply: solve 0.85 × (1 + g) × 1.02 = 1.' },
      { value: 17.6, say: 'That makes up for the fall in visits but leaves out the 2% rise in order value, which does part of the work.' },
      { value: 15, say: 'A 15% rise in conversion doesn’t undo a 15% fall in visits: 0.85 × 1.15 is below 1, because the rise works on a smaller base. Multiply the growth factors.' },
    ],
    solution: 'Revenue = visits × conversion rate × average order value, so the growth factors multiply: 0.85 × (1 + g) × 1.02 = 1. So 1 + g = 1 ÷ 0.867 ≈ 1.1534, and conversion must rise by about 15.3%: from 2.00% to about 2.31%, for example. Adding the growth rates (15 − 2 = 13%) is only an approximation, and here it falls short by more than two percentage points.',
  },

  // ================================================================ Module 2: Data and where it comes from
  {
    id: 'b01-dg-5', lesson: 'data-types', type: 'multi', kind: 'conceptual',
    prompt: 'Yarrow Peak (fictional), a ski resort, records for each day: the snow depth in centimetres, the midday temperature in °C, the hardest run open (graded green, blue, red or black, from easiest to hardest), the number of lift passes sold, and each pass’s serial number. Which statements in its season report are meaningful, given each variable’s level of measurement? Select all that apply.',
    options: [
      'Snow was twice as deep on 3 February (80 cm) as on 3 January (40 cm).',
      'Midday on 12 March (8 °C) was twice as warm as midday on 5 March (4 °C).',
      'The median grade of the hardest run open was red.',
      'Lift-pass sales were 1.5 times as high in February as in January.',
      'The average serial number of the passes sold in February was 40,516.',
      'A black run is twice as hard as a blue run, since black is grade 4 and blue grade 2.',
      'Midday on 12 March was 4 °C warmer than midday on 5 March.',
    ],
    answer: [0, 2, 3, 6],
    feedback: {
      1: 'Temperature in °C is an interval variable: 0 °C is not an absence of warmth, so ratios mean nothing. The same days are 46.4 °F and 39.2 °F, not twice as warm. The difference, 4 °C, is meaningful.',
      4: 'A serial number is an identifier: a label written with digits. Its average describes nothing.',
      5: 'Grades are ordinal: they rank the runs, but the numbers 1 to 4 only label the order, so dividing them says nothing about difficulty.',
    },
    solution: 'Snow depth and passes sold are ratio variables (zero means none), so “twice as deep” and “1.5 times as high” are meaningful. The run grade is ordinal, so a median is meaningful but a ratio of grade codes is not. Temperature in °C is interval: differences (4 °C warmer) are meaningful, ratios (“twice as warm”) are not. A serial number is a nominal identifier and is never averaged.',
  },
  {
    id: 'b01-dg-6', lesson: 'data-collection', type: 'num', kind: 'numerical',
    prompt: 'Calloway Cinemas (fictional) surveys its customers through its loyalty app. A quarter of its customers are loyalty members, and 88% of them are satisfied; the other three-quarters are occasional customers, and 64% of them are satisfied. Because the survey runs in the app, 80% of its respondents are members. Assuming each group’s respondents answer like the rest of their group, by how many percentage points will the survey overstate the share of all customers who are satisfied? Give one decimal place.',
    answer: 13.2, check: () => (0.80 * 88 + 0.20 * 64) - (0.25 * 88 + 0.75 * 64), unit: 'percentage points', places: 1, tol: 0.05,
    wrong: [
      { value: 18.9, say: 'That is the overstatement as a percentage of the true share (13.2 ÷ 70). The question asks for the gap in percentage points.' },
      { value: 15.9, say: 'That divides the gap by the survey’s result. The question asks for the gap itself, in percentage points.' },
      { value: 24, say: 'That is the gap between members and occasional customers (88 − 64). Work out what the survey will show and what is true of all customers, then subtract.' },
      { value: 83.2, say: 'That is what the survey will show. Subtract the true share of all customers satisfied.' },
    ],
    solution: 'The survey weights the groups by their share of respondents: 0.80 × 88 + 0.20 × 64 = 70.4 + 12.8 = 83.2% satisfied. The truth weights them by their share of customers: 0.25 × 88 + 0.75 × 64 = 22 + 48 = 70.0%. The survey overstates satisfaction by 83.2 − 70.0 = 13.2 percentage points: sampling bias, because the app reaches members far more than occasional customers. A survey of 5,000 run the same way would only pin down the 83.2% more precisely; a larger sample reduces chance error, not bias.',
  },
  {
    id: 'b01-dg-7', lesson: 'data-quality', type: 'num', kind: 'numerical',
    prompt: 'Heron Valley Dairy (fictional) reports its online orders by delivery region. For October the report shows 186 orders for Eastvale. The region column also holds 27 orders written “eastvale” and 12 written “E. Vale”, all of them Eastvale orders, which the report lists as two separate regions. By what percentage does the report understate Eastvale’s true number of orders? Give one decimal place.',
    answer: 17.3, check: () => (27 + 12) / (186 + 27 + 12) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 21, say: 'You divided the 39 missing orders by the reported 186. Measure the shortfall against the true count, 225.' },
      { value: 39, say: 'That is the number of orders missing. Express it as a percentage of Eastvale’s true count.' },
      { value: 82.7, say: 'That is the share of Eastvale’s orders the report does show (186 ÷ 225). The understatement is the rest.' },
    ],
    solution: 'Eastvale’s true count is 186 + 27 + 12 = 225 orders. The report misses 39 of them, so it understates Eastvale by 39 ÷ 225 × 100 ≈ 17.3%. This is a consistency failure: one region written three ways splits one group into three, so Eastvale looks smaller than it is and two regions that don’t exist appear in the report. Anyone ranking the regions may rank them wrongly.',
  },
  {
    id: 'b01-dg-8', lesson: 'data-collection', type: 'mc', kind: 'applied',
    prompt: 'Ottery Prints (fictional), an online poster shop, wants to know whether a new product page sells better than the old one. For four weeks it shows the new page on weekdays and the old page at weekends, and then compares the two pages’ conversion rates. What is the main flaw in this design?',
    options: [
      'The page shown depends on the day, so any difference between weekday and weekend shoppers is mixed into the result',
      'Four weeks is far too short for a test of a product page; it needs a full year of data so that every season is included',
      'The new page is shown on five days a week and the old one on two, so the new page will get the higher conversion rate',
      'Conversion is the wrong outcome to compare; the test should compare the total number of orders taken on each page',
    ],
    answer: 0,
    feedback: {
      1: 'Four whole weeks include every day of the week four times, which is a sensible length. The problem is how visitors are assigned to the pages, not how long the test runs.',
      2: 'More days give the new page more visits and more orders, but not a higher rate: conversion divides orders by visits. The flaw is that the two pages saw different kinds of day.',
      3: 'Total orders would be worse, because the new page is shown on five days and the old on two. Conversion (orders ÷ visits) is the right outcome; the flaw lies in who sees which page.',
    },
    solution: 'In an A/B test chance alone must decide which version each visitor sees, so that the two groups are alike in everything but the page. Here the day decides: weekday and weekend shoppers may convert differently whatever the page, so a difference between the pages can’t be separated from a difference between the days. Assign each visitor at random to the old or the new page, every day, for whole weeks, and decide the outcome and the length of the test before it starts.',
  },

  // ================================================================ Module 3: Measuring and reading results
  {
    id: 'b01-dg-9', lesson: 'kpis', type: 'num', kind: 'applied',
    prompt: 'Marram Surf Co. (fictional) sells online through its website and its app. In June the website had 12,000 visits and 300 orders; the app had 3,000 visits and 120 orders. Because app visits are recorded in a different system, the shop’s dashboard calculates “web conversion” as all 420 orders divided by the 12,000 web visits. By how many percentage points does the dashboard overstate web conversion? Give two decimal places.',
    answer: 1, check: () => 420 / 12000 * 100 - 300 / 12000 * 100, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [
      { value: 40, say: 'That is the overstatement relative to the true rate (1.00 ÷ 2.50). The question asks for the difference in percentage points.' },
      { value: 0.7, say: 'That compares the dashboard’s 3.50% with the shop’s overall rate (420 ÷ 15,000 = 2.80%). Web conversion divides web orders by web visits.' },
      { value: 3.5, say: 'That is the dashboard’s figure. Subtract the true web conversion, 300 ÷ 12,000.' },
    ],
    solution: 'Web conversion must divide web orders by web visits: 300 ÷ 12,000 × 100 = 2.50%. The dashboard puts the app’s orders over web visits: 420 ÷ 12,000 × 100 = 3.50%. It overstates web conversion by 1.00 percentage point, 40% in relative terms. The shop’s overall rate, 420 ÷ 15,000 = 2.80%, is a third, different figure. The numerator must come from the population in the denominator.',
  },
  {
    id: 'b01-dg-10', lesson: 'summarising-data', type: 'num', kind: 'numerical',
    prompt: 'The share of visits to Tansy Flowers’ (fictional) website that ended in an order fell from 3.2% in April to 2.4% in May. By what percentage must the rate now rise, from May’s level, to get back to April’s? Give one decimal place.',
    answer: 33.3, check: () => (3.2 / 2.4 - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 25, say: 'That is the size of the fall, measured from April’s 3.2%. The rise starts from May’s lower 2.4%, so the same 0.8 points is a larger percentage of it.' },
      { value: 0.8, say: 'That is the change in percentage points. The question asks for the relative rise: divide it by the starting value, 2.4.' },
      { value: 133.3, say: 'That is April’s rate as a percentage of May’s. The rise is that minus 100%.' },
    ],
    solution: 'Getting back means going from 2.4% to 3.2%, a rise of 0.8 percentage points. Relative to the starting value, now May’s 2.4%, that is 0.8 ÷ 2.4 × 100 ≈ 33.3%. The fall from April was 0.8 ÷ 3.2 × 100 = 25%: the same 0.8 points on a larger base. Equal percentage falls and rises don’t cancel.',
  },
  {
    id: 'b01-dg-11', lesson: 'interpreting-results', type: 'mc', kind: 'applied',
    prompt: 'Pebblebrook Garden Centre (fictional) has sold online for five years. It launched a new website on 1 April, and its online sales rose by 140% from March to April. Which comparison would best separate the effect of the new website from the effect of the spring season?',
    options: [
      'This year’s rise from March to April, set beside the rise over the same two months last year',
      'April’s sales per day, set beside March’s sales per day, to allow for the months’ different lengths',
      'April’s sales, set beside last year’s average month, which smooths out any one unusual month',
      'The rise in sales, set beside the rise in website visits over the same two months this year',
    ],
    answer: 0,
    feedback: {
      1: 'Per-day figures remove the one-day difference between March and April, but not the season: spring would lift April’s sales with or without the new site.',
      2: 'Last year’s average month mixes winter with summer. April is a busy month for a garden centre, so it would beat the average with or without the new site.',
      3: 'Visits rise in spring too, and the new site may change them, so this can’t separate the site from the season. It shows which driver moved, not why.',
    },
    solution: 'Spring would lift April whatever the website did. Last year’s rise from March to April shows how much the season alone usually adds; if this year’s rise is much larger, the difference is a candidate effect of the new site. This is the logic of difference in differences, with last year as the comparison. It assumes nothing else changed between the two years, such as prices or advertising, so check that too.',
  },
  {
    id: 'b01-dg-12', lesson: 'kpis', type: 'mc', kind: 'conceptual',
    prompt: 'Osprey Wine Club (fictional) wants to track “members who open the monthly tasting e-mail” as a leading indicator of members renewing at the end of the year. What must be true for it to earn that place?',
    options: [
      'Past data show that members who open it renew more often, so its movements signal renewals ahead',
      'It is reported every month rather than once a year, which is all that a leading indicator needs',
      'It is a rate rather than a count, and any rate is a leading indicator of the count it is built from',
      'The marketing team can raise it directly, and anything a team can control leads the results it gets',
    ],
    answer: 0,
    feedback: {
      1: 'Frequent reporting helps, but a monthly measure that doesn’t predict renewals warns of nothing. The link to the outcome has to be shown in data.',
      2: 'Rates and counts can each be leading or lagging. What makes a measure leading is that it moves earlier and predicts the outcome.',
      3: 'Being easy to move makes a measure easy to game, not predictive. Opening can be raised with catchier subject lines without changing anyone’s plan to renew.',
    },
    solution: 'A leading indicator moves earlier than the outcome and, if the link holds, signals where the outcome is heading. “If the link holds” is the test: check in past data whether members who opened the e-mails renewed more often, and whether falls in opening were followed by fewer renewals. Being monthly, being a rate or being easy to move doesn’t make a measure predictive. And once opening becomes a target, catchier subject lines can raise it without changing anyone’s plans: Goodhart’s law.',
  },
];

// Start at module N if the student scores at least 75% on the items for all the modules before N. With four items per
// module that means three of the four module-1 items for module 2, and six of the eight module 1–2 items for module 3.
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.75 },
];
