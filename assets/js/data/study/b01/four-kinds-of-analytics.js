// four-kinds-of-analytics.js — B01 · The four kinds of analytics. Content only; exercises are in four-kinds-of-analytics.ex.js.
import { SHOP } from './case.js';

const STAIRS = '<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14"><defs><marker id="fka-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + '<line x1="50" y1="280" x2="50" y2="28" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#fka-ar)"/><line x1="50" y1="280" x2="624" y2="280" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#fka-ar)"/>'
  + '<text transform="translate(32 160) rotate(-90)" text-anchor="middle" fill="currentColor">Value to the decision</text>'
  + '<text x="337" y="306" text-anchor="middle" fill="currentColor">Difficulty: data, assumptions and skill needed</text>'
  + '<rect x="58" y="220" width="136" height="60" rx="4" style="fill:none;stroke:var(--series-1);stroke-width:2"/>'
  + '<rect x="197" y="175" width="136" height="105" rx="4" style="fill:none;stroke:var(--series-2);stroke-width:2"/>'
  + '<rect x="336" y="130" width="136" height="150" rx="4" style="fill:none;stroke:var(--series-3);stroke-width:2"/>'
  + '<rect x="475" y="85" width="136" height="195" rx="4" style="fill:none;stroke:var(--series-1);stroke-width:2;stroke-dasharray:6 3"/>'
  + '<text x="126" y="243" text-anchor="middle" font-weight="700" fill="currentColor">Descriptive</text><text x="126" y="263" text-anchor="middle" font-size="12" fill="currentColor">What happened?</text>'
  + '<text x="265" y="198" text-anchor="middle" font-weight="700" fill="currentColor">Diagnostic</text><text x="265" y="218" text-anchor="middle" font-size="12" fill="currentColor">Why did it happen?</text>'
  + '<text x="404" y="153" text-anchor="middle" font-weight="700" fill="currentColor">Predictive</text><text x="404" y="173" text-anchor="middle" font-size="12" fill="currentColor">What will happen?</text>'
  + '<text x="543" y="108" text-anchor="middle" font-weight="700" fill="currentColor">Prescriptive</text><text x="543" y="128" text-anchor="middle" font-size="12" fill="currentColor">What should we do?</text>'
  + '<text x="126" y="211" text-anchor="middle" font-size="13" font-style="italic" fill="currentColor">hindsight</text><text x="265" y="166" text-anchor="middle" font-size="13" font-style="italic" fill="currentColor">insight</text><text x="404" y="121" text-anchor="middle" font-size="13" font-style="italic" fill="currentColor">foresight</text><text x="543" y="76" text-anchor="middle" font-size="13" font-style="italic" fill="currentColor">a recommendation</text>'
  + '<text x="196" y="64" text-anchor="middle" font-size="13" fill="currentColor">Looks back at data</text><text x="196" y="81" text-anchor="middle" font-size="13" fill="currentColor">that already exist</text>'
  + '<text x="404" y="64" text-anchor="middle" font-size="13" fill="currentColor">Looks forward:</text><text x="404" y="81" text-anchor="middle" font-size="13" fill="currentColor">rests on assumptions</text>'
  + '</svg>';

const LOOP = '<svg viewBox="0 0 640 196" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14"><defs><marker id="fka-lp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + [['Question', 'lesson 2'], ['Data', 'module 2'], ['Analysis', 'module 3'], ['Decision', 'who decides?'], ['Measure', 'what happened?']]
    .map(([a, b], i) => { const x = 12 + i * 126; return `<rect x="${x}" y="30" width="108" height="58" rx="6" style="fill:none;stroke:var(--series-${(i % 3) + 1});stroke-width:2"/><text x="${x + 54}" y="55" text-anchor="middle" font-weight="700" fill="currentColor">${i + 1}. ${a}</text><text x="${x + 54}" y="75" text-anchor="middle" font-size="12" fill="currentColor">${b}</text>`; }).join('')
  + [0, 1, 2, 3].map((i) => { const x = 120 + i * 126; return `<line x1="${x + 2}" y1="59" x2="${x + 16}" y2="59" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#fka-lp)"/>`; }).join('')
  + '<path d="M570 88L570 130L66 130L66 92" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#fka-lp)"/>'
  + '<text x="318" y="152" text-anchor="middle" font-size="13" fill="currentColor">the result answers the old question and raises the next one</text>'
  + '<text x="318" y="182" text-anchor="middle" font-size="12" fill="currentColor">Descriptive, diagnostic, predictive or prescriptive work happens in step 3, as the question requires.</text>'
  + '</svg>';

export default {
  slug: 'four-kinds-of-analytics',
  title: 'The four kinds of analytics',
  blurb: 'Analytics turns data into better decisions. Learn the four questions it answers (what happened, why, what will happen and what should we do), what each needs and produces, where machine learning fits, and the five-step process that runs from a business question to a measured result.',
  status: 'draft',
  objectives: [
    'Define business analytics and explain how data, people and decisions work together in it.',
    'Distinguish descriptive, diagnostic, predictive and prescriptive analytics by the question each answers, the methods it uses and what it produces.',
    'Classify a business question by the kind of analytics it needs, and explain why one decision usually draws on several kinds.',
    'Explain the trade-off between the value and the difficulty of the four kinds, and where that picture misleads.',
    'Calculate the expected value of a decision option and the error of a forecast, as simple instances of prescriptive and predictive work.',
    'Describe where machine learning fits and the five steps of the analytics process: question, data, analysis, decision and measure.',
  ],
  prerequisites: [
    { lesson: 'f00/finance-time-and-risk', why: 'The applied example uses expected value: each possible outcome multiplied by its probability, then added.' },
    { text: 'Percentages and averages at school level. No statistics is assumed.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is the start of October 2026. Lantern Coffee Co., Ana Lim’s coffee business, has sold beans, a cold-brew pack and gift boxes online since March, through its website and its app, alongside the catering and barista workshops it started with. Since July Ana has reviewed the online shop every month, and four questions are on her list: how many orders the shop took in August, and through which channel; why orders fell in September, when more people visited the shop than in August; how many gift boxes customers will order in December; and how many gift boxes Lantern should have assembled and ready by the start of December.' },
    { p: 'The four questions sound alike, but each asks something different of the data, and each needs a different kind of work. The first asks what happened, the second why it happened, the third what will happen and the fourth what to do. These four questions are the usual way of dividing up <g>analytics</g>, and this lesson takes them one at a time.' },

    { h: 'What analytics is' },
    { p: 'In 2012 INFORMS, the professional society for operations research and analytics, published the definition of analytics it had adopted: “the scientific process of transforming data into insight for making better decisions”. Three words in that definition matter. <i>Process</i>: analytics is a sequence of steps, not a piece of software or a chart. <i>Data</i>: it starts from recorded facts, such as orders, visits, prices and ratings. <i>Decisions</i>: its purpose is a better choice, so an analysis that changes no decision, however clever, has not done its job.' },
    { p: '<g>Business analytics</g> is analytics applied to the decisions of a business: what to sell, at what price, to whom, through which channel, with how much stock and how many staff. The same ideas run through public services, hospitals and charities, where the decisions are about patients, budgets and services rather than prices and stock.' },

    { h: 'Data, people and decisions' },
    { p: 'It helps to see analytics as three things working together. <b>Data</b> are the record: what was sold, to whom, when and for how much. <b>People</b> bring the question, the knowledge of how the business works, the judgement about what a pattern means and the authority to act. <b>Decisions</b> are the reason for the work: a choice between options, made by someone, by a date.' },
    { p: 'Remove any one and the work fails in a familiar way. Data without a decision produce reports that nobody reads. A decision without data rests on opinion and memory. Data and a decision without people who understand the business produce numbers that are correct and misleading, such as an average that mixes two very different kinds of customer.' },
    { case: 'At Lantern the three are easy to see. The data are the shop’s monthly visits, orders and order values by channel, its customer ratings and the gift-box orders. The people are Ana, who decides; the small web agency that built the redesigned website checkout, which went live on 1 September; and you, the analyst she asks for help. The decisions are concrete: whether to keep the new checkout, how many gift boxes to have assembled for December, and where to spend next month’s advertising budget.' },

    { h: 'Four questions, four kinds of analytics' },
    { p: 'The four kinds are usually drawn as a staircase. Each step answers a harder question and needs more data, more assumptions and more skill; done well, each also gets closer to the decision itself.' },
    { figure: {
      svg: STAIRS,
      caption: 'The four kinds of analytics as a staircase: each step answers a harder question and sits closer to the decision. The first two look back at data that already exist; the last two look forward. The theory section explains what this picture hides.',
      alt: 'A chart with “Difficulty: data, assumptions and skill needed” on the horizontal axis and “Value to the decision” on the vertical axis. Four boxes rise like a staircase from left to right. The lowest, on the left, is “Descriptive: What happened?”, labelled hindsight. The second is “Diagnostic: Why did it happen?”, labelled insight. The third is “Predictive: What will happen?”, labelled foresight. The highest, on the right, drawn with a dashed outline, is “Prescriptive: What should we do?”, labelled a recommendation. Notes above the boxes say that the left-hand kinds look back at data that already exist and that the forward-looking kinds rest on assumptions.',
    } },
    { define: [
      ['Descriptive analytics', `Answers <i>what happened?</i> It summarises past data into counts, totals, averages, rates and charts. In August Lantern’s shop took ${SHOP.webOrders[1] + SHOP.appOrders[1]} orders, ${SHOP.webOrders[1]} on the website and ${SHOP.appOrders[1]} in the app. Its output is a report or a dashboard.`],
      ['Diagnostic analytics', 'Answers <i>why did it happen?</i> It breaks a result into parts, compares groups and periods, and tests possible explanations. Did September’s fall happen on the website, in the app or both, and did it begin on 1 September, when the new checkout went live? Its output is an explanation, held with more or less confidence.'],
      ['Predictive analytics', 'Answers <i>what will happen?</i> It uses past patterns to estimate future or unknown values: December’s gift-box orders, next month’s visits, the chance that a particular customer orders again. Its output is a forecast or a score, and it is always uncertain.'],
      ['Prescriptive analytics', 'Answers <i>what should we do?</i> It combines predictions with the options, costs, constraints and goals of a decision to recommend an action: how many gift boxes to assemble, given what a box sold earns, what a leftover box costs and how uncertain demand is. Its output is a recommended decision, or a rule for making one.'],
    ] },
    { callout: 'key', title: 'Name the question word', html: '“What happened?” is descriptive, “why?” is diagnostic, “what will happen?” or “how likely?” is predictive, and “what should we do?” is prescriptive. Ask which of the four a request really is before you touch any data: it decides what data you need and what a useful answer looks like.' },

    { h: 'One decision usually needs several kinds' },
    { p: 'The four kinds are not alternatives to choose between; a real decision usually draws on several in turn. Ana’s gift-box decision starts with description (how many gift-box orders came in each month so far?), may need diagnosis (why did November jump: catering clients buying gifts for their staff, or a seasonal rush?), certainly needs a prediction (how many in December?) and ends with a prescription (assemble this many). Each step depends on the one before. A forecast built on a miscounted history is wrong from the start, and a recommendation built on a poor forecast is no better than a guess.' },
  ],

  theory: [
    { h: 'Descriptive analytics: getting the facts right' },
    { p: 'A large share of analytics work is descriptive, and for good reason: every other kind depends on it. Descriptive work turns raw records into summaries: totals (orders in August), averages (the average amount spent per order), rates (the share of visits that end in an order) and comparisons (this month against last month, or against a target). Module 3 of this course defines these measures exactly and teaches you to read them.' },
    { p: 'Descriptive analytics sounds easy and is easy to get wrong. A count of “orders” depends on what counts as an order: are cancelled orders in or out? A monthly comparison depends on whether the months are comparable: September has 30 days and August 31. A total depends on the data being complete and free of duplicates.' },
    { p: 'The next lesson deals with definitions and module 2 with data quality. For now, note that a common failure in analytics is not an exotic model but a wrong number in a simple table.' },

    { h: 'Diagnostic analytics: from pattern to explanation' },
    { p: 'Diagnostic work starts where description finds something surprising, and its main tools are simple. <b>Drilling down</b> splits a total into its parts: orders by channel, by device, by product, by day. <b>Comparison</b> sets the group that changed beside one that did not, such as the website, whose checkout was redesigned, beside the app, whose checkout was not. <b>Timing</b> asks whether a change began when a suspected cause began. The third lesson of this module, on problem-solving frameworks, gives this search a structure, so that you look everywhere the cause could be, and look once.' },
    { p: 'A diagnosis is a hypothesis until it has survived a test. Two things that move together need not be cause and effect: visits and orders might both fall in a heatwave, with neither causing the other. The last lesson of this course, and later B05 Correlation Analysis, treat this properly. Until you have ruled out the other explanations, say “the evidence is consistent with” rather than “the cause was”, and where you can, confirm with an experiment that changes one thing and watches what happens, the subject of B12.' },

    { h: 'Predictive analytics: estimating what you cannot yet see' },
    { p: 'A <g>forecast</g> is an estimate, made in advance, of a future value such as next month’s orders. Predictive analytics also estimates present values that are not yet known, such as whether a payment just made is fraudulent. Its methods run from the very simple to the very complex: the simplest forecast says next month will be like this month. A seasonal version says December will be like last December, which Lantern cannot use: its shop opened in March 2026, so it has no December to copy. Statistical models and machine learning fit patterns to many past observations at once, and B09 Forecasting and Time Series teaches them.' },
    { p: 'Every prediction assumes that the pattern it learned from will continue, and every prediction is uncertain. Good predictive work therefore says how uncertain it is, for example by giving a range, or a few <g>scenarios</g> with probabilities, rather than one number. It also checks itself afterwards. The <g>forecast error</g> is the actual value minus the forecast, once the actual is known. Tracking errors over time shows whether a method is biased (always too high, say) and how far it can be trusted.' },

    { h: 'Prescriptive analytics: choosing what to do' },
    { p: 'A prediction alone does not make a decision. Knowing that December’s gift-box orders will probably be somewhere between 160 and 320 does not say how many boxes to assemble; that also depends on what a box sold earns, what an unsold box costs and how much risk the business will accept. Prescriptive analytics brings these together. Its methods include <g>optimisation</g>, which searches for the choice that gives the best result within constraints (the cheapest delivery routes, the staff rota that covers every shift at the lowest cost); simulation, which plays out many possible futures to see how each option fares; and decision rules built on <g>expected value</g>, the probability-weighted average of the possible outcomes, which F00 introduced. B11 Optimisation and Decision Analytics develops these methods.' },
    { p: 'Prescriptive analytics does not take the decision away from people. It makes the trade-offs explicit: given these forecasts, these costs and this goal, this option does best. If Ana disagrees with a recommendation, the useful question is which input she disagrees with, and that is a far more productive argument than one about gut feeling.' },

    { h: 'Value and difficulty' },
    { p: 'The staircase makes one point and hides another. The point: moving from description towards prescription generally adds value, because the output gets closer to the decision, and adds difficulty, because each step needs the earlier ones plus more data, more assumptions and more skill. That is why so much work stays descriptive: it is cheaper, quicker and easier to trust.' },
    { p: 'What the staircase hides is that the four kinds are not grades of quality, and that you do not have to climb it. A correct monthly report that shows a manager something she did not know can be worth more than an elaborate model built on bad data. Some decisions need only description: whether the shop met a target is answered by a comparison. And the boundaries blur. A dashboard that turns a number red when it misses its target is already part-way to a decision rule, and a diagnosis often rests on an implicit prediction of what would have happened without the change.' },
    { callout: 'note', title: 'Three kinds or four?', html: 'Classifications differ. INFORMS describes three kinds of analytics: descriptive, predictive and prescriptive. Many textbooks and software vendors add diagnostic analytics as a separate fourth, because explaining a change is a different job from reporting it: TDWI’s glossary, for example, describes it as analysis that goes beyond describing what happened to explore why it happened. Others treat diagnosis as the deeper end of descriptive work. The four-step staircase, with value against difficulty and the labels hindsight, insight and foresight, is commonly credited to the research firm Gartner. This course uses four kinds; what matters is the question each answers, not the label.' },

    { h: 'Where machine learning fits' },
    { p: '<g>Machine learning</g> is a family of methods in which a computer fits a model to data, learning a relationship between inputs and an outcome from examples rather than from rules a person writes down. In <i>supervised learning</i> the examples come with the answer attached, such as past customers labelled by whether they ordered again, and the model learns to predict that answer for new cases. In <i>unsupervised learning</i> there is no answer to predict, and the method looks for structure, such as groups of similar customers.' },
    { p: 'Machine learning is therefore not a fifth kind of analytics but a set of tools used inside the four, most often for prediction: scoring each customer’s chance of ordering again, forecasting demand, flagging a payment that looks fraudulent. Grouping customers into segments is descriptive work done with machine-learning methods, and some prescriptive systems learn which action works best by trying several. Whatever the method, the same discipline applies: a clear question, trustworthy data and an honest check of how well the model performs on cases it has not seen. B08 Machine Learning for Business teaches the methods; this course builds the habits they depend on.' },

    { h: 'The analytics process' },
    { p: 'Every analysis in this course, simple or complex, follows the same five steps, which together make up the <g>analytics process</g>.' },
    { ol: [
      '<b>Question.</b> State the decision the analysis supports, and turn a vague worry into a measurable question: what exactly will be measured, for whom, over what period and compared with what. The next lesson teaches this.',
      '<b>Data.</b> Find or collect the data the question needs, understand what each value means and check whether it can be trusted. Module 2 covers this, and B02 Data Cleaning and Preparation goes deeper.',
      '<b>Analysis.</b> Describe, diagnose, predict or prescribe, as the question requires, using measures that are defined exactly. Module 3 covers the measures and how to read them.',
      '<b>Decision.</b> Present the finding, with its uncertainty, to the person who decides, together with what you recommend and why.',
      '<b>Measure.</b> After the decision, measure what happened and compare it with what was expected. The result answers the old question and usually raises the next one.',
    ] },
    { figure: {
      svg: LOOP,
      caption: 'The analytics process used in this course. The dashed arrow is the step most often skipped: measuring the result and feeding it into the next question.',
      alt: 'Five boxes in a row, joined left to right by arrows: “1. Question” (lesson 2), “2. Data” (module 2), “3. Analysis” (module 3), “4. Decision” (who decides?) and “5. Measure” (what happened?). A dashed arrow runs from the Measure box back underneath the row to the Question box, labelled “the result answers the old question and raises the next one”. A note says that descriptive, diagnostic, predictive or prescriptive work happens in step 3, as the question requires.',
    } },
    { p: 'The last step is the one most often skipped, and it is what makes analytics improve over time. A forecast that is never compared with the actual cannot get better, and a change to a website whose effect is never measured teaches the business nothing.' },
    { p: 'Other sources draw the process with different boxes. OpenStax’s <i>Principles of Data Science</i> describes a five-stage data science cycle (problem definition, data collection, data preparation, data analysis and data reporting) and notes that collecting and preparing the data usually take the most time and effort. CRISP-DM, which you will meet in the third lesson of this module, uses six phases. They agree on the essentials: start from the question, earn trust in the data, and finish with something someone can act on.' },
  ],

  formulas: [
    { id: 'fka-expected-value', name: 'Expected value of a decision option',
      tex: String.raw`\text{EV} = \sum_{s} p_s \, V_s`,
      where: [
        [String.raw`\text{EV}`, 'Expected value of the option: its probability-weighted average outcome', '$'],
        [String.raw`p_s`, 'Probability of scenario s; the probabilities of all the scenarios add up to 1', ''],
        [String.raw`V_s`, 'Outcome of the option, such as profit, if scenario s happens', '$'],
        [String.raw`s`, 'A scenario: one possible future, such as low, medium or high demand', ''],
      ],
      assumptions: 'The scenarios cover the outcomes that matter and their probabilities are reasonable estimates. Expected value ignores risk: two options with the same expected value can differ greatly in how bad their worst case is.',
      note: 'Work out the expected value of every option and compare them. The option with the highest expected value is the best choice for a decision-maker who is neutral to risk; a cautious one may accept a little less for a safer worst case.' },
    { id: 'fka-forecast-error', name: 'Forecast error and percentage error',
      tex: String.raw`e = A - F \qquad \text{Percentage error} = \dfrac{A - F}{A} \times 100`,
      where: [
        ['e', 'Forecast error', 'units of the forecast'],
        ['A', 'Actual value, once it is known', 'units of the forecast'],
        ['F', 'Forecast made in advance', 'units of the forecast'],
      ],
      assumptions: 'The actual is measured in exactly the same way as the forecast was defined. Percentage error cannot be calculated when the actual is zero.',
      note: 'A positive error means the forecast was too low; a negative one, too high. Some sources define the error the other way round (F − A), so say which you use. B09 covers summary measures of many errors.' },
  ],

  examples: [
    { level: 'simple', title: 'Which kind of analytics?', fictional: true,
      setup: 'Classify each question by the kind of analytics it needs. (a) A university asks how many first-year students left before the end of their first term last year. (b) A battery-storage installer asks why its installations in the north took longer in the spring than in the winter. (c) A clothing brand asks how many winter coats it will sell in each week of November. (d) A regional airline asks what price to offer for the last ten seats on Friday’s evening flight. (e) Lantern asks which of the customers who ordered once in the summer are likely to order again before Christmas.',
      steps: [
        '(a) Descriptive. It asks for a count of something that has already happened, and the answer comes straight from the records.',
        '(b) Diagnostic. The installer already knows what happened (installations took longer); it asks why, so it needs comparisons, for example of the weather, the number of crews and the kinds of job in each season.',
        '(c) Predictive. November’s sales have not happened yet, so the brand needs a forecast, ideally with a range.',
        '(d) Prescriptive. The airline asks what to do. A good answer combines a prediction (how many more people will want to book, and at which prices) with the options (the prices it could set) and the goal (revenue from the flight).',
        '(e) Predictive. It asks for an estimate of something unknown: each customer’s chance of ordering again. If Lantern then asked which of those customers to send a discount code, the question would become prescriptive, because it also needs the cost of the discount.',
      ],
      answer: '(a) Descriptive. (b) Diagnostic. (c) Predictive. (d) Prescriptive. (e) Predictive.',
      interpretation: 'The test is the question word: what happened, why, what will happen, or what should we do. Notice that (e) turns prescriptive as soon as it becomes a decision about whom to target. The same data can serve several kinds of question; the question decides the kind.' },

    { level: 'challenging', title: 'Unpicking a report', fictional: true,
      setup: 'Fernhill Outfitters, a fictional online clothing brand, receives a report from a junior analyst about its Ridge rain jacket. The report makes four claims. (1) Online sales of the Ridge fell from 1,250 in September to 1,000 in October. (2) The fall was caused by moving the Ridge from the home page to the rainwear page on 1 October. (3) If it stays off the home page, November’s sales will be about 800. (4) Fernhill should move it back to the home page. An appendix shows that the brand’s other rain jackets, none of which was ever on the home page, sold 3,000 in September and 2,460 in October. Which kind of analytics is each claim, and how much of the report should Fernhill believe?',
      steps: [
        'Label the claims. (1) is descriptive: a count of what happened. (2) is diagnostic: an explanation. (3) is predictive: a forecast. (4) is prescriptive: a recommended action. Each depends on the one before, so check them in order.',
        String.raw`Check the description. The fall is <m>1{,}250 - 1{,}000 = 250</m> jackets, and as a share of September’s sales <m>250 \div 1{,}250 = 0.20</m>: a fall of 20%. The arithmetic is right.`,
        String.raw`Test the diagnosis with a comparison. The other rain jackets, which did not move, fell by <m>3{,}000 - 2{,}460 = 540</m>, which is <m>540 \div 3{,}000 = 0.18</m>: 18%. Rain jackets in general sold less in October, perhaps because of the weather or the end of a promotion, so the page move cannot be the whole explanation.`,
        String.raw`Estimate how much the move might explain. Had the Ridge fallen by the same 18% as the others, October’s sales would have been about <m>1{,}250 \times 0.82 = 1{,}025</m>. Actual sales were 1,000, so the comparison suggests the move explains only about <m>1{,}025 - 1{,}000 = 25</m> of the 250 lost sales (an estimate that assumes the Ridge would otherwise have followed the other jackets), and even that could be chance.`,
        String.raw`Judge the forecast. The 800 assumes another 20% fall, <m>1{,}000 \times 0.8 = 800</m>, as if the page move would go on cutting sales month after month. Nothing in the evidence supports that pattern. A forecast should start from how rain-jacket sales usually move into November, and be given as a range.`,
        'Judge the recommendation. Moving the Ridge back might still be right, but home-page space has an <g>opportunity cost</g>: whatever is shown there now would lose its place. The evidence suggests the gain would be small. A cheap test, such as showing the Ridge on the home page to half of the site’s visitors for two weeks and comparing sales, would settle it.',
      ],
      answer: 'Claim (1) is descriptive and correct: a 20% fall. Claim (2) is diagnostic and mostly unsupported: comparable jackets fell 18%, so the comparison suggests the move explains only about 25 of the 250 lost sales, assuming the Ridge would otherwise have followed them. Claim (3) is a predictive extrapolation with no basis, and claim (4) is a prescription the evidence does not yet justify: test before deciding.',
      interpretation: 'The report’s arithmetic was right and its reasoning was not. The error entered at the diagnostic step, where a change was blamed on the most visible event without a comparison, and every later step inherited it. A comparison group is the cheapest protection against this mistake.' },

    { level: 'applied', title: 'How many gift boxes should Lantern assemble?', fictional: true,
      setup: 'On 20 November 2026 Ana must tell Lantern’s packing partner how many gift boxes to assemble for December; there is no time for a second batch. Gift-box orders were 6 in July, 7 in August, 5 in September and 9 in October, and November is running far ahead of October. The shop has no December history, so Ana sets out three scenarios for December’s gift-box orders, assuming for simplicity one box per order: 160 (probability 0.25), 240 (probability 0.5) or 320 (probability 0.25). Each box sold earns $24 more than it cost to assemble. Each box left over after Christmas loses $12, because the beans can be repacked but the box and the labour are lost. An order that finds no box left is lost. Should Ana have 160, 240 or 320 boxes assembled?',
      table: {
        caption: 'Profit from each option in each scenario, and its expected value (fictional)',
        head: ['Boxes assembled', 'Demand 160', 'Demand 240', 'Demand 320', 'Expected value'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['160', '$3,840', '$3,840', '$3,840', '$3,840'],
          ['240', '$2,880', '$5,760', '$5,760', '$5,040'],
          ['320', '$1,920', '$4,800', '$7,680', '$4,800'],
        ],
      },
      steps: [
        'Describe first. Gift-box orders of 6, 7, 5 and 9 from July to October show a flat, low level, and November’s jump says the gift season has begun. Nothing in the shop’s short history looks like December, which is why Ana needs scenarios rather than a single figure copied from the past.',
        String.raw`Work out each option in each scenario. With 240 boxes and demand of 160, Ana sells 160 and has 80 left over: <m>160 \times 24 - 80 \times 12 = 3{,}840 - 960 = 2{,}880</m> dollars. If demand is 240 or 320 she sells all 240: <m>240 \times 24 = 5{,}760</m>. With 160 boxes she always sells out: <m>160 \times 24 = 3{,}840</m>. With 320 boxes and demand of 240, <m>5{,}760 - 80 \times 12 = 4{,}800</m>; the other cells of the table follow in the same way.`,
        String.raw`Weight by the probabilities (the expected-value formula above). For 240 boxes: <m>0.25 \times 2{,}880 + 0.5 \times 5{,}760 + 0.25 \times 5{,}760 = 720 + 2{,}880 + 1{,}440 = 5{,}040</m> dollars. For 320: <m>0.25 \times 1{,}920 + 0.5 \times 4{,}800 + 0.25 \times 7{,}680 = 480 + 2{,}400 + 1{,}920 = 4{,}800</m>. For 160: $3,840 in every scenario.`,
        'Choose, and look at the risk. Assembling 240 boxes has the highest expected value. Its worst case, $2,880, is also better than the $1,920 worst case of assembling 320. Assembling 160 is the safest choice but gives up <m>5{,}040 - 3{,}840 = 1{,}200</m> dollars of expected profit.',
        String.raw`Measure afterwards. December’s gift-box orders turned out to be 231. Ana’s scenarios expected <m>0.25 \times 160 + 0.5 \times 240 + 0.25 \times 320 = 240</m> orders, so the forecast error was <m>231 - 240 = -9</m> orders, a percentage error of <m>-9 \div 231 \approx -3.9\%</m>: the forecast was slightly too high. With 240 boxes, 9 would have been left over.`,
      ],
      answer: 'Assemble 240 boxes: an expected profit of $5,040, against $4,800 for 320 boxes and $3,840 for 160. December’s 231 gift-box orders were 9 fewer than the scenarios’ expected 240, a forecast error of about −3.9%.',
      interpretation: 'The example uses three of the four kinds in order (a description of the season so far, a prediction in the form of scenarios and a prescription from expected values) and ends with the measure step of the process, which will improve next year’s scenarios. Diagnosis would come in if December surprised Ana. The recommendation depends on the inputs. If a leftover box lost more, or a sale earned less, fewer boxes would be best: try it in the explorer below.' },
  ],

  demo: [
    { widget: 'fka-gift-chart', intro: 'Descriptive analytics in one picture: Lantern’s gift-box orders in each month from July to December 2026, from the case. Look at what a forecaster in October would have had to go on, and why a seasonal business with less than a year of history needs scenarios rather than one number.' },
    { widget: 'fka-gift-stock', intro: 'Prescriptive analytics: the gift-box decision from the applied example. Change the number of boxes assembled and watch the expected profit; the chart shows the expected profit of every choice. Then raise the loss on a leftover box, or lower the profit on a sale, and see the best number of boxes move. Finally make the high scenario more likely.' },
  ],

  mistakes: [
    { title: '“Analytics means advanced models and software.”', html: 'Analytics is a process for making better decisions with data. Much of its value comes from correct, well-defined descriptive figures and simple comparisons. A model is only as good as the question it answers and the data it learns from.' },
    { title: '“Prescriptive is better than descriptive, so always aim for the top of the staircase.”', html: 'The kinds answer different questions; they are not grades of quality. If the question is whether the shop met its target, a careful comparison is the complete answer. Choose the kind the decision needs, and remember that every higher step inherits the errors of the steps below it.' },
    { title: '“The data show why it happened.”', html: 'Data show what happened, and patterns in them suggest explanations. An explanation becomes trustworthy only after it has been compared with the alternatives, ideally against a group that did not change. In the Fernhill example, a comparison with other jackets cut the supposed effect of the page move from 250 lost sales to about 25.' },
    { title: '“A forecast is a prediction of exactly what will happen.”', html: 'A forecast is an estimate under assumptions, and it is uncertain. Give a range or scenarios, say what the forecast assumes, and compare it with the actual afterwards. A single number with no range invites people to treat it as a promise.' },
    { title: '“Machine learning is a separate, fifth kind of analytics.”', html: 'Machine learning is a set of methods used inside the four kinds, most often for prediction. It does not replace a clear question, trustworthy data or an honest check of how well it performs on new cases.' },
    { title: '“Once the decision is made, the analysis is finished.”', html: 'The last step of the process is to measure what happened and compare it with what was expected. Skipping it means forecasts never improve and decisions are never learned from.' },
  ],

  application: [
    { case: 'Seagrass Hotel, the fictional 90-room hotel from F00, employs a revenue manager, Tomás, whose job is to decide what to charge for each room on each night. His Monday morning shows all four kinds of analytics, in order.' },
    { p: String.raw`<b>Descriptive.</b> Tomás starts with last week’s report. The hotel had <m>90 \times 7 = 630</m> room-nights to sell and sold 520, an occupancy of <m>520 \div 630 \approx 82.5\%</m>. He compares that with the same week last year and with the budget, and he checks the average price per room-night sold. The report is only useful because the hotel defines its terms the same way every week: a room-night counts when a guest stays, not when it is booked, and complimentary rooms are counted separately.` },
    { p: '<b>Diagnostic.</b> One line stands out: rooms sold to companies on Tuesday and Wednesday nights are down. He drills down by company and finds that most of the fall comes from one client whose contract ended in the summer. He checks the other company clients, which are steady, so the fall is not a general slowdown in business travel. That diagnosis matters, because the right response to losing one client differs from the right response to a falling market.' },
    { p: '<b>Predictive.</b> His booking system forecasts how many rooms will be sold on each of the next 90 nights, from the bookings already made and from how bookings usually build up as each night approaches. Each forecast comes with a range. Last week the system forecast 480 room-nights and the hotel sold 520, a forecast error of <m>520 - 480 = 40</m>, or about 7.7% of the actual. Tomás watches these errors week by week; if the forecasts are always too low on, say, Sundays, he knows to treat them with suspicion.' },
    { p: '<b>Prescriptive.</b> The system then recommends a price for each night: higher where the forecast says the hotel will fill anyway, lower or with special offers where rooms are likely to stay empty. Tomás accepts most recommendations and overrides a few, for example for a medical conference in town that the system’s history knows nothing about. He records each override and his reason, so that next month he can see whether his judgement or the system did better.' },
    { p: '<b>Measure.</b> Next Monday the cycle begins again with the new week’s actual results, which also judge last week’s forecasts and prices. The tools differ in every industry: a hospital forecasts arrivals at its emergency department to roster nurses, an airline sets fares as each flight fills, a clothing brand predicts which orders will be returned. The sequence does not: get the facts right, explain what changed, estimate what comes next, choose, and check.' },
  ],

  summary: [
    'Analytics is the process of turning data into insight for better decisions; data, people and decisions are all needed.',
    'Descriptive analytics asks what happened, diagnostic why, predictive what will happen, and prescriptive what should be done.',
    'A real decision usually uses several kinds in turn, and each inherits the errors of the steps before it.',
    'Moving from description to prescription usually adds value and difficulty, but the kinds are not grades of quality: choose the one the decision needs.',
    'Predictions are uncertain: give ranges or scenarios and measure the forecast error afterwards. Expected value turns scenarios into a comparison of options.',
    'Machine learning is a set of methods used inside the four kinds, mostly for prediction, not a fifth kind.',
    'The analytics process runs question, data, analysis, decision, measure, and the measured result feeds the next question.',
  ],

  glossary: [
    { term: 'Analytics', def: 'The scientific process of transforming data into insight for making better decisions (the definition INFORMS published in 2012).' },
    { term: 'Business analytics', def: 'Analytics applied to the decisions of a business, such as what to sell, at what price, to whom, through which channel and with how much stock.' },
    { term: 'Descriptive analytics', def: 'Analytics that answers “what happened?” by summarising past data into counts, totals, averages, rates, comparisons and charts.' },
    { term: 'Diagnostic analytics', def: 'Analytics that answers “why did it happen?” by breaking results into parts, comparing groups and periods, and testing possible explanations.' },
    { term: 'Predictive analytics', def: 'Analytics that answers “what will happen?” by using past patterns to estimate future or unknown values, such as a forecast of demand or the probability that a customer orders again.' },
    { term: 'Prescriptive analytics', def: 'Analytics that answers “what should we do?” by combining predictions with the options, costs, constraints and goals of a decision to recommend an action.' },
    { term: 'Forecast', def: 'An estimate, made in advance, of a future value such as next month’s orders. Because it is uncertain, it is best given with a range or as scenarios.' },
    { term: 'Forecast error', def: 'The actual value minus the forecast, once the actual is known. A positive error means the forecast was too low.' },
    { term: 'Scenario', def: 'One possible future, described by the values of the uncertain inputs (such as low, medium or high demand), often with a probability attached.' },
    { term: 'Optimisation', def: 'Finding the choice that gives the best value of a goal, such as the highest profit or the lowest cost, while meeting the constraints on the decision.' },
    { term: 'Machine learning', def: 'Methods in which a computer fits a model to data, learning a relationship between inputs and an outcome from examples rather than from rules written by a person. Supervised learning learns from examples with known outcomes; unsupervised learning looks for structure, such as groups, without them.' },
    { term: 'Analytics process', def: 'The five steps of an analysis used in this course: question, data, analysis, decision and measure, repeated as each measured result raises the next question.' },
  ],

  references: [
    { text: 'Boyd, A. (2012, 6 August). Revisiting “what is analytics”. <i>Analytics</i> magazine. INFORMS.', url: 'https://pubsonline.informs.org/do/10.1287/LYTX.2012.04.09/full', checked: '2026-10-23' },
    { text: 'INFORMS. “Operations Research &amp; Analytics” (descriptive, predictive and prescriptive analytics).', url: 'https://www.informs.org/About-INFORMS/What-is-Analytics', checked: '2026-10-23' },
    { text: 'TDWI. “What Is Diagnostic Analytics?” <i>TDWI Glossary</i>.', url: 'https://tdwi.org/pages/glossary/diagnostic-analytics.aspx', checked: '2026-10-23' },
    { text: 'eSchool Media Contributors (2021, 14 May). “3 questions to ask when embracing an analytics model”. <i>eCampus News</i>.', url: 'https://www.ecampusnews.com/campus-leadership/2021/05/14/3-questions-to-ask-when-embracing-an-analytics-model/', checked: '2026-10-23' },
    { text: 'Ault, S. V., Liao, S. N. &amp; Musolino, L. (2025). <i>Principles of Data Science</i>, section 1.1, “What Is Data Science?” OpenStax.', url: 'https://openstax.org/books/principles-data-science/pages/1-1-what-is-data-science', checked: '2026-10-23' },
    { text: 'Ault, S. V., Liao, S. N. &amp; Musolino, L. (2025). <i>Principles of Data Science</i>, section 6.1, “What Is Machine Learning?” OpenStax.', url: 'https://openstax.org/books/principles-data-science/pages/6-1-what-is-machine-learning', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'August web orders (case.js)', value: SHOP.webOrders[1], shown: 224 },
    { what: 'August app orders (case.js)', value: SHOP.appOrders[1], shown: 92 },
    { what: 'August orders, both channels', value: SHOP.webOrders[1] + SHOP.appOrders[1], shown: 316 },
    { what: 'September orders below August (case.js)', value: (SHOP.webOrders[2] + SHOP.appOrders[2]) < (SHOP.webOrders[1] + SHOP.appOrders[1]) ? 1 : 0, shown: 1 },
    { what: 'September visits above August (case.js)', value: (SHOP.webVisits[2] + SHOP.appVisits[2]) > (SHOP.webVisits[1] + SHOP.appVisits[1]) ? 1 : 0, shown: 1 },
    { what: 'Gift-box orders July (case.js)', value: SHOP.giftBoxOrders[0], shown: 6 },
    { what: 'Gift-box orders August (case.js)', value: SHOP.giftBoxOrders[1], shown: 7 },
    { what: 'Gift-box orders September (case.js)', value: SHOP.giftBoxOrders[2], shown: 5 },
    { what: 'Gift-box orders October (case.js)', value: SHOP.giftBoxOrders[3], shown: 9 },
    { what: 'Gift-box orders December (case.js)', value: SHOP.giftBoxOrders[5], shown: 231 },
    { what: 'November far ahead of October (case.js)', value: SHOP.giftBoxOrders[4] > 5 * SHOP.giftBoxOrders[3] ? 1 : 0, shown: 1 },
    { what: 'Fernhill: Ridge fall', value: 1250 - 1000, shown: 250 },
    { what: 'Fernhill: Ridge fall as a share', value: (1250 - 1000) / 1250, shown: 0.2 },
    { what: 'Fernhill: other jackets fall', value: 3000 - 2460, shown: 540 },
    { what: 'Fernhill: other jackets fall as a share', value: (3000 - 2460) / 3000, shown: 0.18 },
    { what: 'Fernhill: expected October at 18% fall', value: 1250 * (1 - (3000 - 2460) / 3000), shown: 1025 },
    { what: 'Fernhill: share 0.82', value: 1 - 0.18, shown: 0.82 },
    { what: 'Fernhill: most the move could explain', value: 1250 * 0.82 - 1000, shown: 25 },
    { what: 'Fernhill: naive November forecast', value: 1000 * 0.8, shown: 800 },
    { what: 'Gift boxes: 160 boxes, every scenario', value: 160 * 24, shown: 3840 },
    { what: 'Gift boxes: 240 boxes, demand 160', value: 160 * 24 - 80 * 12, shown: 2880 },
    { what: 'Gift boxes: 240 boxes, leftover at demand 160', value: 240 - 160, shown: 80 },
    { what: 'Gift boxes: 80 leftovers cost', value: 80 * 12, shown: 960 },
    { what: 'Gift boxes: 240 boxes, demand 240 or 320', value: 240 * 24, shown: 5760 },
    { what: 'Gift boxes: 320 boxes, demand 160', value: 160 * 24 - 160 * 12, shown: 1920 },
    { what: 'Gift boxes: 320 boxes, demand 240', value: 240 * 24 - 80 * 12, shown: 4800 },
    { what: 'Gift boxes: 320 boxes, demand 320', value: 320 * 24, shown: 7680 },
    { what: 'Gift boxes: EV of 240, first term', value: 0.25 * 2880, shown: 720 },
    { what: 'Gift boxes: EV of 240, second term', value: 0.5 * 5760, shown: 2880 },
    { what: 'Gift boxes: EV of 240, third term', value: 0.25 * 5760, shown: 1440 },
    { what: 'Gift boxes: EV of 240', value: 0.25 * (160 * 24 - 80 * 12) + 0.5 * 240 * 24 + 0.25 * 240 * 24, shown: 5040 },
    { what: 'Gift boxes: EV of 320, first term', value: 0.25 * 1920, shown: 480 },
    { what: 'Gift boxes: EV of 320, second term', value: 0.5 * 4800, shown: 2400 },
    { what: 'Gift boxes: EV of 320, third term', value: 0.25 * 7680, shown: 1920 },
    { what: 'Gift boxes: EV of 320', value: 0.25 * (160 * 24 - 160 * 12) + 0.5 * (240 * 24 - 80 * 12) + 0.25 * 320 * 24, shown: 4800 },
    { what: 'Gift boxes: EV of 160', value: 160 * 24, shown: 3840 },
    { what: 'Gift boxes: expected profit given up by 160', value: 5040 - 3840, shown: 1200 },
    { what: 'Gift boxes: expected demand', value: 0.25 * 160 + 0.5 * 240 + 0.25 * 320, shown: 240 },
    { what: 'Gift boxes: forecast error', value: SHOP.giftBoxOrders[5] - (0.25 * 160 + 0.5 * 240 + 0.25 * 320), shown: -9 },
    { what: 'Gift boxes: percentage error', value: (SHOP.giftBoxOrders[5] - 240) / SHOP.giftBoxOrders[5] * 100, shown: -3.9, tol: 0.05 },
    { what: 'Gift boxes: leftovers with 240', value: 240 - SHOP.giftBoxOrders[5], shown: 9 },
    { what: 'Seagrass: room-nights available', value: 90 * 7, shown: 630 },
    { what: 'Seagrass: occupancy', value: 520 / 630 * 100, shown: 82.5, tol: 0.05 },
    { what: 'Seagrass: forecast error', value: 520 - 480, shown: 40 },
    { what: 'Seagrass: percentage error', value: (520 - 480) / 520 * 100, shown: 7.7, tol: 0.05 },
  ],
};
