// business-questions.js — B01 · Business questions and measurable objectives. Content only; exercises are in business-questions.ex.js.
import { SHOP, TARGETS } from './case.js?v=17';

const NESTED = '<svg viewBox="0 0 640 286" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<rect x="16" y="14" width="608" height="258" rx="8" style="fill:none;stroke:var(--rule-strong);stroke-width:2"/>'
  + '<rect x="46" y="58" width="548" height="204" rx="8" style="fill:none;stroke:var(--series-1);stroke-width:2"/>'
  + '<rect x="76" y="102" width="488" height="150" rx="8" style="fill:none;stroke:var(--series-2);stroke-width:2"/>'
  + '<rect x="106" y="146" width="428" height="96" rx="8" style="fill:none;stroke:var(--series-3);stroke-width:2;stroke-dasharray:6 3"/>'
  + '<text x="30" y="40" font-weight="700" fill="currentColor">A. Every order record</text><text x="610" y="40" text-anchor="end" font-size="13" fill="currentColor">left out of B: staff test orders</text>'
  + '<text x="60" y="84" font-weight="700" fill="currentColor">B. Orders by real customers</text><text x="580" y="84" text-anchor="end" font-size="13" fill="currentColor">left out of C: cancelled before payment</text>'
  + '<text x="90" y="128" font-weight="700" fill="currentColor">C. Paid orders</text><text x="550" y="128" text-anchor="end" font-size="13" fill="currentColor">left out of D: refunded in full</text>'
  + '<text x="120" y="172" font-weight="700" fill="currentColor">D. Kept orders</text>'
  + '<text x="320" y="200" text-anchor="middle" font-size="13" fill="currentColor">Each definition is narrower than the one around it.</text>'
  + '<text x="320" y="222" text-anchor="middle" font-size="13" fill="currentColor">Which one is “an order” depends on the question.</text>'
  + '</svg>';

export default {
  slug: 'business-questions',
  title: 'Business questions and measurable objectives',
  blurb: 'Most analyses that fail, fail at the first step: the question. Learn to turn a vague worry into a decision-focused question, a SMART objective and testable hypotheses, and to pin down exactly what counts, for whom, over what period and compared with what, before you open any data.',
  status: 'reviewed',
  objectives: [
    'Distinguish a vague question from a decision-focused business question, and rewrite one as the other.',
    'Write a SMART objective, and test an objective against the five criteria.',
    'Write testable hypotheses and state the evidence that would support or contradict each.',
    'Write an operational definition for a business term such as an order, a customer or a visit, and calculate how the choice of definition changes a result.',
    'Identify the unit of analysis, time frame, comparison and threshold a question needs, and the stakeholders who should agree them.',
  ],
  prerequisites: [
    { lesson: 'b01/four-kinds-of-analytics', why: 'This lesson teaches the first step of the analytics process, and uses the four kinds of analytics to say what a question is really asking for.' },
  ],
  case: 'lantern',

  concept: [
    { case: `On 2 October 2026 Ana sees September’s figures for Lantern’s online shop and sends you a message: “What happened in September? Sales have fallen off a cliff. Is it the new website?” The shop took ${SHOP.webOrders[2] + SHOP.appOrders[2]} orders in September, against ${SHOP.webOrders[1] + SHOP.appOrders[1]} in August, and the redesigned website checkout went live on 1 September. Ana wants an answer within a week.` },
    { p: 'It is tempting to open the data at once. Resist: as it stands the question cannot be answered, because nobody yet knows what an answer would look like. Two analysts given this message could work hard for a week and come back with answers to different questions.' },
    { p: '“Sales” could mean orders, revenue or packs of coffee. “Fallen” compared with what: August, the average month, Ana’s target? “The new website” could mean the redesigned checkout, the whole site, or the shop including the app. And “what happened” could ask for a description, a diagnosis or a decision.' },
    { p: 'This lesson is about the work that comes before the data: turning a worry like Ana’s into a question that data can answer and a decision can use. It has five parts. Tie the question to a decision; make the objective measurable; state hypotheses that could turn out wrong; define every term operationally; and fix the unit, time frame and comparison. Along the way, agree all of it with the people who have a stake in the answer.' },

    { h: 'Start from the decision' },
    { p: 'A <g>decision-focused question</g> is tied to a choice someone must make, and is stated so that different answers would lead to different actions. The quickest test is to ask the person who will decide: “If the answer were X, what would you do? And if it were Y?” If both answers lead to the same action, the question is not worth the analysis, however interesting it is.' },
    { p: 'Asked this way, Ana’s worry turns out to be about three possible actions: roll the checkout redesign back, ask the web agency to fix something specific in it, or leave it alone because the fall has another cause. That tells you what the analysis must establish: whether the fall happened where the checkout changed (on the website, not in the app), whether it began when the change did, and how large it was. It also tells you what you do not need, such as a forecast of next year’s sales.' },
    { table: {
      caption: 'Vague and decision-focused versions of the same questions (fictional)',
      head: ['Vague', 'Decision-focused'],
      rows: [
        ['What happened in September?', 'Did the website’s orders per visit fall after the redesigned checkout went live on 1 September, compared with the weeks before and with the app, by enough to justify changing the checkout?'],
        ['Are customers happy?', 'Has the share of rated orders given 4 or 5 stars fallen this quarter compared with last, by enough to justify reviewing how we pack and post orders?'],
        ['Should we do more on social media?', 'Did November’s two-week social-media campaign win new customers at a lower cost per customer than our search advertising, so that part of December’s budget should move to it?'],
      ],
    } },

    { h: 'From goals to SMART objectives' },
    { p: 'Businesses state what they want as objectives, and objectives need the same precision as questions. A widely used checklist says an objective should be a <g>SMART objective</g>:' },
    { list: [
      '<b>Specific</b>: it says exactly what is to change, where and for whom.',
      '<b>Measurable</b>: it names a measure and the level to reach, so that anyone can tell whether it was met.',
      '<b>Achievable</b>: it is ambitious but possible with the time and resources available.',
      '<b>Relevant</b>: it serves the organisation’s purpose and the decision at hand.',
      '<b>Time-bound</b>: it says by when, or over which period.',
    ] },
    { case: `In July Ana set four targets for the shop: a conversion rate (orders divided by visits) of at least ${TARGETS.conversion.toFixed(1)}%, an average order value of at least $${TARGETS.aov}, revenue of at least $${TARGETS.monthlyRevenue.toLocaleString('en-US')} a month, and at least ${TARGETS.returningShare}% of orders from returning customers. They are a good start, because each names a measure and a level, but they leave questions open: does the conversion target apply to every month or to the half-year as a whole, are web and app visits counted together, and is an order counted when it is placed or when it is paid for?` },
    { p: 'A SMART version of the first target might read: “In every calendar month from October to December 2026, the shop’s conversion rate (paid orders ÷ visits, counting web and app together) is at least 3.0%.” It is specific (which visits and orders), measurable (a rate and a level), achievable (Ana judges it realistic for a shop of Lantern’s size), relevant (conversion is the part of revenue the website most affects) and time-bound (each month of the quarter). Strictly, paid orders ÷ visits is paid orders per visit: it equals the share of visits that end in an order only if no visit produces two orders, which is close enough for a small online shop but worth stating.' },

    { h: 'Hypotheses: explanations that could be wrong' },
    { p: 'A <g>hypothesis</g> is a proposed explanation or prediction, stated precisely enough that data could show it to be wrong. “The new checkout is the problem” is a suspicion. It becomes a testable hypothesis when it says what you would expect to see if it were true, and therefore what would count against it. For Ana’s question, write down several competing hypotheses before looking, with the evidence each predicts:' },
    { table: {
      caption: 'Competing hypotheses for September’s fall in orders',
      head: ['Hypothesis', 'If it is true, expect', 'Evidence against it'],
      rows: [
        ['H1. The redesigned checkout makes it harder to complete an order on the website.', 'A fall from 1 September in the website’s orders per visit; little change in the app, whose checkout did not change.', 'A similar fall in the app, or a fall that began before 1 September.'],
        ['H2. Fewer people came to the shop.', 'Fewer visits in September than in August.', 'Visits that held up or rose.'],
        ['H3. Different people came: a promotion or a link brought in visitors less likely to buy.', 'More visits from one source, with few orders from it.', 'A mix of visits by source much like August’s.'],
        ['H4. The counting changed, not the customers: the redesign altered how visits or orders are recorded.', 'Paid orders in the payment provider’s records that are missing from the shop’s report, or a jump in recorded visits with no change in where visitors came from.', 'Order counts that match the payment provider’s records, and visit counts that behave as before.'],
      ],
    } },
    { p: 'Writing the hypotheses first has two benefits. It makes the analysis efficient, because each hypothesis says which data to fetch. And it protects you against a common trap: settling on an explanation first and then noticing only the evidence that fits it. H4 is easy to forget and important. When a website changes, the way it records visits and orders often changes too, and a fall in the numbers can be a fall in the counting.' },

    { h: 'Operational definitions' },
    { p: 'Every term in a question must be pinned down before it can be measured. An <g>operational definition</g> states exactly how a concept is measured: which records count, from which source, by which rule and over which period, so that two people applying it to the same data get the same number. Ana’s “sales” could mean any of several things:' },
    { list: [
      '<b>Orders placed</b>: every order a customer submits, including ones later cancelled.',
      '<b>Paid orders</b>: orders for which payment was taken, leaving out cancellations before payment and test orders placed by staff.',
      '<b>Kept orders</b>: paid orders that were not later refunded.',
      '<b>Revenue</b>: the money from paid orders, before or after refunds, with or without delivery charges.',
    ] },
    { figure: {
      svg: NESTED,
      caption: 'Four definitions of “an order”, each narrower than the last. The worked example below puts numbers on them.',
      alt: 'Four nested rectangles. The outermost is “A. Every order record”; the note beside it says staff test orders are left out of the next one. Inside it is “B. Orders by real customers”, with the note that orders cancelled before payment are left out of the next. Inside that is “C. Paid orders”, with the note that orders refunded in full are left out of the next. The innermost, dashed, is “D. Kept orders”. Text in the middle reads: “Each definition is narrower than the one around it. Which one is ‘an order’ depends on the question.”',
    } },
    { p: 'None of these is the right definition in general; each suits a different question. For a question about the checkout, what matters is whether customers who tried to buy managed to pay, so paid orders by real customers is the natural measure. Refunds arrive weeks later and have nothing to do with the checkout. Whichever you choose, write it down, and apply it to every month you compare.' },
    { p: 'Customers need definitions too. Is a customer an account, an e-mail address or a person? A guest who checks out without an account, or a couple who share one, makes the count of customers differ from the number of people, so say which you count and how a customer is identified. Even “falling” needs a definition: lower than which baseline, and by how much? The theory section returns to that.' },
    { p: 'So do visits. Lantern’s shop counts visits as sessions. Google Analytics, a widely used web-analytics service, defines a session as a period during which a user interacts with a website or app, and by default ends a session after 30 minutes of inactivity; the site’s owner can change that timeout. Change the timeout, or the way a redesigned page records activity, and the number of visits changes even if nobody behaves any differently.' },
    { p: 'Official statistics show how much detail a good operational definition needs. The US Bureau of Labor Statistics counts a person as unemployed only if, in the survey’s reference week, they had no job, were available for work, and had made at least one specific, active effort to find a job in the four weeks ending with that week (or were on temporary layoff, expecting to be recalled). A person without a job who has stopped looking is therefore not counted as unemployed. You may or may not like that choice, but everyone can see exactly what the number measures.' },
  ],

  theory: [
    { h: 'What makes a question answerable' },
    { p: 'Beyond the decision, a well-framed question fixes five things: the measure, the unit of analysis, the time frame, the comparison and the threshold. Together they turn a topic into something you can calculate.' },
    { table: {
      caption: 'The parts of a well-framed question, for Ana’s September question',
      head: ['Part', 'What it fixes', 'For Ana'],
      rows: [
        ['Decision', 'The choice the answer will inform, who makes it and by when', 'Fix, roll back or keep the checkout; Ana; by 9 October'],
        ['Measure', 'The quantity, with its operational definition', 'Paid orders per visit (conversion), by channel'],
        ['Unit of analysis', 'What the results are counted and reported for', 'Visits and orders, by channel and by day'],
        ['Time frame', 'The period covered and the length of the periods compared', 'Equal periods before and after 1 September'],
        ['Comparison', 'What the result is set against to judge a change', 'The website before 1 September; the app, whose checkout did not change'],
        ['Threshold', 'How big a change must be to matter', 'A relative fall in website conversion of a tenth or more (3.0% to 2.7% would qualify), larger than the usual week-to-week variation'],
      ],
    } },

    { h: 'The unit of analysis' },
    { p: 'The <g>unit of analysis</g> is the entity a question is about and the results are reported for: the order, the customer, the visit, the day, the product. Changing it can change the answer a great deal. Suppose that in one week 60 customers ordered through Lantern’s app, placing 90 orders between them, and 100 customers ordered on the website, placing 110 (and nobody used both). What share of the shop’s business came through the app?' },
    { p: String.raw`Counted in customers, the app’s share is <m>60 \div (60 + 100) = 37.5\%</m>. Counted in orders, it is <m>90 \div (90 + 110) = 45\%</m>. Both are correct. App customers in this week ordered more often, <m>90 \div 60 = 1.5</m> orders each against <m>110 \div 100 = 1.1</m> on the website, so the app’s share of orders is larger than its share of customers.` },
    { p: String.raw`A marketing manager deciding where to recruit new customers wants the first figure; a manager planning packing staff wants the second. Name the unit in the question and the disagreement disappears.` },
    { p: 'The unit of analysis is not always the unit in which the data arrive. Lantern’s order export has one row per order, so a question about customers needs the rows grouped by customer first. The data-types lesson in module 2 calls what one row describes the unit of observation, and B02 shows how to move from one to the other.' },

    { h: 'Time frame and comparison' },
    { p: 'Every result is judged against something. A <g>baseline</g> is the value a result is compared with to decide whether anything changed, and the common choices each answer a different question:' },
    { list: [
      '<b>The previous period</b> (September against August) shows recent change, but mixes in seasonal effects.',
      '<b>The same period last year</b> removes the season, but needs a year of history. Lantern’s shop opened in March 2026, so it has none.',
      '<b>A target</b> shows whether the business is where it planned to be, not whether anything changed.',
      '<b>A comparison group</b> that did not experience the change, such as the app beside the website, shows what would probably have happened without it.',
      '<b>A forecast</b> made beforehand shows whether the result was a surprise.',
    ] },
    { p: 'The <g>time frame</g> needs as much care. Calendar months differ in length: September has 30 days and August 31, so a comparison of monthly totals favours August by a day before anything else is considered. Months also differ in their mix of weekdays and weekends, and in holidays. For a change that happened on a known date, such as Lantern’s checkout on 1 September, comparing equal periods either side of the date (the four weeks before and the four weeks after, say) is cleaner than comparing calendar months, and a day-by-day chart shows whether there was a sudden step on that date.' },
    { p: 'The period must be long enough to see past day-to-day noise, but short enough not to mix in a second change. Later in the case, a fix for a payment-page bug on mobile browsers was released on 5 October, so October’s figures combine the shop before and after the fix and cannot serve as a clean “after” period for either change.' },
    { p: 'Finally, decide in advance how large a change must be to count. A shop with a few hundred orders a month will see its monthly figures move up and down by chance alone. Module 3 discusses how to judge whether a change is larger than normal variation, and B04 treats it formally. For now, put a threshold in the question, even a rough one, so that “falling” has a meaning before you see the numbers.' },

    { h: 'Testable hypotheses, more formally' },
    { p: 'A testable hypothesis has four features. It names the measure and the population (website visits in the weeks after 1 September), states a direction or a difference (lower than before) and names the comparison (the weeks before, and the app). And it is falsifiable: some possible result would count against it. “The checkout might be affecting sales somehow” has none of the four.' },
    { p: 'Statistics formalises this. A test starts from a <i>null hypothesis</i>, a statement of no difference (the website’s conversion was the same before and after 1 September), and an <i>alternative hypothesis</i>, the claim that contradicts it, which you conclude only if the evidence against the null is strong enough to reject it. Failing to reject the null does not prove it true. B04 Descriptive and Inferential Statistics teaches how to judge “strong enough”. Business analyses often stop short of a formal test, but the discipline is the same: state beforehand what would change your mind.' },
    { callout: 'warn', title: 'Don’t go fishing', html: 'Split the data enough ways (by day, device, region, product, hour) and some splits will show large changes by chance alone. A hypothesis written before you look protects you. A pattern found after searching everywhere is a new hypothesis, to be tested on fresh data, not a finding.' },

    { h: 'SMART in more depth' },
    { p: 'The SMART checklist is usually traced to a 1981 article by George T. Doran in <i>Management Review</i>. Doran’s own letters were Specific, Measurable, Assignable (say who will do it), Realistic and Time-related; the wording has evolved since. The US Centers for Disease Control and Prevention expand it as Specific, Measurable, Achievable, Relevant and Time bound, and a University of Florida extension guide uses Attainable for the A. The letters matter less than the questions behind them.' },
    { p: 'Three cautions. First, Measurable is only as good as the operational definition behind the measure: “conversion of at least 3.0%” is measurable only once visits and orders are defined. Second, Achievable is a judgement: an objective that is too easy wastes effort, and one that is plainly impossible is ignored. Third, an objective that is precise but irrelevant is worse than useless, because it pulls effort towards the wrong thing.' },
    { p: 'A target for social-media followers can be perfectly SMART and have nothing to do with selling coffee. Module 3 returns to what happens when people are rewarded for hitting a number.' },

    { h: 'Stakeholders' },
    { p: 'A <g>stakeholder</g> in an analysis is anyone who affects or is affected by the decision it supports. Stakeholders fall into four groups: those who decide (Ana); those who supply or understand the data (the web agency, whoever manages the payment provider’s account); those who carry out the result (the agency, which would change the checkout; the packing team, who see order volumes rise and fall); and those the decision affects (customers). Each sees something the others do not. The agency knows what else changed on 1 September besides the checkout; customers’ complaints may describe the problem directly.' },
    { p: 'The practical step is to agree the framed question, in writing, with the decision-maker before the analysis starts, and to check the operational definitions with the people who produce the data. A one-page question brief is enough: the decision and its deadline, the measure and its definition, the unit, time frame and comparison, the hypotheses, the threshold, and who has agreed it. It takes an hour and can save a week.' },
  ],

  formulas: [
    { id: 'bq-share-by-unit', name: 'Share of a group, for a chosen unit',
      tex: String.raw`\text{Share of group } g = \dfrac{n_g}{\sum_h n_h} \times 100`,
      where: [
        ['g', 'The group whose share you want, such as the app', ''],
        [String.raw`n_g`, 'Number of units (customers, orders, visits) in group g', 'units'],
        [String.raw`\sum_h n_h`, 'Total number of the same units across all the groups h', 'units'],
      ],
      assumptions: 'Each unit belongs to exactly one group: no customer is counted in both the app and the website.',
      note: 'The same groups can have very different shares depending on the unit counted: customers, orders or revenue. Name the unit in the question.' },
    { id: 'bq-rate-per-day', name: 'Rate per day, for periods of different length',
      tex: String.raw`\text{Daily rate} = \dfrac{\text{Count in the period}}{\text{Days in the period}}`,
      where: [
        [String.raw`\text{Count in the period}`, 'Number of events in the period, such as orders or visits', 'events'],
        [String.raw`\text{Days in the period}`, 'Length of the period', 'days'],
      ],
      assumptions: 'Every day is treated as comparable; differences between weekdays and weekends, and holidays, are ignored.',
      note: 'Daily rates remove the effect of months of different length. For a change on a known date, equal periods either side of the date are cleaner still.' },
  ],

  examples: [
    { level: 'simple', title: 'From a vague question to a decision-focused one', fictional: true,
      setup: 'The operations manager of Brookside Fitness, a fictional chain of three gyms, writes: “Are members using the gym less? Riverside feels quieter.” She is deciding whether to stop opening the Riverside gym at 6 a.m. on weekdays, which would save staff costs. Turn her message into a decision-focused question.',
      steps: [
        'Name the decision and its options: keep or end 6 a.m. weekday opening at Riverside, decided by the operations manager before the next staff rota is published. Any measure that would not change this choice can be left out.',
        'Choose the measure and define it operationally. What matters is how many members use the early hour, so the measure is the number of member entries (key-card swipes) between 6:00 and 7:00 on weekdays. Staff swipes are left out, and a member who swipes twice within ten minutes counts once.',
        'Fix the unit of analysis, time frame and comparison. Unit: the weekday early hour, one count per weekday. Time frame: the last eight weeks. Comparisons: the same eight weeks last year, because gym use is seasonal, and the other two gyms, which kept their hours.',
        'Set the threshold that would change the decision. The manager estimates that the early hour costs more in wages than it keeps in memberships if fewer than 15 members use it on an average weekday.',
        'Write the question out in full, and agree it with the manager before pulling any data.',
      ],
      answer: '“Over the last eight weeks, how many members on average entered Riverside between 6:00 and 7:00 on weekdays, compared with the same weeks last year and with the other two gyms, and is it below 15?”',
      interpretation: '“Using the gym less” could have been measured a dozen ways: total visits, visits per member, class bookings, time spent inside. Starting from the decision picked one, the early hour, because it is the only part of the question that bears on the rota. The rewritten question is narrower than the original, and that is its strength.' },

    { level: 'challenging', title: 'Which orders count?', fictional: true,
      setup: 'Quillmark Books, a fictional online bookshop, has a target of converting at least 3.0% of its website visits into orders. In October the site had 42,000 visits and the order system holds 1,260 order records. Of these, 24 are test orders placed by staff checking the site, 46 were cancelled by customers before payment was taken, and 35 were paid but later refunded in full when the books were returned. Did Quillmark meet its target?',
      table: {
        caption: 'Quillmark’s October orders under four definitions (fictional)',
        head: ['Definition', 'Orders', 'Conversion'],
        align: ['l', 'r', 'r'],
        rows: [
          ['A. Every order record', '1,260', '3.00%'],
          ['B. Orders by real customers (A minus staff tests)', '1,236', '2.94%'],
          ['C. Paid orders (B minus cancellations before payment)', '1,190', '2.83%'],
          ['D. Kept orders (C minus full refunds)', '1,155', '2.75%'],
        ],
      },
      steps: [
        String.raw`Apply each definition in turn. Leaving out the staff tests gives <m>1{,}260 - 24 = 1{,}236</m> orders; leaving out the cancellations gives <m>1{,}236 - 46 = 1{,}190</m>; leaving out the refunds gives <m>1{,}190 - 35 = 1{,}155</m>.`,
        String.raw`Calculate the conversion rate, orders divided by visits, under each: <m>1{,}260 \div 42{,}000 = 3.00\%</m>, <m>1{,}236 \div 42{,}000 \approx 2.94\%</m>, <m>1{,}190 \div 42{,}000 \approx 2.83\%</m> and <m>1{,}155 \div 42{,}000 = 2.75\%</m>, each rounded to two decimal places.`,
        'Compare with the target. Only definition A reaches 3.0%, and it does so only by counting records that were never purchases. Under every definition that leaves out the staff tests, Quillmark missed its target.',
        String.raw`Measure the gap between the extremes. Definition A counts <m>1{,}260 - 1{,}155 = 105</m> more orders than definition D, which overstates kept orders by <m>105 \div 1{,}155 \approx 9.1\%</m>.`,
        'Choose the definition that fits the question. The target is about whether visitors complete a purchase, so definition C, paid orders by real customers, fits best: staff tests are not customers, and an order cancelled before payment is not a purchase. Refunds (definition D) come weeks later for reasons unrelated to the website; they matter for a question about revenue, not this one.',
      ],
      answer: 'Under the best-fitting definition (C, paid orders by real customers), Quillmark converted about 2.83% of its visits and missed its 3.0% target. Only by counting every record, including staff tests and cancellations, does it appear to meet it.',
      interpretation: 'Nothing in the data changed between the four rows; only the definition did, and the definition decided whether the target was met. That is why a definition must be agreed when the target is set, not chosen afterwards: a team that picks its definition after seeing the numbers is likely to pick the one that flatters it.' },

    { level: 'applied', title: 'Testing four hypotheses at a hotel', fictional: true,
      setup: 'Seagrass Hotel, the fictional 90-room hotel from F00, takes bookings on its own website and through online travel agents. Direct bookings on its website fell from 800 in the second quarter of the year (April–June) to 640 in the third (July–September). The general manager must decide whether to pay for a redesign of the booking pages. The data team has the website’s visits (40,000 in the second quarter, 32,000 in the third), visits by source, last year’s direct bookings (780 and 770 in the same two quarters) and the revenue manager’s weekly checks of the travel agents’ prices. Frame competing hypotheses and test them.',
      steps: [
        'Before looking, write the hypotheses and what each predicts. H1: the booking pages got worse, so a smaller share of visits ended in a booking. H2: fewer people visited the website. H3: travel agents undercut the hotel’s own prices, pulling guests away. H4: the third quarter is always weaker for direct bookings (the season).',
        String.raw`Test H1 and H2 together. The share of visits ending in a booking was <m>800 \div 40{,}000 = 2.0\%</m> in the second quarter and <m>640 \div 32{,}000 = 2.0\%</m> in the third. It did not change, which contradicts H1. Visits fell by <m>40{,}000 - 32{,}000 = 8{,}000</m>, which supports H2.`,
        String.raw`Test H4 against last year. Last year direct bookings went from 780 to 770, a change of <m>(770 - 780) \div 780 \approx -1.3\%</m>, against <m>(640 - 800) \div 800 = -20\%</m> this year. The season explains almost none of the fall.`,
        'Test H3. The revenue manager’s weekly checks show that the travel agents’ prices matched the hotel’s own throughout the quarter, so there was no undercutting to pull guests away. H3 is contradicted.',
        String.raw`Locate H2 more precisely. Visits from search advertising fell from 16,000 to 8,000, while visits from all other sources held steady at 24,000; the marketing team had cut the search budget in July. If search visitors convert at about the overall 2.0%, the <m>8{,}000</m> lost visits account for about <m>8{,}000 \times 0.02 = 160</m> bookings: the whole fall of <m>800 - 640 = 160</m>.`,
      ],
      answer: 'The evidence supports H2: 8,000 fewer visits from search advertising after the July budget cut; if those visitors convert at about the overall 2.0%, they account for all 160 lost direct bookings. H1, H3 and H4 are contradicted, so a redesign of the booking pages is not the answer.',
      interpretation: 'Each hypothesis said in advance what would count against it, so each could be ruled in or out quickly, and the redesign the manager was about to pay for turned out to address the one explanation the data contradicted. The decision is now a different and clearer one: are the direct bookings that search advertising brings in worth what it costs?' },
  ],

  demo: [
    { widget: 'bq-definitions', intro: 'The Quillmark example as an explorer. Change the number of staff tests, cancellations and refunds, the visits and the target, and see which definitions meet the target. Notice that the data never change, only the definition of an order, yet the answer to “did we meet the target?” can.' },
    { widget: 'bq-unit-share', intro: 'The app’s share of the shop’s business, counted in customers and in orders. Make app customers order more often than website customers and watch the two shares separate; make them order equally often and they agree.' },
  ],

  mistakes: [
    { title: '“Get the data first and see what it says.”', html: 'Without a question, there is no way to choose which data to fetch, which definition to use or what counts as an answer, and a large enough search will always find something. Agree the decision, the measure and the hypotheses first; then open the data.' },
    { title: '“Everyone knows what an order is.”', html: 'Every business term hides choices: placed or paid, with or without cancellations, refunds and staff tests. In the Quillmark example the choice decided whether a target was met. Write the operational definition down, agree it with the people who produce the data, and keep it the same from month to month.' },
    { title: '“A SMART objective must be a good objective.”', html: 'SMART checks the form of an objective, not whether it is worth pursuing. A measurable, dated target for social-media followers can be irrelevant to the business, and an easy target can be SMART and useless. Check relevance against the decision, and achievability against the resources.' },
    { title: '“My hypothesis is that something changed.”', html: 'A hypothesis that no result could contradict cannot be tested. State the measure, the direction, the comparison and the period, and write down the evidence that would show you were wrong before you look.' },
    { title: '“Compare this month with last month.”', html: 'Months differ in length, weekday mix and season, and a month can contain more than one change. Choose the comparison that answers the question: equal periods either side of a known change, the same period last year, or a group that did not experience the change.' },
    { title: '“The share is the share.”', html: 'A share depends on the unit counted. The app had 37.5% of the week’s customers but 45% of its orders in the example above. Say what is being counted.' },
  ],

  application: [
    { case: 'Ana agrees to spend an hour with you framing the September question before any analysis begins. Here is how that conversation turns her message into a brief.' },
    { p: 'You begin with the decision. Ana says that if the checkout is to blame she would rather ask the agency to fix it than roll it back, because the new design also lets customers save their delivery details. If the cause lies elsewhere she will leave the checkout alone, and she needs to tell the agency by 9 October. So the analysis must locate the fall (website or app), date it (from 1 September or not), size it and rule out the other explanations; no forecast is needed.' },
    { p: 'Next come the definitions. You agree to count orders as paid orders from real customers, leaving out staff test orders, and to take visits as the shop’s sessions, with the analytics service’s default 30-minute timeout. Ana does not know whether the redesign changed the shop’s tracking code, which makes H4 more than a formality: if the new pages count sessions differently, the website’s conversion could appear to fall with no change in what customers did. You add a check: compare the shop’s September paid orders with the payment provider’s statement, and look at visits by source.' },
    { p: 'Then the unit, time frame and comparison. Because the change happened on a known date, you will compare the four weeks before 1 September with the four weeks after, rather than August with September, and chart the figures day by day to see whether there is a step on 1 September. The app, whose checkout did not change, is the comparison group. You note that September has one day fewer than August, so monthly totals should not be compared without adjusting for it.' },
    { p: 'Finally, the threshold and the stakeholders. Ana says a relative fall of a tenth or more (3.0% to 2.7% would qualify: 0.3 of a percentage point) in website conversion would be worth acting on; anything smaller she would watch for another month. The agency is asked what else changed on 1 September. Ana adds the short customer survey she e-mailed on 1 October as a source to read with care, because it reached only customers who managed to order. The brief fits on one page:' },
    { table: {
      caption: 'Question brief: Lantern’s September orders (fictional)',
      head: ['Item', 'Agreed'],
      rows: [
        ['Decision', 'Ask the agency to fix the checkout, roll it back, or leave it; Ana decides by 9 October'],
        ['Question', 'Did the website’s paid orders per visit fall after 1 September, compared with the four weeks before and with the app, by a relative tenth or more (3.0% to 2.7% would qualify: 0.3 of a percentage point)?'],
        ['Measure', 'Conversion: paid orders from real customers ÷ sessions (30-minute timeout), by channel'],
        ['Unit and time frame', 'Sessions and paid orders by channel and by day, four weeks either side of 1 September'],
        ['Comparison', 'The same channel before 1 September; the app over the same days'],
        ['Hypotheses', 'H1 checkout harder to use; H2 fewer visits; H3 different visitors; H4 counting changed'],
        ['Checks', 'Paid orders against the payment provider’s statement; visits by source; anything else that changed on 1 September'],
        ['Agreed by', 'Ana (the decision), the web agency (what changed), you (the analysis)'],
      ],
    } },
    { p: 'Notice what the brief does not contain: a single result about September. All of it was settled before the data were opened, which is what makes the answer, when it comes, trustworthy. The same habits apply far beyond a small online shop. A hospital asking whether a new triage system shortened waits must define “wait” (from arrival to what?), choose a comparison (the same months last year, or a hospital that kept the old system) and agree with clinicians what size of change matters. The course project asks you to carry Ana’s brief through to a diagnosis and a recommendation.' },
  ],

  summary: [
    'Start from the decision: a good question is one whose possible answers would lead to different actions.',
    'A SMART objective is specific, measurable, achievable, relevant and time-bound; it is only as measurable as the definitions behind it, and it must still be relevant.',
    'A testable hypothesis names the measure, direction, comparison and period, and says in advance what evidence would contradict it. Write several competing hypotheses, including “the counting changed”.',
    'An operational definition says exactly which records count, from which source, by which rule and over which period. The choice can decide whether a target is met.',
    'The unit of analysis decides what is counted: the same groups can have different shares of customers and of orders.',
    'Choose the baseline and time frame deliberately: months differ in length and season, and equal periods either side of a known change compare more cleanly.',
    'Agree a one-page question brief with the decision-maker and the people who produce the data before opening the data.',
  ],

  glossary: [
    { term: 'Decision-focused question', def: 'A business question tied to a choice someone must make, stated so that different possible answers would lead to different actions.' },
    { term: 'SMART objective', def: 'An objective that is Specific, Measurable, Achievable, Relevant and Time-bound. Sources expand some letters differently: Doran’s 1981 original used Assignable, Realistic and Time-related, and some guides use Attainable for A.' },
    { term: 'Hypothesis', def: 'A proposed explanation or prediction, stated precisely enough that data could show it to be wrong.' },
    { term: 'Operational definition', def: 'An exact statement of how a concept is measured: which records count, from which source, by which rule and over which period, so that two people applying it to the same data get the same number.' },
    { term: 'Unit of analysis', def: 'The entity a question is about and the results are reported for, such as the order, the customer, the visit or the day.' },
    { term: 'Baseline', def: 'The value a result is compared with to judge whether anything changed, such as the previous period, the same period last year, a target, a comparison group or a forecast.' },
    { term: 'Time frame', def: 'The period a question covers and the length of the periods it compares, such as calendar months, or four weeks either side of a change.' },
    { term: 'Stakeholder', def: 'A person or group who affects or is affected by a decision: those who decide, those who supply the data, those who carry out the result and those the result affects.' },
  ],

  references: [
    { text: 'Centers for Disease Control and Prevention. “Developing Objectives and Evaluation Questions”. <i>Information for Tuberculosis Programs</i>.', url: 'https://www.cdc.gov/tb-programs/php/evaluation/objectives.html', checked: '2026-10-23' },
    { text: 'Farnsworth, D., Clark, J. L., Cothran, H. &amp; Wysocki, A. (2020). <i>Developing SMART Goals for Your Organization</i> (FE577). University of Florida IFAS Extension.', url: 'https://ask.ifas.ufl.edu/publication/FE577', checked: '2026-10-23' },
    { text: 'Haughey, D. “A Brief History of SMART Goals”. <i>Project Smart</i>.', url: 'https://www.projectsmart.co.uk/brief-history-of-smart-goals.php', checked: '2026-10-23' },
    { text: 'US Bureau of Labor Statistics. “Concepts and Definitions (CPS)”. <i>Labor Force Statistics from the Current Population Survey</i>.', url: 'https://www.bls.gov/cps/definitions.htm', checked: '2026-10-23' },
    { text: 'Google. “About Analytics sessions”. <i>Analytics Help</i>.', url: 'https://support.google.com/analytics/answer/9191807', checked: '2026-10-23' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 9.1, “Null and Alternative Hypotheses”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/9-1-null-and-alternative-hypotheses', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'September orders (case.js)', value: SHOP.webOrders[2] + SHOP.appOrders[2], shown: 251 },
    { what: 'August orders (case.js)', value: SHOP.webOrders[1] + SHOP.appOrders[1], shown: 316 },
    { what: 'Visits rose August to September (case.js), as H2’s evidence implies', value: (SHOP.webVisits[2] + SHOP.appVisits[2]) > (SHOP.webVisits[1] + SHOP.appVisits[1]) ? 1 : 0, shown: 1 },
    { what: 'Conversion target (case.js)', value: TARGETS.conversion, shown: 3 },
    { what: 'AOV target (case.js)', value: TARGETS.aov, shown: 45 },
    { what: 'Monthly revenue target (case.js)', value: TARGETS.monthlyRevenue, shown: 15000 },
    { what: 'Returning-share target (case.js)', value: TARGETS.returningShare, shown: 35 },
    { what: 'Unit: app share of customers', value: 60 / (60 + 100) * 100, shown: 37.5 },
    { what: 'Unit: app share of orders', value: 90 / (90 + 110) * 100, shown: 45 },
    { what: 'Unit: app orders per customer', value: 90 / 60, shown: 1.5 },
    { what: 'Unit: web orders per customer', value: 110 / 100, shown: 1.1 },
    { what: 'September has one day fewer than August', value: 31 - 30, shown: 1 },
    { what: 'Quillmark: B', value: 1260 - 24, shown: 1236 },
    { what: 'Quillmark: C', value: 1260 - 24 - 46, shown: 1190 },
    { what: 'Quillmark: D', value: 1260 - 24 - 46 - 35, shown: 1155 },
    { what: 'Quillmark: conversion A', value: 1260 / 42000 * 100, shown: 3 },
    { what: 'Quillmark: conversion B', value: 1236 / 42000 * 100, shown: 2.94 },
    { what: 'Quillmark: conversion C', value: 1190 / 42000 * 100, shown: 2.83 },
    { what: 'Quillmark: conversion D', value: 1155 / 42000 * 100, shown: 2.75 },
    { what: 'Quillmark: A minus D', value: 1260 - 1155, shown: 105 },
    { what: 'Quillmark: overstatement', value: (1260 - 1155) / 1155 * 100, shown: 9.1, tol: 0.05 },
    { what: 'Seagrass: Q2 conversion', value: 800 / 40000 * 100, shown: 2 },
    { what: 'Seagrass: Q3 conversion', value: 640 / 32000 * 100, shown: 2 },
    { what: 'Seagrass: visit fall', value: 40000 - 32000, shown: 8000 },
    { what: 'Seagrass: last year change', value: (770 - 780) / 780 * 100, shown: -1.3, tol: 0.05 },
    { what: 'Seagrass: this year change', value: (640 - 800) / 800 * 100, shown: -20 },
    { what: 'Seagrass: search visits fell by', value: 16000 - 8000, shown: 8000 },
    { what: 'Seagrass: other sources Q2', value: 40000 - 16000, shown: 24000 },
    { what: 'Seagrass: other sources Q3', value: 32000 - 8000, shown: 24000 },
    { what: 'Seagrass: bookings from lost visits', value: 8000 * 0.02, shown: 160 },
    { what: 'Seagrass: fall in bookings', value: 800 - 640, shown: 160 },
  ],
};
