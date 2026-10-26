// problem-solving-frameworks.js — B01 · Problem-solving frameworks. Content only; exercises are in problem-solving-frameworks.ex.js.
import { SHOP } from './case.js?v=19';

const box = (x, y, w, h, lines, { dash = false, series = 0, size = 13 } = {}) => {
  const stroke = series ? `var(--series-${series})` : 'var(--rule-strong)';
  const mid = y + h / 2, n = lines.length, lh = size + 3;
  const text = lines.map((t, i) => `<text x="${x + w / 2}" y="${(mid - ((n - 1) * lh) / 2 + i * lh + size / 3).toFixed(1)}" text-anchor="middle" font-size="${size}" fill="currentColor">${t}</text>`).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" style="fill:none;stroke:${stroke};stroke-width:${dash ? 1.5 : 2}${dash ? ';stroke-dasharray:5 3' : ''}"/>${text}`;
};
const wire = (d) => `<path d="${d}" style="fill:none;stroke:currentColor;stroke-width:1.3"/>`;

const ISSUE_TREE = '<svg viewBox="0 0 640 384" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + box(4, 158, 118, 68, ['<tspan font-weight="700">Why did</tspan>', '<tspan font-weight="700">September’s</tspan>', '<tspan font-weight="700">orders fall?</tspan>'], { series: 1, size: 13 })
  + box(138, 69, 122, 52, ['Fewer orders', 'really placed'], { series: 2 })
  + box(138, 264, 122, 52, ['The counting', 'changed'], { series: 2 })
  + box(276, 22, 120, 36, ['Fewer visits'], { series: 3 })
  + box(276, 132, 120, 36, ['Lower conversion'], { series: 3, size: 12 })
  + box(276, 240, 120, 44, ['Orders missing', 'from the report'], { series: 3 })
  + box(276, 296, 120, 44, ['Visits counted', 'differently'], { series: 3 })
  + box(412, 25, 224, 30, ['by source'], { dash: true })
  + box(412, 91, 224, 30, ['Website rate'], { dash: true })
  + box(412, 131, 224, 30, ['App rate'], { dash: true })
  + box(412, 172, 224, 44, ['Mix: more visits on the', 'lower-converting channel'], { dash: true, size: 12 })
  + '<text x="414" y="314" font-size="12" font-style="italic" fill="currentColor">changes measured conversion,</text><text x="414" y="331" font-size="12" font-style="italic" fill="currentColor">not the number of orders</text>'
  + wire('M122 192H130V95H138') + wire('M130 192V290H138')
  + wire('M260 95H268V40H276') + wire('M268 95V150H276')
  + wire('M260 290H268V262H276') + wire('M268 290V318H276')
  + wire('M396 40H412') + wire('M396 150H404V106H412') + wire('M404 150V146H412') + wire('M404 150V194H412')
  + '<path d="M396 318H408" style="fill:none;stroke:currentColor;stroke-width:1.3;stroke-dasharray:3 3"/>'
  + '<text x="320" y="372" text-anchor="middle" font-size="12" fill="currentColor">Each split leaves no gaps and no overlaps (MECE). Dashed boxes are where the next level begins.</text>'
  + '</svg>';

const DRIVER_TREE = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + box(8, 124, 110, 48, ['<tspan font-weight="700">Revenue</tspan>'], { series: 1, size: 14 })
  + box(150, 60, 110, 40, ['Orders'], { series: 2 })
  + box(150, 200, 110, 48, ['Average', 'order value'], { series: 2 })
  + box(292, 20, 110, 40, ['Web orders'], { series: 3 })
  + box(292, 100, 110, 40, ['App orders'], { series: 3 })
  + box(292, 196, 150, 56, ['What is bought:', 'products, pack sizes,', 'gift boxes'], { dash: true, size: 12 })
  + box(430, 6, 110, 30, ['Web visits'], { series: 1 })
  + box(430, 44, 110, 30, ['Web conversion'], { series: 1, size: 12 })
  + box(430, 88, 110, 30, ['App visits'], { series: 1 })
  + box(430, 126, 110, 30, ['App conversion'], { series: 1, size: 12 })
  + box(552, 6, 82, 30, ['by source'], { dash: true, size: 12 })
  + box(552, 44, 82, 30, ['by device'], { dash: true, size: 12 })
  + box(552, 88, 82, 30, ['by source'], { dash: true, size: 12 })
  + box(552, 126, 82, 30, ['by device'], { dash: true, size: 12 })
  + wire('M118 148H134V80H150') + wire('M134 148V224H150')
  + wire('M260 80H276V40H292') + wire('M276 80V120H292') + wire('M260 224H292')
  + wire('M402 40H416V21H430') + wire('M416 40V59H430') + wire('M402 120H416V103H430') + wire('M416 120V141H430')
  + wire('M540 21H552') + wire('M540 59H552') + wire('M540 103H552') + wire('M540 141H552')
  + '<text x="126" y="142" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">×</text>'
  + '<text x="268" y="74" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">+</text>'
  + '<text x="409" y="34" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">×</text>'
  + '<text x="409" y="114" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">×</text>'
  + '<text x="320" y="288" text-anchor="middle" font-size="12" fill="currentColor">Solid boxes are linked by arithmetic (× or +); dashed boxes are where you split further to find a cause.</text>'
  + '</svg>';

export default {
  slug: 'problem-solving-frameworks',
  title: 'Problem-solving frameworks',
  blurb: 'Structure turns a big, messy problem into small questions that data can answer. Learn issue trees and the MECE test, driver trees that break revenue into visits, conversion and order value, root-cause tools such as the five whys and their limits, the CRISP-DM process, and how to tell when you have enough evidence to stop.',
  status: 'reviewed',
  objectives: [
    'Construct an issue tree for a business problem and test whether each level is mutually exclusive and collectively exhaustive (MECE).',
    'Build a driver tree for revenue (visits × conversion rate × average order value) and calculate how much of a change each driver accounts for.',
    'Distinguish hypothesis-driven from exploratory analysis and choose between them for a given problem.',
    'Apply the five whys and a driver tree to look for a root cause, and explain the limits of each.',
    'Describe the six phases of CRISP-DM and relate them to the analytics process.',
    'Decide when to stop analysing, by weighing what more evidence could change against what it costs.',
  ],
  prerequisites: [
    { lesson: 'b01/business-questions', why: 'A framework structures the search for an answer to a question that has already been framed: a decision, a measure, hypotheses and a threshold.' },
    { lesson: 'b01/four-kinds-of-analytics', why: 'Most of this lesson is diagnostic analytics, and CRISP-DM is compared with the analytics process introduced there.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana has agreed the question brief for September: did the website’s paid orders per visit fall after 1 September, compared with the weeks before and with the app, by a relative tenth or more (3.0% to 2.7% would qualify: 0.3 of a percentage point)? Now you face the next problem: where to look. Orders fell from ${SHOP.webOrders[1] + SHOP.appOrders[1]} in August to ${SHOP.webOrders[2] + SHOP.appOrders[2]} in September, and the cause could lie almost anywhere: in the number of visitors, in the website or the app, in particular devices or pages, or in the way the shop counts. You could start pulling data at random. A framework lets you search the whole space once, in a sensible order, and know when you have finished.` },
    { p: 'A problem-solving framework is not a formula that produces the answer. It is a way of organising the search so that you neither miss a possible cause nor examine the same one twice, and so that the people you report to can follow your reasoning. This lesson covers the frameworks analysts use most: issue trees and the MECE test, driver trees, root-cause analysis, the CRISP-DM process, and a rule for stopping.' },

    { h: 'Issue trees' },
    { p: 'An <g>issue tree</g> breaks a problem into smaller questions, level by level, until each question is small enough to answer with a specific piece of evidence. The problem sits at the root, on the left; each branch splits its parent into parts; the leaves, on the right, are the questions you actually take to the data. The figure shows a first issue tree for Ana’s question.' },
    { figure: {
      svg: ISSUE_TREE,
      caption: 'An issue tree for Lantern’s September question. The first split separates a real fall in orders from a change in the counting; the next splits break each into its parts. A fall in the shop’s conversion can come from the website’s rate, the app’s rate, or a shift of visits towards the channel that converts less.',
      alt: 'A tree drawn from left to right. The root box reads “Why did September’s orders fall?”. It splits into two boxes: “Fewer orders really placed” and “The counting changed”. “Fewer orders really placed” splits into “Fewer visits”, which leads to a dashed box “by source”, and “Lower conversion”, which splits into three dashed boxes: “Website rate”, “App rate” and “Mix: more visits on the lower-converting channel”. “The counting changed” splits into “Orders missing from the report” and “Visits counted differently”, with a note that visits counted differently change measured conversion, not the number of orders. A note at the bottom says each split leaves no gaps and no overlaps (MECE) and that dashed boxes are where the next level begins.',
    } },
    { p: 'The tree does three jobs. It makes the hypotheses of the previous lesson complete: each branch is a family of explanations, and every explanation belongs somewhere. It turns a vague question into a list of specific ones (did visits fall? did the website’s conversion fall? do the shop’s order counts match the payment provider’s?), each of which names the data it needs. And it lets two people divide the work without overlap.' },

    { h: 'MECE: no overlaps, no gaps' },
    { p: 'A good tree splits each node into parts that are <g>MECE</g>: mutually exclusive (no possible cause belongs to two branches) and collectively exhaustive (every possible cause belongs to some branch). Barbara Minto, who worked at McKinsey &amp; Company from 1963 to 1973, says she was the first to abbreviate the idea as MECE and to apply it to analysing groups of ideas, while crediting the underlying logic to Aristotle.' },
    { p: 'Both halves of the test catch real mistakes. Overlapping branches waste effort and double-count: if one branch is “fewer visits” and another is “weaker weekend trade”, a quiet weekend appears in both, and two people investigate the same thing. Gaps hide causes: a tree whose only branches are “website” and “app” has no place for a fall in the counting, so nobody looks there. Splits that are MECE by construction are the safest: before and after a date, one channel and all the others, the factors of a product, or a list closed with “everything else”.' },
    { callout: 'key', title: 'Two questions at every split', html: 'Could anything belong to two of these branches? Could anything belong to none of them? If the answer to either is yes, redraw the split before collecting any data.' },

    { h: 'Hypothesis-driven or exploratory?' },
    { p: 'There are two broad ways to use data on a problem. In <g>hypothesis-driven analysis</g> you start from stated hypotheses, such as the branches of an issue tree, and fetch the evidence that would confirm or contradict each, most promising and cheapest first. It is fast and focused, and it is the right approach when there is a decision to make and a deadline, as with Ana’s brief. Its risk is tunnel vision: you find what you looked for and miss what you did not imagine.' },
    { p: 'In <g>exploratory data analysis</g> you look at the data first, with summaries and charts, to see what patterns they hold before committing to a model or hypothesis. The NIST/SEMATECH <i>e-Handbook of Statistical Methods</i> contrasts the two orders of work: the classical sequence runs problem, data, model, analysis, conclusions, while exploratory analysis runs problem, data, analysis, model, conclusions, letting the data suggest which model fits. Exploration is the right approach for a new dataset, or when nobody yet knows what to ask. Its risk is the fishing trip of the previous lesson: search enough and something will look interesting by chance.' },
    { p: 'In practice good analysts alternate. A quick exploratory look at a new dataset checks that it is what you think it is and suggests hypotheses; hypothesis-driven work tests them; anything surprising found along the way becomes a new hypothesis, to be tested on fresh data rather than believed on sight.' },
  ],

  theory: [
    { h: 'Driver trees' },
    { p: 'A <g>driver tree</g> is an issue tree whose branches are linked by arithmetic, so that the number at each node can be calculated from the numbers below it. The most useful one in online retail breaks revenue into three drivers:' },
    { math: String.raw`\text{Revenue} = \text{Visits} \times \underbrace{\frac{\text{Orders}}{\text{Visits}}}_{\text{conversion rate}} \times \underbrace{\frac{\text{Revenue}}{\text{Orders}}}_{\text{average order value}}` },
    { p: 'The equation is an identity: visits cancel visits, orders cancel orders, and revenue is left. So it is always true, whatever happens to the business, and every change in revenue must show up as a change in at least one of the three drivers. That is what makes a driver tree powerful for diagnosis. Each driver can be split again: orders into web orders plus app orders, each channel’s orders into its visits times its conversion rate, visits by source. The deeper levels show where to look, as the second figure shows for Lantern.' },
    { figure: {
      svg: DRIVER_TREE,
      caption: 'A driver tree for Lantern’s online revenue. Revenue is orders × average order value; orders are web orders + app orders; each channel’s orders are its visits × its conversion rate. Dashed boxes are splits without a formula, where you look for the cause.',
      alt: 'A tree drawn from left to right. “Revenue” splits, with a multiplication sign, into “Orders” and “Average order value”. “Orders” splits, with a plus sign, into “Web orders” and “App orders”. “Web orders” splits, with a multiplication sign, into “Web visits” and “Web conversion”; “App orders” splits the same way into “App visits” and “App conversion”. Dashed boxes to the right of each visits box read “by source”, and to the right of each conversion box “by device”. A dashed box beside “Average order value” reads “What is bought: products, pack sizes, gift boxes”. A note says solid boxes are linked by arithmetic and dashed boxes are where you split further to find a cause.',
    } },
    { p: String.raw`Because the drivers multiply, their percentage changes do not add. If visits rise by 10% and the conversion rate falls by 10%, revenue does not stay flat: <m>1.10 \times 0.90 = 0.99</m>, a fall of 1%. Write each driver’s change as a growth factor, one plus its growth rate, and the growth factor of revenue is the product of the three. For small changes the sum of the growth rates is a fair approximation; for large ones it can mislead badly.` },
    { p: 'To say how many dollars of a change each driver accounts for, change the drivers one at a time in a fixed order: first visits (holding the conversion rate and order value at their old levels), then the conversion rate (at the new visits), then the order value. Each step keeps the drivers already changed at their new values, so the three contributions always add up exactly to the change in revenue.' },
    { p: String.raw`A different order gives different contributions, sometimes very different, because part of the change comes from drivers moving together and is credited to whichever is changed later. For visits and conversion at Larkfield Home, in the challenging example below, this joint part is <m>(V_1 - V_0)(c_1 - c_0)A_0 = 6{,}000 \times (-0.004) \times 60 = -1{,}440</m> dollars, which is why visits contribute $7,200 when changed first and $5,760 when changed second. No order is the true one: state the one you used, check whether the ranking of the drivers depends on it, and if it does, report the range (some analysts average over all the orders).` },

    { h: 'Root-cause analysis' },
    { p: 'A driver tree tells you where a change happened; it does not tell you why. <g>Root-cause analysis</g> is the structured search for why: for the underlying causes of a problem rather than its symptoms, so that fixing them stops it recurring. A <g>root cause</g> is a cause which, if removed, would prevent the problem from happening again.' },
    { p: '“Web conversion fell” is a symptom. “A step in the checkout fails on some browsers” is closer to a cause. “Nobody tested the new checkout on those browsers before launch” is closer still, and it suggests a fix to the process, not just to the page.' },
    { p: 'The best-known technique is the <g>five whys</g>: state the problem, ask why it happened, then ask why of the answer, and keep going until you reach a cause that can be acted on. It is usually traced to the Toyota Production System, where Taiichi Ohno described asking “why?” five times as central to the approach. Here is an example from Lantern’s packing room (fictional):' },
    { ol: [
      'Why were 14 orders shipped a day late last Tuesday? Because the label printer ran out of labels at midday.',
      'Why did it run out? Because no spare roll was in stock.',
      'Why was there no spare? Because nobody reordered after the last delivery.',
      'Why not? Because reordering depends on someone noticing the shelf is empty.',
      'Why does it depend on that? Because packing supplies have no reorder level, unlike the coffee.',
    ] },
    { p: 'The fifth answer suggests a fix that will last (set a reorder level for labels) rather than one that will not (tell the team to be more careful). The number five is a rule of thumb, not a law: stop when the answer points to something the business can change, and check each answer against evidence rather than accepting the first plausible story.' },
    { p: 'The five whys has well-documented limits. Alan Card, reviewing its use in hospital safety investigations, argues that it forces a single causal path when most problems have several causes, that different teams asking the same whys reach different answers, and that the deepest cause it finds is not always the best place to intervene: a check close to the problem can prevent a repeat more reliably than a change far upstream. Use it for small, contained problems, and combine it with tools that show many causes at once. A driver tree is one; a fishbone diagram, which lists possible causes under headings such as people, process, equipment and materials, is another.' },

    { h: 'CRISP-DM' },
    { p: 'For larger projects, especially those that build a predictive model, analysts often follow <g>CRISP-DM</g>, the Cross-Industry Standard Process for Data Mining. It was developed by a consortium of companies (NCR, DaimlerChrysler, SPSS and OHRA, a Dutch insurance and banking group), and the step-by-step guide to version 1.0 was published in 2000. Data mining was the name then used for finding patterns and building models from large datasets. The guide divides a project into six phases:' },
    { table: {
      caption: 'The six phases of CRISP-DM 1.0 and where this curriculum covers them',
      head: ['Phase', 'What it does', 'In this curriculum'],
      rows: [
        ['Business understanding', 'Sets the business objectives, assesses the situation, turns the objectives into analysis goals with success criteria, and produces a project plan', 'The question brief (lesson 2 of this module)'],
        ['Data understanding', 'Collects the initial data, describes and explores it, and verifies its quality', 'Module 2; B02 profiling'],
        ['Data preparation', 'Selects, cleans, constructs, integrates and formats the data', 'B02 Data Cleaning and Preparation'],
        ['Modelling', 'Selects techniques, designs how they will be tested, builds and assesses models', 'B04–B09'],
        ['Evaluation', 'Evaluates the results against the business objectives, reviews the process and decides on next steps', 'The decision step'],
        ['Deployment', 'Plans deployment, monitoring and maintenance, produces a final report and reviews the project', 'The decision and measure steps'],
      ],
    } },
    { p: 'Two features of CRISP-DM matter as much as the phases. First, the guide states that the sequence is not rigid and that moving back and forth between phases is always required: data understanding regularly sends you back to rethink the business question, and evaluation may send you back to the start. Second, the process is drawn as a cycle, because a deployed result raises new business questions. Its first phase is the one most often rushed, and the guide’s emphasis on understanding what the client really wants to accomplish is the same point as the previous lesson’s: the question comes first.' },
    { p: 'CRISP-DM and the five-step process of the first lesson describe the same journey at different levels of detail. Business understanding is the question step; data understanding and preparation are the data step; modelling is the analysis step; evaluation and deployment cover the decision and the measurement that follows.' },

    { h: 'Knowing when to stop' },
    { p: 'Analysis has no natural end: there is always another split to make or another explanation to rule out. The right time to stop is set by the decision, not by curiosity. Five tests help:' },
    { list: [
      '<b>Would more evidence change the decision?</b> If every plausible result of the next piece of analysis leads to the same action, stop.',
      '<b>Does the explanation account for the size of the change?</b> A driver tree lets you check: if the branch you have explained accounts for most of the change, the rest is a smaller question.',
      '<b>Is the decision cheap to reverse?</b> If so, act and measure: a test in the real world is often faster and more convincing than more analysis. If it is costly or permanent, more evidence is worth more.',
      '<b>What does delay cost?</b> Every week of analysis is a week in which the problem continues. Compare that with what the extra certainty is worth.',
      '<b>Has the deadline arrived?</b> Answer with what you know, state the uncertainty, and list the open questions.',
    ] },
    { p: 'Stopping is not the same as forgetting. Record the branches you did not finish and the questions still open, and say how the decision will be checked afterwards: that is the measure step of the analytics process, and it is often where the remaining uncertainty gets resolved.' },
  ],

  formulas: [
    { id: 'psf-growth-factors', name: 'Growth of a product of drivers',
      tex: String.raw`1 + g_R = (1 + g_V)(1 + g_c)(1 + g_A)`,
      where: [
        [String.raw`g_R`, 'Growth rate of revenue between the two periods, as a decimal (−0.05 for a 5% fall)', ''],
        [String.raw`g_V`, 'Growth rate of visits', ''],
        [String.raw`g_c`, 'Growth rate of the conversion rate (a relative change, not a change in percentage points)', ''],
        [String.raw`g_A`, 'Growth rate of average order value', ''],
      ],
      assumptions: 'Revenue is exactly visits × conversion rate × average order value, which is an identity when the three are calculated from the same visits, orders and revenue.',
      note: 'For small changes the growth rates roughly add: g_R ≈ g_V + g_c + g_A. For large ones they do not: +10% visits and −10% conversion give −1% revenue, not 0%.' },
    { id: 'psf-sequential', name: 'Step-by-step (sequential) contributions to a change in revenue',
      tex: String.raw`\Delta_V = (V_1 - V_0)\,c_0 A_0 \qquad \Delta_c = V_1 (c_1 - c_0) A_0 \qquad \Delta_A = V_1 c_1 (A_1 - A_0)`,
      where: [
        [String.raw`V_0,\ V_1`, 'Visits in the earlier and the later period', 'visits'],
        [String.raw`c_0,\ c_1`, 'Conversion rate in the earlier and the later period, as a decimal', ''],
        [String.raw`A_0,\ A_1`, 'Average order value in the earlier and the later period', '$ per order'],
        [String.raw`\Delta_V,\ \Delta_c,\ \Delta_A`, 'Change in revenue attributed to visits, conversion and order value, changed in that order', '$'],
      ],
      assumptions: 'The drivers are changed one at a time in a stated order: visits, then conversion, then order value. Each step keeps the drivers already changed at their new values, which is why the three contributions add up exactly to the change in revenue, V₁c₁A₁ − V₀c₀A₀. Changing each driver alone from the old values gives contributions that do not add up.',
      note: 'Another order gives different contributions, sometimes very different, because the part of the change that comes from drivers moving together is credited to whichever is changed later. Report the order used, check whether the ranking depends on it, and if it does, give the range.' },
  ],

  examples: [
    { level: 'simple', title: 'Is this issue tree MECE?', fictional: true,
      setup: 'Monthly profit at Bayview Bistro, a fictional restaurant, fell from $14,000 in May to $9,500 in June. A junior analyst drafts an issue tree for “Why did profit fall?” with four branches: (1) fewer diners, (2) lower spend per diner, (3) weaker weekend trade and (4) higher food costs. The June figures show revenue down from $62,000 to $60,500 (2,480 diners at $25.00 each in May, 2,420 at $25.00 in June) and costs up from $48,000 to $51,000: food from $20,000 to $20,400, staff from $22,000 to $24,500 and other costs from $6,000 to $6,100. Test the tree and fix it.',
      steps: [
        'Test for overlaps. Weekend trade is made of weekend diners and their spend, so a quiet weekend would appear in branch (3) and in branch (1) or (2). The branches are not mutually exclusive: (3) is a different way of slicing the same revenue.',
        'Test for gaps. Profit is revenue minus costs, and the tree has only one kind of cost. A rise in staff or other costs has nowhere to go, so the branches are not collectively exhaustive.',
        'Rebuild from the arithmetic. Profit = revenue − costs; revenue = diners × average spend; costs = food + staff + other. Every split is MECE because it is an identity. Weekday versus weekend becomes a split of diners at the next level down, where it is MECE too: every meal is on one or the other.',
        String.raw`Check that the numbers reconcile. Revenue: <m>2{,}480 \times 25 = 62{,}000</m> and <m>2{,}420 \times 25 = 60{,}500</m>, a fall of <m>1{,}500</m> dollars. Costs: <m>20{,}000 + 22{,}000 + 6{,}000 = 48{,}000</m> and <m>20{,}400 + 24{,}500 + 6{,}100 = 51{,}000</m>, a rise of <m>3{,}000</m>. Profit changed by <m>-1{,}500 - 3{,}000 = -4{,}500</m> dollars, exactly <m>9{,}500 - 14{,}000</m>.`,
        String.raw`Find the biggest branch. Spend per diner did not change, so the whole revenue fall is 60 fewer diners at $25: <m>60 \times 25 = 1{,}500</m>. On the cost side, staff costs rose by <m>24{,}500 - 22{,}000 = 2{,}500</m>, more than half of the <m>4{,}500</m> fall in profit, while food rose by only 400 and other costs by 100.`,
      ],
      answer: 'The draft tree is neither mutually exclusive (weekend trade overlaps diners and spend) nor collectively exhaustive (staff and other costs are missing). Rebuilt on profit = diners × spend − (food + staff + other), it shows that higher staff costs ($2,500) did more damage than fewer diners ($1,500), so staff costs are the first branch to investigate.',
      interpretation: 'The junior’s tree would have sent the team to study weekend trade and food prices, and nobody would have looked at staff costs, the largest single cause. Building the tree from an identity guarantees that it is MECE and that its branches add up to the whole change.' },

    { level: 'challenging', title: 'Which driver moved revenue?', fictional: true,
      setup: 'Larkfield Home, a fictional online homeware shop, had 50,000 visits in April, a conversion rate of 2.0% and an average order value of $60. In May it had 56,000 visits, a conversion rate of 1.6% and an average order value of $62. Revenue fell. How much did each driver contribute, and where should the team look next? A split by device is available: in April 35,000 visits came from phones, converting at 1.4%, and 15,000 from computers, converting at 3.4%; in May 40,000 came from phones, converting at 0.9%, and 16,000 from computers, converting at 3.35%.',
      steps: [
        String.raw`Revenue in each month: <m>50{,}000 \times 0.020 \times 60 = 60{,}000</m> and <m>56{,}000 \times 0.016 \times 62 = 55{,}552</m> dollars. The change is <m>55{,}552 - 60{,}000 = -4{,}448</m>.`,
        String.raw`Growth factors: visits <m>56{,}000 \div 50{,}000 = 1.12</m>, conversion <m>1.6 \div 2.0 = 0.80</m>, order value <m>62 \div 60 \approx 1.0333</m>. Their product, <m>1.12 \times 0.80 \times 1.0333 \approx 0.9259</m>, is revenue’s growth factor: a fall of about 7.4%. Adding the growth rates, <m>12 - 20 + 3.3 = -4.7</m>%, would understate it.`,
        String.raw`Contributions, changing visits first: visits <m>(56{,}000 - 50{,}000) \times 0.020 \times 60 = 7{,}200</m>; conversion <m>56{,}000 \times (0.016 - 0.020) \times 60 = -13{,}440</m>; order value <m>56{,}000 \times 0.016 \times (62 - 60) = 1{,}792</m>. Check: <m>7{,}200 - 13{,}440 + 1{,}792 = -4{,}448</m>.`,
        String.raw`Contributions, changing conversion first: conversion <m>50{,}000 \times (0.016 - 0.020) \times 60 = -12{,}000</m>; then visits <m>(56{,}000 - 50{,}000) \times 0.016 \times 60 = 5{,}760</m>; order value <m>1{,}792</m> as before. They add to the same <m>-4{,}448</m>. The sizes shift with the order, but the ranking does not: conversion is the big negative driver either way.`,
        String.raw`Split the conversion branch by device. Orders are <m>35{,}000 \times 0.014 + 15{,}000 \times 0.034 = 490 + 510 = 1{,}000</m> in April and <m>40{,}000 \times 0.009 + 16{,}000 \times 0.0335 = 360 + 536 = 896</m> in May, matching <m>50{,}000 \times 0.020</m> and <m>56{,}000 \times 0.016</m>. Computer conversion barely moved (3.4% to 3.35%); phone conversion fell from 1.4% to 0.9%.`,
      ],
      answer: 'Revenue fell by $4,448 (about 7.4%). More visits added $7,200 and a higher order value $1,792, but the fall in conversion from 2.0% to 1.6% cost $13,440 (or $12,000 if conversion is changed first). The fall in conversion is almost entirely on phones, which is where to look next.',
      interpretation: 'The headline, a 7% fall in revenue, hid a much bigger problem: phone conversion fell by over a third (about 36%), masked by growth in visits. Two levels of the driver tree took the team from “revenue is down” to “something is wrong for phone visitors”, a question narrow enough to investigate page by page.' },

    { level: 'applied', title: 'Why did installations fall?', fictional: true,
      setup: 'Linnet Solar, a fictional installer of home solar panels and batteries, completed 60 installations in May and 45 in June. Each installation earns a contribution of about $1,500 towards fixed costs. The operations director must decide by the end of the week what to do. The data: signed contracts waiting to be installed rose from 40 at the start of June to 58 at the end; in May five crews each completed 12 installations; in June only four crews worked, because one crew’s van was off the road all month, and they completed 45 installations between them.',
      steps: [
        'Build a MECE first split. Installations completed can fall only because there was less work to do (demand) or less capacity to do it (supply). The backlog of signed contracts rose from 40 to 58, so there was no shortage of work: the demand branch is ruled out and the supply branch is where to look.',
        String.raw`Build the driver tree for supply: installations = crews × installations per crew. May: <m>5 \times 12 = 60</m>. June: <m>4</m> crews completing <m>45 \div 4 = 11.25</m> each. Changing crews first: <m>(4 - 5) \times 12 = -12</m> installations; then productivity: <m>4 \times (11.25 - 12) = -3</m>. Check: <m>-12 - 3 = -15 = 45 - 60</m>. Changing productivity first gives <m>5 \times (11.25 - 12) = -3.75</m> and then <m>(4 - 5) \times 11.25 = -11.25</m>; either way the missing crew accounts for three-quarters or more of the fall.`,
        'Ask the five whys of the larger branch. Why only four crews? A van was off the road. Why? It failed its annual safety inspection. Why? Its brakes were overdue for servicing. Why? Service dates were tracked in a spreadsheet kept by a fleet coordinator who left in April. Why did nobody take it over? The handover checklist for departing staff does not mention fleet records. The fix that lasts is to give the maintenance schedule an owner and add it to the handover checklist; the fix for this month is to get a working van.',
        String.raw`Note what the five whys missed. It followed one chain, the missing crew, and says nothing about the smaller productivity branch (3 to 4 installations). The driver tree keeps that branch visible as an open question.`,
        String.raw`Decide whether to stop. The crew branch explains 11 to 12 of the 15 lost installations (75–80%), depending on the order. A hire van costs $2,400 a month and can be returned at any time, while each month without the fifth crew delays about <m>12 \times 1{,}500 = 18{,}000</m> dollars of contribution and risks customers cancelling. No plausible result of further analysis would make hiring a van the wrong choice, so stop analysing the crew branch and act.`,
      ],
      answer: 'The fall was a capacity problem, not a demand problem: one of five crews was idle, accounting for about 11–12 of the 15 lost installations, with lower productivity per crew accounting for the other 3–4. Hire a van now ($2,400 a month, reversible), fix the maintenance process so it cannot recur, and track productivity per crew next month before spending more time on the remaining 3 or 4.',
      interpretation: 'Each framework did a different job. The MECE split ruled out demand in one step; the driver tree sized the two branches; the five whys found a process fault behind the larger one; and the stopping rule turned analysis into action once more evidence could no longer change the decision. The smaller branch is not forgotten: it is recorded and measured.' },
  ],

  demo: [
    { widget: 'psf-driver', intro: 'Larkfield Home’s revenue driver tree. April is fixed at 50,000 visits, 2.0% conversion and a $60 average order value; set May’s values and see the change in revenue split between the three drivers (changed in the order visits, conversion, order value). Try raising visits by 10% while cutting conversion by 10%, and notice that revenue falls. Then find a combination in which revenue is flat but conversion has collapsed: the headline would look fine.' },
  ],

  mistakes: [
    { title: '“An issue tree is a list of everything I can think of.”', html: 'A list is not a tree. The branches at each level must not overlap and must together cover every possibility; otherwise you double-count some causes and never examine others. Build splits from identities (revenue = visits × conversion × order value), from before-and-after, or close a list with “everything else”.' },
    { title: '“If visits rise 10% and conversion falls 10%, revenue is unchanged.”', html: 'Drivers that multiply combine by multiplying their growth factors: 1.10 × 0.90 = 0.99, a 1% fall. Adding growth rates is a fair shortcut only for small changes.' },
    { title: '“The driver tree shows why revenue fell.”', html: 'It shows where: which driver, which channel, which device. Why needs root-cause work at the leaf the tree points to, and evidence for each step of the explanation.' },
    { title: '“The five whys always finds the root cause.”', html: 'It follows one chain of explanations, different people can follow different chains, and many problems have several causes. Check each answer against evidence, and use it alongside tools that show many causes at once, such as a driver tree or a fishbone diagram.' },
    { title: '“Explore the data first, then decide what the question is.”', html: 'Exploration is valuable for a new dataset, but a pattern found by searching everywhere may be chance. When there is a decision to make, frame the question and hypotheses first, and treat surprises as new hypotheses to test.' },
    { title: '“Keep analysing until every doubt is removed.”', html: 'Certainty never arrives, and delay has a cost. Stop when more evidence could not change the decision, when the explanation accounts for most of the change, or when a cheap, reversible action plus measurement would answer the question faster.' },
  ],

  application: [
    { case: 'With the question brief agreed on 2 October, you plan the September analysis for Ana using the frameworks in this lesson. Ana must decide by 9 October, so the plan has to be quick and in the right order.' },
    { p: '<b>Start with the branch that could undermine everything else.</b> The issue tree’s lower branch, the counting changed, comes first, not because it is the most likely explanation but because it is cheap to check and, if true, makes other numbers wrong. Missing orders would make part of the fall unreal; visits counted differently would leave orders untouched but make the website’s measured conversion fall. You compare the shop’s September paid orders with the payment provider’s statement, and the website’s recorded visits by source with August’s; in CRISP-DM’s terms this is data understanding, verifying data quality before relying on it.' },
    { p: '<b>Then work down the driver tree, hypothesis by hypothesis.</b> Orders are visits times conversion, channel by channel. The brief’s comparison is already built into the tree: the website’s branch, where the checkout changed, sits beside the app’s, where it did not. For each branch you know in advance what each hypothesis predicts, so each comparison either rules a family of explanations in or rules it out. Only if the website branch shows the fall do you split it further, by device and by checkout step, which is where the agency’s own error logs become useful.' },
    { p: '<b>Size the explanation.</b> The one-at-a-time method tells you how much of the change in orders comes from visits and how much from conversion in each channel. If one branch accounts for most of it, that is where the root-cause work goes; if the change is spread thinly across many branches, there may be no single cause, and the recommendation changes accordingly.' },
    { p: '<b>Decide when to stop.</b> The brief set the threshold in advance: a relative fall of a tenth or more (3.0% to 2.7% would qualify: 0.3 of a percentage point) in website conversion is worth acting on. Ana’s preferred action, asking the agency to investigate and fix the checkout, is cheap and reversible, while rolling the redesign back would lose features she wants. So if the counts reconcile and the website branch shows a fall above the threshold that the app does not share, that is enough to act on. Further splits can continue alongside the agency’s work rather than delay it, and the measure step (website conversion tracked weekly after any fix) will show whether the action worked.' },
    { p: '<b>Write the report in the same structure.</b> A report that follows the issue tree (what was checked, what each check showed, which branches remain open) lets Ana see why you reached your conclusion and how sure you are. The course project asks you to carry out this plan with the case figures, compute each branch and write the recommendation.' },
    { p: 'These frameworks are used far beyond retail. Management consultants use issue trees to structure their work, hospital safety teams carry out root-cause analyses after serious incidents, manufacturers use the five whys on the factory floor, and data science teams organise model-building projects around CRISP-DM or methods derived from it. What they share is the discipline of this lesson: split the problem so that nothing is missed or counted twice, test hypotheses in a sensible order, find causes rather than symptoms, and stop when the decision is clear.' },
  ],

  summary: [
    'An issue tree splits a problem into smaller questions until each can be answered with specific evidence.',
    'Each split should be MECE: no overlaps (mutually exclusive) and no gaps (collectively exhaustive). Splits built on identities are MECE automatically.',
    'Hypothesis-driven analysis tests stated explanations in order and suits decisions with deadlines; exploratory analysis looks first and suits new data. Good analysts alternate.',
    'A driver tree links branches by arithmetic: revenue = visits × conversion × average order value. Growth factors multiply, and one-at-a-time contributions add up exactly to the change.',
    'Root-cause analysis looks for causes, not symptoms. The five whys is quick but follows one path; combine it with driver trees or fishbone diagrams and check each answer.',
    'CRISP-DM has six phases (business understanding, data understanding, data preparation, modelling, evaluation, deployment), moved through iteratively and as a cycle.',
    'Stop when more evidence could not change the decision, when the explanation accounts for most of the change, or when a cheap, reversible action plus measurement will answer faster.',
  ],

  glossary: [
    { term: 'Issue tree', def: 'A diagram that breaks a problem or question into smaller questions, level by level, until each can be answered with specific evidence.' },
    { term: 'MECE', def: 'Mutually exclusive, collectively exhaustive: a test for the branches of a split or a set of categories, which should not overlap and should together cover every possibility.' },
    { term: 'Hypothesis-driven analysis', def: 'Analysis that starts from stated hypotheses and gathers the evidence that would confirm or contradict each, usually the most promising and cheapest first.' },
    { term: 'Exploratory data analysis', def: 'Analysis that examines data with summaries and charts to see what patterns they contain before committing to a model or hypothesis.' },
    { term: 'Driver tree', def: 'An issue tree whose branches are linked by arithmetic, such as revenue = visits × conversion rate × average order value, so that a change at the top can be traced to the drivers below it.' },
    { term: 'Root-cause analysis', def: 'A structured search for the underlying causes of a problem, rather than its symptoms, so that fixing them prevents it from recurring.' },
    { term: 'Root cause', def: 'A cause which, if removed, would prevent a problem from recurring. Many problems have several.' },
    { term: 'Five whys', def: 'A root-cause technique that asks “why?” of a problem and then of each answer in turn, usually about five times, until it reaches a cause that can be acted on.' },
    { term: 'CRISP-DM', def: 'The Cross-Industry Standard Process for Data Mining: a six-phase method for analytics projects (business understanding, data understanding, data preparation, modelling, evaluation and deployment), published as version 1.0 in 2000.' },
  ],

  references: [
    { text: 'Chapman, P., Clinton, J., Kerber, R., Khabaza, T., Reinartz, T., Shearer, C. &amp; Wirth, R. (2000). <i>CRISP-DM 1.0: Step-by-step data mining guide</i>. SPSS.', url: 'https://s2.smu.edu/tfomby/eco5385_eco6380/data/SPSS/CRISPWP-0800%20Data%20Mining%20Standards.pdf', checked: '2026-10-23' },
    { text: 'Card, A. J. (2017). The problem with ‘5 whys’. <i>BMJ Quality &amp; Safety</i>, 26(8), 671–677. doi:10.1136/bmjqs-2016-005849.', url: 'https://qualitysafety.bmj.com/content/26/8/671', checked: '2026-10-23' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.1.2, “How Does Exploratory Data Analysis differ from Classical Data Analysis?”', url: 'https://www.itl.nist.gov/div898/handbook/eda/section1/eda12.htm', checked: '2026-10-23' },
    { text: 'McKinsey &amp; Company. “Barbara Minto: ‘MECE: I invented it, so I get to say how to pronounce it’”. McKinsey Alumni News.', url: 'https://www.mckinsey.com/alumni/news-and-events/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'August orders (case.js)', value: SHOP.webOrders[1] + SHOP.appOrders[1], shown: 316 },
    { what: 'September orders (case.js)', value: SHOP.webOrders[2] + SHOP.appOrders[2], shown: 251 },
    { what: '+10% and −10% growth factors', value: 1.1 * 0.9, shown: 0.99 },
    { what: 'Bistro: May revenue', value: 2480 * 25, shown: 62000 },
    { what: 'Bistro: June revenue', value: 2420 * 25, shown: 60500 },
    { what: 'Bistro: revenue fall', value: 62000 - 60500, shown: 1500 },
    { what: 'Bistro: May costs', value: 20000 + 22000 + 6000, shown: 48000 },
    { what: 'Bistro: June costs', value: 20400 + 24500 + 6100, shown: 51000 },
    { what: 'Bistro: cost rise', value: 51000 - 48000, shown: 3000 },
    { what: 'Bistro: May profit', value: 62000 - 48000, shown: 14000 },
    { what: 'Bistro: June profit', value: 60500 - 51000, shown: 9500 },
    { what: 'Bistro: profit change', value: -1500 - 3000, shown: -4500 },
    { what: 'Bistro: profit change direct', value: 9500 - 14000, shown: -4500 },
    { what: 'Bistro: fewer diners', value: 2480 - 2420, shown: 60 },
    { what: 'Bistro: revenue from fewer diners', value: 60 * 25, shown: 1500 },
    { what: 'Bistro: staff cost rise', value: 24500 - 22000, shown: 2500 },
    { what: 'Bistro: food cost rise', value: 20400 - 20000, shown: 400 },
    { what: 'Bistro: other cost rise', value: 6100 - 6000, shown: 100 },
    { what: 'Larkfield: April revenue', value: 50000 * 0.02 * 60, shown: 60000 },
    { what: 'Larkfield: May revenue', value: 56000 * 0.016 * 62, shown: 55552 },
    { what: 'Larkfield: change', value: 56000 * 0.016 * 62 - 50000 * 0.02 * 60, shown: -4448 },
    { what: 'Larkfield: visits factor', value: 56000 / 50000, shown: 1.12 },
    { what: 'Larkfield: conversion factor', value: 1.6 / 2.0, shown: 0.8 },
    { what: 'Larkfield: AOV factor', value: 62 / 60, shown: 1.0333, tol: 0.00005 },
    { what: 'Larkfield: revenue factor', value: 1.12 * 0.8 * (62 / 60), shown: 0.9259, tol: 0.00005 },
    { what: 'Larkfield: revenue fall about 7.4%', value: (1 - 1.12 * 0.8 * (62 / 60)) * 100, shown: 7.4, tol: 0.05 },
    { what: 'Larkfield: AOV growth 3.3%', value: (62 / 60 - 1) * 100, shown: 3.3, tol: 0.05 },
    { what: 'Larkfield: sum of growth rates', value: (56000 / 50000 - 1) * 100 + (1.6 / 2 - 1) * 100 + (62 / 60 - 1) * 100, shown: -4.7, tol: 0.05 },
    { what: 'Larkfield: visits first, visits', value: (56000 - 50000) * 0.02 * 60, shown: 7200 },
    { what: 'Larkfield: visits first, conversion', value: 56000 * (0.016 - 0.02) * 60, shown: -13440 },
    { what: 'Larkfield: AOV contribution', value: 56000 * 0.016 * (62 - 60), shown: 1792 },
    { what: 'Larkfield: visits first, total', value: 7200 - 13440 + 1792, shown: -4448 },
    { what: 'Larkfield: conversion first, conversion', value: 50000 * (0.016 - 0.02) * 60, shown: -12000 },
    { what: 'Larkfield: conversion first, visits', value: (56000 - 50000) * 0.016 * 60, shown: 5760 },
    { what: 'Larkfield: conversion first, total', value: -12000 + 5760 + 1792, shown: -4448 },
    { what: 'Larkfield: April phone orders', value: 35000 * 0.014, shown: 490 },
    { what: 'Larkfield: April computer orders', value: 15000 * 0.034, shown: 510 },
    { what: 'Larkfield: April orders', value: 35000 * 0.014 + 15000 * 0.034, shown: 1000 },
    { what: 'Larkfield: April orders from total', value: 50000 * 0.02, shown: 1000 },
    { what: 'Larkfield: April device visits add up', value: 35000 + 15000, shown: 50000 },
    { what: 'Larkfield: May phone orders', value: 40000 * 0.009, shown: 360 },
    { what: 'Larkfield: May computer orders', value: 16000 * 0.0335, shown: 536 },
    { what: 'Larkfield: May orders', value: 40000 * 0.009 + 16000 * 0.0335, shown: 896 },
    { what: 'Larkfield: May orders from total', value: 56000 * 0.016, shown: 896 },
    { what: 'Larkfield: May device visits add up', value: 40000 + 16000, shown: 56000 },
    { what: 'Larkfield: phone conversion fell about 36%', value: (1.4 - 0.9) / 1.4 * 100, shown: 36, tol: 0.5 },
    { what: 'Larkfield: joint visits-conversion term', value: (56000 - 50000) * (0.016 - 0.02) * 60, shown: -1440 },
    { what: 'Larkfield: visits second', value: (56000 - 50000) * 0.016 * 60, shown: 5760 },
    { what: 'Larkfield: visits first minus second equals minus joint term', value: 7200 - 5760, shown: 1440 },
    { what: 'Larkfield: conversion change 0.016 − 0.02', value: 0.016 - 0.02, shown: -0.004 },
    { what: 'Linnet: May installations', value: 5 * 12, shown: 60 },
    { what: 'Linnet: June per crew', value: 45 / 4, shown: 11.25 },
    { what: 'Linnet: crew effect', value: (4 - 5) * 12, shown: -12 },
    { what: 'Linnet: productivity effect', value: 4 * (45 / 4 - 12), shown: -3 },
    { what: 'Linnet: total change', value: (4 - 5) * 12 + 4 * (45 / 4 - 12), shown: -15 },
    { what: 'Linnet: actual change', value: 45 - 60, shown: -15 },
    { what: 'Linnet: share explained by crews, crews first', value: 12 / 15 * 100, shown: 80 },
    { what: 'Linnet: productivity first', value: 5 * (11.25 - 12), shown: -3.75 },
    { what: 'Linnet: crews second', value: (4 - 5) * 11.25, shown: -11.25 },
    { what: 'Linnet: productivity-first total', value: 5 * (11.25 - 12) + (4 - 5) * 11.25, shown: -15 },
    { what: 'Linnet: share explained by crews, productivity first', value: 11.25 / 15 * 100, shown: 75 },
    { what: 'Linnet: contribution delayed per month', value: 12 * 1500, shown: 18000 },
  ],
};
