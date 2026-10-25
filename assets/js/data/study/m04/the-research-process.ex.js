// the-research-process.ex.js — M04 · The research process: widgets, practice and the knowledge check (answer keys live
// here). Ana's Cold Brew planning figures are the lesson's (fictional); Wrenfold Fitness, Tansey Hill Folk Festival,
// Pellam Software and the other businesses are fictional. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const ev2 = (p, good, bad) => p * good + (1 - p) * bad;

// Tansey Hill Folk Festival (guided g2): large or small field; ticket demand high or low, 50% each
const TH = { p: 0.5, large: [60000, -40000], small: [20000, 5000] };
const thLarge = ev2(TH.p, ...TH.large), thSmall = ev2(TH.p, ...TH.small);
const thPerfect = TH.p * Math.max(TH.large[0], TH.small[0]) + (1 - TH.p) * Math.max(TH.large[1], TH.small[1]);
const thEvpi = thPerfect - Math.max(thLarge, thSmall);
// a homeware shop (i2): stock outdoor furniture or not
const HW = { p: 0.3, gain: 15000, loss: 9000 };
const hwStock = ev2(HW.p, HW.gain, -HW.loss);
const hwEvpi = HW.p * HW.gain - Math.max(0, hwStock);
// a cinema (k2): three states
const CIN = { p: [0.2, 0.5, 0.3], v: [12000, 3000, -6000] };
const cinEv = CIN.p.reduce((a, p, i) => a + p * CIN.v[i], 0);

export const widgets = {
  'rp-value': {
    type: 'formula',
    title: 'What could research be worth? Ana’s three Cold Brew options',
    intro: 'Set the chance of strong demand and each option’s first-year result. Waiting a year is worth $0 either way. The explorer finds the best option without research, the best with perfect information, and the ceiling on what research can be worth.',
    inputs: [
      { id: 'p', label: 'Chance of strong demand', min: 0, max: 100, step: 5, value: 50, fmt: 'pct' },
      { id: 'gL', label: 'Launch widely: result if demand is strong', min: 0, max: 200000, step: 5000, value: 90000, fmt: 'money' },
      { id: 'lL', label: 'Launch widely: loss if demand is weak', min: 0, max: 200000, step: 5000, value: 70000, fmt: 'money' },
      { id: 'gO', label: 'Own channel only: result if demand is strong', min: 0, max: 100000, step: 1000, value: 20000, fmt: 'money' },
      { id: 'lO', label: 'Own channel only: loss if demand is weak', min: 0, max: 50000, step: 1000, value: 5000, fmt: 'money' },
      { id: 'cost', label: 'Cost of the research', min: 0, max: 50000, step: 200, value: 6800, fmt: 'money' },
    ],
    compute: (v) => {
      const q = v.p / 100;
      const opts = [['Launch widely', ev2(q, v.gL, -v.lL)], ['Own channel only', ev2(q, v.gO, -v.lO)], ['Wait a year', 0]];
      const best = opts.reduce((a, b) => (b[1] > a[1] + 1e-9 ? b : a));
      const strongBest = Math.max(v.gL, v.gO, 0), weakBest = Math.max(-v.lL, -v.lO, 0);
      const perfect = q * strongBest + (1 - q) * weakBest;
      const evpi = Math.max(0, perfect - best[1]);
      const verdict = evpi < 1
        ? 'With no uncertainty left (or one option best in every state), information can’t change the choice: research is worth nothing to this decision.'
        : v.cost > evpi
          ? `The research costs ${money(v.cost)}, more than the ${money(evpi)} ceiling: it can’t pay for itself, however good it is.`
          : `The research costs ${money(v.cost)}, ${Math.round((v.cost / evpi) * 100)}% of the ${money(evpi)} ceiling. It passes the ceiling test; it is worth doing only if its result is good enough to change the choice.`;
      return {
        headline: { label: 'Expected value of perfect information', value: money(evpi) },
        rows: [
          ...opts.map(([name, val]) => [`Expected value: ${name.toLowerCase()}`, money(val)]),
          ['Best without research', `${best[0]} (${money(best[1])})`],
          ['Expected value with perfect information', money(perfect)],
        ],
        note: verdict,
        chart: {
          kind: 'bar',
          x: { label: 'Choice', values: ['Launch widely', 'Own channel', 'Wait', 'Perfect information'] },
          series: [{ name: 'Expected first-year result ($)', values: [...opts.map((o) => Math.round(o[1])), Math.round(perfect)] }],
          y: { label: 'Expected first-year result ($)', format: 'money' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm04-rp-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Wrenfold Fitness, a fictional gym chain, has drafted six research objectives. Classify each by the design it needs.',
    items: [
      'Find out why members who leave in their first three months decide to go',
      'Estimate the share of current members who train before 7 a.m. on weekdays',
      'Test whether a free personal-training session in the first week raises the share of new members still visiting after three months',
      'Estimate how many adults within two miles of each gym already belong to another gym',
      'Discover the words members use to describe a “good” class, so the survey’s answer options use them',
      'Find out whether cutting the price from $39 to $35 a month changes how many trial visitors join',
    ],
    categories: ['Exploratory', 'Descriptive', 'Causal'],
    answer: [0, 1, 2, 1, 0, 2],
    hints: [
      'Read the verb: “why” and “discover” explore; “estimate how many” describes; “test whether X raises Y” asks about cause.',
      'Two objectives ask whether a change the gym makes would change behaviour. Only an experiment, with the change given to a randomly chosen group, answers those.',
    ],
    feedback: {
      0: 'Reasons for leaving are explanations to discover, not counts: depth interviews with leavers suit them. How common each reason is would be a later, descriptive question.',
      2: 'Comparing members who happened to take a session with those who didn’t mixes the session with everything else that differs between them. Giving it to a random half of new members is a causal design.',
      5: 'Asking people whether they would join at $35 is descriptive (stated intent). Whether the cut changes joining needs the two prices offered to randomly chosen trial visitors: causal.',
    },
    solution: 'Exploratory: why early leavers go, and the words members use for a good class (both generate explanations and question wording). Descriptive: the share training before 7 a.m. and the number of nearby adults in other gyms (both “how many”). Causal: the free session and the price cut, because each asks whether a change the gym makes would change what people do.',
  },
  {
    id: 'm04-rp-g2', type: 'steps', kind: 'numerical',
    prompt: `Tansey Hill Folk Festival (fictional) must book a field months ahead. A large field would make ${money(TH.large[0])} if ticket demand is high and lose ${money(-TH.large[1])} if it is low; a small field would make ${money(TH.small[0])} or ${money(TH.small[1])}. The organisers put the chance of high demand at 50%. Value information about demand before they book.`,
    solution: `Large field: 0.5 × 60,000 + 0.5 × (−40,000) = ${money(thLarge)}. Small field: 0.5 × 20,000 + 0.5 × 5,000 = ${money(thSmall)}, the better choice without research. With perfect information they would book the large field when demand is high (60,000) and the small one when it is low (5,000): 0.5 × 60,000 + 0.5 × 5,000 = ${money(thPerfect)}. EVPI = 32,500 − 12,500 = ${money(thEvpi)}. A pre-sale survey of past ticket buyers for $4,000 passes the ceiling test and could switch the booking from small to large.`,
    steps: [
      { id: 'm04-rp-g2-s1', type: 'num',
        prompt: 'What is the expected value of booking the large field? Give dollars.',
        answer: thLarge, check: () => 0.5 * 60000 + 0.5 * -40000, tol: 0.5, unit: '$', places: 0,
        hints: ['Weight each result by its probability and add: the loss enters as a negative number.', '0.5 × 60,000 + 0.5 × (−40,000).'],
        wrong: [
          { value: 50000, say: 'That adds the loss as if it were a gain. A loss of $40,000 enters as −40,000.' },
          { value: 60000, say: 'That is the result if demand is high. The expected value weights it with the low-demand result.' },
        ] },
      { id: 'm04-rp-g2-s2', type: 'num',
        prompt: 'What is the expected value of booking the small field? Give dollars.',
        answer: thSmall, check: () => 0.5 * 20000 + 0.5 * 5000, tol: 0.5, unit: '$', places: 0,
        hints: ['Same method, the small field’s two results.', '0.5 × 20,000 + 0.5 × 5,000.'],
        wrong: [{ value: 25000, say: 'That adds the two results without weighting them. Multiply each by its 50% chance first.' }] },
      { id: 'm04-rp-g2-s3', type: 'num',
        prompt: 'If the organisers knew in advance whether demand would be high or low, they would book the better field for each case. What is the expected value of deciding that way? Give dollars.',
        answer: thPerfect, check: () => 0.5 * Math.max(60000, 20000) + 0.5 * Math.max(-40000, 5000), tol: 0.5, unit: '$', places: 0,
        hints: ['High demand: which field does better? Low demand: which field does better?', 'High: large, 60,000. Low: small, 5,000. Weight each by 0.5.'],
        wrong: [
          { value: 30000, say: 'That counts nothing for low demand. With low demand known, they would still book the small field and make $5,000.' },
          { value: 40000, say: 'That averages the small field’s high result with the large field’s. For each state, take the best field’s result: 60,000 if high, 5,000 if low.' },
        ] },
      { id: 'm04-rp-g2-s4', type: 'num',
        prompt: 'What is the expected value of perfect information about demand? Give dollars.',
        answer: thEvpi, check: () => 32500 - Math.max(10000, 12500), tol: 0.5, unit: '$', places: 0,
        hints: ['EVPI = expected value with perfect information − expected value of the best choice without it.', 'The best choice without research is the small field.'],
        wrong: [
          { value: 22500, say: 'That subtracts the large field’s expected value. The comparison is with the best choice without information, the small field ($12,500).' },
          { value: 32500, say: 'That is the expected value with perfect information. Its worth is the gain over the best choice without it.' },
        ] },
      { id: 'm04-rp-g2-s5', type: 'mc',
        prompt: 'A survey of last year’s ticket buyers would cost $4,000. Which conclusion follows?',
        options: [
          'It is below the ceiling and its result could switch the booking, so it can be worth it',
          'It will return $16,000 more than it costs, because the EVPI is $20,000 and it costs $4,000',
          'It is worthless, because the small field is the better choice without research',
          'It should be bought only if it cost more than the EVPI, since a higher price signals quality',
        ],
        answer: 0,
        hints: ['EVPI is a ceiling for perfect information, not a forecast of what a real survey returns.', 'Could a survey result move the booking from the small field to the large one?'],
        feedback: {
          1: 'A real survey is imperfect, so it is worth less than perfect information. The $20,000 is the most it could be worth, not what it will return.',
          2: 'The small field is best only while demand is unknown. Evidence of high demand would switch the booking to the large field, which is where the survey’s value comes from.',
          3: 'Research that costs more than the EVPI can never pay for itself. The ceiling is a maximum to stay under.',
        } },
    ],
  },
  {
    id: 'm04-rp-g3', type: 'mc', kind: 'conceptual',
    prompt: 'The manager of a fictional garden centre asks: “Should we open on Sunday mornings from April?” Which of these is the research problem behind that decision?',
    options: [
      'How many customers would come on Sunday mornings, and what they would spend',
      'Deciding whether to open on Sunday mornings from April, and with how many staff on each shift',
      'Showing the owners that Sunday opening will make a profit, using a survey of loyal customers',
      'Sending a questionnaire to the 400 customers on the loyalty list in the first week of March',
    ],
    answer: 0,
    hints: ['The decision problem asks what to do; the research problem asks what must be found out to decide.', 'One option is the decision itself, one is a method, and one asks research to prove a conclusion.'],
    feedback: {
      1: 'That is the decision problem, the choice the manager faces. The research problem is the information that choice needs.',
      2: 'Research can’t be asked to prove a conclusion: a study designed to agree breaks the codes’ honesty rules and tells the manager nothing.',
      3: 'That is a method, and a questionable one (loyalty-card holders are not all customers). Decide what you need to know before how to find it out.',
    },
    why: 'The research problem states the information the decision needs: demand on Sunday mornings and its value.',
    solution: 'Decision problem: whether to open on Sunday mornings (and with what staffing). Research problem: how many customers would come and what they would spend, the information that decides whether opening pays. Objectives would then make it measurable, for example “estimate the share of customers who would visit at least once a month on a Sunday morning”.',
  },
  {
    id: 'm04-rp-g4', type: 'multi', kind: 'applied',
    prompt: 'A fictional bakery chain is planning a customer survey. Which of these practices do the professional codes allow? Select all that apply.',
    options: [
      'Telling people at the start that they may stop answering at any time',
      'Ending the questionnaire with a coupon for 20% off a birthday cake that is valid only with a phone number',
      'Thanking everyone who completes it with a $5 voucher, whatever their answers',
      'Asking for e-mail addresses “for the analysis” and using them later for a sales campaign',
      'Promising anonymity while recording each respondent’s loyalty-card number',
      'Publishing the share who rated the bread “good” or “very good”, with the number who answered',
    ],
    answer: [0, 2, 5],
    hints: ['Check each against four rules: voluntary participation with the right to withdraw, no selling, honest promises about privacy, honest reporting.', 'An incentive for taking part is allowed; an offer that collects sales leads is not.'],
    feedback: {
      1: 'A coupon that collects phone numbers turns the survey into a sales channel: sugging.',
      3: 'Using research data for marketing without telling people, and without their agreement, breaks the separation of research and selling and misleads them about the purpose.',
      4: 'A loyalty-card number identifies the person, so the answers are at best confidential. Promising anonymity would be untrue.',
    },
    solution: 'Allowed: telling people they can stop at any time (the right to withdraw), a thank-you voucher for taking part (an incentive to participate), and publishing a result with its base. Not allowed: the coupon that harvests phone numbers and the e-mail addresses reused for sales (both sell under the guise of research), and a promise of anonymity the survey can’t keep.',
  },
];

export const independent = [
  {
    id: 'm04-rp-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Pellam Software (fictional) is commissioning research on a new pricing plan. Which document does each item belong in?',
    items: [
      'The decision the results will feed, and the date it must be taken',
      'The sample design and the number of interviews in each group of customers',
      'The budget available for the study',
      'A timetable of fieldwork, analysis and reporting, with the price of the study',
      'Earlier studies and the usage data the firm already holds',
      'An outline discussion guide for the depth interviews',
      'An action standard: adopt the new plan if at least 25% of trial users upgrade',
    ],
    categories: ['Research brief (client)', 'Research proposal (researcher)'],
    answer: [0, 1, 0, 1, 0, 1, 0],
    feedback: {
      3: 'The proposal sets out what the study will cost and when it will deliver; the brief only says what the client can spend and by when it needs answers.',
      6: 'The client owns the decision, so the client sets the result that will trigger it, before the data arrive.',
    },
    solution: 'Brief (the client’s): the decision and its deadline, the budget, what is already known, and the action standard. Proposal (the researcher’s answer): the sample design, the timetable and price, and the outline discussion guide.',
  },
  {
    id: 'm04-rp-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional homeware shop is deciding whether to stock a range of outdoor furniture. If it sells well the range makes $15,000; if not, it loses $9,000. The owner puts the chance of selling well at 30%. Not stocking it is worth $0. What is the expected value of perfect information about demand? Give dollars.',
    answer: hwEvpi, check: () => 0.3 * 15000 - Math.max(0, 0.3 * 15000 - 0.7 * 9000), tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: HW.p * HW.gain - hwStock, say: 'That subtracts the expected value of stocking (−$1,800). Without information the owner wouldn’t stock at all, so the best choice is worth $0.' },
      { value: HW.gain, say: 'That is the result if the range sells well. Weight it by its 30% chance, and compare with the best choice without information.' },
      { value: hwStock, say: 'That is the expected value of stocking the range: 0.3 × 15,000 − 0.7 × 9,000. It is negative, so the owner wouldn’t stock without more information.' },
    ],
    solution: 'Stocking: 0.3 × 15,000 − 0.7 × 9,000 = 4,500 − 6,300 = −$1,800, so without information the owner doesn’t stock ($0). With perfect information she stocks only when it would sell well: 0.3 × 15,000 = $4,500. EVPI = 4,500 − 0 = $4,500. Information is valuable here because a favourable result would change the decision from “don’t stock” to “stock”.',
  },
  {
    id: 'm04-rp-i3', type: 'mc', kind: 'applied',
    prompt: 'A fictional regional bank wants a survey of 1,500 small-business owners, most of whom are not its customers, completed within three weeks. Its research team is two people. Which arrangement fits best?',
    options: [
      'Buy fieldwork from an agency that reaches non-customers; keep the brief and analysis in-house',
      'Run it in-house by e-mailing the bank’s business customers, who are already on its list',
      'Run it in-house by posting a link on the bank’s social-media pages and waiting for 1,500 replies',
      'Postpone the survey for six months while the bank hires and trains an interviewing team',
    ],
    answer: 0,
    feedback: {
      1: 'The bank’s list holds its customers, but the population is mostly non-customers. Its own frame can’t reach them.',
      2: 'A link on its own pages draws a self-selected sample of the bank’s followers, not small-business owners in general.',
      3: 'Hiring a team for one study misses the deadline and costs more than buying the fieldwork.',
    },
    solution: 'The bank lacks two things an agency sells: a way to reach business owners who aren’t its customers (panels or a bought sample) and the capacity to finish in three weeks. Mixing the two keeps what the bank does best in-house (the brief, the decision and the analysis) and buys the specialised part.',
  },
  {
    id: 'm04-rp-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a research project in order.',
    items: [
      'Agree the decision, the research problem and the objectives',
      'Write the brief and agree the proposal: design, timetable and budget',
      'Search existing data, then choose methods for collecting new data',
      'Decide whom to ask, how many, and how to choose them',
      'Run the fieldwork and record who responds',
      'Analyse the answers, with margins of error and themes',
      'Report the findings, their limits and what they mean for the decision',
    ],
    solution: 'The order follows OpenStax’s seven steps: define the problem, develop the plan, select the data collection method, design the sample, collect, analyse and interpret, report. In practice the steps loop back: a pretest can send you back to the objectives, and the report sets up the next question.',
  },
  {
    id: 'm04-rp-i5', type: 'short', kind: 'applied',
    prompt: 'The owner of a fictional seaside hotel writes to you: “Find out what guests think of us.” Rewrite the request as a decision problem, a research problem and two research objectives, and say for each objective which design it needs and what the hotel would do differently depending on the answer.',
    rubric: [
      'States a decision problem as a choice between actions the hotel could take (for example, whether to refurbish rooms or to extend breakfast hours first).',
      'States a research problem as the information that decision needs, distinct from the decision.',
      'Gives two objectives that are specific and measurable (population, measure, precision or scope) and names the right design for each (exploratory or descriptive, or causal for a test).',
      'Links each objective to an action: what the hotel would do if the answer came out one way or the other.',
    ],
    model: 'Decision problem: with $60,000 to spend this winter, should the hotel refurbish its sea-view rooms or extend its breakfast and restaurant hours first? Research problem: which of the two would do more to bring guests back and raise what they spend, and among which guests. Objective 1 (exploratory): find out, through depth interviews with ten recent guests who have not returned, what decided whether they came back; if room quality dominates, the refurbishment moves up the list. Objective 2 (descriptive): estimate, to within about ±5 points, the share of last year’s guests who rated their room “good” or “very good” and the share who ate at the hotel, from a random sample of 600 guests e-mailed after their stay; a low room rating supports refurbishing, a low share eating in supports the hours. If the hotel later wants to know whether longer breakfast hours actually raise spending, it could offer them on randomly chosen weeks: a causal test.',
  },
  {
    id: 'm04-rp-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional ferry company must replace its booking website next year whatever customers say, because the old system will no longer be supported. Marketing proposes a $20,000 survey asking whether customers want a new website. What is the survey worth to the replacement decision?',
    options: [
      'Nothing to that decision, since no answer could change it',
      'Up to $20,000, the amount the survey costs',
      'More than $20,000 if enough customers reply',
      'The expected value of perfect information about the whole website project',
    ],
    answer: 0,
    feedback: {
      1: 'Cost is not value. Research is worth something only through a decision it could change, and this one is fixed.',
      2: 'More replies make the answer more precise, but a precise answer to a settled question still changes nothing.',
      3: 'Information can be valuable for the project’s other decisions, such as which features to build, but not for a replacement that will happen anyway.',
    },
    solution: 'The first test fails: no result would change the decision to replace the site, so the survey is worth nothing to it. Research could still help other decisions about the new site, such as which booking features matter most, so the right move is to rewrite the objectives around those decisions.',
  },
];

export const check = [
  {
    id: 'm04-rp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which research objective calls for causal research?',
    options: [
      'Test whether free delivery raises the average basket size of first orders',
      'Estimate the share of last month’s online customers who live outside the city',
      'Discover what first-time customers expect when they hear the word “artisan”',
      'Describe how often subscribers skip a delivery, by length of subscription',
    ],
    answer: 0,
    feedback: {
      1: '“Estimate the share” is descriptive: a planned sample and a margin of error, no test of cause.',
      2: '“Discover what … expect” is exploratory: open conversations that find the meanings people attach to a word.',
      3: '“Describe how often” is descriptive, even when broken down by group. Differences between groups are associations, not causes.',
    },
    solution: 'Only the free-delivery objective asks whether a change causes an effect, so it needs an experiment: offer free delivery to a randomly chosen half of first-time visitors and compare basket sizes with the control group. The others estimate shares and frequencies (descriptive) or explore meanings (exploratory).',
  },
  {
    id: 'm04-rp-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional cinema is considering a late-night screening. It estimates that in a year the screening would make $12,000 if attendance is high (probability 0.2), $3,000 if it is medium (0.5) and lose $6,000 if it is low (0.3). What is the expected value of adding the screening? Give dollars.',
    answer: cinEv, check: () => 0.2 * 12000 + 0.5 * 3000 + 0.3 * -6000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: (12000 + 3000 - 6000) / 3, say: 'That is the plain average of the three results. The states are not equally likely: weight each by its probability.' },
      { value: 0.2 * 12000 + 0.5 * 3000 + 0.3 * 6000, say: 'The low case is a loss, so it enters as −6,000: 0.3 × (−6,000) = −1,800.' },
    ],
    solution: 'Expected value = 0.2 × 12,000 + 0.5 × 3,000 + 0.3 × (−6,000) = 2,400 + 1,500 − 1,800 = $2,100. It is positive, so on these estimates the screening is worth adding, though a bad year loses $6,000.',
  },
  {
    id: 'm04-rp-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional software firm works out that perfect information about demand for a new add-on would be worth $8,000 to its launch decision. An agency quotes $9,500 for a study that would answer the question well. What should the firm conclude?',
    options: [
      'The study can’t pay for itself, so look for cheaper evidence or decide without it',
      'Commission it, because a well-designed study is worth more than perfect information',
      'Commission it, because the quote is within 20% of the ceiling, close enough to justify',
      'Wait until the study is finished before working out what perfect information is worth',
    ],
    answer: 0,
    feedback: {
      1: 'No study can beat perfect information: the EVPI is the most any information could add to the decision.',
      2: 'The ceiling is a maximum, not a target. Even perfect information would gain only $8,000, less than the $9,500 the study costs.',
      3: 'The value of information is worked out before buying it; that is what makes it useful for deciding whether to buy.',
    },
    solution: 'Since $9,500 exceeds the $8,000 ceiling, the study would cost more than even perfect information could gain. The firm should look for cheaper evidence (secondary data, a few interviews with trial users) or decide on what it knows.',
  },
  {
    id: 'm04-rp-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these do the ICC/ESOMAR, MRS and Insights Association codes require of researchers? Select all that apply.',
    options: [
      'Letting participants withdraw from the research at any time',
      'Keeping research separate from selling to the people who take part',
      'Promising anonymity to every participant in every study',
      'Publishing every study a client commissions, whatever its results',
      'Getting a parent’s or responsible adult’s consent before children take part',
      'Collecting the personal details of all participants for later contact',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'The codes require researchers to keep the promises they make about privacy. Many studies can offer confidentiality but not anonymity, and that is allowed.',
      3: 'A client may keep a study private. What the codes forbid is publishing results in a way that misleads.',
      5: 'The ICC/ESOMAR code requires data minimisation: collect only personal data that is reasonable and directly relevant, and ask before re-contacting anyone.',
    },
    solution: 'All three codes require voluntary participation with the right to withdraw, a clear separation between research and selling, and the consent of a parent or responsible adult for children (though they define a child differently). They don’t require anonymity in every study, publication of every study, or the collection of contact details; data minimisation points the other way.',
  },
  {
    id: 'm04-rp-k5', type: 'classify', kind: 'applied',
    prompt: 'The director of a fictional theatre is planning next season. Classify each statement from her notes.',
    items: [
      'Should we move the Thursday matinee to Saturday morning next season?',
      'How many of our regular audience could come on a Saturday morning, and which of them?',
      'Estimate, to within ±5 points, the share of last season’s matinee bookers who would book a Saturday-morning show',
      'Find out what stops families with young children from coming to matinees',
    ],
    categories: ['Decision problem', 'Research problem', 'Research objective'],
    answer: [0, 1, 2, 2],
    feedback: {
      1: 'This is what the director needs to know to decide: the research problem. It is not yet specific enough to be an objective.',
      2: 'It names the population, the measure and the precision: a research objective (descriptive).',
      3: 'It states what the study will deliver, the barriers for one audience, so it is an objective (exploratory).',
    },
    solution: 'The choice between the two slots is the decision problem. What the director needs to know, how many regulars could come and who they are, is the research problem. The precise estimate (descriptive) and the barriers for families (exploratory) are research objectives that break the problem into deliverable pieces.',
  },
  {
    id: 'm04-rp-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements.',
    text: 'The client describes the decision, the budget and the timing in a research [[0]]. Research is worth doing only if a result could [[1]], and it is worth at most the [[2]]. Contacting people as if for research in order to sell to them is called [[3]].',
    blanks: [
      { options: ['brief', 'proposal', 'report'], answer: 0 },
      { options: ['change the decision', 'confirm what the client believes', 'reach a large sample'], answer: 0 },
      { options: ['expected value of perfect information', 'cost of the fieldwork', 'expected value of the best option'], answer: 0 },
      { options: ['sugging', 'sampling', 'screening'], answer: 0 },
    ],
    solution: 'The client writes the brief; the researcher answers with a proposal. Research adds value only through a decision it could change, and never more than the expected value of perfect information. Selling under the guise of research is sugging, which the codes forbid.',
  },
];
