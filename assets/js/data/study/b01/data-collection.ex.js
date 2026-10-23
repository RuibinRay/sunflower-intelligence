// data-collection.ex.js — B01 · Collecting data: sources, samples and bias: widgets, practice and the knowledge check.
// Answer keys live here. Every business and number is fictional unless it comes from case.js; every number is recomputed by `check`.

const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const signed = (x) => `${x > 0.05 ? '+' : x < -0.05 ? '−' : ''}${f1(Math.abs(x))}`;

export const widgets = {
  'dc-bias': {
    type: 'formula',
    title: 'Bias doesn’t shrink with sample size',
    intro: 'Customers are subscribers or one-off buyers, who differ in how satisfied they are. The survey reaches a different mix of the two from the population’s.',
    inputs: [
      { id: 'popSub', label: 'Subscribers in the population', min: 5, max: 95, step: 5, value: 30, fmt: 'pct' },
      { id: 'sampleSub', label: 'Subscribers in the sample', min: 5, max: 95, step: 5, value: 70, fmt: 'pct' },
      { id: 'pSub', label: 'Subscribers who are satisfied', min: 0, max: 100, step: 1, value: 90, fmt: 'pct' },
      { id: 'pOne', label: 'One-off buyers who are satisfied', min: 0, max: 100, step: 1, value: 60, fmt: 'pct' },
      { id: 'n', label: 'Sample size', min: 20, max: 5000, step: 10, value: 30, fmt: 'int', unit: 'people' },
    ],
    compute: (v) => {
      const truth = (v.popSub / 100) * v.pSub + (1 - v.popSub / 100) * v.pOne;
      const est = (v.sampleSub / 100) * v.pSub + (1 - v.sampleSub / 100) * v.pOne;
      const bias = est - truth;
      const p = est / 100;
      const moe = 2 * Math.sqrt(Math.max(p * (1 - p), 0) / v.n) * 100;
      const lo = Math.max(0, est - moe), hi = Math.min(100, est + moe);
      const covers = truth >= lo - 1e-9 && truth <= hi + 1e-9;
      const r1 = (x) => Math.round(x * 10) / 10;
      return {
        headline: { label: 'Expected survey result', value: `${f1(est)}% satisfied` },
        rows: [
          ['True share satisfied in the population', `${f1(truth)}%`],
          ['Bias: expected result minus the truth', `${signed(bias)} points`],
          ['Range that chance alone typically allows at this size', `${f1(lo)}% to ${f1(hi)}%`],
          ['Does that range include the truth?', covers ? 'Yes' : 'No'],
        ],
        note: Math.abs(bias) < 0.05
          ? 'The sample’s mix matches the population’s (or both groups are equally satisfied), so the only error left is chance, and it shrinks as the sample grows.'
          : `The sample ${v.sampleSub > v.popSub ? 'over' : 'under'}-represents subscribers, so its expected result is ${f1(Math.abs(bias))} points too ${bias > 0 ? 'high' : 'low'} at any sample size. ${covers ? 'At this size chance is still large enough to hide the bias; raise the sample size and watch it appear.' : 'At this size the chance range no longer reaches the truth: more respondents have made the wrong answer look more certain, not more correct.'}`,
        chart: { kind: 'bar', x: { label: 'Figure', values: ['True share', 'Expected result', 'Lowest likely', 'Highest likely'] }, series: [{ name: 'Satisfied (%)', values: [r1(truth), r1(est), r1(lo), r1(hi)] }], y: { label: 'Satisfied (%)', format: 'pct' } },
      };
    },
  },
  'dc-nonresponse': {
    type: 'formula',
    title: 'How far could non-response move a survey result?',
    intro: 'Everyone invited either replied or didn’t. The respondents’ answer is known; the non-respondents’ is not.',
    inputs: [
      { id: 'N', label: 'People invited', min: 50, max: 2000, step: 10, value: 400, fmt: 'int' },
      { id: 'r', label: 'Responses', min: 10, max: 1000, step: 1, value: 120, fmt: 'int' },
      { id: 'pr', label: 'Respondents giving the answer (for example, satisfied)', min: 0, max: 100, step: 1, value: 75, fmt: 'pct' },
      { id: 'pn', label: 'Your guess: non-respondents giving the answer', min: 0, max: 100, step: 1, value: 60, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.r > v.N) return { error: 'There are more responses than people invited: raise the number invited or lower the responses.' };
      const rate = v.r / v.N * 100;
      const y = v.r * v.pr / 100;
      const lowest = y / v.N * 100, highest = (y + v.N - v.r) / v.N * 100;
      const combined = (v.r * v.pr + (v.N - v.r) * v.pn) / v.N;
      const gap = v.pr - combined;
      const r1 = (x) => Math.round(x * 10) / 10;
      return {
        headline: { label: 'Possible share among everyone invited', value: `${f1(lowest)}% to ${f1(highest)}%` },
        rows: [
          ['Response rate', `${f1(rate)}%`],
          ['Share among respondents', `${f1(v.pr)}%`],
          ['Share among everyone invited, if your guess is right', `${f1(combined)}%`],
          ['Error in the respondents’ figure', `${signed(gap)} points`],
        ],
        note: rate >= 90
          ? 'With almost everyone replying, non-respondents can move the result only a little: the range is narrow whatever they think.'
          : `${f1(100 - rate)}% of those invited didn’t reply, so the data alone allows anything from ${f1(lowest)}% to ${f1(highest)}%. ${Math.abs(gap) >= 1 ? `If non-respondents are as you guessed, the respondents’ ${f1(v.pr)}% is ${f1(Math.abs(gap))} points too ${gap > 0 ? 'high' : 'low'}.` : 'If non-respondents answer like respondents, there is no bias; a random follow-up of non-respondents is how you would find out.'}`,
        chart: { kind: 'bar', x: { label: 'Figure', values: ['Respondents', 'Lowest possible', 'Your guess', 'Highest possible'] }, series: [{ name: 'Share giving the answer (%)', values: [r1(v.pr), r1(lowest), r1(combined), r1(highest)] }], y: { label: 'Share (%)', format: 'pct' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-dc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which bias does each situation mainly illustrate?',
    items: [
      'A gym surveys members about its classes with a form at the front desk. People who stopped coming months ago never see it.',
      'A restaurant e-mails a survey to all 2,000 diners on its list; 140 reply, mostly people who had a very good or a very bad meal.',
      'A bank’s survey asks: “Don’t you agree that our new app is easier to use?”',
      'A city council runs an online-only poll about bus routes, so residents without internet access can’t take part.',
      'A clinic’s scales read 2 kg too heavy for every patient.',
      'An analyst studies the strategies of investment funds that are still open today to learn what makes funds succeed.',
    ],
    categories: ['Sampling bias', 'Non-response bias', 'Survivorship bias', 'Measurement bias'],
    answer: [2, 1, 3, 0, 3, 2],
    hints: [
      'Ask where people or values go missing or get distorted: before anyone is chosen, when they decline to answer, because they had already dropped out, or in the measuring itself.',
      'Survivorship is about who had already left the group before anyone looked; non-response is about who declines once asked.',
    ],
    feedback: {
      0: 'Former members had already dropped out before the survey began, so only the “survivors” can answer: survivorship bias.',
      1: 'Everyone was invited, but those with strong experiences were more likely to reply: non-response bias.',
      3: 'The way people are reached leaves part of the population out before anyone is chosen: sampling bias.',
      5: 'Funds that failed have closed and vanished from the data: survivorship bias.',
    },
    solution: 'Gym and funds: survivorship (those who dropped out are invisible). Restaurant: non-response (those who replied differ from those who didn’t). Council poll: sampling (the method leaves part of the population out). The bank’s leading question and the faulty scales: measurement (the act of measuring pushes values one way).',
  },
  {
    id: 'b01-dc-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery e-mails a survey to 600 customers. 40 of the e-mails bounce because the addresses no longer work, and 168 customers reply. Counting only the people who actually received the survey, what is the response rate? One decimal place.',
    answer: 30, check: () => 168 / (600 - 40) * 100, unit: '%', places: 1, tol: 0.05,
    hints: [
      'Who could have answered? Remove the e-mails that never arrived from the denominator.',
      'The denominator is 600 − 40 = 560.',
    ],
    wrong: [
      { value: 28, say: 'That divides by all 600 e-mails sent. The question counts only the 560 people who received the survey; whichever denominator you use, say which.' },
      { value: 42.9, say: 'That divides responses by non-responses (392). A response rate divides responses by everyone who could have responded.' },
    ],
    solution: 'Received: 600 − 40 = 560. Response rate = 168 ÷ 560 × 100 = 30.0%. Dividing by all 600 sent gives 28.0%; both are used in practice, so a report should say which denominator it uses.',
  },
  {
    id: 'b01-dc-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional gym e-mails 500 members to ask whether they will renew. 150 reply, and 120 of them say yes. Work out what the survey can and can’t tell the gym.',
    solution: 'Respondents: 120 ÷ 150 = 80% say yes. All members: at least 120 ÷ 500 = 24% (if no non-respondent renews) and at most (120 + 350) ÷ 500 = 94% (if all 350 do). Without knowing more about the 350 who didn’t reply, the honest range is 24% to 94%.',
    steps: [
      { id: 'b01-dc-g3-s1', type: 'num',
        prompt: 'What percentage of respondents say they will renew?',
        answer: 80, check: () => 120 / 150 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['Divide the yes answers by the number who replied.'],
        wrong: [{ value: 24, say: 'That divides by all 500 members. The question asks about respondents only: 120 ÷ 150.' }, { value: 30, say: 'That is the response rate, 150 ÷ 500.' }] },
      { id: 'b01-dc-g3-s2', type: 'num',
        prompt: 'What is the lowest possible percentage of all 500 members who will renew, if no non-respondent does?',
        answer: 24, check: () => 120 / 500 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['Only the 120 known yeses count; divide them by everyone invited.'],
        wrong: [{ value: 80, say: 'That is the respondents’ share. If none of the 350 non-respondents renews, the yeses are 120 out of 500.' }, { value: 30, say: 'That is the response rate.' }] },
      { id: 'b01-dc-g3-s3', type: 'num',
        prompt: 'And the highest possible percentage, if every non-respondent renews?',
        answer: 94, check: () => (120 + (500 - 150)) / 500 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['Add every non-respondent to the 120 yeses.', 'Non-respondents: 500 − 150 = 350.'],
        wrong: [{ value: 70, say: 'That is the share who didn’t reply (350 ÷ 500). Add them to the 120 yeses: (120 + 350) ÷ 500.' }, { value: 100, say: 'The 30 respondents who said no are known noes, so the share can’t reach 100%.' }] },
    ],
  },
  {
    id: 'b01-dc-g4', type: 'mc', kind: 'applied',
    prompt: 'A delivery company (fictional) asks customers: “How satisfied were you with the speed and friendliness of our delivery?” What is the best fix?',
    options: [
      'Ask two questions, one about speed and one about friendliness',
      'Add “very” to each answer option',
      'Ask it only of customers who complained',
      'Turn it into a statement to agree or disagree with: “Our delivery was fast and friendly”',
    ],
    answer: 0,
    hints: ['How should a customer answer if the delivery was fast but the driver was rude?', 'The question asks about two things at once.'],
    feedback: {
      1: 'The answer options aren’t the problem; the question asks about two things at once.',
      2: 'That would add sampling bias without fixing the question.',
      3: 'It still asks about two things, and agree/disagree statements invite agreement.',
    },
    solution: 'The question is double-barrelled: a customer with a fast delivery and a rude driver can’t answer it honestly, and nobody can tell which part an answer refers to. Split it into two questions, each on a balanced scale.',
  },
];

export const independent = [
  {
    id: 'b01-dc-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s question is: “Did the new website checkout put people off buying in September?” Which group is the population this question is about?',
    options: [
      'Everyone who started a checkout on the website in September, whether or not they finished it',
      `The 240 customers who ordered in September`,
      'The 79 customers who answered the survey',
      'Everyone who visited the shop in September, through the website or the app',
    ],
    answer: 0,
    feedback: {
      1: 'Those are the people who got through the checkout. The question is mostly about the people who didn’t.',
      2: 'Those are the respondents, a subset of the buyers, who are themselves the wrong group.',
      3: 'App visitors never met the new website checkout, so they are outside the question, although their behaviour is a useful comparison.',
    },
    solution: 'Define the population from the question: the people who could have been put off are those who reached the website’s checkout in September. Buyers and survey respondents are the survivors of that checkout, so a survey of them can’t reach the people the question is most about.',
  },
  {
    id: 'b01-dc-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each source of data Lantern could use.',
    items: [
      'Randomly showing half of website visitors a new product page and comparing orders',
      'Every order placed and paid for in the shop',
      'Average household spending on coffee, from a government statistics office',
      'A questionnaire asking why customers chose Lantern',
      'The number of sessions in which someone opened the payment page',
      'Watching five customers try to pay on their phones and noting where they hesitate',
    ],
    categories: ['Transactional data', 'Web and app data', 'Survey', 'Experiment', 'Observation', 'Third-party or public data'],
    answer: [3, 0, 5, 2, 1, 4],
    feedback: {
      0: 'Random assignment to versions makes it an experiment (an A/B test).',
      4: 'Sessions are logged automatically by the analytics tool as people use the site: web data.',
    },
    solution: 'Product-page split: experiment. Orders: transactional. Household spending: public data from a third party. Questionnaire: survey. Payment-page sessions: web data. Watching customers: observation.',
  },
  {
    id: 'b01-dc-i3', type: 'multi', kind: 'applied',
    prompt: 'Which steps would help Ana reduce or detect non-response bias in her next customer survey? Select all that apply.',
    options: [
      'Send one reminder to customers who haven’t replied after a few days',
      'Phone a random sample of non-respondents and ask them the key question',
      'Keep the survey short, so that busy customers finish it',
      'Compare respondents with non-respondents on what the order records already show, such as channel and order value',
      'Send the survey to more customers from the same list, without changing anything else',
      'Analyse only the customers who answered every question',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'More invitations by the same route bring more of the same kind of respondent: the result gets more precise, not less biased.',
      5: 'Dropping partial answers removes more people, and those who give up part-way may differ too.',
    },
    solution: 'Reminders, a short survey and a random follow-up of non-respondents all reduce the gap between those who answer and those who don’t; comparing the two groups on known facts (channel, order value) shows whether a gap remains. Inviting more people the same way, or dropping partial answers, does neither.',
  },
  {
    id: 'b01-dc-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional software company surveys 1,000 users. 250 reply, and 80% of them are satisfied. A follow-up call to a random sample of non-respondents finds 52% satisfied. Weighting each group by its size, what is the best estimate of the share of all 1,000 users who are satisfied?',
    answer: 59, check: () => (250 * 0.80 + 750 * 0.52) / 1000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 80, say: 'That is the respondents’ figure alone. The 750 non-respondents, who are less satisfied, also count.' },
      { value: 66, say: 'That averages 80% and 52% as if the groups were the same size. There are three non-respondents for every respondent.' },
      { value: 20, say: 'That is the lowest possible share (200 ÷ 1,000), assuming no non-respondent is satisfied. The follow-up tells you that 52% are.' },
    ],
    solution: 'Respondents: 250 × 0.80 = 200 satisfied. Non-respondents: 750 × 0.52 = 390. Estimate = (200 + 390) ÷ 1,000 = 59.0%. Reporting the respondents’ 80% would overstate satisfaction by 21 percentage points.',
  },
  {
    id: 'b01-dc-i5', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of an A/B test in order.',
    items: [
      'Decide the outcome to compare (for example, orders ÷ visits) and how long the test will run',
      'Randomly assign each visitor to the existing version (A) or the new one (B)',
      'Run the test for the whole planned period without changing anything else for either group',
      'When the test ends, check that the two groups are similar in size and make-up',
      'Compare the outcome between the groups and test whether the difference could be chance',
      'Decide whether to switch, and keep measuring after the change',
    ],
    solution: 'Plan the outcome and the length first, so that the result can’t steer the rules. Then assign at random, run for the full period, check that randomisation produced similar groups, compare (with a test for chance), and decide, continuing to measure afterwards.',
  },
  {
    id: 'b01-dc-i6', type: 'mc', kind: 'applied',
    prompt: 'Lantern wants 200 customers for a taste panel and has a list of all 2,400 of its customers (fictional). Which method gives a simple random sample?',
    options: [
      'Number the 2,400 customers on the list and let a random-number generator pick 200',
      'Invite the 200 customers who ordered most recently',
      'Ask the first 200 customers who come into the café on Saturday',
      'Post a link on social media and take the first 200 replies',
    ],
    answer: 0,
    feedback: {
      1: 'Recent customers differ from the rest (newer, perhaps more active), and they were chosen by date, not by chance.',
      2: 'A convenience sample: Saturday café visitors are not typical of online customers.',
      3: 'A self-selected convenience sample: followers who reply first are the most engaged customers.',
    },
    solution: 'Only the random draw from the full list gives every group of 200 customers the same chance of selection. The other three choose people by recency, by convenience or by their own decision to reply, and each tilts the sample towards a particular kind of customer.',
  },
];

export const check = [
  {
    id: 'b01-dc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional subscription-box company studies customers who have stayed for at least two years and finds that most chose the largest box when they signed up. It concludes that offering the largest box keeps customers. What is the main flaw?',
    options: [
      'Survivorship bias: customers who chose the largest box and then cancelled aren’t in the data, so it can’t show whether that box keeps people',
      'The sample is too small to draw any conclusion',
      'Measurement bias in how box sizes were recorded',
      'Non-response bias, because some customers didn’t answer a survey',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing in the story suggests a small sample; even a huge sample of survivors would have the same flaw.',
      2: 'Box size is recorded at sign-up and there is no sign it was mis-measured.',
      3: 'No survey was involved; the data comes from the customer records.',
    },
    solution: 'Only customers who stayed are studied. If most customers choose the largest box, most stayers will too, whether or not it keeps anyone. The company needs to compare how long customers stayed across all box sizes, including those who left.',
  },
  {
    id: 'b01-dc-k2', type: 'num', kind: 'numerical',
    prompt: 'Northfield University (fictional) invites 3,200 students to complete a survey, and 1,040 respond. What is the response rate? One decimal place.',
    answer: 32.5, check: () => 1040 / 3200 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 67.5, say: 'That is the share who didn’t respond.' },
      { value: 307.7, say: 'That divides the invitations by the responses. Divide responses by invitations.' },
    ],
    solution: 'Response rate = responses ÷ invited × 100 = 1,040 ÷ 3,200 × 100 = 32.5%.',
  },
  {
    id: 'b01-dc-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel e-mails 800 guests; 200 reply, and 150 of them say they would stay again. What is the lowest possible percentage of all 800 guests who would stay again? One decimal place.',
    answer: 18.75, check: () => 150 / 800 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 75, say: 'That is the respondents’ share. The lowest possible figure assumes no non-respondent would return: 150 ÷ 800.' },
      { value: 25, say: 'That is the response rate, 200 ÷ 800.' },
      { value: 93.75, say: 'That is the highest possible share, (150 + 600) ÷ 800.' },
    ],
    solution: 'If none of the 600 non-respondents would return, the share is 150 ÷ 800 = 18.75%, about 18.8%. The highest possible is (150 + 600) ÷ 800 = 93.75%. The respondents’ 75% sits in a very wide range.',
  },
  {
    id: 'b01-dc-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s October survey asked every respondent, including customers who had ordered only through the app, whether “the new checkout was easy to use”. Only the website’s checkout had changed. What is the best way to fix this in the next survey?',
    options: [
      'Ask first how the customer ordered, and show the checkout question only to those who used the website',
      'Send the survey to more app customers so that both channels are well represented',
      'Keep asking everyone the same statement, but add a “don’t know” option',
      'Keep the survey unchanged and delete the app customers’ answers afterwards',
    ],
    answer: 0,
    feedback: {
      1: 'More app customers would add more answers about a checkout they never used.',
      2: 'A “don’t know” option helps, but app buyers would still be asked about something they never saw, and the agree/disagree statement would still invite agreement.',
      3: 'That rescues some of the data afterwards, but only if channel is recorded, and it leaves the agree/disagree statement unfixed.',
    },
    solution: 'A filter question routes each respondent to questions they can answer: only website users see the checkout question. Rewriting it as a balanced question (“How easy or difficult was it to pay on our website?”) removes the second source of measurement bias.',
  },
  {
    id: 'b01-dc-k5', type: 'multi', kind: 'conceptual',
    prompt: 'According to the guidance of the UK regulator, the Information Commissioner’s Office, which statements about the UK GDPR are correct? Select all that apply.',
    options: [
      'Consent must be shown by a clear positive action; a pre-ticked box doesn’t count',
      'People can withdraw their consent at any time',
      'Replacing customers’ names with customer numbers means the data is no longer personal data',
      'Consent is one of several lawful bases for handling personal data, and no single basis is better than the others',
      'An e-mail address that identifies a customer is personal data',
      'If a customer doesn’t object, the business may treat their silence as consent',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'Pseudonymised data is still personal data: the people can be identified with the information that links the codes back to them.',
      5: 'Silence, inactivity and pre-ticked boxes don’t count as consent.',
    },
    solution: 'Consent must be freely given, specific, informed and unambiguous, by a clear positive action, and can be withdrawn at any time; it is one of several lawful bases, none of which ranks above the others. Information that identifies a person directly or indirectly, such as an e-mail address, is personal data, and pseudonymised data remains personal data.',
  },
  {
    id: 'b01-dc-k6', type: 'classify', kind: 'applied',
    prompt: 'Lantern is choosing customers for a follow-up survey. Classify each method.',
    items: [
      'Drawing 100 order numbers at random from all of last month’s orders',
      'Asking customers at the café counter on a Monday morning',
      'Using the first 100 replies to a link posted on social media',
      'Taking every 20th customer on the list, starting from a randomly chosen position',
      'Picking customers at random within each region, in proportion to the region’s size',
    ],
    categories: ['Random sample', 'Convenience or self-selected sample'],
    answer: [0, 1, 1, 0, 0],
    feedback: {
      3: 'This is a systematic sample: with a random start and no pattern in the list, every customer has the same chance of selection.',
      4: 'This is a stratified random sample: random within each region.',
    },
    solution: 'Random draws, systematic samples from a random start and stratified random samples all let chance, not convenience, decide who is chosen. The café counter and the social-media link take whoever is easiest to reach or chooses to reply.',
  },
];
