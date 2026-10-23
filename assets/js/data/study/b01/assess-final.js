// assess-final.js — B01 cumulative final: 24 items, every lesson at least twice, eight each conceptual, numerical and
// applied. Many items combine lessons: scenarios inside a forecast error, an order definition with duplicate rows, a
// hypothesis with its comparison group, a driver tree with percentage points, a drill-down by segment, order lines inside
// an average order value, identifiers inside a failed join, a tracking fault inside a conversion rate, a question → the
// right KPI → the bias in the data behind it, a relative target, a chart → a confounder → a randomised test, and a mix
// effect inside an overall rate. New questions, not copies of lesson exercises, module-test, diagnostic or project items
// (none asks for Lantern’s July–December KPIs, the September diagnosis or the survey’s response rate). No hints;
// solutions show in review. 70% passes. Every business, person and figure is fictional.

export const items = [
  // ---------------------------------------------------------------- four-kinds-of-analytics
  {
    id: 'b01-fn-1', lesson: 'four-kinds-of-analytics', type: 'num', kind: 'numerical',
    prompt: 'In March, Halyard Sailing School (fictional) set out three scenarios for its summer course bookings: 300 (probability 0.2), 400 (probability 0.5) or 520 (probability 0.3). It used their expected value as its forecast. The summer brought 455 bookings. What was the percentage error of the forecast (actual minus forecast, as a percentage of the actual)? Give one decimal place, with a minus sign if the forecast was too high.',
    answer: 8.6, check: () => (455 - (0.2 * 300 + 0.5 * 400 + 0.3 * 520)) / 455 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 9.4, say: 'You divided by the forecast. Percentage error, as this course defines it, divides by the actual: 39 ÷ 455.' },
      { value: 12.1, say: 'That uses the most likely scenario, 400, as the forecast. The school’s forecast was the expected value, which weights all three scenarios: 416.' },
      { value: 10.6, say: 'That takes the plain average of the three scenarios (about 406.7). They are not equally likely: weight each one by its probability.' },
      { value: -8.6, say: 'Check the sign: actual minus forecast is 455 − 416 = +39, because the forecast was too low.' },
      { value: 39, say: 'That is the error in bookings. Divide it by the actual and multiply by 100.' },
    ],
    solution: 'Forecast = expected value of the scenarios = 0.2 × 300 + 0.5 × 400 + 0.3 × 520 = 60 + 200 + 156 = 416 bookings. Error = actual − forecast = 455 − 416 = 39 bookings. Percentage error = 39 ÷ 455 × 100 ≈ 8.6%: positive, so the forecast was too low. Measuring the error is the last step of the analytics process; if the high scenario keeps proving closer to the truth, next year’s probabilities should move towards it.',
  },
  {
    id: 'b01-fn-2', lesson: 'four-kinds-of-analytics', type: 'mc', kind: 'applied',
    prompt: 'Thornbury Cider (fictional) is deciding how much of a new pear cider to press. A large batch makes $12,000 if demand is high (probability 0.5) and loses $6,000 if demand is low (probability 0.5). A small batch makes $5,000 if demand is high and $800 if it is low. The firm has $4,000 of cash in reserve and could not pay its suppliers after a larger loss. What should it do?',
    options: [
      'Press the small batch: it gives up $100 of expected profit, but the large batch’s worst case is a loss it can’t survive',
      'Press the large batch: its expected profit is higher, and the option with the higher expected value is always the right one',
      'Press the small batch: once each outcome is weighted by its probability, its expected profit is the higher of the two',
      'Press neither yet: an expected value means nothing until the probability of high demand is known exactly',
    ],
    answer: 0,
    feedback: {
      1: 'Expected value is the right rule for a decision-maker who can ride out the bad outcomes. Here a $6,000 loss exceeds the $4,000 reserve, so the worst case matters as well as the average.',
      2: 'Check the arithmetic: large 0.5 × 12,000 + 0.5 × (−6,000) = $3,000; small 0.5 × 5,000 + 0.5 × 800 = $2,900. The small batch wins on its worst case, not on its expected value.',
      3: 'Probabilities are always estimates. Expected values built on reasonable estimates still compare the options; waiting for certainty means never deciding.',
    },
    solution: 'Expected values: large batch 0.5 × 12,000 + 0.5 × (−6,000) = $3,000; small batch 0.5 × 5,000 + 0.5 × 800 = $2,900. The large batch is $100 better on average, but half the time it loses $6,000, more than the firm’s $4,000 reserve. Expected value ignores risk: a business that could not survive the worst case should give up a little expected profit for a better one. The small batch’s worst case is still a profit of $800.',
  },

  // ---------------------------------------------------------------- business-questions
  {
    id: 'b01-fn-3', lesson: 'business-questions', type: 'num', kind: 'numerical',
    prompt: 'Sablewood Furniture (fictional) targets a conversion rate of at least 1.5%, counting paid orders from real customers per visit. In February its online shop had 48,000 visits, and the order export has 781 rows. Of these, 18 rows are exact copies of other paid orders, made by a sync fault; 12 are test orders placed by staff; and 45 are orders cancelled before payment. What was February’s conversion rate on the target’s definition? Give a percentage to two decimal places.',
    answer: 1.47, check: () => (781 - 18 - 12 - 45) / 48000 * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 1.63, say: 'That counts every row. Duplicates, staff tests and orders cancelled before payment are not paid orders from real customers.' },
      { value: 1.51, say: 'You left the 18 duplicate rows in. Each is a copy of an order already counted, so it must go too, and without them the target is missed.' },
      { value: 1.59, say: 'That removes only the duplicates. Staff tests are not customers, and an order cancelled before payment is not a paid order.' },
      { value: 1.56, say: 'You kept the 45 orders cancelled before payment. The definition counts paid orders only.' },
    ],
    solution: 'Remove everything that is not a paid order from a real customer: 781 − 18 duplicates − 12 staff tests − 45 cancellations = 706 orders. Conversion = 706 ÷ 48,000 × 100 ≈ 1.47%, short of the 1.5% target. Leaving the 18 duplicates in would give 724 ÷ 48,000 ≈ 1.51% and wrongly report the target as met. The operational definition decides which records should count; data quality decides whether each real order is counted once.',
  },
  {
    id: 'b01-fn-4', lesson: 'business-questions', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst at a fictional online toy shop, with no hypothesis in mind, splits a year of orders by region, weekday, device, product range and hour: about 300 groups in all. One stands out. Orders placed on phones in the north-east on Thursday evenings were 60% higher in the second half of the year than in the first. How should this result be treated?',
    options: [
      'As a new hypothesis, to be tested on fresh data before anyone acts on it',
      'As a finding to report: a 60% rise is far too large to be down to chance',
      'As evidence that something the shop changed in the north-east is working',
      'As an error to discard, since a group that narrow can never show a real effect',
    ],
    answer: 0,
    feedback: {
      1: 'Among about 300 groups, some will rise or fall a long way by chance, especially small ones such as one region’s phone orders on one evening. A large change found by searching is not yet evidence.',
      2: 'No change in the north-east was named in advance, and nothing was compared. A cause needs a hypothesis and evidence that rules out the alternatives.',
      3: 'Narrow groups are noisy, but the pattern could still be real. Test it on new data rather than discarding it or believing it.',
    },
    solution: 'Split data enough ways and some groups will show large changes by chance alone, and small groups swing the most. A pattern found by searching everywhere is a new hypothesis, not a finding: write it down with what it predicts, and test it on fresh data (the next half-year, say) before anyone acts on it.',
  },
  {
    id: 'b01-fn-5', lesson: 'business-questions', type: 'fill', kind: 'applied',
    prompt: 'Saffron Row (fictional), a group of restaurants, added a deposit step to table bookings in its app on 3 March; bookings on its website did not change. The manager suspects the new step makes people give up before booking. Complete the testable hypothesis and how to test it.',
    text: 'Hypothesis: from 3 March, the share of [[0]] that end in a confirmed booking fell. If it is true, expect a fall that begins on [[1]] and appears in [[2]], with little change in [[3]], which serves as the [[4]]. The hypothesis would be contradicted if [[5]].',
    blanks: [
      { options: ['app sessions', 'all diners', 'confirmed bookings', 'restaurant tables'], answer: 0 },
      { options: ['3 March', 'the first day of the next month', 'the busiest weekend of March'], answer: 0 },
      { options: ['the app', 'the website', 'both channels equally'], answer: 0 },
      { options: ['the app', 'the website', 'walk-in diners'], answer: 1 },
      { options: ['comparison group', 'unit of analysis', 'operational definition', 'threshold'], answer: 0 },
      { options: ['the website’s rate fell just as much from 3 March', 'the app’s rate fell from 3 March onwards', 'more people opened the app in March than in February'], answer: 0 },
    ],
    solution: 'A testable hypothesis names the measure (the share of app sessions ending in a confirmed booking), the direction (a fall), the timing (from 3 March) and the comparison (the website, which did not change). It predicts a step in the app on 3 March and little change on the website, and it says in advance what would count against it: a similar fall on the website, which would point to something affecting both channels, such as the season or prices. A fall in the app alone supports it; more people opening the app says nothing about it on its own.',
  },

  // ---------------------------------------------------------------- problem-solving-frameworks
  {
    id: 'b01-fn-6', lesson: 'problem-solving-frameworks', type: 'num', kind: 'numerical',
    prompt: 'From May to June the revenue of Corrie Gifts (fictional), an online gift shop, fell by 12%. Its visits rose by 5% and its average order value fell by 2%. Its conversion rate was 3.00% in May. By how many percentage points did the conversion rate change from May to June? Give two decimal places, with a minus sign for a fall.',
    answer: -0.43, check: () => 3 * (0.88 / (1.05 * 0.98)) - 3, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [
      { value: -14.48, say: 'That is the relative change in the conversion rate, as a percentage. The question asks for the change in percentage points: apply it to the 3.00% first.' },
      { value: -0.45, say: 'That adds the growth rates (−12 − 5 + 2 = −15%). The drivers multiply, so divide the growth factors: 0.88 ÷ (1.05 × 0.98).' },
      { value: -0.49, say: 'That leaves out the fall in average order value, which explains part of the fall in revenue: divide 0.88 by 1.05 × 0.98, not by 1.05 alone.' },
      { value: -0.28, say: 'You multiplied all three growth factors together. Conversion is the unknown: revenue’s factor equals the product of the drivers’ factors, so divide.' },
    ],
    solution: 'Revenue = visits × conversion rate × average order value, so the growth factors multiply: 0.88 = 1.05 × (1 + g) × 0.98. So 1 + g = 0.88 ÷ 1.029 ≈ 0.855200, a relative fall of about 14.5%. June’s conversion ≈ 3.00% × 0.855200 ≈ 2.57%, a change of about −0.43 percentage points. Adding the growth rates (−12 − 5 + 2 = −15%) would give 2.55% and −0.45 points.',
  },
  {
    id: 'b01-fn-7', lesson: 'problem-solving-frameworks', type: 'order', kind: 'conceptual',
    prompt: 'Fennick Pet Supplies (fictional) sent 30 customers the wrong size of dog bed last week. The notes from its five whys are below, out of order. Put them in order, from the problem to the cause the business can act on.',
    items: [
      'Why did 30 customers receive the wrong size of dog bed? Because pickers took the beds from the wrong shelf.',
      'Why the wrong shelf? Because medium and large beds were stored together on one shelf, with no divider.',
      'Why were they stored together? Because a large delivery arrived and there was no free location for the large beds.',
      'Why was there no free location? Because the warehouse layout was planned before the large size joined the range.',
      'Why was the layout never updated? Because adding a product has no step that gives it a storage location.',
    ],
    solution: 'Each answer becomes the next question, from the symptom (wrong beds sent) to a cause the business can change for good: add a storage-location step to the process for new products. Stopping at the second why would suggest a fix that won’t last, such as telling pickers to be careful. Check each answer against evidence, and remember that the method follows one path: other causes, such as similar labels on the two sizes, may be at work too.',
  },
  {
    id: 'b01-fn-8', lesson: 'problem-solving-frameworks', type: 'rows', kind: 'applied',
    prompt: 'The online revenue of Stonechat Outdoor (fictional) fell from May to June, and its driver tree points to conversion. The table splits visits and orders by device and source. Select every segment whose own conversion rate fell by at least 0.5 percentage points.',
    data: { table: {
      head: ['Segment', 'May visits', 'May orders', 'June visits', 'June orders'],
      rows: [
        ['Phone, search', '12,000', '216', '13,000', '156'],
        ['Phone, e-mail', '3,000', '105', '4,500', '130'],
        ['Computer, search', '8,000', '240', '7,800', '226'],
        ['Computer, social', '2,000', '50', '1,200', '30'],
        ['Tablet, search', '1,500', '36', '1,400', '35'],
        ['Phone, social', '4,000', '60', '6,000', '84'],
      ],
    } },
    answer: [0, 1],
    solution: 'Conversion = orders ÷ visits × 100 for each segment. Phone, search: 1.80% to 1.20% (−0.60 points). Phone, e-mail: 3.50% to 2.89% (−0.61), although its orders rose. Computer, search: 3.00% to 2.90% (−0.10). Computer, social: 2.50% to 2.50%, although its orders fell by 40%. Tablet, search: 2.40% to 2.50% (+0.10). Phone, social: 1.50% to 1.40% (−0.10). Overall conversion fell from 707 ÷ 30,500 ≈ 2.32% to 661 ÷ 33,900 ≈ 1.95%. The fall is concentrated in phone visits from search and e-mail, so the next level of the tree (landing pages and payment steps on phones) is where to look. Order counts alone would mislead in both directions.',
  },

  // ---------------------------------------------------------------- data-types
  {
    id: 'b01-fn-9', lesson: 'data-types', type: 'classify', kind: 'conceptual',
    prompt: 'How does each fictional dataset relate to time?',
    items: [
      'The answers of every guest who completed a hotel’s checkout survey in August',
      'A ferry company’s total passengers in each month of the last ten years',
      'The weekly sales of each of a bakery chain’s 40 shops over two years',
      'The spending of the same 2,000 households, recorded every year since 2015',
      'Every booking a theatre took on the day its new season went on sale',
      'The daily rainfall at one weather station since 1990',
    ],
    categories: ['Cross-sectional', 'Time series', 'Panel'],
    answer: [0, 1, 2, 2, 0, 1],
    feedback: {
      1: 'One unit, the company as a whole, followed month by month: a time series.',
      2: 'Forty units, each followed week by week: a panel. Adding the shops together would turn it into a time series.',
      3: 'The same units observed again and again: panel (longitudinal) data, which shows how each household changes.',
      4: 'Many bookings taken at one time: a cross-section, even though each booking carries a time stamp.',
    },
    solution: 'Cross-sectional data observe many units at one time (the August survey, the opening-day bookings). A time series follows one unit through time (the company’s monthly total, one station’s rainfall). Panel data follow the same units through time (each shop, each household), and only a panel separates a change in the units from a change in the mix.',
  },
  {
    id: 'b01-fn-10', lesson: 'data-types', type: 'num', kind: 'numerical',
    prompt: 'Rookery Yarns (fictional) exports its online sales for October with one row per order line: one product within one order. The export has 1,240 rows, 520 distinct order numbers and 410 distinct customer numbers, and the line totals add up to $24,180. What was October’s average order value? Give dollars and cents.',
    answer: 46.5, check: () => 24180 / 520, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 19.5, say: 'That divides by the 1,240 rows, which are order lines, not orders. Count the distinct order numbers.' },
      { value: 58.98, say: 'That is revenue per customer: 410 customers placed 520 orders between them. Average order value divides by orders.' },
    ],
    solution: 'One row is one order line, so the rows are not orders. Average order value = revenue ÷ orders = 24,180 ÷ 520 = $46.50. Dividing by rows gives the average line ($19.50), and dividing by customers gives revenue per customer ($58.98): both are real figures, but neither is the average order value. Before you count or average, finish the sentence “one row is one ___”.',
  },
  {
    id: 'b01-fn-11', lesson: 'data-types', type: 'mc', kind: 'applied',
    prompt: 'Hollin Ceramics (fictional) joins its order export to its product list to report sales by product, and 9% of the order lines find no matching product. In the product list the codes look like 0042 and 0107; in the order export the same products appear as 42 and 107. What is the most likely cause, and the fix?',
    options: [
      'The export stored the codes as numbers, dropping the leading zeros; keep the codes as text in both files',
      'Those order lines are for products that have since been discontinued; leave them out of the sales report entirely',
      'Staff mistyped the codes below 1000; re-enter those order lines by hand from the original paper order forms',
      'The product list holds duplicate codes; remove its repeated rows so that each code appears there only once',
    ],
    answer: 0,
    feedback: {
      1: 'Discontinued products would be missing from the list altogether. Here the same products appear in both files, written differently.',
      2: 'Typing errors would be scattered, not a neat pattern of missing leading zeros on every short code.',
      3: 'Duplicates in the list would match too often, not fail to match. The codes differ in form between the files.',
    },
    solution: 'A product code is an identifier: a nominal label written with digits. Stored as a number, 0042 becomes 42, which no longer matches the label in the product list, so the join fails for every code with a leading zero. The data are consistent in meaning but not in form. Keep identifiers as text everywhere, and never calculate with them; B02 shows how to repair columns that have already been converted.',
  },

  // ---------------------------------------------------------------- data-collection
  {
    id: 'b01-fn-12', lesson: 'data-collection', type: 'mc', kind: 'conceptual',
    prompt: 'Wexcombe College (fictional) wants to know what share of its 8,000 students are satisfied with the timetable. Survey A was e-mailed to 200 students drawn at random from the student register; 150 replied, and 58% were satisfied. Survey B was a link on the college’s social-media page, answered by 2,400 students, of whom 81% were satisfied. Which statement is best supported?',
    options: [
      'A is the better guide: its students were drawn at random from the register; B’s respondents chose themselves',
      'B is the better guide: 2,400 replies against 150 make its result far more precise, and so much closer to the truth',
      'The truth probably lies between them, so the college should report the average of the two results, about 70%',
      'Neither can be used: a survey tells you nothing unless it reaches every one of the 8,000 students',
    ],
    answer: 0,
    feedback: {
      1: 'Size reduces chance error, not bias. B’s respondents follow the college online and chose to answer, so they may differ from other students in exactly what is asked; 2,400 of them give a precise estimate for the wrong group.',
      2: 'Averaging a biased result with an unbiased one just carries part of the bias over. There is no reason the truth lies halfway.',
      3: 'A random sample from a frame that covers the population is designed to stand in for it. A’s 75% response rate leaves some room for non-response bias, which is worth checking, but A is usable.',
    },
    solution: 'A’s frame, the register, covers every student, and chance chose who was asked. B is a convenience sample of students who follow the college online and chose to reply. A’s 150 replies leave a wider margin of chance error, and its 75% response rate some room for non-response bias, which the college can check by comparing respondents with the register by year and course. B’s 2,400 replies make it precise, but precise about the wrong group: a larger sample doesn’t remove bias.',
  },
  {
    id: 'b01-fn-13', lesson: 'data-collection', type: 'multi', kind: 'applied',
    prompt: 'Redwing Climbing Centre (fictional) wants to know why members cancel their membership. Which of these sources can include the people this question is about? Select all that apply.',
    options: [
      'The reason box on its online cancellation form, filled in as members cancel',
      'A survey e-mailed to everyone who cancelled in the last six months, using its membership records',
      'A survey handed to members at the front desk next week',
      'Comments left on the feedback board beside the climbing walls',
      'Short phone interviews with a random sample of last year’s leavers',
      'A poll in the members’ newsletter asking what would make people leave',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'Members at the front desk are the ones who stayed; people who have left can’t be handed a survey there. That is survivorship bias.',
      3: 'The board is read and written by people still climbing at the centre. The leavers are missing.',
      5: 'Asking members who stayed what might make them leave measures guesses, from the wrong group.',
    },
    solution: 'The population is the people who left. They can be reached only through records that list them: the cancellation form, the membership records of past members, a random sample of last year’s leavers. Anyone at the front desk, at the wall or reading the newsletter has stayed, so asking them is survivorship bias, and a hypothetical question measures guesses rather than reasons. Leavers who don’t reply can still bias the result, so report response rates too.',
  },

  // ---------------------------------------------------------------- data-quality
  {
    id: 'b01-fn-14', lesson: 'data-quality', type: 'num', kind: 'numerical',
    prompt: 'After Cobaltline Cycles (fictional) redesigned its online shop on 1 May, its analytics tool began to count some page reloads as new sessions. In May it recorded 15,000 visits; a check against the web server’s logs shows that 2,400 of them were reloads, not new visits. The shop took 360 paid orders. By how many percentage points does the recorded conversion rate understate the true rate? Give two decimal places.',
    answer: 0.46, check: () => 360 / (15000 - 2400) * 100 - 360 / 15000 * 100, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [
      { value: 16, say: 'That is the understatement as a percentage of the true rate. The question asks for the difference in percentage points.' },
      { value: 19.05, say: 'That is the gap as a percentage of the recorded rate. The question asks for the difference in percentage points.' },
      { value: 2.86, say: 'That is the true conversion rate. Subtract the recorded rate, 360 ÷ 15,000.' },
    ],
    solution: 'Recorded conversion = 360 ÷ 15,000 × 100 = 2.40%. True visits = 15,000 − 2,400 = 12,600, so true conversion = 360 ÷ 12,600 × 100 ≈ 2.86%. The recorded rate understates it by about 0.46 percentage points, 16% of the true rate. The orders are right; the denominator is inflated, because some visits are counted twice. A redesign that seems to have cut conversion may have changed only the counting, so check the tracking before blaming the customers.',
  },
  {
    id: 'b01-fn-15', lesson: 'data-quality', type: 'classify', kind: 'conceptual',
    prompt: 'Larchmont Hospital (fictional) keeps a dataset of outpatient appointments. What is each person’s or system’s role in that data?',
    items: [
      'The online booking form, which creates a record for each appointment',
      'Reception staff who type in appointments booked by phone',
      'The head of outpatients, accountable for what the dataset contains and who may use it',
      'The analyst who builds the monthly report on waiting times',
      'The finance director, who reads that report to set next year’s clinic budgets',
    ],
    categories: ['Data producer', 'Data owner', 'Data user'],
    answer: [0, 0, 1, 2, 2],
    feedback: {
      1: 'People who type in records create the data, just as the form does: they are producers.',
      2: 'The person accountable for a dataset’s contents, definitions, access and quality problems is its owner.',
      4: 'Reading the data to make a decision makes the finance director a user, who should judge whether it is fit for that purpose.',
    },
    solution: 'Producers create the records: the booking form and the reception staff. The owner is accountable for the dataset: what it must contain, its definitions, who may use it and how problems are resolved. Users, the analyst and the finance director, judge whether it is fit for their purpose and report the problems they find. A field that is often left blank is cheapest to fix where it is produced, for example by making the form require it.',
  },

  // ---------------------------------------------------------------- kpis
  {
    id: 'b01-fn-16', lesson: 'kpis', type: 'classify', kind: 'conceptual',
    prompt: 'For each of Ana’s questions about Lantern’s online shop, should the main measure be a count (or total) or a rate (or share)?',
    items: [
      'How many parcels will the packers need to send on Monday?',
      'Does the app turn visits into orders more reliably than the website?',
      'Did the shop take enough money in November to cover its monthly costs?',
      'Did a new product page sell better than the old one, which had twice as many visitors?',
      'How many gift boxes must the packing partner assemble for next December?',
      'Did a larger share of this month’s orders come from returning customers than last month’s?',
    ],
    categories: ['A count or total', 'A rate or share'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      1: 'The channels have very different numbers of visits, so compare orders per visit, not orders.',
      2: 'Bills are paid in dollars: what matters is the total taken, not revenue per visit.',
      3: 'The old page had twice the visitors, so it could take more orders while selling worse. Compare orders per visit.',
      5: 'The two months have different numbers of orders, so compare the share of orders, not the number.',
    },
    solution: 'Use a count or total when scale is the point: parcels to pack, money to pay the bills, boxes to assemble. Use a rate or share when comparing groups or periods of different sizes: two channels, two pages with different traffic, two months with different numbers of orders. Reporting them in pairs, such as orders with conversion, is the safest habit.',
  },
  {
    id: 'b01-fn-17', lesson: 'kpis', type: 'mc', kind: 'applied',
    prompt: 'In May, Moorcroft Gardens (fictional), an online plant shop, switched to new packaging. Its owner asks: “Are customers happier with how their plants arrive?” Customers can rate each order from 1 to 5 stars; rating is optional, and only customers with an account are sent a reminder to rate. Which measure, read with which caution, best answers her question?',
    options: [
      'The share of rated orders given 4 or 5 stars before and after May, read with the rating response rate: account holders rate most',
      'The number of 5-star ratings given in each month before and after May, since more 5-star ratings mean that more customers are happy',
      'The conversion rate before and after May, since happier customers come back and buy more, and conversion counts every visitor',
      'The average rating on its social-media page before and after May, since people who choose to comment there care most about plants',
    ],
    answer: 0,
    feedback: {
      1: 'A count of 5-star ratings rises with the number of orders and of raters. Compare a rate, with its denominator.',
      2: 'Customers decide whether to buy before their plants arrive, so the packaging can’t affect that purchase. Conversion measures the shop, not the delivery.',
      3: 'People who choose to comment on social media are a convenience sample: self-selected, and likely to hold strong views either way.',
    },
    solution: 'Customers judge how plants arrive after delivery, so ratings are the right source, and a share of rated orders given 4 or 5 stars is a rate that can be compared across months with different numbers of orders. But rating is optional and only account holders are reminded, so raters lean towards repeat customers, and a change in who rates can move the score with no change in satisfaction. Report the rating response rate beside it, and the account holders and guests separately where possible. A refund rate for damaged plants would make a useful second measure.',
  },
  {
    id: 'b01-fn-18', lesson: 'kpis', type: 'rows', kind: 'applied',
    prompt: 'Kingfisher Couriers (fictional) reviews its KPIs for October. Select every KPI that missed its target in October.',
    data: { table: {
      head: ['KPI', 'Target', 'September', 'October'],
      rows: [
        ['On-time deliveries (% of parcels)', 'At least 95.0%', '93.8%', '94.2%'],
        ['Damaged parcels (per 1,000 delivered)', 'At most 2.0', '1.2', '1.6'],
        ['Cost per parcel', 'At most $3.40', '$3.62', '$3.55'],
        ['Parcels delivered', 'At least 180,000', '191,000', '186,500'],
        ['Complaints (per 1,000 delivered)', 'At most 1.5', '1.7', '1.5'],
        ['Fuel stock (days of supply)', 'Between 5 and 10', '8', '12'],
      ],
    } },
    answer: [0, 2, 5],
    solution: 'Judge each KPI against its target and direction, not against last month. On-time deliveries (94.2% against at least 95.0%) and cost per parcel ($3.55 against at most $3.40) improved but still missed. Fuel stock, at 12 days, is above its band of 5 to 10 days: a “higher is better” rule would have praised it. Damaged parcels got worse and parcels delivered fell, but both still met their targets, and complaints at exactly 1.5 meet a target of at most 1.5.',
  },

  // ---------------------------------------------------------------- summarising-data
  {
    id: 'b01-fn-19', lesson: 'summarising-data', type: 'num', kind: 'numerical',
    prompt: 'In October, gift boxes made up 40% of the online orders of Gannet Chocolate Co. (fictional). In November its online orders rose by 25% and its gift-box orders rose by 50%. What percentage of November’s online orders were gift boxes? Give one decimal place.',
    answer: 48, check: () => 0.40 * 1.50 / 1.25 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 60, say: 'That raises the share by 50% (40 × 1.5) but forgets that all orders, the whole the share is taken of, rose by 25% too. Divide by 1.25 as well.' },
      { value: 65, say: 'That adds and subtracts the percentages (40 + 50 − 25). Percentage changes multiply the counts; they can’t be added to a share.' },
      { value: 33.3, say: 'You divided the wrong way round. Gift boxes grew faster than orders, so their share must rise: multiply by 1.50 and divide by 1.25.' },
    ],
    solution: 'Work with counts. Suppose October had 100 orders, 40 of them gift boxes. November then has 100 × 1.25 = 125 orders and 40 × 1.50 = 60 gift-box orders, so gift boxes are 60 ÷ 125 × 100 = 48.0% of orders: up 8 percentage points, a relative rise of 20%. A percentage means nothing until you know its whole, and here the whole grew too.',
  },
  {
    id: 'b01-fn-20', lesson: 'summarising-data', type: 'multi', kind: 'conceptual',
    prompt: 'Marigold Bakery (fictional) took ten online orders one morning, worth $12, $14, $15, $15, $18, $20, $22, $25, $28 and $310 (a café’s weekly order). Which statements are correct? Select all that apply.',
    options: [
      'The mean, $47.90, multiplied by the 10 orders gives the morning’s takings of $479.',
      'The median, $19, describes a typical order better than the mean does.',
      'Removing the $310 order would lower the median by more than it lowers the mean.',
      'The range, $298, is set almost entirely by the one café order.',
      'The standard deviation would fall sharply if the $310 order were removed.',
      'Because the mean is above the median, the orders are skewed to the left.',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'The other way round: the median moves from $19 to $18, while the mean falls from $47.90 to about $18.78. An extreme value drags the mean, not the median.',
      5: 'A mean above the median signals a long tail of large values: the orders are skewed to the right.',
    },
    solution: 'The total is $479, so the mean is $47.90, and mean × count gives the total. Sorted, the middle two orders are $18 and $20, so the median is $19: a better picture of a typical order, because one $310 order pulls the mean far above it (a right skew). The range, 310 − 12 = $298, would be only $16 without that order. The standard deviation uses every value and squares the distances, so it falls from about $92.23 to about $5.40 when the café order is removed.',
  },
  {
    id: 'b01-fn-21', lesson: 'summarising-data', type: 'num', kind: 'numerical',
    prompt: 'Brindle Pet Insurance (fictional) renewed 64.0% of its policies last year. This year’s target is to raise the renewal rate by 10%. What renewal rate meets the target exactly? Give a percentage to one decimal place.',
    answer: 70.4, check: () => 64.0 * 1.10, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 74, say: 'That adds 10 percentage points. “By 10%” is a relative change: 10% of 64.0%, added to it.' },
      { value: 64.1, say: 'That adds 0.1 of a point. A 10% rise multiplies the rate by 1.10.' },
      { value: 6.4, say: 'That is the rise needed, in percentage points. The question asks for the rate that meets the target.' },
    ],
    solution: '“By 10%” is a relative change, so the target rate is 64.0% × 1.10 = 70.4%, a rise of 6.4 percentage points. “By 10 percentage points” would mean 74.0%, a much harder target. A target that is a change in a percentage should say which it means.',
  },

  // ---------------------------------------------------------------- interpreting-results
  {
    id: 'b01-fn-22', lesson: 'interpreting-results', type: 'mc', kind: 'applied',
    prompt: 'Elmstead Opticians (fictional) plots its 16 branches on a chart: hours of customer-service training last year against average customer rating. Branches with more training have higher ratings. Training was offered first to the eight branches refurbished in the last two years. The regional manager wants to roll it out everywhere because it “raises ratings”. What is the best reading, and the best next step?',
    options: [
      'Refurbishment is a likely confounder; next, train a randomly chosen half of the other branches and compare',
      'There is no confounder to worry about; next, roll training out to every branch, as the chart shows its effect',
      'Chance is the likely explanation; next, wait until the chain has more branches, since 16 points are too few',
      'Reverse causation is likely; next, cut training at the best-rated branches and see whether their ratings fall',
    ],
    answer: 0,
    feedback: {
      1: 'The trained branches were also the refurbished ones, so the chart compares branches that differ in more than training. A correlation across branches can’t separate the two.',
      2: 'Sixteen points are few, but the main problem isn’t chance: training and refurbishment went together. More branches with the same pattern would not untangle them.',
      3: 'Training went to the refurbished branches, not to branches that asked for it because they were rated highly. And cutting it at the best branches risks harm without separating the causes.',
    },
    solution: 'New premises may lift ratings on their own, and the refurbished branches were trained first, so refurbishment can drive both and make training look effective: a confounder. The chart shows a correlation between branches, not a cause. A clean test is an experiment: among the branches not refurbished, train a randomly chosen half now and the rest later, and compare how their ratings change. Roll out if the trained half improves by more.',
  },
  {
    id: 'b01-fn-23', lesson: 'interpreting-results', type: 'num', kind: 'numerical',
    prompt: 'Shearwater Ferries (fictional) sells tickets through its website and its app. In March the website had 40,000 visits converting at 4.0% and the app 10,000 visits converting at 6.0%. In April a campaign sent visitors to the website, which had 54,000 visits converting at 4.1%, while the app had 6,000 visits converting at 6.2%. Both channels improved, yet overall conversion fell. Recompute April’s overall rate at March’s mix of visits. How many percentage points of the change in overall conversion from March to April came from the change in the mix? Give two decimal places, with a minus sign for a fall.',
    answer: -0.21, check: () => (54000 * 0.041 + 6000 * 0.062) / 60000 * 100 - (40000 * 0.041 + 10000 * 0.062) / 50000 * 100, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [
      { value: -0.09, say: 'That is the whole change in overall conversion, 4.31% − 4.40%. Part of it came from the channel rates, which rose.' },
      { value: 0.12, say: 'That is the part due to the channel rates (4.52% − 4.40%). The mix accounts for the rest of the change.' },
      { value: 4.52, say: 'That is April’s rate at March’s mix. Compare it with April’s actual overall rate to isolate the mix.' },
      { value: 4.31, say: 'That is April’s actual overall rate. The question asks how much of the change came from the mix.' },
    ],
    solution: 'March overall = (40,000 × 4.0% + 10,000 × 6.0%) ÷ 50,000 = 2,200 ÷ 50,000 = 4.40%. April overall = (54,000 × 4.1% + 6,000 × 6.2%) ÷ 60,000 = (2,214 + 372) ÷ 60,000 = 4.31%, a change of −0.09 points. At March’s mix (80% website, 20% app), April’s channel rates give 0.8 × 4.1 + 0.2 × 6.2 = 4.52%, so the rates alone would have raised conversion by 0.12 points. The rest, 4.31 − 4.52 = −0.21 points, came from the mix: the campaign moved visits towards the website, the channel that converts less. That is Simpson’s paradox on a small scale.',
  },
  {
    id: 'b01-fn-24', lesson: 'interpreting-results', type: 'classify', kind: 'conceptual',
    prompt: 'Is each comparison fair as it stands? If not, what distorts it most?',
    items: [
      'Orders in February (28 days) against orders in January (31 days), as monthly totals',
      'A garden centre’s barbecue sales in June against its sales in January',
      'A new candle’s sales rising 300%, from 3 in its first week to 12 in its second',
      'Visits per day in the four weeks after a website change against the four weeks before it',
      'A toy shop’s December revenue against its revenue last December, both months in full',
      'Ice-cream orders in August against the average month of the same year',
    ],
    categories: ['Fair as it stands', 'Different period lengths', 'The season', 'A small base'],
    answer: [1, 2, 3, 0, 0, 2],
    feedback: {
      0: 'January has three more days than February, so monthly totals favour it before anything else is considered. Compare orders per day.',
      2: 'From 3 to 12 is a rise of 9 candles: the 300% reflects the tiny starting value. Report the counts beside the percentage.',
      3: 'Equal periods either side of a known change, measured per day, compare like with like.',
      5: 'The average month mixes winter with summer; August ice-cream would beat it in any year.',
    },
    solution: 'Months of different lengths need per-day figures or equal periods; seasonal businesses need the same period a year earlier; tiny starting values make percentage changes explode, so report the counts. Equal four-week periods either side of a change, and the same month a year apart, are fair as they stand.',
  },
];
