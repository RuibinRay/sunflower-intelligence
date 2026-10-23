// kpis.js — B01 · KPIs: measuring what matters. Content only; exercises are in kpis.ex.js.
// Uses SHOP and TARGETS from case.js, but only July 2026 as a worked month: the six-month KPI table (conversion,
// AOV against target, revenue) is left to the project. New fictional facts introduced here, all labelled: Lantern's
// KPI dictionary (definitions, owners, the rating guardrail of 4.3) and an illustrative 8,650 distinct July visitors.
// Every other business and figure is fictional and labelled.
import { SHOP as S, TARGETS as T, DERIVED as D } from './case.js';

const J = 0;                                   // July 2026, the month used as the worked example
const julOrders = D.orders[J];                 // 294
const julVisits = D.visits[J];                 // 9,800
const julRevenue = julOrders * S.aov[J];       // 12,112.80

export default {
  slug: 'kpis',
  title: 'KPIs: measuring what matters',
  blurb: 'A key performance indicator is a metric with a job: an exact formula, a target, a direction and an owner. Learn to define an online shop’s KPIs precisely, to tell counts from rates and leading from lagging indicators, and to build a balanced set of measures that is hard to game.',
  status: 'draft',
  objectives: [
    'Distinguish a metric from a key performance indicator (KPI), and a count from a rate, and explain what each tells a manager.',
    'Calculate conversion rate, average order value, revenue, returning-customer share and rating response rate from raw counts, naming the numerator and denominator of each.',
    'Compare a KPI with its target and direction, stating the gap in units, in percentage points or as a percentage of the target as appropriate.',
    'Classify measures as leading or lagging indicators and explain how a chain of them connects activity to results.',
    'Evaluate a set of KPIs for balance and for the risk of gaming that Goodhart’s law describes.',
  ],
  prerequisites: [
    { lesson: 'b01/business-questions', why: 'A KPI is a measurable objective reviewed every period, so it needs the same operational definitions, time frames and comparisons.' },
    { lesson: 'b01/problem-solving-frameworks', why: 'The driver tree revenue = visits × conversion × average order value organises the shop’s KPIs.' },
    { lesson: 'b01/data-quality', why: 'A KPI is only as trustworthy as the counts it is built from.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'From July 2026 Ana Lim reviews Lantern Coffee’s online shop every month. The shop’s platform can report dozens of numbers: visits, page views, time on site, products viewed, orders, refunds, ratings. Ana has written down four targets: a conversion rate of 3.0%, an average order value of $45, revenue of $15,000 a month and 35% of orders from returning customers. Her question is practical. Which numbers should she look at every month, exactly how should each be calculated, and how will she know whether a month was good?' },

    { h: 'Metrics and KPIs' },
    { p: 'A <g>metric</g> is a quantity calculated from data by an exact rule: the number of orders in July, the average rating given in August, the share of visits made on the app. A business can calculate hundreds of metrics, and most of them are useful to someone at some time.' },
    { p: 'A <g>key performance indicator</g> (KPI) is a metric chosen because it tracks progress towards an objective the business cares about. It comes with three things a plain metric lacks: a target, a direction (whether higher or lower is better) and someone responsible for it. Every KPI is a metric; few metrics are KPIs. Ana’s four targets make four KPIs. Average time on site is a metric she may glance at, but it is not a KPI: it has no target, and there is no agreement on whether more time is good (an engaged customer) or bad (a customer who can’t find the checkout).' },
    { p: 'The distinction matters because attention is limited. A monthly review of forty numbers is a review of none; a review of four to eight KPIs, each tied to an objective, leads to decisions. The other metrics stay available for diagnosis when a KPI moves.' },

    { h: 'The anatomy of a KPI' },
    { p: 'The lesson on business questions showed that a measurable objective needs an <g>operational definition</g>: what exactly is counted. A KPI needs that and more. Write each one down with these parts:' },
    { define: [
      ['Name', 'Short and unambiguous: “web conversion rate”, not “conversion”.'],
      ['Formula', 'The exact numerator and denominator, and what each includes. Paid orders only? Test orders removed? Visits by staff excluded?'],
      ['Unit and period', 'Percent, dollars or a count; per week, per month or per quarter.'],
      ['Data source', 'Which system produces each count. Two systems rarely agree to the last order.'],
      ['Target and direction', 'The value to reach and whether higher or lower is better, or a band to stay within.'],
      ['Owner and review', 'Who is accountable for the number, who reviews it and how often.'],
    ] },
    { p: String.raw`Written down, these parts form a KPI dictionary, the measurement equivalent of the data dictionary that B02 builds for a dataset. Without one, two people asked for “July’s conversion” can honestly return different answers from the same shop. July’s 294 orders divided by its 9,800 visits give 3.00%; if those visits came from, say, 8,650 different people, dividing by people gives <m>294 \div 8{,}650 \approx 3.40\%</m>. Both are calculated correctly. They answer different questions.` },

    { h: 'Counts and rates' },
    { p: 'A <i>count</i> says how many: 294 orders in July. A <i>rate</i> divides one count by another so that groups or periods of different sizes can be compared: orders per 100 visits, or the share of orders that come from returning customers. Counts measure scale; rates measure efficiency or quality. A business needs both, because each can mislead on its own.' },
    { p: String.raw`In July Lantern’s website took 205 orders from 7,400 visits, and its app took 89 orders from 2,400 visits. By count the website is the stronger channel, with more than twice the app’s orders. By rate the order reverses: the app converted <m>89 \div 2{,}400 \approx 3.71\%</m> of its visits into orders and the website <m>205 \div 7{,}400 \approx 2.77\%</m>. Both statements are true. The count tells Ana where most of her orders come from; the rate tells her which channel turns a visit into a sale more reliably.` },
    { callout: 'key', title: 'Every rate has a numerator and a denominator', html: 'A rate can rise because its numerator rose or because its denominator fell. Report the counts beside every rate, so that a reader can see which happened.' },

    { h: 'Targets and direction' },
    { p: String.raw`A target turns a number into a judgement. Lantern’s July average order value (AOV) was $41.20 against a target of $45, a gap of <m>41.20 - 45 = -3.80</m> dollars, or 91.6% of the target. Revenue, $12,112.80 against $15,000, reached 80.8% of its target. Conversion, exactly 3.00%, met its target of 3.0%. For a KPI that is itself a percentage, state the gap in percentage points: a conversion rate of 2.7% against a target of 3.0% is 0.3 of a point short. The next lesson shows why “0.3%” would be the wrong way to say it.` },
    { p: 'Direction is usually obvious, since more revenue is better, but not always. For a refund rate or a delivery time, lower is better. For stock on hand, both too little and too much are bad, so the target is a band. Say the direction explicitly in the KPI dictionary, because dashboards often colour a change “good” or “bad” automatically, and a rule written for revenue will praise a rising refund rate.' },
    { p: String.raw`Targets should also be consistent with one another. Ana’s targets for the drivers of revenue don’t guarantee her revenue target. At a conversion rate of 3.0% and an AOV of $45, each visit is worth <m>0.03 \times 45 = 1.35</m> dollars on average, so $15,000 needs <m>15{,}000 \div 1.35 \approx 11{,}111</m> visits. In a month of 10,000 visits, meeting both rate targets still leaves revenue at $13,500. The first widget below lets you test other combinations.` },
  ],

  theory: [
    { h: 'Five KPIs for an online shop' },
    { p: 'Lantern’s case data hold the raw counts for five common online-shop KPIs. The table defines them, and the formula cards later in the lesson give them in symbols. Lantern’s shop platform reports average order value directly, so revenue is calculated as orders × AOV; in most systems AOV is itself calculated as revenue ÷ orders, and the two routes agree.' },
    { table: {
      caption: 'Five online-shop KPIs, with Lantern’s July figures (fictional)',
      head: ['KPI', 'Formula', 'Direction', 'Target', 'July'],
      align: ['l', 'l', 'l', 'r', 'r'],
      rows: [
        ['Conversion rate', 'Orders ÷ visits × 100', 'Higher', '3.0%', '3.00%'],
        ['Average order value', 'Revenue ÷ orders', 'Higher', '$45', '$41.20'],
        ['Revenue', 'Orders × AOV', 'Higher', '$15,000', '$12,112.80'],
        ['Returning-customer share', '(Orders − first orders) ÷ orders × 100', 'Higher', '35%', '38.1%'],
        ['Rating response rate', 'Orders rated ÷ orders × 100', 'Higher', 'None set', '40.1%'],
      ],
      note: 'July 2026: 9,800 visits, 294 orders, AOV $41.20, 182 first orders (orders that were a customer’s first ever), 118 orders rated.',
    } },
    { p: 'The arithmetic is simple; the judgement lies in the definitions. Conversion divides by visits, which Lantern’s analytics tool counts as sessions. Google Analytics, for example, defines a session as a period during which a user interacts with a website or app, ending by default after 30 minutes of inactivity, so one person who browses in the morning and again in the evening makes two sessions. Dividing by sessions gives orders per visit; dividing by distinct visitors gives a higher figure, because each person can visit several times. Neither is wrong. Switching between them from one month to the next is.' },
    { p: String.raw`Returning-customer share needs an operational definition too. Lantern’s shop records how many of a month’s orders were a customer’s first ever order: 182 in July. Every other order counts as returning, so July’s share is <m>(294 - 182) \div 294 \approx 38.1\%</m>. This is a share of <i>orders</i>, not of <i>customers</i>: a loyal customer who ordered three times counts three times. A share of customers would need a different count, the number of distinct customers who ordered, and would usually be lower.` },
    { p: 'Names differ between tools, so check the definitions before comparing figures from two systems. Google Analytics now calls an action that matters to the business, such as a purchase, a “key event”, and keeps the word “conversion” for actions used to measure advertising campaigns. An advertising platform’s conversion rate may divide by ad clicks rather than visits; the M02 course uses that version.' },

    { h: 'Ratio KPIs and their denominators' },
    { p: 'Most KPIs are ratios, and most surprises in ratios come from the denominator. Three checks catch nearly all of them.' },
    { ol: [
      '<b>The numerator must come from the denominator.</b> Web conversion is web orders ÷ web visits. Dividing all orders by web visits, because app visits are recorded in another system, mixes two populations and overstates the rate.',
      '<b>The periods must match.</b> A rating can arrive weeks after the order. Lantern counts an order as rated in the month it was placed, so July’s response rate is July’s rated orders ÷ July’s orders, even if some ratings arrived in August.',
      '<b>Watch both parts move.</b> If a campaign doubles visits but brings people who rarely buy, orders rise and conversion falls. If Lantern stops the campaign, conversion rises while orders fall. The rate alone can’t tell good news from bad.',
    ] },
    { p: String.raw`Small denominators make rates jumpy. One extra order from a new product page with 20 visits moves that page’s conversion rate by <m>1 \div 20 = 5</m> percentage points; one extra order in a month of 9,800 visits moves the shop’s rate by about 0.01 of a point. Report a rate with its denominator, and be wary of ranking items whose denominators are small. The interpreting-results lesson returns to this.` },
    { p: 'When should you report a count and when a rate? Use counts when scale is the point: revenue pays the bills, and planning packing staff needs the number of parcels, not a share. Use rates when you compare units of different sizes, such as two channels, two months with different traffic, or this year against last. The safest habit is to pair them: orders with conversion, revenue with AOV, rated orders with the rating response rate.' },

    { h: 'Leading and lagging indicators' },
    { p: 'A <g>lagging indicator</g> measures an outcome after it has happened: revenue for the month, the returning share over a quarter, profit for the year. It is what the business ultimately cares about, but by the time it moves, the causes are in the past. A <g>leading indicator</g> moves earlier and, if the link holds, signals where a lagging indicator is heading: visits, checkouts started, newsletter sign-ups, the ratings that first-time buyers give.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><defs><marker id="kpi-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs><rect x="10" y="30" width="110" height="44" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2"/><text x="65" y="57" text-anchor="middle">Visits</text><rect x="170" y="30" width="130" height="44" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2"/><text x="235" y="50" text-anchor="middle">Checkouts</text><text x="235" y="66" text-anchor="middle">started</text><rect x="350" y="30" width="110" height="44" rx="6" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="405" y="57" text-anchor="middle">Orders</text><rect x="510" y="30" width="120" height="44" rx="6" fill="none" stroke="var(--series-2)" stroke-width="2"/><text x="570" y="57" text-anchor="middle">Revenue</text><rect x="350" y="112" width="110" height="44" rx="6" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="405" y="139" text-anchor="middle">Ratings</text><rect x="510" y="112" width="120" height="44" rx="6" fill="none" stroke="var(--series-2)" stroke-width="2"/><text x="570" y="132" text-anchor="middle">Repeat orders</text><text x="570" y="148" text-anchor="middle" font-size="11" fill="var(--ink-3)">returning share</text><line x1="120" y1="52" x2="168" y2="52" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><line x1="300" y1="52" x2="348" y2="52" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><line x1="460" y1="52" x2="508" y2="52" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><line x1="405" y1="74" x2="405" y2="110" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><line x1="460" y1="134" x2="508" y2="134" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><text x="324" y="22" text-anchor="middle" font-size="11" fill="var(--ink-3)">conversion</text><text x="485" y="22" text-anchor="middle" font-size="11" fill="var(--ink-3)">× AOV</text><line x1="20" y1="196" x2="620" y2="196" stroke="var(--rule-strong)" stroke-width="1.5" marker-end="url(#kpi-arrow)"/><text x="20" y="214" fill="var(--ink-3)">earlier: leading</text><text x="620" y="214" text-anchor="end" fill="var(--ink-3)">later: lagging</text></svg>',
      caption: 'A chain of indicators for an online shop. Each box leads the boxes to its right and lags the boxes to its left.',
      alt: 'A flow diagram. Along the top, arrows run from Visits to Checkouts started to Orders to Revenue; the arrow into Orders is labelled conversion and the arrow into Revenue is labelled times AOV. From Orders an arrow runs down to Ratings, and from Ratings an arrow runs right to Repeat orders, labelled returning share. An axis along the bottom runs from earlier, leading, on the left to later, lagging, on the right.',
    } },
    { p: 'Leading and lagging are positions in a chain, not fixed labels. Conversion leads revenue but lags the checkout experience that produces it; a first order leads the returning share months later. A leading indicator earns its place only if it actually predicts the outcome. That is a claim to test with data, which B05 and B06 teach you to do, not something to assume because the story sounds right.' },

    { h: 'Goodhart’s law' },
    { p: 'Writing about monetary policy in 1975, the economist Charles Goodhart observed that “any observed statistical regularity will tend to collapse once pressure is placed upon it for control purposes”. The idea, now called <g>Goodhart’s law</g>, is usually paraphrased as: when a measure becomes a target, it ceases to be a good measure. People respond to what is rewarded, and a single number can usually be moved in ways that don’t serve the objective behind it.' },
    { p: 'Every one of Ana’s KPIs can be gamed. Conversion rises if Lantern stops paying for traffic that rarely buys, even as orders fall. AOV rises if free delivery starts only at $60, even if small orders disappear. The rating response rate rises if customers are offered a discount for rating, which also changes who rates and how. None of these is fraud; each is a rational response to a narrow target. The defences are structural:' },
    { list: [
      '<b>Pair measures that pull in opposite directions:</b> conversion with orders, AOV with orders, speed with quality. Gaming one shows up in the other.',
      '<b>Add guardrails.</b> A <g>guardrail metric</g> is a measure that must not get worse while a KPI is pushed: the average rating while AOV is raised, the refund rate while conversion is raised.',
      '<b>Fix the definitions and audit them.</b> A KPI whose formula can be changed quietly eventually will be.',
      '<b>Read the counts behind every rate,</b> and review the set when a KPI stops tracking its objective.',
    ] },

    { h: 'Balanced sets' },
    { p: 'Robert Kaplan and David Norton argued in 1992 that financial measures alone give an incomplete, backward-looking picture of a business, and that what you measure is what you get. Their <g>balanced scorecard</g> adds measures from three other perspectives to the financial one: how customers see the business, the internal processes it must excel at, and its ability to innovate and learn.' },
    { p: 'Lantern’s set is a small business’s version. Revenue and AOV are financial; the returning share is a customer measure; conversion measures a process, the shop’s ability to turn a visit into a sale. What the set lacks is a direct measure of quality: nothing in it would fall straight away if the coffee arrived stale. The average rating, reported with the rating response rate so that readers know how many customers it represents, would fill that gap as a guardrail.' },

    { h: 'Dashboards, in outline' },
    { p: 'A <g>dashboard</g> is the everyday tool of <g>descriptive analytics</g>: it displays a small set of KPIs on one screen or page, so that the people who own them can see at a glance where things stand. A good one shows, for each KPI, the current value, the target, the comparison that matters (last month, or the same month last year) and a short trend, and it links to the counts and definitions behind each number. It doesn’t rely on colour alone: some readers can’t tell red from green, so mark a value below target with a word or a symbol as well. B03 builds dashboards in a spreadsheet; the point here is what belongs on one, not how to draw it.' },
  ],

  formulas: [
    { id: 'kpi-conversion', name: 'Conversion rate',
      tex: String.raw`\text{CR} = \dfrac{O}{V} \times 100`,
      where: [
        [String.raw`\text{CR}`, 'Conversion rate: orders per 100 visits', '%'],
        [String.raw`O`, 'Orders placed in the period, as the KPI dictionary defines an order', 'orders'],
        [String.raw`V`, 'Visits (sessions) in the same period and channel', 'visits'],
      ],
      assumptions: 'O and V cover the same period and the same channel.',
      note: 'Dividing by visitors (people) instead of visits gives a different, higher rate. State which you use and keep to it.' },
    { id: 'kpi-aov', name: 'Average order value',
      tex: String.raw`\text{AOV} = \dfrac{R}{O}`,
      where: [
        [String.raw`\text{AOV}`, 'Average order value', '$ per order'],
        [String.raw`R`, 'Revenue from the orders in the period', '$'],
        [String.raw`O`, 'Orders in the period', 'orders'],
      ],
      note: 'A mean: a few large orders, such as gift boxes, pull it up.' },
    { id: 'kpi-revenue', name: 'Revenue from its drivers',
      tex: String.raw`R = O \times \text{AOV} = V \times \dfrac{\text{CR}}{100} \times \text{AOV}`,
      where: [
        [String.raw`R`, 'Revenue', '$'],
        [String.raw`O`, 'Orders', 'orders'],
        [String.raw`V`, 'Visits', 'visits'],
        [String.raw`\text{CR}`, 'Conversion rate', '%'],
        [String.raw`\text{AOV}`, 'Average order value', '$ per order'],
      ],
      note: 'The driver tree in formula form. CR ÷ 100 × AOV is the average revenue per visit.' },
    { id: 'kpi-returning', name: 'Returning-customer share of orders',
      tex: String.raw`\text{RS} = \dfrac{O - N}{O} \times 100`,
      where: [
        [String.raw`\text{RS}`, 'Share of the period’s orders placed by returning customers', '%'],
        [String.raw`O`, 'Orders in the period', 'orders'],
        [String.raw`N`, 'Orders that were a customer’s first ever order', 'orders'],
      ],
      assumptions: 'Every order that is not a first order counts as returning.',
      note: 'A share of orders, not of customers.' },
    { id: 'kpi-response', name: 'Rating response rate',
      tex: String.raw`\text{RR} = \dfrac{O_r}{O} \times 100`,
      where: [
        [String.raw`\text{RR}`, 'Rating response rate', '%'],
        [String.raw`O_r`, 'Orders placed in the period that were rated', 'orders'],
        [String.raw`O`, 'Orders placed in the period', 'orders'],
      ],
      note: 'Report it beside the average rating: it says how many customers the average speaks for.' },
    { id: 'kpi-gap', name: 'Gap to target',
      tex: String.raw`\text{Gap} = A - T, \qquad \text{Share of target} = \dfrac{A}{T} \times 100`,
      where: [
        [String.raw`A`, 'Actual value of the KPI', 'units of the KPI'],
        [String.raw`T`, 'Target value', 'units of the KPI'],
      ],
      note: 'When the KPI is a percentage, the gap A − T is in percentage points.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s July scorecard', fictional: true,
      setup: 'In July 2026 Lantern’s shop had 9,800 visits and 294 orders, an AOV of $41.20, 182 first orders and 118 rated orders. Ana’s targets are a conversion rate of 3.0%, an AOV of $45, revenue of $15,000 and a returning share of 35%. Calculate the five KPIs and judge each against its target.',
      steps: [
        String.raw`Conversion rate: <m>294 \div 9{,}800 \times 100 = 3.00\%</m>. The target is 3.0%, so the gap is 0 percentage points: on target.`,
        String.raw`AOV: $41.20, as reported. Gap <m>41.20 - 45 = -3.80</m> dollars; share of target <m>41.20 \div 45 \times 100 \approx 91.6\%</m>.`,
        String.raw`Revenue: <m>294 \times 41.20 = 12{,}112.80</m> dollars. Gap <m>12{,}112.80 - 15{,}000 = -2{,}887.20</m> dollars, or <m>80.8\%</m> of target.`,
        String.raw`Returning share: <m>(294 - 182) \div 294 \times 100 \approx 38.1\%</m>, which is 3.1 percentage points above the 35% target.`,
        String.raw`Rating response rate: <m>118 \div 294 \times 100 \approx 40.1\%</m>. There is no target; the figure tells Ana that July’s average rating speaks for about two orders in five.`,
      ],
      answer: 'Conversion 3.00% (on target); AOV $41.20 (91.6% of target); revenue $12,112.80 (80.8% of target); returning share 38.1% (3.1 points above target); rating response rate 40.1% (no target).',
      interpretation: String.raw`July met its conversion and returning-customer targets but missed revenue by almost a fifth. The driver tree says why: each visit was worth <m>0.03 \times 41.20 \approx 1.24</m> dollars, so $15,000 would have needed about 12,136 visits at July’s conversion and AOV. Revenue was short because of order value and traffic, not because visitors failed to buy. The project asks you to build this scorecard for all six months.` },
    { level: 'challenging', title: 'One shop, four conversion rates', fictional: true,
      setup: 'Marlow & Finch, a fictional online stationery shop, recorded in March: 48,000 sessions from 30,000 distinct visitors; 3,600 sessions that started the checkout; 1,500 orders placed, of which 60 were cancelled the same day. Calculate conversion four ways: orders placed per session, paid orders per session, paid orders per visitor, and paid orders per checkout started. In April a paid campaign added 12,000 sessions and paid orders rose to 1,560 from 60,000 sessions in all. Which definition should the shop’s dashboard use, and what happened in April?',
      steps: [
        String.raw`Orders placed per session: <m>1{,}500 \div 48{,}000 \times 100 = 3.125\%</m>. Paid orders are <m>1{,}500 - 60 = 1{,}440</m>, so paid orders per session are <m>1{,}440 \div 48{,}000 \times 100 = 3.00\%</m>.`,
        String.raw`Paid orders per visitor: <m>1{,}440 \div 30{,}000 \times 100 = 4.80\%</m>. Higher, because each visitor averaged <m>48{,}000 \div 30{,}000 = 1.6</m> sessions.`,
        String.raw`Paid orders per checkout started (checkout conversion): <m>1{,}440 \div 3{,}600 \times 100 = 40.0\%</m>. This measures the checkout alone, not the whole shop.`,
        'Choose. All four are correct; they answer different questions. For the shop as a whole, paid orders per session is the usual choice: sessions are what the analytics tool counts reliably, and paid orders are what earns money. Checkout conversion belongs on the dashboard as a diagnostic, because it isolates the checkout.',
        String.raw`April on the chosen definition: <m>1{,}560 \div 60{,}000 \times 100 = 2.60\%</m>, down 0.4 of a percentage point, while paid orders rose by <m>1{,}560 - 1{,}440 = 120</m>. The campaign’s 12,000 sessions brought about 120 extra orders, a conversion of roughly <m>120 \div 12{,}000 \times 100 = 1.0\%</m>, if the shop’s other traffic converted as it did in March.`,
      ],
      answer: 'March conversion: 3.125% (orders placed per session), 3.00% (paid orders per session), 4.80% (per visitor) and 40.0% (per checkout started). Use paid orders per session, with checkout conversion as a diagnostic. In April conversion fell to 2.60% while paid orders rose by 120: the campaign added low-converting traffic.',
      interpretation: 'A falling rate is not automatically bad news. April’s lower conversion came with more orders, because the denominator grew faster than the numerator. Whether the campaign paid for itself depends on its cost and the margin on 120 orders, a question for M02. A dashboard showing conversion without orders would have reported April as a bad month.' },
    { level: 'applied', title: 'Should the shop team be paid on conversion?', fictional: true,
      setup: 'Ana is considering a bonus for her shop team if monthly conversion reaches 3.5%. In a typical month (hypothetical figures) the shop has 11,000 visits: 3,000 come from a paid social-media campaign and convert at 1.5%, and the other 8,000 convert at 3.6%. AOV is $45 for both. What would happen to conversion, orders and revenue if the team stopped the campaign, and should Ana adopt the bonus?',
      steps: [
        String.raw`Orders now: <m>3{,}000 \times 0.015 + 8{,}000 \times 0.036 = 45 + 288 = 333</m>. Conversion <m>333 \div 11{,}000 \times 100 \approx 3.03\%</m>; revenue <m>333 \times 45 = 14{,}985</m> dollars.`,
        String.raw`Without the campaign: 288 orders from 8,000 visits, a conversion of <m>288 \div 8{,}000 \times 100 = 3.60\%</m>, above the bonus threshold. Revenue <m>288 \times 45 = 12{,}960</m> dollars.`,
        String.raw`The trade: conversion rises by about 0.57 of a percentage point and the bonus is paid, while revenue falls by <m>14{,}985 - 12{,}960 = 2{,}025</m> dollars a month. Nobody sold more coffee; the denominator shrank.`,
        'Apply Goodhart’s law. A bonus on conversion alone rewards the team for removing low-converting traffic whether or not that traffic is profitable. Whether the campaign is worth its cost is a real question, but it should be answered with its cost and margin, not settled by a bonus.',
        'Redesign the measure. Make revenue (or orders) the headline KPI, keep conversion by channel as a diagnostic, and add the average rating as a guardrail so that the team can’t raise revenue by, say, aggressive discounting that annoys customers.',
      ],
      answer: 'Stopping the campaign would lift conversion from about 3.03% to 3.60% and trigger the bonus, while orders fell from 333 to 288 and revenue from $14,985 to $12,960. Ana should not pay on conversion alone; a balanced set led by revenue, with conversion as a diagnostic and the rating as a guardrail, rewards what she wants.',
      interpretation: 'The example is Goodhart’s law in miniature: the measure was a good indicator of shop performance until it became the target. Balanced sets work because the cheap ways to move one measure show up as damage in another.' },
  ],

  demo: [
    { widget: 'kpi-driver', intro: 'Revenue is visits × conversion × AOV. Start at Ana’s targets (3.0% and $45) with 10,000 visits and see that revenue falls short of $15,000. Then find three different ways to reach it: more visits, a higher conversion rate or a higher AOV.' },
    { widget: 'kpi-campaign', intro: 'Add or remove campaign traffic that converts poorly. Watch the overall conversion rate rise as orders fall, and decide which number you would rather be paid on.' },
  ],

  mistakes: [
    { title: '“Every useful number is a KPI.”', html: 'A KPI is a metric with a target, a direction and an owner, tied to an objective. Promote every metric and the review becomes a list nobody acts on. Keep four to eight KPIs and leave the rest for diagnosis.' },
    { title: '“Conversion rose, so the shop did better.”', html: 'A rate can rise because its numerator rose or because its denominator fell. In the applied example conversion rose from 3.03% to 3.60% while revenue fell by $2,025. Read every rate with its counts.' },
    { title: '“Close enough: it’s the same KPI.”', html: 'Orders per session and orders per visitor, or orders placed and orders paid, give different numbers. Changing the definition partway through a series creates a jump that is not real. Write the formula down and keep it, or restate the history when you change it.' },
    { title: '“Conversion is up 0.6%.”', html: 'For a KPI that is a percentage, the difference between two values is in percentage points. From 3.0% to 3.6% is 0.6 percentage points, which is a 20% relative rise. The next lesson treats this in full.' },
    { title: '“Pay people on the number and it will improve.”', html: 'It will, but perhaps not in the way you want. Goodhart’s law: a single target invites changes that move the number without serving the objective. Use balanced pairs and guardrails.' },
    { title: '“It must be a leading indicator; it happens first.”', html: 'Coming first in a process is not the same as predicting the outcome. Check, with past data, that movements in the candidate measure really are followed by movements in the result before you steer by it.' },
  ],

  application: [
    { p: 'Designing KPIs is a recurring decision in every part of a business, and the same mistakes recur. Three fictional cases show the pattern.' },
    { p: '<b>A contact centre.</b> An insurer measured its call-centre agents on average handling time, with a target of five minutes a call. Handling time fell and complaints rose: agents were ending difficult calls and asking customers to ring back. The insurer kept the measure but paired it with first-contact resolution, the share of problems solved in a single call, and reported the two side by side. Handling time crept up; repeat calls, and with them total cost, fell.' },
    { p: '<b>A regional airline.</b> A carrier rewarded station managers for on-time departures. Some stations met the target by closing aircraft doors early and leaving late-connecting passengers behind. The fix was a balanced set: on-time departures alongside misconnected passengers per thousand and complaints, each with a named owner.' },
    { p: '<b>A battery-storage installer.</b> The sales team tracked signed contracts per month, a lagging count. A new head of sales added two leading indicators, site surveys completed and quotes issued, after checking that over the previous two years they had moved a month or two ahead of signed contracts. When surveys fell in a quiet month, she moved staff to finding new leads before contracts fell.' },
    { case: 'Before her first monthly review, Ana turns her four targets into a KPI dictionary. Writing it forces three decisions she had not made: visits are sessions as the analytics tool counts them, excluding staff and test sessions; an order is a paid order, net of cancellations made the same day; and the returning share is a share of orders, not of customers. She adds the average rating as a guardrail, reported with the rating response rate, and gives each KPI an owner.' },
    { table: {
      caption: 'Lantern’s KPI dictionary, extract (fictional)',
      head: ['KPI', 'Formula', 'Source', 'Target and direction', 'Owner'],
      rows: [
        ['Conversion rate', 'Paid orders ÷ sessions × 100, by channel and in total', 'Shop platform; analytics tool', '3.0%; higher is better', 'Shop manager'],
        ['Average order value', 'Revenue ÷ paid orders', 'Shop platform', '$45; higher is better', 'Ana'],
        ['Revenue', 'Paid orders × AOV', 'Shop platform', '$15,000 a month; higher is better', 'Ana'],
        ['Returning-customer share', '(Paid orders − first orders) ÷ paid orders × 100', 'Shop platform', '35%; higher is better', 'Marketing'],
        ['Average rating (guardrail)', 'Mean stars on orders placed in the month, shown with the response rate', 'Shop platform', 'At least 4.3; investigate any month below', 'Operations'],
      ],
    } },
    { p: 'The dictionary won’t stop the numbers moving, but when conversion falls, as it does in September, everyone will be arguing about the same number. The next two lessons show how to summarise such movements and how to interpret them without being misled.' },
  ],

  summary: [
    'A metric is any quantity calculated by an exact rule; a KPI is a metric tied to an objective, with a target, a direction and an owner.',
    'Write each KPI down in a KPI dictionary: name, formula (numerator and denominator), unit, period, source, target, direction and owner.',
    'Core online-shop KPIs: conversion = orders ÷ visits × 100; AOV = revenue ÷ orders; revenue = visits × conversion × AOV; returning share = (orders − first orders) ÷ orders × 100; rating response rate = rated orders ÷ orders × 100.',
    'Counts measure scale and rates measure efficiency. A rate moves when either part moves, so report the counts beside it and keep the numerator and denominator from the same population and period.',
    'Judge a KPI against its target as a gap and as a share of target; for percentage KPIs the gap is in percentage points.',
    'Leading indicators move before the lagging outcomes they predict, but the link must be checked with data.',
    'Goodhart’s law: a measure that becomes a target can be moved without serving its purpose. Defend with balanced pairs, guardrail metrics and fixed, audited definitions.',
  ],

  glossary: [
    { term: 'Metric', def: 'A quantity calculated from data by an exact rule, such as the number of orders in a month or the average rating.' },
    { term: 'Key performance indicator', def: 'A metric chosen to track progress towards a business objective, with an exact formula, a target, a direction (higher or lower is better) and an owner. Abbreviated KPI.' },
    { term: 'Conversion rate', def: 'The share of clicks (or visits) that end in the action a campaign seeks, such as an order or sign-up.' },
    { term: 'Average order value', def: 'Revenue divided by the number of orders in a period: the mean value of an order. Abbreviated AOV.' },
    { term: 'Lagging indicator', def: 'A measure of an outcome after it has happened, such as revenue for a month or profit for a year.' },
    { term: 'Leading indicator', def: 'A measure that moves before an outcome and, if the link holds, signals where that outcome is heading, such as visits or checkouts started before orders and revenue.' },
    { term: 'Goodhart’s law', def: 'The observation that a measure tends to stop tracking what it was meant to track once people are rewarded for moving it; often put as “when a measure becomes a target, it ceases to be a good measure”.' },
    { term: 'Guardrail metric', def: 'A measure that must not get worse while a KPI is being improved, used to catch gains that come at a hidden cost.' },
    { term: 'Balanced scorecard', def: 'A set of measures proposed by Kaplan and Norton (1992) that adds customer, internal-process and innovation-and-learning perspectives to financial measures.' },
    { term: 'Dashboard', def: 'A single screen or page showing a small set of KPIs, each with its current value, target, comparison and trend, for the people who act on them.' },
  ],

  references: [
    { text: 'Google. “About Analytics sessions”. Analytics Help.', url: 'https://support.google.com/analytics/answer/9191807', checked: '2026-10-23' },
    { text: 'Google. “Conversions vs. key events in Google Analytics”. Analytics Help.', url: 'https://support.google.com/analytics/answer/13965727', checked: '2026-10-23' },
    { text: 'Kaplan, R. S. &amp; Norton, D. P. (1992). The Balanced Scorecard: Measures that Drive Performance. <i>Harvard Business Review</i>, January–February 1992.', url: 'https://hbr.org/1992/01/the-balanced-scorecard-measures-that-drive-performance-2', checked: '2026-10-23' },
    { text: 'Manheim, D. &amp; Garrabrant, S. (2018). Categorizing Variants of Goodhart’s Law. arXiv:1803.04585. (Quotes Goodhart, C. A. E. (1975), <i>Problems of Monetary Management: The U.K. Experience</i>, Papers in Monetary Economics, Reserve Bank of Australia.)', url: 'https://arxiv.org/abs/1803.04585', checked: '2026-10-23' },
  ],

  checks: [
    // case facts
    { what: 'Target conversion (case, %)', value: T.conversion, shown: 3.0 },
    { what: 'Target AOV (case)', value: T.aov, shown: 45 },
    { what: 'Target monthly revenue (case)', value: T.monthlyRevenue, shown: 15000 },
    { what: 'Target returning share (case, %)', value: T.returningShare, shown: 35 },
    { what: 'July visits (case)', value: julVisits, shown: 9800 },
    { what: 'July orders (case)', value: julOrders, shown: 294 },
    { what: 'July web orders (case)', value: S.webOrders[J], shown: 205 },
    { what: 'July web visits (case)', value: S.webVisits[J], shown: 7400 },
    { what: 'July app orders (case)', value: S.appOrders[J], shown: 89 },
    { what: 'July app visits (case)', value: S.appVisits[J], shown: 2400 },
    { what: 'July AOV (case)', value: S.aov[J], shown: 41.2 },
    { what: 'July first orders (case)', value: S.newCustomers[J], shown: 182 },
    { what: 'July rated orders (case)', value: S.ratingsGiven[J], shown: 118 },
    // concept
    { what: 'July conversion per visit (%)', value: julOrders / julVisits * 100, shown: 3.00 },
    { what: 'July conversion per visitor, 8,650 visitors (%)', value: julOrders / 8650 * 100, shown: 3.40 },
    { what: 'App July conversion (%)', value: S.appOrders[J] / S.appVisits[J] * 100, shown: 3.71 },
    { what: 'Web July conversion (%)', value: S.webOrders[J] / S.webVisits[J] * 100, shown: 2.77 },
    { what: 'Web has more than twice the app orders', value: S.webOrders[J] / S.appOrders[J], shown: 2.3, tol: 0.05 },
    { what: 'July AOV gap', value: S.aov[J] - T.aov, shown: -3.80 },
    { what: 'July AOV share of target (%)', value: S.aov[J] / T.aov * 100, shown: 91.6, tol: 0.05 },
    { what: 'July revenue', value: julRevenue, shown: 12112.80 },
    { what: 'July revenue (DERIVED)', value: D.revenue[J], shown: 12112.80 },
    { what: 'July revenue share of target (%)', value: julRevenue / T.monthlyRevenue * 100, shown: 80.8, tol: 0.05 },
    { what: 'Percentage-point gap 2.7% vs 3.0%', value: 3.0 - 2.7, shown: 0.3 },
    { what: 'Revenue per visit at targets', value: (T.conversion / 100) * T.aov, shown: 1.35 },
    { what: 'Visits needed at targets', value: T.monthlyRevenue / ((T.conversion / 100) * T.aov), shown: 11111, tol: 0.5 },
    { what: 'Revenue at targets with 10,000 visits', value: 10000 * (T.conversion / 100) * T.aov, shown: 13500 },
    // theory
    { what: 'Table: July returning share (%)', value: (julOrders - S.newCustomers[J]) / julOrders * 100, shown: 38.1, tol: 0.05 },
    { what: 'Table: July returning share (DERIVED, %)', value: D.returningShare[J], shown: 38.1, tol: 0.05 },
    { what: 'Table: July rating response rate (%)', value: S.ratingsGiven[J] / julOrders * 100, shown: 40.1, tol: 0.05 },
    { what: 'Table: July rating response rate (DERIVED, %)', value: D.ratingShare[J], shown: 40.1, tol: 0.05 },
    { what: 'Session timeout (minutes, Google Analytics default)', value: 30, shown: 30 },
    { what: 'One order in 20 visits (points)', value: 1 / 20 * 100, shown: 5 },
    { what: 'One order in 9,800 visits (points)', value: 1 / julVisits * 100, shown: 0.01, tol: 0.0005 },
    // examples: simple
    { what: 'Simple: returning share above target (points)', value: (julOrders - S.newCustomers[J]) / julOrders * 100 - T.returningShare, shown: 3.1, tol: 0.05 },
    { what: 'Simple: revenue gap', value: julRevenue - T.monthlyRevenue, shown: -2887.20 },
    { what: 'Simple: revenue per visit in July', value: (julOrders / julVisits) * S.aov[J], shown: 1.24, tol: 0.005 },
    { what: 'Simple: visits needed at July conversion and AOV', value: T.monthlyRevenue / ((julOrders / julVisits) * S.aov[J]), shown: 12136, tol: 0.5 },
    { what: 'Simple: about two in five rated', value: S.ratingsGiven[J] / julOrders, shown: 0.4, tol: 0.005 },
    { what: 'Simple: missed revenue by almost a fifth', value: 1 - julRevenue / T.monthlyRevenue, shown: 0.19, tol: 0.005 },
    // examples: challenging
    { what: 'Marlow: orders placed per session (%)', value: 1500 / 48000 * 100, shown: 3.125 },
    { what: 'Marlow: paid orders', value: 1500 - 60, shown: 1440 },
    { what: 'Marlow: paid per session (%)', value: 1440 / 48000 * 100, shown: 3.00 },
    { what: 'Marlow: paid per visitor (%)', value: 1440 / 30000 * 100, shown: 4.80 },
    { what: 'Marlow: sessions per visitor', value: 48000 / 30000, shown: 1.6 },
    { what: 'Marlow: checkout conversion (%)', value: 1440 / 3600 * 100, shown: 40.0 },
    { what: 'Marlow: April sessions', value: 48000 + 12000, shown: 60000 },
    { what: 'Marlow: April conversion (%)', value: 1560 / 60000 * 100, shown: 2.60 },
    { what: 'Marlow: fall in points', value: 1440 / 48000 * 100 - 1560 / 60000 * 100, shown: 0.4 },
    { what: 'Marlow: extra orders', value: 1560 - 1440, shown: 120 },
    { what: 'Marlow: campaign conversion (%)', value: 120 / 12000 * 100, shown: 1.0 },
    // examples: applied
    { what: 'Bonus: campaign orders', value: 3000 * 0.015, shown: 45 },
    { what: 'Bonus: other orders', value: 8000 * 0.036, shown: 288 },
    { what: 'Bonus: total orders', value: 3000 * 0.015 + 8000 * 0.036, shown: 333 },
    { what: 'Bonus: visits', value: 3000 + 8000, shown: 11000 },
    { what: 'Bonus: conversion now (%)', value: 333 / 11000 * 100, shown: 3.03 },
    { what: 'Bonus: revenue now', value: 333 * 45, shown: 14985 },
    { what: 'Bonus: conversion without campaign (%)', value: 288 / 8000 * 100, shown: 3.60 },
    { what: 'Bonus: revenue without campaign', value: 288 * 45, shown: 12960 },
    { what: 'Bonus: conversion rise (points)', value: 288 / 8000 * 100 - 333 / 11000 * 100, shown: 0.57, tol: 0.005 },
    { what: 'Bonus: revenue lost', value: 333 * 45 - 288 * 45, shown: 2025 },
    // mistakes
    { what: '3.0% to 3.6%: points', value: 3.6 - 3.0, shown: 0.6 },
    { what: '3.0% to 3.6%: relative rise (%)', value: (3.6 - 3.0) / 3.0 * 100, shown: 20 },
    // application (fictional targets stated in the dictionary)
    { what: 'Rating guardrail (fictional)', value: 4.3, shown: 4.3 },
  ],
};
