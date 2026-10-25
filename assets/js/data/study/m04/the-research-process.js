// the-research-process.js — M04 · The research process. Content only; exercises are in the-research-process.ex.js.
// Lantern facts come from ./case.js (fictional) and B04's survey plan; `checks` recompute them. Ana's planning figures for
// the Cold Brew decision, the research costs and the brief's wording are new and fictional (this lesson only). Tallowfield
// Bakery and Ferrow Buses are fictional.
import { SIZES, STRATA, SURVEY_2027, FOCUS_GROUPS, SUBSCRIBER_SURVEY, SURVEY_PLAN, MAILING_LIST, DEFAULT_PLAN, CLIENT_INTERVIEWS } from './case.js?v=14';
import { DERIVED as B04 } from '../b04/case.js?v=14';

const f = (n) => n.toLocaleString('en-US');
const PLAN = B04.project.surveyPlan;                       // 601 replies, 2,004 invitations
const [GA, GB] = FOCUS_GROUPS.groups;

// Tallowfield Bakery (simple example): two options, two states
const TB = { gain: 36000, loss: 24000, p: 0.5, agency: 14000, own: 1500 };
const tbEv = TB.p * TB.gain - (1 - TB.p) * TB.loss;
const tbPerfect = TB.p * TB.gain + (1 - TB.p) * 0;
// Ana's rough Cold Brew figures (challenging example and the explorer's defaults): first-year results, $
const CB = { p: 0.5, launch: [90000, -70000], own: [20000, -5000], wait: [0, 0] };
const ev = (o, p = CB.p) => p * o[0] + (1 - p) * o[1];
const cbBest = Math.max(ev(CB.launch), ev(CB.own), ev(CB.wait));
const cbPerfect = CB.p * Math.max(CB.launch[0], CB.own[0], CB.wait[0]) + (1 - CB.p) * Math.max(CB.launch[1], CB.own[1], CB.wait[1]);
const cbEvpi = cbPerfect - cbBest;
// the research plan's cost (fictional): moderator, agency recruitment of group B, incentives, rooms, transcripts, survey tool
const COST = { moderator: 2600, recruit: 150 * GB.participants, incentives: 75 * (GA.participants + GB.participants), rooms: 2 * 500, transcripts: 600, tool: 425 };
const cost = Object.values(COST).reduce((a, b) => a + b, 0);
// the brief's action standard for objective 1 (weighted top-two-box share of the list, %): fictional, set before fieldwork
const AS = { high: 45, low: 30 };
// where the explorer's EVPI peaks with the default figures, on its 1% grid
const evpiPeak = Array.from({ length: 101 }, (_, i) => i / 100).map((p) => ({ p, evpi: p * CB.launch[0] - Math.max(ev(CB.launch, p), ev(CB.own, p), 0) })).reduce((a, b) => (b.evpi > a.evpi ? b : a));

const box = (x, y, title, sub, lesson) => `<rect x="${x}" y="${y}" width="168" height="80" rx="8" style="fill:none;stroke:var(--series-1);stroke-width:2"/>`
  + `<text x="${x + 84}" y="${y + 25}" text-anchor="middle" font-weight="700" fill="currentColor">${title}</text>`
  + `<text x="${x + 84}" y="${y + 45}" text-anchor="middle" font-size="12" fill="currentColor">${sub}</text>`
  + `<text x="${x + 84}" y="${y + 65}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${lesson}</text>`;
const PROCESS = '<svg viewBox="0 0 714 290" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + '<defs><marker id="rp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--rule-strong)"/></marker></defs>'
  + box(6, 20, '1 Define the problem', 'decision and objectives', 'this lesson')
  + box(184, 20, '2 Plan the research', 'brief, proposal, design', 'this lesson')
  + box(362, 20, '3 Choose the data', 'secondary, then primary', 'Modules 1 and 2')
  + box(540, 20, '4 Design the sample', 'who, how many, how chosen', 'sampling methods')
  + box(540, 190, '5 Collect the data', 'fieldwork and response', 'survey error')
  + box(362, 190, '6 Analyse the data', 'estimates and themes', 'analysing survey data')
  + box(184, 190, '7 Report and act', 'findings, limits, action', 'insights and reporting')
  + ['M174 60H182', 'M352 60H360', 'M530 60H538', 'M624 100V188', 'M540 230H532', 'M362 230H354']
    .map((d) => `<path d="${d}" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5" marker-end="url(#rp-arrow)"/>`).join('')
  + '<path d="M184 230H90V102" style="fill:none;stroke:var(--series-2);stroke-width:1.5;stroke-dasharray:5 3" marker-end="url(#rp-arrow)"/>'
  + '<text x="98" y="150" font-size="12" fill="currentColor">the result shapes</text><text x="98" y="166" font-size="12" fill="currentColor">the next question</text>'
  + '</svg>';

export default {
  slug: 'the-research-process',
  title: 'The research process',
  blurb: 'Research earns its cost only through a decision. Learn to turn a business decision into a research problem and measurable objectives, choose an exploratory, descriptive or causal design, write a brief and read a proposal, put a ceiling on what research is worth, and follow the professional codes that protect the people you study.',
  status: 'reviewed',
  objectives: [
    'Distinguish a decision problem from a research problem, and write research objectives that are specific, measurable and tied to an action.',
    'Choose an exploratory, descriptive or causal design for a research objective, and explain what each can and can’t deliver.',
    'Describe the steps of a research project and the contents of a research brief and a research proposal.',
    'Calculate the expected value of perfect information for a decision, and use it with the “could it change the decision?” test to judge whether research is worth its cost.',
    'Apply the main rules of the ICC/ESOMAR, MRS and Insights Association codes: informed consent, the right to withdraw, privacy, no selling under the guise of research, honest reporting and research with children.',
  ],
  prerequisites: [
    { lesson: 'b01/business-questions', why: 'A research objective is a decision-focused question made measurable; that lesson introduced hypotheses too.' },
    { lesson: 'b01/data-collection', why: 'You need primary and secondary data, experiments and the outline of consent and personal data under the UK GDPR.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Valuing research uses the expected value of an uncertain outcome.' },
    { lesson: 'b04/confidence-intervals', why: 'Lantern’s survey plan comes from the sample-size calculation in that lesson.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is the end of January 2027, and Ana Lim has two questions for Lantern Coffee Co.’s year. The first is Lantern Cold Brew, the 250 ml can planned in M02 at $${DEFAULT_PLAN.price.toFixed(2)}: should she launch it this summer in supermarkets, natural and specialty grocers and Lantern’s own channel, as the launch plan proposes? The second is how customers see Lantern after its first year: whether they would recommend it, how they found it and what it should do better. She has about $7,000 she could spend on research before the end of April, a mailing list of ${f(MAILING_LIST)} people and no time for studies that won’t change what she does.` },
    { p: '<g>Marketing research</g> is the systematic planning, collection, analysis and reporting of information about customers, markets and competitors, to help make a marketing decision. OpenStax’s <i>Principles of Marketing</i> quotes the American Marketing Association’s description of it as the function that links consumers, customers and the public to the marketer through information. The word that matters is decision. Research that informs no decision is an expense, however interesting its findings; research that starts from a decision knows what to measure, how precisely and by when.' },

    { h: 'From a decision to a research problem' },
    { p: 'Every project starts by separating two problems that are easy to confuse. The <g>decision problem</g> is the choice a manager faces, stated as the actions on the table: launch Cold Brew in all three channels, sell it only through Lantern’s own channel for a year, or wait. The <g>research problem</g> is what the manager needs to find out to make that choice well: how many people would buy the can at its price, which people, and what would put the others off. A decision problem asks “what should we do?”; a research problem asks “what do we need to know?”' },
    { p: `The research problem is then broken into <g>research objectives</g>: specific, measurable statements of what the study will deliver. “Find out what customers think of Cold Brew” is a topic, not an objective. “Estimate, to within about ±${SURVEY_PLAN.margin * 100} percentage points, the share of Lantern’s mailing list who would definitely or probably buy Cold Brew at $${DEFAULT_PLAN.price.toFixed(2)} in the next three months” is an objective: it names the population, the measure and the precision, and its answer bears on the launch. Where earlier evidence suggests an answer, state it as a <g>hypothesis</g>, such as “subscribers are more likely than newsletter-only contacts to say they would buy”, so that the data can show it to be wrong.` },
    { p: 'A good test of each objective is to ask what you would do with each possible answer. If Ana would launch whether 20% or 60% of her list said they would buy, the question isn’t worth asking, or it is being asked of the wrong people. It is the test of B01’s <g>decision-focused question</g>: different answers must lead to different actions.' },

    { h: 'Three kinds of design' },
    { p: 'The objectives decide the design: the overall plan for collecting and analysing the data. Textbooks group designs into three kinds by what they can deliver; OpenStax adds ethnographic research as a fourth, which this course treats as one of the exploratory methods.' },
    { table: {
      caption: 'Three research designs and what each delivers',
      head: ['Design', 'What it is for', 'Typical methods', 'What it delivers', 'Lantern in 2027'],
      rows: [
        ['Exploratory', 'Understanding a problem; ideas and hypotheses', 'Secondary data, depth interviews, focus groups, observation', 'Themes, explanations, better questions', 'The March focus groups on Cold Brew'],
        ['Descriptive', 'Measuring how many, how often, who', 'Surveys of a planned sample; records', 'Estimates with a margin of error', 'The February customer survey'],
        ['Causal', 'Testing whether a change causes an effect', 'Experiments: A/B tests, test markets', 'The size of the effect, apart from chance', 'Not planned yet; M08 and B12 teach experiments'],
      ],
    } },
    { p: '<g>Exploratory research</g> helps you understand a problem and generate hypotheses, with flexible, small-scale methods such as depth interviews (one-to-one conversations following a guide) and focus groups (moderated discussions in a small group), which the qualitative-research lesson teaches. <g>Descriptive research</g> measures the characteristics of a population or market, usually with a survey of a planned sample. <g>Causal research</g> tests whether changing one thing causes a change in another, by making the change for a randomly chosen group and comparing the outcome with a <g>control group</g>, as in B01’s <g>A/B test</g>.' },
    { p: 'Projects often run the three in sequence: explore to learn what to ask, describe to measure how common each answer is, and test cause only for the few changes worth an experiment. Ana’s plan runs partly the other way. The survey goes out first because B04 planned it and the list is ready, and the focus groups follow to explore what the survey can’t: why people would or wouldn’t buy. Either order works if each design is used for what it can do.' },
    { callout: 'key', title: 'Research is for decisions', html: 'Before anything is collected, write down the decision, the options and the result that would favour each. If no plausible result would change what you do, the research isn’t worth doing, however interesting it sounds.' },
  ],

  theory: [
    { h: 'The steps of a research project' },
    { p: 'OpenStax’s <i>Principles of Marketing</i> sets out seven steps, and this course follows them. The figure shows them with the part of M04 that teaches each one.' },
    { figure: {
      svg: PROCESS,
      caption: 'The seven steps of a research project, after OpenStax’s <i>Principles of Marketing</i>. The dashed arrow is the loop: what a study finds, and what the decision then teaches, shape the next question.',
      alt: 'Seven boxes joined by arrows in a snake: four across the top from left to right, then down, then three along the bottom from right to left. Box 1, “Define the problem: decision and objectives”, taught in this lesson. Box 2, “Plan the research: brief, proposal, design”, this lesson. Box 3, “Choose the data: secondary, then primary”, Modules 1 and 2. Box 4, “Design the sample: who, how many, how chosen”, the sampling methods lesson. Box 5, “Collect the data: fieldwork and response”, the survey error lesson. Box 6, “Analyse the data: estimates and themes”, the analysing survey data lesson. Box 7, “Report and act: findings, limits, action”, the insights and reporting lesson. A dashed arrow runs from box 7 back up to box 1, labelled “the result shapes the next question”.',
    } },
    { ol: [
      '<b>Define the problem.</b> The decision problem, the research problem and the objectives, and the population the decision is about.',
      '<b>Develop the research plan.</b> The design, the data, the timetable and the budget, agreed through a brief and a proposal.',
      '<b>Select the data collection method.</b> Secondary data first, then primary data by survey, interviews, groups, observation or experiment.',
      '<b>Design the sample.</b> Whom to ask, how many, and how to choose them.',
      '<b>Collect the data.</b> Fieldwork, with a record of who responded and who didn’t.',
      '<b>Analyse and interpret the data.</b> Estimates with their margins of error; themes from what people said.',
      '<b>Prepare the research report.</b> Findings, their limits and what they mean for the decision.',
    ] },
    { p: 'The steps are a checklist, not a one-way street. A pretest can send you back to the objectives, a poor response rate to the sample, and a surprising finding to a new exploratory study.' },

    { h: 'Primary or secondary data' },
    { p: 'Step 3 starts with a choice B01 introduced: <g>secondary data</g>, which already exists because it was collected for another purpose, or <g>primary data</g>, collected for the question at hand. OpenStax’s comparison is the usual one. Primary data can be structured to be exactly what is needed but is expensive to collect; secondary data is generally inexpensive or free but can be outdated, and it was defined for someone else’s purpose. So professionals search secondary sources first and collect primary data only for what remains, which is the subject of the next lesson.' },

    { h: 'Matching the design to the objective' },
    { p: 'Read the verb in each objective. “Why”, “what would make” and “which ideas” call for exploratory work: the answer is a set of explanations, and a dozen well-chosen conversations beat a thousand ticked boxes. “How many”, “what share” and “how often” call for descriptive work, and the sample must be chosen so that it stands for the population; Module 2 shows how.' },
    { p: '“Does X cause Y”, “will changing X raise Y” and “which version works better” call for an experiment. A survey may find that people who like the can are more likely to say they would buy, but that is an association, not proof that a better can would sell more: as B01’s interpreting-results lesson showed, other differences between the two groups could explain it. Only a design in which chance decides who gets the change separates its effect from everything else.' },

    { h: 'The brief and the proposal' },
    { p: 'A study is usually agreed through two documents. The <g>research brief</g> is written by the client, the person or team who will act on the results, whether a manager is briefing an agency or a colleague in the business’s own research team. The <g>research proposal</g> is the researcher’s answer: how the study will meet the brief, at what cost and by when. The brief says what is needed and why; the proposal says how.' },
    { table: {
      caption: 'What a research brief and a research proposal contain',
      head: ['Part', 'The brief (client)', 'The proposal (researcher)'],
      rows: [
        ['Background', 'The business, the market, what has happened', 'The researcher’s understanding of it, and any gaps'],
        ['Decision', 'The decision, the options and when it must be made', 'The decision restated, sometimes more sharply'],
        ['What is known', 'Earlier research and internal data', 'What secondary sources add'],
        ['Objectives', 'What the client needs to know', 'Research objectives and questions, with hypotheses'],
        ['Method', 'Constraints: a list to use, people not to contact', 'Design, data collection, sample, outline questionnaire or discussion guide, analysis'],
        ['Practicalities', 'Timing and budget', 'Timetable, cost, team, deliverables'],
        ['Use of results', 'How the results will be used; any action standards', 'How the results will be reported'],
        ['Ethics', 'What data the client can share, and on what legal basis', 'Consent, privacy, data protection, special groups'],
      ],
    } },
    { p: 'Two items in the brief do most to keep research useful. The first is the decision with its deadline: a report that arrives after the decision has been taken is worth nothing. The second is an <g>action standard</g>: a result agreed in advance that will lead to a stated decision, such as “go ahead if at least 30% of target buyers say they would definitely buy”. Agreeing it before the data arrive stops everyone from reading the result in the light of what they already wanted to do.' },

    { h: 'What research is worth' },
    { p: 'Research costs money and time, and it can add value only through the decision, by making a better choice more likely. That gives two tests. First, could any plausible result change the decision? If not, the research is worth nothing to it. Second, is its cost below what a better decision could gain?' },
    { p: 'The second test has a ceiling you can calculate. List each option’s payoff in each possible state of the market and the probability you give each state now. The <g>expected value</g> of an option, as F00 defined it, weights each payoff by its probability; without research you choose the option with the highest expected value. With perfect information you would learn the state first and choose the best option for it. The gain from choosing that way is the <g>expected value of perfect information</g> (EVPI).' },
    { p: 'No real study is perfect: a survey of intentions can say demand looks strong when it isn’t. So the EVPI is a ceiling on what any research can be worth to the decision, not a forecast of what a particular study will return. A study that costs more than the EVPI can’t pay for itself; one that costs less might, if it is good enough to change the choice. The ceiling is highest when the stakes are large and the options’ expected values are close, which is exactly when the decision is hardest.' },

    { h: 'In-house or agency' },
    { p: 'Lantern has no research department, so Ana must decide who does each part. An agency brings trained moderators and interviewers, recruiters who can find people the client can’t reach, access to panels, capacity and independence from the client’s hopes. Doing the work in-house is cheaper and quicker to start, and it keeps customer data and plans inside the business, but it needs the skills, the time and the discipline to report results the owner won’t like. Many studies mix the two: the client runs what it can and buys the specialised parts.' },

    { h: 'Ethics in market research' },
    { p: 'Market research depends on people being willing to take part and on the public trusting that research is what it says it is. Three professional codes set the rules most researchers work under: the ICC/ESOMAR International Code on Market, Opinion and Social Research and Data Analytics, issued jointly by the International Chamber of Commerce and ESOMAR and revised in 2025; the Market Research Society’s Code of Conduct in the UK (2023); and the Insights Association’s Code of Standards and Ethics for Market Research and Data Analytics in the US. The ICC/ESOMAR code’s first principle sums them up: “All research must be legal, honest, transparent and truthful.”' },
    { p: '<b>Informed consent and the right to withdraw.</b> <g>Informed consent</g> is a participant’s voluntary agreement to take part, given after being told who is doing the research, what it involves and how their data will be used. The ICC/ESOMAR code requires researchers to identify themselves promptly, to make participation voluntary and based on clear and accurate information, and to let people withdraw from the research at any time. The MRS code requires participants to be told of their right to withdraw at any time, and the Insights Association’s code says researchers must respect the right to refuse or to stop taking part.' },
    { p: '<b>Privacy and data protection.</b> Survey answers linked to a name or an e-mail address are <g>personal data</g>, so the data-protection law outlined in B01 applies, including its rules on <g>consent</g> where that is the legal basis. The ICC/ESOMAR code adds data minimisation: collect only personal data that is reasonable and directly relevant to the research. Researchers also promise <g>confidentiality</g> (they know who answered but don’t reveal it) or <g>anonymity</g> (they collect nothing that identifies anyone), a distinction OpenStax draws; the two promises are not the same, so make only the one you can keep.' },
    { p: '<b>No selling under the guise of research.</b> <g>Sugging</g>, selling under the guise of research, is contacting people as if for research in order to sell to them or to collect sales leads. The MRS code gives it as an example of the activities under the guise of research that its rules forbid; the ICC/ESOMAR code requires a clear distinction between research and non-research activities; and the Insights Association’s code requires the two to be kept separate. That code allows incentives only to encourage people to take part: a thank-you for answering is one thing, a sales offer inside the questionnaire another.' },
    { p: '<b>Honest reporting.</b> The ICC/ESOMAR code makes the client and the researcher jointly responsible for ensuring that published results are not misleading. The MRS code requires findings to be clearly supported by the data and not presented misleadingly, and the Insights Association’s code requires public releases to be accurate and corrected promptly if wrong. A client may decide not to publish a study at all; publishing only its flattering half, so that the published result misleads, is a different matter.' },
    { p: '<b>Children.</b> All three codes require consent from a parent or responsible adult before children take part, but they define a child differently, as the table shows.' },
    { table: {
      caption: 'Research with children in three codes',
      head: ['Code', 'Who counts as a child', 'Consent needed'],
      rows: [
        ['ICC/ESOMAR (2025)', '12 and under; those aged 13 to 17 are “young persons”, who need special care', 'A parent, legal guardian or responsible adult, whenever children are involved'],
        ['MRS, UK (2023)', 'Under 16', 'A responsible adult’s permission, obtained and verified before the child takes part'],
        ['Insights Association, US', 'Set by the law that applies', 'Verifiable consent from a parent or legal guardian where it is required'],
      ],
    } },
    { callout: 'warn', title: 'Check the code that applies to you', html: 'The codes agree on principles and differ in detail, and national law comes first. Read the code of the association you or your agency belong to and the law where your participants live. Ana’s survey offers no age group below 18, so its invitation should say that it is for adults only.' },
  ],

  formulas: [
    { id: 'rp-expected-value', name: 'Expected value of an option',
      tex: String.raw`E[V(a)] = \sum_{s} p_s \, V(a, s)`,
      where: [
        [String.raw`E[V(a)]`, 'Expected value of choosing option a', '$'],
        [String.raw`a`, 'An option the decision maker could choose, such as launching or waiting', ''],
        [String.raw`s`, 'A possible state of the market, such as strong or weak demand', ''],
        [String.raw`p_s`, 'Probability given to state s now; the probabilities add up to 1', ''],
        [String.raw`V(a, s)`, 'Payoff of option a if state s occurs (negative for a loss)', '$'],
      ],
      assumptions: 'The states cover every outcome, and the probabilities and payoffs are the decision maker’s best estimates. Choosing by expected value ignores attitudes to risk.',
      note: 'The same formula as F00’s expected value of an uncertain outcome, applied to each option in turn.' },
    { id: 'rp-evpi', name: 'Expected value of perfect information',
      tex: String.raw`\text{EVPI} = \sum_{s} p_s \max_{a} V(a, s) \; - \; \max_{a} \sum_{s} p_s \, V(a, s)`,
      where: [
        [String.raw`\text{EVPI}`, 'The most that information removing all uncertainty about the state could be worth to the decision', '$'],
        [String.raw`a`, 'An option', ''],
        [String.raw`s`, 'A state of the market', ''],
        [String.raw`p_s`, 'Probability of state s before any research', ''],
        [String.raw`V(a, s)`, 'Payoff of option a in state s', '$'],
      ],
      assumptions: 'The first term chooses the best option after learning the state; the second chooses the best option on expected value without knowing it. The payoffs and probabilities are estimates.',
      note: 'EVPI is never negative. Real research is imperfect and is worth no more than perfect information, and usually less; a study that costs more than the EVPI can’t pay for itself.' },
  ],

  examples: [
    { level: 'simple', title: 'Is a café-area study worth buying?', fictional: true,
      setup: `Tallowfield Bakery is deciding whether to turn its storeroom into a 20-seat café area. Its owner estimates that over two years the café area would add $${f(TB.gain)} of profit if demand is strong and lose $${f(TB.loss)} if it is weak (fit-out, staff and lost storage), and she puts the chance of strong demand at ${TB.p * 100}%. Keeping the storeroom changes nothing ($0). A local agency offers a study for $${f(TB.agency)}; a survey of her regular customers, run by the bakery itself, would cost about $${f(TB.own)}. Is either worth doing?`,
      steps: [
        String.raw`Expected value of each option (the first formula): café area <m>0.5 \times 36{,}000 + 0.5 \times (-24{,}000) = 6{,}000</m> dollars; storeroom $0. Without research she would build the café area, expecting $6,000.`,
        String.raw`With perfect information she would learn the state first and choose for it: build if demand is strong ($36,000), keep the storeroom if it is weak ($0). Expected value: <m>0.5 \times 36{,}000 + 0.5 \times 0 = 18{,}000</m> dollars.`,
        String.raw`EVPI (the second formula): <m>18{,}000 - 6{,}000 = 12{,}000</m> dollars, the most any study of demand could be worth to this decision.`,
        'Apply the two tests. Could a result change the decision? Yes: evidence of weak demand would stop the build and avoid a $24,000 loss. Is the cost below the ceiling? The agency’s $14,000 is above $12,000, so it can’t pay for itself however good it is; the $1,500 survey is well below it.',
        'Judge the cheap study. A survey of regulars reaches people already in the shop, part of the market but not all of it (B01’s survivorship warning). It is worth running if it asks about the behaviour that matters, such as how often regulars would stay to eat, and if the owner decides beforehand which answer would stop the build.',
      ],
      answer: 'Building now has an expected value of $6,000; with perfect information it would be $18,000, so information about demand is worth at most $12,000. The $14,000 agency study fails the test; the $1,500 survey passes it, and its result could change the decision.',
      interpretation: 'The ceiling doesn’t promise that the survey will return $10,500: real research is imperfect and worth no more than perfect information, and usually less. It shows what the decision can afford, and it rules the expensive study out before anyone argues about its quality.' },

    { level: 'challenging', title: 'What could research be worth to the Cold Brew decision?', fictional: true,
      setup: `Before commissioning anything, Ana writes down rough planning figures for the Cold Brew decision (fictional, for this lesson). She sees three options and two states of demand: strong (the launch reaches her first-year sales goal) or weak (it falls well short), and she puts the chance of strong demand at ${CB.p * 100}%. The table gives each option’s first-year result. The February survey and the March focus groups together would cost $${f(cost)}. Find the best option without research and the most that research could be worth, and judge whether the plan is justified.`,
      table: {
        caption: 'Ana’s rough first-year results for Lantern Cold Brew (fictional)',
        head: ['Option', 'Strong demand', 'Weak demand'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Launch in all three planned channels', `+$${f(CB.launch[0])}`, `−$${f(-CB.launch[1])}`],
          ['Sell only through Lantern’s own channel for a year', `+$${f(CB.own[0])}`, `−$${f(-CB.own[1])}`],
          ['Wait a year', '$0', '$0'],
        ],
      },
      steps: [
        String.raw`Expected value of each option: launching <m>0.5 \times 90{,}000 + 0.5 \times (-70{,}000) = 10{,}000</m> dollars; own channel only <m>0.5 \times 20{,}000 + 0.5 \times (-5{,}000) = 7{,}500</m> dollars; waiting $0. Without research the best option is to launch, but only $2,500 ahead of the cautious one.`,
        String.raw`With perfect information: if demand is strong, launch ($90,000 beats $20,000 and $0); if it is weak, wait ($0 beats −$70,000 and −$5,000). Expected value: <m>0.5 \times 90{,}000 + 0.5 \times 0 = 45{,}000</m> dollars.`,
        String.raw`EVPI: <m>45{,}000 - 10{,}000 = 35{,}000</m> dollars. The research plan’s $6,800 is <m>6{,}800 \div 35{,}000 \approx 0.19</m>, about a fifth of the ceiling.`,
        'Apply the first test. A result pointing to weak demand would switch the choice from launching to waiting or to the own-channel option, so the research could change the decision. Notice that selling only through the own channel is never the best choice once the state is known: it is a hedge, worth choosing only under uncertainty. In the explorer below, a 40% chance of strong demand makes it the best option without research.',
        'Judge the quality. The survey measures what people on Lantern’s list say they intend, which tends to overstate buying (the survey-error lesson shows why) and leaves out ready-to-drink buyers who have never heard of Lantern; the focus groups explain reasons but can’t estimate shares. The research is far from perfect information. At a fifth of the ceiling, for a close decision with a $70,000 downside, it is still justified, provided Ana writes down beforehand which results would make her wait.',
      ],
      answer: 'Without research the best option is to launch in all three channels, with an expected first-year result of $10,000. Perfect information would raise that to $45,000, so information about demand is worth at most $35,000. The $6,800 plan passes both tests: its result could switch the choice, and it costs about a fifth of the ceiling.',
      interpretation: 'All the value of information here comes from the weak-demand case: knowing it in advance avoids a $70,000 loss. The figures are Ana’s guesses, so the useful habit is to vary them, as the explorer does, and see whether the verdict survives.' },

    { level: 'applied', title: 'Ana’s research brief for February and March', fictional: true,
      setup: `At the end of January 2027 Ana turns her two questions into a brief and, since she is also doing much of the research, a short proposal. The table summarises the brief. Work through it from the decision to the plan, and check it against the codes.`,
      table: {
        caption: 'Lantern’s research brief, January 2027 (fictional)',
        head: ['Section', 'What the brief says'],
        rows: [
          ['Decisions', 'Cold Brew: launch in all three planned channels this summer, make a limited launch with a test, sell only through Lantern’s own channel, or wait; decide by 30 April. Marketing for 2027: which customers to focus on and what to fix first.'],
          ['What is known', `M02’s launch plan; the December survey of subscribers (${SUBSCRIBER_SURVEY.responded} of ${SUBSCRIBER_SURVEY.invited} replied); ${CLIENT_INTERVIEWS.interviewed} catering-client interviews (M01); the online shop’s records (B01).`],
          ['Objectives', `(1) Estimate, to within about ±${SURVEY_PLAN.margin * 100} points, the share of the list who would definitely or probably buy Cold Brew at $${DEFAULT_PLAN.price.toFixed(2)} in the next three months. (2) Estimate how likely list members are to recommend Lantern. (3) Describe how often they buy coffee away from home, how they first heard of Lantern and what they think it should do better. (4) Explore how subscribers, and ready-to-drink buyers who have never bought from Lantern, react to the can, the price and where it would be sold.`],
          ['Design', `Descriptive: a web questionnaire to ${f(SURVEY_2027.invited)} people sampled from the ${f(MAILING_LIST)} on the list (B04’s plan: ${PLAN.n} replies at a ${SURVEY_PLAN.responseRate * 100}% response rate). Exploratory: two 90-minute focus groups in March, one of subscribers and one of ready-to-drink buyers who have never bought from Lantern.`],
          ['Use of results', `Action standard for objective 1, agreed with Jun Park before fieldwork: launch in all three channels only if at least ${AS.high}% of the list, weighted to its four groups, are in the top two boxes (definitely or probably would buy); below ${AS.low}%, sell only through Lantern’s own channel or wait; in between, a limited launch with a test.`],
          ['Who does what', 'The survey in-house; a hired moderator for the groups; a recruitment agency, with a screener (a short qualifying questionnaire), for the group of non-customers.'],
          ['Timing and budget', `Survey sent ${SURVEY_2027.sent}, closing ${SURVEY_2027.closed}; groups on ${GA.date} and ${GB.date}; report by mid-April; $${f(cost)}.`],
          ['Ethics', 'Invitations say who is asking and why, that taking part is voluntary and answers are confidential, and that people can stop at any time; no offers in the questionnaire; groups recorded only with consent; adults only.'],
        ],
      },
      steps: [
        'Start from the decisions. The brief names two, with their options and a deadline; compared with Ana’s rough figures it adds a fourth Cold Brew option, a limited launch with a test, for a result that is neither clearly strong nor clearly weak. The Cold Brew decision is the one with money at stake, so objectives 1 and 4 serve it; objectives 2 and 3 serve the 2027 marketing (which customers are keenest, and where new ones come from).',
        `Test each objective against an action. The action standard turns objective 1 into a rule written before any answers arrive: ${AS.high}% or more supports launching widely, under ${AS.low}% points to the own channel or to waiting, and anything between calls for a smaller first step. The standard is judged on the weighted estimate, and a result whose 95% interval straddles a threshold counts as in between. It is set on Lantern’s list, whose members know Lantern, so even ${AS.high}% wouldn’t show that supermarket shoppers would buy: hence the test in the middle band, and objective 4. Objective 4 can explain a disappointing share, for instance a price or a taste problem that could be fixed. An objective that no answer would act on would be cut.`,
        `Match the designs. Objectives 1 to 3 ask “what share” and “how often”: descriptive, so a sample of the list. Objective 4 asks “how do people react, and why”: exploratory, so groups. Neither design is causal; if Ana later wants to know whether in-store tastings raise sales, that needs an experiment (M08, B12). The list’s four kinds of contact (${STRATA.map((s, h) => `${s.toLowerCase()} ${f(SIZES[h])}`).join(', ')}) are sampled separately, so the survey can report the larger groups on their own; the ${f(SIZES[2])} workshop participants, with only ${SURVEY_2027.allocation[2]} invitations, will give too few replies to read alone.`,
        `Check who does what. The ${GA.participants} subscribers in group A can be recruited from Lantern’s own list; the ${GB.participants} non-customers in group B can’t, so an agency finds them with a screener. The cost is $${f(COST.moderator)} for the moderator, $${f(COST.recruit)} for recruitment, $${f(COST.incentives)} in thank-you payments ($75 each for ${GA.participants + GB.participants} people), $${f(COST.rooms)} for two rooms, $${f(COST.transcripts)} for transcripts and $${f(COST.tool)} for the survey tool: $${f(cost)} in all, inside the budget and about a fifth of the $${f(cbEvpi)} ceiling worked out in the challenging example.`,
        'Check the ethics. Jun Park, Lantern’s analyst, suggests ending the questionnaire with a discounted pre-order link for Cold Brew to lift the response. That would mix research with selling, which all three codes forbid, and MRS’s regulations on incentives add that participants must not be offered price discounts as incentives. Ana drops it. The codes would allow a thank-you for taking part, but she decides against any incentive; a Cold Brew offer can go out later as an ordinary marketing e-mail to people who agreed to receive them.',
      ],
      answer: `The brief names two decisions with a deadline and four objectives, each tied to an action. A descriptive survey covers the three “how many” objectives and exploratory focus groups the “why” objective, with in-house work and hired help for $${f(cost)}, and an ethics plan that keeps selling out of the research.`,
      interpretation: 'Writing the brief made the research smaller and sharper: every question in the survey now has a decision to serve. The rest of this course follows the plan: the next two lessons check the secondary data and plan the groups, Module 2 designs the questionnaire and the sample and examines what went wrong in the field, and Module 4 analyses the results and reports them.' },
  ],

  demo: [
    { widget: 'rp-value', intro: 'Ana’s three Cold Brew options with her rough figures. Lower the chance of strong demand from 50% to 40% and watch the best choice without research switch to the own-channel option. Then move the chance in steps of 1% to find where the EVPI is largest (at 48%, about $36,200), and compare the expected values of the two best options there: they are almost level. Finally, raise the research cost above the ceiling to see the verdict change.' },
  ],

  mistakes: [
    { title: '“The research will tell us what to do.”', html: 'Research reduces uncertainty about a decision that someone still has to make. Write down the decision and its options first, and the result that would favour each; otherwise the study answers questions nobody needed answering, and the decision is taken on instinct anyway.' },
    { title: '“More information is always worth having.”', html: 'Information has value only if it could change the decision, and it can never be worth more than the expected value of perfect information. A study whose every plausible result leads to the same choice is worth nothing to that choice, however cheap.' },
    { title: '“The focus groups showed that most people would buy.”', html: 'Exploratory methods use small, deliberately chosen groups: they show what people think and why, not how many think it. Shares come from descriptive research on a planned sample, and cause from experiments. Match the design to the verb in the objective.' },
    { title: '“Writing the brief is the agency’s job.”', html: 'The brief is the client’s: only the client knows the decision, its deadline and what it can spend. The proposal is the researcher’s answer. An agency asked to “find out what customers think” has to guess the decision, and usually guesses wrong.' },
    { title: '“A discount code at the end of the survey will lift the response.”', html: 'An offer to buy inside a questionnaire mixes research with selling, which the codes forbid, and MRS’s regulations on incentives rule out price discounts and the client’s own goods as incentives. A thank-you incentive for taking part, such as cash or a voucher for shops other than the client’s, is allowed; sales offers go through marketing, to people who agreed to receive them.' },
    { title: '“Anonymous and confidential mean the same thing.”', html: 'Confidential answers can be traced by the researcher but are never revealed; anonymous answers can’t be traced at all. A survey that records e-mail addresses is at best confidential, so promising anonymity would mislead the people who answer it.' },
  ],

  application: [
    { case: 'Ferrow Buses, a fictional regional bus company, wants to bid for a council grant to run an airport express from the city centre. Its research manager receives a one-line brief from the commercial director: “Prove that passengers want an airport express, for the grant application.”' },
    { p: '<b>She reframes the brief.</b> Research can’t be commissioned to prove a conclusion, and an application built on a study designed to agree would break the codes’ rules on honest reporting. She rewrites the decision problem as a choice: whether to bid for the grant, and if so for what service (every 30 or every 60 minutes, at what fare). The research problem is how many trips a day the service would carry at each frequency and fare, and which travellers would use it.' },
    { p: '<b>She orders the designs.</b> Secondary data comes first: the airport’s published passenger numbers, the council’s travel survey and the company’s own ticket records. Exploratory interviews with airport staff, frequent flyers and taxi drivers follow, to find out how people travel to the airport now and what would make them switch. A descriptive survey of travellers at the airport, sampled by day and time, then measures how many would use each option. A causal question, whether a lower fare would raise use, can only be answered by a trial, so she proposes testing two fares in the first months of service if the grant is won.' },
    { p: '<b>She puts a ceiling on the cost.</b> The commercial director’s rough figures are a $400,000 profit over the grant period if demand is high, a $250,000 loss if it is low, and a 50% chance of each. Bidding has an expected value of $75,000 against $0 for not bidding; with perfect information the company would bid only if demand were high, for $200,000. The EVPI is $125,000, so the $38,000 agency quote for the airport survey passes the ceiling test. They agree an action standard before fieldwork: bid for the 30-minute service if the survey’s estimate implies at least 900 trips a day at the planned fare.' },
    { p: '<b>She splits the work.</b> The desk research and the interviews are done in-house; the airport survey goes to an agency, because interviewing in a terminal needs the airport’s permission, trained interviewers and a sampling plan by flight time. <b>And she checks the ethics.</b> Marketing wanted the survey to collect e-mail addresses for fare offers: she moves that to a separate, optional sign-up after the interview. School pupils travel on the airport road, so interviewers screen out anyone under 18 rather than seek a parent’s consent in a terminal; and the grant application will quote the survey’s estimate with its base and margin of error, whatever it turns out to be.' },
    { p: 'The same habits apply to a two-person café and to a national brand: start from the decision, choose the design from the verb in each objective, spend no more than a better decision could gain, and treat the people who answer as the reason research is possible at all.' },
  ],

  summary: [
    'Marketing research exists to inform decisions. The decision problem is the choice to be made; the research problem is what must be found out to make it; research objectives make that specific and measurable.',
    'Test every objective by asking what you would do with each possible answer; if every answer leads to the same action, drop it.',
    'Exploratory research explains and generates hypotheses; descriptive research measures how many and how often from a planned sample; causal research tests cause with experiments.',
    'The steps run from defining the problem and planning, through choosing data, sampling and collecting, to analysis and a report, and the result feeds the next question.',
    'The client’s brief states the decision, what is known, objectives, timing, budget and action standards; the researcher’s proposal answers with design, sample, analysis, timetable and cost.',
    'Research is worth doing only if a result could change the decision, and it is worth at most the expected value of perfect information: the expected value of choosing with perfect knowledge minus that of the best choice without it.',
    'The ICC/ESOMAR, MRS and Insights Association codes require informed consent and the right to withdraw, respect for privacy, no selling under the guise of research, honest reporting and a responsible adult’s consent for children, whom they define differently.',
  ],

  glossary: [
    { term: 'Marketing research', def: 'The systematic planning, collection, analysis and reporting of information about customers, markets and competitors, to help make a marketing decision.' },
    { term: 'Decision problem', def: 'The choice a manager faces, stated as the actions being considered: what to do, not what to find out.' },
    { term: 'Research problem', def: 'The information needed to make a decision, stated as what the research must find out.' },
    { term: 'Research objective', def: 'A specific, measurable statement of what a study will deliver, such as an estimate, a comparison or an explanation, chosen because its answer bears on a decision.' },
    { term: 'Exploratory research', def: 'Research that aims to understand a problem, find possible explanations and generate hypotheses, usually with flexible, small-scale methods such as depth interviews, focus groups, observation and secondary data.' },
    { term: 'Descriptive research', def: 'Research that measures the characteristics of a population or market, such as how many, how often, who and how much, usually with a survey of a planned sample or with records.' },
    { term: 'Causal research', def: 'Research that tests whether changing one thing causes a change in another, by experiment: the change is made for a randomly chosen group and the outcome compared with a control group.' },
    { term: 'Research brief', def: 'The document in which the client describes the decision, the background, what it needs to know, whom to study, the timing and the budget, so that researchers can propose a study.' },
    { term: 'Research proposal', def: 'The researcher’s answer to a brief: the objectives as understood, the design and methods, the sample, the analysis, the deliverables, the timetable and the cost.' },
    { term: 'Action standard', def: 'A result agreed before research is carried out that will lead to a stated decision, such as “launch if at least 30% of target buyers say they would definitely buy”.' },
    { term: 'Expected value of perfect information', def: 'The most that information removing all uncertainty could be worth to a decision: the expected value of choosing the best option once the outcome is known, minus the expected value of the best option chosen without that knowledge. Abbreviated EVPI.' },
    { term: 'Informed consent', def: 'In research, a participant’s voluntary agreement to take part, given after being told who is doing the research, what it involves and how their data will be used, with the right to withdraw at any time.' },
    { term: 'Confidentiality', def: 'In research, the promise that the researcher, who knows who gave each answer, will not reveal it or link it to the person in anything shared.' },
    { term: 'Anonymity', def: 'In research, collecting no information that could identify the person who gave an answer, so that not even the researcher knows who it was.' },
    { term: 'Sugging', def: 'Selling under the guise of research: contacting people as if for research in order to sell to them or to collect sales leads. Professional research codes forbid it.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 6.1 “Marketing Research and Big Data” and 6.3 “Steps in a Successful Marketing Research Plan”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.4 “Ethical Issues in Marketing Research”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-4-ethical-issues-in-marketing-research', checked: '2026-10-24' },
    { text: 'ICC and ESOMAR (2025). <i>ICC/ESOMAR International Code on Market, Opinion and Social Research and Data Analytics</i> (2025 revision). Fundamental principles; Articles 1–4 and 9.', url: 'https://community.esomar.org/uploads/public/knowledge-and-standards/codes-and-guidelines/ICCESOMAR-International-Code_English.pdf', checked: '2026-10-24' },
    { text: 'Market Research Society (2023). <i>MRS Code of Conduct</i>. Rules 4, 16, 30, 34 and 61–62, and the definition of a child.', url: 'https://www.mrs.org.uk/pdf/MRS-code-of-conduct-2023.pdf', checked: '2026-10-24' },
    { text: 'Market Research Society (revised 2024). <i>Regulations for Administering Incentives and Free Prize Draws</i>. Rule 3 (no price discounts as incentives) and rule 4 (no client goods or services, or vouchers for them).', url: 'https://www.mrs.org.uk/pdf/Regulations%20for%20Incentives%20and%20Prize%20Draws%20July%202015.pdf', checked: '2026-10-24' },
    { text: 'Insights Association. <i>Code of Standards and Ethics for Market Research and Data Analytics</i>: summary of the code’s provisions on consent, non-research activities, children and public releases (page last updated September 2026).', url: 'https://www.insightsassociation.org/About-Us/Code-of-Standards', checked: '2026-10-24' },
  ],

  checks: [
    { what: 'Cold Brew price (M02 DEFAULT_PLAN)', value: DEFAULT_PLAN.price, shown: 3.49 },
    { what: 'Mailing list size (B04)', value: MAILING_LIST, shown: 6000 },
    { what: 'Survey plan margin, points (B04)', value: SURVEY_PLAN.margin * 100, shown: 4 },
    { what: 'Survey plan response rate % (B04)', value: SURVEY_PLAN.responseRate * 100, shown: 30 },
    { what: 'Survey plan replies (B04)', value: PLAN.n, shown: 601 },
    { what: 'Invitations (case.js)', value: SURVEY_2027.invited, shown: 2004 },
    { what: 'Invitations from B04 plan', value: PLAN.invite, shown: 2004 },
    { what: 'Subscribers on the list', value: SIZES[0], shown: 520 },
    { what: 'Other shop customers', value: SIZES[1], shown: 1000 },
    { what: 'Workshop participants', value: SIZES[2], shown: 150 },
    { what: 'Newsletter only', value: SIZES[3], shown: 4330 },
    { what: 'December survey replies (B04)', value: SUBSCRIBER_SURVEY.responded, shown: 312 },
    { what: 'December survey invited (B04)', value: SUBSCRIBER_SURVEY.invited, shown: 520 },
    { what: 'Client interviews (M01)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Group A participants', value: GA.participants, shown: 8 },
    { what: 'Group B participants', value: GB.participants, shown: 7 },
    { what: 'Focus-group participants in all', value: GA.participants + GB.participants, shown: 15 },
    { what: 'Survey questions', value: SURVEY_2027.questions.length, shown: 6 },
    // Tallowfield
    { what: 'Tallowfield: gain if strong', value: TB.gain, shown: 36000 },
    { what: 'Tallowfield: loss if weak', value: TB.loss, shown: 24000 },
    { what: 'Tallowfield: chance of strong %', value: TB.p * 100, shown: 50 },
    { what: 'Tallowfield: EV of café area', value: tbEv, shown: 6000 },
    { what: 'Tallowfield: EV with perfect information', value: tbPerfect, shown: 18000 },
    { what: 'Tallowfield: EVPI', value: tbPerfect - tbEv, shown: 12000 },
    { what: 'Tallowfield: agency cost', value: TB.agency, shown: 14000 },
    { what: 'Tallowfield: own survey cost', value: TB.own, shown: 1500 },
    { what: 'Tallowfield: perfect-information saving if weak', value: -0 + TB.loss, shown: 24000 },
    { what: 'Tallowfield: EVPI minus survey cost', value: tbPerfect - tbEv - TB.own, shown: 10500 },
    // Cold Brew
    { what: 'Cold Brew: chance of strong %', value: CB.p * 100, shown: 50 },
    { what: 'Cold Brew: EV launch', value: ev(CB.launch), shown: 10000 },
    { what: 'Cold Brew: EV own channel', value: ev(CB.own), shown: 7500 },
    { what: 'Cold Brew: EV wait', value: ev(CB.wait), shown: 0 },
    { what: 'Cold Brew: launch lead over own channel', value: ev(CB.launch) - ev(CB.own), shown: 2500 },
    { what: 'Cold Brew: EV with perfect information', value: cbPerfect, shown: 45000 },
    { what: 'Cold Brew: EVPI', value: cbEvpi, shown: 35000 },
    { what: 'Cold Brew: research cost', value: cost, shown: 6800 },
    { what: 'Cold Brew: cost as share of EVPI', value: cost / cbEvpi, shown: 0.19, tol: 0.005 },
    { what: 'Cold Brew: at 40% the own channel is best (EV own)', value: ev(CB.own, 0.4), shown: 5000 },
    { what: 'Cold Brew: at 40%, EV launch', value: ev(CB.launch, 0.4), shown: -6000 },
    { what: 'Cold Brew: at 40% own beats launch and wait', value: Number(ev(CB.own, 0.4) > Math.max(ev(CB.launch, 0.4), 0)), shown: 1 },
    { what: 'Cold Brew: weak-case loss avoided', value: -CB.launch[1], shown: 70000 },
    // costs
    { what: 'Moderator', value: COST.moderator, shown: 2600 },
    { what: 'Recruitment (7 × $150)', value: COST.recruit, shown: 1050 },
    { what: 'Incentives (15 × $75)', value: COST.incentives, shown: 1125 },
    { what: 'Rooms', value: COST.rooms, shown: 1000 },
    { what: 'Transcripts', value: COST.transcripts, shown: 600 },
    { what: 'Survey tool', value: COST.tool, shown: 425 },
    { what: 'Research cost within the $7,000 budget', value: Number(cost <= 7000), shown: 1 },
    // Ferrow Buses
    { what: 'Ferrow: EV of bidding', value: 0.5 * 400000 - 0.5 * 250000, shown: 75000 },
    { what: 'Ferrow: EV with perfect information', value: 0.5 * 400000, shown: 200000 },
    { what: 'Ferrow: EVPI', value: 0.5 * 400000 - (0.5 * 400000 - 0.5 * 250000), shown: 125000 },
    { what: 'Ferrow: agency quote below EVPI', value: Number(38000 < 125000), shown: 1 },
    { what: 'Ferrow: profit if high', value: 400000, shown: 400000 },
    { what: 'Ferrow: loss if low', value: 250000, shown: 250000 },
    { what: 'Ferrow: agency quote', value: 38000, shown: 38000 },
    { what: 'Ferrow: action standard, trips a day', value: 900, shown: 900 },
    { what: 'Ferrow: service intervals (minutes)', value: 30 + 60, shown: 90 },
    { what: 'Ferrow: screening age', value: 18, shown: 18 },
    // constants quoted in the text
    { what: 'Ana’s research budget', value: 7000, shown: 7000 },
    { what: 'Can size (ml, M02)', value: 250, shown: 250 },
    { what: 'Focus-group length (minutes, case.js)', value: 90, shown: 90 },
    { what: 'Tallowfield seats', value: 20, shown: 20 },
    { what: 'Incentive per participant', value: COST.incentives / (GA.participants + GB.participants), shown: 75 },
    { what: 'Recruitment per head', value: COST.recruit / GB.participants, shown: 150 },
    { what: 'Example action standard (%)', value: 30, shown: 30 },
    { what: 'Lantern action standard: launch widely at or above (%)', value: AS.high, shown: 45 },
    { what: 'Lantern action standard: hold back below (%)', value: AS.low, shown: 30 },
    { what: 'Example list shares that would not change the launch (%)', value: 20 + 60, shown: 80 },
    { what: 'ICC/ESOMAR child age limit', value: 12, shown: 12 },
    { what: 'ICC/ESOMAR young person ages', value: 13 + 17, shown: 30 },
    { what: 'MRS child: under', value: 16, shown: 16 },
    { what: 'Explorer: chance at which own channel becomes best (%)', value: 40, shown: 40 },
    { what: 'Explorer: EVPI peak on a 1% grid (%)', value: evpiPeak.p * 100, shown: 48 },
    { what: 'Explorer: EVPI at the peak', value: evpiPeak.evpi, shown: 36200 },
    { what: 'Explorer: launch and own channel nearly level at the peak', value: Math.abs(ev(CB.launch, 0.48) - ev(CB.own, 0.48)), shown: 200 },
    { what: 'Workshop invitations (case.js)', value: SURVEY_2027.allocation[2], shown: 50 },
    { what: 'Workshop participants on the list', value: SIZES[2], shown: 150 },
  ],
};
